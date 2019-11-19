/* eslint-disable complexity */
import GL from '@luma.gl/constants';
import {hasFeature, FEATURES, Buffer} from '@luma.gl/core';
import ShaderAttribute from './shader-attribute';
import {glArrayFromType} from './gl-utils';
import typedArrayManager from '../../utils/typed-array-manager';
import {toDoublePrecisionArray} from '../../utils/math-utils';
import log from '../../utils/log';

function addDoublePrecisionAttributes(id, baseAccessor, shaderAttributeOptions) {
  const doubleShaderAttributeDefs = {};
  const offset =
    'offset' in shaderAttributeOptions ? shaderAttributeOptions.offset : baseAccessor.offset;
  const stride =
    'stride' in shaderAttributeOptions ? shaderAttributeOptions.stride : baseAccessor.size * 4;

  doubleShaderAttributeDefs[`${id}32`] = Object.assign({}, shaderAttributeOptions, {
    offset,
    stride
  });
  doubleShaderAttributeDefs[`${id}64`] = Object.assign({}, shaderAttributeOptions, {
    offset: offset * 2,
    stride: stride * 2
  });
  doubleShaderAttributeDefs[`${id}64Low`] = Object.assign({}, shaderAttributeOptions, {
    offset: offset * 2 + stride,
    stride: stride * 2
  });
  return doubleShaderAttributeDefs;
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
    this.defaultType = glArrayFromType(logicalType || bufferType || GL.FLOAT);
    this.shaderAttributes = {};
    this.doublePrecision = doublePrecision;

    // `fp64: false` tells a double-precision attribute to allocate Float32Arrays
    // by default when using auto-packing. This is more efficient in use cases where
    // high precision is unnecessary, but the `64Low` attribute is still required
    // by the shader.
    if (doublePrecision && opts.fp64 === false) {
      this.defaultType = Float32Array;
    }

    this.value = null;
    this.settings = Object.assign({}, opts, {
      offset: opts.offset || 0,
      defaultValue
    });
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
        type
      });
    }
    return this._buffer;
  }

  get byteOffset() {
    const {offset} = this.settings;
    return this.doublePrecision && this.value instanceof Float64Array ? offset * 2 : offset;
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

      const doubleShaderAttributeDefs = addDoublePrecisionAttributes(
        id,
        this.getAccessor(),
        options || {}
      );

      shaderAttributes[id] = new ShaderAttribute(
        this,
        doubleShaderAttributeDefs[isBuffer64Bit ? `${id}64` : `${id}32`]
      );
      const shaderAttributeLowPartName = `${id}64Low`;
      shaderAttributes[shaderAttributeLowPartName] = isBuffer64Bit
        ? new ShaderAttribute(this, doubleShaderAttributeDefs[shaderAttributeLowPartName])
        : new Float32Array(this.size); // use constant for low part if buffer is 32-bit
      return shaderAttributes;
    }

    return {[id]: options ? new ShaderAttribute(this, options) : this};
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

    if (opts.constant) {
      // set constant
      let value = opts.value;
      value = this._normalizeValue(value);
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
      state.externalBuffer = opts.buffer;
      state.constant = false;
      this.value = opts.value;
      opts.type = opts.buffer.accessor.type;
    } else if (opts.value) {
      this._checkExternalBuffer(opts);

      let value = opts.value;
      state.externalBuffer = null;
      state.constant = false;
      this.value = value;
      const {buffer, byteOffset} = this;

      if (this.doublePrecision && value instanceof Float64Array) {
        value = toDoublePrecisionArray(value, this);
      }
      // TODO: support offset in buffer.setData?
      if (buffer.byteLength < value.byteLength + byteOffset) {
        buffer.reallocate(value.byteLength + byteOffset);
      }
      // Hack: force Buffer to infer data type
      buffer.setAccessor(null);
      buffer.subData({data: value, offset: byteOffset});
      opts.type = buffer.accessor.type;
    }

    state.bufferAccessor = {...this.settings, ...opts};
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
  _normalizeValue(value, out = [], start = 0) {
    const {defaultValue} = this.settings;

    if (!Array.isArray(value) && !ArrayBuffer.isView(value)) {
      out[start] = Number.isFinite(value) ? value : defaultValue[0];
      return out;
    }

    let i = this.size;
    while (--i >= 0) {
      out[start + i] = Number.isFinite(value[i]) ? value[i] : defaultValue[i];
    }
    return out;
  }

  _areValuesEqual(value1, value2, size = this.size) {
    if (!value1 || !value2) {
      return false;
    }
    for (let i = 0; i < size; i++) {
      if (value1[i] !== value2[i]) {
        return false;
      }
    }
    return true;
  }
}
