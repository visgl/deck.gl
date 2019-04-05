import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import DeckGL, {AmbientLight, DirectionalLight, LightingEffect} from 'deck.gl';
import {PhongMaterial, Texture2D} from '@luma.gl/core';
import GL from '@luma.gl/constants';

import ShadowPolygonLayer from './shadow-polygon-layer';
import ShadowPass from './shadow-pass';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json'; // eslint-disable-line

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const dirLight = new DirectionalLight({
  color: [255, 255, 255],
  intensity: 2.0,
  direction: [10, -20, -30]
});

const lightingEffect = new LightingEffect({ambientLight, dirLight});

const material = new PhongMaterial({
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
});

const landCover = [[[-74.0, 40.7], [-74.02, 40.7], [-74.02, 40.72], [-74.0, 40.72]]];
const shadowColor = [2, 0, 5, 200];

export const INITIAL_VIEW_STATE = {
  longitude: -74.01,
  latitude: 40.706,
  zoom: 15.5,
  pitch: 45,
  bearing: 0
};

export class App extends Component {
  constructor(props) {
    super(props);

    this.state = {};

    this._deck = null;
    this._onWebGLInitialized = this._onWebGLInitialized.bind(this);
    this._onBeforeRender = this._onBeforeRender.bind(this);
  }

  _onWebGLInitialized(gl) {
    const shadowMap = new Texture2D(gl, {
      width: 1,
      height: 1,
      parameters: {
        [GL.TEXTURE_MIN_FILTER]: GL.LINEAR,
        [GL.TEXTURE_MAG_FILTER]: GL.LINEAR,
        [GL.TEXTURE_WRAP_S]: GL.CLAMP_TO_EDGE,
        [GL.TEXTURE_WRAP_T]: GL.CLAMP_TO_EDGE
      }
    });
    this.setState({shadowMap});

    this._shadowPass = new ShadowPass(gl, {target: shadowMap});
  }

  _onBeforeRender({gl}) {
    const viewports = this._deck.viewManager.getViewports();

    // update shadow map
    const {
      deckRenderer,
      layerManager,
      props: {effects}
    } = this._deck;
    const effectProps = deckRenderer.prepareEffects(effects);
    this._shadowPass.render({
      layers: layerManager.getLayers(),
      viewports,
      onViewportActive: layerManager.activateViewport,
      views: this._deck.getViews(),
      effects,
      effectProps
    });
  }

  _renderLayers() {
    const {data = DATA_URL} = this.props;
    const {shadowMap} = this.state;

    return [
      // new BitmapLayer({
      //   id: 'debug',
      //   opacity: 1,
      //   image: shadowMap,
      //   bounds: [
      //     -74.0,
      //     40.72,
      //     -74.02,
      //     40.7
      //   ]
      // }),
      new ShadowPolygonLayer({
        id: 'buildings',
        data,
        opacity: 1,
        extruded: true,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: [74, 80, 87],
        material,

        shadowColor,
        castShadow: true,
        shadowMap
      }),
      new ShadowPolygonLayer({
        id: 'land',
        data: landCover,
        opacity: 1,
        extruded: false,
        getPolygon: f => f,
        getFillColor: [0, 0, 0, 0],

        shadowColor,
        shadowMap
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        ref={ref => {
          this._deck = ref && ref.deck;
        }}
        layers={this._renderLayers()}
        effects={[lightingEffect]}
        initialViewState={INITIAL_VIEW_STATE}
        viewState={viewState}
        controller={controller}
        onWebGLInitialized={this._onWebGLInitialized}
        onBeforeRender={this._onBeforeRender}
      >
        {baseMap && (
          <StaticMap
            reuseMaps
            mapStyle="mapbox://styles/mapbox/dark-v9"
            mapboxApiAccessToken={MAPBOX_TOKEN}
          />
        )}
      </DeckGL>
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
