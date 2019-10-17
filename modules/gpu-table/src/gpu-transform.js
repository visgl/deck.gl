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

// should create a new column based on mapping and gpuTable.
import {Buffer, Transform, _Accessor as Accessor} from '@luma.gl/core';

import GL from '@luma.gl/constants';

export default function gpuTransform(gpuTable, mapping) {
  // For now hardcoding everything for position
  const longitudeBuffer = gpuTable.buffers.longitude;
  const latitudeBuffer = gpuTable.buffers.latitude;

  const byteLength = longitudeBuffer.byteLength * 3;
  const positionAccessor = Accessor.resolve({size: 3, type: GL.FLOAT});
  const positionBuffer = new Buffer(gpuTable.gl, {byteLength, accessor: positionAccessor});

  const transform = new Transform(gpuTable.gl, {
    sourceBuffers: {
      longitude: longitudeBuffer,
      latitude: latitudeBuffer
    },
    feedbackBuffers: {
      position: positionBuffer
    },
    varyings: ['position'],
    elementCount: longitudeBuffer.getElementCount(),
    vs: `
    attribute float longitude;
    attribute float latitude;
    varying vec3 position;

    void main()
    {
      position = vec3(longitude, latitude, 0.);
    }`
  });
  transform.run();
  transform.delete();
  gpuTable.addColumns({position: {buffer: positionBuffer, accessor: positionAccessor}});
  return;
}
