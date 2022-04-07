import {CompositeLayer, log} from '@deck.gl/core';
import CartoTileLayer from './carto-tile-layer';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {fetchLayerData, getDataV2, API_VERSIONS} from '../api';
import {FORMATS, MAP_TYPES, TILE_FORMATS} from '../api/maps-api-common';
import {getDefaultCredentials} from '../config';

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

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      data: null,
      apiVersion: null
    };
  }

  get isLoaded() {
    return this.getSubLayers().length > 0 && super.isLoaded;
  }

  _checkProps(props) {
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
      if (type !== MAP_TYPES.TABLE) {
        log.assert(!geoColumn, `geoColumn prop is only supported for type ${MAP_TYPES.TABLE}`);
        log.assert(!columns, `columns prop is only supported for type ${MAP_TYPES.TABLE}`);
      }
      if (columns) {
        log.assert(Array.isArray(columns), 'columns prop must be an Array');
      }
    }
  }

  updateState({props, oldProps, changeFlags}) {
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
      this._updateData();
    }
  }

  async _updateData() {
    try {
      const {type, data: source, clientId, credentials, ...rest} = this.props;
      const localConfig = {...getDefaultCredentials(), ...credentials};
      const {apiVersion} = localConfig;

      let result;
      if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
        result = {data: await getDataV2({type, source, credentials})};
      } else {
        result = await fetchLayerData({type, source, clientId, credentials, ...rest});
      }

      this.setState({...result, apiVersion});
      this.props.onDataLoad(result.data);
    } catch (err) {
      if (this.props.onDataError) {
        this.props.onDataError(err);
      } else {
        throw err;
      }
    }
  }

  _getSubLayerAndProps() {
    const {data, format, apiVersion} = this.state;

    const {uniqueIdProperty} = defaultProps;
    const props = {uniqueIdProperty, ...this.props};
    delete props.data;

    if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
      return [MVTLayer, props];
    }

    if (format === FORMATS.TILEJSON) {
      /* global URL */
      const tileUrl = new URL(data.tiles[0]);

      props.formatTiles =
        props.formatTiles || tileUrl.searchParams.get('formatTiles') || TILE_FORMATS.MVT;

      return props.formatTiles === TILE_FORMATS.MVT ? [MVTLayer, props] : [CartoTileLayer, props];
    }

    // It's a geojson layer
    return [GeoJsonLayer, props];
  }

  renderLayers() {
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

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
