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

import {Model} from 'lumagl';

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
   * @param {number} opts.layerIndex - for colorPicking scene generation
   * @param {bool} opts.isPickable - whether layer response to mouse event
   * @param {bool} opts.opacity - opacity of the layer
   *
   * @param {function} opts.onObjectHovered(index, e) - popup selected index
   * @param {function} opts.onObjectClicked(index, e) - popup selected index
   */
  /* eslint-disable max-statements */
  constructor(opts) {
    this.id = opts.id || this._throwUndefinedError('id');
    this.data = opts.data || this._throwUndefinedError('data');
    this.width = opts.width || this._throwUndefinedError('width');
    this.height = opts.height || this._throwUndefinedError('height');

    this.layerIndex = opts.layerIndex || 0;
    // apply gamma to opacity to make it visually "linear"
    this.opacity = Math.pow(opts.opacity || 0.8, 1 / 2.2);
    this.isPickable = opts.isPickable || false;
    this.deepCompare = opts.deepCompare || false;

    this._model = null;
    this._shader = this.getLayerShader();
    this._primitive = this.getLayerPrimitive();
    this._uniforms = {opacity: this.opacity};
    this._attributes = {};
    this._numInstances = this.data.length || 0;

    this.cache = {};
    this.onObjectHovered = () => {};
    this.onObjectClicked = () => {};

    this.dataChanged = true;
    this.viewportChanged = true;
    this.needsRedraw = true;
  }
  /* eslint-enable max-statements */

  /* ------------------------------------------------------------------ */
  /* override the following functions and fill in layer specific logic */

  updateLayer() {
    this._throwNotImplementedError('updateLayer');
  }

  getLayerShader() {
    this._throwNotImplementedError('getLayerShader');
  }

  getLayerPrimitive() {
    this._throwNotImplementedError('getLayerPrimitive');
  }

  setLayerUniforms() {
    this._throwNotImplementedError('setLayerUniforms');
  }

  setLayerAttributes() {
    this._throwNotImplementedError('setLayerAttributes');
  }

  /* override the above functions and fill in layer specific logic */
  /* -------------------------------------------------------------- */

  getLayerModel(renderer) {
    const program = renderer.programs[this._shader.id];
    const attributes = this._attributes;
    const primitive = this._primitive;
    const gl = renderer.gl;

    if (this._primitive.vertices) {
      this._attributes['vertices'] = {
        value: this._primitive.vertices,
        size: 3
      }
    }

    if (this._primitive.normals) {
      this._attributes['normals'] = {
        value: this._primitive.normals,
        size: 3
      }
    }

    if (this._primitive.indices) {
      this._attributes['indices'] = {
        value: this._primitive.indices,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        drawType: gl.STATIC_DRAW,
        size: 1
      }
    }

    this._model = new Model({
      program: this._shader.id,

      // whether current layer responses to mouse events
      pickable: this.isPickable,

      // update buffer before rendering, -> shader attributes
      onBeforeRender() {
        program.use();
        this.setAttributes(program);
      },

      // get render function per primitive (instanced? indexed?)
      render: this._getRenderFunction(gl),

      pick(point) {
        // z is used as layer index
        const [x, y, z] = point;
        const index = x !== 0 || y !== 0 ? x + y * 256 : 0;
        const target = index === 0 ? [-1, -1, -1] : [x, y, z];

        program.use();
        program.setUniform('selected', target);
        program.selectedIndex = index - 1;
        program.selectedLayerIndex = z;
      },

      uniforms: this._uniforms,
      attributes: this._attributes
    });

    return this._model;
  }

  _getRenderFunction(gl) {
    const drawType = this._primitive.drawType ?
      gl.get(this._primitive.drawType) :
      gl.POINTS;

    const numIndices = this._primitive.indices ?
      this._primitive.indices.length :
      0;

    const numVertices = this._primitive.vertices ?
      this._primitive.vertices.length :
      0;

    if (this._primitive.instanced) {
      const extension = gl.getExtension('ANGLE_instanced_arrays');

      if (this._primitive.indices) {
        return () => {
          extension.drawElementsInstancedANGLE(
            drawType, numIndices, gl.UNSIGNED_SHORT, 0, this._numInstances
          );
        };
      }
      // else if this.primitive does not have indices
      return () => {
        extension.drawArraysInstancedANGLE(
          drawType, 0, numVertices / 3, this._numInstances
        );
      };

    }

    // else if this.primitive is not instanced
    if (this._primitive.indices) {
      return () => {
        gl.drawElements(drawType, numIndices, gl.UNSIGNED_SHORT, 0);
      };
    }
    // else if this.primitive does not have indices
    return () => {
      gl.drawArrays(drawType, 0, this._numInstances);
    };

  }

  _throwUndefinedError(property) {
    throw new Error(property + ' is undefined in layer: ' + this.id);
  }

  _throwNotImplementedError(funcName) {
    throw new Error(funcName + ' is not implemented in layer: ' + this.id);
  }

}
