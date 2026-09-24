// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {_CustomProjectionViewport as CustomProjectionViewport, project} from '@deck.gl/core';
import {device} from '@deck.gl/test-utils/vitest';
import {BufferTransform} from '@luma.gl/engine';
import {WGSLShaderAssembler} from '@luma.gl/shadertools';

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
      expected: [0, 0, 0, 0]
    },
    {
      name: 'outside field',
      data: [4, 0, 0, 3],
      size: 1,
      position: [513, 256],
      expected: [0, 0, 0, 0]
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
  ].flatMap(testCase => [false, true].map(relative => ({...testCase, relative})))
)(
  'project external scale: $name, origin-relative=$relative',
  async ({data, size, position, expected, relative}) => {
    const viewport = new CustomProjectionViewport({
      projection: {forward: p => p.slice(), inverse: p => p.slice()},
      toBounds: [0, 0, 512, 512],
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
        ${relative ? 'geometry.position = vec4(geometry.worldPosition - project.commonOrigin, 1.0);' : ''}
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
      expect(Array.from(result)).toEqual(expected);
      expect(Array.from(new Float32Array((await unitOutput.readAsync()).buffer))).toEqual([
        10,
        10,
        expected[2] * 1.2
      ]);
    } finally {
      transform.destroy();
      output.destroy();
      unitOutput.destroy();
      texture.destroy();
    }
  }
);
