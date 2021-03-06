import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import {getMapMetadata, getMapData, CONNECTIONS} from '../api/maps-api-client';

const defaultProps = {
  // data resource to load. table name, sql query or tileset name.
  data: null,
  // carto credentials, set to null to read from default
  credentials: null,
  // table | sql | tileset
  type: null,
  // sublayer used to render. Any deck.gl layer or null to autodetect
  subLayer: null,
  // bigquery | snowflake | redshift | carto
  connection: null,
  // 50MB is the threshold
  tilesetThresold: 50 * 1024 * 1024,
  onDataLoad: {type: 'function', value: data => {}, compare: false},
  onDataError: {type: 'function', value: null, compare: false, optional: true}
};

function guessSubLayerFromMetadata(metadata, tilesetThresold) {

  if (metadata.size === undefined) {
    throw Error('Undefined response size');
  }

  if ((!metadata.json && !metadata.geojson) || metadata.size >= tilesetThresold) {
    if (metadata.tilejson === undefined) {
      // Tileset is required
      throw Error('This source is too large, a tileset is required for visualization');
    }

    return MVTLayer;
  }
  
  return GeoJsonLayer;
}

function getSublayerFromFormat(format) {
  if (format === 'tilejson') {
    return MVTLayer;
  }
  else if (format === 'geojson') {
    return GeoJsonLayer;
  }

  return null;
}

function getFormatFromMetadata(metadata, tilesetThresold) {
  
  if (metadata.size === undefined) {
    throw Error('Undefined response size');
  }

  if (metadata.geojson && !metadata.geojson.error && metadata.size <= tilesetThresold)
    return 'geojson';
  else if (metadata.json && !metadata.json.error && metadata.size <= tilesetThresold)
    return 'json';
  else if (metadata.tilejson && !metadata.tilejson.error)
    return 'tilejson';
  
  throw new Error('Not available format to render this layer');
  
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
        props.connection !== oldProps.connection ||
        props.type !== oldProps.type ||
        JSON.stringify(props.credentials) !== JSON.stringify(oldProps.credentials);

    if (shouldUpdateData) {
      this.setState({data: null, SubLayer: null});
      this._updateData();
    }
  }

  async _getFormat(){
    const {connection, type} = this.props;

    if (type === 'tileset' || type === 'table') {
      const metadata = await getMapMetadata({...this.props, source: this.props.data});
      return getFormatFromMetadata(metadata, this.props.tilesetThresold);
    }
    else if (type === 'sql') {
      // No autoguessing for SQL.
      return connection === CONNECTIONS.CARTO ? 'tilejson' : 'geojson';
    }
    throw new Error('Unexpected type');
  }

  async _updateData() {
    try {

      let SubLayer = this.state.SubLayer || this.props.subLayer;
      let format;
      
      if (!SubLayer) {
        format =  await this._getFormat();
        SubLayer = getSublayerFromFormat(format);
      } else {
        format = 'json';
      }

      let data = await getMapData({...this.props, format, source: this.props.data});

      if (format === 'json') {
        data = data.rows;
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
