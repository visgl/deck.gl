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
import {log} from '@deck.gl/core';
import GL from '@luma.gl/constants';

export default function gpuTransform(gpuTable, mappings) {
  // TODO: For now hardcoding everything for position
  const longitudeBuffer = gpuTable.buffers.longitude;
  const latitudeBuffer = gpuTable.buffers.latitude;

  const byteLength = longitudeBuffer.byteLength * 3;
  const positionAccessor = Accessor.resolve({size: 3, type: GL.FLOAT});
  const positionBuffer = new Buffer(gpuTable.gl, {byteLength, accessor: positionAccessor});
  const targetAccessors = {position: positionAccessor};

  const {inject, varyings} = getShaderOptions(gpuTable, mappings, targetAccessors);
  const transform = new Transform(gpuTable.gl, {
    sourceBuffers: {
      longitude: longitudeBuffer,
      latitude: latitudeBuffer
    },
    feedbackBuffers: {
      position: positionBuffer
    },
    varyings,
    inject,
    elementCount: longitudeBuffer.getElementCount(),
    vs: 'void main() {}'
  });
  transform.run();
  transform.delete();
  gpuTable.addColumns({position: {buffer: positionBuffer, accessor: positionAccessor}});
  return gpuTable;
}

function getShaderOptions(gpuTable, mappings, targetAccessors) {
  let columns = [];
  let glslCode = '';
  let declarations = '';
  const varyings = [];

  for (const target in mappings) {
    if (mappings[target].sourceColumns) {
      columns = columns.concat(mappings[target].sourceColumns);
    }
    glslCode = `${glslCode}${mappings[target].glslCode}\n`;
    const accessor = targetAccessors[target];
    const type = getGLSLTypeFromAccessor(accessor);
    declarations = `${declarations}varying ${type} ${target};\n`;
    varyings.push(target);
  }

  // filter out duplicates
  columns = new Set(columns);
  columns.forEach(column => {
    const accessor = gpuTable.accessors[column];
    const type = getGLSLTypeFromAccessor(accessor);
    declarations = `${declarations}attribute ${type} ${column};\n`;
  });
  return {
    inject: {
      'vs:#decl': declarations,
      'vs:#main-start': glslCode
    },
    varyings
  };
}

// TODO
// Utility methods that can be moved to some global scope
// or just any existing luma.gl shadertools methods

function getGLSLTypeFromAccessor(accessor) {
  switch (accessor.type) {
    case GL.FLOAT:
      switch (accessor.size) {
        case 1:
          return 'float';
        case 2:
          return 'vec2';
        case 3:
          return 'vec3';
        case 4:
          return 'vec4';
        default:
          // invalid size
          log.assert(false);
          break;
      }
      break;
    default:
      // TODO: add other cases
      log.assert(false);
      break;
  }
  return null;
}
