/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGLOverlay from './deckgl-overlay.js';
import OrbitController from './orbit-controller';

const equation = (x, y) => {
  return Math.sin(x * x + y * y) * x / Math.PI;
};

class Root extends Component {

  constructor(props) {
    super(props);

    this.state = {
      viewport: {
        lookAt: [0, 0, 0],
        distance: 3,
        rotationX: -30,
        rotationY: 30,
        fov: 50,
        minDistance: 1,
        maxDistance: 20,
        width: 500,
        height: 500
      }
    };
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
    this._resize();
  }

  _resize() {
    this._onChangeViewport({
      width: window.innerWidth,
      height: window.innerHeight
    });
  }

  _onChangeViewport(viewport) {
    this.setState({
      viewport: {...this.state.viewport, ...viewport}
    });
  }

  render() {
    const {viewport} = this.state;

    return (
      <OrbitController
        {...viewport}
        onChangeViewport={this._onChangeViewport.bind(this)} >
        <DeckGLOverlay viewport={viewport}
          equation={equation}
          resolution={200}
          showAxis={true} />
      </OrbitController>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
