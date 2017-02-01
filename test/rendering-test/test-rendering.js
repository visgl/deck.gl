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

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import {join} from 'path';
import {readFileSync} from 'fs';

import DeckGL from 'deck.gl/react';
import {getPoints100K} from './data-generator';

import {
  ScatterplotLayer,
  ArcLayer,
  LineLayer,
  HexagonLayer,

  ScreenGridLayer,
  IconLayer,
  GridLayer,
  GeoJsonLayer,
  // PolygonLayer,
  // PathLayer,

  ScatterplotLayer64,
  ArcLayer64,
  LineLayer64,

  ChoroplethLayer,
  ChoroplethLayer64,
  ExtrudedChoroplethLayer64

} from 'deck.gl';

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };


const width = 1600;
const height = 900;

const container = document.createElement('div');

container.style.position = 'absolute';
container.style.display = 'none';

const image = document.createElement('img');

image.width = width;
image.height = height;
image.style.position = 'absolute';
image.style.top = 0;
image.style.left = 0;

document.body.appendChild(container);
document.body.appendChild(image);

class RenderingTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
        mapViewState: {
        latitude: 37.751537058389985,
        longitude: -122.42694203247012,
        zoom: 12,
        pitch: 30,
        bearing: 0
      }
    };
  }

  _onDrawComplete(canvas) {
    console.log('draw complete');

    const imageURL = canvas.toDataURL();
    console.log(imageURL);
    image.src = imageURL;

  }

  render() {
    const {mapViewState} = this.state;

    return React.createElement(DeckGL, _extends({
      id: "default-deckgl-overlay",
      width: width,
      height: height,
      debug: true,
      onLayerDrawn: this._onDrawComplete.bind(this)
    }, mapViewState, {
      layers: [new ScatterplotLayer({
        id: 'scatterplotLayer',
        data: getPoints100K(),
        getPosition: d => d,
        getColor: d => [255, 128, 0],
        getRadius: d => 5.0,
        opacity: 0.5,
        strokeWidth: 2,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 5
      })]
    }))
  }
}

ReactDOM.render(React.createElement(RenderingTest, {}, null), container);


