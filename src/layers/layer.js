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
import Attributes from '../attributes';
import {Model} from 'luma.gl';
import {areEqualShallow} from '../util';
import {addIterator} from '../util';
import isDeepEqual from 'lodash.isequal';
import assert from 'assert';

/*
 * @param {string} props.id - layer name
 * @param {array}  props.data - array of data instances
 * @param {number} props.width - viewport width, synced with MapboxGL
 * @param {number} props.height - viewport width, synced with MapboxGL
 * @param {bool} props.isPickable - whether layer response to mouse event
 * @param {bool} props.opacity - opacity of the layer
 */
const DEFAULT_PROPS = {
  key: 0,
  opacity: 1,
  numInstances: undefined,
  attributes: {},
  data: [],
  isPickable: false,
  deepCompare: false,
  getValue: x => x,
  onObjectHovered: () => {},
  onObjectClicked: () => {}
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

    // Add iterator to objects
    // TODO - Modifying props is an anti-pattern
    if (props.data) {
      addIterator(props.data);
      assert(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.checkParam(props.data || props.buffers);
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
      attributes: new Attributes({id: this.props.id}),
      model: null,
      uniforms: {},
      needsRedraw: true,
      // numInstances: 0,
      dataChanged: true,
      superWasCalled: true
    });

    const {attributes} = this.state;
    // All instanced layers get pickingColors attribute by default
    attributes.addInstanced(ATTRIBUTES, {
      pickingColors: {update: this.calculatePickingColors, when: 'realloc'}
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
    attributes.invalidateAll();
  }

  // gl context still available
  willUnmount() {
  }

  // END LIFECYCLE METHODS
  // //////////////////////////////////////////////////

  // Public API

  getNeedsRedraw({clearFlag}) {
    const {attributes} = this.state;
    return attributes.getNeedsRedraw({clearFlag});
  }

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

  // Use iteration (the only required capability on data) to get first element
  getFirstObject() {
    const {data} = this.props;
    for (const object of data) {
      return object;
    }
    return null;
  }

  // INTERNAL METHODS

  // Deduces numer of instances. Intention is to support:
  // - Explicit setting of numInstances
  // - Auto-deduction for ES6 containers that define a size member
  // - Auto-deduction for Classic Arrays via the built-in length attribute
  // - Auto-deduction via arrays
  // - Auto-deduction via iteration
  getNumInstances() {
    // First check if the layer has set its own value
    if (this.state && this.state.numInstances !== undefined) {
      return this.state.numInstances;
    }

    // Check if app has set an explicit value
    if (this.props.numInstances) {
      return this.props.numInstances;
    }

    const {data} = this.props;

    // Check if array length attribute is set on data
    if (data && data.length !== undefined) {
      return data.length;
    }

    // Check if ES6 collection "size" attribute is set
    if (data && data.size !== undefined) {
      return data.size;
    }

    // TODO - slow, we probably should not support this unless
    // we limit the number of invocations
    //
    // Use iteration to count objects
    // let count = 0;
    // /* eslint-disable no-unused-vars */
    // for (const object of data) {
    //   count++;
    // }
    // return count;

    throw new Error('Could not deduce numInstances');
  }

  calculatePickingColors(attribute, numInstances) {
    const {value, size} = attribute;
    for (let i = 0; i < numInstances; i++) {
      value[i * size + 0] = (i + 1) % 256;
      value[i * size + 1] = Math.floor((i + 1) / 256) % 256;
      value[i * size + 2] = this.layerIndex;
    }
  }

  // Internal Helpers

  checkProps(oldProps, newProps) {
    // Figure out data length
    const numInstances = this.getNumInstances(newProps);
    if (numInstances !== this.state.numInstances) {
      this.state.dataChanged = true;
    }
    this.setState({
      numInstances
    });

    // Setup update flags, used to prevent unnecessary calculations
    // TODO non-instanced layer cannot use .data.length for equal check
    if (newProps.deepCompare) {
      this.state.dataChanged = !isDeepEqual(newProps.data, oldProps.data);
    } else {
      this.state.dataChanged = newProps.data.length !== oldProps.data.length;
    }
  }

  updateAttributes() {
    const {attributes} = this.state;
    const numInstances = this.getNumInstances(this.props);

    // Figure out data length
    attributes.update({
      numInstances,
      bufferMap: this.props,
      context: this,
      // Don't worry about non-attribute props
      ignoreUnknownAttributes: true
    });
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

    // TODO - the app must be able to override

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

  // Set up attributes relating to the primitive itself (not the instances)
  _initializePrimitiveAttributes() {
    const {gl, primitive, attributes} = this.state;
    const {vertices, normals, indices} = primitive;

    const xyz = {'0': 'x', '1': 'y', '2': 'z'};

    if (vertices) {
      attributes.add(
        {vertices: {value: vertices, size: 3, ...xyz}
      });
    }

    if (normals) {
      attributes.add({
        normals: {value: normals, size: 3, ...xyz}
      });
    }

    if (indices) {
      attributes.add({
        indices: {
          value: indices,
          size: 1,
          bufferType: gl.ELEMENT_ARRAY_BUFFER,
          drawType: gl.STATIC_DRAW,
          '0': 'index'
        }
      });
    }
  }

  _createModel({gl}) {
    const {program, attributes, uniforms} = this.state;

    this.state.model = new Model({
      program: program,
      attributes: attributes.getAttributes(),
      uniforms: uniforms,
      // whether current layer responses to mouse events
      pickable: this.props.isPickable,
      // get render function per primitive (instanced? indexed?)
      render: this._getRenderFunction(gl)
    });

    // TODO - why is this needed? Remove or comment...
    this.state.model.layer = this;
  }

  // Should this be moved to program
  _getRenderFunction(gl) {
    // "Capture" state as it will be set to null when layer is disposed
    const {state} = this;
    const {primitive} = state;
    const drawType = primitive.drawType ?
      gl.get(primitive.drawType) : gl.POINTS;

    const numIndices = primitive.indices ? primitive.indices.length : 0;
    const numVertices = primitive.vertices ? primitive.vertices.length : 0;

    if (primitive.instanced) {
      const extension = gl.getExtension('ANGLE_instanced_arrays');

      if (primitive.indices) {
        return () => extension.drawElementsInstancedANGLE(
          drawType, numIndices, gl.UNSIGNED_SHORT, 0, state.numInstances
        );
      }
      // else if this.primitive does not have indices
      return () => extension.drawArraysInstancedANGLE(
        drawType, 0, numVertices / 3, state.numInstances
      );
    }

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
