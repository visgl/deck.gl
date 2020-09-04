import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {instantiateMap} from './api/maps-api-client';

const defaultProps = {
  // source-props
  data: null,
  credentials: {
    username: 'public',
    apiKey: 'default_public',
    serverUrlTemplate: 'https://{user}.carto.com'
  }
  // style-props
  // ...GeoJsonLayer.defaultProps
};

export default class CartoLayer extends CompositeLayer {
  initializeState() {
    this.state = {
      mapInstance: null
    };
    this._instantiateMap();
  }

  async _instantiateMap() {
    const {data} = this.props;
    const isSQL = data.search(' ') > -1;
    const sql = isSQL ? data : `SELECT * FROM ${data}`;

    const credentials = {...defaultProps.credentials, ...this.props.credentials};
    const instance = await instantiateMap(credentials, sql);
    this.setState({mapInstance: instance});
  }

  renderLayers() {
    if (!this.state.mapInstance) return [];

    const props = {
      ...this.props,
      data: this.state.mapInstance
    };
    return new MVTLayer(props);
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
