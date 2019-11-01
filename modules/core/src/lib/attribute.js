/* eslint-disable complexity */
import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';
import assert from '../utils/assert';
import {createIterable} from '../utils/iterable-utils';
import {fillArray} from '../utils/flatten';
import * as range from '../utils/range';
import log from '../utils/log';
import BaseAttribute from './base-attribute';
import typedArrayManager from '../utils/typed-array-manager';
import {toDoublePrecisionArray} from '../utils/math-utils';
import {normalizeTransitionSettings} from './attribute-transition-utils';

const DEFAULT_STATE = {
  isExternalBuffer: false,
  lastExternalBuffer: null,
  allocatedValue: null,
  needsUpdate: true,
  needsRedraw: false,
  updateRanges: range.FULL
};

function addDoublePrecisionAttributes(attribute, shaderAttributeDefs) {
  const doubleShaderAttributeDefs = {};
  for (const shaderAttributeName in shaderAttributeDefs) {
    const def = shaderAttributeDefs[shaderAttributeName];
    const offset = 'offset' in def ? def.offset : attribute.offset;
    const stride = 'stride' in def ? def.stride : attribute.size * 4;

    doubleShaderAttributeDefs[`${shaderAttributeName}32`] = Object.assign({}, def, {
      offset,
      stride
    });
    doubleShaderAttributeDefs[`${shaderAttributeName}64`] = Object.assign({}, def, {
      offset: offset * 2,
      stride: stride * 2
    });
    doubleShaderAttributeDefs[`${shaderAttributeName}64xyLow`] = Object.assign({}, def, {
      offset: offset * 2 + stride,
      stride: stride * 2
    });
  }
  return doubleShaderAttributeDefs;
}

export default class Attribute extends BaseAttribute {
  constructor(gl, opts = {}) {
    const logicalType = opts.type;
    const doublePrecision = logicalType === GL.DOUBLE;

    // DOUBLE is not a valid WebGL buffer type
    // tell BaseAttribute to set the accessor type to FLOAT
    super(gl, doublePrecision ? {...opts, type: GL.FLOAT} : opts);

    const {
      // deck.gl fields
      transition = false,
      noAlloc = false,
      update = null,
      accessor = null,
      transform = null,
      bufferLayout = null
    } = opts;

    let {defaultValue = [0, 0, 0, 0]} = opts;
    defaultValue = Array.isArray(defaultValue) ? defaultValue : [defaultValue];

    // This is the attribute type defined by the layer
    // If an external buffer is provided, this.type may be overwritten
    // But we always want to use defaultType for allocation
    this.defaultType = logicalType || this.type || GL.FLOAT;
    this.shaderAttributes = {};
    this.hasShaderAttributes = false;
    this.doublePrecision = doublePrecision;

    // `fp64: false` tells a double-precision attribute to allocate Float32Arrays
    // by default when using auto-packing. This is more efficient in use cases where
    // high precision is unnecessary, but the `64xyLow` attribute is still required
    // by the shader.
    if (doublePrecision && opts.fp64 === false) {
      this.defaultType = GL.FLOAT;
    }

    let shaderAttributes = opts.shaderAttributes || (doublePrecision && {[this.id]: {}});

    if (shaderAttributes) {
      const shaderAttributeNames = Object.keys(shaderAttributes);
      shaderAttributes = doublePrecision
        ? addDoublePrecisionAttributes(this, shaderAttributes)
        : shaderAttributes;
      for (const shaderAttributeName in shaderAttributes) {
        const shaderAttribute = shaderAttributes[shaderAttributeName];

        // Initialize the attribute descriptor, with WebGL and metadata fields
        this.shaderAttributes[shaderAttributeName] = new BaseAttribute(
          this.gl,
          Object.assign(
            {
              size: this.size,
              normalized: this.normalized,
              integer: this.integer,
              offset: this.offset,
              stride: this.stride,
              divisor: this.divisor
            },
            shaderAttribute,
            {
              id: shaderAttributeName,
              buffer: this.getBuffer()
            }
          )
        );

        this.hasShaderAttributes = shaderAttributeNames;
      }
    }

    Object.assign(this.userData, DEFAULT_STATE, opts, {
      transition,
      noAlloc,
      update: update || (accessor && this._standardAccessor),
      accessor,
      transform,
      defaultValue,
      bufferLayout
    });

    Object.seal(this.userData);

    // Check all fields and generate helpful error messages
    this._validateAttributeUpdaters();
  }

  get bufferLayout() {
    return this.userData.bufferLayout;
  }

  set bufferLayout(layout) {
    this.userData.bufferLayout = layout;
  }

  delete() {
    super.delete();
    typedArrayManager.release(this.userData.allocatedValue);
  }

  needsUpdate() {
    return this.userData.needsUpdate;
  }

  needsRedraw({clearChangedFlags = false} = {}) {
    const needsRedraw = this.userData.needsRedraw;
    this.userData.needsRedraw = this.userData.needsRedraw && !clearChangedFlags;
    return needsRedraw;
  }

  getUpdateTriggers() {
    const {accessor} = this.userData;

    // Backards compatibility: allow attribute name to be used as update trigger key
    return [this.id].concat((typeof accessor !== 'function' && accessor) || []);
  }

  getAccessor() {
    return this.userData.accessor;
  }

  getShaderAttributes() {
    const shaderAttributes = {};
    if (this.doublePrecision) {
      const isBuffer64Bit = this.value instanceof Float64Array;
      for (const shaderAttributeName of this.hasShaderAttributes) {
        shaderAttributes[shaderAttributeName] = this.shaderAttributes[
          isBuffer64Bit ? `${shaderAttributeName}64` : `${shaderAttributeName}32`
        ];
        const shaderAttributeLowPartName = `${shaderAttributeName}64xyLow`;
        shaderAttributes[shaderAttributeLowPartName] = isBuffer64Bit
          ? this.shaderAttributes[shaderAttributeLowPartName]
          : new Float32Array(this.size); // use constant for low part if buffer is 32-bit
      }
    } else if (this.hasShaderAttributes) {
      Object.assign(shaderAttributes, this.shaderAttributes);
    } else {
      shaderAttributes[this.id] = this;
    }

    return shaderAttributes;
  }

  supportsTransition() {
    return Boolean(this.userData.transition);
  }

  // Resolve transition settings object if transition is enabled, otherwise `null`
  getTransitionSetting(opts) {
    const {accessor} = this.userData;
    // `userData` is a bit of a misnomer here, these are the transition settings defined by
    // the layer itself, not the layer's user
    // TODO: have the layer resolve these transition settings itself?
    const layerSettings = this.userData.transition;
    if (!this.supportsTransition()) {
      return null;
    }
    // these are the transition settings passed in by the user
    const userSettings = Array.isArray(accessor)
      ? opts[accessor.find(a => opts[a])]
      : opts[accessor];

    // Shorthand: use duration instead of parameter object
    return normalizeTransitionSettings(userSettings, layerSettings);
  }

  setNeedsUpdate(reason = this.id, dataRange) {
    this.userData.needsUpdate = this.userData.needsUpdate || reason;
    if (dataRange) {
      const {startRow = 0, endRow = Infinity} = dataRange;
      this.userData.updateRanges = range.add(this.userData.updateRanges, [startRow, endRow]);
    } else {
      this.userData.updateRanges = range.FULL;
    }
  }

  clearNeedsUpdate() {
    this.userData.needsUpdate = false;
    this.userData.updateRanges = range.EMPTY;
  }

  setNeedsRedraw(reason = this.id) {
    this.userData.needsRedraw = this.userData.needsRedraw || reason;
  }

  allocate(numInstances) {
    const state = this.userData;

    if (state.isExternalBuffer || state.noAlloc) {
      // Data is provided through a Buffer object.
      return false;
    }

    if (state.update) {
      assert(Number.isFinite(numInstances));
      // Allocate at least one element to ensure a valid buffer
      const allocCount = Math.max(numInstances, 1);
      const ArrayType = glArrayFromType(this.defaultType);
      const oldValue = state.allocatedValue;
      const shouldCopy = state.updateRanges !== range.FULL;

      this.constant = false;
      this.value = typedArrayManager.allocate(oldValue, allocCount, {
        size: this.size,
        type: ArrayType,
        padding: this.elementOffset,
        copy: shouldCopy
      });

      if (this.buffer && this.buffer.byteLength < this.value.byteLength) {
        this.buffer.reallocate(this.value.byteLength);

        if (shouldCopy && oldValue) {
          // Upload the full existing attribute value to the GPU, so that updateBuffer
          // can choose to only update a partial range.
          // TODO - copy old buffer to new buffer on the GPU
          this.buffer.subData(oldValue);
        }
      }

      state.allocatedValue = this.value;
      return true;
    }

    return false;
  }

  updateBuffer({numInstances, bufferLayout, data, props, context}) {
    if (!this.needsUpdate()) {
      return false;
    }

    const state = this.userData;

    const {update, updateRanges, noAlloc} = state;

    let updated = true;
    if (update) {
      // Custom updater - typically for non-instanced layers
      for (const [startRow, endRow] of updateRanges) {
        update.call(context, this, {data, startRow, endRow, props, numInstances, bufferLayout});
      }
      const doublePrecision = this.doublePrecision && this.value instanceof Float64Array;
      if (this.constant || !this.buffer || this.buffer.byteLength < this.value.byteLength) {
        const attributeValue = this.value;
        // call base clas `update` method to upload value to GPU
        this.update({
          value: doublePrecision ? toDoublePrecisionArray(attributeValue, this) : attributeValue,
          constant: this.constant
        });
        // Save the 64-bit version
        this.value = attributeValue;
      } else {
        for (const [startRow, endRow] of updateRanges) {
          const startOffset = Number.isFinite(startRow) ? this.getVertexOffset(startRow) : 0;
          const endOffset = Number.isFinite(endRow)
            ? this.getVertexOffset(endRow)
            : noAlloc || !Number.isFinite(numInstances)
              ? this.value.length
              : numInstances * this.size;

          // Only update the changed part of the attribute
          this.buffer.subData({
            data: doublePrecision
              ? toDoublePrecisionArray(this.value, {
                  size: this.size,
                  startIndex: startOffset,
                  endIndex: endOffset
                })
              : this.value.subarray(startOffset, endOffset),
            offset: startOffset * this.value.BYTES_PER_ELEMENT
          });
        }
      }
      this._checkAttributeArray();
    } else {
      updated = false;
    }

    this._updateShaderAttributes();

    this.clearNeedsUpdate();
    state.needsRedraw = true;

    return updated;
  }

  update(props) {
    super.update(props);
    this._updateShaderAttributes();
  }

  // Use generic value
  // Returns true if successful
  setConstantValue(value) {
    const state = this.userData;

    if (value === undefined || typeof value === 'function') {
      // ignore if this attribute has no accessor
      // ignore if accessor is function, will be used in updateBuffer
      state.isExternalBuffer = false;
      return false;
    }

    value = this._normalizeValue(value);
    const hasChanged = !this.constant || !this._areValuesEqual(value, this.value);

    if (hasChanged) {
      this.update({constant: true, value});
    }
    state.needsRedraw = state.needsUpdate || hasChanged;
    this.clearNeedsUpdate();
    state.isExternalBuffer = true;
    return true;
  }

  // Use external buffer
  // Returns true if successful
  // eslint-disable-next-line max-statements
  setExternalBuffer(buffer) {
    const state = this.userData;

    if (!buffer) {
      state.isExternalBuffer = false;
      state.lastExternalBuffer = null;
      return false;
    }

    this.clearNeedsUpdate();

    if (state.lastExternalBuffer === buffer) {
      return true;
    }
    state.isExternalBuffer = true;
    state.lastExternalBuffer = buffer;

    let opts;
    if (ArrayBuffer.isView(buffer)) {
      opts = {constant: false, value: buffer};
    } else if (buffer instanceof Buffer) {
      opts = {constant: false, buffer};
    } else {
      opts = Object.assign({constant: false}, buffer);
    }

    this._checkExternalBuffer(opts);

    if (this.doublePrecision && opts.value instanceof Float64Array) {
      opts.originalValue = opts.value;
      opts.value = toDoublePrecisionArray(opts.value, this);
    }

    this.update(opts);

    state.needsRedraw = true;
    if (opts.originalValue) {
      this.value = opts.originalValue;
    }

    return true;
  }

  // PRIVATE HELPER METHODS
  _checkExternalBuffer(opts) {
    const {value} = opts;
    if (!opts.constant && value) {
      const ArrayType = glArrayFromType(this.defaultType);

      let illegalArrayType = false;
      if (this.doublePrecision) {
        // not 32bit or 64bit
        illegalArrayType = value.BYTES_PER_ELEMENT < 4;
      } else if (this.hasShaderAttributes) {
        illegalArrayType =
          value.BYTES_PER_ELEMENT !== ArrayType.BYTES_PER_ELEMENT &&
          // Shader attributes have hard-coded offsets and strides
          // TODO - switch to element offsets and element strides?
          Object.values(this.shaderAttributes).some(
            attribute => attribute.offset || attribute.stride
          );
      }
      if (illegalArrayType) {
        throw new Error(`Attribute ${this.id} does not support ${value.constructor.name}`);
      }
      if (!(value instanceof ArrayType) && this.normalized && !('normalized' in opts)) {
        log.warn(`Attribute ${this.id} is normalized`)();
      }
    }
  }

  getVertexOffset(row, bufferLayout = this.bufferLayout) {
    let offset = this.elementOffset;
    if (bufferLayout) {
      let index = 0;
      for (const geometrySize of bufferLayout) {
        if (index >= row) {
          break;
        }
        offset += geometrySize * this.size;
        index++;
      }
      return offset;
    }
    return offset + row * this.size;
  }

  /* check user supplied values and apply fallback */
  _normalizeValue(value, out = [], start = 0) {
    const {defaultValue} = this.userData;

    if (!Array.isArray(value) && !ArrayBuffer.isView(value)) {
      out[start] = Number.isFinite(value) ? value : defaultValue[0];
      return out;
    }

    /* eslint-disable no-fallthrough, default-case */
    switch (this.size) {
      case 4:
        out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];
      case 3:
        out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];
      case 2:
        out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];
      case 1:
        out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
    }

    return out;
  }

  _areValuesEqual(value1, value2, size = this.size) {
    for (let i = 0; i < size; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }

  _standardAccessor(attribute, {data, startRow, endRow, props, numInstances, bufferLayout}) {
    const state = attribute.userData;

    const {accessor, transform} = state;
    const {value, size} = attribute;
    const accessorFunc = typeof accessor === 'function' ? accessor : props[accessor];

    assert(typeof accessorFunc === 'function', `accessor "${accessor}" is not a function`);

    let i = attribute.getVertexOffset(startRow, bufferLayout);
    const {iterable, objectInfo} = createIterable(data, startRow, endRow);
    for (const object of iterable) {
      objectInfo.index++;

      let objectValue = accessorFunc(object, objectInfo);
      if (transform) {
        // transform callbacks could be bound to a particular layer instance.
        // always point `this` to the current layer.
        objectValue = transform.call(this, objectValue);
      }

      if (bufferLayout) {
        attribute._normalizeValue(objectValue, objectInfo.target);
        const numVertices = bufferLayout[objectInfo.index];
        fillArray({
          target: attribute.value,
          source: objectInfo.target,
          start: i,
          count: numVertices
        });
        i += numVertices * size;
      } else {
        attribute._normalizeValue(objectValue, value, i);
        i += size;
      }
    }
    attribute.constant = false;
    attribute.bufferLayout = bufferLayout;
  }

  // Validate deck.gl level fields
  _validateAttributeUpdaters() {
    const state = this.userData;

    // Check that 'update' is a valid function
    const hasUpdater = state.noAlloc || typeof state.update === 'function';
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

  _updateShaderAttributes() {
    const shaderAttributes = this.shaderAttributes;
    for (const shaderAttributeName in shaderAttributes) {
      const shaderAttribute = shaderAttributes[shaderAttributeName];
      shaderAttribute.update({
        buffer: this.getBuffer(),
        value: this.value,
        constant: this.constant
      });
    }
  }
}

/* eslint-disable complexity */
function glArrayFromType(glType) {
  // Sorted in some order of likelihood to reduce amount of comparisons
  switch (glType) {
    case GL.FLOAT:
      return Float32Array;
    case GL.DOUBLE:
      return Float64Array;
    case GL.UNSIGNED_SHORT:
    case GL.UNSIGNED_SHORT_5_6_5:
    case GL.UNSIGNED_SHORT_4_4_4_4:
    case GL.UNSIGNED_SHORT_5_5_5_1:
      return Uint16Array;
    case GL.UNSIGNED_INT:
      return Uint32Array;
    case GL.UNSIGNED_BYTE:
      return Uint8ClampedArray;
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
