// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {beforeEach, describe, expect, test} from 'vitest';
import {Deck, MapView, OrthographicView, _GlobeView as GlobeView} from '@deck.gl/core';
import {IconLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';
import {Buffer, luma, Texture} from '@luma.gl/core';
import {webgl2Adapter, type WebGLDevice} from '@luma.gl/core/webgl';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {webglDevice as sharedWebGLDevice} from '@luma.gl/core/test-utils-legacy';

describe.each(['webgl', 'webgpu'] as const)('MaskExtension %s', type => {
  beforeEach(async context => {
    if (type === 'webgpu' && !(await getWebGPUTestDevice())) context.skip();
  });
  test.each(['map', 'globe'] as const)(
    `MaskExtension#${type} %s channel updates and picking`,
    async view => {
      const width = 256;
      const height = 256;
      const positions = [
        [-20, -20],
        [20, -20],
        [-20, 20],
        [20, 20]
      ];
      const colors = [
        [255, 0, 0],
        [0, 255, 0],
        [0, 0, 255],
        [255, 255, 0]
      ];
      const masks = positions.map(
        ([x, y], index) =>
          new SolidPolygonLayer({
            id: `mask-${index}`,
            operation: 'mask',
            data: [
              [
                [x - 8, y - 8],
                [x + 8, y - 8],
                [x + 8, y + 8],
                [x - 8, y + 8]
              ]
            ],
            getPolygon: polygon => polygon
          })
      );
      const layers = positions.map(
        (_, index) =>
          new ScatterplotLayer({
            id: `points-${index}`,
            data: positions,
            getPosition: position => position,
            getRadius: 6,
            radiusUnits: 'pixels',
            getFillColor: colors[index],
            pickable: true,
            maskId: masks[index].id,
            extensions: [new MaskExtension()]
          })
      );
      const container = document.createElement('div');
      document.body.appendChild(container);
      const device = await luma.createDevice({
        type,
        adapters: type === 'webgl' ? [webgl2Adapter] : [webgpuAdapter],
        createCanvasContext: {container, width, height, useDevicePixels: false}
      });
      const texture = device.createTexture({
        width,
        height,
        format: 'rgba8unorm',
        usage: Texture.RENDER | Texture.COPY_SRC
      });
      const framebuffer = device.createFramebuffer({
        width,
        height,
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
        width,
        height,
        useDevicePixels: false,
        views: view === 'map' ? new MapView() : new GlobeView(),
        initialViewState: {longitude: 0, latitude: 0, zoom: 1},
        layers: [...masks, ...layers],
        _framebuffer: framebuffer,
        onError: error => errors.push(error)
      });
      const render = nextLayers =>
        new Promise<void>(resolve =>
          deck.setProps({layers: nextLayers, onAfterRender: () => resolve()})
        );
      const check = async (hiddenFirst: boolean) => {
        deck.redraw('mask parity');
        texture.readBuffer({}, readback);
        const pixels = await readback.readAsync();
        const viewport = deck.getViewports()[0];
        for (const [index, position] of positions.entries()) {
          const [x, y] = viewport.project(position).map(Math.floor);
          const row = type === 'webgl' ? height - 1 - y : y;
          const rgb = Array.from(pixels.slice((row * width + x) * 4, (row * width + x) * 4 + 3));
          expect(rgb, `${view} point ${index}`).toEqual(
            hiddenFirst && index === 0 ? [0, 0, 0] : colors[index]
          );
          const pick = await deck.pickObjectAsync({x, y});
          expect(pick?.layer?.id).toBe(hiddenFirst && index === 0 ? undefined : `points-${index}`);
          if (pick) expect(pick.index).toBe(index);
        }
        const [x, y] = viewport.project([0, 0]);
        expect((await deck.pickObjectAsync({x, y}))?.object).toBeUndefined();
      };
      try {
        await render([...masks, ...layers]);
        await check(false);
        // Re-render only channel zero; the other three channels must survive its clear.
        const changedMasks = [masks[0].clone({data: []}), ...masks.slice(1)];
        await render([...changedMasks, ...layers]);
        await check(true);
        await render([...changedMasks, layers[0].clone({maskInverted: true}), ...layers.slice(1)]);
        await check(false);
        expect(errors).toEqual([]);
      } finally {
        deck.finalize();
        readback.destroy();
        framebuffer.destroy();
        texture.destroy();
        device.destroy();
        // WebGLDevice.destroy does not release the browser's context slot.
        if (type === 'webgl') {
          (device as WebGLDevice).gl.getExtension('WEBGL_lose_context')?.loseContext();
        }
        container.remove();
        expect(sharedWebGLDevice?.isLost).toBe(false);
      }
    },
    // Four mask channels and repeated asynchronous picks are expensive on software GPUs.
    120000
  );
});

describe.each(['cartesian', 'globe', 'globe-outside'] as const)(
  'MaskExtension %s billboard',
  view => {
    test('clips icon corners on WebGPU', async ({skip}) => {
      if (!(await getWebGPUTestDevice())) return skip();
      const container = document.createElement('div');
      document.body.appendChild(container);
      const width = 128;
      const device = await luma.createDevice({
        type: 'webgpu',
        adapters: [webgpuAdapter],
        createCanvasContext: {container, width, height: width, useDevicePixels: false}
      });
      const texture = device.createTexture({
        width,
        height: width,
        format: 'rgba8unorm',
        usage: Texture.RENDER | Texture.COPY_SRC
      });
      const framebuffer = device.createFramebuffer({
        width,
        height: width,
        colorAttachments: [texture],
        depthStencilAttachment: 'depth24plus'
      });
      const readback = device.createBuffer({
        byteLength: texture.computeMemoryLayout().byteLength,
        usage: Buffer.COPY_DST | Buffer.MAP_READ
      });
      const atlas = device.createTexture({
        width: 1,
        height: 1,
        format: 'rgba8unorm',
        data: new Uint8Array([255, 255, 255, 255])
      });
      const mask = new SolidPolygonLayer({
        id: 'icon-mask',
        operation: 'mask',
        data: [
          [
            [view === 'globe-outside' ? -130 : view === 'globe' ? 90 : -64, -64],
            [view === 'globe-outside' ? -60 : view === 'globe' ? 180 : 0, -64],
            [view === 'globe-outside' ? -60 : view === 'globe' ? 180 : 0, 64],
            [view === 'globe-outside' ? -130 : view === 'globe' ? 90 : -64, 64]
          ]
        ],
        getPolygon: polygon => polygon
      });
      const icon = new IconLayer({
        id: 'masked-icon',
        data: [{position: [view === 'globe-outside' ? 85 : view === 'globe' ? 176 : -8, 0]}],
        getPosition: d => d.position,
        iconAtlas: atlas,
        iconMapping: {square: {x: 0, y: 0, width: 1, height: 1, mask: true}},
        getIcon: () => 'square',
        getSize: 64,
        getColor: [255, 0, 0],
        billboard: true,
        pickable: true,
        extensions: [new MaskExtension()],
        maskId: mask.id,
        maskByInstance: false
      });
      const deck = new Deck({
        device,
        parent: container,
        width,
        height: width,
        useDevicePixels: false,
        views: view !== 'cartesian' ? new GlobeView() : new OrthographicView(),
        initialViewState:
          view !== 'cartesian'
            ? {longitude: view === 'globe-outside' ? 85 : 180, latitude: 0, zoom: 1}
            : {target: [0, 0, 0], zoom: 0},
        layers: [],
        _framebuffer: framebuffer
      });
      try {
        for (const maskByInstance of [false, true]) {
          const currentIcon = icon.clone({id: `masked-icon-${maskByInstance}`, maskByInstance});
          device.handle.pushErrorScope('validation');
          await new Promise<void>((resolve, reject) =>
            deck.setProps({
              layers: [mask, currentIcon],
              onAfterRender: () => resolve(),
              onError: reject
            })
          );
          expect(await device.handle.popErrorScope()).toBeNull();
          texture.readBuffer({}, readback);
          const pixels = await readback.readAsync();
          for (const x of view === 'globe-outside' ? [40, 64, 72] : [40, 72]) {
            const visible = view !== 'globe-outside' && (x === 40 || maskByInstance);
            const offset = (64 * width + x) * 4;
            expect(Array.from(pixels.slice(offset, offset + 3))).toEqual(
              visible ? [255, 0, 0] : [0, 0, 0]
            );
            expect((await deck.pickObjectAsync({x, y: 64}))?.layer?.id).toBe(
              visible ? currentIcon.id : undefined
            );
          }
        }
      } finally {
        deck.finalize();
        readback.destroy();
        framebuffer.destroy();
        texture.destroy();
        atlas.destroy();
        device.destroy();
        container.remove();
      }
      // Software GPUs compile both icon and mask pipelines during initialization.
    }, 120000);
  }
);
