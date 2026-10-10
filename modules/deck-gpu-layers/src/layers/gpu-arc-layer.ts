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

/** GPUVector-native curved-arc props. Input vectors are borrowed. */
export type GPUArcLayerProps = Omit<LayerProps, 'data'> & {
  getSourcePosition: GPUVector<'float32x2'>;
  getTargetPosition: GPUVector<'float32x2'>;
  getSourceColor?: Color | GPUVector<'unorm8x4'>;
  getTargetColor?: Color | GPUVector<'unorm8x4'>;
  getWidth?: number | GPUVector<'float32'>;
  getHeight?: number | GPUVector<'float32'>;
  widthScale?: number;
  widthMinPixels?: number;
  widthMaxPixels?: number;
  numSegments?: number;
};

type GPUArcLayerState = {
  model: GPUVectorModel | null;
  styleBuffer: Buffer | null;
  defaults: Buffer[];
};

const GPU_ARC_SHADER = /* wgsl */ `
struct ArcStyle {
  sourceColor: vec4<f32>,
  targetColor: vec4<f32>,
  width: f32,
  height: f32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  numSegments: u32,
  useSourceColors: u32,
  useTargetColors: u32,
  useWidths: u32,
  useHeights: u32,
  rowIndexOffset: u32,
};
@group(0) @binding(auto) var<uniform> arcStyle: ArcStyle;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

fn encodePickingColor(rowIndex: u32) -> vec3<f32> {
  let value = rowIndex + 1u;
  return vec3<f32>(f32(value % 256u), f32((value / 256u) % 256u), f32((value / 65536u) % 256u)) / 255.0;
}

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(0.0, 1.0),
    vec2<f32>(0.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex % 6u];
}

fn getArcPosition(sourcePosition: vec2<f32>, targetPosition: vec2<f32>, progress: f32, height: f32) -> vec3<f32> {
  let linear = mix(sourcePosition, targetPosition, progress);
  return vec3<f32>(linear, 4.0 * progress * (1.0 - progress) * height);
}

@vertex fn vertexMain(
  @location(0) sourcePositions: vec2<f32>,
  @location(1) targetPositions: vec2<f32>,
  @location(2) sourceColors: vec4<f32>,
  @location(3) targetColors: vec4<f32>,
  @location(4) widths: f32,
  @location(5) heights: f32,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  let segmentIndex = vertexIndex / 6u;
  let corner = getCorner(vertexIndex);
  let startProgress = f32(segmentIndex) / f32(arcStyle.numSegments);
  let endProgress = f32(segmentIndex + 1u) / f32(arcStyle.numSegments);
  let height = select(arcStyle.height, heights, arcStyle.useHeights != 0u);
  let startWorld = getArcPosition(sourcePositions, targetPositions, startProgress, height);
  let endWorld = getArcPosition(sourcePositions, targetPositions, endProgress, height);
  let startClip = project_position_to_clipspace(startWorld, vec3<f32>(0.0), vec3<f32>(0.0));
  let endClip = project_position_to_clipspace(endWorld, vec3<f32>(0.0), vec3<f32>(0.0));
  let delta = endClip.xy / endClip.w - startClip.xy / startClip.w;
  let direction = select(vec2<f32>(1.0, 0.0), normalize(delta), length(delta) > 0.000001);
  let normal = vec2<f32>(-direction.y, direction.x);
  let width = clamp(select(arcStyle.width, widths, arcStyle.useWidths != 0u) * arcStyle.widthScale, arcStyle.widthMinPixels, arcStyle.widthMaxPixels);
  var clipPosition = mix(startClip, endClip, corner.x);
  clipPosition = vec4<f32>(clipPosition.xy + project_pixel_size_to_clipspace(normal * corner.y * width * 0.5) * clipPosition.w, clipPosition.z, clipPosition.w);
  let progress = mix(startProgress, endProgress, corner.x);
  let pickingColor = encodePickingColor(instanceIndex + arcStyle.rowIndexOffset);
  geometry.worldPosition = mix(startWorld, endWorld, corner.x);
  geometry.pickingColor = pickingColor;
  var output: VertexOutput;
  output.position = clipPosition;
  output.color = mix(
    select(arcStyle.sourceColor, sourceColors, arcStyle.useSourceColors != 0u),
    select(arcStyle.targetColor, targetColors, arcStyle.useTargetColors != 0u),
    progress
  );
  output.pickingColor = pickingColor;
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); }
  return vec4<f32>(input.color.rgb, input.color.a * layer.opacity);
}`;

/** Chunk-preserving GPUVector curved-arc layer. */
export class GPUArcLayer extends Layer<GPUArcLayerProps> {
  static override layerName = 'GPUArcLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUArcLayer requires WebGPU');
    const sourceColors = isGPUVector(this.props.getSourceColor)
      ? this.props.getSourceColor
      : undefined;
    const targetColors = isGPUVector(this.props.getTargetColor)
      ? this.props.getTargetColor
      : undefined;
    const widths = isGPUVector(this.props.getWidth) ? this.props.getWidth : undefined;
    const heights = isGPUVector(this.props.getHeight) ? this.props.getHeight : undefined;
    getGPUVectorLayerBatches(
      this.id,
      {
        sourcePositions: this.props.getSourcePosition,
        targetPositions: this.props.getTargetPosition,
        sourceColors,
        targetColors,
        widths,
        heights
      },
      {
        sourcePositions: ['float32x2'],
        targetPositions: ['float32x2'],
        sourceColors: ['unorm8x4'],
        targetColors: ['unorm8x4'],
        widths: ['float32'],
        heights: ['float32']
      }
    );
    if (this.props.getSourcePosition.data.length === 0) {
      this.setState({model: null, styleBuffer: null, defaults: []} satisfies GPUArcLayerState);
      return;
    }
    const styleBuffer = createGPUVectorStyleBuffer(
      device,
      `${this.id}-style`,
      80,
      this.props.getSourcePosition.data.length
    );
    const defaults = [
      device.createBuffer({data: new Uint8Array([0, 0, 0, 255])}),
      device.createBuffer({data: new Uint8Array([0, 0, 0, 255])}),
      device.createBuffer({data: new Float32Array([1])}),
      device.createBuffer({data: new Float32Array([1])})
    ];
    const model = new GPUVectorModel(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_ARC_SHADER}),
      id: `${this.id}-model`,
      topology: 'triangle-list',
      isInstanced: true,
      vertexCount: Math.max(1, this.props.numSegments ?? 32) * 6,
      instanceCount: 0,
      attributes: {
        sourcePositions: getGPUVectorBuffer(this.props.getSourcePosition),
        targetPositions: getGPUVectorBuffer(this.props.getTargetPosition),
        sourceColors: sourceColors ? getGPUVectorBuffer(sourceColors) : defaults[0]!,
        targetColors: targetColors ? getGPUVectorBuffer(targetColors) : defaults[1]!,
        widths: widths ? getGPUVectorBuffer(widths) : defaults[2]!,
        heights: heights ? getGPUVectorBuffer(heights) : defaults[3]!
      },
      bufferLayout: [
        makeGPUVectorBufferLayout(this.props.getSourcePosition, 'sourcePositions'),
        makeGPUVectorBufferLayout(this.props.getTargetPosition, 'targetPositions'),
        sourceColors
          ? makeGPUVectorBufferLayout(sourceColors, 'sourceColors')
          : makeConstantLayout('sourceColors', 'unorm8x4'),
        targetColors
          ? makeGPUVectorBufferLayout(targetColors, 'targetColors')
          : makeConstantLayout('targetColors', 'unorm8x4'),
        widths
          ? makeGPUVectorBufferLayout(widths, 'widths')
          : makeConstantLayout('widths', 'float32'),
        heights
          ? makeGPUVectorBufferLayout(heights, 'heights')
          : makeConstantLayout('heights', 'float32')
      ],
      bindings: {arcStyle: getGPUVectorStyleBufferBinding(styleBuffer, 80)}
    });
    model.userData['boundInputs'] = [
      this.props.getSourcePosition,
      this.props.getTargetPosition,
      sourceColors,
      targetColors,
      widths,
      heights,
      this.props.numSegments
    ];
    this.setState({model, styleBuffer, defaults} satisfies GPUArcLayerState);
  }

  override getModels(): Model[] {
    const model = (this.state as GPUArcLayerState).model;
    return model ? [model] : [];
  }

  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPUArcLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    const sourceColors = isGPUVector(props.getSourceColor) ? props.getSourceColor : undefined;
    const targetColors = isGPUVector(props.getTargetColor) ? props.getTargetColor : undefined;
    const widths = isGPUVector(props.getWidth) ? props.getWidth : undefined;
    const heights = isGPUVector(props.getHeight) ? props.getHeight : undefined;
    if (
      props.getSourcePosition !== boundInputs[0] ||
      props.getTargetPosition !== boundInputs[1] ||
      sourceColors !== boundInputs[2] ||
      targetColors !== boundInputs[3] ||
      widths !== boundInputs[4] ||
      heights !== boundInputs[5] ||
      props.numSegments !== boundInputs[6]
    ) {
      this.destroyResources();
      this.initializeState(this.context);
    }
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model} = this.state as GPUArcLayerState;
    const {styleBuffer: previousStyleBuffer} = this.state as GPUArcLayerState;
    if (!model || !previousStyleBuffer) return;
    const styleBuffer = resizeGPUVectorStyleBuffer(
      previousStyleBuffer,
      80,
      this.props.getSourcePosition.data.length
    );
    if (styleBuffer !== previousStyleBuffer) {
      this.setState({styleBuffer});
      model.setBindings({arcStyle: getGPUVectorStyleBufferBinding(styleBuffer, 80)});
    }
    const sourceColors = isGPUVector(this.props.getSourceColor)
      ? this.props.getSourceColor
      : undefined;
    const targetColors = isGPUVector(this.props.getTargetColor)
      ? this.props.getTargetColor
      : undefined;
    const widths = isGPUVector(this.props.getWidth) ? this.props.getWidth : undefined;
    const heights = isGPUVector(this.props.getHeight) ? this.props.getHeight : undefined;
    const defaultColor: Color = [0, 0, 0, 255];
    const sourceColor = isColor(this.props.getSourceColor)
      ? this.props.getSourceColor
      : defaultColor;
    const targetColor = isColor(this.props.getTargetColor)
      ? this.props.getTargetColor
      : sourceColor;
    const bytes = new ArrayBuffer(80);
    const floats = new Float32Array(bytes);
    const uints = new Uint32Array(bytes);
    floats.set(normalizeColor(sourceColor));
    floats.set(normalizeColor(targetColor), 4);
    floats.set(
      [
        typeof this.props.getWidth === 'number' ? this.props.getWidth : 1,
        typeof this.props.getHeight === 'number' ? this.props.getHeight : 1,
        this.props.widthScale ?? 1,
        this.props.widthMinPixels ?? 0,
        this.props.widthMaxPixels ?? 1e9
      ],
      8
    );
    uints.set(
      [
        Math.max(1, this.props.numSegments ?? 32),
        sourceColors ? 1 : 0,
        targetColors ? 1 : 0,
        widths ? 1 : 0,
        heights ? 1 : 0,
        0
      ],
      13
    );
    model.drawBatches(renderPass, {
      vectors: {
        sourcePositions: this.props.getSourcePosition,
        targetPositions: this.props.getTargetPosition,
        sourceColors,
        targetColors,
        widths,
        heights
      },
      onBatch: batch => {
        uints[18] = batch.rowIndexOffset;
        const binding = getGPUVectorStyleBufferBinding(styleBuffer, 80, batch.batchIndex);
        styleBuffer.write(new Uint8Array(bytes), binding.offset);
        model.setBindings({arcStyle: binding});
      }
    });
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    const result = info as GPUVectorLayerPickingInfo;
    result.gpuVector = getGPUVectorPickingProvenance(this.props.getSourcePosition, result.index);
    return result;
  }

  override finalizeState(context: LayerContext): void {
    this.destroyResources();
    super.finalizeState(context);
  }

  private destroyResources(): void {
    const state = this.state as GPUArcLayerState;
    state.model?.destroy();
    state.styleBuffer?.destroy();
    state.defaults.forEach(buffer => buffer.destroy());
    this.setState({model: null, styleBuffer: null, defaults: []});
  }
}

function makeConstantLayout(name: string, format: 'unorm8x4' | 'float32') {
  return {
    name,
    byteStride: 0,
    stepMode: 'instance' as const,
    attributes: [{attribute: name, format}]
  };
}

function normalizeColor(color: Color): [number, number, number, number] {
  return [color[0] / 255, color[1] / 255, color[2] / 255, (color[3] ?? 255) / 255];
}

function isGPUVector(value: unknown): value is GPUVector {
  return Boolean(value && typeof value === 'object' && 'data' in value && 'format' in value);
}

function isColor(value: unknown): value is Color {
  return Array.isArray(value) || ArrayBuffer.isView(value);
}
