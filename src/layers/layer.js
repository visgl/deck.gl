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
import flatWorld from '../flat-world';
import ViewportMercator from 'viewport-mercator-project';
import log from '../log';

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
  opacity: 0.8,
  numInstances: undefined,
  attributes: {},
  data: [],
  isPickable: false,
  deepCompare: false,
  getValue: x => x,
  onHover: () => {},
  onClick: () => {}
};

const ATTRIBUTES = {
  pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

let counter = 0;

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

    this.checkProp(props.data, 'data');
    this.checkProp(props.id, 'id');
    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');

    this.checkProp(props.width, 'width');
    this.checkProp(props.height, 'height');
    this.checkProp(props.latitude, 'latitude');
    this.checkProp(props.longitude, 'longitude');
    this.checkProp(props.zoom, 'zoom');

    this.props = props;
    this.count = counter++;
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
      // numInstances: this.getNumInstances(this.props),
      self: this,
      dataChanged: true,
      superWasCalled: true
    });

    this.setViewport();

    const {attributes} = this.state;
    // All instanced layers get pickingColors attribute by default
    attributes.addInstanced(ATTRIBUTES, {
      pickingColors: {update: this.calculatePickingColors, when: 'realloc'}
    });
  }

  // gl context is now available
  didMount() {
  }

  shouldUpdate(oldProps, newProps) {
    // If any props have changed
    if (!areEqualShallow(newProps, oldProps)) {
      return true;
    }
    if (newProps.deepCompare && !isDeepEqual(newProps.data, oldProps.data)) {
      // Support optional deep compare of data
      // Note: this is quite inefficient, app should use buffer props instead
      this.setState({dataChanged: true});
      return true;
    }
    return false;
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
    let needsRedraw = attributes.getNeedsRedraw({clearFlag});
    needsRedraw = needsRedraw || this.needsRedraw;
    if (clearFlag) {
      this.needsRedraw = false;
    }
    return needsRedraw;
  }

  // Updates selected state members and marks the object for redraw
  setState(updateObject) {
    Object.assign(this.state, updateObject);
    this.state.needsRedraw = true;
  }

  // Updates selected state members and marks the object for redraw
  setUniforms(uniformMap) {
    this._checkUniforms(uniformMap);
    Object.assign(this.state.uniforms, uniformMap);
    this.state.needsRedraw = true;
  }

  // TODO - Move into luma.gl, and check against definitions
  _checkUniforms(uniformMap) {
    for (const key in uniformMap) {
      const value = uniformMap[key];
      this._checkUniformValue(key, value);
    }
  }

  _checkUniformValue(uniform, value) {
    function isNumber(v) {
      return !isNaN(v) && Number(v) === v && v !== undefined;
    }

    let ok = true;
    if (Array.isArray(value) || value instanceof Float32Array) {
      for (const element of value) {
        if (!isNumber(element)) {
          ok = false;
        }
      }
    } else if (!isNumber(value)) {
      ok = false;
    }
    if (!ok) {
      /* eslint-disable no-console */
      /* global console */
      // Value could be unprintable so write the object on console
      console.error(`${this.props.id} Bad uniform ${uniform}`, value);
      /* eslint-enable no-console */
      throw new Error(`${this.props.id} Bad uniform ${uniform}`);
    }
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
  getNumInstances(props) {
    props = props || this.props;

    // First check if the layer has set its own value
    if (this.state && this.state.numInstances !== undefined) {
      return this.state.numInstances;
    }

    // Check if app has set an explicit value
    if (props.numInstances) {
      return props.numInstances;
    }

    const {data} = props;

    // Check if ES6 collection "size" attribute is set
    if (data && typeof data.count === 'function') {
      return data.count();
    }

    // Check if ES6 collection "size" attribute is set
    if (data && data.size) {
      return data.size;
    }

    // Check if array length attribute is set on data
    // Note: checking this last since some ES6 collections (Immutable)
    // emit profuse warnings when trying to access .length
    if (data && data.length) {
      return data.length;
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

  // Internal Helpers

  checkProps(oldProps, newProps) {
    // Note: dataChanged might already be set
    if (newProps.data !== oldProps.data) {
      // Figure out data length
      this.state.dataChanged = true;
    }

    const viewportChanged =
      newProps.width !== oldProps.width ||
      newProps.height !== oldProps.height ||
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom;

    this.setState({viewportChanged});
  }

  updateAttributes(props) {
    const {attributes} = this.state;
    const numInstances = this.getNumInstances(props);

    // Figure out data length
    attributes.update({
      numInstances,
      bufferMap: props,
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
    this.updateAttributes(this.props);
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
      if (this.state.viewportChanged) {
        this.setViewport();
      }

      // Let the subclass mark what is needed for update
      this.willReceiveProps(oldProps, newProps);
      // Run the attribute updaters
      this.updateAttributes(newProps);
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

  calculatePickingColors(attribute, numInstances) {
    const {value, size} = attribute;
    for (let i = 0; i < numInstances; i++) {
      value[i * size + 0] = (i + 1) % 256;
      value[i * size + 1] = Math.floor((i + 1) / 256) % 256;
      value[i * size + 2] = Math.floor((i + 1) / 256 / 256) % 256;
    }
  }

  decodePickingColor(color) {
    assert(color instanceof Uint8Array);
    const [i1, i2, i3] = color;
    const index = i1 + i2 * 256 + i3 * 65536;
    return index;
  }

  onHover(info) {
    const {color} = info;
    const index = this.decodePickingColor(color);
    return this.props.onHover({index, ...info});
  }

  onClick(info) {
    const {color} = info;
    const index = this.decodePickingColor(color);
    return this.props.onClick({index, ...info});
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
  }

  // Should this be moved to program
  _getRenderFunction(gl) {
    // "Capture" state as it will be set to null when layer is disposed
    const {state} = this;
    const {primitive} = state;
    const {self} = state;
    const drawType = primitive.drawType ?
      gl.get(primitive.drawType) : gl.POINTS;

    const numIndices = primitive.indices ? primitive.indices.length : 0;
    const numVertices = primitive.vertices ? primitive.vertices.length : 0;

    if (primitive.instanced) {
      const extension = gl.getExtension('ANGLE_instanced_arrays');

      if (primitive.indices) {
        return () => extension.drawElementsInstancedANGLE(
          drawType, numIndices, gl.UNSIGNED_SHORT, 0, self.getNumInstances()
        );
      }
      // else if this.primitive does not have indices
      return () => extension.drawArraysInstancedANGLE(
        drawType, 0, numVertices / 3, self.getNumInstances()
      );
    }

    if (this.state.primitive.indices) {
      return () => gl.drawElements(drawType, numIndices, gl.UNSIGNED_SHORT, 0);
    }
    // else if this.primitive does not have indices
    return () => gl.drawArrays(drawType, 0, self.getNumInstances());
  }

  checkProp(property, propertyName) {
    if (!property) {
      throw new Error(`Property ${propertyName} undefined in layer ${this.id}`);
    }
  }

  // MAP LAYER FUNCTIONALITY

  setViewport() {
    const {width, height, latitude, longitude, zoom} = this.props;
    this.setState({
      viewport: new flatWorld.Viewport(width, height),
      mercator: ViewportMercator({
        width, height, latitude, longitude, zoom,
        tileSize: 512
      })
    });
    const {x, y} = this.state.viewport;
    this.setUniforms({
      viewport: [x, y, width, height],
      mapViewport: [longitude, latitude, zoom, flatWorld.size]
    });
    log(3, this.state.viewport, latitude, longitude, zoom);
  }

  // TODO deprecate: this funtion is only used for calculating radius now
  project(latLng) {
    const {mercator} = this.state;
    const [x, y] = mercator.project([latLng[0], latLng[1]]);
    return {x, y};
  }

  // TODO deprecate: this funtion is only used for calculating radius now
  screenToSpace(x, y) {
    const {viewport} = this.state;
    return viewport.screenToSpace(x, y);
  }

}
