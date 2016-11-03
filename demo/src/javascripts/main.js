import 'babel-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

import AppState from './reducers';
import Routes from './routes';
/* global document */

ReactDOM.render(
  <Provider store={AppState} >
    <Routes />
  </Provider>,
  document.getElementById('app-content')
);
