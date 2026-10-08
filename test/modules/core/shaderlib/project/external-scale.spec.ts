// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {BufferTransform} from '@luma.gl/engine';
import {WGSLShaderAssembler} from '@luma.gl/shadertools';
import {Computation} from '@luma.gl/engine';
import {Buffer} from '@luma.gl/core';
import {Matrix4} from '@math.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import ProjectionScaleResources from '@deck.gl/core/lib/projection-scale-resources';
import {getWorldPosition} from '@deck.gl/core/shaderlib/project/project-functions';

test('WebGPU local meter scale preserves CPU altitude with rectangular bounds, matrix and origin', async ({
  skip
}) => {
  const gpu = await getWebGPUTestDevice();
  if (!gpu) return skip();
  const viewport = new CustomProjectionViewport({
    projection: {forward: p => p.slice(), inverse: p => p.slice()},
    fromCrs: '+units=m',
    toBounds: [1000, -3000, 2024, 1096],
    center: [1600, -1000, 0],
    getDistanceScale: ([x]) => [1000 / x, 1000 / x]
  });
  const resources = new ProjectionScaleResources(gpu);
  const output = gpu.createBuffer({byteLength: 16, usage: Buffer.STORAGE | Buffer.COPY_SRC});
  const computation = new Computation(gpu, {
    modules: [project],
    defines: {USE_EXTERNAL_PROJECTION: true},
    source: `
      @group(0) @binding(0) var<storage, read_write> output: array<vec4<f32>>;
      @compute @workgroup_size(1)
      fn main() {
        geometry.worldPosition = vec3<f32>(100.0, 200.0, 10.0);
        geometry.position = vec4<f32>(project_position_vec3_f64(geometry.worldPosition, vec3<f32>(0.0)), 1.0);
        output[0] = vec4<f32>(geometry.position.xyz + project.commonOrigin, project_size_float(10.0));
      }`,
    bindings: {output}
  });
  const props = {
    viewport,
    coordinateSystem: 'cartesian' as const,
    coordinateOrigin: [50, 100, 5] as [number, number, number],
    modelMatrix: new Matrix4().translate([1300, -1700, 0]).scale([2, 3, 2]),
    sizeScale: resources.get(viewport)
  };
  try {
    computation.shaderInputs.setProps({project: props});
    computation.setBindings(computation.shaderInputs.getBindingValues());
    computation.predraw(gpu.commandEncoder);
    const pass = gpu.beginComputePass();
    computation.dispatch(pass, 1);
    pass.end();
    gpu.submit();
    const bytes = await output.readAsync();
    const actual = new Float32Array(bytes.buffer, bytes.byteOffset, 4);
    const expected = [...getWorldPosition([100, 200, 10], props), 15.5 * normalizationScale];
    expected.forEach((value, i) =>
      expect(actual[i] / normalizationScale).toBeCloseTo(value / normalizationScale, 3)
    );
  } finally {
    computation.destroy();
    output.destroy();
    resources.destroy();
  }
});

test('WGSL external scale binding is present only in the opted-in shader variant', () => {
  const assembler = new WGSLShaderAssembler();
  for (const enabled of [undefined, true, false, true, undefined]) {
    const assembled = assembler.assembleWGSLShader({
      platformInfo: {
        type: 'webgpu',
        gpu: 'test-gpu',
        shaderLanguage: 'wgsl',
        shaderLanguageVersion: 300,
        features: new Set()
      },
      source:
        '@vertex fn vertexMain() -> @builtin(position) vec4<f32> { return vec4<f32>(project_size_float(1.0)); }',
      modules: [project],
      defines: enabled === undefined ? {} : {USE_EXTERNAL_PROJECTION: enabled}
    });
    expect(assembled.source.includes('project_sizeScaleBuffer')).toBe(Boolean(enabled));
    expect(assembled.source.includes('project_external_size_scale')).toBe(Boolean(enabled));
    expect(
      assembled.shaderLayout?.bindings.some(binding => binding.name === 'project_sizeScaleBuffer')
    ).toBe(Boolean(enabled));
  }
});

const normalizationScale = 512 / 40075016.6855;
const gpuTest = device.type === 'webgl' ? test : test.skip;
gpuTest.each(
  [
    {
      name: 'scalar XY and independent Z',
      data: [4, 0, 0, 3],
      size: 1,
      position: [256, 256],
      expected: [40, 40, 30, 40]
    },
    {
      name: 'identity fallback',
      data: [1, 0, 0, 1],
      size: 1,
      position: [128, 384],
      expected: [10, 10, 10, 10]
    },
    {
      name: 'signed slopes',
      data: [4, 0.125, -0.0625, 3],
      size: 1,
      position: [272, 240],
      expected: [70, 70, 52.5, 70]
    },
    {
      name: 'edge extrapolation',
      data: [4, 0.0078125, 0, 3],
      size: 1,
      position: [512, 256],
      expected: [60, 60, 45, 60]
    },
    {
      name: 'invalid region',
      data: [0, 1, 1, 0],
      size: 1,
      position: [272, 240],
      expected: [10, 10, 10, 10]
    },
    {
      name: 'outside field',
      data: [4, 0, 0, 3],
      size: 1,
      position: [513, 256],
      expected: [10, 10, 10, 10]
    },
    {
      name: 'nearest sample, no blending',
      data: [1, 0, 0, 3, 2, 0, 0, 3, 4, 0, 0, 3, 8, 0, 0, 3],
      size: 2,
      position: [256, 256],
      expected: [80, 80, 30, 80]
    },
    {
      name: 'negative correction clamped',
      data: [1, -1, 0, 3],
      size: 1,
      position: [272, 256],
      expected: [0, 0, 0, 0]
    }
  ].flatMap(testCase =>
    [false, true].flatMap(relative =>
      [false, true].map(rectangular => ({...testCase, relative, rectangular}))
    )
  )
)(
  'project external scale: $name, origin-relative=$relative, rectangular=$rectangular',
  async ({data, size, position: samplePosition, expected, relative, rectangular}) => {
    const position = rectangular
      ? [1000 + samplePosition[0] * 2, -3000 + samplePosition[1] * 8]
      : samplePosition;
    const viewport = new CustomProjectionViewport({
      projection: {forward: p => p.slice(), inverse: p => p.slice()},
      toBounds: rectangular ? [1000, -3000, 2024, 1096] : [0, 0, 512, 512],
      fromCrs: '+units=m',
      center: [300, 280, 0]
    });
    const texture = device.createTexture({
      width: size,
      height: size,
      format: 'rgba32uint',
      data: new Uint32Array(new Float32Array(data).buffer)
    });
    const output = device.createBuffer({byteLength: 32});
    const unitOutput = device.createBuffer({byteLength: 12});
    const transform = new BufferTransform(device, {
      vs: `#version 300 es
      out vec4 result;
      out vec3 unitsResult;
      void main() {
        geometry.worldPosition = vec3(${position[0]}.0, ${position[1]}.0, 0.0);
        ${relative ? 'geometry.position = vec4(geometry.worldPosition * project.commonUnitsPerWorldUnit - project.commonOrigin, 1.0);' : ''}
        result = vec4(project_size(vec2(10.0)), project_size(10.0), project_size_to_pixel(10.0));
        // Position projection must sample its own XY, not stale geometry state.
        geometry.position = vec4(0.0, 0.0, 0.0, 1.0);
        float altitude = project_position(vec3(${position[0]}.0, ${position[1]}.0, 10.0), vec3(0.0, 0.0, 2.0)).z;
        unitsResult = vec3(project_size_to_pixel(10.0, UNIT_COMMON), project_size_to_pixel(10.0, UNIT_PIXELS), altitude);
      }`,
      modules: [project],
      defines: {USE_EXTERNAL_PROJECTION: true},
      vertexCount: 1,
      varyings: ['result', 'unitsResult'],
      feedbackBuffers: {result: output, unitsResult: unitOutput}
    });
    try {
      const messages = await transform.model.pipeline.vs.getCompilationInfo();
      expect(messages.filter(message => message.type === 'error')).toEqual([]);
      transform.model.shaderInputs.setProps({project: {viewport, sizeScale: texture}});
      transform.run({discard: true});
      const result = new Float32Array((await output.readAsync()).buffer).slice(0, 4);
      Array.from(result).forEach((value, i) =>
        expect(value / normalizationScale).toBeCloseTo(expected[i], 4)
      );
      const units = new Float32Array((await unitOutput.readAsync()).buffer);
      expect(Array.from(units.slice(0, 2))).toEqual([10, 10]);
      expect(units[2] / normalizationScale).toBeCloseTo(12, 4);
    } finally {
      transform.destroy();
      output.destroy();
      unitOutput.destroy();
      texture.destroy();
    }
  }
);
