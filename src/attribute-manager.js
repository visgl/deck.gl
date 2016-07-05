/* eslint-disable guard-for-in */
import log from './log';
import assert from 'assert';

// auto: -
// instanced: - implies auto
//
export default class AttributeManager {

  /**
   * @classdesc
   * Manages a list of attributes and an instance count
   * Auto allocates and updates "instanced" attributes as necessary
   *
   * - keeps track of valid state for each attribute
   * - auto reallocates attributes when needed
   * - auto updates attributes with registered updater functions
   * - allows overriding with application supplied buffers
   */
  constructor({id = ''}) {
    this.id = id;
    this.attributes = {};
    this.instancedAttributes = {};
    this.allocedInstances = -1;
    this.needsRedraw = true;
    this.userData = {};
    // For debugging sanity, prevent uninitialized members
    Object.seal(this);
  }

  // Returns attributes in a format suitable for use with Luma.gl Model/Program
  getAttributes() {
    return this.attributes;
  }

  // Returns the redraw flag
  getNeedsRedraw({clearFlag}) {
    const needsRedraw = this.needsRedraw;
    if (clearFlag) {
      this.needsRedraw = false;
    }
    return needsRedraw;
  }

  // Adds a static attribute (that is not auto updated)
  add(attributes, updaters) {
    const newAttributes = this._add(attributes, updaters, {});
    Object.assign(this.attributes, newAttributes);
  }

  // Adds a dynamic attribute, that is autoupdated
  addDynamic(attributes, updaters) {
    const newAttributes = this._add(attributes, updaters, {
      autoUpdate: true
    });
    Object.assign(this.attributes, newAttributes);
  }

  // Adds an instanced attribute that is autoupdated
  addInstanced(attributes, updaters) {
    const newAttributes = this._add(attributes, updaters, {
      instanced: 1,
      autoUpdate: true
    });
    Object.assign(this.attributes, newAttributes);
    // and instancedAttributes (for updating when data changes)
    Object.assign(this.instancedAttributes, newAttributes);
  }

  // Marks an attribute for update
  invalidate(attributeName) {
    const {attributes} = this;
    const attribute = attributes[attributeName];
    assert(attribute);
    attribute.needsUpdate = true;
  }

  invalidateAll() {
    const {attributes} = this;
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      attribute.needsUpdate = true;
    }
  }

  // Ensure all attribute buffers are updated from props or data
  update({numInstances, buffers = {}, context, data, getValue, ...opts} = {}) {
    this._checkBuffers(buffers, opts);
    this._setBuffers(buffers);
    this._allocateBuffers({numInstances});
    this._updateBuffers({numInstances, context, data, getValue});
  }

  // Set the buffers for the supplied attributes
  // Update attribute buffers from any attributes in props
  // Detach any previously set buffers, marking all
  // Attributes for auto allocation
  _setBuffers(bufferMap, opt) {
    const {attributes} = this;

    // Copy the refs of any supplied buffers in the props
    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const buffer = bufferMap[attributeName];
      if (buffer) {
        attribute.isExternalBuffer = true;
        attribute.needsUpdate = false;
        if (attribute.value !== buffer) {
          attribute.value = buffer;
          this.needsRedraw = true;
        }
      } else {
        attribute.isExternalBuffer = false;
      }
    }
  }

  // Auto allocates buffers for attributes
  // Note: To reduce allocations, only grows buffers
  // Note: Only allocates buffers not set by setBuffer
  _allocateBuffers({numInstances}) {
    const {allocedInstances, attributes} = this;
    assert(numInstances !== undefined);

    if (numInstances > allocedInstances) {
      // Allocate at least one element to ensure a valid buffer
      const allocCount = Math.max(numInstances, 1);
      for (const attributeName in attributes) {
        const attribute = attributes[attributeName];
        const {size, isExternalBuffer, autoUpdate} = attribute;
        if (!isExternalBuffer && autoUpdate) {
          const ArrayType = attribute.type || Float32Array;
          attribute.value = new ArrayType(size * allocCount);
          attribute.needsUpdate = true;
          log(2, `autoallocated ${allocCount} ${attributeName} for ${this.id}`);
        }
      }
      this.allocedInstances = allocCount;
    }
  }

  _updateBuffers({numInstances, data, getValue, context}) {
    const {attributes} = this;

    // If app supplied all attributes, no need to iterate over data

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const {update} = attribute;
      if (attribute.needsUpdate && attribute.autoUpdate) {
        if (update) {
          log(2,
            `autoupdating ${numInstances} ${attributeName} for ${this.id}`);
          update.call(context, attribute, numInstances);
        } else {
          log(2,
            `autocalculating ${numInstances} ${attributeName} for ${this.id}`);
          this._updateAttributeFromData(attribute, data, getValue);
        }
        attribute.needsUpdate = false;
        this.needsRedraw = true;
      }
    }
  }

  _updateAttributeFromData(attribute, data = [], getValue = x => x) {

    let i = 0;
    for (const object of data) {
      const values = getValue(object);
      // If this attribute's buffer wasn't copied from props, initialize it
      if (!attribute.isExternalBuffer) {
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

  // Checks that any attribute buffers in props are valid
  // Note: This is just to help app catch mistakes
  _checkBuffers(bufferMap = {}, opts = {}) {
    const {attributes, numInstances} = this;

    for (const attributeName in bufferMap) {
      const attribute = attributes[attributeName];
      const buffer = bufferMap[attributeName];
      if (!attribute && !opts.ignoreUnknownAttributes) {
        throw new Error(`Unknown attribute prop ${attributeName}`);
      }
      if (attribute) {
        if (!(buffer instanceof Float32Array)) {
          throw new Error('Attribute properties must be of type Float32Array');
        }
        if (attribute.auto && buffer.length <= numInstances * attribute.size) {
          throw new Error('Attribute prop array must match length and size');
        }
      }
    }
  }

  // Used to register an attribute
  _add(attributes, updaters, _extraProps = {}) {

    const newAttributes = {};

    for (const attributeName in attributes) {
      const attribute = attributes[attributeName];
      const updater = updaters && updaters[attributeName];

      // Check all fields and generate helpful error messages
      this._validate(attributeName, attribute, updater);

      // Initialize the attribute descriptor, with WebGL and metadata fields
      const attributeData = {
        // Ensure that fields are present before Object.seal()
        target: undefined,
        isIndexed: false,

        // Reserved for application
        userData: {},

        // Metadata
        ...attribute,
        ...updater,

        // State
        isExternalBuffer: false,
        needsUpdate: true,

        // WebGL fields
        size: attribute.size,
        value: attribute.value || null,

        ..._extraProps
      };
      // Sanity - no app fields on our attributes. Use userData instead.
      Object.seal(attributeData);

      // Add to both attributes list (for registration with model)
      this.attributes[attributeName] = attributeData;
    }

    return newAttributes;
  }

  _validate(attributeName, attribute, updater) {
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
    assert(!updater || typeof updater.update === 'function',
      `Attribute updater for ${attributeName} missing update method`);
  }

}
