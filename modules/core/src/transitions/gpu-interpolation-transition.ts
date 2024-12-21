// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {Timeline, BufferTransform} from '@luma.gl/engine';
import {fp64arithmetic} from '@luma.gl/shadertools';
import type {ShaderModule} from '@luma.gl/shadertools';
import {GL} from '@luma.gl/constants';
import Attribute from '../lib/attribute/attribute';
import {
  getAttributeTypeFromSize,
  cycleBuffers,
  padBuffer,
  matchBuffer,
  getFloat32VertexFormat
} from './gpu-transition-utils';
import {GPUTransitionBase} from './gpu-transition';

import type {InterpolationTransitionSettings} from '../lib/attribute/transition-settings';
import type {TypedArray} from '../types/types';

export default class GPUInterpolationTransition extends GPUTransitionBase<InterpolationTransitionSettings> {
  type = 'interpolation';

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
    this.transform = getTransform(device, attribute);
  }

  override start(transitionSettings: InterpolationTransitionSettings, numInstances: number): void {
    const prevLength = this.currentLength;
    const prevStartIndices = this.currentStartIndices;

    super.start(transitionSettings, numInstances, transitionSettings.duration);

    if (transitionSettings.duration <= 0) {
      this.transition.cancel();
      return;
    }

    const {buffers, attribute} = this;
    // Alternate between two buffers when new transitions start.
    // Last destination buffer is used as an attribute (from state),
    // And the other buffer is now the current buffer.
    cycleBuffers(buffers);

    buffers[0] = padBuffer({
      device: this.device,
      buffer: buffers[0],
      attribute,
      fromLength: prevLength,
      toLength: this.currentLength,
      fromStartIndices: prevStartIndices,
      getData: transitionSettings.enter
    });
    buffers[1] = matchBuffer({
      device: this.device,
      source: buffers[0],
      target: buffers[1]
    });

    this.setBuffer(buffers[1]);

    const {transform} = this;
    const model = transform.model;
    let vertexCount = Math.floor(this.currentLength / attribute.size);
    if (useFp64(attribute)) {
      vertexCount /= 2;
    }
    model.setVertexCount(vertexCount);
    if (attribute.isConstant) {
      model.setAttributes({aFrom: buffers[0]});
      model.setConstantAttributes({aTo: attribute.value as TypedArray});
    } else {
      model.setAttributes({
        aFrom: buffers[0],
        aTo: attribute.getBuffer()!
      });
    }
    transform.transformFeedback.setBuffers({vCurrent: buffers[1]});
  }

  onUpdate() {
    const {duration, easing} = this.settings!;
    const {time} = this.transition;
    let t = time / duration;
    if (easing) {
      t = easing(t);
    }
    const {model} = this.transform;
    const interpolationProps: InterpolationProps = {time: t};
    model.shaderInputs.setProps({interpolation: interpolationProps});

    this.transform.run({discard: true});
  }

  override delete() {
    super.delete();
    this.transform.destroy();
  }
}

const uniformBlock = `\
uniform interpolationUniforms {
  float time;
} interpolation;
`;

type InterpolationProps = {time: number};

const interpolationUniforms = {
  name: 'interpolation',
  vs: uniformBlock,
  uniformTypes: {
    time: 'f32'
  }
} as const satisfies ShaderModule<InterpolationProps>;

const vs = `\
#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, interpolation.time);
  gl_Position = vec4(0.0);
}
`;
const vs64 = `\
#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aFrom64Low;
in ATTRIBUTE_TYPE aTo;
in ATTRIBUTE_TYPE aTo64Low;
out ATTRIBUTE_TYPE vCurrent;
out ATTRIBUTE_TYPE vCurrent64Low;

vec2 mix_fp64(vec2 a, vec2 b, float x) {
  vec2 range = sub_fp64(b, a);
  return sum_fp64(a, mul_fp64(range, vec2(x, 0.0)));
}

void main(void) {
  for (int i=0; i<ATTRIBUTE_SIZE; i++) {
    vec2 value = mix_fp64(vec2(aFrom[i], aFrom64Low[i]), vec2(aTo[i], aTo64Low[i]), interpolation.time);
    vCurrent[i] = value.x;
    vCurrent64Low[i] = value.y;
  }
  gl_Position = vec4(0.0);
}
`;

function useFp64(attribute: Attribute): boolean {
  return attribute.doublePrecision && attribute.value instanceof Float64Array;
}

function getTransform(device: Device, attribute: Attribute): BufferTransform {
  const attributeSize = attribute.size;
  const attributeType = getAttributeTypeFromSize(attributeSize);
  const inputFormat = getFloat32VertexFormat(attributeSize);
  const bufferLayout = attribute.getBufferLayout();

  if (useFp64(attribute)) {
    return new BufferTransform(device, {
      vs: vs64,
      bufferLayout: [
        {
          name: 'aFrom',
          byteStride: 8 * attributeSize,
          attributes: [
            {attribute: 'aFrom', format: inputFormat, byteOffset: 0},
            {attribute: 'aFrom64Low', format: inputFormat, byteOffset: 4 * attributeSize}
          ]
        },
        {
          name: 'aTo',
          byteStride: 8 * attributeSize,
          attributes: [
            {attribute: 'aTo', format: inputFormat, byteOffset: 0},
            {attribute: 'aTo64Low', format: inputFormat, byteOffset: 4 * attributeSize}
          ]
        }
      ],
      // @ts-expect-error fp64 module only sets ONE uniform via defaultUniforms
      modules: [fp64arithmetic, interpolationUniforms],
      defines: {
        ATTRIBUTE_TYPE: attributeType,
        ATTRIBUTE_SIZE: attributeSize
      },
      // Default uniforms are not set without this
      moduleSettings: {},
      varyings: ['vCurrent', 'vCurrent64Low'],
      bufferMode: GL.INTERLEAVED_ATTRIBS,
      disableWarnings: true
    });
  }
  return new BufferTransform(device, {
    vs,
    bufferLayout: [
      {name: 'aFrom', format: inputFormat},
      {name: 'aTo', format: bufferLayout.attributes![0].format}
    ],
    modules: [interpolationUniforms],
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent'],

    // TODO investigate why this is needed
    disableWarnings: true
  });
}
