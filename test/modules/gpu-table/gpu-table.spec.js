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

import {isWebGL2} from '@luma.gl/core';
import {gl} from '@deck.gl/test-utils';

test('GPUTable#imports', t => {
  t.equals(typeof GPUTable, 'function', 'GPUTable import successful');
  t.end();
});

test('GPUTable#addColumns', t => {
  const LONGITUDES = [1.0, 2.0, 3.0];
  const LATITUDES = [11.0, 12.0, 13.0];
  const RADIUS = [10, 20, 30];
  const gpuTable = new GPUTable(gl, {
    columns: {
      longitude: {data: new Float32Array(LONGITUDES)},
      latitude: {data: new Float32Array(LATITUDES)}
    }
  });
  gpuTable.addColumns({
    radius: {data: new Float32Array(RADIUS)}
  });

  t.ok(gpuTable.buffers.longitude, 'should create longitude Buffer');
  t.ok(gpuTable.buffers.latitude, 'should create latitude Buffer');
  t.ok(gpuTable.buffers.radius, 'should create radius Buffer');
  t.ok(gpuTable.accessors.longitude, 'should create longitude Accessor');
  t.ok(gpuTable.accessors.latitude, 'should create latitude Accessor');
  t.ok(gpuTable.accessors.radius, 'should create radius Accessor');

  // Buffer.getData() is WebGL2 only
  if (isWebGL2(gl)) {
    t.deepEqual(
      gpuTable.buffers.longitude.getData(),
      LONGITUDES,
      'should setup correct data for longitude Buffer'
    );
    t.deepEqual(
      gpuTable.buffers.latitude.getData(),
      LATITUDES,
      'should setup correct data for longitude Buffer'
    );
    t.deepEqual(
      gpuTable.buffers.radius.getData(),
      RADIUS,
      'should setup correct data for longitude Buffer'
    );
  }
  t.end();
});

test('GPUTable#removeColumns', t => {
  const LONGITUDES = [1.0, 2.0, 3.0];
  const LATITUDES = [11.0, 12.0, 13.0];
  const RADIUS = [10, 20, 30];
  const gpuTable = new GPUTable(gl, {
    columns: {
      longitude: {data: new Float32Array(LONGITUDES)},
      latitude: {data: new Float32Array(LATITUDES)}
    }
  });
  gpuTable.addColumns({
    radius: {data: new Float32Array(RADIUS)}
  });

  gpuTable.removeColumns(['longitude', 'radius']);

  t.notOk(gpuTable.buffers.longitude, 'should have deleted longitude Buffer');
  t.ok(gpuTable.buffers.latitude, "shouldn't delete latitude Buffer");
  t.notOk(gpuTable.buffers.radius, 'should have deleted radius Buffer');

  gpuTable.removeColumns('latitude');
  t.notOk(gpuTable.buffers.latitude, 'should have deleted latitude Buffer');

  t.end();
});
