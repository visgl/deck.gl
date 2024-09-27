// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import {Timeline, BufferTransform} from '@luma.gl/engine';
import type {ShaderModule} from '@luma.gl/shadertools';
import {
  padBuffer,
  matchBuffer,
  getAttributeTypeFromSize,
  getFloat32VertexFormat,
  cycleBuffers
} from './gpu-transition-utils';
import Attribute from '../lib/attribute/attribute';
import {GPUTransitionBase} from './gpu-transition';

import type {SpringTransitionSettings} from '../lib/attribute/transition-settings';
import type {TypedArray} from '../types/types';

export default class GPUSpringTransition extends GPUTransitionBase<SpringTransitionSettings> {
  type = 'spring';

  private texture: Texture;
  private framebuffer: Framebuffer;
  private transform: BufferTransform;

  constructor({
    device,
    attribute,
    timeline
  }: {
    device: Device;
    attribute: Attribute;
    timeline: Timeline;
  }) {
    super({device, attribute, timeline});
    this.texture = getTexture(device);
    this.framebuffer = getFramebuffer(device, this.texture);
    this.transform = getTransform(device, attribute);
  }

  override start(transitionSettings: SpringTransitionSettings, numInstances: number): void {
    const prevLength = this.currentLength;
    const prevStartIndices = this.currentStartIndices;
    super.start(transitionSettings, numInstances);

    const {buffers, attribute} = this;

    for (let i = 0; i < 2; i++) {
      buffers[i] = padBuffer({
        device: this.device,
        buffer: buffers[i],
        attribute,
        fromLength: prevLength,
        toLength: this.currentLength,
        fromStartIndices: prevStartIndices,
        getData: transitionSettings.enter
      });
    }
    buffers[2] = matchBuffer({
      device: this.device,
      source: buffers[0],
      target: buffers[2]
    });

    this.setBuffer(buffers[1]);

    const {model} = this.transform;
    model.setVertexCount(Math.floor(this.currentLength / attribute.size));
    if (attribute.isConstant) {
      model.setConstantAttributes({aTo: attribute.value as TypedArray});
    } else {
      model.setAttributes({aTo: attribute.getBuffer()!});
    }
  }

  onUpdate() {
    const {buffers, transform, framebuffer, transition} = this;

    const settings = this.settings as SpringTransitionSettings;

    transform.model.setAttributes({
      aPrev: buffers[0],
      aCur: buffers[1]
    });
    transform.transformFeedback.setBuffers({vNext: buffers[2]});
    const springProps: SpringProps = {
      stiffness: settings.stiffness,
      damping: settings.damping
    };
    transform.model.shaderInputs.setProps({spring: springProps});
    transform.run({
      framebuffer,
      discard: false,
      parameters: {viewport: [0, 0, 1, 1]},
      clearColor: [0, 0, 0, 0]
    });

    cycleBuffers(buffers);
    this.setBuffer(buffers[1]);

    const isTransitioning = this.device.readPixelsToArrayWebGL(framebuffer)[0] > 0;

    if (!isTransitioning) {
      transition.end();
    }
  }

  override delete() {
    super.delete();
    this.transform.destroy();
    this.texture.destroy();
    this.framebuffer.destroy();
  }
}

const uniformBlock = `\
uniform springUniforms {
  float damping;
  float stiffness;
} spring;
`;

type SpringProps = {
  damping: number;
  stiffness: number;
};

const springUniforms = {
  name: 'spring',
  vs: uniformBlock,
  uniformTypes: {
    damping: 'f32',
    stiffness: 'f32'
  }
} as const satisfies ShaderModule<SpringProps>;

const vs = `\
#version 300 es
#define SHADER_NAME spring-transition-vertex-shader

#define EPSILON 0.00001

in ATTRIBUTE_TYPE aPrev;
in ATTRIBUTE_TYPE aCur;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vNext;
out float vIsTransitioningFlag;

ATTRIBUTE_TYPE getNextValue(ATTRIBUTE_TYPE cur, ATTRIBUTE_TYPE prev, ATTRIBUTE_TYPE dest) {
  ATTRIBUTE_TYPE velocity = cur - prev;
  ATTRIBUTE_TYPE delta = dest - cur;
  ATTRIBUTE_TYPE force = delta * spring.stiffness;
  ATTRIBUTE_TYPE resistance = velocity * spring.damping;
  return force - resistance + velocity + cur;
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
    modules: [springUniforms],
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
