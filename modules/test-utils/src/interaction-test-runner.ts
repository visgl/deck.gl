// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

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
