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
import {TestRunner} from './test-runner';
import type {Deck, Layer} from '@deck.gl/core';

type InteractionEvent =
  | {
      type: string;
      [key: string]: any;
    }
  | {
      wait: number;
    };

export type InteractionTestCase = {
  name: string;
  events: InteractionEvent[];
  timeout?: number;
  context?: any;
  onBeforeEvents: (params: {deck: Deck}) => any;
  onAfterEvents: (params: {deck: Deck; layers: Layer[]; context: any}) => void;
};

const DEFAULT_TEST_CASE: InteractionTestCase = {
  name: 'Unnamed interaction test',
  events: [],
  onBeforeEvents: ({deck}) => {},
  onAfterEvents: ({deck, layers, context}) => {}
};

function sleep(timeout: number): Promise<void> {
  return new Promise(resolve => window.setTimeout(resolve, timeout));
}

export class InteractionTestRunner extends TestRunner<InteractionTestCase, {}> {
  get defaultTestCase() {
    return DEFAULT_TEST_CASE;
  }

  // chain events
  async runTestCase(testCase: InteractionTestCase) {
    testCase.context = testCase.onBeforeEvents({
      deck: this.deck!
    });

    for (const event of testCase.events) {
      if (event.wait) {
        await sleep(event.wait);
      } else {
        await window.browserTestDriver_emulateInput(event);
      }
    }
  }

  async assert(testCase) {
    testCase.onAfterEvents({
      deck: this.deck,
      // @ts-expect-error Accessing protected layerManager
      layers: this.deck.layerManager.getLayers(),
      context: testCase.context
    });
  }
}
