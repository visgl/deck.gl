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

import {window, document} from 'global';

import SceneRenderer from './scene-renderer';

import {diffImagePixels} from './luma.gl/gpgpu';
import {createImage, getImagePixelData} from './luma.gl/io-basic/browser-image-utils';

export default class RenderTest {
  constructor({
    testCases,
    width = 800,
    height = 450,
    // Max color delta in the YIQ difference metric for two pixels to be considered the same
    colorDeltaThreshold = 255 * 0.05,
    // Percentage of pixels that must be the same for the test to pass
    testPassThreshold = 0.99,
    stopOnFail = true,
    reportResult = reportResultInBrowser,
    reportFinalResult = reportFinalResultInBrowser
  } = {}) {
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

    Object.assign(this, initializeDOM({width, height}));
  }

  run() {
    this.passed = true;
    this.failedTest = null;
    this.sceneRenderer.run();
  }

  // PRIVATE METHODS

  _diffResult({name, image, referenceImage}) {
    const referencePixelData = getImagePixelData(referenceImage);
    const resultPixelData = getImagePixelData(image);

    const percentage = diffImagePixels(resultPixelData, referencePixelData);

    const passed = percentage >= this.testPassThreshold;
    this.passed = this.passed && passed;
    this.failedTest = this.failedTest || (this.passed ? null : name);

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
      const {passed, percentage, testPassThreshold} = this._diffResult({
        name,
        image,
        referenceImage
      });

      // Print diff result
      this.reportResult({
        renderTest: this,
        name,
        passed,
        percentage,
        testPassThreshold
      });

      if (!passed) {
        this.sceneRenderer.stop();
      }
    });
  }

  _onComplete() {
    this.reportFinalResult({passed: this.passed, renderTest: this});
    this._reportToTestDriver();
  }

  // Node test driver (puppeteer) may not have had time to expose the function
  // if the test suite is short. If not available, wait a second and try again
  _reportToTestDriver() {
    if (window.testDone) {
      const result = {success: this.passed, failedTest: this.failedTest || ''};
      const resultString = JSON.stringify(result);
      window.testDone(resultString);
    } else {
      console.warn('testDone not exposed, waiting 1 second'); // eslint-disable-line
      window.setTimeout(this._reportToTestDriver.bind(this), 1000);
    }
  }
}

function initializeDOM({width, height}) {
  // DeckGL container
  const deckGLContainer = document.createElement('div');
  deckGLContainer.style.position = 'absolute';
  // hide deckgl canvas
  deckGLContainer.style.visibility = 'hidden';

  const referenceImage = createImage(width, height);

  const resultContainer = document.createElement('div');
  resultContainer.style.position = 'absolute';
  resultContainer.style.top = `0px`;
  resultContainer.style.left = `${width}px`;
  resultContainer.style.zIndex = 1;

  // Final flag container
  const flagContainer = document.createElement('div');
  flagContainer.style.position = 'absolute';
  flagContainer.style.top = `${height + 50}px`;

  document.body.appendChild(deckGLContainer);
  document.body.appendChild(referenceImage);
  // document.body.appendChild(resultImage);
  document.body.appendChild(resultContainer);
  document.body.appendChild(flagContainer);

  return {resultContainer, flagContainer, referenceImage};
}

// Default reporting method
function reportResultInBrowser({name, passed, percentage, renderTest}) {
  console.log(`Rendered new scene ${name} ${passed}`); // eslint-disable-line

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
