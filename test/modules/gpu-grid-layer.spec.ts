// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests, testInitializeLayer} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {GPUGridLayer} from '@deck.gl/aggregation-layers';
import GPUGridCellLayer from '@deck.gl/aggregation-layers/gpu-grid-layer/gpu-grid-cell-layer';
import {device} from '@deck.gl/test-utils';

const SAMPLE_PROPS = {
  data: FIXTURES.points.slice(0, 3),
  getPosition: d => d.COORDINATES
};

test('GPUGridLayer', () => {
  const testCases = generateLayerTests({
    Layer: GPUGridLayer,
    sampleProps: SAMPLE_PROPS,
    assert: (cond, msg) => expect(cond).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate({layer}) {
      expect(layer.state.weights, 'should update state.weights').toBeTruthy();
    }
  });

  testLayer({Layer: GPUGridLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('GPUGridLayer#renderLayers', () => {
  makeSpy(GPUGridLayer.prototype, '_updateAggregation');

  const layer = new GPUGridLayer(SAMPLE_PROPS);

  testInitializeLayer({layer, onError: err => expect(err).toBeFalsy()});

  // render sublayer
  const sublayer = layer.renderLayers();
  testInitializeLayer({layer: sublayer, onError: err => expect(err).toBeFalsy()});

  expect(
    sublayer instanceof GPUGridCellLayer,
    'Sublayer GPUGridCellLayer layer rendered'
  ).toBeTruthy();

  expect(
    GPUGridLayer.prototype._updateAggregation.called,
    'should call _updateAggregation'
  ).toBeTruthy();
  GPUGridLayer.prototype._updateAggregation.restore();
});

test('GPUGridLayer#updates', () => {
  testLayer({
    Layer: GPUGridLayer,
    onError: err => expect(err).toBeFalsy(),
    testCases: [
      {
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          const {weights, numCol, numRow, boundingBox} = layer.state;

          expect(weights.color.aggregationBuffer, 'Data is aggregated').toBeTruthy();
          expect(numCol && numRow, 'gridSize is calculated').toBeTruthy();
          expect(
            Number.isFinite(boundingBox.xMin) && Number.isFinite(boundingBox.xMax),
            'boundingBox is calculated'
          ).toBeTruthy();
        }
      },
      {
        updateProps: {
          colorRange: GPUGridLayer.defaultProps.colorRange.slice()
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({layer, subLayers, spies}) {
          expect(spies._updateAggregation.called, 'should not call _updateAggregation').toBeFalsy();

          spies._updateAggregation.restore();
        }
      },
      {
        updateProps: {
          cellSize: 10
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({layer, subLayers, spies}) {
          expect(spies._updateAggregation.called, 'should call _updateAggregation').toBeTruthy();

          spies._updateAggregation.restore();
        }
      },
      {
        updateProps: {
          colorAggregation: 'MAX'
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({layer, subLayers, spies}) {
          expect(spies._updateAggregation.called, 'should call _updateAggregation').toBeTruthy();

          spies._updateAggregation.restore();
        }
      }
    ]
  });
});
