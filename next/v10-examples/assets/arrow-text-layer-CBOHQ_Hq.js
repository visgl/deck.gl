import{p as Jn}from"./project32-Byi-VnKS.js";import{M as Or,B as p,C as Gr,D as Ge,S as Dr,ah as Qn,ai as eo,G as to,L as ro,p as Jt,d as no}from"./deck-example-device-TQPRJnZ6.js";import{d as oo,m as so,e as io}from"./arrow-picking-CbYfFBev.js";import{ah as ao,ai as lo,aj as co,ak as uo,al as fo,am as go,an as ho,ao as xo,ap as po,v as yo,G as wo,g as Qt,a as er,V as re,ae as mo,af as Se,f as _r,D,q as H,F as V,U as Ne,j as Ct,m as Y,s as So,t as Bt,T as k,n as ve,p as tr,aq as nt,ar as Me,S as Mr,d as bo,w as Ro,as as rr,l as To,b as Io,c as Ao,A as gt,at as nr,au as or,_ as Et,av as vo,a3 as Co,a6 as Bo,r as Eo,a7 as Po,O as Vr,y as Oo,z as Go,C as sr,X as Ve,a9 as Do,K as _o,H as ir,E as ar,P as Mo,R as Vo,I as Lo,Q as Uo}from"./arrow-example-panels-fMfN3W7u.js";import{D as Lr}from"./dynamic-texture-NQQfRyls.js";import{p as Ee,m as ae}from"./arrow-fixed-size-list-CYN_Mtwc.js";const Fo=65536;function ue(e){return e<0&&(e=4294967295+e+1),`0x${e.toString(16)}`}const ye=8,Pt=[1,10,100,1e3,1e4,1e5,1e6,1e7,1e8];class Ot{constructor(t){this.buffer=t}high(){return this.buffer[1]}low(){return this.buffer[0]}_times(t){const r=new Uint32Array([this.buffer[1]>>>16,this.buffer[1]&65535,this.buffer[0]>>>16,this.buffer[0]&65535]),n=new Uint32Array([t.buffer[1]>>>16,t.buffer[1]&65535,t.buffer[0]>>>16,t.buffer[0]&65535]);let o=r[3]*n[3];this.buffer[0]=o&65535;let s=o>>>16;return o=r[2]*n[3],s+=o,o=r[3]*n[2]>>>0,s+=o,this.buffer[0]+=s<<16,this.buffer[1]=s>>>0<o?Fo:0,this.buffer[1]+=s>>>16,this.buffer[1]+=r[1]*n[3]+r[2]*n[2]+r[3]*n[1],this.buffer[1]+=r[0]*n[3]+r[1]*n[2]+r[2]*n[1]+r[3]*n[0]<<16,this}_plus(t){const r=this.buffer[0]+t.buffer[0]>>>0;this.buffer[1]+=t.buffer[1],r<this.buffer[0]>>>0&&++this.buffer[1],this.buffer[0]=r}lessThan(t){return this.buffer[1]<t.buffer[1]||this.buffer[1]===t.buffer[1]&&this.buffer[0]<t.buffer[0]}equals(t){return this.buffer[1]===t.buffer[1]&&this.buffer[0]==t.buffer[0]}greaterThan(t){return t.lessThan(this)}hex(){return`${ue(this.buffer[1])} ${ue(this.buffer[0])}`}}class C extends Ot{times(t){return this._times(t),this}plus(t){return this._plus(t),this}static from(t,r=new Uint32Array(2)){return C.fromString(typeof t=="string"?t:t.toString(),r)}static fromNumber(t,r=new Uint32Array(2)){return C.fromString(t.toString(),r)}static fromString(t,r=new Uint32Array(2)){const n=t.length,o=new C(r);for(let s=0;s<n;){const i=ye<n-s?ye:n-s,a=new C(new Uint32Array([Number.parseInt(t.slice(s,s+i),10),0])),l=new C(new Uint32Array([Pt[i],0]));o.times(l),o.plus(a),s+=i}return o}static convertArray(t){const r=new Uint32Array(t.length*2);for(let n=-1,o=t.length;++n<o;)C.from(t[n],new Uint32Array(r.buffer,r.byteOffset+2*n*4,2));return r}static multiply(t,r){return new C(new Uint32Array(t.buffer)).times(r)}static add(t,r){return new C(new Uint32Array(t.buffer)).plus(r)}}class N extends Ot{negate(){return this.buffer[0]=~this.buffer[0]+1,this.buffer[1]=~this.buffer[1],this.buffer[0]==0&&++this.buffer[1],this}times(t){return this._times(t),this}plus(t){return this._plus(t),this}lessThan(t){const r=this.buffer[1]<<0,n=t.buffer[1]<<0;return r<n||r===n&&this.buffer[0]<t.buffer[0]}static from(t,r=new Uint32Array(2)){return N.fromString(typeof t=="string"?t:t.toString(),r)}static fromNumber(t,r=new Uint32Array(2)){return N.fromString(t.toString(),r)}static fromString(t,r=new Uint32Array(2)){const n=t.startsWith("-"),o=t.length,s=new N(r);for(let i=n?1:0;i<o;){const a=ye<o-i?ye:o-i,l=new N(new Uint32Array([Number.parseInt(t.slice(i,i+a),10),0])),c=new N(new Uint32Array([Pt[a],0]));s.times(c),s.plus(l),i+=a}return n?s.negate():s}static convertArray(t){const r=new Uint32Array(t.length*2);for(let n=-1,o=t.length;++n<o;)N.from(t[n],new Uint32Array(r.buffer,r.byteOffset+2*n*4,2));return r}static multiply(t,r){return new N(new Uint32Array(t.buffer)).times(r)}static add(t,r){return new N(new Uint32Array(t.buffer)).plus(r)}}class X{constructor(t){this.buffer=t}high(){return new N(new Uint32Array(this.buffer.buffer,this.buffer.byteOffset+8,2))}low(){return new N(new Uint32Array(this.buffer.buffer,this.buffer.byteOffset,2))}negate(){return this.buffer[0]=~this.buffer[0]+1,this.buffer[1]=~this.buffer[1],this.buffer[2]=~this.buffer[2],this.buffer[3]=~this.buffer[3],this.buffer[0]==0&&++this.buffer[1],this.buffer[1]==0&&++this.buffer[2],this.buffer[2]==0&&++this.buffer[3],this}times(t){const r=new C(new Uint32Array([this.buffer[3],0])),n=new C(new Uint32Array([this.buffer[2],0])),o=new C(new Uint32Array([this.buffer[1],0])),s=new C(new Uint32Array([this.buffer[0],0])),i=new C(new Uint32Array([t.buffer[3],0])),a=new C(new Uint32Array([t.buffer[2],0])),l=new C(new Uint32Array([t.buffer[1],0])),c=new C(new Uint32Array([t.buffer[0],0]));let u=C.multiply(s,c);this.buffer[0]=u.low();const f=new C(new Uint32Array([u.high(),0]));return u=C.multiply(o,c),f.plus(u),u=C.multiply(s,l),f.plus(u),this.buffer[1]=f.low(),this.buffer[3]=f.lessThan(u)?1:0,this.buffer[2]=f.high(),new C(new Uint32Array(this.buffer.buffer,this.buffer.byteOffset+8,2)).plus(C.multiply(n,c)).plus(C.multiply(o,l)).plus(C.multiply(s,a)),this.buffer[3]+=C.multiply(r,c).plus(C.multiply(n,l)).plus(C.multiply(o,a)).plus(C.multiply(s,i)).low(),this}plus(t){const r=new Uint32Array(4);return r[3]=this.buffer[3]+t.buffer[3]>>>0,r[2]=this.buffer[2]+t.buffer[2]>>>0,r[1]=this.buffer[1]+t.buffer[1]>>>0,r[0]=this.buffer[0]+t.buffer[0]>>>0,r[0]<this.buffer[0]>>>0&&++r[1],r[1]<this.buffer[1]>>>0&&++r[2],r[2]<this.buffer[2]>>>0&&++r[3],this.buffer[3]=r[3],this.buffer[2]=r[2],this.buffer[1]=r[1],this.buffer[0]=r[0],this}hex(){return`${ue(this.buffer[3])} ${ue(this.buffer[2])} ${ue(this.buffer[1])} ${ue(this.buffer[0])}`}static multiply(t,r){return new X(new Uint32Array(t.buffer)).times(r)}static add(t,r){return new X(new Uint32Array(t.buffer)).plus(r)}static from(t,r=new Uint32Array(4)){return X.fromString(typeof t=="string"?t:t.toString(),r)}static fromNumber(t,r=new Uint32Array(4)){return X.fromString(t.toString(),r)}static fromString(t,r=new Uint32Array(4)){const n=t.startsWith("-"),o=t.length,s=new X(r);for(let i=n?1:0;i<o;){const a=ye<o-i?ye:o-i,l=new X(new Uint32Array([Number.parseInt(t.slice(i,i+a),10),0,0,0])),c=new X(new Uint32Array([Pt[a],0,0,0]));s.times(c),s.plus(l),i+=a}return n?s.negate():s}static convertArray(t){const r=new Uint32Array(t.length*4);for(let n=-1,o=t.length;++n<o;)X.from(t[n],new Uint32Array(r.buffer,r.byteOffset+16*n,4));return r}}const zo=Object.freeze(Object.defineProperty({__proto__:null,BaseInt64:Ot,Int128:X,Int64:N,Uint64:C},Symbol.toStringTag,{value:"Module"}));function ko(e){var t,r;const n=e.length,o=new Int32Array(n*2);for(let s=0,i=0;s<n;s++){const a=e[s];o[i++]=(t=a.days)!==null&&t!==void 0?t:0,o[i++]=(r=a.milliseconds)!==null&&r!==void 0?r:0}return o}function No(e){var t,r;const n=e.length,o=new Int32Array(n*4);for(let s=0,i=0;s<n;s++){const a=e[s];o[i++]=(t=a.months)!==null&&t!==void 0?t:0,o[i++]=(r=a.days)!==null&&r!==void 0?r:0;const l=a.nanoseconds;l?(o[i++]=Number(BigInt(l)&BigInt(4294967295)),o[i++]=Number(BigInt(l)>>BigInt(32))):i+=2}return o}function $o(e){const t=e.length,r=new Array(t/2);for(let n=0,o=0;n<t;n+=2)r[o++]={days:e[n],milliseconds:e[n+1]};return r}function Yo(e,t){const r=e.length,n=new Array(r/4);for(let o=0,s=0;o<r;o+=4){const i=BigInt(e[o+3])<<BigInt(32)|BigInt(e[o+2]>>>0);n[s++]={months:e[o],days:e[o+1],nanoseconds:t?`${i}`:i}}return n}const Xo=Object.freeze(Object.defineProperty({__proto__:null,toIntervalDayTimeInt32Array:ko,toIntervalDayTimeObjects:$o,toIntervalMonthDayNanoInt32Array:No,toIntervalMonthDayNanoObjects:Yo},Symbol.toStringTag,{value:"Module"})),Gt=Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign(Object.assign({},ao),zo),lo),co),uo),fo),go),Xo),{compareSchemas:po,compareFields:xo,compareTypes:ho});class Wo{needsRedrawReason=!1;drawBatches(...t){this.draw(...t)}needsRedraw(){const t=this.needsRedrawReason;return this.needsRedrawReason=!1,t}setNeedsRedraw(t){this.needsRedrawReason||=t}}class lr{device;fontAtlas;atlasTexture;destroyed=!1;constructor(t,r){this.device=t,this.fontAtlas=r.fontAtlas,this.atlasTexture=new Lr(t,{id:`${r.id||"text"}-atlas`,dimension:"2d-array",data:[...r.fontAtlas.pages]})}destroy(){this.destroyed||(this.destroyed=!0,this.atlasTexture.destroy())}}class Ho{resources;strategy;sourceBatchIndex;rowIndexBase;glyphIndexBase;rowCount;glyphCount;stats;props;destroySource;destroyed=!1;constructor(t,r){this.props=t,this.resources=r.resources,this.strategy=t.strategy,this.sourceBatchIndex=r.sourceBatchIndex,this.rowIndexBase=r.rowIndexBase,this.glyphIndexBase=r.glyphIndexBase,this.rowCount=r.rowCount,this.destroySource=r.destroySource,this.glyphCount=t.strategy==="attribute"?t.state.glyphLayout.glyphCount:t.state.glyphCount,this.stats=qo(t,r.rowCount)}destroy(){this.destroyed||(this.destroyed=!0,jo(this.props),this.destroySource?.())}getInternalProps(){return this.props}}function ot(e,t){return new Ho(e,{sourceBatchIndex:0,rowIndexBase:0,glyphIndexBase:0,...t})}function Ur(e){return e.getInternalProps()}function qo(e,t){if(e.strategy==="attribute"){const n=e.state;return{strategy:e.strategy,rowCount:t,glyphCount:n.glyphLayout.glyphCount,sourceBatchCount:1,renderBatchCount:n.renderBatches.length,preparationTimeMs:n.glyphAttributeBuildTimeMs,retainedByteLength:n.glyphAttributeByteLength,transientByteLength:0}}const r=e.state;return{strategy:e.strategy,rowCount:t,glyphCount:r.glyphCount,sourceBatchCount:1,renderBatchCount:r.renderBatches.length,preparationTimeMs:r.glyphAttributeBuildTimeMs+r.compactStreamBuildTimeMs,retainedByteLength:r.glyphAttributeByteLength+r.compactStreamByteLength+r.rowStorageByteLength+r.glyphDefinitionStorageByteLength,transientByteLength:r.transientComputeInputByteLength}}function jo(e){if(e.strategy==="attribute"){e.state.destroy();return}e.state.destroy()}function qe({functionName:e="getTextGlyphAlpha",fontAtlasTexture:t="fontAtlasTexture",textureCoordinate:r,atlasPage:n,settings:o}){const s=Fr(e);return`float ${s}(vec3 value) {
  return max(min(value.r, value.g), min(max(value.r, value.g), value.b));
}

float ${e}() {
  vec4 sampledColor = texture(${t}, vec3(${r}, float(${n})));
  if (${o.renderMode.expression} > 1.5) {
    vec2 atlasSize = vec2(textureSize(${t}, 0).xy);
    vec2 unitRange = vec2(${o.msdfDistanceRange}) / atlasSize;
    vec2 screenTexSize = 1.0 / fwidth(${r});
    float screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
    return clamp(screenPxRange * (${s}(sampledColor.rgb) - 0.5) + 0.5, 0.0, 1.0);
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
`}function De({functionName:e="getTextGlyphAlpha",fontAtlasTexture:t="fontAtlasTexture",fontAtlasTextureSampler:r="fontAtlasTextureSampler",textureCoordinate:n,atlasPage:o,settings:s}){const i=Fr(e),a=s.renderMode.kind==="uint"?`${s.renderMode.expression} == 2u`:`${s.renderMode.expression} > 1.5`,l=s.renderMode.kind==="uint"?`${s.renderMode.expression} == 0u`:`${s.renderMode.expression} < 0.5`;return`fn ${i}(value: vec3<f32>) -> f32 {
  return max(min(value.r, value.g), min(max(value.r, value.g), value.b));
}

fn ${e}(inputs : FragmentInputs) -> f32 {
  let sampledColor = textureSample(
    ${t},
    ${r},
    ${n},
    i32(${o})
  );
  if (${a}) {
    let unitRange = vec2<f32>(${s.msdfDistanceRange}) /
      vec2<f32>(textureDimensions(${t}));
    let screenTexSize = vec2<f32>(1.0) / fwidth(${n});
    let screenPxRange = max(0.5 * dot(unitRange, screenTexSize), 1.0);
    return clamp(screenPxRange * (${i}(sampledColor.rgb) - 0.5) + 0.5, 0.0, 1.0);
  }
  let sampledAlpha = sampledColor.a;
  if (${l}) {
    return sampledAlpha;
  }
  if (${s.sdfSmoothing} > 0.0) {
    return smoothstep(
      ${s.sdfThreshold} - ${s.sdfSmoothing},
      ${s.sdfThreshold} + ${s.sdfSmoothing},
      sampledAlpha
    );
  }
  return select(0.0, 1.0, sampledAlpha >= ${s.sdfThreshold});
}
`}function Fr(e){return e==="getTextGlyphAlpha"?"getMedian":`${e}Median`}const Ko={renderMode:{expression:"textFontRenderMode",kind:"float"},sdfThreshold:"textSdfThreshold",sdfSmoothing:"textSdfSmoothing",msdfDistanceRange:"textMsdfDistanceRange"},zr={renderMode:{expression:"textStorageStyleConfig.fontRenderMode",kind:"uint"},sdfThreshold:"textStorageStyleConfig.sdfThreshold",sdfSmoothing:"textStorageStyleConfig.sdfSmoothing",msdfDistanceRange:"textStorageStyleConfig.msdfDistanceRange"},Dt="glyphOffsets",Zo="glyphFrames",Jo="glyphPages",kr="glyphIndices",Nr="glyphRowIndices",Qo="glyphClipRects",cr="expandedGlyphVertexData",fe="compactGlyphVertexData",es=Uint32Array.BYTES_PER_ELEMENT*2,_t=Uint32Array.BYTES_PER_ELEMENT*3,ts=4294967295,$r={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:Dt,location:1,type:"vec2<i32>",stepMode:"instance"},{name:Zo,location:2,type:"vec4<u32>",stepMode:"instance"},{name:Jo,location:3,type:"u32",stepMode:"instance"}],bindings:[]},rs={attributes:[...$r.attributes,{name:Qo,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},Yr={attributes:[{name:Dt,location:0,type:"vec2<i32>",stepMode:"instance"},{name:kr,location:1,type:"vec2<u32>",stepMode:"instance"}],bindings:[]},ns={attributes:[...Yr.attributes,{name:Nr,location:2,type:"u32",stepMode:"instance"}],bindings:[]},os={attributes:[],bindings:[]},ss=`#version 300 es
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
`,is=`#version 300 es
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
`,as=`#version 300 es
precision highp float;

uniform highp sampler2DArray fontAtlasTexture;
uniform float textFontRenderMode;
uniform float textSdfThreshold;
uniform float textSdfSmoothing;
uniform float textMsdfDistanceRange;
in vec2 vTextureCoordinate;
flat in uint vAtlasPage;
out vec4 fragColor;

${qe({textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:Ko})}

void main() {
  fragColor = vec4(1.0, 1.0, 1.0, getTextGlyphAlpha());
}
`,Xr=`
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

${De({textureCoordinate:"inputs.atlasUV",atlasPage:"inputs.atlasPage",settings:zr})}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  return vec4<f32>(inputs.color.rgb, inputs.color.a * getTextGlyphAlpha(inputs));
}
`,ls=Xr.replace("@location(1) glyphIndices : vec2<u32>,",`@location(1) glyphIndices : vec2<u32>,
  @location(2) glyphRowIndices : u32,`).replace("let rowIndex = findRowIndex(glyphIndex);","let rowIndex = inputs.glyphRowIndices;"),cs=`
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
  if (dictionaryIndex == ${ts}u) {
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

${De({textureCoordinate:"inputs.atlasUV",atlasPage:"inputs.atlasPage",settings:zr})}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  return vec4<f32>(inputs.color.rgb, inputs.color.a * getTextGlyphAlpha(inputs));
}
`,Wr=["sint8","sint16","sint32","uint8","uint16","uint32"],Hr=["value-list<uint8>",...Wr],us=[{columnName:"positions",kind:"positions",required:!0,formats:["float32x2"]},{columnName:"texts",kind:"text",required:!0,formats:Hr},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"angles",kind:"scalars",required:!1,formats:["float32"]},{columnName:"sizes",kind:"scalars",required:!1,formats:["float32"]},{columnName:"pixelOffsets",kind:"positions",required:!1,formats:["float32x2"]},{columnName:"clipRects",kind:"positions",required:!1,formats:["float32x4"]}],Mt=[{columnName:"positions",kind:"positions",required:!0,formats:["float32x2"]},{columnName:"texts",kind:"text",required:!0,formats:Hr},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4"]},{columnName:"angles",kind:"scalars",required:!1,formats:["float32"]},{columnName:"sizes",kind:"scalars",required:!1,formats:["float32"]},{columnName:"pixelOffsets",kind:"positions",required:!1,formats:["float32x2"]},{columnName:"textAnchors",kind:"scalars",required:!1,formats:["uint8"]},{columnName:"alignmentBaselines",kind:"scalars",required:!1,formats:["uint8"]},{columnName:"clipRects",kind:"positions",required:!1,formats:["float32x4"]}],fs=[{columnName:"positions",kind:"positions",required:!0,formats:["float32x2"]},{columnName:"texts",kind:"text",required:!0,formats:Wr},...Mt.slice(2)];function ds(e){gs("TextStorageModel",Mt,e)}function gs(e,t,r){const n=Object.fromEntries(t.map(s=>[s.columnName,r[s.columnName]]));yo(e,t,n);const o=r.positions.length;for(const s of t){const i=n[s.columnName];if(i&&i.length!==o)throw new Error(`${e} ${s.columnName} rows must match positions rows (${i.length} !== ${o})`)}}class hs extends wo{static gpuInputSchema=us;attributeStates;get attributeState(){return this.attributeStates[0]}constructor(t,r){const{attributeState:n,...o}=r;super(t,{...n.modelProps,...o}),this.attributeStates=[n]}addState(t){this.attributeStates.push(t),this.setNeedsRedraw("Text attribute batch appended")}draw(t){let r=!0;try{for(const n of this.attributeStates){const o=n.modelProps.table;for(const[s,i]of n.renderBatches.entries()){const a=o.batches[s];this.setAttributes({...Qt(a.bufferLayout,a.gpuData),[cr]:i.expandedGlyphVertexData},{byteOffsets:er(a.bufferLayout,a.gpuData)}),this.setInstanceCount(i.glyphCount),r=super.draw(t)&&r}}}finally{const o=this.attributeState.modelProps.table?.batches[0];this.setAttributes({...o?Qt(o.bufferLayout,o.gpuData):{},[cr]:this.attributeState.expandedGlyphVertexData},{byteOffsets:o?er(o.bufferLayout,o.gpuData):{}}),this.setInstanceCount(this.attributeStates.reduce((s,i)=>s+i.glyphLayout.glyphCount,0))}return r}}function Ue(e){const t=e.batches[0];if(!t)throw new Error("TextStorageState requires at least one row-binding batch");return t}function Fe(e){const t=e.renderBatches[0];if(!t)throw new Error("TextStorageState requires at least one render batch");return t}function xs(e){if(!e.rowGlyphStartsBuffer)throw new Error("TextStorageState batch is missing row glyph starts");return e.rowGlyphStartsBuffer}function ze(e){const t=e.batches[0];if(!t)throw new Error("TextDictionaryState requires at least one row-binding batch");return t}function ke(e){const t=e.renderBatches[0];if(!t)throw new Error("TextDictionaryState requires at least one render batch");return t}function ps(e,t){const r=e;if(r._areBindingsLoading()||(r._syncAttachmentFormats(t),r.pipeline=r._updatePipeline(),r.pipeline.isErrored))return!1;const n=r.vertexArray.indexBuffer,o=n?n.byteLength/(n.indexType==="uint32"?4:2):void 0;return r.pipeline.draw({renderPass:t,vertexArray:r.vertexArray,isInstanced:r.isInstanced,vertexCount:r.vertexCount,instanceCount:r.instanceCount,indexCount:o,transformFeedback:r.transformFeedback||void 0,bindings:r._getBindings(),bindGroups:r._getBindGroups(),_bindGroupCacheKeys:r._getBindGroupCacheKeys(),uniforms:r.props.uniforms,parameters:r.parameters})}function qr(e,t){if(e.type!=="webgpu")throw new Error(`${t} is WebGPU-only`)}function jr(e){if(e.storageState.renderBatches.length===1)return e.drawModelBatch();let t=!0;const r=e.model.device.type==="webgpu"&&e.storageState.renderBatches.length>1;r&&e.model.updateShaderInputs();for(const n of e.storageState.renderBatches){const o=e.storageState.batches[n.rowBindingBatchIndex];if(!o)throw new Error(e.missingBatchError);e.prepareBatch(o,n),e.model.setInstanceCount(n.glyphCount),t=(r?ps(e.model,e.renderPass):e.drawModelBatch())&&t}return e.restoreFirstBatch(),e.model.setInstanceCount(e.storageState.glyphCount),t}class ys extends Or{static gpuInputSchema=fs;storageStates;get storageState(){return this.storageStates[0]}renderProps;constructor(t,r){qr(t,"TextDictionaryModel");const{storageState:n,...o}=r;super(t,ws(o,n)),this.renderProps=o,this.storageStates=[n]}addState(t){this.storageStates.push(t),this.setNeedsRedraw("Text dictionary batch appended")}draw(t){let r=!0;for(const s of this.storageStates){const i=ze(s),a=ke(s);this.setBindings(Ie(this.renderProps,s,i,a)),this.setInstanceCount(a.glyphCount),r=jr({model:this,renderPass:t,storageState:s,missingBatchError:"TextDictionaryModel render batch is missing its row-binding batch",drawModelBatch:()=>super.draw(t),prepareBatch:(l,c)=>{this.setBindings(Ie(this.renderProps,s,l,c))},restoreFirstBatch:()=>{const l=ze(s),c=ke(s);this.setBindings(Ie(this.renderProps,s,l,c))}})&&r}const n=ze(this.storageState),o=ke(this.storageState);return this.setBindings(Ie(this.renderProps,this.storageState,n,o)),this.setInstanceCount(this.storageStates.reduce((s,i)=>s+i.glyphCount,0)),r}}function ws(e,t){const r=ke(t);return{...e,source:e.source??cs,shaderLayout:e.shaderLayout??os,bindings:Ie(e,t,ze(t),r),attributes:e.attributes??{},bufferLayout:e.bufferLayout??[],vertexCount:e.vertexCount??6,instanceCount:r.glyphCount}}function Ie(e,t,r,n){return{...e.bindings||{},textRowPositions:r.rowPositionsBuffer,textRowColors:r.rowColorsBuffer,textRowAngles:r.rowAnglesBuffer,textRowSizes:r.rowSizesBuffer,textRowPixelOffsets:r.rowPixelOffsetsBuffer,textRowClipRects:r.rowClipRectsBuffer,textRowDictionaryRecords:r.rowDictionaryRecordsBuffer,textDictionaryGlyphRanges:r.dictionaryGlyphRangesBuffer,textDictionaryGlyphRecords:r.dictionaryGlyphRecordsBuffer,textGlyphFrames:r.glyphFramesBuffer,textStorageStyleConfig:r.styleConfigBuffer,textDictionaryRenderConfig:n.dictionaryRenderConfigBuffer,...t.atlasTexture?{fontAtlasTexture:t.atlasTexture}:{}}}class Kr extends Or{static gpuInputSchema=Mt;storageStates;get storageState(){return this.storageStates[0]}renderProps;constructor(t,r){qr(t,"TextStorageModel");const{storageState:n,...o}=r;super(t,ms(o,n)),this.renderProps=o,this.storageStates=[n]}addState(t){this.storageStates.push(t),this.setNeedsRedraw("Text storage batch appended")}draw(t){let r=!0;for(const s of this.storageStates){const i=Ue(s),a=Fe(s);this.setAttributes({[fe]:a.compactGlyphVertexData}),this.setBindings(Ae(this.renderProps,s,i,a)),this.setInstanceCount(a.glyphCount),r=jr({model:this,renderPass:t,storageState:s,missingBatchError:"TextStorageModel render batch is missing its row-binding batch",drawModelBatch:()=>super.draw(t),prepareBatch:(l,c)=>{this.setAttributes({[fe]:c.compactGlyphVertexData}),this.setBindings(Ae(this.renderProps,s,l,c))},restoreFirstBatch:()=>{const l=Ue(s),c=Fe(s);this.setAttributes({[fe]:c.compactGlyphVertexData}),this.setBindings(Ae(this.renderProps,s,l,c))}})&&r}const n=Ue(this.storageState),o=Fe(this.storageState);return this.setAttributes({[fe]:o.compactGlyphVertexData}),this.setBindings(Ae(this.renderProps,this.storageState,n,o)),this.setInstanceCount(this.storageStates.reduce((s,i)=>s+i.glyphCount,0)),r}}function ms(e,t){const r=Fe(t),n=t.hasGlyphRowIndices===!0;return{...e,source:e.source??bs(t),shaderLayout:e.shaderLayout??Rs(t),bindings:Ae(e,t,Ue(t),r),attributes:{...e.attributes||{},[fe]:r.compactGlyphVertexData},bufferLayout:[...e.bufferLayout||[],{name:fe,stepMode:"instance",byteStride:n?_t:es,attributes:[{attribute:Dt,format:"sint16x2",byteOffset:0},{attribute:kr,format:"uint16x2",byteOffset:Uint32Array.BYTES_PER_ELEMENT},...n?[{attribute:Nr,format:"uint32",byteOffset:Uint32Array.BYTES_PER_ELEMENT*2}]:[]]}],vertexCount:e.vertexCount??6,instanceCount:r.glyphCount}}class Ss extends Kr{constructor(t,r){if(r.storageState.hasGlyphRowIndices!==!0)throw new Error("TextRowIndexedStorageModel requires hasGlyphRowIndices");super(t,r)}}function bs(e){return e.hasGlyphRowIndices===!0?ls:Xr}function Rs(e){return e.hasGlyphRowIndices===!0?ns:Yr}function Ae(e,t,r,n){return{...e.bindings||{},textRowPositions:r.rowPositionsBuffer,textRowColors:r.rowColorsBuffer,textRowAngles:r.rowAnglesBuffer,textRowSizes:r.rowSizesBuffer,textRowPixelOffsets:r.rowPixelOffsetsBuffer,textRowClipRects:r.rowClipRectsBuffer,textRowGlyphStarts:xs(r),textGlyphFrames:t.glyphFramesBuffer,textStorageStyleConfig:r.styleConfigBuffer,textStorageRenderConfig:n.storageRenderConfigBuffer,...t.atlasTexture?{fontAtlasTexture:t.atlasTexture}:{}}}class Ts{device;data;model;pickingModel;modelProps;destroyed=!1;constructor(t,r){this.device=t,this.data=fr(r.data),this.modelProps=r.modelProps,this.model=ur(t,this.data,r.modelProps),this.pickingModel=r.pickingModel}get stats(){return As(this.data)}get batches(){return this.data}draw(t){return this.model.draw(t)}drawPicking(t){return(this.pickingModel??this.model).draw(t)}appendData(t){Zr(this.model,t),this.data.push(t)}setProps(t){const r=t.data?fr(t.data):this.data,n=t.modelProps??this.modelProps;if(t.data!==void 0||t.modelProps!==void 0){const o=ur(this.device,r,n),s=this.model;this.data=r,this.modelProps=n,this.model=o,s.destroy()}t.pickingModel!==void 0&&t.pickingModel!==this.pickingModel&&(this.pickingModel?.destroy(),this.pickingModel=t.pickingModel)}destroy(){this.destroyed||(this.destroyed=!0,this.pickingModel?.destroy(),this.pickingModel=void 0,this.model.destroy())}}function Is(e){return e.model}function ur(e,t,r){const n=t[0],o=Ur(n);let s;switch(o.strategy){case"attribute":{s=new hs(e,{...o.modelProps,...r,attributeState:o.state});break}case"dictionary":{s=new ys(e,{...o.modelProps,...r,storageState:o.state});break}case"storage-row-indexed":{s=new Ss(e,{...o.modelProps,...r,storageState:o.state});break}case"storage":{s=new Kr(e,{...o.modelProps,...r,storageState:o.state});break}}for(const i of t.slice(1))Zr(s,i);return s}function Zr(e,t){const r=Ur(t);switch(r.strategy){case"attribute":e.addState(r.state);break;case"dictionary":e.addState(r.state);break;case"storage":case"storage-row-indexed":e.addState(r.state);break}}function fr(e){return"strategy"in e?[e]:[...e]}function As(e){return{strategy:e[0].strategy,rowCount:e.reduce((r,n)=>r+n.rowCount,0),glyphCount:e.reduce((r,n)=>r+n.glyphCount,0),sourceBatchCount:e.length,renderBatchCount:e.reduce((r,n)=>r+n.stats.renderBatchCount,0),preparationTimeMs:e.reduce((r,n)=>r+n.stats.preparationTimeMs,0),retainedByteLength:e.reduce((r,n)=>r+n.stats.retainedByteLength,0),transientByteLength:e.reduce((r,n)=>r+n.stats.transientByteLength,0)}}const vs=1114112;function Cs(e,t,r){return t===void 0?0:e?.lookup.get(t*vs+r)??0}function Jr(e){return e.atlasPage??0}function Qr(e){return[e.layoutOffsetX??e.anchorX,e.layoutOffsetY??0]}function Bs(e){return e===0?0:Math.pow(2,Math.ceil(Math.log2(e)))}function Es({characterSet:e,measureText:t,buffer:r,maxCanvasWidth:n,mapping:o={},xOffset:s=0,yOffsetMin:i=0,yOffsetMax:a=0}){let l=s,c=i,u=a;for(const f of e){if(o[f])continue;const{advance:d,width:h,ascent:m,descent:w}=t(f),g=m+w;l+h+r*2>n&&(l=0,c=u),o[f]={x:l+r,y:c+r,width:h,height:g,atlasPage:0,advance:d,anchorX:h/2,anchorY:m,layoutOffsetX:0,layoutOffsetY:-m},l+=h+r*2,u=Math.max(u,c+g+r*2)}return{mapping:o,xOffset:l,yOffsetMin:c,yOffsetMax:u,canvasHeight:Bs(u)}}const Ps=32;function Vt(e,t,r){const{fontAtlas:n}=t,o=t.lineHeight??n.lineHeight,s=t.missingCharacterWidth??Ps;let i=0,a=0,l,c=Number.POSITIVE_INFINITY,u=Number.POSITIVE_INFINITY,f=Number.NEGATIVE_INFINITY,d=Number.NEGATIVE_INFINITY;e(g=>{const y=String.fromCodePoint(g),x=n.mapping[y];t.characterSet?.add(y),i+=Cs(n.kerning,l,g);const[S,b]=x?Qr(x):[0,0],T=i+S,I=n.baselineOffset+o/2+b;x&&(c=Math.min(c,T),u=Math.min(u,I),f=Math.max(f,T+x.width),d=Math.max(d,I+x.height)),r?.({character:y,codePoint:g,frame:x,atlasPage:x?Jr(x):0,offsetX:T,offsetY:I}),i+=x?.advance??s,l=g,a++});const h=Os(i,t.textAnchor),m=Gs(o,t.alignmentBaseline),w=Number.isFinite(c);return{advance:i,glyphCount:a,anchorOffsetX:h,baselineOffsetY:m,bounds:w?{min:[c+h,u+m],max:[f+h,d+m]}:{min:[0,0],max:[0,0]}}}function Os(e,t){return t==="middle"?-e/2:t==="end"?-e:0}function Gs(e,t){return t==="top"?e/2:t==="bottom"?-e/2:0}class Ds{cache=new Map;limit;constructor(t){this.limit=t}get(t){const r=this.cache.get(t);if(r!==void 0)return this.cache.delete(t),this.cache.set(t,r),r}set(t,r){for(this.cache.has(t)&&this.cache.delete(t),this.cache.set(t,r);this.cache.size>this.limit;){const n=this.cache.keys().next().value;if(n===void 0)break;this.cache.delete(n)}}}const _s={fontFamily:"Monaco, monospace",fontWeight:"normal",characterSet:$s(),fontSize:64,buffer:4},st=1024,dr=.9,gr=.3,Ms=3;let ht=new Ds(Ms);function Vs(e){return{..._s,...e}}function Ls(e){const{settings:t,cacheKey:r,renderSettings:n}=e,o=zs(r,t.characterSet),s=ht.get(r);if(s&&o.size===0)return{...s,renderSettings:n};const i=Us(e,o,s);return ht.set(r,i),i}function Us(e,t,r){const{settings:n,renderSettings:o,createRenderer:s}=e,{fontFamily:i,fontWeight:a,fontSize:l,buffer:c}=n;let u=r?.pages[0];u||(u=Ns(st),u.width=st);const f=u.getContext("2d",{willReadFrequently:!0});if(!f)throw new Error("Font atlas builders require a 2D canvas context");hr(f,i,l,a);const d=b=>ks(f,l,b),h=s?.(d),{mapping:m,canvasHeight:w,xOffset:g,yOffsetMin:y,yOffsetMax:x}=Es({measureText:b=>h?h.measure(b):d(b),buffer:c,characterSet:t,maxCanvasWidth:st,...r&&{mapping:r.mapping,xOffset:r.xOffset,yOffsetMin:r.yOffsetMin,yOffsetMax:r.yOffsetMax}});if(u.height!==w){const b=u.height>0?f.getImageData(0,0,u.width,u.height):null;u.height=w,b&&f.putImageData(b,0,0)}hr(f,i,l,a),Fs(f,t,m,h);const S=h?h.measure():d();return{baselineOffset:(S.ascent-S.descent)/2,lineHeight:l,xOffset:g,yOffsetMin:y,yOffsetMax:x,mapping:m,renderSettings:o,pages:[u],width:u.width,height:u.height}}function Fs(e,t,r,n){if(!n){for(const o of t){const s=r[o];e.fillText(o,s.x,s.y+s.anchorY)}return}for(const o of t){const s=r[o],{data:i,left:a=0,top:l=0}=n.draw(o),c=s.x-a,u=s.y-l,f=Math.max(0,Math.round(c)),d=Math.max(0,Math.round(u)),h=Math.min(i.width,e.canvas.width-f),m=Math.min(i.height,e.canvas.height-d);e.putImageData(i,f,d,0,0,h,m),s.x+=f-c,s.y+=d-u}}function zs(e,t){const r=typeof t=="string"?new Set(Array.from(t)):new Set(t),n=ht.get(e);if(!n)return r;for(const o in n.mapping)r.delete(o);return r}function hr(e,t,r,n){e.font=`${n} ${r}px ${t}`,e.fillStyle="#000",e.textBaseline="alphabetic",e.textAlign="left"}function ks(e,t,r){if(r===void 0){const o=e.measureText("A");return o.fontBoundingBoxAscent?{advance:0,width:0,ascent:Math.ceil(o.fontBoundingBoxAscent),descent:Math.ceil(o.fontBoundingBoxDescent)}:{advance:0,width:0,ascent:t*dr,descent:t*gr}}const n=e.measureText(r);return n.actualBoundingBoxAscent?{advance:n.width,width:Math.ceil(n.actualBoundingBoxRight-n.actualBoundingBoxLeft),ascent:Math.ceil(n.actualBoundingBoxAscent),descent:Math.ceil(n.actualBoundingBoxDescent)}:{advance:n.width,width:n.width,ascent:t*dr,descent:t*gr}}function Ns(e){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(e,0);if(typeof document>"u")throw new Error("Font atlas builders require OffscreenCanvas or a browser-like document");return document.createElement("canvas")}function $s(){const e=[];for(let t=32;t<128;t++)e.push(String.fromCharCode(t));return e}const Ce=1e20,Lt=new Float64Array(256);for(let e=0;e<256;e++){const t=.5-Math.pow(e/255,.45454545454545453);Lt[e]=t*Math.abs(t)}Lt[255]=-Ce;class Ys{constructor({fontSize:t=24,buffer:r=3,radius:n=8,cutoff:o=.25,fontFamily:s="sans-serif",fontWeight:i="normal",fontStyle:a="normal",lang:l=null}={}){this.buffer=r,this.radius=n,this.cutoff=o,this.lang=l;const c=this.size=t+r*4,u=this._createCanvas(c),f=this.ctx=u.getContext("2d",{willReadFrequently:!0});f.font=`${a} ${i} ${t}px ${s}`,f.textBaseline="alphabetic",f.textAlign="left",f.fillStyle="black",this.gridOuter=new Float64Array(c*c),this.gridInner=new Float64Array(c*c),this.f=new Float64Array(c),this.z=new Float64Array(c+1),this.v=new Uint16Array(c)}_createCanvas(t){if(typeof OffscreenCanvas<"u")return new OffscreenCanvas(t,t);const r=document.createElement("canvas");return r.width=r.height=t,r}draw(t){const{width:r,actualBoundingBoxAscent:n,actualBoundingBoxDescent:o,actualBoundingBoxLeft:s,actualBoundingBoxRight:i}=this.ctx.measureText(t),a=Math.ceil(n),l=Math.floor(-s),c=Math.max(0,Math.min(this.size-this.buffer,Math.ceil(i)-l)),u=Math.max(0,Math.min(this.size-this.buffer,a+Math.ceil(o))),f=c+2*this.buffer,d=u+2*this.buffer,h=Math.max(f*d,0),m=new Uint8ClampedArray(h),w={data:m,width:f,height:d,glyphWidth:c,glyphHeight:u,glyphTop:a,glyphLeft:l,glyphAdvance:r};if(c===0||u===0)return w;const{ctx:g,buffer:y,gridInner:x,gridOuter:S}=this;this.lang&&(g.lang=this.lang),g.clearRect(y,y,c,u),g.fillText(t,y-l,y+a);const b=g.getImageData(y,y,c,u);S.fill(Ce,0,h),x.fill(0,0,h);let T=3;for(let R=0;R<u;R++){let M=(R+y)*f+y;for(let G=0;G<c;G++,T+=4,M++){const _=b.data[T];if(_===0)continue;const P=Lt[_];S[M]=Math.max(0,P),x[M]=Math.max(0,-P)}}xr(S,0,0,f,d,f,this.f,this.v,this.z);const I=Math.min(y,1);xr(x,y-I,y-I,c+2*I,u+2*I,f,this.f,this.v,this.z);const A=255/this.radius,v=255*(1-this.cutoff);for(let R=0;R<h;R++){const M=Math.sqrt(S[R])-Math.sqrt(x[R]);m[R]=Math.round(v-A*M)}return w}}function xr(e,t,r,n,o,s,i,a,l){for(let c=t;c<t+n;c++)pr(e,r*s+c,s,o,i,a,l);for(let c=r;c<r+o;c++)pr(e,c*s+t,1,n,i,a,l)}function pr(e,t,r,n,o,s,i){s[0]=0,i[0]=-Ce,i[1]=Ce,o[0]=e[t];for(let a=1,l=0,c=0;a<n;a++){o[a]=e[t+a*r];const u=a*a;do{const f=s[l];c=(o[a]-o[f]+u-f*f)/(a-f)/2}while(c<=i[l]&&--l>-1);l++,s[l]=a,i[l]=c,i[l+1]=Ce}for(let a=0,l=0;a<n;a++){for(;i[l+1]<a;)l++;const c=s[l],u=a-c;e[t+a*r]=o[c]+u*u}}const Xs={cutoff:.25,radius:12,smoothing:.1};function Dl(e={}){const{cutoff:t,radius:r,smoothing:n}={...Xs,...e},o=Vs(e),{fontFamily:s,fontWeight:i,fontSize:a,buffer:l}=o;return Ls({settings:o,cacheKey:`sdf ${s} ${i} ${a} ${l} ${r} ${t}`,renderSettings:{mode:"sdf",threshold:1-t,smoothing:Math.max(0,n)},createRenderer:c=>({measure:c,draw:Ws({fontFamily:s,fontWeight:i,fontSize:a,buffer:l,radius:r,cutoff:t})})})}function Ws({fontSize:e,buffer:t,radius:r,cutoff:n,fontFamily:o,fontWeight:s}){const i=new Ys({fontSize:e,buffer:t,radius:r,cutoff:n,fontFamily:o,fontWeight:`${s}`});return a=>{const{data:l,width:c,height:u}=i.draw(a),f=new ImageData(c,u);for(let d=0;d<l.length;d++)f.data[4*d+3]=l[d];return{data:f,left:t,top:t}}}const _e=32,we=65535,it=4294967295;function Hs(e,t){const{fontAtlas:r,characterSet:n}=t,o=t.missingCharacterWidth??_e,s=tn(e),i=s[e.rowCount]??0,a=new Int16Array(i*2),l=new Uint16Array(i*4),c=new Uint16Array(i),u=new Float32Array(e.rowCount),f=new Float32Array(e.rowCount*4),d=je(r,n,o);let h=0,m=0;for(let w=0;w<e.rowCount;w++){const g=h,y=Vt(x=>e.visitCodePoints(w,x),t,({codePoint:x,atlasPage:S,offsetX:b,offsetY:T})=>{const{frame:I}=Ke(d,x);a[h++]=te(b),a[h++]=te(T),l[m++]=ie(I?.x??0),l[m++]=ie(I?.y??0),l[m++]=ie(I?.width??0),l[m++]=ie(I?.height??0),c[m/4-1]=ie(S)});for(let x=g;x<h;x+=2)a[x]=te(a[x]+y.anchorOffsetX),a[x+1]=te(a[x+1]+y.baselineOffsetY);u[w]=y.advance,f.set([...y.bounds.min,...y.bounds.max],w*4)}return{startIndices:s,glyphCount:i,glyphOffsets:a,glyphFrames:l,glyphPages:c,rowAdvances:u,rowBounds:f,characterSet:n}}function qs(e,t){const r=$e(),{fontAtlas:n,characterSet:o}=t,s=t.lineHeight??n.lineHeight,i=t.missingCharacterWidth??_e,a=tn(e),l=a[e.rowCount]??0,c=new Uint32Array(e.rowCount*2),u=new Uint32Array(Math.ceil(l/2)),f=je(n,o,i);let d=0;for(let S=0;S<e.rowCount;S++){const b=a[S]??0,T=a[S+1]??b;c[S*2]=b,c[S*2+1]=T,Vt(I=>e.visitCodePoints(S,I),t,({codePoint:I})=>{const{glyphId:A}=Ke(f,I);Ks(u,d,A),d++})}const h=new Float32Array(f.glyphFrameValues),m=new Int32Array(f.glyphMetricValues),w=new Uint32Array(f.glyphPageValues),g=rn(f.glyphIdsByCodePoint,n),y=c.byteLength+u.byteLength,x=h.byteLength+m.byteLength+w.byteLength+g.byteLength;return{startIndices:a,glyphCount:l,labelGlyphRanges:c,packedGlyphIds:u,glyphFrames:h,glyphMetrics:m,glyphPages:w,glyphKernings:g,baselineOffsetY:te(n.baselineOffset+s/2),characterSet:o,compactStreamByteLength:y,glyphDefinitionByteLength:x,glyphStreamBuildTimeMs:$e()-r}}function js(e,t){const r=$e(),{fontAtlas:n,characterSet:o}=t,s=t.missingCharacterWidth??_e,i=new Uint32Array(e.rowCount*2),a=new Uint32Array(e.rowCount),l=new Uint32Array(e.dictionaryValueCount*2),c=[],u=new Array(e.rowCount+1),f=je(n,o,s);let d=0;u[0]=0,a.fill(it);for(let g=0;g<e.dictionaryValueCount;g++){const y=c.length/2,x=[],S=Vt(b=>e.visitDictionaryCodePoints(g,b),t,({codePoint:b,offsetX:T,offsetY:I,atlasPage:A})=>{const{glyphId:v}=Ke(f,b);x.push({offsetX:T,offsetY:I,glyphId:v,atlasPage:A})});for(const b of x)c.push(Zs(b.offsetX+S.anchorOffsetX,b.offsetY+S.baselineOffsetY),Js(b.glyphId,b.atlasPage));l[g*2]=y,l[g*2+1]=c.length/2}for(let g=0;g<e.rowCount;g++){const y=e.getRowDictionaryIndex(g),x=y>=0&&y<e.dictionaryValueCount?y:it;if(a[g]=x,i[g*2]=d,x!==it){const S=l[x*2]??0,b=l[x*2+1]??S;d+=Math.max(0,b-S)}i[g*2+1]=d,u[g+1]=d}const h=new Uint32Array(c),m=new Float32Array(f.glyphFrameValues),w=i.byteLength+a.byteLength+l.byteLength+h.byteLength;return{startIndices:u,rowGlyphRanges:i,rowDictionaryIndices:a,dictionaryGlyphRanges:l,dictionaryGlyphRecords:h,glyphFrames:m,glyphCount:d,dictionaryGlyphCount:h.length/2,dictionaryValueCount:e.dictionaryValueCount,characterSet:o,compressedStreamByteLength:w,glyphDefinitionByteLength:m.byteLength,glyphStreamBuildTimeMs:$e()-r}}function en(e,t){const{fontAtlas:r}=t,n=t.lineHeight??r.lineHeight,o=t.missingCharacterWidth??_e,s=je(r,void 0,o),i=[],a=new Set;for(const l of e)for(const c of l){const u=c.codePointAt(0);if(u===void 0||a.has(u))continue;a.add(u);const{glyphId:f}=Ke(s,u);i.push(u,f)}return{glyphFrames:new Float32Array(s.glyphFrameValues),glyphMetrics:new Int32Array(s.glyphMetricValues),glyphPages:new Uint32Array(s.glyphPageValues),glyphKernings:rn(s.glyphIdsByCodePoint,r),glyphLookup:new Uint32Array(i),baselineOffsetY:te(r.baselineOffset+n/2)}}function tn(e){const t=new Array(e.rowCount+1);let r=0;t[0]=0;for(let n=0;n<e.rowCount;n++)r+=e.countCodePoints(n),t[n+1]=r;return t}function je(e,t,r=_e){return{fontAtlas:e,characterSet:t,definitionsByCodePoint:new Map,glyphIdsByCodePoint:new Map,glyphFrameValues:[0,0,0,0],glyphMetricValues:[0,0,r,0],glyphPageValues:[0]}}function Ke(e,t){const r=e.definitionsByCodePoint.get(t);if(r)return r;const n=String.fromCodePoint(t),o=e.fontAtlas.mapping[n];let s=0;if(o){if(s=e.glyphFrameValues.length/4,s>we)throw new Error("Text glyph definitions exceed the uint16 glyph id range");const[a,l]=Qr(o);e.glyphFrameValues.push(o.x,o.y,o.width,o.height),e.glyphMetricValues.push(a,l,o.advance,0),e.glyphPageValues.push(Jr(o))}const i={frame:o,glyphId:s};return e.definitionsByCodePoint.set(t,i),e.glyphIdsByCodePoint.set(t,s),e.characterSet?.add(n),i}function rn(e,t){if(!t.kerning)return new Int32Array(0);const r=[];for(const n of t.kerning.pairs){const o=e.get(n.first),s=e.get(n.second);o===void 0||s===void 0||r.push([o,s,n.amount,0])}return r.sort((n,o)=>(n[0]??0)-(o[0]??0)||(n[1]??0)-(o[1]??0)),new Int32Array(r.flat())}function Ks(e,t,r){const n=t>>1,o=e[n]??0;e[n]=t&1?o|(r&we)<<16:o|r&we}function Zs(e,t){return(te(t)&65535)<<16|te(e)&65535}function Js(e,t){return(ie(t)&we)<<16|ie(e)&we}function te(e){const t=Math.round(e);if(t<-32768||t>32767)throw new Error(`Text glyph offset ${e} is outside the signed 16-bit range`);return t}function ie(e){const t=Math.round(e);if(t<0||t>we)throw new Error(`Text glyph value ${e} is outside the unsigned 16-bit range`);return t}function $e(){return globalThis.performance?.now()??Date.now()}const at={rowByteRanges:"utf8RowByteRanges",utf8Bytes:"utf8Bytes",mapStorage:"utf8MapStorage"};function Qs(e={}){const t=nn(e),r=e.group??0,n=e.firstLocation??0;return[{name:t.rowByteRanges,type:"read-only-storage",group:r,location:n},{name:t.utf8Bytes,type:"read-only-storage",group:r,location:n+1},{name:t.mapStorage,type:"read-only-storage",group:r,location:n+2}]}function ei(e){const t=nn(e),r=e.group??0,n=e.firstLocation??0;return`
@group(${r}) @binding(${n}) var<storage, read> ${t.rowByteRanges} : array<vec2<u32>>;
@group(${r}) @binding(${n+1}) var<storage, read> ${t.utf8Bytes} : array<u32>;
@group(${r}) @binding(${n+2}) var<storage, read> ${t.mapStorage} : array<vec2<u32>>;

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
`}function nn(e){return{rowByteRanges:e.rowByteRanges??at.rowByteRanges,utf8Bytes:e.utf8Bytes??at.utf8Bytes,mapStorage:e.mapStorage??at.mapStorage}}const on=7,sn=10;function Ut(e,t=0){return e.type==="webgpu"&&e.limits.maxStorageBuffersPerShaderStage>=on+t}function Ft(e){return e.type==="webgpu"&&e.limits.maxStorageBuffersPerShaderStage>=sn}const zt=`
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
`,an=`
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

${zt}

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
`,ti=kt(an,"rowIndex + u32(max(textExpansionConfig[2], 0))"),yr={bindings:[{name:"textGlyphRanges",type:"read-only-storage",group:0,location:0},{name:"textGlyphIds",type:"read-only-storage",group:0,location:1},{name:"textGlyphMetrics",type:"read-only-storage",group:0,location:2},{name:"textGlyphPages",type:"read-only-storage",group:0,location:3},{name:"textGlyphKernings",type:"read-only-storage",group:0,location:4},{name:"textExpansionConfig",type:"read-only-storage",group:0,location:5},{name:"generatedGlyphVertices",type:"storage",group:0,location:6},{name:"textRowTextAnchors",type:"read-only-storage",group:0,location:7},{name:"textRowAlignmentBaselines",type:"read-only-storage",group:0,location:8}],attributes:[]};function ri(e,t,r){let n=e;const o=new Set;return t||(n=n.replace(`@group(0) @binding(7) var<storage, read> textRowTextAnchors : array<u32>;
`,"").replace(`fn getTextAnchor(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[3], 0));
  if (textExpansionConfig[5] != 0) {
    let packedAnchorWord = textRowTextAnchors[rowStorageIndex >> 2u];
    return (packedAnchorWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[4], 0));
}`,`fn getTextAnchor(rowIndex: u32) -> u32 {
  return u32(max(textExpansionConfig[4], 0));
}`),o.add("textRowTextAnchors")),r||(n=n.replace(`@group(0) @binding(8) var<storage, read> textRowAlignmentBaselines : array<u32>;
`,"").replace(`fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  let rowStorageIndex = rowIndex + u32(max(textExpansionConfig[3], 0));
  if (textExpansionConfig[7] != 0) {
    let packedBaselineWord = textRowAlignmentBaselines[rowStorageIndex >> 2u];
    return (packedBaselineWord >> ((rowStorageIndex & 3u) * 8u)) & 0xffu;
  }
  return u32(max(textExpansionConfig[6], 0));
}`,`fn getAlignmentBaseline(rowIndex: u32) -> u32 {
  return u32(max(textExpansionConfig[6], 0));
}`),o.add("textRowAlignmentBaselines")),{source:n,shaderLayout:{...yr,bindings:yr.bindings.filter(s=>!o.has(s.name))}}}const ln={rowByteRanges:"textRowByteRanges",utf8Bytes:"textUtf8Bytes",mapStorage:"textGlyphLookup",mapEntryCountExpression:"u32(max(textExpansionConfig[2], 0))"},cn=`
${ei(ln)}
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

${zt}

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
`,ni=kt(cn,"rowIndex + u32(max(textExpansionConfig[3], 0))"),oi={bindings:[...Qs(ln),{name:"textGlyphMetrics",type:"read-only-storage",group:0,location:3},{name:"textGlyphPages",type:"read-only-storage",group:0,location:4},{name:"textGlyphKernings",type:"read-only-storage",group:0,location:5},{name:"textExpansionConfig",type:"read-only-storage",group:0,location:6},{name:"generatedGlyphVertices",type:"storage",group:0,location:7},{name:"textRowTextAnchors",type:"read-only-storage",group:0,location:8},{name:"textRowAlignmentBaselines",type:"read-only-storage",group:0,location:9}],attributes:[]},si=`
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

${zt}

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
`;kt(si,"rowIndex + u32(max(textExpansionConfig[3], 0))");function xt(e,t,r){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-metrics`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.byteLength>0?r:new Int32Array(4)}),byteLength:r.byteLength}}function pt(e,t,r){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-pages`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.byteLength>0?r:new Uint32Array(1)}),byteLength:r.byteLength}}function yt(e,t,r){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-kernings`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.byteLength>0?r:new Int32Array(4)}),byteLength:r.byteLength}}function un(e,t,r){return{buffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-lookup`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.byteLength>0?r:new Uint32Array(2)}),byteLength:r.byteLength}}function ii(e,t,r,n=0,o={},s=0){const i=new Int32Array([r.baselineOffsetY,r.labelGlyphRanges.length/2,n,s,o.textAnchor??0,o.useRowTextAnchors?1:0,o.alignmentBaseline??0,o.useRowAlignmentBaselines?1:0,o.lineHeight??0]);return{glyphRangesBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-ranges`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.labelGlyphRanges.byteLength>0?r.labelGlyphRanges:new Uint32Array(2)}),glyphIdsBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-glyph-ids`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.packedGlyphIds.byteLength>0?r.packedGlyphIds:new Uint32Array(1)}),expansionConfigBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-expansion-config`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:i}),byteLength:r.labelGlyphRanges.byteLength+r.packedGlyphIds.byteLength+i.byteLength}}function ai(e,t,{utf8TextInput:r,baselineOffsetY:n,glyphLookupCount:o,labelCount:s,batchRowIndexBase:i=0,rowStorageIndexBase:a=0,outputByteBase:l=0,alignment:c={}}){const u=new Int32Array([n,s,o,i,a,c.textAnchor??0,c.useRowTextAnchors?1:0,c.alignmentBaseline??0,c.useRowAlignmentBaselines?1:0,c.lineHeight??0,l]);return{rowByteRangesBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-row-byte-ranges`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.rowByteRanges.byteLength>0?r.rowByteRanges:new Uint32Array(2)}),utf8BytesBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-bytes`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.packedUtf8Bytes.byteLength>0?r.packedUtf8Bytes:new Uint32Array(1)}),expansionConfigBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-expansion-config`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:u}),byteLength:r.inputByteLength+u.byteLength}}function li(e,t,{rowByteRangesBuffer:r,utf8BytesBuffer:n,inputByteLength:o,baselineOffsetY:s,glyphLookupCount:i,labelCount:a,batchRowIndexBase:l=0,rowStorageIndexBase:c=0,outputByteBase:u=0,alignment:f={}}){const d=new Int32Array([s,a,i,l,c,f.textAnchor??0,f.useRowTextAnchors?1:0,f.alignmentBaseline??0,f.useRowAlignmentBaselines?1:0,f.lineHeight??0,u]);return{rowByteRangesBuffer:r,utf8BytesBuffer:n,expansionConfigBuffer:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-utf8-expansion-config`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:d}),byteLength:o+d.byteLength}}function wt(e,t,r,n=!1){const o=Math.max(r,1),s=n?3:2,i=r*Uint32Array.BYTES_PER_ELEMENT*s;return{compactGlyphVertexData:e.createBuffer({id:`${t.id||"gpu-expanded-text-model"}-generated-glyph-vertices`,usage:p.VERTEX|p.STORAGE|p.COPY_DST|p.COPY_SRC,data:new Uint32Array(o*s)}),byteLength:i,hasGlyphRowIndices:n}}function ci(e,t,r){const n=r.alignment.useRowTextAnchors??!1,o=r.alignment.useRowAlignmentBaselines??!1,s=ri(r.generated.hasGlyphRowIndices?ti:an,n,o),i=new Gr(e,{id:`${t.id||"gpu-expanded-text-model"}-compute`,source:s.source,shaderLayout:s.shaderLayout,bindings:{textGlyphRanges:r.compactInput.glyphRangesBuffer,textGlyphIds:r.compactInput.glyphIdsBuffer,textGlyphMetrics:r.glyphMetrics.buffer,textGlyphPages:r.glyphPages.buffer,textGlyphKernings:r.glyphKernings.buffer,textExpansionConfig:r.compactInput.expansionConfigBuffer,generatedGlyphVertices:r.generated.compactGlyphVertexData,...n?{textRowTextAnchors:r.alignment.rowTextAnchorsBuffer}:{},...o?{textRowAlignmentBaselines:r.alignment.rowAlignmentBaselinesBuffer}:{}}});if(r.glyphCount>0&&r.labelCount>0){const a=e.beginComputePass({});i.dispatch(a,Math.ceil(r.labelCount/64)),a.end(),e.submit()}i.destroy()}function fn(e,t,r){const n=new Gr(e,{id:`${t.id||"gpu-expanded-text-model"}-utf8-compute`,source:r.generated.hasGlyphRowIndices?ni:cn,shaderLayout:oi,bindings:{textRowByteRanges:r.utf8Input.rowByteRangesBuffer,textUtf8Bytes:r.utf8Input.utf8BytesBuffer,textGlyphLookup:r.glyphLookup.buffer,textGlyphMetrics:r.glyphMetrics.buffer,textGlyphPages:r.glyphPages.buffer,textGlyphKernings:r.glyphKernings.buffer,textExpansionConfig:r.utf8Input.expansionConfigBuffer,generatedGlyphVertices:r.generated.compactGlyphVertexData,textRowTextAnchors:r.alignment.rowTextAnchorsBuffer,textRowAlignmentBaselines:r.alignment.rowAlignmentBaselinesBuffer}});if(r.outputSlotCount>0&&r.labelCount>0){const o=e.beginComputePass({});n.dispatch(o,Math.ceil(r.labelCount/64)),o.end(),e.submit()}n.destroy()}function kt(e,t){return e.replace(`struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
}`,`struct GeneratedGlyphVertex {
  glyphOffsets : u32,
  glyphIndices : u32,
  rowIndices : u32,
}`).replace(/packGlyphPageAndId\(glyphId\)\n(\s*)\)/g,(r,n)=>`packGlyphPageAndId(glyphId),
${n}  ${t}
${n})`)}function dn(e){return{renderMode:e.mode==="bitmap"?0:e.mode==="sdf"?1:2,sdfThreshold:e.threshold,sdfSmoothing:e.smoothing,msdfDistanceRange:e.distanceRange??0}}function ui(e,t){const r={...e||{}};return fi(r,t),r}function fi(e,t){const r=dn(t);e.textFontRenderMode=r.renderMode,e.textSdfThreshold=r.sdfThreshold,e.textSdfSmoothing=r.sdfSmoothing,e.textMsdfDistanceRange=r.msdfDistanceRange}const di=24,wr=16,gi=12;function gn(e){return e!=null&&typeof e=="object"&&"type"in e&&e.type instanceof Se&&"data"in e&&Array.isArray(e.data)}function Ze(e){return D.isDictionary(e)&&e.dictionary instanceof Se&&wn(e.indices)}function hn(e){return e!=null&&typeof e=="object"&&"type"in e&&Ze(e.type)&&"data"in e&&Array.isArray(e.data)}function Je(e){return gn(e)||hn(e)}function xn(e){return Number(e.typeId)===di}function Nt(e){return e!=null&&typeof e=="object"&&"type"in e&&xn(e.type)&&"data"in e&&Array.isArray(e.data)}function hi(e){return D.isDictionary(e)&&xn(e.dictionary)&&wn(e.indices)}function pn(e){return e!=null&&typeof e=="object"&&"type"in e&&hi(e.type)&&"data"in e&&Array.isArray(e.data)}function xi(e){return Je(e)||Nt(e)||pn(e)}function yn(e){if(Je(e))return e;if(Nt(e))return new re(e.data.map(o=>pi(o)));const t=e.type,r=new mo(new Se,t.indices,t.id,t.isOrdered),n=e.data.map(o=>{const s=o,i=s.dictionary;return new _r(r,s.offset,s.length,s.nullCount,[s.valueOffsets,s.values,s.nullBitmap,s.typeIds],[...s.children??[]],yn(i))});return new re(n)}function pi(e){const t=e.values,r=new Int32Array(e.length+1),n=yi(e);let o=0;for(let i=0;i<e.length;i++)mt(e,i)&&(o+=mr(e,t,i).byteLength),r[i+1]=o;const s=new Uint8Array(o);for(let i=0;i<e.length;i++)mt(e,i)&&s.set(mr(e,t,i),r[i]);return new _r(new Se,0,e.length,e.nullCount,[r,s,n])}function mr(e,t,r){const n=(e.offset+r)*wr,o=new DataView(t.buffer,t.byteOffset+n,wr),s=o.getInt32(0,!0);if(s<=gi)return t.subarray(n+4,n+4+s);const i=o.getInt32(8,!0),a=o.getInt32(12,!0);return e.variadicBuffers[i].subarray(a,a+s)}function yi(e){if(e.nullCount===0||!e.nullBitmap)return;const t=new Uint8Array(Math.ceil(e.length/8));for(let r=0;r<e.length;r++)mt(e,r)&&(t[r>>3]|=1<<(r&7));return t}function mt(e,t){if(e.nullCount===0||!e.nullBitmap)return!0;const r=e.offset+t;return(e.nullBitmap[r>>3]&1<<(r&7))!==0}function $t(e){const t=[];let r=0,n=0;for(const o of e.data){const s=o.valueOffsets,i=o.values;if(!s||!i)continue;const a=r+o.length,l=s[0]??0,c=s[o.length]??l,u=Math.max(0,c-l),f=n+u;t.push({rowStart:r,rowEnd:a,byteStart:n,byteEnd:f,byteBase:n-l,rowOffset:o.offset??0,values:i,valueOffsets:s,nullBitmap:o.nullCount>0&&o.nullBitmap?o.nullBitmap:null}),r=a,n=f}return t}function wi(e){const t=br(),r=$t(e),n=r[r.length-1]?.byteEnd??0,o=new Uint32Array(e.length*2),s=new Uint32Array(Math.ceil(n/Uint32Array.BYTES_PER_ELEMENT)),i=new Uint8Array(s.buffer),a={startIndex:0,endIndex:0},l=new Array(e.length+1);l[0]=0;for(const c of r){const u=c.valueOffsets[0]??0,f=c.valueOffsets[c.rowEnd-c.rowStart]??u;i.set(c.values.subarray(u,f),c.byteStart)}for(let c=0;c<e.length;c++)Pe(r,c,a),o[c*2]=a.startIndex,o[c*2+1]=a.endIndex,l[c+1]=Math.max(l[c]??0,a.endIndex);return{startIndices:l,rowByteRanges:o,packedUtf8Bytes:s,byteLength:n,inputByteLength:o.byteLength+s.byteLength,textInputBuildTimeMs:br()-t}}function Pe(e,t,r){r.startIndex=0,r.endIndex=0;const n=Ii(e,t);if(!n)return r;const o=t-n.rowStart;if(!vi(n,o))return r;const s=n.valueOffsets[o]??0,i=n.valueOffsets[o+1]??s;return r.startIndex=n.byteBase+s,r.endIndex=n.byteBase+i,r}function Yt(e,t,r,n){let o=0,s=Math.max(0,t);const i=Math.max(s,r);for(;s<i;){const a=Rn(e,s);if(!a)break;const l=s-a.byteBase,c=a.values[l]??0;let u=c,f=1;(c&128)===0?u=c:(c&224)===192?(u=(c&31)<<6|(a.values[l+1]??0)&63,f=2):(c&240)===224?(u=(c&15)<<12|((a.values[l+1]??0)&63)<<6|(a.values[l+2]??0)&63,f=3):(c&248)===240?(u=(c&7)<<18|((a.values[l+1]??0)&63)<<12|((a.values[l+2]??0)&63)<<6|(a.values[l+3]??0)&63,f=4):u=65533,s+f>i&&(u=65533,f=1),n(u),o++,s+=f}return o}function mi(e,t,r){let n=0,o=Math.max(0,t);const s=Math.max(o,r);for(;o<s;){const i=Rn(e,o);if(!i)break;const a=Math.min(s,i.byteEnd);let l=o-i.byteBase;const c=a-i.byteBase;for(;l<c;)((i.values[l]??0)&192)!==128&&n++,l++;o=a}return n}function Si({texts:e,fontAtlas:t,lineHeight:r,characterSet:n}){return Hs(mn(e),{fontAtlas:t,lineHeight:r,characterSet:n})}function bi({texts:e,fontAtlas:t,lineHeight:r,characterSet:n}){return qs(mn(e),{fontAtlas:t,lineHeight:r,characterSet:n})}function Ri({texts:e,fontAtlas:t,lineHeight:r,characterSet:n}){return js(Ti(e),{fontAtlas:t,lineHeight:r,characterSet:n})}function wn(e){return D.isInt(e)&&e.bitWidth<=32}function mn(e){if(e.type instanceof Se){const r=$t(e),n={startIndex:0,endIndex:0};return{rowCount:e.length,countCodePoints:o=>(Pe(r,o,n),mi(r,n.startIndex,n.endIndex)),visitCodePoints:(o,s)=>(Pe(r,o,n),Yt(r,n.startIndex,n.endIndex,s))}}if(!Ze(e.type))throw new Error(`Arrow text vector must be Utf8 or Dictionary<Utf8>, got ${e.type}`);const t=Sn(e);return{rowCount:e.length,countCodePoints:r=>Sr(t,r).length,visitCodePoints:(r,n)=>{const o=Sr(t,r);for(const s of o)n(s);return o.length}}}function Ti(e){const t=Sn(e),r=t.reduce((o,s)=>o+s.dictionaryLength,0),n={startIndex:0,endIndex:0};return{rowCount:e.length,dictionaryValueCount:r,getRowDictionaryIndex:o=>{const s=Tn(t,o);if(!s)return-1;const i=bn(s,o-s.rowStart);return i<0?-1:s.dictionaryValueBase+i},visitDictionaryCodePoints:(o,s)=>{const i=Ai(t,o);if(!i)return;const a=o-i.dictionaryValueBase;Pe(i.dictionaryChunks,a,n),Yt(i.dictionaryChunks,n.startIndex,n.endIndex,s)}}}function Sn(e){const t=[];let r=0,n=0;for(const o of e.data){const s=o.dictionary,i=s?.length??0,a=r+o.length;t.push({rowStart:r,rowEnd:a,rowOffset:o.offset??0,dictionaryValueBase:n,dictionaryLength:i,indices:o.values??null,nullBitmap:o.nullCount>0&&o.nullBitmap?o.nullBitmap:null,dictionaryChunks:s?$t(s):[],dictionaryCodePointsByIndex:new Map}),r=a,n+=i}return t}function Sr(e,t){const r=Tn(e,t);if(!r)return[];const n=t-r.rowStart,o=bn(r,n);if(o<0)return[];const s=r.dictionaryCodePointsByIndex.get(o);if(s)return s;const i={startIndex:0,endIndex:0},a=[];return Pe(r.dictionaryChunks,o,i),Yt(r.dictionaryChunks,i.startIndex,i.endIndex,l=>a.push(l)),r.dictionaryCodePointsByIndex.set(o,a),a}function bn(e,t){if(!e.indices||!In(e.nullBitmap,e.rowOffset,t))return-1;const r=e.rowEnd-e.rowStart,n=e.indices.length===r?t:e.rowOffset+t,o=Number(e.indices[n]??-1);return!Number.isInteger(o)||o<0||o>=e.dictionaryLength?-1:o}function br(){return globalThis.performance?.now()??Date.now()}function Ii(e,t){for(const r of e)if(t>=r.rowStart&&t<r.rowEnd)return r;return null}function Rn(e,t){for(const r of e)if(t>=r.byteStart&&t<r.byteEnd)return r;return null}function Tn(e,t){for(const r of e)if(t>=r.rowStart&&t<r.rowEnd)return r;return null}function Ai(e,t){for(const r of e)if(t>=r.dictionaryValueBase&&t<r.dictionaryValueBase+r.dictionaryLength)return r;return null}function vi(e,t){return In(e.nullBitmap,e.rowOffset,t)}function In(e,t,r){if(!e)return!0;const n=t+r;return((e[n>>3]??0)&1<<(n&7))!==0}const ge="glyphOffsets",he="glyphFrames",xe="glyphPages",le="glyphClipRects",pe="rowIndices",An="expandedGlyphVertexData",vn=Uint32Array.BYTES_PER_ELEMENT*2,Ye=Uint32Array.BYTES_PER_ELEMENT*5,Cn=Ye+Float32Array.BYTES_PER_ELEMENT*4,Bn=[0,0,0,255],En=0,Pn=32,St=[0,0],Ci=0,Bi=0,Ei=-1,Rr=4294967295,Pi=Uint32Array.BYTES_PER_ELEMENT*4,Oi=Uint32Array.BYTES_PER_ELEMENT*4;function Gi(e){if(e.labelTable.numRows!==e.texts.length)throw new Error("ArrowTextModel requires labelTable rows to match UTF-8 text rows");Qe(e.clipRects,e.texts.length),Re(e.labelTable,ge),Re(e.labelTable,he),Re(e.labelTable,xe),Re(e.labelTable,le),Re(e.labelTable,pe);const t=Tr(),r=Si({texts:e.texts,fontAtlas:e.fontAtlas,lineHeight:e.lineHeight,characterSet:e.characterSet}),n=[],o={},s=It(r.startIndices);for(const l of e.labelTable.schema.fields){const c=e.labelTable.getChild(l.name);if(c){if(l.name==="colors"&&Ln(c.type)){n.push(new ve(l.name,c.type.children[0].type,l.nullable,l.metadata)),o[l.name]=pa(c,r.startIndices,e.color);continue}Mn(c.type)&&(n.push(l),o[l.name]=tr(c,s,ya(l.name,e)))}}n.push(ct(ge,new nt,2)),n.push(ct(he,new Me,4)),n.push(new ve(xe,new Me,!1)),e.clipRects&&n.push(ct(le,new nt,4)),n.push(new ve(pe,new Ne,!1)),o[ge]=ae(new nt,2,r.glyphOffsets),o[he]=ae(new Me,4,r.glyphFrames),o[xe]=de(new Me,r.glyphPages),e.clipRects&&(o[le]=tr(e.clipRects,s)),o[pe]=de(new Ne,It(r.startIndices,e.rowIndexBase));const i=ma(o),a=Tr()-t;return{table:new k(new Mr(n,e.labelTable.schema.metadata),o),glyphLayout:r,characterSet:e.characterSet,attributeByteLength:i,glyphAttributeBuildTimeMs:a}}function Di(e){if(!e.sourceVectors)throw new Error("ArrowTextModel requires explicit sourceVectors for CPU glyph expansion");Mi(e),Vi(e),Li(e);const{sourceVectors:t}=e,r={positions:t.positions};return t.colors&&(r.colors=t.colors),t.angles&&(r.angles=t.angles),t.sizes&&(r.sizes=t.sizes),t.pixelOffsets&&(r.pixelOffsets=t.pixelOffsets),{labelTable:new k(r),texts:t.texts,clipRects:t.clipRects}}function Xe(e,t,r){const n=e.data[r];if(!n)throw new Error(`Arrow text ${t} source is missing batch ${r}`);return new re([n])}function O(e){return bo(e)}function On(e){const t=O(e);return t instanceof Se||Ze(t)}function _i(e){return Ze(O(e))}function Mi(e){const t=O(e.texts),r=O(e.positions),n=e.colors?O(e.colors):void 0,o=e.angles?O(e.angles):void 0,s=e.sizes?O(e.sizes):void 0,i=e.pixelOffsets?O(e.pixelOffsets):void 0;if(!On(e.texts))throw new Error("ArrowTextModel texts must be GPUVector");if(!Je(e.sourceVectors.texts))throw new Error("ArrowTextModel sourceVectors.texts must be Utf8 or Dictionary<Utf8>");if(!Gt.compareTypes(e.sourceVectors.texts.type,t))throw new Error("ArrowTextModel sourceVectors.texts type must match GPU texts type");if(!D.isFixedSizeList(r)||r.listSize!==2||!(r.children[0]?.type instanceof V))throw new Error("ArrowTextModel positions must be GPUVector");if(n&&!xa(n))throw new Error("ArrowTextModel colors must be GPUVector or GPUVector<List<FixedSizeList<Uint8>[4]>>");if(o&&!(o instanceof V))throw new Error("ArrowTextModel angles must be GPUVector");if(s&&!(s instanceof V))throw new Error("ArrowTextModel sizes must be GPUVector");if(i&&(!D.isFixedSizeList(i)||i.listSize!==2||!(i.children[0]?.type instanceof V)))throw new Error("ArrowTextModel pixelOffsets must be GPUVector")}function Vi(e){const r=[["positions",e.positions],["texts",e.texts],["colors",e.colors],["angles",e.angles],["sizes",e.sizes],["pixelOffsets",e.pixelOffsets],["clipRects",e.clipRects]].filter(([,s])=>s!==void 0),[n,o]=r[0];for(const[s,i]of r.slice(1))if(i.length!==o.length)throw new Error(`ArrowTextModel ${s} rows must match ${n} rows (${i.length} !== ${o.length})`)}function Li(e){const t=[["positions",e.positions,e.sourceVectors.positions],["texts",e.texts,e.sourceVectors.texts],["colors",e.colors,e.sourceVectors.colors],["angles",e.angles,e.sourceVectors.angles],["sizes",e.sizes,e.sourceVectors.sizes],["pixelOffsets",e.pixelOffsets,e.sourceVectors.pixelOffsets],["clipRects",e.clipRects,e.sourceVectors.clipRects]];for(const[r,n,o]of t){if(n&&!o)throw new Error(`ArrowTextModel ${r} GPU rows require matching sourceVectors rows`);if(!n&&o)throw new Error(`ArrowTextModel sourceVectors.${r} requires matching GPU rows`);!n||!o||Oe("ArrowTextModel",r,n,o)}}function Oe(e,t,r,n){if(n.length!==r.length)throw new Error(`${e} sourceVectors.${t} rows must match GPU rows (${n.length} !== ${r.length})`);if(n.data.length!==r.data.length)throw new Error(`${e} sourceVectors.${t} batch count must match GPU batches`);for(let o=0;o<n.data.length;o++)if(n.data[o].length!==r.data[o].length)throw new Error(`${e} sourceVectors.${t} batch ${o} rows must match GPU rows`)}function Ui(e){if(!e.sourceVectors)throw new Error("ArrowTextStorageModel requires explicit sourceVectors for CPU glyph expansion");ki(e),Xt(e),Wi(e);const{sourceVectors:t}=e,r=[];let n=e.rowIndexBase??0;for(let o=0;o<e.texts.data.length;o++){const s=e.texts.data[o],i=e.positions.data[o];r.push({batchRowIndexBase:n,rowStorageIndexBase:Wt(i,"positions",o),texts:Xe(t.texts,"texts",o),clipRects:t.clipRects?Xe(t.clipRects,"clipRects",o):void 0,positionsBuffer:i.buffer,colorsBuffer:e.colors?.data[o].buffer,anglesBuffer:e.angles?.data[o].buffer,sizesBuffer:e.sizes?.data[o].buffer,pixelOffsetsBuffer:e.pixelOffsets?.data[o].buffer,textAnchorsBuffer:e.textAnchors?.data[o].buffer,alignmentBaselinesBuffer:e.alignmentBaselines?.data[o].buffer}),n+=s.length}return{texts:t.texts,batches:r}}function Fi(e){if(!e.sourceVectors)throw new Error("ArrowTextDictionaryStorageModel requires explicit sourceVectors for compressed dictionary glyph layout");Hi(e),Xt(e,"ArrowTextDictionaryStorageModel"),qi(e);const{sourceVectors:t}=e,r=[];let n=e.rowIndexBase??0;for(let o=0;o<e.texts.data.length;o++){const s=e.texts.data[o],i=e.positions.data[o];r.push({batchRowIndexBase:n,rowStorageIndexBase:Wt(i,"positions",o),texts:Xe(t.texts,"texts",o),clipRects:t.clipRects?Xe(t.clipRects,"clipRects",o):void 0,positionsBuffer:i.buffer,colorsBuffer:e.colors?.data[o].buffer,anglesBuffer:e.angles?.data[o].buffer,sizesBuffer:e.sizes?.data[o].buffer,pixelOffsetsBuffer:e.pixelOffsets?.data[o].buffer,textAnchorsBuffer:e.textAnchors?.data[o].buffer,alignmentBaselinesBuffer:e.alignmentBaselines?.data[o].buffer}),n+=s.length}return{texts:t.texts,batches:r}}function zi(e,t){Ni(t),Xt(t,"TextStorageModel");const r=t.textBatches??$i(e,t);if(r.length!==t.texts.data.length)throw new Error("TextStorageModel textBatches must match texts GPUVector batch count");const n=[];let o=t.rowIndexBase??0;for(let s=0;s<t.texts.data.length;s++){const i=t.texts.data[s],a=t.positions.data[s],l=r[s];if(!l)throw new Error(`TextStorageModel textBatches is missing batch ${s}`);if(l.rowCount!==i.length)throw new Error("TextStorageModel textBatches rows must match texts GPU rows");n.push({...l,batchRowIndexBase:o,rowStorageIndexBase:Wt(a,"positions",s),positionsBuffer:a.buffer,colorsBuffer:t.colors?.data[s].buffer,anglesBuffer:t.angles?.data[s].buffer,sizesBuffer:t.sizes?.data[s].buffer,pixelOffsetsBuffer:t.pixelOffsets?.data[s].buffer,textAnchorsBuffer:t.textAnchors?.data[s].buffer,alignmentBaselinesBuffer:t.alignmentBaselines?.data[s].buffer,clipRectsBuffer:t.clipRects?Xi(t.clipRects,s):void 0}),o+=i.length}return{batches:n}}function ki(e){const t=O(e.texts),r=O(e.positions),n=e.colors?O(e.colors):void 0,o=e.angles?O(e.angles):void 0,s=e.sizes?O(e.sizes):void 0,i=e.pixelOffsets?O(e.pixelOffsets):void 0,a=e.textAnchors?O(e.textAnchors):void 0,l=e.alignmentBaselines?O(e.alignmentBaselines):void 0;if(!On(e.texts))throw new Error("ArrowTextStorageModel texts must be GPUVector");if(!Je(e.sourceVectors.texts))throw new Error("ArrowTextStorageModel sourceVectors.texts must be Utf8 or Dictionary<Utf8>");if(!Gt.compareTypes(e.sourceVectors.texts.type,t))throw new Error("ArrowTextStorageModel sourceVectors.texts type must match GPU texts type");if(!D.isFixedSizeList(r)||r.listSize!==2||!(r.children[0]?.type instanceof V))throw new Error("ArrowTextStorageModel positions must be GPUVector");if(n&&(!D.isFixedSizeList(n)||n.listSize!==4||!(n.children[0]?.type instanceof H)))throw new Error("ArrowTextStorageModel colors must be GPUVector");if(o&&!(o instanceof V))throw new Error("ArrowTextStorageModel angles must be GPUVector");if(s&&!(s instanceof V))throw new Error("ArrowTextStorageModel sizes must be GPUVector");if(i&&(!D.isFixedSizeList(i)||i.listSize!==2||!(i.children[0]?.type instanceof V)))throw new Error("ArrowTextStorageModel pixelOffsets must be GPUVector");if(a&&!(a instanceof H))throw new Error("ArrowTextStorageModel textAnchors must be GPUVector");if(l&&!(l instanceof H))throw new Error("ArrowTextStorageModel alignmentBaselines must be GPUVector");const c=e.sourceVectors.clipRects;Qe(c,e.texts.length)}function Ni(e){ds(e)}function $i(e,t){return t.texts.data.map((r,n)=>{if(r.byteOffset!==0||r.byteStride!==1)throw new Error("TextStorageModel GPUVector UTF-8 batches must be zero-offset byte buffers");const{valueOffsets:o,nullBitmap:s,valueByteLength:i}=r;if(!o||i===void 0)throw new Error("TextStorageModel GPUVector UTF-8 batches require row offset metadata");const a=new Uint32Array(r.length*2),l=new Array(r.length+1);l[0]=0;for(let u=0;u<r.length;u++){const f=Yi(s,u),d=f?o[u]??0:0,h=f?o[u+1]??d:d;a[u*2]=d,a[u*2+1]=h,l[u+1]=Math.max(l[u]??0,h)}const c=e.createBuffer({id:`${t.id||"text-storage-model"}-utf8-row-byte-ranges-${n}`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:a.byteLength>0?a:new Uint32Array(2)});return{rowCount:r.length,startIndices:l,rowByteRanges:a,rowByteRangesBuffer:c,utf8BytesBuffer:r.buffer,byteLength:i,inputByteLength:a.byteLength+i,ownsRowByteRangesBuffer:!0}})}function Yi(e,t){return e?(e[t>>3]&1<<(t&7))!==0:!0}function Xi(e,t){const r=e.data[t];if(!r)throw new Error(`TextStorageModel clipRects is missing batch ${t}`);if(r.byteOffset!==0||r.byteStride!==Float32Array.BYTES_PER_ELEMENT*4)throw new Error("TextStorageModel GPUVector clipRects batches must be zero-offset packed Float32x4 buffers");return r.buffer}function Xt(e,t="ArrowTextStorageModel"){const n=[["positions",e.positions],["texts",e.texts],["colors",e.colors],["angles",e.angles],["sizes",e.sizes],["pixelOffsets",e.pixelOffsets],["textAnchors",e.textAnchors],["alignmentBaselines",e.alignmentBaselines],["clipRects",e.clipRects]].filter(([,i])=>i!==void 0),[o,s]=n[0];for(const[i,a]of n.slice(1)){if(a.length!==s.length)throw new Error(`${t} ${i} rows must match ${o} rows (${a.length} !== ${s.length})`);if(a.data.length!==s.data.length)throw new Error(`${t} ${i} batch count must match ${o} batch count`);for(let l=0;l<a.data.length;l++)if(a.data[l].length!==s.data[l].length)throw new Error(`${t} ${i} batch ${l} rows must match ${o}`)}}function Wi(e){if(Oe("ArrowTextStorageModel","texts",e.texts,e.sourceVectors.texts),e.clipRects&&!e.sourceVectors.clipRects)throw new Error("ArrowTextStorageModel clipRects GPU rows require matching sourceVectors rows");if(!e.clipRects&&e.sourceVectors.clipRects)throw new Error("ArrowTextStorageModel sourceVectors.clipRects requires matching GPU clipRects rows");e.clipRects&&e.sourceVectors.clipRects&&Oe("ArrowTextStorageModel","clipRects",e.clipRects,e.sourceVectors.clipRects)}function Hi(e){const t=O(e.texts),r=O(e.positions),n=e.colors?O(e.colors):void 0,o=e.angles?O(e.angles):void 0,s=e.sizes?O(e.sizes):void 0,i=e.pixelOffsets?O(e.pixelOffsets):void 0,a=e.textAnchors?O(e.textAnchors):void 0,l=e.alignmentBaselines?O(e.alignmentBaselines):void 0;if(!_i(e.texts))throw new Error("ArrowTextDictionaryStorageModel texts must be GPUVector");if(!hn(e.sourceVectors.texts))throw new Error("ArrowTextDictionaryStorageModel sourceVectors.texts must be Dictionary<Utf8>");if(!Gt.compareTypes(e.sourceVectors.texts.type,t))throw new Error("ArrowTextDictionaryStorageModel sourceVectors.texts type must match GPU texts type");if(!D.isFixedSizeList(r)||r.listSize!==2||!(r.children[0]?.type instanceof V))throw new Error("ArrowTextDictionaryStorageModel positions must be GPUVector");if(n&&(!D.isFixedSizeList(n)||n.listSize!==4||!(n.children[0]?.type instanceof H)))throw new Error("ArrowTextDictionaryStorageModel colors must be GPUVector");if(o&&!(o instanceof V))throw new Error("ArrowTextDictionaryStorageModel angles must be GPUVector");if(s&&!(s instanceof V))throw new Error("ArrowTextDictionaryStorageModel sizes must be GPUVector");if(i&&(!D.isFixedSizeList(i)||i.listSize!==2||!(i.children[0]?.type instanceof V)))throw new Error("ArrowTextDictionaryStorageModel pixelOffsets must be GPUVector");if(a&&!(a instanceof H))throw new Error("ArrowTextDictionaryStorageModel textAnchors must be GPUVector");if(l&&!(l instanceof H))throw new Error("ArrowTextDictionaryStorageModel alignmentBaselines must be GPUVector");const c=e.sourceVectors.clipRects;Qe(c,e.texts.length)}function qi(e){if(Oe("ArrowTextDictionaryStorageModel","texts",e.texts,e.sourceVectors.texts),e.clipRects&&!e.sourceVectors.clipRects)throw new Error("ArrowTextDictionaryStorageModel clipRects GPU rows require matching sourceVectors rows");if(!e.clipRects&&e.sourceVectors.clipRects)throw new Error("ArrowTextDictionaryStorageModel sourceVectors.clipRects requires matching GPU clipRects rows");e.clipRects&&e.sourceVectors.clipRects&&Oe("ArrowTextDictionaryStorageModel","clipRects",e.clipRects,e.sourceVectors.clipRects)}function Wt(e,t,r){if(!Number.isFinite(e.byteStride)||e.byteStride<=0)throw new Error(`ArrowTextStorageModel ${t} batch ${r} has invalid byte stride`);const n=e.byteOffset/e.byteStride;if(!Number.isInteger(n))throw new Error(`ArrowTextStorageModel ${t} batch ${r} byte offset is not row aligned`);return n}function ji(e,t){return{...Ki(e,t),textProps:t}}function Ki(e,t){const r=Di(t),n=Ht(t),o=ui(t.uniforms,n.fontRenderSettings),s=Gi({labelTable:r.labelTable,texts:r.texts,clipRects:r.clipRects,fontAtlas:n.fontAtlas,lineHeight:n.lineHeight,characterSet:n.characterSet,rowIndexBase:t.rowIndexBase,color:t.color,angle:t.angle,size:t.size}),i=Zi(t),a=Ee({device:e,recordOffsets:s.glyphLayout.startIndices,recordByteStride:r.clipRects?Cn:Ye,resourceLabel:"ArrowTextModel expanded glyph vertex data"}),l=a.map(g=>Qi(e,t,{glyphTable:s,shaderLayout:i,generatedBufferBatch:g,rowIndexBase:0})),c=l[0];if(!c)throw new Error("ArrowTextModel requires at least one generated glyph render batch");const u=a.map((g,y)=>({rowStart:g.rowStart,rowEnd:g.rowEnd,glyphCount:g.recordCount,expandedGlyphVertexData:l[y].buffer})),f=c,{atlasTexture:d,ownsAtlasTexture:h}=et(e,t,n.fontAtlas),m={...t,vs:t.vs??(r.clipRects?is:ss),fs:t.fs??as,uniforms:o,shaderLayout:i,bindings:{...t.bindings||{},fontAtlasTexture:d},attributes:{...t.attributes||{},[An]:f.buffer},bufferLayout:[...t.bufferLayout||[],f.bufferLayout],vertexCount:t.vertexCount??6,instanceCount:s.glyphLayout.glyphCount,table:Ct(e,Ji(s.table,a),{shaderLayout:i}),tableCount:"none"};let w=!1;return{modelProps:m,glyphLayout:s.glyphLayout,glyphTable:s,expandedGlyphVertexData:f.buffer,renderBatches:u,atlasTexture:d,glyphAttributeBuildTimeMs:s.glyphAttributeBuildTimeMs,glyphAttributeByteLength:s.attributeByteLength,fontRenderSettings:n.fontRenderSettings,defaultFragmentShaderUniforms:o,mappingState:n,destroy:()=>{if(!w){w=!0,h&&d.destroy();for(const g of u)g.expandedGlyphVertexData.destroy();m.table?.destroy()}}}}function Zi(e){return e.shaderLayout??(e.clipRects?rs:$r)}function Ji(e,t){const r=new Set([ge,he,xe,le,pe]),n=[],o={};for(const a of e.schema.fields){if(r.has(a.name))continue;const l=e.getChild(a.name);l&&(n.push(a),o[a.name]=l)}const s=new k(new Mr(n,new Map(e.schema.metadata)),o);if(!t||t.length<=1)return s;const i=t.flatMap(a=>s.slice(a.recordStart,a.recordEnd).batches);return new k(s.schema,i)}function Qi(e,t,{glyphTable:r,shaderLayout:n,generatedBufferBatch:o,rowIndexBase:s=0}){const{glyphLayout:i}=r,a=r.table.getChild(le),l=a?Bt(a):void 0,c=l?Cn:Ye,u=o.byteLength,f=new ArrayBuffer(Math.max(u,c)),d=new Int16Array(f),h=new Uint16Array(f),m=new Uint32Array(f),w=new Float32Array(f),g=It(i.startIndices,s);for(let S=o.recordStart;S<o.recordEnd;S++){const b=S-o.recordStart,T=b*c/Int16Array.BYTES_PER_ELEMENT,I=b*c/Uint32Array.BYTES_PER_ELEMENT,A=b*c/Float32Array.BYTES_PER_ELEMENT,v=S*2,R=S*4;if(d[T]=i.glyphOffsets[v],d[T+1]=i.glyphOffsets[v+1],h[T+2]=i.glyphFrames[R],h[T+3]=i.glyphFrames[R+1],h[T+4]=i.glyphFrames[R+2],h[T+5]=i.glyphFrames[R+3],h[T+6]=i.glyphPages[S],m[I+4]=g[S],l){const M=S*4;w[A+5]=l[M],w[A+6]=l[M+1],w[A+7]=l[M+2],w[A+8]=l[M+3]}}const y=new Set(n.attributes.map(S=>S.name)),x=[];return y.has(ge)&&x.push({attribute:ge,format:"sint16x2",byteOffset:0}),y.has(he)&&x.push({attribute:he,format:"uint16x4",byteOffset:Int16Array.BYTES_PER_ELEMENT*2}),y.has(xe)&&x.push({attribute:xe,format:"uint16",byteOffset:Int16Array.BYTES_PER_ELEMENT*6}),y.has(pe)&&x.push({attribute:pe,format:"uint32",byteOffset:Int16Array.BYTES_PER_ELEMENT*8}),l&&y.has(le)&&x.push({attribute:le,format:"float32x4",byteOffset:Ye}),{buffer:e.createBuffer({id:`${t.id||"arrow-text-model"}-expanded-glyph-vertex-data-${o.rowStart}`,usage:p.VERTEX|p.COPY_DST|p.COPY_SRC,data:new Uint8Array(f)}),bufferLayout:{name:An,stepMode:"instance",byteStride:c,attributes:x},byteLength:u}}function ea(e,t){if(e.type!=="webgpu")throw new Error("createArrowTextStorageState requires a WebGPU device");if(!Ut(e))throw new Error(`createArrowTextStorageState requires at least ${on} storage buffer bindings per shader stage`);const r=Ui(t),n=Ht(t),{atlasTexture:o,ownsAtlasTexture:s}=et(e,t,n.fontAtlas),i=!!(Ft(e)&&n.characterSet&&gn(r.texts)),a=t.rowIndexColumn===!0,l=a?_t:vn;let c,u,f,d=0,h=0,m=0,w=0,g=0,y=0,x=0,S=0;const b=[],T=[],I=[],A=[],v=qt(e,t);if(b.push(...v.ownedResources),y+=v.byteLength,i){const G=en(n.characterSet,{fontAtlas:n.fontAtlas,lineHeight:n.lineHeight});f=G,u=Be(e,t,G.glyphFrames),x=u.byteLength;for(const[_,P]of r.batches.entries()){const E=We(e,t,P,v,n.fontRenderSettings),z=wi(P.texts),B=Rt(e,t,P.batchRowIndexBase,z.startIndices);T.push(B.buffer),g+=B.byteLength;const F=xt(e,{id:t.id},G.glyphMetrics),$=un(e,{id:t.id},G.glyphLookup),q=pt(e,{id:t.id},G.glyphPages),L=yt(e,{id:t.id},G.glyphKernings),ce=Ee({device:e,recordOffsets:z.startIndices,recordByteStride:l,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"ArrowTextStorageModel UTF-8 generated glyph vertex data"});for(const U of ce){const J=ca(z,U),j=ai(e,{id:t.id},{utf8TextInput:J,baselineOffsetY:G.baselineOffsetY,glyphLookupCount:G.glyphLookup.length/2,labelCount:U.rowEnd-U.rowStart,batchRowIndexBase:U.rowStart,rowStorageIndexBase:P.rowStorageIndexBase+U.rowStart,alignment:Tt(t,E,n.lineHeight)}),tt=wt(e,{id:t.id},J.byteLength,a);fn(e,{id:t.id},{utf8Input:j,glyphLookup:$,glyphMetrics:F,glyphPages:q,glyphKernings:L,generated:tt,outputSlotCount:J.byteLength,labelCount:U.rowEnd-U.rowStart,alignment:{rowTextAnchorsBuffer:W(E.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:W(E.rowAlignmentBaselinesBuffer)}});const rt=bt(e,t,P.batchRowIndexBase,U);A.push({rowBindingBatchIndex:_,rowStart:U.rowStart,rowEnd:U.rowEnd,glyphIndexBase:U.recordStart,glyphCount:J.byteLength,compactGlyphVertexData:tt.compactGlyphVertexData,storageRenderConfigBuffer:rt}),T.push(rt),g+=rt.byteLength,w+=tt.byteLength,S+=j.byteLength,j.rowByteRangesBuffer.destroy(),j.utf8BytesBuffer.destroy(),j.expansionConfigBuffer.destroy()}I.push({...E,batchRowIndexBase:P.batchRowIndexBase,rowCount:P.texts.length,glyphCount:z.byteLength,rowGlyphStartsBuffer:B.buffer}),d+=z.byteLength,h+=z.textInputBuildTimeMs,m+=z.inputByteLength,y+=E.ownedByteLength,S+=$.byteLength+F.byteLength+q.byteLength+L.byteLength,b.push(...E.ownedResources),F.buffer.destroy(),$.buffer.destroy(),q.buffer.destroy(),L.buffer.destroy()}}else for(const[G,_]of r.batches.entries()){const P=We(e,t,_,v,n.fontRenderSettings),E=bi({texts:_.texts,fontAtlas:n.fontAtlas,lineHeight:n.lineHeight,characterSet:n.characterSet}),z=Rt(e,t,_.batchRowIndexBase,E.startIndices);T.push(z.buffer),g+=z.byteLength,c??=E,u??=Be(e,t,E.glyphFrames),G===0&&(x=u.byteLength);const B=xt(e,{id:t.id},E.glyphMetrics),F=pt(e,{id:t.id},E.glyphPages),$=yt(e,{id:t.id},E.glyphKernings),q=Ee({device:e,recordOffsets:E.startIndices,recordByteStride:l,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"ArrowTextStorageModel compact generated glyph vertex data"});for(const L of q){const ce=la(E,L),U=ii(e,{id:t.id},ce,L.rowStart,Tt(t,P,n.lineHeight),_.rowStorageIndexBase+L.rowStart),J=wt(e,{id:t.id},ce.glyphCount,a);ci(e,{id:t.id},{compactInput:U,glyphMetrics:B,glyphPages:F,glyphKernings:$,generated:J,glyphCount:ce.glyphCount,labelCount:L.rowEnd-L.rowStart,alignment:{rowTextAnchorsBuffer:W(P.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:W(P.rowAlignmentBaselinesBuffer),useRowTextAnchors:!!t.textAnchors,useRowAlignmentBaselines:!!t.alignmentBaselines}});const j=bt(e,t,_.batchRowIndexBase,L);A.push({rowBindingBatchIndex:G,rowStart:L.rowStart,rowEnd:L.rowEnd,glyphIndexBase:L.recordStart,glyphCount:ce.glyphCount,compactGlyphVertexData:J.compactGlyphVertexData,storageRenderConfigBuffer:j}),T.push(j),g+=j.byteLength,w+=J.byteLength,S+=U.byteLength,U.glyphRangesBuffer.destroy(),U.glyphIdsBuffer.destroy(),U.expansionConfigBuffer.destroy()}I.push({...P,batchRowIndexBase:_.batchRowIndexBase,rowCount:_.texts.length,glyphCount:E.glyphCount,rowGlyphStartsBuffer:z.buffer}),d+=E.glyphCount,h+=E.glyphStreamBuildTimeMs,m+=E.compactStreamByteLength,y+=P.ownedByteLength,S+=B.byteLength+F.byteLength+$.byteLength,b.push(...P.ownedResources),B.buffer.destroy(),F.buffer.destroy(),$.buffer.destroy()}u??=Be(e,t,new Float32Array(4));let R=!1;return{glyphStream:c,atlasTexture:o,characterSet:n.characterSet,glyphCount:d,glyphAttributeBuildTimeMs:h,glyphAttributeByteLength:w+g,compactStreamBuildTimeMs:h,compactStreamByteLength:m,generatedRenderBufferByteLength:w,renderControlByteLength:g,rowStorageByteLength:y,glyphDefinitionStorageByteLength:x,transientComputeInputByteLength:S,hasGlyphRowIndices:a,fontRenderSettings:n.fontRenderSettings,batches:I,renderBatches:A,ownedRowBindingResources:b,ownedGlyphResources:T,glyphFramesBuffer:u.buffer,arrowAppendContext:{defaultBuffers:v,mappingState:n,useGpuUtf8Decode:i,utf8GlyphDefinitions:f},destroy:()=>{if(!R){R=!0,s&&o.destroy(),me(b),me(T),u.buffer.destroy();for(const G of A)G.compactGlyphVertexData.destroy()}}}}function ta(e,t){if(e.type!=="webgpu")throw new Error("createTextStorageStateFromGPUVectors requires a WebGPU device");if(!Ft(e))throw new Error(`createTextStorageStateFromGPUVectors requires at least ${sn} storage buffer bindings per shader stage`);const r=zi(e,t),n=sa(t),o=n.characterSet??new Set(Object.keys(n.fontAtlas.mapping)),{atlasTexture:s,ownsAtlasTexture:i}=et(e,t,n.fontAtlas),a=en(o,{fontAtlas:n.fontAtlas,lineHeight:n.lineHeight}),l=Be(e,t,a.glyphFrames),c=t.rowIndexColumn===!0,u=c?_t:vn;let f=0,d=0,h=0,m=0,w=0,g=0;const y=[],x=[],S=[],b=[],T=qt(e,t);y.push(...T.ownedResources),w+=T.byteLength;for(const[A,v]of r.batches.entries()){const R=We(e,t,v,T,n.fontRenderSettings),M=Rt(e,t,v.batchRowIndexBase,v.startIndices);x.push(M.buffer),m+=M.byteLength;const G=xt(e,{id:t.id},a.glyphMetrics),_=pt(e,{id:t.id},a.glyphPages),P=yt(e,{id:t.id},a.glyphKernings),E=un(e,{id:t.id},a.glyphLookup),z=Ee({device:e,recordOffsets:v.startIndices,recordByteStride:u,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"TextStorageModel GPUVector UTF-8 generated glyph vertex data"});for(const B of z){const F=ua(e,t,v,B),$=li(e,{id:t.id},{rowByteRangesBuffer:F.rowByteRangesBuffer,utf8BytesBuffer:W(v.utf8BytesBuffer),inputByteLength:F.inputByteLength,baselineOffsetY:a.baselineOffsetY,glyphLookupCount:a.glyphLookup.length/2,labelCount:B.rowEnd-B.rowStart,batchRowIndexBase:B.rowStart,rowStorageIndexBase:v.rowStorageIndexBase+B.rowStart,outputByteBase:B.recordStart,alignment:Tt(t,R,n.lineHeight)}),q=wt(e,{id:t.id},B.recordCount,c);fn(e,{id:t.id},{utf8Input:$,glyphLookup:E,glyphMetrics:G,glyphPages:_,glyphKernings:P,generated:q,outputSlotCount:B.recordCount,labelCount:B.rowEnd-B.rowStart,alignment:{rowTextAnchorsBuffer:W(R.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:W(R.rowAlignmentBaselinesBuffer)}});const L=bt(e,t,v.batchRowIndexBase,B);b.push({rowBindingBatchIndex:A,rowStart:B.rowStart,rowEnd:B.rowEnd,glyphIndexBase:B.recordStart,glyphCount:B.recordCount,compactGlyphVertexData:q.compactGlyphVertexData,storageRenderConfigBuffer:L}),x.push(L),m+=L.byteLength,h+=q.byteLength,g+=$.byteLength,$.expansionConfigBuffer.destroy(),F.ownsRowByteRangesBuffer&&F.rowByteRangesBuffer.destroy()}S.push({...R,batchRowIndexBase:v.batchRowIndexBase,rowCount:v.rowCount,glyphCount:v.byteLength,rowGlyphStartsBuffer:M.buffer}),f+=v.byteLength,d+=v.inputByteLength,w+=R.ownedByteLength,g+=E.byteLength+G.byteLength+_.byteLength+P.byteLength,y.push(...R.ownedResources),G.buffer.destroy(),E.buffer.destroy(),_.buffer.destroy(),P.buffer.destroy(),v.ownsRowByteRangesBuffer&&v.rowByteRangesBuffer.destroy()}let I=!1;return{atlasTexture:s,characterSet:o,glyphCount:f,glyphAttributeBuildTimeMs:0,glyphAttributeByteLength:h+m,compactStreamBuildTimeMs:0,compactStreamByteLength:d,generatedRenderBufferByteLength:h,renderControlByteLength:m,rowStorageByteLength:w,glyphDefinitionStorageByteLength:l.byteLength,transientComputeInputByteLength:g,hasGlyphRowIndices:c,fontRenderSettings:n.fontRenderSettings,glyphFramesBuffer:l.buffer,batches:S,renderBatches:b,ownedRowBindingResources:y,ownedGlyphResources:x,destroy:()=>{if(!I){I=!0,i&&s.destroy(),me(y),me(x),l.buffer.destroy();for(const A of b)A.compactGlyphVertexData.destroy()}}}}function ra(e,t){if(e.type!=="webgpu")throw new Error("createArrowTextDictionaryStorageState requires a WebGPU device");const r=Fi(t),n=Ht(t),{atlasTexture:o,ownsAtlasTexture:s}=et(e,t,n.fontAtlas);let i,a=0,l=0,c=0,u=0,f=0,d=0,h=0,m=0;const w=[],g=[],y=[],x=[],S=qt(e,t);w.push(...S.ownedResources),h+=S.byteLength;for(const[I,A]of r.batches.entries()){const v=We(e,t,A,S,n.fontRenderSettings),R=Ri({texts:A.texts,fontAtlas:n.fontAtlas,lineHeight:n.lineHeight,characterSet:n.characterSet}),M=oa(R),G=lt(e,t,`row-dictionary-records-${A.batchRowIndexBase}`,M,new Uint32Array(2)),_=lt(e,t,`dictionary-glyph-ranges-${A.batchRowIndexBase}`,R.dictionaryGlyphRanges,new Uint32Array(2)),P=lt(e,t,`dictionary-glyph-records-${A.batchRowIndexBase}`,R.dictionaryGlyphRecords,new Uint32Array(2)),E=Be(e,t,R.glyphFrames),z=Ee({device:e,recordOffsets:R.startIndices,recordByteStride:1,maxBatchByteLength:e.limits.maxStorageBufferBindingSize,resourceLabel:"ArrowTextDictionaryStorageModel glyph instances"});for(const B of z){const F=na(e,t,A.batchRowIndexBase,B);x.push({rowBindingBatchIndex:I,rowStart:B.rowStart,rowEnd:B.rowEnd,glyphIndexBase:B.recordStart,glyphCount:B.recordCount,dictionaryRenderConfigBuffer:F}),g.push(F),f+=F.byteLength}y.push({...v,batchRowIndexBase:A.batchRowIndexBase,rowCount:A.texts.length,glyphCount:R.glyphCount,rowDictionaryRecordsBuffer:G,dictionaryGlyphRangesBuffer:_,dictionaryGlyphRecordsBuffer:P,glyphFramesBuffer:E.buffer,dictionaryGlyphCount:R.dictionaryGlyphCount,dictionaryValueCount:R.dictionaryValueCount}),i??=R,a+=R.glyphCount,l+=R.dictionaryGlyphCount,c+=R.dictionaryValueCount,u+=R.glyphStreamBuildTimeMs,f+=M.byteLength+R.dictionaryGlyphRanges.byteLength+R.dictionaryGlyphRecords.byteLength,h+=v.ownedByteLength,m+=E.byteLength,w.push(...v.ownedResources),g.push(G,_,P,E.buffer)}let b=!1;return{glyphStream:i,atlasTexture:o,characterSet:n.characterSet,glyphCount:a,dictionaryGlyphCount:l,dictionaryValueCount:c,glyphAttributeBuildTimeMs:u,glyphAttributeByteLength:d,compactStreamBuildTimeMs:u,compactStreamByteLength:f,generatedRenderBufferByteLength:d,rowStorageByteLength:h,glyphDefinitionStorageByteLength:m,transientComputeInputByteLength:0,fontRenderSettings:n.fontRenderSettings,batches:y,renderBatches:x,ownedRowBindingResources:w,ownedDictionaryResources:g,destroy:()=>{b||(b=!0,s&&o.destroy(),me(w),me(g))}}}function na(e,t,r,n){const o=new Uint32Array(Oi/Uint32Array.BYTES_PER_ELEMENT);return o[0]=n.recordStart,o[1]=n.rowStart,o[2]=n.rowEnd,o[3]=0,new Ge(e,{id:`${t.id||"arrow-text-dictionary-storage-model"}-render-config-${r}-${n.rowStart}`,usage:p.UNIFORM|p.COPY_DST|p.COPY_SRC,data:o})}function bt(e,t,r,n){const o=new Uint32Array(Pi/Uint32Array.BYTES_PER_ELEMENT);return o[0]=n.recordStart,o[1]=n.rowStart,o[2]=n.rowEnd,o[3]=0,new Ge(e,{id:`${t.id||"arrow-text-storage-model"}-render-config-${r}-${n.rowStart}`,usage:p.UNIFORM|p.COPY_DST|p.COPY_SRC,data:o})}function Rt(e,t,r,n){const o=new Uint32Array(n);return{buffer:e.createBuffer({id:`${t.id||"arrow-text-storage-model"}-row-glyph-starts-${r}`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:o.byteLength>0?o:new Uint32Array(1)}),byteLength:o.byteLength}}function oa(e){const t=e.rowDictionaryIndices.length,r=new Uint32Array((t+1)*2);for(let n=0;n<t;n++)r[n*2]=e.rowDictionaryIndices[n]??Rr,r[n*2+1]=e.rowGlyphRanges[n*2]??0;return r[t*2]=Rr,r[t*2+1]=e.glyphCount,r}function Tr(){return globalThis.performance?.now()??Date.now()}function Ht(e){return Gn(e.fontAtlas,e.lineHeight??1)}function sa(e){return Gn(e.fontAtlas,e.lineHeight??1)}function Gn(e,t){return{lineHeight:t*e.lineHeight,characterSet:new Set(Object.keys(e.mapping)),fontAtlas:e,fontRenderSettings:e.renderSettings}}function Re(e,t){if(e.getChild(t))throw new Error(`ArrowTextModel labelTable column "${t}" is reserved`)}function Qe(e,t){if(e){if(e.length!==t)throw new Error("ArrowTextModel clipRects rows must match UTF-8 text rows");if(!D.isFixedSizeList(e.type)||e.type.listSize!==4||!(e.type.children[0]?.type instanceof V))throw new Error("ArrowTextModel clipRects must be FixedSizeList<Float32>[4]")}}function qt(e,t){const r=t.id||"text-storage-model",n=Q(e,`${r}-default-row-colors`,ae(new H,4,new Uint8Array(t.color??Bn))),o=Q(e,`${r}-default-row-angles`,de(new V,new Float32Array([t.angle??En]))),s=Q(e,`${r}-default-row-sizes`,de(new V,new Float32Array([t.size??Pn]))),i=Q(e,`${r}-default-row-pixel-offsets`,ae(new V,2,new Float32Array(t.pixelOffset??St))),a=Q(e,`${r}-default-row-text-anchors`,de(new Ne,new Uint32Array([Dn(t.textAnchor)]))),l=Q(e,`${r}-default-row-alignment-baselines`,de(new Ne,new Uint32Array([_n(t.alignmentBaseline)]))),c=Q(e,`${r}-default-row-clip-rects`,ae(new V,4,new Float32Array([0,0,-1,-1])));return{colorsBuffer:ee(n),anglesBuffer:ee(o),sizesBuffer:ee(s),pixelOffsetsBuffer:ee(i),textAnchorsBuffer:ee(a),alignmentBaselinesBuffer:ee(l),clipRectsBuffer:ee(c),byteLength:Uint8Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*2+Uint32Array.BYTES_PER_ELEMENT+Uint32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*4,ownedResources:[n,o,s,i,a,l,c]}}function We(e,t,r,n,o){const s=r.clipRects?aa(r.clipRects):void 0,i=s?Q(e,`${t.id||"text-storage-model"}-row-clip-rects-${r.batchRowIndexBase}`,ae(new V,4,s.byteLength>0?s:new Float32Array(4))):void 0,a=i?ee(i):r.clipRectsBuffer?W(r.clipRectsBuffer):n.clipRectsBuffer,l=ia(t,r.batchRowIndexBase,r.rowStorageIndexBase,o),c=new Ge(e,{id:`${t.id||"text-storage-model"}-style-config-${r.batchRowIndexBase}`,usage:p.UNIFORM|p.COPY_DST|p.COPY_SRC,data:l}),u=[c,...i?[i]:[]];return{rowPositionsBuffer:r.positionsBuffer,rowStorageIndexBase:r.rowStorageIndexBase,rowColorsBuffer:r.colorsBuffer??n.colorsBuffer,rowAnglesBuffer:r.anglesBuffer??n.anglesBuffer,rowSizesBuffer:r.sizesBuffer??n.sizesBuffer,rowPixelOffsetsBuffer:r.pixelOffsetsBuffer??n.pixelOffsetsBuffer,rowTextAnchorsBuffer:r.textAnchorsBuffer??n.textAnchorsBuffer,rowAlignmentBaselinesBuffer:r.alignmentBaselinesBuffer??n.alignmentBaselinesBuffer,rowClipRectsBuffer:a,styleConfigBuffer:c,ownedResources:u,ownedByteLength:l.byteLength+(s?.byteLength??0)}}function Q(e,t,r){return Y(e,r,{name:t,id:t,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC})}function ee(e){const[t,...r]=e.data;if(!t||r.length>0)throw new Error(`Storage text vector "${e.name}" requires exactly one GPUData chunk`);const n=t.buffer;return n instanceof Ge?n.buffer:n}function lt(e,t,r,n,o,s=p.STORAGE|p.COPY_DST|p.COPY_SRC){return e.createBuffer({id:`${t.id||"arrow-text-dictionary-storage-model"}-${r}`,usage:s,data:n.byteLength>0?n:o})}function me(e){for(const t of e)t.destroy()}function ia(e,t,r,n){const o=new ArrayBuffer(80),s=new Float32Array(o),i=new Uint32Array(o),a=e.color??Bn;return s[0]=a[0]/255,s[1]=a[1]/255,s[2]=a[2]/255,s[3]=a[3]/255,s[4]=e.angle??En,s[5]=e.size??Pn,s[6]=(e.pixelOffset??St)[0],s[7]=(e.pixelOffset??St)[1],i[8]=e.colors?1:0,i[9]=e.angles?1:0,i[10]=e.sizes?1:0,i[11]=e.pixelOffsets?1:0,i[12]=e.clipRects?1:0,i[13]=t,i[14]=r,i[15]=0,s[16]=n.mode==="bitmap"?Ei:n.threshold,s[17]=n.smoothing,i[18]=n.mode==="bitmap"?0:n.mode==="sdf"?1:2,s[19]=n.distanceRange??0,i}function Tt(e,t,r){return{rowTextAnchorsBuffer:W(t.rowTextAnchorsBuffer),rowAlignmentBaselinesBuffer:W(t.rowAlignmentBaselinesBuffer),useRowTextAnchors:!!e.textAnchors,useRowAlignmentBaselines:!!e.alignmentBaselines,textAnchor:Dn(e.textAnchor),alignmentBaseline:_n(e.alignmentBaseline),lineHeight:r}}function W(e){return e instanceof Ge?e.buffer:e}function Be(e,t,r){return{buffer:e.createBuffer({id:`${t.id||"arrow-text-storage-model"}-glyph-frames`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:r.byteLength>0?r:new Float32Array(4)}),byteLength:r.byteLength}}function et(e,t,r){return t.resources?{atlasTexture:t.resources.atlasTexture,ownsAtlasTexture:!1}:{atlasTexture:new Lr(e,{id:`${t.id||"text-model"}-atlas`,dimension:"2d-array",data:[...r.pages]}),ownsAtlasTexture:!0}}function aa(e){return Qe(e,e.length),new Float32Array(Bt(e))}function Dn(e){switch(e){case"middle":return 1;case"end":return 2;default:return Ci}}function _n(e){switch(e){case"top":return 1;case"bottom":return 2;default:return Bi}}function la(e,t){const r=t.rowEnd-t.rowStart,n=new Array(r+1),o=new Uint32Array(r*2);n[0]=0;for(let i=0;i<r;i++){const a=t.rowStart+i,l=e.startIndices[a]??t.recordStart,c=e.startIndices[a+1]??t.recordStart,u=l-t.recordStart,f=c-t.recordStart;o[i*2]=u,o[i*2+1]=f,n[i+1]=f}const s=fa(e.packedGlyphIds,t.recordStart,t.recordEnd);return{...e,startIndices:n,glyphCount:t.recordCount,labelGlyphRanges:o,packedGlyphIds:s,compactStreamByteLength:o.byteLength+s.byteLength,glyphStreamBuildTimeMs:0}}function ca(e,t){const r=t.rowEnd-t.rowStart,n=new Uint32Array(r*2),o=new Array(r+1);o[0]=0;for(let i=0;i<r;i++){const a=t.rowStart+i,l=e.rowByteRanges[a*2]??0,c=e.rowByteRanges[a*2+1]??l,u=c>l&&l>=t.recordStart&&c<=t.recordEnd,f=u?l-t.recordStart:0,d=u?c-t.recordStart:f;n[i*2]=f,n[i*2+1]=d,o[i+1]=Math.max(o[i]??0,d)}const s=ha(e.packedUtf8Bytes,t.recordStart,t.recordEnd);return{startIndices:o,rowByteRanges:n,packedUtf8Bytes:s,byteLength:t.recordCount,inputByteLength:n.byteLength+s.byteLength,textInputBuildTimeMs:0}}function ua(e,t,r,n){if(n.rowStart===0&&n.rowEnd===r.rowCount&&n.recordStart===0&&n.recordEnd===r.byteLength)return{rowByteRangesBuffer:r.rowByteRangesBuffer,inputByteLength:r.inputByteLength,ownsRowByteRangesBuffer:!1};const s=n.rowEnd-n.rowStart,i=new Uint32Array(s*2);for(let a=0;a<s;a++){const l=n.rowStart+a;i[a*2]=r.rowByteRanges[l*2]??0,i[a*2+1]=r.rowByteRanges[l*2+1]??i[a*2]}return{rowByteRangesBuffer:e.createBuffer({id:`${t.id||"text-storage-model"}-utf8-row-byte-ranges-${n.rowStart}`,usage:p.STORAGE|p.COPY_DST|p.COPY_SRC,data:i.byteLength>0?i:new Uint32Array(2)}),inputByteLength:i.byteLength+n.recordCount,ownsRowByteRangesBuffer:!0}}function fa(e,t,r){const n=Math.max(0,r-t),o=new Uint32Array(Math.ceil(n/2));for(let s=0;s<n;s++){const i=da(e,t+s);ga(o,s,i)}return o}function da(e,t){const r=e[t>>1]??0;return t&1?r>>>16:r&65535}function ga(e,t,r){const n=t>>1,o=e[n]??0;e[n]=t&1?o|(r&65535)<<16:o|r&65535}function ha(e,t,r){const n=Math.max(0,r-t),o=new Uint32Array(Math.ceil(n/Uint32Array.BYTES_PER_ELEMENT)),s=new Uint8Array(e.buffer,e.byteOffset,e.byteLength);return new Uint8Array(o.buffer).set(s.subarray(t,r)),o}function ct(e,t,r){return new ve(e,new To(r,new ve("value",t,!1)),!1)}function Mn(e){return rr(e)||D.isFixedSizeList(e)&&rr(e.children[0].type)}function Vn(e){return!!e&&D.isFixedSizeList(e)&&e.listSize===4&&e.children[0]?.type instanceof H}function Ln(e){return!!e&&D.isList(e)&&Vn(e.children[0]?.type)}function xa(e){return Vn(e)||Ln(e)}function pa(e,t,r){const n=t[t.length-1]??0,o=new Uint8Array(n*4);let s=0;for(const i of e.data){const a=i.valueOffsets,l=i.children[0],c=l?.children[0],u=c?.values;if(!a||!l||!c||!u)throw new Error("ArrowTextModel character colors require Arrow list offsets and values");if(r&&((l.nullCount??0)>0||(c.nullCount??0)>0))throw new Error("ArrowTextModel character colors do not support nullable nested color values");const f=a[0]??0,d=c.offset??0;for(let h=0;h<i.length;h++){const m=s+h,w=t[m]??0,g=t[m+1]??w,y=g-w;if(r&&!wa(i,h)){for(let b=w;b<g;b++)o.set(r,b*4);continue}const x=(a[h]??f)-f,S=(a[h+1]??x)-f;if(S-x!==y)throw new Error("ArrowTextModel character colors must provide one color per UTF-8 code point");o.set(u.subarray(d+x*4,d+S*4),w*4)}s+=i.length}return ae(new H,4,o)}function ya(e,t){switch(e){case"colors":return t.color;case"angles":return t.angle;case"sizes":return t.size;default:return}}function wa(e,t){if(e.nullCount===0||!e.nullBitmap)return!0;const r=(e.offset??0)+t;return((e.nullBitmap[r>>3]??0)&1<<(r&7))!==0}function de(e,t){return So(Ro({type:e,length:t.length,data:t}))}function It(e,t=0){const r=e[e.length-1]??0,n=new Uint32Array(r);for(let o=0;o<e.length-1;o++)n.fill(t+o,e[o],e[o+1]);return n}function ma(e){let t=0;for(const r of Object.values(e))Mn(r.type)&&(t+=Bt(r).byteLength);return t}const Sa={positions:"positions",text:"texts",clipRects:"clipRects",colors:"colors",angles:"angles",sizes:"sizes",pixelOffsets:"pixelOffsets",textAnchors:"textAnchors",alignmentBaselines:"alignmentBaselines"};function Un(e,t){const r={...Sa,...t.columns},{sourceVectors:n}=t,o=Y(e,n.positions,{name:r.positions,preserveDataChunks:!0}),s=Y(e,n.texts,{name:r.text}),i=n.clipRects?Y(e,n.clipRects,{name:r.clipRects,preserveDataChunks:!0}):void 0,a=n.colors?Y(e,n.colors,{name:r.colors,format:D.isList(n.colors.type)?"vertex-list<unorm8x4>":"unorm8x4",preserveDataChunks:!0}):void 0,l=n.angles?Y(e,n.angles,{name:r.angles,preserveDataChunks:!0}):void 0,c=n.sizes?Y(e,n.sizes,{name:r.sizes,preserveDataChunks:!0}):void 0,u=n.pixelOffsets?Y(e,n.pixelOffsets,{name:r.pixelOffsets,preserveDataChunks:!0}):void 0,f=n.textAnchors?Y(e,n.textAnchors,{name:r.textAnchors,preserveDataChunks:!0}):void 0,d=n.alignmentBaselines?Y(e,n.alignmentBaselines,{name:r.alignmentBaselines,preserveDataChunks:!0}):void 0;let h=!1;return{positions:o,texts:s,...i?{clipRects:i}:{},...a?{colors:a}:{},...l?{angles:l}:{},...c?{sizes:c}:{},...u?{pixelOffsets:u}:{},...f?{textAnchors:f}:{},...d?{alignmentBaselines:d}:{},sourceVectors:n,destroy:()=>{h||(h=!0,o.destroy(),s.destroy(),i?.destroy(),a?.destroy(),l?.destroy(),c?.destroy(),u?.destroy(),f?.destroy(),d?.destroy())}}}function ba(e,t){return ji(e,t)}function Ra(e,t){return{attributeState:ba(e,t)}}function Fn(e,t){if(t.sourceVectors.colors&&D.isList(t.sourceVectors.colors.type))throw new Error("convertArrowTextToStorage requires row colors, not per-character colors");return Un(e,t)}function Ta(e,t){if(Aa(e,t))try{return ta(e,t)}catch(r){if(!va(r))throw r}return ea(e,t)}function Ia(e,t){const r=Ta(e,t),{sourceVectors:n,rowIndexColumn:o,...s}=t;return{...s,storageState:r}}function Aa(e,t){return e.type==="webgpu"&&Ft(e)&&t.rowIndexColumn!==!0&&t.texts.format==="value-list<uint8>"}function va(e){return e instanceof Error&&/row offset metadata|zero-offset byte buffers|textBatches|clipRects batches/.test(e.message)}function Ca(e,t){if(!D.isDictionary(t.sourceVectors.texts.type))throw new Error("convertArrowTextToDictionary requires Dictionary<Utf8> text");return Fn(e,t)}function Ba(e,t){return ra(e,t)}function Ea(e,t){const r=Ba(e,t),{sourceVectors:n,rowIndexColumn:o,...s}=t;return{...s,storageState:r}}const jt={renderMode:{expression:"textViewport.textFontRenderMode",kind:"float"},sdfThreshold:"textViewport.textSdfThreshold",sdfSmoothing:"textViewport.textSdfSmoothing",msdfDistanceRange:"textViewport.textMsdfDistanceRange"},zn={renderMode:{expression:"textStorageStyleConfig.fontRenderMode",kind:"uint"},sdfThreshold:"textStorageStyleConfig.sdfThreshold",sdfSmoothing:"textStorageStyleConfig.sdfSmoothing",msdfDistanceRange:"textStorageStyleConfig.msdfDistanceRange"},Ir=new WeakMap;function Pa(e,t){let r=Ir.get(e);return r||(r=new Set,Ir.set(e,r)),r.has(t)||(e.addShaderHook(t==="wgsl"?"vs:TEXT_ATTRIBUTE_VERTEX_TRANSFORM(outputs: ptr<function, FragmentInputs>, worldPosition: vec2<f32>, glyphFrame: vec4<f32>, corner: vec2<f32>, glyphSize: vec2<f32>, atlasSize: vec2<f32>)":"vs:TEXT_ATTRIBUTE_VERTEX_TRANSFORM(inout vec4 position, inout vec2 textureCoordinate, inout vec4 textColor, vec2 worldPosition, vec4 glyphFrame, vec2 corner, vec2 glyphSize, vec2 atlasSize)"),r.add(t)),e}const ut={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:"clipRects",location:1,type:"vec4<f32>",stepMode:"instance"},{name:"colors",location:2,type:"vec4<f32>",stepMode:"instance"},{name:"angles",location:3,type:"f32",stepMode:"instance"},{name:"sizes",location:4,type:"f32",stepMode:"instance"},{name:"pixelOffsets",location:5,type:"vec2<f32>",stepMode:"instance"}],bindings:[{name:"texts",type:"read-only-storage",group:0,location:0},{name:"textAnchors",type:"read-only-storage",group:0,location:1},{name:"alignmentBaselines",type:"read-only-storage",group:0,location:2}]},Oa={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:"glyphOffsets",location:1,type:"vec2<i32>",stepMode:"instance"},{name:"glyphFrames",location:2,type:"vec4<u32>",stepMode:"instance"},{name:"glyphPages",location:3,type:"u32",stepMode:"instance"},{name:"rowIndices",location:4,type:"u32",stepMode:"instance"},{name:"glyphClipRects",location:5,type:"vec4<f32>",stepMode:"instance"},{name:"colors",location:6,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},kn={attributes:[{name:"glyphOffsets",location:0,type:"vec2<i32>",stepMode:"instance"},{name:"glyphIndices",location:1,type:"vec2<u32>",stepMode:"instance"}],bindings:[]},Ga={attributes:[...kn.attributes,{name:"glyphRowIndices",location:2,type:"u32",stepMode:"instance"}],bindings:[]},Da={attributes:[],bindings:[]},_a=`struct TextViewportUniforms {
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

${De({functionName:"getGlyphAlpha",textureCoordinate:"inputs.textureCoordinate",atlasPage:"inputs.atlasPage",settings:jt})}

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
`,Nn=`struct TextViewportUniforms {
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

${De({functionName:"getStorageGlyphAlpha",textureCoordinate:"inputs.textureCoordinate",atlasPage:"inputs.atlasPage",settings:zn})}

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
`,Ma=Nn.replace("@location(1) glyphIndices : vec2<u32>,",`@location(1) glyphIndices : vec2<u32>,
  @location(2) glyphRowIndices : u32,`).replace("let rowIndex = findRowIndex(glyphIndex);","let rowIndex = inputs.glyphRowIndices;"),Va=`struct TextViewportUniforms {
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

${De({functionName:"getStorageGlyphAlpha",textureCoordinate:"inputs.textureCoordinate",atlasPage:"inputs.atlasPage",settings:zn})}

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
`,La=`#version 300 es
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
`,Ua=`#version 300 es
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

${qe({functionName:"getGlyphAlpha",textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:jt})}

void main() {
  float glyphAlpha = getGlyphAlpha();
  fragColor = vec4(vTextColor.rgb, vTextColor.a * glyphAlpha);
  fragColor = picking_filterColor(fragColor);
}
`;`${qe({functionName:"getGlyphAlpha",textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:jt})}`;const Fa={name:"textViewport",uniformTypes:{cameraOffset:"vec2<f32>",viewportScale:"vec2<f32>",glyphWorldScale:"f32",time:"f32",clippingEnabled:"f32",colorsEnabled:"f32",textFontRenderMode:"f32",textSdfThreshold:"f32",textSdfSmoothing:"f32",textMsdfDistanceRange:"f32",contentCutoffPixels:"vec2<f32>",contentAlign:"vec2<f32>"},defaultUniforms:{cameraOffset:[0,0],viewportScale:[1,1],glyphWorldScale:1,time:0,clippingEnabled:0,colorsEnabled:0,textFontRenderMode:0,textSdfThreshold:.5,textSdfSmoothing:.1,textMsdfDistanceRange:0,contentCutoffPixels:[0,0],contentAlign:[0,0]}};function za(e=oo){return new Dr({textViewport:Fa,picking:e})}function be(e={}){const t=e.selectors??{},r=ka(e.data),n=new Set(r?Io(r):[]),o=Ar("positions",t.positions,r,n),s=Ar("texts",t.texts,r,n),i=ne("clipRects",t.clipRects,r,n),a=ne("colors",t.colors,r,n),l=ne("angles",t.angles,r,n),c=ne("sizes",t.sizes,r,n),u=ne("pixelOffsets",t.pixelOffsets,r,n),f=ne("textAnchors",t.textAnchors,r,n),d=ne("alignmentBaselines",t.alignmentBaselines,r,n);return{positions:o,texts:s,...i?{clipRects:i}:{},...a?{colors:a}:{},...l?{angles:l}:{},...c?{sizes:c}:{},...u?{pixelOffsets:u}:{},...f?{textAnchors:f}:{},...d?{alignmentBaselines:d}:{}}}function ka(e){if(e)return e instanceof k?e:new k([e])}function Ar(e,t,r,n){const o=$n(e,t,r,n);if(!o)throw new Error(`ArrowTextRenderer source mapping requires ${e}`);return o}function ne(e,t,r,n){if(t!==null)return $n(e,t,r,n)}function $n(e,t,r,n){if(t instanceof re||e==="texts"&&xi(t))return t;const o=t??e;if(!r){if(t===void 0&&e!=="positions"&&e!=="texts")return;throw new Error(`ArrowTextRenderer source selector "${e}" requires data to resolve column "${o}"`)}if(!n.has(o)){if(t===void 0&&e!=="positions"&&e!=="texts")return;throw new Error(`ArrowTextRenderer source column "${o}" for "${e}" is missing`)}return Ao(r,o)}const Na={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},K={positions:"positions",texts:"texts",clipRects:"clipRects",colors:"colors",angles:"angles",sizes:"sizes",pixelOffsets:"pixelOffsets",textAnchors:"textAnchors",alignmentBaselines:"alignmentBaselines"},$a=[128,128,128,255],Ya=0,Xa=32,Wa=8,Ha=10;class Z extends Wo{device;shaderInputs;props;textInput;textData;textResources;textRenderer;resolvedModel;activeStreamingTextTable=null;dataLoadVersion=0;isDestroyed=!1;textDataOwner;get model(){return Is(this.textRenderer)}constructor(t,r,n){super(),this.device=t,this.props=r;const o=r.modelProps?.modules?.find(i=>i.name==="picking");this.shaderInputs=r.modelProps?.shaderInputs??za(o),r.modelProps?.modules&&this.shaderInputs.addModules(r.modelProps.modules),this.textInput=n,this.textResources=new lr(t,{id:r.id,fontAtlas:r.fontAtlas}),this.resolvedModel=this.resolveModel(this.props.model??"auto",this.textInput);const s=this.createTextRenderer(this.resolvedModel,this.props,this.textInput);this.textData=s.textData,this.textRenderer=s.textRenderer}static async create(t,r){const n=r.data&&Symbol.asyncIterator in r.data?r.data:null;if(!n)return new Z(t,r,await dt(t,r));const o=gt(n),s=await o.next();if(s.done)throw new Error("ArrowTextRenderer data requires at least one Arrow record batch");const i=s.value,a={...r,data:new k([i])},l=new Z(t,a,await dt(t,a)),c=l.beginDataLoad();return l.loadDataBatches({...r,data:nl(i,o)},c,"streamed Arrow text batch"),l}static createFromPreparedInput(t,r,n){return new Z(t,r,n)}transferTextDataOwnership(t){return this.textDataOwner=t,this.textData}static prepareData(t,r){const n=vr(Xn(r)),o=vt(n.colors?.type);return D.isDictionary(n.texts.type)&&!o?Ca(t,{sourceVectors:n}):o?Un(t,{sourceVectors:n}):Fn(t,{sourceVectors:n})}static prepareDataFromGPUTable(t){const r=new k(t.recordBatches),n=be({data:r,selectors:t.props}),o=vr(n);return{positions:nr(t.gpuTable,"positions","ArrowTextRenderer data"),texts:nr(t.gpuTable,"texts","ArrowTextRenderer data"),...n.clipRects?{clipRects:oe(t.gpuTable,"clipRects")}:{},...n.colors?{colors:oe(t.gpuTable,"colors")}:{},...n.angles?{angles:oe(t.gpuTable,"angles")}:{},...n.sizes?{sizes:oe(t.gpuTable,"sizes")}:{},...n.pixelOffsets?{pixelOffsets:oe(t.gpuTable,"pixelOffsets")}:{},...n.textAnchors?{textAnchors:oe(t.gpuTable,"textAnchors")}:{},...n.alignmentBaselines?{alignmentBaselines:oe(t.gpuTable,"alignmentBaselines")}:{},sourceVectors:o,destroy:()=>{}}}async setProps(t,r="ArrowTextRenderer props changed",n={}){const o=this.props,s={...this.props,...t},a=Object.prototype.hasOwnProperty.call(t,"data")&&t.data!==o.data,l=t.model!==void 0&&t.model!==o.model,c=ll(t),u=Ka(t,o,"fontAtlas");if(!n.preserveDataLoad&&ul(s,a)){const A=this.beginDataLoad();return this.props=s,this.loadDataBatches(s,A,r),{modelChanged:!0}}const f=!n.preserveDataLoad&&(a||l||c||u),d=f?this.activeStreamingTextTable:null;f&&(this.dataLoadVersion++,this.activeStreamingTextTable=null);const h=c||l,m=c?await dt(this.device,s):l?rl(this.device,this.textInput):this.textInput,w=this.resolveModel(s.model??this.props.model??"auto",m),g=h||t.model!==void 0&&t.model!==o.model||u||fl(t,o)||w!==this.resolvedModel,y=g;if(!g)return this.props=s,y&&this.model.setNeedsRedraw(r),d?.destroy(),{modelChanged:g};const x=this.textRenderer,S=this.textData,b=this.textInput,T=this.textResources;u&&(this.textResources=new lr(this.device,{id:s.id,fontAtlas:s.fontAtlas}));let I;try{I=this.createTextRenderer(w,s,m)}catch(A){throw this.textResources!==T&&(this.textResources.destroy(),this.textResources=T),A}return this.props=s,this.textInput=m,this.resolvedModel=w,this.textData=I.textData,this.textRenderer=I.textRenderer,x.destroy(),this.releaseReplacedTextData(I.textData,S),T!==this.textResources&&T.destroy(),b!==m&&b.destroy(),d?.destroy(),this.model.setNeedsRedraw(r),{modelChanged:g}}async loadDataBatches(t,r,n){if(!t.data)return;const o=gt(t.data),s=[];let i=null,a=!1,l=!1;if(this.isDataLoadActive(r))try{for(let c=await o.next();!c.done;c=await o.next()){if(!this.isDataLoadActive(r))return;const u=c.value,f=!l;if(s.push(u),f){const w=this.activeStreamingTextTable;a=Wn(s,t),a?this.activeStreamingTextTable=null:(i=Za(this.device,u,t),this.activeStreamingTextTable=i),l=!0;const g=a?await At(this.device,s,t):Kt(i,s,t),y=this.setPreparedTextInput(t,g,n,{preserveDataLoad:!0});w?.destroy(),t.onDataBatch?.({textInput:g,loadedBatchCount:a?s.length:i.batches.length,isFirstBatch:!0,setPropsResult:y});continue}a||Qa(this.device,i,u,t);const d=a?await At(this.device,[u],t):el(i,u,t),h=this.textInput,m=this.appendPreparedTextInput(t,d,h,n);a?tl(h,d):Yn(h,d),t.onDataBatch?.({textInput:h,loadedBatchCount:a?s.length:i.batches.length,isFirstBatch:!1,setPropsResult:m})}}catch(c){this.isDataLoadActive(r)&&t.onDataError?.(c)}}appendPreparedTextInput(t,r,n,o){const s=this.resolveModel(t.model??this.props.model??"auto",r);if(s!==this.resolvedModel)return this.setPreparedTextInput(t,n,o,{preserveDataLoad:!0});const i=this.textRenderer.stats,a=this.createGPUTextData(s,t,r,{sourceBatchIndex:this.textData.length,rowIndexBase:i.rowCount,glyphIndexBase:i.glyphCount});try{this.textRenderer.appendData(a)}catch(l){throw a.destroy(),l}return this.textData.push(a),this.props=t,this.textInput=n,this.textDataOwner?.({data:this.textData,added:[a],removed:[]}),this.model.setNeedsRedraw(o),{modelChanged:!1}}setPreparedTextInput(t,r,n,o={}){const s=this.props,i=!o.preserveDataLoad&&t.data!==void 0&&t.data!==s.data,a=i?this.activeStreamingTextTable:null;i&&(this.dataLoadVersion++,this.activeStreamingTextTable=null);const l=this.resolveModel(t.model??this.props.model??"auto",r),c=r!==this.textInput||t.model!==s.model||l!==this.resolvedModel;if(!c)return this.props=t,a?.destroy(),{modelChanged:c};const u=this.textRenderer,f=this.textData,d=this.textInput,h=this.createTextRenderer(l,t,r);return this.props=t,this.textInput=r,this.resolvedModel=l,this.textData=h.textData,this.textRenderer=h.textRenderer,u.destroy(),this.releaseReplacedTextData(h.textData,f),d!==r&&d.destroy(),a?.destroy(),this.model.setNeedsRedraw(n),{modelChanged:c}}needsRedraw(){const t=super.needsRedraw(),r=this.model.needsRedraw();return t||r}setNeedsRedraw(t){super.setNeedsRedraw(t),this.model.setNeedsRedraw(t)}predraw(t){this.model.predraw(t)}draw(t){this.model.draw(t)}destroy(){this.isDestroyed=!0,this.dataLoadVersion++;const t=this.activeStreamingTextTable;if(this.activeStreamingTextTable=null,this.textRenderer.destroy(),!this.textDataOwner)for(const r of this.textData)r.destroy();this.textInput.destroy(),t?.destroy(),this.textResources.destroy()}releaseReplacedTextData(t,r){if(this.textDataOwner)this.textDataOwner({data:t,added:t,removed:r});else for(const n of r)n.destroy()}createTextRenderer(t,r,n){const o=[];let s=0,i=0;try{for(const[a,l]of qa(n).entries()){const c=this.createGPUTextData(t,r,l,{sourceBatchIndex:a,rowIndexBase:s,glyphIndexBase:i});o.push(c),s+=c.rowCount,i+=c.glyphCount}}catch(a){for(const l of o)l.destroy();throw a}return{textData:o,textRenderer:new Ts(this.device,{data:o})}}createGPUTextData(t,r,n,o={}){const s=r.color??$a,i=r.angle??Ya,a=r.size??Xa;ja(this.shaderInputs,r.fontAtlas);const l=r.modelProps?.shaderAssembler??(this.device.info.shadingLanguage==="wgsl"?new Qn:new eo);(this.device.info.shadingLanguage==="wgsl"?r.modelProps?.source:r.modelProps?.vs||r.modelProps?.fs)||Pa(l,this.device.info.shadingLanguage);const u={id:r.id,fontAtlas:r.fontAtlas,resources:this.textResources,rowIndexBase:o.rowIndexBase,...r.modelProps,shaderAssembler:l,shaderInputs:this.shaderInputs,modules:xl(hl(this.device),r.modelProps?.modules??[]),parameters:Na,color:s,angle:i,size:a,pixelOffset:r.pixelOffset,textAnchor:r.textAnchor,alignmentBaseline:r.alignmentBaseline};if(t==="dictionary"){const w=Ea(this.device,{...this.getStorageInputProps(n),...u,source:r.modelProps?.source??Va,shaderLayout:r.dictionaryStorageShaderLayout??Da}),{storageState:g,...y}=w;return ot({strategy:"dictionary",modelProps:y,state:g},{resources:this.textResources,rowCount:n.positions.length,...o})}if(t==="storage"||t==="storage-row-indexed"){const w=Ia(this.device,{...this.getStorageInputProps(n),...u,rowIndexColumn:t==="storage-row-indexed",source:r.modelProps?.source??(t==="storage-row-indexed"?Ma:Nn),shaderLayout:r.storageShaderLayout??(t==="storage-row-indexed"?Ga:kn)}),{storageState:g,...y}=w;return ot({strategy:t,modelProps:y,state:g},{resources:this.textResources,rowCount:n.positions.length,...o})}const f=Ra(this.device,{...this.getInputProps(n),...u,source:r.modelProps?.source??_a,vs:r.modelProps?.vs??La,fs:r.modelProps?.fs??Ua,shaderLayout:r.attributeShaderLayout??Oa}),{attributeState:d,...h}=f;return ot({strategy:"attribute",modelProps:h,state:d},{resources:this.textResources,rowCount:n.positions.length,...o})}resolveModel(t,r){const n=vt(r.sourceVectors.colors?.type),o=D.isDictionary(r.sourceVectors.texts.type),s=+!!r.sourceVectors.textAnchors+ +!!r.sourceVectors.alignmentBaselines,i=or(this.device,Wa)&&Ut(this.device,s),a=or(this.device,Ha);return t==="auto"?a&&o&&!n?"dictionary":i&&!n?"storage":"attribute":t!=="attribute"&&n||t==="dictionary"&&!a||(t==="storage"||t==="storage-row-indexed")&&!i||t==="dictionary"&&!o?"attribute":t}beginDataLoad(){return this.dataLoadVersion++,this.dataLoadVersion}isDataLoadActive(t){return!this.isDestroyed&&t===this.dataLoadVersion}getInputProps(t){return{positions:t.positions,texts:t.texts,sourceVectors:t.sourceVectors,...t.clipRects?{clipRects:t.clipRects}:{},...t.colors?{colors:t.colors}:{},...t.angles?{angles:t.angles}:{},...t.sizes?{sizes:t.sizes}:{},...t.pixelOffsets?{pixelOffsets:t.pixelOffsets}:{}}}getStorageInputProps(t){return{positions:t.positions,texts:t.texts,sourceVectors:{texts:t.sourceVectors.texts,...t.sourceVectors.clipRects?{clipRects:t.sourceVectors.clipRects}:{}},...t.clipRects?{clipRects:t.clipRects}:{},...t.colors?{colors:t.colors}:{},...t.angles?{angles:t.angles}:{},...t.sizes?{sizes:t.sizes}:{},...t.pixelOffsets?{pixelOffsets:t.pixelOffsets}:{},...t.textAnchors?{textAnchors:t.textAnchors}:{},...t.alignmentBaselines?{alignmentBaselines:t.alignmentBaselines}:{}}}}function qa(e){return e.positions.data.map((t,r)=>{const n={positions:ft(e.positions,r),texts:ft(e.texts,r),sourceVectors:Object.fromEntries(Object.entries(e.sourceVectors).map(([i,a])=>{const l=a.data[r];return[i,new re([l])]})),destroy:()=>{}},o=n,s=e;for(const i of["clipRects","colors","angles","sizes","pixelOffsets","textAnchors","alignmentBaselines"]){const a=s[i];a&&(o[i]=ft(a,r))}return n})}function ft(e,t){const r=e.data[t];return new to({type:"data",name:e.name,data:[r],format:e.format,stride:e.stride,valueLength:r.valueLength,byteStride:e.byteStride,rowByteLength:e.rowByteLength,bufferLayout:e.bufferLayout,ownsData:!1,dataType:e.dataType})}function ja(e,t){const r=dn(t.renderSettings),n=new Set(e.getModules().map(o=>o.name));n.has("textViewport")&&e.setProps({textViewport:{textFontRenderMode:r.renderMode,textSdfThreshold:r.sdfThreshold,textSdfSmoothing:r.sdfSmoothing,textMsdfDistanceRange:r.msdfDistanceRange}}),n.has("textFont")&&e.setProps({textFont:r})}function Ka(e,t,r){return Object.prototype.hasOwnProperty.call(e,r)&&e[r]!==t[r]}function Za(e,t,r={}){const n=new k([t]),{arrowPaths:o,shaderLayout:s}=Zt(n,r);return Ct(e,n,{arrowPaths:o,shaderLayout:s})}function Ja(e,t,r={}){const{arrowPaths:n,shaderLayout:o}=Zt(t,r);return Ct(e,t,{arrowPaths:n,shaderLayout:o})}function Qa(e,t,r,n={}){const o=new k([r]),{arrowPaths:s,shaderLayout:i}=Zt(o,n),a=t.batches.length,l=t.batches.reduce((c,u)=>c+(u.sourceInfo?.sourceRowCount??u.numRows),0);t.addBatch(vo(e,r,{arrowPaths:s,shaderLayout:i,sourceInfo:so({sourceBatchIndex:a,sourceRowIndexOffset:l,sourceRowCount:r.numRows})}))}function Kt(e,t,r={}){const n=new k(t),{texts:o}=be({data:n,selectors:r});return{...Z.prepareDataFromGPUTable({gpuTable:e,recordBatches:t,props:r}),arrowVectorByteLength:Et(o)}}function el(e,t,r){const n=e.batches[e.batches.length-1],o=new Co({batches:[n]});return Kt(o,[t],r)}function tl(e,t){const r=["positions","texts","clipRects","colors","angles","sizes","pixelOffsets","textAnchors","alignmentBaselines"],n=e,o=t;for(const s of r){const i=n[s],a=o[s];if(!(!i||!a)){for(const l of[...a.data])i.addData(l);a.data.splice(0,a.data.length)}}return Yn(e,t),e}function Yn(e,t){const r=e.sourceVectors,n=t.sourceVectors;for(const[o,s]of Object.entries(n)){const i=r[o];r[o]=i?new re([...i.data,...s.data]):s}e.arrowVectorByteLength+=t.arrowVectorByteLength,t.destroy()}async function At(e,t,r){const n=await Hn(e,al(new k(t),r));return{...Z.prepareData(e,n),arrowVectorByteLength:Et(n.texts)}}function rl(e,t){return{...Z.prepareData(e,t.sourceVectors),arrowVectorByteLength:t.arrowVectorByteLength}}async function*nl(e,t){yield e;for(let r=await t.next();!r.done;r=await t.next())yield r.value}async function dt(e,t){if(!t.data){const l=await Hn(e,Xn(t));return{...Z.prepareData(e,l),arrowVectorByteLength:Et(l.texts)}}const r=await pl(t.data);if(r.length===0)throw new Error("ArrowTextRenderer data requires at least one Arrow record batch");if(Wn(r,t))return await At(e,r,t);const n=new k(r),o=Ja(e,n,t),s=Kt(o,r,t),i=s.destroy;let a=!1;return{...s,destroy:()=>{a||(a=!0,i(),o.destroy())}}}function oe(e,t){return t===null?void 0:e.gpuVectors[t]??void 0}function ol(e){return{positions:typeof e.positions=="string"?e.positions:K.positions,texts:typeof e.texts=="string"?e.texts:K.texts,clipRects:se(e.clipRects,K.clipRects),colors:se(e.colors,K.colors),angles:se(e.angles,K.angles),sizes:se(e.sizes,K.sizes),pixelOffsets:se(e.pixelOffsets,K.pixelOffsets),textAnchors:se(e.textAnchors,K.textAnchors),alignmentBaselines:se(e.alignmentBaselines,K.alignmentBaselines)}}function Zt(e,t){cl(t);const r=be({data:e,selectors:t}),n=ol(t);return{arrowPaths:sl(n,r),shaderLayout:il(r)}}function sl(e,t){return Object.fromEntries([["positions",e.positions],["texts",e.texts],...t.clipRects?[["clipRects",e.clipRects]]:[],...t.colors?[["colors",e.colors]]:[],...t.angles?[["angles",e.angles]]:[],...t.sizes?[["sizes",e.sizes]]:[],...t.pixelOffsets?[["pixelOffsets",e.pixelOffsets]]:[],...t.textAnchors?[["textAnchors",e.textAnchors]]:[],...t.alignmentBaselines?[["alignmentBaselines",e.alignmentBaselines]]:[]].filter(([,r])=>r!==null))}function il(e){const t=new Set(["positions","texts",...e.clipRects?["clipRects"]:[],...e.colors?["colors"]:[],...e.angles?["angles"]:[],...e.sizes?["sizes"]:[],...e.pixelOffsets?["pixelOffsets"]:[],...e.textAnchors?["textAnchors"]:[],...e.alignmentBaselines?["alignmentBaselines"]:[]]);return{...ut,attributes:ut.attributes.filter(r=>t.has(r.name)),bindings:ut.bindings.filter(r=>t.has(r.name))}}function se(e,t){return e===null?null:typeof e=="string"?e:t}function Xn(e){return be({selectors:e})}function al(e,t){return be({data:e,selectors:t})}function vr(e){return{...e,texts:yn(e.texts)}}function Wn(e,t){if(jn(t))return!0;const r=new k(e),n=be({data:r,selectors:t});return vt(n.colors?.type)||qn(n.colors)||Nt(n.texts)||pn(n.texts)}async function Hn(e,t){if(!qn(t.colors))return t;const r=await Bo(e,t.colors,{name:"arrow-text-colors",semantic:"color",format:"unorm8x4"});let n;try{n=await Eo(r.vector)}finally{r.destroy()}return{...t,colors:n}}function qn(e){return!!(e&&Po(e)&&(!D.isFixedSizeList(e.type)||e.type.listSize!==4||!(e.type.children[0]?.type instanceof H)))}function ll(e){return e.data!==void 0||e.positions!==void 0||e.texts!==void 0||e.clipRects!==void 0||e.colors!==void 0||e.angles!==void 0||e.sizes!==void 0||e.pixelOffsets!==void 0||e.textAnchors!==void 0||e.alignmentBaselines!==void 0}function cl(e){if(jn(e))throw new Error("Arrow text GPU table upload requires data-backed string column selectors")}function jn(e){return[e.positions,e.texts,e.clipRects,e.colors,e.angles,e.sizes,e.pixelOffsets,e.textAnchors,e.alignmentBaselines].some(t=>t instanceof re)}function ul(e,t){return!!(e.data&&t)}function fl(e,t){return e.color!==void 0&&!gl(e.color,t.color)||e.angle!==void 0&&e.angle!==t.angle||e.size!==void 0&&e.size!==t.size||e.pixelOffset!==void 0&&!dl(e.pixelOffset,t.pixelOffset)||e.textAnchor!==void 0&&e.textAnchor!==t.textAnchor||e.alignmentBaseline!==void 0&&e.alignmentBaseline!==t.alignmentBaseline}function dl(e,t){return e===t||!!(e&&t&&e[0]===t[0]&&e[1]===t[1])}function gl(e,t){return e===t||e!==void 0&&t!==void 0&&e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]&&e[3]===t[3]}function vt(e){return!!e&&D.isList(e)}function hl(e){return io(e)}function xl(e,t){const r=new Set(t.map(n=>n.name));return[...e.filter(n=>{const o=n.name;return!o||!r.has(o)}),...t]}async function pl(e){const t=[],r=gt(e);for(let n=await r.next();!n.done;n=await r.next())t.push(n.value);return t}const Kn={attributes:[{name:"glyphOffsets",location:0,type:"vec2<i32>",stepMode:"instance"},{name:"glyphIndices",location:1,type:"vec2<u32>",stepMode:"instance"}],bindings:[]},yl={attributes:[...Kn.attributes,{name:"glyphRowIndices",location:2,type:"u32",stepMode:"instance"}],bindings:[]},Zn=`
${Vr}

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
`,wl=Zn.replace("@location(1) glyphIndices: vec2<u32>,",`@location(1) glyphIndices: vec2<u32>,
  @location(2) glyphRowIndices: u32,`).replace("let rowIndex = findStorageTextRowIndex(glyphIndex);","let rowIndex = inputs.glyphRowIndices;"),Cr=[199,219,245,255],ml={renderMode:{expression:"textViewport.textFontRenderMode",kind:"float"},sdfThreshold:"textViewport.textSdfThreshold",sdfSmoothing:"textViewport.textSdfSmoothing",msdfDistanceRange:"textViewport.textMsdfDistanceRange"},Sl=`#version 300 es
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
`,bl=`#version 300 es
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

${qe({functionName:"getGlyphAlpha",textureCoordinate:"vTextureCoordinate",atlasPage:"vAtlasPage",settings:ml})}

void main() {
  float glyphAlpha = getGlyphAlpha();
  fragColor = vec4(vTextColor.rgb, vTextColor.a * glyphAlpha);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,Rl=`
${Vr}

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
`,Tl={attributes:[{name:"positions",location:0,type:"vec2<f32>",stepMode:"instance"},{name:"glyphOffsets",location:1,type:"vec2<i32>",stepMode:"instance"},{name:"glyphFrames",location:2,type:"vec4<u32>",stepMode:"instance"},{name:"glyphPages",location:3,type:"u32",stepMode:"instance"},{name:"rowIndices",location:4,type:"u32",stepMode:"instance"},{name:"glyphClipRects",location:5,type:"vec4<f32>",stepMode:"instance"},{name:"colors",location:6,type:"vec4<f32>",stepMode:"instance"},{name:"angles",location:7,type:"f32",stepMode:"instance"},{name:"sizes",location:8,type:"f32",stepMode:"instance"},{name:"pixelOffsets",location:9,type:"vec2<f32>",stepMode:"instance"}],bindings:[]},He=class He extends ro{getAttributeManager(){return null}setShaderModuleProps(t){super.setShaderModuleProps(this.context.device.type==="webgpu"?{layer:t.layer,picking:t.picking}:{layer:t.layer,project:t.project,picking:t.picking})}initializeState(){this.setState({renderer:null,textData:[],constantBuffers:[],loadVersion:0,sourceInitialized:!1,sourceInfos:[],gpuVectorSourceCache:new Map})}updateState(t){const{props:r,oldProps:n,changeFlags:o}=t,s=this.getLayerState();if(!s.sourceInitialized||o.dataChanged||r.positions!==n.positions||r.texts!==n.texts||r.clipRects!==n.clipRects||r.angles!==n.angles||r.sizes!==n.sizes||r.pixelOffsets!==n.pixelOffsets||r.textAnchors!==n.textAnchors||r.alignmentBaselines!==n.alignmentBaselines||r.model!==n.model||r.color!==n.color||r.angle!==n.angle||r.size!==n.size||r.pixelOffset!==n.pixelOffset||r.textAnchor!==n.textAnchor||r.alignmentBaseline!==n.alignmentBaseline){s.sourceInitialized=!0,s.sourceInfos=[],this.createRenderer(r);return}const a=this.getRendererOrNull();a&&a.setProps({model:r.model,fontAtlas:r.fontAtlas,angle:r.angle,size:r.size,pixelOffset:r.pixelOffset,textAnchor:r.textAnchor,alignmentBaseline:r.alignmentBaseline})}getModels(){const t=this.getRendererOrNull()?.model;return t?[t]:[]}draw({renderPass:t,context:r}){const n=this.getRendererOrNull();n&&(n.model.device.type==="webgpu"?Go(n.model,r.viewport,{contentCutoffPixels:this.props.contentCutoffPixels,contentAlignHorizontal:this.props.contentAlignHorizontal,contentAlignVertical:this.props.contentAlignVertical}):n.shaderInputs.setProps({textViewport:{cameraOffset:[0,0],viewportScale:[2/Math.max(r.viewport.width,1),2/Math.max(r.viewport.height,1)],glyphWorldScale:.36,time:0,clippingEnabled:this.props.clipRects===null?0:1,colorsEnabled:sr(this.props.color,Ve)?1:0,contentCutoffPixels:this.props.contentCutoffPixels??[0,0],contentAlign:[Er(this.props.contentAlignHorizontal),Er(this.props.contentAlignVertical)]}}),this.drawTextRenderer(n,t))}drawTextRenderer(t,r){t.draw(r)}getPickingInfo({info:t}){const r=t,n=r.index,o=this.getLayerState().sourceInfos.find(s=>n>=s.sourceRowIndexOffset&&n<s.sourceRowIndexOffset+s.sourceRowCount);return o&&(r.arrow={rowIndex:n,batchIndex:o.sourceBatchIndex,batchRowIndex:n-o.sourceRowIndexOffset}),r}finalizeState(t){const r=this.getLayerState();r.loadVersion++,r.renderer?.destroy();for(const n of r.textData)n.destroy();Le(r.constantBuffers),this.setState({renderer:null,textData:[],constantBuffers:[],loadVersion:r.loadVersion,sourceInitialized:!0,sourceInfos:[],gpuVectorSourceCache:new Map}),super.finalizeState(t)}async createRenderer(t){const r=this.getLayerState(),n=r.loadVersion+1;r.loadVersion=n;const o=Il(this.context.device,t.model);let s=Pr();try{let i=t,a=sr(t.color,Ve);if(typeof a=="string")if(t.data){const g=await Do(t.data,a);if(this.getLayerState().loadVersion!==n){await g.cancel();return}i={...t,data:g.data},g.hasColumn||(this.warnMissingColorColumn(t,a),a=void 0)}else this.warnMissingColorColumn(t,a),a=void 0;a instanceof re&&(a=await _o(this.context.device,a,`${this.id}-colors`)),ir(a)&&this.assertTextColorGPUVector(a,i);const l=await this.resolveTextColorSource(a,i),c=ar(t.color,Cr,Ve);s=o==="attribute"?vl(this.context.device,i,!!a,c):Pr();const u={...i,colors:l??null,color:c,model:o,attributeShaderLayout:Tl,storageShaderLayout:o==="storage-row-indexed"?yl:Kn,modelProps:{...i.modelProps,...this.getShaders(this.context.device.type==="webgpu"?{shaderAssembler:this.context.shaderAssembler,modules:[Mo,Jt],source:o==="storage-row-indexed"?wl:o==="storage"?Zn:Rl}:{shaderAssembler:this.context.shaderAssembler,modules:[Jn,Jt],vs:Sl,fs:bl}),shaderInputs:this.context.device.type==="webgpu"?new Dr({}):void 0,bufferLayout:[...i.modelProps?.bufferLayout??[],...s.bufferLayout],attributes:{...i.modelProps?.attributes,...s.attributes},constantAttributes:{...i.modelProps?.constantAttributes,...s.constantAttributes}},onDataBatch:g=>this.handleDataBatch(g,t.onDataBatch)},f=await Z.create(this.context.device,u);let d=[...f.transferTextDataOwnership(({data:g,removed:y})=>{for(const S of y)S.destroy();d=[...g];const x=this.getLayerState();x.renderer===f&&(x.textData=d)})];if(this.getLayerState().loadVersion!==n){f.destroy();for(const g of d)g.destroy();Le(s.buffers);return}const h=this.getRendererOrNull(),m=this.getLayerState().textData,w=this.getLayerState().constantBuffers;this.setState({renderer:f,textData:d,constantBuffers:s.buffers,loadVersion:n,sourceInitialized:!0,sourceInfos:this.getLayerState().sourceInfos,gpuVectorSourceCache:this.getLayerState().gpuVectorSourceCache}),h?.destroy();for(const g of m)g.destroy();Le(w),this.setNeedsRedraw(),this.watchRendererPipeline(f)}catch(i){Le(s.buffers),this.getLayerState().loadVersion===n&&(t.onDataError?t.onDataError(i):this.raiseError(Al(i),`loading Arrow data in ${this}`))}}async resolveTextColorSource(t,r){if(!ir(t))return t;this.assertTextColorGPUVector(t,r);const n=this.getLayerState().gpuVectorSourceCache;let o=n.get(t);return o||(o=Vo(this.context.device,t,`${this.id}-colors`,!0),n.set(t,o)),await o}warnMissingColorColumn(t,r){const n=ar(t.color,Cr,Ve);no.warn(`${this.id}: ArrowTextLayer color column "${r}" is missing; using color default ${JSON.stringify(n)}`)()}assertTextColorGPUVector(t,r){if(r.data)throw new Error("ArrowTextLayer direct GPUVector color requires direct text vectors rather than streamed data");const n=r.positions&&typeof r.positions!="string"?r.positions.length:void 0;Lo("ArrowTextLayer color",t,n)}handleDataBatch(t,r){let n=0;this.getLayerState().sourceInfos=t.textInput.sourceVectors.positions.data.map((s,i)=>{const a={sourceBatchIndex:i,sourceRowIndexOffset:n,sourceRowCount:s.length};return n+=s.length,a}),this.setNeedsRedraw();const o=this.getRendererOrNull();o&&this.watchRendererPipeline(o),r?.(t)}getRendererOrNull(){return this.state?.renderer??null}watchRendererPipeline(t){const r=t.model;Uo(r,()=>{this.getRendererOrNull()===t&&t.model===r&&this.setNeedsRedraw()},n=>{this.getRendererOrNull()===t&&t.model===r&&(this.props.onDataError?this.props.onDataError(n):this.raiseError(n,`linking Arrow shaders in ${this}`))})}getLayerState(){return this.state}};He.layerName="ArrowTextLayer",He.defaultProps={data:{type:"object",value:null,optional:!0},parameters:Oo,contentCutoffPixels:{type:"array",value:[0,0]},contentAlignHorizontal:"none",contentAlignVertical:"none"};let Br=He;function Il(e,t="auto"){if((t==="storage"||t==="storage-row-indexed")&&e.type!=="webgpu")throw new Error("ArrowTextLayer storage rendering requires WebGPU");const r=Ut(e);if(t==="auto")return r?"storage":"attribute";if(t!=="attribute"&&t!=="storage"&&t!=="storage-row-indexed")throw new Error(`ArrowTextLayer does not support the ${t} model`);return(t==="storage"||t==="storage-row-indexed")&&!r?"attribute":t}function Al(e){return e instanceof Error?e:new Error(String(e))}function Er(e){switch(e){case"start":return 1;case"center":return 2;case"end":return 3;default:return 0}}function Pr(){return{bufferLayout:[],attributes:{},constantAttributes:{},buffers:[]}}function vl(e,t,r,n){const o={bufferLayout:[],attributes:{},constantAttributes:{},buffers:[]},s=t.id??"arrow-text";return(t.clipRects===void 0||t.clipRects===null)&&Te(e,o,`${s}-constant-clip-rect`,"glyphClipRects",{name:"constantTextClipRect",byteStride:0,stepMode:"instance",attributes:[{attribute:"glyphClipRects",format:"float32x4",byteOffset:0}]},new Float32Array([0,0,-1,-1])),r||Te(e,o,`${s}-constant-color`,"colors",{name:"constantTextColor",byteStride:0,stepMode:"instance",attributes:[{attribute:"colors",format:"float32x4",byteOffset:0}]},new Float32Array(n.map(i=>i/255))),(t.angles===void 0||t.angles===null)&&Te(e,o,`${s}-constant-angle`,"angles",{name:"constantTextAngle",byteStride:0,stepMode:"instance",attributes:[{attribute:"angles",format:"float32",byteOffset:0}]},new Float32Array([t.angle??0])),(t.sizes===void 0||t.sizes===null)&&Te(e,o,`${s}-constant-size`,"sizes",{name:"constantTextSize",byteStride:0,stepMode:"instance",attributes:[{attribute:"sizes",format:"float32",byteOffset:0}]},new Float32Array([t.size??32])),(t.pixelOffsets===void 0||t.pixelOffsets===null)&&Te(e,o,`${s}-constant-pixel-offset`,"pixelOffsets",{name:"constantTextPixelOffset",byteStride:0,stepMode:"instance",attributes:[{attribute:"pixelOffsets",format:"float32x2",byteOffset:0}]},new Float32Array([0,0])),o}function Te(e,t,r,n,o,s){if(t.bufferLayout.push(o),e.type==="webgl")t.constantAttributes[n]=s;else{const i=e.createBuffer({id:r,data:s});t.attributes[o.name]=i,t.buffers.push(i)}}function Le(e){for(const t of e)t.destroy()}export{Br as A,Dl as b};
