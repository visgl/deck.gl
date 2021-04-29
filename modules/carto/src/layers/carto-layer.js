import {CompositeLayer, log} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMapCartoCloudNative, getMapCarto, FORMATS, MODES} from '../api';
import {MAP_TYPES, PROVIDERS} from '../api/maps-api-common';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // mode should carto or carto-cloud-native
  mode: null,
  // (String {bigquery, snowflake,redshift, postgres}, required)
  provider: null,
  // (String, required): connection name at CARTO platform
  connection: null,
  // (String {table, sql, tileset}, required)
  type: null,
  // override carto config for the layer, set to null to read from default
  config: null,
  // sublayer used to render. Any deck.gl layer or null to autodetect
  renderSubLayer: null,
  // (String {geojson, json, tileset}, optional). Desired data format. By default, it's guessed automaticaly
  format: null,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true}
};

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      data: null,
      renderSubLayer: null
    };
  }

  get isLoaded() {
    return this.getSubLayers().length > 0 && super.isLoaded;
  }

  _checkProps(props) {
    const {mode, provider, type, format} = this.props;

    log.assert(
      Object.values(MODES).includes(mode),
      `Invalid mode ${mode}. Possible values are ${Object.values(MODES).toString()}`
    );

    if (mode === MODES.CARTO) {
      log.assert(!provider, `Provider not suport for mode ${mode}`);
      log.assert(!format, `Format not suport for mode ${mode}`);
      log.assert(
        type !== MAP_TYPES.TABLE,
        `Use type ${MAP_TYPES.SQL} or ${MAP_TYPES.TILESET} for mode ${mode}`
      );
    } else if (mode === MODES.CARTO_CLOUD_NATIVE) {
      log.assert(
        Object.values(MAP_TYPES).includes(type),
        `Invalid type ${type}. Possible values are ${Object.values(MAP_TYPES).toString()}`
      );
      log.assert(
        Object.values(PROVIDERS).includes(provider),
        `Invalid provider ${provider}. Possible values are ${Object.values(PROVIDERS).toString()}`
      );
      log.assert(
        !format || Object.values(FORMATS).includes(format),
        `Invalid format ${format}. Possible values are ${Object.values(FORMATS).toString()}`
      );
    }
  }

  updateState({props, oldProps, changeFlags}) {
    this._checkProps(props);
    const shouldUpdateData =
      changeFlags.dataChanged ||
      props.provider !== oldProps.provider ||
      props.connection !== oldProps.connection ||
      props.type !== oldProps.type ||
      JSON.stringify(props.config) !== JSON.stringify(oldProps.config);

    if (shouldUpdateData) {
      this.setState({data: null, renderSubLayer: null});
      this._updateData();
    }
  }

  async _updateData() {
    try {
      const {mode, provider, type, data: source, connection, config, format} = this.props;

      let data;
      let mapFormat;

      if (mode === MODES.CARTO_CLOUD_NATIVE) {
        [data, mapFormat] = await getMapCartoCloudNative({
          provider,
          type,
          source,
          connection,
          config,
          format
        });
      } else if (mode === MODES.CARTO) {
        [data, mapFormat] = await getMapCarto({type, source, config});
      } else {
        log.assert(`Unknow mode ${mode}. Possible values are ${Object.values(MODES).toString()}`);
      }

      const renderSubLayer = this.state.renderSubLayer || getRenderSubLayerFromMapFormat(mapFormat);

      this.setState({renderSubLayer, data});
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
    const {data, renderSubLayer} = this.state;
    if (!data) return null;

    const {updateTriggers} = this.props;
    const props = {...this.props};
    delete props.data;

    // eslint-disable-next-line new-cap
    return new renderSubLayer(
      props,
      this.getSubLayerProps({
        id: `carto-${renderSubLayer.layerName}`,
        data,
        updateTriggers
      })
    );
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;

function getRenderSubLayerFromMapFormat(format) {
  switch (format) {
    case 'tilejson':
      return MVTLayer;
    case 'geojson':
      return GeoJsonLayer;
    default:
      return null;
  }
}
