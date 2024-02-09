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

import {equals} from '@math.gl/core';
import type {Buffer, Device, UniformValue} from '@luma.gl/core';
import {BufferTransform, BufferTransformProps} from '@luma.gl/engine';
import {project32} from '@deck.gl/core';
import {project64} from '@deck.gl/extensions';

export function getPixelOffset(p1, p2) {
  return [p1[0] - p2[0], p1[1] - p2[1], p1[2] - p2[2], 1];
}

export function clipspaceToScreen(viewport, coords) {
  return [
    ((coords[0] / coords[3] + 1) / 2) * viewport.width,
    ((1 - coords[1] / coords[3]) / 2) * viewport.height,
    coords[2] / coords[3]
  ];
}

export async function runOnGPU({
  device,
  uniforms,
  usefp64 = true,
  ...transformProps
}: {
  device: Device;
  uniforms: Record<string, UniformValue>;
  vs: string;
  feedbackBuffers: Record<string, Buffer>;
  attributes?: Record<string, Buffer>;
  bufferLayout?: unknown[];
  vertexCount?: number;
  usefp64?: boolean;
}): Promise<Float32Array> {
  const modules = usefp64 ? [project64] : [project32];
  const transform = new BufferTransform(device, {
    ...(transformProps as BufferTransformProps),
    varyings: ['outValue'],
    modules
  });
  transform.model.setUniforms(uniforms);
  transform.run();

  const result: Uint8Array = await transformProps.feedbackBuffers.outValue.readAsync();
  return new Float32Array(result.buffer, result.byteOffset, result.byteLength / 4);
}

export function verifyResult({t, name, actual, expected, sliceActual = false}) {
  actual = Number.isFinite(actual) ? [actual] : actual;
  expected = Array.isArray(expected) ? expected : [expected];
  // Convert TypedArray to regular array
  // TODO: remove after https://github.com/uber-web/math.gl/pull/29
  actual = sliceActual ? Array.from(actual.slice(0, expected.length)) : actual;

  if (equals(actual, expected)) {
    t.pass(`${name} returns correct result`);
  } else {
    t.fail(`${name} returns ${actual}, expecting ${expected}`);
  }
}
