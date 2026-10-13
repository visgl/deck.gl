import{M as ft,L as Rt,B as _,C as It,b as St}from"./deck-example-device-TQPRJnZ6.js";import{O as At}from"./orthographic-view-CoMX3VNX.js";import{A as Ot}from"./arrow-deck-Djc-ZCtY.js";import{A as Ut,b as vt}from"./arrow-text-layer-CBOHQ_Hq.js";import{D as tt}from"./draw-command-buffer-CJ3rL-V0.js";import{e as pt,o as j,s as Nt,f as z,i as Pt,k as Mt,p as D,K as k,g as U,b as v,q as Ft,l as Lt,m as Dt,G as kt}from"./gpu-scan-BtfiiIEk.js";import{T as Gt,F as et,Z as Bt,af as $t,ad as Wt,ac as Vt}from"./arrow-example-panels-fMfN3W7u.js";import{m as nt}from"./arrow-fixed-size-list-CYN_Mtwc.js";import"./project32-Byi-VnKS.js";import"./arrow-picking-CbYfFBev.js";import"./dynamic-texture-NQQfRyls.js";const B=256;class mt{id;input;flags;output;count;constructor(t){if(this.id=t.id??"gpu-compaction",this.input=t.input,this.flags=t.flags,this.output=t.output,this.count=t.count,Y(this.input,`${this.id} input`),Y(this.flags,`${this.id} flags`),Y(this.output,`${this.id} output`),pt(this.count,`${this.id} count`),this.flags.length!==this.input.length)throw new Error(`${this.id} flags.length must equal input.length`);if(this.output.length<this.input.length)throw new Error(`${this.id} output must contain at least input.length rows`);if(this.count.length<1)throw new Error(`${this.id} count must contain one uint32 row`)}getCommandNodes(t){const n=[];return n.push(...Yt(this,t,t.device.limits.maxComputeWorkgroupsPerDimension)),n}}function Yt(e,t,n){const o=[];for(const d of[...F(e.input),...F(e.flags),...F(e.output),e.count])if(d.buffer.graph!==t)throw new Error(`${e.id} views must belong to the target graph`);if(e.input.length===0)return o.push(...Ht(t,e.id,e.count)),o;const s=e.flags instanceof j?Nt(t,`${e.id}-offsets`,e.flags):z(t,`${e.id}-offsets`,"uint32",e.flags.length),r=new Pt({id:`${e.id}-scan`,input:e.flags,output:s});return o.push(...Mt(r,t,n)),o.push(...zt(t,e.id,e.input,e.flags,s,e.output,e.count,n)),o}function Ht(e,t,n){const o=[],s=`${t}-clear-count`;return o.push(D({id:s,resources:[{buffer:n,usage:"storage-write"}],compile:({device:r})=>{const d=new k(r,{id:s,source:`const COUNT_OFFSET: u32 = ${U(n)}u;
@group(0) @binding(0) var<storage, read_write> outputCount: array<u32>;
@compute @workgroup_size(1) fn main() { outputCount[COUNT_OFFSET] = 0u; }`,shaderLayout:{bindings:[{name:"outputCount",type:"storage",group:0,location:0}]}});return{encode:({computePass:i,getBuffer:a})=>{d.dispatch(i,{bindings:{outputCount:v(n,a)},x:1})},destroy:()=>d.destroy()}}})),o}function zt(e,t,n,o,s,r,d,i){const a=[],c=Ft(e,[n,o,s]),u=c.map(m=>m[0]),h=c.map(m=>m[1]),l=c.map(m=>m[2]),g=F(r),p=u.map((m,E)=>m.length>0?E:-1).filter(m=>m>=0),f=g.map((m,E)=>m.length>0?E:-1).filter(m=>m>=0),w=p[p.length-1],y=f[f.length-1],b=c.length>1||r instanceof j;let T=0;for(let m=0;m<g.length;m++){const E=g[m],C=T+E.length;if(E.length>0)for(const S of p){const O=S===w&&m===y;a.push(...Xt(e,{id:b?`${t}-scatter-input-${S}-output-${m}`:`${t}-scatter`,input:u[S],flags:h[S],offsets:l[S],output:E,outputStart:T,outputEnd:C,count:O?d:void 0,dispatchLayout:Lt("GPUCompaction",u[S].length,B,i)}))}T=C}return a}function Xt(e,t){const n=[],o=t.count?"@group(0) @binding(4) var<storage, read_write> outputCount: array<u32>;":"",s=t.count?`if (index == ELEMENT_COUNT - 1u) {
    outputCount[COUNT_OFFSET] = outputIndex + flag;
  }`:"",r=`
const ELEMENT_COUNT: u32 = ${t.input.length}u;
const INPUT_OFFSET: u32 = ${U(t.input)}u;
const FLAGS_OFFSET: u32 = ${U(t.flags)}u;
const OFFSETS_OFFSET: u32 = ${U(t.offsets)}u;
const OUTPUT_OFFSET: u32 = ${U(t.output)}u;
const OUTPUT_START: u32 = ${t.outputStart}u;
const OUTPUT_END: u32 = ${t.outputEnd}u;
${t.count?`const COUNT_OFFSET: u32 = ${U(t.count)}u;`:""}
@group(0) @binding(0) var<storage, read> inputValues: array<u32>;
@group(0) @binding(1) var<storage, read> flags: array<u32>;
@group(0) @binding(2) var<storage, read> offsets: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputValues: array<u32>;
${o}

@compute @workgroup_size(${B}) fn main(
  @builtin(local_invocation_index) localInvocationIndex: u32,
  @builtin(workgroup_id) workgroupId: vec3<u32>
) {
  ${Dt(t.dispatchLayout,B)}
  if (index >= ELEMENT_COUNT) { return; }
  let flag = min(flags[FLAGS_OFFSET + index], 1u);
  let outputIndex = offsets[OFFSETS_OFFSET + index];
  if (flag != 0u && outputIndex >= OUTPUT_START && outputIndex < OUTPUT_END) {
    outputValues[OUTPUT_OFFSET + outputIndex - OUTPUT_START] = inputValues[INPUT_OFFSET + index];
  }
  ${s}
}`;return n.push(...qt(e,{id:t.id,source:r,resources:[{buffer:t.input,usage:"storage-read"},{buffer:t.flags,usage:"storage-read"},{buffer:t.offsets,usage:"storage-read"},{buffer:t.output,usage:"storage-write"},...t.count?[{buffer:t.count,usage:"storage-write"}]:[]],bindings:{inputValues:t.input,flags:t.flags,offsets:t.offsets,outputValues:t.output,...t.count?{outputCount:t.count}:{}},dispatchLayout:t.dispatchLayout})),n}function qt(e,t){const n=[];return n.push(D({id:t.id,workload:{operation:"GPUCompaction",commandCount:1,maximumWorkgroupCount:t.dispatchLayout.x*t.dispatchLayout.y*t.dispatchLayout.z,maximumInvocationCount:t.dispatchLayout.x*t.dispatchLayout.y*t.dispatchLayout.z*B,readByteLength:t.resources.reduce((o,s)=>o+(s.usage==="storage-read"||s.usage==="storage-read-write"?s.buffer.length*s.buffer.rowByteLength:0),0),writeByteLength:t.resources.reduce((o,s)=>o+(s.usage==="storage-write"||s.usage==="storage-read-write"?s.buffer.length*s.buffer.rowByteLength:0),0)},resources:t.resources,compile:({device:o})=>{const s=new k(o,{id:t.id,source:t.source,shaderLayout:{bindings:Object.keys(t.bindings).map((r,d)=>({name:r,type:"storage",group:0,location:d}))}});return{encode:({computePass:r,getBuffer:d})=>{const i={};for(const[a,c]of Object.entries(t.bindings))i[a]=v(c,d);s.dispatch(r,{bindings:i,x:t.dispatchLayout.x,y:t.dispatchLayout.y,z:t.dispatchLayout.z})},destroy:()=>s.destroy()}}})),n}function F(e){return e instanceof j?e.data:[e]}function Y(e,t){for(const n of F(e))pt(n,t)}const $=256;class jt{id;glyphRows;rowFlags;output;count;sourceRecords;outputRecords;recordWordLength;constructor(t){if(this.id=t.id??"gpu-text-selection",this.glyphRows=t.glyphRows,this.rowFlags=t.rowFlags,this.output=t.output,this.count=t.count,this.sourceRecords=t.sourceRecords,this.outputRecords=t.outputRecords,this.output.length<this.glyphRows.length)throw new Error(`${this.id} output must contain at least glyphRows.length rows`);if(this.count.length<1)throw new Error(`${this.id} count must contain one uint32 row`);if(!!this.sourceRecords!=!!this.outputRecords)throw new Error(`${this.id} sourceRecords and outputRecords must be supplied together`);const n=this.sourceRecords&&this.glyphRows.length>0?this.sourceRecords.length/this.glyphRows.length:0;if(this.recordWordLength=t.recordWordLength??n,this.sourceRecords){if(!Number.isSafeInteger(this.recordWordLength)||this.recordWordLength<1)throw new Error(`${this.id} recordWordLength must be a positive integer`);const o=this.glyphRows.length*this.recordWordLength;if(this.sourceRecords.length<o||this.outputRecords.length<o)throw new Error(`${this.id} record buffers are smaller than the glyph record stream`);if(this.sourceRecords.byteStride!==Uint32Array.BYTES_PER_ELEMENT||this.outputRecords.byteStride!==Uint32Array.BYTES_PER_ELEMENT)throw new Error(`${this.id} record buffers must be packed uint32 words`)}}getCommandNodes(t){const n=[];for(const r of[this.glyphRows,this.rowFlags,this.output,this.count,this.sourceRecords,this.outputRecords])if(r){if(r.buffer.graph!==t)throw new Error(`${this.id} views must belong to the target graph`);if(r.format!=="uint32")throw new Error(`${this.id} views must use uint32 format`)}if(this.glyphRows.length===0)return n.push(...Jt(t,this.id,this.count)),n;const o=z(t,`${this.id}-glyph-ids`,"uint32",this.glyphRows.length),s=z(t,`${this.id}-glyph-flags`,"uint32",this.glyphRows.length);return n.push(...Zt(t,this,o,s)),n.push(...new mt({id:`${this.id}-compaction`,input:o,flags:s,output:this.output,count:this.count}).getCommandNodes(t)),this.sourceRecords&&this.outputRecords&&n.push(...Kt(t,this)),n}}function Kt(e,t){const n=[],o=t.sourceRecords,s=t.outputRecords,r=`${t.id}-gather-records`,d=o.byteOffset/Uint32Array.BYTES_PER_ELEMENT,i=s.byteOffset/Uint32Array.BYTES_PER_ELEMENT,a=t.output.byteOffset/Uint32Array.BYTES_PER_ELEMENT,c=t.count.byteOffset/Uint32Array.BYTES_PER_ELEMENT,u=t.output.byteStride/Uint32Array.BYTES_PER_ELEMENT,h=`
const GLYPH_COUNT: u32 = ${t.glyphRows.length}u;
const RECORD_WORD_LENGTH: u32 = ${t.recordWordLength}u;
const SOURCE_OFFSET: u32 = ${d}u;
const OUTPUT_OFFSET: u32 = ${i}u;
const SELECTED_OFFSET: u32 = ${a}u;
const SELECTED_STRIDE: u32 = ${u}u;
const COUNT_OFFSET: u32 = ${c}u;
@group(0) @binding(0) var<storage, read> sourceRecords: array<u32>;
@group(0) @binding(1) var<storage, read> selectedGlyphIds: array<u32>;
@group(0) @binding(2) var<storage, read> selectedCount: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputRecords: array<u32>;

@compute @workgroup_size(${$}) fn main(
  @builtin(global_invocation_id) globalId: vec3<u32>
) {
  let selectedIndex = globalId.x;
  if (selectedIndex >= GLYPH_COUNT || selectedIndex >= selectedCount[COUNT_OFFSET]) { return; }
  let sourceIndex = selectedGlyphIds[SELECTED_OFFSET + selectedIndex * SELECTED_STRIDE];
  for (var wordIndex = 0u; wordIndex < RECORD_WORD_LENGTH; wordIndex++) {
    outputRecords[OUTPUT_OFFSET + selectedIndex * RECORD_WORD_LENGTH + wordIndex] =
      sourceRecords[SOURCE_OFFSET + sourceIndex * RECORD_WORD_LENGTH + wordIndex];
  }
}`;return n.push(D({id:r,resources:[{buffer:o,usage:"storage-read"},{buffer:t.output,usage:"storage-read"},{buffer:t.count,usage:"storage-read"},{buffer:s,usage:"storage-write"}],compile:({device:l})=>{const g=new k(l,{id:r,source:h,shaderLayout:{bindings:[{name:"sourceRecords",type:"storage",group:0,location:0},{name:"selectedGlyphIds",type:"storage",group:0,location:1},{name:"selectedCount",type:"storage",group:0,location:2},{name:"outputRecords",type:"storage",group:0,location:3}]}});return{encode:({computePass:p,getBuffer:f})=>{g.dispatch(p,{bindings:{sourceRecords:f(o),selectedGlyphIds:f(t.output),selectedCount:f(t.count),outputRecords:f(s)},x:Math.ceil(t.glyphRows.length/$)})},destroy:()=>g.destroy()}}})),n}function Zt(e,t,n,o){const s=[],r=`${t.id}-visibility`,d=`
const GLYPH_COUNT: u32 = ${t.glyphRows.length}u;
const ROW_COUNT: u32 = ${t.rowFlags.length}u;
const GLYPH_ROW_OFFSET: u32 = ${U(t.glyphRows)}u;
const GLYPH_ROW_STRIDE: u32 = ${t.glyphRows.byteStride/Uint32Array.BYTES_PER_ELEMENT}u;
const ROW_FLAG_OFFSET: u32 = ${U(t.rowFlags)}u;
const ROW_FLAG_STRIDE: u32 = ${t.rowFlags.byteStride/Uint32Array.BYTES_PER_ELEMENT}u;
@group(0) @binding(0) var<storage, read> glyphRows: array<u32>;
@group(0) @binding(1) var<storage, read> rowFlags: array<u32>;
@group(0) @binding(2) var<storage, read_write> glyphIds: array<u32>;
@group(0) @binding(3) var<storage, read_write> glyphFlags: array<u32>;

@compute @workgroup_size(${$}) fn main(
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
}`;return s.push(D({id:r,resources:[{buffer:t.glyphRows,usage:"storage-read"},{buffer:t.rowFlags,usage:"storage-read"},{buffer:n,usage:"storage-write"},{buffer:o,usage:"storage-write"}],compile:({device:i})=>{const a=new k(i,{id:r,source:d,shaderLayout:{bindings:[{name:"glyphRows",type:"storage",group:0,location:0},{name:"rowFlags",type:"storage",group:0,location:1},{name:"glyphIds",type:"storage",group:0,location:2},{name:"glyphFlags",type:"storage",group:0,location:3}]}});return{encode:({computePass:c,getBuffer:u})=>{a.dispatch(c,{bindings:{glyphRows:v(t.glyphRows,u),rowFlags:v(t.rowFlags,u),glyphIds:v(n,u),glyphFlags:v(o,u)},x:Math.ceil(t.glyphRows.length/$)})},destroy:()=>a.destroy()}}})),s}function Jt(e,t,n){const o=[];return o.push(D({id:`${t}-clear-count`,resources:[{buffer:n,usage:"storage-write"}],compile:({device:s})=>{const r=new k(s,{id:`${t}-clear-count`,source:`const COUNT_OFFSET: u32 = ${U(n)}u;
@group(0) @binding(0) var<storage, read_write> count: array<u32>;
@compute @workgroup_size(1) fn main() { count[COUNT_OFFSET] = 0u; }`,shaderLayout:{bindings:[{name:"count",type:"storage",group:0,location:0}]}});return{encode:({computePass:d,getBuffer:i})=>{const a={count:v(n,i)};r.dispatch(d,{bindings:a,x:1})},destroy:()=>r.destroy()}}})),o}class Qt extends Ut{static layerName="GPUCulledArrowTextLayer";culledDraw=null;setCulledDraw(t){this.culledDraw=t}getSelectionPreparation(){const t=this.getRendererOrNull();if(!t)return{source:null,status:"Preparing Arrow text renderer"};if(t.resolvedModel!=="storage-row-indexed")return{source:null,status:`GPU row-indexed text unavailable (resolved ${t.resolvedModel})`};const n=t.model,o=n.storageState.renderBatches[0];return o?n.storageState.renderBatches.length!==1?{source:null,status:"Multiple text batches are not supported by this example"}:{source:{glyphRecords:o.compactGlyphVertexData,glyphCount:o.glyphCount,recordWordLength:3},status:"Ready"}:{source:null,status:"Expanding Arrow glyph records on the GPU"}}drawTextRenderer(t,n){if(!this.culledDraw||t.resolvedModel!=="storage-row-indexed")return;const o=t.model;o.setAttributes({compactGlyphVertexData:this.culledDraw.selectedGlyphRecords}),o.setInstanceCount(0),ft.prototype.draw.call(o,n)&&this.culledDraw.drawCommands.draw(n,0)}}const ot={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},te=`
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
}`;class ee extends Rt{static layerName="GPUCulledTraceLayer";static defaultProps={parameters:ot};getAttributeManager(){return null}setShaderModuleProps(){}initializeState({device:t}){if(t.type!=="webgpu")throw new Error("GPUCulledTraceLayer requires WebGPU");const n=t.createBuffer({id:`${this.id}-render-uniforms`,byteLength:16,usage:_.UNIFORM|_.COPY_DST}),o=new ft(t,{id:`${this.id}-model`,source:te,topology:"triangle-list",isInstanced:!0,vertexCount:6,instanceCount:0,bufferLayout:[],bindings:{spans:this.props.spans,visibleIds:this.props.visibleIds,viewUniforms:this.props.viewUniforms,renderUniforms:n},parameters:ot});this.setState({model:o,renderUniforms:n})}getModels(){const t=this.state.model;return t?[t]:[]}draw({renderPass:t,shaderModuleProps:n}){const{model:o,renderUniforms:s}=this.state;!o||!s||(s.write(new Float32Array([n?.picking?.isActive??0,this.props.opacity??1,0,0])),o.setInstanceCount(0),o.draw(t)&&this.props.drawCommands.draw(t,0))}getPickingInfo({info:t}){return t}finalizeState(t){const n=this.state;n.model?.destroy(),n.renderUniforms?.destroy(),this.setState({model:null,renderUniforms:null}),super.finalizeState(t)}}const R=Uint32Array.BYTES_PER_ELEMENT,ne=1;class oe{id="gpu-trace-culling-effect";props={};useInPicking=!0;resources;device;count;compiled=null;textSelection=null;textLayer=null;labelStatus="Waiting for label layer";onStats;visibleBlocks=0;outsideBlocks=0;smallBlocks=0;visibleGlyphs=0;encodeTimeMilliseconds=0;frameIndex=0;statsReadPending=!1;isFinalized=!1;constructor(t,n,o={}){if(t.type!=="webgpu")throw new Error("GPUTraceCullingEffect requires WebGPU");this.device=t,this.count=n.count,this.onStats=o.onStats,this.resources={spans:t.createBuffer({id:"deck-gpu-trace-spans",data:n.spans,usage:_.STORAGE|_.COPY_DST}),visibleIds:t.createBuffer({id:"deck-gpu-trace-visible-ids",byteLength:n.count*R,usage:_.STORAGE|_.COPY_SRC}),rowFlags:t.createBuffer({id:"deck-gpu-trace-row-flags",byteLength:n.count*R,usage:_.STORAGE|_.COPY_SRC}),cullingCounts:t.createBuffer({id:"deck-gpu-trace-culling-counts",byteLength:R*2,usage:_.STORAGE|_.COPY_DST|_.COPY_SRC}),viewUniforms:t.createBuffer({id:"deck-gpu-trace-view-uniforms",byteLength:32,usage:_.UNIFORM|_.COPY_DST}),blockDrawCommands:new tt(t,{id:"deck-gpu-trace-block-draw",type:"draw",commands:[{vertexCount:6,instanceCount:0}]})},this.rebuildGraph()}setup(t){}setTextLayer(t){this.textLayer=t,this.labelStatus="Preparing Arrow text renderer",this.publishStats()}setLabelError(t){this.labelStatus=t instanceof Error?t.message:String(t),this.publishStats()}preRender(t){const n=t.viewports[0];if(!n)return;const o=n.unproject([0,0]),s=n.unproject([n.width,n.height]),r=Math.min(o[0],s[0]),d=Math.max(o[0],s[0]),i=Math.min(o[1],s[1]),a=Math.max(o[1],s[1]);this.resources.viewUniforms.write(new Float32Array([r,d,i,a,(d-r)/n.width,(a-i)/n.height,ne,0]));const c=this.textLayer,u=c?.getSelectionPreparation(),h=u?.source??null;this.labelStatus=u?.status??this.labelStatus,h&&h.glyphRecords!==this.textSelection?.source.glyphRecords&&this.createTextSelection(h),c?.setCulledDraw(this.textSelection?{selectedGlyphRecords:this.textSelection.selectedGlyphRecords,drawCommands:this.textSelection.drawCommands}:null);const l=performance.now();this.resources.cullingCounts.write(new Uint32Array(2)),this.compiled?.encode(this.device.commandEncoder,{parameters:void 0}),this.encodeTimeMilliseconds=performance.now()-l,this.frameIndex++,this.frameIndex%30===0&&this.sampleStats()}cleanup(t){this.isFinalized||(this.isFinalized=!0,this.compiled?.destroy(),this.destroyTextSelection(),this.resources.blockDrawCommands.destroy(),this.resources.spans.destroy(),this.resources.visibleIds.destroy(),this.resources.rowFlags.destroy(),this.resources.cullingCounts.destroy(),this.resources.viewUniforms.destroy(),this.textLayer=null)}createTextSelection(t){this.destroyTextSelection();const n=t.recordWordLength*R;this.textSelection={source:t,selectedGlyphIds:this.device.createBuffer({id:"deck-gpu-trace-selected-glyph-ids",byteLength:Math.max(t.glyphCount*R,R),usage:_.STORAGE|_.COPY_SRC}),selectedGlyphRecords:this.device.createBuffer({id:"deck-gpu-trace-selected-glyph-records",byteLength:Math.max(t.glyphCount*n,n),usage:_.STORAGE|_.VERTEX|_.COPY_SRC}),drawCommands:new tt(this.device,{id:"deck-gpu-trace-label-draw",type:"draw",commands:[{vertexCount:6,instanceCount:0}]})},this.rebuildGraph()}rebuildGraph(){this.compiled?.destroy();const t=new kt(this.device,{id:"deck-gpu-trace-graph"}),n=A(t,"spans",this.resources.spans),o=A(t,"visible-ids",this.resources.visibleIds),s=A(t,"row-flags",this.resources.rowFlags),r=A(t,"culling-counts",this.resources.cullingCounts),d=A(t,"view-uniforms",this.resources.viewUniforms),i=A(t,"block-draw-commands",this.resources.blockDrawCommands.buffer),a=t.createTransientBuffer({id:"source-ids",byteLength:this.count*R,usage:_.STORAGE}),c=t.createDataView(a,{format:"uint32",length:this.count}),u=t.createDataView(s,{format:"uint32",length:this.count}),h=t.createDataView(o,{format:"uint32",length:this.count}),l=t.createDataView(i,{format:"uint32",length:1,byteOffset:this.resources.blockDrawCommands.getInstanceCountByteOffset(0)});if(se(t,{count:this.count,spans:n,viewUniforms:d,sourceIds:c,rowFlags:u,cullingCounts:r}),t.add(new mt({id:"visible-block-compaction",input:c,flags:u,output:h,count:l})),this.textSelection){const{source:g,selectedGlyphIds:p,selectedGlyphRecords:f,drawCommands:w}=this.textSelection,y=A(t,"glyph-records",g.glyphRecords),b=A(t,"selected-glyph-ids",p),T=A(t,"selected-glyph-records",f),m=A(t,"text-draw-commands",w.buffer),E=t.createDataView(y,{format:"uint32",length:g.glyphCount,byteOffset:R*2,byteStride:g.recordWordLength*R});t.add(new jt({id:"visible-text-selection",glyphRows:E,rowFlags:u,output:t.createDataView(b,{format:"uint32",length:g.glyphCount}),count:t.createDataView(m,{format:"uint32",length:1,byteOffset:w.getInstanceCountByteOffset(0)}),sourceRecords:t.createDataView(y,{format:"uint32",length:g.glyphCount*g.recordWordLength}),outputRecords:t.createDataView(T,{format:"uint32",length:g.glyphCount*g.recordWordLength}),recordWordLength:g.recordWordLength}))}this.compiled=t.compile(),this.publishStats()}async sampleStats(){if(this.statsReadPending||this.isFinalized)return;this.statsReadPending=!0;const t=this.textSelection;try{const n=await this.resources.blockDrawCommands.buffer.readAsync(this.resources.blockDrawCommands.getInstanceCountByteOffset(0),R);if(this.isFinalized)return;this.visibleBlocks=new Uint32Array(n.buffer,n.byteOffset,1)[0];const o=await this.resources.cullingCounts.readAsync(0,R*2);if(this.isFinalized)return;const s=new Uint32Array(o.buffer,o.byteOffset,2);if(this.outsideBlocks=s[0],this.smallBlocks=s[1],t){const r=await t.drawCommands.buffer.readAsync(t.drawCommands.getInstanceCountByteOffset(0),R);this.textSelection===t&&(this.visibleGlyphs=new Uint32Array(r.buffer,r.byteOffset,1)[0])}this.isFinalized||this.publishStats()}catch{}finally{this.statsReadPending=!1}}publishStats(){const t=this.compiled?.stats;this.onStats?.({totalBlocks:this.count,visibleBlocks:this.visibleBlocks,outsideBlocks:this.outsideBlocks,smallBlocks:this.smallBlocks,totalGlyphs:this.textSelection?.source.glyphCount??0,visibleGlyphs:this.visibleGlyphs,encodeTimeMilliseconds:this.encodeTimeMilliseconds,graphNodeCount:t?.nodeOrder.length??0,logicalTransientBytes:t?.logicalTransientBytes??0,physicalTransientBytes:t?.physicalTransientBytes??0,transientReusePercentage:t?.reusePercentage??0,labelStatus:this.labelStatus})}destroyTextSelection(){this.textSelection&&(this.textSelection.selectedGlyphIds.destroy(),this.textSelection.selectedGlyphRecords.destroy(),this.textSelection.drawCommands.destroy(),this.textSelection=null)}}function A(e,t,n){return e.importBuffer({id:t,byteLength:n.byteLength,usage:n.usage},n)}function se(e,t){const n=`
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
}`;e.addComputePass({id:"trace-visibility",resources:[{buffer:t.spans,usage:"storage-read"},{buffer:t.viewUniforms,usage:"uniform"},{buffer:t.sourceIds,usage:"storage-write"},{buffer:t.rowFlags,usage:"storage-write"},{buffer:t.cullingCounts,usage:"storage-write"}],compile:({device:o})=>{const s=new It(o,{id:"trace-visibility",source:n,shaderLayout:{bindings:[{name:"spans",type:"storage",group:0,location:0},{name:"viewUniforms",type:"uniform",group:0,location:1},{name:"sourceIds",type:"storage",group:0,location:2},{name:"rowFlags",type:"storage",group:0,location:3},{name:"cullingCounts",type:"storage",group:0,location:4}]}});return{encode:({computePass:r,getBuffer:d})=>{s.setBindings({spans:d(t.spans),viewUniforms:d(t.viewUniforms),sourceIds:d(t.sourceIds),rowFlags:d(t.rowFlags),cullingCounts:d(t.cullingCounts)}),s.dispatch(r,Math.ceil(t.count/256))},destroy:()=>s.destroy()}}})}const re=8,ae=4,ie=1e3,ce=25e4,G=["compute","network","storage"],wt=16,yt=4,X=4,K=wt*yt,N=K*X,x=re,I=ae,st=9,rt=8,ue=4,le=256,at=6,de=256,Et=128,ge=64*1024*1024,he=4,it=0,ct=1,fe=1,pe=8,me=16,we=256,ye=512,Ee=1024,Te=2048,xe=1,be=.25,L=4294967295,_e=Math.ceil(ce/N),q=ie/_e,Ce=73,Re=.9,Ie=24,Se=8,ut=6,Ae=4093,Oe=120,Ue=180;function ve(e){if(!Number.isSafeInteger(e)||e<0||e>4294967295)throw new RangeError("Trace span count must be a nonnegative uint32");return Math.max(Math.ceil(e/N),1)*q}function Ne(e,t=4294967295,n){if(!Number.isSafeInteger(e)||e<0||e>4294967295)throw new RangeError("Trace span count must be a nonnegative uint32");if(!Number.isSafeInteger(t)||t<0||t>4294967295)throw new RangeError("Trace dependency count must be a nonnegative uint32");const o=new Uint32Array(e*x),s=new Float32Array(o.buffer),r=[],d=Math.floor(e/G.length),i=e%G.length;let a=0;for(const[C,S]of G.entries()){const O=d+ +(C<i);r.push({name:S,groupIndex:C,count:O,firstSpanIndex:a,data:o.subarray(a*x,(a+O)*x)}),a+=O}const c=Ge(o,s,r,e),u=Be(o,e,t),h=u.dependencies.length/I,{spanBatches:l,spanBatchIndex:g}=Me(o,r),p=Fe(l),f=new Uint32Array(e),w=new Uint32Array(e),{dependencyBatches:y,dependencyBatchIndex:b}=Pe(o,u.dependencies,u.parentSpans,Et,new Float32Array(f.buffer),new Float32Array(w.buffer)),T=De(u.dependencies,y,ge),m=We(u.dependencies,e,f,w);return{spans:o,groups:r,spanBatches:l,spanBatchIndex:g,temporalIndex:p,dependencies:u.dependencies,dependencyBatches:y,dependencyChunks:T,dependencyBatchIndex:b,parentSpans:u.parentSpans,outgoing:m.outgoing,incoming:m.incoming,duration:Math.max(ve(e),c),spanCount:e,dependencyCount:h,processCount:wt,threadCount:K}}function Pe(e,t,n,o,s,r){if(!Number.isSafeInteger(o)||o<1)throw new RangeError("Trace dependency batch capacity must be a positive safe integer");const d=e.length/x,i=t.length/I,a=new Float32Array(e.buffer,e.byteOffset,e.length);if(s.length<d||r.length<d)throw new RangeError("Trace dependency scratch storage is smaller than the span count");for(let l=0;l<d;l++){const g=l*x,p=a[g],f=p+a[g+1],w=n[l];s[l]=w===L?p:Math.min(p,s[w]),r[l]=w===L?f:Math.max(f,r[w])}const c=[];for(let l=0;l<i;l+=o){const g=Math.min(o,i-l);let p=Number.POSITIVE_INFINITY,f=Number.NEGATIVE_INFINITY,w=0;for(let y=0;y<g;y++){const b=(l+y)*I,T=t[b],m=t[b+1];p=Math.min(p,s[T],s[m]),f=Math.max(f,r[T],r[m]),w|=1<<t[b+2]}c.push({batchIndex:c.length,count:g,firstDependencyIndex:l,timeMin:p,timeMax:f,familyMask:w})}const u=new Uint32Array(c.length*at),h=new Float32Array(u.buffer);for(const l of c){const g=l.batchIndex*at;u[g]=l.firstDependencyIndex,u[g+1]=l.count,h[g+2]=l.timeMin,h[g+3]=l.timeMax,u[g+4]=l.familyMask,u[g+5]=l.batchIndex}return{dependencyBatches:c,dependencyBatchIndex:u}}function Me(e,t,n=de){if(!Number.isSafeInteger(n)||n<1)throw new RangeError("Trace span batch capacity must be a positive safe integer");const o=new Float32Array(e.buffer,e.byteOffset,e.length),s=[];for(const i of t)for(let a=0;a<i.count;a+=n){const c=Math.min(n,i.count-a),u=i.firstSpanIndex+a;let h=Number.POSITIVE_INFINITY,l=Number.NEGATIVE_INFINITY,g=N,p=0,f=0;for(let w=0;w<c;w++){const y=(u+w)*x,b=o[y],T=o[y+1],m=b+T,E=e[y+2];h=Math.min(h,b),l=Math.max(l,m),g=Math.min(g,E),p=Math.max(p,E+1),f=Math.max(f,T)}s.push({batchIndex:s.length,groupIndex:i.groupIndex,name:i.name,count:c,firstSpanIndex:u,timeMin:h,timeMax:l,laneMin:g,laneMax:p,maximumDuration:f,data:e.subarray(u*x,(u+c)*x)})}const r=new Uint32Array(s.length*st),d=new Float32Array(r.buffer);for(const i of s){const a=i.batchIndex*st;r[a]=i.firstSpanIndex,r[a+1]=i.count,d[a+2]=i.timeMin,d[a+3]=i.timeMax,r[a+4]=i.laneMin,r[a+5]=i.laneMax,r[a+6]=i.groupIndex,r[a+7]=i.batchIndex,d[a+8]=i.maximumDuration}return{spanBatches:s,spanBatchIndex:r}}function Fe(e,t=ue,n=le){return Le(e,t,n)}function Le(e,t,n,o){if(!Number.isSafeInteger(t)||t<2)throw new RangeError("Trace temporal index fanout must be at least two");if(!Number.isSafeInteger(n)||n<t)throw new RangeError("Trace temporal index maximum batch count must cover one fanout");let s=e.map(c=>({timeMin:Math.fround(c.timeMin),timeMax:Math.fround(c.timeMax),maximumDuration:Math.fround(c.maximumDuration),groupIndex:c.groupIndex,firstBatchIndex:c.batchIndex,batchCount:1,laneMin:c.laneMin,laneMax:c.laneMax}));const r=[],d=[];for(;s.length>0;){const c=[];let u=0;for(;u<s.length;){const l=s[u];let g=1,p=l.batchCount;for(;u+g<s.length&&g<t;){const m=s[u+g];if(m.groupIndex!==l.groupIndex||Math.floor(m.firstBatchIndex/n)!==Math.floor(l.firstBatchIndex/n)||p+m.batchCount>n)break;p+=m.batchCount,g++}let f=l.timeMin,w=l.timeMax,y=l.maximumDuration,b=l.laneMin,T=l.laneMax;for(let m=1;m<g;m++){const E=s[u+m];f=Math.min(f,E.timeMin),w=Math.max(w,E.timeMax),y=Math.max(y,E.maximumDuration),b=Math.min(b,E.laneMin),T=Math.max(T,E.laneMax)}c.push({timeMin:f,timeMax:w,maximumDuration:y,groupIndex:l.groupIndex,firstBatchIndex:l.firstBatchIndex,batchCount:p,laneMin:b,laneMax:T}),u+=g}if(c.length>=s.length)break;const h=r.length;r.push(...c),d.push({firstNodeIndex:h,nodeCount:c.length,maximumBatchCount:Math.max(...c.map(l=>l.batchCount)),averageTimeSpan:c.reduce((l,g)=>l+g.timeMax-g.timeMin,0)/c.length}),s=c}const i=new Uint32Array(r.length*rt),a=new Float32Array(i.buffer);for(const[c,u]of r.entries()){const h=c*rt;a[h]=Number.POSITIVE_INFINITY,a[h+1]=Number.NEGATIVE_INFINITY,a[h+2]=0,i[h+3]=u.groupIndex,i[h+4]=u.firstBatchIndex,i[h+5]=u.batchCount,i[h+6]=4294967295,i[h+7]=0}return{data:i,levels:d,partitionBatchCount:n,partitionCount:Math.ceil(e.length/n)}}function De(e,t,n){const o=I*Uint32Array.BYTES_PER_ELEMENT,s=Math.floor(n/o);if(s<Et)throw new RangeError;const r=[];let d=0;for(;d<t.length;){const i=t[d];let a=0,c=0;for(;d+a<t.length;){const h=t[d+a];if(a>0&&c+h.count>s)break;c+=h.count,a++}const u=i.firstDependencyIndex;r.push({chunkIndex:r.length,firstDependencyIndex:u,dependencyCount:c,firstBatchIndex:d,batchCount:a,data:e.subarray(u*I,(u+c)*I)}),d+=a}return r}function ke(e){return Ne(e).groups}function Ge(e,t,n,o){let s=2654435769;const r=()=>(s^=s<<13,s^=s>>>17,s^=s<<5,(s>>>0)/4294967296),d=new Float64Array(N),i=new Uint32Array(n.length);let a=0;for(let c=0;c<o;c++){const u=Math.floor(c/N),h=(c+u*Ce)%N,l=Math.floor(h/X),g=Math.floor(l/yt),p=Math.floor(u/Ie),f=h%X,w=(g+f)%n.length,y=p%Se,b=y<ut?w:(w+y-ut+1)%n.length;let T=b;for(let W=0;W<n.length;W++){const V=(b+W)%n.length;if(i[V]<n[V].count){T=V;break}}const m=i[T]++,E=n[T].firstSpanIndex+m,C=E*x,S=(.02+r()*.04)*q,O=r(),M=r(),xt=(c+1)%Ae===0?Oe+M*Ue:O<.58?.04+M*.21:O<.89?.35+M*.85:O<.98?1.5+M*4:10+M*20,Z=d[h]+S,J=xt*Re*q,Q=Z+J;d[h]=Q,a=Math.max(a,Q);const bt=Math.floor(r()*he),_t=E%11===0?we:0,Ct=E%37===0?ye:0;t[C]=Z,t[C+1]=J,e[C+2]=h,e[C+3]=T,e[C+4]=g,e[C+5]=l,e[C+6]=E,e[C+7]=bt|_t|Ct}return a}function Be(e,t,n){const o=t,s=Math.min(n,o),r=new Uint32Array(s*I),d=new Float32Array(e.buffer,e.byteOffset,e.length),i=new Uint32Array(K);i.fill(L);const a=new Uint32Array(t);a.fill(L);let c=0;for(let u=0;u<t;u++){const h=u*x,l=e[h+5],g=i[l];if(c<s&&u%5===0&&g!==L&&(H(r,e,c++,g,u,it),a[u]=g,$e(e,d,g,u)),c<s&&u>7&&u%29===0){const p=e[h+4];let f=u-7;for(;f>0&&e[f*x+4]===p;)f--;e[f*x+4]!==p&&(H(r,e,c++,f,u,ct),a[u]=f)}i[l]=u}for(let u=0;c<s;u++,c++){const h=1+u*73%(t-1),l=Math.min(h,N*2),g=1+u*17%l;let p=h-g;const f=h*x;let w=p*x;for(;p>0&&e[w+4]===e[f+4]&&e[w+5]!==e[f+5];)p--,w-=x;const y=e[w+5]===e[f+5]?it:ct;H(r,e,c,p,h,y)}return{dependencies:r.subarray(0,c*I),parentSpans:a}}function $e(e,t,n,o){const s=n*x,r=o*x,d=t[s],i=t[s+1],a=t[r],c=t[r+1];c<=xe&&a>=d&&a+c<=d+i&&(e[r+7]|=Ee),Math.abs(i-c)<=Math.max(i,c)*be&&(e[s+7]|=Te)}function H(e,t,n,o,s,r){const d=n*I;e[d]=o,e[d+1]=s,e[d+2]=r;const i=t[o*x+4],a=t[s*x+4];e[d+3]=fe|i<<pe|a<<me}function We(e,t,n=new Uint32Array(t),o=new Uint32Array(t)){const s=e.length/I;if(n.length<t||o.length<t)throw new RangeError("Trace adjacency scratch storage is smaller than the span count");n.fill(0),o.fill(0);for(let i=0;i<s;i++){const a=i*I;n[e[a]]++,o[e[a+1]]++}const r=lt(n,s),d=lt(o,s);for(let i=0;i<s;i++){const a=i*I,c=e[a],u=e[a+1];r.neighbors[n[c]++]=u,d.neighbors[o[u]++]=c}return{outgoing:r,incoming:d}}function lt(e,t){let n=0;for(const a of e)n+=+(a>0);const o=new Uint32Array(n),s=new Uint32Array(n+1),r=new Uint32Array(t);let d=0,i=0;for(let a=0;a<e.length;a++){const c=e[a];c!==0&&(o[d]=a,s[d]=i,e[a]=i,i+=c,d++)}return s[n]=i,{nodes:o,offsets:s,neighbors:r}}function Ve(e){const t=ke(e),n=new Uint32Array(e*4),o=new Float32Array(e*2),s=new Float32Array(e*4),r=new Array(e),d=new Float32Array(n.buffer);let i=0;for(const a of t){const c=new Float32Array(a.data.buffer,a.data.byteOffset,a.data.length);for(let u=0;u<a.count;u++,i++){const h=u*x,l=i*4,g=c[h],p=c[h+1],f=a.data[h+2];d[l]=g,d[l+1]=p,n[l+2]=f,n[l+3]=a.groupIndex,o[i*2]=g,o[i*2+1]=f+.5,s[l]=0,s[l+1]=-.5,s[l+2]=p,s[l+3]=1,r[i]=He(a.name,i)}}return{count:e,spans:n,names:r,textTable:new Gt({positions:nt(new et,2,o),texts:Bt(r,new $t),clipRects:nt(new et,4,s)})}}function Ye(e,t){if(t<0||t>=e.count)return null;const n=t*4,o=new Float32Array(e.spans.buffer,e.spans.byteOffset,e.spans.length);return{name:e.names[t],group:G[e.spans[n+3]],start:o[n],duration:o[n+1],lane:e.spans[n+2]}}function He(e,t){return`${e} ${e==="compute"?"μtask":e==="network"?"café":"parse"}-${String(t).padStart(6,"0")}`}class ze{panelManager;traceData;statsElement=null;cullingStats;constructor(t,n){this.traceData=t,this.cullingStats=n,this.panelManager=new Wt({descriptionHtml:'<p style="margin:0;line-height:1.45">One WebGPU command graph culls trace blocks and row-indexed Arrow glyph records before deck.gl draws both layers indirectly.</p>',settingsPanel:()=>Vt({id:"gpu-culled-trace-culling",title:"Culling",html:"<div data-gpu-trace-culling-stats></div>",onRender:o=>(this.statsElement=o.querySelector("[data-gpu-trace-culling-stats]"),dt(this.statsElement,this.cullingStats),()=>{this.statsElement=null})})}),this.panelManager.setTableEntries([{id:"gpu-trace-text",label:"Trace text",kind:"source",table:t.textTable}])}mount(){this.panelManager.mount()}finalize(){this.panelManager.finalize()}updateCullingStats(t){this.cullingStats=t,dt(this.statsElement,t)}getTooltip(t){const n=Ye(this.traceData,t.index);return n?{html:`<div><strong>${Tt(n.name)}</strong></div>
        <div>group: ${n.group}</div>
        <div>start: ${n.start.toFixed(3)}</div>
        <div>duration: ${n.duration.toFixed(3)}</div>
        <div>lane: ${n.lane}</div>`}:null}}function dt(e,t){if(!e)return;const n=t.totalGlyphs?`${P(t.visibleGlyphs)} / ${P(t.totalGlyphs)}`:Tt(t.labelStatus);e.innerHTML=`<div style="display:grid;grid-template-columns:1fr auto;gap:5px 16px;font:12px/1.45 system-ui,sans-serif;font-variant-numeric:tabular-nums">
    <span>Visible blocks</span><strong>${P(t.visibleBlocks)} / ${P(t.totalBlocks)}</strong>
    <span>Outside view</span><strong>${P(t.outsideBlocks)}</strong>
    <span>Too small (&lt;1 px)</span><strong>${P(t.smallBlocks)}</strong>
    <span>Visible glyphs</span><strong>${n}</strong>
    <span>Graph nodes</span><strong>${t.graphNodeCount}</strong>
    <span>CPU graph encode</span><strong>${t.encodeTimeMilliseconds.toFixed(2)} ms</strong>
    <span>Logical scratch</span><strong>${gt(t.logicalTransientBytes)}</strong>
    <span>Physical scratch</span><strong>${gt(t.physicalTransientBytes)}</strong>
    <span>Transient reuse</span><strong>${t.transientReusePercentage.toFixed(0)}%</strong>
  </div>`}function Tt(e){return e.replace(/[&<>"']/g,t=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"})[t])}function P(e){return new Intl.NumberFormat("en-US",{notation:"compact",maximumFractionDigits:1}).format(e)}function gt(e){return e<1024?`${e} B`:e<1024*1024?`${(e/1024).toFixed(1)} KiB`:`${(e/1024/1024).toFixed(1)} MiB`}const Xe=25e3,qe=72;let ht;function je(e,t={}){const n=Ve(Xe);let o=null,s=0,r=0,d=!0,i={target:[150,qe/2,0],zoom:0},a={totalBlocks:n.count,visibleBlocks:0,outsideBlocks:0,smallBlocks:0,totalGlyphs:0,visibleGlyphs:0,encodeTimeMilliseconds:0,graphNodeCount:0,logicalTransientBytes:0,physicalTransientBytes:0,transientReusePercentage:0,labelStatus:"Waiting for label layer"};const c=new ze(n,a);c.mount();let u;u=new Ot({parent:e,...St({...t,deviceType:"webgpu"}),views:new At({id:"main"}),viewState:i,controller:{dragPan:!0,scrollZoom:{smooth:!0,speed:.02},doubleClickZoom:!0,touchZoom:!0},layers:[],effects:[],getTooltip:l=>c.getTooltip(l),onViewStateChange:({viewState:l})=>{i=l,d=!1,u.setProps({viewState:i})},onLoad:({deck:l,device:g})=>{if(g.type!=="webgpu")throw new Error("GPU-culled deck trace requires WebGPU");o=new oe(g,n,{onStats:w=>{a=w,c.updateCullingStats(w)}});const p=o.resources,f=new Qt({id:"gpu-culled-trace-labels",data:n.textTable,pickable:!0,fontAtlas:Ke(),model:"storage-row-indexed",positions:"positions",texts:"texts",clipRects:"clipRects",angles:null,sizes:null,pixelOffsets:null,textAnchors:null,alignmentBaselines:null,color:[245,248,255,255],size:24,pixelOffset:[2,0],textAnchor:"start",alignmentBaseline:"center",contentAlignHorizontal:"start",contentAlignVertical:"none",contentCutoffPixels:[0,0],onDataError:w=>o?.setLabelError(w)});o.setTextLayer(f),l.setProps({effects:[o],layers:[new ee({id:"gpu-culled-trace-blocks",data:[],pickable:!0,spans:p.spans,visibleIds:p.visibleIds,viewUniforms:p.viewUniforms,drawCommands:p.blockDrawCommands}),f]})},onFinalize:()=>{cancelAnimationFrame(s),c.finalize()}});const h=l=>{const g=o&&a.totalGlyphs===0;o&&(d||g)&&l-r>=1e3/30&&(r=l,d&&(i={...i,target:[150+l*.025%1e3,i.target[1],0]},u.setProps({viewState:i})),u.redraw("trace animation")),s=requestAnimationFrame(h)};return s=requestAnimationFrame(h),u}function Ke(){return ht??=vt({characterSet:" abcdefghijklmnopqrstuvwxyz0123456789-μé",fontFamily:"Monaco, Menlo, monospace",fontWeight:"600",fontSize:48,buffer:5,radius:10}),ht}je(void 0,{deviceType:"webgpu"});
