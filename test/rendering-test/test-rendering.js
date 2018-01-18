// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

import {document} from 'global';

import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import DeckGL, {experimental} from 'deck.gl';
const {Deck} = experimental; // eslint-disable-line

import * as CONFIG from './test-config';

import {diffImages} from '@deck.gl/test-utils';

// DeckGL container
const deckGLContainer = document.createElement('div');
deckGLContainer.style.position = 'absolute';

// hide deckgl canvas
deckGLContainer.style.visibility = 'hidden';

const referenceImage = createImage();
// Show the image element so the developer could save the image as
// the golden image
const resultImage = createImage();
resultImage.style.mixBlendMode = 'difference';

// Test result container
const resultContainer = document.createElement('div');
resultContainer.style.position = 'absolute';
resultContainer.style.left = `${CONFIG.WIDTH}px`;
resultContainer.style.zIndex = 1;

document.body.appendChild(deckGLContainer);
document.body.appendChild(referenceImage);
document.body.appendChild(resultImage);
document.body.appendChild(resultContainer);

class RenderingTest extends Component {
  constructor(props) {
    super(props);

    this.state = {
      runningTests: {},
      currentTestIndex: 0,
      renderingCount: 0
    };
  }

  _diffResult(name) {
    const referencePixelData = getPixelData(referenceImage, CONFIG.WIDTH, CONFIG.HEIGHT);
    const resultPixelData = getPixelData(resultImage, CONFIG.WIDTH, CONFIG.HEIGHT);

    const pixelCount = resultPixelData.data.length / 4;
    const maxDeltaSq = CONFIG.COLOR_DELTA_THRESHOLD * CONFIG.COLOR_DELTA_THRESHOLD;
    let badPixels = 0;
    for (let i = 0; i < pixelCount; i++) {
      const delta = diffImages(resultPixelData.data, referencePixelData.data, i);
      if (delta > maxDeltaSq) {
        badPixels++;
      }
    }

    // Print diff result
    reportResult(name, 1 - badPixels / pixelCount);

    // Render the next test case
    this.setState({
      currentTestIndex: this.state.currentTestIndex + 1,
      renderingCount: 0
    });
  }

  _onDrawComplete(name, referenceResult, completed, {gl}) {
    if (!completed) {
      this.setState({
        renderingCount: this.state.renderingCount + 1
      });
      return;
    }

    if (this.state.runningTests[name]) {
      return;
    }
    // Mark current test as running
    this.state.runningTests[name] = true;

    referenceImage.onload = () => {
      resultImage.onload = () => {
        // Both images are loaded, compare results
        this._diffResult(name);
      };
      resultImage.src = gl.canvas.toDataURL();
    };
    referenceImage.src = referenceResult;
  }

  render() {
    const {currentTestIndex, renderingCount} = this.state;
    const {width, height, testCases} = this.props;

    if (!testCases[currentTestIndex]) {
      return null;
    }

    const {mapViewState, viewport, layersList, name, referenceResult, renderingTimes} = testCases[
      currentTestIndex
    ];

    const layers = [];
    const viewportProps = Object.assign({}, mapViewState, {width, height});

    // const needLoadResource = false;
    // constructing layers
    for (const layer of layersList) {
      const {type, props} = layer;
      if (type !== undefined) {
        layers.push(new type(props)); // eslint-disable-line
      }
    }

    const maxRenderingCount = renderingTimes ? renderingTimes : 0;
    const completed = renderingCount >= maxRenderingCount;

    return React.createElement(DeckGL, {
      id: 'default-deckgl-overlay',
      width,
      height,
      layers,
      debug: true,
      onAfterRender: this._onDrawComplete.bind(this, name, referenceResult, completed),
      viewport: new viewport(viewportProps) // eslint-disable-line
    });
  }
}

ReactDOM.render(
  React.createElement(
    RenderingTest,
    {
      width: CONFIG.WIDTH,
      height: CONFIG.HEIGHT,
      testCases: CONFIG.TEST_CASES
    },
    null
  ),
  deckGLContainer
);

function createImage() {
  const image = document.createElement('img');
  image.width = CONFIG.WIDTH;
  image.height = CONFIG.HEIGHT;
  image.style.position = 'absolute';
  image.style.top = 0;
  image.style.left = 0;

  return image;
}

function getPixelData(sourceElement, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(sourceElement, 0, 0, width, height);
  return ctx.getImageData(0, 0, width, height);
}

function reportResult(name, percentage) {
  const passed = percentage >= CONFIG.TEST_PASS_THRESHOLD;
  const outputString = `${name}: ${(percentage * 100).toFixed(3)}% ${passed ? 'PASS' : 'FAIL'}`;

  const paragraph = document.createElement('p');
  const testResult = document.createTextNode(outputString);
  paragraph.style.color = passed ? '#74ff69' : '#ff2857';
  paragraph.appendChild(testResult);
  resultContainer.appendChild(paragraph);
}
