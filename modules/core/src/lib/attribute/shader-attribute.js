/* eslint-disable complexity */
import {_Accessor as Accessor} from '@luma.gl/core';

export default class ShaderAttribute {
  constructor(opts) {
    // Options that cannot be changed later
    this.id = opts.id;

    // Initialize the attribute descriptor, with WebGL and metadata fields
    this.value = null;
    this.buffer = null;
    this.setAccessor(opts);
  }

  setBuffer(buffer, value) {
    this.buffer = buffer;
    this.value = value;
    this.type = buffer.accessor.type;
  }

  setConstantValue(value) {
    this.buffer = null;
    let constantValue = value;

    const {size} = this;
    if (value.length !== size) {
      constantValue = new Float32Array(size);
      // initiate offset values
      const index = this.elementOffset;
      for (let i = 0; i < size; ++i) {
        constantValue[i] = value[index + i];
      }
    }

    this.value = constantValue;
  }

  getValue() {
    if (this.buffer) {
      return [this.buffer, this];
    }
    if (this.value) {
      return this.value;
    }
    return null;
  }

  // Sets all accessor props except type
  // TODO - store on `this.accessor`
  setAccessor(opts) {
    const {
      // accessor props
      type = this.type,
      size = this.size,
      offset = this.offset || 0,
      stride = this.stride || 0,
      normalized = this.normalized || false,
      integer = this.integer || false,
      divisor = this.divisor || 0
    } = opts;

    this.type = type;
    this.size = size;
    this.offset = offset;
    this.elementOffset = offset / Accessor.getBytesPerElement(this);
    this.stride = stride;
    this.normalized = normalized;
    this.integer = integer;
    this.divisor = divisor;
  }
}
