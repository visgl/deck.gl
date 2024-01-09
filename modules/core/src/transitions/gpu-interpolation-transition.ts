import type {Device} from '@luma.gl/core';
import {Timeline, BufferTransform} from '@luma.gl/engine';
import {Buffer} from '@luma.gl/core';
import {GL} from '@luma.gl/constants';
import Attribute from '../lib/attribute/attribute';
import {
  // padBuffer,
  getAttributeTypeFromSize,
  // getSourceBufferAttribute,
  getAttributeBufferLength,
  cycleBuffers,
  InterpolationTransitionSettings,
  padBuffer
} from '../lib/attribute/attribute-transition-utils';
import Transition from './transition';

import type {NumericArray} from '../types/types';
import type GPUTransition from './gpu-transition';

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
    // `attribute.userData` is the original options passed when constructing the attribute.
    // This ensures that we set the proper `doublePrecision` flag and shader attributes.
    this.attributeInTransition = new Attribute(device, attribute.settings);
    if (ArrayBuffer.isView(attribute.value)) {
      this.attributeInTransition.setData(attribute.value);
    }
    this.currentStartIndices = attribute.startIndices;
    // storing currentLength because this.buffer may be larger than the actual length we want to use
    // this is because we only reallocate buffers when they grow, not when they shrink,
    // due to performance costs
    this.currentLength = 0;
    this.transform = getTransform(device, attribute);
    const bufferOpts = {
      byteLength: attribute.buffer.byteLength,
      usage: GL.DYNAMIC_COPY
    };
    this.buffers = [
      device.createBuffer(bufferOpts), // from
      device.createBuffer(bufferOpts) // current
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
        console.warn(
          `[GPUInterpolationTransition] Replaced buffer ${buffer.id} (${buffer.byteLength} bytes) → ` +
            `${paddedBuffer.id} (${paddedBuffer.byteLength} bytes)`
        );
      }
    });

    this.currentStartIndices = attribute.startIndices;
    this.currentLength = getAttributeBufferLength(attribute, numInstances);
    this.attributeInTransition.setData({
      buffer: buffers[1],
      // Hack: Float64Array is required for double-precision attributes
      // to generate correct shader attributes
      value: attribute.value as NumericArray
    });

    this.transition.start(transitionSettings);

    this.transform.model.setVertexCount(Math.floor(this.currentLength / attribute.size));
    // TODO(v9): Best way to handle 'constant' attributes?
    this.transform.model.setAttributes(
      attribute.getBuffer() ? {aFrom: buffers[0], aTo: attribute.getBuffer()!} : {aFrom: buffers[0]}
    );
    this.transform.transformFeedback.setBuffers({vCurrent: buffers[1]});
  }

  update(): boolean {
    const updated = this.transition.update();
    if (updated) {
      const {duration, easing} = this.settings as InterpolationTransitionSettings;
      const {time} = this.transition;
      let t = time / duration;
      if (easing) {
        t = easing(t);
      }
      this.transform.model.setUniforms({time: t});
      this.transform.run();
    }
    return updated;
  }

  cancel(): void {
    this.transition.cancel();
    this.transform.delete();
    for (const buffer of this.buffers) {
      buffer.delete();
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
    vs,
    // TODO(v9): Can 'attribute' provide 'format' values?
    bufferLayout: [
      {name: 'aFrom', format: 'float32'},
      {name: 'aTo', format: 'float32'}
    ],
    defines: {
      ATTRIBUTE_TYPE: attributeType
    },
    varyings: ['vCurrent']
  });
}
