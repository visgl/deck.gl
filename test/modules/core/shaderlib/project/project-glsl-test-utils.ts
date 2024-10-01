// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {equals, NumericArray, NumberArray2, NumberArray3, NumberArray4} from '@math.gl/core';
import type {UniformValue} from '@luma.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';

import {BufferTransform, BufferTransformProps} from '@luma.gl/engine';
import {device} from '@deck.gl/test-utils';

export function getPixelOffset(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2], 1];
}

const OUT_BUFFER = device.createBuffer({byteLength: 4 * 16});

// TODO move to separate file?
const uniformBlock = /* glsl */ `\
uniform testUniforms {
  vec4 uCommonPos;
  vec3 uDirUp;
  vec3 uInput;
  vec3 uPos;
  vec3 uPos64Low;
  vec3 uWorldPos;
} test;
`;

export type TestOptions = {
  uCommonPos?: NumberArray4;
  uDirUp?: NumberArray3;
  uInput?: NumberArray3;
  uPos?: NumberArray3;
  uPos64Low?: NumberArray3;
  uWorldPos?: NumberArray3;
};

export const testUniforms = {
  name: 'test',
  vs: uniformBlock,
  uniformTypes: {
    uCommonPos: 'vec4<f32>',
    uDirUp: 'vec3<f32>',
    uInput: 'vec3<f32>',
    uPos: 'vec3<f32>',
    uPos64Low: 'vec3<f32>',
    uWorldPos: 'vec3<f32>'
  }
} as const satisfies ShaderModule<TestOptions>;

export async function runOnGPU({
  shaderInputProps,
  uniforms,
  varying,
  ...transformProps
}: BufferTransformProps & {
  shaderInputProps: Record<string, Record<string, any>>;
  uniforms: Record<string, UniformValue>;
  varying: string;
}): Promise<Float32Array> {
  const transform = new BufferTransform(device, {
    ...transformProps,
    feedbackBuffers: {[varying]: OUT_BUFFER},
    varyings: [varying],
    modules: [...transformProps.modules, testUniforms]
  });
  transform.model.setUniforms(uniforms);
  transform.model.shaderInputs.setProps({...shaderInputProps, test: uniforms});
  transform.run({
    discard: true
  });

  const result: Uint8Array = await OUT_BUFFER.readAsync();
  return new Float32Array(result.buffer);
}

export function verifyGPUResult(
  actual: Float32Array,
  expected: number | NumericArray
): string | true {
  const expectedArr: NumericArray = typeof expected === 'number' ? [expected] : expected;
  // truncate buffer to match expected length
  const actualArr = actual.slice(0, expectedArr.length);

  if (equals(actualArr, expectedArr)) {
    return true;
  } else {
    return `returns ${actualArr}, expecting ${expectedArr}`;
  }
}
