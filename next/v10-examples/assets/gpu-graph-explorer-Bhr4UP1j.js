import{C as H,D as j,B as F,a as Fo,G as Ze,L as lo,M as fo,p as _o,b as xo}from"./deck-example-device-TQPRJnZ6.js";import{O as bo}from"./orthographic-view-CoMX3VNX.js";import{h as $o,f as q,i as yo,j as go,k as Co,g as u,l as K,m as E,b as z,G as Re}from"./gpu-scan-BtfiiIEk.js";import{G as Io,g as Vo}from"./gpu-grid-index-fxMVIXqQ.js";import{p as vo}from"./project32-Byi-VnKS.js";import{A as Ro}from"./arrow-deck-Djc-ZCtY.js";import"./dynamic-texture-NQQfRyls.js";function Po(t){return $o(t,{requiresSubgroupId:!0})}const Lo=4294967294,Uo=4294967295,he=4,Ao=Object.freeze([]);class No{vertexCount;sourceVertices;targetVertices;edgeWeights;edgeIds;nodeAttributes;edgeAttributes;directed;constructor({vertexCount:e,sourceVertices:o,targetVertices:i,edgeWeights:r,edgeIds:s,nodeAttributes:n,edgeAttributes:a,directed:c=!0}){if(!Number.isSafeInteger(e)||e<0||e>Lo)throw new Error("GPUGraph vertexCount must leave room for uint32 adjacency offsets");if(Pe(o,"uint32","sourceVertices"),Pe(i,"uint32","targetVertices"),Qe(o,i,"targetVertices"),o.length>Uo)throw new Error("GPUGraph edgeCount must fit in uint32");if(r&&(Pe(r,"float32","edgeWeights"),Qe(o,r,"edgeWeights")),s&&(Pe(s,"uint32","edgeIds"),Qe(o,s,"edgeIds")),n&&n.numRows!==e)throw new Error("GPUGraph nodeAttributes must contain one row per vertex");a&&Do(a,o,i,r,s),this.vertexCount=e,this.sourceVertices=o,this.targetVertices=i,this.edgeWeights=r,this.edgeIds=s,this.nodeAttributes=n,this.edgeAttributes=a,this.directed=c}get edgeCount(){return this.sourceVertices.length}get sourceEdgeBatches(){return this.edgeAttributes?.batches??Ao}}function Pe(t,e,o){if(t.format!==e||t.stride!==1||t.byteStride!==he||t.rowByteLength!==he||t.valueLength!==t.length||t.bufferLayout)throw new Error(`GPUGraph ${o} must contain packed ${e} rows`);for(const i of t.data)if(i.format!==e||i.stride!==1||i.byteStride!==he||i.rowByteLength!==he||i.byteOffset%he!==0||i.valueLength!==i.length)throw new Error(`GPUGraph ${o} must contain packed ${e} chunks`)}function Qe(t,e,o){if(e.length!==t.length||e.data.length!==t.data.length||e.data.some((i,r)=>i.length!==t.data[r].length))throw new Error(`GPUGraph ${o} must preserve source edge chunk topology`)}function Do(t,e,o,i,r){if(t.numRows!==e.length)throw new Error("GPUGraph edgeAttributes must contain one row per edge");if(t.batches.length!==e.data.length||t.batches.some((n,a)=>n.numRows!==e.data[a].length))throw new Error("GPUGraph edgeAttributes must preserve source edge batch topology");const s={sourceVertices:e,targetVertices:o,...i?{edgeWeights:i}:{},...r?{edgeIds:r}:{}};for(const[n,a]of Object.entries(s))for(const c of new Set([n,a.name])){const d=t.gpuVectors[c];if(d&&(d.data.length!==a.data.length||d.data.some((g,v)=>g!==a.data[v])))throw new Error(`GPUGraph edgeAttributes ${c} must preserve source edge data`)}}const ee=256,Ae=4294967295;function ko(t,e,o){const i={sourceVertices:e.importGPUVector(`${t.id}-source-vertices`,t.graph.sourceVertices),targetVertices:e.importGPUVector(`${t.id}-target-vertices`,t.graph.targetVertices),...t.graph.edgeIds?{edgeIds:e.importGPUVector(`${t.id}-source-edge-ids`,t.graph.edgeIds)}:{},...t.graph.edgeWeights?{edgeWeights:e.importGPUVector(`${t.id}-source-edge-weights`,t.graph.edgeWeights)}:{}},r=e.importGPUVector(`${t.id}-invalid-edge-count`,t.invalidEdgeCount).data[0];Ct(e,{id:`${t.id}-forward`,vertexCount:t.graph.vertexCount,directed:t.graph.directed,reverse:!1,sources:i,adjacency:yt(e,`${t.id}-forward`,t.forward),invalidEdgeCount:r,maxComputeWorkgroupsPerDimension:o}),t.reverse&&Ct(e,{id:`${t.id}-reverse`,vertexCount:t.graph.vertexCount,directed:t.graph.directed,reverse:!0,sources:i,adjacency:yt(e,`${t.id}-reverse`,t.reverse),maxComputeWorkgroupsPerDimension:o})}function yt(t,e,o){return{offsets:t.importGPUVector(`${e}-offsets`,o.offsets).data[0],neighbors:t.importGPUVector(`${e}-neighbors`,o.neighbors).data[0],edgeIds:t.importGPUVector(`${e}-edge-ids`,o.edgeIds).data[0],...o.edgeWeights?{edgeWeights:t.importGPUVector(`${e}-edge-weights`,o.edgeWeights).data[0]}:{},count:t.importGPUVector(`${e}-count`,o.count).data[0],overflow:t.importGPUVector(`${e}-overflow`,o.overflow).data[0]}}function Ct(t,e){const o=q(t,`${e.id}-degrees`,"uint32",e.vertexCount),i=q(t,`${e.id}-cursors`,"uint32",e.vertexCount),r=q(t,`${e.id}-scanned-offsets`,"uint32",e.vertexCount);Mo(t,{id:`${e.id}-initialize`,degrees:o,cursors:i,invalidEdgeCount:e.invalidEdgeCount,dispatchLayout:Le(Math.max(e.vertexCount,1),e.maxComputeWorkgroupsPerDimension)});for(const[a,c]of e.sources.sourceVertices.data.entries())c.length>0&&Go(t,{id:`${e.id}-degrees-${a}`,sourceVertices:c,targetVertices:e.sources.targetVertices.data[a],degrees:o,invalidEdgeCount:e.invalidEdgeCount,vertexCount:e.vertexCount,directed:e.directed,reverse:e.reverse,dispatchLayout:Le(c.length,e.maxComputeWorkgroupsPerDimension)});const s=new yo({id:`${e.id}-scan`,input:o,output:r});go(t,Co(s,t,e.maxComputeWorkgroupsPerDimension)),Wo(t,{id:`${e.id}-finalize`,degrees:o,scannedOffsets:r,adjacency:e.adjacency,vertexCount:e.vertexCount,dispatchLayout:Le(Math.max(e.vertexCount,1),e.maxComputeWorkgroupsPerDimension)});let n=0;for(const[a,c]of e.sources.sourceVertices.data.entries()){if(c.length>0&&e.adjacency.neighbors.length>0){const d=e.sources.edgeWeights?.data[a],g=d?q(t,`${e.id}-slots-${a}`,"uint32",c.length*(e.directed?1:2)):void 0,v=Le(c.length,e.maxComputeWorkgroupsPerDimension);Bo(t,{id:`${e.id}-scatter-${a}`,sourceVertices:c,targetVertices:e.sources.targetVertices.data[a],sourceEdgeIds:e.sources.edgeIds?.data[a],sourceBase:n,scannedOffsets:r,cursors:i,adjacency:e.adjacency,slots:g,vertexCount:e.vertexCount,directed:e.directed,reverse:e.reverse,dispatchLayout:v}),d&&g&&e.adjacency.edgeWeights&&zo(t,{id:`${e.id}-weights-${a}`,sourceWeights:d,outputWeights:e.adjacency.edgeWeights,slots:g,directed:e.directed,dispatchLayout:v})}n+=c.length}}function Mo(t,e){const o=e.invalidEdgeCount?`const INVALID_OFFSET: u32 = ${u(e.invalidEdgeCount)}u;
@group(0) @binding(2) var<storage, read_write> invalidEdges: array<atomic<u32>>;`:"",i=e.invalidEdgeCount?"if (index == 0u) { atomicStore(&invalidEdges[INVALID_OFFSET], 0u); }":"",r=`
const VERTEX_COUNT: u32 = ${e.degrees.length}u;
const DEGREES_OFFSET: u32 = ${u(e.degrees)}u;
const CURSORS_OFFSET: u32 = ${u(e.cursors)}u;
@group(0) @binding(0) var<storage, read_write> degrees: array<atomic<u32>>;
@group(0) @binding(1) var<storage, read_write> cursors: array<atomic<u32>>;
${o}

@compute @workgroup_size(${ee})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${$e(e.dispatchLayout)}
  if (index < VERTEX_COUNT) {
    atomicStore(&degrees[DEGREES_OFFSET + index], 0u);
    atomicStore(&cursors[CURSORS_OFFSET + index], 0u);
  }
  ${i}
}`,s={degrees:e.degrees,cursors:e.cursors},n=[{buffer:e.degrees,usage:"storage-write"},{buffer:e.cursors,usage:"storage-write"}];e.invalidEdgeCount&&(s.invalidEdges=e.invalidEdgeCount,n.push({buffer:e.invalidEdgeCount,usage:"storage-write"})),be(t,{id:e.id,source:r,bindings:s,resources:n,dispatchLayout:e.dispatchLayout})}function Go(t,e){const o=e.invalidEdgeCount?`const INVALID_OFFSET: u32 = ${u(e.invalidEdgeCount)}u;
@group(0) @binding(3) var<storage, read_write> invalidEdges: array<atomic<u32>>;`:"",i=e.invalidEdgeCount?"atomicAdd(&invalidEdges[INVALID_OFFSET], 1u);":"",r=e.reverse?"targetVertex":"sourceVertex",s=e.reverse?"sourceVertex":"targetVertex",n=e.directed?"":`if (sourceVertex != targetVertex) {
    atomicAdd(&degrees[DEGREES_OFFSET + ${s}], 1u);
  }`,a=`
const EDGE_COUNT: u32 = ${e.sourceVertices.length}u;
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const SOURCES_OFFSET: u32 = ${u(e.sourceVertices)}u;
const TARGETS_OFFSET: u32 = ${u(e.targetVertices)}u;
const DEGREES_OFFSET: u32 = ${u(e.degrees)}u;
@group(0) @binding(0) var<storage, read> sourceVertices: array<u32>;
@group(0) @binding(1) var<storage, read> targetVertices: array<u32>;
@group(0) @binding(2) var<storage, read_write> degrees: array<atomic<u32>>;
${o}

@compute @workgroup_size(${ee})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${$e(e.dispatchLayout)}
  if (index >= EDGE_COUNT) { return; }
  let sourceVertex = sourceVertices[SOURCES_OFFSET + index];
  let targetVertex = targetVertices[TARGETS_OFFSET + index];
  if (sourceVertex >= VERTEX_COUNT || targetVertex >= VERTEX_COUNT) {
    ${i}
    return;
  }
  atomicAdd(&degrees[DEGREES_OFFSET + ${r}], 1u);
  ${n}
}`,c={sourceVertices:e.sourceVertices,targetVertices:e.targetVertices,degrees:e.degrees},d=[{buffer:e.sourceVertices,usage:"storage-read"},{buffer:e.targetVertices,usage:"storage-read"},{buffer:e.degrees,usage:"storage-read-write"}];e.invalidEdgeCount&&(c.invalidEdges=e.invalidEdgeCount,d.push({buffer:e.invalidEdgeCount,usage:"storage-read-write"})),be(t,{id:e.id,source:a,bindings:c,resources:d,dispatchLayout:e.dispatchLayout})}function Wo(t,e){const o=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const CAPACITY: u32 = ${e.adjacency.neighbors.length}u;
const DEGREES_OFFSET: u32 = ${u(e.degrees)}u;
const SCANNED_OFFSET: u32 = ${u(e.scannedOffsets)}u;
const OFFSETS_OFFSET: u32 = ${u(e.adjacency.offsets)}u;
const COUNT_OFFSET: u32 = ${u(e.adjacency.count)}u;
const OVERFLOW_OFFSET: u32 = ${u(e.adjacency.overflow)}u;
@group(0) @binding(0) var<storage, read> degrees: array<u32>;
@group(0) @binding(1) var<storage, read> scannedOffsets: array<u32>;
@group(0) @binding(2) var<storage, read_write> offsets: array<u32>;
@group(0) @binding(3) var<storage, read_write> outputCount: array<u32>;
@group(0) @binding(4) var<storage, read_write> outputOverflow: array<u32>;

@compute @workgroup_size(${ee})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${$e(e.dispatchLayout)}
  if (index < VERTEX_COUNT) {
    offsets[OFFSETS_OFFSET + index] = scannedOffsets[SCANNED_OFFSET + index];
  }
  if (index == 0u) {
    var total = 0u;
    if (VERTEX_COUNT > 0u) {
      let last = max(VERTEX_COUNT, 1u) - 1u;
      total = scannedOffsets[SCANNED_OFFSET + last] + degrees[DEGREES_OFFSET + last];
    }
    offsets[OFFSETS_OFFSET + VERTEX_COUNT] = total;
    outputCount[COUNT_OFFSET] = total;
    outputOverflow[OVERFLOW_OFFSET] = select(0u, 1u, total > CAPACITY);
  }
}`;be(t,{id:e.id,source:o,resources:[{buffer:e.degrees,usage:"storage-read"},{buffer:e.scannedOffsets,usage:"storage-read"},{buffer:e.adjacency.offsets,usage:"storage-write"},{buffer:e.adjacency.count,usage:"storage-write"},{buffer:e.adjacency.overflow,usage:"storage-write"}],bindings:{degrees:e.degrees,scannedOffsets:e.scannedOffsets,offsets:e.adjacency.offsets,outputCount:e.adjacency.count,outputOverflow:e.adjacency.overflow},dispatchLayout:e.dispatchLayout})}function Bo(t,e){const o=e.sourceEdgeIds?`const SOURCE_EDGE_IDS_OFFSET: u32 = ${u(e.sourceEdgeIds)}u;
@group(0) @binding(6) var<storage, read> sourceEdgeIds: array<u32>;`:"",i=e.sourceEdgeIds?7:6,r=e.slots?`const SLOTS_OFFSET: u32 = ${u(e.slots)}u;
@group(0) @binding(${i}) var<storage, read_write> slots: array<u32>;`:"",s=e.directed?1:2,n=e.slots?`slots[SLOTS_OFFSET + index * ${s}u] = ${Ae}u;
  ${e.directed?"":`slots[SLOTS_OFFSET + index * 2u + 1u] = ${Ae}u;`}`:"",a=e.reverse?"targetVertex":"sourceVertex",c=e.reverse?"sourceVertex":"targetVertex",d=c,g=a,v=e.slots?`slots[SLOTS_OFFSET + index * ${s}u] = firstSlot;`:"",p=e.slots?"slots[SLOTS_OFFSET + index * 2u + 1u] = secondSlot;":"",L=e.directed?"":`if (sourceVertex != targetVertex) {
    let secondSlot = scannedOffsets[SCANNED_OFFSET + ${d}] +
      atomicAdd(&cursors[CURSORS_OFFSET + ${d}], 1u);
    if (secondSlot < CAPACITY) {
      neighbors[NEIGHBORS_OFFSET + secondSlot] = ${g};
      outputEdgeIds[OUTPUT_EDGE_IDS_OFFSET + secondSlot] = edgeIdentifier;
      ${p}
    }
  }`,U=e.sourceEdgeIds?"sourceEdgeIds[SOURCE_EDGE_IDS_OFFSET + index]":`${e.sourceBase}u + index`,T=`
const EDGE_COUNT: u32 = ${e.sourceVertices.length}u;
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const CAPACITY: u32 = ${e.adjacency.neighbors.length}u;
const SOURCES_OFFSET: u32 = ${u(e.sourceVertices)}u;
const TARGETS_OFFSET: u32 = ${u(e.targetVertices)}u;
const SCANNED_OFFSET: u32 = ${u(e.scannedOffsets)}u;
const CURSORS_OFFSET: u32 = ${u(e.cursors)}u;
const NEIGHBORS_OFFSET: u32 = ${u(e.adjacency.neighbors)}u;
const OUTPUT_EDGE_IDS_OFFSET: u32 = ${u(e.adjacency.edgeIds)}u;
@group(0) @binding(0) var<storage, read> sourceVertices: array<u32>;
@group(0) @binding(1) var<storage, read> targetVertices: array<u32>;
@group(0) @binding(2) var<storage, read> scannedOffsets: array<u32>;
@group(0) @binding(3) var<storage, read_write> cursors: array<atomic<u32>>;
@group(0) @binding(4) var<storage, read_write> neighbors: array<u32>;
@group(0) @binding(5) var<storage, read_write> outputEdgeIds: array<u32>;
${o}
${r}

@compute @workgroup_size(${ee})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${$e(e.dispatchLayout)}
  if (index >= EDGE_COUNT) { return; }
  ${n}
  let sourceVertex = sourceVertices[SOURCES_OFFSET + index];
  let targetVertex = targetVertices[TARGETS_OFFSET + index];
  if (sourceVertex >= VERTEX_COUNT || targetVertex >= VERTEX_COUNT) { return; }
  let edgeIdentifier = ${U};
  let firstSlot = scannedOffsets[SCANNED_OFFSET + ${a}] +
    atomicAdd(&cursors[CURSORS_OFFSET + ${a}], 1u);
  if (firstSlot < CAPACITY) {
    neighbors[NEIGHBORS_OFFSET + firstSlot] = ${c};
    outputEdgeIds[OUTPUT_EDGE_IDS_OFFSET + firstSlot] = edgeIdentifier;
    ${v}
  }
  ${L}
}`,O={sourceVertices:e.sourceVertices,targetVertices:e.targetVertices,scannedOffsets:e.scannedOffsets,cursors:e.cursors,neighbors:e.adjacency.neighbors,outputEdgeIds:e.adjacency.edgeIds},_=[{buffer:e.sourceVertices,usage:"storage-read"},{buffer:e.targetVertices,usage:"storage-read"},{buffer:e.scannedOffsets,usage:"storage-read"},{buffer:e.cursors,usage:"storage-read-write"},{buffer:e.adjacency.neighbors,usage:"storage-write"},{buffer:e.adjacency.edgeIds,usage:"storage-write"}];e.sourceEdgeIds&&(O.sourceEdgeIds=e.sourceEdgeIds,_.push({buffer:e.sourceEdgeIds,usage:"storage-read"})),e.slots&&(O.slots=e.slots,_.push({buffer:e.slots,usage:"storage-write"})),be(t,{id:e.id,source:T,bindings:O,resources:_,dispatchLayout:e.dispatchLayout})}function zo(t,e){const o=e.directed?1:2,i=e.directed?"":`let secondSlot = slots[SLOTS_OFFSET + index * 2u + 1u];
  if (secondSlot != ${Ae}u) {
    outputWeights[OUTPUT_OFFSET + secondSlot] = weight;
  }`,r=`
const EDGE_COUNT: u32 = ${e.sourceWeights.length}u;
const SOURCE_OFFSET: u32 = ${u(e.sourceWeights)}u;
const OUTPUT_OFFSET: u32 = ${u(e.outputWeights)}u;
const SLOTS_OFFSET: u32 = ${u(e.slots)}u;
@group(0) @binding(0) var<storage, read> sourceWeights: array<f32>;
@group(0) @binding(1) var<storage, read> slots: array<u32>;
@group(0) @binding(2) var<storage, read_write> outputWeights: array<f32>;

@compute @workgroup_size(${ee})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${$e(e.dispatchLayout)}
  if (index >= EDGE_COUNT) { return; }
  let weight = sourceWeights[SOURCE_OFFSET + index];
  let firstSlot = slots[SLOTS_OFFSET + index * ${o}u];
  if (firstSlot != ${Ae}u) {
    outputWeights[OUTPUT_OFFSET + firstSlot] = weight;
  }
  ${i}
}`;be(t,{id:e.id,source:r,resources:[{buffer:e.sourceWeights,usage:"storage-read"},{buffer:e.slots,usage:"storage-read"},{buffer:e.outputWeights,usage:"storage-write"}],bindings:{sourceWeights:e.sourceWeights,slots:e.slots,outputWeights:e.outputWeights},dispatchLayout:e.dispatchLayout})}function be(t,e){t.addComputePass({id:e.id,resources:e.resources,compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function Le(t,e){return K("GPUGraphTopology",t,ee,e)}function $e(t){return E(t,ee)}const it=4294967295,Ee=4;class Xo{id;graph;forward;reverse;invalidEdgeCount;constructor(e){if(this.id=e.id??"gpu-graph-topology",this.graph=e.graph,this.forward=e.forward,this.reverse=e.reverse,this.invalidEdgeCount=e.invalidEdgeCount,!Number.isSafeInteger(this.graph.edgeCount)||this.graph.edgeCount<0)throw new Error(`${this.id} source edge count must be a non-negative uint32`);if(this.graph.edgeCount>it||!this.graph.directed&&this.graph.edgeCount>Math.floor(it/2))throw new Error(`${this.id} directed or symmetrized adjacency counts must fit in uint32`);if(this.reverse&&!this.graph.directed)throw new Error(`${this.id} reverse adjacency requires a directed graph`);if(It(this.graph,this.forward,`${this.id} forward`),this.reverse&&It(this.graph,this.reverse,`${this.id} reverse`),Q(this.invalidEdgeCount,"uint32",`${this.id} invalidEdgeCount`),this.invalidEdgeCount.length!==1)throw new Error(`${this.id} invalidEdgeCount must contain exactly one uint32 row`);Yo(this)}addToGraph(e){ko(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function It(t,e,o){if(Q(e.offsets,"uint32",`${o} offsets`),Q(e.neighbors,"uint32",`${o} neighbors`),Q(e.edgeIds,"uint32",`${o} edgeIds`),Q(e.count,"uint32",`${o} count`),Q(e.overflow,"uint32",`${o} overflow`),e.offsets.length!==t.vertexCount+1)throw new Error(`${o} offsets must contain vertexCount + 1 rows`);if(e.neighbors.length!==e.edgeIds.length)throw new Error(`${o} neighbors and edgeIds must have matching capacities`);if(e.count.length!==1||e.overflow.length!==1)throw new Error(`${o} count and overflow must each contain exactly one uint32 row`);if(!!e.edgeWeights!=!!t.edgeWeights)throw new Error(`${o} edgeWeights must match the source graph edge weights`);if(e.edgeWeights&&(Q(e.edgeWeights,"float32",`${o} edgeWeights`),e.edgeWeights.length!==e.neighbors.length))throw new Error(`${o} edgeWeights and neighbors must have matching capacities`)}function Q(t,e,o){if(t.data.length!==1||t.format!==e||t.stride!==1||t.byteStride!==Ee||t.rowByteLength!==Ee||t.valueLength!==t.length||t.bufferLayout||!Number.isSafeInteger(t.length)||t.length<0||t.length>it)throw new Error(`${o} must contain one packed ${e} chunk with uint32 capacity`);const i=t.data[0];if(i.format!==e||i.length!==t.length||i.stride!==1||i.byteStride!==Ee||i.rowByteLength!==Ee||i.valueLength!==i.length||!Number.isSafeInteger(i.byteOffset)||i.byteOffset<0||i.byteOffset%Ee!==0)throw new Error(`${o} must contain one packed, uint32-aligned ${e} chunk`)}function Yo(t){const e=new Map,o=[t.graph.sourceVertices,t.graph.targetVertices,...t.graph.edgeWeights?[t.graph.edgeWeights]:[],...t.graph.edgeIds?[t.graph.edgeIds]:[]];for(const r of o)for(const s of r.data){const n=Rt(s);e.has(n)||e.set(n,r.name)}const i=[...Vt(t.forward,"forward"),...t.reverse?Vt(t.reverse,"reverse"):[],{name:"invalidEdgeCount",vector:t.invalidEdgeCount}];for(const{name:r,vector:s}of i){const n=Rt(s.data[0]);if(e.get(n)!==void 0)throw new Error(`${t.id} ${r} must use a distinct physical buffer allocation`);e.set(n,r)}}function Vt(t,e){return[{name:`${e}.offsets`,vector:t.offsets},{name:`${e}.neighbors`,vector:t.neighbors},{name:`${e}.edgeIds`,vector:t.edgeIds},...t.edgeWeights?[{name:`${e}.edgeWeights`,vector:t.edgeWeights}]:[],{name:`${e}.count`,vector:t.count},{name:`${e}.overflow`,vector:t.overflow}]}function Rt(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const rt=256;function Ho(t,e,o){if(t.topology.graph.vertexCount===0)return;const i=t.direction==="incoming"&&t.topology.graph.directed?t.topology.reverse:t.topology.forward,r=e.importGPUVector(`${t.id}-offsets`,i.offsets).data[0],s=e.importGPUVector(`${t.id}-output`,t.output).data[0],n=jo(t.topology.graph.vertexCount,o),a=`
const VERTEX_COUNT: u32 = ${t.topology.graph.vertexCount}u;
const OFFSETS_OFFSET: u32 = ${u(r)}u;
const OUTPUT_OFFSET: u32 = ${u(s)}u;
@group(0) @binding(0) var<storage, read> offsets: array<u32>;
@group(0) @binding(1) var<storage, read_write> output: array<u32>;

@compute @workgroup_size(${rt})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(n,rt)}
  if (index >= VERTEX_COUNT) { return; }
  output[OUTPUT_OFFSET + index] =
    offsets[OFFSETS_OFFSET + index + 1u] - offsets[OFFSETS_OFFSET + index];
}`;qo(e,{id:t.id,offsets:r,output:s,source:a,dispatchLayout:n})}function qo(t,e){t.addComputePass({id:e.id,resources:[{buffer:e.offsets,usage:"storage-read"},{buffer:e.output,usage:"storage-write"}],compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:[{name:"offsets",type:"storage",group:0,location:0},{name:"output",type:"storage",group:0,location:1}]}});return{encode:({computePass:r,getBuffer:s})=>{const n={offsets:z(e.offsets,s),output:z(e.output,s)};i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function jo(t,e){return K("GPUGraphDegree",t,rt,e)}const pe=4;class Ko{id;topology;output;direction;constructor(e){if(this.id=e.id??"gpu-graph-degree",this.topology=e.topology,this.output=e.output,this.direction=e.direction??"outgoing",this.direction!=="outgoing"&&this.direction!=="incoming")throw new Error(`${this.id} direction must be outgoing or incoming`);if(this.direction==="incoming"&&this.topology.graph.directed&&!this.topology.reverse)throw new Error(`${this.id} incoming directed degree requires reverse adjacency`);Zo(this.output,this.topology.graph.vertexCount,this.id),Qo(this.topology,this.output,this.id)}addToGraph(e){Ho(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function Zo(t,e,o){if(t.data.length!==1||t.format!=="uint32"||t.stride!==1||t.byteStride!==pe||t.rowByteLength!==pe||t.valueLength!==t.length||t.bufferLayout)throw new Error(`${o} output must contain one packed uint32 chunk`);if(t.length!==e)throw new Error(`${o} output length must equal vertexCount`);const i=t.data[0];if(i.format!=="uint32"||i.length!==t.length||i.stride!==1||i.byteStride!==pe||i.rowByteLength!==pe||i.valueLength!==i.length||!Number.isSafeInteger(i.byteOffset)||i.byteOffset<0||i.byteOffset%pe!==0)throw new Error(`${o} output must contain one packed, uint32-aligned chunk`)}function Qo(t,e,o){const i=[t.graph.sourceVertices,t.graph.targetVertices,...t.graph.edgeWeights?[t.graph.edgeWeights]:[],...t.graph.edgeIds?[t.graph.edgeIds]:[],...Pt(t.forward),...t.reverse?Pt(t.reverse):[],t.invalidEdgeCount],r=Lt(e.data[0]);for(const s of i)if(s.data.some(n=>Lt(n)===r))throw new Error(`${o} output must use a distinct physical buffer allocation`)}function Pt(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function Lt(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const J=256,Ut=4294967295;function Jo(t,e,o){if(t.topology.graph.vertexCount===0)return;const i=t.topology.graph.directed&&t.direction==="incoming",r=At(e,`${t.id}-${i?"incoming":"outgoing"}`,i?t.topology.reverse:t.topology.forward),s={id:t.id,vertexCount:t.topology.graph.vertexCount,seeds:e.importGPUVector(`${t.id}-seeds`,t.seeds),distances:e.importGPUVector(`${t.id}-distances`,t.distances).data[0],predecessors:e.importGPUVector(`${t.id}-predecessors`,t.predecessors).data[0],...t.mask?{mask:e.importGPUVector(`${t.id}-mask`,t.mask).data[0]}:{},...t.seedCount?{seedCount:e.importGPUVector(`${t.id}-seed-count`,t.seedCount).data[0]}:{},...t.activeDepth?{activeDepth:e.importGPUVector(`${t.id}-active-depth`,t.activeDepth).data[0]}:{},primaryAdjacency:r,...t.topology.graph.directed&&t.direction==="both"?{secondaryAdjacency:At(e,`${t.id}-incoming`,t.topology.reverse)}:{},maxComputeWorkgroupsPerDimension:o};ei(e,s);let n=0;for(const[a,c]of s.seeds.data.entries())c.length>0&&ti(e,{state:s,seeds:c,seedBase:n,chunkIndex:a}),n+=c.length;for(let a=0;a<t.maxDepth;a++)Nt(e,{state:s,adjacency:s.primaryAdjacency,depth:a,direction:i?"incoming":"outgoing"}),s.secondaryAdjacency&&Nt(e,{state:s,adjacency:s.secondaryAdjacency,depth:a,direction:"incoming"})}function At(t,e,o){return{offsets:t.importGPUVector(`${e}-offsets`,o.offsets).data[0],neighbors:t.importGPUVector(`${e}-neighbors`,o.neighbors).data[0],overflow:t.importGPUVector(`${e}-overflow`,o.overflow).data[0]}}function ei(t,e){const o={distances:{view:e.distances,usage:"storage-write",atomic:!0},predecessors:{view:e.predecessors,usage:"storage-write",atomic:!0},...e.mask?{mask:{view:e.mask,usage:"storage-write",atomic:!0}}:{}},i=e.mask?`const MASK_OFFSET: u32 = ${u(e.mask)}u;`:"",r=e.mask?"atomicStore(&mask[MASK_OFFSET + index], 0u);":"",s=ft(e.vertexCount,e.maxComputeWorkgroupsPerDimension),n=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const DISTANCES_OFFSET: u32 = ${u(e.distances)}u;
const PREDECESSORS_OFFSET: u32 = ${u(e.predecessors)}u;
${i}
${dt(o)}

@compute @workgroup_size(${J})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(s,J)}
  if (index >= VERTEX_COUNT) { return; }
  atomicStore(&distances[DISTANCES_OFFSET + index], ${Ut}u);
  atomicStore(&predecessors[PREDECESSORS_OFFSET + index], ${Ut}u);
  ${r}
}`;lt(t,{id:`${e.id}-initialize`,source:n,bindings:o,dispatchLayout:s})}function ti(t,e){const{state:o}=e,i={seeds:{view:e.seeds,usage:"storage-read"},distances:{view:o.distances,usage:"storage-read-write",atomic:!0},overflow:{view:o.primaryAdjacency.overflow,usage:"storage-read"},...o.secondaryAdjacency?{secondaryOverflow:{view:o.secondaryAdjacency.overflow,usage:"storage-read"}}:{},...o.mask?{mask:{view:o.mask,usage:"storage-read-write",atomic:!0}}:{},...o.seedCount?{activeSeedCount:{view:o.seedCount,usage:"storage-read"}}:{}},r=[o.secondaryAdjacency?`const SECONDARY_OVERFLOW_OFFSET: u32 = ${u(o.secondaryAdjacency.overflow)}u;`:"",o.mask?`const MASK_OFFSET: u32 = ${u(o.mask)}u;`:"",o.seedCount?`const ACTIVE_SEED_COUNT_OFFSET: u32 = ${u(o.seedCount)}u;`:""].join(`
`),s=o.secondaryAdjacency?" || secondaryOverflow[SECONDARY_OVERFLOW_OFFSET] != 0u":"",n=o.seedCount?`if (${e.seedBase}u + index >= activeSeedCount[ACTIVE_SEED_COUNT_OFFSET]) { return; }`:"",a=o.mask?"atomicStore(&mask[MASK_OFFSET + vertex], 1u);":"",c=ft(e.seeds.length,o.maxComputeWorkgroupsPerDimension),d=`
const SEED_COUNT: u32 = ${e.seeds.length}u;
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const SEEDS_OFFSET: u32 = ${u(e.seeds)}u;
const DISTANCES_OFFSET: u32 = ${u(o.distances)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.primaryAdjacency.overflow)}u;
${r}
${dt(i)}

@compute @workgroup_size(${J})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(c,J)}
  if (index >= SEED_COUNT) { return; }
  if (overflow[OVERFLOW_OFFSET] != 0u${s}) { return; }
  ${n}
  let vertex = seeds[SEEDS_OFFSET + index];
  if (vertex >= VERTEX_COUNT) { return; }
  atomicStore(&distances[DISTANCES_OFFSET + vertex], 0u);
  ${a}
}`;lt(t,{id:`${o.id}-seed-${e.chunkIndex}`,source:d,bindings:i,dispatchLayout:c})}function Nt(t,e){const{state:o,adjacency:i}=e,r={offsets:{view:i.offsets,usage:"storage-read"},neighbors:{view:i.neighbors,usage:"storage-read"},distances:{view:o.distances,usage:"storage-read-write",atomic:!0},predecessors:{view:o.predecessors,usage:"storage-read-write",atomic:!0},overflow:{view:o.primaryAdjacency.overflow,usage:"storage-read"},...o.secondaryAdjacency?{secondaryOverflow:{view:o.secondaryAdjacency.overflow,usage:"storage-read"}}:{},...o.mask?{mask:{view:o.mask,usage:"storage-read-write",atomic:!0}}:{},...o.activeDepth?{activeDepth:{view:o.activeDepth,usage:"storage-read"}}:{}},s=[o.secondaryAdjacency?`const SECONDARY_OVERFLOW_OFFSET: u32 = ${u(o.secondaryAdjacency.overflow)}u;`:"",o.mask?`const MASK_OFFSET: u32 = ${u(o.mask)}u;`:"",o.activeDepth?`const ACTIVE_DEPTH_OFFSET: u32 = ${u(o.activeDepth)}u;`:""].join(`
`),n=o.secondaryAdjacency?" || secondaryOverflow[SECONDARY_OVERFLOW_OFFSET] != 0u":"",a=o.activeDepth?`if (${e.depth}u >= activeDepth[ACTIVE_DEPTH_OFFSET]) { return; }`:"",c=o.mask?"atomicStore(&mask[MASK_OFFSET + neighbor], 1u);":"",d=ft(o.vertexCount,o.maxComputeWorkgroupsPerDimension),g=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const CAPACITY: u32 = ${i.neighbors.length}u;
const OFFSETS_OFFSET: u32 = ${u(i.offsets)}u;
const NEIGHBORS_OFFSET: u32 = ${u(i.neighbors)}u;
const DISTANCES_OFFSET: u32 = ${u(o.distances)}u;
const PREDECESSORS_OFFSET: u32 = ${u(o.predecessors)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.primaryAdjacency.overflow)}u;
${s}
${dt(r)}

@compute @workgroup_size(${J})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(d,J)}
  if (index >= VERTEX_COUNT) { return; }
  if (overflow[OVERFLOW_OFFSET] != 0u${n}) { return; }
  ${a}
  if (atomicLoad(&distances[DISTANCES_OFFSET + index]) != ${e.depth}u) { return; }
  let first = min(offsets[OFFSETS_OFFSET + index], CAPACITY);
  let last = min(offsets[OFFSETS_OFFSET + index + 1u], CAPACITY);
  for (var slot = first; slot < last; slot++) {
    let neighbor = neighbors[NEIGHBORS_OFFSET + slot];
    if (neighbor >= VERTEX_COUNT) { continue; }
    let previousDistance = atomicMin(&distances[DISTANCES_OFFSET + neighbor], ${e.depth+1}u);
    if (previousDistance >= ${e.depth+1}u) {
      atomicMin(&predecessors[PREDECESSORS_OFFSET + neighbor], index);
      ${c}
    }
  }
}`;lt(t,{id:`${o.id}-depth-${e.depth}-${e.direction}`,source:g,bindings:r,dispatchLayout:d})}function dt(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.atomic?"atomic<u32>":"u32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function lt(t,e){t.addComputePass({id:e.id,resources:Object.values(e.bindings).map(({view:o,usage:i})=>({buffer:o,usage:i})),compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c.view,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function ft(t,e){return K("GPUGraphBreadthFirstSearch",t,J,e)}const ho=4294967295,oi=1024,_e=4;class ii{id;topology;seeds;distances;predecessors;mask;seedCount;maxDepth;activeDepth;direction;constructor(e){if(this.id=e.id??"gpu-graph-breadth-first-search",this.topology=e.topology,this.seeds=e.seeds,this.distances=e.distances,this.predecessors=e.predecessors,this.mask=e.mask,this.seedCount=e.seedCount,this.maxDepth=e.maxDepth??1,this.activeDepth=e.activeDepth,this.direction=e.direction??"outgoing",!["outgoing","incoming","both"].includes(this.direction))throw new Error(`${this.id} direction must be outgoing, incoming, or both`);if(this.direction!=="outgoing"&&this.topology.graph.directed&&!this.topology.reverse)throw new Error(`${this.id} incoming or bidirectional directed search requires reverse adjacency`);if(!Number.isSafeInteger(this.maxDepth)||this.maxDepth<0||this.maxDepth>oi)throw new Error(`${this.id} maxDepth must be a safe integer between zero and 1024`);ri(this.seeds,this.id),Oe(this.distances,this.topology.graph.vertexCount,`${this.id} distances`),Oe(this.predecessors,this.topology.graph.vertexCount,`${this.id} predecessors`),this.mask&&Oe(this.mask,this.topology.graph.vertexCount,`${this.id} mask`),this.seedCount&&Oe(this.seedCount,1,`${this.id} seedCount`),this.activeDepth&&Oe(this.activeDepth,1,`${this.id} activeDepth`),si(this)}addToGraph(e){Jo(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function ri(t,e){if(Eo(t,`${e} seeds`),!Number.isSafeInteger(t.length)||t.length<0||t.length>ho||t.data.reduce((o,i)=>o+i.length,0)!==t.length)throw new Error(`${e} seed row count must fit in uint32`);for(const o of t.data)po(o,`${e} seed chunk`)}function Oe(t,e,o){if(Eo(t,o),t.data.length!==1)throw new Error(`${o} must contain exactly one packed uint32 chunk`);if(t.length!==e)throw new Error(`${o} must contain exactly ${e} uint32 rows`);if(po(t.data[0],o),t.data[0].length!==e)throw new Error(`${o} chunk must contain exactly ${e} uint32 rows`)}function Eo(t,e){if(t.format!=="uint32"||t.stride!==1||t.byteStride!==_e||t.rowByteLength!==_e||t.valueLength!==t.length||t.bufferLayout)throw new Error(`${e} must contain packed uint32 rows`)}function po(t,e){if(t.format!=="uint32"||!Number.isSafeInteger(t.length)||t.length<0||t.length>ho||t.stride!==1||t.byteStride!==_e||t.rowByteLength!==_e||t.valueLength!==t.length||!Number.isSafeInteger(t.byteOffset)||t.byteOffset<0||t.byteOffset%_e!==0)throw new Error(`${e} must contain packed, uint32-aligned rows`)}function si(t){const e=[t.topology.graph.sourceVertices,t.topology.graph.targetVertices,...t.topology.graph.edgeWeights?[t.topology.graph.edgeWeights]:[],...t.topology.graph.edgeIds?[t.topology.graph.edgeIds]:[],...Dt(t.topology.forward),...t.topology.reverse?Dt(t.topology.reverse):[],t.topology.invalidEdgeCount,t.seeds,...t.seedCount?[t.seedCount]:[],...t.activeDepth?[t.activeDepth]:[]],o=new Set;for(const r of e)for(const s of r.data)o.add(kt(s));const i=[{name:"distances",vector:t.distances},{name:"predecessors",vector:t.predecessors},...t.mask?[{name:"mask",vector:t.mask}]:[]];for(const{name:r,vector:s}of i){const n=kt(s.data[0]);if(o.has(n))throw new Error(`${t.id} ${r} must use a distinct physical buffer allocation`);o.add(n)}}function Dt(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function kt(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const X=256,ni=4294967295;function ai(t,e,o){if(t.topology.graph.vertexCount===0&&!t.converged)return;const i={id:t.id,vertexCount:t.topology.graph.vertexCount,offsets:e.importGPUVector(`${t.id}-offsets`,t.topology.forward.offsets).data[0],neighbors:e.importGPUVector(`${t.id}-neighbors`,t.topology.forward.neighbors).data[0],overflow:e.importGPUVector(`${t.id}-overflow`,t.topology.forward.overflow).data[0],output:e.importGPUVector(`${t.id}-output`,t.output).data[0],...t.converged?{converged:e.importGPUVector(`${t.id}-converged`,t.converged).data[0]}:{},maxComputeWorkgroupsPerDimension:o};if(ui(e,i),i.vertexCount!==0)for(let r=0;r<t.iterations;r++)i.converged&&ci(e,{state:i,iteration:r}),di(e,{state:i,iteration:r}),li(e,{state:i,iteration:r})}function ui(t,e){const o={output:{view:e.output,usage:"storage-write",atomic:!0},overflow:{view:e.overflow,usage:"storage-read"},...e.converged?{converged:{view:e.converged,usage:"storage-write",atomic:!0}}:{}},i=e.converged?`const CONVERGED_OFFSET: u32 = ${u(e.converged)}u;`:"",r=e.converged?`if (index == 0u) {
    let emptyAndValid = VERTEX_COUNT == 0u && !hasOverflow;
    atomicStore(&converged[CONVERGED_OFFSET], select(0u, 1u, emptyAndValid));
  }`:"",s=We(Math.max(e.vertexCount,1),e.maxComputeWorkgroupsPerDimension),n=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(e.output)}u;
const OVERFLOW_OFFSET: u32 = ${u(e.overflow)}u;
${i}
${Me(o)}

@compute @workgroup_size(${X})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(s,X)}
  let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u;
  if (index < VERTEX_COUNT) {
    let component = select(index, ${ni}u, hasOverflow);
    atomicStore(&output[OUTPUT_OFFSET + index], component);
  }
  ${r}
}`;Ge(t,{id:`${e.id}-initialize`,source:n,bindings:o,dispatchLayout:s})}function ci(t,e){const{state:o}=e,i=o.converged,r={overflow:{view:o.overflow,usage:"storage-read"},converged:{view:i,usage:"storage-write",atomic:!0}},s=We(1,o.maxComputeWorkgroupsPerDimension),n=`
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
const CONVERGED_OFFSET: u32 = ${u(i)}u;
${Me(r)}

@compute @workgroup_size(${X})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(s,X)}
  if (index != 0u) { return; }
  atomicStore(&converged[CONVERGED_OFFSET], select(1u, 0u, overflow[OVERFLOW_OFFSET] != 0u));
}`;Ge(t,{id:`${o.id}-iteration-${e.iteration}-reset`,source:n,bindings:r,dispatchLayout:s})}function di(t,e){const{state:o}=e,i={offsets:{view:o.offsets,usage:"storage-read"},neighbors:{view:o.neighbors,usage:"storage-read"},output:{view:o.output,usage:"storage-read-write",atomic:!0},overflow:{view:o.overflow,usage:"storage-read"},...o.converged?{converged:{view:o.converged,usage:"storage-read-write",atomic:!0}}:{}},r=o.converged?`const CONVERGED_OFFSET: u32 = ${u(o.converged)}u;`:"",s=o.converged?"if (previous > lower) { atomicStore(&converged[CONVERGED_OFFSET], 0u); }":"",n=We(o.vertexCount,o.maxComputeWorkgroupsPerDimension),a=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const CAPACITY: u32 = ${o.neighbors.length}u;
const OFFSETS_OFFSET: u32 = ${u(o.offsets)}u;
const NEIGHBORS_OFFSET: u32 = ${u(o.neighbors)}u;
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
${r}
${Me(i)}

@compute @workgroup_size(${X})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(n,X)}
  if (index >= VERTEX_COUNT || overflow[OVERFLOW_OFFSET] != 0u) { return; }
  let first = min(offsets[OFFSETS_OFFSET + index], CAPACITY);
  let last = min(offsets[OFFSETS_OFFSET + index + 1u], CAPACITY);
  for (var slot = first; slot < last; slot++) {
    let neighbor = neighbors[NEIGHBORS_OFFSET + slot];
    if (neighbor >= VERTEX_COUNT) { continue; }
    let sourceComponent = atomicLoad(&output[OUTPUT_OFFSET + index]);
    let neighborComponent = atomicLoad(&output[OUTPUT_OFFSET + neighbor]);
    let lower = min(sourceComponent, neighborComponent);
    let higher = max(sourceComponent, neighborComponent);
    if (higher == lower) { continue; }
    let previous = atomicMin(&output[OUTPUT_OFFSET + higher], lower);
    ${s}
  }
}`;Ge(t,{id:`${o.id}-iteration-${e.iteration}-hook`,source:a,bindings:i,dispatchLayout:n})}function li(t,e){const{state:o}=e,i={output:{view:o.output,usage:"storage-read-write",atomic:!0},overflow:{view:o.overflow,usage:"storage-read"},...o.converged?{converged:{view:o.converged,usage:"storage-read-write",atomic:!0}}:{}},r=o.converged?`const CONVERGED_OFFSET: u32 = ${u(o.converged)}u;`:"",s=o.converged?`if (previous > parentComponent) {
    atomicStore(&converged[CONVERGED_OFFSET], 0u);
  }`:"",n=We(o.vertexCount,o.maxComputeWorkgroupsPerDimension),a=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
${r}
${Me(i)}

@compute @workgroup_size(${X})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(n,X)}
  if (index >= VERTEX_COUNT || overflow[OVERFLOW_OFFSET] != 0u) { return; }
  let component = atomicLoad(&output[OUTPUT_OFFSET + index]);
  let parentComponent = atomicLoad(&output[OUTPUT_OFFSET + component]);
  if (parentComponent >= component) { return; }
  let previous = atomicMin(&output[OUTPUT_OFFSET + index], parentComponent);
  ${s}
}`;Ge(t,{id:`${o.id}-iteration-${e.iteration}-jump`,source:a,bindings:i,dispatchLayout:n})}function Me(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.atomic?"atomic<u32>":"u32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function Ge(t,e){t.addComputePass({id:e.id,resources:Object.values(e.bindings).map(({view:o,usage:i})=>({buffer:o,usage:i})),compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c.view,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function We(t,e){return K("GPUGraphConnectedComponents",t,X,e)}const fi=32,gi=1024,we=4;class vi{id;topology;output;iterations;converged;constructor(e){if(this.id=e.id??"gpu-graph-connected-components",this.topology=e.topology,this.output=e.output,this.iterations=e.iterations??fi,this.converged=e.converged,!Number.isSafeInteger(this.iterations)||this.iterations<1||this.iterations>gi)throw new Error(`${this.id} iterations must be a safe integer between one and 1024`);Mt(this.output,this.topology.graph.vertexCount,`${this.id} output`),this.converged&&Mt(this.converged,1,`${this.id} converged`),hi(this)}addToGraph(e){ai(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function Mt(t,e,o){if(t.data.length!==1||t.format!=="uint32"||t.stride!==1||t.byteStride!==we||t.rowByteLength!==we||t.valueLength!==t.length||t.bufferLayout)throw new Error(`${o} must contain exactly one packed uint32 chunk`);if(t.length!==e)throw new Error(`${o} must contain exactly ${e} uint32 rows`);const i=t.data[0];if(i.format!=="uint32"||i.length!==e||i.stride!==1||i.byteStride!==we||i.rowByteLength!==we||i.valueLength!==i.length||!Number.isSafeInteger(i.byteOffset)||i.byteOffset<0||i.byteOffset%we!==0)throw new Error(`${o} must contain one packed, uint32-aligned chunk`)}function hi(t){const e=t.topology,o=[e.graph.sourceVertices,e.graph.targetVertices,...e.graph.edgeWeights?[e.graph.edgeWeights]:[],...e.graph.edgeIds?[e.graph.edgeIds]:[],...Gt(e.forward),...e.reverse?Gt(e.reverse):[],e.invalidEdgeCount],i=new Set;for(const s of o)for(const n of s.data)i.add(Wt(n));const r=[{name:"output",vector:t.output},...t.converged?[{name:"converged",vector:t.converged}]:[]];for(const{name:s,vector:n}of r){const a=Wt(n.data[0]);if(i.has(a))throw new Error(`${t.id} ${s} must use a distinct physical buffer allocation`);i.add(a)}}function Gt(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function Wt(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const Y=256,Oo=4294967295;function Ei(t,e,o){const i=t.topology.graph.vertexCount;if(i===0&&!t.converged)return;const r=t.topology.graph.directed?t.topology.reverse:void 0,s={id:t.id,vertexCount:i,forwardOffsets:e.importGPUVector(`${t.id}-forward-offsets`,t.topology.forward.offsets).data[0],forwardNeighbors:e.importGPUVector(`${t.id}-forward-neighbors`,t.topology.forward.neighbors).data[0],forwardOverflow:e.importGPUVector(`${t.id}-forward-overflow`,t.topology.forward.overflow).data[0],...r?{reverseOffsets:e.importGPUVector(`${t.id}-reverse-offsets`,r.offsets).data[0],reverseNeighbors:e.importGPUVector(`${t.id}-reverse-neighbors`,r.neighbors).data[0],reverseOverflow:e.importGPUVector(`${t.id}-reverse-overflow`,r.overflow).data[0]}:{},output:e.importGPUVector(`${t.id}-output`,t.output).data[0],...t.converged?{converged:e.importGPUVector(`${t.id}-converged`,t.converged).data[0]}:{},...i>0?{scratch:q(e,`${t.id}-next-labels`,"uint32",i)}:{},maxComputeWorkgroupsPerDimension:o};if(pi(e,s),i!==0)for(let n=0;n<t.iterations;n++)s.converged&&Oi(e,{state:s,iteration:n}),wi(e,{state:s,iteration:n}),Si(e,{state:s,iteration:n})}function pi(t,e){const o={output:{view:e.output,usage:"storage-write"},forwardOverflow:{view:e.forwardOverflow,usage:"storage-read"},...e.reverseOverflow?{reverseOverflow:{view:e.reverseOverflow,usage:"storage-read"}}:{},...e.converged?{converged:{view:e.converged,usage:"storage-write",atomic:!0}}:{}},i=e.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(e.reverseOverflow)}u;`:"",r=e.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",s=e.converged?`const CONVERGED_OFFSET: u32 = ${u(e.converged)}u;`:"",n=e.converged?`if (index == 0u) {
    atomicStore(&converged[CONVERGED_OFFSET], select(0u, 1u, VERTEX_COUNT == 0u && !hasOverflow));
  }`:"",a=Xe(e,Math.max(e.vertexCount,1)),c=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(e.output)}u;
const FORWARD_OVERFLOW_OFFSET: u32 = ${u(e.forwardOverflow)}u;
${i}
${s}
${Be(o)}

@compute @workgroup_size(${Y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(a,Y)}
  let hasOverflow = forwardOverflow[FORWARD_OVERFLOW_OFFSET] != 0u${r};
  if (index < VERTEX_COUNT) {
    output[OUTPUT_OFFSET + index] = select(index, ${Oo}u, hasOverflow);
  }
  ${n}
}`;ze(t,{id:`${e.id}-initialize`,source:c,bindings:o,dispatchLayout:a})}function Oi(t,e){const{state:o}=e,i=o.converged,r={forwardOverflow:{view:o.forwardOverflow,usage:"storage-read"},...o.reverseOverflow?{reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{},converged:{view:i,usage:"storage-write",atomic:!0}},s=o.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",n=o.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",a=Xe(o,1),c=`
const FORWARD_OVERFLOW_OFFSET: u32 = ${u(o.forwardOverflow)}u;
const CONVERGED_OFFSET: u32 = ${u(i)}u;
${s}
${Be(r)}

@compute @workgroup_size(${Y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(a,Y)}
  if (index != 0u) { return; }
  let hasOverflow = forwardOverflow[FORWARD_OVERFLOW_OFFSET] != 0u${n};
  atomicStore(&converged[CONVERGED_OFFSET], select(1u, 0u, hasOverflow));
}`;ze(t,{id:`${o.id}-iteration-${e.iteration}-reset`,source:c,bindings:r,dispatchLayout:a})}function wi(t,e){const{state:o}=e,i=o.scratch,r={output:{view:o.output,usage:"storage-read"},scratch:{view:i,usage:"storage-write"},forwardOffsets:{view:o.forwardOffsets,usage:"storage-read"},forwardNeighbors:{view:o.forwardNeighbors,usage:"storage-read"},forwardOverflow:{view:o.forwardOverflow,usage:"storage-read"},...o.reverseOffsets&&o.reverseNeighbors&&o.reverseOverflow?{reverseOffsets:{view:o.reverseOffsets,usage:"storage-read"},reverseNeighbors:{view:o.reverseNeighbors,usage:"storage-read"},reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{}},s=!!(o.reverseOffsets&&o.reverseNeighbors&&o.reverseOverflow),n=s?`const REVERSE_CAPACITY: u32 = ${o.reverseNeighbors.length}u;
const REVERSE_OFFSETS_OFFSET: u32 = ${u(o.reverseOffsets)}u;
const REVERSE_NEIGHBORS_OFFSET: u32 = ${u(o.reverseNeighbors)}u;
const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",a=s?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",c=s?`let reverseFirst = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + vertex], REVERSE_CAPACITY);
  let reverseLast = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + vertex + 1u], REVERSE_CAPACITY);
  for (var slot = reverseFirst; slot < reverseLast; slot++) {
    let neighbor = reverseNeighbors[REVERSE_NEIGHBORS_OFFSET + slot];
    if (neighbor < VERTEX_COUNT && neighbor != vertex && output[OUTPUT_OFFSET + neighbor] == candidate) {
      votes++;
    }
  }`:"",d=s?`let reverseFirst = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + index], REVERSE_CAPACITY);
  let reverseLast = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + index + 1u], REVERSE_CAPACITY);
  for (var slot = reverseFirst; slot < reverseLast; slot++) {
    let neighbor = reverseNeighbors[REVERSE_NEIGHBORS_OFFSET + slot];
    if (neighbor >= VERTEX_COUNT || neighbor == index) { continue; }
    let candidate = output[OUTPUT_OFFSET + neighbor];
    let votes = countCandidateVotes(index, candidate);
    if (votes > selectedVotes || (votes == selectedVotes && candidate < selectedLabel)) {
      selectedLabel = candidate;
      selectedVotes = votes;
    }
  }`:"",g=Xe(o,o.vertexCount),v=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const FORWARD_CAPACITY: u32 = ${o.forwardNeighbors.length}u;
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const SCRATCH_OFFSET: u32 = ${u(i)}u;
const FORWARD_OFFSETS_OFFSET: u32 = ${u(o.forwardOffsets)}u;
const FORWARD_NEIGHBORS_OFFSET: u32 = ${u(o.forwardNeighbors)}u;
const FORWARD_OVERFLOW_OFFSET: u32 = ${u(o.forwardOverflow)}u;
${n}
${Be(r)}

fn countCandidateVotes(vertex: u32, candidate: u32) -> u32 {
  var votes = select(0u, 1u, output[OUTPUT_OFFSET + vertex] == candidate);
  let first = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + vertex], FORWARD_CAPACITY);
  let last = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + vertex + 1u], FORWARD_CAPACITY);
  for (var slot = first; slot < last; slot++) {
    let neighbor = forwardNeighbors[FORWARD_NEIGHBORS_OFFSET + slot];
    if (neighbor < VERTEX_COUNT && neighbor != vertex && output[OUTPUT_OFFSET + neighbor] == candidate) {
      votes++;
    }
  }
  ${c}
  return votes;
}

@compute @workgroup_size(${Y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(g,Y)}
  if (index >= VERTEX_COUNT) { return; }
  if (forwardOverflow[FORWARD_OVERFLOW_OFFSET] != 0u${a}) {
    scratch[SCRATCH_OFFSET + index] = ${Oo}u;
    return;
  }

  var selectedLabel = output[OUTPUT_OFFSET + index];
  var selectedVotes = countCandidateVotes(index, selectedLabel);
  let first = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + index], FORWARD_CAPACITY);
  let last = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + index + 1u], FORWARD_CAPACITY);
  for (var slot = first; slot < last; slot++) {
    let neighbor = forwardNeighbors[FORWARD_NEIGHBORS_OFFSET + slot];
    if (neighbor >= VERTEX_COUNT || neighbor == index) { continue; }
    let candidate = output[OUTPUT_OFFSET + neighbor];
    let votes = countCandidateVotes(index, candidate);
    if (votes > selectedVotes || (votes == selectedVotes && candidate < selectedLabel)) {
      selectedLabel = candidate;
      selectedVotes = votes;
    }
  }
  ${d}
  scratch[SCRATCH_OFFSET + index] = selectedLabel;
}`;ze(t,{id:`${o.id}-iteration-${e.iteration}-vote`,source:v,bindings:r,dispatchLayout:g})}function Si(t,e){const{state:o}=e,i=o.scratch,r={output:{view:o.output,usage:"storage-read-write"},scratch:{view:i,usage:"storage-read"},...o.converged?{converged:{view:o.converged,usage:"storage-read-write",atomic:!0}}:{}},s=o.converged?`const CONVERGED_OFFSET: u32 = ${u(o.converged)}u;`:"",n=o.converged?"if (nextLabel != previousLabel) { atomicStore(&converged[CONVERGED_OFFSET], 0u); }":"",a=Xe(o,o.vertexCount),c=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const SCRATCH_OFFSET: u32 = ${u(i)}u;
${s}
${Be(r)}

@compute @workgroup_size(${Y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(a,Y)}
  if (index >= VERTEX_COUNT) { return; }
  let previousLabel = output[OUTPUT_OFFSET + index];
  let nextLabel = scratch[SCRATCH_OFFSET + index];
  output[OUTPUT_OFFSET + index] = nextLabel;
  ${n}
}`;ze(t,{id:`${o.id}-iteration-${e.iteration}-publish`,source:c,bindings:r,dispatchLayout:a})}function Be(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.atomic?"atomic<u32>":"u32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function ze(t,e){t.addComputePass({id:e.id,resources:Object.values(e.bindings).map(({view:o,usage:i})=>({buffer:o,usage:i})),compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c.view,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function Xe(t,e){return mi(e,t.maxComputeWorkgroupsPerDimension)}function mi(t,e){return K("GPUGraphLabelPropagation",t,Y,e)}const Ti=32,Fi=1024,Se=4;class _i{id;topology;output;iterations;converged;constructor(e){if(this.id=e.id??"gpu-graph-label-propagation",this.topology=e.topology,this.output=e.output,this.iterations=e.iterations??Ti,this.converged=e.converged,!Number.isSafeInteger(this.iterations)||this.iterations<1||this.iterations>Fi)throw new Error(`${this.id} iterations must be a safe integer between one and 1024`);if(this.topology.graph.directed&&!this.topology.reverse)throw new Error(`${this.id} directed weak-neighbor votes require reverse adjacency`);Bt(this.output,this.topology.graph.vertexCount,`${this.id} output`),this.converged&&Bt(this.converged,1,`${this.id} converged`),xi(this)}addToGraph(e){Ei(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function Bt(t,e,o){if(t.data.length!==1||t.format!=="uint32"||t.stride!==1||t.byteStride!==Se||t.rowByteLength!==Se||t.valueLength!==t.length||t.bufferLayout)throw new Error(`${o} must contain exactly one packed uint32 chunk`);if(t.length!==e)throw new Error(`${o} must contain exactly ${e} uint32 rows`);const i=t.data[0];if(i.format!=="uint32"||i.length!==e||i.stride!==1||i.byteStride!==Se||i.rowByteLength!==Se||i.valueLength!==i.length||!Number.isSafeInteger(i.byteOffset)||i.byteOffset<0||i.byteOffset%Se!==0)throw new Error(`${o} must contain one packed, uint32-aligned chunk`)}function xi(t){const{topology:e}=t,o=[e.graph.sourceVertices,e.graph.targetVertices,...e.graph.edgeWeights?[e.graph.edgeWeights]:[],...e.graph.edgeIds?[e.graph.edgeIds]:[],...zt(e.forward),...e.reverse?zt(e.reverse):[],e.invalidEdgeCount],i=new Set;for(const s of o)for(const n of s.data)i.add(Xt(n));const r=[{name:"output",vector:t.output},...t.converged?[{name:"converged",vector:t.converged}]:[]];for(const{name:s,vector:n}of r){const a=Xt(n.data[0]);if(i.has(a))throw new Error(`${t.id} ${s} must use a distinct physical buffer allocation`);i.add(a)}}function zt(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function Xt(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const y=256;function bi(t,e,o){if(t.topology.graph.vertexCount===0&&!t.residual)return;const i=t.topology.graph.directed,r=e.importGPUVector(`${t.id}-forward-offsets`,t.topology.forward.offsets).data[0],s=i?t.topology.reverse:t.topology.forward,n={id:t.id,vertexCount:t.topology.graph.vertexCount,damping:t.damping,forwardOffsets:r,incomingOffsets:i?e.importGPUVector(`${t.id}-incoming-offsets`,s.offsets).data[0]:r,incomingNeighbors:e.importGPUVector(`${t.id}-incoming-neighbors`,s.neighbors).data[0],overflow:e.importGPUVector(`${t.id}-forward-overflow`,t.topology.forward.overflow).data[0],...i?{reverseOverflow:e.importGPUVector(`${t.id}-incoming-overflow`,s.overflow).data[0]}:{},output:e.importGPUVector(`${t.id}-output`,t.output).data[0],...t.residual?{residual:e.importGPUVector(`${t.id}-residual`,t.residual).data[0]}:{},maxComputeWorkgroupsPerDimension:o};if($i(e,n),n.vertexCount===0)return;const a=q(e,`${n.id}-workspace`,"float32",n.vertexCount),c=yi(e,n);for(let d=0;d<t.iterations;d++){Ci(e,{state:n,workspace:a,iteration:d});const g=Je(e,{id:`${n.id}-iteration-${d}-dangling`,state:n,input:a,levels:c});Ii(e,{state:n,workspace:a,danglingMass:g,iteration:d});const v=Je(e,{id:`${n.id}-iteration-${d}-sum`,state:n,input:a,levels:c}),p=!!(n.residual&&d===t.iterations-1);Vi(e,{state:n,workspace:a,rankSum:v,iteration:d,collectResidual:p}),p&&Je(e,{id:`${n.id}-residual`,state:n,input:a,levels:c,output:n.residual})}}function $i(t,e){const o={output:{view:e.output,usage:"storage-write"},overflow:{view:e.overflow,usage:"storage-read"},...e.reverseOverflow?{reverseOverflow:{view:e.reverseOverflow,usage:"storage-read"}}:{},...e.residual?{residual:{view:e.residual,usage:"storage-write"}}:{}},i=e.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(e.reverseOverflow)}u;`:"",r=e.residual?`const RESIDUAL_OFFSET: u32 = ${u(e.residual)}u;`:"",s=e.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",n=e.residual?"if (index == 0u) { residual[RESIDUAL_OFFSET] = 0.0; }":"",a=Ie(Math.max(e.vertexCount,1),e.maxComputeWorkgroupsPerDimension),c=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(e.output)}u;
const OVERFLOW_OFFSET: u32 = ${u(e.overflow)}u;
${i}
${r}
${ye(o)}

@compute @workgroup_size(${y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(a,y)}
  if (index < VERTEX_COUNT) {
    let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u${s};
    let uniformScore = 1.0 / f32(max(VERTEX_COUNT, 1u));
    output[OUTPUT_OFFSET + index] = select(uniformScore, 0.0, hasOverflow);
  }
  ${n}
}`;Ce(t,{id:`${e.id}-initialize`,source:c,bindings:o,dispatchLayout:a})}function yi(t,e){const o=[];let i=e.vertexCount;do i=Math.ceil(i/y),o.push(q(t,`${e.id}-reduction-level-${o.length}`,"float32",i));while(i>1);return o}function Ci(t,e){const{state:o,workspace:i}=e,r={output:{view:o.output,usage:"storage-read"},forwardOffsets:{view:o.forwardOffsets,usage:"storage-read"},workspace:{view:i,usage:"storage-write"},overflow:{view:o.overflow,usage:"storage-read"},...o.reverseOverflow?{reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{}},s=o.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",n=o.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",a=Ie(o.vertexCount,o.maxComputeWorkgroupsPerDimension),c=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const FORWARD_OFFSETS_OFFSET: u32 = ${u(o.forwardOffsets)}u;
const WORKSPACE_OFFSET: u32 = ${u(i)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
${s}
${ye(r)}

@compute @workgroup_size(${y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(a,y)}
  if (index >= VERTEX_COUNT) { return; }
  let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u${n};
  var contribution = 0.0;
  if (!hasOverflow) {
    let degree =
      forwardOffsets[FORWARD_OFFSETS_OFFSET + index + 1u] -
      forwardOffsets[FORWARD_OFFSETS_OFFSET + index];
    if (degree == 0u) { contribution = output[OUTPUT_OFFSET + index]; }
  }
  workspace[WORKSPACE_OFFSET + index] = contribution;
}`;Ce(t,{id:`${o.id}-iteration-${e.iteration}-gather-dangling`,source:c,bindings:r,dispatchLayout:a})}function Ii(t,e){const{state:o,workspace:i,danglingMass:r}=e,s={output:{view:o.output,usage:"storage-read"},workspace:{view:i,usage:"storage-write"},forwardOffsets:{view:o.forwardOffsets,usage:"storage-read"},...o.reverseOverflow?{incomingOffsets:{view:o.incomingOffsets,usage:"storage-read"}}:{},incomingNeighbors:{view:o.incomingNeighbors,usage:"storage-read"},danglingMass:{view:r,usage:"storage-read"},overflow:{view:o.overflow,usage:"storage-read"},...o.reverseOverflow?{reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{}},n=o.reverseOverflow?`const INCOMING_OFFSETS_OFFSET: u32 = ${u(o.incomingOffsets)}u;`:"",a=o.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",c=o.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",d=o.reverseOverflow?"incomingOffsets":"forwardOffsets",g=o.reverseOverflow?"INCOMING_OFFSETS_OFFSET":"FORWARD_OFFSETS_OFFSET",v=Ie(o.vertexCount,o.maxComputeWorkgroupsPerDimension),p=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const CAPACITY: u32 = ${o.incomingNeighbors.length}u;
const DAMPING: f32 = ${o.damping};
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const WORKSPACE_OFFSET: u32 = ${u(i)}u;
const FORWARD_OFFSETS_OFFSET: u32 = ${u(o.forwardOffsets)}u;
const INCOMING_NEIGHBORS_OFFSET: u32 = ${u(o.incomingNeighbors)}u;
const DANGLING_MASS_OFFSET: u32 = ${u(r)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
${n}
${a}
${ye(s)}

@compute @workgroup_size(${y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(v,y)}
  if (index >= VERTEX_COUNT) { return; }
  let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u${c};
  if (hasOverflow) {
    workspace[WORKSPACE_OFFSET + index] = 0.0;
    return;
  }
  let first = min(${d}[${g} + index], CAPACITY);
  let last = min(${d}[${g} + index + 1u], CAPACITY);
  var incomingMass = 0.0;
  for (var slot = first; slot < last; slot++) {
    let neighbor = incomingNeighbors[INCOMING_NEIGHBORS_OFFSET + slot];
    if (neighbor >= VERTEX_COUNT) { continue; }
    let degree =
      forwardOffsets[FORWARD_OFFSETS_OFFSET + neighbor + 1u] -
      forwardOffsets[FORWARD_OFFSETS_OFFSET + neighbor];
    if (degree > 0u) {
      incomingMass += output[OUTPUT_OFFSET + neighbor] / f32(degree);
    }
  }
  let vertexCount = f32(VERTEX_COUNT);
  let redistributedDangling = danglingMass[DANGLING_MASS_OFFSET] / vertexCount;
  let teleportation = (1.0 - DAMPING) / vertexCount;
  workspace[WORKSPACE_OFFSET + index] =
    teleportation + DAMPING * (incomingMass + redistributedDangling);
}`;Ce(t,{id:`${o.id}-iteration-${e.iteration}-pull`,source:p,bindings:s,dispatchLayout:v})}function Vi(t,e){const{state:o,workspace:i,rankSum:r}=e,s={output:{view:o.output,usage:"storage-read-write"},workspace:{view:i,usage:e.collectResidual?"storage-read-write":"storage-read"},rankSum:{view:r,usage:"storage-read"},overflow:{view:o.overflow,usage:"storage-read"},...o.reverseOverflow?{reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{}},n=o.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",a=o.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",c=e.collectResidual?"workspace[WORKSPACE_OFFSET + index] = difference;":"",d=Ie(o.vertexCount,o.maxComputeWorkgroupsPerDimension),g=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const OUTPUT_OFFSET: u32 = ${u(o.output)}u;
const WORKSPACE_OFFSET: u32 = ${u(i)}u;
const RANK_SUM_OFFSET: u32 = ${u(r)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
${n}
${ye(s)}

@compute @workgroup_size(${y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(d,y)}
  if (index >= VERTEX_COUNT) { return; }
  let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u${a};
  let total = rankSum[RANK_SUM_OFFSET];
  let validTotal = total > 0.0 && total == total && abs(total) <= 3.402823466e+38;
  var next = 0.0;
  var difference = 0.0;
  if (!hasOverflow && validTotal) {
    next = workspace[WORKSPACE_OFFSET + index] / total;
    difference = abs(next - output[OUTPUT_OFFSET + index]);
  }
  output[OUTPUT_OFFSET + index] = next;
  ${c}
}`;Ce(t,{id:`${o.id}-iteration-${e.iteration}-normalize`,source:g,bindings:s,dispatchLayout:d})}function Je(t,e){let o=e.input;for(const[i,r]of e.levels.entries()){const n=i===e.levels.length-1&&e.output?e.output:r;Ri(t,{id:`${e.id}-level-${i}`,input:o,output:n,maxComputeWorkgroupsPerDimension:e.state.maxComputeWorkgroupsPerDimension}),o=n}return o}function Ri(t,e){const o={inputValues:{view:e.input,usage:"storage-read"},outputValues:{view:e.output,usage:"storage-write"}},i=Ie(e.input.length,e.maxComputeWorkgroupsPerDimension),r=Po(t.device)==="subgroups",s=r?`let subgroupTotal = subgroupAdd(value);
  if (subgroupInvocationId == 0u) {
    reductionValues[subgroupId] = subgroupTotal;
  }
  workgroupBarrier();
  let subgroupCount = ${y}u / subgroupSize;
  if (subgroupCount > 1u) {
    for (var stride = subgroupCount / 2u; stride > 0u; stride /= 2u) {
      if (localInvocationIndex < stride) {
        reductionValues[localInvocationIndex] += reductionValues[localInvocationIndex + stride];
      }
      workgroupBarrier();
    }
  }`:`reductionValues[localInvocationIndex] = value;
  workgroupBarrier();

  for (var stride = ${y/2}u; stride > 0u; stride /= 2u) {
    if (localInvocationIndex < stride) {
      reductionValues[localInvocationIndex] += reductionValues[localInvocationIndex + stride];
    }
    workgroupBarrier();
  }`,n=`
${r?`enable subgroups;
requires subgroup_id;`:""}
const INPUT_COUNT: u32 = ${e.input.length}u;
const OUTPUT_COUNT: u32 = ${e.output.length}u;
const INPUT_OFFSET: u32 = ${u(e.input)}u;
const OUTPUT_OFFSET: u32 = ${u(e.output)}u;
${ye(o)}
var<workgroup> reductionValues: array<f32, ${y}>;

@compute @workgroup_size(${y})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  ${r?`@builtin(subgroup_invocation_id) subgroupInvocationId: u32,
  @builtin(subgroup_size) subgroupSize: u32,
  @builtin(subgroup_id) subgroupId: u32,`:""}
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(i,y)}
  if (workgroupIndex >= OUTPUT_COUNT) { return; }
  var value = 0.0;
  if (index < INPUT_COUNT) { value = inputValues[INPUT_OFFSET + index]; }
  ${s}
  if (localInvocationIndex == 0u) {
    outputValues[OUTPUT_OFFSET + workgroupIndex] = reductionValues[0];
  }
}`;Ce(t,{id:e.id,source:n,bindings:o,dispatchLayout:i})}function ye(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.view.format==="float32"?"f32":"u32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function Ce(t,e){t.addComputePass({id:e.id,resources:Object.values(e.bindings).map(({view:o,usage:i})=>({buffer:o,usage:i})),compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c.view,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function Ie(t,e){return K("GPUGraphPageRank",t,y,e)}const Pi=.85,Li=40,Ui=1024,me=4;class Ai{id;topology;output;damping;iterations;residual;constructor(e){if(this.id=e.id??"gpu-graph-page-rank",this.topology=e.topology,this.output=e.output,this.damping=e.damping??Pi,this.iterations=e.iterations??Li,this.residual=e.residual,this.topology.graph.directed&&!this.topology.reverse)throw new Error(`${this.id} directed PageRank requires reverse adjacency`);if(!Number.isFinite(this.damping)||this.damping<0||this.damping>1)throw new Error(`${this.id} damping must be a finite number between zero and one`);if(!Number.isSafeInteger(this.iterations)||this.iterations<1||this.iterations>Ui)throw new Error(`${this.id} iterations must be a safe integer between one and 1024`);Yt(this.output,this.topology.graph.vertexCount,`${this.id} output`),this.residual&&Yt(this.residual,1,`${this.id} residual`),Ni(this)}addToGraph(e){bi(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function Yt(t,e,o){if(t.data.length!==1||t.format!=="float32"||t.stride!==1||t.byteStride!==me||t.rowByteLength!==me||t.valueLength!==t.length||t.bufferLayout)throw new Error(`${o} must contain exactly one packed float32 chunk`);if(t.length!==e)throw new Error(`${o} must contain exactly ${e} float32 rows`);const i=t.data[0];if(i.format!=="float32"||i.length!==e||i.stride!==1||i.byteStride!==me||i.rowByteLength!==me||i.valueLength!==i.length||!Number.isSafeInteger(i.byteOffset)||i.byteOffset<0||i.byteOffset%me!==0)throw new Error(`${o} must contain one packed, float32-aligned chunk`)}function Ni(t){const e=t.topology,o=[e.graph.sourceVertices,e.graph.targetVertices,...e.graph.edgeWeights?[e.graph.edgeWeights]:[],...e.graph.edgeIds?[e.graph.edgeIds]:[],...Ht(e.forward),...e.reverse?Ht(e.reverse):[],e.invalidEdgeCount],i=new Set;for(const s of o)for(const n of s.data)i.add(qt(n));const r=[{name:"output",vector:t.output},...t.residual?[{name:"residual",vector:t.residual}]:[]];for(const{name:s,vector:n}of r){const a=qt(n.data[0]);if(i.has(a))throw new Error(`${t.id} ${s} must use a distinct physical buffer allocation`);i.add(a)}}function Ht(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function qt(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const V=256,Di=1e-4;function ki(t,e,o){if(t.topology.graph.vertexCount===0&&!t.reset)return;const i=t.topology.graph.directed,r=t.topology.reverse,s={id:t.id,vertexCount:t.topology.graph.vertexCount,seed:t.seed,repulsion:t.repulsion,attraction:t.attraction,gravity:t.gravity,damping:t.damping,maxVelocity:t.maxVelocity,timeStep:t.timeStep,positions:e.importGPUVector(`${t.id}-positions`,t.positions).data[0],velocities:e.importGPUVector(`${t.id}-velocities`,t.velocities).data[0],...t.pinned?{pinned:e.importGPUVector(`${t.id}-pinned`,t.pinned).data[0]}:{},...t.reset?{reset:e.importGPUVector(`${t.id}-reset`,t.reset).data[0]}:{},forwardOffsets:e.importGPUVector(`${t.id}-forward-offsets`,t.topology.forward.offsets).data[0],forwardNeighbors:e.importGPUVector(`${t.id}-forward-neighbors`,t.topology.forward.neighbors).data[0],overflow:e.importGPUVector(`${t.id}-forward-overflow`,t.topology.forward.overflow).data[0],...i&&r?{reverseOffsets:e.importGPUVector(`${t.id}-reverse-offsets`,r.offsets).data[0],reverseNeighbors:e.importGPUVector(`${t.id}-reverse-neighbors`,r.neighbors).data[0],reverseOverflow:e.importGPUVector(`${t.id}-reverse-overflow`,r.overflow).data[0]}:{},maxComputeWorkgroupsPerDimension:o};if(s.reset&&s.vertexCount>0&&Mi(e,s),s.reset&&Gi(e,s),s.vertexCount!==0)for(let n=0;n<t.iterationsPerFrame;n++)Wi(e,{state:s,iteration:n}),Bi(e,{state:s,iteration:n})}function Mi(t,e){const o=e.reset,i={positions:{view:e.positions,usage:"storage-read-write"},velocities:{view:e.velocities,usage:"storage-write"},reset:{view:o,usage:"storage-read"},overflow:{view:e.overflow,usage:"storage-read"},...e.reverseOverflow?{reverseOverflow:{view:e.reverseOverflow,usage:"storage-read"}}:{},...e.pinned?{pinned:{view:e.pinned,usage:"storage-read"}}:{}},r=e.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(e.reverseOverflow)}u;`:"",s=e.pinned?`const PINNED_OFFSET: u32 = ${u(e.pinned)}u;`:"",n=e.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",a=e.pinned?"pinned[PINNED_OFFSET + index] != 0u":"false",c=qe(e.vertexCount,e.maxComputeWorkgroupsPerDimension),d=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const SEED: u32 = ${e.seed}u;
const POSITIONS_OFFSET: u32 = ${u(e.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(e.velocities)}u;
const RESET_OFFSET: u32 = ${u(o)}u;
const OVERFLOW_OFFSET: u32 = ${u(e.overflow)}u;
${r}
${s}
${Ye(i)}

fn hash(value: u32) -> u32 {
  var result = value;
  result ^= result >> 16u;
  result *= 0x7feb352du;
  result ^= result >> 15u;
  result *= 0x846ca68bu;
  result ^= result >> 16u;
  return result;
}

@compute @workgroup_size(${V})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(c,V)}
  if (index >= VERTEX_COUNT || reset[RESET_OFFSET] == 0u) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  velocities[velocityOffset] = 0.0;
  velocities[velocityOffset + 1u] = 0.0;
  let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u${n};
  if (hasOverflow || ${a}) { return; }
  let first = hash(SEED ^ (index * 2u));
  let second = hash(SEED ^ (index * 2u + 1u));
  let positionOffset = POSITIONS_OFFSET + index * 2u;
  positions[positionOffset] = f32(first & 0x00ffffffu) / 16777216.0 * 2.0 - 1.0;
  positions[positionOffset + 1u] = f32(second & 0x00ffffffu) / 16777216.0 * 2.0 - 1.0;
}`;He(t,{id:`${e.id}-initialize`,source:d,bindings:i,dispatchLayout:c})}function Gi(t,e){const o=e.reset,i={reset:{view:o,usage:"storage-write"}},r=qe(1,e.maxComputeWorkgroupsPerDimension),s=`
const RESET_OFFSET: u32 = ${u(o)}u;
${Ye(i)}

@compute @workgroup_size(${V})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(r,V)}
  if (index == 0u) { reset[RESET_OFFSET] = 0u; }
}`;He(t,{id:`${e.id}-clear-reset`,source:s,bindings:i,dispatchLayout:r})}function Wi(t,e){const{state:o}=e,i={positions:{view:o.positions,usage:"storage-read"},velocities:{view:o.velocities,usage:"storage-read-write"},forwardOffsets:{view:o.forwardOffsets,usage:"storage-read"},forwardNeighbors:{view:o.forwardNeighbors,usage:"storage-read"},overflow:{view:o.overflow,usage:"storage-read"},...o.reverseOffsets&&o.reverseNeighbors&&o.reverseOverflow?{reverseOffsets:{view:o.reverseOffsets,usage:"storage-read"},reverseNeighbors:{view:o.reverseNeighbors,usage:"storage-read"},reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{}},r=o.reverseOffsets&&o.reverseNeighbors&&o.reverseOverflow?`const REVERSE_CAPACITY: u32 = ${o.reverseNeighbors.length}u;
const REVERSE_OFFSETS_OFFSET: u32 = ${u(o.reverseOffsets)}u;
const REVERSE_NEIGHBORS_OFFSET: u32 = ${u(o.reverseNeighbors)}u;
const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",s=o.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",n=o.reverseOffsets&&o.reverseNeighbors?`let reverseFirst = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + index], REVERSE_CAPACITY);
  let reverseLast = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + index + 1u], REVERSE_CAPACITY);
  for (var slot = reverseFirst; slot < reverseLast; slot++) {
    let neighbor = reverseNeighbors[REVERSE_NEIGHBORS_OFFSET + slot];
    if (neighbor < VERTEX_COUNT) {
      force += ATTRACTION * (readPosition(neighbor) - position);
    }
  }`:"",a=Math.ceil(o.vertexCount/V),c=qe(o.vertexCount,o.maxComputeWorkgroupsPerDimension),d=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const TILE_COUNT: u32 = ${a}u;
const FORWARD_CAPACITY: u32 = ${o.forwardNeighbors.length}u;
const POSITIONS_OFFSET: u32 = ${u(o.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(o.velocities)}u;
const FORWARD_OFFSETS_OFFSET: u32 = ${u(o.forwardOffsets)}u;
const FORWARD_NEIGHBORS_OFFSET: u32 = ${u(o.forwardNeighbors)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
const REPULSION: f32 = ${o.repulsion};
const ATTRACTION: f32 = ${o.attraction};
const GRAVITY: f32 = ${o.gravity};
const DAMPING: f32 = ${o.damping};
const MAX_VELOCITY: f32 = ${o.maxVelocity};
const TIME_STEP: f32 = ${o.timeStep};
const MINIMUM_DISTANCE_SQUARED: f32 = ${Di};
${r}
${Ye(i)}
var<workgroup> tilePositions: array<vec2<f32>, ${V}>;

fn readPosition(vertex: u32) -> vec2<f32> {
  let positionOffset = POSITIONS_OFFSET + vertex * 2u;
  return vec2<f32>(positions[positionOffset], positions[positionOffset + 1u]);
}

@compute @workgroup_size(${V})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(c,V)}
  if (workgroupIndex >= TILE_COUNT) { return; }
  let isActiveVertex = index < VERTEX_COUNT;
  let hasOverflow = overflow[OVERFLOW_OFFSET] != 0u${s};
  var position = vec2<f32>(0.0);
  if (isActiveVertex) { position = readPosition(index); }
  var force = -GRAVITY * position;

  for (var tile = 0u; tile < TILE_COUNT; tile++) {
    let sourceVertex = tile * ${V}u + localInvocationIndex;
    if (sourceVertex < VERTEX_COUNT) {
      tilePositions[localInvocationIndex] = readPosition(sourceVertex);
    } else {
      tilePositions[localInvocationIndex] = vec2<f32>(0.0);
    }
    workgroupBarrier();

    if (isActiveVertex && !hasOverflow) {
      let firstVertex = tile * ${V}u;
      let count = min(${V}u, VERTEX_COUNT - firstVertex);
      for (var localVertex = 0u; localVertex < count; localVertex++) {
        if (firstVertex + localVertex != index) {
          let difference = position - tilePositions[localVertex];
          let distanceSquared = max(dot(difference, difference), MINIMUM_DISTANCE_SQUARED);
          force += REPULSION * difference / distanceSquared;
        }
      }
    }
    workgroupBarrier();
  }

  if (!isActiveVertex) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  if (hasOverflow) {
    velocities[velocityOffset] = 0.0;
    velocities[velocityOffset + 1u] = 0.0;
    return;
  }

  let first = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + index], FORWARD_CAPACITY);
  let last = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + index + 1u], FORWARD_CAPACITY);
  for (var slot = first; slot < last; slot++) {
    let neighbor = forwardNeighbors[FORWARD_NEIGHBORS_OFFSET + slot];
    if (neighbor < VERTEX_COUNT) {
      force += ATTRACTION * (readPosition(neighbor) - position);
    }
  }
  ${n}
  let previousVelocity = vec2<f32>(velocities[velocityOffset], velocities[velocityOffset + 1u]);
  var velocity = (previousVelocity + force * TIME_STEP) * DAMPING;
  let speed = length(velocity);
  if (speed > MAX_VELOCITY) { velocity *= MAX_VELOCITY / speed; }
  velocities[velocityOffset] = velocity.x;
  velocities[velocityOffset + 1u] = velocity.y;
}`;He(t,{id:`${o.id}-iteration-${e.iteration}-forces`,source:d,bindings:i,dispatchLayout:c})}function Bi(t,e){const{state:o}=e,i={positions:{view:o.positions,usage:"storage-read-write"},velocities:{view:o.velocities,usage:"storage-read-write"},overflow:{view:o.overflow,usage:"storage-read"},...o.reverseOverflow?{reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{},...o.pinned?{pinned:{view:o.pinned,usage:"storage-read"}}:{}},r=o.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",s=o.pinned?`const PINNED_OFFSET: u32 = ${u(o.pinned)}u;`:"",n=o.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",a=o.pinned?" || pinned[PINNED_OFFSET + index] != 0u":"",c=qe(o.vertexCount,o.maxComputeWorkgroupsPerDimension),d=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const TIME_STEP: f32 = ${o.timeStep};
const POSITIONS_OFFSET: u32 = ${u(o.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(o.velocities)}u;
const OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
${r}
${s}
${Ye(i)}

@compute @workgroup_size(${V})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(c,V)}
  if (index >= VERTEX_COUNT) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  let blocked = overflow[OVERFLOW_OFFSET] != 0u${n}${a};
  if (blocked) {
    velocities[velocityOffset] = 0.0;
    velocities[velocityOffset + 1u] = 0.0;
    return;
  }
  let positionOffset = POSITIONS_OFFSET + index * 2u;
  positions[positionOffset] += velocities[velocityOffset] * TIME_STEP;
  positions[positionOffset + 1u] += velocities[velocityOffset + 1u] * TIME_STEP;
}`;He(t,{id:`${o.id}-iteration-${e.iteration}-integrate`,source:d,bindings:i,dispatchLayout:c})}function Ye(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.view.format==="uint32"?"u32":"f32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function He(t,e){t.addComputePass({id:e.id,resources:Object.values(e.bindings).map(({view:o,usage:i})=>({buffer:o,usage:i})),compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c.view,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function qe(t,e){return K("GPUGraphForceLayout",t,V,e)}const zi=4294967295,Xi=1024,jt=4;class Yi{id;topology;positions;velocities;pinned;reset;seed;iterationsPerFrame;repulsion;attraction;gravity;damping;maxVelocity;timeStep;constructor(e){if(this.id=e.id??"gpu-graph-force-layout",this.topology=e.topology,this.positions=e.positions,this.velocities=e.velocities,this.pinned=e.pinned,this.reset=e.reset,this.seed=e.seed??0,this.iterationsPerFrame=e.iterationsPerFrame??4,this.repulsion=e.repulsion??1,this.attraction=e.attraction??.1,this.gravity=e.gravity??.01,this.damping=e.damping??.9,this.maxVelocity=e.maxVelocity??1,this.timeStep=e.timeStep??1,this.topology.graph.directed&&!this.topology.reverse)throw new Error(`${this.id} directed force layout requires reverse adjacency`);if(!Number.isSafeInteger(this.seed)||this.seed<0||this.seed>zi)throw new Error(`${this.id} seed must be an unsigned 32-bit integer`);if(!Number.isSafeInteger(this.iterationsPerFrame)||this.iterationsPerFrame<1||this.iterationsPerFrame>Xi)throw new Error(`${this.id} iterationsPerFrame must be an integer between one and 1024`);if(et(this.repulsion,`${this.id} repulsion`),et(this.attraction,`${this.id} attraction`),et(this.gravity,`${this.id} gravity`),!Number.isFinite(this.damping)||this.damping<0||this.damping>1)throw new Error(`${this.id} damping must be a finite number between zero and one`);Kt(this.maxVelocity,`${this.id} maxVelocity`),Kt(this.timeStep,`${this.id} timeStep`);const o=this.topology.graph.vertexCount;Ue(this.positions,"float32x2",o,`${this.id} positions`),Ue(this.velocities,"float32x2",o,`${this.id} velocities`),this.pinned&&Ue(this.pinned,"uint32",o,`${this.id} pinned`),this.reset&&Ue(this.reset,"uint32",1,`${this.id} reset`);const i=Ne(this.positions.data[0]).usage,r=F.STORAGE|F.VERTEX;if((i&r)!==r)throw new Error(`${this.id} positions require both STORAGE and VERTEX buffer usage`);if((Ne(this.velocities.data[0]).usage&F.STORAGE)===0)throw new Error(`${this.id} velocities require STORAGE buffer usage`);Hi(this)}addToGraph(e){ki(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function et(t,e){if(!Number.isFinite(t)||t<0)throw new Error(`${e} must be a finite non-negative number`)}function Kt(t,e){if(!Number.isFinite(t)||t<=0)throw new Error(`${e} must be a finite positive number`)}function Ue(t,e,o,i){const r=e==="float32x2"?2:1,s=r*jt;if(t.data.length!==1||t.format!==e||t.stride!==r||t.byteStride!==s||t.rowByteLength!==s||t.valueLength!==t.length||t.bufferLayout)throw new Error(`${i} must contain exactly one packed ${e} chunk`);if(t.length!==o)throw new Error(`${i} must contain exactly ${o} ${e} rows`);const n=t.data[0];if(n.format!==e||n.length!==o||n.stride!==r||n.byteStride!==s||n.rowByteLength!==s||n.valueLength!==n.length||!Number.isSafeInteger(n.byteOffset)||n.byteOffset<0||n.byteOffset%jt!==0)throw new Error(`${i} must contain one packed, uint32-aligned ${e} chunk`)}function Hi(t){const e=t.topology,o=[e.graph.sourceVertices,e.graph.targetVertices,...e.graph.edgeWeights?[e.graph.edgeWeights]:[],...e.graph.edgeIds?[e.graph.edgeIds]:[],...Zt(e.forward),...e.reverse?Zt(e.reverse):[],e.invalidEdgeCount],i=new Set;for(const s of o)for(const n of s.data)i.add(Ne(n));const r=[{name:"positions",vector:t.positions},{name:"velocities",vector:t.velocities},...t.pinned?[{name:"pinned",vector:t.pinned}]:[],...t.reset?[{name:"reset",vector:t.reset}]:[]];for(const{name:s,vector:n}of r){const a=Ne(n.data[0]);if(i.has(a))throw new Error(`${t.id} ${s} must use a distinct physical buffer allocation`);i.add(a)}}function Zt(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function Ne(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const C=256,qi=1e-4;function ji(t,e,o){const i=t.layout,r=i.topology.reverse,s={id:t.id,vertexCount:i.topology.graph.vertexCount,cellCount:t.cellCount,gridSize:t.gridSize,bounds:t.bounds,theta:t.theta,nearCellRadius:t.nearCellRadius,seed:i.seed,repulsion:i.repulsion,attraction:i.attraction,gravity:i.gravity,damping:i.damping,maxVelocity:i.maxVelocity,timeStep:i.timeStep,positions:e.importGPUVector(`${t.id}-positions`,i.positions).data[0],velocities:e.importGPUVector(`${t.id}-velocities`,i.velocities).data[0],...i.pinned?{pinned:e.importGPUVector(`${t.id}-pinned`,i.pinned).data[0]}:{},...i.reset?{reset:e.importGPUVector(`${t.id}-reset`,i.reset).data[0]}:{},forwardOffsets:e.importGPUVector(`${t.id}-forward-offsets`,i.topology.forward.offsets).data[0],forwardNeighbors:e.importGPUVector(`${t.id}-forward-neighbors`,i.topology.forward.neighbors).data[0],forwardOverflow:e.importGPUVector(`${t.id}-forward-overflow`,i.topology.forward.overflow).data[0],...i.topology.graph.directed&&r?{reverseOffsets:e.importGPUVector(`${t.id}-reverse-offsets`,r.offsets).data[0],reverseNeighbors:e.importGPUVector(`${t.id}-reverse-neighbors`,r.neighbors).data[0],reverseOverflow:e.importGPUVector(`${t.id}-reverse-overflow`,r.overflow).data[0]}:{},cellOffsets:e.importGPUVector(`${t.id}-cell-offsets`,t.cellOffsets).data[0],vertexIds:e.importGPUVector(`${t.id}-vertex-ids`,t.vertexIds).data[0],cellCenters:e.importGPUVector(`${t.id}-cell-centers`,t.cellCenters).data[0],count:e.importGPUVector(`${t.id}-index-count`,t.count).data[0],overflow:e.importGPUVector(`${t.id}-index-overflow`,t.overflow).data[0],validity:q(e,`${t.id}-validity`,"uint32",1),maxComputeWorkgroupsPerDimension:o};s.reset&&s.vertexCount>0&&Ki(e,s),s.reset&&Zi(e,s);const n=s.vertexCount===0?1:i.iterationsPerFrame;for(let a=0;a<n;a++){const c=new Io({id:`${s.id}-iteration-${a}-index`,positions:s.positions,gridSize:s.gridSize,bounds:s.bounds,cellOffsets:s.cellOffsets,objectIds:s.vertexIds,count:s.count,overflow:s.overflow});go(e,Vo(c,e,s.maxComputeWorkgroupsPerDimension)),Qi(e,{state:s,iteration:a}),Ji(e,{state:s,iteration:a}),s.vertexCount>0&&(er(e,{state:s,iteration:a}),tr(e,{state:s,iteration:a}),or(e,{state:s,iteration:a}))}}function Ki(t,e){const o=e.reset,i={positions:{view:e.positions,usage:"storage-read-write"},velocities:{view:e.velocities,usage:"storage-write"},reset:{view:o,usage:"storage-read"},forwardOverflow:{view:e.forwardOverflow,usage:"storage-read"},...e.reverseOverflow?{reverseOverflow:{view:e.reverseOverflow,usage:"storage-read"}}:{},...e.pinned?{pinned:{view:e.pinned,usage:"storage-read"}}:{}},r=e.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(e.reverseOverflow)}u;`:"",s=e.pinned?`const PINNED_OFFSET: u32 = ${u(e.pinned)}u;`:"",n=e.reverseOverflow?" || reverseOverflow[REVERSE_OVERFLOW_OFFSET] != 0u":"",a=e.pinned?" || pinned[PINNED_OFFSET + index] != 0u":"",c=ie(e,e.vertexCount),d=`
const VERTEX_COUNT: u32 = ${e.vertexCount}u;
const SEED: u32 = ${e.seed}u;
const POSITIONS_OFFSET: u32 = ${u(e.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(e.velocities)}u;
const RESET_OFFSET: u32 = ${u(o)}u;
const FORWARD_OVERFLOW_OFFSET: u32 = ${u(e.forwardOverflow)}u;
${r}
${s}
${te(i)}

fn hash(value: u32) -> u32 {
  var result = value;
  result ^= result >> 16u;
  result *= 0x7feb352du;
  result ^= result >> 15u;
  result *= 0x846ca68bu;
  result ^= result >> 16u;
  return result;
}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(c,C)}
  if (index >= VERTEX_COUNT || reset[RESET_OFFSET] == 0u) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  velocities[velocityOffset] = 0.0;
  velocities[velocityOffset + 1u] = 0.0;
  if (forwardOverflow[FORWARD_OVERFLOW_OFFSET] != 0u${n}${a}) { return; }
  let first = hash(SEED ^ (index * 2u));
  let second = hash(SEED ^ (index * 2u + 1u));
  let positionOffset = POSITIONS_OFFSET + index * 2u;
  positions[positionOffset] = f32(first & 0x00ffffffu) / 16777216.0 * 2.0 - 1.0;
  positions[positionOffset + 1u] = f32(second & 0x00ffffffu) / 16777216.0 * 2.0 - 1.0;
}`;oe(t,{id:`${e.id}-initialize`,source:d,bindings:i,dispatchLayout:c})}function Zi(t,e){const o=e.reset,i={reset:{view:o,usage:"storage-write"}},r=ie(e,1),s=`
const RESET_OFFSET: u32 = ${u(o)}u;
${te(i)}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(r,C)}
  if (index == 0u) { reset[RESET_OFFSET] = 0u; }
}`;oe(t,{id:`${e.id}-clear-reset`,source:s,bindings:i,dispatchLayout:r})}function Qi(t,e){const{state:o}=e,i={count:{view:o.count,usage:"storage-read"},indexOverflow:{view:o.overflow,usage:"storage-read"},forwardOverflow:{view:o.forwardOverflow,usage:"storage-read"},validity:{view:o.validity,usage:"storage-write"},...o.reverseOverflow?{reverseOverflow:{view:o.reverseOverflow,usage:"storage-read"}}:{}},r=o.reverseOverflow?`const REVERSE_OVERFLOW_OFFSET: u32 = ${u(o.reverseOverflow)}u;`:"",s=o.reverseOverflow?" && reverseOverflow[REVERSE_OVERFLOW_OFFSET] == 0u":"",n=ie(o,1),a=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const COUNT_OFFSET: u32 = ${u(o.count)}u;
const INDEX_OVERFLOW_OFFSET: u32 = ${u(o.overflow)}u;
const FORWARD_OVERFLOW_OFFSET: u32 = ${u(o.forwardOverflow)}u;
const VALIDITY_OFFSET: u32 = ${u(o.validity)}u;
${r}
${te(i)}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(n,C)}
  if (index != 0u) { return; }
  let isValid =
    count[COUNT_OFFSET] == VERTEX_COUNT &&
    indexOverflow[INDEX_OVERFLOW_OFFSET] == 0u &&
    forwardOverflow[FORWARD_OVERFLOW_OFFSET] == 0u${s};
  validity[VALIDITY_OFFSET] = select(0u, 1u, isValid);
}`;oe(t,{id:`${o.id}-iteration-${e.iteration}-validate`,source:a,bindings:i,dispatchLayout:n})}function Ji(t,e){const{state:o}=e,i={positions:{view:o.positions,usage:"storage-read"},cellOffsets:{view:o.cellOffsets,usage:"storage-read"},vertexIds:{view:o.vertexIds,usage:"storage-read"},cellCenters:{view:o.cellCenters,usage:"storage-write"},validity:{view:o.validity,usage:"storage-read"}},r=ie(o,o.cellCount),s=`
const CELL_COUNT: u32 = ${o.cellCount}u;
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const CAPACITY: u32 = ${o.vertexIds.length}u;
const POSITIONS_OFFSET: u32 = ${u(o.positions)}u;
const CELL_OFFSETS_OFFSET: u32 = ${u(o.cellOffsets)}u;
const VERTEX_IDS_OFFSET: u32 = ${u(o.vertexIds)}u;
const CELL_CENTERS_OFFSET: u32 = ${u(o.cellCenters)}u;
const VALIDITY_OFFSET: u32 = ${u(o.validity)}u;
${te(i)}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(r,C)}
  if (index >= CELL_COUNT) { return; }
  var center = vec2<f32>(0.0);
  var mass = 0u;
  if (validity[VALIDITY_OFFSET] != 0u) {
    let first = min(cellOffsets[CELL_OFFSETS_OFFSET + index], CAPACITY);
    let last = min(cellOffsets[CELL_OFFSETS_OFFSET + index + 1u], CAPACITY);
    for (var slot = first; slot < last; slot++) {
      let vertex = vertexIds[VERTEX_IDS_OFFSET + slot];
      if (vertex < VERTEX_COUNT) {
        let positionOffset = POSITIONS_OFFSET + vertex * 2u;
        center += vec2<f32>(positions[positionOffset], positions[positionOffset + 1u]);
        mass++;
      }
    }
  }
  if (mass > 0u) { center /= f32(mass); }
  let centerOffset = CELL_CENTERS_OFFSET + index * 2u;
  cellCenters[centerOffset] = center.x;
  cellCenters[centerOffset + 1u] = center.y;
}`;oe(t,{id:`${o.id}-iteration-${e.iteration}-cell-centers`,source:s,bindings:i,dispatchLayout:r})}function er(t,e){const{state:o}=e,i={positions:{view:o.positions,usage:"storage-read"},velocities:{view:o.velocities,usage:"storage-read-write"},cellOffsets:{view:o.cellOffsets,usage:"storage-read"},vertexIds:{view:o.vertexIds,usage:"storage-read"},cellCenters:{view:o.cellCenters,usage:"storage-read"},validity:{view:o.validity,usage:"storage-read"}},r=ie(o,o.vertexCount),s=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const CELL_COUNT: u32 = ${o.cellCount}u;
const WIDTH: u32 = ${o.gridSize[0]}u;
const HEIGHT: u32 = ${o.gridSize[1]}u;
const CAPACITY: u32 = ${o.vertexIds.length}u;
const NEAR_CELL_RADIUS: u32 = ${o.nearCellRadius}u;
const MINIMUM_X: f32 = ${P(o.bounds[0])};
const MINIMUM_Y: f32 = ${P(o.bounds[1])};
const MAXIMUM_X: f32 = ${P(o.bounds[2])};
const MAXIMUM_Y: f32 = ${P(o.bounds[3])};
const THETA: f32 = ${P(o.theta)};
const REPULSION: f32 = ${P(o.repulsion)};
const GRAVITY: f32 = ${P(o.gravity)};
const TIME_STEP: f32 = ${P(o.timeStep)};
const MINIMUM_DISTANCE_SQUARED: f32 = ${qi};
const POSITIONS_OFFSET: u32 = ${u(o.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(o.velocities)}u;
const CELL_OFFSETS_OFFSET: u32 = ${u(o.cellOffsets)}u;
const VERTEX_IDS_OFFSET: u32 = ${u(o.vertexIds)}u;
const CELL_CENTERS_OFFSET: u32 = ${u(o.cellCenters)}u;
const VALIDITY_OFFSET: u32 = ${u(o.validity)}u;
${te(i)}

fn getCoordinate(value: f32, minimum: f32, maximum: f32, size: u32) -> u32 {
  if (maximum == minimum || value == minimum) { return 0u; }
  if (value == maximum) { return size - 1u; }
  if (minimum < 0.0 && maximum > 0.0) {
    let scale = max(abs(minimum), abs(maximum));
    let scaledValue = value / scale;
    let scaledMinimum = minimum / scale;
    let scaledMaximum = maximum / scale;
    return min(
      u32((scaledValue - scaledMinimum) / (scaledMaximum - scaledMinimum) * f32(size)),
      size - 1u
    );
  }
  return min(u32((value - minimum) / (maximum - minimum) * f32(size)), size - 1u);
}

fn readPosition(vertex: u32) -> vec2<f32> {
  let positionOffset = POSITIONS_OFFSET + vertex * 2u;
  return vec2<f32>(positions[positionOffset], positions[positionOffset + 1u]);
}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(r,C)}
  if (index >= VERTEX_COUNT) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  if (validity[VALIDITY_OFFSET] == 0u) {
    velocities[velocityOffset] = 0.0;
    velocities[velocityOffset + 1u] = 0.0;
    return;
  }

  let position = readPosition(index);
  let sourceColumn = getCoordinate(position.x, MINIMUM_X, MAXIMUM_X, WIDTH);
  let sourceRow = getCoordinate(position.y, MINIMUM_Y, MAXIMUM_Y, HEIGHT);
  let cellWidth = (MAXIMUM_X - MINIMUM_X) / f32(WIDTH);
  let cellHeight = (MAXIMUM_Y - MINIMUM_Y) / f32(HEIGHT);
  let cellDiameterSquared = cellWidth * cellWidth + cellHeight * cellHeight;
  var force = -GRAVITY * position;

  for (var cell = 0u; cell < CELL_COUNT; cell++) {
    let first = min(cellOffsets[CELL_OFFSETS_OFFSET + cell], CAPACITY);
    let last = min(cellOffsets[CELL_OFFSETS_OFFSET + cell + 1u], CAPACITY);
    let mass = last - first;
    if (mass == 0u) { continue; }
    let column = cell % WIDTH;
    let row = cell / WIDTH;
    let columnDistance = max(column, sourceColumn) - min(column, sourceColumn);
    let rowDistance = max(row, sourceRow) - min(row, sourceRow);
    let isNear = columnDistance <= NEAR_CELL_RADIUS && rowDistance <= NEAR_CELL_RADIUS;
    let centerOffset = CELL_CENTERS_OFFSET + cell * 2u;
    let center = vec2<f32>(cellCenters[centerOffset], cellCenters[centerOffset + 1u]);
    let centerDifference = position - center;
    let distanceSquared = dot(centerDifference, centerDifference);
    let useMonopole =
      !isNear && THETA > 0.0 && cellDiameterSquared < THETA * THETA * distanceSquared;
    if (useMonopole) {
      force += REPULSION * f32(mass) * centerDifference /
        max(distanceSquared, MINIMUM_DISTANCE_SQUARED);
      continue;
    }
    for (var slot = first; slot < last; slot++) {
      let otherVertex = vertexIds[VERTEX_IDS_OFFSET + slot];
      if (otherVertex >= VERTEX_COUNT || otherVertex == index) { continue; }
      let difference = position - readPosition(otherVertex);
      let separationSquared = max(dot(difference, difference), MINIMUM_DISTANCE_SQUARED);
      force += REPULSION * difference / separationSquared;
    }
  }

  let previous = vec2<f32>(velocities[velocityOffset], velocities[velocityOffset + 1u]);
  let velocity = previous + force * TIME_STEP;
  velocities[velocityOffset] = velocity.x;
  velocities[velocityOffset + 1u] = velocity.y;
}`;oe(t,{id:`${o.id}-iteration-${e.iteration}-repulsion`,source:s,bindings:i,dispatchLayout:r})}function tr(t,e){const{state:o}=e,i={positions:{view:o.positions,usage:"storage-read"},velocities:{view:o.velocities,usage:"storage-read-write"},forwardOffsets:{view:o.forwardOffsets,usage:"storage-read"},forwardNeighbors:{view:o.forwardNeighbors,usage:"storage-read"},validity:{view:o.validity,usage:"storage-read"},...o.reverseOffsets&&o.reverseNeighbors?{reverseOffsets:{view:o.reverseOffsets,usage:"storage-read"},reverseNeighbors:{view:o.reverseNeighbors,usage:"storage-read"}}:{}},r=o.reverseOffsets&&o.reverseNeighbors?`const REVERSE_CAPACITY: u32 = ${o.reverseNeighbors.length}u;
const REVERSE_OFFSETS_OFFSET: u32 = ${u(o.reverseOffsets)}u;
const REVERSE_NEIGHBORS_OFFSET: u32 = ${u(o.reverseNeighbors)}u;`:"",s=o.reverseOffsets&&o.reverseNeighbors?`let reverseFirst = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + index], REVERSE_CAPACITY);
  let reverseLast = min(reverseOffsets[REVERSE_OFFSETS_OFFSET + index + 1u], REVERSE_CAPACITY);
  for (var slot = reverseFirst; slot < reverseLast; slot++) {
    let neighbor = reverseNeighbors[REVERSE_NEIGHBORS_OFFSET + slot];
    if (neighbor < VERTEX_COUNT) {
      force += ATTRACTION * (readPosition(neighbor) - position);
    }
  }`:"",n=ie(o,o.vertexCount),a=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const FORWARD_CAPACITY: u32 = ${o.forwardNeighbors.length}u;
const POSITIONS_OFFSET: u32 = ${u(o.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(o.velocities)}u;
const FORWARD_OFFSETS_OFFSET: u32 = ${u(o.forwardOffsets)}u;
const FORWARD_NEIGHBORS_OFFSET: u32 = ${u(o.forwardNeighbors)}u;
const VALIDITY_OFFSET: u32 = ${u(o.validity)}u;
const ATTRACTION: f32 = ${P(o.attraction)};
const DAMPING: f32 = ${P(o.damping)};
const MAX_VELOCITY: f32 = ${P(o.maxVelocity)};
const TIME_STEP: f32 = ${P(o.timeStep)};
${r}
${te(i)}

fn readPosition(vertex: u32) -> vec2<f32> {
  let positionOffset = POSITIONS_OFFSET + vertex * 2u;
  return vec2<f32>(positions[positionOffset], positions[positionOffset + 1u]);
}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(n,C)}
  if (index >= VERTEX_COUNT) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  if (validity[VALIDITY_OFFSET] == 0u) {
    velocities[velocityOffset] = 0.0;
    velocities[velocityOffset + 1u] = 0.0;
    return;
  }
  let position = readPosition(index);
  var force = vec2<f32>(0.0);
  let first = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + index], FORWARD_CAPACITY);
  let last = min(forwardOffsets[FORWARD_OFFSETS_OFFSET + index + 1u], FORWARD_CAPACITY);
  for (var slot = first; slot < last; slot++) {
    let neighbor = forwardNeighbors[FORWARD_NEIGHBORS_OFFSET + slot];
    if (neighbor < VERTEX_COUNT) {
      force += ATTRACTION * (readPosition(neighbor) - position);
    }
  }
  ${s}
  let previous = vec2<f32>(velocities[velocityOffset], velocities[velocityOffset + 1u]);
  var velocity = (previous + force * TIME_STEP) * DAMPING;
  let speed = length(velocity);
  if (speed > MAX_VELOCITY) { velocity *= MAX_VELOCITY / speed; }
  velocities[velocityOffset] = velocity.x;
  velocities[velocityOffset + 1u] = velocity.y;
}`;oe(t,{id:`${o.id}-iteration-${e.iteration}-attraction`,source:a,bindings:i,dispatchLayout:n})}function or(t,e){const{state:o}=e,i={positions:{view:o.positions,usage:"storage-read-write"},velocities:{view:o.velocities,usage:"storage-read-write"},validity:{view:o.validity,usage:"storage-read"},...o.pinned?{pinned:{view:o.pinned,usage:"storage-read"}}:{}},r=o.pinned?`const PINNED_OFFSET: u32 = ${u(o.pinned)}u;`:"",s=o.pinned?" || pinned[PINNED_OFFSET + index] != 0u":"",n=ie(o,o.vertexCount),a=`
const VERTEX_COUNT: u32 = ${o.vertexCount}u;
const POSITIONS_OFFSET: u32 = ${u(o.positions)}u;
const VELOCITIES_OFFSET: u32 = ${u(o.velocities)}u;
const VALIDITY_OFFSET: u32 = ${u(o.validity)}u;
const TIME_STEP: f32 = ${P(o.timeStep)};
${r}
${te(i)}

@compute @workgroup_size(${C})
fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${E(n,C)}
  if (index >= VERTEX_COUNT) { return; }
  let velocityOffset = VELOCITIES_OFFSET + index * 2u;
  if (validity[VALIDITY_OFFSET] == 0u${s}) {
    velocities[velocityOffset] = 0.0;
    velocities[velocityOffset + 1u] = 0.0;
    return;
  }
  let positionOffset = POSITIONS_OFFSET + index * 2u;
  positions[positionOffset] += velocities[velocityOffset] * TIME_STEP;
  positions[positionOffset + 1u] += velocities[velocityOffset + 1u] * TIME_STEP;
}`;oe(t,{id:`${o.id}-iteration-${e.iteration}-integrate`,source:a,bindings:i,dispatchLayout:n})}function te(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.view.format==="uint32"?"u32":"f32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function oe(t,e){t.addComputePass({id:e.id,resources:Object.values(e.bindings).map(({view:o,usage:i})=>({buffer:o,usage:i})),compile:({device:o})=>{const i=new H(o,{id:e.id,source:e.source,shaderLayout:{bindings:Object.keys(e.bindings).map((r,s)=>({name:r,type:"storage",group:0,location:s}))}});return{encode:({computePass:r,getBuffer:s})=>{const n={};for(const[a,c]of Object.entries(e.bindings))n[a]=z(c.view,s);i.setBindings(n),i.dispatch(r,e.dispatchLayout.x,e.dispatchLayout.y,e.dispatchLayout.z)},destroy:()=>i.destroy()}}})}function P(t){const e=`${Math.fround(t)}`;return e.includes(".")||e.includes("e")?e:`${e}.0`}function ie(t,e){return ir(e,t.maxComputeWorkgroupsPerDimension)}function ir(t,e){return K("GPUGraphSpatialForceLayout",t,C,e)}const st=4294967295,Qt=4;class rr{id;layout;gridSize;bounds;theta;nearCellRadius;cellCount;cellOffsets;vertexIds;cellCenters;count;overflow;constructor(e){if(this.id=e.id??"gpu-graph-spatial-force-layout",this.layout=e.layout,this.gridSize=e.gridSize,this.bounds=e.bounds,this.theta=e.theta??.6,this.nearCellRadius=e.nearCellRadius??1,this.cellOffsets=e.cellOffsets,this.vertexIds=e.vertexIds,this.cellCenters=e.cellCenters,this.count=e.count,this.overflow=e.overflow,this.gridSize.length!==2||this.gridSize.some(i=>!Number.isSafeInteger(i)||i<1))throw new Error(`${this.id} gridSize requires two positive integer dimensions`);const o=this.gridSize[0]*this.gridSize[1];if(!Number.isSafeInteger(o)||o>=st)throw new Error(`${this.id} grid cell count and trailing offset must fit in uint32`);if(this.cellCount=o,this.bounds.length!==4||!this.bounds.every(Number.isFinite)||this.bounds[0]>=this.bounds[2]||this.bounds[1]>=this.bounds[3])throw new Error(`${this.id} bounds require finite, strictly increasing x and y extents`);if(!Number.isFinite(this.theta)||this.theta<0)throw new Error(`${this.id} theta must be a finite non-negative number`);if(!Number.isSafeInteger(this.nearCellRadius)||this.nearCellRadius<0||this.nearCellRadius>st)throw new Error(`${this.id} nearCellRadius must be a non-negative uint32`);Te(this.cellOffsets,"uint32",`${this.id} cellOffsets`,o+1),Te(this.vertexIds,"uint32",`${this.id} vertexIds`),Te(this.cellCenters,"float32x2",`${this.id} cellCenters`,o),Te(this.count,"uint32",`${this.id} count`,1),Te(this.overflow,"uint32",`${this.id} overflow`,1),sr(this)}addToGraph(e){ji(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function Te(t,e,o,i){const r=e==="float32x2"?2:1,s=r*Qt;if(t.data.length!==1||t.format!==e||t.stride!==r||t.byteStride!==s||t.rowByteLength!==s||t.valueLength!==t.length||t.bufferLayout||!Number.isSafeInteger(t.length)||t.length<0||t.length>st)throw new Error(`${o} must contain exactly one packed ${e} chunk`);if(i!==void 0&&t.length!==i)throw new Error(`${o} must contain exactly ${i} ${e} rows`);const n=t.data[0];if(n.format!==e||n.length!==t.length||n.stride!==r||n.byteStride!==s||n.rowByteLength!==s||n.valueLength!==n.length||!Number.isSafeInteger(n.byteOffset)||n.byteOffset<0||n.byteOffset%Qt!==0)throw new Error(`${o} must contain one packed, uint32-aligned ${e} chunk`)}function sr(t){const e=t.layout,o=e.topology,i=[o.graph.sourceVertices,o.graph.targetVertices,...o.graph.edgeWeights?[o.graph.edgeWeights]:[],...o.graph.edgeIds?[o.graph.edgeIds]:[],...Jt(o.forward),...o.reverse?Jt(o.reverse):[],o.invalidEdgeCount,e.positions,e.velocities,...e.pinned?[e.pinned]:[],...e.reset?[e.reset]:[]],r=new Set;for(const n of i)for(const a of n.data)r.add(eo(a));const s=[{name:"cellOffsets",vector:t.cellOffsets},{name:"vertexIds",vector:t.vertexIds},{name:"cellCenters",vector:t.cellCenters},{name:"count",vector:t.count},{name:"overflow",vector:t.overflow}];for(const{name:n,vector:a}of s){const c=eo(a.data[0]);if(r.has(c))throw new Error(`${t.id} ${n} must use a distinct physical buffer allocation`);r.add(c)}}function Jt(t){return[t.offsets,t.neighbors,t.edgeIds,...t.edgeWeights?[t.edgeWeights]:[],t.count,t.overflow]}function eo(t){return t.buffer instanceof j?t.buffer.buffer:t.buffer}const Fe=4,to=8,oo=2,nr=512,ar=16384,ur=65536,cr=65536,tt=[-2,-2,2,2],io=.1;class dr{constructor(e,o,i={}){if(this.id="gpu-graph-deck-effect",this.props={},this.useInPicking=!1,this.layoutPaused=!1,this.buffers=[],this.vectors=[],this.pinnedVertices=new Set,this.selectedVertex=0,this.neighborhoodDepth=oo,this.completedAnalysisStages=0,this.searchPending=!0,this.frameCount=0,this.previousFrameTime=0,this.analysisEncodeMilliseconds=0,this.smoothedFramesPerSecond=0,this.destroyed=!1,e.type!=="webgpu")throw new Error("GPUGraphDeckEffect requires WebGPU");this.device=e,this.dataset=o,this.onStats=i.onStats;const r=o.sourceChunks.reduce((v,p)=>v+p.length,0),s=Math.max(o.vertexCount*8,r*Fe);if(s>e.limits.maxStorageBufferBindingSize||s>e.limits.maxBufferSize)throw new Error("Graph population exceeds the current WebGPU adapter buffer limits");const n=o.vertexCount>=ar;if(this.activeLayoutMode=i.layoutMode==="sampled"||n?"sampled":i.layoutMode==="spatial"||o.vertexCount>nr?"spatial":"exact",this.activeLayoutMode==="sampled"&&!i.addSampledLayoutToGraph)throw new Error("Sampled graph layout requires a caller-provided GPU contributor");this.renderMode=i.pointMode??o.vertexCount>=ur?"points":"circles",this.renderedVertexCount=o.vertexCount;const a=Math.max(0,Math.floor(i.maxVisibleEdges??cr));if(this.graph=new No({vertexCount:o.vertexCount,directed:!0,sourceVertices:this.createChunkedVector("source-vertices",o.sourceChunks),targetVertices:this.createChunkedVector("target-vertices",o.targetChunks)}),this.renderedEdgeCount=Math.min(this.graph.edgeCount,a),this.topology=new Xo({id:"gpu-graph-deck-topology",graph:this.graph,forward:this.createAdjacency("forward",o.vertexCount,this.graph.edgeCount),reverse:this.createAdjacency("reverse",o.vertexCount,this.graph.edgeCount),invalidEdgeCount:this.createScalarVector("invalid-edges","uint32",1)}),this.degree=new Ko({id:"gpu-graph-deck-degree",topology:this.topology,output:this.createScalarVector("degrees","uint32",o.vertexCount)}),this.pageRank=new Ai({id:"gpu-graph-deck-page-rank",topology:this.topology,output:this.createScalarVector("importance","float32",o.vertexCount),iterations:n?2:12}),this.components=new vi({id:"gpu-graph-deck-components",topology:this.topology,output:this.createScalarVector("components","uint32",o.vertexCount),iterations:n?2:16}),this.communities=new _i({id:"gpu-graph-deck-communities",topology:this.topology,output:this.createScalarVector("communities","uint32",o.vertexCount),iterations:n?2:8}),this.seeds=this.createScalarVector("seeds","uint32",1,Uint32Array.of(0)),this.seedCount=this.createScalarVector("seed-count","uint32",1,Uint32Array.of(1)),this.activeDepth=this.createScalarVector("active-depth","uint32",1,Uint32Array.of(oo)),this.search=new ii({id:"gpu-graph-deck-neighborhood",topology:this.topology,seeds:this.seeds,seedCount:this.seedCount,distances:this.createScalarVector("distances","uint32",o.vertexCount),predecessors:this.createScalarVector("predecessors","uint32",o.vertexCount),mask:this.createScalarVector("selection-mask","uint32",o.vertexCount),maxDepth:to,activeDepth:this.activeDepth,direction:"both"}),this.pinned=this.createScalarVector("pinned","uint32",o.vertexCount),this.reset=this.createScalarVector("reset","uint32",1,Uint32Array.of(0)),this.layout=new Yi({id:"gpu-graph-deck-force-layout",topology:this.topology,positions:this.createCoordinateVector("positions",o.positions,F.VERTEX),velocities:this.createCoordinateVector("velocities",o.velocities),pinned:this.pinned,reset:this.reset,seed:439041101,iterationsPerFrame:this.activeLayoutMode==="exact"?2:1,repulsion:this.activeLayoutMode==="sampled"?.0015:.005*Math.min(1,128/o.vertexCount),attraction:this.activeLayoutMode==="sampled"?.04:.045,gravity:this.activeLayoutMode==="sampled"?.005:.025,damping:this.activeLayoutMode==="sampled"?.9:.85,maxVelocity:this.activeLayoutMode==="sampled"?.02:this.activeLayoutMode==="spatial"?.025:.045}),this.activeLayoutMode==="spatial"){const v=lr(o.vertexCount),p=v[0]*v[1];this.spatialLayout=new rr({id:"gpu-graph-deck-spatial-layout",layout:this.layout,gridSize:v,bounds:tt,theta:.65,nearCellRadius:1,cellOffsets:this.createScalarVector("spatial-cell-offsets","uint32",p+1),vertexIds:this.createScalarVector("spatial-vertex-ids","uint32",o.vertexCount),cellCenters:this.createCoordinateVector("spatial-cell-centers",new Float32Array(p*2)),count:this.createScalarVector("spatial-count","uint32",1),overflow:this.createScalarVector("spatial-overflow","uint32",1)})}const c=new Re(e,{id:"gpu-graph-deck-analysis"});if(this.topology.addToGraph(c),this.degree.addToGraph(c),n||(this.components.addToGraph(c),this.communities.addToGraph(c),this.pageRank.addToGraph(c)),this.analysisGraph=c.compile(),this.analysisStages=[this.analysisGraph],n)for(const[v,p]of[["components",this.components],["communities",this.communities],["page-rank",this.pageRank]]){const L=new Re(e,{id:`gpu-graph-deck-${v}-analysis`});p.addToGraph(L),this.analysisStages.push(L.compile())}const d=new Re(e,{id:"gpu-graph-deck-frame"}),g=new Re(e,{id:"gpu-graph-deck-selection"});this.search.addToGraph(g),this.searchGraph=g.compile(),this.activeLayoutMode==="sampled"?i.addSampledLayoutToGraph(d,this.layout):this.spatialLayout?this.spatialLayout.addToGraph(d):this.layout.addToGraph(d),this.frameGraph=d.compile()}get positions(){return this.getVectorBuffer(this.layout.positions)}get importance(){return this.getVectorBuffer(this.pageRank.output)}get componentLabels(){return this.getVectorBuffer(this.components.output)}get communityLabels(){return this.getVectorBuffer(this.communities.output)}get degreeValues(){return this.getVectorBuffer(this.degree.output)}get distances(){return this.getVectorBuffer(this.search.distances)}get selectionMask(){return this.getVectorBuffer(this.search.mask)}get currentSelection(){return this.selectedVertex}get currentNeighborhoodDepth(){return this.neighborhoodDepth}setup(e){}preRender(e){if(this.destroyed||!e.viewports[0])return;let o=!1;if(this.completedAnalysisStages<this.analysisStages.length){const n=this.analysisStages[this.completedAnalysisStages].encode(this.device.commandEncoder,{parameters:void 0});this.analysisEncodeMilliseconds+=n.stats.cpuEncodeTimeMilliseconds,this.completedAnalysisStages++,o=!0}if(this.searchGraph&&this.searchPending&&this.completedAnalysisStages>0&&(this.searchGraph.encode(this.device.commandEncoder,{parameters:void 0}),this.searchPending=!1),this.layoutPaused){o&&this.publishStats(0);return}const i=this.frameGraph.encode(this.device.commandEncoder,{parameters:void 0});this.frameCount++;const r=performance.now();if(this.previousFrameTime>0&&r>this.previousFrameTime){const s=1e3/(r-this.previousFrameTime);this.smoothedFramesPerSecond=this.smoothedFramesPerSecond===0?s:this.smoothedFramesPerSecond*.85+s*.15}this.previousFrameTime=r,(this.frameCount===1||o||this.frameCount%10===0)&&this.publishStats(i.stats.cpuEncodeTimeMilliseconds)}setSelectedVertex(e){e!==null&&!this.isValidVertex(e)||(this.selectedVertex=e,e===null?this.getVectorBuffer(this.seedCount).write(Uint32Array.of(0)):(this.getVectorBuffer(this.seeds).write(Uint32Array.of(e)),this.getVectorBuffer(this.seedCount).write(Uint32Array.of(1))),this.searchPending=!0)}setNeighborhoodDepth(e){this.neighborhoodDepth=Math.max(0,Math.min(to,Math.round(e))),this.getVectorBuffer(this.activeDepth).write(Uint32Array.of(this.neighborhoodDepth)),this.searchPending=!0}setPinnedVertex(e,o){this.isValidVertex(e)&&(this.getVectorBuffer(this.pinned).write(Uint32Array.of(o?1:0),e*Fe),o?this.pinnedVertices.add(e):this.pinnedVertices.delete(e))}isVertexPinned(e){return this.pinnedVertices.has(e)}setVertexPosition(e,o){if(!this.isValidVertex(e)||!o.every(Number.isFinite))return;const i=this.spatialLayout?o.map((r,s)=>Math.min(tt[s+2]-io,Math.max(tt[s]+io,r))):o;this.positions.write(Float32Array.from(i),e*2*Fe),this.getVectorBuffer(this.layout.velocities).write(Float32Array.of(0,0),e*2*Fe)}clearPins(){this.getVectorBuffer(this.pinned).write(new Uint32Array(this.graph.vertexCount)),this.pinnedVertices.clear()}requestReset(){this.getVectorBuffer(this.reset).write(Uint32Array.of(1))}cleanup(e){if(!this.destroyed){this.destroyed=!0;for(const o of this.analysisStages)o.destroy();this.searchGraph?.destroy(),this.frameGraph.destroy();for(const o of this.vectors.reverse())o.destroy();for(const o of this.buffers.reverse())o.destroy()}}isValidVertex(e){return Number.isSafeInteger(e)&&e>=0&&e<this.graph.vertexCount}publishStats(e){if(!this.onStats)return;const o=this.spatialLayout,i=o?[o.cellOffsets,o.vertexIds,o.cellCenters,o.count,o.overflow].reduce((r,s)=>r+this.getVectorBuffer(s).byteLength,0):0;this.onStats({vertexCount:this.graph.vertexCount,edgeCount:this.graph.edgeCount,renderedVertexCount:this.renderedVertexCount,renderedEdgeCount:this.renderedEdgeCount,frameCount:this.frameCount,layoutMode:this.activeLayoutMode,renderMode:this.renderMode,gridCellCount:o?.cellCount??0,residentBufferBytes:this.buffers.reduce((r,s)=>r+s.byteLength,0),transientBufferBytes:this.analysisStages.reduce((r,s)=>r+s.stats.physicalTransientBytes,0)+(this.searchGraph?.stats.physicalTransientBytes??0)+this.frameGraph.stats.physicalTransientBytes,spatialIndexBytes:i,analysisNodeCount:this.analysisStages.reduce((r,s)=>r+s.stats.nodeOrder.length,0),frameNodeCount:this.frameGraph.stats.nodeOrder.length,analysisEncodeMilliseconds:this.analysisEncodeMilliseconds,frameEncodeMilliseconds:e,framesPerSecond:this.smoothedFramesPerSecond,completedAnalysisStages:this.completedAnalysisStages,totalAnalysisStages:this.analysisStages.length,pageRankIterations:this.pageRank.iterations,componentIterations:this.components.iterations,communityIterations:this.communities.iterations})}createChunkedVector(e,o){const i=o.map((s,n)=>{const a=this.device.createBuffer({id:`gpu-graph-deck-${e}-${n}`,data:s.length===0?new Uint32Array(1):s,usage:F.STORAGE|F.COPY_DST});return this.buffers.push(a),new Fo({buffer:a,format:"uint32",length:s.length,ownsBuffer:!1})}),r=new Ze({type:"data",name:e,format:"uint32",data:i,ownsData:!1});return this.vectors.push(r),r}createScalarVector(e,o,i,r){const s=this.device.createBuffer({id:`gpu-graph-deck-${e}`,byteLength:Math.max(i,1)*Fe,usage:F.STORAGE|F.COPY_SRC|F.COPY_DST});r?.length&&s.write(r),this.buffers.push(s);const n=new Ze({type:"buffer",name:e,format:o,buffer:s,length:i,ownsBuffer:!1});return this.vectors.push(n),n}createCoordinateVector(e,o,i=0){const r=this.device.createBuffer({id:`gpu-graph-deck-${e}`,data:o,usage:F.STORAGE|F.COPY_DST|F.COPY_SRC|i});this.buffers.push(r);const s=new Ze({type:"buffer",name:e,format:"float32x2",buffer:r,length:o.length/2,ownsBuffer:!1});return this.vectors.push(s),s}createAdjacency(e,o,i){return{offsets:this.createScalarVector(`${e}-offsets`,"uint32",o+1),neighbors:this.createScalarVector(`${e}-neighbors`,"uint32",i),edgeIds:this.createScalarVector(`${e}-edge-ids`,"uint32",i),count:this.createScalarVector(`${e}-count`,"uint32",1),overflow:this.createScalarVector(`${e}-overflow`,"uint32",1)}}getVectorBuffer(e){return e.data[0].buffer}}function lr(t){const e=Math.max(4,Math.min(32,Math.ceil(Math.sqrt(3)*t**.25)));return[e,e]}const ro={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},fr=`
struct EdgeStyle {
  opacity: f32,
  _padding1: f32,
  _padding2: f32,
  _padding3: f32,
};

@group(0) @binding(auto) var<storage, read> positions: array<vec2<f32>>;
@group(0) @binding(auto) var<storage, read> sourceVertices: array<u32>;
@group(0) @binding(auto) var<storage, read> targetVertices: array<u32>;
@group(0) @binding(auto) var<storage, read> distances: array<u32>;
@group(0) @binding(auto) var<uniform> edgeStyle: EdgeStyle;

struct EdgeVertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
};

@vertex fn vertexMain(
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> EdgeVertexOutput {
  let sourceVertex = sourceVertices[instanceIndex];
  let targetVertex = targetVertices[instanceIndex];
  let vertex = select(sourceVertex, targetVertex, vertexIndex != 0u);
  let position = positions[vertex];
  let sourceReached = distances[sourceVertex] != 0xffffffffu;
  let targetReached = distances[targetVertex] != 0xffffffffu;
  let isSelectedEdge = sourceReached && targetReached;

  geometry.worldPosition = vec3<f32>(position, 0.0);
  var output: EdgeVertexOutput;
  var clipPosition = project_position_to_clipspace(
    vec3<f32>(position, 0.0),
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  // Deck's OpenGL-style projection depth must be converted for WebGPU clipping.
  output.position = clipPosition;
  output.color = select(
    vec4<f32>(0.32, 0.51, 0.70, 0.20),
    vec4<f32>(0.95, 0.72, 0.32, 0.82),
    isSelectedEdge
  );
  return output;
}

@fragment fn fragmentMain(input: EdgeVertexOutput) -> @location(0) vec4<f32> {
  return vec4<f32>(input.color.rgb, input.color.a * edgeStyle.opacity);
}`,De=class De extends lo{getAttributeManager(){return null}getNumInstances(){return this.props.edgeCount}initializeState({device:e}){if(e.type!=="webgpu")throw new Error("GPUGraphEdgeLayer requires WebGPU");const o=e.createBuffer({id:`${this.id}-style-uniforms`,byteLength:16,usage:F.UNIFORM|F.COPY_DST}),i=new fo(e,{...this.getShaders({modules:[vo],source:fr}),id:`${this.id}-model`,topology:"line-list",isInstanced:!0,vertexCount:2,instanceCount:this.props.edgeCount,bufferLayout:[],bindings:{positions:this.props.positions,sourceVertices:this.props.sourceVertices,targetVertices:this.props.targetVertices,distances:this.props.distances,edgeStyle:o},parameters:ro});this.setState({model:i,styleUniforms:o})}updateState({props:e,oldProps:o}){const{model:i,styleUniforms:r}=this.state;!i||!r||((e.positions!==o.positions||e.sourceVertices!==o.sourceVertices||e.targetVertices!==o.targetVertices||e.distances!==o.distances)&&i.setBindings({positions:e.positions,sourceVertices:e.sourceVertices,targetVertices:e.targetVertices,distances:e.distances,edgeStyle:r}),i.setInstanceCount(e.edgeCount))}getModels(){const e=this.state.model;return e?[e]:[]}draw({renderPass:e}){const{model:o,styleUniforms:i}=this.state;!o||!i||(i.write(new Float32Array([this.props.opacity??1,0,0,0])),o.setInstanceCount(this.props.edgeCount),o.draw(e))}finalizeState(e){const o=this.state;o.model?.destroy(),o.styleUniforms?.destroy(),this.setState({model:null,styleUniforms:null}),super.finalizeState(e)}};De.layerName="GPUGraphEdgeLayer",De.defaultProps={parameters:ro};let nt=De;const ot=65536,so={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},gr=`
struct NodeStyle {
  radiusPixels: f32,
  opacity: f32,
  pickingActive: f32,
  vertexCount: f32,
  colorMode: u32,
  sizeMode: u32,
  pointMode: u32,
  _padding1: u32,
};

@group(0) @binding(auto) var<storage, read> importance: array<f32>;
@group(0) @binding(auto) var<storage, read> components: array<u32>;
@group(0) @binding(auto) var<storage, read> communities: array<u32>;
@group(0) @binding(auto) var<storage, read> degrees: array<u32>;
@group(0) @binding(auto) var<storage, read> distances: array<u32>;
@group(0) @binding(auto) var<storage, read> selectionMask: array<u32>;
@group(0) @binding(auto) var<uniform> nodeStyle: NodeStyle;

struct NodeVertexOutput {
  @builtin(position) position: vec4<f32>,
  @location(0) corner: vec2<f32>,
  @location(1) color: vec4<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
};

fn getNodeCorner(vertexIndex: u32) -> vec2<f32> {
  let corners = array<vec2<f32>, 6>(
    vec2<f32>(-1.0, -1.0), vec2<f32>(1.0, -1.0), vec2<f32>(-1.0, 1.0),
    vec2<f32>(-1.0, 1.0), vec2<f32>(1.0, -1.0), vec2<f32>(1.0, 1.0)
  );
  return corners[vertexIndex];
}

fn getGroupColor(group: u32) -> vec3<f32> {
  let colors = array<vec3<f32>, 7>(
    vec3<f32>(0.26, 0.79, 1.00),
    vec3<f32>(1.00, 0.58, 0.28),
    vec3<f32>(0.74, 0.48, 1.00),
    vec3<f32>(0.34, 0.92, 0.66),
    vec3<f32>(1.00, 0.41, 0.66),
    vec3<f32>(0.96, 0.86, 0.34),
    vec3<f32>(0.42, 0.62, 1.00)
  );
  return colors[group % 7u];
}

fn getNodeAnalyticColor(index: u32) -> vec3<f32> {
  if (nodeStyle.colorMode == 0u) {
    let label = communities[index];
    let communitySpan = max(u32(nodeStyle.vertexCount) / 4u, 1u);
    let visibleLabel = select(label, min(label / communitySpan, 3u),
      nodeStyle.pointMode != 0u && nodeStyle.vertexCount >= 16384.0);
    return getGroupColor(visibleLabel);
  }
  if (nodeStyle.colorMode == 1u) {
    return getGroupColor(components[index]);
  }
  if (nodeStyle.colorMode == 2u) {
    return mix(vec3<f32>(0.24, 0.49, 0.94), vec3<f32>(1.0, 0.42, 0.21),
      clamp(f32(degrees[index]) / 12.0, 0.0, 1.0));
  }
  if (nodeStyle.colorMode == 3u) {
    return mix(vec3<f32>(0.35, 0.26, 0.82), vec3<f32>(1.0, 0.79, 0.28),
      clamp(importance[index] * nodeStyle.vertexCount / 3.0, 0.0, 1.0));
  }
  let distanceValue = distances[index];
  if (distanceValue == 0xffffffffu) {
    return vec3<f32>(0.26, 0.31, 0.43);
  }
  return mix(vec3<f32>(1.0, 0.80, 0.31), vec3<f32>(0.25, 0.70, 1.0),
    clamp(f32(distanceValue) / 6.0, 0.0, 1.0));
}

fn encodeNodePickingColor(vertex: u32) -> vec3<f32> {
  let index = vertex + 1u;
  return vec3<f32>(
    f32(index % 256u),
    f32((index / 256u) % 256u),
    f32((index / 65536u) % 256u)
  ) / 255.0;
}

@vertex fn vertexMain(
  @location(0) nodePosition: vec2<f32>,
  @builtin(vertex_index) vertexIndex: u32,
  @builtin(instance_index) instanceIndex: u32
) -> NodeVertexOutput {
  let corner = select(getNodeCorner(vertexIndex), vec2<f32>(0.0), nodeStyle.pointMode != 0u);
  let pickingColor = encodeNodePickingColor(instanceIndex);
  let inNeighborhood = selectionMask[instanceIndex] != 0u;
  let reached = distances[instanceIndex] != 0xffffffffu;
  let rank = max(importance[instanceIndex] * nodeStyle.vertexCount, 0.0);
  let degreeScale = sqrt(max(f32(degrees[instanceIndex]), 1.0));
  let rankScale = clamp(sqrt(rank), 0.65, 2.3);
  let metricScale = select(rankScale, clamp(degreeScale * 0.48, 0.65, 2.4),
    nodeStyle.sizeMode == 1u);
  var radius = nodeStyle.radiusPixels * select(metricScale, 1.0, nodeStyle.sizeMode == 2u);

  let highlightedColor = picking_normalizeColor(picking.highlightedObjectColor);
  let highlighted = picking.isHighlightActive > 0.5 &&
    distance(pickingColor, highlightedColor) < 0.00001;
  let selected = reached && distances[instanceIndex] == 0u;
  if (selected || highlighted) { radius *= 1.45; }

  geometry.worldPosition = vec3<f32>(nodePosition, 0.0);
  geometry.pickingColor = pickingColor;
  var clipPosition = project_position_to_clipspace(
    vec3<f32>(nodePosition, 0.0),
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  clipPosition = vec4<f32>(
    clipPosition.xy + project_pixel_size_to_clipspace(corner * radius),
    clipPosition.z,
    clipPosition.w
  );

  let analyticColor = getNodeAnalyticColor(instanceIndex);
  let accentColor = select(analyticColor, vec3<f32>(1.0, 0.84, 0.38), selected);
  let inactiveBrightness = select(0.40, 0.78, nodeStyle.pointMode != 0u);
  let brightness = select(inactiveBrightness, 1.0, inNeighborhood || selected || highlighted);

  var output: NodeVertexOutput;
  output.position = clipPosition;
  output.corner = corner;
  output.color = vec4<f32>(accentColor * brightness, 0.95);
  output.pickingColor = pickingColor;
  return output;
}

@fragment fn fragmentMain(input: NodeVertexOutput) -> @location(0) vec4<f32> {
  let radiusSquared = dot(input.corner, input.corner);
  if (radiusSquared > 1.0) { discard; }
  if (nodeStyle.pickingActive > 0.5) {
    return vec4<f32>(input.pickingColor, 1.0);
  }
  let coverage = 1.0 - smoothstep(0.48, 1.0, radiusSquared);
  return vec4<f32>(input.color.rgb, input.color.a * nodeStyle.opacity * coverage);
}`,ke=class ke extends lo{getAttributeManager(){return null}getNumInstances(){return this.props.vertexCount}initializeState({device:e}){if(e.type!=="webgpu")throw new Error("GPUGraphNodeLayer requires WebGPU");const o=e.createBuffer({id:`${this.id}-style-uniforms`,byteLength:32,usage:F.UNIFORM|F.COPY_DST}),i=this.props.pointMode??this.props.vertexCount>=ot,r=new fo(e,{...this.getShaders({modules:[vo,_o],source:gr}),id:`${this.id}-model`,topology:i?"point-list":"triangle-list",isInstanced:!0,vertexCount:i?1:6,instanceCount:this.props.vertexCount,attributes:{nodePosition:this.props.positions},bufferLayout:[{name:"nodePosition",format:"float32x2",stepMode:"instance"}],bindings:{importance:this.props.importance,components:this.props.components,communities:this.props.communities,degrees:this.props.degrees,distances:this.props.distances,selectionMask:this.props.selectionMask,nodeStyle:o},parameters:so});this.setState({model:r,styleUniforms:o})}updateState({props:e,oldProps:o}){const{model:i,styleUniforms:r}=this.state;if(!i||!r)return;e.positions!==o.positions&&i.setAttributes({nodePosition:e.positions}),(e.importance!==o.importance||e.components!==o.components||e.communities!==o.communities||e.degrees!==o.degrees||e.distances!==o.distances||e.selectionMask!==o.selectionMask)&&i.setBindings({importance:e.importance,components:e.components,communities:e.communities,degrees:e.degrees,distances:e.distances,selectionMask:e.selectionMask,nodeStyle:r});const s=e.pointMode??e.vertexCount>=ot;i.setTopology(s?"point-list":"triangle-list"),i.setVertexCount(s?1:6),i.setInstanceCount(e.vertexCount)}getModels(){const e=this.state.model;return e?[e]:[]}draw({renderPass:e,shaderModuleProps:o}){const{model:i,styleUniforms:r}=this.state;if(!i||!r)return;const s=new ArrayBuffer(32);new Float32Array(s,0,4).set([Math.max(1.4,Math.min(6,60/Math.sqrt(Math.max(this.props.vertexCount,1)))),this.props.opacity??1,o?.picking?.isActive?1:0,this.props.vertexCount]),new Uint32Array(s,16,4).set([vr(this.props.colorMode??"community"),hr(this.props.sizeMode??"pagerank"),Number(this.props.pointMode??this.props.vertexCount>=ot),0]),r.write(new Uint8Array(s)),i.setInstanceCount(this.props.vertexCount),i.draw(e)}getPickingInfo({info:e}){return e}finalizeState(e){const o=this.state;o.model?.destroy(),o.styleUniforms?.destroy(),this.setState({model:null,styleUniforms:null}),super.finalizeState(e)}};ke.layerName="GPUGraphNodeLayer",ke.defaultProps={parameters:so};let at=ke;function vr(t){return["community","component","degree","pagerank","distance"].indexOf(t)}function hr(t){return["pagerank","degree","uniform"].indexOf(t)}const M=4,Er=128,G=[128,256,512,1024,2048,4096,8192,16384,32768,65536,131072,262144,524288,1048576],ut=1024,pr=512,xe=16384,Or=65536,no=48;function ao(t=Er){if(!Number.isSafeInteger(t)||t<M*2)throw new Error("Graph explorer requires at least eight graph vertices");const e=new Float32Array(t*2),o=new Float32Array(t*2);let i=1;for(let c=0;c<M;c++){const d=Math.floor(c*t/M),v=Math.floor((c+1)*t/M)-d-+(c===M-1);v>=2&&(i+=v*(v>3?2:1),i+=Math.min(no,Math.floor((v-1)/4)))}const r=new Uint32Array(i),s=new Uint32Array(i);let n=0;for(let c=0;c<M;c++){const d=Math.floor(c*t/M),g=Math.floor((c+1)*t/M),v=c===M-1?g-1:g,p=v-d,L=c%2===0?-.52:.52,U=c<2?-.43:.43;for(let T=d;T<g;T++){const O=T-d,_=O*2.399963229728653,N=t>=xe?Math.sqrt((O+.5)/Math.max(p,1))*.38:.11+O%7*.016;e[T*2]=L+Math.cos(_)*N,e[T*2+1]=U+Math.sin(_)*N,!(T>=v||p<2)&&(r[n]=T,s[n]=d+(O+1)%p,n++,p>3&&(r[n]=T,s[n]=d+(O+3)%p,n++),O>0&&O%4===0&&O<=no*4&&(r[n]=T,s[n]=d,n++))}}r[n]=0,s[n]=Math.floor(t/M);const a=Math.ceil(i/2);return{vertexCount:t,sourceChunks:[r.subarray(0,a),r.subarray(a,a),r.subarray(a)],targetChunks:[s.subarray(0,a),s.subarray(a,a),s.subarray(a)],positions:e,velocities:o}}const ue=256,wr=4;function Sr(t,e){const o=e.topology.graph,i=o.directed?e.topology.reverse:void 0,r={layout:e,vertexCount:o.vertexCount,positions:t.importGPUVector(`${e.id}-sampled-positions`,e.positions).data[0],velocities:t.importGPUVector(`${e.id}-sampled-velocities`,e.velocities).data[0],forwardOffsets:t.importGPUVector(`${e.id}-sampled-forward-offsets`,e.topology.forward.offsets).data[0],forwardNeighbors:t.importGPUVector(`${e.id}-sampled-forward-neighbors`,e.topology.forward.neighbors).data[0],overflow:t.importGPUVector(`${e.id}-sampled-forward-overflow`,e.topology.forward.overflow).data[0],...i?{reverseOffsets:t.importGPUVector(`${e.id}-sampled-reverse-offsets`,i.offsets).data[0],reverseNeighbors:t.importGPUVector(`${e.id}-sampled-reverse-neighbors`,i.neighbors).data[0],reverseOverflow:t.importGPUVector(`${e.id}-sampled-reverse-overflow`,i.overflow).data[0]}:{},...e.pinned?{pinned:t.importGPUVector(`${e.id}-sampled-pinned`,e.pinned).data[0]}:{},...e.reset?{reset:t.importGPUVector(`${e.id}-sampled-reset`,e.reset).data[0]}:{}};if(r.reset&&(r.vertexCount>0&&mr(t,r),Tr(t,r)),r.vertexCount!==0)for(let s=0;s<e.iterationsPerFrame;s++)Fr(t,r,s),_r(t,r,s)}function mr(t,e){const o={positions:{view:e.positions,usage:"storage-read-write"},velocities:{view:e.velocities,usage:"storage-write"},reset:{view:e.reset,usage:"storage-read"},overflow:{view:e.overflow,usage:"storage-read"},...e.reverseOverflow?{reverseOverflow:{view:e.reverseOverflow,usage:"storage-read"}}:{},...e.pinned?{pinned:{view:e.pinned,usage:"storage-read"}}:{}},i=e.reverseOverflow?` || reverseOverflow[${m(e.reverseOverflow)}u] != 0u`:"",r=e.pinned?` || pinned[${m(e.pinned)}u + index] != 0u`:"",s=`
${Ke(o)}
${gt(t,e.vertexCount)}
${wo(e.vertexCount,e.layout.seed)}
@compute @workgroup_size(${ue})
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>,
        @builtin(local_invocation_index) localInvocationIndex: u32) {
  let index = getInvocationIndex(workgroupId, localInvocationIndex);
  if (index >= ${e.vertexCount}u || reset[${m(e.reset)}u] == 0u) { return; }
  let velocityIndex = ${m(e.velocities)}u + index * 2u;
  velocities[velocityIndex] = 0.0;
  velocities[velocityIndex + 1u] = 0.0;
  if (overflow[${m(e.overflow)}u] != 0u${i}${r}) { return; }
  let positionIndex = ${m(e.positions)}u + index * 2u;
  let anchor = getCommunityAnchor(index);
  positions[positionIndex] = anchor.x;
  positions[positionIndex + 1u] = anchor.y;
}`;je(t,`${e.layout.id}-sampled-initialize`,s,o,e.vertexCount)}function Tr(t,e){const o={reset:{view:e.reset,usage:"storage-write"}},i=`
${Ke(o)}
@compute @workgroup_size(${ue})
fn main(@builtin(global_invocation_id) globalId: vec3<u32>) {
  if (globalId.x == 0u) { reset[${m(e.reset)}u] = 0u; }
}`;je(t,`${e.layout.id}-sampled-clear-reset`,i,o,1)}function Fr(t,e,o){const i={positions:{view:e.positions,usage:"storage-read"},velocities:{view:e.velocities,usage:"storage-read-write"},forwardOffsets:{view:e.forwardOffsets,usage:"storage-read"},forwardNeighbors:{view:e.forwardNeighbors,usage:"storage-read"},overflow:{view:e.overflow,usage:"storage-read"},...e.reverseOffsets&&e.reverseNeighbors&&e.reverseOverflow?{reverseOffsets:{view:e.reverseOffsets,usage:"storage-read"},reverseNeighbors:{view:e.reverseNeighbors,usage:"storage-read"},reverseOverflow:{view:e.reverseOverflow,usage:"storage-read"}}:{}},r=e.reverseOverflow?` || reverseOverflow[${m(e.reverseOverflow)}u] != 0u`:"",s=e.reverseOffsets&&e.reverseNeighbors?`
  let reverseFirst = min(reverseOffsets[${m(e.reverseOffsets)}u + index],
    ${e.reverseNeighbors.length}u);
  let reverseLast = min(reverseOffsets[${m(e.reverseOffsets)}u + index + 1u],
    ${e.reverseNeighbors.length}u);
  for (var slot = reverseFirst; slot < reverseLast; slot++) {
    let otherVertex = reverseNeighbors[${m(e.reverseNeighbors)}u + slot];
    if (otherVertex < ${e.vertexCount}u) {
      neighborDisplacement += readPosition(otherVertex) - position;
      neighborCount++;
    }
  }`:"",n=`
${Ke(i)}
${gt(t,e.vertexCount)}
${wo(e.vertexCount,e.layout.seed)}
fn readPosition(vertex: u32) -> vec2<f32> {
  let offset = ${m(e.positions)}u + vertex * 2u;
  return vec2<f32>(positions[offset], positions[offset + 1u]);
}
fn hash(value: u32) -> u32 {
  var result = value;
  result ^= result >> 16u;
  result *= 0x7feb352du;
  result ^= result >> 15u;
  result *= 0x846ca68bu;
  return result ^ (result >> 16u);
}
@compute @workgroup_size(${ue})
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>,
        @builtin(local_invocation_index) localInvocationIndex: u32) {
  let index = getInvocationIndex(workgroupId, localInvocationIndex);
  if (index >= ${e.vertexCount}u) { return; }
  let velocityIndex = ${m(e.velocities)}u + index * 2u;
  if (overflow[${m(e.overflow)}u] != 0u${r}) {
    velocities[velocityIndex] = 0.0;
    velocities[velocityIndex + 1u] = 0.0;
    return;
  }
  let position = readPosition(index);
  let anchor = getCommunityAnchor(index);
  var force = (anchor - position) * 0.12 - ${B(e.layout.gravity)} * position;
  for (var sampleIndex = 0u; sampleIndex < ${wr}u; sampleIndex++) {
    let otherVertex = hash(index ^ (${e.layout.seed}u + sampleIndex * 0x9e3779b9u)) %
      ${e.vertexCount}u;
    if (otherVertex != index) {
      let difference = position - readPosition(otherVertex);
      force += ${B(e.layout.repulsion)} * difference /
        max(dot(difference, difference), 0.0001);
    }
  }
  let first = min(forwardOffsets[${m(e.forwardOffsets)}u + index],
    ${e.forwardNeighbors.length}u);
  let last = min(forwardOffsets[${m(e.forwardOffsets)}u + index + 1u],
    ${e.forwardNeighbors.length}u);
  var neighborDisplacement = vec2<f32>(0.0);
  var neighborCount = 0u;
  for (var slot = first; slot < last; slot++) {
    let otherVertex = forwardNeighbors[${m(e.forwardNeighbors)}u + slot];
    if (otherVertex < ${e.vertexCount}u) {
      neighborDisplacement += readPosition(otherVertex) - position;
      neighborCount++;
    }
  }
  ${s}
  force += ${B(e.layout.attraction)} * neighborDisplacement /
    max(f32(neighborCount), 1.0);
  var velocity =
    (vec2<f32>(velocities[velocityIndex], velocities[velocityIndex + 1u]) +
      force * ${B(e.layout.timeStep)}) * ${B(e.layout.damping)};
  let speed = length(velocity);
  if (speed > ${B(e.layout.maxVelocity)}) {
    velocity *= ${B(e.layout.maxVelocity)} / speed;
  }
  velocities[velocityIndex] = velocity.x;
  velocities[velocityIndex + 1u] = velocity.y;
}`;je(t,`${e.layout.id}-sampled-force-${o}`,n,i,e.vertexCount)}function _r(t,e,o){const i={positions:{view:e.positions,usage:"storage-read-write"},velocities:{view:e.velocities,usage:"storage-read-write"},...e.pinned?{pinned:{view:e.pinned,usage:"storage-read"}}:{}},r=e.pinned?`
  if (pinned[${m(e.pinned)}u + index] != 0u) {
    velocities[velocityIndex] = 0.0;
    velocities[velocityIndex + 1u] = 0.0;
    return;
  }`:"",s=`
${Ke(i)}
${gt(t,e.vertexCount)}
@compute @workgroup_size(${ue})
fn main(@builtin(workgroup_id) workgroupId: vec3<u32>,
        @builtin(local_invocation_index) localInvocationIndex: u32) {
  let index = getInvocationIndex(workgroupId, localInvocationIndex);
  if (index >= ${e.vertexCount}u) { return; }
  let velocityIndex = ${m(e.velocities)}u + index * 2u;
  ${r}
  let positionIndex = ${m(e.positions)}u + index * 2u;
  positions[positionIndex] += velocities[velocityIndex] * ${B(e.layout.timeStep)};
  positions[positionIndex + 1u] += velocities[velocityIndex + 1u] *
    ${B(e.layout.timeStep)};
}`;je(t,`${e.layout.id}-sampled-integrate-${o}`,s,i,e.vertexCount)}function je(t,e,o,i,r){const s=So(t,r);t.addComputePass({id:e,resources:Object.values(i).map(({view:n,usage:a})=>({buffer:n,usage:a})),compile:({device:n})=>{const a=new H(n,{id:e,source:o,shaderLayout:{bindings:Object.keys(i).map((c,d)=>({name:c,type:"storage",group:0,location:d}))}});return{encode:({computePass:c,getBuffer:d})=>{const g={};for(const[v,p]of Object.entries(i))g[v]=d(p.view);a.setBindings(g),a.dispatch(c,s[0],s[1],s[2])},destroy:()=>a.destroy()}}})}function Ke(t){return Object.entries(t).map(([e,o],i)=>{const r=o.usage==="storage-read"?"read":"read_write",s=o.view.format==="uint32"?"u32":"f32";return`@group(0) @binding(${i}) var<storage, ${r}> ${e}: array<${s}>;`}).join(`
`)}function gt(t,e){const o=So(t,e);return`
fn getInvocationIndex(workgroupId: vec3<u32>, localInvocationIndex: u32) -> u32 {
  return ((workgroupId.z * ${o[1]}u + workgroupId.y) * ${o[0]}u +
    workgroupId.x) * ${ue}u + localInvocationIndex;
}`}function wo(t,e){return`
fn getCommunityAnchor(vertex: u32) -> vec2<f32> {
  let community = min((vertex * 4u) / ${t}u, 3u);
  let first = (community * ${t}u) / 4u;
  let next = ((community + 1u) * ${t}u) / 4u;
  let localIndex = vertex - first;
  let population = max(next - first, 1u);
  let radius = sqrt((f32(localIndex) + 0.5) / f32(population)) * 0.38;
  let angle = f32(localIndex) * 2.39996323 + f32(${e}u & 255u) * 0.003;
  let centerX = select(-0.52, 0.52, (community & 1u) != 0u);
  let centerY = select(-0.43, 0.43, community >= 2u);
  return vec2<f32>(centerX + cos(angle) * radius, centerY + sin(angle) * radius);
}`}function So(t,e){const o=Math.max(1,Math.ceil(e/ue)),i=t.device.limits.maxComputeWorkgroupsPerDimension,r=Math.min(o,i),s=Math.min(Math.ceil(o/r),i),n=Math.ceil(o/(r*s));if(n>i)throw new Error("Graph explorer sampled layout exceeds bounded GPU dispatch");return[r,s,n]}function m(t){return t.byteOffset/Uint32Array.BYTES_PER_ELEMENT}function B(t){return Number.isInteger(t)?`${t}.0`:`${t}`}const ct=2;function xr(t,e){const o=document.createElement("section");o.setAttribute("aria-label","GPU graph explorer controls and live diagnostics"),o.setAttribute("data-gpu-graph-inspector",""),Object.assign(o.style,{position:"absolute",left:"18px",top:"76px",zIndex:"2",width:"min(324px, calc(100% - 36px))",maxHeight:"calc(100% - 94px)",overflowY:"auto",boxSizing:"border-box",padding:"16px",borderRadius:"16px",background:"linear-gradient(160deg, rgba(11, 18, 38, 0.96), rgba(8, 13, 27, 0.92))",border:"1px solid rgba(113, 161, 242, 0.24)",boxShadow:"0 18px 55px rgba(0, 0, 0, 0.34)",backdropFilter:"blur(16px)",pointerEvents:"auto",touchAction:"auto",color:"#edf4ff",font:"12px/1.48 system-ui, sans-serif"});const i=Math.max(0,G.indexOf(ut));o.innerHTML=`
    <div style="display:flex;align-items:center;justify-content:space-between;gap:8px">
      <strong style="font-size:16px;letter-spacing:-.25px">Graph Observatory</strong>
      <span style="padding:3px 8px;border-radius:99px;background:#123a45;color:#80eadb;
        font-size:10px;font-weight:700;letter-spacing:.4px">LIVE GPU</span>
    </div>
    <p style="margin:7px 0 14px;color:#a9b8d0">Resident graph analytics and direct
      deck.gl rendering. No per-frame graph readback.</p>

    <label style="display:block;margin-bottom:13px">
      <span style="display:flex;justify-content:space-between;color:#b9c8df">Graph size
        <strong data-gpu-graph-size-value style="color:#8ccfff">1,024</strong>
      </span>
      <input data-gpu-graph-size aria-label="Graph vertex count" type="range" min="0"
        max="${G.length-1}" step="1"
        value="${i}" style="width:100%;margin:8px 0 0;accent-color:#76bbff" />
      <span style="display:flex;justify-content:space-between;color:#8798b2;font-size:10px">
        <span>128</span>
        <span>${G[G.length-1].toLocaleString()} vertices</span>
      </span>
    </label>

    <div style="display:flex;align-items:center;justify-content:space-between;margin:-5px 0 12px">
      <button data-gpu-graph-size-decrease type="button"
        aria-label="Decrease graph population">−</button>
      <span style="font-size:10px;color:#8798b2">14 actual resident graph populations</span>
      <button data-gpu-graph-size-increase type="button"
        aria-label="Increase graph population">+</button>
    </div>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:9px;margin-bottom:11px">
      <label>Color by
        <select data-gpu-graph-color aria-label="Node color encoding"
          style="display:block;width:100%;margin-top:4px">
          <option value="community">Communities</option>
          <option value="component">Components</option>
          <option value="degree">Degree</option>
          <option value="pagerank">PageRank</option>
          <option value="distance">Distance</option>
        </select>
      </label>
      <label>Node size
        <select data-gpu-graph-node-size aria-label="Node size encoding"
          style="display:block;width:100%;margin-top:4px">
          <option value="pagerank">PageRank</option>
          <option value="degree">Degree</option>
          <option value="uniform">Uniform</option>
        </select>
      </label>
    </div>

    <label style="display:block;margin-bottom:10px">Force layout
      <select data-gpu-graph-layout aria-label="GPU force layout algorithm"
        style="display:block;width:100%;margin-top:4px">
        <option value="auto">Adaptive · exact / spatial / sampled</option>
        <option value="exact">Exact · bounded population</option>
        <option value="spatial">Spatial · near / far grid</option>
        <option value="sampled">Linear · four sampled repulsions</option>
      </select>
    </label>

    <label style="display:block;margin-bottom:10px">Neighborhood depth
      <input data-gpu-graph-depth aria-label="GPU neighborhood breadth-first search depth"
        type="range" min="0" max="8" value="${ct}"
        style="display:block;width:100%;margin-top:5px;accent-color:#d692ff" />
    </label>

    <label style="display:flex;align-items:center;gap:7px;margin-bottom:12px;color:#c4d0e2">
      <input data-gpu-graph-edges type="checkbox" checked aria-label="Show original graph edges" />
      Show original source-chunk edges <span data-gpu-graph-edge-count></span>
    </label>

    <div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;padding:10px;
      border:1px solid rgba(113,161,242,.16);border-radius:11px;background:rgba(4,9,20,.48)">
      <span style="color:#9dafc8">Frame rate</span>
      <strong data-gpu-graph-fps style="text-align:right">—</strong>
      <span style="color:#9dafc8">CPU encode</span>
      <strong data-gpu-graph-encode style="text-align:right">—</strong>
      <span style="color:#9dafc8">Resident memory</span>
      <strong data-gpu-graph-memory style="text-align:right">—</strong>
      <span style="color:#9dafc8">Spatial index</span>
      <strong data-gpu-graph-index style="text-align:right">—</strong>
      <span style="color:#9dafc8">GPU pipeline</span>
      <strong data-gpu-graph-pipeline style="text-align:right">—</strong>
      <span style="color:#9dafc8">Bounded rounds</span>
      <strong data-gpu-graph-iterations style="text-align:right">—</strong>
    </div>

    <div data-gpu-graph-legend aria-label="GPU graph visualization legend"
      style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin:11px 0;color:#b9c8df">
      <span style="width:9px;height:9px;border-radius:50%;background:#42c9ff"></span>Community
      <span style="width:9px;height:9px;border-radius:50%;background:#ffb04b"></span>Selected
      <span style="width:9px;height:9px;border-radius:50%;background:#ad7bff"></span>Neighborhood
    </div>

    <div style="display:flex;gap:6px;flex-wrap:wrap">
      <button data-gpu-graph-pause type="button" aria-label="Pause progressive GPU layout">Pause</button>
      <button data-gpu-graph-reset type="button">Reset layout</button>
      <button data-gpu-graph-release type="button">Release pins</button>
    </div>
    <p data-gpu-graph-status role="status" aria-live="polite"
      style="margin:11px 0 3px;color:#b4c5df">Initializing WebGPU graph…</p>
    <p style="margin:4px 0 0;color:#8293ad;font-size:11px">Click a node · drag to pin · scroll to zoom</p>`,t.appendChild(o);for(const f of o.querySelectorAll("select, button"))Object.assign(f.style,{border:"1px solid rgba(136, 170, 222, 0.26)",borderRadius:"7px",background:"#121d32",color:"#e6efff",padding:"5px 7px",font:"11px system-ui, sans-serif"});const r=o.querySelector("[data-gpu-graph-size]"),s=o.querySelector("[data-gpu-graph-size-value]"),n=o.querySelector("[data-gpu-graph-size-decrease]"),a=o.querySelector("[data-gpu-graph-size-increase]"),c=o.querySelector("[data-gpu-graph-layout]"),d=o.querySelector("[data-gpu-graph-color]"),g=o.querySelector("[data-gpu-graph-node-size]"),v=o.querySelector("[data-gpu-graph-edges]"),p=o.querySelector("[data-gpu-graph-depth]"),L=o.querySelector("[data-gpu-graph-edge-count]"),U=o.querySelector("[data-gpu-graph-pause]"),T=o.querySelector("[data-gpu-graph-reset]"),O=o.querySelector("[data-gpu-graph-release]"),_=o.querySelector("[data-gpu-graph-status]"),N=o.querySelector("[data-gpu-graph-fps]"),D=o.querySelector("[data-gpu-graph-encode]"),R=o.querySelector("[data-gpu-graph-memory]"),ce=o.querySelector("[data-gpu-graph-index]"),x=o.querySelector("[data-gpu-graph-pipeline]"),$=o.querySelector("[data-gpu-graph-iterations]"),de=["pointerdown","pointermove","pointerup","mousedown","mouseup","touchstart","touchmove","touchend","keydown","keyup"],le=f=>{f.stopPropagation()};for(const f of de)o.addEventListener(f,le);let I=null,W=null,Z=null,l=!1;const S=()=>{const f=e.getEffect();if(!f||!_)return;const h=e.getStats(),fe=f.currentSelection===null?"none":`${f.currentSelection}`,ge=f.graph.vertexCount,_t=G.findIndex(To=>To===ge),ve=e.getPendingVertexCount();n&&(n.disabled=ve!==null),a&&(a.disabled=ve!==null),W===null&&ve===null?(r&&_t>=0&&(r.value=`${_t}`),s&&(s.textContent=ge.toLocaleString())):s&&ve!==null&&(s.textContent=ve.toLocaleString());const xt=c?.querySelector('option[value="exact"]');xt&&(xt.disabled=ge>pr);const bt=c?.querySelector('option[value="spatial"]');bt&&(bt.disabled=ge>=xe),v&&(v.checked=e.getEdgesVisible());const $t=e.getEdgesVisible()?f.renderedEdgeCount:0;L&&(L.textContent=`${$t.toLocaleString()} / ${f.graph.edgeCount.toLocaleString()}`);const mo=f.activeLayoutMode==="sampled"&&f.graph.vertexCount>=xe?" · bounded analytics; convergence not sampled":"";_.textContent=e.getLoadingStatus()??`${ge.toLocaleString()} resident vertices · ${$t.toLocaleString()} / ${f.graph.edgeCount.toLocaleString()} original edges drawn · ${f.activeLayoutMode} GPU layout · ${f.renderMode} · selected ${fe}${mo}`,N&&(N.textContent=h?.framesPerSecond?`${Math.round(h.framesPerSecond)} fps`:"warming up"),D&&(D.textContent=h?`${h.frameEncodeMilliseconds.toFixed(2)} ms`:"pending"),R&&(R.textContent=h?uo(h.residentBufferBytes+h.transientBufferBytes):"pending"),ce&&(ce.textContent=h?.gridCellCount?`${h.gridCellCount} cells · ${uo(h.spatialIndexBytes)}`:f.activeLayoutMode==="sampled"?"4 samples / vertex":"exact"),x&&(x.textContent=h?`${h.completedAnalysisStages}/${h.totalAnalysisStages} init · ${h.frameNodeCount} frame`:"compiling"),$&&($.textContent=h?`P${h.pageRankIterations} · W${h.componentIterations} · L${h.communityIterations}`:"pending")},A=()=>G[Number(r?.value??i)]??ut,w=()=>{I!==null&&(clearTimeout(I),I=null);const f=W??A();W=null,(e.getPendingVertexCount()!==null||e.getEffect()?.graph.vertexCount!==f)&&e.resize(f)},b=()=>{W=A(),s&&(s.textContent=W.toLocaleString()),I!==null&&clearTimeout(I),I=setTimeout(w,140)},re=f=>{if(!r||r.disabled)return;const h=Math.max(0,Math.min(G.length-1,Number(r.value)+f));r.value=`${h}`,b(),w()},k=f=>{if(!r||r.disabled)return;let h=Number(r.value);switch(f.key){case"ArrowRight":case"ArrowUp":h++;break;case"ArrowLeft":case"ArrowDown":h--;break;case"Home":h=0;break;case"End":h=G.length-1;break;default:return}f.preventDefault(),f.stopPropagation();const fe=Math.max(0,Math.min(G.length-1,h));r.value=`${fe}`,b(),w()},se=f=>{if(!r||r.disabled)return;const h=r.getBoundingClientRect();if(h.width<=0)return;const fe=Math.max(0,Math.min(1,(f.clientX-h.left)/h.width));r.value=`${Math.round(fe*(G.length-1))}`,b(),I!==null&&(clearTimeout(I),I=null)},ne=f=>{!r||r.disabled||f.button!==0||(f.preventDefault(),f.stopPropagation(),Z=f.pointerId,r.focus(),r.setPointerCapture(f.pointerId),se(f))},ae=f=>{f.pointerId===Z&&(f.stopPropagation(),se(f))},Ve=f=>{!r||f.pointerId!==Z||(f.stopPropagation(),se(f),Z=null,r.hasPointerCapture(f.pointerId)&&r.releasePointerCapture(f.pointerId),w())},vt=()=>re(-1),ht=()=>re(1),Et=()=>{const f=c?.value;(f==="auto"||f==="exact"||f==="spatial"||f==="sampled")&&e.setLayoutMode(f)},pt=()=>{const f=d?.value;(f==="community"||f==="component"||f==="degree"||f==="pagerank"||f==="distance")&&e.setColorMode(f)},Ot=()=>{const f=g?.value;(f==="pagerank"||f==="degree"||f==="uniform")&&e.setNodeSizeMode(f)},wt=()=>{e.setEdgesVisible(v?.checked??!0)},St=()=>{l=!l,U&&(U.textContent=l?"Resume":"Pause",U.setAttribute("aria-label",l?"Resume progressive GPU layout":"Pause progressive GPU layout")),e.setPaused(l)},mt=()=>{e.getEffect()?.setNeighborhoodDepth(Number(p?.value??ct)),e.redraw("GPU Graph deck neighborhood depth changed")},Tt=()=>{e.getEffect()?.requestReset(),e.redraw("GPU Graph deck deterministic layout reset")},Ft=()=>{e.getEffect()?.clearPins(),S(),e.redraw("GPU Graph deck pins released")};return r?.addEventListener("input",b),r?.addEventListener("change",w),r?.addEventListener("keydown",k),r?.addEventListener("pointerdown",ne),r?.addEventListener("pointermove",ae),r?.addEventListener("pointerup",Ve),r?.addEventListener("pointercancel",Ve),n?.addEventListener("click",vt),a?.addEventListener("click",ht),c?.addEventListener("change",Et),d?.addEventListener("change",pt),g?.addEventListener("change",Ot),v?.addEventListener("change",wt),p?.addEventListener("input",mt),U?.addEventListener("click",St),T?.addEventListener("click",Tt),O?.addEventListener("click",Ft),{update:S,destroy:()=>{I!==null&&clearTimeout(I);for(const f of de)o.removeEventListener(f,le);r?.removeEventListener("input",b),r?.removeEventListener("change",w),r?.removeEventListener("keydown",k),r?.removeEventListener("pointerdown",ne),r?.removeEventListener("pointermove",ae),r?.removeEventListener("pointerup",Ve),r?.removeEventListener("pointercancel",Ve),n?.removeEventListener("click",vt),a?.removeEventListener("click",ht),c?.removeEventListener("change",Et),d?.removeEventListener("change",pt),g?.removeEventListener("change",Ot),v?.removeEventListener("change",wt),p?.removeEventListener("input",mt),U?.removeEventListener("click",St),T?.removeEventListener("click",Tt),O?.removeEventListener("click",Ft),o.remove()}}}function uo(t){return t<1024?`${t} B`:t<1048576?`${(t/1024).toFixed(1)} KB`:`${(t/1048576).toFixed(2)} MB`}function br(){document.body.style.margin="0";const t=document.createElement("div");return Object.assign(t.style,{position:"fixed",inset:"0",overflow:"hidden",background:"#070d18"}),document.body.appendChild(t),t}function $r(t,e={}){const{dataset:o,layoutMode:i="auto",pointMode:r,maxVisibleEdges:s=Or,...n}=e,a=o??ao(ut),c=br();getComputedStyle(c).position==="static"&&(c.style.position="relative");let d=null,g=null,v=null,p=i,L="community",U="pagerank",T=a.vertexCount<xe,O=null,_=null,N=0,D=null,R=null,ce=!1,x;const $=xr(c,{getEffect:()=>d,getStats:()=>v,getPendingVertexCount:()=>O,getLoadingStatus:()=>_,getEdgesVisible:()=>T,resize:l=>de(l),setLayoutMode:l=>{p=l,d&&de(d.graph.vertexCount)},setColorMode:l=>{L=l,W("GPU Graph GPU visual color encoding changed")},setNodeSizeMode:l=>{U=l,W("GPU Graph GPU node sizing changed")},setEdgesVisible:l=>{T=l,W("GPU Graph source-chunk edge visibility changed")},setPaused:l=>{ce=l,d&&(d.layoutPaused=l),x?.setProps({_animate:!l}),l||x?.redraw("GPU Graph progressive GPU layout resumed")},redraw:l=>x?.redraw(l)});return x=new Ro({parent:c,...xo({...n,deviceType:"webgpu"}),views:new bo({id:"gpu-graph-orthographic"}),initialViewState:{target:[0,0,0],zoom:6.8,minZoom:4,maxZoom:12},controller:{dragPan:!0,scrollZoom:{smooth:!0,speed:.02},doubleClickZoom:!0,touchZoom:!0},_animate:!0,pickAsync:"auto",layers:[],effects:[],getTooltip:l=>yr(l,d),onClick:l=>{d?.setSelectedVertex(l.picked&&l.index>=0?l.index:null),$.update(),x.redraw("GPU Graph deck selection changed")},onDragStart:(l,S)=>{!d||!l.picked||l.index<0||(R=l.index,d.setSelectedVertex(R),d.setPinnedVertex(R,!0),co(d,R,l),$.update(),S.stopPropagation(),x.redraw("GPU Graph vertex drag started"))},onDrag:(l,S)=>{!d||R===null||(co(d,R,l),S.stopPropagation(),x.redraw("GPU Graph vertex dragged"))},onDragEnd:(l,S)=>{R!==null&&(R=null,$.update(),S.stopPropagation(),x.redraw("GPU Graph vertex pinned"))},onLoad:({deck:l,device:S})=>{if(S.type!=="webgpu")throw new Error("GPU Graph deck explorer requires WebGPU");g=S,I(a,l)},onFinalize:()=>{g=null,N++,D!==null&&cancelAnimationFrame(D),R=null,$.destroy(),c.remove()}}),x;function de(l){const S=++N;O=l,_=`Preparing ${l.toLocaleString()} resident vertices…`,$.update(),le(S,()=>{let A;try{A=ao(l)}catch(w){_=w instanceof Error?w.message:"Graph generation failed",O=null,$.update();return}_=`Uploading ${l.toLocaleString()} vertices and ${A.sourceChunks.reduce((w,b)=>w+b.length,0).toLocaleString()} original edges…`,$.update(),le(S,()=>{try{I(A),_=null,O=null,$.update()}catch(w){_=w instanceof Error?w.message:"The current adapter cannot hold this graph",O=null,$.update()}})})}function le(l,S){D!==null&&cancelAnimationFrame(D),D=requestAnimationFrame(()=>{l!==N||!g||(D=requestAnimationFrame(()=>{D=null,l===N&&g&&S()}))})}function I(l,S=x){if(!g)return;const A=d?.currentNeighborhoodDepth??ct,w=d?d.currentSelection:0;v=null,R=null,l.vertexCount>=xe&&(T=!1);const b=new dr(g,l,{layoutMode:p,pointMode:r,maxVisibleEdges:s,addSampledLayoutToGraph:Sr,onStats:re=>{v=re,$.update()}});b.layoutPaused=ce,b.setNeighborhoodDepth(A),b.setSelectedVertex(w!==null&&w<l.vertexCount?w:null),d=b,S.setProps({effects:[b],layers:Z(b)}),$.update()}function W(l){!d||!x||(x.setProps({layers:Z(d)}),$.update(),x.redraw(l))}function Z(l){const S=l.graph.sourceVertices.data.filter(k=>k.length>0).length;let A=l.renderedEdgeCount,w=S;const b=T?l.graph.sourceVertices.data.flatMap((k,se)=>{if(k.length===0)return[];const ne=l.graph.targetVertices.data[se],ae=Math.min(k.length,Math.ceil(A/Math.max(w,1)));return A-=ae,w--,ae===0?[]:[new nt({id:`gpu-graph-edges-${se}`,data:[],pickable:!1,positions:l.positions,sourceVertices:k.buffer instanceof F?k.buffer:k.buffer.buffer,targetVertices:ne.buffer instanceof F?ne.buffer:ne.buffer.buffer,distances:l.distances,edgeCount:ae,opacity:l.graph.vertexCount>1024?.22:.55})]}):[],re=new at({id:"gpu-graph-nodes",data:[],pickable:!0,autoHighlight:!0,positions:l.positions,importance:l.importance,degrees:l.degreeValues,components:l.componentLabels,communities:l.communityLabels,distances:l.distances,selectionMask:l.selectionMask,colorMode:L,sizeMode:U,pointMode:l.renderMode==="points",vertexCount:l.graph.vertexCount,opacity:1});return[...b,re]}}function co(t,e,o){const i=o.coordinate;!i||i.length<2||t.setVertexPosition(e,[i[0],i[1]])}function yr(t,e){if(!t.picked||t.index<0||!e)return null;const o=e.isVertexPinned(t.index)?"pinned":"movable";return`Vertex ${t.index} · ${o}
GPU communities · PageRank · neighborhood`}$r();
