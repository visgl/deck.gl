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

    this._onHover = this._onHover.bind(this);
    this._onClick = this._onClick.bind(this);
    this._onDoubleClick = this._onDoubleClick.bind(this);
    this._animate = this._animate.bind(this);

    requestJson('./data/sample-graph.json', (error, response) => {
      if (!error) {
        // apply timestamp and push loaded sample data into array
        this.setState({
          data: [
            Object.assign({}, response, {
              timestamp: Date.now()
            })
          ]
        });
      }
    });
  }

  componentDidMount() {
    window.addEventListener('resize', this._resize.bind(this));
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
