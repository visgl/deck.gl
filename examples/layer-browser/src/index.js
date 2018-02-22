/* global document */
import React, {Component} from 'react';
import ReactDOM from 'react-dom';
import App from './app';
import FPSStats from 'react-stats-zavatta';

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
        <FPSStats isActive />
        <AppComponent state={this._appState} onStateChange={this._onAppStateChange.bind(this)} />
      </div>
    );
  }
}

// ---- Main ---- //

const container = document.createElement('div');
document.body.appendChild(container);
ReactDOM.render(<Root AppComponent={App} />, container);

if (module.hot) {
  module.hot.accept('./app', () => {
    console.log('Hot reloading App component'); // eslint-disable-line
    const NextApp = require('./app').default;
    ReactDOM.render(<Root AppComponent={NextApp} />, container);
  });
}
