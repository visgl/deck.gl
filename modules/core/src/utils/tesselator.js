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
import {fillArray} from './flatten';

class TypedArrayManager {
  constructor({overAlloc = 1} = {}) {
    this.overAlloc = overAlloc;
  }

  allocate(typedArray, count, {size, type, copy = false}) {
    const newSize = count * size;
    if (typedArray && newSize <= typedArray.length) {
      return typedArray;
    }

    // Allocate at least one element to ensure a valid buffer
    const allocSize = Math.max(Math.ceil(newSize * this.overAlloc), 1);
    const newArray = this._allocate(type, allocSize);

    if (typedArray && copy) {
      newArray.set(typedArray);
    }

    this._release(typedArray);
    return newArray;
  }

  _allocate(Type = Float32Array, size) {
    if (Type === Uint16Array && size > 65535) {
      throw new Error('Vertex count exceeds browser index limit');
    }
    // TODO - check if available in pool
    return new Type(size);
  }

  _release(typedArray) {
    // TODO - add to pool
    // logFunctions.onUpdate({
    //   level: LOG_DETAIL_PRIORITY,
    //   message: `${attributeName} allocated ${allocCount}`,
    //   id: this.id
    // });
  }
}

export default class Tesselator {
  constructor(opts = {}) {
    const {attributes = {}} = opts;

    this.typedArrayManager = new TypedArrayManager();
    this.indexLayout = null;
    this.bufferLayout = null;
    this.vertexCount = 0;
    this.instanceCount = 0;
    this.attributes = {};
    this._attributeDefs = attributes;

    this.updateGeometry(opts);

    Object.seal(this);
  }

  /* Public methods */
  updateGeometry({data, getGeometry, positionFormat, fp64}) {
    this.data = data;
    this.getGeometry = getGeometry;
    this.fp64 = fp64;
    this.positionSize = positionFormat === 'XY' ? 2 : 3;
    this._rebuildGeometry();
  }

  updatePartialGeometry({start, count, objects}) {
    // TODO
  }

  /* Subclass interface */

  // Update the positions of a single geometry
  updateGeometryAttributes(geometry, startIndex, size) {
    throw new Error('Not implemented');
  }

  // Returns the number of vertices in a geometry
  getGeometrySize(geometry) {
    throw new Error('Not implemented');
  }

  /* Private utility methods */

  /**
   * Visit all objects
   * `data` is expected to be an iterable consistent with the base Layer expectation
   */
  _forEachGeometry(visitor) {
    const {data, getGeometry} = this;
    let dataIndex = 0;
    for (const object of data) {
      const geometry = getGeometry(object);
      visitor(geometry, dataIndex++);
    }
  }

  _updateAttribute({target, size, getValue}) {
    const {data, bufferLayout} = this;

    let i = 0;
    let dataIndex = 0;
    for (const object of data) {
      const value = getValue(object, dataIndex);
      const numVertices = bufferLayout[dataIndex++];

      fillArray({target, source: value, start: i, count: numVertices});
      i += numVertices * size;
    }
    return target;
  }

  _rebuildGeometry() {
    if (!this.data || !this.getGeometry) {
      return;
    }

    // count instances
    const indexLayout = [];
    const bufferLayout = [];
    let instanceCount = 0;
    this._forEachGeometry((geometry, dataIndex) => {
      const count = this.getGeometrySize(geometry);
      instanceCount += count;
      bufferLayout[dataIndex] = count;
    });

    // allocate attributes
    const {attributes, _attributeDefs, typedArrayManager, fp64} = this;
    for (const name in _attributeDefs) {
      const def = _attributeDefs[name];

      // do not create fp64-only attributes unless in fp64 mode
      if (!def.fp64Only || fp64) {
        attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
      }
    }

    this.indexLayout = indexLayout;
    this.bufferLayout = bufferLayout;
    this.instanceCount = instanceCount;

    const context = {
      vertexStart: 0,
      indexStart: 0
    };
    this._forEachGeometry((geometry, dataIndex) => {
      const geometrySize = bufferLayout[dataIndex];
      context.geometryIndex = dataIndex;
      context.geometrySize = geometrySize;
      this.updateGeometryAttributes(geometry, context);
      context.vertexStart += geometrySize;
      context.indexStart += indexLayout[dataIndex] || 0;
    });

    this.vertexCount = context.indexStart;
  }
}
