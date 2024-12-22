import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayerProps,
  UpdateParameters
} from '@deck.gl/core';
import {CartoAPIError} from '../api/carto-api-error';
import {MapType, TileFormat, QueryParameters} from '../api/maps-api-common';
import {Credentials} from '../config';
import {Headers} from '../api/maps-v3-client';
/** All properties supported by CartoLayer. */
export declare type CartoLayerProps<DataT = any> = _CartoLayerProps & CompositeLayerProps<DataT>;
/** Properties added by CartoLayer. */
declare type _CartoLayerProps = {
  /**
   * Either a SQL query or a name of dataset/tileset.
   */
  data: string;
  /**
   * Data type.
   *
   * Possible values are:
   *  * `MAP_TYPES.QUERY`, if data is a SQL query.
   *  * `MAP_TYPES.TILESET`, if data is a tileset name.
   *  * `MAP_TYPES.TABLE`, if data is a dataset name. Only supported with API v3.
   */
  type: MapType;
  /**
   * Name of the connection registered in the CARTO workspace.
   *
   * Required when apiVersion is `API_VERSIONS.V3`.
   */
  connection?: string;
  /**
   * Use to override the default tile data format.
   *
   * Only supported when apiVersion is `API_VERSIONS.V3`.
   *
   * Possible values are: `TILE_FORMATS.BINARY`, `TILE_FORMATS.GEOJSON` and `TILE_FORMATS.MVT`.
   */
  formatTiles?: TileFormat;
  /**
   * Name of the geo_column in the CARTO platform.
   *
   * Use this override the default column (`'geom'`), from which the geometry information should be fetched.
   *
   * Only supported when apiVersion is `API_VERSIONS.V3` and type is `MAP_TYPES.TABLE`.
   */
  geoColumn?: string;
  /**
   * Names of columns to fetch.
   *
   * By default, all columns are fetched
   *
   * Only supported when apiVersion is `API_VERSIONS.V3` and type is `MAP_TYPES.TABLE`.
   */
  columns?: string[];
  /**
   * A string pointing to a unique attribute at the result of the query.
   *
   * A unique attribute is needed for highlighting with vector tiles when a feature is split across two or more tiles.
   */
  uniqueIdProperty?: string;
  /**
   * Optional. Overrides the configuration to connect with CARTO.
   *
   * @see Credentials
   */
  credentials?: Credentials;
  /**
   * Called when the request to the CARTO Maps API failed.
   *
   * By default the CartoAPIError is thrown.
   */
  onDataError?: (err: CartoAPIError) => void;
  clientId?: string;
  /** Custom headers to include in the map instantiation request **/
  headers?: Headers;
  /** Aggregation SQL expression. Only used for spatial index datasets **/
  aggregationExp?: string;
  /** Aggregation resolution level. Only used for spatial index datasets, defaults to 6 for quadbins, 4 for h3. **/
  aggregationResLevel?: number;
  /** Query parameters to be sent to the server. **/
  queryParameters?: QueryParameters;
};
export default class CartoLayer<ExtraProps = {}> extends CompositeLayer<
  Required<_CartoLayerProps> & ExtraProps
> {
  static layerName: string;
  static defaultProps: any;
  initializeState(): void;
  get isLoaded(): boolean;
  _checkProps(props: CartoLayerProps): void;
  updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void;
  _updateData(): Promise<void>;
  _getSubLayerAndProps(): [any, LayerProps];
  renderLayers(): Layer | null;
}
export {};
// # sourceMappingURL=carto-layer.d.ts.map
