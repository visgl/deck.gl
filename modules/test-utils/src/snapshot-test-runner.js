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

/* global window */
import TestRunner from './test-runner';
import {getBoundingBoxInPage} from './utils/dom';

const DEFAULT_TEST_OPTIONS = {
  imageDiffOptions: {}
};

const DEFAULT_TEST_CASE = {
  name: 'Unnamed snapshot test',
  props: {},
  onAfterRender: ({deck, layers, done}) => done(),
  goldenImage: ''
};

export default class SnapshotTestRunner extends TestRunner {
  constructor(props) {
    super(props);

    this.isDiffing = false;

    Object.assign(this.testOptions, DEFAULT_TEST_OPTIONS);
  }

  get defaultTestCase() {
    return DEFAULT_TEST_CASE;
  }

  initTestCase(testCase) {
    super.initTestCase(testCase);
    if (!testCase.goldenImage) {
      throw new Error(`Test case ${testCase.name} does not have golden image`);
    }
  }

  runTestCase(testCase, onDone) {
    const {deck} = this;

    deck.setProps(
      Object.assign({}, this.props, testCase, {
        onAfterRender: () => {
          testCase.onAfterRender({
            deck,
            layers: deck.layerManager.getLayers(),
            done: onDone
          });
        }
      })
    );
  }

  shouldRender() {
    // wait for the current diffing to finish
    return !this.isDiffing;
  }

  assert(testCase) {
    if (this.isDiffing) {
      // already performing diffing
      return;
    }
    this.isDiffing = true;

    const diffOptions = Object.assign(
      {},
      this.testOptions.imageDiffOptions,
      testCase.imageDiffOptions,
      {
        goldenImage: testCase.goldenImage,
        region: getBoundingBoxInPage(this.deck.canvas)
      }
    );
    // Take screenshot and compare
    window.browserTestDriver_captureAndDiffScreen(diffOptions).then(result => {
      // invoke user callback
      if (result.success) {
        this._pass(result);
      } else {
        this._fail(result);
      }

      this.isDiffing = false;
      this._next();
    });
  }
}
