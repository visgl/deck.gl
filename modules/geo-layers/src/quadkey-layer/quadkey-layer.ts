import {AccessorFunction} from '@deck.gl/core';
import GeoCellLayer from '../geo-cell-layer/GeoCellLayer';
import {getQuadkeyPolygon} from './quadkey-utils';

const defaultProps = {
  getQuadkey: {type: 'accessor', value: d => d.quadkey}
};

/**
 * Properties of `QuadkeyLayer`.
 */
type QuadkeyLayerProps<DataT = any> = {
  /**
   * Called for each data object to retrieve the quadkey string identifier.
   *
   * By default, it reads `quadkey` property of data object.
   */
  getQuadkey?: AccessorFunction<DataT, string>;
};

export default class QuadkeyLayer<DataT = any, ExtraProps = {}> extends GeoCellLayer<
  DataT,
  Required<QuadkeyLayerProps> & ExtraProps
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
