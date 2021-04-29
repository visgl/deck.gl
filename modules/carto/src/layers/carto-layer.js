import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMap} from '../api/maps-api-client';

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

function getSublayerFromMapFormat(format) {
  if (format === 'tilejson') {
    return MVTLayer;
  }
  else if (format === 'geojson') {
    return GeoJsonLayer;
  }

  return null;
}
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

  updateState({props, oldProps, changeFlags}) {
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

      if (mode === mode.CARTO_CLOUD_NATIVE) {
        [data, mapFormat] = await getMap({provider, type, source, connection, credentials, format});
      } else {
        data = await this.updateTileJSON();
        mapFormat = FORMATS.TILEJSON
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

  async updateTileJSON() {
    throw new Error('You must use one of the specific carto layers: BQ or SQL type');
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
