import {CompositeLayer, log} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMapCartoCloudNative, getMapCarto, CONNECTIONS, FORMATS, MODE } from '../api';
import {MAP_TYPES, PROVIDERS} from '../api/maps-api-common';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // carto credentials, set to null to read from default
  credentials: null,
  // mode should carto or carto-cloud-native
  mode: null,
  // (String {bigquery, snowflake,redshift, postgres}, required)
  provider: null,
  // (String, required): connection name at CARTO platform
  connection: null,
  // (String {table, sql, tileset}, required)
  type: null,
  // sublayer used to render. Any deck.gl layer or null to autodetect
  subLayer: null,
  // (String {geojson, json, tileset}, optional). Desired data format. By default, it's guessed automaticaly
  format: null,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true}
};

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      data: null,
      SubLayer: null
    };
  }

  get isLoaded() {
    return this.getSubLayers().length > 0 && super.isLoaded;
  }

  _checkProps(props){
    const {mode, provider, type, data: source, connection, credentials, format} = this.props;

    if (!Object.values(MODE).includes(mode)) {
      log.assert(`Unknow mode ${mode}. Possible values are ${Object.values(MODE).toString()}`);
    }

    if (!Object.values(MAP_TYPES).includes(type)) {
      log.assert(`Unknow mode ${type}. Possible values are ${Object.values(MAP_TYPES).toString()}`);
    }

    if (!Object.values(PROVIDERS).includes(provider)) {
      log.assert(`Unknow mode ${provider}. Possible values are ${Object.values(PROVIDERS).toString()}`);
    }
  
    if (mode === MODE.CARTO && connection === CONNECTIONS.BIGQUERY && type !== MAP_TYPES.TILESET){
      log.assert(`Only ${MAP_TYPES.TILESET} supported for mode ${mode} and connection ${connection}`);
    }

    if (mode === MODE.CARTO && connection === CONNECTIONS.CARTO && type !== MAP_TYPES.SQL){
      log.assert(`Only ${MAP_TYPES.SQL} supported for mode ${mode} and connection ${connection}`);
    }
  }

  updateState({props, oldProps, changeFlags}) {
    this._checkProps(props)
    const shouldUpdateData = changeFlags.dataChanged ||
      props.provider !== oldProps.provider ||
      props.connection !== oldProps.connection ||
      props.type !== oldProps.type ||
      JSON.stringify(props.credentials) !== JSON.stringify(oldProps.credentials);

    if (shouldUpdateData) {
      this.setState({data: null, SubLayer: null});
      this._updateData();
    }
  }

  async _updateData() {
    try {
      const {mode, provider, type, data: source, connection, credentials, format} = this.props;

      let data, mapFormat;

      if (mode === MODE.CARTO_CLOUD_NATIVE) {
        [data, mapFormat] = await getMapCartoCloudNative({provider, type, source, connection, credentials, format});
      } else if (mode === MODE.CARTO) {
        [data, mapFormat] = await getMapCarto({connection, source, credentials});
      } else {
        log.assert(`Unknow mode ${mode}. Possible values are ${Object.values(MODE).toString()}`);
      }

      const SubLayer = this.state.SubLayer || this.props.subLayer || getSublayerFromMapFormat(mapFormat);

      this.setState({SubLayer, data});
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
    const {data, SubLayer} = this.state;
    if (!data) return null;

    const {updateTriggers} = this.props;
    const props = {...this.props};
    delete props.data;
 
    return new SubLayer(
      props,
      this.getSubLayerProps({
        id: `carto-${SubLayer.layerName}`,
        data,
        updateTriggers
      })
    );

  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;

function getSublayerFromMapFormat(format) {
  switch (format) {
    case 'tilejson':
      return MVTLayer;
    case 'geojson':
      return GeoJsonLayer;
    default:
      return null;
  }
}
