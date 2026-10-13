import{i as Ze,B as w,C as vt,g as zn,D,M as Hn,G as F,a as Je,f as qn,L as Xn,p as Lt,d as Kn,b as jn,r as Zn}from"./deck-example-device-TQPRJnZ6.js";import{O as Jn}from"./orthographic-view-CoMX3VNX.js";import{p as Qn}from"./project32-Byi-VnKS.js";import{G as to,g as Qe,a as we,v as ae,b as eo,T as k,V as M,c as no,B as re,d as oo,r as tn,m as V,i as At,D as A,F as x,e as st,f as _,h as B,j as ao,S as en,k as U,l as q,n as O,L as X,o as nn,p as ro,U as ut,q as nt,s as so,t as io,u as on,w as Ot,x as co,y as lo,z as uo,A as ho,C as Pe,E as ye,H as G,I as fo,J as go,K as po,M as mo,N as Se,O as an,P as Ee,Q as wo,R as Po,W as yo,X as Ce,Y as xe,Z as rn,_ as ht,$ as So,a0 as sn}from"./arrow-example-panels-fMfN3W7u.js";import{p as cn,m as $}from"./arrow-fixed-size-list-CYN_Mtwc.js";import{A as Eo}from"./arrow-deck-Djc-ZCtY.js";import{g as Co}from"./arrow-layer-tooltip-D-4Wl9xx.js";import{D as xo}from"./arrow-example-source-panel-C8-7L6oC.js";const Ft="segmentStartPositions",Ut="segmentEndPositions",Te="segmentPreviousPositions",be="segmentNextPositions",Gt="segmentStartColors",$t="segmentEndColors",ve="segmentFlags",Ae="rowIndices",ln="expandedPathVertexData",St="pathViewOrigins",un="pathViewOriginData",To=Float32Array.BYTES_PER_ELEMENT*16+Uint32Array.BYTES_PER_ELEMENT*4,bo=Float32Array.BYTES_PER_ELEMENT*4,vo=Float32Array.BYTES_PER_ELEMENT*8,Ao=Float32Array.BYTES_PER_ELEMENT*12,hn=Float32Array.BYTES_PER_ELEMENT*16,dn=hn+Uint32Array.BYTES_PER_ELEMENT,fn=dn+Uint32Array.BYTES_PER_ELEMENT,Oo=fn+Uint32Array.BYTES_PER_ELEMENT,Io=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],_o={attributes:[{name:Ft,location:0,type:"vec4<f32>",stepMode:"instance"},{name:Ut,location:1,type:"vec4<f32>",stepMode:"instance"},{name:Gt,location:2,type:"u32",stepMode:"instance"},{name:$t,location:3,type:"u32",stepMode:"instance"},{name:St,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},Ro=`#version 300 es
precision highp float;

in vec4 segmentStartPositions;
in vec4 segmentEndPositions;
in uint segmentStartColors;
in uint segmentEndColors;
in vec4 pathViewOrigins;

void main() {
  vec4 pathDelta = gl_VertexID % 2 == 0 ? segmentStartPositions : segmentEndPositions;
  vec4 pathPosition = pathViewOrigins + pathDelta;
  gl_Position = vec4(pathPosition.xyz, 1.0);
}
`,Lo=`#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0);
}
`;class se extends to{static gpuInputSchema=Io;segmentLayout;expandedPathVertexData;pathViewOriginData;renderBatches;pathProps;pathShaderLayout;pathTable;ownsPathTable;constructor(e,n){const o=Oe(n);super(e,o.modelProps),this.pathTable=n.table,this.ownsPathTable=n.ownsTable??!1,this.pathProps=n,this.pathShaderLayout=o.modelProps.shaderLayout,this.segmentLayout=o.segmentLayout,this.expandedPathVertexData=o.expandedPathVertexData,this.pathViewOriginData=o.pathViewOriginData,this.renderBatches=o.renderBatches}setProps(e){const n={...this.pathProps,...e},o=e.pathState!==void 0||e.table!==void 0||e.ownsTable!==void 0;if(this.pathProps=n,!o){super.setProps({});return}const a=Oe(n);this.segmentLayout=a.segmentLayout,this.expandedPathVertexData=a.expandedPathVertexData,this.pathViewOriginData=a.pathViewOriginData,this.renderBatches=a.renderBatches,this.pathShaderLayout=a.modelProps.shaderLayout;const r=this.pathTable,s=this.ownsPathTable;this.pathTable=n.table,this.ownsPathTable=n.ownsTable??!1,super.setProps({table:this.pathTable}),s&&r!==this.pathTable&&r.destroy(),this.setAttributes(Wt(a.modelProps.shaderLayout,a)),this.setInstanceCount(a.segmentLayout.segmentCount),this.setNeedsRedraw("Path segment state updated")}draw(e){const n=this.table?.batches||[];if(n.length>0&&n.length!==this.renderBatches.length)throw new Error("PathAttributeModel draw batches must align with generated path render batches");let o=!0;try{for(const[a,r]of this.renderBatches.entries()){const s=n[a];this.setAttributes({...s?Qe(s.bufferLayout,s.gpuData):{},...gn(this.pathShaderLayout,r)},{byteOffsets:s?we(s.bufferLayout,s.gpuData):{}}),this.setInstanceCount(r.segmentCount),o=super.draw(e)&&o}}finally{const a=this.table?.batches[0];this.setAttributes({...Bo(this.table),...Wt(this.pathShaderLayout,{expandedPathVertexData:this.expandedPathVertexData,pathViewOriginData:this.pathViewOriginData})},{byteOffsets:a?we(a.bufferLayout,a.gpuData):{}}),this.setInstanceCount(this.segmentLayout.segmentCount)}return o}destroy(){super.destroy(),this.ownsPathTable&&(this.pathTable.destroy(),this.ownsPathTable=!1)}}function Bo(t){const e=t?.batches[0];return e?Qe(e.bufferLayout,e.gpuData):{}}function Oe(t){Mo(t),Vo(t),Fo(t);const e=t.shaderLayout??_o,n=t.pathState.renderBatches[0];if(!n)throw new Error("PathAttributeModel requires at least one prepared path render batch");const o=$o(t);return{modelProps:{...t,vs:t.vs??Ro,fs:t.fs??Lo,shaderLayout:e,attributes:{...t.attributes||{},...gn(e,n)},bufferLayout:[...t.bufferLayout||[],...Wo(e,o)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:t.pathState.segmentLayout.segmentCount,table:t.table,tableCount:"none"},segmentLayout:t.pathState.segmentLayout,expandedPathVertexData:n.expandedPathVertexData,pathViewOriginData:n.pathViewOriginData,renderBatches:t.pathState.renderBatches}}function Mo(t){ae("PathAttributeModel",se.gpuInputSchema,{paths:t.paths,colors:t.colors,widths:t.widths,viewOrigins:t.viewOrigins})}function Vo(t){const e=Do(t),[n,o]=e[0];for(const[a,r]of e.slice(1)){if(r.length!==o.length)throw new Error(`PathAttributeModel ${a} rows must match ${n} rows (${r.length} !== ${o.length})`);if(r.data.length!==o.data.length)throw new Error(`PathAttributeModel ${a} batch count must match ${n} batch count`);for(let s=0;s<r.data.length;s++)if(r.data[s].length!==o.data[s].length)throw new Error(`PathAttributeModel ${a} batch ${s} rows must match ${n}`)}t.colors&&No(t.colors)&&Uo(t.paths,t.colors)}function Do(t){return[["paths",t.paths],["colors",t.colors],["widths",t.widths],["viewOrigins",t.viewOrigins]].filter(([,e])=>e!==void 0)}function No(t){return t.format!==void 0&&Ze(t.format)}function Fo(t){if(!t.pathState)throw new Error("PathAttributeModel requires prepared pathState");const e=t.pathState.segmentLayout.startIndices.length-1;if(e!==t.paths.length)throw new Error(`PathAttributeModel prepared path rows must match path GPU rows (${e} !== ${t.paths.length})`)}function Uo(t,e){for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,a=e.data[n]?.valueOffsets;if(!o||!a||!Go(o,a))throw new Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function Go(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function $o(t){const e=new Set(Object.keys(t.constantAttributes||{}));for(const n of t.bufferLayout||[])if(n.attributes)for(const o of n.attributes)e.add(o.attribute);else e.add(n.name);return e}function Wo(t,e){const n=new Set(t.attributes.map(r=>r.name).filter(r=>!e.has(r))),o=[];n.has(Ft)&&o.push({attribute:Ft,format:"float32x4",byteOffset:0}),n.has(Ut)&&o.push({attribute:Ut,format:"float32x4",byteOffset:bo}),n.has(Te)&&o.push({attribute:Te,format:"float32x4",byteOffset:vo}),n.has(be)&&o.push({attribute:be,format:"float32x4",byteOffset:Ao}),n.has(ve)&&o.push({attribute:ve,format:"uint32",byteOffset:hn}),n.has(Ae)&&o.push({attribute:Ae,format:"uint32",byteOffset:dn}),n.has(Gt)&&o.push({attribute:Gt,format:"uint32",byteOffset:fn}),n.has($t)&&o.push({attribute:$t,format:"uint32",byteOffset:Oo});const a=[{name:ln,byteStride:To,stepMode:"instance",attributes:o}];return n.has(St)&&a.push({name:un,byteStride:Float32Array.BYTES_PER_ELEMENT*4,stepMode:"instance",attributes:[{attribute:St,format:"float32x4",byteOffset:0}]}),a}function Wt(t,e){const n=new Set(t.attributes.map(o=>o.name));return{[ln]:e.expandedPathVertexData,...n.has(St)?{[un]:e.pathViewOriginData}:{}}}function gn(t,e){return Wt(t,e)}const Ie=4,ot=3,Et=6,ko=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathRanges : array<vec4<u32>>;
@group(0) @binding(2) var<storage, read> pathExpansionConfig : array<u32>;
@group(0) @binding(3) var<storage, read_write> generatedPathVertices : array<u32>;

const PATH_SEGMENT_FIRST : u32 = 1u;
const PATH_SEGMENT_LAST : u32 = 2u;
const PATH_SEGMENT_CLOSED : u32 = 4u;
const COMPACT_PATH_RECORD_WORD_COUNT : u32 = ${ot}u;

fn getPathComponentCount() -> u32 {
  return pathExpansionConfig[1];
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= getPathComponentCount()) {
    return 0.0;
  }
  return pathValues[pointIndex * getPathComponentCount() + componentIndex];
}

fn pathIsClosed(pathStart: u32, pointCount: u32) -> bool {
  if (pointCount < 3u) {
    return false;
  }
  let lastPointIndex = pathStart + pointCount - 1u;
  var componentIndex = 0u;
  loop {
    if (componentIndex >= getPathComponentCount()) {
      break;
    }
    if (
      readPathComponent(pathStart, componentIndex) !=
      readPathComponent(lastPointIndex, componentIndex)
    ) {
      return false;
    }
    componentIndex += 1u;
  }
  return true;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let localRowIndex = globalInvocationId.x;
  let rowCount = pathExpansionConfig[0];
  if (localRowIndex >= rowCount) {
    return;
  }

  let rowStart = pathExpansionConfig[2];
  let generatedRecordStart = pathExpansionConfig[3];
  let recordWordCount = pathExpansionConfig[4];
  let pathRange = pathRanges[rowStart + localRowIndex];
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let outputStart = pathRange.z - generatedRecordStart;
  let rowIndex = pathRange.w;
  let pointCount = select(0u, pathEnd - pathStart, pathEnd >= pathStart);
  let segmentCount = select(0u, pointCount - 1u, pointCount > 0u);
  let closedPath = pathIsClosed(pathStart, pointCount);

  var segmentOffset = 0u;
  loop {
    if (segmentOffset >= segmentCount) {
      break;
    }
    let segmentStartPointIndex = pathStart + segmentOffset;
    let segmentEndPointIndex = segmentStartPointIndex + 1u;
    var previousPointIndex = segmentStartPointIndex;
    if (segmentOffset > 0u) {
      previousPointIndex = segmentStartPointIndex - 1u;
    } else if (closedPath) {
      previousPointIndex = pathEnd - 2u;
    }
    var nextPointIndex = segmentEndPointIndex + 1u;
    if (segmentOffset == segmentCount - 1u) {
      nextPointIndex = segmentEndPointIndex;
      if (closedPath) {
        nextPointIndex = pathStart + 1u;
      }
    }

    var flags = select(0u, PATH_SEGMENT_CLOSED, closedPath);
    if (segmentOffset == 0u) {
      flags |= PATH_SEGMENT_FIRST;
    }
    if (segmentOffset == segmentCount - 1u) {
      flags |= PATH_SEGMENT_LAST;
    }
    let recordWordOffset = (outputStart + segmentOffset) * recordWordCount;
    if (recordWordCount == COMPACT_PATH_RECORD_WORD_COUNT) {
      generatedPathVertices[recordWordOffset] = segmentStartPointIndex;
      generatedPathVertices[recordWordOffset + 1u] = flags;
      generatedPathVertices[recordWordOffset + 2u] = rowIndex;
    } else {
      generatedPathVertices[recordWordOffset] = segmentStartPointIndex;
      generatedPathVertices[recordWordOffset + 1u] = segmentEndPointIndex;
      generatedPathVertices[recordWordOffset + 2u] = previousPointIndex;
      generatedPathVertices[recordWordOffset + 3u] = nextPointIndex;
      generatedPathVertices[recordWordOffset + 4u] = flags;
      generatedPathVertices[recordWordOffset + 5u] = rowIndex;
    }
    segmentOffset += 1u;
  }
}
`,Yo={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"pathExpansionConfig",type:"read-only-storage",group:0,location:2},{name:"generatedPathVertices",type:"storage",group:0,location:3}],attributes:[]};function zo(t,e,n){const{valueOffsets:o,recordOffsets:a,batchRowIndexBase:r,rowCount:s}=n,i=new Uint32Array(Math.max(s,1)*Ie);for(let u=0;u<s;u++){const l=u*Ie;i[l]=Math.max(0,o[u]??0),i[l+1]=Math.max(i[l],o[u+1]??i[l]),i[l+2]=Math.max(0,a[u]??0),i[l+3]=r+u}const c=t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-path-ranges`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:i});return{pathRangesBuffer:c,byteLength:i.byteLength,destroy:()=>c.destroy()}}function Ho(t,e,n){const{generatedBufferBatch:o,componentCount:a,recordWordCount:r}=n,s=o.rowEnd-o.rowStart;if(r!==ot&&r!==Et)throw new Error(`Unsupported GPU path record word count ${r}; expected ${ot} or ${Et}`);const i=new Uint32Array([s,a,o.rowStart,o.recordStart,r]);return{expansionConfigBuffer:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-expansion-config`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:i}),byteLength:i.byteLength}}function qo(t,e,n,o){if(o!==ot&&o!==Et)throw new Error(`Unsupported GPU path record word count ${o}; expected ${ot} or ${Et}`);const a=Math.max(n,1),r=n*Uint32Array.BYTES_PER_ELEMENT*o;return{compactPathVertexData:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-generated-path-vertices`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(a*o)}),byteLength:r}}function Xo(t,e,n){const o=new vt(t,{id:`${e.id||"gpu-expanded-path-model"}-compute`,source:ko,shaderLayout:Yo,bindings:{pathValues:n.pathValues,pathRanges:n.pathRanges,pathExpansionConfig:n.expansionInput.expansionConfigBuffer,generatedPathVertices:n.generated.compactPathVertexData}});if(n.rowCount>0&&n.segmentCount>0){const a=t.beginComputePass({});o.dispatch(a,Math.ceil(n.rowCount/64)),a.end(),t.submit()}o.destroy()}function pn(t,e){Ko(t,e),jo(t);const n=[],o=ta(t.paths);let a=t.rowIndexBase??0;for(let r=0;r<t.paths.data.length;r++){const s=t.paths.data[r],i=ie(s),c=Qo(i,s.length),u=c[c.length-1]??0,l=t.colors?.data[r],h=t.widths?.data[r],f=t.timestamps?.data[r],d=t.viewOrigins?.data[r];n.push({batchRowIndexBase:a,rowCount:s.length,componentCount:o,valueOffsets:i,recordOffsets:c,segmentCount:u,pathValuesBinding:K(s,Bt(s,t.paths.byteStride)),viewOriginsBinding:d?K(d,d.length*t.viewOrigins.byteStride):void 0,colorsBinding:l?K(l,Bt(l,t.colors.byteStride)):void 0,widthsBinding:h?K(h,h.length*t.widths.byteStride):void 0,timestampsBinding:f?K(f,Bt(f,t.timestamps.byteStride)):void 0}),a+=s.length}return{batches:n}}function Ko(t,e){ae("PathStorageModel",e,{paths:t.paths,colors:t.colors,widths:t.widths,timestamps:t.timestamps,viewOrigins:t.viewOrigins})}function jo(t){const e=[["paths",t.paths],["colors",t.colors],["widths",t.widths],["timestamps",t.timestamps],["viewOrigins",t.viewOrigins]].filter(([,a])=>a!==void 0),[n,o]=e[0];for(const[a,r]of e.slice(1)){if(r.length!==o.length)throw new Error(`PathStorageModel ${a} rows must match ${n} rows (${r.length} !== ${o.length})`);if(r.data.length!==o.data.length)throw new Error(`PathStorageModel ${a} batch count must match ${n} batch count`);for(let s=0;s<r.data.length;s++)if(r.data[s].length!==o.data[s].length)throw new Error(`PathStorageModel ${a} batch ${s} rows must match ${n}`)}t.timestamps&&Zo(t.paths,t.timestamps),t.colors&&ea(t.colors)&&Jo(t.paths,t.colors)}function Zo(t,e){for(let n=0;n<t.data.length;n++){const o=ie(t.data[n]),a=e.data[n].valueOffsets;if(!a)throw new Error("PathStorageModel timestamps require copied variable-length offsets");if(!mn(o,a))throw new Error("PathStorageModel timestamps must align with path vertex offsets")}}function Jo(t,e){for(let n=0;n<t.data.length;n++){const o=ie(t.data[n]),a=e.data[n].valueOffsets;if(!a)throw new Error("PathStorageModel vertex colors require copied variable-length offsets");if(!mn(o,a))throw new Error("PathStorageModel vertex colors must align with path vertex offsets")}}function mn(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function ie(t){if(!t.valueOffsets)throw new Error("PathStorageModel paths require copied variable-length offset metadata");return t.valueOffsets}function Qo(t,e){const n=[0];for(let o=0;o<e;o++){const a=t[o]??0,r=t[o+1]??a,s=Math.max(0,r-a-1);n.push((n[n.length-1]??0)+s)}return n}function ta(t){const e=t.format;if(!e)throw new Error("PathStorageModel paths require GPUVector.format");return zn(e).components}function ea(t){return t.format!==void 0&&Ze(t.format)}function K(t,e){return{buffer:na(t),offset:t.byteOffset,...e&&e>0?{size:e}:{}}}function na(t){return t.buffer instanceof D?t.buffer.buffer:t.buffer}function Bt(t,e){return t.valueByteLength??t.valueLength*e}const kt="segmentStartPointIndices",Yt="segmentEndPointIndices",zt="segmentPreviousPointIndices",Ht="segmentNextPointIndices",qt="segmentFlags",Xt="rowIndices",J="compactPathVertexData",oa="pathRanges",aa="pathViewOrigins",ra=Uint32Array.BYTES_PER_ELEMENT*3,wn=Uint32Array.BYTES_PER_ELEMENT*6,sa=Uint32Array.BYTES_PER_ELEMENT,ia=Uint32Array.BYTES_PER_ELEMENT*2,ca=Uint32Array.BYTES_PER_ELEMENT*3,la=Uint32Array.BYTES_PER_ELEMENT*4,ua=Uint32Array.BYTES_PER_ELEMENT*5,ha=Uint32Array.BYTES_PER_ELEMENT,da=Uint32Array.BYTES_PER_ELEMENT*2,Pn=[255,255,255,255],yn=1,fa=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!1,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],Sn={attributes:[{name:kt,location:0,type:"u32",stepMode:"instance"},{name:qt,location:1,type:"u32",stepMode:"instance"},{name:Xt,location:2,type:"u32",stepMode:"instance"}],bindings:[]},ga=`
  @group(0) @binding(auto) var<storage, read> pathValues : array<f32>;
  @group(0) @binding(auto) var<storage, read> pathRanges : array<vec4<u32>>;
  @group(0) @binding(auto) var<storage, read> pathViewOrigins : array<vec4<f32>>;
  @group(0) @binding(auto) var<storage, read> pathRowColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathVertexColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathRowWidths : array<f32>;

struct PathStorageStyleConfig {
  constantColor : vec4<f32>,
  constantWidth : f32,
  useRowColors : u32,
  useRowWidths : u32,
  batchRowIndexBase : u32,
  pathComponentCount : u32,
  useViewOrigins : u32,
  useVertexColors : u32,
  _padding1 : u32,
};

@group(0) @binding(auto) var<uniform> pathStorageStyleConfig : PathStorageStyleConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) segmentStartPointIndices : u32,
  @location(1) segmentFlags : u32,
  @location(2) rowIndices : u32,
};

struct FragmentInputs {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec4<f32>,
};

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) {
    return 0.0;
  }
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

fn readPathRange(globalRowIndex: u32) -> vec4<u32> {
  return pathRanges[globalRowIndex - pathStorageStyleConfig.batchRowIndexBase];
}

fn readPathViewOrigin(rowIndex: u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) {
    return vec4<f32>(0.0);
  }
  return pathViewOrigins[rowIndex];
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  let rowIndex = inputs.rowIndices - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = readPathRange(inputs.rowIndices);
  let segmentEndPointIndex = min(inputs.segmentStartPointIndices + 1u, pathRange.y - 1u);
  let pathWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[rowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  let pathPosition = select(
    readPathPoint(inputs.segmentStartPointIndices),
    readPathPoint(segmentEndPointIndex),
    (inputs.vertexIndex & 1u) == 1u
  ) + readPathViewOrigin(rowIndex);
  var outputs : FragmentInputs;
  outputs.position = vec4<f32>(
    pathPosition.xyz + vec3<f32>(0.0, 0.0, pathWidth * 0.0),
    1.0
  );
  outputs.color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    outputs.color = mix(
      unpackPathColor(pathVertexColors[inputs.segmentStartPointIndices]),
      unpackPathColor(pathVertexColors[segmentEndPointIndex]),
      f32(inputs.vertexIndex & 1u)
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackPathColor(pathRowColors[rowIndex]);
  }
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  return inputs.color;
}
`;class it extends Hn{static gpuInputSchema=fa;segmentCount;pathRangeBuildTimeMs;pathRangeByteLength;pathRecordByteStride;compactPathVertexByteLength;generatedRenderBufferByteLength;rowStorageByteLength;transientComputeInputByteLength;batches;renderBatches;rowColorsBinding;vertexColorsBinding;rowWidthsBinding;styleConfigBuffer;compactPathVertexData;storageState;pathProps;ownsStorageState;constructor(e,n){if(e.type!=="webgpu")throw new Error("PathStorageModel is WebGPU-only");const o=!Re(n),a=o?_e(e,n):n.storageState;super(e,wa(n,a)),this.pathProps=n,this.storageState=a,this.ownsStorageState=o,this.applyStorageState(a)}setProps(e){const n={...this.pathProps,...e},o=Re(n),a=e,s="storageState"in e&&e.storageState!==void 0||a.paths!==void 0||a.shaderLayout!==void 0||a.rowIndexBase!==void 0,i=!o&&(a.colors!==void 0||a.widths!==void 0||a.timestamps!==void 0||a.viewOrigins!==void 0||a.color!==void 0||a.width!==void 0);if(this.pathProps=n,!s){if(i){Sa(this.device,n,this.storageState),this.applyStorageState(this.storageState);const h=H(this.storageState);this.setBindings(j(n,h)),this.setNeedsRedraw("Storage path row bindings updated")}return}const c=o?n.storageState:_e(this.device,n);this.ownsStorageState&&this.storageState.destroy(),this.storageState=c,this.ownsStorageState=!o,this.applyStorageState(c);const u=H(c),l=at(c);this.setAttributes({[J]:l.compactPathVertexData}),this.setBindings(j(n,u)),this.setInstanceCount(l.segmentCount),this.setNeedsRedraw("Storage path state updated")}draw(e){let n=!0;for(const r of this.storageState.renderBatches){if(r.segmentCount===0)continue;const s=this.storageState.batches[r.rowBindingBatchIndex];if(!s)throw new Error("PathStorageModel render batch is missing its row-binding batch");this.setAttributes({[J]:r.compactPathVertexData}),this.setBindings(j(this.pathProps,s)),this.setInstanceCount(r.segmentCount),n=super.draw(e)&&n}const o=H(this.storageState),a=at(this.storageState);return this.setAttributes({[J]:a.compactPathVertexData}),this.setBindings(j(this.pathProps,o)),this.setInstanceCount(this.storageState.segmentCount),n}destroy(){this.ownsStorageState&&this.storageState.destroy(),super.destroy()}applyStorageState(e){this.segmentCount=e.segmentCount,this.pathRangeBuildTimeMs=e.pathRangeBuildTimeMs,this.pathRangeByteLength=e.pathRangeByteLength,this.pathRecordByteStride=e.pathRecordByteStride,this.compactPathVertexByteLength=e.compactPathVertexByteLength,this.generatedRenderBufferByteLength=e.generatedRenderBufferByteLength,this.rowStorageByteLength=e.rowStorageByteLength,this.transientComputeInputByteLength=e.transientComputeInputByteLength,this.batches=e.batches,this.renderBatches=e.renderBatches,this.rowColorsBinding=e.rowColorsBinding,this.vertexColorsBinding=e.vertexColorsBinding,this.rowWidthsBinding=e.rowWidthsBinding,this.styleConfigBuffer=e.styleConfigBuffer,this.compactPathVertexData=e.compactPathVertexData}}function pa(t){const e=new Set(t.attributes.map(n=>n.name));return En(e)?"legacy":"compact"}function En(t){return t.has(Yt)||t.has(zt)||t.has(Ht)}function ma(t){return t==="legacy"?wn:ra}function _e(t,e){if(t.type!=="webgpu")throw new Error("createPathStorageState requires a WebGPU device");const n=Le(),o=e.shaderLayout??Sn,a=pa(o),r=ma(a),s=r/Uint32Array.BYTES_PER_ELEMENT,i=pn(e,it.gpuInputSchema),c=Cn(t,e),u=[...c.ownedResources],l=[],h=[],f=[];let d=0,g=0,m=0,p=c.byteLength,y=0;for(const[b,P]of i.batches.entries()){const C=zo(t,{id:e.id},{valueOffsets:P.valueOffsets,recordOffsets:P.recordOffsets,batchRowIndexBase:P.batchRowIndexBase,rowCount:P.rowCount});l.push(C),g+=C.byteLength;const v=xn(t,e,P,c),z=cn({device:t,recordOffsets:P.recordOffsets,recordByteStride:r,maxBatchByteLength:t.limits.maxStorageBufferBindingSize,resourceLabel:"PathStorageModel indexed generated path vertex data"});for(const I of z){const R=Ho(t,{id:e.id},{generatedBufferBatch:I,componentCount:P.componentCount,recordWordCount:s}),L=qo(t,{id:e.id},I.recordCount,s);Xo(t,{id:e.id},{pathValues:P.pathValuesBinding,pathRanges:C.pathRangesBuffer,expansionInput:R,generated:L,rowCount:I.rowEnd-I.rowStart,segmentCount:I.recordCount}),f.push({rowBindingBatchIndex:b,rowStart:I.rowStart,rowEnd:I.rowEnd,segmentCount:I.recordCount,compactPathVertexData:L.compactPathVertexData}),m+=L.byteLength,y+=R.byteLength,R.expansionConfigBuffer.destroy()}h.push({...v,batchRowIndexBase:P.batchRowIndexBase,rowCount:P.rowCount,segmentCount:P.segmentCount,pathValuesBinding:P.pathValuesBinding,pathRangesBinding:C.pathRangesBuffer,...P.timestampsBinding?{pathTimestampsBinding:P.timestampsBinding}:{},pathViewOriginsBinding:v.pathViewOriginsBinding}),u.push(...v.ownedResources),p+=v.ownedByteLength,d+=P.segmentCount}const E=H({batches:h}),S=at({renderBatches:f});let T=!1;return{segmentCount:d,pathRangeBuildTimeMs:Le()-n,pathRangeByteLength:g,pathRecordByteStride:r,compactPathVertexByteLength:m,generatedRenderBufferByteLength:m,rowStorageByteLength:p,transientComputeInputByteLength:y,batches:h,renderBatches:f,ownedRowBindingResources:u,rowColorsBinding:E.rowColorsBinding,vertexColorsBinding:E.vertexColorsBinding,rowWidthsBinding:E.rowWidthsBinding,styleConfigBuffer:E.styleConfigBuffer,compactPathVertexData:S.compactPathVertexData,destroy:()=>{if(!T){T=!0,Kt(u),Kt(l);for(const b of f)b.compactPathVertexData.destroy()}}}}function wa(t,e){const n=t.shaderLayout??Sn,o=H(e),a=at(e);return{...t,source:t.source??ga,shaderLayout:n,bindings:j(t,o),attributes:{...t.attributes||{},[J]:a.compactPathVertexData},bufferLayout:[...t.bufferLayout||[],Pa(n,e.pathRecordByteStride)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:a.segmentCount}}function j(t,e){return{...t.bindings||{},pathValues:e.pathValuesBinding,[oa]:e.pathRangesBinding,[aa]:e.pathViewOriginsBinding,pathRowColors:e.rowColorsBinding,pathVertexColors:e.vertexColorsBinding,pathRowWidths:e.rowWidthsBinding,...e.pathTimestampsBinding?{pathTimestamps:e.pathTimestampsBinding}:{},pathStorageStyleConfig:e.styleConfigBuffer}}function Pa(t,e){const n=new Set(t.attributes.map(r=>r.name)),o=e===wn,a=[];if(n.has(kt)&&a.push({attribute:kt,format:"uint32",byteOffset:0}),!o&&En(n))throw new Error("PathStorageModel storageState uses compact path records, but the shader layout requests legacy segment neighbor attributes");return o&&n.has(Yt)&&a.push({attribute:Yt,format:"uint32",byteOffset:sa}),o&&n.has(zt)&&a.push({attribute:zt,format:"uint32",byteOffset:ia}),o&&n.has(Ht)&&a.push({attribute:Ht,format:"uint32",byteOffset:ca}),n.has(qt)&&a.push({attribute:qt,format:"uint32",byteOffset:o?la:ha}),n.has(Xt)&&a.push({attribute:Xt,format:"uint32",byteOffset:o?ua:da}),{name:J,stepMode:"instance",byteStride:e,attributes:a}}function Cn(t,e){const n=e.id||"path-storage-model",o=Mt(t,`${n}-default-row-colors`,"unorm8x4",new Uint8Array(e.color??Pn)),a=Mt(t,`${n}-default-row-widths`,"float32",new Float32Array([e.width??yn])),r=Mt(t,`${n}-default-view-origins`,"float32x4",new Float32Array(4));return{colorsBinding:dt(o),vertexColorsBinding:dt(o),widthsBinding:dt(a),viewOriginsBinding:dt(r),byteLength:Uint8Array.BYTES_PER_ELEMENT*4+Float32Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT*4,ownedResources:[o,a,r]}}function xn(t,e,n,o){const a=ya(e,n.batchRowIndexBase,n.componentCount),r=new D(t,{id:`${e.id||"path-storage-model"}-style-config-${n.batchRowIndexBase}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:a});return{pathViewOriginsBinding:n.viewOriginsBinding??o.viewOriginsBinding,rowColorsBinding:e.colors&&Tn(e.colors)&&n.colorsBinding?n.colorsBinding:o.colorsBinding,vertexColorsBinding:e.colors&&bn(e.colors)&&n.colorsBinding?n.colorsBinding:o.vertexColorsBinding,rowWidthsBinding:n.widthsBinding??o.widthsBinding,styleConfigBuffer:r,ownedResources:[r],ownedByteLength:a.byteLength}}function Mt(t,e,n,o){return new F({type:"buffer",name:e,buffer:t.createBuffer({id:e,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:o}),format:n,length:1,ownsBuffer:!0})}function dt(t){const[e,...n]=t.data;if(!e||n.length>0)throw new Error(`Storage path vector "${t.name}" requires exactly one GPUData chunk`);const o=e.buffer;return o instanceof D?o.buffer:o}function Tn(t){return t.format==="unorm8x4"}function bn(t){return t.format==="vertex-list<unorm8x4>"}function ya(t,e,n){const o=new ArrayBuffer(48),a=new Float32Array(o),r=new Uint32Array(o),s=t.color??Pn;return a[0]=s[0]/255,a[1]=s[1]/255,a[2]=s[2]/255,a[3]=s[3]/255,a[4]=t.width??yn,r[5]=t.colors&&Tn(t.colors)?1:0,r[6]=t.widths?1:0,r[7]=e,r[8]=n,r[9]=t.viewOrigins?1:0,r[10]=t.colors&&bn(t.colors)?1:0,r}function Sa(t,e,n){const o=pn(e,it.gpuInputSchema);Ea(n,o.batches);const a=[],r=Cn(t,e);a.push(...r.ownedResources);let s=r.byteLength;const i=o.batches.map((c,u)=>{const l=n.batches[u],h=xn(t,e,c,r);return a.push(...h.ownedResources),s+=h.ownedByteLength,{...h,batchRowIndexBase:l.batchRowIndexBase,rowCount:l.rowCount,segmentCount:l.segmentCount,pathValuesBinding:l.pathValuesBinding,pathRangesBinding:l.pathRangesBinding,...c.timestampsBinding?{pathTimestampsBinding:c.timestampsBinding}:{},pathViewOriginsBinding:h.pathViewOriginsBinding}});xa(n.ownedRowBindingResources,a),n.batches=i,n.rowStorageByteLength=s,Ca(n)}function Ea(t,e){if(e.length!==t.batches.length)throw new Error("PathStorageModel row-binding updates must preserve path batch count");for(const[n,o]of e.entries()){const a=t.batches[n];if(!a||a.batchRowIndexBase!==o.batchRowIndexBase||a.rowCount!==o.rowCount||a.segmentCount!==o.segmentCount)throw new Error("PathStorageModel row-binding updates must preserve path batch rows")}}function Ca(t){const e=H(t),n=at(t);t.rowColorsBinding=e.rowColorsBinding,t.vertexColorsBinding=e.vertexColorsBinding,t.rowWidthsBinding=e.rowWidthsBinding,t.styleConfigBuffer=e.styleConfigBuffer,t.compactPathVertexData=n.compactPathVertexData}function Kt(t){for(const e of t)e.destroy()}function xa(t,e){Kt(t),t.splice(0,t.length,...e)}function H(t){const e=t.batches[0];if(!e)throw new Error("PathStorageState requires at least one row-binding batch");return e}function at(t){const e=t.renderBatches[0];if(!e)throw new Error("PathStorageState requires at least one render batch");return e}function Re(t){return"storageState"in t&&t.storageState!==void 0}function Le(){return typeof performance>"u"?Date.now():performance.now()}const Ta=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!0,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],ba=`
  @group(0) @binding(auto) var<storage, read> pathValues : array<f32>;
  @group(0) @binding(auto) var<storage, read> pathRanges : array<vec4<u32>>;
  @group(0) @binding(auto) var<storage, read> pathViewOrigins : array<vec4<f32>>;
  @group(0) @binding(auto) var<storage, read> pathRowColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathVertexColors : array<u32>;
  @group(0) @binding(auto) var<storage, read> pathRowWidths : array<f32>;
  @group(0) @binding(auto) var<storage, read> pathTimestamps : array<f32>;

struct PathStorageStyleConfig {
  constantColor : vec4<f32>,
  constantWidth : f32,
  useRowColors : u32,
  useRowWidths : u32,
  batchRowIndexBase : u32,
  pathComponentCount : u32,
  useViewOrigins : u32,
  useVertexColors : u32,
  _padding1 : u32,
};

struct TripPathConfig {
  currentTime : f32,
  trailLength : f32,
  fadeTrail : u32,
  _padding0 : u32,
};

@group(0) @binding(auto) var<uniform> pathStorageStyleConfig : PathStorageStyleConfig;
@group(0) @binding(auto) var<uniform> tripPathConfig : TripPathConfig;

struct VertexInputs {
  @builtin(vertex_index) vertexIndex : u32,
  @location(0) segmentStartPointIndices : u32,
  @location(1) segmentFlags : u32,
  @location(2) rowIndices : u32,
};

struct FragmentInputs {
  @builtin(position) position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @location(1) time : f32,
};

fn unpackPathColor(colorWord: u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  if (componentIndex >= pathStorageStyleConfig.pathComponentCount) {
    return 0.0;
  }
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

fn readPathRange(globalRowIndex: u32) -> vec4<u32> {
  return pathRanges[globalRowIndex - pathStorageStyleConfig.batchRowIndexBase];
}

fn readPathViewOrigin(rowIndex: u32) -> vec4<f32> {
  if (pathStorageStyleConfig.useViewOrigins == 0u) {
    return vec4<f32>(0.0);
  }
  return pathViewOrigins[rowIndex];
}

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  let rowIndex = inputs.rowIndices - pathStorageStyleConfig.batchRowIndexBase;
  let pathRange = readPathRange(inputs.rowIndices);
  let segmentEndPointIndex = min(inputs.segmentStartPointIndices + 1u, pathRange.y - 1u);
  let pathWidth = select(
    pathStorageStyleConfig.constantWidth,
    pathRowWidths[rowIndex],
    pathStorageStyleConfig.useRowWidths != 0u
  );
  let useSegmentEnd = (inputs.vertexIndex & 1u) == 1u;
  let pathPosition = select(
    readPathPoint(inputs.segmentStartPointIndices),
    readPathPoint(segmentEndPointIndex),
    useSegmentEnd
  ) + readPathViewOrigin(rowIndex);
  var outputs : FragmentInputs;
  outputs.position = vec4<f32>(
    pathPosition.xyz + vec3<f32>(0.0, 0.0, pathWidth * 0.0),
    1.0
  );
  outputs.color = pathStorageStyleConfig.constantColor;
  if (pathStorageStyleConfig.useVertexColors != 0u) {
    outputs.color = select(
      unpackPathColor(pathVertexColors[inputs.segmentStartPointIndices]),
      unpackPathColor(pathVertexColors[segmentEndPointIndex]),
      useSegmentEnd
    );
  } else if (pathStorageStyleConfig.useRowColors != 0u) {
    outputs.color = unpackPathColor(pathRowColors[rowIndex]);
  }
  outputs.time = select(
    pathTimestamps[inputs.segmentStartPointIndices],
    pathTimestamps[segmentEndPointIndex],
    useSegmentEnd
  );
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  if (
    inputs.time > tripPathConfig.currentTime ||
    (tripPathConfig.fadeTrail != 0u &&
      inputs.time < tripPathConfig.currentTime - tripPathConfig.trailLength)
  ) {
    discard;
  }
  var color = inputs.color;
  if (tripPathConfig.fadeTrail != 0u) {
    color.a *= 1.0 - (tripPathConfig.currentTime - inputs.time) / tripPathConfig.trailLength;
  }
  return color;
}
`;class ce extends it{static gpuInputSchema=Ta;tripProps;tripConfigBuffer;constructor(e,n){va(n)&&ae("PathTripsStorageModel",ce.gpuInputSchema,{paths:n.paths,colors:n.colors,widths:n.widths,timestamps:n.timestamps,viewOrigins:n.viewOrigins});const o=Aa(e,n);super(e,{...n,source:n.source??ba,bindings:{...n.bindings||{},tripPathConfig:o}}),this.tripProps=n,this.tripConfigBuffer=o}setProps(e){const n={...this.tripProps,...e};(e.currentTime!==void 0||e.trailLength!==void 0||e.fadeTrail!==void 0)&&this.tripConfigBuffer.write(vn(n)),this.tripProps=n,super.setProps({...e,bindings:{...e.bindings||this.tripProps.bindings||{},tripPathConfig:this.tripConfigBuffer}})}destroy(){this.tripConfigBuffer.destroy(),super.destroy()}}function va(t){return"paths"in t}function Aa(t,e){return new D(t,{id:`${e.id||"path-trips-storage-model"}-trip-config`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:vn(e)})}function vn(t){const e=new ArrayBuffer(16),n=new Float32Array(e),o=new Uint32Array(e);return n[0]=t.currentTime,n[1]=t.trailLength,o[2]=t.fadeTrail===!1?0:1,o}function Oa(t,e={}){const n=t.name||"PathModel",o=e.selectors||{},a=Ia(e.data),r=new Set(a?eo(a):[]),s=_a(t.gpuInputSchema);Ra(n,s,o);const i={};for(const c of s){if(!Ba(c.columnName))throw new Error(`${n} source mapping does not support GPU input "${c.columnName}"`);const u=La(n,c,o[c.columnName],a,r);u&&Ma(i,c.columnName,u)}if(!i.paths)throw new Error(`${n} source mapping requires paths`);return i}function Ia(t){if(t)return t instanceof k?t:new k([t])}function _a(t){return t.filter(e=>!e.internal)}function Ra(t,e,n){const o=new Set(e.map(a=>a.columnName));for(const[a,r]of Object.entries(n))if(r!==void 0&&!o.has(a))throw new Error(`${t} source selector "${a}" is not declared as source-mappable`)}function La(t,e,n,o,a){if(n===null){if(e.required)throw new Error(`${t} source selector "${e.columnName}" cannot be null`);return}if(n instanceof M)return n;const r=n??e.columnName;if(!o){if(n===void 0&&!e.required)return;throw new Error(`${t} source selector "${e.columnName}" requires data to resolve column "${r}"`)}if(!a.has(r)){if(n===void 0&&!e.required)return;throw new Error(`${t} source column "${r}" for "${e.columnName}" is missing`)}return no(o,r)}function Ba(t){return t==="paths"||t==="colors"||t==="widths"||t==="timestamps"}function Ma(t,e,n){t[e]=n}const Va=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathRanges : array<vec2<u32>>;
@group(0) @binding(2) var<storage, read> closedFlags : array<u32>;

struct PathClosureConfig {
  epsilon : f32,
  rowCount : u32,
  componentCount : u32,
  _padding0 : u32,
};

@group(0) @binding(3) var<uniform> pathClosureConfig : PathClosureConfig;
@group(0) @binding(4) var<storage, read_write> needsInjection : array<u32>;

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  return pathValues[pointIndex * pathClosureConfig.componentCount + componentIndex];
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= pathClosureConfig.rowCount) {
    return;
  }

  needsInjection[rowIndex] = 0u;
  if (closedFlags[rowIndex] == 0u) {
    return;
  }

  let pathRange = pathRanges[rowIndex];
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let pointCount = select(0u, pathEnd - pathStart, pathEnd >= pathStart);
  if (pointCount <= 1u) {
    return;
  }

  let lastPointIndex = pathStart + pointCount - 1u;
  var componentIndex = 0u;
  loop {
    if (componentIndex >= pathClosureConfig.componentCount) {
      break;
    }
    let firstComponent = readPathComponent(pathStart, componentIndex);
    let lastComponent = readPathComponent(lastPointIndex, componentIndex);
    if (!(abs(firstComponent - lastComponent) <= pathClosureConfig.epsilon)) {
      needsInjection[rowIndex] = 1u;
      return;
    }
    componentIndex += 1u;
  }
}
`,Da={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"closedFlags",type:"read-only-storage",group:0,location:2},{name:"pathClosureConfig",type:"uniform",group:0,location:3},{name:"needsInjection",type:"storage",group:0,location:4}],attributes:[]},Na=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathScatterRanges : array<vec4<u32>>;

struct PathScatterConfig {
  rowCount : u32,
  componentCount : u32,
  _padding0 : u32,
  _padding1 : u32,
};

@group(0) @binding(2) var<uniform> pathScatterConfig : PathScatterConfig;
@group(0) @binding(3) var<storage, read_write> outputPathValues : array<f32>;

fn readPathComponent(pointIndex: u32, componentIndex: u32) -> f32 {
  return pathValues[pointIndex * pathScatterConfig.componentCount + componentIndex];
}

fn writePathComponent(pointIndex: u32, componentIndex: u32, value: f32) {
  outputPathValues[pointIndex * pathScatterConfig.componentCount + componentIndex] = value;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId: vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  if (rowIndex >= pathScatterConfig.rowCount) {
    return;
  }

  let pathRange = pathScatterRanges[rowIndex];
  let pathStart = pathRange.x;
  let pathEnd = pathRange.y;
  let outputStart = pathRange.z;
  let needsInjection = pathRange.w != 0u;
  let pointCount = select(0u, pathEnd - pathStart, pathEnd >= pathStart);

  var pointOffset = 0u;
  loop {
    if (pointOffset >= pointCount) {
      break;
    }
    var componentIndex = 0u;
    loop {
      if (componentIndex >= pathScatterConfig.componentCount) {
        break;
      }
      writePathComponent(
        outputStart + pointOffset,
        componentIndex,
        readPathComponent(pathStart + pointOffset, componentIndex)
      );
      componentIndex += 1u;
    }
    pointOffset += 1u;
  }

  if (needsInjection && pointCount > 0u) {
    var componentIndex = 0u;
    loop {
      if (componentIndex >= pathScatterConfig.componentCount) {
        break;
      }
      writePathComponent(
        outputStart + pointCount,
        componentIndex,
        readPathComponent(pathStart, componentIndex)
      );
      componentIndex += 1u;
    }
  }
}
`,Fa={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathScatterRanges",type:"read-only-storage",group:0,location:1},{name:"pathScatterConfig",type:"uniform",group:0,location:2},{name:"outputPathValues",type:"storage",group:0,location:3}],attributes:[]};async function An(t,e){const n=Ua(e),o=It(e.paths),a=$a(e.paths,e.closed);if(t.type!=="webgpu")return tr(t,e,a,n);const r=await Promise.all(a.map((s,i)=>Ya(t,e,s,i,n)));return new F({type:"data",name:e.paths.name,dataType:o,format:e.paths.format,data:r,stride:e.paths.stride,byteStride:e.paths.byteStride,rowByteLength:e.paths.rowByteLength,ownsData:!0})}function Ua(t){if(Ga(It(t.paths)),!(t.closed.type instanceof re))throw new Error("closeArrowPaths closed flags must be Vector<Bool>");if(t.closed.length!==t.paths.length)throw new Error(`closeArrowPaths closed flag rows must match path rows (${t.closed.length} !== ${t.paths.length})`);if(t.closed.data.some(e=>e.nullCount>0))throw new Error("closeArrowPaths closed flags cannot contain null rows");if(!Number.isFinite(t.epsilon)||t.epsilon<0)throw new Error("closeArrowPaths epsilon must be a finite non-negative number");return Math.fround(t.epsilon)}function Ga(t){if(!At(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<1||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof x))throw new Error("closeArrowPaths paths must be GPUVector<List<FixedSizeList<Float32>[1..4]>>")}function $a(t,e){const n=Wa(e),o=[];let a=0;for(const r of t.data){if(!r.valueOffsets||r.valueByteLength===void 0)throw new Error("closeArrowPaths paths require copied variable-length Arrow offset metadata");ka(r.valueOffsets,r.length),o.push({pathData:r,valueOffsets:r.valueOffsets,valueByteLength:r.valueByteLength,closedFlags:n.subarray(a,a+r.length),rowIndexBase:a}),a+=r.length}return o}function Wa(t){const e=new Uint32Array(t.length);for(let n=0;n<t.length;n++)e[n]=t.get(n)?1:0;return e}function ka(t,e){if(t.length!==e+1)throw new Error("closeArrowPaths path offsets must contain one trailing entry per path chunk");let n=t[0]??0;if(n!==0)throw new Error("closeArrowPaths path offsets must be normalized to start at zero");for(let o=1;o<t.length;o++){const a=t[o]??n;if(a<n)throw new Error("closeArrowPaths path offsets must be monotonically non-decreasing");n=a}}async function Ya(t,e,n,o,a){const r=It(e.paths),s=_n(r),i=za(t,e,n,o,s,a);let c;try{Ha(t,e,n,i),c=await qa(i.needsInjectionBuffer,n.pathData.length)}finally{i.pathRangesBuffer.destroy(),i.closedFlagsBuffer.destroy(),i.pathClosureConfigBuffer.destroy(),i.needsInjectionBuffer.destroy()}const u=In(n.valueOffsets,c,n.pathData.length),l=Xa(t,e,n,o,s,u,c);try{Ka(t,e,n,l)}finally{l.pathScatterRangesBuffer.destroy(),l.pathScatterConfigBuffer.destroy()}const h=(u[u.length-1]??0)*s*Float32Array.BYTES_PER_ELEMENT;return new Je({buffer:l.outputPathValuesBuffer,dataType:r,format:n.pathData.format,length:n.pathData.length,stride:n.pathData.stride,byteStride:n.pathData.byteStride,rowByteLength:n.pathData.rowByteLength,ownsBuffer:!0,readbackMetadata:Qa(u,h),valueOffsets:u,valueByteLength:h})}function za(t,e,n,o,a,r){const s=n.pathData.length,i=new Uint32Array(Math.max(s,1)*2);for(let l=0;l<s;l++){const h=l*2,f=n.valueOffsets[l]??0,d=n.valueOffsets[l+1]??f;i[h]=f,i[h+1]=Math.max(f,d)}const c=Za(r,s,a),u=e.id||"closed-arrow-paths";return{pathRangesBuffer:t.createBuffer({id:`${u}-ranges-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:i}),closedFlagsBuffer:t.createBuffer({id:`${u}-closed-flags-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:Ja(n.closedFlags)}),pathClosureConfigBuffer:new D(t,{id:`${u}-closure-config-${o}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:c}),needsInjectionBuffer:t.createBuffer({id:`${u}-needs-injection-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(Math.max(s,1))})}}function Ha(t,e,n,o){const a=new vt(t,{id:`${e.id||"closed-arrow-paths"}-classify`,source:Va,shaderLayout:Da,bindings:{pathValues:On(n),pathRanges:o.pathRangesBuffer,closedFlags:o.closedFlagsBuffer,pathClosureConfig:o.pathClosureConfigBuffer.buffer,needsInjection:o.needsInjectionBuffer}});if(n.pathData.length>0){const r=t.beginComputePass({});a.dispatch(r,Math.ceil(n.pathData.length/64)),r.end(),t.submit()}a.destroy()}async function qa(t,e){if(e===0)return new Uint32Array(0);const n=await t.readAsync(0,e*Uint32Array.BYTES_PER_ELEMENT);return new Uint32Array(n.buffer,n.byteOffset,e).slice()}function Xa(t,e,n,o,a,r,s){const i=n.pathData.length,c=new Uint32Array(Math.max(i,1)*4);for(let d=0;d<i;d++){const g=d*4,m=n.valueOffsets[d]??0,p=n.valueOffsets[d+1]??m;c[g]=m,c[g+1]=Math.max(m,p),c[g+2]=r[d]??0,c[g+3]=s[d]??0}const h=(r[r.length-1]??0)*a*Float32Array.BYTES_PER_ELEMENT,f=e.id||"closed-arrow-paths";return{pathScatterRangesBuffer:t.createBuffer({id:`${f}-scatter-ranges-${o}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:c}),pathScatterConfigBuffer:new D(t,{id:`${f}-scatter-config-${o}`,usage:w.UNIFORM|w.COPY_DST|w.COPY_SRC,data:new Uint32Array([i,a,0,0])}),outputPathValuesBuffer:new D(t,{id:`${f}-closed-values-${o}`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,byteLength:Math.max(h,Float32Array.BYTES_PER_ELEMENT)})}}function Ka(t,e,n,o){const a=new vt(t,{id:`${e.id||"closed-arrow-paths"}-scatter`,source:Na,shaderLayout:Fa,bindings:{pathValues:On(n),pathScatterRanges:o.pathScatterRangesBuffer,pathScatterConfig:o.pathScatterConfigBuffer.buffer,outputPathValues:o.outputPathValuesBuffer.buffer}});if(n.pathData.length>0){const r=t.beginComputePass({});a.dispatch(r,Math.ceil(n.pathData.length/64)),r.end(),t.submit()}a.destroy()}function On(t){return{buffer:ja(t.pathData),offset:t.pathData.byteOffset,...t.valueByteLength>0?{size:t.valueByteLength}:{}}}function ja(t){return t.buffer instanceof D?t.buffer.buffer:t.buffer}function Za(t,e,n){const o=new ArrayBuffer(16),a=new Float32Array(o),r=new Uint32Array(o);return a[0]=t,r[1]=e,r[2]=n,r}function Ja(t){return t.length>0?t:new Uint32Array(1)}function In(t,e,n){const o=new Int32Array(n+1);for(let a=0;a<n;a++){const r=t[a]??0,s=t[a+1]??r,i=Math.max(0,s-r);o[a+1]=o[a]+i+(e[a]?1:0)}return o}function Qa(t,e){return{kind:"variable-length-attribute",valueOffsets:t,nullCount:0,valueByteLength:e}}async function tr(t,e,n,o){const a=await tn(e.paths),r=_n(It(e.paths)),s=a.data.map((u,l)=>er(u,n[l],r,o)),i=new M(s);return e.paths.format?V(t,i,{name:e.paths.name,format:e.paths.format,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}}):V(t,i,{name:e.paths.name,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}})}function er(t,e,n,o){if(!e)throw new Error("closeArrowPaths CPU fallback requires path chunk metadata");const a=st(t),r=nr(a,e.valueOffsets,e.closedFlags,n,o,t.length),s=In(e.valueOffsets,r,t.length),i=or(a,e.valueOffsets,s,r,n,t.length);return ar(t.type,s,i)}function nr(t,e,n,o,a,r){const s=new Uint32Array(r);for(let i=0;i<r;i++){if(!n[i])continue;const c=e[i]??0,u=e[i+1]??c,l=Math.max(0,u-c);if(l<=1)continue;const h=c+l-1;for(let f=0;f<o;f++){const d=t[c*o+f]??0,g=t[h*o+f]??0;if(!(Math.abs(d-g)<=a)){s[i]=1;break}}}return s}function or(t,e,n,o,a,r){const s=n[n.length-1]??0,i=new Float32Array(s*a);for(let c=0;c<r;c++){const u=e[c]??0,l=e[c+1]??u,h=n[c]??0,f=Math.max(0,l-u),d=u*a,g=l*a;if(i.set(t.subarray(d,g),h*a),o[c]&&f>0){const m=t.subarray(d,d+a);i.set(m,(h+f)*a)}}return i}function ar(t,e,n){const o=t.children[0].type,a=new _(new x,0,n.length,0,{[B.DATA]:n}),r=new _(o,0,o.listSize===0?0:n.length/o.listSize,0,{},[a]);return new _(t,0,e.length-1,0,{[B.OFFSET]:e},[r])}function _n(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("closeArrowPaths paths require FixedSizeList coordinate elements");return e.listSize}function It(t){return oo(t)}function Rn(t,e){if(!e)return $(new x,4,t);const n=[];let o=0;for(const a of e){const r=o+a;n.push($(new x,4,t.slice(o*4,r*4)).data[0]),o=r}if(o*4!==t.length)throw new Error("Arrow path view-origin chunk rows must cover every source row");return new M(n)}function Ct(t,e){let n=0;for(const o of t.data){const a=n+o.length;o.buffer.write(e.subarray(n*4,a*4),o.byteOffset),n=a}if(n*4!==e.length)throw new Error("Arrow path view-origin GPU chunks must cover every source row")}function xt(t,e,n){if(n.length<16)throw new Error("convertArrowPathToGPUVectors updateViewOrigins requires a 4x4 modelViewMatrix");for(let o=0;o<e.length/4;o++){const a=o*4,r=e[a]??0,s=e[a+1]??0,i=e[a+2]??0;t[a]=(n[0]??0)*r+(n[4]??0)*s+(n[8]??0)*i+(n[12]??0),t[a+1]=(n[1]??0)*r+(n[5]??0)*s+(n[9]??0)*i+(n[13]??0),t[a+2]=(n[2]??0)*r+(n[6]??0)*s+(n[10]??0)*i+(n[14]??0),t[a+3]=e[a+3]??0}}const Q="segmentStartPositions",tt="segmentEndPositions",pt="segmentPreviousPositions",mt="segmentNextPositions",le="segmentStartColors",ue="segmentEndColors",wt="segmentFlags",Pt="rowIndices",he="pathViewOrigins",rr=1,sr=2,ir=4,Z=Float32Array.BYTES_PER_ELEMENT*16+Uint32Array.BYTES_PER_ELEMENT*4,cr=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),lr={attributes:[{name:Q,location:0,type:"vec4<f32>",stepMode:"instance"},{name:tt,location:1,type:"vec4<f32>",stepMode:"instance"},{name:le,location:2,type:"u32",stepMode:"instance"},{name:ue,location:3,type:"u32",stepMode:"instance"},{name:he,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]};function ur(t){if(t.rowTable.schema.fields.length>0&&t.rowTable.numRows!==t.paths.length)throw new Error("PathAttributeModel requires rowTable rows to match path rows");N(t.rowTable,Q),N(t.rowTable,tt),N(t.rowTable,pt),N(t.rowTable,mt),N(t.rowTable,le),N(t.rowTable,ue),N(t.rowTable,wt),N(t.rowTable,Pt),N(t.rowTable,he);const e=Ve(),n=wr(t.rowTable),o=Pr(t.paths,t.viewOrigins,n),a=jt(o.startIndices,t.rowIndexBase),r=jt(o.startIndices),s=[],i={};for(const l of t.rowTable.schema.fields){const h=t.rowTable.getChild(l.name);!h||!nn(h.type)||(s.push(l),i[l.name]=ro(h,r))}s.push(gt(Q,4)),s.push(gt(tt,4)),s.push(gt(pt,4)),s.push(gt(mt,4)),s.push(new O(wt,new ut,!1)),s.push(new O(Pt,new ut,!1)),i[Q]=$(new x,4,o.segmentStartPositions),i[tt]=$(new x,4,o.segmentEndPositions),i[pt]=$(new x,4,o.segmentPreviousPositions),i[mt]=$(new x,4,o.segmentNextPositions),i[wt]=Me(new ut,o.segmentFlags),i[Pt]=Me(new ut,a);const c=Ve()-e,u=Fr(i);return{table:new k(new en(s,t.rowTable.schema.metadata),i),segmentLayout:o,segmentAttributeBuildTimeMs:c,attributeByteLength:u}}function hr(t,e){const n=ur({rowTable:e.rowTable,paths:e.paths,viewOrigins:e.viewOrigins,rowIndexBase:e.rowIndexBase}),o=cn({device:t,recordOffsets:n.segmentLayout.startIndices,recordByteStride:Z,resourceLabel:"PathAttributeModel expanded path vertex data"}),a=o.map(l=>Dr(t,{id:e.id},{segmentTable:n,generatedBufferBatch:l})),r=o.map(l=>Nr(t,{id:e.id},n,l)),s=a[0],i=r[0];if(!s||!i)throw new Error("PathAttributeModel requires at least one generated path render batch");const c=o.map((l,h)=>({rowStart:l.rowStart,rowEnd:l.rowEnd,segmentCount:l.recordCount,expandedPathVertexData:a[h].buffer,pathViewOriginData:r[h].buffer}));let u=!1;return{segmentTable:n,segmentLayout:n.segmentLayout,expandedPathVertexData:s.buffer,pathViewOriginData:i.buffer,renderBatches:c,generatedBufferBatches:o,destroy:()=>{u||(u=!0,Ur(c))}}}function Be(t,e){if(!e.pathState)throw new Error("makePathAttributeModelProps requires pathState prepared by convertArrowPathToGPUVectors()");const{allowWebGLOnlyFormats:n,...o}=e,a=e.shaderLayout??lr;return{...o,shaderLayout:a,ownsTable:!0,table:ao(t,Vr(e.pathState.segmentTable.table,e.pathState.generatedBufferBatches),{shaderLayout:a,allowWebGLOnlyFormats:n})}}async function dr(t,e,n={}){fr(e),gr(e);const o=n.id||"arrow-path-model",a=Tr(e.paths),r=a.sourceOrigins,s=a.paths.data.map(S=>S.length),i=yr(a.paths.type);let c=V(t,a.paths,{name:"paths",id:`${o}-paths`,format:i}),u=a.paths;if(e.closed){const S=await An(t,{paths:c,closed:e.closed,epsilon:n.closeEpsilon??0,id:`${o}-closed`});c.destroy(),c=S,u=await tn(c)}const l=e.colors?V(t,e.colors,{name:"colors",id:`${o}-colors`,format:Sr(e.colors.type),preserveDataChunks:!0}):void 0,h=e.widths?V(t,e.widths,{name:"widths",id:`${o}-widths`,format:"float32",preserveDataChunks:!0}):void 0,f=new Float32Array(e.paths.length*4),d=r?Rn(f,s):void 0,g=r?V(t,d,{name:he,id:`${o}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;r&&(xt(f,r,cr),Ct(g,f));const m={};e.colors&&(m.colors=e.colors),e.widths&&(m.widths=e.widths);const p=hr(t,{id:o,rowTable:new k(m),paths:u,viewOrigins:d,rowIndexBase:n.rowIndexBase});let y=!1;return{id:o,paths:c,...l?{colors:l}:{},...h?{widths:h}:{},...g?{viewOrigins:g}:{},pathState:p,...r?{sourceOrigins:r}:{},updateViewOrigins:({modelViewMatrix:S})=>{!r||!g||(xt(f,r,S),Ct(g,f),Ar(p,f))},destroy:()=>{y||(y=!0,p.destroy(),c.destroy(),l?.destroy(),h?.destroy(),g?.destroy())}}}function fr(t){if(mr(t.paths.type,"paths"),t.colors&&!de(t.colors.type))throw new Error("convertArrowPathToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof x))throw new Error("convertArrowPathToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof re))throw new Error("convertArrowPathToGPUVectors closed flags must be Vector<Bool>")}function gr(t){const e=[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]];for(const[n,o]of e)if(o&&o.length!==t.paths.length)throw new Error(`convertArrowPathToGPUVectors ${n} rows must match paths rows (${o.length} !== ${t.paths.length})`);t.colors&&ct(t.colors.type)&&Mn(t.paths,t.colors)}function pr(t,e){if(!At(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof x))throw new Error(`PathAttributeModel ${e} must be GPUVector<List<FixedSizeList<Float32>[2..4]>>`)}function mr(t,e){const n=Ln(t);if(!At(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(n instanceof x)&&!(n instanceof U))throw new Error(`convertArrowPathToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}function Ln(t){const e=t.children[0]?.type;return A.isFixedSizeList(e)?e.children[0]?.type:void 0}function wr(t){const e=t.getChild("colors");if(e)return de(e.type)?e:void 0}function Pr(t,e,n){pr(t.type,"paths"),e&&xr(e,t.length),n&&Er(n,t);const o=fe(t.type),a=[0];for(const E of t.data){const S=E.valueOffsets;if(!S)throw new Error("PathAttributeModel source path chunks require Arrow list offsets");for(let T=0;T<E.length;T++){const b=S[T]??0,P=S[T+1]??b,C=Math.max(0,P-b-1);a.push((a[a.length-1]??0)+C)}}const r=a[a.length-1]??0,s=new Float32Array(r*4),i=new Float32Array(r*4),c=new Float32Array(r*4),u=new Float32Array(r*4),l=new Float32Array(r*4),h=new Uint32Array(r),f=new Uint32Array(r),d=new Uint32Array(r);f.fill(4294967295),d.fill(4294967295);const g=Ir(e),m=_r(n);let p=0,y=0;for(const E of t.data){const S=E.valueOffsets;if(!S)throw new Error("PathAttributeModel source path chunks require Arrow list offsets");const T=st(E),b=S[0]??0;for(let P=0;P<E.length;P++){const C=(S[P]??b)-b,v=(S[P+1]??C)-b,z=Math.max(0,v-C),I=Math.max(0,z-1),R=Or(T,o,C,z);Rr(l,a[y]??p,I,g,y),Br(f,d,a[y]??p,I,m,y);for(let L=0;L<I;L++){const lt=C+L,_t=lt+1,kn=L===0?R?v-2:lt:lt-1,Yn=L===I-1?R?C+1:_t:_t+1;ft(s,p,T,lt,o),ft(i,p,T,_t,o),ft(c,p,T,kn,o),ft(u,p,T,Yn,o);let Rt=R?ir:0;L===0&&(Rt|=rr),L===I-1&&(Rt|=sr),h[p]=Rt,p++}y++}}return{startIndices:a,segmentCount:r,segmentStartPositions:s,segmentEndPositions:i,segmentPreviousPositions:c,segmentNextPositions:u,segmentViewOrigins:l,segmentFlags:h,segmentStartColors:f,segmentEndColors:d}}function Bn(t){return A.isFixedSizeList(t)&&t.listSize===4&&t.children[0]?.type instanceof nt}function ct(t){return A.isList(t)&&Bn(t.children[0]?.type)}function de(t){return Bn(t)||ct(t)}function yr(t){switch(fe(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("PathAttributeModel paths require 2, 3, or 4 coordinate components")}}function Sr(t){return ct(t)?"vertex-list<unorm8x4>":"unorm8x4"}function Er(t,e){if(!de(t.type))throw new Error("PathAttributeModel colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.length!==e.length)throw new Error(`PathAttributeModel color rows must match path rows (${t.length} !== ${e.length})`);ct(t.type)&&Mn(e,t)}function Mn(t,e){if(t.data.length!==e.data.length)throw new Error("PathAttributeModel vertex color batch count must match path batch count");for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,a=e.data[n]?.valueOffsets;if(!o||!a||!Cr(o,a))throw new Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function Cr(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function xr(t,e){if(!A.isFixedSizeList(t.type)||t.type.listSize!==4||!(t.type.children[0]?.type instanceof x))throw new Error("PathAttributeModel view origins must be Vector<FixedSizeList<Float32>[4]>");if(t.length!==e)throw new Error(`PathAttributeModel view origin rows must match path rows (${t.length} !== ${e})`)}function fe(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("PathAttributeModel paths require FixedSizeList coordinate elements");return e.listSize}function Tr(t){const e=Ln(t.type);if(e instanceof x)return{paths:t};if(!(e instanceof U))throw new Error("convertArrowPathToGPUVectors paths must contain Float32 or Float64 coordinates");const n=fe(t.type),o=br(n),a=new Float64Array(t.length*4),r=[];let s=0;for(const i of t.data){const c=i.valueOffsets;if(!c)throw new Error("convertArrowPathToGPUVectors Float64 paths require Arrow list offsets");const u=st(i),l=c[0]??0,h=new Int32Array(c.length),f=new Float32Array(u.length);for(let d=0;d<c.length;d++)h[d]=(c[d]??l)-l;for(let d=0;d<i.length;d++){const g=s+d,m=(c[d]??l)-l,p=(c[d+1]??l)-l,y=Math.max(0,p-m);let E=0,S=0,T=0,b=0;if(y>0){const C=m*n;E=u[C]??0,S=u[C+1]??0,n>2&&(T=u[C+2]??0),n>3&&(b=u[C+3]??0)}const P=g*4;a[P]=E,a[P+1]=S,a[P+2]=T,a[P+3]=b;for(let C=m;C<p;C++){const v=C*n;f[v]=(u[v]??0)-E,f[v+1]=(u[v+1]??0)-S,n>2&&(f[v+2]=(u[v+2]??0)-T),n>3&&(f[v+3]=(u[v+3]??0)-b)}}r.push(vr(o,h,f)),s+=i.length}return{paths:new M(r),sourceOrigins:a}}function br(t){const e=new q(t,new O("values",new x,!1));return new X(new O("coordinates",e,!1))}function vr(t,e,n){const o=t.children[0].type,a=new _(new x,0,n.length,0,{[B.DATA]:n}),r=new _(o,0,o.listSize===0?0:n.length/o.listSize,0,{},[a]);return new _(t,0,e.length-1,0,{[B.OFFSET]:e},[r])}function Ar(t,e){const{segmentLayout:n}=t.segmentTable;for(let o=0;o<n.startIndices.length-1;o++){const a=n.startIndices[o]??0,r=n.startIndices[o+1]??a,s=o*4;for(let i=a;i<r;i++)n.segmentViewOrigins.set(e.subarray(s,s+4),i*4)}for(const[o,a]of t.generatedBufferBatches.entries()){const r=t.renderBatches[o];if(!r)continue;const s=new Float32Array(Math.max(a.recordCount*4,4));s.set(n.segmentViewOrigins.subarray(a.recordStart*4,a.recordEnd*4)),r.pathViewOriginData.write(s)}}function Or(t,e,n,o){if(o<3)return!1;const a=n*e,r=(n+o-1)*e;for(let s=0;s<e;s++)if(t[a+s]!==t[r+s])return!1;return!0}function Ir(t){if(!t)return;const e=[];let n=0;for(const o of t.data){const a=n+o.length;e.push({rowStart:n,rowEnd:a,values:on(o)}),n=a}return{chunks:e,currentChunkIndex:0}}function _r(t){if(!t)return;const e=[];let n=0;for(const o of t.data){const a=n+o.length;if(ct(o.type)){const r=o.valueOffsets;if(!r)throw new Error("PathAttributeModel vertex colors require Arrow list offsets");e.push({kind:"vertex",rowStart:n,rowEnd:a,valueOffsets:r,values:st(o)})}else e.push({kind:"row",rowStart:n,rowEnd:a,values:on(o)});n=a}return{chunks:e,currentChunkIndex:0}}function Rr(t,e,n,o,a){if(!o||n===0)return;const r=Lr(o,a),s=(a-r.rowStart)*4,i=r.values,c=i[s]??0,u=i[s+1]??0,l=i[s+2]??0,h=i[s+3]??0;for(let f=0;f<n;f++){const d=(e+f)*4;t[d]=c,t[d+1]=u,t[d+2]=l,t[d+3]=h}}function Lr(t,e){let n=t.chunks[t.currentChunkIndex];for(;n&&e>=n.rowEnd;)t.currentChunkIndex++,n=t.chunks[t.currentChunkIndex];if(n&&e>=n.rowStart&&e<n.rowEnd)return n;throw new Error(`PathAttributeModel view origin row ${e} is missing`)}function Br(t,e,n,o,a,r){if(!a||o===0)return;const s=Mr(a,r),i=r-s.rowStart;if(s.kind==="row"){const h=i*4,f=Vt(s.values,h);t.fill(f,n,n+o),e.fill(f,n,n+o);return}const c=s.valueOffsets[0]??0,u=(s.valueOffsets[i]??c)-c;if((s.valueOffsets[i+1]??u)-c-u<o+1)throw new Error("PathAttributeModel vertex colors must provide one color per path vertex");for(let h=0;h<o;h++){const f=n+h;t[f]=Vt(s.values,(u+h)*4),e[f]=Vt(s.values,(u+h+1)*4)}}function Mr(t,e){let n=t.chunks[t.currentChunkIndex];for(;n&&e>=n.rowEnd;)t.currentChunkIndex++,n=t.chunks[t.currentChunkIndex];if(n&&e>=n.rowStart&&e<n.rowEnd)return n;throw new Error(`PathAttributeModel color row ${e} is missing`)}function Vt(t,e){return((t[e]??255)|(t[e+1]??255)<<8|(t[e+2]??255)<<16|(t[e+3]??255)<<24)>>>0}function ft(t,e,n,o,a){const r=e*4,s=o*a;for(let i=0;i<a;i++)t[r+i]=n[s+i]??0}function Vr(t,e){const n=new Set([Q,tt,pt,mt,le,ue,wt,Pt]),o=[],a={};for(const i of t.schema.fields){if(n.has(i.name))continue;const c=t.getChild(i.name);c&&(o.push(i),a[i.name]=c)}const r=new k(new en(o,new Map(t.schema.metadata)),a);if(!e||e.length<=1||o.length===0)return r;const s=e.flatMap(i=>r.slice(i.recordStart,i.recordEnd).batches);return new k(r.schema,s)}function Dr(t,e,{segmentTable:n,generatedBufferBatch:o}){const{segmentLayout:a}=n,r=o.byteLength,s=new ArrayBuffer(Math.max(r,Z)),i=new Float32Array(s),c=new Uint32Array(s),u=jt(a.startIndices);for(let l=o.recordStart;l<o.recordEnd;l++){const h=l-o.recordStart,f=h*Z/Float32Array.BYTES_PER_ELEMENT,d=h*Z/Uint32Array.BYTES_PER_ELEMENT,g=l*4;i.set(a.segmentStartPositions.subarray(g,g+4),f),i.set(a.segmentEndPositions.subarray(g,g+4),f+4),i.set(a.segmentPreviousPositions.subarray(g,g+4),f+8),i.set(a.segmentNextPositions.subarray(g,g+4),f+12),c[d+16]=a.segmentFlags[l],c[d+17]=u[l],c[d+18]=a.segmentStartColors[l],c[d+19]=a.segmentEndColors[l]}return{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-expanded-path-vertex-data-${o.rowStart}`,usage:w.VERTEX|w.COPY_DST|w.COPY_SRC,data:new Uint8Array(s,0,Math.max(r,Z))}),byteLength:r}}function Nr(t,e,n,o){const a=Float32Array.BYTES_PER_ELEMENT*4,r=o.recordCount*a,s=new Float32Array(Math.max(o.recordCount*4,4)),i=o.recordStart*4,c=o.recordEnd*4;return s.set(n.segmentLayout.segmentViewOrigins.subarray(i,c)),{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-path-view-origin-data-${o.rowStart}`,usage:w.VERTEX|w.COPY_DST|w.COPY_SRC,data:s}),byteLength:r}}function jt(t,e=0){const n=t[t.length-1]??0,o=new Uint32Array(n);for(let a=0;a<t.length-1;a++)o.fill(e+a,t[a],t[a+1]);return o}function N(t,e){if(t.getChild(e))throw new Error(`PathAttributeModel rowTable column "${e}" is reserved`)}function gt(t,e){return new O(t,new q(e,new O("value",new x,!1)),!1)}function Me(t,e){return so(Ot({type:t,length:e.length,data:e}))}function Fr(t){let e=0;for(const n of Object.values(t))nn(n.type)&&(e+=io(n).byteLength);return e}function Ur(t){const e=new Set(t.flatMap(n=>[n.expandedPathVertexData,n.pathViewOriginData]));for(const n of e)n.destroy()}function Ve(){return typeof performance>"u"?Date.now():performance.now()}const Gr=`
@group(0) @binding(0) var<storage, read> sourcePathValues : array<vec2<u32>>;
@group(0) @binding(1) var<storage, read> sourcePathValueOffsets : array<u32>;
@group(0) @binding(2) var<storage, read> pathDeltaConfig : array<u32>;
@group(0) @binding(3) var<storage, read_write> pathDeltaValues : array<f32>;

fn readSourcePathValueBits(scalarIndex : u32) -> vec2<u32> {
  // Float64Array uploads preserve host word order. Browser and Node WebGPU
  // runtimes are little-endian, while fp64u32 helpers consume canonical hi/lo.
  return sourcePathValues[scalarIndex].yx;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId : vec3<u32>) {
  let rowIndex = globalInvocationId.x;
  let rowCount = pathDeltaConfig[0];
  if (rowIndex >= rowCount) {
    return;
  }

  let componentCount = pathDeltaConfig[1];
  let pathStart = sourcePathValueOffsets[rowIndex];
  let pathEnd = sourcePathValueOffsets[rowIndex + 1u];
  if (pathEnd <= pathStart) {
    return;
  }

  var pointIndex = pathStart;
  loop {
    if (pointIndex >= pathEnd) {
      break;
    }
    var componentIndex = 0u;
    loop {
      if (componentIndex >= componentCount) {
        break;
      }
      let scalarIndex = pointIndex * componentCount + componentIndex;
      let originScalarIndex = pathStart * componentCount + componentIndex;
      pathDeltaValues[scalarIndex] = sub_fp64u32_to_f32(
        readSourcePathValueBits(scalarIndex),
        readSourcePathValueBits(originScalarIndex)
      );
      componentIndex += 1u;
    }
    pointIndex += 1u;
  }
}
`,$r={bindings:[{name:"sourcePathValues",type:"read-only-storage",group:0,location:0},{name:"sourcePathValueOffsets",type:"read-only-storage",group:0,location:1},{name:"pathDeltaConfig",type:"read-only-storage",group:0,location:2},{name:"pathDeltaValues",type:"storage",group:0,location:3}],attributes:[]};async function Wr(t,e,n={}){if(t.type!=="webgpu")throw new Error("convertArrowPathFloat64ToGPUVector requires a WebGPU device");const o=Yr(e.type),a=Hr(o),r=zr(o),s=[],i=new Float64Array(e.length*4),c=[];let u=0;for(const[l,h]of e.data.entries()){const f=st(h),d=qr(h);Xr(i,u,f,d,o);const g=new D(t,{id:`${n.id||"arrow-path-storage-model"}-source-path-values-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,...f.length>0?{data:f}:{byteLength:Float64Array.BYTES_PER_ELEMENT}}),m=t.createBuffer({id:`${n.id||"arrow-path-storage-model"}-source-path-value-offsets-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array(d)}),p=t.createBuffer({id:`${n.id||"arrow-path-storage-model"}-path-delta-config-${l}`,usage:w.STORAGE|w.COPY_DST|w.COPY_SRC,data:new Uint32Array([h.length,o])}),y=new D(t,{id:`${n.id||"arrow-path-storage-model"}-path-delta-values-${l}`,usage:w.VERTEX|w.STORAGE|w.COPY_DST|w.COPY_SRC,byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,f.length*Float32Array.BYTES_PER_ELEMENT)});kr(t,n,{chunkIndex:l,rowCount:h.length,sourcePathValues:g,sourcePathValueOffsets:m,pathDeltaConfig:p,pathDeltaValues:y}),s.push(new Je({buffer:y,dataType:a,format:r,length:h.length,valueLength:f.length/o,stride:o,byteStride:o*Float32Array.BYTES_PER_ELEMENT,rowByteLength:o*Float32Array.BYTES_PER_ELEMENT,ownsBuffer:!0,readbackMetadata:{kind:"variable-length-attribute",valueOffsets:d,nullCount:0,valueByteLength:f.length*Float32Array.BYTES_PER_ELEMENT}})),c.push(g,m,p),u+=h.length}await Kr(t);for(const l of c)l.destroy();return{paths:new F({type:"data",name:"paths",dataType:a,format:r,data:s,stride:o,byteStride:o*Float32Array.BYTES_PER_ELEMENT,rowByteLength:o*Float32Array.BYTES_PER_ELEMENT,ownsData:!0}),sourceOrigins:i}}function kr(t,e,n){const o=new vt(t,{id:`${e.id||"arrow-path-storage-model"}-path-delta-compute-${n.chunkIndex}`,source:Gr,modules:[qn],shaderLayout:$r,bindings:{sourcePathValues:n.sourcePathValues,sourcePathValueOffsets:n.sourcePathValueOffsets,pathDeltaConfig:n.pathDeltaConfig,pathDeltaValues:n.pathDeltaValues}});if(n.rowCount>0){const a=t.beginComputePass({});o.dispatch(a,Math.ceil(n.rowCount/64)),a.end(),t.submit()}o.destroy()}function Yr(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("Float64 path conversion requires FixedSizeList coordinate elements");return e.listSize}function zr(t){switch(t){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("convertArrowPathFloat64ToGPUVector paths require 2, 3, or 4 components")}}function Hr(t){const e=new q(t,new O("values",new x,!1));return new X(new O("coordinates",e,!1))}function qr(t){const e=t.valueOffsets;if(!e)throw new Error("Float64 path conversion requires Arrow list offsets");const n=e[0]??0;return Int32Array.from(e,o=>o-n)}function Xr(t,e,n,o,a){for(let r=0;r<o.length-1;r++){const s=o[r]??0,i=o[r+1]??s,c=Math.max(0,i-s),u=(e+r)*4;if(c===0)continue;const l=s*a;t[u]=n[l]??0,t[u+1]=n[l+1]??0,a>2&&(t[u+2]=n[l+2]??0),a>3&&(t[u+3]=n[l+3]??0)}}async function Kr(t){await t.handle?.queue?.onSubmittedWorkDone?.()}async function Vn(t,e,n={}){if(t.type!=="webgpu")throw new Error("convertArrowPathStorageToGPUVectors requires a WebGPU device");Jr(e),Qr(e);const o=n.id||"arrow-path-storage-model",a=await os(t,e.paths,{id:o});let r=a.paths;if(e.closed){const p=await An(t,{paths:r,closed:e.closed,epsilon:n.closeEpsilon??0,id:`${o}-closed`});r.destroy(),r=p}const s=e.colors?V(t,e.colors,{name:"colors",id:`${o}-colors`,format:Zr(e.colors.type),preserveDataChunks:!0}):void 0,i=e.widths?V(t,e.widths,{name:"widths",id:`${o}-widths`,preserveDataChunks:!0}):void 0,c=e.timestamps?await co(t,e.timestamps,{name:"timestamps",id:`${o}-timestamps`}):void 0,u=c?.temporal,l=a.sourceOrigins,h=new Float32Array(e.paths.length*4),f=l?Rn(h,a.paths.data.map(p=>p.length)):void 0,d=l?V(t,f,{name:"pathViewOrigins",id:`${o}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;l&&d&&(xt(h,l,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),Ct(d,h));let g=!1;const m=({modelViewMatrix:p})=>{!l||!d||(xt(h,l,p),Ct(d,h))};return{id:o,paths:r,...s?{colors:s}:{},...i?{widths:i}:{},...u?{timestamps:u}:{},...d?{viewOrigins:d}:{},rowIndexBase:n.rowIndexBase,...l?{sourceOrigins:l}:{},updateViewOrigins:m,destroy:()=>{g||(g=!0,r.destroy(),s?.destroy(),i?.destroy(),c?.destroy(),d?.destroy())}}}function Dn(t){return A.isFixedSizeList(t)&&t.listSize===4&&t.children[0]?.type instanceof nt}function ge(t){return A.isList(t)&&Dn(t.children[0]?.type)}function jr(t){return Dn(t)||ge(t)}function Zr(t){return ge(t)?"vertex-list<unorm8x4>":"unorm8x4"}function Jr(t){if(ts(t.paths.type,"paths"),t.colors&&!jr(t.colors.type))throw new Error("convertArrowPathStorageToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof x))throw new Error("convertArrowPathStorageToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof re))throw new Error("convertArrowPathStorageToGPUVectors closed flags must be Vector<Bool>");if(t.timestamps&&!(A.isList(t.timestamps.type)&&t.timestamps.type.children[0]?.type&&(A.isDate(t.timestamps.type.children[0].type)||A.isTime(t.timestamps.type.children[0].type)||A.isTimestamp(t.timestamps.type.children[0].type)||A.isDuration(t.timestamps.type.children[0].type))))throw new Error("convertArrowPathStorageToGPUVectors timestamps must be Vector<List<Date|Time|Timestamp|Duration>>")}function Qr(t){const e=[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]];for(const[n,o]of e)if(o&&o.length!==t.paths.length)throw new Error(`convertArrowPathStorageToGPUVectors ${n} rows must match paths rows (${o.length} !== ${t.paths.length})`);t.colors&&ge(t.colors.type)&&es(t.paths,t.colors)}function ts(t,e){const n=Nn(t);if(!At(t)||!A.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(n instanceof x)&&!(n instanceof U))throw new Error(`convertArrowPathStorageToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}function es(t,e){if(t.data.length!==e.data.length)throw new Error("convertArrowPathStorageToGPUVectors vertex color batch count must match paths");for(let n=0;n<t.data.length;n++){const o=t.data[n]?.valueOffsets,a=e.data[n]?.valueOffsets;if(!o||!a||!ns(o,a))throw new Error("convertArrowPathStorageToGPUVectors vertex colors must align with paths")}}function ns(t,e){return t.length===e.length&&t.every((n,o)=>n===e[o])}function Nn(t){const e=t.children[0]?.type;return A.isFixedSizeList(e)?e.children[0]?.type:void 0}async function os(t,e,n){const o=Nn(e.type);if(o instanceof x)return{paths:V(t,e,{name:"paths",id:`${n.id||"arrow-path-storage-model"}-paths`,format:as(e.type),preserveDataChunks:!0})};if(!(o instanceof U))throw new Error("convertArrowPathStorageToGPUVectors paths must contain Float32 or Float64");return Wr(t,e,n)}function as(t){switch(rs(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw new Error("convertArrowPathStorageToGPUVectors paths require 2, 3, or 4 components")}}function rs(t){const e=t.children[0]?.type;if(!e||!A.isFixedSizeList(e))throw new Error("convertArrowPathStorageToGPUVectors paths require FixedSizeList coordinates");return e.listSize}function ss(t,e,n={}){return dr(t,e,n)}function is(t,e,n={}){return Vn(t,e,n)}function cs(t,e,n={}){if(!e.timestamps)throw new Error("convertArrowTripsToStorage requires a timestamps column");return Vn(t,e,n)}class Dt{static async convertToGPUVectors(e,n,o={}){const{model:a="attribute",...r}=o;switch(a){case"storage":return is(e,n,r);case"trips":return cs(e,n,r);case"attribute":return ss(e,n,r)}}static makeModelProps(e,n){return Be(e,n)}static createModel(e,n){switch(n.model){case"storage":{const{model:o,...a}=n;return new it(e,a)}case"trips":{const{model:o,...a}=n;return new ce(e,a)}case"attribute":case void 0:{const{model:o,...a}=n;return new se(e,Be(e,a))}}throw new Error("ArrowPathRenderer received unsupported model")}}const ls=[199,219,245,255],us=.0035,De="constantPathColor",Ne="constantPathWidth",Fe="constantPathTemporal",hs=`#version 300 es
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
`,ds={attributes:[{name:"segmentStartPositions",location:0,type:"vec4<f32>",stepMode:"instance"},{name:"segmentEndPositions",location:1,type:"vec4<f32>",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"},{name:"segmentStartColors",location:3,type:"u32",stepMode:"instance"},{name:"segmentEndColors",location:4,type:"u32",stepMode:"instance"},{name:"widths",location:5,type:"f32",stepMode:"instance"},{name:"pathViewOrigins",location:6,type:"vec4<f32>",stepMode:"instance"},{name:"currentTime",location:7,type:"f32",stepMode:"instance"},{name:"trailLength",location:8,type:"f32",stepMode:"instance"},{name:"temporalEnabled",location:9,type:"f32",stepMode:"instance"}],bindings:[]},fs=`#version 300 es
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
`,gs=`
${an}

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
`,ps={attributes:[{name:"segmentStartPointIndices",location:0,type:"u32",stepMode:"instance"},{name:"segmentFlags",location:1,type:"u32",stepMode:"instance"},{name:"rowIndices",location:2,type:"u32",stepMode:"instance"},{name:"currentTime",location:3,type:"f32",stepMode:"instance"},{name:"trailLength",location:4,type:"f32",stepMode:"instance"},{name:"temporalEnabled",location:5,type:"f32",stepMode:"instance"},{name:"fadeTrail",location:6,type:"f32",stepMode:"instance"}],bindings:[]},ms=`
${an}

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
`,bt=class bt extends Xn{getAttributeManager(){return null}setShaderModuleProps(e){super.setShaderModuleProps(this.context.device.type==="webgpu"?{layer:e.layer,picking:e.picking}:{layer:e.layer,project:e.project,picking:e.picking})}initializeState(){this.setState({batches:[],loadVersion:0,sourceInitialized:!1,gpuVectorSourceCache:new Map})}updateState({props:e,oldProps:n,changeFlags:o}){const a=this.getLayerState(),r=!a.sourceInitialized||o.dataChanged||e.paths!==n.paths||e.model!==n.model||e.color!==n.color||e.width!==n.width,s=e.timestamps!==n.timestamps;if(r||s){a.sourceInitialized=!0,this.loadSource(e);return}if(e.currentTime!==n.currentTime||e.trailLength!==n.trailLength||e.temporalEnabled!==n.temporalEnabled||e.fadeTrail!==n.fadeTrail){for(const i of a.batches)Ss(i,e);this.setNeedsRedraw()}}getModels(){return this.state?.batches.map(e=>e.model)??[]}draw({renderPass:e,context:n}){for(const{model:o}of this.getLayerState().batches)o.device.type==="webgpu"&&uo(o,n.viewport),o.draw(e)}getPickingInfo({info:e}){const n=e,o=n.index,a=this.getLayerState().batches.find(r=>o>=r.rowIndexOffset&&o<r.rowIndexOffset+r.rowCount);return a&&(n.arrow={rowIndex:o,batchIndex:a.batchIndex,batchRowIndex:o-a.rowIndexOffset}),n}finalizeState(e){const n=this.getLayerState();n.cancelLoad?.(),n.loadVersion++,We(n.batches),this.setState({batches:[],loadVersion:n.loadVersion,sourceInitialized:!0,gpuVectorSourceCache:new Map}),super.finalizeState(e)}async loadSource(e){const n=this.getLayerState();n.cancelLoad?.();const o=n.loadVersion+1;n.loadVersion=o;const a=n.batches;this.setState({batches:[],loadVersion:o,sourceInitialized:!0}),We(a),this.setNeedsRedraw();try{e.data?await this.loadRecordBatchSource(e,e.data,o):e.paths&&typeof e.paths!="string"&&await this.appendSourceBatch(e,void 0,0,0,o)}catch(r){this.isActiveLoad(o)&&(e.onDataError?e.onDataError(r):this.raiseError(xs(r),`loading Arrow data in ${this}`))}}async loadRecordBatchSource(e,n,o){if(!this.isActiveLoad(o))return;const a=ho(n);let r;const s=()=>(r??=(async()=>{await a.return?.()})(),r);let i;const c=new Promise(d=>{i=()=>d({done:!0,value:void 0})}),u=()=>{i(),s().catch(()=>{})},l=this.getLayerState();l.cancelLoad=u;let h=0,f=0;try{for(;this.isActiveLoad(o);){const d=await Promise.race([a.next(),c]);if(d.done||!this.isActiveLoad(o))return;await this.appendSourceBatch(e,d.value,h,f,o),f+=d.value.numRows,h++}}finally{l.cancelLoad===u&&(l.cancelLoad=void 0),await s()}}async appendSourceBatch(e,n,o,a,r){const s=Es(this.context.device,e.model),i=Pe(e.color,Ce),c=Pe(e.width,xe),u=ye(e.color,ls,Ce),l=ye(e.width,us,xe),h=this.resolveNamedBatchStyleSource(i,n,"color",u),f=this.resolveNamedBatchStyleSource(c,n,"width",l);G(h)&&fo("ArrowPathLayer color",h),G(f)&&go("ArrowPathLayer width",f,["float32"]);const d=s==="storage"&&G(h)?void 0:await this.resolvePathStyleSource(h,a,n?.numRows,!0),g=s==="storage"&&G(f)?void 0:await this.resolvePathStyleSource(f,a,n?.numRows,!1);let m=Oa(s==="storage"?it:se,{data:n,selectors:{paths:e.paths,colors:d??null,widths:g??null,...s==="storage"&&e.timestamps!==void 0?{timestamps:e.timestamps}:{}}});m.colors&&!A.isList(m.colors.type)&&(m={...m,colors:await po(this.context.device,m.colors,`${e.id}-batch-${o}-arrow-colors`)}),m=ws(m,u,l);const p=await Dt.convertToGPUVectors(this.context.device,m,{model:s,id:`${e.id}-batch-${o}`,rowIndexBase:a});if(!this.isActiveLoad(r)){p.destroy();return}let y=null,E=p.colors;if(s==="storage"&&G(h)){try{const R=$e(h,o,m.paths.length),L=await mo(this.context.device,R,`${e.id}-batch-${o}-colors`);E=L.vector,y=L.converted?L.vector:null}catch(R){throw p.destroy(),R}if(!this.isActiveLoad(r)){y?.destroy(),p.destroy();return}}const S=s==="storage"&&G(f)?$e(f,o,m.paths.length):p.widths,T=E??new Se({format:"unorm8x4",value:new Uint8Array(u)}),b=S??new Se({format:"float32",value:new Float32Array([l])}),P=ys(this.context.device,{id:`${e.id}-batch-${o}`,hasColors:s==="storage"||!!m.colors,hasWidths:s==="storage"||!!m.widths,color:u,width:l,currentTime:e.currentTime??0,trailLength:e.trailLength??0,temporalEnabled:e.temporalEnabled??!1,timestampColumnEnabled:!!m.timestamps,fadeTrail:e.fadeTrail??!1});let C;try{s==="storage"?C=Dt.createModel(this.context.device,{...p,model:"storage",id:`${e.id}-batch-${o}`,...this.getShaders({modules:[Ee,Lt],source:ms}),shaderLayout:ps,bufferLayout:P.bufferLayout,attributes:P.attributes,bindings:{pathTimestamps:P.defaultTimestampBuffer},...T instanceof F?{colors:T}:{color:u},...b instanceof F?{widths:b}:{width:l},topology:"triangle-list",vertexCount:6}):C=Dt.createModel(this.context.device,{...p,model:"attribute",id:`${e.id}-batch-${o}`,...this.getShaders(this.context.device.type==="webgpu"?{modules:[Ee,Lt],source:gs}:{modules:[Qn,Lt],vs:fs,fs:hs}),shaderLayout:ds,...T instanceof F?{colors:T}:{},...b instanceof F?{widths:b}:{},bufferLayout:P.bufferLayout,attributes:P.attributes,constantAttributes:P.constantAttributes,topology:"triangle-list",vertexCount:6})}catch(R){throw Jt(P.buffers),y?.destroy(),p.destroy(),R}if(!this.isActiveLoad(r)){C.destroy(),Jt(P.buffers),y?.destroy(),p.destroy();return}const v=m.paths.length,z={model:C,prepared:p,constantBuffers:P.buffers,batchIndex:o,rowIndexOffset:a,rowCount:v,temporalBuffer:P.temporalBuffer,timestampColumnEnabled:!!m.timestamps,convertedColorVector:y},I=[...this.getLayerState().batches,z];this.setState({batches:I,loadVersion:r,sourceInitialized:!0}),this.setNeedsRedraw(),wo(C,()=>{this.isActiveLoad(r)&&this.setNeedsRedraw()},R=>{this.isActiveLoad(r)&&(e.onDataError?e.onDataError(R):this.raiseError(R,`linking Arrow shaders in ${this}`))}),e.onDataBatch?.({loadedBatchCount:I.length,isFirstBatch:o===0,batchIndex:o,rowIndexOffset:a,rowCount:v})}isActiveLoad(e){return this.getLayerState().loadVersion===e}async resolvePathStyleSource(e,n,o,a){if(!G(e))return e;const r=this.getLayerState().gpuVectorSourceCache;let s=r.get(e);s||(s=Po(this.context.device,e,`${this.id}-${a?"colors":"values"}`,a),r.set(e,s));const i=await s;return o===void 0?i:i.slice(n,n+o)}resolveNamedBatchStyleSource(e,n,o,a){if(typeof e!="string"||yo(n,e))return e;Kn.warn(`${this.id}: ArrowPathLayer ${o} column "${e}" is missing; using ${o} default ${JSON.stringify(a)}`)()}getLayerState(){return this.state}};bt.layerName="ArrowPathLayer",bt.defaultProps={data:{type:"object",value:null,optional:!0},parameters:lo};let Zt=bt;function ws(t,e,n){const o=t.colors,a=t.widths;return{...t,...o&&Ge(o)?{colors:Ps(t.paths,o,e)}:{},...a&&Ge(a)?{widths:rn(Array.from({length:a.length},(r,s)=>a.get(s)??n),a.type)}:{}}}function Ps(t,e,n){const o=Array.from({length:e.length},(a,r)=>{const s=e.get(r);if(A.isList(e.type)){const i=t.get(r),c=i?Array.from(i).length:0;return s?Array.from(s,u=>Ue(u,n)):Array.from({length:c},()=>n)}return Ue(s,n)});return rn(o,e.type)}function Ue(t,e){if(!t||typeof t!="object"||!(Symbol.iterator in t))return e;const n=Array.from(t);return[n[0]??e[0],n[1]??e[1],n[2]??e[2],n[3]??e[3]]}function Ge(t){return t.data.some(e=>Fn(e))}function Fn(t){return t.nullCount>0||t.children.some(Fn)}function $e(t,e,n){const o=t.data.length===1&&e===0&&t.length===n,a=o?t.data[0]:t.data[e];if(!a||a.length!==n)throw new Error(`ArrowPathLayer GPUVector "${t.name}" batch ${e} rows must match paths rows`);return o?t:new F({type:"data",name:`${t.name}-batch-${e}`,format:t.format,data:[a],ownsData:!1})}function ys(t,{id:e,hasColors:n,hasWidths:o,color:a,width:r,currentTime:s,trailLength:i,temporalEnabled:c,timestampColumnEnabled:u,fadeTrail:l}){const h=[],f={},d={},g=[];let m=null,p=null;if(!n){const E=new Uint32Array([Cs(a),0,0,0]);if(h.push({name:De,byteStride:0,stepMode:"instance",attributes:[{attribute:"segmentStartColors",format:"uint32",byteOffset:0},{attribute:"segmentEndColors",format:"uint32",byteOffset:0}]}),t.type==="webgl")d.segmentStartColors=E,d.segmentEndColors=E;else{const S=t.createBuffer({id:`${e}-constant-color`,data:E});f[De]=S,g.push(S)}}if(!o){const E=new Float32Array([r]);if(h.push({name:Ne,byteStride:0,stepMode:"instance",attributes:[{attribute:"widths",format:"float32",byteOffset:0}]}),t.type==="webgl")d.widths=E;else{const S=t.createBuffer({id:`${e}-constant-width`,data:E});f[Ne]=S,g.push(S)}}const y=Un({currentTime:s,trailLength:i,temporalEnabled:c,timestampColumnEnabled:u,fadeTrail:l});return h.push({name:Fe,byteStride:0,stepMode:"instance",attributes:[{attribute:"currentTime",format:"float32",byteOffset:0},{attribute:"trailLength",format:"float32",byteOffset:4},{attribute:"temporalEnabled",format:"float32",byteOffset:8},{attribute:"fadeTrail",format:"float32",byteOffset:12}]}),t.type==="webgl"?(d.currentTime=y.subarray(0,1),d.trailLength=y.subarray(1,2),d.temporalEnabled=y.subarray(2,3),d.fadeTrail=y.subarray(3,4)):(m=t.createBuffer({id:`${e}-constant-temporal`,data:y}),f[Fe]=m,g.push(m),p=t.createBuffer({id:`${e}-default-timestamp`,data:new Float32Array([0]),usage:w.STORAGE}),g.push(p)),{bufferLayout:h,attributes:f,constantAttributes:d,buffers:g,temporalBuffer:m,defaultTimestampBuffer:p}}function Ss(t,e){const n=Un({currentTime:e.currentTime??0,trailLength:e.trailLength??0,temporalEnabled:e.temporalEnabled??!1,timestampColumnEnabled:t.timestampColumnEnabled,fadeTrail:e.fadeTrail??!1});t.model.device.type==="webgl"?t.model.setConstantAttributes({currentTime:n.subarray(0,1),trailLength:n.subarray(1,2),temporalEnabled:n.subarray(2,3),fadeTrail:n.subarray(3,4)}):t.temporalBuffer?.write(n)}function Un({currentTime:t,trailLength:e,temporalEnabled:n,timestampColumnEnabled:o,fadeTrail:a}){const r=o?2:n?1:0;return new Float32Array([t,e,r,a?1:0])}function Es(t,e="auto"){if(e==="storage"&&t.type!=="webgpu")throw new Error("ArrowPathLayer storage rendering requires WebGPU");return e==="auto"?t.type==="webgpu"?"storage":"attribute":e}function Cs(t){const[e,n,o,a]=t.map(r=>Math.max(0,Math.min(255,Math.round(r))));return(e|n<<8|o<<16|a<<24)>>>0}function Jt(t){for(const e of t)e.destroy()}function We(t){for(const e of t)e.model.destroy(),Jt(e.constantBuffers),e.convertedColorVector?.destroy(),e.prepared.destroy()}function xs(t){return t instanceof Error?t:new Error(String(t))}const Ts=1700000000000n,Gn=1e3,Qt=1.48,bs=220,vs=10,As=1e3,Os=240,ke=12,Ye=13,ze=15,He=3,qe=6,Is=24,te={240:{pathCount:240,pointCount:18,label:"240 paths, 4.1K segments"},960:{pathCount:960,pointCount:22,label:"960 paths, 20K segments"},2400:{pathCount:2400,pointCount:26,label:"2.4K paths, 60K segments"}};function _s(t,e,n,o,a,r=null){const s=Xe(),i=n,c=o,u=a,l=c!=="vertex-colors"&&u!=="timestamps",h=Ms(t.pathCount,t.pointCount,e,i,l,r),f=u==="timestamps"?$s(t.pathCount,t.pointCount,r):void 0,d=c==="none"?void 0:c==="vertex-colors"?Ws(t.pathCount,t.pointCount,r):ks(t.pathCount,r),g=Ys(t.pathCount,r),m=Xe()-s,p=ht(h)+(f?ht(f):0),y=(d?ht(d):0)+ht(g);return{sourceVectors:{paths:h,...d?{colors:d}:{},widths:g,...f?{timestamps:f}:{}},pathArrowByteLength:p,styleArrowByteLength:y,arrowVectorBuildTimeMs:m}}function Rs(t){return new k(t.sourceVectors).batches}async function*Ls(t){for(let e=0;e<t.length;e++){e>0&&await Bs();const n=t[e];n&&(yield n)}}function Bs(){return new Promise(t=>{setTimeout(t,As)})}function Ms(t,e,n,o,a,r=null){if(o==="dense-union")return n==="polygons"?Ds(t,r):Vs(t,e,a,r);const s=o==="float64"?new U:new x,i=[];return Y(t,r,(c,u)=>{i.push(ee(Gs(c,u),t,e,s,4))}),new M(i)}function Vs(t,e,n,o=null){const a=[];return Y(t,o,(r,s)=>{const i=new Int8Array(s),c=new Int32Array(s),u=[],l=[],h=[];for(let p=0;p<s;p++){const y=r+p,E=n?y%3:y%2;E===0?(i[p]=ke,c[p]=u.length,u.push(y)):E===1?(i[p]=Ye,c[p]=l.length,l.push(y)):(i[p]=ze,c[p]=h.length,h.push(y))}const f=ee(u,t,e,new x,3),d=ee(l,t,e,new U,4),g=Ns(h,t,e,new x,3),m=new sn([ke,Ye,ze],[new O("LineStringXYM",f.type,!0),new O("LineStringXYZM",d.type,!0),new O("MultiLineStringXYM",g.type,!0)]);a.push(Ot({type:m,length:s,nullCount:0,typeIds:i,valueOffsets:c,children:[f,d,g]}))}),new M(a)}function Ds(t,e=null){const n=[];return Y(t,e,(o,a)=>{const r=new Int8Array(a),s=new Int32Array(a),i=[],c=[];for(let f=0;f<a;f++){const d=o+f;d%4===0?(r[f]=qe,s[f]=c.length,c.push(d)):(r[f]=He,s[f]=i.length,i.push(d))}const u=Fs(i,t),l=Us(c,t),h=new sn([He,qe],[new O("Polygon",u.type,!0),new O("MultiPolygon",l.type,!0)]);n.push(Ot({type:h,length:a,nullCount:0,typeIds:r,valueOffsets:s,children:[u,l]}))}),new M(n)}function Ns(t,e,n,o,a){const r=t.length*2,s=new Int32Array(t.length+1),i=new Int32Array(r+1),c=o instanceof U?new Float64Array(r*n*a):new Float32Array(r*n*a);for(let h=0;h<t.length;h++){const f=t[h];s[h]=h*2;for(let d=0;d<2;d++){const g=h*2+d;i[g]=g*n;for(let m=0;m<n;m++){const p=(g*n+m)*a;$n(c,p,f,e,m,n,a),c[p]=c[p]*.43+(d===0?-.38:.38),c[p+1]+=d===0?-.036:.036}}}s[t.length]=r,i[r]=r*n;const u=pe(o,a,c),l=W(u,i);return W(l,s)}function Fs(t,e){const n=new Int32Array(t.length+1),o=new Int32Array(zs(t)+1),a=Hs(t),r=new Float32Array(a*2);let s=0,i=0;for(let l=0;l<t.length;l++){const h=t[l];n[l]=s,o[s++]=i,i=ne(r,i,h,e,0),me(h)&&(o[s++]=i,i=ne(r,i,h,e,1))}n[t.length]=s,o[s]=i;const c=pe(new x,2,r),u=W(c,o);return W(u,n)}function Us(t,e){const n=new Int32Array(t.length+1),o=new Int32Array(t.length*2+1),a=new Int32Array(qs(t)+1),r=Xs(t),s=new Float32Array(r*2);let i=0,c=0,u=0;for(let d=0;d<t.length;d++){const g=t[d];n[d]=i;for(let m=0;m<2;m++)o[i++]=c,a[c++]=u,u=ne(s,u,g+m*17,e,m+2)}n[t.length]=i,o[i]=c,a[c]=u;const l=pe(new x,2,s),h=W(l,a),f=W(h,o);return W(f,n)}function ee(t,e,n,o,a){const r=new q(a,new O("values",o,!1)),s=new X(new O("coordinates",r,!1)),i=new Int32Array(t.length+1),c=o instanceof U?new Float64Array(t.length*n*a):new Float32Array(t.length*n*a);for(let h=0;h<t.length;h++){const f=t[h];i[h]=h*n;for(let d=0;d<n;d++)$n(c,(h*n+d)*a,f,e,d,n,a)}i[t.length]=t.length*n;const u=new _(o,0,c.length,0,{[B.DATA]:c}),l=new _(r,0,c.length/a,0,{},[u]);return new _(s,0,t.length,0,{[B.OFFSET]:i},[l])}function pe(t,e,n){const o=new _(t,0,n.length,0,{[B.DATA]:n}),a=new q(e,new O("values",t,!1));return new _(a,0,n.length/e,0,{},[o])}function W(t,e){const n=new X(new O("values",t.type,!1));return new _(n,0,e.length-1,0,{[B.OFFSET]:e},[t])}function Gs(t,e){const n=[];for(let o=0;o<e;o++)n.push(t+o);return n}function $s(t,e,n=null){const o=new So,a=new X(new O("timestamps",o,!1)),r=[];return Y(t,n,(s,i)=>{const c=new Int32Array(i+1),u=new BigInt64Array(i*e);for(let h=0;h<i;h++){const f=s+h;c[h]=h*e;for(let d=0;d<e;d++){const g=h*e+d;u[g]=Ts+BigInt(Math.round(oe(f,d,e)*Gn))}}c[i]=i*e;const l=new _(o,0,u.length,0,{[B.DATA]:u});r.push(new _(a,0,i,0,{[B.OFFSET]:c},[l]))}),new M(r)}function Ws(t,e,n=null){const o=new q(4,new O("values",new nt,!1)),a=new X(new O("colors",o,!1)),r=[];return Y(t,n,(s,i)=>{const c=new Int32Array(i+1),u=js(s,i,e);for(let f=0;f<i;f++)c[f]=f*e;c[i]=i*e;const l=new _(new nt,0,u.length,0,{[B.DATA]:u}),h=new _(o,0,u.length/4,0,{},[l]);r.push(new _(a,0,i,0,{[B.OFFSET]:c},[h]))}),new M(r)}function ks(t,e=null){const n=[];return Y(t,e,(o,a)=>{n.push($(new nt,4,Zs(o,a)).data[0])}),new M(n)}function Ys(t,e=null){const n=[];return Y(t,e,(o,a)=>{const r=Js(o,a);n.push(Ot({type:new x,length:r.length,data:r}))}),new M(n)}function Y(t,e,n){const o=e&&e>0&&e<t?e:t;for(let a=0;a<t;a+=o)n(a,Math.min(o,t-a))}function $n(t,e,n,o,a,r,s){const i=r<=1?0:a/(r-1),u=-.92+(o<=1?0:n/(o-1))*1.84,l=n*.13;if(t[e]=-1.24+i*2.48,t[e+1]=u+Math.sin(i*11.5+l)*.028+Math.cos(i*4.2-l*.55)*.014,s===3){t[e+2]=oe(n,a,r);return}t[e+2]=0,t[e+3]=oe(n,a,r)}function ne(t,e,n,o,a){const{x:r,y:s,radius:i,cellWidth:c}=Ks(n,o),u=rt(n,a),l=a===1,h=a>=2,f=a%2===0?-1:1,d=r+(h?f*c*.22:0),g=s+(l?i*.1:h?f*i*.16:0),m=i*(l?.38:h?.58:.92),p=-Math.PI/2+et(n,19+a)*.42,y=.84+et(n,31+a)*.12,E=.86+et(n,43+a)*.12;for(let S=0;S<u;S++){const T=l?u-S:S,b=p+T/u*Math.PI*2,P=Math.sin(b*3+n*.17)*.08,C=m*(1+P),v=(e+S)*2;t[v]=d+Math.cos(b)*C*y,t[v+1]=g+Math.sin(b)*C*E}return e+u}function zs(t){return t.reduce((e,n)=>e+(me(n)?2:1),0)}function Hs(t){return t.reduce((e,n)=>e+rt(n,0)+(me(n)?rt(n,1):0),0)}function qs(t){return t.length*2}function Xs(t){return t.reduce((e,n)=>e+rt(n,2)+rt(n+17,3),0)}function rt(t,e){return e===1?5+t%3:6+(t+e)%5}function me(t){return t%5===0}function Ks(t,e){const n=Is,o=Math.ceil(e/n),a=1.86/n,r=1.76/o,s=t%n,i=Math.floor(t/n),c=et(t,61)*a*.15,u=et(t,73)*r*.15;return{x:-.93+(s+.5)*a+c,y:.88-(i+.5)*r+u,radius:Math.min(a,r)*.46,cellWidth:a}}function et(t,e){const n=Math.sin((t+1)*(e+29)*12.9898)*43758.5453;return n-Math.floor(n)-.5}function oe(t,e,n){const o=n<=1?0:e/(n-1),r=.58+t%5*.16,s=Math.floor(t/5)%4*.08;return o*r+s}function js(t,e,n){const o=new Uint8Array(e*n*4);for(let a=0;a<e;a++){const r=t+a,s=yt(r),i=yt(r+2),c=yt(r+4),u=[42,116,255];for(let l=0;l<n;l++){const h=n<=1?0:l/(n-1),f=l%2===0?s:i,d=l%4===0?c:f,g=Math.min(1,Math.max(0,(h-.18)/.72)),m=l%2===0?72:-28,p=(a*n+l)*4;o[p]=Nt(d[0]*(1-g)+u[0]*g+m),o[p+1]=Nt(d[1]*(1-g)+u[1]*g+m),o[p+2]=Nt(d[2]*(1-g)+u[2]*g+m),o[p+3]=l%2===0?242:202}}return o}function Zs(t,e){const n=new Uint8Array(e*4);for(let o=0;o<e;o++){const a=t+o,r=yt(a),s=o*4;n[s]=r[0],n[s+1]=r[1],n[s+2]=r[2],n[s+3]=220}return n}function Js(t,e){return Float32Array.from({length:e},(n,o)=>.0022+(t+o)%7*72e-5)}function yt(t){switch(t%5){case 0:return[72,205,217];case 1:return[255,186,73];case 2:return[255,111,97];case 3:return[120,177,255];default:return[152,221,132]}}function Nt(t){return Math.min(255,Math.max(0,Math.round(t)))}function Xe(){return typeof performance>"u"?Date.now():performance.now()}class Qs{state={rowCountKind:"240-stream",coordinateKind:"float32",colorKind:"row-colors",widthKind:"row-widths",timeKind:"none",animate:!0,modelKind:"storage"};panel=null;onDataUpdated;isFinalized=!1;activeUpdate=null;constructor({onDataUpdated:e}){this.onDataUpdated=e}initialize(e){const n=e.type==="webgpu";n||(this.state.modelKind="attribute"),this.panel=new xo({id:"deck-arrow-paths",description:"Variable-length Arrow paths stream progressively from an async iterable of RecordBatch values while preserving source batch boundaries.",schema:ti(n),initialState:this.state,onSettingsChange:o=>{const a=Object.keys(o).every(r=>r==="animate"||o[r]===this.state[r]);this.state=o,a&&this.activeUpdate?(this.activeUpdate={...this.activeUpdate,animate:o.animate},this.onDataUpdated(this.activeUpdate)):this.emitDataSource()}}),this.panel.initialize(),this.emitDataSource()}finalize(){this.isFinalized||(this.isFinalized=!0,this.panel?.finalize())}emitDataSource(){const e=this.panel;if(!e)return;const n=this.state.rowCountKind==="240-stream"?"240":"2400",o=_s(te[n],"lines",this.state.coordinateKind,this.state.colorKind,this.state.timeKind,Os),a=Rs(o).slice(0,vs),r=e.beginTableStream(a);this.activeUpdate={asyncIterator:Ls(a),model:this.state.modelKind,currentTime:this.state.animate?Qt*.25:Qt,trailLength:bs/Gn,temporalEnabled:this.state.timeKind==="xyzm",animate:this.state.animate,colorColumn:this.state.colorKind!=="none",widthColumn:this.state.widthKind!=="constant",layerProps:{onDataBatch:s=>{this.isFinalized||r.setLoadedBatchCount(s.loadedBatchCount)}}},this.onDataUpdated(this.activeUpdate)}}function ti(t){return{title:"Settings",sections:[{id:"data",name:"Data",initiallyCollapsed:!1,settings:[{name:"rowCountKind",label:"Rows",type:"select",persist:"none",options:[{label:te[240].label,value:"240-stream"},{label:te[2400].label,value:"2400-stream"}]},{name:"coordinateKind",label:"Coordinates",type:"select",persist:"none",options:[{label:"Float32 XY(ZM)",value:"float32"},{label:"Float64 XY(ZM)",value:"float64"}]},{name:"colorKind",label:"Colors",type:"select",persist:"none",options:[{label:"Constant",value:"none"},{label:"Row colors",value:"row-colors"},{label:"Vertex colors",value:"vertex-colors"}]},{name:"widthKind",label:"Widths",type:"select",persist:"none",options:[{label:"Constant",value:"constant"},{label:"Row widths",value:"row-widths"}]},{name:"timeKind",label:"Time",type:"select",persist:"none",options:[{label:"None",value:"none"},{label:"XYZM coordinate",value:"xyzm"}]},{name:"animate",label:"Animate",type:"boolean",persist:"none"}]},{id:"renderer",name:"Renderer",initiallyCollapsed:!1,settings:[{name:"modelKind",label:"Model",type:"select",persist:"none",options:[...t?[{label:"Storage (WebGPU)",value:"storage"}]:[],{label:"Attribute",value:"attribute"}]}]}]}}const ei=[199,219,245,235],ni={source:"colors",nullValue:[199,219,245,235]},oi={source:"widths",nullValue:.0035};function Wn(t,e={}){let n=null,o=null,a=0;const r=new Eo({parent:t,...jn(e),views:new Jn({id:"main"}),initialViewState:{target:[0,0],zoom:8},controller:!0,getTooltip:Co,layers:[],onLoad:({device:i})=>s.initialize(i),onBeforeRender:({deck:i})=>{const c=n;if(c?.animate&&c.temporalEnabled){const u=performance.now(),l=(u-(o??u))/1e3;o=u,a=(a+l*.24)%Qt,Ke(i,c,a)}},onFinalize:()=>s.finalize()}),s=new Qs({onDataUpdated:i=>{i.asyncIterator!==n?.asyncIterator&&(a=i.currentTime),n=i,o=null,Ke(r,i,a)}});return r}function Ke(t,e,n){t.setProps({layers:[new Zt({id:"arrow-paths",pickable:!0,model:e.model??"auto",data:e.asyncIterator,paths:"paths",color:e.colorColumn?ni:ei,width:e.widthColumn?oi:.0035,currentTime:n,trailLength:e.trailLength,temporalEnabled:e.temporalEnabled,...e.layerProps})]})}const Tt=document.querySelector("#deck-device");Tt.value=await Zn(new URLSearchParams(location.search).get("backend"));let je=Wn(void 0,{deviceType:Tt.value});Tt.addEventListener("change",()=>{je.finalize(),je=Wn(void 0,{deviceType:Tt.value})});
