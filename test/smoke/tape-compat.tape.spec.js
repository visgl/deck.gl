// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import tape from 'tape';
import {makeSpy} from '@probe.gl/test-utils';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer, testInitializeLayer} from '@deck.gl/test-utils';
import {expect, test} from 'vitest';

test('legacy test utilities work with Tape', async () => {
  const harness = tape.createHarness();
  const assertions = [];
  harness.createStream({objectMode: true}).on('data', result => {
    if (result.type === 'assert') {
      assertions.push(result);
    }
  });

  const finished = new Promise(resolve => harness.onFinish(resolve));

  harness('tape-compat: testInitializeLayer works', t => {
    const layer = new ScatterplotLayer({
      id: 'smoke-test-layer',
      data: [{position: [0, 0]}],
      getPosition: d => d.position
    });
    testInitializeLayer({layer});
    t.pass('testInitializeLayer completed');
    t.end();
  });

  harness('tape-compat: testLayer works with explicit createSpy and resetSpy', t => {
    testLayer({
      Layer: ScatterplotLayer,
      testCases: [
        {
          title: 'Initialize',
          props: {id: 'test', data: [{position: [0, 0]}], getPosition: d => d.position}
        }
      ],
      createSpy: makeSpy,
      resetSpy: spy => spy.reset(),
      onError: error => t.fail(error.message)
    });
    t.pass('testLayer completed');
    t.end();
  });

  await finished;

  expect(assertions.length).toBeGreaterThan(0);
  expect(assertions.filter(assertion => !assertion.ok)).toEqual([]);
});
