// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

// TODO - move to shaderlib utilities
import log from './log';
import {COORDINATE_SYSTEM} from '../lib/constants'; // TODO - utils should not import from lib

/*
 * Frequently used small math utils: bundlers, especially webpack,
 * adds a thunk around every exported function that adds enough overhead to pull down performance.
 * It may be worth it to also export these as part of an object.
 */
export function fp64ify(a, array = [], startIndex = 0) {
  const hiPart = Math.fround(a);
  const loPart = a - Math.fround(a);
  array[startIndex] = hiPart;
  array[startIndex + 1] = loPart;
  return array;
}

// calculate WebGL 64 bit matrix (transposed "Float64Array")
export function fp64ifyMatrix4(matrix) {
  // Transpose the projection matrix to column major for GLSL.
  const matrixFP64 = new Float32Array(32);
  for (let i = 0; i < 4; ++i) {
    for (let j = 0; j < 4; ++j) {
      const index = i * 4 + j;
      fp64ify(matrix[j * 4 + i], matrixFP64, index * 2);
    }
  }
  return matrixFP64;
}

export function fp64LowPart(a) {
  return a - Math.fround(a);
}

export function enable64bitSupport(props) {
  if (props.fp64) {
    if (props.coordinateSystem === COORDINATE_SYSTEM.LNGLAT) {
      return true;
    }
    log.once(
      0,
      `64-bit mode only works with coordinateSystem set to
      COORDINATE_SYSTEM.LNGLAT. Rendering in 32-bit mode instead`
    );
  }

  return false;
}
