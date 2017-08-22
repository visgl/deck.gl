/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';

// import DeckGL from 'deck.gl';
import DeckGL from './deckgl-multiview';
import {ViewportController} from 'deck.gl';
import {FirstPersonState} from 'deck.gl';
import {FirstPersonViewport} from 'deck.gl';

// import {MapController} from 'deck.gl';
import {WebMercatorViewport} from 'deck.gl';

import {PolygonLayer, PointCloudLayer, COORDINATE_SYSTEM} from 'deck.gl';
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
  lightsStrength: [3.0, 0.0, 0.5, 0.0],
  numberOfLights: 2
};

const DEFAULT_VIEWPORT_PROPS = {
  longitude: -74,
  latitude: 40.72,
  zoom: 13,
  maxZoom: 16,
  pitch: 60,
  bearing: 270,

  // view matrix arguments
  // position: [100, 0, 2], // Defines eye position
  position: [0, 0, 2], // Defines eye position
  // direction: [-0.9, 0.5, 0], // Which direction is camera looking at, default origin
  up: [0, 0, 1] // Defines up direction, default positive y axis
};

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewportMode: true,
      fov: 75,

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
    this._onViewportModeChange = this._onViewportModeChange.bind(this);
    this._onFovChange = this._onFovChange.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize.bind(this));
    this._onResize();
    this._onAnimate();
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

  _onAnimate() {
    const timestamp = Date.now();
    const loopLength = 1800;
    const loopTime = 20000;

    this.setState({
      time: ((timestamp % loopTime) / loopTime) * loopLength
    });
    this._animationFrame = window.requestAnimationFrame(this._onAnimate.bind(this));
  }

  _onResize() {
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

  _onViewportModeChange() {
    this.setState({viewportMode: !this.state.viewportMode});
  }

  _onFovChange() {
    this.setState({fov: this.state.fov === 75 ? 35 : 75});
  }

  _renderOptionsPanel() {
    return (
      <div style={{position: 'absolute', top: '8px', right: '8px'}}>
        <div style={{
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center'}}>
          <button key="mode" onClick={this._onViewportModeChange}>
            {this.state.viewportMode ? 'First Person' : 'Mercator'}
          </button>
          <button key="fov" onClick={this._onFovChange}>
            {this.state.fov}
          </button>
          <div style={{color: 'white'}}>
            {Object.keys(this.state.viewportProps).map(key => (
              <div key={key}>{key}:{String(this.state.viewportProps[key])}</div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  _renderLayers() {
    const {buildings, trips, trailLength, time} = this.state;

    const {viewportProps} = this.state;
    const {position} = viewportProps;

    const {longitude, latitude} = DEFAULT_VIEWPORT_PROPS;

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
        fp64: true,
        opacity: 0.5,
        getPolygon: f => f.polygon,
        getElevation: f => f.height,
        getFillColor: f => [74, 80, 87],
        lightSettings: LIGHT_SETTINGS
      }),
      new PointCloudLayer({
        id: 'point-cloud',
        outline: true,
        data: new Array(100).fill(0).map((v, i) => ({
          position: [(Math.random() - 0.5) * i, (Math.random() - 0.5) * i, Math.random() * i],
          color: [255, 0, 0, 255],
          normal: [1, 0, 0]
        })),
        projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
        positionOrigin: [longitude, latitude],
        opacity: 1,
        radiusPixels: 4
      }),
      new PointCloudLayer({
        id: 'player',
        data: [{
          position,
          color: [0, 255, 255, 255],
          normal: [1, 0, 0]
        }],
        projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
        positionOrigin: [longitude, latitude],
        opacity: 1,
        radiusPixels: 40
      })
    ];
  }

  render() {
    const {viewportProps, fov} = this.state;

    const mapViewport = new WebMercatorViewport({
      ...viewportProps,
      width: viewportProps.width / 2
    });

    const firstPersonViewport = new FirstPersonViewport(Object.assign({}, viewportProps, {
      width: viewportProps.width / 2,
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
      fovy: fov, // Field of view covered by camera
      near: 1, // Distance of near clipping plane
      far: 10000 // Distance of far clipping plane
    }));

    // console.log(viewportProps.position, viewportProps.direction, viewportProps.lookAt);
    // eslint-disable-line

    const viewport = this.state.viewportMode ? firstPersonViewport : mapViewport;

    return (
      <div style={{backgroundColor: '#000'}}>

        <ViewportController
          StateClass={FirstPersonState}
          {...viewportProps}
          width={viewportProps.width}
          height={viewportProps.height}
          onViewportChange={this._onViewportChange} >

          <StaticMap
            visible={viewport.isMapSynched()}
            {...viewportProps}
            width={viewportProps.width / 2}
            height={viewportProps.height}
            zoom={viewportProps.zoom}
            mapStyle="mapbox://styles/mapbox/dark-v9"
            onViewportChange={this._onViewportChange.bind(this)}
            mapboxApiAccessToken={MAPBOX_TOKEN}>

            <DeckGL
              id="first-person"
              rightViewport={mapViewport}
              leftViewport={firstPersonViewport}
              width={viewportProps.width}
              height={viewportProps.height}
              layers={this._renderLayers()}
              onWebGLInitialized={this._initialize} />

          </StaticMap>

        </ViewportController>

        {this._renderOptionsPanel()}

      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
