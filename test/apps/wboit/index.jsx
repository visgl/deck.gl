// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global document */
import React, {Component} from 'react';
import {createRoot} from 'react-dom/client';

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

const container = document.body.appendChild(document.createElement('div'));
const root = createRoot(container);

const render = () => {
  const App = require('./app').default;
  root.render(<Root AppComponent={App} />);
};

render();

if (module.hot) {
  module.hot.accept('./app', () => {
    console.log('Hot reloading App component'); // eslint-disable-line
    render();
  });
}
