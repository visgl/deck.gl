// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DataFilterExtension, BrushingExtension, ClipExtension} from '@deck.gl/extensions';
import {luma, Texture, Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';

async function createFixture() {
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:0;left:0;width:128px;height:128px';
  document.body.appendChild(container);
  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {container, width: 128, height: 128, useDevicePixels: false}
  });
  device.handle.pushErrorScope('validation');
  const texture = device.createTexture({
    width: 128,
    height: 128,
    format: 'rgba8unorm',
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: 128,
    height: 128,
    colorAttachments: [texture],
    depthStencilAttachment: 'depth24plus'
  });
  const readback = device.createBuffer({
    byteLength: texture.computeMemoryLayout().byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  const errors: Error[] = [];
  const deck = new Deck({
    device,
    parent: container,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    _framebuffer: framebuffer,
    onError: error => errors.push(error)
  });
  return {
    deck,
    errors,
    async render(layer: ScatterplotLayer<any>) {
      await new Promise<void>(resolve =>
        deck.setProps({layers: [layer], onAfterRender: () => resolve()})
      );
      layer.context.mousePosition = {x: 64, y: 64};
      deck.redraw('filter regression');
      texture.readBuffer({}, readback);
      const pixels = await readback.readAsync();
      expect(errors).toEqual([]);
      return (x: number, y = 64) => pixels[(y * 128 + x) * 4];
    },
    async finalize() {
      const validation = await device.handle.popErrorScope();
      deck.finalize();
      readback.destroy();
      framebuffer.destroy();
      texture.destroy();
      device.destroy();
      container.remove();
      expect(validation).toBeNull();
    }
  };
}

const baseProps = {
  getPosition: (object: any) => object.position,
  getRadius: 10,
  radiusUnits: 'pixels' as const,
  getFillColor: [255, 0, 0] as [number, number, number],
  pickable: true
};

test.each(
  [false, true].flatMap(fp64 => ([1, 2, 3, 4] as const).map(filterSize => ({fp64, filterSize})))
)(
  'DataFilterExtension#WebGPU numeric filtering (fp64=$fp64, size=$filterSize)',
  async ({fp64, filterSize}) => {
    const fixture = await createFixture();
    try {
      const base = fp64 ? 2 ** 40 : 0;
      const value = (last: number) =>
        filterSize === 1
          ? base + last
          : Array.from(
              {length: filterSize},
              (_, index) => base + (index === filterSize - 1 ? last : 0.5)
            );
      const range = (min: number, max: number) =>
        filterSize === 1
          ? ([base + min, base + max] as [number, number])
          : Array.from({length: filterSize}, () => [base + min, base + max] as [number, number]);
      const layer = new ScatterplotLayer({
        ...baseProps,
        id: `numeric-${fp64}-${filterSize}`,
        data: [
          {position: [-30, 0], value: value(-1)},
          {position: [0, 0], value: value(0.25)},
          {position: [30, 0], value: value(2)}
        ],
        getFilterValue: object => object.value,
        filterRange: range(0, 1),
        filterSoftRange: range(0.5, 0.75),
        extensions: [new DataFilterExtension({filterSize, fp64})]
      });
      let red = await fixture.render(layer);
      expect(red(34)).toBe(0);
      expect(red(94)).toBe(0);
      expect(red(64)).toBeGreaterThan(100);
      expect(red(64)).toBeLessThan(150);
      expect(red(71), 'soft size reduces the radius').toBe(0);
      expect((await fixture.deck.pickObjectAsync({x: 64, y: 64}))?.index).toBe(1);
      expect((await fixture.deck.pickObjectAsync({x: 34, y: 64}))?.object).toBeUndefined();
      const model = layer.state.model;
      const noSize = layer.clone({filterTransformSize: false});
      red = await fixture.render(noSize);
      expect(red(71)).toBeGreaterThan(100);
      const noColor = layer.clone({filterTransformColor: false});
      red = await fixture.render(noColor);
      expect(red(64)).toBe(255);
      const disabled = layer.clone({filterEnabled: false});
      red = await fixture.render(disabled);
      expect(red(34)).toBe(255);
      expect(red(94)).toBe(255);
      expect(disabled.state.model).toBe(model);
      red = await fixture.render(layer.clone({filterSoftRange: range(0, 1)}));
      expect(red(64), 'equal soft and hard edges remain finite').toBe(255);
    } finally {
      await fixture.finalize();
    }
  }
);

test('DataFilterExtension#WebGPU categorical dimensions and mask word boundaries', async () => {
  const fixture = await createFixture();
  try {
    for (const categorySize of [1, 2, 3, 4] as const) {
      const limit = categorySize === 1 ? 128 : categorySize === 2 ? 64 : 32;
      const categories = (index: number) =>
        categorySize === 1
          ? `category-${index}`
          : Array.from({length: categorySize}, (_, channel) => `category-${channel}-${index}`);
      const data = Array.from({length: limit + 1}, (_, index) => ({
        position: [index === limit - 1 ? 0 : index === limit ? 30 : -200, 0],
        category: categories(index)
      }));
      const selected =
        categorySize === 1
          ? [categories(limit - 1)]
          : (categories(limit - 1) as string[]).map(category => [category]);
      const layer = new ScatterplotLayer({
        ...baseProps,
        id: `category-${categorySize}`,
        data,
        getFilterCategory: object => object.category,
        filterCategories: selected,
        extensions: [new DataFilterExtension({filterSize: 0, categorySize})]
      });
      let red = await fixture.render(layer);
      expect(red(64)).toBe(255);
      expect(red(94)).toBe(0);
      red = await fixture.render(
        layer.clone({
          filterCategories: categorySize === 1 ? [] : Array.from({length: categorySize}, () => [])
        })
      );
      expect(red(64)).toBe(0);
      red = await fixture.render(layer.clone({filterEnabled: false}));
      expect(red(94)).toBe(255);
    }
  } finally {
    await fixture.finalize();
  }
});

test.each([false, true])(
  'DataFilterExtension#WebGPU composes with Brushing and Clip (reverse=%s)',
  async reverse => {
    const fixture = await createFixture();
    try {
      const extensions = [
        new DataFilterExtension({categorySize: 1}),
        new BrushingExtension(),
        new ClipExtension()
      ];
      if (reverse) extensions.reverse();
      const layer = new ScatterplotLayer({
        ...baseProps,
        id: 'filter-composition',
        data: [
          {position: [-40, 0], value: 0.5, category: 'keep', target: [0, 0]},
          {position: [-20, 0], value: 2, category: 'keep', target: [0, 0]},
          {position: [0, 0], value: 0.5, category: 'keep', target: [0, 0]},
          {position: [20, 0], value: 0.5, category: 'drop', target: [0, 0]},
          {position: [40, 0], value: 0.5, category: 'keep', target: [40, 0]}
        ],
        getFilterValue: object => object.value,
        getFilterCategory: object => object.category,
        filterRange: [0, 1],
        filterCategories: ['keep'],
        getBrushingTarget: object => object.target,
        brushingTarget: 'custom',
        brushingRadius: 10,
        clipBounds: [-30, -100, 100, 100],
        extensions
      });
      const red = await fixture.render(layer);
      for (const x of [24, 44, 84, 104]) expect(red(x)).toBe(0);
      expect(red(64)).toBe(255);
      expect((await fixture.deck.pickObjectAsync({x: 64, y: 64}))?.index).toBe(2);
    } finally {
      await fixture.finalize();
    }
  }
);

test.each([true, false])(
  'DataFilterExtension#WebGPU primitive pipelines (instance=%s)',
  async clipByInstance => {
    const {LayerManager, OrthographicViewport} = await import('@deck.gl/core');
    const {
      ArcLayer,
      LineLayer,
      PathLayer,
      ColumnLayer,
      PointCloudLayer,
      SolidPolygonLayer,
      IconLayer,
      _MultiIconLayer: MultiIconLayer,
      _TextBackgroundLayer: TextBackgroundLayer
    } = await import('@deck.gl/layers');
    const {getWebGPUTestDevice} = await import('@luma.gl/core/test-utils');
    const device = await getWebGPUTestDevice();
    expect(device, 'WebGPU is required for this regression').toBeTruthy();
    if (!device) return;
    const manager = new LayerManager(device, {
      viewport: new OrthographicViewport({width: 128, height: 128})
    });
    const errors: Error[] = [];
    manager.setProps({onError: error => errors.push(error)});
    const extensions = [
      new DataFilterExtension({filterSize: 4, categorySize: 4, fp64: true}),
      new BrushingExtension(),
      new ClipExtension()
    ];
    device.handle.pushErrorScope('validation');
    try {
      manager.setLayers(
        [
          new IconLayer({id: 'clip-icon', data: [], clipByInstance, extensions}),
          new MultiIconLayer({id: 'clip-text', data: [], clipByInstance, extensions}),
          new TextBackgroundLayer({
            id: 'clip-text-background',
            data: [],
            clipByInstance,
            extensions
          }),
          new ArcLayer({
            id: 'brush-arc',
            data: [{}],
            getSourcePosition: [-10, 0],
            getTargetPosition: [10, 0],
            clipByInstance,
            extensions
          }),
          new LineLayer({
            id: 'brush-line',
            data: [{}],
            getSourcePosition: [-10, 0],
            getTargetPosition: [10, 0],
            clipByInstance,
            extensions
          }),
          new PathLayer({
            id: 'brush-path',
            data: [{}],
            getPath: () => [
              [-10, 0],
              [10, 0]
            ],
            clipByInstance,
            extensions
          }),
          new ColumnLayer({
            id: 'brush-column',
            data: [{}],
            getPosition: [0, 0],
            diskResolution: 6,
            clipByInstance,
            extensions
          }),
          new PointCloudLayer({
            id: 'brush-cloud',
            data: [{}],
            getPosition: [0, 0, 0],
            clipByInstance,
            extensions
          }),
          new SolidPolygonLayer({
            id: 'brush-polygon',
            data: [{}],
            getPolygon: () => [
              [0, 0],
              [10, 0],
              [0, 10]
            ],
            extruded: true,
            clipByInstance,
            extensions
          })
        ].map(layer =>
          layer.clone({
            getFilterValue: () => [0, 0, 0, 0],
            getFilterCategory: () => [0, 0, 0, 0],
            filterRange: [
              [-1, 1],
              [-1, 1],
              [-1, 1],
              [-1, 1]
            ],
            filterCategories: [[0], [0], [0], [0]]
          })
        )
      );
      expect(errors).toEqual([]);
      for (const layer of manager.layers) {
        expect(layer.getModels().length, layer.id).toBeGreaterThan(0);
        for (const model of layer.getModels()) {
          expect(
            model.pipeline.shaderLayout.attributes.some(
              attribute => attribute.name === 'filterValues'
            ),
            layer.id
          ).toBe(true);
        }
      }
      await device.handle.queue.onSubmittedWorkDone();
      expect(await device.handle.popErrorScope()).toBeNull();
    } finally {
      manager.finalize();
    }
  }
);

test('DataFilterExtension#WebGPU rejects item counting before model creation', async () => {
  const {LayerManager, OrthographicViewport} = await import('@deck.gl/core');
  const {getWebGPUTestDevice} = await import('@luma.gl/core/test-utils');
  const device = await getWebGPUTestDevice();
  expect(device).toBeTruthy();
  if (!device) return;
  const errors: Error[] = [];
  const manager = new LayerManager(device, {
    viewport: new OrthographicViewport({width: 128, height: 128})
  });
  manager.setProps({onError: error => errors.push(error)});
  const layer = new ScatterplotLayer({
    id: 'unsupported-filter-count',
    data: [{position: [0, 0]}],
    getPosition: object => object.position,
    extensions: [new DataFilterExtension({countItems: true})]
  });
  try {
    manager.setLayers([layer]);
    expect(errors).toHaveLength(1);
    expect(errors[0].message).toContain('DataFilterExtension countItems requires WebGL');
    expect(layer.getModels()).toHaveLength(0);
  } finally {
    manager.finalize();
  }
});
