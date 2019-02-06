// @noflow
import React from 'react';
import {render} from 'react-dom';
import App from './app';

/* global document */
render(
  <div style={{width: '100%', height: '100%'}}>
    <App />
  </div>,
  document.body.appendChild(document.createElement('div'))
);
