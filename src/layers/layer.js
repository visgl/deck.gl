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

/* eslint-disable guard-for-in */
import {Model} from 'luma.gl';
import {areEqualShallow} from '../util';
import assert from 'assert';

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {number} props.width - viewport width, synced with MapboxGL
 * @param {number} props.height - viewport width, synced with MapboxGL
 * @param {number} props.layerIndex - for colorPicking scene generation
 * @param {bool} props.isPickable - whether layer response to mouse event
 * @param {bool} props.opacity - opacity of the layer
 */
const DEFAULT_PROPS = {
  key: 0,
  layerIndex: 0,
  opacity: 1
};

const ATTRIBUTES = {
  pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

let count = 0;

export default class Layer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /**
   * @classdesc
   * Base Layer class
   *
   * @class
   * @param {object} props - See docs above
   */
  /* eslint-disable max-statements */
  constructor(props) {

    props = {
      ...DEFAULT_PROPS,
      ...props
    };

    this.checkParam(props.id);
    this.checkParam(props.width);
    this.checkParam(props.height);

    this.props = props;
    this.count = count++;
  }
  /* eslint-enable max-statements */

  // //////////////////////////////////////////////////
  // LIFECYCLE METHODS, overridden by the layer subclasses

  // Called once to set up the initial state
  initializeState() {
    this.setState({
      model: null,
      uniforms: {},
      attributes: {},
      needsRedraw: true,
      superWasCalled: true
    });
  }

  // gl context is now available
  didMount() {
  }

  shouldUpdate(newProps) {
    const oldProps = this.props;
    return !areEqualShallow(newProps, oldProps);
  }

  // Default implementation, all attributes will be updated
  willReceiveProps(newProps) {
    const {attributes} = this.state;
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      attribute.needsUpdate = true;
    }
  }

  // gl context still available
  willUnmount() {
  }

  // END LIFECYCLE METHODS
  // //////////////////////////////////////////////////

  // Public API

  // Updates selected state members and marks the object for redraw
  setState(updateObject) {
    Object.assign(this.state, updateObject);
    this.state.needsRedraw = true;
  }

  // Updates selected state members and marks the object for redraw
  setUniforms(updateObject) {
    Object.assign(this.state.uniforms, updateObject);
    this.state.needsRedraw = true;
  }

  // Marks an attribute for update
  setAttributeNeedsUpdate(attributeName) {
    const {attributes} = this.state;
    const attribute = attributes[attributeName];
    assert(attribute);
    attribute.needsUpdate = true;
    this.state.needsUpdate = true;
    this.state.needsRedraw = true;
  }

  // Internal Helpers

  checkProps(oldProps, newProps) {
  }

  updateAttributes() {
    // Override by instancedLayer
  }

  updateUniforms() {
    this.setUniforms({
      // apply gamma to opacity to make it visually "linear"
      opacity: Math.pow(this.props.opacity || 0.8, 1 / 2.2)
    });
  }

  // LAYER MANAGER API

  // Called by layer manager when a new layer is found
  initializeLayer({gl}) {
    assert(gl);
    this.state = {gl};

    // Initialize state only once
    // Note: Must always call super.initializeState() when overriding!
    this.state.superWasCalled = false;
    this.initializeState();
    assert(this.state.superWasCalled,
      'Layer must call super.initializeState()');

    // Add any primitive attributes
    this._initializePrimitiveAttributes();

    // Add any subclass attributes
    this.updateAttributes();
    this.updateUniforms();

    // Create a model for the layer
    this._createModel({gl});

    // Call life cycle method
    this.didMount();
  }

  // Called by layer manager when existing layer is getting new props
  updateLayer(oldProps, newProps) {
    // Calculate standard change flags
    this.checkProps(oldProps, newProps);

    // Check if any props have changed
    if (this.shouldUpdate(oldProps, newProps)) {
      // Let the subclass mark what is needed for update
      this.willReceiveProps(oldProps, newProps);
      // Run the attribute updaters
      this.updateAttributes();
      // Update the uniforms
      this.updateUniforms();
    }

    this.state.dataChanged = false;
    this.state.viewportChanged = false;
  }

  // Called by manager when layer is about to be disposed
  // Note: not guaranteed to be called on application shutdown
  finalizeLayer() {
    this.willUnmount();
  }

  // INTERNAL METHODS

  _initializePrimitiveAttributes() {
    const {gl, primitive, attributes} = this.state;
    const {vertices, normals, indices} = primitive;

    // Set up attributes relating to the primitive itself (not the instances)
    if (vertices) {
      attributes.vertices = {value: vertices, size: 3};
    }

    if (normals) {
      attributes.normals = {value: normals, size: 3};
    }

    if (indices) {
      attributes.indices = {
        value: indices,
        size: 1,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        drawType: gl.STATIC_DRAW
      };
    }
  }

  _createModel({gl}) {
    const {program, attributes, uniforms} = this.state;

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
    const {primitive} = this.state;
    const drawType = primitive.drawType ?
      gl.get(primitive.drawType) : gl.POINTS;

    const numIndices = primitive.indices ? primitive.indices.length : 0;

    // "Capture" state as it will be set to null when layer is disposed
    const {state} = this;

    if (this.state.primitive.indices) {
      return () => gl.drawElements(drawType, numIndices, gl.UNSIGNED_SHORT, 0);
    }
    // else if this.primitive does not have indices
    return () => gl.drawArrays(drawType, 0, state.numInstances);
  }

  checkParam(property, propertyName) {
    if (!property) {
      throw new Error(`${propertyName} is undefined in layer: ${this.id}`);
    }
  }

}
