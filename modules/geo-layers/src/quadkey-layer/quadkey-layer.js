import {CompositeLayer} from '@deck.gl/core';
import {PolygonLayer} from '@deck.gl/layers';
import {getQuadkeyPolygon} from './quadkey-utils';
import {createCellLayer} from '../common/cell-layer-utils';

const defaultProps = {
  ...PolygonLayer.defaultProps,
  getQuadkey: {type: 'accessor', value: d => d.quadkey}
};

export default class QuadkeyLayer extends CompositeLayer {
  renderLayers() {
    const {data, getQuadkey} = this.props;
    return createCellLayer(this,
      {
        data,
        _normalize: false,
        positionFormat: 'XY',
        getPolygon: (x, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo))
      }
    );
  }
}

QuadkeyLayer.layerName = 'QuadkeyLayer';
QuadkeyLayer.defaultProps = defaultProps;
