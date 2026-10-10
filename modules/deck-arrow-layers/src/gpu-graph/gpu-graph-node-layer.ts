// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import {Buffer, type RenderPass} from '@luma.gl/core';
import {Model} from '@luma.gl/engine';

const GPU_GRAPH_DECK_POINT_VERTEX_COUNT = 65_536;

/** GPU-resident node attribute used for visible source-vertex colors. */
export type GPUGraphDeckColorMode = 'community' | 'component' | 'degree' | 'pagerank' | 'distance';

/** GPU-resident source-vertex attribute used to size rendered graph nodes. */
export type GPUGraphDeckNodeSizeMode = 'pagerank' | 'degree' | 'uniform';

/** Actual GPU Graph allocations consumed by a deck.gl node layer without staging or copying. */
export type GPUGraphNodeLayerProps = LayerProps & {
  positions: Buffer;
  importance: Buffer;
  components: Buffer;
  communities: Buffer;
  degrees: Buffer;
  distances: Buffer;
  selectionMask: Buffer;
  vertexCount: number;
  /** Forces true one-vertex point primitives without dropping or sampling resident instances. */
  pointMode?: boolean;
  colorMode?: GPUGraphDeckColorMode;
  sizeMode?: GPUGraphDeckNodeSizeMode;
};

type GPUGraphNodeLayerState = {
  model: Model | null;
  styleUniforms: Buffer | null;
};

const NODE_BLEND_PARAMETERS = {
  depthWriteEnabled: false,
  blend: true,
  blendColorOperation: 'add',
  blendAlphaOperation: 'add',
  blendColorSrcFactor: 'src-alpha',
  blendColorDstFactor: 'one-minus-src-alpha',
  blendAlphaSrcFactor: 'one',
  blendAlphaDstFactor: 'one-minus-src-alpha'
} as const;

/** Direct instance vertex fetch and six independently computed resident graph attributes. */
export const GPU_GRAPH_DECK_NODE_SHADER = /* wgsl */ `
struct NodeStyle {
  radiusPixels: f32,
  opacity: f32,
  pickingActive: f32,
  vertexCount: f32,
  colorMode: u32,
  sizeMode: u32,
  pointMode: u32,
  _padding1: u32,
};

@group(0) @binding(auto) var<storage, read> importance: array<f32>;
@group(0) @binding(auto) var<storage, read> components: array<u32>;
@group(0) @binding(auto) var<storage, read> communities: array<u32>;
@group(0) @binding(auto) var<storage, read> degrees: array<u32>;
@group(0) @binding(auto) var<storage, read> distances: array<u32>;
@group(0) @binding(auto) var<storage, read> selectionMask: array<u32>;
@group(0) @binding(auto) var<uniform> nodeStyle: NodeStyle;

struct NodeVertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) corner: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
};

fn getNodeCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex];
}

fn getGroupColor(group: u32) -> vec3<f32> {
  let colors = array<vec3<f32>, 7>(
    vec3<f32>(0.26, 0.79, 1.00),
    vec3<f32>(1.00, 0.58, 0.28),
    vec3<f32>(0.74, 0.48, 1.00),
    vec3<f32>(0.34, 0.92, 0.66),
    vec3<f32>(1.00, 0.41, 0.66),
    vec3<f32>(0.96, 0.86, 0.34),
    vec3<f32>(0.42, 0.62, 1.00)
  );
  return colors[group % 7u];
}

fn getNodeAnalyticColor(index: u32) -> vec3<f32> {
  if (nodeStyle.colorMode == 0u) {
    let label = communities[index];
    let communitySpan = max(u32(nodeStyle.vertexCount) / 4u, 1u);
    let visibleLabel = select(label, min(label / communitySpan, 3u),
      nodeStyle.pointMode != 0u && nodeStyle.vertexCount >= 16384.0);
    return getGroupColor(visibleLabel);
  }
  if (nodeStyle.colorMode == 1u) {
    return getGroupColor(components[index]);
  }
  if (nodeStyle.colorMode == 2u) {
    return mix(vec3<f32>(0.24, 0.49, 0.94), vec3<f32>(1.0, 0.42, 0.21),
      clamp(f32(degrees[index]) / 12.0, 0.0, 1.0));
  }
  if (nodeStyle.colorMode == 3u) {
    return mix(vec3<f32>(0.35, 0.26, 0.82), vec3<f32>(1.0, 0.79, 0.28),
      clamp(importance[index] * nodeStyle.vertexCount / 3.0, 0.0, 1.0));
  }
  let distanceValue = distances[index];
  if (distanceValue == 0xffffffffu) {
    return vec3<f32>(0.26, 0.31, 0.43);
  }
  return mix(vec3<f32>(1.0, 0.80, 0.31), vec3<f32>(0.25, 0.70, 1.0),
    clamp(f32(distanceValue) / 6.0, 0.0, 1.0));
}

fn encodeNodePickingColor(vertex: u32) -> vec3<f32> {
  let index = vertex + 1u;
  return vec3<f32>(
    f32(index % 256u),
    f32((index / 256u) % 256u),
    f32((index / 65536u) % 256u)
  ) / 255.0;
}

@vertex fn vertexMain(
  @location(0) nodePosition: vec2<f32>,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> NodeVertexOutput {
  let corner = select(getNodeCorner(vertexIndex), vec2<f32>(0.0), nodeStyle.pointMode != 0u);
  let pickingColor = encodeNodePickingColor(instanceIndex);
  let inNeighborhood = selectionMask[instanceIndex] != 0u;
  let reached = distances[instanceIndex] != 0xffffffffu;
  let rank = max(importance[instanceIndex] * nodeStyle.vertexCount, 0.0);
  let degreeScale = sqrt(max(f32(degrees[instanceIndex]), 1.0));
  let rankScale = clamp(sqrt(rank), 0.65, 2.3);
  let metricScale = select(rankScale, clamp(degreeScale * 0.48, 0.65, 2.4),
    nodeStyle.sizeMode == 1u);
  var radius = nodeStyle.radiusPixels * select(metricScale, 1.0, nodeStyle.sizeMode == 2u);

  let highlightedColor = picking_normalizeColor(picking.highlightedObjectColor);
  let highlighted = picking.isHighlightActive > 0.5 &&
    distance(pickingColor, highlightedColor) < 0.00001;
  let selected = reached && distances[instanceIndex] == 0u;
  if (selected || highlighted) { radius *= 1.45; }

  geometry.worldPosition = vec3<f32>(nodePosition, 0.0);
  geometry.pickingColor = pickingColor;
  var clipPosition = project_position_to_clipspace(
    vec3<f32>(nodePosition, 0.0),
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  // Deck's project32 matrices use OpenGL depth; WebGPU clip space requires [0, w].
  clipPosition.z = (clipPosition.z + clipPosition.w) * 0.5;
  clipPosition = vec4<f32>(
    clipPosition.xy + project_pixel_size_to_clipspace(corner * radius),
    clipPosition.z,
    clipPosition.w
  );

  let analyticColor = getNodeAnalyticColor(instanceIndex);
  let accentColor = select(analyticColor, vec3<f32>(1.0, 0.84, 0.38), selected);
  let inactiveBrightness = select(0.40, 0.78, nodeStyle.pointMode != 0u);
  let brightness = select(inactiveBrightness, 1.0, inNeighborhood || selected || highlighted);

  var output: NodeVertexOutput;
  output.position = clipPosition;
  output.corner = corner;
  output.color = vec4<f32>(accentColor * brightness, 0.95);
  output.pickingColor = pickingColor;
  return output;
}

@fragment fn fragmentMain(input: NodeVertexOutput) -> @location(0) vec4<f32> {
  let radiusSquared = dot(input.corner, input.corner);
  if (radiusSquared > 1.0) { discard; }
  if (nodeStyle.pickingActive > 0.5) {
    return vec4<f32>(input.pickingColor, 1.0);
  }
  let coverage = 1.0 - smoothstep(0.48, 1.0, radiusSquared);
  return vec4<f32>(input.color.rgb, input.color.a * nodeStyle.opacity * coverage);
}`;

/** Deck layer whose actual instance vertex attribute is the progressive GPU Graph position buffer. */
export class GPUGraphNodeLayer extends Layer<GPUGraphNodeLayerProps> {
  static override layerName = 'GPUGraphNodeLayer';
  static override defaultProps = {parameters: NODE_BLEND_PARAMETERS};

  override getAttributeManager() {
    return null;
  }

  /** Keeps Deck picking and lifecycle counts aligned with the resident vertex allocation. */
  override getNumInstances(): number {
    return this.props.vertexCount;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUGraphNodeLayer requires WebGPU');
    const styleUniforms = device.createBuffer({
      id: `${this.id}-style-uniforms`,
      byteLength: 32,
      usage: Buffer.UNIFORM | Buffer.COPY_DST
    });
    const pointMode =
      this.props.pointMode ?? this.props.vertexCount >= GPU_GRAPH_DECK_POINT_VERTEX_COUNT;
    const model = new Model(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_GRAPH_DECK_NODE_SHADER}),
      id: `${this.id}-model`,
      topology: pointMode ? 'point-list' : 'triangle-list',
      isInstanced: true,
      vertexCount: pointMode ? 1 : 6,
      instanceCount: this.props.vertexCount,
      attributes: {nodePosition: this.props.positions},
      bufferLayout: [{name: 'nodePosition', format: 'float32x2', stepMode: 'instance'}],
      bindings: {
        importance: this.props.importance,
        components: this.props.components,
        communities: this.props.communities,
        degrees: this.props.degrees,
        distances: this.props.distances,
        selectionMask: this.props.selectionMask,
        nodeStyle: styleUniforms
      },
      parameters: NODE_BLEND_PARAMETERS
    });
    this.setState({model, styleUniforms} satisfies GPUGraphNodeLayerState);
  }

  /** Rebinds same-ID Deck layers before replaced graph allocations can be drawn again. */
  override updateState({props, oldProps}: UpdateParameters<this>): void {
    const {model, styleUniforms} = this.state as GPUGraphNodeLayerState;
    if (!model || !styleUniforms) return;
    if (props.positions !== oldProps.positions) {
      model.setAttributes({nodePosition: props.positions});
    }
    if (
      props.importance !== oldProps.importance ||
      props.components !== oldProps.components ||
      props.communities !== oldProps.communities ||
      props.degrees !== oldProps.degrees ||
      props.distances !== oldProps.distances ||
      props.selectionMask !== oldProps.selectionMask
    ) {
      model.setBindings({
        importance: props.importance,
        components: props.components,
        communities: props.communities,
        degrees: props.degrees,
        distances: props.distances,
        selectionMask: props.selectionMask,
        nodeStyle: styleUniforms
      });
    }
    const pointMode = props.pointMode ?? props.vertexCount >= GPU_GRAPH_DECK_POINT_VERTEX_COUNT;
    model.setTopology(pointMode ? 'point-list' : 'triangle-list');
    model.setVertexCount(pointMode ? 1 : 6);
    model.setInstanceCount(props.vertexCount);
  }

  override getModels(): Model[] {
    const model = (this.state as GPUGraphNodeLayerState).model;
    return model ? [model] : [];
  }

  override draw({
    renderPass,
    shaderModuleProps
  }: {
    renderPass: RenderPass;
    shaderModuleProps?: {picking?: {isActive?: number | boolean}};
  }): void {
    const {model, styleUniforms} = this.state as GPUGraphNodeLayerState;
    if (!model || !styleUniforms) return;
    const style = new ArrayBuffer(32);
    new Float32Array(style, 0, 4).set([
      Math.max(1.4, Math.min(6, 60 / Math.sqrt(Math.max(this.props.vertexCount, 1)))),
      this.props.opacity ?? 1,
      shaderModuleProps?.picking?.isActive ? 1 : 0,
      this.props.vertexCount
    ]);
    new Uint32Array(style, 16, 4).set([
      getColorModeIndex(this.props.colorMode ?? 'community'),
      getSizeModeIndex(this.props.sizeMode ?? 'pagerank'),
      Number(this.props.pointMode ?? this.props.vertexCount >= GPU_GRAPH_DECK_POINT_VERTEX_COUNT),
      0
    ]);
    styleUniforms.write(new Uint8Array(style));
    model.setInstanceCount(this.props.vertexCount);
    model.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    return info;
  }

  override finalizeState(context: LayerContext): void {
    const state = this.state as GPUGraphNodeLayerState;
    state.model?.destroy();
    state.styleUniforms?.destroy();
    this.setState({model: null, styleUniforms: null} satisfies GPUGraphNodeLayerState);
    super.finalizeState(context);
  }
}

function getColorModeIndex(mode: GPUGraphDeckColorMode): number {
  return ['community', 'component', 'degree', 'pagerank', 'distance'].indexOf(mode);
}

function getSizeModeIndex(mode: GPUGraphDeckNodeSizeMode): number {
  return ['pagerank', 'degree', 'uniform'].indexOf(mode);
}
