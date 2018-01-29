/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGLOverlay from './deckgl-overlay.js';

const GRAPH = {
  nodes: [{id: 'Javert', position: [100, -100]}, {id: 'Fantine', position: [-100, -100]}],
  edges: [
    {
      id: '1',
      sourceId: 'Javert',
      targetId: 'Fantine',
      source: [100, -100],
      target: [-100, -100],
      controlPoint: [0, 150]
    }
  ]
};

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {
      viewport: {
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
    this.setState({
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight
      }
    });
  }

  render() {
    const {viewport} = this.state;

    return <DeckGLOverlay width={viewport.width} height={viewport.height} data={GRAPH} />;
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
