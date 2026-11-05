// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  picking,
  project32,
  UNIT,
  type Unit,
  type Color,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import {Buffer, type RenderPass, type ShaderLayout} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import type {GPUVector, VertexList} from '@luma.gl/graph/gpu-data';
import {PathStorageModel} from '@luma.gl/engine/models';
import {
  getGPUVectorPickingProvenance,
  type GPUVectorLayerPickingInfo
} from '../utils/gpu-vector-picking';

export type {GPUVectorLayerPickingInfo} from '../utils/gpu-vector-picking';

/** GPUVector-native variable-length path props. Input vectors are borrowed. */
export type GPUPathLayerProps = Omit<LayerProps, 'data'> & {
  paths: GPUVector<VertexList<'float32x2' | 'float32x3' | 'float32x4'>>;
  colors?: Color | GPUVector<'unorm8x4' | VertexList<'unorm8x4'>>;
  widths?: number | GPUVector<'float32'>;
  timestamps?: GPUVector<VertexList<'float32'>>;
  viewOrigins?: GPUVector<'float32x4'>;
  /** Units of the stroke widths. Defaults to pixels. */
  widthUnits?: Unit;
  /** Multiplier for stroke widths. */
  widthScale?: number;
  /** Lower bound on the rendered stroke width. */
  widthMinPixels?: number;
  /** Upper bound on the rendered stroke width. */
  widthMaxPixels?: number;
  /** Maximum ratio of join length to stroke half-width. */
  miterLimit?: number;
  currentTime?: number;
  trailLength?: number;
  fadeTrail?: boolean;
};

type GPUPathLayerState = {
  model: PathStorageModel | null;
  temporalBuffer: Buffer | null;
  defaultTimestampBuffer: Buffer | null;
};

const GPU_PATH_SHADER_LAYOUT: ShaderLayout = {
  attributes: [
    {name: 'segmentStartPointIndices', location: 0, type: 'u32', stepMode: 'instance'},
    {name: 'segmentFlags', location: 1, type: 'u32', stepMode: 'instance'},
    {name: 'rowIndices', location: 2, type: 'u32', stepMode: 'instance'}
  ],
  bindings: []
};

const GPU_PATH_SHADER = /* wgsl */ `
@group(0) @binding(auto) var<storage, read> pathValues: array<f32>;
@group(0) @binding(auto) var<storage, read> pathRanges: array<vec4<u32>>;
@group(0) @binding(auto) var<storage, read> pathViewOrigins: array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> pathRowColors: array<u32>;
@group(0) @binding(auto) var<storage, read> pathVertexColors: array<u32>;
@group(0) @binding(auto) var<storage, read> pathRowWidths: array<f32>;
@group(0) @binding(auto) var<storage, read> pathTimestamps: array<f32>;

struct PathStorageStyleConfig {
  constantColor: vec4<f32>,
  constantWidth: f32,
  useRowColors: u32,
  useRowWidths: u32,
  batchRowIndexBase: u32,
  pathComponentCount: u32,
  useViewOrigins: u32,
  useVertexColors: u32,
  _padding1: u32,
};
@group(0) @binding(auto) var<uniform> pathStorageStyleConfig: PathStorageStyleConfig;

struct PathLayerStyle {
  currentTime: f32,
  trailLength: f32,
  temporalMode: u32,
  fadeTrail: u32,
  widthScale: f32,
  widthMinPixels: f32,
  widthMaxPixels: f32,
  miterLimit: f32,
  widthUnits: u32,
};
@group(0) @binding(auto) var<uniform> pathLayerStyle: PathLayerStyle;

struct VertexInputs {
  @location(0) segmentStartPointIndex: u32,
  @location(1) segmentFlags: u32,
  @location(2) rowIndex: u32,
};

struct VertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) @interpolate(flat) visible: f32,
  @location(3) measure: f32,
};

fn encodePickingColor(rowIndex: u32) -> vec3<f32> {
  let value = rowIndex + 1u;
  return vec3<f32>(f32(value % 256u), f32((value / 256u) % 256u), f32((value / 65536u) % 256u)) / 255.0;
}

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) { return 0.0; }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readPathPoint(pointIndex: u32) -> vec4<f32> {
  return vec4<f32>(
    readPathComponent(pointIndex, 0u),
    readPathComponent(pointIndex, 1u),
    readPathComponent(pointIndex, 2u),
    readPathComponent(pointIndex, 3u)
  );
}

fn pathDirection(start: vec4<f32>, end: vec4<f32>, fallback: vec2<f32>) -> vec2<f32> {
  let delta = (end.xy / end.w - start.xy / start.w) * project.viewportSize;
  if (length(delta) < 0.000001) { return fallback; }
  return normalize(delta);
}

fn strokeNormal(direction: vec2<f32>) -> vec2<f32> {
  return vec2<f32>(-direction.y, direction.x);
}

fn joinNormal(incoming: vec2<f32>, outgoing: vec2<f32>, fallback: vec2<f32>) -> vec2<f32> {
  let sum = strokeNormal(incoming) + strokeNormal(outgoing);
  if (length(sum) < 0.000001) { return fallback; }
  let miter = normalize(sum);
  return miter * min(pathLayerStyle.miterLimit, 1.0 / max(dot(miter, fallback), 0.000001));
}

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, -1.0), vec2<f32>(1.0, 1.0), vec2<f32>(0.0, 1.0)
  );
  return corners[vertexIndex % 6u];
}

@vertex fn vertexMain(
  inputs: VertexInputs,
  @builtin(vertex_index) vertexIndex: u32
) -> VertexOutputs {
  let localRowIndex = inputs.rowIndex - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = pathRanges[localRowIndex];
  let endPointIndex = min(inputs.segmentStartPointIndex + 1u, pathRange.y - 1u);
  let viewOrigin = select(vec4<f32>(0.0), pathViewOrigins[localRowIndex], pathStorageStyleConfig.useViewOrigins != 0u);
  let startWorld = readPathPoint(inputs.segmentStartPointIndex) + viewOrigin;
  let endWorld = readPathPoint(endPointIndex) + viewOrigin;
  let startClip = project_position_to_clipspace(startWorld.xyz, vec3<f32>(0.0), vec3<f32>(0.0));
  let endClip = project_position_to_clipspace(endWorld.xyz, vec3<f32>(0.0), vec3<f32>(0.0));
  let direction = pathDirection(startClip, endClip, vec2<f32>(1.0, 0.0));
  let normal = strokeNormal(direction);
  let corner = getCorner(vertexIndex);
  let first = pathRange.x;
  let last = pathRange.y - 1u;
  let closed = last > first + 2u && all(readPathPoint(first).xyz == readPathPoint(last).xyz);
  var offsetNormal = normal;
  if (corner.x == 0.0 && (inputs.segmentStartPointIndex > first || closed)) {
    let previous = select(max(inputs.segmentStartPointIndex, 1u) - 1u, last - 1u, inputs.segmentStartPointIndex == first);
    let previousClip = project_position_to_clipspace((readPathPoint(previous) + viewOrigin).xyz, vec3<f32>(0.0), vec3<f32>(0.0));
    offsetNormal = joinNormal(pathDirection(previousClip, startClip, direction), direction, normal);
  } else if (corner.x == 1.0 && (endPointIndex < last || closed)) {
    let next = select(endPointIndex + 1u, first + 1u, endPointIndex == last);
    let nextClip = project_position_to_clipspace((readPathPoint(next) + viewOrigin).xyz, vec3<f32>(0.0), vec3<f32>(0.0));
    offsetNormal = joinNormal(direction, pathDirection(endClip, nextClip, direction), normal);
  }
  geometry.worldPosition = mix(startWorld.xyz, endWorld.xyz, corner.x);
  let width = select(pathStorageStyleConfig.constantWidth, pathRowWidths[localRowIndex], pathStorageStyleConfig.useRowWidths != 0u);
  let widthPixels = clamp(
    project_unit_size_to_pixel(width * pathLayerStyle.widthScale, i32(pathLayerStyle.widthUnits)),
    pathLayerStyle.widthMinPixels, pathLayerStyle.widthMaxPixels
  );
  var clipPosition = mix(startClip, endClip, corner.x);
  let pixelOffset = project_pixel_size_to_clipspace(offsetNormal * corner.y * widthPixels * 0.5);
  clipPosition = vec4<f32>(clipPosition.xy + pixelOffset * clipPosition.w / project.focalDistance, clipPosition.z, clipPosition.w);
  var color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    color = mix(unpackPathColor(pathVertexColors[inputs.segmentStartPointIndex]), unpackPathColor(pathVertexColors[endPointIndex]), corner.x);
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    color = unpackPathColor(pathRowColors[localRowIndex]);
  }
  let useTimestampColumn = pathLayerStyle.temporalMode == 2u;
  let startMeasure = select(startWorld.w, pathTimestamps[inputs.segmentStartPointIndex], useTimestampColumn);
  let endMeasure = select(endWorld.w, pathTimestamps[endPointIndex], useTimestampColumn);
  let temporalEnabled = pathLayerStyle.temporalMode != 0u;
  let visible = !temporalEnabled || (endMeasure >= pathLayerStyle.currentTime - pathLayerStyle.trailLength && startMeasure <= pathLayerStyle.currentTime);
  let vertexMeasure = mix(startMeasure, endMeasure, corner.x);
  let pickingColor = encodePickingColor(inputs.rowIndex);
  geometry.pickingColor = pickingColor;
  var output: VertexOutputs;
  output.position = clipPosition;
  output.color = color;
  output.pickingColor = pickingColor;
  output.visible = select(0.0, 1.0, visible);
  output.measure = vertexMeasure;
  return output;
}

@fragment fn fragmentMain(input: VertexOutputs) -> @location(0) vec4<f32> {
  if (input.visible < 0.5) { discard; }
  let trailStart = pathLayerStyle.currentTime - pathLayerStyle.trailLength;
  if (pathLayerStyle.temporalMode != 0u && (input.measure < trailStart || input.measure > pathLayerStyle.currentTime)) { discard; }
  let trailOpacity = select(1.0, clamp((input.measure - trailStart) / max(pathLayerStyle.trailLength, 0.000001), 0.0, 1.0), pathLayerStyle.temporalMode == 2u && pathLayerStyle.fadeTrail != 0u);
  if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); }
  return vec4<f32>(input.color.rgb, input.color.a * trailOpacity * layer.opacity);
}`;

/** Deck host for the GPU-only variable-length path model. */
export class GPUPathLayer extends Layer<GPUPathLayerProps> {
  static override layerName = 'GPUPathLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('GPUPathLayer requires WebGPU');
    this.setState({model: null, temporalBuffer: null, defaultTimestampBuffer: null});
    this.createModel();
  }

  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as GPUPathLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    if (
      props.paths !== boundInputs[0] ||
      props.colors !== boundInputs[1] ||
      props.widths !== boundInputs[2] ||
      props.timestamps !== boundInputs[3] ||
      props.viewOrigins !== boundInputs[4]
    ) {
      this.destroyModel();
      this.createModel();
    }
  }

  override getModels(): Model[] {
    const model = (this.state as GPUPathLayerState | undefined)?.model;
    return model ? [model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model, temporalBuffer} = this.state as GPUPathLayerState;
    if (!model || !temporalBuffer) return;
    const values = new ArrayBuffer(48);
    const floats = new Float32Array(values);
    const uints = new Uint32Array(values);
    floats.set([this.props.currentTime ?? 0, this.props.trailLength ?? 0]);
    uints.set(
      [
        this.props.timestamps ? 2 : this.props.currentTime !== undefined ? 1 : 0,
        this.props.fadeTrail ? 1 : 0
      ],
      2
    );
    floats.set(
      [
        this.props.widthScale ?? 1,
        this.props.widthMinPixels ?? 0,
        this.props.widthMaxPixels ?? Number.MAX_SAFE_INTEGER,
        this.props.miterLimit ?? 4
      ],
      4
    );
    uints[8] = UNIT[this.props.widthUnits ?? 'pixels'];
    temporalBuffer.write(new Uint8Array(values));
    model.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): PickingInfo {
    const result = info as GPUVectorLayerPickingInfo;
    result.gpuVector = getGPUVectorPickingProvenance(this.props.paths, result.index);
    return result;
  }

  override finalizeState(context: LayerContext): void {
    this.destroyModel();
    super.finalizeState(context);
  }

  private createModel(): void {
    const {device} = this.context;
    const temporalBuffer = device.createBuffer({
      id: `${this.id}-temporal-style`,
      byteLength: 48,
      usage: Buffer.UNIFORM | Buffer.COPY_DST
    });
    const defaultTimestampBuffer = device.createBuffer({
      id: `${this.id}-default-timestamp`,
      data: new Float32Array([0]),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
    const color = isGPUVector(this.props.colors)
      ? undefined
      : normalizeColor(this.props.colors ?? [0, 0, 0, 255]);
    const model = new PathStorageModel(device, {
      ...this.getShaders({modules: [project32, picking], source: GPU_PATH_SHADER}),
      id: `${this.id}-model`,
      shaderLayout: GPU_PATH_SHADER_LAYOUT,
      paths: this.props.paths,
      ...(isGPUVector(this.props.colors) ? {colors: this.props.colors} : {color}),
      ...(isGPUVector(this.props.widths)
        ? {widths: this.props.widths}
        : {width: typeof this.props.widths === 'number' ? this.props.widths : 1}),
      ...(this.props.timestamps ? {timestamps: this.props.timestamps} : {}),
      ...(this.props.viewOrigins ? {viewOrigins: this.props.viewOrigins} : {}),
      bindings: {pathLayerStyle: temporalBuffer, pathTimestamps: defaultTimestampBuffer},
      topology: 'triangle-list',
      vertexCount: 6
    });
    model.userData['boundInputs'] = [
      this.props.paths,
      this.props.colors,
      this.props.widths,
      this.props.timestamps,
      this.props.viewOrigins
    ];
    this.setState({model, temporalBuffer, defaultTimestampBuffer} satisfies GPUPathLayerState);
  }

  private destroyModel(): void {
    const state = this.state as GPUPathLayerState;
    state.model?.destroy();
    state.temporalBuffer?.destroy();
    state.defaultTimestampBuffer?.destroy();
    this.setState({model: null, temporalBuffer: null, defaultTimestampBuffer: null});
  }
}

function normalizeColor(color: Color): [number, number, number, number] {
  return [color[0], color[1], color[2], color[3] ?? 255];
}

function isGPUVector(value: unknown): value is GPUVector {
  return Boolean(value && typeof value === 'object' && 'data' in value && 'format' in value);
}
