import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import {
  _GeoCellLayer as GeoCellLayer,
  _GeoCellLayerProps as GeoCellLayerProps
} from '@deck.gl/geo-layers';
import {getQuadbinPolygon} from './quadbin-utils';

const defaultProps: DefaultProps<QuadbinLayerProps> = {
  getQuadbin: {type: 'accessor', value: d => d.quadbin}
};

/** All properties supported by QuadbinLayer. */
export type QuadbinLayerProps<DataT = any> = _QuadbinLayerProps<DataT> & GeoCellLayerProps<DataT>;

/** Properties added by QuadbinLayer. */
type _QuadbinLayerProps<DataT> = {
  /**
   * Called for each data object to retrieve the quadbin string identifier.
   *
   * By default, it reads `quadbin` property of data object.
   */
  getQuadbin?: AccessorFunction<DataT, bigint>;
};

export default class QuadbinLayer<DataT = any, ExtraProps = {}> extends GeoCellLayer<
  DataT,
  Required<_QuadbinLayerProps<DataT>> & ExtraProps
> {
  static layerName = 'QuadbinLayer';
  static defaultProps = defaultProps;

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getQuadbin} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',

      getPolygon: (x: DataT, objectInfo) => getQuadbinPolygon(getQuadbin(x, objectInfo))
    };
  }
}
