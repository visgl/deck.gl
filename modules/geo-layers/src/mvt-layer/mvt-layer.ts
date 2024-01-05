import {
  Layer,
  LayersList,
  log,
  PickingInfo,
  UpdateParameters,
  GetPickingInfoParams,
  Viewport,
  COORDINATE_SYSTEM,
  DefaultProps
} from '@deck.gl/core';
import {GeoJsonLayer, GeoJsonLayerProps} from '@deck.gl/layers';
import {ClipExtension} from '@deck.gl/extensions';

import {Matrix4} from '@math.gl/core';
import {MVTWorkerLoader} from '@loaders.gl/mvt';
import {binaryToGeojson} from '@loaders.gl/gis';

import type {Loader} from '@loaders.gl/loader-utils';
import type {BinaryFeatures} from '@loaders.gl/schema';
import type {Feature} from 'geojson';

import {transform} from './coordinate-transform';
import findIndexBinary from './find-index-binary';

import TileLayer, {TiledPickingInfo, TileLayerProps} from '../tile-layer/tile-layer';

import type {Tileset2DProps, TileLoadProps, GeoBoundingBox} from '../tileset-2d';
import {
  urlType,
  Tileset2D,
  Tile2DHeader,
  getURLFromTemplate,
  isGeoBoundingBox,
  isURLTemplate
} from '../tileset-2d';

const WORLD_SIZE = 512;

const defaultProps: DefaultProps<MVTLayerProps> = {
  ...GeoJsonLayer.defaultProps,
  data: urlType,
  onDataLoad: {type: 'function', value: null, optional: true, compare: false},
  uniqueIdProperty: '',
  highlightedFeatureId: null,
  loaders: [MVTWorkerLoader],
  binary: true
};

export type TileJson = {
  tilejson: string;
  tiles: string[];
  // eslint-disable-next-line camelcase
  vector_layers: any[];
  attribution?: string;
  scheme?: string;
  maxzoom?: number;
  minzoom?: number;
  version?: string;
};

type ParsedMvtTile = Feature[] | BinaryFeatures;

/** All props supported by the MVTLayer */
export type MVTLayerProps = _MVTLayerProps &
  Omit<GeoJsonLayerProps, 'data'> &
  TileLayerProps<ParsedMvtTile>;

/** Props added by the MVTLayer  */
export type _MVTLayerProps = {
  /** Called if `data` is a TileJSON URL when it is successfully fetched. */
  onDataLoad?: ((tilejson: TileJson | null) => void) | null;

  /** Needed for highlighting a feature split across two or more tiles. */
  uniqueIdProperty?: string;

  /** A feature with ID corresponding to the supplied value will be highlighted. */
  highlightedFeatureId?: string | number | null;

  /**
   * Use tile data in binary format.
   *
   * @default true
   */
  binary?: boolean;

  /**
   * Loaders used to transform tiles into `data` property passed to `renderSubLayers`.
   *
   * @default [MVTWorkerLoader] from `@loaders.gl/mvt`
   */
  loaders?: Loader[];
};

type ContentWGS84Cache = {_contentWGS84?: Feature[]};

/** Render data formatted as [Mapbox Vector Tiles](https://docs.mapbox.com/vector-tiles/specification/). */
export default class MVTLayer<ExtraProps extends {} = {}> extends TileLayer<
  ParsedMvtTile,
  Required<_MVTLayerProps> & ExtraProps
> {
  static layerName = 'MVTLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    super.initializeState();
    // GlobeView doesn't work well with binary data
    const binary = this.context.viewport.resolution !== undefined ? false : this.props.binary;
    this.setState({
      binary,
      data: null,
      tileJSON: null
    });
  }

  get isLoaded(): boolean {
    return this.state && this.state.data && this.state.tileset && super.isLoaded;
  }

  updateState({props, oldProps, context, changeFlags}: UpdateParameters<this>) {
    if (changeFlags.dataChanged) {
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._updateTileData();
    }

    if (this.state?.data) {
      super.updateState({props, oldProps, context, changeFlags});
      this._setWGS84PropertyForTiles();
    }
    const {highlightColor} = props;
    if (highlightColor !== oldProps.highlightColor && Array.isArray(highlightColor)) {
      this.setState({highlightColor});
    }
  }

  /* eslint-disable complexity */
  private async _updateTileData(): Promise<void> {
    let data: any = this.props.data;
    let tileJSON: any = null;

    if (typeof data === 'string' && !isURLTemplate(data)) {
      const {onDataLoad, fetch} = this.props;
      this.setState({data: null, tileJSON: null});
      try {
        tileJSON = await fetch(data, {propName: 'data', layer: this, loaders: []});
      } catch (error: any) {
        this.raiseError(error, 'loading TileJSON');
        data = null;
      }

      if (onDataLoad) {
        onDataLoad(tileJSON, {propName: 'data', layer: this});
      }
    } else if (data.tilejson) {
      tileJSON = data;
    }

    if (tileJSON) {
      data = tileJSON.tiles;
    }

    this.setState({data, tileJSON});
  }

  _getTilesetOptions(): Tileset2DProps {
    const opts = super._getTilesetOptions();
    const tileJSON: TileJson | null | undefined = this.state.tileJSON;
    const {minZoom, maxZoom} = this.props;

    if (tileJSON) {
      if (Number.isFinite(tileJSON.minzoom) && (tileJSON.minzoom as number) > (minZoom as number)) {
        opts.minZoom = tileJSON.minzoom as number;
      }

      if (
        Number.isFinite(tileJSON.maxzoom) &&
        (!Number.isFinite(maxZoom) || (tileJSON.maxzoom as number) < (maxZoom as number))
      ) {
        opts.maxZoom = tileJSON.maxzoom as number;
      }
    }
    return opts;
  }

  /* eslint-disable complexity */

  renderLayers(): Layer | null | LayersList {
    if (!this.state?.data) return null;
    return super.renderLayers();
  }

  getTileData(loadProps: TileLoadProps): Promise<ParsedMvtTile> {
    const {data, binary} = this.state;
    const {index, signal} = loadProps;

    const url = getURLFromTemplate(data, loadProps);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    let loadOptions = this.getLoadOptions();
    const {fetch} = this.props;
    loadOptions = {
      ...loadOptions,
      mimeType: 'application/x-protobuf',
      mvt: {
        ...loadOptions?.mvt,
        coordinates: this.context.viewport.resolution ? 'wgs84' : 'local',
        tileIndex: index
        // Local worker debug
        // workerUrl: `modules/mvt/dist/mvt-loader.worker.js`
        // Set worker to null to skip web workers
        // workerUrl: null
      },
      gis: binary ? {format: 'binary'} : {}
    };
    return fetch(url, {propName: 'data', layer: this, loadOptions, signal});
  }

  renderSubLayers(
    props: TileLayer['props'] & {
      id: string;
      data: ParsedMvtTile;
      _offset: number;
      tile: Tile2DHeader<ParsedMvtTile>;
    }
  ): Layer | null | LayersList {
    const {x, y, z} = props.tile.index;
    const worldScale = Math.pow(2, z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - y / worldScale);

    const modelMatrix = new Matrix4().scale([xScale, yScale, 1]);

    props.autoHighlight = false;

    if (!this.context.viewport.resolution) {
      props.modelMatrix = modelMatrix;
      props.coordinateOrigin = [xOffset, yOffset, 0];
      props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
      props.extensions = [...(props.extensions || []), new ClipExtension()];
    }

    const subLayers = super.renderSubLayers(props);

    if (this.state.binary && !(subLayers instanceof GeoJsonLayer)) {
      log.warn('renderSubLayers() must return GeoJsonLayer when using binary:true')();
    }

    return subLayers;
  }

  protected _updateAutoHighlight(info: PickingInfo): void {
    const {uniqueIdProperty} = this.props;

    const {hoveredFeatureId, hoveredFeatureLayerName} = this.state;
    const hoveredFeature = info.object;
    let newHoveredFeatureId;
    let newHoveredFeatureLayerName;

    if (hoveredFeature) {
      newHoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniqueIdProperty);
      newHoveredFeatureLayerName = getFeatureLayerName(hoveredFeature);
    }
    let {highlightColor} = this.props;
    if (typeof highlightColor === 'function') {
      highlightColor = highlightColor(info);
    }

    if (
      hoveredFeatureId !== newHoveredFeatureId ||
      hoveredFeatureLayerName !== newHoveredFeatureLayerName
    ) {
      this.setState({
        highlightColor,
        hoveredFeatureId: newHoveredFeatureId,
        hoveredFeatureLayerName: newHoveredFeatureLayerName
      });
    }
  }

  getPickingInfo(params: GetPickingInfoParams): TiledPickingInfo {
    const info = super.getPickingInfo(params);

    const isWGS84 = Boolean(this.context.viewport.resolution);

    if (this.state.binary && info.index !== -1) {
      const {data} = params.sourceLayer!.props;
      info.object = binaryToGeojson(data as BinaryFeatures, {
        globalFeatureId: info.index
      }) as Feature;
    }
    if (info.object && !isWGS84) {
      info.object = transformTileCoordsToWGS84(
        info.object,
        info.tile!.bbox as GeoBoundingBox, // eslint-disable-line
        this.context.viewport
      );
    }

    return info;
  }

  getSubLayerPropsByTile(tile: Tile2DHeader<ParsedMvtTile>): Record<string, any> {
    return {
      highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
      highlightColor: this.state.highlightColor
    };
  }

  private getHighlightedObjectIndex(tile: Tile2DHeader<ParsedMvtTile>): number {
    const {hoveredFeatureId, hoveredFeatureLayerName, binary} = this.state;
    const {uniqueIdProperty, highlightedFeatureId} = this.props;
    const data = tile.content;

    const isHighlighted = isFeatureIdDefined(highlightedFeatureId);
    const isFeatureIdPresent = isFeatureIdDefined(hoveredFeatureId) || isHighlighted;

    if (!isFeatureIdPresent) {
      return -1;
    }

    const featureIdToHighlight = isHighlighted ? highlightedFeatureId : hoveredFeatureId;

    // Iterable data
    if (Array.isArray(data)) {
      return data.findIndex(feature => {
        const isMatchingId = getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight;
        const isMatchingLayer =
          isHighlighted || getFeatureLayerName(feature) === hoveredFeatureLayerName;
        return isMatchingId && isMatchingLayer;
      });

      // Non-iterable data
    } else if (data && binary) {
      // Get the feature index of the selected item to highlight
      return findIndexBinary(
        data,
        uniqueIdProperty,
        featureIdToHighlight,
        isHighlighted ? '' : hoveredFeatureLayerName
      );
    }

    return -1;
  }

  private _pickObjects(maxObjects: number | null): PickingInfo[] {
    const {deck, viewport} = this.context;
    const width = viewport.width;
    const height = viewport.height;
    const x = viewport.x;
    const y = viewport.y;
    const layerIds = [this.id];
    return deck!.pickObjects({x, y, width, height, layerIds, maxObjects});
  }

  /** Get the rendered features in the current viewport. */
  getRenderedFeatures(maxFeatures: number | null = null): Feature[] {
    const features = this._pickObjects(maxFeatures);
    const featureCache = new Set();
    const renderedFeatures: Feature[] = [];

    for (const f of features) {
      const featureId = getFeatureUniqueId(f.object, this.props.uniqueIdProperty);

      if (featureId === undefined) {
        // we have no id for the feature, we just add to the list
        renderedFeatures.push(f.object as Feature);
      } else if (!featureCache.has(featureId)) {
        // Add removing duplicates
        featureCache.add(featureId);
        renderedFeatures.push(f.object as Feature);
      }
    }

    return renderedFeatures;
  }

  private _setWGS84PropertyForTiles(): void {
    const propName = 'dataInWGS84';
    const tileset: Tileset2D = this.state.tileset;

    // @ts-expect-error selectedTiles are always initialized when tile is being processed
    tileset.selectedTiles.forEach((tile: Tile2DHeader & ContentWGS84Cache) => {
      if (!tile.hasOwnProperty(propName)) {
        // eslint-disable-next-line accessor-pairs
        Object.defineProperty(tile, propName, {
          get: () => {
            // Still loading or encountered an error
            if (!tile.content) {
              return null;
            }

            if (this.state.binary && Array.isArray(tile.content) && !tile.content.length) {
              // TODO: @loaders.gl/mvt returns [] when no content. It should return a valid empty binary.
              // https://github.com/visgl/loaders.gl/pull/1137
              return [];
            }

            const {bbox} = tile;
            if (tile._contentWGS84 === undefined && isGeoBoundingBox(bbox)) {
              // Create a cache to transform only once

              const content = this.state.binary ? binaryToGeojson(tile.content) : tile.content;
              tile._contentWGS84 = content.map(feature =>
                transformTileCoordsToWGS84(feature, bbox, this.context.viewport)
              );
            }
            return tile._contentWGS84;
          }
        });
      }
    });
  }
}

function getFeatureUniqueId(feature: Feature, uniqueIdProperty: string | undefined) {
  if (feature.properties && uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }

  if ('id' in feature) {
    return feature.id;
  }

  return undefined;
}

function getFeatureLayerName(feature: Feature): string | null {
  return feature.properties?.layerName || null;
}

function isFeatureIdDefined(value: unknown): boolean {
  return value !== undefined && value !== null && value !== '';
}

function transformTileCoordsToWGS84(
  object: Feature,
  bbox: GeoBoundingBox,
  viewport: Viewport
): Feature {
  const feature = {
    ...object,
    geometry: {
      type: object.geometry.type
    }
  };

  // eslint-disable-next-line accessor-pairs
  Object.defineProperty(feature.geometry, 'coordinates', {
    get: () => {
      const wgs84Geom = transform(object.geometry, bbox, viewport);
      return wgs84Geom.coordinates;
    }
  });

  return feature as Feature;
}
