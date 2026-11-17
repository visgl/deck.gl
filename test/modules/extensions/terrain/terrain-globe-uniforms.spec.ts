// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {_GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {Buffer, type Texture} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Computation} from '@luma.gl/engine';
import {terrainModule} from '@deck.gl/extensions/terrain/shader-module';

test('terrain height-map bounds stay in absolute Mercator space for globe meter offsets', () => {
  const viewport = new GlobeViewport({
    width: 256,
    height: 256,
    longitude: 0,
    latitude: 60,
    zoom: 6
  });
  const texture = {} as Texture;
  const bounds: [number, number, number, number] = [250, 350, 252, 353];
  const uniforms = terrainModule.getUniforms({
    project: {viewport, coordinateSystem: 'meter-offsets', coordinateOrigin: [0, 60, 0]},
    dummyHeightMap: texture,
    heightMap: texture,
    heightMapBounds: bounds,
    drawToTerrainHeightMap: false,
    useTerrainHeightMap: true
  });
  expect(uniforms.bounds).toEqual([250, 350, 2, 3]);
});

test('terrain globe height scale follows the projected meter-offset anchor', async ({skip}) => {
  const device = await getWebGPUTestDevice();
  if (!device) return skip();
  const viewport = new GlobeViewport({
    width: 256,
    height: 256,
    longitude: 0,
    latitude: 60,
    zoom: 6
  });
  const texture = device.createTexture({width: 1, height: 1, data: new Uint8Array([0, 0, 0, 0])});
  const output = device.createBuffer({byteLength: 16, usage: Buffer.STORAGE | Buffer.COPY_SRC});
  const computation = new Computation(device, {
    modules: [terrainModule],
    source: `
      @group(0) @binding(auto) var<storage, read_write> output: array<vec4<f32>>;
      @compute @workgroup_size(1) fn main() {
        let anchor = project_position_vec3_f32(vec3<f32>(0.0));
        output[0] = vec4<f32>(terrain_globe_latitude_scale(anchor), 0.0, 0.0, 0.0);
        if (terrain.mode > 100.0) { output[0] = textureLoad(terrain_map, vec2<i32>(0), 0); }
      }
    `,
    bindings: {output, terrain_map: texture}
  });
  try {
    computation.shaderInputs.setProps({
      project: {viewport, coordinateSystem: 'meter-offsets', coordinateOrigin: [0, 60, 0]},
      terrain: {dummyHeightMap: texture}
    });
    computation.predraw(device.commandEncoder);
    const pass = device.beginComputePass();
    computation.dispatch(pass, 1);
    pass.end();
    device.submit();
    const bytes = await output.readAsync();
    expect(new Float32Array(bytes.buffer, bytes.byteOffset, 1)[0]).toBeCloseTo(0.5, 4);
  } finally {
    computation.destroy();
    output.destroy();
    texture.destroy();
  }
});
