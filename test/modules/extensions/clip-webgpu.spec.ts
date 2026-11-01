// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, expect, test} from 'vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Deck, OrthographicView, MapView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {BrushingExtension, ClipExtension} from '@deck.gl/extensions';
import {luma, Texture, Buffer} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';

// Pixel assertions exercise AttributeManager -> Model reflection -> generated WGSL inputs/varyings.
test.each([
  {clipByInstance: true, reverse: false},
  {clipByInstance: true, reverse: true},
  {clipByInstance: false, reverse: false},
  {clipByInstance: false, reverse: true}
])(
  'ClipExtension#WebGPU clipping modes compose with Brushing (%j)',
  async ({clipByInstance, reverse}) => {
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
        {position: [5, 0], target: [0, 0]},
        {position: [35, 0], target: [35, 0]}
      ],
      getPosition: object => object.position,
      getBrushingTarget: object => object.target,
      getRadius: 12,
      radiusUnits: 'pixels',
      getFillColor: [255, 0, 0],
      brushingTarget: 'custom',
      brushingRadius: 10,
      clipBounds: [0, -100, 100, 100],
      clipByInstance,
      extensions
    });
    device.handle.pushErrorScope('validation');
    const deck = new Deck({
      device,
      parent: container,
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
        expect(
          red(61),
          'instance mode preserves the whole circle; geometry mode cuts its edge'
        ).toBe(clipByInstance ? 255 : 0);
        expect(red(69), 'Both extensions accept the middle point').toBe(255);
        expect(red(99), 'Brushing rejects the last point even though Clip accepts it').toBe(0);
        expect(
          (await deck.pickObjectAsync({x: 64, y: 64}))?.index,
          'visible point remains pickable'
        ).toBe(1);
        expect(
          (await deck.pickObjectAsync({x: 99, y: 64}))?.object,
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
          disabledPixels[(64 * 128 + 99) * 4],
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
          updatedPixels[(64 * 128 + 99) * 4],
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
test.each([true, false])(
  'ClipExtension#WebGPU primitive pipelines (instance=%s)',
  async clipByInstance => {
    const {LayerManager, OrthographicViewport} = await import('@deck.gl/core');
    const {TripsLayer} = await import('@deck.gl/geo-layers');
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
    const device = await getWebGPUTestDevice();
    expect(device, 'WebGPU is required for this regression').toBeTruthy();
    if (!device) return;
    const manager = new LayerManager(device, {
      viewport: new OrthographicViewport({width: 128, height: 128})
    });
    const errors: Error[] = [];
    manager.setProps({onError: error => errors.push(error)});
    const extensions = [new BrushingExtension(), new ClipExtension()];
    device.handle.pushErrorScope('validation');
    try {
      manager.setLayers([
        new TripsLayer({
          id: 'clip-trips',
          data: [
            {
              path: [
                [-10, 0],
                [10, 0]
              ],
              timestamps: [0, 1]
            }
          ],
          getPath: object => object.path,
          getTimestamps: object => object.timestamps,
          currentTime: 1,
          clipByInstance,
          extensions
        }),
        new IconLayer({id: 'clip-icon', data: [], clipByInstance, extensions}),
        new MultiIconLayer({id: 'clip-text', data: [], clipByInstance, extensions}),
        new TextBackgroundLayer({id: 'clip-text-background', data: [], clipByInstance, extensions}),
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
  }
);

for (const view of [new OrthographicView(), new MapView()]) {
  test(`ClipExtension clips billboard icon edges in ${view.id} on WebGPU`, async ({skip}) => {
    const {IconLayer} = await import('@deck.gl/layers');
    if (!(await getWebGPUTestDevice())) return skip();
    const device = await luma.createDevice({
      type: 'webgpu',
      adapters: [webgpuAdapter],
      createCanvasContext: {width: 128, height: 128, useDevicePixels: false}
    });
    const container = document.createElement('div');
    document.body.appendChild(container);
    const atlas = device.createTexture({
      width: 1,
      height: 1,
      data: new Uint8Array([255, 255, 255, 255])
    });
    const errors: Error[] = [];
    const layer = new IconLayer({
      id: 'billboard-clip',
      data: [{}],
      getPosition: [0, 0],
      getIcon: 'square',
      iconAtlas: atlas,
      iconMapping: {square: {x: 0, y: 0, width: 1, height: 1}},
      getSize: 40,
      billboard: true,
      pickable: true,
      clipByInstance: false,
      clipBounds: [0, -80, 100, 80],
      extensions: [new ClipExtension()]
    });
    const deck = new Deck({
      device,
      parent: container,
      width: 128,
      height: 128,
      useDevicePixels: false,
      views: view,
      initialViewState: {target: [0, 0, 0], longitude: 0, latitude: 0, pitch: 45, zoom: 3},
      layers: [layer],
      onError: error => errors.push(error)
    });
    try {
      await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
      expect(errors).toEqual([]);
      expect(layer.isLoaded).toBe(true);
      const [x, y] = deck.getViewports()[0].project([0, 0, 0]);
      expect((await deck.pickObjectAsync({x: x - 10, y}))?.object).toBeFalsy();
      expect((await deck.pickObjectAsync({x: x + 10, y}))?.index).toBe(0);
      expect(errors).toEqual([]);
    } finally {
      deck.finalize();
      atlas.destroy();
      container.remove();
      device.destroy();
    }
  });
}

// This file is also included in the WebGL browser project.
beforeEach(async context => {
  if (!(await getWebGPUTestDevice())) context.skip();
});
