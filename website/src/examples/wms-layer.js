import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'website-examples/wms/app';
import styled from 'styled-components';

import {makeExample} from '../components';

const DemoContainer = styled.div`
  .selected-feature-info {
    position: absolute;
    z-index: 10;
    font-size: 12px;
    line-height: 1.25;
    background: #fff;
    box-shadow: 2px 2px 4px rgb(0 0 0 / 20%);
    padding: 8px;
    max-width: 320px;
    white-space: pre-wrap;
  }
`;

const SERVICES = {
  'Terrestris (OpenStreetMap)': {
    serviceUrl: `https://ows.terrestris.de/osm/service`,
    defaultLayers: ['OSM-WMS'],
    viewState: {
      longitude: -122.4,
      latitude: 37.74,
      zoom: 9
    }
  },
  'Canadian Weather': {
    serviceUrl: 'https://geo.weather.gc.ca/geomet',
    defaultLayers: ['GDPS.ETA_TT'],
    viewState: {
      longitude: -100,
      latitude: 55,
      zoom: 3
    },
    opacity: 0.5
  }
};

class WMSDemo extends Component {
  static title = 'Web Map Service (WMS)';

  static code = `${GITHUB_TREE}/examples/website/wms`;

  static parameters = {
    service: {
      displayName: 'Service',
      type: 'select',
      options: Object.keys(SERVICES),
      value: Object.keys(SERVICES)[0]
    },
    layer: {displayName: 'Layer', type: 'select', options: [], value: ''}
  };

  static renderInfo(meta) {
    if (!meta.title) {
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    }
    const {
      title,
      raw: {Service}
    } = meta;
    return (
      <div>
        <p>{title}</p>
        <p>{Service.Abstract}</p>
        <p>
          <a title={Service.AccessConstraints}>Attributions</a>
        </p>
      </div>
    );
  }

  componentDidMount() {
    const service = SERVICES[this.props.params.service.value];
    this.setState({service, layers: {}});
  }

  componentDidUpdate(prevProps) {
    if (prevProps.params.service.value !== this.props.params.service.value) {
      const service = SERVICES[this.props.params.service.value];
      // Clear metadata and layers dropdown
      this.props.onStateChange({title: ''});
      this.props.useParam({
        ...this.props.params,
        layer: WMSDemo.parameters.layer
      });
      this.setState({service, layers: {}});
    }
  }

  _onMetadataLoad = meta => {
    this.props.onStateChange(meta);

    const layers = getLayerNames(meta.raw.Capability.Layer.Layer);
    this.setState({layers});

    this.props.useParam({
      ...this.props.params,
      layer: {
        ...WMSDemo.parameters.layer,
        options: Object.keys(layers)
      }
    });
  };

  render() {
    // eslint-disable-next-line no-unused-vars
    const {params, ...otherProps} = this.props;
    const {service, layers} = this.state || {};

    if (!service) {
      return null;
    }

    return (
      <DemoContainer>
        <App
          {...otherProps}
          serviceUrl={service.serviceUrl}
          initialViewState={service.viewState}
          layers={layers[params.layer.value] || service.defaultLayers}
          onMetadataLoad={this._onMetadataLoad}
        />
      </DemoContainer>
    );
  }
}

export default makeExample(WMSDemo);

function getLayerNames(layers, output = {}) {
  if (Array.isArray(layers)) {
    for (const l of layers) {
      getLayerNames(l, output);
    }
  } else if (layers.Layer) {
    getLayerNames(layers.Layer, output);
  } else {
    output[layers.Title] = [layers.Name];
  }
  return output;
}
