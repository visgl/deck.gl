/* eslint-disable complexity, max-statements, max-params */
import type {Device} from '@luma.gl/core';
import {Transform} from '@luma.gl/engine';
import {readPixelsToArray} from '@luma.gl/webgl';
import {GL} from '@luma.gl/constants';
import {
  padBuffer,
  getAttributeTypeFromSize,
  getSourceBufferAttribute,
  getAttributeBufferLength,
  cycleBuffers,
  SpringTransitionSettings
} from '../lib/attribute/attribute-transition-utils';
import Attribute from '../lib/attribute/attribute';
import Transition from './transition';

import type {Timeline} from '@luma.gl/engine';
import type {Transform as LumaTransform} from '@luma.gl/engine';
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
  private buffers: LumaBuffer[];

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
    this.transform = getTransform(device, attribute, this.framebuffer);
    const bufferOpts = {
      byteLength: 0,
      usage: GL.DYNAMIC_COPY
    };
    this.buffers = [
      device.createBuffer(bufferOpts), // previous
      device.createBuffer(bufferOpts), // current
      device.createBuffer(bufferOpts) // next
    ];
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
    const {device, buffers, attribute} = this;
    const padBufferOpts = {
      numInstances,
      attribute,
      fromLength: this.currentLength,
      fromStartIndices: this.currentStartIndices,
      getData: transitionSettings.enter
    };

    for (const buffer of buffers) {
      padBuffer({buffer, ...padBufferOpts});
    }

    this.settings = transitionSettings;
    this.currentStartIndices = attribute.startIndices;
    this.currentLength = getAttributeBufferLength(attribute, numInstances);
    this.attributeInTransition.setData({
      // @ts-expect-error accessor is deprecated
      buffer: buffers[1],
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: attribute.value
    });

    // when an attribute changes values, a new transition is started. These
    // are properties that we have to store on this.transition but can change
    // when new transitions are started, so we have to keep them up-to-date.
    // this.transition.start() takes the latest settings and updates them.
    this.transition.start({...transitionSettings, duration: Infinity});

    this.transform.update({
      elementCount: Math.floor(this.currentLength / attribute.size),
      sourceBuffers: {
        // @ts-ignore TODO - this looks like a real type mismatch!!!
        aTo: getSourceBufferAttribute(device, attribute)
      }
    });
  }

  update() {
    const {buffers, transform, framebuffer, transition} = this;
    const updated = transition.update();
    if (!updated) {
      return false;
    }
    const settings = this.settings;

    transform.update({
      sourceBuffers: {
        aPrev: buffers[0],
        aCur: buffers[1]
      },
      feedbackBuffers: {
        vNext: buffers[2]
      }
    });
    transform.run({
      framebuffer,
      discard: false,
      clearRenderTarget: true,
      uniforms: {
        stiffness: settings.stiffness,
        damping: settings.damping
      },
      parameters: {
        depthTest: false,
        blend: true,
        viewport: [0, 0, 1, 1],
        blendFunc: [GL.ONE, GL.ONE],
        blendEquation: [GL.MAX, GL.MAX]
      }
    });

    cycleBuffers(buffers);
    this.attributeInTransition.setData({
      // @ts-expect-error
      buffer: buffers[1],
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: this.attribute.value
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
    this.buffers.length = 0;
    this.texture.delete();
    this.framebuffer.delete();
  }
}

function getTransform(
  device: Device,
  attribute: Attribute,
  framebuffer: LumaFramebuffer
): LumaTransform {
  const attributeType = getAttributeTypeFromSize(attribute.size);
  return new Transform(device, {
    framebuffer,
    vs: `
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

uniform float stiffness;
uniform float damping;
attribute ATTRIBUTE_TYPE aPrev;
attribute ATTRIBUTE_TYPE aCur;
attribute ATTRIBUTE_TYPE aTo;
varying ATTRIBUTE_TYPE vNext;
varying float vIsTransitioningFlag;

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
`,
    fs: `
#define SHADER_NAME spring-transition-is-transitioning-fragment-shader

varying float vIsTransitioningFlag;

void main(void) {
  if (vIsTransitioningFlag == 0.0) {
    discard;
  }
  gl_FragColor = vec4(1.0);
}`,
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vNext']
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
