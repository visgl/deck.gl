// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './app';

class Root extends Component {
  constructor(props) {
    super(props);
    this._appState = null;
  }

  _onAppStateChange(newState) {
    this._appState = newState;
  }

  render() {
    const {AppComponent} = this.props;

    return (
      <div>
        <AppComponent state={this._appState} onStateChange={this._onAppStateChange.bind(this)} />
      </div>
    );
  }
}

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);

const render = () => {
  ReactDOM.render(<Root AppComponent={App} />, container);
};

render();
