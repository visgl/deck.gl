// Copyright (c) 2016 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

// TODO - need to clean up this code to follow lint rules, disable for now
/* eslint-disable */

import 'babel-polyfill';

import {document, window} from 'global';
import {join} from 'path';
import {readFileSync} from 'fs';

import DeckGL from 'deck.gl/react';
import React from 'react';
import ReactDOM from 'react-dom';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

const container = document.createElement('div');
document.body.appendChild(container);
const mapViewState = {
        latitude: 37.751537058389985,
        longitude: -122.42694203247012,
        zoom: 11.5,
        pitch: 30,
        bearing: 0
      };

ReactDOM.render(
  React.createElement(DeckGL, _extends({
      id: "default-deckgl-overlay",
      width: width,
      height: height,
      debug: true
    }, mapViewState, {
      onWebGLInitialized: this._onWebGLInitialized,
      layers: this._renderExamples(),
      effects: this._effects
    })),
  container
  );
