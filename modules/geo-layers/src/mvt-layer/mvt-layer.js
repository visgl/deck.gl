import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
// import {binaryToGeoJson} from '@loaders.gl/gis';
import {COORDINATE_SYSTEM} from '@deck.gl/core';

import TileLayer from '../tile-layer/tile-layer';
import {getURLFromTemplate, isURLTemplate} from '../tile-layer/utils';
import ClipExtension from './clip-extension';
import {transform} from './coordinate-transform';

const WORLD_SIZE = 512;

const defaultProps = {
  uniqueIdProperty: {type: 'string', value: ''},
  highlightedFeatureId: null,
  loaders: MVTLoader
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
        // Local worker debud
        // workerUrl: `modules/mvt/dist/mvt-loader.worker.js`
        // Set worker to null to skip web workers
        // workerUrl: null
      },
      gis: this.props.binary ? { format: 'binary' } : undefined
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

  // eslint-disable-next-line complexity
  getPickingInfo(params) {
    const info = super.getPickingInfo(params);

    const isWGS84 = this.context.viewport.resolution;

    if (info.object) {
      if (!isWGS84 && info.object) {
        info.object = transformTileCoordsToWGS84(info.object, info.tile, this.context.viewport);
      }
    } else if (this.props.binary && info.index !== -1) {
      const geomType = this._getLayerDataGeomType(params.sourceLayer.props.data);
      if (geomType) {
        const data = params.sourceLayer.props.data[geomType];

        // Select feature index depending on geometry type
        let geometryIndex;
        let featureIndex;
        switch (geomType) {
          case 'points':    geometryIndex = data.featureIds.value[info.index];
                            featureIndex = geometryIndex;
                            break;
          case 'lines':     featureIndex = data.pathIndices.value[info.index];
                            geometryIndex = data.featureIds.value[featureIndex];
                            break;
          case 'polygons':  featureIndex = data.polygonIndices.value[info.index];
                            geometryIndex = data.featureIds.value[featureIndex];
                            break;
          default:          featureIndex = -1;
                            geometryIndex = featureIndex;
                            
        }

        if (featureIndex !== -1) {
          const numericProps = {};
            // eslint-disable-next-line max-depth
            for (const prop in data.numericProps) {
              numericProps[prop]=data.numericProps[prop].value[featureIndex * data.numericProps[prop].size];
            }
          info.object = {
            properties: { ...data.properties[geometryIndex], ...numericProps }
          }
        }
      }
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
      const index = this._getHightlightedObjectIndexForBinaryData(data, uniqueIdProperty, featureIdToHighlight);
      return index;
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

  _getLayerDataGeomType(data) {
    if (Promise.resolve(data) !== data) {
      if (data.points.featureIds.value.length) {
        return 'points';
      } else if (data.lines.featureIds.value.length) {
        return 'lines';
      } else if (data.polygons.featureIds.value.length) {
        return 'polygons';
      }
    }
    return null;
  }

  _getHightlightedObjectIndexForBinaryData(data, uniqueIdProperty, featureIdToHighlight) {
    const geomType = this._getLayerDataGeomType(data);

    if (geomType) {
      // Look for the uniqueIdProperty
      let index = -1;
      if (data[geomType].numericProps[uniqueIdProperty]) {
        index = data[geomType].numericProps[uniqueIdProperty].value.indexOf(featureIdToHighlight);
      } else {
        const propertyIndex = data[geomType].properties.findIndex((elem) => elem[uniqueIdProperty] === featureIdToHighlight);
        index = data[geomType].featureIds.value.indexOf(propertyIndex);
      }
      
      if (index !== -1) {
        // Select geometry index depending on geometry type
        // eslint-disable-next-line default-case
        switch (geomType) {
          case 'points':    return data[geomType].featureIds.value.indexOf(index);
          case 'lines':     return data[geomType].pathIndices.value.indexOf(index);
          case 'polygons':  return data[geomType].polygonIndices.value.indexOf(index);
        }
      }
    }
    return -1;
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

            if (tile._contentWGS84 === undefined) {
              // Create a cache to transform only once
              tile._contentWGS84 = tile.content.map(feature =>
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
