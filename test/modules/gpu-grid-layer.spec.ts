// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('GPUGridLayer', t => {
  const testCases = generateLayerTests({
    Layer: GPUGridLayer,
    sampleProps: SAMPLE_PROPS,
    assert: t.ok,
    onBeforeUpdate: ({testCase}) => t.comment(testCase.title),
    onAfterUpdate({layer}) {
      t.ok(layer.state.weights, 'should update state.weights');
    }
  });

  testLayer({Layer: GPUGridLayer, testCases, onError: t.notOk});
  t.end();
});

test('GPUGridLayer#renderLayers', t => {
  makeSpy(GPUGridLayer.prototype, '_updateAggregation');

  const layer = new GPUGridLayer(SAMPLE_PROPS);

  testInitializeLayer({layer, onError: t.notOk});

  // render sublayer
  const sublayer = layer.renderLayers();
  testInitializeLayer({layer: sublayer, onError: t.notOk});

  t.ok(sublayer instanceof GPUGridCellLayer, 'Sublayer GPUGridCellLayer layer rendered');

  t.ok(GPUGridLayer.prototype._updateAggregation.called, 'should call _updateAggregation');
  GPUGridLayer.prototype._updateAggregation.restore();

  t.end();
});

test('GPUGridLayer#updates', t => {
  testLayer({
    Layer: GPUGridLayer,
    onError: t.notOk,
    testCases: [
      {
        props: SAMPLE_PROPS,
        onAfterUpdate({layer}) {
          const {weights, numCol, numRow, boundingBox} = layer.state;

          t.ok(weights.color.aggregationBuffer, 'Data is aggregated');
          t.ok(numCol && numRow, 'gridSize is calculated');
          t.ok(
            Number.isFinite(boundingBox.xMin) && Number.isFinite(boundingBox.xMax),
            'boundingBox is calculated'
          );
        }
      },
      {
        updateProps: {
          colorRange: GPUGridLayer.defaultProps.colorRange.slice()
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.notOk(spies._updateAggregation.called, 'should not call _updateAggregation');

          spies._updateAggregation.restore();
        }
      },
      {
        updateProps: {
          cellSize: 10
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(spies._updateAggregation.called, 'should call _updateAggregation');

          spies._updateAggregation.restore();
        }
      },
      {
        updateProps: {
          colorAggregation: 'MAX'
        },
        spies: ['_updateAggregation'],
        onAfterUpdate({layer, subLayers, spies}) {
          t.ok(spies._updateAggregation.called, 'should call _updateAggregation');

          spies._updateAggregation.restore();
        }
      }
    ]
  });

  t.end();
});
