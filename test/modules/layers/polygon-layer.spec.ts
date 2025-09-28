// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

import {PolygonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';

test('PolygonLayer', t => {
  const testCases = generateLayerTests({
    Layer: PolygonLayer,
    sampleProps: {
      data: FIXTURES.polygons.slice(0, 3),
      getPolygon: f => f,
      getFillColor: (f, {index}) => [index, 0, 0]
    },
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      if (layer.props.data && layer.props.data.length) {
        t.ok(layer.state.paths.length, 'should update state.paths');
      }
      if (Object.prototype.hasOwnProperty.call(layer.props, '_dataDiff') && layer.props._dataDiff) {
        t.ok(Array.isArray(layer.state.pathsDiff), 'created diff for sub path layer');
      }
    }
  });

  testLayer({Layer: PolygonLayer, testCases, onError: t.notOk});

  t.end();
});
