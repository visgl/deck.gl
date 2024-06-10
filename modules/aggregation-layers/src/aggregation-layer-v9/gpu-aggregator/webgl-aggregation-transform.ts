import {BufferTransform} from '@luma.gl/engine';
import {glsl, createRenderTarget} from './utils';

import type {Device, Framebuffer, Buffer, Texture} from '@luma.gl/core';
import type {GPUAggregatorOptions} from './gpu-aggregator';
import type {AggregationOperation} from '../aggregator';

import {TEXTURE_WIDTH} from './webgl-bin-sorter';

const MAX_FLOAT32 = 3e38;

export class WebGLAggregationTransform {
  device: Device;
  numChannels: number;

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

  constructor(device: Device, settings: GPUAggregatorOptions) {
    this.device = device;
    this.numChannels = settings.numChannels;
    this.transform = createTransform(device, settings);
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
      ].slice(0, this.numChannels) as [number, number][];
    }
    return this._domains;
  }

  setDimensions(numBins: number, binIdRange: [number, number][]) {
    const {model, transformFeedback} = this.transform;
    model.setVertexCount(numBins);
    model.setUniforms({
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        binIdRange[1]?.[0] || 0,
        binIdRange[1]?.[1] || 0
      ]
    });

    // Only destroy existing buffer if it is not large enough
    const binBufferByteLength = numBins * binIdRange.length * 4;
    if (!this.binBuffer || this.binBuffer.byteLength < binBufferByteLength) {
      this.binBuffer?.destroy();
      this.binBuffer = this.device.createBuffer({byteLength: binBufferByteLength});
      transformFeedback.setBuffer('binIds', this.binBuffer);
    }

    const valueBufferByteLength = numBins * this.numChannels * 4;
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

    transform.model.setUniforms({
      isCount: Array.from({length: 3}, (_, i) => (operations[i] === 'COUNT' ? 1 : 0)),
      isMean: Array.from({length: 3}, (_, i) => (operations[i] === 'MEAN' ? 1 : 0))
    });
    transform.model.setBindings({bins});

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

function createTransform(device: Device, settings: GPUAggregatorOptions): BufferTransform {
  const vs = glsl`\
#version 300 es
#define SHADER_NAME gpu-aggregation-domain-vertex

uniform ivec4 binIdRange;
uniform bvec3 isCount;
uniform bvec3 isMean;
uniform float naN;
uniform sampler2D bins;

#if NUM_DIMS == 1
out float binIds;
#else
out vec2 binIds;
#endif

#if NUM_CHANNELS == 1
out float values;
#elif NUM_CHANNELS == 2
out vec2 values;
#else
out vec3 values;
#endif

void main() {
  int row = gl_VertexID / SAMPLER_WIDTH;
  int col = gl_VertexID - row * SAMPLER_WIDTH;
  vec4 weights = texelFetch(bins, ivec2(col, row), 0);
  vec3 value3 = mix(
    mix(weights.rgb, vec3(weights.a), isCount),
    weights.rgb / max(weights.a, 1.0),
    isMean
  );
  if (weights.a == 0.0) {
    value3 = vec3(naN);
  }

#if NUM_DIMS == 1
  binIds = float(gl_VertexID + binIdRange.x);
#else
  int y = gl_VertexID / (binIdRange.y - binIdRange.x);
  int x = gl_VertexID - y * (binIdRange.y - binIdRange.x);
  binIds.y = float(y + binIdRange.z);
  binIds.x = float(x + binIdRange.x);
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

  const fs = glsl`\
#version 300 es
#define SHADER_NAME gpu-aggregation-domain-fragment

precision highp float;

#if NUM_CHANNELS == 1
in float values;
#elif NUM_CHANNELS == 2
in vec2 values;
#else
in vec3 values;
#endif

out vec4 fragColor;

void main() {
#if NUM_CHANNELS > 1
  if (isnan(values.x)) discard;
#else
  if (isnan(values)) discard;
#endif
  vec3 value3;
#if NUM_CHANNELS == 3
  value3 = values;
#elif NUM_CHANNELS == 2
  value3.xy = values;
#else
  value3.x = values;
#endif
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
    parameters: {
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one',
      blendColorOperation: 'max',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one',
      blendAlphaOperation: 'max'
    },
    defines: {
      NUM_DIMS: settings.dimensions,
      NUM_CHANNELS: settings.numChannels,
      SAMPLER_WIDTH: TEXTURE_WIDTH
    },
    uniforms: {
      // Passed in as uniform because 1) there is no GLSL symbol for NaN 2) any expression that exploits undefined behavior to produces NaN
      // will subject to platform differences and shader optimization
      naN: NaN
    },
    varyings: ['binIds', 'values'],
    disableWarnings: true
  });
}
