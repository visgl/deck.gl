/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';

import {StaticMap} from 'react-map-gl';

// import DeckGL from 'deck.gl';
import {experimental} from 'deck.gl';
const {DeckGLMultiView: DeckGL, ViewportLayout} = experimental;

// Unified controller, together with state that determines interaction model
import {ViewportController} from 'deck.gl';
import {FirstPersonState} from 'deck.gl';

// Viewport classes provides various views on the state
import {FirstPersonViewport, WebMercatorViewport} from 'deck.gl';

import {
  COORDINATE_SYSTEM,
  PolygonLayer,
  PointCloudLayer
  // ScatterplotLayer, ArcLayer, HexagonCellLayer
} from 'deck.gl';

import TripsLayer from '../../trips/trips-layer';

import {setParameters} from 'luma.gl';
import {Matrix4} from 'math.gl';

import {json as requestJson} from 'd3-request';

const modelMatrix = new Matrix4().rotateZ(Math.PI / 4);

// Source data CSV
const DATA_URL = {
  BUILDINGS: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/buildings.json',  // eslint-disable-line
  TRIPS: 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/trips/trips.json'  // eslint-disable-line
};

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
      fov: 60,

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

    requestJson(DATA_URL.BUILDINGS, (error, response) => {
      if (!error) {
        this.setState({buildings: response});
      }
    });

    requestJson(DATA_URL.TRIPS, (error, response) => {
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
    this.setState({fov: this.state.fov === 60 ? 35 : 60});
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
    const {longitude, latitude} = DEFAULT_VIEWPORT_PROPS;
    const {viewportProps} = this.state;
    const {position} = viewportProps;

    const {buildings, trips} = this.state;
    const {trailLength, time} = this.state;
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
      // new PointCloudLayer({
      //   id: 'point-cloud',
      //   outline: true,
      //   data: new Array(100).fill(0).map((v, i) => ({
      //     position: [(Math.random() - 0.5) * i, (Math.random() - 0.5) * i, Math.random() * i],
      //     color: [255, 255, 255, 255],
      //     normal: [1, 1, 1]
      //   })),
      //   projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
      //   positionOrigin: [longitude, latitude],
      //   opacity: 1,
      //   radiusPixels: 3
      // }),
      new PointCloudLayer({
        id: 'player',
        data: [{
          position,
          color: [0, 255, 255, 255],
          normal: [1, 0, 0]
        }],
        projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
        positionOrigin: [longitude, latitude],
        modelMatrix,
        opacity: 1,
        radiusPixels: 20
      }),
      new PointCloudLayer({
        id: 'ref-point',
        data: [{
          position: [-1, 0, 2],
          color: [255, 0, 0, 255],
          normal: [1, 0, 0]
        }],
        projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
        positionOrigin: [longitude, latitude],
        modelMatrix,
        opacity: 1,
        radiusPixels: 20
      })
      // new ScatterplotLayer({
      //   id: 'player2',
      //   data: [{
      //     position: new Vector3(position).clone().add([-200, -200, 0]),
      //     color: [0, 255, 0, 255],
      //     radius: 1,
      //     normal: [1, 0, 0]
      //   }],
      //   fp64: true,
      //   projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
      //   positionOrigin: [longitude, latitude],
      //   opacity: 1,
      //   radiusScale: 20
      // }),
      // new ArcLayer({
      //   id: 'player2',
      //   data: [{
      //     sourcePosition: [-400, -400, 0],
      //     targetPosition: [-200, -200, 0],
      //     color: [0, 255, 0, 255],
      //     normal: [1, 0, 0]
      //   }],
      //   fp64: true,
      //   projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
      //   positionOrigin: [longitude, latitude],
      //   opacity: 1,
      //   strokeWidth: 2
      // }),
      // new HexagonCellLayer({
      //   id: 'player-hex',
      //   data: [{
      //     centroid: [0, 0, 0],
      //     color: [0, 255, 255, 255],
      //     elevation: 0
      //   }],
      //   projectionMode: COORDINATE_SYSTEM.METER_OFFSETS,
      //   positionOrigin: [longitude, latitude],
      //   opacity: 1,
      //   radius: 100,
      //   angle: 0
      // })
    ];
  }

  _renderViewports() {
    const {viewportProps, fov} = this.state;

    return [
      new FirstPersonViewport({
        ...viewportProps,
        modelMatrix,
        height: viewportProps.height / 2,
        fovy: fov // Field of view covered by camera
      }),
      {
        viewport: new WebMercatorViewport({
          ...viewportProps,
          y: viewportProps.height / 2,
          height: viewportProps.height / 2
        }),
        component: <StaticMap
          {...viewportProps}
          mapStyle="mapbox://styles/mapbox/dark-v9"
          onViewportChange={this._onViewportChange.bind(this)}
          mapboxApiAccessToken={MAPBOX_TOKEN}/>
      }
    ];
  }

  render() {
    const viewports = this._renderViewports();

    // TODO - should ViewportController accept a viewport?
    const {viewportProps} = this.state;

    return (
      <div style={{backgroundColor: '#000'}}>

        <ViewportController
          StateClass={FirstPersonState}
          {...viewportProps}
          width={viewportProps.width}
          height={viewportProps.height}
          onViewportChange={this._onViewportChange} >

          <ViewportLayout viewports={viewports}>

            <DeckGL
              id="first-person"
              width={viewportProps.width}
              height={viewportProps.height}
              viewports={viewports}
              useDevicePixelRatio={true}
              layers={this._renderLayers()}
              onWebGLInitialized={this._initialize} />

          </ViewportLayout>

          {this._renderOptionsPanel()}

        </ViewportController>

      </div>
    );
  }
}

// <div style={{position: 'absolute', left: 0, bottom: 0}}>
// </div>

// <div style={{position: 'absolute', left: 0, top: 0}}>

render(<Root />, document.body.appendChild(document.createElement('div')));
