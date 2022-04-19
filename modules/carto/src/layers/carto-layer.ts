import {CompositeLayer, Layer, log} from '@deck.gl/core';
import CartoTileLayer from './carto-tile-layer';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {fetchLayerData, getDataV2, API_VERSIONS} from '../api';
import {
  COLUMNS_SUPPORT,
  Format,
  FORMATS,
  GEO_COLUMN_SUPPORT,
  MapType,
  MAP_TYPES,
  TileFormat,
  TILE_FORMATS
} from '../api/maps-api-common';
import {
  ClassicCredentials,
  CloudNativeCredentials,
  Credentials,
  getDefaultCredentials
} from '../config';
import {CompositeLayerProps, LayerProps} from 'modules/core/src/types/layer-props';
import {ChangeFlags} from 'modules/core/src/lib/layer-state';
import {FetchLayerDataResult} from '../api/maps-v3-client';
import {assert} from '../utils';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // (Enum (MAP_TYPES), required)
  type: null,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true},
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
  columns: {type: 'array', value: null}
};

export interface CartoLayerProps<DataT = any> extends CompositeLayerProps<DataT> {
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
   * Use to override the default data format.
   *
   * Only supported when apiVersion is `API_VERSIONS.V3`.
   *
   * Possible values are: `FORMATS.GEOJSON`, `FORMATS.JSON` and `FORMATS.TILEJSON`.
   */
  format?: Format;

  /**
   * Use to override the default tile data format.
   *
   * Only supported when apiVersion is `API_VERSIONS.V3` and format is `FORMATS.TILEJSON`.
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
   * By default the Error is thrown.
   */
  onDataError?: (err: unknown) => void;

  clientId?: string;
}

export default class CartoLayer<DataT = any> extends CompositeLayer<CartoLayerProps<DataT>> {
  static layerName = 'CartoLayer';
  static defaultProps = defaultProps as any;

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

  updateState({
    props,
    oldProps,
    changeFlags
  }: {
    props: CartoLayerProps;
    oldProps: CartoLayerProps;
    context: any;
    changeFlags: ChangeFlags;
  }): void {
    this._checkProps(props);
    const shouldUpdateData =
      changeFlags.dataChanged ||
      props.connection !== oldProps.connection ||
      props.geoColumn !== oldProps.geoColumn ||
      props.format !== oldProps.format ||
      props.formatTiles !== oldProps.formatTiles ||
      props.type !== oldProps.type ||
      JSON.stringify(props.columns) !== JSON.stringify(oldProps.columns) ||
      JSON.stringify(props.credentials) !== JSON.stringify(oldProps.credentials);

    if (shouldUpdateData) {
      this.setState({data: null, apiVersion: null});
      // eslint-disable-next-line @typescript-eslint/no-floating-promises
      this._updateData();
    }
  }

  async _updateData(): Promise<void> {
    try {
      const {type, data: source, clientId, credentials, connection, ...rest} = this.props;
      const localConfig = {...getDefaultCredentials(), ...credentials};
      const {apiVersion} = localConfig;

      let result: FetchLayerDataResult;
      if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
        result = {
          data: await getDataV2({type, source, credentials: credentials as ClassicCredentials})
        };
      } else {
        result = await fetchLayerData({
          type,
          source,
          clientId,
          credentials: credentials as CloudNativeCredentials,
          connection: connection as string,
          ...rest
        });
      }

      this.setState({...result, apiVersion});

      this.props.onDataLoad?.(result.data, {
        propName: 'data',
        layer: this
      });
    } catch (err) {
      if (this.props.onDataError) {
        this.props.onDataError(err as Error);
      } else {
        throw err;
      }
    }
  }

  _getSubLayerAndProps(): [any, LayerProps] {
    assert(this.state);

    const {data, format, apiVersion} = this.state;

    const {uniqueIdProperty} = defaultProps;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {data: _notUsed, ...propsNoData} = this.props;
    const props = {uniqueIdProperty, ...propsNoData};

    if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
      return [MVTLayer, props];
    }

    if (format === FORMATS.TILEJSON) {
      /* global URL */
      const tileUrl = new URL(data.tiles[0]);

      props.formatTiles =
        props.formatTiles ||
        (tileUrl.searchParams.get('formatTiles') as TileFormat) ||
        TILE_FORMATS.MVT;

      return props.formatTiles === TILE_FORMATS.MVT ? [MVTLayer, props] : [CartoTileLayer, props];
    }

    // It's a geojson layer
    return [GeoJsonLayer, props];
  }

  renderLayers(): Layer | null {
    assert(this.state);

    const {data} = this.state;

    if (!data) return null;

    const {updateTriggers} = this.props;

    const [layer, props] = this._getSubLayerAndProps();

    // eslint-disable-next-line new-cap
    return new layer(
      props,
      this.getSubLayerProps({
        id: `carto-${layer.layerName}`,
        data,
        updateTriggers
      })
    );
  }
}
