/* eslint-disable complexity */
import GL from '@luma.gl/constants';
import {Buffer} from '@luma.gl/core';
import assert from '../utils/assert';

import typedArrayManager from '../utils/typed-array-manager';
import {toDoublePrecisionArray} from '../utils/double-precision';
import {getTypedArrayFromGLType} from '../utils/gl-types';
import {length} from 'gl-matrix/cjs/vec4';

export default class GPUColumn {
  constructor(gl, name, value, options = {}) {
    this.gl = gl;
    this.name = name;
    this.isManaged = true;
    this.buffer = null;
    this.accessors = {};

    Object.seal(this.userData);

    this._setColumn(column);
  }

  delete() {
    if (this.isManaged && this.buffer) {
      this.buffer.delete();
      this.buffer = null;
    }
    return this;
  }

  finalize() {
    return this.delete();
  }

  getBuffer() {
    return this.buffer;
  }

  // PRIVATE

  _setColumn(column) {
    if (column instanceof Buffer) {
      this.buffer = column;
      return;
    }

    if (column instanceof WebGLBuffer) {
      this.buffer = new Buffer(this.gl, {handle: column});
      return;
    }

    if (column instanceof ArrayBuffer) {
      const byteLength = column.byteLength; // PAD to make texture compatible: power of 2
      this.buffer = new Buffer(this.gl, {byteLength});
      this.buffer.subData(column);
      return;
    }

    if (ArrayBuffer.isView(column)) {
      const byteLength = column.byteLength; // PAD to make texture compatible: power of 2
      this.buffer = new Buffer(this.gl, {byteLength});
      this.buffer.subData(column);
      return;
    }

    assert(false);
  }

  /*
    switch (this.getGLType()) {
      case GL.DOUBLE:
        this.attributes = this._addDoublePrecisionAttributes(this);
        break;
      case GL.FLOAT_MAT2:
      case GL.FLOAT_MAT3:
      case GL.FLOAT_MAT4:
        break;
      case GL_.DOUBLE_MAT2:
      case GL_.DOUBLE_MAT3:
      case GL_.DOUBLE_MAT4:
        throw new Error(`Column type ${this.getGLType()} not yet implemented`);
      default:
        throw new Error(`Unknown column type ${this.getGLType()}`);
    }


  getValue() {
    const buffer = this.externalBuffer || this.buffer;
    if (buffer) {
      return [buffer, this.accessor];
    }
    return null;
  }

  // eslint-disable max-statements
  update(options) {
    const {value, buffer, constant = this.constant || false} = options;

    this.constant = constant;

    if (buffer) {
      this.externalBuffer = buffer;
      this.constant = false;
      // Hack: Float64Array value is required for double-precision attributes
      // to generate correct shader attributes
      // This is so that we can manually set value to indicate that the external
      // buffer uses interleaved 64-bit values
      this.value = value || null;

      this.type = options.type || buffer.accessor.type;
      if (buffer.accessor.divisor !== undefined) {
        this.divisor = buffer.accessor.divisor;
      }
      if (options.divisor !== undefined) {
        this.divisor = options.divisor;
      }
    } else if (value) {
      this.externalBuffer = null;

      const size = this.size || options.size || 0;
      if (constant && value.length !== size) {
        this.value = new Float32Array(size);
        // initiate offset values
        this._setAccessor(options);
        const index = this.elementOffset;
        for (let i = 0; i < this.size; ++i) {
          this.value[i] = value[index + i];
        }
      } else {
        this.value = value;
      }

      // Create buffer if needed
      if (!constant && this.gl) {
        this.buffer =
          this.buffer ||
          new Buffer(this.gl, {
            id: this.id,
            target: this.target
          });
        this.buffer.setData({data: value});
        this.type = this.buffer.accessor.type;
      }
    }

    this._setAccessor(options);

    if (constant && this.normalized) {
      this.value = this._normalizeConstant(this.value);
    }
  }

  // Sets all accessor props except type
  // TODO - store on `this.accessor`
  _setAccessor(options) {
    const {
      // accessor props
      size = this.size,
      offset = this.offset || 0,
      stride = this.stride || 0,
      normalized = this.normalized || false,
      integer = this.integer || false,
      divisor = this.divisor || 0
    } = options;

    this.size = size;
    this.offset = offset;
    this.elementOffset = offset / Accessor.getBytesPerElement(this);
    this.stride = stride;
    this.normalized = normalized;
    this.integer = integer;

    this.divisor = divisor;
  }

  getAttributes() {
    const attributes = {};
    if (this.doublePrecision) {
      const isBuffer64Bit = this.value instanceof Float64Array;
      for (const shaderAttributeName of this.hasShaderAttributes) {
        attributes[shaderAttributeName] = this.attributes[
          isBuffer64Bit ? `${shaderAttributeName}64` : `${shaderAttributeName}32`
        ];
        const shaderAttributeLowPartName = `${shaderAttributeName}64xyLow`;
        attributes[shaderAttributeLowPartName] = isBuffer64Bit
          ? this.attributes[shaderAttributeLowPartName]
          : new Float32Array(this.size); // use constant for low part if buffer is 32-bit
      }
    } else if (this.hasShaderAttributes) {
      Object.assign(attributes, this.attributes);
    } else {
      attributes[this.id] = this;
    }

    return attributes;
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
      const ArrayType = getTypedArrayFromGLType(this.defaultType);
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
    // doublePrecision ? toDoublePrecisionArray(attributeValue, this) : attributeValue,


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
    }

    return updated;
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

    let options;
    if (ArrayBuffer.isView(buffer)) {
      options = {constant: false, value: buffer};
    } else if (buffer instanceof Buffer) {
      options = {constant: false, buffer};
    } else {
      options = Object.assign({constant: false}, buffer);
    }

    this._checkExternalBuffer(options);

    if (this.doublePrecision && options.value instanceof Float64Array) {
      options.originalValue = options.value;
      options.value = toDoublePrecisionArray(options.value, this);
    }

    this.update(options);

    state.needsRedraw = true;
    if (options.originalValue) {
      this.value = options.originalValue;
    }

    return true;
  }

  // PRIVATE HELPER METHODS
  _checkExternalBuffer(options) {
    const {value} = options;
    if (!options.constant && value) {
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
          Object.values(this.attributes).some(attribute => attribute.offset || attribute.stride);
      }
      if (illegalArrayType) {
        throw new Error(`Attribute ${this.id} does not support ${value.constructor.name}`);
      }
      if (!(value instanceof ArrayType) && this.normalized && !('normalized' in options)) {
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

  // check user supplied values and apply fallback
  _normalizeValue(value, out = [], start = 0) {
    const {defaultValue} = this.userData;

    if (!Array.isArray(value) && !ArrayBuffer.isView(value)) {
      out[start] = Number.isFinite(value) ? value : defaultValue[0];
      return out;
    }

    // eslint-disable no-fallthrough, default-case
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
    const attributes = this.attributes;
    for (const shaderAttributeName in attributes) {
      const shaderAttribute = attributes[shaderAttributeName];
      shaderAttribute.update({
        buffer: this.getBuffer(),
        value: this.value,
        constant: this.constant
      });
    }
  }
  */
}
