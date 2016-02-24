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
import Layer from './layer';
import autobind from 'autobind-decorator';
import assert from 'assert';
import {addIterator} from '../util';

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
  isPickable: false,
  deepCompare: false,
  getValue: x => x,
  onObjectHovered: () => {},
  onObjectClicked: () => {}
};

const ATTRIBUTES = {
  pickingColors: {size: 3, '0': 'pickRed', '1': 'pickGreen', '2': 'pickBlue'}
};

export default class InstancedLayer extends Layer {

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
    props = {
      ...DEFAULT_PROPS,
      ...props
    };
    super(props);

    // Add iterator to objects
    if (props.data) {
      addIterator(props.data);
      assert(props.data[Symbol.iterator], 'data prop must have an iterator');
    }

    this.checkParam(props.data || props.buffers);
  }
  /* eslint-enable max-statements */

  initializeState() {
    super.initializeState();

    this.setState({
      // instancedAttributes is the subset of attributes that updates with data
      instancedAttributes: {},
      numInstances: 0,
      dataChanged: true
    });

    // All instanced layers get pickingColors attribute by default
    this.addInstancedAttributes(ATTRIBUTES, {
      pickingColors: {update: this.calculatePickingColors, when: 'realloc'}
    });
  }

  checkProps(oldProps, newProps) {
    super.checkProps(oldProps, newProps);

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
    // Figure out data length
    this.updateInstanceAttributes();
  }

  // PUBLIC API

  // Use iteration (the only required capability on data) to get first element
  getFirstObject() {
    const {data} = this.props;
    for (const object of data) {
      return object;
    }
    return null;
  }

  // Used to register an attribute
  addInstancedAttributes(attributes, updaters) {

    function validate(attributeName, attribute, updater) {
      assert(typeof attribute.size === 'number',
        `Attribute definition for ${attributeName} missing size`);

      // Check that value extraction keys are set
      assert(typeof attribute[0] === 'string',
        `Attribute definition for ${attributeName} missing key 0`);
      if (attribute.size >= 2) {
        assert(typeof attribute[1] === 'string',
          `Attribute definition for ${attributeName} missing key 1`);
      }
      if (attribute.size >= 3) {
        assert(typeof attribute[2] === 'string',
          `Attribute definition for ${attributeName} missing key 2`);
      }
      if (attribute.size >= 4) {
        assert(typeof attribute[3] === 'string',
          `Attribute definition for ${attributeName} missing key 3`);
      }

      // Check the updater

      assert(updater,
        `Attribute updater for ${attributeName} not found`);
      assert(typeof updater.update === 'function',
        `Attribute updater for ${attributeName} missing update method`);
    }

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const updater = updaters[attributeName];

      // Check all fields and generate helpful error messages
      validate(attributeName, attribute, updater);

      // Initialize the attribute descriptor, with WebGL and metadata fields
      const attributeData = {
        // Metadata
        ...attribute,
        ...updater,

        // State
        fromProps: false,
        needsUpdate: true,
        userData: {},

        // WebGL fields
        size: attribute.size,
        instanced: 1,
        value: null
      };
      Object.seal(attributeData);

      // Add to both attributes list (for registration with model)
      this.state.attributes[attributeName] = attributeData;
      // and instancedAttributes (for updating when data changes)
      this.state.instancedAttributes[attributeName] = attributeData;
    }
  }

  // INTERNAL METHODS

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

  @autobind
  calculatePickingColors() {
    const {numInstances} = this.state;
    const {value, size} = this.state.attributes.pickingColors;
    for (let i = 0; i < numInstances; i++) {
      value[i * size + 0] = (i + 1) % 256;
      value[i * size + 1] = Math.floor((i + 1) / 256) % 256;
      value[i * size + 2] = this.layerIndex;
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

    // Not instanced
    return super._getRenderFunction(gl);
  }

  // Ensure all attribute buffers are updated from props or data
  updateInstanceAttributes() {
    const {props} = this;
    const numInstances = this.getNumInstances();
    this.checkAttributeProps(props);
    this.updateAttributesFromProps(props);
    this.allocateInstanceAttributeBuffers(numInstances);
    this.updateInstanceAttributesFromData();
  }

  // Checks that any attribute buffers in props are valid
  // Note: This is just to help app catch mistakes
  checkAttributeProps(newProps) {
    const {instancedAttributes: attributes, numInstances} = this.state;

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

  // Update attribute buffers from any attributes in props
  updateAttributesFromProps(newProps) {
    const {instancedAttributes: attributes} = this.state;

    // Copy the refs of any supplied buffers in the props
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const buffer = newProps.attributes[attributeName];
      if (buffer) {
        if (attribute.value !== buffer) {
          attribute.value = buffer;
          this.needsRedraw = true;
        }
        attribute.fromProps = true;
        attribute.needsUpdate = false;
      } else {
        attribute.fromProps = false;
      }
    }
  }

  // Auto allocates buffers for attributes
  // Note: Only allocates buffers when not provided as props
  allocateInstanceAttributeBuffers(N) {
    const {numInstances, instancedAttributes} = this.state;
    this.state.numInstances = N;

    if (N > numInstances) {
      for (const attributeName in instancedAttributes) {
        const attribute = instancedAttributes[attributeName];
        const {size, fromProps} = attribute;
        if (!fromProps) {
          attribute.value = new Float32Array(N * size);
          attribute.needsUpdate = true;
        }
      }
      this.state.needsRedraw = true;
    }
  }

  updateInstanceAttributesFromData() {
    const {instancedAttributes: attributes} = this.state;

    // If app supplied all attributes, no need to iterate over data

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const {update, post} = attribute;
      if (update) {
        update();
      } else {
        this.updateInstanceAttributeFromData(attribute);
      }
      if (post) {
        post();
      }
      attribute.needsUpdate = false;
    }

    this.state.needsRedraw = true;
  }

  updateInstanceAttributeFromData(attribute) {
    const {data, getValue} = this.props;

    let i = 0;
    for (const object of data) {
      const values = getValue(object);
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
      i++;
    }
  }

}
