// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {
  _GPUVectorModel as GPUVectorModel,
  Layer,
  LayerExtension,
  LayerManager,
  OrthographicView
} from '@deck.gl/core';
import {GraphScreenGridAggregator, ScreenGridLayer} from '@deck.gl/aggregation-layers';
import {DataFilterExtension, ClipExtension, BrushingExtension} from '@deck.gl/extensions';
import {testLayerAsync} from '@deck.gl/test-utils/vitest';

const viewport = () =>
  new OrthographicView().makeViewport({
    width: 100,
    height: 100,
    viewState: {target: [0, 0, 0], zoom: 0}
  });
const project = view => ({
  viewport: view,
  coordinateSystem: 'cartesian',
  coordinateOrigin: [0, 0, 0],
  modelMatrix: null,
  devicePixelRatio: 1
});

async function expectBin(layer, value: number, count: number) {
  await vi.waitFor(
    () => {
      layer.draw({shaderModuleProps: {project: project(layer.context.viewport)}});
      const aggregator = layer.state.aggregator;
      expect(aggregator.isLoaded).toBe(true);
      expect(aggregator.getResultDomain(0)).toEqual(count ? [value, value] : [0, 0]);
      expect(aggregator.getBin(0)).toEqual(count ? {id: [0, 0], value: [value], count} : null);
    },
    {timeout: 10000}
  );
}

class WeightExtension extends LayerExtension {
  static extensionName = 'WeightExtension';
  static defaultProps = {weightFactor: {type: 'number', value: 1}};
  getShaders() {
    return {
      plugins: [
        {
          name: 'aggregation-weight',
          module: {
            name: 'aggregationWeight',
            source: `struct WeightUniforms {factor: f32}; @group(2) @binding(auto) var<uniform> aggregationWeight: WeightUniforms;`,
            uniformTypes: {factor: 'f32'},
            getUniforms: props => ({factor: props.factor})
          },
          injections: {'wgsl:fs:DECKGL_FILTER_COLOR': '(*color).r *= aggregationWeight.factor;'}
        }
      ]
    };
  }
  draw(this: Layer<{weightFactor: number}>) {
    this.setShaderModuleProps({aggregationWeight: {factor: this.props.weightFactor}});
  }
}

for (const graph of [false, true]) {
  test(`ScreenGrid extension masks preserve all reduction operations (graph=${graph})`, async ({
    skip
  }) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    device.handle.pushErrorScope('validation');
    const data = [
      {position: [0, 0], value: 2, filter: 0},
      {position: [10, 10], value: 6, filter: 2},
      {position: [20, 20], value: 10, filter: 0}
    ];
    await testLayerAsync({
      Layer: ScreenGridLayer,
      device,
      viewport: viewport(),
      onError: error => {
        throw error;
      },
      testCases: [
        ...(['SUM', 'MEAN', 'MIN', 'MAX', 'COUNT'] as const).map((aggregation, i) => ({
          ...(i === 0
            ? {
                props: {
                  data,
                  aggregator: graph ? new GraphScreenGridAggregator() : null,
                  getPosition: d => d.position,
                  getWeight: d => d.value,
                  getFilterValue: d => d.filter,
                  filterRange: [-1, 1],
                  extensions: [new DataFilterExtension()],
                  cellSizePixels: 100,
                  colorDomain: [0, 100],
                  pickable: true
                }
              }
            : {}),
          updateProps: {aggregation},
          onAfterUpdate: ({layer}) =>
            expectBin(layer, {SUM: 12, MEAN: 6, MIN: 2, MAX: 10, COUNT: 2}[aggregation], 2)
        })),
        {
          updateProps: {aggregation: 'SUM', filterRange: [1, 3]},
          onAfterUpdate: ({layer}) => expectBin(layer, 6, 1)
        },
        {updateProps: {filterEnabled: false}, onAfterUpdate: ({layer}) => expectBin(layer, 18, 3)},
        {
          updateProps: {filterEnabled: true, filterRange: [99, 100]},
          onAfterUpdate: ({layer}) => expectBin(layer, 0, 0)
        },
        {updateProps: {filterRange: [-1, 1]}, onAfterUpdate: ({layer}) => expectBin(layer, 12, 2)},
        {
          updateProps: {getFilterValue: () => 0, updateTriggers: {getFilterValue: 1}},
          onAfterUpdate: ({layer}) => expectBin(layer, 18, 3)
        },
        {updateProps: {extensions: []}, onAfterUpdate: ({layer}) => expectBin(layer, 18, 3)},
        {
          updateProps: {
            extensions: [new DataFilterExtension()],
            getFilterValue: () => 0,
            updateTriggers: {getFilterValue: 2},
            filterRange: [-1, 1]
          },
          onAfterUpdate: ({layer}) => expectBin(layer, 18, 3)
        }
      ]
    });
    expect(await device.handle.popErrorScope()).toBeNull();
  });

  test(`ScreenGrid multi-channel filtering follows changing input buffers (graph=${graph})`, async ({
    skip
  }) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    const data = [
      {position: [0, 0], value: 2, filter: [0, 0], category: 'keep'},
      {position: [10, 10], value: 6, filter: [0, 2], category: 'drop'},
      {position: [20, 20], value: 10, filter: [2, 0], category: 'keep'}
    ];
    await testLayerAsync({
      Layer: ScreenGridLayer,
      device,
      viewport: viewport(),
      onError: error => {
        throw error;
      },
      testCases: [
        {
          props: {
            data,
            aggregator: graph ? new GraphScreenGridAggregator() : null,
            getPosition: d => d.position,
            getWeight: d => d.value,
            extensions: [new DataFilterExtension({filterSize: 2, categorySize: 1})],
            getFilterValue: d => d.filter,
            getFilterCategory: d => d.category,
            filterRange: [
              [-1, 1],
              [-1, 1]
            ],
            filterCategories: ['keep'],
            cellSizePixels: 100,
            pickable: true
          },
          onAfterUpdate: ({layer}) => expectBin(layer, 2, 1)
        },
        {
          updateProps: {
            filterRange: [
              [-1, 3],
              [-1, 3]
            ]
          },
          onAfterUpdate: ({layer}) => expectBin(layer, 12, 2)
        },
        {
          updateProps: {filterCategories: ['drop']},
          onAfterUpdate: ({layer}) => expectBin(layer, 6, 1)
        },
        {
          updateProps: {
            data: [...data, {position: [1, 1], value: 14, filter: [0, 0], category: 'drop'}],
            filterCategories: ['keep', 'drop']
          },
          onAfterUpdate: ({layer}) => expectBin(layer, 32, 4)
        },
        {updateProps: {data: data.slice(1, 2)}, onAfterUpdate: ({layer}) => expectBin(layer, 6, 1)},
        {updateProps: {data: []}, onAfterUpdate: ({layer}) => expectBin(layer, 0, 0)},
        {updateProps: {data}, onAfterUpdate: ({layer}) => expectBin(layer, 18, 3)}
      ]
    });
  });

  test(`ScreenGrid graph hooks apply modified weights and clipping (graph=${graph})`, async ({
    skip
  }) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    device.handle.pushErrorScope('validation');
    await testLayerAsync({
      Layer: ScreenGridLayer,
      device,
      viewport: viewport(),
      onError: error => {
        throw error;
      },
      testCases: [
        {
          props: {
            aggregator: graph ? new GraphScreenGridAggregator() : null,
            data: [
              [0, 0],
              [20, 20]
            ],
            getPosition: d => d,
            getWeight: 2,
            extensions: [new ClipExtension(), new WeightExtension()],
            clipByInstance: true,
            clipBounds: [-10, -10, 10, 10],
            weightFactor: 3,
            cellSizePixels: 100,
            pickable: true
          },
          onAfterUpdate: ({layer}) => expectBin(layer, 6, 1)
        },
        {
          updateProps: {clipBounds: [-30, -30, 30, 30]},
          onAfterUpdate: ({layer}) => expectBin(layer, 12, 2)
        },
        {updateProps: {weightFactor: 0}, onAfterUpdate: ({layer}) => expectBin(layer, 0, 2)},
        {
          updateProps: {weightFactor: 2, aggregation: 'MEAN'},
          onAfterUpdate: ({layer}) => expectBin(layer, 4, 2)
        },
        {updateProps: {aggregation: 'COUNT'}, onAfterUpdate: ({layer}) => expectBin(layer, 2, 2)}
      ]
    });
    expect(await device.handle.popErrorScope()).toBeNull();
  });

  test(`ScreenGrid brushing updates without replacing the layer (graph=${graph})`, async ({
    skip
  }) => {
    const device = await getWebGPUTestDevice();
    if (!device) return skip();
    const view = viewport();
    const manager = new LayerManager(device, {viewport: view});
    manager.setProps({
      onError: error => {
        throw error;
      }
    });
    const layer = new ScreenGridLayer({
      aggregator: graph ? new GraphScreenGridAggregator() : null,
      data: [
        {position: [0, 0], value: 2},
        {position: [20, 20], value: 3}
      ],
      getPosition: d => d.position,
      getWeight: d => d.value,
      cellSizePixels: 100,
      colorDomain: [0, 10],
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
        const [x, y] = view.project(position);
        layer.setShaderModuleProps({
          brushing: {
            viewport: view,
            mousePosition: {x, y},
            brushingEnabled: true,
            brushingRadius: 2,
            brushingTarget: 'source'
          }
        });
        await expectBin(layer, expected, 1);
      }
    } finally {
      manager.finalize();
    }
  });
}

test('Graph input hooks retry unready models without publishing partial results', async ({
  skip
}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const draw = GPUVectorModel.prototype.draw;
  let skipped = false;
  const spy = vi.spyOn(GPUVectorModel.prototype, 'draw').mockImplementation(function (
    this: GPUVectorModel,
    ...args
  ) {
    if (this.id === 'deck-aggregation-inputs' && !skipped) {
      skipped = true;
      return false;
    }
    return draw.apply(this, args);
  });
  try {
    await testLayerAsync({
      Layer: ScreenGridLayer,
      device,
      viewport: viewport(),
      onError: error => {
        throw error;
      },
      testCases: [
        {
          props: {
            data: [
              [0, 0],
              [10, 10]
            ],
            aggregator: new GraphScreenGridAggregator(),
            getPosition: d => d,
            getWeight: 2,
            extensions: [new DataFilterExtension()],
            getFilterValue: 0,
            filterRange: [-1, 1],
            cellSizePixels: 100,
            pickable: true
          },
          onAfterUpdate: ({layer}) => expectBin(layer, 4, 2)
        }
      ]
    });
    expect(skipped).toBe(true);
  } finally {
    spy.mockRestore();
  }
});
