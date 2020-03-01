import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

import TileLayer from '../tile-layer/tile-layer';
import ClipExtension from './clip-extension';

const defaultProps = Object.assign({}, TileLayer.defaultProps, {
  renderSubLayers: {type: 'function', value: renderSubLayers, compare: false},
  urlTemplates: {type: 'array', value: [], compare: true}
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
