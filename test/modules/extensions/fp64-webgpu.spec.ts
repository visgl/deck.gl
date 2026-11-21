// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Deck, WebMercatorViewport} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {Fp64Extension} from '@deck.gl/extensions';
import {Buffer, luma, Texture} from '@luma.gl/core';
import {webgpuAdapter} from '@luma.gl/core/webgpu';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Computation} from '@luma.gl/engine';
import project64 from '../../../modules/extensions/src/fp64/project64';

// Nearby coordinates share their f32 high terms but remain separate at zoom 24.
test('Fp64Extension#WebGPU high-zoom rendering and picking', async context => {
  const testDevice = await getWebGPUTestDevice();
  // Like luma.gl's fp64 numerical suite, require hardware for precision assertions.
  if (!testDevice || testDevice.info.gpu === 'software' || testDevice.info.fallback) {
    return context.skip();
  }
  const width = 128;
  const height = 128;
  const longitude = Math.fround(-122.42694203247012);
  const latitude = 37.751537058389985;
  const viewport = new WebMercatorViewport({width, height, longitude, latitude, zoom: 24});
  const positions = [-24, 24].map(offset => viewport.unproject([width / 2 + offset, height / 2]));
  expect(Math.fround(positions[0][0])).toBe(Math.fround(positions[1][0]));
  const container = document.createElement('div');
  document.body.appendChild(container);
  const device = await luma.createDevice({
    type: 'webgpu',
    adapters: [webgpuAdapter],
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
  const layer = new ScatterplotLayer({
    id: 'fp64-high-zoom',
    data: positions,
    getPosition: position => position,
    getRadius: 8,
    radiusUnits: 'pixels',
    getFillColor: [255, 0, 0],
    pickable: true,
    extensions: [new Fp64Extension()]
  });
  const deck = new Deck({
    device,
    parent: container,
    width,
    height,
    useDevicePixels: false,
    initialViewState: {longitude, latitude, zoom: 24},
    _framebuffer: framebuffer,
    layers: [layer],
    onError: error => errors.push(error)
  });
  try {
    await new Promise<void>(resolve => deck.setProps({onAfterRender: () => resolve()}));
    deck.redraw('fp64 high zoom');
    texture.readBuffer({}, readback);
    const pixels = await readback.readAsync();
    for (const [index, x] of [40, 88].entries()) {
      expect(pixels[(64 * width + x) * 4], 'CPU-projected center is red').toBe(255);
      expect((await deck.pickObjectAsync({x, y: 64}))?.index).toBe(index);
    }
    expect(pixels[(64 * width + 64) * 4], 'nearby positions remain separated').toBe(0);
    expect((await deck.pickObjectAsync({x: 64, y: 64}))?.object).toBeUndefined();
    expect(errors).toEqual([]);
  } finally {
    deck.finalize();
    readback.destroy();
    framebuffer.destroy();
    texture.destroy();
    device.destroy();
    container.remove();
  }
}, 120000);

test('Fp64Extension#WebGPU Mercator boundaries, matrix ordering and clip depth', async context => {
  const device = await getWebGPUTestDevice();
  if (!device || device.info.gpu === 'software' || device.info.fallback) return context.skip();
  const viewport = new WebMercatorViewport({
    width: 128,
    height: 128,
    longitude: -122,
    latitude: 37,
    zoom: 11,
    pitch: 45,
    bearing: 30
  });
  const positions = [
    [-180, -85.0511287798, 0],
    [0, 0, 0],
    [180, 85.0511287798, 0],
    [-122.001, 37.001, 100]
  ];
  const inputData = new Float32Array(positions.length * 8);
  positions.forEach((position, index) => {
    inputData.set([...position, 0], index * 8);
    inputData.set(
      position.map(value => value - Math.fround(value)),
      index * 8 + 4
    );
  });
  const input = device.createBuffer({data: inputData, usage: Buffer.STORAGE});
  const output = device.createBuffer({
    byteLength: positions.length * 32,
    usage: Buffer.STORAGE | Buffer.COPY_SRC
  });
  const computation = new Computation(device, {
    modules: [project64],
    source: /* wgsl */ `
      @group(0) @binding(0) var<storage, read> input: array<vec4f>;
      @group(0) @binding(1) var<storage, read_write> output: array<vec4f>;
      @compute @workgroup_size(1)
      fn main(@builtin(global_invocation_id) invocation: vec3u) {
        // Keep the arithmetic uniform active with WebGPU's automatic compute layout.
        if (fp64arithmetic.ONE != 1.0) { return; }
        let index = invocation.x * 2u;
        geometry.worldPosition = input[index].xyz;
        let result = project_position_to_clipspace_and_commonspace(
          input[index].xyz, input[index + 1u].xyz, vec3f(0.0));
        output[index] = result.clipPosition;
        output[index + 1u] = result.commonPosition;
      }`,
    bindings: {input, output}
  });
  try {
    computation.shaderInputs.setProps({
      project: {viewport, coordinateSystem: 'lnglat'},
      project64: {viewport}
    });
    computation.predraw(device.commandEncoder);
    const pass = device.beginComputePass();
    computation.dispatch(pass, positions.length);
    pass.end();
    device.submit();
    const bytes = await output.readAsync();
    const values = new Float32Array(bytes.buffer, bytes.byteOffset, positions.length * 8);
    positions.forEach((position, index) => {
      const common = [...viewport.projectPosition(position), 1];
      const matrix = viewport.viewProjectionMatrix;
      const clip = [0, 1, 2, 3].map(row =>
        common.reduce((sum, value, column) => sum + matrix[column * 4 + row] * value, 0)
      );
      clip[2] = (clip[2] + clip[3]) * 0.5;
      [...clip, ...common].forEach((expected, component) => {
        expect(
          Math.abs(values[index * 8 + component] - expected),
          `${position} component ${component}`
        ).toBeLessThan(Math.max(1e-5, Math.abs(expected) * 2e-6));
      });
    });
  } finally {
    computation.destroy();
    input.destroy();
    output.destroy();
  }
});
