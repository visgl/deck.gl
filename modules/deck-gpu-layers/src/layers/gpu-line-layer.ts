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

/** GPUVector-native straight line props. All input vectors are borrowed. */
export type GPULineLayerProps = Omit<LayerProps, 'data'> & {
  getSourcePosition: GPUVector<'float32x2'>;
  getTargetPosition: GPUVector<'float32x2'>;
  getColor?: Color | GPUVector<'unorm8x4'>;
  getWidth?: number | GPUVector<'float32'>;
  widthScale?: number;
  widthMinPixels?: number;
  widthMaxPixels?: number;
};

type GPULineLayerState = {
  model: GPUVectorModel | null;
  styleBuffer: Buffer | null;
  defaults: Buffer[];
};

const GPU_LINE_SHADER = /* wgsl */ `
struct LineStyle {
  color: vec4<f32>,
  width: f32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  useColors: u32,
  useWidths: u32,
  rowIndexOffset: u32,
  _padding: u32,
};
@group(0) @binding(auto) var<uniform> lineStyle: LineStyle;
struct VertexOutput { @builtin(position) position: vec4<f32>, @location(0) color: vec4<f32>, @location(1) @interpolate(flat) pickingColor: vec3<f32> };
fn encodePickingColor(rowIndex: u32) -> vec3<f32> { let value = rowIndex + 1u; return vec3<f32>(f32(value % 256u), f32((value / 256u) % 256u), f32((value / 65536u) % 256u)) / 255.0; }
fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(0.0, 1.0),
    vec2<f32>(0.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex];
}
@vertex fn vertexMain(
  @location(0) sourcePositions: vec2<f32>,
  @location(1) targetPositions: vec2<f32>,
  @location(2) colors: vec4<f32>,
  @location(3) widths: f32,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  let corner = getCorner(vertexIndex);
  let sourceClip = project_position_to_clipspace(vec3<f32>(sourcePositions, 0.0), vec3<f32>(0.0), vec3<f32>(0.0));
  let targetClip = project_position_to_clipspace(vec3<f32>(targetPositions, 0.0), vec3<f32>(0.0), vec3<f32>(0.0));
  let delta = targetClip.xy / targetClip.w - sourceClip.xy / sourceClip.w;
  let direction = select(vec2<f32>(1.0, 0.0), normalize(delta), length(delta) > 0.000001);
  let normal = vec2<f32>(-direction.y, direction.x);
  let width = clamp(
    select(lineStyle.width, widths, lineStyle.useWidths != 0u) * lineStyle.widthScale,
    lineStyle.widthMinPixels,
    lineStyle.widthMaxPixels
  );
  var clipPosition = mix(sourceClip, targetClip, corner.x);
  clipPosition = vec4<f32>(clipPosition.xy + project_pixel_size_to_clipspace(normal * corner.y * width * 0.5), clipPosition.z, clipPosition.w);
  let pickingColor = encodePickingColor(instanceIndex + lineStyle.rowIndexOffset);
  geometry.worldPosition = vec3<f32>(mix(sourcePositions, targetPositions, corner.x), 0.0); geometry.pickingColor = pickingColor;
  var output: VertexOutput;
  output.position = clipPosition;
  output.color = select(lineStyle.color, colors, lineStyle.useColors != 0u);
  output.pickingColor = pickingColor;
  return output;
}
@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> { if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); } return vec4<f32>(input.color.rgb, input.color.a * layer.opacity); }
`;

/** Chunk-preserving GPUVector straight-line layer. */
export class GPULineLayer extends Layer<GPULineLayerProps> {
  static override layerName = 'GPULineLayer';
  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPULineLayer requires WebGPU');
    const colors = isGPUVector(this.props.getColor) ? this.props.getColor : undefined;
    const widths = isGPUVector(this.props.getWidth) ? this.props.getWidth : undefined;
    getGPUVectorLayerBatches(
      this.id,
      {
        sourcePositions: this.props.getSourcePosition,
        targetPositions: this.props.getTargetPosition,
        colors,
        widths
      },
      {
        sourcePositions: ['float32x2'],
        targetPositions: ['float32x2'],
        colors: ['unorm8x4'],
        widths: ['float32']
      }
    );
    if (this.props.getSourcePosition.data.length === 0) {
      this.setState({model: null, styleBuffer: null, defaults: []} satisfies GPULineLayerState);
      return;
    }
    const styleBuffer = createGPUVectorStyleBuffer(
      device,
      `${this.id}-style`,
      48,
      this.props.getSourcePosition.data.length
    );
    const defaultColor = device.createBuffer({
      id: `${this.id}-default-color`,
      data: new Uint8Array([0, 0, 0, 255])
    });
    const defaultWidth = device.createBuffer({
      id: `${this.id}-default-width`,
      data: new Float32Array([1])
    });
    const model = new GPUVectorModel(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_LINE_SHADER}),
      id: `${this.id}-model`,
      topology: 'triangle-list',
      isInstanced: true,
      vertexCount: 6,
      instanceCount: 0,
      attributes: {
        sourcePositions: getGPUVectorBuffer(this.props.getSourcePosition),
        targetPositions: getGPUVectorBuffer(this.props.getTargetPosition),
        colors: colors ? getGPUVectorBuffer(colors) : defaultColor,
        widths: widths ? getGPUVectorBuffer(widths) : defaultWidth
      },
      bufferLayout: [
        makeGPUVectorBufferLayout(this.props.getSourcePosition, 'sourcePositions'),
        makeGPUVectorBufferLayout(this.props.getTargetPosition, 'targetPositions'),
        colors
          ? makeGPUVectorBufferLayout(colors, 'colors')
          : {
              name: 'colors',
              byteStride: 0,
              stepMode: 'instance',
              attributes: [{attribute: 'colors', format: 'unorm8x4'}]
            },
        widths
          ? makeGPUVectorBufferLayout(widths, 'widths')
          : {
              name: 'widths',
              byteStride: 0,
              stepMode: 'instance',
              attributes: [{attribute: 'widths', format: 'float32'}]
            }
      ],
      bindings: {lineStyle: getGPUVectorStyleBufferBinding(styleBuffer, 48)}
    });
    model.userData['boundInputs'] = [
      this.props.getSourcePosition,
      this.props.getTargetPosition,
      colors,
      widths
    ];
    this.setState({
      model,
      styleBuffer,
      defaults: [defaultColor, defaultWidth]
    } satisfies GPULineLayerState);
  }

  override getModels(): Model[] {
    const model = (this.state as GPULineLayerState).model;
    return model ? [model] : [];
  }
  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPULineLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    const colors = isGPUVector(props.getColor) ? props.getColor : undefined;
    const widths = isGPUVector(props.getWidth) ? props.getWidth : undefined;
    if (
      props.getSourcePosition !== boundInputs[0] ||
      props.getTargetPosition !== boundInputs[1] ||
      colors !== boundInputs[2] ||
      widths !== boundInputs[3]
    ) {
      this.destroyResources();
      this.initializeState(this.context);
    }
  }
  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model} = this.state as GPULineLayerState;
    const {styleBuffer: previousStyleBuffer} = this.state as GPULineLayerState;
    if (!model || !previousStyleBuffer) return;
    const styleBuffer = resizeGPUVectorStyleBuffer(
      previousStyleBuffer,
      48,
      this.props.getSourcePosition.data.length
    );
    if (styleBuffer !== previousStyleBuffer) {
      this.setState({styleBuffer});
      model.setBindings({lineStyle: getGPUVectorStyleBufferBinding(styleBuffer, 48)});
    }
    const colors = isGPUVector(this.props.getColor) ? this.props.getColor : undefined;
    const widths = isGPUVector(this.props.getWidth) ? this.props.getWidth : undefined;
    const [red, green, blue, alpha = 255] = isColor(this.props.getColor)
      ? this.props.getColor
      : [0, 0, 0, 255];
    const bytes = new ArrayBuffer(48);
    const floats = new Float32Array(bytes);
    const uints = new Uint32Array(bytes);
    floats.set([
      red / 255,
      green / 255,
      blue / 255,
      alpha / 255,
      typeof this.props.getWidth === 'number' ? this.props.getWidth : 1,
      this.props.widthScale ?? 1,
      this.props.widthMinPixels ?? 0,
      this.props.widthMaxPixels ?? 1e9
    ]);
    uints.set([colors ? 1 : 0, widths ? 1 : 0, 0, 0], 8);
    model.drawBatches(renderPass, {
      vectors: {
        sourcePositions: this.props.getSourcePosition,
        targetPositions: this.props.getTargetPosition,
        colors,
        widths
      },
      onBatch: batch => {
        uints[10] = batch.rowIndexOffset;
        const binding = getGPUVectorStyleBufferBinding(styleBuffer, 48, batch.batchIndex);
        styleBuffer.write(new Uint8Array(bytes), binding.offset);
        model.setBindings({lineStyle: binding});
      }
    });
  }
  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    const pickingInfo = info as GPUVectorLayerPickingInfo;
    pickingInfo.gpuVector = getGPUVectorPickingProvenance(
      this.props.getSourcePosition,
      pickingInfo.index
    );
    return pickingInfo;
  }
  override finalizeState(context: LayerContext): void {
    this.destroyResources();
    super.finalizeState(context);
  }
  private destroyResources(): void {
    const state = this.state as GPULineLayerState;
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
