/* global document, window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {GeoJsonLayer, MapView, MapController} from 'deck.gl';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/geojson/vancouver-blocks.json'; // eslint-disable-line

const LIGHT_SETTINGS = {
  lightsPosition: [-125, 50.5, 5000, -122.8, 48.5, 8000],
  ambientRatio: 0.2,
  diffuseRatio: 0.5,
  specularRatio: 0.3,
  lightsStrength: [1.0, 0.0, 2.0, 0.0],
  numberOfLights: 2
};

const INITIAL_VIEW_STATE = {
  latitude: 49.254,
  longitude: -123.13,
  zoom: 11,
  maxZoom: 16,
  pitch: 45,
  bearing: 0
};

const DEFAULT_COLOR_SCALE = r => [r * 255, 140, 200 * (1 - r)];

export class App extends Component {
  static get defaultViewport() {
    return null;
  }

  constructor(props) {
    super(props);
    this.state = {viewState: INITIAL_VIEW_STATE};
  }

  render() {
    const {data = DATA_URL, colorScale = DEFAULT_COLOR_SCALE} = this.props;

    const layer = new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      extruded: true,
      wireframe: true,
      fp64: true,
      getElevation: f => Math.sqrt(f.properties.valuePerSqm) * 10,
      getFillColor: f => colorScale(f.properties.growth),
      getLineColor: f => [255, 255, 255],
      lightSettings: LIGHT_SETTINGS,
      pickable: Boolean(this.props.onHover),
      onHover: this.props.onHover
    });

    return (
      <DeckGL
        views={new MapView({id: 'map'})}
        viewState={this.state.viewState}
        controller={MapController}
        onViewStateChange={({viewState}) => this.setState({viewState})}
        layers={[layer]}
      >
        <StaticMap
          viewId="map"
          reuseMap
          mapboxApiAccessToken={MAPBOX_TOKEN}
          {...this.state.viewState}
        />
      </DeckGL>
    );
  }
}

if (!window.website) {
  render(<App />, document.body.appendChild(document.createElement('div')));
}
