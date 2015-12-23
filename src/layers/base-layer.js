// Copyright (c) 2015 Uber Technologies, Inc.
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

export default class BaseLayer {
  /**
   * @classdesc
   * BaseLayer
   *
   * @class
   * @param {object} opts
   * @param {string} opts.id - layer name
   * @param {array}  opts.data - array of data instances
   * @param {number} opts.width - viewport width, synced with MapboxGL
   * @param {number} opts.height - viewport width, synced with MapboxGL
   * @param {number} opts.layerIndex - for colorPicksing scene generation
   * @param {bool} opts.isPickable - whether layer response to mouse event
   *
   * @param {function} opts.onObjectHovered(index, e) - popup selected index
   * @param {function} opts.onObjectClicked(index, e) - popup selected index
   */
  constructor(opts) {
    this.id = opts.id || this._throwUndefinedError('id');
    this.data = opts.data || this._throwUndefinedError('data');
    this.width = opts.width || this._throwUndefinedError('width');
    this.height = opts.height || this._throwUndefinedError('height');
    this.layerIndex = opts.layerIndex || 0;

    this.opacity = opts.opacity || 0.8;
    this.isPickable = opts.isPickable || false;
    this.numInstances = this.data.length || 1e5;

    this.onObjectHovered = () => {};
    this.onObjectClicked = () => {};

    this._positionNeedUpdate = true;
  }

  getLayerProps() {
    return {
      layerId: this.id,
      program: this._getPrograms(),
      primitive: this._getPrimitive(),
      uniforms: this._getUniforms(),
      attributes: this._getAttributes(),
      options: this._getOptions()
    };
  }

  /* ------------------------------------------------------------------ */
  /* override the following functions and fill in layer specific logics */

  update(deep) {
    this._throwNotImplementedError('update');
  }

  _getPrograms() {
    this._throwNotImplementedError('_getPrograms');
  }

  _getPrimitive() {
    this._throwNotImplementedError('_getPrimitive');
  }

  _getUniforms() {
    this._throwNotImplementedError('_getUniforms');
  }

  _getAttributes() {
    this._throwNotImplementedError('_getAttributes');
  }

  _getOptions() {
    this._throwNotImplementedError('_getOptions');
  }

  /* override the above functions and fill in layer specific logics */
  /* -------------------------------------------------------------- */

  _throwUndefinedError(property) {
    throw new Error(property + ' is undefined in layer: ' + this.id);
  }

  _throwNotImplementedError(funcName) {
    throw new Error(funcName + ' is not implemented in layer: ' + this.id);
  }

}
