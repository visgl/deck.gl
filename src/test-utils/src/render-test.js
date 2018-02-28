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
import assert from 'assert';

import SceneRenderer from './scene-renderer';

import {diffImagePixels} from './luma.gl/gpgpu';
import {createImage, getImagePixelData} from './luma.gl/io-basic/browser-image-utils';

// Default reporting method
function reportResultInBrowser({name, passed, percentage, renderTest}) {
  const outputString = `${name}: ${(percentage * 100).toFixed(3)}% ${passed ? 'PASS' : 'FAIL'}`;

  const paragraph = document.createElement('p');
  const testResult = document.createTextNode(outputString);
  paragraph.style.color = passed ? '#74ff69' : '#ff2857';
  paragraph.appendChild(testResult);
  renderTest.resultContainer.appendChild(paragraph);
}

function reportFinalResultInBrowser({passed, renderTest}) {
  const outputString = `${passed ? 'All CASES PASSED!' : 'NOT All CASES PASSED!'}`;

  const paragraph = document.createElement('p');
  const testResult = document.createTextNode(outputString);
  paragraph.style.color = passed ? '#0bff1c' : '#ff0921';
  paragraph.appendChild(testResult);
  renderTest.flagContainer.appendChild(paragraph);
}

export default class RenderTest {
  constructor({
    testCases,
    width = 800,
    height = 450,
    // Max color delta in the YIQ difference metric for two pixels to be considered the same
    colorDeltaThreshold = 255 * 0.05,
    // Percentage of pixels that must be the same for the test to pass
    testPassThreshold = 0.99,
    reportResult = reportResultInBrowser,
    reportFinalResult = reportFinalResultInBrowser
  } = {}) {
    assert(testCases);

    this.sceneRenderer = new SceneRenderer({
      width,
      height,
      scenes: testCases,
      onSceneRendered: this._onSceneRendered.bind(this),
      onComplete: this._onComplete.bind(this)
    });

    this.colorDeltaThreshold = colorDeltaThreshold;
    this.testPassThreshold = testPassThreshold;
    this.reportResult = reportResult;
    this.reportFinalResult = reportFinalResult;

    this._initializeDOM(width, height);
  }

  _initializeDOM(width, height) {
    // DeckGL container
    const deckGLContainer = document.createElement('div');
    deckGLContainer.style.position = 'absolute';
    // hide deckgl canvas
    deckGLContainer.style.visibility = 'hidden';

    this.referenceImage = createImage(width, height);

    // Test result container
    this.resultContainer = document.createElement('div');
    this.resultContainer.style.position = 'absolute';
    this.resultContainer.style.zIndex = 1;

    // Show the image element so the developer could save the image as
    // the golden image
    document.body.appendChild(deckGLContainer);
    document.body.appendChild(this.referenceImage);
    // document.body.appendChild(this.resultImage);
    document.body.appendChild(this.resultContainer);
  }

  _diffResult({name, image, referenceImage}) {
    const referencePixelData = getImagePixelData(referenceImage);
    const resultPixelData = getImagePixelData(image);

    const percentage = diffImagePixels(resultPixelData, referencePixelData);

    const passed = percentage >= this.testPassThreshold;
    this.passed = this.passed && passed;

    return {
      name,
      passed,
      percentage,
      testPassThreshold: this.testPassThreshold
    };
  }

  _loadReferenceImage(url) {
    return new Promise(resolve => {
      this.referenceImage.onload = () => {
        resolve(this.referenceImage);
      };

      this.referenceImage.src = url;
    });
  }

  _onSceneRendered({name, image, referenceImageUrl}) {
    return this._loadReferenceImage(referenceImageUrl).then(referenceImage => {
      // Both images are loaded, compare results
      const diffResult = this._diffResult({name, image, referenceImage});
      // Print diff result
      this.reportResult(Object.assign({renderTest: this}, diffResult));
    });
  }

  _onComplete() {
    this.reportResult({passed: this.passed, renderTest: this});
  }

  run() {
    this.passed = true;
    this.sceneRenderer.run();
  }
}
