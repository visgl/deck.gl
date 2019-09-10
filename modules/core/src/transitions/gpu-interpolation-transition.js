import GL from '@luma.gl/constants';
import {Buffer, Transform} from '@luma.gl/core';
import BaseAttribute from '../lib/base-attribute';
import Attribute from '../lib/attribute';
import {padBuffer} from '../lib/attribute-transition-utils';
import Transition from './transition';
import assert from '../utils/assert';

export default class GPUInterpolationTransition {
  constructor({gl, attribute, timeline}) {
    this.transition = new Transition({timeline});
    this.attribute = attribute;
    // `attribute.userData` is the original options passed when constructing the attribute.
    // This ensures that we set the proper `doublePrecision` flag and shader attributes.
    this.attributeInTransition = new Attribute(gl, attribute.userData);
    this.bufferLayout = attribute.bufferLayout;
    // storing curLength because this.buffer may be larger than the actual length we want to use
    // this is because we only reallocate buffers when they grow, not when they shrink,
    // due to performance costs
    this.curLength = null;
    this.transform = null;
    this.buffer = null;
    this._swapBuffer = null;
  }

  isTransitioning() {
    return Boolean(this.buffer);
  }

  getTransitioningAttribute() {
    return this.attributeInTransition;
  }

  // Start a new transition using the current settings
  // Updates transition state and from/to buffer
  start(gl, settings, numInstances) {
    assert(settings.duration > 0);
    const {fromState, toState, buffer} = this._setupBuffers(gl, settings, numInstances);
    this.buffer = buffer;
    const elementCount = Math.floor(this.curLength / this.attribute.size);
    this.transition.start(settings);
    if (this.transform) {
      this.transform.update({
        ...getBuffers({fromState, toState, buffer}),
        elementCount
      });
    } else {
      this.transform = new Transform(gl, {
        elementCount,
        ...getShaders(this.attribute.size),
        ...getBuffers({fromState, toState, buffer})
      });
    }
  }

  update() {
    const updated = this.transition.update();
    if (updated) {
      this.transform.run({
        uniforms: {time: this.transition.time}
      });
    }
    return updated;
  }

  cancel() {
    this.transition.cancel();
    this.transform.delete();
    if (this.buffer) this.buffer.delete();
    if (this._swapBuffer) this._swapBuffer.delete();
  }

  // get current values of an attribute, clipped/padded to the size of the new buffer
  _setupBuffers(gl, settings, numInstances) {
    const {size, normalized} = this.attribute;
    const precisionMultiplier = this.attribute.doublePrecision ? 2 : 1;

    let toState;
    if (this.attribute.constant) {
      toState = new BaseAttribute(gl, {constant: true, value: this.attribute.value, size});
    } else {
      toState = new BaseAttribute(gl, {
        constant: false,
        buffer: this.attribute.getBuffer(),
        divisor: 0,
        size,
        normalized
      });
    }

    const fromState = this.buffer || toState;
    const toLength =
      (this.attribute.userData.noAlloc ? this.attribute.value.length : numInstances * size) *
      precisionMultiplier;
    const fromLength = this.curLength || toLength;

    // Alternate between two buffers when new transitions start.
    // Last destination buffer is used as an attribute (from state),
    // And the other buffer is now the destination buffer.
    let buffer = this._swapBuffer;
    this._swapBuffer = this.buffer;

    if (!buffer) {
      buffer = new Buffer(gl, {
        data: new Float32Array(toLength),
        usage: GL.DYNAMIC_COPY
      });
    } else if (buffer.getElementCount() < toLength) {
      // Pad buffers to be the same length with 32-bit floats
      buffer.reallocate(toLength * 4);
    }

    this.curLength = toLength;
    this.attributeInTransition.update({
      buffer,
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: this.attribute.value
    });

    // updates the fromState buffer in place
    padBuffer({
      fromState,
      toState,
      fromLength,
      toLength,
      size: size * precisionMultiplier,
      fromBufferLayout: this.bufferLayout,
      toBufferLayout: this.attribute.bufferLayout,
      offset: this.attribute.elementOffset * precisionMultiplier,
      getData: settings.enter
    });

    this.bufferLayout = this.attribute.bufferLayout;

    return {toState, buffer, fromState};
  }
}

const ATTRIBUTE_MAPPING = {
  1: 'float',
  2: 'vec2',
  3: 'vec3',
  4: 'vec4'
};

const vs = `
#define SHADER_NAME interpolation-transition-vertex-shader

uniform float time;
attribute ATTRIBUTE_TYPE aFrom;
attribute ATTRIBUTE_TYPE aTo;
varying ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, time);
  gl_Position = vec4(0.0);
}
`;

function getShaders(attributeSize) {
  const attributeType = ATTRIBUTE_MAPPING[attributeSize];
  return {
    vs,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  };
}

function getBuffers({fromState, toState, buffer}) {
  return {
    sourceBuffers: {
      aFrom: fromState,
      aTo: toState
    },
    feedbackBuffers: {
      vCurrent: buffer
    }
  };
}
