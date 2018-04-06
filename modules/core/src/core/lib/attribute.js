/* eslint-disable complexity */
import assert from 'assert';
import {GL, Buffer} from 'luma.gl';

export default class Attribute {
  constructor({
    id = 'unnamed-attribute',
    attribute,

    // luma.gl fields
    size,
    value,
    isGeneric = false,
    isIndexed = false,
    instanced = 0,

    // deck.gl fields
    transition = false,
    noAlloc = false,
    updater = null,
    accessor = null
  } = {}) {
    this.id = id;
    this.userData = {}; // Reserved for application

    // Initialize the attribute descriptor, with WebGL and metadata fields
    this.state = Object.assign(
      {
        // Ensure that fields are present before Object.seal()
        target: undefined,
        buffer: null,
        userData: {}
      },
      {
        transition,
        noAlloc,
        updater,
        accessor
      },
      // Metadata
      attribute,
      {
        // State
        isExternalBuffer: false,
        needsAlloc: false,
        needsUpdate: false,
        needsRedraw: false,

        // Luma fields
        isGeneric,
        isIndexed,
        instanced,
        size,
        value
      }
    );

    this.allocedInstances = -1;

    // Sanity - no app fields on our attributes. Use userData instead.
    Object.seal(this);
    Object.seal(this.state);

    // Check all fields and generate helpful error messages
    this._validateAttributeDefinition();
    this._validateAttributeUpdaters();
  }

  finalize() {
    // TODO call buffer.finalize();
  }

  // HACK to fix plot layer (temporary)
  get value() {
    return this.state.value;
  }

  needsUpdate() {
    return this.state.needsUpdate;
  }

  needsRedraw({clearChangedFlags = false} = {}) {
    const needsRedraw = this.state.needsRedraw;
    this.state.needsRedraw = this.state.needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }

  getInstanceCount() {
    const attribute = this.state;
    return attribute.value !== null ? attribute.value.length / attribute.size : 0;
  }

  getBuffer() {
    const attribute = this.state;
    return attribute.buffer || attribute;
  }

  // Checks that typed arrays for attributes are big enough
  // sets alloc flag if not
  // @return {Boolean} whether any updates are needed
  setNeedsUpdate(reason = this.id) {
    this.state.needsUpdate = this.state.needsUpdate || reason;
  }

  setNeedsRedraw(reason = this.id) {
    this.state.needsRedraw = this.state.needsRedraw || reason;
  }

  setNumInstances(numInstances) {
    const attribute = this.state;

    if (!attribute.isExternalBuffer) {
      // Do we need to reallocate the attribute's typed array?
      const instanceCount = this.getInstanceCount();
      const needsAlloc = instanceCount === 0 || instanceCount < numInstances;
      if (needsAlloc && (attribute.update || attribute.accessor)) {
        attribute.needsAlloc = true;
        this.setNeedsUpdate(this.id);
      }
    }
  }

  allocate(numInstances) {
    this.setNumInstances(numInstances);

    const attribute = this.state;

    // Allocate a new typed array if needed
    if (attribute.needsAlloc) {
      // Allocate at least one element to ensure a valid buffer
      const allocCount = Math.max(numInstances, 1);
      const ArrayType = glArrayFromType(attribute.type || GL.FLOAT);

      attribute.value = new ArrayType(attribute.size * allocCount);
      attribute.needsAlloc = false;
      attribute.needsUpdate = true;

      this.allocedInstances = allocCount;
      return true;
    }

    return false;
  }

  update({numInstances, data, props, context}) {
    if (!this.needsUpdate()) {
      return false;
    }

    const attribute = this.state;

    const {update, accessor} = attribute;

    let updated = true;
    if (update) {
      // Custom updater - typically for non-instanced layers
      update.call(context, attribute, {data, props, numInstances});
      this._checkAttributeArray();
    } else if (accessor) {
      // Standard updater
      this._updateBufferViaStandardAccessor(data, props);
      this._checkAttributeArray();
    } else {
      updated = false;
    }

    attribute.needsUpdate = false;
    attribute.needsRedraw = true;

    return updated;
  }

  setExternalBuffer(buffer, numInstances) {
    const attribute = this.state;

    if (buffer) {
      attribute.isExternalBuffer = true;
      attribute.needsUpdate = false;

      if (buffer instanceof Buffer) {
        attribute.value = null;
        if (attribute.buffer !== buffer) {
          attribute.buffer = buffer;
          attribute.needsRedraw = true;
        }
      } else {
        const ArrayType = glArrayFromType(attribute.type || GL.FLOAT);
        if (!(buffer instanceof ArrayType)) {
          throw new Error(`Attribute ${this.id} must be of type ${ArrayType.name}`);
        }
        if (attribute.auto && buffer.length <= numInstances * attribute.size) {
          throw new Error('Attribute prop array must match length and size');
        }

        attribute.buffer = null;
        if (attribute.value !== buffer) {
          attribute.value = buffer;
          attribute.needsRedraw = true;
        }
      }
    } else {
      attribute.isExternalBuffer = false;
    }
  }

  // PRIVATE HELPER METHODS

  _updateBufferViaStandardAccessor(data, props) {
    const attribute = this.state;

    const {accessor, value, size} = attribute;
    const accessorFunc = props[accessor];

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let {defaultValue = [0, 0, 0, 0]} = attribute;
    defaultValue = Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    let i = 0;
    for (const object of data) {
      let objectValue = accessorFunc(object);
      objectValue = Array.isArray(objectValue) ? objectValue : [objectValue];
      /* eslint-disable no-fallthrough, default-case */
      switch (size) {
        case 4:
          value[i + 3] = Number.isFinite(objectValue[3]) ? objectValue[3] : defaultValue[3];
        case 3:
          value[i + 2] = Number.isFinite(objectValue[2]) ? objectValue[2] : defaultValue[2];
        case 2:
          value[i + 1] = Number.isFinite(objectValue[1]) ? objectValue[1] : defaultValue[1];
        case 1:
          value[i + 0] = Number.isFinite(objectValue[0]) ? objectValue[0] : defaultValue[0];
      }
      i += size;
    }
  }

  // Validate luma.gl level fields
  _validateAttributeDefinition() {
    const attribute = this.state;

    assert(
      attribute.size >= 1 && attribute.size <= 4,
      `Attribute definition for ${this.id} invalid size`
    );
  }

  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const attribute = this.state;

    // Check that either 'accessor' or 'update' is a valid function
    const hasUpdater =
      attribute.noAlloc ||
      typeof attribute.update === 'function' ||
      typeof attribute.accessor === 'string';
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }

  _checkAttributeArray() {
    const attribute = this.state;

    const {value} = attribute;
    if (value && value.length >= 4) {
      const valid =
        Number.isFinite(value[0]) &&
        Number.isFinite(value[1]) &&
        Number.isFinite(value[2]) &&
        Number.isFinite(value[3]);
      if (!valid) {
        throw new Error(`Illegal attribute generated for ${this.id}`);
      }
    }
  }
}

/* eslint-disable complexity */
export function glArrayFromType(glType, {clamped = true} = {}) {
  // Sorted in some order of likelihood to reduce amount of comparisons
  switch (glType) {
    case GL.FLOAT:
      return Float32Array;
    case GL.UNSIGNED_SHORT:
    case GL.UNSIGNED_SHORT_5_6_5:
    case GL.UNSIGNED_SHORT_4_4_4_4:
    case GL.UNSIGNED_SHORT_5_5_5_1:
      return Uint16Array;
    case GL.UNSIGNED_INT:
      return Uint32Array;
    case GL.UNSIGNED_BYTE:
      return clamped ? Uint8ClampedArray : Uint8Array;
    case GL.BYTE:
      return Int8Array;
    case GL.SHORT:
      return Int16Array;
    case GL.INT:
      return Int32Array;
    default:
      throw new Error('Failed to deduce type from array');
  }
}
/* eslint-enable complexity */
