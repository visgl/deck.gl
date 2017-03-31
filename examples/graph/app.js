/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';
import DeckGLOverlay from './deckgl-overlay.js';
import {json as requestJson} from 'd3-request';

class Root extends Component {

  constructor(props) {
    super(props);
    this.state = {
      viewport: {
        width: 500,
        height: 500
      },
      data: null
    };

    requestJson('./data/sample-graph.json', (error, response) => {
      if (!error) {
        this.setState({data: response});
      }
    });
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

  _onHover(el) {
    if (el) {
      this.setState({hovered: el});
    }
  }

  _onClick(el) {
    const {clicked} = this.state;
    this.setState({clicked: el && el.id && clicked && clicked.id &&
      el.id === clicked.id ? null : el
    });
  }

  _onDoubleClick(el) {
    this.setState({doubleClicked: el});
  }

  render() {
    const {viewport, data} = this.state;
    const handlers = {
      onHover: this._onHover,
      onClick: this._onClick,
      onDoubleClick: this._onDoubleClick
    };

    return (
      <DeckGLOverlay
        viewport={viewport}
        data={data}
        {...handlers} />
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
