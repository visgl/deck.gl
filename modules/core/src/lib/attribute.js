/* eslint-disable complexity */
import assert from '../utils/assert';
import {GL, Buffer, Attribute} from 'luma.gl';

export default class LayerAttribute extends Attribute {
  constructor(gl, opts = {}) {
    super(gl, opts);

    const {
      // deck.gl fields
      transition = false,
      noAlloc = false,
      update = null,
      accessor = null
    } =
      opts.userData || opts;

    Object.assign(this.userData, opts, {
      transition,
      noAlloc,
      update,
      accessor,

      // State
      isExternalBuffer: false,
      needsAlloc: false,
      needsUpdate: false,
      needsRedraw: false,

      allocedInstances: -1
    });

    Object.seal(this.userData);

    // Check all fields and generate helpful error messages
    this._validateAttributeUpdaters();
  }

  needsUpdate() {
    return this.userData.needsUpdate;
  }

  needsRedraw({clearChangedFlags = false} = {}) {
    const needsRedraw = this.userData.needsRedraw;
    this.userData.needsRedraw = this.userData.needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }

  getInstanceCount() {
    return this.value !== null ? this.value.length / this.size : 0;
  }

  // Checks that typed arrays for attributes are big enough
  // sets alloc flag if not
  // @return {Boolean} whether any updates are needed
  setNeedsUpdate(reason = this.id) {
    this.userData.needsUpdate = this.userData.needsUpdate || reason;
  }

  setNeedsRedraw(reason = this.id) {
    this.userData.needsRedraw = this.userData.needsRedraw || reason;
  }

  setNumInstances(numInstances) {
    const state = this.userData;

    if (!state.isExternalBuffer) {
      // Do we need to reallocate the attribute's typed array?
      const instanceCount = this.getInstanceCount();
      const needsAlloc = instanceCount === 0 || instanceCount < numInstances;
      if (needsAlloc && (state.update || state.accessor)) {
        state.needsAlloc = true;
        this.setNeedsUpdate(this.id);
      }
    }
  }

  allocate(numInstances) {
    this.setNumInstances(numInstances);

    const state = this.userData;

    // Allocate a new typed array if needed
    if (state.needsAlloc) {
      // Allocate at least one element to ensure a valid buffer
      const allocCount = Math.max(numInstances, 1);
      const ArrayType = glArrayFromType(this.type || GL.FLOAT);

      this.value = new ArrayType(this.size * allocCount);
      state.needsAlloc = false;
      state.needsUpdate = true;

      state.allocedInstances = allocCount;
      return true;
    }

    return false;
  }

  updateBuffer({numInstances, data, props, context}) {
    if (!this.needsUpdate()) {
      return false;
    }

    const state = this.userData;

    const {update, accessor} = state;

    let updated = true;
    if (update) {
      // Custom updater - typically for non-instanced layers
      update.call(context, this, {data, props, numInstances});
      this.update({
        value: this.value,
        isGeneric: this.isGeneric
      });
      this._checkAttributeArray();
    } else if (accessor) {
      // Standard updater
      this._updateBufferViaStandardAccessor(data, props);
      this._checkAttributeArray();
    } else {
      updated = false;
    }

    state.needsUpdate = false;
    state.needsRedraw = true;

    return updated;
  }

  setExternalBuffer(buffer, numInstances) {
    const state = this.userData;

    if (buffer) {
      state.isExternalBuffer = true;
      state.needsUpdate = false;

      if (buffer instanceof Buffer) {
        if (this.externalBuffer !== buffer) {
          this.update({externalBuffer: buffer});
          state.needsRedraw = true;
        }
      } else {
        const ArrayType = glArrayFromType(this.type || GL.FLOAT);
        if (!(buffer instanceof ArrayType)) {
          throw new Error(`Attribute ${this.id} must be of type ${ArrayType.name}`);
        }
        if (state.auto && buffer.length <= numInstances * this.size) {
          throw new Error('Attribute prop array must match length and size');
        }
        if (this.value !== buffer) {
          this.update({value: buffer});
          state.needsRedraw = true;
        }
      }
    } else {
      state.isExternalBuffer = false;
    }
  }

  // PRIVATE HELPER METHODS

  _updateBufferViaStandardAccessor(data, props) {
    const state = this.userData;

    const {accessor} = state;
    const {value, size} = this;
    const accessorFunc = props[accessor];

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let {defaultValue = [0, 0, 0, 0]} = state;
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
    this.update({value});
  }

  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const state = this.userData;

    // Check that either 'accessor' or 'update' is a valid function
    const hasUpdater =
      state.noAlloc || typeof state.update === 'function' || typeof state.accessor === 'string';
    if (!hasUpdater) {
      throw new Error(`Attribute ${this.id} missing update or accessor`);
    }
  }

  _checkAttributeArray() {
    const {value} = this;
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
