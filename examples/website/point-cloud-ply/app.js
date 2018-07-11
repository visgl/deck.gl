/* global window */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, OrbitView} from 'deck.gl';
import {
  _OrbitController as OrbitController,
  _LinearInterpolator as LinearInterpolator
} from 'deck.gl';
import {loadBinary, parsePLY} from './utils/ply-loader';

const DATA_REPO = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master';
const FILE_PATH = 'examples/point-cloud-ply/lucy100k.ply';

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);

const INITIAL_VIEW_STATE = {
  lookAt: [0, 0, 0],
  distance: 2,
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 30,
  minDistance: 1.5,
  maxDistance: 10
};

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      width: 0,
      height: 0,
      points: [],
      viewState: INITIAL_VIEW_STATE
    };

    this._onLoad = this._onLoad.bind(this);
    this._onResize = this._onResize.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._rotateCamera = this._rotateCamera.bind(this);
  }

  componentDidMount() {
    window.addEventListener('resize', this._onResize);

    loadBinary(`${DATA_REPO}/${FILE_PATH}`).then(rawData => {
      const {vertex} = parsePLY(rawData);

      const points = [];
      vertex.x.forEach((_, i) => {
        points.push({
          color: [(0.5 - vertex.x[i]) * 255, (vertex.y[i] + 0.5) * 255, 255, 255],
          normal: [vertex.nx[i], vertex.ny[i], vertex.nz[i]],
          position: [vertex.x[i], vertex.y[i], vertex.z[i]]
        });
      });
      this.setState({points});
    });
  }

  componentWillUnmount() {
    window.removeEventListener('resize', this._onResize);
  }

  _onLoad() {
    this.setState({width: window.innerWidth, height: window.innerHeight});
    this._rotateCamera();
  }

  _onResize() {
    this.setState({width: window.innerWidth, height: window.innerHeight});

    if (this.viewState) {
      const newViewState = Object.assign({}, this.viewState, {
        distance: OrbitView.getDistance({
          boundingBox: [1, 1, 1],
          fov: this.state.viewState.fov
        })
      });
      this._onViewStateChange(newViewState, {});
    }
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _rotateCamera() {
    const {viewState} = this.state;
    this.setState({
      viewState: {
        ...viewState,
        rotationOrbit: viewState.rotationOrbit + 30,
        transitionDuration: 350,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera
      }
    });
  }

  _renderPointCloudLayer() {
    const {points} = this.state;
    if (!points || points.length === 0) {
      return null;
    }

    return new PointCloudLayer({
      id: 'point-cloud-layer',
      data: points,
      coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
      getPosition: d => d.position,
      getNormal: d => d.normal,
      radiusPixels: 1
    });
  }

  render() {
    const {width, height, viewState} = this.state;

    const view = new OrbitView();

    return (
      <DeckGL
        width={width}
        height={height}
        views={[view]}
        viewState={viewState}
        controller={OrbitController}
        onViewStateChange={this._onViewStateChange}
        layers={[this._renderPointCloudLayer()]}
        onLoad={this._onLoad}
        onResize={this._onResize}
      />
    );
  }
}

export function renderToDOM(container) {
  render(<Example />, container);
}
