/* eslint-disable complexity */
import GL from '@luma.gl/constants';
import {hasFeature, FEATURES, Buffer} from '@luma.gl/core';
import ShaderAttribute from './shader-attribute';
import typedArrayManager from '../../utils/typed-array-manager';
import {toDoublePrecisionArray} from '../../utils/math-utils';
import log from '../../utils/log';

function addDoublePrecisionAttributes(attribute, shaderAttributeDefs) {
  const doubleShaderAttributeDefs = {};
  for (const shaderAttributeName in shaderAttributeDefs) {
    const def = shaderAttributeDefs[shaderAttributeName];
    const offset = 'offset' in def ? def.offset : attribute.offset || 0;
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
    // high precision is unnecessary, but the `64xyLow` attribute is still required
    // by the shader.
    if (doublePrecision && opts.fp64 === false) {
      this.defaultType = Float32Array;
    }

    let shaderAttributeDefs = opts.shaderAttributes || {[this.id]: {}};
    this.shaderAttributeNames = Object.keys(shaderAttributeDefs);
    if (doublePrecision) {
      shaderAttributeDefs = addDoublePrecisionAttributes(opts, shaderAttributeDefs);
    }
    this.shaderAttributeDefs = shaderAttributeDefs;

    for (const shaderAttributeName in shaderAttributeDefs) {
      // Initialize the attribute descriptor, with WebGL and metadata fields
      const shaderAttribute = new ShaderAttribute(this, {
        ...shaderAttributeDefs[shaderAttributeName],
        type: bufferType,
        id: shaderAttributeName
      });
      this.shaderAttributes[shaderAttributeName] = shaderAttribute;
    }

    this.value = null;
    this.settings = Object.assign({}, opts, {
      defaultValue
    });
    this.state = {
      externalBuffer: null,
      externalAccessor: null,
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

  delete() {
    if (this._buffer) {
      this._buffer.delete();
      this._buffer = null;
    }
    typedArrayManager.release(this.state.allocatedValue);
  }

  getShaderAttributes() {
    if (this.doublePrecision) {
      const shaderAttributes = {};
      const isBuffer64Bit = this.value instanceof Float64Array;
      for (const shaderAttributeName of this.shaderAttributeNames) {
        shaderAttributes[shaderAttributeName] = this.shaderAttributes[
          isBuffer64Bit ? `${shaderAttributeName}64` : `${shaderAttributeName}32`
        ];
        const shaderAttributeLowPartName = `${shaderAttributeName}64xyLow`;
        shaderAttributes[shaderAttributeLowPartName] = isBuffer64Bit
          ? this.shaderAttributes[shaderAttributeLowPartName]
          : new Float32Array(this.size); // use constant for low part if buffer is 32-bit
      }
      return shaderAttributes;
    }

    return this.shaderAttributes;
  }

  getBuffer() {
    if (this.state.constant) {
      return null;
    }
    return this.state.externalBuffer || this._buffer;
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
      const hasChanged = !this._areValuesEqual(value, this.value);

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
    } else if (opts.value) {
      this._checkExternalBuffer(opts);

      let value = opts.value;
      state.externalBuffer = null;
      state.constant = false;
      this.value = value;

      if (this.doublePrecision) {
        if (value instanceof Float64Array) {
          value = toDoublePrecisionArray(value, this);
        }
      }

      this.buffer.setData(value);
    }

    state.externalAccessor = opts;
    return true;
  }

  updateSubBuffer(opts = {}) {
    const {value} = this;
    const {startOffset = 0, endOffset} = opts;
    this.buffer.subData({
      data: this.doublePrecision
        ? toDoublePrecisionArray(value, {
            size: this.size,
            startIndex: startOffset,
            endIndex: endOffset
          })
        : value.subarray(startOffset, endOffset),
      offset: startOffset * value.BYTES_PER_ELEMENT
    });
  }

  allocate({numInstances, copy = false}) {
    const {state} = this;
    const oldValue = state.allocatedValue;

    // Allocate at least one element to ensure a valid buffer
    this.value = typedArrayManager.allocate(oldValue, numInstances + 1, {
      size: this.size,
      type: this.defaultType,
      copy
    });

    if (this.buffer.byteLength < this.value.byteLength) {
      this.buffer.reallocate(this.value.byteLength);

      if (copy && oldValue) {
        // Upload the full existing attribute value to the GPU, so that updateBuffer
        // can choose to only update a partial range.
        // TODO - copy old buffer to new buffer on the GPU
        this.buffer.subData({
          data:
            oldValue instanceof Float64Array
              ? toDoublePrecisionArray(oldValue, {size: this.size})
              : oldValue
        });
      }
    }

    state.allocatedValue = this.value;
    state.constant = false;
    state.externalBuffer = null;
    state.externalAccessor = null;
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
      } else {
        illegalArrayType =
          value.BYTES_PER_ELEMENT !== ArrayType.BYTES_PER_ELEMENT &&
          // Shader attributes have hard-coded offsets and strides
          // TODO - switch to element offsets and element strides?
          Object.values(this.shaderAttributes).some(
            attribute => attribute.opts.offset || attribute.opts.stride
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
