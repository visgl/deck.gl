"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["4708"],{68429(e,t,r){r.d(t,{T:()=>i,n:()=>a});let i={name:"glTF",id:"gltf",module:"gltf",encoding:"binary",format:"gltf",extensions:["gltf","glb"],mimeTypes:["model/gltf+json","model/gltf-binary"],text:!0,binary:!0,tests:["glTF"]},a={name:"GLB",id:"glb",module:"gltf",encoding:"binary",format:"glb",extensions:["glb"],mimeTypes:["model/gltf-binary"],binary:!0,tests:["glTF"]}},12765(e,t,r){r.d(t,{B:()=>n});var i=r(65184);async function a(){let{GLTFLoaderWithParser:e}=await Promise.all([r.e("5747"),r.e("4008"),r.e("2181"),r.e("1800")]).then(r.bind(r,23595));return e}let n={dataType:null,batchType:null,...r(68429).T,version:i.x,preload:a,options:{gltf:{normalize:!0,loadBuffers:!0,loadFiles:!1,loadExternalAssets:!1,loadImages:!0,decompressMeshes:!0}}}},20943(e,t,r){r.d(t,{I:()=>A});var i=r(3259),a=r(89153);class n{gltf;type;index;data;path;iterator;constructor(e,t,r,i,a){this.iterator=e,this.gltf=e.gltf,this.type=t,this.index=r,this.data=i,this.path=a}}class o extends n{parent;constructor(e,t,r,i,a,n){super(e,t,r,i,a),this.parent=n}}class s extends n{get bufferView(){return void 0===this.data.bufferView?void 0:this.iterator.resolveBufferView(this.data.bufferView,`${this.path}.bufferView`)}}class l extends n{get channels(){return y(this.data.channels,(e,t)=>this.iterator.getOrCreateNested(e,()=>new c(this.iterator,"animationChannel",t,e,`${this.path}.channels[${t}]`,this)))}get samplers(){return y(this.data.samplers,(e,t)=>this.iterator.getOrCreateNested(e,()=>new f(this.iterator,"animationSampler",t,e,`${this.path}.samplers[${t}]`,this)))}}class c extends o{get sampler(){let e=this.parent.data.samplers[this.data.sampler];if(!e)throw Error(`Invalid glTF reference at ${this.path}.sampler: animation sampler index ${this.data.sampler} is out of range`);return this.iterator.getOrCreateNested(e,()=>new f(this.iterator,"animationSampler",this.data.sampler,e,`${this.parent.path}.samplers[${this.data.sampler}]`,this.parent))}get target(){return this.iterator.getOrCreateNested(this.data.target,()=>new u(this.iterator,"animationChannelTarget",0,this.data.target,`${this.path}.target`,this))}}class u extends o{get node(){return void 0===this.data.node?void 0:this.iterator.resolveNode(this.data.node,`${this.path}.node`)}}class f extends o{get input(){return this.iterator.resolveAccessor(this.data.input,`${this.path}.input`)}get output(){return this.iterator.resolveAccessor(this.data.output,`${this.path}.output`)}}class p extends n{get loadedBuffer(){return this.gltf.buffers[this.index]}}class m extends n{get buffer(){return this.iterator.resolveBuffer(this.data.buffer,`${this.path}.buffer`)}get loadedBufferView(){let e=this.buffer.loadedBuffer;if(!e)return;let t=e.byteOffset+(this.data.byteOffset||0);return new Uint8Array(e.arrayBuffer,t,this.data.byteLength)}}class d extends n{}class h extends n{get file(){return this.iterator.resolveFile(this.data.file,`${this.path}.file`)}get loadedAsset(){return this.gltf.externalAssets?.[this.index]}}class g extends n{get bufferView(){return void 0===this.data.bufferView?void 0:this.iterator.resolveBufferView(this.data.bufferView,`${this.path}.bufferView`)}get loadedFile(){return this.gltf.files?.[this.index]}}class b extends n{get bufferView(){return void 0===this.data.bufferView?void 0:this.iterator.resolveBufferView(this.data.bufferView,`${this.path}.bufferView`)}get loadedImage(){return this.gltf.images?.[this.index]}}class v extends n{get baseColorTexture(){return this.getTextureInfo(this.data.pbrMetallicRoughness?.baseColorTexture,0,"pbrMetallicRoughness.baseColorTexture")}get metallicRoughnessTexture(){return this.getTextureInfo(this.data.pbrMetallicRoughness?.metallicRoughnessTexture,1,"pbrMetallicRoughness.metallicRoughnessTexture")}get normalTexture(){return this.getTextureInfo(this.data.normalTexture,2,"normalTexture")}get occlusionTexture(){return this.getTextureInfo(this.data.occlusionTexture,3,"occlusionTexture")}get emissiveTexture(){return this.getTextureInfo(this.data.emissiveTexture,4,"emissiveTexture")}get textures(){return[this.baseColorTexture,this.metallicRoughnessTexture,this.normalTexture,this.occlusionTexture,this.emissiveTexture].filter(e=>!!e).values()}getTextureInfo(e,t,r){return e?this.iterator.getOrCreateNested(e,()=>new S(this.iterator,"textureInfo",t,e,`${this.path}.${r}`,this)):void 0}}class S extends o{get texture(){return this.iterator.resolveTexture(this.data.index,`${this.path}.index`)}}class _ extends n{get primitives(){return y(this.data.primitives,(e,t)=>this.iterator.getOrCreateNested(e,()=>new x(this.iterator,"primitive",t,e,`${this.path}.primitives[${t}]`,this)))}}class x extends o{get attributes(){return new Map(Object.entries(this.data.attributes).map(([e,t])=>[e,this.iterator.resolveAccessor(t,`${this.path}.attributes.${e}`)]))}get indices(){return void 0===this.data.indices?void 0:this.iterator.resolveAccessor(this.data.indices,`${this.path}.indices`)}get material(){return void 0===this.data.material?void 0:this.iterator.resolveMaterial(this.data.material,`${this.path}.material`)}get targets(){return(this.data.targets||[]).map((e,t)=>new Map(Object.entries(e).map(([e,r])=>[e,this.iterator.resolveAccessor(r,`${this.path}.targets[${t}].${e}`)])))}}class R extends n{get camera(){return void 0===this.data.camera?void 0:this.iterator.resolveCamera(this.data.camera,`${this.path}.camera`)}get children(){return y(this.data.children||[],(e,t)=>this.iterator.resolveNode(e,`${this.path}.children[${t}]`))}get skin(){return void 0===this.data.skin?void 0:this.iterator.resolveSkin(this.data.skin,`${this.path}.skin`)}get mesh(){return void 0===this.data.mesh?void 0:this.iterator.resolveMesh(this.data.mesh,`${this.path}.mesh`)}get externalAsset(){return void 0===this.data.externalAsset?void 0:this.iterator.resolveExternalAsset(this.data.externalAsset,`${this.path}.externalAsset`)}}class T extends n{}class M extends n{get nodes(){return y(this.data.nodes||[],(e,t)=>this.iterator.resolveNode(e,`${this.path}.nodes[${t}]`))}}class I extends n{get inverseBindMatrices(){return void 0===this.data.inverseBindMatrices?void 0:this.iterator.resolveAccessor(this.data.inverseBindMatrices,`${this.path}.inverseBindMatrices`)}get skeleton(){return void 0===this.data.skeleton?void 0:this.iterator.resolveNode(this.data.skeleton,`${this.path}.skeleton`)}get joints(){return y(this.data.joints,(e,t)=>this.iterator.resolveNode(e,`${this.path}.joints[${t}]`))}}class C extends n{get sampler(){return void 0===this.data.sampler?void 0:this.iterator.resolveSampler(this.data.sampler,`${this.path}.sampler`)}get source(){return void 0===this.data.source?void 0:this.iterator.resolveImage(this.data.source,`${this.path}.source`)}}class A{gltf;objectCache=new WeakMap;referencesCache=new WeakMap;constructor(e){this.gltf=e}get data(){return this.gltf.json}getTypedArrayForBufferView(e){return(0,i.a1)(this.data,this.gltf.buffers,e)}getTypedArrayForAccessor(e){return(0,i.eX)(this.data,this.gltf.buffers,e)}getTypedArrayForImageData(e){return(0,i.er)(this.data,this.gltf.buffers,e)}getLoadedBuffer(e){let t=this.getMetadata(e);return this.gltf.buffers[t.index]}getLoadedBufferView(e){let t=this.getReferences(e).buffer,r=this.getLoadedBuffer(t);if(!r)return;let i=r.byteOffset+(e.byteOffset||0);return new Uint8Array(r.arrayBuffer,i,e.byteLength)}getLoadedImage(e){return this.gltf.images?.[this.getMetadata(e).index]}getLoadedFile(e){return this.gltf.files?.[this.getMetadata(e).index]}getLoadedExternalAsset(e){return this.gltf.externalAssets?.[this.getMetadata(e).index]}addBuffer(e){let t=e.buffer.slice(e.byteOffset,e.byteOffset+e.byteLength);return this.gltf.buffers.push({arrayBuffer:t,byteOffset:0,byteLength:e.byteLength}),this.data.buffers||=[],this.data.buffers.push({byteLength:e.byteLength}),this.data.buffers.length-1}addBufferView(e,t,r=0){return this.data.bufferViews||=[],this.data.bufferViews.push({buffer:e,byteOffset:r,byteLength:t}),this.data.bufferViews.length-1}addAccessor(e,t){return this.data.accessors||=[],this.data.accessors.push({bufferView:e,type:(0,a.v7)(t.size),componentType:t.componentType,count:t.count,min:t.min,max:t.max}),this.data.accessors.length-1}getReferences(e){let t=this.referencesCache.get(e);if(t)return t;let r=function(e){switch(e.type){case"accessor":return{get bufferView(){return e.bufferView?.data}};case"animation":return{get channels(){return N(e.channels)},get samplers(){return N(e.samplers)}};case"animationChannel":return{get sampler(){return e.sampler.data},get target(){return e.target.data}};case"animationChannelTarget":return{get node(){return e.node?.data}};case"animationSampler":return{get input(){return e.input.data},get output(){return e.output.data}};case"bufferView":return{get buffer(){return e.buffer.data}};case"externalAsset":return{get file(){return e.file.data}};case"file":case"image":return{get bufferView(){return e.bufferView?.data}};case"material":return{get baseColorTexture(){return e.baseColorTexture?.data},get metallicRoughnessTexture(){return e.metallicRoughnessTexture?.data},get normalTexture(){return e.normalTexture?.data},get occlusionTexture(){return e.occlusionTexture?.data},get emissiveTexture(){return e.emissiveTexture?.data},get textures(){return N(e.textures)}};case"textureInfo":return{get texture(){return e.texture.data}};case"mesh":return{get primitives(){return N(e.primitives)}};case"primitive":return{get attributes(){return E(e.attributes)},get indices(){return e.indices?.data},get material(){return e.material?.data},get targets(){return e.targets.map(E)}};case"node":return{get camera(){return e.camera?.data},get children(){return N(e.children)},get skin(){return e.skin?.data},get mesh(){return e.mesh?.data},get externalAsset(){return e.externalAsset?.data}};case"scene":return{get nodes(){return N(e.nodes)}};case"skin":return{get inverseBindMatrices(){return e.inverseBindMatrices?.data},get skeleton(){return e.skeleton?.data},get joints(){return N(e.joints)}};case"texture":return{get sampler(){return e.sampler?.data},get source(){return e.source?.data}};default:return{}}}(this.getObjectIterator(e));return this.referencesCache.set(e,r),r}getMetadata(e){let t=this.getObjectIterator(e),r=t instanceof o?t.parent.data:void 0;return{gltf:this.gltf,type:t.type,index:t.index,parent:r,path:t.path}}get scene(){return void 0===this.data.scene?void 0:this.resolveScene(this.data.scene,"scene").data}get thumbnail(){return void 0===this.data.asset.thumbnail?void 0:this.resolveImage(this.data.asset.thumbnail,"asset.thumbnail").data}get accessors(){return this.iterateCollectionData("accessor")}get animations(){return this.iterateCollectionData("animation")}get buffers(){return this.iterateCollectionData("buffer")}get bufferViews(){return this.iterateCollectionData("bufferView")}get cameras(){return this.iterateCollectionData("camera")}get externalAssets(){return this.iterateCollectionData("externalAsset")}get files(){return this.iterateCollectionData("file")}get images(){return this.iterateCollectionData("image")}get materials(){return this.iterateCollectionData("material")}get meshes(){return this.iterateCollectionData("mesh")}get nodes(){return this.iterateCollectionData("node")}get samplers(){return this.iterateCollectionData("sampler")}get scenes(){return this.iterateCollectionData("scene")}get skins(){return this.iterateCollectionData("skin")}get textures(){return this.iterateCollectionData("texture")}hasExtension(e){return!!this.data.extensionsUsed?.includes(e)||!!this.data.extensionsRequired?.includes(e)}isExtensionRequired(e){return!!this.data.extensionsRequired?.includes(e)}getExtension(e,t){let r="string"==typeof e?this.data:e;return r.extensions?.["string"==typeof e?e:t]}setExtension(e,t,r){let i="string"==typeof e,a=i?this.data:e,n=i?e:t,o=i?t:r;a.extensions||={},a.extensions[n]=o,this.registerUsedExtension(n),i&&r&&this.registerRequiredExtension(n)}registerUsedExtension(e){this.data.extensionsUsed||=[],this.data.extensionsUsed.includes(e)||this.data.extensionsUsed.push(e)}registerRequiredExtension(e){this.registerUsedExtension(e),this.data.extensionsRequired||=[],this.data.extensionsRequired.includes(e)||this.data.extensionsRequired.push(e)}removeExtension(e,t){let r="string"==typeof e,i=r?this.data:e,a=r?e:t;i.extensions?.[a]!==void 0&&(this.recordRemovedExtension(a),delete i.extensions[a]),r&&(U(this.data.extensionsUsed,a),U(this.data.extensionsRequired,a))}recordRemovedExtension(e){let t=this.data;t.extensionsRemoved||=[],t.extensionsRemoved.includes(e)||t.extensionsRemoved.push(e)}resolveAccessor(e,t){return this.resolveCollectionObject("accessor",e,t)}resolveBuffer(e,t){return this.resolveCollectionObject("buffer",e,t)}resolveBufferView(e,t){return this.resolveCollectionObject("bufferView",e,t)}resolveCamera(e,t){return this.resolveCollectionObject("camera",e,t)}resolveExternalAsset(e,t){return this.resolveCollectionObject("externalAsset",e,t)}resolveFile(e,t){return this.resolveCollectionObject("file",e,t)}resolveImage(e,t){return this.resolveCollectionObject("image",e,t)}resolveMaterial(e,t){return this.resolveCollectionObject("material",e,t)}resolveMesh(e,t){return this.resolveCollectionObject("mesh",e,t)}resolveNode(e,t){return this.resolveCollectionObject("node",e,t)}resolveSampler(e,t){return this.resolveCollectionObject("sampler",e,t)}resolveScene(e,t){return this.resolveCollectionObject("scene",e,t)}resolveSkin(e,t){return this.resolveCollectionObject("skin",e,t)}resolveTexture(e,t){return this.resolveCollectionObject("texture",e,t)}getOrCreateNested(e,t){return this.getOrCreate(e,t)}iterateCollection(e){return y(this.getCollection(e),(t,r)=>this.resolveCollectionObject(e,r,e))}iterateCollectionData(e){return function*(t){for(let r of t.iterateCollection(e))yield r.data}(this)}getObjectIterator(e){let t=this.objectCache.get(e);if(!t)throw Error("glTF object is not registered with this iterator");return t}resolveCollectionObject(e,t,r){let i=this.getCollection(e)[t];if(!i)throw Error(`Invalid glTF reference at ${r}: ${e} index ${t} is out of range`);return this.getOrCreate(i,()=>this.createCollectionObject(e,t,i))}getCollection(e){switch(e){case"accessor":return this.data.accessors||[];case"animation":return this.data.animations||[];case"buffer":return this.data.buffers||[];case"bufferView":return this.data.bufferViews||[];case"camera":return this.data.cameras||[];case"externalAsset":return this.data.externalAssets||[];case"file":return this.data.files||[];case"image":return this.data.images||[];case"material":return this.data.materials||[];case"mesh":return this.data.meshes||[];case"node":return this.data.nodes||[];case"sampler":return this.data.samplers||[];case"scene":return this.data.scenes||[];case"skin":return this.data.skins||[];case"texture":return this.data.textures||[]}}createCollectionObject(e,t,r){let i=`${function(e){switch(e){case"bufferView":return"bufferViews";case"externalAsset":return"externalAssets";case"mesh":return"meshes";default:return`${e}s`}}(e)}[${t}]`;switch(e){case"accessor":return new s(this,e,t,r,i);case"animation":return new l(this,e,t,r,i);case"buffer":return new p(this,e,t,r,i);case"bufferView":return new m(this,e,t,r,i);case"camera":return new d(this,e,t,r,i);case"externalAsset":return new h(this,e,t,r,i);case"file":return new g(this,e,t,r,i);case"image":return new b(this,e,t,r,i);case"material":return new v(this,e,t,r,i);case"mesh":return new _(this,e,t,r,i);case"node":return new R(this,e,t,r,i);case"sampler":return new T(this,e,t,r,i);case"scene":return new M(this,e,t,r,i);case"skin":return new I(this,e,t,r,i);case"texture":return new C(this,e,t,r,i)}}getOrCreate(e,t){let r=this.objectCache.get(e);if(r)return r;let i=t();return this.objectCache.set(e,i),i}}function y(e,t){return function*(){for(let r=0;r<e.length;r++)yield t(e[r],r)}()}function N(e){return function*(){for(let t of e)yield t.data}()}function E(e){return new Map(Array.from(e,([e,t])=>[e,t.data]))}function U(e,t){if(e)for(let r=e.length-1;r>=0;r--)e[r]===t&&e.splice(r,1)}},56557(e,t,r){r.d(t,{R:()=>m});var i=r(24252),a=r(89153),n=r(69385),o=r(20943);let s={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},l={5120:1,5121:1,5122:2,5123:2,5124:4,5125:4,5126:4,5130:8,5131:2,5134:8,5135:8},c={magFilter:10240,minFilter:10241,wrapS:10242,wrapT:10243},u={10240:9729,10241:9986,10242:10497,10243:10497};class f{iterator;baseUri="";jsonUnprocessed;json;buffers=[];images=[];postProcess(e,t={}){let{json:r,buffers:a=[],images:n=[]}=e,{baseUri:s=""}=e;(0,i.v)(r),this.baseUri=s;let l=Math.max(r.buffers?.length||0,a.length);return this.buffers=Array.from({length:l},(e,t)=>({...r.buffers?.[t]||{},...a[t]||{}})),this.images=n,this.iterator=new o.I(e),this.jsonUnprocessed=r,this.json=this._resolveTree(e.json,t),this.json.buffers=this.buffers,this.json}_resolveTree(e,t={}){let r={...e};return this.json=r,e.bufferViews&&(r.bufferViews=Array.from(this.iterator.bufferViews,e=>this._resolveBufferView(e,this.iterator.getMetadata(e).index))),e.images&&(r.images=Array.from(this.iterator.images,e=>this._resolveImage(e,this.iterator.getMetadata(e).index))),r.asset=this._resolveAsset(e.asset),e.samplers&&(r.samplers=Array.from(this.iterator.samplers,e=>this._resolveSampler(e,this.iterator.getMetadata(e).index))),e.textures&&(r.textures=Array.from(this.iterator.textures,e=>this._resolveTexture(e,this.iterator.getMetadata(e).index))),e.accessors&&(r.accessors=Array.from(this.iterator.accessors,e=>this._resolveAccessor(e,this.iterator.getMetadata(e).index))),e.materials&&(r.materials=Array.from(this.iterator.materials,e=>this._resolveMaterial(e,this.iterator.getMetadata(e).index))),e.meshes&&(r.meshes=Array.from(this.iterator.meshes,e=>this._resolveMesh(e,this.iterator.getMetadata(e).index))),e.nodes&&(r.nodes=Array.from(this.iterator.nodes,e=>this._resolveNode(e,this.iterator.getMetadata(e).index)),r.nodes=r.nodes.map((e,t)=>this._resolveNodeChildren(e))),e.skins&&(r.skins=Array.from(this.iterator.skins,e=>this._resolveSkin(e,this.iterator.getMetadata(e).index))),e.scenes&&(r.scenes=Array.from(this.iterator.scenes,e=>this._resolveScene(e,this.iterator.getMetadata(e).index))),"number"==typeof this.json.scene&&r.scenes&&(r.scene=r.scenes[this.json.scene]),r}getScene(e){return this._get(this.json.scenes,e)}getNode(e){return this._get(this.json.nodes,e)}getSkin(e){return this._get(this.json.skins,e)}getMesh(e){return this._get(this.json.meshes,e)}getMaterial(e){return this._get(this.json.materials,e)}getAccessor(e){let t=this._get(this.json.accessors,e);if("object"==typeof e){let e=s[t.type],r=l[t.componentType];return{...t,components:e,bytesPerComponent:r,bytesPerElement:e*r}}return t}getCamera(e){return this._get(this.json.cameras,e)}getTexture(e){return this._get(this.json.textures,e)}getSampler(e){return this._get(this.json.samplers,e)}getImage(e){return this._get(this.json.images,e)}getBufferView(e){return this._get(this.json.bufferViews,e)}getBuffer(e){return this._get(this.json.buffers,e)}_get(e,t){if("object"==typeof t)return t;let r=e&&e[t];return r||console.warn(`glTF file error: Could not find ${e}[${t}]`),r}_resolveAsset(e){return{...e,thumbnail:void 0!==e.thumbnail?this.getImage(e.thumbnail):void 0}}_resolveScene(e,t){return{...e,id:e.id||`scene-${t}`,nodes:(e.nodes||[]).map(e=>this.getNode(e))}}_resolveNode(e,t){let r={...e,id:e?.id||`node-${t}`};return void 0!==e.mesh&&(r.mesh=this.getMesh(e.mesh)),void 0!==e.camera&&(r.camera=this.getCamera(e.camera)),void 0!==e.skin&&(r.skin=this.getSkin(e.skin)),void 0!==e.meshes&&e.meshes.length&&(r.mesh=e.meshes.reduce((e,t)=>{let r=this.getMesh(t);return e.id=r.id,e.primitives=e.primitives.concat(r.primitives),e},{primitives:[]})),r}_resolveNodeChildren(e){return e.children&&(e.children=e.children.map(e=>this.getNode(e))),e}_resolveSkin(e,t){let r="number"==typeof e.inverseBindMatrices?this.getAccessor(e.inverseBindMatrices):void 0;return{...e,id:e.id||`skin-${t}`,inverseBindMatrices:r}}_resolveMesh(e,t){let r={...e,id:e.id||`mesh-${t}`,primitives:[]};return e.primitives&&(r.primitives=e.primitives.map((e,t)=>{let a={...e,attributes:{},indices:void 0,material:void 0},n=e.attributes;for(let e in n)a.attributes[e]=this.getAccessor(n[e]);return void 0!==e.indices&&(a.indices=this.getAccessor(e.indices)),void 0!==e.material&&(a.material=this.getMaterial(e.material)),function(e,t,r){let a;if(2!==e.mode&&6!==e.mode)return e;let n=e.indices?.value,o=e.indices?.count??(a=Object.values(e.attributes)[0],(0,i.v)(a,"glTF primitive must define at least one attribute"),a.count),s=function(e,t){if(!e)return Math.max(0,t-1);let r=0;for(let i=0;i<t;i++)r=Math.max(r,Number(e[i]));return r}(n,o),l=s<=65535?Uint16Array:Uint32Array,c=2===e.mode?function(e,t,r){if(t<2)return new r(0);let i=new r(2*t);for(let r=0;r<t;r++)i[2*r]=p(e,r),i[2*r+1]=p(e,(r+1)%t);return i}(n,o,l):function(e,t,r){let i=Math.max(0,t-2),a=new r(3*i);for(let t=0;t<i;t++)a[3*t]=p(e,0),a[3*t+1]=p(e,t+1),a[3*t+2]=p(e,t+2);return a}(n,o,l);return e.mode=2===e.mode?1:4,e.indices={id:`${t}-primitive-${r}-portable-indices`,components:1,bytesPerComponent:l.BYTES_PER_ELEMENT,bytesPerElement:l.BYTES_PER_ELEMENT,componentType:l===Uint16Array?5123:5125,normalized:!1,count:c.length,type:"SCALAR",min:c.length?[function(e){let t=1/0;for(let r of e)t=Math.min(t,r);return t}(c)]:void 0,max:c.length?[s]:void 0,value:c},e}(a,r.id,t)})),r}_resolveMaterial(e,t){let r={...e,id:e.id||`material-${t}`};if(r.normalTexture&&(r.normalTexture={...r.normalTexture},r.normalTexture.texture=this.getTexture(r.normalTexture.index)),r.occlusionTexture&&(r.occlusionTexture={...r.occlusionTexture},r.occlusionTexture.texture=this.getTexture(r.occlusionTexture.index)),r.emissiveTexture&&(r.emissiveTexture={...r.emissiveTexture},r.emissiveTexture.texture=this.getTexture(r.emissiveTexture.index)),r.emissiveFactor||(r.emissiveFactor=r.emissiveTexture?[1,1,1]:[0,0,0]),r.pbrMetallicRoughness){r.pbrMetallicRoughness={...r.pbrMetallicRoughness};let e=r.pbrMetallicRoughness;e.baseColorTexture&&(e.baseColorTexture={...e.baseColorTexture},e.baseColorTexture.texture=this.getTexture(e.baseColorTexture.index)),e.metallicRoughnessTexture&&(e.metallicRoughnessTexture={...e.metallicRoughnessTexture},e.metallicRoughnessTexture.texture=this.getTexture(e.metallicRoughnessTexture.index))}return r}_resolveAccessor(e,t){let r=l[e.componentType],i=s[e.type],o={...e,id:e.id||`accessor-${t}`,bytesPerComponent:r,components:i,bytesPerElement:r*i,value:void 0,bufferView:void 0,sparse:void 0};if(void 0!==e.bufferView&&(o.bufferView=this.getBufferView(e.bufferView)),o.bufferView){let e=o.bufferView.buffer,{ArrayType:t,byteLength:r}=(0,a.aF)(o,o.bufferView),i=(o.bufferView.byteOffset||0)+(o.byteOffset||0)+e.byteOffset,s=(0,n.aK)(e.arrayBuffer,i,r);o.bufferView.byteStride&&(s=this._getValueFromInterleavedBuffer(e,i,o.bufferView.byteStride,o.bytesPerElement,o.count)),o.value=new t(s)}else{let{ArrayType:e}=(0,a.aF)(o,{byteLength:o.count*o.bytesPerElement});o.value=new e(o.count*o.components)}return e.sparse&&this._applySparseAccessor(o,e.sparse),o}_applySparseAccessor(e,t){let r=function(e){switch(e){case 5121:return Uint8Array;case 5123:return Uint16Array;case 5125:return Uint32Array;default:throw Error(`Invalid glTF sparse index component type ${e}`)}}(t.indices.componentType),a=this._getTypedArrayFromBufferView(r,this.getBufferView(t.indices.bufferView),t.indices.byteOffset||0,t.count),n=e.value.constructor,o=this._getTypedArrayFromBufferView(n,this.getBufferView(t.values.bufferView),t.values.byteOffset||0,t.count*e.components);for(let r=0;r<t.count;r++){let t=Number(a[r]);(0,i.v)(Number.isInteger(t)&&t>=0&&t<e.count,"glTF sparse accessor index is out of bounds");for(let i=0;i<e.components;i++){let a=t*e.components+i,n=r*e.components+i;Reflect.set(e.value,a,o[n])}}}_getTypedArrayFromBufferView(e,t,r,a){let o=a*e.BYTES_PER_ELEMENT;(0,i.v)(r+o<=t.byteLength,"glTF sparse accessor data exceeds its buffer view");let s=t.buffer,l=s.byteOffset+(t.byteOffset||0)+r;return new e((0,n.aK)(s.arrayBuffer,l,o))}_getValueFromInterleavedBuffer(e,t,r,i,a){let n=new Uint8Array(a*i);for(let o=0;o<a;o++){let a=t+o*r;n.set(new Uint8Array(e.arrayBuffer.slice(a,a+i)),o*i)}return n.buffer}_resolveTexture(e,t){return{...e,id:e.id||`texture-${t}`,sampler:"number"==typeof e.sampler?this.getSampler(e.sampler):{id:"default-sampler",parameters:u},source:"number"==typeof e.source?this.getImage(e.source):void 0}}_resolveSampler(e,t){let r={id:e.id||`sampler-${t}`,...e,parameters:{}};for(let e in r){let t=this._enumSamplerParameter(e);void 0!==t&&(r.parameters[t]=r[e])}return r}_enumSamplerParameter(e){return c[e]}_resolveImage(e,t){let r={...e,id:e.id||`image-${t}`,image:null,bufferView:void 0!==e.bufferView?this.getBufferView(e.bufferView):void 0},i=this.images[t];return i&&(r.image=i),r}_resolveBufferView(e,t){let r=e.buffer,i=this.buffers[r].arrayBuffer,a=this.buffers[r].byteOffset||0;return e.byteOffset&&(a+=e.byteOffset),{id:`bufferView-${t}`,...e,buffer:this.buffers[r],data:new Uint8Array(i,a,e.byteLength)}}_resolveCamera(e,t){let r={...e,id:e.id||`camera-${t}`};return r.perspective,r.orthographic,r}}function p(e,t){return e?Number(e[t]):t}function m(e,t){return new f().postProcess(e,t)}},3259(e,t,r){r.d(t,{a1:()=>o,eX:()=>l,er:()=>s});var i=r(24252),a=r(99793),n=r(89153);function o(e,t,r){let a=e.bufferViews[r];(0,i.v)(a);let n=t[a.buffer];(0,i.v)(n);let o=(a.byteOffset||0)+n.byteOffset;return new Uint8Array(n.arrayBuffer,o,a.byteLength)}function s(e,t,r){let i=e.images[r];return o(e,t,i.bufferView)}function l(e,t,r){let o="number"==typeof r?e.accessors?.[r]:r;if(!o)throw Error(`No gltf accessor ${JSON.stringify(r)}`);let s=e.bufferViews?.[o.bufferView||0];if(!s)throw Error(`No gltf buffer view for accessor ${s}`);let{arrayBuffer:l,byteOffset:c}=t[s.buffer],u=(c||0)+(o.byteOffset||0)+(s.byteOffset||0),{ArrayType:f,length:p,componentByteSize:m,numberOfComponentsInElement:d}=(0,n.aF)(o,s),h=m*d,g=o.type.startsWith("MAT")?Number(o.type.slice(3)):1,b=(0,a.WR)(g*m,4);if(g>1&&b!==g*m){let e=s.byteStride??g*b;(0,i.v)((o.byteOffset||0)+(o.count-1)*e+((g-1)*b+g*m)<=s.byteLength);let t=new f(p),r=new Uint8Array(t.buffer,t.byteOffset,t.byteLength);for(let t=0;t<o.count;t++)for(let i=0;i<g;i++){let a=new Uint8Array(l,u+t*e+i*b,g*m);r.set(a,t*h+i*g*m)}return t}let v=s.byteStride||h;if(void 0===s.byteStride||s.byteStride===h){if(u%m!=0){let e=new Uint8Array(l,u,p*m),t=new Uint8Array(e.byteLength);return t.set(e),new f(t.buffer,0,p)}return new f(l,u,p)}let S=new f(p);for(let e=0;e<o.count;e++){let t,r=u+e*v;if(r%m!=0){let e=new Uint8Array(l,r,h),i=new Uint8Array(h);i.set(e),t=new f(i.buffer,0,d)}else t=new f(l,r,d);S.set(t,e*d)}return S}},87021(e,t,r){r.d(t,{$j:()=>i,E9:()=>a});let i={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},a={5120:1,5121:1,5122:2,5123:2,5124:4,5125:4,5126:4,5130:8,5131:2,5134:8,5135:8}},89153(e,t,r){r.d(t,{S3:()=>m,aF:()=>p,rA:()=>f,v7:()=>u});var i=r(24252),a=r(87021);let n=["SCALAR","VEC2","VEC3","VEC4"],o=new Map([[Int8Array,5120],[Uint8Array,5121],[Int16Array,5122],[Uint16Array,5123],[Int32Array,5124],[Uint32Array,5125],[Float32Array,5126],[Float64Array,5130],[BigInt64Array,5134],[BigUint64Array,5135]]),s={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},l={5120:1,5121:1,5122:2,5123:2,5124:4,5125:4,5126:4,5130:8,5131:2,5134:8,5135:8},c={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5124:Int32Array,5125:Uint32Array,5126:Float32Array,5130:Float64Array,5131:Uint16Array,5134:BigInt64Array,5135:BigUint64Array};function u(e){return n[e-1]||n[0]}function f(e){let t=o.get(e.constructor);if(!t)throw Error("Illegal typed array");return t}function p(e,t){let r=c[e.componentType],n=s[e.type],o=l[e.componentType],u=e.count*n,f=e.count*n*o;return(0,i.v)(f>=0&&f<=t.byteLength),{ArrayType:r,length:u,byteLength:f,componentByteSize:a.E9[e.componentType],numberOfComponentsInElement:a.$j[e.type]}}function m(e){let{images:t,bufferViews:r}=e;r=r||[];let i=(t=t||[]).map(e=>e.bufferView);return(r=r.filter(e=>!i.includes(e))).reduce((e,t)=>e+t.byteLength,0)+Math.ceil(4*t.reduce((e,t)=>{let{width:r,height:i}=t.image;return e+r*i},0)*1.33)}},24252(e,t,r){r.d(t,{v:()=>i});function i(e,t){if(!e)throw Error(t||"assert failed: gltf")}},65184(e,t,r){r.d(t,{x:()=>i});let i="5.0.0-alpha.11"},92207(e,t,r){r.d(t,{o:()=>l});var i=r(56204),a=r(23179),n=r(13559),o=r(354),s=r(29995);class l extends o.V{children;constructor(e={}){let{children:t=[]}=e=Array.isArray(e)?{children:e}:e;n.R.assert(t.every(e=>e instanceof o.V),"every child must an instance of ScenegraphNode"),super(e),this.children=t}getBounds(){let e=(0,s.hw)();return this.traverse((t,{worldMatrix:r})=>{let a=t.getBounds();if(!a)return;let n=new i.k(r).multiplyRight(t.matrix);(0,s.eI)(e,a,n)}),(0,s.$f)(e)?e:null}destroy(){this.children.forEach(e=>e.destroy()),this.removeAll(),super.destroy()}add(...e){for(let t of e)Array.isArray(t)?this.add(...t):this.children.push(t);return this}remove(e){let t=this.children,r=t.indexOf(e);return r>-1&&t.splice(r,1),this}removeAll(){return this.children=[],this}traverse(e,{worldMatrix:t=new i.k}={}){if(!this.display)return;let r=new i.k(t).multiplyRight(this.matrix);for(let t of this.children)t.display&&(t instanceof l?t.traverse(e,{worldMatrix:r}):e(t,{worldMatrix:r}))}traverseDepthSorted(e,{viewMatrix:t,worldMatrix:r=new i.k,order:n="back-to-front"}){let o=new i.k(t),s=[];this.traverse((e,t)=>{let r=e.getBounds(),n=r?new a.P(r[0]).add(r[1]).divide([2,2,2]):new a.P,l=new i.k(t.worldMatrix).multiplyRight(e.matrix);l.transformAsPoint(n,n),o.transformAsPoint(n,n),s.push({node:e,context:{worldMatrix:l,bounds:r,depth:-n[2]},index:s.length})},{worldMatrix:new i.k(r)});let l="back-to-front"===n?-1:1;for(let{node:t,context:r}of(s.sort((e,t)=>l*(e.context.depth-t.context.depth)||e.index-t.index),s))e(t,r)}preorderTraversal(e,{worldMatrix:t=new i.k}={}){let r=new i.k(t).multiplyRight(this.matrix);for(let t of(e(this,{worldMatrix:r}),this.children))t instanceof l?t.preorderTraversal(e,{worldMatrix:r}):e(t,{worldMatrix:r})}}},84793(e,t,r){r.d(t,{s:()=>n});var i=r(354),a=r(29995);class n extends i.V{model;instanceMatrices;bounds=null;managedResources;constructor(e){super(e),this.model=e.model,this.managedResources=e.managedResources||[],this.instanceMatrices=e.instanceMatrices||null,this.bounds=e.bounds?this.instanceMatrices?function(e,t){let r=(0,a.hw)();for(let i of t)(0,a.eI)(r,e,i);return(0,a.$f)(r)?r:null}(e.bounds,this.instanceMatrices):e.bounds:null,this.setProps(e)}destroy(){this.model&&(this.model.destroy(),this.model=null),this.managedResources.forEach(e=>e.destroy()),this.managedResources=[]}getBounds(){return this.bounds}draw(e){return this.model.draw(e)}}},29995(e,t,r){r.d(t,{$f:()=>s,eI:()=>o,hw:()=>n});var i=r(56204),a=r(23179);function n(){return[[1/0,1/0,1/0],[-1/0,-1/0,-1/0]]}function o(e,t,r){let n=new i.k(r);for(let r=0;r<8;r++){let i=new a.P(t[1&r?1:0][0],t[2&r?1:0][1],t[4&r?1:0][2]);n.transformAsPoint(i,i);for(let t=0;t<3;t++)e[0][t]=Math.min(e[0][t],i[t]),e[1][t]=Math.max(e[1][t],i[t])}}function s(e){return Number.isFinite(e[0][0])}},354(e,t,r){r.d(t,{V:()=>s});var i=r(56204),a=r(23179),n=r(51208);function o(e,t){if(!e)throw Error(t)}class s{id;matrix=new i.k;display=!0;position=new a.P;rotation=new a.P;scale=new a.P(1,1,1);userData={};props={};constructor(e={}){let{id:t}=e;this.id=t||(0,n.L)(this.constructor.name),this._setScenegraphNodeProps(e)}getBounds(){return null}destroy(){}delete(){this.destroy()}setProps(e){return this._setScenegraphNodeProps(e),this}toString(){return`{type: ScenegraphNode, id: ${this.id})}`}setPosition(e){return o(3===e.length,"setPosition requires vector argument"),this.position=e,this}setRotation(e){return o(3===e.length||4===e.length,"setRotation requires vector argument"),this.rotation=e,this}setScale(e){return o(3===e.length,"setScale requires vector argument"),this.scale=e,this}setMatrix(e,t=!0){t?this.matrix.copy(e):this.matrix=e}setMatrixComponents(e){let{position:t,rotation:r,scale:i,update:a=!0}=e;return t&&this.setPosition(t),r&&this.setRotation(r),i&&this.setScale(i),a&&this.updateMatrix(),this}updateMatrix(){if(this.matrix.identity(),this.matrix.translate(this.position),4===this.rotation.length){let e=new i.k().fromQuaternion(this.rotation);this.matrix.multiplyRight(e)}else this.matrix.rotateXYZ(this.rotation);return this.matrix.scale(this.scale),this}update({position:e,rotation:t,scale:r}={}){return e&&this.setPosition(e),t&&this.setRotation(t),r&&this.setScale(r),this.updateMatrix(),this}getCoordinateUniforms(e,t){t=t||this.matrix;let r=new i.k(e).multiplyRight(t),a=r.invert(),n=a.transpose();return{viewMatrix:e,modelMatrix:t,objectMatrix:t,worldMatrix:r,worldInverseMatrix:a,worldInverseTransposeMatrix:n}}_setScenegraphNodeProps(e){void 0!==e.display&&(this.display=e.display),e?.position&&this.setPosition(e.position),e?.rotation&&this.setRotation(e.rotation),e?.scale&&this.setScale(e.scale),this.updateMatrix(),e?.matrix&&this.setMatrix(e.matrix),Object.assign(this.props,e)}}},70743(e,t,r){r.d(t,{v:()=>ew});var i=r(84793),a=r(20131),n=r(13125),o=r(31130),s=r(60691),l=r(38550),c=r(42188),u=r(82645),f=r(34037),p=r(92790),m=r(51208);class d{id;device;factory;shaderInputs;bindings={};_uniformStore;_bindGroupCacheToken={};_dynamicResourceGenerations={};constructor(e,t={}){this.id=t.id||(0,m.L)("material"),this.device=e,this.factory=t.factory||new g(e,{modules:t.modules||t.shaderInputs?.getModules()||[]});let r=Object.fromEntries((t.shaderInputs?.getModules()||this.factory.modules).map(e=>[e.name,e]));for(let[e,i]of(this.shaderInputs=t.shaderInputs||new a.l(r),this._uniformStore=new n.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if(this.ownsModule(e)&&(0,p.fX)(i)){let t=this._uniformStore.getManagedUniformBuffer(e);this.bindings[`${e}Uniforms`]=t}this.updateShaderInputs(),t.bindings&&this._replaceOwnedBindings(t.bindings)}destroy(){this._uniformStore.destroy()}clone(e={}){let t=this.factory.createMaterial({id:e.id,shaderInputs:e.shaderInputs,bindings:{...this.getResourceBindings(),...e.bindings}});return e.shaderInputs||t.setProps(this.shaderInputs.getUniformValues()),e.moduleProps&&t.setProps(e.moduleProps),t.updateShaderInputs(),t}ownsBinding(e){return this.factory.ownsBinding(e)}ownsModule(e){return this.factory.ownsModule(e)}setProps(e){this.shaderInputs.setProps(e)}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this._setOwnedBindings(this.shaderInputs.getBindingValues())&&(this._bindGroupCacheToken={})}getResourceBindings(){let e={};for(let[t,r]of Object.entries(this.bindings))b(t)||(e[t]=r);return e}getBindings(e={bindings:[]}){this._syncDynamicResourceGenerations();let t={};for(let[r,i]of Object.entries(this.bindings))if((0,f.YT)(i)){let a=(0,f.l0)(e,r,{fallbackGroup:h}),n=a?i.resolveTextureBinding(a):null;n&&(t[r]=n)}else i instanceof u.kL?t[r]=i.buffer:(0,u.Hd)(i)?t[r]=(0,u.j8)(i):t[r]=i;return this._syncDynamicResourceGenerations(),t}getBindingsByGroup(e={bindings:[]}){return this.factory.getBindingsByGroup(this.getBindings(e))}getBindGroupCacheKey(e){return this._syncDynamicResourceGenerations(),e===h?this._bindGroupCacheToken:null}getBindingsUpdateTimestamp(){let e=0;for(let t of Object.values(this.bindings))t instanceof o.X?e=Math.max(e,t.texture.updateTimestamp):t instanceof s.h||t instanceof l.g||t instanceof c.r||t instanceof u.kL?e=Math.max(e,t.updateTimestamp):(0,f.YT)(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:(0,u.Hd)(t)&&(e=Math.max(e,(t.buffer instanceof u.kL,t.buffer.updateTimestamp)));return e}_replaceOwnedBindings(e){this._setOwnedBindings(e)&&(this._bindGroupCacheToken={})}_setOwnedBindings(e){let t=!1;for(let[r,i]of Object.entries(e))void 0!==i&&this.ownsBinding(r)&&this.bindings[r]!==i&&(this.bindings[r]=i,t=!0);return t}_syncDynamicResourceGenerations(){let e={},t=!1;for(let[i,a]of Object.entries(this.bindings)){var r;let n=(r=a,(0,f.YT)(r)?r.generation:(0,u.Xk)(r)?.generation??null);null!==n&&(e[i]=n,this._dynamicResourceGenerations[i]!==n&&(t=!0))}Object.keys(e).length!==Object.keys(this._dynamicResourceGenerations).length&&(t=!0),this._dynamicResourceGenerations=e,t&&(this._bindGroupCacheToken={})}}let h=3;class g{device;modules;_materialBindingNames;_materialModuleNames;constructor(e,t={}){this.device=e,this.modules=t.modules||[];let r=new a.l(Object.fromEntries(this.modules.map(e=>[e.name,e])));this._materialBindingNames=function(e){let t=new Set;for(let r of Object.values(e.modules))for(let e of r.bindingLayout||[])e.group===h&&t.add(e.name);return t}(r),this._materialModuleNames=function(e){let t=new Set;for(let r of Object.values(e.modules))r.name&&r.bindingLayout?.some(e=>e.group===h&&e.name===r.name)&&t.add(r.name);return t}(r)}createMaterial(e={}){return new d(this.device,{...e,factory:this})}getBindingNames(){return Array.from(this._materialBindingNames)}ownsBinding(e){if(this._materialBindingNames.has(e))return!0;let t=b(e);return!!t&&this._materialModuleNames.has(t)}ownsModule(e){return this._materialModuleNames.has(e)}getBindingsByGroup(e){return Object.keys(e).length>0?{[h]:e}:{}}}function b(e){return e.endsWith("Uniforms")?e.slice(0,-8):null}var v=r(92207),S=r(62837),_=r(69457);function x(e){let t=e.value;if(t instanceof Float32Array)return t;let r=new Float32Array(t.length),i=R(t),a=t instanceof Int8Array||t instanceof Int16Array||t instanceof Int32Array;for(let n=0;n<t.length;n++){let o=Number(t[n]);r[n]=e.normalized&&i?a?Math.max(o/i,-1):o/i:o}return r}function R(e){return e instanceof Int8Array?127:e instanceof Uint8Array||e instanceof Uint8ClampedArray?255:e instanceof Int16Array?32767:e instanceof Uint16Array?65535:e instanceof Int32Array?0x7fffffff:0xffffffff*(e instanceof Uint32Array)}var T=r(9696),M=r(56204);let I={props:{},uniforms:{},bindings:{},name:"skin",bindingLayout:[{name:"skin",group:0},{name:"skinJointMatrices",group:0,visibility:1}],dependencies:[],source:`
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
#else
#ifdef HAS_LARGE_SKIN
@group(0) @binding(auto) var<storage, read> skinJointMatrices: array<mat4x4<f32>>;
#endif
#endif

fn getSkinMatrix(weights: vec4f, joints: vec4u) -> mat4x4<f32> {
#ifdef HAS_LARGE_SKIN
  return (weights.x * skinJointMatrices[joints.x])
       + (weights.y * skinJointMatrices[joints.y])
       + (weights.z * skinJointMatrices[joints.z])
       + (weights.w * skinJointMatrices[joints.w]);
#else
  return (weights.x * skin.jointMatrix[joints.x])
       + (weights.y * skin.jointMatrix[joints.y])
       + (weights.z * skin.jointMatrix[joints.z])
       + (weights.w * skin.jointMatrix[joints.w]);
#endif
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
#else
#ifdef HAS_LARGE_SKIN
uniform highp sampler2D skinJointMatrices;

mat4 getSkinJointMatrix(uint jointIndex) {
  int firstColumn = int(jointIndex * 4u);
  return mat4(
    texelFetch(skinJointMatrices, ivec2(firstColumn, 0), 0),
    texelFetch(skinJointMatrices, ivec2(firstColumn + 1, 0), 0),
    texelFetch(skinJointMatrices, ivec2(firstColumn + 2, 0), 0),
    texelFetch(skinJointMatrices, ivec2(firstColumn + 3, 0), 0)
  );
}
#endif
#endif

mat4 getSkinMatrix(vec4 weights, uvec4 joints) {
#ifdef HAS_LARGE_SKIN
  return (weights.x * getSkinJointMatrix(joints.x))
       + (weights.y * getSkinJointMatrix(joints.y))
       + (weights.z * getSkinJointMatrix(joints.z))
       + (weights.w * getSkinJointMatrix(joints.w));
#else
  return (weights.x * skin.jointMatrix[joints.x])
       + (weights.y * skin.jointMatrix[joints.y])
       + (weights.z * skin.jointMatrix[joints.z])
       + (weights.w * skin.jointMatrix[joints.w]);
#endif
}

`,fs:"",defines:{SKIN_MAX_JOINTS:64},getUniforms:(e={},t)=>{let{jointMatrices:r,skinJointMatrices:i,scenegraphsFromGLTF:a,skinIndex:n=0,meshWorldMatrix:o}=e,s=i?{skinJointMatrices:i}:{};if(r){var l;let e;return{jointMatrix:(l=r,(e=new Float32Array(1024)).set(l instanceof Float32Array?l.subarray(0,e.length):l.slice(0,e.length)),e),...s}}let c=a?.gltf?.skins?.[n];if(!c)return{jointMatrix:[],...s};let{inverseBindMatrices:u,joints:f,skeleton:p}=c,m=a.gltfNodeIndexToNodeMap,d=new Map,h=void 0===p?void 0:m?.get(p);for(let e of h?[h]:a.scenes||[])e.preorderTraversal((e,{worldMatrix:t})=>{d.set(e.id,t)});let g=o?new M.k(o).invert():null,b=new Float32Array(1024),v=u?.value;for(let e=0;e<Math.min(f.length,64);e++){let t=m?.get(f[e]);if(!t)continue;let r=d.get(t.id)||t.matrix,i=g?new M.k(g).multiplyRight(r):new M.k(r);v&&v.length>=(e+1)*16&&i.multiplyRight(new M.k(Array.from(v.slice(16*e,(e+1)*16)))),b.set(i,16*e)}return{jointMatrix:b,...s}},uniformTypes:{jointMatrix:["mat4x4<f32>",64]}};var C=r(13559),A=r(78777),y=r(12434),N=r(4533);let E={"+X":0,"-X":1,"+Y":2,"-Y":3,"+Z":4,"-Z":5};function U(e){return e?Array.isArray(e)?e[0]??null:e:null}function w(e){if((0,N.x)(e))return(0,N.c)(e);if("object"==typeof e&&"width"in e&&"height"in e)return{width:e.width,height:e.height};throw Error("Unsupported mip-level data")}function P(e){let{textureFormat:t,format:r}=e;if(t&&r&&t!==r)throw Error(`Conflicting texture formats "${t}" and "${r}" provided for the same mip level`);return t??r}function L(e){let t=E[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}function V(e){throw Error("setTexture1DData not supported in WebGL.")}function O(e,t,r,i){let a=Array.isArray(t)?t:[t],n=[];for(let t=0;t<a.length;t++){let o=a[t];if((0,N.x)(o))n.push({type:"external-image",image:o,z:e,mipLevel:t});else if("object"==typeof o&&null!==o&&"data"in o&&"width"in o&&"height"in o)n.push({type:"texture-data",data:o,textureFormat:P(o),z:e,mipLevel:t});else if(ArrayBuffer.isView(o)&&r)n.push({type:"texture-data",data:{data:o,width:Math.max(1,r.width>>t),height:Math.max(1,r.height>>t),...i?{format:i}:{}},textureFormat:i,z:e,mipLevel:t});else throw Error("Unsupported 2D mip-level payload")}return n}function F(e){let t=[];for(let r=0;r<e.length;r++)t.push(...O(r,e[r]));return t}function H(e){let t=[];for(let r=0;r<e.length;r++)t.push(...O(r,e[r]));return t}function D(e){let t=[];for(let[r,i]of Object.entries(e)){let e=L(r);t.push(...O(e,i))}return t}function k(e){let t=[];return e.forEach((e,r)=>{for(let[i,a]of Object.entries(e)){let e=6*r+L(i);t.push(...O(e,a))}}),t}class B{device;id;props;_texture=null;_sampler=null;_view=null;ready;isReady=!1;destroyed=!1;generation=0;updateTimestamp;resolveReady=()=>{};rejectReady=()=>{};get texture(){if(!this._texture)throw Error("Texture not initialized yet");return this._texture}get sampler(){if(!this._sampler)throw Error("Sampler not initialized yet");return this._sampler}get view(){if(!this._view)throw Error("View not initialized yet");return this._view}get[Symbol.toStringTag](){return"DynamicTexture"}toString(){let e=this._texture?.width??this.props.width??"?",t=this._texture?.height??this.props.height??"?";return`DynamicTexture:"${this.id}":${e}x${t}px:(${this.isReady?"ready":"loading..."})`}resolveTextureBinding(e){return this.isReady?this.texture:null}constructor(e,t){this.device=e;let r=(0,m.L)("dynamic-texture");this.props={...B.defaultProps,id:r,...t,data:null},this.id=this.props.id,this.ready=new Promise((e,t)=>{this.resolveReady=e,this.rejectReady=t}),this.updateTimestamp=this.device.incrementTimestamp(),this.initAsync(t)}async initAsync(e){try{let t=await this._loadAllData(e);this._checkNotDestroyed();let r=t.data?function(e){if(!e.data)return[];let t=e.width&&e.height?{width:e.width,height:e.height}:void 0,r="format"in e?e.format:void 0;switch(e.dimension){case"1d":return V(e.data);case"2d":return O(0,e.data,t,r);case"3d":return F(e.data);case"2d-array":return H(e.data);case"cube":return D(e.data);case"cube-array":return k(e.data);default:throw Error(`Unhandled dimension ${e.dimension}`)}}({...t,width:e.width,height:e.height,format:e.format}):[],i="format"in e&&void 0!==e.format,a="usage"in e&&void 0!==e.usage,n=(()=>{if(this.props.width&&this.props.height)return{width:this.props.width,height:this.props.height};let e=function(e){let{dimension:t,data:r}=e;if(!r)return null;switch(t){case"1d":{let e=U(r);if(!e)return null;let{width:t}=w(e);return{width:t,height:1}}case"2d":{if(ArrayBuffer.isView(r))return null;let e=U(r);return e?w(e):null}case"3d":case"2d-array":{if(!Array.isArray(r)||0===r.length)return null;let e=U(r[0]);return e?w(e):null}case"cube":{let e=Object.keys(r)[0]??null;if(!e)return null;let t=U(r[e]);return t?w(t):null}case"cube-array":{if(!Array.isArray(r)||0===r.length)return null;let e=r[0],t=Object.keys(e)[0]??null;if(!t)return null;let i=U(e[t]);return i?w(i):null}default:return null}}(t);return e||{width:this.props.width||1,height:this.props.height||1}})();if(!n||n.width<=0||n.height<=0)throw Error(`${this} size could not be determined or was zero`);let o=function(e,t,r,i){if(0===t.length)return{subresources:t,mipLevels:1,format:i.format,hasExplicitMipChain:!1};let a=new Map;for(let e of t){let t=a.get(e.z)??[];t.push(e),a.set(e.z,t)}let n=t.some(e=>e.mipLevel>0),o=i.format,s=1/0,l=[];for(let[t,i]of a){let a=[...i].sort((e,t)=>e.mipLevel-t.mipLevel),n=a[0];if(!n||0!==n.mipLevel)throw Error(`DynamicTexture: slice ${t} is missing mip level 0`);let c=j(e,n);if(c.width!==r.width||c.height!==r.height)throw Error(`DynamicTexture: slice ${t} base level dimensions ${c.width}x${c.height} do not match expected ${r.width}x${r.height}`);let u=G(n);if(u){if(o&&o!==u)throw Error(`DynamicTexture: slice ${t} base level format "${u}" does not match texture format "${o}"`);o=u}let f=o&&e.isTextureFormatCompressed(o)?function(e,t,r,i){let{blockWidth:a=1,blockHeight:n=1}=e.getTextureFormatInfo(i),o=1;for(let e=1;;e++){let i=Math.max(1,t>>e),s=Math.max(1,r>>e);if(i<a||s<n)break;o++}return o}(e,c.width,c.height,o):e.getMipLevelCount(c.width,c.height),p=0;for(let t=0;t<a.length;t++){let r=a[t];if(!r||r.mipLevel!==t||t>=f)break;let i=j(e,r),n=Math.max(1,c.width>>t),s=Math.max(1,c.height>>t);if(i.width!==n||i.height!==s)break;let u=G(r);if(u&&(o||(o=u),u!==o))break;p++,l.push(r)}s=Math.min(s,p)}let c=Number.isFinite(s)?Math.max(1,s):1;return{subresources:l.filter(e=>e.mipLevel<c),mipLevels:c,format:o,hasExplicitMipChain:n}}(this.device,r,n,{format:i?e.format:void 0}),s=o.format??this.props.format,c={...this.props,...n,format:s,mipLevels:1,data:void 0};this.device.isTextureFormatCompressed(s)&&!a&&(c.usage=l.g.SAMPLE|l.g.COPY_DST);let u=this.props.mipmaps&&!o.hasExplicitMipChain&&!this.device.isTextureFormatCompressed(s);if("webgpu"===this.device.type&&u){let e="3d"===this.props.dimension?l.g.SAMPLE|l.g.STORAGE|l.g.COPY_DST|l.g.COPY_SRC:l.g.SAMPLE|l.g.RENDER|l.g.COPY_DST|l.g.COPY_SRC;c.usage|=e}let f=this.device.getMipLevelCount(c.width,c.height),p=o.hasExplicitMipChain?o.mipLevels:"auto"===this.props.mipLevels?f:Math.max(1,Math.min(f,this.props.mipLevels??1)),m={...c,mipLevels:p};this._texture=this.device.createTexture(m),this._sampler=this.texture.sampler,this._view=this.texture.view,this._touchGeneration(),o.subresources.length&&this._setTextureSubresources(o.subresources),!this.props.mipmaps||o.hasExplicitMipChain||u||C.R.warn(`${this} skipping auto-generated mipmaps for compressed texture format`)(),u&&this.generateMipmaps(),this.isReady=!0,this.resolveReady(this.texture),C.R.info(1,`${this} created`)()}catch(t){let e=t instanceof Error?t:Error(String(t));this.rejectReady(e)}}destroy(){this._texture&&(this._texture.destroy(),this._texture=null,this._sampler=null,this._view=null),this.isReady=!1,this.destroyed=!0}generateMipmaps(){"webgl"===this.device.type?(this.texture.generateMipmapsWebGL(),this._touch()):"webgpu"===this.device.type?(this.device.generateMipmapsWebGPU(this.texture),this._touch()):C.R.warn(`${this} mipmaps not supported on ${this.device.type}`)}setSampler(e={}){this._checkReady();let t=e instanceof A.L?e:this.device.createSampler(e);this.texture.setSampler(t),this._sampler=t,this._touchGeneration()}async readBuffer(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,i=e.depthOrArrayLayers??this.texture.depth,a=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:i}),n=this.device.createBuffer({byteLength:a.byteLength,usage:s.h.COPY_DST|s.h.MAP_READ});this.texture.readBuffer({...e,width:t,height:r,depthOrArrayLayers:i},n);let o=this.device.createFence();return await o.signaled,o.destroy(),n}async readAsync(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,i=e.depthOrArrayLayers??this.texture.depth,a=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:i}),n=await this.readBuffer(e),o=await n.readAsync(0,a.byteLength);return n.destroy(),o.buffer instanceof ArrayBuffer?o.buffer:o.slice().buffer}resize(e){if(this._checkReady(),e.width===this.texture.width&&e.height===this.texture.height)return!1;let t=this.texture;return this._texture=t.clone(e),this._sampler=this.texture.sampler,this._view=this.texture.view,t.destroy(),this._touchGeneration(),C.R.info(`${this} resized`),!0}getCubeFaceIndex(e){let t=E[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}getCubeArrayFaceIndex(e,t){return 6*e+this.getCubeFaceIndex(t)}setTexture1DData(e){if(this._checkReady(),"1d"!==this.texture.props.dimension)throw Error(`${this} is not 1d`);let t=V(e);this._setTextureSubresources(t)}setTexture2DData(e,t=0){if(this._checkReady(),"2d"!==this.texture.props.dimension)throw Error(`${this} is not 2d`);let r=O(t,e);this._setTextureSubresources(r)}setTexture3DData(e){if("3d"!==this.texture.props.dimension)throw Error(`${this} is not 3d`);let t=F(e);this._setTextureSubresources(t)}setTextureArrayData(e){if("2d-array"!==this.texture.props.dimension)throw Error(`${this} is not 2d-array`);let t=H(e);this._setTextureSubresources(t)}setTextureCubeData(e){if("cube"!==this.texture.props.dimension)throw Error(`${this} is not cube`);let t=D(e);this._setTextureSubresources(t)}setTextureCubeArrayData(e){if("cube-array"!==this.texture.props.dimension)throw Error(`${this} is not cube-array`);let t=k(e);this._setTextureSubresources(t)}_setTextureSubresources(e){for(let t of e){let{z:e,mipLevel:r}=t;switch(t.type){case"external-image":let{image:i,flipY:a}=t;this.texture.copyExternalImage({image:i,z:e,mipLevel:r,flipY:a});break;case"texture-data":let{data:n,textureFormat:o}=t;if(o&&o!==this.texture.format)throw Error(`${this} mip level ${r} uses format "${o}" but texture format is "${this.texture.format}"`);this.texture.writeData(n.data,{x:0,y:0,z:e,width:n.width,height:n.height,depthOrArrayLayers:1,mipLevel:r});break;default:throw Error("Unsupported 2D mip-level payload")}}e.length>0&&this._touch()}async _loadAllData(e){let t=await z(e.data);return{dimension:e.dimension??"2d",data:t??null}}_checkNotDestroyed(){this.destroyed&&C.R.warn(`${this} already destroyed`)}_checkReady(){this.isReady||C.R.warn(`${this} Cannot perform this operation before ready`)}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_touchGeneration(){this.generation++,this._touch()}static defaultProps={...l.g.defaultProps,dimension:"2d",data:null,mipmaps:!1}}function G(e){if("texture-data"===e.type)return e.textureFormat??P(e.data)}function j(e,t){switch(t.type){case"external-image":return e.getExternalImageSize(t.image);case"texture-data":return{width:t.data.width,height:t.data.height};default:throw Error("Unsupported texture subresource")}}async function z(e){if(Array.isArray(e=await e))return await Promise.all(e.map(z));if(e&&"object"==typeof e&&e.constructor===Object){let t=e,r=await Promise.all(Object.values(t).map(z)),i=Object.keys(t),a={};for(let e=0;e<i.length;e++)a[i[e]]=r[e];return a}return e}let K={name:"gpuAnimation",props:{},uniforms:{},bindings:{},source:`
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
`,fs:"",bindingLayout:[{name:"gpuAnimationFrames",group:0,visibility:1},{name:"gpuMorphTargets",group:0,visibility:1},{name:"gpuMorphWeights",group:0,visibility:1}],getUniforms:(e={})=>e},$=`
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
#ifdef HAS_SKIN_1
  @location(7) JOINTS_1: vec4u,
  @location(8) WEIGHTS_1: vec4f,
#endif
#ifdef HAS_GLTF_INSTANCING
  @location(9) instanceModelMatrixCol0: vec4f,
  @location(10) instanceModelMatrixCol1: vec4f,
  @location(11) instanceModelMatrixCol2: vec4f,
  @location(12) instanceModelMatrixCol3: vec4f,
  @builtin(instance_index) instanceIndex: u32,
#else
#ifdef HAS_INSTANCED_MORPH
  @builtin(instance_index) instanceIndex: u32,
#endif
#endif
#ifdef HAS_GPU_CROWD_ANIMATION
  @location(13) instanceAnimationFrames: vec4f,
  @location(14) instanceAnimationBlend: vec4f,
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
  var skinMatrix = getGPUAnimatedSkinMatrix(
    inputs.WEIGHTS_0,
    inputs.JOINTS_0,
    inputs.instanceAnimationFrames,
    inputs.instanceAnimationBlend,
    u32(CROWD_ANIMATION_FRAME_STRIDE)
  );
#else
#ifdef HAS_INSTANCED_SKIN
  var skinMatrix = getInstancedSkinMatrix(
    inputs.WEIGHTS_0,
    inputs.JOINTS_0,
    inputs.instanceIndex,
    u32(CROWD_JOINTS_PER_INSTANCE)
  );
#else
  var skinMatrix = getSkinMatrix(inputs.WEIGHTS_0, inputs.JOINTS_0);
#endif
#endif
#ifdef HAS_SKIN_1
#ifdef HAS_GPU_CROWD_ANIMATION
  skinMatrix += getGPUAnimatedSkinMatrix(
    inputs.WEIGHTS_1,
    inputs.JOINTS_1,
    inputs.instanceAnimationFrames,
    inputs.instanceAnimationBlend,
    u32(CROWD_ANIMATION_FRAME_STRIDE)
  );
#else
#ifdef HAS_INSTANCED_SKIN
  skinMatrix += getInstancedSkinMatrix(
    inputs.WEIGHTS_1,
    inputs.JOINTS_1,
    inputs.instanceIndex,
    u32(CROWD_JOINTS_PER_INSTANCE)
  );
#else
  skinMatrix += getSkinMatrix(inputs.WEIGHTS_1, inputs.JOINTS_1);
#endif
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
`,W=`\
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

  #ifdef HAS_SKIN_1
    in uvec4 JOINTS_1;
    in vec4 WEIGHTS_1;
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
      #ifdef HAS_SKIN_1
        #ifdef HAS_GPU_CROWD_ANIMATION
          skinMat += getGPUAnimatedSkinMatrix(
            WEIGHTS_1,
            JOINTS_1,
            instanceAnimationFrames,
            instanceAnimationBlend
          );
        #else
        #ifdef HAS_INSTANCED_SKIN
          skinMat += getInstancedSkinMatrix(
            WEIGHTS_1,
            JOINTS_1,
            uint(gl_InstanceID),
            uint(CROWD_JOINTS_PER_INSTANCE)
          );
        #else
          skinMat += getSkinMatrix(WEIGHTS_1, JOINTS_1);
        #endif
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
`,q=`\
#version 300 es
  out vec4 fragmentColor;

  void main(void) {
    vec3 pos = pbr_vPosition;
    fragmentColor = pbr_filterColor(vec4(1.0));
  }
`;function J(e,t){let r=t.materialFactory||new g(e,{modules:[T.s]}),i={...t.parsedPPBRMaterial.uniforms};delete i.camera;let a=Object.fromEntries(Object.entries({...i,...t.parsedPPBRMaterial.bindings}).filter(([e,t])=>{var i;return r.ownsBinding(e)&&((i=t)instanceof s.h||i instanceof B||i instanceof A.L||i instanceof l.g||i instanceof o.X)})),n=r.createMaterial({id:t.id,bindings:a});return n.setProps({pbrMaterial:i}),n}function X(e,t,r,i,a){if("webgpu"===e.type)return e.createBuffer({id:t,data:r,usage:s.h.STORAGE|s.h.COPY_DST});let n=e.createTexture({id:t,format:"rgba32float",width:i,height:a,usage:l.g.SAMPLE|l.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}});return n.writeData(r,{width:i,height:a}),n}function Y(e,t,r){if(!e)return[...r];let i=e.value;return r.map((r,a)=>{let n=i[t*e.size+a];return void 0===n?r:e.normalized?e.value instanceof Int8Array?Math.max(n/127,-1):e.value instanceof Int16Array?Math.max(n/32767,-1):e.value instanceof Uint8Array?n/255:e.value instanceof Uint16Array?n/65535:n:n})}function Q(e,t){for(let r of(e.userData.morphWeights=[...t],e.userData.morphMeshes||[]))r.preorderTraversal(e=>{if(!(e instanceof i.s))return;let r=e.userData.morphTargets;if(!r)return;let a=e.userData.gltfMorphWeights;if(a){var n,o;n=a,o=t,n.values.fill(0),n.values.set(o.slice(0,n.values.length)),n.data instanceof s.h?n.data.write(n.values):n.data.writeData(n.values,{width:n.packedTargetCount,height:1}),e.userData.morphWeights=[...t];return}!function(e,t,r,i){let a={};for(let e of["POSITION","NORMAL","TANGENT"]){let r=t.attributes[e];r&&(a[e]=x(r))}let n=function(e,t,r){let i={};for(let a of["POSITION","NORMAL","TANGENT"]){let n=e[a];if(!n)continue;let o=new Float32Array(n),s="TANGENT"===a?4:3,l=Math.floor(n.length/s);for(let e=0;e<Math.min(t.length,r.length);e++){let i=r[e],n=t[e][a];if(!i||!n)continue;let c="TANGENT"===a&&n.length===4*l?4:3;for(let e=0;e<l;e++){let t=e*s,r=e*c;for(let e=0;e<3;e++)o[t+e]+=(n[r+e]||0)*i}}"POSITION"!==a&&function(e,t){for(let r=0;r<e.length;r+=t){let t=Math.hypot(e[r],e[r+1],e[r+2]);t>0&&(e[r]/=t,e[r+1]/=t,e[r+2]/=t)}}(o,s),i[a]=o}return i}(a,r,i),o={};for(let[e,r]of Object.entries(t.attributes))r&&(o[e]=r);for(let e of["POSITION","NORMAL","TANGENT"]){let t=n[e],r=o[e];t&&r&&(o[e]={...r,value:function(e,t){if(e.value instanceof Float32Array)return t;let r=e.value.slice(),i=R(r),a=r instanceof Int8Array||r instanceof Int16Array||r instanceof Int32Array;for(let n=0;n<t.length;n++){let o=t[n];r[n]=e.normalized&&i?Math.round(Math.max(a?-1:0,Math.min(1,o))*i):o}return r}(r,t)})}let s=new S.V2({id:t.id,topology:t.topology||"triangle-list",vertexCount:t.vertexCount,indices:t.indices,attributes:o,bufferLayout:t.bufferLayout}),l=(0,_.C)(s),c=l.attributes.geometry?.value,u=e._gpuGeometry?.attributes.geometry||e.bufferAttributes.geometry;if(c&&u)return u.write(c);for(let t of["POSITION","NORMAL","TANGENT"]){let r=n[t];if(r){let i="POSITION"===t?"positions":"NORMAL"===t?"normals":"TANGENT";e.bufferAttributes[i]?.write(r)}}}(e.model,r.geometry,r.targets,t),e.userData.morphWeights=[...t]})}var Z=r(92397),ee=r(27282);let et={modelOptions:{},pbrDebug:!1,imageBasedLightingEnvironment:void 0,lights:!0,useTangents:!1,useByteColors:!0,strictExtensions:!1};function er(e,t,r,i){let a=(0,ee.lO)(e,t,r,i);for(let e of a.generatedTextures)i.generatedTextures.add(e);return a}function ei(e,t,r,a,n,o){let c=(t.primitives||[]).map((c,u)=>(function({device:e,gltfPrimitive:t,primitiveIndex:r,gltfMesh:a,gltf:n,gltfMaterialIdToMaterialMap:o,options:c,instancing:u}){let f=t.name||`${a.name||a.id}-primitive-${r}`,p=function(e){let t=1/0;for(let r of Object.values(e))if(r){let{value:e,size:i,components:a}=r,n=i??a;e?.length!==void 0&&n>=1&&(t=Math.min(t,e.length/n))}if(!Number.isFinite(t))throw Error("Could not determine vertex count from attributes");return t}(t.attributes),m=function(e,t,r){if(e!==Z.n.LINE_LOOP&&e!==Z.n.TRIANGLE_FAN)return{topology:function(e){switch(e){case Z.n.POINTS:return"point-list";case Z.n.LINES:return"line-list";case Z.n.LINE_STRIP:return"line-strip";case Z.n.TRIANGLES:return"triangle-list";case Z.n.TRIANGLE_STRIP:return"triangle-strip";default:throw Error(String(e))}}(e)};let i=t?.length??r,a=new(t instanceof Uint32Array||!t&&r>65536?Uint32Array:Uint16Array)(e===Z.n.LINE_LOOP?i>=2?2*i:0:i>=3?(i-2)*3:0),n=e=>t?.[e]??e;if(e===Z.n.LINE_LOOP){for(let e=0;e<i;e++)a[2*e]=n(e),a[2*e+1]=n((e+1)%i);return{topology:"line-list",indices:a}}for(let e=0;e<i-2;e++)a[3*e]=n(0),a[3*e+1]=n(e+1),a[3*e+2]=n(e+2);return{topology:"triangle-list",indices:a}}(t.mode??4,t.indices?.value,p),d=function(e,t,r){let i={};for(let[e,r]of Object.entries(t.attributes)){let{components:a,size:n,value:o,normalized:s}=r,l="POSITION"===e||"NORMAL"===e||"TANGENT"===e,c=!!(t.targets?.length&&l);i[e]={size:n??a,value:c?x({value:o,normalized:s}):o,normalized:!c&&s}}return new S.V2({id:e,topology:r.topology,indices:r.indices??t.indices?.value,attributes:i})}(f,t,m),h=d.vertexCount,g=function(e,t,r){if(!e.targets?.length)return;let i={};for(let e of["POSITION","NORMAL","TANGENT"]){let t=r.attributes[e]?.value;t instanceof Float32Array&&(i[e]=new Float32Array(t))}return{geometry:r,baseAttributes:i,targets:e.targets.map(e=>{let r={};for(let i of["POSITION","NORMAL","TANGENT"]){let a=e[i],n="number"==typeof a?t.accessors[a]:a;n?.value&&ArrayBuffer.isView(n.value)&&(r[i]=x(n))}return r})}}(t,n,d),b=er(e,t.material,d.attributes,{...c,gltf:n}),v=function(e,t){let r,a,n,o,c,u,f,p,m,d,h,{id:g,geometry:b,parsedPPBRMaterial:v,vertexCount:S,modelOptions:_={},instanceMatrices:x,usesLargeSkinPalette:R=!1,morphTargets:M=[]}=t,A=_.userData?.gltfAnimatedCrowd;if(A&&x)throw Error("Nested glTF crowd instancing is unsupported");C.R.info(4,"createGLTFModel defines: ",v.defines)();let N=[],E={},U=[],w=[],P=[],L=!!A?.gpuAnimation;if(x||A)for(let t=0;t<4;t++){let r=new Float32Array(4*(A?.capacity||x?.length||0));x?.forEach((e,i)=>{for(let a=0;a<4;a++)r[4*i+a]=e[4*t+a]});let i=`instanceModelMatrixCol${t}`,a=e.createBuffer({id:`${g||"gltf"}-${i}`,data:r,usage:s.h.VERTEX|s.h.COPY_DST});E[i]=a,U.push({name:i,format:"float32x4",stepMode:"instance"}),N.push(a),w.push(a),P.push(r)}if(A&&L)for(let[t,i]of[["instanceAnimationFrames",r=new Float32Array(4*A.capacity)],["instanceAnimationBlend",n=new Float32Array(4*A.capacity)]]){let r=e.createBuffer({id:`${g||"gltf"}-${t}`,data:i,usage:s.h.VERTEX|s.h.COPY_DST});E[t]=r,U.push({name:t,format:"float32x4",stepMode:"instance"}),N.push(r),"instanceAnimationFrames"===t?a=r:o=r}let V=!!v.defines.HAS_SKIN,O=!!(R&&V&&!A),F=!!(A&&V&&!L);A&&F&&(u=new Float32Array(A.capacity*A.jointsPerInstance*16),c="webgpu"===e.type?e.createBuffer({id:`${g||"gltf"}-crowd-joint-matrices`,byteLength:u.byteLength,usage:s.h.STORAGE|s.h.COPY_DST}):e.createTexture({id:`${g||"gltf"}-crowd-joint-matrices`,format:"rgba32float",width:4*A.jointsPerInstance,height:A.capacity,usage:l.g.SAMPLE|l.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}}),N.push(c));let H=M.length,D=Math.floor((b.attributes.POSITION?.value.length||0)/3);if(H>0&&D>0){let t=new Float32Array(3*H*D*4);for(let[e,r]of M.entries())for(let[i,a]of["POSITION","NORMAL","TANGENT"].entries()){let n=r[a];if(!n)continue;let o="TANGENT"===a&&n.length===4*D?4:3;for(let r=0;r<D;r++){let a=((3*e+i)*D+r)*4,s=r*o;t[a]=n[s]||0,t[a+1]=n[s+1]||0,t[a+2]=n[s+2]||0}}if(f=X(e,`${g||"gltf"}-crowd-morph-targets`,t,D,3*H),N.push(f),!L){let t=Math.ceil(H/4),r=A?.capacity||1;m=X(e,`${g||"gltf"}-crowd-morph-weights`,p=new Float32Array(r*t*4),t,r),N.push(m)}}let k=V&&A?A.jointsPerInstance:0,B=4+4*k+H;A?.gpuAnimation&&(d=X(e,`${g||"gltf"}-crowd-animation-frames`,h=new Float32Array(A.gpuAnimation.frameCount*B*4),B,A.gpuAnimation.frameCount),N.push(d));let G=$;for(let[e,t]of[["CROWD_JOINTS_PER_INSTANCE",A?.jointsPerInstance||0],["CROWD_MORPH_VERTEX_COUNT",D],["CROWD_MORPH_TARGET_COUNT",H],["CROWD_ANIMATION_JOINT_COUNT",k],["CROWD_ANIMATION_FRAME_STRIDE",B]])G=G.replaceAll(`u32(${e})`,`u32(${t})`);let j={id:g,source:G,vs:W,fs:q,geometry:b,topology:b.topology,vertexCount:S,modules:[T.s,I,...A||f?[K]:[]],..._,...x||A?{attributes:{..._.attributes,...E},bufferLayout:[..._.bufferLayout||[],...U],instanceCount:x?.length||0,isInstanced:!0}:{},defines:{...v.defines,..._.defines,...x||A?{HAS_GLTF_INSTANCING:!0}:{},...F?{HAS_INSTANCED_SKIN:!0,CROWD_JOINTS_PER_INSTANCE:A.jointsPerInstance}:{},...O?{HAS_LARGE_SKIN:!0}:{},...L?{HAS_GPU_CROWD_ANIMATION:!0,CROWD_ANIMATION_FRAME_STRIDE:B}:{},...f?{HAS_INSTANCED_MORPH:!0,CROWD_MORPH_TARGET_COUNT:H}:{},...A||f?{CROWD_ANIMATION_JOINT_COUNT:k}:{}},parameters:{depthWriteEnabled:!0,depthCompare:"less",depthFormat:"depth24plus",cullMode:"back",...v.parameters,..._.parameters}},z=t.material||J(e,{id:g?`${g}-material`:void 0,parsedPPBRMaterial:v});j.material=z;let Y=new y.K(e,j),Q={...v.uniforms,..._.uniforms,...v.bindings,..._.bindings},Z=function(e,t,r){let i=new Map;for(let t of e){for(let e of Object.keys(t.uniformTypes||{}))i.set(e,t.name);for(let e of t.bindingLayout||[])i.set(e.name,t.name)}let a={};for(let[e,n]of Object.entries(r)){if(void 0===n)continue;let r=i.get(e);!r||t.ownsModule(r)||(a[r]||={},a[r][e]=n)}return a}(Y.shaderInputs.getModules(),z,Q);Y.shaderInputs.setProps(Z),c&&Y.shaderInputs.setProps({skin:{jointMatrices:[],skinJointMatrices:c}}),(d||f||m)&&Y.shaderInputs.setProps({gpuAnimation:{...d?{gpuAnimationFrames:d}:{},...f?{gpuMorphTargets:f}:{},...m?{gpuMorphWeights:m}:{}}});let ee=new i.s({managedResources:N,model:Y,bounds:t.bounds,instanceMatrices:x});return ee.userData.gltfLargeSkinPalette=O,p&&m&&!A&&(ee.userData.gltfMorphWeights={values:p,data:m,packedTargetCount:Math.ceil(H/4)}),A&&(ee.userData.gltfAnimatedCrowd={transformBuffers:w,transformColumns:P,skinJointMatrices:c,jointMatrices:u,jointsPerInstance:A.jointsPerInstance,morphTargetCount:H,morphTargetData:f,morphWeights:p,morphWeightData:m,animationFrames:d,animationFrameValues:h,animationFrameStride:B,animationJointCount:k,animationParameters:r,animationParameterBuffer:a,animationBlend:n,animationBlendBuffer:o}),ee}(e,{id:f,geometry:d,material:t.material&&o.get(t.material.id)||null,parsedPPBRMaterial:b,modelOptions:c.modelOptions,vertexCount:h,bounds:[t.attributes.POSITION.min,t.attributes.POSITION.max],instanceMatrices:u?.matrices,usesLargeSkinPalette:function(...e){for(let t of e)if(t){if(t.max?.some(e=>e>=64))return!0;for(let e=0;e<(t.value?.length||0);e++)if(t.value[e]>=64)return!0}return!1}(t.attributes.JOINTS_0,t.attributes.JOINTS_1),morphTargets:g?.targets});u&&(v.userData.gltfInstancing=u);let _=t.extensions?.KHR_materials_variants?.mappings||[];if(_.length){let t=new Map;for(let r of _){let i="number"==typeof r.material?n.materials[r.material]:r.material,a=i&&o.get(i.id);if(!a)continue;let s=er(e,i,d.attributes,{...c,gltf:n});for(let e of r.variants||[])t.set(e,{material:a,parameters:{...v.model.parameters,...s.parameters,depthWriteEnabled:"BLEND"!==i.alphaMode,cullMode:i.doubleSided?"none":"back"}})}v.userData.gltfMaterialVariants={defaultMaterial:v.model.material,defaultParameters:{...v.model.parameters},mappings:t}}return g&&(v.userData.morphTargets=g),v})({device:e,gltfPrimitive:c,primitiveIndex:u,gltfMesh:t,gltf:r,gltfMaterialIdToMaterialMap:a,options:n,instancing:o}));return new v.o({id:t.name||t.id,children:c})}var ea=r(23471);function en(e,t={}){let r=t.lightDefinitions||e.lights||e.extensions?.KHR_lights_punctual?.lights;if(!r||!Array.isArray(r)||0===r.length)return[];let i=[],a=function(e){let t=new Map;for(let r of e)for(let e of r.children||[])t.set(e.id,r);return t}(e.nodes||[]),n=new Map;for(let u of e.nodes||[]){var o,s,l,c;if(!function(e,t,r){let i=e;for(;i;){let e=r?.get(i.id);if(e?!e.display:i.extensions?.KHR_node_visibility?.visible===!1)return!1;i=t.get(i.id)}return!0}(u,a,t.nodeVisibility))continue;let e=u.light??u.extensions?.KHR_lights_punctual?.light;if("number"!=typeof e||t.nodeIdentifiers&&!t.nodeIdentifiers.has(u.id))continue;let f=r[e];if(!f)continue;let p=(o=f.color||[1,1,1],t.useByteColors??!0?o.map(e=>255*e):(0,ea.sC)(o,!1)),m=f.intensity??1,d=f.range,h=function e(t,r,i){let a=i.get(t.id);if(a)return a;let n=function(e){if(e.matrix)return new M.k(e.matrix);let t=new M.k;return e.translation&&t.translate(e.translation),e.rotation&&t.multiplyRight(new M.k().fromQuaternion(e.rotation)),e.scale&&t.scale(e.scale),t}(t),o=r.get(t.id),s=o?new M.k(e(o,r,i)).multiplyRight(n):n;return i.set(t.id,s),s}(u,a,n);switch(f.type){case"directional":i.push((s=h,l=p,c=m,{type:"directional",direction:es(s),color:l,intensity:c}));break;case"point":i.push(function(e,t,r,i){let a=eo(e),n=[1,0,0];return void 0!==i&&i>0&&(n=[1,0,1/(i*i)]),{type:"point",position:a,color:t,intensity:r,attenuation:n}}(h,p,m,d));break;case"spot":i.push(function(e,t,r,i,a={}){let n=eo(e),o=es(e),s=[1,0,0];return void 0!==i&&i>0&&(s=[1,0,1/(i*i)]),{type:"spot",position:n,direction:o,color:t,intensity:r,attenuation:s,innerConeAngle:a.innerConeAngle??0,outerConeAngle:a.outerConeAngle??Math.PI/4}}(h,p,m,d,f.spot))}}return i}function eo(e){return e.transformAsPoint([0,0,0])}function es(e){return e.transformAsVector([0,0,-1])}class el{name;playing=!0;speed=1;startTime=0;constructor(e={}){this.name=e.name||"unnamed",Object.assign(this,e)}setTime(e){if(!this.playing)return;let t=(e/1e3-this.startTime)*this.speed;this.applyTime(t)}}class ec{clips;animations;constructor(e){this.clips=e,this.animations=e}animate(e){C.R.warn(`${this.constructor.name}#animate is deprecated. Use ${this.constructor.name}#setTime instead`)(),this.setTime(e)}setTime(e){this.clips.forEach(t=>t.setTime(e))}getAnimations(){return this.clips}}function eu(e,t,r){let i=ep(e),a=ep(t),n=i.reduce((e,t,r)=>e+t*a[r],0),o=n<0?-1:1;if((n=Math.min(Math.abs(n),1))>.9995)return ep(i.map((e,t)=>e+r*(a[t]*o-e)));let s=Math.acos(n),l=Math.sin(s),c=Math.sin((1-r)*s)/l,u=Math.sin(r*s)/l*o;return ep(i.map((e,t)=>e*c+a[t]*u))}function ef(e,t,r,i){let a=e["CUBICSPLINE"===t?3*r+1:r];return a?"quaternion"===i?ep(a):[...a]:null}function ep(e){let t=Math.hypot(...e);return t>0?e.map(e=>e/t):[0,0,0,1]}class em{clip;mixer;time=0;timeScale;weight;loop;repetitions;paused=!1;playing=!1;elapsedTime=0;fade=null;constructor(e,t,r={}){this.mixer=e,this.clip=t,this.loop=r.loop||"repeat",this.repetitions=r.repetitions??1/0,this.timeScale=r.timeScale??1,this.weight=r.weight??1}play(){return this.playing=!0,this.paused=!1,this}pause(){return this.paused=!0,this}resume(){return this.playing=!0,this.paused=!1,this}stop(){return this.playing=!1,this.paused=!1,this.fade=null,this.reset()}reset(){return this.elapsedTime=0,this.time=0,this}setTime(e){return this.elapsedTime=e,this.time=this.resolveLocalTime(e),this}setLoop(e,t=1/0){return this.loop=e,this.repetitions=t,this.time=this.resolveLocalTime(this.elapsedTime),this}setEffectiveWeight(e){return this.weight=Math.max(0,e),this.fade=null,this}setEffectiveTimeScale(e){return this.timeScale=e,this}fadeIn(e){return this.scheduleFade(1,e)}fadeOut(e){return this.scheduleFade(0,e)}crossFadeTo(e,t){return e.weight=0,e.play().fadeIn(t),this.fadeOut(t)}crossFadeFrom(e,t){return e.crossFadeTo(this,t),this}advance(e){this.playing&&!this.paused&&(this.advanceFade(Math.abs(e)),this.elapsedTime+=e*this.timeScale,this.time=this.resolveLocalTime(this.elapsedTime),this.hasFinished()&&(this.playing=!1))}get shouldApply(){return(this.playing||this.hasFinished())&&this.weight>0}scheduleFade(e,t){return t<=0?(this.weight=e,this.fade=null):this.fade={duration:t,elapsedTime:0,startWeight:this.weight,endWeight:e},this}advanceFade(e){if(!this.fade)return;this.fade.elapsedTime+=e;let t=Math.min(this.fade.elapsedTime/this.fade.duration,1);this.weight=this.fade.startWeight+(this.fade.endWeight-this.fade.startWeight)*t,1===t&&(this.fade=null)}hasFinished(){let e=this.clip.duration;return e<=0?"once"===this.loop:"once"===this.loop?this.elapsedTime>=e||this.elapsedTime<0:Number.isFinite(this.repetitions)&&Math.abs(this.elapsedTime)>=e*this.repetitions}resolveLocalTime(e){let t=this.clip.duration;if(t<=0)return 0;if("once"===this.loop)return Math.min(Math.max(e,0),t);if(Number.isFinite(this.repetitions)&&Math.abs(e)>=t*this.repetitions)return"ping-pong"===this.loop&&this.repetitions%2==0||e<0?0:t;let r=e>=0&&e<t?e:(e%t+t)%t;return"repeat"===this.loop||0===Math.abs(Math.floor(e/t)%2)?r:t-r}}class ed{time=0;timeScale=1;clips=new Map;actions=new Map;initialValues=new Map;constructor(e=[]){e.forEach(e=>this.addClip(e))}addClip(e){return this.clips.set(e.name,e),this}clipAction(e,t){let r="string"==typeof e?this.clips.get(e):e;if(!r)throw Error(`Unknown animation clip: ${e}`);this.addClip(r);let i=this.actions.get(r);return i||(i=new em(this,r,t),this.actions.set(r,i)),i}getAction(e){let t=this.clips.get(e);return t?this.actions.get(t):void 0}update(e){return this.advance(e),this.applyValues(),this}advance(e){let t=e*this.timeScale;return this.time+=t,this.actions.forEach(e=>e.advance(t)),this}setTime(e){return this.time=e,this.actions.forEach(t=>{t.paused||t.setTime(e*t.timeScale)}),this.applyValues(),this}stopAllAction(){return this.actions.forEach(e=>e.stop()),this}applyValues(){let e=new Map;this.actions.forEach(t=>{(t.shouldApply||t.playing&&0===t.weight)&&t.clip.tracks.forEach(r=>{let i=r.evaluate(t.time);if(!i)return;let a=r.binding.id||r.binding;if(!this.initialValues.has(a)){let e=r.binding.getValue?.();e&&this.initialValues.set(a,[...e])}if(0===t.weight&&!this.initialValues.has(a))return;let n=e.get(a);if(!n)return void e.set(a,{binding:r.binding,value:[...i],valueType:r.valueType,weight:t.weight});if(0===t.weight)return;let o=n.weight+t.weight,s=t.weight/o;n.value="quaternion"===r.valueType?eu(n.value,i,s):n.value.map((e,t)=>e+(i[t]-e)*s),n.weight=o})}),e.forEach(({binding:e,value:t,valueType:r,weight:i},a)=>{let n=i<1?this.initialValues.get(a):void 0;n&&n.length===t.length&&(t="quaternion"===r?eu(n,t,i):t.map((e,t)=>n[t]+(e-n[t])*i)),e.setValue(t)})}}class eh{name;tracks;duration;constructor(e){this.name=e.name||"unnamed",this.tracks=e.tracks,this.duration=e.duration??Math.max(0,...e.tracks.map(e=>e.duration))}}class eg{name;times;values;interpolation;valueType;binding;constructor(e){this.name=e.name||e.binding.id||"unnamed",this.times=e.times,this.values=e.values,this.interpolation=e.interpolation||"LINEAR",this.valueType=e.valueType||"vector",this.binding=e.binding}get duration(){return this.times[this.times.length-1]||0}get sampler(){return{input:this.times,output:this.values,interpolation:this.interpolation}}evaluate(e){return function(e,t,r="vector"){var i,a,n,o,s,l,c,u,f;let{input:p,output:m,interpolation:d="LINEAR"}=t;if(!p.length||!m.length||!Number.isFinite(e))return null;let h=p.length-1;if(e<=p[0]||0===h)return ef(m,d,0,r);if(e>=p[h])return ef(m,d,h,r);let g=0,b=h;for(;b-g>1;){let t=Math.floor((g+b)/2);p[t]<=e?g=t:b=t}let v=p[g],S=p[b]-v;if(S<=0||"STEP"===d)return ef(m,d,g,r);let _=(e-v)/S;switch(d){case"LINEAR":{let e=m[g],t=m[b];if(!e||!t)return null;return"quaternion"===r?eu(e,t,_):(i=e,a=t,n=_,i.map((e,t)=>(1-n)*e+n*a[t]))}case"CUBICSPLINE":{let e,t,i=m[3*g+1],a=m[3*g+2],n=m[3*b],p=m[3*b+1];if(!i||!a||!n||!p)return null;let d=(o=i,s=a,l=n,c=p,u=S,t=(e=(f=_)*f)*f,o.map((r,i)=>(2*t-3*e+1)*r+(t-2*e+f)*s[i]*u+(-2*t+3*e)*c[i]+(t-e)*l[i]*u));return"quaternion"===r?ep(d):d}default:return null}}(e,this.sampler,this.valueType)}}var eb=r(29244);class ev extends el{animation;gltfNodeIdToNodeMap;onVisibilityChange;cameras;lightDefinitions;onLightChange;materials;clip;mixer;action;materialTextureTransformState=new Map;constructor(e){if(super({name:e.animation.name||"unnamed"}),this.animation=e.animation,this.gltfNodeIdToNodeMap=e.gltfNodeIdToNodeMap,this.onVisibilityChange=e.onVisibilityChange,this.cameras=e.cameras||[],this.lightDefinitions=e.lightDefinitions||[],this.onLightChange=e.onLightChange,this.materials=e.materials||[],this.animation.name||="unnamed",this.name=this.animation.name,this.animation.channels.some(e=>"material"===e.type||"textureTransform"===e.type)&&!this.materials.length)throw Error(`Animation ${this.animation.name} targets materials, but GLTFAnimator was created without a materials array`);this.mixer=e.mixer||new ed,this.clip=new eh({name:this.name,tracks:this.animation.channels.map(e=>this.createAnimationTrack(e))}),this.action=this.mixer.clipAction(this.clip).play()}applyTime(e){this.action.setTime(e),this.mixer.update(0)}createAnimationTrack(e){let t=function(e){switch(e){case"STEP":case"LINEAR":case"CUBICSPLINE":return e;default:throw Error(`Unsupported animation interpolation: ${e}`)}}(e.sampler.interpolation);if("node"===e.type)return new eg({name:`${e.targetNodeId}.${e.path}`,times:e.sampler.input,values:e.sampler.output,interpolation:t,valueType:"rotation"===e.path?"quaternion":"vector",binding:{id:`node:${e.targetNodeId}:${e.path}`,getValue:()=>this.getNodeAnimationValue(e.targetNodeId,e.path),setValue:t=>this.applyNodeAnimationValue(e.targetNodeId,e.path,t)}});if("camera"===e.type||"light"===e.type)return new eg({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:t,binding:{id:e.pointer,getValue:()=>this.getSceneAnimationValue(e),setValue:t=>this.applySceneAnimationValue(e,t)}});let r=this.materials[e.targetMaterialIndex];if(!r)throw Error(`Cannot find animation target material ${e.targetMaterialIndex} for ${e.pointer}`);return new eg({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:t,binding:{id:e.pointer,getValue:"material"===e.type?()=>{var t,i;let a,n;return t=r,i=e,a=t.shaderInputs.getUniformValues(),Array.isArray(n=a.pbrMaterial?.[i.property])?void 0===i.component?[...n]:[n[i.component]]:"number"==typeof n?[n]:[]}:void 0,setValue:t=>{var i,a,n,o,s,l,c,u;let f,p,m,d;"material"===e.type?(i=r,a=e,n=t,d=void 0!==a.component?{[a.property]:(l=(o=i,s=a.property,f=o.shaderInputs.getUniformValues(),Array.isArray(p=f.pbrMaterial?.[s])?[...p]:[]),c=a.component,u=n[0],(m=[...l])[c]=u,m)}:{[a.property]:1===n.length?n[0]:n},i.setProps({pbrMaterial:d})):function(e,t,r,i){var a,n,o;let s,l,c=(0,eb.lz)(t.textureSlot),u=(a=i,n=e,o=t,(l=(s=a.get(n)||{})[o.textureSlot])||(l={offset:[...o.baseTransform.offset],rotation:o.baseTransform.rotation,scale:[...o.baseTransform.scale]},s[o.textureSlot]=l,a.set(n,s)),l);switch(t.path){case"offset":void 0!==t.component?u.offset[t.component]=r[0]:u.offset=[r[0],r[1]];break;case"rotation":u.rotation=r[0];break;case"scale":void 0!==t.component?u.scale[t.component]=r[0]:u.scale=[r[0],r[1]]}e.setProps({pbrMaterial:{[c.uvTransformUniform]:(0,eb.dy)(t.baseTransform,u)}})}(r,e,t,this.materialTextureTransformState)}}})}getNodeAnimationValue(e,t){let r=this.getTargetNode(e);switch(t){case"translation":return Array.from(r.position);case"rotation":return Array.from(r.rotation);case"scale":return Array.from(r.scale);case"weights":return Array.from(r.userData.morphWeights||[]);case"visibility":return[+!!r.display];default:return[]}}applyNodeAnimationValue(e,t,r){let i=this.getTargetNode(e);switch(t){case"translation":i.setPosition(r).updateMatrix();break;case"rotation":i.setRotation(r).updateMatrix();break;case"scale":i.setScale(r).updateMatrix();break;case"weights":Q(i,r);break;case"visibility":i.setProps({display:0!==r[0]}),this.onVisibilityChange?.();break;default:C.R.warn(`Bad animation path ${t}`)()}}getTargetNode(e){let t=this.gltfNodeIdToNodeMap.get(e);if(!t)throw Error(`Cannot find animation target node ${e}`);return t}getSceneAnimationValue(e){if("camera"===e.type){let t=this.cameras[e.targetCameraIndex],r=t?.[e.projection]?.[e.property];return"number"==typeof r?[r]:[]}let t=this.lightDefinitions[e.targetLightIndex],r="innerConeAngle"===e.property||"outerConeAngle"===e.property?t?.spot?.[e.property]:t?.[e.property];return Array.isArray(r)?void 0===e.component?[...r]:[r[e.component]]:"number"==typeof r?[r]:[]}applySceneAnimationValue(e,t){if("camera"===e.type){let r=this.cameras[e.targetCameraIndex];r?.[e.projection]&&(r[e.projection][e.property]=t[0]);return}let r=this.lightDefinitions[e.targetLightIndex];if(r){if("innerConeAngle"===e.property||"outerConeAngle"===e.property)r.spot||={},r.spot[e.property]=t[0];else if(void 0!==e.component){let i=[...r[e.property]||[1,1,1]];i[e.component]=t[0],r[e.property]=i}else r[e.property]=1===t.length?t[0]:[...t];this.onLightChange?.()}}}class eS extends ec{mixer;activeClip;onUpdate;previousTimeSeconds;constructor(e){let t=new ed;super(e.animations.map((r,i)=>{let a=r.name||`Animation-${i}`;return new ev({gltfNodeIdToNodeMap:e.gltfNodeIdToNodeMap,onVisibilityChange:e.onVisibilityChange,cameras:e.cameras,lightDefinitions:e.lightDefinitions,onLightChange:e.onLightChange,materials:e.materials,mixer:t,animation:{name:a,channels:r.channels}})})),this.mixer=t,this.onUpdate=e.onUpdate,this.activeClip=this.clips[0]?.name,!1===e.autoplay?this.clips.forEach(e=>{e.playing=!1,e.action.stop()}):"first"===e.autoplay&&this.activeClip&&this.selectClip(this.activeClip)}setUpdateHandler(e){return this.onUpdate=e,this}setTime(e){let t=e/1e3,r=void 0===this.previousTimeSeconds?0:t-this.previousTimeSeconds;this.previousTimeSeconds=t;let i=r*this.mixer.timeScale;this.clips.forEach(e=>{if(!e.playing)return void e.action.stop();if(e.action.paused)return;e.action.resume();let r=Math.max(0,t-e.startTime)*e.speed;e.action.setTime(r-i*e.action.timeScale)}),this.mixer.update(r),this.onUpdate?.()}update(e){this.mixer.update(e),this.onUpdate?.()}selectClip(e,t={}){let r=this.clips.find(t=>t.name===e);if(!r)throw Error(`Unknown animation clip: ${e}`);let i=this.clips.find(e=>e.name===this.activeClip),a=t.crossFadeDuration||0;for(let e of this.clips)e===r||a>0&&e===i||(e.playing=!1,e.action.stop());return r.playing=!0,a>0&&i&&i!==r?(i.playing=!0,i.action.crossFadeTo(r.action,a)):r.action.reset().setEffectiveWeight(1).play(),this.activeClip=e,r}}class e_{bindings;scenes;constructor(e){this.scenes=e.scenes,this.bindings=function(e){let{gltf:t,gltfNodeIndexToNodeMap:r}=e,a=[],n=t.skins||[],o=new Set;for(let t of e.scenes)t.preorderTraversal(e=>{e instanceof v.o&&o.add(e)});for(let[c,u]of t.nodes.entries()){let f,p=u.skin;if(void 0===p||!u.mesh)continue;let m=function(e,t){return"number"==typeof t?t:(e.skins||[]).findIndex(r=>{if(r===t||t.id&&r.id===t.id)return!0;if(r.joints.length!==t.joints?.length||!r.joints.every((e,r)=>e===t.joints?.[r]))return!1;if("number"==typeof t.inverseBindMatrices){let i=e.accessors[t.inverseBindMatrices];return!r.inverseBindMatrices||r.inverseBindMatrices===i}return!0})}(t,p),d=n[m],h=r.get(c);if(!d||!h||!o.has(h))continue;let g=d.joints.flatMap(e=>{let t=r.get(e);return t?[t]:[]});if(g.length!==d.joints.length)continue;let b=u.mesh,S=h.userData.gltfMesh,_=S instanceof v.o?S:h.children.find(e=>e instanceof v.o&&e.id===(b.name||b.id));if(!(_ instanceof v.o))continue;let x=_.children.flatMap(e=>e instanceof i.s?[e]:[]),R=d.inverseBindMatrices?.value,T=new Float32Array(16*g.length);g.length>64&&x.some(e=>!0===e.userData.gltfLargeSkinPalette)&&(f=function(e,t,r){if("webgpu"===e.type)return e.createBuffer({id:`${t}-skin-joint-matrices`,byteLength:r.byteLength,usage:s.h.STORAGE|s.h.COPY_DST});let i=r.length/4;if(i>e.limits.maxTextureDimension2D)throw Error("glTF skin palette exceeds the device texture width limit");return e.createTexture({id:`${t}-skin-joint-matrices`,format:"rgba32float",width:i,height:1,usage:l.g.SAMPLE|l.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}})}(e.device,h.id,T)),a.push({nodeIndex:c,skinIndex:m,node:h,joints:g,...R instanceof Float32Array?{inverseBindMatrices:R}:{},jointMatrices:T,...f?{skinJointMatrices:f}:{},models:x})}return a}(e),this.update()}update(){if(0===this.bindings.length)return;let e=new Map;for(let t of this.scenes)t.preorderTraversal((t,{worldMatrix:r})=>{t instanceof v.o&&e.set(t,new M.k(r))});for(let t of this.bindings)for(let r of(!function(e){let{joints:t,meshNode:r,worldMatrices:i,inverseBindMatrices:a,target:n}=e,o=t.length,s=n&&n.length===16*o?n:new Float32Array(16*o),l=r?i.get(r)||r.matrix:void 0,c=l?new M.k(l).invert():null;for(let e=0;e<o;e++){let r=t[e],n=i.get(r)||r.matrix,o=c?new M.k(c).multiplyRight(n):new M.k(n),l=16*e;if(a&&a.length>=l+16){let e=new M.k;for(let t=0;t<16;t++)e[t]=a[l+t];o.multiplyRight(e)}s.set(o,l)}}({joints:t.joints,meshNode:t.node,worldMatrices:e,inverseBindMatrices:t.inverseBindMatrices,target:t.jointMatrices}),t.skinJointMatrices&&(t.skinJointMatrices instanceof s.h?t.skinJointMatrices.write(t.jointMatrices):t.skinJointMatrices.writeData(t.jointMatrices,{width:4*t.joints.length,height:1})),t.models))r.model.shaderInputs.setProps({skin:t.skinJointMatrices?{jointMatrices:[],skinJointMatrices:t.skinJointMatrices}:{jointMatrices:t.jointMatrices}})}getBinding(e){return this.bindings.find(t=>"number"==typeof e?t.nodeIndex===e:t.node===e)}destroy(){for(let e of this.bindings)e.skinJointMatrices?.destroy()}}let ex={supportLevel:"none",standardStatus:"unknown",comment:"Not currently listed in the luma.gl glTF extension support registry."},eR={KHR_draco_mesh_compression:{supportLevel:"built-in",standardStatus:"ratified",comment:"Decoded by loaders.gl before luma.gl builds the scenegraph."},EXT_meshopt_compression:{supportLevel:"built-in",standardStatus:"ratified",comment:"EXT meshopt-compressed buffer views are decoded by loaders.gl before rendering."},KHR_meshopt_compression:{supportLevel:"built-in",standardStatus:"release-candidate",comment:"Decoded by loaders.gl v5 before luma.gl builds the scenegraph."},KHR_mesh_quantization:{supportLevel:"built-in",standardStatus:"ratified",comment:"Loader-materialized quantized accessors retain their typed values and normalization."},EXT_mesh_features:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Feature identifiers are decoded by loaders.gl; automatic rendering and picking are application-owned."},EXT_structural_metadata:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Structural metadata is decoded by loaders.gl; automatic rendering and querying are application-owned."},KHR_lights_punctual:{supportLevel:"built-in",standardStatus:"ratified",comment:"Parsed into luma.gl Light objects."},KHR_materials_unlit:{supportLevel:"built-in",standardStatus:"ratified",comment:"Unlit materials bypass the default lighting path."},KHR_materials_emissive_strength:{supportLevel:"built-in",standardStatus:"ratified",comment:"Applied by the stock PBR shader."},KHR_texture_basisu:{supportLevel:"built-in",standardStatus:"ratified",comment:"BasisU / KTX2 textures pass through when the device supports them."},KHR_texture_transform:{supportLevel:"built-in",standardStatus:"ratified",comment:"Per-slot UV transforms and animated pointers are applied at runtime; avoid duplicate legacy loader-side baking."},EXT_texture_webp:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Texture source is resolved during load; final support depends on browser and device decode support."},EXT_texture_avif:{supportLevel:"none",standardStatus:"ratified",comment:"The image loader can decode supported AVIF images, but GLTFLoader does not select EXT_texture_avif sources."},KHR_materials_specular:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now applies specular factors and textures to the dielectric F0 term."},KHR_materials_ior:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now drives dielectric reflectance from the glTF IOR value."},KHR_materials_transmission:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now applies transmission to the base layer and exposes transparency through alpha, without a scene-color refraction buffer."},KHR_materials_volume:{supportLevel:"built-in",standardStatus:"ratified",comment:"Thickness and attenuation now tint transmitted light in the stock shader."},KHR_materials_clearcoat:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now adds a secondary clearcoat specular lobe."},KHR_materials_sheen:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now adds a sheen lobe for cloth-like materials."},KHR_materials_iridescence:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now tints specular response with a view-dependent thin-film iridescence approximation."},KHR_materials_anisotropy:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now shapes highlights and IBL response with an anisotropy-direction approximation."},KHR_materials_pbrSpecularGlossiness:{supportLevel:"loader-only",standardStatus:"archived",comment:"Extension data can be loaded, but it is not translated into the default metallic-roughness material path."},KHR_materials_variants:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Primitive material variants can be selected and restored on the generated scenegraph."},EXT_mesh_gpu_instancing:{supportLevel:"built-in",standardStatus:"ratified",comment:"Accessor-backed instance transforms use one instanced draw per source primitive."},KHR_node_visibility:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Recursive node visibility controls rendered geometry, punctual lights, and animation."},KHR_animation_pointer:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Node transforms, morph weights and visibility, material factors, texture transforms, camera projections, and punctual lights are wired to runtime updates."},EXT_materials_bump:{supportLevel:"built-in",standardStatus:"draft",comment:"The experimental bump-map draft perturbs the canonical surface normal from a linear height texture."},KHR_materials_diffuse_transmission:{supportLevel:"built-in",standardStatus:"release-candidate",comment:"The Khronos release candidate adds energy-conserving back-lit diffuse transmission and independent color/factor textures."},KHR_materials_dispersion:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"The canonical PBR shader separates red, green, and blue transmission using wavelength-dependent refraction."},KHR_materials_volume_scatter:{supportLevel:"parsed-and-wired",standardStatus:"draft",comment:"The unratified volume-scattering draft is approximated per surface; random-walk and screen-space diffusion are not implemented."},KHR_xmp:{supportLevel:"none",standardStatus:"archived",comment:"Metadata payloads remain in the loaded glTF, but luma.gl does not interpret them."},KHR_xmp_json_ld:{supportLevel:"none",standardStatus:"ratified",comment:"Metadata is preserved in the glTF, but luma.gl does not interpret it."},EXT_lights_image_based:{supportLevel:"none",standardStatus:"multi-vendor",comment:"Use loadPBREnvironment() or custom environment setup instead."},EXT_texture_video:{supportLevel:"none",standardStatus:"multi-vendor",comment:"Video textures are not created automatically by the stock pipeline."},MSFT_lod:{supportLevel:"parsed-and-wired",standardStatus:"vendor",comment:"Node levels are parsed and selected by opt-in animated crowds; material LOD and GPU-driven selection are not implemented."}};function eT(e,t){var r;let i,a=Array.from((r=e,eM(i=new Set,r.extensionsUsed),eM(i,r.extensionsRequired),eM(i,r.extensionsRemoved),eM(i,Object.keys(r.extensions||{})),(r.lights?.length||(r.nodes||[]).some(e=>"light"in e))&&i.add("KHR_lights_punctual"),(r.materials||[]).some(e=>e.unlit||e.extensions?.KHR_materials_unlit)&&i.add("KHR_materials_unlit"),i)).sort(),n=new Set(e.extensionsRequired||[]);return new Map(a.map(r=>{var i;let a=eR[r]||ex,o=function(e,t,r,i){if("KHR_texture_basisu"!==e||!i)return t;let a=(function(e){let t=[];for(let r of e.textures||[]){let e=r?.source?.image;if(!e?.compressed)continue;let i=Array.isArray(e.data)?e.data[0]:Array.isArray(e.mipmaps)?e.mipmaps[0]:void 0;t.push(i?.textureFormat??null)}return t})(r).find(e=>null===e||!i.isTextureFormatSupported(e));return void 0===a?t:{supportLevel:"none",comment:null===a?`The ${i.type} device cannot use a BasisU texture whose transcoded GPU format is missing.`:`The ${i.type} device does not support the transcoded BasisU texture format '${a}'.`}}(r,a,e,t);return[r,{extensionName:r,required:n.has(r),supported:"built-in"===(i=o.supportLevel)||"parsed-and-wired"===i,supportLevel:o.supportLevel,standardStatus:a.standardStatus,comment:o.comment}]}))}function eM(e,t=[]){for(let r of t)e.add(r)}function eI(e){switch(e){case"translation":case"rotation":case"scale":case"weights":return e;default:return null}}function eC(e){let t=eA(e);if(t){let e=eR[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`no runtime target exists for material property "${e.join("/")}"`}function eA(e){let t=e.indexOf("extensions"),r=e[t+1];return t>=0&&r?r:null}function ey(e,t){C.R.warn(`KHR_animation_pointer target ${e} will be skipped because ${t}`)()}function eN(e){if(e.value)return eE(!(e.value instanceof BigInt64Array)&&!(e.value instanceof BigUint64Array),"glTF animation accessors cannot use BigInt component arrays"),{value:e.value,components:e.components};let t=e.bufferView?.data;eE(void 0!==t),eE(5126===e.componentType);let r="SCALAR"===e.type?1:Number(e.type.slice(3));return{value:new Float32Array(t.buffer,t.byteOffset+(e.byteOffset||0),e.count*r),components:r}}function eE(e,t){if(!e)throw Error(t)}class eU{variants;names;activeVariant=null;modelNodes;constructor(e,t){let r=e.extensions?.KHR_materials_variants?.variants||[];this.variants=r.map((e,t)=>({name:e.name||`Variant-${t}`,index:t})),this.names=this.variants.map(e=>e.name);let a=new Set;for(let e of t)e.preorderTraversal(e=>{e instanceof i.s&&e.userData.gltfMaterialVariants&&a.add(e)});this.modelNodes=Array.from(a)}selectVariant(e){let t=this.variants.find(t=>t.name===e);if(!t)throw Error(`Unknown glTF material variant: ${e}`);for(let e of this.modelNodes){let r=e.userData.gltfMaterialVariants,i=r.mappings.get(t.index);e.model.setMaterial(i?.material||r.defaultMaterial),e.model.setParameters(i?.parameters||r.defaultParameters)}this.activeVariant=e}resetVariant(){for(let e of this.modelNodes){let t=e.userData.gltfMaterialVariants;e.model.setMaterial(t.defaultMaterial),e.model.setParameters(t.defaultParameters)}this.activeVariant=null}}function ew(e,t,r){let a,n,o;r?.strictExtensions&&function(e,t){let r=Array.from(eT(e,t).values()).filter(e=>e.required&&!e.supported);if(r.length)throw Error(`Unsupported required glTF extensions: ${r.map(e=>e.extensionName).join(", ")}`)}(t,e);let{scenes:s,materials:l,gltfMeshIdToNodeMap:c,gltfNodeIdToNodeMap:u,gltfNodeIndexToNodeMap:f,generatedTextures:p}=function(e,t,r={}){let i=new Set,a={...et,...r,generatedTextures:i},n=new g(e,{modules:[T.s]}),o=(t.materials||[]).map((r,i)=>{var o,s;return J(e,{id:(o=r,s=i,o.name||o.id||`material-${s}`),parsedPPBRMaterial:er(e,r,{},{...a,gltf:t,validateAttributes:!1}),materialFactory:n})}),s=new Map;(t.materials||[]).forEach((e,t)=>{s.set(e.id,o[t])});let l=new Map;t.meshes.forEach((r,i)=>{let n=ei(e,r,t,s,a);l.set(r.id,n)});let c=new Map,u=new Map,f=new Set,p=new Set,m=new Set;return t.nodes.forEach((e,t)=>{var r;let i=(r=e,new v.o({id:r.name||r.id,children:[],matrix:r.matrix,display:r.extensions?.KHR_node_visibility?.visible!==!1,position:r.translation,rotation:r.rotation,scale:r.scale}));c.set(t,i),u.set(e.id,i)}),t.nodes.forEach((r,i)=>{if(c.get(i).add((r.children??[]).map(({id:e})=>{let t=u.get(e);if(!t)throw Error(`Cannot find child ${e} of node ${i}`);return t})),r.mesh){let n=r.mesh,o=function(e,t){let r,i=t.extensions?.EXT_mesh_gpu_instancing?.attributes;if(!i||"object"!=typeof i)return null;let a={};for(let[t,n]of Object.entries(i)){let i="number"==typeof n?e.accessors[n]:n;if(!i||!ArrayBuffer.isView(i.value))throw Error(`Invalid glTF instance accessor for ${t}`);if(void 0!==r&&i.count!==r)throw Error("glTF instance attributes must have matching accessor counts");r=i.count,a[t]={value:i.value,size:i.components||function(e){switch(e){case"VEC2":return 2;case"VEC3":return 3;case"VEC4":return 4;default:return 1}}(i.type),count:i.count,normalized:!!i.normalized}}let n=[];for(let e=0;e<(r||0);e++){let t=Y(a.TRANSLATION,e,[0,0,0]),r=Y(a.ROTATION,e,[0,0,0,1]),i=Y(a.SCALE,e,[1,1,1]),o=Math.hypot(...r);if(o>0)for(let e=0;e<r.length;e++)r[e]/=o;n.push(new M.k().translate(t).multiplyRight(new M.k().fromQuaternion(r)).scale(i))}return{matrices:n,attributes:a}}(t,r),u=n.primitives.some(e=>!!e.targets?.length),d=o||u&&f.has(n.id)?ei(e,n,t,s,a,o||void 0):l.get(n.id);if(!d)throw Error(`Cannot find mesh child ${r.mesh.id} of node ${i}`);let h=c.get(i),g=l.get(n.id),b=p.has(n.id)&&(void 0!==r.skin||m.has(n.id))&&d===g?ei(e,n,t,s,a):d;if(h.add(b),h.userData.gltfMesh=b,p.add(n.id),void 0!==r.skin&&m.add(n.id),u){f.add(n.id);let e=n.primitives.find(e=>e.targets?.length)?.targets?.length||0,t=r.weights||n.weights||Array(e).fill(0);h.userData.morphMeshes=[b],a.modelOptions?.userData?.gltfAnimatedCrowd?h.userData.morphWeights=[...t]:Q(h,t)}}}),{scenes:t.scenes.map(e=>{let t=(e.nodes||[]).map(({id:t})=>{let r=u.get(t);if(!r)throw Error(`Cannot find child ${t} of scene ${e.name||e.id}`);return r});return new v.o({id:e.name||e.id,children:t})}),materials:o,gltfMeshIdToNodeMap:l,gltfNodeIdToNodeMap:u,gltfNodeIndexToNodeMap:c,generatedTextures:i}}(e,t,r),m=(a=t.animations||[],n=new Map,o=new Map,a.flatMap((e,r)=>{let i=e.name||`Animation-${r}`,a=new Map,s=e.channels.flatMap(({sampler:r,target:i})=>{let s=function(e,t){let r;if("weights"===t.path)r=t.node;else{if("pointer"!==t.path)return;let e=t.extensions?.KHR_animation_pointer?.pointer,i="string"==typeof e?/^\/nodes\/(\d+)\/weights$/.exec(e):null;if(!i)return;r=Number(i[1])}let i=e.nodes[r??0],a="number"==typeof i?.mesh?e.meshes[i.mesh]:i?.mesh;return i?.weights?.length||a?.weights?.length||a?.primitives?.[0]?.targets?.length||1}(t,i),l=`${r}:${s??0}`,c=a.get(l);if(!c){let i=e.samplers[r];if(!i)throw Error(`Cannot find animation sampler ${r}`);let{input:u,interpolation:f="LINEAR",output:p}=i,m=function(e,t){if(t.has(e))return t.get(e);let{value:r,components:i}=eN(e);eE(1===i,"accessorToJsArray1D must have exactly 1 component");let a=Array.from(r);return t.set(e,a),a}(t.accessors[u],n),d=function(e,t){if(t.has(e))return t.get(e);let{value:r,components:i}=eN(e);eE(i>=1,"accessorToJsArray2D must have at least 1 component");let a=[];for(let e=0;e<r.length;e+=i)a.push(Array.from(r.slice(e,e+i)));return t.set(e,a),a}(t.accessors[p],o);c={input:m,interpolation:f,output:void 0!==s?function(e,t,r,i){let a=e.length/(Math.max(t,1)*("CUBICSPLINE"===r?3:1)),n=i>1?i:Number.isInteger(a)&&a>1?a:i;if(n<=1)return e;let o=e.flat(),s=[];for(let e=0;e<o.length;e+=n)s.push(o.slice(e,e+n));return s}(d,m.length,f,s):d},a.set(l,c)}let u=function(e,t,r){if("pointer"===t.path)return function(e,t,r){let i=t.extensions?.KHR_animation_pointer?.pointer;if("string"!=typeof i||!i.startsWith("/"))return C.R.warn("KHR_animation_pointer channel is missing a valid JSON pointer and will be skipped")(),null;let a=i.slice(1).split("/").map(e=>e.replace(/~1/g,"/").replace(/~0/g,"~"));switch(a[0]){case"nodes":var n,o,s,l,c,u,f,p,m=e,d=a,h=r,g=i;let b=5===d.length&&"extensions"===d[2]&&"KHR_node_visibility"===d[3]&&"visible"===d[4];if(3!==d.length&&!b)return ey(g,"node pointers must target transforms, morph weights, or KHR_node_visibility.visible"),null;let v=Number(d[1]),S=m.nodes[v];if(!Number.isInteger(v)||!S)return C.R.warn(`KHR_animation_pointer target ${g} references a missing node and will be skipped`)(),null;if(b&&"STEP"!==h.interpolation)return ey(g,"boolean visibility animation requires STEP interpolation"),null;let _=b?"visibility":eI(d[2]);return _?{type:"node",sampler:h,targetNodeId:S.id,path:_}:(ey(g,`node property "${d[2]}" has no runtime animation mapping`),null);case"materials":var x=e,R=a,T=r,M=i;if(R.length<3)return ey(M,"material pointers must include a material index and target property path"),null;let I=Number(R[1]),A=x.materials[I];if(!Number.isInteger(I)||!A)return C.R.warn(`KHR_animation_pointer target ${M} references a missing material and will be skipped`)(),null;let y=function(e,t){let r=function(e,t){let r,i=t.lastIndexOf("extensions");if(i<0||"KHR_texture_transform"!==t[i+1]||i<1)return{reason:"not-a-texture-transform-target"};let a=(0,eb.Mg)(t.slice(0,i));if(!a)return{reason:function(e){let t=eA(e);if(t){let e=eR[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`texture-transform target "${e.join("/")}" has no runtime texture-slot mapping`}(t.slice(0,i))};let n=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,a.pathSegments);if(!n)return{reason:`texture-transform target "${t.slice(0,i).join("/")}" does not exist on the referenced material`};let o=t[i+2];if("texCoord"===o)return{reason:"animated KHR_texture_transform.texCoord is unsupported because texCoord selection is structural, not a runtime float/vector update"};if("offset"!==o&&"rotation"!==o&&"scale"!==o)return{reason:`KHR_texture_transform property "${o}" is not animatable; supported properties are offset, rotation, and scale`};let s=t[i+3];if(t.length>i+4)return{reason:`KHR_texture_transform.${o} does not support nested property paths`};if(void 0!==s){if(r=Number(s),"rotation"===o)return{reason:"KHR_texture_transform.rotation does not support component indices"};if(!Number.isInteger(r)||r<0||r>1)return{reason:`KHR_texture_transform.${o} component index "${s}" is invalid; only 0 and 1 are supported`}}return{type:"textureTransform",textureSlot:a.slot,path:o,component:r,baseTransform:(0,eb.e3)(n)}}(e,t);if(!("reason"in r)||"not-a-texture-transform-target"!==r.reason)return r;switch(t.join("/")){case"pbrMetallicRoughness/baseColorFactor":return e.pbrMetallicRoughness?{type:"material",property:"baseColorFactor"}:{reason:eC(t)};case"pbrMetallicRoughness/metallicFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:0}:{reason:eC(t)};case"pbrMetallicRoughness/roughnessFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:1}:{reason:eC(t)};case"normalTexture/scale":return e.normalTexture?{type:"material",property:"normalScale"}:{reason:eC(t)};case"occlusionTexture/strength":return e.occlusionTexture?{type:"material",property:"occlusionStrength"}:{reason:eC(t)};case"emissiveFactor":return{type:"material",property:"emissiveFactor"};case"alphaCutoff":return{type:"material",property:"alphaCutoff"};case"extensions/KHR_materials_specular/specularFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularIntensityFactor"}:{reason:eC(t)};case"extensions/KHR_materials_specular/specularColorFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularColorFactor"}:{reason:eC(t)};case"extensions/KHR_materials_ior/ior":return e.extensions?.KHR_materials_ior?{type:"material",property:"ior"}:{reason:eC(t)};case"extensions/EXT_materials_bump/bumpFactor":return e.extensions?.EXT_materials_bump?{type:"material",property:"bumpFactor"}:{reason:eC(t)};case"extensions/KHR_materials_diffuse_transmission/diffuseTransmissionFactor":return e.extensions?.KHR_materials_diffuse_transmission?{type:"material",property:"diffuseTransmissionFactor"}:{reason:eC(t)};case"extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorFactor":return e.extensions?.KHR_materials_diffuse_transmission?{type:"material",property:"diffuseTransmissionColorFactor"}:{reason:eC(t)};case"extensions/KHR_materials_volume_scatter/multiscatterColorFactor":case"extensions/KHR_materials_volume_scatter/multiscatterColor":return e.extensions?.KHR_materials_volume_scatter?{type:"material",property:"multiscatterColorFactor"}:{reason:eC(t)};case"extensions/KHR_materials_volume_scatter/scatterAnisotropy":return e.extensions?.KHR_materials_volume_scatter?{type:"material",property:"scatterAnisotropy"}:{reason:eC(t)};case"extensions/KHR_materials_dispersion/dispersion":return e.extensions?.KHR_materials_dispersion?{type:"material",property:"dispersion"}:{reason:eC(t)};case"extensions/KHR_materials_transmission/transmissionFactor":return e.extensions?.KHR_materials_transmission?{type:"material",property:"transmissionFactor"}:{reason:eC(t)};case"extensions/KHR_materials_volume/thicknessFactor":return e.extensions?.KHR_materials_volume?{type:"material",property:"thicknessFactor"}:{reason:eC(t)};case"extensions/KHR_materials_volume/attenuationDistance":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationDistance"}:{reason:eC(t)};case"extensions/KHR_materials_volume/attenuationColor":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationColor"}:{reason:eC(t)};case"extensions/KHR_materials_clearcoat/clearcoatFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatFactor"}:{reason:eC(t)};case"extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatRoughnessFactor"}:{reason:eC(t)};case"extensions/KHR_materials_sheen/sheenColorFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenColorFactor"}:{reason:eC(t)};case"extensions/KHR_materials_sheen/sheenRoughnessFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenRoughnessFactor"}:{reason:eC(t)};case"extensions/KHR_materials_iridescence/iridescenceFactor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceFactor"}:{reason:eC(t)};case"extensions/KHR_materials_iridescence/iridescenceIor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceIor"}:{reason:eC(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMinimum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:0}:{reason:eC(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMaximum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:1}:{reason:eC(t)};case"extensions/KHR_materials_anisotropy/anisotropyStrength":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyStrength"}:{reason:eC(t)};case"extensions/KHR_materials_anisotropy/anisotropyRotation":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyRotation"}:{reason:eC(t)};case"extensions/KHR_materials_emissive_strength/emissiveStrength":return e.extensions?.KHR_materials_emissive_strength?{type:"material",property:"emissiveStrength"}:{reason:eC(t)};default:return{reason:eC(t)}}}(A,R.slice(2));return"reason"in y?(ey(M,y.reason),null):{sampler:T,pointer:M,targetMaterialIndex:I,...y};case"cameras":let N,E,U,w;return n=e,o=a,s=r,l=i,N=Number(o[1]),E=n.cameras?.[N],U=o[2],w=o[3],4===o.length&&Number.isInteger(N)&&E&&("perspective"===U||"orthographic"===U)&&E.type===U&&("perspective"===U?["aspectRatio","yfov","znear","zfar"]:["xmag","ymag","znear","zfar"]).includes(w)?{type:"camera",sampler:s,pointer:l,targetCameraIndex:N,projection:U,property:w}:(ey(l,"camera pointers must target a supported projection property"),null);case"extensions":if("KHR_lights_punctual"===a[1]){let t,n,o,s,l,m;return c=e,u=a,f=r,p=i,t=Number(u[3]),n=c.lights||c.extensions?.KHR_lights_punctual?.lights,s=(o="spot"===u[4])?u[5]:u[4],l=o||"color"!==s?void 0:u[5],m=o||void 0!==l?6:5,"lights"===u[2]&&u.length===m&&Number.isInteger(t)&&Array.isArray(n)&&n[t]&&["color","intensity","range","innerConeAngle","outerConeAngle"].includes(s)&&(!o||"innerConeAngle"===s||"outerConeAngle"===s)&&(void 0===l||/^[0-2]$/.test(l)&&"color"===s)?{type:"light",sampler:f,pointer:p,targetLightIndex:t,property:s,...void 0===l?{}:{component:Number(l)}}:(ey(p,"punctual-light pointers must target supported typed light properties"),null)}}return ey(i,`top-level target "${a[0]}" has no runtime animation mapping`),null}(e,t,r);let i=eI(t.path);if(!i)return null;let a=e.nodes[t.node??0];if(!a)throw Error(`Cannot find animation target ${t.node}`);return{type:"node",sampler:r,targetNodeId:a.id,path:i}}(t,i,c);return u?[u]:[]});return s.length?[{name:i,channels:s}]:[]})),d=(t.lights||t.extensions?.KHR_lights_punctual?.lights||[]).map(e=>({...e,...Array.isArray(e.color)?{color:[...e.color]}:{},...e.spot?{spot:{...e.spot}}:{}})),h=(t.cameras||[]).map(e=>{let t={...e};return e.perspective&&(t.perspective={...e.perspective}),e.orthographic&&(t.orthographic={...e.orthographic}),t}),b={useByteColors:r?.useByteColors??!0,nodeVisibility:u,lightDefinitions:d},S=en(t,b),_=()=>{S.splice(0,S.length,...en(t,b))},x=new eS({onVisibilityChange:_,cameras:h,lightDefinitions:d,onLightChange:_,animations:m,gltfNodeIdToNodeMap:u,materials:l}),R=new eU(t,s),I=eT(t,e),A=s.map(e=>eP(e.getBounds())),y=function(e){let t=null;for(let r of e)if(r.bounds){if(!t){t=[[...r.bounds[0]],[...r.bounds[1]]];continue}for(let e=0;e<3;e++)t[0][e]=Math.min(t[0][e],r.bounds[0][e]),t[1][e]=Math.max(t[1][e],r.bounds[1][e])}return eP(t)}(A),N=new e_({device:e,gltf:t,scenes:s,gltfNodeIndexToNodeMap:f});x.setUpdateHandler(()=>N.update());let E=!1;return{scenes:s,materials:l,variants:R,cameras:h,animator:x,animations:m,lights:S,extensionSupport:I,sceneBounds:A,modelBounds:y,gltfMeshIdToNodeMap:c,gltfNodeIdToNodeMap:u,gltfNodeIndexToNodeMap:f,skins:N,gltf:t,destroy:()=>{if(E)return;E=!0,N.destroy();let e=new Set([...s,...c.values(),...u.values()]),t=new Set,r=new Set(l);for(let a of e)a.preorderTraversal(e=>{e instanceof i.s&&(t.add(e),e.model?.material&&r.add(e.model.material))});for(let e of t)e.destroy();for(let t of e)t.destroy();for(let e of r)e.destroy();for(let e of p)e.destroy();p.clear()}}}function eP(e){if(!e)return{bounds:null,center:[0,0,0],size:[0,0,0],radius:.5,recommendedOrbitDistance:1};let t=[[e[0][0],e[0][1],e[0][2]],[e[1][0],e[1][1],e[1][2]]],r=[t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]],i=[t[0][0]+.5*r[0],t[0][1]+.5*r[1],t[0][2]+.5*r[2]],a=.5*Math.max(r[0],r[1],r[2]),n=Math.max(.5*Math.hypot(r[0],r[1],r[2]),.001);return{bounds:t,center:i,size:r,radius:n,recommendedOrbitDistance:Math.max(Math.max(a,.001)/Math.tan(Math.PI/6)*1.15,1.1*n)}}},27282(e,t,r){r.d(t,{lO:()=>u});var i=r(13559),a=r(38550),n=r(74788),o=r(29244),s=r(92397);function l(e){switch(e){case s.n.CLAMP_TO_EDGE:return"clamp-to-edge";case s.n.REPEAT:return"repeat";case s.n.MIRRORED_REPEAT:return"mirror-repeat";default:return}}let c={NORMAL:["NORMAL","normals"],TANGENT:["TANGENT"],TEXCOORD_0:["TEXCOORD_0","texCoords"],TEXCOORD_1:["TEXCOORD_1","texCoords1"],JOINTS_0:["JOINTS_0"],WEIGHTS_0:["WEIGHTS_0"],JOINTS_1:["JOINTS_1"],WEIGHTS_1:["WEIGHTS_1"],COLOR_0:["COLOR_0","colors"]};function u(e,t,r,a){let n={defines:{MANUAL_SRGB:!0},bindings:{},uniforms:{camera:[0,0,0],metallicRoughnessValues:[1,1]},parameters:{},glParameters:{},generatedTextures:[]};n.defines.USE_TEX_LOD=!0;let{imageBasedLightingEnvironment:o}=a;return o&&(n.bindings.pbr_diffuseEnvSampler=o.diffuseEnvSampler.texture,n.bindings.pbr_specularEnvSampler=o.specularEnvSampler.texture,n.bindings.pbr_brdfLUT=o.brdfLutTexture.texture,n.uniforms.IBLenabled=!0,n.uniforms.scaleIBLAmbient=[1,1]),a?.pbrDebug&&(n.defines.PBR_DEBUG=!0,n.uniforms.scaleDiffBaseMR=[0,0,0,0],n.uniforms.scaleFGDSpec=[0,0,0,0]),p(r,"NORMAL")&&(n.defines.HAS_NORMALS=!0),p(r,"TANGENT")&&a?.useTangents&&(n.defines.HAS_TANGENTS=!0),p(r,"TEXCOORD_0")&&(n.defines.HAS_UV=!0),p(r,"TEXCOORD_1")&&(n.defines.HAS_UV_1=!0),p(r,"JOINTS_0")&&p(r,"WEIGHTS_0")&&(n.defines.HAS_SKIN=!0),n.defines.HAS_SKIN&&p(r,"JOINTS_1")&&p(r,"WEIGHTS_1")&&(n.defines.HAS_SKIN_1=!0),p(r,"COLOR_0")&&(n.defines.HAS_COLORS=!0),a?.imageBasedLightingEnvironment&&(n.defines.USE_IBL=!0),a?.lights&&(n.defines.USE_LIGHTS=!0),t&&(!1!==a.validateAttributes&&function(e,t){let r=f(e,0);r.length>0&&!p(t,"TEXCOORD_0")&&i.R.warn(`glTF material uses ${r.join(", ")} but primitive is missing TEXCOORD_0; textured shading will sample the default UV coordinates`)();let a=f(e,1);if(a.length>0&&!p(t,"TEXCOORD_1")&&i.R.warn(`glTF material uses ${a.join(", ")} with TEXCOORD_1 but primitive is missing TEXCOORD_1; those textures will be skipped`)(),e.unlit||e.extensions?.KHR_materials_unlit||p(t,"NORMAL"))return;let n=e.normalTexture?"lit PBR shading with normalTexture":"lit PBR shading";i.R.warn(`glTF primitive is missing NORMAL while using ${n}; shading will fall back to geometric normals`)()}(t,r),function(e,t,r,a,n){if(r.uniforms.unlit=!!(t.unlit||t.extensions?.KHR_materials_unlit),t.pbrMetallicRoughness&&function(e,t,r,i,a){t.baseColorTexture&&m(e,t.baseColorTexture,"pbr_baseColorSampler",r,{featureOptions:{define:"HAS_BASECOLORMAP",enabledUniformName:"baseColorMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"baseColor"}),r.uniforms.baseColorFactor=t.baseColorFactor||[1,1,1,1],t.metallicRoughnessTexture&&m(e,t.metallicRoughnessTexture,"pbr_metallicRoughnessSampler",r,{featureOptions:{define:"HAS_METALROUGHNESSMAP",enabledUniformName:"metallicRoughnessMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"metallicRoughness"});let{metallicFactor:n=1,roughnessFactor:o=1}=t;r.uniforms.metallicRoughnessValues=[n,o]}(e,t.pbrMetallicRoughness,r,a,n),t.normalTexture){m(e,t.normalTexture,"pbr_normalSampler",r,{featureOptions:{define:"HAS_NORMALMAP",enabledUniformName:"normalMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"normal"});let{scale:i=1}=t.normalTexture;r.uniforms.normalScale=i}if(t.occlusionTexture){m(e,t.occlusionTexture,"pbr_occlusionSampler",r,{featureOptions:{define:"HAS_OCCLUSIONMAP",enabledUniformName:"occlusionMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"occlusion"});let{strength:i=1}=t.occlusionTexture;r.uniforms.occlusionStrength=i}switch(r.uniforms.emissiveFactor=t.emissiveFactor||[0,0,0],t.emissiveTexture&&m(e,t.emissiveTexture,"pbr_emissiveSampler",r,{featureOptions:{define:"HAS_EMISSIVEMAP",enabledUniformName:"emissiveMapEnabled"},gltf:n,attributes:a,textureTransformSlot:"emissive"}),function(e,t,r,a,n={}){var o,l,c,u,f,p,d;t&&(((o=t).KHR_materials_specular||o.KHR_materials_ior||o.EXT_materials_bump||o.KHR_materials_transmission||o.KHR_materials_diffuse_transmission||o.KHR_materials_volume||o.KHR_materials_volume_scatter||o.KHR_materials_dispersion||o.KHR_materials_clearcoat||o.KHR_materials_sheen||o.KHR_materials_iridescence||o.KHR_materials_anisotropy)&&(r.defines.USE_MATERIAL_EXTENSIONS=!0),function(e,t,r,i,a={}){t&&(t.specularColorFactor&&(r.uniforms.specularColorFactor=t.specularColorFactor),void 0!==t.specularFactor&&(r.uniforms.specularIntensityFactor=t.specularFactor),t.specularColorTexture&&m(e,t.specularColorTexture,"pbr_specularColorSampler",r,{featureOptions:{define:"HAS_SPECULARCOLORMAP",enabledUniformName:"specularColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"specularColor"}),t.specularTexture&&m(e,t.specularTexture,"pbr_specularIntensitySampler",r,{featureOptions:{define:"HAS_SPECULARINTENSITYMAP",enabledUniformName:"specularIntensityMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"specularIntensity"}))}(e,t.KHR_materials_specular,r,a,n),l=t.KHR_materials_ior,c=r,l?.ior!==void 0&&(c.uniforms.ior=l.ior),function(e,t,r,i,a={}){t&&(r.uniforms.bumpFactor=Math.max(t.bumpFactor??1,0),t.bumpTexture&&m(e,t.bumpTexture,"pbr_bumpSampler",r,{featureOptions:{define:"HAS_BUMPMAP",enabledUniformName:"bumpMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"bump"}))}(e,t.EXT_materials_bump,r,a,n),function(e,t,r,a,n={}){t&&(void 0!==t.transmissionFactor&&(r.uniforms.transmissionFactor=t.transmissionFactor),t.transmissionTexture&&m(e,t.transmissionTexture,"pbr_transmissionSampler",r,{featureOptions:{define:"HAS_TRANSMISSIONMAP",enabledUniformName:"transmissionMapEnabled"},gltf:a,attributes:n,textureTransformSlot:"transmission"}),(t.transmissionFactor??0)>0||t.transmissionTexture)&&(i.R.warn("KHR_materials_transmission uses a premultiplied-alpha blending approximation and may require mesh sorting")(),r.parameters.blend=!0,r.parameters.depthWriteEnabled=!1,r.parameters.blendColorOperation="add",r.parameters.blendColorSrcFactor="one",r.parameters.blendColorDstFactor="one-minus-src-alpha",r.parameters.blendAlphaOperation="add",r.parameters.blendAlphaSrcFactor="one",r.parameters.blendAlphaDstFactor="one-minus-src-alpha",r.glParameters.blend=!0,r.glParameters.depthMask=!1,r.glParameters.blendEquation=s.n.FUNC_ADD,r.glParameters.blendFunc=[s.n.ONE,s.n.ONE_MINUS_SRC_ALPHA,s.n.ONE,s.n.ONE_MINUS_SRC_ALPHA])}(e,t.KHR_materials_transmission,r,a,n),function(e,t,r,i,a={}){t&&(r.uniforms.diffuseTransmissionFactor=Math.min(Math.max(t.diffuseTransmissionFactor??0,0),1),r.uniforms.diffuseTransmissionColorFactor=t.diffuseTransmissionColorFactor||[1,1,1],t.diffuseTransmissionTexture&&m(e,t.diffuseTransmissionTexture,"pbr_diffuseTransmissionSampler",r,{featureOptions:{define:"HAS_DIFFUSETRANSMISSIONMAP",enabledUniformName:"diffuseTransmissionMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"diffuseTransmission"}),t.diffuseTransmissionColorTexture&&m(e,t.diffuseTransmissionColorTexture,"pbr_diffuseTransmissionColorSampler",r,{featureOptions:{define:"HAS_DIFFUSETRANSMISSIONCOLORMAP",enabledUniformName:"diffuseTransmissionColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"diffuseTransmissionColor"}))}(e,t.KHR_materials_diffuse_transmission,r,a,n),function(e,t,r,i,a={}){t&&(void 0!==t.thicknessFactor&&(r.uniforms.thicknessFactor=t.thicknessFactor),t.thicknessTexture&&m(e,t.thicknessTexture,"pbr_thicknessSampler",r,{featureOptions:{define:"HAS_THICKNESSMAP"},gltf:i,attributes:a,textureTransformSlot:"thickness"}),void 0!==t.attenuationDistance&&(r.uniforms.attenuationDistance=t.attenuationDistance),t.attenuationColor&&(r.uniforms.attenuationColor=t.attenuationColor))}(e,t.KHR_materials_volume,r,a,n),function(e,t,r,i,a,n={}){t&&r&&(i.uniforms.multiscatterColorFactor=t.multiscatterColorFactor||t.multiscatterColor||[0,0,0],i.uniforms.scatterAnisotropy=Math.min(Math.max(t.scatterAnisotropy??0,-.999),.999),t.multiscatterColorTexture&&m(e,t.multiscatterColorTexture,"pbr_multiscatterColorSampler",i,{featureOptions:{define:"HAS_MULTISCATTERCOLORMAP",enabledUniformName:"multiscatterColorMapEnabled"},gltf:a,attributes:n,textureTransformSlot:"multiscatterColor"}))}(e,t.KHR_materials_volume_scatter,t.KHR_materials_volume,r,a,n),u=t.KHR_materials_dispersion,f=r,u?.dispersion!==void 0&&(f.uniforms.dispersion=Math.max(u.dispersion,0)),function(e,t,r,i,a={}){t&&(void 0!==t.clearcoatFactor&&(r.uniforms.clearcoatFactor=t.clearcoatFactor),void 0!==t.clearcoatRoughnessFactor&&(r.uniforms.clearcoatRoughnessFactor=t.clearcoatRoughnessFactor),t.clearcoatTexture&&m(e,t.clearcoatTexture,"pbr_clearcoatSampler",r,{featureOptions:{define:"HAS_CLEARCOATMAP",enabledUniformName:"clearcoatMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"clearcoat"}),t.clearcoatRoughnessTexture&&m(e,t.clearcoatRoughnessTexture,"pbr_clearcoatRoughnessSampler",r,{featureOptions:{define:"HAS_CLEARCOATROUGHNESSMAP",enabledUniformName:"clearcoatRoughnessMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"clearcoatRoughness"}),t.clearcoatNormalTexture&&m(e,t.clearcoatNormalTexture,"pbr_clearcoatNormalSampler",r,{featureOptions:{define:"HAS_CLEARCOATNORMALMAP"},gltf:i,attributes:a,textureTransformSlot:"clearcoatNormal"}))}(e,t.KHR_materials_clearcoat,r,a,n),function(e,t,r,i,a={}){t&&(t.sheenColorFactor&&(r.uniforms.sheenColorFactor=t.sheenColorFactor),void 0!==t.sheenRoughnessFactor&&(r.uniforms.sheenRoughnessFactor=t.sheenRoughnessFactor),t.sheenColorTexture&&m(e,t.sheenColorTexture,"pbr_sheenColorSampler",r,{featureOptions:{define:"HAS_SHEENCOLORMAP",enabledUniformName:"sheenColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"sheenColor"}),t.sheenRoughnessTexture&&m(e,t.sheenRoughnessTexture,"pbr_sheenRoughnessSampler",r,{featureOptions:{define:"HAS_SHEENROUGHNESSMAP",enabledUniformName:"sheenRoughnessMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"sheenRoughness"}))}(e,t.KHR_materials_sheen,r,a,n),function(e,t,r,i,a={}){t&&(void 0!==t.iridescenceFactor&&(r.uniforms.iridescenceFactor=t.iridescenceFactor),void 0!==t.iridescenceIor&&(r.uniforms.iridescenceIor=t.iridescenceIor),(void 0!==t.iridescenceThicknessMinimum||void 0!==t.iridescenceThicknessMaximum)&&(r.uniforms.iridescenceThicknessRange=[t.iridescenceThicknessMinimum??100,t.iridescenceThicknessMaximum??400]),t.iridescenceTexture&&m(e,t.iridescenceTexture,"pbr_iridescenceSampler",r,{featureOptions:{define:"HAS_IRIDESCENCEMAP",enabledUniformName:"iridescenceMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"iridescence"}),t.iridescenceThicknessTexture&&m(e,t.iridescenceThicknessTexture,"pbr_iridescenceThicknessSampler",r,{featureOptions:{define:"HAS_IRIDESCENCETHICKNESSMAP"},gltf:i,attributes:a,textureTransformSlot:"iridescenceThickness"}))}(e,t.KHR_materials_iridescence,r,a,n),function(e,t,r,i,a={}){t&&(void 0!==t.anisotropyStrength&&(r.uniforms.anisotropyStrength=t.anisotropyStrength),void 0!==t.anisotropyRotation&&(r.uniforms.anisotropyRotation=t.anisotropyRotation),t.anisotropyTexture&&m(e,t.anisotropyTexture,"pbr_anisotropySampler",r,{featureOptions:{define:"HAS_ANISOTROPYMAP",enabledUniformName:"anisotropyMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"anisotropy"}))}(e,t.KHR_materials_anisotropy,r,a,n),p=t.KHR_materials_emissive_strength,d=r,p?.emissiveStrength!==void 0&&(d.uniforms.emissiveStrength=p.emissiveStrength))}(e,t.extensions,r,n,a),t.alphaMode||"OPAQUE"){case"OPAQUE":break;case"MASK":{let{alphaCutoff:e=.5}=t;r.defines.ALPHA_CUTOFF=!0,r.uniforms.alphaCutoffEnabled=!0,r.uniforms.alphaCutoff=e;break}case"BLEND":var o;i.R.warn("glTF BLEND alphaMode might not work well because it requires mesh sorting")(),(o=r).parameters.blend=!0,o.parameters.blendColorOperation="add",o.parameters.blendColorSrcFactor="src-alpha",o.parameters.blendColorDstFactor="one-minus-src-alpha",o.parameters.blendAlphaOperation="add",o.parameters.blendAlphaSrcFactor="one",o.parameters.blendAlphaDstFactor="one-minus-src-alpha",o.glParameters.blend=!0,o.glParameters.blendEquation=s.n.FUNC_ADD,o.glParameters.blendFunc=[s.n.SRC_ALPHA,s.n.ONE_MINUS_SRC_ALPHA,s.n.ONE,s.n.ONE_MINUS_SRC_ALPHA]}}(e,t,n,r,a.gltf)),n}function f(e,t){let r=[];for(let i of(0,o.ii)()){let a=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,i.pathSegments);a&&(0,o.CC)(a)===t&&r.push(i.displayName)}return r}function p(e,t){return c[t].some(t=>!!e[t])}function m(e,t,r,c,u={}){let{featureOptions:f={},gltf:g,attributes:b={},textureTransformSlot:v}=u,{define:S,enabledUniformName:_}=f,x=(0,o.CC)(t);if(x>1)return void i.R.warn(`Skipping ${String(r)} because ${x} is not supported; only TEXCOORD_0 and TEXCOORD_1 are currently available`)();if(1===x&&!p(b,"TEXCOORD_1"))return void i.R.warn(`Skipping ${String(r)} because it requires TEXCOORD_1 but the primitive does not provide TEXCOORD_1`)();let R=function(e,t){if(e.texture||void 0===e.index||!t?.textures)return e;let r=t.textures[e.index];return r?"texture"in r&&r.texture?{...r,...e,texture:r.texture}:"source"in r?{...e,texture:r}:e:e}(t,g),T=R.texture?.source?.image;if(!T)return void i.R.warn(`Skipping unresolved glTF texture for ${String(r)}`)();let M=function(e,t,r){if("compressed"in t)return function(e,t,r){let o;if(0===(o=Array.isArray(t.data)&&t.data[0]?.data?t.data:"mipmaps"in t&&Array.isArray(t.mipmaps)?t.mipmaps:[]).length||!o[0]?.data)return i.R.warn("createCompressedTexture: compressed image has no valid mip levels, creating fallback")(),d(e,r);let s=o[0],l=s.width??t.width??0,c=s.height??t.height??0;if(l<=0||c<=0)return i.R.warn("createCompressedTexture: base level has invalid dimensions, creating fallback")(),d(e,r);let u=h(s);if(!u)return i.R.warn("createCompressedTexture: compressed image has no textureFormat, creating fallback")(),d(e,r);if(!e.isTextureFormatSupported(u))return i.R.warn(`createCompressedTexture: ${e.type} device does not support '${u}', creating fallback`)(),d(e,r);let f=function(e,t,r){let{blockWidth:i=1,blockHeight:a=1}=n.vz.getInfo(r),o=1;for(let r=1;;r++){let n=Math.max(1,e>>r),s=Math.max(1,t>>r);if(n<i||s<a)break;o++}return o}(l,c,u),p=Math.min(o.length,f),m=1;for(let e=1;e<p;e++){let t=o[e];if(!t.data||t.width<=0||t.height<=0){i.R.warn(`createCompressedTexture: mip level ${e} has invalid data/dimensions, truncating`)();break}let r=h(t);if(r&&r!==u){i.R.warn(`createCompressedTexture: mip level ${e} format '${r}' differs from base '${u}', truncating`)();break}let a=Math.max(1,l>>e),n=Math.max(1,c>>e);if(t.width!==a||t.height!==n){i.R.warn(`createCompressedTexture: mip level ${e} dimensions ${t.width}x${t.height} don't match expected ${a}x${n}, truncating`)();break}m++}let g=e.createTexture({...r,format:u,usage:a.g.TEXTURE|a.g.COPY_DST,width:l,height:c,mipLevels:m,data:s.data});for(let e=1;e<m;e++)g.writeData(o[e].data,{width:o[e].width,height:o[e].height,mipLevel:e});return g}(e,t,{id:r.id,sampler:r.sampler});let o=void 0!==r.width&&void 0!==r.height?{width:r.width,height:r.height}:e.getExternalImageSize(t),s="nearest"===r.sampler.mipmapFilter||"linear"===r.sampler.mipmapFilter,l=s?e.getMipLevelCount(o.width,o.height):1,c=e.createTexture({id:r.id,sampler:r.sampler,width:o.width,height:o.height,mipLevels:l,...s?{usage:a.g.SAMPLE|a.g.RENDER|a.g.COPY_DST|a.g.COPY_SRC}:{},...r.colorSpace?{format:"srgb"===r.colorSpace?"rgba8unorm-srgb":"rgba8unorm"}:{},data:t});return l>1&&("webgl"===e.type?c.generateMipmapsWebGL():"webgpu"===e.type&&e.generateMipmapsWebGPU(c)),c}(e,T,{id:R.uniformName||R.id,sampler:{addressModeU:"repeat",addressModeV:"repeat",minFilter:"linear",magFilter:"linear",...function(e={}){let t=e.wrapS??e.parameters?.[s.n.TEXTURE_WRAP_S],r=e.wrapT??e.parameters?.[s.n.TEXTURE_WRAP_T],i=e.magFilter??e.parameters?.[s.n.TEXTURE_MAG_FILTER],a=e.minFilter??e.parameters?.[s.n.TEXTURE_MIN_FILTER],n=l(t),o=l(r),c=function(e){switch(e){case s.n.NEAREST:return"nearest";case s.n.LINEAR:return"linear";default:return}}(i);return{...n?{addressModeU:n}:{},...o?{addressModeV:o}:{},...c?{magFilter:c}:{},...function(e){switch(e){case s.n.NEAREST:return{minFilter:"nearest"};case s.n.LINEAR:return{minFilter:"linear"};case s.n.NEAREST_MIPMAP_NEAREST:return{minFilter:"nearest",mipmapFilter:"nearest"};case s.n.LINEAR_MIPMAP_NEAREST:return{minFilter:"linear",mipmapFilter:"nearest"};case s.n.NEAREST_MIPMAP_LINEAR:return{minFilter:"nearest",mipmapFilter:"linear"};case s.n.LINEAR_MIPMAP_LINEAR:return{minFilter:"linear",mipmapFilter:"linear"};default:return{}}}(a)}}(R.texture.sampler)}});if(c.bindings[r]=M,S&&(c.defines[S]=!0),_&&(c.uniforms[_]=!0),v){let e=(0,o.lz)(v);c.uniforms[e.uvSetUniform]=x,c.uniforms[e.uvTransformUniform]=(0,o.VJ)((0,o.e3)(t))}c.generatedTextures.push(M)}function d(e,t){return e.createTexture({...t,format:"rgba8unorm",width:1,height:1,mipLevels:1})}function h(e){return e.textureFormat}},29244(e,t,r){r.d(t,{CC:()=>u,Mg:()=>f,VJ:()=>p,dy:()=>m,e3:()=>c,ii:()=>s,lz:()=>l});var i=r(68936);let a=[o("baseColor","pbr_baseColorSampler","baseColorTexture",["pbrMetallicRoughness","baseColorTexture"]),o("metallicRoughness","pbr_metallicRoughnessSampler","metallicRoughnessTexture",["pbrMetallicRoughness","metallicRoughnessTexture"]),o("normal","pbr_normalSampler","normalTexture",["normalTexture"]),o("occlusion","pbr_occlusionSampler","occlusionTexture",["occlusionTexture"]),o("emissive","pbr_emissiveSampler","emissiveTexture",["emissiveTexture"]),o("specularColor","pbr_specularColorSampler","KHR_materials_specular.specularColorTexture",["extensions","KHR_materials_specular","specularColorTexture"]),o("specularIntensity","pbr_specularIntensitySampler","KHR_materials_specular.specularTexture",["extensions","KHR_materials_specular","specularTexture"]),o("transmission","pbr_transmissionSampler","KHR_materials_transmission.transmissionTexture",["extensions","KHR_materials_transmission","transmissionTexture"]),o("thickness","pbr_thicknessSampler","KHR_materials_volume.thicknessTexture",["extensions","KHR_materials_volume","thicknessTexture"]),o("clearcoat","pbr_clearcoatSampler","KHR_materials_clearcoat.clearcoatTexture",["extensions","KHR_materials_clearcoat","clearcoatTexture"]),o("clearcoatRoughness","pbr_clearcoatRoughnessSampler","KHR_materials_clearcoat.clearcoatRoughnessTexture",["extensions","KHR_materials_clearcoat","clearcoatRoughnessTexture"]),o("clearcoatNormal","pbr_clearcoatNormalSampler","KHR_materials_clearcoat.clearcoatNormalTexture",["extensions","KHR_materials_clearcoat","clearcoatNormalTexture"]),o("sheenColor","pbr_sheenColorSampler","KHR_materials_sheen.sheenColorTexture",["extensions","KHR_materials_sheen","sheenColorTexture"]),o("sheenRoughness","pbr_sheenRoughnessSampler","KHR_materials_sheen.sheenRoughnessTexture",["extensions","KHR_materials_sheen","sheenRoughnessTexture"]),o("iridescence","pbr_iridescenceSampler","KHR_materials_iridescence.iridescenceTexture",["extensions","KHR_materials_iridescence","iridescenceTexture"]),o("iridescenceThickness","pbr_iridescenceThicknessSampler","KHR_materials_iridescence.iridescenceThicknessTexture",["extensions","KHR_materials_iridescence","iridescenceThicknessTexture"]),o("anisotropy","pbr_anisotropySampler","KHR_materials_anisotropy.anisotropyTexture",["extensions","KHR_materials_anisotropy","anisotropyTexture"]),o("bump","pbr_bumpSampler","EXT_materials_bump.bumpTexture",["extensions","EXT_materials_bump","bumpTexture"]),o("diffuseTransmission","pbr_diffuseTransmissionSampler","KHR_materials_diffuse_transmission.diffuseTransmissionTexture",["extensions","KHR_materials_diffuse_transmission","diffuseTransmissionTexture"]),o("diffuseTransmissionColor","pbr_diffuseTransmissionColorSampler","KHR_materials_diffuse_transmission.diffuseTransmissionColorTexture",["extensions","KHR_materials_diffuse_transmission","diffuseTransmissionColorTexture"]),o("multiscatterColor","pbr_multiscatterColorSampler","KHR_materials_volume_scatter.multiscatterColorTexture",["extensions","KHR_materials_volume_scatter","multiscatterColorTexture"])],n=new Map(a.map(e=>[e.slot,e]));function o(e,t,r,i){return{slot:e,binding:t,displayName:r,pathSegments:i,colorSpace:"baseColor"===e||"emissive"===e||"specularColor"===e||"sheenColor"===e||"diffuseTransmissionColor"===e||"multiscatterColor"===e?"srgb":"linear",uvSetUniform:`${e}UVSet`,uvTransformUniform:`${e}UVTransform`}}function s(){return a}function l(e){let t=n.get(e);if(!t)throw Error(`Unknown PBR texture transform slot ${e}`);return t}function c(e){let t=e?.extensions?.KHR_texture_transform;return{offset:t?.offset?[t.offset[0],t.offset[1]]:[0,0],rotation:t?.rotation??0,scale:t?.scale?[t.scale[0],t.scale[1]]:[1,1]}}function u(e){let t=e?.extensions?.KHR_texture_transform;return t?.texCoord??e?.texCoord??0}function f(e){return a.find(t=>t.pathSegments.length===e.length&&t.pathSegments.every((t,r)=>e[r]===t))||null}function p(e){let t=new i.d().set(1,0,0,0,1,0,e.offset[0],e.offset[1],1),r=new i.d().set(Math.cos(e.rotation),Math.sin(e.rotation),0,-Math.sin(e.rotation),Math.cos(e.rotation),0,0,0,1),a=new i.d().set(e.scale[0],0,0,0,e.scale[1],0,0,0,1);return Array.from(t.multiplyRight(r).multiplyRight(a))}function m(e,t){let r=new i.d(p(e)),a=new i.d(p(t)),n=new i.d(r).invert();return Array.from(a.multiplyRight(n))}},92397(e,t,r){var i,a;r.d(t,{n:()=>i}),(a=i||(i={}))[a.POINTS=0]="POINTS",a[a.LINES=1]="LINES",a[a.LINE_LOOP=2]="LINE_LOOP",a[a.LINE_STRIP=3]="LINE_STRIP",a[a.TRIANGLES=4]="TRIANGLES",a[a.TRIANGLE_STRIP=5]="TRIANGLE_STRIP",a[a.TRIANGLE_FAN=6]="TRIANGLE_FAN",a[a.ONE=1]="ONE",a[a.SRC_ALPHA=770]="SRC_ALPHA",a[a.ONE_MINUS_SRC_ALPHA=771]="ONE_MINUS_SRC_ALPHA",a[a.FUNC_ADD=32774]="FUNC_ADD",a[a.LINEAR=9729]="LINEAR",a[a.NEAREST=9728]="NEAREST",a[a.NEAREST_MIPMAP_NEAREST=9984]="NEAREST_MIPMAP_NEAREST",a[a.LINEAR_MIPMAP_NEAREST=9985]="LINEAR_MIPMAP_NEAREST",a[a.NEAREST_MIPMAP_LINEAR=9986]="NEAREST_MIPMAP_LINEAR",a[a.LINEAR_MIPMAP_LINEAR=9987]="LINEAR_MIPMAP_LINEAR",a[a.TEXTURE_MAG_FILTER=10240]="TEXTURE_MAG_FILTER",a[a.TEXTURE_MIN_FILTER=10241]="TEXTURE_MIN_FILTER",a[a.TEXTURE_WRAP_S=10242]="TEXTURE_WRAP_S",a[a.TEXTURE_WRAP_T=10243]="TEXTURE_WRAP_T",a[a.REPEAT=10497]="REPEAT",a[a.CLAMP_TO_EDGE=33071]="CLAMP_TO_EDGE",a[a.MIRRORED_REPEAT=33648]="MIRRORED_REPEAT",a[a.UNPACK_FLIP_Y_WEBGL=37440]="UNPACK_FLIP_Y_WEBGL"},9696(e,t,r){r.d(t,{s:()=>f});let i=`\
#ifdef USE_IBL
@group(2) @binding(auto) var pbr_diffuseEnvSampler: texture_cube<f32>;
@group(2) @binding(auto) var pbr_diffuseEnvSamplerSampler: sampler;
@group(2) @binding(auto) var pbr_specularEnvSampler: texture_cube<f32>;
@group(2) @binding(auto) var pbr_specularEnvSamplerSampler: sampler;
@group(2) @binding(auto) var pbr_brdfLUT: texture_2d<f32>;
@group(2) @binding(auto) var pbr_brdfLUTSampler: sampler;
#endif
`,a=`\
#ifdef USE_IBL
uniform samplerCube pbr_diffuseEnvSampler;
uniform samplerCube pbr_specularEnvSampler;
uniform sampler2D pbr_brdfLUT;
#endif
`;var n=r(70833);let o=`\
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
`,u=`\
struct pbrProjectionUniforms {
  modelViewProjectionMatrix: mat4x4<f32>,
  modelMatrix: mat4x4<f32>,
  normalMatrix: mat4x4<f32>,
  camera: vec3<f32>
};

@group(0) @binding(auto) var<uniform> pbrProjection: pbrProjectionUniforms;
`,f={props:{},uniforms:{},defaultUniforms:{unlit:!1,baseColorMapEnabled:!1,baseColorFactor:[1,1,1,1],normalMapEnabled:!1,normalScale:1,emissiveMapEnabled:!1,emissiveFactor:[0,0,0],metallicRoughnessValues:[1,1],metallicRoughnessMapEnabled:!1,occlusionMapEnabled:!1,occlusionStrength:1,alphaCutoffEnabled:!1,alphaCutoff:.5,IBLenabled:!1,scaleIBLAmbient:[1,1],scaleDiffBaseMR:[0,0,0,0],scaleFGDSpec:[0,0,0,0],specularColorFactor:[1,1,1],specularIntensityFactor:1,specularColorMapEnabled:!1,specularIntensityMapEnabled:!1,ior:1.5,transmissionFactor:0,transmissionMapEnabled:!1,thicknessFactor:0,attenuationDistance:1e9,attenuationColor:[1,1,1],clearcoatFactor:0,clearcoatRoughnessFactor:0,clearcoatMapEnabled:!1,clearcoatRoughnessMapEnabled:!1,sheenColorFactor:[0,0,0],sheenRoughnessFactor:0,sheenColorMapEnabled:!1,sheenRoughnessMapEnabled:!1,iridescenceFactor:0,iridescenceIor:1.3,iridescenceThicknessRange:[100,400],iridescenceMapEnabled:!1,anisotropyStrength:0,anisotropyRotation:0,anisotropyDirection:[1,0],anisotropyMapEnabled:!1,emissiveStrength:1,dispersion:0,baseColorUVSet:0,baseColorUVTransform:[1,0,0,0,1,0,0,0,1],metallicRoughnessUVSet:0,metallicRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],normalUVSet:0,normalUVTransform:[1,0,0,0,1,0,0,0,1],occlusionUVSet:0,occlusionUVTransform:[1,0,0,0,1,0,0,0,1],emissiveUVSet:0,emissiveUVTransform:[1,0,0,0,1,0,0,0,1],specularColorUVSet:0,specularColorUVTransform:[1,0,0,0,1,0,0,0,1],specularIntensityUVSet:0,specularIntensityUVTransform:[1,0,0,0,1,0,0,0,1],transmissionUVSet:0,transmissionUVTransform:[1,0,0,0,1,0,0,0,1],thicknessUVSet:0,thicknessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatUVSet:0,clearcoatUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatRoughnessUVSet:0,clearcoatRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatNormalUVSet:0,clearcoatNormalUVTransform:[1,0,0,0,1,0,0,0,1],sheenColorUVSet:0,sheenColorUVTransform:[1,0,0,0,1,0,0,0,1],sheenRoughnessUVSet:0,sheenRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceUVSet:0,iridescenceUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceThicknessUVSet:0,iridescenceThicknessUVTransform:[1,0,0,0,1,0,0,0,1],anisotropyUVSet:0,anisotropyUVTransform:[1,0,0,0,1,0,0,0,1],bumpFactor:1,bumpMapEnabled:!1,diffuseTransmissionFactor:0,diffuseTransmissionMapEnabled:!1,diffuseTransmissionColorFactor:[1,1,1],diffuseTransmissionColorMapEnabled:!1,multiscatterColorFactor:[0,0,0],multiscatterColorMapEnabled:!1,scatterAnisotropy:0,bumpUVSet:0,bumpUVTransform:[1,0,0,0,1,0,0,0,1],diffuseTransmissionUVSet:0,diffuseTransmissionUVTransform:[1,0,0,0,1,0,0,0,1],diffuseTransmissionColorUVSet:0,diffuseTransmissionColorUVTransform:[1,0,0,0,1,0,0,0,1],multiscatterColorUVSet:0,multiscatterColorUVTransform:[1,0,0,0,1,0,0,0,1]},name:"pbrMaterial",firstBindingSlot:0,bindingLayout:[{name:"pbrMaterial",group:3},{name:"pbr_baseColorSampler",group:3},{name:"pbr_normalSampler",group:3},{name:"pbr_emissiveSampler",group:3},{name:"pbr_metallicRoughnessSampler",group:3},{name:"pbr_occlusionSampler",group:3},{name:"pbr_specularColorSampler",group:3},{name:"pbr_specularIntensitySampler",group:3},{name:"pbr_transmissionSampler",group:3},{name:"pbr_thicknessSampler",group:3},{name:"pbr_clearcoatSampler",group:3},{name:"pbr_clearcoatRoughnessSampler",group:3},{name:"pbr_clearcoatNormalSampler",group:3},{name:"pbr_sheenColorSampler",group:3},{name:"pbr_sheenRoughnessSampler",group:3},{name:"pbr_iridescenceSampler",group:3},{name:"pbr_iridescenceThicknessSampler",group:3},{name:"pbr_anisotropySampler",group:3},{name:"pbr_bumpSampler",group:3},{name:"pbr_diffuseTransmissionSampler",group:3},{name:"pbr_diffuseTransmissionColorSampler",group:3},{name:"pbr_multiscatterColorSampler",group:3}],dependencies:[n.x,{name:"ibl",firstBindingSlot:32,bindingLayout:[{name:"pbr_diffuseEnvSampler",group:2},{name:"pbr_specularEnvSampler",group:2},{name:"pbr_brdfLUT",group:2}],source:i,vs:a,fs:a},{name:"pbrProjection",bindingLayout:[{name:"pbrProjection",group:0}],source:u,vs:c,fs:c,getUniforms:e=>e,uniformTypes:{modelViewProjectionMatrix:"mat4x4<f32>",modelMatrix:"mat4x4<f32>",normalMatrix:"mat4x4<f32>",camera:"vec3<f32>"}}],source:l,vs:o,fs:s,defines:{LIGHTING_FRAGMENT:!0,HAS_NORMALMAP:!1,HAS_EMISSIVEMAP:!1,HAS_OCCLUSIONMAP:!1,HAS_BASECOLORMAP:!1,HAS_METALROUGHNESSMAP:!1,HAS_SPECULARCOLORMAP:!1,HAS_SPECULARINTENSITYMAP:!1,HAS_TRANSMISSIONMAP:!1,HAS_THICKNESSMAP:!1,HAS_CLEARCOATMAP:!1,HAS_CLEARCOATROUGHNESSMAP:!1,HAS_CLEARCOATNORMALMAP:!1,HAS_SHEENCOLORMAP:!1,HAS_SHEENROUGHNESSMAP:!1,HAS_IRIDESCENCEMAP:!1,HAS_IRIDESCENCETHICKNESSMAP:!1,HAS_ANISOTROPYMAP:!1,HAS_BUMPMAP:!1,HAS_DIFFUSETRANSMISSIONMAP:!1,HAS_DIFFUSETRANSMISSIONCOLORMAP:!1,HAS_MULTISCATTERCOLORMAP:!1,USE_MATERIAL_EXTENSIONS:!1,ALPHA_CUTOFF:!1,USE_IBL:!1,PBR_DEBUG:!1},getUniforms:e=>e,uniformTypes:{unlit:"i32",baseColorMapEnabled:"i32",baseColorFactor:"vec4<f32>",normalMapEnabled:"i32",normalScale:"f32",emissiveMapEnabled:"i32",emissiveFactor:"vec3<f32>",metallicRoughnessValues:"vec2<f32>",metallicRoughnessMapEnabled:"i32",occlusionMapEnabled:"i32",occlusionStrength:"f32",alphaCutoffEnabled:"i32",alphaCutoff:"f32",specularColorFactor:"vec3<f32>",specularIntensityFactor:"f32",specularColorMapEnabled:"i32",specularIntensityMapEnabled:"i32",ior:"f32",transmissionFactor:"f32",transmissionMapEnabled:"i32",thicknessFactor:"f32",attenuationDistance:"f32",attenuationColor:"vec3<f32>",clearcoatFactor:"f32",clearcoatRoughnessFactor:"f32",clearcoatMapEnabled:"i32",clearcoatRoughnessMapEnabled:"i32",sheenColorFactor:"vec3<f32>",sheenRoughnessFactor:"f32",sheenColorMapEnabled:"i32",sheenRoughnessMapEnabled:"i32",iridescenceFactor:"f32",iridescenceIor:"f32",iridescenceThicknessRange:"vec2<f32>",iridescenceMapEnabled:"i32",anisotropyStrength:"f32",anisotropyRotation:"f32",anisotropyDirection:"vec2<f32>",anisotropyMapEnabled:"i32",emissiveStrength:"f32",dispersion:"f32",IBLenabled:"i32",scaleIBLAmbient:"vec2<f32>",scaleDiffBaseMR:"vec4<f32>",scaleFGDSpec:"vec4<f32>",baseColorUVSet:"i32",baseColorUVTransform:"mat3x3<f32>",metallicRoughnessUVSet:"i32",metallicRoughnessUVTransform:"mat3x3<f32>",normalUVSet:"i32",normalUVTransform:"mat3x3<f32>",occlusionUVSet:"i32",occlusionUVTransform:"mat3x3<f32>",emissiveUVSet:"i32",emissiveUVTransform:"mat3x3<f32>",specularColorUVSet:"i32",specularColorUVTransform:"mat3x3<f32>",specularIntensityUVSet:"i32",specularIntensityUVTransform:"mat3x3<f32>",transmissionUVSet:"i32",transmissionUVTransform:"mat3x3<f32>",thicknessUVSet:"i32",thicknessUVTransform:"mat3x3<f32>",clearcoatUVSet:"i32",clearcoatUVTransform:"mat3x3<f32>",clearcoatRoughnessUVSet:"i32",clearcoatRoughnessUVTransform:"mat3x3<f32>",clearcoatNormalUVSet:"i32",clearcoatNormalUVTransform:"mat3x3<f32>",sheenColorUVSet:"i32",sheenColorUVTransform:"mat3x3<f32>",sheenRoughnessUVSet:"i32",sheenRoughnessUVTransform:"mat3x3<f32>",iridescenceUVSet:"i32",iridescenceUVTransform:"mat3x3<f32>",iridescenceThicknessUVSet:"i32",iridescenceThicknessUVTransform:"mat3x3<f32>",anisotropyUVSet:"i32",anisotropyUVTransform:"mat3x3<f32>",bumpFactor:"f32",bumpMapEnabled:"i32",diffuseTransmissionFactor:"f32",diffuseTransmissionMapEnabled:"i32",diffuseTransmissionColorFactor:"vec3<f32>",diffuseTransmissionColorMapEnabled:"i32",multiscatterColorFactor:"vec3<f32>",multiscatterColorMapEnabled:"i32",scatterAnisotropy:"f32",bumpUVSet:"i32",bumpUVTransform:"mat3x3<f32>",diffuseTransmissionUVSet:"i32",diffuseTransmissionUVTransform:"mat3x3<f32>",diffuseTransmissionColorUVSet:"i32",diffuseTransmissionColorUVTransform:"mat3x3<f32>",multiscatterColorUVSet:"i32",multiscatterColorUVTransform:"mat3x3<f32>"}}},99793(e,t,r){r.d(t,{WR:()=>a,mf:()=>n});var i=r(60574);function a(e,t){return(0,i.v)(e>=0),(0,i.v)(t>0),e+(t-1)&~(t-1)}function n(e,t,r){let i;if(e instanceof ArrayBuffer)i=new Uint8Array(e);else{let t=e.byteOffset,r=e.byteLength;i=new Uint8Array(e.buffer||e.arrayBuffer,t,r)}return t.set(i,r),r+a(i.byteLength,4)}}}]);
//# sourceMappingURL=4708.376cd28d.js.map