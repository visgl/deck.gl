/* global document */
import 'babel-polyfill';
import 'babel-register';

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';

/* global window */
window.website = true;
// Use require to ensure `window.website` flag is set before demos are imported.
const AppState = require('./reducers').default;
const Routes = require('./routes').default;

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(
  <Provider store={AppState} >
    <Routes />
  </Provider>,
  el
);
