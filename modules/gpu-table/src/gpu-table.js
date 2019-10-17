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

import {Buffer, _Accessor as Accessor} from '@luma.gl/core';
import {log} from '@deck.gl/core';

export default class GPUTable {
  constructor(gl, opts) {
    this.gl = gl;
    this.accessors = {};
    this.buffers = {};
    if ('columns' in opts) {
      this.addColumns(opts.columns);
    }
  }

  // Takes an object where key is the name of the colum and value is an object {data, type, size, ..}
  addColumns(columns) {
    for (const name in columns) {
      log.assert(!this.buffers[name]);
      const {accessor, buffer, data} = columns[name];
      log.assert(buffer || data);
      this.accessors[name] = accessor || Accessor.resolve(columns[name]);
      this.buffers[name] = buffer || new Buffer(this.gl, {
        data: columns[name].data,
        accessor: this.accessors[name]
      });
    }
  }

  // takes one ora array of column names to be deleted
  removeColumns(name) {
    const names = Array.isArray(name) ? name : [name];
    for (const n of names) {
      if (n in this.buffers) {
        this.buffers[n].delete();
        delete this.buffers[n];
        delete this.accessors[n];
      }
    }
  }
}
