/* global window */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {StaticMap} from 'react-map-gl';
import {PhongMaterial} from '@luma.gl/core';
import {AmbientLight, PointLight, LightingEffect} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {PolygonLayer} from '@deck.gl/layers';
import {TripsLayer} from '@deck.gl/geo-layers';

function shuffle(a) {
  var j, x, i;
  for (i = a.length - 1; i > 0; i--) {
      j = Math.floor(Math.random() * (i + 1));
      x = a[i];
      a[i] = a[j];
      a[j] = x;
  }
  return a;
}

function getRgbFromStr(strRgb) {
  var color = d3.color(strRgb);
  return [color.r, color.g, color.b]
  
}

// Set your mapbox token here
const MAPBOX_TOKEN = "pk.eyJ1IjoiaGFyaXNiYWwiLCJhIjoiY2pzbmR0cTU1MGI4NjQzbGl5eTBhZmZrZCJ9.XN4kLWt5YzqmGQYVpFFqKw";

const startTime = Date.now() / 1000

let trsData = require('./inputs/data.json');
let trIds = Object.keys(trsData);
let colors = d3.scaleSequential()
               .domain(shuffle([...trIds]))
               .interpolator(d3.interpolateRainbow);

let lsoasData = require('./inputs/lsoas.json');

let data = {trs: trsData, lsoas: lsoasData};

const ambientLight = new AmbientLight({
  color: [255, 255, 255],
  intensity: 1.0
});

const pointLight = new PointLight({
  color: [255, 255, 255],
  intensity: 2.0,
  position: [-74.05, 40.7, 8000]
});

const lightingEffect = new LightingEffect({ambientLight, pointLight});

const material = new PhongMaterial({
  ambient: 0.1,
  diffuse: 0.6,
  shininess: 32,
  specularColor: [60, 64, 70]
});

export const INITIAL_VIEW_STATE = {
  longitude: -2.730, //-2.5893897,
  latitude: 51.468,// 51.4516883,
  zoom: 11,
  pitch: 45,
  bearing: 0
};

export class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      time: 0
    };
  }

  componentDidMount() {
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _animate() {
    const {
      animationSpeed = 300 // unit time per second
    } = this.props;
    const timestamp = Date.now() / 1000;
    
    this.setState({
      time: (timestamp - startTime) * animationSpeed 
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _renderLayers() {
    const {trips = data.trs, trailLength = 1800} = this.props;

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.Segments,
        getColor: [255, 0, 0], // d => getRgbFromStr(colors(d.Tourid)),
        opacity: 1.0,
        widthMinPixels: 2,
        rounded: false,
        trailLength,
        currentTime: this.state.time,
        pickable: true,
        autoHighlight: true,
        highlightColor: [0, 255, 255]
      })
    ];
  }

  render() {
    const {viewState, controller = true, baseMap = true} = this.props;

    return (
      <DeckGL
        layers={this._renderLayers()}
        effects={[lightingEffect]}
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

export function renderToDOM(container) {
  render(<App />, container);
}
