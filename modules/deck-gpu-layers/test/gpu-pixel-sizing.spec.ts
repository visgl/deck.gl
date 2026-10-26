// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, MapView, type Layer} from '@deck.gl/core';
import {IconLayer, ScatterplotLayer} from '@deck.gl/layers';
import {GPUIconLayer, GPUScatterplotLayer} from '@deck.gl-community/gpu-layers';
import {Buffer, Texture, type Device} from '@luma.gl/core';
import {GPUData, GPUVector, type GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';

const SIZE = 128;

test('GPU point and icon pixel sizes match standard layers in a perspective view', async context => {
  const device = await getWebGPUTestDevice();
  if (!device) return context.skip();
  const buffers: Buffer[] = [];
  const vector = <FormatT extends GPUVectorFormat>(format: FormatT, values: number[]) => {
    const buffer = device.createBuffer({
      data: new Float32Array(values),
      usage: Buffer.VERTEX | Buffer.COPY_DST
    });
    buffers.push(buffer);
    return new GPUVector({
      type: 'data',
      name: format,
      format,
      ownsData: false,
      data: [
        new GPUData({
          buffer,
          format,
          length: 1,
          byteStride: values.length * 4,
          rowByteLength: values.length * 4,
          ownsBuffer: false
        })
      ]
    });
  };
  const positions = vector('float32x2', [0, 0]);
  const offsets = vector('float32x2', [0, 0]);
  const frames = vector('float32x4', [0, 0, 32, 32]);
  const colorModes = vector('float32', [0]);
  const atlas = device.createTexture({
    width: 32,
    height: 32,
    format: 'rgba8unorm',
    data: new Uint8Array(32 * 32 * 4).fill(255)
  });
  const target = device.createTexture({
    width: SIZE,
    height: SIZE,
    format: 'rgba8unorm',
    usage: Texture.RENDER | Texture.COPY_SRC
  });
  const framebuffer = device.createFramebuffer({
    width: SIZE,
    height: SIZE,
    colorAttachments: [target],
    depthStencilAttachment: 'depth24plus'
  });
  const parent = document.createElement('div');
  parent.style.width = `${SIZE}px`;
  parent.style.height = `${SIZE}px`;
  document.body.append(parent);
  let error: Error | null = null;
  const deck = new Deck({
    device,
    parent,
    width: SIZE,
    height: SIZE,
    useDevicePixels: false,
    _framebuffer: framebuffer,
    views: [new MapView()],
    initialViewState: {longitude: 0, latitude: 0, zoom: 2, pitch: 50},
    layers: [],
    onError: value => {
      error = value;
    }
  });
  const bounds = async (layer: Layer) => {
    device.beginRenderPass({framebuffer, clearColor: [0, 0, 0, 0], clearDepth: 1}).end();
    device.submit();
    deck.setProps({layers: [layer]});
    const deadline = Date.now() + 10000;
    let pixels: Uint8Array;
    do {
      await new Promise(resolve => requestAnimationFrame(resolve));
      deck.redraw(true);
      device.submit();
      pixels = await readPixels(device, target);
      expect(error).toBeNull();
    } while (
      !pixels.some((value, index) => index % 4 === 0 && value > 128) &&
      Date.now() < deadline
    );
    let minX = SIZE,
      minY = SIZE,
      maxX = -1,
      maxY = -1;
    for (let y = 0; y < SIZE; y++)
      for (let x = 0; x < SIZE; x++) {
        if (pixels[(y * SIZE + x) * 4] > 128) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    expect(maxX, layer.id).toBeGreaterThanOrEqual(minX);
    return [maxX - minX + 1, maxY - minY + 1];
  };
  try {
    const stockPoint = await bounds(
      new ScatterplotLayer({
        id: 'stock-point',
        data: [[0, 0]],
        getPosition: d => d,
        getRadius: 10,
        radiusUnits: 'pixels',
        billboard: true,
        getFillColor: [255, 255, 255]
      })
    );
    const gpuPoint = await bounds(
      new GPUScatterplotLayer({
        id: 'gpu-point',
        getPosition: positions,
        getRadius: 10,
        getFillColor: [255, 255, 255]
      })
    );
    const stockIcon = await bounds(
      new IconLayer({
        id: 'stock-icon',
        data: [[0, 0]],
        getPosition: d => d,
        getIcon: () => 'dot',
        getSize: 40,
        iconAtlas: atlas,
        iconMapping: {dot: {x: 0, y: 0, width: 32, height: 32}}
      })
    );
    const gpuIcon = await bounds(
      new GPUIconLayer({
        id: 'gpu-icon',
        getPosition: positions,
        iconOffsets: offsets,
        iconFrames: frames,
        iconColorModes: colorModes,
        iconAtlas: atlas,
        getSize: 40
      })
    );
    for (let axis = 0; axis < 2; axis++) {
      expect(Math.abs(gpuPoint[axis] - stockPoint[axis])).toBeLessThanOrEqual(2);
      expect(Math.abs(gpuIcon[axis] - stockIcon[axis])).toBeLessThanOrEqual(2);
    }
  } finally {
    deck.finalize();
    parent.remove();
    framebuffer.destroy();
    target.destroy();
    atlas.destroy();
    for (const buffer of buffers) buffer.destroy();
  }
}, 60000);

async function readPixels(device: Device, texture: Texture): Promise<Uint8Array> {
  const layout = texture.computeMemoryLayout({width: SIZE, height: SIZE});
  const buffer = device.createBuffer({
    byteLength: layout.byteLength,
    usage: Buffer.COPY_DST | Buffer.MAP_READ
  });
  try {
    texture.readBuffer({width: SIZE, height: SIZE}, buffer);
    const bytes = await buffer.readAsync();
    const pixels = new Uint8Array(SIZE * SIZE * 4);
    for (let row = 0; row < SIZE; row++)
      pixels.set(
        bytes.subarray(row * layout.bytesPerRow, row * layout.bytesPerRow + SIZE * 4),
        row * SIZE * 4
      );
    return pixels;
  } finally {
    buffer.destroy();
  }
}
