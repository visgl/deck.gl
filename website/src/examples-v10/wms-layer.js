// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {Component} from 'react';
import {GITHUB_TREE} from '../constants/defaults';
import App from 'v10-website-examples/wms/app';
import styled from 'styled-components';

import {makeExample} from '../components';

/** Provides demo container for the example. */
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

/** Provides services for the example. */
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

/** Connects the Arrow wmsdemo example to the website controls. */
class WMSDemo extends Component {
  /** Title shown above the example controls. */
  static title = 'Web Map Service (WMS)';

  /** Enables graphics backend selection for this demo. */
  static hasDeviceTabs = true;

  /** Source directory for this Arrow example. */
  static code = `${GITHUB_TREE}/examples-v10/website/wms`;

  /** Interactive controls and their initial values. */
  static parameters = {
    service: {
      displayName: 'Service',
      type: 'select',
      options: Object.keys(SERVICES),
      value: Object.keys(SERVICES)[0]
    },
    layer: {displayName: 'Layer', type: 'select', options: [], value: ''}
  };

  /** Renders the description, legend, and data summary. */
  static renderInfo(meta) {
    if (!meta.title) {
      return (
        <div>
          <p>Loading...</p>
        </div>
      );
    }
    /** Provides title, abstract, access constraints for the example. */
    const {title, abstract, accessConstraints} = meta;
    return (
      <div>
        <p>{title}</p>
        <p>{abstract}</p>
        <p>
          <a title={accessConstraints}>Attributions</a>
        </p>
      </div>
    );
  }

  /** Initializes the demo after its container mounts. */
  componentDidMount() {
    /** Provides service for the example. */
    const service = SERVICES[this.props.params.service.value];
    this.setState({service, layers: {}});
  }

  /** Updates the demo when its inputs change. */
  componentDidUpdate(prevProps) {
    if (prevProps.params.service.value !== this.props.params.service.value) {
      /** Provides service for the example. */
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

  /** Manages on metadata load for the example. */
  _onMetadataLoad = meta => {
    this.props.onStateChange(meta);

    /** Provides layers for the example. */
    const layers = getLayerNames(meta.layers);
    this.setState({layers});

    this.props.useParam({
      ...this.props.params,
      layer: {
        ...WMSDemo.parameters.layer,
        options: Object.keys(layers)
      }
    });
  };

  /** Renders the Arrow demo with the current controls and data. */
  render() {
    // eslint-disable-next-line no-unused-vars
    /** Provides params, ...other props for the example. */
    const {params, ...otherProps} = this.props;
    /** Provides service, layers for the example. */
    const {service, layers} = this.state || {};

    if (!service) {
      return null;
    }

    return (
      <DemoContainer>
        <App
          {...otherProps}
          key={this.props.device?.type}
          device={this.props.device}
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
  } else if (layers.layers) {
    getLayerNames(layers.layers, output);
  } else {
    output[layers.title] = [layers.name];
  }
  return output;
}
