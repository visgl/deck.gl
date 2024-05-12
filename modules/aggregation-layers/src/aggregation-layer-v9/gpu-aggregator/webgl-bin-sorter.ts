import {Model, ModelProps} from '@luma.gl/engine';
import {glsl, createRenderTarget} from './utils';

import type {Device, Framebuffer, Texture} from '@luma.gl/core';
import type {GPUAggregatorSettings} from './gpu-aggregator';
import type {AggregationOperation} from '../aggregator';

const COLOR_CHANNELS = [0x1, 0x2, 0x4, 0x8]; // GPU color mask RED, GREEN, BLUE, ALPHA
const MAX_FLOAT32 = 3e38;
const EMPTY_MASKS = {SUM: 0, MEAN: 0, MIN: 0, MAX: 0};

export const TEXTURE_WIDTH = 1024;

/**
 * This class manages the resources for performing the first step of aggregation
 * Sort a list of data points into a number of bins
 */
export class WebGLBinSorter {
  device: Device;
  model: Model;

  /**
   * A packed texture in which each pixel represents a bin.
   * The index of the pixel in the memory layout is the bin index.
   * Alpha value is the count of data points that fall into this bin
   * R,G,B values are the aggregated weights of each channel:
   *   - Sum of all data points if operation is 'SUM' or 'MEAN'
   *   - Min of all data points if operation is 'MIN'
   *   - Max of all data points if operation is 'MAX'
   */
  private binsFBO: Framebuffer | null = null;

  constructor(device: Device, settings: GPUAggregatorSettings) {
    this.device = device;
    this.model = createModel(device, settings);
  }

  get texture(): Texture | null {
    return this.binsFBO ? this.binsFBO.colorAttachments[0].texture : null;
  }

  destroy() {
    this.model.destroy();
    this.binsFBO?.colorAttachments[0].texture.destroy();
    this.binsFBO?.destroy();
  }

  getBinValues(index: number): Float32Array | null {
    if (!this.binsFBO) {
      return null;
    }
    const x = index % TEXTURE_WIDTH;
    const y = Math.floor(index / TEXTURE_WIDTH);
    const buffer = this.device.readPixelsToArrayWebGL(this.binsFBO, {
      sourceX: x,
      sourceY: y,
      sourceWidth: 1,
      sourceHeight: 1
    }).buffer;
    return new Float32Array(buffer);
  }

  setDimensions(numBins: number, binIdRange: [number, number][]) {
    const width = TEXTURE_WIDTH;
    const height = Math.ceil(numBins / width);

    // Only destroy existing texture if it is not large enough
    if (!this.binsFBO) {
      this.binsFBO = createRenderTarget(this.device, width, height);
    } else if (this.binsFBO.height < height) {
      this.binsFBO.resize({width, height});
    }

    this.model.setUniforms({
      binIdRange: [
        binIdRange[0][0],
        binIdRange[0][1],
        binIdRange[1]?.[0] || 0,
        binIdRange[1]?.[1] || 0
      ],
      targetSize: [this.binsFBO.width, this.binsFBO.height]
    });
  }

  setModelProps(
    props: Pick<
      ModelProps,
      'moduleSettings' | 'vertexCount' | 'uniforms' | 'attributes' | 'constantAttributes'
    >
  ) {
    const model = this.model;
    if (props.uniforms) {
      model.setUniforms(props.uniforms);
    }
    if (props.attributes) {
      model.setAttributes(props.attributes);
    }
    if (props.constantAttributes) {
      model.setConstantAttributes(props.constantAttributes);
    }
    if (props.vertexCount !== undefined) {
      model.setVertexCount(props.vertexCount);
    }
    if (props.moduleSettings) {
      // TODO v9.1 - remove after migrate to UBO
      model.updateModuleSettings(props.moduleSettings);
      model.shaderInputs.setProps({project: props.moduleSettings});
    }
  }

  /** Update aggregation */
  update(
    /** The aggregation operation for each channel. Use null to skip update. */
    operations: (AggregationOperation | null)[]
  ) {
    if (!this.binsFBO) {
      return;
    }
    const masks = getMaskByOperation(operations);
    this._updateBins('SUM', masks.SUM + masks.MEAN);
    this._updateBins('MIN', masks.MIN);
    this._updateBins('MAX', masks.MAX);
  }

  /** Recalculate aggregation on the given channels using the given operation */
  private _updateBins(
    operation: AggregationOperation,
    /** GPU bit mask of one or more channels that should be updated */
    colorMask: number
  ) {
    if (colorMask === 0) {
      return;
    }
    colorMask |= COLOR_CHANNELS[3]; // Also renders to the alpha channel (point count)

    const model = this.model;
    const target = this.binsFBO!;

    const initialValue = operation === 'MAX' ? -MAX_FLOAT32 : operation === 'MIN' ? MAX_FLOAT32 : 0;
    const renderPass = this.device.beginRenderPass({
      id: `gpu-aggregation-${operation}`,
      framebuffer: target,
      parameters: {
        viewport: [0, 0, target.width, target.height],
        colorMask
      },
      clearColor: [initialValue, initialValue, initialValue, 0],
      clearDepth: false,
      clearStencil: false
    });
    model.setParameters({
      blendColorSrcFactor: 'one',
      blendColorDstFactor: 'one',
      blendAlphaSrcFactor: 'one',
      blendAlphaDstFactor: 'one',
      blendColorOperation: operation === 'MAX' ? 'max' : operation === 'MIN' ? 'min' : 'add',
      blendAlphaOperation: 'add'
    });
    model.draw(renderPass);
    renderPass.end();
  }
}

/** Convert a [channel -> operation] map to a [operation -> GPU color mask] map */
function getMaskByOperation(
  operations: (AggregationOperation | null)[]
): Record<AggregationOperation, number> {
  const result: Record<AggregationOperation, number> = {...EMPTY_MASKS};
  for (let channel = 0; channel < operations.length; channel++) {
    const op = operations[channel];
    if (op) {
      result[op] += COLOR_CHANNELS[channel];
    }
  }
  return result;
}

function createModel(device: Device, settings: GPUAggregatorSettings): Model {
  let userVs = settings.vs;

  if (settings.dimensions === 2) {
    // If user provides 2d bin IDs, convert them to 1d indices for data packing
    userVs += glsl`
void getBin(out int binId) {
  ivec2 binId2;
  getBin(binId2);
  if (binId2.x < binIdRange.x || binId2.x >= binIdRange.y) {
    binId = -1;
  } else {
    binId = (binId2.y - binIdRange.z) * (binIdRange.y - binIdRange.x) + binId2.x;
  }
}
`;
  }

  const vs = `\
#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-vertex

uniform ivec4 binIdRange;
uniform ivec2 targetSize;

${userVs}

out vec3 v_Weight;

void main() {
  int binIndex;
  getBin(binIndex);
  binIndex = binIndex - binIdRange.x;
  if (binIndex < 0) {
    gl_Position = vec4(0.);
    return;
  }
  int row = binIndex / targetSize.x;
  int col = binIndex - row * targetSize.x;
  vec2 position = (vec2(col, row) + 0.5) / vec2(targetSize) * 2.0 - 1.0;
  gl_Position = vec4(position, 0.0, 1.0);
  gl_PointSize = 1.0;

#if NUM_CHANNELS == 3
  getWeight(v_Weight);
#elif NUM_CHANNELS == 2
  getWeight(v_Weight.xy);
#else
  getWeight(v_Weight.x);
#endif
}
`;
  const fs = glsl`\
#version 300 es
#define SHADER_NAME gpu-aggregation-sort-bins-fragment

precision highp float;

in vec3 v_Weight;
out vec4 fragColor;

void main() {
  fragColor.xyz = v_Weight;

  #ifdef MODULE_GEOMETRY
  geometry.uv = vec2(0.);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  #endif

  fragColor.w = 1.0;
}
`;
  const model = new Model(device, {
    ...settings,
    defines: {...settings.defines, NON_INSTANCED_MODEL: 1, NUM_CHANNELS: settings.numChannels},
    isInstanced: false,
    vs,
    fs,
    topology: 'point-list'
  });
  return model;
}
