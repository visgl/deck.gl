// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {luma, Buffer} from '@luma.gl/core';
import type {Device, Texture} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {CubeGeometry} from '@luma.gl/engine';
import {LayerManager, OrthographicViewport} from '@deck.gl/core';
import type {TemporalFrame, Effect} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import DeckRenderer from '@deck.gl/core/lib/deck-renderer';

function half(bits: number): number {
  const sign = bits & 0x8000 ? -1 : 1;
  const exponent = (bits >> 10) & 31;
  return (
    sign *
    (exponent ? 1 + (bits & 1023) / 1024 : (bits & 1023) / 1024) *
    2 ** (exponent ? exponent - 15 : -14)
  );
}

async function readVelocity(device: Device, texture: Texture, x: number, y: number) {
  const buffer = device.createBuffer({byteLength: 256, usage: Buffer.COPY_DST | Buffer.MAP_READ});
  device.submit();
  texture.readBuffer({x, y, width: 1, height: 1}, buffer);
  try {
    const bytes = await buffer.readAsync();
    return Array.from(
      new Uint16Array(bytes.buffer, bytes.byteOffset, 4),
      value => half(value) || 0
    );
  } finally {
    buffer.destroy();
  }
}

const hasWebGPU = typeof navigator !== 'undefined' && 'gpu' in navigator;
test.skipIf(!hasWebGPU)(
  'object velocity tracks a translated cube and respects scene occlusion',
  async () => {
    const device = await luma.createDevice({
      type: 'webgpu',
      adapters: [webgpuAdapter],
      createCanvasContext: {width: 64, height: 64}
    });
    const viewport = new OrthographicViewport({id: 'main', width: 64, height: 64});
    const manager = new LayerManager(device, {viewport});
    const renderer = new DeckRenderer(device);
    const mesh = new CubeGeometry();
    let frame: TemporalFrame | undefined;
    const effect: Effect = {
      id: 'inspect-motion',
      props: {},
      setup() {},
      cleanup() {},
      preRender() {},
      postRender(opts) {
        frame = opts.temporal;
        return opts.inputBuffer;
      }
    };
    const render = (x: number) => {
      manager.setLayers([
        new SimpleMeshLayer({
          id: 'background',
          mesh,
          data: [[0, 0, -20]],
          getPosition: d => d,
          getScale: [32, 32, 1],
          coordinateSystem: 'cartesian'
        }),
        new SimpleMeshLayer({
          id: 'moving',
          mesh,
          data: [[x, 0, -10]],
          getPosition: d => d,
          getScale: [8, 8, 1],
          coordinateSystem: 'cartesian',
          _motionVectors: true
        }),
        new SimpleMeshLayer({
          id: 'occluder',
          mesh,
          data: [[5, 0, -5]],
          getPosition: d => d,
          getScale: [2, 8, 1],
          coordinateSystem: 'cartesian'
        })
      ]);
      renderer.renderLayers({
        pass: 'screen',
        layers: manager.getLayers(),
        viewports: [viewport],
        views: {},
        effects: [effect],
        onViewportActive: manager.activateViewport,
        canvasContext: device.canvasContext!
      });
    };
    try {
      renderer.setProps({layerFilter: null, drawPickingColors: false, _temporal: {jitter: false}});
      render(0);
      render(2);
      expect(frame!.objectVelocity).toBe(true);
      const object = await readVelocity(device, frame!.velocityTexture!, 32, 32);
      expect(Math.abs(object[0] * 64 + 2)).toBeLessThan(0.05);
      expect(Math.abs(object[1] * 64)).toBeLessThan(0.05);
      expect((await readVelocity(device, frame!.velocityTexture!, 12, 32)).slice(0, 2)).toEqual([
        0, 0
      ]);
      expect((await readVelocity(device, frame!.velocityTexture!, 37, 32)).slice(0, 2)).toEqual([
        0, 0
      ]);
      renderer.setProps({
        layerFilter: null,
        drawPickingColors: false,
        _temporal: {jitter: false, objectVelocity: false}
      });
      render(2);
      render(4);
      expect(frame!.objectVelocity).toBe(false);
      expect((await readVelocity(device, frame!.velocityTexture!, 32, 32)).slice(0, 2)).toEqual([
        0, 0
      ]);
    } finally {
      renderer.finalize();
      manager.finalize();
      device.destroy();
    }
  }
);
