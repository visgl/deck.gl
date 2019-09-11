import GL from '@luma.gl/constants';
import {Buffer, Transform} from '@luma.gl/core';
import Attribute from '../lib/attribute';
import {
  padBuffer,
  getAttributeTypeFromSize,
  getSourceBufferAttribute,
  getAttributeBufferLength,
  cycleBuffers
} from '../lib/attribute-transition-utils';
import Transition from './transition';
import assert from '../utils/assert';

export default class GPUInterpolationTransition {
  constructor({gl, attribute, timeline}) {
    this.type = 'interpolation';
    this.transition = new Transition({timeline});
    this.attribute = attribute;
    // this is the attribute we return during the transition - note: if it is a constant
    // attribute, it will be converted and returned as a regular attribute
    // `attribute.userData` is the original options passed when constructing the attribute.
    // This ensures that we set the proper `doublePrecision` flag and shader attributes.
    this.attributeInTransition = new Attribute(gl, attribute.userData);
    this.currentBufferLayout = attribute.bufferLayout;
    // storing currentLength because this.buffer may be larger than the actual length we want to use
    // this is because we only reallocate buffers when they grow, not when they shrink,
    // due to performance costs
    this.currentLength = 0;
    this.transform = null;
    const usage = GL.DYNAMIC_COPY;
    const byteLength = 0;
    this.buffers = [
      new Buffer(gl, {byteLength, usage}), // from
      new Buffer(gl, {byteLength, usage}) // current
    ];
  }

  isTransitioning() {
    return Boolean(this.buffers.length);
  }

  getTransitioningAttribute() {
    return this.attributeInTransition;
  }

  // this is called when an attribute's values have changed and
  // we need to start animating towards the new values
  // this also correctly resizes / pads the transform's buffers
  // in case the attribute's buffer has changed in length or in
  // bufferLayout
  start(gl, transitionSettings, numInstances) {
    assert(
      transitionSettings.duration > 0,
      'transition setting must have a duration greater than 0'
    );
    // Alternate between two buffers when new transitions start.
    // Last destination buffer is used as an attribute (from state),
    // And the other buffer is now the current buffer.
    cycleBuffers(this.buffers);

    const padBufferOpts = {
      numInstances,
      attribute: this.attribute,
      fromLength: this.currentLength,
      fromBufferLayout: this.currentBufferLayout,
      getData: transitionSettings.enter
    };

    for (const buffer of this.buffers) {
      padBuffer({buffer, ...padBufferOpts});
    }

    this.currentBufferLayout = this.attribute.bufferLayout;
    this.currentLength = getAttributeBufferLength(this.attribute, numInstances);
    this.attributeInTransition.update({
      buffer: this.buffers[1],
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: this.attribute.value
    });

    this.transition.start(transitionSettings);

    this.transform = this.transform || new Transform(gl, getShaders(this.attribute.size));
    this.transform.update({
      elementCount: Math.floor(this.currentLength / this.attribute.size),
      sourceBuffers: {
        aFrom: this.buffers[0],
        aTo: getSourceBufferAttribute(gl, this.attribute)
      },
      feedbackBuffers: {
        vCurrent: this.buffers[1]
      }
    });
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
    while (this.buffers.length) {
      this.buffers.pop().delete();
    }
  }
}

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
  const attributeType = getAttributeTypeFromSize(attributeSize);
  return {
    vs,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  };
}
