import {CompositeLayer} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
// import {GeoJsonLayer} from '@deck.gl/layers';

import {MapsApiClient} from './maps';

const defaultProps = {
  // source-props
  source: null,
  connection: {
    username: 'public',
    apiKey: 'default_public',
    serverUrlTemplate: 'https://{user}.carto.com'
  }
  // style-props
  // ...GeoJsonLayer.defaultProps
};

export default class CARTOLayer extends CompositeLayer {
  initializeState() {
    // super.initializeState();

    const mapsClient = new MapsApiClient(this.props.connection);
    const mapInstance = mapsClient.instantiateMap({source: this.props.source});

    this.state = {
      mapInstance
    };
  }

  updateState({props, oldProps, changeFlags}) {
    if (changeFlags.dataChanged) {
      //   const {data, getHexagons} = props;
      //   this.setState({polygons});
    }
  }

  renderLayers() {
    const props = {
      ...this._getSourceProps(),
      updateTriggers: {...this.props.updateTriggers}
    };

    return [new MVTLayer(props)];
  }

  // #region private

  _getSourceProps() {
    const sourceProps = {
      data: this._getUrlsFromMapInstance()
    };

    return sourceProps;
  }

  _getUrlsFromMapInstance() {
    // TODO MOCK
    return [
      'https://cartocdn-gusc-a.global.ssl.fastly.net/public/api/v1/map/2d7667b82aaa2c8a56c6326a079cef31:1537891466828/{z}/{x}/{y}.mvt?api_key=default_public',
      'https://cartocdn-gusc-b.global.ssl.fastly.net/public/api/v1/map/2d7667b82aaa2c8a56c6326a079cef31:1537891466828/{z}/{x}/{y}.mvt?api_key=default_public',
      'https://cartocdn-gusc-c.global.ssl.fastly.net/public/api/v1/map/2d7667b82aaa2c8a56c6326a079cef31:1537891466828/{z}/{x}/{y}.mvt?api_key=default_public',
      'https://cartocdn-gusc-d.global.ssl.fastly.net/public/api/v1/map/2d7667b82aaa2c8a56c6326a079cef31:1537891466828/{z}/{x}/{y}.mvt?api_key=default_public'
    ];

    // // real instance
    // const urlData = this.state.mapInstance.metadata.url.vector;
    // let urlTemplate = [urlData.urlTemplate];

    // // if subdomains exist, then a collection of urls will be used for better performance
    // if (urlData.subdomains.length) {
    //   urlTemplate = urlData.subdomains.map((subdomain) =>
    //     urlData.urlTemplate.replace('{s}', subdomain)
    //   );
    // }
    // return urlTemplate;
  }

  // #endregion
}

CARTOLayer.defaultProps = defaultProps;
CARTOLayer.layerName = 'CARTOLayer';
