import type {Device, VertexFormat} from '@luma.gl/core';
import {Timeline, BufferTransform} from '@luma.gl/engine';
import {Buffer} from '@luma.gl/core';
import {GL} from '@luma.gl/constants';
import Attribute from '../lib/attribute/attribute';
import {
  getAttributeTypeFromSize,
  getAttributeBufferLength,
  cycleBuffers,
  padBuffer,
  getFloat32VertexFormat
} from './gpu-transition-utils';
import Transition from './transition';

import type {InterpolationTransitionSettings} from './transition-settings';
import type {NumericArray, TypedArray} from '../types/types';
import type {GPUTransition} from './gpu-transition';

export default class GPUInterpolationTransition implements GPUTransition {
  device: Device;
  type = 'interpolation';
  attributeInTransition: Attribute;

  private settings?: InterpolationTransitionSettings;
  private attribute: Attribute;
  private transition: Transition;
  private currentStartIndices: NumericArray | null;
  private currentLength: number;
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
    this.transform = getTransform(device, attribute);
    this.buffers = [device.createBuffer({byteLength: 0})];
  }

  get inProgress(): boolean {
    return this.transition.inProgress;
  }

  // this is called when an attribute's values have changed and
  // we need to start animating towards the new values
  // this also correctly resizes / pads the transform's buffers
  // in case the attribute's buffer has changed in length or in
  // startIndices
  start(transitionSettings: InterpolationTransitionSettings, numInstances: number): void {
    if (transitionSettings.duration <= 0) {
      this.transition.cancel();
      return;
    }
    this.settings = transitionSettings;

    const {buffers, attribute} = this;
    // Alternate between two buffers when new transitions start.
    // Last destination buffer is used as an attribute (from state),
    // And the other buffer is now the current buffer.
    cycleBuffers(buffers);

    const toLength = getAttributeBufferLength(attribute, numInstances);
    const padBufferOpts = {
      numInstances,
      attribute,
      fromLength: this.currentLength,
      toLength,
      fromStartIndices: this.currentStartIndices,
      getData: transitionSettings.enter
    };

    const fromBuffer = padBuffer({buffer: buffers[0], ...padBufferOpts});
    if (fromBuffer !== buffers[0]) {
      buffers[0].destroy();
      buffers[0] = fromBuffer;
    }
    if (!buffers[1] || buffers[1].byteLength < fromBuffer.byteLength) {
      buffers[1]?.destroy();
      buffers[1] = this.device.createBuffer({
        byteLength: fromBuffer.byteLength,
        usage: fromBuffer.usage
      });
    }

    this.currentStartIndices = attribute.startIndices;
    this.currentLength = toLength;
    this.attributeInTransition.setData({
      buffer: buffers[1],
      // Retain placeholder value to generate correct shader layout
      value: this.attributeInTransition.value as NumericArray
    });

    this.transition.start(transitionSettings);

    const {model} = this.transform;
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
    this.transform.transformFeedback.setBuffers({vCurrent: buffers[1]});
  }

  update(): boolean {
    const updated = this.transition.update();
    if (updated) {
      const {duration, easing} = this.settings!;
      const {time} = this.transition;
      let t = time / duration;
      if (easing) {
        t = easing(t);
      }
      const {model} = this.transform;
      model.setUniforms({time: t});
      // TODO - why is this needed?
      model.setAttributes({aFrom: this.buffers[0]});

      this.transform.run();
    }
    return updated;
  }

  cancel(): void {
    this.transition.cancel();
    this.transform.destroy();
    for (const buffer of this.buffers) {
      buffer.destroy();
    }
    this.buffers.length = 0;
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
    id: `${attribute.id}-transition`,
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
