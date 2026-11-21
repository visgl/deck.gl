// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {NullDevice} from '@luma.gl/core/test-utils';
import {ColumnLayer, PointCloudLayer} from '@deck.gl/layers';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';
import {ColumnLayerColumns} from '@deck.gl/layers/column-layer/column-layer-columns';
import {PointCloudLayerColumns} from '@deck.gl/layers/point-cloud-layer/point-cloud-layer-columns';

test('Arrow-backed point and column layers pack fallback colors on Deck toggles', async () => {
  const device = new NullDevice({});
  const getPosition = vectorFromArray(
    [[0, 0, 0]],
    new FixedSizeList(3, new Field('x', new Float32()))
  );
  const getColor = [1, 0.5, 0] as const;
  const cases = [
    [
      new PointCloudLayerColumns(device),
      new PointCloudLayer({getPosition, getColor}).props,
      'instanceColors'
    ],
    [
      new ColumnLayerColumns(device),
      new ColumnLayer({getPosition, getFillColor: getColor}).props,
      'instanceFillColors'
    ]
  ] as const;
  try {
    for (const [columns, props, attribute] of cases) {
      for (const normalizedColors of [false, true, false]) {
        await columns.updateIfNeeded(
          {props, oldProps: props, changeFlags: {}},
          {
            normalizedColors,
            dataLoading: false,
            changed: () => {},
            failed: error => {
              throw error;
            }
          }
        );
        const colors = (columns as any).prepared.columns;
        expect(Array.from(colors[attribute].value)).toEqual(
          normalizedColors ? [255, 128, 0, 255] : [1, 0, 0, 255]
        );
        if (colors.instanceLineColors) {
          expect(Array.from(colors.instanceLineColors.value)).toEqual([0, 0, 0, 255]);
        }
      }
    }
  } finally {
    for (const [columns] of cases) columns.destroy();
    device.destroy();
  }
});
