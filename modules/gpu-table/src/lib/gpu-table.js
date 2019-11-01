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

import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';
import {log} from '@deck.gl/core';

/* eslint-disable guard-for-in */
import GPUColumn from './columns/gpu-column';
// import log from '../utils/log';

export default class GPUTable {
  constructor(gl, options = {}) {
    const {id = 'gpu-table', stats} = options;
    this.id = id;
    this.gl = gl;

    this.schema = {};
    this.columns = {};
    this.buffers = {};

    this.accessors = {};
    this.instancedAccessors = {};

    this.attributes = {};
    this.instancedAttributes = {};

    this.needsRedraw = true;

    this.userData = {};
    this.stats = stats;

    this.MAX_TEXTURE_SIZE = gl.getParameter(GL.MAX_TEXTURE_SIZE);

    if ('columns' in options) {
      this.addColumns(options.columns);
    }

    // Prevent later addition of new members
    Object.seal(this);
  }

  finalize() {
    for (const columnName in this.columns) {
      this.columns[columnName].finalize();
    }
  }

  // Returns the redraw flag, optionally clearing it.
  // Redraw flag will be set if any attributes attributes changed since
  // flag was last cleared.
  //
  // @param {String} [clearRedrawFlags=false] - whether to clear the flag
  // @return {false|String} - reason a redraw is needed.
  getNeedsRedraw(options = {clearRedrawFlags: false}) {
    const redraw = this.needsRedraw;
    this.needsRedraw = this.needsRedraw && !options.clearRedrawFlags;
    return redraw && this.id;
  }

  /**
   * Returns all attribute descriptors with divisor: 0
   * Note: Format matches luma.gl Model/Program.setAttributes()
   * @return {Object} attributes - descriptors
   */
  getAttributes() {
    return this.attributes;
  }

  // Returns all attribute descriptors with divisor: 0
  getInstancedAttributes() {
    return this.instancedAttributes;
  }

  // Sets the redraw flag.
  // @param {Boolean} redraw=true
  // @return {AttributeManager} - for chaining
  setNeedsRedraw(redraw = true) {
    this.needsRedraw = true;
    return this;
  }

  // Takes an object where key is the name of the colum and value is an object {data, type, size, ..}
  addColumns(columns) {
    for (const name in columns) {
      this._addColumn(name, columns[name]);
    }
    return this;
  }

  // Remove all columns except the selected ones (cf. Arrow `Table.select()`)
  // - columnNames: String[]
  selectColumns(columnNames) {
    for (const name of columnNames) {
      if (!(name in this.columns)) {
        this.columns[name].delete();
        delete this.columns[name];
      }
    }
    this._rebuildAccessors();
    this.setNeedsRedraw();
    return this;
  }

  // accepts an array of column names to be deleted
  // - columnNames: String[]
  removeColumns(columnNames) {
    for (const name of columnNames) {
      if (name in this.columns) {
        this.columns[name].delete();
        delete this.columns[name];
      }
    }
    this._rebuildAccessors();
    this.setNeedsRedraw();
    return this;
  }

  /*
  // Adds attributes
  addFixedSizeColumn(column) {
    this._add(attributes, updaters, {instanced: 1});
    this.setNeedsRedraw();

    if (updaters) {
      // log.warn('AttributeManager.add({updaters}) - updater map no longer supported')();
    }

    const newAttributes = {};

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];

      // Initialize the attribute descriptor, with WebGL and metadata fields
      const newAttribute = this._createAttribute(attributeName, attribute, {});

      newAttributes[attributeName] = newAttribute;
    }

    Object.assign(this.attributes, newAttributes);

    this._mapUpdateTriggersToAttributes();
    return this;
  }

  //
  addVariableSizeColumn() {
    // TBD
    this.setNeedsRedraw();
    return this;
  }

  // Table/Batch Support

  setTable() {}

  addRecordBatch(recordBatch) {
    throw new Error('not implemented');
  }
  */

  // PRIVATE METHODS

  _addColumn(name, column) {
    // Ensure not already present
    log.assert(!this.columns[name] && !this.buffers[name]);
    const gpuColumn = new GPUColumn(this.gl, name, column);
    this.columns[name] = gpuColumn;
    this.buffers[name] = gpuColumn.buffer;
  }

  // Makes sure that the buffer can be evenly divided by a power of two
  // that is no bigger than GPUTable.MAX_TEXTURE_SIZE
  _padBufferLength(bytes) {
    // TODO - could generate smaller paddings for buffers that are not huge
    bytes = Math.ceil(bytes / GPUTable.MAX_TEXTURE_SIZE) * GPUTable.MAX_TEXTURE_SIZE;
  }

  _rebuildAccessors() {
    this.accessors = {};
    this.instancedAccessors = {};

    // Copy accessors from each column into table's accessor maps
    for (const column of this.columns) {
      const accessors = this.column.accessors;
      // accessors are prefixed by column name, should be no need to check for collisions
      Object.assign(this.accessors, accessors);
      Object.assign(this.instancedAccessors, accessors);
    }

    // Set divisor: 1 on the instanced accessors
    for (const accessorName in this.instancedAccessors) {
      this.instancedAccessors[accessorName].divisor = 1;
    }
  }
}
