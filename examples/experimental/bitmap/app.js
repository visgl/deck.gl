/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGL, {COORDINATE_SYSTEM, PerspectiveView, experimental} from 'deck.gl';
import {BitmapLayer} from '@deck.gl/experimental-layers';

const {OrbitController} = experimental;

const IMAGES = {
  NEGX: 'images/skynegx1.png',
  NEGY: 'images/skynegy1.png',
  NEGZ: 'images/skynegz1.png',
  POSX: 'images/skyposx1.png',
  POSY: 'images/skyposy1.png',
  POSZ: 'images/skyposz1.png'
};

function toRadian(degree) {
  return (Math.PI * degree) / 180;
}

function toRadians(degrees) {
  return degrees.map(d => toRadian(d));
}

const defaultViewState = {
  eye: [0, 0, 0],
  lookAt: [0, 0, 0],
  up: [0, 1, 0],
  zoom: 0.1,
  width: 100,
  height: 100,
  distance: 1
};

class Root extends Component {
  constructor(props) {
    super(props);
    this._onViewStateChange = this._onViewStateChange.bind(this);
    this._resize = this._resize.bind(this);
    this.state = {viewState: defaultViewState};
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
  }

  _resize() {
    const viewState = Object.assign(this.state.viewState, {
      width: window.innerWidth,
      height: window.innerHeight
    });
    this._onViewStateChange({viewState});
  }

  _onViewStateChange({viewState}) {
    this.setState({
      viewState: {...this.state.viewState, ...viewState}
    });
  }

  render() {
    const {viewState} = this.state;
    const {width, height} = viewState;
    const view = new PerspectiveView({
      width,
      height,
      x: 0,
      y: 0,
      viewState
    });

    const layers = [
      new BitmapLayer({
        coordinateSystem: COORDINATE_SYSTEM.IDENTITY,
        id: 'bitmap-layer',
        images: Object.values(IMAGES),
        data: [
          {
            imageUrl: IMAGES.NEGX,
            center: [-0.5, 0, 0],
            rotation: toRadians([180, -90, 0]),
            color: [255, 0, 0]
          },
          {
            imageUrl: IMAGES.NEGY,
            center: [0, -0.5, 0],
            rotation: toRadians([90, 0, 0]),
            color: [0, 255, 0]
          },
          {
            imageUrl: IMAGES.NEGZ,
            center: [0, 0, -0.5],
            rotation: toRadians([180, 180, 0]),
            color: [0, 0, 255]
          },
          {
            imageUrl: IMAGES.POSX,
            center: [0.5, 0, 0],
            rotation: toRadians([180, 90, 0]),
            color: [255, 0, 0]
          },
          {
            imageUrl: IMAGES.POSY,
            center: [0, 0.5, 0],
            rotation: toRadians([-90, 0, 0]),
            color: [0, 255, 0]
          },
          {
            imageUrl: IMAGES.POSZ,
            center: [0, 0, 0.5],
            rotation: toRadians([180, 0, 0]),
            color: [0, 0, 255]
          }
        ]
      })
    ];

    return (
      <DeckGL
        controller={OrbitController}
        viewState={viewState}
        views={view}
        onViewStateChange={this._onViewStateChange}
        layers={layers}
      />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
