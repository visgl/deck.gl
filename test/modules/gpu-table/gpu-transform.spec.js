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

import test from 'tape-catch';

// import GPUTable from '@deck.gl/gpu-table';
// TODO: fix import path
import GPUTable from '../../../modules/gpu-table/src/gpu-table';
import gpuTransform from '../../../modules/gpu-table/src/gpu-transform';

import {isWebGL2} from '@luma.gl/core';
import {gl} from '@deck.gl/test-utils';

test('gpuTransform#imports', t => {
  t.equals(typeof gpuTransform, 'function', 'GPUTable import successful');
  t.end();
});

test.only('gpuTransform', t => {
  const LONGITUDES = [1.0, 2.0, 3.0];
  const LATITUDES = [11.0, 12.0, 13.0];
  const gpuTable = new GPUTable(gl, {
    columns: {
      longitude: {data: new Float32Array(LONGITUDES)},
      latitude: {data: new Float32Array(LATITUDES)}
    }
  });
  gpuTransform(gpuTable, {/* mapping empty for now */});

  t.ok(gpuTable.buffers.position, 'should create position Buffer');
  t.ok(gpuTable.accessors.position, 'should create position Accessor');

  // Buffer.getData() is WebGL2 only
  if (isWebGL2(gl)) {
    const positions = gpuTable.buffers.position.getData();
    for (let i=0; i<LONGITUDES.length; i++) {
      t.equal(positions[i*3], LONGITUDES[i], `should match longitude at index: ${i}`);
      t.equal(positions[i*3+1], LATITUDES[i], `should match latitude at index: ${i}`);
      t.equal(positions[i*3+2], 0, `should match z at index: ${i}`);
    }
  }
  t.end();
});
