import {AccessorFunction} from '@deck.gl/core';
import {PropTypeDef} from 'modules/core/src/lifecycle/prop-types';
import GeoCellLayer, {GeoCellLayerProps} from '../geo-cell-layer/GeoCellLayer';
import {getQuadkeyPolygon} from './quadkey-utils';

const defaultProps: Record<string, PropTypeDef> = {
  getQuadkey: {type: 'accessor', value: d => d.quadkey}
};

/**
 * Properties of `QuadkeyLayer`.
 */
export type QuadkeyLayerProps<DataT = any> = GeoCellLayerProps<DataT> & {
  /**
   * Called for each data object to retrieve the quadkey string identifier.
   *
   * By default, it reads `quadkey` property of data object.
   */
  getQuadkey: AccessorFunction<DataT, string>;
};

export default class QuadkeyLayer<
  DataT = any,
  PropsT extends QuadkeyLayerProps<DataT> = QuadkeyLayerProps<DataT>
> extends GeoCellLayer<DataT, PropsT> {
  static layerName = 'QuadkeyLayer';
  static defaultProps = defaultProps;

  indexToBounds(): Partial<GeoCellLayerProps> | null {
    const {data, getQuadkey} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',

      getPolygon: (x, objectInfo) => getQuadkeyPolygon(getQuadkey(x, objectInfo))
    };
  }
}
