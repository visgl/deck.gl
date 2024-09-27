// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BufferTransform} from '@luma.gl/engine';
import {createRenderTarget} from './utils';

import type {Device, Framebuffer, Buffer, Texture} from '@luma.gl/core';
import type {WebGLAggregatorProps} from './webgl-aggregator';
import type {AggregationOperation} from '../aggregator';

import {TEXTURE_WIDTH} from './webgl-bin-sorter';
import {
  AggregatorTransformProps,
  aggregatorTransformUniforms
} from './aggregation-transform-uniforms';
import {NumberArray3} from '@math.gl/core';

const MAX_FLOAT32 = 3e38;

export class WebGLAggregationTransform {
  device: Device;
  channelCount: number;

  /** Packed from bin ids */
  binBuffer: Buffer | null = null;
  /** Packed values from each channel of each bin
   * Stride is number of channels * 4 bytes (float32)
   */
  valueBuffer: Buffer | null = null;

  private transform: BufferTransform;
  /** Render target for calculating domain */
  private domainFBO: Framebuffer;
  /** Aggregated [min, max] for each channel */
  private _domains: [min: number, max: number][] | null = null;

  constructor(device: Device, props: WebGLAggregatorProps) {
    this.device = device;
    this.channelCount = props.channelCount;
    this.transform = createTransform(device, props);
    this.domainFBO = createRenderTarget(device, 2, 1);
  }

  destroy() {
    this.transform.destroy();
    this.binBuffer?.destroy();
    this.valueBuffer?.destroy();
    this.domainFBO.colorAttachments[0].texture.destroy();
    this.domainFBO.destroy();
  }

  get domains(): [min: number, max: number][] {
    if (!this._domains) {
      // Domain model has run, but result has not been read to CPU
      const buffer = this.device.readPixelsToArrayWebGL(this.domainFBO).buffer;
      const domain = new Float32Array(buffer);
      this._domains = [
        [-domain[4], domain[0]],
        [-domain[5], domain[1]],
        [-domain[6], domain[2]]
      ].slice(0, this.channelCount) as [number, number][];
    }
    return this._domains;
  }

  setDimensions(binCount: number, binIdRange: [number, number][]) {
    const {model, transformFeedback} = this.transform;
    model.setVertexCount(binCount);
    const aggregatorTransformProps: Partial<AggregatorTransformProps> = {
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        binIdRange[1]?.[0] || 0,
        binIdRange[1]?.[1] || 0
      ]
    };
    model.shaderInputs.setProps({aggregatorTransform: aggregatorTransformProps});

    // Only destroy existing buffer if it is not large enough
    const binBufferByteLength = binCount * binIdRange.length * 4;
    if (!this.binBuffer || this.binBuffer.byteLength < binBufferByteLength) {
      this.binBuffer?.destroy();
      this.binBuffer = this.device.createBuffer({byteLength: binBufferByteLength});
      transformFeedback.setBuffer('binIds', this.binBuffer);
    }

    const valueBufferByteLength = binCount * this.channelCount * 4;
    if (!this.valueBuffer || this.valueBuffer.byteLength < valueBufferByteLength) {
      this.valueBuffer?.destroy();
      this.valueBuffer = this.device.createBuffer({byteLength: valueBufferByteLength});
      transformFeedback.setBuffer('values', this.valueBuffer);
    }
  }

  update(bins: Texture | null, operations: AggregationOperation[]) {
    if (!bins) {
      return;
    }
    const transform = this.transform;
    const target = this.domainFBO;

    const isCount = [0, 1, 2].map(i => (operations[i] === 'COUNT' ? 1 : 0));
    const isMean = [0, 1, 2].map(i => (operations[i] === 'MEAN' ? 1 : 0));
    const aggregatorTransformProps: Partial<AggregatorTransformProps> = {
      isCount: isCount as NumberArray3,
      isMean: isMean as NumberArray3,
      bins
    };
    transform.model.shaderInputs.setProps({aggregatorTransform: aggregatorTransformProps});

    transform.run({
      id: 'gpu-aggregation-domain',
      framebuffer: target,
      parameters: {
        viewport: [0, 0, 2, 1]
      },
      clearColor: [-MAX_FLOAT32, -MAX_FLOAT32, -MAX_FLOAT32, 0],
      clearDepth: false,
      clearStencil: false
    });

    // Clear the last read results. This will be lazy-populated if used.
    this._domains = null;
  }
}

function createTransform(device: Device, props: WebGLAggregatorProps): BufferTransform {
  const vs = /* glsl */ `\
#version 300 es
#define SHADER_NAME gpu-aggregation-domain-vertex

uniform sampler2D bins;

#if NUM_DIMS == 1
out float binIds;
#else
out vec2 binIds;
#endif

#if NUM_CHANNELS == 1
flat out float values;
#elif NUM_CHANNELS == 2
flat out vec2 values;
#else
flat out vec3 values;
#endif

const float NAN = intBitsToFloat(-1);

void main() {
  int row = gl_VertexID / SAMPLER_WIDTH;
  int col = gl_VertexID - row * SAMPLER_WIDTH;
  vec4 weights = texelFetch(bins, ivec2(col, row), 0);
  vec3 value3 = mix(
    mix(weights.rgb, vec3(weights.a), aggregatorTransform.isCount),
    weights.rgb / max(weights.a, 1.0),
    aggregatorTransform.isMean
  );
  if (weights.a == 0.0) {
    value3 = vec3(NAN);
  }

#if NUM_DIMS == 1
  binIds = float(gl_VertexID + aggregatorTransform.binIdRange.x);
#else
  int y = gl_VertexID / (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  int x = gl_VertexID - y * (aggregatorTransform.binIdRange.y - aggregatorTransform.binIdRange.x);
  binIds.y = float(y + aggregatorTransform.binIdRange.z);
  binIds.x = float(x + aggregatorTransform.binIdRange.x);
#endif

#if NUM_CHANNELS == 3
  values = value3;
#elif NUM_CHANNELS == 2
  values = value3.xy;
#else
  values = value3.x;
#endif

  gl_Position = vec4(0., 0., 0., 1.);
  // This model renders into a 2x1 texture to obtain min and max simultaneously.
  // See comments in fragment shader
  gl_PointSize = 2.0;
}
`;

  const fs = /* glsl */ `\
#version 300 es
#define SHADER_NAME gpu-aggregation-domain-fragment

precision highp float;

#if NUM_CHANNELS == 1
flat in float values;
#elif NUM_CHANNELS == 2
flat in vec2 values;
#else
flat in vec3 values;
#endif

out vec4 fragColor;

void main() {
  vec3 value3;
#if NUM_CHANNELS == 3
  value3 = values;
#elif NUM_CHANNELS == 2
  value3.xy = values;
#else
  value3.x = values;
#endif
  if (isnan(value3.x)) discard;
  // This shader renders into a 2x1 texture with blending=max
  // The left pixel yields the max value of each channel
  // The right pixel yields the min value of each channel
  if (gl_FragCoord.x < 1.0) {
    fragColor = vec4(value3, 1.0);
  } else {
    fragColor = vec4(-value3, 1.0);
  }
}
`;

  return new BufferTransform(device, {
    vs,
    fs,
    topology: 'point-list',
    modules: [aggregatorTransformUniforms],
    parameters: {
      blend: true,
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one',
      blendColorOperation: 'max',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one',
      blendAlphaOperation: 'max'
    },
    defines: {
      NUM_DIMS: props.dimensions,
      NUM_CHANNELS: props.channelCount,
      SAMPLER_WIDTH: TEXTURE_WIDTH
    },
    varyings: ['binIds', 'values'],
    disableWarnings: true
  });
}
