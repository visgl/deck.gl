import {AccessorFunction, DefaultProps} from '@deck.gl/core';
import GeoCellLayer from '../geo-cell-layer/GeoCellLayer';
import {getGeohashPolygon} from './geohash-utils';

const defaultProps: DefaultProps<GeohashLayerProps> = {
  getGeohash: {type: 'accessor', value: d => d.geohash}
};

/**
 * Properties of `GeohashLayer`.
 */
type GeohashLayerProps<DataT = any> = {
  /**
   * Called for each data object to retrieve the geohash string identifier.
   *
   * By default, it reads `geohash` property of data object.
   */
  getGeohash?: AccessorFunction<DataT, string>;
};

/** Render filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system. */
export default class GeohashLayer<DataT = any, ExtraProps extends {} = {}> extends GeoCellLayer<
  DataT,
  Required<GeohashLayerProps> & ExtraProps
> {
  static layerName = 'GeohashLayer';
  static defaultProps = defaultProps;

  indexToBounds(): Partial<GeoCellLayer['props']> | null {
    const {data, getGeohash} = this.props;

    return {
      data,
      _normalize: false,
      positionFormat: 'XY',
      getPolygon: (x: DataT, objectInfo) => getGeohashPolygon(getGeohash(x, objectInfo))
    };
  }
}
