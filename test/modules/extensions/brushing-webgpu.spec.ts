// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, expect, test} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {BrushingExtension, ClipExtension} from '@deck.gl/extensions';
import {luma, Texture, Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';

// Pixel assertions exercise AttributeManager -> Model reflection -> generated WGSL inputs/varyings.
test.each([false, true])(
  'BrushingExtension#WebGPU composes with ClipExtension (reverse=%s)',
  async reverse => {
    const container = document.createElement('div');
    container.style.cssText = 'position:absolute;top:0;left:0;width:128px;height:128px';
    document.body.appendChild(container);
    const eventRoot = document.createElement('div');
    eventRoot.className = 'deck-events-root';
    container.appendChild(eventRoot);
    const device = await luma.createDevice({
      type: 'webgpu',
      adapters: [webgpuAdapter],
      createCanvasContext: {
        container: document.createElement('div'),
        width: 128,
        height: 128,
        useDevicePixels: false
      }
    });
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
    const errors: Error[] = [];
    const extensions = [new BrushingExtension(), new ClipExtension()];
    if (reverse) extensions.reverse();
    const layer = new ScatterplotLayer({
      id: 'brushing-composition',
      pickable: true,
      data: [
        {position: [-30, 0], target: [0, 0]},
        {position: [0, 0], target: [0, 0]},
        {position: [30, 0], target: [30, 0]}
      ],
      getPosition: object => object.position,
      getBrushingTarget: object => object.target,
      getRadius: 6,
      radiusUnits: 'pixels',
      getFillColor: [255, 0, 0],
      brushingTarget: 'custom',
      brushingRadius: 10,
      clipBounds: [-10, -100, 100, 100],
      extensions
    });
    device.handle.pushErrorScope('validation');
    const deck = new Deck({
      device,
      parent: eventRoot,
      width: 128,
      height: 128,
      useDevicePixels: false,
      views: new OrthographicView(),
      initialViewState: {target: [0, 0, 0], zoom: 0},
      _framebuffer: framebuffer,
      layers: [layer],
      onError: error => errors.push(error)
    });
    try {
      await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
      const canvas = device.getDefaultCanvasContext().canvas as HTMLCanvasElement;
      expect(canvas.parentElement).toBe(eventRoot);
      canvas.dispatchEvent(
        new MouseEvent('mousemove', {
          bubbles: true,
          clientX: 64,
          clientY: 64
        })
      );
      deck.redraw('test brushing');
      expect(layer.context.mousePosition).toMatchObject({x: 64, y: 64});
      const layout = texture.computeMemoryLayout();
      const readback = device.createBuffer({
        byteLength: layout.byteLength,
        usage: Buffer.COPY_DST | Buffer.MAP_READ
      });
      try {
        texture.readBuffer({}, readback);
        const pixels = await readback.readAsync();
        const red = (x: number) => pixels[(64 * 128 + x) * 4];
        expect(errors).toEqual([]);
        expect(red(34), 'Clip rejects the first point even though brushing accepts it').toBe(0);
        expect(red(64), 'Both extensions accept the middle point').toBe(255);
        expect(red(94), 'Brushing rejects the last point even though Clip accepts it').toBe(0);
        expect(
          (await deck.pickObjectAsync({x: 64, y: 64}))?.index,
          'visible point remains pickable'
        ).toBe(1);
        expect(
          (await deck.pickObjectAsync({x: 94, y: 64}))?.object,
          'brushed point is not pickable'
        ).toBeUndefined();
        const model = layer.state.model;
        await new Promise<void>(resolve =>
          deck.setProps({
            layers: [layer.clone({brushingEnabled: false})],
            onAfterRender: () => resolve()
          })
        );
        deck.redraw('disable brushing');
        texture.readBuffer({}, readback);
        const disabledPixels = await readback.readAsync();
        expect(
          disabledPixels[(64 * 128 + 94) * 4],
          'disabling brushing restores the last point'
        ).toBe(255);
        expect(disabledPixels[(64 * 128 + 34) * 4], 'Clip still applies').toBe(0);
        const updatedLayer = layer.clone({getBrushingTarget: [0, 0], brushingEnabled: true});
        await new Promise<void>(resolve =>
          deck.setProps({layers: [updatedLayer], onAfterRender: () => resolve()})
        );
        deck.redraw('update brushing attribute');
        texture.readBuffer({}, readback);
        const updatedPixels = await readback.readAsync();
        expect(
          updatedPixels[(64 * 128 + 94) * 4],
          'constant accessor updates bind to the generated input'
        ).toBe(255);
        expect(
          updatedLayer.state.model,
          'uniform and attribute updates preserve the pipeline'
        ).toBe(model);
        expect(await device.handle.popErrorScope()).toBeNull();
      } finally {
        readback.destroy();
      }
    } finally {
      deck.finalize();
      framebuffer.destroy();
      texture.destroy();
      device.destroy();
      container.remove();
    }
  }
);

test('BrushingExtension#WebGPU primitive pipelines accept luma-injected interfaces', async context => {
  const {LayerManager, OrthographicViewport} = await import('@deck.gl/core');
  const {ArcLayer, LineLayer, PathLayer, ColumnLayer, PointCloudLayer, SolidPolygonLayer} =
    await import('@deck.gl/layers');
  const device = await getWebGPUTestDevice();
  if (!device) return context.skip();
  const manager = new LayerManager(device, {
    viewport: new OrthographicViewport({width: 128, height: 128})
  });
  const errors: Error[] = [];
  manager.setProps({onError: error => errors.push(error)});
  const extensions = [new BrushingExtension()];
  device.handle.pushErrorScope('validation');
  try {
    manager.setLayers([
      new ArcLayer({
        id: 'brush-arc',
        data: [{}],
        getSourcePosition: [-10, 0],
        getTargetPosition: [10, 0],
        extensions
      }),
      new LineLayer({
        id: 'brush-line',
        data: [{}],
        getSourcePosition: [-10, 0],
        getTargetPosition: [10, 0],
        extensions
      }),
      new PathLayer({
        id: 'brush-path',
        data: [{}],
        getPath: () => [
          [-10, 0],
          [10, 0]
        ],
        extensions
      }),
      new ColumnLayer({
        id: 'brush-column',
        data: [{}],
        getPosition: [0, 0],
        diskResolution: 6,
        extensions
      }),
      new PointCloudLayer({id: 'brush-cloud', data: [{}], getPosition: [0, 0, 0], extensions}),
      new SolidPolygonLayer({
        id: 'brush-polygon',
        data: [{}],
        getPolygon: () => [
          [0, 0],
          [10, 0],
          [0, 10]
        ],
        extruded: true,
        extensions
      })
    ]);
    expect(errors).toEqual([]);
    for (const layer of manager.layers) {
      expect(layer.getModels().length, layer.id).toBeGreaterThan(0);
      for (const model of layer.getModels()) {
        expect(
          model.pipeline.shaderLayout.attributes.some(
            attribute => attribute.name === 'brushingTargets'
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
});

test('BrushingExtension#WebGPU source, target, combined, and custom modes', async context => {
  if (!(await getWebGPUTestDevice())) return context.skip();
  const {LineLayer} = await import('@deck.gl/layers');
  const container = document.createElement('div');
  container.style.cssText = 'position:absolute;top:0;left:0;width:128px;height:128px';
  document.body.appendChild(container);
  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
    createCanvasContext: {container, width: 128, height: 128, useDevicePixels: false}
  });
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
  const layer = new LineLayer({
    id: 'brush-endpoints',
    data: [{}],
    getSourcePosition: [-30, 0],
    getTargetPosition: [30, 0],
    getBrushingTarget: [0, 0],
    brushingRadius: 10,
    getColor: [255, 0, 0],
    getWidth: 8,
    extensions: [new BrushingExtension()]
  });
  device.handle.pushErrorScope('validation');
  const deck = new Deck({
    device,
    container,
    width: 128,
    height: 128,
    useDevicePixels: false,
    views: new OrthographicView(),
    initialViewState: {target: [0, 0, 0], zoom: 0},
    _framebuffer: framebuffer,
    layers: [layer]
  });
  try {
    await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
    layer.context.mousePosition = {x: 34, y: 64};
    for (const [brushingTarget, expected] of [
      ['source', 255],
      ['target', 0],
      ['source_target', 255],
      ['custom', 0]
    ] as const) {
      await new Promise<void>(resolve =>
        deck.setProps({layers: [layer.clone({brushingTarget})], onAfterRender: () => resolve()})
      );
      deck.redraw('endpoint brushing');
      texture.readBuffer({}, readback);
      const pixels = await readback.readAsync();
      expect(pixels[(64 * 128 + 64) * 4], brushingTarget).toBe(expected);
    }
    expect(await device.handle.popErrorScope()).toBeNull();
  } finally {
    deck.finalize();
    readback.destroy();
    framebuffer.destroy();
    texture.destroy();
    device.destroy();
    container.remove();
  }
});

beforeEach(async context => {
  if (!(await getWebGPUTestDevice())) context.skip();
});
