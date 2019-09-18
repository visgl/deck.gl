/* eslint-disable complexity, max-statements, max-params */
import GL from '@luma.gl/constants';
import {Buffer, Transform} from '@luma.gl/core';
import {
  padBuffer,
  getAttributeTypeFromSize,
  getSourceBufferAttribute,
  getAttributeBufferLength,
  cycleBuffers
} from '../lib/attribute-transition-utils';
import Attribute from '../lib/attribute';
import Transition from './transition';

export default class GPUSpringTransition {
  constructor({gl, attribute, timeline}) {
    this.gl = gl;
    this.type = 'spring';
    this.transition = new Transition(timeline);
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
      new Buffer(gl, {byteLength, usage}), // previous
      new Buffer(gl, {byteLength, usage}), // current
      new Buffer(gl, {byteLength, usage}) // next
    ];
  }

  // TODO: implement a check where each vertex renders an `isStillTransitioning` boolean to
  // a 1x1 framebuffer
  isTransitioning() {
    return true;
  }

  // this will never return a constant attribute, no matter what attribute was passed in
  getTransitioningAttribute() {
    return this.attributeInTransition;
  }

  // this is called when an attribute's values have changed and
  // we need to start animating towards the new values
  // this also correctly resizes / pads the transform's buffers
  // in case the attribute's buffer has changed in length or in
  // bufferLayout
  start(transitionSettings, numInstances) {
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

    // when an attribute changes values, a new transition is started. These
    // are properties that we have to store on this instance but can change
    // when new transitions are started, so we have to keep them up-to-date. :(
    this.transition.start(transitionSettings);

    this.transform = this.transform || new Transform(this.gl, getShaders(this.attribute.size));
    this.transform.update({
      elementCount: Math.floor(this.currentLength / this.attribute.size),
      sourceBuffers: {
        aTo: getSourceBufferAttribute(this.gl, this.attribute)
      }
    });
  }

  update() {
    const updated = this.transition.update();
    if (!updated) {
      return false;
    }

    // TODO: fire an onStart() event here if the transition has just started

    this.transform.update({
      sourceBuffers: {
        aPrev: this.buffers[0],
        aCur: this.buffers[1]
      },
      feedbackBuffers: {
        vNext: this.buffers[2]
      }
    });
    this.transform.run({
      uniforms: {
        stiffness: this.transition.settings.stiffness,
        damping: this.transition.settings.damping
      }
    });
    cycleBuffers(this.buffers);
    this.attributeInTransition.update({buffer: this.buffers[1]});

    // TODO: fire the event here if the transition has just ended
    // transition.end();

    return true;
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
#define SHADER_NAME spring-transition-vertex-shader

uniform float stiffness;
uniform float damping;
attribute ATTRIBUTE_TYPE aPrev;
attribute ATTRIBUTE_TYPE aCur;
attribute ATTRIBUTE_TYPE aTo;
varying ATTRIBUTE_TYPE vNext;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE spring = delta * stiffness;
  ATTRIBUTE_TYPE damper = velocity * -1.0 * damping;
  return spring + damper + velocity + cur;
}

void main(void) {
  vNext = getNextValue(aCur, aPrev, aTo);
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
    varyings: ['vNext']
  };
}
