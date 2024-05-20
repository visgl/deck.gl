// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
