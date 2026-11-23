import{g as Yt,a as Xt,M as Cn,B as p,D as ve,S as An,ah as Wt,ad as Xr,ai as Wr,G as Hr,L as qr,p as Ht,e as jr}from"./deck-example-device-ky_fVdIe.js";import{v as Kr,G as Zr,m as N,h as Tt,f as qt,b as Jr,T as jt,g as Qr,a as eo,l as lt,U as Kt,F as bt,I as to,L as no,r as ro,M as oo,x as vn,D as ao,s as io,n as Zt,C as Pe,O as so,u as lo,p as Jt,o as Qt,y as co,A as uo,q as fo,z as go}from"./arrow-example-panels-InrATAMa.js";import{V as Q,j as ho,k as xe,a as Bn,D as P,f as Y,F as D,U as Ue,m as xo,T as F,e as Re,l as Qe,n as Oe,S as En,g as po,d as yo}from"./recordbatch-CfjHIgaF.js";import{p as wo}from"./project32-CyH41feE.js";import{d as mo,m as So,e as Ro}from"./arrow-picking-D4uSoi4I.js";import{D as Pn}from"./dynamic-texture-D5kAP1O5.js";import{p as Ie,m as oe,a as It,b as To}from"./arrow-shader-layout-BhEFrrKf.js";import{C as On}from"./computation-UEoMX-xD.js";import{u as Ct}from"./Arrow-B5ol7HNO.js";class bo{needsRedrawReason=!1;drawBatches(...t){this.draw(...t)}needsRedraw(){const t=this.needsRedrawReason;return this.needsRedrawReason=!1,t}setNeedsRedraw(t){this.needsRedrawReason||=t}}function Ye({functionName:e="getTextGlyphAlpha",fontAtlasTexture:t="fontAtlasTexture",textureCoordinate:n,atlasPage:r,settings:o}){const a=Gn(e);return`float ${a}(vec3 value) {
  return max(min(value.r, value.g), min(max(value.r, value.g), value.b));
}

float ${e}() {
  vec4 sampledColor = texture(${t}, vec3(${n}, float(${r})));
  if (${o.renderMode.expression} > 1.5) {
    vec2 atlasSize = vec2(textureSize(${t}, 0).xy);
    vec2 unitRange = vec2(${o.msdfDistanceRange}) / atlasSize;
    vec2 screenTexSize = 1.0 / fwidth(${n});
    float screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
    return clamp(screenPxRange * (${a}(sampledColor.rgb) - 0.5) + 0.5, 0.0, 1.0);
  }
  float sampledAlpha = sampledColor.a;
  if (${o.renderMode.expression} < 0.5) {
    return sampledAlpha;
  }
  return ${o.sdfSmoothing} > 0.0
    ? smoothstep(
        ${o.sdfThreshold} - ${o.sdfSmoothing},
        ${o.sdfThreshold} + ${o.sdfSmoothing},
        sampledAlpha
      )
    : step(${o.sdfThreshold}, sampledAlpha);
}
`}function Be({functionName:e="getTextGlyphAlpha",fontAtlasTexture:t="fontAtlasTexture",fontAtlasTextureSampler:n="fontAtlasTextureSampler",textureCoordinate:r,atlasPage:o,settings:a}){const i=Gn(e),s=a.renderMode.kind==="uint"?`${a.renderMode.expression} == 2u`:`${a.renderMode.expression} > 1.5`,l=a.renderMode.kind==="uint"?`${a.renderMode.expression} == 0u`:`${a.renderMode.expression} < 0.5`;return`fn ${i}(value: vec3<f32>) -> f32 {
  return max(min(value.r, value.g), min(max(value.r, value.g), value.b));
}

fn ${e}(inputs : FragmentInputs) -> f32 {
  let sampledColor = textureSample(
    ${t},
    ${n},
    ${r},
    i32(${o})
  );
  if (${s}) {
    let unitRange = vec2<f32>(${a.msdfDistanceRange}) /
      vec2<f32>(textureDimensions(${t}));
    let screenTexSize = vec2<f32>(1.0) / fwidth(${r});
    let screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
    return clamp(screenPxRange * (${i}(sampledColor.rgb) - 0.5) + 0.5, 0.0, 1.0);
  }
  let sampledAlpha = sampledColor.a;
  if (${l}) {
    return sampledAlpha;
  }
  if (${a.sdfSmoothing} > 0.0) {
    return smoothstep(
      ${a.sdfThreshold} - ${a.sdfSmoothing},
      ${a.sdfThreshold} + ${a.sdfSmoothing},
      sampledAlpha
    );
  }
  return select(0.0, 1.0, sampledAlpha >= ${a.sdfThreshold});
}
`}function Gn(e){return e==="getTextGlyphAlpha"?"getMedian":`${e}Median`}const Io={renderMode:{expression:"textFontRenderMode",kind:"float"},sdfThreshold:"textSdfThreshold",sdfSmoothing:"textSdfSmoothing",msdfDistanceRange:"textMsdfDistanceRange"},Dn={renderMode:{expression:"textStorageStyleConfig.fontRenderMode",kind:"uint"},sdfThreshold:"textStorageStyleConfig.sdfThreshold",sdfSmoothing:"textStorageStyleConfig.sdfSmoothing",msdfDistanceRange:"textStorageStyleConfig.msdfDistanceRange"},At="glyphOffsets",Co="glyphFrames",Ao="glyphPages",_n="glyphIndices",Mn="glyphRowIndices",vo="glyphClipRects",en="expandedGlyphVertexData",se="compactGlyphVertexData",Bo=Uint32Array.BYTES_PER_ELEMENT*2,vt=Uint32Array.BYTES_PER_ELEMENT*3,Eo=4294967295,Vn={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:At,location:1,type:"vec2<i32>",stepMode:"instance"},{name:Co,location:2,type:"vec4<u32>",stepMode:"instance"},{name:Ao,location:3,type:"u32",stepMode:"instance"}],bindings:[]},Po={attributes:[...Vn.attributes,{name:vo,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},Ln={attributes:[{name:At,location:0,type:"vec2<i32>",stepMode:"instance"},{name:_n,location:1,type:"vec2<u32>",stepMode:"instance"}],bindings:[]},Oo={attributes:[...Ln.attributes,{name:Mn,location:2,type:"u32",stepMode:"instance"}],bindings:[]},Go={attributes:[],bindings:[]},Do=`#version 300 es
precision highp float;

in vec2 positions;
in ivec2 glyphOffsets;
in uvec4 glyphFrames;
in uint glyphPages;

out vec2 vTextureCoordinate;
flat out uint vAtlasPage;

uniform highp sampler2DArray fontAtlasTexture;

vec2 getCorner(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, 0.0);
  if (vertexIndex == 1) return vec2(1.0, 0.0);
  if (vertexIndex == 2) return vec2(1.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, 0.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  return vec2(0.0, 1.0);
}

void main() {
  vec2 corner = getCorner(gl_VertexID % 6);
  vec2 atlasSize = vec2(textureSize(fontAtlasTexture, 0).xy);
  vec4 glyphFrame = vec4(glyphFrames);
  vec2 glyphOffset = vec2(glyphOffsets);
  vec2 glyphSize = glyphFrame.zw;
  vec2 glyphPosition = positions + (glyphOffset + corner * glyphSize) * 0.001;
  gl_Position = vec4(glyphPosition, 0.0, 1.0);
  vTextureCoordinate = (glyphFrame.xy + corner * glyphSize) / atlasSize;
  vAtlasPage = glyphPages;
}
`,_o=`#version 300 es
precision highp float;

in vec2 positions;
in ivec2 glyphOffsets;
in uvec4 glyphFrames;
in uint glyphPages;
in vec4 glyphClipRects;

out vec2 vTextureCoordinate;
flat out uint vAtlasPage;

uniform highp sampler2DArray fontAtlasTexture;

vec2 getCorner(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, 0.0);
  if (vertexIndex == 1) return vec2(1.0, 0.0);
  if (vertexIndex == 2) return vec2(1.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, 0.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  return vec2(0.0, 1.0);
}

bool isGlyphVertexClipped(vec2 glyphVertexOffset, vec4 clipRect) {
  if (clipRect.z >= 0) {
    float clipMinX = clipRect.x;
    float clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    float clipMinY = clipRect.y;
    float clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

void main() {
  vec2 corner = getCorner(gl_VertexID % 6);
  vec2 atlasSize = vec2(textureSize(fontAtlasTexture, 0).xy);
  vec4 glyphFrame = vec4(glyphFrames);
  vec2 glyphOffset = vec2(glyphOffsets);
  vec2 glyphSize = glyphFrame.zw;
  vec2 glyphVertexOffset = glyphOffset + corner * glyphSize;
  vec2 glyphPosition = positions + glyphVertexOffset * 0.001;
  gl_Position = isGlyphVertexClipped(glyphVertexOffset, glyphClipRects)
    ? vec4(0.0)
    : vec4(glyphPosition, 0.0, 1.0);
  vTextureCoordinate = (glyphFrame.xy + corner * glyphSize) / atlasSize;
  vAtlasPage = glyphPages;
}
`,Mo=`#version 300 es
precision highp float;

uniform highp sampler2DArray fontAtlasTexture;
uniform float textFontRenderMode;
uniform float textSdfThreshold;
uniform float textSdfSmoothing;
uniform float textMsdfDistanceRange;
in vec2 vTextureCoordinate;
flat in uint vAtlasPage;
out vec4 fragColor;

${Ye({textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:Io})}

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, getTextGlyphAlpha());
}
`,Un=`
@group(0) @binding(auto) var fontAtlasTexture : texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler : sampler;
@group(0) @binding(auto) var<storage, read> textRowPositions : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowColors : array<u32>;
@group(0) @binding(auto) var<storage, read> textRowAngles : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowSizes : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowPixelOffsets : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowClipRects : array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> textRowGlyphStarts : array<u32>;
@group(0) @binding(auto) var<storage, read> textGlyphFrames : array<vec4<f32>>;

struct TextStorageStyleConfig {
  constantColor : vec4<f32>,
  constantAngleDegrees : f32,
  constantSize : f32,
  constantPixelOffset : vec2<f32>,
  useRowColors : u32,
  useRowAngles : u32,
  useRowSizes : u32,
  useRowPixelOffsets : u32,
  hasClipRects : u32,
  batchRowIndexBase : u32,
  rowStorageIndexBase : u32,
  _padding0 : u32,
  sdfThreshold : f32,
  sdfSmoothing : f32,
  fontRenderMode : u32,
  msdfDistanceRange : f32,
};

@group(0) @binding(auto) var<uniform> textStorageStyleConfig : TextStorageStyleConfig;

struct TextStorageRenderConfig {
  glyphIndexBase : u32,
  rowStart : u32,
  rowEnd : u32,
  _padding : u32,
};

@group(0) @binding(auto) var<uniform> textStorageRenderConfig : TextStorageRenderConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex : u32,
  @location(0) glyphOffsets : vec2<i32>,
  @location(1) glyphIndices : vec2<u32>,
};

struct FragmentInputs {
  @builtin(position) position : vec4<f32>,
  @location(0) atlasUV : vec2<f32>,
  @location(1) color : vec4<f32>,
  @location(2) @interpolate(flat) atlasPage : u32,
};

fn getGlyphCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 1.0)
  );
  return corners[vertexIndex % 6u];
}

fn unpackLowInt16(word: u32) -> i32 {
  return i32(word << 16u) >> 16;
}

fn unpackHighInt16(word: u32) -> i32 {
  return i32(word) >> 16;
}

fn unpackClipRect(words: vec4<f32>) -> vec4<f32> {
  return words;
}

fn isGlyphVertexClipped(glyphVertexOffset: vec2<f32>, clipRect: vec4<f32>) -> bool {
  if (clipRect.z >= 0) {
    let clipMinX = clipRect.x;
    let clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    let clipMinY = clipRect.y;
    let clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

fn unpackTextColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn rotateTextOffset(offset: vec2<f32>, angleDegrees: f32) -> vec2<f32> {
  if (angleDegrees == 0.0) {
    return offset;
  }
  let angleRadians = angleDegrees * 0.017453292519943295;
  let rotation = mat2x2<f32>(
    cos(angleRadians),
    sin(angleRadians),
    -sin(angleRadians),
    cos(angleRadians)
  );
  return rotation * offset;
}

fn findRowIndex(glyphIndex : u32) -> u32 {
  var low = textStorageRenderConfig.rowStart;
  var high = textStorageRenderConfig.rowEnd;
  loop {
    if (low >= high) {
      break;
    }
    let middle = (low + high) / 2u;
    let nextRowGlyphStart = textRowGlyphStarts[middle + 1u];
    if (nextRowGlyphStart <= glyphIndex) {
      low = middle + 1u;
    } else {
      high = middle;
    }
  }
  return low;
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  let corner = getGlyphCorner(inputs.vertexIndex);
  let glyphFrame = textGlyphFrames[inputs.glyphIndices.x];
  let glyphOffset = vec2<f32>(inputs.glyphOffsets);
  let glyphSize = glyphFrame.zw;
  let glyphVertexOffset = glyphOffset + corner * glyphSize;
  let glyphIndex = textStorageRenderConfig.glyphIndexBase + inputs.instanceIndex;
  let rowIndex = findRowIndex(glyphIndex);
  let rowStorageIndex = rowIndex + textStorageStyleConfig.rowStorageIndexBase;
  var angleDegrees = textStorageStyleConfig.constantAngleDegrees;
  if (textStorageStyleConfig.useRowAngles != 0u) {
    angleDegrees = textRowAngles[rowStorageIndex];
  }
  var textSize = textStorageStyleConfig.constantSize;
  if (textStorageStyleConfig.useRowSizes != 0u) {
    textSize = textRowSizes[rowStorageIndex];
  }
  let textScale = textSize / 32.0;
  let styledGlyphVertexOffset = rotateTextOffset(glyphVertexOffset * textScale, angleDegrees);
  var pixelOffset = textStorageStyleConfig.constantPixelOffset;
  if (textStorageStyleConfig.useRowPixelOffsets != 0u) {
    pixelOffset = textRowPixelOffsets[rowStorageIndex];
  }
  let glyphPosition =
    textRowPositions[rowStorageIndex] + (styledGlyphVertexOffset + pixelOffset) * 0.001;
  var isClipped = false;
  if (textStorageStyleConfig.hasClipRects != 0u) {
    let clipRect = unpackClipRect(textRowClipRects[rowIndex]);
    isClipped = isGlyphVertexClipped(glyphVertexOffset, clipRect);
  }
  var outputs : FragmentInputs;
  outputs.position = select(
    vec4<f32>(glyphPosition, 0.0, 1.0),
    vec4<f32>(0.0),
    isClipped
  );
  outputs.atlasUV = (glyphFrame.xy + corner * glyphSize) / vec2<f32>(textureDimensions(fontAtlasTexture));
  outputs.atlasPage = inputs.glyphIndices.y;
  outputs.color = textStorageStyleConfig.constantColor;
  if (textStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackTextColor(textRowColors[rowStorageIndex]);
  }
  return outputs;
}

${Be({textureCoordinate:"inputs.atlasUV",atlasPage:"inputs.atlasPage",settings:Dn})}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  return vec4<f32>(inputs.color.rgb, inputs.color.a * getTextGlyphAlpha(inputs));
}
`,Vo=Un.replace("@location(1) glyphIndices : vec2<u32>,",`@location(1) glyphIndices : vec2<u32>,
  @location(2) glyphRowIndices : u32,`).replace("let rowIndex = findRowIndex(glyphIndex);","let rowIndex = inputs.glyphRowIndices;"),Lo=`
@group(0) @binding(auto) var fontAtlasTexture : texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler : sampler;
// Dictionary text keeps row styling in row buffers, shared glyph layout in
// dictionary buffers, and uses instance_index for visible glyph occurrences.
// There is deliberately no per-visible-glyph vertex/occurrence buffer.
@group(0) @binding(auto) var<storage, read> textRowPositions : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowColors : array<u32>;
@group(0) @binding(auto) var<storage, read> textRowAngles : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowSizes : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowPixelOffsets : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowClipRects : array<vec4<f32>>;
// textRowDictionaryRecords[row] = (dictionary value index, row glyph start).
// The extra terminal record stores rowCount/invalid and total visible glyphs.
@group(0) @binding(auto) var<storage, read> textRowDictionaryRecords : array<vec2<u32>>;
// textDictionaryGlyphRanges[value] is a half-open range into
// textDictionaryGlyphRecords for one unique dictionary string.
@group(0) @binding(auto) var<storage, read> textDictionaryGlyphRanges : array<vec2<u32>>;
// textDictionaryGlyphRecords[glyph] = (packed i16 x/y layout offset, glyph id).
// Repeated rows reuse these records instead of copying glyph offsets and ids.
@group(0) @binding(auto) var<storage, read> textDictionaryGlyphRecords : array<vec2<u32>>;
@group(0) @binding(auto) var<storage, read> textGlyphFrames : array<vec4<f32>>;

struct TextStorageStyleConfig {
  constantColor : vec4<f32>,
  constantAngleDegrees : f32,
  constantSize : f32,
  constantPixelOffset : vec2<f32>,
  useRowColors : u32,
  useRowAngles : u32,
  useRowSizes : u32,
  useRowPixelOffsets : u32,
  hasClipRects : u32,
  batchRowIndexBase : u32,
  rowStorageIndexBase : u32,
  _padding0 : u32,
  sdfThreshold : f32,
  sdfSmoothing : f32,
  fontRenderMode : u32,
  msdfDistanceRange : f32,
};

@group(0) @binding(auto) var<uniform> textStorageStyleConfig : TextStorageStyleConfig;

struct TextDictionaryRenderConfig {
  glyphIndexBase : u32,
  rowStart : u32,
  rowEnd : u32,
  _padding : u32,
};

@group(0) @binding(auto) var<uniform> textDictionaryRenderConfig : TextDictionaryRenderConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex : u32,
};

struct FragmentInputs {
  @builtin(position) position : vec4<f32>,
  @location(0) atlasUV : vec2<f32>,
  @location(1) color : vec4<f32>,
  @location(2) @interpolate(flat) atlasPage : u32,
};

fn getGlyphCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 0.0),
    vec2<f32>(1.0, 1.0),
    vec2<f32>(0.0, 1.0)
  );
  return corners[vertexIndex % 6u];
}

fn unpackLowInt16(word: u32) -> i32 {
  return i32(word << 16u) >> 16;
}

fn unpackHighInt16(word: u32) -> i32 {
  return i32(word) >> 16;
}

fn unpackClipRect(words: vec4<f32>) -> vec4<f32> {
  return words;
}

fn isGlyphVertexClipped(glyphVertexOffset: vec2<f32>, clipRect: vec4<f32>) -> bool {
  if (clipRect.z >= 0) {
    let clipMinX = clipRect.x;
    let clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    let clipMinY = clipRect.y;
    let clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

fn unpackTextColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn rotateTextOffset(offset: vec2<f32>, angleDegrees: f32) -> vec2<f32> {
  if (angleDegrees == 0.0) {
    return offset;
  }
  let angleRadians = angleDegrees * 0.017453292519943295;
  let rotation = mat2x2<f32>(
    cos(angleRadians),
    sin(angleRadians),
    -sin(angleRadians),
    cos(angleRadians)
  );
  return rotation * offset;
}

fn emptyFragmentInputs() -> FragmentInputs {
  var outputs : FragmentInputs;
  outputs.position = vec4<f32>(0.0);
  outputs.atlasUV = vec2<f32>(0.0);
  outputs.color = vec4<f32>(0.0);
  outputs.atlasPage = 0u;
  return outputs;
}

fn findRowIndex(glyphIndex: u32) -> u32 {
  // Convert a glyph occurrence index back to its row by searching row starts.
  // This replaces the older per-glyph row-index buffer.
  var low = textDictionaryRenderConfig.rowStart;
  var high = textDictionaryRenderConfig.rowEnd;
  loop {
    if (low >= high) {
      break;
    }
    let middle = (low + high) / 2u;
    let nextRowGlyphStart = textRowDictionaryRecords[middle + 1u].y;
    if (nextRowGlyphStart <= glyphIndex) {
      low = middle + 1u;
    } else {
      high = middle;
    }
  }
  return low;
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  // Each instance is one visible glyph occurrence. The occurrence is not stored;
  // glyphIndex plus the row/dictionary ranges resolves the shared glyph record.
  let glyphIndex = textDictionaryRenderConfig.glyphIndexBase + inputs.instanceIndex;
  let rowIndex = findRowIndex(glyphIndex);
  if (rowIndex >= textDictionaryRenderConfig.rowEnd) {
    return emptyFragmentInputs();
  }
  let rowDictionaryRecord = textRowDictionaryRecords[rowIndex];
  let rowGlyphStart = rowDictionaryRecord.y;
  let rowGlyphEnd = textRowDictionaryRecords[rowIndex + 1u].y;
  if (glyphIndex < rowGlyphStart || glyphIndex >= rowGlyphEnd) {
    return emptyFragmentInputs();
  }
  let dictionaryGlyphOffset = glyphIndex - rowGlyphStart;
  let dictionaryIndex = rowDictionaryRecord.x;
  if (dictionaryIndex == ${Eo}u) {
    return emptyFragmentInputs();
  }
  let dictionaryGlyphRange = textDictionaryGlyphRanges[dictionaryIndex];
  let dictionaryGlyphIndex = dictionaryGlyphRange.x + dictionaryGlyphOffset;
  if (dictionaryGlyphIndex >= dictionaryGlyphRange.y) {
    return emptyFragmentInputs();
  }

  let corner = getGlyphCorner(inputs.vertexIndex);
  let glyphRecord = textDictionaryGlyphRecords[dictionaryGlyphIndex];
  let glyphId = glyphRecord.y & 0xffffu;
  let glyphPage = glyphRecord.y >> 16u;
  let glyphFrame = textGlyphFrames[glyphId];
  let glyphOffset = vec2<f32>(
    f32(unpackLowInt16(glyphRecord.x)),
    f32(unpackHighInt16(glyphRecord.x))
  );
  let glyphSize = glyphFrame.zw;
  let glyphVertexOffset = glyphOffset + corner * glyphSize;
  let rowStorageIndex = rowIndex + textStorageStyleConfig.rowStorageIndexBase;
  var angleDegrees = textStorageStyleConfig.constantAngleDegrees;
  if (textStorageStyleConfig.useRowAngles != 0u) {
    angleDegrees = textRowAngles[rowStorageIndex];
  }
  var textSize = textStorageStyleConfig.constantSize;
  if (textStorageStyleConfig.useRowSizes != 0u) {
    textSize = textRowSizes[rowStorageIndex];
  }
  let textScale = textSize / 32.0;
  let styledGlyphVertexOffset = rotateTextOffset(glyphVertexOffset * textScale, angleDegrees);
  var pixelOffset = textStorageStyleConfig.constantPixelOffset;
  if (textStorageStyleConfig.useRowPixelOffsets != 0u) {
    pixelOffset = textRowPixelOffsets[rowStorageIndex];
  }
  let glyphPosition =
    textRowPositions[rowStorageIndex] + (styledGlyphVertexOffset + pixelOffset) * 0.001;
  var isClipped = false;
  if (textStorageStyleConfig.hasClipRects != 0u) {
    let clipRect = unpackClipRect(textRowClipRects[rowIndex]);
    isClipped = isGlyphVertexClipped(glyphVertexOffset, clipRect);
  }
  var outputs : FragmentInputs;
  outputs.position = select(
    vec4<f32>(glyphPosition, 0.0, 1.0),
    vec4<f32>(0.0),
    isClipped
  );
  outputs.atlasUV = (glyphFrame.xy + corner * glyphSize) / vec2<f32>(textureDimensions(fontAtlasTexture));
  outputs.atlasPage = glyphPage;
  outputs.color = textStorageStyleConfig.constantColor;
  if (textStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackTextColor(textRowColors[rowStorageIndex]);
  }
  return outputs;
}

${Be({textureCoordinate:"inputs.atlasUV",atlasPage:"inputs.atlasPage",settings:Dn})}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  return vec4<f32>(inputs.color.rgb, inputs.color.a * getTextGlyphAlpha(inputs));
}
`,Fn=["sint8","sint16","sint32","uint8","uint16","uint32"],zn=["value-list<uint8>",...Fn],Uo=[{columnName:"positions",kind:"positions",required:!0,formats:["float32x2"]},{columnName:"texts",kind:"text",required:!0,formats:zn},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"angles",kind:"scalars",required:!1,formats:["float32"]},{columnName:"sizes",kind:"scalars",required:!1,formats:["float32"]},{columnName:"pixelOffsets",kind:"positions",required:!1,formats:["float32x2"]},{columnName:"clipRects",kind:"positions",required:!1,formats:["float32x4"]}],Bt=[{columnName:"positions",kind:"positions",required:!0,formats:["float32x2"]},{columnName:"texts",kind:"text",required:!0,formats:zn},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4"]},{columnName:"angles",kind:"scalars",required:!1,formats:["float32"]},{columnName:"sizes",kind:"scalars",required:!1,formats:["float32"]},{columnName:"pixelOffsets",kind:"positions",required:!1,formats:["float32x2"]},{columnName:"textAnchors",kind:"scalars",required:!1,formats:["uint8"]},{columnName:"alignmentBaselines",kind:"scalars",required:!1,formats:["uint8"]},{columnName:"clipRects",kind:"positions",required:!1,formats:["float32x4"]}],Fo=[{columnName:"positions",kind:"positions",required:!0,formats:["float32x2"]},{columnName:"texts",kind:"text",required:!0,formats:Fn},...Bt.slice(2)];function zo(e){ko("TextStorageModel",Bt,e)}function ko(e,t,n){const r=Object.fromEntries(t.map(a=>[a.columnName,n[a.columnName]]));Kr(e,t,r);const o=n.positions.length;for(const a of t){const i=r[a.columnName];if(i&&i.length!==o)throw new Error(`${e} ${a.columnName} rows must match positions rows (${i.length} !== ${o})`)}}class No extends Zr{static gpuInputSchema=Uo;attributeStates;get attributeState(){return this.attributeStates[0]}constructor(t,n){const{attributeState:r,...o}=n;super(t,{...r.modelProps,...o}),this.attributeStates=[r]}addState(t){this.attributeStates.push(t),this.setNeedsRedraw("Text attribute batch appended")}draw(t,n){return n?.parameters?this._withDrawParameters(t,n.parameters,()=>this.drawTextAttributeModelBatches(t)):this.drawTextAttributeModelBatches(t)}drawTextAttributeModelBatches(t){let n=!0;try{for(const r of this.attributeStates){const o=r.modelProps.table;for(const[a,i]of r.renderBatches.entries()){const s=o.batches[a];this.setAttributes({...Yt(s.bufferLayout,s.gpuData),[en]:i.expandedGlyphVertexData},{byteOffsets:Xt(s.bufferLayout,s.gpuData)}),this.setInstanceCount(i.glyphCount),n=super.draw(t)&&n}}}finally{const o=this.attributeState.modelProps.table?.batches[0];this.setAttributes({...o?Yt(o.bufferLayout,o.gpuData):{},[en]:this.attributeState.expandedGlyphVertexData},{byteOffsets:o?Xt(o.bufferLayout,o.gpuData):{}}),this.setInstanceCount(this.attributeStates.reduce((a,i)=>a+i.glyphLayout.glyphCount,0))}return n}}function De(e){const t=e.batches[0];if(!t)throw new Error("TextStorageState requires at least one row-binding batch");return t}function _e(e){const t=e.renderBatches[0];if(!t)throw new Error("TextStorageState requires at least one render batch");return t}function $o(e){if(!e.rowGlyphStartsBuffer)throw new Error("TextStorageState batch is missing row glyph starts");return e.rowGlyphStartsBuffer}function Me(e){const t=e.batches[0];if(!t)throw new Error("TextDictionaryState requires at least one row-binding batch");return t}function Ve(e){const t=e.renderBatches[0];if(!t)throw new Error("TextDictionaryState requires at least one render batch");return t}function Yo(e,t){const n=e;if(n._areBindingsLoading()||(n._syncAttachmentFormats(t),n.pipeline=n._updatePipeline(),n.pipeline.isErrored))return!1;const r=n.vertexArray.indexBuffer,o=r?r.byteLength/(r.indexType==="uint32"?4:2):void 0;return n.pipeline.draw({renderPass:t,vertexArray:n.vertexArray,isInstanced:n.isInstanced,vertexCount:n.vertexCount,instanceCount:n.instanceCount,indexCount:o,transformFeedback:n.transformFeedback||void 0,bindings:n._getBindings(),bindGroups:n._getBindGroups(),_bindGroupCacheKeys:n._getBindGroupCacheKeys(),uniforms:n.props.uniforms,parameters:n.parameters})}function kn(e,t){if(e.type!=="webgpu")throw new Error(`${t} is WebGPU-only`)}function Nn(e){if(e.storageState.renderBatches.length===1)return e.drawModelBatch();let t=!0;const n=e.model.device.type==="webgpu"&&e.storageState.renderBatches.length>1;n&&e.model.updateShaderInputs();for(const r of e.storageState.renderBatches){const o=e.storageState.batches[r.rowBindingBatchIndex];if(!o)throw new Error(e.missingBatchError);e.prepareBatch(o,r),e.model.setInstanceCount(r.glyphCount),t=(n?Yo(e.model,e.renderPass):e.drawModelBatch())&&t}return e.restoreFirstBatch(),e.model.setInstanceCount(e.storageState.glyphCount),t}class $n extends Cn{static gpuInputSchema=Bt;storageStates;get storageState(){return this.storageStates[0]}renderProps;constructor(t,n){kn(t,"TextStorageModel");const{storageState:r,...o}=n;super(t,Xo(o,r)),this.renderProps=o,this.storageStates=[r]}addState(t){this.storageStates.push(t),this.setNeedsRedraw("Text storage batch appended")}draw(t,n){return n?.parameters?this._withDrawParameters(t,n.parameters,()=>this.drawTextStorageModelBatches(t)):this.drawTextStorageModelBatches(t)}drawTextStorageModelBatches(t){let n=!0;for(const a of this.storageStates){const i=De(a),s=_e(a);this.setAttributes({[se]:s.compactGlyphVertexData}),this.setBindings(me(this.renderProps,a,i,s)),this.setInstanceCount(s.glyphCount),n=Nn({model:this,renderPass:t,storageState:a,missingBatchError:"TextStorageModel render batch is missing its row-binding batch",drawModelBatch:()=>super.draw(t),prepareBatch:(l,c)=>{this.setAttributes({[se]:c.compactGlyphVertexData}),this.setBindings(me(this.renderProps,a,l,c))},restoreFirstBatch:()=>{const l=De(a),c=_e(a);this.setAttributes({[se]:c.compactGlyphVertexData}),this.setBindings(me(this.renderProps,a,l,c))}})&&n}const r=De(this.storageState),o=_e(this.storageState);return this.setAttributes({[se]:o.compactGlyphVertexData}),this.setBindings(me(this.renderProps,this.storageState,r,o)),this.setInstanceCount(this.storageStates.reduce((a,i)=>a+i.glyphCount,0)),n}}function Xo(e,t){const n=_e(t),r=t.hasGlyphRowIndices===!0;return{...e,source:e.source??Ho(t),shaderLayout:e.shaderLayout??qo(t),bindings:me(e,t,De(t),n),attributes:{...e.attributes||{},[se]:n.compactGlyphVertexData},bufferLayout:[...e.bufferLayout||[],{name:se,stepMode:"instance",byteStride:r?vt:Bo,attributes:[{attribute:At,format:"sint16x2",byteOffset:0},{attribute:_n,format:"uint16x2",byteOffset:Uint32Array.BYTES_PER_ELEMENT},...r?[{attribute:Mn,format:"uint32",byteOffset:Uint32Array.BYTES_PER_ELEMENT*2}]:[]]}],vertexCount:e.vertexCount??6,instanceCount:n.glyphCount}}class Wo extends $n{constructor(t,n){if(n.storageState.hasGlyphRowIndices!==!0)throw new Error("TextRowIndexedStorageModel requires hasGlyphRowIndices");super(t,n)}}function Ho(e){return e.hasGlyphRowIndices===!0?Vo:Un}function qo(e){return e.hasGlyphRowIndices===!0?Oo:Ln}function me(e,t,n,r){return{...e.bindings||{},textRowPositions:n.rowPositionsBuffer,textRowColors:n.rowColorsBuffer,textRowAngles:n.rowAnglesBuffer,textRowSizes:n.rowSizesBuffer,textRowPixelOffsets:n.rowPixelOffsetsBuffer,textRowClipRects:n.rowClipRectsBuffer,textRowGlyphStarts:$o(n),textGlyphFrames:t.glyphFramesBuffer,textStorageStyleConfig:n.styleConfigBuffer,textStorageRenderConfig:r.storageRenderConfigBuffer,...t.atlasTexture?{fontAtlasTexture:t.atlasTexture}:{}}}class jo extends Cn{static gpuInputSchema=Fo;storageStates;get storageState(){return this.storageStates[0]}renderProps;constructor(t,n){kn(t,"TextDictionaryModel");const{storageState:r,...o}=n;super(t,Ko(o,r)),this.renderProps=o,this.storageStates=[r]}addState(t){this.storageStates.push(t),this.setNeedsRedraw("Text dictionary batch appended")}draw(t,n){return n?.parameters?this._withDrawParameters(t,n.parameters,()=>this.drawTextDictionaryModelBatches(t)):this.drawTextDictionaryModelBatches(t)}drawTextDictionaryModelBatches(t){let n=!0;for(const a of this.storageStates){const i=Me(a),s=Ve(a);this.setBindings(Se(this.renderProps,a,i,s)),this.setInstanceCount(s.glyphCount),n=Nn({model:this,renderPass:t,storageState:a,missingBatchError:"TextDictionaryModel render batch is missing its row-binding batch",drawModelBatch:()=>super.draw(t),prepareBatch:(l,c)=>{this.setBindings(Se(this.renderProps,a,l,c))},restoreFirstBatch:()=>{const l=Me(a),c=Ve(a);this.setBindings(Se(this.renderProps,a,l,c))}})&&n}const r=Me(this.storageState),o=Ve(this.storageState);return this.setBindings(Se(this.renderProps,this.storageState,r,o)),this.setInstanceCount(this.storageStates.reduce((a,i)=>a+i.glyphCount,0)),n}}function Ko(e,t){const n=Ve(t);return{...e,source:e.source??Lo,shaderLayout:e.shaderLayout??Go,bindings:Se(e,t,Me(t),n),attributes:e.attributes??{},bufferLayout:e.bufferLayout??[],vertexCount:e.vertexCount??6,instanceCount:n.glyphCount}}function Se(e,t,n,r){return{...e.bindings||{},textRowPositions:n.rowPositionsBuffer,textRowColors:n.rowColorsBuffer,textRowAngles:n.rowAnglesBuffer,textRowSizes:n.rowSizesBuffer,textRowPixelOffsets:n.rowPixelOffsetsBuffer,textRowClipRects:n.rowClipRectsBuffer,textRowDictionaryRecords:n.rowDictionaryRecordsBuffer,textDictionaryGlyphRanges:n.dictionaryGlyphRangesBuffer,textDictionaryGlyphRecords:n.dictionaryGlyphRecordsBuffer,textGlyphFrames:n.glyphFramesBuffer,textStorageStyleConfig:n.styleConfigBuffer,textDictionaryRenderConfig:r.dictionaryRenderConfigBuffer,...t.atlasTexture?{fontAtlasTexture:t.atlasTexture}:{}}}const et={rowByteRanges:"utf8RowByteRanges",utf8Bytes:"utf8Bytes",mapStorage:"utf8MapStorage"};function Zo(e={}){const t=Yn(e),n=e.group??0,r=e.firstLocation??0;return[{name:t.rowByteRanges,type:"read-only-storage",group:n,location:r},{name:t.utf8Bytes,type:"read-only-storage",group:n,location:r+1},{name:t.mapStorage,type:"read-only-storage",group:n,location:r+2}]}function Jo(e){const t=Yn(e),n=e.group??0,r=e.firstLocation??0;return`
@group(${n}) @binding(${r}) var<storage, read> ${t.rowByteRanges} : array<vec2<u32>>;
@group(${n}) @binding(${r+1}) var<storage, read> ${t.utf8Bytes} : array<u32>;
@group(${n}) @binding(${r+2}) var<storage, read> ${t.mapStorage} : array<vec2<u32>>;

fn getGpuUtf8MapRowByteRange(rowIndex: u32) -> vec2<u32> {
  return ${t.rowByteRanges}[rowIndex];
}

fn readGpuUtf8MapByte(byteIndex: u32) -> u32 {
  let word = ${t.utf8Bytes}[byteIndex >> 2u];
  let byteShift = (byteIndex & 3u) << 3u;
  return (word >> byteShift) & 0xffu;
}

fn isGpuUtf8MapCodePointStart(firstByte: u32) -> bool {
  return (firstByte & 0xc0u) != 0x80u;
}

fn decodeGpuUtf8MapCodePoint(byteIndex: u32) -> u32 {
  let firstByte = readGpuUtf8MapByte(byteIndex);
  if ((firstByte & 0x80u) == 0u) {
    return firstByte;
  }
  if ((firstByte & 0xe0u) == 0xc0u) {
    return ((firstByte & 0x1fu) << 6u) | (readGpuUtf8MapByte(byteIndex + 1u) & 0x3fu);
  }
  if ((firstByte & 0xf0u) == 0xe0u) {
    return
      ((firstByte & 0x0fu) << 12u) |
      ((readGpuUtf8MapByte(byteIndex + 1u) & 0x3fu) << 6u) |
      (readGpuUtf8MapByte(byteIndex + 2u) & 0x3fu);
  }
  if ((firstByte & 0xf8u) == 0xf0u) {
    return
      ((firstByte & 0x07u) << 18u) |
      ((readGpuUtf8MapByte(byteIndex + 1u) & 0x3fu) << 12u) |
      ((readGpuUtf8MapByte(byteIndex + 2u) & 0x3fu) << 6u) |
      (readGpuUtf8MapByte(byteIndex + 3u) & 0x3fu);
  }
  return 0xfffdu;
}

fn mapGpuUtf8CodePoint(codePoint: u32) -> u32 {
  let mapEntryCount = ${e.mapEntryCountExpression};
  var mapEntryIndex = 0u;
  loop {
    if (mapEntryIndex >= mapEntryCount) {
      break;
    }
    let mapEntry = ${t.mapStorage}[mapEntryIndex];
    if (mapEntry.x == codePoint) {
      return mapEntry.y;
    }
    mapEntryIndex += 1u;
  }
  return 0u;
}
`}function Yn(e){return{rowByteRanges:e.rowByteRanges??et.rowByteRanges,utf8Bytes:e.utf8Bytes??et.utf8Bytes,mapStorage:e.mapStorage??et.mapStorage}}const Xn=7,Wn=10;function Et(e,t=0){return e.type==="webgpu"&&e.limits.maxStorageBuffersPerShaderStage>=Xn+t}function Pt(e){return e.type==="webgpu"&&e.limits.maxStorageBuffersPerShaderStage>=Wn}const Ot=`
fn packGlyphPageAndId(glyphId: u32) -> u32 {
  return ((textGlyphPages[glyphId] & 0xffffu) << 16u) | (glyphId & 0xffffu);
}

fn getGlyphKerningOffset(firstGlyphId: u32, secondGlyphId: u32) -> i32 {
  var low = 0u;
  var high = arrayLength(&textGlyphKernings);
  loop {
    if (low >= high) {
      return 0i;
    }
    let middle = (low + high) / 2u;
    let pair = textGlyphKernings[middle];
    let pairFirst = u32(max(pair.x, 0));
    let pairSecond = u32(max(pair.y, 0));
    if (pairFirst < firstGlyphId || (pairFirst == firstGlyphId && pairSecond < secondGlyphId)) {
      low = middle + 1u;
      continue;
    }
    if (pairFirst > firstGlyphId || (pairFirst == firstGlyphId && pairSecond > secondGlyphId)) {
      high = middle;
      continue;
    }
    return pair.z;
  }
}
`,Hn=`
@group(0) @binding(0) var<storage, read> textGlyphRanges : array<vec2<u32>>;
@group(0) @binding(1) var<storage, read> textGlyphIds : array<u32>;
@group(0) @binding(2) var<storage, read> textGlyphMetrics : array<vec4<i32>>;
@group(0) @binding(3) var<storage, read> textGlyphPages : array<u32>;
@group(0) @binding(4) var<storage, read> textGlyphKernings : array<vec4<i32>>;
@group(0) @binding(5) var<storage, read> textExpansionConfig : array<i32>;
struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
}
@group(0) @binding(6) var<storage, read_write> generatedGlyphVertices : array<GeneratedGlyphVertex>;
@group(0) @binding(7) var<storage, read> textRowTextAnchors : array<u32>;
@group(0) @binding(8) var<storage, read> textRowAlignmentBaselines : array<u32>;

${Ot}

fn unpackGlyphId(glyphIndex: u32) -> u32 {
  let word = textGlyphIds[glyphIndex >> 1u];
  return select(word & 0xffffu, word >> 16u, (glyphIndex & 1u) == 1u);
}

fn packSignedInt16Pair(lowerValue: i32, upperValue: i32) -> u32 {
  return (u32(lowerValue) & 0xffffu) | ((u32(upperValue) & 0xffffu) << 16u);
}

fn getTextAnchor(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[3], 0));
  if (textExpansionConfig[5] != 0) {
    let packedAnchorWord = textRowTextAnchors[rowStorageIndex >> 2u];
    return (packedAnchorWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[4], 0));
}

fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[3], 0));
  if (textExpansionConfig[7] != 0) {
    let packedBaselineWord = textRowAlignmentBaselines[rowStorageIndex >> 2u];
    return (packedBaselineWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[6], 0));
}

fn getAnchorShift(width: i32, textAnchor: u32) -> i32 {
  if (textAnchor == 1u) { return -(width / 2i); }
  if (textAnchor == 2u) { return -width; }
  return 0i;
}

fn getBaselineShift(alignmentBaseline: u32) -> i32 {
  let halfLineHeight = textExpansionConfig[8] / 2i;
  if (alignmentBaseline == 1u) { return halfLineHeight; }
  if (alignmentBaseline == 2u) { return -halfLineHeight; }
  return 0i;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  let labelCount = u32(max(textExpansionConfig[1], 0));
  if (rowIndex >= labelCount) {
    return;
  }

  let glyphRange = textGlyphRanges[rowIndex];
  let baselineOffsetY = textExpansionConfig[0];
  var width = 0i;
  var previousGlyphId = 0u;
  var glyphIndex = glyphRange.x;
  loop {
    if (glyphIndex >= glyphRange.y) {
      break;
    }
    let glyphId = unpackGlyphId(glyphIndex);
    let metrics = textGlyphMetrics[glyphId];
    width += getGlyphKerningOffset(previousGlyphId, glyphId) + metrics.z;
    previousGlyphId = glyphId;
    glyphIndex += 1u;
  }
  let anchorShift = getAnchorShift(width, getTextAnchor(rowIndex));
  let baselineShift = getBaselineShift(getAlignmentBaseline(rowIndex));
  glyphIndex = glyphRange.x;
  width = 0i;
  previousGlyphId = 0u;
  loop {
    if (glyphIndex >= glyphRange.y) { break; }
    let glyphId = unpackGlyphId(glyphIndex);
    let metrics = textGlyphMetrics[glyphId];
    width += getGlyphKerningOffset(previousGlyphId, glyphId);
    generatedGlyphVertices[glyphIndex] = GeneratedGlyphVertex(
      packSignedInt16Pair(
        width + metrics.x + anchorShift,
        baselineOffsetY + baselineShift + metrics.y
      ),
      packGlyphPageAndId(glyphId)
    );
    width += metrics.z;
    previousGlyphId = glyphId;
    glyphIndex += 1u;
  }
}
`,Qo=Gt(Hn,"rowIndex + u32(max(textExpansionConfig[2], 0))"),tn={bindings:[{name:"textGlyphRanges",type:"read-only-storage",group:0,location:0},{name:"textGlyphIds",type:"read-only-storage",group:0,location:1},{name:"textGlyphMetrics",type:"read-only-storage",group:0,location:2},{name:"textGlyphPages",type:"read-only-storage",group:0,location:3},{name:"textGlyphKernings",type:"read-only-storage",group:0,location:4},{name:"textExpansionConfig",type:"read-only-storage",group:0,location:5},{name:"generatedGlyphVertices",type:"storage",group:0,location:6},{name:"textRowTextAnchors",type:"read-only-storage",group:0,location:7},{name:"textRowAlignmentBaselines",type:"read-only-storage",group:0,location:8}],attributes:[]};function ea(e,t,n){let r=e;const o=new Set;return t||(r=r.replace(`@group(0) @binding(7) var<storage, read> textRowTextAnchors : array<u32>;
`,"").replace(`fn getTextAnchor(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[3], 0));
  if (textExpansionConfig[5] != 0) {
    let packedAnchorWord = textRowTextAnchors[rowStorageIndex >> 2u];
    return (packedAnchorWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[4], 0));
}`,`fn getTextAnchor(rowIndex: u32) -> u32 {
  return u32(max(textExpansionConfig[4], 0));
}`),o.add("textRowTextAnchors")),n||(r=r.replace(`@group(0) @binding(8) var<storage, read> textRowAlignmentBaselines : array<u32>;
`,"").replace(`fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[3], 0));
  if (textExpansionConfig[7] != 0) {
    let packedBaselineWord = textRowAlignmentBaselines[rowStorageIndex >> 2u];
    return (packedBaselineWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[6], 0));
}`,`fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  return u32(max(textExpansionConfig[6], 0));
}`),o.add("textRowAlignmentBaselines")),{source:r,shaderLayout:{...tn,bindings:tn.bindings.filter(a=>!o.has(a.name))}}}const qn={rowByteRanges:"textRowByteRanges",utf8Bytes:"textUtf8Bytes",mapStorage:"textGlyphLookup",mapEntryCountExpression:"u32(max(textExpansionConfig[2], 0))"},jn=`
${Jo(qn)}
@group(0) @binding(3) var<storage, read> textGlyphMetrics : array<vec4<i32>>;
@group(0) @binding(4) var<storage, read> textGlyphPages : array<u32>;
@group(0) @binding(5) var<storage, read> textGlyphKernings : array<vec4<i32>>;
@group(0) @binding(6) var<storage, read> textExpansionConfig : array<i32>;
struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
}
@group(0) @binding(7) var<storage, read_write> generatedGlyphVertices : array<GeneratedGlyphVertex>;
@group(0) @binding(8) var<storage, read> textRowTextAnchors : array<u32>;
@group(0) @binding(9) var<storage, read> textRowAlignmentBaselines : array<u32>;

${Ot}

fn packSignedInt16Pair(lowerValue: i32, upperValue: i32) -> u32 {
  return (u32(lowerValue) & 0xffffu) | ((u32(upperValue) & 0xffffu) << 16u);
}

fn getTextAnchor(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[4], 0));
  if (textExpansionConfig[6] != 0) {
    let packedAnchorWord = textRowTextAnchors[rowStorageIndex >> 2u];
    return (packedAnchorWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[5], 0));
}

fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[4], 0));
  if (textExpansionConfig[8] != 0) {
    let packedBaselineWord = textRowAlignmentBaselines[rowStorageIndex >> 2u];
    return (packedBaselineWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[7], 0));
}

fn getAnchorShift(width: i32, textAnchor: u32) -> i32 {
  if (textAnchor == 1u) { return -(width / 2i); }
  if (textAnchor == 2u) { return -width; }
  return 0i;
}

fn getBaselineShift(alignmentBaseline: u32) -> i32 {
  let halfLineHeight = textExpansionConfig[9] / 2i;
  if (alignmentBaseline == 1u) { return halfLineHeight; }
  if (alignmentBaseline == 2u) { return -halfLineHeight; }
  return 0i;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  let labelCount = u32(max(textExpansionConfig[1], 0));
  if (rowIndex >= labelCount) {
    return;
  }

  let rowByteRange = getGpuUtf8MapRowByteRange(rowIndex);
  let baselineOffsetY = textExpansionConfig[0];
  var width = 0i;
  var previousGlyphId = 0u;
  var byteIndex = rowByteRange.x;
  loop {
    if (byteIndex >= rowByteRange.y) {
      break;
    }
    let firstByte = readGpuUtf8MapByte(byteIndex);
    if (isGpuUtf8MapCodePointStart(firstByte)) {
      let glyphId = mapGpuUtf8CodePoint(decodeGpuUtf8MapCodePoint(byteIndex));
      let metrics = textGlyphMetrics[glyphId];
      width += getGlyphKerningOffset(previousGlyphId, glyphId) + metrics.z;
      previousGlyphId = glyphId;
    }
    byteIndex += 1u;
  }
  let anchorShift = getAnchorShift(width, getTextAnchor(rowIndex));
  let baselineShift = getBaselineShift(getAlignmentBaseline(rowIndex));
  let outputByteBase = u32(max(textExpansionConfig[10], 0));
  width = 0i;
  previousGlyphId = 0u;
  byteIndex = rowByteRange.x;
  loop {
    if (byteIndex >= rowByteRange.y) { break; }
    let firstByte = readGpuUtf8MapByte(byteIndex);
    if (isGpuUtf8MapCodePointStart(firstByte)) {
      let glyphId = mapGpuUtf8CodePoint(decodeGpuUtf8MapCodePoint(byteIndex));
      let metrics = textGlyphMetrics[glyphId];
      width += getGlyphKerningOffset(previousGlyphId, glyphId);
      generatedGlyphVertices[byteIndex - outputByteBase] = GeneratedGlyphVertex(
        packSignedInt16Pair(
          width + metrics.x + anchorShift,
          baselineOffsetY + baselineShift + metrics.y
        ),
        packGlyphPageAndId(glyphId)
      );
      width += metrics.z;
      previousGlyphId = glyphId;
    }
    byteIndex += 1u;
  }
}
`,ta=Gt(jn,"rowIndex + u32(max(textExpansionConfig[3], 0))"),na={bindings:[...Zo(qn),{name:"textGlyphMetrics",type:"read-only-storage",group:0,location:3},{name:"textGlyphPages",type:"read-only-storage",group:0,location:4},{name:"textGlyphKernings",type:"read-only-storage",group:0,location:5},{name:"textExpansionConfig",type:"read-only-storage",group:0,location:6},{name:"generatedGlyphVertices",type:"storage",group:0,location:7},{name:"textRowTextAnchors",type:"read-only-storage",group:0,location:8},{name:"textRowAlignmentBaselines",type:"read-only-storage",group:0,location:9}],attributes:[]},ra=`
@group(0) @binding(0) var<storage, read> textDictionaryValueByteRanges : array<vec2<u32>>;
@group(0) @binding(1) var<storage, read> textDictionaryUtf8Bytes : array<u32>;
@group(0) @binding(2) var<storage, read> textRowDictionaryIndices : array<u32>;
@group(0) @binding(3) var<storage, read> textRowOutputGlyphRanges : array<vec2<u32>>;
@group(0) @binding(4) var<storage, read> textGlyphLookup : array<vec2<u32>>;
@group(0) @binding(5) var<storage, read> textGlyphMetrics : array<vec4<i32>>;
@group(0) @binding(6) var<storage, read> textGlyphPages : array<u32>;
@group(0) @binding(7) var<storage, read> textGlyphKernings : array<vec4<i32>>;
@group(0) @binding(8) var<storage, read> textExpansionConfig : array<i32>;
struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
}
@group(0) @binding(9) var<storage, read_write> generatedGlyphVertices : array<GeneratedGlyphVertex>;
@group(0) @binding(10) var<storage, read> textRowTextAnchors : array<u32>;
@group(0) @binding(11) var<storage, read> textRowAlignmentBaselines : array<u32>;

${Ot}

fn readDictionaryUtf8Byte(byteIndex: u32) -> u32 {
  let word = textDictionaryUtf8Bytes[byteIndex >> 2u];
  let byteShift = (byteIndex & 3u) << 3u;
  return (word >> byteShift) & 0xffu;
}

fn isDictionaryUtf8CodePointStart(firstByte: u32) -> bool {
  return (firstByte & 0xc0u) != 0x80u;
}

fn decodeDictionaryUtf8CodePoint(byteIndex: u32) -> u32 {
  let firstByte = readDictionaryUtf8Byte(byteIndex);
  if ((firstByte & 0x80u) == 0u) {
    return firstByte;
  }
  if ((firstByte & 0xe0u) == 0xc0u) {
    return ((firstByte & 0x1fu) << 6u) | (readDictionaryUtf8Byte(byteIndex + 1u) & 0x3fu);
  }
  if ((firstByte & 0xf0u) == 0xe0u) {
    return
      ((firstByte & 0x0fu) << 12u) |
      ((readDictionaryUtf8Byte(byteIndex + 1u) & 0x3fu) << 6u) |
      (readDictionaryUtf8Byte(byteIndex + 2u) & 0x3fu);
  }
  if ((firstByte & 0xf8u) == 0xf0u) {
    return
      ((firstByte & 0x07u) << 18u) |
      ((readDictionaryUtf8Byte(byteIndex + 1u) & 0x3fu) << 12u) |
      ((readDictionaryUtf8Byte(byteIndex + 2u) & 0x3fu) << 6u) |
      (readDictionaryUtf8Byte(byteIndex + 3u) & 0x3fu);
  }
  return 0xfffdu;
}

fn mapDictionaryUtf8CodePoint(codePoint: u32) -> u32 {
  let mapEntryCount = u32(max(textExpansionConfig[2], 0));
  var mapEntryIndex = 0u;
  loop {
    if (mapEntryIndex >= mapEntryCount) {
      break;
    }
    let mapEntry = textGlyphLookup[mapEntryIndex];
    if (mapEntry.x == codePoint) {
      return mapEntry.y;
    }
    mapEntryIndex += 1u;
  }
  return 0u;
}

fn packSignedInt16Pair(lowerValue: i32, upperValue: i32) -> u32 {
  return (u32(lowerValue) & 0xffffu) | ((u32(upperValue) & 0xffffu) << 16u);
}

fn getTextAnchor(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[4], 0));
  if (textExpansionConfig[7] != 0) {
    let packedAnchorWord = textRowTextAnchors[rowStorageIndex >> 2u];
    return (packedAnchorWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[6], 0));
}

fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[4], 0));
  if (textExpansionConfig[9] != 0) {
    let packedBaselineWord = textRowAlignmentBaselines[rowStorageIndex >> 2u];
    return (packedBaselineWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[8], 0));
}

fn getAnchorShift(width: i32, textAnchor: u32) -> i32 {
  if (textAnchor == 1u) { return -(width / 2i); }
  if (textAnchor == 2u) { return -width; }
  return 0i;
}

fn getBaselineShift(alignmentBaseline: u32) -> i32 {
  let halfLineHeight = textExpansionConfig[10] / 2i;
  if (alignmentBaseline == 1u) { return halfLineHeight; }
  if (alignmentBaseline == 2u) { return -halfLineHeight; }
  return 0i;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  let labelCount = u32(max(textExpansionConfig[1], 0));
  if (rowIndex >= labelCount) {
    return;
  }

  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[4], 0));
  let dictionaryIndex = textRowDictionaryIndices[rowStorageIndex];
  if (dictionaryIndex == 0xffffffffu) {
    return;
  }

  let rowOutputRange = textRowOutputGlyphRanges[rowStorageIndex];
  let outputGlyphIndexBase = u32(max(textExpansionConfig[5], 0));
  let outputGlyphStart = select(0u, rowOutputRange.x - outputGlyphIndexBase, rowOutputRange.x >= outputGlyphIndexBase);
  let dictionaryByteRange = textDictionaryValueByteRanges[dictionaryIndex];
  let baselineOffsetY = textExpansionConfig[0];
  var width = 0i;
  var previousGlyphId = 0u;
  var byteIndex = dictionaryByteRange.x;
  loop {
    if (byteIndex >= dictionaryByteRange.y) {
      break;
    }
    let firstByte = readDictionaryUtf8Byte(byteIndex);
    if (isDictionaryUtf8CodePointStart(firstByte)) {
      let glyphId = mapDictionaryUtf8CodePoint(decodeDictionaryUtf8CodePoint(byteIndex));
      let metrics = textGlyphMetrics[glyphId];
      width += getGlyphKerningOffset(previousGlyphId, glyphId) + metrics.z;
      previousGlyphId = glyphId;
    }
    byteIndex += 1u;
  }
  let anchorShift = getAnchorShift(width, getTextAnchor(rowIndex));
  let baselineShift = getBaselineShift(getAlignmentBaseline(rowIndex));
  width = 0i;
  previousGlyphId = 0u;
  byteIndex = dictionaryByteRange.x;
  var outputGlyphIndex = outputGlyphStart;
  loop {
    if (byteIndex >= dictionaryByteRange.y) { break; }
    let firstByte = readDictionaryUtf8Byte(byteIndex);
    if (isDictionaryUtf8CodePointStart(firstByte)) {
      let glyphId = mapDictionaryUtf8CodePoint(decodeDictionaryUtf8CodePoint(byteIndex));
      let metrics = textGlyphMetrics[glyphId];
      width += getGlyphKerningOffset(previousGlyphId, glyphId);
      generatedGlyphVertices[outputGlyphIndex] = GeneratedGlyphVertex(
        packSignedInt16Pair(
          width + metrics.x + anchorShift,
          baselineOffsetY + baselineShift + metrics.y
        ),
        packGlyphPageAndId(glyphId)
      );
      width += metrics.z;
      previousGlyphId = glyphId;
      outputGlyphIndex += 1u;
    }
    byteIndex += 1u;
  }
}
`;Gt(ra,"rowIndex + u32(max(textExpansionConfig[3], 0))");function ct(e,t,n){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-metrics`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.byteLength>0?n:new Int32Array(4)}),byteLength:n.byteLength}}function ut(e,t,n){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-pages`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.byteLength>0?n:new Uint32Array(1)}),byteLength:n.byteLength}}function ft(e,t,n){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-kernings`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.byteLength>0?n:new Int32Array(4)}),byteLength:n.byteLength}}function Kn(e,t,n){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-lookup`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.byteLength>0?n:new Uint32Array(2)}),byteLength:n.byteLength}}function oa(e,t,n,r=0,o={},a=0){const i=new Int32Array([n.baselineOffsetY,n.labelGlyphRanges.length/2,r,a,o.textAnchor??0,o.useRowTextAnchors?1:0,o.alignmentBaseline??0,o.useRowAlignmentBaselines?1:0,o.lineHeight??0]);return{glyphRangesBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-ranges`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.labelGlyphRanges.byteLength>0?n.labelGlyphRanges:new Uint32Array(2)}),glyphIdsBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-ids`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.packedGlyphIds.byteLength>0?n.packedGlyphIds:new Uint32Array(1)}),expansionConfigBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-expansion-config`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:i}),byteLength:n.labelGlyphRanges.byteLength+n.packedGlyphIds.byteLength+i.byteLength}}function aa(e,t,{utf8TextInput:n,baselineOffsetY:r,glyphLookupCount:o,labelCount:a,batchRowIndexBase:i=0,rowStorageIndexBase:s=0,outputByteBase:l=0,alignment:c={}}){const u=new Int32Array([r,a,o,i,s,c.textAnchor??0,c.useRowTextAnchors?1:0,c.alignmentBaseline??0,c.useRowAlignmentBaselines?1:0,c.lineHeight??0,l]);return{rowByteRangesBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-row-byte-ranges`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.rowByteRanges.byteLength>0?n.rowByteRanges:new Uint32Array(2)}),utf8BytesBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-bytes`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.packedUtf8Bytes.byteLength>0?n.packedUtf8Bytes:new Uint32Array(1)}),expansionConfigBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-expansion-config`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:u}),byteLength:n.inputByteLength+u.byteLength}}function ia(e,t,{rowByteRangesBuffer:n,utf8BytesBuffer:r,inputByteLength:o,baselineOffsetY:a,glyphLookupCount:i,labelCount:s,batchRowIndexBase:l=0,rowStorageIndexBase:c=0,outputByteBase:u=0,alignment:f={}}){const g=new Int32Array([a,s,i,l,c,f.textAnchor??0,f.useRowTextAnchors?1:0,f.alignmentBaseline??0,f.useRowAlignmentBaselines?1:0,f.lineHeight??0,u]);return{rowByteRangesBuffer:n,utf8BytesBuffer:r,expansionConfigBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-expansion-config`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:g}),byteLength:o+g.byteLength}}function dt(e,t,n,r=!1){const o=Math.max(n,1),a=r?3:2,i=n*Uint32Array.BYTES_PER_ELEMENT*a;return{compactGlyphVertexData:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-generated-glyph-vertices`,usage:p.VERTEX|p.STORAGE|p.COPY_DST|p.COPY_SRC,data:new Uint32Array(o*a)}),byteLength:i,hasGlyphRowIndices:r}}function sa(e,t,n){const r=n.alignment.useRowTextAnchors??!1,o=n.alignment.useRowAlignmentBaselines??!1,a=ea(n.generated.hasGlyphRowIndices?Qo:Hn,r,o),i=new On(e,{id:`${t.id||"gpu-expanded-text-model"}-compute`,source:a.source,shaderLayout:a.shaderLayout,bindings:{textGlyphRanges:n.compactInput.glyphRangesBuffer,textGlyphIds:n.compactInput.glyphIdsBuffer,textGlyphMetrics:n.glyphMetrics.buffer,textGlyphPages:n.glyphPages.buffer,textGlyphKernings:n.glyphKernings.buffer,textExpansionConfig:n.compactInput.expansionConfigBuffer,generatedGlyphVertices:n.generated.compactGlyphVertexData,...r?{textRowTextAnchors:n.alignment.rowTextAnchorsBuffer}:{},...o?{textRowAlignmentBaselines:n.alignment.rowAlignmentBaselinesBuffer}:{}}});if(n.glyphCount>0&&n.labelCount>0){const s=e.beginComputePass({});i.dispatch(s,Math.ceil(n.labelCount/64)),s.end(),e.submit()}i.destroy()}function Zn(e,t,n){const r=new On(e,{id:`${t.id||"gpu-expanded-text-model"}-utf8-compute`,source:n.generated.hasGlyphRowIndices?ta:jn,shaderLayout:na,bindings:{textRowByteRanges:n.utf8Input.rowByteRangesBuffer,textUtf8Bytes:n.utf8Input.utf8BytesBuffer,textGlyphLookup:n.glyphLookup.buffer,textGlyphMetrics:n.glyphMetrics.buffer,textGlyphPages:n.glyphPages.buffer,textGlyphKernings:n.glyphKernings.buffer,textExpansionConfig:n.utf8Input.expansionConfigBuffer,generatedGlyphVertices:n.generated.compactGlyphVertexData,textRowTextAnchors:n.alignment.rowTextAnchorsBuffer,textRowAlignmentBaselines:n.alignment.rowAlignmentBaselinesBuffer}});if(n.outputSlotCount>0&&n.labelCount>0){const o=e.beginComputePass({});r.dispatch(o,Math.ceil(n.labelCount/64)),o.end(),e.submit()}r.destroy()}function Gt(e,t){return e.replace(`struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
}`,`struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
  rowIndices : u32,
}`).replace(/packGlyphPageAndId\(glyphId\)\n(\s*)\)/g,(n,r)=>`packGlyphPageAndId(glyphId),
${r}  ${t}
${r})`)}function Jn(e){return{renderMode:e.mode==="bitmap"?0:e.mode==="sdf"?1:2,sdfThreshold:e.threshold,sdfSmoothing:e.smoothing,msdfDistanceRange:e.distanceRange??0}}function la(e,t){const n={...e||{}};return ca(n,t),n}function ca(e,t){const n=Jn(t);e.textFontRenderMode=n.renderMode,e.textSdfThreshold=n.sdfThreshold,e.textSdfSmoothing=n.sdfSmoothing,e.textMsdfDistanceRange=n.msdfDistanceRange}const ua=1114112;function fa(e,t,n){return t===void 0?0:e?.lookup.get(t*ua+n)??0}function Qn(e){return e.atlasPage??0}function er(e){return[e.layoutOffsetX??e.anchorX,e.layoutOffsetY??0]}function da(e){return e===0?0:Math.pow(2,Math.ceil(Math.log2(e)))}function ga({characterSet:e,measureText:t,buffer:n,maxCanvasWidth:r,mapping:o={},xOffset:a=0,yOffsetMin:i=0,yOffsetMax:s=0}){let l=a,c=i,u=s;for(const f of e){if(o[f])continue;const{advance:g,width:h,ascent:m,descent:y}=t(f),d=m+y;l+h+n*2>r&&(l=0,c=u),o[f]={x:l+n,y:c+n,width:h,height:d,atlasPage:0,advance:g,anchorX:h/2,anchorY:m,layoutOffsetX:0,layoutOffsetY:-m},l+=h+n*2,u=Math.max(u,c+d+n*2)}return{mapping:o,xOffset:l,yOffsetMin:c,yOffsetMax:u,canvasHeight:Math.max(1,da(u))}}const ha=32;function Dt(e,t,n){const{fontAtlas:r}=t,o=t.lineHeight??r.lineHeight,a=t.missingCharacterWidth??ha;let i=0,s=0,l,c=Number.POSITIVE_INFINITY,u=Number.POSITIVE_INFINITY,f=Number.NEGATIVE_INFINITY,g=Number.NEGATIVE_INFINITY;e(d=>{const w=String.fromCodePoint(d),x=r.mapping[w];t.characterSet?.add(w),i+=fa(r.kerning,l,d);const[S,R]=x?er(x):[0,0],T=i+S,b=r.baselineOffset+o/2+R;x&&(c=Math.min(c,T),u=Math.min(u,b),f=Math.max(f,T+x.width),g=Math.max(g,b+x.height)),n?.({character:w,codePoint:d,frame:x,atlasPage:x?Qn(x):0,offsetX:T,offsetY:b}),i+=x?.advance??a,l=d,s++});const h=xa(i,t.textAnchor),m=pa(o,t.alignmentBaseline),y=Number.isFinite(c);return{advance:i,glyphCount:s,anchorOffsetX:h,baselineOffsetY:m,bounds:y?{min:[c+h,u+m],max:[f+h,g+m]}:{min:[0,0],max:[0,0]}}}function xa(e,t){return t==="middle"?-e/2:t==="end"?-e:0}function pa(e,t){return t==="top"?e/2:t==="bottom"?-e/2:0}const Ee=32,ge=65535,tt=4294967295;function ya(e,t){const{fontAtlas:n,characterSet:r}=t,o=t.missingCharacterWidth??Ee,a=nr(e),i=a[e.rowCount]??0,s=new Int16Array(i*2),l=new Uint16Array(i*4),c=new Uint16Array(i),u=new Float32Array(e.rowCount),f=new Float32Array(e.rowCount*4),g=Xe(n,r,o);let h=0,m=0;for(let y=0;y<e.rowCount;y++){const d=h,w=Dt(x=>e.visitCodePoints(y,x),t,({codePoint:x,atlasPage:S,offsetX:R,offsetY:T})=>{const{frame:b}=We(g,x);s[h++]=J(R),s[h++]=J(T),l[m++]=re(b?.x??0),l[m++]=re(b?.y??0),l[m++]=re(b?.width??0),l[m++]=re(b?.height??0),c[m/4-1]=re(S)});for(let x=d;x<h;x+=2)s[x]=J(s[x]+w.anchorOffsetX),s[x+1]=J(s[x+1]+w.baselineOffsetY);u[y]=w.advance,f.set([...w.bounds.min,...w.bounds.max],y*4)}return{startIndices:a,glyphCount:i,glyphOffsets:s,glyphFrames:l,glyphPages:c,rowAdvances:u,rowBounds:f,characterSet:r}}function wa(e,t){const n=Fe(),{fontAtlas:r,characterSet:o}=t,a=t.lineHeight??r.lineHeight,i=t.missingCharacterWidth??Ee,s=nr(e),l=s[e.rowCount]??0,c=new Uint32Array(e.rowCount*2),u=new Uint32Array(Math.ceil(l/2)),f=Xe(r,o,i);let g=0;for(let S=0;S<e.rowCount;S++){const R=s[S]??0,T=s[S+1]??R;c[S*2]=R,c[S*2+1]=T,Dt(b=>e.visitCodePoints(S,b),t,({codePoint:b})=>{const{glyphId:A}=We(f,b);Sa(u,g,A),g++})}const h=new Float32Array(f.glyphFrameValues),m=new Int32Array(f.glyphMetricValues),y=new Uint32Array(f.glyphPageValues),d=rr(f.glyphIdsByCodePoint,r),w=c.byteLength+u.byteLength,x=h.byteLength+m.byteLength+y.byteLength+d.byteLength;return{startIndices:s,glyphCount:l,labelGlyphRanges:c,packedGlyphIds:u,glyphFrames:h,glyphMetrics:m,glyphPages:y,glyphKernings:d,baselineOffsetY:J(r.baselineOffset+a/2),characterSet:o,compactStreamByteLength:w,glyphDefinitionByteLength:x,glyphStreamBuildTimeMs:Fe()-n}}function ma(e,t){const n=Fe(),{fontAtlas:r,characterSet:o}=t,a=t.missingCharacterWidth??Ee,i=new Uint32Array(e.rowCount*2),s=new Uint32Array(e.rowCount),l=new Uint32Array(e.dictionaryValueCount*2),c=[],u=new Array(e.rowCount+1),f=Xe(r,o,a);let g=0;u[0]=0,s.fill(tt);for(let d=0;d<e.dictionaryValueCount;d++){const w=c.length/2,x=[],S=Dt(R=>e.visitDictionaryCodePoints(d,R),t,({codePoint:R,offsetX:T,offsetY:b,atlasPage:A})=>{const{glyphId:C}=We(f,R);x.push({offsetX:T,offsetY:b,glyphId:C,atlasPage:A})});for(const R of x)c.push(Ra(R.offsetX+S.anchorOffsetX,R.offsetY+S.baselineOffsetY),Ta(R.glyphId,R.atlasPage));l[d*2]=w,l[d*2+1]=c.length/2}for(let d=0;d<e.rowCount;d++){const w=e.getRowDictionaryIndex(d),x=w>=0&&w<e.dictionaryValueCount?w:tt;if(s[d]=x,i[d*2]=g,x!==tt){const S=l[x*2]??0,R=l[x*2+1]??S;g+=Math.max(0,R-S)}i[d*2+1]=g,u[d+1]=g}const h=new Uint32Array(c),m=new Float32Array(f.glyphFrameValues),y=i.byteLength+s.byteLength+l.byteLength+h.byteLength;return{startIndices:u,rowGlyphRanges:i,rowDictionaryIndices:s,dictionaryGlyphRanges:l,dictionaryGlyphRecords:h,glyphFrames:m,glyphCount:g,dictionaryGlyphCount:h.length/2,dictionaryValueCount:e.dictionaryValueCount,characterSet:o,compressedStreamByteLength:y,glyphDefinitionByteLength:m.byteLength,glyphStreamBuildTimeMs:Fe()-n}}function tr(e,t){const{fontAtlas:n}=t,r=t.lineHeight??n.lineHeight,o=t.missingCharacterWidth??Ee,a=Xe(n,void 0,o),i=[],s=new Set;for(const l of e)for(const c of l){const u=c.codePointAt(0);if(u===void 0||s.has(u))continue;s.add(u);const{glyphId:f}=We(a,u);i.push(u,f)}return{glyphFrames:new Float32Array(a.glyphFrameValues),glyphMetrics:new Int32Array(a.glyphMetricValues),glyphPages:new Uint32Array(a.glyphPageValues),glyphKernings:rr(a.glyphIdsByCodePoint,n),glyphLookup:new Uint32Array(i),baselineOffsetY:J(n.baselineOffset+r/2)}}function nr(e){const t=new Array(e.rowCount+1);let n=0;t[0]=0;for(let r=0;r<e.rowCount;r++)n+=e.countCodePoints(r),t[r+1]=n;return t}function Xe(e,t,n=Ee){return{fontAtlas:e,characterSet:t,definitionsByCodePoint:new Map,glyphIdsByCodePoint:new Map,glyphFrameValues:[0,0,0,0],glyphMetricValues:[0,0,n,0],glyphPageValues:[0]}}function We(e,t){const n=e.definitionsByCodePoint.get(t);if(n)return n;const r=String.fromCodePoint(t),o=e.fontAtlas.mapping[r];let a=0;if(o){if(a=e.glyphFrameValues.length/4,a>ge)throw new Error("Text glyph definitions exceed the uint16 glyph id range");const[s,l]=er(o);e.glyphFrameValues.push(o.x,o.y,o.width,o.height),e.glyphMetricValues.push(s,l,o.advance,0),e.glyphPageValues.push(Qn(o))}const i={frame:o,glyphId:a};return e.definitionsByCodePoint.set(t,i),e.glyphIdsByCodePoint.set(t,a),e.characterSet?.add(r),i}function rr(e,t){if(!t.kerning)return new Int32Array(0);const n=[];for(const r of t.kerning.pairs){const o=e.get(r.first),a=e.get(r.second);o===void 0||a===void 0||n.push([o,a,r.amount,0])}return n.sort((r,o)=>(r[0]??0)-(o[0]??0)||(r[1]??0)-(o[1]??0)),new Int32Array(n.flat())}function Sa(e,t,n){const r=t>>1,o=e[r]??0;e[r]=t&1?o|(n&ge)<<16:o|n&ge}function Ra(e,t){return(J(t)&65535)<<16|J(e)&65535}function Ta(e,t){return(re(t)&ge)<<16|re(e)&ge}function J(e){const t=Math.round(e);if(t<-32768||t>32767)throw new Error(`Text glyph offset ${e} is outside the signed 16-bit range`);return t}function re(e){const t=Math.round(e);if(t<0||t>ge)throw new Error(`Text glyph value ${e} is outside the unsigned 16-bit range`);return t}function Fe(){return globalThis.performance?.now()??Date.now()}class ba{resources;strategy;sourceBatchIndex;rowIndexBase;glyphIndexBase;rowCount;glyphCount;stats;props;destroySource;destroyed=!1;constructor(t,n){this.props=t,this.resources=n.resources,this.strategy=t.strategy,this.sourceBatchIndex=n.sourceBatchIndex,this.rowIndexBase=n.rowIndexBase,this.glyphIndexBase=n.glyphIndexBase,this.rowCount=n.rowCount,this.destroySource=n.destroySource,this.glyphCount=t.strategy==="attribute"?t.state.glyphLayout.glyphCount:t.state.glyphCount,this.stats=Ia(t,n.rowCount)}destroy(){this.destroyed||(this.destroyed=!0,Ca(this.props),this.destroySource?.())}getInternalProps(){return this.props}}function nt(e,t){return new ba(e,{sourceBatchIndex:0,rowIndexBase:0,glyphIndexBase:0,...t})}function or(e){return e.getInternalProps()}function Ia(e,t){if(e.strategy==="attribute"){const r=e.state;return{strategy:e.strategy,rowCount:t,glyphCount:r.glyphLayout.glyphCount,sourceBatchCount:1,renderBatchCount:r.renderBatches.length,preparationTimeMs:r.glyphAttributeBuildTimeMs,retainedByteLength:r.glyphAttributeByteLength,transientByteLength:0}}const n=e.state;return{strategy:e.strategy,rowCount:t,glyphCount:n.glyphCount,sourceBatchCount:1,renderBatchCount:n.renderBatches.length,preparationTimeMs:n.glyphAttributeBuildTimeMs+n.compactStreamBuildTimeMs,retainedByteLength:n.glyphAttributeByteLength+n.compactStreamByteLength+n.rowStorageByteLength+n.glyphDefinitionStorageByteLength,transientByteLength:n.transientComputeInputByteLength}}function Ca(e){if(e.strategy==="attribute"){e.state.destroy();return}e.state.destroy()}class Aa{device;data;model;pickingModel;modelProps;destroyed=!1;constructor(t,n){this.device=t,this.data=rn(n.data),this.modelProps=n.modelProps,this.model=nn(t,this.data,n.modelProps),this.pickingModel=n.pickingModel}get stats(){return Ba(this.data)}get batches(){return this.data}draw(t){return this.model.draw(t)}drawPicking(t){return(this.pickingModel??this.model).draw(t)}appendData(t){ar(this.model,t),this.data.push(t)}setProps(t){const n=t.data?rn(t.data):this.data,r=t.modelProps??this.modelProps;if(t.data!==void 0||t.modelProps!==void 0){const o=nn(this.device,n,r),a=this.model;this.data=n,this.modelProps=r,this.model=o,a.destroy()}t.pickingModel!==void 0&&t.pickingModel!==this.pickingModel&&(this.pickingModel?.destroy(),this.pickingModel=t.pickingModel)}destroy(){this.destroyed||(this.destroyed=!0,this.pickingModel?.destroy(),this.pickingModel=void 0,this.model.destroy())}}function va(e){return e.model}function nn(e,t,n){const r=t[0],o=or(r);let a;switch(o.strategy){case"attribute":{a=new No(e,{...o.modelProps,...n,attributeState:o.state});break}case"dictionary":{a=new jo(e,{...o.modelProps,...n,storageState:o.state});break}case"storage-row-indexed":{a=new Wo(e,{...o.modelProps,...n,storageState:o.state});break}case"storage":{a=new $n(e,{...o.modelProps,...n,storageState:o.state});break}}for(const i of t.slice(1))ar(a,i);return a}function ar(e,t){const n=or(t);switch(n.strategy){case"attribute":e.addState(n.state);break;case"dictionary":e.addState(n.state);break;case"storage":case"storage-row-indexed":e.addState(n.state);break}}function rn(e){return"strategy"in e?[e]:[...e]}function Ba(e){return{strategy:e[0].strategy,rowCount:e.reduce((n,r)=>n+r.rowCount,0),glyphCount:e.reduce((n,r)=>n+r.glyphCount,0),sourceBatchCount:e.length,renderBatchCount:e.reduce((n,r)=>n+r.stats.renderBatchCount,0),preparationTimeMs:e.reduce((n,r)=>n+r.stats.preparationTimeMs,0),retainedByteLength:e.reduce((n,r)=>n+r.stats.retainedByteLength,0),transientByteLength:e.reduce((n,r)=>n+r.stats.transientByteLength,0)}}class on{device;fontAtlas;atlasTexture;destroyed=!1;constructor(t,n){this.device=t,this.fontAtlas=n.fontAtlas,this.atlasTexture=new Pn(t,{id:`${n.id||"text"}-atlas`,dimension:"2d-array",sampler:{minFilter:"linear",magFilter:"linear"},data:[...n.fontAtlas.pages]})}destroy(){this.destroyed||(this.destroyed=!0,this.atlasTexture.destroy())}}class Ea{cache=new Map;limit;constructor(t){this.limit=t}get(t){const n=this.cache.get(t);if(n!==void 0)return this.cache.delete(t),this.cache.set(t,n),n}set(t,n){for(this.cache.has(t)&&this.cache.delete(t),this.cache.set(t,n);this.cache.size>this.limit;){const r=this.cache.keys().next().value;if(r===void 0)break;this.cache.delete(r)}}}const Pa={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:Ua(),fontSize:64,buffer:4},Le=1024,an=.9,sn=.3,Oa=3;let gt=new Ea(Oa);function Ga(e){return{...Pa,...e}}function Da(e){const{settings:t,cacheKey:n,renderSettings:r}=e;if(n===void 0)return ln(e,new Set(t.characterSet));const o=Ma(n,t.characterSet),a=gt.get(n);if(a&&o.size===0)return{...a,renderSettings:r};const i=ln(e,o,a);return gt.set(n,i),i}function ln(e,t,n){const{settings:r,renderSettings:o,createRenderer:a}=e,{fontFamily:i,fontWeight:s,fontSize:l,buffer:c}=r;let u=n?.pages[0];u||(u=La(Le),u.width=Le);const f=u.getContext("2d",{willReadFrequently:!0});if(!f)throw new Error("Font atlas builders require a 2D canvas context");cn(f,i,l,s);const g=R=>Va(f,l,R),h=a?.(g),{mapping:m,canvasHeight:y,xOffset:d,yOffsetMin:w,yOffsetMax:x}=ga({measureText:R=>h?h.measure(R):g(R),buffer:c,characterSet:t,maxCanvasWidth:Le,...n&&{mapping:n.mapping,xOffset:n.xOffset,yOffsetMin:n.yOffsetMin,yOffsetMax:n.yOffsetMax}});if(u.height!==y){const R=u.height>0?f.getImageData(0,0,u.width,u.height):null;u.height=y,R&&f.putImageData(R,0,0)}cn(f,i,l,s),_a(f,t,m,h);const S=h?h.measure():g();return{baselineOffset:(S.ascent-S.descent)/2,lineHeight:l,xOffset:d,yOffsetMin:w,yOffsetMax:x,mapping:m,renderSettings:o,pages:[u],width:u.width,height:u.height}}function _a(e,t,n,r){if(!r){for(const o of t){const a=n[o];e.fillText(o,a.x,a.y+a.anchorY)}return}for(const o of t){const a=n[o],i=a.width,{data:s,left:l=0,top:c=0,layoutOffsetX:u}=r.draw(o),f=a.x-l,g=a.y-c,h=Math.max(0,Math.round(f)),m=Math.max(0,Math.round(g)),y=Math.min(s.width,e.canvas.width-h),d=Math.min(s.height,e.canvas.height-m);e.putImageData(s,h,m,0,0,y,d),a.x=h,a.y=m,a.width=y,a.height=d,a.anchorX+=y/2-l-i/2,a.anchorY+=c,a.layoutOffsetX=u??(a.layoutOffsetX??0)+h-f-l,a.layoutOffsetY=(a.layoutOffsetY??0)+m-g-c}}function Ma(e,t){const n=typeof t=="string"?new Set(Array.from(t)):new Set(t),r=gt.get(e);if(!r)return n;for(const o in r.mapping)n.delete(o);return n}function cn(e,t,n,r){e.font=`${r} ${n}px ${t}`,e.fillStyle="#000",e.textBaseline="alphabetic",e.textAlign="left"}function Va(e,t,n){if(n===void 0){const o=e.measureText("A");return o.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(o.fontBoundingBoxAscent),descent:Math.ceil(o.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:t*an,descent:t*sn}}const r=e.measureText(n);return r.actualBoundingBoxAscent?{advance:r.width,width:Math.ceil(r.actualBoundingBoxRight-r.actualBoundingBoxLeft),ascent:Math.ceil(r.actualBoundingBoxAscent),descent:Math.ceil(r.actualBoundingBoxDescent)}:{advance:r.width,width:r.width,ascent:t*an,descent:t*sn}}function La(e){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(e,0);if(typeof document>"u")throw new Error("Font atlas builders require OffscreenCanvas or a browser-like document");return document.createElement("canvas")}function Ua(){const e=[];for(let t=32;t<128;t++)e.push(String.fromCharCode(t));return e}const Te=1e20;class Fa{constructor({fontSize:t=24,buffer:n=3,radius:r=8,cutoff:o=.25,fontFamily:a="sans-serif",fontWeight:i="normal",fontStyle:s="normal",lang:l=null}={}){this.buffer=n,this.cutoff=o,this.radius=r,this.lang=l;const c=this.size=t+n*4,u=this._createCanvas(c),f=this.ctx=u.getContext("2d",{willReadFrequently:!0});f.font=`${s} ${i} ${t}px ${a}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle="black",this.gridOuter=new Float64Array(c*c),this.gridInner=new Float64Array(c*c),this.f=new Float64Array(c),this.z=new Float64Array(c+1),this.v=new Uint16Array(c)}_createCanvas(t){const n=document.createElement("canvas");return n.width=n.height=t,n}draw(t){const{width:n,actualBoundingBoxAscent:r,actualBoundingBoxDescent:o,actualBoundingBoxLeft:a,actualBoundingBoxRight:i}=this.ctx.measureText(t),s=Math.ceil(r),l=0,c=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(i-a))),u=Math.min(this.size-this.buffer,s+Math.ceil(o)),f=c+2*this.buffer,g=u+2*this.buffer,h=Math.max(f*g,0),m=new Uint8ClampedArray(h),y={data:m,width:f,height:g,glyphWidth:c,glyphHeight:u,glyphTop:s,glyphLeft:l,glyphAdvance:n};if(c===0||u===0)return y;const{ctx:d,buffer:w,gridInner:x,gridOuter:S}=this;this.lang&&(d.lang=this.lang),d.clearRect(w,w,c,u),d.fillText(t,w,w+s);const R=d.getImageData(w,w,c,u);S.fill(Te,0,h),x.fill(0,0,h);for(let T=0;T<u;T++)for(let b=0;b<c;b++){const A=R.data[4*(T*c+b)+3]/255;if(A===0)continue;const C=(T+w)*f+b+w;if(A===1)S[C]=0,x[C]=Te;else{const I=.5-A;S[C]=I>0?I*I:0,x[C]=I<0?I*I:0}}un(S,0,0,f,g,f,this.f,this.v,this.z),un(x,w,w,c,u,f,this.f,this.v,this.z);for(let T=0;T<h;T++){const b=Math.sqrt(S[T])-Math.sqrt(x[T]);m[T]=Math.round(255-255*(b/this.radius+this.cutoff))}return y}}function un(e,t,n,r,o,a,i,s,l){for(let c=t;c<t+r;c++)fn(e,n*a+c,a,o,i,s,l);for(let c=n;c<n+o;c++)fn(e,c*a+t,1,r,i,s,l)}function fn(e,t,n,r,o,a,i){a[0]=0,i[0]=-Te,i[1]=Te,o[0]=e[t];for(let s=1,l=0,c=0;s<r;s++){o[s]=e[t+s*n];const u=s*s;do{const f=a[l];c=(o[s]-o[f]+u-f*f)/(s-f)/2}while(c<=i[l]&&--l>-1);l++,a[l]=s,i[l]=c,i[l+1]=Te}for(let s=0,l=0;s<r;s++){for(;i[l+1]<s;)l++;const c=a[l],u=s-c;e[t+s*n]=o[c]+u*u}}const za={cutoff:.25,radius:12,smoothing:.1};function dl(e={}){const{cutoff:t,radius:n,smoothing:r}={...za,...e},o=Ga(e),a=Math.ceil(n*(1-t)),i=Math.floor(Le/2-o.fontSize);o.buffer=Math.max(o.buffer,Math.min(a,i));const{fontFamily:s,fontWeight:l,fontSize:c,buffer:u}=o;return Da({settings:o,cacheKey:`sdf ${s} ${l} ${c} ${u} ${n} ${t}`,renderSettings:{mode:"sdf",threshold:1-t,smoothing:Math.max(0,r)},createRenderer:f=>({measure:f,draw:ka({fontFamily:s,fontWeight:l,fontSize:c,buffer:u,radius:n,cutoff:t})})})}function ka({fontSize:e,buffer:t,radius:n,cutoff:r,fontFamily:o,fontWeight:a}){const i=new Fa({fontSize:e,buffer:t,radius:n,cutoff:r,fontFamily:o,fontWeight:`${a}`});return s=>{const{data:l,width:c,height:u}=i.draw(s),f=new ImageData(c,u);for(let g=0;g<l.length;g++)f.data[4*g+3]=l[g];return{data:f,left:t,top:t}}}const Na=24,dn=16,$a=12;function ir(e){return e!=null&&typeof e=="object"&&"type"in e&&e.type instanceof xe&&"data"in e&&Array.isArray(e.data)}function He(e){return P.isDictionary(e)&&e.dictionary instanceof xe&&fr(e.indices)}function sr(e){return e!=null&&typeof e=="object"&&"type"in e&&He(e.type)&&"data"in e&&Array.isArray(e.data)}function qe(e){return ir(e)||sr(e)}function lr(e){return Number(e.typeId)===Na}function _t(e){return e!=null&&typeof e=="object"&&"type"in e&&lr(e.type)&&"data"in e&&Array.isArray(e.data)}function Ya(e){return P.isDictionary(e)&&lr(e.dictionary)&&fr(e.indices)}function cr(e){return e!=null&&typeof e=="object"&&"type"in e&&Ya(e.type)&&"data"in e&&Array.isArray(e.data)}function Xa(e){return qe(e)||_t(e)||cr(e)}function ur(e){if(qe(e))return e;if(_t(e))return new Q(e.data.map(o=>Wa(o)));const t=e.type,n=new ho(new xe,t.indices,t.id,t.isOrdered),r=e.data.map(o=>{const a=o,i=a.dictionary;return new Bn(n,a.offset,a.length,a.nullCount,[a.valueOffsets,a.values,a.nullBitmap,a.typeIds],[...a.children??[]],ur(i))});return new Q(r)}function Wa(e){const t=e.values,n=new Int32Array(e.length+1),r=Ha(e);let o=0;for(let i=0;i<e.length;i++)ht(e,i)&&(o+=gn(e,t,i).byteLength),n[i+1]=o;const a=new Uint8Array(o);for(let i=0;i<e.length;i++)ht(e,i)&&a.set(gn(e,t,i),n[i]);return new Bn(new xe,0,e.length,e.nullCount,[n,a,r])}function gn(e,t,n){const r=(e.offset+n)*dn,o=new DataView(t.buffer,t.byteOffset+r,dn),a=o.getInt32(0,!0);if(a<=$a)return t.subarray(r+4,r+4+a);const i=o.getInt32(8,!0),s=o.getInt32(12,!0);return e.variadicBuffers[i].subarray(s,s+a)}function Ha(e){if(e.nullCount===0||!e.nullBitmap)return;const t=new Uint8Array(Math.ceil(e.length/8));for(let n=0;n<e.length;n++)ht(e,n)&&(t[n>>3]|=1<<(n&7));return t}function ht(e,t){if(e.nullCount===0||!e.nullBitmap)return!0;const n=e.offset+t;return(e.nullBitmap[n>>3]&1<<(n&7))!==0}function Mt(e){const t=[];let n=0,r=0;for(const o of e.data){const a=o.valueOffsets,i=o.values;if(!a||!i)continue;const s=n+o.length,l=a[0]??0,c=a[o.length]??l,u=Math.max(0,c-l),f=r+u;t.push({rowStart:n,rowEnd:s,byteStart:r,byteEnd:f,byteBase:r-l,rowOffset:o.offset??0,values:i,valueOffsets:a,nullBitmap:o.nullCount>0&&o.nullBitmap?o.nullBitmap:null}),n=s,r=f}return t}function qa(e){const t=xn(),n=Mt(e),r=n[n.length-1]?.byteEnd??0,o=new Uint32Array(e.length*2),a=new Uint32Array(Math.ceil(r/Uint32Array.BYTES_PER_ELEMENT)),i=new Uint8Array(a.buffer),s={startIndex:0,endIndex:0},l=new Array(e.length+1);l[0]=0;for(const c of n){const u=c.valueOffsets[0]??0,f=c.valueOffsets[c.rowEnd-c.rowStart]??u;i.set(c.values.subarray(u,f),c.byteStart)}for(let c=0;c<e.length;c++)Ce(n,c,s),o[c*2]=s.startIndex,o[c*2+1]=s.endIndex,l[c+1]=Math.max(l[c]??0,s.endIndex);return{startIndices:l,rowByteRanges:o,packedUtf8Bytes:a,byteLength:r,inputByteLength:o.byteLength+a.byteLength,textInputBuildTimeMs:xn()-t}}function Ce(e,t,n){n.startIndex=0,n.endIndex=0;const r=ei(e,t);if(!r)return n;const o=t-r.rowStart;if(!ni(r,o))return n;const a=r.valueOffsets[o]??0,i=r.valueOffsets[o+1]??a;return n.startIndex=r.byteBase+a,n.endIndex=r.byteBase+i,n}function Vt(e,t,n,r){let o=0,a=Math.max(0,t);const i=Math.max(a,n);for(;a<i;){const s=xr(e,a);if(!s)break;const l=a-s.byteBase,c=s.values[l]??0;let u=c,f=1;(c&128)===0?u=c:(c&224)===192?(u=(c&31)<<6|(s.values[l+1]??0)&63,f=2):(c&240)===224?(u=(c&15)<<12|((s.values[l+1]??0)&63)<<6|(s.values[l+2]??0)&63,f=3):(c&248)===240?(u=(c&7)<<18|((s.values[l+1]??0)&63)<<12|((s.values[l+2]??0)&63)<<6|(s.values[l+3]??0)&63,f=4):u=65533,a+f>i&&(u=65533,f=1),r(u),o++,a+=f}return o}function ja(e,t,n){let r=0,o=Math.max(0,t);const a=Math.max(o,n);for(;o<a;){const i=xr(e,o);if(!i)break;const s=Math.min(a,i.byteEnd);let l=o-i.byteBase;const c=s-i.byteBase;for(;l<c;)((i.values[l]??0)&192)!==128&&r++,l++;o=s}return r}function Ka({texts:e,fontAtlas:t,lineHeight:n,characterSet:r}){return ya(dr(e),{fontAtlas:t,lineHeight:n,characterSet:r})}function Za({texts:e,fontAtlas:t,lineHeight:n,characterSet:r}){return wa(dr(e),{fontAtlas:t,lineHeight:n,characterSet:r})}function Ja({texts:e,fontAtlas:t,lineHeight:n,characterSet:r}){return ma(Qa(e),{fontAtlas:t,lineHeight:n,characterSet:r})}function fr(e){return P.isInt(e)&&e.bitWidth<=32}function dr(e){if(e.type instanceof xe){const n=Mt(e),r={startIndex:0,endIndex:0};return{rowCount:e.length,countCodePoints:o=>(Ce(n,o,r),ja(n,r.startIndex,r.endIndex)),visitCodePoints:(o,a)=>(Ce(n,o,r),Vt(n,r.startIndex,r.endIndex,a))}}if(!He(e.type))throw new Error(`Arrow text vector must be Utf8 or Dictionary<Utf8>, got ${e.type}`);const t=gr(e);return{rowCount:e.length,countCodePoints:n=>hn(t,n).length,visitCodePoints:(n,r)=>{const o=hn(t,n);for(const a of o)r(a);return o.length}}}function Qa(e){const t=gr(e),n=t.reduce((o,a)=>o+a.dictionaryLength,0),r={startIndex:0,endIndex:0};return{rowCount:e.length,dictionaryValueCount:n,getRowDictionaryIndex:o=>{const a=pr(t,o);if(!a)return-1;const i=hr(a,o-a.rowStart);return i<0?-1:a.dictionaryValueBase+i},visitDictionaryCodePoints:(o,a)=>{const i=ti(t,o);if(!i)return;const s=o-i.dictionaryValueBase;Ce(i.dictionaryChunks,s,r),Vt(i.dictionaryChunks,r.startIndex,r.endIndex,a)}}}function gr(e){const t=[];let n=0,r=0;for(const o of e.data){const a=o.dictionary,i=a?.length??0,s=n+o.length;t.push({rowStart:n,rowEnd:s,rowOffset:o.offset??0,dictionaryValueBase:r,dictionaryLength:i,indices:o.values??null,nullBitmap:o.nullCount>0&&o.nullBitmap?o.nullBitmap:null,dictionaryChunks:a?Mt(a):[],dictionaryCodePointsByIndex:new Map}),n=s,r+=i}return t}function hn(e,t){const n=pr(e,t);if(!n)return[];const r=t-n.rowStart,o=hr(n,r);if(o<0)return[];const a=n.dictionaryCodePointsByIndex.get(o);if(a)return a;const i={startIndex:0,endIndex:0},s=[];return Ce(n.dictionaryChunks,o,i),Vt(n.dictionaryChunks,i.startIndex,i.endIndex,l=>s.push(l)),n.dictionaryCodePointsByIndex.set(o,s),s}function hr(e,t){if(!e.indices||!yr(e.nullBitmap,e.rowOffset,t))return-1;const n=e.rowEnd-e.rowStart,r=e.indices.length===n?t:e.rowOffset+t,o=Number(e.indices[r]??-1);return!Number.isInteger(o)||o<0||o>=e.dictionaryLength?-1:o}function xn(){return globalThis.performance?.now()??Date.now()}function ei(e,t){for(const n of e)if(t>=n.rowStart&&t<n.rowEnd)return n;return null}function xr(e,t){for(const n of e)if(t>=n.byteStart&&t<n.byteEnd)return n;return null}function pr(e,t){for(const n of e)if(t>=n.rowStart&&t<n.rowEnd)return n;return null}function ti(e,t){for(const n of e)if(t>=n.dictionaryValueBase&&t<n.dictionaryValueBase+n.dictionaryLength)return n;return null}function ni(e,t){return yr(e.nullBitmap,e.rowOffset,t)}function yr(e,t,n){if(!e)return!0;const r=t+n;return((e[r>>3]??0)&1<<(r&7))!==0}const ce="glyphOffsets",ue="glyphFrames",fe="glyphPages",ae="glyphClipRects",de="rowIndices",wr="expandedGlyphVertexData",mr=Uint32Array.BYTES_PER_ELEMENT*2,ze=Uint32Array.BYTES_PER_ELEMENT*5,Sr=ze+Float32Array.BYTES_PER_ELEMENT*4,Rr=[0,0,0,255],Tr=0,br=32,xt=[0,0],ri=0,oi=0,ai=-1,pn=4294967295,ii=Uint32Array.BYTES_PER_ELEMENT*4,si=Uint32Array.BYTES_PER_ELEMENT*4;function li(e){if(e.labelTable.numRows!==e.texts.length)throw new Error("ArrowTextModel requires labelTable rows to match UTF-8 text rows");je(e.clipRects,e.texts.length),ye(e.labelTable,ce),ye(e.labelTable,ue),ye(e.labelTable,fe),ye(e.labelTable,ae),ye(e.labelTable,de);const t=yn(),n=Ka({texts:e.texts,fontAtlas:e.fontAtlas,lineHeight:e.lineHeight,characterSet:e.characterSet}),r=[],o={},a=mt(n.startIndices);for(const l of e.labelTable.schema.fields){const c=e.labelTable.getChild(l.name);if(c){if(l.name==="colors"&&Pr(c.type)){r.push(new Re(l.name,c.type.children[0].type,l.nullable,l.metadata)),o[l.name]=Wi(c,n.startIndices,e.color);continue}Br(c.type)&&(r.push(l),o[l.name]=qt(c,a,Hi(l.name,e)))}}r.push(ot(ce,new Qe,2)),r.push(ot(ue,new Oe,4)),r.push(new Re(fe,new Oe,!1)),e.clipRects&&r.push(ot(ae,new Qe,4)),r.push(new Re(de,new Ue,!1)),o[ce]=oe(new Qe,2,n.glyphOffsets),o[ue]=oe(new Oe,4,n.glyphFrames),o[fe]=le(new Oe,n.glyphPages),e.clipRects&&(o[ae]=qt(e.clipRects,a)),o[de]=le(new Ue,mt(n.startIndices,e.rowIndexBase));const i=ji(o),s=yn()-t;return{table:new F(new En(r,e.labelTable.schema.metadata),o),glyphLayout:n,characterSet:e.characterSet,attributeByteLength:i,glyphAttributeBuildTimeMs:s}}function ci(e){if(!e.sourceVectors)throw new Error("ArrowTextModel requires explicit sourceVectors for CPU glyph expansion");fi(e),di(e),gi(e);const{sourceVectors:t}=e,n={positions:t.positions};return t.colors&&(n.colors=t.colors),t.angles&&(n.angles=t.angles),t.sizes&&(n.sizes=t.sizes),t.pixelOffsets&&(n.pixelOffsets=t.pixelOffsets),{labelTable:new F(n),texts:t.texts,clipRects:t.clipRects}}function ke(e,t,n){const r=e.data[n];if(!r)throw new Error(`Arrow text ${t} source is missing batch ${n}`);return new Q([r])}function E(e){return Jr(e)}function Ir(e){const t=E(e);return t instanceof xe||He(t)}function ui(e){return He(E(e))}function fi(e){const t=E(e.texts),n=E(e.positions),r=e.colors?E(e.colors):void 0,o=e.angles?E(e.angles):void 0,a=e.sizes?E(e.sizes):void 0,i=e.pixelOffsets?E(e.pixelOffsets):void 0;if(!Ir(e.texts))throw new Error("ArrowTextModel texts must be GPUVector");if(!qe(e.sourceVectors.texts))throw new Error("ArrowTextModel sourceVectors.texts must be Utf8 or Dictionary<Utf8>");if(!Ct.compareTypes(e.sourceVectors.texts.type,t))throw new Error("ArrowTextModel sourceVectors.texts type must match GPU texts type");if(!P.isFixedSizeList(n)||n.listSize!==2||!(n.children[0]?.type instanceof D))throw new Error("ArrowTextModel positions must be GPUVector");if(r&&!Xi(r))throw new Error("ArrowTextModel colors must be GPUVector or GPUVector<List<FixedSizeList<Uint8>[4]>>");if(o&&!(o instanceof D))throw new Error("ArrowTextModel angles must be GPUVector");if(a&&!(a instanceof D))throw new Error("ArrowTextModel sizes must be GPUVector");if(i&&(!P.isFixedSizeList(i)||i.listSize!==2||!(i.children[0]?.type instanceof D)))throw new Error("ArrowTextModel pixelOffsets must be GPUVector")}function di(e){const n=[["positions",e.positions],["texts",e.texts],["colors",e.colors],["angles",e.angles],["sizes",e.sizes],["pixelOffsets",e.pixelOffsets],["clipRects",e.clipRects]].filter(([,a])=>a!==void 0),[r,o]=n[0];for(const[a,i]of n.slice(1))if(i.length!==o.length)throw new Error(`ArrowTextModel ${a} rows must match ${r} rows (${i.length} !== ${o.length})`)}function gi(e){const t=[["positions",e.positions,e.sourceVectors.positions],["texts",e.texts,e.sourceVectors.texts],["colors",e.colors,e.sourceVectors.colors],["angles",e.angles,e.sourceVectors.angles],["sizes",e.sizes,e.sourceVectors.sizes],["pixelOffsets",e.pixelOffsets,e.sourceVectors.pixelOffsets],["clipRects",e.clipRects,e.sourceVectors.clipRects]];for(const[n,r,o]of t){if(r&&!o)throw new Error(`ArrowTextModel ${n} GPU rows require matching sourceVectors rows`);if(!r&&o)throw new Error(`ArrowTextModel sourceVectors.${n} requires matching GPU rows`);!r||!o||Ae("ArrowTextModel",n,r,o)}}function Ae(e,t,n,r){if(r.length!==n.length)throw new Error(`${e} sourceVectors.${t} rows must match GPU rows (${r.length} !== ${n.length})`);if(r.data.length!==n.data.length)throw new Error(`${e} sourceVectors.${t} batch count must match GPU batches`);for(let o=0;o<r.data.length;o++)if(r.data[o].length!==n.data[o].length)throw new Error(`${e} sourceVectors.${t} batch ${o} rows must match GPU rows`)}function hi(e){if(!e.sourceVectors)throw new Error("ArrowTextStorageModel requires explicit sourceVectors for CPU glyph expansion");yi(e),Lt(e),Ti(e);const{sourceVectors:t}=e,n=[];let r=e.rowIndexBase??0;for(let o=0;o<e.texts.data.length;o++){const a=e.texts.data[o],i=e.positions.data[o];n.push({batchRowIndexBase:r,rowStorageIndexBase:Ut(i,"positions",o),texts:ke(t.texts,"texts",o),clipRects:t.clipRects?ke(t.clipRects,"clipRects",o):void 0,positionsBuffer:i.buffer,colorsBuffer:e.colors?.data[o].buffer,anglesBuffer:e.angles?.data[o].buffer,sizesBuffer:e.sizes?.data[o].buffer,pixelOffsetsBuffer:e.pixelOffsets?.data[o].buffer,textAnchorsBuffer:e.textAnchors?.data[o].buffer,alignmentBaselinesBuffer:e.alignmentBaselines?.data[o].buffer}),r+=a.length}return{texts:t.texts,batches:n}}function xi(e){if(!e.sourceVectors)throw new Error("ArrowTextDictionaryStorageModel requires explicit sourceVectors for compressed dictionary glyph layout");bi(e),Lt(e,"ArrowTextDictionaryStorageModel"),Ii(e);const{sourceVectors:t}=e,n=[];let r=e.rowIndexBase??0;for(let o=0;o<e.texts.data.length;o++){const a=e.texts.data[o],i=e.positions.data[o];n.push({batchRowIndexBase:r,rowStorageIndexBase:Ut(i,"positions",o),texts:ke(t.texts,"texts",o),clipRects:t.clipRects?ke(t.clipRects,"clipRects",o):void 0,positionsBuffer:i.buffer,colorsBuffer:e.colors?.data[o].buffer,anglesBuffer:e.angles?.data[o].buffer,sizesBuffer:e.sizes?.data[o].buffer,pixelOffsetsBuffer:e.pixelOffsets?.data[o].buffer,textAnchorsBuffer:e.textAnchors?.data[o].buffer,alignmentBaselinesBuffer:e.alignmentBaselines?.data[o].buffer}),r+=a.length}return{texts:t.texts,batches:n}}function pi(e,t){wi(t),Lt(t,"TextStorageModel");const n=t.textBatches??mi(e,t);if(n.length!==t.texts.data.length)throw new Error("TextStorageModel textBatches must match texts GPUVector batch count");const r=[];let o=t.rowIndexBase??0;for(let a=0;a<t.texts.data.length;a++){const i=t.texts.data[a],s=t.positions.data[a],l=n[a];if(!l)throw new Error(`TextStorageModel textBatches is missing batch ${a}`);if(l.rowCount!==i.length)throw new Error("TextStorageModel textBatches rows must match texts GPU rows");r.push({...l,batchRowIndexBase:o,rowStorageIndexBase:Ut(s,"positions",a),positionsBuffer:s.buffer,colorsBuffer:t.colors?.data[a].buffer,anglesBuffer:t.angles?.data[a].buffer,sizesBuffer:t.sizes?.data[a].buffer,pixelOffsetsBuffer:t.pixelOffsets?.data[a].buffer,textAnchorsBuffer:t.textAnchors?.data[a].buffer,alignmentBaselinesBuffer:t.alignmentBaselines?.data[a].buffer,clipRectsBuffer:t.clipRects?Ri(t.clipRects,a):void 0}),o+=i.length}return{batches:r}}function yi(e){const t=E(e.texts),n=E(e.positions),r=e.colors?E(e.colors):void 0,o=e.angles?E(e.angles):void 0,a=e.sizes?E(e.sizes):void 0,i=e.pixelOffsets?E(e.pixelOffsets):void 0,s=e.textAnchors?E(e.textAnchors):void 0,l=e.alignmentBaselines?E(e.alignmentBaselines):void 0;if(!Ir(e.texts))throw new Error("ArrowTextStorageModel texts must be GPUVector");if(!qe(e.sourceVectors.texts))throw new Error("ArrowTextStorageModel sourceVectors.texts must be Utf8 or Dictionary<Utf8>");if(!Ct.compareTypes(e.sourceVectors.texts.type,t))throw new Error("ArrowTextStorageModel sourceVectors.texts type must match GPU texts type");if(!P.isFixedSizeList(n)||n.listSize!==2||!(n.children[0]?.type instanceof D))throw new Error("ArrowTextStorageModel positions must be GPUVector");if(r&&(!P.isFixedSizeList(r)||r.listSize!==4||!(r.children[0]?.type instanceof Y)))throw new Error("ArrowTextStorageModel colors must be GPUVector");if(o&&!(o instanceof D))throw new Error("ArrowTextStorageModel angles must be GPUVector");if(a&&!(a instanceof D))throw new Error("ArrowTextStorageModel sizes must be GPUVector");if(i&&(!P.isFixedSizeList(i)||i.listSize!==2||!(i.children[0]?.type instanceof D)))throw new Error("ArrowTextStorageModel pixelOffsets must be GPUVector");if(s&&!(s instanceof Y))throw new Error("ArrowTextStorageModel textAnchors must be GPUVector");if(l&&!(l instanceof Y))throw new Error("ArrowTextStorageModel alignmentBaselines must be GPUVector");const c=e.sourceVectors.clipRects;je(c,e.texts.length)}function wi(e){zo(e)}function mi(e,t){return t.texts.data.map((n,r)=>{if(n.byteOffset!==0||n.byteStride!==1)throw new Error("TextStorageModel GPUVector UTF-8 batches must be zero-offset byte buffers");const{valueOffsets:o,nullBitmap:a,valueByteLength:i}=n;if(!o||i===void 0)throw new Error("TextStorageModel GPUVector UTF-8 batches require row offset metadata");const s=new Uint32Array(n.length*2),l=new Array(n.length+1);l[0]=0;for(let u=0;u<n.length;u++){const f=Si(a,u),g=f?o[u]??0:0,h=f?o[u+1]??g:g;s[u*2]=g,s[u*2+1]=h,l[u+1]=Math.max(l[u]??0,h)}const c=e.createBuffer({id:`${t.id||"text-storage-model"}-utf8-row-byte-ranges-${r}`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:s.byteLength>0?s:new Uint32Array(2)});return{rowCount:n.length,startIndices:l,rowByteRanges:s,rowByteRangesBuffer:c,utf8BytesBuffer:n.buffer,byteLength:i,inputByteLength:s.byteLength+i,ownsRowByteRangesBuffer:!0}})}function Si(e,t){return e?(e[t>>3]&1<<(t&7))!==0:!0}function Ri(e,t){const n=e.data[t];if(!n)throw new Error(`TextStorageModel clipRects is missing batch ${t}`);if(n.byteOffset!==0||n.byteStride!==Float32Array.BYTES_PER_ELEMENT*4)throw new Error("TextStorageModel GPUVector clipRects batches must be zero-offset packed Float32x4 buffers");return n.buffer}function Lt(e,t="ArrowTextStorageModel"){const r=[["positions",e.positions],["texts",e.texts],["colors",e.colors],["angles",e.angles],["sizes",e.sizes],["pixelOffsets",e.pixelOffsets],["textAnchors",e.textAnchors],["alignmentBaselines",e.alignmentBaselines],["clipRects",e.clipRects]].filter(([,i])=>i!==void 0),[o,a]=r[0];for(const[i,s]of r.slice(1)){if(s.length!==a.length)throw new Error(`${t} ${i} rows must match ${o} rows (${s.length} !== ${a.length})`);if(s.data.length!==a.data.length)throw new Error(`${t} ${i} batch count must match ${o} batch count`);for(let l=0;l<s.data.length;l++)if(s.data[l].length!==a.data[l].length)throw new Error(`${t} ${i} batch ${l} rows must match ${o}`)}}function Ti(e){if(Ae("ArrowTextStorageModel","texts",e.texts,e.sourceVectors.texts),e.clipRects&&!e.sourceVectors.clipRects)throw new Error("ArrowTextStorageModel clipRects GPU rows require matching sourceVectors rows");if(!e.clipRects&&e.sourceVectors.clipRects)throw new Error("ArrowTextStorageModel sourceVectors.clipRects requires matching GPU clipRects rows");e.clipRects&&e.sourceVectors.clipRects&&Ae("ArrowTextStorageModel","clipRects",e.clipRects,e.sourceVectors.clipRects)}function bi(e){const t=E(e.texts),n=E(e.positions),r=e.colors?E(e.colors):void 0,o=e.angles?E(e.angles):void 0,a=e.sizes?E(e.sizes):void 0,i=e.pixelOffsets?E(e.pixelOffsets):void 0,s=e.textAnchors?E(e.textAnchors):void 0,l=e.alignmentBaselines?E(e.alignmentBaselines):void 0;if(!ui(e.texts))throw new Error("ArrowTextDictionaryStorageModel texts must be GPUVector");if(!sr(e.sourceVectors.texts))throw new Error("ArrowTextDictionaryStorageModel sourceVectors.texts must be Dictionary<Utf8>");if(!Ct.compareTypes(e.sourceVectors.texts.type,t))throw new Error("ArrowTextDictionaryStorageModel sourceVectors.texts type must match GPU texts type");if(!P.isFixedSizeList(n)||n.listSize!==2||!(n.children[0]?.type instanceof D))throw new Error("ArrowTextDictionaryStorageModel positions must be GPUVector");if(r&&(!P.isFixedSizeList(r)||r.listSize!==4||!(r.children[0]?.type instanceof Y)))throw new Error("ArrowTextDictionaryStorageModel colors must be GPUVector");if(o&&!(o instanceof D))throw new Error("ArrowTextDictionaryStorageModel angles must be GPUVector");if(a&&!(a instanceof D))throw new Error("ArrowTextDictionaryStorageModel sizes must be GPUVector");if(i&&(!P.isFixedSizeList(i)||i.listSize!==2||!(i.children[0]?.type instanceof D)))throw new Error("ArrowTextDictionaryStorageModel pixelOffsets must be GPUVector");if(s&&!(s instanceof Y))throw new Error("ArrowTextDictionaryStorageModel textAnchors must be GPUVector");if(l&&!(l instanceof Y))throw new Error("ArrowTextDictionaryStorageModel alignmentBaselines must be GPUVector");const c=e.sourceVectors.clipRects;je(c,e.texts.length)}function Ii(e){if(Ae("ArrowTextDictionaryStorageModel","texts",e.texts,e.sourceVectors.texts),e.clipRects&&!e.sourceVectors.clipRects)throw new Error("ArrowTextDictionaryStorageModel clipRects GPU rows require matching sourceVectors rows");if(!e.clipRects&&e.sourceVectors.clipRects)throw new Error("ArrowTextDictionaryStorageModel sourceVectors.clipRects requires matching GPU clipRects rows");e.clipRects&&e.sourceVectors.clipRects&&Ae("ArrowTextDictionaryStorageModel","clipRects",e.clipRects,e.sourceVectors.clipRects)}function Ut(e,t,n){if(!Number.isFinite(e.byteStride)||e.byteStride<=0)throw new Error(`ArrowTextStorageModel ${t} batch ${n} has invalid byte stride`);const r=e.byteOffset/e.byteStride;if(!Number.isInteger(r))throw new Error(`ArrowTextStorageModel ${t} batch ${n} byte offset is not row aligned`);return r}function Ci(e,t){return{...Ai(e,t),textProps:t}}function Ai(e,t){const n=ci(t),r=Ft(t),o=la(t.uniforms,r.fontRenderSettings),a=li({labelTable:n.labelTable,texts:n.texts,clipRects:n.clipRects,fontAtlas:r.fontAtlas,lineHeight:r.lineHeight,characterSet:r.characterSet,rowIndexBase:t.rowIndexBase,color:t.color,angle:t.angle,size:t.size}),i=vi(t),s=Ie({device:e,recordOffsets:a.glyphLayout.startIndices,recordByteStride:n.clipRects?Sr:ze,resourceLabel:"ArrowTextModel expanded glyph vertex data"}),l=s.map(d=>Ei(e,t,{glyphTable:a,shaderLayout:i,generatedBufferBatch:d,rowIndexBase:0})),c=l[0];if(!c)throw new Error("ArrowTextModel requires at least one generated glyph render batch");const u=s.map((d,w)=>({rowStart:d.rowStart,rowEnd:d.rowEnd,glyphCount:d.recordCount,expandedGlyphVertexData:l[w].buffer})),f=c,{atlasTexture:g,ownsAtlasTexture:h}=Ke(e,t,r.fontAtlas),m={...t,vs:t.vs??(n.clipRects?_o:Do),fs:t.fs??Mo,uniforms:o,shaderLayout:i,bindings:{...t.bindings||{},fontAtlasTexture:g},attributes:{...t.attributes||{},[wr]:f.buffer},bufferLayout:[...t.bufferLayout||[],f.bufferLayout],vertexCount:t.vertexCount??6,instanceCount:a.glyphLayout.glyphCount,table:It(e,Bi(a.table,s),{shaderLayout:i}),tableCount:"none"};let y=!1;return{modelProps:m,glyphLayout:a.glyphLayout,glyphTable:a,expandedGlyphVertexData:f.buffer,renderBatches:u,atlasTexture:g,glyphAttributeBuildTimeMs:a.glyphAttributeBuildTimeMs,glyphAttributeByteLength:a.attributeByteLength,fontRenderSettings:r.fontRenderSettings,defaultFragmentShaderUniforms:o,mappingState:r,destroy:()=>{if(!y){y=!0,h&&g.destroy();for(const d of u)d.expandedGlyphVertexData.destroy();m.table?.destroy()}}}}function vi(e){return e.shaderLayout??(e.clipRects?Po:Vn)}function Bi(e,t){const n=new Set([ce,ue,fe,ae,de]),r=[],o={};for(const s of e.schema.fields){if(n.has(s.name))continue;const l=e.getChild(s.name);l&&(r.push(s),o[s.name]=l)}const a=new F(new En(r,new Map(e.schema.metadata)),o);if(!t||t.length<=1)return a;const i=t.flatMap(s=>a.slice(s.recordStart,s.recordEnd).batches);return new F(a.schema,i)}function Ei(e,t,{glyphTable:n,shaderLayout:r,generatedBufferBatch:o,rowIndexBase:a=0}){const{glyphLayout:i}=n,s=n.table.getChild(ae),l=s?Tt(s):void 0,c=l?Sr:ze,u=o.byteLength,f=new ArrayBuffer(Math.max(u,c)),g=new Int16Array(f),h=new Uint16Array(f),m=new Uint32Array(f),y=new Float32Array(f),d=mt(i.startIndices,a);for(let S=o.recordStart;S<o.recordEnd;S++){const R=S-o.recordStart,T=R*c/Int16Array.BYTES_PER_ELEMENT,b=R*c/Uint32Array.BYTES_PER_ELEMENT,A=R*c/Float32Array.BYTES_PER_ELEMENT,C=S*2,I=S*4;if(g[T]=i.glyphOffsets[C],g[T+1]=i.glyphOffsets[C+1],h[T+2]=i.glyphFrames[I],h[T+3]=i.glyphFrames[I+1],h[T+4]=i.glyphFrames[I+2],h[T+5]=i.glyphFrames[I+3],h[T+6]=i.glyphPages[S],m[b+4]=d[S],l){const z=S*4;y[A+5]=l[z],y[A+6]=l[z+1],y[A+7]=l[z+2],y[A+8]=l[z+3]}}const w=new Set(r.attributes.map(S=>S.name)),x=[];return w.has(ce)&&x.push({attribute:ce,format:"sint16x2",byteOffset:0}),w.has(ue)&&x.push({attribute:ue,format:"uint16x4",byteOffset:Int16Array.BYTES_PER_ELEMENT*2}),w.has(fe)&&x.push({attribute:fe,format:"uint16",byteOffset:Int16Array.BYTES_PER_ELEMENT*6}),w.has(de)&&x.push({attribute:de,format:"uint32",byteOffset:Int16Array.BYTES_PER_ELEMENT*8}),l&&w.has(ae)&&x.push({attribute:ae,format:"float32x4",byteOffset:ze}),{buffer:e.createBuffer({id:`${t.id||"arrow-text-model"}-expanded-glyph-vertex-data-${o.rowStart}`,usage:p.VERTEX|p.COPY_DST|p.COPY_SRC,data:new Uint8Array(f)}),bufferLayout:{name:wr,stepMode:"instance",byteStride:c,attributes:x},byteLength:u}}function Pi(e,t){if(e.type!=="webgpu")throw new Error("createArrowTextStorageState requires a WebGPU device");if(!Et(e))throw new Error(`createArrowTextStorageState requires at least ${Xn} storage buffer bindings per shader stage`);const n=hi(t),r=Ft(t),{atlasTexture:o,ownsAtlasTexture:a}=Ke(e,t,r.fontAtlas),i=!!(Pt(e)&&r.characterSet&&ir(n.texts)),s=t.rowIndexColumn===!0,l=s?vt:mr;let c,u,f,g=0,h=0,m=0,y=0,d=0,w=0,x=0,S=0;const R=[],T=[],b=[],A=[],C=zt(e,t);if(R.push(...C.ownedResources),w+=C.byteLength,i){const G=tr(r.characterSet,{fontAtlas:r.fontAtlas,lineHeight:r.lineHeight});f=G,u=be(e,t,G.glyphFrames),x=u.byteLength;for(const[V,O]of n.batches.entries()){const B=Ne(e,t,O,C,r.fontRenderSettings),U=qa(O.texts),v=yt(e,t,O.batchRowIndexBase,U.startIndices);T.push(v.buffer),d+=v.byteLength;const L=ct(e,{id:t.id},G.glyphMetrics),k=Kn(e,{id:t.id},G.glyphLookup),X=ut(e,{id:t.id},G.glyphPages),_=ft(e,{id:t.id},G.glyphKernings),ie=Ie({device:e,recordOffsets:U.startIndices,recordByteStride:l,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"ArrowTextStorageModel UTF-8 generated glyph vertex data"});for(const M of ie){const j=Fi(U,M),W=aa(e,{id:t.id},{utf8TextInput:j,baselineOffsetY:G.baselineOffsetY,glyphLookupCount:G.glyphLookup.length/2,labelCount:M.rowEnd-M.rowStart,batchRowIndexBase:M.rowStart,rowStorageIndexBase:O.rowStorageIndexBase+M.rowStart,alignment:wt(t,B,r.lineHeight)}),Ze=dt(e,{id:t.id},j.byteLength,s);Zn(e,{id:t.id},{utf8Input:W,glyphLookup:k,glyphMetrics:L,glyphPages:X,glyphKernings:_,generated:Ze,outputSlotCount:j.byteLength,labelCount:M.rowEnd-M.rowStart,alignment:{rowTextAnchorsBuffer:$(B.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:$(B.rowAlignmentBaselinesBuffer)}});const Je=pt(e,t,O.batchRowIndexBase,M);A.push({rowBindingBatchIndex:V,rowStart:M.rowStart,rowEnd:M.rowEnd,glyphIndexBase:M.recordStart,glyphCount:j.byteLength,compactGlyphVertexData:Ze.compactGlyphVertexData,storageRenderConfigBuffer:Je}),T.push(Je),d+=Je.byteLength,y+=Ze.byteLength,S+=W.byteLength,W.rowByteRangesBuffer.destroy(),W.utf8BytesBuffer.destroy(),W.expansionConfigBuffer.destroy()}b.push({...B,batchRowIndexBase:O.batchRowIndexBase,rowCount:O.texts.length,glyphCount:U.byteLength,rowGlyphStartsBuffer:v.buffer}),g+=U.byteLength,h+=U.textInputBuildTimeMs,m+=U.inputByteLength,w+=B.ownedByteLength,S+=k.byteLength+L.byteLength+X.byteLength+_.byteLength,R.push(...B.ownedResources),L.buffer.destroy(),k.buffer.destroy(),X.buffer.destroy(),_.buffer.destroy()}}else for(const[G,V]of n.batches.entries()){const O=Ne(e,t,V,C,r.fontRenderSettings),B=Za({texts:V.texts,fontAtlas:r.fontAtlas,lineHeight:r.lineHeight,characterSet:r.characterSet}),U=yt(e,t,V.batchRowIndexBase,B.startIndices);T.push(U.buffer),d+=U.byteLength,c??=B,u??=be(e,t,B.glyphFrames),G===0&&(x=u.byteLength);const v=ct(e,{id:t.id},B.glyphMetrics),L=ut(e,{id:t.id},B.glyphPages),k=ft(e,{id:t.id},B.glyphKernings),X=Ie({device:e,recordOffsets:B.startIndices,recordByteStride:l,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"ArrowTextStorageModel compact generated glyph vertex data"});for(const _ of X){const ie=Ui(B,_),M=oa(e,{id:t.id},ie,_.rowStart,wt(t,O,r.lineHeight),V.rowStorageIndexBase+_.rowStart),j=dt(e,{id:t.id},ie.glyphCount,s);sa(e,{id:t.id},{compactInput:M,glyphMetrics:v,glyphPages:L,glyphKernings:k,generated:j,glyphCount:ie.glyphCount,labelCount:_.rowEnd-_.rowStart,alignment:{rowTextAnchorsBuffer:$(O.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:$(O.rowAlignmentBaselinesBuffer),useRowTextAnchors:!!t.textAnchors,useRowAlignmentBaselines:!!t.alignmentBaselines}});const W=pt(e,t,V.batchRowIndexBase,_);A.push({rowBindingBatchIndex:G,rowStart:_.rowStart,rowEnd:_.rowEnd,glyphIndexBase:_.recordStart,glyphCount:ie.glyphCount,compactGlyphVertexData:j.compactGlyphVertexData,storageRenderConfigBuffer:W}),T.push(W),d+=W.byteLength,y+=j.byteLength,S+=M.byteLength,M.glyphRangesBuffer.destroy(),M.glyphIdsBuffer.destroy(),M.expansionConfigBuffer.destroy()}b.push({...O,batchRowIndexBase:V.batchRowIndexBase,rowCount:V.texts.length,glyphCount:B.glyphCount,rowGlyphStartsBuffer:U.buffer}),g+=B.glyphCount,h+=B.glyphStreamBuildTimeMs,m+=B.compactStreamByteLength,w+=O.ownedByteLength,S+=v.byteLength+L.byteLength+k.byteLength,R.push(...O.ownedResources),v.buffer.destroy(),L.buffer.destroy(),k.buffer.destroy()}u??=be(e,t,new Float32Array(4));let I=!1;return{glyphStream:c,atlasTexture:o,characterSet:r.characterSet,glyphCount:g,glyphAttributeBuildTimeMs:h,glyphAttributeByteLength:y+d,compactStreamBuildTimeMs:h,compactStreamByteLength:m,generatedRenderBufferByteLength:y,renderControlByteLength:d,rowStorageByteLength:w,glyphDefinitionStorageByteLength:x,transientComputeInputByteLength:S,hasGlyphRowIndices:s,fontRenderSettings:r.fontRenderSettings,batches:b,renderBatches:A,ownedRowBindingResources:R,ownedGlyphResources:T,glyphFramesBuffer:u.buffer,arrowAppendContext:{defaultBuffers:C,mappingState:r,useGpuUtf8Decode:i,utf8GlyphDefinitions:f},destroy:()=>{if(!I){I=!0,a&&o.destroy(),he(R),he(T),u.buffer.destroy();for(const G of A)G.compactGlyphVertexData.destroy()}}}}function Oi(e,t){if(e.type!=="webgpu")throw new Error("createTextStorageStateFromGPUVectors requires a WebGPU device");if(!Pt(e))throw new Error(`createTextStorageStateFromGPUVectors requires at least ${Wn} storage buffer bindings per shader stage`);const n=pi(e,t),r=Mi(t),o=r.characterSet??new Set(Object.keys(r.fontAtlas.mapping)),{atlasTexture:a,ownsAtlasTexture:i}=Ke(e,t,r.fontAtlas),s=tr(o,{fontAtlas:r.fontAtlas,lineHeight:r.lineHeight}),l=be(e,t,s.glyphFrames),c=t.rowIndexColumn===!0,u=c?vt:mr;let f=0,g=0,h=0,m=0,y=0,d=0;const w=[],x=[],S=[],R=[],T=zt(e,t);w.push(...T.ownedResources),y+=T.byteLength;for(const[A,C]of n.batches.entries()){const I=Ne(e,t,C,T,r.fontRenderSettings),z=yt(e,t,C.batchRowIndexBase,C.startIndices);x.push(z.buffer),m+=z.byteLength;const G=ct(e,{id:t.id},s.glyphMetrics),V=ut(e,{id:t.id},s.glyphPages),O=ft(e,{id:t.id},s.glyphKernings),B=Kn(e,{id:t.id},s.glyphLookup),U=Ie({device:e,recordOffsets:C.startIndices,recordByteStride:u,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"TextStorageModel GPUVector UTF-8 generated glyph vertex data"});for(const v of U){const L=zi(e,t,C,v),k=ia(e,{id:t.id},{rowByteRangesBuffer:L.rowByteRangesBuffer,utf8BytesBuffer:$(C.utf8BytesBuffer),inputByteLength:L.inputByteLength,baselineOffsetY:s.baselineOffsetY,glyphLookupCount:s.glyphLookup.length/2,labelCount:v.rowEnd-v.rowStart,batchRowIndexBase:v.rowStart,rowStorageIndexBase:C.rowStorageIndexBase+v.rowStart,outputByteBase:v.recordStart,alignment:wt(t,I,r.lineHeight)}),X=dt(e,{id:t.id},v.recordCount,c);Zn(e,{id:t.id},{utf8Input:k,glyphLookup:B,glyphMetrics:G,glyphPages:V,glyphKernings:O,generated:X,outputSlotCount:v.recordCount,labelCount:v.rowEnd-v.rowStart,alignment:{rowTextAnchorsBuffer:$(I.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:$(I.rowAlignmentBaselinesBuffer)}});const _=pt(e,t,C.batchRowIndexBase,v);R.push({rowBindingBatchIndex:A,rowStart:v.rowStart,rowEnd:v.rowEnd,glyphIndexBase:v.recordStart,glyphCount:v.recordCount,compactGlyphVertexData:X.compactGlyphVertexData,storageRenderConfigBuffer:_}),x.push(_),m+=_.byteLength,h+=X.byteLength,d+=k.byteLength,k.expansionConfigBuffer.destroy(),L.ownsRowByteRangesBuffer&&L.rowByteRangesBuffer.destroy()}S.push({...I,batchRowIndexBase:C.batchRowIndexBase,rowCount:C.rowCount,glyphCount:C.byteLength,rowGlyphStartsBuffer:z.buffer}),f+=C.byteLength,g+=C.inputByteLength,y+=I.ownedByteLength,d+=B.byteLength+G.byteLength+V.byteLength+O.byteLength,w.push(...I.ownedResources),G.buffer.destroy(),B.buffer.destroy(),V.buffer.destroy(),O.buffer.destroy(),C.ownsRowByteRangesBuffer&&C.rowByteRangesBuffer.destroy()}let b=!1;return{atlasTexture:a,characterSet:o,glyphCount:f,glyphAttributeBuildTimeMs:0,glyphAttributeByteLength:h+m,compactStreamBuildTimeMs:0,compactStreamByteLength:g,generatedRenderBufferByteLength:h,renderControlByteLength:m,rowStorageByteLength:y,glyphDefinitionStorageByteLength:l.byteLength,transientComputeInputByteLength:d,hasGlyphRowIndices:c,fontRenderSettings:r.fontRenderSettings,glyphFramesBuffer:l.buffer,batches:S,renderBatches:R,ownedRowBindingResources:w,ownedGlyphResources:x,destroy:()=>{if(!b){b=!0,i&&a.destroy(),he(w),he(x),l.buffer.destroy();for(const A of R)A.compactGlyphVertexData.destroy()}}}}function Gi(e,t){if(e.type!=="webgpu")throw new Error("createArrowTextDictionaryStorageState requires a WebGPU device");const n=xi(t),r=Ft(t),{atlasTexture:o,ownsAtlasTexture:a}=Ke(e,t,r.fontAtlas);let i,s=0,l=0,c=0,u=0,f=0,g=0,h=0,m=0;const y=[],d=[],w=[],x=[],S=zt(e,t);y.push(...S.ownedResources),h+=S.byteLength;for(const[b,A]of n.batches.entries()){const C=Ne(e,t,A,S,r.fontRenderSettings),I=Ja({texts:A.texts,fontAtlas:r.fontAtlas,lineHeight:r.lineHeight,characterSet:r.characterSet}),z=_i(I),G=rt(e,t,`row-dictionary-records-${A.batchRowIndexBase}`,z,new Uint32Array(2)),V=rt(e,t,`dictionary-glyph-ranges-${A.batchRowIndexBase}`,I.dictionaryGlyphRanges,new Uint32Array(2)),O=rt(e,t,`dictionary-glyph-records-${A.batchRowIndexBase}`,I.dictionaryGlyphRecords,new Uint32Array(2)),B=be(e,t,I.glyphFrames),U=Ie({device:e,recordOffsets:I.startIndices,recordByteStride:1,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"ArrowTextDictionaryStorageModel glyph instances"});for(const v of U){const L=Di(e,t,A.batchRowIndexBase,v);x.push({rowBindingBatchIndex:b,rowStart:v.rowStart,rowEnd:v.rowEnd,glyphIndexBase:v.recordStart,glyphCount:v.recordCount,dictionaryRenderConfigBuffer:L}),d.push(L),f+=L.byteLength}w.push({...C,batchRowIndexBase:A.batchRowIndexBase,rowCount:A.texts.length,glyphCount:I.glyphCount,rowDictionaryRecordsBuffer:G,dictionaryGlyphRangesBuffer:V,dictionaryGlyphRecordsBuffer:O,glyphFramesBuffer:B.buffer,dictionaryGlyphCount:I.dictionaryGlyphCount,dictionaryValueCount:I.dictionaryValueCount}),i??=I,s+=I.glyphCount,l+=I.dictionaryGlyphCount,c+=I.dictionaryValueCount,u+=I.glyphStreamBuildTimeMs,f+=z.byteLength+I.dictionaryGlyphRanges.byteLength+I.dictionaryGlyphRecords.byteLength,h+=C.ownedByteLength,m+=B.byteLength,y.push(...C.ownedResources),d.push(G,V,O,B.buffer)}let R=!1;return{glyphStream:i,atlasTexture:o,characterSet:r.characterSet,glyphCount:s,dictionaryGlyphCount:l,dictionaryValueCount:c,glyphAttributeBuildTimeMs:u,glyphAttributeByteLength:g,compactStreamBuildTimeMs:u,compactStreamByteLength:f,generatedRenderBufferByteLength:g,rowStorageByteLength:h,glyphDefinitionStorageByteLength:m,transientComputeInputByteLength:0,fontRenderSettings:r.fontRenderSettings,batches:w,renderBatches:x,ownedRowBindingResources:y,ownedDictionaryResources:d,destroy:()=>{R||(R=!0,a&&o.destroy(),he(y),he(d))}}}function Di(e,t,n,r){const o=new Uint32Array(si/Uint32Array.BYTES_PER_ELEMENT);return o[0]=r.recordStart,o[1]=r.rowStart,o[2]=r.rowEnd,o[3]=0,new ve(e,{id:`${t.id||"arrow-text-dictionary-storage-model"}-render-config-${n}-${r.rowStart}`,usage:p.UNIFORM|p.COPY_DST|p.COPY_SRC,data:o})}function pt(e,t,n,r){const o=new Uint32Array(ii/Uint32Array.BYTES_PER_ELEMENT);return o[0]=r.recordStart,o[1]=r.rowStart,o[2]=r.rowEnd,o[3]=0,new ve(e,{id:`${t.id||"arrow-text-storage-model"}-render-config-${n}-${r.rowStart}`,usage:p.UNIFORM|p.COPY_DST|p.COPY_SRC,data:o})}function yt(e,t,n,r){const o=new Uint32Array(r);return{buffer:e.createBuffer({id:`${t.id||"arrow-text-storage-model"}-row-glyph-starts-${n}`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:o.byteLength>0?o:new Uint32Array(1)}),byteLength:o.byteLength}}function _i(e){const t=e.rowDictionaryIndices.length,n=new Uint32Array((t+1)*2);for(let r=0;r<t;r++)n[r*2]=e.rowDictionaryIndices[r]??pn,n[r*2+1]=e.rowGlyphRanges[r*2]??0;return n[t*2]=pn,n[t*2+1]=e.glyphCount,n}function yn(){return globalThis.performance?.now()??Date.now()}function Ft(e){return Cr(e.fontAtlas,e.lineHeight??1)}function Mi(e){return Cr(e.fontAtlas,e.lineHeight??1)}function Cr(e,t){return{lineHeight:t*e.lineHeight,characterSet:new Set(Object.keys(e.mapping)),fontAtlas:e,fontRenderSettings:e.renderSettings}}function ye(e,t){if(e.getChild(t))throw new Error(`ArrowTextModel labelTable column "${t}" is reserved`)}function je(e,t){if(e){if(e.length!==t)throw new Error("ArrowTextModel clipRects rows must match UTF-8 text rows");if(!P.isFixedSizeList(e.type)||e.type.listSize!==4||!(e.type.children[0]?.type instanceof D))throw new Error("ArrowTextModel clipRects must be FixedSizeList<Float32>[4]")}}function zt(e,t){const n=t.id||"text-storage-model",r=K(e,`${n}-default-row-colors`,oe(new Y,4,new Uint8Array(t.color??Rr))),o=K(e,`${n}-default-row-angles`,le(new D,new Float32Array([t.angle??Tr]))),a=K(e,`${n}-default-row-sizes`,le(new D,new Float32Array([t.size??br]))),i=K(e,`${n}-default-row-pixel-offsets`,oe(new D,2,new Float32Array(t.pixelOffset??xt))),s=K(e,`${n}-default-row-text-anchors`,le(new Ue,new Uint32Array([Ar(t.textAnchor)]))),l=K(e,`${n}-default-row-alignment-baselines`,le(new Ue,new Uint32Array([vr(t.alignmentBaseline)]))),c=K(e,`${n}-default-row-clip-rects`,oe(new D,4,new Float32Array([0,0,-1,-1])));return{colorsBuffer:Z(r),anglesBuffer:Z(o),sizesBuffer:Z(a),pixelOffsetsBuffer:Z(i),textAnchorsBuffer:Z(s),alignmentBaselinesBuffer:Z(l),clipRectsBuffer:Z(c),byteLength:Uint8Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*2+Uint32Array.BYTES_PER_ELEMENT+Uint32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*4,ownedResources:[r,o,a,i,s,l,c]}}function Ne(e,t,n,r,o){const a=n.clipRects?Li(n.clipRects):void 0,i=a?K(e,`${t.id||"text-storage-model"}-row-clip-rects-${n.batchRowIndexBase}`,oe(new D,4,a.byteLength>0?a:new Float32Array(4))):void 0,s=i?Z(i):n.clipRectsBuffer?$(n.clipRectsBuffer):r.clipRectsBuffer,l=Vi(t,n.batchRowIndexBase,n.rowStorageIndexBase,o),c=new ve(e,{id:`${t.id||"text-storage-model"}-style-config-${n.batchRowIndexBase}`,usage:p.UNIFORM|p.COPY_DST|p.COPY_SRC,data:l}),u=[c,...i?[i]:[]];return{rowPositionsBuffer:n.positionsBuffer,rowStorageIndexBase:n.rowStorageIndexBase,rowColorsBuffer:n.colorsBuffer??r.colorsBuffer,rowAnglesBuffer:n.anglesBuffer??r.anglesBuffer,rowSizesBuffer:n.sizesBuffer??r.sizesBuffer,rowPixelOffsetsBuffer:n.pixelOffsetsBuffer??r.pixelOffsetsBuffer,rowTextAnchorsBuffer:n.textAnchorsBuffer??r.textAnchorsBuffer,rowAlignmentBaselinesBuffer:n.alignmentBaselinesBuffer??r.alignmentBaselinesBuffer,rowClipRectsBuffer:s,styleConfigBuffer:c,ownedResources:u,ownedByteLength:l.byteLength+(a?.byteLength??0)}}function K(e,t,n){return N(e,n,{name:t,id:t,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC})}function Z(e){const[t,...n]=e.data;if(!t||n.length>0)throw new Error(`Storage text vector "${e.name}" requires exactly one GPUData chunk`);const r=t.buffer;return r instanceof ve?r.buffer:r}function rt(e,t,n,r,o,a=p.STORAGE|p.COPY_DST|p.COPY_SRC){return e.createBuffer({id:`${t.id||"arrow-text-dictionary-storage-model"}-${n}`,usage:a,data:r.byteLength>0?r:o})}function he(e){for(const t of e)t.destroy()}function Vi(e,t,n,r){const o=new ArrayBuffer(80),a=new Float32Array(o),i=new Uint32Array(o),s=e.color??Rr;return a[0]=s[0]/255,a[1]=s[1]/255,a[2]=s[2]/255,a[3]=s[3]/255,a[4]=e.angle??Tr,a[5]=e.size??br,a[6]=(e.pixelOffset??xt)[0],a[7]=(e.pixelOffset??xt)[1],i[8]=e.colors?1:0,i[9]=e.angles?1:0,i[10]=e.sizes?1:0,i[11]=e.pixelOffsets?1:0,i[12]=e.clipRects?1:0,i[13]=t,i[14]=n,i[15]=0,a[16]=r.mode==="bitmap"?ai:r.threshold,a[17]=r.smoothing,i[18]=r.mode==="bitmap"?0:r.mode==="sdf"?1:2,a[19]=r.distanceRange??0,i}function wt(e,t,n){return{rowTextAnchorsBuffer:$(t.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:$(t.rowAlignmentBaselinesBuffer),useRowTextAnchors:!!e.textAnchors,useRowAlignmentBaselines:!!e.alignmentBaselines,textAnchor:Ar(e.textAnchor),alignmentBaseline:vr(e.alignmentBaseline),lineHeight:n}}function $(e){return e instanceof ve?e.buffer:e}function be(e,t,n){return{buffer:e.createBuffer({id:`${t.id||"arrow-text-storage-model"}-glyph-frames`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:n.byteLength>0?n:new Float32Array(4)}),byteLength:n.byteLength}}function Ke(e,t,n){return t.resources?{atlasTexture:t.resources.atlasTexture,ownsAtlasTexture:!1}:{atlasTexture:new Pn(e,{id:`${t.id||"text-model"}-atlas`,dimension:"2d-array",data:[...n.pages]}),ownsAtlasTexture:!0}}function Li(e){return je(e,e.length),new Float32Array(Tt(e))}function Ar(e){switch(e){case"middle":return 1;case"end":return 2;default:return ri}}function vr(e){switch(e){case"top":return 1;case"bottom":return 2;default:return oi}}function Ui(e,t){const n=t.rowEnd-t.rowStart,r=new Array(n+1),o=new Uint32Array(n*2);r[0]=0;for(let i=0;i<n;i++){const s=t.rowStart+i,l=e.startIndices[s]??t.recordStart,c=e.startIndices[s+1]??t.recordStart,u=l-t.recordStart,f=c-t.recordStart;o[i*2]=u,o[i*2+1]=f,r[i+1]=f}const a=ki(e.packedGlyphIds,t.recordStart,t.recordEnd);return{...e,startIndices:r,glyphCount:t.recordCount,labelGlyphRanges:o,packedGlyphIds:a,compactStreamByteLength:o.byteLength+a.byteLength,glyphStreamBuildTimeMs:0}}function Fi(e,t){const n=t.rowEnd-t.rowStart,r=new Uint32Array(n*2),o=new Array(n+1);o[0]=0;for(let i=0;i<n;i++){const s=t.rowStart+i,l=e.rowByteRanges[s*2]??0,c=e.rowByteRanges[s*2+1]??l,u=c>l&&l>=t.recordStart&&c<=t.recordEnd,f=u?l-t.recordStart:0,g=u?c-t.recordStart:f;r[i*2]=f,r[i*2+1]=g,o[i+1]=Math.max(o[i]??0,g)}const a=Yi(e.packedUtf8Bytes,t.recordStart,t.recordEnd);return{startIndices:o,rowByteRanges:r,packedUtf8Bytes:a,byteLength:t.recordCount,inputByteLength:r.byteLength+a.byteLength,textInputBuildTimeMs:0}}function zi(e,t,n,r){if(r.rowStart===0&&r.rowEnd===n.rowCount&&r.recordStart===0&&r.recordEnd===n.byteLength)return{rowByteRangesBuffer:n.rowByteRangesBuffer,inputByteLength:n.inputByteLength,ownsRowByteRangesBuffer:!1};const a=r.rowEnd-r.rowStart,i=new Uint32Array(a*2);for(let s=0;s<a;s++){const l=r.rowStart+s;i[s*2]=n.rowByteRanges[l*2]??0,i[s*2+1]=n.rowByteRanges[l*2+1]??i[s*2]}return{rowByteRangesBuffer:e.createBuffer({id:`${t.id||"text-storage-model"}-utf8-row-byte-ranges-${r.rowStart}`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:i.byteLength>0?i:new Uint32Array(2)}),inputByteLength:i.byteLength+r.recordCount,ownsRowByteRangesBuffer:!0}}function ki(e,t,n){const r=Math.max(0,n-t),o=new Uint32Array(Math.ceil(r/2));for(let a=0;a<r;a++){const i=Ni(e,t+a);$i(o,a,i)}return o}function Ni(e,t){const n=e[t>>1]??0;return t&1?n>>>16:n&65535}function $i(e,t,n){const r=t>>1,o=e[r]??0;e[r]=t&1?o|(n&65535)<<16:o|n&65535}function Yi(e,t,n){const r=Math.max(0,n-t),o=new Uint32Array(Math.ceil(r/Uint32Array.BYTES_PER_ELEMENT)),a=new Uint8Array(e.buffer,e.byteOffset,e.byteLength);return new Uint8Array(o.buffer).set(a.subarray(t,n)),o}function ot(e,t,n){return new Re(e,new yo(n,new Re("value",t,!1)),!1)}function Br(e){return jt(e)||P.isFixedSizeList(e)&&jt(e.children[0].type)}function Er(e){return!!e&&P.isFixedSizeList(e)&&e.listSize===4&&e.children[0]?.type instanceof Y}function Pr(e){return!!e&&P.isList(e)&&Er(e.children[0]?.type)}function Xi(e){return Er(e)||Pr(e)}function Wi(e,t,n){const r=t[t.length-1]??0,o=new Uint8Array(r*4);let a=0;for(const i of e.data){const s=i.valueOffsets,l=i.children[0],c=l?.children[0],u=c?.values;if(!s||!l||!c||!u)throw new Error("ArrowTextModel character colors require Arrow list offsets and values");if(n&&((l.nullCount??0)>0||(c.nullCount??0)>0))throw new Error("ArrowTextModel character colors do not support nullable nested color values");const f=s[0]??0,g=c.offset??0;for(let h=0;h<i.length;h++){const m=a+h,y=t[m]??0,d=t[m+1]??y,w=d-y;if(n&&!qi(i,h)){for(let R=y;R<d;R++)o.set(n,R*4);continue}const x=(s[h]??f)-f,S=(s[h+1]??x)-f;if(S-x!==w)throw new Error("ArrowTextModel character colors must provide one color per UTF-8 code point");o.set(u.subarray(g+x*4,g+S*4),y*4)}a+=i.length}return oe(new Y,4,o)}function Hi(e,t){switch(e){case"colors":return t.color;case"angles":return t.angle;case"sizes":return t.size;default:return}}function qi(e,t){if(e.nullCount===0||!e.nullBitmap)return!0;const n=(e.offset??0)+t;return((e.nullBitmap[n>>3]??0)&1<<(n&7))!==0}function le(e,t){return xo(po({type:e,length:t.length,data:t}))}function mt(e,t=0){const n=e[e.length-1]??0,r=new Uint32Array(n);for(let o=0;o<e.length-1;o++)r.fill(t+o,e[o],e[o+1]);return r}function ji(e){let t=0;for(const n of Object.values(e))Br(n.type)&&(t+=Tt(n).byteLength);return t}const Ki={positions:"positions",text:"texts",clipRects:"clipRects",colors:"colors",angles:"angles",sizes:"sizes",pixelOffsets:"pixelOffsets",textAnchors:"textAnchors",alignmentBaselines:"alignmentBaselines"};function Or(e,t){const n={...Ki,...t.columns},{sourceVectors:r}=t,o=N(e,r.positions,{name:n.positions,preserveDataChunks:!0}),a=N(e,r.texts,{name:n.text}),i=r.clipRects?N(e,r.clipRects,{name:n.clipRects,preserveDataChunks:!0}):void 0,s=r.colors?N(e,r.colors,{name:n.colors,format:P.isList(r.colors.type)?"vertex-list<unorm8x4>":"unorm8x4",preserveDataChunks:!0}):void 0,l=r.angles?N(e,r.angles,{name:n.angles,preserveDataChunks:!0}):void 0,c=r.sizes?N(e,r.sizes,{name:n.sizes,preserveDataChunks:!0}):void 0,u=r.pixelOffsets?N(e,r.pixelOffsets,{name:n.pixelOffsets,preserveDataChunks:!0}):void 0,f=r.textAnchors?N(e,r.textAnchors,{name:n.textAnchors,preserveDataChunks:!0}):void 0,g=r.alignmentBaselines?N(e,r.alignmentBaselines,{name:n.alignmentBaselines,preserveDataChunks:!0}):void 0;let h=!1;return{positions:o,texts:a,...i?{clipRects:i}:{},...s?{colors:s}:{},...l?{angles:l}:{},...c?{sizes:c}:{},...u?{pixelOffsets:u}:{},...f?{textAnchors:f}:{},...g?{alignmentBaselines:g}:{},sourceVectors:r,destroy:()=>{h||(h=!0,o.destroy(),a.destroy(),i?.destroy(),s?.destroy(),l?.destroy(),c?.destroy(),u?.destroy(),f?.destroy(),g?.destroy())}}}function Zi(e,t){return Ci(e,t)}function Ji(e,t){return{attributeState:Zi(e,t)}}function Gr(e,t){if(t.sourceVectors.colors&&P.isList(t.sourceVectors.colors.type))throw new Error("convertArrowTextToStorage requires row colors, not per-character colors");return Or(e,t)}function Qi(e,t){if(ts(e,t))try{return Oi(e,t)}catch(n){if(!ns(n))throw n}return Pi(e,t)}function es(e,t){const n=Qi(e,t),{sourceVectors:r,rowIndexColumn:o,...a}=t;return{...a,storageState:n}}function ts(e,t){return e.type==="webgpu"&&Pt(e)&&t.rowIndexColumn!==!0&&t.texts.format==="value-list<uint8>"}function ns(e){return e instanceof Error&&/row offset metadata|zero-offset byte buffers|textBatches|clipRects batches/.test(e.message)}function rs(e,t){if(!P.isDictionary(t.sourceVectors.texts.type))throw new Error("convertArrowTextToDictionary requires Dictionary<Utf8> text");return Gr(e,t)}function os(e,t){return Gi(e,t)}function as(e,t){const n=os(e,t),{sourceVectors:r,rowIndexColumn:o,...a}=t;return{...a,storageState:n}}const kt={renderMode:{expression:"textViewport.textFontRenderMode",kind:"float"},sdfThreshold:"textViewport.textSdfThreshold",sdfSmoothing:"textViewport.textSdfSmoothing",msdfDistanceRange:"textViewport.textMsdfDistanceRange"},Dr={renderMode:{expression:"textStorageStyleConfig.fontRenderMode",kind:"uint"},sdfThreshold:"textStorageStyleConfig.sdfThreshold",sdfSmoothing:"textStorageStyleConfig.sdfSmoothing",msdfDistanceRange:"textStorageStyleConfig.msdfDistanceRange"},wn=new WeakMap;function is(e,t){let n=wn.get(e);return n||(n=new Set,wn.set(e,n)),n.has(t)||(e.addShaderInjectionTarget({name:"TEXT_ATTRIBUTE_VERTEX_TRANSFORM",stage:"vertex",glsl:{parameters:"inout vec4 position, inout vec2 textureCoordinate, inout vec4 textColor, vec2 worldPosition, vec4 glyphFrame, vec2 corner, vec2 glyphSize, vec2 atlasSize"},wgsl:{parameters:"outputs: ptr<function, FragmentInputs>, worldPosition: vec2<f32>, glyphFrame: vec4<f32>, corner: vec2<f32>, glyphSize: vec2<f32>, atlasSize: vec2<f32>"}}),n.add(t)),e}const at={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:"clipRects",location:1,type:"vec4<f32>",stepMode:"instance"},{name:"colors",location:2,type:"vec4<f32>",stepMode:"instance"},{name:"angles",location:3,type:"f32",stepMode:"instance"},{name:"sizes",location:4,type:"f32",stepMode:"instance"},{name:"pixelOffsets",location:5,type:"vec2<f32>",stepMode:"instance"}],bindings:[{name:"texts",type:"read-only-storage",group:0,location:0},{name:"textAnchors",type:"read-only-storage",group:0,location:1},{name:"alignmentBaselines",type:"read-only-storage",group:0,location:2}]},ss={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:"glyphOffsets",location:1,type:"vec2<i32>",stepMode:"instance"},{name:"glyphFrames",location:2,type:"vec4<u32>",stepMode:"instance"},{name:"glyphPages",location:3,type:"u32",stepMode:"instance"},{name:"rowIndices",location:4,type:"u32",stepMode:"instance"},{name:"glyphClipRects",location:5,type:"vec4<f32>",stepMode:"instance"},{name:"colors",location:6,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},_r={attributes:[{name:"glyphOffsets",location:0,type:"vec2<i32>",stepMode:"instance"},{name:"glyphIndices",location:1,type:"vec2<u32>",stepMode:"instance"}],bindings:[]},ls={attributes:[..._r.attributes,{name:"glyphRowIndices",location:2,type:"u32",stepMode:"instance"}],bindings:[]},cs={attributes:[],bindings:[]},us=`struct TextViewportUniforms {
  cameraOffset : vec2<f32>,
  viewportScale : vec2<f32>,
  glyphWorldScale : f32,
  time : f32,
  clippingEnabled : f32,
  colorsEnabled : f32,
  textFontRenderMode : f32,
  textSdfThreshold : f32,
  textSdfSmoothing : f32,
  textMsdfDistanceRange : f32,
};

@group(0) @binding(auto) var<uniform> textViewport : TextViewportUniforms;
@group(0) @binding(auto) var fontAtlasTexture : texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler : sampler;
struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) positions : vec2<f32>,
  @location(1) glyphOffsets : vec2<i32>,
  @location(2) glyphFrames : vec4<u32>,
  @location(3) glyphPages : u32,
  @location(4) rowIndices : u32,
  @location(5) glyphClipRects : vec4<f32>,
  @location(6) colors : vec4<f32>,
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) textureCoordinate : vec2<f32>,
  @location(1) textColor : vec4<f32>,
  @interpolate(flat, either)
  @location(2) objectIndex : i32,
  @interpolate(flat)
  @location(3) atlasPage : u32,
};

struct PickingFragmentOutputs {
  @location(0) fragColor : vec4<f32>,
  @location(1) pickingColor : vec2<i32>,
};

fn getCorner(vertexIndex : u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

fn isGlyphVertexClipped(glyphVertexOffset : vec2<f32>, clipRect : vec4<f32>) -> bool {
  if (clipRect.z >= 0) {
    let clipMinX = clipRect.x;
    let clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    let clipMinY = clipRect.y;
    let clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

${Be({functionName:"getGlyphAlpha",textureCoordinate:"inputs.textureCoordinate",atlasPage:"inputs.atlasPage",settings:kt})}

@vertex
fn vertexMain(inputs : VertexInputs) -> FragmentInputs {
  var outputs : FragmentInputs;
  let corner = getCorner(inputs.vertexIndex % 6u);
  let glyphFrame = vec4<f32>(inputs.glyphFrames);
  let glyphOffset = vec2<f32>(inputs.glyphOffsets);
  let glyphSize = glyphFrame.zw;
  let glyphVertexOffset = glyphOffset + corner * glyphSize;
  let glyphWorldOffset = glyphVertexOffset * textViewport.glyphWorldScale;
  let worldPosition = inputs.positions + glyphWorldOffset;
  let clipPosition = (worldPosition - textViewport.cameraOffset) * textViewport.viewportScale;
  let atlasSize = vec2<f32>(textureDimensions(fontAtlasTexture));
  let atlasCorner = vec2<f32>(corner.x, 1.0 - corner.y);
  let atlasPixel = glyphFrame.xy + atlasCorner * glyphSize;

  outputs.Position = select(
    vec4<f32>(clipPosition, 0.0, 1.0),
    vec4<f32>(0.0),
    textViewport.clippingEnabled > 0.5 &&
    isGlyphVertexClipped(glyphVertexOffset, inputs.glyphClipRects)
  );
  outputs.textureCoordinate = atlasPixel / atlasSize;
  outputs.atlasPage = inputs.glyphPages;
  let neutralTextColor = vec4<f32>(0.78, 0.86, 0.96, 1.0);
  outputs.textColor = mix(neutralTextColor, inputs.colors, textViewport.colorsEnabled);
  outputs.objectIndex = i32(inputs.rowIndices);
  TEXT_ATTRIBUTE_VERTEX_TRANSFORM(
    &outputs,
    worldPosition,
    glyphFrame,
    corner,
    glyphSize,
    atlasSize
  );
  return outputs;
}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
  let glyphAlpha = getGlyphAlpha(inputs);
  let fragColor = vec4<f32>(inputs.textColor.rgb, inputs.textColor.a * glyphAlpha);
  return picking_filterHighlightColor(fragColor, inputs.objectIndex);
}

@fragment
fn fragmentPicking(inputs : FragmentInputs) -> PickingFragmentOutputs {
  if (getGlyphAlpha(inputs) <= 0.0) {
    discard;
  }
  var outputs : PickingFragmentOutputs;
  outputs.fragColor = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  outputs.pickingColor = picking_getPickingColor(inputs.objectIndex);
  return outputs;
}
`,Mr=`struct TextViewportUniforms {
  cameraOffset : vec2<f32>,
  viewportScale : vec2<f32>,
  glyphWorldScale : f32,
  time : f32,
  clippingEnabled : f32,
  colorsEnabled : f32,
};

@group(0) @binding(auto) var<uniform> textViewport : TextViewportUniforms;
@group(0) @binding(auto) var fontAtlasTexture : texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler : sampler;
@group(0) @binding(auto) var<storage, read> textRowPositions : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowColors : array<u32>;
@group(0) @binding(auto) var<storage, read> textRowAngles : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowSizes : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowPixelOffsets : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowClipRects : array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> textRowGlyphStarts : array<u32>;
@group(0) @binding(auto) var<storage, read> textGlyphFrames : array<vec4<f32>>;

struct TextStorageStyleConfig {
  constantColor : vec4<f32>,
  constantAngleDegrees : f32,
  constantSize : f32,
  constantPixelOffset : vec2<f32>,
  useRowColors : u32,
  useRowAngles : u32,
  useRowSizes : u32,
  useRowPixelOffsets : u32,
  hasClipRects : u32,
  batchRowIndexBase : u32,
  rowStorageIndexBase : u32,
  _padding : u32,
  sdfThreshold : f32,
  sdfSmoothing : f32,
  fontRenderMode : u32,
  msdfDistanceRange : f32,
};

@group(0) @binding(auto) var<uniform> textStorageStyleConfig : TextStorageStyleConfig;

struct TextStorageRenderConfig {
  glyphIndexBase : u32,
  rowStart : u32,
  rowEnd : u32,
  _padding : u32,
};

@group(0) @binding(auto) var<uniform> textStorageRenderConfig : TextStorageRenderConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex : u32,
  @location(0) glyphOffsets : vec2<i32>,
  @location(1) glyphIndices : vec2<u32>,
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) textureCoordinate : vec2<f32>,
  @location(1) textColor : vec4<f32>,
  @interpolate(flat, either)
  @location(2) objectIndex : i32,
  @interpolate(flat)
  @location(3) atlasPage : u32,
};

struct PickingFragmentOutputs {
  @location(0) fragColor : vec4<f32>,
  @location(1) pickingColor : vec2<i32>,
};

fn getCorner(vertexIndex : u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

fn unpackLowInt16(word : u32) -> i32 {
  return i32(word << 16u) >> 16;
}

fn unpackHighInt16(word : u32) -> i32 {
  return i32(word) >> 16;
}

fn unpackClipRect(words : vec4<f32>) -> vec4<f32> {
  return words;
}

fn isGlyphVertexClipped(glyphVertexOffset : vec2<f32>, clipRect : vec4<f32>) -> bool {
  if (clipRect.z >= 0) {
    let clipMinX = clipRect.x;
    let clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    let clipMinY = clipRect.y;
    let clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

fn unpackTextColor(colorWord : u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn rotateTextOffset(offset : vec2<f32>, angleDegrees : f32) -> vec2<f32> {
  if (angleDegrees == 0.0) {
    return offset;
  }
  let angleRadians = angleDegrees * 0.017453292519943295;
  let rotation = mat2x2<f32>(
    cos(angleRadians),
    sin(angleRadians),
    -sin(angleRadians),
    cos(angleRadians)
  );
  return rotation * offset;
}

fn findRowIndex(glyphIndex : u32) -> u32 {
  var low = textStorageRenderConfig.rowStart;
  var high = textStorageRenderConfig.rowEnd;
  loop {
    if (low >= high) {
      break;
    }
    let middle = (low + high) / 2u;
    let nextRowGlyphStart = textRowGlyphStarts[middle + 1u];
    if (nextRowGlyphStart <= glyphIndex) {
      low = middle + 1u;
    } else {
      high = middle;
    }
  }
  return low;
}

@vertex
fn vertexMain(inputs : VertexInputs) -> FragmentInputs {
  var outputs : FragmentInputs;
  let corner = getCorner(inputs.vertexIndex % 6u);
  let glyphFrame = textGlyphFrames[inputs.glyphIndices.x];
  let glyphOffset = vec2<f32>(inputs.glyphOffsets);
  let glyphSize = glyphFrame.zw;
  let glyphVertexOffset = glyphOffset + corner * glyphSize;
  let glyphIndex = textStorageRenderConfig.glyphIndexBase + inputs.instanceIndex;
  let rowIndex = findRowIndex(glyphIndex);
  let rowStorageIndex = rowIndex + textStorageStyleConfig.rowStorageIndexBase;
  var angleDegrees = textStorageStyleConfig.constantAngleDegrees;
  if (textStorageStyleConfig.useRowAngles != 0u) {
    angleDegrees = textRowAngles[rowStorageIndex];
  }
  var textSize = textStorageStyleConfig.constantSize;
  if (textStorageStyleConfig.useRowSizes != 0u) {
    textSize = textRowSizes[rowStorageIndex];
  }
  let styledGlyphVertexOffset = rotateTextOffset(
    glyphVertexOffset * (textSize / 32.0),
    angleDegrees
  );
  var pixelOffset = textStorageStyleConfig.constantPixelOffset;
  if (textStorageStyleConfig.useRowPixelOffsets != 0u) {
    pixelOffset = textRowPixelOffsets[rowStorageIndex];
  }
  let glyphWorldOffset =
    (styledGlyphVertexOffset + pixelOffset) * textViewport.glyphWorldScale;
  let labelPosition = textRowPositions[rowStorageIndex];
  let worldPosition = labelPosition + glyphWorldOffset;
  let clipPosition = (worldPosition - textViewport.cameraOffset) * textViewport.viewportScale;
  let atlasSize = vec2<f32>(textureDimensions(fontAtlasTexture));
  let atlasCorner = vec2<f32>(corner.x, 1.0 - corner.y);
  let atlasPixel = glyphFrame.xy + atlasCorner * glyphSize;
  var isClipped = false;
  if (textViewport.clippingEnabled > 0.5 && textStorageStyleConfig.hasClipRects != 0u) {
    let clipRect = unpackClipRect(textRowClipRects[rowIndex]);
    isClipped = isGlyphVertexClipped(glyphVertexOffset, clipRect);
  }

  outputs.Position = select(
    vec4<f32>(clipPosition, 0.0, 1.0),
    vec4<f32>(0.0),
    isClipped
  );
  outputs.textureCoordinate = atlasPixel / atlasSize;
  outputs.atlasPage = inputs.glyphIndices.y;
  outputs.textColor = textStorageStyleConfig.constantColor;
  if (textStorageStyleConfig.useRowColors != 0u) {
    outputs.textColor = unpackTextColor(textRowColors[rowStorageIndex]);
  }
  outputs.objectIndex = i32(textStorageStyleConfig.batchRowIndexBase + rowIndex);
  return outputs;
}

${Be({functionName:"getStorageGlyphAlpha",textureCoordinate:"inputs.textureCoordinate",atlasPage:"inputs.atlasPage",settings:Dr})}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
  let glyphAlpha = getStorageGlyphAlpha(inputs);
  let fragColor = vec4<f32>(inputs.textColor.rgb, inputs.textColor.a * glyphAlpha);
  return picking_filterHighlightColor(fragColor, inputs.objectIndex);
}

@fragment
fn fragmentPicking(inputs : FragmentInputs) -> PickingFragmentOutputs {
  if (getStorageGlyphAlpha(inputs) <= 0.0) {
    discard;
  }
  var outputs : PickingFragmentOutputs;
  outputs.fragColor = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  outputs.pickingColor = picking_getPickingColor(inputs.objectIndex);
  return outputs;
}
`,fs=Mr.replace("@location(1) glyphIndices : vec2<u32>,",`@location(1) glyphIndices : vec2<u32>,
  @location(2) glyphRowIndices : u32,`).replace("let rowIndex = findRowIndex(glyphIndex);","let rowIndex = inputs.glyphRowIndices;"),ds=`struct TextViewportUniforms {
  cameraOffset : vec2<f32>,
  viewportScale : vec2<f32>,
  glyphWorldScale : f32,
  time : f32,
  clippingEnabled : f32,
  colorsEnabled : f32,
};

@group(0) @binding(auto) var<uniform> textViewport : TextViewportUniforms;
@group(0) @binding(auto) var fontAtlasTexture : texture_2d_array<f32>;
@group(0) @binding(auto) var fontAtlasTextureSampler : sampler;
@group(0) @binding(auto) var<storage, read> textRowPositions : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowColors : array<u32>;
@group(0) @binding(auto) var<storage, read> textRowAngles : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowSizes : array<f32>;
@group(0) @binding(auto) var<storage, read> textRowPixelOffsets : array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> textRowClipRects : array<vec4<f32>>;
// Dictionary model memory: row buffers hold styling and row starts, dictionary
// buffers hold shared glyph runs, and visible glyph occurrences are implicit
// draw instances. There is no per-visible-glyph occurrence/vertex buffer.
@group(0) @binding(auto) var<storage, read> textRowDictionaryRecords : array<vec2<u32>>;
// textDictionaryGlyphRanges maps one dictionary value to a shared glyph range.
@group(0) @binding(auto) var<storage, read> textDictionaryGlyphRanges : array<vec2<u32>>;
// textDictionaryGlyphRecords stores packed layout offset + glyph id once per
// unique dictionary glyph, then repeated rows reuse those records.
@group(0) @binding(auto) var<storage, read> textDictionaryGlyphRecords : array<vec2<u32>>;
@group(0) @binding(auto) var<storage, read> textGlyphFrames : array<vec4<f32>>;

struct TextStorageStyleConfig {
  constantColor : vec4<f32>,
  constantAngleDegrees : f32,
  constantSize : f32,
  constantPixelOffset : vec2<f32>,
  useRowColors : u32,
  useRowAngles : u32,
  useRowSizes : u32,
  useRowPixelOffsets : u32,
  hasClipRects : u32,
  batchRowIndexBase : u32,
  rowStorageIndexBase : u32,
  _padding : u32,
  sdfThreshold : f32,
  sdfSmoothing : f32,
  fontRenderMode : u32,
  msdfDistanceRange : f32,
};

@group(0) @binding(auto) var<uniform> textStorageStyleConfig : TextStorageStyleConfig;

struct TextDictionaryRenderConfig {
  glyphIndexBase : u32,
  rowStart : u32,
  rowEnd : u32,
  _padding : u32,
};

@group(0) @binding(auto) var<uniform> textDictionaryRenderConfig : TextDictionaryRenderConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @builtin(instance_index) instanceIndex : u32,
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) textureCoordinate : vec2<f32>,
  @location(1) textColor : vec4<f32>,
  @interpolate(flat, either)
  @location(2) objectIndex : i32,
  @interpolate(flat)
  @location(3) atlasPage : u32,
};

struct PickingFragmentOutputs {
  @location(0) fragColor : vec4<f32>,
  @location(1) pickingColor : vec2<i32>,
};

fn getCorner(vertexIndex : u32) -> vec2<f32> {
  if (vertexIndex == 0u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 1u) { return vec2<f32>(1.0, 0.0); }
  if (vertexIndex == 2u) { return vec2<f32>(1.0, 1.0); }
  if (vertexIndex == 3u) { return vec2<f32>(0.0, 0.0); }
  if (vertexIndex == 4u) { return vec2<f32>(1.0, 1.0); }
  return vec2<f32>(0.0, 1.0);
}

fn unpackLowInt16(word : u32) -> i32 {
  return i32(word << 16u) >> 16;
}

fn unpackHighInt16(word : u32) -> i32 {
  return i32(word) >> 16;
}

fn unpackClipRect(words : vec4<f32>) -> vec4<f32> {
  return words;
}

fn isGlyphVertexClipped(glyphVertexOffset : vec2<f32>, clipRect : vec4<f32>) -> bool {
  if (clipRect.z >= 0) {
    let clipMinX = clipRect.x;
    let clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    let clipMinY = clipRect.y;
    let clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

fn unpackTextColor(colorWord : u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn rotateTextOffset(offset : vec2<f32>, angleDegrees : f32) -> vec2<f32> {
  if (angleDegrees == 0.0) {
    return offset;
  }
  let angleRadians = angleDegrees * 0.017453292519943295;
  let rotation = mat2x2<f32>(
    cos(angleRadians),
    sin(angleRadians),
    -sin(angleRadians),
    cos(angleRadians)
  );
  return rotation * offset;
}

fn emptyFragmentInputs() -> FragmentInputs {
  var outputs : FragmentInputs;
  outputs.Position = vec4<f32>(0.0);
  outputs.textureCoordinate = vec2<f32>(0.0);
  outputs.textColor = vec4<f32>(0.0);
  outputs.objectIndex = -1;
  outputs.atlasPage = 0u;
  return outputs;
}

fn findRowIndex(glyphIndex : u32) -> u32 {
  // Binary-search row glyph starts to recover the row for this instance.
  // This avoids storing a row id for every visible glyph occurrence.
  var low = textDictionaryRenderConfig.rowStart;
  var high = textDictionaryRenderConfig.rowEnd;
  loop {
    if (low >= high) {
      break;
    }
    let middle = (low + high) / 2u;
    let nextRowGlyphStart = textRowDictionaryRecords[middle + 1u].y;
    if (nextRowGlyphStart <= glyphIndex) {
      low = middle + 1u;
    } else {
      high = middle;
    }
  }
  return low;
}

@vertex
fn vertexMain(inputs : VertexInputs) -> FragmentInputs {
  // instanceIndex is the visible glyph occurrence. The row record points to a
  // dictionary value, and the dictionary range points to shared glyph layout.
  let glyphIndex = textDictionaryRenderConfig.glyphIndexBase + inputs.instanceIndex;
  let rowIndex = findRowIndex(glyphIndex);
  if (rowIndex >= textDictionaryRenderConfig.rowEnd) {
    return emptyFragmentInputs();
  }
  let rowDictionaryRecord = textRowDictionaryRecords[rowIndex];
  let rowGlyphStart = rowDictionaryRecord.y;
  let rowGlyphEnd = textRowDictionaryRecords[rowIndex + 1u].y;
  if (glyphIndex < rowGlyphStart || glyphIndex >= rowGlyphEnd) {
    return emptyFragmentInputs();
  }
  let dictionaryGlyphOffset = glyphIndex - rowGlyphStart;
  let dictionaryIndex = rowDictionaryRecord.x;
  if (dictionaryIndex == 4294967295u) {
    return emptyFragmentInputs();
  }
  let dictionaryGlyphRange = textDictionaryGlyphRanges[dictionaryIndex];
  let dictionaryGlyphIndex = dictionaryGlyphRange.x + dictionaryGlyphOffset;
  if (dictionaryGlyphIndex >= dictionaryGlyphRange.y) {
    return emptyFragmentInputs();
  }

  var outputs : FragmentInputs;
  let corner = getCorner(inputs.vertexIndex % 6u);
  let glyphRecord = textDictionaryGlyphRecords[dictionaryGlyphIndex];
  let glyphId = glyphRecord.y & 0xffffu;
  let glyphPage = glyphRecord.y >> 16u;
  let glyphFrame = textGlyphFrames[glyphId];
  let glyphOffset = vec2<f32>(
    f32(unpackLowInt16(glyphRecord.x)),
    f32(unpackHighInt16(glyphRecord.x))
  );
  let glyphSize = glyphFrame.zw;
  let glyphVertexOffset = glyphOffset + corner * glyphSize;
  let rowStorageIndex = rowIndex + textStorageStyleConfig.rowStorageIndexBase;
  var angleDegrees = textStorageStyleConfig.constantAngleDegrees;
  if (textStorageStyleConfig.useRowAngles != 0u) {
    angleDegrees = textRowAngles[rowStorageIndex];
  }
  var textSize = textStorageStyleConfig.constantSize;
  if (textStorageStyleConfig.useRowSizes != 0u) {
    textSize = textRowSizes[rowStorageIndex];
  }
  let styledGlyphVertexOffset = rotateTextOffset(
    glyphVertexOffset * (textSize / 32.0),
    angleDegrees
  );
  var pixelOffset = textStorageStyleConfig.constantPixelOffset;
  if (textStorageStyleConfig.useRowPixelOffsets != 0u) {
    pixelOffset = textRowPixelOffsets[rowStorageIndex];
  }
  let glyphWorldOffset =
    (styledGlyphVertexOffset + pixelOffset) * textViewport.glyphWorldScale;
  let labelPosition = textRowPositions[rowStorageIndex];
  let worldPosition = labelPosition + glyphWorldOffset;
  let clipPosition = (worldPosition - textViewport.cameraOffset) * textViewport.viewportScale;
  let atlasSize = vec2<f32>(textureDimensions(fontAtlasTexture));
  let atlasCorner = vec2<f32>(corner.x, 1.0 - corner.y);
  let atlasPixel = glyphFrame.xy + atlasCorner * glyphSize;
  var isClipped = false;
  if (textViewport.clippingEnabled > 0.5 && textStorageStyleConfig.hasClipRects != 0u) {
    let clipRect = unpackClipRect(textRowClipRects[rowIndex]);
    isClipped = isGlyphVertexClipped(glyphVertexOffset, clipRect);
  }

  outputs.Position = select(
    vec4<f32>(clipPosition, 0.0, 1.0),
    vec4<f32>(0.0),
    isClipped
  );
  outputs.textureCoordinate = atlasPixel / atlasSize;
  outputs.atlasPage = glyphPage;
  outputs.textColor = textStorageStyleConfig.constantColor;
  if (textStorageStyleConfig.useRowColors != 0u) {
    outputs.textColor = unpackTextColor(textRowColors[rowStorageIndex]);
  }
  outputs.objectIndex = i32(textStorageStyleConfig.batchRowIndexBase + rowIndex);
  return outputs;
}

${Be({functionName:"getStorageGlyphAlpha",textureCoordinate:"inputs.textureCoordinate",atlasPage:"inputs.atlasPage",settings:Dr})}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
  let glyphAlpha = getStorageGlyphAlpha(inputs);
  let fragColor = vec4<f32>(inputs.textColor.rgb, inputs.textColor.a * glyphAlpha);
  return picking_filterHighlightColor(fragColor, inputs.objectIndex);
}

@fragment
fn fragmentPicking(inputs : FragmentInputs) -> PickingFragmentOutputs {
  if (getStorageGlyphAlpha(inputs) <= 0.0) {
    discard;
  }
  var outputs : PickingFragmentOutputs;
  outputs.fragColor = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  outputs.pickingColor = picking_getPickingColor(inputs.objectIndex);
  return outputs;
}
`,gs=`#version 300 es
precision highp float;
precision highp int;

in vec2 positions;
in ivec2 glyphOffsets;
in uvec4 glyphFrames;
in uint glyphPages;
in uint rowIndices;
in vec4 glyphClipRects;
in vec4 colors;

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
} textViewport;

uniform highp sampler2DArray fontAtlasTexture;
out vec2 vTextureCoordinate;
out vec4 vTextColor;
flat out uint vAtlasPage;

vec2 getCorner(int vertexIndex) {
  if (vertexIndex == 0) return vec2(0.0, 0.0);
  if (vertexIndex == 1) return vec2(1.0, 0.0);
  if (vertexIndex == 2) return vec2(1.0, 1.0);
  if (vertexIndex == 3) return vec2(0.0, 0.0);
  if (vertexIndex == 4) return vec2(1.0, 1.0);
  return vec2(0.0, 1.0);
}

bool isGlyphVertexClipped(vec2 glyphVertexOffset, vec4 clipRect) {
  if (clipRect.z >= 0) {
    float clipMinX = clipRect.x;
    float clipMaxX = clipMinX + clipRect.z;
    if (glyphVertexOffset.x < clipMinX || glyphVertexOffset.x > clipMaxX) {
      return true;
    }
  }
  if (clipRect.w >= 0) {
    float clipMinY = clipRect.y;
    float clipMaxY = clipMinY + clipRect.w;
    if (glyphVertexOffset.y < clipMinY || glyphVertexOffset.y > clipMaxY) {
      return true;
    }
  }
  return false;
}

void main() {
  picking_setObjectIndex(int(rowIndices));
  vec2 corner = getCorner(gl_VertexID % 6);
  vec4 glyphFrame = vec4(glyphFrames);
  vec2 glyphOffset = vec2(glyphOffsets);
  vec2 glyphSize = glyphFrame.zw;
  vec2 glyphVertexOffset = glyphOffset + corner * glyphSize;
  vec2 glyphWorldOffset = glyphVertexOffset * textViewport.glyphWorldScale;
  vec2 worldPosition = positions + glyphWorldOffset;
  vec2 clipPosition = (worldPosition - textViewport.cameraOffset) * textViewport.viewportScale;
  vec2 atlasSize = vec2(textureSize(fontAtlasTexture, 0).xy);
  vec2 atlasCorner = vec2(corner.x, 1.0 - corner.y);
  vec2 atlasPixel = glyphFrame.xy + atlasCorner * glyphSize;

  gl_Position = textViewport.clippingEnabled > 0.5 &&
    isGlyphVertexClipped(glyphVertexOffset, glyphClipRects)
    ? vec4(0.0)
    : vec4(clipPosition, 0.0, 1.0);
  vTextureCoordinate = atlasPixel / atlasSize;
  vAtlasPage = glyphPages;
  vec4 neutralTextColor = vec4(0.78, 0.86, 0.96, 1.0);
  vTextColor = mix(neutralTextColor, colors, textViewport.colorsEnabled);
  TEXT_ATTRIBUTE_VERTEX_TRANSFORM(
    gl_Position,
    vTextureCoordinate,
    vTextColor,
    worldPosition,
    glyphFrame,
    corner,
    glyphSize,
    atlasSize
  );
}
`,hs=`#version 300 es
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
} textViewport;

uniform highp sampler2DArray fontAtlasTexture;

in vec2 vTextureCoordinate;
in vec4 vTextColor;
flat in uint vAtlasPage;
out vec4 fragColor;

${Ye({functionName:"getGlyphAlpha",textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:kt})}

void main() {
  float glyphAlpha = getGlyphAlpha();
  fragColor = vec4(vTextColor.rgb, vTextColor.a * glyphAlpha);
  fragColor = picking_filterColor(fragColor);
}
`;`${Ye({functionName:"getGlyphAlpha",textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:kt})}`;const xs={name:"textViewport",uniformTypes:{cameraOffset:"vec2<f32>",viewportScale:"vec2<f32>",glyphWorldScale:"f32",time:"f32",clippingEnabled:"f32",colorsEnabled:"f32",textFontRenderMode:"f32",textSdfThreshold:"f32",textSdfSmoothing:"f32",textMsdfDistanceRange:"f32",contentCutoffPixels:"vec2<f32>",contentAlign:"vec2<f32>"},defaultUniforms:{cameraOffset:[0,0],viewportScale:[1,1],glyphWorldScale:1,time:0,clippingEnabled:0,colorsEnabled:0,textFontRenderMode:0,textSdfThreshold:.5,textSdfSmoothing:.1,textMsdfDistanceRange:0,contentCutoffPixels:[0,0],contentAlign:[0,0]}};function ps(e=mo){return new An({textViewport:xs,picking:e})}function pe(e={}){const t=e.selectors??{},n=ys(e.data),r=new Set(n?Qr(n):[]),o=mn("positions",t.positions,n,r),a=mn("texts",t.texts,n,r),i=ee("clipRects",t.clipRects,n,r),s=ee("colors",t.colors,n,r),l=ee("angles",t.angles,n,r),c=ee("sizes",t.sizes,n,r),u=ee("pixelOffsets",t.pixelOffsets,n,r),f=ee("textAnchors",t.textAnchors,n,r),g=ee("alignmentBaselines",t.alignmentBaselines,n,r);return{positions:o,texts:a,...i?{clipRects:i}:{},...s?{colors:s}:{},...l?{angles:l}:{},...c?{sizes:c}:{},...u?{pixelOffsets:u}:{},...f?{textAnchors:f}:{},...g?{alignmentBaselines:g}:{}}}function ys(e){if(e)return e instanceof F?e:new F([e])}function mn(e,t,n,r){const o=Vr(e,t,n,r);if(!o)throw new Error(`ArrowTextRenderer source mapping requires ${e}`);return o}function ee(e,t,n,r){if(t!==null)return Vr(e,t,n,r)}function Vr(e,t,n,r){if(t instanceof Q||e==="texts"&&Xa(t))return t;const o=t??e;if(!n){if(t===void 0&&e!=="positions"&&e!=="texts")return;throw new Error(`ArrowTextRenderer source selector "${e}" requires data to resolve column "${o}"`)}if(!r.has(o)){if(t===void 0&&e!=="positions"&&e!=="texts")return;throw new Error(`ArrowTextRenderer source column "${o}" for "${e}" is missing`)}return eo(n,o)}const ws={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},H={positions:"positions",texts:"texts",clipRects:"clipRects",colors:"colors",angles:"angles",sizes:"sizes",pixelOffsets:"pixelOffsets",textAnchors:"textAnchors",alignmentBaselines:"alignmentBaselines"},ms=[128,128,128,255],Ss=0,Rs=32,Ts=8,bs=10;class q extends bo{device;shaderInputs;props;textInput;textData;textResources;textRenderer;resolvedModel;activeStreamingTextTable=null;dataLoadVersion=0;isDestroyed=!1;textDataOwner;get model(){return va(this.textRenderer)}constructor(t,n,r){super(),this.device=t,this.props=n;const o=n.modelProps?.modules?.find(i=>i.name==="picking");this.shaderInputs=n.modelProps?.shaderInputs??ps(o),n.modelProps?.modules&&this.shaderInputs.addModules(n.modelProps.modules),this.textInput=r,this.textResources=new on(t,{id:n.id,fontAtlas:n.fontAtlas}),this.resolvedModel=this.resolveModel(this.props.model??"auto",this.textInput);const a=this.createTextRenderer(this.resolvedModel,this.props,this.textInput);this.textData=a.textData,this.textRenderer=a.textRenderer}static async create(t,n){const r=n.data&&Symbol.asyncIterator in n.data?n.data:null;if(!r)return new q(t,n,await st(t,n));const o=lt(r),a=await o.next();if(a.done)throw new Error("ArrowTextRenderer data requires at least one Arrow record batch");const i=a.value,s={...n,data:new F([i])},l=new q(t,s,await st(t,s)),c=l.beginDataLoad();return l.loadDataBatches({...n,data:Ds(i,o)},c,"streamed Arrow text batch"),l}static createFromPreparedInput(t,n,r){return new q(t,n,r)}transferTextDataOwnership(t){return this.textDataOwner=t,this.textData}static prepareData(t,n){const r=Sn(Ur(n)),o=Rt(r.colors?.type);return P.isDictionary(r.texts.type)&&!o?rs(t,{sourceVectors:r}):o?Or(t,{sourceVectors:r}):Gr(t,{sourceVectors:r})}static prepareDataFromGPUTable(t){const n=new F(t.recordBatches),r=pe({data:n,selectors:t.props}),o=Sn(r);return{positions:Wt(t.gpuTable,"positions","ArrowTextRenderer data"),texts:Wt(t.gpuTable,"texts","ArrowTextRenderer data"),...r.clipRects?{clipRects:te(t.gpuTable,"clipRects")}:{},...r.colors?{colors:te(t.gpuTable,"colors")}:{},...r.angles?{angles:te(t.gpuTable,"angles")}:{},...r.sizes?{sizes:te(t.gpuTable,"sizes")}:{},...r.pixelOffsets?{pixelOffsets:te(t.gpuTable,"pixelOffsets")}:{},...r.textAnchors?{textAnchors:te(t.gpuTable,"textAnchors")}:{},...r.alignmentBaselines?{alignmentBaselines:te(t.gpuTable,"alignmentBaselines")}:{},sourceVectors:o,destroy:()=>{}}}async setProps(t,n="ArrowTextRenderer props changed",r={}){const o=this.props,a={...this.props,...t},s=Object.prototype.hasOwnProperty.call(t,"data")&&t.data!==o.data,l=t.model!==void 0&&t.model!==o.model,c=Us(t),u=As(t,o,"fontAtlas");if(!r.preserveDataLoad&&zs(a,s)){const A=this.beginDataLoad();return this.props=a,this.loadDataBatches(a,A,n),{modelChanged:!0}}const f=!r.preserveDataLoad&&(s||l||c||u),g=f?this.activeStreamingTextTable:null;f&&(this.dataLoadVersion++,this.activeStreamingTextTable=null);const h=c||l,m=c?await st(this.device,a):l?Gs(this.device,this.textInput):this.textInput,y=this.resolveModel(a.model??this.props.model??"auto",m),d=h||t.model!==void 0&&t.model!==o.model||u||ks(t,o)||y!==this.resolvedModel,w=d;if(!d)return this.props=a,w&&this.model.setNeedsRedraw(n),g?.destroy(),{modelChanged:d};const x=this.textRenderer,S=this.textData,R=this.textInput,T=this.textResources;u&&(this.textResources=new on(this.device,{id:a.id,fontAtlas:a.fontAtlas}));let b;try{b=this.createTextRenderer(y,a,m)}catch(A){throw this.textResources!==T&&(this.textResources.destroy(),this.textResources=T),A}return this.props=a,this.textInput=m,this.resolvedModel=y,this.textData=b.textData,this.textRenderer=b.textRenderer,x.destroy(),this.releaseReplacedTextData(b.textData,S),T!==this.textResources&&T.destroy(),R!==m&&R.destroy(),g?.destroy(),this.model.setNeedsRedraw(n),{modelChanged:d}}async loadDataBatches(t,n,r){if(!t.data)return;const o=lt(t.data),a=[];let i=null,s=!1,l=!1;if(this.isDataLoadActive(n))try{for(let c=await o.next();!c.done;c=await o.next()){if(!this.isDataLoadActive(n))return;const u=c.value,f=!l;if(a.push(u),f){const y=this.activeStreamingTextTable;s=Fr(a,t),s?this.activeStreamingTextTable=null:(i=vs(this.device,u,t),this.activeStreamingTextTable=i),l=!0;const d=s?await St(this.device,a,t):Nt(i,a,t),w=this.setPreparedTextInput(t,d,r,{preserveDataLoad:!0});y?.destroy(),t.onDataBatch?.({textInput:d,loadedBatchCount:s?a.length:i.batches.length,isFirstBatch:!0,setPropsResult:w});continue}s||Es(this.device,i,u,t);const g=s?await St(this.device,[u],t):Ps(i,u,t),h=this.textInput,m=this.appendPreparedTextInput(t,g,h,r);s?Os(h,g):Lr(h,g),t.onDataBatch?.({textInput:h,loadedBatchCount:s?a.length:i.batches.length,isFirstBatch:!1,setPropsResult:m})}}catch(c){this.isDataLoadActive(n)&&t.onDataError?.(c)}}appendPreparedTextInput(t,n,r,o){const a=this.resolveModel(t.model??this.props.model??"auto",n);if(a!==this.resolvedModel)return this.setPreparedTextInput(t,r,o,{preserveDataLoad:!0});const i=this.textRenderer.stats,s=this.createGPUTextData(a,t,n,{sourceBatchIndex:this.textData.length,rowIndexBase:i.rowCount,glyphIndexBase:i.glyphCount});try{this.textRenderer.appendData(s)}catch(l){throw s.destroy(),l}return this.textData.push(s),this.props=t,this.textInput=r,this.textDataOwner?.({data:this.textData,added:[s],removed:[]}),this.model.setNeedsRedraw(o),{modelChanged:!1}}setPreparedTextInput(t,n,r,o={}){const a=this.props,i=!o.preserveDataLoad&&t.data!==void 0&&t.data!==a.data,s=i?this.activeStreamingTextTable:null;i&&(this.dataLoadVersion++,this.activeStreamingTextTable=null);const l=this.resolveModel(t.model??this.props.model??"auto",n),c=n!==this.textInput||t.model!==a.model||l!==this.resolvedModel;if(!c)return this.props=t,s?.destroy(),{modelChanged:c};const u=this.textRenderer,f=this.textData,g=this.textInput,h=this.createTextRenderer(l,t,n);return this.props=t,this.textInput=n,this.resolvedModel=l,this.textData=h.textData,this.textRenderer=h.textRenderer,u.destroy(),this.releaseReplacedTextData(h.textData,f),g!==n&&g.destroy(),s?.destroy(),this.model.setNeedsRedraw(r),{modelChanged:c}}needsRedraw(){const t=super.needsRedraw(),n=this.model.needsRedraw();return t||n}setNeedsRedraw(t){super.setNeedsRedraw(t),this.model.setNeedsRedraw(t)}predraw(t){this.model.predraw(t)}draw(t){this.model.draw(t)}destroy(){this.isDestroyed=!0,this.dataLoadVersion++;const t=this.activeStreamingTextTable;if(this.activeStreamingTextTable=null,this.textRenderer.destroy(),!this.textDataOwner)for(const n of this.textData)n.destroy();this.textInput.destroy(),t?.destroy(),this.textResources.destroy()}releaseReplacedTextData(t,n){if(this.textDataOwner)this.textDataOwner({data:t,added:t,removed:n});else for(const r of n)r.destroy()}createTextRenderer(t,n,r){const o=[];let a=0,i=0;try{for(const[s,l]of Is(r).entries()){const c=this.createGPUTextData(t,n,l,{sourceBatchIndex:s,rowIndexBase:a,glyphIndexBase:i});o.push(c),a+=c.rowCount,i+=c.glyphCount}}catch(s){for(const l of o)l.destroy();throw s}return{textData:o,textRenderer:new Aa(this.device,{data:o})}}createGPUTextData(t,n,r,o={}){const a=n.color??ms,i=n.angle??Ss,s=n.size??Rs;Cs(this.shaderInputs,n.fontAtlas);const l=n.modelProps?.shaderAssembler??(this.device.info.shadingLanguage==="wgsl"?new Xr:new Wr);(this.device.info.shadingLanguage==="wgsl"?n.modelProps?.source:n.modelProps?.vs||n.modelProps?.fs)||is(l,this.device.info.shadingLanguage);const u={id:n.id,fontAtlas:n.fontAtlas,resources:this.textResources,rowIndexBase:o.rowIndexBase,...n.modelProps,shaderAssembler:l,shaderInputs:this.shaderInputs,modules:Xs(Ys(this.device),n.modelProps?.modules??[]),parameters:ws,color:a,angle:i,size:s,pixelOffset:n.pixelOffset,textAnchor:n.textAnchor,alignmentBaseline:n.alignmentBaseline};if(t==="dictionary"){const y=as(this.device,{...this.getStorageInputProps(r),...u,source:n.modelProps?.source??ds,shaderLayout:n.dictionaryStorageShaderLayout??cs}),{storageState:d,...w}=y;return nt({strategy:"dictionary",modelProps:w,state:d},{resources:this.textResources,rowCount:r.positions.length,...o})}if(t==="storage"||t==="storage-row-indexed"){const y=es(this.device,{...this.getStorageInputProps(r),...u,rowIndexColumn:t==="storage-row-indexed",source:n.modelProps?.source??(t==="storage-row-indexed"?fs:Mr),shaderLayout:n.storageShaderLayout??(t==="storage-row-indexed"?ls:_r)}),{storageState:d,...w}=y;return nt({strategy:t,modelProps:w,state:d},{resources:this.textResources,rowCount:r.positions.length,...o})}const f=Ji(this.device,{...this.getInputProps(r),...u,source:n.modelProps?.source??us,vs:n.modelProps?.vs??gs,fs:n.modelProps?.fs??hs,shaderLayout:n.attributeShaderLayout??ss}),{attributeState:g,...h}=f;return nt({strategy:"attribute",modelProps:h,state:g},{resources:this.textResources,rowCount:r.positions.length,...o})}resolveModel(t,n){const r=Rt(n.sourceVectors.colors?.type),o=P.isDictionary(n.sourceVectors.texts.type),a=+!!n.sourceVectors.textAnchors+ +!!n.sourceVectors.alignmentBaselines,i=Kt(this.device,Ts)&&Et(this.device,a),s=Kt(this.device,bs);return t==="auto"?s&&o&&!r?"dictionary":i&&!r?"storage":"attribute":t!=="attribute"&&r||t==="dictionary"&&!s||(t==="storage"||t==="storage-row-indexed")&&!i||t==="dictionary"&&!o?"attribute":t}beginDataLoad(){return this.dataLoadVersion++,this.dataLoadVersion}isDataLoadActive(t){return!this.isDestroyed&&t===this.dataLoadVersion}getInputProps(t){return{positions:t.positions,texts:t.texts,sourceVectors:t.sourceVectors,...t.clipRects?{clipRects:t.clipRects}:{},...t.colors?{colors:t.colors}:{},...t.angles?{angles:t.angles}:{},...t.sizes?{sizes:t.sizes}:{},...t.pixelOffsets?{pixelOffsets:t.pixelOffsets}:{}}}getStorageInputProps(t){return{positions:t.positions,texts:t.texts,sourceVectors:{texts:t.sourceVectors.texts,...t.sourceVectors.clipRects?{clipRects:t.sourceVectors.clipRects}:{}},...t.clipRects?{clipRects:t.clipRects}:{},...t.colors?{colors:t.colors}:{},...t.angles?{angles:t.angles}:{},...t.sizes?{sizes:t.sizes}:{},...t.pixelOffsets?{pixelOffsets:t.pixelOffsets}:{},...t.textAnchors?{textAnchors:t.textAnchors}:{},...t.alignmentBaselines?{alignmentBaselines:t.alignmentBaselines}:{}}}}function Is(e){return e.positions.data.map((t,n)=>{const r={positions:it(e.positions,n),texts:it(e.texts,n),sourceVectors:Object.fromEntries(Object.entries(e.sourceVectors).map(([i,s])=>{const l=s.data[n];return[i,new Q([l])]})),destroy:()=>{}},o=r,a=e;for(const i of["clipRects","colors","angles","sizes","pixelOffsets","textAnchors","alignmentBaselines"]){const s=a[i];s&&(o[i]=it(s,n))}return r})}function it(e,t){const n=e.data[t];return new Hr({type:"data",name:e.name,data:[n],format:e.format,stride:e.stride,valueLength:n.valueLength,byteStride:e.byteStride,rowByteLength:e.rowByteLength,bufferLayout:e.bufferLayout,ownsData:!1,dataType:e.dataType})}function Cs(e,t){const n=Jn(t.renderSettings),r=new Set(e.getModules().map(o=>o.name));r.has("textViewport")&&e.setProps({textViewport:{textFontRenderMode:n.renderMode,textSdfThreshold:n.sdfThreshold,textSdfSmoothing:n.sdfSmoothing,textMsdfDistanceRange:n.msdfDistanceRange}}),r.has("textFont")&&e.setProps({textFont:n})}function As(e,t,n){return Object.prototype.hasOwnProperty.call(e,n)&&e[n]!==t[n]}function vs(e,t,n={}){const r=new F([t]),{arrowPaths:o,shaderLayout:a}=$t(r,n);return It(e,r,{arrowPaths:o,shaderLayout:a})}function Bs(e,t,n={}){const{arrowPaths:r,shaderLayout:o}=$t(t,n);return It(e,t,{arrowPaths:r,shaderLayout:o})}function Es(e,t,n,r={}){const o=new F([n]),{arrowPaths:a,shaderLayout:i}=$t(o,r),s=t.batches.length,l=t.batches.reduce((c,u)=>c+(u.sourceInfo?.sourceRowCount??u.numRows),0);t.addBatch(To(e,n,{arrowPaths:a,shaderLayout:i,sourceInfo:So({sourceBatchIndex:s,sourceRowIndexOffset:l,sourceRowCount:n.numRows})}))}function Nt(e,t,n={}){const r=new F(t),{texts:o}=pe({data:r,selectors:n});return{...q.prepareDataFromGPUTable({gpuTable:e,recordBatches:t,props:n}),arrowVectorByteLength:bt(o)}}function Ps(e,t,n){const r=e.batches[e.batches.length-1],o=new to({batches:[r]});return Nt(o,[t],n)}function Os(e,t){const n=["positions","texts","clipRects","colors","angles","sizes","pixelOffsets","textAnchors","alignmentBaselines"],r=e,o=t;for(const a of n){const i=r[a],s=o[a];if(!(!i||!s)){for(const l of[...s.data])i.addData(l);s.data.splice(0,s.data.length)}}return Lr(e,t),e}function Lr(e,t){const n=e.sourceVectors,r=t.sourceVectors;for(const[o,a]of Object.entries(r)){const i=n[o];n[o]=i?new Q([...i.data,...a.data]):a}e.arrowVectorByteLength+=t.arrowVectorByteLength,t.destroy()}async function St(e,t,n){const r=await zr(e,Ls(new F(t),n));return{...q.prepareData(e,r),arrowVectorByteLength:bt(r.texts)}}function Gs(e,t){return{...q.prepareData(e,t.sourceVectors),arrowVectorByteLength:t.arrowVectorByteLength}}async function*Ds(e,t){yield e;for(let n=await t.next();!n.done;n=await t.next())yield n.value}async function st(e,t){if(!t.data){const l=await zr(e,Ur(t));return{...q.prepareData(e,l),arrowVectorByteLength:bt(l.texts)}}const n=await Ws(t.data);if(n.length===0)throw new Error("ArrowTextRenderer data requires at least one Arrow record batch");if(Fr(n,t))return await St(e,n,t);const r=new F(n),o=Bs(e,r,t),a=Nt(o,n,t),i=a.destroy;let s=!1;return{...a,destroy:()=>{s||(s=!0,i(),o.destroy())}}}function te(e,t){return t===null?void 0:e.gpuVectors[t]??void 0}function _s(e){return{positions:typeof e.positions=="string"?e.positions:H.positions,texts:typeof e.texts=="string"?e.texts:H.texts,clipRects:ne(e.clipRects,H.clipRects),colors:ne(e.colors,H.colors),angles:ne(e.angles,H.angles),sizes:ne(e.sizes,H.sizes),pixelOffsets:ne(e.pixelOffsets,H.pixelOffsets),textAnchors:ne(e.textAnchors,H.textAnchors),alignmentBaselines:ne(e.alignmentBaselines,H.alignmentBaselines)}}function $t(e,t){Fs(t);const n=pe({data:e,selectors:t}),r=_s(t);return{arrowPaths:Ms(r,n),shaderLayout:Vs(n)}}function Ms(e,t){return Object.fromEntries([["positions",e.positions],["texts",e.texts],...t.clipRects?[["clipRects",e.clipRects]]:[],...t.colors?[["colors",e.colors]]:[],...t.angles?[["angles",e.angles]]:[],...t.sizes?[["sizes",e.sizes]]:[],...t.pixelOffsets?[["pixelOffsets",e.pixelOffsets]]:[],...t.textAnchors?[["textAnchors",e.textAnchors]]:[],...t.alignmentBaselines?[["alignmentBaselines",e.alignmentBaselines]]:[]].filter(([,n])=>n!==null))}function Vs(e){const t=new Set(["positions","texts",...e.clipRects?["clipRects"]:[],...e.colors?["colors"]:[],...e.angles?["angles"]:[],...e.sizes?["sizes"]:[],...e.pixelOffsets?["pixelOffsets"]:[],...e.textAnchors?["textAnchors"]:[],...e.alignmentBaselines?["alignmentBaselines"]:[]]);return{...at,attributes:at.attributes.filter(n=>t.has(n.name)),bindings:at.bindings.filter(n=>t.has(n.name))}}function ne(e,t){return e===null?null:typeof e=="string"?e:t}function Ur(e){return pe({selectors:e})}function Ls(e,t){return pe({data:e,selectors:t})}function Sn(e){return{...e,texts:ur(e.texts)}}function Fr(e,t){if(Nr(t))return!0;const n=new F(e),r=pe({data:n,selectors:t});return Rt(r.colors?.type)||kr(r.colors)||_t(r.texts)||cr(r.texts)}async function zr(e,t){if(!kr(t.colors))return t;const n=await no(e,t.colors,{name:"arrow-text-colors",semantic:"color",format:"unorm8x4"});let r;try{r=await ro(n.vector)}finally{n.destroy()}return{...t,colors:r}}function kr(e){return!!(e&&oo(e)&&(!P.isFixedSizeList(e.type)||e.type.listSize!==4||!(e.type.children[0]?.type instanceof Y)))}function Us(e){return e.data!==void 0||e.positions!==void 0||e.texts!==void 0||e.clipRects!==void 0||e.colors!==void 0||e.angles!==void 0||e.sizes!==void 0||e.pixelOffsets!==void 0||e.textAnchors!==void 0||e.alignmentBaselines!==void 0}function Fs(e){if(Nr(e))throw new Error("Arrow text GPU table upload requires data-backed string column selectors")}function Nr(e){return[e.positions,e.texts,e.clipRects,e.colors,e.angles,e.sizes,e.pixelOffsets,e.textAnchors,e.alignmentBaselines].some(t=>t instanceof Q)}function zs(e,t){return!!(e.data&&t)}function ks(e,t){return e.color!==void 0&&!$s(e.color,t.color)||e.angle!==void 0&&e.angle!==t.angle||e.size!==void 0&&e.size!==t.size||e.pixelOffset!==void 0&&!Ns(e.pixelOffset,t.pixelOffset)||e.textAnchor!==void 0&&e.textAnchor!==t.textAnchor||e.alignmentBaseline!==void 0&&e.alignmentBaseline!==t.alignmentBaseline}function Ns(e,t){return e===t||!!(e&&t&&e[0]===t[0]&&e[1]===t[1])}function $s(e,t){return e===t||e!==void 0&&t!==void 0&&e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]&&e[3]===t[3]}function Rt(e){return!!e&&P.isList(e)}function Ys(e){return Ro(e)}function Xs(e,t){const n=new Set(t.map(r=>r.name));return[...e.filter(r=>{const o=r.name;return!o||!n.has(o)}),...t]}async function Ws(e){const t=[],n=lt(e);for(let r=await n.next();!r.done;r=await n.next())t.push(r.value);return t}const $r={attributes:[{name:"glyphOffsets",location:0,type:"vec2<i32>",stepMode:"instance"},{name:"glyphIndices",location:1,type:"vec2<u32>",stepMode:"instance"}],bindings:[]},Hs={attributes:[...$r.attributes,{name:"glyphRowIndices",location:2,type:"u32",stepMode:"instance"}],bindings:[]},Yr=`
${vn}

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
`,qs=Yr.replace("@location(1) glyphIndices: vec2<u32>,",`@location(1) glyphIndices: vec2<u32>,
  @location(2) glyphRowIndices: u32,`).replace("let rowIndex = findStorageTextRowIndex(glyphIndex);","let rowIndex = inputs.glyphRowIndices;"),Rn=[199,219,245,255],js={renderMode:{expression:"textViewport.textFontRenderMode",kind:"float"},sdfThreshold:"textViewport.textSdfThreshold",sdfSmoothing:"textViewport.textSdfSmoothing",msdfDistanceRange:"textViewport.textMsdfDistanceRange"},Ks=`#version 300 es
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
  clipPosition.xy += project_pixel_size_to_clipspace(glyphPixelOffset);
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
`,Zs=`#version 300 es
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

${Ye({functionName:"getGlyphAlpha",textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:js})}

void main() {
  float glyphAlpha = getGlyphAlpha();
  fragColor = vec4(vTextColor.rgb, vTextColor.a * glyphAlpha);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Js=`
${vn}

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
`,Qs={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:"glyphOffsets",location:1,type:"vec2<i32>",stepMode:"instance"},{name:"glyphFrames",location:2,type:"vec4<u32>",stepMode:"instance"},{name:"glyphPages",location:3,type:"u32",stepMode:"instance"},{name:"rowIndices",location:4,type:"u32",stepMode:"instance"},{name:"glyphClipRects",location:5,type:"vec4<f32>",stepMode:"instance"},{name:"colors",location:6,type:"vec4<f32>",stepMode:"instance"},{name:"angles",location:7,type:"f32",stepMode:"instance"},{name:"sizes",location:8,type:"f32",stepMode:"instance"},{name:"pixelOffsets",location:9,type:"vec2<f32>",stepMode:"instance"}],bindings:[]},$e=class $e extends qr{getAttributeManager(){return null}setShaderModuleProps(t){super.setShaderModuleProps(this.context.device.type==="webgpu"?{layer:t.layer,picking:t.picking}:{layer:t.layer,project:t.project,picking:t.picking})}initializeState(){this.setState({renderer:null,textData:[],constantBuffers:[],loadVersion:0,sourceInitialized:!1,sourceInfos:[],gpuVectorSourceCache:new Map})}updateState(t){const{props:n,oldProps:r,changeFlags:o}=t,a=this.getLayerState();if(!a.sourceInitialized||o.dataChanged||n.positions!==r.positions||n.texts!==r.texts||n.clipRects!==r.clipRects||n.angles!==r.angles||n.sizes!==r.sizes||n.pixelOffsets!==r.pixelOffsets||n.textAnchors!==r.textAnchors||n.alignmentBaselines!==r.alignmentBaselines||n.model!==r.model||n.color!==r.color||n.angle!==r.angle||n.size!==r.size||n.pixelOffset!==r.pixelOffset||n.textAnchor!==r.textAnchor||n.alignmentBaseline!==r.alignmentBaseline){a.sourceInitialized=!0,a.sourceInfos=[],this.createRenderer(n);return}const s=this.getRendererOrNull();s&&s.setProps({model:n.model,fontAtlas:n.fontAtlas,angle:n.angle,size:n.size,pixelOffset:n.pixelOffset,textAnchor:n.textAnchor,alignmentBaseline:n.alignmentBaseline})}getModels(){const t=this.getRendererOrNull()?.model;return t?[t]:[]}draw({renderPass:t,context:n}){const r=this.getRendererOrNull();r&&(r.model.device.type==="webgpu"?io(r.model,n.viewport,{contentCutoffPixels:this.props.contentCutoffPixels,contentAlignHorizontal:this.props.contentAlignHorizontal,contentAlignVertical:this.props.contentAlignVertical}):r.shaderInputs.setProps({textViewport:{cameraOffset:[0,0],viewportScale:[2/Math.max(n.viewport.width,1),2/Math.max(n.viewport.height,1)],glyphWorldScale:.36,time:0,clippingEnabled:this.props.clipRects===null?0:1,colorsEnabled:Zt(this.props.color,Pe)?1:0,contentCutoffPixels:this.props.contentCutoffPixels??[0,0],contentAlign:[bn(this.props.contentAlignHorizontal),bn(this.props.contentAlignVertical)]}}),this.drawTextRenderer(r,t))}drawTextRenderer(t,n){t.draw(n)}getPickingInfo({info:t}){const n=t,r=n.index,o=this.getLayerState().sourceInfos.find(a=>r>=a.sourceRowIndexOffset&&r<a.sourceRowIndexOffset+a.sourceRowCount);return o&&(n.arrow={rowIndex:r,batchIndex:o.sourceBatchIndex,batchRowIndex:r-o.sourceRowIndexOffset}),n}finalizeState(t){const n=this.getLayerState();n.loadVersion++,n.renderer?.destroy();for(const r of n.textData)r.destroy();Ge(n.constantBuffers),this.setState({renderer:null,textData:[],constantBuffers:[],loadVersion:n.loadVersion,sourceInitialized:!0,sourceInfos:[],gpuVectorSourceCache:new Map}),super.finalizeState(t)}async createRenderer(t){const n=this.getLayerState(),r=n.loadVersion+1;n.loadVersion=r;const o=el(this.context.device,t.model);let a=In();try{let i=t,s=Zt(t.color,Pe);if(typeof s=="string")if(t.data){const d=await so(t.data,s);if(this.getLayerState().loadVersion!==r){await d.cancel();return}i={...t,data:d.data},d.hasColumn||(this.warnMissingColorColumn(t,s),s=void 0)}else this.warnMissingColorColumn(t,s),s=void 0;s instanceof Q&&(s=await lo(this.context.device,s,`${this.id}-colors`)),Jt(s)&&this.assertTextColorGPUVector(s,i);const l=await this.resolveTextColorSource(s,i),c=Qt(t.color,Rn,Pe);a=o==="attribute"?nl(this.context.device,i,!!s,c):In();const u={...i,colors:l??null,color:c,model:o,attributeShaderLayout:Qs,storageShaderLayout:o==="storage-row-indexed"?Hs:$r,modelProps:{...i.modelProps,...this.getShaders(this.context.device.type==="webgpu"?{shaderAssembler:this.context.shaderAssembler,modules:[co,Ht],source:o==="storage-row-indexed"?qs:o==="storage"?Yr:Js}:{shaderAssembler:this.context.shaderAssembler,modules:[wo,Ht],vs:Ks,fs:Zs}),shaderInputs:this.context.device.type==="webgpu"?new An({}):void 0,bufferLayout:[...i.modelProps?.bufferLayout??[],...a.bufferLayout],attributes:{...i.modelProps?.attributes,...a.attributes},constantAttributes:{...i.modelProps?.constantAttributes,...a.constantAttributes}},onDataBatch:d=>this.handleDataBatch(d,t.onDataBatch)},f=await q.create(this.context.device,u);let g=[...f.transferTextDataOwnership(({data:d,removed:w})=>{for(const S of w)S.destroy();g=[...d];const x=this.getLayerState();x.renderer===f&&(x.textData=g)})];if(this.getLayerState().loadVersion!==r){f.destroy();for(const d of g)d.destroy();Ge(a.buffers);return}const h=this.getRendererOrNull(),m=this.getLayerState().textData,y=this.getLayerState().constantBuffers;this.setState({renderer:f,textData:g,constantBuffers:a.buffers,loadVersion:r,sourceInitialized:!0,sourceInfos:this.getLayerState().sourceInfos,gpuVectorSourceCache:this.getLayerState().gpuVectorSourceCache}),h?.destroy();for(const d of m)d.destroy();Ge(y),this.setNeedsRedraw(),this.watchRendererPipeline(f)}catch(i){Ge(a.buffers),this.getLayerState().loadVersion===r&&(t.onDataError?t.onDataError(i):this.raiseError(tl(i),`loading Arrow data in ${this}`))}}async resolveTextColorSource(t,n){if(!Jt(t))return t;this.assertTextColorGPUVector(t,n);const r=this.getLayerState().gpuVectorSourceCache;let o=r.get(t);return o||(o=uo(this.context.device,t,`${this.id}-colors`,!0),r.set(t,o)),await o}warnMissingColorColumn(t,n){const r=Qt(t.color,Rn,Pe);jr.warn(`${this.id}: ArrowTextLayer color column "${n}" is missing; using color default ${JSON.stringify(r)}`)()}assertTextColorGPUVector(t,n){if(n.data)throw new Error("ArrowTextLayer direct GPUVector color requires direct text vectors rather than streamed data");const r=n.positions&&typeof n.positions!="string"?n.positions.length:void 0;fo("ArrowTextLayer color",t,r)}handleDataBatch(t,n){let r=0;this.getLayerState().sourceInfos=t.textInput.sourceVectors.positions.data.map((a,i)=>{const s={sourceBatchIndex:i,sourceRowIndexOffset:r,sourceRowCount:a.length};return r+=a.length,s}),this.setNeedsRedraw();const o=this.getRendererOrNull();o&&this.watchRendererPipeline(o),n?.(t)}getRendererOrNull(){return this.state?.renderer??null}watchRendererPipeline(t){const n=t.model;go(n,()=>{this.getRendererOrNull()===t&&t.model===n&&this.setNeedsRedraw()},r=>{this.getRendererOrNull()===t&&t.model===n&&(this.props.onDataError?this.props.onDataError(r):this.raiseError(r,`linking Arrow shaders in ${this}`))})}getLayerState(){return this.state}};$e.layerName="ArrowTextLayer",$e.defaultProps={data:{type:"object",value:null,optional:!0},parameters:ao,contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none"};let Tn=$e;function el(e,t="auto"){if((t==="storage"||t==="storage-row-indexed")&&e.type!=="webgpu")throw new Error("ArrowTextLayer storage rendering requires WebGPU");const n=Et(e);if(t==="auto")return n?"storage":"attribute";if(t!=="attribute"&&t!=="storage"&&t!=="storage-row-indexed")throw new Error(`ArrowTextLayer does not support the ${t} model`);return(t==="storage"||t==="storage-row-indexed")&&!n?"attribute":t}function tl(e){return e instanceof Error?e:new Error(String(e))}function bn(e){switch(e){case"start":return 1;case"center":return 2;case"end":return 3;default:return 0}}function In(){return{bufferLayout:[],attributes:{},constantAttributes:{},buffers:[]}}function nl(e,t,n,r){const o={bufferLayout:[],attributes:{},constantAttributes:{},buffers:[]},a=t.id??"arrow-text";return(t.clipRects===void 0||t.clipRects===null)&&we(e,o,`${a}-constant-clip-rect`,"glyphClipRects",{name:"constantTextClipRect",byteStride:0,stepMode:"instance",attributes:[{attribute:"glyphClipRects",format:"float32x4",byteOffset:0}]},new Float32Array([0,0,-1,-1])),n||we(e,o,`${a}-constant-color`,"colors",{name:"constantTextColor",byteStride:0,stepMode:"instance",attributes:[{attribute:"colors",format:"float32x4",byteOffset:0}]},new Float32Array(r.map(i=>i/255))),(t.angles===void 0||t.angles===null)&&we(e,o,`${a}-constant-angle`,"angles",{name:"constantTextAngle",byteStride:0,stepMode:"instance",attributes:[{attribute:"angles",format:"float32",byteOffset:0}]},new Float32Array([t.angle??0])),(t.sizes===void 0||t.sizes===null)&&we(e,o,`${a}-constant-size`,"sizes",{name:"constantTextSize",byteStride:0,stepMode:"instance",attributes:[{attribute:"sizes",format:"float32",byteOffset:0}]},new Float32Array([t.size??32])),(t.pixelOffsets===void 0||t.pixelOffsets===null)&&we(e,o,`${a}-constant-pixel-offset`,"pixelOffsets",{name:"constantTextPixelOffset",byteStride:0,stepMode:"instance",attributes:[{attribute:"pixelOffsets",format:"float32x2",byteOffset:0}]},new Float32Array([0,0])),o}function we(e,t,n,r,o,a){if(t.bufferLayout.push(o),e.type==="webgl")t.constantAttributes[r]=a;else{const i=e.createBuffer({id:n,data:a});t.attributes[o.name]=i,t.buffers.push(i)}}function Ge(e){for(const t of e)t.destroy()}export{Tn as A,dl as b};
