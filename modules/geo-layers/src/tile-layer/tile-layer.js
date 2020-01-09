import {BaseTileLayer} from '@deck.gl/layers';
import {tileToBoundingBox} from './utils/tile-util';
import {getTileIndices} from './utils/viewport-util';

const defaultProps = Object.assign({}, BaseTileLayer.defaultProps, {
  tileToBoundingBox,
  getTileIndices
});

export default class TileLayer extends BaseTileLayer {}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
