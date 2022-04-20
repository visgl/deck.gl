import {
  assert,
  ChangeFlags,
  Layer,
  LayersList,
  log,
  PickingInfo,
  Viewport,
  _GlobeViewport
} from '@deck.gl/core';
import {Matrix4} from '@math.gl/core';
import {MVTWorkerLoader} from '@loaders.gl/mvt';
import {binaryToGeojson} from '@loaders.gl/gis';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {ClipExtension} from '@deck.gl/extensions';

import TileLayer, {TileLayerProps} from '../tile-layer/tile-layer';
import {getURLFromTemplate, isURLTemplate} from '../tile-layer/utils';
import {transform} from './coordinate-transform';
import findIndexBinary from './find-index-binary';

import {GeoJsonLayer} from '@deck.gl/layers';
import {Loader} from '@loaders.gl/loader-utils';
import {Tileset2DProps} from '../tile-layer/tileset-2d';
import {TileLoadProps} from '../tile-layer/types';
import Tile2DHeader from '../tile-layer/tile-2d-header';

const WORLD_SIZE = 512;

const defaultProps = {
  ...GeoJsonLayer.defaultProps,
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: null,
  loaders: [MVTWorkerLoader],
  binary: true
};

export type MVTLayerProps = TileLayerProps & {
  /** Called if `data` is a TileJSON URL when it is successfully fetched. */
  onDataLoad: ((tilejson: any) => void) | undefined;

  /** Needed for highlighting a feature split across two or more tiles. */
  uniqueIdProperty: string;

  /** A feature with ID corresponding to the supplied value will be highlighted */
  highlightedFeatureId: string | undefined;

  /** Use tile data in binary format. */
  binary: boolean;

  loaders: Loader[];
};
export default class MVTLayer<PropsT extends MVTLayerProps = MVTLayerProps> extends TileLayer<
  any,
  PropsT
> {
  static layerName = 'MVTLayer';
  static defaultProps = defaultProps;

  initializeState() {
    super.initializeState();
    assert(this.context);
    // GlobeView doesn't work well with binary data
    const binary = this.context.viewport instanceof _GlobeViewport ? false : this.props.binary;
    this.setState({
      binary,
      data: null,
      tileJSON: null
    });
  }

  get isLoaded(): boolean {
    return this.state && this.state.data && this.state.tileset && super.isLoaded;
  }

  updateState({
    props,
    oldProps,
    context,
    changeFlags
  }: {
    props: PropsT;
    oldProps: PropsT;
    context: any;
    changeFlags: ChangeFlags;
  }) {
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
  private async _updateTileData() {
    let data: any = this.props.data;
    let tileJSON: any = null;

    if (typeof data === 'string' && !isURLTemplate(data)) {
      const {onDataLoad, fetch} = this.props;
      this.setState({data: null, tileJSON: null});
      try {
        tileJSON = await fetch!(data, {propName: 'data', layer: this, loaders: []});
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
    // @ts-expect-error
    const {tileJSON} = this.state;
    const {minZoom, maxZoom} = this.props;

    if (tileJSON) {
      if (Number.isFinite(tileJSON.minzoom) && tileJSON.minzoom > (minZoom as number)) {
        opts.minZoom = tileJSON.minzoom;
      }

      if (
        Number.isFinite(tileJSON.maxzoom) &&
        (!Number.isFinite(maxZoom) || tileJSON.maxzoom < (maxZoom as number))
      ) {
        opts.maxZoom = tileJSON.maxzoom;
      }
    }
    return opts;
  }

  /* eslint-disable complexity */

  renderLayers(): Layer[] | null {
    if (!this.state?.data) return null;
    return super.renderLayers();
  }

  getTileData(tile: TileLoadProps) {
    const {index, signal} = tile;

    const url = getURLFromTemplate(this.state.data, index);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    let loadOptions = this.getLoadOptions();
    const {binary} = this.state;
    const {fetch} = this.props;
    loadOptions = {
      ...loadOptions,
      mimeType: 'application/x-protobuf',
      mvt: {
        ...loadOptions?.mvt,
        coordinates: this.context.viewport instanceof _GlobeViewport ? 'wgs84' : 'local',
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
    props: PropsT & {
      id: string;
      data: any;
      _offset: number;
      tile: Tile2DHeader;
    }
  ): LayersList {
    assert(this.state && this.context);

    const {x, y, z} = props.tile.index;
    const worldScale = Math.pow(2, z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - y / worldScale);

    const modelMatrix = new Matrix4().scale([xScale, yScale, 1]);

    props.autoHighlight = false;

    if (!(this.context.viewport instanceof _GlobeViewport)) {
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

  _updateAutoHighlight(info: PickingInfo) {
    assert(this.state);

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

  getPickingInfo(params) {
    assert(this.state && this.context);
    const info = super.getPickingInfo(params);

    const isWGS84 = this.context.viewport instanceof _GlobeViewport;

    if (this.state.binary && info.index !== -1) {
      const {data} = params.sourceLayer.props;
      info.object = binaryToGeojson(data, {globalFeatureId: info.index});
    }
    if (info.object && !isWGS84) {
      info.object = transformTileCoordsToWGS84(info.object, info.tile.bbox, this.context.viewport);
    }

    return info;
  }

  getSubLayerPropsByTile(tile) {
    assert(this.state);

    return {
      highlightedObjectIndex: this.getHighlightedObjectIndex(tile),
      highlightColor: this.state.highlightColor
    };
  }

  getHighlightedObjectIndex(tile: Tile2DHeader) {
    assert(this.state);

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

  _pickObjects(maxObjects) {
    assert(this.context);

    const {deck, viewport} = this.context;
    const width = viewport.width;
    const height = viewport.height;
    const x = viewport.x;
    const y = viewport.y;
    const layerIds = [this.id];
    return deck.pickObjects({x, y, width, height, layerIds, maxObjects});
  }

  getRenderedFeatures(maxFeatures = null) {
    const features: any[] = this._pickObjects(maxFeatures);
    const featureCache = new Set();
    const renderedFeatures: any[] = [];

    for (const f of features) {
      const featureId = getFeatureUniqueId(f.object, this.props.uniqueIdProperty);

      if (featureId === undefined) {
        // we have no id for the feature, we just add to the list
        renderedFeatures.push(f.object);
      } else if (!featureCache.has(featureId)) {
        // Add removing duplicates
        featureCache.add(featureId);
        renderedFeatures.push(f.object);
      }
    }

    return renderedFeatures;
  }

  _setWGS84PropertyForTiles() {
    assert(this.state && this.context);

    const propName = 'dataInWGS84';
    const {tileset} = this.state;

    tileset.selectedTiles.forEach(tile => {
      if (!tile.hasOwnProperty(propName)) {
        // eslint-disable-next-line accessor-pairs
        Object.defineProperty(tile, propName, {
          get: () => {
            // Still loading or encountered an error
            if (!tile.content) {
              return null;
            }

            if (this.state!.binary && Array.isArray(tile.content) && !tile.content.length) {
              // TODO: @loaders.gl/mvt returns [] when no content. It should return a valid empty binary.
              // https://github.com/visgl/loaders.gl/pull/1137
              return [];
            }

            if (tile._contentWGS84 === undefined) {
              // Create a cache to transform only once
              const content = this.state!.binary ? binaryToGeojson(tile.content) : tile.content;
              tile._contentWGS84 = content.map(feature =>
                transformTileCoordsToWGS84(feature, tile.bbox, this.context!.viewport)
              );
            }
            return tile._contentWGS84;
          }
        });
      }
    });
  }
}

function getFeatureUniqueId(feature, uniqueIdProperty) {
  if (uniqueIdProperty) {
    return feature.properties[uniqueIdProperty];
  }

  if ('id' in feature) {
    return feature.id;
  }

  return undefined;
}

function getFeatureLayerName(feature) {
  return feature.properties?.layerName || null;
}

function isFeatureIdDefined(value) {
  return value !== undefined && value !== null && value !== '';
}

function transformTileCoordsToWGS84(object, bbox, viewport: Viewport) {
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

  return feature;
}
