/* global document */
import React, {Component} from 'react';
import {render} from 'react-dom';

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

import App from './app';

const renderDOM = () => {
  render(<Root AppComponent={App} />, container);
};

renderDOM();

// @ts-expect-error
if (globalThis.module?.hot) {
  // @ts-expect-error
  globalThis.module.hot.accept('./app', () => {
    console.log('Hot reloading App component'); // eslint-disable-line
    render();
  });
}
