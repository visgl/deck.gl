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

// canvas size
const width = 1600;
const height = 900;

// DeckGL container
const deckGLContainer = document.createElement('div');
deckGLContainer.style.position = 'absolute';

// hide deckgl canvas
deckGLContainer.style.display = 'none';

// Show the image element so the developer could save the image as
// the golden image
const image = document.createElement('img');
image.width = width;
image.height = height;
image.style.position = 'absolute';
image.style.top = 0;
image.style.left = 0;

// Test result container
const resultContainer = document.createElement('div');
resultContainer.style.position = 'relative';

document.body.appendChild(deckGLContainer);
document.body.appendChild(image);
document.body.appendChild(resultContainer);

class RenderingTest extends Component {
  constructor(props) {
    super(props);
  }

  _onDrawComplete(canvas) {
    // Get the content of the canvas
    const imageURL = canvas.toDataURL();

    // Display the rendered content as an image for the user
    // to save to disk as a golden image, if necessary
    image.src = imageURL;

    // Check results
    checkResults(this.props.name, imageURL);

  }

  render() {
    const {width, height, mapViewState, layersList} = this.props;
    const layers = [];

    // constructing layers
    for (const layer of layersList) {
      const {type, props} = layer;
      if (type !== undefined)
      layers.push(new type(props));
    }

    return React.createElement(DeckGL, _extends({
      id: "default-deckgl-overlay",
      width: width,
      height: height,
      debug: true,
      onAfterRender: this._onDrawComplete.bind(this)
    }, mapViewState, {
      layers: layers
    }))
  }
}

const testConfigs = [];
const referecenResults = new Map();

testConfigs.push({
  config: {
    name: 'scatterplot-1',
    // viewport params
    width: width,
    height: height,
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 10,
      pitch: 30,
      bearing: 0
    },
    // layer list
    layersList: [{
      type: ScatterplotLayer,
      props: {
        id: './golden-images/1.png',
        data: getPoints100K(),
        getPosition: d => d,
        getColor: d => [255, 128, 0],
        getRadius: d => 5.0,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 5
      }
    }]
  }
});

testConfigs.push({
  // test config
  config: {
    name: 'scatterplot-2',
    // viewport params
    width: width,
    height: height,
    mapViewState: {
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 12,
      pitch: 0,
      bearing: 0
    },
    // layer list
    layersList: [{
      type: ScatterplotLayer,
      props: {
        id: './golden-images/2.png',
        data: getPoints100K(),
        getPosition: d => d,
        getColor: d => [255, 128, 0],
        getRadius: d => 5.0,
        opacity: 0.5,
        pickable: true,
        radiusMinPixels: 5,
        radiusMaxPixels: 5
      }
    }]
  }});

// golden image for comparison
referecenResults.set('scatterplot-1', require(`./golden-images/1.png`));
referecenResults.set('scatterplot-2', require(`./golden-images/2.png`));

let resultCount = 0;
let runningTests = 2;
if (runningTests > testConfigs.length) {
  throw Error('The number of running tests > total number of available tests');
}

for (let i = 0; i < runningTests; i++) {
  const entry = testConfigs[i]
  if (name !== null) {
    const element = ReactDOM.render(React.createElement(RenderingTest, entry.config, null), deckGLContainer);
  }
}

function checkResults(name, content) {
    const goldenImage = referecenResults.get(name);

    let outputString = `testName: ${name}: `;
    if (content === goldenImage) {
      outputString += `passed`;
    } else {
      outputString += `failed`;
    }

    const paragraph = document.createElement('p');
    const testResult = document.createTextNode(outputString);
    paragraph.appendChild(testResult);
    resultContainer.appendChild(paragraph);

    resultCount++;

    if (resultCount >= runningTests) {
      throw new Error('This is not an error. This is just to abort the rendering test');
    }
}
// testResult.style.position = 'relative';
