/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, ArcLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

import {MapboxLayer} from '@deck.gl/mapbox';

import {mapboxBuildingLayer, deckPoiLayer, deckRouteLayer} from './layers';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -74.012,
  latitude: 40.705,
  zoom: 15.5,
  bearing: -20,
  pitch: 45
};

function getFirstTextLayerId(style) {
  const layers = style.layers;
  // Find the index of the first symbol (i.e. label) layer in the map style
  let firstSymbolId;
  for (let i = 0; i < layers.length; i++) {
    if (layers[i].type === 'symbol') {
      firstSymbolId = layers[i].id;
      break;
    }
  }
  return firstSymbolId;
}

/* eslint-disable react/no-deprecated */
export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this._onWebGLInitialized = this._onWebGLInitialized.bind(this);
    this._onMapLoad = this._onMapLoad.bind(this);
  }

  _renderLayers() {
    return [new ScatterplotLayer(deckPoiLayer), new ArcLayer(deckRouteLayer)];
  }

  _onWebGLInitialized(gl) {
    this.setState({gl});
  }

  _onMapLoad() {
    const map = this._map;
    const deck = this._deck;

    map.addLayer(mapboxBuildingLayer);
    map.addLayer(new MapboxLayer({id: 'deckgl-pois', deck}), getFirstTextLayerId(map.getStyle()));
    map.addLayer(new MapboxLayer({id: 'deckgl-tour-route', deck}));
  }

  render() {
    const {gl} = this.state;

    return (
      <DeckGL
        ref={ref => {
          this._deck = ref && ref.deck;
        }}
        layers={this._renderLayers()}
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        onWebGLInitialized={this._onWebGLInitialized}
      >
        {gl && (
          <StaticMap
            ref={ref => {
              this._map = ref && ref.getMap();
            }}
            gl={gl}
            mapStyle="mapbox://styles/mapbox/light-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
            onLoad={this._onMapLoad}
          />
        )}
      </DeckGL>
    );
  }
}

render(<App />, document.body.appendChild(document.createElement('div')));
