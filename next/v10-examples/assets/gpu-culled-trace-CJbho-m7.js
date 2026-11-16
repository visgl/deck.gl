import{K as k,M as pt,L as Ut,B as _,h as vt}from"./deck-example-device-fJ8plmlS.js";import{O as Nt}from"./orthographic-view-DL_bm2eu.js";import{A as Pt}from"./arrow-deck-DnHo87iV.js";import{A as Mt,b as Ft}from"./arrow-text-layer-BYwGRzsV.js";import{D as tt}from"./draw-command-buffer-B0XWOl81.js";import{e as mt,o as $,t as et,f as V,l as wt,m as yt,g as S,i as Lt,k as Dt,p as G,b as N,s as Et,q as kt,G as Gt}from"./gpu-scan-BKwYXpH0.js";import{C as Bt}from"./computation-CE6jzqLi.js";import{S as $t,Q as Vt}from"./arrow-example-panels-VPPZWY2Q.js";import{m as nt}from"./arrow-shader-layout-CFiJUV4s.js";import{T as Wt,F as ot,v as Yt,k as Ht}from"./recordbatch-CfjHIgaF.js";import"./project32-Dr-odEjx.js";import"./arrow-picking-Dj8hLUnP.js";import"./dynamic-texture-DMW10Fa9.js";import"./Arrow-B5ol7HNO.js";const P=256;class Tt{id;input;flags;output;count;constructor(t){if(this.id=t.id??"gpu-compaction",this.input=t.input,this.flags=t.flags,this.output=t.output,this.count=t.count,z(this.input,`${this.id} input`),z(this.flags,`${this.id} flags`),z(this.output,`${this.id} output`),mt(this.count,`${this.id} count`),this.flags.length!==this.input.length)throw new Error(`${this.id} flags.length must equal input.length`);if(this.output.length<this.input.length)throw new Error(`${this.id} output must contain at least input.length rows`);if(this.count.length<1)throw new Error(`${this.id} count must contain one uint32 row`)}getCommandNodes(t){const n=[];return n.push(...zt(this,t,t.device.limits.maxComputeWorkgroupsPerDimension)),n}}function zt(e,t,n){const o=[];for(const i of[...v(e.input),...v(e.flags),...v(e.output),e.count])if(i.buffer.graph!==t)throw new Error(`${e.id} views must belong to the target graph`);if(e.input.length===0)return o.push(...Xt(t,e.id,e.count)),o;const s=e.flags instanceof $?et(t,`${e.id}-offsets`,e.flags):V(t,`${e.id}-offsets`,"uint32",e.flags.length),a=e.flags instanceof $?et(t,`${e.id}-flags`,e.flags):V(t,`${e.id}-flags`,"uint32",e.flags.length);for(const[i,r]of v(e.flags).entries()){if(!r.length)continue;const u=v(a)[i],c=wt(e.id,r.length,P,n);o.push(...xt(t,{id:`${e.id}-normalize-${i}`,source:`
@group(0) @binding(0) var<storage, read> inputValues: array<u32>;
@group(0) @binding(1) var<storage, read_write> outputValues: array<u32>;
@compute @workgroup_size(${P}) fn main(
  @builtin(local_invocation_index) localInvocationIndex: u32,
  @builtin(workgroup_id) workgroupId: vec3<u32>
) {
  ${yt(c,P)}
  if (index >= ${r.length}u) { return; }
  outputValues[${S(u)}u + index] = min(inputValues[${S(r)}u + index], 1u);
}`,resources:[{buffer:r,usage:"storage-read"},{buffer:u,usage:"storage-write"}],bindings:{inputValues:r,outputValues:u},dispatchLayout:c}))}const d=new Lt({id:`${e.id}-scan`,input:a,output:s});return o.push(...Dt(d,t,n)),o.push(...qt(t,e.id,e.input,e.flags,s,e.output,e.count,n)),o}function Xt(e,t,n){const o=[],s=`${t}-clear-count`;return o.push(G({id:s,resources:[{buffer:n,usage:"storage-write"}],compile:({device:a})=>{const d=new k(a,{id:s,source:`const COUNT_OFFSET: u32 = ${S(n)}u;
@group(0) @binding(0) var<storage, read_write> outputCount: array<u32>;
@compute @workgroup_size(1) fn main() { outputCount[COUNT_OFFSET] = 0u; }`,shaderLayout:{bindings:[{name:"outputCount",type:"storage",group:0,location:0}]}});return{encode:({computePass:i,getBuffer:r})=>{d.dispatch(i,{bindings:{outputCount:N(n,r)},x:1})},destroy:()=>d.destroy()}}})),o.map(a=>Et(a,[1,1,1]))}function qt(e,t,n,o,s,a,d,i){const r=[],u=kt(e,[n,o,s]),c=u.map(m=>m[0]),h=u.map(m=>m[1]),l=u.map(m=>m[2]),g=v(a),p=c.map((m,E)=>m.length>0?E:-1).filter(m=>m>=0),f=g.map((m,E)=>m.length>0?E:-1).filter(m=>m>=0),w=p[p.length-1],y=f[f.length-1],b=u.length>1||a instanceof $;let T=0;for(let m=0;m<g.length;m++){const E=g[m],C=T+E.length;if(E.length>0)for(const A of p){const U=A===w&&m===y;r.push(...jt(e,{id:b?`${t}-scatter-input-${A}-output-${m}`:`${t}-scatter`,input:c[A],flags:h[A],offsets:l[A],output:E,outputStart:T,outputEnd:C,count:U?d:void 0,dispatchLayout:wt("GPUCompaction",c[A].length,P,i)}))}T=C}return r}function jt(e,t){const n=[],o=t.count?"@group(0) @binding(4) var<storage, read_write> outputCount: array<u32>;":"",s=t.count?`if (index == ELEMENT_COUNT - 1u) {
    outputCount[COUNT_OFFSET] = outputIndex + flag;
  }`:"",a=`
const ELEMENT_COUNT: u32 = ${t.input.length}u;
const INPUT_OFFSET: u32 = ${S(t.input)}u;
const FLAGS_OFFSET: u32 = ${S(t.flags)}u;
const OFFSETS_OFFSET: u32 = ${S(t.offsets)}u;
const OUTPUT_OFFSET: u32 = ${S(t.output)}u;
const OUTPUT_START: u32 = ${t.outputStart}u;
const OUTPUT_END: u32 = ${t.outputEnd}u;
${t.count?`const COUNT_OFFSET: u32 = ${S(t.count)}u;`:""}
@group(0) @binding(0) var<storage, read> inputValues: array<u32>;
@group(0) @binding(1) var<storage, read> flags: array<u32>;
@group(0) @binding(2) var<storage, read> offsets: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputValues: array<u32>;
${o}

@compute @workgroup_size(${P}) fn main(
  @builtin(local_invocation_index) localInvocationIndex: u32,
  @builtin(workgroup_id) workgroupId: vec3<u32>
) {
  ${yt(t.dispatchLayout,P)}
  if (index >= ELEMENT_COUNT) { return; }
  let flag = min(flags[FLAGS_OFFSET + index], 1u);
  let outputIndex = offsets[OFFSETS_OFFSET + index];
  if (flag != 0u && outputIndex >= OUTPUT_START && outputIndex < OUTPUT_END) {
    outputValues[OUTPUT_OFFSET + outputIndex - OUTPUT_START] = inputValues[INPUT_OFFSET + index];
  }
  ${s}
}`;return n.push(...xt(e,{id:t.id,source:a,resources:[{buffer:t.input,usage:"storage-read"},{buffer:t.flags,usage:"storage-read"},{buffer:t.offsets,usage:"storage-read"},{buffer:t.output,usage:"storage-write"},...t.count?[{buffer:t.count,usage:"storage-write"}]:[]],bindings:{inputValues:t.input,flags:t.flags,offsets:t.offsets,outputValues:t.output,...t.count?{outputCount:t.count}:{}},dispatchLayout:t.dispatchLayout})),n}function xt(e,t){const n=[];return n.push(G({id:t.id,workload:{operation:"GPUCompaction",commandCount:1,maximumWorkgroupCount:t.dispatchLayout.x*t.dispatchLayout.y*t.dispatchLayout.z,maximumInvocationCount:t.dispatchLayout.x*t.dispatchLayout.y*t.dispatchLayout.z*P,readByteLength:t.resources.reduce((o,s)=>o+(s.usage==="storage-read"||s.usage==="storage-read-write"?s.buffer.length*s.buffer.rowByteLength:0),0),writeByteLength:t.resources.reduce((o,s)=>o+(s.usage==="storage-write"||s.usage==="storage-read-write"?s.buffer.length*s.buffer.rowByteLength:0),0)},resources:t.resources,compile:({device:o})=>{const s=new k(o,{id:t.id,source:t.source,shaderLayout:{bindings:Object.keys(t.bindings).map((a,d)=>({name:a,type:"storage",group:0,location:d}))}});return{encode:({computePass:a,getBuffer:d})=>{const i={};for(const[r,u]of Object.entries(t.bindings))i[r]=N(u,d);s.dispatch(a,{bindings:i,x:t.dispatchLayout.x,y:t.dispatchLayout.y,z:t.dispatchLayout.z})},destroy:()=>s.destroy()}}})),n.map(o=>Et(o,[t.dispatchLayout.x,t.dispatchLayout.y,t.dispatchLayout.z]))}function v(e){return e instanceof $?e.data:[e]}function z(e,t){for(const n of v(e))mt(n,t)}const W=256;class Kt{id;glyphRows;rowFlags;output;count;sourceRecords;outputRecords;recordWordLength;constructor(t){if(this.id=t.id??"gpu-text-selection",this.glyphRows=t.glyphRows,this.rowFlags=t.rowFlags,this.output=t.output,this.count=t.count,this.sourceRecords=t.sourceRecords,this.outputRecords=t.outputRecords,this.output.length<this.glyphRows.length)throw new Error(`${this.id} output must contain at least glyphRows.length rows`);if(this.count.length<1)throw new Error(`${this.id} count must contain one uint32 row`);if(!!this.sourceRecords!=!!this.outputRecords)throw new Error(`${this.id} sourceRecords and outputRecords must be supplied together`);const n=this.sourceRecords&&this.glyphRows.length>0?this.sourceRecords.length/this.glyphRows.length:0;if(this.recordWordLength=t.recordWordLength??n,this.sourceRecords){if(!Number.isSafeInteger(this.recordWordLength)||this.recordWordLength<1)throw new Error(`${this.id} recordWordLength must be a positive integer`);const o=this.glyphRows.length*this.recordWordLength;if(this.sourceRecords.length<o||this.outputRecords.length<o)throw new Error(`${this.id} record buffers are smaller than the glyph record stream`);if(this.sourceRecords.byteStride!==Uint32Array.BYTES_PER_ELEMENT||this.outputRecords.byteStride!==Uint32Array.BYTES_PER_ELEMENT)throw new Error(`${this.id} record buffers must be packed uint32 words`)}}getCommandNodes(t){const n=[];for(const a of[this.glyphRows,this.rowFlags,this.output,this.count,this.sourceRecords,this.outputRecords])if(a){if(a.buffer.graph!==t)throw new Error(`${this.id} views must belong to the target graph`);if(a.format!=="uint32")throw new Error(`${this.id} views must use uint32 format`)}if(this.glyphRows.length===0)return n.push(...Jt(t,this.id,this.count)),n;const o=V(t,`${this.id}-glyph-ids`,"uint32",this.glyphRows.length),s=V(t,`${this.id}-glyph-flags`,"uint32",this.glyphRows.length);return n.push(...Qt(t,this,o,s)),n.push(...new Tt({id:`${this.id}-compaction`,input:o,flags:s,output:this.output,count:this.count}).getCommandNodes(t)),this.sourceRecords&&this.outputRecords&&n.push(...Zt(t,this)),n}}function Zt(e,t){const n=[],o=t.sourceRecords,s=t.outputRecords,a=`${t.id}-gather-records`,d=o.byteOffset/Uint32Array.BYTES_PER_ELEMENT,i=s.byteOffset/Uint32Array.BYTES_PER_ELEMENT,r=t.output.byteOffset/Uint32Array.BYTES_PER_ELEMENT,u=t.count.byteOffset/Uint32Array.BYTES_PER_ELEMENT,c=t.output.byteStride/Uint32Array.BYTES_PER_ELEMENT,h=`
const GLYPH_COUNT: u32 = ${t.glyphRows.length}u;
const RECORD_WORD_LENGTH: u32 = ${t.recordWordLength}u;
const SOURCE_OFFSET: u32 = ${d}u;
const OUTPUT_OFFSET: u32 = ${i}u;
const SELECTED_OFFSET: u32 = ${r}u;
const SELECTED_STRIDE: u32 = ${c}u;
const COUNT_OFFSET: u32 = ${u}u;
@group(0) @binding(0) var<storage, read> sourceRecords: array<u32>;
@group(0) @binding(1) var<storage, read> selectedGlyphIds: array<u32>;
@group(0) @binding(2) var<storage, read> selectedCount: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputRecords: array<u32>;

@compute @workgroup_size(${W}) fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let selectedIndex = globalId.x;
  if (selectedIndex >= GLYPH_COUNT || selectedIndex >= selectedCount[COUNT_OFFSET]) { return; }
  let sourceIndex = selectedGlyphIds[SELECTED_OFFSET + selectedIndex * SELECTED_STRIDE];
  for (var wordIndex = 0u; wordIndex < RECORD_WORD_LENGTH; wordIndex++) {
    outputRecords[OUTPUT_OFFSET + selectedIndex * RECORD_WORD_LENGTH + wordIndex] =
      sourceRecords[SOURCE_OFFSET + sourceIndex * RECORD_WORD_LENGTH + wordIndex];
  }
}`;return n.push(G({id:a,resources:[{buffer:o,usage:"storage-read"},{buffer:t.output,usage:"storage-read"},{buffer:t.count,usage:"storage-read"},{buffer:s,usage:"storage-write"}],compile:({device:l})=>{const g=new k(l,{id:a,source:h,shaderLayout:{bindings:[{name:"sourceRecords",type:"storage",group:0,location:0},{name:"selectedGlyphIds",type:"storage",group:0,location:1},{name:"selectedCount",type:"storage",group:0,location:2},{name:"outputRecords",type:"storage",group:0,location:3}]}});return{encode:({computePass:p,getBuffer:f})=>{g.dispatch(p,{bindings:{sourceRecords:f(o),selectedGlyphIds:f(t.output),selectedCount:f(t.count),outputRecords:f(s)},x:Math.ceil(t.glyphRows.length/W)})},destroy:()=>g.destroy()}}})),n}function Qt(e,t,n,o){const s=[],a=`${t.id}-visibility`,d=`
const GLYPH_COUNT: u32 = ${t.glyphRows.length}u;
const ROW_COUNT: u32 = ${t.rowFlags.length}u;
const GLYPH_ROW_OFFSET: u32 = ${S(t.glyphRows)}u;
const GLYPH_ROW_STRIDE: u32 = ${t.glyphRows.byteStride/Uint32Array.BYTES_PER_ELEMENT}u;
const ROW_FLAG_OFFSET: u32 = ${S(t.rowFlags)}u;
const ROW_FLAG_STRIDE: u32 = ${t.rowFlags.byteStride/Uint32Array.BYTES_PER_ELEMENT}u;
@group(0) @binding(0) var<storage, read> glyphRows: array<u32>;
@group(0) @binding(1) var<storage, read> rowFlags: array<u32>;
@group(0) @binding(2) var<storage, read_write> glyphIds: array<u32>;
@group(0) @binding(3) var<storage, read_write> glyphFlags: array<u32>;

@compute @workgroup_size(${W}) fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let glyphIndex = globalId.x;
  if (glyphIndex >= GLYPH_COUNT) { return; }
  let rowIndex = glyphRows[GLYPH_ROW_OFFSET + glyphIndex * GLYPH_ROW_STRIDE];
  glyphIds[glyphIndex] = glyphIndex;
  glyphFlags[glyphIndex] = 0u;
  if (rowIndex < ROW_COUNT) {
    glyphFlags[glyphIndex] = rowFlags[ROW_FLAG_OFFSET + rowIndex * ROW_FLAG_STRIDE];
  }
}`;return s.push(G({id:a,resources:[{buffer:t.glyphRows,usage:"storage-read"},{buffer:t.rowFlags,usage:"storage-read"},{buffer:n,usage:"storage-write"},{buffer:o,usage:"storage-write"}],compile:({device:i})=>{const r=new k(i,{id:a,source:d,shaderLayout:{bindings:[{name:"glyphRows",type:"storage",group:0,location:0},{name:"rowFlags",type:"storage",group:0,location:1},{name:"glyphIds",type:"storage",group:0,location:2},{name:"glyphFlags",type:"storage",group:0,location:3}]}});return{encode:({computePass:u,getBuffer:c})=>{r.dispatch(u,{bindings:{glyphRows:N(t.glyphRows,c),rowFlags:N(t.rowFlags,c),glyphIds:N(n,c),glyphFlags:N(o,c)},x:Math.ceil(t.glyphRows.length/W)})},destroy:()=>r.destroy()}}})),s}function Jt(e,t,n){const o=[];return o.push(G({id:`${t}-clear-count`,resources:[{buffer:n,usage:"storage-write"}],compile:({device:s})=>{const a=new k(s,{id:`${t}-clear-count`,source:`const COUNT_OFFSET: u32 = ${S(n)}u;
@group(0) @binding(0) var<storage, read_write> count: array<u32>;
@compute @workgroup_size(1) fn main() { count[COUNT_OFFSET] = 0u; }`,shaderLayout:{bindings:[{name:"count",type:"storage",group:0,location:0}]}});return{encode:({computePass:d,getBuffer:i})=>{const r={count:N(n,i)};a.dispatch(d,{bindings:r,x:1})},destroy:()=>a.destroy()}}})),o}class te extends Mt{static layerName="GPUCulledArrowTextLayer";culledDraw=null;setCulledDraw(t){this.culledDraw=t}getSelectionPreparation(){const t=this.getRendererOrNull();if(!t)return{source:null,status:"Preparing Arrow text renderer"};if(t.resolvedModel!=="storage-row-indexed")return{source:null,status:`GPU row-indexed text unavailable (resolved ${t.resolvedModel})`};const n=t.model,o=n.storageState.renderBatches[0];return o?n.storageState.renderBatches.length!==1?{source:null,status:"Multiple text batches are not supported by this example"}:{source:{glyphRecords:o.compactGlyphVertexData,glyphCount:o.glyphCount,recordWordLength:3},status:"Ready"}:{source:null,status:"Expanding Arrow glyph records on the GPU"}}drawTextRenderer(t,n){if(!this.culledDraw||t.resolvedModel!=="storage-row-indexed")return;const o=t.model;o.setAttributes({compactGlyphVertexData:this.culledDraw.selectedGlyphRecords}),o.setInstanceCount(0),pt.prototype.draw.call(o,n)&&this.culledDraw.drawCommands.draw(n,0)}}const st={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},ee=`
struct TraceSpan {
  start: f32,
  duration: f32,
  lane: u32,
  group: u32,
};

struct ViewUniforms { timeMin: f32, timeMax: f32, laneMin: f32, laneMax: f32 };
struct RenderUniforms { pickingActive: f32, opacity: f32, _padding: vec2<f32> };

@group(0) @binding(auto) var<storage, read> spans: array<TraceSpan>;
@group(0) @binding(auto) var<storage, read> visibleIds: array<u32>;
@group(0) @binding(auto) var<uniform> viewUniforms: ViewUniforms;
@group(0) @binding(auto) var<uniform> renderUniforms: RenderUniforms;

struct VertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};

fn getCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(0.0, 0.08), vec2<f32>(1.0, 0.08), vec2<f32>(0.0, 0.92),
    vec2<f32>(0.0, 0.92), vec2<f32>(1.0, 0.08), vec2<f32>(1.0, 0.92)
  );
  return corners[vertexIndex];
}

fn getGroupColor(group: u32) -> vec3<f32> {
  let colors = array<vec3<f32>, 3>(
    vec3<f32>(0.30, 0.78, 1.00),
    vec3<f32>(0.74, 0.46, 1.00),
    vec3<f32>(1.00, 0.63, 0.22)
  );
  return colors[min(group, 2u)];
}

fn encodePickingColor(rowIndex: u32) -> vec3<f32> {
  let colorIndex = rowIndex + 1u;
  return vec3<f32>(
    f32(colorIndex % 256u),
    f32((colorIndex / 256u) % 256u),
    f32((colorIndex / 65536u) % 256u)
  ) / 255.0;
}

@vertex fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> VertexOutput {
  let rowIndex = visibleIds[instanceIndex];
  let span = spans[rowIndex];
  let corner = getCorner(vertexIndex);
  let worldPosition = vec2<f32>(
    span.start + span.duration * corner.x,
    f32(span.lane) + corner.y
  );
  let viewSize = max(
    vec2<f32>(viewUniforms.timeMax - viewUniforms.timeMin, viewUniforms.laneMax - viewUniforms.laneMin),
    vec2<f32>(0.0001)
  );
  let normalized = (worldPosition - vec2<f32>(viewUniforms.timeMin, viewUniforms.laneMin)) / viewSize;
  var output: VertexOutput;
  output.position = vec4<f32>(normalized.x * 2.0 - 1.0, 1.0 - normalized.y * 2.0, 0.0, 1.0);
  output.color = vec4<f32>(getGroupColor(span.group), 0.92);
  output.pickingColor = encodePickingColor(rowIndex);
  return output;
}

@fragment fn fragmentMain(input: VertexOutput) -> @location(0) vec4<f32> {
  if (renderUniforms.pickingActive > 0.5) {
    return vec4<f32>(input.pickingColor, 1.0);
  }
  return vec4<f32>(input.color.rgb, input.color.a * renderUniforms.opacity);
}`;class ne extends Ut{static layerName="GPUCulledTraceLayer";static defaultProps={parameters:st};getAttributeManager(){return null}setShaderModuleProps(){}initializeState({device:t}){if(t.type!=="webgpu")throw new Error("GPUCulledTraceLayer requires WebGPU");const n=t.createBuffer({id:`${this.id}-render-uniforms`,byteLength:16,usage:_.UNIFORM|_.COPY_DST}),o=new pt(t,{id:`${this.id}-model`,source:ee,topology:"triangle-list",isInstanced:!0,vertexCount:6,instanceCount:0,bufferLayout:[],bindings:{spans:this.props.spans,visibleIds:this.props.visibleIds,viewUniforms:this.props.viewUniforms,renderUniforms:n},parameters:st});this.setState({model:o,renderUniforms:n})}getModels(){const t=this.state.model;return t?[t]:[]}draw({renderPass:t,shaderModuleProps:n}){const{model:o,renderUniforms:s}=this.state;!o||!s||(s.write(new Float32Array([n?.picking?.isActive??0,this.props.opacity??1,0,0])),o.setInstanceCount(0),o.draw(t)&&this.props.drawCommands.draw(t,0))}getPickingInfo({info:t}){return t}finalizeState(t){const n=this.state;n.model?.destroy(),n.renderUniforms?.destroy(),this.setState({model:null,renderUniforms:null}),super.finalizeState(t)}}const I=Uint32Array.BYTES_PER_ELEMENT,oe=1;class se{id="gpu-trace-culling-effect";props={};useInPicking=!0;resources;device;count;compiled=null;textSelection=null;textLayer=null;labelStatus="Waiting for label layer";onStats;visibleBlocks=0;outsideBlocks=0;smallBlocks=0;visibleGlyphs=0;encodeTimeMilliseconds=0;frameIndex=0;statsReadPending=!1;isFinalized=!1;constructor(t,n,o={}){if(t.type!=="webgpu")throw new Error("GPUTraceCullingEffect requires WebGPU");this.device=t,this.count=n.count,this.onStats=o.onStats,this.resources={spans:t.createBuffer({id:"deck-gpu-trace-spans",data:n.spans,usage:_.STORAGE|_.COPY_DST}),visibleIds:t.createBuffer({id:"deck-gpu-trace-visible-ids",byteLength:n.count*I,usage:_.STORAGE|_.COPY_SRC}),rowFlags:t.createBuffer({id:"deck-gpu-trace-row-flags",byteLength:n.count*I,usage:_.STORAGE|_.COPY_SRC}),cullingCounts:t.createBuffer({id:"deck-gpu-trace-culling-counts",byteLength:I*2,usage:_.STORAGE|_.COPY_DST|_.COPY_SRC}),viewUniforms:t.createBuffer({id:"deck-gpu-trace-view-uniforms",byteLength:32,usage:_.UNIFORM|_.COPY_DST}),blockDrawCommands:new tt(t,{id:"deck-gpu-trace-block-draw",type:"draw",commands:[{vertexCount:6,instanceCount:0}]})},this.rebuildGraph()}setup(t){}setTextLayer(t){this.textLayer=t,this.labelStatus="Preparing Arrow text renderer",this.publishStats()}setLabelError(t){this.labelStatus=t instanceof Error?t.message:String(t),this.publishStats()}preRender(t){const n=t.viewports[0];if(!n)return;const o=n.unproject([0,0]),s=n.unproject([n.width,n.height]),a=Math.min(o[0],s[0]),d=Math.max(o[0],s[0]),i=Math.min(o[1],s[1]),r=Math.max(o[1],s[1]);this.resources.viewUniforms.write(new Float32Array([a,d,i,r,(d-a)/n.width,(r-i)/n.height,oe,0]));const u=this.textLayer,c=u?.getSelectionPreparation(),h=c?.source??null;this.labelStatus=c?.status??this.labelStatus,h&&h.glyphRecords!==this.textSelection?.source.glyphRecords&&this.createTextSelection(h),u?.setCulledDraw(this.textSelection?{selectedGlyphRecords:this.textSelection.selectedGlyphRecords,drawCommands:this.textSelection.drawCommands}:null);const l=performance.now();this.resources.cullingCounts.write(new Uint32Array(2)),this.compiled?.encode(this.device.commandEncoder,{parameters:void 0}),this.encodeTimeMilliseconds=performance.now()-l,this.frameIndex++,this.frameIndex%30===0&&this.sampleStats()}cleanup(t){this.isFinalized||(this.isFinalized=!0,this.compiled?.destroy(),this.destroyTextSelection(),this.resources.blockDrawCommands.destroy(),this.resources.spans.destroy(),this.resources.visibleIds.destroy(),this.resources.rowFlags.destroy(),this.resources.cullingCounts.destroy(),this.resources.viewUniforms.destroy(),this.textLayer=null)}createTextSelection(t){this.destroyTextSelection();const n=t.recordWordLength*I;this.textSelection={source:t,selectedGlyphIds:this.device.createBuffer({id:"deck-gpu-trace-selected-glyph-ids",byteLength:Math.max(t.glyphCount*I,I),usage:_.STORAGE|_.COPY_SRC}),selectedGlyphRecords:this.device.createBuffer({id:"deck-gpu-trace-selected-glyph-records",byteLength:Math.max(t.glyphCount*n,n),usage:_.STORAGE|_.VERTEX|_.COPY_SRC}),drawCommands:new tt(this.device,{id:"deck-gpu-trace-label-draw",type:"draw",commands:[{vertexCount:6,instanceCount:0}]})},this.rebuildGraph()}rebuildGraph(){this.compiled?.destroy();const t=new Gt(this.device,{id:"deck-gpu-trace-graph"}),n=O(t,"spans",this.resources.spans),o=O(t,"visible-ids",this.resources.visibleIds),s=O(t,"row-flags",this.resources.rowFlags),a=O(t,"culling-counts",this.resources.cullingCounts),d=O(t,"view-uniforms",this.resources.viewUniforms),i=O(t,"block-draw-commands",this.resources.blockDrawCommands.buffer),r=t.createTransientBuffer({id:"source-ids",byteLength:this.count*I,usage:_.STORAGE}),u=t.createDataView(r,{format:"uint32",length:this.count}),c=t.createDataView(s,{format:"uint32",length:this.count}),h=t.createDataView(o,{format:"uint32",length:this.count}),l=t.createDataView(i,{format:"uint32",length:1,byteOffset:this.resources.blockDrawCommands.getInstanceCountByteOffset(0)});if(re(t,{count:this.count,spans:n,viewUniforms:d,sourceIds:u,rowFlags:c,cullingCounts:a}),t.add(new Tt({id:"visible-block-compaction",input:u,flags:c,output:h,count:l})),this.textSelection){const{source:g,selectedGlyphIds:p,selectedGlyphRecords:f,drawCommands:w}=this.textSelection,y=O(t,"glyph-records",g.glyphRecords),b=O(t,"selected-glyph-ids",p),T=O(t,"selected-glyph-records",f),m=O(t,"text-draw-commands",w.buffer),E=t.createDataView(y,{format:"uint32",length:g.glyphCount,byteOffset:I*2,byteStride:g.recordWordLength*I});t.add(new Kt({id:"visible-text-selection",glyphRows:E,rowFlags:c,output:t.createDataView(b,{format:"uint32",length:g.glyphCount}),count:t.createDataView(m,{format:"uint32",length:1,byteOffset:w.getInstanceCountByteOffset(0)}),sourceRecords:t.createDataView(y,{format:"uint32",length:g.glyphCount*g.recordWordLength}),outputRecords:t.createDataView(T,{format:"uint32",length:g.glyphCount*g.recordWordLength}),recordWordLength:g.recordWordLength}))}this.compiled=t.compile(),this.publishStats()}async sampleStats(){if(this.statsReadPending||this.isFinalized)return;this.statsReadPending=!0;const t=this.textSelection;try{const n=await this.resources.blockDrawCommands.buffer.readAsync(this.resources.blockDrawCommands.getInstanceCountByteOffset(0),I);if(this.isFinalized)return;this.visibleBlocks=new Uint32Array(n.buffer,n.byteOffset,1)[0];const o=await this.resources.cullingCounts.readAsync(0,I*2);if(this.isFinalized)return;const s=new Uint32Array(o.buffer,o.byteOffset,2);if(this.outsideBlocks=s[0],this.smallBlocks=s[1],t){const a=await t.drawCommands.buffer.readAsync(t.drawCommands.getInstanceCountByteOffset(0),I);this.textSelection===t&&(this.visibleGlyphs=new Uint32Array(a.buffer,a.byteOffset,1)[0])}this.isFinalized||this.publishStats()}catch{}finally{this.statsReadPending=!1}}publishStats(){const t=this.compiled?.stats;this.onStats?.({totalBlocks:this.count,visibleBlocks:this.visibleBlocks,outsideBlocks:this.outsideBlocks,smallBlocks:this.smallBlocks,totalGlyphs:this.textSelection?.source.glyphCount??0,visibleGlyphs:this.visibleGlyphs,encodeTimeMilliseconds:this.encodeTimeMilliseconds,graphNodeCount:t?.nodeOrder.length??0,logicalTransientBytes:t?.logicalTransientBytes??0,physicalTransientBytes:t?.physicalTransientBytes??0,transientReusePercentage:t?.reusePercentage??0,labelStatus:this.labelStatus})}destroyTextSelection(){this.textSelection&&(this.textSelection.selectedGlyphIds.destroy(),this.textSelection.selectedGlyphRecords.destroy(),this.textSelection.drawCommands.destroy(),this.textSelection=null)}}function O(e,t,n){return e.importBuffer({id:t,byteLength:n.byteLength,usage:n.usage},n)}function re(e,t){const n=`
struct TraceSpan { start: f32, duration: f32, lane: u32, group: u32 };
struct ViewUniforms {
  timeMin: f32,
  timeMax: f32,
  laneMin: f32,
  laneMax: f32,
  timeUnitsPerPixel: f32,
  laneUnitsPerPixel: f32,
  minimumBlockPixels: f32,
  padding: f32
};
struct CullingCounts { outside: atomic<u32>, tooSmall: atomic<u32> };
const SPAN_COUNT: u32 = ${t.count}u;
@group(0) @binding(0) var<storage, read> spans: array<TraceSpan>;
@group(0) @binding(1) var<uniform> viewUniforms: ViewUniforms;
@group(0) @binding(2) var<storage, read_write> sourceIds: array<u32>;
@group(0) @binding(3) var<storage, read_write> rowFlags: array<u32>;
@group(0) @binding(4) var<storage, read_write> cullingCounts: CullingCounts;
@compute @workgroup_size(256) fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  let rowIndex = globalId.x;
  if (rowIndex >= SPAN_COUNT) { return; }
  let span = spans[rowIndex];
  let timeVisible = span.start + span.duration >= viewUniforms.timeMin &&
    span.start <= viewUniforms.timeMax;
  let lane = f32(span.lane);
  let laneVisible = lane + 1.0 >= viewUniforms.laneMin && lane <= viewUniforms.laneMax;
  let largeEnough = span.duration >=
      viewUniforms.timeUnitsPerPixel * viewUniforms.minimumBlockPixels &&
    1.0 >= viewUniforms.laneUnitsPerPixel * viewUniforms.minimumBlockPixels;
  let insideView = timeVisible && laneVisible;
  if (!insideView) {
    atomicAdd(&cullingCounts.outside, 1u);
  } else if (!largeEnough) {
    atomicAdd(&cullingCounts.tooSmall, 1u);
  }
  sourceIds[rowIndex] = rowIndex;
  rowFlags[rowIndex] = select(0u, 1u, insideView && largeEnough);
}`;e.addComputePass({id:"trace-visibility",resources:[{buffer:t.spans,usage:"storage-read"},{buffer:t.viewUniforms,usage:"uniform"},{buffer:t.sourceIds,usage:"storage-write"},{buffer:t.rowFlags,usage:"storage-write"},{buffer:t.cullingCounts,usage:"storage-write"}],compile:({device:o})=>{const s=new Bt(o,{id:"trace-visibility",source:n,shaderLayout:{bindings:[{name:"spans",type:"storage",group:0,location:0},{name:"viewUniforms",type:"uniform",group:0,location:1},{name:"sourceIds",type:"storage",group:0,location:2},{name:"rowFlags",type:"storage",group:0,location:3},{name:"cullingCounts",type:"storage",group:0,location:4}]}});return{encode:({computePass:a,getBuffer:d})=>{s.setBindings({spans:d(t.spans),viewUniforms:d(t.viewUniforms),sourceIds:d(t.sourceIds),rowFlags:d(t.rowFlags),cullingCounts:d(t.cullingCounts)}),s.dispatch(a,Math.ceil(t.count/256))},destroy:()=>s.destroy()}}})}const ae=8,ie=4,ue=1e3,ce=25e4,B=["compute","network","storage"],bt=16,_t=4,q=4,K=bt*_t,M=K*q,x=ae,R=ie,rt=9,at=8,le=4,de=256,it=6,ge=256,Ct=128,he=64*1024*1024,fe=4,ut=0,ct=1,pe=1,me=8,we=16,ye=256,Ee=512,Te=1024,xe=2048,be=1,_e=.25,D=4294967295,Ce=Math.ceil(ce/M),j=ue/Ce,Ie=73,Re=.9,Se=24,Ae=8,lt=6,Oe=4093,Ue=120,ve=180;function Ne(e){if(!Number.isSafeInteger(e)||e<0||e>4294967295)throw new RangeError("Trace span count must be a nonnegative uint32");return Math.max(Math.ceil(e/M),1)*j}function Pe(e,t=4294967295,n){if(!Number.isSafeInteger(e)||e<0||e>4294967295)throw new RangeError("Trace span count must be a nonnegative uint32");if(!Number.isSafeInteger(t)||t<0||t>4294967295)throw new RangeError("Trace dependency count must be a nonnegative uint32");const o=new Uint32Array(e*x),s=new Float32Array(o.buffer),a=[],d=Math.floor(e/B.length),i=e%B.length;let r=0;for(const[C,A]of B.entries()){const U=d+ +(C<i);a.push({name:A,groupIndex:C,count:U,firstSpanIndex:r,data:o.subarray(r*x,(r+U)*x)}),r+=U}const u=Be(o,s,a,e),c=$e(o,e,t),h=c.dependencies.length/R,{spanBatches:l,spanBatchIndex:g}=Fe(o,a),p=Le(l),f=new Uint32Array(e),w=new Uint32Array(e),{dependencyBatches:y,dependencyBatchIndex:b}=Me(o,c.dependencies,c.parentSpans,Ct,new Float32Array(f.buffer),new Float32Array(w.buffer)),T=ke(c.dependencies,y,he),m=We(c.dependencies,e,f,w);return{spans:o,groups:a,spanBatches:l,spanBatchIndex:g,temporalIndex:p,dependencies:c.dependencies,dependencyBatches:y,dependencyChunks:T,dependencyBatchIndex:b,parentSpans:c.parentSpans,outgoing:m.outgoing,incoming:m.incoming,duration:Math.max(Ne(e),u),spanCount:e,dependencyCount:h,processCount:bt,threadCount:K}}function Me(e,t,n,o,s,a){if(!Number.isSafeInteger(o)||o<1)throw new RangeError("Trace dependency batch capacity must be a positive safe integer");const d=e.length/x,i=t.length/R,r=new Float32Array(e.buffer,e.byteOffset,e.length);if(s.length<d||a.length<d)throw new RangeError("Trace dependency scratch storage is smaller than the span count");for(let l=0;l<d;l++){const g=l*x,p=r[g],f=p+r[g+1],w=n[l];s[l]=w===D?p:Math.min(p,s[w]),a[l]=w===D?f:Math.max(f,a[w])}const u=[];for(let l=0;l<i;l+=o){const g=Math.min(o,i-l);let p=Number.POSITIVE_INFINITY,f=Number.NEGATIVE_INFINITY,w=0;for(let y=0;y<g;y++){const b=(l+y)*R,T=t[b],m=t[b+1];p=Math.min(p,s[T],s[m]),f=Math.max(f,a[T],a[m]),w|=1<<t[b+2]}u.push({batchIndex:u.length,count:g,firstDependencyIndex:l,timeMin:p,timeMax:f,familyMask:w})}const c=new Uint32Array(u.length*it),h=new Float32Array(c.buffer);for(const l of u){const g=l.batchIndex*it;c[g]=l.firstDependencyIndex,c[g+1]=l.count,h[g+2]=l.timeMin,h[g+3]=l.timeMax,c[g+4]=l.familyMask,c[g+5]=l.batchIndex}return{dependencyBatches:u,dependencyBatchIndex:c}}function Fe(e,t,n=ge){if(!Number.isSafeInteger(n)||n<1)throw new RangeError("Trace span batch capacity must be a positive safe integer");const o=new Float32Array(e.buffer,e.byteOffset,e.length),s=[];for(const i of t)for(let r=0;r<i.count;r+=n){const u=Math.min(n,i.count-r),c=i.firstSpanIndex+r;let h=Number.POSITIVE_INFINITY,l=Number.NEGATIVE_INFINITY,g=M,p=0,f=0;for(let w=0;w<u;w++){const y=(c+w)*x,b=o[y],T=o[y+1],m=b+T,E=e[y+2];h=Math.min(h,b),l=Math.max(l,m),g=Math.min(g,E),p=Math.max(p,E+1),f=Math.max(f,T)}s.push({batchIndex:s.length,groupIndex:i.groupIndex,name:i.name,count:u,firstSpanIndex:c,timeMin:h,timeMax:l,laneMin:g,laneMax:p,maximumDuration:f,data:e.subarray(c*x,(c+u)*x)})}const a=new Uint32Array(s.length*rt),d=new Float32Array(a.buffer);for(const i of s){const r=i.batchIndex*rt;a[r]=i.firstSpanIndex,a[r+1]=i.count,d[r+2]=i.timeMin,d[r+3]=i.timeMax,a[r+4]=i.laneMin,a[r+5]=i.laneMax,a[r+6]=i.groupIndex,a[r+7]=i.batchIndex,d[r+8]=i.maximumDuration}return{spanBatches:s,spanBatchIndex:a}}function Le(e,t=le,n=de){return De(e,t,n)}function De(e,t,n,o){if(!Number.isSafeInteger(t)||t<2)throw new RangeError("Trace temporal index fanout must be at least two");if(!Number.isSafeInteger(n)||n<t)throw new RangeError("Trace temporal index maximum batch count must cover one fanout");let s=e.map(u=>({timeMin:Math.fround(u.timeMin),timeMax:Math.fround(u.timeMax),maximumDuration:Math.fround(u.maximumDuration),groupIndex:u.groupIndex,firstBatchIndex:u.batchIndex,batchCount:1,laneMin:u.laneMin,laneMax:u.laneMax}));const a=[],d=[];for(;s.length>0;){const u=[];let c=0;for(;c<s.length;){const l=s[c];let g=1,p=l.batchCount;for(;c+g<s.length&&g<t;){const m=s[c+g];if(m.groupIndex!==l.groupIndex||Math.floor(m.firstBatchIndex/n)!==Math.floor(l.firstBatchIndex/n)||p+m.batchCount>n)break;p+=m.batchCount,g++}let f=l.timeMin,w=l.timeMax,y=l.maximumDuration,b=l.laneMin,T=l.laneMax;for(let m=1;m<g;m++){const E=s[c+m];f=Math.min(f,E.timeMin),w=Math.max(w,E.timeMax),y=Math.max(y,E.maximumDuration),b=Math.min(b,E.laneMin),T=Math.max(T,E.laneMax)}u.push({timeMin:f,timeMax:w,maximumDuration:y,groupIndex:l.groupIndex,firstBatchIndex:l.firstBatchIndex,batchCount:p,laneMin:b,laneMax:T}),c+=g}if(u.length>=s.length)break;const h=a.length;a.push(...u),d.push({firstNodeIndex:h,nodeCount:u.length,maximumBatchCount:Math.max(...u.map(l=>l.batchCount)),averageTimeSpan:u.reduce((l,g)=>l+g.timeMax-g.timeMin,0)/u.length}),s=u}const i=new Uint32Array(a.length*at),r=new Float32Array(i.buffer);for(const[u,c]of a.entries()){const h=u*at;r[h]=Number.POSITIVE_INFINITY,r[h+1]=Number.NEGATIVE_INFINITY,r[h+2]=0,i[h+3]=c.groupIndex,i[h+4]=c.firstBatchIndex,i[h+5]=c.batchCount,i[h+6]=4294967295,i[h+7]=0}return{data:i,levels:d,partitionBatchCount:n,partitionCount:Math.ceil(e.length/n)}}function ke(e,t,n){const o=R*Uint32Array.BYTES_PER_ELEMENT,s=Math.floor(n/o);if(s<Ct)throw new RangeError;const a=[];let d=0;for(;d<t.length;){const i=t[d];let r=0,u=0;for(;d+r<t.length;){const h=t[d+r];if(r>0&&u+h.count>s)break;u+=h.count,r++}const c=i.firstDependencyIndex;a.push({chunkIndex:a.length,firstDependencyIndex:c,dependencyCount:u,firstBatchIndex:d,batchCount:r,data:e.subarray(c*R,(c+u)*R)}),d+=r}return a}function Ge(e){return Pe(e).groups}function Be(e,t,n,o){let s=2654435769;const a=()=>(s^=s<<13,s^=s>>>17,s^=s<<5,(s>>>0)/4294967296),d=new Float64Array(M),i=new Uint32Array(n.length);let r=0;for(let u=0;u<o;u++){const c=Math.floor(u/M),h=(u+c*Ie)%M,l=Math.floor(h/q),g=Math.floor(l/_t),p=Math.floor(c/Se),f=h%q,w=(g+f)%n.length,y=p%Ae,b=y<lt?w:(w+y-lt+1)%n.length;let T=b;for(let Y=0;Y<n.length;Y++){const H=(b+Y)%n.length;if(i[H]<n[H].count){T=H;break}}const m=i[T]++,E=n[T].firstSpanIndex+m,C=E*x,A=(.02+a()*.04)*j,U=a(),L=a(),Rt=(u+1)%Oe===0?Ue+L*ve:U<.58?.04+L*.21:U<.89?.35+L*.85:U<.98?1.5+L*4:10+L*20,Z=d[h]+A,Q=Rt*Re*j,J=Z+Q;d[h]=J,r=Math.max(r,J);const St=Math.floor(a()*fe),At=E%11===0?ye:0,Ot=E%37===0?Ee:0;t[C]=Z,t[C+1]=Q,e[C+2]=h,e[C+3]=T,e[C+4]=g,e[C+5]=l,e[C+6]=E,e[C+7]=St|At|Ot}return r}function $e(e,t,n){const o=t,s=Math.min(n,o),a=new Uint32Array(s*R),d=new Float32Array(e.buffer,e.byteOffset,e.length),i=new Uint32Array(K);i.fill(D);const r=new Uint32Array(t);r.fill(D);let u=0;for(let c=0;c<t;c++){const h=c*x,l=e[h+5],g=i[l];if(u<s&&c%5===0&&g!==D&&(X(a,e,u++,g,c,ut),r[c]=g,Ve(e,d,g,c)),u<s&&c>7&&c%29===0){const p=e[h+4];let f=c-7;for(;f>0&&e[f*x+4]===p;)f--;e[f*x+4]!==p&&(X(a,e,u++,f,c,ct),r[c]=f)}i[l]=c}for(let c=0;u<s;c++,u++){const h=1+c*73%(t-1),l=Math.min(h,M*2),g=1+c*17%l;let p=h-g;const f=h*x;let w=p*x;for(;p>0&&e[w+4]===e[f+4]&&e[w+5]!==e[f+5];)p--,w-=x;const y=e[w+5]===e[f+5]?ut:ct;X(a,e,u,p,h,y)}return{dependencies:a.subarray(0,u*R),parentSpans:r}}function Ve(e,t,n,o){const s=n*x,a=o*x,d=t[s],i=t[s+1],r=t[a],u=t[a+1];u<=be&&r>=d&&r+u<=d+i&&(e[a+7]|=Te),Math.abs(i-u)<=Math.max(i,u)*_e&&(e[s+7]|=xe)}function X(e,t,n,o,s,a){const d=n*R;e[d]=o,e[d+1]=s,e[d+2]=a;const i=t[o*x+4],r=t[s*x+4];e[d+3]=pe|i<<me|r<<we}function We(e,t,n=new Uint32Array(t),o=new Uint32Array(t)){const s=e.length/R;if(n.length<t||o.length<t)throw new RangeError("Trace adjacency scratch storage is smaller than the span count");n.fill(0),o.fill(0);for(let i=0;i<s;i++){const r=i*R;n[e[r]]++,o[e[r+1]]++}const a=dt(n,s),d=dt(o,s);for(let i=0;i<s;i++){const r=i*R,u=e[r],c=e[r+1];a.neighbors[n[u]++]=c,d.neighbors[o[c]++]=u}return{outgoing:a,incoming:d}}function dt(e,t){let n=0;for(const r of e)n+=+(r>0);const o=new Uint32Array(n),s=new Uint32Array(n+1),a=new Uint32Array(t);let d=0,i=0;for(let r=0;r<e.length;r++){const u=e[r];u!==0&&(o[d]=r,s[d]=i,e[r]=i,i+=u,d++)}return s[n]=i,{nodes:o,offsets:s,neighbors:a}}function Ye(e){const t=Ge(e),n=new Uint32Array(e*4),o=new Float32Array(e*2),s=new Float32Array(e*4),a=new Array(e),d=new Float32Array(n.buffer);let i=0;for(const r of t){const u=new Float32Array(r.data.buffer,r.data.byteOffset,r.data.length);for(let c=0;c<r.count;c++,i++){const h=c*x,l=i*4,g=u[h],p=u[h+1],f=r.data[h+2];d[l]=g,d[l+1]=p,n[l+2]=f,n[l+3]=r.groupIndex,o[i*2]=g,o[i*2+1]=f+.5,s[l]=0,s[l+1]=-.5,s[l+2]=p,s[l+3]=1,a[i]=ze(r.name,i)}}return{count:e,spans:n,names:a,textTable:new Wt({positions:nt(new ot,2,o),texts:Yt(a,new Ht),clipRects:nt(new ot,4,s)})}}function He(e,t){if(t<0||t>=e.count)return null;const n=t*4,o=new Float32Array(e.spans.buffer,e.spans.byteOffset,e.spans.length);return{name:e.names[t],group:B[e.spans[n+3]],start:o[n],duration:o[n+1],lane:e.spans[n+2]}}function ze(e,t){return`${e} ${e==="compute"?"μtask":e==="network"?"café":"parse"}-${String(t).padStart(6,"0")}`}class Xe{panelManager;traceData;statsElement=null;cullingStats;constructor(t,n){this.traceData=t,this.cullingStats=n,this.panelManager=new $t({descriptionHtml:'<p style="margin:0;line-height:1.45">One WebGPU command graph culls trace blocks and row-indexed Arrow glyph records before deck.gl draws both layers indirectly.</p>',settingsPanel:()=>Vt({id:"gpu-culled-trace-culling",title:"Culling",html:"<div data-gpu-trace-culling-stats></div>",onRender:o=>(this.statsElement=o.querySelector("[data-gpu-trace-culling-stats]"),gt(this.statsElement,this.cullingStats),()=>{this.statsElement=null})})}),this.panelManager.setTableEntries([{id:"gpu-trace-text",label:"Trace text",kind:"source",table:t.textTable}])}mount(){this.panelManager.mount()}finalize(){this.panelManager.finalize()}updateCullingStats(t){this.cullingStats=t,gt(this.statsElement,t)}getTooltip(t){const n=He(this.traceData,t.index);return n?{html:`<div><strong>${It(n.name)}</strong></div>
        <div>group: ${n.group}</div>
        <div>start: ${n.start.toFixed(3)}</div>
        <div>duration: ${n.duration.toFixed(3)}</div>
        <div>lane: ${n.lane}</div>`}:null}}function gt(e,t){if(!e)return;const n=t.totalGlyphs?`${F(t.visibleGlyphs)} / ${F(t.totalGlyphs)}`:It(t.labelStatus);e.innerHTML=`<div style="display:grid;grid-template-columns:1fr auto;gap:5px 16px;font:12px/1.45 system-ui,sans-serif;font-variant-numeric:tabular-nums">
    <span>Visible blocks</span><strong>${F(t.visibleBlocks)} / ${F(t.totalBlocks)}</strong>
    <span>Outside view</span><strong>${F(t.outsideBlocks)}</strong>
    <span>Too small (&lt;1 px)</span><strong>${F(t.smallBlocks)}</strong>
    <span>Visible glyphs</span><strong>${n}</strong>
    <span>Graph nodes</span><strong>${t.graphNodeCount}</strong>
    <span>CPU graph encode</span><strong>${t.encodeTimeMilliseconds.toFixed(2)} ms</strong>
    <span>Logical scratch</span><strong>${ht(t.logicalTransientBytes)}</strong>
    <span>Physical scratch</span><strong>${ht(t.physicalTransientBytes)}</strong>
    <span>Transient reuse</span><strong>${t.transientReusePercentage.toFixed(0)}%</strong>
  </div>`}function It(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}function F(e){return new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(e)}function ht(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KiB`:`${(e/1024/1024).toFixed(1)} MiB`}const qe=25e3,je=72;let ft;function Ke(e,t={}){const n=Ye(qe);let o=null,s=0,a=0,d=!0,i={target:[150,je/2,0],zoom:0},r={totalBlocks:n.count,visibleBlocks:0,outsideBlocks:0,smallBlocks:0,totalGlyphs:0,visibleGlyphs:0,encodeTimeMilliseconds:0,graphNodeCount:0,logicalTransientBytes:0,physicalTransientBytes:0,transientReusePercentage:0,labelStatus:"Waiting for label layer"};const u=new Xe(n,r);u.mount();let c;c=new Pt({parent:e,...vt({...t,deviceType:"webgpu"}),views:new Nt({id:"main"}),viewState:i,controller:{dragPan:!0,scrollZoom:{smooth:!0,speed:.02},doubleClickZoom:!0,touchZoom:!0},layers:[],effects:[],getTooltip:l=>u.getTooltip(l),onViewStateChange:({viewState:l})=>{i=l,d=!1,c.setProps({viewState:i})},onLoad:({deck:l,device:g})=>{if(g.type!=="webgpu")throw new Error("GPU-culled deck trace requires WebGPU");o=new se(g,n,{onStats:w=>{r=w,u.updateCullingStats(w)}});const p=o.resources,f=new te({id:"gpu-culled-trace-labels",data:n.textTable,pickable:!0,fontAtlas:Ze(),model:"storage-row-indexed",positions:"positions",texts:"texts",clipRects:"clipRects",angles:null,sizes:null,pixelOffsets:null,textAnchors:null,alignmentBaselines:null,color:[245,248,255,255],size:24,pixelOffset:[2,0],textAnchor:"start",alignmentBaseline:"center",contentAlignHorizontal:"start",contentAlignVertical:"none",contentCutoffPixels:[0,0],onDataError:w=>o?.setLabelError(w)});o.setTextLayer(f),l.setProps({effects:[o],layers:[new ne({id:"gpu-culled-trace-blocks",data:[],pickable:!0,spans:p.spans,visibleIds:p.visibleIds,viewUniforms:p.viewUniforms,drawCommands:p.blockDrawCommands}),f]})},onFinalize:()=>{cancelAnimationFrame(s),u.finalize()}});const h=l=>{const g=o&&r.totalGlyphs===0;o&&(d||g)&&l-a>=1e3/30&&(a=l,d&&(i={...i,target:[150+l*.025%1e3,i.target[1],0]},c.setProps({viewState:i})),c.redraw("trace animation")),s=requestAnimationFrame(h)};return s=requestAnimationFrame(h),c}function Ze(){return ft??=Ft({characterSet:" abcdefghijklmnopqrstuvwxyz0123456789-μé",fontFamily:"Monaco, Menlo, monospace",fontWeight:"600",fontSize:48,buffer:5,radius:10}),ft}Ke(void 0,{deviceType:"webgpu"});
