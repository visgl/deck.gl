// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable func-style, no-console, max-len */
import test from 'tape-promise/tape';
import {device, getLayerUniforms} from '@deck.gl/test-utils';
import ScreenGridCellLayer from '@deck.gl/aggregation-layers/screen-grid-layer/screen-grid-cell-layer';

import {testLayer} from '@deck.gl/test-utils';
let cellSize;

test('ScreenGridCellLayer#constructor', t => {
  const SAMPLE_BUFFER = device.createBuffer({});

  testLayer({
    Layer: ScreenGridCellLayer,
    onError: t.notOk,
    testCases: [
      {
        title: 'Constructor',
        props: {
          data: {
            attributes: {
              instanceWeights: SAMPLE_BUFFER,
              instancePositions: SAMPLE_BUFFER
            }
          },
          cellSizePixels: 100,
          cellMarginPixels: 2,
          numInstances: 1,
          colorDomain: () => [0, 1]
        }
      },
      {
        updateProps: {
          cellSizePixels: 50 // default 100
        },
        onBeforeUpdate({layer}) {
          const uniforms = getLayerUniforms(layer);
          cellSize = uniforms.cellSizeClipspace;
        },
        onAfterUpdate({layer}) {
          t.ok(layer.state, 'should update layer state');
          const uniforms = getLayerUniforms(layer);
          t.notDeepEqual(
            uniforms.cellSizeClipspace,
            cellSize,
            'should update cellSizeClipspace uniform'
          );
        }
      },
      {
        updateProps: {
          colorDomain: () => [5, 50]
        },
        onAfterUpdate({layer, oldState}) {
          const uniforms = getLayerUniforms(layer);
          t.deepEqual(uniforms.colorDomain, [5, 50], 'should update colorDomain uniform');
        }
      }
    ]
  });

  t.end();
});
