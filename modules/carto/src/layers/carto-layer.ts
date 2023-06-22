import {
  CompositeLayer,
  CompositeLayerProps,
  Layer,
  LayerProps,
  log,
  UpdateParameters
} from '@deck.gl/core';

import {MVTLayer} from '@deck.gl/geo-layers';
import {fetchLayerData, getDataV2, API_VERSIONS} from '../api';
import {CartoAPIError} from '../api/carto-api-error';
import {layerFromTileDataset} from '../api/layer-map';
import {
  COLUMNS_SUPPORT,
  FORMATS,
  GEO_COLUMN_SUPPORT,
  MapType,
  MAP_TYPES,
  TileFormat,
  QueryParameters
} from '../api/maps-api-common';
import {
  ClassicCredentials,
  CloudNativeCredentials,
  Credentials,
  getDefaultCredentials
} from '../config';
import {FetchLayerDataResult, Headers} from '../api/maps-v3-client';
import {assert} from '../utils';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // (Enum (MAP_TYPES), required)
  type: null,
  onDataLoad: {type: 'function', value: data => {}},
  onDataError: {type: 'function', value: null, optional: true},
  uniqueIdProperty: 'cartodb_id',

  // override carto credentials for the layer, set to null to read from default
  credentials: null,

  /*********************/
  /* API v3 PARAMETERS */
  /**********************/
  // (String, required): connection name at CARTO platform
  connection: null,

  // (String, optional): format of data
  format: null,

  // (String, optional): force format of data for tiles
  formatTiles: null,

  // (String, optional): clientId identifier used for internal tracing, place here a string to identify the client who is doing the request.
  clientId: null,

  // (String, optional): name of the `geo_column` in the CARTO platform. Use this override the default column ('geom'), from which the geometry information should be fetched.
  geoColumn: null,

  // (Array<String>, optional): names of columns to fetch. By default, all columns are fetched.
  columns: {type: 'array', value: null},

  // (Headers, optional): Custom headers to include in the map instantiation request.
  headers: {type: 'object', value: {}, optional: true},

  // (String, optional): aggregation SQL expression. Only used for spatial index datasets
  aggregationExp: null,

  // (Number, optional): aggregation resolution level. Only used for spatial index datasets, defaults to 6 for quadbins, 4 for h3
  aggregationResLevel: null,

  // (QueryParameters, optional): query parameters to be sent to the server.
  queryParameters: null
};

/** All properties supported by CartoLayer. */
export type CartoLayerProps = _CartoLayerProps & CompositeLayerProps;

/** Properties added by CartoLayer. */
type _CartoLayerProps = {
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

export default class CartoLayer<ExtraProps extends {} = {}> extends CompositeLayer<
  Required<_CartoLayerProps> & ExtraProps
> {
  static layerName = 'CartoLayer';
  static defaultProps = defaultProps;

  initializeState(): void {
    this.state = {
      data: null,
      apiVersion: null
    };
  }

  get isLoaded(): boolean {
    return this.getSubLayers().length > 0 && super.isLoaded;
  }

  _checkProps(props: CartoLayerProps): void {
    const {type, credentials, connection, geoColumn, columns} = props;
    const localCreds = {...getDefaultCredentials(), ...credentials};
    const {apiVersion} = localCreds;

    log.assert(
      Object.values(API_VERSIONS).includes(apiVersion),
      `Invalid apiVersion ${apiVersion}. Use API_VERSIONS enum.`
    );

    if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
      log.assert(
        type === MAP_TYPES.QUERY || type === MAP_TYPES.TILESET,
        `Invalid type ${type}. Use type MAP_TYPES.QUERY or MAP_TYPES.TILESET for apiVersion ${apiVersion}`
      );
      log.assert(!connection, `Connection prop is not supported for apiVersion ${apiVersion}`);
      log.assert(!geoColumn, `geoColumn prop is not supported for apiVersion ${apiVersion}`);
      log.assert(!columns, `columns prop is not supported for apiVersion ${apiVersion}`);
    } else if (apiVersion === API_VERSIONS.V3) {
      log.assert(connection, 'Missing mandatory connection parameter');
      log.assert(
        Object.values(MAP_TYPES).includes(type),
        `Invalid type ${type}. Use MAP_TYPES enum.`
      );
      if (!COLUMNS_SUPPORT.includes(type)) {
        log.assert(!columns, `columns prop is only supported for types: ${COLUMNS_SUPPORT.join()}`);
      }
      if (!GEO_COLUMN_SUPPORT.includes(type)) {
        log.assert(
          !geoColumn,
          `geoColumn prop is only supported for types: ${GEO_COLUMN_SUPPORT.join()}`
        );
      }
      if (columns) {
        log.assert(Array.isArray(columns), 'columns prop must be an Array');
      }
    }
  }

  updateState({props, oldProps, changeFlags}: UpdateParameters<this>) {
    this._checkProps(props);
    const shouldUpdateData =
      changeFlags.dataChanged ||
      props.aggregationExp !== oldProps.aggregationExp ||
      props.aggregationResLevel !== oldProps.aggregationResLevel ||
      props.connection !== oldProps.connection ||
      props.geoColumn !== oldProps.geoColumn ||
      props.formatTiles !== oldProps.formatTiles ||
      props.type !== oldProps.type ||
      JSON.stringify(props.columns) !== JSON.stringify(oldProps.columns) ||
      JSON.stringify(props.credentials) !== JSON.stringify(oldProps.credentials) ||
      JSON.stringify(props.queryParameters) !== JSON.stringify(oldProps.queryParameters);

    if (shouldUpdateData) {
      this.setState({data: null, apiVersion: null});
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._updateData();
    }
  }

  async _updateData(): Promise<void> {
    try {
      const {type, data: source, credentials, connection, ...rest} = this.props;
      const localConfig = {...getDefaultCredentials(), ...credentials};
      const {apiVersion} = localConfig;

      let result: Partial<FetchLayerDataResult>;
      if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
        result = {
          data: await getDataV2({type, source, credentials: credentials as ClassicCredentials})
        };
      } else {
        result = await fetchLayerData({
          type,
          source,
          credentials: credentials as CloudNativeCredentials,
          connection,
          ...rest,
          // CartoLayer only supports tiled output from v8.8, force data format
          format: FORMATS.TILEJSON
        });
      }

      this.setState({...result, apiVersion});

      this.props.onDataLoad?.(result.data, {
        propName: 'data',
        layer: this
      });
    } catch (err) {
      if (this.props.onDataError) {
        this.props.onDataError(err as CartoAPIError);
      } else {
        throw err;
      }
    }
  }

  _getSubLayerAndProps(): [any, LayerProps] {
    assert(this.state);

    const {data, apiVersion} = this.state;

    const {uniqueIdProperty} = defaultProps;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {data: _notUsed, ...propsNoData} = this.props;
    // @ts-expect-error 'uniqueIdProperty' is specified more than once, so this usage will be overwritten.
    const props = {uniqueIdProperty, ...propsNoData};

    if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
      return [MVTLayer, props];
    }

    /* global URL */
    const tileUrl = new URL(data.tiles[0]);
    props.formatTiles =
      props.formatTiles || (tileUrl.searchParams.get('formatTiles') as TileFormat);

    return [layerFromTileDataset(props.formatTiles, data.scheme, props.type), props];
  }

  renderLayers(): Layer | null {
    assert(this.state);

    const {apiVersion, data} = this.state;

    if (!data) return null;

    const {credentials, updateTriggers} = this.props;
    const loadOptions: any = this.getLoadOptions() || {};
    if (apiVersion === API_VERSIONS.V3) {
      const localConfig = {...getDefaultCredentials(), ...credentials} as CloudNativeCredentials;
      const {accessToken} = localConfig;
      loadOptions.fetch = {
        ...loadOptions.fetch,
        headers: {
          ...loadOptions.fetch?.headers,
          Authorization: `Bearer ${accessToken}`
        }
      };
    }

    const [layer, props] = this._getSubLayerAndProps();

    // eslint-disable-next-line new-cap
    return new layer(
      props,
      this.getSubLayerProps({
        id: `carto-${layer.layerName}`,
        data,
        loadOptions,
        updateTriggers
      })
    );
  }
}
