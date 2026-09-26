// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_GlobeViewport as GlobeViewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {Buffer} from '@luma.gl/core';
import {Computation} from '@luma.gl/engine';
import {Matrix4} from '@math.gl/core';
import {runOnGPU, testUniforms} from './project-glsl-test-utils';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`Globe Cartesian positions use meters on all axes: ${backend}`, async ({skip}) => {
    const targetDevice = backend === 'webgpu' ? await getWebGPUTestDevice() : device;
    if (!targetDevice || targetDevice.type !== backend) return skip();

    const props = {
      viewport: new GlobeViewport({longitude: -100, latitude: 80, zoom: -1}),
      coordinateSystem: 'cartesian' as const,
      // Globe Cartesian positions retain the existing behavior of ignoring this origin.
      coordinateOrigin: [10, 20, 30] as [number, number, number],
      modelMatrix: new Matrix4().translate([100, 200, 300]).scale([2, 3, 4])
    };
    const high = [1024, 2048, -4096];
    const low = [0.25, -0.5, 0.75];
    const metersToCommon = 256 / 6370972;
    const expected = [
      (100 + 2 * (high[0] + low[0])) * metersToCommon,
      (200 + 3 * (high[1] + low[1])) * metersToCommon,
      (300 + 4 * (high[2] + low[2])) * metersToCommon
    ];
    let result: Float32Array;
    if (backend === 'webgl') {
      result = await runOnGPU({
        vs: `#version 300 es
          out vec3 result;
          void main() {
            result = project_position(test.uPos, test.uPos64Low);
          }`,
        modules: [project, testUniforms],
        vertexCount: 1,
        varying: 'result',
        shaderInputProps: {project: props, test: {uPos: high, uPos64Low: low}}
      });
    } else {
      const output = targetDevice.createBuffer({
        byteLength: 16,
        usage: Buffer.STORAGE | Buffer.COPY_SRC
      });
      const computation = new Computation(targetDevice, {
        modules: [project],
        source: `
          @group(0) @binding(0) var<storage, read_write> output: array<vec4<f32>>;
          @compute @workgroup_size(1)
          fn main() {
            output[0] = vec4<f32>(project_position_vec3_f64(vec3<f32>(${high.join(', ')}), vec3<f32>(${low.join(', ')})), 1.0);
          }`,
        bindings: {output}
      });
      try {
        computation.shaderInputs.setProps({project: props});
        computation.predraw(targetDevice.commandEncoder);
        const pass = targetDevice.beginComputePass();
        computation.dispatch(pass, 1);
        pass.end();
        targetDevice.submit();
        const bytes = await output.readAsync();
        result = new Float32Array(bytes.buffer, bytes.byteOffset, 3);
      } finally {
        computation.destroy();
        output.destroy();
      }
    }
    expected.forEach((value, i) => expect(result[i]).toBeCloseTo(value, 6));
  });
}
