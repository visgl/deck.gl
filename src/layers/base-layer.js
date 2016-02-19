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
import isEqual from 'lodash.isequal';
import assert from 'assert';
import {addIterator, areEqualShallow} from '../util';

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
  numInstances: undefined,
  attributes: {},
  data: [],
  layerIndex: 0,
  isPickable: false,
  deepCompare: false,
  opacity: 1,
  getValue: x => x,
  onObjectHovered: () => {},
  onObjectClicked: () => {}
};

const ATTRIBUTES = {
  pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

export default class BaseLayer {

  static get attributes() {
    return ATTRIBUTES;
  }

  /**
   * @classdesc
   * BaseLayer
   *
   * @class
   * @param {object} props - See docs above
   */
  /* eslint-disable max-statements */
  constructor(props) {
    this.checkParam(props.id);
    this.checkParam(props.data || props.buffers);
    this.checkParam(props.width);
    this.checkParam(props.height);

    // Add iterator to objects
    if (props.data) {
      addIterator(props.data);
      assert(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.props = {
      ...DEFAULT_PROPS,
      ...props
    };
  }
  /* eslint-enable max-statements */

  initializeState() {
    Object.assign(this.state, {
      model: null,
      uniforms: {},
      attributes: {},
      // instancedAttributes is the subset of attributes that updates with data
      instancedAttributes: {},
      numInstances: -1,
      dataChanged: true,
      viewportChanged: true,
      needsRedraw: true
    });

    this.addInstancedAttributes(
      {name: 'pickingColors', size: 3, update: this.calculatePickingColors,
        '0': 'r', '1': 'g', '2': 'b'}
    );
  }

  // Deduces numer of instances. Intention is to support:
  // - Explicit setting of numInstances
  // - Auto-deduction for ES6 containers that define a size member
  // - Auto-deduction for Classic Arrays via the built-in length attribute
  // - Auto-deduction via arrays
  // -
  getNumInstances() {
    const {data, numInstances} = this.props;
    let count = numInstances;
    if (count === undefined && data) {
      // Check if array length attribute is set
      count = data && data.length;
    }
    if (count === undefined) {
      // Check if ES6 collection size attribute is set
      count = data && data.size;
    }
    if (count === undefined) {
      // Use iteration to count objects
      count = 0;
      /* eslint-disable no-unused-vars */
      for (const object of data) {
        count++;
      }
      /* eslint-enable no-unused-vars */
    }
    if (count === undefined) {
      throw new Error('Could not determine number of instances');
    }
    return count;
  }

  // Use iteration (the only required capability on data) to get first element
  getFirstObject() {
    const {data} = this.props;
    for (const object of data) {
      return object;
    }
    return null;
  }

  initializeAttributes() {
    // Figure out data length
    const numInstances = this.getNumInstances();
    this.allocateAttributes(numInstances);
    this.updateUniforms();
    this.updateAttributes();
  }

  shouldUpdate(newProps) {
    const oldProps = this.props;
    return !areEqualShallow(newProps, oldProps);
  }

  preUpdateState(newProps) {
    const oldProps = this.props;
    const {autoUpdate} = newProps;

    // Figure out data length
    const numInstances =
      newProps.numInstances || (newProps.data && newProps.data.length) || 0;

    // Setup update flags, used to prevent unnecessary calculations
    // TODO non-instanced layer cannot use .data.length for equal check
    if (newProps.deepCompare) {
      this.state.dataChanged = !isEqual(newProps.data, oldProps.data);
    } else {
      this.state.dataChanged = newProps.data.length !== oldProps.data.length;
    }

    // Allocate buffers
    this.state.dataChanged =
      this.state.dataChanged || this.allocateAttributes(numInstances);

    this.state.viewportChanged =
      newProps.width !== oldProps.width ||
      newProps.height !== oldProps.height ||
      newProps.latitude !== oldProps.latitude ||
      newProps.longitude !== oldProps.longitude ||
      newProps.zoom !== oldProps.zoom;

    const {dataChanged, viewportChanged} = this.state;
    if (dataChanged && autoUpdate) {
      this.updateAttributes();
    }

    // update redraw flag
    this.state.needsRedraw = this.state.needsRedraw ||
      this.state.dataChanged ||
      this.state.viewportChanged;

    // The app can always provide custom attribute buffers
    this.copyAttributesFromProps(newProps);
    if (dataChanged) {
      this.updateAttributes();
    }
  }

  updateState(newProps) {
  }

  // Used to register an attribute
  addInstancedAttributes(...attributes) {
    for (const attribute of attributes) {
      assert(typeof attribute.name === 'string', 'Attribute name missing');
      assert(typeof attribute.size === 'number', 'Attribute size missing');
      assert(typeof attribute.update === 'function',
        'Attribute update missing');

      // Check that value extraction keys are set
      assert(typeof attribute[0] === 'string');
      if (attribute.size >= 2) {
        assert(typeof attribute[1] === 'string');
      }
      if (attribute.size >= 3) {
        assert(typeof attribute[2] === 'string');
      }
      if (attribute.size >= 4) {
        assert(typeof attribute[3] === 'string');
      }

      const attributeObject = {
        ...attribute,
        instanced: 1,
        value: null,
        fromProps: false
      };
      // Add to both attributes list (for registration with model)
      this.state.attributes[attribute.name] = attributeObject;
      // and instancedAttributes (for updating when data changes)
      this.state.instancedAttributes[attribute.name] = attributeObject;
    }
  }

  checkPropAttributes(newProps) {
    const {instancedAttributes: attributes, numInstances} = this.state;

    // First check that the props are valid
    // Note: not necessary, this is just to help app catch mistakes
    for (const attributeName in newProps.attributes) {
      const attribute = attributes[attributeName];
      const buffer = newProps.attributes[attributeName];
      if (!buffer) {
        throw new Error(`Unknown attribute prop ${attributeName}`);
      }
      if (!(buffer instanceof Float32Array)) {
        throw new Error('Attribute properties must be of type Float32Array');
      }
      if (buffer.length <= numInstances * attribute.size) {
        throw new Error('Attribute prop array must match length and size');
      }
    }

  }

  copyPropAttributes(newProps) {
    const {instancedAttributes: attributes} = this.state;

    // Copy the refs of any supplied buffers in the props
    this.state.allAttributesFromProps = true;
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const buffer = newProps.attributes[attributeName];
      if (buffer) {
        attribute.value = buffer;
        attribute.fromProps = true;
      } else {
        attribute.fromProps = false;
        this.state.allAttributesFromProps = false;
      }
    }

  }

  // Auto allocates numInstances size buffers for any non-provided attributes
  // Override for special cases only
  allocateAttributes(N) {
    // If app supplied all attributes, no need to iterate
    if (this.state.allAttributesFromProps) {
      return;
    }

    const {numInstances, instancedAttributes} = this.state;
    if (N > numInstances) {
      for (const attributeName in instancedAttributes) {
        const attribute = instancedAttributes[attributeName];
        const {size, fromProps} = attribute;
        if (!fromProps) {
          attribute.value = new Float32Array(N * size);
        }
      }
      this.state.numInstances = N;
    }
  }

  /* eslint-disable max-depth, max-statements */
  updateAttributes() {
    // If app supplied all attributes, no need to iterate over data
    if (this.state.allAttributesFromProps) {
      return;
    }

    const {data, attributes, getValues} = this.state;

    let i = 0;
    for (const object of data) {
      const values = getValues(object);
      for (const attributeName in attributes) {
        const attribute = attributes[attributeName];
        // If this attribute's buffer wasn't copied from props, initialize it
        if (!attribute.fromProps) {
          const {value, size} = attribute;
          value[i * size + 0] = values[attribute[0]];
          if (size >= 2) {
            value[i * size + 1] = values[attribute[0]];
          }
          if (size >= 3) {
            value[i * size + 2] = values[attribute[0]];
          }
          if (size >= 4) {
            value[i * size + 3] = values[attribute[0]];
          }
        }
      }
      i++;
    }
  }
  /* eslint-enable max-depth, max-statements */

  updateUniforms() {
    const {uniforms} = this.state;
    // apply gamma to opacity to make it visually "linear"
    uniforms.opacity = Math.pow(this.props.opacity || 0.8, 1 / 2.2);
  }

  /* ------------------------------------------------------------------ */
  /* override the following functions and fill in layer specific logic */

  /* override the above functions and fill in layer specific logic */
  /* -------------------------------------------------------------- */

  createModel({gl}) {
    const {program, attributes, uniforms} = this.state;

    // Add any primitive attributes
    this._setPrimitiveAttributes();

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

  _setPrimitiveAttributes() {
    const {gl, primitive, attributes} = this.state;
    // Set up attributes relating to the primitive (not the instances)
    if (primitive.vertices) {
      attributes.vertices = {value: primitive.vertices, size: 3};
    }

    if (primitive.normals) {
      attributes.normals = {value: primitive.normals, size: 3};
    }

    if (primitive.indices) {
      attributes.indices = {
        value: primitive.indices,
        bufferType: gl.ELEMENT_ARRAY_BUFFER,
        drawType: gl.STATIC_DRAW,
        size: 1
      };
    }
  }

  _getRenderFunction(gl) {
    const {primitive} = this.state;
    const drawType = primitive.drawType ?
      gl.get(primitive.drawType) : gl.POINTS;

    const numIndices = primitive.indices ? primitive.indices.length : 0;
    const numVertices = primitive.vertices ? primitive.vertices.length : 0;

    // "Capture" state as it will be set to null when layer is disposed
    const {state} = this;

    if (primitive.instanced) {
      const extension = gl.getExtension('ANGLE_instanced_arrays');

      if (primitive.indices) {
        return () => {
          extension.drawElementsInstancedANGLE(
            drawType, numIndices, gl.UNSIGNED_SHORT, 0, state.numInstances
          );
        };
      }
      // else if this.primitive does not have indices
      return () => {
        extension.drawArraysInstancedANGLE(
          drawType, 0, numVertices / 3, state.numInstances
        );
      };

    }

    // else if this.primitive is not instanced
    if (this.state.primitive.indices) {
      return () => gl.drawElements(drawType, numIndices, gl.UNSIGNED_SHORT, 0);
    }
    // else if this.primitive does not have indices
    return () => gl.drawArrays(drawType, 0, state.numInstances);

  }

  calculatePickingColors(value, size) {
    const {numInstances} = this.state;
    for (let i = 0; i < numInstances; i++) {
      value[i * size + 0] = (i + 1) % 256;
      value[i * size + 1] = Math.floor((i + 1) / 256) % 256;
      value[i * size + 2] = this.layerIndex;
    }
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
