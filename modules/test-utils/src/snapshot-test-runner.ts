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
import {getBoundingBoxInPage} from './utils/dom';

import type {DeckProps, Deck, Layer} from '@deck.gl/core';

// TODO - export from probe.gl
type ImageDiffOptions = {
  saveOnFail?: boolean;
  saveAs?: string;
  threshold?: number; // 0.99,
  createDiffImage?: boolean; // false,
  tolerance?: number; // 0.1,
  includeAA?: boolean; // false,
  includeEmpty?: boolean; // true
};

type DiffImageResult = {
  headless: boolean;
  match: string | number;
  matchPercentage: string;
  success: boolean;
  error: Error | string | null;
};

export type SnapshotTestCase = {
  name: string;
  props: DeckProps;
  goldenImage: string;
  onBeforeRender?: (params: {deck: Deck; layers: Layer[]}) => void;
  onAfterRender?: (params: {deck: Deck; layers: Layer[]; done: () => void}) => void;
  timeout?: number;
  imageDiffOptions?: ImageDiffOptions;
};

const DEFAULT_TEST_OPTIONS = {
  imageDiffOptions: {}
};

const DEFAULT_TEST_CASE: SnapshotTestCase = {
  name: 'Unnamed snapshot test',
  props: {},
  onBeforeRender: ({deck, layers}) => {
    // eslint-disable-line
  },
  onAfterRender: ({deck, layers, done}) => {
    if (
      // @ts-expect-error accessing private
      !deck.layerManager?.needsUpdate() &&
      layers.every(layer => layer.isLoaded)
    ) {
      done(); // eslint-disable-line
    }
  },
  goldenImage: ''
};

export class SnapshotTestRunner extends TestRunner<
  SnapshotTestCase,
  DiffImageResult,
  {imageDiffOptions: ImageDiffOptions}
> {
  private _isDiffing: boolean = false;

  constructor(props) {
    super(props, DEFAULT_TEST_OPTIONS);

    this._isDiffing = false;
  }

  get defaultTestCase() {
    return DEFAULT_TEST_CASE;
  }

  initTestCase(testCase: SnapshotTestCase) {
    super.initTestCase(testCase);
    if (!testCase.goldenImage) {
      throw new Error(`Test case ${testCase.name} does not have golden image`);
    }
  }

  runTestCase(testCase: SnapshotTestCase) {
    const deck = this.deck!;

    return new Promise<void>(resolve => {
      deck.setProps({
        ...this.props,
        ...testCase,
        onBeforeRender: () => {
          testCase.onBeforeRender!({
            deck,
            // @ts-expect-error Accessing protected layerManager
            layers: this.deck.layerManager.getLayers()
          });
        },
        onAfterRender: () => {
          testCase.onAfterRender!({
            deck,
            // @ts-expect-error Accessing protected layerManager
            layers: this.deck.layerManager.getLayers(),
            done: resolve
          });
        }
      });
    });
  }

  async assert(testCase: SnapshotTestCase) {
    if (this._isDiffing) {
      // already performing diffing
      return;
    }
    this._isDiffing = true;

    const diffOptions = {
      ...this.testOptions.imageDiffOptions,
      ...testCase.imageDiffOptions,
      goldenImage: testCase.goldenImage,
      region: getBoundingBoxInPage(this.deck!.getCanvas()!)
    };
    // Take screenshot and compare
    const result = await window.browserTestDriver_captureAndDiffScreen(diffOptions);
    // debugger
    // invoke user callback
    if (result.success) {
      this.pass(result);
    } else {
      this.fail(result);
    }

    this._isDiffing = false;
  }
}
