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

const DEFAULT_TEST_CASE = {
  name: 'Unnamed interaction test',
  events: [],
  onBeforeEvents: ({deck}) => {},
  onAfterEvents: ({deck, layers, context}) => {}
};

function sleep(timeout) {
  return new Promise(resolve => window.setTimeout(resolve, timeout));
}

export default class InteractionTestRunner extends TestRunner {
  get defaultTestCase() {
    return DEFAULT_TEST_CASE;
  }

  // chain events
  // TODO - switch to async/await
  runTestCase(testCase, onDone) {
    testCase.context = testCase.onBeforeEvents({
      deck: this.deck
    });

    let promise = Promise.resolve();
    for (const event of testCase.events) {
      if (event.wait) {
        promise = promise.then(() => sleep(event.wait));
      } else {
        promise = promise.then(() => window.browserTestDriver_emulateInput(event));
      }
    }
    return promise.then(onDone);
  }

  assert(testCase) {
    testCase.onAfterEvents({
      deck: this.deck,
      layers: this.deck.layerManager.getLayers(),
      context: testCase.context
    });
    this._next();
  }
}
