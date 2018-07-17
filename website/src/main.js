/* global document */
import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom'
import {Route} from 'react-router';

import AppState from './reducers';
import App from './components/app';

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(
  <Provider store={AppState} >
    <HashRouter>
      <Route path="/" component={App} />
    </HashRouter>
  </Provider>,
  el
);
