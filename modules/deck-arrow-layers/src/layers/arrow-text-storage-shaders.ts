// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ShaderLayout} from '@luma.gl/core';
import {DECK_ARROW_WGSL_COLOR_UTILS} from './arrow-layer-types';

/** Generated glyph attributes plus row data retained in storage buffers. */
export const DECK_TEXT_STORAGE_SHADER_LAYOUT = {
  attributes: [
    {name: 'glyphOffsets', location: 0, type: 'vec2<i32>', stepMode: 'instance'},
    {name: 'glyphIndices', location: 1, type: 'vec2<u32>', stepMode: 'instance'}
  ],
  bindings: []
} satisfies ShaderLayout;

/** Row-indexed variant used when each compact glyph record carries its original source row. */
export const DECK_TEXT_ROW_INDEXED_STORAGE_SHADER_LAYOUT = {
  attributes: [
    ...DECK_TEXT_STORAGE_SHADER_LAYOUT.attributes,
    {name: 'glyphRowIndices', location: 2, type: 'u32', stepMode: 'instance'}
  ],
  bindings: []
} satisfies ShaderLayout;

/** Deck-projected shader for the luma.gl storage text model. */
export const DECK_TEXT_STORAGE_WGSL = /* wgsl */ `
${DECK_ARROW_WGSL_COLOR_UTILS}

@group(0) @binding(auto) var fontAtlasTexture: texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler: sampler;
@group(0) @binding(auto) var<storage, read> textRowPositions: array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowColors: array<u32>;
@group(0) @binding(auto) var<storage, read> textRowAngles: array<f32>;
@group(0) @binding(auto) var<storage, read> textRowSizes: array<f32>;
@group(0) @binding(auto) var<storage, read> textRowPixelOffsets: array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowClipRects: array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> textRowGlyphStarts: array<u32>;
@group(0) @binding(auto) var<storage, read> textGlyphFrames: array<vec4<f32>>;

struct TextStorageStyleConfig {
  constantColor: vec4<f32>,
  constantAngleDegrees: f32,
  constantSize: f32,
  constantPixelOffset: vec2<f32>,
  useRowColors: u32,
  useRowAngles: u32,
  useRowSizes: u32,
  useRowPixelOffsets: u32,
  hasClipRects: u32,
  batchRowIndexBase: u32,
  rowStorageIndexBase: u32,
  _padding: u32,
};

@group(0) @binding(auto) var<uniform> textStorageStyleConfig: TextStorageStyleConfig;

struct TextStorageRenderConfig {
  glyphIndexBase: u32,
  rowStart: u32,
  rowEnd: u32,
  _padding: u32,
};

@group(0) @binding(auto) var<uniform> textStorageRenderConfig: TextStorageRenderConfig;

struct TextStorageVertexInputs {
  @location(0) glyphOffsets: vec2<i32>,
  @location(1) glyphIndices: vec2<u32>,
};

struct TextStorageVertexOutputs {
  @builtin(position) position: vec4<f32>,
  @location(0) textureCoordinate: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
  @location(3) @interpolate(flat) visible: f32,
  @location(4) @interpolate(flat) atlasPage: u32,
};

fn getStorageTextCorner(vertexIndex: u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

fn unpackStorageTextColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 255u),
    f32((colorWord >> 8u) & 255u),
    f32((colorWord >> 16u) & 255u),
    f32((colorWord >> 24u) & 255u)
  ) / 255.0;
}

fn rotateStorageTextOffset(offset: vec2<f32>, angleDegrees: f32) -> vec2<f32> {
  if (angleDegrees == 0.0) { return offset; }
  let angleRadians = radians(angleDegrees);
  return mat2x2<f32>(
    cos(angleRadians),
    sin(angleRadians),
    -sin(angleRadians),
    cos(angleRadians)
  ) * offset;
}

fn findStorageTextRowIndex(glyphIndex: u32) -> u32 {
  var low = textStorageRenderConfig.rowStart;
  var high = textStorageRenderConfig.rowEnd;
  loop {
    if (low >= high) { break; }
    let middle = (low + high) / 2u;
    if (textRowGlyphStarts[middle + 1u] <= glyphIndex) {
      low = middle + 1u;
    } else {
      high = middle;
    }
  }
  return low;
}

@vertex
fn vertexMain(
  inputs: TextStorageVertexInputs,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> TextStorageVertexOutputs {
  let corner = getStorageTextCorner(vertexIndex % 6u);
  let glyphFrame = textGlyphFrames[inputs.glyphIndices.x];
  let glyphOffset = vec2<f32>(inputs.glyphOffsets);
  let glyphVertexOffset = glyphOffset + corner * glyphFrame.zw;
  let glyphIndex = textStorageRenderConfig.glyphIndexBase + instanceIndex;
  let rowIndex = findStorageTextRowIndex(glyphIndex);
  let rowStorageIndex = rowIndex + textStorageStyleConfig.rowStorageIndexBase;

  var angleDegrees = textStorageStyleConfig.constantAngleDegrees;
  if (textStorageStyleConfig.useRowAngles != 0u) {
    angleDegrees = textRowAngles[rowStorageIndex];
  }
  var textSize = textStorageStyleConfig.constantSize;
  if (textStorageStyleConfig.useRowSizes != 0u) {
    textSize = textRowSizes[rowStorageIndex];
  }
  var pixelOffset = textStorageStyleConfig.constantPixelOffset;
  if (textStorageStyleConfig.useRowPixelOffsets != 0u) {
    pixelOffset = textRowPixelOffsets[rowStorageIndex];
  }
  var glyphPixelOffset =
    rotateStorageTextOffset(glyphVertexOffset * (textSize / 32.0), angleDegrees) * 0.36 +
    pixelOffset;
  glyphPixelOffset.y *= -1.0;
  let anchorPosition = deck_projectPosition(vec3<f32>(textRowPositions[rowStorageIndex], 0.0));
  let clipRect = textRowClipRects[rowStorageIndex];
  glyphPixelOffset += deck_getTextContentOffset(anchorPosition, clipRect);
  var clipPosition = anchorPosition;
  clipPosition.x += glyphPixelOffset.x * deckArrowViewport.pixelToClipScale.x * clipPosition.w;
  clipPosition.y += glyphPixelOffset.y * deckArrowViewport.pixelToClipScale.y * clipPosition.w;

  var visible = true;
  if (textStorageStyleConfig.hasClipRects != 0u) {
    visible = deck_isTextContentVisible(glyphPixelOffset, anchorPosition, clipRect);
  }
  let atlasPixel = glyphFrame.xy + corner * glyphFrame.zw;

  var outputs: TextStorageVertexOutputs;
  outputs.position = select(vec4<f32>(0.0), clipPosition, visible);
  outputs.textureCoordinate = atlasPixel / vec2<f32>(textureDimensions(fontAtlasTexture));
  outputs.color = textStorageStyleConfig.constantColor;
  if (textStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackStorageTextColor(textRowColors[rowStorageIndex]);
  }
  outputs.pickingColor = deck_encodePickingColor(
    textStorageStyleConfig.batchRowIndexBase + rowIndex
  );
  outputs.visible = 1.0;
  outputs.atlasPage = inputs.glyphIndices.y;
  return outputs;
}

@fragment
fn fragmentMain(inputs: TextStorageVertexOutputs) -> @location(0) vec4<f32> {
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

/** Deck storage shader that reads the source row directly from each generated glyph record. */
export const DECK_TEXT_ROW_INDEXED_STORAGE_WGSL = DECK_TEXT_STORAGE_WGSL.replace(
  '@location(1) glyphIndices: vec2<u32>,',
  `@location(1) glyphIndices: vec2<u32>,
  @location(2) glyphRowIndices: u32,`
).replace(
  'let rowIndex = findStorageTextRowIndex(glyphIndex);',
  'let rowIndex = inputs.glyphRowIndices;'
);
