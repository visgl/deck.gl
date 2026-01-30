// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import {testLayer, generateLayerTests} from '@deck.gl/test-utils';

import {PolygonLayer} from 'deck.gl';

import * as FIXTURES from 'deck.gl-test/data';

test('PolygonLayer', () => {
  const testCases = generateLayerTests({
    Layer: PolygonLayer,
    sampleProps: {
      data: FIXTURES.polygons.slice(0, 3),
      getPolygon: f => f,
      getFillColor: (f, {index}) => [index, 0, 0]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      if (layer.props.data && layer.props.data.length) {
        expect(layer.state.paths.length, 'should update state.paths').toBeTruthy();
      }
      if (Object.prototype.hasOwnProperty.call(layer.props, '_dataDiff') && layer.props._dataDiff) {
        expect(
          Array.isArray(layer.state.pathsDiff),
          'created diff for sub path layer'
        ).toBeTruthy();
      }
    }
  });

  testLayer({Layer: PolygonLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
