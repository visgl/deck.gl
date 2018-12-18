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
import {experimental} from '@deck.gl/core';
const {fillArray} = experimental;

export class TypedArrayManager {
  constructor({overAlloc = 1} = {}) {
    this.overAlloc = overAlloc;
  }

  allocate(Type, size) {
    if (Type === Uint16Array && size > 65535) {
      throw new Error('Vertex count exceeds browser index limit');
    }
    // TODO - check if available in pool
    return new Type(size);
  }

  reallocate(typedArray, newSize, copy = false) {
    if (newSize <= typedArray.length) {
      return typedArray;
    }

    // Allocate at least one element to ensure a valid buffer
    const allocSize = Math.max(Math.ceil(newSize * this.overAlloc), 1);
    const newArray = this.allocate(typedArray.constructor, allocSize);

    if (copy) {
      newArray.set(typedArray);
    }

    this.release(typedArray);
    return newArray;
  }

  release(typedArray) {
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
    this.bufferLayout = null;
    this.instanceCount = 0;
    this.attributes = {};
    this._attributeDefs = attributes;

    this.updateGeometry(opts);

    Object.seal(this);
  }

  /* Public methods */
  updateGeometry({data, getGeometry, fp64}) {
    this.data = data;
    this.getGeometry = getGeometry;
    this.fp64 = fp64;
    this._rebuildGeometry();
  }

  /* Subclass interface */

  // Fill the typed arrays for geometry attributes
  updateGeometryAttributes() {
    throw new Error('Not implemented');
  }

  // Returns the number of vertices in a geometry
  countInstancesInGeometry(geometry) {
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
    const bufferLayout = [];
    let instanceCount = 0;
    this._forEachGeometry((geometry, dataIndex) => {
      const count = this.countInstancesInGeometry(geometry);
      instanceCount += count;
      bufferLayout[dataIndex] = count;
    });

    // allocate attributes
    const {attributes, _attributeDefs, typedArrayManager, fp64} = this;
    for (const name in _attributeDefs) {
      const def = _attributeDefs[name];

      if (!def.fp64 || fp64) {
        attributes[name] = attributes[name]
          ? typedArrayManager.reallocate(attributes[name], def.size * instanceCount)
          : typedArrayManager.allocate(def.type || Float32Array, def.size * instanceCount);
      }
    }

    this.bufferLayout = bufferLayout;
    this.instanceCount = instanceCount;

    this.updateGeometryAttributes();
  }
}
