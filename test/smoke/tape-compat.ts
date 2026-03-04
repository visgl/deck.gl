// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-catch';
import {makeSpy} from '@probe.gl/test-utils';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';

test('tape-compat: testInitializeLayer works', t => {
  const layer = new ScatterplotLayer({
    id: 'smoke-test-layer',
    data: [{position: [0, 0]}],
    getPosition: d => d.position
  });
  testInitializeLayer({layer});
  t.pass('testInitializeLayer completed');
  t.end();
});

test('tape-compat: testLayer works with explicit createSpy', t => {
  testLayer({
    Layer: ScatterplotLayer,
    testCases: [
      {
        title: 'Initialize',
        props: {id: 'test', data: [{position: [0, 0]}], getPosition: d => d.position}
      }
    ],
    createSpy: makeSpy,
    onError: e => t.fail(e.message)
  });
  t.pass('testLayer completed');
  t.end();
});
