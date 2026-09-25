// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport, project} from '@deck.gl/core';
import {PROJECTION_MODE} from '@deck.gl/core/lib/constants';
import {device} from '@deck.gl/test-utils/vitest';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';
import {getWorldPosition} from '@deck.gl/core/shaderlib/project/project-functions';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Buffer} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import {Matrix4} from '@math.gl/core';

const gpuTest = device.type === 'webgl' ? test : test.skip;

gpuTest('Cartesian common XY and meter Z retain their model matrix and origin', async () => {
  const viewport = new CustomProjectionViewport({
    projection: {forward: p => p.slice(), inverse: p => p.slice()},
    getDistanceScale: () => [0.25, 1]
  });
  const props = {
    viewport,
    coordinateSystem: 'cartesian' as const,
    coordinateOrigin: [5, 6, 7] as [number, number, number],
    modelMatrix: new Matrix4().translate([256, 256, 0]).scale([2, 3, 4])
  };
  const position = [1, 2, 3];
  const expected = [263, 268, 19 * viewport.distanceScales.unitsPerMeter[2]];
  expect(viewport.isGeospatial).toBe(true);
  expect(getWorldPosition(position, props)).toEqual(expected);
  const result = await runOnGPU({
    vs: `#version 300 es
      out vec3 result;
      void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
    modules: [project, testUniforms],
    vertexCount: 1,
    varying: 'result',
    shaderInputProps: {project: props, test: {uPos: position, uPos64Low: [0, 0, 0]}}
  });
  expected.forEach((value, i) => expect(result[i]).toBeCloseTo(value, 6));
});

test('external projection WGSL preserves XY and uses scalar and per-axis distance scales', async ({
  skip
}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) return skip();
  const viewport = new CustomProjectionViewport({
    projection: {forward: p => p.slice(), inverse: p => p.slice()},
    getDistanceScale: () => [0.25, 1],
    center: [300, 200, 0]
  });
  const output = webgpuDevice.createBuffer({
    byteLength: 64,
    usage: Buffer.STORAGE | Buffer.COPY_SRC
  });
  const computation = new Computation(webgpuDevice, {
    modules: [project],
    source: `
      @group(0) @binding(0) var<storage, read_write> output: array<vec4<f32>>;
      @compute @workgroup_size(1)
      fn main() {
        output[0] = vec4<f32>(project_position_vec3_f64(vec3<f32>(310.0, 220.0, 50.0), vec3<f32>(0.125, -0.25, 0.5)) + project.commonOrigin, 1.0);
        output[1] = vec4<f32>(vec3<f32>(project_size_float(1.0)), 0.0);
        output[2] = vec4<f32>(project_size_vec2(vec2<f32>(1.0)), 0.0, 0.0);
        output[3] = vec4<f32>(project_size_vec3(vec3<f32>(1.0)), 0.0);
      }`,
    bindings: {output}
  });
  try {
    computation.shaderInputs.setProps({project: {viewport}});
    computation.predraw(webgpuDevice.commandEncoder);
    const pass = webgpuDevice.beginComputePass();
    computation.dispatch(pass, 1);
    pass.end();
    webgpuDevice.submit();
    const bytes = await output.readAsync();
    const values = new Float32Array(bytes.buffer, bytes.byteOffset, 16);
    const expectedPosition = [310.125, 219.75, 50.5 * viewport.distanceScales.unitsPerMeter[2]];
    expectedPosition.forEach((value, i) => expect(values[i]).toBeCloseTo(value, 6));
    const [x, y, scalar] = viewport.distanceScales.unitsPerMeter;
    [scalar, scalar, scalar, 0, x, y, 0, 0, x, y, scalar, 0].forEach((value, i) => {
      expect(values[i + 4] / (512 / 40075016.6855)).toBeCloseTo(value / (512 / 40075016.6855), 6);
    });
  } finally {
    computation.destroy();
    output.destroy();
  }
});

for (const metersPerZUnit of [1, 0.3048]) {
  gpuTest(
    `CustomProjectionViewport converts world altitude to meters without changing meter sizes, metersPerZUnit=${metersPerZUnit}`,
    async () => {
      const viewport = new CustomProjectionViewport({
        projection: {
          forward: ([x, y, z = 0]) => [x, y, z * metersPerZUnit],
          inverse: ([x, y, z = 0]) => [x, y, z / metersPerZUnit]
        },
        getDistanceScale: () => [0.25, 1]
      });
      const input = [200, 300, 50];
      expect(viewport.projectionMode).toBe(PROJECTION_MODE.EXTERNAL);
      expect(project.getUniforms({viewport}).commonUnitsPerWorldUnit).toEqual(
        viewport.distanceScales.unitsPerMeter
      );
      const normalizationScale = 512 / 40075016.6855;
      const position = viewport.preproject!(input);
      expect(position).toEqual([
        256 + 200 * normalizationScale,
        256 + 300 * normalizationScale,
        50 * metersPerZUnit
      ]);
      const common = viewport.projectPosition(input);
      [position[0], position[1], position[2] * viewport.distanceScales.unitsPerMeter[2]].forEach(
        (value, i) => expect(common[i]).toBeCloseTo(value, 12)
      );
      expect(project.getUniforms({viewport}).commonUnitsPerMeter).toEqual([
        4 * normalizationScale,
        normalizationScale,
        2 * normalizationScale
      ]);
      expect(
        getWorldPosition(input, {
          viewport,
          coordinateSystem: 'default',
          coordinateOrigin: [0, 0, 0]
        })
      ).toEqual(common);
      expect(
        getWorldPosition(position, {
          viewport,
          coordinateSystem: 'cartesian',
          coordinateOrigin: [0, 0, 0]
        })
      ).toEqual(common);
      const result = await runOnGPU({
        vs: `#version 300 es
      out vec3 result;
      void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
        modules: [project, testUniforms],
        vertexCount: 1,
        varying: 'result',
        shaderInputProps: {project: {viewport}, test: {uPos: position, uPos64Low: [0, 0, 0]}}
      });
      common.forEach((value, i) => expect(result[i]).toBeCloseTo(value));
      expect(result[2] / common[2]).toBeCloseTo(1, 6);
      const low = [0.125, -0.25, 0.5];
      const withLow = await runOnGPU({
        vs: `#version 300 es
        out vec3 result;
        void main() { result = project_position(test.uPos, test.uPos64Low) + project.commonOrigin; }`,
        modules: [project, testUniforms],
        vertexCount: 1,
        varying: 'result',
        shaderInputProps: {
          project: {viewport, coordinateSystem: 'cartesian'},
          test: {uPos: position, uPos64Low: low}
        }
      });
      const expectedPosition = [
        position[0] + low[0],
        position[1] + low[1],
        (position[2] + low[2]) * viewport.distanceScales.unitsPerMeter[2]
      ];
      expectedPosition.forEach((value, i) => expect(withLow[i]).toBeCloseTo(value, 4));
      expect(withLow[2] / expectedPosition[2]).toBeCloseTo(1, 6);
      // Scalar sizing preserves aspect ratio; vector sizing uses each axis scale.
      for (const [expression, expected] of [
        ['vec3(project_size(1.0))', [2, 2, 2]],
        ['vec3(project_size(vec2(1.0)), 0.0)', [4, 1, 0]],
        ['project_size(vec3(1.0))', [4, 1, 2]]
      ] as const) {
        const size = await runOnGPU({
          vs: `#version 300 es
          out vec3 result;
          void main() { result = ${expression}; }`,
          modules: [project],
          vertexCount: 1,
          varying: 'result',
          shaderInputProps: {project: {viewport}, test: {}}
        });
        expected.forEach((value, i) => expect(size[i] / normalizationScale).toBeCloseTo(value, 6));
      }
    }
  );
}
