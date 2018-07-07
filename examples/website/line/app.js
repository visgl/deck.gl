/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';
import DeckGL, {LineLayer, ScatterplotLayer} from 'deck.gl';
import GL from 'luma.gl/constants';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data CSV
const DATA_URL = {
  AIRPORTS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/airports.json', // eslint-disable-line
  FLIGHT_PATHS:
    'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/line/heathrow-flights.json' // eslint-disable-line
};

const INITIAL_VIEW_STATE = {
  latitude: 47.65,
  longitude: 7,
  zoom: 4.5,
  maxZoom: 16,
  pitch: 50,
  bearing: 0
};

function getColor(d) {
  const z = d.start[2];
  const r = z / 10000;

  return [255 * (1 - r * 2), 128 * r, 255 * r, 255 * (1 - r)];
}

function getSize(type) {
  if (type.search('major') >= 0) {
    return 100;
  }
  if (type.search('small') >= 0) {
    return 30;
  }
  return 60;
}

class App extends Component {
  _renderLayers() {
    const {
      airports = DATA_URL.AIRPORTS,
      flightPaths = DATA_URL.FLIGHT_PATHS,
      strokeWidth = 3
    } = this.props;

    return [
      new ScatterplotLayer({
        id: 'airports',
        data: airports,
        radiusScale: 20,
        getPosition: d => d.coordinates,
        getColor: [255, 140, 0],
        getRadius: d => getSize(d.type),
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      }),
      new LineLayer({
        id: 'flight-paths',
        data: flightPaths,
        strokeWidth,
        fp64: false,
        getSourcePosition: d => d.start,
        getTargetPosition: d => d.end,
        getColor,
        pickable: Boolean(this.props.onHover),
        onHover: this.props.onHover
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
        parameters={{
          blendFunc: [GL.SRC_ALPHA, GL.ONE, GL.ONE_MINUS_DST_ALPHA, GL.ONE],
          blendEquation: GL.FUNC_ADD
        }}
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
