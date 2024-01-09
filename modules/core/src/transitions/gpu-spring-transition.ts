/* eslint-disable complexity, max-statements, max-params */
import type {Device} from '@luma.gl/core';
import {BufferTransform} from '@luma.gl/engine';
import {readPixelsToArray} from '@luma.gl/webgl';
import {GL} from '@luma.gl/constants';
import {
  padBuffer,
  getAttributeTypeFromSize,
  getAttributeBufferLength,
  getAttributeVertexFormat,
  cycleBuffers,
  SpringTransitionSettings
} from '../lib/attribute/attribute-transition-utils';
import Attribute from '../lib/attribute/attribute';
import Transition from './transition';

import type {Timeline} from '@luma.gl/engine';
import type {BufferTransform as LumaTransform} from '@luma.gl/engine';
import type {
  Buffer as LumaBuffer,
  Framebuffer as LumaFramebuffer,
  Texture as LumaTexture2D
} from '@luma.gl/core';
import type {NumericArray} from '../types/types';
import type GPUTransition from './gpu-transition';

export default class GPUSpringTransition implements GPUTransition {
  device: Device;
  type = 'spring';
  attributeInTransition: Attribute;

  private settings?: SpringTransitionSettings;
  private attribute: Attribute;
  private transition: Transition;
  private currentStartIndices: NumericArray | null;
  private currentLength: number;
  private texture: LumaTexture2D;
  private framebuffer: LumaFramebuffer;
  private transform: LumaTransform;
  private buffers: [LumaBuffer, LumaBuffer, LumaBuffer];

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
    this.type = 'spring';
    this.transition = new Transition(timeline);
    this.attribute = attribute;
    // this is the attribute we return during the transition - note: if it is a constant
    // attribute, it will be converted and returned as a regular attribute
    // `attribute.userData` is the original options passed when constructing the attribute.
    // This ensures that we set the proper `doublePrecision` flag and shader attributes.
    this.attributeInTransition = new Attribute(device, {...attribute.settings, normalized: false});
    this.currentStartIndices = attribute.startIndices;
    // storing currentLength because this.buffer may be larger than the actual length we want to use
    // this is because we only reallocate buffers when they grow, not when they shrink,
    // due to performance costs
    this.currentLength = 0;
    this.texture = getTexture(device);
    this.framebuffer = getFramebuffer(device, this.texture);
    const bufferOpts = {
      byteLength: 0,
      usage: GL.DYNAMIC_COPY
    };
    this.buffers = [
      device.createBuffer(bufferOpts), // previous
      device.createBuffer(bufferOpts), // current
      device.createBuffer(bufferOpts) // next
    ];
    this.transform = getTransform(device, attribute, this.buffers);
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
    const {buffers, attribute} = this;
    const padBufferOpts = {
      numInstances,
      attribute,
      fromLength: this.currentLength,
      fromStartIndices: this.currentStartIndices,
      getData: transitionSettings.enter
    };

    buffers.forEach((buffer, index) => {
      const paddedBuffer = padBuffer({buffer, ...padBufferOpts});

      if (buffer !== paddedBuffer) {
        buffer.destroy();
        buffers[index] = paddedBuffer;

        // TODO(v9): While this probably isn't necessary as a user-facing warning, it is helpful
        // for debugging buffer allocation during deck.gl v9 development.
        console.warn(
          `[GPUSpringTransition] Replaced buffer ${buffer.id} (${buffer.byteLength} bytes) → ` +
            `${paddedBuffer.id} (${paddedBuffer.byteLength} bytes)`
        );
      }
    });

    this.settings = transitionSettings;
    this.currentStartIndices = attribute.startIndices;
    this.currentLength = getAttributeBufferLength(attribute, numInstances);
    this.attributeInTransition.setData({
      buffer: buffers[1],
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: attribute.value as NumericArray
    });

    // when an attribute changes values, a new transition is started. These
    // are properties that we have to store on this.transition but can change
    // when new transitions are started, so we have to keep them up-to-date.
    // this.transition.start() takes the latest settings and updates them.
    this.transition.start({...transitionSettings, duration: Infinity});

    this.transform.model.setVertexCount(Math.floor(this.currentLength / attribute.size));
    this.transform.model.setAttributes({aTo: attribute.buffer});
  }

  update() {
    const {buffers, transform, framebuffer, transition} = this;
    const updated = transition.update();
    if (!updated) {
      return false;
    }
    const settings = this.settings as SpringTransitionSettings;

    this.transform.model.setAttributes({aPrev: buffers[0], aCur: buffers[1]});
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
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: this.attribute.value as NumericArray
    });

    const isTransitioning = readPixelsToArray(framebuffer)[0] > 0;

    if (!isTransitioning) {
      transition.end();
    }

    return true;
  }

  cancel() {
    this.transition.cancel();
    this.transform.delete();
    for (const buffer of this.buffers) {
      buffer.delete();
    }
    (this.buffers as LumaBuffer[]).length = 0;
    this.texture.delete();
    this.framebuffer.delete();
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

function getTransform(
  device: Device,
  attribute: Attribute,
  buffers: [LumaBuffer, LumaBuffer, LumaBuffer]
): LumaTransform {
  const attributeType = getAttributeTypeFromSize(attribute.size);
  const format = getAttributeVertexFormat(attribute.size as 1 | 2 | 3 | 4);
  return new BufferTransform(device, {
    vs,
    fs,
    attributes: {aPrev: buffers[0], aCur: buffers[1]},
    bufferLayout: [
      {name: 'aPrev', format},
      {name: 'aCur', format},
      {name: 'aTo', format}
    ],
    feedbackBuffers: {vNext: buffers[2]},
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

function getTexture(device: Device): LumaTexture2D {
  return device.createTexture({
    data: new Uint8Array(4),
    format: 'rgba8unorm',
    mipmaps: false,
    // dataFormat: GL.RGBA,
    width: 1,
    height: 1
  });
}

function getFramebuffer(device: Device, texture: LumaTexture2D): LumaFramebuffer {
  return device.createFramebuffer({
    id: 'spring-transition-is-transitioning-framebuffer',
    width: 1,
    height: 1,
    colorAttachments: [texture]
  });
}
