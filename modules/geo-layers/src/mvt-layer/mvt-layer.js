import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {binaryToGeoJson} from '@loaders.gl/gis';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {_binaryToFeature, _findIndexBinary} from '@deck.gl/layers';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate, isURLTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';
import {transform} from './coordinate-transform';

const WORLD_SIZE = 512;

const defaultProps = {
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: null,
  loaders: MVTLoader,
  binary: false
};

async function fetchTileJSON(url) {
  try {
    return await load(url);
  } catch (error) {
    throw new Error(`An error occurred fetching TileJSON: ${error}`);
  }
}

export default class MVTLayer extends TileLayer {
  initializeState() {
    super.initializeState();
    this.setState({
      data: null,
      tileJSON: null
    });
  }

  get isLoaded() {
    return this.state.data && this.state.tileset && super.isLoaded;
  }

  updateState({props, oldProps, context, changeFlags}) {
    if (changeFlags.dataChanged) {
      this._updateTileData({props});
    }

    if (this.state.data) {
      super.updateState({props, oldProps, context, changeFlags});
      this._setWGS84PropertyForTiles();
    }
  }

  async _updateTileData({props}) {
    const {onDataLoad} = this.props;
    let {data} = props;
    let tileJSON = null;
    let {minZoom, maxZoom} = props;

    if (typeof data === 'string' && !isURLTemplate(data)) {
      this.setState({data: null, tileJSON: null});
      tileJSON = await fetchTileJSON(data);

      if (onDataLoad) {
        onDataLoad(tileJSON);
      }
    } else if (data.tilejson) {
      tileJSON = data;
    }

    if (tileJSON) {
      data = tileJSON.tiles;

      if (Number.isFinite(tileJSON.minzoom) && tileJSON.minzoom > minZoom) {
        minZoom = tileJSON.minzoom;
      }

      if (
        Number.isFinite(tileJSON.maxzoom) &&
        (!Number.isFinite(maxZoom) || tileJSON.maxzoom < maxZoom)
      ) {
        maxZoom = tileJSON.maxzoom;
      }
    }

    this.setState({data, tileJSON, minZoom, maxZoom});
  }

  renderLayers() {
    if (!this.state.data) return null;
    return super.renderLayers();
  }

  getTileData(tile) {
    const url = getURLFromTemplate(this.state.data, tile);
    if (!url) {
      return Promise.reject('Invalid URL');
    }
    let options = this.getLoadOptions();
    options = {
      ...options,
      mvt: {
        ...(options && options.mvt),
        coordinates: this.context.viewport.resolution ? 'wgs84' : 'local',
        tileIndex: {x: tile.x, y: tile.y, z: tile.z}
        // Local worker debug
        // workerUrl: `modules/mvt/dist/mvt-loader.worker.js`
        // Set worker to null to skip web workers
        // workerUrl: null
      },
      gis: this.props.binary ? {format: 'binary'} : undefined
    };
    return load(url, this.props.loaders, options);
  }

  renderSubLayers(props) {
    const {tile} = props;
    const worldScale = Math.pow(2, tile.z);

    const xScale = WORLD_SIZE / worldScale;
    const yScale = -xScale;

    const xOffset = (WORLD_SIZE * tile.x) / worldScale;
    const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

    const modelMatrix = new Matrix4().scale([xScale, yScale, 1]);

    props.autoHighlight = false;

    if (!this.context.viewport.resolution) {
      props.modelMatrix = modelMatrix;
      props.coordinateOrigin = [xOffset, yOffset, 0];
      props.coordinateSystem = COORDINATE_SYSTEM.CARTESIAN;
      props.extensions = [...(props.extensions || []), new ClipExtension()];
    }

    return super.renderSubLayers(props);
  }

  onHover(info, pickingEvent) {
    const {uniqueIdProperty, autoHighlight} = this.props;

    if (autoHighlight) {
      const {hoveredFeatureId} = this.state;
      const hoveredFeature = info.object;
      let newHoveredFeatureId;

      if (hoveredFeature) {
        newHoveredFeatureId = getFeatureUniqueId(hoveredFeature, uniqueIdProperty);
      }

      if (hoveredFeatureId !== newHoveredFeatureId && newHoveredFeatureId !== -1) {
        this.setState({hoveredFeatureId: newHoveredFeatureId});
      }
    }

    return super.onHover(info, pickingEvent);
  }

  getPickingInfo(params) {
    const info = super.getPickingInfo(params);

    const isWGS84 = this.context.viewport.resolution;

    if (info.object) {
      if (!isWGS84 && info.object) {
        info.object = transformTileCoordsToWGS84(info.object, info.tile, this.context.viewport);
      }
    } else if (this.props.binary && info.index !== -1) {
      // get the feature from the binary at the given index.
      const {data} = params.sourceLayer.props;
      info.object =
        _binaryToFeature(data.points, info.index) ||
        _binaryToFeature(data.lines, info.index) ||
        _binaryToFeature(data.polygons, info.index);
    }

    return info;
  }

  getHighlightedObjectIndex(tile) {
    const {hoveredFeatureId} = this.state;
    const {uniqueIdProperty, highlightedFeatureId, binary} = this.props;
    const {data} = tile;

    const isFeatureIdPresent =
      isFeatureIdDefined(hoveredFeatureId) || isFeatureIdDefined(highlightedFeatureId);

    if (!isFeatureIdPresent) {
      return -1;
    }

    const featureIdToHighlight = isFeatureIdDefined(highlightedFeatureId)
      ? highlightedFeatureId
      : hoveredFeatureId;

    // Iterable data
    if (Array.isArray(data)) {
      return data.findIndex(
        feature => getFeatureUniqueId(feature, uniqueIdProperty) === featureIdToHighlight
      );

      // Non-iterable data
    } else if (data && binary) {
      // Get the feature index of the selected item to highlight
      const featureIdIndex = _findIndexBinary(data, uniqueIdProperty, featureIdToHighlight);

      const geometries = ['points', 'lines', 'polygons'];
      for (const geometry of geometries) {
        const index = data[geometry] && data[geometry].featureIds.value[featureIdIndex];
        if (index !== undefined) return index;
      }
    }

    return -1;
  }

  _pickObjects(maxObjects) {
    const {deck, viewport} = this.context;
    const width = viewport.width;
    const height = viewport.height;
    const x = viewport.x;
    const y = viewport.y;
    const layerIds = [this.id];
    return deck.pickObjects({x, y, width, height, layerIds, maxObjects});
  }

  getRenderedFeatures(maxFeatures = null) {
    const features = this._pickObjects(maxFeatures);
    const featureCache = new Set();
    const renderedFeatures = [];

    for (const f of features) {
      const featureId = getFeatureUniqueId(f.object, this.props.uniqueIdProperty);

      if (featureId === -1) {
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

            if (this.props.binary && Array.isArray(tile.content) && !tile.content.length) {
              // TODO: @loaders.gl/mvt returns [] when no content. It should return a valid empty binary.
              // https://github.com/visgl/loaders.gl/pull/1137
              return [];
            }

            if (tile._contentWGS84 === undefined) {
              // Create a cache to transform only once
              const content = this.props.binary ? binaryToGeoJson(tile.content) : tile.content;
              tile._contentWGS84 = content.map(feature =>
                transformTileCoordsToWGS84(feature, tile.bbox, this.context.viewport)
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

  return -1;
}

function isFeatureIdDefined(value) {
  return value !== undefined && value !== null && value !== '';
}

function transformTileCoordsToWGS84(object, bbox, viewport) {
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

MVTLayer.layerName = 'MVTLayer';
MVTLayer.defaultProps = defaultProps;
