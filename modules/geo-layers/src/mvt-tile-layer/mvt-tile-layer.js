import {Matrix4} from 'math.gl';
import {COORDINATE_SYSTEM} from '@deck.gl/core';
import {GeoJsonLayer} from '@deck.gl/layers';
import TileLayer from '../tile-layer/tile-layer';

import {MVTLoader} from '@loaders.gl/mvt';
import {load} from '@loaders.gl/core';

const defaultProps = Object.assign({}, TileLayer.defaultProps, {
  renderSubLayers: {type: 'function', value: renderSubLayers, compare: false},
  uniquePropertyName: '',
  urlTemplates: []
});

export default class MVTTileLayer extends TileLayer {
  initializeState() {
    super.initializeState();
    const {urlTemplates, uniquePropertyName} = this.props;

    this.state = {
      ...this.state,
      urlTemplates,
      uniquePropertyName,
      getTileData: this.getTileData.bind(this)
    };
  }

  async getTileData(tileProperties) {
    const templateReplacer = (_, property) => tileProperties[property];

    const tileURLIndex = getTileURLIndex(tileProperties, this.state.urlTemplates.length);
    const tileURL = this.state.urlTemplates[tileURLIndex].replace(
      /\{ *([\w_-]+) *\}/g,
      templateReplacer
    );

    return load(tileURL, MVTLoader, {worker: false});
  }
}

function renderSubLayers(tileProperties) {
  return new GeoJsonLayer({
    ...tileProperties,
    modelMatrix: getModelMatrix(tileProperties.tile),
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN
  });
}

function getTileURLIndex({x, y}, templatesLength) {
  return Math.abs(x + y) % templatesLength;
}

function getModelMatrix(tile) {
  const extent = 512; // 2048? 4096?
  const WORLD_SIZE = 512; // deck.gl constant
  const worldScale = Math.pow(2, tile.z);

  const xScale = WORLD_SIZE / extent / worldScale;
  const yScale = -xScale;

  const xOffset = (WORLD_SIZE * tile.x) / worldScale;
  const yOffset = WORLD_SIZE * (1 - tile.y / worldScale);

  return new Matrix4().translate([xOffset, yOffset, 0]).scale([xScale, yScale, 1]);
}

MVTTileLayer.layerName = 'MVTTileLayer';
MVTTileLayer.defaultProps = defaultProps;
