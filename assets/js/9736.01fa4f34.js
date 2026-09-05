"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["9736"],{78957(e,t,r){let n;r.d(t,{V:()=>_,x:()=>S});var i=r(51664),a=r(90623),o=r(18236);function s(e,t,r){let n=r?l(r.metadata):void 0;return(0,o.ol)(e,t,n)}function l(e){Object.entries(e);let t={};for(let r in e)t[`${r}.string`]=JSON.stringify(e[r]);return t}let c={POSITION:"POSITION",NORMAL:"NORMAL",COLOR:"COLOR_0",TEX_COORD:"TEXCOORD_0"},f={1:Int8Array,2:Uint8Array,3:Int16Array,4:Uint16Array,5:Int32Array,6:Uint32Array,9:Float32Array};class u{draco;decoder;metadataQuerier;constructor(e){this.draco=e,this.decoder=new this.draco.Decoder,this.metadataQuerier=new this.draco.MetadataQuerier}destroy(){this.draco.destroy(this.decoder),this.draco.destroy(this.metadataQuerier)}parseSync(e,t={}){let r=new this.draco.DecoderBuffer;r.Init(new Int8Array(e),e.byteLength),this._disableAttributeTransforms(t);let n=this.decoder.GetEncodedGeometryType(r),i=n===this.draco.TRIANGULAR_MESH?new this.draco.Mesh:new this.draco.PointCloud;try{let e;switch(n){case this.draco.TRIANGULAR_MESH:e=this.decoder.DecodeBufferToMesh(r,i);break;case this.draco.POINT_CLOUD:e=this.decoder.DecodeBufferToPointCloud(r,i);break;default:throw Error("DRACO: Unknown geometry type.")}if(!e.ok()||!i.ptr){let t=`DRACO decompression failed: ${e.error_msg()}`;throw Error(t)}let o=this._getDracoLoaderData(i,n,t),c=this._getMeshData(i,o,t),f=(0,a.l)(c.attributes),u=function(e,t,r){let n=l(t.metadata),i=[],a=function(e){let t={};for(let r in e){let n=e[r];t[n.name||"undefined"]=n}return t}(t.attributes);for(let t in e){let r=e[t],n=s(t,r,a[t]);i.push(n)}if(r){let e=s("indices",r);i.push(e)}return{fields:i,metadata:n}}(c.attributes,o,c.indices);return{loader:"draco",loaderData:o,header:{vertexCount:i.num_points(),boundingBox:f},...c,schema:u}}finally{this.draco.destroy(r),i&&this.draco.destroy(i)}}_getDracoLoaderData(e,t,r){let n=this._getTopLevelMetadata(e),i=this._getDracoAttributes(e,r);return{geometry_type:t,num_attributes:e.num_attributes(),num_points:e.num_points(),num_faces:e instanceof this.draco.Mesh?e.num_faces():0,metadata:n,attributes:i}}_getDracoAttributes(e,t){let r={};for(let n=0;n<e.num_attributes();n++){let i=this.decoder.GetAttribute(e,n),a=this._getAttributeMetadata(e,n);r[i.unique_id()]={unique_id:i.unique_id(),attribute_type:i.attribute_type(),data_type:i.data_type(),num_components:i.num_components(),byte_offset:i.byte_offset(),byte_stride:i.byte_stride(),normalized:i.normalized(),attribute_index:n,metadata:a};let o=this._getQuantizationTransform(i,t);o&&(r[i.unique_id()].quantization_transform=o);let s=this._getOctahedronTransform(i,t);s&&(r[i.unique_id()].octahedron_transform=s)}return r}_getMeshData(e,t,r){let n=this._getMeshAttributes(t,e,r);if(!n.POSITION)throw Error("DRACO: No position attribute found.");if(e instanceof this.draco.Mesh)if("triangle-strip"===r.topology)return{topology:"triangle-strip",mode:4,attributes:n,indices:{value:this._getTriangleStripIndices(e),size:1}};else return{topology:"triangle-list",mode:5,attributes:n,indices:{value:this._getTriangleListIndices(e),size:1}};return{topology:"point-list",mode:0,attributes:n}}_getMeshAttributes(e,t,r){let n={};for(let i of Object.values(e.attributes)){let e=this._deduceAttributeName(i,r);i.name=e;let a=this._getAttributeValues(t,i);if(a){let{value:t,size:r}=a;n[e]={value:t,size:r,byteOffset:i.byte_offset,byteStride:i.byte_stride,normalized:i.normalized}}}return n}_getTriangleListIndices(e){let t=3*e.num_faces(),r=4*t,n=this.draco._malloc(r);try{return this.decoder.GetTrianglesUInt32Array(e,r,n),new Uint32Array(this.draco.HEAPF32.buffer,n,t).slice()}finally{this.draco._free(n)}}_getTriangleStripIndices(e){let t=new this.draco.DracoInt32Array;try{return this.decoder.GetTriangleStripsFromMesh(e,t),function(e){let t=e.size(),r=new Int32Array(t);for(let n=0;n<t;n++)r[n]=e.GetValue(n);return r}(t)}finally{this.draco.destroy(t)}}_getAttributeValues(e,t){let r,n=f[t.data_type];if(!n)return console.warn(`DRACO: Unsupported attribute type ${t.data_type}`),null;let i=t.num_components,a=e.num_points()*i,o=a*n.BYTES_PER_ELEMENT,s=function(e,t){switch(t){case Float32Array:return e.DT_FLOAT32;case Int8Array:return e.DT_INT8;case Int16Array:return e.DT_INT16;case Int32Array:return e.DT_INT32;case Uint8Array:return e.DT_UINT8;case Uint16Array:return e.DT_UINT16;case Uint32Array:return e.DT_UINT32;default:return e.DT_INVALID}}(this.draco,n),l=this.draco._malloc(o);try{let i=this.decoder.GetAttribute(e,t.attribute_index);this.decoder.GetAttributeDataArrayForAllPoints(e,i,s,o,l),r=new n(this.draco.HEAPF32.buffer,l,a).slice()}finally{this.draco._free(l)}return{value:r,size:i}}_deduceAttributeName(e,t){let r=e.unique_id;for(let[e,n]of Object.entries(t.extraAttributes||{}))if(n===r)return e;let n=e.attribute_type;for(let e in c)if(this.draco[e]===n)return c[e];let i=t.attributeNameEntry||"name";return e.metadata[i]?e.metadata[i].string:`CUSTOM_ATTRIBUTE_${r}`}_getTopLevelMetadata(e){let t=this.decoder.GetMetadata(e);return this._getDracoMetadata(t)}_getAttributeMetadata(e,t){let r=this.decoder.GetAttributeMetadata(e,t);return this._getDracoMetadata(r)}_getDracoMetadata(e){if(!e||!e.ptr)return{};let t={},r=this.metadataQuerier.NumEntries(e);for(let n=0;n<r;n++){let r=this.metadataQuerier.GetEntryName(e,n);t[r]=this._getDracoMetadataField(e,r)}return t}_getDracoMetadataField(e,t){let r=new this.draco.DracoInt32Array;try{this.metadataQuerier.GetIntEntryArray(e,t,r);let n=function(e){let t=e.size(),r=new Int32Array(t);for(let n=0;n<t;n++)r[n]=e.GetValue(n);return r}(r);return{int:this.metadataQuerier.GetIntEntry(e,t),string:this.metadataQuerier.GetStringEntry(e,t),double:this.metadataQuerier.GetDoubleEntry(e,t),intArray:n}}finally{this.draco.destroy(r)}}_disableAttributeTransforms(e){let{quantizedAttributes:t=[],octahedronAttributes:r=[]}=e;for(let e of[...t,...r])this.decoder.SkipAttributeTransform(this.draco[e])}_getQuantizationTransform(e,t){let{quantizedAttributes:r=[]}=t,n=e.attribute_type();if(r.map(e=>this.decoder[e]).includes(n)){let t=new this.draco.AttributeQuantizationTransform;try{if(t.InitFromAttribute(e))return{quantization_bits:t.quantization_bits(),range:t.range(),min_values:new Float32Array([1,2,3]).map(e=>t.min_value(e))}}finally{this.draco.destroy(t)}}return null}_getOctahedronTransform(e,t){let{octahedronAttributes:r=[]}=t,n=e.attribute_type();if(r.map(e=>this.decoder[e]).includes(n)){let t=new this.draco.AttributeQuantizationTransform;try{if(t.InitFromAttribute(e))return{quantization_bits:t.quantization_bits()}}finally{this.draco.destroy(t)}}return null}}var m=r(80155);let p="https://www.gstatic.com/draco/versioned/decoders/1.5.6",d="draco_wasm_wrapper.js",h="draco_decoder.wasm",g="draco_decoder.js",b="draco_encoder.js",A={[d]:`${p}/${d}`,[h]:`${p}/${h}`,[g]:`${p}/${g}`,[b]:`https://raw.githubusercontent.com/google/draco/1.4.1/javascript/${b}`};async function C(e={},t){let r=e.modules||{};return r.draco3d?n||=r.draco3d.createDecoderModule({}).then(e=>({draco:e})):n||=B(e,t),await n}function v(e,t){if(e&&"object"==typeof e){if(e.default)return e.default;if(e[t])return e[t]}return e}async function B(e,t){let r,n;if("js"===t)r=await (0,i._e)(A[g],"draco",e,g);else try{[r,n]=await Promise.all([await (0,i._e)(A[d],"draco",e,d),await (0,i._e)(A[h],"draco",e,h)])}catch{r=null,n=null}return(r=(r=v(r,"DracoDecoderModule"))||globalThis.DracoDecoderModule)||m.Bd||([r,n]=await Promise.all([await (0,i._e)(A[d],"draco",{...e,useLocalLibraries:!0},d),await (0,i._e)(A[h],"draco",{...e,useLocalLibraries:!0},h)]),r=(r=v(r,"DracoDecoderModule"))||globalThis.DracoDecoderModule),await function(e,t){if("function"!=typeof e)throw Error("DracoDecoderModule could not be loaded");let r={};return t&&(r.wasmBinary=t),new Promise(t=>{e({...r,onModuleLoaded:e=>t({draco:e})})})}(r,n)}let S={dataType:null,batchType:null,name:"Draco",id:"draco",module:"draco",version:"4.4.3",worker:!0,extensions:["drc"],mimeTypes:["application/octet-stream"],binary:!0,tests:["DRACO"],options:{draco:{decoderType:"object"==typeof WebAssembly?"wasm":"js",extraAttributes:{},attributeNameEntry:void 0}}},_={...S,parse:I};async function I(e,t){let{draco:r}=await C((0,i.$j)(t),t?.draco?.decoderType||"wasm"),n=new u(r);try{return n.parseSync(e,t?.draco)}finally{n.destroy()}}},66649(e,t,r){let n;r.d(t,{B:()=>e7});var i={};r.r(i),r.d(i,{createExtMeshFeatures:()=>j,decode:()=>k,encode:()=>K,name:()=>J});var a={};r.r(a),r.d(a,{createExtStructuralMetadata:()=>$,decode:()=>W,encode:()=>z,name:()=>Q});var o={};r.r(o),r.d(o,{decode:()=>ec,name:()=>el});var s={};r.r(s),r.d(s,{name:()=>ed,preprocess:()=>eh});var l={};r.r(l),r.d(l,{name:()=>eb,preprocess:()=>eA});var c={};r.r(c),r.d(c,{decode:()=>eI,encode:()=>eM,name:()=>eS,preprocess:()=>e_});var f={};r.r(f),r.d(f,{decode:()=>eL,name:()=>eU});var u={};r.r(u),r.d(u,{decode:()=>eG,encode:()=>eP,name:()=>ew});var m={};r.r(m),r.d(m,{decode:()=>ek,encode:()=>eK,name:()=>eJ});var p={};r.r(p),r.d(p,{decode:()=>eQ,encode:()=>eW,name:()=>eX});var d={};function h(e,t,r){if(e.byteLength<=t+r)return"";let n=new DataView(e),i="";for(let e=0;e<r;e++)i+=String.fromCharCode(n.getUint8(t+e));return i}r.r(d),r.d(d,{decode:()=>e$,name:()=>eY});var g=r(49988),b=r(44585),A=r(21140),C=r(10543),v=r(24252),B=r(86868);function S(e,t){return(0,B.v)(e>=0),(0,B.v)(t>0),e+(t-1)&~(t-1)}function _(e,t,r,n){let i=new Uint8Array(t.buffer,r,n);return e.json=JSON.parse(new TextDecoder("utf8").decode(i)),S(n,4)}function I(e,t,r,n){return e.header.hasBinChunk=!0,e.binChunks.push({byteOffset:r,byteLength:n,arrayBuffer:t.buffer}),S(n,4)}function M(e,t,r){if(e.startsWith("data:")||e.startsWith("http:")||e.startsWith("https:"))return e;let n=r?.baseUrl||function(e){if(!e)return;if(e.endsWith("/"))return e;let t=e.lastIndexOf("/");return t>=0?e.slice(0,t+1):""}(t?.core?.baseUrl);if(!n)throw Error(`'baseUrl' must be provided to resolve relative url ${e}`);return n.endsWith("/")?`${n}${e}`:`${n}/${e}`}var R=r(89153),T=r(54849);class x{gltf;sourceBuffers;byteLength;constructor(e){this.gltf={json:e?.json||{asset:{version:"2.0",generator:"loaders.gl"},buffers:[],extensions:{},extensionsRequired:[],extensionsUsed:[]},buffers:e?.buffers||[],images:e?.images||[]},this.sourceBuffers=[],this.byteLength=0,this.gltf.buffers&&this.gltf.buffers[0]&&(this.byteLength=this.gltf.buffers[0].byteLength,this.sourceBuffers=[this.gltf.buffers[0]])}get json(){return this.gltf.json}getApplicationData(e){return this.json[e]}getExtraData(e){return(this.json.extras||{})[e]}hasExtension(e){let t=this.getUsedExtensions().find(t=>t===e),r=this.getRequiredExtensions().find(t=>t===e);return"string"==typeof t||"string"==typeof r}getExtension(e){let t=this.getUsedExtensions().find(t=>t===e),r=this.json.extensions||{};return t?r[e]:null}getRequiredExtension(e){return this.getRequiredExtensions().find(t=>t===e)?this.getExtension(e):null}getRequiredExtensions(){return this.json.extensionsRequired||[]}getUsedExtensions(){return this.json.extensionsUsed||[]}getRemovedExtensions(){return this.json.extensionsRemoved||[]}getObjectExtension(e,t){return(e.extensions||{})[t]}getScene(e){return this.getObject("scenes",e)}getNode(e){return this.getObject("nodes",e)}getSkin(e){return this.getObject("skins",e)}getMesh(e){return this.getObject("meshes",e)}getMaterial(e){return this.getObject("materials",e)}getAccessor(e){return this.getObject("accessors",e)}getTexture(e){return this.getObject("textures",e)}getSampler(e){return this.getObject("samplers",e)}getImage(e){return this.getObject("images",e)}getBufferView(e){return this.getObject("bufferViews",e)}getBuffer(e){return this.getObject("buffers",e)}getObject(e,t){if("object"==typeof t)return t;let r=this.json[e]&&this.json[e][t];if(!r)throw Error(`glTF file error: Could not find ${e}[${t}]`);return r}getTypedArrayForBufferView(e){let t=(e=this.getBufferView(e)).buffer,r=this.gltf.buffers[t];(0,v.v)(r);let n=(e.byteOffset||0)+r.byteOffset;return new Uint8Array(r.arrayBuffer,n,e.byteLength)}getTypedArrayForAccessor(e){let t=this.getAccessor(e);return function(e,t,r){let n="number"==typeof r?e.accessors?.[r]:r;if(!n)throw Error(`No gltf accessor ${JSON.stringify(r)}`);let i=e.bufferViews?.[n.bufferView||0];if(!i)throw Error(`No gltf buffer view for accessor ${i}`);let{arrayBuffer:a,byteOffset:o}=t[i.buffer],s=(o||0)+(n.byteOffset||0)+(i.byteOffset||0),{ArrayType:l,length:c,componentByteSize:f,numberOfComponentsInElement:u}=(0,R.aF)(n,i),m=f*u,p=i.byteStride||m;if(void 0===i.byteStride||i.byteStride===m)return new l(a,s,c);let d=new l(c);for(let e=0;e<n.count;e++){let t=new l(a,s+e*p,u);d.set(t,e*u)}return d}(this.gltf.json,this.gltf.buffers,t)}getTypedArrayForImageData(e){e=this.getAccessor(e);let t=this.getBufferView(e.bufferView);return new Uint8Array(this.getBuffer(t.buffer).data,t.byteOffset||0,t.byteLength)}addApplicationData(e,t){return this.json[e]=t,this}addExtraData(e,t){return this.json.extras=this.json.extras||{},this.json.extras[e]=t,this}addObjectExtension(e,t,r){return e.extensions=e.extensions||{},e.extensions[t]=r,this.registerUsedExtension(t),this}setObjectExtension(e,t,r){(e.extensions||{})[t]=r}removeObjectExtension(e,t){let r=e?.extensions||{};if(r[t]){this.json.extensionsRemoved=this.json.extensionsRemoved||[];let e=this.json.extensionsRemoved;e.includes(t)||e.push(t)}delete r[t]}addExtension(e,t={}){return(0,v.v)(t),this.json.extensions=this.json.extensions||{},this.json.extensions[e]=t,this.registerUsedExtension(e),t}addRequiredExtension(e,t={}){return(0,v.v)(t),this.addExtension(e,t),this.registerRequiredExtension(e),t}registerUsedExtension(e){this.json.extensionsUsed=this.json.extensionsUsed||[],this.json.extensionsUsed.find(t=>t===e)||this.json.extensionsUsed.push(e)}registerRequiredExtension(e){this.registerUsedExtension(e),this.json.extensionsRequired=this.json.extensionsRequired||[],this.json.extensionsRequired.find(t=>t===e)||this.json.extensionsRequired.push(e)}removeExtension(e){if(this.json.extensions?.[e]){this.json.extensionsRemoved=this.json.extensionsRemoved||[];let t=this.json.extensionsRemoved;t.includes(e)||t.push(e)}this.json.extensions&&delete this.json.extensions[e],this.json.extensionsRequired&&this._removeStringFromArray(this.json.extensionsRequired,e),this.json.extensionsUsed&&this._removeStringFromArray(this.json.extensionsUsed,e)}setDefaultScene(e){this.json.scene=e}addScene(e){let{nodeIndices:t}=e;return this.json.scenes=this.json.scenes||[],this.json.scenes.push({nodes:t}),this.json.scenes.length-1}addNode(e){let{meshIndex:t,matrix:r}=e;this.json.nodes=this.json.nodes||[];let n={mesh:t};return r&&(n.matrix=r),this.json.nodes.push(n),this.json.nodes.length-1}addMesh(e){let{attributes:t,indices:r,material:n,mode:i=4}=e,a={primitives:[{attributes:this._addAttributes(t),mode:i}]};if(r){let e=this._addIndices(r);a.primitives[0].indices=e}return Number.isFinite(n)&&(a.primitives[0].material=n),this.json.meshes=this.json.meshes||[],this.json.meshes.push(a),this.json.meshes.length-1}addPointCloud(e){let t=this._addAttributes(e);return this.json.meshes=this.json.meshes||[],this.json.meshes.push({primitives:[{attributes:t,mode:0}]}),this.json.meshes.length-1}addImage(e,t){let r=(0,T.m)(e),n=t||r?.mimeType,i=this.addBufferView(e);return this.json.images=this.json.images||[],this.json.images.push({bufferView:i,mimeType:n}),this.json.images.length-1}addBufferView(e,t=0,r=this.byteLength){let n=e.byteLength;return(0,v.v)(Number.isFinite(n)),this.sourceBuffers=this.sourceBuffers||[],this.sourceBuffers.push(e),this.byteLength+=S(n,4),this.json.bufferViews=this.json.bufferViews||[],this.json.bufferViews.push({buffer:t,byteOffset:r,byteLength:n}),this.json.bufferViews.length-1}addAccessor(e,t){let r={bufferView:e,type:(0,R.v7)(t.size),componentType:t.componentType,count:t.count,max:t.max,min:t.min};return this.json.accessors=this.json.accessors||[],this.json.accessors.push(r),this.json.accessors.length-1}addBinaryBuffer(e,t={size:3}){let r=this.addBufferView(e),n={min:t.min,max:t.max};n.min&&n.max||(n=this._getAccessorMinMax(e,t.size));let i={size:t.size,componentType:(0,R.rA)(e),count:Math.round(e.length/t.size),min:n.min,max:n.max};return this.addAccessor(r,Object.assign(i,t))}addTexture(e){let{imageIndex:t}=e;return this.json.textures=this.json.textures||[],this.json.textures.push({source:t}),this.json.textures.length-1}addMaterial(e){return this.json.materials=this.json.materials||[],this.json.materials.push(e),this.json.materials.length-1}createBinaryChunk(){let e=this.byteLength,t=new ArrayBuffer(e),r=new Uint8Array(t),n=0;for(let e of this.sourceBuffers||[])n=function(e,t,r){let n;if(e instanceof ArrayBuffer)n=new Uint8Array(e);else{let t=e.byteOffset,r=e.byteLength;n=new Uint8Array(e.buffer||e.arrayBuffer,t,r)}return t.set(n,r),r+S(n.byteLength,4)}(e,r,n);this.json?.buffers?.[0]?this.json.buffers[0].byteLength=e:this.json.buffers=[{byteLength:e}],this.gltf.binary=t,this.sourceBuffers=[t],this.gltf.buffers=[{arrayBuffer:t,byteOffset:0,byteLength:t.byteLength}]}_removeStringFromArray(e,t){let r=!0;for(;r;){let n=e.indexOf(t);n>-1?e.splice(n,1):r=!1}}_addAttributes(e={}){let t={};for(let r in e){let n=e[r],i=this._getGltfAttributeName(r),a=this.addBinaryBuffer(n.value,n);t[i]=a}return t}_addIndices(e){return this.addBinaryBuffer(e,{size:1})}_getGltfAttributeName(e){switch(e.toLowerCase()){case"position":case"positions":case"vertices":return"POSITION";case"normal":case"normals":return"NORMAL";case"color":case"colors":return"COLOR_0";case"texcoord":case"texcoords":return"TEXCOORD_0";default:return e}}_getAccessorMinMax(e,t){let r={min:null,max:null};if(e.length<t)return r;for(let n of(r.min=[],r.max=[],e.subarray(0,t)))r.min.push(n),r.max.push(n);for(let n=t;n<e.length;n+=t)for(let i=0;i<t;i++)r.min[0+i]=Math.min(r.min[0+i],e[n+i]),r.max[0+i]=Math.max(r.max[0+i],e[n+i]);return r}}var y=r(33437),E=r(50933);let F={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16,BOOLEAN:1,STRING:1,ENUM:1},U={INT8:Int8Array,UINT8:Uint8Array,INT16:Int16Array,UINT16:Uint16Array,INT32:Int32Array,UINT32:Uint32Array,INT64:BigInt64Array,UINT64:BigUint64Array,FLOAT32:Float32Array,FLOAT64:Float64Array},N={INT8:1,UINT8:1,INT16:2,UINT16:2,INT32:4,UINT32:4,INT64:8,UINT64:8,FLOAT32:4,FLOAT64:8};function D(e,t,r,n){if("UINT8"!==r&&"UINT16"!==r&&"UINT32"!==r&&"UINT64"!==r)return null;let i=O(e.getTypedArrayForBufferView(t),"SCALAR",r,n+1);return i instanceof BigInt64Array||i instanceof BigUint64Array?null:i}function O(e,t,r,n=1){let i=F[t],a=U[r],o=N[r],s=n*i,l=s*o,c=e.buffer,f=e.byteOffset;return f%o!=0&&(c=new Uint8Array(c).slice(f,f+l).buffer,f=0),new a((0,E.W$)(c),f,s)}function L(e,t,r){let n=`TEXCOORD_${t.texCoord||0}`,i=r.attributes[n],a=e.getTypedArrayForAccessor(i),o=e.gltf.json,s=t.index,l=o.textures?.[s]?.source;if(void 0!==l){let r=o.images?.[l]?.mimeType,n=e.gltf.images?.[l];if(n&&void 0!==n.width){let e=[];for(let i=0;i<a.length;i+=2){let o=function(e,t,r,n,i=[0]){let a={r:{offset:0,shift:0},g:{offset:1,shift:8},b:{offset:2,shift:16},a:{offset:3,shift:24}},o=r[n],s=r[n+1],l=1;t&&(-1!==t.indexOf("image/jpeg")||-1!==t.indexOf("image/png"))&&(l=4);let c=function(e,t,r,n=1){let i=r.width,a=Math.round((e%1+1)%1*(i-1));return(Math.round((t%1+1)%1*(r.height-1))*i+a)*(r.components?r.components:n)}(o,s,e,l),f=0;for(let t of i){let r="number"==typeof t?Object.values(a)[t]:a[t],n=c+r.offset,i=(0,y.M5)(e);if(i.data.length<=n)throw Error(`${i.data.length} <= ${n}`);f|=i.data[n]<<r.shift}return f}(n,r,a,i,t.channels);e.push(o)}return e}}return[]}function H(e,t,r,n,i){if(!r?.length)return;let a=[];for(let e of r){let t=n.findIndex(t=>t===e);-1===t&&(t=n.push(e)-1),a.push(t)}let o=new Uint32Array(a),s=e.gltf.buffers.push({arrayBuffer:o.buffer,byteOffset:o.byteOffset,byteLength:o.byteLength})-1,l=e.addBufferView(o,s,0),c=e.addAccessor(l,{size:1,componentType:(0,R.rA)(o),count:o.length});i.attributes[t]=c}function w(e,t,r,n,i){let a=[];for(let o=0;o<t;o++){let t=r[o],s=r[o+1]-r[o];if(s+t>n)break;let l=t/i,c=s/i;a.push(e.slice(l,l+c))}return a}function G(e,t,r){let n=[];for(let i=0;i<t;i++){let t=i*r;n.push(e.slice(t,t+r))}return n}function P(e,t,r,n){if(r)throw Error("Not implemented - arrayOffsets for strings is specified");if(n){let r=[],i=new TextDecoder("utf8"),a=0;for(let o=0;o<e;o++){let e=n[o+1]-n[o];if(e+a<=t.length){let n=t.subarray(a,e+a),o=i.decode(n);r.push(o),a+=e}}return r}return[]}let V="EXT_mesh_features",J=V;async function k(e,t){var r=new x(e),n=t;let i=r.gltf.json;if(i.meshes)for(let e of i.meshes)for(let t of e.primitives)!function(e,t,r){if(!r?.gltf?.loadBuffers)return;let n=t.extensions?.[V],i=n?.featureIds;if(i)for(let n of i){let i;if(void 0!==n.attribute){let r=`_FEATURE_ID_${n.attribute}`,a=t.attributes[r];i=e.getTypedArrayForAccessor(a)}else i=void 0!==n.texture&&r?.gltf?.loadImages?L(e,n.texture,t):[];n.data=i}}(r,t,n)}function K(e,t){let r=new x(e);return function(e){let t=e.gltf.json.meshes;if(t)for(let r of t)for(let t of r.primitives)!function(e,t){let r=t.extensions?.[V];if(!r)return;let n=r.featureIds;n.forEach((r,i)=>{if(r.data){let{accessorKey:a,index:o}=function(e){let t="_FEATURE_ID_",r=Object.keys(e).filter(e=>0===e.indexOf(t)),n=-1;for(let e of r){let r=Number(e.substring(t.length));r>n&&(n=r)}return n++,{accessorKey:`${t}${n}`,index:n}}(t.attributes),s=new Uint32Array(r.data);n[i]={featureCount:s.length,propertyTable:r.propertyTable,attribute:o},e.gltf.buffers.push({arrayBuffer:s.buffer,byteOffset:s.byteOffset,byteLength:s.byteLength});let l=e.addBufferView(s),c=e.addAccessor(l,{size:1,componentType:(0,R.rA)(s),count:s.length});t.attributes[a]=c}})}(e,t)}(r),r.createBinaryChunk(),r.gltf}function j(e,t,r,n){t.extensions||(t.extensions={});let i=t.extensions[V];i||(i={featureIds:[]},t.extensions[V]=i);let{featureIds:a}=i,o={featureCount:r.length,propertyTable:n,data:r};a.push(o),e.addObjectExtension(t,V,i)}let X="EXT_structural_metadata",Q=X;async function W(e,t){!function(e,t){if(!t.gltf?.loadBuffers)return;let r=e.getExtension(X);r&&(t.gltf?.loadImages&&function(e,t){let r=t.propertyTextures,n=e.gltf.json;if(r&&n.meshes)for(let i of n.meshes)for(let n of i.primitives)!function(e,t,r,n){if(!t)return;let i=r.extensions?.[X],a=i?.propertyTextures;if(a)for(let i of a)!function(e,t,r,n){if(!t.properties)return;n.dataAttributeNames||(n.dataAttributeNames=[]);let i=t.class;for(let a in t.properties){let o=`${i}_${a}`,s=t.properties?.[a];if(!s)continue;s.data||(s.data=[]);let l=s.data,c=L(e,s,r);null!==c&&(H(e,o,c,l,r),s.data=l,n.dataAttributeNames.push(o))}}(e,t[i],r,n)}(e,r,n,t)}(e,r),function(e,t){let r=t.schema;if(!r)return;let n=r.classes,i=t.propertyTables;if(n&&i)for(let t in n){let n=function(e,t){for(let r of e)if(r.class===t)return r;return null}(i,t);n&&function(e,t,r){let n=t.classes?.[r.class];if(!n)throw Error(`Incorrect data in the EXT_structural_metadata extension: no schema class with name ${r.class}`);let i=r.count;for(let a in n.properties){let o=n.properties[a],s=r.properties?.[a];if(s){let r=function(e,t,r,n,i){var a,o,s,l,c,f,u;let m=[],p=i.values,d=e.getTypedArrayForBufferView(p),h=(a=e,o=r,s=i,l=n,o.array&&void 0===o.count&&void 0!==s.arrayOffsets?D(a,s.arrayOffsets,s.arrayOffsetType||"UINT32",l):null),g=(c=e,f=i,u=n,void 0!==f.stringOffsets?D(c,f.stringOffsets,f.stringOffsetType||"UINT32",u):null);switch(r.type){case"SCALAR":case"VEC2":case"VEC3":case"VEC4":case"MAT2":case"MAT3":case"MAT4":m=function(e,t,r,n){var i;let a,o=e.array,s=e.count,l=(i=e.type,N[e.componentType]*F[i]),c=r.byteLength/l;return(a=e.componentType?O(r,e.type,e.componentType,c):r,o)?n?w(a,t,n,r.length,l):s?G(a,t,s):[]:a}(r,n,d,h);break;case"BOOLEAN":throw Error(`Not implemented - classProperty.type=${r.type}`);case"STRING":m=P(n,d,h,g);break;case"ENUM":m=function(e,t,r,n,i){var a;let o=t.enumType;if(!o)throw Error("Incorrect data in the EXT_structural_metadata extension: classProperty.enumType is not set for type ENUM");let s=e.enums?.[o];if(!s)throw Error(`Incorrect data in the EXT_structural_metadata extension: schema.enums does't contain ${o}`);let l=s.valueType||"UINT16",c=(a=t.type,N[l]*F[a]),f=n.byteLength/c,u=O(n,t.type,l,f);if(u||(u=n),t.array){if(i)return function(e){let{valuesData:t,numberOfElements:r,arrayOffsets:n,valuesDataBytesLength:i,elementSize:a,enumEntry:o}=e,s=[];for(let e=0;e<r;e++){let r=n[e],l=n[e+1]-n[e];if(l+r>i)break;let c=Y(t,r/a,l/a,o);s.push(c)}return s}({valuesData:u,numberOfElements:r,arrayOffsets:i,valuesDataBytesLength:n.length,elementSize:c,enumEntry:s});let e=t.count;return e?function(e,t,r,n){let i=[];for(let a=0;a<t;a++){let t=Y(e,r*a,r,n);i.push(t)}return i}(u,r,e,s):[]}return Y(u,0,r,s)}(t,r,n,d,h);break;default:throw Error(`Unknown classProperty type ${r.type}`)}return m}(e,t,o,i,s);s.data=r}}}(e,r,n)}}(e,r))}(new x(e),t)}function z(e,t){let r=new x(e);return function(e){let t=e.getExtension(X);if(t&&t.propertyTables)for(let r of t.propertyTables){let n=r.class,i=t.schema?.classes?.[n];r.properties&&i&&function(e,t,r){for(let n in e.properties){let i=e.properties[n].data;if(i){let a=t.properties[n];if(a){let t=function(e,t,r){let n={values:0};if("STRING"===t.type){let{stringData:t,stringOffsets:i}=function(e){let t=new TextEncoder,r=[],n=0;for(let i of e){let e=t.encode(i);n+=e.length,r.push(e)}let i=new Uint8Array(n),a=[],o=0;for(let e of r)i.set(e,o),a.push(o),o+=e.length;return a.push(o),{stringData:i,stringOffsets:new Uint32Array(a)}}(e);n.stringOffsets=Z(i,r),n.values=Z(t,r)}else"SCALAR"===t.type&&t.componentType&&(n.values=Z(function(e,t){let r=[];for(let t of e)r.push(Number(t));let n=q[t];if(!n)throw Error("Illegal component type");return new n(r)}(e,t.componentType),r));return n}(i,a,r);e.properties[n]=t}}}}(r,i,e)}}(r),r.createBinaryChunk(),r.gltf}function Y(e,t,r,n){let i=[];for(let a=0;a<r;a++)if(e instanceof BigInt64Array||e instanceof BigUint64Array)i.push("");else{let r=function(e,t){for(let r of e.values)if(r.value===t)return r;return null}(n,e[t+a]);r?i.push(r.name):i.push("")}return i}function $(e,t,r="schemaClassId"){let n=e.getExtension(X);n||(n=e.addExtension(X)),n.schema=function(e,t,r){let n=r??{id:"schema_id"},i={properties:{}};for(let t of e){let e={type:t.elementType,componentType:t.componentType};i.properties[t.name]=e}return n.classes={},n.classes[t]=i,n}(t,r,n.schema);let i=function(e,t,r){let n={class:t,count:0},i=0,a=r.classes?.[t];for(let t of e){if(0===i&&(i=t.values.length),i!==t.values.length&&t.values.length)throw Error("Illegal values in attributes");a?.properties[t.name]&&(n.properties||(n.properties={}),n.properties[t.name]={values:0,data:t.values})}return n.count=i,n}(t,r,n.schema);return n.propertyTables||(n.propertyTables=[]),n.propertyTables.push(i)-1}let q={INT8:Int8Array,UINT8:Uint8Array,INT16:Int16Array,UINT16:Uint16Array,INT32:Int32Array,UINT32:Uint32Array,INT64:Int32Array,UINT64:Uint32Array,FLOAT32:Float32Array,FLOAT64:Float64Array};function Z(e,t){return t.gltf.buffers.push({arrayBuffer:(0,E.W$)(e.buffer),byteOffset:e.byteOffset,byteLength:e.byteLength}),t.addBufferView(e)}let ee=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),et=new Uint8Array([32,0,65,253,3,1,2,34,4,106,6,5,11,8,7,20,13,33,12,16,128,9,116,64,19,113,127,15,10,21,22,14,255,66,24,54,136,107,18,23,192,26,114,118,132,17,77,101,130,144,27,87,131,44,45,74,156,154,70,167]),er={0:"",1:"meshopt_decodeFilterOct",2:"meshopt_decodeFilterQuat",3:"meshopt_decodeFilterExp",NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},en={0:"meshopt_decodeVertexBuffer",1:"meshopt_decodeIndexBuffer",2:"meshopt_decodeIndexSequence",ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"};async function ei(e,t,r,n,i,a="NONE"){let o=await ea();!function(e,t,r,n,i,a,o){let s=e.exports.sbrk,l=n+3&-4,c=s(l*i),f=s(a.length),u=new Uint8Array(e.exports.memory.buffer);u.set(a,f);let m=t(c,n,i,f,a.length);if(0===m&&o&&o(c,l,i),r.set(u.subarray(c,c+n*i)),s(c-s(0)),0!==m)throw Error(`Malformed buffer data: ${m}`)}(o,o.exports[en[i]],e,t,r,n,o.exports[er[a||"NONE"]])}async function ea(){return n||(n=eo()),n}async function eo(){let e="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";WebAssembly.validate(ee)&&(e="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",console.log("Warning: meshopt_decoder is using experimental SIMD support"));let t=await WebAssembly.instantiate(function(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;++r){let n=e.charCodeAt(r);t[r]=n>96?n-71:n>64?n-65:n>47?n+4:n>46?63:62}let r=0;for(let n=0;n<e.length;++n)t[r++]=t[n]<60?et[t[n]]:(t[n]-60)*64+t[++n];return t.buffer.slice(0,r)}(e),{});return await t.instance.exports.__wasm_call_ctors(),t.instance}let es="EXT_meshopt_compression",el=es;async function ec(e,t){let r=new x(e);if(!t?.gltf?.decompressMeshes||!t.gltf?.loadBuffers)return;let n=[];for(let t of e.json.bufferViews||[])n.push(ef(r,t));await Promise.all(n),r.removeExtension(es)}async function ef(e,t){let r=e.getObjectExtension(t,es);if(r){let{byteOffset:n=0,byteLength:i=0,byteStride:a,count:o,mode:s,filter:l="NONE",buffer:c}=r,f=e.gltf.buffers[c],u=new Uint8Array(f.arrayBuffer,f.byteOffset+n,i),m=new Uint8Array(e.gltf.buffers[t.buffer].arrayBuffer,t.byteOffset,t.byteLength);await ei(m,o,a,u,s,l),e.removeObjectExtension(t,es)}}var eu=r(34280);let em={},ep="EXT_texture_webp",ed=ep;function eh(e,t){let r=new x(e);if(!function(e){if(void 0===em[e]){var t;let r,n=eu.Bd?function(e){switch(e){case"image/avif":case"image/webp":var t=e;try{let e=document.createElement("canvas").toDataURL(t);return 0===e.indexOf(`data:${t}`)}catch{return!1}default:return!0}}(e):(t=e,r=globalThis.loaders?.imageFormatsNode||["image/png","image/jpeg","image/gif"],!!globalThis.loaders?.parseImageNode&&r.includes(t));em[e]=n}return em[e]}("image/webp")){if(r.getRequiredExtensions().includes(ep))throw Error(`gltf: Required extension ${ep} not supported by browser`);return}let{json:n}=r;for(let e of n.textures||[]){let t=r.getObjectExtension(e,ep);t&&(e.source=t.source),r.removeObjectExtension(e,ep)}r.removeExtension(ep)}let eg="KHR_texture_basisu",eb=eg;function eA(e,t){let r=new x(e),{json:n}=r;for(let e of n.textures||[]){let t=r.getObjectExtension(e,eg);t&&(e.source=t.source,r.removeObjectExtension(e,eg))}r.removeExtension(eg)}var eC=r(78957);function ev(e){var t;let r,n,i,{buffer:a,size:o,count:s}=(r=t=e,n=1,i=0,t&&t.value&&(r=t.value,n=t.size||1),r&&(ArrayBuffer.isView(r)||(r=function(e,t,r=!1){return e?!Array.isArray(e)&&(!r||e instanceof t)?e:new t(e):null}(r,Float32Array)),i=r.length/n),{buffer:r,size:n,count:i});return{value:a,size:o,byteOffset:0,count:s,type:(0,R.v7)(o),componentType:(0,R.rA)(a)}}let eB="KHR_draco_mesh_compression",eS=eB;function e_(e,t,r){let n=new x(e);for(let e of eT(n))n.getObjectExtension(e,eB)}async function eI(e,t,r){if(!t?.gltf?.decompressMeshes)return;let n=new x(e),i=[];for(let e of eT(n))n.getObjectExtension(e,eB)&&i.push(eR(n,e,t,r));await Promise.all(i),n.removeExtension(eB)}function eM(e,t={}){let r=new x(e);for(let e of r.json.meshes||[])(function(e){if(!(void 0).DracoWriter)throw Error("options.gltf.DracoWriter not provided");let t=(void 0).DracoWriter.encodeSync({attributes:e}),r=void 0;(void 0)._addFauxAttributes(r.attributes),(void 0).addBufferView(t)})(e),r.addRequiredExtension(eB)}async function eR(e,t,r,n){let i=e.getObjectExtension(t,eB);if(!i)return;let a=e.getTypedArrayForBufferView(i.bufferView),o=(0,g._m)(a.buffer,a.byteOffset),s={...r};delete s["3d-tiles"];let l=await (0,b.N9)(o,eC.V,s,n),c=function(e){let t={};for(let r in e){let n=e[r];if("indices"!==r){let e=ev(n);t[r]=e}}return t}(l.attributes);for(let[r,n]of Object.entries(c))if(r in t.attributes){let i=t.attributes[r],a=e.getAccessor(i);a?.min&&a?.max&&(n.min=a.min,n.max=a.max)}t.attributes=c,l.indices&&(t.indices=ev(l.indices)),e.removeObjectExtension(t,eB),function(e){if(!e.attributes&&Object.keys(e.attributes).length>0)throw Error("glTF: Empty primitive detected: Draco decompression failure?")}(t)}function*eT(e){for(let t of e.json.meshes||[])for(let e of t.primitives)yield e}var ex=r(35097),ey=r(34331),eE=r(87021);let eF="KHR_texture_transform",eU=eF,eN=new ex.P,eD=new ey.d,eO=new ey.d;async function eL(e,t){if(!new x(e).hasExtension(eF)||!t.gltf?.loadBuffers)return;let r=e.json.materials||[];for(let t=0;t<r.length;t++)!function(e,t){let r=t.json.materials?.[e],n=[r?.pbrMetallicRoughness?.baseColorTexture,r?.emissiveTexture,r?.normalTexture,r?.occlusionTexture,r?.pbrMetallicRoughness?.metallicRoughnessTexture],i=[];for(let r of n)r&&r?.extensions?.[eF]&&function(e,t,r,n){let i=function(e,t){let r=e.extensions?.[eF],{texCoord:n=0}=e,{texCoord:i=n}=r;if(-1===t.findIndex(([e,t])=>e===n&&t===i)){let a=function(e){let{offset:t=[0,0],rotation:r=0,scale:n=[1,1]}=e,i=new ey.d().set(1,0,0,0,1,0,t[0],t[1],1),a=eD.set(Math.cos(r),Math.sin(r),0,-Math.sin(r),Math.cos(r),0,0,0,1),o=eO.set(n[0],0,0,0,n[1],0,0,0,1);return i.multiplyRight(a).multiplyRight(o)}(r);return n!==i&&(e.texCoord=i),t.push([n,i]),{originalTexCoord:n,texCoord:i,matrix:a}}return null}(r,n);if(i)for(let r of e.json.meshes||[])for(let n of r.primitives){let r=n.material;Number.isFinite(r)&&t===r&&function(e,t,r){let{originalTexCoord:n,texCoord:i,matrix:a}=r,o=t.attributes[`TEXCOORD_${n}`];if(Number.isFinite(o)){let r=e.json.accessors?.[o];if(r&&void 0!==r.bufferView){let o=e.json.bufferViews?.[r.bufferView];if(o){let{arrayBuffer:s,byteOffset:l}=e.buffers[o.buffer],c=(l||0)+(r.byteOffset||0)+(o.byteOffset||0),{ArrayType:f,length:u}=(0,R.aF)(r,o),m=eE.E9[r.componentType],p=eE.$j[r.type],d=o.byteStride||m*p,h=new Float32Array(u);for(let e=0;e<r.count;e++){let t=new f(s,c+e*d,2);eN.set(t[0],t[1],1),eN.transformByMatrix3(a),h.set([eN[0],eN[1]],e*p)}n===i?function(e,t,r,n){e.componentType=5126,e.byteOffset=0;let i=(t.json.accessors||[]).reduce((e,t)=>t.bufferView===n?e+1:e,0);t.buffers.push({arrayBuffer:(0,E.W$)(r.buffer),byteOffset:0,byteLength:r.buffer.byteLength});let a=t.buffers.length-1;if(t.json.bufferViews=t.json.bufferViews||[],i>1){t.json.bufferViews.push({buffer:a,byteLength:r.buffer.byteLength,byteOffset:0}),e.bufferView=t.json.bufferViews.length-1;return}let o=t.json.bufferViews[n];o&&(o.buffer=a,o.byteOffset=0,o.byteLength=r.buffer.byteLength,void 0!==o.byteStride&&delete o.byteStride)}(r,e,h,r.bufferView):function(e,t,r,n,i){n.buffers.push({arrayBuffer:(0,E.W$)(i.buffer),byteOffset:0,byteLength:i.buffer.byteLength}),n.json.bufferViews=n.json.bufferViews||[];let a=n.json.bufferViews;a.push({buffer:n.buffers.length-1,byteLength:i.buffer.byteLength,byteOffset:0});let o=n.json.accessors;o&&(o.push({bufferView:a?.length-1,byteOffset:0,componentType:5126,count:t.count,type:"VEC2"}),r.attributes[`TEXCOORD_${e}`]=o.length-1)}(i,r,t,e,h)}}}}(e,n,i)}}(t,e,r,i)}(t,e)}let eH="KHR_lights_punctual",ew=eH;async function eG(e){let t=new x(e),{json:r}=t,n=t.getExtension(eH);for(let e of(n&&(t.json.lights=n.lights,t.removeExtension(eH)),r.nodes||[])){let r=t.getObjectExtension(e,eH);r&&(e.light=r.light),t.removeObjectExtension(e,eH)}}async function eP(e){let t=new x(e),{json:r}=t;if(r.lights){let e=t.addExtension(eH);(0,v.v)(!e.lights),e.lights=r.lights,delete r.lights}if(t.json.lights){for(let e of t.json.lights){let r=e.node;t.addObjectExtension(r,eH,e)}delete t.json.lights}}let eV="KHR_materials_unlit",eJ=eV;async function ek(e){let t=new x(e),{json:r}=t;for(let e of r.materials||[])e.extensions&&e.extensions.KHR_materials_unlit&&(e.unlit=!0),t.removeObjectExtension(e,eV);t.removeExtension(eV)}function eK(e){let t=new x(e),{json:r}=t;if(t.materials)for(let e of r.materials||[])e.unlit&&(delete e.unlit,t.addObjectExtension(e,eV,{}),t.addExtension(eV))}let ej="KHR_techniques_webgl",eX=ej;async function eQ(e){let t=new x(e),{json:r}=t,n=t.getExtension(ej);if(n){let e=function(e,t){let{programs:r=[],shaders:n=[],techniques:i=[]}=e,a=new TextDecoder;return n.forEach(e=>{if(Number.isFinite(e.bufferView))e.code=a.decode(t.getTypedArrayForBufferView(e.bufferView));else throw Error("KHR_techniques_webgl: no shader code")}),r.forEach(e=>{e.fragmentShader=n[e.fragmentShader],e.vertexShader=n[e.vertexShader]}),i.forEach(e=>{e.program=r[e.program]}),i}(n,t);for(let n of r.materials||[]){let r=t.getObjectExtension(n,ej);r&&(n.technique=Object.assign({},r,e[r.technique]),n.technique.values=function(e,t){let r=Object.assign({},e.values);return Object.keys(e.uniforms||{}).forEach(t=>{!e.uniforms[t].value||t in r||(r[t]=e.uniforms[t].value)}),Object.keys(r).forEach(e=>{"object"==typeof r[e]&&void 0!==r[e].index&&(r[e].texture=t.getTexture(r[e].index))}),r}(n.technique,t)),t.removeObjectExtension(n,ej)}t.removeExtension(ej)}}async function eW(e,t){}let ez="EXT_feature_metadata",eY=ez;async function e$(e,t){!function(e,t){if(!t.gltf?.loadBuffers)return;let r=e.getExtension(ez);r&&(t.gltf?.loadImages&&function(e,t){let r=t.schema;if(!r)return;let n=r.classes,{featureTextures:i}=t;if(n&&i)for(let t in n){let r=n[t],a=function(e,t){for(let r in e){let n=e[r];if(n.class===t)return n}return null}(i,t);a&&function(e,t,r){let n=t.class;for(let i in r.properties){let r=t?.properties?.[i];if(r){let t=function(e,t,r){let n=e.gltf.json;if(!n.meshes)return[];let i=[];for(let a of n.meshes)for(let n of a.primitives)!function(e,t,r,n,i){let a=L(e,{channels:r.channels,...r.texture},i);a&&H(e,t,a,n,i)}(e,r,t,i,n);return i}(e,r,n);r.data=t}}}(e,a,r)}}(e,r),function(e,t){let r=t.schema;if(!r)return;let n=r.classes,i=t.featureTables;if(n&&i)for(let t in n){let n=function(e,t){for(let r in e){let n=e[r];if(n.class===t)return n}return null}(i,t);n&&function(e,t,r){if(!r.class)return;let n=t.classes?.[r.class];if(!n)throw Error(`Incorrect data in the EXT_structural_metadata extension: no schema class with name ${r.class}`);let i=r.count;for(let t in n.properties){let a=n.properties[t],o=r.properties?.[t];if(o){let t=function(e,t,r,n){var i,a,o,s,l,c,f;let u=[],m=n.bufferView,p=e.getTypedArrayForBufferView(m),d=(i=e,a=t,o=n,s=r,"ARRAY"===a.type&&void 0===a.componentCount&&void 0!==o.arrayOffsetBufferView?D(i,o.arrayOffsetBufferView,o.offsetType||"UINT32",s):null),h=(l=e,c=n,f=r,void 0!==c.stringOffsetBufferView?D(l,c.stringOffsetBufferView,c.offsetType||"UINT32",f):null);return"STRING"===t.type||"STRING"===t.componentType?u=P(r,p,d,h):function(e){let t=["UINT8","INT16","UINT16","INT32","UINT32","INT64","UINT64","FLOAT32","FLOAT64"];return t.includes(e.type)||void 0!==e.componentType&&t.includes(e.componentType)}(t)&&(u=function(e,t,r,n){let i="ARRAY"===e.type,a=e.componentCount,o="SCALAR",s=e.componentType||e.type,l=N[s]*F[o],c=r.byteLength/l,f=O(r,o,s,c);return i?n?w(f,t,n,r.length,l):a?G(f,t,a):[]:f}(t,r,p,d)),u}(e,a,i,o);o.data=t}}}(e,r,n)}}(e,r))}(new x(e),t)}let eq=[a,i,o,s,l,c,u,m,p,f,d];async function eZ(e,t={},r){for(let n of eq.filter(e=>e0(e.name,t)))await n.decode?.(e,t,r)}function e0(e,t){let r=t?.gltf?.excludeExtensions||{};return!(e in r&&!r[e])}let e3="KHR_binary_glTF",e1={accessors:"accessor",animations:"animation",buffers:"buffer",bufferViews:"bufferView",images:"image",materials:"material",meshes:"mesh",nodes:"node",samplers:"sampler",scenes:"scene",skins:"skin",textures:"texture"},e2={accessor:"accessors",animations:"animation",buffer:"buffers",bufferView:"bufferViews",image:"images",material:"materials",mesh:"meshes",node:"nodes",sampler:"samplers",scene:"scenes",skin:"skins",texture:"textures"};class e9{idToIndexMap={animations:{},accessors:{},buffers:{},bufferViews:{},images:{},materials:{},meshes:{},nodes:{},samplers:{},scenes:{},skins:{},textures:{}};json;normalize(e,t){this.json=e.json;let r=e.json;switch(r.asset&&r.asset.version){case"2.0":return;case void 0:case"1.0":break;default:console.warn(`glTF: Unknown version ${r.asset.version}`);return}if(!t.normalize)throw Error("glTF v1 is not supported.");console.warn("Converting glTF v1 to glTF v2 format. This is experimental and may fail."),this._addAsset(r),this._convertTopLevelObjectsToArrays(r),function(e){let t=new x(e),{json:r}=t;for(let e of r.images||[]){let r=t.getObjectExtension(e,e3);r&&Object.assign(e,r),t.removeObjectExtension(e,e3)}r.buffers&&r.buffers[0]&&delete r.buffers[0].uri,t.removeExtension(e3)}(e),this._convertObjectIdsToArrayIndices(r),this._updateObjects(r),this._updateMaterial(r)}_addAsset(e){e.asset=e.asset||{},e.asset.version="2.0",e.asset.generator=e.asset.generator||"Normalized to glTF 2.0 by loaders.gl"}_convertTopLevelObjectsToArrays(e){for(let t in e1)this._convertTopLevelObjectToArray(e,t)}_convertTopLevelObjectToArray(e,t){let r=e[t];if(!(!r||Array.isArray(r)))for(let n in e[t]=[],r){let i=r[n];i.id=i.id||n;let a=e[t].length;e[t].push(i),this.idToIndexMap[t][n]=a}}_convertObjectIdsToArrayIndices(e){for(let t in e1)this._convertIdsToIndices(e,t);for(let t of("scene"in e&&(e.scene=this._convertIdToIndex(e.scene,"scene")),e.textures))this._convertTextureIds(t);for(let t of e.meshes)this._convertMeshIds(t);for(let t of e.nodes)this._convertNodeIds(t);for(let t of e.scenes)this._convertSceneIds(t)}_convertTextureIds(e){e.source&&(e.source=this._convertIdToIndex(e.source,"image"))}_convertMeshIds(e){for(let t of e.primitives){let{attributes:e,indices:r,material:n}=t;for(let t in e)e[t]=this._convertIdToIndex(e[t],"accessor");r&&(t.indices=this._convertIdToIndex(r,"accessor")),n&&(t.material=this._convertIdToIndex(n,"material"))}}_convertNodeIds(e){e.children&&(e.children=e.children.map(e=>this._convertIdToIndex(e,"node"))),e.meshes&&(e.meshes=e.meshes.map(e=>this._convertIdToIndex(e,"mesh")))}_convertSceneIds(e){e.nodes&&(e.nodes=e.nodes.map(e=>this._convertIdToIndex(e,"node")))}_convertIdsToIndices(e,t){for(let r of(e[t]||(console.warn(`gltf v1: json doesn't contain attribute ${t}`),e[t]=[]),e[t]))for(let e in r){let t=r[e],n=this._convertIdToIndex(t,e);r[e]=n}}_convertIdToIndex(e,t){let r=e2[t];if(r in this.idToIndexMap){let n=this.idToIndexMap[r][e];if(!Number.isFinite(n))throw Error(`gltf v1: failed to resolve ${t} with id ${e}`);return n}return e}_updateObjects(e){for(let e of this.json.buffers)delete e.type}_updateMaterial(e){for(let t of e.materials){t.pbrMetallicRoughness={baseColorFactor:[1,1,1,1],metallicFactor:1,roughnessFactor:1};let r=t.values?.tex||t.values?.texture2d_0||t.values?.diffuseTex,n=e.textures.findIndex(e=>e.id===r);-1!==n&&(t.pbrMetallicRoughness.baseColorTexture={index:n})}}}async function e8(e,t,r=0,n,i){return function(e,t,r,n){if(n.core?.baseUrl&&(e.baseUri=n.core?.baseUrl),t instanceof ArrayBuffer&&!function(e,t=0,r={}){let n=new DataView(e),{magic:i=0x676c5446}=r,a=n.getUint32(t,!1);return a===i||0x676c5446===a}(t,r,n.glb)&&(t=new TextDecoder().decode(t)),"string"==typeof t)e.json=function(e){try{return JSON.parse(e)}catch(t){throw Error(`Failed to parse JSON from data starting with "${function(e,t=5){return"string"==typeof e?e.slice(0,t):ArrayBuffer.isView(e)?h(e.buffer,e.byteOffset,t):e instanceof ArrayBuffer?h(e,0,t):""}(e)}"`)}}(t);else if(t instanceof ArrayBuffer){let i={};r=function(e,t,r=0,n={}){var i,a,o,s,l,c,f;let u=new DataView(t),m=function(e,t=0){return`\
${String.fromCharCode(e.getUint8(t+0))}\
${String.fromCharCode(e.getUint8(t+1))}\
${String.fromCharCode(e.getUint8(t+2))}\
${String.fromCharCode(e.getUint8(t+3))}`}(u,r+0),p=u.getUint32(r+4,!0),d=u.getUint32(r+8,!0);switch(Object.assign(e,{header:{byteOffset:r,byteLength:d,hasBinChunk:!1},type:m,version:p,json:{},binChunks:[]}),r+=12,e.version){case 1:let h,g;return i=e,a=u,o=r,(0,B.v)(i.header.byteLength>20),h=a.getUint32(o+0,!0),g=a.getUint32(o+4,!0),o+=8,(0,B.v)(0===g),_(i,a,o,h),o+=h,o+=I(i,a,o,i.header.byteLength);case 2:return s=e,l=u,c=r,f={},(0,B.v)(s.header.byteLength>20),function(e,t,r,n){for(;r+8<=e.header.byteLength;){let i=t.getUint32(r+0,!0),a=t.getUint32(r+4,!0);switch(r+=8,a){case 0x4e4f534a:_(e,t,r,i);break;case 5130562:I(e,t,r,i);break;case 0:n.strict||_(e,t,r,i);break;case 1:n.strict||I(e,t,r,i)}r+=S(i,4)}}(s,l,c,f),c+s.header.byteLength;default:throw Error(`Invalid GLB version ${e.version}. Only supports version 1 and 2.`)}}(i,t,r,n.glb),(0,v.v)("glTF"===i.type,`Invalid GLB magic string ${i.type}`),e._glb=i,e.json=i.json}else(0,v.v)(!1,"GLTF: must be ArrayBuffer or string");let i=e.json.buffers||[];if(e.buffers=Array(i.length).fill(null),e._glb&&e._glb.header.hasBinChunk){let{binChunks:t}=e._glb;e.buffers[0]={arrayBuffer:t[0].arrayBuffer,byteOffset:t[0].byteOffset,byteLength:t[0].byteLength}}let a=e.json.images||[];e.images=Array(a.length).fill({})}(e,t,r,n),!function(e,t={}){new e9().normalize(e,t)}(e,{normalize:n?.gltf?.normalize}),!function(e,t={},r){for(let n of eq.filter(e=>e0(e.name,t)))n.preprocess?.(e,t,r)}(e,n,i),n?.gltf?.loadBuffers&&e.json.buffers&&await e4(e,n,i),n?.gltf?.loadImages&&await e6(e,n,i),await eZ(e,n,i),e}async function e4(e,t,r){let n=e.json.buffers||[];for(let i=0;i<n.length;++i){let a=n[i];if(a.uri){let{fetch:n}=r;(0,v.v)(n);let o=M(a.uri,t,r),s=await r?.fetch?.(o),l=await s?.arrayBuffer?.();e.buffers[i]={arrayBuffer:l,byteOffset:0,byteLength:l.byteLength},delete a.uri}else null===e.buffers[i]&&(e.buffers[i]={arrayBuffer:new ArrayBuffer(a.byteLength),byteOffset:0,byteLength:a.byteLength})}}async function e6(e,t,r){let n=function(e){let t=new Set;for(let r of e.json.textures||[])void 0!==r.source&&t.add(r.source);return Array.from(t).sort()}(e),i=e.json.images||[],a=[];for(let o of n)a.push(e5(e,i[o],o,t,r));return await Promise.all(a)}async function e5(e,t,r,n,i){let a;if(t.uri&&!t.hasOwnProperty("bufferView")){let e=M(t.uri,n,i),{fetch:r}=i,o=await r(e);t.bufferView={data:a=await o.arrayBuffer()}}if(Number.isFinite(t.bufferView)){var o,s,l;let r,n,i,c=(o=e.json,s=e.buffers,l=t.bufferView,r=o.bufferViews[l],(0,v.v)(r),n=s[r.buffer],(0,v.v)(n),i=(r.byteOffset||0)+n.byteOffset,new Uint8Array(n.arrayBuffer,i,r.byteLength));a=(0,g._m)(c.buffer,c.byteOffset,c.byteLength)}(0,v.v)(a,"glTF image has no data");let c={...n,core:{...n?.core,mimeType:t.mimeType}},f=await (0,b.N9)(a,[A.$,C.E],c,i);f&&f[0]&&(f={compressed:!0,mipmaps:!1,width:f[0].width,height:f[0].height,data:f[0]}),e.images=e.images||[],e.images[r]=f}let e7={dataType:null,batchType:null,name:"glTF",id:"gltf",module:"gltf",version:"4.4.3",extensions:["gltf","glb"],mimeTypes:["model/gltf+json","model/gltf-binary"],text:!0,binary:!0,tests:["glTF"],parse:te,options:{gltf:{normalize:!0,loadBuffers:!0,loadImages:!0,decompressMeshes:!0}}};async function te(e,t={},r){let n={...e7.options,...t};n.gltf={...e7.options.gltf,...n.gltf};let i=t?.glb?.byteOffset||0;return await e8({},e,i,n,r)}},56557(e,t,r){r.d(t,{R:()=>u});var n=r(24252),i=r(89153),a=r(50933);let o={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},s={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},l={magFilter:10240,minFilter:10241,wrapS:10242,wrapT:10243},c={10240:9729,10241:9986,10242:10497,10243:10497};class f{baseUri="";jsonUnprocessed;json;buffers=[];images=[];postProcess(e,t={}){let{json:r,buffers:i=[],images:a=[]}=e,{baseUri:o=""}=e;return(0,n.v)(r),this.baseUri=o,this.buffers=i,this.images=a,this.jsonUnprocessed=r,this.json=this._resolveTree(e.json,t),this.json}_resolveTree(e,t={}){let r={...e};return this.json=r,e.bufferViews&&(r.bufferViews=e.bufferViews.map((e,t)=>this._resolveBufferView(e,t))),e.images&&(r.images=e.images.map((e,t)=>this._resolveImage(e,t))),e.samplers&&(r.samplers=e.samplers.map((e,t)=>this._resolveSampler(e,t))),e.textures&&(r.textures=e.textures.map((e,t)=>this._resolveTexture(e,t))),e.accessors&&(r.accessors=e.accessors.map((e,t)=>this._resolveAccessor(e,t))),e.materials&&(r.materials=e.materials.map((e,t)=>this._resolveMaterial(e,t))),e.meshes&&(r.meshes=e.meshes.map((e,t)=>this._resolveMesh(e,t))),e.nodes&&(r.nodes=e.nodes.map((e,t)=>this._resolveNode(e,t)),r.nodes=r.nodes.map((e,t)=>this._resolveNodeChildren(e))),e.skins&&(r.skins=e.skins.map((e,t)=>this._resolveSkin(e,t))),e.scenes&&(r.scenes=e.scenes.map((e,t)=>this._resolveScene(e,t))),"number"==typeof this.json.scene&&r.scenes&&(r.scene=r.scenes[this.json.scene]),r}getScene(e){return this._get(this.json.scenes,e)}getNode(e){return this._get(this.json.nodes,e)}getSkin(e){return this._get(this.json.skins,e)}getMesh(e){return this._get(this.json.meshes,e)}getMaterial(e){return this._get(this.json.materials,e)}getAccessor(e){return this._get(this.json.accessors,e)}getCamera(e){return this._get(this.json.cameras,e)}getTexture(e){return this._get(this.json.textures,e)}getSampler(e){return this._get(this.json.samplers,e)}getImage(e){return this._get(this.json.images,e)}getBufferView(e){return this._get(this.json.bufferViews,e)}getBuffer(e){return this._get(this.json.buffers,e)}_get(e,t){if("object"==typeof t)return t;let r=e&&e[t];return r||console.warn(`glTF file error: Could not find ${e}[${t}]`),r}_resolveScene(e,t){return{...e,id:e.id||`scene-${t}`,nodes:(e.nodes||[]).map(e=>this.getNode(e))}}_resolveNode(e,t){let r={...e,id:e?.id||`node-${t}`};return void 0!==e.mesh&&(r.mesh=this.getMesh(e.mesh)),void 0!==e.camera&&(r.camera=this.getCamera(e.camera)),void 0!==e.skin&&(r.skin=this.getSkin(e.skin)),void 0!==e.meshes&&e.meshes.length&&(r.mesh=e.meshes.reduce((e,t)=>{let r=this.getMesh(t);return e.id=r.id,e.primitives=e.primitives.concat(r.primitives),e},{primitives:[]})),r}_resolveNodeChildren(e){return e.children&&(e.children=e.children.map(e=>this.getNode(e))),e}_resolveSkin(e,t){let r="number"==typeof e.inverseBindMatrices?this.getAccessor(e.inverseBindMatrices):void 0;return{...e,id:e.id||`skin-${t}`,inverseBindMatrices:r}}_resolveMesh(e,t){let r={...e,id:e.id||`mesh-${t}`,primitives:[]};return e.primitives&&(r.primitives=e.primitives.map(e=>{let t={...e,attributes:{},indices:void 0,material:void 0},r=e.attributes;for(let e in r)t.attributes[e]=this.getAccessor(r[e]);return void 0!==e.indices&&(t.indices=this.getAccessor(e.indices)),void 0!==e.material&&(t.material=this.getMaterial(e.material)),t})),r}_resolveMaterial(e,t){let r={...e,id:e.id||`material-${t}`};if(r.normalTexture&&(r.normalTexture={...r.normalTexture},r.normalTexture.texture=this.getTexture(r.normalTexture.index)),r.occlusionTexture&&(r.occlusionTexture={...r.occlusionTexture},r.occlusionTexture.texture=this.getTexture(r.occlusionTexture.index)),r.emissiveTexture&&(r.emissiveTexture={...r.emissiveTexture},r.emissiveTexture.texture=this.getTexture(r.emissiveTexture.index)),r.emissiveFactor||(r.emissiveFactor=r.emissiveTexture?[1,1,1]:[0,0,0]),r.pbrMetallicRoughness){r.pbrMetallicRoughness={...r.pbrMetallicRoughness};let e=r.pbrMetallicRoughness;e.baseColorTexture&&(e.baseColorTexture={...e.baseColorTexture},e.baseColorTexture.texture=this.getTexture(e.baseColorTexture.index)),e.metallicRoughnessTexture&&(e.metallicRoughnessTexture={...e.metallicRoughnessTexture},e.metallicRoughnessTexture.texture=this.getTexture(e.metallicRoughnessTexture.index))}return r}_resolveAccessor(e,t){let r=s[e.componentType],n=o[e.type],l={...e,id:e.id||`accessor-${t}`,bytesPerComponent:r,components:n,bytesPerElement:r*n,value:void 0,bufferView:void 0,sparse:void 0};if(void 0!==e.bufferView&&(l.bufferView=this.getBufferView(e.bufferView)),l.bufferView){let e=l.bufferView.buffer,{ArrayType:t,byteLength:r}=(0,i.aF)(l,l.bufferView),n=(l.bufferView.byteOffset||0)+(l.byteOffset||0)+e.byteOffset,o=(0,a.aK)(e.arrayBuffer,n,r);l.bufferView.byteStride&&(o=this._getValueFromInterleavedBuffer(e,n,l.bufferView.byteStride,l.bytesPerElement,l.count)),l.value=new t(o)}return l}_getValueFromInterleavedBuffer(e,t,r,n,i){let a=new Uint8Array(i*n);for(let o=0;o<i;o++){let i=t+o*r;a.set(new Uint8Array(e.arrayBuffer.slice(i,i+n)),o*n)}return a.buffer}_resolveTexture(e,t){return{...e,id:e.id||`texture-${t}`,sampler:"number"==typeof e.sampler?this.getSampler(e.sampler):{id:"default-sampler",parameters:c},source:"number"==typeof e.source?this.getImage(e.source):void 0}}_resolveSampler(e,t){let r={id:e.id||`sampler-${t}`,...e,parameters:{}};for(let e in r){let t=this._enumSamplerParameter(e);void 0!==t&&(r.parameters[t]=r[e])}return r}_enumSamplerParameter(e){return l[e]}_resolveImage(e,t){let r={...e,id:e.id||`image-${t}`,image:null,bufferView:void 0!==e.bufferView?this.getBufferView(e.bufferView):void 0},n=this.images[t];return n&&(r.image=n),r}_resolveBufferView(e,t){let r=e.buffer,n=this.buffers[r].arrayBuffer,i=this.buffers[r].byteOffset||0;return e.byteOffset&&(i+=e.byteOffset),{id:`bufferView-${t}`,...e,buffer:this.buffers[r],data:new Uint8Array(n,i,e.byteLength)}}_resolveCamera(e,t){let r={...e,id:e.id||`camera-${t}`};return r.perspective,r.orthographic,r}}function u(e,t){return new f().postProcess(e,t)}},87021(e,t,r){r.d(t,{$j:()=>n,E9:()=>i});let n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},i={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}},89153(e,t,r){r.d(t,{S3:()=>p,aF:()=>m,rA:()=>u,v7:()=>f});var n=r(24252),i=r(87021);let a=["SCALAR","VEC2","VEC3","VEC4"],o=new Map([[Int8Array,5120],[Uint8Array,5121],[Int16Array,5122],[Uint16Array,5123],[Uint32Array,5125],[Float32Array,5126],[Float64Array,5130]]),s={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},l={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},c={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};function f(e){return a[e-1]||a[0]}function u(e){let t=o.get(e.constructor);if(!t)throw Error("Illegal typed array");return t}function m(e,t){let r=c[e.componentType],a=s[e.type],o=l[e.componentType],f=e.count*a,u=e.count*a*o;return(0,n.v)(u>=0&&u<=t.byteLength),{ArrayType:r,length:f,byteLength:u,componentByteSize:i.E9[e.componentType],numberOfComponentsInElement:i.$j[e.type]}}function p(e){let{images:t,bufferViews:r}=e;r=r||[];let n=(t=t||[]).map(e=>e.bufferView);return(r=r.filter(e=>!n.includes(e))).reduce((e,t)=>e+t.byteLength,0)+Math.ceil(4*t.reduce((e,t)=>{let{width:r,height:n}=t.image;return e+r*n},0)*1.33)}},24252(e,t,r){r.d(t,{v:()=>n});function n(e,t){if(!e)throw Error(t||"assert failed: gltf")}},10383(e,t,r){function n(e){globalThis.loaders||={},globalThis.loaders.modules||={},Object.assign(globalThis.loaders.modules,e)}function i(e){return globalThis.loaders?.modules?.[e]||null}r.d(t,{Qz:()=>n,w7:()=>i})},44585(e,t,r){r.d(t,{N9:()=>n});async function n(e,t,r,n){return n._parse(e,t,r,n)}},18236(e,t,r){r.d(t,{Zt:()=>i,ol:()=>a});var n=r(30397);function i(e,t={}){return{fields:function(e){let t=[];for(let r in e){let n=e[r];t.push(a(r,n))}return t}(e),metadata:t}}function a(e,t,r){var i;let a,o=(0,n.UE)(t.value),s=r||(a={},"byteOffset"in(i=t)&&(a.byteOffset=i.byteOffset.toString(10)),"byteStride"in i&&(a.byteStride=i.byteStride.toString(10)),"normalized"in i&&(a.normalized=i.normalized.toString()),a);return{name:e,type:{type:"fixed-size-list",listSize:t.size,children:[{name:"value",type:o}]},nullable:!1,metadata:s}}},10543(e,t,r){r.d(t,{E:()=>i});var n=r(53413);let i={...{dataType:null,batchType:null,name:"Basis",id:"basis",module:"textures",version:"4.4.5",worker:!0,extensions:["basis","ktx2"],mimeTypes:["application/octet-stream","image/ktx2"],tests:["sB"],binary:!0,options:{basis:{format:"auto",containerFormat:"auto",module:"transcoder"}}},parse:n.af}},53413(e,t,r){let n,i;r.d(t,{af:()=>A});var a=r(51664),o=r(10383);async function s(e){(0,o.Qz)(e.modules);let t=(0,o.w7)("basis");return t||(n||=l(e),await n)}async function l(e){var t,r;let n,i=null,o=null;return[i,o]=await Promise.all([await (0,a._e)("basis_transcoder.js","textures",e),await (0,a._e)("basis_transcoder.wasm","textures",e)]),i=i||globalThis.BASIS,await (t=i,n={},(r=o)&&(n.wasmBinary=r),new Promise(e=>{t(n).then(t=>{let{BasisFile:r,initializeBasis:n}=t;n(),e({BasisFile:r})})}))}async function c(e){let t=e.modules||{};return t.basisEncoder?t.basisEncoder:(i=i||f(e),await i)}async function f(e){var t,r;let n,i=null,o=null;return[i,o]=await Promise.all([await (0,a._e)("basis_encoder.js","textures",e),await (0,a._e)("basis_encoder.wasm","textures",e)]),i=i||globalThis.BASIS,await (t=i,n={},(r=o)&&(n.wasmBinary=r),new Promise(e=>{t(n).then(t=>{let{BasisFile:r,KTX2File:n,initializeBasis:i,BasisEncoder:a}=t;i(),e({BasisFile:r,KTX2File:n,BasisEncoder:a})})}))}let u=["","WEBKIT_","MOZ_"],m={WEBGL_compressed_texture_s3tc:["bc1-rgb-unorm-webgl","bc1-rgba-unorm","bc2-rgba-unorm","bc3-rgba-unorm"],WEBGL_compressed_texture_s3tc_srgb:["bc1-rgb-unorm-srgb-webgl","bc1-rgba-unorm-srgb","bc2-rgba-unorm-srgb","bc3-rgba-unorm-srgb"],EXT_texture_compression_rgtc:["bc4-r-unorm","bc4-r-snorm","bc5-rg-unorm","bc5-rg-snorm"],EXT_texture_compression_bptc:["bc6h-rgb-ufloat","bc6h-rgb-float","bc7-rgba-unorm","bc7-rgba-unorm-srgb"],WEBGL_compressed_texture_etc1:["etc1-rgb-unorm-webgl"],WEBGL_compressed_texture_etc:["etc2-rgb8unorm","etc2-rgb8unorm-srgb","etc2-rgb8a1unorm","etc2-rgb8a1unorm-srgb","etc2-rgba8unorm","etc2-rgba8unorm-srgb","eac-r11unorm","eac-r11snorm","eac-rg11unorm","eac-rg11snorm"],WEBGL_compressed_texture_pvrtc:["pvrtc-rgb4unorm-webgl","pvrtc-rgba4unorm-webgl","pvrtc-rgb2unorm-webgl","pvrtc-rgba2unorm-webgl"],WEBGL_compressed_texture_atc:["atc-rgb-unorm-webgl","atc-rgba-unorm-webgl","atc-rgbai-unorm-webgl"],WEBGL_compressed_texture_astc:["astc-4x4-unorm","astc-4x4-unorm-srgb","astc-5x4-unorm","astc-5x4-unorm-srgb","astc-5x5-unorm","astc-5x5-unorm-srgb","astc-6x5-unorm","astc-6x5-unorm-srgb","astc-6x6-unorm","astc-6x6-unorm-srgb","astc-8x5-unorm","astc-8x5-unorm-srgb","astc-8x6-unorm","astc-8x6-unorm-srgb","astc-8x8-unorm","astc-8x8-unorm-srgb","astc-10x5-unorm","astc-10x5-unorm-srgb","astc-10x6-unorm","astc-10x6-unorm-srgb","astc-10x8-unorm","astc-10x8-unorm-srgb","astc-10x10-unorm","astc-10x10-unorm-srgb","astc-12x10-unorm","astc-12x10-unorm-srgb","astc-12x12-unorm","astc-12x12-unorm-srgb"]},p=null;var d=r(49755);let h=Promise.resolve(),g={etc1:{basisFormat:0,compressed:!0,format:36196,textureFormat:"etc1-rgb-unorm-webgl"},etc2:{basisFormat:1,compressed:!0,format:37493,textureFormat:"etc2-rgba8unorm"},bc1:{basisFormat:2,compressed:!0,format:33776,textureFormat:"bc1-rgb-unorm-webgl"},bc3:{basisFormat:3,compressed:!0,format:33779,textureFormat:"bc3-rgba-unorm"},bc4:{basisFormat:4,compressed:!0,format:36283,textureFormat:"bc4-r-unorm"},bc5:{basisFormat:5,compressed:!0,format:36285,textureFormat:"bc5-rg-unorm"},"bc7-m6-opaque-only":{basisFormat:6,compressed:!0,format:36492,textureFormat:"bc7-rgba-unorm"},"bc7-m5":{basisFormat:7,compressed:!0,format:36492,textureFormat:"bc7-rgba-unorm"},"pvrtc1-4-rgb":{basisFormat:8,compressed:!0,format:35840,textureFormat:"pvrtc-rgb4unorm-webgl"},"pvrtc1-4-rgba":{basisFormat:9,compressed:!0,format:35842,textureFormat:"pvrtc-rgba4unorm-webgl"},"astc-4x4":{basisFormat:10,compressed:!0,format:37808,textureFormat:"astc-4x4-unorm"},"atc-rgb":{basisFormat:11,compressed:!0,format:35986,textureFormat:"atc-rgb-unorm-webgl"},"atc-rgba-interpolated-alpha":{basisFormat:12,compressed:!0,format:34798,textureFormat:"atc-rgbai-unorm-webgl"},rgba32:{basisFormat:13,compressed:!1,format:32856,textureFormat:"rgba8unorm"},rgb565:{basisFormat:14,compressed:!1,format:36194,textureFormat:"rgb565unorm-webgl"},bgr565:{basisFormat:15,compressed:!1,format:36194,textureFormat:"rgb565unorm-webgl"},rgba4444:{basisFormat:16,compressed:!1,format:32854,textureFormat:"rgba4unorm-webgl"}};async function b(e){let t,r=h;h=new Promise(e=>{t=e}),await r;try{return await e()}finally{t()}}async function A(e,t={}){let r=(0,a.$j)(t);return await b(async()=>{if(!t.basis?.containerFormat||"auto"===t.basis.containerFormat){if((0,d.e)(e))return v((await c(r)).KTX2File,e,t);let{BasisFile:n}=await s(r);return C(n,e,t)}if("encoder"===t.basis.module){let n=await c(r);return"ktx2"===t.basis.containerFormat?v(n.KTX2File,e,t):C(n.BasisFile,e,t)}{let{BasisFile:n}=await s(r);return C(n,e,t)}})}function C(e,t,r){let n=new e(new Uint8Array(t));try{if(!n.startTranscoding())throw Error("Failed to start basis transcoding");let e=n.getNumImages(),t=[];for(let i=0;i<e;i++){let e=n.getNumLevels(i),a=[];for(let t=0;t<e;t++)a.push(function(e,t,r,n){let i=e.getImageWidth(t,r),a=e.getImageHeight(t,r),o=e.getHasAlpha(),{compressed:s,format:l,basisFormat:c,textureFormat:f}=B(n,o),u=new Uint8Array(e.getImageTranscodedSizeInBytes(t,r,c));if(!e.transcodeImage(u,t,r,c,0,0))throw Error("failed to start Basis transcoding");return{shape:"texture-level",width:i,height:a,data:u,compressed:s,...void 0!==l?{format:l}:{},...void 0!==f?{textureFormat:f}:{},hasAlpha:o}}(n,i,t,r));t.push(a)}return t}finally{n.close(),n.delete()}}function v(e,t,r){let n=new e(new Uint8Array(t));try{if(!n.startTranscoding())throw Error("failed to start KTX2 transcoding");let e=n.getLevels(),t=[];for(let i=0;i<e;i++)t.push(function(e,t,r){let{alphaFlag:n,height:i,width:a}=e.getImageLevelInfo(t,0,0),{compressed:o,format:s,basisFormat:l,textureFormat:c}=B(r,n),f=e.getImageTranscodedSizeInBytes(t,0,0,l),u=new Uint8Array(f);if(!e.transcodeImage(u,t,0,0,l,0,-1,-1))throw Error("Failed to transcode KTX2 image");return{shape:"texture-level",width:a,height:i,data:u,compressed:o,...void 0!==s?{format:s}:{},...void 0!==c?{textureFormat:c}:{},levelSize:f,hasAlpha:n}}(n,i,r));return[t]}finally{n.close(),n.delete()}}function B(e,t){let r=e.basis?.format||"auto";"auto"===r&&(r=e.basis?.supportedTextureFormats?S(e.basis.supportedTextureFormats):S()),"object"==typeof r&&(r=t?r.alpha:r.noAlpha);let n=g[r.toLowerCase()];if(!n)throw Error(`Unknown Basis format ${r}`);return n}function S(e=function(e){if(!p){for(let t of(e=e||function(){try{return document.createElement("canvas").getContext("webgl")}catch(e){return null}}()||void 0,p=new Set,u))for(let r in m)if(e&&e.getExtension(`${t}${r}`))for(let e of m[r])p.add(e)}return p}()){let t=new Set(e);if(_(t,["astc-4x4-unorm","astc-4x4-unorm-srgb"]))return"astc-4x4";if(_(t,["bc7-rgba-unorm","bc7-rgba-unorm-srgb"]))return{alpha:"bc7-m5",noAlpha:"bc7-m6-opaque-only"};if(_(t,["bc1-rgb-unorm-webgl","bc1-rgb-unorm-srgb-webgl","bc1-rgba-unorm","bc1-rgba-unorm-srgb","bc2-rgba-unorm","bc2-rgba-unorm-srgb","bc3-rgba-unorm","bc3-rgba-unorm-srgb"]))return{alpha:"bc3",noAlpha:"bc1"};if(_(t,["pvrtc-rgb4unorm-webgl","pvrtc-rgba4unorm-webgl","pvrtc-rgb2unorm-webgl","pvrtc-rgba2unorm-webgl"]))return{alpha:"pvrtc1-4-rgba",noAlpha:"pvrtc1-4-rgb"};if(_(t,["etc2-rgb8unorm","etc2-rgb8unorm-srgb","etc2-rgb8a1unorm","etc2-rgb8a1unorm-srgb","etc2-rgba8unorm","etc2-rgba8unorm-srgb","eac-r11unorm","eac-r11snorm","eac-rg11unorm","eac-rg11snorm"]))return"etc2";else if(t.has("etc1-rgb-unorm-webgl"))return"etc1";else if(_(t,["atc-rgb-unorm-webgl","atc-rgba-unorm-webgl","atc-rgbai-unorm-webgl"]))return{alpha:"atc-rgba-interpolated-alpha",noAlpha:"atc-rgb"};return"rgb565"}function _(e,t){return t.some(t=>e.has(t))}Object.freeze(Object.keys(g))},49755(e,t,r){r.d(t,{V:()=>p,e:()=>m});var n=r(83087);class i{constructor(){this.vkFormat=0,this.typeSize=1,this.pixelWidth=0,this.pixelHeight=0,this.pixelDepth=0,this.layerCount=0,this.faceCount=1,this.supercompressionScheme=0,this.levels=[],this.dataFormatDescriptor=[{vendorId:0,descriptorType:0,descriptorBlockSize:0,versionNumber:2,colorModel:0,colorPrimaries:1,transferFunction:2,flags:0,texelBlockDimension:[0,0,0,0],bytesPlane:[0,0,0,0,0,0,0,0],samples:[]}],this.keyValue={},this.globalData=null}}class a{constructor(e,t,r,n){this._dataView=void 0,this._littleEndian=void 0,this._offset=void 0,this._dataView=new DataView(e.buffer,e.byteOffset+t,r),this._littleEndian=n,this._offset=0}_nextUint8(){let e=this._dataView.getUint8(this._offset);return this._offset+=1,e}_nextUint16(){let e=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,e}_nextUint32(){let e=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint64(){let e=this._dataView.getUint32(this._offset,this._littleEndian),t=this._dataView.getUint32(this._offset+4,this._littleEndian);return this._offset+=8,e+0x100000000*t}_nextInt32(){let e=this._dataView.getInt32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint8Array(e){let t=new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+this._offset,e);return this._offset+=e,t}_skip(e){return this._offset+=e,this}_scan(e,t=0){let r=this._offset,n=0;for(;this._dataView.getUint8(this._offset)!==t&&n<e;)n++,this._offset++;return n<e&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+r,n)}}new Uint8Array([0]);let o=[171,75,84,88,32,50,48,187,13,10,26,10];function s(e){return new TextDecoder().decode(e)}var l=r(14062),c=r(5217);let f={131:33776,132:35916,133:33777,134:35917,135:33778,136:35918,137:33779,138:35919,139:36283,140:36284,141:36285,142:36286,147:37492,148:37494,149:37496,150:37497,151:37493,152:37495,153:37488,154:37489,155:37490,156:37491,157:37808,158:37840,159:37809,160:37841,161:37810,162:37842,163:37811,164:37843,165:37812,166:37844,167:37813,168:37845,169:37814,170:37846,171:37815,172:37847,173:37816,174:37848,175:37817,176:37849,177:37818,178:37850,179:37819,180:37851,181:37820,182:37852,183:37821,184:37853,1000054e3:35843,0x3b9b9cf1:35842,1000066e3:37808,0x3b9bcbd1:37809,0x3b9bcbd2:37810,0x3b9bcbd3:37811,0x3b9bcbd4:37812,0x3b9bcbd5:37813,0x3b9bcbd6:37814,0x3b9bcbd7:37815,0x3b9bcbd8:37816,0x3b9bcbd9:37817,0x3b9bcbda:37818,0x3b9bcbdb:37819,0x3b9bcbdc:37820,0x3b9bcbdd:37821},u=[171,75,84,88,32,50,48,187,13,10,26,10];function m(e){let t=new Uint8Array(e);return!(t.byteLength<u.length||t[0]!==u[0]||t[1]!==u[1]||t[2]!==u[2]||t[3]!==u[3]||t[4]!==u[4]||t[5]!==u[5]||t[6]!==u[6]||t[7]!==u[7]||t[8]!==u[8]||t[9]!==u[9]||t[10]!==u[10]||t[11]!==u[11])}function p(e){var t;let r=function(e){let t=new Uint8Array(e.buffer,e.byteOffset,o.length);if(t[0]!==o[0]||t[1]!==o[1]||t[2]!==o[2]||t[3]!==o[3]||t[4]!==o[4]||t[5]!==o[5]||t[6]!==o[6]||t[7]!==o[7]||t[8]!==o[8]||t[9]!==o[9]||t[10]!==o[10]||t[11]!==o[11])throw Error("Missing KTX 2.0 identifier.");let r=new i,n=17*Uint32Array.BYTES_PER_ELEMENT,l=new a(e,o.length,n,!0);r.vkFormat=l._nextUint32(),r.typeSize=l._nextUint32(),r.pixelWidth=l._nextUint32(),r.pixelHeight=l._nextUint32(),r.pixelDepth=l._nextUint32(),r.layerCount=l._nextUint32(),r.faceCount=l._nextUint32();let c=l._nextUint32();r.supercompressionScheme=l._nextUint32();let f=l._nextUint32(),u=l._nextUint32(),m=l._nextUint32(),p=l._nextUint32(),d=l._nextUint64(),h=l._nextUint64(),g=new a(e,o.length+n,3*c*8,!0);for(let t=0;t<c;t++)r.levels.push({levelData:new Uint8Array(e.buffer,e.byteOffset+g._nextUint64(),g._nextUint64()),uncompressedByteLength:g._nextUint64()});let b=new a(e,f,u,!0),A={vendorId:b._skip(4)._nextUint16(),descriptorType:b._nextUint16(),versionNumber:b._nextUint16(),descriptorBlockSize:b._nextUint16(),colorModel:b._nextUint8(),colorPrimaries:b._nextUint8(),transferFunction:b._nextUint8(),flags:b._nextUint8(),texelBlockDimension:[b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8()],bytesPlane:[b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8()],samples:[]},C=(A.descriptorBlockSize/4-6)/4;for(let e=0;e<C;e++){let t={bitOffset:b._nextUint16(),bitLength:b._nextUint8(),channelType:b._nextUint8(),samplePosition:[b._nextUint8(),b._nextUint8(),b._nextUint8(),b._nextUint8()],sampleLower:-1/0,sampleUpper:1/0};64&t.channelType?(t.sampleLower=b._nextInt32(),t.sampleUpper=b._nextInt32()):(t.sampleLower=b._nextUint32(),t.sampleUpper=b._nextUint32()),A.samples[e]=t}r.dataFormatDescriptor.length=0,r.dataFormatDescriptor.push(A);let v=new a(e,m,p,!0);for(;v._offset<p;){let e=v._nextUint32(),t=v._scan(e),n=s(t);if(r.keyValue[n]=v._nextUint8Array(e-t.byteLength-1),n.match(/^ktx/i)){let e=s(r.keyValue[n]);r.keyValue[n]=e.substring(0,e.lastIndexOf("\0"))}let i=e%4?4-e%4:0;v._skip(i)}if(h<=0)return r;let B=new a(e,d,h,!0),S=B._nextUint16(),_=B._nextUint16(),I=B._nextUint32(),M=B._nextUint32(),R=B._nextUint32(),T=B._nextUint32(),x=[];for(let e=0;e<c;e++)x.push({imageFlags:B._nextUint32(),rgbSliceByteOffset:B._nextUint32(),rgbSliceByteLength:B._nextUint32(),alphaSliceByteOffset:B._nextUint32(),alphaSliceByteLength:B._nextUint32()});let y=d+B._offset,E=y+I,F=E+M,U=F+R,N=new Uint8Array(e.buffer,e.byteOffset+y,I),D=new Uint8Array(e.buffer,e.byteOffset+E,M);return r.globalData={endpointCount:S,selectorCount:_,imageDescs:x,endpointsData:N,selectorsData:D,tablesData:new Uint8Array(e.buffer,e.byteOffset+F,R),extendedData:new Uint8Array(e.buffer,e.byteOffset+U,T)},r}(new Uint8Array(e)),u=Math.max(1,r.levels.length),m=r.pixelWidth,p=r.pixelHeight,d=(t=r.vkFormat,(0,c.b)(f[t]));return void 0===d&&n.R.warn(`KTX2 container vkFormat ${r.vkFormat} does not map to a known texture format; returning texture levels without format metadata.`)(),(0,l.C)(r.levels,{mipMapLevels:u,width:m,height:p,sizeFunction:e=>e.uncompressedByteLength,textureFormat:d})}},14062(e,t,r){r.d(t,{C:()=>i});var n=r(5217);function i(e,t){let r=Array(t.mipMapLevels),i=t.textureFormat||(0,n.b)(t.internalFormat),a=t.internalFormat||(0,n.D)(t.textureFormat),o=t.width,s=t.height,l=0;for(let n=0;n<t.mipMapLevels;++n){var c,f,u,m,p,d,h,g,b;let A=(c=t,f=o,u=s,m=e,p=n,Array.isArray(m)?c.sizeFunction(m[p]):c.sizeFunction(f,u)),C={shape:"texture-level",compressed:!0,data:(d=e,h=n,g=l,b=A,Array.isArray(d)?d[h].levelData:new Uint8Array(d.buffer,d.byteOffset+g,b)),width:o,height:s,levelSize:A};void 0!==a&&(C.format=a),i&&(C.textureFormat=i),r[n]=C,o=Math.max(1,o>>1),s=Math.max(1,s>>1),l+=A}return r}},5217(e,t,r){r.d(t,{D:()=>o,b:()=>a});let n={34836:"rgba32float",33776:"bc1-rgb-unorm-webgl",35916:"bc1-rgb-unorm-srgb-webgl",33777:"bc1-rgba-unorm",35917:"bc1-rgba-unorm-srgb",33778:"bc2-rgba-unorm",35918:"bc2-rgba-unorm-srgb",33779:"bc3-rgba-unorm",35919:"bc3-rgba-unorm-srgb",36283:"bc4-r-unorm",36284:"bc4-r-snorm",36285:"bc5-rg-unorm",36286:"bc5-rg-snorm",37492:"etc2-rgb8unorm",37494:"etc2-rgb8unorm-srgb",37496:"etc2-rgb8a1unorm",37497:"etc2-rgb8a1unorm-srgb",37493:"etc2-rgba8unorm",37495:"etc2-rgba8unorm-srgb",37488:"eac-r11unorm",37489:"eac-r11snorm",37490:"eac-rg11unorm",37491:"eac-rg11snorm",37808:"astc-4x4-unorm",37840:"astc-4x4-unorm-srgb",37809:"astc-5x4-unorm",37841:"astc-5x4-unorm-srgb",37810:"astc-5x5-unorm",37842:"astc-5x5-unorm-srgb",37811:"astc-6x5-unorm",37843:"astc-6x5-unorm-srgb",37812:"astc-6x6-unorm",37844:"astc-6x6-unorm-srgb",37813:"astc-8x5-unorm",37845:"astc-8x5-unorm-srgb",37814:"astc-8x6-unorm",37846:"astc-8x6-unorm-srgb",37815:"astc-8x8-unorm",37847:"astc-8x8-unorm-srgb",37816:"astc-10x5-unorm",37848:"astc-10x5-unorm-srgb",37817:"astc-10x6-unorm",37849:"astc-10x6-unorm-srgb",37818:"astc-10x8-unorm",37850:"astc-10x8-unorm-srgb",37819:"astc-10x10-unorm",37851:"astc-10x10-unorm-srgb",37820:"astc-12x10-unorm",37852:"astc-12x10-unorm-srgb",37821:"astc-12x12-unorm",37853:"astc-12x12-unorm-srgb",35840:"pvrtc-rgb4unorm-webgl",35842:"pvrtc-rgba4unorm-webgl",35841:"pvrtc-rgb2unorm-webgl",35843:"pvrtc-rgba2unorm-webgl",36196:"etc1-rgb-unorm-webgl",35986:"atc-rgb-unorm-webgl",35987:"atc-rgba-unorm-webgl",34798:"atc-rgbai-unorm-webgl"},i=Object.fromEntries(Object.entries(n).map(([e,t])=>[t,Number(e)]));function a(e){if(void 0!==e)return n[e]}function o(e){if(void 0!==e)return i[e]}},51664(e,t,r){r.d(t,{$j:()=>s,_e:()=>l});var n=r(80155),i=r(82117),a=r(58091);let o={};function s(e={}){let t=e.useLocalLibraries??e.core?.useLocalLibraries,r=e.CDN??e.core?.CDN,n=e.modules;return{...void 0!==t?{useLocalLibraries:t}:{},...void 0!==r?{CDN:r}:{},...void 0!==n?{modules:n}:{}}}async function l(e,t=null,r={},s=null){return t&&(e=function(e,t,r={},o=null){if(r?.core)throw Error("loadLibrary: options.core must be pre-normalized");if(!r.useLocalLibraries&&e.startsWith("http"))return e;o=o||e;let s=r.modules||{};return s[o]?s[o]:n.Bd?r.CDN?((0,i.v)(r.CDN.startsWith("http")),`${r.CDN}/${t}@${a.x}/dist/libs/${o}`):n.xD?`../src/libs/${o}`:`modules/${t}/src/libs/${o}`:`modules/${t}/dist/libs/${o}`}(e,t,r,s)),o[e]=o[e]||c(e),await o[e]}async function c(e){if(e.endsWith("wasm"))return await f(e);if(!n.Bd){let{requireFromFile:t}=globalThis.loaders||{};try{let r=await t?.(e);if(r||!e.includes("/dist/libs/"))return r;return await t?.(e.replace("/dist/libs/","/src/libs/"))}catch(r){if(e.includes("/dist/libs/"))try{return await t?.(e.replace("/dist/libs/","/src/libs/"))}catch{}return console.error(r),null}}return n.xD?importScripts(e):function(e,t){if(!n.Bd){let{requireFromString:r}=globalThis.loaders||{};return r?.(e,t)}if(n.xD)return eval.call(globalThis,e),null;let r=document.createElement("script");r.id=t;try{r.appendChild(document.createTextNode(e))}catch(t){r.text=e}return document.body.appendChild(r),null}(await u(e),e)}async function f(e){let{readFileAsArrayBuffer:t}=globalThis.loaders||{};if(n.Bd||!t||e.startsWith("http")){let t=await fetch(e);return await t.arrayBuffer()}try{return await t(e)}catch{if(e.includes("/dist/libs/"))return await t(e.replace("/dist/libs/","/src/libs/"));throw Error(`Failed to load ArrayBuffer from ${e}`)}}async function u(e){let{readFileAsText:t}=globalThis.loaders||{};if(n.Bd||!t||e.startsWith("http")){let t=await fetch(e);return await t.text()}try{return await t(e)}catch{if(e.includes("/dist/libs/"))return await t(e.replace("/dist/libs/","/src/libs/"));throw Error(`Failed to load text from ${e}`)}}},92207(e,t,r){r.d(t,{o:()=>l});var n=r(6706),i=r(35097),a=r(13559),o=r(354),s=r(29995);class l extends o.V{children;constructor(e={}){let{children:t=[]}=e=Array.isArray(e)?{children:e}:e;a.R.assert(t.every(e=>e instanceof o.V),"every child must an instance of ScenegraphNode"),super(e),this.children=t}getBounds(){let e=(0,s.hw)();return this.traverse((t,{worldMatrix:r})=>{let i=t.getBounds();if(!i)return;let a=new n.k(r).multiplyRight(t.matrix);(0,s.eI)(e,i,a)}),(0,s.$f)(e)?e:null}destroy(){this.children.forEach(e=>e.destroy()),this.removeAll(),super.destroy()}add(...e){for(let t of e)Array.isArray(t)?this.add(...t):this.children.push(t);return this}remove(e){let t=this.children,r=t.indexOf(e);return r>-1&&t.splice(r,1),this}removeAll(){return this.children=[],this}traverse(e,{worldMatrix:t=new n.k}={}){if(!this.display)return;let r=new n.k(t).multiplyRight(this.matrix);for(let t of this.children)t.display&&(t instanceof l?t.traverse(e,{worldMatrix:r}):e(t,{worldMatrix:r}))}traverseDepthSorted(e,{viewMatrix:t,worldMatrix:r=new n.k,order:a="back-to-front"}){let o=new n.k(t),s=[];this.traverse((e,t)=>{let r=e.getBounds(),a=r?new i.P(r[0]).add(r[1]).divide([2,2,2]):new i.P,l=new n.k(t.worldMatrix).multiplyRight(e.matrix);l.transformAsPoint(a,a),o.transformAsPoint(a,a),s.push({node:e,context:{worldMatrix:l,bounds:r,depth:-a[2]},index:s.length})},{worldMatrix:new n.k(r)});let l="back-to-front"===a?-1:1;for(let{node:t,context:r}of(s.sort((e,t)=>l*(e.context.depth-t.context.depth)||e.index-t.index),s))e(t,r)}preorderTraversal(e,{worldMatrix:t=new n.k}={}){let r=new n.k(t).multiplyRight(this.matrix);for(let t of(e(this,{worldMatrix:r}),this.children))t instanceof l?t.preorderTraversal(e,{worldMatrix:r}):e(t,{worldMatrix:r})}}},84793(e,t,r){r.d(t,{s:()=>a});var n=r(354),i=r(29995);class a extends n.V{model;instanceMatrices;bounds=null;managedResources;constructor(e){super(e),this.model=e.model,this.managedResources=e.managedResources||[],this.instanceMatrices=e.instanceMatrices||null,this.bounds=e.bounds?this.instanceMatrices?function(e,t){let r=(0,i.hw)();for(let n of t)(0,i.eI)(r,e,n);return(0,i.$f)(r)?r:null}(e.bounds,this.instanceMatrices):e.bounds:null,this.setProps(e)}destroy(){this.model&&(this.model.destroy(),this.model=null),this.managedResources.forEach(e=>e.destroy()),this.managedResources=[]}getBounds(){return this.bounds}draw(e){return this.model.draw(e)}}},29995(e,t,r){r.d(t,{$f:()=>s,eI:()=>o,hw:()=>a});var n=r(6706),i=r(35097);function a(){return[[1/0,1/0,1/0],[-1/0,-1/0,-1/0]]}function o(e,t,r){let a=new n.k(r);for(let r=0;r<8;r++){let n=new i.P(t[1&r?1:0][0],t[2&r?1:0][1],t[4&r?1:0][2]);a.transformAsPoint(n,n);for(let t=0;t<3;t++)e[0][t]=Math.min(e[0][t],n[t]),e[1][t]=Math.max(e[1][t],n[t])}}function s(e){return Number.isFinite(e[0][0])}},354(e,t,r){r.d(t,{V:()=>s});var n=r(6706),i=r(35097),a=r(51208);function o(e,t){if(!e)throw Error(t)}class s{id;matrix=new n.k;display=!0;position=new i.P;rotation=new i.P;scale=new i.P(1,1,1);userData={};props={};constructor(e={}){let{id:t}=e;this.id=t||(0,a.L)(this.constructor.name),this._setScenegraphNodeProps(e)}getBounds(){return null}destroy(){}delete(){this.destroy()}setProps(e){return this._setScenegraphNodeProps(e),this}toString(){return`{type: ScenegraphNode, id: ${this.id})}`}setPosition(e){return o(3===e.length,"setPosition requires vector argument"),this.position=e,this}setRotation(e){return o(3===e.length||4===e.length,"setRotation requires vector argument"),this.rotation=e,this}setScale(e){return o(3===e.length,"setScale requires vector argument"),this.scale=e,this}setMatrix(e,t=!0){t?this.matrix.copy(e):this.matrix=e}setMatrixComponents(e){let{position:t,rotation:r,scale:n,update:i=!0}=e;return t&&this.setPosition(t),r&&this.setRotation(r),n&&this.setScale(n),i&&this.updateMatrix(),this}updateMatrix(){if(this.matrix.identity(),this.matrix.translate(this.position),4===this.rotation.length){let e=new n.k().fromQuaternion(this.rotation);this.matrix.multiplyRight(e)}else this.matrix.rotateXYZ(this.rotation);return this.matrix.scale(this.scale),this}update({position:e,rotation:t,scale:r}={}){return e&&this.setPosition(e),t&&this.setRotation(t),r&&this.setScale(r),this.updateMatrix(),this}getCoordinateUniforms(e,t){t=t||this.matrix;let r=new n.k(e).multiplyRight(t),i=r.invert(),a=i.transpose();return{viewMatrix:e,modelMatrix:t,objectMatrix:t,worldMatrix:r,worldInverseMatrix:i,worldInverseTransposeMatrix:a}}_setScenegraphNodeProps(e){void 0!==e.display&&(this.display=e.display),e?.position&&this.setPosition(e.position),e?.rotation&&this.setRotation(e.rotation),e?.scale&&this.setScale(e.scale),this.updateMatrix(),e?.matrix&&this.setMatrix(e.matrix),Object.assign(this.props,e)}}},70743(e,t,r){r.d(t,{v:()=>eU});var n=r(84793),i=r(20131),a=r(13125),o=r(31130),s=r(60691),l=r(38550),c=r(42188),f=r(82645),u=r(34037),m=r(92790),p=r(51208);class d{id;device;factory;shaderInputs;bindings={};_uniformStore;_bindGroupCacheToken={};_dynamicResourceGenerations={};constructor(e,t={}){this.id=t.id||(0,p.L)("material"),this.device=e,this.factory=t.factory||new g(e,{modules:t.modules||t.shaderInputs?.getModules()||[]});let r=Object.fromEntries((t.shaderInputs?.getModules()||this.factory.modules).map(e=>[e.name,e]));for(let[e,n]of(this.shaderInputs=t.shaderInputs||new i.l(r),this._uniformStore=new a.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if(this.ownsModule(e)&&(0,m.fX)(n)){let t=this._uniformStore.getManagedUniformBuffer(e);this.bindings[`${e}Uniforms`]=t}this.updateShaderInputs(),t.bindings&&this._replaceOwnedBindings(t.bindings)}destroy(){this._uniformStore.destroy()}clone(e={}){let t=this.factory.createMaterial({id:e.id,shaderInputs:e.shaderInputs,bindings:{...this.getResourceBindings(),...e.bindings}});return e.shaderInputs||t.setProps(this.shaderInputs.getUniformValues()),e.moduleProps&&t.setProps(e.moduleProps),t.updateShaderInputs(),t}ownsBinding(e){return this.factory.ownsBinding(e)}ownsModule(e){return this.factory.ownsModule(e)}setProps(e){this.shaderInputs.setProps(e)}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this._setOwnedBindings(this.shaderInputs.getBindingValues())&&(this._bindGroupCacheToken={})}getResourceBindings(){let e={};for(let[t,r]of Object.entries(this.bindings))b(t)||(e[t]=r);return e}getBindings(e={bindings:[]}){this._syncDynamicResourceGenerations();let t={};for(let[r,n]of Object.entries(this.bindings))if((0,u.YT)(n)){let i=(0,u.l0)(e,r,{fallbackGroup:h}),a=i?n.resolveTextureBinding(i):null;a&&(t[r]=a)}else n instanceof f.kL?t[r]=n.buffer:(0,f.Hd)(n)?t[r]=(0,f.j8)(n):t[r]=n;return this._syncDynamicResourceGenerations(),t}getBindingsByGroup(e={bindings:[]}){return this.factory.getBindingsByGroup(this.getBindings(e))}getBindGroupCacheKey(e){return this._syncDynamicResourceGenerations(),e===h?this._bindGroupCacheToken:null}getBindingsUpdateTimestamp(){let e=0;for(let t of Object.values(this.bindings))t instanceof o.X?e=Math.max(e,t.texture.updateTimestamp):t instanceof s.h||t instanceof l.g||t instanceof c.r||t instanceof f.kL?e=Math.max(e,t.updateTimestamp):(0,u.YT)(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:(0,f.Hd)(t)&&(e=Math.max(e,(t.buffer instanceof f.kL,t.buffer.updateTimestamp)));return e}_replaceOwnedBindings(e){this._setOwnedBindings(e)&&(this._bindGroupCacheToken={})}_setOwnedBindings(e){let t=!1;for(let[r,n]of Object.entries(e))void 0!==n&&this.ownsBinding(r)&&this.bindings[r]!==n&&(this.bindings[r]=n,t=!0);return t}_syncDynamicResourceGenerations(){let e={},t=!1;for(let[n,i]of Object.entries(this.bindings)){var r;let a=(r=i,(0,u.YT)(r)?r.generation:(0,f.Xk)(r)?.generation??null);null!==a&&(e[n]=a,this._dynamicResourceGenerations[n]!==a&&(t=!0))}Object.keys(e).length!==Object.keys(this._dynamicResourceGenerations).length&&(t=!0),this._dynamicResourceGenerations=e,t&&(this._bindGroupCacheToken={})}}let h=3;class g{device;modules;_materialBindingNames;_materialModuleNames;constructor(e,t={}){this.device=e,this.modules=t.modules||[];let r=new i.l(Object.fromEntries(this.modules.map(e=>[e.name,e])));this._materialBindingNames=function(e){let t=new Set;for(let r of Object.values(e.modules))for(let e of r.bindingLayout||[])e.group===h&&t.add(e.name);return t}(r),this._materialModuleNames=function(e){let t=new Set;for(let r of Object.values(e.modules))r.name&&r.bindingLayout?.some(e=>e.group===h&&e.name===r.name)&&t.add(r.name);return t}(r)}createMaterial(e={}){return new d(this.device,{...e,factory:this})}getBindingNames(){return Array.from(this._materialBindingNames)}ownsBinding(e){if(this._materialBindingNames.has(e))return!0;let t=b(e);return!!t&&this._materialModuleNames.has(t)}ownsModule(e){return this._materialModuleNames.has(e)}getBindingsByGroup(e){return Object.keys(e).length>0?{[h]:e}:{}}}function b(e){return e.endsWith("Uniforms")?e.slice(0,-8):null}var A=r(92207),C=r(62837),v=r(69457);function B(e){let t=e.value;if(t instanceof Float32Array)return t;let r=new Float32Array(t.length),n=S(t),i=t instanceof Int8Array||t instanceof Int16Array||t instanceof Int32Array;for(let a=0;a<t.length;a++){let o=Number(t[a]);r[a]=e.normalized&&n?i?Math.max(o/n,-1):o/n:o}return r}function S(e){return e instanceof Int8Array?127:e instanceof Uint8Array||e instanceof Uint8ClampedArray?255:e instanceof Int16Array?32767:e instanceof Uint16Array?65535:e instanceof Int32Array?0x7fffffff:0xffffffff*(e instanceof Uint32Array)}var _=r(9696),I=r(13559),M=r(78777),R=r(12434),T=r(4533);let x={"+X":0,"-X":1,"+Y":2,"-Y":3,"+Z":4,"-Z":5};function y(e){return e?Array.isArray(e)?e[0]??null:e:null}function E(e){if((0,T.x)(e))return(0,T.c)(e);if("object"==typeof e&&"width"in e&&"height"in e)return{width:e.width,height:e.height};throw Error("Unsupported mip-level data")}function F(e){let{textureFormat:t,format:r}=e;if(t&&r&&t!==r)throw Error(`Conflicting texture formats "${t}" and "${r}" provided for the same mip level`);return t??r}function U(e){let t=x[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}function N(e){throw Error("setTexture1DData not supported in WebGL.")}function D(e,t,r,n){let i=Array.isArray(t)?t:[t],a=[];for(let t=0;t<i.length;t++){let o=i[t];if((0,T.x)(o))a.push({type:"external-image",image:o,z:e,mipLevel:t});else if("object"==typeof o&&null!==o&&"data"in o&&"width"in o&&"height"in o)a.push({type:"texture-data",data:o,textureFormat:F(o),z:e,mipLevel:t});else if(ArrayBuffer.isView(o)&&r)a.push({type:"texture-data",data:{data:o,width:Math.max(1,r.width>>t),height:Math.max(1,r.height>>t),...n?{format:n}:{}},textureFormat:n,z:e,mipLevel:t});else throw Error("Unsupported 2D mip-level payload")}return a}function O(e){let t=[];for(let r=0;r<e.length;r++)t.push(...D(r,e[r]));return t}function L(e){let t=[];for(let r=0;r<e.length;r++)t.push(...D(r,e[r]));return t}function H(e){let t=[];for(let[r,n]of Object.entries(e)){let e=U(r);t.push(...D(e,n))}return t}function w(e){let t=[];return e.forEach((e,r)=>{for(let[n,i]of Object.entries(e)){let e=6*r+U(n);t.push(...D(e,i))}}),t}class G{device;id;props;_texture=null;_sampler=null;_view=null;ready;isReady=!1;destroyed=!1;generation=0;updateTimestamp;resolveReady=()=>{};rejectReady=()=>{};get texture(){if(!this._texture)throw Error("Texture not initialized yet");return this._texture}get sampler(){if(!this._sampler)throw Error("Sampler not initialized yet");return this._sampler}get view(){if(!this._view)throw Error("View not initialized yet");return this._view}get[Symbol.toStringTag](){return"DynamicTexture"}toString(){let e=this._texture?.width??this.props.width??"?",t=this._texture?.height??this.props.height??"?";return`DynamicTexture:"${this.id}":${e}x${t}px:(${this.isReady?"ready":"loading..."})`}resolveTextureBinding(e){return this.isReady?this.texture:null}constructor(e,t){this.device=e;let r=(0,p.L)("dynamic-texture");this.props={...G.defaultProps,id:r,...t,data:null},this.id=this.props.id,this.ready=new Promise((e,t)=>{this.resolveReady=e,this.rejectReady=t}),this.updateTimestamp=this.device.incrementTimestamp(),this.initAsync(t)}async initAsync(e){try{let t=await this._loadAllData(e);this._checkNotDestroyed();let r=t.data?function(e){if(!e.data)return[];let t=e.width&&e.height?{width:e.width,height:e.height}:void 0,r="format"in e?e.format:void 0;switch(e.dimension){case"1d":return N(e.data);case"2d":return D(0,e.data,t,r);case"3d":return O(e.data);case"2d-array":return L(e.data);case"cube":return H(e.data);case"cube-array":return w(e.data);default:throw Error(`Unhandled dimension ${e.dimension}`)}}({...t,width:e.width,height:e.height,format:e.format}):[],n="format"in e&&void 0!==e.format,i="usage"in e&&void 0!==e.usage,a=(()=>{if(this.props.width&&this.props.height)return{width:this.props.width,height:this.props.height};let e=function(e){let{dimension:t,data:r}=e;if(!r)return null;switch(t){case"1d":{let e=y(r);if(!e)return null;let{width:t}=E(e);return{width:t,height:1}}case"2d":{if(ArrayBuffer.isView(r))return null;let e=y(r);return e?E(e):null}case"3d":case"2d-array":{if(!Array.isArray(r)||0===r.length)return null;let e=y(r[0]);return e?E(e):null}case"cube":{let e=Object.keys(r)[0]??null;if(!e)return null;let t=y(r[e]);return t?E(t):null}case"cube-array":{if(!Array.isArray(r)||0===r.length)return null;let e=r[0],t=Object.keys(e)[0]??null;if(!t)return null;let n=y(e[t]);return n?E(n):null}default:return null}}(t);return e||{width:this.props.width||1,height:this.props.height||1}})();if(!a||a.width<=0||a.height<=0)throw Error(`${this} size could not be determined or was zero`);let o=function(e,t,r,n){if(0===t.length)return{subresources:t,mipLevels:1,format:n.format,hasExplicitMipChain:!1};let i=new Map;for(let e of t){let t=i.get(e.z)??[];t.push(e),i.set(e.z,t)}let a=t.some(e=>e.mipLevel>0),o=n.format,s=1/0,l=[];for(let[t,n]of i){let i=[...n].sort((e,t)=>e.mipLevel-t.mipLevel),a=i[0];if(!a||0!==a.mipLevel)throw Error(`DynamicTexture: slice ${t} is missing mip level 0`);let c=V(e,a);if(c.width!==r.width||c.height!==r.height)throw Error(`DynamicTexture: slice ${t} base level dimensions ${c.width}x${c.height} do not match expected ${r.width}x${r.height}`);let f=P(a);if(f){if(o&&o!==f)throw Error(`DynamicTexture: slice ${t} base level format "${f}" does not match texture format "${o}"`);o=f}let u=o&&e.isTextureFormatCompressed(o)?function(e,t,r,n){let{blockWidth:i=1,blockHeight:a=1}=e.getTextureFormatInfo(n),o=1;for(let e=1;;e++){let n=Math.max(1,t>>e),s=Math.max(1,r>>e);if(n<i||s<a)break;o++}return o}(e,c.width,c.height,o):e.getMipLevelCount(c.width,c.height),m=0;for(let t=0;t<i.length;t++){let r=i[t];if(!r||r.mipLevel!==t||t>=u)break;let n=V(e,r),a=Math.max(1,c.width>>t),s=Math.max(1,c.height>>t);if(n.width!==a||n.height!==s)break;let f=P(r);if(f&&(o||(o=f),f!==o))break;m++,l.push(r)}s=Math.min(s,m)}let c=Number.isFinite(s)?Math.max(1,s):1;return{subresources:l.filter(e=>e.mipLevel<c),mipLevels:c,format:o,hasExplicitMipChain:a}}(this.device,r,a,{format:n?e.format:void 0}),s=o.format??this.props.format,c={...this.props,...a,format:s,mipLevels:1,data:void 0};this.device.isTextureFormatCompressed(s)&&!i&&(c.usage=l.g.SAMPLE|l.g.COPY_DST);let f=this.props.mipmaps&&!o.hasExplicitMipChain&&!this.device.isTextureFormatCompressed(s);if("webgpu"===this.device.type&&f){let e="3d"===this.props.dimension?l.g.SAMPLE|l.g.STORAGE|l.g.COPY_DST|l.g.COPY_SRC:l.g.SAMPLE|l.g.RENDER|l.g.COPY_DST|l.g.COPY_SRC;c.usage|=e}let u=this.device.getMipLevelCount(c.width,c.height),m=o.hasExplicitMipChain?o.mipLevels:"auto"===this.props.mipLevels?u:Math.max(1,Math.min(u,this.props.mipLevels??1)),p={...c,mipLevels:m};this._texture=this.device.createTexture(p),this._sampler=this.texture.sampler,this._view=this.texture.view,this._touchGeneration(),o.subresources.length&&this._setTextureSubresources(o.subresources),!this.props.mipmaps||o.hasExplicitMipChain||f||I.R.warn(`${this} skipping auto-generated mipmaps for compressed texture format`)(),f&&this.generateMipmaps(),this.isReady=!0,this.resolveReady(this.texture),I.R.info(1,`${this} created`)()}catch(t){let e=t instanceof Error?t:Error(String(t));this.rejectReady(e)}}destroy(){this._texture&&(this._texture.destroy(),this._texture=null,this._sampler=null,this._view=null),this.isReady=!1,this.destroyed=!0}generateMipmaps(){"webgl"===this.device.type?(this.texture.generateMipmapsWebGL(),this._touch()):"webgpu"===this.device.type?(this.device.generateMipmapsWebGPU(this.texture),this._touch()):I.R.warn(`${this} mipmaps not supported on ${this.device.type}`)}setSampler(e={}){this._checkReady();let t=e instanceof M.L?e:this.device.createSampler(e);this.texture.setSampler(t),this._sampler=t,this._touchGeneration()}async readBuffer(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,n=e.depthOrArrayLayers??this.texture.depth,i=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:n}),a=this.device.createBuffer({byteLength:i.byteLength,usage:s.h.COPY_DST|s.h.MAP_READ});this.texture.readBuffer({...e,width:t,height:r,depthOrArrayLayers:n},a);let o=this.device.createFence();return await o.signaled,o.destroy(),a}async readAsync(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,n=e.depthOrArrayLayers??this.texture.depth,i=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:n}),a=await this.readBuffer(e),o=await a.readAsync(0,i.byteLength);return a.destroy(),o.buffer instanceof ArrayBuffer?o.buffer:o.slice().buffer}resize(e){if(this._checkReady(),e.width===this.texture.width&&e.height===this.texture.height)return!1;let t=this.texture;return this._texture=t.clone(e),this._sampler=this.texture.sampler,this._view=this.texture.view,t.destroy(),this._touchGeneration(),I.R.info(`${this} resized`),!0}getCubeFaceIndex(e){let t=x[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}getCubeArrayFaceIndex(e,t){return 6*e+this.getCubeFaceIndex(t)}setTexture1DData(e){if(this._checkReady(),"1d"!==this.texture.props.dimension)throw Error(`${this} is not 1d`);let t=N(e);this._setTextureSubresources(t)}setTexture2DData(e,t=0){if(this._checkReady(),"2d"!==this.texture.props.dimension)throw Error(`${this} is not 2d`);let r=D(t,e);this._setTextureSubresources(r)}setTexture3DData(e){if("3d"!==this.texture.props.dimension)throw Error(`${this} is not 3d`);let t=O(e);this._setTextureSubresources(t)}setTextureArrayData(e){if("2d-array"!==this.texture.props.dimension)throw Error(`${this} is not 2d-array`);let t=L(e);this._setTextureSubresources(t)}setTextureCubeData(e){if("cube"!==this.texture.props.dimension)throw Error(`${this} is not cube`);let t=H(e);this._setTextureSubresources(t)}setTextureCubeArrayData(e){if("cube-array"!==this.texture.props.dimension)throw Error(`${this} is not cube-array`);let t=w(e);this._setTextureSubresources(t)}_setTextureSubresources(e){for(let t of e){let{z:e,mipLevel:r}=t;switch(t.type){case"external-image":let{image:n,flipY:i}=t;this.texture.copyExternalImage({image:n,z:e,mipLevel:r,flipY:i});break;case"texture-data":let{data:a,textureFormat:o}=t;if(o&&o!==this.texture.format)throw Error(`${this} mip level ${r} uses format "${o}" but texture format is "${this.texture.format}"`);this.texture.writeData(a.data,{x:0,y:0,z:e,width:a.width,height:a.height,depthOrArrayLayers:1,mipLevel:r});break;default:throw Error("Unsupported 2D mip-level payload")}}e.length>0&&this._touch()}async _loadAllData(e){let t=await J(e.data);return{dimension:e.dimension??"2d",data:t??null}}_checkNotDestroyed(){this.destroyed&&I.R.warn(`${this} already destroyed`)}_checkReady(){this.isReady||I.R.warn(`${this} Cannot perform this operation before ready`)}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_touchGeneration(){this.generation++,this._touch()}static defaultProps={...l.g.defaultProps,dimension:"2d",data:null,mipmaps:!1}}function P(e){if("texture-data"===e.type)return e.textureFormat??F(e.data)}function V(e,t){switch(t.type){case"external-image":return e.getExternalImageSize(t.image);case"texture-data":return{width:t.data.width,height:t.data.height};default:throw Error("Unsupported texture subresource")}}async function J(e){if(Array.isArray(e=await e))return await Promise.all(e.map(J));if(e&&"object"==typeof e&&e.constructor===Object){let t=e,r=await Promise.all(Object.values(t).map(J)),n=Object.keys(t),i={};for(let e=0;e<n.length;e++)i[n[e]]=r[e];return i}return e}var k=r(6706);let K={props:{},uniforms:{},bindings:{},name:"skin",bindingLayout:[{name:"skin",group:0},{name:"skinJointMatrices",group:0,visibility:1}],dependencies:[],source:`
struct skinUniforms {
  jointMatrix: array<mat4x4<f32>, 64>,
};

@group(0) @binding(auto) var<uniform> skin: skinUniforms;

#ifdef HAS_INSTANCED_SKIN
@group(0) @binding(auto) var<storage, read> skinJointMatrices: array<mat4x4<f32>>;

fn getInstancedSkinMatrix(
  weights: vec4f,
  joints: vec4u,
  instanceIndex: u32,
  jointsPerInstance: u32
) -> mat4x4<f32> {
  let firstJoint = instanceIndex * jointsPerInstance;
  return (weights.x * skinJointMatrices[firstJoint + joints.x])
       + (weights.y * skinJointMatrices[firstJoint + joints.y])
       + (weights.z * skinJointMatrices[firstJoint + joints.z])
       + (weights.w * skinJointMatrices[firstJoint + joints.w]);
}
#endif

fn getSkinMatrix(weights: vec4f, joints: vec4u) -> mat4x4<f32> {
  return (weights.x * skin.jointMatrix[joints.x])
       + (weights.y * skin.jointMatrix[joints.y])
       + (weights.z * skin.jointMatrix[joints.z])
       + (weights.w * skin.jointMatrix[joints.w]);
}
`,vs:`\

layout(std140) uniform skinUniforms {
  mat4 jointMatrix[SKIN_MAX_JOINTS];
} skin;

#ifdef HAS_INSTANCED_SKIN
uniform highp sampler2D skinJointMatrices;

mat4 getInstancedJointMatrix(uint jointIndex, uint instanceIndex) {
  int firstColumn = int(jointIndex * 4u);
  int row = int(instanceIndex);
  return mat4(
    texelFetch(skinJointMatrices, ivec2(firstColumn, row), 0),
    texelFetch(skinJointMatrices, ivec2(firstColumn + 1, row), 0),
    texelFetch(skinJointMatrices, ivec2(firstColumn + 2, row), 0),
    texelFetch(skinJointMatrices, ivec2(firstColumn + 3, row), 0)
  );
}

mat4 getInstancedSkinMatrix(
  vec4 weights,
  uvec4 joints,
  uint instanceIndex,
  uint jointsPerInstance
) {
  return (weights.x * getInstancedJointMatrix(joints.x, instanceIndex))
       + (weights.y * getInstancedJointMatrix(joints.y, instanceIndex))
       + (weights.z * getInstancedJointMatrix(joints.z, instanceIndex))
       + (weights.w * getInstancedJointMatrix(joints.w, instanceIndex));
}
#endif

mat4 getSkinMatrix(vec4 weights, uvec4 joints) {
  return (weights.x * skin.jointMatrix[joints.x])
       + (weights.y * skin.jointMatrix[joints.y])
       + (weights.z * skin.jointMatrix[joints.z])
       + (weights.w * skin.jointMatrix[joints.w]);
}

`,fs:"",defines:{SKIN_MAX_JOINTS:64},getUniforms:(e={},t)=>{let{jointMatrices:r,skinJointMatrices:n,scenegraphsFromGLTF:i,skinIndex:a=0,meshWorldMatrix:o}=e,s=n?{skinJointMatrices:n}:{};if(r){var l;let e;return{jointMatrix:(l=r,(e=new Float32Array(1024)).set(l instanceof Float32Array?l.subarray(0,e.length):l.slice(0,e.length)),e),...s}}let c=i?.gltf?.skins?.[a];if(!c)return{jointMatrix:[],...s};let{inverseBindMatrices:f,joints:u,skeleton:m}=c,p=i.gltfNodeIndexToNodeMap,d=new Map,h=void 0===m?void 0:p?.get(m);for(let e of h?[h]:i.scenes||[])e.preorderTraversal((e,{worldMatrix:t})=>{d.set(e.id,t)});let g=o?new k.k(o).invert():null,b=new Float32Array(1024),A=f?.value;for(let e=0;e<Math.min(u.length,64);e++){let t=p?.get(u[e]);if(!t)continue;let r=d.get(t.id)||t.matrix,n=g?new k.k(g).multiplyRight(r):new k.k(r);A&&A.length>=(e+1)*16&&n.multiplyRight(new k.k(Array.from(A.slice(16*e,(e+1)*16)))),b.set(n,16*e)}return{jointMatrix:b,...s}},uniformTypes:{jointMatrix:["mat4x4<f32>",64]}},j={name:"gpuAnimation",props:{},uniforms:{},bindings:{},source:`
#ifdef HAS_GPU_CROWD_ANIMATION
@group(0) @binding(auto) var<storage, read> gpuAnimationFrames: array<vec4f>;

fn readGPUAnimationFrame(frame: u32, offset: u32, frameStride: u32) -> vec4f {
  return gpuAnimationFrames[frame * frameStride + offset];
}

fn sampleGPUAnimationFrame(
  frames: vec4f,
  blend: vec4f,
  offset: u32,
  frameStride: u32
) -> vec4f {
  let first = mix(
    readGPUAnimationFrame(u32(frames.x), offset, frameStride),
    readGPUAnimationFrame(u32(frames.y), offset, frameStride),
    frames.z
  );
  if (blend.w <= 0.0) {
    return first;
  }
  let second = mix(
    readGPUAnimationFrame(u32(blend.x), offset, frameStride),
    readGPUAnimationFrame(u32(blend.y), offset, frameStride),
    blend.z
  );
  return mix(first, second, blend.w);
}

fn sampleGPUAnimationMatrix(
  frames: vec4f,
  blend: vec4f,
  firstColumn: u32,
  frameStride: u32
) -> mat4x4f {
  return mat4x4f(
    sampleGPUAnimationFrame(frames, blend, firstColumn, frameStride),
    sampleGPUAnimationFrame(frames, blend, firstColumn + 1u, frameStride),
    sampleGPUAnimationFrame(frames, blend, firstColumn + 2u, frameStride),
    sampleGPUAnimationFrame(frames, blend, firstColumn + 3u, frameStride)
  );
}

fn getGPUAnimatedSkinMatrix(
  weights: vec4f,
  joints: vec4u,
  frames: vec4f,
  blend: vec4f,
  frameStride: u32
) -> mat4x4f {
  return weights.x * sampleGPUAnimationMatrix(frames, blend, 4u + joints.x * 4u, frameStride)
       + weights.y * sampleGPUAnimationMatrix(frames, blend, 4u + joints.y * 4u, frameStride)
       + weights.z * sampleGPUAnimationMatrix(frames, blend, 4u + joints.z * 4u, frameStride)
       + weights.w * sampleGPUAnimationMatrix(frames, blend, 4u + joints.w * 4u, frameStride);
}
#endif

#ifdef HAS_INSTANCED_MORPH
@group(0) @binding(auto) var<storage, read> gpuMorphTargets: array<vec4f>;

#ifndef HAS_GPU_CROWD_ANIMATION
@group(0) @binding(auto) var<storage, read> gpuMorphWeights: array<vec4f>;
#endif

fn getGPUCrowdMorphWeight(
  instanceIndex: u32,
  targetIndex: u32,
  targetCount: u32,
  jointsPerInstance: u32,
  frames: vec4f,
  blend: vec4f,
  frameStride: u32
) -> f32 {
#ifdef HAS_GPU_CROWD_ANIMATION
  let offset = 4u + jointsPerInstance * 4u + targetIndex;
  return sampleGPUAnimationFrame(frames, blend, offset, frameStride).x;
#else
  let packedCount = (targetCount + 3u) / 4u;
  let packedWeights = gpuMorphWeights[instanceIndex * packedCount + targetIndex / 4u];
  return packedWeights[targetIndex % 4u];
#endif
}

fn getGPUCrowdMorphDelta(
  instanceIndex: u32,
  vertexIndex: u32,
  attributeIndex: u32,
  vertexCount: u32,
  targetCount: u32,
  jointsPerInstance: u32,
  frames: vec4f,
  blend: vec4f,
  frameStride: u32
) -> vec3f {
  var result = vec3f(0.0);
  for (var targetIndex = 0u; targetIndex < targetCount; targetIndex++) {
    let weight = getGPUCrowdMorphWeight(
      instanceIndex,
      targetIndex,
      targetCount,
      jointsPerInstance,
      frames,
      blend,
      frameStride
    );
    let offset = (targetIndex * 3u + attributeIndex) * vertexCount + vertexIndex;
    result += gpuMorphTargets[offset].xyz * weight;
  }
  return result;
}
#endif
`,vs:`
#ifdef HAS_GPU_CROWD_ANIMATION
uniform highp sampler2D gpuAnimationFrames;

vec4 sampleGPUAnimationFrame(vec4 frames, vec4 blend, int offset) {
  vec4 first = mix(
    texelFetch(gpuAnimationFrames, ivec2(offset, int(frames.x)), 0),
    texelFetch(gpuAnimationFrames, ivec2(offset, int(frames.y)), 0),
    frames.z
  );
  if (blend.w <= 0.0) {
    return first;
  }
  vec4 second = mix(
    texelFetch(gpuAnimationFrames, ivec2(offset, int(blend.x)), 0),
    texelFetch(gpuAnimationFrames, ivec2(offset, int(blend.y)), 0),
    blend.z
  );
  return mix(first, second, blend.w);
}

mat4 sampleGPUAnimationMatrix(vec4 frames, vec4 blend, int firstColumn) {
  return mat4(
    sampleGPUAnimationFrame(frames, blend, firstColumn),
    sampleGPUAnimationFrame(frames, blend, firstColumn + 1),
    sampleGPUAnimationFrame(frames, blend, firstColumn + 2),
    sampleGPUAnimationFrame(frames, blend, firstColumn + 3)
  );
}

mat4 getGPUAnimatedSkinMatrix(vec4 weights, uvec4 joints, vec4 frames, vec4 blend) {
  return weights.x * sampleGPUAnimationMatrix(frames, blend, 4 + int(joints.x) * 4)
       + weights.y * sampleGPUAnimationMatrix(frames, blend, 4 + int(joints.y) * 4)
       + weights.z * sampleGPUAnimationMatrix(frames, blend, 4 + int(joints.z) * 4)
       + weights.w * sampleGPUAnimationMatrix(frames, blend, 4 + int(joints.w) * 4);
}
#endif

#ifdef HAS_INSTANCED_MORPH
uniform highp sampler2D gpuMorphTargets;

#ifndef HAS_GPU_CROWD_ANIMATION
uniform highp sampler2D gpuMorphWeights;
#endif

float getGPUCrowdMorphWeight(
  uint instanceIndex,
  uint targetIndex,
  uint jointsPerInstance,
  vec4 frames,
  vec4 blend
) {
#ifdef HAS_GPU_CROWD_ANIMATION
  int offset = 4 + int(jointsPerInstance) * 4 + int(targetIndex);
  return sampleGPUAnimationFrame(frames, blend, offset).x;
#else
  vec4 packedWeights = texelFetch(
    gpuMorphWeights,
    ivec2(int(targetIndex / 4u), int(instanceIndex)),
    0
  );
  return packedWeights[int(targetIndex % 4u)];
#endif
}

vec3 getGPUCrowdMorphDelta(
  uint instanceIndex,
  uint vertexIndex,
  uint attributeIndex,
  uint targetCount,
  uint jointsPerInstance,
  vec4 frames,
  vec4 blend
) {
  vec3 result = vec3(0.0);
  for (uint targetIndex = 0u; targetIndex < targetCount; targetIndex++) {
    float weight = getGPUCrowdMorphWeight(
      instanceIndex,
      targetIndex,
      jointsPerInstance,
      frames,
      blend
    );
    result += texelFetch(
      gpuMorphTargets,
      ivec2(int(vertexIndex), int(targetIndex * 3u + attributeIndex)),
      0
    ).xyz * weight;
  }
  return result;
}
#endif
`,fs:"",bindingLayout:[{name:"gpuAnimationFrames",group:0,visibility:1},{name:"gpuMorphTargets",group:0,visibility:1},{name:"gpuMorphWeights",group:0,visibility:1}],getUniforms:(e={})=>e},X=`
struct VertexInputs {
  @location(0) positions: vec3f,
#ifdef HAS_NORMALS
  @location(1) normals: vec3f,
#endif
#ifdef HAS_TANGENTS
  @location(2) TANGENT: vec4f,
#endif
#ifdef HAS_UV
  @location(3) texCoords: vec2f,
#endif
#ifdef HAS_UV_1
  @location(4) texCoords1: vec2f,
#endif
#ifdef HAS_SKIN
  @location(5) JOINTS_0: vec4u,
  @location(6) WEIGHTS_0: vec4f,
#endif
#ifdef HAS_GLTF_INSTANCING
  @location(8) instanceModelMatrixCol0: vec4f,
  @location(9) instanceModelMatrixCol1: vec4f,
  @location(10) instanceModelMatrixCol2: vec4f,
  @location(11) instanceModelMatrixCol3: vec4f,
  @builtin(instance_index) instanceIndex: u32,
#endif
#ifdef HAS_GPU_CROWD_ANIMATION
  @location(12) instanceAnimationFrames: vec4f,
  @location(13) instanceAnimationBlend: vec4f,
#endif
#ifdef HAS_INSTANCED_MORPH
  @builtin(vertex_index) vertexIndex: u32,
#endif
};

struct FragmentInputs {
  @builtin(position) position: vec4f,
  @location(0) pbrPosition: vec3f,
  @location(1) pbrUV0: vec2f,
  @location(2) pbrUV1: vec2f,
  @location(3) pbrNormal: vec3f,
#ifdef HAS_TANGENTS
  @location(4) pbrTangent: vec4f,
#endif
};

#ifdef HAS_GLTF_INSTANCING
fn getGLTFInstanceNormalMatrix(matrix: mat3x3f) -> mat3x3f {
  let firstCofactor = cross(matrix[1], matrix[2]);
  let inverseDeterminant = 1.0 / dot(matrix[0], firstCofactor);
  return mat3x3f(
    firstCofactor,
    cross(matrix[2], matrix[0]),
    cross(matrix[0], matrix[1])
  ) * inverseDeterminant;
}
#endif

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  var outputs: FragmentInputs;
  var position = vec4f(inputs.positions, 1.0);
  var normal = vec3f(0.0, 0.0, 1.0);
  var tangent = vec4f(1.0, 0.0, 0.0, 1.0);
  var uv0 = vec2f(0.0, 0.0);
  var uv1 = vec2f(0.0, 0.0);

#ifdef HAS_NORMALS
  normal = inputs.normals;
#endif
#ifdef HAS_UV
  uv0 = inputs.texCoords;
#endif
#ifdef HAS_UV_1
  uv1 = inputs.texCoords1;
#endif
#ifdef HAS_TANGENTS
  tangent = inputs.TANGENT;
#endif

#ifdef HAS_INSTANCED_MORPH
  var animationFrames = vec4f(0.0);
  var animationBlend = vec4f(0.0);
#ifdef HAS_GPU_CROWD_ANIMATION
  animationFrames = inputs.instanceAnimationFrames;
  animationBlend = inputs.instanceAnimationBlend;
#endif
  position = vec4f(
    position.xyz + getGPUCrowdMorphDelta(
      inputs.instanceIndex,
      inputs.vertexIndex,
      0u,
      u32(CROWD_MORPH_VERTEX_COUNT),
      u32(CROWD_MORPH_TARGET_COUNT),
      u32(CROWD_ANIMATION_JOINT_COUNT),
      animationFrames,
      animationBlend,
      u32(CROWD_ANIMATION_FRAME_STRIDE)
    ),
    1.0
  );
#ifdef HAS_NORMALS
  normal = normalize(normal + getGPUCrowdMorphDelta(
    inputs.instanceIndex,
    inputs.vertexIndex,
    1u,
    u32(CROWD_MORPH_VERTEX_COUNT),
    u32(CROWD_MORPH_TARGET_COUNT),
    u32(CROWD_ANIMATION_JOINT_COUNT),
    animationFrames,
    animationBlend,
    u32(CROWD_ANIMATION_FRAME_STRIDE)
  ));
#endif
#ifdef HAS_TANGENTS
  tangent = vec4f(normalize(tangent.xyz + getGPUCrowdMorphDelta(
    inputs.instanceIndex,
    inputs.vertexIndex,
    2u,
    u32(CROWD_MORPH_VERTEX_COUNT),
    u32(CROWD_MORPH_TARGET_COUNT),
    u32(CROWD_ANIMATION_JOINT_COUNT),
    animationFrames,
    animationBlend,
    u32(CROWD_ANIMATION_FRAME_STRIDE)
  )), tangent.w);
#endif
#endif

#ifdef HAS_SKIN
#ifdef HAS_GPU_CROWD_ANIMATION
  let skinMatrix = getGPUAnimatedSkinMatrix(
    inputs.WEIGHTS_0,
    inputs.JOINTS_0,
    inputs.instanceAnimationFrames,
    inputs.instanceAnimationBlend,
    u32(CROWD_ANIMATION_FRAME_STRIDE)
  );
#else
#ifdef HAS_INSTANCED_SKIN
  let skinMatrix = getInstancedSkinMatrix(
    inputs.WEIGHTS_0,
    inputs.JOINTS_0,
    inputs.instanceIndex,
    u32(CROWD_JOINTS_PER_INSTANCE)
  );
#else
  let skinMatrix = getSkinMatrix(inputs.WEIGHTS_0, inputs.JOINTS_0);
#endif
#endif
  position = skinMatrix * position;
  normal = normalize((skinMatrix * vec4f(normal, 0.0)).xyz);
#ifdef HAS_TANGENTS
  tangent = vec4f(normalize((skinMatrix * vec4f(tangent.xyz, 0.0)).xyz), tangent.w);
#endif
#endif

#ifdef HAS_GLTF_INSTANCING
  var instanceMatrix = mat4x4f(
    inputs.instanceModelMatrixCol0,
    inputs.instanceModelMatrixCol1,
    inputs.instanceModelMatrixCol2,
    inputs.instanceModelMatrixCol3
  );
#ifdef HAS_GPU_CROWD_ANIMATION
  instanceMatrix *= sampleGPUAnimationMatrix(
    inputs.instanceAnimationFrames,
    inputs.instanceAnimationBlend,
    0u,
    u32(CROWD_ANIMATION_FRAME_STRIDE)
  );
#endif
  position = instanceMatrix * position;
  normal = normalize(getGLTFInstanceNormalMatrix(mat3x3f(
    instanceMatrix[0].xyz,
    instanceMatrix[1].xyz,
    instanceMatrix[2].xyz
  )) * normal);
#ifdef HAS_TANGENTS
  tangent = vec4f(normalize((instanceMatrix * vec4f(tangent.xyz, 0.0)).xyz), tangent.w);
#endif
#endif

  let worldPosition = pbrProjection.modelMatrix * position;

#ifdef HAS_NORMALS
  normal = normalize((pbrProjection.normalMatrix * vec4f(normal, 0.0)).xyz);
#endif
#ifdef HAS_TANGENTS
  let worldTangent = normalize((pbrProjection.modelMatrix * vec4f(tangent.xyz, 0.0)).xyz);
  outputs.pbrTangent = vec4f(worldTangent, tangent.w);
#endif

  outputs.position = pbrProjection.modelViewProjectionMatrix * position;
  outputs.pbrPosition = worldPosition.xyz / worldPosition.w;
  outputs.pbrUV0 = uv0;
  outputs.pbrUV1 = uv1;
  outputs.pbrNormal = normal;
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4f {
  fragmentInputs.pbr_vPosition = inputs.pbrPosition;
  fragmentInputs.pbr_vUV0 = inputs.pbrUV0;
  fragmentInputs.pbr_vUV1 = inputs.pbrUV1;
  fragmentInputs.pbr_vNormal = inputs.pbrNormal;
#ifdef HAS_TANGENTS
  let tangent = normalize(inputs.pbrTangent.xyz);
  let bitangent = normalize(cross(inputs.pbrNormal, tangent)) * inputs.pbrTangent.w;
  fragmentInputs.pbr_vTBN = mat3x3f(tangent, bitangent, inputs.pbrNormal);
#endif
  return pbr_filterColor(vec4f(1.0));
}
`,Q=`\
#version 300 es

  // in vec4 POSITION;
  in vec4 positions;

  #ifdef HAS_NORMALS
    // in vec4 NORMAL;
    in vec4 normals;
  #endif

  #ifdef HAS_TANGENTS
    in vec4 TANGENT;
  #endif

  #ifdef HAS_UV
    // in vec2 TEXCOORD_0;
    in vec2 texCoords;
  #endif

  #ifdef HAS_UV_1
    in vec2 texCoords1;
  #endif

  #ifdef HAS_SKIN
    in uvec4 JOINTS_0;
    in vec4 WEIGHTS_0;
  #endif

  #ifdef HAS_GLTF_INSTANCING
    in vec4 instanceModelMatrixCol0;
    in vec4 instanceModelMatrixCol1;
    in vec4 instanceModelMatrixCol2;
    in vec4 instanceModelMatrixCol3;
  #endif

  #ifdef HAS_GPU_CROWD_ANIMATION
    in vec4 instanceAnimationFrames;
    in vec4 instanceAnimationBlend;
  #endif

  void main(void) {
    vec4 _NORMAL = vec4(0.);
    vec4 _TANGENT = vec4(0.);
    vec2 _TEXCOORD_0 = vec2(0.);
    vec2 _TEXCOORD_1 = vec2(0.);

    #ifdef HAS_NORMALS
      _NORMAL = normals;
    #endif

    #ifdef HAS_TANGENTS
      _TANGENT = TANGENT;
    #endif

    #ifdef HAS_UV
      _TEXCOORD_0 = texCoords;
    #endif

    #ifdef HAS_UV_1
      _TEXCOORD_1 = texCoords1;
    #endif

    vec4 pos = positions;

    #ifdef HAS_INSTANCED_MORPH
      vec4 animationFrames = vec4(0.0);
      vec4 animationBlend = vec4(0.0);
      #ifdef HAS_GPU_CROWD_ANIMATION
        animationFrames = instanceAnimationFrames;
        animationBlend = instanceAnimationBlend;
      #endif
      pos.xyz += getGPUCrowdMorphDelta(
        uint(gl_InstanceID),
        uint(gl_VertexID),
        0u,
        uint(CROWD_MORPH_TARGET_COUNT),
        uint(CROWD_ANIMATION_JOINT_COUNT),
        animationFrames,
        animationBlend
      );
      #ifdef HAS_NORMALS
        _NORMAL.xyz = normalize(_NORMAL.xyz + getGPUCrowdMorphDelta(
          uint(gl_InstanceID),
          uint(gl_VertexID),
          1u,
          uint(CROWD_MORPH_TARGET_COUNT),
          uint(CROWD_ANIMATION_JOINT_COUNT),
          animationFrames,
          animationBlend
        ));
      #endif
      #ifdef HAS_TANGENTS
        _TANGENT.xyz = normalize(_TANGENT.xyz + getGPUCrowdMorphDelta(
          uint(gl_InstanceID),
          uint(gl_VertexID),
          2u,
          uint(CROWD_MORPH_TARGET_COUNT),
          uint(CROWD_ANIMATION_JOINT_COUNT),
          animationFrames,
          animationBlend
        ));
      #endif
    #endif

    #ifdef HAS_SKIN
      #ifdef HAS_GPU_CROWD_ANIMATION
        mat4 skinMat = getGPUAnimatedSkinMatrix(
          WEIGHTS_0,
          JOINTS_0,
          instanceAnimationFrames,
          instanceAnimationBlend
        );
      #else
      #ifdef HAS_INSTANCED_SKIN
        mat4 skinMat = getInstancedSkinMatrix(
          WEIGHTS_0,
          JOINTS_0,
          uint(gl_InstanceID),
          uint(CROWD_JOINTS_PER_INSTANCE)
        );
      #else
      mat4 skinMat = getSkinMatrix(WEIGHTS_0, JOINTS_0);
      #endif
      #endif
      pos = skinMat * pos;
      _NORMAL = skinMat * _NORMAL;
      _TANGENT = vec4((skinMat * vec4(_TANGENT.xyz, 0.)).xyz, _TANGENT.w);
    #endif

    #ifdef HAS_GLTF_INSTANCING
      mat4 instanceMatrix = mat4(
        instanceModelMatrixCol0,
        instanceModelMatrixCol1,
        instanceModelMatrixCol2,
        instanceModelMatrixCol3
      );
      #ifdef HAS_GPU_CROWD_ANIMATION
        instanceMatrix *= sampleGPUAnimationMatrix(
          instanceAnimationFrames,
          instanceAnimationBlend,
          0
        );
      #endif
      pos = instanceMatrix * pos;
      _NORMAL = vec4(normalize(transpose(inverse(mat3(instanceMatrix))) * _NORMAL.xyz), 0.0);
      _TANGENT = vec4(normalize(mat3(instanceMatrix) * _TANGENT.xyz), _TANGENT.w);
    #endif

    pbr_setPositionNormalTangentUV(pos, _NORMAL, _TANGENT, _TEXCOORD_0, _TEXCOORD_1);
    gl_Position = pbrProjection.modelViewProjectionMatrix * pos;
  }
`,W=`\
#version 300 es
  out vec4 fragmentColor;

  void main(void) {
    vec3 pos = pbr_vPosition;
    fragmentColor = pbr_filterColor(vec4(1.0));
  }
`;function z(e,t){let r=t.materialFactory||new g(e,{modules:[_.s]}),n={...t.parsedPPBRMaterial.uniforms};delete n.camera;let i=Object.fromEntries(Object.entries({...n,...t.parsedPPBRMaterial.bindings}).filter(([e,t])=>{var n;return r.ownsBinding(e)&&((n=t)instanceof s.h||n instanceof G||n instanceof M.L||n instanceof l.g||n instanceof o.X)})),a=r.createMaterial({id:t.id,bindings:i});return a.setProps({pbrMaterial:n}),a}function Y(e,t,r,n,i){if("webgpu"===e.type)return e.createBuffer({id:t,data:r,usage:s.h.STORAGE|s.h.COPY_DST});let a=e.createTexture({id:t,format:"rgba32float",width:n,height:i,usage:l.g.SAMPLE|l.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}});return a.writeData(r,{width:n,height:i}),a}function $(e,t,r){if(!e)return[...r];let n=e.value;return r.map((r,i)=>{let a=n[t*e.size+i];return void 0===a?r:e.normalized?e.value instanceof Int8Array?Math.max(a/127,-1):e.value instanceof Int16Array?Math.max(a/32767,-1):e.value instanceof Uint8Array?a/255:e.value instanceof Uint16Array?a/65535:a:a})}function q(e,t){for(let r of(e.userData.morphWeights=[...t],e.userData.morphMeshes||[]))r.preorderTraversal(e=>{if(!(e instanceof n.s))return;let r=e.userData.morphTargets;r&&(!function(e,t,r,n){let i={};for(let e of["POSITION","NORMAL","TANGENT"]){let r=t.attributes[e];r&&(i[e]=B(r))}let a=function(e,t,r){let n={};for(let i of["POSITION","NORMAL","TANGENT"]){let a=e[i];if(!a)continue;let o=new Float32Array(a),s="TANGENT"===i?4:3,l=Math.floor(a.length/s);for(let e=0;e<Math.min(t.length,r.length);e++){let n=r[e],a=t[e][i];if(!n||!a)continue;let c="TANGENT"===i&&a.length===4*l?4:3;for(let e=0;e<l;e++){let t=e*s,r=e*c;for(let e=0;e<3;e++)o[t+e]+=(a[r+e]||0)*n}}"POSITION"!==i&&function(e,t){for(let r=0;r<e.length;r+=t){let t=Math.hypot(e[r],e[r+1],e[r+2]);t>0&&(e[r]/=t,e[r+1]/=t,e[r+2]/=t)}}(o,s),n[i]=o}return n}(i,r,n),o={};for(let[e,r]of Object.entries(t.attributes))r&&(o[e]=r);for(let e of["POSITION","NORMAL","TANGENT"]){let t=a[e],r=o[e];t&&r&&(o[e]={...r,value:function(e,t){if(e.value instanceof Float32Array)return t;let r=e.value.slice(),n=S(r),i=r instanceof Int8Array||r instanceof Int16Array||r instanceof Int32Array;for(let a=0;a<t.length;a++){let o=t[a];r[a]=e.normalized&&n?Math.round(Math.max(i?-1:0,Math.min(1,o))*n):o}return r}(r,t)})}let s=new C.V({id:t.id,topology:t.topology||"triangle-list",vertexCount:t.vertexCount,indices:t.indices,attributes:o,bufferLayout:t.bufferLayout}),l=(0,v.C)(s),c=l.attributes.geometry?.value,f=e._gpuGeometry?.attributes.geometry||e.bufferAttributes.geometry;if(c&&f)return f.write(c);for(let t of["POSITION","NORMAL","TANGENT"]){let r=a[t];if(r){let n="POSITION"===t?"positions":"NORMAL"===t?"normals":"TANGENT";e.bufferAttributes[n]?.write(r)}}}(e.model,r.geometry,r.targets,t),e.userData.morphWeights=[...t])})}var Z=r(92397),ee=r(27282);let et={modelOptions:{},pbrDebug:!1,imageBasedLightingEnvironment:void 0,lights:!0,useTangents:!1,useByteColors:!0,strictExtensions:!1};function er(e,t,r,n){let i=(0,ee.lO)(e,t,r,n);for(let e of i.generatedTextures)n.generatedTextures.add(e);return i}function en(e,t,r,i,a,o){let c=(t.primitives||[]).map((c,f)=>(function({device:e,gltfPrimitive:t,primitiveIndex:r,gltfMesh:i,gltf:a,gltfMaterialIdToMaterialMap:o,options:c,instancing:f}){let u=t.name||`${i.name||i.id}-primitive-${r}`,m=function(e){let t=1/0;for(let r of Object.values(e))if(r){let{value:e,size:n,components:i}=r,a=n??i;e?.length!==void 0&&a>=1&&(t=Math.min(t,e.length/a))}if(!Number.isFinite(t))throw Error("Could not determine vertex count from attributes");return t}(t.attributes),p=function(e,t,r){if(e!==Z.n.LINE_LOOP&&e!==Z.n.TRIANGLE_FAN)return{topology:function(e){switch(e){case Z.n.POINTS:return"point-list";case Z.n.LINES:return"line-list";case Z.n.LINE_STRIP:return"line-strip";case Z.n.TRIANGLES:return"triangle-list";case Z.n.TRIANGLE_STRIP:return"triangle-strip";default:throw Error(String(e))}}(e)};let n=t?.length??r,i=new(t instanceof Uint32Array||!t&&r>65536?Uint32Array:Uint16Array)(e===Z.n.LINE_LOOP?n>=2?2*n:0:n>=3?(n-2)*3:0),a=e=>t?.[e]??e;if(e===Z.n.LINE_LOOP){for(let e=0;e<n;e++)i[2*e]=a(e),i[2*e+1]=a((e+1)%n);return{topology:"line-list",indices:i}}for(let e=0;e<n-2;e++)i[3*e]=a(0),i[3*e+1]=a(e+1),i[3*e+2]=a(e+2);return{topology:"triangle-list",indices:i}}(t.mode??4,t.indices?.value,m),d=function(e,t,r){let n={};for(let[e,r]of Object.entries(t.attributes)){let{components:i,size:a,value:o,normalized:s}=r,l="POSITION"===e||"NORMAL"===e||"TANGENT"===e,c=!!(t.targets?.length&&l);n[e]={size:a??i,value:c?B({value:o,normalized:s}):o,normalized:!c&&s}}return new C.V({id:e,topology:r.topology,indices:r.indices??t.indices?.value,attributes:n})}(u,t,p),h=d.vertexCount,g=function(e,t,r){if(!e.targets?.length)return;let n={};for(let e of["POSITION","NORMAL","TANGENT"]){let t=r.attributes[e]?.value;t instanceof Float32Array&&(n[e]=new Float32Array(t))}return{geometry:r,baseAttributes:n,targets:e.targets.map(e=>{let r={};for(let n of["POSITION","NORMAL","TANGENT"]){let i=e[n],a="number"==typeof i?t.accessors[i]:i;a?.value&&ArrayBuffer.isView(a.value)&&(r[n]=B(a))}return r})}}(t,a,d),b=er(e,t.material,d.attributes,{...c,gltf:a}),A=function(e,t){let r,i,a,o,c,f,u,m,p,d,h,{id:g,geometry:b,parsedPPBRMaterial:A,vertexCount:C,modelOptions:v={},instanceMatrices:B,morphTargets:S=[]}=t,M=v.userData?.gltfAnimatedCrowd;if(M&&B)throw Error("Nested glTF crowd instancing is unsupported");I.R.info(4,"createGLTFModel defines: ",A.defines)();let T=[],x={},y=[],E=[],F=[],U=!!M?.gpuAnimation;if(B||M)for(let t=0;t<4;t++){let r=new Float32Array(4*(M?.capacity||B?.length||0));B?.forEach((e,n)=>{for(let i=0;i<4;i++)r[4*n+i]=e[4*t+i]});let n=`instanceModelMatrixCol${t}`,i=e.createBuffer({id:`${g||"gltf"}-${n}`,data:r,usage:s.h.VERTEX|s.h.COPY_DST});x[n]=i,y.push({name:n,format:"float32x4",stepMode:"instance"}),T.push(i),E.push(i),F.push(r)}if(M&&U)for(let[t,n]of[["instanceAnimationFrames",r=new Float32Array(4*M.capacity)],["instanceAnimationBlend",a=new Float32Array(4*M.capacity)]]){let r=e.createBuffer({id:`${g||"gltf"}-${t}`,data:n,usage:s.h.VERTEX|s.h.COPY_DST});x[t]=r,y.push({name:t,format:"float32x4",stepMode:"instance"}),T.push(r),"instanceAnimationFrames"===t?i=r:o=r}let N=!!A.defines.HAS_SKIN,D=!!(M&&N&&!U);M&&D&&(f=new Float32Array(M.capacity*M.jointsPerInstance*16),c="webgpu"===e.type?e.createBuffer({id:`${g||"gltf"}-crowd-joint-matrices`,byteLength:f.byteLength,usage:s.h.STORAGE|s.h.COPY_DST}):e.createTexture({id:`${g||"gltf"}-crowd-joint-matrices`,format:"rgba32float",width:4*M.jointsPerInstance,height:M.capacity,usage:l.g.SAMPLE|l.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}}),T.push(c));let O=M?S.length:0,L=Math.floor((b.attributes.POSITION?.value.length||0)/3);if(M&&O>0&&L>0){let t=new Float32Array(3*O*L*4);for(let[e,r]of S.entries())for(let[n,i]of["POSITION","NORMAL","TANGENT"].entries()){let a=r[i];if(!a)continue;let o="TANGENT"===i&&a.length===4*L?4:3;for(let r=0;r<L;r++){let i=((3*e+n)*L+r)*4,s=r*o;t[i]=a[s]||0,t[i+1]=a[s+1]||0,t[i+2]=a[s+2]||0}}if(u=Y(e,`${g||"gltf"}-crowd-morph-targets`,t,L,3*O),T.push(u),!U){let t=Math.ceil(O/4);p=Y(e,`${g||"gltf"}-crowd-morph-weights`,m=new Float32Array(M.capacity*t*4),t,M.capacity),T.push(p)}}let H=N&&M?M.jointsPerInstance:0,w=4+4*H+O;M?.gpuAnimation&&(d=Y(e,`${g||"gltf"}-crowd-animation-frames`,h=new Float32Array(M.gpuAnimation.frameCount*w*4),w,M.gpuAnimation.frameCount),T.push(d));let G=X;for(let[e,t]of[["CROWD_JOINTS_PER_INSTANCE",M?.jointsPerInstance||0],["CROWD_MORPH_VERTEX_COUNT",L],["CROWD_MORPH_TARGET_COUNT",O],["CROWD_ANIMATION_JOINT_COUNT",H],["CROWD_ANIMATION_FRAME_STRIDE",w]])G=G.replaceAll(`u32(${e})`,`u32(${t})`);let P={id:g,source:G,vs:Q,fs:W,geometry:b,topology:b.topology,vertexCount:C,modules:[_.s,K,...M?[j]:[]],...v,...B||M?{attributes:{...v.attributes,...x},bufferLayout:[...v.bufferLayout||[],...y],instanceCount:B?.length||0,isInstanced:!0}:{},defines:{...A.defines,...v.defines,...B||M?{HAS_GLTF_INSTANCING:!0}:{},...D?{HAS_INSTANCED_SKIN:!0,CROWD_JOINTS_PER_INSTANCE:M.jointsPerInstance}:{},...U?{HAS_GPU_CROWD_ANIMATION:!0,CROWD_ANIMATION_FRAME_STRIDE:w}:{},...u?{HAS_INSTANCED_MORPH:!0,CROWD_MORPH_TARGET_COUNT:O}:{},...M?{CROWD_ANIMATION_JOINT_COUNT:H}:{}},parameters:{depthWriteEnabled:!0,depthCompare:"less",depthFormat:"depth24plus",cullMode:"back",...A.parameters,...v.parameters}},V=t.material||z(e,{id:g?`${g}-material`:void 0,parsedPPBRMaterial:A});P.material=V;let J=new R.K(e,P),k={...A.uniforms,...v.uniforms,...A.bindings,...v.bindings},$=function(e,t,r){let n=new Map;for(let t of e){for(let e of Object.keys(t.uniformTypes||{}))n.set(e,t.name);for(let e of t.bindingLayout||[])n.set(e.name,t.name)}let i={};for(let[e,a]of Object.entries(r)){if(void 0===a)continue;let r=n.get(e);!r||t.ownsModule(r)||(i[r]||={},i[r][e]=a)}return i}(J.shaderInputs.getModules(),V,k);J.shaderInputs.setProps($),c&&J.shaderInputs.setProps({skin:{jointMatrices:[],skinJointMatrices:c}}),(d||u||p)&&J.shaderInputs.setProps({gpuAnimation:{...d?{gpuAnimationFrames:d}:{},...u?{gpuMorphTargets:u}:{},...p?{gpuMorphWeights:p}:{}}});let q=new n.s({managedResources:T,model:J,bounds:t.bounds,instanceMatrices:B});return M&&(q.userData.gltfAnimatedCrowd={transformBuffers:E,transformColumns:F,skinJointMatrices:c,jointMatrices:f,jointsPerInstance:M.jointsPerInstance,morphTargetCount:O,morphTargetData:u,morphWeights:m,morphWeightData:p,animationFrames:d,animationFrameValues:h,animationFrameStride:w,animationJointCount:H,animationParameters:r,animationParameterBuffer:i,animationBlend:a,animationBlendBuffer:o}),q}(e,{id:u,geometry:d,material:t.material&&o.get(t.material.id)||null,parsedPPBRMaterial:b,modelOptions:c.modelOptions,vertexCount:h,bounds:[t.attributes.POSITION.min,t.attributes.POSITION.max],instanceMatrices:f?.matrices,morphTargets:g?.targets});f&&(A.userData.gltfInstancing=f);let v=t.extensions?.KHR_materials_variants?.mappings||[];if(v.length){let t=new Map;for(let r of v){let n="number"==typeof r.material?a.materials[r.material]:r.material,i=n&&o.get(n.id);if(!i)continue;let s=er(e,n,d.attributes,{...c,gltf:a});for(let e of r.variants||[])t.set(e,{material:i,parameters:{...A.model.parameters,...s.parameters,depthWriteEnabled:"BLEND"!==n.alphaMode,cullMode:n.doubleSided?"none":"back"}})}A.userData.gltfMaterialVariants={defaultMaterial:A.model.material,defaultParameters:{...A.model.parameters},mappings:t}}return g&&(A.userData.morphTargets=g),A})({device:e,gltfPrimitive:c,primitiveIndex:f,gltfMesh:t,gltf:r,gltfMaterialIdToMaterialMap:i,options:a,instancing:o}));return new A.o({id:t.name||t.id,children:c})}var ei=r(23471);function ea(e,t={}){let r=t.lightDefinitions||e.lights||e.extensions?.KHR_lights_punctual?.lights;if(!r||!Array.isArray(r)||0===r.length)return[];let n=[],i=function(e){let t=new Map;for(let r of e)for(let e of r.children||[])t.set(e.id,r);return t}(e.nodes||[]),a=new Map;for(let f of e.nodes||[]){var o,s,l,c;if(!function(e,t,r){let n=e;for(;n;){let e=r?.get(n.id);if(e?!e.display:n.extensions?.KHR_node_visibility?.visible===!1)return!1;n=t.get(n.id)}return!0}(f,i,t.nodeVisibility))continue;let e=f.light??f.extensions?.KHR_lights_punctual?.light;if("number"!=typeof e||t.nodeIdentifiers&&!t.nodeIdentifiers.has(f.id))continue;let u=r[e];if(!u)continue;let m=(o=u.color||[1,1,1],t.useByteColors??!0?o.map(e=>255*e):(0,ei.sC)(o,!1)),p=u.intensity??1,d=u.range,h=function e(t,r,n){let i=n.get(t.id);if(i)return i;let a=function(e){if(e.matrix)return new k.k(e.matrix);let t=new k.k;return e.translation&&t.translate(e.translation),e.rotation&&t.multiplyRight(new k.k().fromQuaternion(e.rotation)),e.scale&&t.scale(e.scale),t}(t),o=r.get(t.id),s=o?new k.k(e(o,r,n)).multiplyRight(a):a;return n.set(t.id,s),s}(f,i,a);switch(u.type){case"directional":n.push((s=h,l=m,c=p,{type:"directional",direction:es(s),color:l,intensity:c}));break;case"point":n.push(function(e,t,r,n){let i=eo(e),a=[1,0,0];return void 0!==n&&n>0&&(a=[1,0,1/(n*n)]),{type:"point",position:i,color:t,intensity:r,attenuation:a}}(h,m,p,d));break;case"spot":n.push(function(e,t,r,n,i={}){let a=eo(e),o=es(e),s=[1,0,0];return void 0!==n&&n>0&&(s=[1,0,1/(n*n)]),{type:"spot",position:a,direction:o,color:t,intensity:r,attenuation:s,innerConeAngle:i.innerConeAngle??0,outerConeAngle:i.outerConeAngle??Math.PI/4}}(h,m,p,d,u.spot))}}return n}function eo(e){return e.transformAsPoint([0,0,0])}function es(e){return e.transformDirection([0,0,-1])}class el{name;playing=!0;speed=1;startTime=0;constructor(e={}){this.name=e.name||"unnamed",Object.assign(this,e)}setTime(e){if(!this.playing)return;let t=(e/1e3-this.startTime)*this.speed;this.applyTime(t)}}class ec{clips;animations;constructor(e){this.clips=e,this.animations=e}animate(e){I.R.warn(`${this.constructor.name}#animate is deprecated. Use ${this.constructor.name}#setTime instead`)(),this.setTime(e)}setTime(e){this.clips.forEach(t=>t.setTime(e))}getAnimations(){return this.clips}}function ef(e,t,r){let n=em(e),i=em(t),a=n.reduce((e,t,r)=>e+t*i[r],0),o=a<0?-1:1;if((a=Math.min(Math.abs(a),1))>.9995)return em(n.map((e,t)=>e+r*(i[t]*o-e)));let s=Math.acos(a),l=Math.sin(s),c=Math.sin((1-r)*s)/l,f=Math.sin(r*s)/l*o;return em(n.map((e,t)=>e*c+i[t]*f))}function eu(e,t,r,n){let i=e["CUBICSPLINE"===t?3*r+1:r];return i?"quaternion"===n?em(i):[...i]:null}function em(e){let t=Math.hypot(...e);return t>0?e.map(e=>e/t):[0,0,0,1]}class ep{clip;mixer;time=0;timeScale;weight;loop;repetitions;paused=!1;playing=!1;elapsedTime=0;fade=null;constructor(e,t,r={}){this.mixer=e,this.clip=t,this.loop=r.loop||"repeat",this.repetitions=r.repetitions??1/0,this.timeScale=r.timeScale??1,this.weight=r.weight??1}play(){return this.playing=!0,this.paused=!1,this}pause(){return this.paused=!0,this}resume(){return this.playing=!0,this.paused=!1,this}stop(){return this.playing=!1,this.paused=!1,this.fade=null,this.reset()}reset(){return this.elapsedTime=0,this.time=0,this}setTime(e){return this.elapsedTime=e,this.time=this.resolveLocalTime(e),this}setLoop(e,t=1/0){return this.loop=e,this.repetitions=t,this.time=this.resolveLocalTime(this.elapsedTime),this}setEffectiveWeight(e){return this.weight=Math.max(0,e),this.fade=null,this}setEffectiveTimeScale(e){return this.timeScale=e,this}fadeIn(e){return this.scheduleFade(1,e)}fadeOut(e){return this.scheduleFade(0,e)}crossFadeTo(e,t){return e.weight=0,e.play().fadeIn(t),this.fadeOut(t)}crossFadeFrom(e,t){return e.crossFadeTo(this,t),this}advance(e){this.playing&&!this.paused&&(this.advanceFade(Math.abs(e)),this.elapsedTime+=e*this.timeScale,this.time=this.resolveLocalTime(this.elapsedTime),this.hasFinished()&&(this.playing=!1))}get shouldApply(){return(this.playing||this.hasFinished())&&this.weight>0}scheduleFade(e,t){return t<=0?(this.weight=e,this.fade=null):this.fade={duration:t,elapsedTime:0,startWeight:this.weight,endWeight:e},this}advanceFade(e){if(!this.fade)return;this.fade.elapsedTime+=e;let t=Math.min(this.fade.elapsedTime/this.fade.duration,1);this.weight=this.fade.startWeight+(this.fade.endWeight-this.fade.startWeight)*t,1===t&&(this.fade=null)}hasFinished(){let e=this.clip.duration;return e<=0?"once"===this.loop:"once"===this.loop?this.elapsedTime>=e||this.elapsedTime<0:Number.isFinite(this.repetitions)&&Math.abs(this.elapsedTime)>=e*this.repetitions}resolveLocalTime(e){let t=this.clip.duration;if(t<=0)return 0;if("once"===this.loop)return Math.min(Math.max(e,0),t);if(Number.isFinite(this.repetitions)&&Math.abs(e)>=t*this.repetitions)return"ping-pong"===this.loop&&this.repetitions%2==0||e<0?0:t;let r=e>=0&&e<t?e:(e%t+t)%t;return"repeat"===this.loop||0===Math.abs(Math.floor(e/t)%2)?r:t-r}}class ed{time=0;timeScale=1;clips=new Map;actions=new Map;initialValues=new Map;constructor(e=[]){e.forEach(e=>this.addClip(e))}addClip(e){return this.clips.set(e.name,e),this}clipAction(e,t){let r="string"==typeof e?this.clips.get(e):e;if(!r)throw Error(`Unknown animation clip: ${e}`);this.addClip(r);let n=this.actions.get(r);return n||(n=new ep(this,r,t),this.actions.set(r,n)),n}getAction(e){let t=this.clips.get(e);return t?this.actions.get(t):void 0}update(e){return this.advance(e),this.applyValues(),this}advance(e){let t=e*this.timeScale;return this.time+=t,this.actions.forEach(e=>e.advance(t)),this}setTime(e){return this.time=e,this.actions.forEach(t=>{t.paused||t.setTime(e*t.timeScale)}),this.applyValues(),this}stopAllAction(){return this.actions.forEach(e=>e.stop()),this}applyValues(){let e=new Map;this.actions.forEach(t=>{(t.shouldApply||t.playing&&0===t.weight)&&t.clip.tracks.forEach(r=>{let n=r.evaluate(t.time);if(!n)return;let i=r.binding.id||r.binding;if(!this.initialValues.has(i)){let e=r.binding.getValue?.();e&&this.initialValues.set(i,[...e])}if(0===t.weight&&!this.initialValues.has(i))return;let a=e.get(i);if(!a)return void e.set(i,{binding:r.binding,value:[...n],valueType:r.valueType,weight:t.weight});if(0===t.weight)return;let o=a.weight+t.weight,s=t.weight/o;a.value="quaternion"===r.valueType?ef(a.value,n,s):a.value.map((e,t)=>e+(n[t]-e)*s),a.weight=o})}),e.forEach(({binding:e,value:t,valueType:r,weight:n},i)=>{let a=n<1?this.initialValues.get(i):void 0;a&&a.length===t.length&&(t="quaternion"===r?ef(a,t,n):t.map((e,t)=>a[t]+(e-a[t])*n)),e.setValue(t)})}}class eh{name;tracks;duration;constructor(e){this.name=e.name||"unnamed",this.tracks=e.tracks,this.duration=e.duration??Math.max(0,...e.tracks.map(e=>e.duration))}}class eg{name;times;values;interpolation;valueType;binding;constructor(e){this.name=e.name||e.binding.id||"unnamed",this.times=e.times,this.values=e.values,this.interpolation=e.interpolation||"LINEAR",this.valueType=e.valueType||"vector",this.binding=e.binding}get duration(){return this.times[this.times.length-1]||0}get sampler(){return{input:this.times,output:this.values,interpolation:this.interpolation}}evaluate(e){return function(e,t,r="vector"){var n,i,a,o,s,l,c,f,u;let{input:m,output:p,interpolation:d="LINEAR"}=t;if(!m.length||!p.length||!Number.isFinite(e))return null;let h=m.length-1;if(e<=m[0]||0===h)return eu(p,d,0,r);if(e>=m[h])return eu(p,d,h,r);let g=0,b=h;for(;b-g>1;){let t=Math.floor((g+b)/2);m[t]<=e?g=t:b=t}let A=m[g],C=m[b]-A;if(C<=0||"STEP"===d)return eu(p,d,g,r);let v=(e-A)/C;switch(d){case"LINEAR":{let e=p[g],t=p[b];if(!e||!t)return null;return"quaternion"===r?ef(e,t,v):(n=e,i=t,a=v,n.map((e,t)=>(1-a)*e+a*i[t]))}case"CUBICSPLINE":{let e,t,n=p[3*g+1],i=p[3*g+2],a=p[3*b],m=p[3*b+1];if(!n||!i||!a||!m)return null;let d=(o=n,s=i,l=a,c=m,f=C,t=(e=(u=v)*u)*u,o.map((r,n)=>(2*t-3*e+1)*r+(t-2*e+u)*s[n]*f+(-2*t+3*e)*c[n]+(t-e)*l[n]*f));return"quaternion"===r?em(d):d}default:return null}}(e,this.sampler,this.valueType)}}var eb=r(29244);class eA extends el{animation;gltfNodeIdToNodeMap;onVisibilityChange;cameras;lightDefinitions;onLightChange;materials;clip;mixer;action;materialTextureTransformState=new Map;constructor(e){if(super({name:e.animation.name||"unnamed"}),this.animation=e.animation,this.gltfNodeIdToNodeMap=e.gltfNodeIdToNodeMap,this.onVisibilityChange=e.onVisibilityChange,this.cameras=e.cameras||[],this.lightDefinitions=e.lightDefinitions||[],this.onLightChange=e.onLightChange,this.materials=e.materials||[],this.animation.name||="unnamed",this.name=this.animation.name,this.animation.channels.some(e=>"material"===e.type||"textureTransform"===e.type)&&!this.materials.length)throw Error(`Animation ${this.animation.name} targets materials, but GLTFAnimator was created without a materials array`);this.mixer=e.mixer||new ed,this.clip=new eh({name:this.name,tracks:this.animation.channels.map(e=>this.createAnimationTrack(e))}),this.action=this.mixer.clipAction(this.clip).play()}applyTime(e){this.action.setTime(e),this.mixer.update(0)}createAnimationTrack(e){let t=function(e){switch(e){case"STEP":case"LINEAR":case"CUBICSPLINE":return e;default:throw Error(`Unsupported animation interpolation: ${e}`)}}(e.sampler.interpolation);if("node"===e.type)return new eg({name:`${e.targetNodeId}.${e.path}`,times:e.sampler.input,values:e.sampler.output,interpolation:t,valueType:"rotation"===e.path?"quaternion":"vector",binding:{id:`node:${e.targetNodeId}:${e.path}`,getValue:()=>this.getNodeAnimationValue(e.targetNodeId,e.path),setValue:t=>this.applyNodeAnimationValue(e.targetNodeId,e.path,t)}});if("camera"===e.type||"light"===e.type)return new eg({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:t,binding:{id:e.pointer,getValue:()=>this.getSceneAnimationValue(e),setValue:t=>this.applySceneAnimationValue(e,t)}});let r=this.materials[e.targetMaterialIndex];if(!r)throw Error(`Cannot find animation target material ${e.targetMaterialIndex} for ${e.pointer}`);return new eg({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:t,binding:{id:e.pointer,getValue:"material"===e.type?()=>{var t,n;let i,a;return t=r,n=e,i=t.shaderInputs.getUniformValues(),Array.isArray(a=i.pbrMaterial?.[n.property])?void 0===n.component?[...a]:[a[n.component]]:"number"==typeof a?[a]:[]}:void 0,setValue:t=>{var n,i,a,o,s,l,c,f;let u,m,p,d;"material"===e.type?(n=r,i=e,a=t,d=void 0!==i.component?{[i.property]:(l=(o=n,s=i.property,u=o.shaderInputs.getUniformValues(),Array.isArray(m=u.pbrMaterial?.[s])?[...m]:[]),c=i.component,f=a[0],(p=[...l])[c]=f,p)}:{[i.property]:1===a.length?a[0]:a},n.setProps({pbrMaterial:d})):function(e,t,r,n){var i,a,o;let s,l,c=(0,eb.lz)(t.textureSlot),f=(i=n,a=e,o=t,(l=(s=i.get(a)||{})[o.textureSlot])||(l={offset:[...o.baseTransform.offset],rotation:o.baseTransform.rotation,scale:[...o.baseTransform.scale]},s[o.textureSlot]=l,i.set(a,s)),l);switch(t.path){case"offset":void 0!==t.component?f.offset[t.component]=r[0]:f.offset=[r[0],r[1]];break;case"rotation":f.rotation=r[0];break;case"scale":void 0!==t.component?f.scale[t.component]=r[0]:f.scale=[r[0],r[1]]}e.setProps({pbrMaterial:{[c.uvTransformUniform]:(0,eb.dy)(t.baseTransform,f)}})}(r,e,t,this.materialTextureTransformState)}}})}getNodeAnimationValue(e,t){let r=this.getTargetNode(e);switch(t){case"translation":return Array.from(r.position);case"rotation":return Array.from(r.rotation);case"scale":return Array.from(r.scale);case"weights":return Array.from(r.userData.morphWeights||[]);case"visibility":return[+!!r.display];default:return[]}}applyNodeAnimationValue(e,t,r){let n=this.getTargetNode(e);switch(t){case"translation":n.setPosition(r).updateMatrix();break;case"rotation":n.setRotation(r).updateMatrix();break;case"scale":n.setScale(r).updateMatrix();break;case"weights":q(n,r);break;case"visibility":n.setProps({display:0!==r[0]}),this.onVisibilityChange?.();break;default:I.R.warn(`Bad animation path ${t}`)()}}getTargetNode(e){let t=this.gltfNodeIdToNodeMap.get(e);if(!t)throw Error(`Cannot find animation target node ${e}`);return t}getSceneAnimationValue(e){if("camera"===e.type){let t=this.cameras[e.targetCameraIndex],r=t?.[e.projection]?.[e.property];return"number"==typeof r?[r]:[]}let t=this.lightDefinitions[e.targetLightIndex],r="innerConeAngle"===e.property||"outerConeAngle"===e.property?t?.spot?.[e.property]:t?.[e.property];return Array.isArray(r)?void 0===e.component?[...r]:[r[e.component]]:"number"==typeof r?[r]:[]}applySceneAnimationValue(e,t){if("camera"===e.type){let r=this.cameras[e.targetCameraIndex];r?.[e.projection]&&(r[e.projection][e.property]=t[0]);return}let r=this.lightDefinitions[e.targetLightIndex];if(r){if("innerConeAngle"===e.property||"outerConeAngle"===e.property)r.spot||={},r.spot[e.property]=t[0];else if(void 0!==e.component){let n=[...r[e.property]||[1,1,1]];n[e.component]=t[0],r[e.property]=n}else r[e.property]=1===t.length?t[0]:[...t];this.onLightChange?.()}}}class eC extends ec{mixer;activeClip;onUpdate;previousTimeSeconds;constructor(e){let t=new ed;super(e.animations.map((r,n)=>{let i=r.name||`Animation-${n}`;return new eA({gltfNodeIdToNodeMap:e.gltfNodeIdToNodeMap,onVisibilityChange:e.onVisibilityChange,cameras:e.cameras,lightDefinitions:e.lightDefinitions,onLightChange:e.onLightChange,materials:e.materials,mixer:t,animation:{name:i,channels:r.channels}})})),this.mixer=t,this.onUpdate=e.onUpdate,this.activeClip=this.clips[0]?.name,!1===e.autoplay?this.clips.forEach(e=>{e.playing=!1,e.action.stop()}):"first"===e.autoplay&&this.activeClip&&this.selectClip(this.activeClip)}setUpdateHandler(e){return this.onUpdate=e,this}setTime(e){let t=e/1e3,r=void 0===this.previousTimeSeconds?0:t-this.previousTimeSeconds;this.previousTimeSeconds=t;let n=r*this.mixer.timeScale;this.clips.forEach(e=>{if(!e.playing)return void e.action.stop();if(e.action.paused)return;e.action.resume();let r=Math.max(0,t-e.startTime)*e.speed;e.action.setTime(r-n*e.action.timeScale)}),this.mixer.update(r),this.onUpdate?.()}update(e){this.mixer.update(e),this.onUpdate?.()}selectClip(e,t={}){let r=this.clips.find(t=>t.name===e);if(!r)throw Error(`Unknown animation clip: ${e}`);let n=this.clips.find(e=>e.name===this.activeClip),i=t.crossFadeDuration||0;for(let e of this.clips)e===r||i>0&&e===n||(e.playing=!1,e.action.stop());return r.playing=!0,i>0&&n&&n!==r?(n.playing=!0,n.action.crossFadeTo(r.action,i)):r.action.reset().setEffectiveWeight(1).play(),this.activeClip=e,r}}class ev{bindings;scenes;constructor(e){this.scenes=e.scenes,this.bindings=function(e){let{gltf:t,gltfNodeIndexToNodeMap:r}=e,i=[],a=t.skins||[],o=new Set;for(let t of e.scenes)t.preorderTraversal(e=>{e instanceof A.o&&o.add(e)});for(let[e,s]of t.nodes.entries()){let l=s.skin;if(void 0===l||!s.mesh)continue;let c=function(e,t){return"number"==typeof t?t:(e.skins||[]).findIndex(r=>{if(r===t||t.id&&r.id===t.id)return!0;if(r.joints.length!==t.joints?.length||!r.joints.every((e,r)=>e===t.joints?.[r]))return!1;if("number"==typeof t.inverseBindMatrices){let n=e.accessors[t.inverseBindMatrices];return!r.inverseBindMatrices||r.inverseBindMatrices===n}return!0})}(t,l),f=a[c],u=r.get(e);if(!f||!u||!o.has(u))continue;let m=f.joints.flatMap(e=>{let t=r.get(e);return t?[t]:[]});if(m.length!==f.joints.length)continue;let p=s.mesh,d=u.userData.gltfMesh,h=d instanceof A.o?d:u.children.find(e=>e instanceof A.o&&e.id===(p.name||p.id));if(!(h instanceof A.o))continue;let g=h.children.flatMap(e=>e instanceof n.s?[e]:[]),b=f.inverseBindMatrices?.value;i.push({nodeIndex:e,skinIndex:c,node:u,joints:m,...b instanceof Float32Array?{inverseBindMatrices:b}:{},jointMatrices:new Float32Array(16*m.length),models:g})}return i}(e),this.update()}update(){if(0===this.bindings.length)return;let e=new Map;for(let t of this.scenes)t.preorderTraversal((t,{worldMatrix:r})=>{t instanceof A.o&&e.set(t,new k.k(r))});for(let t of this.bindings)for(let r of(!function(e){let{joints:t,meshNode:r,worldMatrices:n,inverseBindMatrices:i,target:a}=e,o=t.length,s=a&&a.length===16*o?a:new Float32Array(16*o),l=r?n.get(r)||r.matrix:void 0,c=l?new k.k(l).invert():null;for(let e=0;e<o;e++){let r=t[e],a=n.get(r)||r.matrix,o=c?new k.k(c).multiplyRight(a):new k.k(a),l=16*e;if(i&&i.length>=l+16){let e=new k.k;for(let t=0;t<16;t++)e[t]=i[l+t];o.multiplyRight(e)}s.set(o,l)}}({joints:t.joints,meshNode:t.node,worldMatrices:e,inverseBindMatrices:t.inverseBindMatrices,target:t.jointMatrices}),t.models))r.model.shaderInputs.setProps({skin:{jointMatrices:t.jointMatrices}})}getBinding(e){return this.bindings.find(t=>"number"==typeof e?t.nodeIndex===e:t.node===e)}}let eB={supportLevel:"none",standardStatus:"unknown",comment:"Not currently listed in the luma.gl glTF extension support registry."},eS={KHR_draco_mesh_compression:{supportLevel:"built-in",standardStatus:"ratified",comment:"Decoded by loaders.gl before luma.gl builds the scenegraph."},EXT_meshopt_compression:{supportLevel:"built-in",standardStatus:"ratified",comment:"EXT meshopt-compressed buffer views are decoded by loaders.gl before rendering."},KHR_meshopt_compression:{supportLevel:"none",standardStatus:"release-candidate",comment:"The installed loaders.gl GLTFLoader supports EXT_meshopt_compression, not the KHR release candidate."},KHR_mesh_quantization:{supportLevel:"built-in",standardStatus:"ratified",comment:"Loader-materialized quantized accessors retain their typed values and normalization."},EXT_mesh_features:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Feature identifiers are decoded by loaders.gl; automatic rendering and picking are application-owned."},EXT_structural_metadata:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Structural metadata is decoded by loaders.gl; automatic rendering and querying are application-owned."},KHR_lights_punctual:{supportLevel:"built-in",standardStatus:"ratified",comment:"Parsed into luma.gl Light objects."},KHR_materials_unlit:{supportLevel:"built-in",standardStatus:"ratified",comment:"Unlit materials bypass the default lighting path."},KHR_materials_emissive_strength:{supportLevel:"built-in",standardStatus:"ratified",comment:"Applied by the stock PBR shader."},KHR_texture_basisu:{supportLevel:"built-in",standardStatus:"ratified",comment:"BasisU / KTX2 textures pass through when the device supports them."},KHR_texture_transform:{supportLevel:"built-in",standardStatus:"ratified",comment:"Per-slot UV transforms and animated pointers are applied at runtime; avoid duplicate legacy loader-side baking."},EXT_texture_webp:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Texture source is resolved during load; final support depends on browser and device decode support."},EXT_texture_avif:{supportLevel:"none",standardStatus:"ratified",comment:"The image loader can decode supported AVIF images, but GLTFLoader does not select EXT_texture_avif sources."},KHR_materials_specular:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now applies specular factors and textures to the dielectric F0 term."},KHR_materials_ior:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now drives dielectric reflectance from the glTF IOR value."},KHR_materials_transmission:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now applies transmission to the base layer and exposes transparency through alpha, without a scene-color refraction buffer."},KHR_materials_volume:{supportLevel:"built-in",standardStatus:"ratified",comment:"Thickness and attenuation now tint transmitted light in the stock shader."},KHR_materials_clearcoat:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now adds a secondary clearcoat specular lobe."},KHR_materials_sheen:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now adds a sheen lobe for cloth-like materials."},KHR_materials_iridescence:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now tints specular response with a view-dependent thin-film iridescence approximation."},KHR_materials_anisotropy:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now shapes highlights and IBL response with an anisotropy-direction approximation."},KHR_materials_pbrSpecularGlossiness:{supportLevel:"loader-only",standardStatus:"archived",comment:"Extension data can be loaded, but it is not translated into the default metallic-roughness material path."},KHR_materials_variants:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Primitive material variants can be selected and restored on the generated scenegraph."},EXT_mesh_gpu_instancing:{supportLevel:"built-in",standardStatus:"ratified",comment:"Accessor-backed instance transforms use one instanced draw per source primitive."},KHR_node_visibility:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Recursive node visibility controls rendered geometry, punctual lights, and animation."},KHR_animation_pointer:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Node transforms, morph weights and visibility, material factors, texture transforms, camera projections, and punctual lights are wired to runtime updates."},EXT_materials_bump:{supportLevel:"built-in",standardStatus:"draft",comment:"The experimental bump-map draft perturbs the canonical surface normal from a linear height texture."},KHR_materials_diffuse_transmission:{supportLevel:"built-in",standardStatus:"release-candidate",comment:"The Khronos release candidate adds energy-conserving back-lit diffuse transmission and independent color/factor textures."},KHR_materials_dispersion:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"The canonical PBR shader separates red, green, and blue transmission using wavelength-dependent refraction."},KHR_materials_volume_scatter:{supportLevel:"parsed-and-wired",standardStatus:"draft",comment:"The unratified volume-scattering draft is approximated per surface; random-walk and screen-space diffusion are not implemented."},KHR_xmp:{supportLevel:"none",standardStatus:"archived",comment:"Metadata payloads remain in the loaded glTF, but luma.gl does not interpret them."},KHR_xmp_json_ld:{supportLevel:"none",standardStatus:"ratified",comment:"Metadata is preserved in the glTF, but luma.gl does not interpret it."},EXT_lights_image_based:{supportLevel:"none",standardStatus:"multi-vendor",comment:"Use loadPBREnvironment() or custom environment setup instead."},EXT_texture_video:{supportLevel:"none",standardStatus:"multi-vendor",comment:"Video textures are not created automatically by the stock pipeline."},MSFT_lod:{supportLevel:"parsed-and-wired",standardStatus:"vendor",comment:"Node levels are parsed and selected by opt-in animated crowds; material LOD and GPU-driven selection are not implemented."}};function e_(e,t){var r;let n,i=Array.from((r=e,eI(n=new Set,r.extensionsUsed),eI(n,r.extensionsRequired),eI(n,r.extensionsRemoved),eI(n,Object.keys(r.extensions||{})),(r.lights?.length||(r.nodes||[]).some(e=>"light"in e))&&n.add("KHR_lights_punctual"),(r.materials||[]).some(e=>e.unlit||e.extensions?.KHR_materials_unlit)&&n.add("KHR_materials_unlit"),n)).sort(),a=new Set(e.extensionsRequired||[]);return new Map(i.map(r=>{var n;let i=eS[r]||eB,o=function(e,t,r,n){if("KHR_texture_basisu"!==e||!n)return t;let i=(function(e){let t=[];for(let r of e.textures||[]){let e=r?.source?.image;if(!e?.compressed)continue;let n=Array.isArray(e.data)?e.data[0]:Array.isArray(e.mipmaps)?e.mipmaps[0]:void 0;t.push(n?.textureFormat??null)}return t})(r).find(e=>null===e||!n.isTextureFormatSupported(e));return void 0===i?t:{supportLevel:"none",comment:null===i?`The ${n.type} device cannot use a BasisU texture whose transcoded GPU format is missing.`:`The ${n.type} device does not support the transcoded BasisU texture format '${i}'.`}}(r,i,e,t);return[r,{extensionName:r,required:a.has(r),supported:"built-in"===(n=o.supportLevel)||"parsed-and-wired"===n,supportLevel:o.supportLevel,standardStatus:i.standardStatus,comment:o.comment}]}))}function eI(e,t=[]){for(let r of t)e.add(r)}function eM(e){switch(e){case"translation":case"rotation":case"scale":case"weights":return e;default:return null}}function eR(e){let t=eT(e);if(t){let e=eS[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`no runtime target exists for material property "${e.join("/")}"`}function eT(e){let t=e.indexOf("extensions"),r=e[t+1];return t>=0&&r?r:null}function ex(e,t){I.R.warn(`KHR_animation_pointer target ${e} will be skipped because ${t}`)()}function ey(e){if(e.value)return{value:e.value,components:e.components};let t=e.bufferView?.data;eE(void 0!==t),eE(5126===e.componentType);let r="SCALAR"===e.type?1:Number(e.type.slice(3));return{value:new Float32Array(t.buffer,t.byteOffset+(e.byteOffset||0),e.count*r),components:r}}function eE(e,t){if(!e)throw Error(t)}class eF{variants;names;activeVariant=null;modelNodes;constructor(e,t){let r=e.extensions?.KHR_materials_variants?.variants||[];this.variants=r.map((e,t)=>({name:e.name||`Variant-${t}`,index:t})),this.names=this.variants.map(e=>e.name);let i=new Set;for(let e of t)e.preorderTraversal(e=>{e instanceof n.s&&e.userData.gltfMaterialVariants&&i.add(e)});this.modelNodes=Array.from(i)}selectVariant(e){let t=this.variants.find(t=>t.name===e);if(!t)throw Error(`Unknown glTF material variant: ${e}`);for(let e of this.modelNodes){let r=e.userData.gltfMaterialVariants,n=r.mappings.get(t.index);e.model.setMaterial(n?.material||r.defaultMaterial),e.model.setParameters(n?.parameters||r.defaultParameters)}this.activeVariant=e}resetVariant(){for(let e of this.modelNodes){let t=e.userData.gltfMaterialVariants;e.model.setMaterial(t.defaultMaterial),e.model.setParameters(t.defaultParameters)}this.activeVariant=null}}function eU(e,t,r){let i,a,o;r?.strictExtensions&&function(e,t){let r=Array.from(e_(e,t).values()).filter(e=>e.required&&!e.supported);if(r.length)throw Error(`Unsupported required glTF extensions: ${r.map(e=>e.extensionName).join(", ")}`)}(t,e);let{scenes:s,materials:l,gltfMeshIdToNodeMap:c,gltfNodeIdToNodeMap:f,gltfNodeIndexToNodeMap:u,generatedTextures:m}=function(e,t,r={}){let n=new Set,i={...et,...r,generatedTextures:n},a=new g(e,{modules:[_.s]}),o=(t.materials||[]).map((r,n)=>{var o,s;return z(e,{id:(o=r,s=n,o.name||o.id||`material-${s}`),parsedPPBRMaterial:er(e,r,{},{...i,gltf:t,validateAttributes:!1}),materialFactory:a})}),s=new Map;(t.materials||[]).forEach((e,t)=>{s.set(e.id,o[t])});let l=new Map;t.meshes.forEach((r,n)=>{let a=en(e,r,t,s,i);l.set(r.id,a)});let c=new Map,f=new Map,u=new Set,m=new Set,p=new Set;return t.nodes.forEach((e,t)=>{var r;let n=(r=e,new A.o({id:r.name||r.id,children:[],matrix:r.matrix,display:r.extensions?.KHR_node_visibility?.visible!==!1,position:r.translation,rotation:r.rotation,scale:r.scale}));c.set(t,n),f.set(e.id,n)}),t.nodes.forEach((r,n)=>{if(c.get(n).add((r.children??[]).map(({id:e})=>{let t=f.get(e);if(!t)throw Error(`Cannot find child ${e} of node ${n}`);return t})),r.mesh){let a=r.mesh,o=function(e,t){let r,n=t.extensions?.EXT_mesh_gpu_instancing?.attributes;if(!n||"object"!=typeof n)return null;let i={};for(let[t,a]of Object.entries(n)){let n="number"==typeof a?e.accessors[a]:a;if(!n||!ArrayBuffer.isView(n.value))throw Error(`Invalid glTF instance accessor for ${t}`);if(void 0!==r&&n.count!==r)throw Error("glTF instance attributes must have matching accessor counts");r=n.count,i[t]={value:n.value,size:n.components||function(e){switch(e){case"VEC2":return 2;case"VEC3":return 3;case"VEC4":return 4;default:return 1}}(n.type),count:n.count,normalized:!!n.normalized}}let a=[];for(let e=0;e<(r||0);e++){let t=$(i.TRANSLATION,e,[0,0,0]),r=$(i.ROTATION,e,[0,0,0,1]),n=$(i.SCALE,e,[1,1,1]),o=Math.hypot(...r);if(o>0)for(let e=0;e<r.length;e++)r[e]/=o;a.push(new k.k().translate(t).multiplyRight(new k.k().fromQuaternion(r)).scale(n))}return{matrices:a,attributes:i}}(t,r),f=a.primitives.some(e=>!!e.targets?.length),d=o||f&&u.has(a.id)?en(e,a,t,s,i,o||void 0):l.get(a.id);if(!d)throw Error(`Cannot find mesh child ${r.mesh.id} of node ${n}`);let h=c.get(n),g=l.get(a.id),b=m.has(a.id)&&(void 0!==r.skin||p.has(a.id))&&d===g?en(e,a,t,s,i):d;if(h.add(b),h.userData.gltfMesh=b,m.add(a.id),void 0!==r.skin&&p.add(a.id),f){u.add(a.id);let e=a.primitives.find(e=>e.targets?.length)?.targets?.length||0,t=r.weights||a.weights||Array(e).fill(0);h.userData.morphMeshes=[b],i.modelOptions?.userData?.gltfAnimatedCrowd?h.userData.morphWeights=[...t]:q(h,t)}}}),{scenes:t.scenes.map(e=>{let t=(e.nodes||[]).map(({id:t})=>{let r=f.get(t);if(!r)throw Error(`Cannot find child ${t} of scene ${e.name||e.id}`);return r});return new A.o({id:e.name||e.id,children:t})}),materials:o,gltfMeshIdToNodeMap:l,gltfNodeIdToNodeMap:f,gltfNodeIndexToNodeMap:c,generatedTextures:n}}(e,t,r),p=(i=t.animations||[],a=new Map,o=new Map,i.flatMap((e,r)=>{let n=e.name||`Animation-${r}`,i=new Map,s=e.channels.flatMap(({sampler:r,target:n})=>{let s=function(e,t){let r;if("weights"===t.path)r=t.node;else{if("pointer"!==t.path)return;let e=t.extensions?.KHR_animation_pointer?.pointer,n="string"==typeof e?/^\/nodes\/(\d+)\/weights$/.exec(e):null;if(!n)return;r=Number(n[1])}let n=e.nodes[r??0],i="number"==typeof n?.mesh?e.meshes[n.mesh]:n?.mesh;return n?.weights?.length||i?.weights?.length||i?.primitives?.[0]?.targets?.length||1}(t,n),l=`${r}:${s??0}`,c=i.get(l);if(!c){let n=e.samplers[r];if(!n)throw Error(`Cannot find animation sampler ${r}`);let{input:f,interpolation:u="LINEAR",output:m}=n,p=function(e,t){if(t.has(e))return t.get(e);let{value:r,components:n}=ey(e);eE(1===n,"accessorToJsArray1D must have exactly 1 component");let i=Array.from(r);return t.set(e,i),i}(t.accessors[f],a),d=function(e,t){if(t.has(e))return t.get(e);let{value:r,components:n}=ey(e);eE(n>=1,"accessorToJsArray2D must have at least 1 component");let i=[];for(let e=0;e<r.length;e+=n)i.push(Array.from(r.slice(e,e+n)));return t.set(e,i),i}(t.accessors[m],o);c={input:p,interpolation:u,output:void 0!==s?function(e,t,r,n){let i=e.length/(Math.max(t,1)*("CUBICSPLINE"===r?3:1)),a=n>1?n:Number.isInteger(i)&&i>1?i:n;if(a<=1)return e;let o=e.flat(),s=[];for(let e=0;e<o.length;e+=a)s.push(o.slice(e,e+a));return s}(d,p.length,u,s):d},i.set(l,c)}let f=function(e,t,r){if("pointer"===t.path)return function(e,t,r){let n=t.extensions?.KHR_animation_pointer?.pointer;if("string"!=typeof n||!n.startsWith("/"))return I.R.warn("KHR_animation_pointer channel is missing a valid JSON pointer and will be skipped")(),null;let i=n.slice(1).split("/").map(e=>e.replace(/~1/g,"/").replace(/~0/g,"~"));switch(i[0]){case"nodes":var a,o,s,l,c,f,u,m,p=e,d=i,h=r,g=n;let b=5===d.length&&"extensions"===d[2]&&"KHR_node_visibility"===d[3]&&"visible"===d[4];if(3!==d.length&&!b)return ex(g,"node pointers must target transforms, morph weights, or KHR_node_visibility.visible"),null;let A=Number(d[1]),C=p.nodes[A];if(!Number.isInteger(A)||!C)return I.R.warn(`KHR_animation_pointer target ${g} references a missing node and will be skipped`)(),null;if(b&&"STEP"!==h.interpolation)return ex(g,"boolean visibility animation requires STEP interpolation"),null;let v=b?"visibility":eM(d[2]);return v?{type:"node",sampler:h,targetNodeId:C.id,path:v}:(ex(g,`node property "${d[2]}" has no runtime animation mapping`),null);case"materials":var B=e,S=i,_=r,M=n;if(S.length<3)return ex(M,"material pointers must include a material index and target property path"),null;let R=Number(S[1]),T=B.materials[R];if(!Number.isInteger(R)||!T)return I.R.warn(`KHR_animation_pointer target ${M} references a missing material and will be skipped`)(),null;let x=function(e,t){let r=function(e,t){let r,n=t.lastIndexOf("extensions");if(n<0||"KHR_texture_transform"!==t[n+1]||n<1)return{reason:"not-a-texture-transform-target"};let i=(0,eb.Mg)(t.slice(0,n));if(!i)return{reason:function(e){let t=eT(e);if(t){let e=eS[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`texture-transform target "${e.join("/")}" has no runtime texture-slot mapping`}(t.slice(0,n))};let a=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,i.pathSegments);if(!a)return{reason:`texture-transform target "${t.slice(0,n).join("/")}" does not exist on the referenced material`};let o=t[n+2];if("texCoord"===o)return{reason:"animated KHR_texture_transform.texCoord is unsupported because texCoord selection is structural, not a runtime float/vector update"};if("offset"!==o&&"rotation"!==o&&"scale"!==o)return{reason:`KHR_texture_transform property "${o}" is not animatable; supported properties are offset, rotation, and scale`};let s=t[n+3];if(t.length>n+4)return{reason:`KHR_texture_transform.${o} does not support nested property paths`};if(void 0!==s){if(r=Number(s),"rotation"===o)return{reason:"KHR_texture_transform.rotation does not support component indices"};if(!Number.isInteger(r)||r<0||r>1)return{reason:`KHR_texture_transform.${o} component index "${s}" is invalid; only 0 and 1 are supported`}}return{type:"textureTransform",textureSlot:i.slot,path:o,component:r,baseTransform:(0,eb.e3)(a)}}(e,t);if(!("reason"in r)||"not-a-texture-transform-target"!==r.reason)return r;switch(t.join("/")){case"pbrMetallicRoughness/baseColorFactor":return e.pbrMetallicRoughness?{type:"material",property:"baseColorFactor"}:{reason:eR(t)};case"pbrMetallicRoughness/metallicFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:0}:{reason:eR(t)};case"pbrMetallicRoughness/roughnessFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:1}:{reason:eR(t)};case"normalTexture/scale":return e.normalTexture?{type:"material",property:"normalScale"}:{reason:eR(t)};case"occlusionTexture/strength":return e.occlusionTexture?{type:"material",property:"occlusionStrength"}:{reason:eR(t)};case"emissiveFactor":return{type:"material",property:"emissiveFactor"};case"alphaCutoff":return{type:"material",property:"alphaCutoff"};case"extensions/KHR_materials_specular/specularFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularIntensityFactor"}:{reason:eR(t)};case"extensions/KHR_materials_specular/specularColorFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularColorFactor"}:{reason:eR(t)};case"extensions/KHR_materials_ior/ior":return e.extensions?.KHR_materials_ior?{type:"material",property:"ior"}:{reason:eR(t)};case"extensions/EXT_materials_bump/bumpFactor":return e.extensions?.EXT_materials_bump?{type:"material",property:"bumpFactor"}:{reason:eR(t)};case"extensions/KHR_materials_diffuse_transmission/diffuseTransmissionFactor":return e.extensions?.KHR_materials_diffuse_transmission?{type:"material",property:"diffuseTransmissionFactor"}:{reason:eR(t)};case"extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorFactor":return e.extensions?.KHR_materials_diffuse_transmission?{type:"material",property:"diffuseTransmissionColorFactor"}:{reason:eR(t)};case"extensions/KHR_materials_volume_scatter/multiscatterColorFactor":case"extensions/KHR_materials_volume_scatter/multiscatterColor":return e.extensions?.KHR_materials_volume_scatter?{type:"material",property:"multiscatterColorFactor"}:{reason:eR(t)};case"extensions/KHR_materials_volume_scatter/scatterAnisotropy":return e.extensions?.KHR_materials_volume_scatter?{type:"material",property:"scatterAnisotropy"}:{reason:eR(t)};case"extensions/KHR_materials_dispersion/dispersion":return e.extensions?.KHR_materials_dispersion?{type:"material",property:"dispersion"}:{reason:eR(t)};case"extensions/KHR_materials_transmission/transmissionFactor":return e.extensions?.KHR_materials_transmission?{type:"material",property:"transmissionFactor"}:{reason:eR(t)};case"extensions/KHR_materials_volume/thicknessFactor":return e.extensions?.KHR_materials_volume?{type:"material",property:"thicknessFactor"}:{reason:eR(t)};case"extensions/KHR_materials_volume/attenuationDistance":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationDistance"}:{reason:eR(t)};case"extensions/KHR_materials_volume/attenuationColor":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationColor"}:{reason:eR(t)};case"extensions/KHR_materials_clearcoat/clearcoatFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatFactor"}:{reason:eR(t)};case"extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatRoughnessFactor"}:{reason:eR(t)};case"extensions/KHR_materials_sheen/sheenColorFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenColorFactor"}:{reason:eR(t)};case"extensions/KHR_materials_sheen/sheenRoughnessFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenRoughnessFactor"}:{reason:eR(t)};case"extensions/KHR_materials_iridescence/iridescenceFactor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceFactor"}:{reason:eR(t)};case"extensions/KHR_materials_iridescence/iridescenceIor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceIor"}:{reason:eR(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMinimum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:0}:{reason:eR(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMaximum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:1}:{reason:eR(t)};case"extensions/KHR_materials_anisotropy/anisotropyStrength":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyStrength"}:{reason:eR(t)};case"extensions/KHR_materials_anisotropy/anisotropyRotation":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyRotation"}:{reason:eR(t)};case"extensions/KHR_materials_emissive_strength/emissiveStrength":return e.extensions?.KHR_materials_emissive_strength?{type:"material",property:"emissiveStrength"}:{reason:eR(t)};default:return{reason:eR(t)}}}(T,S.slice(2));return"reason"in x?(ex(M,x.reason),null):{sampler:_,pointer:M,targetMaterialIndex:R,...x};case"cameras":let y,E,F,U;return a=e,o=i,s=r,l=n,y=Number(o[1]),E=a.cameras?.[y],F=o[2],U=o[3],4===o.length&&Number.isInteger(y)&&E&&("perspective"===F||"orthographic"===F)&&E.type===F&&("perspective"===F?["aspectRatio","yfov","znear","zfar"]:["xmag","ymag","znear","zfar"]).includes(U)?{type:"camera",sampler:s,pointer:l,targetCameraIndex:y,projection:F,property:U}:(ex(l,"camera pointers must target a supported projection property"),null);case"extensions":if("KHR_lights_punctual"===i[1]){let t,a,o,s,l,p;return c=e,f=i,u=r,m=n,t=Number(f[3]),a=c.lights||c.extensions?.KHR_lights_punctual?.lights,s=(o="spot"===f[4])?f[5]:f[4],l=o||"color"!==s?void 0:f[5],p=o||void 0!==l?6:5,"lights"===f[2]&&f.length===p&&Number.isInteger(t)&&Array.isArray(a)&&a[t]&&["color","intensity","range","innerConeAngle","outerConeAngle"].includes(s)&&(!o||"innerConeAngle"===s||"outerConeAngle"===s)&&(void 0===l||/^[0-2]$/.test(l)&&"color"===s)?{type:"light",sampler:u,pointer:m,targetLightIndex:t,property:s,...void 0===l?{}:{component:Number(l)}}:(ex(m,"punctual-light pointers must target supported typed light properties"),null)}}return ex(n,`top-level target "${i[0]}" has no runtime animation mapping`),null}(e,t,r);let n=eM(t.path);if(!n)return null;let i=e.nodes[t.node??0];if(!i)throw Error(`Cannot find animation target ${t.node}`);return{type:"node",sampler:r,targetNodeId:i.id,path:n}}(t,n,c);return f?[f]:[]});return s.length?[{name:n,channels:s}]:[]})),d=(t.lights||t.extensions?.KHR_lights_punctual?.lights||[]).map(e=>({...e,...Array.isArray(e.color)?{color:[...e.color]}:{},...e.spot?{spot:{...e.spot}}:{}})),h=(t.cameras||[]).map(e=>{let t={...e};return e.perspective&&(t.perspective={...e.perspective}),e.orthographic&&(t.orthographic={...e.orthographic}),t}),b={useByteColors:r?.useByteColors??!0,nodeVisibility:f,lightDefinitions:d},C=ea(t,b),v=()=>{C.splice(0,C.length,...ea(t,b))},B=new eC({onVisibilityChange:v,cameras:h,lightDefinitions:d,onLightChange:v,animations:p,gltfNodeIdToNodeMap:f,materials:l}),S=new eF(t,s),M=e_(t,e),R=s.map(e=>eN(e.getBounds())),T=function(e){let t=null;for(let r of e)if(r.bounds){if(!t){t=[[...r.bounds[0]],[...r.bounds[1]]];continue}for(let e=0;e<3;e++)t[0][e]=Math.min(t[0][e],r.bounds[0][e]),t[1][e]=Math.max(t[1][e],r.bounds[1][e])}return eN(t)}(R),x=new ev({gltf:t,scenes:s,gltfNodeIndexToNodeMap:u});B.setUpdateHandler(()=>x.update());let y=!1;return{scenes:s,materials:l,variants:S,cameras:h,animator:B,animations:p,lights:C,extensionSupport:M,sceneBounds:R,modelBounds:T,gltfMeshIdToNodeMap:c,gltfNodeIdToNodeMap:f,gltfNodeIndexToNodeMap:u,skins:x,gltf:t,destroy:()=>{if(y)return;y=!0;let e=new Set([...s,...c.values(),...f.values()]),t=new Set,r=new Set(l);for(let i of e)i.preorderTraversal(e=>{e instanceof n.s&&(t.add(e),e.model?.material&&r.add(e.model.material))});for(let e of t)e.destroy();for(let t of e)t.destroy();for(let e of r)e.destroy();for(let e of m)e.destroy();m.clear()}}}function eN(e){if(!e)return{bounds:null,center:[0,0,0],size:[0,0,0],radius:.5,recommendedOrbitDistance:1};let t=[[e[0][0],e[0][1],e[0][2]],[e[1][0],e[1][1],e[1][2]]],r=[t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]],n=[t[0][0]+.5*r[0],t[0][1]+.5*r[1],t[0][2]+.5*r[2]],i=.5*Math.max(r[0],r[1],r[2]),a=Math.max(.5*Math.hypot(r[0],r[1],r[2]),.001);return{bounds:t,center:n,size:r,radius:a,recommendedOrbitDistance:Math.max(Math.max(i,.001)/Math.tan(Math.PI/6)*1.15,1.1*a)}}},27282(e,t,r){r.d(t,{lO:()=>f});var n=r(13559),i=r(38550),a=r(74788),o=r(29244),s=r(92397);function l(e){switch(e){case s.n.CLAMP_TO_EDGE:return"clamp-to-edge";case s.n.REPEAT:return"repeat";case s.n.MIRRORED_REPEAT:return"mirror-repeat";default:return}}let c={NORMAL:["NORMAL","normals"],TANGENT:["TANGENT"],TEXCOORD_0:["TEXCOORD_0","texCoords"],TEXCOORD_1:["TEXCOORD_1","texCoords1"],JOINTS_0:["JOINTS_0"],WEIGHTS_0:["WEIGHTS_0"],COLOR_0:["COLOR_0","colors"]};function f(e,t,r,i){let a={defines:{MANUAL_SRGB:!0},bindings:{},uniforms:{camera:[0,0,0],metallicRoughnessValues:[1,1]},parameters:{},glParameters:{},generatedTextures:[]};a.defines.USE_TEX_LOD=!0;let{imageBasedLightingEnvironment:o}=i;return o&&(a.bindings.pbr_diffuseEnvSampler=o.diffuseEnvSampler.texture,a.bindings.pbr_specularEnvSampler=o.specularEnvSampler.texture,a.bindings.pbr_brdfLUT=o.brdfLutTexture.texture,a.uniforms.IBLenabled=!0,a.uniforms.scaleIBLAmbient=[1,1]),i?.pbrDebug&&(a.defines.PBR_DEBUG=!0,a.uniforms.scaleDiffBaseMR=[0,0,0,0],a.uniforms.scaleFGDSpec=[0,0,0,0]),m(r,"NORMAL")&&(a.defines.HAS_NORMALS=!0),m(r,"TANGENT")&&i?.useTangents&&(a.defines.HAS_TANGENTS=!0),m(r,"TEXCOORD_0")&&(a.defines.HAS_UV=!0),m(r,"TEXCOORD_1")&&(a.defines.HAS_UV_1=!0),m(r,"JOINTS_0")&&m(r,"WEIGHTS_0")&&(a.defines.HAS_SKIN=!0),m(r,"COLOR_0")&&(a.defines.HAS_COLORS=!0),i?.imageBasedLightingEnvironment&&(a.defines.USE_IBL=!0),i?.lights&&(a.defines.USE_LIGHTS=!0),t&&(!1!==i.validateAttributes&&function(e,t){let r=u(e,0);r.length>0&&!m(t,"TEXCOORD_0")&&n.R.warn(`glTF material uses ${r.join(", ")} but primitive is missing TEXCOORD_0; textured shading will sample the default UV coordinates`)();let i=u(e,1);if(i.length>0&&!m(t,"TEXCOORD_1")&&n.R.warn(`glTF material uses ${i.join(", ")} with TEXCOORD_1 but primitive is missing TEXCOORD_1; those textures will be skipped`)(),e.unlit||e.extensions?.KHR_materials_unlit||m(t,"NORMAL"))return;let a=e.normalTexture?"lit PBR shading with normalTexture":"lit PBR shading";n.R.warn(`glTF primitive is missing NORMAL while using ${a}; shading will fall back to geometric normals`)()}(t,r),function(e,t,r,i,a){if(r.uniforms.unlit=!!(t.unlit||t.extensions?.KHR_materials_unlit),t.pbrMetallicRoughness&&function(e,t,r,n,i){t.baseColorTexture&&p(e,t.baseColorTexture,"pbr_baseColorSampler",r,{featureOptions:{define:"HAS_BASECOLORMAP",enabledUniformName:"baseColorMapEnabled"},gltf:i,attributes:n,textureTransformSlot:"baseColor"}),r.uniforms.baseColorFactor=t.baseColorFactor||[1,1,1,1],t.metallicRoughnessTexture&&p(e,t.metallicRoughnessTexture,"pbr_metallicRoughnessSampler",r,{featureOptions:{define:"HAS_METALROUGHNESSMAP",enabledUniformName:"metallicRoughnessMapEnabled"},gltf:i,attributes:n,textureTransformSlot:"metallicRoughness"});let{metallicFactor:a=1,roughnessFactor:o=1}=t;r.uniforms.metallicRoughnessValues=[a,o]}(e,t.pbrMetallicRoughness,r,i,a),t.normalTexture){p(e,t.normalTexture,"pbr_normalSampler",r,{featureOptions:{define:"HAS_NORMALMAP",enabledUniformName:"normalMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"normal"});let{scale:n=1}=t.normalTexture;r.uniforms.normalScale=n}if(t.occlusionTexture){p(e,t.occlusionTexture,"pbr_occlusionSampler",r,{featureOptions:{define:"HAS_OCCLUSIONMAP",enabledUniformName:"occlusionMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"occlusion"});let{strength:n=1}=t.occlusionTexture;r.uniforms.occlusionStrength=n}switch(r.uniforms.emissiveFactor=t.emissiveFactor||[0,0,0],t.emissiveTexture&&p(e,t.emissiveTexture,"pbr_emissiveSampler",r,{featureOptions:{define:"HAS_EMISSIVEMAP",enabledUniformName:"emissiveMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"emissive"}),function(e,t,r,i,a={}){var o,l,c,f,u,m,d;t&&(((o=t).KHR_materials_specular||o.KHR_materials_ior||o.EXT_materials_bump||o.KHR_materials_transmission||o.KHR_materials_diffuse_transmission||o.KHR_materials_volume||o.KHR_materials_volume_scatter||o.KHR_materials_dispersion||o.KHR_materials_clearcoat||o.KHR_materials_sheen||o.KHR_materials_iridescence||o.KHR_materials_anisotropy)&&(r.defines.USE_MATERIAL_EXTENSIONS=!0),function(e,t,r,n,i={}){t&&(t.specularColorFactor&&(r.uniforms.specularColorFactor=t.specularColorFactor),void 0!==t.specularFactor&&(r.uniforms.specularIntensityFactor=t.specularFactor),t.specularColorTexture&&p(e,t.specularColorTexture,"pbr_specularColorSampler",r,{featureOptions:{define:"HAS_SPECULARCOLORMAP",enabledUniformName:"specularColorMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"specularColor"}),t.specularTexture&&p(e,t.specularTexture,"pbr_specularIntensitySampler",r,{featureOptions:{define:"HAS_SPECULARINTENSITYMAP",enabledUniformName:"specularIntensityMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"specularIntensity"}))}(e,t.KHR_materials_specular,r,i,a),l=t.KHR_materials_ior,c=r,l?.ior!==void 0&&(c.uniforms.ior=l.ior),function(e,t,r,n,i={}){t&&(r.uniforms.bumpFactor=Math.max(t.bumpFactor??1,0),t.bumpTexture&&p(e,t.bumpTexture,"pbr_bumpSampler",r,{featureOptions:{define:"HAS_BUMPMAP",enabledUniformName:"bumpMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"bump"}))}(e,t.EXT_materials_bump,r,i,a),function(e,t,r,i,a={}){t&&(void 0!==t.transmissionFactor&&(r.uniforms.transmissionFactor=t.transmissionFactor),t.transmissionTexture&&p(e,t.transmissionTexture,"pbr_transmissionSampler",r,{featureOptions:{define:"HAS_TRANSMISSIONMAP",enabledUniformName:"transmissionMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"transmission"}),(t.transmissionFactor??0)>0||t.transmissionTexture)&&(n.R.warn("KHR_materials_transmission uses a premultiplied-alpha blending approximation and may require mesh sorting")(),r.parameters.blend=!0,r.parameters.depthWriteEnabled=!1,r.parameters.blendColorOperation="add",r.parameters.blendColorSrcFactor="one",r.parameters.blendColorDstFactor="one-minus-src-alpha",r.parameters.blendAlphaOperation="add",r.parameters.blendAlphaSrcFactor="one",r.parameters.blendAlphaDstFactor="one-minus-src-alpha",r.glParameters.blend=!0,r.glParameters.depthMask=!1,r.glParameters.blendEquation=s.n.FUNC_ADD,r.glParameters.blendFunc=[s.n.ONE,s.n.ONE_MINUS_SRC_ALPHA,s.n.ONE,s.n.ONE_MINUS_SRC_ALPHA])}(e,t.KHR_materials_transmission,r,i,a),function(e,t,r,n,i={}){t&&(r.uniforms.diffuseTransmissionFactor=Math.min(Math.max(t.diffuseTransmissionFactor??0,0),1),r.uniforms.diffuseTransmissionColorFactor=t.diffuseTransmissionColorFactor||[1,1,1],t.diffuseTransmissionTexture&&p(e,t.diffuseTransmissionTexture,"pbr_diffuseTransmissionSampler",r,{featureOptions:{define:"HAS_DIFFUSETRANSMISSIONMAP",enabledUniformName:"diffuseTransmissionMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"diffuseTransmission"}),t.diffuseTransmissionColorTexture&&p(e,t.diffuseTransmissionColorTexture,"pbr_diffuseTransmissionColorSampler",r,{featureOptions:{define:"HAS_DIFFUSETRANSMISSIONCOLORMAP",enabledUniformName:"diffuseTransmissionColorMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"diffuseTransmissionColor"}))}(e,t.KHR_materials_diffuse_transmission,r,i,a),function(e,t,r,n,i={}){t&&(void 0!==t.thicknessFactor&&(r.uniforms.thicknessFactor=t.thicknessFactor),t.thicknessTexture&&p(e,t.thicknessTexture,"pbr_thicknessSampler",r,{featureOptions:{define:"HAS_THICKNESSMAP"},gltf:n,attributes:i,textureTransformSlot:"thickness"}),void 0!==t.attenuationDistance&&(r.uniforms.attenuationDistance=t.attenuationDistance),t.attenuationColor&&(r.uniforms.attenuationColor=t.attenuationColor))}(e,t.KHR_materials_volume,r,i,a),function(e,t,r,n,i,a={}){t&&r&&(n.uniforms.multiscatterColorFactor=t.multiscatterColorFactor||t.multiscatterColor||[0,0,0],n.uniforms.scatterAnisotropy=Math.min(Math.max(t.scatterAnisotropy??0,-.999),.999),t.multiscatterColorTexture&&p(e,t.multiscatterColorTexture,"pbr_multiscatterColorSampler",n,{featureOptions:{define:"HAS_MULTISCATTERCOLORMAP",enabledUniformName:"multiscatterColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"multiscatterColor"}))}(e,t.KHR_materials_volume_scatter,t.KHR_materials_volume,r,i,a),f=t.KHR_materials_dispersion,u=r,f?.dispersion!==void 0&&(u.uniforms.dispersion=Math.max(f.dispersion,0)),function(e,t,r,n,i={}){t&&(void 0!==t.clearcoatFactor&&(r.uniforms.clearcoatFactor=t.clearcoatFactor),void 0!==t.clearcoatRoughnessFactor&&(r.uniforms.clearcoatRoughnessFactor=t.clearcoatRoughnessFactor),t.clearcoatTexture&&p(e,t.clearcoatTexture,"pbr_clearcoatSampler",r,{featureOptions:{define:"HAS_CLEARCOATMAP",enabledUniformName:"clearcoatMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"clearcoat"}),t.clearcoatRoughnessTexture&&p(e,t.clearcoatRoughnessTexture,"pbr_clearcoatRoughnessSampler",r,{featureOptions:{define:"HAS_CLEARCOATROUGHNESSMAP",enabledUniformName:"clearcoatRoughnessMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"clearcoatRoughness"}),t.clearcoatNormalTexture&&p(e,t.clearcoatNormalTexture,"pbr_clearcoatNormalSampler",r,{featureOptions:{define:"HAS_CLEARCOATNORMALMAP"},gltf:n,attributes:i,textureTransformSlot:"clearcoatNormal"}))}(e,t.KHR_materials_clearcoat,r,i,a),function(e,t,r,n,i={}){t&&(t.sheenColorFactor&&(r.uniforms.sheenColorFactor=t.sheenColorFactor),void 0!==t.sheenRoughnessFactor&&(r.uniforms.sheenRoughnessFactor=t.sheenRoughnessFactor),t.sheenColorTexture&&p(e,t.sheenColorTexture,"pbr_sheenColorSampler",r,{featureOptions:{define:"HAS_SHEENCOLORMAP",enabledUniformName:"sheenColorMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"sheenColor"}),t.sheenRoughnessTexture&&p(e,t.sheenRoughnessTexture,"pbr_sheenRoughnessSampler",r,{featureOptions:{define:"HAS_SHEENROUGHNESSMAP",enabledUniformName:"sheenRoughnessMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"sheenRoughness"}))}(e,t.KHR_materials_sheen,r,i,a),function(e,t,r,n,i={}){t&&(void 0!==t.iridescenceFactor&&(r.uniforms.iridescenceFactor=t.iridescenceFactor),void 0!==t.iridescenceIor&&(r.uniforms.iridescenceIor=t.iridescenceIor),(void 0!==t.iridescenceThicknessMinimum||void 0!==t.iridescenceThicknessMaximum)&&(r.uniforms.iridescenceThicknessRange=[t.iridescenceThicknessMinimum??100,t.iridescenceThicknessMaximum??400]),t.iridescenceTexture&&p(e,t.iridescenceTexture,"pbr_iridescenceSampler",r,{featureOptions:{define:"HAS_IRIDESCENCEMAP",enabledUniformName:"iridescenceMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"iridescence"}),t.iridescenceThicknessTexture&&p(e,t.iridescenceThicknessTexture,"pbr_iridescenceThicknessSampler",r,{featureOptions:{define:"HAS_IRIDESCENCETHICKNESSMAP"},gltf:n,attributes:i,textureTransformSlot:"iridescenceThickness"}))}(e,t.KHR_materials_iridescence,r,i,a),function(e,t,r,n,i={}){t&&(void 0!==t.anisotropyStrength&&(r.uniforms.anisotropyStrength=t.anisotropyStrength),void 0!==t.anisotropyRotation&&(r.uniforms.anisotropyRotation=t.anisotropyRotation),t.anisotropyTexture&&p(e,t.anisotropyTexture,"pbr_anisotropySampler",r,{featureOptions:{define:"HAS_ANISOTROPYMAP",enabledUniformName:"anisotropyMapEnabled"},gltf:n,attributes:i,textureTransformSlot:"anisotropy"}))}(e,t.KHR_materials_anisotropy,r,i,a),m=t.KHR_materials_emissive_strength,d=r,m?.emissiveStrength!==void 0&&(d.uniforms.emissiveStrength=m.emissiveStrength))}(e,t.extensions,r,a,i),t.alphaMode||"OPAQUE"){case"OPAQUE":break;case"MASK":{let{alphaCutoff:e=.5}=t;r.defines.ALPHA_CUTOFF=!0,r.uniforms.alphaCutoffEnabled=!0,r.uniforms.alphaCutoff=e;break}case"BLEND":var o;n.R.warn("glTF BLEND alphaMode might not work well because it requires mesh sorting")(),(o=r).parameters.blend=!0,o.parameters.blendColorOperation="add",o.parameters.blendColorSrcFactor="src-alpha",o.parameters.blendColorDstFactor="one-minus-src-alpha",o.parameters.blendAlphaOperation="add",o.parameters.blendAlphaSrcFactor="one",o.parameters.blendAlphaDstFactor="one-minus-src-alpha",o.glParameters.blend=!0,o.glParameters.blendEquation=s.n.FUNC_ADD,o.glParameters.blendFunc=[s.n.SRC_ALPHA,s.n.ONE_MINUS_SRC_ALPHA,s.n.ONE,s.n.ONE_MINUS_SRC_ALPHA]}}(e,t,a,r,i.gltf)),a}function u(e,t){let r=[];for(let n of(0,o.ii)()){let i=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,n.pathSegments);i&&(0,o.CC)(i)===t&&r.push(n.displayName)}return r}function m(e,t){return c[t].some(t=>!!e[t])}function p(e,t,r,c,f={}){let{featureOptions:u={},gltf:g,attributes:b={},textureTransformSlot:A}=f,{define:C,enabledUniformName:v}=u,B=(0,o.CC)(t);if(B>1)return void n.R.warn(`Skipping ${String(r)} because ${B} is not supported; only TEXCOORD_0 and TEXCOORD_1 are currently available`)();if(1===B&&!m(b,"TEXCOORD_1"))return void n.R.warn(`Skipping ${String(r)} because it requires TEXCOORD_1 but the primitive does not provide TEXCOORD_1`)();let S=function(e,t){if(e.texture||void 0===e.index||!t?.textures)return e;let r=t.textures[e.index];return r?"texture"in r&&r.texture?{...r,...e,texture:r.texture}:"source"in r?{...e,texture:r}:e:e}(t,g),_=S.texture?.source?.image;if(!_)return void n.R.warn(`Skipping unresolved glTF texture for ${String(r)}`)();let I=function(e,t,r){if("compressed"in t)return function(e,t,r){let o;if(0===(o=Array.isArray(t.data)&&t.data[0]?.data?t.data:"mipmaps"in t&&Array.isArray(t.mipmaps)?t.mipmaps:[]).length||!o[0]?.data)return n.R.warn("createCompressedTexture: compressed image has no valid mip levels, creating fallback")(),d(e,r);let s=o[0],l=s.width??t.width??0,c=s.height??t.height??0;if(l<=0||c<=0)return n.R.warn("createCompressedTexture: base level has invalid dimensions, creating fallback")(),d(e,r);let f=h(s);if(!f)return n.R.warn("createCompressedTexture: compressed image has no textureFormat, creating fallback")(),d(e,r);if(!e.isTextureFormatSupported(f))return n.R.warn(`createCompressedTexture: ${e.type} device does not support '${f}', creating fallback`)(),d(e,r);let u=function(e,t,r){let{blockWidth:n=1,blockHeight:i=1}=a.vz.getInfo(r),o=1;for(let r=1;;r++){let a=Math.max(1,e>>r),s=Math.max(1,t>>r);if(a<n||s<i)break;o++}return o}(l,c,f),m=Math.min(o.length,u),p=1;for(let e=1;e<m;e++){let t=o[e];if(!t.data||t.width<=0||t.height<=0){n.R.warn(`createCompressedTexture: mip level ${e} has invalid data/dimensions, truncating`)();break}let r=h(t);if(r&&r!==f){n.R.warn(`createCompressedTexture: mip level ${e} format '${r}' differs from base '${f}', truncating`)();break}let i=Math.max(1,l>>e),a=Math.max(1,c>>e);if(t.width!==i||t.height!==a){n.R.warn(`createCompressedTexture: mip level ${e} dimensions ${t.width}x${t.height} don't match expected ${i}x${a}, truncating`)();break}p++}let g=e.createTexture({...r,format:f,usage:i.g.TEXTURE|i.g.COPY_DST,width:l,height:c,mipLevels:p,data:s.data});for(let e=1;e<p;e++)g.writeData(o[e].data,{width:o[e].width,height:o[e].height,mipLevel:e});return g}(e,t,{id:r.id,sampler:r.sampler});let o=void 0!==r.width&&void 0!==r.height?{width:r.width,height:r.height}:e.getExternalImageSize(t),s="nearest"===r.sampler.mipmapFilter||"linear"===r.sampler.mipmapFilter,l=s?e.getMipLevelCount(o.width,o.height):1,c=e.createTexture({id:r.id,sampler:r.sampler,width:o.width,height:o.height,mipLevels:l,...s?{usage:i.g.SAMPLE|i.g.RENDER|i.g.COPY_DST|i.g.COPY_SRC}:{},...r.colorSpace?{format:"srgb"===r.colorSpace?"rgba8unorm-srgb":"rgba8unorm"}:{},data:t});return l>1&&("webgl"===e.type?c.generateMipmapsWebGL():"webgpu"===e.type&&e.generateMipmapsWebGPU(c)),c}(e,_,{id:S.uniformName||S.id,sampler:{addressModeU:"repeat",addressModeV:"repeat",minFilter:"linear",magFilter:"linear",...function(e={}){let t=e.wrapS??e.parameters?.[s.n.TEXTURE_WRAP_S],r=e.wrapT??e.parameters?.[s.n.TEXTURE_WRAP_T],n=e.magFilter??e.parameters?.[s.n.TEXTURE_MAG_FILTER],i=e.minFilter??e.parameters?.[s.n.TEXTURE_MIN_FILTER],a=l(t),o=l(r),c=function(e){switch(e){case s.n.NEAREST:return"nearest";case s.n.LINEAR:return"linear";default:return}}(n);return{...a?{addressModeU:a}:{},...o?{addressModeV:o}:{},...c?{magFilter:c}:{},...function(e){switch(e){case s.n.NEAREST:return{minFilter:"nearest"};case s.n.LINEAR:return{minFilter:"linear"};case s.n.NEAREST_MIPMAP_NEAREST:return{minFilter:"nearest",mipmapFilter:"nearest"};case s.n.LINEAR_MIPMAP_NEAREST:return{minFilter:"linear",mipmapFilter:"nearest"};case s.n.NEAREST_MIPMAP_LINEAR:return{minFilter:"nearest",mipmapFilter:"linear"};case s.n.LINEAR_MIPMAP_LINEAR:return{minFilter:"linear",mipmapFilter:"linear"};default:return{}}}(i)}}(S.texture.sampler)}});if(c.bindings[r]=I,C&&(c.defines[C]=!0),v&&(c.uniforms[v]=!0),A){let e=(0,o.lz)(A);c.uniforms[e.uvSetUniform]=B,c.uniforms[e.uvTransformUniform]=(0,o.VJ)((0,o.e3)(t))}c.generatedTextures.push(I)}function d(e,t){return e.createTexture({...t,format:"rgba8unorm",width:1,height:1,mipLevels:1})}function h(e){return e.textureFormat}},29244(e,t,r){r.d(t,{CC:()=>f,Mg:()=>u,VJ:()=>m,dy:()=>p,e3:()=>c,ii:()=>s,lz:()=>l});var n=r(34331);let i=[o("baseColor","pbr_baseColorSampler","baseColorTexture",["pbrMetallicRoughness","baseColorTexture"]),o("metallicRoughness","pbr_metallicRoughnessSampler","metallicRoughnessTexture",["pbrMetallicRoughness","metallicRoughnessTexture"]),o("normal","pbr_normalSampler","normalTexture",["normalTexture"]),o("occlusion","pbr_occlusionSampler","occlusionTexture",["occlusionTexture"]),o("emissive","pbr_emissiveSampler","emissiveTexture",["emissiveTexture"]),o("specularColor","pbr_specularColorSampler","KHR_materials_specular.specularColorTexture",["extensions","KHR_materials_specular","specularColorTexture"]),o("specularIntensity","pbr_specularIntensitySampler","KHR_materials_specular.specularTexture",["extensions","KHR_materials_specular","specularTexture"]),o("transmission","pbr_transmissionSampler","KHR_materials_transmission.transmissionTexture",["extensions","KHR_materials_transmission","transmissionTexture"]),o("thickness","pbr_thicknessSampler","KHR_materials_volume.thicknessTexture",["extensions","KHR_materials_volume","thicknessTexture"]),o("clearcoat","pbr_clearcoatSampler","KHR_materials_clearcoat.clearcoatTexture",["extensions","KHR_materials_clearcoat","clearcoatTexture"]),o("clearcoatRoughness","pbr_clearcoatRoughnessSampler","KHR_materials_clearcoat.clearcoatRoughnessTexture",["extensions","KHR_materials_clearcoat","clearcoatRoughnessTexture"]),o("clearcoatNormal","pbr_clearcoatNormalSampler","KHR_materials_clearcoat.clearcoatNormalTexture",["extensions","KHR_materials_clearcoat","clearcoatNormalTexture"]),o("sheenColor","pbr_sheenColorSampler","KHR_materials_sheen.sheenColorTexture",["extensions","KHR_materials_sheen","sheenColorTexture"]),o("sheenRoughness","pbr_sheenRoughnessSampler","KHR_materials_sheen.sheenRoughnessTexture",["extensions","KHR_materials_sheen","sheenRoughnessTexture"]),o("iridescence","pbr_iridescenceSampler","KHR_materials_iridescence.iridescenceTexture",["extensions","KHR_materials_iridescence","iridescenceTexture"]),o("iridescenceThickness","pbr_iridescenceThicknessSampler","KHR_materials_iridescence.iridescenceThicknessTexture",["extensions","KHR_materials_iridescence","iridescenceThicknessTexture"]),o("anisotropy","pbr_anisotropySampler","KHR_materials_anisotropy.anisotropyTexture",["extensions","KHR_materials_anisotropy","anisotropyTexture"]),o("bump","pbr_bumpSampler","EXT_materials_bump.bumpTexture",["extensions","EXT_materials_bump","bumpTexture"]),o("diffuseTransmission","pbr_diffuseTransmissionSampler","KHR_materials_diffuse_transmission.diffuseTransmissionTexture",["extensions","KHR_materials_diffuse_transmission","diffuseTransmissionTexture"]),o("diffuseTransmissionColor","pbr_diffuseTransmissionColorSampler","KHR_materials_diffuse_transmission.diffuseTransmissionColorTexture",["extensions","KHR_materials_diffuse_transmission","diffuseTransmissionColorTexture"]),o("multiscatterColor","pbr_multiscatterColorSampler","KHR_materials_volume_scatter.multiscatterColorTexture",["extensions","KHR_materials_volume_scatter","multiscatterColorTexture"])],a=new Map(i.map(e=>[e.slot,e]));function o(e,t,r,n){return{slot:e,binding:t,displayName:r,pathSegments:n,colorSpace:"baseColor"===e||"emissive"===e||"specularColor"===e||"sheenColor"===e||"diffuseTransmissionColor"===e||"multiscatterColor"===e?"srgb":"linear",uvSetUniform:`${e}UVSet`,uvTransformUniform:`${e}UVTransform`}}function s(){return i}function l(e){let t=a.get(e);if(!t)throw Error(`Unknown PBR texture transform slot ${e}`);return t}function c(e){let t=e?.extensions?.KHR_texture_transform;return{offset:t?.offset?[t.offset[0],t.offset[1]]:[0,0],rotation:t?.rotation??0,scale:t?.scale?[t.scale[0],t.scale[1]]:[1,1]}}function f(e){let t=e?.extensions?.KHR_texture_transform;return t?.texCoord??e?.texCoord??0}function u(e){return i.find(t=>t.pathSegments.length===e.length&&t.pathSegments.every((t,r)=>e[r]===t))||null}function m(e){let t=new n.d().set(1,0,0,0,1,0,e.offset[0],e.offset[1],1),r=new n.d().set(Math.cos(e.rotation),Math.sin(e.rotation),0,-Math.sin(e.rotation),Math.cos(e.rotation),0,0,0,1),i=new n.d().set(e.scale[0],0,0,0,e.scale[1],0,0,0,1);return Array.from(t.multiplyRight(r).multiplyRight(i))}function p(e,t){let r=new n.d(m(e)),i=new n.d(m(t)),a=new n.d(r).invert();return Array.from(i.multiplyRight(a))}},92397(e,t,r){var n,i;r.d(t,{n:()=>n}),(i=n||(n={}))[i.POINTS=0]="POINTS",i[i.LINES=1]="LINES",i[i.LINE_LOOP=2]="LINE_LOOP",i[i.LINE_STRIP=3]="LINE_STRIP",i[i.TRIANGLES=4]="TRIANGLES",i[i.TRIANGLE_STRIP=5]="TRIANGLE_STRIP",i[i.TRIANGLE_FAN=6]="TRIANGLE_FAN",i[i.ONE=1]="ONE",i[i.SRC_ALPHA=770]="SRC_ALPHA",i[i.ONE_MINUS_SRC_ALPHA=771]="ONE_MINUS_SRC_ALPHA",i[i.FUNC_ADD=32774]="FUNC_ADD",i[i.LINEAR=9729]="LINEAR",i[i.NEAREST=9728]="NEAREST",i[i.NEAREST_MIPMAP_NEAREST=9984]="NEAREST_MIPMAP_NEAREST",i[i.LINEAR_MIPMAP_NEAREST=9985]="LINEAR_MIPMAP_NEAREST",i[i.NEAREST_MIPMAP_LINEAR=9986]="NEAREST_MIPMAP_LINEAR",i[i.LINEAR_MIPMAP_LINEAR=9987]="LINEAR_MIPMAP_LINEAR",i[i.TEXTURE_MAG_FILTER=10240]="TEXTURE_MAG_FILTER",i[i.TEXTURE_MIN_FILTER=10241]="TEXTURE_MIN_FILTER",i[i.TEXTURE_WRAP_S=10242]="TEXTURE_WRAP_S",i[i.TEXTURE_WRAP_T=10243]="TEXTURE_WRAP_T",i[i.REPEAT=10497]="REPEAT",i[i.CLAMP_TO_EDGE=33071]="CLAMP_TO_EDGE",i[i.MIRRORED_REPEAT=33648]="MIRRORED_REPEAT",i[i.UNPACK_FLIP_Y_WEBGL=37440]="UNPACK_FLIP_Y_WEBGL"},9696(e,t,r){r.d(t,{s:()=>u});let n=`\
#ifdef USE_IBL
@group(2) @binding(auto) var pbr_diffuseEnvSampler: texture_cube<f32>;
@group(2) @binding(auto) var pbr_diffuseEnvSamplerSampler: sampler;
@group(2) @binding(auto) var pbr_specularEnvSampler: texture_cube<f32>;
@group(2) @binding(auto) var pbr_specularEnvSamplerSampler: sampler;
@group(2) @binding(auto) var pbr_brdfLUT: texture_2d<f32>;
@group(2) @binding(auto) var pbr_brdfLUTSampler: sampler;
#endif
`,i=`\
#ifdef USE_IBL
uniform samplerCube pbr_diffuseEnvSampler;
uniform samplerCube pbr_specularEnvSampler;
uniform sampler2D pbr_brdfLUT;
#endif
`;var a=r(70833);let o=`\
out vec3 pbr_vPosition;
out vec2 pbr_vUV0;
out vec2 pbr_vUV1;

#ifdef HAS_NORMALS
# ifdef HAS_TANGENTS
out mat3 pbr_vTBN;
# else
out vec3 pbr_vNormal;
# endif
#endif

void pbr_setPositionNormalTangentUV(
  vec4 position,
  vec4 normal,
  vec4 tangent,
  vec2 uv0,
  vec2 uv1
)
{
  vec4 pos = pbrProjection.modelMatrix * position;
  pbr_vPosition = vec3(pos.xyz) / pos.w;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
  vec3 normalW = normalize(vec3(pbrProjection.normalMatrix * vec4(normal.xyz, 0.0)));
  vec3 tangentW = normalize(vec3(pbrProjection.modelMatrix * vec4(tangent.xyz, 0.0)));
  vec3 bitangentW = cross(normalW, tangentW) * tangent.w;
  pbr_vTBN = mat3(tangentW, bitangentW, normalW);
#else // HAS_TANGENTS != 1
  pbr_vNormal = normalize(vec3(pbrProjection.modelMatrix * vec4(normal.xyz, 0.0)));
#endif
#endif

#ifdef HAS_UV
  pbr_vUV0 = uv0;
#else
  pbr_vUV0 = vec2(0.,0.);
#endif

  pbr_vUV1 = uv1;
}
`,s=`\
precision highp float;

layout(std140) uniform pbrMaterialUniforms {
  // Material is unlit
  bool unlit;

  // Base color map
  bool baseColorMapEnabled;
  vec4 baseColorFactor;

  bool normalMapEnabled;  
  float normalScale; // #ifdef HAS_NORMALMAP

  bool emissiveMapEnabled;
  vec3 emissiveFactor; // #ifdef HAS_EMISSIVEMAP

  vec2 metallicRoughnessValues;
  bool metallicRoughnessMapEnabled;

  bool occlusionMapEnabled;
  float occlusionStrength; // #ifdef HAS_OCCLUSIONMAP
  
  bool alphaCutoffEnabled;
  float alphaCutoff; // #ifdef ALPHA_CUTOFF

  vec3 specularColorFactor;
  float specularIntensityFactor;
  bool specularColorMapEnabled;
  bool specularIntensityMapEnabled;

  float ior;

  float transmissionFactor;
  bool transmissionMapEnabled;

  float thicknessFactor;
  float attenuationDistance;
  vec3 attenuationColor;

  float clearcoatFactor;
  float clearcoatRoughnessFactor;
  bool clearcoatMapEnabled;
  bool clearcoatRoughnessMapEnabled;

  vec3 sheenColorFactor;
  float sheenRoughnessFactor;
  bool sheenColorMapEnabled;
  bool sheenRoughnessMapEnabled;

  float iridescenceFactor;
  float iridescenceIor;
  vec2 iridescenceThicknessRange;
  bool iridescenceMapEnabled;

  float anisotropyStrength;
  float anisotropyRotation;
  vec2 anisotropyDirection;
  bool anisotropyMapEnabled;

  float emissiveStrength;
  float dispersion;
  
  // IBL
  bool IBLenabled;
  vec2 scaleIBLAmbient; // #ifdef USE_IBL
  
  // debugging flags used for shader output of intermediate PBR variables
  // #ifdef PBR_DEBUG
  vec4 scaleDiffBaseMR;
  vec4 scaleFGDSpec;
  // #endif

  int baseColorUVSet;
  mat3 baseColorUVTransform;
  int metallicRoughnessUVSet;
  mat3 metallicRoughnessUVTransform;
  int normalUVSet;
  mat3 normalUVTransform;
  int occlusionUVSet;
  mat3 occlusionUVTransform;
  int emissiveUVSet;
  mat3 emissiveUVTransform;
  int specularColorUVSet;
  mat3 specularColorUVTransform;
  int specularIntensityUVSet;
  mat3 specularIntensityUVTransform;
  int transmissionUVSet;
  mat3 transmissionUVTransform;
  int thicknessUVSet;
  mat3 thicknessUVTransform;
  int clearcoatUVSet;
  mat3 clearcoatUVTransform;
  int clearcoatRoughnessUVSet;
  mat3 clearcoatRoughnessUVTransform;
  int clearcoatNormalUVSet;
  mat3 clearcoatNormalUVTransform;
  int sheenColorUVSet;
  mat3 sheenColorUVTransform;
  int sheenRoughnessUVSet;
  mat3 sheenRoughnessUVTransform;
  int iridescenceUVSet;
  mat3 iridescenceUVTransform;
  int iridescenceThicknessUVSet;
  mat3 iridescenceThicknessUVTransform;
  int anisotropyUVSet;
  mat3 anisotropyUVTransform;

  float bumpFactor;
  bool bumpMapEnabled;
  float diffuseTransmissionFactor;
  bool diffuseTransmissionMapEnabled;
  vec3 diffuseTransmissionColorFactor;
  bool diffuseTransmissionColorMapEnabled;
  vec3 multiscatterColorFactor;
  bool multiscatterColorMapEnabled;
  float scatterAnisotropy;

  int bumpUVSet;
  mat3 bumpUVTransform;
  int diffuseTransmissionUVSet;
  mat3 diffuseTransmissionUVTransform;
  int diffuseTransmissionColorUVSet;
  mat3 diffuseTransmissionColorUVTransform;
  int multiscatterColorUVSet;
  mat3 multiscatterColorUVTransform;
} pbrMaterial;

// Samplers
#ifdef HAS_BASECOLORMAP
uniform sampler2D pbr_baseColorSampler;
#endif
#ifdef HAS_NORMALMAP
uniform sampler2D pbr_normalSampler;
#endif
#ifdef HAS_EMISSIVEMAP
uniform sampler2D pbr_emissiveSampler;
#endif
#ifdef HAS_METALROUGHNESSMAP
uniform sampler2D pbr_metallicRoughnessSampler;
#endif
#ifdef HAS_OCCLUSIONMAP
uniform sampler2D pbr_occlusionSampler;
#endif
#ifdef HAS_SPECULARCOLORMAP
uniform sampler2D pbr_specularColorSampler;
#endif
#ifdef HAS_SPECULARINTENSITYMAP
uniform sampler2D pbr_specularIntensitySampler;
#endif
#ifdef HAS_TRANSMISSIONMAP
uniform sampler2D pbr_transmissionSampler;
#endif
#ifdef HAS_THICKNESSMAP
uniform sampler2D pbr_thicknessSampler;
#endif
#ifdef HAS_CLEARCOATMAP
uniform sampler2D pbr_clearcoatSampler;
#endif
#ifdef HAS_CLEARCOATROUGHNESSMAP
uniform sampler2D pbr_clearcoatRoughnessSampler;
#endif
#ifdef HAS_CLEARCOATNORMALMAP
uniform sampler2D pbr_clearcoatNormalSampler;
#endif
#ifdef HAS_SHEENCOLORMAP
uniform sampler2D pbr_sheenColorSampler;
#endif
#ifdef HAS_SHEENROUGHNESSMAP
uniform sampler2D pbr_sheenRoughnessSampler;
#endif
#ifdef HAS_IRIDESCENCEMAP
uniform sampler2D pbr_iridescenceSampler;
#endif
#ifdef HAS_IRIDESCENCETHICKNESSMAP
uniform sampler2D pbr_iridescenceThicknessSampler;
#endif
#ifdef HAS_ANISOTROPYMAP
uniform sampler2D pbr_anisotropySampler;
#endif
#ifdef HAS_BUMPMAP
uniform sampler2D pbr_bumpSampler;
#endif
#ifdef HAS_DIFFUSETRANSMISSIONMAP
uniform sampler2D pbr_diffuseTransmissionSampler;
#endif
#ifdef HAS_DIFFUSETRANSMISSIONCOLORMAP
uniform sampler2D pbr_diffuseTransmissionColorSampler;
#endif
#ifdef HAS_MULTISCATTERCOLORMAP
uniform sampler2D pbr_multiscatterColorSampler;
#endif
// Inputs from vertex shader

in vec3 pbr_vPosition;
in vec2 pbr_vUV0;
in vec2 pbr_vUV1;

#ifdef HAS_NORMALS
#ifdef HAS_TANGENTS
in mat3 pbr_vTBN;
#else
in vec3 pbr_vNormal;
#endif
#endif

// Encapsulate the various inputs used by the various functions in the shading equation
// We store values in this struct to simplify the integration of alternative implementations
// of the shading terms, outlined in the Readme.MD Appendix.
struct PBRInfo {
  float NdotL;                  // cos angle between normal and light direction
  float NdotV;                  // cos angle between normal and view direction
  float NdotH;                  // cos angle between normal and half vector
  float LdotH;                  // cos angle between light direction and half vector
  float VdotH;                  // cos angle between view direction and half vector
  float perceptualRoughness;    // roughness value, as authored by the model creator (input to shader)
  float metalness;              // metallic value at the surface
  vec3 reflectance0;            // full reflectance color (normal incidence angle)
  vec3 reflectance90;           // reflectance color at grazing angle
  float alphaRoughness;         // roughness mapped to a more linear change in the roughness (proposed by [2])
  vec3 diffuseColor;            // color contribution from diffuse lighting
  vec3 specularColor;           // color contribution from specular lighting
  vec3 n;                       // normal at surface point
  vec3 v;                       // vector from surface point to camera
  vec3 l;                       // direction from the surface toward the current light
  vec3 h;                       // half vector between the current light and camera
};

const float M_PI = 3.141592653589793;
const float c_MinRoughness = 0.04;

// Widen sub-pixel specular lobes using the screen-space normal footprint.
// This is geometric specular antialiasing: the normal variance is converted
// into an additional squared perceptual roughness before evaluating BRDFs.
float widenSpecularRoughness(float perceptualRoughness, vec3 normal)
{
  vec3 normalDerivativeX = dFdx(normal);
  vec3 normalDerivativeY = dFdy(normal);
  float normalVariance =
    dot(normalDerivativeX, normalDerivativeX) +
    dot(normalDerivativeY, normalDerivativeY);
  float kernelRoughnessSquared = min(2.0 * normalVariance, 1.0);
  return clamp(
    sqrt(perceptualRoughness * perceptualRoughness + kernelRoughnessSquared),
    c_MinRoughness,
    1.0
  );
}

vec3 calculateFinalColor(PBRInfo pbrInfo, vec3 lightColor);

vec4 SRGBtoLINEAR(vec4 srgbIn)
{
#ifdef MANUAL_SRGB
#ifdef SRGB_FAST_APPROXIMATION
  vec3 linOut = pow(srgbIn.xyz,vec3(2.2));
#else // SRGB_FAST_APPROXIMATION
  vec3 bLess = step(vec3(0.04045),srgbIn.xyz);
  vec3 linOut = mix( srgbIn.xyz/vec3(12.92), pow((srgbIn.xyz+vec3(0.055))/vec3(1.055),vec3(2.4)), bLess );
#endif //SRGB_FAST_APPROXIMATION
  return vec4(linOut,srgbIn.w);;
#else //MANUAL_SRGB
  return srgbIn;
#endif //MANUAL_SRGB
}

vec2 getMaterialUV(int uvSet, mat3 uvTransform)
{
  vec2 baseUV = uvSet == 1 ? pbr_vUV1 : pbr_vUV0;
  return (uvTransform * vec3(baseUV, 1.0)).xy;
}

// Build the tangent basis from interpolated attributes or screen-space derivatives.
mat3 getTBN(vec2 uv)
{
#ifndef HAS_TANGENTS
  vec3 pos_dx = dFdx(pbr_vPosition);
  vec3 pos_dy = dFdy(pbr_vPosition);
  vec3 tex_dx = dFdx(vec3(uv, 0.0));
  vec3 tex_dy = dFdy(vec3(uv, 0.0));
  vec3 t = (tex_dy.t * pos_dx - tex_dx.t * pos_dy) / (tex_dx.s * tex_dy.t - tex_dy.s * tex_dx.t);

#ifdef HAS_NORMALS
  vec3 ng = normalize(pbr_vNormal);
#else
  vec3 ng = cross(pos_dx, pos_dy);
#endif

  t = normalize(t - ng * dot(ng, t));
  vec3 b = normalize(cross(ng, t));
  mat3 tbn = mat3(t, b, ng);
#else // HAS_TANGENTS
  mat3 tbn = pbr_vTBN;
#endif

  return tbn;
}

// Find the normal for this fragment, pulling either from a predefined normal map
// or from the interpolated mesh normal and tangent attributes.
vec3 getMappedNormal(sampler2D normalSampler, mat3 tbn, float normalScale, vec2 uv)
{
  vec3 n = texture(normalSampler, uv).rgb;
  return normalize(tbn * ((2.0 * n - 1.0) * vec3(normalScale, normalScale, 1.0)));
}

vec3 getNormal(mat3 tbn, vec2 uv)
{
#ifdef HAS_NORMALMAP
  vec3 n = getMappedNormal(pbr_normalSampler, tbn, pbrMaterial.normalScale, uv);
#else
  // The tbn matrix is linearly interpolated, so we need to re-normalize
  vec3 n = normalize(tbn[2].xyz);
#endif

#ifdef HAS_BUMPMAP
  vec2 bumpUV = getMaterialUV(pbrMaterial.bumpUVSet, pbrMaterial.bumpUVTransform);
  vec2 bumpTexelSize = 1.0 / vec2(textureSize(pbr_bumpSampler, 0));
  float bumpHeight = texture(pbr_bumpSampler, bumpUV).r;
  vec2 bumpGradient = vec2(
    texture(pbr_bumpSampler, bumpUV + vec2(bumpTexelSize.x, 0.0)).r - bumpHeight,
    texture(pbr_bumpSampler, bumpUV + vec2(0.0, bumpTexelSize.y)).r - bumpHeight
  );
  n = normalize(n - pbrMaterial.bumpFactor *
    (tbn[0] * bumpGradient.x + tbn[1] * bumpGradient.y));
#endif

  return n;
}

vec3 getClearcoatNormal(mat3 tbn, vec3 baseNormal, vec2 uv)
{
#ifdef HAS_CLEARCOATNORMALMAP
  return getMappedNormal(pbr_clearcoatNormalSampler, tbn, 1.0, uv);
#else
  return baseNormal;
#endif
}

// Calculation of the lighting contribution from an optional Image Based Light source.
// Precomputed Environment Maps are required uniform inputs and are computed as outlined in [1].
// See our README.md on Environment Maps [3] for additional discussion.
#ifdef USE_IBL
vec3 getIBLContribution(PBRInfo pbrInfo, vec3 n, vec3 reflection)
{
#ifdef USE_SCENE_ENVIRONMENT
  float maximumMipLevel = max(pbrScene.environmentMipCount - 1.0, 0.0);
  float rotationSine = sin(pbrScene.environmentRotation);
  float rotationCosine = cos(pbrScene.environmentRotation);
  mat2 environmentRotation = mat2(rotationCosine, rotationSine, -rotationSine, rotationCosine);
  vec3 environmentNormal = vec3(environmentRotation * n.xz, n.y).xzy;
  vec3 environmentReflection = vec3(environmentRotation * reflection.xz, reflection.y).xzy;
#else
  float maximumMipLevel = 9.0;
  vec3 environmentNormal = n;
  vec3 environmentReflection = reflection;
#endif
  float lod = pbrInfo.perceptualRoughness * maximumMipLevel;
  // retrieve a scale and bias to F0. See [1], Figure 3
  vec4 brdfSample = texture(pbr_brdfLUT,
    vec2(pbrInfo.NdotV, 1.0 - pbrInfo.perceptualRoughness));
  vec4 diffuseSample = texture(pbr_diffuseEnvSampler, environmentNormal);

#ifdef USE_TEX_LOD
  vec4 specularSample = textureLod(pbr_specularEnvSampler, environmentReflection, lod);
#else
  vec4 specularSample = texture(pbr_specularEnvSampler, environmentReflection);
#endif

#ifdef USE_SCENE_ENVIRONMENT
  vec3 brdf = brdfSample.rgb;
  vec3 diffuseLight = diffuseSample.rgb;
  vec3 specularLight = specularSample.rgb;
#else
  vec3 brdf = SRGBtoLINEAR(brdfSample).rgb;
  vec3 diffuseLight = SRGBtoLINEAR(diffuseSample).rgb;
  vec3 specularLight = SRGBtoLINEAR(specularSample).rgb;
#endif

  vec3 diffuse = diffuseLight * pbrInfo.diffuseColor;
  vec3 specular = specularLight * (pbrInfo.specularColor * brdf.x + brdf.y);

  // For presentation, this allows us to disable IBL terms
  diffuse *= pbrMaterial.scaleIBLAmbient.x;
  specular *= pbrMaterial.scaleIBLAmbient.y;

#ifdef USE_SCENE_ENVIRONMENT
  return (diffuse + specular) * max(pbrScene.environmentIntensity, 0.0);
#else
  return diffuse + specular;
#endif
}
#endif

// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
vec3 diffuse(PBRInfo pbrInfo)
{
  return pbrInfo.diffuseColor / M_PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
vec3 specularReflection(PBRInfo pbrInfo)
{
  return pbrInfo.reflectance0 +
    (pbrInfo.reflectance90 - pbrInfo.reflectance0) *
    pow(clamp(1.0 - pbrInfo.VdotH, 0.0, 1.0), 5.0);
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
float geometricOcclusion(PBRInfo pbrInfo)
{
  float NdotL = pbrInfo.NdotL;
  float NdotV = pbrInfo.NdotV;
  float r = pbrInfo.alphaRoughness;

  float attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
  float attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
  return attenuationL * attenuationV;
}

// The following equation(s) model the distribution of microfacet normals across
// the area being drawn (aka D())
// Implementation from "Average Irregularity Representation of a Roughened Surface
// for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
// Follows the distribution function recommended in the SIGGRAPH 2013 course notes
// from EPIC Games [1], Equation 3.
float microfacetDistribution(PBRInfo pbrInfo)
{
  float roughnessSq = pbrInfo.alphaRoughness * pbrInfo.alphaRoughness;
  float f = (pbrInfo.NdotH * roughnessSq - pbrInfo.NdotH) * pbrInfo.NdotH + 1.0;
  return roughnessSq / (M_PI * f * f);
}

float maxComponent(vec3 value)
{
  return max(max(value.r, value.g), value.b);
}

float getDielectricF0(float ior)
{
  float clampedIor = max(ior, 1.0);
  float ratio = (clampedIor - 1.0) / (clampedIor + 1.0);
  return ratio * ratio;
}

vec2 normalizeDirection(vec2 direction)
{
  float directionLength = length(direction);
  return directionLength > 0.0001 ? direction / directionLength : vec2(1.0, 0.0);
}

vec2 rotateDirection(vec2 direction, float rotation)
{
  float s = sin(rotation);
  float c = cos(rotation);
  return vec2(direction.x * c - direction.y * s, direction.x * s + direction.y * c);
}

vec3 encodeLinearSRGB(vec3 linearColor)
{
  vec3 positiveColor = max(linearColor, vec3(0.0));
  return mix(
    positiveColor * 12.92,
    1.055 * pow(positiveColor, vec3(1.0 / 2.4)) - 0.055,
    greaterThan(positiveColor, vec3(0.0031308))
  );
}

vec3 toneMapKhronosPBRNeutral(vec3 color)
{
  const float startCompression = 0.76;
  float darkestChannel = min(color.r, min(color.g, color.b));
  float offset = darkestChannel < 0.08
    ? darkestChannel - 6.25 * darkestChannel * darkestChannel
    : 0.04;
  color -= vec3(offset);

  float peak = maxComponent(color);
  if (peak < startCompression) {
    return color;
  }

  float compressionRange = 1.0 - startCompression;
  float compressedPeak = 1.0 - compressionRange * compressionRange /
    (peak + compressionRange - startCompression);
  color *= compressedPeak / max(peak, 0.0001);
  float desaturation = 1.0 - 1.0 / (0.15 * (peak - compressedPeak) + 1.0);
  return mix(color, vec3(compressedPeak), desaturation);
}

vec3 applySceneColorManagement(vec3 sceneColor)
{
#ifdef USE_SCENE_COLOR_MANAGEMENT
  vec3 color = max(sceneColor, vec3(0.0)) * max(pbrScene.exposure, 0.0);
  if (pbrScene.toneMapMode == 1) {
    color /= vec3(1.0) + color;
  } else if (pbrScene.toneMapMode == 2) {
    color = toneMapKhronosPBRNeutral(color);
  } else if (pbrScene.toneMapMode == 3) {
    color = clamp(
      (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14),
      vec3(0.0),
      vec3(1.0)
    );
  }
  return pbrScene.outputEncoding == 0 ? color : encodeLinearSRGB(color);
#else
  return pow(max(sceneColor, vec3(0.0)), vec3(1.0 / 2.2));
#endif
}

float dielectricSchlick(float reflectance, float cosine)
{
  return reflectance + (1.0 - reflectance) * pow(clamp(1.0 - cosine, 0.0, 1.0), 5.0);
}

vec3 evaluateIridescenceSensitivity(float opticalPathDifference, vec3 phaseShift)
{
  float phase = 2.0 * M_PI * opticalPathDifference * 1.0e-9;
  vec3 sensitivity = vec3(5.4856e-13, 4.4201e-13, 5.2481e-13);
  vec3 position = vec3(1.6810e6, 1.7953e6, 2.2084e6);
  vec3 variance = vec3(4.3278e9, 9.3046e9, 6.6121e9);
  vec3 xyz = sensitivity * sqrt(2.0 * M_PI * variance) *
    cos(position * phase + phaseShift) * exp(-phase * phase * variance);
  xyz.x += 9.7470e-14 * sqrt(2.0 * M_PI * 4.5282e9) *
    cos(2.2399e6 * phase + phaseShift.x) * exp(-4.5282e9 * phase * phase);
  xyz /= 1.0685e-7;
  return mat3(
    3.2404542, -0.9692660, 0.0556434,
    -1.5371385, 1.8760108, -0.2040259,
    -0.4985314, 0.0415560, 1.0572252
  ) * xyz;
}

vec3 getIridescenceTint(float iridescence, float thickness, float NdotV, vec3 baseReflectance)
{
  if (iridescence <= 0.0 || thickness <= 0.0) {
    return baseReflectance;
  }

  float filmIor = max(pbrMaterial.iridescenceIor, 1.0);
  float sineSquared = (1.0 - NdotV * NdotV) / (filmIor * filmIor);
  float cosineSquared = 1.0 - sineSquared;
  if (cosineSquared <= 0.0) {
    return mix(baseReflectance, vec3(1.0), iridescence);
  }
  float filmCosine = sqrt(cosineSquared);
  float firstInterfaceReflectance = dielectricSchlick(getDielectricF0(filmIor), NdotV);
  float transmittedEnergy = 1.0 - firstInterfaceReflectance;

  vec3 baseIor = (vec3(1.0) + sqrt(clamp(baseReflectance, vec3(0.0), vec3(0.9999)))) /
    (vec3(1.0) - sqrt(clamp(baseReflectance, vec3(0.0), vec3(0.9999))));
  vec3 secondInterfaceF0 = (baseIor - vec3(filmIor)) / (baseIor + vec3(filmIor));
  secondInterfaceF0 *= secondInterfaceF0;
  vec3 secondInterfaceReflectance = secondInterfaceF0 +
    (vec3(1.0) - secondInterfaceF0) * pow(1.0 - filmCosine, 5.0);
  vec3 phaseShift = vec3(M_PI);
  phaseShift += mix(vec3(0.0), vec3(M_PI), lessThan(baseIor, vec3(filmIor)));
  float opticalPathDifference = 2.0 * filmIor * thickness * filmCosine;
  vec3 combinedReflectance = clamp(
    firstInterfaceReflectance * secondInterfaceReflectance,
    vec3(0.00001),
    vec3(0.9999)
  );
  vec3 recurringAmplitude = sqrt(combinedReflectance);
  vec3 interfaceResponse = transmittedEnergy * transmittedEnergy * secondInterfaceReflectance /
    (vec3(1.0) - combinedReflectance);
  vec3 reflectedSpectrum = vec3(firstInterfaceReflectance) + interfaceResponse;
  vec3 harmonicAmplitude = interfaceResponse - vec3(transmittedEnergy);
  for (int harmonic = 1; harmonic <= 2; harmonic++) {
    harmonicAmplitude *= recurringAmplitude;
    reflectedSpectrum += harmonicAmplitude * 2.0 * evaluateIridescenceSensitivity(
      float(harmonic) * opticalPathDifference,
      float(harmonic) * phaseShift
    );
  }
  return mix(baseReflectance, clamp(reflectedSpectrum, vec3(0.0), vec3(1.0)), iridescence);
}

vec3 getVolumeAttenuation(float thickness)
{
  if (thickness <= 0.0) {
    return vec3(1.0);
  }

  vec3 attenuationCoefficient =
    -log(max(pbrMaterial.attenuationColor, vec3(0.0001))) /
    max(pbrMaterial.attenuationDistance, 0.0001);
  return exp(-attenuationCoefficient * thickness);
}

// KHR_materials_volume_scatter is an active draft. This evaluates a local,
// thickness-aware single-scattering approximation rather than random walk.
vec3 getDiffuseTransmissionAttenuation(
  PBRInfo pbrInfo,
  vec3 multiscatterColor,
  float thickness
)
{
  vec3 volumeAttenuation = getVolumeAttenuation(thickness);
  float scatteringStrength = maxComponent(multiscatterColor);
  if (thickness <= 0.0 || scatteringStrength <= 0.0001) {
    return volumeAttenuation;
  }

  float anisotropy = clamp(pbrMaterial.scatterAnisotropy, -0.95, 0.95);
  float scatteringCosine = clamp(dot(-pbrInfo.v, pbrInfo.l), -1.0, 1.0);
  float phaseDenominator = max(
    1.0 + anisotropy * anisotropy - 2.0 * anisotropy * scatteringCosine,
    0.0001
  );
  float phaseWeight = clamp(
    (1.0 - anisotropy * anisotropy) / pow(phaseDenominator, 1.5),
    0.0,
    4.0
  );
  float scatteringDepth = thickness / max(pbrMaterial.attenuationDistance, 0.0001);
  float scatteringProbability = 1.0 - exp(-scatteringDepth);
  vec3 scatteringColor = clamp(multiscatterColor, vec3(0.0), vec3(1.0));
  return mix(
    volumeAttenuation,
    volumeAttenuation * mix(vec3(1.0), scatteringColor * phaseWeight, scatteringColor),
    scatteringProbability
  );
}

vec3 calculateDiffuseTransmissionLight(
  PBRInfo pbrInfo,
  vec3 lightColor,
  vec3 diffuseTransmissionColor,
  float diffuseTransmission,
  vec3 multiscatterColor,
  float thickness
)
{
  float oppositeHemisphere = max(dot(-pbrInfo.n, pbrInfo.l), 0.0);
  if (oppositeHemisphere <= 0.0 || diffuseTransmission <= 0.0) {
    return vec3(0.0);
  }

  vec3 nonReflectedEnergy = vec3(1.0) - clamp(pbrInfo.reflectance0, vec3(0.0), vec3(1.0));
  vec3 attenuatedColor = getDiffuseTransmissionAttenuation(
    pbrInfo,
    multiscatterColor,
    thickness
  );
  return lightColor * diffuseTransmissionColor * nonReflectedEnergy *
    attenuatedColor * (diffuseTransmission * oppositeHemisphere / M_PI);
}

#ifdef USE_IBL
vec3 calculateDiffuseTransmissionIBL(
  PBRInfo pbrInfo,
  vec3 diffuseTransmissionColor,
  float diffuseTransmission,
  vec3 multiscatterColor,
  float thickness
)
{
  if (diffuseTransmission <= 0.0) {
    return vec3(0.0);
  }

#ifdef USE_SCENE_ENVIRONMENT
  float rotationSine = sin(pbrScene.environmentRotation);
  float rotationCosine = cos(pbrScene.environmentRotation);
  mat2 environmentRotation = mat2(rotationCosine, rotationSine, -rotationSine, rotationCosine);
  vec3 oppositeNormal = vec3(environmentRotation * -pbrInfo.n.xz, -pbrInfo.n.y).xzy;
  vec3 environmentColor = texture(pbr_diffuseEnvSampler, oppositeNormal).rgb *
    max(pbrScene.environmentIntensity, 0.0);
#else
  vec3 environmentColor = SRGBtoLINEAR(texture(pbr_diffuseEnvSampler, -pbrInfo.n)).rgb;
#endif
  vec3 nonReflectedEnergy = vec3(1.0) - clamp(pbrInfo.reflectance0, vec3(0.0), vec3(1.0));
  return environmentColor * diffuseTransmissionColor * nonReflectedEnergy *
    getDiffuseTransmissionAttenuation(pbrInfo, multiscatterColor, thickness) *
    diffuseTransmission * pbrMaterial.scaleIBLAmbient.x;
}
#endif

#ifdef USE_TRANSMISSION_FRAMEBUFFER
vec3 sampleTransmittedSceneColor(
  vec3 position,
  vec3 normal,
  vec3 viewDirection,
  float thickness,
  float perceptualRoughness,
  float indexOfRefraction
)
{
  vec3 refractionDirection = refract(
    -viewDirection,
    normal,
    1.0 / max(indexOfRefraction, 1.0)
  );
  vec3 refractedPosition = position + refractionDirection * thickness;
  vec4 clipPosition = pbrScene.projectionMatrix *
    pbrScene.viewMatrix * vec4(refractedPosition, 1.0);
  vec2 textureCoordinate = clipPosition.xy / max(clipPosition.w, 0.0001) * 0.5 + 0.5;
  textureCoordinate = clamp(textureCoordinate, vec2(0.001), vec2(0.999));

  vec2 blurRadius = perceptualRoughness * perceptualRoughness * 8.0 /
    max(pbrScene.framebufferSize, vec2(1.0));
  vec3 sceneColor = texture(pbr_transmissionFramebufferSampler, textureCoordinate).rgb * 0.4;
  sceneColor += texture(
    pbr_transmissionFramebufferSampler,
    textureCoordinate + vec2(blurRadius.x, 0.0)
  ).rgb * 0.15;
  sceneColor += texture(
    pbr_transmissionFramebufferSampler,
    textureCoordinate - vec2(blurRadius.x, 0.0)
  ).rgb * 0.15;
  sceneColor += texture(
    pbr_transmissionFramebufferSampler,
    textureCoordinate + vec2(0.0, blurRadius.y)
  ).rgb * 0.15;
  sceneColor += texture(
    pbr_transmissionFramebufferSampler,
    textureCoordinate - vec2(0.0, blurRadius.y)
  ).rgb * 0.15;
  return max(sceneColor, vec3(0.0));
}

vec3 getTransmittedSceneColor(
  vec3 position,
  vec3 normal,
  vec3 viewDirection,
  float thickness,
  float perceptualRoughness
)
{
  if (pbrMaterial.dispersion <= 0.0) {
    return sampleTransmittedSceneColor(
      position,
      normal,
      viewDirection,
      thickness,
      perceptualRoughness,
      pbrMaterial.ior
    );
  }

  float halfSpread = (max(pbrMaterial.ior, 1.0) - 1.0) * 0.025 * pbrMaterial.dispersion;
  vec3 indicesOfRefraction = max(
    vec3(pbrMaterial.ior - halfSpread, pbrMaterial.ior, pbrMaterial.ior + halfSpread),
    vec3(1.0)
  );
  return vec3(
    sampleTransmittedSceneColor(
      position, normal, viewDirection, thickness, perceptualRoughness, indicesOfRefraction.r
    ).r,
    sampleTransmittedSceneColor(
      position, normal, viewDirection, thickness, perceptualRoughness, indicesOfRefraction.g
    ).g,
    sampleTransmittedSceneColor(
      position, normal, viewDirection, thickness, perceptualRoughness, indicesOfRefraction.b
    ).b
  );
}
#endif

PBRInfo createClearcoatPBRInfo(PBRInfo basePBRInfo, vec3 clearcoatNormal, float clearcoatRoughness)
{
  float perceptualRoughness = clamp(clearcoatRoughness, c_MinRoughness, 1.0);
  float alphaRoughness = perceptualRoughness * perceptualRoughness;
  float NdotV = clamp(abs(dot(clearcoatNormal, basePBRInfo.v)), 0.001, 1.0);

  return PBRInfo(
    basePBRInfo.NdotL,
    NdotV,
    basePBRInfo.NdotH,
    basePBRInfo.LdotH,
    basePBRInfo.VdotH,
    perceptualRoughness,
    0.0,
    vec3(0.04),
    vec3(1.0),
    alphaRoughness,
    vec3(0.0),
    vec3(0.04),
    clearcoatNormal,
    basePBRInfo.v,
    basePBRInfo.l,
    basePBRInfo.h
  );
}

vec3 calculateClearcoatContribution(
  PBRInfo pbrInfo,
  vec3 lightColor,
  vec3 clearcoatNormal,
  float clearcoatFactor,
  float clearcoatRoughness
) {
  if (clearcoatFactor <= 0.0) {
    return vec3(0.0);
  }

  PBRInfo clearcoatPBRInfo = createClearcoatPBRInfo(pbrInfo, clearcoatNormal, clearcoatRoughness);
  return calculateFinalColor(clearcoatPBRInfo, lightColor) * clearcoatFactor;
}

#ifdef USE_IBL
vec3 calculateClearcoatIBLContribution(
  PBRInfo pbrInfo,
  vec3 clearcoatNormal,
  vec3 reflection,
  float clearcoatFactor,
  float clearcoatRoughness
) {
  if (clearcoatFactor <= 0.0) {
    return vec3(0.0);
  }

  PBRInfo clearcoatPBRInfo = createClearcoatPBRInfo(pbrInfo, clearcoatNormal, clearcoatRoughness);
  return getIBLContribution(clearcoatPBRInfo, clearcoatNormal, reflection) * clearcoatFactor;
}
#endif

vec3 calculateSheenContribution(
  PBRInfo pbrInfo,
  vec3 lightColor,
  vec3 sheenColor,
  float sheenRoughness
) {
  if (maxComponent(sheenColor) <= 0.0) {
    return vec3(0.0);
  }

  float alpha = max(sheenRoughness * sheenRoughness, 0.0001);
  float inverseAlpha = 1.0 / alpha;
  float sineSquared = max(1.0 - pbrInfo.NdotH * pbrInfo.NdotH, 0.0);
  float distribution = (2.0 + inverseAlpha) * pow(sineSquared, inverseAlpha * 0.5) /
    (2.0 * M_PI);
  float visibility = 1.0 / max(
    4.0 * (pbrInfo.NdotL + pbrInfo.NdotV - pbrInfo.NdotL * pbrInfo.NdotV),
    0.0001
  );
  return pbrInfo.NdotL * lightColor * sheenColor * distribution * visibility *
    (1.0 - pbrInfo.metalness);
}

vec3 calculateAnisotropicLightColor(
  PBRInfo pbrInfo,
  vec3 lightColor,
  vec3 anisotropyTangent,
  float anisotropyStrength
) {
  if (anisotropyStrength <= 0.0) {
    return calculateFinalColor(pbrInfo, lightColor);
  }

  vec3 anisotropyBitangent = normalize(cross(pbrInfo.n, anisotropyTangent));
  float tangentRoughness = mix(
    pbrInfo.alphaRoughness,
    1.0,
    anisotropyStrength * anisotropyStrength
  );
  float bitangentRoughness = clamp(pbrInfo.alphaRoughness, 0.001, 1.0);
  float roughnessProduct = tangentRoughness * bitangentRoughness;
  vec3 distributionVector = vec3(
    bitangentRoughness * dot(anisotropyTangent, pbrInfo.h),
    tangentRoughness * dot(anisotropyBitangent, pbrInfo.h),
    roughnessProduct * pbrInfo.NdotH
  );
  float distributionFactor = roughnessProduct /
    max(dot(distributionVector, distributionVector), 0.000001);
  float distribution = roughnessProduct * distributionFactor * distributionFactor / M_PI;
  float viewMask = pbrInfo.NdotL * length(vec3(
    tangentRoughness * dot(anisotropyTangent, pbrInfo.v),
    bitangentRoughness * dot(anisotropyBitangent, pbrInfo.v),
    pbrInfo.NdotV
  ));
  float lightMask = pbrInfo.NdotV * length(vec3(
    tangentRoughness * dot(anisotropyTangent, pbrInfo.l),
    bitangentRoughness * dot(anisotropyBitangent, pbrInfo.l),
    pbrInfo.NdotL
  ));
  float visibility = clamp(0.5 / max(viewMask + lightMask, 0.000001), 0.0, 1.0);
  vec3 fresnel = specularReflection(pbrInfo);
  vec3 diffuseContribution = (vec3(1.0) - fresnel) * diffuse(pbrInfo);
  return pbrInfo.NdotL * lightColor *
    (diffuseContribution + fresnel * distribution * visibility);
}

vec3 getAnisotropicReflection(PBRInfo pbrInfo, vec3 anisotropyTangent, float anisotropyStrength)
{
  if (anisotropyStrength <= 0.0) {
    return -normalize(reflect(pbrInfo.v, pbrInfo.n));
  }
  vec3 anisotropyBitangent = normalize(cross(pbrInfo.n, anisotropyTangent));
  vec3 anisotropicNormal = normalize(cross(anisotropyBitangent, pbrInfo.v));
  anisotropicNormal = normalize(cross(anisotropicNormal, anisotropyBitangent));
  float bend = anisotropyStrength * (1.0 - pbrInfo.perceptualRoughness);
  return -normalize(reflect(pbrInfo.v, normalize(mix(pbrInfo.n, anisotropicNormal, bend))));
}

vec3 calculateMaterialLightColor(
  PBRInfo pbrInfo,
  vec3 lightColor,
  vec3 clearcoatNormal,
  float clearcoatFactor,
  float clearcoatRoughness,
  vec3 sheenColor,
  float sheenRoughness,
  vec3 anisotropyTangent,
  float anisotropyStrength
) {
  vec3 color = calculateAnisotropicLightColor(
    pbrInfo,
    lightColor,
    anisotropyTangent,
    anisotropyStrength
  );
  color += calculateClearcoatContribution(
    pbrInfo,
    lightColor,
    clearcoatNormal,
    clearcoatFactor,
    clearcoatRoughness
  );
  color += calculateSheenContribution(pbrInfo, lightColor, sheenColor, sheenRoughness);
  return color;
}

void PBRInfo_setAmbientLight(inout PBRInfo pbrInfo) {
  pbrInfo.NdotL = 1.0;
  pbrInfo.NdotH = 0.0;
  pbrInfo.LdotH = 0.0;
  pbrInfo.VdotH = 1.0;
  pbrInfo.l = pbrInfo.n;
  pbrInfo.h = pbrInfo.n;
}

void PBRInfo_setDirectionalLight(inout PBRInfo pbrInfo, vec3 lightDirection) {
  vec3 n = pbrInfo.n;
  vec3 v = pbrInfo.v;
  vec3 l = normalize(lightDirection);             // Vector from surface point to light
  vec3 h = normalize(l+v);                        // Half vector between both l and v

  pbrInfo.NdotL = clamp(dot(n, l), 0.001, 1.0);
  pbrInfo.NdotH = clamp(dot(n, h), 0.0, 1.0);
  pbrInfo.LdotH = clamp(dot(l, h), 0.0, 1.0);
  pbrInfo.VdotH = clamp(dot(v, h), 0.0, 1.0);
  pbrInfo.l = l;
  pbrInfo.h = h;
}

void PBRInfo_setPointLight(inout PBRInfo pbrInfo, PointLight pointLight) {
  vec3 light_direction = normalize(pointLight.position - pbr_vPosition);
  PBRInfo_setDirectionalLight(pbrInfo, light_direction);
}

void PBRInfo_setSpotLight(inout PBRInfo pbrInfo, SpotLight spotLight) {
  vec3 light_direction = normalize(spotLight.position - pbr_vPosition);
  PBRInfo_setDirectionalLight(pbrInfo, light_direction);
}

vec3 calculateFinalColor(PBRInfo pbrInfo, vec3 lightColor) {
  // Calculate the shading terms for the microfacet specular shading model
  vec3 F = specularReflection(pbrInfo);
  float G = geometricOcclusion(pbrInfo);
  float D = microfacetDistribution(pbrInfo);

  // Calculation of analytical lighting contribution
  vec3 diffuseContrib = (1.0 - F) * diffuse(pbrInfo);
  vec3 specContrib = F * G * D / (4.0 * pbrInfo.NdotL * pbrInfo.NdotV);
  // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
  return pbrInfo.NdotL * lightColor * (diffuseContrib + specContrib);
}

vec4 pbr_filterColor(vec4 vertexColor)
{
  vec2 baseColorUV = getMaterialUV(pbrMaterial.baseColorUVSet, pbrMaterial.baseColorUVTransform);
  vec2 metallicRoughnessUV = getMaterialUV(
    pbrMaterial.metallicRoughnessUVSet,
    pbrMaterial.metallicRoughnessUVTransform
  );
  vec2 normalUV = getMaterialUV(pbrMaterial.normalUVSet, pbrMaterial.normalUVTransform);
  vec2 occlusionUV = getMaterialUV(pbrMaterial.occlusionUVSet, pbrMaterial.occlusionUVTransform);
  vec2 emissiveUV = getMaterialUV(pbrMaterial.emissiveUVSet, pbrMaterial.emissiveUVTransform);
  vec2 specularColorUV = getMaterialUV(
    pbrMaterial.specularColorUVSet,
    pbrMaterial.specularColorUVTransform
  );
  vec2 specularIntensityUV = getMaterialUV(
    pbrMaterial.specularIntensityUVSet,
    pbrMaterial.specularIntensityUVTransform
  );
  vec2 transmissionUV = getMaterialUV(
    pbrMaterial.transmissionUVSet,
    pbrMaterial.transmissionUVTransform
  );
  vec2 thicknessUV = getMaterialUV(pbrMaterial.thicknessUVSet, pbrMaterial.thicknessUVTransform);
  vec2 clearcoatUV = getMaterialUV(pbrMaterial.clearcoatUVSet, pbrMaterial.clearcoatUVTransform);
  vec2 clearcoatRoughnessUV = getMaterialUV(
    pbrMaterial.clearcoatRoughnessUVSet,
    pbrMaterial.clearcoatRoughnessUVTransform
  );
  vec2 clearcoatNormalUV = getMaterialUV(
    pbrMaterial.clearcoatNormalUVSet,
    pbrMaterial.clearcoatNormalUVTransform
  );
  vec2 sheenColorUV = getMaterialUV(
    pbrMaterial.sheenColorUVSet,
    pbrMaterial.sheenColorUVTransform
  );
  vec2 sheenRoughnessUV = getMaterialUV(
    pbrMaterial.sheenRoughnessUVSet,
    pbrMaterial.sheenRoughnessUVTransform
  );
  vec2 iridescenceUV = getMaterialUV(
    pbrMaterial.iridescenceUVSet,
    pbrMaterial.iridescenceUVTransform
  );
  vec2 iridescenceThicknessUV = getMaterialUV(
    pbrMaterial.iridescenceThicknessUVSet,
    pbrMaterial.iridescenceThicknessUVTransform
  );
  vec2 anisotropyUV = getMaterialUV(
    pbrMaterial.anisotropyUVSet,
    pbrMaterial.anisotropyUVTransform
  );
  vec2 diffuseTransmissionUV = getMaterialUV(
    pbrMaterial.diffuseTransmissionUVSet,
    pbrMaterial.diffuseTransmissionUVTransform
  );
  vec2 diffuseTransmissionColorUV = getMaterialUV(
    pbrMaterial.diffuseTransmissionColorUVSet,
    pbrMaterial.diffuseTransmissionColorUVTransform
  );
  vec2 multiscatterColorUV = getMaterialUV(
    pbrMaterial.multiscatterColorUVSet,
    pbrMaterial.multiscatterColorUVTransform
  );

  // The albedo may be defined from a base texture or a flat color
#ifdef HAS_BASECOLORMAP
  vec4 baseColor =
    SRGBtoLINEAR(texture(pbr_baseColorSampler, baseColorUV)) *
    pbrMaterial.baseColorFactor * vertexColor;
#else
  vec4 baseColor = pbrMaterial.baseColorFactor * vertexColor;
#endif

#ifdef ALPHA_CUTOFF
  if (baseColor.a < pbrMaterial.alphaCutoff) {
    discard;
  }
#endif

  vec3 color = vec3(0, 0, 0);

  float transmission = 0.0;

  if(pbrMaterial.unlit){
    color.rgb = baseColor.rgb;
  }
  else{
    // Metallic and Roughness material properties are packed together
    // In glTF, these factors can be specified by fixed scalar values
    // or from a metallic-roughness map
    float perceptualRoughness = pbrMaterial.metallicRoughnessValues.y;
    float metallic = pbrMaterial.metallicRoughnessValues.x;
#ifdef HAS_METALROUGHNESSMAP
    // Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.
    // This layout intentionally reserves the 'r' channel for (optional) occlusion map data
    vec4 mrSample = texture(pbr_metallicRoughnessSampler, metallicRoughnessUV);
    perceptualRoughness = mrSample.g * perceptualRoughness;
    metallic = mrSample.b * metallic;
#endif
    perceptualRoughness = clamp(perceptualRoughness, c_MinRoughness, 1.0);
    metallic = clamp(metallic, 0.0, 1.0);
    mat3 tbn = getTBN(normalUV);
    vec3 n = getNormal(tbn, normalUV);                          // normal at surface point
    perceptualRoughness = widenSpecularRoughness(perceptualRoughness, n);
    vec3 v = normalize(pbrProjection.camera - pbr_vPosition);  // Vector from surface point to camera
    float NdotV = clamp(abs(dot(n, v)), 0.001, 1.0);
#ifdef USE_MATERIAL_EXTENSIONS
    bool useExtendedPBR =
      pbrMaterial.specularColorMapEnabled ||
      pbrMaterial.specularIntensityMapEnabled ||
      abs(pbrMaterial.specularIntensityFactor - 1.0) > 0.0001 ||
      maxComponent(abs(pbrMaterial.specularColorFactor - vec3(1.0))) > 0.0001 ||
      abs(pbrMaterial.ior - 1.5) > 0.0001 ||
      pbrMaterial.dispersion > 0.0001 ||
      pbrMaterial.transmissionMapEnabled ||
      pbrMaterial.transmissionFactor > 0.0001 ||
      pbrMaterial.diffuseTransmissionMapEnabled ||
      pbrMaterial.diffuseTransmissionColorMapEnabled ||
      pbrMaterial.diffuseTransmissionFactor > 0.0001 ||
      pbrMaterial.multiscatterColorMapEnabled ||
      maxComponent(pbrMaterial.multiscatterColorFactor) > 0.0001 ||
      pbrMaterial.clearcoatMapEnabled ||
      pbrMaterial.clearcoatRoughnessMapEnabled ||
      pbrMaterial.clearcoatFactor > 0.0001 ||
      pbrMaterial.clearcoatRoughnessFactor > 0.0001 ||
      pbrMaterial.sheenColorMapEnabled ||
      pbrMaterial.sheenRoughnessMapEnabled ||
      maxComponent(pbrMaterial.sheenColorFactor) > 0.0001 ||
      pbrMaterial.sheenRoughnessFactor > 0.0001 ||
      pbrMaterial.iridescenceMapEnabled ||
      pbrMaterial.iridescenceFactor > 0.0001 ||
      abs(pbrMaterial.iridescenceIor - 1.3) > 0.0001 ||
      abs(pbrMaterial.iridescenceThicknessRange.x - 100.0) > 0.0001 ||
      abs(pbrMaterial.iridescenceThicknessRange.y - 400.0) > 0.0001 ||
      pbrMaterial.anisotropyMapEnabled ||
      pbrMaterial.anisotropyStrength > 0.0001 ||
      abs(pbrMaterial.anisotropyRotation) > 0.0001 ||
      length(pbrMaterial.anisotropyDirection - vec2(1.0, 0.0)) > 0.0001;
#else
    bool useExtendedPBR = false;
#endif

    if (!useExtendedPBR) {
      // Keep the baseline metallic-roughness implementation byte-for-byte equivalent in behavior.
      float alphaRoughness = perceptualRoughness * perceptualRoughness;

      vec3 f0 = vec3(0.04);
      vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - f0);
      diffuseColor *= 1.0 - metallic;
      vec3 specularColor = mix(f0, baseColor.rgb, metallic);

      float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);
      float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
      vec3 specularEnvironmentR0 = specularColor.rgb;
      vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;
      vec3 reflection = -normalize(reflect(v, n));

      PBRInfo pbrInfo = PBRInfo(
        0.0, // NdotL
        NdotV,
        0.0, // NdotH
        0.0, // LdotH
        0.0, // VdotH
        perceptualRoughness,
        metallic,
        specularEnvironmentR0,
        specularEnvironmentR90,
        alphaRoughness,
        diffuseColor,
        specularColor,
        n,
        v,
        n,
        n
      );

#ifdef USE_LIGHTS
      PBRInfo_setAmbientLight(pbrInfo);
      color += calculateFinalColor(pbrInfo, lighting.ambientColor);

      for(int i = 0; i < lighting.directionalLightCount; i++) {
        if (i < lighting.directionalLightCount) {
          PBRInfo_setDirectionalLight(pbrInfo, lighting_getDirectionalLight(i).direction);
          color += calculateFinalColor(pbrInfo, lighting_getDirectionalLight(i).color);
        }
      }

      for(int i = 0; i < lighting.pointLightCount; i++) {
        if (i < lighting.pointLightCount) {
          PBRInfo_setPointLight(pbrInfo, lighting_getPointLight(i));
          float attenuation = getPointLightAttenuation(lighting_getPointLight(i), distance(lighting_getPointLight(i).position, pbr_vPosition));
          color += calculateFinalColor(pbrInfo, lighting_getPointLight(i).color / attenuation);
        }
      }

      for(int i = 0; i < lighting.spotLightCount; i++) {
        if (i < lighting.spotLightCount) {
          PBRInfo_setSpotLight(pbrInfo, lighting_getSpotLight(i));
          float attenuation = getSpotLightAttenuation(lighting_getSpotLight(i), pbr_vPosition);
          color += calculateFinalColor(pbrInfo, lighting_getSpotLight(i).color / attenuation);
        }
      }
#endif

#ifdef USE_IBL
      if (pbrMaterial.IBLenabled) {
        color += getIBLContribution(pbrInfo, n, reflection);
      }
#endif

#ifdef HAS_OCCLUSIONMAP
      if (pbrMaterial.occlusionMapEnabled) {
        float ao = texture(pbr_occlusionSampler, occlusionUV).r;
        color = mix(color, color * ao, pbrMaterial.occlusionStrength);
      }
#endif

      vec3 emissive = pbrMaterial.emissiveFactor;
#ifdef HAS_EMISSIVEMAP
      if (pbrMaterial.emissiveMapEnabled) {
        emissive *= SRGBtoLINEAR(texture(pbr_emissiveSampler, emissiveUV)).rgb;
      }
#endif
      color += emissive * pbrMaterial.emissiveStrength;

#ifdef PBR_DEBUG
      color = mix(color, baseColor.rgb, pbrMaterial.scaleDiffBaseMR.y);
      color = mix(color, vec3(metallic), pbrMaterial.scaleDiffBaseMR.z);
      color = mix(color, vec3(perceptualRoughness), pbrMaterial.scaleDiffBaseMR.w);
#endif

      return vec4(applySceneColorManagement(color), baseColor.a);
    }

    float specularIntensity = pbrMaterial.specularIntensityFactor;
#ifdef HAS_SPECULARINTENSITYMAP
    if (pbrMaterial.specularIntensityMapEnabled) {
      specularIntensity *= texture(pbr_specularIntensitySampler, specularIntensityUV).a;
    }
#endif

    vec3 specularFactor = pbrMaterial.specularColorFactor;
#ifdef HAS_SPECULARCOLORMAP
    if (pbrMaterial.specularColorMapEnabled) {
      specularFactor *= SRGBtoLINEAR(texture(pbr_specularColorSampler, specularColorUV)).rgb;
    }
#endif

    transmission = pbrMaterial.transmissionFactor;
#ifdef HAS_TRANSMISSIONMAP
    if (pbrMaterial.transmissionMapEnabled) {
      transmission *= texture(pbr_transmissionSampler, transmissionUV).r;
    }
#endif
    transmission = clamp(transmission * (1.0 - metallic), 0.0, 1.0);
    float thickness = max(pbrMaterial.thicknessFactor, 0.0);
#ifdef HAS_THICKNESSMAP
    thickness *= texture(pbr_thicknessSampler, thicknessUV).g;
#endif

    float diffuseTransmission = clamp(pbrMaterial.diffuseTransmissionFactor, 0.0, 1.0);
#ifdef HAS_DIFFUSETRANSMISSIONMAP
    if (pbrMaterial.diffuseTransmissionMapEnabled) {
      diffuseTransmission *= texture(pbr_diffuseTransmissionSampler, diffuseTransmissionUV).a;
    }
#endif
    diffuseTransmission *= (1.0 - metallic) * (1.0 - transmission);
    vec3 diffuseTransmissionColor = pbrMaterial.diffuseTransmissionColorFactor;
#ifdef HAS_DIFFUSETRANSMISSIONCOLORMAP
    if (pbrMaterial.diffuseTransmissionColorMapEnabled) {
      diffuseTransmissionColor *= SRGBtoLINEAR(
        texture(pbr_diffuseTransmissionColorSampler, diffuseTransmissionColorUV)
      ).rgb;
    }
#endif
    vec3 multiscatterColor = pbrMaterial.multiscatterColorFactor;
#ifdef HAS_MULTISCATTERCOLORMAP
    if (pbrMaterial.multiscatterColorMapEnabled) {
      multiscatterColor *= SRGBtoLINEAR(
        texture(pbr_multiscatterColorSampler, multiscatterColorUV)
      ).rgb;
    }
#endif

    float clearcoatFactor = pbrMaterial.clearcoatFactor;
    float clearcoatRoughness = pbrMaterial.clearcoatRoughnessFactor;
#ifdef HAS_CLEARCOATMAP
    if (pbrMaterial.clearcoatMapEnabled) {
      clearcoatFactor *= texture(pbr_clearcoatSampler, clearcoatUV).r;
    }
#endif
#ifdef HAS_CLEARCOATROUGHNESSMAP
    if (pbrMaterial.clearcoatRoughnessMapEnabled) {
      clearcoatRoughness *= texture(pbr_clearcoatRoughnessSampler, clearcoatRoughnessUV).g;
    }
#endif
    clearcoatFactor = clamp(clearcoatFactor, 0.0, 1.0);
    clearcoatRoughness = clamp(clearcoatRoughness, c_MinRoughness, 1.0);
    vec3 clearcoatNormal = getClearcoatNormal(getTBN(clearcoatNormalUV), n, clearcoatNormalUV);
    clearcoatRoughness = widenSpecularRoughness(clearcoatRoughness, clearcoatNormal);

    vec3 sheenColor = pbrMaterial.sheenColorFactor;
    float sheenRoughness = pbrMaterial.sheenRoughnessFactor;
#ifdef HAS_SHEENCOLORMAP
    if (pbrMaterial.sheenColorMapEnabled) {
      sheenColor *= SRGBtoLINEAR(texture(pbr_sheenColorSampler, sheenColorUV)).rgb;
    }
#endif
#ifdef HAS_SHEENROUGHNESSMAP
    if (pbrMaterial.sheenRoughnessMapEnabled) {
      sheenRoughness *= texture(pbr_sheenRoughnessSampler, sheenRoughnessUV).a;
    }
#endif
    sheenRoughness = clamp(sheenRoughness, c_MinRoughness, 1.0);

    float iridescence = pbrMaterial.iridescenceFactor;
#ifdef HAS_IRIDESCENCEMAP
    if (pbrMaterial.iridescenceMapEnabled) {
      iridescence *= texture(pbr_iridescenceSampler, iridescenceUV).r;
    }
#endif
    iridescence = clamp(iridescence, 0.0, 1.0);
    float iridescenceThickness = mix(
      pbrMaterial.iridescenceThicknessRange.x,
      pbrMaterial.iridescenceThicknessRange.y,
      0.5
    );
#ifdef HAS_IRIDESCENCETHICKNESSMAP
    iridescenceThickness = mix(
      pbrMaterial.iridescenceThicknessRange.x,
      pbrMaterial.iridescenceThicknessRange.y,
      texture(pbr_iridescenceThicknessSampler, iridescenceThicknessUV).g
    );
#endif

    float anisotropyStrength = clamp(pbrMaterial.anisotropyStrength, 0.0, 1.0);
    vec2 anisotropyDirection = normalizeDirection(pbrMaterial.anisotropyDirection);
#ifdef HAS_ANISOTROPYMAP
    if (pbrMaterial.anisotropyMapEnabled) {
      vec3 anisotropySample = texture(pbr_anisotropySampler, anisotropyUV).rgb;
      anisotropyStrength *= anisotropySample.b;
      vec2 mappedDirection = anisotropySample.rg * 2.0 - 1.0;
      if (length(mappedDirection) > 0.0001) {
        anisotropyDirection = normalize(mappedDirection);
      }
    }
#endif
    anisotropyDirection = rotateDirection(anisotropyDirection, pbrMaterial.anisotropyRotation);
    vec3 anisotropyTangent = normalize(tbn[0] * anisotropyDirection.x + tbn[1] * anisotropyDirection.y);
    if (length(anisotropyTangent) < 0.0001) {
      anisotropyTangent = normalize(tbn[0]);
    }
    // Roughness is authored as perceptual roughness; as is convention,
    // convert to material roughness by squaring the perceptual roughness [2].
    float alphaRoughness = perceptualRoughness * perceptualRoughness;

    float dielectricF0 = getDielectricF0(pbrMaterial.ior);
    vec3 dielectricSpecularF0 = min(
      vec3(dielectricF0) * specularFactor * specularIntensity,
      vec3(1.0)
    );
    dielectricSpecularF0 = getIridescenceTint(
      iridescence,
      iridescenceThickness,
      NdotV,
      dielectricSpecularF0
    );
    vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - dielectricSpecularF0);
    diffuseColor *= (1.0 - metallic) * (1.0 - transmission) * (1.0 - diffuseTransmission);
    vec3 specularColor = mix(dielectricSpecularF0, baseColor.rgb, metallic);

    float clearcoatViewFresnel = dielectricSchlick(
      0.04,
      clamp(abs(dot(clearcoatNormal, v)), 0.0, 1.0)
    );
    float sheenDirectionalAlbedo = maxComponent(sheenColor) *
      (0.157 + 0.343 * (1.0 - NdotV)) * (1.0 - sheenRoughness * 0.5);
    float baseLayerEnergy = (1.0 - clearcoatFactor * clearcoatViewFresnel) *
      (1.0 - clamp(sheenDirectionalAlbedo, 0.0, 1.0));
    diffuseColor *= baseLayerEnergy;
    specularColor *= baseLayerEnergy;

    // Compute reflectance.
    float reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);

    // For typical incident reflectance range (between 4% to 100%) set the grazing
    // reflectance to 100% for typical fresnel effect.
    // For very low reflectance range on highly diffuse objects (below 4%),
    // incrementally reduce grazing reflecance to 0%.
    float reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
    vec3 specularEnvironmentR0 = specularColor.rgb;
    vec3 specularEnvironmentR90 = vec3(1.0, 1.0, 1.0) * reflectance90;
    vec3 reflection = -normalize(reflect(v, n));

    PBRInfo pbrInfo = PBRInfo(
      0.0, // NdotL
      NdotV,
      0.0, // NdotH
      0.0, // LdotH
      0.0, // VdotH
      perceptualRoughness,
      metallic,
      specularEnvironmentR0,
      specularEnvironmentR90,
      alphaRoughness,
      diffuseColor,
      specularColor,
      n,
      v,
      n,
      n
    );


#ifdef USE_LIGHTS
    // Apply ambient light
    PBRInfo_setAmbientLight(pbrInfo);
    color += calculateMaterialLightColor(
      pbrInfo,
      lighting.ambientColor,
      clearcoatNormal,
      clearcoatFactor,
      clearcoatRoughness,
      sheenColor,
      sheenRoughness,
      anisotropyTangent,
      anisotropyStrength
    );

    // Apply directional light
    for(int i = 0; i < lighting.directionalLightCount; i++) {
      if (i < lighting.directionalLightCount) {
        PBRInfo_setDirectionalLight(pbrInfo, lighting_getDirectionalLight(i).direction);
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getDirectionalLight(i).color,
          clearcoatNormal,
          clearcoatFactor,
          clearcoatRoughness,
          sheenColor,
          sheenRoughness,
          anisotropyTangent,
          anisotropyStrength
        );
        color += calculateDiffuseTransmissionLight(
          pbrInfo,
          lighting_getDirectionalLight(i).color,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }

    // Apply point light
    for(int i = 0; i < lighting.pointLightCount; i++) {
      if (i < lighting.pointLightCount) {
        PBRInfo_setPointLight(pbrInfo, lighting_getPointLight(i));
        float attenuation = getPointLightAttenuation(lighting_getPointLight(i), distance(lighting_getPointLight(i).position, pbr_vPosition));
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getPointLight(i).color / attenuation,
          clearcoatNormal,
          clearcoatFactor,
          clearcoatRoughness,
          sheenColor,
          sheenRoughness,
          anisotropyTangent,
          anisotropyStrength
        );
        color += calculateDiffuseTransmissionLight(
          pbrInfo,
          lighting_getPointLight(i).color / attenuation,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }

    for(int i = 0; i < lighting.spotLightCount; i++) {
      if (i < lighting.spotLightCount) {
        PBRInfo_setSpotLight(pbrInfo, lighting_getSpotLight(i));
        float attenuation = getSpotLightAttenuation(lighting_getSpotLight(i), pbr_vPosition);
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getSpotLight(i).color / attenuation,
          clearcoatNormal,
          clearcoatFactor,
          clearcoatRoughness,
          sheenColor,
          sheenRoughness,
          anisotropyTangent,
          anisotropyStrength
        );
        color += calculateDiffuseTransmissionLight(
          pbrInfo,
          lighting_getSpotLight(i).color / attenuation,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }
#endif

    // Calculate lighting contribution from image based lighting source (IBL)
#ifdef USE_IBL
    if (pbrMaterial.IBLenabled) {
      color += getIBLContribution(
        pbrInfo,
        n,
        getAnisotropicReflection(pbrInfo, anisotropyTangent, anisotropyStrength)
      );
      color += calculateClearcoatIBLContribution(
        pbrInfo,
        clearcoatNormal,
        -normalize(reflect(v, clearcoatNormal)),
        clearcoatFactor,
        clearcoatRoughness
      );
      color += calculateDiffuseTransmissionIBL(
        pbrInfo,
        diffuseTransmissionColor,
        diffuseTransmission,
        multiscatterColor,
        thickness
      );
      color += sheenColor * pbrMaterial.scaleIBLAmbient.x * (1.0 - sheenRoughness) * 0.25;
    }
#endif

 // Apply optional PBR terms for additional (optional) shading
#ifdef HAS_OCCLUSIONMAP
    if (pbrMaterial.occlusionMapEnabled) {
      float ao = texture(pbr_occlusionSampler, occlusionUV).r;
      color = mix(color, color * ao, pbrMaterial.occlusionStrength);
    }
#endif

    vec3 emissive = pbrMaterial.emissiveFactor;
#ifdef HAS_EMISSIVEMAP
    if (pbrMaterial.emissiveMapEnabled) {
      emissive *= SRGBtoLINEAR(texture(pbr_emissiveSampler, emissiveUV)).rgb;
    }
#endif
    color += emissive * pbrMaterial.emissiveStrength;

    if (transmission > 0.0) {
#ifdef USE_TRANSMISSION_FRAMEBUFFER
      float dielectricFresnel = getDielectricF0(pbrMaterial.ior);
      float transmissionFresnel = dielectricFresnel +
        (1.0 - dielectricFresnel) * pow(1.0 - NdotV, 5.0);
      vec3 transmittedColor = getTransmittedSceneColor(
        pbr_vPosition,
        n,
        v,
        thickness,
        perceptualRoughness
      );
      color += transmittedColor * getVolumeAttenuation(thickness) *
        transmission * (1.0 - transmissionFresnel);
#else
      color = mix(color, color * getVolumeAttenuation(thickness), transmission);
#endif
    }

    // This section uses mix to override final color for reference app visualization
    // of various parameters in the lighting equation.
#ifdef PBR_DEBUG
    // TODO: Figure out how to debug multiple lights

    // color = mix(color, F, pbr_scaleFGDSpec.x);
    // color = mix(color, vec3(G), pbr_scaleFGDSpec.y);
    // color = mix(color, vec3(D), pbr_scaleFGDSpec.z);
    // color = mix(color, specContrib, pbr_scaleFGDSpec.w);

    // color = mix(color, diffuseContrib, pbr_scaleDiffBaseMR.x);
    color = mix(color, baseColor.rgb, pbrMaterial.scaleDiffBaseMR.y);
    color = mix(color, vec3(metallic), pbrMaterial.scaleDiffBaseMR.z);
    color = mix(color, vec3(perceptualRoughness), pbrMaterial.scaleDiffBaseMR.w);
#endif

  }

#ifdef USE_TRANSMISSION_FRAMEBUFFER
  float alpha = clamp(baseColor.a, 0.0, 1.0);
#else
  float alpha = clamp(baseColor.a * (1.0 - transmission), 0.0, 1.0);
#endif
  return vec4(applySceneColorManagement(color), alpha);
}
`,l=`\
struct PBRFragmentInputs {
  pbr_vPosition: vec3f,
  pbr_vUV0: vec2f,
  pbr_vUV1: vec2f,
  pbr_vTBN: mat3x3f,
  pbr_vNormal: vec3f
};

var<private> fragmentInputs: PBRFragmentInputs;

fn pbr_setPositionNormalTangentUV(
  position: vec4f,
  normal: vec4f,
  tangent: vec4f,
  uv0: vec2f,
  uv1: vec2f
)
{
  var pos: vec4f = pbrProjection.modelMatrix * position;
  fragmentInputs.pbr_vPosition = pos.xyz / pos.w;
  fragmentInputs.pbr_vNormal = vec3f(0.0, 0.0, 1.0);
  fragmentInputs.pbr_vTBN = mat3x3f(
    vec3f(1.0, 0.0, 0.0),
    vec3f(0.0, 1.0, 0.0),
    vec3f(0.0, 0.0, 1.0)
  );
  fragmentInputs.pbr_vUV0 = vec2f(0.0, 0.0);
  fragmentInputs.pbr_vUV1 = uv1;

#ifdef HAS_NORMALS
  let normalW: vec3f = normalize((pbrProjection.normalMatrix * vec4f(normal.xyz, 0.0)).xyz);
  fragmentInputs.pbr_vNormal = normalW;
#ifdef HAS_TANGENTS
  let tangentW: vec3f = normalize((pbrProjection.modelMatrix * vec4f(tangent.xyz, 0.0)).xyz);
  let bitangentW: vec3f = cross(normalW, tangentW) * tangent.w;
  fragmentInputs.pbr_vTBN = mat3x3f(tangentW, bitangentW, normalW);
#endif
#endif

#ifdef HAS_UV
  fragmentInputs.pbr_vUV0 = uv0;
#endif
}

struct pbrMaterialUniforms {
  // Material is unlit
  unlit: u32,

  // Base color map
  baseColorMapEnabled: u32,
  baseColorFactor: vec4f,

  normalMapEnabled : u32,
  normalScale: f32,  // #ifdef HAS_NORMALMAP

  emissiveMapEnabled: u32,
  emissiveFactor: vec3f, // #ifdef HAS_EMISSIVEMAP

  metallicRoughnessValues: vec2f,
  metallicRoughnessMapEnabled: u32,

  occlusionMapEnabled: i32,
  occlusionStrength: f32, // #ifdef HAS_OCCLUSIONMAP
  
  alphaCutoffEnabled: i32,
  alphaCutoff: f32, // #ifdef ALPHA_CUTOFF

  specularColorFactor: vec3f,
  specularIntensityFactor: f32,
  specularColorMapEnabled: i32,
  specularIntensityMapEnabled: i32,

  ior: f32,

  transmissionFactor: f32,
  transmissionMapEnabled: i32,

  thicknessFactor: f32,
  attenuationDistance: f32,
  attenuationColor: vec3f,

  clearcoatFactor: f32,
  clearcoatRoughnessFactor: f32,
  clearcoatMapEnabled: i32,
  clearcoatRoughnessMapEnabled: i32,

  sheenColorFactor: vec3f,
  sheenRoughnessFactor: f32,
  sheenColorMapEnabled: i32,
  sheenRoughnessMapEnabled: i32,

  iridescenceFactor: f32,
  iridescenceIor: f32,
  iridescenceThicknessRange: vec2f,
  iridescenceMapEnabled: i32,

  anisotropyStrength: f32,
  anisotropyRotation: f32,
  anisotropyDirection: vec2f,
  anisotropyMapEnabled: i32,

  emissiveStrength: f32,
  dispersion: f32,
  
  // IBL
  IBLenabled: i32,
  scaleIBLAmbient: vec2f, // #ifdef USE_IBL
  
  // debugging flags used for shader output of intermediate PBR variables
  // #ifdef PBR_DEBUG
  scaleDiffBaseMR: vec4f,
  scaleFGDSpec: vec4f,
  // #endif

  baseColorUVSet: i32,
  baseColorUVTransform: mat3x3f,
  metallicRoughnessUVSet: i32,
  metallicRoughnessUVTransform: mat3x3f,
  normalUVSet: i32,
  normalUVTransform: mat3x3f,
  occlusionUVSet: i32,
  occlusionUVTransform: mat3x3f,
  emissiveUVSet: i32,
  emissiveUVTransform: mat3x3f,
  specularColorUVSet: i32,
  specularColorUVTransform: mat3x3f,
  specularIntensityUVSet: i32,
  specularIntensityUVTransform: mat3x3f,
  transmissionUVSet: i32,
  transmissionUVTransform: mat3x3f,
  thicknessUVSet: i32,
  thicknessUVTransform: mat3x3f,
  clearcoatUVSet: i32,
  clearcoatUVTransform: mat3x3f,
  clearcoatRoughnessUVSet: i32,
  clearcoatRoughnessUVTransform: mat3x3f,
  clearcoatNormalUVSet: i32,
  clearcoatNormalUVTransform: mat3x3f,
  sheenColorUVSet: i32,
  sheenColorUVTransform: mat3x3f,
  sheenRoughnessUVSet: i32,
  sheenRoughnessUVTransform: mat3x3f,
  iridescenceUVSet: i32,
  iridescenceUVTransform: mat3x3f,
  iridescenceThicknessUVSet: i32,
  iridescenceThicknessUVTransform: mat3x3f,
  anisotropyUVSet: i32,
  anisotropyUVTransform: mat3x3f,

  bumpFactor: f32,
  bumpMapEnabled: i32,
  diffuseTransmissionFactor: f32,
  diffuseTransmissionMapEnabled: i32,
  diffuseTransmissionColorFactor: vec3f,
  diffuseTransmissionColorMapEnabled: i32,
  multiscatterColorFactor: vec3f,
  multiscatterColorMapEnabled: i32,
  scatterAnisotropy: f32,

  bumpUVSet: i32,
  bumpUVTransform: mat3x3f,
  diffuseTransmissionUVSet: i32,
  diffuseTransmissionUVTransform: mat3x3f,
  diffuseTransmissionColorUVSet: i32,
  diffuseTransmissionColorUVTransform: mat3x3f,
  multiscatterColorUVSet: i32,
  multiscatterColorUVTransform: mat3x3f,
}

@group(3) @binding(auto) var<uniform> pbrMaterial : pbrMaterialUniforms;

// Samplers
#ifdef HAS_BASECOLORMAP
@group(3) @binding(auto) var pbr_baseColorSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_baseColorSamplerSampler: sampler;
#endif
#ifdef HAS_NORMALMAP
@group(3) @binding(auto) var pbr_normalSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_normalSamplerSampler: sampler;
#endif
#ifdef HAS_EMISSIVEMAP
@group(3) @binding(auto) var pbr_emissiveSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_emissiveSamplerSampler: sampler;
#endif
#ifdef HAS_METALROUGHNESSMAP
@group(3) @binding(auto) var pbr_metallicRoughnessSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_metallicRoughnessSamplerSampler: sampler;
#endif
#ifdef HAS_OCCLUSIONMAP
@group(3) @binding(auto) var pbr_occlusionSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_occlusionSamplerSampler: sampler;
#endif
#ifdef HAS_SPECULARCOLORMAP
@group(3) @binding(auto) var pbr_specularColorSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_specularColorSamplerSampler: sampler;
#endif
#ifdef HAS_SPECULARINTENSITYMAP
@group(3) @binding(auto) var pbr_specularIntensitySampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_specularIntensitySamplerSampler: sampler;
#endif
#ifdef HAS_TRANSMISSIONMAP
@group(3) @binding(auto) var pbr_transmissionSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_transmissionSamplerSampler: sampler;
#endif
#ifdef HAS_THICKNESSMAP
@group(3) @binding(auto) var pbr_thicknessSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_thicknessSamplerSampler: sampler;
#endif
#ifdef HAS_CLEARCOATMAP
@group(3) @binding(auto) var pbr_clearcoatSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_clearcoatSamplerSampler: sampler;
#endif
#ifdef HAS_CLEARCOATROUGHNESSMAP
@group(3) @binding(auto) var pbr_clearcoatRoughnessSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_clearcoatRoughnessSamplerSampler: sampler;
#endif
#ifdef HAS_CLEARCOATNORMALMAP
@group(3) @binding(auto) var pbr_clearcoatNormalSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_clearcoatNormalSamplerSampler: sampler;
#endif
#ifdef HAS_SHEENCOLORMAP
@group(3) @binding(auto) var pbr_sheenColorSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_sheenColorSamplerSampler: sampler;
#endif
#ifdef HAS_SHEENROUGHNESSMAP
@group(3) @binding(auto) var pbr_sheenRoughnessSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_sheenRoughnessSamplerSampler: sampler;
#endif
#ifdef HAS_IRIDESCENCEMAP
@group(3) @binding(auto) var pbr_iridescenceSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_iridescenceSamplerSampler: sampler;
#endif
#ifdef HAS_IRIDESCENCETHICKNESSMAP
@group(3) @binding(auto) var pbr_iridescenceThicknessSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_iridescenceThicknessSamplerSampler: sampler;
#endif
#ifdef HAS_ANISOTROPYMAP
@group(3) @binding(auto) var pbr_anisotropySampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_anisotropySamplerSampler: sampler;
#endif
#ifdef HAS_BUMPMAP
@group(3) @binding(auto) var pbr_bumpSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_bumpSamplerSampler: sampler;
#endif
#ifdef HAS_DIFFUSETRANSMISSIONMAP
@group(3) @binding(auto) var pbr_diffuseTransmissionSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_diffuseTransmissionSamplerSampler: sampler;
#endif
#ifdef HAS_DIFFUSETRANSMISSIONCOLORMAP
@group(3) @binding(auto) var pbr_diffuseTransmissionColorSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_diffuseTransmissionColorSamplerSampler: sampler;
#endif
#ifdef HAS_MULTISCATTERCOLORMAP
@group(3) @binding(auto) var pbr_multiscatterColorSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_multiscatterColorSamplerSampler: sampler;
#endif
// Encapsulate the various inputs used by the various functions in the shading equation
// We store values in this struct to simplify the integration of alternative implementations
// of the shading terms, outlined in the Readme.MD Appendix.
struct PBRInfo {
  NdotL: f32,                  // cos angle between normal and light direction
  NdotV: f32,                  // cos angle between normal and view direction
  NdotH: f32,                  // cos angle between normal and half vector
  LdotH: f32,                  // cos angle between light direction and half vector
  VdotH: f32,                  // cos angle between view direction and half vector
  perceptualRoughness: f32,    // roughness value, as authored by the model creator (input to shader)
  metalness: f32,              // metallic value at the surface
  reflectance0: vec3f,            // full reflectance color (normal incidence angle)
  reflectance90: vec3f,           // reflectance color at grazing angle
  alphaRoughness: f32,         // roughness mapped to a more linear change in the roughness (proposed by [2])
  diffuseColor: vec3f,            // color contribution from diffuse lighting
  specularColor: vec3f,           // color contribution from specular lighting
  n: vec3f,                       // normal at surface point
  v: vec3f,                       // vector from surface point to camera
  l: vec3f,                       // direction from the surface toward the current light
  h: vec3f                        // half vector between the current light and camera
};

const M_PI = 3.141592653589793;
const c_MinRoughness = 0.04;

// Widen sub-pixel specular lobes using the screen-space normal footprint.
// This is geometric specular antialiasing: the normal variance is converted
// into an additional squared perceptual roughness before evaluating BRDFs.
fn widenSpecularRoughness(perceptualRoughness: f32, normal: vec3f) -> f32 {
  let normalDerivativeX = dpdx(normal);
  let normalDerivativeY = dpdy(normal);
  let normalVariance =
    dot(normalDerivativeX, normalDerivativeX) +
    dot(normalDerivativeY, normalDerivativeY);
  let kernelRoughnessSquared = min(2.0 * normalVariance, 1.0);
  return clamp(
    sqrt(perceptualRoughness * perceptualRoughness + kernelRoughnessSquared),
    c_MinRoughness,
    1.0
  );
}

fn SRGBtoLINEAR(srgbIn: vec4f ) -> vec4f
{
  var linOut: vec3f = srgbIn.xyz;
#ifdef MANUAL_SRGB
  let bLess: vec3f = step(vec3f(0.04045), srgbIn.xyz);
  linOut = mix(
    srgbIn.xyz / vec3f(12.92),
    pow((srgbIn.xyz + vec3f(0.055)) / vec3f(1.055), vec3f(2.4)),
    bLess
  );
#ifdef SRGB_FAST_APPROXIMATION
  linOut = pow(srgbIn.xyz, vec3f(2.2));
#endif
#endif
  return vec4f(linOut, srgbIn.w);
}

fn getMaterialUV(uvSet: i32, uvTransform: mat3x3f) -> vec2f
{
  var baseUV = fragmentInputs.pbr_vUV0;
  if (uvSet == 1) {
    baseUV = fragmentInputs.pbr_vUV1;
  }
  return (uvTransform * vec3f(baseUV, 1.0)).xy;
}

// Build the tangent basis from interpolated attributes or screen-space derivatives.
fn getTBN(uv: vec2f) -> mat3x3f
{
  let pos_dx: vec3f = dpdx(fragmentInputs.pbr_vPosition);
  let pos_dy: vec3f = dpdy(fragmentInputs.pbr_vPosition);
  let tex_dx: vec3f = dpdx(vec3f(uv, 0.0));
  let tex_dy: vec3f = dpdy(vec3f(uv, 0.0));
  var t: vec3f = (tex_dy.y * pos_dx - tex_dx.y * pos_dy) / (tex_dx.x * tex_dy.y - tex_dy.x * tex_dx.y);

  var ng: vec3f = cross(pos_dy, pos_dx);
#ifdef HAS_NORMALS
  ng = normalize(fragmentInputs.pbr_vNormal);
#endif
  t = normalize(t - ng * dot(ng, t));
  var b: vec3f = normalize(cross(ng, t));
  var tbn: mat3x3f = mat3x3f(t, b, ng);
#ifdef HAS_TANGENTS
  tbn = fragmentInputs.pbr_vTBN;
#endif

  return tbn;
}

// Find the normal for this fragment, pulling either from a predefined normal map
// or from the interpolated mesh normal and tangent attributes.
fn getMappedNormal(
  normalSampler: texture_2d<f32>,
  normalSamplerBinding: sampler,
  tbn: mat3x3f,
  normalScale: f32,
  uv: vec2f
) -> vec3f
{
  let n = textureSample(normalSampler, normalSamplerBinding, uv).rgb;
  return normalize(tbn * ((2.0 * n - 1.0) * vec3f(normalScale, normalScale, 1.0)));
}

fn getNormal(tbn: mat3x3f, uv: vec2f) -> vec3f
{
  // The tbn matrix is linearly interpolated, so we need to re-normalize
  var n: vec3f = normalize(tbn[2].xyz);
#ifdef HAS_NORMALMAP
  n = getMappedNormal(
    pbr_normalSampler,
    pbr_normalSamplerSampler,
    tbn,
    pbrMaterial.normalScale,
    uv
  );
#endif

#ifdef HAS_BUMPMAP
  let bumpUV = getMaterialUV(pbrMaterial.bumpUVSet, pbrMaterial.bumpUVTransform);
  let bumpTexelSize = 1.0 / vec2f(textureDimensions(pbr_bumpSampler, 0));
  let bumpHeight = textureSample(pbr_bumpSampler, pbr_bumpSamplerSampler, bumpUV).r;
  let bumpGradient = vec2f(
    textureSample(
      pbr_bumpSampler,
      pbr_bumpSamplerSampler,
      bumpUV + vec2f(bumpTexelSize.x, 0.0)
    ).r - bumpHeight,
    textureSample(
      pbr_bumpSampler,
      pbr_bumpSamplerSampler,
      bumpUV + vec2f(0.0, bumpTexelSize.y)
    ).r - bumpHeight
  );
  n = normalize(n - pbrMaterial.bumpFactor *
    (tbn[0] * bumpGradient.x + tbn[1] * bumpGradient.y));
#endif

  return n;
}

fn getClearcoatNormal(tbn: mat3x3f, baseNormal: vec3f, uv: vec2f) -> vec3f
{
#ifdef HAS_CLEARCOATNORMALMAP
  return getMappedNormal(
    pbr_clearcoatNormalSampler,
    pbr_clearcoatNormalSamplerSampler,
    tbn,
    1.0,
    uv
  );
#else
  return baseNormal;
#endif
}

// Calculation of the lighting contribution from an optional Image Based Light source.
// Precomputed Environment Maps are required uniform inputs and are computed as outlined in [1].
// See our README.md on Environment Maps [3] for additional discussion.
#ifdef USE_IBL
fn getIBLContribution(pbrInfo: PBRInfo, n: vec3f, reflection: vec3f) -> vec3f
{
#ifdef USE_SCENE_ENVIRONMENT
  let maximumMipLevel = max(pbrScene.environmentMipCount - 1.0, 0.0);
  let rotationSine = sin(pbrScene.environmentRotation);
  let rotationCosine = cos(pbrScene.environmentRotation);
  let environmentRotation = mat2x2f(
    vec2f(rotationCosine, rotationSine),
    vec2f(-rotationSine, rotationCosine)
  );
  let rotatedNormal = environmentRotation * n.xz;
  let rotatedReflection = environmentRotation * reflection.xz;
  let environmentNormal = vec3f(rotatedNormal.x, n.y, rotatedNormal.y);
  let environmentReflection = vec3f(rotatedReflection.x, reflection.y, rotatedReflection.y);
#else
  let maximumMipLevel = 9.0;
  let environmentNormal = n;
  let environmentReflection = reflection;
#endif
  let lod = pbrInfo.perceptualRoughness * maximumMipLevel;
  // retrieve a scale and bias to F0. See [1], Figure 3
  let brdfSample = textureSampleLevel(
    pbr_brdfLUT,
    pbr_brdfLUTSampler,
    vec2f(pbrInfo.NdotV, 1.0 - pbrInfo.perceptualRoughness),
    0.0
  );
  let diffuseSample = textureSampleLevel(
    pbr_diffuseEnvSampler,
    pbr_diffuseEnvSamplerSampler,
    environmentNormal,
    0.0
  );
  var specularSample = textureSampleLevel(
    pbr_specularEnvSampler,
    pbr_specularEnvSamplerSampler,
    environmentReflection,
    0.0
  );
#ifdef USE_TEX_LOD
  specularSample = textureSampleLevel(
    pbr_specularEnvSampler,
    pbr_specularEnvSamplerSampler,
    environmentReflection,
    lod
  );
#endif

#ifdef USE_SCENE_ENVIRONMENT
  let brdf = brdfSample.rgb;
  let diffuseLight = diffuseSample.rgb;
  let specularLight = specularSample.rgb;
#else
  let brdf = SRGBtoLINEAR(brdfSample).rgb;
  let diffuseLight = SRGBtoLINEAR(diffuseSample).rgb;
  let specularLight = SRGBtoLINEAR(specularSample).rgb;
#endif

  let diffuse = diffuseLight * pbrInfo.diffuseColor * pbrMaterial.scaleIBLAmbient.x;
  let specular =
    specularLight * (pbrInfo.specularColor * brdf.x + brdf.y) * pbrMaterial.scaleIBLAmbient.y;

#ifdef USE_SCENE_ENVIRONMENT
  return (diffuse + specular) * max(pbrScene.environmentIntensity, 0.0);
#else
  return diffuse + specular;
#endif
}
#endif

// Basic Lambertian diffuse
// Implementation from Lambert's Photometria https://archive.org/details/lambertsphotome00lambgoog
// See also [1], Equation 1
fn diffuse(pbrInfo: PBRInfo) -> vec3<f32> {
  return pbrInfo.diffuseColor / M_PI;
}

// The following equation models the Fresnel reflectance term of the spec equation (aka F())
// Implementation of fresnel from [4], Equation 15
fn specularReflection(pbrInfo: PBRInfo) -> vec3<f32> {
  return pbrInfo.reflectance0 +
    (pbrInfo.reflectance90 - pbrInfo.reflectance0) *
    pow(clamp(1.0 - pbrInfo.VdotH, 0.0, 1.0), 5.0);
}

// This calculates the specular geometric attenuation (aka G()),
// where rougher material will reflect less light back to the viewer.
// This implementation is based on [1] Equation 4, and we adopt their modifications to
// alphaRoughness as input as originally proposed in [2].
fn geometricOcclusion(pbrInfo: PBRInfo) -> f32 {
  let NdotL: f32 = pbrInfo.NdotL;
  let NdotV: f32 = pbrInfo.NdotV;
  let r: f32 = pbrInfo.alphaRoughness;

  let attenuationL = 2.0 * NdotL / (NdotL + sqrt(r * r + (1.0 - r * r) * (NdotL * NdotL)));
  let attenuationV = 2.0 * NdotV / (NdotV + sqrt(r * r + (1.0 - r * r) * (NdotV * NdotV)));
  return attenuationL * attenuationV;
}

// The following equation(s) model the distribution of microfacet normals across
// the area being drawn (aka D())
// Implementation from "Average Irregularity Representation of a Roughened Surface
// for Ray Reflection" by T. S. Trowbridge, and K. P. Reitz
// Follows the distribution function recommended in the SIGGRAPH 2013 course notes
// from EPIC Games [1], Equation 3.
fn microfacetDistribution(pbrInfo: PBRInfo) -> f32 {
  let roughnessSq = pbrInfo.alphaRoughness * pbrInfo.alphaRoughness;
  let f = (pbrInfo.NdotH * roughnessSq - pbrInfo.NdotH) * pbrInfo.NdotH + 1.0;
  return roughnessSq / (M_PI * f * f);
}

fn maxComponent(value: vec3f) -> f32 {
  return max(max(value.r, value.g), value.b);
}

fn getDielectricF0(ior: f32) -> f32 {
  let clampedIor = max(ior, 1.0);
  let ratio = (clampedIor - 1.0) / (clampedIor + 1.0);
  return ratio * ratio;
}

fn normalizeDirection(direction: vec2f) -> vec2f {
  let directionLength = length(direction);
  if (directionLength > 0.0001) {
    return direction / directionLength;
  }

  return vec2f(1.0, 0.0);
}

fn rotateDirection(direction: vec2f, rotation: f32) -> vec2f {
  let s = sin(rotation);
  let c = cos(rotation);
  return vec2f(direction.x * c - direction.y * s, direction.x * s + direction.y * c);
}

fn encodeLinearSRGB(linearColor: vec3f) -> vec3f {
  let positiveColor = max(linearColor, vec3f(0.0));
  return select(
    positiveColor * 12.92,
    1.055 * pow(positiveColor, vec3f(1.0 / 2.4)) - 0.055,
    positiveColor > vec3f(0.0031308)
  );
}

fn toneMapKhronosPBRNeutral(inputColor: vec3f) -> vec3f {
  let startCompression = 0.76;
  let darkestChannel = min(inputColor.r, min(inputColor.g, inputColor.b));
  let offset = select(
    0.04,
    darkestChannel - 6.25 * darkestChannel * darkestChannel,
    darkestChannel < 0.08
  );
  var color = inputColor - vec3f(offset);
  let peak = maxComponent(color);
  if (peak < startCompression) {
    return color;
  }

  let compressionRange = 1.0 - startCompression;
  let compressedPeak = 1.0 - compressionRange * compressionRange /
    (peak + compressionRange - startCompression);
  color *= compressedPeak / max(peak, 0.0001);
  let desaturation = 1.0 - 1.0 / (0.15 * (peak - compressedPeak) + 1.0);
  return mix(color, vec3f(compressedPeak), desaturation);
}

fn applySceneColorManagement(sceneColor: vec3f) -> vec3f {
#ifdef USE_SCENE_COLOR_MANAGEMENT
  var color = max(sceneColor, vec3f(0.0)) * max(pbrScene.exposure, 0.0);
  if (pbrScene.toneMapMode == 1) {
    color /= vec3f(1.0) + color;
  } else if (pbrScene.toneMapMode == 2) {
    color = toneMapKhronosPBRNeutral(color);
  } else if (pbrScene.toneMapMode == 3) {
    color = clamp(
      (color * (2.51 * color + 0.03)) / (color * (2.43 * color + 0.59) + 0.14),
      vec3f(0.0),
      vec3f(1.0)
    );
  }
  if (pbrScene.outputEncoding == 0) {
    return color;
  }
  return encodeLinearSRGB(color);
#else
  return pow(max(sceneColor, vec3f(0.0)), vec3f(1.0 / 2.2));
#endif
}

fn dielectricSchlick(reflectance: f32, cosine: f32) -> f32 {
  return reflectance + (1.0 - reflectance) * pow(clamp(1.0 - cosine, 0.0, 1.0), 5.0);
}

fn evaluateIridescenceSensitivity(opticalPathDifference: f32, phaseShift: vec3f) -> vec3f {
  let phase = 2.0 * M_PI * opticalPathDifference * 1.0e-9;
  let sensitivity = vec3f(5.4856e-13, 4.4201e-13, 5.2481e-13);
  let position = vec3f(1.6810e6, 1.7953e6, 2.2084e6);
  let variance = vec3f(4.3278e9, 9.3046e9, 6.6121e9);
  var xyz = sensitivity * sqrt(2.0 * M_PI * variance) *
    cos(position * phase + phaseShift) * exp(-phase * phase * variance);
  xyz.x += 9.7470e-14 * sqrt(2.0 * M_PI * 4.5282e9) *
    cos(2.2399e6 * phase + phaseShift.x) * exp(-4.5282e9 * phase * phase);
  xyz /= 1.0685e-7;
  return mat3x3f(
    vec3f(3.2404542, -0.9692660, 0.0556434),
    vec3f(-1.5371385, 1.8760108, -0.2040259),
    vec3f(-0.4985314, 0.0415560, 1.0572252)
  ) * xyz;
}

fn getIridescenceTint(
  iridescence: f32,
  thickness: f32,
  NdotV: f32,
  baseReflectance: vec3f
) -> vec3f {
  if (iridescence <= 0.0 || thickness <= 0.0) {
    return baseReflectance;
  }

  let filmIor = max(pbrMaterial.iridescenceIor, 1.0);
  let sineSquared = (1.0 - NdotV * NdotV) / (filmIor * filmIor);
  let cosineSquared = 1.0 - sineSquared;
  if (cosineSquared <= 0.0) {
    return mix(baseReflectance, vec3f(1.0), iridescence);
  }
  let filmCosine = sqrt(cosineSquared);
  let firstInterfaceReflectance = dielectricSchlick(getDielectricF0(filmIor), NdotV);
  let transmittedEnergy = 1.0 - firstInterfaceReflectance;
  let squareRootReflectance = sqrt(clamp(baseReflectance, vec3f(0.0), vec3f(0.9999)));
  let baseIor = (vec3f(1.0) + squareRootReflectance) /
    (vec3f(1.0) - squareRootReflectance);
  var secondInterfaceF0 = (baseIor - vec3f(filmIor)) / (baseIor + vec3f(filmIor));
  secondInterfaceF0 *= secondInterfaceF0;
  let secondInterfaceReflectance = secondInterfaceF0 +
    (vec3f(1.0) - secondInterfaceF0) * pow(1.0 - filmCosine, 5.0);
  let phaseShift = vec3f(M_PI) + select(
    vec3f(0.0),
    vec3f(M_PI),
    baseIor < vec3f(filmIor)
  );
  let opticalPathDifference = 2.0 * filmIor * thickness * filmCosine;
  let combinedReflectance = clamp(
    firstInterfaceReflectance * secondInterfaceReflectance,
    vec3f(0.00001),
    vec3f(0.9999)
  );
  let recurringAmplitude = sqrt(combinedReflectance);
  let interfaceResponse = transmittedEnergy * transmittedEnergy * secondInterfaceReflectance /
    (vec3f(1.0) - combinedReflectance);
  var reflectedSpectrum = vec3f(firstInterfaceReflectance) + interfaceResponse;
  var harmonicAmplitude = interfaceResponse - vec3f(transmittedEnergy);
  for (var harmonic = 1; harmonic <= 2; harmonic++) {
    harmonicAmplitude *= recurringAmplitude;
    reflectedSpectrum += harmonicAmplitude * 2.0 * evaluateIridescenceSensitivity(
      f32(harmonic) * opticalPathDifference,
      f32(harmonic) * phaseShift
    );
  }
  return mix(baseReflectance, clamp(reflectedSpectrum, vec3f(0.0), vec3f(1.0)), iridescence);
}

fn getVolumeAttenuation(thickness: f32) -> vec3f {
  if (thickness <= 0.0) {
    return vec3f(1.0);
  }

  let attenuationCoefficient =
    -log(max(pbrMaterial.attenuationColor, vec3f(0.0001))) /
    max(pbrMaterial.attenuationDistance, 0.0001);
  return exp(-attenuationCoefficient * thickness);
}

// KHR_materials_volume_scatter is an active draft. This evaluates a local,
// thickness-aware single-scattering approximation rather than random walk.
fn getDiffuseTransmissionAttenuation(
  pbrInfo: PBRInfo,
  multiscatterColor: vec3f,
  thickness: f32
) -> vec3f {
  let volumeAttenuation = getVolumeAttenuation(thickness);
  let scatteringStrength = maxComponent(multiscatterColor);
  if (thickness <= 0.0 || scatteringStrength <= 0.0001) {
    return volumeAttenuation;
  }

  let anisotropy = clamp(pbrMaterial.scatterAnisotropy, -0.95, 0.95);
  let scatteringCosine = clamp(dot(-pbrInfo.v, pbrInfo.l), -1.0, 1.0);
  let phaseDenominator = max(
    1.0 + anisotropy * anisotropy - 2.0 * anisotropy * scatteringCosine,
    0.0001
  );
  let phaseWeight = clamp(
    (1.0 - anisotropy * anisotropy) / pow(phaseDenominator, 1.5),
    0.0,
    4.0
  );
  let scatteringDepth = thickness / max(pbrMaterial.attenuationDistance, 0.0001);
  let scatteringProbability = 1.0 - exp(-scatteringDepth);
  let scatteringColor = clamp(multiscatterColor, vec3f(0.0), vec3f(1.0));
  return mix(
    volumeAttenuation,
    volumeAttenuation * mix(vec3f(1.0), scatteringColor * phaseWeight, scatteringColor),
    scatteringProbability
  );
}

fn calculateDiffuseTransmissionLight(
  pbrInfo: PBRInfo,
  lightColor: vec3f,
  diffuseTransmissionColor: vec3f,
  diffuseTransmission: f32,
  multiscatterColor: vec3f,
  thickness: f32
) -> vec3f {
  let oppositeHemisphere = max(dot(-pbrInfo.n, pbrInfo.l), 0.0);
  if (oppositeHemisphere <= 0.0 || diffuseTransmission <= 0.0) {
    return vec3f(0.0);
  }

  let nonReflectedEnergy = vec3f(1.0) - clamp(pbrInfo.reflectance0, vec3f(0.0), vec3f(1.0));
  let attenuatedColor = getDiffuseTransmissionAttenuation(
    pbrInfo,
    multiscatterColor,
    thickness
  );
  return lightColor * diffuseTransmissionColor * nonReflectedEnergy *
    attenuatedColor * (diffuseTransmission * oppositeHemisphere / M_PI);
}

#ifdef USE_IBL
fn calculateDiffuseTransmissionIBL(
  pbrInfo: PBRInfo,
  diffuseTransmissionColor: vec3f,
  diffuseTransmission: f32,
  multiscatterColor: vec3f,
  thickness: f32
) -> vec3f {
  if (diffuseTransmission <= 0.0) {
    return vec3f(0.0);
  }

#ifdef USE_SCENE_ENVIRONMENT
  let rotationSine = sin(pbrScene.environmentRotation);
  let rotationCosine = cos(pbrScene.environmentRotation);
  let environmentRotation = mat2x2f(
    vec2f(rotationCosine, rotationSine),
    vec2f(-rotationSine, rotationCosine)
  );
  let rotatedNormal = environmentRotation * -pbrInfo.n.xz;
  let oppositeNormal = vec3f(rotatedNormal.x, -pbrInfo.n.y, rotatedNormal.y);
  let environmentColor = textureSampleLevel(
    pbr_diffuseEnvSampler,
    pbr_diffuseEnvSamplerSampler,
    oppositeNormal,
    0.0
  ).rgb * max(pbrScene.environmentIntensity, 0.0);
#else
  let environmentColor = SRGBtoLINEAR(
    textureSampleLevel(pbr_diffuseEnvSampler, pbr_diffuseEnvSamplerSampler, -pbrInfo.n, 0.0)
  ).rgb;
#endif
  let nonReflectedEnergy = vec3f(1.0) - clamp(pbrInfo.reflectance0, vec3f(0.0), vec3f(1.0));
  return environmentColor * diffuseTransmissionColor * nonReflectedEnergy *
    getDiffuseTransmissionAttenuation(pbrInfo, multiscatterColor, thickness) *
    diffuseTransmission * pbrMaterial.scaleIBLAmbient.x;
}
#endif

#ifdef USE_TRANSMISSION_FRAMEBUFFER
fn sampleTransmittedSceneColor(
  position: vec3f,
  normal: vec3f,
  viewDirection: vec3f,
  thickness: f32,
  perceptualRoughness: f32,
  indexOfRefraction: f32
) -> vec3f {
  let refractionDirection = refract(
    -viewDirection,
    normal,
    1.0 / max(indexOfRefraction, 1.0)
  );
  let refractedPosition = position + refractionDirection * thickness;
  let clipPosition = pbrScene.projectionMatrix *
    pbrScene.viewMatrix * vec4f(refractedPosition, 1.0);
  var textureCoordinate = clipPosition.xy / max(clipPosition.w, 0.0001) * 0.5 + 0.5;
  textureCoordinate.y = 1.0 - textureCoordinate.y;
  textureCoordinate = clamp(textureCoordinate, vec2f(0.001), vec2f(0.999));

  let blurRadius = perceptualRoughness * perceptualRoughness * 8.0 /
    max(pbrScene.framebufferSize, vec2f(1.0));
  var sceneColor = textureSampleLevel(
    pbr_transmissionFramebufferSampler,
    pbr_transmissionFramebufferSamplerSampler,
    textureCoordinate,
    0.0
  ).rgb * 0.4;
  sceneColor += textureSampleLevel(
    pbr_transmissionFramebufferSampler,
    pbr_transmissionFramebufferSamplerSampler,
    textureCoordinate + vec2f(blurRadius.x, 0.0),
    0.0
  ).rgb * 0.15;
  sceneColor += textureSampleLevel(
    pbr_transmissionFramebufferSampler,
    pbr_transmissionFramebufferSamplerSampler,
    textureCoordinate - vec2f(blurRadius.x, 0.0),
    0.0
  ).rgb * 0.15;
  sceneColor += textureSampleLevel(
    pbr_transmissionFramebufferSampler,
    pbr_transmissionFramebufferSamplerSampler,
    textureCoordinate + vec2f(0.0, blurRadius.y),
    0.0
  ).rgb * 0.15;
  sceneColor += textureSampleLevel(
    pbr_transmissionFramebufferSampler,
    pbr_transmissionFramebufferSamplerSampler,
    textureCoordinate - vec2f(0.0, blurRadius.y),
    0.0
  ).rgb * 0.15;
  return max(sceneColor, vec3f(0.0));
}

fn getTransmittedSceneColor(
  position: vec3f,
  normal: vec3f,
  viewDirection: vec3f,
  thickness: f32,
  perceptualRoughness: f32
) -> vec3f {
  if (pbrMaterial.dispersion <= 0.0) {
    return sampleTransmittedSceneColor(
      position,
      normal,
      viewDirection,
      thickness,
      perceptualRoughness,
      pbrMaterial.ior
    );
  }

  let halfSpread = (max(pbrMaterial.ior, 1.0) - 1.0) * 0.025 * pbrMaterial.dispersion;
  let indicesOfRefraction = max(
    vec3f(pbrMaterial.ior - halfSpread, pbrMaterial.ior, pbrMaterial.ior + halfSpread),
    vec3f(1.0)
  );
  return vec3f(
    sampleTransmittedSceneColor(
      position, normal, viewDirection, thickness, perceptualRoughness, indicesOfRefraction.r
    ).r,
    sampleTransmittedSceneColor(
      position, normal, viewDirection, thickness, perceptualRoughness, indicesOfRefraction.g
    ).g,
    sampleTransmittedSceneColor(
      position, normal, viewDirection, thickness, perceptualRoughness, indicesOfRefraction.b
    ).b
  );
}
#endif

fn createClearcoatPBRInfo(
  basePBRInfo: PBRInfo,
  clearcoatNormal: vec3f,
  clearcoatRoughness: f32
) -> PBRInfo {
  let perceptualRoughness = clamp(clearcoatRoughness, c_MinRoughness, 1.0);
  let alphaRoughness = perceptualRoughness * perceptualRoughness;
  let NdotV = clamp(abs(dot(clearcoatNormal, basePBRInfo.v)), 0.001, 1.0);

  return PBRInfo(
    basePBRInfo.NdotL,
    NdotV,
    basePBRInfo.NdotH,
    basePBRInfo.LdotH,
    basePBRInfo.VdotH,
    perceptualRoughness,
    0.0,
    vec3f(0.04),
    vec3f(1.0),
    alphaRoughness,
    vec3f(0.0),
    vec3f(0.04),
    clearcoatNormal,
    basePBRInfo.v,
    basePBRInfo.l,
    basePBRInfo.h
  );
}

fn calculateClearcoatContribution(
  pbrInfo: PBRInfo,
  lightColor: vec3f,
  clearcoatNormal: vec3f,
  clearcoatFactor: f32,
  clearcoatRoughness: f32
) -> vec3f {
  if (clearcoatFactor <= 0.0) {
    return vec3f(0.0);
  }

  let clearcoatPBRInfo = createClearcoatPBRInfo(pbrInfo, clearcoatNormal, clearcoatRoughness);
  return calculateFinalColor(clearcoatPBRInfo, lightColor) * clearcoatFactor;
}

#ifdef USE_IBL
fn calculateClearcoatIBLContribution(
  pbrInfo: PBRInfo,
  clearcoatNormal: vec3f,
  reflection: vec3f,
  clearcoatFactor: f32,
  clearcoatRoughness: f32
) -> vec3f {
  if (clearcoatFactor <= 0.0) {
    return vec3f(0.0);
  }

  let clearcoatPBRInfo = createClearcoatPBRInfo(pbrInfo, clearcoatNormal, clearcoatRoughness);
  return getIBLContribution(clearcoatPBRInfo, clearcoatNormal, reflection) * clearcoatFactor;
}
#endif

fn calculateSheenContribution(
  pbrInfo: PBRInfo,
  lightColor: vec3f,
  sheenColor: vec3f,
  sheenRoughness: f32
) -> vec3f {
  if (maxComponent(sheenColor) <= 0.0) {
    return vec3f(0.0);
  }

  let alpha = max(sheenRoughness * sheenRoughness, 0.0001);
  let inverseAlpha = 1.0 / alpha;
  let sineSquared = max(1.0 - pbrInfo.NdotH * pbrInfo.NdotH, 0.0);
  let distribution = (2.0 + inverseAlpha) * pow(sineSquared, inverseAlpha * 0.5) /
    (2.0 * M_PI);
  let visibility = 1.0 / max(
    4.0 * (pbrInfo.NdotL + pbrInfo.NdotV - pbrInfo.NdotL * pbrInfo.NdotV),
    0.0001
  );
  return pbrInfo.NdotL * lightColor * sheenColor * distribution * visibility *
    (1.0 - pbrInfo.metalness);
}

fn calculateAnisotropicLightColor(
  pbrInfo: PBRInfo,
  lightColor: vec3f,
  anisotropyTangent: vec3f,
  anisotropyStrength: f32
) -> vec3f {
  if (anisotropyStrength <= 0.0) {
    return calculateFinalColor(pbrInfo, lightColor);
  }

  let anisotropyBitangent = normalize(cross(pbrInfo.n, anisotropyTangent));
  let tangentRoughness = mix(
    pbrInfo.alphaRoughness,
    1.0,
    anisotropyStrength * anisotropyStrength
  );
  let bitangentRoughness = clamp(pbrInfo.alphaRoughness, 0.001, 1.0);
  let roughnessProduct = tangentRoughness * bitangentRoughness;
  let distributionVector = vec3f(
    bitangentRoughness * dot(anisotropyTangent, pbrInfo.h),
    tangentRoughness * dot(anisotropyBitangent, pbrInfo.h),
    roughnessProduct * pbrInfo.NdotH
  );
  let distributionFactor = roughnessProduct /
    max(dot(distributionVector, distributionVector), 0.000001);
  let distribution = roughnessProduct * distributionFactor * distributionFactor / M_PI;
  let viewMask = pbrInfo.NdotL * length(vec3f(
    tangentRoughness * dot(anisotropyTangent, pbrInfo.v),
    bitangentRoughness * dot(anisotropyBitangent, pbrInfo.v),
    pbrInfo.NdotV
  ));
  let lightMask = pbrInfo.NdotV * length(vec3f(
    tangentRoughness * dot(anisotropyTangent, pbrInfo.l),
    bitangentRoughness * dot(anisotropyBitangent, pbrInfo.l),
    pbrInfo.NdotL
  ));
  let visibility = clamp(0.5 / max(viewMask + lightMask, 0.000001), 0.0, 1.0);
  let fresnel = specularReflection(pbrInfo);
  let diffuseContribution = (vec3f(1.0) - fresnel) * diffuse(pbrInfo);
  return pbrInfo.NdotL * lightColor *
    (diffuseContribution + fresnel * distribution * visibility);
}

fn getAnisotropicReflection(
  pbrInfo: PBRInfo,
  anisotropyTangent: vec3f,
  anisotropyStrength: f32
) -> vec3f {
  if (anisotropyStrength <= 0.0) {
    return -normalize(reflect(pbrInfo.v, pbrInfo.n));
  }
  let anisotropyBitangent = normalize(cross(pbrInfo.n, anisotropyTangent));
  var anisotropicNormal = normalize(cross(anisotropyBitangent, pbrInfo.v));
  anisotropicNormal = normalize(cross(anisotropicNormal, anisotropyBitangent));
  let bend = anisotropyStrength * (1.0 - pbrInfo.perceptualRoughness);
  return -normalize(reflect(pbrInfo.v, normalize(mix(pbrInfo.n, anisotropicNormal, bend))));
}

fn calculateMaterialLightColor(
  pbrInfo: PBRInfo,
  lightColor: vec3f,
  clearcoatNormal: vec3f,
  clearcoatFactor: f32,
  clearcoatRoughness: f32,
  sheenColor: vec3f,
  sheenRoughness: f32,
  anisotropyTangent: vec3f,
  anisotropyStrength: f32
) -> vec3f {
  var color = calculateAnisotropicLightColor(
    pbrInfo,
    lightColor,
    anisotropyTangent,
    anisotropyStrength
  );
  color += calculateClearcoatContribution(
    pbrInfo,
    lightColor,
    clearcoatNormal,
    clearcoatFactor,
    clearcoatRoughness
  );
  color += calculateSheenContribution(pbrInfo, lightColor, sheenColor, sheenRoughness);
  return color;
}

fn PBRInfo_setAmbientLight(pbrInfo: ptr<function, PBRInfo>) {
  (*pbrInfo).NdotL = 1.0;
  (*pbrInfo).NdotH = 0.0;
  (*pbrInfo).LdotH = 0.0;
  (*pbrInfo).VdotH = 1.0;
  (*pbrInfo).l = (*pbrInfo).n;
  (*pbrInfo).h = (*pbrInfo).n;
}

fn PBRInfo_setDirectionalLight(pbrInfo: ptr<function, PBRInfo>, lightDirection: vec3<f32>) {
  let n = (*pbrInfo).n;
  let v = (*pbrInfo).v;
  let l = normalize(lightDirection);             // Vector from surface point to light
  let h = normalize(l + v);                      // Half vector between both l and v

  (*pbrInfo).NdotL = clamp(dot(n, l), 0.001, 1.0);
  (*pbrInfo).NdotH = clamp(dot(n, h), 0.0, 1.0);
  (*pbrInfo).LdotH = clamp(dot(l, h), 0.0, 1.0);
  (*pbrInfo).VdotH = clamp(dot(v, h), 0.0, 1.0);
  (*pbrInfo).l = l;
  (*pbrInfo).h = h;
}

fn PBRInfo_setPointLight(pbrInfo: ptr<function, PBRInfo>, pointLight: PointLight) {
  let light_direction = normalize(pointLight.position - fragmentInputs.pbr_vPosition);
  PBRInfo_setDirectionalLight(pbrInfo, light_direction);
}

fn PBRInfo_setSpotLight(pbrInfo: ptr<function, PBRInfo>, spotLight: SpotLight) {
  let light_direction = normalize(spotLight.position - fragmentInputs.pbr_vPosition);
  PBRInfo_setDirectionalLight(pbrInfo, light_direction);
}

fn calculateFinalColor(pbrInfo: PBRInfo, lightColor: vec3<f32>) -> vec3<f32> {
  // Calculate the shading terms for the microfacet specular shading model
  let F = specularReflection(pbrInfo);
  let G = geometricOcclusion(pbrInfo);
  let D = microfacetDistribution(pbrInfo);

  // Calculation of analytical lighting contribution
  let diffuseContrib = (1.0 - F) * diffuse(pbrInfo);
  let specContrib = F * G * D / (4.0 * pbrInfo.NdotL * pbrInfo.NdotV);
  // Obtain final intensity as reflectance (BRDF) scaled by the energy of the light (cosine law)
  return pbrInfo.NdotL * lightColor * (diffuseContrib + specContrib);
}

fn pbr_filterColor(vertexColor: vec4<f32>) -> vec4<f32> {
  let baseColorUV = getMaterialUV(pbrMaterial.baseColorUVSet, pbrMaterial.baseColorUVTransform);
  let metallicRoughnessUV = getMaterialUV(
    pbrMaterial.metallicRoughnessUVSet,
    pbrMaterial.metallicRoughnessUVTransform
  );
  let normalUV = getMaterialUV(pbrMaterial.normalUVSet, pbrMaterial.normalUVTransform);
  let occlusionUV = getMaterialUV(pbrMaterial.occlusionUVSet, pbrMaterial.occlusionUVTransform);
  let emissiveUV = getMaterialUV(pbrMaterial.emissiveUVSet, pbrMaterial.emissiveUVTransform);
  let specularColorUV = getMaterialUV(
    pbrMaterial.specularColorUVSet,
    pbrMaterial.specularColorUVTransform
  );
  let specularIntensityUV = getMaterialUV(
    pbrMaterial.specularIntensityUVSet,
    pbrMaterial.specularIntensityUVTransform
  );
  let transmissionUV = getMaterialUV(
    pbrMaterial.transmissionUVSet,
    pbrMaterial.transmissionUVTransform
  );
  let thicknessUV = getMaterialUV(pbrMaterial.thicknessUVSet, pbrMaterial.thicknessUVTransform);
  let clearcoatUV = getMaterialUV(pbrMaterial.clearcoatUVSet, pbrMaterial.clearcoatUVTransform);
  let clearcoatRoughnessUV = getMaterialUV(
    pbrMaterial.clearcoatRoughnessUVSet,
    pbrMaterial.clearcoatRoughnessUVTransform
  );
  let clearcoatNormalUV = getMaterialUV(
    pbrMaterial.clearcoatNormalUVSet,
    pbrMaterial.clearcoatNormalUVTransform
  );
  let sheenColorUV = getMaterialUV(
    pbrMaterial.sheenColorUVSet,
    pbrMaterial.sheenColorUVTransform
  );
  let sheenRoughnessUV = getMaterialUV(
    pbrMaterial.sheenRoughnessUVSet,
    pbrMaterial.sheenRoughnessUVTransform
  );
  let iridescenceUV = getMaterialUV(
    pbrMaterial.iridescenceUVSet,
    pbrMaterial.iridescenceUVTransform
  );
  let iridescenceThicknessUV = getMaterialUV(
    pbrMaterial.iridescenceThicknessUVSet,
    pbrMaterial.iridescenceThicknessUVTransform
  );
  let anisotropyUV = getMaterialUV(
    pbrMaterial.anisotropyUVSet,
    pbrMaterial.anisotropyUVTransform
  );
  let diffuseTransmissionUV = getMaterialUV(
    pbrMaterial.diffuseTransmissionUVSet,
    pbrMaterial.diffuseTransmissionUVTransform
  );
  let diffuseTransmissionColorUV = getMaterialUV(
    pbrMaterial.diffuseTransmissionColorUVSet,
    pbrMaterial.diffuseTransmissionColorUVTransform
  );
  let multiscatterColorUV = getMaterialUV(
    pbrMaterial.multiscatterColorUVSet,
    pbrMaterial.multiscatterColorUVTransform
  );

  // The albedo may be defined from a base texture or a flat color
  var baseColor: vec4<f32> = pbrMaterial.baseColorFactor * vertexColor;
  #ifdef HAS_BASECOLORMAP
  baseColor = SRGBtoLINEAR(
    textureSample(pbr_baseColorSampler, pbr_baseColorSamplerSampler, baseColorUV)
  ) * pbrMaterial.baseColorFactor * vertexColor;
  #endif

  #ifdef ALPHA_CUTOFF
  if (baseColor.a < pbrMaterial.alphaCutoff) {
    discard;
  }
  #endif

  var color = vec3<f32>(0.0, 0.0, 0.0);
  var transmission = 0.0;

  if (pbrMaterial.unlit != 0u) {
    color = baseColor.rgb;
  } else {
    // Metallic and Roughness material properties are packed together
    // In glTF, these factors can be specified by fixed scalar values
    // or from a metallic-roughness map
    var perceptualRoughness = pbrMaterial.metallicRoughnessValues.y;
    var metallic = pbrMaterial.metallicRoughnessValues.x;
    #ifdef HAS_METALROUGHNESSMAP
    // Roughness is stored in the 'g' channel, metallic is stored in the 'b' channel.
    // This layout intentionally reserves the 'r' channel for (optional) occlusion map data
    let mrSample = textureSample(
      pbr_metallicRoughnessSampler,
      pbr_metallicRoughnessSamplerSampler,
      metallicRoughnessUV
    );
    perceptualRoughness = mrSample.g * perceptualRoughness;
    metallic = mrSample.b * metallic;
    #endif
    perceptualRoughness = clamp(perceptualRoughness, c_MinRoughness, 1.0);
    metallic = clamp(metallic, 0.0, 1.0);
    let tbn = getTBN(normalUV);
    let n = getNormal(tbn, normalUV);                          // normal at surface point
    perceptualRoughness = widenSpecularRoughness(perceptualRoughness, n);
    let v = normalize(pbrProjection.camera - fragmentInputs.pbr_vPosition);  // Vector from surface point to camera
    let NdotV = clamp(abs(dot(n, v)), 0.001, 1.0);
    var useExtendedPBR = false;
    #ifdef USE_MATERIAL_EXTENSIONS
    useExtendedPBR =
      pbrMaterial.specularColorMapEnabled != 0 ||
      pbrMaterial.specularIntensityMapEnabled != 0 ||
      abs(pbrMaterial.specularIntensityFactor - 1.0) > 0.0001 ||
      maxComponent(abs(pbrMaterial.specularColorFactor - vec3f(1.0))) > 0.0001 ||
      abs(pbrMaterial.ior - 1.5) > 0.0001 ||
      pbrMaterial.dispersion > 0.0001 ||
      pbrMaterial.transmissionMapEnabled != 0 ||
      pbrMaterial.transmissionFactor > 0.0001 ||
      pbrMaterial.diffuseTransmissionMapEnabled != 0 ||
      pbrMaterial.diffuseTransmissionColorMapEnabled != 0 ||
      pbrMaterial.diffuseTransmissionFactor > 0.0001 ||
      pbrMaterial.multiscatterColorMapEnabled != 0 ||
      maxComponent(pbrMaterial.multiscatterColorFactor) > 0.0001 ||
      pbrMaterial.clearcoatMapEnabled != 0 ||
      pbrMaterial.clearcoatRoughnessMapEnabled != 0 ||
      pbrMaterial.clearcoatFactor > 0.0001 ||
      pbrMaterial.clearcoatRoughnessFactor > 0.0001 ||
      pbrMaterial.sheenColorMapEnabled != 0 ||
      pbrMaterial.sheenRoughnessMapEnabled != 0 ||
      maxComponent(pbrMaterial.sheenColorFactor) > 0.0001 ||
      pbrMaterial.sheenRoughnessFactor > 0.0001 ||
      pbrMaterial.iridescenceMapEnabled != 0 ||
      pbrMaterial.iridescenceFactor > 0.0001 ||
      abs(pbrMaterial.iridescenceIor - 1.3) > 0.0001 ||
      abs(pbrMaterial.iridescenceThicknessRange.x - 100.0) > 0.0001 ||
      abs(pbrMaterial.iridescenceThicknessRange.y - 400.0) > 0.0001 ||
      pbrMaterial.anisotropyMapEnabled != 0 ||
      pbrMaterial.anisotropyStrength > 0.0001 ||
      abs(pbrMaterial.anisotropyRotation) > 0.0001 ||
      length(pbrMaterial.anisotropyDirection - vec2f(1.0, 0.0)) > 0.0001;
    #endif

    if (!useExtendedPBR) {
      let alphaRoughness = perceptualRoughness * perceptualRoughness;

      let f0 = vec3<f32>(0.04);
      var diffuseColor = baseColor.rgb * (vec3<f32>(1.0) - f0);
      diffuseColor *= 1.0 - metallic;
      let specularColor = mix(f0, baseColor.rgb, metallic);

      let reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);
      let reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
      let specularEnvironmentR0 = specularColor;
      let specularEnvironmentR90 = vec3<f32>(1.0, 1.0, 1.0) * reflectance90;
      let reflection = -normalize(reflect(v, n));

      var pbrInfo = PBRInfo(
        0.0, // NdotL
        NdotV,
        0.0, // NdotH
        0.0, // LdotH
        0.0, // VdotH
        perceptualRoughness,
        metallic,
        specularEnvironmentR0,
        specularEnvironmentR90,
        alphaRoughness,
        diffuseColor,
        specularColor,
        n,
        v,
        n,
        n
      );

      #ifdef USE_LIGHTS
      PBRInfo_setAmbientLight(&pbrInfo);
      color += calculateFinalColor(pbrInfo, lighting.ambientColor);

      for (var i = 0; i < lighting.directionalLightCount; i++) {
        if (i < lighting.directionalLightCount) {
          PBRInfo_setDirectionalLight(&pbrInfo, lighting_getDirectionalLight(i).direction);
          color += calculateFinalColor(pbrInfo, lighting_getDirectionalLight(i).color);
        }
      }

      for (var i = 0; i < lighting.pointLightCount; i++) {
        if (i < lighting.pointLightCount) {
          PBRInfo_setPointLight(&pbrInfo, lighting_getPointLight(i));
          let attenuation = getPointLightAttenuation(
            lighting_getPointLight(i),
            distance(lighting_getPointLight(i).position, fragmentInputs.pbr_vPosition)
          );
          color += calculateFinalColor(pbrInfo, lighting_getPointLight(i).color / attenuation);
        }
      }

      for (var i = 0; i < lighting.spotLightCount; i++) {
        if (i < lighting.spotLightCount) {
          PBRInfo_setSpotLight(&pbrInfo, lighting_getSpotLight(i));
          let attenuation = getSpotLightAttenuation(
            lighting_getSpotLight(i),
            fragmentInputs.pbr_vPosition
          );
          color += calculateFinalColor(pbrInfo, lighting_getSpotLight(i).color / attenuation);
        }
      }
      #endif

      #ifdef USE_IBL
      if (pbrMaterial.IBLenabled != 0) {
        color += getIBLContribution(pbrInfo, n, reflection);
      }
      #endif

      #ifdef HAS_OCCLUSIONMAP
      if (pbrMaterial.occlusionMapEnabled != 0) {
        let ao = textureSample(pbr_occlusionSampler, pbr_occlusionSamplerSampler, occlusionUV).r;
        color = mix(color, color * ao, pbrMaterial.occlusionStrength);
      }
      #endif

      var emissive = pbrMaterial.emissiveFactor;
      #ifdef HAS_EMISSIVEMAP
      if (pbrMaterial.emissiveMapEnabled != 0u) {
        emissive *= SRGBtoLINEAR(
          textureSample(pbr_emissiveSampler, pbr_emissiveSamplerSampler, emissiveUV)
        ).rgb;
      }
      #endif
      color += emissive * pbrMaterial.emissiveStrength;

      #ifdef PBR_DEBUG
      color = mix(color, baseColor.rgb, pbrMaterial.scaleDiffBaseMR.y);
      color = mix(color, vec3<f32>(metallic), pbrMaterial.scaleDiffBaseMR.z);
      color = mix(color, vec3<f32>(perceptualRoughness), pbrMaterial.scaleDiffBaseMR.w);
      #endif

      return vec4<f32>(applySceneColorManagement(color), baseColor.a);
    }

    var specularIntensity = pbrMaterial.specularIntensityFactor;
    #ifdef HAS_SPECULARINTENSITYMAP
    if (pbrMaterial.specularIntensityMapEnabled != 0) {
      specularIntensity *= textureSample(
        pbr_specularIntensitySampler,
        pbr_specularIntensitySamplerSampler,
        specularIntensityUV
      ).a;
    }
    #endif

    var specularFactor = pbrMaterial.specularColorFactor;
    #ifdef HAS_SPECULARCOLORMAP
    if (pbrMaterial.specularColorMapEnabled != 0) {
      specularFactor *= SRGBtoLINEAR(
        textureSample(
          pbr_specularColorSampler,
          pbr_specularColorSamplerSampler,
          specularColorUV
        )
      ).rgb;
    }
    #endif

    transmission = pbrMaterial.transmissionFactor;
    #ifdef HAS_TRANSMISSIONMAP
    if (pbrMaterial.transmissionMapEnabled != 0) {
      transmission *= textureSample(
        pbr_transmissionSampler,
        pbr_transmissionSamplerSampler,
        transmissionUV
      ).r;
    }
    #endif
    transmission = clamp(transmission * (1.0 - metallic), 0.0, 1.0);
    var thickness = max(pbrMaterial.thicknessFactor, 0.0);
    #ifdef HAS_THICKNESSMAP
    thickness *= textureSample(
      pbr_thicknessSampler,
      pbr_thicknessSamplerSampler,
      thicknessUV
    ).g;
    #endif

    var diffuseTransmission = clamp(pbrMaterial.diffuseTransmissionFactor, 0.0, 1.0);
    #ifdef HAS_DIFFUSETRANSMISSIONMAP
    if (pbrMaterial.diffuseTransmissionMapEnabled != 0) {
      diffuseTransmission *= textureSample(
        pbr_diffuseTransmissionSampler,
        pbr_diffuseTransmissionSamplerSampler,
        diffuseTransmissionUV
      ).a;
    }
    #endif
    diffuseTransmission *= (1.0 - metallic) * (1.0 - transmission);
    var diffuseTransmissionColor = pbrMaterial.diffuseTransmissionColorFactor;
    #ifdef HAS_DIFFUSETRANSMISSIONCOLORMAP
    if (pbrMaterial.diffuseTransmissionColorMapEnabled != 0) {
      diffuseTransmissionColor *= SRGBtoLINEAR(
        textureSample(
          pbr_diffuseTransmissionColorSampler,
          pbr_diffuseTransmissionColorSamplerSampler,
          diffuseTransmissionColorUV
        )
      ).rgb;
    }
    #endif
    var multiscatterColor = pbrMaterial.multiscatterColorFactor;
    #ifdef HAS_MULTISCATTERCOLORMAP
    if (pbrMaterial.multiscatterColorMapEnabled != 0) {
      multiscatterColor *= SRGBtoLINEAR(
        textureSample(
          pbr_multiscatterColorSampler,
          pbr_multiscatterColorSamplerSampler,
          multiscatterColorUV
        )
      ).rgb;
    }
    #endif

    var clearcoatFactor = pbrMaterial.clearcoatFactor;
    var clearcoatRoughness = pbrMaterial.clearcoatRoughnessFactor;
    #ifdef HAS_CLEARCOATMAP
    if (pbrMaterial.clearcoatMapEnabled != 0) {
      clearcoatFactor *= textureSample(
        pbr_clearcoatSampler,
        pbr_clearcoatSamplerSampler,
        clearcoatUV
      ).r;
    }
    #endif
    #ifdef HAS_CLEARCOATROUGHNESSMAP
    if (pbrMaterial.clearcoatRoughnessMapEnabled != 0) {
      clearcoatRoughness *= textureSample(
        pbr_clearcoatRoughnessSampler,
        pbr_clearcoatRoughnessSamplerSampler,
        clearcoatRoughnessUV
      ).g;
    }
    #endif
    clearcoatFactor = clamp(clearcoatFactor, 0.0, 1.0);
    clearcoatRoughness = clamp(clearcoatRoughness, c_MinRoughness, 1.0);
    let clearcoatNormal = getClearcoatNormal(getTBN(clearcoatNormalUV), n, clearcoatNormalUV);
    clearcoatRoughness = widenSpecularRoughness(clearcoatRoughness, clearcoatNormal);

    var sheenColor = pbrMaterial.sheenColorFactor;
    var sheenRoughness = pbrMaterial.sheenRoughnessFactor;
    #ifdef HAS_SHEENCOLORMAP
    if (pbrMaterial.sheenColorMapEnabled != 0) {
      sheenColor *= SRGBtoLINEAR(
        textureSample(
          pbr_sheenColorSampler,
          pbr_sheenColorSamplerSampler,
          sheenColorUV
        )
      ).rgb;
    }
    #endif
    #ifdef HAS_SHEENROUGHNESSMAP
    if (pbrMaterial.sheenRoughnessMapEnabled != 0) {
      sheenRoughness *= textureSample(
        pbr_sheenRoughnessSampler,
        pbr_sheenRoughnessSamplerSampler,
        sheenRoughnessUV
      ).a;
    }
    #endif
    sheenRoughness = clamp(sheenRoughness, c_MinRoughness, 1.0);

    var iridescence = pbrMaterial.iridescenceFactor;
    #ifdef HAS_IRIDESCENCEMAP
    if (pbrMaterial.iridescenceMapEnabled != 0) {
      iridescence *= textureSample(
        pbr_iridescenceSampler,
        pbr_iridescenceSamplerSampler,
        iridescenceUV
      ).r;
    }
    #endif
    iridescence = clamp(iridescence, 0.0, 1.0);
    var iridescenceThickness = mix(
      pbrMaterial.iridescenceThicknessRange.x,
      pbrMaterial.iridescenceThicknessRange.y,
      0.5
    );
    #ifdef HAS_IRIDESCENCETHICKNESSMAP
    iridescenceThickness = mix(
      pbrMaterial.iridescenceThicknessRange.x,
      pbrMaterial.iridescenceThicknessRange.y,
      textureSample(
        pbr_iridescenceThicknessSampler,
        pbr_iridescenceThicknessSamplerSampler,
        iridescenceThicknessUV
      ).g
    );
    #endif

    var anisotropyStrength = clamp(pbrMaterial.anisotropyStrength, 0.0, 1.0);
    var anisotropyDirection = normalizeDirection(pbrMaterial.anisotropyDirection);
    #ifdef HAS_ANISOTROPYMAP
    if (pbrMaterial.anisotropyMapEnabled != 0) {
      let anisotropySample = textureSample(
        pbr_anisotropySampler,
        pbr_anisotropySamplerSampler,
        anisotropyUV
      ).rgb;
      anisotropyStrength *= anisotropySample.b;
      let mappedDirection = anisotropySample.rg * 2.0 - 1.0;
      if (length(mappedDirection) > 0.0001) {
        anisotropyDirection = normalize(mappedDirection);
      }
    }
    #endif
    anisotropyDirection = rotateDirection(anisotropyDirection, pbrMaterial.anisotropyRotation);
    var anisotropyTangent =
      normalize(tbn[0] * anisotropyDirection.x + tbn[1] * anisotropyDirection.y);
    if (length(anisotropyTangent) < 0.0001) {
      anisotropyTangent = normalize(tbn[0]);
    }
    // Roughness is authored as perceptual roughness; as is convention,
    // convert to material roughness by squaring the perceptual roughness [2].
    let alphaRoughness = perceptualRoughness * perceptualRoughness;

    let dielectricF0 = getDielectricF0(pbrMaterial.ior);
    var dielectricSpecularF0 = min(
      vec3f(dielectricF0) * specularFactor * specularIntensity,
      vec3f(1.0)
    );
    dielectricSpecularF0 = getIridescenceTint(
      iridescence,
      iridescenceThickness,
      NdotV,
      dielectricSpecularF0
    );
    var diffuseColor = baseColor.rgb * (vec3f(1.0) - dielectricSpecularF0);
    diffuseColor *= (1.0 - metallic) * (1.0 - transmission) * (1.0 - diffuseTransmission);
    var specularColor = mix(dielectricSpecularF0, baseColor.rgb, metallic);

    let clearcoatViewFresnel = dielectricSchlick(
      0.04,
      clamp(abs(dot(clearcoatNormal, v)), 0.0, 1.0)
    );
    let sheenDirectionalAlbedo = maxComponent(sheenColor) *
      (0.157 + 0.343 * (1.0 - NdotV)) * (1.0 - sheenRoughness * 0.5);
    let baseLayerEnergy = (1.0 - clearcoatFactor * clearcoatViewFresnel) *
      (1.0 - clamp(sheenDirectionalAlbedo, 0.0, 1.0));
    diffuseColor *= baseLayerEnergy;
    specularColor *= baseLayerEnergy;

    // Compute reflectance.
    let reflectance = max(max(specularColor.r, specularColor.g), specularColor.b);

    // For typical incident reflectance range (between 4% to 100%) set the grazing
    // reflectance to 100% for typical fresnel effect.
    // For very low reflectance range on highly diffuse objects (below 4%),
    // incrementally reduce grazing reflectance to 0%.
    let reflectance90 = clamp(reflectance * 25.0, 0.0, 1.0);
    let specularEnvironmentR0 = specularColor;
    let specularEnvironmentR90 = vec3<f32>(1.0, 1.0, 1.0) * reflectance90;
    let reflection = -normalize(reflect(v, n));

    var pbrInfo = PBRInfo(
      0.0, // NdotL
      NdotV,
      0.0, // NdotH
      0.0, // LdotH
      0.0, // VdotH
      perceptualRoughness,
      metallic,
      specularEnvironmentR0,
      specularEnvironmentR90,
      alphaRoughness,
      diffuseColor,
      specularColor,
      n,
      v,
      n,
      n
    );

    #ifdef USE_LIGHTS
    // Apply ambient light
    PBRInfo_setAmbientLight(&pbrInfo);
    color += calculateMaterialLightColor(
      pbrInfo,
      lighting.ambientColor,
      clearcoatNormal,
      clearcoatFactor,
      clearcoatRoughness,
      sheenColor,
      sheenRoughness,
      anisotropyTangent,
      anisotropyStrength
    );

    // Apply directional light
    for (var i = 0; i < lighting.directionalLightCount; i++) {
      if (i < lighting.directionalLightCount) {
        PBRInfo_setDirectionalLight(&pbrInfo, lighting_getDirectionalLight(i).direction);
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getDirectionalLight(i).color,
          clearcoatNormal,
          clearcoatFactor,
          clearcoatRoughness,
          sheenColor,
          sheenRoughness,
          anisotropyTangent,
          anisotropyStrength
        );
        color += calculateDiffuseTransmissionLight(
          pbrInfo,
          lighting_getDirectionalLight(i).color,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }

    // Apply point light
    for (var i = 0; i < lighting.pointLightCount; i++) {
      if (i < lighting.pointLightCount) {
        PBRInfo_setPointLight(&pbrInfo, lighting_getPointLight(i));
        let attenuation = getPointLightAttenuation(
          lighting_getPointLight(i),
          distance(lighting_getPointLight(i).position, fragmentInputs.pbr_vPosition)
        );
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getPointLight(i).color / attenuation,
          clearcoatNormal,
          clearcoatFactor,
          clearcoatRoughness,
          sheenColor,
          sheenRoughness,
          anisotropyTangent,
          anisotropyStrength
        );
        color += calculateDiffuseTransmissionLight(
          pbrInfo,
          lighting_getPointLight(i).color / attenuation,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }

    for (var i = 0; i < lighting.spotLightCount; i++) {
      if (i < lighting.spotLightCount) {
        PBRInfo_setSpotLight(&pbrInfo, lighting_getSpotLight(i));
        let attenuation = getSpotLightAttenuation(lighting_getSpotLight(i), fragmentInputs.pbr_vPosition);
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getSpotLight(i).color / attenuation,
          clearcoatNormal,
          clearcoatFactor,
          clearcoatRoughness,
          sheenColor,
          sheenRoughness,
          anisotropyTangent,
          anisotropyStrength
        );
        color += calculateDiffuseTransmissionLight(
          pbrInfo,
          lighting_getSpotLight(i).color / attenuation,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }
    #endif

    // Calculate lighting contribution from image based lighting source (IBL)
    #ifdef USE_IBL
    if (pbrMaterial.IBLenabled != 0) {
      color += getIBLContribution(
        pbrInfo,
        n,
        getAnisotropicReflection(pbrInfo, anisotropyTangent, anisotropyStrength)
      );
      color += calculateClearcoatIBLContribution(
        pbrInfo,
        clearcoatNormal,
        -normalize(reflect(v, clearcoatNormal)),
        clearcoatFactor,
        clearcoatRoughness
      );
      color += calculateDiffuseTransmissionIBL(
        pbrInfo,
        diffuseTransmissionColor,
        diffuseTransmission,
        multiscatterColor,
        thickness
      );
      color += sheenColor * pbrMaterial.scaleIBLAmbient.x * (1.0 - sheenRoughness) * 0.25;
    }
    #endif

    // Apply optional PBR terms for additional (optional) shading
    #ifdef HAS_OCCLUSIONMAP
    if (pbrMaterial.occlusionMapEnabled != 0) {
      let ao = textureSample(pbr_occlusionSampler, pbr_occlusionSamplerSampler, occlusionUV).r;
      color = mix(color, color * ao, pbrMaterial.occlusionStrength);
    }
    #endif

    var emissive = pbrMaterial.emissiveFactor;
    #ifdef HAS_EMISSIVEMAP
    if (pbrMaterial.emissiveMapEnabled != 0u) {
      emissive *= SRGBtoLINEAR(
        textureSample(pbr_emissiveSampler, pbr_emissiveSamplerSampler, emissiveUV)
      ).rgb;
    }
    #endif
    color += emissive * pbrMaterial.emissiveStrength;

    if (transmission > 0.0) {
      #ifdef USE_TRANSMISSION_FRAMEBUFFER
      let dielectricFresnel = getDielectricF0(pbrMaterial.ior);
      let transmissionFresnel = dielectricFresnel +
        (1.0 - dielectricFresnel) * pow(1.0 - NdotV, 5.0);
      let transmittedColor = getTransmittedSceneColor(
        fragmentInputs.pbr_vPosition,
        n,
        v,
        thickness,
        perceptualRoughness
      );
      color += transmittedColor * getVolumeAttenuation(thickness) *
        transmission * (1.0 - transmissionFresnel);
      #else
      color = mix(color, color * getVolumeAttenuation(thickness), transmission);
      #endif
    }

    // This section uses mix to override final color for reference app visualization
    // of various parameters in the lighting equation.
    #ifdef PBR_DEBUG
    // TODO: Figure out how to debug multiple lights

    // color = mix(color, F, pbr_scaleFGDSpec.x);
    // color = mix(color, vec3(G), pbr_scaleFGDSpec.y);
    // color = mix(color, vec3(D), pbr_scaleFGDSpec.z);
    // color = mix(color, specContrib, pbr_scaleFGDSpec.w);

    // color = mix(color, diffuseContrib, pbr_scaleDiffBaseMR.x);
    color = mix(color, baseColor.rgb, pbrMaterial.scaleDiffBaseMR.y);
    color = mix(color, vec3<f32>(metallic), pbrMaterial.scaleDiffBaseMR.z);
    color = mix(color, vec3<f32>(perceptualRoughness), pbrMaterial.scaleDiffBaseMR.w);
    #endif
  }

  #ifdef USE_TRANSMISSION_FRAMEBUFFER
  let alpha = clamp(baseColor.a, 0.0, 1.0);
  #else
  let alpha = clamp(baseColor.a * (1.0 - transmission), 0.0, 1.0);
  #endif
  return vec4<f32>(applySceneColorManagement(color), alpha);
}
`,c=`\
layout(std140) uniform pbrProjectionUniforms {
  mat4 modelViewProjectionMatrix;
  mat4 modelMatrix;
  mat4 normalMatrix;
  vec3 camera;
} pbrProjection;
`,f=`\
struct pbrProjectionUniforms {
  modelViewProjectionMatrix: mat4x4<f32>,
  modelMatrix: mat4x4<f32>,
  normalMatrix: mat4x4<f32>,
  camera: vec3<f32>
};

@group(0) @binding(auto) var<uniform> pbrProjection: pbrProjectionUniforms;
`,u={props:{},uniforms:{},defaultUniforms:{unlit:!1,baseColorMapEnabled:!1,baseColorFactor:[1,1,1,1],normalMapEnabled:!1,normalScale:1,emissiveMapEnabled:!1,emissiveFactor:[0,0,0],metallicRoughnessValues:[1,1],metallicRoughnessMapEnabled:!1,occlusionMapEnabled:!1,occlusionStrength:1,alphaCutoffEnabled:!1,alphaCutoff:.5,IBLenabled:!1,scaleIBLAmbient:[1,1],scaleDiffBaseMR:[0,0,0,0],scaleFGDSpec:[0,0,0,0],specularColorFactor:[1,1,1],specularIntensityFactor:1,specularColorMapEnabled:!1,specularIntensityMapEnabled:!1,ior:1.5,transmissionFactor:0,transmissionMapEnabled:!1,thicknessFactor:0,attenuationDistance:1e9,attenuationColor:[1,1,1],clearcoatFactor:0,clearcoatRoughnessFactor:0,clearcoatMapEnabled:!1,clearcoatRoughnessMapEnabled:!1,sheenColorFactor:[0,0,0],sheenRoughnessFactor:0,sheenColorMapEnabled:!1,sheenRoughnessMapEnabled:!1,iridescenceFactor:0,iridescenceIor:1.3,iridescenceThicknessRange:[100,400],iridescenceMapEnabled:!1,anisotropyStrength:0,anisotropyRotation:0,anisotropyDirection:[1,0],anisotropyMapEnabled:!1,emissiveStrength:1,dispersion:0,baseColorUVSet:0,baseColorUVTransform:[1,0,0,0,1,0,0,0,1],metallicRoughnessUVSet:0,metallicRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],normalUVSet:0,normalUVTransform:[1,0,0,0,1,0,0,0,1],occlusionUVSet:0,occlusionUVTransform:[1,0,0,0,1,0,0,0,1],emissiveUVSet:0,emissiveUVTransform:[1,0,0,0,1,0,0,0,1],specularColorUVSet:0,specularColorUVTransform:[1,0,0,0,1,0,0,0,1],specularIntensityUVSet:0,specularIntensityUVTransform:[1,0,0,0,1,0,0,0,1],transmissionUVSet:0,transmissionUVTransform:[1,0,0,0,1,0,0,0,1],thicknessUVSet:0,thicknessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatUVSet:0,clearcoatUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatRoughnessUVSet:0,clearcoatRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatNormalUVSet:0,clearcoatNormalUVTransform:[1,0,0,0,1,0,0,0,1],sheenColorUVSet:0,sheenColorUVTransform:[1,0,0,0,1,0,0,0,1],sheenRoughnessUVSet:0,sheenRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceUVSet:0,iridescenceUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceThicknessUVSet:0,iridescenceThicknessUVTransform:[1,0,0,0,1,0,0,0,1],anisotropyUVSet:0,anisotropyUVTransform:[1,0,0,0,1,0,0,0,1],bumpFactor:1,bumpMapEnabled:!1,diffuseTransmissionFactor:0,diffuseTransmissionMapEnabled:!1,diffuseTransmissionColorFactor:[1,1,1],diffuseTransmissionColorMapEnabled:!1,multiscatterColorFactor:[0,0,0],multiscatterColorMapEnabled:!1,scatterAnisotropy:0,bumpUVSet:0,bumpUVTransform:[1,0,0,0,1,0,0,0,1],diffuseTransmissionUVSet:0,diffuseTransmissionUVTransform:[1,0,0,0,1,0,0,0,1],diffuseTransmissionColorUVSet:0,diffuseTransmissionColorUVTransform:[1,0,0,0,1,0,0,0,1],multiscatterColorUVSet:0,multiscatterColorUVTransform:[1,0,0,0,1,0,0,0,1]},name:"pbrMaterial",firstBindingSlot:0,bindingLayout:[{name:"pbrMaterial",group:3},{name:"pbr_baseColorSampler",group:3},{name:"pbr_normalSampler",group:3},{name:"pbr_emissiveSampler",group:3},{name:"pbr_metallicRoughnessSampler",group:3},{name:"pbr_occlusionSampler",group:3},{name:"pbr_specularColorSampler",group:3},{name:"pbr_specularIntensitySampler",group:3},{name:"pbr_transmissionSampler",group:3},{name:"pbr_thicknessSampler",group:3},{name:"pbr_clearcoatSampler",group:3},{name:"pbr_clearcoatRoughnessSampler",group:3},{name:"pbr_clearcoatNormalSampler",group:3},{name:"pbr_sheenColorSampler",group:3},{name:"pbr_sheenRoughnessSampler",group:3},{name:"pbr_iridescenceSampler",group:3},{name:"pbr_iridescenceThicknessSampler",group:3},{name:"pbr_anisotropySampler",group:3},{name:"pbr_bumpSampler",group:3},{name:"pbr_diffuseTransmissionSampler",group:3},{name:"pbr_diffuseTransmissionColorSampler",group:3},{name:"pbr_multiscatterColorSampler",group:3}],dependencies:[a.x,{name:"ibl",firstBindingSlot:32,bindingLayout:[{name:"pbr_diffuseEnvSampler",group:2},{name:"pbr_specularEnvSampler",group:2},{name:"pbr_brdfLUT",group:2}],source:n,vs:i,fs:i},{name:"pbrProjection",bindingLayout:[{name:"pbrProjection",group:0}],source:f,vs:c,fs:c,getUniforms:e=>e,uniformTypes:{modelViewProjectionMatrix:"mat4x4<f32>",modelMatrix:"mat4x4<f32>",normalMatrix:"mat4x4<f32>",camera:"vec3<f32>"}}],source:l,vs:o,fs:s,defines:{LIGHTING_FRAGMENT:!0,HAS_NORMALMAP:!1,HAS_EMISSIVEMAP:!1,HAS_OCCLUSIONMAP:!1,HAS_BASECOLORMAP:!1,HAS_METALROUGHNESSMAP:!1,HAS_SPECULARCOLORMAP:!1,HAS_SPECULARINTENSITYMAP:!1,HAS_TRANSMISSIONMAP:!1,HAS_THICKNESSMAP:!1,HAS_CLEARCOATMAP:!1,HAS_CLEARCOATROUGHNESSMAP:!1,HAS_CLEARCOATNORMALMAP:!1,HAS_SHEENCOLORMAP:!1,HAS_SHEENROUGHNESSMAP:!1,HAS_IRIDESCENCEMAP:!1,HAS_IRIDESCENCETHICKNESSMAP:!1,HAS_ANISOTROPYMAP:!1,HAS_BUMPMAP:!1,HAS_DIFFUSETRANSMISSIONMAP:!1,HAS_DIFFUSETRANSMISSIONCOLORMAP:!1,HAS_MULTISCATTERCOLORMAP:!1,USE_MATERIAL_EXTENSIONS:!1,ALPHA_CUTOFF:!1,USE_IBL:!1,PBR_DEBUG:!1},getUniforms:e=>e,uniformTypes:{unlit:"i32",baseColorMapEnabled:"i32",baseColorFactor:"vec4<f32>",normalMapEnabled:"i32",normalScale:"f32",emissiveMapEnabled:"i32",emissiveFactor:"vec3<f32>",metallicRoughnessValues:"vec2<f32>",metallicRoughnessMapEnabled:"i32",occlusionMapEnabled:"i32",occlusionStrength:"f32",alphaCutoffEnabled:"i32",alphaCutoff:"f32",specularColorFactor:"vec3<f32>",specularIntensityFactor:"f32",specularColorMapEnabled:"i32",specularIntensityMapEnabled:"i32",ior:"f32",transmissionFactor:"f32",transmissionMapEnabled:"i32",thicknessFactor:"f32",attenuationDistance:"f32",attenuationColor:"vec3<f32>",clearcoatFactor:"f32",clearcoatRoughnessFactor:"f32",clearcoatMapEnabled:"i32",clearcoatRoughnessMapEnabled:"i32",sheenColorFactor:"vec3<f32>",sheenRoughnessFactor:"f32",sheenColorMapEnabled:"i32",sheenRoughnessMapEnabled:"i32",iridescenceFactor:"f32",iridescenceIor:"f32",iridescenceThicknessRange:"vec2<f32>",iridescenceMapEnabled:"i32",anisotropyStrength:"f32",anisotropyRotation:"f32",anisotropyDirection:"vec2<f32>",anisotropyMapEnabled:"i32",emissiveStrength:"f32",dispersion:"f32",IBLenabled:"i32",scaleIBLAmbient:"vec2<f32>",scaleDiffBaseMR:"vec4<f32>",scaleFGDSpec:"vec4<f32>",baseColorUVSet:"i32",baseColorUVTransform:"mat3x3<f32>",metallicRoughnessUVSet:"i32",metallicRoughnessUVTransform:"mat3x3<f32>",normalUVSet:"i32",normalUVTransform:"mat3x3<f32>",occlusionUVSet:"i32",occlusionUVTransform:"mat3x3<f32>",emissiveUVSet:"i32",emissiveUVTransform:"mat3x3<f32>",specularColorUVSet:"i32",specularColorUVTransform:"mat3x3<f32>",specularIntensityUVSet:"i32",specularIntensityUVTransform:"mat3x3<f32>",transmissionUVSet:"i32",transmissionUVTransform:"mat3x3<f32>",thicknessUVSet:"i32",thicknessUVTransform:"mat3x3<f32>",clearcoatUVSet:"i32",clearcoatUVTransform:"mat3x3<f32>",clearcoatRoughnessUVSet:"i32",clearcoatRoughnessUVTransform:"mat3x3<f32>",clearcoatNormalUVSet:"i32",clearcoatNormalUVTransform:"mat3x3<f32>",sheenColorUVSet:"i32",sheenColorUVTransform:"mat3x3<f32>",sheenRoughnessUVSet:"i32",sheenRoughnessUVTransform:"mat3x3<f32>",iridescenceUVSet:"i32",iridescenceUVTransform:"mat3x3<f32>",iridescenceThicknessUVSet:"i32",iridescenceThicknessUVTransform:"mat3x3<f32>",anisotropyUVSet:"i32",anisotropyUVTransform:"mat3x3<f32>",bumpFactor:"f32",bumpMapEnabled:"i32",diffuseTransmissionFactor:"f32",diffuseTransmissionMapEnabled:"i32",diffuseTransmissionColorFactor:"vec3<f32>",diffuseTransmissionColorMapEnabled:"i32",multiscatterColorFactor:"vec3<f32>",multiscatterColorMapEnabled:"i32",scatterAnisotropy:"f32",bumpUVSet:"i32",bumpUVTransform:"mat3x3<f32>",diffuseTransmissionUVSet:"i32",diffuseTransmissionUVTransform:"mat3x3<f32>",diffuseTransmissionColorUVSet:"i32",diffuseTransmissionColorUVTransform:"mat3x3<f32>",multiscatterColorUVSet:"i32",multiscatterColorUVTransform:"mat3x3<f32>"}}}}]);
//# sourceMappingURL=9736.01fa4f34.js.map