// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  type Color,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import {type Buffer, type RenderPass, type Texture} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {GPUVectorModel, type GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {
  createGPUVectorStyleBuffer,
  getGPUVectorStyleBufferBinding,
  getGPUVectorBuffer,
  getGPUVectorLayerBatches,
  getGPUVectorPickingProvenance,
  makeGPUVectorBufferLayout,
  resizeGPUVectorStyleBuffer,
  type GPUVectorLayerPickingInfo
} from './gpu-vector-layer-utils';

/** GPUVector-native icon props with adapter-prepared atlas metadata. */
export type GPUIconLayerProps = Omit<LayerProps, 'data'> & {
  iconAtlas: Texture;
  getPosition: GPUVector<'float32x2'>;
  iconOffsets: GPUVector<'float32x2'>;
  iconFrames: GPUVector<'float32x4'>;
  iconColorModes: GPUVector<'float32'>;
  getColor?: Color | GPUVector<'unorm8x4'>;
  /** Icon height in pixels, matching IconLayer's default size basis. */
  getSize?: number | GPUVector<'float32'>;
  getAngle?: number | GPUVector<'float32'>;
  getPixelOffset?: GPUVector<'float32x2'>;
  sizeScale?: number;
  alphaCutoff?: number;
};

type GPUIconLayerState = {
  model: GPUVectorModel | null;
  styleBuffer: Buffer | null;
  defaults: Buffer[];
};

const GPU_ICON_SHADER = /* wgsl */ `
struct IconStyle { textureSize: vec2<f32>, color: vec4<f32>, size: f32, sizeScale: f32, alphaCutoff: f32, angle: f32, useColors: u32, useSizes: u32, useAngles: u32, rowIndexOffset: u32 };
@group(0) @binding(auto) var<uniform> iconStyle: IconStyle;
@group(0) @binding(auto) var iconTexture: texture_2d<f32>;
@group(0) @binding(auto) var iconTextureSampler: sampler;
struct VertexOutput { @builtin(position) position: vec4<f32>, @location(0) uv: vec2<f32>, @location(1) color: vec4<f32>, @location(2) colorMode: f32, @location(3) @interpolate(flat) pickingColor: vec3<f32> };
fn encodePickingColor(rowIndex: u32) -> vec3<f32> { let value = rowIndex + 1u; return vec3<f32>(f32(value % 256u), f32((value / 256u) % 256u), f32((value / 65536u) % 256u)) / 255.0; }
fn getCorner(vertexIndex: u32) -> vec2<f32> { let corners = array<vec2<f32>, 6>(vec2<f32>(-1.0,-1.0),vec2<f32>(1.0,-1.0),vec2<f32>(-1.0,1.0),vec2<f32>(-1.0,1.0),vec2<f32>(1.0,-1.0),vec2<f32>(1.0,1.0)); return corners[vertexIndex]; }
@vertex fn vertexMain(@location(0) positions: vec2<f32>, @location(1) offsets: vec2<f32>, @location(2) frames: vec4<f32>, @location(3) colorModes: f32, @location(4) colors: vec4<f32>, @location(5) sizes: f32, @location(6) angles: f32, @location(7) pixelOffsets: vec2<f32>, @builtin(vertex_index) vertexIndex: u32, @builtin(instance_index) instanceIndex: u32) -> VertexOutput {
  let corner = getCorner(vertexIndex); let size = select(iconStyle.size, sizes, iconStyle.useSizes != 0u) * iconStyle.sizeScale;
  let angle = select(iconStyle.angle, angles, iconStyle.useAngles != 0u); let radians = angle * 0.01745329252; let rotation = mat2x2<f32>(cos(radians), sin(radians), -sin(radians), cos(radians));
  let frameSize = frames.w;
  let pixel = rotation * ((corner * frames.zw * 0.5 + offsets) * size / max(frameSize, 1.0)) + pixelOffsets;
  let pickingColor = encodePickingColor(instanceIndex + iconStyle.rowIndexOffset); geometry.worldPosition = vec3<f32>(positions, 0.0); geometry.pickingColor = pickingColor;
  var clip = project_position_to_clipspace(vec3<f32>(positions,0.0),vec3<f32>(0.0),vec3<f32>(0.0)); clip = vec4<f32>(clip.xy + project_pixel_size_to_clipspace(pixel), clip.z, clip.w);
  var output: VertexOutput; output.position = clip; output.uv = (frames.xy + (corner * 0.5 + 0.5) * frames.zw) / iconStyle.textureSize; output.color = select(iconStyle.color, colors, iconStyle.useColors != 0u); output.colorMode = colorModes; output.pickingColor = pickingColor; return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> { let sample = textureSample(iconTexture, iconTextureSampler, input.uv); if (sample.a < iconStyle.alphaCutoff) { discard; } if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor,1.0); } let rgb = select(sample.rgb, input.color.rgb, input.colorMode > 0.5); return vec4<f32>(rgb, sample.a * input.color.a * layer.opacity); }
`;

/** Chunk-preserving GPUVector icon layer. */
export class GPUIconLayer extends Layer<GPUIconLayerProps> {
  static override layerName = 'GPUIconLayer';
  override getAttributeManager() {
    return null;
  }
  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUIconLayer requires WebGPU');
    const colors = isGPUVector(this.props.getColor) ? this.props.getColor : undefined;
    const sizes = isGPUVector(this.props.getSize) ? this.props.getSize : undefined;
    const angles = isGPUVector(this.props.getAngle) ? this.props.getAngle : undefined;
    getGPUVectorLayerBatches(
      this.id,
      {
        positions: this.props.getPosition,
        offsets: this.props.iconOffsets,
        frames: this.props.iconFrames,
        colorModes: this.props.iconColorModes,
        colors,
        sizes,
        angles,
        pixelOffsets: this.props.getPixelOffset
      },
      {
        positions: ['float32x2'],
        offsets: ['float32x2'],
        frames: ['float32x4'],
        colorModes: ['float32'],
        colors: ['unorm8x4'],
        sizes: ['float32'],
        angles: ['float32'],
        pixelOffsets: ['float32x2']
      }
    );
    if (this.props.getPosition.data.length === 0) {
      this.setState({model: null, styleBuffer: null, defaults: []} satisfies GPUIconLayerState);
      return;
    }
    const styleBuffer = createGPUVectorStyleBuffer(
      device,
      `${this.id}-style`,
      64,
      this.props.getPosition.data.length
    );
    const defaults = [
      device.createBuffer({data: new Uint8Array([0, 0, 0, 255])}),
      device.createBuffer({data: new Float32Array([1])}),
      device.createBuffer({data: new Float32Array([0])}),
      device.createBuffer({data: new Float32Array([0, 0])})
    ];
    const optional = [colors, sizes, angles, this.props.getPixelOffset] as const;
    const names = ['colors', 'sizes', 'angles', 'pixelOffsets'];
    const formats = ['unorm8x4', 'float32', 'float32', 'float32x2'] as const;
    const attributes: Record<string, Buffer> = {
      positions: getGPUVectorBuffer(this.props.getPosition),
      offsets: getGPUVectorBuffer(this.props.iconOffsets),
      frames: getGPUVectorBuffer(this.props.iconFrames),
      colorModes: getGPUVectorBuffer(this.props.iconColorModes)
    };
    const layouts = [
      makeGPUVectorBufferLayout(this.props.getPosition, 'positions'),
      makeGPUVectorBufferLayout(this.props.iconOffsets, 'offsets'),
      makeGPUVectorBufferLayout(this.props.iconFrames, 'frames'),
      makeGPUVectorBufferLayout(this.props.iconColorModes, 'colorModes')
    ];
    optional.forEach((vector, index) => {
      attributes[names[index]!] = vector ? getGPUVectorBuffer(vector) : defaults[index]!;
      layouts.push(
        vector
          ? makeGPUVectorBufferLayout(vector, names[index]!)
          : {
              name: names[index]!,
              byteStride: 0,
              stepMode: 'instance',
              attributes: [{attribute: names[index]!, format: formats[index]!, byteOffset: 0}]
            }
      );
    });
    const model = new GPUVectorModel(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_ICON_SHADER}),
      id: `${this.id}-model`,
      topology: 'triangle-list',
      isInstanced: true,
      vertexCount: 6,
      instanceCount: 0,
      attributes,
      bufferLayout: layouts,
      bindings: {
        iconStyle: getGPUVectorStyleBufferBinding(styleBuffer, 64),
        iconTexture: this.props.iconAtlas
      }
    });
    model.userData['boundInputs'] = [
      this.props.getPosition,
      this.props.iconOffsets,
      this.props.iconFrames,
      this.props.iconColorModes,
      colors,
      sizes,
      angles,
      this.props.getPixelOffset,
      this.props.iconAtlas
    ];
    this.setState({model, styleBuffer, defaults} satisfies GPUIconLayerState);
  }
  override getModels(): Model[] {
    const model = (this.state as GPUIconLayerState).model;
    return model ? [model] : [];
  }
  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPUIconLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    const colors = isGPUVector(props.getColor) ? props.getColor : undefined;
    const sizes = isGPUVector(props.getSize) ? props.getSize : undefined;
    const angles = isGPUVector(props.getAngle) ? props.getAngle : undefined;
    if (
      props.getPosition !== boundInputs[0] ||
      props.iconOffsets !== boundInputs[1] ||
      props.iconFrames !== boundInputs[2] ||
      props.iconColorModes !== boundInputs[3] ||
      colors !== boundInputs[4] ||
      sizes !== boundInputs[5] ||
      angles !== boundInputs[6] ||
      props.getPixelOffset !== boundInputs[7] ||
      props.iconAtlas !== boundInputs[8]
    ) {
      this.destroyResources();
      this.initializeState(this.context);
    }
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model} = this.state as GPUIconLayerState;
    const {styleBuffer: previousStyleBuffer} = this.state as GPUIconLayerState;
    if (!model || !previousStyleBuffer) return;
    const styleBuffer = resizeGPUVectorStyleBuffer(
      previousStyleBuffer,
      64,
      this.props.getPosition.data.length
    );
    if (styleBuffer !== previousStyleBuffer) {
      this.setState({styleBuffer});
      model.setBindings({iconStyle: getGPUVectorStyleBufferBinding(styleBuffer, 64)});
    }
    const colors = isGPUVector(this.props.getColor) ? this.props.getColor : undefined;
    const sizes = isGPUVector(this.props.getSize) ? this.props.getSize : undefined;
    const angles = isGPUVector(this.props.getAngle) ? this.props.getAngle : undefined;
    const [r, g, b, a = 255] = isColor(this.props.getColor) ? this.props.getColor : [0, 0, 0, 255];
    const bytes = new ArrayBuffer(64);
    const floats = new Float32Array(bytes);
    const uints = new Uint32Array(bytes);
    floats.set([this.props.iconAtlas.width, this.props.iconAtlas.height]);
    floats.set([r / 255, g / 255, b / 255, a / 255], 4);
    floats.set(
      [
        typeof this.props.getSize === 'number' ? this.props.getSize : 1,
        this.props.sizeScale ?? 1,
        this.props.alphaCutoff ?? 0.05,
        typeof this.props.getAngle === 'number' ? this.props.getAngle : 0
      ],
      8
    );
    uints.set([colors ? 1 : 0, sizes ? 1 : 0, angles ? 1 : 0, 0], 12);
    model.drawBatches(renderPass, {
      vectors: {
        positions: this.props.getPosition,
        offsets: this.props.iconOffsets,
        frames: this.props.iconFrames,
        colorModes: this.props.iconColorModes,
        colors,
        sizes,
        angles,
        pixelOffsets: this.props.getPixelOffset
      },
      onBatch: batch => {
        uints[15] = batch.rowIndexOffset;
        const binding = getGPUVectorStyleBufferBinding(styleBuffer, 64, batch.batchIndex);
        styleBuffer.write(new Uint8Array(bytes), binding.offset);
        model.setBindings({iconStyle: binding});
      }
    });
  }
  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    const result = info as GPUVectorLayerPickingInfo;
    result.gpuVector = getGPUVectorPickingProvenance(this.props.getPosition, result.index);
    return result;
  }
  override finalizeState(context: LayerContext): void {
    this.destroyResources();
    super.finalizeState(context);
  }
  private destroyResources(): void {
    const state = this.state as GPUIconLayerState;
    state.model?.destroy();
    state.styleBuffer?.destroy();
    state.defaults.forEach(buffer => buffer.destroy());
    this.setState({model: null, styleBuffer: null, defaults: []});
  }
}
function isGPUVector(value: unknown): value is GPUVector {
  return Boolean(value && typeof value === 'object' && 'data' in value && 'format' in value);
}
function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
