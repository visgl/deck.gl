// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Deck, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {MaskExtension} from '@deck.gl/extensions';
import {Buffer, luma, Texture} from '@luma.gl/core';
import {webgl2Adapter} from '@luma.gl/core/webgl';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getTestDevice} from '@luma.gl/core/test-utils';

for (const type of ['webgl', 'webgpu'] as const) {
  test.each(['map', 'globe'] as const)(
    `MaskExtension#${type} %s channel updates and picking`,
    async (view, context) => {
      if (!(await getTestDevice(type))) return context.skip();
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
        container.remove();
      }
    },
    // Four mask channels and repeated asynchronous picks are expensive on software GPUs.
    120000
  );
}
