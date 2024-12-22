import {AccessorFunction} from '@deck.gl/core';
import GeoCellLayer from '../geo-cell-layer/GeoCellLayer';
/**
 * Properties of `GeohashLayer`.
 */
declare type GeohashLayerProps<DataT = any> = {
  /**
   * Called for each data object to retrieve the geohash string identifier.
   *
   * By default, it reads `geohash` property of data object.
   */
  getGeohash?: AccessorFunction<DataT, string>;
};
/** Render filled and/or stroked polygons based on the [Geohash](https://en.wikipedia.org/wiki/Geohash) geospatial indexing system. */
export default class GeohashLayer<DataT = any, ExtraProps = {}> extends GeoCellLayer<
  DataT,
  Required<GeohashLayerProps> & ExtraProps
> {
  static layerName: string;
  static defaultProps: any;
  indexToBounds(): Partial<GeoCellLayer['props']> | null;
}
export {};
// # sourceMappingURL=geohash-layer.d.ts.map
