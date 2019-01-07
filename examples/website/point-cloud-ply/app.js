import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL from '@deck.gl/react';
import {COORDINATE_SYSTEM, OrbitView, LinearInterpolator} from '@deck.gl/core';
import {PointCloudLayer} from '@deck.gl/layers';

import loadPLY from './utils/ply-loader';

const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/point-cloud-ply/lucy100k.ply';

const INITIAL_VIEW_STATE = {
  lookAt: [0, 0, 0],
  distance: OrbitView.getDistance({boundingBox: [1, 1, 1], fov: 30}),
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 30,
  minDistance: 1.5,
  maxDistance: 10,
  zoom: 1
};

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);

class Example extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE,
      points: []
    };

    this._onLoad = this._onLoad.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._rotateCamera = this._rotateCamera.bind(this);

    this._loadData();
  }

  _loadData() {
    loadPLY(DATA_URL).then(({vertex}) => {
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
        transitionDuration: 350,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera
      }
    });
  }

  _renderLayers() {
    const {points} = this.state;

    return [
      new PointCloudLayer({
        id: 'point-cloud-layer',
        data: points,
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        getPosition: d => d.position,
        getNormal: d => d.normal,
        radiusPixels: 1
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
      />
    );
  }
}

export function renderToDOM(container) {
  render(<Example />, container);
}
