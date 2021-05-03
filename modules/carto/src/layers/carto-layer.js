import {CompositeLayer, log} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMapCartoCloudNative, getMapCarto, FORMATS, API_VERSIONS} from '../api';
import {MAP_TYPES, PROVIDERS} from '../api/maps-api-common';
import {getConfig} from '../config';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // (String {table, sql, tileset}, required)
  type: null,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true},

  /*********************/
  /* API v3 PARAMETERS */
  /**********************/

  // (String {bigquery, snowflake,redshift, postgres}, required)
  provider: null,
  // (String, required): connection name at CARTO platform
  connection: null,

  // override carto config for the layer, set to null to read from default
  config: null,
  // sublayer used to render. Any deck.gl layer or null to autodetect
  renderSubLayer: null,
  // (String {geojson, json, tileset}, optional). Desired data format. By default, it's guessed automaticaly
  format: null
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
    const {provider, type, format, config} = this.props;
    const localConfig = {...getConfig(), ...config};
    const {apiVersion} = localConfig;

    log.assert(
      Object.values(API_VERSIONS).includes(apiVersion),
      `Invalid apiVersion ${apiVersion}. Possible values are ${Object.values(
        API_VERSIONS
      ).toString()}`
    );

    if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
      log.assert(!provider, `Provider not suport for apiVersion ${apiVersion}`);
      log.assert(!format, `Format not suport for apiVersion ${apiVersion}`);
      log.assert(
        type !== MAP_TYPES.TABLE,
        `Use type ${MAP_TYPES.SQL} or ${MAP_TYPES.TILESET} for apiVersion ${apiVersion}`
      );
    } else if (apiVersion === API_VERSIONS.V3) {
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
      const {provider, type, data: source, connection, config, format} = this.props;
      const localConfig = {...getConfig(), ...config};
      const {apiVersion} = localConfig;

      let data;
      let mapFormat;

      if (apiVersion === API_VERSIONS.V3) {
        [data, mapFormat] = await getMapCartoCloudNative({
          provider,
          type,
          source,
          connection,
          config,
          format
        });
      } else if (apiVersion === API_VERSIONS.V1 || apiVersion === API_VERSIONS.V2) {
        [data, mapFormat] = await getMapCarto({type, source, config});
      } else {
        log.assert(
          `Unknow apiVersion ${apiVersion}. Possible values are ${Object.values(
            API_VERSIONS
          ).toString()}`
        );
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
