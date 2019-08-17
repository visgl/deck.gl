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

/* global window, console */
/* eslint-disable no-console */
import {Deck, MapView} from '@deck.gl/core';

const GL_VENDOR = 0x1f00;

const DEFAULT_DECK_PROPS = Object.assign({}, Deck.defaultProps, {
  id: 'deckgl-render-test',
  width: 800,
  height: 450,
  style: {position: 'absolute', left: '0px', top: '0px'},
  views: [new MapView()],
  useDevicePixels: false,
  debug: true
});

const DEFAULT_TEST_OPTIONS = {
  // test lifecycle callback
  onTestStart: testCase => console.log(`# ${testCase.name}`),
  onTestPass: testCase => console.log(`ok ${testCase.name} passed`),
  onTestFail: testCase => console.log(`not ok ${testCase.name} failed`),

  // milliseconds to wait for each test case before aborting
  timeout: 2000
};

const DEFAULT_TEST_CASE = {
  name: 'Unnamed test'
};

export default class TestRunner {
  /**
   * props
   *   Deck props
   */
  constructor(props = {}) {
    this.props = Object.assign({}, DEFAULT_DECK_PROPS, props);

    this.isRunning = false;
    this._testCases = [];
    this._testCaseData = null;

    this.isHeadless = Boolean(window.browserTestDriver_isHeadless);

    this.testOptions = Object.assign({}, DEFAULT_TEST_OPTIONS);
  }

  get defaultTestCase() {
    return DEFAULT_TEST_CASE;
  }

  /**
   * Add testCase(s)
   */
  add(testCases) {
    if (!Array.isArray(testCases)) {
      testCases = [testCases];
    }
    for (const testCase of testCases) {
      this._testCases.push(testCase);
    }
    return this;
  }

  /**
   * Returns a promise that resolves when all the test cases are done
   */
  run(options = {}) {
    Object.assign(this.testOptions, options);

    return new Promise((resolve, reject) => {
      this.deck = new Deck(
        Object.assign({}, this.props, {
          onWebGLInitialized: this._onWebGLInitialized.bind(this),
          onLoad: resolve
        })
      );

      this.isRunning = true;
      this._currentTestCase = null;
    })
      .then(() => {
        let promise = Promise.resolve();
        // chain test case promises
        this._testCases.forEach(testCase => {
          promise = promise.then(() => this._runTest(testCase));
        });
        return promise;
      })
      .catch(error => {
        this._fail({error: error.message});
      })
      .finally(() => {
        this.deck.finalize();
        this.deck = null;
      });
  }

  /* Lifecycle methods for subclassing */

  initTestCase(testCase) {
    for (const key in this.defaultTestCase) {
      if (!(key in testCase)) {
        testCase[key] = this.defaultTestCase[key];
      }
    }
    this.testOptions.onTestStart(testCase);
  }

  assert(testCase) {
    this.onTestPass(testCase);
    this._next();
  }

  /* Utilities */

  _pass(result) {
    this.testOptions.onTestPass(this._currentTestCase, result);
  }

  _fail(result) {
    this.testOptions.onTestFail(this._currentTestCase, result);
  }

  /* Private Methods */

  _onWebGLInitialized(gl) {
    const vendorMasked = gl.getParameter(GL_VENDOR);
    const ext = gl.getExtension('WEBGL_debug_renderer_info');
    const vendorUnmasked = ext && gl.getParameter(ext.UNMASKED_VENDOR_WEBGL || GL_VENDOR);
    this.gpuVendor = vendorUnmasked || vendorMasked;
  }

  _runTest(testCase) {
    return new Promise((resolve, reject) => {
      this._currentTestCase = testCase;
      this._next = resolve;

      // normalize test case
      this.initTestCase(testCase);

      let isDone = false;
      let timeoutId = null;
      const done = () => {
        if (!isDone) {
          isDone = true;
          window.clearTimeout(timeoutId);
          this.assert(testCase);
        }
      };

      timeoutId = window.setTimeout(done, testCase.timeout || this.testOptions.timeout);

      this.runTestCase(testCase, done);
    });
  }
}
