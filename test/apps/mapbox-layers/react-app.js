/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {ScatterplotLayer, ArcLayer} from 'deck.gl';
import {StaticMap} from 'react-map-gl';

import {MapboxLayer} from '@deck.gl/mapbox';

const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/pois.json'; //eslint-disable-line

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const INITIAL_VIEW_STATE = {
  longitude: -74.012,
  latitude: 40.705,
  zoom: 15.5,
  bearing: -20,
  pitch: 45
};

const mapboxBuildingLayer = {
  id: '3d-buildings',
  source: 'composite',
  'source-layer': 'building',
  filter: ['==', 'extrude', 'true'],
  type: 'fill-extrusion',
  minzoom: 14,
  paint: {
    'fill-extrusion-color': '#ccc',
    'fill-extrusion-height': ['get', 'height']
  }
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
    return [
      new ScatterplotLayer({
        id: 'deckgl-pois',
        data: DATA_URL,
        pickable: true,
        autoHighlight: true,
        radiusMinPixels: 0.25,
        getPosition: d => d.coordinates,
        getColor: [255, 180],
        getRadius: 10
      }),
      new ArcLayer({
        id: 'deckgl-tour-route',
        data: [
          [[-73.9873197, 40.758895], [-73.9808623, 40.7587402]],
          [[-73.9808623, 40.7587402], [-73.9781814, 40.7584653]],
          [[-73.9781814, 40.7584653], [-73.982352, 40.7531874]],
          [[-73.982352, 40.7531874], [-73.9756172, 40.7516171]],
          [[-73.9756172, 40.7516171], [-73.9775753, 40.7527895]],
          [[-73.9775753, 40.7527895], [-74.0134401, 40.7115375]],
          [[-74.0134401, 40.7115375], [-74.0134535, 40.7068758]],
          [[-74.0134535, 40.7068758], [-74.0156334, 40.7055648]],
          [[-74.0156334, 40.7055648], [-74.0153384, 40.7013948]]
        ],
        getSourcePosition: d => d[0],
        getTargetPosition: d => d[1],
        getSourceColor: [0, 128, 255],
        getTargetColor: [255, 0, 128],
        getStrokeWidth: 4
      })
    ];
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
