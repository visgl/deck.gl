import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {instantiateMap, getTilesFromInstance} from './api/maps-api-client';

const defaultProps = {
  // source-props
  data: null,
  credentials: null
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
    const instance = await instantiateMap(sql, credentials);
    this.setState({mapInstance: instance});
  }

  renderLayers() {
    if (!this.state.mapInstance) return [];

    const props = {
      ...this.props,
      data: getTilesFromInstance(this.state.mapInstance)
    };
    return new MVTLayer(props);
  }
}

CartoLayer.layerName = 'CartoLayer';
CartoLayer.defaultProps = defaultProps;
