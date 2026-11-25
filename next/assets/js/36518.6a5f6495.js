"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["36518"],{28453(t,e,r){r.d(e,{R:()=>i,x:()=>s});var n=r(96540);let o={},a=n.createContext(o);function i(t){let e=n.useContext(a);return n.useMemo(function(){return"function"==typeof t?t(e):{...e,...t}},[e,t])}function s(t){let e;return e=t.disableParentContext?"function"==typeof t.components?t.components(o):t.components||o:i(t.components),n.createElement(a.Provider,{value:e},t.children)}},98244(t,e,r){r.d(e,{x:()=>i});var n=r(23901),o=r(52702);async function a(){let{GeoParquetLoaderWithParser:t}=await Promise.all([r.e("74950"),r.e("25076"),r.e("8338"),r.e("12487"),r.e("55078")]).then(r.bind(r,44924));return t}let i={defaultShape:"arrow",supportsNativeArrow:!0,...n.U,dataType:null,batchType:null,id:"parquet",module:"tables",version:"5.0.0",worker:!1,options:{parquet:{...o.C}},preload:a}},23901(t,e,r){r.d(e,{U:()=>n});let n={name:"Apache Parquet",category:"table",queryPushdownCapabilityHints:{projection:!0,predicate:!0,limit:!0},encoding:"parquet",format:"parquet",extensions:["parquet"],mimeTypes:["application/octet-stream"],binary:!0,tests:["PAR1","PARE"]}},52702(t,e,r){r.d(e,{C:()=>n});let n={columns:void 0,preserveBinary:!1,shape:"arrow"}},14878(t,e,r){r.d(e,{T6:()=>a,dr:()=>o,nR:()=>i});var n=r(96179);function o(t){return!!t.data||!!(t.selector&&"string"!=typeof t.selector)}function a(t){return t instanceof n.XI?s(t.batches[Symbol.iterator]()):Symbol.asyncIterator in t?t[Symbol.asyncIterator]():Symbol.iterator in t?s(t[Symbol.iterator]()):t}async function i({data:t,isActive:e,prepareBatch:r,appendBatch:n,destroyBatch:o,getRowCount:s,getMetrics:l,onBatch:u,onError:c}){let h=0,d=0;if(e())try{let i=a(t);for(let t=await i.next();!t.done;t=await i.next()){if(!e())return;let a={batchIndex:h,rowIndexOffset:d,isFirstBatch:0===h},i=await r(t.value,a);if(!e())return void o(i);n(i),h++,d+=s(i),u?.({loadedBatchCount:h,isFirstBatch:a.isFirstBatch,metrics:l(),preparedBatch:i})}}catch(t){e()&&c?.(t)}}function s(t){return{next:async()=>t.next()}}},28283(t,e,r){r.d(e,{Iy:()=>tj});var n=r(22499),o=r(55590),a=r(50784),i=r(77231);let s=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!0,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],l=`
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
`;class u extends n.ye{static gpuInputSchema=s;tripProps;tripConfigBuffer;constructor(t,e){var r,n;"paths"in e&&(0,i.j)("PathTripsStorageModel",u.gpuInputSchema,{paths:e.paths,colors:e.colors,widths:e.widths,timestamps:e.timestamps,viewOrigins:e.viewOrigins});let s=(r=t,n=e,new a.kL(r,{id:`${n.id||"path-trips-storage-model"}-trip-config`,usage:o.h.UNIFORM|o.h.COPY_DST|o.h.COPY_SRC,data:c(n)}));super(t,{...e,source:e.source??l,bindings:{...e.bindings||{},tripPathConfig:s}}),this.tripProps=e,this.tripConfigBuffer=s}setProps(t){let e={...this.tripProps,...t};(void 0!==t.currentTime||void 0!==t.trailLength||void 0!==t.fadeTrail)&&this.tripConfigBuffer.write(c(e)),this.tripProps=e,super.setProps({...t,bindings:{...t.bindings||this.tripProps.bindings||{},tripPathConfig:this.tripConfigBuffer}})}destroy(){this.tripConfigBuffer.destroy(),super.destroy()}}function c(t){let e=new ArrayBuffer(16),r=new Float32Array(e),n=new Uint32Array(e);return r[0]=t.currentTime,r[1]=t.trailLength,n[2]=+(!1!==t.fadeTrail),n}var h=r(83504),d=r(49144),f=r(9624),p=r(37589),g=r(96179),m=r(46252),b=r(14957),w=r(64570),y=r(60097),x=r(29797),v=r(21528),C=r(3633),I=r(6646),P=r(62105);function E(t){let e=1,r=t;if(p.pe.isFixedSizeList(t.type)){if(r=t.getChildAt(0),t.type.listSize<1||t.type.listSize>4)throw Error("Attribute column fixed list size must be between 1 and 4");e=t.type.listSize}if(!(0,P.d8)(r.type))throw Error("Attribute column must be numeric or fixed list of numeric");let n={signedDataType:(0,P.w2)(r.type,e),components:e,stepMode:"instance",values:[],offsets:[]};for(let t of r.data)n.values.push(t.values);return n}var S=r(56498);function B(t,e){let{shaderLayout:r,options:n,source:o}=function(t,e){let r=!!e.arrowTable;if(!!e.arrowVectors===r)throw Error("getArrowBufferLayout requires exactly one of arrowTable or arrowVectors");return{shaderLayout:t,options:e,source:r?{type:"table",arrowTable:e.arrowTable,arrowTablePaths:new Set((0,v.UR)(e.arrowTable)),arrowPaths:e.arrowPaths}:{type:"vectors",arrowVectors:e.arrowVectors}}}(t,e),a=[],i=function(t,e){let r=new Map;if("table"!==e.type)return r;let n=new Map;for(let r of t.attributes){let t=e.arrowPaths?.[r.name]||r.name,o=n.get(t)||[];o.push(r),n.set(t,o)}for(let[t,o]of n){if(o.length<=1)continue;let n=(0,v.FO)(e.arrowTable,t),a=(0,S.GH)(n);if(!a)throw Error(`Arrow column "${t}" maps to multiple shader attributes but is not a recognized matrix vector`);if(o.length!==a.columns)throw Error(`Arrow matrix column "${t}" expects ${a.columns} shader vector attributes`);if(new Set(o.map(t=>t.stepMode).filter(Boolean)).size>1)throw Error(`Arrow matrix column "${t}" requires matching attribute step modes`);let i=`float32x${a.rows}`;for(let e of o){let r=C.Co.getAttributeShaderTypeInfo(e.type);if("f32"!==r.primitiveType||r.components!==a.rows)throw Error(`Arrow matrix column "${t}" requires vec${a.rows}<f32> shader attributes`)}let s={firstAttributeName:o[0].name,layout:{name:t,byteStride:a.byteStride,attributes:o.map((t,e)=>({attribute:t.name,format:i,byteOffset:e*a.columnStride*Float32Array.BYTES_PER_ELEMENT})),...o[0].stepMode?{stepMode:o[0].stepMode}:{}}};for(let t of o)r.set(t.name,s)}return r}(r,o);for(let t of r.attributes){let e=i.get(t.name);if(e){e.firstAttributeName===t.name&&a.push(e.layout);continue}let r=function(t,e){switch(t.type){case"vectors":{let r=t.arrowVectors[e];return r?function(t){if(!(0,P.Jd)(t.type))throw Error("Arrow vector is not compatible with shader attributes");return E(t)}(r):null}case"table":{var r;let n,o=!!(t.arrowPaths&&Object.prototype.hasOwnProperty.call(t.arrowPaths,e)),a=t.arrowPaths?.[e]||e;if(!o&&!t.arrowTablePaths.has(a))return null;let i=(r=t.arrowTable,n=(0,v.FO)(r,a),(0,P.Jd)(n.type)?E(n):null);if(!i)throw Error(`Arrow column "${a}" is not compatible with shader attributes`);return i}default:throw Error("Unknown Arrow buffer layout source")}}(o,t.name);r&&a.push({name:t.name,format:function(t,e,r){let n=C.Co.getAttributeShaderTypeInfo(e);if(t.components!==n.components)throw Error(`Arrow column has ${t.components} components but shader attribute ${e} expects ${n.components}`);switch(n.primitiveType){case"f32":return L(t,e,!1,r);case"f16":return L(t,e,!0,r);case"i32":return A(t,e,!0,r);case"u32":return A(t,e,!1,r);default:throw Error(`Unsupported shader attribute type ${e}`)}}(r,t.type,n),...t.stepMode?{stepMode:t.stepMode}:{}})}return a}function L(t,e,r,n){switch(t.signedDataType){case"float32":if(r)throw Error(`Arrow float32 columns cannot be used with ${e}; use float16 or normalized integer columns for f16 shader attributes`);return I.E.makeVertexFormat("float32",t.components);case"float16":return T("float16",t.components,!1,e,n);case"sint8":case"sint16":case"uint8":case"uint16":return T(t.signedDataType,t.components,!0,e,n);case"sint32":case"uint32":throw Error(`Arrow ${t.signedDataType} columns cannot be used with ${e}; WebGPU has no normalized 32-bit integer vertex format`);default:throw Error(`Unsupported Arrow data type ${t.signedDataType}`)}}function A(t,e,r,n){if(t.signedDataType.startsWith("float"))throw Error(`Arrow ${t.signedDataType} columns cannot be used with ${e}`);if(function(t){switch(t){case"sint8":case"sint16":case"sint32":return!0;case"uint8":case"uint16":case"uint32":return!1;default:throw Error(`Arrow ${t} is not an integer type`)}}(t.signedDataType)!==r)throw Error(`Arrow ${t.signedDataType} column signedness does not match ${e}`);return T(t.signedDataType,t.components,!1,e,n)}function T(t,e,r,n,o){try{let n=I.E.makeVertexFormat(t,e,r);if(n.endsWith("-webgl")&&!o?.allowWebGLOnlyFormats)throw Error(`WebGL-only vertex format ${n}`);return n}catch(s){if(!o?.allowWebGLOnlyFormats)throw Error(`Arrow ${t}x${e} cannot be used with ${n} in portable WebGPU layouts`);if(3===e){var a=t,i=r;switch(a){case"sint8":return i?"snorm8x3-webgl":"sint8x3-webgl";case"uint8":return i?"unorm8x3-webgl":"uint8x3-webgl";case"sint16":return i?"snorm16x3-webgl":"sint16x3-webgl";case"uint16":return i?"unorm16x3-webgl":"uint16x3-webgl";default:throw Error(`No WebGL-only 3-component vertex format for ${a}`)}}throw s}}var O=r(72458),_=r(59858);function k(t,e,r={}){let n=e.type,o=(0,S.GH)(e),a=o&&(0,_.yc)(o),i=p.pe.isUtf8(n)||(0,_.bh)(n)||(0,P.s$)(n);if(o&&!a)throw Error("GPUVector matrix columns require canonical Float32 column-major wgsl-storage values; use convertArrowMatrixToGPUVector() first");if(!(0,P.Jd)(n)&&!(0,_.IK)(n)&&!a&&!i)throw Error(`GPUVector does not support Arrow type ${n}`);let[s,...l]=e.data;if(!s||l.length>0)throw Error("Arrow RecordBatch columns require exactly one Arrow Data chunk");return(0,_.i0)(t,s,{...r,format:r.format??(o?"float32x4":(0,_.HY)(n))})}function M(t){return t.bindings.filter(t=>("storage"===t.type||"read-only-storage"===t.type)&&!("format"in t))}function R(t,e){try{return(0,v.UM)(t,e)}catch{return null}}function D(t){if(!p.pe.isFixedSizeList(t)||!Number.isSafeInteger(t.listSize)||t.listSize<1)throw Error("Arrow fixed-size-list GPU columns require valid FixedSizeList source data");let e=(0,_.MZ)(t.children[0].type);return`fixed-size-list<${e},${t.listSize}>`}var V=r(52918);let F=b.Hg,U=b.Hg;function N(t,e,r){if(r.length%e!=0)throw Error(`FixedSizeList values length ${r.length} must be divisible by list size ${e}`);let n=F({type:t,length:r.length,data:r}),o=U({type:new p.Y1(e,new f.D("value",t)),length:r.length/e,nullCount:0,nullBitmap:null,child:n});return(0,m.g)(o)}var $=r(938),G=r(6116),j=r(8969);let z=`
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
`,Y={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"closedFlags",type:"read-only-storage",group:0,location:2},{name:"pathClosureConfig",type:"uniform",group:0,location:3},{name:"needsInjection",type:"storage",group:0,location:4}],attributes:[]},q=`
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
`,W={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathScatterRanges",type:"read-only-storage",group:0,location:1},{name:"pathScatterConfig",type:"uniform",group:0,location:2},{name:"outputPathValues",type:"storage",group:0,location:3}],attributes:[]};async function X(t,e){let r=function(t){if(function(t){if(!(0,P.s$)(t)||!p.pe.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<1||t.children[0].type.listSize>4||!(t.children[0].type.children[0]?.type instanceof p.gh))throw Error("closeArrowPaths paths must be GPUVector<List<FixedSizeList<Float32>[1..4]>>")}(te(t.paths)),!(t.closed.type instanceof p.x))throw Error("closeArrowPaths closed flags must be Vector<Bool>");if(t.closed.length!==t.paths.length)throw Error(`closeArrowPaths closed flag rows must match path rows (${t.closed.length} !== ${t.paths.length})`);if(t.closed.data.some(t=>t.nullCount>0))throw Error("closeArrowPaths closed flags cannot contain null rows");if(!Number.isFinite(t.epsilon)||t.epsilon<0)throw Error("closeArrowPaths epsilon must be a finite non-negative number");return Math.fround(t.epsilon)}(e),n=te(e.paths),o=function(t,e){let r=function(t){let e=new Uint32Array(t.length);for(let r=0;r<t.length;r++)e[r]=+!!t.get(r);return e}(e),n=[],o=0;for(let e of t.data){if(!e.valueOffsets||void 0===e.valueByteLength)throw Error("closeArrowPaths paths require copied variable-length Arrow offset metadata");(function(t,e){if(t.length!==e+1)throw Error("closeArrowPaths path offsets must contain one trailing entry per path chunk");let r=t[0]??0;if(0!==r)throw Error("closeArrowPaths path offsets must be normalized to start at zero");for(let e=1;e<t.length;e++){let n=t[e]??r;if(n<r)throw Error("closeArrowPaths path offsets must be monotonically non-decreasing");r=n}})(e.valueOffsets,e.length),n.push({pathData:e,valueOffsets:e.valueOffsets,valueByteLength:e.valueByteLength,closedFlags:r.subarray(o,o+e.length),rowIndexBase:o}),o+=e.length}return n}(e.paths,e.closed);if("webgpu"!==t.type)return Q(t,e,o,r);let a=await Promise.all(o.map((n,o)=>H(t,e,n,o,r)));return new G.M({type:"data",name:e.paths.name,dataType:n,format:e.paths.format,data:a,stride:e.paths.stride,byteStride:e.paths.byteStride,rowByteLength:e.paths.rowByteLength,ownsData:!0})}async function H(t,e,r,n,i){let s,l=te(e.paths),u=tt(l),c=function(t,e,r,n,i,s){var l,u,c,h;let d,f,p,g=r.pathData.length,m=new Uint32Array(2*Math.max(g,1));for(let t=0;t<g;t++){let e=2*t,n=r.valueOffsets[t]??0,o=r.valueOffsets[t+1]??n;m[e]=n,m[e+1]=Math.max(n,o)}let b=(l=s,u=g,c=i,f=new Float32Array(d=new ArrayBuffer(16)),p=new Uint32Array(d),f[0]=l,p[1]=u,p[2]=c,p),w=e.id||"closed-arrow-paths";return{pathRangesBuffer:t.createBuffer({id:`${w}-ranges-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,data:m}),closedFlagsBuffer:t.createBuffer({id:`${w}-closed-flags-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,data:(h=r.closedFlags).length>0?h:new Uint32Array(1)}),pathClosureConfigBuffer:new a.kL(t,{id:`${w}-closure-config-${n}`,usage:o.h.UNIFORM|o.h.COPY_DST|o.h.COPY_SRC,data:b}),needsInjectionBuffer:t.createBuffer({id:`${w}-needs-injection-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,data:new Uint32Array(Math.max(g,1))})}}(t,e,r,n,u,i);try{(function(t,e,r,n){let o={pathValues:J(r),pathRanges:n.pathRangesBuffer,closedFlags:n.closedFlagsBuffer,pathClosureConfig:n.pathClosureConfigBuffer.buffer,needsInjection:n.needsInjectionBuffer},a=(0,$.W)(t,{id:`${e.id||"closed-arrow-paths"}-classify`,source:z,shaderLayout:Y});if(r.pathData.length>0){let e=t.beginComputePass({});a.dispatch(e,{x:Math.ceil(r.pathData.length/64),bindings:o}),e.end(),t.submit()}a.destroy()})(t,e,r,c),s=await K(c.needsInjectionBuffer,r.pathData.length)}finally{c.pathRangesBuffer.destroy(),c.closedFlagsBuffer.destroy(),c.pathClosureConfigBuffer.destroy(),c.needsInjectionBuffer.destroy()}let h=Z(r.valueOffsets,s,r.pathData.length),d=function(t,e,r,n,i,s,l){let u=r.pathData.length,c=new Uint32Array(4*Math.max(u,1));for(let t=0;t<u;t++){let e=4*t,n=r.valueOffsets[t]??0,o=r.valueOffsets[t+1]??n;c[e]=n,c[e+1]=Math.max(n,o),c[e+2]=s[t]??0,c[e+3]=l[t]??0}let h=(s[s.length-1]??0)*i*Float32Array.BYTES_PER_ELEMENT,d=e.id||"closed-arrow-paths";return{pathScatterRangesBuffer:t.createBuffer({id:`${d}-scatter-ranges-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,data:c}),pathScatterConfigBuffer:new a.kL(t,{id:`${d}-scatter-config-${n}`,usage:o.h.UNIFORM|o.h.COPY_DST|o.h.COPY_SRC,data:new Uint32Array([u,i,0,0])}),outputPathValuesBuffer:new a.kL(t,{id:`${d}-closed-values-${n}`,usage:o.h.VERTEX|o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,byteLength:Math.max(h,Float32Array.BYTES_PER_ELEMENT)})}}(t,e,r,n,u,h,s);try{var f,p=t,g=e,m=r,b=d;let n={pathValues:J(m),pathScatterRanges:b.pathScatterRangesBuffer,pathScatterConfig:b.pathScatterConfigBuffer.buffer,outputPathValues:b.outputPathValuesBuffer.buffer},o=(0,$.W)(p,{id:`${g.id||"closed-arrow-paths"}-scatter`,source:q,shaderLayout:W});if(m.pathData.length>0){let t=p.beginComputePass({});o.dispatch(t,{x:Math.ceil(m.pathData.length/64),bindings:n}),t.end(),p.submit()}o.destroy()}finally{d.pathScatterRangesBuffer.destroy(),d.pathScatterConfigBuffer.destroy()}let w=(h[h.length-1]??0)*u*Float32Array.BYTES_PER_ELEMENT;return new j.L({buffer:d.outputPathValuesBuffer,dataType:l,format:r.pathData.format,length:r.pathData.length,stride:r.pathData.stride,byteStride:r.pathData.byteStride,rowByteLength:r.pathData.rowByteLength,ownsBuffer:!0,readbackMetadata:(f=h,{kind:"variable-length-attribute",valueOffsets:f,nullCount:0,valueByteLength:w}),valueOffsets:h,valueByteLength:w})}async function K(t,e){if(0===e)return new Uint32Array(0);let r=await t.readAsync(0,e*Uint32Array.BYTES_PER_ELEMENT);return new Uint32Array(r.buffer,r.byteOffset,e).slice()}function J(t){var e;return{buffer:(e=t.pathData).buffer instanceof a.kL?e.buffer.buffer:e.buffer,offset:t.pathData.byteOffset,...t.valueByteLength>0?{size:t.valueByteLength}:{}}}function Z(t,e,r){let n=new Int32Array(r+1);for(let o=0;o<r;o++){let r=t[o]??0,a=Math.max(0,(t[o+1]??r)-r);n[o+1]=n[o]+a+ +!!e[o]}return n}async function Q(t,e,r,n){let o=await (0,_.fV)(e.paths),a=tt(te(e.paths)),i=o.data.map((t,e)=>(function(t,e,r,n){var o,a,i;let s,l,u;if(!e)throw Error("closeArrowPaths CPU fallback requires path chunk metadata");let c=(0,O.TO)(t),h=function(t,e,r,n,o,a){let i=new Uint32Array(a);for(let s=0;s<a;s++){if(!r[s])continue;let a=e[s]??0,l=Math.max(0,(e[s+1]??a)-a);if(l<=1)continue;let u=a+l-1;for(let e=0;e<n;e++)if(!(Math.abs((t[a*n+e]??0)-(t[u*n+e]??0))<=o)){i[s]=1;break}}return i}(c,e.valueOffsets,e.closedFlags,r,n,t.length),d=Z(e.valueOffsets,h,t.length),f=function(t,e,r,n,o,a){let i=new Float32Array((r[r.length-1]??0)*o);for(let s=0;s<a;s++){let a=e[s]??0,l=e[s+1]??a,u=r[s]??0,c=Math.max(0,l-a),h=a*o,d=l*o;if(i.set(t.subarray(h,d),u*o),n[s]&&c>0){let e=t.subarray(h,h+o);i.set(e,(u+c)*o)}}return i}(c,e.valueOffsets,d,h,r,t.length);return o=t.type,a=d,i=f,s=o.children[0].type,l=new b.B_(new p.gh,0,i.length,0,{[w.NZ.DATA]:i}),u=new b.B_(s,0,0===s.listSize?0:i.length/s.listSize,0,{},[l]),new b.B_(o,0,a.length-1,0,{[w.NZ.OFFSET]:a},[u])})(t,r[e],a,n)),s=new m.M(i);return e.paths.format?(0,_.ft)(t,s,{name:e.paths.name,format:e.paths.format,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}}):(0,_.ft)(t,s,{name:e.paths.name,...e.id?{id:`${e.id}-cpu-closed-paths`}:{}})}function tt(t){let e=t.children[0]?.type;if(!e||!p.pe.isFixedSizeList(e))throw Error("closeArrowPaths paths require FixedSizeList coordinate elements");return e.listSize}function te(t){return(0,O.wX)(t)}function tr(t,e){if(!e)return N(new p.gh,4,t);let r=[],n=0;for(let o of e){let e=n+o;r.push(N(new p.gh,4,t.slice(4*n,4*e)).data[0]),n=e}if(4*n!==t.length)throw Error("Arrow path view-origin chunk rows must cover every source row");return new m.M(r)}function tn(t,e){let r=0;for(let n of t.data){let t=r+n.length;n.buffer.write(e.subarray(4*r,4*t),n.byteOffset),r=t}if(4*r!==e.length)throw Error("Arrow path view-origin GPU chunks must cover every source row")}function to(t,e,r){if(r.length<16)throw Error("convertArrowPathToGPUVectors updateViewOrigins requires a 4x4 modelViewMatrix");for(let n=0;n<e.length/4;n++){let o=4*n,a=e[o]??0,i=e[o+1]??0,s=e[o+2]??0;t[o]=(r[0]??0)*a+(r[4]??0)*i+(r[8]??0)*s+(r[12]??0),t[o+1]=(r[1]??0)*a+(r[5]??0)*i+(r[9]??0)*s+(r[13]??0),t[o+2]=(r[2]??0)*a+(r[6]??0)*i+(r[10]??0)*s+(r[14]??0),t[o+3]=e[o+3]??0}}let ta="segmentStartPositions",ti="segmentEndPositions",ts="segmentPreviousPositions",tl="segmentNextPositions",tu="segmentStartColors",tc="segmentEndColors",th="segmentFlags",td="rowIndices",tf="pathViewOrigins",tp=16*Float32Array.BYTES_PER_ELEMENT+4*Uint32Array.BYTES_PER_ELEMENT,tg=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),tm={attributes:[{name:ta,location:0,type:"vec4<f32>",stepMode:"instance"},{name:ti,location:1,type:"vec4<f32>",stepMode:"instance"},{name:tu,location:2,type:"u32",stepMode:"instance"},{name:tc,location:3,type:"u32",stepMode:"instance"},{name:tf,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]};function tb(t,e){var r,n;let o,a,i,s,l;if(!e.pathState)throw Error("makePathAttributeModelProps requires pathState prepared by convertArrowPathToGPUVectors()");let{allowWebGLOnlyFormats:u,...c}=e,h=e.shaderLayout??tm;return{...c,shaderLayout:h,ownsTable:!0,table:(r=function(t,e){let r=new Set([ta,ti,ts,tl,tu,tc,th,td]),n=[],o={};for(let e of t.schema.fields){if(r.has(e.name))continue;let a=t.getChild(e.name);a&&(n.push(e),o[e.name]=a)}let a=new g.XI(new f.S(n,new Map(t.schema.metadata)),o);if(!e||e.length<=1||0===n.length)return a;let i=e.flatMap(t=>a.slice(t.recordStart,t.recordEnd).batches);return new g.XI(a.schema,i)}(e.pathState.segmentTable.table,e.pathState.generatedBufferBatches),n={shaderLayout:h,allowWebGLOnlyFormats:u},o=0,i=(a=r.batches.map((e,r)=>{let a=function(t,e,r){let n=new g.XI([e]),o=B(r.shaderLayout,{arrowTable:n,arrowPaths:r.arrowPaths,allowWebGLOnlyFormats:r.allowWebGLOnlyFormats}),a=[],i={},s=new Set;for(let e of o){if(r.fixedSizeListColumns?.includes(e.name))throw Error("Arrow fixed-size-list GPU columns require a storage shader binding");let o=r.arrowPaths?.[e.name]||e.name,l=(0,v.FO)(n,o),u=(0,v.UM)(n,o);i[e.name]=k(t,l,{...r.bufferProps,format:e.format}),a.push({name:e.name,format:i[e.name].format,nullable:u.nullable,metadata:new Map(u.metadata)}),s.add(e.name)}for(let e of M(r.shaderLayout)){if(s.has(e.name))throw Error(`GPURecordBatch shader input "${e.name}" cannot be both an attribute and a storage binding`);let o=r.arrowPaths?.[e.name]||e.name,l=function(t,e){try{return(0,v.FO)(t,e)}catch{return null}}(n,o),u=R(n,o);l&&u&&(i[e.name]=k(t,l,{...r.bufferProps,...r.fixedSizeListColumns?.includes(e.name)?{format:D(l.type)}:{}}),a.push({name:e.name,format:i[e.name].format,nullable:u.nullable,metadata:new Map(u.metadata)}),s.add(e.name))}for(let t of r.fixedSizeListColumns??[])if(!s.has(t))throw Error("Arrow fixed-size-list GPU columns require a selected storage binding");for(let[e,o]of Object.entries(r.validityColumns??{})){let l="string"==typeof o?o:o.name;if(!s.has(e)||s.has(l))throw Error("Arrow GPU validity columns require a selected source and unique output");let u=r.arrowPaths?.[e]||e,c=(0,v.FO)(n,u);if(!p.pe.isFixedSizeList(c.type))throw Error("Arrow GPU validity columns require FixedSizeList source data");let h="string"==typeof o?c.type.listSize:o.dimensions??c.type.listSize,[d,...f]=c.data;if(!d||f.length>0)throw Error("Arrow RecordBatch columns require exactly one Arrow Data chunk");let g=(0,O.bM)(d,h)??new Uint32Array(d.length).fill(1),m=(0,b.Hg)({type:new p.SS,length:g.length,data:g});i[l]=(0,_.i0)(t,m,{...r.bufferProps,format:"uint32"}),a.push({name:l,format:"uint32",nullable:!1,metadata:new Map}),s.add(l)}return new y.e({gpuData:i,bufferLayout:o,fields:a,numRows:e.numRows,metadata:new Map(e.schema.metadata),sourceInfo:r.sourceInfo,nullCount:e.nullCount})}(t,e,{...n,sourceInfo:{sourceBatchIndex:r,sourceRowIndexOffset:o,sourceRowCount:e.numRows}});return o+=e.numRows,a}))[0],s=i?.bufferLayout??(0===n.shaderLayout.attributes.length&&0===r.batches.length?[]:B(n.shaderLayout,{arrowTable:r,arrowPaths:n.arrowPaths,allowWebGLOnlyFormats:n.allowWebGLOnlyFormats})),l=i?.schema??{fields:function(t,e,r){let n=r.map(r=>{let n=e.arrowPaths?.[r.name]||r.name,o=(0,v.UM)(t,n);return{name:r.name,format:r.format,nullable:o.nullable,metadata:new Map(o.metadata)}}),o=new Set(n.map(t=>t.name));for(let r of M(e.shaderLayout)){if(o.has(r.name))throw Error(`GPURecordBatch shader input "${r.name}" cannot be both an attribute and a storage binding`);let a=R(t,e.arrowPaths?.[r.name]||r.name);a&&(n.push({name:r.name,format:e.fixedSizeListColumns?.includes(r.name)?D(a.type):(0,_.HY)(a.type),nullable:a.nullable,metadata:new Map(a.metadata)}),o.add(r.name))}for(let t of e.fixedSizeListColumns??[])if(!o.has(t)||r.some(e=>e.name===t))throw Error("Arrow fixed-size-list GPU columns require a selected storage binding");for(let[r,a]of Object.entries(e.validityColumns??{})){let i="string"==typeof a?a:a.name;if(!o.has(r)||o.has(i))throw Error("Arrow GPU validity columns require a selected source and unique output");let s=e.arrowPaths?.[r]||r,l=(0,v.UM)(t,s);if(!p.pe.isFixedSizeList(l.type))throw Error("Arrow GPU validity columns require FixedSizeList source data");let u="string"==typeof a?l.type.listSize:a.dimensions??l.type.listSize;if(!Number.isSafeInteger(u)||u<1||u>l.type.listSize)throw Error("Arrow FixedSizeList validity dimensions must fit within the list width");n.push({name:i,format:"uint32",nullable:!1,metadata:new Map}),o.add(i)}return n}(r,n,s),metadata:new Map(r.schema.metadata)},new x.P(a.length>0?{batches:a}:{schema:l,bufferLayout:s}))}}async function tw(t,e,r={}){(function(t){if(function(t,e){let r=ty(t);if(!(0,P.s$)(t)||!p.pe.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(r instanceof p.gh)&&!(r instanceof p.$G))throw Error(`convertArrowPathToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}(t.paths.type,"paths"),t.colors&&!tC(t.colors.type))throw Error("convertArrowPathToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof p.gh))throw Error("convertArrowPathToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof p.x))throw Error("convertArrowPathToGPUVectors closed flags must be Vector<Bool>")})(e),function(t){for(let[e,r]of[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]])if(r&&r.length!==t.paths.length)throw Error(`convertArrowPathToGPUVectors ${e} rows must match paths rows (${r.length} !== ${t.paths.length})`);t.colors&&tv(t.colors.type)&&tI(t.paths,t.colors)}(e);let n=r.id||"arrow-path-model",a=function(t){var e;let r,n=ty(t.type);if(n instanceof p.gh)return{paths:t};if(!(n instanceof p.$G))throw Error("convertArrowPathToGPUVectors paths must contain Float32 or Float64 coordinates");let o=tP(t.type),a=(e=o,r=new p.Y1(e,new f.D("values",new p.gh,!1)),new p.B8(new f.D("coordinates",r,!1))),i=new Float64Array(4*t.length),s=[],l=0;for(let e of t.data){let t=e.valueOffsets;if(!t)throw Error("convertArrowPathToGPUVectors Float64 paths require Arrow list offsets");let r=(0,O.TO)(e),n=t[0]??0,u=new Int32Array(t.length),c=new Float32Array(r.length);for(let e=0;e<t.length;e++)u[e]=(t[e]??n)-n;for(let a=0;a<e.length;a++){let e=l+a,s=(t[a]??n)-n,u=(t[a+1]??n)-n,h=0,d=0,f=0,p=0;if(Math.max(0,u-s)>0){let t=s*o;h=r[t]??0,d=r[t+1]??0,o>2&&(f=r[t+2]??0),o>3&&(p=r[t+3]??0)}let g=4*e;i[g]=h,i[g+1]=d,i[g+2]=f,i[g+3]=p;for(let t=s;t<u;t++){let e=t*o;c[e]=(r[e]??0)-h,c[e+1]=(r[e+1]??0)-d,o>2&&(c[e+2]=(r[e+2]??0)-f),o>3&&(c[e+3]=(r[e+3]??0)-p)}}s.push(function(t,e,r){let n=t.children[0].type,o=new b.B_(new p.gh,0,r.length,0,{[w.NZ.DATA]:r}),a=new b.B_(n,0,0===n.listSize?0:r.length/n.listSize,0,{},[o]);return new b.B_(t,0,e.length-1,0,{[w.NZ.OFFSET]:e},[a])}(a,u,c)),l+=e.length}return{paths:new m.M(s),sourceOrigins:i}}(e.paths),i=a.sourceOrigins,s=a.paths.data.map(t=>t.length),l=function(t){switch(tP(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw Error("PathAttributeModel paths require 2, 3, or 4 coordinate components")}}(a.paths.type),u=(0,_.ft)(t,a.paths,{name:"paths",id:`${n}-paths`,format:l}),c=a.paths;if(e.closed){let o=await X(t,{paths:u,closed:e.closed,epsilon:r.closeEpsilon??0,id:`${n}-closed`});u.destroy(),u=o,c=await (0,_.fV)(u)}let h=e.colors?(0,_.ft)(t,e.colors,{name:"colors",id:`${n}-colors`,format:tv(e.colors.type)?"vertex-list<unorm8x4>":"unorm8x4",preserveDataChunks:!0}):void 0,y=e.widths?(0,_.ft)(t,e.widths,{name:"widths",id:`${n}-widths`,format:"float32",preserveDataChunks:!0}):void 0,x=new Float32Array(4*e.paths.length),v=i?tr(x,s):void 0,C=i?(0,_.ft)(t,v,{name:tf,id:`${n}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;i&&(to(x,i,tg),tn(C,x));let I={};e.colors&&(I.colors=e.colors),e.widths&&(I.widths=e.widths);let E=function(t,e){let r=function(t){if(t.rowTable.schema.fields.length>0&&t.rowTable.numRows!==t.paths.length)throw Error("PathAttributeModel requires rowTable rows to match path rows");tL(t.rowTable,ta),tL(t.rowTable,ti),tL(t.rowTable,ts),tL(t.rowTable,tl),tL(t.rowTable,tu),tL(t.rowTable,tc),tL(t.rowTable,th),tL(t.rowTable,td),tL(t.rowTable,tf);let e=tO(),r=function(t){let e=t.getChild("colors");if(e)return tC(e.type)?e:void 0}(t.rowTable),n=function(t,e,r){var n=t.type;if(!(0,P.s$)(n)||!p.pe.isFixedSizeList(n.children[0].type)||n.children[0].type.listSize<2||n.children[0].type.listSize>4||!(n.children[0].type.children[0]?.type instanceof p.gh))throw Error("PathAttributeModel paths must be GPUVector<List<FixedSizeList<Float32>[2..4]>>");e&&function(t,e){if(!p.pe.isFixedSizeList(t.type)||4!==t.type.listSize||!(t.type.children[0]?.type instanceof p.gh))throw Error("PathAttributeModel view origins must be Vector<FixedSizeList<Float32>[4]>");if(t.length!==e)throw Error(`PathAttributeModel view origin rows must match path rows (${t.length} !== ${e})`)}(e,t.length),r&&function(t,e){if(!tC(t.type))throw Error("PathAttributeModel colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.length!==e.length)throw Error(`PathAttributeModel color rows must match path rows (${t.length} !== ${e.length})`);tv(t.type)&&tI(e,t)}(r,t);let o=tP(t.type),a=[0];for(let e of t.data){let t=e.valueOffsets;if(!t)throw Error("PathAttributeModel source path chunks require Arrow list offsets");for(let r=0;r<e.length;r++){let e=t[r]??0,n=Math.max(0,(t[r+1]??e)-e-1);a.push((a[a.length-1]??0)+n)}}let i=a[a.length-1]??0,s=new Float32Array(4*i),l=new Float32Array(4*i),u=new Float32Array(4*i),c=new Float32Array(4*i),h=new Float32Array(4*i),d=new Uint32Array(i),f=new Uint32Array(i),g=new Uint32Array(i);f.fill(0xffffffff),g.fill(0xffffffff);let m=function(t){if(!t)return;let e=[],r=0;for(let n of t.data){let t=r+n.length;e.push({rowStart:r,rowEnd:t,values:(0,O.DE)(n)}),r=t}return{chunks:e,currentChunkIndex:0}}(e),b=function(t){if(!t)return;let e=[],r=0;for(let n of t.data){let t=r+n.length;if(tv(n.type)){let o=n.valueOffsets;if(!o)throw Error("PathAttributeModel vertex colors require Arrow list offsets");e.push({kind:"vertex",rowStart:r,rowEnd:t,valueOffsets:o,values:(0,O.TO)(n)})}else e.push({kind:"row",rowStart:r,rowEnd:t,values:(0,O.DE)(n)});r=t}return{chunks:e,currentChunkIndex:0}}(r),w=0,y=0;for(let e of t.data){let t=e.valueOffsets;if(!t)throw Error("PathAttributeModel source path chunks require Arrow list offsets");let r=(0,O.TO)(e),n=t[0]??0;for(let i=0;i<e.length;i++){let e=(t[i]??n)-n,p=(t[i+1]??e)-n,x=Math.max(0,p-e),v=Math.max(0,x-1),C=function(t,e,r,n){if(n<3)return!1;let o=r*e,a=(r+n-1)*e;for(let r=0;r<e;r++)if(t[o+r]!==t[a+r])return!1;return!0}(r,o,e,x);(function(t,e,r,n,o){if(!n||0===r)return;let a=function(t,e){let r=t.chunks[t.currentChunkIndex];for(;r&&e>=r.rowEnd;)t.currentChunkIndex++,r=t.chunks[t.currentChunkIndex];if(r&&e>=r.rowStart&&e<r.rowEnd)return r;throw Error(`PathAttributeModel view origin row ${e} is missing`)}(n,o),i=(o-a.rowStart)*4,s=a.values,l=s[i]??0,u=s[i+1]??0,c=s[i+2]??0,h=s[i+3]??0;for(let n=0;n<r;n++){let r=(e+n)*4;t[r]=l,t[r+1]=u,t[r+2]=c,t[r+3]=h}})(h,a[y]??w,v,m,y),function(t,e,r,n,o,a){if(!o||0===n)return;let i=function(t,e){let r=t.chunks[t.currentChunkIndex];for(;r&&e>=r.rowEnd;)t.currentChunkIndex++,r=t.chunks[t.currentChunkIndex];if(r&&e>=r.rowStart&&e<r.rowEnd)return r;throw Error(`PathAttributeModel color row ${e} is missing`)}(o,a),s=a-i.rowStart;if("row"===i.kind){let o=tE(i.values,4*s);t.fill(o,r,r+n),e.fill(o,r,r+n);return}let l=i.valueOffsets[0]??0,u=(i.valueOffsets[s]??l)-l;if((i.valueOffsets[s+1]??u)-l-u<n+1)throw Error("PathAttributeModel vertex colors must provide one color per path vertex");for(let o=0;o<n;o++){let n=r+o;t[n]=tE(i.values,(u+o)*4),e[n]=tE(i.values,(u+o+1)*4)}}(f,g,a[y]??w,v,b,y);for(let t=0;t<v;t++){let n=e+t,a=n+1,i=0===t?C?p-2:n:n-1,h=t===v-1?C?e+1:a:a+1;tS(s,w,r,n,o),tS(l,w,r,a,o),tS(u,w,r,i,o),tS(c,w,r,h,o);let f=4*!!C;0===t&&(f|=1),t===v-1&&(f|=2),d[w]=f,w++}y++}}return{startIndices:a,segmentCount:i,segmentStartPositions:s,segmentEndPositions:l,segmentPreviousPositions:u,segmentNextPositions:c,segmentViewOrigins:h,segmentFlags:d,segmentStartColors:f,segmentEndColors:g}}(t.paths,t.viewOrigins,r),o=tB(n.startIndices,t.rowIndexBase),a=tB(n.startIndices),i=[],s={};for(let e of t.rowTable.schema.fields){let r=t.rowTable.getChild(e.name);r&&(0,P.Jd)(r.type)&&(i.push(e),s[e.name]=(0,V.p)(r,a))}i.push(tA(ta,4)),i.push(tA(ti,4)),i.push(tA(ts,4)),i.push(tA(tl,4)),i.push(new f.D(th,new p.SS,!1)),i.push(new f.D(td,new p.SS,!1)),s[ta]=N(new p.gh,4,n.segmentStartPositions),s[ti]=N(new p.gh,4,n.segmentEndPositions),s[ts]=N(new p.gh,4,n.segmentPreviousPositions),s[tl]=N(new p.gh,4,n.segmentNextPositions),s[th]=tT(new p.SS,n.segmentFlags),s[td]=tT(new p.SS,o);let l=tO()-e,u=function(t){let e=0;for(let r of Object.values(t))(0,P.Jd)(r.type)&&(e+=(0,O.as)(r).byteLength);return e}(s);return{table:new g.XI(new f.S(i,t.rowTable.schema.metadata),s),segmentLayout:n,segmentAttributeBuildTimeMs:l,attributeByteLength:u}}({rowTable:e.rowTable,paths:e.paths,viewOrigins:e.viewOrigins,rowIndexBase:e.rowIndexBase}),n=(0,d.J)({device:t,recordOffsets:r.segmentLayout.startIndices,recordByteStride:tp,resourceLabel:"PathAttributeModel expanded path vertex data"}),a=n.map(n=>(function(t,e,{segmentTable:r,generatedBufferBatch:n}){let{segmentLayout:a}=r,i=n.byteLength,s=new ArrayBuffer(Math.max(i,tp)),l=new Float32Array(s),u=new Uint32Array(s),c=tB(a.startIndices);for(let t=n.recordStart;t<n.recordEnd;t++){let e=t-n.recordStart,r=e*tp/Float32Array.BYTES_PER_ELEMENT,o=e*tp/Uint32Array.BYTES_PER_ELEMENT,i=4*t;l.set(a.segmentStartPositions.subarray(i,i+4),r),l.set(a.segmentEndPositions.subarray(i,i+4),r+4),l.set(a.segmentPreviousPositions.subarray(i,i+4),r+8),l.set(a.segmentNextPositions.subarray(i,i+4),r+12),u[o+16]=a.segmentFlags[t],u[o+17]=c[t],u[o+18]=a.segmentStartColors[t],u[o+19]=a.segmentEndColors[t]}return{buffer:t.createBuffer({id:`${e.id||"arrow-path-model"}-expanded-path-vertex-data-${n.rowStart}`,usage:o.h.VERTEX|o.h.COPY_DST|o.h.COPY_SRC,data:new Uint8Array(s,0,Math.max(i,tp))}),byteLength:i}})(t,{id:e.id},{segmentTable:r,generatedBufferBatch:n})),i=n.map(n=>{var a,i,s,l;let u,c,h,d,f;return a=t,i={id:e.id},s=r,l=n,u=4*Float32Array.BYTES_PER_ELEMENT,c=l.recordCount*u,h=new Float32Array(Math.max(4*l.recordCount,4)),d=4*l.recordStart,f=4*l.recordEnd,h.set(s.segmentLayout.segmentViewOrigins.subarray(d,f)),{buffer:a.createBuffer({id:`${i.id||"arrow-path-model"}-path-view-origin-data-${l.rowStart}`,usage:o.h.VERTEX|o.h.COPY_DST|o.h.COPY_SRC,data:h}),byteLength:c}}),s=a[0],l=i[0];if(!s||!l)throw Error("PathAttributeModel requires at least one generated path render batch");let u=n.map((t,e)=>({rowStart:t.rowStart,rowEnd:t.rowEnd,segmentCount:t.recordCount,expandedPathVertexData:a[e].buffer,pathViewOriginData:i[e].buffer})),c=!1;return{segmentTable:r,segmentLayout:r.segmentLayout,expandedPathVertexData:s.buffer,pathViewOriginData:l.buffer,renderBatches:u,generatedBufferBatches:n,destroy:()=>{c||(c=!0,function(t){for(let e of new Set(t.flatMap(t=>[t.expandedPathVertexData,t.pathViewOriginData])))e.destroy()}(u))}}}(t,{id:n,rowTable:new g.XI(I),paths:c,viewOrigins:v,rowIndexBase:r.rowIndexBase}),S=!1;return{id:n,paths:u,...h?{colors:h}:{},...y?{widths:y}:{},...C?{viewOrigins:C}:{},pathState:E,...i?{sourceOrigins:i}:{},updateViewOrigins:({modelViewMatrix:t})=>{i&&C&&(to(x,i,t),tn(C,x),function(t,e){let{segmentLayout:r}=t.segmentTable;for(let t=0;t<r.startIndices.length-1;t++){let n=r.startIndices[t]??0,o=r.startIndices[t+1]??n,a=4*t;for(let t=n;t<o;t++)r.segmentViewOrigins.set(e.subarray(a,a+4),4*t)}for(let[e,n]of t.generatedBufferBatches.entries()){let o=t.renderBatches[e];if(!o)continue;let a=new Float32Array(Math.max(4*n.recordCount,4));a.set(r.segmentViewOrigins.subarray(4*n.recordStart,4*n.recordEnd)),o.pathViewOriginData.write(a)}}(E,x))},destroy:()=>{S||(S=!0,E.destroy(),u.destroy(),h?.destroy(),y?.destroy(),C?.destroy())}}}function ty(t){let e=t.children[0]?.type;return p.pe.isFixedSizeList(e)?e.children[0]?.type:void 0}function tx(t){return p.pe.isFixedSizeList(t)&&4===t.listSize&&t.children[0]?.type instanceof p.l5}function tv(t){return p.pe.isList(t)&&tx(t.children[0]?.type)}function tC(t){return tx(t)||tv(t)}function tI(t,e){if(t.data.length!==e.data.length)throw Error("PathAttributeModel vertex color batch count must match path batch count");for(let r=0;r<t.data.length;r++){let n=t.data[r]?.valueOffsets,o=e.data[r]?.valueOffsets;if(!n||!o||!function(t,e){return t.length===e.length&&t.every((t,r)=>t===e[r])}(n,o))throw Error("PathAttributeModel vertex colors must align with path vertex offsets")}}function tP(t){let e=t.children[0]?.type;if(!e||!p.pe.isFixedSizeList(e))throw Error("PathAttributeModel paths require FixedSizeList coordinate elements");return e.listSize}function tE(t,e){return((t[e]??255)|(t[e+1]??255)<<8|(t[e+2]??255)<<16|(t[e+3]??255)<<24)>>>0}function tS(t,e,r,n,o){let a=4*e,i=n*o;for(let e=0;e<o;e++)t[a+e]=r[i+e]??0}function tB(t,e=0){let r=new Uint32Array(t[t.length-1]??0);for(let n=0;n<t.length-1;n++)r.fill(e+n,t[n],t[n+1]);return r}function tL(t,e){if(t.getChild(e))throw Error(`PathAttributeModel rowTable column "${e}" is reserved`)}function tA(t,e){return new f.D(t,new p.Y1(e,new f.D("value",new p.gh,!1)),!1)}function tT(t,e){let r=b.Hg;return(0,m.g)(r({type:t,length:e.length,data:e}))}function tO(){return"u"<typeof performance?Date.now():performance.now()}var t_=r(26564);let tk=`
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
`,tM={bindings:[{name:"sourcePathValues",type:"read-only-storage",group:0,location:0},{name:"sourcePathValueOffsets",type:"read-only-storage",group:0,location:1},{name:"pathDeltaConfig",type:"read-only-storage",group:0,location:2},{name:"pathDeltaValues",type:"storage",group:0,location:3}],attributes:[]};async function tR(t,e,r={}){var n;let i;if("webgpu"!==t.type)throw Error("convertArrowPathFloat64ToGPUVector requires a WebGPU device");let s=function(t){let e=t.children[0]?.type;if(!e||!p.pe.isFixedSizeList(e))throw Error("Float64 path conversion requires FixedSizeList coordinate elements");return e.listSize}(e.type),l=(n=s,i=new p.Y1(n,new f.D("values",new p.gh,!1)),new p.B8(new f.D("coordinates",i,!1))),u=function(t){switch(t){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw Error("convertArrowPathFloat64ToGPUVector paths require 2, 3, or 4 components")}}(s),c=[],h=new Float64Array(4*e.length),d=[],g=0;for(let[n,i]of e.data.entries()){let e=(0,O.TO)(i),f=function(t){let e=t.valueOffsets;if(!e)throw Error("Float64 path conversion requires Arrow list offsets");let r=e[0]??0;return Int32Array.from(e,t=>t-r)}(i);!function(t,e,r,n,o){for(let a=0;a<n.length-1;a++){let i=n[a]??0,s=Math.max(0,(n[a+1]??i)-i),l=(e+a)*4;if(0===s)continue;let u=i*o;t[l]=r[u]??0,t[l+1]=r[u+1]??0,o>2&&(t[l+2]=r[u+2]??0),o>3&&(t[l+3]=r[u+3]??0)}}(h,g,e,f,s);let p=new a.kL(t,{id:`${r.id||"arrow-path-storage-model"}-source-path-values-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,...e.length>0?{data:e}:{byteLength:Float64Array.BYTES_PER_ELEMENT}}),m=t.createBuffer({id:`${r.id||"arrow-path-storage-model"}-source-path-value-offsets-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,data:new Uint32Array(f)}),b=t.createBuffer({id:`${r.id||"arrow-path-storage-model"}-path-delta-config-${n}`,usage:o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,data:new Uint32Array([i.length,s])}),w=new a.kL(t,{id:`${r.id||"arrow-path-storage-model"}-path-delta-values-${n}`,usage:o.h.VERTEX|o.h.STORAGE|o.h.COPY_DST|o.h.COPY_SRC,byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,e.length*Float32Array.BYTES_PER_ELEMENT)});(function(t,e,r){let n={sourcePathValues:r.sourcePathValues,sourcePathValueOffsets:r.sourcePathValueOffsets,pathDeltaConfig:r.pathDeltaConfig,pathDeltaValues:r.pathDeltaValues},o=(0,$.W)(t,{id:`${e.id||"arrow-path-storage-model"}-path-delta-compute-${r.chunkIndex}`,source:tk,modules:[t_.d],shaderLayout:tM});if(r.rowCount>0){let e=t.beginComputePass({});o.dispatch(e,{x:Math.ceil(r.rowCount/64),bindings:n}),e.end(),t.submit()}o.destroy()})(t,r,{chunkIndex:n,rowCount:i.length,sourcePathValues:p,sourcePathValueOffsets:m,pathDeltaConfig:b,pathDeltaValues:w}),c.push(new j.L({buffer:w,dataType:l,format:u,length:i.length,valueLength:e.length/s,stride:s,byteStride:s*Float32Array.BYTES_PER_ELEMENT,rowByteLength:s*Float32Array.BYTES_PER_ELEMENT,ownsBuffer:!0,valueOffsets:f,readbackMetadata:{kind:"variable-length-attribute",valueOffsets:f,nullCount:0,valueByteLength:e.length*Float32Array.BYTES_PER_ELEMENT}})),d.push(p,m,b),g+=i.length}for(let e of(await tD(t),d))e.destroy();return{paths:new G.M({type:"data",name:"paths",dataType:l,format:u,data:c,stride:s,byteStride:s*Float32Array.BYTES_PER_ELEMENT,rowByteLength:s*Float32Array.BYTES_PER_ELEMENT,ownsData:!0}),sourceOrigins:h}}async function tD(t){let e=t.handle?.queue;await e?.onSubmittedWorkDone?.()}var tV=r(68482);async function tF(t,e,r={}){if("webgpu"!==t.type)throw Error("convertArrowPathStorageToGPUVectors requires a WebGPU device");(function(t){var e;if(function(t,e){let r=t$(t);if(!(0,P.s$)(t)||!p.pe.isFixedSizeList(t.children[0].type)||t.children[0].type.listSize<2||t.children[0].type.listSize>4||!(r instanceof p.gh)&&!(r instanceof p.$G))throw Error(`convertArrowPathStorageToGPUVectors ${e} must be Vector<List<FixedSizeList<Float32|Float64>[2..4]>>`)}(t.paths.type,"paths"),t.colors&&!(tU(e=t.colors.type)||tN(e)))throw Error("convertArrowPathStorageToGPUVectors colors must be Vector<FixedSizeList<Uint8>[4]> or Vector<List<FixedSizeList<Uint8>[4]>>");if(t.widths&&!(t.widths.type instanceof p.gh))throw Error("convertArrowPathStorageToGPUVectors widths must be Vector<Float32>");if(t.closed&&!(t.closed.type instanceof p.x))throw Error("convertArrowPathStorageToGPUVectors closed flags must be Vector<Bool>");if(t.timestamps&&!(p.pe.isList(t.timestamps.type)&&t.timestamps.type.children[0]?.type&&(p.pe.isDate(t.timestamps.type.children[0].type)||p.pe.isTime(t.timestamps.type.children[0].type)||p.pe.isTimestamp(t.timestamps.type.children[0].type)||p.pe.isDuration(t.timestamps.type.children[0].type))))throw Error("convertArrowPathStorageToGPUVectors timestamps must be Vector<List<Date|Time|Timestamp|Duration>>")})(e),function(t){for(let[e,r]of[["colors",t.colors],["widths",t.widths],["closed",t.closed],["timestamps",t.timestamps]])if(r&&r.length!==t.paths.length)throw Error(`convertArrowPathStorageToGPUVectors ${e} rows must match paths rows (${r.length} !== ${t.paths.length})`);t.colors&&tN(t.colors.type)&&function(t,e){if(t.data.length!==e.data.length)throw Error("convertArrowPathStorageToGPUVectors vertex color batch count must match paths");for(let r=0;r<t.data.length;r++){let n=t.data[r]?.valueOffsets,o=e.data[r]?.valueOffsets;if(!n||!o||!function(t,e){return t.length===e.length&&t.every((t,r)=>t===e[r])}(n,o))throw Error("convertArrowPathStorageToGPUVectors vertex colors must align with paths")}}(t.paths,t.colors)}(e);let n=r.id||"arrow-path-storage-model",o=await tG(t,e.paths,{id:n}),a=o.paths;if(e.closed){let o=await X(t,{paths:a,closed:e.closed,epsilon:r.closeEpsilon??0,id:`${n}-closed`});a.destroy(),a=o}let i=e.colors?(0,_.ft)(t,e.colors,{name:"colors",id:`${n}-colors`,format:tN(e.colors.type)?"vertex-list<unorm8x4>":"unorm8x4",preserveDataChunks:!0}):void 0,s=e.widths?(0,_.ft)(t,e.widths,{name:"widths",id:`${n}-widths`,preserveDataChunks:!0}):void 0,l=e.timestamps?await (0,tV.DC)(t,e.timestamps,{name:"timestamps",id:`${n}-timestamps`}):void 0,u=l?.temporal,c=o.sourceOrigins,h=new Float32Array(4*e.paths.length),d=c?tr(h,o.paths.data.map(t=>t.length)):void 0,f=c?(0,_.ft)(t,d,{name:"pathViewOrigins",id:`${n}-view-origins`,format:"float32x4",preserveDataChunks:!0}):void 0;c&&f&&(to(h,c,[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]),tn(f,h));let g=!1;return{id:n,paths:a,...i?{colors:i}:{},...s?{widths:s}:{},...u?{timestamps:u}:{},...f?{viewOrigins:f}:{},rowIndexBase:r.rowIndexBase,...c?{sourceOrigins:c}:{},updateViewOrigins:({modelViewMatrix:t})=>{c&&f&&(to(h,c,t),tn(f,h))},destroy:()=>{g||(g=!0,a.destroy(),i?.destroy(),s?.destroy(),l?.destroy(),f?.destroy())}}}function tU(t){return p.pe.isFixedSizeList(t)&&4===t.listSize&&t.children[0]?.type instanceof p.l5}function tN(t){return p.pe.isList(t)&&tU(t.children[0]?.type)}function t$(t){let e=t.children[0]?.type;return p.pe.isFixedSizeList(e)?e.children[0]?.type:void 0}async function tG(t,e,r){let n=t$(e.type);if(n instanceof p.gh)return{paths:(0,_.ft)(t,e,{name:"paths",id:`${r.id||"arrow-path-storage-model"}-paths`,format:function(t){switch(function(t){let e=t.children[0]?.type;if(!e||!p.pe.isFixedSizeList(e))throw Error("convertArrowPathStorageToGPUVectors paths require FixedSizeList coordinates");return e.listSize}(t)){case 2:return"vertex-list<float32x2>";case 3:return"vertex-list<float32x3>";case 4:return"vertex-list<float32x4>";default:throw Error("convertArrowPathStorageToGPUVectors paths require 2, 3, or 4 components")}}(e.type),preserveDataChunks:!0})};if(!(n instanceof p.$G))throw Error("convertArrowPathStorageToGPUVectors paths must contain Float32 or Float64");return tR(t,e,r)}class tj{static async convertToGPUVectors(t,e,r={}){let{model:n="attribute",...o}=r;switch(n){case"storage":return function(t,e,r={}){return tF(t,e,r)}(t,e,o);case"trips":return function(t,e,r={}){if(!e.timestamps)throw Error("convertArrowTripsToStorage requires a timestamps column");return tF(t,e,r)}(t,e,o);case"attribute":return function(t,e,r={}){return tw(t,e,r)}(t,e,o)}}static makeModelProps(t,e){return tb(t,e)}static createModel(t,e){switch(e.model){case"storage":{let{model:r,...o}=e;return new n.ye(t,o)}case"trips":{let{model:r,...n}=e;return new u(t,n)}case"attribute":case void 0:{let{model:r,...n}=e;return new h.L(t,tb(t,n))}}throw Error("ArrowPathRenderer received unsupported model")}}},14247(t,e,r){r.d(e,{i:()=>i});var n=r(96179),o=r(46252),a=r(21528);function i(t,e={}){let r=t.name||"PathModel",s=e.selectors||{},l=function(t){if(t)return t instanceof n.XI?t:new n.XI([t])}(e.data),u=new Set(l?(0,a.UR)(l):[]),c=t.gpuInputSchema.filter(t=>!t.internal);var h,d,f,p,g=r,m=c,b=s;let w=new Set(m.map(t=>t.columnName));for(let[t,e]of Object.entries(b))if(void 0!==e&&!w.has(t))throw Error(`${g} source selector "${t}" is not declared as source-mappable`);let y={};for(let t of c){if("paths"!==(h=t.columnName)&&"colors"!==h&&"widths"!==h&&"timestamps"!==h)throw Error(`${r} source mapping does not support GPU input "${t.columnName}"`);let e=function(t,e,r,n,i){if(null===r){if(e.required)throw Error(`${t} source selector "${e.columnName}" cannot be null`);return}if(r instanceof o.M)return r;let s=r??e.columnName;if(!n){if(void 0===r&&!e.required)return;throw Error(`${t} source selector "${e.columnName}" requires data to resolve column "${s}"`)}if(!i.has(s)){if(void 0===r&&!e.required)return;throw Error(`${t} source column "${s}" for "${e.columnName}" is missing`)}return(0,a.FO)(n,s)}(r,t,s[t.columnName],l,u);e&&(d=y,f=t.columnName,p=e,d[f]=p)}if(!y.paths)throw Error(`${r} source mapping requires paths`);return y}},64632(t,e,r){r.d(e,{hX:()=>K});var n=r(18538),o=r(42399),a=r(28188),i=r(5238),s=r(41071),l=r(60097),u=r(19531),c=r(29797),h=r(16496),d=r(77231);let f=[{columnName:"positions",attributeName:"positions",storageBindingName:"polygonPositions",kind:"positions",required:!0,formats:["vertex-list<float32x4>"],internal:!0},{columnName:"colors",attributeName:"colors",storageBindingName:"polygonColors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"],internal:!0},{columnName:"rowIndices",attributeName:"rowIndices",storageBindingName:"polygonRowIndices",kind:"scalars",required:!0,formats:["vertex-list<uint32>"],internal:!0},{columnName:"indices",kind:"scalars",required:!0,formats:["vertex-list<uint32>"],internal:!0}];function p(t,e){(0,d.j)(t,f,e),function(t,e){let r=Object.entries(e).filter(([,t])=>"data"in t),[n,o]=r[0];for(let[e,a]of r.slice(1))if(a.length!==o.length)throw Error(`${t} ${e} rows must match ${n} rows (${a.length} !== ${o.length})`)}(t,e),function(t,e){let r=e.positions.valueLength;if("valueLength"in e.colors&&e.colors.valueLength!==r||e.rowIndices.valueLength!==r)throw Error(`${t} positions, colors, and rowIndices require matching valueLength`)}(t,e)}class g extends s.y{static gpuInputSchema=f;polygonTable;constructor(t,e){if("webgpu"!==t.type)throw Error("PolygonStorageModel is WebGPU-only");let r=function(t,e){var r;let s,{positions:l,colors:h,rowIndices:d,indices:p,sourceInfo:g,nullCount:b,picking:w=!1,parameters:y,shaderInputs:x,...v}=e,C=(s=m(r={positions:l,colors:h,rowIndices:d,indices:p,sourceInfo:g,nullCount:b}),new c.P({batches:[s],constants:r.colors instanceof u.z?{colors:r.colors}:void 0})),I=(0,o.cO)(t);return{table:C,modelProps:{...v,source:v.source??n.VF,...w&&I?{fragmentEntryPoint:"fragmentPicking"}:{},modules:(0,n.b2)([w&&I?a.q:(0,i.Q)(t)],v.modules??[]),shaderLayout:v.shaderLayout??n.uW,shaderInputs:x,table:C,tableCount:"none",gpuInputSchema:f,topology:"triangle-list",...w&&I?{colorAttachmentFormats:["rgba8unorm","rg32sint"],depthStencilAttachmentFormat:"depth24plus"}:{},parameters:y??(0,n.Cr)(w)}}}(t,e);super(t,r.modelProps),this.polygonTable=r.table}addBatch(t){(function(t,e){if(!!t.gpuConstants.colors!=e instanceof u.z)throw Error("PolygonStorageModel appended batches must use the same color input mode")})(this.polygonTable,t.colors),this.polygonTable.addBatch(m(t)),this.setTable(this.polygonTable),this.setNeedsRedraw("Polygon batch added")}}function m(t){let{sourceInfo:e,nullCount:r=0,colors:n,...o}=t;p("PolygonStorageModel",{...o,colors:n});let a=n instanceof u.z?o:{...o,colors:n};return new l.e({gpuData:Object.fromEntries(Object.entries(a).map(([t,e])=>[t,(0,h.uK)(e)])),bufferLayout:[],sourceInfo:e,nullCount:r})}class b extends s.y{static gpuInputSchema=f;polygonTable;constructor(t,e){let r=function(t,e){var r;let s,{positions:l,colors:h,rowIndices:d,indices:p,sourceInfo:g,nullCount:m,picking:b=!1,parameters:y,shaderInputs:x,...v}=e,C=(s=w(r={positions:l,colors:h,rowIndices:d,indices:p,sourceInfo:g,nullCount:m}),new c.P({batches:[s],constants:r.colors instanceof u.z?{colors:r.colors}:void 0})),I=(0,o.cO)(t);return{table:C,modelProps:{...v,source:v.source??n.sm,vs:v.vs??n.F,fs:v.fs??(b&&I?n.KH:n.SN),...b&&I?{fragmentEntryPoint:"fragmentPicking"}:{},modules:(0,n.b2)([b&&I?a.q:(0,i.Q)(t)],v.modules??[]),shaderLayout:v.shaderLayout??n.BG,shaderInputs:x,table:C,tableCount:"none",gpuInputSchema:f,topology:"triangle-list",...b&&I?{colorAttachmentFormats:["rgba8unorm","rg32sint"],depthStencilAttachmentFormat:"depth24plus"}:{},parameters:y??(0,n.Cr)(b)}}}(t,e);super(t,r.modelProps),this.polygonTable=r.table}addBatch(t){(function(t,e){if(!!t.gpuConstants.colors!=e instanceof u.z)throw Error("PolygonAttributeModel appended batches must use the same color input mode")})(this.polygonTable,t.colors),this.polygonTable.addBatch(w(t)),this.setTable(this.polygonTable),this.setNeedsRedraw("Polygon batch added")}}function w(t){var e;let{sourceInfo:r,nullCount:n=0,colors:o,...a}=t;p("PolygonAttributeModel",{...a,colors:o});let i=o instanceof u.z?a:{...a,colors:o};return new l.e({gpuData:Object.fromEntries(Object.entries(i).map(([t,e])=>[t,(0,h.uK)(e)])),bufferLayout:[{name:"positions",byteStride:(e=i).positions.byteStride,format:"float32x4"},...e.colors?[{name:"colors",byteStride:e.colors.byteStride,format:"unorm8x4"}]:[],{name:"rowIndices",byteStride:e.rowIndices.byteStride,format:"uint32"}],sourceInfo:r,nullCount:n})}var y=r(96179),x=r(37589),v=r(75876),C=r(79475),I=r(59858);let P={batchIndex:null,objectIndex:null};function E(t,e){let r=null!==t.pickInfo.batchIndex||null!==t.pickInfo.objectIndex;t.clearPickState(),t.pickInfo=P,r&&e?.(P)}function S(t,e){var r,n;if(null===t.batchIndex||null===t.objectIndex)return{batchIndex:null,rowIndex:null,batchRowIndex:null};let o=(r=e,n=t.batchIndex,r?Array.isArray(r)?r[n]??void 0:"batches"in r?r.batches[n]?.sourceInfo:r.sourceInfos?.[n]??r.table?.batches[n]?.sourceInfo:void 0);return{batchIndex:o?.sourceBatchIndex??t.batchIndex,rowIndex:t.objectIndex,batchRowIndex:function(t,e){if(!e)return null;let r=t-e.sourceRowIndexOffset;return r>=0&&r<e.sourceRowCount?r:null}(t.objectIndex,o)}}var B=r(52918),L=r(55590),A=r(6116),T=r(59334),O=r(22477),_=r(43572),k=r(70154),M=r(35967);let R=[0,96,255,255];async function D(t,e={}){return await Promise.resolve(),function(t,e={}){let r=function(t){if(x.pe.isDenseUnion(t))return"dense-union";let e=0,r=t;for(;x.pe.isList(r);)e++,r=r.children[0].type;if(e<1||e>3)throw Error(`Unsupported Arrow polygon type ${t.toString()}`);return e}(t.polygons.type);if(e.tessellated){if(1!==r)throw Error("tessellated ArrowPolygonRenderer input must be List<FixedSizeList<...>>");return function(t,e){var r,n,o;let a="xy"===(r=(0,M.gl)(t.polygons.type))?2:"xyzm"===r?4:3,i=e.rowIndexOffset??0,s=[],l=[],u=[],c=[],h=V(t.colors),d=e.color??R,f=0;for(let e=0;e<t.polygons.length;e++){let r=U(t.polygons.get(e));if(null===r)continue;if(r.length%3!=0)throw Error("tessellated ArrowPolygonRenderer rows must contain a multiple of 3 vertices");let a=t.colors?U(t.colors.get(e)):null,p=h?F(a,d):d,g=h?null:a;for(let t=0;t<r.length;t++){(function(t,e){for(let r=0;r<4;r++)t.push(e[r]??0)})(s,r[t]),n=l,o=g?.[t]??p,n.push(o[0],o[1],o[2],o[3]),u.push(i+e),c.push(c.length)}f++}let p=s.length/4,g=p<=65535?Uint16Array:Uint32Array;return{positions:Float32Array.from(s),colors:Uint8Array.from(l),rowIndices:Uint32Array.from(u),indices:g.from(c),sourceDimension:a,vertexCount:p,triangleCount:c.length/3,rowCount:t.polygons.length,polygonCount:f}}(t,e)}if(1===r)throw Error("ArrowPolygonRenderer requires polygon or multipolygon nesting unless tessellated is true");let n=function(t,e={}){(0,k.Vi)(t,e.limits);let r=(0,_.VC)(t),n=(0,O.aJ)(t.dimension),o=e.positionSize||n,a=e.sourceRowOffset||0,i=[],s=[],l=[],u=0;for(let t=0;t<r.length;t++){let e=r[t];e&&function t(e,r){switch(e.type){case"Polygon":r(e.coordinates);break;case"MultiPolygon":for(let t of e.coordinates)r(t);break;case"GeometryCollection":for(let n of e.geometries)t(n,r)}}(e,e=>{let r=i.length/o,c=[],h=[],d=0;for(let r=0;r<e.length;r++){let l=function(t){if(t.length<2)return t;let e=t[0],r=t[t.length-1];if(e.length!==r.length)return t;for(let n=0;n<e.length;n++)if(e[n]!==r[n])return t;return t.slice(0,-1)}(e[r]);if(!(l.length<3))for(let e of(d>0&&h.push(d),l)){for(let t=0;t<n;t++)c.push(e[t]??0);for(let t=0;t<o;t++)i.push(e[t]??0);s.push(a+t),d++}}if(d>=3){for(let t of(0,T.h)(c,h,n))l.push(r+t);u++}})}let c=i.length/o,h=c<=65535?Uint16Array:Uint32Array;return{positions:Float32Array.from(i),sourceRowIndices:Uint32Array.from(s),indices:h.from(l),sourceDimension:n,positionSize:o,rowCount:r.length,polygonCount:u,vertexCount:c,triangleCount:l.length/3}}(function(t,e={}){return(0,M.bu)(t,e)}(t.polygons,{encoding:"dense-union"===r?"geoarrow.geometry":2===r?"geoarrow.polygon":"geoarrow.multipolygon"}),{positionSize:4,sourceRowOffset:e.rowIndexOffset??0}),o=n.sourceRowIndices;return{positions:n.positions,colors:function(t,e,r,n=R,o=0){let a=new Uint8Array(4*e.length);if(!t.colors){for(let t=0;t<e.length;t++)a.set(n,4*t);return a}if(V(t.colors)){for(let r=0;r<e.length;r++){let i=e[r]-o,s=F(U(t.colors.get(i)),n);a.set(s,4*r)}return a}if("dense-union"===r)throw Error("Per-vertex colors are not supported for mixed GeoArrow DenseUnion polygons");let i=new Map;for(let e=0;e<t.polygons.length;e++){let o=U(t.polygons.get(e)),a=U(t.colors.get(e));i.set(e,function t(e,r,n,o){if(!Array.isArray(e)||!Array.isArray(r))return[];if(3===n){let n=[];for(let a=0;a<e.length;a++)n.push(...t(e[a],r[a],2,o));return n}let a=[];for(let t=0;t<e.length;t++){let n=e[t],i=r[t]??[],s=!function(t){if(t.length<2)return!1;let e=t[0],r=t[t.length-1];return e.length===r.length&&e.every((t,e)=>t===r[e])}(n)?n.length:n.length-1;if(!(s<3))for(let t=0;t<s;t++)a.push(F(i[t],o))}return a}(o,a,r,n))}let s=new Map;for(let t=0;t<e.length;t++){let r=e[t]-o,n=s.get(r)??0,l=i.get(r)?.[n];if(!l)throw Error(`Arrow polygon vertex colors do not match geometry row ${r}`);a.set(l,4*t),s.set(r,n+1)}return a}(t,o,r,e.color,e.rowIndexOffset??0),rowIndices:o,indices:n.indices,sourceDimension:n.sourceDimension,vertexCount:n.vertexCount,triangleCount:n.triangleCount,rowCount:n.rowCount,polygonCount:n.polygonCount}}(t,e)}function V(t){return!!(t&&x.pe.isFixedSizeList(t.type)&&4===t.type.listSize&&x.pe.isInt(t.type.children[0].type))}function F(t,e){return!Array.isArray(t)||t.length<4?e:[Number(t[0]),Number(t[1]),Number(t[2]),Number(t[3])]}function U(t){var e;if(null==t)return null;if(ArrayBuffer.isView(t))return Array.from(t);if(Array.isArray(t))return t.map(U);if((e=t)&&"object"==typeof e&&"length"in e&&"get"in e&&"function"==typeof e.get){let e=[];for(let r=0;r<t.length;r++)e.push(U(t.get(r)));return e}return t}var N=r(9624);async function $(t,e,r={}){var n,o,a,i,s,l;let c,h,d,f,p,g,m,b=r.id??"arrow-polygon-model";return n=t,o=await D(e,r),a=b,i=r,s=!!e.colors,h=function(t,e){let r=new Int32Array(t.rowCount+1),n=e.rowIndexOffset??0,o=0;for(let e=0;e<t.rowCount;e++){r[e]=o;let a=n+e;for(;t.rowIndices[o]===a;)o++}return r[t.rowCount]=o,r}(c=(l=o).indices instanceof Uint32Array?l:{...l,indices:Uint32Array.from(l.indices)},i),d=function(t,e){let r=new Int32Array(t.rowCount+1),n=0;for(let o=0;o<t.rowCount;o++){r[o]=n;let a=e[o+1]??0;for(;n<t.indices.length&&t.indices[n]<a;)n++}return r[t.rowCount]=n,r}(c,h),f=new A.M({type:"buffer",name:"positions",buffer:n.createBuffer({id:`${a}-positions`,usage:L.h.VERTEX|L.h.STORAGE|L.h.COPY_DST|L.h.COPY_SRC,data:c.positions}),dataType:j(G(new x.gh,4)),format:"vertex-list<float32x4>",length:c.rowCount,valueLength:c.vertexCount,stride:4,byteStride:4*Float32Array.BYTES_PER_ELEMENT,ownsBuffer:!0}),p=s?new A.M({type:"buffer",name:"colors",buffer:n.createBuffer({id:`${a}-colors`,usage:L.h.VERTEX|L.h.STORAGE|L.h.COPY_DST|L.h.COPY_SRC,data:c.colors}),dataType:j(G(new x.l5,4)),format:"vertex-list<unorm8x4>",length:c.rowCount,valueLength:c.vertexCount,stride:4,byteStride:4*Uint8Array.BYTES_PER_ELEMENT,ownsBuffer:!0}):new u.z({format:"unorm8x4",value:Uint8Array.from(i.color??[0,96,255,255])}),g=new A.M({type:"buffer",name:"rowIndices",buffer:n.createBuffer({id:`${a}-row-indices`,usage:L.h.VERTEX|L.h.STORAGE|L.h.COPY_DST|L.h.COPY_SRC,data:c.rowIndices}),dataType:j(new x.SS),format:"vertex-list<uint32>",length:c.rowCount,valueLength:c.vertexCount,stride:1,byteStride:Uint32Array.BYTES_PER_ELEMENT,ownsBuffer:!0}),{positions:f,colors:p,rowIndices:g,indices:m=new A.M({type:"buffer",name:"indices",buffer:n.createBuffer({id:`${a}-indices`,usage:L.h.INDEX|L.h.COPY_DST|L.h.COPY_SRC,data:c.indices}),dataType:j(new x.SS),format:"vertex-list<uint32>",length:c.rowCount,valueLength:c.indices.length,stride:1,byteStride:Uint32Array.BYTES_PER_ELEMENT,ownsBuffer:!0}),sourceInfo:function({sourceBatchIndex:t=0,sourceRowIndexOffset:e=0,sourceRowCount:r}){return{sourceBatchIndex:t,sourceRowIndexOffset:e,sourceRowCount:r}}({sourceBatchIndex:i.sourceBatchIndex,sourceRowIndexOffset:i.rowIndexOffset,sourceRowCount:c.rowCount}),vertexValueOffsets:h,indexValueOffsets:d,tessellation:c,destroy:()=>{f.destroy(),p instanceof A.M&&p.destroy(),g.destroy(),m.destroy()}}}function G(t,e){return new x.Y1(e,new N.D("value",t,!1))}function j(t){return new x.B8(new N.D("value",t,!1))}var z=r(46252),Y=r(21528);function q(t,e,r,n){if(e instanceof z.M)return e;let o=e??t;if(!r){if(void 0===e&&"colors"===t)return;throw Error(`ArrowPolygonRenderer source selector "${t}" requires data to resolve column "${o}"`)}if(!n.has(o)){if(void 0===e&&"colors"===t)return;throw Error(`ArrowPolygonRenderer source column "${o}" for "${t}" is missing`)}return(0,Y.FO)(r,o)}var W=r(14878);let X=[0,96,255,255],H=[0,0];class K{device;shaderInputs;picker;props;preparedBatches=[];model=null;pickingModel=null;dataLoadVersion=0;constructor(t,e={}){var r;this.device=t,this.props=e;let a=e.modelProps?.modules?.find(t=>"picking"===t.name);this.shaderInputs=(0,n.vT)(t,a),e.modelProps?.modules&&this.shaderInputs.addModules(e.modelProps.modules),this.picker=(r={shaderInputs:this.shaderInputs,onObjectPicked:this.handleObjectPicked,getTooltip:this.getPolygonPickingTooltip},new o.xr(t,{mode:"auto",...r})),te(e)&&this.replaceData(e)}setProps(t){let e=this.props.model??"attribute",r=void 0!==t.data||void 0!==t.polygons||void 0!==t.colors||void 0!==t.tessellated||void 0!==t.color;(this.props={...this.props,...t},r)?this.replaceData(this.props,void 0!==t.data):void 0!==t.model&&t.model!==e&&this.recreateModels()}predraw(t){this.model?.predraw(t),this.pickingModel?.predraw(t)}draw(t,e){this.props.modelProps?.vs||this.shaderInputs.setProps({polygonViewport:{center:this.props.center??H,scale:this.props.scale??1,aspect:e.aspect}}),this.model?.drawBatches(t,{onBatch:(t,e)=>{this.props.modelProps?.vs||this.shaderInputs.setProps({picking:{batchIndex:e}})}})}pick(t,e={}){t?function({picker:t,mousePosition:e,pickingOptions:r,shaderInputs:n,draw:o}){if(!t.shouldPick(e,r))return;let a=t.beginRenderPass(),i=!1;try{i=!1!==o(a)}finally{a.end(),n?.setProps({picking:{isActive:!1}})}i&&t.updatePickInfo(e)}({picker:this.picker,mousePosition:t,pickingOptions:e,shaderInputs:this.shaderInputs,draw:t=>this.pickingModel?.drawBatches(t,{onBatch:(t,e)=>this.shaderInputs.setProps({picking:{batchIndex:e}})})??!1}):E(this.picker,this.handleObjectPicked)}destroy(){this.dataLoadVersion++,this.picker.destroy(),this.destroyPreparedBatches()}getMetrics(){let t=this.preparedBatches.map(t=>t.tessellation),e=t[0];return{rowCount:t.reduce((t,e)=>t+e.rowCount,0),polygonCount:t.reduce((t,e)=>t+e.polygonCount,0),vertexCount:t.reduce((t,e)=>t+e.vertexCount,0),triangleCount:t.reduce((t,e)=>t+e.triangleCount,0),sourceDimension:e?.sourceDimension??0,polygonArrowByteLength:this.preparedBatches.reduce((t,e)=>t+e.polygonArrowByteLength,0),stylingArrowByteLength:this.preparedBatches.reduce((t,e)=>t+e.stylingArrowByteLength,0),generatedGeometryGpuByteLength:t.reduce((t,e)=>t+e.positions.byteLength+e.rowIndices.byteLength+e.indices.byteLength,0),stylingGpuByteLength:t.reduce((t,e,r)=>{var n;return t+((n=this.preparedBatches[r]?.colors)?"isConstant"in n?n.byteLength:n.data.reduce((t,e)=>t+(e.valueByteLength??e.valueLength*e.byteStride),0):0)},0),tessellationTimeMs:this.preparedBatches.reduce((t,e)=>t+e.tessellationTimeMs,0)}}replaceData(t,e=!0){var r;this.dataLoadVersion++;let n=this.dataLoadVersion;E(this.picker,this.handleObjectPicked),this.destroyPreparedBatches(),te(t)&&(r=t,e||!r.data||r.polygons&&"string"!=typeof r.polygons)&&this.loadData(t,n)}async loadData(t,e){if(t.data)return void await (0,W.nR)({data:t.data,isActive:()=>this.isDataLoadActive(e),prepareBatch:(e,r)=>this.createPreparedRecordBatch(e,r,t),appendBatch:t=>this.appendPreparedBatch(t),destroyBatch:Q,getRowCount:t=>t.tessellation.rowCount,getMetrics:()=>this.getMetrics(),onBatch:t.onDataBatch,onError:t.onDataError});let r=await this.createPreparedBatch(t,0,0,"arrow-polygons");this.isDataLoadActive(e)?(this.appendPreparedBatch(r),t.onDataBatch?.({loadedBatchCount:1,isFirstBatch:!0,metrics:this.getMetrics(),preparedBatch:r})):Q(r)}async createPreparedRecordBatch(t,e,r){let n=new y.XI([t]);return await this.createPreparedBatch({...r,data:n},e.rowIndexOffset,e.batchIndex,`arrow-polygons-${e.batchIndex}`)}async createPreparedBatch(t,e,r,n){return await J(this.device,t,{rowIndexOffset:e,sourceBatchIndex:r,id:n})}appendPreparedBatch(t){if(this.preparedBatches.push(t),!this.model||!this.pickingModel)return void this.createModels(t);let e=tt(t);this.model.addBatch(e),this.pickingModel.addBatch(e)}destroyPreparedBatches(){for(let t of(this.destroyModels(),this.preparedBatches))Q(t);this.preparedBatches=[]}createModels(t){let e=tt(t);this.model=this.createModel({id:"arrow-polygons",...e,...this.props.modelProps,shaderInputs:this.shaderInputs}),this.pickingModel=this.createModel({id:"arrow-polygons-picking",...e,shaderInputs:this.shaderInputs,picking:!0})}recreateModels(){let[t,...e]=this.preparedBatches;if(this.destroyModels(),t)for(let r of(this.createModels(t),e)){let t=tt(r);this.model?.addBatch(t),this.pickingModel?.addBatch(t)}}destroyModels(){this.model?.destroy(),this.pickingModel?.destroy(),this.model=null,this.pickingModel=null}isDataLoadActive(t){return t===this.dataLoadVersion}handleObjectPicked=({batchIndex:t,objectIndex:e})=>{let r=S({batchIndex:t,objectIndex:e},this.getPickingSourceInfos());this.props.onPick?.(r)};getPolygonPickingTooltip=({batchIndex:t,objectIndex:e})=>{let r=S({batchIndex:t,objectIndex:e},this.getPickingSourceInfos());if(null===r.batchIndex||null===r.rowIndex)return null;let n=(r.batchIndex+1).toLocaleString();return`row ${r.rowIndex.toLocaleString()} / batch ${n}`};getPickingSourceInfos(){return this.model?.table?.batches.map(t=>t.sourceInfo)??[]}createModel(t){return"storage"===this.props.model?K.createModel(this.device,{model:"storage",...t}):K.createModel(this.device,{model:"attribute",...t})}static async convertToGPUVectors(t,e,r={}){return await Z(t,e,r)}static createModel(t,e){switch(e.model){case"storage":{let{model:r,...n}=e;return new g(t,n)}case"attribute":case void 0:{let{model:r,...n}=e;return new b(t,n)}}}}async function J(t,e,r={}){var n,o;let a=function(t={}){let e=t.selectors??{},r=function(t){if(t)return t instanceof y.XI?t:new y.XI([t])}(t.data),n=new Set(r?(0,Y.UR)(r):[]),o=function(t,e,r){let n=q("polygons",t,e,r);if(!n)throw Error("ArrowPolygonRenderer source mapping requires polygons");return n}(e.polygons,r,n),a=function(t,e,r){if(null!==t)return q("colors",t,e,r)}(e.colors,r,n);return a?{polygons:o,colors:a}:{polygons:o}}({data:(n=e.data)instanceof y.XI?n:null,selectors:{polygons:e.polygons,colors:e.colors}}),i=(0,B.R)(a.polygons),s=a.colors?(0,B.R)(a.colors):0;if(a.colors&&(o=a.colors)&&(0,v.wr)(o)&&(!x.pe.isFixedSizeList(o.type)||4!==o.type.listSize||!(o.type.children[0]?.type instanceof x.l5))){let e,n=await (0,C.b)(t,a.colors,{name:`${r.id??"arrow-polygons"}-colors`,semantic:"color",format:"unorm8x4"});try{e=await (0,I.fV)(n.vector)}finally{n.destroy()}a={...a,colors:e}}let l=tr();return{...await Z(t,a,{rowIndexOffset:r.rowIndexOffset,sourceBatchIndex:r.sourceBatchIndex,id:r.id,tessellated:e.tessellated,color:e.color}),polygonArrowByteLength:i,stylingArrowByteLength:s,tessellationTimeMs:tr()-l}}async function Z(t,e,r={}){let n=r.rowIndexOffset??0,o=r.sourceBatchIndex??0,a=r.id??"arrow-polygons";return await $(t,e,{id:a,tessellated:r.tessellated,color:r.color??X,rowIndexOffset:n,sourceBatchIndex:o})}function Q(t){t.destroy()}function tt(t){let{positions:e,colors:r,rowIndices:n,indices:o,sourceInfo:a}=t;return{positions:e,colors:r,rowIndices:n,indices:o,sourceInfo:a}}function te(t){return(0,W.dr)({data:t.data,selector:t.polygons})}function tr(){return"u"<typeof performance?Date.now():performance.now()}},83504(t,e,r){r.d(e,{L:()=>T});var n=r(41071),o=r(16496),a=r(77806),i=r(77231);let s="segmentStartPositions",l="segmentEndPositions",u="segmentPreviousPositions",c="segmentNextPositions",h="segmentStartColors",d="segmentEndColors",f="segmentFlags",p="rowIndices",g="expandedPathVertexData",m="pathViewOrigins",b="pathViewOriginData",w=16*Float32Array.BYTES_PER_ELEMENT+4*Uint32Array.BYTES_PER_ELEMENT,y=4*Float32Array.BYTES_PER_ELEMENT,x=8*Float32Array.BYTES_PER_ELEMENT,v=12*Float32Array.BYTES_PER_ELEMENT,C=16*Float32Array.BYTES_PER_ELEMENT,I=C+Uint32Array.BYTES_PER_ELEMENT,P=I+Uint32Array.BYTES_PER_ELEMENT,E=P+Uint32Array.BYTES_PER_ELEMENT,S=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],B={attributes:[{name:s,location:0,type:"vec4<f32>",stepMode:"instance"},{name:l,location:1,type:"vec4<f32>",stepMode:"instance"},{name:h,location:2,type:"u32",stepMode:"instance"},{name:d,location:3,type:"u32",stepMode:"instance"},{name:m,location:4,type:"vec4<f32>",stepMode:"instance"}],bindings:[]},L=`#version 300 es
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
`,A=`#version 300 es
precision highp float;

out vec4 fragColor;

void main() {
  fragColor = vec4(1.0);
}
`;class T extends n.y{static gpuInputSchema=S;segmentLayout;expandedPathVertexData;pathViewOriginData;renderBatches;pathProps;pathShaderLayout;pathTable;ownsPathTable;constructor(t,e){let r=O(e);super(t,r.modelProps),this.pathTable=e.table,this.ownsPathTable=e.ownsTable??!1,this.pathProps=e,this.pathShaderLayout=r.modelProps.shaderLayout,this.segmentLayout=r.segmentLayout,this.expandedPathVertexData=r.expandedPathVertexData,this.pathViewOriginData=r.pathViewOriginData,this.renderBatches=r.renderBatches}setProps(t){let e={...this.pathProps,...t},r=void 0!==t.pathState||void 0!==t.table||void 0!==t.ownsTable;if(this.pathProps=e,!r)return void super.setProps({});let n=O(e);this.segmentLayout=n.segmentLayout,this.expandedPathVertexData=n.expandedPathVertexData,this.pathViewOriginData=n.pathViewOriginData,this.renderBatches=n.renderBatches,this.pathShaderLayout=n.modelProps.shaderLayout;let o=this.pathTable,a=this.ownsPathTable;this.pathTable=e.table,this.ownsPathTable=e.ownsTable??!1,super.setProps({table:this.pathTable}),a&&o!==this.pathTable&&o.destroy(),this.setAttributes(_(n.modelProps.shaderLayout,n)),this.setInstanceCount(n.segmentLayout.segmentCount),this.setNeedsRedraw("Path segment state updated")}draw(t,e){return e?.parameters?this._withDrawParameters(t,e.parameters,()=>this.drawPathAttributeModelBatches(t)):this.drawPathAttributeModelBatches(t)}drawPathAttributeModelBatches(t){var e,r,n;let a=this.table?.batches||[];if(a.length>0&&a.length!==this.renderBatches.length)throw Error("PathAttributeModel draw batches must align with generated path render batches");let i=!0;try{for(let[n,s]of this.renderBatches.entries()){let l=a[n];this.setAttributes({...l?(0,o.xJ)(l.bufferLayout,l.gpuData):{},...(e=this.pathShaderLayout,r=s,_(e,r))},{byteOffsets:l?(0,o.cj)(l.bufferLayout,l.gpuData):{}}),this.setInstanceCount(s.segmentCount),i=super.draw(t)&&i}}finally{let t,e=this.table?.batches[0];this.setAttributes({...(n=this.table,(t=n?.batches[0])?(0,o.xJ)(t.bufferLayout,t.gpuData):{}),..._(this.pathShaderLayout,{expandedPathVertexData:this.expandedPathVertexData,pathViewOriginData:this.pathViewOriginData})},{byteOffsets:e?(0,o.cj)(e.bufferLayout,e.gpuData):{}}),this.setInstanceCount(this.segmentLayout.segmentCount)}return i}destroy(){super.destroy(),this.ownsPathTable&&(this.pathTable.destroy(),this.ownsPathTable=!1)}}function O(t){var e,r,n;let o,S,O;e=t,(0,i.j)("PathAttributeModel",T.gpuInputSchema,{paths:e.paths,colors:e.colors,widths:e.widths,viewOrigins:e.viewOrigins}),function(t){var e,r;let n=[["paths",(e=t).paths],["colors",e.colors],["widths",e.widths],["viewOrigins",e.viewOrigins]].filter(([,t])=>void 0!==t),[o,i]=n[0];for(let[t,e]of n.slice(1)){if(e.length!==i.length)throw Error(`PathAttributeModel ${t} rows must match ${o} rows (${e.length} !== ${i.length})`);if(e.data.length!==i.data.length)throw Error(`PathAttributeModel ${t} batch count must match ${o} batch count`);for(let r=0;r<e.data.length;r++)if(e.data[r].length!==i.data[r].length)throw Error(`PathAttributeModel ${t} batch ${r} rows must match ${o}`)}t.colors&&void 0!==(r=t.colors).format&&(0,a.Tm)(r.format)&&function(t,e){for(let r=0;r<t.data.length;r++){let n=t.data[r]?.valueOffsets,o=e.data[r]?.valueOffsets;if(!n||!o||!function(t,e){return t.length===e.length&&t.every((t,r)=>t===e[r])}(n,o))throw Error("PathAttributeModel vertex colors must align with path vertex offsets")}}(t.paths,t.colors)}(t),function(t){if(!t.pathState)throw Error("PathAttributeModel requires prepared pathState");let e=t.pathState.segmentLayout.startIndices.length-1;if(e!==t.paths.length)throw Error(`PathAttributeModel prepared path rows must match path GPU rows (${e} !== ${t.paths.length})`)}(t);let k=t.shaderLayout??B,M=t.pathState.renderBatches[0];if(!M)throw Error("PathAttributeModel requires at least one prepared path render batch");let R=function(t){let e=new Set(Object.keys(t.constantAttributes||{}));for(let r of t.bufferLayout||[])if(r.attributes)for(let t of r.attributes)e.add(t.attribute);else e.add(r.name);return e}(t);return{modelProps:{...t,vs:t.vs??L,fs:t.fs??A,shaderLayout:k,attributes:{...t.attributes||{},..._(k,M)},bufferLayout:[...t.bufferLayout||[],...(r=k,n=R,o=new Set(r.attributes.map(t=>t.name).filter(t=>!n.has(t))),S=[],o.has(s)&&S.push({attribute:s,format:"float32x4",byteOffset:0}),o.has(l)&&S.push({attribute:l,format:"float32x4",byteOffset:y}),o.has(u)&&S.push({attribute:u,format:"float32x4",byteOffset:x}),o.has(c)&&S.push({attribute:c,format:"float32x4",byteOffset:v}),o.has(f)&&S.push({attribute:f,format:"uint32",byteOffset:C}),o.has(p)&&S.push({attribute:p,format:"uint32",byteOffset:I}),o.has(h)&&S.push({attribute:h,format:"uint32",byteOffset:P}),o.has(d)&&S.push({attribute:d,format:"uint32",byteOffset:E}),O=[{name:g,byteStride:w,stepMode:"instance",attributes:S}],o.has(m)&&O.push({name:b,byteStride:4*Float32Array.BYTES_PER_ELEMENT,stepMode:"instance",attributes:[{attribute:m,format:"float32x4",byteOffset:0}]}),O)],topology:t.topology??"line-list",vertexCount:t.vertexCount??2,instanceCount:t.pathState.segmentLayout.segmentCount,table:t.table,tableCount:"none"},segmentLayout:t.pathState.segmentLayout,expandedPathVertexData:M.expandedPathVertexData,pathViewOriginData:M.pathViewOriginData,renderBatches:t.pathState.renderBatches}}function _(t,e){let r=new Set(t.attributes.map(t=>t.name));return{[g]:e.expandedPathVertexData,...r.has(m)?{[b]:e.pathViewOriginData}:{}}}},22499(t,e,r){r.d(e,{ye:()=>F});var n=r(55590),o=r(50784),a=r(5247),i=r(6116),s=r(49144),l=r(15650);let u=`
@group(0) @binding(0) var<storage, read> pathValues : array<f32>;
@group(0) @binding(1) var<storage, read> pathRanges : array<vec4<u32>>;
@group(0) @binding(2) var<storage, read> pathExpansionConfig : array<u32>;
@group(0) @binding(3) var<storage, read_write> generatedPathVertices : array<u32>;

const PATH_SEGMENT_FIRST : u32 = 1u;
const PATH_SEGMENT_LAST : u32 = 2u;
const PATH_SEGMENT_CLOSED : u32 = 4u;
const COMPACT_PATH_RECORD_WORD_COUNT : u32 = 3u;

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
`,c={bindings:[{name:"pathValues",type:"read-only-storage",group:0,location:0},{name:"pathRanges",type:"read-only-storage",group:0,location:1},{name:"pathExpansionConfig",type:"read-only-storage",group:0,location:2},{name:"generatedPathVertices",type:"storage",group:0,location:3}],attributes:[]};var h=r(77806),d=r(77231);function f(t,e){var r,n;r=t,n=e,(0,d.j)("PathStorageModel",n,{paths:r.paths,colors:r.colors,widths:r.widths,timestamps:r.timestamps,viewOrigins:r.viewOrigins}),function(t){var e;let r=[["paths",t.paths],["colors",t.colors],["widths",t.widths],["timestamps",t.timestamps],["viewOrigins",t.viewOrigins]].filter(([,t])=>void 0!==t),[n,o]=r[0];for(let[t,e]of r.slice(1)){if(e.length!==o.length)throw Error(`PathStorageModel ${t} rows must match ${n} rows (${e.length} !== ${o.length})`);if(e.data.length!==o.data.length)throw Error(`PathStorageModel ${t} batch count must match ${n} batch count`);for(let r=0;r<e.data.length;r++)if(e.data[r].length!==o.data[r].length)throw Error(`PathStorageModel ${t} batch ${r} rows must match ${n}`)}t.timestamps&&function(t,e){for(let r=0;r<t.data.length;r++){let n=g(t.data[r]),o=e.data[r].valueOffsets;if(!o)throw Error("PathStorageModel timestamps require copied variable-length offsets");if(!p(n,o))throw Error("PathStorageModel timestamps must align with path vertex offsets")}}(t.paths,t.timestamps),t.colors&&void 0!==(e=t.colors).format&&(0,h.Tm)(e.format)&&function(t,e){for(let r=0;r<t.data.length;r++){let n=g(t.data[r]),o=e.data[r].valueOffsets;if(!o)throw Error("PathStorageModel vertex colors require copied variable-length offsets");if(!p(n,o))throw Error("PathStorageModel vertex colors must align with path vertex offsets")}}(t.paths,t.colors)}(t);let o=[],a=function(t){let e=t.format;if(!e)throw Error("PathStorageModel paths require GPUVector.format");return(0,h.Ft)(e).components}(t.paths),i=t.rowIndexBase??0;for(let e=0;e<t.paths.data.length;e++){let r=t.paths.data[e],n=g(r),s=function(t,e){let r=[0];for(let n=0;n<e;n++){let e=t[n]??0,o=Math.max(0,(t[n+1]??e)-e-1);r.push((r[r.length-1]??0)+o)}return r}(n,r.length),l=s[s.length-1]??0,u=t.colors?.data[e],c=t.widths?.data[e],h=t.timestamps?.data[e],d=t.viewOrigins?.data[e];o.push({batchRowIndexBase:i,rowCount:r.length,componentCount:a,valueOffsets:n,recordOffsets:s,segmentCount:l,pathValuesBinding:m(r,b(r,t.paths.byteStride)),viewOriginsBinding:d?m(d,d.length*t.viewOrigins.byteStride):void 0,colorsBinding:u?m(u,b(u,t.colors.byteStride)):void 0,widthsBinding:c?m(c,c.length*t.widths.byteStride):void 0,timestampsBinding:h?m(h,b(h,t.timestamps.byteStride)):void 0}),i+=r.length}return{batches:o}}function p(t,e){return t.length===e.length&&t.every((t,r)=>t===e[r])}function g(t){if(!t.valueOffsets)throw Error("PathStorageModel paths require copied variable-length offset metadata");return t.valueOffsets}function m(t,e){var r;return{buffer:(r=t).buffer instanceof o.kL?r.buffer.buffer:r.buffer,offset:t.byteOffset,...e&&e>0?{size:e}:{}}}function b(t,e){return t.valueByteLength??t.valueLength*e}let w="segmentStartPointIndices",y="segmentEndPointIndices",x="segmentPreviousPointIndices",v="segmentNextPointIndices",C="segmentFlags",I="rowIndices",P="compactPathVertexData",E=3*Uint32Array.BYTES_PER_ELEMENT,S=6*Uint32Array.BYTES_PER_ELEMENT,B=Uint32Array.BYTES_PER_ELEMENT,L=2*Uint32Array.BYTES_PER_ELEMENT,A=3*Uint32Array.BYTES_PER_ELEMENT,T=4*Uint32Array.BYTES_PER_ELEMENT,O=5*Uint32Array.BYTES_PER_ELEMENT,_=Uint32Array.BYTES_PER_ELEMENT,k=2*Uint32Array.BYTES_PER_ELEMENT,M=[255,255,255,255],R=[{columnName:"paths",kind:"positions",required:!0,formats:["vertex-list<float32x2>","vertex-list<float32x3>","vertex-list<float32x4>"]},{columnName:"colors",kind:"colors",required:!1,formats:["unorm8x4","vertex-list<unorm8x4>"]},{columnName:"widths",kind:"scalars",required:!1,formats:["float32"]},{columnName:"timestamps",kind:"time",required:!1,formats:["vertex-list<float32>"]},{columnName:"viewOrigins",kind:"positions",required:!1,formats:["float32x4"],internal:!0}],D={attributes:[{name:w,location:0,type:"u32",stepMode:"instance"},{name:C,location:1,type:"u32",stepMode:"instance"},{name:I,location:2,type:"u32",stepMode:"instance"}],bindings:[]},V=`
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
`;class F extends a.K{static gpuInputSchema=R;segmentCount;pathRangeBuildTimeMs;pathRangeByteLength;pathRecordByteStride;compactPathVertexByteLength;generatedRenderBufferByteLength;rowStorageByteLength;transientComputeInputByteLength;batches;renderBatches;rowColorsBinding;vertexColorsBinding;rowWidthsBinding;styleConfigBuffer;compactPathVertexData;storageState;pathProps;ownsStorageState;constructor(t,e){var r,n;let o,a,i;if("webgpu"!==t.type)throw Error("PathStorageModel is WebGPU-only");let s=!J(e),l=s?N(t,e):e.storageState;super(t,(r=e,n=l,o=r.shaderLayout??D,a=H(n),i=K(n),{...r,source:r.source??V,shaderLayout:o,bindings:$(r,a),attributes:{...r.attributes||{},[P]:i.compactPathVertexData},bufferLayout:[...r.bufferLayout||[],function(t,e){let r=new Set(t.attributes.map(t=>t.name)),n=e===S,o=[];if(r.has(w)&&o.push({attribute:w,format:"uint32",byteOffset:0}),!n&&U(r))throw Error("PathStorageModel storageState uses compact path records, but the shader layout requests legacy segment neighbor attributes");return n&&r.has(y)&&o.push({attribute:y,format:"uint32",byteOffset:B}),n&&r.has(x)&&o.push({attribute:x,format:"uint32",byteOffset:L}),n&&r.has(v)&&o.push({attribute:v,format:"uint32",byteOffset:A}),r.has(C)&&o.push({attribute:C,format:"uint32",byteOffset:n?T:_}),r.has(I)&&o.push({attribute:I,format:"uint32",byteOffset:n?O:k}),{name:P,stepMode:"instance",byteStride:e,attributes:o}}(o,n.pathRecordByteStride)],topology:r.topology??"line-list",vertexCount:r.vertexCount??2,instanceCount:i.segmentCount})),this.pathProps=e,this.storageState=l,this.ownsStorageState=s,this.applyStorageState(l)}setProps(t){let e={...this.pathProps,...t},r=J(e),n="storageState"in t&&void 0!==t.storageState||void 0!==t.paths||void 0!==t.shaderLayout||void 0!==t.rowIndexBase,o=!r&&(void 0!==t.colors||void 0!==t.widths||void 0!==t.timestamps||void 0!==t.viewOrigins||void 0!==t.color||void 0!==t.width);if(this.pathProps=e,!n){if(o){(function(t,e,r){let n,o,a=f(e,F.gpuInputSchema);var i,s,l,u=r,c=a.batches;if(c.length!==u.batches.length)throw Error("PathStorageModel row-binding updates must preserve path batch count");for(let[t,e]of c.entries()){let r=u.batches[t];if(!r||r.batchRowIndexBase!==e.batchRowIndexBase||r.rowCount!==e.rowCount||r.segmentCount!==e.segmentCount)throw Error("PathStorageModel row-binding updates must preserve path batch rows")}let h=[],d=G(t,e);h.push(...d.ownedResources);let p=d.byteLength,g=a.batches.map((n,o)=>{let a=r.batches[o],i=j(t,e,n,d);return h.push(...i.ownedResources),p+=i.ownedByteLength,{...i,batchRowIndexBase:a.batchRowIndexBase,rowCount:a.rowCount,segmentCount:a.segmentCount,pathValuesBinding:a.pathValuesBinding,pathRangesBinding:a.pathRangesBinding,...n.timestampsBinding?{pathTimestampsBinding:n.timestampsBinding}:{},pathViewOriginsBinding:i.pathViewOriginsBinding}});i=r.ownedRowBindingResources,s=h,X(i),i.splice(0,i.length,...s),r.batches=g,r.rowStorageByteLength=p,n=H(l=r),o=K(l),l.rowColorsBinding=n.rowColorsBinding,l.vertexColorsBinding=n.vertexColorsBinding,l.rowWidthsBinding=n.rowWidthsBinding,l.styleConfigBuffer=n.styleConfigBuffer,l.compactPathVertexData=o.compactPathVertexData})(this.device,e,this.storageState),this.applyStorageState(this.storageState);let t=H(this.storageState);this.setBindings($(e,t)),this.setNeedsRedraw("Storage path row bindings updated")}return}let a=r?e.storageState:N(this.device,e);this.ownsStorageState&&this.storageState.destroy(),this.storageState=a,this.ownsStorageState=!r,this.applyStorageState(a);let i=H(a),s=K(a);this.setAttributes({[P]:s.compactPathVertexData}),this.setBindings($(e,i)),this.setInstanceCount(s.segmentCount),this.setNeedsRedraw("Storage path state updated")}draw(t,e){return e?.parameters?this._withDrawParameters(t,e.parameters,()=>this.drawPathStorageModelBatches(t)):this.drawPathStorageModelBatches(t)}drawPathStorageModelBatches(t){let e=!0;for(let r of this.storageState.renderBatches){if(0===r.segmentCount)continue;let n=this.storageState.batches[r.rowBindingBatchIndex];if(!n)throw Error("PathStorageModel render batch is missing its row-binding batch");this.setAttributes({[P]:r.compactPathVertexData}),this.setBindings($(this.pathProps,n)),this.setInstanceCount(r.segmentCount),e=super.draw(t)&&e}let r=H(this.storageState),n=K(this.storageState);return this.setAttributes({[P]:n.compactPathVertexData}),this.setBindings($(this.pathProps,r)),this.setInstanceCount(this.storageState.segmentCount),e}destroy(){this.ownsStorageState&&this.storageState.destroy(),super.destroy()}applyStorageState(t){this.segmentCount=t.segmentCount,this.pathRangeBuildTimeMs=t.pathRangeBuildTimeMs,this.pathRangeByteLength=t.pathRangeByteLength,this.pathRecordByteStride=t.pathRecordByteStride,this.compactPathVertexByteLength=t.compactPathVertexByteLength,this.generatedRenderBufferByteLength=t.generatedRenderBufferByteLength,this.rowStorageByteLength=t.rowStorageByteLength,this.transientComputeInputByteLength=t.transientComputeInputByteLength,this.batches=t.batches,this.renderBatches=t.renderBatches,this.rowColorsBinding=t.rowColorsBinding,this.vertexColorsBinding=t.vertexColorsBinding,this.rowWidthsBinding=t.rowWidthsBinding,this.styleConfigBuffer=t.styleConfigBuffer,this.compactPathVertexData=t.compactPathVertexData}}function U(t){return t.has(y)||t.has(x)||t.has(v)}function N(t,e){if("webgpu"!==t.type)throw Error("createPathStorageState requires a WebGPU device");let r=Z(),o="legacy"==(U(new Set((e.shaderLayout??D).attributes.map(t=>t.name)))?"legacy":"compact")?S:E,a=o/Uint32Array.BYTES_PER_ELEMENT,i=f(e,F.gpuInputSchema),h=G(t,e),d=[...h.ownedResources],p=[],g=[],m=[],b=0,w=0,y=0,x=h.byteLength,v=0;for(let[r,f]of i.batches.entries()){let i=function(t,e,r){let{valueOffsets:o,recordOffsets:a,batchRowIndexBase:i,rowCount:s}=r,l=new Uint32Array(4*Math.max(s,1));for(let t=0;t<s;t++){let e=4*t;l[e]=Math.max(0,o[t]??0),l[e+1]=Math.max(l[e],o[t+1]??l[e]),l[e+2]=Math.max(0,a[t]??0),l[e+3]=i+t}let u=t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-path-ranges`,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:l});return{pathRangesBuffer:u,byteLength:l.byteLength,destroy:()=>u.destroy()}}(t,{id:e.id},{valueOffsets:f.valueOffsets,recordOffsets:f.recordOffsets,batchRowIndexBase:f.batchRowIndexBase,rowCount:f.rowCount});p.push(i),w+=i.byteLength;let C=j(t,e,f,h);for(let h of(0,s.J)({device:t,recordOffsets:f.recordOffsets,recordByteStride:o,maxBatchByteLength:t.limits.maxStorageBufferBindingSize,resourceLabel:"PathStorageModel indexed generated path vertex data"})){let o=function(t,e,r){let{generatedBufferBatch:o,componentCount:a,recordWordCount:i}=r,s=o.rowEnd-o.rowStart;if(3!==i&&6!==i)throw Error(`Unsupported GPU path record word count ${i}; expected 3 or 6`);let l=new Uint32Array([s,a,o.rowStart,o.recordStart,i]);return{expansionConfigBuffer:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-expansion-config`,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:l}),byteLength:l.byteLength}}(t,{id:e.id},{generatedBufferBatch:h,componentCount:f.componentCount,recordWordCount:a}),s=function(t,e,r,o){if(3!==o&&6!==o)throw Error(`Unsupported GPU path record word count ${o}; expected 3 or 6`);let a=Math.max(r,1),i=r*Uint32Array.BYTES_PER_ELEMENT*o;return{compactPathVertexData:t.createBuffer({id:`${e.id||"gpu-expanded-path-model"}-generated-path-vertices`,usage:n.h.VERTEX|n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:new Uint32Array(a*o)}),byteLength:i}}(t,{id:e.id},h.recordCount,a);!function(t,e,r){let n=function(t,e){let{bindings:r={},...n}=e;return{kernel:new l.M(t,n),bindings:{...r}}}(t,{id:`${e.id||"gpu-expanded-path-model"}-compute`,source:u,shaderLayout:c,bindings:{pathValues:r.pathValues,pathRanges:r.pathRanges,pathExpansionConfig:r.expansionInput.expansionConfigBuffer,generatedPathVertices:r.generated.compactPathVertexData}});if(r.rowCount>0&&r.segmentCount>0){let e=t.beginComputePass({});n.kernel.dispatch(e,{bindings:n.bindings,x:Math.ceil(r.rowCount/64)}),e.end(),t.submit()}n.kernel.destroy()}(t,{id:e.id},{pathValues:f.pathValuesBinding,pathRanges:i.pathRangesBuffer,expansionInput:o,generated:s,rowCount:h.rowEnd-h.rowStart,segmentCount:h.recordCount}),m.push({rowBindingBatchIndex:r,rowStart:h.rowStart,rowEnd:h.rowEnd,segmentCount:h.recordCount,compactPathVertexData:s.compactPathVertexData}),y+=s.byteLength,v+=o.byteLength,o.expansionConfigBuffer.destroy()}g.push({...C,batchRowIndexBase:f.batchRowIndexBase,rowCount:f.rowCount,segmentCount:f.segmentCount,pathValuesBinding:f.pathValuesBinding,pathRangesBinding:i.pathRangesBuffer,...f.timestampsBinding?{pathTimestampsBinding:f.timestampsBinding}:{},pathViewOriginsBinding:C.pathViewOriginsBinding}),d.push(...C.ownedResources),x+=C.ownedByteLength,b+=f.segmentCount}let C=H({batches:g}),I=K({renderBatches:m}),P=!1;return{segmentCount:b,pathRangeBuildTimeMs:Z()-r,pathRangeByteLength:w,pathRecordByteStride:o,compactPathVertexByteLength:y,generatedRenderBufferByteLength:y,rowStorageByteLength:x,transientComputeInputByteLength:v,batches:g,renderBatches:m,ownedRowBindingResources:d,rowColorsBinding:C.rowColorsBinding,vertexColorsBinding:C.vertexColorsBinding,rowWidthsBinding:C.rowWidthsBinding,styleConfigBuffer:C.styleConfigBuffer,compactPathVertexData:I.compactPathVertexData,destroy:()=>{if(!P)for(let t of(P=!0,X(d),X(p),m))t.compactPathVertexData.destroy()}}}function $(t,e){return{...t.bindings||{},pathValues:e.pathValuesBinding,pathRanges:e.pathRangesBinding,pathViewOrigins:e.pathViewOriginsBinding,pathRowColors:e.rowColorsBinding,pathVertexColors:e.vertexColorsBinding,pathRowWidths:e.rowWidthsBinding,...e.pathTimestampsBinding?{pathTimestamps:e.pathTimestampsBinding}:{},pathStorageStyleConfig:e.styleConfigBuffer}}function G(t,e){let r=e.id||"path-storage-model",n=z(t,`${r}-default-row-colors`,"unorm8x4",new Uint8Array(e.color??M)),o=z(t,`${r}-default-row-widths`,"float32",new Float32Array([e.width??1])),a=z(t,`${r}-default-view-origins`,"float32x4",new Float32Array(4));return{colorsBinding:Y(n),vertexColorsBinding:Y(n),widthsBinding:Y(o),viewOriginsBinding:Y(a),byteLength:4*Uint8Array.BYTES_PER_ELEMENT+Float32Array.BYTES_PER_ELEMENT+4*Float32Array.BYTES_PER_ELEMENT,ownedResources:[n,o,a]}}function j(t,e,r,a){var i,s,l;let u,c,h,d,f=(i=e,s=r.batchRowIndexBase,l=r.componentCount,c=new Float32Array(u=new ArrayBuffer(48)),h=new Uint32Array(u),d=i.color??M,c[0]=d[0]/255,c[1]=d[1]/255,c[2]=d[2]/255,c[3]=d[3]/255,c[4]=i.width??1,h[5]=i.colors&&q(i.colors)?1:0,h[6]=+!!i.widths,h[7]=s,h[8]=l,h[9]=+!!i.viewOrigins,h[10]=i.colors&&W(i.colors)?1:0,h),p=new o.kL(t,{id:`${e.id||"path-storage-model"}-style-config-${r.batchRowIndexBase}`,usage:n.h.UNIFORM|n.h.COPY_DST|n.h.COPY_SRC,data:f});return{pathViewOriginsBinding:r.viewOriginsBinding??a.viewOriginsBinding,rowColorsBinding:e.colors&&q(e.colors)&&r.colorsBinding?r.colorsBinding:a.colorsBinding,vertexColorsBinding:e.colors&&W(e.colors)&&r.colorsBinding?r.colorsBinding:a.vertexColorsBinding,rowWidthsBinding:r.widthsBinding??a.widthsBinding,styleConfigBuffer:p,ownedResources:[p],ownedByteLength:f.byteLength}}function z(t,e,r,o){return new i.M({type:"buffer",name:e,buffer:t.createBuffer({id:e,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:o}),format:r,length:1,ownsBuffer:!0})}function Y(t){let[e,...r]=t.data;if(!e||r.length>0)throw Error(`Storage path vector "${t.name}" requires exactly one GPUData chunk`);let n=e.buffer;return n instanceof o.kL?n.buffer:n}function q(t){return"unorm8x4"===t.format}function W(t){return"vertex-list<unorm8x4>"===t.format}function X(t){for(let e of t)e.destroy()}function H(t){let e=t.batches[0];if(!e)throw Error("PathStorageState requires at least one row-binding batch");return e}function K(t){let e=t.renderBatches[0];if(!e)throw Error("PathStorageState requires at least one render batch");return e}function J(t){return"storageState"in t&&void 0!==t.storageState}function Z(){return"u"<typeof performance?Date.now():performance.now()}},18538(t,e,r){r.d(e,{BG:()=>s,Cr:()=>b,F:()=>h,KH:()=>f,SN:()=>d,VF:()=>c,b2:()=>i,sm:()=>u,uW:()=>l,vT:()=>p});var n=r(93705),o=r(5238);let a={name:"polygonViewport",uniformTypes:{center:"vec2<f32>",scale:"f32",aspect:"f32"}};function i(t,e){let r=new Set(e.map(t=>t.name));return[...t.filter(t=>{let e=t.name;return!e||!r.has(e)}),...e]}let s={attributes:[{name:"positions",location:0,type:"vec4<f32>"},{name:"colors",location:1,type:"vec4<f32>"},{name:"rowIndices",location:2,type:"u32"}],bindings:[]},l={attributes:[],bindings:[{name:"polygonPositions",type:"read-only-storage",group:0,location:0},{name:"polygonColors",type:"read-only-storage",group:0,location:1},{name:"polygonRowIndices",type:"read-only-storage",group:0,location:2}]},u=`\
struct PolygonViewportUniforms {
  center : vec2<f32>,
  scale : f32,
  aspect : f32,
};

@group(0) @binding(auto) var<uniform> polygonViewport : PolygonViewportUniforms;

struct VertexInputs {
  @location(0) positions : vec4<f32>,
  @location(1) colors : vec4<f32>,
  @location(2) rowIndices : u32,
};

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @interpolate(flat, either)
  @location(1) objectIndex : i32,
};

struct PickingFragmentOutputs {
  @location(0) fragColor : vec4<f32>,
  @location(1) pickingColor : vec2<i32>,
};

fn projectPolygonPosition(position : vec4<f32>) -> vec4<f32> {
  let centered = (position.xy - polygonViewport.center) * polygonViewport.scale;
  return vec4<f32>(centered.x / max(polygonViewport.aspect, 0.2), centered.y, 0.0, 1.0);
}

@vertex
fn vertexMain(inputs : VertexInputs) -> FragmentInputs {
  var outputs : FragmentInputs;
  outputs.Position = projectPolygonPosition(inputs.positions);
  outputs.color = inputs.colors;
  outputs.objectIndex = i32(inputs.rowIndices);
  return outputs;
}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
  return picking_filterHighlightColor(inputs.color, inputs.objectIndex);
}

@fragment
fn fragmentPicking(inputs : FragmentInputs) -> PickingFragmentOutputs {
  var outputs : PickingFragmentOutputs;
  outputs.fragColor = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  outputs.pickingColor = picking_getPickingColor(inputs.objectIndex);
  return outputs;
}
`,c=`\
@group(0) @binding(auto) var<storage, read> polygonPositions : array<vec4<f32>>;
@group(0) @binding(auto) var<storage, read> polygonColors : array<u32>;
@group(0) @binding(auto) var<storage, read> polygonRowIndices : array<u32>;

struct PolygonViewportUniforms {
  center : vec2<f32>,
  scale : f32,
  aspect : f32,
};

@group(0) @binding(auto) var<uniform> polygonViewport : PolygonViewportUniforms;

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) color : vec4<f32>,
  @interpolate(flat, either)
  @location(1) objectIndex : i32,
};

struct PickingFragmentOutputs {
  @location(0) fragColor : vec4<f32>,
  @location(1) pickingColor : vec2<i32>,
};

fn unpackPolygonColor(colorWord : u32) -> vec4<f32> {
  return vec4<f32>(
    f32(colorWord & 0xffu),
    f32((colorWord >> 8u) & 0xffu),
    f32((colorWord >> 16u) & 0xffu),
    f32((colorWord >> 24u) & 0xffu)
  ) / 255.0;
}

fn projectPolygonPosition(position : vec4<f32>) -> vec4<f32> {
  let centered = (position.xy - polygonViewport.center) * polygonViewport.scale;
  return vec4<f32>(centered.x / max(polygonViewport.aspect, 0.2), centered.y, 0.0, 1.0);
}

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex : u32) -> FragmentInputs {
  var outputs : FragmentInputs;
  outputs.Position = projectPolygonPosition(polygonPositions[vertexIndex]);
  outputs.color = unpackPolygonColor(polygonColors[gpuTable_getRowIndex(
    vertexIndex,
    gpuTableColumns.polygonColorsRowMultiplier
  )]);
  outputs.objectIndex = i32(polygonRowIndices[vertexIndex]);
  return outputs;
}

@fragment
fn fragmentMain(inputs : FragmentInputs) -> @location(0) vec4<f32> {
  return picking_filterHighlightColor(inputs.color, inputs.objectIndex);
}

@fragment
fn fragmentPicking(inputs : FragmentInputs) -> PickingFragmentOutputs {
  var outputs : PickingFragmentOutputs;
  outputs.fragColor = vec4<f32>(0.0, 0.0, 0.0, 0.0);
  outputs.pickingColor = picking_getPickingColor(inputs.objectIndex);
  return outputs;
}
`,h=`\
#version 300 es
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

void main(void) {
  vec2 centered = (positions.xy - polygonViewport.center) * polygonViewport.scale;
  gl_Position = vec4(centered.x / max(polygonViewport.aspect, 0.2), centered.y, 0.0, 1.0);
  vColor = colors;
  picking_setObjectIndex(int(rowIndices));
}
`,d=`\
#version 300 es
precision highp float;

in vec4 vColor;
out vec4 fragColor;

void main(void) {
  fragColor = picking_filterColor(vColor);
}
`,f=`\
#version 300 es
precision highp float;
precision highp int;

layout(location = 0) out vec4 fragColor;
layout(location = 1) out ivec4 pickingColor;

void main(void) {
  fragColor = vec4(0.0);
  pickingColor = picking_getPickingColor();
}
`;function p(t,e=(0,o.Q)(t)){let r=new n.l({polygonViewport:a,picking:e});return r.setProps({picking:{indexMode:"attribute",batchIndex:0}}),r}let g={depthWriteEnabled:!1,blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},m={depthWriteEnabled:!1,blend:!1};function b(t){return t?m:g}},41071(t,e,r){r.d(e,{y:()=>b});var n=r(55590),o=r(50784),a=r(5247),i=r(3842),s=r(12793),l=r(77231),u=r(77806);class c{device;gpuInputSchema;shaderLayout;shaderModule;table;bufferLayout=[];batches=[];constantAttributes={};ownedByteLength=0;ownedBuffers=new Map;destroyed=!1;constructor(t,{table:e,gpuInputSchema:r,shaderLayout:n}){this.device=t,this.table=e,this.gpuInputSchema=r,this.shaderLayout=n,this.shaderModule=function(t,e){let r=new Set(e.bindings.filter(t=>"storage"===t.type||"read-only-storage"===t.type).map(t=>t.name)),n=t.filter(t=>t.storageBindingName&&r.has(t.storageBindingName));if(0===n.length)return;let o=n.map(t=>{var e;return`  ${e=t.storageBindingName,`${e}RowMultiplier`} : u32,`}).join("\n");return{name:"gpuTableColumns",source:`
struct GPUTableColumnUniforms {
${o}
};

@group(0) @binding(auto) var<uniform> gpuTableColumns : GPUTableColumnUniforms;

fn gpuTable_getRowIndex(rowIndex : u32, rowMultiplier : u32) -> u32 {
  return rowIndex * rowMultiplier;
}
`,bindingLayout:[{name:"gpuTableColumns",group:0}]}}(r,n),this.updateBindings(e)}updateBindings(t){if(this.destroyed)throw Error("GPUTableShaderBindings has been destroyed");(0,l.j)("GPUTableShaderBindings",this.gpuInputSchema,t.gpuColumns);let e=function(t,e,r,a,c){var f;let p,g,m=new Set(a.attributes.map(t=>t.name)),b=new Set(a.bindings.filter(t=>"storage"===t.type||"read-only-storage"===t.type).map(t=>t.name)),w=r.flatMap(t=>(0,l.d)(t).filter(t=>m.has(t)).map(e=>({input:t,attributeName:e}))),y=r.filter(t=>t.storageBindingName&&b.has(t.storageBindingName)),x=new Map,v=function(t,e){let r=new Map;for(let{input:n,attributeName:o}of e){if(t.gpuConstants[n.columnName])continue;let e=t.bufferLayout.find(t=>t.name===n.columnName);if((0,i.v)(e),!e.attributes){(0,i.v)(1===(0,l.d)(n).length),r.set(e.name,function(t,e){if(t.name===e)return t;if(!t.format)throw Error(`GPUTableShaderBindings buffer layout "${t.name}" cannot map shader attribute "${e}" without a format`);return{name:t.name,stepMode:t.stepMode,byteStride:t.byteStride,attributes:[{attribute:e,format:t.format,byteOffset:0}]}}(e,o));continue}let a=e.attributes.find(t=>t.attribute===o);(0,i.v)(a);let s=r.get(e.name);s?.attributes?s.attributes.push(a):r.set(e.name,{...e,attributes:[a]})}return Array.from(r.values())}(e,w),C={},I=[],P={};if(function(t,e){for(let r of e)(0,i.v)(!((0,l.d)(r).length>1&&t.gpuConstants[r.columnName]))}(e,r),"webgl"===t.type)for(let{input:t,attributeName:r}of w){let n=e.gpuConstants[t.columnName];n&&(C[r]=function(t){let e=(0,u.Ft)(t.format);if("unorm10-10-10-2"===t.format){let e=t.value[0];return new Float32Array([(1023&e)/1023,(e>>>10&1023)/1023,(e>>>20&1023)/1023,(e>>>30&3)/3])}let r=Array.from(t.value);if("unorm8x4-bgra"===t.format&&([r[0],r[2]]=[r[2],r[0]]),e.normalized){let n=8*t.value.BYTES_PER_ELEMENT,o=e.signed?2**(n-1)-1:2**n-1;return new Float32Array(r.map(t=>Math.max(-1,t/o)))}if("f16"===e.primitiveType)return new Float32Array(t.value.constructor===s.C_?r:r.map(t=>(function(t){let e=32768&t?-1:1,r=t>>>10&31,n=1023&t;return 0===r?6103515625e-14*e*(n/1024):31===r?n?NaN:1/0*e:e*2**(r-15)*(1+n/1024)})(t)));if("f32"===e.primitiveType)return new Float32Array(r);let n=[...r,0,0,1].slice(0,4);return e.signed?new Int32Array(n):new Uint32Array(n)}(n))}else for(let r of["vertex","instance"]){let o=w.filter(({input:t,attributeName:n})=>{let o=a.attributes.find(t=>t.name===n);return e.gpuConstants[t.columnName]&&(o?.stepMode??"vertex")===r});if(0===o.length)continue;let i=function(t,e){let r=[],n=0;for(let{input:o}of t){let t=e[o.columnName],a=Math.min(4,t.byteLength);n=Math.ceil(n/a)*a,r.push(n),n+=t.byteLength}let o=new Uint8Array(Math.max(4,4*Math.ceil(n/4))),a=t.map(({input:t,attributeName:n},a)=>{let i=e[t.columnName];return o.set(new Uint8Array(i.value.buffer,i.value.byteOffset,i.value.byteLength),r[a]),{attribute:n,format:i.format,byteOffset:r[a]}});return{data:o,attributes:a}}(o,e.gpuConstants),s=h(t,c,x,`attribute:${r}`,n.h.VERTEX|n.h.COPY_DST,i.data),l=`gpu-table-constant-${r}`;I.push({name:l,stepMode:r,byteStride:0,attributes:i.attributes}),P[l]=s}let E={};for(let r of y){let o=e.gpuConstants[r.columnName];if(!o||!r.storageBindingName)continue;let a=`storage:${r.storageBindingName}`,i=d(o.value,16),s=h(t,c,x,a,n.h.STORAGE|n.h.COPY_DST,i);E[r.storageBindingName]={buffer:s,offset:0,size:s.byteLength}}if(y.length>0){let r=new Uint32Array(y.map(t=>+!e.gpuConstants[t.columnName]));g=h(t,c,x,"uniform:gpuTableColumns",n.h.UNIFORM|n.h.COPY_DST,d(r,16))}let S=(f=[...v,...I],p=new Map(a.attributes.map(t=>[t.name,t.location])),f.map(t=>({...t,...t.attributes?{attributes:[...t.attributes].sort((t,e)=>(p.get(t.attribute)??1/0)-(p.get(e.attribute)??1/0))}:{}})).sort((t,e)=>{let r=t=>Math.min(...(t.attributes??[{attribute:t.name}]).map(t=>p.get(t.attribute)??1/0));return r(t)-r(e)})),B=e.batches.map(t=>{let e={},r={};for(let n of v){let o=t.gpuData[n.name];if(!o)throw Error(`GPUTableShaderBindings batch is missing GPUData "${n.name}"`);e[n.name]=o.buffer,r[n.name]=o.byteOffset}for(let t of I){let n=P[t.name];e[t.name]=n,r[t.name]=0}let n=S.map(t=>e[t.name]),a={};for(let e of y){let r=e.storageBindingName;if(!r)continue;let n=E[r];if(n){a[r]=n;continue}let i=t.gpuData[e.columnName];i&&(a[r]=function(t){let e=t.format&&(0,u.w4)(t.format)?0===t.length?0:(t.length-1)*t.byteStride+t.rowByteLength:void 0;return{buffer:t.buffer instanceof o.kL?t.buffer.buffer:t.buffer,offset:t.byteOffset,size:void 0===e?t.valueByteLength??t.valueLength*t.byteStride:Math.max(t.valueByteLength??0,e)}}(i))}return g&&(a.gpuTableColumns=g),{numRows:t.numRows,attributes:e,attributeBuffers:n,attributeByteOffsets:r,bindings:a}});return{table:e,bufferLayout:S,batches:B,constantAttributes:C,ownedBuffers:x,ownedByteLength:Array.from(x.values()).reduce((t,e)=>t+e.buffer.byteLength,0)}}(this.device,t,this.gpuInputSchema,this.shaderLayout,this.ownedBuffers);for(let[t,r]of this.ownedBuffers)e.ownedBuffers.get(t)?.buffer!==r.buffer&&r.buffer.destroy();this.table=t,this.bufferLayout.splice(0,this.bufferLayout.length,...e.bufferLayout),this.batches.splice(0,this.batches.length,...e.batches),f(this.constantAttributes,e.constantAttributes),this.ownedBuffers=e.ownedBuffers,this.ownedByteLength=e.ownedByteLength}destroy(){if(!this.destroyed){for(let t of this.ownedBuffers.values())t.buffer.destroy();this.ownedBuffers.clear(),this.bufferLayout.length=0,this.batches.length=0,f(this.constantAttributes,{}),this.ownedByteLength=0,this.destroyed=!0}}}function h(t,e,r,n,o,a){let i,s=e.get(n);return s&&s.usage===o&&s.buffer.byteLength===a.byteLength?(i=s.buffer).write(a):i=t.createBuffer({id:`gpu-table-${n}`,usage:o,data:a}),r.set(n,{key:n,usage:o,buffer:i}),i}function d(t,e=4){let r=new Uint8Array(Math.max(e,Math.ceil(t.byteLength/e)*e));return r.set(new Uint8Array(t.buffer,t.byteOffset,t.byteLength)),r}function f(t,e){for(let e of Object.keys(t))delete t[e];Object.assign(t,e)}var p=r(1170),g=r(29797),m=r(16496);class b extends a.K{table;tableState;tableShaderBindings;drawingTableBatches=!1;get tableBindingByteLength(){return this.tableShaderBindings?.ownedByteLength??0}constructor(t,e){let{table:r,modelProps:n,state:o,shaderBindings:a,tableAttributeByteOffsets:i}=function(t,e){let r,{table:n,tableCount:o="instance",gpuInputSchema:a,...i}=e,s=i.attributes||{},l=i.bindings||{},u=(i.shaderLayout?.bindings||[]).filter(t=>"storage"===t.type||"read-only-storage"===t.type).map(t=>t.name),h=i.bufferLayout||[],d=i.indexBuffer??null,f=i.indexCount,p=i.firstVertex??0,g=i.firstIndex??0,m=i.vertexCount??0,b=!!n&&"instance"===o&&void 0===i.instanceCount,E=!!n&&"vertex"===o&&void 0===i.vertexCount;if(!n)return{table:n,modelProps:i,state:{explicitAttributes:s,explicitBindings:l,tableBindingNames:u,explicitBufferLayout:h,explicitIndexBuffer:d,explicitIndexCount:f,explicitFirstVertex:p,explicitFirstIndex:g,explicitVertexCount:m,inferInstanceCount:b,inferVertexCount:E,gpuInputSchema:a,shaderLayout:i.shaderLayout}};if(I(n,d),P(n),a){if(!i.shaderLayout)throw Error("GPUTableModel gpuInputSchema requires shaderLayout");r=new c(t,{table:n,gpuInputSchema:a,shaderLayout:i.shaderLayout})}else if(Object.keys(n.gpuConstants).length>0)throw Error("GPUTableModel constant columns require gpuInputSchema");let S=r?.bufferLayout??n.bufferLayout,B=r?.batches[0]?.attributes??y(n),L=r?.batches[0]?.attributeByteOffsets??x(n),A=r?.batches[0]?.bindings??w(n,u);return C(Object.keys(s),v(S),"attribute"),C(v(h),v(S),"buffer layout"),C(Object.keys(l),Object.keys(A),"binding"),{table:n,shaderBindings:r,tableAttributeByteOffsets:L,state:{explicitAttributes:s,explicitBindings:l,tableBindingNames:u,explicitBufferLayout:h,explicitIndexBuffer:d,explicitIndexCount:f,explicitFirstVertex:p,explicitFirstIndex:g,explicitVertexCount:m,inferInstanceCount:b,inferVertexCount:E,gpuInputSchema:a,shaderLayout:i.shaderLayout},modelProps:{...i,modules:r?.shaderModule?[...i.modules??[],r.shaderModule]:i.modules,bufferLayout:[...h,...S],attributes:{...s,...B},constantAttributes:{...i.constantAttributes||{},...r?.constantAttributes||{}},bindings:{...l,...A},...b?{instanceCount:n.numRows}:{},...E?{vertexCount:n.numRows}:{}}}}(t,e);super(t,n),this.table=r,this.tableState=o,this.tableShaderBindings=a,n.attributes&&Object.values(i??{}).some(t=>0!==t)&&this.setAttributes(n.attributes,{byteOffsets:i}),this.captureExplicitDrawState(),r&&this.setTableDrawState(r)}destroy(){this.tableShaderBindings?.destroy(),this.tableShaderBindings=void 0,super.destroy()}draw(t,e){let r=this.tableShaderBindings?.batches[0];return!!(r?.numRows===0&&Object.entries(r.bindings).some(([t,e])=>this.bindings[t]===e&&"size"in e&&0===e.size))||super.draw(t,e)}setProps(t){t.table&&this.setTable(t.table)}needsRedraw(){return this.syncTableDrawState(),super.needsRedraw()}predraw(t){this.syncTableDrawState(),super.predraw(t)}drawBatches(t,e={}){if("vectors"in e){let r=this.drawingTableBatches;this.drawingTableBatches=!0;try{return super.drawBatches(t,e)}finally{this.drawingTableBatches=r}}let r=this.table;if(!(r instanceof g.P))throw Error("GPUTableModel.drawBatches() requires a GPUTable");!function(t,e,r,n){var o,a;if(o=[...e,...t],a=r,JSON.stringify(o)!==JSON.stringify(a))throw Error(n)}(this.tableShaderBindings?.bufferLayout??r.bufferLayout,this.tableState.explicitBufferLayout,this.bufferLayout,"GPUTableModel.drawBatches() model buffer layout does not match its GPU table");let n=!0;this.drawingTableBatches=!0;try{for(let[o,a]of r.batches.entries()){if(0===a.numRows)continue;let r=this.tableShaderBindings?.batches[o];if(this.tableShaderBindings&&!r)throw Error("GPUTableModel.drawBatches() is missing prepared batch bindings");this.setAttributes({...this.tableState.explicitAttributes,...r?.attributes??y(a)},{byteOffsets:r?.attributeByteOffsets??x(a)}),this.setBindings({...this.tableState.explicitBindings,...r?.bindings??w(a,this.tableState.tableBindingNames)}),this.tableShaderBindings&&this.setConstantAttributes(this.tableShaderBindings.constantAttributes),this.setTableDrawState(a),e.onBatch?.(a,o),n=super.draw(t)&&n}}finally{this.drawingTableBatches=!1,this.setAttributes({...this.tableState.explicitAttributes,...this.tableShaderBindings?.batches[0]?.attributes??y(r)},{byteOffsets:this.tableShaderBindings?.batches[0]?.attributeByteOffsets??x(r)}),this.setBindings({...this.tableState.explicitBindings,...this.tableShaderBindings?.batches[0]?.bindings??w(r,this.tableState.tableBindingNames)}),this.setTableDrawState(r)}return n}setTable(t){if(this.tableState.gpuInputSchema){if(!this.tableState.shaderLayout)throw Error("GPUTableModel gpuInputSchema requires shaderLayout");if(this.tableShaderBindings)this.tableShaderBindings.updateBindings(t);else if(this.tableShaderBindings=new c(this.device,{table:t,gpuInputSchema:this.tableState.gpuInputSchema,shaderLayout:this.tableState.shaderLayout}),this.tableShaderBindings.shaderModule)throw this.tableShaderBindings.destroy(),this.tableShaderBindings=void 0,Error("GPUTableModel storage gpuInputSchema requires a table during model construction")}let e=this.tableShaderBindings?.bufferLayout??t.bufferLayout,r=this.tableShaderBindings?.batches[0]?.attributes??y(t),n=this.tableShaderBindings?.batches[0]?.attributeByteOffsets??x(t),o=this.tableShaderBindings?.batches[0]?.bindings??w(t,this.tableState.tableBindingNames);I(t,this.tableState.explicitIndexBuffer),P(t),C(Object.keys(this.tableState.explicitAttributes),v(e),"attribute"),C(v(this.tableState.explicitBufferLayout),v(e),"buffer layout"),C(Object.keys(this.tableState.explicitBindings),Object.keys(o),"binding"),this.setBufferLayout([...this.tableState.explicitBufferLayout,...e]),this.setAttributes({...this.tableState.explicitAttributes,...r},{byteOffsets:n}),this.setBindings({...this.tableState.explicitBindings,...o}),this.tableShaderBindings&&this.setConstantAttributes(this.tableShaderBindings.constantAttributes),this.setTableDrawState(t),this.table=t}clearTable(){this.table=void 0,this.restoreExplicitIndexDrawState()}syncTableDrawState(){this.table&&!this.drawingTableBatches&&this.setTableDrawState(this.table)}captureExplicitDrawState(){!this.tableState.explicitIndexBuffer&&this.indexBuffer&&(this.tableState.explicitIndexBuffer=this.indexBuffer),void 0===this.tableState.explicitIndexCount&&void 0!==this.indexCount&&(this.tableState.explicitIndexCount=this.indexCount),0===this.tableState.explicitVertexCount&&this.vertexCount>0&&(this.tableState.explicitVertexCount=this.vertexCount)}setTableDrawState(t){this.setTableRowCount(t.numRows);let e=E(t);e?this.setTableIndexDrawState(e):this.restoreExplicitIndexDrawState()}setTableRowCount(t){this.tableState.inferInstanceCount&&this.instanceCount!==t&&this.setInstanceCount(t),this.tableState.inferVertexCount&&this.vertexCount!==t&&this.setVertexCount(t)}setTableIndexDrawState({indexBuffer:t,indexCount:e,firstVertex:r,firstIndex:n}){this.indexBuffer!==S(t)&&this.setIndexBuffer(t),this.indexCount!==e&&this.setIndexCount(e),(this.firstVertex!==r||this.firstIndex!==n)&&this.setDrawOffsets({firstVertex:r,firstIndex:n}),this.vertexCount!==e&&this.setVertexCount(e)}restoreExplicitIndexDrawState(){this.indexBuffer!==S(this.tableState.explicitIndexBuffer)&&this.setIndexBuffer(this.tableState.explicitIndexBuffer),this.indexCount!==this.tableState.explicitIndexCount&&this.setIndexCount(this.tableState.explicitIndexCount),(this.firstVertex!==this.tableState.explicitFirstVertex||this.firstIndex!==this.tableState.explicitFirstIndex)&&this.setDrawOffsets({firstVertex:this.tableState.explicitFirstVertex,firstIndex:this.tableState.explicitFirstIndex}),this.tableState.inferVertexCount||this.vertexCount===this.tableState.explicitVertexCount||this.setVertexCount(this.tableState.explicitVertexCount)}}function w(t,e){let r=t instanceof g.P?t.batches[0]:t;if(!r)return{};let n={};for(let t of e){let e=r.gpuData[t];e&&(n[t]=e.buffer)}return n}function y(t){let e=t instanceof g.P?t.batches[0]:t;return e?(0,m.xJ)(e.bufferLayout,e.gpuData):{}}function x(t){let e=t instanceof g.P?t.batches[0]:t;return e?(0,m.cj)(e.bufferLayout,e.gpuData):{}}function v(t){return t.map(t=>t.name)}function C(t,e,r){let n=new Set(t);for(let t of e)if(n.has(t))throw Error(`GPUTableModel ${r} "${t}" duplicates an explicit ${r}`)}function I(t,e){if(e&&t.gpuVectors[p.m])throw Error("GPUTableModel indices column duplicates an explicit indexBuffer")}function P(t){let e=!!t.gpuVectors[p.m];for(let r of t.batches){if(!!r.gpuData[p.m]!==e)throw Error("GPUTableModel indexed tables require every batch to include indices");E(r)}}function E(t){let e=t instanceof g.P?t.gpuVectors[p.m]?.data[0]:t.gpuData[p.m];if(!e||t instanceof g.P&&t.batches.length>1)return null;if("vertex-list<uint32>"!==e.format)throw Error("GPUTableModel indices column requires vertex-list<uint32> format");if(t instanceof g.P&&1!==t.gpuVectors[p.m].data.length)throw Error("GPUTableModel indices column requires exactly one GPUData chunk");let r=e.buffer,o=S(r);if(!o||!(o.usage&n.h.INDEX))throw Error("GPUTableModel indices column requires Buffer.INDEX usage");let a="uint32"===o.indexType?4:2;if(e.byteOffset%a!=0)throw Error("GPUTableModel indices column byteOffset must align with its index type");return{indexBuffer:r,indexCount:e.valueLength,firstVertex:e.byteOffset,firstIndex:e.byteOffset/a}}function S(t){return t instanceof o.kL?t.buffer:t}},28188(t,e,r){r.d(e,{q:()=>s});var n=r(7707);let o=`\
${n.Ix}

const INDEX_PICKING_MODE_INSTANCE = 0;
const INDEX_PICKING_MODE_ATTRIBUTE = 1;
const INDEX_PICKING_MODE_VERTEX = 2;
const INDEX_PICKING_INVALID_INDEX = -1; // 2^32 - 1

/**
 * WGSL shaders need to carry the returned object index through their own stage outputs.
 */
fn picking_getInstanceObjectIndex(instanceIndex: u32) -> i32 {
  return i32(instanceIndex);
}

fn picking_getVertexObjectIndex(vertexIndex: u32) -> i32 {
  return i32(vertexIndex);
}

fn picking_getAttributeObjectIndex(objectIndex: i32) -> i32 {
  return objectIndex;
}

fn picking_setObjectIndex(objectIndex: i32) -> i32 {
  return picking_getAttributeObjectIndex(objectIndex);
}

fn picking_isObjectHighlighted(objectIndex: i32) -> bool {
  return
    picking.isHighlightActive != 0 &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == objectIndex;
}

fn picking_filterHighlightColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 || !picking_isObjectHighlighted(objectIndex)) {
    return color;
  }

  let highLightAlpha = picking.highlightColor.a;
  let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  if (blendedAlpha == 0.0) {
    return vec4<f32>(color.rgb, 0.0);
  }

  let highLightRatio = highLightAlpha / blendedAlpha;
  let blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn picking_filterPickingColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 && objectIndex == INDEX_PICKING_INVALID_INDEX) {
    discard;
  }
  return color;
}

fn picking_getPickingColor(objectIndex: i32) -> vec2<i32> {
  return vec2<i32>(objectIndex, picking.batchIndex);
}

`,a=`\
${n.bI}

const int INDEX_PICKING_MODE_INSTANCE = 0;
const int INDEX_PICKING_MODE_ATTRIBUTE = 1;
const int INDEX_PICKING_MODE_VERTEX = 2;

const int INDEX_PICKING_INVALID_INDEX = -1; // 2^32 - 1

flat out int picking_objectIndex;

/**
 * Vertex shaders should call this function to set the object index.
 * If using instance or vertex mode, the argument is ignored and 0 can be supplied.
 */
void picking_setObjectIndex(int objectIndex) {
  switch (picking.indexMode) {
    case INDEX_PICKING_MODE_INSTANCE:
      picking_objectIndex = gl_InstanceID;
      break;
    case INDEX_PICKING_MODE_ATTRIBUTE:
      picking_objectIndex = objectIndex;
      break;
    case INDEX_PICKING_MODE_VERTEX:
      picking_objectIndex = gl_VertexID;
      break;
  }
}
`,i=`\
${n.bI}

const int INDEX_PICKING_INVALID_INDEX = -1; // 2^32 - 1

flat in int picking_objectIndex;

/**
 * Check if this vertex is highlighted (part of the selected batch and object)
 */ 
bool picking_isFragmentHighlighted() {
  return 
    bool(picking.isHighlightActive) &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == picking_objectIndex
    ;
}

/**
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (bool(picking.isActive)) {
    return color;
  }

  // If we are not highlighted, return color as is
  if (!picking_isFragmentHighlighted()) {
    return color;
  }
   
  // Blend in highlight color based on its alpha value
  float highLightAlpha = picking.highlightColor.a;
  float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  float highLightRatio = highLightAlpha / blendedAlpha;

  vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
ivec4 picking_getPickingColor() {
  // Assumes that colorAttachment0 is rg32int
  // TODO? - we could render indices into a second color attachment and not mess with fragColor
  return ivec4(picking_objectIndex, picking.batchIndex, 0, 0);
}

vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_objectIndex == INDEX_PICKING_INVALID_INDEX) {
      discard;
    }
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 outColor = color;
  outColor = picking_filterHighlightColor(outColor);
  outColor = picking_filterPickingColor(outColor);
  return outColor;
}
`,s={...n.xc,name:"picking",source:o,vs:a,fs:i}},42399(t,e,r){r.d(e,{cO:()=>i,xr:()=>u});var n=r(87945),o=r(55590);let a=new Int32Array([-1,-1,0,0]);function i(t){return"webgpu"===t.type||"webgl"===t.type&&t.isTextureFormatRenderable("rg32sint")}function s(t){return{objectIndex:-1===t[0]?null:t[0],batchIndex:-1===t[1]?null:t[1]}}function l(t){let e=t[0]+256*t[1]+65536*t[2];return 0===e?{objectIndex:null,batchIndex:null}:{objectIndex:e-1,batchIndex:t[3]>0?t[3]-1:0}}class u{device;props;mode;pickInfo={batchIndex:null,objectIndex:null};framebuffer=null;lastMousePosition=null;tooltipElement=null;static defaultProps={shaderInputs:void 0,onObjectPicked:()=>{},getTooltip:()=>null,mode:"color",backend:"color"};constructor(t,e){this.device=t,this.props={...u.defaultProps,...e};let r=e.mode??e.backend??u.defaultProps.mode;this.props.mode=r,this.props.backend=r,this.mode=function(t,e="color",r="webgpu"===t){if("auto"===e)return r?"index":"color";if("index"===e&&!r)throw Error(`Picking mode "${e}" requires WebGPU or a WebGL device that supports renderable rg32sint textures.`);return e}(this.device.type,r,i(this.device))}destroy(){this.framebuffer?.destroy(),this.tooltipElement?.remove(),this.tooltipElement=null}getFramebuffer(){return this.framebuffer||(this.framebuffer="index"===this.mode?this.createIndexFramebuffer():this.createColorFramebuffer()),this.framebuffer}clearPickState(){this.lastMousePosition=null,this.setPickingProps({highlightedBatchIndex:null,highlightedObjectIndex:null}),this.hideTooltip()}shouldPick(t,e={}){if(!t)return this.lastMousePosition&&this.clearPickState(),!1;let[r,n]=t;return(!!e.force||!this.lastMousePosition||this.lastMousePosition[0]!==r||this.lastMousePosition[1]!==n)&&(this.lastMousePosition=[r,n],!0)}beginRenderPass(){let t=this.getFramebuffer();return t.resize(this.device.getDefaultCanvasContext().getDevicePixelSize()),this.setPickingProps({isActive:!0}),"index"===this.mode?this.device.beginRenderPass({framebuffer:t,clearColors:[new Float32Array([0,0,0,0]),a],clearDepth:1}):this.device.beginRenderPass({framebuffer:t,clearColor:[0,0,0,0],clearDepth:1})}async updatePickInfo(t){let e=this.getFramebuffer(),r=this.getPickPosition(t),n=await this.readPickInfo(e,r);return n?(this.hasPickInfoChanged(n)&&(this.pickInfo=n,this.props.onObjectPicked(n)),this.updateTooltip(n,t),this.setPickingProps({isActive:!1,highlightedBatchIndex:n.batchIndex,highlightedObjectIndex:n.objectIndex}),this.pickInfo):null}getPickPosition(t){let e="webgpu"!==this.device.type,r=this.device.getDefaultCanvasContext().cssToDevicePixels(t,e);return[r.x+Math.floor(r.width/2),r.y+Math.floor(r.height/2)]}createIndexFramebuffer(){let t=this.device.createTexture({format:"rgba8unorm",width:1,height:1,usage:n.g.RENDER_ATTACHMENT}),e=this.device.createTexture({format:"rg32sint",width:1,height:1,usage:n.g.RENDER_ATTACHMENT|n.g.COPY_SRC});return this.device.createFramebuffer({colorAttachments:[t,e],depthStencilAttachment:"depth24plus"})}createColorFramebuffer(){let t=this.device.createTexture({format:"rgba8unorm",width:1,height:1,usage:n.g.RENDER_ATTACHMENT|n.g.COPY_SRC});return this.device.createFramebuffer({colorAttachments:[t],depthStencilAttachment:"depth24plus"})}setPickingProps(t){this.props.shaderInputs?.setProps({picking:t})}async readPickInfo(t,e){return"index"===this.mode?this.readIndexPickInfo(t,e):this.readColorPickInfo(t,e)}async readIndexPickInfo(t,[e,r]){if("webgpu"===this.device.type){let n=t.colorAttachments[1]?.texture;if(!n)return null;let a=n.computeMemoryLayout({width:1,height:1}),i=this.device.createBuffer({byteLength:a.byteLength,usage:o.h.COPY_DST|o.h.MAP_READ});try{n.readBuffer({x:e,y:r,width:1,height:1},i);let t=await i.readAsync(0,a.byteLength);return s(new Int32Array(t.buffer,t.byteOffset,2))}finally{i.destroy()}}let n=this.device.readPixelsToArrayWebGL(t,{sourceX:e,sourceY:r,sourceWidth:1,sourceHeight:1,sourceAttachment:1});return n?s(new Int32Array(n.buffer,n.byteOffset,2)):null}async readColorPickInfo(t,[e,r]){if("webgpu"===this.device.type){let n=t.colorAttachments[0]?.texture;if(!n)return null;let a=n.computeMemoryLayout({width:1,height:1}),i=this.device.createBuffer({byteLength:a.byteLength,usage:o.h.COPY_DST|o.h.MAP_READ});try{n.readBuffer({x:e,y:r,width:1,height:1},i);let t=await i.readAsync(0,a.byteLength);return l(new Uint8Array(t.buffer,t.byteOffset,4))}finally{i.destroy()}}let n=this.device.readPixelsToArrayWebGL(t,{sourceX:e,sourceY:r,sourceWidth:1,sourceHeight:1,sourceAttachment:0});return n?l(new Uint8Array(n.buffer,n.byteOffset,4)):null}hasPickInfoChanged(t){return t.objectIndex!==this.pickInfo.objectIndex||t.batchIndex!==this.pickInfo.batchIndex}updateTooltip(t,e){let r=this.props.getTooltip(t);if(!r)return void this.hideTooltip();let n=this.getOrCreateTooltipElement();n&&(n.textContent=r,n.style.display="block",this.positionTooltip(n,e))}hideTooltip(){this.tooltipElement&&(this.tooltipElement.style.display="none")}getOrCreateTooltipElement(){if(this.tooltipElement)return this.tooltipElement;if("u"<typeof document||"u"<typeof window||"u"<typeof HTMLCanvasElement||"function"!=typeof this.device.getDefaultCanvasContext)return null;let t=this.device.getDefaultCanvasContext().canvas;if(!(t instanceof HTMLCanvasElement)||!t.parentElement)return null;let e=document.createElement("div");e.style.position="absolute",e.style.zIndex="12",e.style.display="none",e.style.maxWidth="220px",e.style.padding="8px 10px",e.style.borderRadius="6px",e.style.background="rgba(15, 23, 42, 0.92)",e.style.color="#f8fafc",e.style.font="600 13px/1.35 system-ui, sans-serif",e.style.pointerEvents="none",e.style.whiteSpace="nowrap",e.style.boxShadow="0 10px 24px rgba(15, 23, 42, 0.22)";let r=t.parentElement;return"static"===window.getComputedStyle(r).position&&(r.style.position="relative"),r.appendChild(e),this.tooltipElement=e,e}positionTooltip(t,e){if("u"<typeof HTMLCanvasElement||"function"!=typeof this.device.getDefaultCanvasContext)return;let r=this.device.getDefaultCanvasContext().canvas;if(!(r instanceof HTMLCanvasElement))return;let n=Math.max(8,r.clientWidth-t.offsetWidth-8),o=Math.max(8,r.clientHeight-t.offsetHeight-8),a=Math.min(e[0]+14,n),i=Math.min(e[1]+14,o);t.style.left=`${Math.max(8,a)}px`,t.style.top=`${Math.max(8,i)}px`}}},7707(t,e,r){r.d(e,{Ix:()=>o,bI:()=>n,xc:()=>a});let n=`\
precision highp float;
precision highp int;

layout(std140) uniform pickingUniforms {
  int isActive;
  int indexMode;
  int batchIndex;

  int isHighlightActive;
  int highlightedBatchIndex;
  int highlightedObjectIndex;
  vec4 highlightColor;
} picking;
`,o=`\
struct pickingUniforms {
  isActive: i32,
  indexMode: i32,
  batchIndex: i32,

  isHighlightActive: i32,
  highlightedBatchIndex: i32,
  highlightedObjectIndex: i32,
  highlightColor: vec4<f32>,
};

@group(0) @binding(auto) var<uniform> picking: pickingUniforms;
`,a={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"i32",indexMode:"i32",batchIndex:"i32",isHighlightActive:"i32",highlightedBatchIndex:"i32",highlightedObjectIndex:"i32",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,indexMode:0,batchIndex:0,isHighlightActive:!1,highlightedBatchIndex:-1,highlightedObjectIndex:-1,highlightColor:[0,1,1,1]},getUniforms:function(t={},e){let r={...e};switch(void 0!==t.isActive&&(r.isActive=!!t.isActive),t.indexMode){case"instance":r.indexMode=0;break;case"attribute":r.indexMode=1;break;case"vertex":r.indexMode=2}switch("number"==typeof t.batchIndex&&(r.batchIndex=t.batchIndex),t.highlightedObjectIndex){case void 0:break;case null:r.isHighlightActive=!1,r.highlightedObjectIndex=-1;break;default:r.isHighlightActive=!0,r.highlightedObjectIndex=t.highlightedObjectIndex}switch(t.highlightedBatchIndex){case void 0:break;case null:r.isHighlightActive=!1,r.highlightedBatchIndex=-1;break;default:r.isHighlightActive=!0,r.highlightedBatchIndex=t.highlightedBatchIndex}return t.highlightColor&&(r.highlightColor=t.highlightColor),r}}},5238(t,e,r){r.d(e,{Q:()=>p});var n=r(7707);let o=`\
${n.Ix}

const COLOR_PICKING_INVALID_INDEX = -1;
const COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const COLOR_PICKING_MAX_BATCH_INDEX = 254;

fn picking_setObjectIndex(objectIndex: i32) -> i32 {
  return objectIndex;
}

fn picking_isObjectHighlighted(objectIndex: i32) -> bool {
  return
    picking.isHighlightActive != 0 &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == objectIndex;
}

fn picking_filterHighlightColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 || !picking_isObjectHighlighted(objectIndex)) {
    return color;
  }

  let highLightAlpha = picking.highlightColor.a;
  let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  if (blendedAlpha == 0.0) {
    return vec4<f32>(color.rgb, 0.0);
  }

  let highLightRatio = highLightAlpha / blendedAlpha;
  let blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn picking_canEncodePickInfo(objectIndex: i32) -> bool {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

fn picking_getPickingColor(objectIndex: i32) -> vec4<f32> {
  if (!picking_canEncodePickInfo(objectIndex)) {
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
  }

  let encodedObjectIndex = objectIndex + 1;
  let red = encodedObjectIndex % 256;
  let green = (encodedObjectIndex / 256) % 256;
  let blue = (encodedObjectIndex / 65536) % 256;
  let alpha = picking.batchIndex + 1;

  return vec4<f32>(
    f32(red) / 255.0,
    f32(green) / 255.0,
    f32(blue) / 255.0,
    f32(alpha) / 255.0
  );
}

fn picking_filterPickingColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0) {
    if (!picking_canEncodePickInfo(objectIndex)) {
      discard;
    }
    return picking_getPickingColor(objectIndex);
  }

  return color;
}
`,a=`\
${n.bI}

const int INDEX_PICKING_MODE_INSTANCE = 0;
const int INDEX_PICKING_MODE_CUSTOM = 1;

const int COLOR_PICKING_INVALID_INDEX = -1;

flat out int picking_objectIndex;

void picking_setObjectIndex(int objectIndex) {
  switch (picking.indexMode) {
    case INDEX_PICKING_MODE_INSTANCE:
      picking_objectIndex = gl_InstanceID;
      break;
    case INDEX_PICKING_MODE_CUSTOM:
      picking_objectIndex = objectIndex;
      break;
  }
}
`,i=`\
${n.bI}

const int COLOR_PICKING_INVALID_INDEX = -1;
const int COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const int COLOR_PICKING_MAX_BATCH_INDEX = 254;

flat in int picking_objectIndex;

bool picking_isFragmentHighlighted() {
  return
    bool(picking.isHighlightActive) &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == picking_objectIndex
    ;
}

vec4 picking_filterHighlightColor(vec4 color) {
  if (bool(picking.isActive)) {
    return color;
  }

  if (!picking_isFragmentHighlighted()) {
    return color;
  }

  float highLightAlpha = picking.highlightColor.a;
  float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  float highLightRatio = highLightAlpha / blendedAlpha;

  vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

bool picking_canEncodePickInfo(int objectIndex) {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

vec4 picking_getPickingColor() {
  if (!picking_canEncodePickInfo(picking_objectIndex)) {
    return vec4(0.0);
  }

  int encodedObjectIndex = picking_objectIndex + 1;
  int red = encodedObjectIndex % 256;
  int green = (encodedObjectIndex / 256) % 256;
  int blue = (encodedObjectIndex / 65536) % 256;
  int alpha = picking.batchIndex + 1;

  return vec4(float(red), float(green), float(blue), float(alpha)) / 255.0;
}

vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (!picking_canEncodePickInfo(picking_objectIndex)) {
      discard;
    }
    return picking_getPickingColor();
  }

  return color;
}

vec4 picking_filterColor(vec4 color) {
  vec4 outColor = color;
  outColor = picking_filterHighlightColor(outColor);
  outColor = picking_filterPickingColor(outColor);
  return outColor;
}
`,s={...n.xc,name:"picking",source:o,vs:a,fs:i},l=`\
${n.Ix}

const COLOR_PICKING_INVALID_INDEX = -1;
const COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const COLOR_PICKING_MAX_BATCH_INDEX = 254;

fn picking_getInstanceObjectIndex(instanceIndex: u32) -> i32 {
  return i32(instanceIndex);
}

fn picking_getVertexObjectIndex(vertexIndex: u32) -> i32 {
  return i32(vertexIndex);
}

fn picking_getAttributeObjectIndex(objectIndex: i32) -> i32 {
  return objectIndex;
}

fn picking_setObjectIndex(objectIndex: i32) -> i32 {
  return picking_getAttributeObjectIndex(objectIndex);
}

fn picking_isObjectHighlighted(objectIndex: i32) -> bool {
  return
    picking.isHighlightActive != 0 &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == objectIndex;
}

fn picking_filterHighlightColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0 || !picking_isObjectHighlighted(objectIndex)) {
    return color;
  }

  let highLightAlpha = picking.highlightColor.a;
  let blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  if (blendedAlpha == 0.0) {
    return vec4<f32>(color.rgb, 0.0);
  }

  let highLightRatio = highLightAlpha / blendedAlpha;
  let blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4<f32>(blendedRGB, blendedAlpha);
}

fn picking_canEncodePickInfo(objectIndex: i32) -> bool {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

fn picking_getPickingColor(objectIndex: i32) -> vec4<f32> {
  if (!picking_canEncodePickInfo(objectIndex)) {
    return vec4<f32>(0.0, 0.0, 0.0, 0.0);
  }

  let encodedObjectIndex = objectIndex + 1;
  let red = encodedObjectIndex % 256;
  let green = (encodedObjectIndex / 256) % 256;
  let blue = (encodedObjectIndex / 65536) % 256;
  let alpha = picking.batchIndex + 1;

  return vec4<f32>(
    f32(red) / 255.0,
    f32(green) / 255.0,
    f32(blue) / 255.0,
    f32(alpha) / 255.0
  );
}

fn picking_filterPickingColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  if (picking.isActive != 0) {
    if (!picking_canEncodePickInfo(objectIndex)) {
      discard;
    }
    return picking_getPickingColor(objectIndex);
  }

  return color;
}

fn picking_filterColor(color: vec4<f32>, objectIndex: i32) -> vec4<f32> {
  var outColor = color;
  outColor = picking_filterHighlightColor(outColor, objectIndex);
  outColor = picking_filterPickingColor(outColor, objectIndex);
  return outColor;
}
`,u=`\
${n.bI}

const int INDEX_PICKING_MODE_INSTANCE = 0;
const int INDEX_PICKING_MODE_ATTRIBUTE = 1;
const int INDEX_PICKING_MODE_VERTEX = 2;

flat out int picking_objectIndex;

void picking_setObjectIndex(int objectIndex) {
  switch (picking.indexMode) {
    case INDEX_PICKING_MODE_INSTANCE:
      picking_objectIndex = gl_InstanceID;
      break;
    case INDEX_PICKING_MODE_ATTRIBUTE:
      picking_objectIndex = objectIndex;
      break;
    case INDEX_PICKING_MODE_VERTEX:
      picking_objectIndex = gl_VertexID;
      break;
  }
}
`,c=`\
${n.bI}

const int COLOR_PICKING_INVALID_INDEX = -1;
const int COLOR_PICKING_MAX_OBJECT_INDEX = 16777214;
const int COLOR_PICKING_MAX_BATCH_INDEX = 254;

flat in int picking_objectIndex;

bool picking_isFragmentHighlighted() {
  return
    bool(picking.isHighlightActive) &&
    picking.highlightedBatchIndex == picking.batchIndex &&
    picking.highlightedObjectIndex == picking_objectIndex
    ;
}

vec4 picking_filterHighlightColor(vec4 color) {
  if (bool(picking.isActive)) {
    return color;
  }

  if (!picking_isFragmentHighlighted()) {
    return color;
  }

  float highLightAlpha = picking.highlightColor.a;
  float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
  float highLightRatio = highLightAlpha / blendedAlpha;

  vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
  return vec4(blendedRGB, blendedAlpha);
}

bool picking_canEncodePickInfo(int objectIndex) {
  return
    objectIndex != COLOR_PICKING_INVALID_INDEX &&
    objectIndex >= 0 &&
    objectIndex <= COLOR_PICKING_MAX_OBJECT_INDEX &&
    picking.batchIndex >= 0 &&
    picking.batchIndex <= COLOR_PICKING_MAX_BATCH_INDEX;
}

vec4 picking_getPickingColor() {
  if (!picking_canEncodePickInfo(picking_objectIndex)) {
    return vec4(0.0);
  }

  int encodedObjectIndex = picking_objectIndex + 1;
  int red = encodedObjectIndex % 256;
  int green = (encodedObjectIndex / 256) % 256;
  int blue = (encodedObjectIndex / 65536) % 256;
  int alpha = picking.batchIndex + 1;

  return vec4(float(red), float(green), float(blue), float(alpha)) / 255.0;
}

vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (!picking_canEncodePickInfo(picking_objectIndex)) {
      discard;
    }
    return picking_getPickingColor();
  }

  return color;
}

vec4 picking_filterColor(vec4 color) {
  vec4 outColor = color;
  outColor = picking_filterHighlightColor(outColor);
  outColor = picking_filterPickingColor(outColor);
  return outColor;
}
`,h={...n.xc,name:"picking",source:l,vs:u,fs:c};var d=r(28188),f=r(42399);function p(t){return(0,f.cO)(t)?d.q:h}({...n.xc,name:"picking",source:d.q.source,vs:s.vs,fs:s.fs})},75876(t,e,r){r.d(e,{DR:()=>v,wr:()=>x,Km:()=>y});var n=r(55590),o=r(80316),a=r(51548);class i extends a.I{name="convertColors";output;constructor(t,e,r){super({source:t,inputFormat:e,outputFormat:r}),this.output=new o.GL({id:`convertColors(${t})`,type:"unorm8x4"===r?"uint8":"float16x4"===r?"float16":"float32",size:4,normalized:"unorm8x4"===r,format:r,length:t.length,source:this})}toString(){return`convertColors(${this.inputs.source})`}}var s=r(64263),l=r(66116),u=r(77806),c=r(6116),h=r(8969),d=r(41240),f=r(62403),p=r(37589),g=r(9624),m=r(59858),b=r(72458);let w=new p.Y1(4,new g.D("value",new p.l5,!1));async function y(t,e,r={}){let a=(0,l.Ww)(r.inputFormat?.startsWith("float16")?"float16x4":e.format,r),d=E(a),f=(0,u.Ft)(a).byteLength;if("preserve"===r.format&&e.format===a)return new c.M({type:"data",name:r.name??e.name,format:a,dataType:d,data:e.data,ownsData:!1});let p=s.V.fromGPUVector(e),g=p.mapGPUData(t=>(function(t,e={}){let r=(0,o.uy)(t),n=e.inputFormat??function(t){let e=`${t.type}x${t.size}`;switch(e){case"uint8x3":case"uint8x4":case"float16x3":case"float16x4":case"float32x3":case"float32x4":return e;default:throw Error(`convertColors unsupported input format ${e}`)}}(r);return new i(r,n,e.format??"unorm8x4").output})(t,{inputFormat:r.inputFormat,format:a})),m=[];try{g.gpuDataEvaluators.forEach((e,o)=>{let a=t.createBuffer({id:`${r.name??"colors"}-${o}`,usage:n.h.VERTEX|n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,byteLength:Math.max(e.byteLength,4)});e.setTargetBuffer({buffer:a}),m.push(a)});let o=await g.evaluate(t,{name:r.name??"colors",format:a}),i=o.data.map((t,r)=>{let n=e.data[r],o=n?P(n):void 0;return new h.L({buffer:m[r],dataType:d,format:a,length:t.length,stride:4,byteOffset:t.byteOffset,byteStride:f,rowByteLength:f,ownsBuffer:!0,nullBitmap:o?.nullBitmap,readbackMetadata:o})});return new c.M({type:"data",name:o.name,dataType:d,format:a,data:i,ownsData:!0})}catch(t){for(let t of m)t.destroy();throw t}finally{g.destroy(),p.destroy()}}function x(t){try{if(t instanceof c.M)for(let e of t.data){let t=o.GL.fromGPUData(e);try{!function(t){let e=`${t.type}x${t.size}`;switch(e){case"uint8x3":case"uint8x4":case"float16x3":case"float16x4":case"float32x3":case"float32x4":return;default:throw Error(`convertColors unsupported input format ${e}`)}}(t)}finally{t.destroy()}}else C(t.type,"canConvertColors");return!0}catch{return!1}}async function v(t,e,r={}){C(e.type,"convertArrowColors");let o=function(t){let e=t.children[0].type,r=e instanceof p.l5?"uint8":e instanceof p.cS?"float16":e instanceof p.gh?"float32":null;if(!r||3!==t.listSize&&4!==t.listSize)throw Error(`convertArrowColors unsupported input type ${t}`);return`${r}x${t.listSize}`}(e.type),a=I(o),i=(0,l.Ww)(o.startsWith("float16")?"float16x4":a,r);if("preserve"===r.format&&(a===i||"uint8x4"===a&&"unorm8x4"===i))return(0,m.ft)(t,e,{...r.bufferProps,name:r.name??"colors",format:i,preserveDataChunks:!0});if(r.preferCPU||"webgpu"!==t.type){let s=new d.a({name:r.name??"colors",format:a,data:e.data.map(t=>new f.d({buffer:(0,b.DE)(t),format:a,length:t.length,nullBitmap:(0,m.Bz)((0,b.bM)(t))}))}),u=[];try{for(let e of s.data){let a=(0,l.Jk)(e,i,o),s=new Uint8Array(a.buffer,a.byteOffset,a.length*a.byteStride),c=P({nullBitmap:e.nullBitmap,length:e.length});u.push(new h.L({buffer:t.createBuffer({...r.bufferProps,byteLength:Math.max(s.length,4),data:s.length?s:new Uint8Array(4),usage:r.bufferProps?.usage??n.h.VERTEX|n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC}),format:i,dataType:E(i),length:e.length,ownsBuffer:!0,nullBitmap:c?.nullBitmap,readbackMetadata:c}))}return new c.M({type:"data",name:r.name??"colors",format:i,dataType:E(i),data:u,ownsData:!0})}catch(t){for(let t of u)t.destroy();throw t}}let s=(0,m.ft)(t,e,{...r.bufferProps,name:r.name?`${r.name}-source`:"colors-source",format:I(o),preserveDataChunks:!0});try{return await y(t,s,{name:r.name??"colors",inputFormat:o,format:i})}finally{s.destroy()}}function C(t,e){let r=p.pe.isFixedSizeList(t)?t.children[0].type:null,n=r instanceof p.l5||r instanceof p.cS||r instanceof p.gh;if(!p.pe.isFixedSizeList(t)||!n||![3,4].includes(t.listSize))throw Error(`${e}: Arrow data type ${t} is not supported`)}function I(t){switch(t){case"uint8x3":return"uint8x3-webgl";case"float16x3":return"uint16x3-webgl";default:return t}}function P(t){let e=t.nullBitmap;if(!e)return;let r=new Uint8Array(e),n=0;for(let e=0;e<t.length;e++)(r[e>>3]&1<<(7&e))==0&&n++;return n>0?{kind:"fixed-size-list",nullCount:n,nullBitmap:r,childNullCount:0}:void 0}function E(t){return"unorm8x4"===t?w:"float16x4"===t?new p.Y1(4,new g.D("value",new p.cS,!1)):new p.Y1(4,new g.D("value",new p.gh,!1))}},21528(t,e,r){r.d(e,{FO:()=>s,UM:()=>l,UR:()=>i});var n=r(27549),o=r(37589),a=r(46252);function i(t){return function t(e,r){if(!o.pe.isStruct(e.type))return[r.join(".")];let n=e.type.children,a=[];for(let o=0;o<n.length;o++){let i=n[o],s=t(e.children[o],[...r,i.name]);a.push(...s)}return a}(u(t)[0],[])}function s(t,e){let r=(0,a.g)(u(t)),n=c(e),i=r;for(let t of n){if(!o.pe.isStruct(i.type))throw Error(`Arrow table nested column is a not a struct: '${t} in '${n.join(".")}'`);let e=i.type.children.findIndex(e=>e.name===t);if(-1===e)throw Error(`Arrow table schema does not contain nested column '${t} in '${n.join(".")}'`);i=i.getChildAt(e)}if(o.pe.isStruct(i.type))throw Error(`Arrow table nested column '${n.join(".")}' is a struct`);return i}function l(t,e){let r=c(e),n=t.schema.fields,a=null;for(let t=0;t<r.length;t++){let e=r[t],i=t===r.length-1,s=n.findIndex(t=>t.name===e);if(-1===s)throw Error(`Arrow table schema does not contain nested column '${e} in '${r.join(".")}'`);if(a=n[s],!i){if(!o.pe.isStruct(a.type))throw Error(`Arrow table nested column is a not a struct: '${e} in '${r.join(".")}'`);n=a.type.children}}if(!a||o.pe.isStruct(a.type))throw Error(`Arrow table nested column '${r.join(".")}' is a struct`);return a}function u(t){return(0,n._h)(t)?t.data:(0,n.$x)(t)?[t.data]:t instanceof a.M?t.data:[t]}function c(t){return t.split(".")}},62105(t,e,r){r.d(e,{Jd:()=>i,d8:()=>a,s$:()=>s,w2:()=>l});var n=r(37589),o=r(67144);function a(t){return n.pe.isFloat(t)||n.pe.isInt(t)}function i(t){return a(t)||n.pe.isFixedSizeList(t)&&t.listSize>=1&&t.listSize<=4&&a(t.children[0].type)}function s(t){return n.pe.isList(t)&&i(t.children[0].type)}function l(t,e){if(n.pe.isInt(t))switch(t.bitWidth){case 8:return t.isSigned?"sint8":"uint8";case 16:return t.isSigned?"sint16":"uint16";case 32:return t.isSigned?"sint32":"uint32";case 64:throw Error("64-bit integers are not supported in shaders")}if(n.pe.isFloat(t))switch(t.precision){case o.j.HALF:return"float16";case o.j.SINGLE:return"float32";case o.j.DOUBLE:throw Error("Double precision floats are not supported in shaders")}throw Error(`Unsupported arrow type ${t}`)}},938(t,e,r){r.d(e,{W:()=>i});var n=r(46616),o=r(15650);let a=new(r(64677)).R;function i(t,e){let{modules:r,...i}=e,s=a.assembleWGSLShader({platformInfo:(0,n.O)(t),source:e.source,modules:r,shaderStage:"compute",computeEntryPoint:e.entryPoint,scanVertexAttributes:!1});return new o.M(t,{...i,source:s.source,entryPoint:s.entryPoints?.compute||e.entryPoint})}},72458(t,e,r){r.d(e,{DE:()=>d,OM:()=>g,Qb:()=>v,TO:()=>p,_W:()=>f,as:()=>b,bM:()=>m,de:()=>function t(e){return(0,l.s$)(e)?t(e.children[0].type):o.pe.isFixedSizeList(e)?e.listSize:1},jC:()=>w,k_:()=>y,wX:()=>u});var n=r(14957),o=r(37589),a=r(67144),i=r(64570),s=r(46252),l=r(62105);function u(t){if(!t.dataType)throw Error("Arrow GPUVector requires adapter dataType metadata");return t.dataType}let c=n.Hg,h=n.Hg;function d(t){if(o.pe.isFixedSizeList(t.type))return function(t){let e=t.children[0],r=e?.values;if(!e||!r)throw Error("Arrow FixedSizeList data has no child values");let n=t.type.listSize,o=t.length*n,a=r.length===o||r.length<=e.length,i=a?0:(e.offset??0)+t.offset*n,s=Math.max(0,Math.min(o,r.length-i,e.length-(a?0:t.offset*n)));if(s===o)return r.subarray(i,i+o);for(let e=Math.floor(s/n);e<t.length;e++)if(I(t,e))throw Error("Arrow FixedSizeList child values are shorter than their logical row count");let l=P(r,o);return l.set(r.subarray(i,i+s)),l}(t);let{values:e,startElement:r,elementCount:n}=function(t){if(o.pe.isFixedSizeList(t.type)){let e=t.children[0],r=e?.values;if(!r)throw Error("Arrow FixedSizeList data has no child values");let n=t.length*t.type.listSize;return{values:r,startElement:(e.offset??0)+t.offset*t.type.listSize,elementCount:n}}let e=t.values;if(!e)throw Error("Arrow data has no values");return{values:e,startElement:t.offset,elementCount:t.length}}(t);if(e.length<n)throw Error("Arrow data values are shorter than the logical upload length");if(e.length===n)return e;let a=r+n;if(a>e.length)throw Error("Arrow data values are shorter than the logical upload length");return e.subarray(r,a)}function f(t){let e=t.valueOffsets,r=t.values;if(!e||!r)return new Uint8Array(0);let n=e[0]??0,o=e[t.length]??n;return r.subarray(n,o)}function p(t){let e=t.valueOffsets,r=t.children[0];if(!e||!r)return new Float32Array(0);let n=e[0]??0,a=e[t.length]??n;if(o.pe.isFixedSizeList(r.type)){let t=r.children[0],e=t?.values;if(!t||!e)return new Float32Array(0);let o=r.type.listSize,i=t.offset??0;return e.subarray(i+n*o,i+a*o)}let i=r.values;if(!i)return new Float32Array(0);let s=r.offset??0;return i.subarray(s+n,s+a)}function g(t){if(o.pe.isInt(t.type)||o.pe.isFloat(t.type)){let e=B(t);return e?{kind:"numeric",nullCount:t.nullCount,nullBitmap:e}:void 0}if(o.pe.isFixedSizeList(t.type))return function(t){let e=t.children[0];if(!e)throw Error("Arrow FixedSizeList data has no child values");if(0===t.nullCount&&0===e.nullCount)return;let r=t.length*t.type.listSize,n=C(t,e),o=new Uint8Array(Math.ceil(r/8)),a=0;for(let t=0;t<r;t++){let r=n+t;r<e.length&&I(e,r)?o[t>>3]|=1<<(7&t):a++}return{kind:"fixed-size-list",nullCount:t.nullCount,nullBitmap:B(t),childNullCount:a,...a>0?{childNullBitmap:o}:{}}}(t);if(o.pe.isUtf8(t.type)){let e=f(t);return{kind:"utf8",valueOffsets:S(t),nullCount:t.nullCount,nullBitmap:B(t),valueByteLength:e.byteLength}}if((0,l.s$)(t.type)){let e=p(t);return{kind:"variable-length-attribute",valueOffsets:S(t),nullCount:t.nullCount,nullBitmap:B(t),valueByteLength:e.byteLength}}}function m(t,e=t.type.listSize){let r=t.children[0];if(!r)throw Error("Arrow FixedSizeList data has no child values");if(!Number.isSafeInteger(e)||e<1||e>t.type.listSize)throw Error("Arrow FixedSizeList validity dimensions must fit within the list width");if(0===t.nullCount&&0===r.nullCount)return;let n=C(t,r),o=new Uint32Array(t.length);for(let a=0;a<t.length;a++){let i=I(t,a);for(let o=0;i&&o<e;o++){let e=n+a*t.type.listSize+o;i=e<r.length&&I(r,e)}o[a]=Number(i)}return o}function b(t){let e=t.data.map(t=>d(t));if(0===e.length)throw Error("Arrow vector has no data");if(1===e.length)return e[0];let r=e.reduce((t,e)=>t+e.length,0),n=P(e[0],r),o=0;for(let t of e)n.set(t,o),o+=t.length;return n}function w(t){if((0,l.s$)(t))return w(t.children[0].type);if(o.pe.isFixedSizeList(t))return t.listSize*w(t.children[0].type);if(o.pe.isInt(t))return t.bitWidth/8;if(o.pe.isFloat(t))switch(t.precision){case a.j.HALF:return 2;case a.j.SINGLE:return 4;case a.j.DOUBLE:return 8}throw Error(`Cannot determine byte stride for Arrow type ${t}`)}function y(t,e){if(e.nullCount>0)throw Error(`GPUVector "${t}" does not support nullable data`);if(o.pe.isFixedSizeList(e.type)&&(e.children[0]?.nullCount??0)>0)throw Error(`GPUVector "${t}" does not support nullable child data`);if((0,l.s$)(e.type)){let r=e.children[0],n=o.pe.isFixedSizeList(r?.type)?r.children[0]:void 0;if((r?.nullCount??0)>0||(n?.nullCount??0)>0)throw Error(`GPUVector "${t}" does not support nullable nested list data`)}}async function x(t){let{buffer:e,type:r,length:n,byteOffset:a,byteStride:i}=t,l=w(r);if(i<l)throw Error(`GPUVector.readAsync() byteStride ${i} is smaller than row byte width ${l}`);let u=0===n?0:(n-1)*i+l,d=0===u?new Uint8Array(0):await e.readAsync(a,u),f=i===l?d:E(d,n,i,l);return function(t,e,r){if(o.pe.isFixedSizeList(t)){let n=t.children[0].type,o=L(n,r,e*t.listSize),a=c({type:n,length:e*t.listSize,data:o}),i=h({type:t,length:e,nullCount:0,nullBitmap:null,child:a});return(0,s.g)(i)}let n=L(t,r,e),a=c({type:t,length:e,data:n});return(0,s.g)(a)}(r,n,f)}async function v(t){var e,r,a,s,u,d,f,p,g,m;let b,y,v=function(t){if(!t.dataType)throw Error("Arrow GPUData requires adapter dataType metadata");return t.dataType}(t);if(o.pe.isUtf8(v)){let e=t.readbackMetadata;if(e?.kind!=="utf8")throw Error("readArrowGPUDataAsync() requires UTF-8 readback metadata");let r=0===e.valueByteLength?new Uint8Array(0):await t.buffer.readAsync(t.byteOffset,e.valueByteLength);return(0,n.Hg)({type:new o.YE,length:t.length,nullCount:e.nullCount,nullBitmap:e.nullBitmap,valueOffsets:e.valueOffsets,data:r})}if((0,l.s$)(v)){let l,g,m,b,y,x,C=t.readbackMetadata;if(C?.kind!=="variable-length-attribute")throw Error("readArrowGPUDataAsync() requires variable-length attribute readback metadata");let I=C.valueByteLength/t.rowByteLength;if(!Number.isSafeInteger(I)||I<0)throw Error("readArrowGPUDataAsync() variable-length byte metadata is misaligned");let P=0===I?0:(I-1)*t.byteStride+t.rowByteLength,S=0===P?new Uint8Array(0):await t.buffer.readAsync(t.byteOffset,P),B=t.byteStride===t.rowByteLength?S:E(S,I,t.byteStride,t.rowByteLength);return e=v,r=t.length,a=C,s=B,y=e.children[0].type,x=o.pe.isFixedSizeList(y)?(u=y,d=s,g=L(l=u.children[0].type,d,d.byteLength/w(l)),m=c({type:l,length:g.length,data:g}),h({type:u,length:0===u.listSize?0:g.length/u.listSize,nullCount:0,nullBitmap:null,child:m})):(b=L(f=y,p=s,p.byteLength/w(f)),c({type:f,length:b.length,data:b})),new n.B_(e,0,r,a.nullCount,{[i.NZ.OFFSET]:a.valueOffsets,...a.nullBitmap?{[i.NZ.VALIDITY]:a.nullBitmap}:{}},[x])}let C=(await x({type:v,buffer:t.buffer,length:t.length,byteOffset:t.byteOffset,byteStride:t.byteStride})).data[0],I=t.readbackMetadata;return I?.kind==="numeric"?new n.B_(v,0,t.length,I.nullCount,{[i.NZ.DATA]:C.values,[i.NZ.VALIDITY]:I.nullBitmap}):o.pe.isFixedSizeList(v)&&I?.kind==="fixed-size-list"?(g=C,m=I,b=g.children[0],y=new n.B_(b.type,0,b.length,m.childNullCount,{[i.NZ.DATA]:b.values,...m.childNullBitmap?{[i.NZ.VALIDITY]:m.childNullBitmap}:{}}),new n.B_(g.type,0,g.length,m.nullCount,{...m.nullBitmap?{[i.NZ.VALIDITY]:m.nullBitmap}:{}},[y])):C}function C(t,e){let r=e.values;return r.length<=e.length||r.length===t.length*t.type.listSize?0:t.offset*t.type.listSize}function I(t,e){if(0===t.nullCount||!t.nullBitmap)return!0;let r=t.offset+e;return((t.nullBitmap[r>>3]??0)&1<<(7&r))!=0}function P(t,e){return new t.constructor(e)}function E(t,e,r,n){let o=new Uint8Array(e*n);for(let a=0;a<e;a++){let e=a*r,i=a*n;o.set(t.subarray(e,e+n),i)}return o}function S(t){let e=t.valueOffsets,r=new Int32Array(t.length+1);if(!e)return r;let n=e[0]??0;for(let o=0;o<=t.length;o++)r[o]=Math.max(0,(e[o]??n)-n);return r}function B(t){if(0===t.nullCount||!t.nullBitmap)return;let e=new Uint8Array(Math.ceil(t.length/8)),r=t.nullBitmap,n=t.offset??0;for(let o=0;o<t.length;o++){let t=n+o;((r[t>>3]??0)&1<<(7&t))!=0&&(e[o>>3]|=1<<(7&o))}return e}function L(t,e,r){if(o.pe.isInt(t)){if(t.isSigned)switch(t.bitWidth){case 8:return A(Int8Array,e,r);case 16:return A(Int16Array,e,r);case 32:return A(Int32Array,e,r);case 64:return A(BigInt64Array,e,r)}switch(t.bitWidth){case 8:return A(Uint8Array,e,r);case 16:return A(Uint16Array,e,r);case 32:return A(Uint32Array,e,r);case 64:return A(BigUint64Array,e,r)}}if(o.pe.isFloat(t))switch(t.precision){case a.j.HALF:return A(Uint16Array,e,r);case a.j.SINGLE:return A(Float32Array,e,r);case a.j.DOUBLE:return A(Float64Array,e,r)}throw Error(`GPUVector.readAsync() does not support Arrow type ${t}`)}function A(t,e,r){let n=r*t.BYTES_PER_ELEMENT;if(e.byteOffset%t.BYTES_PER_ELEMENT==0)return new t(e.buffer,e.byteOffset,r);let o=new Uint8Array(n);return o.set(e.subarray(0,n)),new t(o.buffer,0,r)}},59858(t,e,r){r.d(e,{Bz:()=>E,HY:()=>C,IK:()=>v,MZ:()=>g,bh:()=>x,fV:()=>y,ft:()=>b,i0:()=>m,kv:()=>p,yc:()=>I});var n=r(48097),o=r(50784),a=r(8969),i=r(6116),s=r(77806),l=r(37589),u=r(67144),c=r(46252),h=r(72458),d=r(62105),f=r(56498);function p(t){let e=l.pe.isList(t),r=e?t.children[0].type:t,n=l.pe.isFixedSizeList(r)?r.children[0].type:r,o=l.pe.isFixedSizeList(r)?r.listSize:1;if(!Number.isSafeInteger(o)||o<1||o>4&&e)throw Error(`Cannot synthesize a GPUVector format for Arrow type ${t}`);let a=g(n);if(o>4)return`fixed-size-list<${a},${o}>`;if("float16"===a&&3===o)throw Error("Cannot synthesize a float16x3 GPUVector format");let i=1===o?a:3===o&&function(t){switch(t){case"uint8":case"sint8":case"uint16":case"sint16":return!0;default:return!1}}(a)?`${a}x3-webgl`:`${a}x${o}`;return e?`vertex-list<${i}>`:i}function g(t){if(l.pe.isInt(t))switch(t.bitWidth){case 8:return t.isSigned?"sint8":"uint8";case 16:return t.isSigned?"sint16":"uint16";case 32:return t.isSigned?"sint32":"uint32"}if(l.pe.isFloat(t))switch(t.precision){case u.j.HALF:return"float16";case u.j.SINGLE:return"float32"}throw Error(`Unsupported GPUVector logical type ${t}`)}function m(t,e,r={}){let i=e.type,{format:s=C(i),...u}=r,c=(0,h.OM)(e),f=c?.kind==="utf8"||c?.kind==="variable-length-attribute"?c:void 0,p=c?.kind==="numeric"?c.nullBitmap:void 0;if(x(i)){var g;let r,l,c=(0,h.jC)(i.indices);return new a.L({buffer:new o.kL(t,{...void 0===u.usage?(0,n.T)(t,"uint16"===s?"uint16":"uint32"):{},...u,data:(l=(r=(g=e).values).length===g.length?0:g.offset??0,r.subarray(l,l+g.length))}),dataType:i,format:s,length:e.length,stride:1,byteStride:c,rowByteLength:c,ownsBuffer:!0})}if(l.pe.isUtf8(i))return new a.L({buffer:new o.kL(t,{...void 0===u.usage?(0,n.T)(t,"uint16"===s?"uint16":"uint32"):{},...u,data:(0,h._W)(e)}),dataType:i,format:s,length:e.length,valueLength:f?.valueByteLength??0,stride:1,byteStride:1,rowByteLength:1,ownsBuffer:!0,readbackMetadata:c,valueOffsets:f?.valueOffsets,nullBitmap:f?.nullBitmap,valueByteLength:f?.valueByteLength});if((0,d.s$)(i)){(0,h.k_)("makeGPUDataFromArrowData",e);let r=(0,h.jC)(i);return new a.L({buffer:new o.kL(t,{...void 0===u.usage?(0,n.T)(t,"uint16"===s?"uint16":"uint32"):{},...u,data:(0,h.TO)(e)}),dataType:i,format:s,length:e.length,valueLength:P(e),stride:(0,h.de)(i),byteStride:r,rowByteLength:r,ownsBuffer:!0,readbackMetadata:c,valueOffsets:f?.valueOffsets,nullBitmap:f?.nullBitmap,valueByteLength:f?.valueByteLength})}let b=(0,h.jC)(i);return new a.L({buffer:new o.kL(t,{...void 0===u.usage?(0,n.T)(t,"uint16"===s?"uint16":"uint32"):{},...u,data:(0,h.DE)(e)}),dataType:i,format:s,length:e.length,stride:(0,h.de)(i),byteStride:b,rowByteLength:b,ownsBuffer:!0,readbackMetadata:c,...c?.kind==="fixed-size-list"?{nullBitmap:E((0,h.bM)(e))}:p?{nullBitmap:p}:{}})}function b(t,e,r={}){let{name:o="vector",format:u,preserveDataChunks:c=!0,...p}=r,g=e.type,w=(0,f.GH)(e),y=w&&I(w);if(!c&&(l.pe.isFixedSizeList(g)||l.pe.isInt(g)||l.pe.isFloat(g))&&e.data.some(t=>t.nullCount>0||(t.children[0]?.nullCount??0)>0))throw Error("Nullable Arrow numeric and FixedSizeList vectors require preserved GPU data chunks");let E=l.pe.isUtf8(g)||x(g)||(0,d.s$)(g);if(w&&!y)throw Error("GPUVector matrix columns require canonical Float32 column-major wgsl-storage values; use convertArrowMatrixToGPUVector() first");if(!(0,d.Jd)(g)&&!v(g)&&!y&&!E)throw Error(`GPUVector does not support Arrow type ${g}`);let S=u??(w?"float32x4":C(g)),B=l.pe.isUtf8(g)?1:x(g)?(0,h.jC)(g.indices):(0,h.jC)(g),L=l.pe.isUtf8(g)||x(g)?1:(0,h.de)(g);if(c||E)return new i.M({type:"data",name:o,dataType:g,format:S,data:e.data.map(e=>m(t,e,{...p,format:S})),stride:L,byteStride:B,rowByteLength:B,ownsData:!0});let A=t.createBuffer({...void 0===p.usage?(0,n.T)(t,"uint16"===S?"uint16":"uint32"):{},...p,data:(0,h.as)(e)});return new i.M({type:"data",name:o,dataType:g,format:S,data:[new a.L({buffer:A,dataType:g,format:S,length:e.length,valueLength:(0,s.Ft)(S).fixedSizeList?e.length*((0,s.Ft)(S).listSize??1):e.data.reduce((t,e)=>t+P(e),0),stride:L,byteStride:B,rowByteLength:B,ownsBuffer:!0})],stride:L,byteStride:B,rowByteLength:B,ownsData:!0})}async function w(t){return(0,h.Qb)(t)}async function y(t){if(t.bufferLayout)throw Error("readArrowGPUVectorAsync() does not support interleaved vectors");let e=await Promise.all(t.data.map(t=>w(t)));return new c.M(e)}function x(t){return l.pe.isDictionary(t)&&t.dictionary instanceof l.YE&&l.pe.isInt(t.indices)&&t.indices.bitWidth<=32}function v(t){return l.pe.isFixedSizeList(t)&&t.listSize>4&&(l.pe.isFloat(t.children[0]?.type)||l.pe.isInt(t.children[0]?.type))}function C(t){let e=(0,f.GH)({type:t});if(e){if(!I(e))throw Error("GPUVector matrix columns require canonical Float32 column-major wgsl-storage values; use convertArrowMatrixToGPUVector() first");return"float32x4"}return l.pe.isUtf8(t)?"value-list<uint8>":x(t)?p(t.indices):p(t)}function I(t){return"float32"===t.valueType&&"column-major"===t.order&&"wgsl-storage"===t.layout}function P(t){if(!(0,d.s$)(t.type))return t.length;let e=t.valueOffsets;if(!e)return 0;let r=e[0]??0;return Math.max(0,(e[t.length]??r)-r)}function E(t){if(!t)return;let e=new Uint8Array(Math.ceil(t.length/8)),r=!1;for(let n=0;n<t.length;n++)0!==t[n]?e[n>>3]|=1<<(7&n):r=!0;return r?e:void 0}},79475(t,e,r){r.d(e,{b:()=>M});var n=r(55590),o=r(48097),a=r(50784),i=r(6116),s=r(77806),l=r(8969),u=r(66116),c=r(80316),h=r(51548);class d extends h.I{name="castData";output;constructor(t,e,r){super({source:t,inputFormat:e,outputFormat:r});let n=(0,s.Ft)(e),o=(0,s.Ft)(r);if(n.components!==o.components)throw Error("castData requires matching fixed-width component counts");this.output=new c.GL({id:`castData(${t}, ${r})`,type:o.signedDataType,size:o.components,normalized:o.normalized,format:r,length:t.length,source:this})}toString(){return`castData(${this.inputs.source}, ${this.inputs.outputFormat})`}}var f=r(3842);class p extends h.I{name="fround";output;constructor(t){(0,f.v)("uint32"===t.type),super({x:t});let{isConstant:e,size:r,length:n}=t;this.output=new c.GL({isConstant:e,type:"float32",size:r,length:n,source:this})}toString(){let{x:t}=this.inputs;return`fround(${t})_fp64Low(${t})`}}var g=r(46252),m=r(37589),b=r(24201),w=r(9624),y=r(75876),x=r(52918),v=r(938),C=r(26564),I=r(72458),P=r(56498);let E={bindings:[{name:"sourceMatrixValues",type:"read-only-storage",group:0,location:0},{name:"matrixConversionConfig",type:"read-only-storage",group:0,location:1},{name:"preparedMatrixValues",type:"storage",group:0,location:2}],attributes:[]};async function S(t,e,r={}){var o,s,u,c,h;let d,f,p,m=A(e),b=r.name||"matrix",w=r.id||b;if(e instanceof i.M){if(T(m))return B(e,m,!1);if("webgpu"!==t.type)throw Error("convertArrowMatrixToGPUVector requires WebGPU for non-canonical GPU matrices");return L(t,e,m,{name:b,id:w})}return function(t){if(t.data.some(t=>t.nullCount>0||t.children.some(t=>t.nullCount>0)))throw Error("convertArrowMatrixToGPUVector does not support nullable matrix values")}(e),B((u=t,c=T(m)?e:(o=e,s=m,d=o.data.map(t=>{let e=(0,I.DE)(t),r=new Float32Array(t.length*s.logicalComponentCount);for(let n=0;n<t.length;n++){let t=n*s.logicalComponentCount;for(let o=0;o<s.columns;o++)for(let a=0;a<s.rows;a++)r[t+o*s.rows+a]=Number(e[function(t,e,r,n){let o=e*t.physicalComponentCount;return"column-major"===t.order?o+r*t.columnStride+n:o+n*t.columns+r}(s,n,o,a)])}return(0,P.Qk)(s.shape,r).data[0]}),new g.M(d)),h={name:b,id:w},f=A(c),p=c.data.map((t,e)=>{let r=new a.kL(u,{id:`${h.id}-${e}`,usage:n.h.VERTEX|n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:(0,I.DE)(t)});return new l.L({buffer:r,dataType:c.type,format:"float32x4",length:t.length,valueLength:t.length,stride:f.physicalComponentCount,byteStride:f.byteStride,rowByteLength:f.byteStride,ownsBuffer:!0})}),new i.M({type:"data",name:h.name,dataType:c.type,format:"float32x4",data:p,stride:f.physicalComponentCount,byteStride:f.byteStride,rowByteLength:f.byteStride,ownsData:!0})),m,!0)}function B(t,e,r){let n=A(t),o=!1;return{matrix:t,vector:t,sourceInfo:e,matrixInfo:n,destroy:()=>{r&&!o&&(o=!0,t.destroy())}}}async function L(t,e,r,o){let s=(0,P.Qk)(r.shape,new Float32Array(r.logicalComponentCount)).type,u=A({type:s}),c=[],h=[];for(let[i,d]of e.data.entries()){let e=t.createBuffer({id:`${o.id}-matrix-config-${i}`,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:new Uint32Array([d.length,r.columns,r.rows,r.physicalComponentCount,r.columnStride,u.physicalComponentCount,u.columnStride,+("row-major"===r.order)])}),f=new a.kL(t,{id:`${o.id}-matrix-values-${i}`,usage:n.h.VERTEX|n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,d.length*u.byteStride)});(function(t,e,r){let n={sourceMatrixValues:r.sourceMatrixValues,matrixConversionConfig:r.matrixConversionConfig,preparedMatrixValues:r.preparedMatrixValues},o=(0,v.W)(t,{id:`${r.id}-matrix-conversion-${r.chunkIndex}`,source:function(t){let e="float64"===t.valueType?"array<vec2<u32>>":"array<f32>",r="float64"===t.valueType?`
fn readSourceScalar(scalarIndex : u32) -> f32 {
  return sub_fp64u32_to_f32(sourceMatrixValues[scalarIndex].yx, vec2<u32>(0u, 0u));
}
`:`
fn readSourceScalar(scalarIndex : u32) -> f32 {
  return sourceMatrixValues[scalarIndex];
}
`;return`
@group(0) @binding(0) var<storage, read> sourceMatrixValues : ${e};
@group(0) @binding(1) var<storage, read> matrixConversionConfig : array<u32>;
@group(0) @binding(2) var<storage, read_write> preparedMatrixValues : array<f32>;

${r}

fn getSourceScalarIndex(matrixIndex : u32, columnIndex : u32, rowIndex : u32) -> u32 {
  let columns = matrixConversionConfig[1];
  let sourcePhysicalComponentCount = matrixConversionConfig[3];
  let sourceColumnStride = matrixConversionConfig[4];
  let sourceOrder = matrixConversionConfig[7];
  let matrixOffset = matrixIndex * sourcePhysicalComponentCount;
  if (sourceOrder == 0u) {
    return matrixOffset + columnIndex * sourceColumnStride + rowIndex;
  }
  return matrixOffset + rowIndex * columns + columnIndex;
}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId : vec3<u32>) {
  let scalarIndex = globalInvocationId.x;
  let rowCount = matrixConversionConfig[0];
  let columns = matrixConversionConfig[1];
  let rows = matrixConversionConfig[2];
  let targetPhysicalComponentCount = matrixConversionConfig[5];
  let targetColumnStride = matrixConversionConfig[6];
  if (scalarIndex >= rowCount * targetPhysicalComponentCount) {
    return;
  }

  let matrixIndex = scalarIndex / targetPhysicalComponentCount;
  let matrixScalarIndex = scalarIndex % targetPhysicalComponentCount;
  let columnIndex = matrixScalarIndex / targetColumnStride;
  let rowIndex = matrixScalarIndex % targetColumnStride;
  if (columnIndex >= columns || rowIndex >= rows) {
    preparedMatrixValues[scalarIndex] = 0.0;
    return;
  }
  preparedMatrixValues[scalarIndex] = readSourceScalar(
    getSourceScalarIndex(matrixIndex, columnIndex, rowIndex)
  );
}
`}(e),..."float64"===e.valueType?{modules:[C.d]}:{},shaderLayout:E});if(r.scalarCount>0){let e=t.beginComputePass({});o.dispatch(e,{x:Math.ceil(r.scalarCount/64),bindings:n}),e.end(),t.submit()}o.destroy()})(t,r,{id:o.id,chunkIndex:i,scalarCount:d.length*u.physicalComponentCount,sourceMatrixValues:function(t){var e;return{buffer:(e=t).buffer instanceof a.kL?e.buffer.buffer:e.buffer,offset:t.byteOffset,size:t.length*t.byteStride}}(d),matrixConversionConfig:e,preparedMatrixValues:f}),c.push(new l.L({buffer:f,dataType:s,format:"float32x4",length:d.length,stride:u.physicalComponentCount,byteStride:u.byteStride,rowByteLength:u.byteStride,ownsBuffer:!0})),h.push(e)}for(let e of(await O(t),h))e.destroy();return B(new i.M({type:"data",name:o.name,dataType:s,format:"float32x4",data:c,stride:u.physicalComponentCount,byteStride:u.byteStride,rowByteLength:u.byteStride,ownsData:!0}),r,!0)}function A(t){let e=(0,P.GH)(t);if(!e)throw Error("convertArrowMatrixToGPUVector requires FixedSizeList<Float32|Float64> matrix metadata");return e}function T(t){return"float32"===t.valueType&&"column-major"===t.order&&"wgsl-storage"===t.layout}async function O(t){let e=t.handle?.queue;await e?.onSubmittedWorkDone?.()}var _=r(68482),k=r(59858);async function M(t,e,r={}){var n,o,a,l,c,h;let d=function(t,e,r={}){let n,o,a;var l,c,h,d,f,p,b,w,v,C=r;if(C.format&&C.formats)throw Error("Arrow conversion accepts either format or formats, not both");if(C.formats?.length===0)throw Error("Arrow conversion formats must not be empty");let I=function(t,e,r){if("auto"!==e)return e;if((0,P.GH)(t))return"matrix";if((0,_.nH)(t,r))return"temporal";let n=F(t);return n&&m.pe.isUtf8(n)?"text":n&&m.pe.isDictionary(n)?"dictionary":"numeric"}(e,r.semantic??"auto",r.field),E=R(e,I),S=function(t,e,r,n){let o=function(t,e,r,n){switch(t){case"color":if(!(0,y.wr)(e))throw Error(`Arrow color conversion does not support ${U(e)}`);return"unorm8x4";case"matrix":if(!(0,P.GH)(e))throw Error("Arrow matrix conversion requires matrix metadata");return"float32x4";case"temporal":{let t=(0,_.nH)(e,n);if(!t)throw Error("Arrow temporal conversion requires a temporal type");return t.variableLength?"vertex-list<float32>":"float32"}default:if(r)return r;if("numeric"===t&&e instanceof g.M)return function(t){let e=m.pe.isList(t),r=e?t.children[0]?.type:t;if(!r)throw Error(`Arrow numeric conversion does not support ${t}`);let n=m.pe.isFixedSizeList(r)?r.listSize:1,o=m.pe.isFixedSizeList(r)?r.children[0]?.type:r;if(!o||!m.pe.isBool(o)&&!m.pe.isInt(o)&&!m.pe.isFloat(o))throw Error(`Arrow numeric conversion does not support ${t}`);if(e&&n>4)throw Error("Arrow variable-length numeric conversion supports at most four components");let a=m.pe.isBool(o)?"uint8":"float32";if(e){let t=1===n?a:`${a}x${n}`;return`vertex-list<${t}>`}return n>4?`fixed-size-list<${a},${n}>`:1===n?a:`${a}x${n}`}(e.type);throw Error(`Arrow direct conversion does not support ${U(e)}`)}}(e,r,t,n.field);if("color"===e){let e=n.format??n.formats?.find(t=>["unorm8x4","float16x4","float32x4"].includes(t))??"unorm8x4";if(!["preserve","unorm8x4","float16x4","float32x4"].includes(e))throw Error("Unsupported color output format");if(n.formats&&!n.formats.includes(e))throw Error("No compatible color output format");return(0,u.Ww)(r instanceof g.M&&m.pe.isFixedSizeList(r.type)&&r.type.children[0].type instanceof m.cS?"float16x4":t??o,{format:e,acceptedFormats:n.acceptedFormats,fallbackFormat:n.fallbackFormat})}if("preserve"===n.format)throw Error("preserve requires color semantics");let a=n.format?[n.format]:n.formats;if(!a?.length)return o;if("matrix"===e||"temporal"===e){if(!a.includes(o))throw Error(`Arrow ${e} conversion produces ${o}, not ${a.join(", ")}`);return o}let i=a.find(r=>t?D(t,r)||"numeric"===e&&V(t,r):"numeric"===e&&V(o,r));if(!i)throw Error(`Arrow direct conversion cannot lower ${t??U(r)} to ${a.join(", ")}`);return i}(E,I,e,r),B=function(t,e,r,n){if("color"===n)return e&&D(e,r)?t instanceof i.M?e===r?"borrow":"convert-color":e===r?"upload":"reinterpret-upload":"convert-color";if("matrix"===n)return e?t instanceof i.M?"borrow":"upload":"convert-matrix";if("temporal"===n)return"convert-temporal";if("numeric"===n&&(!e||!D(e,r))){if(t instanceof i.M)throw Error("GPU-resident numeric conversion does not support format-changing casts");return"convert-numeric"}if(t instanceof i.M){if(e!==r)throw Error("GPU-resident direct conversion requires an exact target format");return"borrow"}return e===r?"upload":"reinterpret-upload"}(e,E,S,I);(function(t,e){if("require-zero-copy"===e&&"borrow"!==t)throw Error(`Arrow conversion requires ${t}; zero-copy was required`);if("require-direct"===e&&"borrow"!==t&&"upload"!==t&&"reinterpret-upload"!==t)throw Error(`Arrow conversion requires ${t}; direct conversion was required`)})(B,r.policy??"auto"),function(t,e){if(t instanceof i.M)return;let r=t.data.some(t=>t.nullCount>0||t.children.some(t=>t.nullCount>0));if(r&&("matrix"===e||"temporal"===e))throw Error(`Arrow ${e} conversion does not support nullable values`);if(r&&"dictionary"===e)throw Error("Arrow dictionary direct upload does not support nullable indices")}(e,I);let L=e.data.length,A="temporal"===I?(0,_.nH)(e,r.field):void 0,T=(l=e)instanceof g.M?(0,x.R)(l):l.data.reduce((t,e)=>t+(e.valueLength||e.length)*e.byteStride,0),O=(c=t,h=B,d=e,f=r.policy??"auto","borrow"===h?"none":"upload"===h||"reinterpret-upload"===h?"upload":"convert-matrix"===h&&d instanceof g.M||"convert-color"===h&&d instanceof g.M&&"prefer-cpu"===f?"cpu":"convert-numeric"===h&&d instanceof g.M&&"webgpu"===c.type&&"prefer-cpu"!==f&&(R(d,"numeric")||Y(d.type))?"webgpu":"convert-numeric"===h||"convert-temporal"===h&&"prefer-cpu"===f?"cpu":"webgpu"===c.type?"webgpu":"cpu"),k=function(t,e,r){if("matrix"===r){let e=(0,P.GH)(t).columns;return t.length*e*4*Float32Array.BYTES_PER_ELEMENT}let n=(0,s.Ft)(e);return(n.vertexList||n.valueList?t instanceof i.M?t.valueLength:t.data.reduce((t,e)=>{if(!m.pe.isList(e.type))return t+e.length;let r=e.valueOffsets;return t+((r?.[e.length]??0)-(r?.[0]??0))},0):t.length)*n.byteLength}(e,S,I)*("webgpu"===O&&e instanceof g.M&&Y(e.type)?2:1),M=A&&e instanceof g.M?e.data.reduce((t,e)=>{let r=m.pe.isList(e.type)?e.valueOffsets:void 0;return t+Math.max(4,(r?r[e.length]-r[0]:e.length)*A.bitWidth/8)},0):Math.max(T,L*Float64Array.BYTES_PER_ELEMENT),N=B.startsWith("convert-"),$=e instanceof g.M;return{semantic:I,strategy:B,backend:O,sourceType:U(e),...E?{sourceFormat:E}:{},targetFormat:S,length:e.length,chunkCount:L,preservesDataChunks:!1!==r.preserveDataChunks||N,borrowsSource:"borrow"===B,cost:{sourceByteLength:T,targetByteLength:k,temporaryGPUByteLength:$&&"webgpu"===O?M+("convert-temporal"===B?3*L*Uint32Array.BYTES_PER_ELEMENT:0):0,uploadCount:$?L:0,cpuPassCount:N&&"cpu"===O?1:0,gpuPassCount:N&&("webgpu"===O||"webgl"===O)?1:0,allocatesGPUStorage:"borrow"!==B},reasons:"webgpu"===O&&e instanceof g.M&&Y(e.type)?["Arrow binary64 bytes upload unchanged","GPGPU fround splits high and residual-low Float32 lanes in one pass"]:function(t,e,r,n,o){switch(t){case"borrow":return["source is already GPU-resident","source and target formats match"];case"upload":return["Arrow physical layout already matches the target GPU format"];case"reinterpret-upload":return[`${r} bytes are directly compatible with ${n}`];default:return[`${e} semantics require canonical ${n} output`,`${o} conversion selected`]}}(B,I,E,S,O),warnings:(p=e,b=B,w=S,v=O,n=[],"convert-color"===b&&("unorm8x4"===w&&n.push("floating color channels are clamped and quantized to RGBA8"),"float16x4"===w&&n.push("color channels are rounded to binary16; out-of-range values may overflow")),a=(o=F(p))?z(o):void 0,"convert-numeric"===b&&a&&(m.pe.isFloat(a)&&2===a.precision||m.pe.isInt(a)&&64===a.bitWidth)&&n.push(`64-bit source values are rounded to ${w}`),"convert-numeric"===b&&(0,s.Ft)(w).normalized&&n.push(`values are clamped to the normalized ${w} range`),b.startsWith("convert-")&&"cpu"===v&&n.push("conversion runs on the CPU for this source/device combination"),n)}}(t,e,r),f=r.name??(e instanceof i.M?e.name:"vector"),p=r.id??f;switch(d.strategy){case"borrow":return q(e,d,!1);case"upload":case"reinterpret-upload":return q((0,k.ft)(t,e,{...r.bufferProps,name:f,format:d.targetFormat,preserveDataChunks:r.preserveDataChunks??!0}),d,!0);case"convert-color":return q(e instanceof i.M?await (0,y.Km)(t,e,{name:f,format:d.targetFormat}):await (0,y.DR)(t,e,{name:f,format:d.targetFormat,preferCPU:"cpu"===d.backend,bufferProps:r.bufferProps}),d,!0);case"convert-numeric":{let a,i,l;if("webgpu"===d.backend){let n=Y(e.type)?await N(t,e,d,{name:f,bufferProps:r.bufferProps}):await $(t,e,d,{name:f,bufferProps:r.bufferProps});return"residualVector"in n?q(n.vector,d,!0,n.residualVector):q(n,d,!0)}let u=(n=e,o=d.targetFormat,a=j(n.type,o),i=(0,s.Ft)(o),l=n.data.map(t=>{let e=new g.M([t]),r=Array.from({length:t.length},(t,r)=>(function t(e,r){if(null==e)return null;if("boolean"==typeof e||"number"==typeof e||"bigint"==typeof e)return function(t,e){let r=Number(t);if(!Number.isFinite(r)||!e.integer&&!e.normalized)return r;let{minimum:n,maximum:o}=function(t){switch(t){case"sint8":return{minimum:-127,maximum:127};case"sint16":return{minimum:-32767,maximum:32767};case"sint32":return{minimum:-0x80000000,maximum:0x7fffffff};case"uint8":return{minimum:0,maximum:255};case"uint16":return{minimum:0,maximum:65535};case"uint32":return{minimum:0,maximum:0xffffffff};default:throw Error(`Arrow numeric integer conversion does not support ${t}`)}}(e.signedDataType),a=e.normalized?r*(e.signed,o):r;return Math.round(Math.min(o,Math.max(n,a)))}(e,r);if("object"==typeof e&&Symbol.iterator in e)return Array.from(e,e=>t(e,r));throw Error("Arrow numeric conversion encountered a non-numeric value")})(e.get(r),i));return(0,b.bI)(r,a).data[0]}),new g.M(l));return q((0,k.ft)(t,u,{...r.bufferProps,name:f,format:d.targetFormat,preserveDataChunks:!0}),d,!0)}case"convert-matrix":return a=await S(t,e,{name:f,id:p}),l=d,{vector:a.vector,plan:l,matrixInfo:a.matrixInfo,ownsVector:!0,destroy:a.destroy};case"convert-temporal":return c=await (0,_.DC)(t,e,{...r.temporal,preferGPU:"prefer-cpu"!==r.policy&&("prefer-gpu"===r.policy||r.temporal?.preferGPU),name:f,id:p,field:r.field}),h=d,{vector:c.vector,plan:h,field:c.field,temporalInfo:c.temporalInfo,ownsVector:!0,destroy:c.destroy}}}function R(t,e){if(t instanceof i.M)return t.format;if("matrix"===e){var r;let e=(0,P.GH)(t);return e&&"float32"===(r=e).valueType&&"column-major"===r.order&&"wgsl-storage"===r.layout?"float32x4":void 0}if("temporal"!==e)try{return(0,k.kv)(t.type)}catch{return}}function D(t,e){let r=(0,s.Ft)(t),n=(0,s.Ft)(e);return r.signedDataType===n.signedDataType&&r.components===n.components&&r.elementByteLength===n.elementByteLength&&r.byteLength===n.byteLength&&r.vertexList===n.vertexList&&r.valueList===n.valueList&&r.fixedSizeList===n.fixedSizeList&&r.listSize===n.listSize}function V(t,e){let r=(0,s.Ft)(t),n=(0,s.Ft)(e);return r.components===n.components&&r.vertexList===n.vertexList&&r.valueList===n.valueList&&r.fixedSizeList===n.fixedSizeList&&r.listSize===n.listSize}function F(t){return t instanceof i.M?t.dataType:t.type}function U(t){let e=F(t);return e?String(e):t instanceof i.M?t.format??"GPUVector":"ArrowVector"}async function N(t,e,r,u){let h=(0,s.Ft)(r.targetFormat),d=(0,s.l$)(r.targetFormat),f=(0,s.Ft)(d);if("float32"!==f.signedDataType)throw Error("GPU Float64 conversion requires a Float32 target format");let g=j(e.type,r.targetFormat),b=h.vertexList||h.valueList,w=f.components*(h.fixedSizeList?h.listSize:1),y=[],x=[],v=[];try{for(let[i,s]of e.data.entries()){let e=function(t){let e=m.pe.isList(t.type)?(0,I.TO)(t):(0,I.DE)(t);if(!(e instanceof Float64Array))throw Error("GPU Float64 conversion requires Float64 Arrow value storage");return e}(s),h=new a.kL(t,{...u.bufferProps,id:`${u.name}-float64-source-${i}`,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,...e.byteLength>0?{data:e}:{byteLength:Float64Array.BYTES_PER_ELEMENT}}),d=b?function(t){if(!m.pe.isList(t.type))return t.length;let e=t.valueOffsets;return(e?.[t.length]??0)-(e?.[0]??0)}(s):s.length,f=new c.GL({id:`${u.name}-float64-source-${i}`,type:"uint32",size:2*w,buffer:h,offset:0,stride:w*Float64Array.BYTES_PER_ELEMENT,length:d}),C=new p((0,c.uy)(f)).output,P=t.createBuffer({...u.bufferProps,id:`${u.name}-${i}`,...(0,o.T)(t),byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,C.byteLength)});v.push(P),C.setTargetBuffer({buffer:P});try{await C.evaluate(t)}finally{C.destroy(),f.destroy(),h.destroy()}let E=w*Float64Array.BYTES_PER_ELEMENT,S=w*Float32Array.BYTES_PER_ELEMENT,B=(0,I.OM)(s),L={buffer:P,dataType:g,format:r.targetFormat,length:s.length,valueLength:b?d:void 0,stride:w,byteStride:E,rowByteLength:S,nullBitmap:B?.nullBitmap,valueOffsets:s.valueOffsets,...B?{readbackMetadata:G(B,d*S)}:{},...b?{valueByteLength:d*S}:{}};y.push(new l.L({...L,ownsBuffer:!0})),x.push(new l.L({...L,byteOffset:S,ownsBuffer:!1}))}}catch(t){for(let t of y)t.destroy();for(let t of v.slice(y.length))t.destroy();throw t}return{vector:new i.M({type:"data",name:u.name,dataType:g,format:r.targetFormat,data:y,ownsData:!0}),residualVector:new i.M({type:"data",name:`${u.name}64Low`,dataType:g,format:r.targetFormat,data:x,ownsData:!1})}}async function $(t,e,r,n){let a=r.sourceFormat;if(!a)throw Error("GPU numeric conversion requires a directly uploadable source format");let u=(0,s.l$)(a),h=(0,s.l$)(r.targetFormat),f=(0,s.Ft)(a),p=(0,s.Ft)(u),g=(0,s.Ft)(r.targetFormat),m=(0,s.Ft)(h),b=j(e.type,r.targetFormat),w=(0,k.ft)(t,e,{...n.bufferProps,name:`${n.name}-source`,format:a,preserveDataChunks:!0}),y=[],x=[];try{for(let[e,a]of w.data.entries()){let i=f.vertexList||f.valueList||f.fixedSizeList,s=new c.GL({id:`${n.name}-source-${e}`,type:p.signedDataType,size:p.components,normalized:p.normalized,buffer:a.buffer,format:u,offset:a.byteOffset,stride:i?p.elementByteLength:a.byteStride,length:i?a.valueLength:a.length}),w=function(t,e){let r=(0,c.uy)(t),n=e.inputFormat??r.format;if(!n)throw Error("castData requires an input format");return new d(r,n,e.outputFormat).output}(s,{inputFormat:u,outputFormat:h}),v=t.createBuffer({...n.bufferProps,id:`${n.name}-${e}`,...(0,o.T)(t,"uint16"===h?"uint16":"uint32"),byteLength:Math.max(4,w.byteLength)});x.push(v),w.setTargetBuffer({buffer:v});try{await w.evaluate(t,{format:h})}finally{w.destroy(),s.destroy()}let C=g.vertexList||g.valueList,I=g.fixedSizeList,P=C||I?m.elementByteLength*(I?g.listSize:1):g.byteLength,E=a.readbackMetadata;y.push(new l.L({buffer:v,dataType:b,format:r.targetFormat,length:a.length,valueLength:a.valueLength,stride:g.components*(g.listSize??1),byteStride:P,rowByteLength:P,ownsBuffer:!0,nullBitmap:a.nullBitmap,valueOffsets:a.valueOffsets,...E?{readbackMetadata:G(E,w.byteLength)}:{},...C?{valueByteLength:w.byteLength}:{}}))}}catch(t){for(let t of y)t.destroy();for(let t of x.slice(y.length))t.destroy();throw t}finally{w.destroy()}return new i.M({type:"data",name:n.name,dataType:b,format:r.targetFormat,data:y,ownsData:!0})}function G(t,e){return"object"==typeof t&&null!==t&&"kind"in t&&"variable-length-attribute"===t.kind?{...t,valueByteLength:e}:t}function j(t,e){return function t(e,r){if(m.pe.isList(e))return new m.B8(new w.D(e.children[0]?.name??"item",t(e.children[0].type,r),!0,new Map(e.children[0]?.metadata)));if(m.pe.isFixedSizeList(e))return new m.Y1(e.listSize,new w.D(e.children[0]?.name??"item",r,!0,new Map(e.children[0]?.metadata)));if(m.pe.isBool(e)||m.pe.isInt(e)||m.pe.isFloat(e))return r;throw Error(`Arrow numeric conversion does not support ${e}`)}(t,function(t){switch(t){case"float16":return new m.cS;case"float32":return new m.gh;case"sint8":return new m.AY;case"sint16":return new m.Vw;case"sint32":return new m.P_;case"uint8":return new m.l5;case"uint16":return new m.yv;case"uint32":return new m.SS}}((0,s.Ft)(e).signedDataType))}function z(t){if(m.pe.isList(t)||m.pe.isFixedSizeList(t)){let e=t.children[0]?.type;return e?z(e):void 0}return m.pe.isBool(t)||m.pe.isInt(t)||m.pe.isFloat(t)?t:void 0}function Y(t){return z(t)instanceof m.$G}function q(t,e,r,n){let o=!1;return{vector:t,plan:e,...n?{residualVector:n}:{},ownsVector:r,destroy:()=>{r&&!o&&(o=!0,n?.destroy(),t.destroy())}}}},56498(t,e,r){r.d(e,{GH:()=>g,Qk:()=>f});var n=r(14957),o=r(37589),a=r(9624),i=r(46252),s=r(72458);let l="visgl:matrix-shape",u="visgl:matrix-order",c="visgl:matrix-layout",h=n.Hg,d=n.Hg;function f(t,e,r){return e instanceof Float64Array?p(t,e,new o.$G,r):p(t,e,new o.gh,r)}function p(t,e,r,n){var s;let f=m(t,n?.layout||"wgsl-storage");if(e.length%f.logicalComponentCount!=0)throw Error(`Matrix values length ${e.length} must be divisible by ${f.logicalComponentCount}`);let p=function(t,e){if(e.columnStride===e.rows)return t;let r=b(t,t.length/e.logicalComponentCount*e.physicalComponentCount),n=0,o=0;for(;n<t.length;)for(let a=0;a<e.columns;a++)r.set(t.subarray(n,n+e.rows),o),n+=e.rows,o+=e.columnStride;return r}(n?.order==="row-major"?function(t,e){let r=b(t,t.length);for(let n=0;n<t.length;n+=e.logicalComponentCount)for(let o=0;o<e.rows;o++)for(let a=0;a<e.columns;a++)r[n+a*e.rows+o]=t[n+o*e.columns+a];return r}(e,f):(s=e)instanceof Float64Array?new Float64Array(s):new Float32Array(s),f),g=h({type:r,length:p.length,data:p}),w=new a.D("value",r,!1,new Map([[l,f.shape],[u,"column-major"],[c,f.layout]])),y=d({type:new o.Y1(f.physicalComponentCount,w),length:p.length/f.physicalComponentCount,nullCount:0,nullBitmap:null,child:g});return(0,i.g)(y)}function g(t){let e="type"in t?t.type:(0,s.wX)(t);if(!o.pe.isFixedSizeList(e))return null;let r=e.children[0]?.metadata,n=r?.get(l),a=r?.get(u)||"column-major",i=r?.get(c),h=e.children[0]?.type;if(!n||!i||!(h instanceof o.gh||h instanceof o.$G))return null;let d=m(n,i,a,h);return e.listSize===d.physicalComponentCount?d:null}function m(t,e,r="column-major",n=new o.gh){let[a,i]=function(t){switch(t){case"mat2x2":return[2,2];case"mat2x3":return[2,3];case"mat3x2":return[3,2];case"mat3x3":return[3,3];case"mat4x3":return[4,3];case"mat3x4":return[3,4];case"mat4x4":return[4,4];default:throw Error(`Unsupported Arrow matrix shape ${t}`)}}(t),s="wgsl-storage"===e&&3===i?4:i,l=a*s;return{shape:t,columns:a,rows:i,order:r,layout:e,valueType:n instanceof o.$G?"float64":"float32",logicalComponentCount:a*i,physicalComponentCount:l,columnStride:s,byteStride:l*(n instanceof o.$G?Float64Array.BYTES_PER_ELEMENT:Float32Array.BYTES_PER_ELEMENT)}}function b(t,e){return t instanceof Float64Array?new Float64Array(e):new Float32Array(e)}},68482(t,e,r){r.d(e,{DC:()=>C,nH:()=>v});var n=r(55590),o=r(938),a=r(50784),i=r(6116),s=r(8969),l=r(14957),u=r(37589),c=r(46252),h=r(9624),d=r(34603),f=r(46734),p=r(59858),g=r(72458);let m="visgl:temporal-origin",b="visgl:temporal-origin-policy",w=l.Hg,y=l.Hg,x={bindings:[{name:"sourceTemporalValues",type:"read-only-storage",group:0,location:0},{name:"temporalConversionConfig",type:"read-only-storage",group:0,location:1},{name:"preparedTemporalValues",type:"storage",group:0,location:2}],attributes:[]};function v(t,e){let r=B(t),n=L(r);if(!n)return null;let o=A(r,e),a=o?.metadata;return{...T(n),variableLength:u.pe.isList(r),...a?.has(m)?{origin:_(a.get(m),n)}:{},...a?.has(b)?{originPolicy:a.get(b)}:{}}}async function C(t,e,r={}){var o,l,d,f,g,x,v,T,O,D,V;let F,U,N,$,G,j,z,Y=S(e,r.field),q=function(t,e,r){let n=B(t);if(void 0!==r.origin)return _(r.origin.toString(),L(n));if(void 0!==e.origin)return e.origin;if("duration"===e.kind)return 64===e.bitWidth?0n:0;if(t instanceof i.M)throw Error("GPU-resident absolute temporal input requires an explicit or persisted origin");return function(t){for(let e of t.data){k(e);let t=M(e);if(t.length>0)return t[0]}}(t)??(64===e.bitWidth?0n:0)}(e,Y,r),W={...Y,origin:q,originPolicy:"duration"===Y.kind?"zero":"first-valid"},X=(o=e,l=W,d=r.field,U=B(o),N=(f=l,(F=new Map(A(U,d)?.metadata)).set("visgl:temporal-kind",f.kind),F.set("visgl:temporal-unit",f.unit),F.set(m,f.origin.toString()),F.set(b,f.originPolicy),f.timezone&&F.set("visgl:temporal-timezone",f.timezone),F),$=A(U,d),G=(g=U,x=new h.D($?.name||"value",new u.gh,!1,N),u.pe.isList(g)?new u.B8(x):new u.gh),new h.D(d?.name||"temporal",G,!1,N)),H=r.name||"temporal",K=r.id||H;if((r.preferGPU??"webgpu"===t.type)&&"webgpu"===t.type){let r,o,l=e instanceof i.M?e:(v=t,T=e,O={name:`${H}-source`,id:K},r=S(T),o=T.data.map((t,e)=>{k(t);let o=M(t),i=r.bitWidth/8;return new s.L({buffer:new a.kL(v,{id:`${O.id}-temporal-source-values-${e}`,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:o}),dataType:t.type,format:u.pe.isList(t.type)?"vertex-list<float32>":"float32",length:t.length,stride:1,byteStride:i,rowByteLength:i,ownsBuffer:!0,...u.pe.isList(t.type)?{valueOffsets:R(t),valueByteLength:o.byteLength,readbackMetadata:{kind:"temporal-list",valueOffsets:R(t),valueByteLength:o.byteLength}}:{}})}),new i.M({type:"data",name:O.name,dataType:T.type,format:u.pe.isList(T.type)?"vertex-list<float32>":"float32",data:o,stride:1,byteStride:r.bitWidth/8,rowByteLength:r.bitWidth/8,ownsData:!0})),c=!(e instanceof i.M);try{return await E(t,l,W,X,{name:H,id:K})}finally{c&&l.destroy()}}if(e instanceof i.M)throw Error("convertArrowTemporalToGPUVector requires WebGPU for GPU-resident temporal input");let J=(D=e,V=W,j=function(t){return t.type}(X),z=D.data.map(t=>{k(t);let e=M(t),r=new Float32Array(e.length);for(let t=0;t<e.length;t++){var n,o;r[t]=(n=e[t],o=V.origin,"bigint"==typeof n?Number(n-o):n-o)}if(u.pe.isList(j)){let e=w({type:new u.gh,length:r.length,data:r});return y({type:j,length:t.length,nullCount:0,nullBitmap:null,valueOffsets:R(t),child:e})}return w({type:j,length:r.length,data:r})}),new c.M(z));return I((0,p.ft)(t,J,{name:H,id:K,format:P(W)}),X,W,!0)}function I(t,e,r,n){let o=!1;return{temporal:t,vector:t,field:e,temporalInfo:r,destroy:()=>{n&&!o&&(o=!0,t.destroy())}}}function P(t){return t.variableLength?"vertex-list<float32>":"float32"}async function E(t,e,r,l,c){let h=l.type,d=P(r),f=B(e),p=[],g=[];for(let[i,l]of e.data.entries()){let e=function(t,e){if(!u.pe.isList(t))return;let r=e.readbackMetadata;if(r?.kind!=="temporal-list")throw Error("GPU-resident temporal list input requires copied Arrow value offsets");return r.valueOffsets}(f,l),m=e?e[e.length-1]??0:l.length,b=t.createBuffer({id:`${c.id}-temporal-config-${i}`,usage:n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,data:function(t,e){let r=function(t,e){if(32===e)return[new Uint32Array(new Int32Array([t]).buffer)[0],0];let r=BigInt.asUintN(64,t);return[Number(4294967295n&r),Number(r>>32n&4294967295n)]}(t.origin,t.bitWidth);return new Uint32Array([e,r[0],r[1]])}(r,m)}),w=new a.kL(t,{id:`${c.id}-temporal-values-${i}`,usage:n.h.VERTEX|n.h.STORAGE|n.h.COPY_DST|n.h.COPY_SRC,byteLength:Math.max(Float32Array.BYTES_PER_ELEMENT,m*Float32Array.BYTES_PER_ELEMENT)});(function(t,e,r){let n={sourceTemporalValues:r.sourceTemporalValues,temporalConversionConfig:r.temporalConversionConfig,preparedTemporalValues:r.preparedTemporalValues},a=(0,o.W)(t,{id:`${r.id}-temporal-conversion-${r.chunkIndex}`,source:function(t){let e=64===t?`
fn readRelativeTemporalValue(scalarIndex : u32) -> f32 {
  let valueBits = sourceTemporalValues[scalarIndex];
  let originBits = vec2<u32>(temporalConversionConfig[1], temporalConversionConfig[2]);
  let deltaLow = valueBits.x - originBits.x;
  let borrow = select(0u, 1u, valueBits.x < originBits.x);
  let deltaHigh = valueBits.y - originBits.y - borrow;
  let isNegative = (deltaHigh & 0x80000000u) != 0u;
  var magnitudeLow = deltaLow;
  var magnitudeHigh = deltaHigh;
  if (isNegative) {
    magnitudeLow = ~deltaLow + 1u;
    let carry = select(0u, 1u, magnitudeLow == 0u);
    magnitudeHigh = ~deltaHigh + carry;
  }
  let magnitude = f32(magnitudeHigh) * 4294967296.0 + f32(magnitudeLow);
  return select(magnitude, -magnitude, isNegative);
}
`:`
fn readRelativeTemporalValue(scalarIndex : u32) -> f32 {
  return f32(sourceTemporalValues[scalarIndex] - bitcast<i32>(temporalConversionConfig[1]));
}
`;return`
@group(0) @binding(0) var<storage, read> sourceTemporalValues : ${64===t?"array<vec2<u32>>":"array<i32>"};
@group(0) @binding(1) var<storage, read> temporalConversionConfig : array<u32>;
@group(0) @binding(2) var<storage, read_write> preparedTemporalValues : array<f32>;

${e}

@compute @workgroup_size(64)
fn main(@builtin(global_invocation_id) globalInvocationId : vec3<u32>) {
  let scalarIndex = globalInvocationId.x;
  if (scalarIndex >= temporalConversionConfig[0]) {
    return;
  }
  preparedTemporalValues[scalarIndex] = readRelativeTemporalValue(scalarIndex);
}
`}(e.bitWidth),shaderLayout:x});if(r.scalarCount>0){let e=t.beginComputePass({});a.dispatch(e,{x:Math.ceil(r.scalarCount/64),bindings:n}),e.end(),t.submit()}a.destroy()})(t,r,{id:c.id,chunkIndex:i,scalarCount:m,sourceTemporalValues:function(t,e){var r;return{buffer:(r=t).buffer instanceof a.kL?r.buffer.buffer:r.buffer,offset:t.byteOffset,...e>0?{size:e}:{}}}(l,function(t){let e=t.readbackMetadata;return e?.kind==="temporal-list"?e.valueByteLength:t.length*t.byteStride}(l)),temporalConversionConfig:b,preparedTemporalValues:w}),p.push(new s.L({buffer:w,dataType:h,format:d,length:l.length,stride:1,byteStride:Float32Array.BYTES_PER_ELEMENT,rowByteLength:Float32Array.BYTES_PER_ELEMENT,ownsBuffer:!0,...e?{valueOffsets:e,valueByteLength:m*Float32Array.BYTES_PER_ELEMENT,readbackMetadata:{kind:"variable-length-attribute",valueOffsets:e,nullCount:0,valueByteLength:m*Float32Array.BYTES_PER_ELEMENT}}:{}})),g.push(b)}for(let e of(await D(t),g))e.destroy();return I(new i.M({type:"data",name:c.name,dataType:h,format:d,data:p,stride:1,byteStride:Float32Array.BYTES_PER_ELEMENT,rowByteLength:Float32Array.BYTES_PER_ELEMENT,ownsData:!0}),l,r,!0)}function S(t,e){let r=v(t,e);if(!r)throw Error("convertArrowTemporalToGPUVector requires Date, Time, Timestamp, Duration, or List thereof");return r}function B(t){return"type"in t?t.type:(0,g.wX)(t)}function L(t){let e=u.pe.isList(t)?t.children[0]?.type:t;return e&&(u.pe.isDate(e)||u.pe.isTime(e)||u.pe.isTimestamp(e)||u.pe.isDuration(e))?e:null}function A(t,e){return u.pe.isList(t)?t.children[0]:e}function T(t){return u.pe.isDate(t)?{kind:"date",unit:t.unit===d.f.DAY?"day":"millisecond",bitWidth:t.unit===d.f.DAY?32:64}:u.pe.isTime(t)?{kind:"time",unit:O(t.unit),bitWidth:t.bitWidth}:u.pe.isTimestamp(t)?{kind:"timestamp",unit:O(t.unit),bitWidth:64,timezone:t.timezone}:{kind:"duration",unit:O(t.unit),bitWidth:64}}function O(t){switch(t){case f.y.SECOND:return"second";case f.y.MILLISECOND:return"millisecond";case f.y.MICROSECOND:return"microsecond";case f.y.NANOSECOND:return"nanosecond"}}function _(t,e){return 64===T(e).bitWidth?BigInt(t):Number(t)}function k(t){if(t.nullCount>0)throw Error("convertArrowTemporalToGPUVector does not support nullable temporal rows");if(u.pe.isList(t.type)&&(t.children[0]?.nullCount??0)>0)throw Error("convertArrowTemporalToGPUVector does not support nullable temporal values")}function M(t){var e;let r;if(u.pe.isList(t.type)){let e=t.children[0];if(!e)return new Int32Array(0);let r=e.values;if(!r)return e.type.ArrayType===BigInt64Array?new BigInt64Array(0):new Int32Array(0);let n=t.valueOffsets;if(!n)throw Error("convertArrowTemporalToGPUVector list input requires Arrow value offsets");let o=n[0]??0,a=n[t.length]??o,i=e.offset??0;return r.subarray(i+o,i+a)}return(r=(e=t).values)?r.subarray(0,e.length):e.type.ArrayType===BigInt64Array?new BigInt64Array(0):new Int32Array(0)}function R(t){let e=t.valueOffsets;if(!e)throw Error("convertArrowTemporalToGPUVector list input requires Arrow value offsets");let r=e[0]??0;return Int32Array.from(e,t=>t-r)}async function D(t){let e=t.handle?.queue;await e?.onSubmittedWorkDone?.()}},52918(t,e,r){r.d(e,{R:()=>d,p:()=>p});var n=r(14957),o=r(37589),a=r(46252),i=r(9624),s=r(67144),l=r(72458),u=r(62105);let c=n.Hg,h=n.Hg;function d(t){return function t(e,r){if(r.has(e))return 0;r.add(e);let n=0;for(let o of e.data)n+=function e(r,n){let o=0;for(let t of r.buffers)o+=f(t);for(let t of r.variadicBuffers??[])o+=f(t);for(let t of r.children)o+=e(t,n);return r.dictionary&&(o+=t(r.dictionary,n)),o}(o,r);return n}(t,new Set)}function f(t){if(!t)return 0;if(ArrayBuffer.isView(t)||t instanceof ArrayBuffer||"u">typeof SharedArrayBuffer&&t instanceof SharedArrayBuffer)return t.byteLength;if("object"==typeof t&&"byteLength"in t){let{byteLength:e}=t;return"number"==typeof e?e:0}return 0}function p(t,e,r){let{numericType:n,rowStride:s}=function(t){if(o.pe.isFixedSizeList(t.type)){let e=t.type.children[0].type;if(!m(e))throw Error(`expandArrowVector does not support Arrow type ${e}`);if(t.type.listSize<1||t.type.listSize>4)throw Error("expandArrowVector only supports FixedSizeList sizes between 1 and 4");return{numericType:e,rowStride:t.type.listSize}}if(!m(t.type))throw Error(`expandArrowVector does not support Arrow type ${t.type}`);return{numericType:t.type,rowStride:1}}(t),u=(0,l.as)(t),d=function(t){var e;if((e=t)instanceof Int8Array||e instanceof Int16Array||e instanceof Int32Array||e instanceof Uint8Array||e instanceof Uint16Array||e instanceof Uint32Array)return t;if(!o.pe.isInt(t.type)||t.type.bitWidth>32)throw Error("expandArrowVector row mapping must use 8, 16, or 32-bit integers");return(0,l.as)(t)}(e),f=function(t,e,r,n){if(void 0===n)return;let a=b(r,e);if(o.pe.isFixedSizeList(t.type)){if("number"==typeof n)throw Error("expandArrowVector FixedSizeList nullValue must be an array");if(n.length!==e)throw Error(`expandArrowVector FixedSizeList nullValue length ${n.length} must match listSize ${e}`);for(let t=0;t<e;t++)a[t]=n[t]??0;return a}if("number"!=typeof n)throw Error("expandArrowVector scalar nullValue must be a number");return a[0]=n,a}(t,s,u,r);f&&o.pe.isFixedSizeList(t.type)&&function(t){for(let e of t.data){let t=e.children[0];if(o.pe.isFixedSizeList(e.type)&&t&&0!==t.nullCount&&t.nullBitmap){for(let r=0;r<e.length;r++)if(g(e,r)){for(let n=0;n<e.type.listSize;n++)if(!g(t,r*e.type.listSize+n))throw Error("expandArrowVector does not support nullable FixedSizeList child values")}}}}(t);let p=b(u,d.length*s);for(let e=0;e<d.length;e++){let r=Number(d[e]);var w,y,x,v=r,C=t.length;if(!Number.isInteger(v))throw Error("expandArrowVector row mapping must contain integers");if(v<0)throw Error("expandArrowVector row mapping cannot contain negative indices");if(v>=C)throw Error(`expandArrowVector row mapping index ${v} is outside vector length ${C}`);let n=r*s,o=e*s,a=!function(t,e){let r=0;for(let n of t.data){let t=r+n.length;if(e<r||e>=t){r=t;continue}return g(n,e-r)}return!0}(t,r)?f:u.subarray(n,n+s);if(!a){p.set(u.subarray(n,n+s),o);continue}p.set(a,o)}if(o.pe.isFixedSizeList(t.type)){let t,e;return w=n,y=s,t=c({type:w,length:(x=p).length,data:x}),e=h({type:new o.Y1(y,new i.D("value",w)),length:x.length/y,nullCount:0,nullBitmap:null,child:t}),(0,a.g)(e)}let I=c({type:n,length:d.length,data:p});return(0,a.g)(I)}function g(t,e){if(0===t.nullCount||!t.nullBitmap)return!0;let r=(t.offset??0)+e;return((t.nullBitmap[r>>3]??0)&1<<(7&r))!=0}function m(t){return!!(0,u.d8)(t)&&(o.pe.isInt(t)?t.bitWidth<=32:o.pe.isFloat(t)&&t.precision!==s.j.DOUBLE)}function b(t,e){return new t.constructor(e)}},41240(t,e,r){r.d(e,{a:()=>o});var n=r(3842);class o{name;format;data;length;valueLength;constructor(t){(0,n.v)(t.data.every(e=>e.format===t.format)),this.name=t.name??"",this.format=t.format,this.data=Object.freeze([...t.data]),this.length=this.data.reduce((t,e)=>t+e.length,0),this.valueLength=this.data.reduce((t,e)=>t+e.valueLength,0)}}},48097(t,e,r){r.d(e,{T:()=>a});var n=r(55590);let o=n.h.STORAGE|n.h.VERTEX|n.h.COPY_SRC|n.h.COPY_DST;function a(t,e="uint32"){return"webgpu"!==t.type?{usage:o}:{usage:o|n.h.INDEX|n.h.UNIFORM|n.h.INDIRECT|n.h.QUERY_RESOLVE,indexType:e}}},77231(t,e,r){r.d(e,{d:()=>o,j:()=>a});var n=r(3842);function o(t){if(void 0!==t.attributeNames){(0,n.v)(t.attributeNames.length>=2);let e=new Set(t.attributeNames);return(0,n.v)(e.size===t.attributeNames.length),t.attributeNames}return void 0===t.attributeName?[]:[t.attributeName]}function a(t,e,r){for(let n of e){o(n);let e=r[n.columnName];if(!e){if(n.required)throw Error(`${t} requires GPU input "${n.columnName}"`);continue}if("isConstant"in e&&n.required)throw Error(`${t} requires varying GPU input "${n.columnName}"; required inputs cannot be constant`);let a=e.format;if(!a||!n.formats.includes(a)){let r="isConstant"in e?"GPUConstant":"GPUVector";throw Error(`${t} ${n.columnName} ${r}.format "${a??"undefined"}" must be one of ${n.formats.join(", ")}`)}}}},60097(t,e,r){r.d(e,{e:()=>a});var n=r(1170),o=r(77806);class a{schema;numRows;numCols;nullCount;bufferLayout=[];gpuData={};sourceInfo;constructor({gpuData:t,bufferLayout:e,fields:r,numRows:a,metadata:i,sourceInfo:s,nullCount:l=0}){this.numRows=function(t,e){let r=Object.values(t)[0];if(!r)return e??0;let n=e??r.length;if(Object.values(t).find(t=>t.length!==n))throw Error("GPURecordBatch requires matching GPUData row counts");return n}(t,a),this.nullCount=l,Object.assign(this.gpuData,t),this.bufferLayout.push(...function(t,e){if(e){for(let r of e){if((0,n.U)(r.name))throw Error(`GPURecordBatch buffer layout cannot include reserved index column "${r.name}"`);if(!t[r.name])throw Error(`GPURecordBatch buffer layout references missing GPUData "${r.name}"`)}return e}return Object.entries(t).flatMap(([t,e])=>(0,n.U)(t)?[]:function(t,e){if(!e.format)throw Error(`GPURecordBatch cannot synthesize a buffer layout for GPUData "${t}" without a format`);if((0,o.w4)(e.format))return[];if((0,o.Tm)(e.format))throw Error(`GPURecordBatch cannot synthesize a generic buffer layout for vertex-list GPUData "${t}"`);if((0,o.u4)(e.format))throw Error(`GPURecordBatch cannot synthesize a generic buffer layout for value-list GPUData "${t}"`);return[{name:t,byteStride:e.byteStride,format:(0,o.l$)(e.format)}]}(t,e))}(t,e));let u=function(t,e,r){if(e){for(let r of e)if(!t[r.name])throw Error(`GPURecordBatch schema references missing GPUData "${r.name}"`);return e}let n=new Set(r.map(t=>t.name));return Object.entries(t).map(([t,e])=>{if(!e.format){if(n.has(t))return{name:t,nullable:!1,metadata:new Map};throw Error(`GPURecordBatch cannot synthesize a schema field for GPUData "${t}" without a format`)}return{name:t,format:e.format,nullable:!1,metadata:new Map}})}(t,r,this.bufferLayout);this.schema={fields:u,metadata:i??new Map},this.numCols=u.length,this.sourceInfo=s?{...s}:void 0}destroy(){for(let t of Object.values(this.gpuData))t.destroy()}}},1170(t,e,r){r.d(e,{U:()=>o,m:()=>n});let n="indices";function o(t){return t===n}},29797(t,e,r){r.d(e,{P:()=>h});var n=r(48097),o=r(50784),a=r(19531),i=r(8969),s=r(6116),l=r(60097),u=r(1170),c=r(77806);class h{schema;numRows;numCols;nullCount;gpuVectors={};gpuConstants={};gpuColumns={};batches=[];bufferLayout=[];constructor(t){if("batches"in t){let e=t.batches[0];if(!e)throw Error("GPUTable batches constructor requires at least one GPURecordBatch");for(let r of(function(t){let e=t[0];if(e)for(let r of t.slice(1)){if(!p(e.bufferLayout,r.bufferLayout))throw Error("GPUTable batches constructor requires matching buffer layouts");f(e.schema,r.schema,"GPUTable batches constructor")}}(t.batches),Object.assign(this.gpuConstants,t.constants??{}),Object.keys(this.gpuConstants))){if(e.gpuData[r])throw Error(`GPUTable constant column "${r}" conflicts with batch GPUData`);if((0,u.U)(r))throw Error('GPUTable reserved index column "indices" cannot be constant')}let r=b(this.gpuConstants,[]);this.schema=0===r.length?e.schema:{fields:[...e.schema.fields,...r],metadata:new Map(e.schema.metadata)},this.numCols=this.schema.fields.length,this.batches.push(...t.batches),this.bufferLayout.push(...e.bufferLayout),this.numRows=t.batches.reduce((t,e)=>t+e.numRows,0),this.nullCount=t.batches.reduce((t,e)=>t+e.nullCount,0),this.rebuildAggregateVectors();return}if("schema"in t){this.schema=t.schema,this.numCols=t.schema.fields.length,this.numRows=0,this.nullCount=0,this.bufferLayout.push(...t.bufferLayout??[]);return}let{metadata:e,sourceInfo:r,nullCount:n=0}=t,o=function(t){let e=Array.isArray(t)?Object.fromEntries(t.map(t=>[t.name,t])):t;for(let[t,r]of Object.entries(e)){if(r instanceof s.M&&r.name!==t)throw Error(`GPUTable column name "${t}" does not match GPUVector.name "${r.name}"`);if((0,u.U)(t)&&r instanceof a.z)throw Error('GPUTable reserved index column "indices" cannot be constant')}return e}("columns"in t?t.columns:t.vectors),i=Object.fromEntries(Object.entries(o).filter(t=>t[1]instanceof s.M));Object.assign(this.gpuConstants,Object.fromEntries(Object.entries(o).filter(t=>t[1]instanceof a.z)));let h=Object.values(i).some(t=>t.data.length>0),d=function(t,e=!1){return Object.values(t).flatMap(t=>(0,u.U)(t.name)?[]:function(t,e){if(t.bufferLayout)return[t.bufferLayout];if(!t.format)throw Error('GPUTable cannot synthesize a buffer layout for vector "'+t.name+'" without a format');if((0,c.w4)(t.format))return[];if((0,c.Tm)(t.format)){if(e)return[];throw Error('GPUTable cannot synthesize a generic buffer layout for vertex-list vector "'+t.name+'"')}if((0,c.u4)(t.format)){if(e)return[];throw Error('GPUTable cannot synthesize a generic buffer layout for value-list vector "'+t.name+'"')}return[{name:t.name,byteStride:t.byteStride,format:(0,c.l$)(t.format)}]}(t,e))}(i,!h),g=Object.values(i).map(t=>{if(!t.format){if(t.bufferLayout)return{name:t.name,nullable:!1,metadata:new Map};throw Error('GPUTable cannot synthesize a schema field for vector "'+t.name+'" without a format')}return{name:t.name,format:t.format,nullable:!1,metadata:new Map}}),m=b(o,g),w=function(t,e,r,n,o,a){let i=Object.values(t),s=i[0]?.data.length??0;for(let t of i)if(function(t){for(let e of t.data)if(e.format!==t.format||e.stride!==t.stride||e.byteStride!==t.byteStride||e.rowByteLength!==t.rowByteLength)throw Error('GPUTable vectors constructor requires compatible GPUData chunks for "'+t.name+'"')}(t),t.data.length!==s)throw Error("GPUTable vectors constructor requires matching GPUData chunk counts");if(1!==s&&(o||a>0))throw Error("GPUTable vectors constructor supports sourceInfo and nullCount only with one GPUData chunk");let u=[];for(let i=0;i<s;i++){let s,c={};for(let[e,r]of Object.entries(t)){let t=r.data[i];if(!t)throw Error('GPUTable vectors constructor is missing GPUData chunk for "'+e+'"');if(void 0===s)s=t.length;else if(t.length!==s)throw Error("GPUTable vectors constructor requires matching row counts in batch "+i);c[e]=t}u.push(new l.e({gpuData:c,bufferLayout:e,fields:r,metadata:n,...o?{sourceInfo:o}:{},nullCount:a}))}return u}(i,d,g,e,r,n);this.schema={fields:m,metadata:e??new Map},this.numCols=m.length;let y=w.reduce((t,e)=>t+e.numRows,0),x="columns"in t?t.numRows:void 0;this.numRows=function(t,e,r){if(void 0!==r&&(!Number.isInteger(r)||r<0))throw Error("GPUTable columns constructor requires numRows to be a non-negative integer");if(0===Object.keys(e).length){if(void 0===r)throw Error("GPUTable columns constructor requires numRows for an all-constant table");return r}if(void 0!==r&&r!==t)throw Error("GPUTable columns constructor numRows must match varying columns");return t}(y,i,x),this.nullCount=w.reduce((t,e)=>t+e.nullCount,0),this.bufferLayout.push(...d),this.batches.push(...w),0===this.batches.length&&Object.keys(this.gpuConstants).length>0&&this.batches.push(new l.e({gpuData:{},fields:[],numRows:this.numRows,metadata:e})),this.rebuildAggregateVectors()}packBatches(t={}){if(this.batches.length<=1)return this;if(this.batches.some(t=>t.gpuData[u.m]))throw Error("GPUTable.packBatches() does not support indexed tables");let e=function(t,e){if(void 0===e)return[t];if(!Number.isFinite(e)||e<=0)throw Error("GPUTable.packBatches() minBatchSize must be a positive number");let r=[],n=[],o=0;for(let a of t)n.push(a),(o+=a.numRows)>=e&&(r.push(n),n=[],o=0);return n.length>0&&r.push(n),r}(this.batches,t.minBatchSize);for(let t of e)if(!(t.length<=1))for(let e of t)for(let[r,n]of Object.entries(e.gpuData)){if(n.format&&((0,c.u4)(n.format)||(0,c.Tm)(n.format)))throw Error(`GPUTable.packBatches() does not support variable-length GPUData "${r}"`);let e=t[0].gpuData[r];if(n.format&&(0,c.w4)(n.format)&&(n.byteStride!==e.byteStride||n.rowByteLength!==e.rowByteLength))throw Error(`GPUTable.packBatches() requires matching fixed-size-list row layouts for GPUData "${r}"`);if(n.nullBitmap?.length||void 0!==n.readbackMetadata)throw Error(`GPUTable.packBatches() cannot preserve null or readback metadata for GPUData "${r}"`)}let r=[],a=[];for(let t of e){if(1===t.length){r.push(t[0]);continue}r.push(function(t,e,r){let a=t[0],s=function(t){let e=Object.values(t.gpuData)[0];if(!e)throw Error("GPUTable cannot pack an empty GPU record batch");return e.buffer.device}(a),u=s.createCommandEncoder(),h={};for(let e of Object.keys(a.gpuData)){let r=t.map(t=>t.gpuData[e]),a=r[0];if(!a)throw Error(`GPUTable batch is missing GPUData "${e}"`);if(r.some(t=>t.format&&((0,c.u4)(t.format)||(0,c.Tm)(t.format))))throw Error(`GPUTable.packBatches() does not support variable-length GPUData "${e}"`);let l=r.reduce((t,e)=>t+e.length*e.byteStride,0),p=s.createBuffer({...(0,n.T)(s,"uint16"===a.format?"uint16":"uint32"),byteLength:l}),g=0;for(let t of r){var d,f;let e=0===(d=t).length?0:(d.length-1)*d.byteStride+d.rowByteLength;0!==e&&(u.copyBufferToBuffer({sourceBuffer:(f=t).buffer instanceof o.kL?f.buffer.buffer:f.buffer,sourceOffset:t.byteOffset,destinationBuffer:p,destinationOffset:g,size:e}),g+=t.length*t.byteStride)}h[e]=new i.L({buffer:p,dataType:a.dataType,format:a.format,length:r.reduce((t,e)=>t+e.length,0),valueLength:r.reduce((t,e)=>t+e.valueLength,0),stride:a.stride,byteStride:a.byteStride,rowByteLength:a.rowByteLength,ownsBuffer:!0})}return s.submit(u.finish()),new l.e({gpuData:h,bufferLayout:e,fields:r.fields,metadata:new Map(r.metadata),sourceInfo:function(t){let e=t[0]?.sourceInfo;if(!e)return;let r=e.sourceRowCount,n=e.sourceRowIndexOffset+e.sourceRowCount;for(let o of t.slice(1)){let t=o.sourceInfo;if(!t||t.sourceBatchIndex!==e.sourceBatchIndex||t.sourceRowIndexOffset!==n)return;r+=t.sourceRowCount,n+=t.sourceRowCount}return{sourceBatchIndex:e.sourceBatchIndex,sourceRowIndexOffset:e.sourceRowIndexOffset,sourceRowCount:r}}(t),nullCount:t.reduce((t,e)=>t+e.nullCount,0)})}(t,this.bufferLayout,y(this))),a.push(...t)}if(0===a.length)return this;for(let t of(this.batches.splice(0,this.batches.length,...r),this.refreshFromBatches(),a))t.destroy();return this}addBatch(t){if(0===this.batches.length){if(f(y(this),t.schema,"GPUTable.addBatch()"),0===this.bufferLayout.length)this.bufferLayout.push(...t.bufferLayout);else if(!p(this.bufferLayout,t.bufferLayout))throw Error("GPUTable.addBatch() requires matching buffer layouts");return this.batches.push(t),this.refreshFromBatches()}return function(t,e){if(!p(t.bufferLayout,e.bufferLayout))throw Error("GPUTable.addBatch() requires matching buffer layouts");f(y(t),e.schema,"GPUTable.addBatch()")}(this,t),this.batches.push(t),this.refreshFromBatches()}refreshFromBatches(){return this.numRows=this.batches.reduce((t,e)=>t+e.numRows,0),this.nullCount=this.batches.reduce((t,e)=>t+e.nullCount,0),(this.batches.length<=1||!this.trySynchronizeAggregateVectors())&&this.rebuildAggregateVectors(),this}select(...t){let e=function(t,e){let r=new Set(t.schema.fields.map(t=>t.name)),n=Array.from(new Set(e));for(let t of n)if(!r.has(t))throw Error(`GPUTable column "${t}" does not exist`);return n}(this,t),r=new Set(e);for(let t of this.batches){for(let e of Object.entries(t.gpuData).filter(([t])=>!r.has(t)).map(([,t])=>t))e.destroy();m(t,e)}return g(this,e),this.rebuildAggregateVectors(),this}detachVector(t){var e=this,r=t;if(!e.schema.fields.some(t=>t.name===r))throw Error(`GPUTable column "${r}" does not exist`);let n=this.batches.map(e=>e.gpuData[t]),o=n[0];if(!o)throw Error(`GPUTable.detachVector() column "${t}" has no GPU data`);let a=new s.M({type:"data",name:t,dataType:o.dataType,format:o.format,data:n,stride:o.stride,byteStride:o.byteStride,rowByteLength:o.rowByteLength,bufferLayout:x(this.bufferLayout,t),ownsData:!0}),i=this.schema.fields.map(t=>t.name).filter(e=>e!==t);for(let t of this.batches)m(t,i);return g(this,i),this.rebuildAggregateVectors(),a}detachBatches(t={}){let e=t.first??0,r=t.last??this.batches.length;if(!Number.isInteger(e)||!Number.isInteger(r)||e<0||r<e||r>this.batches.length)throw Error("GPUTable.detachBatches() requires a valid half-open batch range");let n=this.batches.splice(e,r-e);return 0===n.length||this.refreshFromBatches(),n}destroy(){for(let t of this.batches)t.destroy()}rebuildAggregateVectors(){for(let t of Object.keys(this.gpuVectors))delete this.gpuVectors[t];let t=this.batches[0];if(t)for(let e of Object.keys(t.gpuData)){let t=d(this.batches,e);this.gpuVectors[e]=function(t,e,r){let n=e[0];if(!n)throw Error(`GPUTable aggregate vector "${t}" requires GPUData`);return new s.M({type:"data",name:t,dataType:n.dataType,format:n.format,data:e,stride:n.stride,byteStride:n.byteStride,rowByteLength:n.rowByteLength,bufferLayout:r})}(e,t,x(this.bufferLayout,e))}w(this)}trySynchronizeAggregateVectors(){let t=this.batches[0];if(!t)return!1;for(let e of Object.keys(t.gpuData)){let t=this.gpuVectors[e],r=d(this.batches,e);if(!t||!function(t,e){let r=e[0];return!!r&&t.format===r.format&&t.stride===r.stride&&t.byteStride===r.byteStride&&t.rowByteLength===r.rowByteLength&&!(t.data.length>e.length)&&t.data.every((t,r)=>t===e[r])}(t,r))return!1}for(let e of Object.keys(t.gpuData)){let t=this.gpuVectors[e];for(let r of d(this.batches,e).slice(t.data.length))t.addData(r)}return!0}}function d(t,e){return t.map(t=>{let r=t.gpuData[e];if(!r)throw Error(`GPUTable batch is missing GPUData "${e}"`);return r})}function f(t,e,r){if(t.fields.length!==e.fields.length)throw Error(r+" requires matching selected schema fields");for(let n=0;n<t.fields.length;n++){let o=t.fields[n],a=e.fields[n];if(!a||o.name!==a.name||o.format!==a.format)throw Error(r+" requires matching selected schema fields")}}function p(t,e){return JSON.stringify(t)===JSON.stringify(e)}function g(t,e){let r=new Set(e),n=e.map(e=>t.bufferLayout.find(t=>t.name===e)).filter(t=>!!t),o=e.map(e=>t.schema.fields.find(t=>t.name===e)).filter(t=>!!t);for(let e of(t.bufferLayout.splice(0,t.bufferLayout.length,...n),t.schema={fields:o,metadata:new Map(t.schema.metadata)},t.numCols=o.length,Object.keys(t.gpuVectors)))r.has(e)||delete t.gpuVectors[e];for(let e of Object.keys(t.gpuConstants))r.has(e)||delete t.gpuConstants[e];w(t)}function m(t,e){let r=new Set(e),n=e.map(e=>t.bufferLayout.find(t=>t.name===e)).filter(t=>!!t),o=e.map(e=>t.schema.fields.find(t=>t.name===e)).filter(t=>!!t);for(let e of Object.keys(t.gpuData))r.has(e)||delete t.gpuData[e];t.bufferLayout.splice(0,t.bufferLayout.length,...n),t.schema={fields:o,metadata:new Map(t.schema.metadata)},t.numCols=o.length}function b(t,e){let r=new Map(e.map(t=>[t.name,t]));return Object.entries(t).map(([t,e])=>{if(e instanceof a.z)return{name:t,format:e.format,nullable:!1,metadata:new Map};let n=r.get(t);if(!n)throw Error(`GPUTable cannot synthesize field "${t}"`);return n})}function w(t){for(let e of Object.keys(t.gpuColumns))delete t.gpuColumns[e];Object.assign(t.gpuColumns,t.gpuVectors,t.gpuConstants)}function y(t){return{fields:t.schema.fields.filter(e=>!t.gpuConstants[e.name]),metadata:new Map(t.schema.metadata)}}function x(t,e){let r=t.find(t=>t.name===e);return r?.attributes?r:void 0}},49144(t,e,r){function n({device:t,recordOffsets:e,recordByteStride:r,maxBatchByteLength:i,resourceLabel:s="Generated GPU buffer"}){if(!Number.isInteger(r)||r<=0)throw Error("Generated buffer batch planning requires a positive integer record byte stride");if(0===e.length)throw Error("Generated buffer batch planning requires at least one record offset");let l=function(t,e,r){let n=t.limits.maxBufferSize;if(!Number.isFinite(n)||n<=0)throw Error("Generated buffer batch planning requires device.limits.maxBufferSize");if(void 0!==r&&(!Number.isFinite(r)||r<=0))throw Error("Generated buffer batch planning requires a positive maxBatchByteLength");let o=Math.floor(Math.floor((void 0===r?n:Math.min(n,r))*.95)/e)*e;return Math.max(e,o)}(t,r,i),u=e.length-1,c=[],h=0,d=a(e,0);for(let t=0;t<u;t++){let n=a(e,t),i=a(e,t+1);if(i<n)throw Error("Generated buffer record offsets must be monotonically increasing");let u=(i-n)*r;if(u>l)throw Error(`${s} row ${t} requires ${u} bytes, but the generated buffer batch limit is ${l} bytes`);(i-d)*r>l&&t>h&&(c.push(o(h,t,d,n,r)),h=t,d=n)}return c.push(o(h,u,d,a(e,u),r)),c}function o(t,e,r,n,o){let a=n-r;return{rowStart:t,rowEnd:e,recordStart:r,recordEnd:n,recordCount:a,byteLength:a*o}}function a(t,e){let r=Number(t[e]??0);if(!Number.isInteger(r)||r<0)throw Error("Generated buffer record offsets must be non-negative integers");return r}r.d(e,{J:()=>n})}}]);
//# sourceMappingURL=36518.6a5f6495.js.map