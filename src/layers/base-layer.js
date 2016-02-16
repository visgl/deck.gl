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

import {Model} from 'luma.gl';
import isEqual from 'lodash.isequal';

const defaultOpts = {
  layerIndex: 0,
  isPickable: false,
  deepCompare: false,
  onObjectHovered: () => {},
  onObjectClicked: () => {}
};

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
   */
  /* eslint-disable max-statements */
  constructor(opts) {
    this.checkParam(opts.id);
    this.checkParam(opts.data);
    this.checkParam(opts.width);
    this.checkParam(opts.height);

    this.props = {
      ...defaultOpts,
      ...opts
    };
  }
  /* eslint-enable max-statements */

  initializeState() {
    Object.assign(this.state, {
      model: null,
      uniforms: {opacity: this.props.opacity},
      attributes: {},
      numInstances: this.props.data.length || 0,
      dataChanged: true,
      viewportChanged: true,
      needsRedraw: true,
      // apply gamma to opacity to make it visually "linear"
      opacity: Math.pow(this.props.opacity || 0.8, 1 / 2.2)
    });
  }

  updateState(newProps, oldProps, state) {
    // 3. setup update flags, used to prevent unnecessary calculations
    // TODO non-instanced layer cannot use .data.length for equal check
    if (newProps.deepCompare) {
      this.state.dataChanged = !isEqual(newProps.data, oldProps.data);
    } else {
      this.state.dataChanged = newProps.data.length !== oldProps.data.length;
    }

    this.state.viewportChanged =
      newProps.width !== oldProps.width ||
      newProps.height !== oldProps.height ||
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom;

    // 4. update new layer
    layer.updateLayer();

    // update redraw flag
    this.state.needsRedraw = this.state.needsRedraw ||
      this.state.dataChanged ||
      this.state.viewportChanged;
  }

  /* ------------------------------------------------------------------ */
  /* override the following functions and fill in layer specific logic */

  updateLayer() {
    this._throwNotImplementedError('updateLayer');
  }

  updateUniforms() {
    this._throwNotImplementedError('updateUniforms');
  }

  updateAttributes() {
    this._throwNotImplementedError('updateAttributes');
  }

  /* override the above functions and fill in layer specific logic */
  /* -------------------------------------------------------------- */

  createModel({gl}) {
    const {primitive, program, attributes, uniforms} = this.state;

    // Set up attributes relating to the primitive (not the instances)
    /* eslint-disable dot-notation */
    if (primitive.vertices) {
      attributes['vertices'] = {value: primitive.vertices, size: 3};
    }

    if (primitive.normals) {
      attributes['normals'] = {value: primitive.normals, size: 3};
    }

    if (primitive.indices) {
      attributes['indices'] = {
        value: primitive.indices,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        drawType: gl.STATIC_DRAW,
        size: 1
      };
    }
    /* eslint-enable dot-notation */

    this.state.model = new Model({
      program: program,
      attributes: attributes,
      uniforms: uniforms,
      // whether current layer responses to mouse events
      pickable: this.props.isPickable,
      // get render function per primitive (instanced? indexed?)
      render: this._getRenderFunction(gl),

      // update buffer before rendering, -> shader attributes
      onBeforeRender() {
        program.use();
        this.setAttributes(program);
      },

      pick(point) {
        // z is used as layer index
        const [x, y, z] = point;
        const index = x !== 0 || y !== 0 ? x + y * 256 : 0;
        const target = index === 0 ? [-1, -1, -1] : [x, y, z];

        program.use();
        program.setUniform('selected', target);
        program.selectedIndex = index - 1;
        program.selectedLayerIndex = z;
      }
    });
  }

  _getRenderFunction(gl) {
    const drawType = this.state.primitive.drawType ?
      gl.get(this.state.primitive.drawType) :
      gl.POINTS;

    const numIndices = this.state.primitive.indices ?
      this.state.primitive.indices.length :
      0;

    const numVertices = this.state.primitive.vertices ?
      this.state.primitive.vertices.length :
      0;

    if (this.state.primitive.instanced) {
      const extension = gl.getExtension('ANGLE_instanced_arrays');

      if (this.state.primitive.indices) {
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
    if (this.state.primitive.indices) {
      return () => gl.drawElements(drawType, numIndices, gl.UNSIGNED_SHORT, 0);
    }
    // else if this.primitive does not have indices
    return () => gl.drawArrays(drawType, 0, this.state.numInstances);

  }

  _calculatePickingColors() {
    if (!this.isPickable) {
      return;
    }

    this.props.data.forEach((point, i) => {
      this.state.pickingColors[i * 3 + 0] = (i + 1) % 256;
      this.state.pickingColors[i * 3 + 1] = Math.floor((i + 1) / 256) % 256;
      this.state.pickingColors[i * 3 + 2] = this.layerIndex;
    });
  }

  checkParam(property, propertyName) {
    if (!property) {
      throw new Error(`${propertyName} is undefined in layer: ${this.id}`);
    }
  }

  _throwNotImplementedError(funcName) {
    throw new Error(funcName + ' is not implemented in layer: ' + this.id);
  }

}
