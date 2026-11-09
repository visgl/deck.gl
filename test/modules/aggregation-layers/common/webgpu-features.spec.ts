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

test('Compute metadata discards stale readbacks and handles empty input', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {Buffer} = await import('@luma.gl/core');
  const {GPUVector} = await import('@luma.gl/graph/gpu-data');
  const {WebGPUGridAggregator} = await import(
    '../../../../modules/aggregation-layers/src/grid-layer/webgpu-grid-aggregator'
  );
  const buffer = device.createBuffer({
    data: new Float32Array([0.1, 0.1, 0, 0.2, 0.2, 0, 2, 3]),
    usage: Buffer.STORAGE | Buffer.COPY_DST
  });
  const positions = new GPUVector({
    type: 'buffer',
    name: 'positions',
    format: 'float32x3',
    buffer,
    length: 2,
    ownsBuffer: false
  });
  const weights = new GPUVector({
    type: 'buffer',
    name: 'weights',
    format: 'float32',
    buffer,
    length: 2,
    byteOffset: 24,
    ownsBuffer: false
  });
  const aggregator = new WebGPUGridAggregator(device);
  const onUpdate = vi.fn();
  try {
    const viewport = new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [0, 0, 0], zoom: 0}
    });
    aggregator.setProps({
      positions,
      weights: [weights, weights],
      attributes: {},
      pointCount: 2,
      readback: true,
      operations: ['SUM', 'SUM'],
      binIdRange: [
        [0, 1],
        [0, 1]
      ],
      binOptions: {cellSizeCommon: [1, 1], cellOriginCommon: [0, 0]},
      onUpdate,
      shaderModuleProps: {
        project: {
          viewport,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0],
          devicePixelRatio: 1
        }
      }
    });
    aggregator.preDraw();
    aggregator.setProps({pointCount: 0});
    aggregator.preDraw();
    await vi.waitFor(() => expect(onUpdate).toHaveBeenCalledTimes(2), {timeout: 10000});
    expect(aggregator.isLoaded).toBe(true);
    expect(aggregator.getResultDomain(0)).toEqual([0, 0]);
    expect(aggregator.getResultValues(0)![0]).toBeNaN();
    expect(aggregator.getBin(0)).toBeNull();
    const onError = vi.fn();
    aggregator.setProps({pointCount: 2, onError});
    const read = vi
      .spyOn((aggregator as any).valueBuffer, 'readAsync')
      .mockRejectedValueOnce(new Error('transient mapping failure'));
    aggregator.preDraw();
    await vi.waitFor(() => expect(onError).toHaveBeenCalledOnce());
    expect(aggregator.isLoaded).toBe(false);
    aggregator.preDraw();
    await vi.waitFor(() => expect(aggregator.isLoaded).toBe(true));
    expect(aggregator.getResultDomain(0)).toEqual([5, 5]);
    read.mockRestore();
  } finally {
    aggregator.destroy();
    positions.destroy();
    weights.destroy();
    buffer.destroy();
  }
});

test('Brushing recomputes Grid bins on pointer changes without a layer update', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager} = await import('@deck.gl/core');
  const {BrushingExtension} = await import('@deck.gl/extensions');
  const viewport = new OrthographicView().makeViewport({
    width: 100,
    height: 100,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const layer = new GridLayer({
    data: [
      {position: [0, 0], value: 2},
      {position: [20, 20], value: 3}
    ],
    getPosition: d => d.position,
    getColorWeight: d => d.value,
    getElevationWeight: d => d.value,
    cellSize: 10,
    colorDomain: [0, 10],
    elevationDomain: [0, 10],
    pickable: true,
    extensions: [new BrushingExtension()],
    brushingRadius: 2
  });
  try {
    manager.setLayers([layer]);
    for (const [position, expected] of [
      [[0, 0], 2],
      [[20, 20], 3]
    ] as const) {
      const [x, y] = viewport.project(position);
      layer.setShaderModuleProps({
        brushing: {
          viewport,
          mousePosition: {x, y},
          brushingEnabled: true,
          brushingRadius: 2,
          brushingTarget: 'source'
        }
      });
      const draw = () =>
        layer.draw({
          shaderModuleProps: {
            project: {
              viewport,
              coordinateSystem: 'cartesian',
              coordinateOrigin: [0, 0, 0],
              modelMatrix: null,
              devicePixelRatio: 1
            }
          }
        } as any);
      await vi.waitFor(
        () => {
          draw();
          expect(layer.state.aggregator.getResultDomain(0)).toEqual([expected, expected]);
        },
        {timeout: 10000}
      );
    }
  } finally {
    manager.finalize();
  }
});

test('Grid geometry clipping uses the aggregation coordinate frame', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {ClipExtension} = await import('@deck.gl/extensions');
  await testLayerAsync({
    Layer: GridLayer,
    device,
    viewport: new OrthographicView().makeViewport({
      width: 300,
      height: 300,
      viewState: {target: [0, 0, 0], zoom: 0}
    }),
    onError: error => {
      throw error;
    },
    testCases: [
      {
        props: {
          data: [
            [102, 102],
            [103, 103],
            [122, 122]
          ],
          getPosition: p => p,
          cellSize: 10,
          extensions: [new ClipExtension()],
          clipBounds: [100, 100, 110, 110]
        },
        async onAfterUpdate({layer}) {
          await vi.waitFor(() => expect(layer.state.aggregator.getResultValues(0)).not.toBeNull(), {
            timeout: 10000
          });
          const aggregator = layer.state.aggregator;
          const count = Array.from(
            {length: aggregator.binCount},
            (_, i) => aggregator.getBin(i)?.count || 0
          ).reduce((a, b) => a + b, 0);
          expect(count).toBe(2);
          expect(aggregator.getResultDomain(0)).toEqual([2, 2]);
        }
      }
    ]
  });
});

test('Grid globe clipping supplies flat Mercator bounds', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager, _GlobeViewport, WebMercatorViewport} = await import('@deck.gl/core');
  const {ClipExtension} = await import('@deck.gl/extensions');
  const manager = new LayerManager(device, {
    viewport: new _GlobeViewport({width: 100, height: 100, longitude: 10, latitude: 20, zoom: 0})
  });
  const layer = new GridLayer({
    data: [[10, 20]],
    getPosition: p => p,
    colorDomain: [0, 10],
    elevationDomain: [0, 10],
    extensions: [new ClipExtension()],
    clipBounds: [10, 20, 15, 25]
  });
  try {
    manager.setLayers([layer]);
    const setProps = vi.spyOn(layer.state.aggregator, 'setProps');
    const extension = layer.props.extensions[0];
    extension.draw.call(layer, {} as any, extension);
    const reference = new WebMercatorViewport({width: 1, height: 1, zoom: 0});
    const a = reference.projectPosition([10, 20, 0]);
    const b = reference.projectPosition([15, 25, 0]);
    const bounds = setProps.mock.calls.at(-1)![0].shaderModuleProps!.clip.bounds;
    [a[0], a[1], b[0], b[1]].forEach((value, i) => expect(bounds[i]).toBeCloseTo(value));
    setProps.mockRestore();
  } finally {
    manager.finalize();
  }
});

test('Default rendering plugins leave aggregation on compute', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const {LayerManager} = await import('@deck.gl/core');
  const manager = new LayerManager(device, {
    viewport: new OrthographicView().makeViewport({
      width: 100,
      height: 100,
      viewState: {target: [0, 0, 0], zoom: 0}
    })
  });
  manager.addDefaultShaderPlugin({name: 'render-effect', injections: {}});
  const layers = [
    new GridLayer({
      id: 'grid-effects',
      data: [[0, 0]],
      getPosition: p => p,
      colorDomain: [0, 10],
      elevationDomain: [0, 10]
    }),
    new ScreenGridLayer({
      id: 'screen-effects',
      data: [[0, 0]],
      getPosition: p => p,
      colorDomain: [0, 10]
    })
  ];
  try {
    manager.setLayers(layers);
    for (const layer of layers) {
      expect(layer.state.aggregator).toBeInstanceOf(WebGPUAggregator);
      expect((layer.state.aggregator as any).filterModel).toBeUndefined();
    }
  } finally {
    manager.finalize();
  }
});

for (const coordinateSystem of ['cartesian', 'meter-offsets', 'lnglat-offsets'] as const) {
  test(`Grid does not wrap reversed ${coordinateSystem} clip bounds`, async ({skip}) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    const {LayerManager, WebMercatorViewport} = await import('@deck.gl/core');
    const {ClipExtension} = await import('@deck.gl/extensions');
    const viewport = new WebMercatorViewport({
      width: 100,
      height: 100,
      longitude: 0,
      latitude: 0,
      zoom: 0
    });
    const manager = new LayerManager(device, {viewport});
    const layer = new GridLayer({
      coordinateSystem,
      data: [[0, 0]],
      getPosition: p => p,
      cellSize: 100000,
      colorDomain: [0, 10],
      elevationDomain: [0, 10],
      extensions: [new ClipExtension()],
      clipBounds: [200, -10, -200, 10]
    });
    try {
      manager.setLayers([layer]);
      const setProps = vi.spyOn(layer.state.aggregator, 'setProps');
      const extension = layer.props.extensions[0];
      extension.draw.call(layer, {} as any, extension);
      const a = layer.projectPosition([200, -10, 0], {viewport: layer.state.aggregatorViewport});
      const b = layer.projectPosition([-200, 10, 0], {viewport: layer.state.aggregatorViewport});
      const bounds = setProps.mock.calls.at(-1)![0].shaderModuleProps!.clip.bounds;
      expect(bounds).toEqual([
        Math.min(a[0], b[0]),
        Math.min(a[1], b[1]),
        Math.max(a[0], b[0]),
        Math.max(a[1], b[1])
      ]);
    } finally {
      manager.finalize();
    }
  });
}
