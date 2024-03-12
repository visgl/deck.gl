/* eslint-disable complexity, max-statements, max-params */
import type {Device,
  Buffer,
  Framebuffer,
  Texture} from '@luma.gl/core';
import {Timeline, BufferTransform} from '@luma.gl/engine';
import {
  padBuffer,
  getAttributeTypeFromSize,
  getAttributeBufferLength,
  getFloat32VertexFormat,
  cycleBuffers
} from './gpu-transition-utils';
import Attribute from '../lib/attribute/attribute';
import Transition from './transition';

import type {SpringTransitionSettings} from './transition-settings';
import type {NumericArray, TypedArray} from '../types/types';
import type {GPUTransition} from './gpu-transition';

export default class GPUSpringTransition implements GPUTransition {
  device: Device;
  type = 'spring';
  attributeInTransition: Attribute;

  private settings?: SpringTransitionSettings;
  private attribute: Attribute;
  private transition: Transition;
  private currentStartIndices: NumericArray | null;
  private currentLength: number;
  private texture: Texture;
  private framebuffer: Framebuffer;
  private transform: BufferTransform;
  private buffers: Buffer[];

  constructor({
    device,
    attribute,
    timeline
  }: {
    device: Device;
    attribute: Attribute;
    timeline: Timeline;
  }) {
    this.device = device;
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    // this is the attribute we return during the transition - note: if it is a constant
    // attribute, it will be converted and returned as a regular attribute
    // `attribute.settings` is the original options passed when constructing the attribute.
    // This ensures that we set the proper `doublePrecision` flag and shader attributes.
    this.attributeInTransition = new Attribute(device, attribute.settings);
    // Placeholder value - necessary for generating the correct buffer layout
    this.attributeInTransition.setData(
      attribute.value instanceof Float64Array ? new Float64Array(0) : new Float32Array(0)
    );
    this.currentStartIndices = attribute.startIndices;
    // storing currentLength because this.buffer may be larger than the actual length we want to use
    // this is because we only reallocate buffers when they grow, not when they shrink,
    // due to performance costs
    this.currentLength = 0;
    this.texture = getTexture(device);
    this.framebuffer = getFramebuffer(device, this.texture);
    this.buffers = [
      device.createBuffer({byteLength: 0}),
      device.createBuffer({byteLength: 0})
    ];
    this.transform = getTransform(device, attribute);
  }

  get inProgress(): boolean {
    return this.transition.inProgress;
  }

  // this is called when an attribute's values have changed and
  // we need to start animating towards the new values
  // this also correctly resizes / pads the transform's buffers
  // in case the attribute's buffer has changed in length or in
  // startIndices
  start(transitionSettings: SpringTransitionSettings, numInstances: number): void {
    this.settings = transitionSettings;
    const {buffers, attribute} = this;
    const toLength = getAttributeBufferLength(attribute, numInstances);

    for (let i = 0; i < 2; i++) {
      const paddedBuffer = padBuffer({
        buffer: buffers[i],
        attribute,
        fromLength: this.currentLength,
        toLength,
        fromStartIndices: this.currentStartIndices,
        getData: transitionSettings.enter
      });
      if (paddedBuffer !== buffers[i]) {
        buffers[i].destroy();
        buffers[i] = paddedBuffer;
      }
    }
    if (!buffers[2] || buffers[2].byteLength < buffers[0].byteLength) {
      buffers[2]?.destroy();
      buffers[2] = this.device.createBuffer({
        byteLength: buffers[0].byteLength,
        usage: buffers[0].usage
      });
    }

    this.currentStartIndices = attribute.startIndices;
    this.currentLength = toLength;
    this.attributeInTransition.setData({
      buffer: buffers[1],
      // Retain placeholder value to generate correct shader layout
      value: this.attributeInTransition.value as NumericArray
    });

    // when an attribute changes values, a new transition is started. These
    // are properties that we have to store on this.transition but can change
    // when new transitions are started, so we have to keep them up-to-date.
    // this.transition.start() takes the latest settings and updates them.
    this.transition.start({...transitionSettings, duration: Infinity});

    const {model} = this.transform;
    model.setVertexCount(Math.floor(toLength / attribute.size));
    if (attribute.isConstant) {
      model.setConstantAttributes({aTo: attribute.value as TypedArray});
    } else {
      model.setAttributes({aTo: attribute.getBuffer()!});
    }
  }

  update() {
    const {buffers, transform, framebuffer, transition} = this;
    const updated = transition.update();
    if (!updated) {
      return false;
    }
    const settings = this.settings as SpringTransitionSettings;

    transform.model.setAttributes({
      aPrev: buffers[0],
      aCur: buffers[1]
    });
    this.transform.transformFeedback.setBuffers({vNext: buffers[2]});
    transform.model.setUniforms({
      stiffness: settings.stiffness,
      damping: settings.damping
    });
    transform.run({
      framebuffer,
      discard: false,
      parameters: {viewport: [0, 0, 1, 1]},
      clearColor: [0, 0, 0, 0]
    });

    cycleBuffers(buffers);
    this.attributeInTransition.setData({
      buffer: buffers[1],
      // Retain placeholder value to generate correct shader layout
      value: this.attributeInTransition.value as NumericArray
    });

    const isTransitioning = this.device.readPixelsToArrayWebGL(framebuffer)[0] > 0;

    if (!isTransitioning) {
      transition.end();
    }

    return true;
  }

  cancel() {
    this.transition.cancel();
    this.transform.destroy();
    for (const buffer of this.buffers) {
      buffer.destroy();
    }
    this.buffers.length = 0;
    this.texture.destroy();
    this.framebuffer.destroy();
  }
}

const vs = `\
#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

uniform float stiffness;
uniform float damping;
in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE spring = delta * stiffness;
  ATTRIBUTE_TYPE damper = velocity * -1.0 * damping;
  return spring + damper + velocity + cur;
}

void main(void) {
  bool isTransitioning = length(aCur - aPrev) > EPSILON || length(aTo - aCur) > EPSILON;
  vIsTransitioningFlag = isTransitioning ? 1.0 : 0.0;

  vNext = getNextValue(aCur, aPrev, aTo);
  gl_Position = vec4(0, 0, 0, 1);
  gl_PointSize = 100.0;
}
`;

const fs = `\
#version 300 es
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

in float vIsTransitioningFlag;

out vec4 fragColor;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  fragColor = vec4(1.0);
}`;

function getTransform(device: Device, attribute: Attribute): BufferTransform {
  const attributeType = getAttributeTypeFromSize(attribute.size);
  const format = getFloat32VertexFormat(attribute.size);
  return new BufferTransform(device, {
    vs,
    fs,
    bufferLayout: [
      {name: 'aPrev', format},
      {name: 'aCur', format},
      {name: 'aTo', format: attribute.getBufferLayout().attributes![0].format}
    ],
    varyings: ['vNext'],
    defines: {ATTRIBUTE_TYPE: attributeType},
    parameters: {
      depthCompare: 'always',
      blendColorOperation: 'max',
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one',
      blendAlphaOperation: 'max',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one'
    }
  });
}

function getTexture(device: Device): Texture {
  return device.createTexture({
    data: new Uint8Array(4),
    format: 'rgba8unorm',
    mipmaps: false,
    // dataFormat: GL.RGBA,
    width: 1,
    height: 1
  });
}

function getFramebuffer(device: Device, texture: Texture): Framebuffer {
  return device.createFramebuffer({
    id: 'spring-transition-is-transitioning-framebuffer',
    width: 1,
    height: 1,
    colorAttachments: [texture]
  });
}
