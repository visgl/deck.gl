/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {IconLayer} from 'deck.gl';

import IconClusterLayer from './icon-cluster-layer';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/icon/meteorites.json'; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -35,
  latitude: 36.7,
  zoom: 1.8,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

/* eslint-disable react/no-deprecated */
class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      x: 0,
      y: 0,
      hoveredItems: null,
      expanded: false
    };
  }

  _renderLayers() {
    const {
      data = DATA_URL,
      iconMapping = 'data/location-icon-mapping.json',
      iconAtlas = 'data/location-icon-atlas.png',
      showCluster = true,
      viewState,
      onHover,
      onClick
    } = this.props;

    const layerProps = {
      data,
      pickable: Boolean(onHover || onClick),
      getPosition: d => d.coordinates,
      iconAtlas,
      iconMapping,
      onHover,
      onClick,
      sizeScale: 60
    };

    const size = viewState ? Math.min(Math.pow(1.5, viewState.zoom - 10), 1) : 0.1;

    const layer = showCluster
      ? new IconClusterLayer({...layerProps, id: 'icon-cluster'})
      : new IconLayer({
          ...layerProps,
          id: 'icon',
          getIcon: d => 'marker',
          getSize: size
        });

    return [layer];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            preventStyleDiffing={true}
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

// NOTE: EXPORTS FOR DECK.GL WEBSITE DEMO LAUNCHER - CAN BE REMOVED IN APPS
export {App, INITIAL_VIEW_STATE};

if (!window.demoLauncherActive) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
