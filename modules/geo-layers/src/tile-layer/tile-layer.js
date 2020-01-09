import {BaseTileLayer} from '@deck.gl/layers';
import {tileToBoundingBox} from './utils/tile-util';
import {getTileIndices} from './utils/viewport-util';

// Hardcoded to match math.gl:
// https://github.com/uber-web/math.gl/blob/master/modules/web-mercator/src/web-mercator-utils.js#L15
const tileSize = 512;
const defaultProps = Object.assign({}, BaseTileLayer.defaultProps, {
  tileToBoundingBox,
  getTileIndices,
  tileSize
});

export default class TileLayer extends BaseTileLayer {}

TileLayer.layerName = 'TileLayer';
TileLayer.defaultProps = defaultProps;
