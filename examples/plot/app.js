/* global window,document */
import React, {Component} from 'react';
import {render} from 'react-dom';

import DeckGLOverlay from './deckgl-overlay.js';

const EQUATION = (x, y) => Math.sin(x * x + y * y) * x / Math.PI;

class Root extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this._onHover = this._onHover.bind(this);
  }

  _onHover(info) {
    const hoverInfo = info.sample ? info : null;
    if (hoverInfo !== this.state.hoverInfo) {
      this.setState({hoverInfo});
    }
  }

  render() {
    const {viewport, hoverInfo} = this.state;

    return (
      <div>
        <DeckGLOverlay
          equation={EQUATION}
          resolution={200}
          showAxis={true}
          onHover={this.props.onHover}
        />

        {hoverInfo && (
          <div className="tooltip" style={{left: hoverInfo.x, top: hoverInfo.y}}>
            {hoverInfo.sample.map(x => x.toFixed(3)).join(', ')}
          </div>
        )}
      </div>
    );
  }
}

render(<Root />, document.body.appendChild(document.createElement('div')));
