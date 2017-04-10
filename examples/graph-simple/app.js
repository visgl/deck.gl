/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import {json as requestJson} from 'd3-request';

import DeckGLOverlay from './deckgl-overlay.js';

class Root extends Component {
  //
  // REACT LIFECYCLE
  //
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 500,
        height: 500
      },
      data: null
    };

    this._resize = this._resize.bind(this);
    this._animate = this._animate.bind(this);

    requestJson('./data/sample-graph.json', (error, response) => {
      if (!error) {
        // apply timestamp and push loaded sample data into array
        this.setState({
          data: response
        });
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize);
    this._resize();
    this._animate();
  }

  componentWillUnmount() {
    window.cancelAnimationFrame(this._animationFrame);
  }

  _animate() {
    this.forceUpdate();
    if (typeof window !== 'undefined') {
      this._animationFrame = window.requestAnimationFrame(this._animate);
    }
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
    const {viewport, data} = this.state;

    return (
      <DeckGLOverlay
        viewport={viewport}
        data={data} />
    );
  }

}

render(<Root />, document.body.appendChild(document.createElement('div')));
