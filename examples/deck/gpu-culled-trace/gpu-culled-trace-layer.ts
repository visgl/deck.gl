// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {Layer, type LayerContext, type LayerProps, type PickingInfo} from '@deck.gl/core';
import {Buffer, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';
import {DrawCommandBuffer} from '@luma.gl/gpgpu/gpu-core';

export type GPUCulledTraceLayerProps = LayerProps & {
  spans: Buffer;
  visibleIds: Buffer;
  viewUniforms: Buffer;
  drawCommands: DrawCommandBuffer;
};

type GPUCulledTraceLayerState = {model: Model | null; renderUniforms: Buffer | null};

const TRACE_BLEND_PARAMETERS = {
  depthWriteEnabled: false,
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;

const TRACE_LAYER_WGSL = /* wgsl */ `
struct TraceSpan {
  start: f32,
  duration: f32,
  lane: u32,
  group: u32,
};

struct ViewUniforms { timeMin: f32, timeMax: f32, laneMin: f32, laneMax: f32 };
struct RenderUniforms { pickingActive: f32, opacity: f32, _padding: vec2<f32> };

@group(0) @binding(auto) var<storage, read> spans: array<TraceSpan>;
@group(0) @binding(auto) var<storage, read> visibleIds: array<u32>;
@group(0) @binding(auto) var<uniform> viewUniforms: ViewUniforms;
@group(0) @binding(auto) var<uniform> renderUniforms: RenderUniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.08), vec2<f32>(1.0, 0.08), vec2<f32>(0.0, 0.92),
    vec2<f32>(0.0, 0.92), vec2<f32>(1.0, 0.08), vec2<f32>(1.0, 0.92)
  );
  return corners[vertexIndex];
}

fn getGroupColor(group: u32) -> vec3<f32> {
  let colors = array<vec3<f32>, 3>(
    vec3<f32>(0.30, 0.78, 1.00),
    vec3<f32>(0.74, 0.46, 1.00),
    vec3<f32>(1.00, 0.63, 0.22)
  );
  return colors[min(group, 2u)];
}

fn encodePickingColor(rowIndex: u32) -> vec3<f32> {
  let colorIndex = rowIndex + 1u;
  return vec3<f32>(
    f32(colorIndex % 256u),
    f32((colorIndex / 256u) % 256u),
    f32((colorIndex / 65536u) % 256u)
  ) / 255.0;
}

@vertex fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  let rowIndex = visibleIds[instanceIndex];
  let span = spans[rowIndex];
  let corner = getCorner(vertexIndex);
  let worldPosition = vec2<f32>(
    span.start + span.duration * corner.x,
    f32(span.lane) + corner.y
  );
  let viewSize = max(
    vec2<f32>(viewUniforms.timeMax - viewUniforms.timeMin, viewUniforms.laneMax - viewUniforms.laneMin),
    vec2<f32>(0.0001)
  );
  let normalized = (worldPosition - vec2<f32>(viewUniforms.timeMin, viewUniforms.laneMin)) / viewSize;
  var output: VertexOutput;
  output.position = vec4<f32>(normalized.x * 2.0 - 1.0, 1.0 - normalized.y * 2.0, 0.0, 1.0);
  output.color = vec4<f32>(getGroupColor(span.group), 0.92);
  output.pickingColor = encodePickingColor(rowIndex);
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  if (renderUniforms.pickingActive > 0.5) {
    return vec4<f32>(input.pickingColor, 1.0);
  }
  return vec4<f32>(input.color.rgb, input.color.a * renderUniforms.opacity);
}`;

/** WebGPU-only deck layer that replays a GPU-written indirect span draw. */
export class GPUCulledTraceLayer extends Layer<GPUCulledTraceLayerProps> {
  static override layerName = 'GPUCulledTraceLayer';
  static override defaultProps = {parameters: TRACE_BLEND_PARAMETERS};

  override getAttributeManager() {
    return null;
  }

  override setShaderModuleProps(): void {}

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUCulledTraceLayer requires WebGPU');
    const renderUniforms = device.createBuffer({
      id: `${this.id}-render-uniforms`,
      byteLength: 16,
      usage: Buffer.UNIFORM | Buffer.COPY_DST
    });
    const model = new Model(device, {
      id: `${this.id}-model`,
      source: TRACE_LAYER_WGSL,
      topology: 'triangle-list',
      isInstanced: true,
      vertexCount: 6,
      instanceCount: 0,
      bufferLayout: [],
      bindings: {
        spans: this.props.spans,
        visibleIds: this.props.visibleIds,
        viewUniforms: this.props.viewUniforms,
        renderUniforms
      },
      parameters: TRACE_BLEND_PARAMETERS
    });
    this.setState({model, renderUniforms} satisfies GPUCulledTraceLayerState);
  }

  override getModels(): Model[] {
    const model = (this.state as GPUCulledTraceLayerState).model;
    return model ? [model] : [];
  }

  override draw({
    renderPass,
    shaderModuleProps
  }: {
    renderPass: RenderPass;
    shaderModuleProps?: {picking?: {isActive?: number}};
  }): void {
    const {model, renderUniforms} = this.state as GPUCulledTraceLayerState;
    if (!model || !renderUniforms) return;
    renderUniforms.write(
      new Float32Array([shaderModuleProps?.picking?.isActive ?? 0, this.props.opacity ?? 1, 0, 0])
    );
    model.setInstanceCount(0);
    model.draw(renderPass);
    this.props.drawCommands.draw(renderPass, 0);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    return info;
  }

  override finalizeState(context: LayerContext): void {
    const state = this.state as GPUCulledTraceLayerState;
    state.model?.destroy();
    state.renderUniforms?.destroy();
    this.setState({model: null, renderUniforms: null} satisfies GPUCulledTraceLayerState);
    super.finalizeState(context);
  }
}
