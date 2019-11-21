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
import {createIterable} from './iterable-utils';
import defaultTypedArrayManager from './typed-array-manager';

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
    const {data, getGeometry, positionFormat, dataChanged, normalize = true} = this.opts;

    this.data = data;
    this.getGeometry = getGeometry;
    this.positionSize = positionFormat === 'XY' ? 2 : 3;
    this.normalize = normalize;

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

  // Update the positions of a single geometry
  updateGeometryAttributes(geometry, startIndex, size) {
    throw new Error('Not implemented');
  }

  // Returns the number of vertices in a geometry
  getGeometrySize(geometry) {
    throw new Error('Not implemented');
  }

  /* Private utility methods */
  _allocate(instanceCount, copy) {
    // allocate attributes
    const {attributes, _attributeDefs, typedArrayManager} = this;
    for (const name in _attributeDefs) {
      const def = _attributeDefs[name];
      // If dataRange is supplied, this is a partial update.
      // In case we need to reallocate the typed array, it will need the old values copied
      // before performing partial update.
      def.copy = copy;

      attributes[name] = typedArrayManager.allocate(attributes[name], instanceCount, def);
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

    let {indexStarts, vertexStarts} = this;

    if (!dataRange) {
      // Full update - regenerate buffer layout from scratch
      indexStarts = [0];
      vertexStarts = [0];
    }

    const {startRow = 0, endRow = Infinity} = dataRange || {};
    this._forEachGeometry(
      (geometry, dataIndex) => {
        vertexStarts[dataIndex + 1] = vertexStarts[dataIndex] + this.getGeometrySize(geometry);
      },
      startRow,
      endRow
    );

    // count instances
    const instanceCount = vertexStarts[vertexStarts.length - 1];

    // allocate attributes
    this._allocate(instanceCount, Boolean(dataRange));

    this.indexStarts = indexStarts;
    this.vertexStarts = vertexStarts;
    this.instanceCount = instanceCount;

    const context = {};

    this._forEachGeometry(
      (geometry, dataIndex) => {
        context.vertexStart = vertexStarts[dataIndex];
        context.indexStart = indexStarts[dataIndex];
        context.geometrySize = vertexStarts[dataIndex + 1] - vertexStarts[dataIndex];
        context.geometryIndex = dataIndex;
        this.updateGeometryAttributes(geometry, context);
      },
      startRow,
      endRow
    );

    this.vertexCount = indexStarts[indexStarts.length - 1];
  }
}
