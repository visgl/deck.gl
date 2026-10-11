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
import type {RenderPass} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {GPUConstant, type GPUVector, type VertexList} from '@luma.gl/gpgpu/gpu-data';
import {PolygonAttributeModel} from '@luma.gl/experimental/models';
import {
  getGPUVectorPickingProvenance,
  type GPUVectorLayerPickingInfo
} from './gpu-vector-layer-utils';

/** GPUVector-native tessellated filled-polygon props. Input vectors are borrowed. */
export type GPUSolidPolygonLayerProps = Omit<LayerProps, 'data'> & {
  positions: GPUVector<VertexList<'float32x4'>>;
  rowIndices: GPUVector<VertexList<'uint32'>>;
  indices: GPUVector<VertexList<'uint32'>>;
  getFillColor?: Color | GPUVector<VertexList<'unorm8x4'>>;
};

type GPUSolidPolygonLayerState = {model: PolygonAttributeModel | null};

const GPU_SOLID_POLYGON_SHADER = /* wgsl */ `
struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

fn encodePickingColor(rowIndex: u32) -> vec3<f32> {
  let value = rowIndex + 1u;
  return vec3<f32>(f32(value % 256u), f32((value / 256u) % 256u), f32((value / 65536u) % 256u)) / 255.0;
}

@vertex fn vertexMain(
  @location(0) positions: vec4<f32>,
  @location(1) colors: vec4<f32>,
  @location(2) rowIndices: u32
) -> VertexOutput {
  let pickingColor = encodePickingColor(rowIndices);
  geometry.worldPosition = positions.xyz;
  geometry.pickingColor = pickingColor;
  var output: VertexOutput;
  output.position = project_position_to_clipspace(positions.xyz, vec3<f32>(0.0), vec3<f32>(0.0));
  output.color = colors;
  output.pickingColor = pickingColor;
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); }
  return vec4<f32>(input.color.rgb, input.color.a * layer.opacity);
}`;

/** Deck host for already tessellated polygon GPUVectors. Tessellation belongs in adapters. */
export class GPUSolidPolygonLayer extends Layer<GPUSolidPolygonLayerProps> {
  static override layerName = 'GPUSolidPolygonLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUSolidPolygonLayer requires WebGPU');
    this.setState({model: null});
    this.createModel();
  }

  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPUSolidPolygonLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    if (
      props.positions !== boundInputs[0] ||
      props.rowIndices !== boundInputs[1] ||
      props.indices !== boundInputs[2] ||
      props.getFillColor !== boundInputs[3]
    ) {
      this.destroyModel();
      this.createModel();
    }
  }

  override getModels(): Model[] {
    const model = (this.state as GPUSolidPolygonLayerState | undefined)?.model;
    return model ? [model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    (this.state as GPUSolidPolygonLayerState).model?.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    const result = info as GPUVectorLayerPickingInfo;
    result.gpuVector = getGPUVectorPickingProvenance(this.props.positions, result.index);
    return result;
  }

  override finalizeState(context: LayerContext): void {
    this.destroyModel();
    super.finalizeState(context);
  }

  private createModel(): void {
    const shaderProps = this.getShaders({
      modules: [project32, picking],
      source: GPU_SOLID_POLYGON_SHADER
    });
    const color = isGPUVector(this.props.getFillColor)
      ? this.props.getFillColor
      : new GPUConstant({
          format: 'unorm8x4',
          value: new Uint8Array(this.props.getFillColor ?? [0, 0, 0, 255])
        });
    const model = new PolygonAttributeModel(this.context.device, {
      ...shaderProps,
      id: `${this.id}-model`,
      positions: this.props.positions,
      colors: color,
      rowIndices: this.props.rowIndices,
      indices: this.props.indices,
      shaderInputs: shaderProps.shaderInputs as never
    });
    model.userData['boundInputs'] = [
      this.props.positions,
      this.props.rowIndices,
      this.props.indices,
      this.props.getFillColor
    ];
    this.setState({model} satisfies GPUSolidPolygonLayerState);
  }

  private destroyModel(): void {
    const state = this.state as GPUSolidPolygonLayerState | undefined;
    state?.model?.destroy();
    if (state) this.setState({model: null});
  }
}

function isGPUVector(value: unknown): value is GPUVector {
  return Boolean(value && typeof value === 'object' && 'data' in value && 'format' in value);
}
