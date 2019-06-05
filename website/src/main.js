/* global window, document */

import React from 'react';
import ReactDOM from 'react-dom';
import {Provider} from 'react-redux';
import {HashRouter} from 'react-router-dom';
import {Route} from 'react-router';

import AppState from './reducers';
import App from './components/app';

// core-js polyfill breaks `instanceof Promise` check
// https://github.com/zloirock/core-js/issues/178#issuecomment-192081350
const _fetch = window.fetch;
window.fetch = (resource, init) => Promise.resolve(_fetch(resource, init));

const el = document.createElement('div');
document.body.appendChild(el);

ReactDOM.render(
  <Provider store={AppState}>
    <HashRouter>
      <Route path="/" component={App} />
    </HashRouter>
  </Provider>,
  el
);
