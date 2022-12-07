// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

import test from 'tape-promise/tape';
import * as FIXTURES from 'deck.gl-test/data';
import {testLayer, generateLayerTests, testInitializeLayer} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {GPUGridLayer} from '@deck.gl/aggregation-layers';
import GPUGridCellLayer from '@deck.gl/aggregation-layers/gpu-grid-layer/gpu-grid-cell-layer';
import {setupSpysForWebGL1, restoreSpies} from './webgl1-spies-utils';
import {device} from '@deck.gl/test-utils';

const SAMPLE_PROPS = {
  data: FIXTURES.points.slice(0, 3),
  getPosition: d => d.COORDINATES
};

test('GPUGridLayer', t => {
  const webgl1Spies = setupSpysForWebGL1(device);
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

  restoreSpies(webgl1Spies);
  t.end();
});

test('GPUGridLayer#renderLayers', t => {
  const webgl1Spies = setupSpysForWebGL1(device);

  makeSpy(GPUGridLayer.prototype, '_updateAggregation');

  const layer = new GPUGridLayer(SAMPLE_PROPS);

  testInitializeLayer({layer, onError: t.notOk});

  // render sublayer
  const sublayer = layer.renderLayers();
  testInitializeLayer({layer: sublayer, onError: t.notOk});

  t.ok(sublayer instanceof GPUGridCellLayer, 'Sublayer GPUGridCellLayer layer rendered');

  t.ok(GPUGridLayer.prototype._updateAggregation.called, 'should call _updateAggregation');
  GPUGridLayer.prototype._updateAggregation.restore();

  restoreSpies(webgl1Spies);
  t.end();
});

test('GPUGridLayer#updates', t => {
  const webgl1Spies = setupSpysForWebGL1(device);
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

  restoreSpies(webgl1Spies);
  t.end();
});
