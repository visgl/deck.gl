import type {Device} from '@luma.gl/core';
import {Timeline, BufferTransform} from '@luma.gl/engine';
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
    model.setVertexCount(Math.floor(this.currentLength / attribute.size));
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
    model.setUniforms({time: t});
    // @ts-ignore
    const gl = model.device.gl as WebGL2RenderingContext;
    // TODO - remove after https://github.com/visgl/luma.gl/pull/2023
    gl.bindBuffer(gl.ARRAY_BUFFER, null);

    this.transform.run({discard: true});
  }

  override delete() {
    super.delete();
    this.transform.destroy();
  }
}

const vs = `\
#version 300 es
#define SHADER_NAME interpolation-transition-vertex-shader

uniform float time;
in ATTRIBUTE_TYPE aFrom;
in ATTRIBUTE_TYPE aTo;
out ATTRIBUTE_TYPE vCurrent;

void main(void) {
  vCurrent = mix(aFrom, aTo, time);
  gl_Position = vec4(0.0);
}
`;

function getTransform(device: Device, attribute: Attribute): BufferTransform {
  const attributeType = getAttributeTypeFromSize(attribute.size);
  return new BufferTransform(device, {
    vs,
    bufferLayout: [
      {name: 'aFrom', format: getFloat32VertexFormat(attribute.size)},
      {name: 'aTo', format: attribute.getBufferLayout().attributes![0].format}
    ],
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  });
}
