import React, {PureComponent} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PointCloudLayer, OrbitView, LinearInterpolator} from 'deck.gl';

import {LASLoader} from '@loaders.gl/las';
import {loadFile} from '@loaders.gl/core';

// Data source: kaarta.com
const DATA_URL =
  'https://raw.githubusercontent.com/uber-common/deck.gl-data/master/examples/point-cloud-laz/indoor.0.1.laz';

const INITIAL_VIEW_STATE = {
  target: [0, 0, 0],
  rotationX: 0,
  rotationOrbit: 0,
  orbitAxis: 'Y',
  fov: 50,
  minZoom: 0,
  maxZoom: 10,
  zoom: 1
};

const transitionInterpolator = new LinearInterpolator(['rotationOrbit']);

export class App extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      viewState: INITIAL_VIEW_STATE,
      pointsCount: 0,
      points: null
    };

    this._onLoad = this._onLoad.bind(this);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._rotateCamera = this._rotateCamera.bind(this);
    this._loadData();
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
        transitionDuration: 600,
        transitionInterpolator,
        onTransitionEnd: this._rotateCamera
      }
    });
  }

  _onLoad({header, loaderData, attributes, progress}) {
    // metadata from LAZ file header
    const {mins, maxs} = loaderData.header;
    const {viewState} = this.state;

    this.setState(
      {
        pointsCount: header.vertexCount,
        points: attributes.POSITION.value,
        viewState: {
          ...viewState,
          target: [(mins[0] + maxs[0]) / 2, (mins[1] + maxs[1]) / 2, (mins[2] + maxs[2]) / 2],
          /* global window */
          zoom: Math.log2(window.innerWidth / (maxs[0] - mins[0])) - 1
        }
      },
      this._rotateCamera
    );
  }

  _loadData() {
    const skip = 1;
    const {onLoad = () => {}} = this.props;

    onLoad({count: 0, progress: 0});

    const onProgress = ({header, progress}) => {
      onLoad({count: header.vertexCount, progress});
    };

    return loadFile(DATA_URL, LASLoader, {skip, onProgress}).then(this._onLoad);
  }

  _renderLayers() {
    const {pointsCount, points} = this.state;

    return [
      points &&
        new PointCloudLayer({
          id: 'laz-point-cloud-layer',
          coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
          numInstances: pointsCount,
          instancePositions: points,
          getNormal: [0, 1, 0],
          getColor: [255, 255, 255],
          opacity: 0.5,
          pointSize: 0.5
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
        onViewStateChange={this._onViewStateChange}
        layers={this._renderLayers()}
        parameters={{
          clearColor: [0.07, 0.14, 0.19, 1]
        }}
      />
    );
  }
}

export function renderToDOM(container) {
  render(<App />, container);
}
