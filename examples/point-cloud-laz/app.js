/* global document, window,*/
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, OrbitView, experimental} from 'deck.gl';
const {OrbitController} = experimental;

import {setParameters} from 'luma.gl';
import {loadLazFile, parseLazData} from './utils/laslaz-loader';

const DATA_REPO = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master';
const FILE_PATH = 'examples/point-cloud-laz/indoor.laz';

const INITIAL_VIEW_STATE = {
  lookAt: [0, 0, 0],
  distance: 1,
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 30,
  minDistance: 0.5,
  maxDistance: 3
};

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

    this.state = {
      width: 0,
      height: 0,
      points: [],
      progress: 0,
      rotating: true,
      viewState: INITIAL_VIEW_STATE
    };

    this._onInitialize = this._onInitialize.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onViewportChange = this._onViewportChange.bind(this);
    this._onUpdate = this._onUpdate.bind(this);
  }

  componentWillMount() {
    window.addEventListener('resize', this._onResize);
    this._onResize();
  }

  componentDidMount() {
    const {points} = this.state;

    const skip = 10;
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

    window.requestAnimationFrame(this._onUpdate);
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onInitialize(gl) {
    setParameters(gl, {
      clearColor: [0.07, 0.14, 0.19, 1],
      blendFunc: [gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA]
    });
  }

  _onResize() {
    this.setState({width: window.innerWidth, height: window.innerHeight});

    const newViewState = Object.assign({}, this.viewState, {
      distance: OrbitView.getDistance({
        boundingBox: [1, 1, 1],
        fov: this.state.viewState.fov
      })
    });
    this._onViewportChange(newViewState, {});
  }

  _onViewportChange(viewState, interactiveState) {
    this.setState({
      rotating: !interactiveState.isDragging,
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  _onUpdate() {
    const {rotating, viewState, progress} = this.state;

    if (rotating && progress >= 1.0) {
      this.setState({
        viewState: {
          ...viewState,
          rotationOrbit: viewState.rotationOrbit + 1
        }
      });
    }

    window.requestAnimationFrame(this._onUpdate);
  }

  _renderLazPointCloudLayer() {
    const {points, progress} = this.state;
    if (!points || points.length === 0 || progress < 1.0) {
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

  _renderDeckGLCanvas() {
    const {width, height, viewState} = this.state;
    const view = new OrbitView();

    return (
      <DeckGL
        width={width}
        height={height}
        views={view}
        viewState={viewState}
        controller={OrbitController}
        layers={[this._renderLazPointCloudLayer()]}
        onWebGLInitialized={this._onInitialize}
        onViewportChange={this._onViewportChange}
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
