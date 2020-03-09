import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

import TileLayer from '../tile-layer/tile-layer';
import ClipExtension from './clip-extension';

const defaultProps = Object.assign({}, TileLayer.defaultProps, {
  renderSubLayers: {type: 'function', value: renderSubLayers, compare: false},
  urlTemplates: {type: 'array', value: [], compare: true},
  uniquePropertyId: {type: 'string', value: '', compare: false}
});

export default class MVTTileLayer extends TileLayer {
  async getTileData(tileProperties) {
    const {urlTemplates} = this.getCurrentLayer().props;

    if (!urlTemplates || !urlTemplates.length) {
      return Promise.reject('Invalid urlTemplates');
    }

    const templateReplacer = (_, property) => tileProperties[property];
    const tileURLIndex = getTileURLIndex(tileProperties, urlTemplates.length);
    const tileURL = urlTemplates[tileURLIndex].replace(/\{ *([\w_-]+) *\}/g, templateReplacer);

    return await load(tileURL, MVTLoader);
  }

  onHover(info, pickingEvent) {
    const {highlightedFeatureId} = this.state;
    const {uniquePropertyId} = this.props;
    const hoveredFeature = info.object;

    if (hoveredFeature) {
      const hoveredFeatureId = hoveredFeature.properties[uniquePropertyId] || hoveredFeature.id;

      if (hoveredFeatureId !== highlightedFeatureId) {
        this.setState({hoveredFeatureId});
      }
    }

    if (this.props.onHover) {
      return this.props.onHover(info, pickingEvent);
    }

    return false;
  }

  getHighlightedObjectIndex(tile) {
    // TODO: This implementation is faulty because highlightedObjectId
    // does not correspond to the index within provided data array
    // but to the picking index
    const {highlightedFeatureId: featureId} = this.state;
    const {uniquePropertyId} = this.props;
    const {tileData} = tile;

    if (!Array.isArray(tileData)) {
      return -1;
    }

    return tileData.findIndex(
      feature =>
        feature.id ? feature.id === featureId : feature.properties[uniquePropertyId] === featureId
    );
  }
}

function renderSubLayers({data, tile, extensions = [], ...otherProperties}) {
  return new GeoJsonLayer({
    ...otherProperties,
    data,
    modelMatrix: getModelMatrix(tile),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    extensions: [...extensions, new ClipExtension()]
  });
}

function getModelMatrix(tile) {
  const WORLD_SIZE = 512;
  const worldScale = Math.pow(2, tile.z);

  const xScale = WORLD_SIZE / worldScale;
  const yScale = -xScale;

  const xOffset = (WORLD_SIZE * tile.x) / worldScale;
  const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

  return new Matrix4().translate([xOffset, yOffset, 0]).scale([xScale, yScale, 1]);
}

function getTileURLIndex({x, y}, templatesLength) {
  return Math.abs(x + y) % templatesLength;
}

MVTTileLayer.layerName = 'MVTTileLayer';
MVTTileLayer.defaultProps = defaultProps;
