import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMap, CONNECTIONS, MAP_TYPES, MODE_TYPES, FORMATS, getTileJSON} from '../api/maps-api-client';
import {getMapsVersion} from '../config';

const defaultProps = {
  // (String, required): data resource to load. table name, sql query or tileset name.
  data: null,
  // carto credentials, set to null to read from default
  credentials: null,
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

    // const {mode, type} = this.props;
    // checkAllowedProps({mode, type});
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

      let data;
      let SubLayer;

      if (mode === MODE_TYPES.CARTO)  {
        if (type === MAP_TYPES.SQL || type == MAP_TYPES.TILESET) {
          data = await this.updateSQLTileJSON();
        }

        if (type === MAP_TYPES.TILESET) {
          data = await this.updateBQTilerTileJSON();
        }

        SubLayer = this.state.SubLayer || this.props.subLayer || getSublayerFromMapFormat(FORMATS.TILEJSON);
      }

      if (mode === MODE_TYPES.CARTO_CLOUD_NATIVE) {
        const [mapData, mapFormat] = await getMap({provider, type, source, connection, credentials, format});
        data = mapData;
        SubLayer = this.state.SubLayer || this.props.subLayer || getSublayerFromMapFormat(mapFormat);
      }

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

   async updateSQLTileJSON() {
    const {data, bufferSize, tileExtent, credentials} = this.props;
    const version = getMapsVersion(credentials);
    const isSQL = data.search(' ') > -1;

    switch (version) {
      case 'v1':
        const sql = isSQL ? data : `SELECT * FROM ${data}`;

        // Map config v1
        const mapConfig = {
          version: '1.3.1',
          buffersize: {
            mvt: bufferSize
          },
          layers: [
            {
              type: 'mapnik',
              options: {
                sql: sql.trim(),
                vector_extent: tileExtent
              }
            }
          ]
        };

        return await getTileJSON({mapConfig, credentials});

      case 'v2':
        return await getTileJSON({
          connection: CONNECTIONS.CARTO,
          source: data,
          type: isSQL ? MAP_TYPES.SQL : MAP_TYPES.TABLE,
          credentials
        });

      default:
        throw new Error(`Cannot build MapConfig for unmatching version ${version}`);
    }
  }

  async updateBQTilerTileJSON() {
    const {credentials, data} = this.props;

    return await getTileJSON({
      connection: CONNECTIONS.BIGQUERY,
      type: MAP_TYPES.TILESET,
      source: data,
      credentials
    });
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
    case FORMATS.TILEJSON:
      return MVTLayer;
    case FORMATS.GEOJSON:
      return GeoJsonLayer;
    default:
      return null;
  }
}
