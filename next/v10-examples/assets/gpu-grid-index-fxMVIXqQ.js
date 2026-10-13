import{n as m,o as O,c as A,p as Y,K,b as q,q as J,r as Q,l as B,e as v,g as $,m as j,s as R,f as L,k as tt,i as et,v as ot,d as W}from"./gpu-scan-BtfiiIEk.js";import{g as _,i as nt,ag as it}from"./deck-example-device-TQPRJnZ6.js";function st(t,e){const[n,o,i]=e;for(const[a,d]of[["x",n],["y",o],["z",i]])if(!Number.isSafeInteger(d)||d<0)throw new Error(`compute dispatch ${a} workgroup count must be a non-negative safe integer`);return{...t,dispatchWorkgroups:Object.freeze([n,o,i])}}function C(t,e,n,o){if(!Number.isSafeInteger(n)||!Number.isSafeInteger(o)||n<0||o<0||n+o>e.length)throw new Error("Graph range must fit the source");const i=[],a=e instanceof O?e.chunks:[{offset:0,length:e.length,data:e}];let d=0,s=a.length;for(;d<s;){const r=Math.floor((d+s)/2);a[r].offset+a[r].length<=n?d=r+1:s=r}for(let r=d;r<a.length&&a[r].offset<n+o;r++){const{data:u,offset:h}=a[r],f=Math.max(n,h),p=Math.min(n+o,h+u.length);f<p&&i.push(f===h&&p===h+u.length?u:t.createDataView(u.buffer,{format:u.format,length:p-f,byteOffset:u.byteOffset+(f-h)*u.byteStride,byteStride:u.byteStride,rowByteLength:u.rowByteLength}))}return new O({id:`graph-range-${n}-${o}`,name:`graph-range-${n}-${o}`,stride:e instanceof O?e.stride:_(e.format).components*(_(e.format).listSize??1),format:e.format,length:o,valueLength:o*(_(e.format).listSize??1),byteStride:e.byteStride,rowByteLength:e.rowByteLength,data:i})}function M(t,e,n){if([...e,...n].some(s=>s.length>4294967295))throw new Error("Logical lengths must fit uint32 addressing");const o=e.flatMap(m),i=n.flatMap(m);for(const s of[...o,...i])if(s.buffer.graph!==t)throw new Error("Views must belong to the target graph");const a=new Set(o.map(s=>s.buffer)),d=new Map;for(const s of i){if(a.has(s.buffer))throw new Error("Outputs must use separate buffers from inputs");if(!s.length)continue;const r=d.get(s.buffer)??[];r.push(s),d.set(s.buffer,r)}for(const s of d.values()){s.sort((u,h)=>u.byteOffset-h.byteOffset);let r=0;for(const u of s){if(u.byteOffset<r)throw new Error("Writable chunks must not overlap");r=u.byteOffset+(u.length-1)*u.byteStride+u.rowByteLength}}}function S(t,e){const n=[...Object.entries(e.inputs??{}),...Object.entries(e.outputs)];for(const[,i]of n)if(A(i).size>t.device.limits.maxStorageBufferBindingSize)throw new Error("Active chunks must fit a storage binding");const o=e.dispatch.x*e.dispatch.y*e.dispatch.z;return st(Y({id:e.id,workload:{commandCount:1,maximumWorkgroupCount:o,maximumInvocationCount:o*(e.workgroupSize??256)},resources:[...Object.values(e.inputs??{}).map(i=>({buffer:i,usage:"storage-read"})),...Object.values(e.outputs).map(i=>({buffer:i,usage:"storage-read-write"}))],compile:({device:i})=>{const a=new K(i,{id:e.id,source:e.source,shaderLayout:{bindings:n.map(([d],s)=>({name:d,group:0,location:s,type:s<Object.keys(e.inputs??{}).length?"read-only-storage":"storage"}))}});return{encode:({computePass:d,getBuffer:s})=>{const r={};for(const[u,h]of n)r[u]=q(h,s);a.dispatch(d,{bindings:r,x:e.dispatch.x,y:e.dispatch.y,z:e.dispatch.z})},destroy:()=>a.destroy()}}}),[e.dispatch.x,e.dispatch.y,e.dispatch.z])}const T=256,P=Uint32Array.BYTES_PER_ELEMENT;class rt{id;source;indices;output;wordsPerRow;constructor(e){this.id=e.id??"gpu-scatter",this.source=e.source,this.indices=e.indices,this.output=e.output;for(const o of m(this.source))F(o,`${this.id} source`);for(const o of m(this.indices))v(o,`${this.id} indices`);for(const o of m(this.output))F(o,`${this.id} output`);if(this.source.format!==this.output.format)throw new Error(`${this.id} source and output must use the same format`);if(this.source.length<this.indices.length)throw new Error(`${this.id} source must contain at least indices.length rows`);const n=new Set([...m(this.source).map(o=>o.buffer),...m(this.indices).map(o=>o.buffer)]);if(m(this.output).some(o=>n.has(o.buffer)))throw new Error(`${this.id} output must use a separate buffer`);this.wordsPerRow=this.source.rowByteLength/P}getCommandNodes(e){return H(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)}}function H(t,e,n){M(e,[t.source,t.indices],[t.output]);const o=[],i=J(e,[Q(e,t.source,t.indices.length),t.indices]);for(const[a,[d,s]]of i.entries()){const r=B(t.id,s.length,T,n);let u=0;for(const[h,f]of m(t.output).entries())f.length&&o.push(S(e,{id:i.length===1&&m(t.output).length===1?t.id:`${t.id}-${a}-${h}`,inputs:{sourceWords:d,indices:s},outputs:{outputWords:f},dispatch:r,source:ut({source:d,indices:s,output:f,wordsPerRow:t.wordsPerRow,outputStart:u},r)})),u+=f.length}return o}function F(t,e){if(nt(t.format)||it(t.format))throw new Error(`${e} must use a fixed-width GPU data format`);const n=_(t.format);if(t.byteStride!==n.byteLength||t.rowByteLength!==n.byteLength||t.byteOffset%P!==0||t.rowByteLength%P!==0)throw new Error(`${e} must be packed, uint32-aligned GPU data with 32-bit-word rows`)}function ut(t,e){return`const INDEX_COUNT: u32 = ${t.indices.length}u;
const OUTPUT_LENGTH: u32 = ${t.output.length}u;
const WORDS_PER_ROW: u32 = ${t.wordsPerRow}u;
const SOURCE_OFFSET: u32 = ${$(t.source)}u;
const INDEX_OFFSET: u32 = ${$(t.indices)}u;
const OUTPUT_OFFSET: u32 = ${$(t.output)}u;
@group(0) @binding(0) var<storage, read> sourceWords: array<u32>;
@group(0) @binding(1) var<storage, read> indices: array<u32>;
@group(0) @binding(2) var<storage, read_write> outputWords: array<u32>;
@compute @workgroup_size(${T})
fn main(
  @builtin(workgroup_id) workgroupId: vec3u,
  @builtin(local_invocation_index) localInvocationIndex: u32
) {
  ${j(e,T)}
  if (index >= INDEX_COUNT) { return; }
  let destinationIndex = indices[INDEX_OFFSET + index];
  if (destinationIndex < ${t.outputStart}u || destinationIndex - ${t.outputStart}u >= OUTPUT_LENGTH) { return; }

  let sourceBase = SOURCE_OFFSET + index * WORDS_PER_ROW;
  let outputBase = OUTPUT_OFFSET + (destinationIndex - ${t.outputStart}u) * WORDS_PER_ROW;
  for (var word = 0u; word < WORDS_PER_ROW; word++) {
    outputWords[outputBase + word] = sourceWords[sourceBase + word];
  }
}`}const X=256;function at(t,e,n){M(e,[t.positions,...t.sourceIds?[t.sourceIds]:[]],[t.cellOffsets,t.objectIds,t.count,t.overflow]);const o=[],i=C(e,t.cellOffsets,0,t.cellCount),a=R(e,`${t.id}-counts`,i),d=R(e,`${t.id}-cursors`,i),s=m(t.positions),r=s.map((l,c)=>L(e,`${t.id}-ranks-${c}`,"uint32",l.length)),u=t.sourceIds?void 0:s.map((l,c)=>L(e,`${t.id}-ids-${c}`,"uint32",l.length));let h=t.firstSourceIndex;for(const[l,c]of s.entries()){if(c.length){const k=r[l],w=u?.[l],b=E(c.length,n);o.push(S(e,{id:`${t.id}-initialize-ranks-${l}`,outputs:{ranks:k,...w?{ids:w}:{}},dispatch:b,source:`
@group(0) @binding(0) var<storage, read_write> ranks: array<u32>;
${w?"@group(0) @binding(1) var<storage, read_write> ids: array<u32>;":""}
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) workgroupId: vec3u, @builtin(local_invocation_index) localInvocationIndex: u32) {
  ${G(b)}
  if (index >= ${c.length}u) { return; }
  ranks[index] = 0xffffffffu;
  ${w?`ids[index] = ${h}u + index;`:""}
}`}))}h+=c.length}let f=0;for(const[l,c]of a.data.entries()){const k=d.data[l],w=E(c.length,n);o.push(S(e,{id:`${t.id}-initialize-${l}`,outputs:{cellCounts:c,cellCursors:k},dispatch:w,source:`
@group(0) @binding(0) var<storage, read_write> cellCounts: array<u32>;
@group(0) @binding(1) var<storage, read_write> cellCursors: array<u32>;
@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) workgroupId: vec3u, @builtin(local_invocation_index) localInvocationIndex: u32) {
  ${G(w)}
  if (index >= ${c.length}u) { return; }
  cellCounts[index] = 0u;
  cellCursors[index] = 0u;
}`}));for(const[b,I]of s.entries()){if(!I.length)continue;const D=E(I.length,n);o.push(S(e,{id:`${t.id}-count-${l}-${b}`,inputs:{positions:I},outputs:{cellCounts:c},dispatch:D,source:V(t,I,D,"@group(0) @binding(1) var<storage, read_write> cellCounts: array<atomic<u32>>;",`
  if (accepted && cellIndex >= ${f}u && cellIndex - ${f}u < ${c.length}u) {
    atomicAdd(&cellCounts[cellIndex - ${f}u], 1u);
  }`)}))}f+=c.length}o.push(...tt(new et({id:`${t.id}-scan`,input:a,output:i}),e,n));const p=a.data[a.data.length-1],x=i.data[i.data.length-1],U=C(e,t.cellOffsets,t.cellCount,1).data[0];o.push(S(e,{id:`${t.id}-finalize`,inputs:{counts:p,offsets:x},outputs:{count:t.count,overflow:t.overflow},dispatch:{x:1,y:1,z:1},workgroupSize:1,source:`
@group(0) @binding(0) var<storage, read> counts: array<u32>;
@group(0) @binding(1) var<storage, read> offsets: array<u32>;
@group(0) @binding(2) var<storage, read_write> count: array<u32>;
@group(0) @binding(3) var<storage, read_write> overflow: array<u32>;
@compute @workgroup_size(1)
fn main() {
  let total = counts[${p.length-1}u] + offsets[${$(x)+x.length-1}u];
  count[${$(t.count)}u] = total;
  overflow[${$(t.overflow)}u] = select(0u, 1u, total > ${t.objectIds.length}u);
}`})),o.push(S(e,{id:`${t.id}-terminal`,inputs:{count:t.count},outputs:{terminal:U},dispatch:{x:1,y:1,z:1},workgroupSize:1,source:`
@group(0) @binding(0) var<storage, read> count: array<u32>;
@group(0) @binding(1) var<storage, read_write> terminal: array<u32>;
@compute @workgroup_size(1)
fn main() {
  terminal[${$(U)}u] = count[${$(t.count)}u];
}`})),f=0;for(const[l,c]of i.data.entries()){const k=d.data[l];for(const[w,b]of s.entries()){if(!b.length||!t.objectIds.length)continue;const I=E(b.length,n);o.push(S(e,{id:`${t.id}-rank-${l}-${w}`,inputs:{positions:b,cellOffsets:c},outputs:{cellCursors:k,ranks:r[w]},dispatch:I,source:V(t,b,I,`
@group(0) @binding(1) var<storage, read> cellOffsets: array<u32>;
@group(0) @binding(2) var<storage, read_write> cellCursors: array<atomic<u32>>;
@group(0) @binding(3) var<storage, read_write> ranks: array<u32>;`,`
  if (accepted && cellIndex >= ${f}u && cellIndex - ${f}u < ${c.length}u) {
    let cell = cellIndex - ${f}u;
    ranks[index] = cellOffsets[${$(c)}u + cell] + atomicAdd(&cellCursors[cell], 1u);
  }`)}))}f+=c.length}let N=0;for(const[l,c]of s.entries())c.length&&t.objectIds.length&&o.push(...H(new rt({id:`${t.id}-scatter-${l}`,source:t.sourceIds?C(e,t.sourceIds,N,c.length):u[l],indices:r[l],output:t.objectIds}),e,n)),N+=c.length;return o}function V(t,e,n,o,i){const a=t.gridSize[0],d=t.gridSize[1],s=t.dimension===3?t.gridSize[2]:1,r=t.dimension,u=t.dimension===3?`let z = positions[POSITIONS_OFFSET + index * 3u + 2u];
    let finiteZ = z == z && abs(z) <= 3.402823466e+38;
    let inZ = z >= ${g(t.bounds[2])} && z <= ${g(t.bounds[5])};`:`let finiteZ = true;
    let inZ = true;`,h=t.dimension===3?`let layer = getCoordinate(z, ${g(t.bounds[2])}, ${g(t.bounds[5])}, DEPTH);`:"let layer = 0u;";return`
const ELEMENT_COUNT: u32 = ${e.length}u;
const POSITIONS_OFFSET: u32 = ${$(e)}u;
const WIDTH: u32 = ${a}u;
const HEIGHT: u32 = ${d}u;
const DEPTH: u32 = ${s}u;
@group(0) @binding(0) var<storage, read> positions: array<f32>;
${o}

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

@compute @workgroup_size(256)
fn main(@builtin(workgroup_id) workgroupId: vec3u, @builtin(local_invocation_index) localInvocationIndex: u32) {
  ${G(n)}
  var accepted = false;
  var cellIndex = 0u;
  if (index < ELEMENT_COUNT) {
    let x = positions[POSITIONS_OFFSET + index * ${t.dimension}u];
    let y = positions[POSITIONS_OFFSET + index * ${t.dimension}u + 1u];
    ${u}
    let finiteXY = x == x && y == y && abs(x) <= 3.402823466e+38 && abs(y) <= 3.402823466e+38;
    let inX = x >= ${g(t.bounds[0])} && x <= ${g(t.bounds[r])};
    let inY = y >= ${g(t.bounds[1])} && y <= ${g(t.bounds[r+1])};
    if (finiteXY && finiteZ && inX && inY && inZ) {
      accepted = true;
      let column = getCoordinate(x, ${g(t.bounds[0])}, ${g(t.bounds[r])}, WIDTH);
      let row = getCoordinate(y, ${g(t.bounds[1])}, ${g(t.bounds[r+1])}, HEIGHT);
      ${h}
      cellIndex = (layer * HEIGHT + row) * WIDTH + column;
    }
  }
  ${i}
}`}function E(t,e){return B("GPUGridIndex",t,X,e)}function G(t){return j(t,X)}function g(t){const e=`${Math.fround(t)}`;return e.includes(".")||e.includes("e")?e:`${e}.0`}const z=4294967295;class ht{id;positions;sourceIds;firstSourceIndex;gridSize;bounds;cellOffsets;objectIds;count;overflow;dimension;cellCount;updatePolicy="rebuild";constructor(e){this.id=e.id??"gpu-grid-index",this.positions=e.positions,this.sourceIds=e.sourceIds,this.firstSourceIndex=e.firstSourceIndex??0,this.gridSize=e.gridSize,this.bounds=e.bounds,this.cellOffsets=e.cellOffsets,this.objectIds=e.objectIds,this.count=e.count,this.overflow=e.overflow,this.dimension=this.positions.format==="float32x2"?2:3;const n=this.dimension===2?"float32x2":"float32x3";for(const o of Z(this.positions))ot(o,[n],`${this.id} positions`);if(this.gridSize.length!==this.dimension||this.bounds.length!==this.dimension*2)throw new Error(`${this.id} positions, gridSize, and bounds must have matching dimensions`);if(this.gridSize.some(o=>!Number.isSafeInteger(o)||o<=0))throw new Error(`${this.id} gridSize must contain positive integers`);if(this.cellCount=this.gridSize.reduce((o,i)=>o*i,1),!Number.isSafeInteger(this.cellCount)||this.cellCount>=z)throw new Error(`${this.id} cell count must fit in uint32`);if(!this.bounds.every(Number.isFinite)||Array.from({length:this.dimension},(o,i)=>i).some(o=>this.bounds[o]>this.bounds[o+this.dimension]))throw new Error(`${this.id} bounds must contain finite ordered minima and maxima`);for(const o of y(this.cellOffsets))v(o,`${this.id} cellOffsets`);for(const o of y(this.objectIds))v(o,`${this.id} objectIds`);if(v(this.count,`${this.id} count`),v(this.overflow,`${this.id} overflow`),this.cellOffsets.length!==this.cellCount+1)throw new Error(`${this.id} cellOffsets.length must equal cellCount + 1`);if(this.count.length<1||this.overflow.length<1)throw new Error(`${this.id} count and overflow must each contain one uint32 row`);if(this.positions.length>z)throw new Error(`${this.id} position count must fit in uint32`);if(!Number.isSafeInteger(this.firstSourceIndex)||this.firstSourceIndex<0||this.firstSourceIndex+this.positions.length>z+1)throw new Error(`${this.id} generated source IDs must fit in uint32`);if(this.sourceIds&&e.firstSourceIndex!==void 0)throw new Error(`${this.id} sourceIds and firstSourceIndex are mutually exclusive`);ct(this.id,this.positions,this.sourceIds),dt(this.id,this.positions,this.sourceIds,this.objectIds)}getCommandNodes(e){const n=[];return n.push(...at(this,e,e.device.limits.maxComputeWorkgroupsPerDimension)),n}}function ct(t,e,n){if(n){for(const o of y(n))v(o,`${t} sourceIds`);if(e.length!==n.length)throw new Error(`${t} sourceIds.length must equal positions.length`)}}function dt(t,e,n,o){for(const i of Z(e))if(y(o).some(a=>W(i,a)))throw new Error(`${t} positions and objectIds must not overlap`);for(const i of y(n))if(y(o).some(a=>W(i,a)))throw new Error(`${t} sourceIds and objectIds must not overlap`)}function Z(t){return t instanceof O?t.data:[t]}function y(t){return t?t instanceof O?t.data:[t]:[]}export{ht as G,at as g};
