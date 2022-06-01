import {AccessorFunction} from '@deck.gl/core';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {getQuadkeyPolygon} from './quadkey-utils';

const defaultProps = {
  getQuadkey: {type: 'accessor', value: d => d.quadkey}
};

/** All properties supported by QuadkeyLayer. */
export type QuadkeyLayerProps<DataT = any> = _QuadkeyLayerProps<DataT> & GeoCellLayerProps<DataT>;

/** Properties added by QuadkeyLayer. */
type _QuadkeyLayerProps<DataT = any> = {
  /**
   * Called for each data object to retrieve the quadkey string identifier.
   *
   * By default, it reads `quadkey` property of data object.
   */
  getQuadkey?: AccessorFunction<DataT, string>;
};

export default class QuadkeyLayer<DataT = any, ExtraProps = {}> extends GeoCellLayer<
  DataT,
  Required<_QuadkeyLayerProps> & ExtraProps
> {
  static layerName = 'QuadkeyLayer';
  static defaultProps: any = defaultProps;

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getQuadkey} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',

      getPolygon: (x: DataT, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo))
    };
  }
}
