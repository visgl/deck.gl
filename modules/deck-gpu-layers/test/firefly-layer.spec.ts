// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, MapView, COORDINATE_SYSTEM} from '@deck.gl/core';
import {luma, Buffer, Texture} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {webgl2Adapter} from '@luma.gl/webgl';
import {getTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';
import {FireflyLayer} from '../src';

test.each(['webgpu', 'webgl'] as const)(
  'fireflies on %s animate, pick and preserve borrowed input',
  async (backend, context) => {
    if (!(await getTestDevice(backend))) return context.skip(`${backend} unavailable`);
    const size = 64;
    const parent = document.createElement('div');
    parent.style.width = `${size}px`;
    parent.style.height = `${size}px`;
    document.body.append(parent);
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;
    const device = await luma.createDevice({
      type: backend,
      adapters: [webgpuAdapter, webgl2Adapter],
      createCanvasContext: {canvas, width: size, height: size, useDevicePixels: false}
    });
    const points = device.createBuffer({data: new Float32Array([0, 0, 0, 0.4, 1, 0.1, 1, 0])});
    const texture = device.createTexture({
      width: size,
      height: size,
      format: 'rgba8unorm',
      usage: Texture.RENDER | Texture.COPY_SRC
    });
    const framebuffer = device.createFramebuffer({
      width: size,
      height: size,
      colorAttachments: [texture],
      depthStencilAttachment: 'depth24plus'
    });
    let time = 0;
    let frames = 0;
    const errors: string[] = [];
    const deck = new Deck({
      parent,
      device,
      width: size,
      height: size,
      useDevicePixels: false,
      _framebuffer: framebuffer,
      views: new MapView({id: 'main'}),
      initialViewState: {longitude: 0, latitude: 0, zoom: 17},
      layers: [
        new FireflyLayer({
          id: 'firefly-test',
          coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
          coordinateOrigin: [0, 0, 0],
          points,
          pointCount: 1,
          pickable: true,
          radiusPixels: 5,
          time: () => time,
          animation: {enabled: 1, radius: 10, speed: 1, pulse: 0},
          style: {coreRadius: 0, haloIntensity: 2}
        })
      ],
      onAfterRender: () => frames++,
      onError: error => errors.push(error.message)
    });
    async function readFrame() {
      const previous = frames;
      const deadline = Date.now() + 10_000;
      do {
        deck.redraw('firefly test');
        await new Promise(resolve => requestAnimationFrame(resolve));
      } while (frames < previous + 2 && !errors.length && Date.now() < deadline);
      expect(errors).toEqual([]);
      expect(frames).toBeGreaterThan(previous);
      device.submit();
      const layout = texture.computeMemoryLayout();
      const output = device.createBuffer({
        byteLength: layout.byteLength,
        usage: Buffer.COPY_DST | Buffer.MAP_READ
      });
      try {
        texture.readBuffer({}, output);
        device.submit();
        return new Uint8Array(await output.readAsync()).slice();
      } finally {
        output.destroy();
      }
    }
    try {
      const first = await readFrame();
      const layout = texture.computeMemoryLayout();
      let strongest = 0;
      let pickedColumn = 0;
      let pickedRow = 0;
      for (let row = 0; row < size; row++)
        for (let column = 0; column < size; column++) {
          const offset = row * layout.bytesPerRow + column * 4;
          if (first[offset + 1] > strongest) {
            strongest = first[offset + 1];
            pickedColumn = column;
            pickedRow = row;
          }
        }
      expect(strongest).toBeGreaterThan(50);
      const picked = await deck.pickObjectAsync({
        x: pickedColumn,
        y: backend === 'webgl' ? size - 1 - pickedRow : pickedRow,
        radius: 2
      });
      expect(picked?.index).toBe(0);
      time = 3;
      const second = await readFrame();
      expect(second.some((value, index) => Math.abs(value - first[index]) > 30)).toBe(true);
      const paused = await readFrame();
      expect(paused).toEqual(second);
      const layer = deck
        .layerManager!.getLayers()
        .find((candidate): candidate is FireflyLayer => candidate instanceof FireflyLayer)!;
      const corners = layer.state.corners;
      deck.finalize();
      expect(corners.destroyed).toBe(true);
      expect(points.destroyed).toBe(false);
    } finally {
      deck.finalize();
      framebuffer.destroy();
      texture.destroy();
      points.destroy();
      device.destroy();
      parent.remove();
    }
  }
);
