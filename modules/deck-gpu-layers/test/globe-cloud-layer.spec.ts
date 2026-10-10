// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Deck, Layer, MapView, _GlobeView, type LayerContext} from '@deck.gl/core';
import {luma, Buffer, Texture, type RenderPass} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/webgpu';
import {webgl2Adapter} from '@luma.gl/webgl';
import {Model} from '@luma.gl/engine';
import {getTestDevice} from '@luma.gl/test-utils';
import {expect, test} from 'vitest';
import {GlobeCloudLayer} from '../src';

const SIZE = 128;
class OccluderLayer extends Layer {
  static override layerName = 'GlobeCloudTestOccluder';
  declare state: {model: Model};
  override getAttributeManager() {
    return null;
  }
  override initializeState({device}: LayerContext) {
    this.setState({
      model: new Model(device, {
        source: `@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
        let positions = array<vec2f,3>(vec2f(-1,-1),vec2f(3,-1),vec2f(-1,3));
        return vec4f(positions[index],0.5,1);
      } @fragment fn fragmentMain() -> @location(0) vec4f { return vec4f(0,0,1,1); }`,
        vs: `#version 300 es
        void main() { vec2 positions[3]=vec2[3](vec2(-1,-1),vec2(3,-1),vec2(-1,3));
        gl_Position=vec4(positions[gl_VertexID],0.0,1.0); }`,
        fs: '#version 300 es\nprecision highp float; out vec4 color; void main(){color=vec4(0,0,1,1);}',
        vertexCount: 3,
        parameters: {depthWriteEnabled: true, depthCompare: 'less-equal'}
      })
    });
  }
  override getModels() {
    return this.state.model ? [this.state.model] : [];
  }
  override draw({renderPass}: {renderPass: RenderPass}) {
    this.state.model.draw(renderPass);
  }
  override finalizeState(context: LayerContext) {
    this.state.model.destroy();
    super.finalizeState(context);
  }
}

test.each(['webgpu', 'webgl'] as const)(
  'globe clouds on %s render cover, drift, sunlight, occlusion and clean up',
  async (backend, context) => {
    if (!(await getTestDevice(backend))) return context.skip(`${backend} unavailable`);
    const parent = document.createElement('div');
    parent.style.width = `${SIZE}px`;
    parent.style.height = `${SIZE}px`;
    document.body.append(parent);
    const canvas = document.createElement('canvas');
    parent.append(canvas);
    canvas.style.width = `${SIZE}px`;
    canvas.style.height = `${SIZE}px`;
    const device = await luma.createDevice({
      type: backend,
      adapters: [webgpuAdapter, webgl2Adapter],
      createCanvasContext: {canvas, width: SIZE, height: SIZE, useDevicePixels: false}
    });
    const texture = device.createTexture({
      width: SIZE,
      height: SIZE,
      format: 'rgba8unorm',
      usage: Texture.RENDER | Texture.COPY_SRC
    });
    const framebuffer = device.createFramebuffer({
      width: SIZE,
      height: SIZE,
      colorAttachments: [texture],
      depthStencilAttachment: 'depth24plus'
    });
    const errors: Error[] = [];
    let frames = 0;
    const cloud = (cover: number, time = 0, sunDirection: [number, number, number] = [0, -1, 0]) =>
      new GlobeCloudLayer({
        id: 'globe-cloud-test',
        cover,
        time,
        sunDirection,
        velocity: [22000, 5000]
      });
    const deck = new Deck({
      device,
      parent,
      width: SIZE,
      height: SIZE,
      useDevicePixels: false,
      _framebuffer: framebuffer,
      views: new _GlobeView(),
      initialViewState: {longitude: 0, latitude: 0, zoom: -1},
      layers: [],
      onError: error => errors.push(error),
      onAfterRender: () => frames++
    });
    async function readFrame(layers: Layer[]) {
      const previous = frames;
      deck.setProps({layers});
      const deadline = Date.now() + 10000;
      while (frames < previous + 2 && !errors.length && Date.now() < deadline) {
        deck.redraw('globe cloud test');
        await new Promise(resolve => requestAnimationFrame(resolve));
      }
      expect(errors).toEqual([]);
      expect(frames).toBeGreaterThan(previous);
      device.submit();
      const buffer = device.createBuffer({
        byteLength: texture.computeMemoryLayout().byteLength,
        usage: Buffer.COPY_DST | Buffer.MAP_READ
      });
      try {
        texture.readBuffer({}, buffer);
        device.submit();
        return new Uint8Array(await buffer.readAsync()).slice();
      } finally {
        buffer.destroy();
      }
    }
    const energy = (pixels: Uint8Array) =>
      pixels.reduce((sum, value, index) => (index % 4 === 0 ? sum + value : sum), 0);
    try {
      const clear = await readFrame([cloud(0)]);
      const cloudy = await readFrame([cloud(0.55)]);
      const drifting = await readFrame([cloud(0.55, 40)]);
      const night = await readFrame([cloud(0.55, 0, [0, 1, 0])]);
      expect(energy(clear)).toBe(0);
      expect(energy(cloudy)).toBeGreaterThan(1000);
      expect(energy(night)).toBeLessThan(energy(cloudy) * 0.4);
      expect(
        cloudy.reduce(
          (sum, value, index) => sum + (Math.abs(value - drifting[index]) > 10 ? 1 : 0),
          0
        )
      ).toBeGreaterThan(50);
      expect(cloudy[3], 'rays missing the spherical shell remain transparent').toBe(0);
      deck.setProps({initialViewState: {longitude: 0, latitude: 0, zoom: 10}});
      const inside = await readFrame([cloud(1)]);
      expect(
        energy(inside),
        'a camera inside the cloud shell retains finite fragment depth'
      ).toBeGreaterThan(1000);
      deck.setProps({initialViewState: {longitude: 0, latitude: 0, zoom: -1}});
      const foreground = await readFrame([new OccluderLayer({id: 'foreground'}), cloud(0.55)]);
      expect(energy(foreground), 'nearer geometry hides the cloud shell').toBe(0);
      expect(foreground[2]).toBe(255);
      const cloudLayer = deck
        .layerManager!.getLayers()
        .find((layer): layer is GlobeCloudLayer => layer instanceof GlobeCloudLayer)!;
      expect(cloudLayer.state.model.parameters.depthWriteEnabled).toBe(false);
      const cloudUniformBuffer =
        cloudLayer.state.model._uniformStore.getManagedUniformBuffer('clouds');
      await readFrame([cloud(0.55)]);
      expect(deck.pickObject({x: SIZE / 2, y: SIZE / 2})).toBeNull();
      deck.setProps({views: new MapView()});
      expect(energy(await readFrame([cloud(0.55)])), 'globe clouds skip flat map views').toBe(0);
      deck.finalize();
      expect(cloudUniformBuffer.destroyed).toBe(true);
    } finally {
      deck.finalize();
      framebuffer.destroy();
      texture.destroy();
      device.destroy();
      parent.remove();
    }
  },
  60000
);
