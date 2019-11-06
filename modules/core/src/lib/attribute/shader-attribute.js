/* eslint-disable complexity */
import {_Accessor as Accessor} from '@luma.gl/core';

/* This class creates a luma.gl-compatible "view" on top of a DataColumn instance */
export default class ShaderAttribute {
  constructor(dataColumn, opts) {
    // Options that cannot be changed later
    this.id = opts.id;
    this.opts = opts;
    this.source = dataColumn;

    const {offset = 0} = opts;
    this.elementOffset = offset / Accessor.getBytesPerElement(opts);
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
      const index = this.elementOffset;
      for (let i = 0; i < size; ++i) {
        constantValue[i] = value[index + i];
      }
    }

    return constantValue;
  }

  getAccessor() {
    const {source} = this;
    const buffer = source.getBuffer();
    const props = {
      ...source.settings,
      ...source.state.externalAccessor,
      ...this.opts,
      ...(buffer && buffer.accessor)
    };
    return new Accessor(props);
  }
}
