import GeoCellLayer from '../geo-cell-layer/GeoCellLayer';
import {getQuadkeyPolygon} from './quadkey-utils';

const defaultProps = {
  getQuadkey: {type: 'accessor', value: d => d.quadkey}
};

export default class QuadkeyLayer extends GeoCellLayer {
  indexToBounds() {
    const {data, getQuadkey} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',
      getPolygon: (x, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo))
    };
  }
}

QuadkeyLayer.layerName = 'QuadkeyLayer';
QuadkeyLayer.defaultProps = defaultProps;
