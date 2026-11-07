// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {OrthographicView} from '@deck.gl/core';
import {GridLayer, ScreenGridLayer} from '@deck.gl/aggregation-layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';
import {WebGPUAggregator} from '../../../../modules/aggregation-layers/src/common/aggregator/webgpu-aggregator/webgpu-aggregator';

for (const filtering of [false, true]) {
  test(`Grid compute domains, picking, and scales (filtering=${filtering})`, async ({skip}) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    const callback = vi.fn();
    const errors: Error[] = [];
    device.handle.pushErrorScope('validation');
    try {
      await testLayerAsync({
        Layer: GridLayer,
        device,
        viewport: new OrthographicView().makeViewport({
          width: 200,
          height: 200,
          viewState: {target: [0, 0, 0], zoom: 0}
        }),
        onError: error => {
          errors.push(error);
        },
        testCases: [
          {
            props: {
              data: [
                {position: [2, 2], value: 2, filter: 0},
                {position: [3, 3], value: 3, filter: 2},
                {position: [22, 22], value: 4, filter: 0}
              ],
              getPosition: d => d.position,
              getColorWeight: d => d.value,
              getElevationWeight: d => d.value,
              cellSize: 10,
              pickable: true,
              onSetColorDomain: callback,
              extensions: filtering ? [new DataFilterExtension({filterSize: 1})] : [],
              getFilterValue: d => d.filter,
              filterRange: [0, 1]
            },
            async onAfterUpdate({layer}) {
              const aggregator = layer.state.aggregator;
              expect(aggregator).toBeInstanceOf(WebGPUAggregator);
              await vi.waitFor(() => expect(aggregator.getResultValues(0)).not.toBeNull(), {
                timeout: 10000
              });
              expect(aggregator.getResultDomain(0)).toEqual(filtering ? [2, 4] : [4, 5]);
              const pickedIndex = Array.from({length: aggregator.binCount}, (_, i) => i).find(i =>
                aggregator.getBin(i)
              )!;
              expect(
                layer.getPickingInfo({info: {index: pickedIndex}} as any).object.count
              ).toBeGreaterThan(0);
              expect(callback).toHaveBeenCalledWith(filtering ? [2, 4] : [4, 5]);
              const bins = Array.from({length: aggregator.binCount}, (_, i) =>
                aggregator.getBin(i)
              ).filter(Boolean);
              expect(bins.reduce((sum, bin) => sum + bin.count, 0)).toBe(filtering ? 2 : 3);
              for (const scaleType of ['quantile', 'ordinal']) {
                const scaled = layer.state.colors.update({
                  scaleType,
                  lowerPercentile: 0,
                  upperPercentile: 100
                });
                expect(scaled.domain).toEqual(scaleType === 'quantile' ? [0, 99] : [0, 1]);
              }
              layer.state.colors.update({
                scaleType: 'linear',
                lowerPercentile: 25,
                upperPercentile: 75
              });
              expect(layer.state.colors.cutoff).not.toBeNull();
            }
          }
        ]
      });
      expect(errors).toEqual([]);
    } finally {
      expect(await device.handle.popErrorScope()).toBeNull();
    }
  });
}

test('ScreenGrid compute supports automatic domains and picking metadata', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const errors: Error[] = [];
  await testLayerAsync({
    Layer: ScreenGridLayer,
    device,
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [0, 0, 0], zoom: 0}
    }),
    onError: error => {
      errors.push(error);
    },
    testCases: [
      {
        props: {
          data: [
            [0, 0],
            [1, 1]
          ],
          getPosition: p => p,
          getWeight: 2,
          pickable: true,
          cellSizePixels: 100
        },
        async onAfterUpdate({layer}) {
          const aggregator = layer.state.aggregator;
          expect(aggregator).toBeInstanceOf(WebGPUAggregator);
          await vi.waitFor(() => expect(aggregator.getResultValues(0)).not.toBeNull(), {
            timeout: 10000
          });
          expect(aggregator.getResultDomain(0)).toEqual([4, 4]);
          expect(aggregator.getBin(0).count).toBe(2);
        }
      }
    ]
  });
  expect(errors).toEqual([]);
});

test('ScreenGrid applies clipping before reduction and updates extension uniforms', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {ClipExtension} = await import('@deck.gl/extensions');
  await testLayerAsync({
    Layer: ScreenGridLayer,
    device,
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [0, 0, 0], zoom: 0}
    }),
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          data: [
            [0, 0],
            [20, 20]
          ],
          getPosition: p => p,
          getWeight: 2,
          cellSizePixels: 100,
          extensions: [new ClipExtension()],
          clipByInstance: true,
          clipBounds: [-10, -10, 10, 10]
        },
        async onAfterUpdate({layer}) {
          await vi.waitFor(
            () => expect(layer.state.aggregator.getResultDomain(0)).toEqual([2, 2]),
            {timeout: 10000}
          );
        }
      },
      {
        updateProps: {clipBounds: [-30, -30, 30, 30]},
        async onAfterUpdate({layer}) {
          await vi.waitFor(
            () => expect(layer.state.aggregator.getResultDomain(0)).toEqual([4, 4]),
            {timeout: 10000}
          );
        }
      }
    ]
  });
});
