// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import {
  Layer,
  log,
  picking,
  project32,
  type LayerContext,
  type LayerProps,
  type PickingInfo,
  type UpdateParameters
} from '@deck.gl/core';
import {
  ArrowPathRenderer,
  getArrowRecordBatchAsyncIterator,
  resolveArrowPathSourceVectors,
  type ArrowColorType,
  type ArrowPathSourceVectors,
  type ArrowPathSourceVectorSelectors,
  type ArrowRecordBatchSource,
  type PreparedArrowPathRendererGPUVectors
} from '@luma.gl/arrow';
import {
  Buffer,
  type BufferLayout,
  type Device,
  type ShaderLayout,
  type TypedArray
} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {GPUConstant, GPUVector, type GPUVectorFormat} from '@luma.gl/gpgpu/gpu-data';
import {PathAttributeModel, PathStorageModel} from '@luma.gl/experimental/models';
import {
  DataType,
  vectorFromArray,
  type Data,
  type Float32,
  type FixedSizeList,
  type List,
  type RecordBatch,
  type Uint8,
  type Vector
} from 'apache-arrow';
import {
  deckArrowViewport,
  DECK_ARROW_ALPHA_BLEND_PARAMETERS,
  DECK_ARROW_WGSL_COLOR_UTILS,
  setDeckArrowViewport,
  watchDeckArrowModelPipeline,
  type ArrowLayerPickingInfo
} from './arrow-layer-types';
import {
  assertArrowLayerColorGPUVector,
  assertArrowLayerGPUVector,
  convertArrowLayerColorGPUVector,
  convertArrowLayerColorVector,
  getArrowLayerInputNullValue,
  getArrowLayerInputSource,
  hasArrowLayerColumn,
  isArrowLayerColor,
  isArrowLayerGPUVector,
  isArrowLayerScalar,
  readArrowLayerGPUVector,
  type ArrowLayerColumnSource,
  type ArrowLayerInput
} from './arrow-layer-input';

type ArrowPathColor = [number, number, number, number];
type ArrowPathRowColorType = ArrowColorType;
type ArrowPathVertexColorType = List<FixedSizeList<Uint8>>;
type ArrowPathColorSource = ArrowLayerColumnSource<
  ArrowPathRowColorType | ArrowPathVertexColorType
>;
type ArrowPathWidthSource = ArrowLayerColumnSource<Float32, 'float32'>;

/** Constant, Arrow column, or GPU column accepted by ArrowPathLayer.color. */
export type ArrowPathColorInput = ArrowLayerInput<ArrowPathColor, ArrowPathColorSource>;
/** Constant, Arrow column, or GPU column accepted by ArrowPathLayer.width. */
export type ArrowPathWidthInput = ArrowLayerInput<number, ArrowPathWidthSource>;

const DEFAULT_PATH_COLOR: ArrowPathColor = [199, 219, 245, 255];
const DEFAULT_PATH_WIDTH = 0.0035;

const CONSTANT_PATH_COLOR_BUFFER = 'constantPathColor';
const CONSTANT_PATH_WIDTH_BUFFER = 'constantPathWidth';
const CONSTANT_PATH_TEMPORAL_BUFFER = 'constantPathTemporal';

const DECK_PATH_FS = `#version 300 es
precision highp float;

in vec4 vColor;
in float vVisible;
in vec3 vTimeWindow;
out vec4 fragColor;

void main() {
  if (vVisible < 0.5 || vTimeWindow.x < vTimeWindow.y || vTimeWindow.x > vTimeWindow.z) discard;
  fragColor = vColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

const DECK_PATH_SHADER_LAYOUT: ShaderLayout = {
  attributes: [
    {name: 'segmentStartPositions', location: 0, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'segmentEndPositions', location: 1, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'rowIndices', location: 2, type: 'u32', stepMode: 'instance'},
    {name: 'segmentStartColors', location: 3, type: 'u32', stepMode: 'instance'},
    {name: 'segmentEndColors', location: 4, type: 'u32', stepMode: 'instance'},
    {name: 'widths', location: 5, type: 'f32', stepMode: 'instance'},
    {name: 'pathViewOrigins', location: 6, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'currentTime', location: 7, type: 'f32', stepMode: 'instance'},
    {name: 'trailLength', location: 8, type: 'f32', stepMode: 'instance'},
    {name: 'temporalEnabled', location: 9, type: 'f32', stepMode: 'instance'}
  ],
  bindings: []
};

const DECK_PATH_VS = `#version 300 es
precision highp float;
precision highp int;

in vec4 segmentStartPositions;
in vec4 segmentEndPositions;
in uint rowIndices;
in uint segmentStartColors;
in uint segmentEndColors;
in float widths;
in vec4 pathViewOrigins;
in float currentTime;
in float trailLength;
in float temporalEnabled;

out vec4 vColor;
out float vVisible;
out vec3 vTimeWindow;

vec3 encodeDeckPickingColor(int objectIndex) {
  int colorIndex = objectIndex + 1;
  return vec3(
    float(colorIndex % 256),
    float((colorIndex / 256) % 256),
    float((colorIndex / 65536) % 256)
  );
}

vec4 unpackPathColor(uint colorWord) {
  return vec4(
    float(colorWord & 255u),
    float((colorWord >> 8u) & 255u),
    float((colorWord >> 16u) & 255u),
    float((colorWord >> 24u) & 255u)
  ) / 255.0;
}

vec2 getTriangleCorner(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, -1.0);
  if (vertexIndex == 1) return vec2(1.0, -1.0);
  if (vertexIndex == 2) return vec2(1.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, -1.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  return vec2(0.0, 1.0);
}

void main() {
  vec2 corner = getTriangleCorner(gl_VertexID % 6);
  vec4 startPosition = pathViewOrigins + segmentStartPositions;
  vec4 endPosition = pathViewOrigins + segmentEndPositions;
  vec2 direction = normalize(endPosition.xy - startPosition.xy);
  if (any(isnan(direction))) direction = vec2(1.0, 0.0);
  vec2 normal = vec2(-direction.y, direction.x);
  vec4 pathPosition = mix(startPosition, endPosition, corner.x);
  pathPosition.xy += normal * corner.y * widths;
  gl_Position = project_position_to_clipspace(pathPosition.xyz, vec3(0.0), vec3(0.0));
  float startMeasure = segmentStartPositions.w + pathViewOrigins.w;
  float endMeasure = segmentEndPositions.w + pathViewOrigins.w;
  vVisible = temporalEnabled < 0.5 ||
    (endMeasure >= currentTime - trailLength && startMeasure <= currentTime) ? 1.0 : 0.0;
  vTimeWindow = vec3(
    mix(startMeasure, endMeasure, corner.x),
    temporalEnabled < 0.5 ? -1e30 : currentTime - trailLength,
    temporalEnabled < 0.5 ? 1e30 : currentTime
  );
  geometry.position = gl_Position;
  geometry.pickingColor = encodeDeckPickingColor(int(rowIndices));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vColor = mix(
    unpackPathColor(segmentStartColors),
    unpackPathColor(segmentEndColors),
    corner.x
  );
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

const DECK_PATH_WGSL = /* wgsl */ `
${DECK_ARROW_WGSL_COLOR_UTILS}

struct PathVertexInputs {
  @location(0) segmentStartPositions: vec4<f32>,
  @location(1) segmentEndPositions: vec4<f32>,
  @location(2) rowIndices: u32,
  @location(3) segmentStartColors: u32,
  @location(4) segmentEndColors: u32,
  @location(5) widths: f32,
  @location(6) pathViewOrigins: vec4<f32>,
  @location(7) currentTime: f32,
  @location(8) trailLength: f32,
  @location(9) temporalEnabled: f32,
};

struct PathVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) @interpolate(flat) visible: f32,
  @location(3) timeWindow: vec3<f32>,
};

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn getTriangleCorner(vertexIndex: u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

@vertex
fn vertexMain(inputs: PathVertexInputs, @builtin(vertex_index) vertexIndex: u32) -> PathVertexOutputs {
  var outputs: PathVertexOutputs;
  let corner = getTriangleCorner(vertexIndex % 6u);
  let startPosition = inputs.pathViewOrigins + inputs.segmentStartPositions;
  let endPosition = inputs.pathViewOrigins + inputs.segmentEndPositions;
  let delta = endPosition.xy - startPosition.xy;
  var direction = vec2<f32>(1.0, 0.0);
  if (length(delta) > 0.000001) {
    direction = normalize(delta);
  }
  let normal = vec2<f32>(-direction.y, direction.x);
  var pathPosition = mix(startPosition, endPosition, corner.x);
  pathPosition.x += normal.x * corner.y * inputs.widths;
  pathPosition.y += normal.y * corner.y * inputs.widths;
  outputs.position = deck_projectPosition(pathPosition.xyz);
  outputs.color = mix(
    unpackPathColor(inputs.segmentStartColors),
    unpackPathColor(inputs.segmentEndColors),
    corner.x
  );
  outputs.pickingColor = deck_encodePickingColor(inputs.rowIndices);
  let startMeasure = inputs.segmentStartPositions.w + inputs.pathViewOrigins.w;
  let endMeasure = inputs.segmentEndPositions.w + inputs.pathViewOrigins.w;
  outputs.visible = select(
    0.0,
    1.0,
    inputs.temporalEnabled < 0.5 ||
      (endMeasure >= inputs.currentTime - inputs.trailLength && startMeasure <= inputs.currentTime)
  );
  outputs.timeWindow = vec3<f32>(
    mix(startMeasure, endMeasure, corner.x),
    select(inputs.currentTime - inputs.trailLength, -1e30, inputs.temporalEnabled < 0.5),
    select(inputs.currentTime, 1e30, inputs.temporalEnabled < 0.5)
  );
  return outputs;
}

@fragment
fn fragmentMain(inputs: PathVertexOutputs) -> @location(0) vec4<f32> {
  if (inputs.visible < 0.5 || inputs.timeWindow.x < inputs.timeWindow.y || inputs.timeWindow.x > inputs.timeWindow.z) { discard; }
  return deck_filterColor(inputs.color, inputs.pickingColor);
}
`;

const DECK_PATH_STORAGE_SHADER_LAYOUT: ShaderLayout = {
  attributes: [
    {name: 'segmentStartPointIndices', location: 0, type: 'u32', stepMode: 'instance'},
    {name: 'segmentFlags', location: 1, type: 'u32', stepMode: 'instance'},
    {name: 'rowIndices', location: 2, type: 'u32', stepMode: 'instance'},
    {name: 'currentTime', location: 3, type: 'f32', stepMode: 'instance'},
    {name: 'trailLength', location: 4, type: 'f32', stepMode: 'instance'},
    {name: 'temporalEnabled', location: 5, type: 'f32', stepMode: 'instance'},
    {name: 'fadeTrail', location: 6, type: 'f32', stepMode: 'instance'}
  ],
  bindings: []
};

const DECK_PATH_STORAGE_WGSL = /* wgsl */ `
${DECK_ARROW_WGSL_COLOR_UTILS}

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

struct PathStorageVertexInputs {
  @location(0) segmentStartPointIndex: u32,
  @location(1) segmentFlags: u32,
  @location(2) rowIndex: u32,
  @location(3) currentTime: f32,
  @location(4) trailLength: f32,
  @location(5) temporalEnabled: f32,
  @location(6) fadeTrail: f32,
};

struct PathStorageVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) @interpolate(flat) visible: f32,
  @location(3) timeWindow: vec3<f32>,
  @location(4) @interpolate(flat) fadeTrail: f32,
};

fn unpackStoragePathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn readStoragePathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) { return 0.0; }
  return pathValues[pointIndex * pathStorageStyleConfig.pathComponentCount + componentIndex];
}

fn readStoragePathPoint(pointIndex: u32) -> vec4<f32> {
  return vec4<f32>(
    readStoragePathComponent(pointIndex, 0u),
    readStoragePathComponent(pointIndex, 1u),
    readStoragePathComponent(pointIndex, 2u),
    readStoragePathComponent(pointIndex, 3u)
  );
}

fn readStoragePathViewOrigin(rowIndex: u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) { return vec4<f32>(0.0); }
  return pathViewOrigins[rowIndex];
}

fn getStoragePathCorner(vertexIndex: u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, -1.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, -1.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

@vertex
fn vertexMain(
  inputs: PathStorageVertexInputs,
  @builtin(vertex_index) vertexIndex: u32
) -> PathStorageVertexOutputs {
  let localRowIndex = inputs.rowIndex - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = pathRanges[localRowIndex];
  let segmentEndPointIndex = min(inputs.segmentStartPointIndex + 1u, pathRange.y - 1u);
  let viewOrigin = readStoragePathViewOrigin(localRowIndex);
  let startPosition = readStoragePathPoint(inputs.segmentStartPointIndex) + viewOrigin;
  let endPosition = readStoragePathPoint(segmentEndPointIndex) + viewOrigin;
  let delta = endPosition.xy - startPosition.xy;
  var direction = vec2<f32>(1.0, 0.0);
  if (length(delta) > 0.000001) { direction = normalize(delta); }
  let normal = vec2<f32>(-direction.y, direction.x);
  let corner = getStoragePathCorner(vertexIndex % 6u);
  let pathWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[localRowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  var pathPosition = mix(startPosition, endPosition, corner.x);
  pathPosition.x += normal.x * corner.y * pathWidth;
  pathPosition.y += normal.y * corner.y * pathWidth;

  var outputs: PathStorageVertexOutputs;
  outputs.position = deck_projectPosition(pathPosition.xyz);
  outputs.color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    outputs.color = mix(
      unpackStoragePathColor(pathVertexColors[inputs.segmentStartPointIndex]),
      unpackStoragePathColor(pathVertexColors[segmentEndPointIndex]),
      corner.x
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackStoragePathColor(pathRowColors[localRowIndex]);
  }
  outputs.pickingColor = deck_encodePickingColor(inputs.rowIndex);
  let usesTimestampColumn = inputs.temporalEnabled > 1.5;
  let startMeasure = select(
    startPosition.w,
    pathTimestamps[inputs.segmentStartPointIndex],
    usesTimestampColumn
  );
  let endMeasure = select(
    endPosition.w,
    pathTimestamps[segmentEndPointIndex],
    usesTimestampColumn
  );
  outputs.visible = select(
    0.0,
    1.0,
    inputs.temporalEnabled < 0.5 ||
      (endMeasure >= inputs.currentTime - inputs.trailLength && startMeasure <= inputs.currentTime)
  );
  outputs.timeWindow = vec3<f32>(
    mix(startMeasure, endMeasure, corner.x),
    select(inputs.currentTime - inputs.trailLength, -1e30, inputs.temporalEnabled < 0.5),
    select(inputs.currentTime, 1e30, inputs.temporalEnabled < 0.5)
  );
  outputs.fadeTrail = select(0.0, 1.0, usesTimestampColumn && inputs.fadeTrail > 0.5);
  return outputs;
}

@fragment
fn fragmentMain(inputs: PathStorageVertexOutputs) -> @location(0) vec4<f32> {
  if (inputs.visible < 0.5 || inputs.timeWindow.x < inputs.timeWindow.y || inputs.timeWindow.x > inputs.timeWindow.z) { discard; }
  var color = inputs.color;
  color.a *= select(
    1.0,
    clamp((inputs.timeWindow.x - inputs.timeWindow.y) / max(inputs.timeWindow.z - inputs.timeWindow.y, 0.000001), 0.0, 1.0),
    inputs.fadeTrail > 0.5
  );
  return deck_filterColor(color, inputs.pickingColor);
}
`;

type ArrowPathLayerBatch = {
  model: Model;
  prepared: PreparedArrowPathRendererGPUVectors;
  constantBuffers: Buffer[];
  batchIndex: number;
  rowIndexOffset: number;
  rowCount: number;
  temporalBuffer: Buffer | null;
  timestampColumnEnabled: boolean;
  convertedColorVector: GPUVector | null;
};

/** Deck-facing props for an Arrow-backed path layer. */
export type ArrowPathLayerProps = Omit<LayerProps, 'data'> &
  Omit<ArrowPathSourceVectorSelectors, 'colors' | 'widths'> & {
    /** Arrow table or preserved record-batch source. */
    data?: ArrowRecordBatchSource | null;
    /** GPU path model. Storage is available on WebGPU; auto selects it when supported. */
    model?: 'attribute' | 'storage' | 'auto';
    /** Constant color, color source, or color source with an explicit null replacement. */
    color?: ArrowPathColorInput;
    /** Constant width, width source, or width source with an explicit null replacement. */
    width?: ArrowPathWidthInput;
    /** Current path measure used by temporal trail filtering. */
    currentTime?: number;
    /** Visible temporal trail length in path measure units. */
    trailLength?: number;
    /** Enables temporal filtering against the fourth coordinate component. */
    temporalEnabled?: boolean;
    /** Fades timestamp-backed trip segments across the visible trail. */
    fadeTrail?: boolean;
    /** Called after one streamed record batch has been prepared and appended. */
    onDataBatch?: (update: {
      loadedBatchCount: number;
      isFirstBatch: boolean;
      batchIndex: number;
      rowIndexOffset: number;
      rowCount: number;
    }) => void;
    /** Called when layer-owned Arrow loading or preparation fails. */
    onDataError?: (error: unknown) => void;
  };

type ArrowPathLayerState = {
  batches: ArrowPathLayerBatch[];
  loadVersion: number;
  sourceInitialized: boolean;
  gpuVectorSourceCache: Map<GPUVector, Promise<Vector>>;
};

/** deck.gl layer that converts and appends Arrow path batches without materializing the stream. */
export class ArrowPathLayer extends Layer<ArrowPathLayerProps> {
  static override layerName = 'ArrowPathLayer';
  static override defaultProps = {
    data: {type: 'object', value: null, optional: true},
    parameters: DECK_ARROW_ALPHA_BLEND_PARAMETERS
  };

  override getAttributeManager() {
    return null;
  }

  override setShaderModuleProps(props: Parameters<Model['shaderInputs']['setProps']>[0]): void {
    super.setShaderModuleProps(
      this.context.device.type === 'webgpu'
        ? {layer: props['layer'], picking: props['picking']}
        : {layer: props['layer'], project: props['project'], picking: props['picking']}
    );
  }

  override initializeState(): void {
    this.setState({
      batches: [],
      loadVersion: 0,
      sourceInitialized: false,
      gpuVectorSourceCache: new Map()
    } satisfies ArrowPathLayerState);
  }

  override updateState({props, oldProps, changeFlags}: UpdateParameters<this>): void {
    const state = this.getLayerState();
    const sourceChanged =
      !state.sourceInitialized ||
      changeFlags.dataChanged ||
      props.paths !== oldProps.paths ||
      props.model !== oldProps.model ||
      props.color !== oldProps.color ||
      props.width !== oldProps.width;
    const timestampSourceChanged = props.timestamps !== oldProps.timestamps;
    if (sourceChanged || timestampSourceChanged) {
      state.sourceInitialized = true;
      void this.loadSource(props);
      return;
    }
    if (
      props.currentTime !== oldProps.currentTime ||
      props.trailLength !== oldProps.trailLength ||
      props.temporalEnabled !== oldProps.temporalEnabled ||
      props.fadeTrail !== oldProps.fadeTrail
    ) {
      for (const batch of state.batches) {
        updateDeckPathTemporalStyle(batch, props);
      }
      this.setNeedsRedraw();
    }
  }

  override getModels(): Model[] {
    return (this.state as ArrowPathLayerState | undefined)?.batches.map(batch => batch.model) ?? [];
  }

  override draw({renderPass, context}: Parameters<Layer<ArrowPathLayerProps>['draw']>[0]): void {
    for (const {model} of this.getLayerState().batches) {
      if (model.device.type === 'webgpu') setDeckArrowViewport(model, context.viewport);
      model.draw(renderPass);
    }
  }

  override getPickingInfo({info}: {info: PickingInfo}): ArrowLayerPickingInfo {
    const pickingInfo = info as ArrowLayerPickingInfo;
    const rowIndex = pickingInfo.index;
    const batch = this.getLayerState().batches.find(
      candidate =>
        rowIndex >= candidate.rowIndexOffset &&
        rowIndex < candidate.rowIndexOffset + candidate.rowCount
    );
    if (batch) {
      pickingInfo.arrow = {
        rowIndex,
        batchIndex: batch.batchIndex,
        batchRowIndex: rowIndex - batch.rowIndexOffset
      };
    }
    return pickingInfo;
  }

  override finalizeState(context: LayerContext): void {
    const state = this.getLayerState();
    state.loadVersion++;
    destroyPathBatches(state.batches);
    this.setState({
      batches: [],
      loadVersion: state.loadVersion,
      sourceInitialized: true,
      gpuVectorSourceCache: new Map()
    } satisfies ArrowPathLayerState);
    super.finalizeState(context);
  }

  private async loadSource(props: ArrowPathLayerProps): Promise<void> {
    const state = this.getLayerState();
    const loadVersion = state.loadVersion + 1;
    state.loadVersion = loadVersion;
    const previousBatches = state.batches;
    this.setState({
      batches: [],
      loadVersion,
      sourceInitialized: true
    });
    destroyPathBatches(previousBatches);
    this.setNeedsRedraw();

    try {
      if (props.data) {
        await this.loadRecordBatchSource(props, props.data, loadVersion);
      } else if (props.paths && typeof props.paths !== 'string') {
        await this.appendSourceBatch(props, undefined, 0, 0, loadVersion);
      }
    } catch (error) {
      if (this.isActiveLoad(loadVersion)) {
        if (props.onDataError) {
          props.onDataError(error);
        } else {
          this.raiseError(toError(error), `loading Arrow data in ${this}`);
        }
      }
    }
  }

  private async loadRecordBatchSource(
    props: ArrowPathLayerProps,
    data: ArrowRecordBatchSource,
    loadVersion: number
  ): Promise<void> {
    const iterator = getArrowRecordBatchAsyncIterator(data);
    let batchIndex = 0;
    let rowIndexOffset = 0;
    for (let result = await iterator.next(); !result.done; result = await iterator.next()) {
      if (!this.isActiveLoad(loadVersion)) {
        return;
      }
      await this.appendSourceBatch(props, result.value, batchIndex, rowIndexOffset, loadVersion);
      rowIndexOffset += result.value.numRows;
      batchIndex++;
    }
  }

  private async appendSourceBatch(
    props: ArrowPathLayerProps,
    recordBatch: RecordBatch | undefined,
    batchIndex: number,
    rowIndexOffset: number,
    loadVersion: number
  ): Promise<void> {
    const model = resolveDeckPathModel(this.context.device, props.model);
    const requestedColorSource = getArrowLayerInputSource(props.color, isArrowLayerColor);
    const requestedWidthSource = getArrowLayerInputSource(props.width, isArrowLayerScalar);
    const colorNullValue = getArrowLayerInputNullValue(
      props.color,
      DEFAULT_PATH_COLOR,
      isArrowLayerColor
    );
    const widthNullValue = getArrowLayerInputNullValue(
      props.width,
      DEFAULT_PATH_WIDTH,
      isArrowLayerScalar
    );
    const colorSource = this.resolveNamedBatchStyleSource(
      requestedColorSource,
      recordBatch,
      'color',
      colorNullValue
    );
    const widthSource = this.resolveNamedBatchStyleSource(
      requestedWidthSource,
      recordBatch,
      'width',
      widthNullValue
    );
    if (isArrowLayerGPUVector(colorSource)) {
      assertArrowLayerColorGPUVector('ArrowPathLayer color', colorSource);
    }
    if (isArrowLayerGPUVector(widthSource)) {
      assertArrowLayerGPUVector('ArrowPathLayer width', widthSource, ['float32']);
    }
    const colorSelector =
      model === 'storage' && isArrowLayerGPUVector(colorSource)
        ? undefined
        : await this.resolvePathStyleSource(
            colorSource,
            rowIndexOffset,
            recordBatch?.numRows,
            true
          );
    const widthSelector =
      model === 'storage' && isArrowLayerGPUVector(widthSource)
        ? undefined
        : await this.resolvePathStyleSource(
            widthSource,
            rowIndexOffset,
            recordBatch?.numRows,
            false
          );
    let sourceVectors = resolveArrowPathSourceVectors(
      model === 'storage' ? PathStorageModel : PathAttributeModel,
      {
        data: recordBatch,
        selectors: {
          paths: props.paths,
          colors: (colorSelector ?? null) as ArrowPathSourceVectorSelectors['colors'],
          widths: widthSelector ?? null,
          ...(model === 'storage' && props.timestamps !== undefined
            ? {timestamps: props.timestamps}
            : {})
        }
      }
    );
    if (sourceVectors.colors && !DataType.isList(sourceVectors.colors.type)) {
      sourceVectors = {
        ...sourceVectors,
        colors: (await convertArrowLayerColorVector(
          this.context.device,
          sourceVectors.colors,
          `${props.id}-batch-${batchIndex}-arrow-colors`
        )) as NonNullable<ArrowPathSourceVectors['colors']>
      };
    }
    sourceVectors = fillNullablePathStyleVectors(sourceVectors, colorNullValue, widthNullValue);
    const prepared = await ArrowPathRenderer.convertToGPUVectors(
      this.context.device,
      sourceVectors,
      {
        model,
        id: `${props.id}-batch-${batchIndex}`,
        rowIndexBase: rowIndexOffset
      }
    );
    if (!this.isActiveLoad(loadVersion)) {
      prepared.destroy();
      return;
    }

    let convertedColorVector: GPUVector | null = null;
    let preparedColorColumn = prepared.colors;
    if (model === 'storage' && isArrowLayerGPUVector(colorSource)) {
      try {
        const sourceColorBatch = getPathStorageGPUVectorBatch(
          colorSource,
          batchIndex,
          sourceVectors.paths.length
        );
        const normalized = await convertArrowLayerColorGPUVector(
          this.context.device,
          sourceColorBatch,
          `${props.id}-batch-${batchIndex}-colors`
        );
        preparedColorColumn = normalized.vector;
        convertedColorVector = normalized.converted ? normalized.vector : null;
      } catch (error) {
        prepared.destroy();
        throw error;
      }
      if (!this.isActiveLoad(loadVersion)) {
        convertedColorVector?.destroy();
        prepared.destroy();
        return;
      }
    }
    const preparedWidthColumn =
      model === 'storage' && isArrowLayerGPUVector(widthSource)
        ? getPathStorageGPUVectorBatch(widthSource, batchIndex, sourceVectors.paths.length)
        : prepared.widths;
    const colorColumn =
      preparedColorColumn ??
      new GPUConstant({format: 'unorm8x4', value: new Uint8Array(colorNullValue)});
    const widthColumn =
      preparedWidthColumn ??
      new GPUConstant({format: 'float32', value: new Float32Array([widthNullValue])});

    const constantStyle = createDeckPathConstantStyle(this.context.device, {
      id: `${props.id}-batch-${batchIndex}`,
      hasColors: model === 'storage' || Boolean(sourceVectors.colors),
      hasWidths: model === 'storage' || Boolean(sourceVectors.widths),
      color: colorNullValue,
      width: widthNullValue,
      currentTime: props.currentTime ?? 0,
      trailLength: props.trailLength ?? 0,
      temporalEnabled: props.temporalEnabled ?? false,
      timestampColumnEnabled: Boolean(sourceVectors.timestamps),
      fadeTrail: props.fadeTrail ?? false
    });
    let renderModel: Model;
    try {
      if (model === 'storage') {
        renderModel = ArrowPathRenderer.createModel(this.context.device, {
          ...prepared,
          model: 'storage',
          id: `${props.id}-batch-${batchIndex}`,
          ...this.getShaders({
            modules: [deckArrowViewport, picking],
            source: DECK_PATH_STORAGE_WGSL
          }),
          shaderLayout: DECK_PATH_STORAGE_SHADER_LAYOUT,
          bufferLayout: constantStyle.bufferLayout,
          attributes: constantStyle.attributes,
          bindings: {pathTimestamps: constantStyle.defaultTimestampBuffer},
          ...(colorColumn instanceof GPUVector ? {colors: colorColumn} : {color: colorNullValue}),
          ...(widthColumn instanceof GPUVector ? {widths: widthColumn} : {width: widthNullValue}),
          topology: 'triangle-list',
          vertexCount: 6
        });
      } else {
        renderModel = ArrowPathRenderer.createModel(this.context.device, {
          ...prepared,
          model: 'attribute',
          id: `${props.id}-batch-${batchIndex}`,
          ...this.getShaders(
            this.context.device.type === 'webgpu'
              ? {modules: [deckArrowViewport, picking], source: DECK_PATH_WGSL}
              : {modules: [project32, picking], vs: DECK_PATH_VS, fs: DECK_PATH_FS}
          ),
          shaderLayout: DECK_PATH_SHADER_LAYOUT,
          ...(colorColumn instanceof GPUVector ? {colors: colorColumn} : {}),
          ...(widthColumn instanceof GPUVector ? {widths: widthColumn} : {}),
          bufferLayout: constantStyle.bufferLayout,
          attributes: constantStyle.attributes,
          constantAttributes: constantStyle.constantAttributes,
          topology: 'triangle-list',
          vertexCount: 6
        });
      }
    } catch (error) {
      destroyBuffers(constantStyle.buffers);
      convertedColorVector?.destroy();
      prepared.destroy();
      throw error;
    }
    if (!this.isActiveLoad(loadVersion)) {
      renderModel.destroy();
      destroyBuffers(constantStyle.buffers);
      convertedColorVector?.destroy();
      prepared.destroy();
      return;
    }

    const rowCount = sourceVectors.paths.length;
    const batch: ArrowPathLayerBatch = {
      model: renderModel,
      prepared,
      constantBuffers: constantStyle.buffers,
      batchIndex,
      rowIndexOffset,
      rowCount,
      temporalBuffer: constantStyle.temporalBuffer,
      timestampColumnEnabled: Boolean(sourceVectors.timestamps),
      convertedColorVector
    };
    const batches = [...this.getLayerState().batches, batch];
    this.setState({batches, loadVersion, sourceInitialized: true});
    this.setNeedsRedraw();
    watchDeckArrowModelPipeline(
      renderModel,
      () => {
        if (this.isActiveLoad(loadVersion)) this.setNeedsRedraw();
      },
      error => {
        if (this.isActiveLoad(loadVersion)) {
          if (props.onDataError) props.onDataError(error);
          else this.raiseError(error, `linking Arrow shaders in ${this}`);
        }
      }
    );
    props.onDataBatch?.({
      loadedBatchCount: batches.length,
      isFirstBatch: batchIndex === 0,
      batchIndex,
      rowIndexOffset,
      rowCount
    });
  }

  private isActiveLoad(loadVersion: number): boolean {
    return this.getLayerState().loadVersion === loadVersion;
  }

  private async resolvePathStyleSource<Source extends ArrowPathColorSource | ArrowPathWidthSource>(
    source: Source | undefined,
    rowIndexOffset: number,
    rowCount: number | undefined,
    normalizeColor: boolean
  ): Promise<Exclude<Source, GPUVector> | undefined> {
    if (!isArrowLayerGPUVector(source)) {
      return source as Exclude<Source, GPUVector> | undefined;
    }
    const cache = this.getLayerState().gpuVectorSourceCache;
    let arrowVectorPromise = cache.get(source);
    if (!arrowVectorPromise) {
      arrowVectorPromise = readArrowLayerGPUVector(
        this.context.device,
        source,
        `${this.id}-${normalizeColor ? 'colors' : 'values'}`,
        normalizeColor
      );
      cache.set(source, arrowVectorPromise);
    }
    const arrowVector = await arrowVectorPromise;
    return (
      rowCount === undefined
        ? arrowVector
        : arrowVector.slice(rowIndexOffset, rowIndexOffset + rowCount)
    ) as Exclude<Source, GPUVector>;
  }

  private resolveNamedBatchStyleSource<Source extends ArrowPathColorSource | ArrowPathWidthSource>(
    source: Source | undefined,
    recordBatch: RecordBatch | undefined,
    inputName: 'color' | 'width',
    defaultValue: ArrowPathColor | number
  ): Source | undefined {
    if (typeof source !== 'string' || hasArrowLayerColumn(recordBatch, source)) {
      return source;
    }
    log.warn(
      `${this.id}: ArrowPathLayer ${inputName} column "${source}" is missing; using ${inputName} default ${JSON.stringify(defaultValue)}`
    )();
    return undefined;
  }

  private getLayerState(): ArrowPathLayerState {
    return this.state as ArrowPathLayerState;
  }
}

function fillNullablePathStyleVectors(
  sourceVectors: ArrowPathSourceVectors,
  colorNullValue: ArrowPathColor,
  widthNullValue: number
): ArrowPathSourceVectors {
  const colors = sourceVectors.colors;
  const widths = sourceVectors.widths;
  return {
    ...sourceVectors,
    ...(colors && hasArrowVectorNulls(colors)
      ? {colors: fillNullablePathColors(sourceVectors.paths, colors, colorNullValue)}
      : {}),
    ...(widths && hasArrowVectorNulls(widths)
      ? {
          widths: vectorFromArray(
            Array.from(
              {length: widths.length},
              (_, rowIndex) => widths.get(rowIndex) ?? widthNullValue
            ),
            widths.type
          )
        }
      : {})
  };
}

function fillNullablePathColors(
  paths: ArrowPathSourceVectors['paths'],
  colors: NonNullable<ArrowPathSourceVectors['colors']>,
  nullValue: ArrowPathColor
): NonNullable<ArrowPathSourceVectors['colors']> {
  const rows = Array.from({length: colors.length}, (_, rowIndex) => {
    const row = colors.get(rowIndex);
    if (DataType.isList(colors.type)) {
      const path = paths.get(rowIndex);
      const vertexCount = path ? Array.from(path as Iterable<unknown>).length : 0;
      if (!row) {
        return Array.from({length: vertexCount}, () => nullValue);
      }
      return Array.from(row as Iterable<unknown>, value => normalizePathColor(value, nullValue));
    }
    return normalizePathColor(row, nullValue);
  });
  return vectorFromArray(rows, colors.type) as NonNullable<ArrowPathSourceVectors['colors']>;
}

function normalizePathColor(value: unknown, nullValue: ArrowPathColor): ArrowPathColor {
  if (!value || typeof value !== 'object' || !(Symbol.iterator in value)) {
    return nullValue;
  }
  const components = Array.from(value as Iterable<number | null>);
  return [
    components[0] ?? nullValue[0],
    components[1] ?? nullValue[1],
    components[2] ?? nullValue[2],
    components[3] ?? nullValue[3]
  ];
}

function hasArrowVectorNulls(vector: Vector): boolean {
  return vector.data.some(data => hasArrowDataNulls(data));
}

function hasArrowDataNulls(data: Data): boolean {
  return data.nullCount > 0 || data.children.some(hasArrowDataNulls);
}

function getPathStorageGPUVectorBatch<Format extends GPUVectorFormat>(
  vector: GPUVector<Format>,
  batchIndex: number,
  expectedRowCount: number
): GPUVector<Format> {
  const useWholeVector =
    vector.data.length === 1 && batchIndex === 0 && vector.length === expectedRowCount;
  const data = useWholeVector ? vector.data[0] : vector.data[batchIndex];
  if (!data || data.length !== expectedRowCount) {
    throw new Error(
      `ArrowPathLayer GPUVector "${vector.name}" batch ${batchIndex} rows must match paths rows`
    );
  }
  if (useWholeVector) {
    return vector;
  }
  return new GPUVector({
    type: 'data',
    name: `${vector.name}-batch-${batchIndex}`,
    format: vector.format,
    data: [data],
    ownsData: false
  });
}

function createDeckPathConstantStyle(
  device: Device,
  {
    id,
    hasColors,
    hasWidths,
    color,
    width,
    currentTime,
    trailLength,
    temporalEnabled,
    timestampColumnEnabled,
    fadeTrail
  }: {
    id: string;
    hasColors: boolean;
    hasWidths: boolean;
    color: ArrowPathColor;
    width: number;
    currentTime: number;
    trailLength: number;
    temporalEnabled: boolean;
    timestampColumnEnabled: boolean;
    fadeTrail: boolean;
  }
): {
  bufferLayout: BufferLayout[];
  attributes: Record<string, Buffer>;
  constantAttributes: Record<string, TypedArray>;
  buffers: Buffer[];
  temporalBuffer: Buffer | null;
  defaultTimestampBuffer: Buffer | null;
} {
  const bufferLayout: BufferLayout[] = [];
  const attributes: Record<string, Buffer> = {};
  const constantAttributes: Record<string, TypedArray> = {};
  const buffers: Buffer[] = [];
  let temporalBuffer: Buffer | null = null;
  let defaultTimestampBuffer: Buffer | null = null;

  if (!hasColors) {
    // WebGL sets integer constant attributes through vertexAttribI4uiv, so retain four lanes.
    // WebGPU consumes the first lane through the zero-stride uint32 layout.
    const value = new Uint32Array([packPathColor(color), 0, 0, 0]);
    bufferLayout.push({
      name: CONSTANT_PATH_COLOR_BUFFER,
      byteStride: 0,
      stepMode: 'instance',
      attributes: [
        {attribute: 'segmentStartColors', format: 'uint32', byteOffset: 0},
        {attribute: 'segmentEndColors', format: 'uint32', byteOffset: 0}
      ]
    });
    if (device.type === 'webgl') {
      constantAttributes['segmentStartColors'] = value;
      constantAttributes['segmentEndColors'] = value;
    } else {
      const buffer = device.createBuffer({id: `${id}-constant-color`, data: value});
      attributes[CONSTANT_PATH_COLOR_BUFFER] = buffer;
      buffers.push(buffer);
    }
  }

  if (!hasWidths) {
    const value = new Float32Array([width]);
    bufferLayout.push({
      name: CONSTANT_PATH_WIDTH_BUFFER,
      byteStride: 0,
      stepMode: 'instance',
      attributes: [{attribute: 'widths', format: 'float32', byteOffset: 0}]
    });
    if (device.type === 'webgl') {
      constantAttributes['widths'] = value;
    } else {
      const buffer = device.createBuffer({id: `${id}-constant-width`, data: value});
      attributes[CONSTANT_PATH_WIDTH_BUFFER] = buffer;
      buffers.push(buffer);
    }
  }

  const temporalValues = makeDeckPathTemporalValues({
    currentTime,
    trailLength,
    temporalEnabled,
    timestampColumnEnabled,
    fadeTrail
  });
  bufferLayout.push({
    name: CONSTANT_PATH_TEMPORAL_BUFFER,
    byteStride: 0,
    stepMode: 'instance',
    attributes: [
      {attribute: 'currentTime', format: 'float32', byteOffset: 0},
      {attribute: 'trailLength', format: 'float32', byteOffset: 4},
      {attribute: 'temporalEnabled', format: 'float32', byteOffset: 8},
      {attribute: 'fadeTrail', format: 'float32', byteOffset: 12}
    ]
  });
  if (device.type === 'webgl') {
    constantAttributes['currentTime'] = temporalValues.subarray(0, 1);
    constantAttributes['trailLength'] = temporalValues.subarray(1, 2);
    constantAttributes['temporalEnabled'] = temporalValues.subarray(2, 3);
    constantAttributes['fadeTrail'] = temporalValues.subarray(3, 4);
  } else {
    temporalBuffer = device.createBuffer({id: `${id}-constant-temporal`, data: temporalValues});
    attributes[CONSTANT_PATH_TEMPORAL_BUFFER] = temporalBuffer;
    buffers.push(temporalBuffer);
    defaultTimestampBuffer = device.createBuffer({
      id: `${id}-default-timestamp`,
      data: new Float32Array([0]),
      usage: Buffer.STORAGE
    });
    buffers.push(defaultTimestampBuffer);
  }

  return {
    bufferLayout,
    attributes,
    constantAttributes,
    buffers,
    temporalBuffer,
    defaultTimestampBuffer
  };
}

function updateDeckPathTemporalStyle(batch: ArrowPathLayerBatch, props: ArrowPathLayerProps): void {
  const temporalValues = makeDeckPathTemporalValues({
    currentTime: props.currentTime ?? 0,
    trailLength: props.trailLength ?? 0,
    temporalEnabled: props.temporalEnabled ?? false,
    timestampColumnEnabled: batch.timestampColumnEnabled,
    fadeTrail: props.fadeTrail ?? false
  });
  if (batch.model.device.type === 'webgl') {
    batch.model.setConstantAttributes({
      currentTime: temporalValues.subarray(0, 1),
      trailLength: temporalValues.subarray(1, 2),
      temporalEnabled: temporalValues.subarray(2, 3),
      fadeTrail: temporalValues.subarray(3, 4)
    });
  } else {
    batch.temporalBuffer?.write(temporalValues);
  }
}

function makeDeckPathTemporalValues({
  currentTime,
  trailLength,
  temporalEnabled,
  timestampColumnEnabled,
  fadeTrail
}: {
  currentTime: number;
  trailLength: number;
  temporalEnabled: boolean;
  timestampColumnEnabled: boolean;
  fadeTrail: boolean;
}): Float32Array {
  const temporalMode = timestampColumnEnabled ? 2 : temporalEnabled ? 1 : 0;
  return new Float32Array([currentTime, trailLength, temporalMode, fadeTrail ? 1 : 0]);
}

function resolveDeckPathModel(
  device: Device,
  model: ArrowPathLayerProps['model'] = 'auto'
): 'attribute' | 'storage' {
  if (model === 'storage' && device.type !== 'webgpu') {
    throw new Error('ArrowPathLayer storage rendering requires WebGPU');
  }
  if (model === 'auto') {
    return device.type === 'webgpu' ? 'storage' : 'attribute';
  }
  return model;
}

function packPathColor(color: ArrowPathColor): number {
  const [red, green, blue, alpha] = color.map(component =>
    Math.max(0, Math.min(255, Math.round(component)))
  );
  return (red | (green << 8) | (blue << 16) | (alpha << 24)) >>> 0;
}

function destroyBuffers(buffers: Buffer[]): void {
  for (const buffer of buffers) {
    buffer.destroy();
  }
}

function destroyPathBatches(batches: ArrowPathLayerBatch[]): void {
  for (const batch of batches) {
    batch.model.destroy();
    destroyBuffers(batch.constantBuffers);
    batch.convertedColorVector?.destroy();
    batch.prepared.destroy();
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}
