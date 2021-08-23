import {CompositeLayer, log} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getData, getDataV2, API_VERSIONS} from '../api';
import {MAP_TYPES} from '../api/maps-api-common';
import {getDefaultCredentials} from '../config';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // (Enum (MAP_TYPES), required)
  type: null,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true},

  // override carto credentials for the layer, set to null to read from default
  credentials: null,

  /*********************/
  /* API v3 PARAMETERS */
  /**********************/
  // (String, required): connection name at CARTO platform
  connection: null,

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
      JSON.stringify(props.columns) !== JSON.stringify(oldProps.columns) ||
      props.type !== oldProps.type ||
      JSON.stringify(props.credentials) !== JSON.stringify(oldProps.credentials);

    if (shouldUpdateData) {
      this.setState({data: null, apiVersion: null});
      this._updateData();
    }
  }

  async _updateData() {
    try {
      const {type, data: source, connection, credentials, geoColumn, columns} = this.props;
      const localConfig = {...getDefaultCredentials(), ...credentials};
      const {apiVersion} = localConfig;

      let data;

      if (apiVersion === API_VERSIONS.V3) {
        data = await getData({
          type,
          source,
          connection,
          credentials,
          geoColumn,
          columns
        });
      } else if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
        data = await getDataV2({type, source, credentials});
      } else {
        log.assert(`Unknow apiVersion ${apiVersion}. Use API_VERSIONS enum.`);
      }

      this.setState({data, apiVersion});
      this.props.onDataLoad(data);
    } catch (err) {
      if (this.props.onDataError) {
        this.props.onDataError(err);
      } else {
        throw err;
      }
    }
  }

  renderLayers() {
    const {data, apiVersion} = this.state;
    const {type} = this.props;

    if (!data) return null;

    const {updateTriggers} = this.props;

    let layer;

    if (
      apiVersion === API_VERSIONS.V1 ||
      apiVersion === API_VERSIONS.V2 ||
      type === MAP_TYPES.TILESET
    ) {
      layer = MVTLayer;
    } else {
      layer = GeoJsonLayer;
    }

    const props = {...this.props};
    delete props.data;

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
