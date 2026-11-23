// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// deck.gl, MIT license
// Attributions:
// Copyright 2022 Foursquare Labs, Inc.

/* eslint-disable camelcase */ // Some WMS parameters are not in camel case
/* global setTimeout, clearTimeout */

import {
  Layer,
  CompositeLayer,
  CompositeLayerProps,
  UpdateParameters,
  DefaultProps,
  Viewport,
  _CustomProjectionViewport as CustomProjectionViewport,
  log,
  _deepEqual as deepEqual
} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import type {
  GetImageParameters,
  ImageSourceMetadata,
  ImageType
} from '@loaders.gl/core/loader-utils';
import {createDataSourceSync} from '@loaders.gl/core';
import {ImageSource, WMSSource} from '@loaders.gl/ogc/wms';
import {getProjectedViewportBounds, WGS84ToPseudoMercator} from './utils';

/** All props supported by WMSLayer. */
export type WMSLayerProps = CompositeLayerProps & _WMSLayerProps;

/** Props added by WMSLayer. */
type _WMSLayerProps = {
  data: string | ImageSource;
  serviceType?: 'wms' | 'auto';
  layers?: string[];
  /**
   * CRS to request from the image service. A matching custom view CRS uses native bounds.
   * For a custom view defined without a CRS identifier, set this to the server's identifier
   * for the view CRS to request native bounds. In a custom view, EPSG:4326 uses approximate
   * placement and an explicit EPSG:3857 falls back to EPSG:4326 with a warning.
   * `'auto'` uses the custom view's CRS identifier when available, EPSG:3857 in MapView,
   * and EPSG:4326 otherwise.
   * @default 'auto'
   */
  srs?: 'EPSG:4326' | 'EPSG:3857' | 'auto' | (string & {});
  onMetadataLoad?: (metadata: ImageSourceMetadata) => void;
  onMetadataLoadError?: (error: Error) => void;
  onImageLoadStart?: (requestId: unknown) => void;
  onImageLoad?: (requestId: unknown) => void;
  onImageLoadError?: (requestId: unknown, error: Error) => void;
};

const defaultProps: DefaultProps<WMSLayerProps> = {
  id: 'imagery-layer',
  data: '',
  serviceType: 'auto',
  srs: 'auto',
  layers: {type: 'array', compare: true, value: []},
  onMetadataLoad: {type: 'function', value: () => {}},
  // eslint-disable-next-line
  onMetadataLoadError: {type: 'function', value: console.error},
  onImageLoadStart: {type: 'function', value: () => {}},
  onImageLoad: {type: 'function', value: () => {}},
  onImageLoadError: {
    type: 'function',
    compare: false,
    // eslint-disable-next-line
    value: (requestId: unknown, error: Error) => console.error(error, requestId)
  }
};

/** Requests and displays a map image for the current viewport. */
export class WMSLayer<ExtraPropsT extends {} = {}> extends CompositeLayer<
  ExtraPropsT & Required<_WMSLayerProps>
> {
  static layerName = 'WMSLayer';
  static defaultProps: DefaultProps = defaultProps;

  state!: {
    imageSource: ImageSource;
    image: ImageType;
    bounds: [number, number, number, number];
    /** Source CRS signature when the image bounds are in native projection units. */
    boundsCoordinateSystem?: string;
    /** The parameters of the request that produced `image`. */
    lastRequestParameters: GetImageParameters;
    lastRequestId: number;
    _nextRequestId: number;
    /** TODO: Change any => setTimeout return type. Different between Node and browser... */
    _timeoutId: any;
    loadCounter: number;
    /** Whether a custom view CRS mismatch has already been reported by this layer. */
    srsMismatchWarned?: boolean;
  };

  /** Returns true if all async resources are loaded */
  get isLoaded(): boolean {
    // Track the explicit loading done by this layer
    return this.state?.loadCounter === 0 && super.isLoaded;
  }

  /** Lets deck.gl know that we want viewport change events */
  override shouldUpdateState(): boolean {
    return true;
  }

  override initializeState(): void {
    // intentionally empty, initialization is done in updateState
    this.state._nextRequestId = 0;
    this.state.lastRequestId = -1;
    this.state.loadCounter = 0;
  }

  override updateState({changeFlags, props, oldProps}: UpdateParameters<this>): void {
    const {viewport} = this.context;

    // Check if data source has changed
    if (changeFlags.dataChanged || props.serviceType !== oldProps.serviceType) {
      this.state.imageSource = this._createImageSource(props);
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._loadMetadata();
      this.debounce(() => this.loadImage(viewport, 'image source changed'), 0);
    } else if (!deepEqual(props.layers, oldProps.layers, 1)) {
      this.debounce(() => this.loadImage(viewport, 'layers changed'), 0);
    } else if (props.srs !== oldProps.srs && viewport instanceof CustomProjectionViewport) {
      this.debounce(() => this.loadImage(viewport, 'srs changed'), 0);
    } else if (changeFlags.viewportChanged) {
      this.debounce(() => this.loadImage(viewport, 'viewport changed'));
    }
  }

  override finalizeState(): void {
    // TODO - we could cancel outstanding requests
  }

  override renderLayers(): Layer {
    // TODO - which bitmap layer is rendered should depend on the current viewport
    // Currently Studio only uses one viewport
    const {bounds, image, lastRequestParameters, boundsCoordinateSystem} = this.state;

    return (
      image &&
      new BitmapLayer({
        ...this.getSubLayerProps({id: 'bitmap'}),
        ...(boundsCoordinateSystem && {coordinateSystem: boundsCoordinateSystem}),
        _imageCoordinateSystem: boundsCoordinateSystem
          ? 'default'
          : lastRequestParameters.crs === 'EPSG:4326'
            ? 'lnglat'
            : 'cartesian',
        bounds,
        image
      })
    );
  }

  async getFeatureInfoText(x: number, y: number): Promise<string | null> {
    const {lastRequestParameters} = this.state;
    if (lastRequestParameters) {
      // @ts-expect-error Undocumented method
      const featureInfo = await this.state.imageSource.getFeatureInfoText?.({
        ...lastRequestParameters,
        query_layers: lastRequestParameters.layers,
        x,
        y,
        info_format: 'application/vnd.ogc.gml'
      });
      return featureInfo;
    }
    return '';
  }

  _createImageSource(props: WMSLayerProps): ImageSource {
    if (props.data instanceof ImageSource) {
      return props.data;
    }

    if (typeof props.data === 'string') {
      return createDataSourceSync(props.data, [WMSSource], {
        ...props.loadOptions,
        core: {
          ...props.loadOptions?.core,
          type: props.serviceType
        }
      });
    }

    throw new Error('invalid image source in props.data');
  }

  /** Run a getMetadata on the image service */
  async _loadMetadata(): Promise<void> {
    const {imageSource} = this.state;
    try {
      this.state.loadCounter++;
      const metadata = await imageSource.getMetadata();

      // If a request takes a long time, it may no longer be expected
      if (this.state.imageSource === imageSource) {
        this.getCurrentLayer()?.props.onMetadataLoad(metadata);
      }
    } catch (error) {
      this.getCurrentLayer()?.props.onMetadataLoadError(error as Error);
    } finally {
      this.state.loadCounter--;
    }
  }

  /** Load an image */
  async loadImage(viewport: Viewport, reason: string): Promise<void> {
    const {layers, serviceType} = this.props;

    // TODO - move to ImageSource?
    if (serviceType === 'wms' && layers.length === 0) {
      return;
    }

    let {width, height} = viewport;
    const {srs, native} = this.getRequestSrs(viewport);
    const nativeViewport = native && viewport instanceof CustomProjectionViewport ? viewport : null;
    let bounds: [number, number, number, number];
    if (nativeViewport) {
      const projectedBounds = getProjectedViewportBounds(nativeViewport);
      if (!projectedBounds) return;
      bounds = projectedBounds.bounds;
      const {unclampedBounds} = projectedBounds;
      // Preserve the requested pixel density when the CRS clips the visible ground bounds.
      const widthFraction = (bounds[2] - bounds[0]) / (unclampedBounds[2] - unclampedBounds[0]);
      const heightFraction = (bounds[3] - bounds[1]) / (unclampedBounds[3] - unclampedBounds[1]);
      width = Math.max(1, Math.round(width * widthFraction));
      height = Math.max(1, Math.round(height * heightFraction));
    } else {
      bounds = viewport.getBounds();
    }

    const requestId = this.getRequestId();
    const requestParams: GetImageParameters = {
      width,
      height,
      boundingBox: [
        [bounds[0], bounds[1]],
        [bounds[2], bounds[3]]
      ],
      layers,
      crs: srs
    };
    if (!nativeViewport && srs === 'EPSG:3857') {
      const min = WGS84ToPseudoMercator([bounds[0], bounds[1]]);
      const max = WGS84ToPseudoMercator([bounds[2], bounds[3]]);
      requestParams.boundingBox = [min, max];
    }

    try {
      this.state.loadCounter++;
      this.props.onImageLoadStart(requestId);

      const image = await this.state.imageSource.getImage(requestParams);

      // If a request takes a long time, later requests may have already loaded.
      if (this.state.lastRequestId < requestId) {
        this.getCurrentLayer()?.props.onImageLoad(requestId);
        // Not type safe...
        this.setState({
          image,
          bounds,
          boundsCoordinateSystem: nativeViewport?.crs.signature,
          lastRequestParameters: requestParams,
          lastRequestId: requestId
        });
      }
    } catch (error) {
      this.raiseError(error as Error, 'Load image');
      this.getCurrentLayer()?.props.onImageLoadError(requestId, error as Error);
    } finally {
      this.state.loadCounter--;
    }
  }

  // HELPERS

  /** Select the request CRS and whether the request uses native custom view bounds. */
  private getRequestSrs(viewport: Viewport): {srs: string; native: boolean} {
    const {srs} = this.props;
    if (viewport instanceof CustomProjectionViewport) {
      const {signature} = viewport.crs;
      // math.gl preserves a supplied identifier in the signature under default conventions.
      const hasIdentifier = /^[\w.-]+:[\w.-]+$/.test(signature);
      if (srs === 'auto') {
        return hasIdentifier ? {srs: signature, native: true} : {srs: 'EPSG:4326', native: false};
      }
      if (srs === 'EPSG:4326') {
        return {srs, native: false};
      }
      if (srs !== 'EPSG:3857' && (!hasIdentifier || srs === signature)) {
        return {srs, native: true};
      }
      if (!this.state.srsMismatchWarned) {
        this.state.srsMismatchWarned = true;
        log.warn(`WMSLayer: srs ${srs} differs from the view CRS. Using EPSG:4326.`)();
      }
      return {srs: 'EPSG:4326', native: false};
    }
    if (srs === 'auto') {
      return {
        srs: viewport.crs?.signature === 'OSMTile512' ? 'EPSG:3857' : 'EPSG:4326',
        native: false
      };
    }
    return {srs, native: false};
  }

  /** Global counter for issuing unique request ids */
  private getRequestId(): number {
    return this.state._nextRequestId++;
  }

  /** Runs an action in the future, cancels it if the new action is issued before it executes */
  private debounce(fn: Function, ms = 500): void {
    clearTimeout(this.state._timeoutId);
    this.state._timeoutId = setTimeout(() => fn(), ms);
  }
}
