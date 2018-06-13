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

/* eslint-disable no-console, no-invalid-this */

const LARGE_ARRAY = new Float32Array(1e6);
for (let i = 0; i < 1e6; i++) {
  LARGE_ARRAY[i] = Math.random();
}

const MEDIUM_ARRAY = new Float32Array(1e1);
for (let i = 0; i < 1e1; i++) {
  MEDIUM_ARRAY[i] = Math.random();
}

const SMALL_ARRAY = new Float32Array(1e1);
for (let i = 0; i < 1e1; i++) {
  SMALL_ARRAY[i] = Math.random();
}

// add tests

// Small copies could be overwhelmed by array creation.
const savedNewArray = new Float32Array(1e1);

export default function arrayCopyBench(suite) {
  return suite
    .group('TYPED ARRAY COPY')
    .add('copy#for-loop (1e6 elements)', () => {
      const length = LARGE_ARRAY.length;
      const newArray = new Float32Array(length);
      for (let i = 0; i < length; ++i) {
        newArray[i] = LARGE_ARRAY[i];
      }
    })
    .add('copy#set (1e6 elements)', () => {
      const length = LARGE_ARRAY.length;
      const newArray = new Float32Array(length);
      newArray.set(LARGE_ARRAY);
    })
    .add('copy#for-loop (1e3 elements)', () => {
      const length = MEDIUM_ARRAY.length;
      const newArray = new Float32Array(length);
      for (let i = 0; i < length; ++i) {
        newArray[i] = MEDIUM_ARRAY[i];
      }
    })
    .add('copy#set (1e3 elements)', () => {
      const length = MEDIUM_ARRAY.length;
      const newArray = new Float32Array(length);
      newArray.set(MEDIUM_ARRAY);
    })
    .add('copy#for-loop (10 elements)', () => {
      const length = SMALL_ARRAY.length;
      for (let i = 0; i < length; ++i) {
        savedNewArray[i] = SMALL_ARRAY[i];
      }
    })
    .add('copy#set (10 elements)', () => {
      savedNewArray.set(SMALL_ARRAY);
    })
    .add('check type#instanceof Float32Array', () => {
      return SMALL_ARRAY instanceof Float32Array;
    })
    .add('check type#ArrayBuffer.isView', () => {
      return ArrayBuffer.isView(SMALL_ARRAY);
    });
}
