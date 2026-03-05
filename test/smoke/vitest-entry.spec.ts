// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils/vitest';

test('vitest-entry: testInitializeLayer works', () => {
  const layer = new ScatterplotLayer({
    id: 'smoke-test-layer',
    data: [{position: [0, 0]}],
    getPosition: d => d.position
  });
  testInitializeLayer({layer});
  // If we get here without throwing, test passes
});

test('vitest-entry: testLayer works with default vi.spyOn', () => {
  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        title: 'Initialize',
        props: {id: 'test', data: [{position: [0, 0]}], getPosition: d => d.position}
      }
    ],
    onError: e => {
      throw e;
    }
  });
  // If we get here without throwing, test passes
});

test('vitest-entry: testLayer works with explicit createSpy', () => {
  const customSpy = (obj: object, method: string) => vi.spyOn(obj, method as never);

  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        title: 'Initialize',
        props: {id: 'test', data: [{position: [0, 0]}], getPosition: d => d.position}
      }
    ],
    createSpy: customSpy,
    onError: e => {
      throw e;
    }
  });
});
