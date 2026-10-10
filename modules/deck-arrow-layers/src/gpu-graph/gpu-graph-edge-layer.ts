// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  project32,
  type LayerContext,
  type LayerProps,
  type UpdateParameters
} from '@deck.gl/core';
import {Buffer, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';

/** One original aligned source/target GPU chunk and its shared resident graph state. */
export type GPUGraphEdgeLayerProps = LayerProps & {
  positions: Buffer;
  sourceVertices: Buffer;
  targetVertices: Buffer;
  distances: Buffer;
  edgeCount: number;
};

type GPUGraphEdgeLayerState = {
  model: Model | null;
  styleUniforms: Buffer | null;
};

const EDGE_BLEND_PARAMETERS = {
  depthWriteEnabled: false,
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;

/** Chunk-local source/target storage directly addresses the live shared layout positions. */
export const GPU_GRAPH_DECK_EDGE_SHADER = /* wgsl */ `
struct EdgeStyle {
  opacity: f32,
  _padding1: f32,
  _padding2: f32,
  _padding3: f32,
};

@group(0) @binding(auto) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> sourceVertices: array<u32>;
@group(0) @binding(auto) var<storage, read> targetVertices: array<u32>;
@group(0) @binding(auto) var<storage, read> distances: array<u32>;
@group(0) @binding(auto) var<uniform> edgeStyle: EdgeStyle;

struct EdgeVertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
};

@vertex fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> EdgeVertexOutput {
  let sourceVertex = sourceVertices[instanceIndex];
  let targetVertex = targetVertices[instanceIndex];
  let vertex = select(sourceVertex, targetVertex, vertexIndex != 0u);
  let position = positions[vertex];
  let sourceReached = distances[sourceVertex] != 0xffffffffu;
  let targetReached = distances[targetVertex] != 0xffffffffu;
  let isSelectedEdge = sourceReached && targetReached;

  geometry.worldPosition = vec3<f32>(position, 0.0);
  var output: EdgeVertexOutput;
  var clipPosition = project_position_to_clipspace(
    vec3<f32>(position, 0.0),
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  // Deck's OpenGL-style projection depth must be converted for WebGPU clipping.
  clipPosition.z = (clipPosition.z + clipPosition.w) * 0.5;
  output.position = clipPosition;
  output.color = select(
    vec4<f32>(0.32, 0.51, 0.70, 0.20),
    vec4<f32>(0.95, 0.72, 0.32, 0.82),
    isSelectedEdge
  );
  return output;
}

@fragment fn fragmentMain(input: EdgeVertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color.rgb, input.color.a * edgeStyle.opacity);
}`;

/** Exactly one deck layer per nonempty original edge chunk; no implicit edge packing occurs. */
export class GPUGraphEdgeLayer extends Layer<GPUGraphEdgeLayerProps> {
  static override layerName = 'GPUGraphEdgeLayer';
  static override defaultProps = {parameters: EDGE_BLEND_PARAMETERS};

  override getAttributeManager() {
    return null;
  }

  /** Reports the original GPUData chunk population instead of the empty placeholder array. */
  override getNumInstances(): number {
    return this.props.edgeCount;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUGraphEdgeLayer requires WebGPU');
    const styleUniforms = device.createBuffer({
      id: `${this.id}-style-uniforms`,
      byteLength: 16,
      usage: Buffer.UNIFORM | Buffer.COPY_DST
    });
    const model = new Model(device, {
      ...this.getShaders({modules: [project32], source: GPU_GRAPH_DECK_EDGE_SHADER}),
      id: `${this.id}-model`,
      topology: 'line-list',
      isInstanced: true,
      vertexCount: 2,
      instanceCount: this.props.edgeCount,
      bufferLayout: [],
      bindings: {
        positions: this.props.positions,
        sourceVertices: this.props.sourceVertices,
        targetVertices: this.props.targetVertices,
        distances: this.props.distances,
        edgeStyle: styleUniforms
      },
      parameters: EDGE_BLEND_PARAMETERS
    });
    this.setState({model, styleUniforms} satisfies GPUGraphEdgeLayerState);
  }

  /** Keeps same-ID chunk models pointed at the new graph's original physical allocations. */
  override updateState({props, oldProps}: UpdateParameters<this>): void {
    const {model, styleUniforms} = this.state as GPUGraphEdgeLayerState;
    if (!model || !styleUniforms) return;
    if (
      props.positions !== oldProps.positions ||
      props.sourceVertices !== oldProps.sourceVertices ||
      props.targetVertices !== oldProps.targetVertices ||
      props.distances !== oldProps.distances
    ) {
      model.setBindings({
        positions: props.positions,
        sourceVertices: props.sourceVertices,
        targetVertices: props.targetVertices,
        distances: props.distances,
        edgeStyle: styleUniforms
      });
    }
    model.setInstanceCount(props.edgeCount);
  }

  override getModels(): Model[] {
    const model = (this.state as GPUGraphEdgeLayerState).model;
    return model ? [model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model, styleUniforms} = this.state as GPUGraphEdgeLayerState;
    if (!model || !styleUniforms) return;
    styleUniforms.write(new Float32Array([this.props.opacity ?? 1, 0, 0, 0]));
    model.setInstanceCount(this.props.edgeCount);
    model.draw(renderPass);
  }

  override finalizeState(context: LayerContext): void {
    const state = this.state as GPUGraphEdgeLayerState;
    state.model?.destroy();
    state.styleUniforms?.destroy();
    this.setState({model: null, styleUniforms: null} satisfies GPUGraphEdgeLayerState);
    super.finalizeState(context);
  }
}
