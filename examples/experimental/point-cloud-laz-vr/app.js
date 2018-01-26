/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, Viewport} from 'deck.gl';

import {setParameters} from 'luma.gl';

import WebVRPolyfill from 'webvr-polyfill';
import EmulatedVRDisplay from './vr/emulated-vr-display';

import {loadLazFile, parseLazData} from './utils/laslaz-loader';

const DATA_REPO = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master';
const FILE_PATH = 'examples/point-cloud-laz/indoor.laz';

function normalize(points) {
  let xMin = Infinity;
  let yMin = Infinity;
  let zMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  let zMax = -Infinity;

  for (let i = 0; i < points.length; i++) {
    xMin = Math.min(xMin, points[i].position[0]);
    yMin = Math.min(yMin, points[i].position[1]);
    zMin = Math.min(zMin, points[i].position[2]);
    xMax = Math.max(xMax, points[i].position[0]);
    yMax = Math.max(yMax, points[i].position[1]);
    zMax = Math.max(zMax, points[i].position[2]);
  }

  const scale = Math.max(...[xMax - xMin, yMax - yMin, zMax - zMin]);
  const xMid = (xMin + xMax) / 2;
  const yMid = (yMin + yMax) / 2;
  const zMid = (zMin + zMax) / 2;

  for (let i = 0; i < points.length; i++) {
    points[i].position[0] = (points[i].position[0] - xMid) / scale;
    points[i].position[1] = (points[i].position[1] - yMid) / scale;
    points[i].position[2] = (points[i].position[2] - zMid) / scale;
  }
}

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this._onViewportChange = this._onViewportChange.bind(this);
    this._onInitialized = this._onInitialized.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onUpdate = this._onUpdate.bind(this);

    this.state = {
      width: 0,
      height: 0,
      points: [],
      progress: 0,
      rotating: false,
      vrDisplay: new EmulatedVRDisplay()
    };
  }

  componentWillMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentDidMount() {
    const {points} = this.state;

    const skip = 50;
    loadLazFile(`${DATA_REPO}/${FILE_PATH}`).then(rawData => {
      parseLazData(rawData, skip, (decoder, progress) => {
        for (let i = 0; i < decoder.pointsCount; i++) {
          const {color, position} = decoder.getPoint(i);
          points.push({color, position});
        }

        if (progress >= 1) {
          normalize(points);
        }

        this.setState({points, progress});
      });
    });
    this._initVRDisplay();
    window.requestAnimationFrame(this._onUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onResize() {
    const size = {width: window.innerWidth, height: window.innerHeight};
    this.setState(size);
    this._onViewportChange();
  }

  _onInitialized(gl) {
    setParameters(gl, {
      clearColor: [0.07, 0.14, 0.19, 1],
      blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA]
    });
  }

  _onViewportChange(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  _onUpdate() {
    const {viewport} = this.state;

    this.setState({
      viewport: {
        ...viewport
      }
    });

    window.requestAnimationFrame(this._onUpdate);
  }

  _renderLazPointCloudLayer() {
    const {points} = this.state;
    if (!points || points.length === 0) {
      return null;
    }

    return new PointCloudLayer({
      id: 'laz-point-cloud-layer',
      data: points,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      getPosition: d => d.position,
      getNormal: d => [0, 0.5, 0.2],
      getColor: d => [255, 255, 255, 128],
      radiusPixels: 1
    });
  }

  _initVRDisplay() {
    // initialize WebVR Polyfill
    const polyfill = new WebVRPolyfill({
      PROVIDE_MOBILE_VRDISPLAY: true
    });

    if (navigator && navigator.getVRDisplays) {
      navigator.getVRDisplays().then(displays => {
        const vrDisplay = displays.find(d => d.isConnected);
        if (vrDisplay) {
          this.setState({vrDisplay});
        }
      });
    }
  }

  _renderViewports() {
    const {width, height, vrDisplay} = this.state;
    const frameData = vrDisplay.isEmulated ? {} : new window.VRFrameData();

    if (vrDisplay.getFrameData(frameData)) {
      return [
        new Viewport({
          x: 0,
          width: width / 2,
          height,
          viewMatrix: frameData.leftViewMatrix,
          projectionMatrix: frameData.leftProjectionMatrix
        }),
        new Viewport({
          x: width / 2,
          width: width / 2,
          height,
          viewMatrix: frameData.rightViewMatrix,
          projectionMatrix: frameData.rightProjectionMatrix
        })
      ];
    }
  }

  _renderDeckGLCanvas() {
    const {width, height} = this.state;

    return (
      <DeckGL
        width={width}
        height={height}
        viewports={this._renderViewports()}
        layers={[this._renderLazPointCloudLayer()]}
        onWebGLInitialized={this._onInitialized}
      />
    );
  }

  _renderProgressInfo() {
    const progress = (this.state.progress * 100).toFixed(2);
    return (
      <div>
        <div
          style={{
            position: 'absolute',
            left: '8px',
            bottom: '8px',
            color: '#FFF',
            fontSize: '15px'
          }}
        >
          {this.state.progress < 1 ? (
            <div>
              <div>This example might not work on mobile devices due to browser limitations.</div>
              <div>Please try checking it with a desktop machine instead.</div>
              <div>{`Loading ${progress}% (laslaz loader by plas.io)`}</div>
            </div>
          ) : (
            <div>Data source: kaarta.com</div>
          )}
        </div>
      </div>
    );
  }

  render() {
    const {width, height} = this.state;
    if (width <= 0 || height <= 0) {
      return null;
    }

    return (
      <div>
        {this._renderDeckGLCanvas()}
        {this._renderProgressInfo()}
      </div>
    );
  }
}

const root = document.createElement('div');
document.body.appendChild(root);

render(<Example />, root);
