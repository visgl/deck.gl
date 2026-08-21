"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["2092"],{78957(e,t,r){let n;r.d(t,{V:()=>M,x:()=>_});var a=r(51664),i=r(90623),o=r(18236);function s(e,t,r){let n=r?l(r.metadata):void 0;return(0,o.ol)(e,t,n)}function l(e){Object.entries(e);let t={};for(let r in e)t[`${r}.string`]=JSON.stringify(e[r]);return t}let c={POSITION:"POSITION",NORMAL:"NORMAL",COLOR:"COLOR_0",TEX_COORD:"TEXCOORD_0"},u={1:Int8Array,2:Uint8Array,3:Int16Array,4:Uint16Array,5:Int32Array,6:Uint32Array,9:Float32Array};class f{draco;decoder;metadataQuerier;constructor(e){this.draco=e,this.decoder=new this.draco.Decoder,this.metadataQuerier=new this.draco.MetadataQuerier}destroy(){this.draco.destroy(this.decoder),this.draco.destroy(this.metadataQuerier)}parseSync(e,t={}){let r=new this.draco.DecoderBuffer;r.Init(new Int8Array(e),e.byteLength),this._disableAttributeTransforms(t);let n=this.decoder.GetEncodedGeometryType(r),a=n===this.draco.TRIANGULAR_MESH?new this.draco.Mesh:new this.draco.PointCloud;try{let e;switch(n){case this.draco.TRIANGULAR_MESH:e=this.decoder.DecodeBufferToMesh(r,a);break;case this.draco.POINT_CLOUD:e=this.decoder.DecodeBufferToPointCloud(r,a);break;default:throw Error("DRACO: Unknown geometry type.")}if(!e.ok()||!a.ptr){let t=`DRACO decompression failed: ${e.error_msg()}`;throw Error(t)}let o=this._getDracoLoaderData(a,n,t),c=this._getMeshData(a,o,t),u=(0,i.l)(c.attributes),f=function(e,t,r){let n=l(t.metadata),a=[],i=function(e){let t={};for(let r in e){let n=e[r];t[n.name||"undefined"]=n}return t}(t.attributes);for(let t in e){let r=e[t],n=s(t,r,i[t]);a.push(n)}if(r){let e=s("indices",r);a.push(e)}return{fields:a,metadata:n}}(c.attributes,o,c.indices);return{loader:"draco",loaderData:o,header:{vertexCount:a.num_points(),boundingBox:u},...c,schema:f}}finally{this.draco.destroy(r),a&&this.draco.destroy(a)}}_getDracoLoaderData(e,t,r){let n=this._getTopLevelMetadata(e),a=this._getDracoAttributes(e,r);return{geometry_type:t,num_attributes:e.num_attributes(),num_points:e.num_points(),num_faces:e instanceof this.draco.Mesh?e.num_faces():0,metadata:n,attributes:a}}_getDracoAttributes(e,t){let r={};for(let n=0;n<e.num_attributes();n++){let a=this.decoder.GetAttribute(e,n),i=this._getAttributeMetadata(e,n);r[a.unique_id()]={unique_id:a.unique_id(),attribute_type:a.attribute_type(),data_type:a.data_type(),num_components:a.num_components(),byte_offset:a.byte_offset(),byte_stride:a.byte_stride(),normalized:a.normalized(),attribute_index:n,metadata:i};let o=this._getQuantizationTransform(a,t);o&&(r[a.unique_id()].quantization_transform=o);let s=this._getOctahedronTransform(a,t);s&&(r[a.unique_id()].octahedron_transform=s)}return r}_getMeshData(e,t,r){let n=this._getMeshAttributes(t,e,r);if(!n.POSITION)throw Error("DRACO: No position attribute found.");if(e instanceof this.draco.Mesh)if("triangle-strip"===r.topology)return{topology:"triangle-strip",mode:4,attributes:n,indices:{value:this._getTriangleStripIndices(e),size:1}};else return{topology:"triangle-list",mode:5,attributes:n,indices:{value:this._getTriangleListIndices(e),size:1}};return{topology:"point-list",mode:0,attributes:n}}_getMeshAttributes(e,t,r){let n={};for(let a of Object.values(e.attributes)){let e=this._deduceAttributeName(a,r);a.name=e;let i=this._getAttributeValues(t,a);if(i){let{value:t,size:r}=i;n[e]={value:t,size:r,byteOffset:a.byte_offset,byteStride:a.byte_stride,normalized:a.normalized}}}return n}_getTriangleListIndices(e){let t=3*e.num_faces(),r=4*t,n=this.draco._malloc(r);try{return this.decoder.GetTrianglesUInt32Array(e,r,n),new Uint32Array(this.draco.HEAPF32.buffer,n,t).slice()}finally{this.draco._free(n)}}_getTriangleStripIndices(e){let t=new this.draco.DracoInt32Array;try{return this.decoder.GetTriangleStripsFromMesh(e,t),function(e){let t=e.size(),r=new Int32Array(t);for(let n=0;n<t;n++)r[n]=e.GetValue(n);return r}(t)}finally{this.draco.destroy(t)}}_getAttributeValues(e,t){let r,n=u[t.data_type];if(!n)return console.warn(`DRACO: Unsupported attribute type ${t.data_type}`),null;let a=t.num_components,i=e.num_points()*a,o=i*n.BYTES_PER_ELEMENT,s=function(e,t){switch(t){case Float32Array:return e.DT_FLOAT32;case Int8Array:return e.DT_INT8;case Int16Array:return e.DT_INT16;case Int32Array:return e.DT_INT32;case Uint8Array:return e.DT_UINT8;case Uint16Array:return e.DT_UINT16;case Uint32Array:return e.DT_UINT32;default:return e.DT_INVALID}}(this.draco,n),l=this.draco._malloc(o);try{let a=this.decoder.GetAttribute(e,t.attribute_index);this.decoder.GetAttributeDataArrayForAllPoints(e,a,s,o,l),r=new n(this.draco.HEAPF32.buffer,l,i).slice()}finally{this.draco._free(l)}return{value:r,size:a}}_deduceAttributeName(e,t){let r=e.unique_id;for(let[e,n]of Object.entries(t.extraAttributes||{}))if(n===r)return e;let n=e.attribute_type;for(let e in c)if(this.draco[e]===n)return c[e];let a=t.attributeNameEntry||"name";return e.metadata[a]?e.metadata[a].string:`CUSTOM_ATTRIBUTE_${r}`}_getTopLevelMetadata(e){let t=this.decoder.GetMetadata(e);return this._getDracoMetadata(t)}_getAttributeMetadata(e,t){let r=this.decoder.GetAttributeMetadata(e,t);return this._getDracoMetadata(r)}_getDracoMetadata(e){if(!e||!e.ptr)return{};let t={},r=this.metadataQuerier.NumEntries(e);for(let n=0;n<r;n++){let r=this.metadataQuerier.GetEntryName(e,n);t[r]=this._getDracoMetadataField(e,r)}return t}_getDracoMetadataField(e,t){let r=new this.draco.DracoInt32Array;try{this.metadataQuerier.GetIntEntryArray(e,t,r);let n=function(e){let t=e.size(),r=new Int32Array(t);for(let n=0;n<t;n++)r[n]=e.GetValue(n);return r}(r);return{int:this.metadataQuerier.GetIntEntry(e,t),string:this.metadataQuerier.GetStringEntry(e,t),double:this.metadataQuerier.GetDoubleEntry(e,t),intArray:n}}finally{this.draco.destroy(r)}}_disableAttributeTransforms(e){let{quantizedAttributes:t=[],octahedronAttributes:r=[]}=e;for(let e of[...t,...r])this.decoder.SkipAttributeTransform(this.draco[e])}_getQuantizationTransform(e,t){let{quantizedAttributes:r=[]}=t,n=e.attribute_type();if(r.map(e=>this.decoder[e]).includes(n)){let t=new this.draco.AttributeQuantizationTransform;try{if(t.InitFromAttribute(e))return{quantization_bits:t.quantization_bits(),range:t.range(),min_values:new Float32Array([1,2,3]).map(e=>t.min_value(e))}}finally{this.draco.destroy(t)}}return null}_getOctahedronTransform(e,t){let{octahedronAttributes:r=[]}=t,n=e.attribute_type();if(r.map(e=>this.decoder[e]).includes(n)){let t=new this.draco.AttributeQuantizationTransform;try{if(t.InitFromAttribute(e))return{quantization_bits:t.quantization_bits()}}finally{this.draco.destroy(t)}}return null}}var p=r(80155);let m="https://www.gstatic.com/draco/versioned/decoders/1.5.6",d="draco_wasm_wrapper.js",h="draco_decoder.wasm",b="draco_decoder.js",A="draco_encoder.js",g={[d]:`${m}/${d}`,[h]:`${m}/${h}`,[b]:`${m}/${b}`,[A]:`https://raw.githubusercontent.com/google/draco/1.4.1/javascript/${A}`};async function B(e={},t){let r=e.modules||{};return r.draco3d?n||=r.draco3d.createDecoderModule({}).then(e=>({draco:e})):n||=v(e,t),await n}function C(e,t){if(e&&"object"==typeof e){if(e.default)return e.default;if(e[t])return e[t]}return e}async function v(e,t){let r,n;if("js"===t)r=await (0,a._e)(g[b],"draco",e,b);else try{[r,n]=await Promise.all([await (0,a._e)(g[d],"draco",e,d),await (0,a._e)(g[h],"draco",e,h)])}catch{r=null,n=null}return(r=(r=C(r,"DracoDecoderModule"))||globalThis.DracoDecoderModule)||p.Bd||([r,n]=await Promise.all([await (0,a._e)(g[d],"draco",{...e,useLocalLibraries:!0},d),await (0,a._e)(g[h],"draco",{...e,useLocalLibraries:!0},h)]),r=(r=C(r,"DracoDecoderModule"))||globalThis.DracoDecoderModule),await function(e,t){if("function"!=typeof e)throw Error("DracoDecoderModule could not be loaded");let r={};return t&&(r.wasmBinary=t),new Promise(t=>{e({...r,onModuleLoaded:e=>t({draco:e})})})}(r,n)}let _={dataType:null,batchType:null,name:"Draco",id:"draco",module:"draco",version:"4.4.3",worker:!0,extensions:["drc"],mimeTypes:["application/octet-stream"],binary:!0,tests:["DRACO"],options:{draco:{decoderType:"object"==typeof WebAssembly?"wasm":"js",extraAttributes:{},attributeNameEntry:void 0}}},M={..._,parse:R};async function R(e,t){let{draco:r}=await B((0,a.$j)(t),t?.draco?.decoderType||"wasm"),n=new f(r);try{return n.parseSync(e,t?.draco)}finally{n.destroy()}}},66649(e,t,r){let n;r.d(t,{B:()=>e5});var a={};r.r(a),r.d(a,{createExtMeshFeatures:()=>k,decode:()=>K,encode:()=>j,name:()=>J});var i={};r.r(i),r.d(i,{createExtStructuralMetadata:()=>Z,decode:()=>Y,encode:()=>W,name:()=>X});var o={};r.r(o),r.d(o,{decode:()=>ec,name:()=>el});var s={};r.r(s),r.d(s,{name:()=>ed,preprocess:()=>eh});var l={};r.r(l),r.d(l,{name:()=>eA,preprocess:()=>eg});var c={};r.r(c),r.d(c,{decode:()=>eR,encode:()=>eI,name:()=>e_,preprocess:()=>eM});var u={};r.r(u),r.d(u,{decode:()=>eL,name:()=>eU});var f={};r.r(f),r.d(f,{decode:()=>eO,encode:()=>eP,name:()=>ew});var p={};r.r(p),r.d(p,{decode:()=>eK,encode:()=>ej,name:()=>eJ});var m={};r.r(m),r.d(m,{decode:()=>eX,encode:()=>eY,name:()=>eQ});var d={};function h(e,t,r){if(e.byteLength<=t+r)return"";let n=new DataView(e),a="";for(let e=0;e<r;e++)a+=String.fromCharCode(n.getUint8(t+e));return a}r.r(d),r.d(d,{decode:()=>eZ,name:()=>ez});var b=r(49988),A=r(44585),g=r(21140),B=r(10543),C=r(24252),v=r(86868);function _(e,t){return(0,v.v)(e>=0),(0,v.v)(t>0),e+(t-1)&~(t-1)}function M(e,t,r,n){let a=new Uint8Array(t.buffer,r,n);return e.json=JSON.parse(new TextDecoder("utf8").decode(a)),_(n,4)}function R(e,t,r,n){return e.header.hasBinChunk=!0,e.binChunks.push({byteOffset:r,byteLength:n,arrayBuffer:t.buffer}),_(n,4)}function I(e,t,r){if(e.startsWith("data:")||e.startsWith("http:")||e.startsWith("https:"))return e;let n=r?.baseUrl||function(e){if(!e)return;if(e.endsWith("/"))return e;let t=e.lastIndexOf("/");return t>=0?e.slice(0,t+1):""}(t?.core?.baseUrl);if(!n)throw Error(`'baseUrl' must be provided to resolve relative url ${e}`);return n.endsWith("/")?`${n}${e}`:`${n}/${e}`}var y=r(89153),S=r(54849);class E{gltf;sourceBuffers;byteLength;constructor(e){this.gltf={json:e?.json||{asset:{version:"2.0",generator:"loaders.gl"},buffers:[],extensions:{},extensionsRequired:[],extensionsUsed:[]},buffers:e?.buffers||[],images:e?.images||[]},this.sourceBuffers=[],this.byteLength=0,this.gltf.buffers&&this.gltf.buffers[0]&&(this.byteLength=this.gltf.buffers[0].byteLength,this.sourceBuffers=[this.gltf.buffers[0]])}get json(){return this.gltf.json}getApplicationData(e){return this.json[e]}getExtraData(e){return(this.json.extras||{})[e]}hasExtension(e){let t=this.getUsedExtensions().find(t=>t===e),r=this.getRequiredExtensions().find(t=>t===e);return"string"==typeof t||"string"==typeof r}getExtension(e){let t=this.getUsedExtensions().find(t=>t===e),r=this.json.extensions||{};return t?r[e]:null}getRequiredExtension(e){return this.getRequiredExtensions().find(t=>t===e)?this.getExtension(e):null}getRequiredExtensions(){return this.json.extensionsRequired||[]}getUsedExtensions(){return this.json.extensionsUsed||[]}getRemovedExtensions(){return this.json.extensionsRemoved||[]}getObjectExtension(e,t){return(e.extensions||{})[t]}getScene(e){return this.getObject("scenes",e)}getNode(e){return this.getObject("nodes",e)}getSkin(e){return this.getObject("skins",e)}getMesh(e){return this.getObject("meshes",e)}getMaterial(e){return this.getObject("materials",e)}getAccessor(e){return this.getObject("accessors",e)}getTexture(e){return this.getObject("textures",e)}getSampler(e){return this.getObject("samplers",e)}getImage(e){return this.getObject("images",e)}getBufferView(e){return this.getObject("bufferViews",e)}getBuffer(e){return this.getObject("buffers",e)}getObject(e,t){if("object"==typeof t)return t;let r=this.json[e]&&this.json[e][t];if(!r)throw Error(`glTF file error: Could not find ${e}[${t}]`);return r}getTypedArrayForBufferView(e){let t=(e=this.getBufferView(e)).buffer,r=this.gltf.buffers[t];(0,C.v)(r);let n=(e.byteOffset||0)+r.byteOffset;return new Uint8Array(r.arrayBuffer,n,e.byteLength)}getTypedArrayForAccessor(e){let t=this.getAccessor(e);return function(e,t,r){let n="number"==typeof r?e.accessors?.[r]:r;if(!n)throw Error(`No gltf accessor ${JSON.stringify(r)}`);let a=e.bufferViews?.[n.bufferView||0];if(!a)throw Error(`No gltf buffer view for accessor ${a}`);let{arrayBuffer:i,byteOffset:o}=t[a.buffer],s=(o||0)+(n.byteOffset||0)+(a.byteOffset||0),{ArrayType:l,length:c,componentByteSize:u,numberOfComponentsInElement:f}=(0,y.aF)(n,a),p=u*f,m=a.byteStride||p;if(void 0===a.byteStride||a.byteStride===p)return new l(i,s,c);let d=new l(c);for(let e=0;e<n.count;e++){let t=new l(i,s+e*m,f);d.set(t,e*f)}return d}(this.gltf.json,this.gltf.buffers,t)}getTypedArrayForImageData(e){e=this.getAccessor(e);let t=this.getBufferView(e.bufferView);return new Uint8Array(this.getBuffer(t.buffer).data,t.byteOffset||0,t.byteLength)}addApplicationData(e,t){return this.json[e]=t,this}addExtraData(e,t){return this.json.extras=this.json.extras||{},this.json.extras[e]=t,this}addObjectExtension(e,t,r){return e.extensions=e.extensions||{},e.extensions[t]=r,this.registerUsedExtension(t),this}setObjectExtension(e,t,r){(e.extensions||{})[t]=r}removeObjectExtension(e,t){let r=e?.extensions||{};if(r[t]){this.json.extensionsRemoved=this.json.extensionsRemoved||[];let e=this.json.extensionsRemoved;e.includes(t)||e.push(t)}delete r[t]}addExtension(e,t={}){return(0,C.v)(t),this.json.extensions=this.json.extensions||{},this.json.extensions[e]=t,this.registerUsedExtension(e),t}addRequiredExtension(e,t={}){return(0,C.v)(t),this.addExtension(e,t),this.registerRequiredExtension(e),t}registerUsedExtension(e){this.json.extensionsUsed=this.json.extensionsUsed||[],this.json.extensionsUsed.find(t=>t===e)||this.json.extensionsUsed.push(e)}registerRequiredExtension(e){this.registerUsedExtension(e),this.json.extensionsRequired=this.json.extensionsRequired||[],this.json.extensionsRequired.find(t=>t===e)||this.json.extensionsRequired.push(e)}removeExtension(e){if(this.json.extensions?.[e]){this.json.extensionsRemoved=this.json.extensionsRemoved||[];let t=this.json.extensionsRemoved;t.includes(e)||t.push(e)}this.json.extensions&&delete this.json.extensions[e],this.json.extensionsRequired&&this._removeStringFromArray(this.json.extensionsRequired,e),this.json.extensionsUsed&&this._removeStringFromArray(this.json.extensionsUsed,e)}setDefaultScene(e){this.json.scene=e}addScene(e){let{nodeIndices:t}=e;return this.json.scenes=this.json.scenes||[],this.json.scenes.push({nodes:t}),this.json.scenes.length-1}addNode(e){let{meshIndex:t,matrix:r}=e;this.json.nodes=this.json.nodes||[];let n={mesh:t};return r&&(n.matrix=r),this.json.nodes.push(n),this.json.nodes.length-1}addMesh(e){let{attributes:t,indices:r,material:n,mode:a=4}=e,i={primitives:[{attributes:this._addAttributes(t),mode:a}]};if(r){let e=this._addIndices(r);i.primitives[0].indices=e}return Number.isFinite(n)&&(i.primitives[0].material=n),this.json.meshes=this.json.meshes||[],this.json.meshes.push(i),this.json.meshes.length-1}addPointCloud(e){let t=this._addAttributes(e);return this.json.meshes=this.json.meshes||[],this.json.meshes.push({primitives:[{attributes:t,mode:0}]}),this.json.meshes.length-1}addImage(e,t){let r=(0,S.m)(e),n=t||r?.mimeType,a=this.addBufferView(e);return this.json.images=this.json.images||[],this.json.images.push({bufferView:a,mimeType:n}),this.json.images.length-1}addBufferView(e,t=0,r=this.byteLength){let n=e.byteLength;return(0,C.v)(Number.isFinite(n)),this.sourceBuffers=this.sourceBuffers||[],this.sourceBuffers.push(e),this.byteLength+=_(n,4),this.json.bufferViews=this.json.bufferViews||[],this.json.bufferViews.push({buffer:t,byteOffset:r,byteLength:n}),this.json.bufferViews.length-1}addAccessor(e,t){let r={bufferView:e,type:(0,y.v7)(t.size),componentType:t.componentType,count:t.count,max:t.max,min:t.min};return this.json.accessors=this.json.accessors||[],this.json.accessors.push(r),this.json.accessors.length-1}addBinaryBuffer(e,t={size:3}){let r=this.addBufferView(e),n={min:t.min,max:t.max};n.min&&n.max||(n=this._getAccessorMinMax(e,t.size));let a={size:t.size,componentType:(0,y.rA)(e),count:Math.round(e.length/t.size),min:n.min,max:n.max};return this.addAccessor(r,Object.assign(a,t))}addTexture(e){let{imageIndex:t}=e;return this.json.textures=this.json.textures||[],this.json.textures.push({source:t}),this.json.textures.length-1}addMaterial(e){return this.json.materials=this.json.materials||[],this.json.materials.push(e),this.json.materials.length-1}createBinaryChunk(){let e=this.byteLength,t=new ArrayBuffer(e),r=new Uint8Array(t),n=0;for(let e of this.sourceBuffers||[])n=function(e,t,r){let n;if(e instanceof ArrayBuffer)n=new Uint8Array(e);else{let t=e.byteOffset,r=e.byteLength;n=new Uint8Array(e.buffer||e.arrayBuffer,t,r)}return t.set(n,r),r+_(n.byteLength,4)}(e,r,n);this.json?.buffers?.[0]?this.json.buffers[0].byteLength=e:this.json.buffers=[{byteLength:e}],this.gltf.binary=t,this.sourceBuffers=[t],this.gltf.buffers=[{arrayBuffer:t,byteOffset:0,byteLength:t.byteLength}]}_removeStringFromArray(e,t){let r=!0;for(;r;){let n=e.indexOf(t);n>-1?e.splice(n,1):r=!1}}_addAttributes(e={}){let t={};for(let r in e){let n=e[r],a=this._getGltfAttributeName(r),i=this.addBinaryBuffer(n.value,n);t[a]=i}return t}_addIndices(e){return this.addBinaryBuffer(e,{size:1})}_getGltfAttributeName(e){switch(e.toLowerCase()){case"position":case"positions":case"vertices":return"POSITION";case"normal":case"normals":return"NORMAL";case"color":case"colors":return"COLOR_0";case"texcoord":case"texcoords":return"TEXCOORD_0";default:return e}}_getAccessorMinMax(e,t){let r={min:null,max:null};if(e.length<t)return r;for(let n of(r.min=[],r.max=[],e.subarray(0,t)))r.min.push(n),r.max.push(n);for(let n=t;n<e.length;n+=t)for(let a=0;a<t;a++)r.min[0+a]=Math.min(r.min[0+a],e[n+a]),r.max[0+a]=Math.max(r.max[0+a],e[n+a]);return r}}var x=r(33437),T=r(50933);let F={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16,BOOLEAN:1,STRING:1,ENUM:1},U={INT8:Int8Array,UINT8:Uint8Array,INT16:Int16Array,UINT16:Uint16Array,INT32:Int32Array,UINT32:Uint32Array,INT64:BigInt64Array,UINT64:BigUint64Array,FLOAT32:Float32Array,FLOAT64:Float64Array},D={INT8:1,UINT8:1,INT16:2,UINT16:2,INT32:4,UINT32:4,INT64:8,UINT64:8,FLOAT32:4,FLOAT64:8};function H(e,t,r,n){if("UINT8"!==r&&"UINT16"!==r&&"UINT32"!==r&&"UINT64"!==r)return null;let a=G(e.getTypedArrayForBufferView(t),"SCALAR",r,n+1);return a instanceof BigInt64Array||a instanceof BigUint64Array?null:a}function G(e,t,r,n=1){let a=F[t],i=U[r],o=D[r],s=n*a,l=s*o,c=e.buffer,u=e.byteOffset;return u%o!=0&&(c=new Uint8Array(c).slice(u,u+l).buffer,u=0),new i((0,T.W$)(c),u,s)}function L(e,t,r){let n=`TEXCOORD_${t.texCoord||0}`,a=r.attributes[n],i=e.getTypedArrayForAccessor(a),o=e.gltf.json,s=t.index,l=o.textures?.[s]?.source;if(void 0!==l){let r=o.images?.[l]?.mimeType,n=e.gltf.images?.[l];if(n&&void 0!==n.width){let e=[];for(let a=0;a<i.length;a+=2){let o=function(e,t,r,n,a=[0]){let i={r:{offset:0,shift:0},g:{offset:1,shift:8},b:{offset:2,shift:16},a:{offset:3,shift:24}},o=r[n],s=r[n+1],l=1;t&&(-1!==t.indexOf("image/jpeg")||-1!==t.indexOf("image/png"))&&(l=4);let c=function(e,t,r,n=1){let a=r.width,i=Math.round((e%1+1)%1*(a-1));return(Math.round((t%1+1)%1*(r.height-1))*a+i)*(r.components?r.components:n)}(o,s,e,l),u=0;for(let t of a){let r="number"==typeof t?Object.values(i)[t]:i[t],n=c+r.offset,a=(0,x.M5)(e);if(a.data.length<=n)throw Error(`${a.data.length} <= ${n}`);u|=a.data[n]<<r.shift}return u}(n,r,i,a,t.channels);e.push(o)}return e}}return[]}function N(e,t,r,n,a){if(!r?.length)return;let i=[];for(let e of r){let t=n.findIndex(t=>t===e);-1===t&&(t=n.push(e)-1),i.push(t)}let o=new Uint32Array(i),s=e.gltf.buffers.push({arrayBuffer:o.buffer,byteOffset:o.byteOffset,byteLength:o.byteLength})-1,l=e.addBufferView(o,s,0),c=e.addAccessor(l,{size:1,componentType:(0,y.rA)(o),count:o.length});a.attributes[t]=c}function w(e,t,r,n,a){let i=[];for(let o=0;o<t;o++){let t=r[o],s=r[o+1]-r[o];if(s+t>n)break;let l=t/a,c=s/a;i.push(e.slice(l,l+c))}return i}function O(e,t,r){let n=[];for(let a=0;a<t;a++){let t=a*r;n.push(e.slice(t,t+r))}return n}function P(e,t,r,n){if(r)throw Error("Not implemented - arrayOffsets for strings is specified");if(n){let r=[],a=new TextDecoder("utf8"),i=0;for(let o=0;o<e;o++){let e=n[o+1]-n[o];if(e+i<=t.length){let n=t.subarray(i,e+i),o=a.decode(n);r.push(o),i+=e}}return r}return[]}let V="EXT_mesh_features",J=V;async function K(e,t){var r=new E(e),n=t;let a=r.gltf.json;if(a.meshes)for(let e of a.meshes)for(let t of e.primitives)!function(e,t,r){if(!r?.gltf?.loadBuffers)return;let n=t.extensions?.[V],a=n?.featureIds;if(a)for(let n of a){let a;if(void 0!==n.attribute){let r=`_FEATURE_ID_${n.attribute}`,i=t.attributes[r];a=e.getTypedArrayForAccessor(i)}else a=void 0!==n.texture&&r?.gltf?.loadImages?L(e,n.texture,t):[];n.data=a}}(r,t,n)}function j(e,t){let r=new E(e);return function(e){let t=e.gltf.json.meshes;if(t)for(let r of t)for(let t of r.primitives)!function(e,t){let r=t.extensions?.[V];if(!r)return;let n=r.featureIds;n.forEach((r,a)=>{if(r.data){let{accessorKey:i,index:o}=function(e){let t="_FEATURE_ID_",r=Object.keys(e).filter(e=>0===e.indexOf(t)),n=-1;for(let e of r){let r=Number(e.substring(t.length));r>n&&(n=r)}return n++,{accessorKey:`${t}${n}`,index:n}}(t.attributes),s=new Uint32Array(r.data);n[a]={featureCount:s.length,propertyTable:r.propertyTable,attribute:o},e.gltf.buffers.push({arrayBuffer:s.buffer,byteOffset:s.byteOffset,byteLength:s.byteLength});let l=e.addBufferView(s),c=e.addAccessor(l,{size:1,componentType:(0,y.rA)(s),count:s.length});t.attributes[i]=c}})}(e,t)}(r),r.createBinaryChunk(),r.gltf}function k(e,t,r,n){t.extensions||(t.extensions={});let a=t.extensions[V];a||(a={featureIds:[]},t.extensions[V]=a);let{featureIds:i}=a,o={featureCount:r.length,propertyTable:n,data:r};i.push(o),e.addObjectExtension(t,V,a)}let Q="EXT_structural_metadata",X=Q;async function Y(e,t){!function(e,t){if(!t.gltf?.loadBuffers)return;let r=e.getExtension(Q);r&&(t.gltf?.loadImages&&function(e,t){let r=t.propertyTextures,n=e.gltf.json;if(r&&n.meshes)for(let a of n.meshes)for(let n of a.primitives)!function(e,t,r,n){if(!t)return;let a=r.extensions?.[Q],i=a?.propertyTextures;if(i)for(let a of i)!function(e,t,r,n){if(!t.properties)return;n.dataAttributeNames||(n.dataAttributeNames=[]);let a=t.class;for(let i in t.properties){let o=`${a}_${i}`,s=t.properties?.[i];if(!s)continue;s.data||(s.data=[]);let l=s.data,c=L(e,s,r);null!==c&&(N(e,o,c,l,r),s.data=l,n.dataAttributeNames.push(o))}}(e,t[a],r,n)}(e,r,n,t)}(e,r),function(e,t){let r=t.schema;if(!r)return;let n=r.classes,a=t.propertyTables;if(n&&a)for(let t in n){let n=function(e,t){for(let r of e)if(r.class===t)return r;return null}(a,t);n&&function(e,t,r){let n=t.classes?.[r.class];if(!n)throw Error(`Incorrect data in the EXT_structural_metadata extension: no schema class with name ${r.class}`);let a=r.count;for(let i in n.properties){let o=n.properties[i],s=r.properties?.[i];if(s){let r=function(e,t,r,n,a){var i,o,s,l,c,u,f;let p=[],m=a.values,d=e.getTypedArrayForBufferView(m),h=(i=e,o=r,s=a,l=n,o.array&&void 0===o.count&&void 0!==s.arrayOffsets?H(i,s.arrayOffsets,s.arrayOffsetType||"UINT32",l):null),b=(c=e,u=a,f=n,void 0!==u.stringOffsets?H(c,u.stringOffsets,u.stringOffsetType||"UINT32",f):null);switch(r.type){case"SCALAR":case"VEC2":case"VEC3":case"VEC4":case"MAT2":case"MAT3":case"MAT4":p=function(e,t,r,n){var a;let i,o=e.array,s=e.count,l=(a=e.type,D[e.componentType]*F[a]),c=r.byteLength/l;return(i=e.componentType?G(r,e.type,e.componentType,c):r,o)?n?w(i,t,n,r.length,l):s?O(i,t,s):[]:i}(r,n,d,h);break;case"BOOLEAN":throw Error(`Not implemented - classProperty.type=${r.type}`);case"STRING":p=P(n,d,h,b);break;case"ENUM":p=function(e,t,r,n,a){var i;let o=t.enumType;if(!o)throw Error("Incorrect data in the EXT_structural_metadata extension: classProperty.enumType is not set for type ENUM");let s=e.enums?.[o];if(!s)throw Error(`Incorrect data in the EXT_structural_metadata extension: schema.enums does't contain ${o}`);let l=s.valueType||"UINT16",c=(i=t.type,D[l]*F[i]),u=n.byteLength/c,f=G(n,t.type,l,u);if(f||(f=n),t.array){if(a)return function(e){let{valuesData:t,numberOfElements:r,arrayOffsets:n,valuesDataBytesLength:a,elementSize:i,enumEntry:o}=e,s=[];for(let e=0;e<r;e++){let r=n[e],l=n[e+1]-n[e];if(l+r>a)break;let c=z(t,r/i,l/i,o);s.push(c)}return s}({valuesData:f,numberOfElements:r,arrayOffsets:a,valuesDataBytesLength:n.length,elementSize:c,enumEntry:s});let e=t.count;return e?function(e,t,r,n){let a=[];for(let i=0;i<t;i++){let t=z(e,r*i,r,n);a.push(t)}return a}(f,r,e,s):[]}return z(f,0,r,s)}(t,r,n,d,h);break;default:throw Error(`Unknown classProperty type ${r.type}`)}return p}(e,t,o,a,s);s.data=r}}}(e,r,n)}}(e,r))}(new E(e),t)}function W(e,t){let r=new E(e);return function(e){let t=e.getExtension(Q);if(t&&t.propertyTables)for(let r of t.propertyTables){let n=r.class,a=t.schema?.classes?.[n];r.properties&&a&&function(e,t,r){for(let n in e.properties){let a=e.properties[n].data;if(a){let i=t.properties[n];if(i){let t=function(e,t,r){let n={values:0};if("STRING"===t.type){let{stringData:t,stringOffsets:a}=function(e){let t=new TextEncoder,r=[],n=0;for(let a of e){let e=t.encode(a);n+=e.length,r.push(e)}let a=new Uint8Array(n),i=[],o=0;for(let e of r)a.set(e,o),i.push(o),o+=e.length;return i.push(o),{stringData:a,stringOffsets:new Uint32Array(i)}}(e);n.stringOffsets=q(a,r),n.values=q(t,r)}else"SCALAR"===t.type&&t.componentType&&(n.values=q(function(e,t){let r=[];for(let t of e)r.push(Number(t));let n=$[t];if(!n)throw Error("Illegal component type");return new n(r)}(e,t.componentType),r));return n}(a,i,r);e.properties[n]=t}}}}(r,a,e)}}(r),r.createBinaryChunk(),r.gltf}function z(e,t,r,n){let a=[];for(let i=0;i<r;i++)if(e instanceof BigInt64Array||e instanceof BigUint64Array)a.push("");else{let r=function(e,t){for(let r of e.values)if(r.value===t)return r;return null}(n,e[t+i]);r?a.push(r.name):a.push("")}return a}function Z(e,t,r="schemaClassId"){let n=e.getExtension(Q);n||(n=e.addExtension(Q)),n.schema=function(e,t,r){let n=r??{id:"schema_id"},a={properties:{}};for(let t of e){let e={type:t.elementType,componentType:t.componentType};a.properties[t.name]=e}return n.classes={},n.classes[t]=a,n}(t,r,n.schema);let a=function(e,t,r){let n={class:t,count:0},a=0,i=r.classes?.[t];for(let t of e){if(0===a&&(a=t.values.length),a!==t.values.length&&t.values.length)throw Error("Illegal values in attributes");i?.properties[t.name]&&(n.properties||(n.properties={}),n.properties[t.name]={values:0,data:t.values})}return n.count=a,n}(t,r,n.schema);return n.propertyTables||(n.propertyTables=[]),n.propertyTables.push(a)-1}let $={INT8:Int8Array,UINT8:Uint8Array,INT16:Int16Array,UINT16:Uint16Array,INT32:Int32Array,UINT32:Uint32Array,INT64:Int32Array,UINT64:Uint32Array,FLOAT32:Float32Array,FLOAT64:Float64Array};function q(e,t){return t.gltf.buffers.push({arrayBuffer:(0,T.W$)(e.buffer),byteOffset:e.byteOffset,byteLength:e.byteLength}),t.addBufferView(e)}let ee=new Uint8Array([0,97,115,109,1,0,0,0,1,4,1,96,0,0,3,3,2,0,0,5,3,1,0,1,12,1,0,10,22,2,12,0,65,0,65,0,65,0,252,10,0,0,11,7,0,65,0,253,15,26,11]),et=new Uint8Array([32,0,65,253,3,1,2,34,4,106,6,5,11,8,7,20,13,33,12,16,128,9,116,64,19,113,127,15,10,21,22,14,255,66,24,54,136,107,18,23,192,26,114,118,132,17,77,101,130,144,27,87,131,44,45,74,156,154,70,167]),er={0:"",1:"meshopt_decodeFilterOct",2:"meshopt_decodeFilterQuat",3:"meshopt_decodeFilterExp",NONE:"",OCTAHEDRAL:"meshopt_decodeFilterOct",QUATERNION:"meshopt_decodeFilterQuat",EXPONENTIAL:"meshopt_decodeFilterExp"},en={0:"meshopt_decodeVertexBuffer",1:"meshopt_decodeIndexBuffer",2:"meshopt_decodeIndexSequence",ATTRIBUTES:"meshopt_decodeVertexBuffer",TRIANGLES:"meshopt_decodeIndexBuffer",INDICES:"meshopt_decodeIndexSequence"};async function ea(e,t,r,n,a,i="NONE"){let o=await ei();!function(e,t,r,n,a,i,o){let s=e.exports.sbrk,l=n+3&-4,c=s(l*a),u=s(i.length),f=new Uint8Array(e.exports.memory.buffer);f.set(i,u);let p=t(c,n,a,u,i.length);if(0===p&&o&&o(c,l,a),r.set(f.subarray(c,c+n*a)),s(c-s(0)),0!==p)throw Error(`Malformed buffer data: ${p}`)}(o,o.exports[en[a]],e,t,r,n,o.exports[er[i||"NONE"]])}async function ei(){return n||(n=eo()),n}async function eo(){let e="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";WebAssembly.validate(ee)&&(e="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",console.log("Warning: meshopt_decoder is using experimental SIMD support"));let t=await WebAssembly.instantiate(function(e){let t=new Uint8Array(e.length);for(let r=0;r<e.length;++r){let n=e.charCodeAt(r);t[r]=n>96?n-71:n>64?n-65:n>47?n+4:n>46?63:62}let r=0;for(let n=0;n<e.length;++n)t[r++]=t[n]<60?et[t[n]]:(t[n]-60)*64+t[++n];return t.buffer.slice(0,r)}(e),{});return await t.instance.exports.__wasm_call_ctors(),t.instance}let es="EXT_meshopt_compression",el=es;async function ec(e,t){let r=new E(e);if(!t?.gltf?.decompressMeshes||!t.gltf?.loadBuffers)return;let n=[];for(let t of e.json.bufferViews||[])n.push(eu(r,t));await Promise.all(n),r.removeExtension(es)}async function eu(e,t){let r=e.getObjectExtension(t,es);if(r){let{byteOffset:n=0,byteLength:a=0,byteStride:i,count:o,mode:s,filter:l="NONE",buffer:c}=r,u=e.gltf.buffers[c],f=new Uint8Array(u.arrayBuffer,u.byteOffset+n,a),p=new Uint8Array(e.gltf.buffers[t.buffer].arrayBuffer,t.byteOffset,t.byteLength);await ea(p,o,i,f,s,l),e.removeObjectExtension(t,es)}}var ef=r(34280);let ep={},em="EXT_texture_webp",ed=em;function eh(e,t){let r=new E(e);if(!function(e){if(void 0===ep[e]){var t;let r,n=ef.Bd?function(e){switch(e){case"image/avif":case"image/webp":var t=e;try{let e=document.createElement("canvas").toDataURL(t);return 0===e.indexOf(`data:${t}`)}catch{return!1}default:return!0}}(e):(t=e,r=globalThis.loaders?.imageFormatsNode||["image/png","image/jpeg","image/gif"],!!globalThis.loaders?.parseImageNode&&r.includes(t));ep[e]=n}return ep[e]}("image/webp")){if(r.getRequiredExtensions().includes(em))throw Error(`gltf: Required extension ${em} not supported by browser`);return}let{json:n}=r;for(let e of n.textures||[]){let t=r.getObjectExtension(e,em);t&&(e.source=t.source),r.removeObjectExtension(e,em)}r.removeExtension(em)}let eb="KHR_texture_basisu",eA=eb;function eg(e,t){let r=new E(e),{json:n}=r;for(let e of n.textures||[]){let t=r.getObjectExtension(e,eb);t&&(e.source=t.source,r.removeObjectExtension(e,eb))}r.removeExtension(eb)}var eB=r(78957);function eC(e){var t;let r,n,a,{buffer:i,size:o,count:s}=(r=t=e,n=1,a=0,t&&t.value&&(r=t.value,n=t.size||1),r&&(ArrayBuffer.isView(r)||(r=function(e,t,r=!1){return e?!Array.isArray(e)&&(!r||e instanceof t)?e:new t(e):null}(r,Float32Array)),a=r.length/n),{buffer:r,size:n,count:a});return{value:i,size:o,byteOffset:0,count:s,type:(0,y.v7)(o),componentType:(0,y.rA)(i)}}let ev="KHR_draco_mesh_compression",e_=ev;function eM(e,t,r){let n=new E(e);for(let e of eS(n))n.getObjectExtension(e,ev)}async function eR(e,t,r){if(!t?.gltf?.decompressMeshes)return;let n=new E(e),a=[];for(let e of eS(n))n.getObjectExtension(e,ev)&&a.push(ey(n,e,t,r));await Promise.all(a),n.removeExtension(ev)}function eI(e,t={}){let r=new E(e);for(let e of r.json.meshes||[])(function(e){if(!(void 0).DracoWriter)throw Error("options.gltf.DracoWriter not provided");let t=(void 0).DracoWriter.encodeSync({attributes:e}),r=void 0;(void 0)._addFauxAttributes(r.attributes),(void 0).addBufferView(t)})(e),r.addRequiredExtension(ev)}async function ey(e,t,r,n){let a=e.getObjectExtension(t,ev);if(!a)return;let i=e.getTypedArrayForBufferView(a.bufferView),o=(0,b._m)(i.buffer,i.byteOffset),s={...r};delete s["3d-tiles"];let l=await (0,A.N9)(o,eB.V,s,n),c=function(e){let t={};for(let r in e){let n=e[r];if("indices"!==r){let e=eC(n);t[r]=e}}return t}(l.attributes);for(let[r,n]of Object.entries(c))if(r in t.attributes){let a=t.attributes[r],i=e.getAccessor(a);i?.min&&i?.max&&(n.min=i.min,n.max=i.max)}t.attributes=c,l.indices&&(t.indices=eC(l.indices)),e.removeObjectExtension(t,ev),function(e){if(!e.attributes&&Object.keys(e.attributes).length>0)throw Error("glTF: Empty primitive detected: Draco decompression failure?")}(t)}function*eS(e){for(let t of e.json.meshes||[])for(let e of t.primitives)yield e}var eE=r(35097),ex=r(34331),eT=r(87021);let eF="KHR_texture_transform",eU=eF,eD=new eE.P,eH=new ex.d,eG=new ex.d;async function eL(e,t){if(!new E(e).hasExtension(eF)||!t.gltf?.loadBuffers)return;let r=e.json.materials||[];for(let t=0;t<r.length;t++)!function(e,t){let r=t.json.materials?.[e],n=[r?.pbrMetallicRoughness?.baseColorTexture,r?.emissiveTexture,r?.normalTexture,r?.occlusionTexture,r?.pbrMetallicRoughness?.metallicRoughnessTexture],a=[];for(let r of n)r&&r?.extensions?.[eF]&&function(e,t,r,n){let a=function(e,t){let r=e.extensions?.[eF],{texCoord:n=0}=e,{texCoord:a=n}=r;if(-1===t.findIndex(([e,t])=>e===n&&t===a)){let i=function(e){let{offset:t=[0,0],rotation:r=0,scale:n=[1,1]}=e,a=new ex.d().set(1,0,0,0,1,0,t[0],t[1],1),i=eH.set(Math.cos(r),Math.sin(r),0,-Math.sin(r),Math.cos(r),0,0,0,1),o=eG.set(n[0],0,0,0,n[1],0,0,0,1);return a.multiplyRight(i).multiplyRight(o)}(r);return n!==a&&(e.texCoord=a),t.push([n,a]),{originalTexCoord:n,texCoord:a,matrix:i}}return null}(r,n);if(a)for(let r of e.json.meshes||[])for(let n of r.primitives){let r=n.material;Number.isFinite(r)&&t===r&&function(e,t,r){let{originalTexCoord:n,texCoord:a,matrix:i}=r,o=t.attributes[`TEXCOORD_${n}`];if(Number.isFinite(o)){let r=e.json.accessors?.[o];if(r&&void 0!==r.bufferView){let o=e.json.bufferViews?.[r.bufferView];if(o){let{arrayBuffer:s,byteOffset:l}=e.buffers[o.buffer],c=(l||0)+(r.byteOffset||0)+(o.byteOffset||0),{ArrayType:u,length:f}=(0,y.aF)(r,o),p=eT.E9[r.componentType],m=eT.$j[r.type],d=o.byteStride||p*m,h=new Float32Array(f);for(let e=0;e<r.count;e++){let t=new u(s,c+e*d,2);eD.set(t[0],t[1],1),eD.transformByMatrix3(i),h.set([eD[0],eD[1]],e*m)}n===a?function(e,t,r,n){e.componentType=5126,e.byteOffset=0;let a=(t.json.accessors||[]).reduce((e,t)=>t.bufferView===n?e+1:e,0);t.buffers.push({arrayBuffer:(0,T.W$)(r.buffer),byteOffset:0,byteLength:r.buffer.byteLength});let i=t.buffers.length-1;if(t.json.bufferViews=t.json.bufferViews||[],a>1){t.json.bufferViews.push({buffer:i,byteLength:r.buffer.byteLength,byteOffset:0}),e.bufferView=t.json.bufferViews.length-1;return}let o=t.json.bufferViews[n];o&&(o.buffer=i,o.byteOffset=0,o.byteLength=r.buffer.byteLength,void 0!==o.byteStride&&delete o.byteStride)}(r,e,h,r.bufferView):function(e,t,r,n,a){n.buffers.push({arrayBuffer:(0,T.W$)(a.buffer),byteOffset:0,byteLength:a.buffer.byteLength}),n.json.bufferViews=n.json.bufferViews||[];let i=n.json.bufferViews;i.push({buffer:n.buffers.length-1,byteLength:a.buffer.byteLength,byteOffset:0});let o=n.json.accessors;o&&(o.push({bufferView:i?.length-1,byteOffset:0,componentType:5126,count:t.count,type:"VEC2"}),r.attributes[`TEXCOORD_${e}`]=o.length-1)}(a,r,t,e,h)}}}}(e,n,a)}}(t,e,r,a)}(t,e)}let eN="KHR_lights_punctual",ew=eN;async function eO(e){let t=new E(e),{json:r}=t,n=t.getExtension(eN);for(let e of(n&&(t.json.lights=n.lights,t.removeExtension(eN)),r.nodes||[])){let r=t.getObjectExtension(e,eN);r&&(e.light=r.light),t.removeObjectExtension(e,eN)}}async function eP(e){let t=new E(e),{json:r}=t;if(r.lights){let e=t.addExtension(eN);(0,C.v)(!e.lights),e.lights=r.lights,delete r.lights}if(t.json.lights){for(let e of t.json.lights){let r=e.node;t.addObjectExtension(r,eN,e)}delete t.json.lights}}let eV="KHR_materials_unlit",eJ=eV;async function eK(e){let t=new E(e),{json:r}=t;for(let e of r.materials||[])e.extensions&&e.extensions.KHR_materials_unlit&&(e.unlit=!0),t.removeObjectExtension(e,eV);t.removeExtension(eV)}function ej(e){let t=new E(e),{json:r}=t;if(t.materials)for(let e of r.materials||[])e.unlit&&(delete e.unlit,t.addObjectExtension(e,eV,{}),t.addExtension(eV))}let ek="KHR_techniques_webgl",eQ=ek;async function eX(e){let t=new E(e),{json:r}=t,n=t.getExtension(ek);if(n){let e=function(e,t){let{programs:r=[],shaders:n=[],techniques:a=[]}=e,i=new TextDecoder;return n.forEach(e=>{if(Number.isFinite(e.bufferView))e.code=i.decode(t.getTypedArrayForBufferView(e.bufferView));else throw Error("KHR_techniques_webgl: no shader code")}),r.forEach(e=>{e.fragmentShader=n[e.fragmentShader],e.vertexShader=n[e.vertexShader]}),a.forEach(e=>{e.program=r[e.program]}),a}(n,t);for(let n of r.materials||[]){let r=t.getObjectExtension(n,ek);r&&(n.technique=Object.assign({},r,e[r.technique]),n.technique.values=function(e,t){let r=Object.assign({},e.values);return Object.keys(e.uniforms||{}).forEach(t=>{!e.uniforms[t].value||t in r||(r[t]=e.uniforms[t].value)}),Object.keys(r).forEach(e=>{"object"==typeof r[e]&&void 0!==r[e].index&&(r[e].texture=t.getTexture(r[e].index))}),r}(n.technique,t)),t.removeObjectExtension(n,ek)}t.removeExtension(ek)}}async function eY(e,t){}let eW="EXT_feature_metadata",ez=eW;async function eZ(e,t){!function(e,t){if(!t.gltf?.loadBuffers)return;let r=e.getExtension(eW);r&&(t.gltf?.loadImages&&function(e,t){let r=t.schema;if(!r)return;let n=r.classes,{featureTextures:a}=t;if(n&&a)for(let t in n){let r=n[t],i=function(e,t){for(let r in e){let n=e[r];if(n.class===t)return n}return null}(a,t);i&&function(e,t,r){let n=t.class;for(let a in r.properties){let r=t?.properties?.[a];if(r){let t=function(e,t,r){let n=e.gltf.json;if(!n.meshes)return[];let a=[];for(let i of n.meshes)for(let n of i.primitives)!function(e,t,r,n,a){let i=L(e,{channels:r.channels,...r.texture},a);i&&N(e,t,i,n,a)}(e,r,t,a,n);return a}(e,r,n);r.data=t}}}(e,i,r)}}(e,r),function(e,t){let r=t.schema;if(!r)return;let n=r.classes,a=t.featureTables;if(n&&a)for(let t in n){let n=function(e,t){for(let r in e){let n=e[r];if(n.class===t)return n}return null}(a,t);n&&function(e,t,r){if(!r.class)return;let n=t.classes?.[r.class];if(!n)throw Error(`Incorrect data in the EXT_structural_metadata extension: no schema class with name ${r.class}`);let a=r.count;for(let t in n.properties){let i=n.properties[t],o=r.properties?.[t];if(o){let t=function(e,t,r,n){var a,i,o,s,l,c,u;let f=[],p=n.bufferView,m=e.getTypedArrayForBufferView(p),d=(a=e,i=t,o=n,s=r,"ARRAY"===i.type&&void 0===i.componentCount&&void 0!==o.arrayOffsetBufferView?H(a,o.arrayOffsetBufferView,o.offsetType||"UINT32",s):null),h=(l=e,c=n,u=r,void 0!==c.stringOffsetBufferView?H(l,c.stringOffsetBufferView,c.offsetType||"UINT32",u):null);return"STRING"===t.type||"STRING"===t.componentType?f=P(r,m,d,h):function(e){let t=["UINT8","INT16","UINT16","INT32","UINT32","INT64","UINT64","FLOAT32","FLOAT64"];return t.includes(e.type)||void 0!==e.componentType&&t.includes(e.componentType)}(t)&&(f=function(e,t,r,n){let a="ARRAY"===e.type,i=e.componentCount,o="SCALAR",s=e.componentType||e.type,l=D[s]*F[o],c=r.byteLength/l,u=G(r,o,s,c);return a?n?w(u,t,n,r.length,l):i?O(u,t,i):[]:u}(t,r,m,d)),f}(e,i,a,o);o.data=t}}}(e,r,n)}}(e,r))}(new E(e),t)}let e$=[i,a,o,s,l,c,f,p,m,u,d];async function eq(e,t={},r){for(let n of e$.filter(e=>e0(e.name,t)))await n.decode?.(e,t,r)}function e0(e,t){let r=t?.gltf?.excludeExtensions||{};return!(e in r&&!r[e])}let e1="KHR_binary_glTF",e3={accessors:"accessor",animations:"animation",buffers:"buffer",bufferViews:"bufferView",images:"image",materials:"material",meshes:"mesh",nodes:"node",samplers:"sampler",scenes:"scene",skins:"skin",textures:"texture"},e9={accessor:"accessors",animations:"animation",buffer:"buffers",bufferView:"bufferViews",image:"images",material:"materials",mesh:"meshes",node:"nodes",sampler:"samplers",scene:"scenes",skin:"skins",texture:"textures"};class e2{idToIndexMap={animations:{},accessors:{},buffers:{},bufferViews:{},images:{},materials:{},meshes:{},nodes:{},samplers:{},scenes:{},skins:{},textures:{}};json;normalize(e,t){this.json=e.json;let r=e.json;switch(r.asset&&r.asset.version){case"2.0":return;case void 0:case"1.0":break;default:console.warn(`glTF: Unknown version ${r.asset.version}`);return}if(!t.normalize)throw Error("glTF v1 is not supported.");console.warn("Converting glTF v1 to glTF v2 format. This is experimental and may fail."),this._addAsset(r),this._convertTopLevelObjectsToArrays(r),function(e){let t=new E(e),{json:r}=t;for(let e of r.images||[]){let r=t.getObjectExtension(e,e1);r&&Object.assign(e,r),t.removeObjectExtension(e,e1)}r.buffers&&r.buffers[0]&&delete r.buffers[0].uri,t.removeExtension(e1)}(e),this._convertObjectIdsToArrayIndices(r),this._updateObjects(r),this._updateMaterial(r)}_addAsset(e){e.asset=e.asset||{},e.asset.version="2.0",e.asset.generator=e.asset.generator||"Normalized to glTF 2.0 by loaders.gl"}_convertTopLevelObjectsToArrays(e){for(let t in e3)this._convertTopLevelObjectToArray(e,t)}_convertTopLevelObjectToArray(e,t){let r=e[t];if(!(!r||Array.isArray(r)))for(let n in e[t]=[],r){let a=r[n];a.id=a.id||n;let i=e[t].length;e[t].push(a),this.idToIndexMap[t][n]=i}}_convertObjectIdsToArrayIndices(e){for(let t in e3)this._convertIdsToIndices(e,t);for(let t of("scene"in e&&(e.scene=this._convertIdToIndex(e.scene,"scene")),e.textures))this._convertTextureIds(t);for(let t of e.meshes)this._convertMeshIds(t);for(let t of e.nodes)this._convertNodeIds(t);for(let t of e.scenes)this._convertSceneIds(t)}_convertTextureIds(e){e.source&&(e.source=this._convertIdToIndex(e.source,"image"))}_convertMeshIds(e){for(let t of e.primitives){let{attributes:e,indices:r,material:n}=t;for(let t in e)e[t]=this._convertIdToIndex(e[t],"accessor");r&&(t.indices=this._convertIdToIndex(r,"accessor")),n&&(t.material=this._convertIdToIndex(n,"material"))}}_convertNodeIds(e){e.children&&(e.children=e.children.map(e=>this._convertIdToIndex(e,"node"))),e.meshes&&(e.meshes=e.meshes.map(e=>this._convertIdToIndex(e,"mesh")))}_convertSceneIds(e){e.nodes&&(e.nodes=e.nodes.map(e=>this._convertIdToIndex(e,"node")))}_convertIdsToIndices(e,t){for(let r of(e[t]||(console.warn(`gltf v1: json doesn't contain attribute ${t}`),e[t]=[]),e[t]))for(let e in r){let t=r[e],n=this._convertIdToIndex(t,e);r[e]=n}}_convertIdToIndex(e,t){let r=e9[t];if(r in this.idToIndexMap){let n=this.idToIndexMap[r][e];if(!Number.isFinite(n))throw Error(`gltf v1: failed to resolve ${t} with id ${e}`);return n}return e}_updateObjects(e){for(let e of this.json.buffers)delete e.type}_updateMaterial(e){for(let t of e.materials){t.pbrMetallicRoughness={baseColorFactor:[1,1,1,1],metallicFactor:1,roughnessFactor:1};let r=t.values?.tex||t.values?.texture2d_0||t.values?.diffuseTex,n=e.textures.findIndex(e=>e.id===r);-1!==n&&(t.pbrMetallicRoughness.baseColorTexture={index:n})}}}async function e8(e,t,r=0,n,a){return function(e,t,r,n){if(n.core?.baseUrl&&(e.baseUri=n.core?.baseUrl),t instanceof ArrayBuffer&&!function(e,t=0,r={}){let n=new DataView(e),{magic:a=0x676c5446}=r,i=n.getUint32(t,!1);return i===a||0x676c5446===i}(t,r,n.glb)&&(t=new TextDecoder().decode(t)),"string"==typeof t)e.json=function(e){try{return JSON.parse(e)}catch(t){throw Error(`Failed to parse JSON from data starting with "${function(e,t=5){return"string"==typeof e?e.slice(0,t):ArrayBuffer.isView(e)?h(e.buffer,e.byteOffset,t):e instanceof ArrayBuffer?h(e,0,t):""}(e)}"`)}}(t);else if(t instanceof ArrayBuffer){let a={};r=function(e,t,r=0,n={}){var a,i,o,s,l,c,u;let f=new DataView(t),p=function(e,t=0){return`\
${String.fromCharCode(e.getUint8(t+0))}\
${String.fromCharCode(e.getUint8(t+1))}\
${String.fromCharCode(e.getUint8(t+2))}\
${String.fromCharCode(e.getUint8(t+3))}`}(f,r+0),m=f.getUint32(r+4,!0),d=f.getUint32(r+8,!0);switch(Object.assign(e,{header:{byteOffset:r,byteLength:d,hasBinChunk:!1},type:p,version:m,json:{},binChunks:[]}),r+=12,e.version){case 1:let h,b;return a=e,i=f,o=r,(0,v.v)(a.header.byteLength>20),h=i.getUint32(o+0,!0),b=i.getUint32(o+4,!0),o+=8,(0,v.v)(0===b),M(a,i,o,h),o+=h,o+=R(a,i,o,a.header.byteLength);case 2:return s=e,l=f,c=r,u={},(0,v.v)(s.header.byteLength>20),function(e,t,r,n){for(;r+8<=e.header.byteLength;){let a=t.getUint32(r+0,!0),i=t.getUint32(r+4,!0);switch(r+=8,i){case 0x4e4f534a:M(e,t,r,a);break;case 5130562:R(e,t,r,a);break;case 0:n.strict||M(e,t,r,a);break;case 1:n.strict||R(e,t,r,a)}r+=_(a,4)}}(s,l,c,u),c+s.header.byteLength;default:throw Error(`Invalid GLB version ${e.version}. Only supports version 1 and 2.`)}}(a,t,r,n.glb),(0,C.v)("glTF"===a.type,`Invalid GLB magic string ${a.type}`),e._glb=a,e.json=a.json}else(0,C.v)(!1,"GLTF: must be ArrayBuffer or string");let a=e.json.buffers||[];if(e.buffers=Array(a.length).fill(null),e._glb&&e._glb.header.hasBinChunk){let{binChunks:t}=e._glb;e.buffers[0]={arrayBuffer:t[0].arrayBuffer,byteOffset:t[0].byteOffset,byteLength:t[0].byteLength}}let i=e.json.images||[];e.images=Array(i.length).fill({})}(e,t,r,n),!function(e,t={}){new e2().normalize(e,t)}(e,{normalize:n?.gltf?.normalize}),!function(e,t={},r){for(let n of e$.filter(e=>e0(e.name,t)))n.preprocess?.(e,t,r)}(e,n,a),n?.gltf?.loadBuffers&&e.json.buffers&&await e4(e,n,a),n?.gltf?.loadImages&&await e6(e,n,a),await eq(e,n,a),e}async function e4(e,t,r){let n=e.json.buffers||[];for(let a=0;a<n.length;++a){let i=n[a];if(i.uri){let{fetch:n}=r;(0,C.v)(n);let o=I(i.uri,t,r),s=await r?.fetch?.(o),l=await s?.arrayBuffer?.();e.buffers[a]={arrayBuffer:l,byteOffset:0,byteLength:l.byteLength},delete i.uri}else null===e.buffers[a]&&(e.buffers[a]={arrayBuffer:new ArrayBuffer(i.byteLength),byteOffset:0,byteLength:i.byteLength})}}async function e6(e,t,r){let n=function(e){let t=new Set;for(let r of e.json.textures||[])void 0!==r.source&&t.add(r.source);return Array.from(t).sort()}(e),a=e.json.images||[],i=[];for(let o of n)i.push(e7(e,a[o],o,t,r));return await Promise.all(i)}async function e7(e,t,r,n,a){let i;if(t.uri&&!t.hasOwnProperty("bufferView")){let e=I(t.uri,n,a),{fetch:r}=a,o=await r(e);t.bufferView={data:i=await o.arrayBuffer()}}if(Number.isFinite(t.bufferView)){var o,s,l;let r,n,a,c=(o=e.json,s=e.buffers,l=t.bufferView,r=o.bufferViews[l],(0,C.v)(r),n=s[r.buffer],(0,C.v)(n),a=(r.byteOffset||0)+n.byteOffset,new Uint8Array(n.arrayBuffer,a,r.byteLength));i=(0,b._m)(c.buffer,c.byteOffset,c.byteLength)}(0,C.v)(i,"glTF image has no data");let c={...n,core:{...n?.core,mimeType:t.mimeType}},u=await (0,A.N9)(i,[g.$,B.E],c,a);u&&u[0]&&(u={compressed:!0,mipmaps:!1,width:u[0].width,height:u[0].height,data:u[0]}),e.images=e.images||[],e.images[r]=u}let e5={dataType:null,batchType:null,name:"glTF",id:"gltf",module:"gltf",version:"4.4.3",extensions:["gltf","glb"],mimeTypes:["model/gltf+json","model/gltf-binary"],text:!0,binary:!0,tests:["glTF"],parse:te,options:{gltf:{normalize:!0,loadBuffers:!0,loadImages:!0,decompressMeshes:!0}}};async function te(e,t={},r){let n={...e5.options,...t};n.gltf={...e5.options.gltf,...n.gltf};let a=t?.glb?.byteOffset||0;return await e8({},e,a,n,r)}},56557(e,t,r){r.d(t,{R:()=>f});var n=r(24252),a=r(89153),i=r(50933);let o={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},s={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},l={magFilter:10240,minFilter:10241,wrapS:10242,wrapT:10243},c={10240:9729,10241:9986,10242:10497,10243:10497};class u{baseUri="";jsonUnprocessed;json;buffers=[];images=[];postProcess(e,t={}){let{json:r,buffers:a=[],images:i=[]}=e,{baseUri:o=""}=e;return(0,n.v)(r),this.baseUri=o,this.buffers=a,this.images=i,this.jsonUnprocessed=r,this.json=this._resolveTree(e.json,t),this.json}_resolveTree(e,t={}){let r={...e};return this.json=r,e.bufferViews&&(r.bufferViews=e.bufferViews.map((e,t)=>this._resolveBufferView(e,t))),e.images&&(r.images=e.images.map((e,t)=>this._resolveImage(e,t))),e.samplers&&(r.samplers=e.samplers.map((e,t)=>this._resolveSampler(e,t))),e.textures&&(r.textures=e.textures.map((e,t)=>this._resolveTexture(e,t))),e.accessors&&(r.accessors=e.accessors.map((e,t)=>this._resolveAccessor(e,t))),e.materials&&(r.materials=e.materials.map((e,t)=>this._resolveMaterial(e,t))),e.meshes&&(r.meshes=e.meshes.map((e,t)=>this._resolveMesh(e,t))),e.nodes&&(r.nodes=e.nodes.map((e,t)=>this._resolveNode(e,t)),r.nodes=r.nodes.map((e,t)=>this._resolveNodeChildren(e))),e.skins&&(r.skins=e.skins.map((e,t)=>this._resolveSkin(e,t))),e.scenes&&(r.scenes=e.scenes.map((e,t)=>this._resolveScene(e,t))),"number"==typeof this.json.scene&&r.scenes&&(r.scene=r.scenes[this.json.scene]),r}getScene(e){return this._get(this.json.scenes,e)}getNode(e){return this._get(this.json.nodes,e)}getSkin(e){return this._get(this.json.skins,e)}getMesh(e){return this._get(this.json.meshes,e)}getMaterial(e){return this._get(this.json.materials,e)}getAccessor(e){return this._get(this.json.accessors,e)}getCamera(e){return this._get(this.json.cameras,e)}getTexture(e){return this._get(this.json.textures,e)}getSampler(e){return this._get(this.json.samplers,e)}getImage(e){return this._get(this.json.images,e)}getBufferView(e){return this._get(this.json.bufferViews,e)}getBuffer(e){return this._get(this.json.buffers,e)}_get(e,t){if("object"==typeof t)return t;let r=e&&e[t];return r||console.warn(`glTF file error: Could not find ${e}[${t}]`),r}_resolveScene(e,t){return{...e,id:e.id||`scene-${t}`,nodes:(e.nodes||[]).map(e=>this.getNode(e))}}_resolveNode(e,t){let r={...e,id:e?.id||`node-${t}`};return void 0!==e.mesh&&(r.mesh=this.getMesh(e.mesh)),void 0!==e.camera&&(r.camera=this.getCamera(e.camera)),void 0!==e.skin&&(r.skin=this.getSkin(e.skin)),void 0!==e.meshes&&e.meshes.length&&(r.mesh=e.meshes.reduce((e,t)=>{let r=this.getMesh(t);return e.id=r.id,e.primitives=e.primitives.concat(r.primitives),e},{primitives:[]})),r}_resolveNodeChildren(e){return e.children&&(e.children=e.children.map(e=>this.getNode(e))),e}_resolveSkin(e,t){let r="number"==typeof e.inverseBindMatrices?this.getAccessor(e.inverseBindMatrices):void 0;return{...e,id:e.id||`skin-${t}`,inverseBindMatrices:r}}_resolveMesh(e,t){let r={...e,id:e.id||`mesh-${t}`,primitives:[]};return e.primitives&&(r.primitives=e.primitives.map(e=>{let t={...e,attributes:{},indices:void 0,material:void 0},r=e.attributes;for(let e in r)t.attributes[e]=this.getAccessor(r[e]);return void 0!==e.indices&&(t.indices=this.getAccessor(e.indices)),void 0!==e.material&&(t.material=this.getMaterial(e.material)),t})),r}_resolveMaterial(e,t){let r={...e,id:e.id||`material-${t}`};if(r.normalTexture&&(r.normalTexture={...r.normalTexture},r.normalTexture.texture=this.getTexture(r.normalTexture.index)),r.occlusionTexture&&(r.occlusionTexture={...r.occlusionTexture},r.occlusionTexture.texture=this.getTexture(r.occlusionTexture.index)),r.emissiveTexture&&(r.emissiveTexture={...r.emissiveTexture},r.emissiveTexture.texture=this.getTexture(r.emissiveTexture.index)),r.emissiveFactor||(r.emissiveFactor=r.emissiveTexture?[1,1,1]:[0,0,0]),r.pbrMetallicRoughness){r.pbrMetallicRoughness={...r.pbrMetallicRoughness};let e=r.pbrMetallicRoughness;e.baseColorTexture&&(e.baseColorTexture={...e.baseColorTexture},e.baseColorTexture.texture=this.getTexture(e.baseColorTexture.index)),e.metallicRoughnessTexture&&(e.metallicRoughnessTexture={...e.metallicRoughnessTexture},e.metallicRoughnessTexture.texture=this.getTexture(e.metallicRoughnessTexture.index))}return r}_resolveAccessor(e,t){let r=s[e.componentType],n=o[e.type],l={...e,id:e.id||`accessor-${t}`,bytesPerComponent:r,components:n,bytesPerElement:r*n,value:void 0,bufferView:void 0,sparse:void 0};if(void 0!==e.bufferView&&(l.bufferView=this.getBufferView(e.bufferView)),l.bufferView){let e=l.bufferView.buffer,{ArrayType:t,byteLength:r}=(0,a.aF)(l,l.bufferView),n=(l.bufferView.byteOffset||0)+(l.byteOffset||0)+e.byteOffset,o=(0,i.aK)(e.arrayBuffer,n,r);l.bufferView.byteStride&&(o=this._getValueFromInterleavedBuffer(e,n,l.bufferView.byteStride,l.bytesPerElement,l.count)),l.value=new t(o)}return l}_getValueFromInterleavedBuffer(e,t,r,n,a){let i=new Uint8Array(a*n);for(let o=0;o<a;o++){let a=t+o*r;i.set(new Uint8Array(e.arrayBuffer.slice(a,a+n)),o*n)}return i.buffer}_resolveTexture(e,t){return{...e,id:e.id||`texture-${t}`,sampler:"number"==typeof e.sampler?this.getSampler(e.sampler):{id:"default-sampler",parameters:c},source:"number"==typeof e.source?this.getImage(e.source):void 0}}_resolveSampler(e,t){let r={id:e.id||`sampler-${t}`,...e,parameters:{}};for(let e in r){let t=this._enumSamplerParameter(e);void 0!==t&&(r.parameters[t]=r[e])}return r}_enumSamplerParameter(e){return l[e]}_resolveImage(e,t){let r={...e,id:e.id||`image-${t}`,image:null,bufferView:void 0!==e.bufferView?this.getBufferView(e.bufferView):void 0},n=this.images[t];return n&&(r.image=n),r}_resolveBufferView(e,t){let r=e.buffer,n=this.buffers[r].arrayBuffer,a=this.buffers[r].byteOffset||0;return e.byteOffset&&(a+=e.byteOffset),{id:`bufferView-${t}`,...e,buffer:this.buffers[r],data:new Uint8Array(n,a,e.byteLength)}}_resolveCamera(e,t){let r={...e,id:e.id||`camera-${t}`};return r.perspective,r.orthographic,r}}function f(e,t){return new u().postProcess(e,t)}},87021(e,t,r){r.d(t,{$j:()=>n,E9:()=>a});let n={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},a={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4}},89153(e,t,r){r.d(t,{S3:()=>m,aF:()=>p,rA:()=>f,v7:()=>u});var n=r(24252),a=r(87021);let i=["SCALAR","VEC2","VEC3","VEC4"],o=new Map([[Int8Array,5120],[Uint8Array,5121],[Int16Array,5122],[Uint16Array,5123],[Uint32Array,5125],[Float32Array,5126],[Float64Array,5130]]),s={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},l={5120:1,5121:1,5122:2,5123:2,5125:4,5126:4},c={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};function u(e){return i[e-1]||i[0]}function f(e){let t=o.get(e.constructor);if(!t)throw Error("Illegal typed array");return t}function p(e,t){let r=c[e.componentType],i=s[e.type],o=l[e.componentType],u=e.count*i,f=e.count*i*o;return(0,n.v)(f>=0&&f<=t.byteLength),{ArrayType:r,length:u,byteLength:f,componentByteSize:a.E9[e.componentType],numberOfComponentsInElement:a.$j[e.type]}}function m(e){let{images:t,bufferViews:r}=e;r=r||[];let n=(t=t||[]).map(e=>e.bufferView);return(r=r.filter(e=>!n.includes(e))).reduce((e,t)=>e+t.byteLength,0)+Math.ceil(4*t.reduce((e,t)=>{let{width:r,height:n}=t.image;return e+r*n},0)*1.33)}},24252(e,t,r){r.d(t,{v:()=>n});function n(e,t){if(!e)throw Error(t||"assert failed: gltf")}},10383(e,t,r){function n(e){globalThis.loaders||={},globalThis.loaders.modules||={},Object.assign(globalThis.loaders.modules,e)}function a(e){return globalThis.loaders?.modules?.[e]||null}r.d(t,{Qz:()=>n,w7:()=>a})},44585(e,t,r){r.d(t,{N9:()=>n});async function n(e,t,r,n){return n._parse(e,t,r,n)}},18236(e,t,r){r.d(t,{Zt:()=>a,ol:()=>i});var n=r(30397);function a(e,t={}){return{fields:function(e){let t=[];for(let r in e){let n=e[r];t.push(i(r,n))}return t}(e),metadata:t}}function i(e,t,r){var a;let i,o=(0,n.UE)(t.value),s=r||(i={},"byteOffset"in(a=t)&&(i.byteOffset=a.byteOffset.toString(10)),"byteStride"in a&&(i.byteStride=a.byteStride.toString(10)),"normalized"in a&&(i.normalized=a.normalized.toString()),i);return{name:e,type:{type:"fixed-size-list",listSize:t.size,children:[{name:"value",type:o}]},nullable:!1,metadata:s}}},10543(e,t,r){r.d(t,{E:()=>a});var n=r(53413);let a={...{dataType:null,batchType:null,name:"Basis",id:"basis",module:"textures",version:"4.4.3",worker:!0,extensions:["basis","ktx2"],mimeTypes:["application/octet-stream","image/ktx2"],tests:["sB"],binary:!0,options:{basis:{format:"auto",containerFormat:"auto",module:"transcoder"}}},parse:n.af}},53413(e,t,r){let n,a;r.d(t,{af:()=>g});var i=r(51664),o=r(10383);async function s(e){(0,o.Qz)(e.modules);let t=(0,o.w7)("basis");return t||(n||=l(e),await n)}async function l(e){var t,r;let n,a=null,o=null;return[a,o]=await Promise.all([await (0,i._e)("basis_transcoder.js","textures",e),await (0,i._e)("basis_transcoder.wasm","textures",e)]),a=a||globalThis.BASIS,await (t=a,n={},(r=o)&&(n.wasmBinary=r),new Promise(e=>{t(n).then(t=>{let{BasisFile:r,initializeBasis:n}=t;n(),e({BasisFile:r})})}))}async function c(e){let t=e.modules||{};return t.basisEncoder?t.basisEncoder:(a=a||u(e),await a)}async function u(e){var t,r;let n,a=null,o=null;return[a,o]=await Promise.all([await (0,i._e)("basis_encoder.js","textures",e),await (0,i._e)("basis_encoder.wasm","textures",e)]),a=a||globalThis.BASIS,await (t=a,n={},(r=o)&&(n.wasmBinary=r),new Promise(e=>{t(n).then(t=>{let{BasisFile:r,KTX2File:n,initializeBasis:a,BasisEncoder:i}=t;a(),e({BasisFile:r,KTX2File:n,BasisEncoder:i})})}))}let f=["","WEBKIT_","MOZ_"],p={WEBGL_compressed_texture_s3tc:["bc1-rgb-unorm-webgl","bc1-rgba-unorm","bc2-rgba-unorm","bc3-rgba-unorm"],WEBGL_compressed_texture_s3tc_srgb:["bc1-rgb-unorm-srgb-webgl","bc1-rgba-unorm-srgb","bc2-rgba-unorm-srgb","bc3-rgba-unorm-srgb"],EXT_texture_compression_rgtc:["bc4-r-unorm","bc4-r-snorm","bc5-rg-unorm","bc5-rg-snorm"],EXT_texture_compression_bptc:["bc6h-rgb-ufloat","bc6h-rgb-float","bc7-rgba-unorm","bc7-rgba-unorm-srgb"],WEBGL_compressed_texture_etc1:["etc1-rgb-unorm-webgl"],WEBGL_compressed_texture_etc:["etc2-rgb8unorm","etc2-rgb8unorm-srgb","etc2-rgb8a1unorm","etc2-rgb8a1unorm-srgb","etc2-rgba8unorm","etc2-rgba8unorm-srgb","eac-r11unorm","eac-r11snorm","eac-rg11unorm","eac-rg11snorm"],WEBGL_compressed_texture_pvrtc:["pvrtc-rgb4unorm-webgl","pvrtc-rgba4unorm-webgl","pvrtc-rgb2unorm-webgl","pvrtc-rgba2unorm-webgl"],WEBGL_compressed_texture_atc:["atc-rgb-unorm-webgl","atc-rgba-unorm-webgl","atc-rgbai-unorm-webgl"],WEBGL_compressed_texture_astc:["astc-4x4-unorm","astc-4x4-unorm-srgb","astc-5x4-unorm","astc-5x4-unorm-srgb","astc-5x5-unorm","astc-5x5-unorm-srgb","astc-6x5-unorm","astc-6x5-unorm-srgb","astc-6x6-unorm","astc-6x6-unorm-srgb","astc-8x5-unorm","astc-8x5-unorm-srgb","astc-8x6-unorm","astc-8x6-unorm-srgb","astc-8x8-unorm","astc-8x8-unorm-srgb","astc-10x5-unorm","astc-10x5-unorm-srgb","astc-10x6-unorm","astc-10x6-unorm-srgb","astc-10x8-unorm","astc-10x8-unorm-srgb","astc-10x10-unorm","astc-10x10-unorm-srgb","astc-12x10-unorm","astc-12x10-unorm-srgb","astc-12x12-unorm","astc-12x12-unorm-srgb"]},m=null;var d=r(49755);let h=Promise.resolve(),b={etc1:{basisFormat:0,compressed:!0,format:36196,textureFormat:"etc1-rgb-unorm-webgl"},etc2:{basisFormat:1,compressed:!0,format:37493,textureFormat:"etc2-rgba8unorm"},bc1:{basisFormat:2,compressed:!0,format:33776,textureFormat:"bc1-rgb-unorm-webgl"},bc3:{basisFormat:3,compressed:!0,format:33779,textureFormat:"bc3-rgba-unorm"},bc4:{basisFormat:4,compressed:!0,format:36283,textureFormat:"bc4-r-unorm"},bc5:{basisFormat:5,compressed:!0,format:36285,textureFormat:"bc5-rg-unorm"},"bc7-m6-opaque-only":{basisFormat:6,compressed:!0,format:36492,textureFormat:"bc7-rgba-unorm"},"bc7-m5":{basisFormat:7,compressed:!0,format:36492,textureFormat:"bc7-rgba-unorm"},"pvrtc1-4-rgb":{basisFormat:8,compressed:!0,format:35840,textureFormat:"pvrtc-rgb4unorm-webgl"},"pvrtc1-4-rgba":{basisFormat:9,compressed:!0,format:35842,textureFormat:"pvrtc-rgba4unorm-webgl"},"astc-4x4":{basisFormat:10,compressed:!0,format:37808,textureFormat:"astc-4x4-unorm"},"atc-rgb":{basisFormat:11,compressed:!0,format:35986,textureFormat:"atc-rgb-unorm-webgl"},"atc-rgba-interpolated-alpha":{basisFormat:12,compressed:!0,format:34798,textureFormat:"atc-rgbai-unorm-webgl"},rgba32:{basisFormat:13,compressed:!1,format:32856,textureFormat:"rgba8unorm"},rgb565:{basisFormat:14,compressed:!1,format:36194,textureFormat:"rgb565unorm-webgl"},bgr565:{basisFormat:15,compressed:!1,format:36194,textureFormat:"rgb565unorm-webgl"},rgba4444:{basisFormat:16,compressed:!1,format:32854,textureFormat:"rgba4unorm-webgl"}};async function A(e){let t,r=h;h=new Promise(e=>{t=e}),await r;try{return await e()}finally{t()}}async function g(e,t={}){let r=(0,i.$j)(t);return await A(async()=>{if(!t.basis?.containerFormat||"auto"===t.basis.containerFormat){if((0,d.e)(e))return C((await c(r)).KTX2File,e,t);let{BasisFile:n}=await s(r);return B(n,e,t)}if("encoder"===t.basis.module){let n=await c(r);return"ktx2"===t.basis.containerFormat?C(n.KTX2File,e,t):B(n.BasisFile,e,t)}{let{BasisFile:n}=await s(r);return B(n,e,t)}})}function B(e,t,r){let n=new e(new Uint8Array(t));try{if(!n.startTranscoding())throw Error("Failed to start basis transcoding");let e=n.getNumImages(),t=[];for(let a=0;a<e;a++){let e=n.getNumLevels(a),i=[];for(let t=0;t<e;t++)i.push(function(e,t,r,n){let a=e.getImageWidth(t,r),i=e.getImageHeight(t,r),o=e.getHasAlpha(),{compressed:s,format:l,basisFormat:c,textureFormat:u}=v(n,o),f=new Uint8Array(e.getImageTranscodedSizeInBytes(t,r,c));if(!e.transcodeImage(f,t,r,c,0,0))throw Error("failed to start Basis transcoding");return{shape:"texture-level",width:a,height:i,data:f,compressed:s,...void 0!==l?{format:l}:{},...void 0!==u?{textureFormat:u}:{},hasAlpha:o}}(n,a,t,r));t.push(i)}return t}finally{n.close(),n.delete()}}function C(e,t,r){let n=new e(new Uint8Array(t));try{if(!n.startTranscoding())throw Error("failed to start KTX2 transcoding");let e=n.getLevels(),t=[];for(let a=0;a<e;a++)t.push(function(e,t,r){let{alphaFlag:n,height:a,width:i}=e.getImageLevelInfo(t,0,0),{compressed:o,format:s,basisFormat:l,textureFormat:c}=v(r,n),u=e.getImageTranscodedSizeInBytes(t,0,0,l),f=new Uint8Array(u);if(!e.transcodeImage(f,t,0,0,l,0,-1,-1))throw Error("Failed to transcode KTX2 image");return{shape:"texture-level",width:i,height:a,data:f,compressed:o,...void 0!==s?{format:s}:{},...void 0!==c?{textureFormat:c}:{},levelSize:u,hasAlpha:n}}(n,a,r));return[t]}finally{n.close(),n.delete()}}function v(e,t){let r=e.basis?.format||"auto";"auto"===r&&(r=e.basis?.supportedTextureFormats?_(e.basis.supportedTextureFormats):_()),"object"==typeof r&&(r=t?r.alpha:r.noAlpha);let n=b[r.toLowerCase()];if(!n)throw Error(`Unknown Basis format ${r}`);return n}function _(e=function(e){if(!m){for(let t of(e=e||function(){try{return document.createElement("canvas").getContext("webgl")}catch(e){return null}}()||void 0,m=new Set,f))for(let r in p)if(e&&e.getExtension(`${t}${r}`))for(let e of p[r])m.add(e)}return m}()){let t=new Set(e);if(M(t,["astc-4x4-unorm","astc-4x4-unorm-srgb"]))return"astc-4x4";if(M(t,["bc7-rgba-unorm","bc7-rgba-unorm-srgb"]))return{alpha:"bc7-m5",noAlpha:"bc7-m6-opaque-only"};if(M(t,["bc1-rgb-unorm-webgl","bc1-rgb-unorm-srgb-webgl","bc1-rgba-unorm","bc1-rgba-unorm-srgb","bc2-rgba-unorm","bc2-rgba-unorm-srgb","bc3-rgba-unorm","bc3-rgba-unorm-srgb"]))return{alpha:"bc3",noAlpha:"bc1"};if(M(t,["pvrtc-rgb4unorm-webgl","pvrtc-rgba4unorm-webgl","pvrtc-rgb2unorm-webgl","pvrtc-rgba2unorm-webgl"]))return{alpha:"pvrtc1-4-rgba",noAlpha:"pvrtc1-4-rgb"};if(M(t,["etc2-rgb8unorm","etc2-rgb8unorm-srgb","etc2-rgb8a1unorm","etc2-rgb8a1unorm-srgb","etc2-rgba8unorm","etc2-rgba8unorm-srgb","eac-r11unorm","eac-r11snorm","eac-rg11unorm","eac-rg11snorm"]))return"etc2";else if(t.has("etc1-rgb-unorm-webgl"))return"etc1";else if(M(t,["atc-rgb-unorm-webgl","atc-rgba-unorm-webgl","atc-rgbai-unorm-webgl"]))return{alpha:"atc-rgba-interpolated-alpha",noAlpha:"atc-rgb"};return"rgb565"}function M(e,t){return t.some(t=>e.has(t))}Object.freeze(Object.keys(b))},49755(e,t,r){r.d(t,{V:()=>m,e:()=>p});var n=r(83087);class a{constructor(){this.vkFormat=0,this.typeSize=1,this.pixelWidth=0,this.pixelHeight=0,this.pixelDepth=0,this.layerCount=0,this.faceCount=1,this.supercompressionScheme=0,this.levels=[],this.dataFormatDescriptor=[{vendorId:0,descriptorType:0,descriptorBlockSize:0,versionNumber:2,colorModel:0,colorPrimaries:1,transferFunction:2,flags:0,texelBlockDimension:[0,0,0,0],bytesPlane:[0,0,0,0,0,0,0,0],samples:[]}],this.keyValue={},this.globalData=null}}class i{constructor(e,t,r,n){this._dataView=void 0,this._littleEndian=void 0,this._offset=void 0,this._dataView=new DataView(e.buffer,e.byteOffset+t,r),this._littleEndian=n,this._offset=0}_nextUint8(){let e=this._dataView.getUint8(this._offset);return this._offset+=1,e}_nextUint16(){let e=this._dataView.getUint16(this._offset,this._littleEndian);return this._offset+=2,e}_nextUint32(){let e=this._dataView.getUint32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint64(){let e=this._dataView.getUint32(this._offset,this._littleEndian),t=this._dataView.getUint32(this._offset+4,this._littleEndian);return this._offset+=8,e+0x100000000*t}_nextInt32(){let e=this._dataView.getInt32(this._offset,this._littleEndian);return this._offset+=4,e}_nextUint8Array(e){let t=new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+this._offset,e);return this._offset+=e,t}_skip(e){return this._offset+=e,this}_scan(e,t=0){let r=this._offset,n=0;for(;this._dataView.getUint8(this._offset)!==t&&n<e;)n++,this._offset++;return n<e&&this._offset++,new Uint8Array(this._dataView.buffer,this._dataView.byteOffset+r,n)}}new Uint8Array([0]);let o=[171,75,84,88,32,50,48,187,13,10,26,10];function s(e){return new TextDecoder().decode(e)}var l=r(14062),c=r(5217);let u={131:33776,132:35916,133:33777,134:35917,135:33778,136:35918,137:33779,138:35919,139:36283,140:36284,141:36285,142:36286,147:37492,148:37494,149:37496,150:37497,151:37493,152:37495,153:37488,154:37489,155:37490,156:37491,157:37808,158:37840,159:37809,160:37841,161:37810,162:37842,163:37811,164:37843,165:37812,166:37844,167:37813,168:37845,169:37814,170:37846,171:37815,172:37847,173:37816,174:37848,175:37817,176:37849,177:37818,178:37850,179:37819,180:37851,181:37820,182:37852,183:37821,184:37853,1000054e3:35843,0x3b9b9cf1:35842,1000066e3:37808,0x3b9bcbd1:37809,0x3b9bcbd2:37810,0x3b9bcbd3:37811,0x3b9bcbd4:37812,0x3b9bcbd5:37813,0x3b9bcbd6:37814,0x3b9bcbd7:37815,0x3b9bcbd8:37816,0x3b9bcbd9:37817,0x3b9bcbda:37818,0x3b9bcbdb:37819,0x3b9bcbdc:37820,0x3b9bcbdd:37821},f=[171,75,84,88,32,50,48,187,13,10,26,10];function p(e){let t=new Uint8Array(e);return!(t.byteLength<f.length||t[0]!==f[0]||t[1]!==f[1]||t[2]!==f[2]||t[3]!==f[3]||t[4]!==f[4]||t[5]!==f[5]||t[6]!==f[6]||t[7]!==f[7]||t[8]!==f[8]||t[9]!==f[9]||t[10]!==f[10]||t[11]!==f[11])}function m(e){var t;let r=function(e){let t=new Uint8Array(e.buffer,e.byteOffset,o.length);if(t[0]!==o[0]||t[1]!==o[1]||t[2]!==o[2]||t[3]!==o[3]||t[4]!==o[4]||t[5]!==o[5]||t[6]!==o[6]||t[7]!==o[7]||t[8]!==o[8]||t[9]!==o[9]||t[10]!==o[10]||t[11]!==o[11])throw Error("Missing KTX 2.0 identifier.");let r=new a,n=17*Uint32Array.BYTES_PER_ELEMENT,l=new i(e,o.length,n,!0);r.vkFormat=l._nextUint32(),r.typeSize=l._nextUint32(),r.pixelWidth=l._nextUint32(),r.pixelHeight=l._nextUint32(),r.pixelDepth=l._nextUint32(),r.layerCount=l._nextUint32(),r.faceCount=l._nextUint32();let c=l._nextUint32();r.supercompressionScheme=l._nextUint32();let u=l._nextUint32(),f=l._nextUint32(),p=l._nextUint32(),m=l._nextUint32(),d=l._nextUint64(),h=l._nextUint64(),b=new i(e,o.length+n,3*c*8,!0);for(let t=0;t<c;t++)r.levels.push({levelData:new Uint8Array(e.buffer,e.byteOffset+b._nextUint64(),b._nextUint64()),uncompressedByteLength:b._nextUint64()});let A=new i(e,u,f,!0),g={vendorId:A._skip(4)._nextUint16(),descriptorType:A._nextUint16(),versionNumber:A._nextUint16(),descriptorBlockSize:A._nextUint16(),colorModel:A._nextUint8(),colorPrimaries:A._nextUint8(),transferFunction:A._nextUint8(),flags:A._nextUint8(),texelBlockDimension:[A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8()],bytesPlane:[A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8()],samples:[]},B=(g.descriptorBlockSize/4-6)/4;for(let e=0;e<B;e++){let t={bitOffset:A._nextUint16(),bitLength:A._nextUint8(),channelType:A._nextUint8(),samplePosition:[A._nextUint8(),A._nextUint8(),A._nextUint8(),A._nextUint8()],sampleLower:-1/0,sampleUpper:1/0};64&t.channelType?(t.sampleLower=A._nextInt32(),t.sampleUpper=A._nextInt32()):(t.sampleLower=A._nextUint32(),t.sampleUpper=A._nextUint32()),g.samples[e]=t}r.dataFormatDescriptor.length=0,r.dataFormatDescriptor.push(g);let C=new i(e,p,m,!0);for(;C._offset<m;){let e=C._nextUint32(),t=C._scan(e),n=s(t);if(r.keyValue[n]=C._nextUint8Array(e-t.byteLength-1),n.match(/^ktx/i)){let e=s(r.keyValue[n]);r.keyValue[n]=e.substring(0,e.lastIndexOf("\0"))}let a=e%4?4-e%4:0;C._skip(a)}if(h<=0)return r;let v=new i(e,d,h,!0),_=v._nextUint16(),M=v._nextUint16(),R=v._nextUint32(),I=v._nextUint32(),y=v._nextUint32(),S=v._nextUint32(),E=[];for(let e=0;e<c;e++)E.push({imageFlags:v._nextUint32(),rgbSliceByteOffset:v._nextUint32(),rgbSliceByteLength:v._nextUint32(),alphaSliceByteOffset:v._nextUint32(),alphaSliceByteLength:v._nextUint32()});let x=d+v._offset,T=x+R,F=T+I,U=F+y,D=new Uint8Array(e.buffer,e.byteOffset+x,R),H=new Uint8Array(e.buffer,e.byteOffset+T,I);return r.globalData={endpointCount:_,selectorCount:M,imageDescs:E,endpointsData:D,selectorsData:H,tablesData:new Uint8Array(e.buffer,e.byteOffset+F,y),extendedData:new Uint8Array(e.buffer,e.byteOffset+U,S)},r}(new Uint8Array(e)),f=Math.max(1,r.levels.length),p=r.pixelWidth,m=r.pixelHeight,d=(t=r.vkFormat,(0,c.b)(u[t]));return void 0===d&&n.R.warn(`KTX2 container vkFormat ${r.vkFormat} does not map to a known texture format; returning texture levels without format metadata.`)(),(0,l.C)(r.levels,{mipMapLevels:f,width:p,height:m,sizeFunction:e=>e.uncompressedByteLength,textureFormat:d})}},14062(e,t,r){r.d(t,{C:()=>a});var n=r(5217);function a(e,t){let r=Array(t.mipMapLevels),a=t.textureFormat||(0,n.b)(t.internalFormat),i=t.internalFormat||(0,n.D)(t.textureFormat),o=t.width,s=t.height,l=0;for(let n=0;n<t.mipMapLevels;++n){var c,u,f,p,m,d,h,b,A;let g=(c=t,u=o,f=s,p=e,m=n,Array.isArray(p)?c.sizeFunction(p[m]):c.sizeFunction(u,f)),B={shape:"texture-level",compressed:!0,data:(d=e,h=n,b=l,A=g,Array.isArray(d)?d[h].levelData:new Uint8Array(d.buffer,d.byteOffset+b,A)),width:o,height:s,levelSize:g};void 0!==i&&(B.format=i),a&&(B.textureFormat=a),r[n]=B,o=Math.max(1,o>>1),s=Math.max(1,s>>1),l+=g}return r}},5217(e,t,r){r.d(t,{D:()=>o,b:()=>i});let n={34836:"rgba32float",33776:"bc1-rgb-unorm-webgl",35916:"bc1-rgb-unorm-srgb-webgl",33777:"bc1-rgba-unorm",35917:"bc1-rgba-unorm-srgb",33778:"bc2-rgba-unorm",35918:"bc2-rgba-unorm-srgb",33779:"bc3-rgba-unorm",35919:"bc3-rgba-unorm-srgb",36283:"bc4-r-unorm",36284:"bc4-r-snorm",36285:"bc5-rg-unorm",36286:"bc5-rg-snorm",37492:"etc2-rgb8unorm",37494:"etc2-rgb8unorm-srgb",37496:"etc2-rgb8a1unorm",37497:"etc2-rgb8a1unorm-srgb",37493:"etc2-rgba8unorm",37495:"etc2-rgba8unorm-srgb",37488:"eac-r11unorm",37489:"eac-r11snorm",37490:"eac-rg11unorm",37491:"eac-rg11snorm",37808:"astc-4x4-unorm",37840:"astc-4x4-unorm-srgb",37809:"astc-5x4-unorm",37841:"astc-5x4-unorm-srgb",37810:"astc-5x5-unorm",37842:"astc-5x5-unorm-srgb",37811:"astc-6x5-unorm",37843:"astc-6x5-unorm-srgb",37812:"astc-6x6-unorm",37844:"astc-6x6-unorm-srgb",37813:"astc-8x5-unorm",37845:"astc-8x5-unorm-srgb",37814:"astc-8x6-unorm",37846:"astc-8x6-unorm-srgb",37815:"astc-8x8-unorm",37847:"astc-8x8-unorm-srgb",37816:"astc-10x5-unorm",37848:"astc-10x5-unorm-srgb",37817:"astc-10x6-unorm",37849:"astc-10x6-unorm-srgb",37818:"astc-10x8-unorm",37850:"astc-10x8-unorm-srgb",37819:"astc-10x10-unorm",37851:"astc-10x10-unorm-srgb",37820:"astc-12x10-unorm",37852:"astc-12x10-unorm-srgb",37821:"astc-12x12-unorm",37853:"astc-12x12-unorm-srgb",35840:"pvrtc-rgb4unorm-webgl",35842:"pvrtc-rgba4unorm-webgl",35841:"pvrtc-rgb2unorm-webgl",35843:"pvrtc-rgba2unorm-webgl",36196:"etc1-rgb-unorm-webgl",35986:"atc-rgb-unorm-webgl",35987:"atc-rgba-unorm-webgl",34798:"atc-rgbai-unorm-webgl"},a=Object.fromEntries(Object.entries(n).map(([e,t])=>[t,Number(e)]));function i(e){if(void 0!==e)return n[e]}function o(e){if(void 0!==e)return a[e]}},51664(e,t,r){r.d(t,{$j:()=>s,_e:()=>l});var n=r(80155),a=r(82117),i=r(58091);let o={};function s(e={}){let t=e.useLocalLibraries??e.core?.useLocalLibraries,r=e.CDN??e.core?.CDN,n=e.modules;return{...void 0!==t?{useLocalLibraries:t}:{},...void 0!==r?{CDN:r}:{},...void 0!==n?{modules:n}:{}}}async function l(e,t=null,r={},s=null){return t&&(e=function(e,t,r={},o=null){if(r?.core)throw Error("loadLibrary: options.core must be pre-normalized");if(!r.useLocalLibraries&&e.startsWith("http"))return e;o=o||e;let s=r.modules||{};return s[o]?s[o]:n.Bd?r.CDN?((0,a.v)(r.CDN.startsWith("http")),`${r.CDN}/${t}@${i.x}/dist/libs/${o}`):n.xD?`../src/libs/${o}`:`modules/${t}/src/libs/${o}`:`modules/${t}/dist/libs/${o}`}(e,t,r,s)),o[e]=o[e]||c(e),await o[e]}async function c(e){if(e.endsWith("wasm"))return await u(e);if(!n.Bd){let{requireFromFile:t}=globalThis.loaders||{};try{let r=await t?.(e);if(r||!e.includes("/dist/libs/"))return r;return await t?.(e.replace("/dist/libs/","/src/libs/"))}catch(r){if(e.includes("/dist/libs/"))try{return await t?.(e.replace("/dist/libs/","/src/libs/"))}catch{}return console.error(r),null}}return n.xD?importScripts(e):function(e,t){if(!n.Bd){let{requireFromString:r}=globalThis.loaders||{};return r?.(e,t)}if(n.xD)return eval.call(globalThis,e),null;let r=document.createElement("script");r.id=t;try{r.appendChild(document.createTextNode(e))}catch(t){r.text=e}return document.body.appendChild(r),null}(await f(e),e)}async function u(e){let{readFileAsArrayBuffer:t}=globalThis.loaders||{};if(n.Bd||!t||e.startsWith("http")){let t=await fetch(e);return await t.arrayBuffer()}try{return await t(e)}catch{if(e.includes("/dist/libs/"))return await t(e.replace("/dist/libs/","/src/libs/"));throw Error(`Failed to load ArrayBuffer from ${e}`)}}async function f(e){let{readFileAsText:t}=globalThis.loaders||{};if(n.Bd||!t||e.startsWith("http")){let t=await fetch(e);return await t.text()}try{return await t(e)}catch{if(e.includes("/dist/libs/"))return await t(e.replace("/dist/libs/","/src/libs/"));throw Error(`Failed to load text from ${e}`)}}},92207(e,t,r){r.d(t,{o:()=>l});var n=r(6706),a=r(35097),i=r(13559),o=r(354),s=r(29995);class l extends o.V{children;constructor(e={}){let{children:t=[]}=e=Array.isArray(e)?{children:e}:e;i.R.assert(t.every(e=>e instanceof o.V),"every child must an instance of ScenegraphNode"),super(e),this.children=t}getBounds(){let e=(0,s.hw)();return this.traverse((t,{worldMatrix:r})=>{let a=t.getBounds();if(!a)return;let i=new n.k(r).multiplyRight(t.matrix);(0,s.eI)(e,a,i)}),(0,s.$f)(e)?e:null}destroy(){this.children.forEach(e=>e.destroy()),this.removeAll(),super.destroy()}add(...e){for(let t of e)Array.isArray(t)?this.add(...t):this.children.push(t);return this}remove(e){let t=this.children,r=t.indexOf(e);return r>-1&&t.splice(r,1),this}removeAll(){return this.children=[],this}traverse(e,{worldMatrix:t=new n.k}={}){let r=new n.k(t).multiplyRight(this.matrix);for(let t of this.children)t instanceof l?t.traverse(e,{worldMatrix:r}):e(t,{worldMatrix:r})}traverseDepthSorted(e,{viewMatrix:t,worldMatrix:r=new n.k,order:i="back-to-front"}){let o=new n.k(t),s=[];this.traverse((e,t)=>{let r=e.getBounds(),i=r?new a.P(r[0]).add(r[1]).divide([2,2,2]):new a.P,l=new n.k(t.worldMatrix).multiplyRight(e.matrix);l.transformAsPoint(i,i),o.transformAsPoint(i,i),s.push({node:e,context:{worldMatrix:l,bounds:r,depth:-i[2]},index:s.length})},{worldMatrix:new n.k(r)});let l="back-to-front"===i?-1:1;for(let{node:t,context:r}of(s.sort((e,t)=>l*(e.context.depth-t.context.depth)||e.index-t.index),s))e(t,r)}preorderTraversal(e,{worldMatrix:t=new n.k}={}){let r=new n.k(t).multiplyRight(this.matrix);for(let t of(e(this,{worldMatrix:r}),this.children))t instanceof l?t.preorderTraversal(e,{worldMatrix:r}):e(t,{worldMatrix:r})}}},84793(e,t,r){r.d(t,{s:()=>i});var n=r(354),a=r(29995);class i extends n.V{model;instanceMatrices;bounds=null;managedResources;constructor(e){super(e),this.model=e.model,this.managedResources=e.managedResources||[],this.instanceMatrices=e.instanceMatrices||null,this.bounds=e.bounds?this.instanceMatrices?function(e,t){let r=(0,a.hw)();for(let n of t)(0,a.eI)(r,e,n);return(0,a.$f)(r)?r:null}(e.bounds,this.instanceMatrices):e.bounds:null,this.setProps(e)}destroy(){this.model&&(this.model.destroy(),this.model=null),this.managedResources.forEach(e=>e.destroy()),this.managedResources=[]}getBounds(){return this.bounds}draw(e){return this.model.draw(e)}}},29995(e,t,r){r.d(t,{$f:()=>s,eI:()=>o,hw:()=>i});var n=r(6706),a=r(35097);function i(){return[[1/0,1/0,1/0],[-1/0,-1/0,-1/0]]}function o(e,t,r){let i=new n.k(r);for(let r=0;r<8;r++){let n=new a.P(t[1&r?1:0][0],t[2&r?1:0][1],t[4&r?1:0][2]);i.transformAsPoint(n,n);for(let t=0;t<3;t++)e[0][t]=Math.min(e[0][t],n[t]),e[1][t]=Math.max(e[1][t],n[t])}}function s(e){return Number.isFinite(e[0][0])}},354(e,t,r){r.d(t,{V:()=>s});var n=r(6706),a=r(35097),i=r(51208);function o(e,t){if(!e)throw Error(t)}class s{id;matrix=new n.k;display=!0;position=new a.P;rotation=new a.P;scale=new a.P(1,1,1);userData={};props={};constructor(e={}){let{id:t}=e;this.id=t||(0,i.L)(this.constructor.name),this._setScenegraphNodeProps(e)}getBounds(){return null}destroy(){}delete(){this.destroy()}setProps(e){return this._setScenegraphNodeProps(e),this}toString(){return`{type: ScenegraphNode, id: ${this.id})}`}setPosition(e){return o(3===e.length,"setPosition requires vector argument"),this.position=e,this}setRotation(e){return o(3===e.length||4===e.length,"setRotation requires vector argument"),this.rotation=e,this}setScale(e){return o(3===e.length,"setScale requires vector argument"),this.scale=e,this}setMatrix(e,t=!0){t?this.matrix.copy(e):this.matrix=e}setMatrixComponents(e){let{position:t,rotation:r,scale:n,update:a=!0}=e;return t&&this.setPosition(t),r&&this.setRotation(r),n&&this.setScale(n),a&&this.updateMatrix(),this}updateMatrix(){if(this.matrix.identity(),this.matrix.translate(this.position),4===this.rotation.length){let e=new n.k().fromQuaternion(this.rotation);this.matrix.multiplyRight(e)}else this.matrix.rotateXYZ(this.rotation);return this.matrix.scale(this.scale),this}update({position:e,rotation:t,scale:r}={}){return e&&this.setPosition(e),t&&this.setRotation(t),r&&this.setScale(r),this.updateMatrix(),this}getCoordinateUniforms(e,t){t=t||this.matrix;let r=new n.k(e).multiplyRight(t),a=r.invert(),i=a.transpose();return{viewMatrix:e,modelMatrix:t,objectMatrix:t,worldMatrix:r,worldInverseMatrix:a,worldInverseTransposeMatrix:i}}_setScenegraphNodeProps(e){e?.position&&this.setPosition(e.position),e?.rotation&&this.setRotation(e.rotation),e?.scale&&this.setScale(e.scale),this.updateMatrix(),e?.matrix&&this.setMatrix(e.matrix),Object.assign(this.props,e)}}},53587(e,t,r){r.d(t,{v:()=>eb});var n=r(20131),a=r(13125),i=r(31130),o=r(60691),s=r(38550),l=r(42188),c=r(82645),u=r(34037),f=r(92790),p=r(51208);class m{id;device;factory;shaderInputs;bindings={};_uniformStore;_bindGroupCacheToken={};_dynamicResourceGenerations={};constructor(e,t={}){this.id=t.id||(0,p.L)("material"),this.device=e,this.factory=t.factory||new h(e,{modules:t.modules||t.shaderInputs?.getModules()||[]});let r=Object.fromEntries((t.shaderInputs?.getModules()||this.factory.modules).map(e=>[e.name,e]));for(let[e,i]of(this.shaderInputs=t.shaderInputs||new n.l(r),this._uniformStore=new a.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if(this.ownsModule(e)&&(0,f.fX)(i)){let t=this._uniformStore.getManagedUniformBuffer(e);this.bindings[`${e}Uniforms`]=t}this.updateShaderInputs(),t.bindings&&this._replaceOwnedBindings(t.bindings)}destroy(){this._uniformStore.destroy()}clone(e={}){let t=this.factory.createMaterial({id:e.id,shaderInputs:e.shaderInputs,bindings:{...this.getResourceBindings(),...e.bindings}});return e.shaderInputs||t.setProps(this.shaderInputs.getUniformValues()),e.moduleProps&&t.setProps(e.moduleProps),t.updateShaderInputs(),t}ownsBinding(e){return this.factory.ownsBinding(e)}ownsModule(e){return this.factory.ownsModule(e)}setProps(e){this.shaderInputs.setProps(e)}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this._setOwnedBindings(this.shaderInputs.getBindingValues())&&(this._bindGroupCacheToken={})}getResourceBindings(){let e={};for(let[t,r]of Object.entries(this.bindings))b(t)||(e[t]=r);return e}getBindings(e={bindings:[]}){this._syncDynamicResourceGenerations();let t={};for(let[r,n]of Object.entries(this.bindings))if((0,u.YT)(n)){let a=(0,u.l0)(e,r,{fallbackGroup:d}),i=a?n.resolveTextureBinding(a):null;i&&(t[r]=i)}else n instanceof c.kL?t[r]=n.buffer:(0,c.Hd)(n)?t[r]=(0,c.j8)(n):t[r]=n;return this._syncDynamicResourceGenerations(),t}getBindingsByGroup(e={bindings:[]}){return this.factory.getBindingsByGroup(this.getBindings(e))}getBindGroupCacheKey(e){return this._syncDynamicResourceGenerations(),e===d?this._bindGroupCacheToken:null}getBindingsUpdateTimestamp(){let e=0;for(let t of Object.values(this.bindings))t instanceof i.X?e=Math.max(e,t.texture.updateTimestamp):t instanceof o.h||t instanceof s.g||t instanceof l.r||t instanceof c.kL?e=Math.max(e,t.updateTimestamp):(0,u.YT)(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:(0,c.Hd)(t)&&(e=Math.max(e,(t.buffer instanceof c.kL,t.buffer.updateTimestamp)));return e}_replaceOwnedBindings(e){this._setOwnedBindings(e)&&(this._bindGroupCacheToken={})}_setOwnedBindings(e){let t=!1;for(let[r,n]of Object.entries(e))void 0!==n&&this.ownsBinding(r)&&this.bindings[r]!==n&&(this.bindings[r]=n,t=!0);return t}_syncDynamicResourceGenerations(){let e={},t=!1;for(let[n,a]of Object.entries(this.bindings)){var r;let i=(r=a,(0,u.YT)(r)?r.generation:(0,c.Xk)(r)?.generation??null);null!==i&&(e[n]=i,this._dynamicResourceGenerations[n]!==i&&(t=!0))}Object.keys(e).length!==Object.keys(this._dynamicResourceGenerations).length&&(t=!0),this._dynamicResourceGenerations=e,t&&(this._bindGroupCacheToken={})}}let d=3;class h{device;modules;_materialBindingNames;_materialModuleNames;constructor(e,t={}){this.device=e,this.modules=t.modules||[];let r=new n.l(Object.fromEntries(this.modules.map(e=>[e.name,e])));this._materialBindingNames=function(e){let t=new Set;for(let r of Object.values(e.modules))for(let e of r.bindingLayout||[])e.group===d&&t.add(e.name);return t}(r),this._materialModuleNames=function(e){let t=new Set;for(let r of Object.values(e.modules))r.name&&r.bindingLayout?.some(e=>e.group===d&&e.name===r.name)&&t.add(r.name);return t}(r)}createMaterial(e={}){return new m(this.device,{...e,factory:this})}getBindingNames(){return Array.from(this._materialBindingNames)}ownsBinding(e){if(this._materialBindingNames.has(e))return!0;let t=b(e);return!!t&&this._materialModuleNames.has(t)}ownsModule(e){return this._materialModuleNames.has(e)}getBindingsByGroup(e){return Object.keys(e).length>0?{[d]:e}:{}}}function b(e){return e.endsWith("Uniforms")?e.slice(0,-8):null}var A=r(92207),g=r(62837),B=r(9696),C=r(92397),v=r(13559),_=r(78777),M=r(4533);let R={"+X":0,"-X":1,"+Y":2,"-Y":3,"+Z":4,"-Z":5};function I(e){return e?Array.isArray(e)?e[0]??null:e:null}function y(e){if((0,M.x)(e))return(0,M.c)(e);if("object"==typeof e&&"width"in e&&"height"in e)return{width:e.width,height:e.height};throw Error("Unsupported mip-level data")}function S(e){let{textureFormat:t,format:r}=e;if(t&&r&&t!==r)throw Error(`Conflicting texture formats "${t}" and "${r}" provided for the same mip level`);return t??r}function E(e){let t=R[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}function x(e){throw Error("setTexture1DData not supported in WebGL.")}function T(e,t,r,n){let a=Array.isArray(t)?t:[t],i=[];for(let t=0;t<a.length;t++){let o=a[t];if((0,M.x)(o))i.push({type:"external-image",image:o,z:e,mipLevel:t});else if("object"==typeof o&&null!==o&&"data"in o&&"width"in o&&"height"in o)i.push({type:"texture-data",data:o,textureFormat:S(o),z:e,mipLevel:t});else if(ArrayBuffer.isView(o)&&r)i.push({type:"texture-data",data:{data:o,width:Math.max(1,r.width>>t),height:Math.max(1,r.height>>t),...n?{format:n}:{}},textureFormat:n,z:e,mipLevel:t});else throw Error("Unsupported 2D mip-level payload")}return i}function F(e){let t=[];for(let r=0;r<e.length;r++)t.push(...T(r,e[r]));return t}function U(e){let t=[];for(let r=0;r<e.length;r++)t.push(...T(r,e[r]));return t}function D(e){let t=[];for(let[r,n]of Object.entries(e)){let e=E(r);t.push(...T(e,n))}return t}function H(e){let t=[];return e.forEach((e,r)=>{for(let[n,a]of Object.entries(e)){let e=6*r+E(n);t.push(...T(e,a))}}),t}class G{device;id;props;_texture=null;_sampler=null;_view=null;ready;isReady=!1;destroyed=!1;generation=0;updateTimestamp;resolveReady=()=>{};rejectReady=()=>{};get texture(){if(!this._texture)throw Error("Texture not initialized yet");return this._texture}get sampler(){if(!this._sampler)throw Error("Sampler not initialized yet");return this._sampler}get view(){if(!this._view)throw Error("View not initialized yet");return this._view}get[Symbol.toStringTag](){return"DynamicTexture"}toString(){let e=this._texture?.width??this.props.width??"?",t=this._texture?.height??this.props.height??"?";return`DynamicTexture:"${this.id}":${e}x${t}px:(${this.isReady?"ready":"loading..."})`}resolveTextureBinding(e){return this.isReady?this.texture:null}constructor(e,t){this.device=e;let r=(0,p.L)("dynamic-texture");this.props={...G.defaultProps,id:r,...t,data:null},this.id=this.props.id,this.ready=new Promise((e,t)=>{this.resolveReady=e,this.rejectReady=t}),this.updateTimestamp=this.device.incrementTimestamp(),this.initAsync(t)}async initAsync(e){try{let t=await this._loadAllData(e);this._checkNotDestroyed();let r=t.data?function(e){if(!e.data)return[];let t=e.width&&e.height?{width:e.width,height:e.height}:void 0,r="format"in e?e.format:void 0;switch(e.dimension){case"1d":return x(e.data);case"2d":return T(0,e.data,t,r);case"3d":return F(e.data);case"2d-array":return U(e.data);case"cube":return D(e.data);case"cube-array":return H(e.data);default:throw Error(`Unhandled dimension ${e.dimension}`)}}({...t,width:e.width,height:e.height,format:e.format}):[],n="format"in e&&void 0!==e.format,a="usage"in e&&void 0!==e.usage,i=(()=>{if(this.props.width&&this.props.height)return{width:this.props.width,height:this.props.height};let e=function(e){let{dimension:t,data:r}=e;if(!r)return null;switch(t){case"1d":{let e=I(r);if(!e)return null;let{width:t}=y(e);return{width:t,height:1}}case"2d":{if(ArrayBuffer.isView(r))return null;let e=I(r);return e?y(e):null}case"3d":case"2d-array":{if(!Array.isArray(r)||0===r.length)return null;let e=I(r[0]);return e?y(e):null}case"cube":{let e=Object.keys(r)[0]??null;if(!e)return null;let t=I(r[e]);return t?y(t):null}case"cube-array":{if(!Array.isArray(r)||0===r.length)return null;let e=r[0],t=Object.keys(e)[0]??null;if(!t)return null;let n=I(e[t]);return n?y(n):null}default:return null}}(t);return e||{width:this.props.width||1,height:this.props.height||1}})();if(!i||i.width<=0||i.height<=0)throw Error(`${this} size could not be determined or was zero`);let o=function(e,t,r,n){if(0===t.length)return{subresources:t,mipLevels:1,format:n.format,hasExplicitMipChain:!1};let a=new Map;for(let e of t){let t=a.get(e.z)??[];t.push(e),a.set(e.z,t)}let i=t.some(e=>e.mipLevel>0),o=n.format,s=1/0,l=[];for(let[t,n]of a){let a=[...n].sort((e,t)=>e.mipLevel-t.mipLevel),i=a[0];if(!i||0!==i.mipLevel)throw Error(`DynamicTexture: slice ${t} is missing mip level 0`);let c=N(e,i);if(c.width!==r.width||c.height!==r.height)throw Error(`DynamicTexture: slice ${t} base level dimensions ${c.width}x${c.height} do not match expected ${r.width}x${r.height}`);let u=L(i);if(u){if(o&&o!==u)throw Error(`DynamicTexture: slice ${t} base level format "${u}" does not match texture format "${o}"`);o=u}let f=o&&e.isTextureFormatCompressed(o)?function(e,t,r,n){let{blockWidth:a=1,blockHeight:i=1}=e.getTextureFormatInfo(n),o=1;for(let e=1;;e++){let n=Math.max(1,t>>e),s=Math.max(1,r>>e);if(n<a||s<i)break;o++}return o}(e,c.width,c.height,o):e.getMipLevelCount(c.width,c.height),p=0;for(let t=0;t<a.length;t++){let r=a[t];if(!r||r.mipLevel!==t||t>=f)break;let n=N(e,r),i=Math.max(1,c.width>>t),s=Math.max(1,c.height>>t);if(n.width!==i||n.height!==s)break;let u=L(r);if(u&&(o||(o=u),u!==o))break;p++,l.push(r)}s=Math.min(s,p)}let c=Number.isFinite(s)?Math.max(1,s):1;return{subresources:l.filter(e=>e.mipLevel<c),mipLevels:c,format:o,hasExplicitMipChain:i}}(this.device,r,i,{format:n?e.format:void 0}),l=o.format??this.props.format,c={...this.props,...i,format:l,mipLevels:1,data:void 0};this.device.isTextureFormatCompressed(l)&&!a&&(c.usage=s.g.SAMPLE|s.g.COPY_DST);let u=this.props.mipmaps&&!o.hasExplicitMipChain&&!this.device.isTextureFormatCompressed(l);if("webgpu"===this.device.type&&u){let e="3d"===this.props.dimension?s.g.SAMPLE|s.g.STORAGE|s.g.COPY_DST|s.g.COPY_SRC:s.g.SAMPLE|s.g.RENDER|s.g.COPY_DST|s.g.COPY_SRC;c.usage|=e}let f=this.device.getMipLevelCount(c.width,c.height),p=o.hasExplicitMipChain?o.mipLevels:"auto"===this.props.mipLevels?f:Math.max(1,Math.min(f,this.props.mipLevels??1)),m={...c,mipLevels:p};this._texture=this.device.createTexture(m),this._sampler=this.texture.sampler,this._view=this.texture.view,this._touchGeneration(),o.subresources.length&&this._setTextureSubresources(o.subresources),!this.props.mipmaps||o.hasExplicitMipChain||u||v.R.warn(`${this} skipping auto-generated mipmaps for compressed texture format`)(),u&&this.generateMipmaps(),this.isReady=!0,this.resolveReady(this.texture),v.R.info(1,`${this} created`)()}catch(t){let e=t instanceof Error?t:Error(String(t));this.rejectReady(e)}}destroy(){this._texture&&(this._texture.destroy(),this._texture=null,this._sampler=null,this._view=null),this.isReady=!1,this.destroyed=!0}generateMipmaps(){"webgl"===this.device.type?(this.texture.generateMipmapsWebGL(),this._touch()):"webgpu"===this.device.type?(this.device.generateMipmapsWebGPU(this.texture),this._touch()):v.R.warn(`${this} mipmaps not supported on ${this.device.type}`)}setSampler(e={}){this._checkReady();let t=e instanceof _.L?e:this.device.createSampler(e);this.texture.setSampler(t),this._sampler=t,this._touchGeneration()}async readBuffer(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,n=e.depthOrArrayLayers??this.texture.depth,a=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:n}),i=this.device.createBuffer({byteLength:a.byteLength,usage:o.h.COPY_DST|o.h.MAP_READ});this.texture.readBuffer({...e,width:t,height:r,depthOrArrayLayers:n},i);let s=this.device.createFence();return await s.signaled,s.destroy(),i}async readAsync(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,n=e.depthOrArrayLayers??this.texture.depth,a=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:n}),i=await this.readBuffer(e),o=await i.readAsync(0,a.byteLength);return i.destroy(),o.buffer instanceof ArrayBuffer?o.buffer:o.slice().buffer}resize(e){if(this._checkReady(),e.width===this.texture.width&&e.height===this.texture.height)return!1;let t=this.texture;return this._texture=t.clone(e),this._sampler=this.texture.sampler,this._view=this.texture.view,t.destroy(),this._touchGeneration(),v.R.info(`${this} resized`),!0}getCubeFaceIndex(e){let t=R[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}getCubeArrayFaceIndex(e,t){return 6*e+this.getCubeFaceIndex(t)}setTexture1DData(e){if(this._checkReady(),"1d"!==this.texture.props.dimension)throw Error(`${this} is not 1d`);let t=x(e);this._setTextureSubresources(t)}setTexture2DData(e,t=0){if(this._checkReady(),"2d"!==this.texture.props.dimension)throw Error(`${this} is not 2d`);let r=T(t,e);this._setTextureSubresources(r)}setTexture3DData(e){if("3d"!==this.texture.props.dimension)throw Error(`${this} is not 3d`);let t=F(e);this._setTextureSubresources(t)}setTextureArrayData(e){if("2d-array"!==this.texture.props.dimension)throw Error(`${this} is not 2d-array`);let t=U(e);this._setTextureSubresources(t)}setTextureCubeData(e){if("cube"!==this.texture.props.dimension)throw Error(`${this} is not cube`);let t=D(e);this._setTextureSubresources(t)}setTextureCubeArrayData(e){if("cube-array"!==this.texture.props.dimension)throw Error(`${this} is not cube-array`);let t=H(e);this._setTextureSubresources(t)}_setTextureSubresources(e){for(let t of e){let{z:e,mipLevel:r}=t;switch(t.type){case"external-image":let{image:n,flipY:a}=t;this.texture.copyExternalImage({image:n,z:e,mipLevel:r,flipY:a});break;case"texture-data":let{data:i,textureFormat:o}=t;if(o&&o!==this.texture.format)throw Error(`${this} mip level ${r} uses format "${o}" but texture format is "${this.texture.format}"`);this.texture.writeData(i.data,{x:0,y:0,z:e,width:i.width,height:i.height,depthOrArrayLayers:1,mipLevel:r});break;default:throw Error("Unsupported 2D mip-level payload")}}e.length>0&&this._touch()}async _loadAllData(e){let t=await w(e.data);return{dimension:e.dimension??"2d",data:t??null}}_checkNotDestroyed(){this.destroyed&&v.R.warn(`${this} already destroyed`)}_checkReady(){this.isReady||v.R.warn(`${this} Cannot perform this operation before ready`)}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_touchGeneration(){this.generation++,this._touch()}static defaultProps={...s.g.defaultProps,dimension:"2d",data:null,mipmaps:!1}}function L(e){if("texture-data"===e.type)return e.textureFormat??S(e.data)}function N(e,t){switch(t.type){case"external-image":return e.getExternalImageSize(t.image);case"texture-data":return{width:t.data.width,height:t.data.height};default:throw Error("Unsupported texture subresource")}}async function w(e){if(Array.isArray(e=await e))return await Promise.all(e.map(w));if(e&&"object"==typeof e&&e.constructor===Object){let t=e,r=await Promise.all(Object.values(t).map(w)),n=Object.keys(t),a={};for(let e=0;e<n.length;e++)a[n[e]]=r[e];return a}return e}var O=r(6706);let P={props:{},uniforms:{},name:"skin",bindingLayout:[{name:"skin",group:0}],dependencies:[],source:`
struct skinUniforms {
  jointMatrix: array<mat4x4<f32>, 20>,
};

@group(0) @binding(auto) var<uniform> skin: skinUniforms;

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

mat4 getSkinMatrix(vec4 weights, uvec4 joints) {
  return (weights.x * skin.jointMatrix[joints.x])
       + (weights.y * skin.jointMatrix[joints.y])
       + (weights.z * skin.jointMatrix[joints.z])
       + (weights.w * skin.jointMatrix[joints.w]);
}

`,fs:"",defines:{SKIN_MAX_JOINTS:20},getUniforms:(e={},t)=>{let{scenegraphsFromGLTF:r}=e;if(!r?.gltf?.skins?.[0])return{jointMatrix:[]};let{inverseBindMatrices:n,joints:a,skeleton:i}=r.gltf.skins[0],o=[],s=n.value.length/16;for(let e=0;e<s;e++){let t=n.value.subarray(16*e,16*e+16);o.push(new O.k(Array.from(t)))}let l=r.gltfNodeIndexToNodeMap.get(i),c={};l.preorderTraversal((e,{worldMatrix:t})=>{c[e.id]=t});let u=new Float32Array(320);for(let e=0;e<20;++e){let t=a[e];if(void 0===t)break;let n=c[r.gltfNodeIndexToNodeMap.get(t).id],i=o[e],s=new O.k().copy(n).multiplyRight(i),l=16*e;for(let e=0;e<16;e++)u[l+e]=s[e]}return{jointMatrix:u}},uniformTypes:{jointMatrix:["mat4x4<f32>",20]}};var V=r(12434),J=r(84793);let K=`
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
#ifdef HAS_SKIN
  let skinMatrix = getSkinMatrix(inputs.WEIGHTS_0, inputs.JOINTS_0);
  position = skinMatrix * position;
  normal = normalize((skinMatrix * vec4f(normal, 0.0)).xyz);
#ifdef HAS_TANGENTS
  tangent = vec4f(normalize((skinMatrix * vec4f(tangent.xyz, 0.0)).xyz), tangent.w);
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
`,j=`\
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

    #ifdef HAS_SKIN
      mat4 skinMat = getSkinMatrix(WEIGHTS_0, JOINTS_0);
      pos = skinMat * pos;
      _NORMAL = skinMat * _NORMAL;
      _TANGENT = vec4((skinMat * vec4(_TANGENT.xyz, 0.)).xyz, _TANGENT.w);
    #endif

    pbr_setPositionNormalTangentUV(pos, _NORMAL, _TANGENT, _TEXCOORD_0, _TEXCOORD_1);
    gl_Position = pbrProjection.modelViewProjectionMatrix * pos;
  }
`,k=`\
#version 300 es
  out vec4 fragmentColor;

  void main(void) {
    vec3 pos = pbr_vPosition;
    fragmentColor = pbr_filterColor(vec4(1.0));
  }
`;function Q(e,t){let r=t.materialFactory||new h(e,{modules:[B.s]}),n={...t.parsedPPBRMaterial.uniforms};delete n.camera;let a=Object.fromEntries(Object.entries({...n,...t.parsedPPBRMaterial.bindings}).filter(([e,t])=>{var n;return r.ownsBinding(e)&&((n=t)instanceof o.h||n instanceof G||n instanceof _.L||n instanceof s.g||n instanceof i.X)})),l=r.createMaterial({id:t.id,bindings:a});return l.setProps({pbrMaterial:n}),l}var X=r(27282);let Y={modelOptions:{},pbrDebug:!1,imageBasedLightingEnvironment:void 0,lights:!0,useTangents:!1,useByteColors:!0};var W=r(23471);function z(e){return e.transformAsPoint([0,0,0])}function Z(e){return e.transformDirection([0,0,-1])}class ${name;playing=!0;speed=1;startTime=0;constructor(e={}){this.name=e.name||"unnamed",Object.assign(this,e)}setTime(e){if(!this.playing)return;let t=(e/1e3-this.startTime)*this.speed;this.applyTime(t)}}class q{clips;animations;constructor(e){this.clips=e,this.animations=e}animate(e){v.R.warn(`${this.constructor.name}#animate is deprecated. Use ${this.constructor.name}#setTime instead`)(),this.setTime(e)}setTime(e){this.clips.forEach(t=>t.setTime(e))}getAnimations(){return this.clips}}var ee=r(61734);function et(e,{input:t,interpolation:r,output:n},a){let i=t[t.length-1];if(!Number.isFinite(i)||i<=0)return n[0]||null;let o=e%i,s=t.findIndex(e=>e>=o);if(s<0)return n[n.length-1]||null;let l=Math.max(0,s-1),c=t[l],u=t[s];switch(r){case"STEP":return n[l];case"LINEAR":if(u>c)return function(e,t,r,n){if("rotation"===e)return new ee.P().slerp({start:t,target:r,ratio:n});let a=[];for(let e=0;e<t.length;e++)a[e]=n*r[e]+(1-n)*t[e];return a}(a,n[l],n[s],(o-c)/(u-c));return n[l]||null;case"CUBICSPLINE":if(u>c){let e=n[3*l+1],t=n[3*l+2];return function({p0:e,outTangent0:t,inTangent1:r,p1:n,tDiff:a,ratio:i}){let o=[];for(let s=0;s<e.length;s++){let l=t[s]*a,c=r[s]*a;o[s]=(2*Math.pow(i,3)-3*Math.pow(i,2)+1)*e[s]+(Math.pow(i,3)-2*Math.pow(i,2)+i)*l+(-2*Math.pow(i,3)+3*Math.pow(i,2))*n[s]+(Math.pow(i,3)-Math.pow(i,2))*c}return o}({p0:e,outTangent0:t,inTangent1:n[3*s+0],p1:n[3*s+1],tDiff:u-c,ratio:(o-c)/(u-c)})}return n[3*l+1]||null;default:return v.R.warn(`Interpolation ${r} not supported`)(),null}}var er=r(29244);class en extends ${animation;gltfNodeIdToNodeMap;materials;materialTextureTransformState=new Map;constructor(e){if(super({name:e.animation.name||"unnamed"}),this.animation=e.animation,this.gltfNodeIdToNodeMap=e.gltfNodeIdToNodeMap,this.materials=e.materials||[],this.animation.name||="unnamed",this.name=this.animation.name,Object.assign(this,e),this.animation.channels.some(e=>"node"!==e.type)&&!this.materials.length)throw Error(`Animation ${this.animation.name} targets materials, but GLTFAnimator was created without a materials array`)}applyTime(e){this.animation.channels.forEach(t=>{var r,n,a,i,o,s,l,c;let u,f,p,m;if("node"===t.type){let{sampler:r,targetNodeId:n,path:a}=t,i=this.gltfNodeIdToNodeMap.get(n);if(!i)throw Error(`Cannot find animation target node ${n}`);!function(e,{input:t,interpolation:r,output:n},a,i){let o=et(e,{input:t,interpolation:r,output:n},i);o&&function(e,t,r){switch(t){case"translation":return e.setPosition(r).updateMatrix();case"rotation":return e.setRotation(r).updateMatrix();case"scale":return e.setScale(r).updateMatrix();default:return v.R.warn(`Bad animation path ${t}`)()}}(a,i,o)}(e,r,i,a);return}let d=this.materials[t.targetMaterialIndex];if(!d)throw Error(`Cannot find animation target material ${t.targetMaterialIndex} for ${t.pointer}`);let h=et(e,t.sampler);h&&("material"===t.type?(r=d,n=t,a=h,m=void 0!==n.component?{[n.property]:(s=(i=r,o=n.property,u=i.shaderInputs.getUniformValues(),Array.isArray(f=u.pbrMaterial?.[o])?[...f]:[]),l=n.component,c=a[0],(p=[...s])[l]=c,p)}:{[n.property]:1===a.length?a[0]:a},r.setProps({pbrMaterial:m})):function(e,t,r,n){var a,i,o;let s,l,c=(0,er.lz)(t.textureSlot),u=(a=n,i=e,o=t,(l=(s=a.get(i)||{})[o.textureSlot])||(l={offset:[...o.baseTransform.offset],rotation:o.baseTransform.rotation,scale:[...o.baseTransform.scale]},s[o.textureSlot]=l,a.set(i,s)),l);switch(t.path){case"offset":void 0!==t.component?u.offset[t.component]=r[0]:u.offset=[r[0],r[1]];break;case"rotation":u.rotation=r[0];break;case"scale":void 0!==t.component?u.scale[t.component]=r[0]:u.scale=[r[0],r[1]]}e.setProps({pbrMaterial:{[c.uvTransformUniform]:(0,er.dy)(t.baseTransform,u)}})}(d,t,h,this.materialTextureTransformState))})}}class ea extends q{constructor(e){super(e.animations.map((t,r)=>{let n=t.name||`Animation-${r}`;return new en({gltfNodeIdToNodeMap:e.gltfNodeIdToNodeMap,materials:e.materials,animation:{name:n,channels:t.channels}})}))}}let ei={supportLevel:"none",comment:"Not currently listed in the luma.gl glTF extension support registry."},eo={KHR_draco_mesh_compression:{supportLevel:"built-in",comment:"Decoded by loaders.gl before luma.gl builds the scenegraph."},EXT_meshopt_compression:{supportLevel:"built-in",comment:"Meshopt-compressed primitives are decoded during load."},KHR_mesh_quantization:{supportLevel:"built-in",comment:"Quantized accessors are unpacked before geometry creation."},KHR_lights_punctual:{supportLevel:"built-in",comment:"Parsed into luma.gl Light objects."},KHR_materials_unlit:{supportLevel:"built-in",comment:"Unlit materials bypass the default lighting path."},KHR_materials_emissive_strength:{supportLevel:"built-in",comment:"Applied by the stock PBR shader."},KHR_texture_basisu:{supportLevel:"built-in",comment:"BasisU / KTX2 textures pass through when the device supports them."},KHR_texture_transform:{supportLevel:"built-in",comment:"UV transforms are applied during load."},EXT_texture_webp:{supportLevel:"loader-only",comment:"Texture source is resolved during load; final support depends on browser and device decode support."},EXT_texture_avif:{supportLevel:"loader-only",comment:"Texture source is resolved during load; final support depends on browser and device decode support."},KHR_materials_specular:{supportLevel:"built-in",comment:"The stock shader now applies specular factors and textures to the dielectric F0 term."},KHR_materials_ior:{supportLevel:"built-in",comment:"The stock shader now drives dielectric reflectance from the glTF IOR value."},KHR_materials_transmission:{supportLevel:"built-in",comment:"The stock shader now applies transmission to the base layer and exposes transparency through alpha, without a scene-color refraction buffer."},KHR_materials_volume:{supportLevel:"built-in",comment:"Thickness and attenuation now tint transmitted light in the stock shader."},KHR_materials_clearcoat:{supportLevel:"built-in",comment:"The stock shader now adds a secondary clearcoat specular lobe."},KHR_materials_sheen:{supportLevel:"built-in",comment:"The stock shader now adds a sheen lobe for cloth-like materials."},KHR_materials_iridescence:{supportLevel:"built-in",comment:"The stock shader now tints specular response with a view-dependent thin-film iridescence approximation."},KHR_materials_anisotropy:{supportLevel:"built-in",comment:"The stock shader now shapes highlights and IBL response with an anisotropy-direction approximation."},KHR_materials_pbrSpecularGlossiness:{supportLevel:"loader-only",comment:"Extension data can be loaded, but it is not translated into the default metallic-roughness material path."},KHR_materials_variants:{supportLevel:"loader-only",comment:"Variant metadata can be loaded, but applications must choose and apply variants."},EXT_mesh_gpu_instancing:{supportLevel:"none",comment:"GPU instancing data is not yet converted into luma.gl instanced draw setup."},KHR_node_visibility:{supportLevel:"none",comment:"Node-visibility animations and toggles are not mapped onto runtime scenegraph state."},KHR_animation_pointer:{supportLevel:"parsed-and-wired",comment:"Selected node TRS, material factor, and KHR_texture_transform offset/rotation/scale pointers are wired to runtime updates; unsupported targets are skipped."},KHR_materials_diffuse_transmission:{supportLevel:"none",comment:"Diffuse-transmission shading is not implemented in the stock PBR shader."},KHR_materials_dispersion:{supportLevel:"none",comment:"Chromatic dispersion is not implemented in the stock PBR shader."},KHR_materials_volume_scatter:{supportLevel:"none",comment:"Volume scattering is not implemented in the stock PBR shader."},KHR_xmp:{supportLevel:"none",comment:"Metadata payloads remain in the loaded glTF, but luma.gl does not interpret them."},KHR_xmp_json_ld:{supportLevel:"none",comment:"Metadata is preserved in the glTF, but luma.gl does not interpret it."},EXT_lights_image_based:{supportLevel:"none",comment:"Use loadPBREnvironment() or custom environment setup instead."},EXT_texture_video:{supportLevel:"none",comment:"Video textures are not created automatically by the stock pipeline."},MSFT_lod:{supportLevel:"none",comment:"Level-of-detail switching is not implemented in the stock scenegraph loader."}};function es(e,t=[]){for(let r of t)e.add(r)}let el={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},ec={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array};function eu(e){let t=ec[e.componentType],r=el[e.type],n=r*e.count,{buffer:a,byteOffset:i=0}=e.bufferView?.data??{};return{typedArray:new t(a,i+(e.byteOffset||0),n),components:r}}function ef(e){switch(e){case"translation":case"rotation":case"scale":case"weights":return e;default:return null}}function ep(e){let t=em(e);if(t){let e=eo[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`no runtime target exists for material property "${e.join("/")}"`}function em(e){let t=e.indexOf("extensions"),r=e[t+1];return t>=0&&r?r:null}function ed(e,t){v.R.warn(`KHR_animation_pointer target ${e} will be skipped because ${t}`)()}function eh(e,t){if(!e)throw Error(t)}function eb(e,t,r){var n;let a,i,o,s,{scenes:l,materials:c,gltfMeshIdToNodeMap:u,gltfNodeIdToNodeMap:f,gltfNodeIndexToNodeMap:p}=function(e,t,r={}){let n={...Y,...r},a=new h(e,{modules:[B.s]}),i=(t.materials||[]).map((r,i)=>{var o,s;return Q(e,{id:(o=r,s=i,o.name||o.id||`material-${s}`),parsedPPBRMaterial:(0,X.l)(e,r,{},{...n,gltf:t,validateAttributes:!1}),materialFactory:a})}),o=new Map;(t.materials||[]).forEach((e,t)=>{o.set(e.id,i[t])});let s=new Map;t.meshes.forEach((r,a)=>{var i,l,c,u,f;let p,m=(i=e,l=r,c=t,u=o,f=n,p=(l.primitives||[]).map((e,t)=>(function({device:e,gltfPrimitive:t,primitiveIndex:r,gltfMesh:n,gltf:a,gltfMaterialIdToMaterialMap:i,options:o}){let s=t.name||`${n.name||n.id}-primitive-${r}`,l=function(e){switch(e){case C.n.POINTS:return"point-list";case C.n.LINES:return"line-list";case C.n.LINE_STRIP:return"line-strip";case C.n.TRIANGLES:return"triangle-list";case C.n.TRIANGLE_STRIP:return"triangle-strip";default:throw Error(String(e))}}(t.mode??4),c=t.indices?t.indices.count:function(e){let t=1/0;for(let r of Object.values(e))if(r){let{value:e,size:n,components:a}=r,i=n??a;e?.length!==void 0&&i>=1&&(t=Math.min(t,e.length/i))}if(!Number.isFinite(t))throw Error("Could not determine vertex count from attributes");return t}(t.attributes),u=function(e,t,r){let n={};for(let[e,r]of Object.entries(t.attributes)){let{components:t,size:a,value:i,normalized:o}=r;n[e]={size:a??t,value:i,normalized:o}}return new g.V({id:e,topology:r,indices:t.indices?.value,attributes:n})}(s,t,l),f=(0,X.l)(e,t.material,u.attributes,{...o,gltf:a}),p=function(e,t){let{id:r,geometry:n,parsedPPBRMaterial:a,vertexCount:i,modelOptions:o={}}=t;v.R.info(4,"createGLTFModel defines: ",a.defines)();let s={id:r,source:K,vs:j,fs:k,geometry:n,topology:n.topology,vertexCount:i,modules:[B.s,P],...o,defines:{...a.defines,...o.defines},parameters:{depthWriteEnabled:!0,depthCompare:"less",depthFormat:"depth24plus",cullMode:"back",...a.parameters,...o.parameters}},l=t.material||Q(e,{id:r?`${r}-material`:void 0,parsedPPBRMaterial:a});s.material=l;let c=new V.K(e,s),u={...a.uniforms,...o.uniforms,...a.bindings,...o.bindings},f=function(e,t,r){let n=new Map;for(let t of e){for(let e of Object.keys(t.uniformTypes||{}))n.set(e,t.name);for(let e of t.bindingLayout||[])n.set(e.name,t.name)}let a={};for(let[e,i]of Object.entries(r)){if(void 0===i)continue;let r=n.get(e);!r||t.ownsModule(r)||(a[r]||={},a[r][e]=i)}return a}(c.shaderInputs.getModules(),l,u);return c.shaderInputs.setProps(f),new J.s({managedResources:[],model:c})}(e,{id:s,geometry:u,material:t.material&&i.get(t.material.id)||null,parsedPPBRMaterial:f,modelOptions:o.modelOptions,vertexCount:c});return p.bounds=[t.attributes.POSITION.min,t.attributes.POSITION.max],p})({device:i,gltfPrimitive:e,primitiveIndex:t,gltfMesh:l,gltf:c,gltfMaterialIdToMaterialMap:u,options:f})),new A.o({id:l.name||l.id,children:p}));s.set(r.id,m)});let l=new Map,c=new Map;return t.nodes.forEach((e,t)=>{var r;let n=(r=e,new A.o({id:r.name||r.id,children:[],matrix:r.matrix,position:r.translation,rotation:r.rotation,scale:r.scale}));l.set(t,n),c.set(e.id,n)}),t.nodes.forEach((e,t)=>{if(l.get(t).add((e.children??[]).map(({id:e})=>{let r=c.get(e);if(!r)throw Error(`Cannot find child ${e} of node ${t}`);return r})),e.mesh){let r=s.get(e.mesh.id);if(!r)throw Error(`Cannot find mesh child ${e.mesh.id} of node ${t}`);l.get(t).add(r)}}),{scenes:t.scenes.map(e=>{let t=(e.nodes||[]).map(({id:t})=>{let r=c.get(t);if(!r)throw Error(`Cannot find child ${t} of scene ${e.name||e.id}`);return r});return new A.o({id:e.name||e.id,children:t})}),materials:i,gltfMeshIdToNodeMap:s,gltfNodeIdToNodeMap:c,gltfNodeIndexToNodeMap:l}}(e,t,r),m=new ea({animations:(i=t.animations||[],o=new Map,s=new Map,i.flatMap((e,r)=>{let n=e.name||`Animation-${r}`,a=new Map,i=e.channels.flatMap(({sampler:r,target:n})=>{let i=a.get(r);if(!i){let n=e.samplers[r];if(!n)throw Error(`Cannot find animation sampler ${r}`);let{input:l,interpolation:c="LINEAR",output:u}=n;i={input:function(e,t){if(t.has(e))return t.get(e);let{typedArray:r,components:n}=eu(e);eh(1===n,"accessorToJsArray1D must have exactly 1 component");let a=Array.from(r);return t.set(e,a),a}(t.accessors[l],o),interpolation:c,output:function(e,t){if(t.has(e))return t.get(e);let{typedArray:r,components:n}=eu(e);eh(n>=1,"accessorToJsArray2D must have at least 1 component");let a=[];for(let e=0;e<r.length;e+=n)a.push(Array.from(r.slice(e,e+n)));return t.set(e,a),a}(t.accessors[u],s)},a.set(r,i)}let l=function(e,t,r){if("pointer"===t.path)return function(e,t,r){let n=t.extensions?.KHR_animation_pointer?.pointer;if("string"!=typeof n||!n.startsWith("/"))return v.R.warn("KHR_animation_pointer channel is missing a valid JSON pointer and will be skipped")(),null;let a=n.slice(1).split("/").map(e=>e.replace(/~1/g,"/").replace(/~0/g,"~"));switch(a[0]){case"nodes":var i=e,o=a,s=r,l=n;if(3!==o.length)return ed(l,"node pointers must use /nodes/{index}/{translation|rotation|scale|weights}"),null;let c=Number(o[1]),u=i.nodes[c];if(!Number.isInteger(c)||!u)return v.R.warn(`KHR_animation_pointer target ${l} references a missing node and will be skipped`)(),null;let f=ef(o[2]);return f?"weights"===f?(v.R.warn(`KHR_animation_pointer target ${l} will be skipped because morph weights are not implemented in GLTFAnimator`)(),null):{type:"node",sampler:s,targetNodeId:u.id,path:f}:(ed(l,`node property "${o[2]}" has no runtime animation mapping`),null);case"materials":var p=e,m=a,d=r,h=n;if(m.length<3)return ed(h,"material pointers must include a material index and target property path"),null;let b=Number(m[1]),A=p.materials[b];if(!Number.isInteger(b)||!A)return v.R.warn(`KHR_animation_pointer target ${h} references a missing material and will be skipped`)(),null;let g=function(e,t){let r=function(e,t){let r,n=t.lastIndexOf("extensions");if(n<0||"KHR_texture_transform"!==t[n+1]||n<1)return{reason:"not-a-texture-transform-target"};let a=(0,er.Mg)(t.slice(0,n));if(!a)return{reason:function(e){let t=em(e);if(t){let e=eo[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`texture-transform target "${e.join("/")}" has no runtime texture-slot mapping`}(t.slice(0,n))};let i=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,a.pathSegments);if(!i)return{reason:`texture-transform target "${t.slice(0,n).join("/")}" does not exist on the referenced material`};let o=t[n+2];if("texCoord"===o)return{reason:"animated KHR_texture_transform.texCoord is unsupported because texCoord selection is structural, not a runtime float/vector update"};if("offset"!==o&&"rotation"!==o&&"scale"!==o)return{reason:`KHR_texture_transform property "${o}" is not animatable; supported properties are offset, rotation, and scale`};let s=t[n+3];if(t.length>n+4)return{reason:`KHR_texture_transform.${o} does not support nested property paths`};if(void 0!==s){if(r=Number(s),"rotation"===o)return{reason:"KHR_texture_transform.rotation does not support component indices"};if(!Number.isInteger(r)||r<0||r>1)return{reason:`KHR_texture_transform.${o} component index "${s}" is invalid; only 0 and 1 are supported`}}return{type:"textureTransform",textureSlot:a.slot,path:o,component:r,baseTransform:(0,er.e3)(i)}}(e,t);if(!("reason"in r)||"not-a-texture-transform-target"!==r.reason)return r;switch(t.join("/")){case"pbrMetallicRoughness/baseColorFactor":return e.pbrMetallicRoughness?{type:"material",property:"baseColorFactor"}:{reason:ep(t)};case"pbrMetallicRoughness/metallicFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:0}:{reason:ep(t)};case"pbrMetallicRoughness/roughnessFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:1}:{reason:ep(t)};case"normalTexture/scale":return e.normalTexture?{type:"material",property:"normalScale"}:{reason:ep(t)};case"occlusionTexture/strength":return e.occlusionTexture?{type:"material",property:"occlusionStrength"}:{reason:ep(t)};case"emissiveFactor":return{type:"material",property:"emissiveFactor"};case"alphaCutoff":return{type:"material",property:"alphaCutoff"};case"extensions/KHR_materials_specular/specularFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularIntensityFactor"}:{reason:ep(t)};case"extensions/KHR_materials_specular/specularColorFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularColorFactor"}:{reason:ep(t)};case"extensions/KHR_materials_ior/ior":return e.extensions?.KHR_materials_ior?{type:"material",property:"ior"}:{reason:ep(t)};case"extensions/KHR_materials_transmission/transmissionFactor":return e.extensions?.KHR_materials_transmission?{type:"material",property:"transmissionFactor"}:{reason:ep(t)};case"extensions/KHR_materials_volume/thicknessFactor":return e.extensions?.KHR_materials_volume?{type:"material",property:"thicknessFactor"}:{reason:ep(t)};case"extensions/KHR_materials_volume/attenuationDistance":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationDistance"}:{reason:ep(t)};case"extensions/KHR_materials_volume/attenuationColor":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationColor"}:{reason:ep(t)};case"extensions/KHR_materials_clearcoat/clearcoatFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatFactor"}:{reason:ep(t)};case"extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatRoughnessFactor"}:{reason:ep(t)};case"extensions/KHR_materials_sheen/sheenColorFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenColorFactor"}:{reason:ep(t)};case"extensions/KHR_materials_sheen/sheenRoughnessFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenRoughnessFactor"}:{reason:ep(t)};case"extensions/KHR_materials_iridescence/iridescenceFactor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceFactor"}:{reason:ep(t)};case"extensions/KHR_materials_iridescence/iridescenceIor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceIor"}:{reason:ep(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMinimum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:0}:{reason:ep(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMaximum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:1}:{reason:ep(t)};case"extensions/KHR_materials_anisotropy/anisotropyStrength":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyStrength"}:{reason:ep(t)};case"extensions/KHR_materials_anisotropy/anisotropyRotation":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyRotation"}:{reason:ep(t)};case"extensions/KHR_materials_emissive_strength/emissiveStrength":return e.extensions?.KHR_materials_emissive_strength?{type:"material",property:"emissiveStrength"}:{reason:ep(t)};default:return{reason:ep(t)}}}(A,m.slice(2));return"reason"in g?(ed(h,g.reason),null):{sampler:d,pointer:h,targetMaterialIndex:b,...g};default:return ed(n,`top-level target "${a[0]}" has no runtime animation mapping`),null}}(e,t,r);let n=ef(t.path);if(!n)return null;let a=e.nodes[t.node??0];if(!a)throw Error(`Cannot find animation target ${t.node}`);return{type:"node",sampler:r,targetNodeId:a.id,path:n}}(t,n,i);return l?[l]:[]});return i.length?[{name:n,channels:i}]:[]})),gltfNodeIdToNodeMap:f,materials:c}),d=function(e,t={}){let r=e.lights||e.extensions?.KHR_lights_punctual?.lights;if(!r||!Array.isArray(r)||0===r.length)return[];let n=[],a=function(e){let t=new Map;for(let r of e)for(let e of r.children||[])t.set(e.id,r);return t}(e.nodes||[]),i=new Map;for(let u of e.nodes||[]){var o,s,l,c;let e=u.light??u.extensions?.KHR_lights_punctual?.light;if("number"!=typeof e)continue;let f=r[e];if(!f)continue;let p=(o=f.color||[1,1,1],t.useByteColors??!0?o.map(e=>255*e):(0,W.sC)(o,!1)),m=f.intensity??1,d=f.range,h=function e(t,r,n){let a=n.get(t.id);if(a)return a;let i=function(e){if(e.matrix)return new O.k(e.matrix);let t=new O.k;return e.translation&&t.translate(e.translation),e.rotation&&t.multiplyRight(new O.k().fromQuaternion(e.rotation)),e.scale&&t.scale(e.scale),t}(t),o=r.get(t.id),s=o?new O.k(e(o,r,n)).multiplyRight(i):i;return n.set(t.id,s),s}(u,a,i);switch(f.type){case"directional":n.push((s=h,l=p,c=m,{type:"directional",direction:Z(s),color:l,intensity:c}));break;case"point":n.push(function(e,t,r,n){let a=z(e),i=[1,0,0];return void 0!==n&&n>0&&(i=[1,0,1/(n*n)]),{type:"point",position:a,color:t,intensity:r,attenuation:i}}(h,p,m,d));break;case"spot":n.push(function(e,t,r,n,a={}){let i=z(e),o=Z(e),s=[1,0,0];return void 0!==n&&n>0&&(s=[1,0,1/(n*n)]),{type:"spot",position:i,direction:o,color:t,intensity:r,attenuation:s,innerConeAngle:a.innerConeAngle??0,outerConeAngle:a.outerConeAngle??Math.PI/4}}(h,p,m,d,f.spot))}}return n}(t,{useByteColors:r?.useByteColors??!0}),b=new Map(Array.from((n=t,es(a=new Set,n.extensionsUsed),es(a,n.extensionsRequired),es(a,n.extensionsRemoved),es(a,Object.keys(n.extensions||{})),(n.lights?.length||(n.nodes||[]).some(e=>"light"in e))&&a.add("KHR_lights_punctual"),(n.materials||[]).some(e=>e.unlit||e.extensions?.KHR_materials_unlit)&&a.add("KHR_materials_unlit"),a)).sort().map(e=>{let t=eo[e]||ei;return[e,{extensionName:e,supported:"built-in"===t.supportLevel||"parsed-and-wired"===t.supportLevel,supportLevel:t.supportLevel,comment:t.comment}]})),_=l.map(e=>eA(e.getBounds())),M=function(e){let t=null;for(let r of e)if(r.bounds){if(!t){t=[[...r.bounds[0]],[...r.bounds[1]]];continue}for(let e=0;e<3;e++)t[0][e]=Math.min(t[0][e],r.bounds[0][e]),t[1][e]=Math.max(t[1][e],r.bounds[1][e])}return eA(t)}(_);return{scenes:l,materials:c,animator:m,lights:d,extensionSupport:b,sceneBounds:_,modelBounds:M,gltfMeshIdToNodeMap:u,gltfNodeIdToNodeMap:f,gltfNodeIndexToNodeMap:p,gltf:t}}function eA(e){if(!e)return{bounds:null,center:[0,0,0],size:[0,0,0],radius:.5,recommendedOrbitDistance:1};let t=[[e[0][0],e[0][1],e[0][2]],[e[1][0],e[1][1],e[1][2]]],r=[t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]],n=[t[0][0]+.5*r[0],t[0][1]+.5*r[1],t[0][2]+.5*r[2]],a=.5*Math.max(r[0],r[1],r[2]),i=Math.max(.5*Math.hypot(r[0],r[1],r[2]),.001);return{bounds:t,center:n,size:r,radius:i,recommendedOrbitDistance:Math.max(Math.max(a,.001)/Math.tan(Math.PI/6)*1.15,1.1*i)}}},27282(e,t,r){r.d(t,{l:()=>u});var n=r(13559),a=r(74788),i=r(38550),o=r(92397);function s(e){switch(e){case o.n.CLAMP_TO_EDGE:return"clamp-to-edge";case o.n.REPEAT:return"repeat";case o.n.MIRRORED_REPEAT:return"mirror-repeat";default:return}}var l=r(29244);let c={NORMAL:["NORMAL","normals"],TANGENT:["TANGENT"],TEXCOORD_0:["TEXCOORD_0","texCoords"],TEXCOORD_1:["TEXCOORD_1","texCoords1"],JOINTS_0:["JOINTS_0"],WEIGHTS_0:["WEIGHTS_0"],COLOR_0:["COLOR_0","colors"]};function u(e,t,r,a){let i={defines:{MANUAL_SRGB:!0,SRGB_FAST_APPROXIMATION:!0},bindings:{},uniforms:{camera:[0,0,0],metallicRoughnessValues:[1,1]},parameters:{},glParameters:{},generatedTextures:[]};i.defines.USE_TEX_LOD=!0;let{imageBasedLightingEnvironment:s}=a;return s&&(i.bindings.pbr_diffuseEnvSampler=s.diffuseEnvSampler.texture,i.bindings.pbr_specularEnvSampler=s.specularEnvSampler.texture,i.bindings.pbr_brdfLUT=s.brdfLutTexture.texture,i.uniforms.IBLenabled=!0,i.uniforms.scaleIBLAmbient=[1,1]),a?.pbrDebug&&(i.defines.PBR_DEBUG=!0,i.uniforms.scaleDiffBaseMR=[0,0,0,0],i.uniforms.scaleFGDSpec=[0,0,0,0]),p(r,"NORMAL")&&(i.defines.HAS_NORMALS=!0),p(r,"TANGENT")&&a?.useTangents&&(i.defines.HAS_TANGENTS=!0),p(r,"TEXCOORD_0")&&(i.defines.HAS_UV=!0),p(r,"TEXCOORD_1")&&(i.defines.HAS_UV_1=!0),p(r,"JOINTS_0")&&p(r,"WEIGHTS_0")&&(i.defines.HAS_SKIN=!0),p(r,"COLOR_0")&&(i.defines.HAS_COLORS=!0),a?.imageBasedLightingEnvironment&&(i.defines.USE_IBL=!0),a?.lights&&(i.defines.USE_LIGHTS=!0),t&&(!1!==a.validateAttributes&&function(e,t){let r=f(e,0);r.length>0&&!p(t,"TEXCOORD_0")&&n.R.warn(`glTF material uses ${r.join(", ")} but primitive is missing TEXCOORD_0; textured shading will sample the default UV coordinates`)();let a=f(e,1);if(a.length>0&&!p(t,"TEXCOORD_1")&&n.R.warn(`glTF material uses ${a.join(", ")} with TEXCOORD_1 but primitive is missing TEXCOORD_1; those textures will be skipped`)(),e.unlit||e.extensions?.KHR_materials_unlit||p(t,"NORMAL"))return;let i=e.normalTexture?"lit PBR shading with normalTexture":"lit PBR shading";n.R.warn(`glTF primitive is missing NORMAL while using ${i}; shading will fall back to geometric normals`)()}(t,r),function(e,t,r,a,i){if(r.uniforms.unlit=!!(t.unlit||t.extensions?.KHR_materials_unlit),t.pbrMetallicRoughness&&function(e,t,r,n,a){t.baseColorTexture&&m(e,t.baseColorTexture,"pbr_baseColorSampler",r,{featureOptions:{define:"HAS_BASECOLORMAP",enabledUniformName:"baseColorMapEnabled"},gltf:a,attributes:n,textureTransformSlot:"baseColor"}),r.uniforms.baseColorFactor=t.baseColorFactor||[1,1,1,1],t.metallicRoughnessTexture&&m(e,t.metallicRoughnessTexture,"pbr_metallicRoughnessSampler",r,{featureOptions:{define:"HAS_METALROUGHNESSMAP",enabledUniformName:"metallicRoughnessMapEnabled"},gltf:a,attributes:n,textureTransformSlot:"metallicRoughness"});let{metallicFactor:i=1,roughnessFactor:o=1}=t;r.uniforms.metallicRoughnessValues=[i,o]}(e,t.pbrMetallicRoughness,r,a,i),t.normalTexture){m(e,t.normalTexture,"pbr_normalSampler",r,{featureOptions:{define:"HAS_NORMALMAP",enabledUniformName:"normalMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"normal"});let{scale:n=1}=t.normalTexture;r.uniforms.normalScale=n}if(t.occlusionTexture){m(e,t.occlusionTexture,"pbr_occlusionSampler",r,{featureOptions:{define:"HAS_OCCLUSIONMAP",enabledUniformName:"occlusionMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"occlusion"});let{strength:n=1}=t.occlusionTexture;r.uniforms.occlusionStrength=n}switch(r.uniforms.emissiveFactor=t.emissiveFactor||[0,0,0],t.emissiveTexture&&m(e,t.emissiveTexture,"pbr_emissiveSampler",r,{featureOptions:{define:"HAS_EMISSIVEMAP",enabledUniformName:"emissiveMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"emissive"}),function(e,t,r,a,i={}){var s,l,c,u,f;t&&(((s=t).KHR_materials_specular||s.KHR_materials_ior||s.KHR_materials_transmission||s.KHR_materials_volume||s.KHR_materials_clearcoat||s.KHR_materials_sheen||s.KHR_materials_iridescence||s.KHR_materials_anisotropy)&&(r.defines.USE_MATERIAL_EXTENSIONS=!0),function(e,t,r,n,a={}){t&&(t.specularColorFactor&&(r.uniforms.specularColorFactor=t.specularColorFactor),void 0!==t.specularFactor&&(r.uniforms.specularIntensityFactor=t.specularFactor),t.specularColorTexture&&m(e,t.specularColorTexture,"pbr_specularColorSampler",r,{featureOptions:{define:"HAS_SPECULARCOLORMAP",enabledUniformName:"specularColorMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"specularColor"}),t.specularTexture&&m(e,t.specularTexture,"pbr_specularIntensitySampler",r,{featureOptions:{define:"HAS_SPECULARINTENSITYMAP",enabledUniformName:"specularIntensityMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"specularIntensity"}))}(e,t.KHR_materials_specular,r,a,i),l=t.KHR_materials_ior,c=r,l?.ior!==void 0&&(c.uniforms.ior=l.ior),function(e,t,r,a,i={}){t&&(void 0!==t.transmissionFactor&&(r.uniforms.transmissionFactor=t.transmissionFactor),t.transmissionTexture&&m(e,t.transmissionTexture,"pbr_transmissionSampler",r,{featureOptions:{define:"HAS_TRANSMISSIONMAP",enabledUniformName:"transmissionMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"transmission"}),(t.transmissionFactor??0)>0||t.transmissionTexture)&&(n.R.warn("KHR_materials_transmission uses a premultiplied-alpha blending approximation and may require mesh sorting")(),r.parameters.blend=!0,r.parameters.depthWriteEnabled=!1,r.parameters.blendColorOperation="add",r.parameters.blendColorSrcFactor="one",r.parameters.blendColorDstFactor="one-minus-src-alpha",r.parameters.blendAlphaOperation="add",r.parameters.blendAlphaSrcFactor="one",r.parameters.blendAlphaDstFactor="one-minus-src-alpha",r.glParameters.blend=!0,r.glParameters.depthMask=!1,r.glParameters.blendEquation=o.n.FUNC_ADD,r.glParameters.blendFunc=[o.n.ONE,o.n.ONE_MINUS_SRC_ALPHA,o.n.ONE,o.n.ONE_MINUS_SRC_ALPHA])}(e,t.KHR_materials_transmission,r,a,i),function(e,t,r,n,a={}){t&&(void 0!==t.thicknessFactor&&(r.uniforms.thicknessFactor=t.thicknessFactor),t.thicknessTexture&&m(e,t.thicknessTexture,"pbr_thicknessSampler",r,{featureOptions:{define:"HAS_THICKNESSMAP"},gltf:n,attributes:a,textureTransformSlot:"thickness"}),void 0!==t.attenuationDistance&&(r.uniforms.attenuationDistance=t.attenuationDistance),t.attenuationColor&&(r.uniforms.attenuationColor=t.attenuationColor))}(e,t.KHR_materials_volume,r,a,i),function(e,t,r,n,a={}){t&&(void 0!==t.clearcoatFactor&&(r.uniforms.clearcoatFactor=t.clearcoatFactor),void 0!==t.clearcoatRoughnessFactor&&(r.uniforms.clearcoatRoughnessFactor=t.clearcoatRoughnessFactor),t.clearcoatTexture&&m(e,t.clearcoatTexture,"pbr_clearcoatSampler",r,{featureOptions:{define:"HAS_CLEARCOATMAP",enabledUniformName:"clearcoatMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"clearcoat"}),t.clearcoatRoughnessTexture&&m(e,t.clearcoatRoughnessTexture,"pbr_clearcoatRoughnessSampler",r,{featureOptions:{define:"HAS_CLEARCOATROUGHNESSMAP",enabledUniformName:"clearcoatRoughnessMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"clearcoatRoughness"}),t.clearcoatNormalTexture&&m(e,t.clearcoatNormalTexture,"pbr_clearcoatNormalSampler",r,{featureOptions:{define:"HAS_CLEARCOATNORMALMAP"},gltf:n,attributes:a,textureTransformSlot:"clearcoatNormal"}))}(e,t.KHR_materials_clearcoat,r,a,i),function(e,t,r,n,a={}){t&&(t.sheenColorFactor&&(r.uniforms.sheenColorFactor=t.sheenColorFactor),void 0!==t.sheenRoughnessFactor&&(r.uniforms.sheenRoughnessFactor=t.sheenRoughnessFactor),t.sheenColorTexture&&m(e,t.sheenColorTexture,"pbr_sheenColorSampler",r,{featureOptions:{define:"HAS_SHEENCOLORMAP",enabledUniformName:"sheenColorMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"sheenColor"}),t.sheenRoughnessTexture&&m(e,t.sheenRoughnessTexture,"pbr_sheenRoughnessSampler",r,{featureOptions:{define:"HAS_SHEENROUGHNESSMAP",enabledUniformName:"sheenRoughnessMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"sheenRoughness"}))}(e,t.KHR_materials_sheen,r,a,i),function(e,t,r,n,a={}){t&&(void 0!==t.iridescenceFactor&&(r.uniforms.iridescenceFactor=t.iridescenceFactor),void 0!==t.iridescenceIor&&(r.uniforms.iridescenceIor=t.iridescenceIor),(void 0!==t.iridescenceThicknessMinimum||void 0!==t.iridescenceThicknessMaximum)&&(r.uniforms.iridescenceThicknessRange=[t.iridescenceThicknessMinimum??100,t.iridescenceThicknessMaximum??400]),t.iridescenceTexture&&m(e,t.iridescenceTexture,"pbr_iridescenceSampler",r,{featureOptions:{define:"HAS_IRIDESCENCEMAP",enabledUniformName:"iridescenceMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"iridescence"}),t.iridescenceThicknessTexture&&m(e,t.iridescenceThicknessTexture,"pbr_iridescenceThicknessSampler",r,{featureOptions:{define:"HAS_IRIDESCENCETHICKNESSMAP"},gltf:n,attributes:a,textureTransformSlot:"iridescenceThickness"}))}(e,t.KHR_materials_iridescence,r,a,i),function(e,t,r,n,a={}){t&&(void 0!==t.anisotropyStrength&&(r.uniforms.anisotropyStrength=t.anisotropyStrength),void 0!==t.anisotropyRotation&&(r.uniforms.anisotropyRotation=t.anisotropyRotation),t.anisotropyTexture&&m(e,t.anisotropyTexture,"pbr_anisotropySampler",r,{featureOptions:{define:"HAS_ANISOTROPYMAP",enabledUniformName:"anisotropyMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"anisotropy"}))}(e,t.KHR_materials_anisotropy,r,a,i),u=t.KHR_materials_emissive_strength,f=r,u?.emissiveStrength!==void 0&&(f.uniforms.emissiveStrength=u.emissiveStrength))}(e,t.extensions,r,i,a),t.alphaMode||"OPAQUE"){case"OPAQUE":break;case"MASK":{let{alphaCutoff:e=.5}=t;r.defines.ALPHA_CUTOFF=!0,r.uniforms.alphaCutoffEnabled=!0,r.uniforms.alphaCutoff=e;break}case"BLEND":var s;n.R.warn("glTF BLEND alphaMode might not work well because it requires mesh sorting")(),(s=r).parameters.blend=!0,s.parameters.blendColorOperation="add",s.parameters.blendColorSrcFactor="src-alpha",s.parameters.blendColorDstFactor="one-minus-src-alpha",s.parameters.blendAlphaOperation="add",s.parameters.blendAlphaSrcFactor="one",s.parameters.blendAlphaDstFactor="one-minus-src-alpha",s.glParameters.blend=!0,s.glParameters.blendEquation=o.n.FUNC_ADD,s.glParameters.blendFunc=[o.n.SRC_ALPHA,o.n.ONE_MINUS_SRC_ALPHA,o.n.ONE,o.n.ONE_MINUS_SRC_ALPHA]}}(e,t,i,r,a.gltf)),i}function f(e,t){let r=[];for(let n of(0,l.ii)()){let a=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,n.pathSegments);a&&(0,l.CC)(a)===t&&r.push(n.displayName)}return r}function p(e,t){return c[t].some(t=>!!e[t])}function m(e,t,r,c,u={}){let f,{featureOptions:b={},gltf:A,attributes:g={},textureTransformSlot:B}=u,{define:C,enabledUniformName:v}=b,_=(0,l.CC)(t);if(_>1)return void n.R.warn(`Skipping ${String(r)} because ${_} is not supported; only TEXCOORD_0 and TEXCOORD_1 are currently available`)();if(1===_&&!p(g,"TEXCOORD_1"))return void n.R.warn(`Skipping ${String(r)} because it requires TEXCOORD_1 but the primitive does not provide TEXCOORD_1`)();let M=function(e,t){if(e.texture||void 0===e.index||!t?.textures)return e;let r=t.textures[e.index];return r?"texture"in r&&r.texture?{...r,...e,texture:r.texture}:"source"in r?{...e,texture:r}:e:e}(t,A),R=M.texture?.source?.image;if(!R)return void n.R.warn(`Skipping unresolved glTF texture for ${String(r)}`)();let I={wrapS:10497,wrapT:10497,minFilter:9729,magFilter:9729,...M?.texture?.sampler},y={id:M.uniformName||M.id,sampler:{addressModeU:s(I.wrapS),addressModeV:s(I.wrapT),magFilter:function(e){switch(e){case o.n.NEAREST:return"nearest";case o.n.LINEAR:return"linear";default:return}}(I.magFilter),...function(e){switch(e){case o.n.NEAREST:return{minFilter:"nearest"};case o.n.LINEAR:return{minFilter:"linear"};case o.n.NEAREST_MIPMAP_NEAREST:return{minFilter:"nearest",mipmapFilter:"nearest"};case o.n.LINEAR_MIPMAP_NEAREST:return{minFilter:"linear",mipmapFilter:"nearest"};case o.n.NEAREST_MIPMAP_LINEAR:return{minFilter:"nearest",mipmapFilter:"linear"};case o.n.LINEAR_MIPMAP_LINEAR:return{minFilter:"linear",mipmapFilter:"linear"};default:return{}}}(I.minFilter)}};if(R.compressed)f=function(e,t,r){let o;if(0===(o=Array.isArray(t.data)&&t.data[0]?.data?t.data:"mipmaps"in t&&Array.isArray(t.mipmaps)?t.mipmaps:[]).length||!o[0]?.data)return n.R.warn("createCompressedTexture: compressed image has no valid mip levels, creating fallback")(),d(e,r);let s=o[0],l=s.width??t.width??0,c=s.height??t.height??0;if(l<=0||c<=0)return n.R.warn("createCompressedTexture: base level has invalid dimensions, creating fallback")(),d(e,r);let u=h(s);if(!u)return n.R.warn("createCompressedTexture: compressed image has no textureFormat, creating fallback")(),d(e,r);let f=function(e,t,r){let{blockWidth:n=1,blockHeight:i=1}=a.vz.getInfo(r),o=1;for(let r=1;;r++){let a=Math.max(1,e>>r),s=Math.max(1,t>>r);if(a<n||s<i)break;o++}return o}(l,c,u),p=Math.min(o.length,f),m=1;for(let e=1;e<p;e++){let t=o[e];if(!t.data||t.width<=0||t.height<=0){n.R.warn(`createCompressedTexture: mip level ${e} has invalid data/dimensions, truncating`)();break}let r=h(t);if(r&&r!==u){n.R.warn(`createCompressedTexture: mip level ${e} format '${r}' differs from base '${u}', truncating`)();break}let a=Math.max(1,l>>e),i=Math.max(1,c>>e);if(t.width!==a||t.height!==i){n.R.warn(`createCompressedTexture: mip level ${e} dimensions ${t.width}x${t.height} don't match expected ${a}x${i}, truncating`)();break}m++}let b=e.createTexture({...r,format:u,usage:i.g.TEXTURE|i.g.COPY_DST,width:l,height:c,mipLevels:m,data:s.data});for(let e=1;e<m;e++)b.writeData(o[e].data,{width:o[e].width,height:o[e].height,mipLevel:e});return b}(e,R,y);else{let{width:t,height:r}=e.getExternalImageSize(R);f=e.createTexture({...y,width:t,height:r,data:R})}if(c.bindings[r]=f,C&&(c.defines[C]=!0),v&&(c.uniforms[v]=!0),B){let e=(0,l.lz)(B);c.uniforms[e.uvSetUniform]=_,c.uniforms[e.uvTransformUniform]=(0,l.VJ)((0,l.e3)(t))}c.generatedTextures.push(f)}function d(e,t){return e.createTexture({...t,format:"rgba8unorm",width:1,height:1,mipLevels:1})}function h(e){return e.textureFormat}},29244(e,t,r){r.d(t,{CC:()=>u,Mg:()=>f,VJ:()=>p,dy:()=>m,e3:()=>c,ii:()=>s,lz:()=>l});var n=r(34331);let a=[o("baseColor","pbr_baseColorSampler","baseColorTexture",["pbrMetallicRoughness","baseColorTexture"]),o("metallicRoughness","pbr_metallicRoughnessSampler","metallicRoughnessTexture",["pbrMetallicRoughness","metallicRoughnessTexture"]),o("normal","pbr_normalSampler","normalTexture",["normalTexture"]),o("occlusion","pbr_occlusionSampler","occlusionTexture",["occlusionTexture"]),o("emissive","pbr_emissiveSampler","emissiveTexture",["emissiveTexture"]),o("specularColor","pbr_specularColorSampler","KHR_materials_specular.specularColorTexture",["extensions","KHR_materials_specular","specularColorTexture"]),o("specularIntensity","pbr_specularIntensitySampler","KHR_materials_specular.specularTexture",["extensions","KHR_materials_specular","specularTexture"]),o("transmission","pbr_transmissionSampler","KHR_materials_transmission.transmissionTexture",["extensions","KHR_materials_transmission","transmissionTexture"]),o("thickness","pbr_thicknessSampler","KHR_materials_volume.thicknessTexture",["extensions","KHR_materials_volume","thicknessTexture"]),o("clearcoat","pbr_clearcoatSampler","KHR_materials_clearcoat.clearcoatTexture",["extensions","KHR_materials_clearcoat","clearcoatTexture"]),o("clearcoatRoughness","pbr_clearcoatRoughnessSampler","KHR_materials_clearcoat.clearcoatRoughnessTexture",["extensions","KHR_materials_clearcoat","clearcoatRoughnessTexture"]),o("clearcoatNormal","pbr_clearcoatNormalSampler","KHR_materials_clearcoat.clearcoatNormalTexture",["extensions","KHR_materials_clearcoat","clearcoatNormalTexture"]),o("sheenColor","pbr_sheenColorSampler","KHR_materials_sheen.sheenColorTexture",["extensions","KHR_materials_sheen","sheenColorTexture"]),o("sheenRoughness","pbr_sheenRoughnessSampler","KHR_materials_sheen.sheenRoughnessTexture",["extensions","KHR_materials_sheen","sheenRoughnessTexture"]),o("iridescence","pbr_iridescenceSampler","KHR_materials_iridescence.iridescenceTexture",["extensions","KHR_materials_iridescence","iridescenceTexture"]),o("iridescenceThickness","pbr_iridescenceThicknessSampler","KHR_materials_iridescence.iridescenceThicknessTexture",["extensions","KHR_materials_iridescence","iridescenceThicknessTexture"]),o("anisotropy","pbr_anisotropySampler","KHR_materials_anisotropy.anisotropyTexture",["extensions","KHR_materials_anisotropy","anisotropyTexture"])],i=new Map(a.map(e=>[e.slot,e]));function o(e,t,r,n){return{slot:e,binding:t,displayName:r,pathSegments:n,uvSetUniform:`${e}UVSet`,uvTransformUniform:`${e}UVTransform`}}function s(){return a}function l(e){let t=i.get(e);if(!t)throw Error(`Unknown PBR texture transform slot ${e}`);return t}function c(e){let t=e?.extensions?.KHR_texture_transform;return{offset:t?.offset?[t.offset[0],t.offset[1]]:[0,0],rotation:t?.rotation??0,scale:t?.scale?[t.scale[0],t.scale[1]]:[1,1]}}function u(e){let t=e?.extensions?.KHR_texture_transform;return t?.texCoord??e?.texCoord??0}function f(e){return a.find(t=>t.pathSegments.length===e.length&&t.pathSegments.every((t,r)=>e[r]===t))||null}function p(e){let t=new n.d().set(1,0,0,0,1,0,e.offset[0],e.offset[1],1),r=new n.d().set(Math.cos(e.rotation),Math.sin(e.rotation),0,-Math.sin(e.rotation),Math.cos(e.rotation),0,0,0,1),a=new n.d().set(e.scale[0],0,0,0,e.scale[1],0,0,0,1);return Array.from(t.multiplyRight(r).multiplyRight(a))}function m(e,t){let r=new n.d(p(e)),a=new n.d(p(t)),i=new n.d(r).invert();return Array.from(a.multiplyRight(i))}},92397(e,t,r){var n,a;r.d(t,{n:()=>n}),(a=n||(n={}))[a.POINTS=0]="POINTS",a[a.LINES=1]="LINES",a[a.LINE_LOOP=2]="LINE_LOOP",a[a.LINE_STRIP=3]="LINE_STRIP",a[a.TRIANGLES=4]="TRIANGLES",a[a.TRIANGLE_STRIP=5]="TRIANGLE_STRIP",a[a.TRIANGLE_FAN=6]="TRIANGLE_FAN",a[a.ONE=1]="ONE",a[a.SRC_ALPHA=770]="SRC_ALPHA",a[a.ONE_MINUS_SRC_ALPHA=771]="ONE_MINUS_SRC_ALPHA",a[a.FUNC_ADD=32774]="FUNC_ADD",a[a.LINEAR=9729]="LINEAR",a[a.NEAREST=9728]="NEAREST",a[a.NEAREST_MIPMAP_NEAREST=9984]="NEAREST_MIPMAP_NEAREST",a[a.LINEAR_MIPMAP_NEAREST=9985]="LINEAR_MIPMAP_NEAREST",a[a.NEAREST_MIPMAP_LINEAR=9986]="NEAREST_MIPMAP_LINEAR",a[a.LINEAR_MIPMAP_LINEAR=9987]="LINEAR_MIPMAP_LINEAR",a[a.TEXTURE_MIN_FILTER=10241]="TEXTURE_MIN_FILTER",a[a.TEXTURE_WRAP_S=10242]="TEXTURE_WRAP_S",a[a.TEXTURE_WRAP_T=10243]="TEXTURE_WRAP_T",a[a.REPEAT=10497]="REPEAT",a[a.CLAMP_TO_EDGE=33071]="CLAMP_TO_EDGE",a[a.MIRRORED_REPEAT=33648]="MIRRORED_REPEAT",a[a.UNPACK_FLIP_Y_WEBGL=37440]="UNPACK_FLIP_Y_WEBGL"},9696(e,t,r){r.d(t,{s:()=>f});var n=r(70833);let a=`\
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
`,o=`\
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
};

const float M_PI = 3.141592653589793;
const float c_MinRoughness = 0.04;

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
  float mipCount = 9.0; // resolution of 512x512
  float lod = (pbrInfo.perceptualRoughness * mipCount);
  // retrieve a scale and bias to F0. See [1], Figure 3
  vec3 brdf = SRGBtoLINEAR(texture(pbr_brdfLUT,
    vec2(pbrInfo.NdotV, 1.0 - pbrInfo.perceptualRoughness))).rgb;
  vec3 diffuseLight = SRGBtoLINEAR(texture(pbr_diffuseEnvSampler, n)).rgb;

#ifdef USE_TEX_LOD
  vec3 specularLight = SRGBtoLINEAR(texture(pbr_specularEnvSampler, reflection, lod)).rgb;
#else
  vec3 specularLight = SRGBtoLINEAR(texture(pbr_specularEnvSampler, reflection)).rgb;
#endif

  vec3 diffuse = diffuseLight * pbrInfo.diffuseColor;
  vec3 specular = specularLight * (pbrInfo.specularColor * brdf.x + brdf.y);

  // For presentation, this allows us to disable IBL terms
  diffuse *= pbrMaterial.scaleIBLAmbient.x;
  specular *= pbrMaterial.scaleIBLAmbient.y;

  return diffuse + specular;
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

vec3 getIridescenceTint(float iridescence, float thickness, float NdotV)
{
  if (iridescence <= 0.0) {
    return vec3(1.0);
  }

  float phase = 0.015 * thickness * pbrMaterial.iridescenceIor + (1.0 - NdotV) * 6.0;
  vec3 thinFilmTint =
    0.5 + 0.5 * cos(vec3(phase, phase + 2.0943951, phase + 4.1887902));
  return mix(vec3(1.0), thinFilmTint, iridescence);
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
    basePBRInfo.v
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

  float sheenFresnel = pow(clamp(1.0 - pbrInfo.VdotH, 0.0, 1.0), 5.0);
  float sheenVisibility = mix(1.0, pbrInfo.NdotL * pbrInfo.NdotV, sheenRoughness);
  return pbrInfo.NdotL *
    lightColor *
    sheenColor *
    (0.25 + 0.75 * sheenFresnel) *
    sheenVisibility *
    (1.0 - pbrInfo.metalness);
}

float calculateAnisotropyBoost(
  PBRInfo pbrInfo,
  vec3 anisotropyTangent,
  float anisotropyStrength
) {
  if (anisotropyStrength <= 0.0) {
    return 1.0;
  }

  vec3 anisotropyBitangent = normalize(cross(pbrInfo.n, anisotropyTangent));
  float bitangentViewAlignment = abs(dot(pbrInfo.v, anisotropyBitangent));
  return mix(1.0, 0.65 + 0.7 * bitangentViewAlignment, anisotropyStrength);
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
  float anisotropyBoost = calculateAnisotropyBoost(pbrInfo, anisotropyTangent, anisotropyStrength);
  vec3 color = calculateFinalColor(pbrInfo, lightColor) * anisotropyBoost;
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

vec4 pbr_filterColor(vec4 colorUnused)
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

  // The albedo may be defined from a base texture or a flat color
#ifdef HAS_BASECOLORMAP
  vec4 baseColor =
    SRGBtoLINEAR(texture(pbr_baseColorSampler, baseColorUV)) * pbrMaterial.baseColorFactor;
#else
  vec4 baseColor = pbrMaterial.baseColorFactor;
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
    vec3 v = normalize(pbrProjection.camera - pbr_vPosition);  // Vector from surface point to camera
    float NdotV = clamp(abs(dot(n, v)), 0.001, 1.0);
#ifdef USE_MATERIAL_EXTENSIONS
    bool useExtendedPBR =
      pbrMaterial.specularColorMapEnabled ||
      pbrMaterial.specularIntensityMapEnabled ||
      abs(pbrMaterial.specularIntensityFactor - 1.0) > 0.0001 ||
      maxComponent(abs(pbrMaterial.specularColorFactor - vec3(1.0))) > 0.0001 ||
      abs(pbrMaterial.ior - 1.5) > 0.0001 ||
      pbrMaterial.transmissionMapEnabled ||
      pbrMaterial.transmissionFactor > 0.0001 ||
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
        v
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

      return vec4(pow(color, vec3(1.0 / 2.2)), baseColor.a);
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
    float anisotropyViewAlignment = abs(dot(v, anisotropyTangent));
    perceptualRoughness = mix(
      perceptualRoughness,
      clamp(perceptualRoughness * (1.0 - 0.6 * anisotropyViewAlignment), c_MinRoughness, 1.0),
      anisotropyStrength
    );

    // Roughness is authored as perceptual roughness; as is convention,
    // convert to material roughness by squaring the perceptual roughness [2].
    float alphaRoughness = perceptualRoughness * perceptualRoughness;

    float dielectricF0 = getDielectricF0(pbrMaterial.ior);
    vec3 dielectricSpecularF0 = min(
      vec3(dielectricF0) * specularFactor * specularIntensity,
      vec3(1.0)
    );
    vec3 iridescenceTint = getIridescenceTint(iridescence, iridescenceThickness, NdotV);
    dielectricSpecularF0 = mix(
      dielectricSpecularF0,
      dielectricSpecularF0 * iridescenceTint,
      iridescence
    );
    vec3 diffuseColor = baseColor.rgb * (vec3(1.0) - dielectricSpecularF0);
    diffuseColor *= (1.0 - metallic) * (1.0 - transmission);
    vec3 specularColor = mix(dielectricSpecularF0, baseColor.rgb, metallic);

    float baseLayerEnergy = 1.0 - clearcoatFactor * 0.25;
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
      v
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
      }
    }
#endif

    // Calculate lighting contribution from image based lighting source (IBL)
#ifdef USE_IBL
    if (pbrMaterial.IBLenabled) {
      color += getIBLContribution(pbrInfo, n, reflection) *
        calculateAnisotropyBoost(pbrInfo, anisotropyTangent, anisotropyStrength);
      color += calculateClearcoatIBLContribution(
        pbrInfo,
        clearcoatNormal,
        -normalize(reflect(v, clearcoatNormal)),
        clearcoatFactor,
        clearcoatRoughness
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
      color = mix(color, color * getVolumeAttenuation(thickness), transmission);
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

  float alpha = clamp(baseColor.a * (1.0 - transmission), 0.0, 1.0);
  return vec4(pow(color,vec3(1.0/2.2)), alpha);
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
};

const M_PI = 3.141592653589793;
const c_MinRoughness = 0.04;

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

  var ng: vec3f = cross(pos_dx, pos_dy);
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
  let mipCount: f32 = 9.0; // resolution of 512x512
  let lod: f32 = pbrInfo.perceptualRoughness * mipCount;
  // retrieve a scale and bias to F0. See [1], Figure 3
  let brdf = SRGBtoLINEAR(
    textureSampleLevel(
      pbr_brdfLUT,
      pbr_brdfLUTSampler,
      vec2f(pbrInfo.NdotV, 1.0 - pbrInfo.perceptualRoughness),
      0.0
    )
  ).rgb;
  let diffuseLight =
    SRGBtoLINEAR(
      textureSampleLevel(pbr_diffuseEnvSampler, pbr_diffuseEnvSamplerSampler, n, 0.0)
    ).rgb;
  var specularLight = SRGBtoLINEAR(
    textureSampleLevel(
      pbr_specularEnvSampler,
      pbr_specularEnvSamplerSampler,
      reflection,
      0.0
    )
  ).rgb;
#ifdef USE_TEX_LOD
  specularLight = SRGBtoLINEAR(
    textureSampleLevel(
      pbr_specularEnvSampler,
      pbr_specularEnvSamplerSampler,
      reflection,
      lod
    )
  ).rgb;
#endif

  let diffuse = diffuseLight * pbrInfo.diffuseColor * pbrMaterial.scaleIBLAmbient.x;
  let specular =
    specularLight * (pbrInfo.specularColor * brdf.x + brdf.y) * pbrMaterial.scaleIBLAmbient.y;

  return diffuse + specular;
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

fn getIridescenceTint(iridescence: f32, thickness: f32, NdotV: f32) -> vec3f {
  if (iridescence <= 0.0) {
    return vec3f(1.0);
  }

  let phase = 0.015 * thickness * pbrMaterial.iridescenceIor + (1.0 - NdotV) * 6.0;
  let thinFilmTint =
    0.5 +
    0.5 *
    cos(vec3f(phase, phase + 2.0943951, phase + 4.1887902));
  return mix(vec3f(1.0), thinFilmTint, iridescence);
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
    basePBRInfo.v
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

  let sheenFresnel = pow(clamp(1.0 - pbrInfo.VdotH, 0.0, 1.0), 5.0);
  let sheenVisibility = mix(1.0, pbrInfo.NdotL * pbrInfo.NdotV, sheenRoughness);
  return pbrInfo.NdotL *
    lightColor *
    sheenColor *
    (0.25 + 0.75 * sheenFresnel) *
    sheenVisibility *
    (1.0 - pbrInfo.metalness);
}

fn calculateAnisotropyBoost(
  pbrInfo: PBRInfo,
  anisotropyTangent: vec3f,
  anisotropyStrength: f32
) -> f32 {
  if (anisotropyStrength <= 0.0) {
    return 1.0;
  }

  let anisotropyBitangent = normalize(cross(pbrInfo.n, anisotropyTangent));
  let bitangentViewAlignment = abs(dot(pbrInfo.v, anisotropyBitangent));
  return mix(1.0, 0.65 + 0.7 * bitangentViewAlignment, anisotropyStrength);
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
  let anisotropyBoost = calculateAnisotropyBoost(pbrInfo, anisotropyTangent, anisotropyStrength);
  var color = calculateFinalColor(pbrInfo, lightColor) * anisotropyBoost;
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

fn pbr_filterColor(colorUnused: vec4<f32>) -> vec4<f32> {
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

  // The albedo may be defined from a base texture or a flat color
  var baseColor: vec4<f32> = pbrMaterial.baseColorFactor;
  #ifdef HAS_BASECOLORMAP
  baseColor = SRGBtoLINEAR(
    textureSample(pbr_baseColorSampler, pbr_baseColorSamplerSampler, baseColorUV)
  ) * pbrMaterial.baseColorFactor;
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
      pbrMaterial.transmissionMapEnabled != 0 ||
      pbrMaterial.transmissionFactor > 0.0001 ||
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
        v
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

      return vec4<f32>(pow(color, vec3<f32>(1.0 / 2.2)), baseColor.a);
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
    let anisotropyViewAlignment = abs(dot(v, anisotropyTangent));
    perceptualRoughness = mix(
      perceptualRoughness,
      clamp(perceptualRoughness * (1.0 - 0.6 * anisotropyViewAlignment), c_MinRoughness, 1.0),
      anisotropyStrength
    );

    // Roughness is authored as perceptual roughness; as is convention,
    // convert to material roughness by squaring the perceptual roughness [2].
    let alphaRoughness = perceptualRoughness * perceptualRoughness;

    let dielectricF0 = getDielectricF0(pbrMaterial.ior);
    var dielectricSpecularF0 = min(
      vec3f(dielectricF0) * specularFactor * specularIntensity,
      vec3f(1.0)
    );
    let iridescenceTint = getIridescenceTint(iridescence, iridescenceThickness, NdotV);
    dielectricSpecularF0 = mix(
      dielectricSpecularF0,
      dielectricSpecularF0 * iridescenceTint,
      iridescence
    );
    var diffuseColor = baseColor.rgb * (vec3f(1.0) - dielectricSpecularF0);
    diffuseColor *= (1.0 - metallic) * (1.0 - transmission);
    var specularColor = mix(dielectricSpecularF0, baseColor.rgb, metallic);

    let baseLayerEnergy = 1.0 - clearcoatFactor * 0.25;
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
      v
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
      }
    }
    #endif

    // Calculate lighting contribution from image based lighting source (IBL)
    #ifdef USE_IBL
    if (pbrMaterial.IBLenabled != 0) {
      color += getIBLContribution(pbrInfo, n, reflection) *
        calculateAnisotropyBoost(pbrInfo, anisotropyTangent, anisotropyStrength);
      color += calculateClearcoatIBLContribution(
        pbrInfo,
        clearcoatNormal,
        -normalize(reflect(v, clearcoatNormal)),
        clearcoatFactor,
        clearcoatRoughness
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
      color = mix(color, color * getVolumeAttenuation(thickness), transmission);
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

  let alpha = clamp(baseColor.a * (1.0 - transmission), 0.0, 1.0);
  return vec4<f32>(pow(color, vec3<f32>(1.0 / 2.2)), alpha);
}
`,c=`\
layout(std140) uniform pbrProjectionUniforms {
  mat4 modelViewProjectionMatrix;
  mat4 modelMatrix;
  mat4 normalMatrix;
  vec3 camera;
} pbrProjection;
`,u=`\
struct pbrProjectionUniforms {
  modelViewProjectionMatrix: mat4x4<f32>,
  modelMatrix: mat4x4<f32>,
  normalMatrix: mat4x4<f32>,
  camera: vec3<f32>
};

@group(0) @binding(auto) var<uniform> pbrProjection: pbrProjectionUniforms;
`,f={props:{},uniforms:{},defaultUniforms:{unlit:!1,baseColorMapEnabled:!1,baseColorFactor:[1,1,1,1],normalMapEnabled:!1,normalScale:1,emissiveMapEnabled:!1,emissiveFactor:[0,0,0],metallicRoughnessValues:[1,1],metallicRoughnessMapEnabled:!1,occlusionMapEnabled:!1,occlusionStrength:1,alphaCutoffEnabled:!1,alphaCutoff:.5,IBLenabled:!1,scaleIBLAmbient:[1,1],scaleDiffBaseMR:[0,0,0,0],scaleFGDSpec:[0,0,0,0],specularColorFactor:[1,1,1],specularIntensityFactor:1,specularColorMapEnabled:!1,specularIntensityMapEnabled:!1,ior:1.5,transmissionFactor:0,transmissionMapEnabled:!1,thicknessFactor:0,attenuationDistance:1e9,attenuationColor:[1,1,1],clearcoatFactor:0,clearcoatRoughnessFactor:0,clearcoatMapEnabled:!1,clearcoatRoughnessMapEnabled:!1,sheenColorFactor:[0,0,0],sheenRoughnessFactor:0,sheenColorMapEnabled:!1,sheenRoughnessMapEnabled:!1,iridescenceFactor:0,iridescenceIor:1.3,iridescenceThicknessRange:[100,400],iridescenceMapEnabled:!1,anisotropyStrength:0,anisotropyRotation:0,anisotropyDirection:[1,0],anisotropyMapEnabled:!1,emissiveStrength:1,baseColorUVSet:0,baseColorUVTransform:[1,0,0,0,1,0,0,0,1],metallicRoughnessUVSet:0,metallicRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],normalUVSet:0,normalUVTransform:[1,0,0,0,1,0,0,0,1],occlusionUVSet:0,occlusionUVTransform:[1,0,0,0,1,0,0,0,1],emissiveUVSet:0,emissiveUVTransform:[1,0,0,0,1,0,0,0,1],specularColorUVSet:0,specularColorUVTransform:[1,0,0,0,1,0,0,0,1],specularIntensityUVSet:0,specularIntensityUVTransform:[1,0,0,0,1,0,0,0,1],transmissionUVSet:0,transmissionUVTransform:[1,0,0,0,1,0,0,0,1],thicknessUVSet:0,thicknessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatUVSet:0,clearcoatUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatRoughnessUVSet:0,clearcoatRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatNormalUVSet:0,clearcoatNormalUVTransform:[1,0,0,0,1,0,0,0,1],sheenColorUVSet:0,sheenColorUVTransform:[1,0,0,0,1,0,0,0,1],sheenRoughnessUVSet:0,sheenRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceUVSet:0,iridescenceUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceThicknessUVSet:0,iridescenceThicknessUVTransform:[1,0,0,0,1,0,0,0,1],anisotropyUVSet:0,anisotropyUVTransform:[1,0,0,0,1,0,0,0,1]},name:"pbrMaterial",firstBindingSlot:0,bindingLayout:[{name:"pbrMaterial",group:3},{name:"pbr_baseColorSampler",group:3},{name:"pbr_normalSampler",group:3},{name:"pbr_emissiveSampler",group:3},{name:"pbr_metallicRoughnessSampler",group:3},{name:"pbr_occlusionSampler",group:3},{name:"pbr_specularColorSampler",group:3},{name:"pbr_specularIntensitySampler",group:3},{name:"pbr_transmissionSampler",group:3},{name:"pbr_thicknessSampler",group:3},{name:"pbr_clearcoatSampler",group:3},{name:"pbr_clearcoatRoughnessSampler",group:3},{name:"pbr_clearcoatNormalSampler",group:3},{name:"pbr_sheenColorSampler",group:3},{name:"pbr_sheenRoughnessSampler",group:3},{name:"pbr_iridescenceSampler",group:3},{name:"pbr_iridescenceThicknessSampler",group:3},{name:"pbr_anisotropySampler",group:3}],dependencies:[n.x,{name:"ibl",firstBindingSlot:32,bindingLayout:[{name:"pbr_diffuseEnvSampler",group:2},{name:"pbr_specularEnvSampler",group:2},{name:"pbr_brdfLUT",group:2}],source:a,vs:i,fs:i},{name:"pbrProjection",bindingLayout:[{name:"pbrProjection",group:0}],source:u,vs:c,fs:c,getUniforms:e=>e,uniformTypes:{modelViewProjectionMatrix:"mat4x4<f32>",modelMatrix:"mat4x4<f32>",normalMatrix:"mat4x4<f32>",camera:"vec3<f32>"}}],source:l,vs:o,fs:s,defines:{LIGHTING_FRAGMENT:!0,HAS_NORMALMAP:!1,HAS_EMISSIVEMAP:!1,HAS_OCCLUSIONMAP:!1,HAS_BASECOLORMAP:!1,HAS_METALROUGHNESSMAP:!1,HAS_SPECULARCOLORMAP:!1,HAS_SPECULARINTENSITYMAP:!1,HAS_TRANSMISSIONMAP:!1,HAS_THICKNESSMAP:!1,HAS_CLEARCOATMAP:!1,HAS_CLEARCOATROUGHNESSMAP:!1,HAS_CLEARCOATNORMALMAP:!1,HAS_SHEENCOLORMAP:!1,HAS_SHEENROUGHNESSMAP:!1,HAS_IRIDESCENCEMAP:!1,HAS_IRIDESCENCETHICKNESSMAP:!1,HAS_ANISOTROPYMAP:!1,USE_MATERIAL_EXTENSIONS:!1,ALPHA_CUTOFF:!1,USE_IBL:!1,PBR_DEBUG:!1},getUniforms:e=>e,uniformTypes:{unlit:"i32",baseColorMapEnabled:"i32",baseColorFactor:"vec4<f32>",normalMapEnabled:"i32",normalScale:"f32",emissiveMapEnabled:"i32",emissiveFactor:"vec3<f32>",metallicRoughnessValues:"vec2<f32>",metallicRoughnessMapEnabled:"i32",occlusionMapEnabled:"i32",occlusionStrength:"f32",alphaCutoffEnabled:"i32",alphaCutoff:"f32",specularColorFactor:"vec3<f32>",specularIntensityFactor:"f32",specularColorMapEnabled:"i32",specularIntensityMapEnabled:"i32",ior:"f32",transmissionFactor:"f32",transmissionMapEnabled:"i32",thicknessFactor:"f32",attenuationDistance:"f32",attenuationColor:"vec3<f32>",clearcoatFactor:"f32",clearcoatRoughnessFactor:"f32",clearcoatMapEnabled:"i32",clearcoatRoughnessMapEnabled:"i32",sheenColorFactor:"vec3<f32>",sheenRoughnessFactor:"f32",sheenColorMapEnabled:"i32",sheenRoughnessMapEnabled:"i32",iridescenceFactor:"f32",iridescenceIor:"f32",iridescenceThicknessRange:"vec2<f32>",iridescenceMapEnabled:"i32",anisotropyStrength:"f32",anisotropyRotation:"f32",anisotropyDirection:"vec2<f32>",anisotropyMapEnabled:"i32",emissiveStrength:"f32",IBLenabled:"i32",scaleIBLAmbient:"vec2<f32>",scaleDiffBaseMR:"vec4<f32>",scaleFGDSpec:"vec4<f32>",baseColorUVSet:"i32",baseColorUVTransform:"mat3x3<f32>",metallicRoughnessUVSet:"i32",metallicRoughnessUVTransform:"mat3x3<f32>",normalUVSet:"i32",normalUVTransform:"mat3x3<f32>",occlusionUVSet:"i32",occlusionUVTransform:"mat3x3<f32>",emissiveUVSet:"i32",emissiveUVTransform:"mat3x3<f32>",specularColorUVSet:"i32",specularColorUVTransform:"mat3x3<f32>",specularIntensityUVSet:"i32",specularIntensityUVTransform:"mat3x3<f32>",transmissionUVSet:"i32",transmissionUVTransform:"mat3x3<f32>",thicknessUVSet:"i32",thicknessUVTransform:"mat3x3<f32>",clearcoatUVSet:"i32",clearcoatUVTransform:"mat3x3<f32>",clearcoatRoughnessUVSet:"i32",clearcoatRoughnessUVTransform:"mat3x3<f32>",clearcoatNormalUVSet:"i32",clearcoatNormalUVTransform:"mat3x3<f32>",sheenColorUVSet:"i32",sheenColorUVTransform:"mat3x3<f32>",sheenRoughnessUVSet:"i32",sheenRoughnessUVTransform:"mat3x3<f32>",iridescenceUVSet:"i32",iridescenceUVTransform:"mat3x3<f32>",iridescenceThicknessUVSet:"i32",iridescenceThicknessUVTransform:"mat3x3<f32>",anisotropyUVSet:"i32",anisotropyUVTransform:"mat3x3<f32>"}}}}]);
//# sourceMappingURL=2092.3859cf35.js.map