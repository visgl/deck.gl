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
  ArrowTextRenderer,
  type ArrowColorType,
  type ArrowTextRendererDataBatchUpdate,
  type ArrowTextRendererProps
} from '@luma.gl/arrow';
import {
  Buffer,
  type BufferLayout,
  type Device,
  type ShaderLayout,
  type TypedArray
} from '@luma.gl/core';
import {ShaderInputs, type Model} from '@luma.gl/engine';
import type {GPUTextData} from '@luma.gl/text';
import {
  makeTextGlyphAlphaGlsl,
  supportsGpuTextExpansion,
  type TextGlyphAlphaShaderSettings
} from '@luma.gl/text/experimental';
import {GPUVector} from '@luma.gl/gpgpu/gpu-data';
import {type GPURecordBatchSourceInfo} from '@luma.gl/experimental/gpu-tables';
import {Vector} from 'apache-arrow';
import {
  deckArrowViewport,
  DECK_ARROW_ALPHA_BLEND_PARAMETERS,
  DECK_ARROW_WGSL_COLOR_UTILS,
  setDeckArrowViewport,
  watchDeckArrowModelPipeline
} from './arrow-layer-types';
import type {ArrowLayerPickingInfo} from './arrow-layer-types';
import {
  DECK_TEXT_ROW_INDEXED_STORAGE_SHADER_LAYOUT,
  DECK_TEXT_ROW_INDEXED_STORAGE_WGSL,
  DECK_TEXT_STORAGE_SHADER_LAYOUT,
  DECK_TEXT_STORAGE_WGSL
} from './arrow-text-storage-shaders';
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

type ArrowTextColor = [number, number, number, number];
type ArrowTextColorSource =
  | Exclude<ArrowTextRendererProps['colors'], null | undefined>
  | Vector<ArrowColorType>
  | GPUVector;

/** Constant, Arrow column, or GPU column accepted by ArrowTextLayer.color. */
export type ArrowTextColorInput = ArrowLayerInput<ArrowTextColor, ArrowTextColorSource>;

const DEFAULT_TEXT_COLOR: ArrowTextColor = [199, 219, 245, 255];

const TEXT_VIEWPORT_FRAGMENT_SHADER_SETTINGS = {
  renderMode: {expression: 'textViewport.textFontRenderMode', kind: 'float'},
  sdfThreshold: 'textViewport.textSdfThreshold',
  sdfSmoothing: 'textViewport.textSdfSmoothing',
  msdfDistanceRange: 'textViewport.textMsdfDistanceRange'
} as const satisfies TextGlyphAlphaShaderSettings;

const DECK_TEXT_VS = `#version 300 es
precision highp float;
precision highp int;

in vec2 positions;
in ivec2 glyphOffsets;
in uvec4 glyphFrames;
in uint glyphPages;
in uint rowIndices;
in vec4 glyphClipRects;
in vec4 colors;
in float angles;
in float sizes;
in vec2 pixelOffsets;

layout(std140) uniform textViewportUniforms {
  vec2 cameraOffset;
  vec2 viewportScale;
  float glyphWorldScale;
  float time;
  float clippingEnabled;
  float colorsEnabled;
  float textFontRenderMode;
  float textSdfThreshold;
  float textSdfSmoothing;
  float textMsdfDistanceRange;
  vec2 contentCutoffPixels;
  vec2 contentAlign;
} textViewport;

uniform highp sampler2DArray fontAtlasTexture;
out vec2 vTextureCoordinate;
out vec4 vTextColor;
flat out uint vAtlasPage;

vec3 encodeDeckPickingColor(int objectIndex) {
  int colorIndex = objectIndex + 1;
  return vec3(
    float(colorIndex % 256),
    float((colorIndex / 256) % 256),
    float((colorIndex / 65536) % 256)
  );
}

vec2 getCorner(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, 0.0);
  if (vertexIndex == 1) return vec2(1.0, 0.0);
  if (vertexIndex == 2) return vec2(1.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, 0.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  return vec2(0.0, 1.0);
}

float getContentAlignmentOffset(float anchor, float extent, float start, float end, float mode) {
  if (end < start) return 0.0;
  if (mode == 1.0) return max(-(anchor + start), 0.0);
  if (mode == 2.0) {
    float visibleStart = max(0.0, anchor + start);
    float visibleEnd = min(extent, anchor + end);
    return visibleStart < visibleEnd ? (visibleStart + visibleEnd) * 0.5 - anchor : 0.0;
  }
  if (mode == 3.0) return min(extent - (anchor + end), 0.0);
  return 0.0;
}

void main() {
  vec2 corner = getCorner(gl_VertexID % 6);
  vec4 glyphFrame = vec4(glyphFrames);
  vec2 glyphOffset = vec2(glyphOffsets);
  vec2 glyphSize = glyphFrame.zw;
  vec2 glyphVertexOffset = glyphOffset + corner * glyphSize;
  float rowSize = sizes;
  float rowAngle = radians(angles);
  vec2 glyphPixelOffset = glyphVertexOffset * textViewport.glyphWorldScale * (rowSize / 32.0);
  mat2 rowRotation = mat2(cos(rowAngle), sin(rowAngle), -sin(rowAngle), cos(rowAngle));
  glyphPixelOffset = rowRotation * glyphPixelOffset + pixelOffsets;
  glyphPixelOffset.y *= -1.0;
  vec4 anchorPosition = project_position_to_clipspace(vec3(positions, 0.0), vec3(0.0), vec3(0.0));
  vec2 anchorScreen = vec2(
    anchorPosition.x / anchorPosition.w + 1.0,
    1.0 - anchorPosition.y / anchorPosition.w
  ) * 0.5 * project.viewportSize / project.devicePixelRatio;
  vec2 clipOrigin = project_size_to_pixel(glyphClipRects.xy);
  vec2 clipSize = project_size_to_pixel(glyphClipRects.zw);
  vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
  vec2 contentOffset = vec2(
    getContentAlignmentOffset(
      anchorScreen.x,
      viewportPixels.x,
      clipOrigin.x,
      clipOrigin.x + clipSize.x,
      textViewport.contentAlign.x
    ),
    -getContentAlignmentOffset(
      anchorScreen.y,
      viewportPixels.y,
      -clipOrigin.y - clipSize.y,
      -clipOrigin.y,
      textViewport.contentAlign.y
    )
  );
  glyphPixelOffset += contentOffset;
  vec4 clipPosition = anchorPosition;
  clipPosition.xy += project_pixel_size_to_clipspace(glyphPixelOffset) * clipPosition.w;
  vec2 atlasSize = vec2(textureSize(fontAtlasTexture, 0).xy);
  vec2 atlasPixel = glyphFrame.xy + corner * glyphSize;

  bool visible = true;
  if (textViewport.clippingEnabled > 0.5 && glyphClipRects.z >= 0.0) {
    visible = glyphPixelOffset.x >= clipOrigin.x &&
      glyphPixelOffset.x <= clipOrigin.x + clipSize.x;
    float visibleStart = max(anchorScreen.x + clipOrigin.x, 0.0);
    float visibleEnd = min(anchorScreen.x + clipOrigin.x + clipSize.x, viewportPixels.x);
    visible = visible && visibleEnd - visibleStart >= textViewport.contentCutoffPixels.x;
  }
  if (textViewport.clippingEnabled > 0.5 && glyphClipRects.w >= 0.0) {
    visible = visible && glyphPixelOffset.y >= clipOrigin.y &&
      glyphPixelOffset.y <= clipOrigin.y + clipSize.y;
    float visibleStart = max(anchorScreen.y - clipOrigin.y - clipSize.y, 0.0);
    float visibleEnd = min(anchorScreen.y - clipOrigin.y, viewportPixels.y);
    visible = visible && visibleEnd - visibleStart >= textViewport.contentCutoffPixels.y;
  }
  gl_Position = visible ? clipPosition : vec4(0.0);
  geometry.position = gl_Position;
  geometry.pickingColor = encodeDeckPickingColor(int(rowIndices));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vTextureCoordinate = atlasPixel / atlasSize;
  vAtlasPage = glyphPages;
  vTextColor = colors;
  DECKGL_FILTER_COLOR(vTextColor, geometry);
}
`;

const DECK_TEXT_FS = `#version 300 es
precision highp float;

layout(std140) uniform textViewportUniforms {
  vec2 cameraOffset;
  vec2 viewportScale;
  float glyphWorldScale;
  float time;
  float clippingEnabled;
  float colorsEnabled;
  float textFontRenderMode;
  float textSdfThreshold;
  float textSdfSmoothing;
  float textMsdfDistanceRange;
  vec2 contentCutoffPixels;
  vec2 contentAlign;
} textViewport;

uniform highp sampler2DArray fontAtlasTexture;

in vec2 vTextureCoordinate;
in vec4 vTextColor;
flat in uint vAtlasPage;
out vec4 fragColor;

${makeTextGlyphAlphaGlsl({
  functionName: 'getGlyphAlpha',
  textureCoordinate: 'vTextureCoordinate',
  atlasPage: 'vAtlasPage',
  settings: TEXT_VIEWPORT_FRAGMENT_SHADER_SETTINGS
})}

void main() {
  float glyphAlpha = getGlyphAlpha();
  fragColor = vec4(vTextColor.rgb, vTextColor.a * glyphAlpha);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;

const DECK_TEXT_WGSL = /* wgsl */ `
${DECK_ARROW_WGSL_COLOR_UTILS}

@group(0) @binding(auto) var fontAtlasTexture: texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler: sampler;

struct TextVertexInputs {
  @location(0) positions: vec2<f32>,
  @location(1) glyphOffsets: vec2<i32>,
  @location(2) glyphFrames: vec4<u32>,
  @location(3) glyphPages: u32,
  @location(4) rowIndices: u32,
  @location(5) glyphClipRects: vec4<f32>,
  @location(6) colors: vec4<f32>,
  @location(7) angles: f32,
  @location(8) sizes: f32,
  @location(9) pixelOffsets: vec2<f32>,
};

struct TextVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) textureCoordinate: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
  @location(3) @interpolate(flat) visible: f32,
  @location(4) @interpolate(flat) atlasPage: u32,
};

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

@vertex
fn vertexMain(inputs: TextVertexInputs, @builtin(vertex_index) vertexIndex: u32) -> TextVertexOutputs {
  var outputs: TextVertexOutputs;
  let corner = getCorner(vertexIndex % 6u);
  let glyphFrame = vec4<f32>(inputs.glyphFrames);
  let glyphOffset = vec2<f32>(inputs.glyphOffsets);
  let glyphSize = glyphFrame.zw;
  let glyphVertexOffset = glyphOffset + corner * glyphSize;
  let rowAngle = radians(inputs.angles);
  var glyphPixelOffset = glyphVertexOffset * 0.36 * (inputs.sizes / 32.0);
  let rowRotation = mat2x2<f32>(cos(rowAngle), sin(rowAngle), -sin(rowAngle), cos(rowAngle));
  glyphPixelOffset = rowRotation * glyphPixelOffset + inputs.pixelOffsets;
  glyphPixelOffset.y *= -1.0;
  let anchorPosition = deck_projectPosition(vec3<f32>(inputs.positions, 0.0));
  glyphPixelOffset += deck_getTextContentOffset(anchorPosition, inputs.glyphClipRects);
  var clipPosition = anchorPosition;
  clipPosition.x += glyphPixelOffset.x * deckArrowViewport.pixelToClipScale.x * clipPosition.w;
  clipPosition.y += glyphPixelOffset.y * deckArrowViewport.pixelToClipScale.y * clipPosition.w;
  let atlasSize = vec2<f32>(textureDimensions(fontAtlasTexture));
  let atlasPixel = glyphFrame.xy + corner * glyphSize;

  let visible = deck_isTextContentVisible(glyphPixelOffset, anchorPosition, inputs.glyphClipRects);
  outputs.position = select(vec4<f32>(0.0), clipPosition, visible);
  outputs.textureCoordinate = atlasPixel / atlasSize;
  outputs.color = inputs.colors;
  outputs.pickingColor = deck_encodePickingColor(inputs.rowIndices);
  outputs.visible = 1.0;
  outputs.atlasPage = inputs.glyphPages;
  return outputs;
}

@fragment
fn fragmentMain(inputs: TextVertexOutputs) -> @location(0) vec4<f32> {
  if (inputs.visible < 0.5) { discard; }
  let sampledAlpha = textureSample(
    fontAtlasTexture,
    fontAtlasTextureSampler,
    inputs.textureCoordinate,
    i32(inputs.atlasPage)
  ).a;
  let glyphAlpha = smoothstep(0.68, 0.82, sampledAlpha);
  if (picking.isActive > 0.5 && glyphAlpha <= 0.0) { discard; }
  return deck_filterColor(
    vec4<f32>(inputs.color.rgb, inputs.color.a * glyphAlpha),
    inputs.pickingColor
  );
}
`;

const DECK_TEXT_SHADER_LAYOUT: ShaderLayout = {
  attributes: [
    {name: 'positions', location: 0, type: 'vec2<f32>', stepMode: 'instance'},
    {name: 'glyphOffsets', location: 1, type: 'vec2<i32>', stepMode: 'instance'},
    {name: 'glyphFrames', location: 2, type: 'vec4<u32>', stepMode: 'instance'},
    {name: 'glyphPages', location: 3, type: 'u32', stepMode: 'instance'},
    {name: 'rowIndices', location: 4, type: 'u32', stepMode: 'instance'},
    {name: 'glyphClipRects', location: 5, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'colors', location: 6, type: 'vec4<f32>', stepMode: 'instance'},
    {name: 'angles', location: 7, type: 'f32', stepMode: 'instance'},
    {name: 'sizes', location: 8, type: 'f32', stepMode: 'instance'},
    {name: 'pixelOffsets', location: 9, type: 'vec2<f32>', stepMode: 'instance'}
  ],
  bindings: []
};

/** Deck-facing props for an Arrow-backed text layer. */
export type ArrowTextLayerProps = Omit<LayerProps, 'data'> &
  Omit<ArrowTextRendererProps, 'colors' | 'color'> & {
    /** Constant color, color source, or color source with an explicit null replacement. */
    color?: ArrowTextColorInput;
    /** Minimum visible clip rectangle in screen pixels before text is hidden. */
    contentCutoffPixels?: [number, number];
    /** Deck-style horizontal alignment within the visible portion of a clip rectangle. */
    contentAlignHorizontal?: 'none' | 'start' | 'center' | 'end';
    /** Deck-style vertical alignment within the visible portion of a clip rectangle. */
    contentAlignVertical?: 'none' | 'start' | 'center' | 'end';
  };

type ArrowTextLayerState = {
  renderer: ArrowTextRenderer | null;
  textData: GPUTextData[];
  constantBuffers: Buffer[];
  loadVersion: number;
  sourceInitialized: boolean;
  sourceInfos: GPURecordBatchSourceInfo[];
  gpuVectorSourceCache: Map<GPUVector, Promise<Vector>>;
};

/** deck.gl layer that keeps text columns in Arrow-owned GPU vectors. */
export class ArrowTextLayer extends Layer<ArrowTextLayerProps> {
  static override layerName = 'ArrowTextLayer';
  static override defaultProps = {
    data: {type: 'object', value: null, optional: true},
    parameters: DECK_ARROW_ALPHA_BLEND_PARAMETERS,
    contentCutoffPixels: {type: 'array', value: [0, 0]},
    contentAlignHorizontal: 'none',
    contentAlignVertical: 'none'
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
      renderer: null,
      textData: [],
      constantBuffers: [],
      loadVersion: 0,
      sourceInitialized: false,
      sourceInfos: [],
      gpuVectorSourceCache: new Map()
    } satisfies ArrowTextLayerState);
  }

  override updateState(params: UpdateParameters<this>): void {
    const {props, oldProps, changeFlags} = params;
    const state = this.getLayerState();
    const sourceChanged =
      !state.sourceInitialized ||
      changeFlags.dataChanged ||
      props.positions !== oldProps.positions ||
      props.texts !== oldProps.texts ||
      props.clipRects !== oldProps.clipRects ||
      props.angles !== oldProps.angles ||
      props.sizes !== oldProps.sizes ||
      props.pixelOffsets !== oldProps.pixelOffsets ||
      props.textAnchors !== oldProps.textAnchors ||
      props.alignmentBaselines !== oldProps.alignmentBaselines ||
      props.model !== oldProps.model ||
      props.color !== oldProps.color ||
      props.angle !== oldProps.angle ||
      props.size !== oldProps.size ||
      props.pixelOffset !== oldProps.pixelOffset ||
      props.textAnchor !== oldProps.textAnchor ||
      props.alignmentBaseline !== oldProps.alignmentBaseline;

    if (sourceChanged) {
      state.sourceInitialized = true;
      state.sourceInfos = [];
      void this.createRenderer(props);
      return;
    }

    const renderer = this.getRendererOrNull();
    if (renderer) {
      void renderer.setProps({
        model: props.model,
        fontAtlas: props.fontAtlas,
        angle: props.angle,
        size: props.size,
        pixelOffset: props.pixelOffset,
        textAnchor: props.textAnchor,
        alignmentBaseline: props.alignmentBaseline
      });
    }
  }

  override getModels(): Model[] {
    const model = this.getRendererOrNull()?.model;
    return model ? [model] : [];
  }

  override draw({renderPass, context}: Parameters<Layer<ArrowTextLayerProps>['draw']>[0]): void {
    const renderer = this.getRendererOrNull();
    if (!renderer) {
      return;
    }
    if (renderer.model.device.type === 'webgpu') {
      setDeckArrowViewport(renderer.model, context.viewport, {
        contentCutoffPixels: this.props.contentCutoffPixels,
        contentAlignHorizontal: this.props.contentAlignHorizontal,
        contentAlignVertical: this.props.contentAlignVertical
      });
    } else {
      renderer.shaderInputs.setProps({
        textViewport: {
          cameraOffset: [0, 0],
          viewportScale: [
            2 / Math.max(context.viewport.width, 1),
            2 / Math.max(context.viewport.height, 1)
          ],
          glyphWorldScale: 0.36,
          time: 0,
          clippingEnabled: this.props.clipRects === null ? 0 : 1,
          colorsEnabled: getArrowLayerInputSource(this.props.color, isArrowLayerColor) ? 1 : 0,
          contentCutoffPixels: this.props.contentCutoffPixels ?? [0, 0],
          contentAlign: [
            getContentAlignEnum(this.props.contentAlignHorizontal),
            getContentAlignEnum(this.props.contentAlignVertical)
          ]
        }
      } as never);
    }
    this.drawTextRenderer(renderer, renderPass);
  }

  /** Draw hook for WebGPU-only example layers that replace the normal instance draw. */
  protected drawTextRenderer(
    renderer: ArrowTextRenderer,
    renderPass: Parameters<Layer<ArrowTextLayerProps>['draw']>[0]['renderPass']
  ): void {
    renderer.draw(renderPass);
  }

  override getPickingInfo({info}: {info: PickingInfo}): ArrowLayerPickingInfo {
    const pickingInfo = info as ArrowLayerPickingInfo;
    const rowIndex = pickingInfo.index;
    const sourceInfo = this.getLayerState().sourceInfos.find(
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

  override finalizeState(context: LayerContext): void {
    const state = this.getLayerState();
    state.loadVersion++;
    state.renderer?.destroy();
    for (const data of state.textData) {
      data.destroy();
    }
    destroyBuffers(state.constantBuffers);
    this.setState({
      renderer: null,
      textData: [],
      constantBuffers: [],
      loadVersion: state.loadVersion,
      sourceInitialized: true,
      sourceInfos: [],
      gpuVectorSourceCache: new Map()
    } satisfies ArrowTextLayerState);
    super.finalizeState(context);
  }

  private async createRenderer(props: ArrowTextLayerProps): Promise<void> {
    const state = this.getLayerState();
    const loadVersion = state.loadVersion + 1;
    state.loadVersion = loadVersion;
    const model = resolveDeckTextModel(this.context.device, props.model);
    let constantStyle = createEmptyDeckTextConstantStyle();
    try {
      let effectiveProps = props;
      let colorSource = getArrowLayerInputSource(props.color, isArrowLayerColor);
      if (typeof colorSource === 'string') {
        if (props.data) {
          const resolution = await inspectArrowLayerColumn(props.data, colorSource);
          if (this.getLayerState().loadVersion !== loadVersion) {
            await resolution.cancel();
            return;
          }
          effectiveProps = {...props, data: resolution.data};
          if (!resolution.hasColumn) {
            this.warnMissingColorColumn(props, colorSource);
            colorSource = undefined;
          }
        } else {
          this.warnMissingColorColumn(props, colorSource);
          colorSource = undefined;
        }
      }
      if (colorSource instanceof Vector) {
        colorSource = (await convertArrowLayerColorVector(
          this.context.device,
          colorSource,
          `${this.id}-colors`
        )) as Vector<ArrowColorType>;
      }
      if (isArrowLayerGPUVector(colorSource)) {
        this.assertTextColorGPUVector(colorSource, effectiveProps);
      }
      const resolvedColorSource = await this.resolveTextColorSource(colorSource, effectiveProps);
      const colorNullValue = getArrowLayerInputNullValue(
        props.color,
        DEFAULT_TEXT_COLOR,
        isArrowLayerColor
      );
      constantStyle =
        model === 'attribute'
          ? createDeckTextConstantStyle(
              this.context.device,
              effectiveProps,
              Boolean(colorSource),
              colorNullValue
            )
          : createEmptyDeckTextConstantStyle();
      const rendererProps: ArrowTextRendererProps = {
        ...effectiveProps,
        colors: (resolvedColorSource ?? null) as ArrowTextRendererProps['colors'],
        color: colorNullValue,
        model,
        attributeShaderLayout: DECK_TEXT_SHADER_LAYOUT,
        storageShaderLayout:
          model === 'storage-row-indexed'
            ? DECK_TEXT_ROW_INDEXED_STORAGE_SHADER_LAYOUT
            : DECK_TEXT_STORAGE_SHADER_LAYOUT,
        modelProps: {
          ...effectiveProps.modelProps,
          ...this.getShaders(
            this.context.device.type === 'webgpu'
              ? {
                  shaderAssembler: this.context.shaderAssembler,
                  modules: [deckArrowViewport, picking],
                  source:
                    model === 'storage-row-indexed'
                      ? DECK_TEXT_ROW_INDEXED_STORAGE_WGSL
                      : model === 'storage'
                        ? DECK_TEXT_STORAGE_WGSL
                        : DECK_TEXT_WGSL
                }
              : {
                  shaderAssembler: this.context.shaderAssembler,
                  modules: [project32, picking],
                  vs: DECK_TEXT_VS,
                  fs: DECK_TEXT_FS
                }
          ),
          shaderInputs: this.context.device.type === 'webgpu' ? new ShaderInputs({}) : undefined,
          bufferLayout: [
            ...(effectiveProps.modelProps?.bufferLayout ?? []),
            ...constantStyle.bufferLayout
          ],
          attributes: {
            ...effectiveProps.modelProps?.attributes,
            ...constantStyle.attributes
          },
          constantAttributes: {
            ...effectiveProps.modelProps?.constantAttributes,
            ...constantStyle.constantAttributes
          }
        },
        onDataBatch: update => this.handleDataBatch(update, props.onDataBatch)
      };
      const renderer = await ArrowTextRenderer.create(this.context.device, rendererProps);
      let ownedTextData = [
        ...renderer.transferTextDataOwnership(({data, removed}) => {
          for (const previousData of removed) {
            previousData.destroy();
          }
          ownedTextData = [...data];
          const currentState = this.getLayerState();
          if (currentState.renderer === renderer) {
            currentState.textData = ownedTextData;
          }
        })
      ];
      if (this.getLayerState().loadVersion !== loadVersion) {
        renderer.destroy();
        for (const data of ownedTextData) {
          data.destroy();
        }
        destroyBuffers(constantStyle.buffers);
        return;
      }
      const previousRenderer = this.getRendererOrNull();
      const previousTextData = this.getLayerState().textData;
      const previousConstantBuffers = this.getLayerState().constantBuffers;
      this.setState({
        renderer,
        textData: ownedTextData,
        constantBuffers: constantStyle.buffers,
        loadVersion,
        sourceInitialized: true,
        sourceInfos: this.getLayerState().sourceInfos,
        gpuVectorSourceCache: this.getLayerState().gpuVectorSourceCache
      } satisfies ArrowTextLayerState);
      previousRenderer?.destroy();
      for (const data of previousTextData) {
        data.destroy();
      }
      destroyBuffers(previousConstantBuffers);
      this.setNeedsRedraw();
      this.watchRendererPipeline(renderer);
    } catch (error) {
      destroyBuffers(constantStyle.buffers);
      if (this.getLayerState().loadVersion === loadVersion) {
        if (props.onDataError) {
          props.onDataError(error);
        } else {
          this.raiseError(toError(error), `loading Arrow data in ${this}`);
        }
      }
    }
  }

  private async resolveTextColorSource(
    source: ArrowTextColorSource | undefined,
    props: ArrowTextLayerProps
  ): Promise<Exclude<ArrowTextColorSource, GPUVector> | undefined> {
    if (!isArrowLayerGPUVector(source)) {
      return source as Exclude<ArrowTextColorSource, GPUVector> | undefined;
    }
    this.assertTextColorGPUVector(source, props);
    const cache = this.getLayerState().gpuVectorSourceCache;
    let arrowVectorPromise = cache.get(source);
    if (!arrowVectorPromise) {
      arrowVectorPromise = readArrowLayerGPUVector(
        this.context.device,
        source,
        `${this.id}-colors`,
        true
      );
      cache.set(source, arrowVectorPromise);
    }
    return (await arrowVectorPromise) as Exclude<ArrowTextColorSource, GPUVector>;
  }

  private warnMissingColorColumn(props: ArrowTextLayerProps, columnPath: string): void {
    const nullValue = getArrowLayerInputNullValue(
      props.color,
      DEFAULT_TEXT_COLOR,
      isArrowLayerColor
    );
    log.warn(
      `${this.id}: ArrowTextLayer color column "${columnPath}" is missing; using color default ${JSON.stringify(nullValue)}`
    )();
  }

  private assertTextColorGPUVector(source: GPUVector, props: ArrowTextLayerProps): void {
    if (props.data) {
      throw new Error(
        'ArrowTextLayer direct GPUVector color requires direct text vectors rather than streamed data'
      );
    }
    const textRowCount =
      props.positions && typeof props.positions !== 'string' ? props.positions.length : undefined;
    assertArrowLayerColorGPUVector('ArrowTextLayer color', source, textRowCount);
  }

  private handleDataBatch(
    update: ArrowTextRendererDataBatchUpdate,
    onDataBatch: ArrowTextRendererProps['onDataBatch']
  ): void {
    let sourceRowIndexOffset = 0;
    this.getLayerState().sourceInfos = update.textInput.sourceVectors.positions.data.map(
      (data, sourceBatchIndex) => {
        const sourceInfo = {
          sourceBatchIndex,
          sourceRowIndexOffset,
          sourceRowCount: data.length
        };
        sourceRowIndexOffset += data.length;
        return sourceInfo;
      }
    );
    this.setNeedsRedraw();
    const renderer = this.getRendererOrNull();
    if (renderer) this.watchRendererPipeline(renderer);
    onDataBatch?.(update);
  }

  protected getRendererOrNull(): ArrowTextRenderer | null {
    return (this.state as ArrowTextLayerState | undefined)?.renderer ?? null;
  }

  private watchRendererPipeline(renderer: ArrowTextRenderer): void {
    const model = renderer.model;
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

  private getLayerState(): ArrowTextLayerState {
    return this.state as ArrowTextLayerState;
  }
}

function resolveDeckTextModel(
  device: Device,
  model: ArrowTextLayerProps['model'] = 'auto'
): 'attribute' | 'storage' | 'storage-row-indexed' {
  if ((model === 'storage' || model === 'storage-row-indexed') && device.type !== 'webgpu') {
    throw new Error('ArrowTextLayer storage rendering requires WebGPU');
  }
  const storageSupported = supportsGpuTextExpansion(device);
  if (model === 'auto') {
    return storageSupported ? 'storage' : 'attribute';
  }
  if (model !== 'attribute' && model !== 'storage' && model !== 'storage-row-indexed') {
    throw new Error(`ArrowTextLayer does not support the ${model} model`);
  }
  return (model === 'storage' || model === 'storage-row-indexed') && !storageSupported
    ? 'attribute'
    : model;
}

function toError(error: unknown): Error {
  return error instanceof Error ? error : new Error(String(error));
}

function getContentAlignEnum(value: 'none' | 'start' | 'center' | 'end' | undefined): number {
  switch (value) {
    case 'start':
      return 1;
    case 'center':
      return 2;
    case 'end':
      return 3;
    default:
      return 0;
  }
}

type DeckTextConstantStyle = {
  bufferLayout: BufferLayout[];
  attributes: Record<string, Buffer>;
  constantAttributes: Record<string, TypedArray>;
  buffers: Buffer[];
};

function createEmptyDeckTextConstantStyle(): DeckTextConstantStyle {
  return {bufferLayout: [], attributes: {}, constantAttributes: {}, buffers: []};
}

function createDeckTextConstantStyle(
  device: Device,
  props: ArrowTextLayerProps,
  hasColorSource: boolean,
  colorNullValue: ArrowTextColor
): DeckTextConstantStyle {
  const style: DeckTextConstantStyle = {
    bufferLayout: [],
    attributes: {},
    constantAttributes: {},
    buffers: []
  };
  const id = props.id ?? 'arrow-text';

  if (props.clipRects === undefined || props.clipRects === null) {
    addDeckTextConstantAttribute(
      device,
      style,
      `${id}-constant-clip-rect`,
      'glyphClipRects',
      {
        name: 'constantTextClipRect',
        byteStride: 0,
        stepMode: 'instance',
        attributes: [{attribute: 'glyphClipRects', format: 'float32x4', byteOffset: 0}]
      },
      new Float32Array([0, 0, -1, -1])
    );
  }
  if (!hasColorSource) {
    addDeckTextConstantAttribute(
      device,
      style,
      `${id}-constant-color`,
      'colors',
      {
        name: 'constantTextColor',
        byteStride: 0,
        stepMode: 'instance',
        attributes: [{attribute: 'colors', format: 'float32x4', byteOffset: 0}]
      },
      new Float32Array(colorNullValue.map(component => component / 255))
    );
  }
  if (props.angles === undefined || props.angles === null) {
    addDeckTextConstantAttribute(
      device,
      style,
      `${id}-constant-angle`,
      'angles',
      {
        name: 'constantTextAngle',
        byteStride: 0,
        stepMode: 'instance',
        attributes: [{attribute: 'angles', format: 'float32', byteOffset: 0}]
      },
      new Float32Array([props.angle ?? 0])
    );
  }
  if (props.sizes === undefined || props.sizes === null) {
    addDeckTextConstantAttribute(
      device,
      style,
      `${id}-constant-size`,
      'sizes',
      {
        name: 'constantTextSize',
        byteStride: 0,
        stepMode: 'instance',
        attributes: [{attribute: 'sizes', format: 'float32', byteOffset: 0}]
      },
      new Float32Array([props.size ?? 32])
    );
  }
  if (props.pixelOffsets === undefined || props.pixelOffsets === null) {
    addDeckTextConstantAttribute(
      device,
      style,
      `${id}-constant-pixel-offset`,
      'pixelOffsets',
      {
        name: 'constantTextPixelOffset',
        byteStride: 0,
        stepMode: 'instance',
        attributes: [{attribute: 'pixelOffsets', format: 'float32x2', byteOffset: 0}]
      },
      new Float32Array([0, 0])
    );
  }
  return style;
}

function addDeckTextConstantAttribute(
  device: Device,
  style: DeckTextConstantStyle,
  id: string,
  attributeName: string,
  bufferLayout: BufferLayout,
  value: TypedArray
): void {
  style.bufferLayout.push(bufferLayout);
  if (device.type === 'webgl') {
    style.constantAttributes[attributeName] = value;
  } else {
    const buffer = device.createBuffer({id, data: value});
    style.attributes[bufferLayout.name] = buffer;
    style.buffers.push(buffer);
  }
}

function destroyBuffers(buffers: Buffer[]): void {
  for (const buffer of buffers) {
    buffer.destroy();
  }
}
