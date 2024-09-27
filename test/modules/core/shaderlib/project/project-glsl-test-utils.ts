// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {equals, NumericArray} from '@math.gl/core';
import type {UniformValue} from '@luma.gl/core';
import {BufferTransform, BufferTransformProps} from '@luma.gl/engine';
import {device} from '@deck.gl/test-utils';

export function getPixelOffset(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2], 1];
}

const OUT_BUFFER = device.createBuffer({byteLength: 4 * 16});

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
    varyings: [varying]
  });
  transform.model.setUniforms(uniforms);
  transform.model.shaderInputs.setProps(shaderInputProps);
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
