/* eslint-disable complexity */
import GL from '@luma.gl/constants';
import {hasFeature, FEATURES, Buffer} from '@luma.gl/core';
import ShaderAttribute from './shader-attribute';
import {glArrayFromType} from './gl-utils';
import typedArrayManager from '../../utils/typed-array-manager';
import {toDoublePrecisionArray} from '../../utils/math-utils';
import log from '../../utils/log';

function getStride(accessor) {
  return accessor.stride || accessor.size * accessor.bytesPerElement;
}

function resolveShaderAttribute(baseAccessor, shaderAttributeOptions) {
  if (shaderAttributeOptions.offset) {
    log.removed('shaderAttribute.offset', 'vertexOffset, elementOffset')();
  }

  // All shader attributes share the parent's stride
  const stride = getStride(baseAccessor);
  // `vertexOffset` is used to access the neighboring vertex's value
  // e.g. `nextPositions` in polygon
  const vertexOffset =
    'vertexOffset' in shaderAttributeOptions
      ? shaderAttributeOptions.vertexOffset
      : baseAccessor.vertexOffset || 0;
  // `elementOffset` is defined when shader attribute's size is smaller than the parent's
  // e.g. `translations` in transform matrix
  const elementOffset = shaderAttributeOptions.elementOffset || 0;
  const offset =
    // offsets defined by the attribute
    vertexOffset * stride +
    elementOffset * baseAccessor.bytesPerElement +
    // offsets defined by external buffers if any
    (baseAccessor.offset || 0);

  return {
    ...shaderAttributeOptions,
    offset,
    stride
  };
}

function resolveDoublePrecisionShaderAttributes(baseAccessor, shaderAttributeOptions) {
  const resolvedOptions = resolveShaderAttribute(baseAccessor, shaderAttributeOptions);

  return {
    high: resolvedOptions,
    low: {
      ...resolvedOptions,
      offset: resolvedOptions.offset + baseAccessor.size * 4
    }
  };
}

export default class DataColumn {
  /* eslint-disable max-statements */
  constructor(gl, opts) {
    this.gl = gl;
    this.id = opts.id;
    this.size = opts.size;

    const logicalType = opts.logicalType || opts.type;
    const doublePrecision = logicalType === GL.DOUBLE;

    let {defaultValue} = opts;
    defaultValue = Number.isFinite(defaultValue)
      ? [defaultValue]
      : defaultValue || new Array(this.size).fill(0);
    opts.defaultValue = defaultValue;

    let bufferType = logicalType;
    if (doublePrecision) {
      bufferType = GL.FLOAT;
    } else if (!bufferType && opts.isIndexed) {
      bufferType =
        gl && hasFeature(gl, FEATURES.ELEMENT_INDEX_UINT32) ? GL.UNSIGNED_INT : GL.UNSIGNED_SHORT;
    } else if (!bufferType) {
      bufferType = GL.FLOAT;
    }
    opts.logicalType = logicalType;
    opts.type = bufferType;

    // This is the attribute type defined by the layer
    // If an external buffer is provided, this.type may be overwritten
    // But we always want to use defaultType for allocation
    let defaultType = glArrayFromType(logicalType || bufferType || GL.FLOAT);
    this.shaderAttributes = {};
    this.doublePrecision = doublePrecision;

    // `fp64: false` tells a double-precision attribute to allocate Float32Arrays
    // by default when using auto-packing. This is more efficient in use cases where
    // high precision is unnecessary, but the `64Low` attribute is still required
    // by the shader.
    if (doublePrecision && opts.fp64 === false) {
      defaultType = Float32Array;
    }
    opts.bytesPerElement = defaultType.BYTES_PER_ELEMENT;

    this.defaultType = defaultType;
    this.value = null;
    this.settings = opts;
    this.state = {
      externalBuffer: null,
      bufferAccessor: opts,
      allocatedValue: null,
      constant: false
    };
    this._buffer = null;

    this.setData(opts);
  }
  /* eslint-enable max-statements */

  get buffer() {
    if (!this._buffer) {
      const {isIndexed, type} = this.settings;
      this._buffer = new Buffer(this.gl, {
        id: this.id,
        target: isIndexed ? GL.ELEMENT_ARRAY_BUFFER : GL.ARRAY_BUFFER,
        accessor: {type}
      });
    }
    return this._buffer;
  }

  get byteOffset() {
    const accessor = this.getAccessor();
    if (accessor.vertexOffset) {
      return accessor.vertexOffset * getStride(accessor);
    }
    return 0;
  }

  delete() {
    if (this._buffer) {
      this._buffer.delete();
      this._buffer = null;
    }
    typedArrayManager.release(this.state.allocatedValue);
  }

  getShaderAttributes(id, options) {
    if (this.doublePrecision) {
      const shaderAttributes = {};
      const isBuffer64Bit = this.value instanceof Float64Array;

      const doubleShaderAttributeDefs = resolveDoublePrecisionShaderAttributes(
        this.getAccessor(),
        options || {}
      );

      shaderAttributes[id] = new ShaderAttribute(this, doubleShaderAttributeDefs.high);
      shaderAttributes[`${id}64Low`] = isBuffer64Bit
        ? new ShaderAttribute(this, doubleShaderAttributeDefs.low)
        : new Float32Array(this.size); // use constant for low part if buffer is 32-bit
      return shaderAttributes;
    }
    if (options) {
      const shaderAttributeDef = resolveShaderAttribute(this.getAccessor(), options);
      return {[id]: new ShaderAttribute(this, shaderAttributeDef)};
    }
    return {[id]: this};
  }

  getBuffer() {
    if (this.state.constant) {
      return null;
    }
    return this.state.externalBuffer || this._buffer;
  }

  getValue() {
    if (this.state.constant) {
      return this.value;
    }
    return [this.getBuffer(), this.getAccessor()];
  }

  getAccessor() {
    return this.state.bufferAccessor;
  }

  // returns true if success
  // eslint-disable-next-line max-statements
  setData(opts) {
    const {state} = this;
    if (ArrayBuffer.isView(opts)) {
      opts = {value: opts};
    } else if (opts instanceof Buffer) {
      opts = {buffer: opts};
    }

    const accessor = {...this.settings, ...opts};
    state.bufferAccessor = accessor;

    if (opts.constant) {
      // set constant
      let value = opts.value;
      value = this._normalizeValue(value, [], 0);
      if (this.settings.normalized) {
        value = this._normalizeConstant(value);
      }
      const hasChanged = !state.constant || !this._areValuesEqual(value, this.value);

      if (!hasChanged) {
        return false;
      }
      state.externalBuffer = null;
      state.constant = true;
      this.value = value;
    } else if (opts.buffer) {
      const buffer = opts.buffer;
      state.externalBuffer = buffer;
      state.constant = false;
      this.value = opts.value;
      const isBuffer64Bit = opts.value instanceof Float64Array;

      // Copy the type of the buffer into the accessor
      accessor.type = opts.type || buffer.accessor.type;
      accessor.bytesPerElement = buffer.accessor.BYTES_PER_ELEMENT * (isBuffer64Bit ? 2 : 1);
      accessor.stride = getStride(accessor);
    } else if (opts.value) {
      this._checkExternalBuffer(opts);

      let value = opts.value;
      state.externalBuffer = null;
      state.constant = false;
      this.value = value;

      accessor.bytesPerElement = value.BYTES_PER_ELEMENT;
      accessor.stride = getStride(accessor);

      const {buffer, byteOffset} = this;

      if (this.doublePrecision && value instanceof Float64Array) {
        value = toDoublePrecisionArray(value, accessor);
      }
      // TODO: support offset in buffer.setData?
      if (buffer.byteLength < value.byteLength + byteOffset) {
        // Over allocation is required because shader attributes may have bigger offsets
        buffer.reallocate((value.byteLength + byteOffset) * 2);
      }
      // Hack: force Buffer to infer data type
      buffer.setAccessor(null);
      buffer.subData({data: value, offset: byteOffset});
      accessor.type = opts.type || buffer.accessor.type;
    }

    return true;
  }

  updateSubBuffer(opts = {}) {
    const {value} = this;
    const {startOffset = 0, endOffset} = opts;
    this.buffer.subData({
      data:
        this.doublePrecision && value instanceof Float64Array
          ? toDoublePrecisionArray(value, {
              size: this.size,
              startIndex: startOffset,
              endIndex: endOffset
            })
          : value.subarray(startOffset, endOffset),
      offset: startOffset * value.BYTES_PER_ELEMENT + this.byteOffset
    });
  }

  allocate({numInstances, copy = false}) {
    const {state} = this;
    const oldValue = state.allocatedValue;

    // Allocate at least one element to ensure a valid buffer
    const value = typedArrayManager.allocate(oldValue, numInstances + 1, {
      size: this.size,
      type: this.defaultType,
      copy
    });
    this.value = value;
    const {buffer, byteOffset} = this;

    if (buffer.byteLength < value.byteLength + byteOffset) {
      buffer.reallocate(value.byteLength + byteOffset);

      if (copy && oldValue) {
        // Upload the full existing attribute value to the GPU, so that updateBuffer
        // can choose to only update a partial range.
        // TODO - copy old buffer to new buffer on the GPU
        buffer.subData({
          data:
            oldValue instanceof Float64Array ? toDoublePrecisionArray(oldValue, this) : oldValue,
          offset: byteOffset
        });
      }
    }

    state.allocatedValue = value;
    state.constant = false;
    state.externalBuffer = null;
    state.bufferAccessor = this.settings;
    return true;
  }

  // PRIVATE HELPER METHODS
  _checkExternalBuffer(opts) {
    const {value} = opts;
    if (!opts.constant && value) {
      const ArrayType = this.defaultType;

      let illegalArrayType = false;
      if (this.doublePrecision) {
        // not 32bit or 64bit
        illegalArrayType = value.BYTES_PER_ELEMENT < 4;
      }
      if (illegalArrayType) {
        throw new Error(`Attribute ${this.id} does not support ${value.constructor.name}`);
      }
      if (!(value instanceof ArrayType) && this.settings.normalized && !('normalized' in opts)) {
        log.warn(`Attribute ${this.id} is normalized`)();
      }
    }
  }

  // https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer
  _normalizeConstant(value) {
    switch (this.settings.type) {
      case GL.BYTE:
        // normalize [-128, 127] to [-1, 1]
        return new Float32Array(value).map(x => ((x + 128) / 255) * 2 - 1);

      case GL.SHORT:
        // normalize [-32768, 32767] to [-1, 1]
        return new Float32Array(value).map(x => ((x + 32768) / 65535) * 2 - 1);

      case GL.UNSIGNED_BYTE:
        // normalize [0, 255] to [0, 1]
        return new Float32Array(value).map(x => x / 255);

      case GL.UNSIGNED_SHORT:
        // normalize [0, 65535] to [0, 1]
        return new Float32Array(value).map(x => x / 65535);

      default:
        // No normalization for gl.FLOAT and gl.HALF_FLOAT
        return value;
    }
  }

  /* check user supplied values and apply fallback */
  _normalizeValue(value, out, start) {
    const {defaultValue, size} = this.settings;

    if (Number.isFinite(value)) {
      out[start] = value;
      return out;
    }
    if (!value) {
      out[start] = defaultValue[0];
      return out;
    }

    // Important - switch cases are 5x more performant than a for loop!
    /* eslint-disable no-fallthrough, default-case */
    switch (size) {
      case 4:
        out[start + 3] = Number.isFinite(value[3]) ? value[3] : defaultValue[3];
      case 3:
        out[start + 2] = Number.isFinite(value[2]) ? value[2] : defaultValue[2];
      case 2:
        out[start + 1] = Number.isFinite(value[1]) ? value[1] : defaultValue[1];
      case 1:
        out[start + 0] = Number.isFinite(value[0]) ? value[0] : defaultValue[0];
        break;

      default:
        // In the rare case where the attribute size > 4, do it the slow way
        // This is used for e.g. transform matrices
        let i = size;
        while (--i >= 0) {
          out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
        }
    }

    return out;
  }

  _areValuesEqual(value1, value2) {
    if (!value1 || !value2) {
      return false;
    }
    const {size} = this;
    for (let i = 0; i < size; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
}
