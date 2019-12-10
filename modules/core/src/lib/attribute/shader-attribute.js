/* eslint-disable complexity */

/* This class creates a luma.gl-compatible "view" on top of a DataColumn instance */
export default class ShaderAttribute {
  constructor(dataColumn, opts) {
    // Options that cannot be changed later
    this.opts = opts;
    this.source = dataColumn;
  }

  get value() {
    return this.source.value;
  }

  getValue() {
    const buffer = this.source.getBuffer();
    const accessor = this.getAccessor();
    if (buffer) {
      return [buffer, accessor];
    }

    const {value} = this.source;
    const {size} = accessor;
    let constantValue = value;

    if (value && value.length !== size) {
      constantValue = new Float32Array(size);
      // initiate offset values
      const index = accessor.elementOffset || 0; // element offset
      for (let i = 0; i < size; ++i) {
        constantValue[i] = value[index + i];
      }
    }

    return constantValue;
  }

  getAccessor() {
    return {
      // source data accessor
      ...this.source.getAccessor(),
      // shader attribute overrides
      ...this.opts
    };
  }
}
