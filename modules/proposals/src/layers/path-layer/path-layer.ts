// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  CompositeLayer,
  Layer,
  picking,
  project32,
  color,
  _makePathShaderWGSL as makePathShaderWGSL,
  _pathShaderPlugin as pathShaderPlugin,
  _pathUniforms as pathUniforms,
  UNIT,
  type Unit,
  type Color,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import {Buffer, type RenderPass, type ShaderLayout} from '@luma.gl/core';
import type {GPUVector, VertexList} from '@luma.gl/graph/gpu-data';
import {PathStorageModel} from '@luma.gl/engine/models';
import {
  getGPUVectorPickingProvenance,
  type GPUVectorLayerPickingInfo
} from '../utils/gpu-vector-picking';

import {ArrowPathRendererLayer, type ArrowPathLayerProps} from './arrow-path-renderer-layer';

export type {GPUVectorLayerPickingInfo} from '../utils/gpu-vector-picking';

/** GPUVector-native variable-length path props. Input vectors are borrowed. */
type PreparedPathLayerProps = Omit<LayerProps, 'data'> & {
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
  /** Draw rounded joins between adjacent segments. */
  jointRounded?: boolean;
  /** Draw rounded caps at open ends. */
  capRounded?: boolean;
  /** Feather the stroke edge by one device pixel. */
  antialiasing?: boolean;
  /** Extrude in screen space instead of the path plane. Defaults to true. */
  billboard?: boolean;
  currentTime?: number;
  trailLength?: number;
  fadeTrail?: boolean;
};

/** Path columns supplied directly or selected from an Arrow batch source. */
export type StoragePathLayerProps = PreparedPathLayerProps | ArrowPathLayerProps;

/** Renders Arrow path columns and prepared GPU path vectors. */
export class StoragePathLayer extends CompositeLayer<StoragePathLayerProps> {
  static override layerName = 'StoragePathLayer';

  static override defaultProps = {data: ArrowPathRendererLayer.defaultProps.data};

  /** Selects the renderer for the supplied path representation. */
  override renderLayers(): Layer {
    const {paths, colors, widths, ...props} = this.props;
    if (isGPUVector(paths)) {
      return new PreparedPathLayer({
        ...props,
        ...this.getSubLayerProps({id: 'storage'}),
        paths,
        colors,
        widths
      } as PreparedPathLayerProps);
    }
    return new ArrowPathRendererLayer({
      ...props,
      ...this.getSubLayerProps({id: 'arrow'}),
      parameters: {...ArrowPathRendererLayer.defaultProps.parameters, ...this.props.parameters},
      paths,
      colors,
      widths
    } as ArrowPathLayerProps);
  }

  /** Returns the active renderer's models. */
  override getModels() {
    return this.getSubLayers().flatMap(layer => layer.getModels());
  }
}

type StoragePathLayerState = {
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

const storageVertexEntry = /* wgsl */ `
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
};
@group(0) @binding(auto) var<uniform> pathLayerStyle: PathLayerStyle;

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

@vertex fn vertexMain(
  @location(0) start: u32,
  @location(1) flags: u32,
  @location(2) rowIndex: u32,
  @builtin(vertex_index) vertexIndex: u32
) -> Varyings
`;

const storageVertexSetup = /* wgsl */ `
  let corners = array(vec2<f32>(0, 0), vec2<f32>(0, -1), vec2<f32>(0, 1),
                      vec2<f32>(1, -1), vec2<f32>(1, 1), vec2<f32>(1, 0));
  let indices = array(0u, 1u, 2u, 1u, 4u, 2u, 1u, 3u, 4u, 3u, 5u, 4u);
  let corner = corners[indices[vertexIndex]];
  let row = rowIndex - pathStorageStyleConfig.batchRowIndexBase;
  let range = pathRanges[row];
  let first = range.x;
  let last = range.y - 1u;
  let end = min(start + 1u, last);
  let closed = last > first + 2u && all(readPathPoint(first).xyz == readPathPoint(last).xyz);
  let left = select(max(start, first + 1u) - 1u, last - 1u, start == first && closed);
  let right = select(min(end + 1u, last), first + 1u, end == last && closed);
  let segmentType = select(0.0, 1.0, start == first && !closed) +
                    select(0.0, 2.0, end == last && !closed);
  let origin = select(vec4<f32>(0.0), pathViewOrigins[row], pathStorageStyleConfig.useViewOrigins != 0u);
  let startPoint = readPathPoint(start) + origin;
  let endPoint = readPathPoint(end) + origin;
  let width = select(pathStorageStyleConfig.constantWidth, pathRowWidths[row], pathStorageStyleConfig.useRowWidths != 0u);
  var strokeColor = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    strokeColor = unpackPathColor(pathVertexColors[select(start, end, corner.x > 0.0)]);
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    strokeColor = unpackPathColor(pathRowColors[row]);
  }
  let zero = vec3<f32>(0.0);
  let attributes = Attributes(
    corner, segmentType, (readPathPoint(left) + origin).xyz, startPoint.xyz,
    endPoint.xyz, (readPathPoint(right) + origin).xyz, zero, zero, zero, zero,
    width, strokeColor, rowIndex
  );
`;

const storageVertexOutput = /* wgsl */ `
  varyings.pathPickingColor = picking_getPickingColorFromIndex(rowIndex);
  let timestamp = pathLayerStyle.temporalMode == 2u;
  varyings.measure = select(
    mix(startPoint.w, endPoint.w, corner.x),
    pathTimestamps[select(start, end, corner.x > 0.0)],
    timestamp
  );
`;

const GPU_PATH_SHADER = makePathShaderWGSL({
  vertexEntry: storageVertexEntry,
  vertexSetup: storageVertexSetup,
  vertexOutput: storageVertexOutput,
  extraVaryings:
    '@location(9) measure: f32, @location(10) @interpolate(flat) pathPickingColor: vec3<f32>,',
  fragmentFilter: /* wgsl */ `
    let trailStart = pathLayerStyle.currentTime - pathLayerStyle.trailLength;
    if (pathLayerStyle.temporalMode != 0u &&
        (varyings.measure < trailStart || varyings.measure > pathLayerStyle.currentTime)) { discard; }
    if (picking.isActive > 0.5) {
      if (!picking_isColorValid(varyings.pathPickingColor)) { discard; }
      return vec4<f32>(varyings.pathPickingColor, 1.0);
    }
  `,
  colorFilter: /* wgsl */ `
    if (pathLayerStyle.temporalMode == 2u && pathLayerStyle.fadeTrail != 0u) {
      color.a *= clamp((varyings.measure - trailStart) / max(pathLayerStyle.trailLength, 0.000001), 0.0, 1.0);
    }
  `
});

/** Deck host for the GPU-only variable-length path model. */
class PreparedPathLayer extends Layer<PreparedPathLayerProps> {
  static override layerName = 'PreparedPathLayer';

  override getAttributeManager() {
    return null;
  }

  override initializeState({device}: LayerContext): void {
    if (device.type !== 'webgpu') throw new Error('StoragePathLayer requires WebGPU');
    this.setState({model: null, temporalBuffer: null, defaultTimestampBuffer: null});
    this.createModel();
  }

  override updateState({props}: UpdateParameters<this>): void {
    const boundInputs = ((this.state as StoragePathLayerState).model?.userData['boundInputs'] ??
      []) as unknown[];
    if (
      props.paths !== boundInputs[0] ||
      props.colors !== boundInputs[1] ||
      props.widths !== boundInputs[2] ||
      props.timestamps !== boundInputs[3] ||
      props.viewOrigins !== boundInputs[4] ||
      Boolean(props.antialiasing) !== boundInputs[5]
    ) {
      this.destroyModel();
      this.createModel();
    }
  }

  override getModels() {
    const model = (this.state as StoragePathLayerState | undefined)?.model;
    return model ? [model] : [];
  }

  override draw({renderPass}: {renderPass: RenderPass}): void {
    const {model, temporalBuffer} = this.state as StoragePathLayerState;
    if (!model || !temporalBuffer) return;
    const values = new ArrayBuffer(16);
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
    model.shaderInputs.setProps({
      path: {
        widthScale: this.props.widthScale ?? 1,
        widthMinPixels: this.props.widthMinPixels ?? 0,
        widthMaxPixels: this.props.widthMaxPixels ?? Number.MAX_SAFE_INTEGER,
        miterLimit: this.props.miterLimit ?? 4,
        widthUnits: UNIT[this.props.widthUnits ?? 'pixels'],
        jointType: Number(Boolean(this.props.jointRounded)),
        capType: Number(Boolean(this.props.capRounded)),
        billboard: this.props.billboard ?? true
      }
    });
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
      byteLength: 16,
      usage: Buffer.UNIFORM | Buffer.COPY_DST
    });
    const defaultTimestampBuffer = device.createBuffer({
      id: `${this.id}-default-timestamp`,
      data: new Float32Array([0]),
      usage: Buffer.STORAGE | Buffer.COPY_DST
    });
    const constantColor = isGPUVector(this.props.colors)
      ? undefined
      : normalizeColor(this.props.colors ?? [0, 0, 0, 255]);
    const model = new PathStorageModel(device, {
      ...this.getShaders({
        modules: [project32, color, picking, pathUniforms],
        plugins: [pathShaderPlugin],
        defines: this.props.antialiasing ? {ANTIALIASING: 1} : {},
        source: GPU_PATH_SHADER
      }),
      id: `${this.id}-model`,
      shaderLayout: GPU_PATH_SHADER_LAYOUT,
      paths: this.props.paths,
      ...(isGPUVector(this.props.colors) ? {colors: this.props.colors} : {color: constantColor}),
      ...(isGPUVector(this.props.widths)
        ? {widths: this.props.widths}
        : {width: typeof this.props.widths === 'number' ? this.props.widths : 1}),
      ...(this.props.timestamps ? {timestamps: this.props.timestamps} : {}),
      ...(this.props.viewOrigins ? {viewOrigins: this.props.viewOrigins} : {}),
      bindings: {pathLayerStyle: temporalBuffer, pathTimestamps: defaultTimestampBuffer},
      topology: 'triangle-list',
      vertexCount: 12
    });
    model.userData['boundInputs'] = [
      this.props.paths,
      this.props.colors,
      this.props.widths,
      this.props.timestamps,
      this.props.viewOrigins,
      Boolean(this.props.antialiasing)
    ];
    this.setState({model, temporalBuffer, defaultTimestampBuffer} satisfies StoragePathLayerState);
  }

  private destroyModel(): void {
    const state = this.state as StoragePathLayerState;
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
