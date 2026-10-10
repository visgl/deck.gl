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
import {type Buffer, type RenderPass} from '@luma.gl/core';
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

/** GPUVector-native point-cloud props. Input vectors are borrowed. */
export type GPUPointCloudLayerProps = Omit<LayerProps, 'data'> & {
  getPosition: GPUVector<'float32x3'>;
  getNormal?: GPUVector<'float32x3'>;
  getColor?: Color | GPUVector<'unorm8x4'>;
  pointSize?: number;
};

type GPUPointCloudLayerState = {
  model: GPUVectorModel | null;
  styleBuffer: Buffer | null;
  defaults: Buffer[];
};

const GPU_POINT_CLOUD_SHADER = /* wgsl */ `
struct PointCloudStyle {
  color: vec4<f32>,
  pointSize: f32,
  useColors: u32,
  useNormals: u32,
  rowIndexOffset: u32,
};
@group(0) @binding(auto) var<uniform> pointCloudStyle: PointCloudStyle;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) corner: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) lighting: f32,
  @location(3) @interpolate(flat) pickingColor: vec3<f32>,
};

fn encodePickingColor(rowIndex: u32) -> vec3<f32> {
  let value = rowIndex + 1u;
  return vec3<f32>(f32(value % 256u), f32((value / 256u) % 256u), f32((value / 65536u) % 256u)) / 255.0;
}

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex];
}

@vertex fn vertexMain(
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) colors: vec4<f32>,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  let corner = getCorner(vertexIndex);
  let pickingColor = encodePickingColor(instanceIndex + pointCloudStyle.rowIndexOffset);
  var clipPosition = project_position_to_clipspace(positions, vec3<f32>(0.0), vec3<f32>(0.0));
  clipPosition = vec4<f32>(clipPosition.xy + project_pixel_size_to_clipspace(corner * pointCloudStyle.pointSize * 0.5), clipPosition.z, clipPosition.w);
  geometry.worldPosition = positions;
  geometry.pickingColor = pickingColor;
  var output: VertexOutput;
  output.position = clipPosition;
  output.corner = corner;
  output.color = select(pointCloudStyle.color, colors, pointCloudStyle.useColors != 0u);
  output.lighting = select(1.0, 0.35 + 0.65 * abs(normalize(normals).z), pointCloudStyle.useNormals != 0u);
  output.pickingColor = pickingColor;
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  if (dot(input.corner, input.corner) > 1.0) { discard; }
  if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); }
  return vec4<f32>(input.color.rgb * input.lighting, input.color.a * layer.opacity);
}`;

/** Chunk-preserving GPUVector point-cloud layer. */
export class GPUPointCloudLayer extends Layer<GPUPointCloudLayerProps> {
  static override layerName = 'GPUPointCloudLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUPointCloudLayer requires WebGPU');
    const colors = isGPUVector(this.props.getColor) ? this.props.getColor : undefined;
    getGPUVectorLayerBatches(
      this.id,
      {positions: this.props.getPosition, normals: this.props.getNormal, colors},
      {positions: ['float32x3'], normals: ['float32x3'], colors: ['unorm8x4']}
    );
    if (this.props.getPosition.data.length === 0) {
      this.setState({
        model: null,
        styleBuffer: null,
        defaults: []
      } satisfies GPUPointCloudLayerState);
      return;
    }
    const styleBuffer = createGPUVectorStyleBuffer(
      device,
      `${this.id}-style`,
      32,
      this.props.getPosition.data.length
    );
    const defaultNormal = device.createBuffer({data: new Float32Array([0, 0, 1])});
    const defaultColor = device.createBuffer({data: new Uint8Array([0, 0, 0, 255])});
    const model = new GPUVectorModel(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_POINT_CLOUD_SHADER}),
      id: `${this.id}-model`,
      topology: 'triangle-list',
      isInstanced: true,
      vertexCount: 6,
      instanceCount: 0,
      attributes: {
        positions: getGPUVectorBuffer(this.props.getPosition),
        normals: this.props.getNormal ? getGPUVectorBuffer(this.props.getNormal) : defaultNormal,
        colors: colors ? getGPUVectorBuffer(colors) : defaultColor
      },
      bufferLayout: [
        makeGPUVectorBufferLayout(this.props.getPosition, 'positions'),
        this.props.getNormal
          ? makeGPUVectorBufferLayout(this.props.getNormal, 'normals')
          : makeConstantLayout('normals', 'float32x3'),
        colors
          ? makeGPUVectorBufferLayout(colors, 'colors')
          : makeConstantLayout('colors', 'unorm8x4')
      ],
      bindings: {pointCloudStyle: getGPUVectorStyleBufferBinding(styleBuffer, 32)}
    });
    model.userData['boundInputs'] = [this.props.getPosition, this.props.getNormal, colors];
    this.setState({model, styleBuffer, defaults: [defaultNormal, defaultColor]});
  }

  override getModels(): Model[] {
    return (this.state as GPUPointCloudLayerState).model
      ? [(this.state as GPUPointCloudLayerState).model!]
      : [];
  }

  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPUPointCloudLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    const colors = isGPUVector(props.getColor) ? props.getColor : undefined;
    if (
      props.getPosition !== boundInputs[0] ||
      props.getNormal !== boundInputs[1] ||
      colors !== boundInputs[2]
    ) {
      this.destroyResources();
      this.initializeState(this.context);
    }
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model} = this.state as GPUPointCloudLayerState;
    const {styleBuffer: previousStyleBuffer} = this.state as GPUPointCloudLayerState;
    if (!model || !previousStyleBuffer) return;
    const styleBuffer = resizeGPUVectorStyleBuffer(
      previousStyleBuffer,
      32,
      this.props.getPosition.data.length
    );
    if (styleBuffer !== previousStyleBuffer) {
      this.setState({styleBuffer});
      model.setBindings({pointCloudStyle: getGPUVectorStyleBufferBinding(styleBuffer, 32)});
    }
    const colors = isGPUVector(this.props.getColor) ? this.props.getColor : undefined;
    const [red, green, blue, alpha = 255] = isColor(this.props.getColor)
      ? this.props.getColor
      : [0, 0, 0, 255];
    const bytes = new ArrayBuffer(32);
    const floats = new Float32Array(bytes);
    const uints = new Uint32Array(bytes);
    floats.set([red / 255, green / 255, blue / 255, alpha / 255, this.props.pointSize ?? 1]);
    uints.set([colors ? 1 : 0, this.props.getNormal ? 1 : 0, 0], 5);
    model.drawBatches(renderPass, {
      vectors: {positions: this.props.getPosition, normals: this.props.getNormal, colors},
      onBatch: batch => {
        uints[7] = batch.rowIndexOffset;
        const binding = getGPUVectorStyleBufferBinding(styleBuffer, 32, batch.batchIndex);
        styleBuffer.write(new Uint8Array(bytes), binding.offset);
        model.setBindings({pointCloudStyle: binding});
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
    const state = this.state as GPUPointCloudLayerState;
    state.model?.destroy();
    state.styleBuffer?.destroy();
    state.defaults.forEach(buffer => buffer.destroy());
    this.setState({model: null, styleBuffer: null, defaults: []});
  }
}

function makeConstantLayout(name: string, format: 'float32x3' | 'unorm8x4') {
  return {
    name,
    byteStride: 0,
    stepMode: 'instance' as const,
    attributes: [{attribute: name, format}]
  };
}

function isGPUVector(value: unknown): value is GPUVector {
  return Boolean(value && typeof value === 'object' && 'data' in value && 'format' in value);
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
