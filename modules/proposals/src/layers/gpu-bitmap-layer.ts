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
import {Buffer, type RenderPass, type Texture} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';

/** Bounds of one bitmap in source coordinates: left, bottom, right, top. */
export type GPUBitmapBounds = readonly [number, number, number, number];

/** Texture-native bitmap props. Loading URLs and images belongs in an adapter. */
export type GPUBitmapLayerProps = Omit<LayerProps, 'data'> & {
  image: Texture;
  bounds: GPUBitmapBounds;
  tintColor?: Color;
  transparentColor?: Color;
};

type GPUBitmapLayerState = {model: Model | null; styleBuffer: Buffer | null};

const GPU_BITMAP_SHADER = /* wgsl */ `
struct BitmapStyle {
  bounds: vec4<f32>,
  tintColor: vec4<f32>,
  transparentColor: vec4<f32>,
};
@group(0) @binding(auto) var<uniform> bitmapStyle: BitmapStyle;
@group(0) @binding(auto) var bitmapTexture: texture_2d<f32>;
@group(0) @binding(auto) var bitmapSampler: sampler;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) uv: vec2<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0), vec2<f32>(1.0, 0.0), vec2<f32>(0.0, 1.0),
    vec2<f32>(0.0, 1.0), vec2<f32>(1.0, 0.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex];
}

@vertex fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
  let corner = getCorner(vertexIndex);
  let position = vec2<f32>(
    mix(bitmapStyle.bounds.x, bitmapStyle.bounds.z, corner.x),
    mix(bitmapStyle.bounds.y, bitmapStyle.bounds.w, corner.y)
  );
  geometry.worldPosition = vec3<f32>(position, 0.0);
  geometry.pickingColor = vec3<f32>(1.0 / 255.0, 0.0, 0.0);
  var output: VertexOutput;
  output.position = project_position_to_clipspace(vec3<f32>(position, 0.0), vec3<f32>(0.0), vec3<f32>(0.0));
  output.uv = vec2<f32>(corner.x, 1.0 - corner.y);
  output.pickingColor = geometry.pickingColor;
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); }
  let sampled = textureSample(bitmapTexture, bitmapSampler, input.uv);
  let transparentDistance = distance(sampled.rgb, bitmapStyle.transparentColor.rgb);
  let alpha = select(sampled.a, 0.0, transparentDistance < 0.001 && bitmapStyle.transparentColor.a >= 0.0);
  return vec4<f32>(sampled.rgb * bitmapStyle.tintColor.rgb, alpha * bitmapStyle.tintColor.a * layer.opacity);
}`;

/** Direct texture-backed bitmap core. This layer has no tabular input to convert to GPUVectors. */
export class GPUBitmapLayer extends Layer<GPUBitmapLayerProps> {
  static override layerName = 'GPUBitmapLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUBitmapLayer requires WebGPU');
    const styleBuffer = device.createBuffer({
      id: `${this.id}-style`,
      byteLength: 48,
      usage: Buffer.UNIFORM | Buffer.COPY_DST
    });
    const model = new Model(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_BITMAP_SHADER}),
      id: `${this.id}-model`,
      topology: 'triangle-list',
      vertexCount: 6,
      bindings: {
        bitmapStyle: styleBuffer,
        bitmapTexture: this.props.image,
        bitmapSampler: this.props.image.sampler
      }
    });
    model.userData['boundInputs'] = [this.props.image];
    this.setState({model, styleBuffer} satisfies GPUBitmapLayerState);
  }

  override getModels(): Model[] {
    const model = (this.state as GPUBitmapLayerState).model;
    return model ? [model] : [];
  }

  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPUBitmapLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    if (props.image !== boundInputs[0]) {
      this.destroyResources();
      this.initializeState(this.context);
    }
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model, styleBuffer} = this.state as GPUBitmapLayerState;
    if (!model || !styleBuffer) return;
    const tintColor: Color = this.props.tintColor ?? [255, 255, 255, 255];
    const transparentColor = this.props.transparentColor;
    const values = new Float32Array(12);
    values.set(this.props.bounds);
    values.set(normalizeColor(tintColor), 4);
    values.set(transparentColor ? normalizeColor(transparentColor) : [0, 0, 0, -1], 8);
    styleBuffer.write(values);
    model.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    if (info.index >= 0) info.index = 0;
    return info;
  }

  override finalizeState(context: LayerContext): void {
    this.destroyResources();
    super.finalizeState(context);
  }

  private destroyResources(): void {
    const state = this.state as GPUBitmapLayerState;
    state.model?.destroy();
    state.styleBuffer?.destroy();
    this.setState({model: null, styleBuffer: null});
  }
}

function normalizeColor(color: Color): [number, number, number, number] {
  return [color[0] / 255, color[1] / 255, color[2] / 255, (color[3] ?? 255) / 255];
}
