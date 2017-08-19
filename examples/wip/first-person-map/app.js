/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';

// import MapGL from 'react-map-gl';
// import {MapController} from 'deck.gl';
// import {WebMercatorViewport} from 'deck.gl';

import {FirstPersonController} from 'deck.gl';
import {FirstPersonViewport} from 'deck.gl';

import DeckGL, {PolygonLayer} from 'deck.gl';
import TripsLayer from './trips-layer';

import {setParameters} from 'luma.gl';

import {json as requestJson} from 'd3-request';

// Set your mapbox token here
const MAPBOX_TOKEN = process.env.MapboxAccessToken; // eslint-disable-line

const LIGHT_SETTINGS = {
  lightsPosition: [-74.05, 40.7, 8000, -73.5, 41, 5000],
  ambientRatio: 0.05,
  diffuseRatio: 0.6,
  specularRatio: 0.8,
  lightsStrength: [2.0, 0.0, 0.0, 0.0],
  numberOfLights: 2
};

const DEFAULT_VIEWPORT_PROPS = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  maxZoom: 16,
  pitch: 45,
  bearing: 0,

  // view matrix arguments
  position: [100, 0, 2], // Defines eye position
  direction: [-0.9, 0.5, 0], // Which direction is camera looking at, default origin
  up: [0, 0, 1] // Defines up direction, default positive y axis
};

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewportProps: {
        ...DEFAULT_VIEWPORT_PROPS,
        width: 500,
        height: 500
      },
      buildings: null,
      trips: null,
      time: 0,
      trailLength: 50
    };

    requestJson('./data/buildings.json', (error, response) => {
      if (!error) {
        this.setState({buildings: response});
      }
    });

    requestJson('./data/trips.json', (error, response) => {
      if (!error) {
        this.setState({trips: response});
      }
    });

    this._onViewportChange = this._onViewportChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    if (this._animationFrame) {
      window.cancelAnimationFrame(this._animationFrame);
    }
  }

  _initialize(gl) {
    setParameters(gl, {
      depthTest: true,
      depthFunc: gl.LEQUAL
    });
  }

  _animate() {
    const timestamp = Date.now();
    const loopLength = 1800;
    const loopTime = 60000;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._animate.bind(this));
  }

  _resize() {
    this._onViewportChange({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onViewportChange(viewportProps, viewport) {
    this.setState({
      viewportProps: {...this.state.viewportProps, ...viewportProps},
      viewport
    });
  }

  _renderLayers() {
    const {buildings, trips, trailLength, time} = this.state;

    if (!buildings || !trips) {
      return [];
    }

    return [
      new TripsLayer({
        id: 'trips',
        data: trips,
        getPath: d => d.segments,
        getColor: d => d.vendor === 0 ? [253, 128, 93] : [23, 184, 190],
        opacity: 0.3,
        strokeWidth: 2,
        trailLength,
        currentTime: time
      }),
      new PolygonLayer({
        id: 'buildings',
        data: buildings,
        extruded: true,
        wireframe: false,
        // fp64: true,
        opacity: 0.5,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: f => [74, 80, 87],
        lightSettings: LIGHT_SETTINGS
      })
    ];
  }

  render() {
    const {viewportProps} = this.state;

    // const mapViewport = new WebMercatorViewport({
    //   ...viewportProps
    // });

    const firstPersonViewport = new FirstPersonViewport(Object.assign({}, viewportProps, {
      // // viewportProps arguments
      // width: viewportProps.width, // Width of viewportProps
      // height: viewportProps.height, // Height of viewportProps
      // longitude: viewportProps.longitude,
      // latitude: viewportProps.latitude,
      // zoom: viewportProps.zoom,
      // // view matrix arguments
      // eye: [100, 0, 2], // Defines eye position
      // lookAt: [0, 1, 0], // Which point is camera looking at, default origin
      // up: [0, 0, 1], // Defines up direction, default positive y axis
      // projection matrix arguments
      fovy: 75, // Field of view covered by camera
      near: 1, // Distance of near clipping plane
      far: 10000 // Distance of far clipping plane
    }));

    console.log(viewportProps.position, viewportProps.direction, viewportProps.lookAt); // eslint-disable-line

    // const deckViewport = ((Math.round(++counter / 1) % 2) === 0) ?
    //   mapViewport :
    //   firstPersonViewport;

    return (
      <div style={{backgroundColor: '#000'}}>
        <FirstPersonController
          {...viewportProps}
          width={viewportProps.width}
          height={viewportProps.height}
          onViewportChange={this._onViewportChange} >
          <DeckGL
            id="first-person"
            viewport={firstPersonViewport}
            width={viewportProps.width}
            height={viewportProps.height}
            layers={this._renderLayers()}
            onWebGLInitialized={this._initialize} />
        </FirstPersonController>
      </div>
    );

    // <MapGL
    //   {...viewport}
    //   width={viewport.width}
    //   height={viewport.height}
    //   zoom={viewport.zoom}
    //   mapStyle="mapbox://styles/mapbox/dark-v9"
    //   onViewportChange={this._onViewportChange.bind(this)}
    //   mapboxApiAccessToken={MAPBOX_TOKEN}>
    //   <DeckGL
    //     viewport={deckViewport}
    //     width={viewport.width}
    //     height={viewport.height}
    //     layers={this._renderLayers()}
    //     onWebGLInitialized={this._initialize} />
    // </MapGL>

  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
