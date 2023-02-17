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
  DefaultProps
} from '@deck.gl/core';
import {BitmapLayer} from '@deck.gl/layers';
import type {ImageSourceMetadata, ImageType, ImageServiceType} from '@loaders.gl/wms';
import {ImageSource, createImageSource} from '@loaders.gl/wms';

export type ImageryLayerProps = CompositeLayerProps<string | ImageSource> & {
  serviceType?: ImageServiceType | 'auto';
  layers: string[];
  onMetadataLoadStart: () => void;
  onMetadataLoadComplete: (metadata: ImageSourceMetadata) => void;
  onMetadataLoadError: (error: Error) => void;
  onImageLoadStart: (requestId: unknown) => void;
  onImageLoadComplete: (requestId: unknown) => void;
  onImageLoadError: (requestId: unknown, error: Error) => void;
};

const defaultProps: ImageryLayerProps = {
  id: 'imagery-layer',
  data: undefined!,
  serviceType: 'auto',
  layers: undefined!,
  onMetadataLoadStart: () => {},
  onMetadataLoadComplete: () => {},
  // eslint-disable-next-line
  onMetadataLoadError: (error: Error) => console.error(error),
  onImageLoadStart: () => {},
  onImageLoadComplete: () => {},
  // eslint-disable-next-line
  onImageLoadError: (requestId: unknown, error: Error) => console.error(error, requestId)
};

/**
 * The layer is used in Hex Tile layer in order to properly discard invisible elements during animation
 */
export class ImageryLayer extends CompositeLayer<ImageryLayerProps> {
  static layerName = 'ImageryLayer';
  static defaultProps: DefaultProps<ImageryLayerProps> = defaultProps;

  state!: {
    imageSource: ImageSource;
    image: ImageType;
    metadata: ImageSourceMetadata;
    bounds: [number, number, number, number];
    width: number;
    height: number;
  };

  /** Lets deck.gl know that we want viewport change events */
  override shouldUpdateState(): boolean {
    return true;
  }

  override initializeState(): void {
    // intentionally empty, initialization is done in updateState
  }

  override updateState({changeFlags, props, oldProps}: UpdateParameters<this>): void {
    if (changeFlags.propsChanged) {
      const dataChanged =
        changeFlags.dataChanged ||
        props.serviceType !== oldProps.serviceType ||
        (changeFlags.updateTriggersChanged &&
          (changeFlags.updateTriggersChanged.all || changeFlags.updateTriggersChanged));

      // Check if data source has changed
      if (dataChanged) {
        this.state.imageSource = this._createImageSource(this.props);
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this._loadMetadata();
        this.debounce(() => this.loadImage('image source changed'), 0);
      }

      // Some sublayer props may have changed
    }

    if (changeFlags.viewportChanged) {
      this.debounce(() => this.loadImage('viewport changed'));
    }
  }

  override finalizeState(): void {
    // TODO - we could cancel outstanding requests
  }

  override renderLayers(): Layer {
    // TODO - which bitmap layer is rendered should depend on the current viewport
    // Currently Studio only uses one viewport
    const {bounds, image} = this.state;

    return (
      image &&
      new BitmapLayer({
        ...this.getSubLayerProps({id: 'bitmap'}),
        bounds,
        image
      })
    );
  }

  async getFeatureInfoText(x: number, y: number): Promise<string | null> {
    const {viewport} = this.context;
    if (viewport) {
      const bounds = viewport.getBounds();
      const {width, height} = viewport;
      // @ts-expect-error Undocumented method
      const featureInfo = await this.state.imageSource.getFeatureInfoText?.({
        layers: this.props.layers,
        // todo image width may get out of sync with viewport width
        width,
        height,
        bbox: bounds,
        query_layers: this.props.layers,
        x,
        y,
        info_format: 'application/vnd.ogc.gml'
      });
      return featureInfo;
    }
    return '';
  }

  _createImageSource(props: ImageryLayerProps): ImageSource {
    if (props.data instanceof ImageSource) {
      return props.data;
    }

    if (typeof props.data === 'string') {
      return createImageSource({
        url: props.data,
        loadOptions: props.loadOptions,
        type: props.serviceType
      });
    }

    throw new Error('invalid image source in props.data');
  }

  /** Run a getMetadata on the image service */
  async _loadMetadata(): Promise<void> {
    this.props.onMetadataLoadStart();
    try {
      this.state.metadata = await this.state.imageSource.getMetadata();
      // technically we should get the latest layer after an async operation in case props have changed
      // Although the response might no longer be expected
      this.getCurrentLayer()?.props.onMetadataLoadComplete(this.state.metadata);
    } catch (error) {
      this.getCurrentLayer()?.props.onMetadataLoadError(error as Error);
    }
  }

  /** Load an image */
  async loadImage(reason: string): Promise<void> {
    // TODO - need to handle multiple viewports
    const {viewport} = this.context;
    if (!viewport) {
      return;
    }
    const bounds = viewport.getBounds();
    const {width, height} = viewport;

    const requestId = this.getRequestId();

    try {
      this.props.onImageLoadStart(requestId);
      const image = await this.state.imageSource.getImage({
        width,
        height,
        bbox: bounds,
        layers: this.props.layers
      });
      Object.assign(this.state, {image, bounds, width, height});
      this.getCurrentLayer()?.props.onImageLoadComplete(requestId);
      this.setNeedsRedraw();
    } catch (error) {
      this.context.onError?.(error as Error, this);
      this.getCurrentLayer()?.props.onImageLoadError(requestId, error as Error);
    }
  }

  // HELPERS

  private _nextRequestId: number = 0;
  private _timeoutId: number | null = null;

  /** Global counter for issuing unique request ids */
  getRequestId() {
    return this._nextRequestId++;
  }

  /** Runs an action in the future, cancels it if the new action is issued before it executes */
  debounce(fn: Function, ms = 500): void {
    if (typeof this._timeoutId === 'number') {
      clearTimeout(this._timeoutId);
    }
    this._timeoutId = setTimeout(() => fn(), ms);
  }
}
