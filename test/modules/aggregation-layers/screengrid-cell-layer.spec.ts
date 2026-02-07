// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable func-style, no-console, max-len */
import {test, expect} from 'vitest';
import {device, getLayerUniforms} from '@deck.gl/test-utils/vitest';
import ScreenGridCellLayer from '@deck.gl/aggregation-layers/screen-grid-layer/screen-grid-cell-layer';

import {testLayer} from '@deck.gl/test-utils/vitest';
let cellSize;

test('ScreenGridCellLayer#constructor', () => {
  const SAMPLE_BUFFER = device.createBuffer({});

  testLayer({
    Layer: ScreenGridCellLayer,
    onError: err => expect(err).toBeFalsy(),
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
          expect(layer.state, 'should update layer state').toBeTruthy();
          const uniforms = getLayerUniforms(layer);
          expect(uniforms.cellSizeClipspace, 'should update cellSizeClipspace uniform').not.toEqual(
            cellSize
          );
        }
      },
      {
        updateProps: {
          colorDomain: () => [5, 50]
        },
        onAfterUpdate({layer, oldState}) {
          const uniforms = getLayerUniforms(layer);
          expect(uniforms.colorDomain, 'should update colorDomain uniform').toEqual([5, 50]);
        }
      }
    ]
  });
});
