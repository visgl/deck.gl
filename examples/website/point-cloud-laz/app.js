/* global window */
/* eslint-disable no-console */
import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, OrbitView, _LinearInterpolator as LinearInterpolator} from 'deck.gl';

import GL from 'luma.gl/constants';
import loadLazFile from './utils/laslaz-loader';
import {normalize} from './utils/point-cloud-utils';

// Data source: kaarta.com
const DATA_URL = 'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/point-cloud-laz/indoor.laz';

const INITIAL_VIEW_STATE = {
  lookAt: [0, 0, 0],
  distance: OrbitView.getDistance({boundingBox: [1, 1, 1], fov: 30}),
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 30,
  minDistance: 0.5,
  maxDistance: 3,
  zoom: 1
};

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);

export class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE,
      points: [],
      progress: 0
    };

    this._onLoad = this._onLoad.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._rotateCamera = this._rotateCamera.bind(this);

    this._loadData();
  }

  _onViewStateChange({viewState}) {
    this.setState({viewState});
  }

  _onLoad() {
    this._rotateCamera();
  }

  _rotateCamera() {
    const {viewState} = this.state;
    this.setState({
      viewState: {
        ...viewState,
        rotationOrbit: viewState.rotationOrbit + 30,
        transitionDuration: 600,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera
      }
    });
  }

  _loadData() {
    const {points} = this.state;
    const skip = 10;

    if (this.props.onLoad) {
      this.props.onLoad({count: 0, progress: 0});
    }

    loadLazFile(DATA_URL, skip, (decoder, progress) => {
      for (let i = 0; i < decoder.pointsCount; i++) {
        const {position} = decoder.getPoint(i);
        points.push(position);
      }

      if (this.props.onLoad) {
        this.props.onLoad({count: points.length, progress});
      }

      if (progress >= 1) {
        normalize(points);
      }

      this.setState({points, progress});
    });
  }

  _renderLayers() {
    const {points, progress} = this.state;

    return [
      progress >= 1.0 && new PointCloudLayer({
        id: 'laz-point-cloud-layer',
        data: points,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d,
        getNormal: [0, 1, 0],
        getColor: [255, 255, 255],
        radiusPixels: 0.5
      })
    ];
  }

  render() {
    const {viewState} = this.state;

    return (
      <DeckGL
        views={new OrbitView()}
        viewState={viewState}
        controller={true}
        onLoad={this._onLoad}
        onViewStateChange={this._onViewStateChange}
        layers={this._renderLayers()}
        parameters={{
          clearColor: [0.07, 0.14, 0.19, 1],
          blendFunc: [GL.SRC_ALPHA, GL.ONE_MINUS_SRC_ALPHA]
        }}
      />
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
