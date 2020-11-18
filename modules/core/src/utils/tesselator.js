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
import {createIterable, getAccessorFromBuffer} from './iterable-utils';
import defaultTypedArrayManager from './typed-array-manager';
import assert from './assert';

import {Buffer} from '@luma.gl/core';

export default class Tesselator {
  constructor(opts = {}) {
    const {attributes = {}} = opts;

    this.typedArrayManager = defaultTypedArrayManager;
    this.indexStarts = null;
    this.vertexStarts = null;
    this.vertexCount = 0;
    this.instanceCount = 0;
    this.attributes = {};
    this._attributeDefs = attributes;
    this.opts = opts;

    this.updateGeometry(opts);

    Object.seal(this);
  }

  /* Public methods */
  updateGeometry(opts) {
    Object.assign(this.opts, opts);
    const {
      data,
      buffers = {},
      getGeometry,
      geometryBuffer,
      positionFormat,
      dataChanged,
      normalize = true
    } = this.opts;
    this.data = data;
    this.getGeometry = getGeometry;
    this.positionSize =
      (geometryBuffer && geometryBuffer.size) || (positionFormat === 'XY' ? 2 : 3);
    this.buffers = buffers;
    this.normalize = normalize;

    // Handle external logical value
    if (geometryBuffer) {
      assert(data.startIndices, 'binary data missing startIndices');
      this.getGeometry = this.getGeometryFromBuffer(geometryBuffer);

      if (!normalize) {
        // skip packing and set attribute value directly
        // TODO - avoid mutating user-provided object
        buffers.positions = geometryBuffer;
      }
    }
    this.geometryBuffer = buffers.positions;

    if (Array.isArray(dataChanged)) {
      // is partial update
      for (const dataRange of dataChanged) {
        this._rebuildGeometry(dataRange);
      }
    } else {
      this._rebuildGeometry();
    }
  }

  updatePartialGeometry({startRow, endRow}) {
    this._rebuildGeometry({startRow, endRow});
  }

  /* Subclass interface */
  normalizeGeometry(geometry) {
    return geometry;
  }

  // Update the positions of a single geometry
  updateGeometryAttributes(geometry, startIndex, size) {
    throw new Error('Not implemented');
  }

  // Returns the number of vertices in a geometry
  getGeometrySize(geometry) {
    throw new Error('Not implemented');
  }

  getGeometryFromBuffer(geometryBuffer) {
    const value = geometryBuffer.value || geometryBuffer;
    assert(ArrayBuffer.isView(value), 'cannot read geometries');

    return getAccessorFromBuffer(value, {
      size: this.positionSize,
      offset: geometryBuffer.offset,
      stride: geometryBuffer.stride,
      startIndices: this.data.startIndices
    });
  }

  /* Private utility methods */
  _allocate(instanceCount, copy) {
    // allocate attributes
    const {attributes, buffers, _attributeDefs, typedArrayManager} = this;
    for (const name in _attributeDefs) {
      if (name in buffers) {
        // Use external buffer
        typedArrayManager.release(attributes[name]);
        attributes[name] = null;
      } else {
        const def = _attributeDefs[name];
        // If dataRange is supplied, this is a partial update.
        // In case we need to reallocate the typed array, it will need the old values copied
        // before performing partial update.
        def.copy = copy;

        attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
      }
    }
  }

  /**
   * Visit all objects
   * `data` is expected to be an iterable consistent with the base Layer expectation
   */
  _forEachGeometry(visitor, startRow, endRow) {
    const {data, getGeometry} = this;
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;
      const geometry = getGeometry(object, objectInfo);
      visitor(geometry, objectInfo.index);
    }
  }

  /* eslint-disable complexity,max-statements */
  _rebuildGeometry(dataRange) {
    if (!this.data || !this.getGeometry) {
      return;
    }

    let {indexStarts, vertexStarts, instanceCount} = this;
    const {data, geometryBuffer} = this;
    const {startRow = 0, endRow = Infinity} = dataRange || {};

    const normalizedData = {};

    if (!dataRange) {
      // Full update - regenerate buffer layout from scratch
      indexStarts = [0];
      vertexStarts = [0];
    }
    if (this.normalize || !geometryBuffer) {
      this._forEachGeometry(
        (geometry, dataIndex) => {
          geometry = this.normalizeGeometry(geometry);
          normalizedData[dataIndex] = geometry;
          vertexStarts[dataIndex + 1] = vertexStarts[dataIndex] + this.getGeometrySize(geometry);
        },
        startRow,
        endRow
      );
      // count instances
      instanceCount = vertexStarts[vertexStarts.length - 1];
    } else if (geometryBuffer.buffer instanceof Buffer) {
      const byteStride = geometryBuffer.stride || this.positionSize * 4;
      // assume user provided data is already normalized
      vertexStarts = data.startIndices;
      instanceCount = vertexStarts[data.length] || geometryBuffer.buffer.byteLength / byteStride;
    } else {
      const bufferValue = geometryBuffer.value || geometryBuffer;
      const elementStride =
        geometryBuffer.stride / bufferValue.BYTES_PER_ELEMENT || this.positionSize;
      // assume user provided data is already normalized
      vertexStarts = data.startIndices;
      instanceCount = vertexStarts[data.length] || bufferValue.length / elementStride;
    }

    // allocate attributes
    this._allocate(instanceCount, Boolean(dataRange));

    this.indexStarts = indexStarts;
    this.vertexStarts = vertexStarts;
    this.instanceCount = instanceCount;

    const context = {};

    this._forEachGeometry(
      (geometry, dataIndex) => {
        geometry = normalizedData[dataIndex] || geometry;
        context.vertexStart = vertexStarts[dataIndex];
        context.indexStart = indexStarts[dataIndex];
        const vertexEnd =
          dataIndex < vertexStarts.length - 1 ? vertexStarts[dataIndex + 1] : instanceCount;
        context.geometrySize = vertexEnd - vertexStarts[dataIndex];
        context.geometryIndex = dataIndex;
        this.updateGeometryAttributes(geometry, context);
      },
      startRow,
      endRow
    );

    this.vertexCount = indexStarts[indexStarts.length - 1];
  }
}
