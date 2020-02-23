import {Matrix4} from 'math.gl';
import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';

import TileLayer from '../tile-layer/tile-layer';

const defaultProps = Object.assign({}, TileLayer.defaultProps, {
  renderSubLayers: {type: 'function', value: renderSubLayers, compare: false},
  urlTemplates: []
});

export default class MVTTileLayer extends TileLayer {
  initializeState() {
    super.initializeState();
    const {urlTemplates} = this.props;

    this.state = {
      ...this.state,
      urlTemplates
    };
  }

  async getTileData(tileProperties) {
    const {urlTemplates} = this.state;

    if (!urlTemplates || !urlTemplates.length) {
      return Promise.reject();
    }

    const templateReplacer = (_, property) => tileProperties[property];
    const tileURLIndex = getTileURLIndex(tileProperties, urlTemplates.length);
    const tileURL = urlTemplates[tileURLIndex].replace(/\{ *([\w_-]+) *\}/g, templateReplacer);

    return await load(tileURL, MVTLoader);
  }
}

function renderSubLayers(tileProperties) {
  return new GeoJsonLayer({
    ...tileProperties,
    modelMatrix: getModelMatrix(tileProperties.tile),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
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
