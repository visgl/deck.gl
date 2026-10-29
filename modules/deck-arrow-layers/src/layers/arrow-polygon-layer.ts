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
  ArrowPolygonRenderer,
  type ArrowColorType,
  type ArrowPolygonRendererDataBatchUpdate,
  type ArrowPolygonRendererProps
} from '@luma.gl/arrow';
import type {ShaderLayout} from '@luma.gl/core';
import type {Model} from '@luma.gl/engine';
import {
  deckArrowViewport,
  DECK_ARROW_ALPHA_BLEND_PARAMETERS,
  DECK_ARROW_WGSL_COLOR_UTILS,
  getViewportAspect,
  setDeckArrowViewport,
  watchDeckArrowModelPipeline
} from './arrow-layer-types';
import type {ArrowLayerPickingInfo} from './arrow-layer-types';
import {GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {type GPURecordBatchSourceInfo} from '@luma.gl/experimental/gpu-tables';
import {POLYGON_STORAGE_SHADER_LAYOUT} from '@luma.gl/experimental/models';
import {Vector} from 'apache-arrow';
import {
  assertArrowLayerColorGPUVector,
  convertArrowLayerColorVector,
  getArrowLayerInputNullValue,
  getArrowLayerInputSource,
  inspectArrowLayerColumn,
  isArrowLayerColor,
  isArrowLayerGPUVector,
  readArrowLayerGPUVector,
  type ArrowLayerInput
} from './arrow-layer-input';

type ArrowPolygonColor = [number, number, number, number];
type ArrowPolygonColorSource =
  | Exclude<ArrowPolygonRendererProps['colors'], null | undefined>
  | Vector<ArrowColorType>
  | GPUVector;
type ArrowPolygonResolvedColorSource = {
  value: Exclude<ArrowPolygonColorSource, GPUVector> | null;
};

/** Constant, Arrow column, or GPU column accepted by ArrowPolygonLayer.color. */
export type ArrowPolygonColorInput = ArrowLayerInput<ArrowPolygonColor, ArrowPolygonColorSource>;

const DEFAULT_POLYGON_COLOR: ArrowPolygonColor = [0, 96, 255, 255];

const DECK_POLYGON_RENDERER_VIEWPORT_WGSL = /* wgsl */ `
struct PolygonViewportUniforms {
  center: vec2<f32>,
  scale: f32,
  aspect: f32,
};

@group(0) @binding(auto) var<uniform> polygonViewport: PolygonViewportUniforms;
`;

const DECK_POLYGON_STORAGE_SHADER_LAYOUT = {
  attributes: POLYGON_STORAGE_SHADER_LAYOUT.attributes,
  bindings: [
    ...POLYGON_STORAGE_SHADER_LAYOUT.bindings,
    {name: 'polygonViewport', type: 'uniform', group: 0, location: 3}
  ]
} satisfies ShaderLayout;

const DECK_POLYGON_VS = `#version 300 es
precision highp float;
precision highp int;

in vec4 positions;
in vec4 colors;
in uint rowIndices;

uniform polygonViewportUniforms {
  vec2 center;
  float scale;
  float aspect;
} polygonViewport;

out vec4 vColor;

vec3 encodeDeckPickingColor(int objectIndex) {
  int colorIndex = objectIndex + 1;
  return vec3(
    float(colorIndex % 256),
    float((colorIndex / 256) % 256),
    float((colorIndex / 65536) % 256)
  );
}

void main(void) {
  gl_Position = project_position_to_clipspace(positions.xyz, vec3(0.0), vec3(0.0));
  geometry.position = gl_Position;
  geometry.pickingColor = encodeDeckPickingColor(int(rowIndices));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vColor = colors;
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;

const DECK_POLYGON_FS = `#version 300 es
precision highp float;

in vec4 vColor;
out vec4 fragColor;

void main(void) {
  fragColor = vColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

const DECK_POLYGON_WGSL = /* wgsl */ `
${DECK_ARROW_WGSL_COLOR_UTILS}
${DECK_POLYGON_RENDERER_VIEWPORT_WGSL}

struct PolygonVertexInputs {
  @location(0) positions: vec4<f32>,
  @location(1) colors: vec4<f32>,
  @location(2) rowIndices: u32,
};

struct PolygonVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

@vertex
fn vertexMain(inputs: PolygonVertexInputs) -> PolygonVertexOutputs {
  var outputs: PolygonVertexOutputs;
  outputs.position = deck_projectPosition(inputs.positions.xyz);
  outputs.color = inputs.colors;
  outputs.pickingColor = deck_encodePickingColor(inputs.rowIndices);
  return outputs;
}

@fragment
fn fragmentMain(inputs: PolygonVertexOutputs) -> @location(0) vec4<f32> {
  return deck_filterColor(inputs.color, inputs.pickingColor);
}
`;

const DECK_POLYGON_STORAGE_WGSL = /* wgsl */ `
${DECK_ARROW_WGSL_COLOR_UTILS}

@group(0) @binding(auto) var<storage, read> polygonPositions: array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> polygonColors: array<u32>;
@group(0) @binding(auto) var<storage, read> polygonRowIndices: array<u32>;
${DECK_POLYGON_RENDERER_VIEWPORT_WGSL}

struct PolygonStorageVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

fn unpackStoragePolygonColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> PolygonStorageVertexOutputs {
  var outputs: PolygonStorageVertexOutputs;
  outputs.position = deck_projectPosition(polygonPositions[vertexIndex].xyz);
  outputs.color = unpackStoragePolygonColor(polygonColors[gpuTable_getRowIndex(
    vertexIndex,
    gpuTableColumns.polygonColorsRowMultiplier
  )]);
  outputs.pickingColor = deck_encodePickingColor(polygonRowIndices[vertexIndex]);
  return outputs;
}

@fragment
fn fragmentMain(inputs: PolygonStorageVertexOutputs) -> @location(0) vec4<f32> {
  return deck_filterColor(inputs.color, inputs.pickingColor);
}
`;

/** Deck-facing props for an Arrow-backed filled polygon layer. */
export type ArrowPolygonLayerProps = Omit<LayerProps, 'data'> &
  Omit<ArrowPolygonRendererProps, 'colors' | 'color'> & {
    /** Deck-managed opacity multiplier. */
    opacity?: number;
    /** Constant color, color source, or color source with an explicit null replacement. */
    color?: ArrowPolygonColorInput;
  };

type ArrowPolygonLayerState = {
  renderer: ArrowPolygonRenderer | null;
  sourceInitialized: boolean;
  sourceInfos: GPURecordBatchSourceInfo[];
  colorResolveVersion: number;
};

/** deck.gl layer that keeps polygon columns in Arrow-owned GPU vectors. */
export class ArrowPolygonLayer extends Layer<ArrowPolygonLayerProps> {
  static override layerName = 'ArrowPolygonLayer';
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

  override initializeState({device}: LayerContext): void {
    const rendererProps = this.getRendererProps(this.props);
    const renderer = new ArrowPolygonRenderer(device, {
      ...rendererProps,
      data: null,
      polygons: undefined,
      colors: undefined
    });
    this.setState({
      renderer,
      sourceInitialized: false,
      sourceInfos: [],
      colorResolveVersion: 0
    } satisfies ArrowPolygonLayerState);
    this.watchRendererPipeline(renderer);
  }

  override updateState(params: UpdateParameters<this>): void {
    const renderer = this.getRenderer();
    const state = this.getLayerState();
    const {props, oldProps, changeFlags} = params;
    const sourceChanged =
      !state.sourceInitialized ||
      changeFlags.dataChanged ||
      props.polygons !== oldProps.polygons ||
      props.tessellated !== oldProps.tessellated ||
      props.color !== oldProps.color;
    const modelChanged = props.model !== oldProps.model;

    if (sourceChanged) {
      state.sourceInitialized = true;
      state.sourceInfos = [];
    }

    if (sourceChanged) {
      this.setRendererSourceProps(renderer, props);
    } else {
      renderer.setProps(
        modelChanged
          ? {...this.getRendererModelProps(props), center: props.center, scale: props.scale}
          : {
              model: props.model,
              center: props.center,
              scale: props.scale
            }
      );
    }
    this.watchRendererPipeline(renderer);
  }

  override getModels(): Model[] {
    const model = this.getRendererOrNull()?.model;
    return model ? [model] : [];
  }

  override draw({renderPass, context}: Parameters<Layer<ArrowPolygonLayerProps>['draw']>[0]): void {
    const renderer = this.getRenderer();
    const model = renderer.model;
    if (model?.device.type === 'webgpu') {
      setDeckArrowViewport(model, context.viewport);
    }
    renderer.draw(renderPass, {aspect: getViewportAspect(context.viewport)});
  }

  override getPickingInfo({info}: {info: PickingInfo}): ArrowLayerPickingInfo {
    return addArrowPickingInfo(info, this.getLayerState().sourceInfos);
  }

  override finalizeState(context: LayerContext): void {
    this.getRendererOrNull()?.destroy();
    this.setState({
      renderer: null,
      sourceInitialized: true,
      sourceInfos: [],
      colorResolveVersion: this.getLayerState().colorResolveVersion + 1
    } satisfies ArrowPolygonLayerState);
    super.finalizeState(context);
  }

  private getRendererProps(
    props: ArrowPolygonLayerProps,
    resolvedColorSource?: ArrowPolygonResolvedColorSource
  ): ArrowPolygonRendererProps {
    const colorSource = getArrowLayerInputSource(props.color, isArrowLayerColor);
    return {
      ...this.getRendererModelProps(props),
      data: props.data,
      polygons: props.polygons,
      colors: (resolvedColorSource?.value ??
        (resolvedColorSource
          ? null
          : isArrowLayerGPUVector(colorSource)
            ? null
            : (colorSource ?? null))) as ArrowPolygonRendererProps['colors'],
      tessellated: props.tessellated,
      color: getArrowLayerInputNullValue(props.color, DEFAULT_POLYGON_COLOR, isArrowLayerColor),
      center: props.center,
      scale: props.scale,
      onPick: props.onPick,
      onDataBatch: update => this.handleDataBatch(update, props.onDataBatch),
      onDataError: error => {
        if (props.onDataError) {
          props.onDataError(error);
        } else {
          this.raiseError(toError(error), `loading Arrow data in ${this}`);
        }
      }
    };
  }

  private setRendererSourceProps(
    renderer: ArrowPolygonRenderer,
    props: ArrowPolygonLayerProps
  ): void {
    const colorSource = getArrowLayerInputSource(props.color, isArrowLayerColor);
    const state = this.getLayerState();
    const colorResolveVersion = state.colorResolveVersion + 1;
    state.colorResolveVersion = colorResolveVersion;
    if (colorSource instanceof Vector) {
      renderer.setProps(this.getRendererProps(props, {value: null}));
      void convertArrowLayerColorVector(this.context.device, colorSource, `${this.id}-colors`)
        .then(colorVector => {
          if (
            this.getRendererOrNull() === renderer &&
            this.getLayerState().colorResolveVersion === colorResolveVersion
          ) {
            renderer.setProps(
              this.getRendererProps(props, {value: colorVector as Vector as never})
            );
            this.watchRendererPipeline(renderer);
            this.setNeedsRedraw();
          }
        })
        .catch(error => {
          if (this.getLayerState().colorResolveVersion === colorResolveVersion) {
            if (props.onDataError) props.onDataError(error);
            else this.raiseError(toError(error), `resolving Arrow polygon color in ${this}`);
          }
        });
      return;
    }
    if (!isArrowLayerGPUVector(colorSource)) {
      if (typeof colorSource === 'string') {
        if (!props.data) {
          this.warnMissingColorColumn(props, colorSource);
          renderer.setProps(this.getRendererProps(props, {value: null}));
          return;
        }
        renderer.setProps({data: null});
        void inspectArrowLayerColumn(props.data, colorSource)
          .then(resolution => {
            if (
              this.getRendererOrNull() !== renderer ||
              this.getLayerState().colorResolveVersion !== colorResolveVersion
            ) {
              void resolution.cancel();
              return;
            }
            if (!resolution.hasColumn) {
              this.warnMissingColorColumn(props, colorSource);
            }
            renderer.setProps(
              this.getRendererProps(
                {...props, data: resolution.data},
                {value: resolution.hasColumn ? colorSource : null}
              )
            );
            this.watchRendererPipeline(renderer);
            this.setNeedsRedraw();
          })
          .catch(error => {
            if (this.getLayerState().colorResolveVersion === colorResolveVersion) {
              if (props.onDataError) props.onDataError(error);
              else this.raiseError(toError(error), `resolving Arrow polygon color in ${this}`);
            }
          });
        return;
      }
      renderer.setProps(this.getRendererProps(props));
      return;
    }
    if (props.data) {
      const error = new Error(
        'ArrowPolygonLayer direct GPUVector color requires direct polygon vectors rather than streamed data'
      );
      if (props.onDataError) props.onDataError(error);
      else this.raiseError(error, `resolving Arrow polygon color in ${this}`);
      return;
    }
    const polygonRowCount =
      props.polygons && typeof props.polygons !== 'string' ? props.polygons.length : undefined;
    assertArrowLayerColorGPUVector('ArrowPolygonLayer color', colorSource, polygonRowCount);
    renderer.setProps({data: null});
    void readArrowLayerGPUVector(this.context.device, colorSource, `${this.id}-colors`, true)
      .then(colorVector => {
        if (
          this.getRendererOrNull() === renderer &&
          this.getLayerState().colorResolveVersion === colorResolveVersion
        ) {
          renderer.setProps(this.getRendererProps(props, {value: colorVector as Vector as never}));
          this.watchRendererPipeline(renderer);
          this.setNeedsRedraw();
        }
      })
      .catch(error => {
        if (this.getLayerState().colorResolveVersion === colorResolveVersion) {
          if (props.onDataError) props.onDataError(error);
          else this.raiseError(toError(error), `resolving Arrow polygon color in ${this}`);
        }
      });
  }

  private warnMissingColorColumn(props: ArrowPolygonLayerProps, columnPath: string): void {
    const nullValue = getArrowLayerInputNullValue(
      props.color,
      DEFAULT_POLYGON_COLOR,
      isArrowLayerColor
    );
    log.warn(
      `${this.id}: ArrowPolygonLayer color column "${columnPath}" is missing; using color default ${JSON.stringify(nullValue)}`
    )();
  }

  private getRendererModelProps(
    props: ArrowPolygonLayerProps
  ): Pick<ArrowPolygonRendererProps, 'model' | 'modelProps'> {
    if (props.model === 'storage' && this.context.device.type !== 'webgpu') {
      throw new Error('ArrowPolygonLayer storage rendering requires WebGPU');
    }
    const useStorageModel = props.model === 'storage';
    return {
      model: useStorageModel ? 'storage' : 'attribute',
      modelProps: this.getShaders(
        this.context.device.type === 'webgpu'
          ? useStorageModel
            ? {
                modules: [deckArrowViewport, picking],
                source: DECK_POLYGON_STORAGE_WGSL,
                shaderLayout: DECK_POLYGON_STORAGE_SHADER_LAYOUT
              }
            : {
                modules: [deckArrowViewport, picking],
                source: DECK_POLYGON_WGSL,
                vs: DECK_POLYGON_VS
              }
          : {modules: [project32, picking], vs: DECK_POLYGON_VS, fs: DECK_POLYGON_FS}
      )
    };
  }

  private handleDataBatch(
    update: ArrowPolygonRendererDataBatchUpdate,
    onDataBatch: ArrowPolygonRendererProps['onDataBatch']
  ): void {
    const sourceInfo = update.preparedBatch.sourceInfo;
    this.getLayerState().sourceInfos[sourceInfo.sourceBatchIndex] = sourceInfo;
    this.setNeedsRedraw();
    onDataBatch?.(update);
  }

  private watchRendererPipeline(renderer: ArrowPolygonRenderer): void {
    const model = renderer.model;
    if (!model) return;
    watchDeckArrowModelPipeline(
      model,
      () => {
        if (this.getRendererOrNull() === renderer && renderer.model === model) {
          this.setNeedsRedraw();
        }
      },
      error => {
        if (this.getRendererOrNull() === renderer && renderer.model === model) {
          if (this.props.onDataError) this.props.onDataError(error);
          else this.raiseError(error, `linking Arrow shaders in ${this}`);
        }
      }
    );
  }

  private getRenderer(): ArrowPolygonRenderer {
    const renderer = this.getRendererOrNull();
    if (!renderer) {
      throw new Error('ArrowPolygonLayer renderer is not initialized');
    }
    return renderer;
  }

  private getRendererOrNull(): ArrowPolygonRenderer | null {
    return (this.state as ArrowPolygonLayerState | undefined)?.renderer ?? null;
  }

  private getLayerState(): ArrowPolygonLayerState {
    return this.state as ArrowPolygonLayerState;
  }
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function addArrowPickingInfo(
  info: PickingInfo,
  sourceInfos: readonly GPURecordBatchSourceInfo[]
): ArrowLayerPickingInfo {
  const pickingInfo = info as ArrowLayerPickingInfo;
  const rowIndex = pickingInfo.index;
  const sourceInfo = sourceInfos.find(
    candidate =>
      rowIndex >= candidate.sourceRowIndexOffset &&
      rowIndex < candidate.sourceRowIndexOffset + candidate.sourceRowCount
  );
  if (sourceInfo) {
    pickingInfo.arrow = {
      rowIndex,
      batchIndex: sourceInfo.sourceBatchIndex,
      batchRowIndex: rowIndex - sourceInfo.sourceRowIndexOffset
    };
  }
  return pickingInfo;
}
