"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["2614"],{45998(e,t,r){r.d(t,{R:()=>_});var i=r(87945),a=r(45156),n=r(67598),o=r(55590),s=r(28024),l=r(4533);let c={"+X":0,"-X":1,"+Y":2,"-Y":3,"+Z":4,"-Z":5};function f(e){return e?Array.isArray(e)?e[0]??null:e:null}function p(e){if((0,l.x)(e))return(0,l.c)(e);if("object"==typeof e&&"width"in e&&"height"in e)return{width:e.width,height:e.height};throw Error("Unsupported mip-level data")}function u(e){let{textureFormat:t,format:r}=e;if(t&&r&&t!==r)throw Error(`Conflicting texture formats "${t}" and "${r}" provided for the same mip level`);return t??r}function m(e){let t=c[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}function d(e){throw Error("setTexture1DData not supported in WebGL.")}function h(e,t,r,i){let a=Array.isArray(t)?t:[t],n=[];for(let t=0;t<a.length;t++){let o=a[t];if((0,l.x)(o))n.push({type:"external-image",image:o,z:e,mipLevel:t});else if("object"==typeof o&&null!==o&&"data"in o&&"width"in o&&"height"in o)n.push({type:"texture-data",data:o,textureFormat:u(o),z:e,mipLevel:t});else if(ArrayBuffer.isView(o)&&r)n.push({type:"texture-data",data:{data:o,width:Math.max(1,r.width>>t),height:Math.max(1,r.height>>t),...i?{format:i}:{}},textureFormat:i,z:e,mipLevel:t});else throw Error("Unsupported 2D mip-level payload")}return n}function g(e){let t=[];for(let r=0;r<e.length;r++)t.push(...h(r,e[r]));return t}function b(e){let t=[];for(let r=0;r<e.length;r++)t.push(...h(r,e[r]));return t}function v(e){let t=[];for(let[r,i]of Object.entries(e)){let e=m(r);t.push(...h(e,i))}return t}function S(e){let t=[];return e.forEach((e,r)=>{for(let[i,a]of Object.entries(e)){let e=6*r+m(i);t.push(...h(e,a))}}),t}class _{device;id;props;_texture=null;_sampler=null;_view=null;ready;isReady=!1;destroyed=!1;generation=0;updateTimestamp;resolveReady=()=>{};rejectReady=()=>{};get texture(){if(!this._texture)throw Error("Texture not initialized yet");return this._texture}get sampler(){if(!this._sampler)throw Error("Sampler not initialized yet");return this._sampler}get view(){if(!this._view)throw Error("View not initialized yet");return this._view}get[Symbol.toStringTag](){return"DynamicTexture"}toString(){let e=this._texture?.width??this.props.width??"?",t=this._texture?.height??this.props.height??"?";return`DynamicTexture:"${this.id}":${e}x${t}px:(${this.isReady?"ready":"loading..."})`}resolveTextureBinding(e){return this.isReady?this.texture:null}constructor(e,t){this.device=e;let r=(0,s.L)("dynamic-texture");this.props={..._.defaultProps,id:r,...t,data:null},this.id=this.props.id,this.ready=new Promise((e,t)=>{this.resolveReady=e,this.rejectReady=t}),this.updateTimestamp=this.device.incrementTimestamp(),this.initAsync(t)}async initAsync(e){try{let t=await this._loadAllData(e);this._checkNotDestroyed();let r=t.data?function(e){if(!e.data)return[];let t=e.width&&e.height?{width:e.width,height:e.height}:void 0,r="format"in e?e.format:void 0;switch(e.dimension){case"1d":return d(e.data);case"2d":return h(0,e.data,t,r);case"3d":return g(e.data);case"2d-array":return b(e.data);case"cube":return v(e.data);case"cube-array":return S(e.data);default:throw Error(`Unhandled dimension ${e.dimension}`)}}({...t,width:e.width,height:e.height,format:e.format}):[],n="format"in e&&void 0!==e.format,o="usage"in e&&void 0!==e.usage,s=(()=>{if(this.props.width&&this.props.height)return{width:this.props.width,height:this.props.height};let e=function(e){let{dimension:t,data:r}=e;if(!r)return null;switch(t){case"1d":{let e=f(r);if(!e)return null;let{width:t}=p(e);return{width:t,height:1}}case"2d":{if(ArrayBuffer.isView(r))return null;let e=f(r);return e?p(e):null}case"3d":case"2d-array":{if(!Array.isArray(r)||0===r.length)return null;let e=f(r[0]);return e?p(e):null}case"cube":{let e=Object.keys(r)[0]??null;if(!e)return null;let t=f(r[e]);return t?p(t):null}case"cube-array":{if(!Array.isArray(r)||0===r.length)return null;let e=r[0],t=Object.keys(e)[0]??null;if(!t)return null;let i=f(e[t]);return i?p(i):null}default:return null}}(t);return e||{width:this.props.width||1,height:this.props.height||1}})();if(!s||s.width<=0||s.height<=0)throw Error(`${this} size could not be determined or was zero`);let l=function(e,t,r,i){if(0===t.length)return{subresources:t,mipLevels:1,format:i.format,hasExplicitMipChain:!1};let a=new Map;for(let e of t){let t=a.get(e.z)??[];t.push(e),a.set(e.z,t)}let n=t.some(e=>e.mipLevel>0),o=i.format,s=1/0,l=[];for(let[t,i]of a){let a=[...i].sort((e,t)=>e.mipLevel-t.mipLevel),n=a[0];if(!n||0!==n.mipLevel)throw Error(`DynamicTexture: slice ${t} is missing mip level 0`);let c=T(e,n);if(c.width!==r.width||c.height!==r.height)throw Error(`DynamicTexture: slice ${t} base level dimensions ${c.width}x${c.height} do not match expected ${r.width}x${r.height}`);let f=x(n);if(f){if(o&&o!==f)throw Error(`DynamicTexture: slice ${t} base level format "${f}" does not match texture format "${o}"`);o=f}let p=o&&e.isTextureFormatCompressed(o)?function(e,t,r,i){let{blockWidth:a=1,blockHeight:n=1}=e.getTextureFormatInfo(i),o=1;for(let e=1;;e++){let i=Math.max(1,t>>e),s=Math.max(1,r>>e);if(i<a||s<n)break;o++}return o}(e,c.width,c.height,o):e.getMipLevelCount(c.width,c.height),u=0;for(let t=0;t<a.length;t++){let r=a[t];if(!r||r.mipLevel!==t||t>=p)break;let i=T(e,r),n=Math.max(1,c.width>>t),s=Math.max(1,c.height>>t);if(i.width!==n||i.height!==s)break;let f=x(r);if(f&&(o||(o=f),f!==o))break;u++,l.push(r)}s=Math.min(s,u)}let c=Number.isFinite(s)?Math.max(1,s):1;return{subresources:l.filter(e=>e.mipLevel<c),mipLevels:c,format:o,hasExplicitMipChain:n}}(this.device,r,s,{format:n?e.format:void 0}),c=l.format??this.props.format,u={...this.props,...s,format:c,mipLevels:1,data:void 0};this.device.isTextureFormatCompressed(c)&&!o&&(u.usage=i.g.SAMPLE|i.g.COPY_DST);let m=this.props.mipmaps&&!l.hasExplicitMipChain&&!this.device.isTextureFormatCompressed(c);if("webgpu"===this.device.type&&m){let e="3d"===this.props.dimension?i.g.SAMPLE|i.g.STORAGE|i.g.COPY_DST|i.g.COPY_SRC:i.g.SAMPLE|i.g.RENDER|i.g.COPY_DST|i.g.COPY_SRC;u.usage|=e}let _=this.device.getMipLevelCount(u.width,u.height),R=l.hasExplicitMipChain?l.mipLevels:"auto"===this.props.mipLevels?_:Math.max(1,Math.min(_,this.props.mipLevels??1)),M={...u,mipLevels:R};this._texture=this.device.createTexture(M),this._sampler=this.texture.sampler,this._view=this.texture.view,this._touchGeneration(),l.subresources.length&&this._setTextureSubresources(l.subresources),!this.props.mipmaps||l.hasExplicitMipChain||m||a.R.warn(`${this} skipping auto-generated mipmaps for compressed texture format`)(),m&&this.generateMipmaps(),this.isReady=!0,this.resolveReady(this.texture),a.R.info(1,`${this} created`)()}catch(t){let e=t instanceof Error?t:Error(String(t));this.rejectReady(e)}}destroy(){this._texture&&(this._texture.destroy(),this._texture=null,this._sampler=null,this._view=null),this.isReady=!1,this.destroyed=!0}generateMipmaps(){"webgl"===this.device.type?(this.texture.generateMipmapsWebGL(),this._touch()):"webgpu"===this.device.type?(this.device.generateMipmapsWebGPU(this.texture),this._touch()):a.R.warn(`${this} mipmaps not supported on ${this.device.type}`)}setSampler(e={}){this._checkReady();let t=e instanceof n.L?e:this.device.createSampler(e);this.texture.setSampler(t),this._sampler=t,this._touchGeneration()}async readBuffer(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,i=e.depthOrArrayLayers??this.texture.depth,a=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:i}),n=this.device.createBuffer({byteLength:a.byteLength,usage:o.h.COPY_DST|o.h.MAP_READ});this.texture.readBuffer({...e,width:t,height:r,depthOrArrayLayers:i},n);let s=this.device.createFence();return await s.signaled,s.destroy(),n}async readAsync(e={}){this.isReady||await this.ready;let t=e.width??this.texture.width,r=e.height??this.texture.height,i=e.depthOrArrayLayers??this.texture.depth,a=this.texture.computeMemoryLayout({width:t,height:r,depthOrArrayLayers:i}),n=await this.readBuffer(e),o=await n.readAsync(0,a.byteLength);return n.destroy(),o.buffer instanceof ArrayBuffer?o.buffer:o.slice().buffer}resize(e){if(this._checkReady(),e.width===this.texture.width&&e.height===this.texture.height)return!1;let t=this.texture;return this._texture=t.clone(e),this._sampler=this.texture.sampler,this._view=this.texture.view,t.destroy(),this._touchGeneration(),a.R.info(`${this} resized`),!0}getCubeFaceIndex(e){let t=c[e];if(void 0===t)throw Error(`Invalid cube face: ${e}`);return t}getCubeArrayFaceIndex(e,t){return 6*e+this.getCubeFaceIndex(t)}setTexture1DData(e){if(this._checkReady(),"1d"!==this.texture.props.dimension)throw Error(`${this} is not 1d`);let t=d(e);this._setTextureSubresources(t)}setTexture2DData(e,t=0){if(this._checkReady(),"2d"!==this.texture.props.dimension)throw Error(`${this} is not 2d`);let r=h(t,e);this._setTextureSubresources(r)}setTexture3DData(e){if("3d"!==this.texture.props.dimension)throw Error(`${this} is not 3d`);let t=g(e);this._setTextureSubresources(t)}setTextureArrayData(e){if("2d-array"!==this.texture.props.dimension)throw Error(`${this} is not 2d-array`);let t=b(e);this._setTextureSubresources(t)}setTextureCubeData(e){if("cube"!==this.texture.props.dimension)throw Error(`${this} is not cube`);let t=v(e);this._setTextureSubresources(t)}setTextureCubeArrayData(e){if("cube-array"!==this.texture.props.dimension)throw Error(`${this} is not cube-array`);let t=S(e);this._setTextureSubresources(t)}_setTextureSubresources(e){for(let t of e){let{z:e,mipLevel:r}=t;switch(t.type){case"external-image":let{image:i,flipY:a}=t;this.texture.copyExternalImage({image:i,z:e,mipLevel:r,flipY:a});break;case"texture-data":let{data:n,textureFormat:o}=t;if(o&&o!==this.texture.format)throw Error(`${this} mip level ${r} uses format "${o}" but texture format is "${this.texture.format}"`);this.texture.writeData(n.data,{x:0,y:0,z:e,width:n.width,height:n.height,depthOrArrayLayers:1,mipLevel:r});break;default:throw Error("Unsupported 2D mip-level payload")}}e.length>0&&this._touch()}async _loadAllData(e){let t=await R(e.data);return{dimension:e.dimension??"2d",data:t??null}}_checkNotDestroyed(){this.destroyed&&a.R.warn(`${this} already destroyed`)}_checkReady(){this.isReady||a.R.warn(`${this} Cannot perform this operation before ready`)}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_touchGeneration(){this.generation++,this._touch()}static defaultProps={...i.g.defaultProps,dimension:"2d",data:null,mipmaps:!1}}function x(e){if("texture-data"===e.type)return e.textureFormat??u(e.data)}function T(e,t){switch(t.type){case"external-image":return e.getExternalImageSize(t.image);case"texture-data":return{width:t.data.width,height:t.data.height};default:throw Error("Unsupported texture subresource")}}async function R(e){if(Array.isArray(e=await e))return await Promise.all(e.map(R));if(e&&"object"==typeof e&&e.constructor===Object){let t=e,r=await Promise.all(Object.values(t).map(R)),i=Object.keys(t),a={};for(let e=0;e<i.length;e++)a[i[e]]=r[e];return a}return e}},2019(e,t,r){r.d(t,{V:()=>a,d:()=>n});var i=r(68936);function a(e){let t=new i.d().set(1,0,0,0,1,0,e.offset[0],e.offset[1],1),r=new i.d().set(Math.cos(e.rotation),Math.sin(e.rotation),0,-Math.sin(e.rotation),Math.cos(e.rotation),0,0,0,1),a=new i.d().set(e.scale[0],0,0,0,e.scale[1],0,0,0,1);return Array.from(t.multiplyRight(r).multiplyRight(a))}function n(e,t){let r=new i.d(a(e)),n=new i.d(a(t)),o=new i.d(r).invert();return Array.from(n.multiplyRight(o))}},93472(e,t,r){r.d(t,{v:()=>eH});class i{entries=new Map;set(e,t,r){let i=this.entries.get(e);i||(i=new Map,this.entries.set(e,i)),i.set(t,r)}get(e,t=0){return this.entries.get(e)?.get(t)}}let a="KHR_physics_rigid_bodies";function n(e){if(!e||"object"!=typeof e||Array.isArray(e))throw Error("Expected joint object");return e}function o(e,t){for(let r of Object.keys(e))if(!t.includes(r)&&!["extras","name"].includes(r))throw Error(`Unsupported joint field: ${r}`)}function s(e){if(void 0!==e){if("number"!=typeof e||!Number.isFinite(e))throw Error("Expected joint number");return e}}function l(e){if(void 0===e)return[];if(!Array.isArray(e))throw Error("Expected joint list");return e}var c=r(92207),f=r(3842),p=r(23179),u=r(56204);class m{scenes;bindings=new Map;cameraDepths=new Map;constructor(e){for(let t of(this.scenes=e.scenes,e.bindings)){let{definition:e}=t,r=new p.P(e.viewDirection||[0,0,1]),i=new p.P(e.up||[0,1,0]);(0,f.v)(r.magnitude()>0&&i.magnitude()>0),(0,f.v)(new p.P(r).normalize().cross(new p.P(i).normalize()).magnitude()>1e-6),this.bindings.set(t.node,t)}}getDrawEntries(e){let{sceneIndex:t=0,cameraId:r="default"}=e,i=this.scenes[t];(0,f.v)(i);let a=new u.k(e.viewMatrix),n=new u.k(a).invert(),o=new p.P(n.getTranslation()),s=new p.P(1,0,0).transformAsVector(n).normalize(),l=new p.P(0,1,0).transformAsVector(n).normalize(),m=this.cameraDepths.get(r);m||(m=new Map,this.cameraDepths.set(r,m));let h=new Set,g=[],b=(e,t,r,i=0)=>{if(!e.display)return;let f=new u.k(t).multiplyRight(e.matrix),v=this.bindings.get(e),S=r||!!v?.definition.overlay;if(v?.definition.overlay&&(i=new p.P(f.getTranslation()).distance(o)),v){h.add(e);let t=new p.P(f.getTranslation()),r=new p.P(o).subtract(t);1e-8>r.magnitude()&&r.copy([n[8],n[9],n[10]]),"y"===v.definition.rotationAxis&&(r[1]=0,1e-8>r.magnitude()&&r.copy([0,0,1])),r.normalize();let i="y"===v.definition.rotationAxis?new p.P(0,1,0):new p.P(r).cross(s);1e-8>i.magnitude()&&(i=new p.P(l).subtract(new p.P(r).scale(l.dot(r)))),i.normalize();let c=d(r,i),g=new p.P(v.matrixAuthored?e.matrix.getScale():e.scale);v.matrixAuthored&&0>e.matrix.determinant()&&(g[0]=-g[0]);let b=new p.P(v.definition.viewDirection||[0,0,1]).multiply(g),S=new p.P(v.definition.up||[0,1,0]).multiply(g),_=b.magnitude()>1e-8&&S.magnitude()>1e-8&&new p.P(b).normalize().cross(new p.P(S).normalize()).magnitude()>1e-8,x=d(_?b:new p.P(v.definition.viewDirection||[0,0,1]),_?S:new p.P(v.definition.up||[0,1,0]));if(v.definition.scaleWithDistance){let r=Math.abs(new p.P(t).transformAsPoint(a)[2]);!m.has(e)&&r>1e-8&&m.set(e,r);let i=m.get(e);void 0!==i&&g.scale(r/i)}f=new u.k().translate(t).multiplyRight(c).multiplyRight(x.transpose()).scale(g)}if(e instanceof c.o)for(let t of e.children)b(t,f,S,i);else g.push({node:e,modelMatrix:f,overlay:S,distance:i,depth:-new p.P(f.getTranslation()).transformAsPoint(a)[2]})};for(let e of(b(i,new u.k,!1),m.keys()))h.has(e)||m.delete(e);return g.sort((e,t)=>Number(e.overlay)-Number(t.overlay)||(e.overlay?t.distance-e.distance||t.depth-e.depth:0)),g}resetCamera(e="default"){this.cameraDepths.delete(e)}destroy(){this.bindings.clear(),this.cameraDepths.clear()}}function d(e,t){e=new p.P(e).normalize();let r=new p.P(t).cross(e).normalize();return t=new p.P(e).cross(r).normalize(),new u.k([r[0],r[1],r[2],0,t[0],t[1],t[2],0,e[0],e[1],e[2],0,0,0,0,1])}var h=r(32718);function g(e){if(!e.every(Number.isFinite)||Math.abs(e[3])+Math.abs(e[7])+Math.abs(e[11])>1e-7||Math.abs(e[15]-1)>1e-7)throw Error("Expected an affine transform");let t=[Math.hypot(e[0],e[1],e[2]),Math.hypot(e[4],e[5],e[6]),Math.hypot(e[8],e[9],e[10])];if(t.every(e=>0===e))return{position:[e[12],e[13],e[14]],rotation:[0,0,0,1],scale:t};if(t.some(e=>e<1e-10))throw Error("Singular collider transforms are unsupported");0>e.determinant()&&(t[0]=-t[0]);let r=[e[0]/t[0],e[1]/t[0],e[2]/t[0],e[4]/t[1],e[5]/t[1],e[6]/t[1],e[8]/t[2],e[9]/t[2],e[10]/t[2]];for(let[e,t]of[[0,1],[0,2],[1,2]])if(Math.abs(r[3*e]*r[3*t]+r[3*e+1]*r[3*t+1]+r[3*e+2]*r[3*t+2])>1e-5)throw Error("Sheared collider transforms are unsupported");let i=new h.P().fromMatrix3(r).normalize();return{position:[e[12],e[13],e[14]],rotation:[i[0],i[1],i[2],i[3]],scale:t}}class b{joints;constructor(e){this.joints=e}resolve(e,t){let r=new Map,i=new Map,a=(e,n,o)=>{if(r.has(e))throw Error("Joint scene must be a tree");let s=new u.k(n).multiplyRight(e.matrix),l=t.has(e)?e:o;if(r.set(e,s),i.set(e,l),e instanceof c.o)for(let t of e.children)a(t,s,l)};for(let t of e)a(t,new u.k,null);let n=e=>{let t=r.get(e);if(!t)throw Error("Joint attachment is outside the scene");let a=i.get(e)??null,n=new u.k(t);if(a){let e=g(r.get(a));n=new u.k().translate(e.position).multiplyRight(new u.k().fromQuaternion(e.rotation)).invert().multiplyRight(n)}let o=g(n);return{body:a,position:o.position,orientation:o.rotation}};return this.joints.map(e=>({joint:e,first:n(e.first),second:n(e.second)}))}}var v=r(84793),S=r(93705),_=r(77119),x=r(6755),T=r(55590),R=r(87945),M=r(70693),I=r(50784),C=r(19246),A=r(92790),y=r(51208);class E{id;metadata={};device;factory;shaderInputs;bindings={};_uniformStore;_bindGroupCacheToken={};_dynamicResourceGenerations={};constructor(e,t={}){this.id=t.id||(0,y.L)("material"),this.device=e,this.factory=t.factory||new L(e,{modules:t.modules||t.shaderInputs?.getModules()||[]});let r=Object.fromEntries((t.shaderInputs?.getModules()||this.factory.modules).map(e=>[e.name,e]));for(let[e,i]of(this.shaderInputs=t.shaderInputs||new S.l(r),this._uniformStore=new _.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if(this.ownsModule(e)&&(0,A.fX)(i)){let t=this._uniformStore.getManagedUniformBuffer(e);this.bindings[`${e}Uniforms`]=t}this.updateShaderInputs(),t.bindings&&this._replaceOwnedBindings(t.bindings)}destroy(){this._uniformStore.destroy()}clone(e={}){let t=this.factory.createMaterial({id:e.id,shaderInputs:e.shaderInputs,bindings:{...this.getResourceBindings(),...e.bindings}});return e.shaderInputs||t.setProps(this.shaderInputs.getUniformValues()),e.moduleProps&&t.setProps(e.moduleProps),t.metadata={...this.metadata},t.updateShaderInputs(),t}ownsBinding(e){return this.factory.ownsBinding(e)}ownsModule(e){return this.factory.ownsModule(e)}setProps(e){this.shaderInputs.setProps(e)}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this._setOwnedBindings(this.shaderInputs.getBindingValues())&&(this._bindGroupCacheToken={})}getResourceBindings(){let e={};for(let[t,r]of Object.entries(this.bindings))P(t)||(e[t]=r);return e}getBindings(e={bindings:[]}){this._syncDynamicResourceGenerations();let t={};for(let[r,i]of Object.entries(this.bindings))if((0,C.YT)(i)){let a=(0,C.l0)(e,r,{fallbackGroup:N}),n=a?i.resolveTextureBinding(a):null;n&&(t[r]=n)}else i instanceof I.kL?t[r]=i.buffer:(0,I.Hd)(i)?t[r]=(0,I.j8)(i):t[r]=i;return this._syncDynamicResourceGenerations(),t}getBindingsByGroup(e={bindings:[]}){return this.factory.getBindingsByGroup(this.getBindings(e))}getBindGroupCacheKey(e){return this._syncDynamicResourceGenerations(),e===N?this._bindGroupCacheToken:null}getBindingsUpdateTimestamp(){let e=0;for(let t of Object.values(this.bindings))t instanceof x.X?e=Math.max(e,t.texture.updateTimestamp):t instanceof T.h||t instanceof R.g||t instanceof M.r||t instanceof I.kL?e=Math.max(e,t.updateTimestamp):(0,C.YT)(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:(0,I.Hd)(t)&&(e=Math.max(e,(t.buffer instanceof I.kL,t.buffer.updateTimestamp)));return e}_replaceOwnedBindings(e){this._setOwnedBindings(e)&&(this._bindGroupCacheToken={})}_setOwnedBindings(e){let t=!1;for(let[r,i]of Object.entries(e))void 0!==i&&this.ownsBinding(r)&&this.bindings[r]!==i&&(this.bindings[r]=i,t=!0);return t}_syncDynamicResourceGenerations(){let e={},t=!1;for(let[i,a]of Object.entries(this.bindings)){var r;let n=(r=a,(0,C.YT)(r)?r.generation:(0,I.Xk)(r)?.generation??null);null!==n&&(e[i]=n,this._dynamicResourceGenerations[i]!==n&&(t=!0))}Object.keys(e).length!==Object.keys(this._dynamicResourceGenerations).length&&(t=!0),this._dynamicResourceGenerations=e,t&&(this._bindGroupCacheToken={})}}let N=3;class L{device;modules;_materialBindingNames;_materialModuleNames;constructor(e,t={}){this.device=e,this.modules=t.modules||[];let r=new S.l(Object.fromEntries(this.modules.map(e=>[e.name,e])));this._materialBindingNames=function(e){let t=new Set;for(let r of Object.values(e.modules))for(let e of r.bindingLayout||[])e.group===N&&t.add(e.name);return t}(r),this._materialModuleNames=function(e){let t=new Set;for(let r of Object.values(e.modules))r.name&&r.bindingLayout?.some(e=>e.group===N&&e.name===r.name)&&t.add(r.name);return t}(r)}createMaterial(e={}){return new E(this.device,{...e,factory:this})}getBindingNames(){return Array.from(this._materialBindingNames)}ownsBinding(e){if(this._materialBindingNames.has(e))return!0;let t=P(e);return!!t&&this._materialModuleNames.has(t)}ownsModule(e){return this._materialModuleNames.has(e)}getBindingsByGroup(e){return Object.keys(e).length>0?{[N]:e}:{}}}function P(e){return e.endsWith("Uniforms")?e.slice(0,-8):null}var U=r(62837),w=r(69457);function V(e){let t=e.value;if(t instanceof Float32Array)return t;let r=new Float32Array(t.length),i=F(t),a=t instanceof Int8Array||t instanceof Int16Array||t instanceof Int32Array;for(let n=0;n<t.length;n++){let o=Number(t[n]);r[n]=e.normalized&&i?a?Math.max(o/i,-1):o/i:o}return r}function F(e){return e instanceof Int8Array?127:e instanceof Uint8Array||e instanceof Uint8ClampedArray?255:e instanceof Int16Array?32767:e instanceof Uint16Array?65535:e instanceof Int32Array?0x7fffffff:0xffffffff*(e instanceof Uint32Array)}var O=r(72631);let H={props:{},uniforms:{},bindings:{},name:"skin",bindingLayout:[{name:"skin",group:0},{name:"skinJointMatrices",group:0,visibility:1}],dependencies:[],source:`
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

`,fs:"",defines:{SKIN_MAX_JOINTS:64},getUniforms:(e={},t)=>{let{jointMatrices:r,skinJointMatrices:i,scenegraphsFromGLTF:a,skinIndex:n=0,meshWorldMatrix:o}=e,s=i?{skinJointMatrices:i}:{};if(r){var l;let e;return{jointMatrix:(l=r,(e=new Float32Array(1024)).set(l instanceof Float32Array?l.subarray(0,e.length):l.slice(0,e.length)),e),...s}}let c=a?.gltf?.skins?.[n];if(!c)return{jointMatrix:[],...s};let{inverseBindMatrices:f,joints:p,skeleton:m}=c,d=a.gltfNodeIndexToNodeMap,h=new Map,g=void 0===m?void 0:d?.get(m);for(let e of g?[g]:a.scenes||[])e.preorderTraversal((e,{worldMatrix:t})=>{h.set(e.id,t)});let b=o?new u.k(o).invert():null,v=new Float32Array(1024),S=f?.value;for(let e=0;e<Math.min(p.length,64);e++){let t=d?.get(p[e]);if(!t)continue;let r=h.get(t.id)||t.matrix,i=b?new u.k(b).multiplyRight(r):new u.k(r);S&&S.length>=(e+1)*16&&i.multiplyRight(new u.k(Array.from(S.slice(16*e,(e+1)*16)))),v.set(i,16*e)}return{jointMatrix:v,...s}},uniformTypes:{jointMatrix:["mat4x4<f32>",64]}},D={name:"publishedTransforms",uniformTypes:{bodyIndex:"i32",viewProjection:"mat4x4<f32>"},defaultUniforms:{bodyIndex:-1},source:`
struct PublishedTransforms {bodyIndex:i32,viewProjection:mat4x4f}
@group(0) @binding(auto) var<uniform> publishedTransforms:PublishedTransforms;
@group(0) @binding(auto) var<storage,read> publishedBodyMatrices:array<mat4x4f>;
`,bindingLayout:[{name:"publishedBodyMatrices",group:0}]};var k=r(45156),B=r(67598),G=r(5247),z=r(45998);let K={name:"gpuAnimation",props:{},uniforms:{},bindings:{},source:`
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
`,fs:"",bindingLayout:[{name:"gpuAnimationFrames",group:0,visibility:1},{name:"gpuMorphTargets",group:0,visibility:1},{name:"gpuMorphWeights",group:0,visibility:1}],getUniforms:(e={})=>e},j=`
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

  var resolvedModelMatrix = pbrProjection.modelMatrix;
  var resolvedNormalMatrix = pbrProjection.normalMatrix;
#ifdef HAS_PUBLISHED_TRANSFORMS
  if(publishedTransforms.bodyIndex>=0){
    let bodyMatrix=publishedBodyMatrices[u32(publishedTransforms.bodyIndex)];
    resolvedModelMatrix=bodyMatrix*resolvedModelMatrix;
    resolvedNormalMatrix=bodyMatrix*resolvedNormalMatrix;
  }
#endif
  let worldPosition = resolvedModelMatrix * position;

#ifdef HAS_NORMALS
  normal = normalize((resolvedNormalMatrix * vec4f(normal, 0.0)).xyz);
#endif
#ifdef HAS_TANGENTS
  let worldTangent = normalize((resolvedModelMatrix * vec4f(tangent.xyz, 0.0)).xyz);
  outputs.pbrTangent = vec4f(worldTangent, tangent.w);
#endif

  outputs.position = pbrProjection.modelViewProjectionMatrix * position;
#ifdef HAS_PUBLISHED_TRANSFORMS
  if(publishedTransforms.bodyIndex>=0){outputs.position=publishedTransforms.viewProjection*worldPosition;}
#endif
  outputs.pbrPosition = worldPosition.xyz / worldPosition.w;
  outputs.pbrUV0 = uv0;
  outputs.pbrUV1 = uv1;
  outputs.pbrNormal = normal;
  return outputs;
}

@fragment
fn fragmentMain(inputs: FragmentInputs, @builtin(front_facing) frontFacing: bool) -> @location(0) vec4f {
#ifdef DOUBLE_SIDED
  pbr_frontFacing = frontFacing;
#endif
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
`,$=`\
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
`,W=`\
#version 300 es
  out vec4 fragmentColor;

  void main(void) {
    vec3 pos = pbr_vPosition;
    fragmentColor = pbr_filterColor(vec4(1.0));
  }
`;function q(e,t){let r=t.materialFactory||new L(e,{modules:[O.s]}),i={...t.parsedPPBRMaterial.uniforms};delete i.camera;let a=Object.fromEntries(Object.entries({...i,...t.parsedPPBRMaterial.bindings}).filter(([e,t])=>{var i;return r.ownsBinding(e)&&((i=t)instanceof T.h||i instanceof z.R||i instanceof B.L||i instanceof R.g||i instanceof x.X)})),n=r.createMaterial({id:t.id,bindings:a});return n.setProps({pbrMaterial:i}),n}function X(e,t,r,i,a){if("webgpu"===e.type)return e.createBuffer({id:t,data:r,usage:T.h.STORAGE|T.h.COPY_DST});let n=e.createTexture({id:t,format:"rgba32float",width:i,height:a,usage:R.g.SAMPLE|R.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}});return n.writeData(r,{width:i,height:a}),n}function J(e,t,r){if(!e)return[...r];let i=e.value;return r.map((r,a)=>{let n=i[t*e.size+a];return void 0===n?r:e.normalized?e.value instanceof Int8Array?Math.max(n/127,-1):e.value instanceof Int16Array?Math.max(n/32767,-1):e.value instanceof Uint8Array?n/255:e.value instanceof Uint16Array?n/65535:n:n})}var Y=r(68936),Z=r(2019),Q=r(8137);function ee(e,t={}){let r=e.intensity??1,i=t.intensity??1;(0,f.v)(Number.isFinite(r)&&r>=0),(0,f.v)(Number.isFinite(i)&&i>=0);let a=new Y.d((0,Z.V)({offset:t.offset??[0,0],rotation:t.rotation??0,scale:t.scale??[1,1]})),n=(0,Z.V)((0,Q.e3)(e.lightmapTexture));return{textureIndex:e.lightmapTexture.index,texCoord:(0,Q.CC)(e.lightmapTexture),transform:a.multiplyRight(n),intensity:r*i}}function et(e,t){for(let r of(e.userData.morphWeights=[...t],e.userData.morphMeshes||[]))r.preorderTraversal(e=>{if(!(e instanceof v.s))return;let r=e.userData.morphTargets;if(!r)return;let i=e.userData.morphWeightTransport;if(i){var a,n;a=i,n=t,a.values.fill(0),a.values.set(n.slice(0,a.values.length)),a.data instanceof T.h?a.data.write(a.values):a.data.writeData(a.values,{width:a.packedTargetCount,height:1}),e.userData.morphWeights=[...t];return}!function(e,t,r,i){let a={};for(let e of["POSITION","NORMAL","TANGENT"]){let r=t.attributes[e];r&&(a[e]=V(r))}let n=function(e,t,r){let i={};for(let a of["POSITION","NORMAL","TANGENT"]){let n=e[a];if(!n)continue;let o=new Float32Array(n),s="TANGENT"===a?4:3,l=Math.floor(n.length/s);for(let e=0;e<Math.min(t.length,r.length);e++){let i=r[e],n=t[e][a];if(!i||!n)continue;let c="TANGENT"===a&&n.length===4*l?4:3;for(let e=0;e<l;e++){let t=e*s,r=e*c;for(let e=0;e<3;e++)o[t+e]+=(n[r+e]||0)*i}}"POSITION"!==a&&function(e,t){for(let r=0;r<e.length;r+=t){let t=Math.hypot(e[r],e[r+1],e[r+2]);t>0&&(e[r]/=t,e[r+1]/=t,e[r+2]/=t)}}(o,s),i[a]=o}return i}(a,r,i),o={};for(let[e,r]of Object.entries(t.attributes))r&&(o[e]=r);for(let e of["POSITION","NORMAL","TANGENT"]){let t=n[e],r=o[e];t&&r&&(o[e]={...r,value:function(e,t){if(e.value instanceof Float32Array)return t;let r=e.value.slice(),i=F(r),a=r instanceof Int8Array||r instanceof Int16Array||r instanceof Int32Array;for(let n=0;n<t.length;n++){let o=t[n];r[n]=e.normalized&&i?Math.round(Math.max(a?-1:0,Math.min(1,o))*i):o}return r}(r,t)})}let s=new U.V2({id:t.id,topology:t.topology||"triangle-list",vertexCount:t.vertexCount,indices:t.indices,attributes:o,bufferLayout:t.bufferLayout}),l=(0,w.C)(s),c=l.attributes.geometry?.value,f=e._gpuGeometry?.attributes.geometry||e.bufferAttributes.geometry;if(c&&f)return f.write(c);for(let t of["POSITION","NORMAL","TANGENT"]){let r=n[t];if(r){let i="POSITION"===t?"positions":"NORMAL"===t?"normals":"TANGENT";e.bufferAttributes[i]?.write(r)}}}(e.model,r.geometry,r.targets,t),e.userData.morphWeights=[...t]})}var er=r(37210),ei=r(21109);let ea={properties:null,billboards:null,publishedTransforms:null,modelOptions:{},pbrDebug:!1,imageBasedLightingEnvironment:void 0,lights:!0,useTangents:!1,useByteColors:!0,strictExtensions:!1,excludeGaussianSplatPrimitives:!1};function en(e,t,r,i){let a=(0,ei.lO)(e,t,r,i);for(let e of a.generatedTextures)i.generatedTextures.add(e);return a}function eo(e,t,r,i,a,n,o,s){let l=t.primitives||[],p=n&&function(e){let t=["_LIGHTMAP_OFFSET","_LIGHTMAP_SCALE","_LIGHTMAP_ROTATION","_LIGHTMAP_INTENSITY"];if(!t.some(t=>e.attributes[t]))return null;let r=[2,2,1,1];for(let[i,a]of t.entries()){let t=e.attributes[a];t&&((0,f.v)(t.value instanceof Float32Array&&!t.normalized),(0,f.v)(t.size===r[i]),(0,f.v)(t.count===e.matrices.length),(0,f.v)(t.value.length===t.count*t.size),(0,f.v)(t.value.every(e=>Number.isFinite(e)&&("_LIGHTMAP_INTENSITY"!==a||e>=0))))}return e.matrices.map((t,r)=>{let i=e.attributes._LIGHTMAP_OFFSET?.value,a=e.attributes._LIGHTMAP_SCALE?.value,n=e.attributes._LIGHTMAP_ROTATION?.value,o=e.attributes._LIGHTMAP_INTENSITY?.value;return{offset:i?[i[2*r],i[2*r+1]]:[0,0],scale:a?[a[2*r],a[2*r+1]]:[1,1],rotation:n?.[r]??0,intensity:o?.[r]??1}})}(n);if(p)return(0,f.v)(!!o?.lightmaps.length||l.some(e=>e.material?.extensions?.KHR_lightmap)),new c.o({id:t.name||t.id,children:p.map((s,l)=>new c.o({matrix:n.matrices[l],children:[eo(e,t,r,i,a,void 0,o,s)]}))});let u=l.flatMap((l,c)=>a.excludeGaussianSplatPrimitives&&l.extensions?.KHR_gaussian_splatting?[]:[function({device:e,gltfPrimitive:t,primitiveIndex:r,gltfMesh:i,gltf:a,gltfMaterialIdToMaterialMap:n,options:o,instancing:s,nodeLightmap:l,lightmapInstance:c}){let f=t.name||`${i.name||i.id}-primitive-${r}`,p=function(e){let t=1/0;for(let r of Object.values(e))if(r){let{value:e,size:i,components:a}=r,n=i??a;e?.length!==void 0&&n>=1&&(t=Math.min(t,e.length/n))}if(!Number.isFinite(t))throw Error("Could not determine vertex count from attributes");return t}(t.attributes),u=function(e,t,r){if(e!==er.n.LINE_LOOP&&e!==er.n.TRIANGLE_FAN)return{topology:function(e){switch(e){case er.n.POINTS:return"point-list";case er.n.LINES:return"line-list";case er.n.LINE_STRIP:return"line-strip";case er.n.TRIANGLES:return"triangle-list";case er.n.TRIANGLE_STRIP:return"triangle-strip";default:throw Error(String(e))}}(e)};let i=t?.length??r,a=new(t instanceof Uint32Array||!t&&r>65536?Uint32Array:Uint16Array)(e===er.n.LINE_LOOP?i>=2?2*i:0:i>=3?(i-2)*3:0),n=e=>t?.[e]??e;if(e===er.n.LINE_LOOP){for(let e=0;e<i;e++)a[2*e]=n(e),a[2*e+1]=n((e+1)%i);return{topology:"line-list",indices:a}}for(let e=0;e<i-2;e++)a[3*e]=n(0),a[3*e+1]=n(e+1),a[3*e+2]=n(e+2);return{topology:"triangle-list",indices:a}}(t.mode??4,t.indices?.value,p),m=function(e,t,r){let i={};for(let[e,r]of Object.entries(t.attributes)){let{components:a,size:n,value:o,normalized:s}=r,l="POSITION"===e||"NORMAL"===e||"TANGENT"===e,c=!!(t.targets?.length&&l);i[e]={size:n??a,value:c?V({value:o,normalized:s}):o,normalized:!c&&s}}return new U.V2({id:e,topology:r.topology,indices:r.indices??t.indices?.value,attributes:i})}(f,t,u),d=m.vertexCount,h=function(e,t,r){if(!e.targets?.length)return;let i={};for(let e of["POSITION","NORMAL","TANGENT"]){let t=r.attributes[e]?.value;t instanceof Float32Array&&(i[e]=new Float32Array(t))}return{geometry:r,baseAttributes:i,targets:e.targets.map(e=>{let r={};for(let i of["POSITION","NORMAL","TANGENT"]){let a=e[i],n="number"==typeof a?t.accessors[a]:a;n?.value&&ArrayBuffer.isView(n.value)&&(r[i]=V(n))}return r})}}(t,a,m),g=l?.lightmaps.find(e=>e.primitive===r),b=g?{...t.material,extensions:{...t.material?.extensions,KHR_lightmap:g}}:t.material,S=en(e,b,m.attributes,{...o,gltf:a});if(c&&b?.extensions?.KHR_lightmap){let e=ee(b.extensions.KHR_lightmap,c);S.uniforms.lightmapUVTransform=e.transform,S.uniforms.lightmapIntensity=e.intensity}let _=function(e,t){let r,i,a,n,o,s,l,c,f,p,u,{id:m,geometry:d,parsedPPBRMaterial:h,vertexCount:g,modelOptions:b={},instanceMatrices:S,usesLargeSkinPalette:_=!1,morphTargets:x=[]}=t;if(t.publishedTransforms&&"webgpu"!==e.type)throw Error("Published transforms require WebGPU");let M=b.userData?.gltfAnimatedCrowd;if(M&&S)throw Error("Nested glTF crowd instancing is unsupported");k.R.info(4,"createGLTFModel defines: ",h.defines)();let I=[],C={},A=[],y=[],E=[],N=!!M?.gpuAnimation;if(S||M)for(let t=0;t<4;t++){let r=new Float32Array(4*(M?.capacity||S?.length||0));S?.forEach((e,i)=>{for(let a=0;a<4;a++)r[4*i+a]=e[4*t+a]});let i=`instanceModelMatrixCol${t}`,a=e.createBuffer({id:`${m||"gltf"}-${i}`,data:r,usage:T.h.VERTEX|T.h.COPY_DST});C[i]=a,A.push({name:i,format:"float32x4",stepMode:"instance"}),I.push(a),y.push(a),E.push(r)}if(M&&N)for(let[t,o]of[["instanceAnimationFrames",r=new Float32Array(4*M.capacity)],["instanceAnimationBlend",a=new Float32Array(4*M.capacity)]]){let r=e.createBuffer({id:`${m||"gltf"}-${t}`,data:o,usage:T.h.VERTEX|T.h.COPY_DST});C[t]=r,A.push({name:t,format:"float32x4",stepMode:"instance"}),I.push(r),"instanceAnimationFrames"===t?i=r:n=r}let L=!!h.defines.HAS_SKIN,P=!!(_&&L&&!M),U=!!(M&&L&&!N);M&&U&&(s=new Float32Array(M.capacity*M.jointsPerInstance*16),o="webgpu"===e.type?e.createBuffer({id:`${m||"gltf"}-crowd-joint-matrices`,byteLength:s.byteLength,usage:T.h.STORAGE|T.h.COPY_DST}):e.createTexture({id:`${m||"gltf"}-crowd-joint-matrices`,format:"rgba32float",width:4*M.jointsPerInstance,height:M.capacity,usage:R.g.SAMPLE|R.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}}),I.push(o));let w=x.length,V=Math.floor((d.attributes.POSITION?.value.length||0)/3);if(w>0&&V>0){let t=new Float32Array(3*w*V*4);for(let[e,r]of x.entries())for(let[i,a]of["POSITION","NORMAL","TANGENT"].entries()){let n=r[a];if(!n)continue;let o="TANGENT"===a&&n.length===4*V?4:3;for(let r=0;r<V;r++){let a=((3*e+i)*V+r)*4,s=r*o;t[a]=n[s]||0,t[a+1]=n[s+1]||0,t[a+2]=n[s+2]||0}}if(l=X(e,`${m||"gltf"}-crowd-morph-targets`,t,V,3*w),I.push(l),!N){let t=Math.ceil(w/4),r=M?.capacity||1;f=X(e,`${m||"gltf"}-crowd-morph-weights`,c=new Float32Array(r*t*4),t,r),I.push(f)}}let F=L&&M?M.jointsPerInstance:0,B=4+4*F+w;M?.gpuAnimation&&(p=X(e,`${m||"gltf"}-crowd-animation-frames`,u=new Float32Array(M.gpuAnimation.frameCount*B*4),B,M.gpuAnimation.frameCount),I.push(p));let z=j;for(let[e,t]of[["CROWD_JOINTS_PER_INSTANCE",M?.jointsPerInstance||0],["CROWD_MORPH_VERTEX_COUNT",V],["CROWD_MORPH_TARGET_COUNT",w],["CROWD_ANIMATION_JOINT_COUNT",F],["CROWD_ANIMATION_FRAME_STRIDE",B]])z=z.replaceAll(`u32(${e})`,`u32(${t})`);let J={id:m,source:z,vs:$,fs:W,geometry:d,topology:d.topology,vertexCount:g,modules:[O.s,H,...M||l?[K]:[],...t.publishedTransforms?[D]:[]],...b,...S||M?{attributes:{...b.attributes,...C},bufferLayout:[...b.bufferLayout||[],...A],instanceCount:S?.length||0,isInstanced:!0}:{},defines:{...h.defines,...t.publishedTransforms?{HAS_PUBLISHED_TRANSFORMS:!0}:{},...b.defines,...S||M?{HAS_GLTF_INSTANCING:!0}:{},...U?{HAS_INSTANCED_SKIN:!0,CROWD_JOINTS_PER_INSTANCE:M.jointsPerInstance}:{},...P?{HAS_LARGE_SKIN:!0}:{},...N?{HAS_GPU_CROWD_ANIMATION:!0,CROWD_ANIMATION_FRAME_STRIDE:B}:{},...l?{HAS_INSTANCED_MORPH:!0,CROWD_MORPH_TARGET_COUNT:w}:{},...M||l?{CROWD_ANIMATION_JOINT_COUNT:F}:{}},parameters:{depthWriteEnabled:!0,depthCompare:"less",depthFormat:"depth24plus",cullMode:"back",...h.parameters,...b.parameters}},Y=t.material||q(e,{id:m?`${m}-material`:void 0,parsedPPBRMaterial:h});J.material=Y;let Z=new G.K(e,J),Q={...h.uniforms,...b.uniforms,...h.bindings,...b.bindings},ee=function(e,t,r){let i=new Map;for(let t of e){for(let e of Object.keys(t.uniformTypes||{}))i.set(e,t.name);for(let e of t.bindingLayout||[])i.set(e.name,t.name)}let a={};for(let[e,n]of Object.entries(r)){if(void 0===n)continue;let r=i.get(e);!r||t.ownsModule(r)||(a[r]||={},a[r][e]=n)}return a}(Z.shaderInputs.getModules(),Y,Q);Z.shaderInputs.setProps(ee),t.publishedTransforms&&Z.shaderInputs.setProps({publishedTransforms:{publishedBodyMatrices:t.publishedTransforms,bodyIndex:-1}}),o&&Z.shaderInputs.setProps({skin:{jointMatrices:[],skinJointMatrices:o}}),(p||l||f)&&Z.shaderInputs.setProps({gpuAnimation:{...p?{gpuAnimationFrames:p}:{},...l?{gpuMorphTargets:l}:{},...f?{gpuMorphWeights:f}:{}}});let et=new v.s({managedResources:I,model:Z,bounds:t.bounds,instanceMatrices:S});return et.userData.gltfLargeSkinPalette=P,c&&f&&!M&&(et.userData.morphWeightTransport={values:c,data:f,packedTargetCount:Math.ceil(w/4)}),M&&(et.userData.gltfAnimatedCrowd={transformBuffers:y,transformColumns:E,skinJointMatrices:o,jointMatrices:s,jointsPerInstance:M.jointsPerInstance,morphTargetCount:w,morphTargetData:l,morphWeights:c,morphWeightData:f,animationFrames:p,animationFrameValues:u,animationFrameStride:B,animationJointCount:F,animationParameters:r,animationParameterBuffer:i,animationBlend:a,animationBlendBuffer:n}),et}(e,{id:f,geometry:m,material:!b?.extensions?.KHR_lightmap&&t.material&&n.get(t.material.id)||null,parsedPPBRMaterial:S,modelOptions:o.modelOptions,publishedTransforms:o.publishedTransforms??void 0,vertexCount:d,bounds:[t.attributes.POSITION.min,t.attributes.POSITION.max],instanceMatrices:s?.matrices,usesLargeSkinPalette:function(...e){for(let t of e)if(t){if(t.max?.some(e=>e>=64))return!0;for(let e=0;e<(t.value?.length||0);e++)if(t.value[e]>=64)return!0}return!1}(t.attributes.JOINTS_0,t.attributes.JOINTS_1),morphTargets:h?.targets});if(t.material&&_.model.material){let e=a.materials.findIndex(e=>e.id===t.material.id);es(o.materialInstances,e,_.model.material)}s&&(_.userData.gltfInstancing=s);let x=t.extensions?.KHR_materials_variants?.mappings||[];if(x.length){let t=new Map;for(let r of x){let i="number"==typeof r.material?a.materials[r.material]:r.material,s=g?{...i,extensions:{...i?.extensions,KHR_lightmap:g}}:i,l=s&&n.get(s.id);if(!l)continue;let f=en(e,s,m.attributes,{...o,gltf:a});if(s.extensions?.KHR_lightmap){if(c){let e=ee(s.extensions.KHR_lightmap,c);f.uniforms.lightmapUVTransform=e.transform,f.uniforms.lightmapIntensity=e.intensity}l=q(e,{parsedPPBRMaterial:f})}for(let e of(es(o.materialInstances,a.materials.indexOf(i),l),r.variants||[]))t.set(e,{material:l,parameters:{..._.model.parameters,...f.parameters,depthWriteEnabled:"BLEND"!==s.alphaMode,cullMode:s.doubleSided?"none":"back"}})}_.userData.gltfMaterialVariants={defaultMaterial:_.model.material,defaultParameters:{..._.model.parameters},mappings:t}}return h&&(_.userData.morphTargets=h),_}({device:e,gltfPrimitive:l,primitiveIndex:c,gltfMesh:t,gltf:r,gltfMaterialIdToMaterialMap:i,options:a,instancing:n,nodeLightmap:o,lightmapInstance:s})]);return new c.o({id:t.name||t.id,children:u})}function es(e,t,r){if(t<0)return;let i=e.get(t)||[];i.includes(r)||i.push(r),e.set(t,i)}var el=r(18309);class ec{bindings;useByteColors;lights=[];constructor(e,t=!0){this.bindings=e,this.useByteColors=t,this.update()}update(){for(let{path:e,definition:t}of(this.lights.length=0,this.bindings)){if(!e.length||e.some(e=>!e.display))continue;let r=new u.k;for(let t of e)r.multiplyRight(t.matrix);let i=function(e,t,r){var i,a,n,o;let s=(i=e.color||[1,1,1],r?i.map(e=>255*e):(0,el.sC)(i,!1)),l=e.intensity??1;switch(e.type){case"directional":return a=t,n=s,o=l,{type:"directional",direction:ep(a),color:n,intensity:o};case"point":return function(e,t,r,i){let a=ef(e),n=[1,0,0];return void 0!==i&&i>0&&(n=[1,0,1/(i*i)]),{type:"point",position:a,color:t,intensity:r,attenuation:n}}(t,s,l,e.range);case"spot":return function(e,t,r,i,a={}){let n=ef(e),o=ep(e),s=[1,0,0];return void 0!==i&&i>0&&(s=[1,0,1/(i*i)]),{type:"spot",position:n,direction:o,color:t,intensity:r,attenuation:s,innerConeAngle:a.innerConeAngle??0,outerConeAngle:a.outerConeAngle??Math.PI/4}}(t,s,l,e.range,e.spot);default:return}}(t,r,this.useByteColors);i&&this.lights.push(i)}}}function ef(e){return e.transformAsPoint([0,0,0])}function ep(e){return e.transformAsVector([0,0,-1])}class eu{name;playing=!0;speed=1;startTime=0;constructor(e={}){this.name=e.name||"unnamed",Object.assign(this,e)}setTime(e){if(!this.playing)return;let t=(e/1e3-this.startTime)*this.speed;this.applyTime(t)}}class em{clips;animations;constructor(e){this.clips=e,this.animations=e}animate(e){k.R.warn(`${this.constructor.name}#animate is deprecated. Use ${this.constructor.name}#setTime instead`)(),this.setTime(e)}setTime(e){this.clips.forEach(t=>t.setTime(e))}getAnimations(){return this.clips}}function ed(e,t,r){let i=eg(e),a=eg(t),n=i.reduce((e,t,r)=>e+t*a[r],0),o=n<0?-1:1;if((n=Math.min(Math.abs(n),1))>.9995)return eg(i.map((e,t)=>e+r*(a[t]*o-e)));let s=Math.acos(n),l=Math.sin(s),c=Math.sin((1-r)*s)/l,f=Math.sin(r*s)/l*o;return eg(i.map((e,t)=>e*c+a[t]*f))}function eh(e,t,r,i){let a=e["CUBICSPLINE"===t?3*r+1:r];return a?"quaternion"===i?eg(a):[...a]:null}function eg(e){let t=Math.hypot(...e);return t>0?e.map(e=>e/t):[0,0,0,1]}class eb{clip;mixer;time=0;timeScale;weight;loop;repetitions;paused=!1;playing=!1;elapsedTime=0;fade=null;constructor(e,t,r={}){this.mixer=e,this.clip=t,this.loop=r.loop||"repeat",this.repetitions=r.repetitions??1/0,this.timeScale=r.timeScale??1,this.weight=r.weight??1}play(){return this.playing=!0,this.paused=!1,this}pause(){return this.paused=!0,this}resume(){return this.playing=!0,this.paused=!1,this}stop(){return this.playing=!1,this.paused=!1,this.fade=null,this.reset()}reset(){return this.elapsedTime=0,this.time=0,this}setTime(e){return this.elapsedTime=e,this.time=this.resolveLocalTime(e),this}setLoop(e,t=1/0){return this.loop=e,this.repetitions=t,this.time=this.resolveLocalTime(this.elapsedTime),this}setEffectiveWeight(e){return this.weight=Math.max(0,e),this.fade=null,this}setEffectiveTimeScale(e){return this.timeScale=e,this}fadeIn(e){return this.scheduleFade(1,e)}fadeOut(e){return this.scheduleFade(0,e)}crossFadeTo(e,t){return e.weight=0,e.play().fadeIn(t),this.fadeOut(t)}crossFadeFrom(e,t){return e.crossFadeTo(this,t),this}advance(e){this.playing&&!this.paused&&(this.advanceFade(Math.abs(e)),this.elapsedTime+=e*this.timeScale,this.time=this.resolveLocalTime(this.elapsedTime),this.hasFinished()&&(this.playing=!1))}get shouldApply(){return(this.playing||this.hasFinished())&&this.weight>0}scheduleFade(e,t){return t<=0?(this.weight=e,this.fade=null):this.fade={duration:t,elapsedTime:0,startWeight:this.weight,endWeight:e},this}advanceFade(e){if(!this.fade)return;this.fade.elapsedTime+=e;let t=Math.min(this.fade.elapsedTime/this.fade.duration,1);this.weight=this.fade.startWeight+(this.fade.endWeight-this.fade.startWeight)*t,1===t&&(this.fade=null)}hasFinished(){let e=this.clip.duration;return e<=0?"once"===this.loop:"once"===this.loop?this.elapsedTime>=e||this.elapsedTime<0:Number.isFinite(this.repetitions)&&Math.abs(this.elapsedTime)>=e*this.repetitions}resolveLocalTime(e){let t=this.clip.duration;if(t<=0)return 0;if("once"===this.loop)return Math.min(Math.max(e,0),t);if(Number.isFinite(this.repetitions)&&Math.abs(e)>=t*this.repetitions)return"ping-pong"===this.loop&&this.repetitions%2==0||e<0?0:t;let r=e>=0&&e<t?e:(e%t+t)%t;return"repeat"===this.loop||0===Math.abs(Math.floor(e/t)%2)?r:t-r}}class ev{time=0;timeScale=1;clips=new Map;actions=new Map;initialValues=new Map;constructor(e=[]){e.forEach(e=>this.addClip(e))}addClip(e){return this.clips.set(e.name,e),this}clipAction(e,t){let r="string"==typeof e?this.clips.get(e):e;if(!r)throw Error(`Unknown animation clip: ${e}`);this.addClip(r);let i=this.actions.get(r);return i||(i=new eb(this,r,t),this.actions.set(r,i)),i}getAction(e){let t=this.clips.get(e);return t?this.actions.get(t):void 0}update(e){return this.advance(e),this.applyValues(),this}advance(e){let t=e*this.timeScale;return this.time+=t,this.actions.forEach(e=>e.advance(t)),this}setTime(e){return this.time=e,this.actions.forEach(t=>{t.paused||t.setTime(e*t.timeScale)}),this.applyValues(),this}stopAllAction(){return this.actions.forEach(e=>e.stop()),this}applyValues(){let e=new Map;this.actions.forEach(t=>{(t.shouldApply||t.playing&&0===t.weight)&&t.clip.tracks.forEach(r=>{let i=r.evaluate(t.time);if(!i)return;let a=r.binding.id||r.binding;if(!this.initialValues.has(a)){let e=r.binding.getValue?.();e&&this.initialValues.set(a,[...e])}if(0===t.weight&&!this.initialValues.has(a))return;let n=e.get(a);if(!n)return void e.set(a,{binding:r.binding,value:[...i],valueType:r.valueType,weight:t.weight});if(0===t.weight)return;let o=n.weight+t.weight,s=t.weight/o;n.value="quaternion"===r.valueType?ed(n.value,i,s):n.value.map((e,t)=>e+(i[t]-e)*s),n.weight=o})}),e.forEach(({binding:e,value:t,valueType:r,weight:i},a)=>{let n=i<1?this.initialValues.get(a):void 0;n&&n.length===t.length&&(t="quaternion"===r?ed(n,t,i):t.map((e,t)=>n[t]+(e-n[t])*i)),e.setValue(t)})}}class eS extends em{mixer;activeClip;onUpdate;previousTimeSeconds;constructor(e,t,r={}){if(super(e),this.mixer=t,this.onUpdate=r.onUpdate,this.activeClip=e[0]?.name,!1===r.autoplay)for(let t of e)t.playing=!1,t.action.stop();else"first"===r.autoplay&&this.activeClip&&this.selectClip(this.activeClip)}setUpdateHandler(e){return this.onUpdate=e,this}setTime(e){let t=e/1e3,r=void 0===this.previousTimeSeconds?0:t-this.previousTimeSeconds;this.previousTimeSeconds=t;let i=r*this.mixer.timeScale;this.clips.forEach(e=>{if(!e.playing)return void e.action.stop();if(e.action.paused)return;e.action.resume();let r=Math.max(0,t-e.startTime)*e.speed;e.action.setTime(r-i*e.action.timeScale)}),this.mixer.update(r),this.onUpdate?.()}update(e){this.mixer.update(e),this.onUpdate?.()}selectClip(e,t={}){let r=this.clips.find(t=>t.name===e);if(!r)throw Error(`Unknown animation clip: ${e}`);let i=this.clips.find(e=>e.name===this.activeClip),a=t.crossFadeDuration||0;for(let e of this.clips)e===r||a>0&&e===i||(e.playing=!1,e.action.stop());return r.playing=!0,a>0&&i&&i!==r?(i.playing=!0,i.action.crossFadeTo(r.action,a)):r.action.reset().setEffectiveWeight(1).play(),this.activeClip=e,r}}class e_ extends eu{clip;mixer;action;constructor(e,t=new ev){super({name:e.name}),this.clip=e,this.mixer=t,this.action=t.clipAction(e).play()}applyTime(e){this.action.setTime(e),this.mixer.update(0)}}class ex{name;tracks;duration;constructor(e){this.name=e.name||"unnamed",this.tracks=e.tracks,this.duration=e.duration??Math.max(0,...e.tracks.map(e=>e.duration))}}class eT{name;times;values;interpolation;valueType;binding;constructor(e){this.name=e.name||e.binding.id||"unnamed",this.times=e.times,this.values=e.values,this.interpolation=e.interpolation||"LINEAR",this.valueType=e.valueType||"vector",this.binding=e.binding}get duration(){return this.times[this.times.length-1]||0}get sampler(){return{input:this.times,output:this.values,interpolation:this.interpolation}}evaluate(e){return function(e,t,r="vector"){var i,a,n,o,s,l,c,f,p;let{input:u,output:m,interpolation:d="LINEAR"}=t;if(!u.length||!m.length||!Number.isFinite(e))return null;let h=u.length-1;if(e<=u[0]||0===h)return eh(m,d,0,r);if(e>=u[h])return eh(m,d,h,r);let g=0,b=h;for(;b-g>1;){let t=Math.floor((g+b)/2);u[t]<=e?g=t:b=t}let v=u[g],S=u[b]-v;if(S<=0||"STEP"===d)return eh(m,d,g,r);let _=(e-v)/S;switch(d){case"LINEAR":{let e=m[g],t=m[b];if(!e||!t)return null;return"quaternion"===r?ed(e,t,_):(i=e,a=t,n=_,i.map((e,t)=>(1-n)*e+n*a[t]))}case"CUBICSPLINE":{let e,t,i=m[3*g+1],a=m[3*g+2],n=m[3*b],u=m[3*b+1];if(!i||!a||!n||!u)return null;let d=(o=i,s=a,l=n,c=u,f=S,t=(e=(p=_)*p)*p,o.map((r,i)=>(2*t-3*e+1)*r+(t-2*e+p)*s[i]*f+(-2*t+3*e)*c[i]+(t-e)*l[i]*f));return"quaternion"===r?eg(d):d}default:return null}}(e,this.sampler,this.valueType)}}class eR extends e_{animation;gltfNodeIdToNodeMap;materials;materialTextureTransformState;constructor(e){let t=new Map;super(new ex({name:e.animation.name||"unnamed",tracks:e.animation.channels.map(r=>(function(e,t,r){var i,a,n;let o=function(e){switch(e){case"STEP":case"LINEAR":case"CUBICSPLINE":return e;default:throw Error(`Unsupported animation interpolation: ${e}`)}}(e.sampler.interpolation);if("property"===e.type){let r,n;if(!t.properties)throw Error(`Missing runtime property adapter for ${e.pointer}`);return new eT({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:o,valueType:e.pointer.endsWith("/inertiaOrientation")?"quaternion":"vector",binding:(i=t.properties,a=e.pointer,n="boolean"==typeof(r=()=>{let e=i.get(a);if(!e||!e.every(e=>"number"==typeof e||"boolean"==typeof e))throw Error("Missing numeric animation property");return e})()[0],{id:a,getValue:()=>r().map(Number),setValue:e=>{if(!i.set(a,n?[0!==e[0]]:[...e]))throw Error("Animation property is not writable")}})})}if("node"===e.type)return new eT({name:`${e.targetNodeId}.${e.path}`,times:e.sampler.input,values:e.sampler.output,interpolation:o,valueType:"rotation"===e.path?"quaternion":"vector",binding:function(e,t,r={}){return{id:r.id,getValue:()=>{switch(t){case"translation":return Array.from(e.position);case"rotation":return Array.from(e.rotation);case"scale":return Array.from(e.scale);case"weights":return Array.from(e.userData.morphWeights??[]);case"visibility":return[+!!e.display];case"selectable":return[+!!e.selectable];case"hoverable":return[+!!e.hoverable]}},setValue:i=>{switch(t){case"translation":e.setPosition(i).updateMatrix();break;case"rotation":e.setRotation(i).updateMatrix();break;case"scale":e.setScale(i).updateMatrix();break;case"weights":et(e,i);break;case"selectable":e.setProps({selectable:0!==i[0]});break;case"hoverable":e.setProps({hoverable:0!==i[0]});break;case"visibility":e.setProps({display:0!==i[0]}),r.onVisibilityChange?.()}}}}(function(e,t){let r=e.get(t);if(!r)throw Error(`Cannot find animation target node ${t}`);return r}(t.gltfNodeIdToNodeMap,e.targetNodeId),e.path,{id:`node:${e.targetNodeId}:${e.path}`,onVisibilityChange:t.onVisibilityChange})});if("camera"===e.type||"light"===e.type){let r="camera"===e.type?(t.cameras||[])[e.targetCameraIndex]?.[e.projection]:(t.lightDefinitions||[])[e.targetLightIndex];if(!r)throw Error(`Cannot find animation target ${e.pointer}`);let i=r;return"light"===e.type&&("innerConeAngle"===e.property||"outerConeAngle"===e.property)&&(r.spot||={},i=r.spot),new eT({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:o,binding:function(e,t,r={}){return{id:r.id,getValue:()=>{let i=e[t];return Array.isArray(i)?void 0===r.component?[...i]:[i[r.component]]:"number"==typeof i?[i]:[]},setValue:i=>{if(void 0!==r.component){let a=[...e[t]||[1,1,1]];a[r.component]=i[0],e[t]=a}else e[t]=1===i.length?i[0]:[...i];r.onChange?.()}}}(i,e.property,{id:e.pointer,component:"light"===e.type?e.component:void 0,onChange:"light"===e.type?t.onLightChange:void 0})})}let s=(t.materials||[])[e.targetMaterialIndex];if(!s)throw Error(`Cannot find animation target material ${e.targetMaterialIndex} for ${e.pointer}`);return new eT({name:e.pointer,times:e.sampler.input,values:e.sampler.output,interpolation:o,binding:"material"===e.type?(n=[...new Set([s,...t.materialInstances?.get(e.targetMaterialIndex)||[]])],{id:e.pointer,getValue:()=>{var t,r;let i,a;return t=n[0],r=e,i=t.shaderInputs.getUniformValues(),Array.isArray(a=i.pbrMaterial?.[r.property])?void 0===r.component?[...a]:[a[r.component]]:"number"==typeof a?[a]:[]},setValue:t=>{for(let r of n)!function(e,t,r){let i=void 0!==t.component?{[t.property]:function(e,t,r){let i=[...e];return i[t]=r,i}(function(e,t){let r=e.shaderInputs.getUniformValues(),i=r.pbrMaterial?.[t];return Array.isArray(i)?[...i]:[]}(e,t.property),t.component,r[0])}:{[t.property]:1===r.length?r[0]:r};e.setProps({pbrMaterial:i})}(r,e,t)}}):function(e,t,r=new Map,i){return{id:i,setValue:i=>{for(let a of e)!function(e,t,r,i){let a=function(e,t,r){let i=e.get(t)||{},a=i[r.textureSlot];return a||(a={offset:[...r.baseTransform.offset],rotation:r.baseTransform.rotation,scale:[...r.baseTransform.scale]},i[r.textureSlot]=a,e.set(t,i)),a}(i,e,t);switch(t.path){case"offset":void 0!==t.component?a.offset[t.component]=r[0]:a.offset=[r[0],r[1]];break;case"rotation":a.rotation=r[0];break;case"scale":void 0!==t.component?a.scale[t.component]=r[0]:a.scale=[r[0],r[1]]}e.setProps({pbrMaterial:{[t.uniform]:(0,Z.d)(t.baseTransform,a)}})}(a,t,i,r)}}}([...new Set([s,...t.materialInstances?.get(e.targetMaterialIndex)||[]])],{...e,uniform:(0,Q.lz)(e.textureSlot).uvTransformUniform},r,e.pointer)})})(r,e,t))}),e.mixer),this.animation=e.animation,this.gltfNodeIdToNodeMap=e.gltfNodeIdToNodeMap,this.materials=e.materials||[],this.materialTextureTransformState=t}}class eM extends eS{constructor(e){let t=new ev;super(e.animations.map((r,i)=>{let a=r.name||`Animation-${i}`;return new eR({properties:e.properties,gltfNodeIdToNodeMap:e.gltfNodeIdToNodeMap,onVisibilityChange:e.onVisibilityChange,cameras:e.cameras,lightDefinitions:e.lightDefinitions,onLightChange:e.onLightChange,materials:e.materials,materialInstances:e.materialInstances,mixer:t,animation:{name:a,channels:r.channels}})}),t,e)}}class eI{bindings;scenes;constructor(e){this.scenes=e.scenes,this.bindings=e.bindings,this.update()}update(){if(0===this.bindings.length)return;let e=new Map;for(let t of this.scenes)t.preorderTraversal((t,{worldMatrix:r})=>{t instanceof c.o&&e.set(t,new u.k(r))});for(let t of this.bindings)for(let r of(!function(e){let{joints:t,meshNode:r,worldMatrices:i,inverseBindMatrices:a,target:n}=e,o=t.length,s=n&&n.length===16*o?n:new Float32Array(16*o),l=r?i.get(r)||r.matrix:void 0,c=l?new u.k(l).invert():null;for(let e=0;e<o;e++){let r=t[e],n=i.get(r)||r.matrix,o=c?new u.k(c).multiplyRight(n):new u.k(n),l=16*e;if(a&&a.length>=l+16){let e=new u.k;for(let t=0;t<16;t++)e[t]=a[l+t];o.multiplyRight(e)}s.set(o,l)}}({joints:t.joints,meshNode:t.node,worldMatrices:e,inverseBindMatrices:t.inverseBindMatrices,target:t.jointMatrices}),t.skinJointMatrices&&(t.skinJointMatrices instanceof T.h?t.skinJointMatrices.write(t.jointMatrices):t.skinJointMatrices.writeData(t.jointMatrices,{width:4*t.joints.length,height:1})),t.models))r.model.shaderInputs.setProps({skin:t.skinJointMatrices?{jointMatrices:[],skinJointMatrices:t.skinJointMatrices}:{jointMatrices:t.jointMatrices}})}getBinding(e){return this.bindings.find(t=>t.node===e)}destroy(){for(let e of this.bindings)e.skinJointMatrices?.destroy()}}class eC{variants;names;activeVariant=null;bindings;constructor(e){this.variants=e.variants,this.names=this.variants.map(e=>e.name),this.bindings=e.bindings}selectVariant(e){let t=this.variants.find(t=>t.name===e);if(!t)throw Error(`Unknown material variant: ${e}`);for(let{modelNode:e,...r}of this.bindings){let i=r.mappings.get(t.index);e.model.setMaterial(i?.material||r.defaultMaterial),e.model.setParameters(i?.parameters||r.defaultParameters)}this.activeVariant=e}resetVariant(){for(let{modelNode:e,...t}of this.bindings)e.model.setMaterial(t.defaultMaterial),e.model.setParameters(t.defaultParameters);this.activeVariant=null}}let eA={supportLevel:"none",standardStatus:"unknown",comment:"Not currently listed in the luma.gl glTF extension support registry."},ey={KHR_physics_rigid_bodies:{supportLevel:"none",standardStatus:"draft",comment:"The optional @luma.gl/engine/gltf-physics adapter validates a pinned subset; ordinary scenegraph loading does not execute physics."},KHR_implicit_shapes:{supportLevel:"none",standardStatus:"draft",comment:"The optional physics adapter supports sphere/box colliders; shapes alone do not define rendering or simulation."},EXT_lights_area:{supportLevel:"loader-only",standardStatus:"draft",comment:"Opt-in AreaLightController feeds the shared Light API. PBR supports four rect/disk lights with LTC diffuse, isotropic GGX and clearcoat; disks use a 32-gon and other lobes retain numerical integration. No shadows or indirect light; strict loading does not claim full draft conformance."},KHR_lightmap:{supportLevel:"loader-only",standardStatus:"draft",comment:"Draft irradiance rendering supports UV0/UV1, node overrides and atlas instances through individual draws. Strict required-extension loading does not claim full draft conformance."},KHR_billboard:{supportLevel:"loader-only",standardStatus:"draft",comment:"Optional BillboardController supports an explicit full-axis profile. Constrained-axis semantics remain ambiguous; strict required-extension loading does not claim full support."},KHR_audio_emitter:{supportLevel:"parsed-and-wired",standardStatus:"draft",comment:"Opt-in AudioController provides Web Audio playback; the application owns context activation and listener updates."},KHR_audio_environment:{supportLevel:"loader-only",standardStatus:"draft",comment:"Opt-in listener selection, environment zones, emitter sends and impulse-response or approximate parametric reverb. Doppler, air absorption and listener graph hooks remain unsupported."},KHR_audio_graph:{supportLevel:"loader-only",standardStatus:"draft",comment:"Opt-in AudioController implements a processing and scheduled-source profile; animation pointers and general pulse-width synthesis remain unsupported."},KHR_draco_mesh_compression:{supportLevel:"built-in",standardStatus:"ratified",comment:"Decoded by loaders.gl before luma.gl builds the scenegraph."},EXT_meshopt_compression:{supportLevel:"built-in",standardStatus:"ratified",comment:"EXT meshopt-compressed buffer views are decoded by loaders.gl before rendering."},KHR_meshopt_compression:{supportLevel:"built-in",standardStatus:"release-candidate",comment:"Decoded by loaders.gl v5 before luma.gl builds the scenegraph."},KHR_mesh_quantization:{supportLevel:"built-in",standardStatus:"ratified",comment:"Loader-materialized quantized accessors retain their typed values and normalization."},EXT_mesh_features:{supportLevel:"loader-only",standardStatus:"unknown",comment:"Feature identifiers are decoded by loaders.gl; automatic rendering and picking are application-owned."},EXT_structural_metadata:{supportLevel:"loader-only",standardStatus:"unknown",comment:"Structural metadata is decoded by loaders.gl; automatic rendering and querying are application-owned."},KHR_gaussian_splatting:{supportLevel:"none",standardStatus:"ratified",comment:"A splat adapter exists, but ordinary glTF scene creation does not integrate it."},KHR_interactivity:{supportLevel:"none",standardStatus:"ratified",comment:"The subset interpreter is not integrated into ordinary glTF scene creation."},KHR_node_selectability:{supportLevel:"none",standardStatus:"ratified",comment:"Authored selection semantics are not wired into scene picking."},KHR_node_hoverability:{supportLevel:"none",standardStatus:"ratified",comment:"Authored hover semantics are not wired into pointer dispatch."},KHR_lights_punctual:{supportLevel:"built-in",standardStatus:"ratified",comment:"Parsed into luma.gl Light objects."},KHR_materials_unlit:{supportLevel:"built-in",standardStatus:"ratified",comment:"Unlit materials bypass the default lighting path."},KHR_materials_emissive_strength:{supportLevel:"built-in",standardStatus:"ratified",comment:"Applied by the stock PBR shader."},KHR_texture_basisu:{supportLevel:"built-in",standardStatus:"ratified",comment:"BasisU / KTX2 textures pass through when the device supports them."},KHR_texture_transform:{supportLevel:"built-in",standardStatus:"ratified",comment:"Per-slot UV transforms and animated pointers are applied at runtime; avoid duplicate legacy loader-side baking."},EXT_texture_webp:{supportLevel:"loader-only",standardStatus:"ratified",comment:"Texture source is resolved during load; final support depends on browser and device decode support."},EXT_texture_avif:{supportLevel:"none",standardStatus:"unknown",comment:"Source selection depends on the loaders.gl version and decoder; luma.gl does not independently resolve AVIF sources."},KHR_materials_specular:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now applies specular factors and textures to the dielectric F0 term."},KHR_materials_ior:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now drives dielectric reflectance from the glTF IOR value."},KHR_materials_transmission:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now applies transmission to the base layer and exposes transparency through alpha, without a scene-color refraction buffer."},KHR_materials_volume:{supportLevel:"built-in",standardStatus:"ratified",comment:"Thickness and attenuation now tint transmitted light in the stock shader."},KHR_materials_clearcoat:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now adds a secondary clearcoat specular lobe."},KHR_materials_sheen:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now adds a sheen lobe for cloth-like materials."},KHR_materials_iridescence:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now tints specular response with a view-dependent thin-film iridescence approximation."},KHR_materials_anisotropy:{supportLevel:"built-in",standardStatus:"ratified",comment:"The stock shader now shapes highlights and IBL response with an anisotropy-direction approximation."},KHR_materials_pbrSpecularGlossiness:{supportLevel:"loader-only",standardStatus:"archived",comment:"Extension data can be loaded, but it is not translated into the default metallic-roughness material path."},KHR_materials_variants:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Primitive material variants can be selected and restored on the generated scenegraph."},EXT_mesh_gpu_instancing:{supportLevel:"built-in",standardStatus:"ratified",comment:"Accessor-backed instance transforms use one instanced draw per source primitive."},KHR_node_visibility:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Recursive node visibility controls rendered geometry, punctual lights, and animation."},KHR_animation_pointer:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"Node transforms, morph weights and visibility, material factors, texture transforms, camera projections, and punctual lights are wired to runtime updates."},EXT_materials_bump:{supportLevel:"built-in",standardStatus:"draft",comment:"The experimental bump-map draft perturbs the canonical surface normal from a linear height texture."},KHR_materials_diffuse_transmission:{supportLevel:"built-in",standardStatus:"release-candidate",comment:"The Khronos release candidate adds energy-conserving back-lit diffuse transmission and independent color/factor textures."},KHR_materials_dispersion:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"The canonical PBR shader separates red, green, and blue transmission using wavelength-dependent refraction."},KHR_materials_scatter:{supportLevel:"loader-only",standardStatus:"draft",comment:"Thin-wall rendering supports transmission-gated forward/backward diffuse scattering, alpha strength textures and sRGB scatter color. Volumetric mode is rejected; strict required-extension loading does not claim full draft conformance."},KHR_materials_volume_scatter:{supportLevel:"parsed-and-wired",standardStatus:"draft",comment:"The unratified volume-scattering draft is approximated per surface; random-walk and screen-space diffusion are not implemented."},KHR_xmp:{supportLevel:"none",standardStatus:"archived",comment:"Metadata payloads remain in the loaded glTF, but luma.gl does not interpret them."},KHR_xmp_json_ld:{supportLevel:"parsed-and-wired",standardStatus:"ratified",comment:"XMP packet references are available through scene metadata."},EXT_lights_image_based:{supportLevel:"none",standardStatus:"multi-vendor",comment:"Use loadPBREnvironment() or custom environment setup instead."},EXT_texture_video:{supportLevel:"none",standardStatus:"multi-vendor",comment:"Video textures are not created automatically by the stock pipeline."},MSFT_lod:{supportLevel:"parsed-and-wired",standardStatus:"vendor",comment:"Node levels are parsed and selected by opt-in animated crowds; material LOD and GPU-driven selection are not implemented."}};function eE(e,t){var r;let i,a=Array.from((r=e,eN(i=new Set,r.extensionsUsed),eN(i,r.extensionsRequired),eN(i,r.extensionsRemoved),eN(i,Object.keys(r.extensions||{})),(r.lights?.length||(r.nodes||[]).some(e=>"light"in e))&&i.add("KHR_lights_punctual"),(r.materials||[]).some(e=>e.unlit||e.extensions?.KHR_materials_unlit)&&i.add("KHR_materials_unlit"),i)).sort(),n=new Set(e.extensionsRequired||[]);return new Map(a.map(r=>{var i;let a=ey[r]||eA,o=function(e,t,r,i){if("KHR_texture_basisu"!==e||!i)return t;let a=(function(e){let t=[];for(let r of e.textures||[]){let e=r?.source?.image;if(!e?.compressed)continue;let i=Array.isArray(e.data)?e.data[0]:Array.isArray(e.mipmaps)?e.mipmaps[0]:void 0;t.push(i?.textureFormat??null)}return t})(r).find(e=>null===e||!i.isTextureFormatSupported(e));return void 0===a?t:{supportLevel:"none",comment:null===a?`The ${i.type} device cannot use a BasisU texture whose transcoded GPU format is missing.`:`The ${i.type} device does not support the transcoded BasisU texture format '${a}'.`}}(r,a,e,t);return[r,{extensionName:r,required:n.has(r),supported:"built-in"===(i=o.supportLevel)||"parsed-and-wired"===i,supportLevel:o.supportLevel,standardStatus:a.standardStatus,comment:o.comment}]}))}function eN(e,t=[]){for(let r of t)e.add(r)}function eL(e){switch(e){case"translation":case"rotation":case"scale":case"weights":return e;default:return null}}function eP(e){let t=eU(e);if(t){let e=ey[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`no runtime target exists for material property "${e.join("/")}"`}function eU(e){let t=e.indexOf("extensions"),r=e[t+1];return t>=0&&r?r:null}function ew(e,t){k.R.warn(`KHR_animation_pointer target ${e} will be skipped because ${t}`)()}function eV(e){if(e.value)return eF(!(e.value instanceof BigInt64Array)&&!(e.value instanceof BigUint64Array),"glTF animation accessors cannot use BigInt component arrays"),{value:e.value,components:e.components};let t=e.bufferView?.data;eF(void 0!==t),eF(5126===e.componentType);let r="SCALAR"===e.type?1:Number(e.type.slice(3));return{value:new Float32Array(t.buffer,t.byteOffset+(e.byteOffset||0),e.count*r),components:r}}function eF(e,t){if(!e)throw Error(t)}function eO(e){let t=[];return e.gltf.nodes.forEach((r,i)=>{let a=r.extensions?.KHR_billboard;if(!a)return;let n=e.gltfNodeIndexToNodeMap.get(i);(0,f.v)(n);let o=a.rotationAxis||["X","Y","Z"];(0,f.v)("y"===o?!0===e.allowLegacyYAxis:3===o.length&&3===new Set(o).size&&o.every(e=>["X","Y","Z"].includes(e))),t.push({node:n,definition:{...a,...a.viewDirection?{viewDirection:[...a.viewDirection]}:{},...a.up?{up:[...a.up]}:{},rotationAxis:"y"===a.rotationAxis?"y":"all"},matrixAuthored:!!r.matrix})}),{scenes:e.scenes,bindings:t}}function eH(e,t,r){var p;let d,h,g,S=function(e){let t=new i,r=e.extensions?.KHR_xmp_json_ld,a=r?.packets||[];for(let[r,i]of[["asset",[e.asset]],["scene",e.scenes||[]],["node",e.nodes||[]],["mesh",e.meshes||[]],["material",e.materials||[]],["image",e.images||[]],["animation",e.animations||[]]])i.forEach((e,i)=>{let n=e?.extensions?.KHR_xmp_json_ld;if(!n)return;let o=n.packet;if(!Number.isInteger(o)||o<0||o>=a.length)throw Error(`glTF: invalid XMP packet index ${o}`);let s=a[o];if(!s||"object"!=typeof s||Array.isArray(s))throw Error(`glTF: invalid XMP packet ${o}`);t.set(r,i,s)});return t}(t);if(r?.strictExtensions&&function(e,t){let r=Array.from(eE(e,t).values()).filter(e=>e.required&&!e.supported);if(r.length)throw Error(`Unsupported required glTF extensions: ${r.map(e=>e.extensionName).join(", ")}. ${r.map(e=>`${e.extensionName}: ${e.comment}`).join(" ")}`)}(t,e),r?.billboards){let e=new Map;t.nodes.forEach((t,r)=>{t.extensions?.KHR_billboard&&e.set(r,new c.o)}),new m(eO({gltf:t,scenes:[],gltfNodeIndexToNodeMap:e,allowLegacyYAxis:r.billboards.allowLegacyYAxis})).destroy()}let{scenes:_,materials:x,gltfMeshIdToNodeMap:M,gltfNodeIdToNodeMap:I,gltfNodeIndexToNodeMap:C,generatedTextures:A,materialInstances:y}=function(e,t,r={}){let i=new Set,a=new Map,n={...ea,...r,generatedTextures:i,materialInstances:a},o=new L(e,{modules:[O.s]}),s=(t.materials||[]).map((r,i)=>{var a,s;return q(e,{id:(a=r,s=i,a.name||a.id||`material-${s}`),parsedPPBRMaterial:en(e,r,{TEXCOORD_1:!0},{...n,gltf:t,validateAttributes:!1,materialResourcesOnly:!0}),materialFactory:o})}),l=new Map;(t.materials||[]).forEach((e,t)=>{l.set(e.id,s[t])});let p=new Map;t.meshes.forEach((r,i)=>{let a=eo(e,r,t,l,{...n,validateLightmapAttributes:!1});p.set(r.id,a)});let m=new Map,d=new Map,h=new Set,g=new Set,b=new Set;return t.nodes.forEach((e,t)=>{var r;let i=(r=e,new c.o({id:r.name||r.id,children:[],matrix:r.matrix,display:r.extensions?.KHR_node_visibility?.visible!==!1,selectable:r.extensions?.KHR_node_selectability?.selectable!==!1,hoverable:r.extensions?.KHR_node_hoverability?.hoverable!==!1,position:r.translation,rotation:r.rotation,scale:r.scale}));m.set(t,i),d.set(e.id,i)}),t.nodes.forEach((r,i)=>{if(m.get(i).add((r.children??[]).map(({id:e})=>{let t=d.get(e);if(!t)throw Error(`Cannot find child ${e} of node ${i}`);return t})),r.mesh){let a=r.mesh,o=function(e,t){let r,i=t.extensions?.EXT_mesh_gpu_instancing?.attributes;if(!i||"object"!=typeof i)return null;let a={};for(let[t,n]of Object.entries(i)){let i="number"==typeof n?e.accessors[n]:n;if(!i||!ArrayBuffer.isView(i.value))throw Error(`Invalid glTF instance accessor for ${t}`);if(void 0!==r&&i.count!==r)throw Error("glTF instance attributes must have matching accessor counts");r=i.count,a[t]={value:i.value,size:i.components||function(e){switch(e){case"VEC2":return 2;case"VEC3":return 3;case"VEC4":return 4;default:return 1}}(i.type),count:i.count,normalized:!!i.normalized}}let n=[];for(let e=0;e<(r||0);e++){let t=J(a.TRANSLATION,e,[0,0,0]),r=J(a.ROTATION,e,[0,0,0,1]),i=J(a.SCALE,e,[1,1,1]),o=Math.hypot(...r);if(o>0)for(let e=0;e<r.length;e++)r[e]/=o;n.push(new u.k().translate(t).multiplyRight(new u.k().fromQuaternion(r)).scale(i))}return{matrices:n,attributes:a}}(t,r),s=r.extensions?.KHR_lightmap;for(let[e,t]of(s&&function(e,t){(0,f.v)(e.lightmaps.length>0);let r=new Set;for(let i of e.lightmaps)(0,f.v)(Number.isInteger(i.primitive)&&i.primitive>=0&&i.primitive<t),(0,f.v)(!r.has(i.primitive)),r.add(i.primitive)}(s,a.primitives.length),a.primitives.entries())){let r=s?.lightmaps.find(t=>t.primitive===e)||t.material?.extensions?.KHR_lightmap;if(r){let e=(0,Q.CC)(r.lightmapTexture);(0,f.v)((0===e||1===e)&&!!t.attributes[`TEXCOORD_${e}`])}}let c=a.primitives.some(e=>!!e.targets?.length),d=s||o||n.publishedTransforms&&g.has(a.id)||c&&h.has(a.id)?eo(e,a,t,l,n,o||void 0,s):p.get(a.id);if(!d)throw Error(`Cannot find mesh child ${r.mesh.id} of node ${i}`);let v=m.get(i),S=p.get(a.id),_=g.has(a.id)&&(void 0!==r.skin||b.has(a.id))&&d===S?eo(e,a,t,l,n):d;if(v.add(_),v.userData.gltfMesh=_,g.add(a.id),void 0!==r.skin&&b.add(a.id),c){h.add(a.id);let e=a.primitives.find(e=>e.targets?.length)?.targets?.length||0,t=r.weights||a.weights||Array(e).fill(0);v.userData.morphMeshes=[_],n.modelOptions?.userData?.gltfAnimatedCrowd?v.userData.morphWeights=[...t]:et(v,t)}}}),{scenes:t.scenes.map(e=>{let t=(e.nodes||[]).map(({id:t})=>{let r=d.get(t);if(!r)throw Error(`Cannot find child ${t} of scene ${e.name||e.id}`);return r});return new c.o({id:e.name||e.id,children:t})}),materials:s,gltfMeshIdToNodeMap:p,gltfNodeIdToNodeMap:d,gltfNodeIndexToNodeMap:m,generatedTextures:i,materialInstances:a}}(e,t,r),E=r?.billboards?new m(eO({gltf:t,scenes:_,gltfNodeIndexToNodeMap:C,allowLegacyYAxis:r.billboards.allowLegacyYAxis})):null;_.forEach((e,r)=>{let i=S.get("scene",r);i&&(e.metadata.xmp=i);let a=t.scenes[r]?.extensions?.FB_geometry_metadata;a&&(e.metadata["fb:geometry"]=a)});let N=new Map;t.meshes.forEach((e,t)=>{let r=S.get("mesh",t);if(!r)return;N.set(e.id,r);let i=M.get(e.id);i&&(i.metadata.xmp=r)}),C.forEach((e,r)=>{let i=S.get("node",r);if(i&&(e.metadata.xmp=i),!N.size)return;let a=t.nodes[r]?.mesh,n=a&&N.get(a.id),o=e.userData.gltfMesh;n&&o instanceof c.o&&(o.metadata.xmp=n)}),x.forEach((e,t)=>{let r=S.get("material",t);if(r)for(let i of(e.metadata.xmp=r,y.get(t)||[]))i.metadata.xmp=r});let P=function(e,t){let r=e.nodes??[],i=l(n(e.extensions?.[a]??{}).physicsJoints),c=[],f=[];for(let e of t.keys()){let p=r[e].extensions?.[a],u=void 0===p?void 0:n(p).joint;if(void 0!==u)try{let r=n(u);o(r,["joint","connectedNode","enableCollision"]);let a=s(r.joint),f=s(r.connectedNode);if(void 0===a||!Number.isInteger(a)||!i[a]||void 0===f)throw Error("Invalid joint reference");if(void 0!==r.enableCollision&&"boolean"!=typeof r.enableCollision)throw Error("Invalid connected collision flag");let p=n(i[a]);o(p,["limits","drives"]);let m=t.get(e),d=t.get(f);if(!m||!d)throw Error("Joint attachment must be in the selected scene");let h=[],g=[];for(let e of l(p.limits)){let t=n(e);if(o(t,["linearAxes","angularAxes","min","max","stiffness","damping"]),void 0===t.linearAxes==(void 0===t.angularAxes))throw Error("A limit needs exactly one axis kind");let r=l(t.linearAxes??t.angularAxes).map(e=>{if("number"!=typeof e)throw Error("Invalid limit axis");return e});h.push({axes:r,angular:void 0!==t.angularAxes,minimum:s(t.min),maximum:s(t.max),stiffness:s(t.stiffness),damping:s(t.damping)})}for(let e of l(p.drives)){let t=n(e);if(o(t,["type","mode","axis","maxForce","positionTarget","velocityTarget","stiffness","damping"]),!["linear","angular"].includes(String(t.type))||"force"!==t.mode&&"acceleration"!==t.mode)throw Error("Invalid drive type");if(void 0===t.positionTarget!=(void 0===t.stiffness)||void 0===t.velocityTarget!=(void 0===t.damping))throw Error("Drive targets require matching response coefficients");let r=s(t.axis);if(void 0===r)throw Error("Missing drive axis");g.push({angular:"angular"===t.type,axis:r,mode:"acceleration"===t.mode?"acceleration":"force",maximumForce:s(t.maxForce),positionTarget:s(t.positionTarget),velocityTarget:s(t.velocityTarget),stiffness:s(t.stiffness),damping:s(t.damping)})}c.push({nodeIndex:e,connectedNodeIndex:f,jointIndex:a,joint:{first:m,second:d,limits:h,drives:g,collideConnected:!0===r.enableCollision}})}catch(t){f.push({code:"unsupported-or-invalid-joint",path:`/nodes/${e}/extensions/${a}/joint`,message:t instanceof Error?t.message:String(t)})}}return{declarations:c,issues:f}}(t,C),U=new b(P.declarations.map(e=>e.joint)),w=(d=t.animations||[],h=new Map,g=new Map,d.flatMap((e,r)=>{let i=e.name||`Animation-${r}`,a=new Map,n=e.channels.flatMap(({sampler:r,target:i})=>{let n=function(e,t){let r;if("weights"===t.path)r=t.node;else{if("pointer"!==t.path)return;let e=t.extensions?.KHR_animation_pointer?.pointer,i="string"==typeof e?/^\/nodes\/(\d+)\/weights$/.exec(e):null;if(!i)return;r=Number(i[1])}let i=e.nodes[r??0],a="number"==typeof i?.mesh?e.meshes[i.mesh]:i?.mesh;return i?.weights?.length||a?.weights?.length||a?.primitives?.[0]?.targets?.length||1}(t,i),o=`${r}:${n??0}`,s=a.get(o);if(!s){let i=e.samplers[r];if(!i)throw Error(`Cannot find animation sampler ${r}`);let{input:l,interpolation:c="LINEAR",output:f}=i,p=function(e,t){if(t.has(e))return t.get(e);let{value:r,components:i}=eV(e);eF(1===i,"accessorToJsArray1D must have exactly 1 component");let a=Array.from(r);return t.set(e,a),a}(t.accessors[l],h),u=function(e,t){if(t.has(e))return t.get(e);let{value:r,components:i}=eV(e);eF(i>=1,"accessorToJsArray2D must have at least 1 component");let a=[];for(let e=0;e<r.length;e+=i)a.push(Array.from(r.slice(e,e+i)));return t.set(e,a),a}(t.accessors[f],g);s={input:p,interpolation:c,output:void 0!==n?function(e,t,r,i){let a=e.length/(Math.max(t,1)*("CUBICSPLINE"===r?3:1)),n=i>1?i:Number.isInteger(a)&&a>1?a:i;if(n<=1)return e;let o=e.flat(),s=[];for(let e=0;e<o.length;e+=n)s.push(o.slice(e,e+n));return s}(u,p.length,c,n):u},a.set(o,s)}let l=function(e,t,r){if("pointer"===t.path)return function(e,t,r){let i=t.extensions?.KHR_animation_pointer?.pointer;if("string"!=typeof i||!i.startsWith("/"))return k.R.warn("KHR_animation_pointer channel is missing a valid JSON pointer and will be skipped")(),null;if(function e(t){let r=/^(.*)\/(0|[1-9]\d*)$/.exec(t);if(r){let t=/\/(centerOfMass|inertiaDiagonal|linearVelocity|angularVelocity|size)$/.test(r[1])?3:4*!!/\/inertiaOrientation$/.test(r[1]);if(Number(r[2])<t)return e(r[1])}return/^\/extensions\/KHR_implicit_shapes\/shapes\/\d+\/(sphere\/radius|box\/size|(?:capsule|cylinder)\/(height|radiusBottom|radiusTop)|plane\/(sizeX|sizeZ|doubleSided))$/.test(t)||/^\/nodes\/\d+\/extensions\/KHR_physics_rigid_bodies\/(motion\/(isKinematic|mass|centerOfMass|inertiaDiagonal|inertiaOrientation|linearVelocity|angularVelocity|gravityFactor)|joint\/enableCollision)$/.test(t)||/^\/extensions\/KHR_physics_rigid_bodies\/physicsMaterials\/\d+\/(staticFriction|dynamicFriction|restitution)$/.test(t)||/^\/extensions\/KHR_physics_rigid_bodies\/physicsJoints\/\d+\/(limits\/\d+\/(min|max|stiffness|damping)|drives\/\d+\/(maxForce|positionTarget|velocityTarget|stiffness|damping))$/.test(t)}(i)){if(/(isKinematic|enableCollision)$/.test(i)&&"STEP"!==r.interpolation)throw Error("Boolean physics channels require STEP interpolation");return{type:"property",pointer:i,sampler:r}}let a=i.slice(1).split("/").map(e=>e.replace(/~1/g,"/").replace(/~0/g,"~"));switch(a[0]){case"nodes":return function(e,t,r,i){let a=5===t.length&&"extensions"===t[2]&&"KHR_node_visibility"===t[3]&&"visible"===t[4],n=5===t.length&&"extensions"===t[2]&&"KHR_node_selectability"===t[3]&&"selectable"===t[4],o=5===t.length&&"extensions"===t[2]&&"KHR_node_hoverability"===t[3]&&"hoverable"===t[4],s=a||n||o;if(3!==t.length&&!s)return ew(i,"node pointers must target transforms, morph weights, visibility, selectability, or hoverability"),null;let l=Number(t[1]),c=e.nodes[l];if(!Number.isInteger(l)||!c)return k.R.warn(`KHR_animation_pointer target ${i} references a missing node and will be skipped`)(),null;if(s&&"STEP"!==r.interpolation)return ew(i,"boolean node animation requires STEP interpolation"),null;let f=a?"visibility":n?"selectable":o?"hoverable":eL(t[2]);return f?{type:"node",sampler:r,targetNodeId:c.id,path:f}:(ew(i,`node property "${t[2]}" has no runtime animation mapping`),null)}(e,a,r,i);case"materials":var n,o,s,l,c,f,p,u,m=e,d=a,h=r,g=i;if(d.length<3)return ew(g,"material pointers must include a material index and target property path"),null;let b=Number(d[1]),v=m.materials[b];if(!Number.isInteger(b)||!v)return k.R.warn(`KHR_animation_pointer target ${g} references a missing material and will be skipped`)(),null;let S=function(e,t){let r=function(e,t){let r,i=t.lastIndexOf("extensions");if(i<0||"KHR_texture_transform"!==t[i+1]||i<1)return{reason:"not-a-texture-transform-target"};let a=(0,Q.Mg)(t.slice(0,i));if(!a)return{reason:function(e){let t=eU(e);if(t){let e=ey[t]||null;if(e?.supportLevel==="none")return`${t} is referenced by this pointer, but ${e.comment.charAt(0).toLowerCase()}${e.comment.slice(1)}`}return`texture-transform target "${e.join("/")}" has no runtime texture-slot mapping`}(t.slice(0,i))};let n=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,a.pathSegments);if(!n)return{reason:`texture-transform target "${t.slice(0,i).join("/")}" does not exist on the referenced material`};let o=t[i+2];if("texCoord"===o)return{reason:"animated KHR_texture_transform.texCoord is unsupported because texCoord selection is structural, not a runtime float/vector update"};if("offset"!==o&&"rotation"!==o&&"scale"!==o)return{reason:`KHR_texture_transform property "${o}" is not animatable; supported properties are offset, rotation, and scale`};let s=t[i+3];if(t.length>i+4)return{reason:`KHR_texture_transform.${o} does not support nested property paths`};if(void 0!==s){if(r=Number(s),"rotation"===o)return{reason:"KHR_texture_transform.rotation does not support component indices"};if(!Number.isInteger(r)||r<0||r>1)return{reason:`KHR_texture_transform.${o} component index "${s}" is invalid; only 0 and 1 are supported`}}return{type:"textureTransform",textureSlot:a.slot,path:o,component:r,baseTransform:(0,Q.e3)(n)}}(e,t);if(!("reason"in r)||"not-a-texture-transform-target"!==r.reason)return r;switch(t.join("/")){case"pbrMetallicRoughness/baseColorFactor":return e.pbrMetallicRoughness?{type:"material",property:"baseColorFactor"}:{reason:eP(t)};case"pbrMetallicRoughness/metallicFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:0}:{reason:eP(t)};case"pbrMetallicRoughness/roughnessFactor":return e.pbrMetallicRoughness?{type:"material",property:"metallicRoughnessValues",component:1}:{reason:eP(t)};case"normalTexture/scale":return e.normalTexture?{type:"material",property:"normalScale"}:{reason:eP(t)};case"occlusionTexture/strength":return e.occlusionTexture?{type:"material",property:"occlusionStrength"}:{reason:eP(t)};case"emissiveFactor":return{type:"material",property:"emissiveFactor"};case"alphaCutoff":return{type:"material",property:"alphaCutoff"};case"extensions/KHR_materials_specular/specularFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularIntensityFactor"}:{reason:eP(t)};case"extensions/KHR_materials_specular/specularColorFactor":return e.extensions?.KHR_materials_specular?{type:"material",property:"specularColorFactor"}:{reason:eP(t)};case"extensions/KHR_materials_ior/ior":return e.extensions?.KHR_materials_ior?{type:"material",property:"ior"}:{reason:eP(t)};case"extensions/EXT_materials_bump/bumpFactor":return e.extensions?.EXT_materials_bump?{type:"material",property:"bumpFactor"}:{reason:eP(t)};case"extensions/KHR_materials_diffuse_transmission/diffuseTransmissionFactor":return e.extensions?.KHR_materials_diffuse_transmission?{type:"material",property:"diffuseTransmissionFactor"}:{reason:eP(t)};case"extensions/KHR_materials_diffuse_transmission/diffuseTransmissionColorFactor":return e.extensions?.KHR_materials_diffuse_transmission?{type:"material",property:"diffuseTransmissionColorFactor"}:{reason:eP(t)};case"extensions/KHR_materials_scatter/scatterStrengthFactor":return e.extensions?.KHR_materials_scatter?{type:"material",property:"scatterStrengthFactor"}:{reason:eP(t)};case"extensions/KHR_materials_scatter/multiscatterColorFactor":case"extensions/KHR_materials_scatter/multiscatterColor":return e.extensions?.KHR_materials_scatter?{type:"material",property:"multiscatterColorFactor"}:{reason:eP(t)};case"extensions/KHR_materials_scatter/scatterAnisotropy":return e.extensions?.KHR_materials_scatter?{type:"material",property:"scatterAnisotropy"}:{reason:eP(t)};case"extensions/KHR_materials_volume_scatter/multiscatterColorFactor":case"extensions/KHR_materials_volume_scatter/multiscatterColor":return e.extensions?.KHR_materials_volume_scatter?{type:"material",property:"multiscatterColorFactor"}:{reason:eP(t)};case"extensions/KHR_materials_volume_scatter/scatterAnisotropy":return e.extensions?.KHR_materials_volume_scatter?{type:"material",property:"scatterAnisotropy"}:{reason:eP(t)};case"extensions/KHR_materials_dispersion/dispersion":return e.extensions?.KHR_materials_dispersion?{type:"material",property:"dispersion"}:{reason:eP(t)};case"extensions/KHR_materials_transmission/transmissionFactor":return e.extensions?.KHR_materials_transmission?{type:"material",property:"transmissionFactor"}:{reason:eP(t)};case"extensions/KHR_materials_volume/thicknessFactor":return e.extensions?.KHR_materials_volume?{type:"material",property:"thicknessFactor"}:{reason:eP(t)};case"extensions/KHR_materials_volume/attenuationDistance":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationDistance"}:{reason:eP(t)};case"extensions/KHR_materials_volume/attenuationColor":return e.extensions?.KHR_materials_volume?{type:"material",property:"attenuationColor"}:{reason:eP(t)};case"extensions/KHR_materials_clearcoat/clearcoatFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatFactor"}:{reason:eP(t)};case"extensions/KHR_materials_clearcoat/clearcoatRoughnessFactor":return e.extensions?.KHR_materials_clearcoat?{type:"material",property:"clearcoatRoughnessFactor"}:{reason:eP(t)};case"extensions/KHR_materials_sheen/sheenColorFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenColorFactor"}:{reason:eP(t)};case"extensions/KHR_materials_sheen/sheenRoughnessFactor":return e.extensions?.KHR_materials_sheen?{type:"material",property:"sheenRoughnessFactor"}:{reason:eP(t)};case"extensions/KHR_materials_iridescence/iridescenceFactor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceFactor"}:{reason:eP(t)};case"extensions/KHR_materials_iridescence/iridescenceIor":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceIor"}:{reason:eP(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMinimum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:0}:{reason:eP(t)};case"extensions/KHR_materials_iridescence/iridescenceThicknessMaximum":return e.extensions?.KHR_materials_iridescence?{type:"material",property:"iridescenceThicknessRange",component:1}:{reason:eP(t)};case"extensions/KHR_materials_anisotropy/anisotropyStrength":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyStrength"}:{reason:eP(t)};case"extensions/KHR_materials_anisotropy/anisotropyRotation":return e.extensions?.KHR_materials_anisotropy?{type:"material",property:"anisotropyRotation"}:{reason:eP(t)};case"extensions/KHR_materials_emissive_strength/emissiveStrength":return e.extensions?.KHR_materials_emissive_strength?{type:"material",property:"emissiveStrength"}:{reason:eP(t)};default:return{reason:eP(t)}}}(v,d.slice(2));return"reason"in S?(ew(g,S.reason),null):{sampler:h,pointer:g,targetMaterialIndex:b,...S};case"cameras":let _,x,T,R;return n=e,o=a,s=r,l=i,_=Number(o[1]),x=n.cameras?.[_],T=o[2],R=o[3],4===o.length&&Number.isInteger(_)&&x&&("perspective"===T||"orthographic"===T)&&x.type===T&&("perspective"===T?["aspectRatio","yfov","znear","zfar"]:["xmag","ymag","znear","zfar"]).includes(R)?{type:"camera",sampler:s,pointer:l,targetCameraIndex:_,projection:T,property:R}:(ew(l,"camera pointers must target a supported projection property"),null);case"extensions":if("KHR_lights_punctual"===a[1]){let t,n,o,s,l,m;return c=e,f=a,p=r,u=i,t=Number(f[3]),n=c.lights||c.extensions?.KHR_lights_punctual?.lights,s=(o="spot"===f[4])?f[5]:f[4],l=o||"color"!==s?void 0:f[5],m=o||void 0!==l?6:5,"lights"===f[2]&&f.length===m&&Number.isInteger(t)&&Array.isArray(n)&&n[t]&&["color","intensity","range","innerConeAngle","outerConeAngle"].includes(s)&&(!o||"innerConeAngle"===s||"outerConeAngle"===s)&&(void 0===l||/^[0-2]$/.test(l)&&"color"===s)?{type:"light",sampler:p,pointer:u,targetLightIndex:t,property:s,...void 0===l?{}:{component:Number(l)}}:(ew(u,"punctual-light pointers must target supported typed light properties"),null)}}return ew(i,`top-level target "${a[0]}" has no runtime animation mapping`),null}(e,t,r);let i=eL(t.path);if(!i)return null;let a=e.nodes[t.node??0];if(!a)throw Error(`Cannot find animation target ${t.node}`);return{type:"node",sampler:r,targetNodeId:a.id,path:i}}(t,i,s);return l?[l]:[]});return n.length?[{name:i,channels:n}]:[]})),V=(t.lights||t.extensions?.KHR_lights_punctual?.lights||[]).map(e=>({...e,...Array.isArray(e.color)?{color:[...e.color]}:{},...e.spot?{spot:{...e.spot}}:{}})),F=(t.cameras||[]).map(e=>{let t={...e};return e.perspective&&(t.perspective={...e.perspective}),e.orthographic&&(t.orthographic={...e.orthographic}),t}),H=function(e,t,r){if(!r.length)return[];let i=function(e){let t=new Map;for(let r of e)for(let e of r.children||[])t.set(e.id,r);return t}(e),a=[];for(let o of e){var n;let s=(n=o).light??n.extensions?.KHR_lights_punctual?.light,l=void 0===s?void 0:r[s];if(!l)continue;let c=[],f=o;for(;f&&c.length<e.length;){let e=t.get(f.id);if(!e)break;c.push(e),f=i.get(f.id)}f||a.push({path:c.reverse(),definition:l})}return a}(t.nodes,I,V),D=new ec(H,r?.useByteColors??!0),B=D.lights,G=()=>D.update(),z=new eM({onVisibilityChange:G,onLightChange:G,properties:r?.properties??void 0,cameras:F,lightDefinitions:V,animations:w,gltfNodeIdToNodeMap:I,materials:x,materialInstances:y}),K=new eC(function(e,t){let r=(e.extensions?.KHR_materials_variants?.variants||[]).map((e,t)=>({name:e.name||`Variant-${t}`,index:t})),i=new Set,a=[];for(let e of t)e.preorderTraversal(e=>{if(!(e instanceof v.s)||i.has(e))return;let t=e.userData.gltfMaterialVariants;t&&(i.add(e),a.push({modelNode:e,...t}))});return{variants:r,bindings:a}}(t,_)),j=eE(t,e),$=_.map(e=>eD(e.getBounds())),W=function(e){let t=null;for(let r of e)if(r.bounds){if(!t){t=[[...r.bounds[0]],[...r.bounds[1]]];continue}for(let e=0;e<3;e++)t[0][e]=Math.min(t[0][e],r.bounds[0][e]),t[1][e]=Math.max(t[1][e],r.bounds[1][e])}return eD(t)}($),X=new eI({scenes:(p={device:e,gltf:t,scenes:_,gltfNodeIndexToNodeMap:C}).scenes,bindings:function(e){let{gltf:t,gltfNodeIndexToNodeMap:r}=e,i=[],a=t.skins||[],n=new Set;for(let t of e.scenes)t.preorderTraversal(e=>{e instanceof c.o&&n.add(e)});for(let[o,s]of t.nodes.entries()){let l,f=s.skin;if(void 0===f||!s.mesh)continue;let p=a[function(e,t){return"number"==typeof t?t:(e.skins||[]).findIndex(r=>{if(r===t||t.id&&r.id===t.id)return!0;if(r.joints.length!==t.joints?.length||!r.joints.every((e,r)=>e===t.joints?.[r]))return!1;if("number"==typeof t.inverseBindMatrices){let i=e.accessors[t.inverseBindMatrices];return!r.inverseBindMatrices||r.inverseBindMatrices===i}return!0})}(t,f)],u=r.get(o);if(!p||!u||!n.has(u))continue;let m=p.joints.flatMap(e=>{let t=r.get(e);return t?[t]:[]});if(m.length!==p.joints.length)continue;let d=s.mesh,h=u.userData.gltfMesh,g=h instanceof c.o?h:u.children.find(e=>e instanceof c.o&&e.id===(d.name||d.id));if(!(g instanceof c.o))continue;let b=[];g.preorderTraversal(e=>{e instanceof v.s&&b.push(e)});let S=p.inverseBindMatrices?.value,_=new Float32Array(16*m.length);m.length>64&&b.some(e=>!0===e.userData.gltfLargeSkinPalette)&&(l=function(e,t,r){if("webgpu"===e.type)return e.createBuffer({id:`${t}-skin-joint-matrices`,byteLength:r.byteLength,usage:T.h.STORAGE|T.h.COPY_DST});let i=r.length/4;if(i>e.limits.maxTextureDimension2D)throw Error("Skin palette exceeds the device texture width limit");return e.createTexture({id:`${t}-skin-joint-matrices`,format:"rgba32float",width:i,height:1,usage:R.g.SAMPLE|R.g.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest",mipmapFilter:"nearest"}})}(e.device,u.id,_)),i.push({node:u,joints:m,...S instanceof Float32Array?{inverseBindMatrices:S}:{},jointMatrices:_,...l?{skinJointMatrices:l}:{},models:b})}return i}(p)});z.setUpdateHandler(()=>{X.update(),H.length&&G()});let Y=!1;return{metadata:S,scenes:_,materials:x,billboards:E,variants:K,joints:U,jointIssues:P.issues,cameras:F,animator:z,animations:w,lights:B,punctualLights:D,extensionSupport:j,sceneBounds:$,modelBounds:W,gltfMeshIdToNodeMap:M,gltfNodeIdToNodeMap:I,gltfNodeIndexToNodeMap:C,skins:X,gltf:t,destroy:()=>{if(Y)return;Y=!0,X.destroy(),E?.destroy();let e=new Set([..._,...M.values(),...I.values()]),t=new Set,r=new Set(x);for(let i of e)i.preorderTraversal(e=>{if(e instanceof v.s){t.add(e);let i=e.userData.gltfMaterialVariants;for(let e of(i?.defaultMaterial&&r.add(i.defaultMaterial),i?.mappings.values()||[]))r.add(e.material);e.model?.material&&r.add(e.model.material)}});for(let e of t)e.destroy();for(let t of e)t.destroy();for(let e of r)e.destroy();for(let e of A)e.destroy();A.clear()}}}function eD(e){if(!e)return{bounds:null,center:[0,0,0],size:[0,0,0],radius:.5,recommendedOrbitDistance:1};let t=[[e[0][0],e[0][1],e[0][2]],[e[1][0],e[1][1],e[1][2]]],r=[t[1][0]-t[0][0],t[1][1]-t[0][1],t[1][2]-t[0][2]],i=[t[0][0]+.5*r[0],t[0][1]+.5*r[1],t[0][2]+.5*r[2]],a=.5*Math.max(r[0],r[1],r[2]),n=Math.max(.5*Math.hypot(r[0],r[1],r[2]),.001);return{bounds:t,center:i,size:r,radius:n,recommendedOrbitDistance:Math.max(Math.max(a,.001)/Math.tan(Math.PI/6)*1.15,1.1*n)}}},21109(e,t,r){r.d(t,{lO:()=>m});var i=r(68936),a=r(3842),n=r(45156),o=r(87945),s=r(74788),l=r(8137),c=r(2019),f=r(37210);function p(e){switch(e){case f.n.CLAMP_TO_EDGE:return"clamp-to-edge";case f.n.REPEAT:return"repeat";case f.n.MIRRORED_REPEAT:return"mirror-repeat";default:return}}let u={NORMAL:["NORMAL","normals"],TANGENT:["TANGENT"],TEXCOORD_0:["TEXCOORD_0","texCoords"],TEXCOORD_1:["TEXCOORD_1","texCoords1"],JOINTS_0:["JOINTS_0"],WEIGHTS_0:["WEIGHTS_0"],JOINTS_1:["JOINTS_1"],WEIGHTS_1:["WEIGHTS_1"],COLOR_0:["COLOR_0","colors"]};function m(e,t,r,o){let s={defines:{MANUAL_SRGB:!0},bindings:{},uniforms:{camera:[0,0,0],metallicRoughnessValues:[1,1]},parameters:{},glParameters:{},generatedTextures:[]};s.defines.USE_TEX_LOD=!0;let{imageBasedLightingEnvironment:p}=o;if(p&&(s.bindings.pbr_diffuseEnvSampler=p.diffuseEnvSampler.texture,s.bindings.pbr_specularEnvSampler=p.specularEnvSampler.texture,s.bindings.pbr_brdfLUT=p.brdfLutTexture.texture,s.uniforms.IBLenabled=!0,s.uniforms.scaleIBLAmbient=[1,1]),o?.pbrDebug&&(s.defines.PBR_DEBUG=!0,s.uniforms.scaleDiffBaseMR=[0,0,0,0],s.uniforms.scaleFGDSpec=[0,0,0,0]),h(r,"NORMAL")&&(s.defines.HAS_NORMALS=!0),h(r,"TANGENT")&&o?.useTangents&&(s.defines.HAS_TANGENTS=!0),h(r,"TEXCOORD_0")&&(s.defines.HAS_UV=!0),h(r,"TEXCOORD_1")&&(s.defines.HAS_UV_1=!0),h(r,"JOINTS_0")&&h(r,"WEIGHTS_0")&&(s.defines.HAS_SKIN=!0),s.defines.HAS_SKIN&&h(r,"JOINTS_1")&&h(r,"WEIGHTS_1")&&(s.defines.HAS_SKIN_1=!0),h(r,"COLOR_0")&&(s.defines.HAS_COLORS=!0),o?.imageBasedLightingEnvironment&&(s.defines.USE_IBL=!0),o?.lights&&(s.defines.USE_LIGHTS=!0),t){if(!1!==o.validateAttributes){!function(e,t){let r=d(e,0);r.length>0&&!h(t,"TEXCOORD_0")&&n.R.warn(`glTF material uses ${r.join(", ")} but primitive is missing TEXCOORD_0; textured shading will sample the default UV coordinates`)();let i=d(e,1);if(i.length>0&&!h(t,"TEXCOORD_1")&&n.R.warn(`glTF material uses ${i.join(", ")} with TEXCOORD_1 but primitive is missing TEXCOORD_1; those textures will be skipped`)(),e.unlit||e.extensions?.KHR_materials_unlit||h(t,"NORMAL"))return;let a=e.normalTexture?"lit PBR shading with normalTexture":"lit PBR shading";n.R.warn(`glTF primitive is missing NORMAL while using ${a}; shading will fall back to geometric normals`)()}(t,r);let e=t.extensions?.KHR_lightmap;if(e&&!1!==o.validateLightmapAttributes){let t=(0,l.CC)(e.lightmapTexture);(0,a.v)((0===t||1===t)&&h(r,0===t?"TEXCOORD_0":"TEXCOORD_1"))}}!function(e,t,r,o,s,p=!1){if(r.parameters.cullMode=t.doubleSided?"none":"back",r.defines.DOUBLE_SIDED=!!t.doubleSided,r.uniforms.unlit=!!(t.unlit||t.extensions?.KHR_materials_unlit),t.pbrMetallicRoughness&&function(e,t,r,i,a){t.baseColorTexture&&v(e,t.baseColorTexture,"pbr_baseColorSampler",r,{featureOptions:{define:"HAS_BASECOLORMAP",enabledUniformName:"baseColorMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"baseColor"}),r.uniforms.baseColorFactor=t.baseColorFactor||[1,1,1,1],t.metallicRoughnessTexture&&v(e,t.metallicRoughnessTexture,"pbr_metallicRoughnessSampler",r,{featureOptions:{define:"HAS_METALROUGHNESSMAP",enabledUniformName:"metallicRoughnessMapEnabled"},gltf:a,attributes:i,textureTransformSlot:"metallicRoughness"});let{metallicFactor:n=1,roughnessFactor:o=1}=t;r.uniforms.metallicRoughnessValues=[n,o]}(e,t.pbrMetallicRoughness,r,o,s),t.normalTexture){v(e,t.normalTexture,"pbr_normalSampler",r,{featureOptions:{define:"HAS_NORMALMAP",enabledUniformName:"normalMapEnabled"},gltf:s,attributes:o,textureTransformSlot:"normal"});let{scale:i=1}=t.normalTexture;r.uniforms.normalScale=i}if(t.occlusionTexture){v(e,t.occlusionTexture,"pbr_occlusionSampler",r,{featureOptions:{define:"HAS_OCCLUSIONMAP",enabledUniformName:"occlusionMapEnabled"},gltf:s,attributes:o,textureTransformSlot:"occlusion"});let{strength:i=1}=t.occlusionTexture;r.uniforms.occlusionStrength=i}switch(r.uniforms.emissiveFactor=t.emissiveFactor||[0,0,0],t.emissiveTexture&&v(e,t.emissiveTexture,"pbr_emissiveSampler",r,{featureOptions:{define:"HAS_EMISSIVEMAP",enabledUniformName:"emissiveMapEnabled"},gltf:s,attributes:o,textureTransformSlot:"emissive"}),function(e,t,r,o,s={},p=!1){var u,m,d,h,S,_,x;if(!t)return;let T=t.KHR_lightmap;if(T){let t=T.intensity??1;(0,a.v)(Number.isFinite(t)&&t>=0),r.uniforms.lightmapIntensity=t,r.uniforms.lightmapUVSet=(0,l.CC)(T.lightmapTexture),r.uniforms.lightmapUVTransform=new i.d((0,c.V)((0,l.e3)(T.lightmapTexture))),!p&&Object.keys(s).length>0&&v(e,T.lightmapTexture,"pbr_lightmapSampler",r,{gltf:o,attributes:s,featureOptions:{define:"HAS_LIGHTMAP",enabledUniformName:"lightmapMapEnabled"}})}((u=t).KHR_materials_specular||u.KHR_materials_ior||u.EXT_materials_bump||u.KHR_materials_transmission||u.KHR_materials_diffuse_transmission||u.KHR_materials_volume||u.KHR_materials_volume_scatter||u.KHR_materials_dispersion||u.KHR_materials_clearcoat||u.KHR_materials_sheen||u.KHR_materials_iridescence||u.KHR_materials_anisotropy)&&(r.defines.USE_MATERIAL_EXTENSIONS=!0),function(e,t,r,i,a={}){t&&(t.specularColorFactor&&(r.uniforms.specularColorFactor=t.specularColorFactor),void 0!==t.specularFactor&&(r.uniforms.specularIntensityFactor=t.specularFactor),t.specularColorTexture&&v(e,t.specularColorTexture,"pbr_specularColorSampler",r,{featureOptions:{define:"HAS_SPECULARCOLORMAP",enabledUniformName:"specularColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"specularColor"}),t.specularTexture&&v(e,t.specularTexture,"pbr_specularIntensitySampler",r,{featureOptions:{define:"HAS_SPECULARINTENSITYMAP",enabledUniformName:"specularIntensityMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"specularIntensity"}))}(e,t.KHR_materials_specular,r,o,s),m=t.KHR_materials_ior,d=r,m?.ior!==void 0&&(d.uniforms.ior=m.ior),function(e,t,r,i,a={}){t&&(r.uniforms.bumpFactor=Math.max(t.bumpFactor??1,0),t.bumpTexture&&v(e,t.bumpTexture,"pbr_bumpSampler",r,{featureOptions:{define:"HAS_BUMPMAP",enabledUniformName:"bumpMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"bump"}))}(e,t.EXT_materials_bump,r,o,s),function(e,t,r,i,a={}){t&&(void 0!==t.transmissionFactor&&(r.uniforms.transmissionFactor=t.transmissionFactor),t.transmissionTexture&&v(e,t.transmissionTexture,"pbr_transmissionSampler",r,{featureOptions:{define:"HAS_TRANSMISSIONMAP",enabledUniformName:"transmissionMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"transmission"}),(t.transmissionFactor??0)>0||t.transmissionTexture)&&(n.R.warn("KHR_materials_transmission uses a premultiplied-alpha blending approximation and may require mesh sorting")(),r.parameters.blend=!0,r.parameters.depthWriteEnabled=!1,r.parameters.blendColorOperation="add",r.parameters.blendColorSrcFactor="one",r.parameters.blendColorDstFactor="one-minus-src-alpha",r.parameters.blendAlphaOperation="add",r.parameters.blendAlphaSrcFactor="one",r.parameters.blendAlphaDstFactor="one-minus-src-alpha",r.glParameters.blend=!0,r.glParameters.depthMask=!1,r.glParameters.blendEquation=f.n.FUNC_ADD,r.glParameters.blendFunc=[f.n.ONE,f.n.ONE_MINUS_SRC_ALPHA,f.n.ONE,f.n.ONE_MINUS_SRC_ALPHA])}(e,t.KHR_materials_transmission,r,o,s),g(e,t.KHR_materials_diffuse_transmission,r,o,s),function(e,t,r,i,a={}){t&&(void 0!==t.thicknessFactor&&(r.uniforms.thicknessFactor=t.thicknessFactor),t.thicknessTexture&&v(e,t.thicknessTexture,"pbr_thicknessSampler",r,{featureOptions:{define:"HAS_THICKNESSMAP"},gltf:i,attributes:a,textureTransformSlot:"thickness"}),void 0!==t.attenuationDistance&&(r.uniforms.attenuationDistance=t.attenuationDistance),t.attenuationColor&&(r.uniforms.attenuationColor=t.attenuationColor))}(e,t.KHR_materials_volume,r,o,s),b(e,t.KHR_materials_volume_scatter,t.KHR_materials_volume,r,o,s);let R=t.KHR_materials_scatter;if(R&&t.KHR_materials_transmission){(0,a.v)(!t.KHR_materials_volume?.thicknessFactor),R.scatterStrengthTexture&&g(e,{diffuseTransmissionTexture:R.scatterStrengthTexture},r,o,s),(0,a.v)(!t.KHR_materials_unlit&&!t.KHR_materials_diffuse_transmission&&!t.KHR_materials_pbrSpecularGlossiness);let i=R.scatterStrengthFactor??0,n=R.scatterAnisotropy??0;(0,a.v)(Number.isFinite(i)&&i>=0&&i<=1),(0,a.v)(Number.isFinite(n)&&n>-1&&n<1),r.defines.HAS_MATERIAL_SCATTER=!0,r.uniforms.scatterStrengthFactor=i,b(e,R,{},r,o,s),r.uniforms.scatterAnisotropy=n,r.uniforms.multiscatterColorFactor=R.multiscatterColorFactor??R.multiscatterColor??[1,1,1]}h=t.KHR_materials_dispersion,S=r,h?.dispersion!==void 0&&(S.uniforms.dispersion=Math.max(h.dispersion,0)),function(e,t,r,i,a={}){t&&(void 0!==t.clearcoatFactor&&(r.uniforms.clearcoatFactor=t.clearcoatFactor),void 0!==t.clearcoatRoughnessFactor&&(r.uniforms.clearcoatRoughnessFactor=t.clearcoatRoughnessFactor),t.clearcoatTexture&&v(e,t.clearcoatTexture,"pbr_clearcoatSampler",r,{featureOptions:{define:"HAS_CLEARCOATMAP",enabledUniformName:"clearcoatMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"clearcoat"}),t.clearcoatRoughnessTexture&&v(e,t.clearcoatRoughnessTexture,"pbr_clearcoatRoughnessSampler",r,{featureOptions:{define:"HAS_CLEARCOATROUGHNESSMAP",enabledUniformName:"clearcoatRoughnessMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"clearcoatRoughness"}),t.clearcoatNormalTexture&&v(e,t.clearcoatNormalTexture,"pbr_clearcoatNormalSampler",r,{featureOptions:{define:"HAS_CLEARCOATNORMALMAP"},gltf:i,attributes:a,textureTransformSlot:"clearcoatNormal"}))}(e,t.KHR_materials_clearcoat,r,o,s),function(e,t,r,i,a={}){t&&(t.sheenColorFactor&&(r.uniforms.sheenColorFactor=t.sheenColorFactor),void 0!==t.sheenRoughnessFactor&&(r.uniforms.sheenRoughnessFactor=t.sheenRoughnessFactor),t.sheenColorTexture&&v(e,t.sheenColorTexture,"pbr_sheenColorSampler",r,{featureOptions:{define:"HAS_SHEENCOLORMAP",enabledUniformName:"sheenColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"sheenColor"}),t.sheenRoughnessTexture&&v(e,t.sheenRoughnessTexture,"pbr_sheenRoughnessSampler",r,{featureOptions:{define:"HAS_SHEENROUGHNESSMAP",enabledUniformName:"sheenRoughnessMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"sheenRoughness"}))}(e,t.KHR_materials_sheen,r,o,s),function(e,t,r,i,a={}){t&&(void 0!==t.iridescenceFactor&&(r.uniforms.iridescenceFactor=t.iridescenceFactor),void 0!==t.iridescenceIor&&(r.uniforms.iridescenceIor=t.iridescenceIor),(void 0!==t.iridescenceThicknessMinimum||void 0!==t.iridescenceThicknessMaximum)&&(r.uniforms.iridescenceThicknessRange=[t.iridescenceThicknessMinimum??100,t.iridescenceThicknessMaximum??400]),t.iridescenceTexture&&v(e,t.iridescenceTexture,"pbr_iridescenceSampler",r,{featureOptions:{define:"HAS_IRIDESCENCEMAP",enabledUniformName:"iridescenceMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"iridescence"}),t.iridescenceThicknessTexture&&v(e,t.iridescenceThicknessTexture,"pbr_iridescenceThicknessSampler",r,{featureOptions:{define:"HAS_IRIDESCENCETHICKNESSMAP"},gltf:i,attributes:a,textureTransformSlot:"iridescenceThickness"}))}(e,t.KHR_materials_iridescence,r,o,s),function(e,t,r,i,a={}){t&&(void 0!==t.anisotropyStrength&&(r.uniforms.anisotropyStrength=t.anisotropyStrength),void 0!==t.anisotropyRotation&&(r.uniforms.anisotropyRotation=t.anisotropyRotation),t.anisotropyTexture&&v(e,t.anisotropyTexture,"pbr_anisotropySampler",r,{featureOptions:{define:"HAS_ANISOTROPYMAP",enabledUniformName:"anisotropyMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"anisotropy"}))}(e,t.KHR_materials_anisotropy,r,o,s),_=t.KHR_materials_emissive_strength,x=r,_?.emissiveStrength!==void 0&&(x.uniforms.emissiveStrength=_.emissiveStrength)}(e,t.extensions,r,s,o,p),t.alphaMode||"OPAQUE"){case"OPAQUE":break;case"MASK":{let{alphaCutoff:e=.5}=t;r.defines.ALPHA_CUTOFF=!0,r.uniforms.alphaCutoffEnabled=!0,r.uniforms.alphaCutoff=e;break}case"BLEND":var u;n.R.warn("glTF BLEND alphaMode might not work well because it requires mesh sorting")(),(u=r).parameters.blend=!0,u.parameters.blendColorOperation="add",u.parameters.blendColorSrcFactor="src-alpha",u.parameters.blendColorDstFactor="one-minus-src-alpha",u.parameters.blendAlphaOperation="add",u.parameters.blendAlphaSrcFactor="one",u.parameters.blendAlphaDstFactor="one-minus-src-alpha",u.glParameters.blend=!0,u.glParameters.blendEquation=f.n.FUNC_ADD,u.glParameters.blendFunc=[f.n.SRC_ALPHA,f.n.ONE_MINUS_SRC_ALPHA,f.n.ONE,f.n.ONE_MINUS_SRC_ALPHA]}}(e,t,s,r,o.gltf,o.materialResourcesOnly)}return s}function d(e,t){let r=[];for(let i of(0,l.ii)()){let a=function(e,t){let r=e;for(let e of t)if(!(r=r?.[e]))return null;return r}(e,i.pathSegments);a&&(0,l.CC)(a)===t&&r.push(i.displayName)}return r}function h(e,t){return u[t].some(t=>!!e[t])}function g(e,t,r,i,a={}){t&&(r.uniforms.diffuseTransmissionFactor=Math.min(Math.max(t.diffuseTransmissionFactor??0,0),1),r.uniforms.diffuseTransmissionColorFactor=t.diffuseTransmissionColorFactor||[1,1,1],t.diffuseTransmissionTexture&&v(e,t.diffuseTransmissionTexture,"pbr_diffuseTransmissionSampler",r,{featureOptions:{define:"HAS_DIFFUSETRANSMISSIONMAP",enabledUniformName:"diffuseTransmissionMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"diffuseTransmission"}),t.diffuseTransmissionColorTexture&&v(e,t.diffuseTransmissionColorTexture,"pbr_diffuseTransmissionColorSampler",r,{featureOptions:{define:"HAS_DIFFUSETRANSMISSIONCOLORMAP",enabledUniformName:"diffuseTransmissionColorMapEnabled"},gltf:i,attributes:a,textureTransformSlot:"diffuseTransmissionColor"}))}function b(e,t,r,i,a,n={}){t&&r&&(i.uniforms.multiscatterColorFactor=t.multiscatterColorFactor||t.multiscatterColor||[0,0,0],i.uniforms.scatterAnisotropy=Math.min(Math.max(t.scatterAnisotropy??0,-.999),.999),t.multiscatterColorTexture&&v(e,t.multiscatterColorTexture,"pbr_multiscatterColorSampler",i,{featureOptions:{define:"HAS_MULTISCATTERCOLORMAP",enabledUniformName:"multiscatterColorMapEnabled"},gltf:a,attributes:n,textureTransformSlot:"multiscatterColor"}))}function v(e,t,r,i,a={}){let{featureOptions:u={},gltf:m,attributes:d={},textureTransformSlot:g}=a,{define:b,enabledUniformName:x}=u,T=(0,l.CC)(t);if(T>1)return void n.R.warn(`Skipping ${String(r)} because ${T} is not supported; only TEXCOORD_0 and TEXCOORD_1 are currently available`)();if(1===T&&!h(d,"TEXCOORD_1"))return void n.R.warn(`Skipping ${String(r)} because it requires TEXCOORD_1 but the primitive does not provide TEXCOORD_1`)();let R=function(e,t){if(e.texture||void 0===e.index||!t?.textures)return e;let r=t.textures[e.index];return r?"texture"in r&&r.texture?{...r,...e,texture:r.texture}:"source"in r?{...e,texture:r}:e:e}(t,m),M=R.texture?.source?.image;if(!M)return void n.R.warn(`Skipping unresolved glTF texture for ${String(r)}`)();let I=function(e,t,r){if("compressed"in t)return function(e,t,r){let i;if(0===(i=Array.isArray(t.data)&&t.data[0]?.data?t.data:"mipmaps"in t&&Array.isArray(t.mipmaps)?t.mipmaps:[]).length||!i[0]?.data)return n.R.warn("createCompressedTexture: compressed image has no valid mip levels, creating fallback")(),S(e,r);let a=i[0],l=a.width??t.width??0,c=a.height??t.height??0;if(l<=0||c<=0)return n.R.warn("createCompressedTexture: base level has invalid dimensions, creating fallback")(),S(e,r);let f=_(a);if(!f)return n.R.warn("createCompressedTexture: compressed image has no textureFormat, creating fallback")(),S(e,r);if(!e.isTextureFormatSupported(f))return n.R.warn(`createCompressedTexture: ${e.type} device does not support '${f}', creating fallback`)(),S(e,r);let p=function(e,t,r){let{blockWidth:i=1,blockHeight:a=1}=s.vz.getInfo(r),n=1;for(let r=1;;r++){let o=Math.max(1,e>>r),s=Math.max(1,t>>r);if(o<i||s<a)break;n++}return n}(l,c,f),u=Math.min(i.length,p),m=1;for(let e=1;e<u;e++){let t=i[e];if(!t.data||t.width<=0||t.height<=0){n.R.warn(`createCompressedTexture: mip level ${e} has invalid data/dimensions, truncating`)();break}let r=_(t);if(r&&r!==f){n.R.warn(`createCompressedTexture: mip level ${e} format '${r}' differs from base '${f}', truncating`)();break}let a=Math.max(1,l>>e),o=Math.max(1,c>>e);if(t.width!==a||t.height!==o){n.R.warn(`createCompressedTexture: mip level ${e} dimensions ${t.width}x${t.height} don't match expected ${a}x${o}, truncating`)();break}m++}let d=e.createTexture({...r,format:f,usage:o.g.TEXTURE|o.g.COPY_DST,width:l,height:c,mipLevels:m,data:a.data});for(let e=1;e<m;e++)d.writeData(i[e].data,{width:i[e].width,height:i[e].height,mipLevel:e});return d}(e,t,{id:r.id,sampler:r.sampler});let i=void 0!==r.width&&void 0!==r.height?{width:r.width,height:r.height}:e.getExternalImageSize(t),a="nearest"===r.sampler.mipmapFilter||"linear"===r.sampler.mipmapFilter,l=a?e.getMipLevelCount(i.width,i.height):1,c=e.createTexture({id:r.id,sampler:r.sampler,width:i.width,height:i.height,mipLevels:l,...a?{usage:o.g.SAMPLE|o.g.RENDER|o.g.COPY_DST|o.g.COPY_SRC}:{},...r.colorSpace?{format:"srgb"===r.colorSpace?"rgba8unorm-srgb":"rgba8unorm"}:{},data:t});return l>1&&("webgl"===e.type?c.generateMipmapsWebGL():"webgpu"===e.type&&e.generateMipmapsWebGPU(c)),c}(e,M,{id:R.uniformName||R.id,sampler:{addressModeU:"repeat",addressModeV:"repeat",minFilter:"linear",magFilter:"linear",...function(e={}){let t=e.wrapS??e.parameters?.[f.n.TEXTURE_WRAP_S],r=e.wrapT??e.parameters?.[f.n.TEXTURE_WRAP_T],i=e.magFilter??e.parameters?.[f.n.TEXTURE_MAG_FILTER],a=e.minFilter??e.parameters?.[f.n.TEXTURE_MIN_FILTER],n=p(t),o=p(r),s=function(e){switch(e){case f.n.NEAREST:return"nearest";case f.n.LINEAR:return"linear";default:return}}(i);return{...n?{addressModeU:n}:{},...o?{addressModeV:o}:{},...s?{magFilter:s}:{},...function(e){switch(e){case f.n.NEAREST:return{minFilter:"nearest"};case f.n.LINEAR:return{minFilter:"linear"};case f.n.NEAREST_MIPMAP_NEAREST:return{minFilter:"nearest",mipmapFilter:"nearest"};case f.n.LINEAR_MIPMAP_NEAREST:return{minFilter:"linear",mipmapFilter:"nearest"};case f.n.NEAREST_MIPMAP_LINEAR:return{minFilter:"nearest",mipmapFilter:"linear"};case f.n.LINEAR_MIPMAP_LINEAR:return{minFilter:"linear",mipmapFilter:"linear"};default:return{}}}(a)}}(R.texture.sampler)}});if(i.bindings[r]=I,b&&(i.defines[b]=!0),x&&(i.uniforms[x]=!0),g){let e=(0,l.lz)(g);i.uniforms[e.uvSetUniform]=T,i.uniforms[e.uvTransformUniform]=(0,c.V)((0,l.e3)(t))}i.generatedTextures.push(I)}function S(e,t){return e.createTexture({...t,format:"rgba8unorm",width:1,height:1,mipLevels:1})}function _(e){return e.textureFormat}},90735(e,t,r){r.d(t,{R:()=>m});var i=r(3842);let a={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5124:Int32Array,5125:Uint32Array,5126:Float32Array,5130:Float64Array,5131:(0,r(12793).pX)(),5134:BigInt64Array,5135:BigUint64Array};function n(e,t){let r=a[e.componentType];(0,i.v)(r);let n=e.count*e.components*r.BYTES_PER_ELEMENT;return(0,i.v)(n>=0&&n<=t.byteLength),{ArrayType:r,byteLength:n}}function o(e,t,r=e.byteOffset||0,a=e.count){let{ArrayType:s}=n(e,t),l={MAT2:2,MAT3:3,MAT4:4}[e.type],c=l||1,f=e.components/c*e.bytesPerComponent,p=l?4*Math.ceil(f/4):f,u=t.byteStride||c*p,m=a>0?(a-1)*u+(c-1)*p+f:0;(0,i.v)(r>=0&&r+m<=t.byteLength);let d=t.buffer,h=t.byteOffset||0;(0,i.v)(h>=0&&h+t.byteLength<=d.byteLength);let g=new Uint8Array(d.arrayBuffer,d.byteOffset+h+r,m),b=new Uint8Array(a*e.bytesPerElement);for(let t=0;t<a;t++)for(let r=0;r<c;r++){let i=t*u+r*p,a=t*e.bytesPerElement+r*f;b.set(g.subarray(i,i+f),a)}return new s(b.buffer)}let s={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},l={5120:1,5121:1,5122:2,5123:2,5124:4,5125:4,5126:4,5130:8,5131:2,5134:8,5135:8},c={magFilter:10240,minFilter:10241,wrapS:10242,wrapT:10243},f={10240:9729,10241:9986,10242:10497,10243:10497};class p{json;buffers=[];images=[];postProcess(e){let{json:t,buffers:r=[],images:a=[]}=e;(0,i.v)(t);let n=Math.max(t.buffers?.length||0,r.length);return this.buffers=Array.from({length:n},(e,i)=>({...t.buffers?.[i]||{},...r[i]||{}})),this.images=a,this.json=this._resolveTree(e.json),this.json.buffers=this.buffers,this.json.gaussianSplatPrimitives=e.gaussianSplatPrimitives,this.json}_resolveTree(e){let t={...e,accessors:e.accessors??[],animations:e.animations??[],buffers:e.buffers??[],bufferViews:e.bufferViews??[],cameras:e.cameras??[],images:e.images??[],materials:e.materials??[],meshes:e.meshes??[],nodes:e.nodes??[],samplers:e.samplers??[],scenes:e.scenes??[],skins:e.skins??[],textures:e.textures??[],extensionsUsed:e.extensionsUsed??[],extensionsRequired:e.extensionsRequired??[]};return this.json=t,e.bufferViews&&(t.bufferViews=e.bufferViews.map((e,t)=>this._resolveBufferView(e,t))),e.cameras&&(t.cameras=e.cameras.map((e,t)=>this._resolveCamera(e,t))),e.images&&(t.images=e.images.map((e,t)=>this._resolveImage(e,t))),t.asset=this._resolveAsset(e.asset),e.samplers&&(t.samplers=e.samplers.map((e,t)=>this._resolveSampler(e,t))),e.textures&&(t.textures=e.textures.map((e,t)=>this._resolveTexture(e,t))),e.accessors&&(t.accessors=e.accessors.map((e,t)=>this._resolveAccessor(e,t))),e.materials&&(t.materials=e.materials.map((e,t)=>this._resolveMaterial(e,t))),e.meshes&&(t.meshes=e.meshes.map((e,t)=>this._resolveMesh(e,t))),e.nodes&&(t.nodes=e.nodes.map((e,t)=>this._resolveNode(e,t)),t.nodes=t.nodes.map(e=>this._resolveNodeChildren(e))),e.skins&&(t.skins=e.skins.map((e,t)=>this._resolveSkin(e,t)),e.nodes?.forEach((e,r)=>{void 0!==e.skin&&(t.nodes[r].skin=this.getSkin(e.skin))})),e.scenes&&(t.scenes=e.scenes.map((e,t)=>this._resolveScene(e,t))),"number"==typeof this.json.scene&&t.scenes&&(t.scene=t.scenes[this.json.scene]),t}getScene(e){return this._get(this.json.scenes,e)}getNode(e){return this._get(this.json.nodes,e)}getSkin(e){return this._get(this.json.skins,e)}getMesh(e){return this._get(this.json.meshes,e)}getMaterial(e){return this._get(this.json.materials,e)}getAccessor(e){let t=this._get(this.json.accessors,e);if("object"==typeof e){let e=s[t.type],r=l[t.componentType];return{...t,components:e,bytesPerComponent:r,bytesPerElement:e*r}}return t}getCamera(e){return this._get(this.json.cameras,e)}getTexture(e){return this._get(this.json.textures,e)}getSampler(e){return this._get(this.json.samplers,e)}getImage(e){return this._get(this.json.images,e)}getBufferView(e){return this._get(this.json.bufferViews,e)}getBuffer(e){return this._get(this.json.buffers,e)}_get(e,t){if("object"==typeof t)return t;let r=e&&e[t];return(0,i.v)(r),r}_resolveAsset(e){return{...e,thumbnail:void 0!==e.thumbnail?this.getImage(e.thumbnail):void 0}}_resolveScene(e,t){return{...e,id:e.id||`scene-${t}`,nodes:(e.nodes||[]).map(e=>this.getNode(e))}}_resolveNode(e,t){let r={...e,id:e?.id||`node-${t}`};return void 0!==e.mesh&&(r.mesh=this.getMesh(e.mesh)),void 0!==e.camera&&(r.camera=this.getCamera(e.camera)),void 0!==e.skin&&(r.skin=this.getSkin(e.skin)),r}_resolveNodeChildren(e){return e.children&&(e.children=e.children.map(e=>this.getNode(e))),e}_resolveSkin(e,t){let r="number"==typeof e.inverseBindMatrices?this.getAccessor(e.inverseBindMatrices):void 0;return{...e,id:e.id||`skin-${t}`,inverseBindMatrices:r}}_resolveMesh(e,t){let r={...e,id:e.id||`mesh-${t}`,primitives:[]};return e.primitives&&(r.primitives=e.primitives.map((e,t)=>{let a={...e,attributes:{},indices:void 0,material:void 0},n=e.attributes;for(let e in n)a.attributes[e]=this.getAccessor(n[e]);return void 0!==e.indices&&(a.indices=this.getAccessor(e.indices)),void 0!==e.material&&(a.material=this.getMaterial(e.material)),function(e,t,r){let a;if(2!==e.mode&&6!==e.mode)return e;let n=e.indices?.value,o=e.indices?.count??(a=Object.values(e.attributes)[0],(0,i.v)(a),a.count),s=function(e,t){if(!e)return Math.max(0,t-1);let r=0;for(let i=0;i<t;i++)r=Math.max(r,Number(e[i]));return r}(n,o),l=s<=65535?Uint16Array:Uint32Array,c=2===e.mode?function(e,t,r){if(t<2)return new r(0);let i=new r(2*t);for(let r=0;r<t;r++)i[2*r]=u(e,r),i[2*r+1]=u(e,(r+1)%t);return i}(n,o,l):function(e,t,r){let i=Math.max(0,t-2),a=new r(3*i);for(let t=0;t<i;t++)a[3*t]=u(e,0),a[3*t+1]=u(e,t+1),a[3*t+2]=u(e,t+2);return a}(n,o,l);return e.mode=2===e.mode?1:4,e.indices={id:`${t}-primitive-${r}-portable-indices`,components:1,bytesPerComponent:l.BYTES_PER_ELEMENT,bytesPerElement:l.BYTES_PER_ELEMENT,componentType:l===Uint16Array?5123:5125,normalized:!1,count:c.length,type:"SCALAR",min:c.length?[function(e){let t=1/0;for(let r of e)t=Math.min(t,r);return t}(c)]:void 0,max:c.length?[s]:void 0,value:c},e}(a,r.id,t)})),r}_resolveMaterial(e,t){let r={...e,id:e.id||`material-${t}`};if(r.normalTexture&&(r.normalTexture={...r.normalTexture},r.normalTexture.texture=this.getTexture(r.normalTexture.index)),r.occlusionTexture&&(r.occlusionTexture={...r.occlusionTexture},r.occlusionTexture.texture=this.getTexture(r.occlusionTexture.index)),r.emissiveTexture&&(r.emissiveTexture={...r.emissiveTexture},r.emissiveTexture.texture=this.getTexture(r.emissiveTexture.index)),r.emissiveFactor||(r.emissiveFactor=[0,0,0]),r.pbrMetallicRoughness){r.pbrMetallicRoughness={...r.pbrMetallicRoughness};let e=r.pbrMetallicRoughness;e.baseColorTexture&&(e.baseColorTexture={...e.baseColorTexture},e.baseColorTexture.texture=this.getTexture(e.baseColorTexture.index)),e.metallicRoughnessTexture&&(e.metallicRoughnessTexture={...e.metallicRoughnessTexture},e.metallicRoughnessTexture.texture=this.getTexture(e.metallicRoughnessTexture.index))}return r}_resolveAccessor(e,t){let r=l[e.componentType],a=s[e.type],c={...e,id:e.id||`accessor-${t}`,bytesPerComponent:r,components:a,bytesPerElement:r*a,value:void 0,bufferView:void 0,sparse:void 0};if(void 0!==e.bufferView&&(c.bufferView=this.getBufferView(e.bufferView)),e.value)(0,i.v)(e.value.length===c.count*c.components),c.value=e.sparse?Uint8Array.prototype.slice.call(e.value):e.value;else if(c.bufferView)c.value=o(c,c.bufferView);else{let{ArrayType:e}=n(c,{byteLength:c.count*c.bytesPerElement});c.value=new e(c.count*c.components)}return e.sparse&&this._applySparseAccessor(c,e.sparse),c}_applySparseAccessor(e,t){let r=function(e){switch(e){case 5121:return Uint8Array;case 5123:return Uint16Array;case 5125:return Uint32Array;default:throw Error(`Invalid glTF sparse index component type ${e}`)}}(t.indices.componentType),a=this._getTypedArrayFromBufferView(r,this.getBufferView(t.indices.bufferView),t.indices.byteOffset||0,t.count),n=o({...e,count:t.count},this.getBufferView(t.values.bufferView),t.values.byteOffset||0,t.count);for(let r=0;r<t.count;r++){let t=Number(a[r]);(0,i.v)(Number.isInteger(t)&&t>=0&&t<e.count);for(let i=0;i<e.components;i++){let a=t*e.components+i,o=r*e.components+i;Reflect.set(e.value,a,n[o])}}}_getTypedArrayFromBufferView(e,t,r,a){let n=a*e.BYTES_PER_ELEMENT;(0,i.v)(r>=0&&n>=0&&r+n<=t.byteLength);let o=t.buffer,s=o.byteOffset+(t.byteOffset||0)+r;return new e(new Uint8Array(o.arrayBuffer,s,n).slice().buffer)}_resolveTexture(e,t){return{...e,id:e.id||`texture-${t}`,sampler:"number"==typeof e.sampler?this.getSampler(e.sampler):{id:"default-sampler",parameters:f},source:"number"==typeof e.source?this.getImage(e.source):void 0}}_resolveSampler(e,t){let r={id:e.id||`sampler-${t}`,...e,parameters:{}};for(let t of Object.keys(c)){let i=e[t];void 0!==i&&(r.parameters[c[t]]=i)}return r}_resolveImage(e,t){return{...e,id:e.id||`image-${t}`,image:this.images[t]??null,bufferView:void 0!==e.bufferView?this.getBufferView(e.bufferView):void 0}}_resolveBufferView(e,t){let r=e.buffer,a=this.buffers[r];(0,i.v)(a),(0,i.v)(a.byteOffset>=0&&a.byteLength>=0&&a.byteOffset+a.byteLength<=a.arrayBuffer.byteLength);let n=e.byteOffset||0;(0,i.v)(n>=0&&e.byteLength>=0&&n+e.byteLength<=a.byteLength);let o=a.byteOffset+n;return{id:`bufferView-${t}`,...e,buffer:this.buffers[r],data:new Uint8Array(a.arrayBuffer,o,e.byteLength)}}_resolveCamera(e,t){return{...e,id:e.id||`camera-${t}`}}}function u(e,t){return e?Number(e[t]):t}function m(e){return new p().postProcess(e)}},8137(e,t,r){r.d(t,{CC:()=>c,Mg:()=>f,e3:()=>l,ii:()=>o,lz:()=>s});let i=[n("baseColor","pbr_baseColorSampler","baseColorTexture",["pbrMetallicRoughness","baseColorTexture"]),n("metallicRoughness","pbr_metallicRoughnessSampler","metallicRoughnessTexture",["pbrMetallicRoughness","metallicRoughnessTexture"]),n("normal","pbr_normalSampler","normalTexture",["normalTexture"]),n("occlusion","pbr_occlusionSampler","occlusionTexture",["occlusionTexture"]),n("emissive","pbr_emissiveSampler","emissiveTexture",["emissiveTexture"]),n("specularColor","pbr_specularColorSampler","KHR_materials_specular.specularColorTexture",["extensions","KHR_materials_specular","specularColorTexture"]),n("specularIntensity","pbr_specularIntensitySampler","KHR_materials_specular.specularTexture",["extensions","KHR_materials_specular","specularTexture"]),n("transmission","pbr_transmissionSampler","KHR_materials_transmission.transmissionTexture",["extensions","KHR_materials_transmission","transmissionTexture"]),n("thickness","pbr_thicknessSampler","KHR_materials_volume.thicknessTexture",["extensions","KHR_materials_volume","thicknessTexture"]),n("clearcoat","pbr_clearcoatSampler","KHR_materials_clearcoat.clearcoatTexture",["extensions","KHR_materials_clearcoat","clearcoatTexture"]),n("clearcoatRoughness","pbr_clearcoatRoughnessSampler","KHR_materials_clearcoat.clearcoatRoughnessTexture",["extensions","KHR_materials_clearcoat","clearcoatRoughnessTexture"]),n("clearcoatNormal","pbr_clearcoatNormalSampler","KHR_materials_clearcoat.clearcoatNormalTexture",["extensions","KHR_materials_clearcoat","clearcoatNormalTexture"]),n("sheenColor","pbr_sheenColorSampler","KHR_materials_sheen.sheenColorTexture",["extensions","KHR_materials_sheen","sheenColorTexture"]),n("sheenRoughness","pbr_sheenRoughnessSampler","KHR_materials_sheen.sheenRoughnessTexture",["extensions","KHR_materials_sheen","sheenRoughnessTexture"]),n("iridescence","pbr_iridescenceSampler","KHR_materials_iridescence.iridescenceTexture",["extensions","KHR_materials_iridescence","iridescenceTexture"]),n("iridescenceThickness","pbr_iridescenceThicknessSampler","KHR_materials_iridescence.iridescenceThicknessTexture",["extensions","KHR_materials_iridescence","iridescenceThicknessTexture"]),n("anisotropy","pbr_anisotropySampler","KHR_materials_anisotropy.anisotropyTexture",["extensions","KHR_materials_anisotropy","anisotropyTexture"]),n("bump","pbr_bumpSampler","EXT_materials_bump.bumpTexture",["extensions","EXT_materials_bump","bumpTexture"]),n("diffuseTransmission","pbr_diffuseTransmissionSampler","KHR_materials_diffuse_transmission.diffuseTransmissionTexture",["extensions","KHR_materials_diffuse_transmission","diffuseTransmissionTexture"]),n("diffuseTransmissionColor","pbr_diffuseTransmissionColorSampler","KHR_materials_diffuse_transmission.diffuseTransmissionColorTexture",["extensions","KHR_materials_diffuse_transmission","diffuseTransmissionColorTexture"]),n("multiscatterColor","pbr_multiscatterColorSampler","KHR_materials_volume_scatter.multiscatterColorTexture",["extensions","KHR_materials_volume_scatter","multiscatterColorTexture"])],a=new Map(i.map(e=>[e.slot,e]));function n(e,t,r,i){return{slot:e,binding:t,displayName:r,pathSegments:i,colorSpace:"baseColor"===e||"emissive"===e||"specularColor"===e||"sheenColor"===e||"diffuseTransmissionColor"===e||"multiscatterColor"===e?"srgb":"linear",uvSetUniform:`${e}UVSet`,uvTransformUniform:`${e}UVTransform`}}function o(){return i}function s(e){let t=a.get(e);if(!t)throw Error(`Unknown PBR texture transform slot ${e}`);return t}function l(e){let t=e?.extensions?.KHR_texture_transform;return{offset:t?.offset?[t.offset[0],t.offset[1]]:[0,0],rotation:t?.rotation??0,scale:t?.scale?[t.scale[0],t.scale[1]]:[1,1]}}function c(e){let t=e?.extensions?.KHR_texture_transform;return t?.texCoord??e?.texCoord??0}function f(e){if("extensions"===e[0]&&"KHR_materials_scatter"===e[1]){let t="scatterStrengthTexture"===e[2]?"diffuseTransmission":"multiscatterColorTexture"===e[2]?"multiscatterColor":null;if(t&&3===e.length)return{...s(t),pathSegments:e}}return i.find(t=>t.pathSegments.length===e.length&&t.pathSegments.every((t,r)=>e[r]===t))||null}},37210(e,t,r){var i,a;r.d(t,{n:()=>i}),(a=i||(i={}))[a.POINTS=0]="POINTS",a[a.LINES=1]="LINES",a[a.LINE_LOOP=2]="LINE_LOOP",a[a.LINE_STRIP=3]="LINE_STRIP",a[a.TRIANGLES=4]="TRIANGLES",a[a.TRIANGLE_STRIP=5]="TRIANGLE_STRIP",a[a.TRIANGLE_FAN=6]="TRIANGLE_FAN",a[a.ONE=1]="ONE",a[a.SRC_ALPHA=770]="SRC_ALPHA",a[a.ONE_MINUS_SRC_ALPHA=771]="ONE_MINUS_SRC_ALPHA",a[a.FUNC_ADD=32774]="FUNC_ADD",a[a.LINEAR=9729]="LINEAR",a[a.NEAREST=9728]="NEAREST",a[a.NEAREST_MIPMAP_NEAREST=9984]="NEAREST_MIPMAP_NEAREST",a[a.LINEAR_MIPMAP_NEAREST=9985]="LINEAR_MIPMAP_NEAREST",a[a.NEAREST_MIPMAP_LINEAR=9986]="NEAREST_MIPMAP_LINEAR",a[a.LINEAR_MIPMAP_LINEAR=9987]="LINEAR_MIPMAP_LINEAR",a[a.TEXTURE_MAG_FILTER=10240]="TEXTURE_MAG_FILTER",a[a.TEXTURE_MIN_FILTER=10241]="TEXTURE_MIN_FILTER",a[a.TEXTURE_WRAP_S=10242]="TEXTURE_WRAP_S",a[a.TEXTURE_WRAP_T=10243]="TEXTURE_WRAP_T",a[a.REPEAT=10497]="REPEAT",a[a.CLAMP_TO_EDGE=33071]="CLAMP_TO_EDGE",a[a.MIRRORED_REPEAT=33648]="MIRRORED_REPEAT",a[a.UNPACK_FLIP_Y_WEBGL=37440]="UNPACK_FLIP_Y_WEBGL"},92207(e,t,r){r.d(t,{o:()=>c});var i=r(56204),a=r(23179),n=r(45156),o=r(3842),s=r(354),l=r(29995);class c extends s.V{children;transformSource;constructor(e={}){let{children:t=[]}=e=Array.isArray(e)?{children:e}:e;n.R.assert(t.every(e=>e instanceof s.V),"every child must an instance of ScenegraphNode"),super(e),this.children=t,this.transformSource=e.transformSource??null}getBounds(){let e=(0,l.hw)();return this.traverse((t,{worldMatrix:r})=>{let a=t.getBounds();if(!a)return;let n=new i.k(r).multiplyRight(t.matrix);(0,l.eI)(e,a,n)}),(0,l.$f)(e)?e:null}destroy(){this.children.forEach(e=>e.destroy()),this.removeAll(),super.destroy()}add(...e){for(let t of e)Array.isArray(t)?this.add(...t):this.children.push(t);return this}remove(e){let t=this.children,r=t.indexOf(e);return r>-1&&t.splice(r,1),this}removeAll(){return this.children=[],this}findNode(e){let t=this.findNodes(e);if(t.length>1)throw Error(`Ambiguous scenegraph path: ${e} (${t.length} matches)`);return t[0]}findNodes(e){let t=e.startsWith("/"),r="/"===e?[]:(t?e.slice(1):e).split("/").map(t=>{if(!t||/~(?![01])/.test(t))throw Error(`Invalid scenegraph path: ${e}`);return t.replace(/~1/g,"/").replace(/~0/g,"~")}),i=[],a=[],n=new Set,s=[{node:this,depth:0}];for(;s.length;){let{node:e,depth:l}=s.pop();(0,o.v)(!n.has(e)),n.add(e),a.length=l,a.push(e.id);let f=a.length-r.length;if((t?1===f:f>=0)&&r.every((e,t)=>e===a[f+t])&&i.push(e),e instanceof c)for(let t=e.children.length-1;t>=0;t--)s.push({node:e.children[t],depth:l+1})}return i}traverse(e,{worldMatrix:t=new i.k}={}){if(!this.display)return;let r=new i.k(t).multiplyRight(this.matrix);for(let t of this.children)t.display&&(t instanceof c?t.traverse(e,{worldMatrix:r}):e(t,{worldMatrix:r}))}traverseDepthSorted(e,{viewMatrix:t,worldMatrix:r=new i.k,order:n="back-to-front"}){let o=new i.k(t),s=[];this.traverse((e,t)=>{let r=e.getBounds(),n=r?new a.P(r[0]).add(r[1]).divide([2,2,2]):new a.P,l=new i.k(t.worldMatrix).multiplyRight(e.matrix);l.transformAsPoint(n,n),o.transformAsPoint(n,n),s.push({node:e,context:{worldMatrix:l,bounds:r,depth:-n[2]},index:s.length})},{worldMatrix:new i.k(r)});let l="back-to-front"===n?-1:1;for(let{node:t,context:r}of(s.sort((e,t)=>l*(e.context.depth-t.context.depth)||e.index-t.index),s))e(t,r)}preorderTraversal(e,{worldMatrix:t=new i.k}={}){let r=new i.k(t).multiplyRight(this.matrix);for(let t of(e(this,{worldMatrix:r}),this.children))t instanceof c?t.preorderTraversal(e,{worldMatrix:r}):e(t,{worldMatrix:r})}}},84793(e,t,r){r.d(t,{s:()=>n});var i=r(354),a=r(29995);class n extends i.V{model;instanceMatrices;bounds=null;managedResources;constructor(e){super(e),this.model=e.model,this.managedResources=e.managedResources||[],this.instanceMatrices=e.instanceMatrices||null,this.bounds=e.bounds?this.instanceMatrices?function(e,t){let r=(0,a.hw)();for(let i of t)(0,a.eI)(r,e,i);return(0,a.$f)(r)?r:null}(e.bounds,this.instanceMatrices):e.bounds:null,this.setProps(e)}destroy(){this.model&&(this.model.destroy(),this.model=null),this.managedResources.forEach(e=>e.destroy()),this.managedResources=[]}getBounds(){return this.bounds}draw(e){return this.model.draw(e)}}},29995(e,t,r){r.d(t,{$f:()=>s,eI:()=>o,hw:()=>n});var i=r(56204),a=r(23179);function n(){return[[1/0,1/0,1/0],[-1/0,-1/0,-1/0]]}function o(e,t,r){let n=new i.k(r);for(let r=0;r<8;r++){let i=new a.P(t[1&r?1:0][0],t[2&r?1:0][1],t[4&r?1:0][2]);n.transformAsPoint(i,i);for(let t=0;t<3;t++)e[0][t]=Math.min(e[0][t],i[t]),e[1][t]=Math.max(e[1][t],i[t])}}function s(e){return Number.isFinite(e[0][0])}},354(e,t,r){r.d(t,{V:()=>s});var i=r(56204),a=r(23179),n=r(51208);function o(e,t){if(!e)throw Error(t)}class s{id;matrix=new i.k;display=!0;selectable=!0;hoverable=!0;position=new a.P;rotation=new a.P;scale=new a.P(1,1,1);metadata={};userData={};props={};constructor(e={}){let{id:t}=e;this.id=t||(0,n.L)(this.constructor.name),this._setScenegraphNodeProps(e)}getBounds(){return null}destroy(){}delete(){this.destroy()}setProps(e){return this._setScenegraphNodeProps(e),this}toString(){return`{type: ScenegraphNode, id: ${this.id})}`}setPosition(e){return o(3===e.length,"setPosition requires vector argument"),this.position=e,this}setRotation(e){return o(3===e.length||4===e.length,"setRotation requires vector argument"),this.rotation=e,this}setScale(e){return o(3===e.length,"setScale requires vector argument"),this.scale=e,this}setMatrix(e,t=!0){t?this.matrix.copy(e):this.matrix=e}setMatrixComponents(e){let{position:t,rotation:r,scale:i,update:a=!0}=e;return t&&this.setPosition(t),r&&this.setRotation(r),i&&this.setScale(i),a&&this.updateMatrix(),this}updateMatrix(){if(this.matrix.identity(),this.matrix.translate(this.position),4===this.rotation.length){let e=new i.k().fromQuaternion(this.rotation);this.matrix.multiplyRight(e)}else this.matrix.rotateXYZ(this.rotation);return this.matrix.scale(this.scale),this}update({position:e,rotation:t,scale:r}={}){return e&&this.setPosition(e),t&&this.setRotation(t),r&&this.setScale(r),this.updateMatrix(),this}getCoordinateUniforms(e,t){t=t||this.matrix;let r=new i.k(e).multiplyRight(t),a=r.invert(),n=a.transpose();return{viewMatrix:e,modelMatrix:t,objectMatrix:t,worldMatrix:r,worldInverseMatrix:a,worldInverseTransposeMatrix:n}}_setScenegraphNodeProps(e){void 0!==e.selectable&&(this.selectable=e.selectable),void 0!==e.hoverable&&(this.hoverable=e.hoverable),void 0!==e.display&&(this.display=e.display),e?.position&&this.setPosition(e.position),e?.rotation&&this.setRotation(e.rotation),e?.scale&&this.setScale(e.scale),this.updateMatrix(),e?.matrix&&this.setMatrix(e.matrix),Object.assign(this.props,e)}}},72631(e,t,r){r.d(t,{s:()=>_});let i=`\
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
`;var n=r(43329);let o=`
#ifdef USE_AREA_LIGHT_LTC
uniform sampler2D areaLTCMatrix;
uniform sampler2D areaLTCAmplitude;
// GGX fit and Fresnel decomposition: Heitz, Dupuy, Hill and Neubelt, SIGGRAPH 2016.
// Explicit bilinear lookup avoids requiring filterable float32 textures on WebGPU.
vec4 areaLTC_lookup(sampler2D table, vec2 coordinate) {
  vec2 position = clamp(coordinate, 0.0, 1.0) * 63.0;
  ivec2 lower = ivec2(floor(position));
  ivec2 upper = min(lower + ivec2(1), ivec2(63));
  vec2 fraction = fract(position);
  return mix(mix(texelFetch(table, lower, 0), texelFetch(table, ivec2(upper.x, lower.y), 0), fraction.x),
             mix(texelFetch(table, ivec2(lower.x, upper.y), 0), texelFetch(table, upper, 0), fraction.x), fraction.y);
}

// Exact horizon clipping followed by the spherical polygon edge integral.
// Disk support uses an inscribed 32-gon; the area error is below 0.65 percent.
float areaLTC_integral(AreaLightUniform light, vec3 receiver, vec3 normal, vec3 view, mat3 inverseTransform) {
  if (dot(light.normal, receiver - light.position) <= 0.0) return 0.0;
  vec3 tangent = view - normal * dot(view, normal);
  if (dot(tangent, tangent) < 1e-8) {
    vec3 axis = abs(normal.z) < 0.9 ? vec3(0.0, 0.0, 1.0) : vec3(0.0, 1.0, 0.0);
    tangent = cross(axis, normal);
  }
  tangent = normalize(tangent);
  mat3 transform = inverseTransform * transpose(mat3(tangent, -cross(normal, tangent), normal));
  vec3 vertices[33];
  int count = light.disk != 0 ? 32 : 4;
  for (int index = 0; index < 32; index++) {
    if (index >= count) break;
    vec2 coordinate;
    if (light.disk != 0) {
      float angle = float(index) * 6.28318530718 / 32.0;
      coordinate = vec2(cos(angle), -sin(angle));
    } else {
      coordinate = index == 0 ? vec2(1.0, -1.0) : index == 1 ? vec2(-1.0, -1.0) : index == 2 ? vec2(-1.0, 1.0) : vec2(1.0, 1.0);
    }
    vertices[index] = transform * (light.position + coordinate.x * light.halfAxisX + coordinate.y * light.halfAxisY - receiver);
  }
  vec3 clipped[34];
  int clippedCount = 0;
  for (int index = 0; index < 32; index++) {
    if (index >= count) break;
    vec3 start = vertices[index];
    vec3 end = vertices[(index + 1) % count];
    if (start.z > 0.0) { clipped[clippedCount] = start; clippedCount++; }
    if ((start.z > 0.0) != (end.z > 0.0)) {
      clipped[clippedCount] = mix(start, end, start.z / (start.z - end.z));
      clippedCount++;
    }
  }
  if (clippedCount < 3) return 0.0;
  vec3 integral = vec3(0.0);
  for (int index = 0; index < 34; index++) {
    if (index >= clippedCount) break;
    vec3 start = normalize(clipped[index]);
    vec3 end = normalize(clipped[(index + 1) % clippedCount]);
    vec3 edge = cross(start, end);
    float sine = length(edge);
    if (sine > 1e-7) integral += edge * (acos(clamp(dot(start, end), -1.0, 1.0)) / sine);
  }
  return min(abs(integral.z) / 6.28318530718, 1.0);
}

vec3 areaLTC_specular(AreaLightUniform light, vec3 receiver, vec3 normal, vec3 view, float roughness, vec3 reflectance0, vec3 reflectance90) {
  vec2 coordinate = vec2(roughness, sqrt(1.0 - clamp(dot(normal, view), 0.0, 1.0)));
  vec4 coefficients = areaLTC_lookup(areaLTCMatrix, coordinate);
  vec4 amplitude = areaLTC_lookup(areaLTCAmplitude, coordinate);
  mat3 inverseTransform = mat3(vec3(coefficients.x, 0.0, coefficients.y), vec3(0.0, 1.0, 0.0), vec3(coefficients.z, 0.0, coefficients.w));
  vec3 fresnel = reflectance0 * amplitude.x + (reflectance90 - reflectance0) * amplitude.y;
  return light.color * fresnel * areaLTC_integral(light, receiver, normal, view, inverseTransform);
}

vec3 areaLTC_evaluate(int index, vec3 receiver, vec3 normal, vec3 view, float roughness, vec3 diffuseColor, vec3 reflectance0, vec3 reflectance90) {
  AreaLightUniform light = areaLighting_getLight(index);
  float diffuseIntegral = areaLTC_integral(light, receiver, normal, view, mat3(1.0));
  return light.color * diffuseColor * (vec3(1.0) - reflectance0) * diffuseIntegral +
    areaLTC_specular(light, receiver, normal, view, roughness, reflectance0, reflectance90);
}
#endif
`,s=`
#ifdef USE_AREA_LIGHT_LTC
@group(2) @binding(auto) var areaLTCMatrix: texture_2d<f32>;
@group(2) @binding(auto) var areaLTCAmplitude: texture_2d<f32>;
fn areaLTC_lookup(table: texture_2d<f32>, coordinate: vec2f) -> vec4f {
  let position = clamp(coordinate, vec2f(0.0), vec2f(1.0)) * 63.0;
  let lower = vec2i(floor(position));
  let upper = min(lower + vec2i(1), vec2i(63));
  let fraction = fract(position);
  return mix(mix(textureLoad(table, lower, 0), textureLoad(table, vec2i(upper.x, lower.y), 0), fraction.x),
             mix(textureLoad(table, vec2i(lower.x, upper.y), 0), textureLoad(table, upper, 0), fraction.x), fraction.y);
}
fn areaLTC_integral(light: AreaLightUniform, receiver: vec3f, normal: vec3f, view: vec3f, inverseTransform: mat3x3f) -> f32 {
  if (dot(light.normal, receiver - light.position) <= 0.0) { return 0.0; }
  var tangent = view - normal * dot(view, normal);
  if (dot(tangent, tangent) < 1e-8) {
    let axis = select(vec3f(0.0, 1.0, 0.0), vec3f(0.0, 0.0, 1.0), abs(normal.z) < 0.9);
    tangent = cross(axis, normal);
  }
  tangent = normalize(tangent);
  let transform = inverseTransform * transpose(mat3x3f(tangent, -cross(normal, tangent), normal));
  var vertices: array<vec3f, 33>;
  let count = select(4, 32, light.disk != 0);
  for (var index = 0; index < 32; index++) {
    if (index >= count) { break; }
    var coordinate: vec2f;
    if (light.disk != 0) {
      let angle = f32(index) * 6.28318530718 / 32.0;
      coordinate = vec2f(cos(angle), -sin(angle));
    } else {
      coordinate = vec2f(1.0, 1.0);
      if (index == 0) { coordinate = vec2f(1.0, -1.0); }
      if (index == 1) { coordinate = vec2f(-1.0, -1.0); }
      if (index == 2) { coordinate = vec2f(-1.0, 1.0); }
    }
    vertices[index] = transform * (light.position + coordinate.x * light.halfAxisX + coordinate.y * light.halfAxisY - receiver);
  }
  var clipped: array<vec3f, 34>;
  var clippedCount = 0;
  for (var index = 0; index < 32; index++) {
    if (index >= count) { break; }
    let start = vertices[index];
    let end = vertices[(index + 1) % count];
    if (start.z > 0.0) { clipped[clippedCount] = start; clippedCount++; }
    if ((start.z > 0.0) != (end.z > 0.0)) {
      clipped[clippedCount] = mix(start, end, start.z / (start.z - end.z));
      clippedCount++;
    }
  }
  if (clippedCount < 3) { return 0.0; }
  var integral = vec3f(0.0);
  for (var index = 0; index < 34; index++) {
    if (index >= clippedCount) { break; }
    let start = normalize(clipped[index]);
    let end = normalize(clipped[(index + 1) % clippedCount]);
    let edge = cross(start, end);
    let sine = length(edge);
    if (sine > 1e-7) { integral += edge * (acos(clamp(dot(start, end), -1.0, 1.0)) / sine); }
  }
  return min(abs(integral.z) / 6.28318530718, 1.0);
}
fn areaLTC_specular(light: AreaLightUniform, receiver: vec3f, normal: vec3f, view: vec3f, roughness: f32, reflectance0: vec3f, reflectance90: vec3f) -> vec3f {
  let coordinate = vec2f(roughness, sqrt(1.0 - clamp(dot(normal, view), 0.0, 1.0)));
  let coefficients = areaLTC_lookup(areaLTCMatrix, coordinate);
  let amplitude = areaLTC_lookup(areaLTCAmplitude, coordinate);
  let inverseTransform = mat3x3f(vec3f(coefficients.x, 0.0, coefficients.y), vec3f(0.0, 1.0, 0.0), vec3f(coefficients.z, 0.0, coefficients.w));
  let fresnel = reflectance0 * amplitude.x + (reflectance90 - reflectance0) * amplitude.y;
  return light.color * fresnel * areaLTC_integral(light, receiver, normal, view, inverseTransform);
}
fn areaLTC_evaluate(index: i32, receiver: vec3f, normal: vec3f, view: vec3f, roughness: f32, diffuseColor: vec3f, reflectance0: vec3f, reflectance90: vec3f) -> vec3f {
  let light = areaLighting_getLight(index);
  let diffuseIntegral = areaLTC_integral(light, receiver, normal, view, mat3x3f(vec3f(1.0,0.0,0.0),vec3f(0.0,1.0,0.0),vec3f(0.0,0.0,1.0)));
  return light.color * diffuseColor * (vec3f(1.0) - reflectance0) * diffuseIntegral +
    areaLTC_specular(light, receiver, normal, view, roughness, reflectance0, reflectance90);
}
#endif
`,l=`
layout(std140) uniform areaLightingUniforms {
  int lightCount;
  int sampleCount;
  AreaLightUniform lights[4];
} areaLighting;

int areaLighting_getLightCount() { return lighting.areaLightCount + areaLighting.lightCount; }
AreaLightUniform areaLighting_getLight(int index) {
  if (index < lighting.areaLightCount) return lighting.areaLights[index];
  return areaLighting.lights[index - lighting.areaLightCount];
}

PointLight areaLighting_getSample(int lightIndex, int sampleIndex, vec3 receiver) {
  AreaLightUniform light = areaLighting_getLight(lightIndex);
  int grid = int(sqrt(float(areaLighting.sampleCount)));
  vec2 coordinate = (vec2(float(sampleIndex % grid), float(sampleIndex / grid)) + 0.5) / float(grid);
  float area = 4.0 * length(light.halfAxisX) * length(light.halfAxisY);
  if (light.disk != 0) {
    float radius = sqrt(coordinate.y);
    float angle = coordinate.x * 6.28318530718;
    coordinate = radius * vec2(cos(angle), sin(angle));
    area *= 0.785398163397;
  } else {
    coordinate = coordinate * 2.0 - 1.0;
  }
  vec3 position = light.position + coordinate.x * light.halfAxisX + coordinate.y * light.halfAxisY;
  vec3 displacement = receiver - position;
  float distanceSquared = max(dot(displacement, displacement), 0.000001);
  float emissionCosine = max(dot(light.normal, displacement * inversesqrt(distanceSquared)), 0.0);
  return PointLight(light.color * (area * emissionCosine / (float(areaLighting.sampleCount) * distanceSquared)), position, vec3(1.0, 0.0, 0.0));
}
`,c=`
struct AreaLightingUniforms {
  lightCount: i32,
  sampleCount: i32,
  lights: array<AreaLightUniform, 4>,
};
@group(2) @binding(auto) var<uniform> areaLighting: AreaLightingUniforms;

fn areaLighting_getLightCount() -> i32 { return lighting.areaLightCount + areaLighting.lightCount; }
fn areaLighting_getLight(index: i32) -> AreaLightUniform {
  if (index < lighting.areaLightCount) { return lighting.areaLights[index]; }
  return areaLighting.lights[index - lighting.areaLightCount];
}

fn areaLighting_getSample(lightIndex: i32, sampleIndex: i32, receiver: vec3f) -> PointLight {
  let light = areaLighting_getLight(lightIndex);
  let grid = i32(sqrt(f32(areaLighting.sampleCount)));
  var coordinate = (vec2f(f32(sampleIndex % grid), f32(sampleIndex / grid)) + 0.5) / f32(grid);
  var area = 4.0 * length(light.halfAxisX) * length(light.halfAxisY);
  if (light.disk != 0) {
    let radius = sqrt(coordinate.y);
    let angle = coordinate.x * 6.28318530718;
    coordinate = radius * vec2f(cos(angle), sin(angle));
    area *= 0.785398163397;
  } else {
    coordinate = coordinate * 2.0 - 1.0;
  }
  let position = light.position + coordinate.x * light.halfAxisX + coordinate.y * light.halfAxisY;
  let displacement = receiver - position;
  let distanceSquared = max(dot(displacement, displacement), 0.000001);
  let emissionCosine = max(dot(light.normal, displacement * inverseSqrt(distanceSquared)), 0.0);
  return PointLight(light.color * (area * emissionCosine / (f32(areaLighting.sampleCount) * distanceSquared)), position, vec3f(1.0, 0.0, 0.0));
}
`;var f=r(72348);let p={name:"areaLighting",props:{},uniforms:{},dependencies:[n.x],defaultUniforms:{lightCount:0,sampleCount:64,lights:Array.from({length:f.zv},f.qO)},uniformTypes:{lightCount:"i32",sampleCount:"i32",lights:[f.HF,f.zv]},bindingLayout:[{name:"areaLighting",group:2},{name:"areaLTCMatrix",group:2},{name:"areaLTCAmplitude",group:2}],source:c+s,vs:l+o,fs:l+o,getUniforms(e={}){let t=e.lights||[];return{lightCount:Math.min(t.length,f.zv),sampleCount:e.sampleCount||64,lights:(0,f.i0)(t,e.useByteColors)}}},u=`\
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
  pbr_vNormal = normalize(vec3(pbrProjection.normalMatrix * vec4(normal.xyz, 0.0)));
#endif
#endif

#ifdef HAS_UV
  pbr_vUV0 = uv0;
#else
  pbr_vUV0 = vec2(0.,0.);
#endif

  pbr_vUV1 = uv1;
}
`,m=`\
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
  bool lightmapMapEnabled;
  float lightmapIntensity;
  int lightmapUVSet;
  mat3 lightmapUVTransform;
  float scatterStrengthFactor;
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
#ifdef HAS_LIGHTMAP
uniform sampler2D pbr_lightmapSampler;
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

#ifdef DOUBLE_SIDED
#ifdef HAS_NORMALS
  // Derivative normals already face the viewer; only flip an authored basis.
  if (!gl_FrontFacing) tbn = mat3(-tbn[0], -tbn[1], -tbn[2]);
#endif
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

// Visibility for the first four spotlights; environment and other lights are unaffected.
float pbr_ambientVisibility = 1.0;

vec4 pbr_filterColorWithShadows(vec4 vertexColor, float directionalVisibility, vec4 pointVisibility, vec4 spotVisibility)
{
  vec2 baseColorUV = getMaterialUV(pbrMaterial.baseColorUVSet, pbrMaterial.baseColorUVTransform);
  vec2 metallicRoughnessUV = getMaterialUV(
    pbrMaterial.metallicRoughnessUVSet,
    pbrMaterial.metallicRoughnessUVTransform
  );
  vec2 normalUV = getMaterialUV(pbrMaterial.normalUVSet, pbrMaterial.normalUVTransform);
  vec2 occlusionUV = getMaterialUV(pbrMaterial.occlusionUVSet, pbrMaterial.occlusionUVTransform);
  vec2 emissiveUV = getMaterialUV(pbrMaterial.emissiveUVSet, pbrMaterial.emissiveUVTransform);
  vec2 lightmapUV = getMaterialUV(pbrMaterial.lightmapUVSet, pbrMaterial.lightmapUVTransform);
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

  vec3 lightmapIrradiance = vec3(0.0);
#ifdef HAS_LIGHTMAP
  if (pbrMaterial.lightmapMapEnabled) {
    lightmapIrradiance = texture(pbr_lightmapSampler, lightmapUV).rgb * pbrMaterial.lightmapIntensity;
  }
#endif

  if(pbrMaterial.unlit){
    color.rgb = baseColor.rgb;
#ifdef HAS_LIGHTMAP
    if (pbrMaterial.lightmapMapEnabled) {
      color *= lightmapIrradiance / M_PI * pbr_ambientVisibility;
#ifdef HAS_OCCLUSIONMAP
      if (pbrMaterial.occlusionMapEnabled) {
        float ao = texture(pbr_occlusionSampler, occlusionUV).r;
        color = mix(color, color * ao, pbrMaterial.occlusionStrength);
      }
#endif
    }
#endif
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
      color += calculateFinalColor(pbrInfo, lighting.ambientColor * pbr_ambientVisibility);

      for(int i = 0; i < lighting.directionalLightCount; i++) {
        if (i < lighting.directionalLightCount) {
          PBRInfo_setDirectionalLight(pbrInfo, -lighting_getDirectionalLight(i).direction);
          color += calculateFinalColor(pbrInfo, lighting_getDirectionalLight(i).color * (i == 0 ? clamp(directionalVisibility, 0.0, 1.0) : 1.0));
        }
      }

      for(int i = 0; i < lighting.pointLightCount; i++) {
        if (i < lighting.pointLightCount) {
          PBRInfo_setPointLight(pbrInfo, lighting_getPointLight(i));
          float attenuation = getPointLightAttenuation(lighting_getPointLight(i), distance(lighting_getPointLight(i).position, pbr_vPosition));
          color += calculateFinalColor(pbrInfo, lighting_getPointLight(i).color * (i < 4 ? clamp(pointVisibility[min(i, 3)], 0.0, 1.0) : 1.0) / attenuation);
        }
      }

      for(int i = 0; i < lighting.spotLightCount; i++) {
        if (i < lighting.spotLightCount) {
          PBRInfo_setSpotLight(pbrInfo, lighting_getSpotLight(i));
          float attenuation = getSpotLightAttenuation(lighting_getSpotLight(i), pbr_vPosition);
          color += calculateFinalColor(pbrInfo, lighting_getSpotLight(i).color * (i < 4 ? clamp(spotVisibility[min(i, 3)], 0.0, 1.0) : 1.0) / attenuation);
        }
      }
      for (int areaIndex = 0; areaIndex < areaLighting_getLightCount(); areaIndex++) {
#ifdef USE_AREA_LIGHT_LTC
        color += areaLTC_evaluate(areaIndex, pbr_vPosition, pbrInfo.n, pbrInfo.v, pbrInfo.perceptualRoughness, pbrInfo.diffuseColor, pbrInfo.reflectance0, pbrInfo.reflectance90);
#else
        for (int sampleIndex = 0; sampleIndex < areaLighting.sampleCount; sampleIndex++) {
          PointLight sampleLight = areaLighting_getSample(areaIndex, sampleIndex, pbr_vPosition);
          if (dot(sampleLight.color, sampleLight.color) > 0.0) {
            PBRInfo_setPointLight(pbrInfo, sampleLight);
            color += calculateFinalColor(pbrInfo, sampleLight.color);
          }
        }
#endif
      }
#endif

vec3 indirectBaseColor = color;
#ifdef USE_IBL
      if (pbrMaterial.IBLenabled) {
        color += getIBLContribution(pbrInfo, n, reflection);
      }
#endif

      // The pinned KHR_lightmap draft explicitly defines c_diff = (1 - metallic) * baseColor.
      color += baseColor.rgb * (1.0 - metallic) * lightmapIrradiance / M_PI;
      color = indirectBaseColor + (color - indirectBaseColor) * pbr_ambientVisibility;

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

    float originalTransmission = transmission;
    float scatterReflection = 0.0;
#ifdef HAS_MATERIAL_SCATTER
    if (thickness <= 0.0) {
      float strength = clamp(pbrMaterial.scatterStrengthFactor, 0.0, 1.0);
#ifdef HAS_DIFFUSETRANSMISSIONMAP
      if (pbrMaterial.diffuseTransmissionMapEnabled) {
        strength *= texture(pbr_diffuseTransmissionSampler, diffuseTransmissionUV).a;
      }
#endif
      float anisotropy = pbrMaterial.scatterAnisotropy;
      scatterReflection = originalTransmission * strength * (1.0 - anisotropy) * 0.5;
      diffuseTransmission = originalTransmission * strength * (1.0 + anisotropy) * 0.5;
      diffuseTransmissionColor = multiscatterColor;
      transmission *= 1.0 - strength;
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
#ifdef HAS_MATERIAL_SCATTER
    diffuseColor = (baseColor.rgb * (1.0 - metallic) * (1.0 - originalTransmission) +
      multiscatterColor * scatterReflection) * (vec3(1.0) - dielectricSpecularF0);
#endif
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
      lighting.ambientColor * pbr_ambientVisibility,
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
        PBRInfo_setDirectionalLight(pbrInfo, -lighting_getDirectionalLight(i).direction);
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getDirectionalLight(i).color * (i == 0 ? clamp(directionalVisibility, 0.0, 1.0) : 1.0),
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
          lighting_getDirectionalLight(i).color * (i == 0 ? clamp(directionalVisibility, 0.0, 1.0) : 1.0),
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
          lighting_getPointLight(i).color * (i < 4 ? clamp(pointVisibility[min(i, 3)], 0.0, 1.0) : 1.0) / attenuation,
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
          lighting_getPointLight(i).color * (i < 4 ? clamp(pointVisibility[min(i, 3)], 0.0, 1.0) : 1.0) / attenuation,
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
          lighting_getSpotLight(i).color * (i < 4 ? clamp(spotVisibility[min(i, 3)], 0.0, 1.0) : 1.0) / attenuation,
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
          lighting_getSpotLight(i).color * (i < 4 ? clamp(spotVisibility[min(i, 3)], 0.0, 1.0) : 1.0) / attenuation,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }
      for (int areaIndex = 0; areaIndex < areaLighting_getLightCount(); areaIndex++) {
#ifdef USE_AREA_LIGHT_LTC
        // Unsupported fits retain numerical integration rather than silently dropping material lobes.
        if (anisotropyStrength <= 0.0001 && dot(sheenColor, sheenColor) <= 0.000001 && diffuseTransmission <= 0.0001) {
        color += areaLTC_evaluate(areaIndex, pbr_vPosition, pbrInfo.n, pbrInfo.v, pbrInfo.perceptualRoughness, pbrInfo.diffuseColor, pbrInfo.reflectance0, pbrInfo.reflectance90);
        color += clearcoatFactor * areaLTC_specular(areaLighting_getLight(areaIndex), pbr_vPosition, clearcoatNormal, pbrInfo.v, clearcoatRoughness, vec3(0.04), vec3(1.0));
        } else {
        for (int sampleIndex = 0; sampleIndex < areaLighting.sampleCount; sampleIndex++) {
          PointLight sampleLight = areaLighting_getSample(areaIndex, sampleIndex, pbr_vPosition);
          if (dot(sampleLight.color, sampleLight.color) > 0.0) {
            PBRInfo_setPointLight(pbrInfo, sampleLight);
            color += calculateMaterialLightColor(pbrInfo, sampleLight.color, clearcoatNormal,
              clearcoatFactor, clearcoatRoughness, sheenColor, sheenRoughness, anisotropyTangent, anisotropyStrength);
            color += calculateDiffuseTransmissionLight(pbrInfo, sampleLight.color,
              diffuseTransmissionColor, diffuseTransmission, multiscatterColor, thickness);
          }
        }

        }
#else
        for (int sampleIndex = 0; sampleIndex < areaLighting.sampleCount; sampleIndex++) {
          PointLight sampleLight = areaLighting_getSample(areaIndex, sampleIndex, pbr_vPosition);
          if (dot(sampleLight.color, sampleLight.color) > 0.0) {
            PBRInfo_setPointLight(pbrInfo, sampleLight);
            color += calculateMaterialLightColor(pbrInfo, sampleLight.color, clearcoatNormal,
              clearcoatFactor, clearcoatRoughness, sheenColor, sheenRoughness, anisotropyTangent, anisotropyStrength);
            color += calculateDiffuseTransmissionLight(pbrInfo, sampleLight.color,
              diffuseTransmissionColor, diffuseTransmission, multiscatterColor, thickness);
          }
        }

#endif
      }
#endif

    vec3 indirectBaseColor = color;
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

#ifdef HAS_MATERIAL_SCATTER
    color += (baseColor.rgb * (1.0 - metallic) * (1.0 - originalTransmission) +
      multiscatterColor * scatterReflection) * baseLayerEnergy * lightmapIrradiance / M_PI;
#else
    color += baseColor.rgb * (1.0 - metallic) * (1.0 - transmission) *
      (1.0 - diffuseTransmission) * baseLayerEnergy * lightmapIrradiance / M_PI;
#endif

    color = indirectBaseColor + (color - indirectBaseColor) * pbr_ambientVisibility;

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

// Depth-only passes use the same base-color alpha, vertex color and UV transform.
void pbr_discardMaskedFragment(vec4 vertexColor) {
#ifdef ALPHA_CUTOFF
  float alpha = pbrMaterial.baseColorFactor.a * vertexColor.a;
#ifdef HAS_BASECOLORMAP
  alpha *= texture(pbr_baseColorSampler, getMaterialUV(pbrMaterial.baseColorUVSet, pbrMaterial.baseColorUVTransform)).a;
#endif
  if (alpha < pbrMaterial.alphaCutoff) {discard;}
#endif
}

vec4 pbr_filterColorWithSpotShadows(vec4 vertexColor, vec4 spotVisibility) {
  return pbr_filterColorWithShadows(vertexColor, 1.0, vec4(1.0), spotVisibility);
}

vec4 pbr_filterColor(vec4 vertexColor) {
  return pbr_filterColorWithSpotShadows(vertexColor, vec4(1.0));
}
`,d=`\
#ifdef DOUBLE_SIDED
var<private> pbr_frontFacing: bool = true;
#endif
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
  lightmapMapEnabled: u32,
  lightmapIntensity: f32,
  lightmapUVSet: i32,
  lightmapUVTransform: mat3x3f,
  scatterStrengthFactor: f32,
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
#ifdef HAS_LIGHTMAP
@group(3) @binding(auto) var pbr_lightmapSampler: texture_2d<f32>;
@group(3) @binding(auto) var pbr_lightmapSamplerSampler: sampler;
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

#ifdef DOUBLE_SIDED
#ifdef HAS_NORMALS
  // Derivative normals already face the viewer; only flip an authored basis.
  if (!pbr_frontFacing) { tbn = mat3x3f(-tbn[0], -tbn[1], -tbn[2]); }
#endif
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

// Visibility for the first four spotlights; environment and other lights are unaffected.
var<private> pbr_ambientVisibility: f32 = 1.0;

fn pbr_filterColorWithShadows(vertexColor: vec4<f32>, directionalVisibility: f32, pointVisibility: vec4f, spotVisibility: vec4f) -> vec4<f32> {
  let baseColorUV = getMaterialUV(pbrMaterial.baseColorUVSet, pbrMaterial.baseColorUVTransform);
  let metallicRoughnessUV = getMaterialUV(
    pbrMaterial.metallicRoughnessUVSet,
    pbrMaterial.metallicRoughnessUVTransform
  );
  let normalUV = getMaterialUV(pbrMaterial.normalUVSet, pbrMaterial.normalUVTransform);
  let occlusionUV = getMaterialUV(pbrMaterial.occlusionUVSet, pbrMaterial.occlusionUVTransform);
  let emissiveUV = getMaterialUV(pbrMaterial.emissiveUVSet, pbrMaterial.emissiveUVTransform);
  let lightmapUV = getMaterialUV(pbrMaterial.lightmapUVSet, pbrMaterial.lightmapUVTransform);
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

  var lightmapIrradiance = vec3<f32>(0.0);
  #ifdef HAS_LIGHTMAP
  if (pbrMaterial.lightmapMapEnabled != 0u) {
    lightmapIrradiance = textureSample(pbr_lightmapSampler, pbr_lightmapSamplerSampler, lightmapUV).rgb * pbrMaterial.lightmapIntensity;
  }
  #endif

  if (pbrMaterial.unlit != 0u) {
    color = baseColor.rgb;
    #ifdef HAS_LIGHTMAP
    if (pbrMaterial.lightmapMapEnabled != 0u) {
      color *= lightmapIrradiance / M_PI * pbr_ambientVisibility;
      #ifdef HAS_OCCLUSIONMAP
      if (pbrMaterial.occlusionMapEnabled != 0) {
        let ao = textureSample(pbr_occlusionSampler, pbr_occlusionSamplerSampler, occlusionUV).r;
        color = mix(color, color * ao, pbrMaterial.occlusionStrength);
      }
      #endif
    }
    #endif
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
#ifdef USE_SCENE_PROBE_CAMERA
    let v = normalize(sceneProbeOrigin[0].xyz - fragmentInputs.pbr_vPosition);
#else
    let v = normalize(pbrProjection.camera - fragmentInputs.pbr_vPosition);
#endif  // Vector from surface point to camera
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
      color += calculateFinalColor(pbrInfo, lighting.ambientColor * pbr_ambientVisibility);

      for (var i = 0; i < lighting.directionalLightCount; i++) {
        if (i < lighting.directionalLightCount) {
          PBRInfo_setDirectionalLight(&pbrInfo, -lighting_getDirectionalLight(i).direction);
          color += calculateFinalColor(pbrInfo, lighting_getDirectionalLight(i).color * select(1.0, clamp(directionalVisibility, 0.0, 1.0), i == 0));
        }
      }

      for (var i = 0; i < lighting.pointLightCount; i++) {
        if (i < lighting.pointLightCount) {
          PBRInfo_setPointLight(&pbrInfo, lighting_getPointLight(i));
          let attenuation = getPointLightAttenuation(
            lighting_getPointLight(i),
            distance(lighting_getPointLight(i).position, fragmentInputs.pbr_vPosition)
          );
          color += calculateFinalColor(pbrInfo, lighting_getPointLight(i).color * select(1.0, clamp(pointVisibility[min(i, 3)], 0.0, 1.0), i < 4) / attenuation);
        }
      }

      for (var i = 0; i < lighting.spotLightCount; i++) {
        if (i < lighting.spotLightCount) {
          PBRInfo_setSpotLight(&pbrInfo, lighting_getSpotLight(i));
          let attenuation = getSpotLightAttenuation(
            lighting_getSpotLight(i),
            fragmentInputs.pbr_vPosition
          );
          color += calculateFinalColor(pbrInfo, lighting_getSpotLight(i).color * select(1.0, clamp(spotVisibility[min(i, 3)], 0.0, 1.0), i < 4) / attenuation);
        }
      }
      for (var areaIndex: i32 = 0; areaIndex < areaLighting_getLightCount(); areaIndex++) {
#ifdef USE_AREA_LIGHT_LTC
        color += areaLTC_evaluate(areaIndex, fragmentInputs.pbr_vPosition, pbrInfo.n, pbrInfo.v, pbrInfo.perceptualRoughness, pbrInfo.diffuseColor, pbrInfo.reflectance0, pbrInfo.reflectance90);
#else
        for (var sampleIndex: i32 = 0; sampleIndex < areaLighting.sampleCount; sampleIndex++) {
          let sampleLight = areaLighting_getSample(areaIndex, sampleIndex, fragmentInputs.pbr_vPosition);
          if (dot(sampleLight.color, sampleLight.color) > 0.0) {
            PBRInfo_setPointLight(&pbrInfo, sampleLight);
            color += calculateFinalColor(pbrInfo, sampleLight.color);
          }
        }
#endif
      }
      #endif

      let indirectBaseColor = color;
#ifdef USE_IBL
      if (pbrMaterial.IBLenabled != 0) {
        color += getIBLContribution(pbrInfo, n, reflection);
      }
      #endif

      // The pinned KHR_lightmap draft explicitly defines c_diff = (1 - metallic) * baseColor.
      color += baseColor.rgb * (1.0 - metallic) * lightmapIrradiance / M_PI;
      color = indirectBaseColor + (color - indirectBaseColor) * pbr_ambientVisibility;

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

    let originalTransmission = transmission;
    var scatterReflection = 0.0;
#ifdef HAS_MATERIAL_SCATTER
    if (thickness <= 0.0) {
      var strength = clamp(pbrMaterial.scatterStrengthFactor, 0.0, 1.0);
#ifdef HAS_DIFFUSETRANSMISSIONMAP
      if (pbrMaterial.diffuseTransmissionMapEnabled != 0) {
        strength *= textureSample(
        pbr_diffuseTransmissionSampler,
        pbr_diffuseTransmissionSamplerSampler,
        diffuseTransmissionUV
      ).a;
      }
#endif
      let anisotropy = pbrMaterial.scatterAnisotropy;
      scatterReflection = originalTransmission * strength * (1.0 - anisotropy) * 0.5;
      diffuseTransmission = originalTransmission * strength * (1.0 + anisotropy) * 0.5;
      diffuseTransmissionColor = multiscatterColor;
      transmission *= 1.0 - strength;
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
#ifdef HAS_MATERIAL_SCATTER
    diffuseColor = (baseColor.rgb * (1.0 - metallic) * (1.0 - originalTransmission) +
      multiscatterColor * scatterReflection) * (vec3f(1.0) - dielectricSpecularF0);
#endif
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
      lighting.ambientColor * pbr_ambientVisibility,
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
        PBRInfo_setDirectionalLight(&pbrInfo, -lighting_getDirectionalLight(i).direction);
        color += calculateMaterialLightColor(
          pbrInfo,
          lighting_getDirectionalLight(i).color * select(1.0, clamp(directionalVisibility, 0.0, 1.0), i == 0),
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
          lighting_getDirectionalLight(i).color * select(1.0, clamp(directionalVisibility, 0.0, 1.0), i == 0),
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
          lighting_getPointLight(i).color * select(1.0, clamp(pointVisibility[min(i, 3)], 0.0, 1.0), i < 4) / attenuation,
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
          lighting_getPointLight(i).color * select(1.0, clamp(pointVisibility[min(i, 3)], 0.0, 1.0), i < 4) / attenuation,
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
          lighting_getSpotLight(i).color * select(1.0, clamp(spotVisibility[min(i, 3)], 0.0, 1.0), i < 4) / attenuation,
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
          lighting_getSpotLight(i).color * select(1.0, clamp(spotVisibility[min(i, 3)], 0.0, 1.0), i < 4) / attenuation,
          diffuseTransmissionColor,
          diffuseTransmission,
          multiscatterColor,
          thickness
        );
      }
    }
      for (var areaIndex: i32 = 0; areaIndex < areaLighting_getLightCount(); areaIndex++) {
#ifdef USE_AREA_LIGHT_LTC
        // Unsupported fits retain numerical integration rather than silently dropping material lobes.
        if (anisotropyStrength <= 0.0001 && dot(sheenColor, sheenColor) <= 0.000001 && diffuseTransmission <= 0.0001) {
        color += areaLTC_evaluate(areaIndex, fragmentInputs.pbr_vPosition, pbrInfo.n, pbrInfo.v, pbrInfo.perceptualRoughness, pbrInfo.diffuseColor, pbrInfo.reflectance0, pbrInfo.reflectance90);
        color += clearcoatFactor * areaLTC_specular(areaLighting_getLight(areaIndex), fragmentInputs.pbr_vPosition, clearcoatNormal, pbrInfo.v, clearcoatRoughness, vec3f(0.04), vec3f(1.0));
        } else {
        for (var sampleIndex: i32 = 0; sampleIndex < areaLighting.sampleCount; sampleIndex++) {
          let sampleLight = areaLighting_getSample(areaIndex, sampleIndex, fragmentInputs.pbr_vPosition);
          if (dot(sampleLight.color, sampleLight.color) > 0.0) {
            PBRInfo_setPointLight(&pbrInfo, sampleLight);
            color += calculateMaterialLightColor(pbrInfo, sampleLight.color, clearcoatNormal,
              clearcoatFactor, clearcoatRoughness, sheenColor, sheenRoughness, anisotropyTangent, anisotropyStrength);
            color += calculateDiffuseTransmissionLight(pbrInfo, sampleLight.color,
              diffuseTransmissionColor, diffuseTransmission, multiscatterColor, thickness);
          }
        }

        }
#else
        for (var sampleIndex: i32 = 0; sampleIndex < areaLighting.sampleCount; sampleIndex++) {
          let sampleLight = areaLighting_getSample(areaIndex, sampleIndex, fragmentInputs.pbr_vPosition);
          if (dot(sampleLight.color, sampleLight.color) > 0.0) {
            PBRInfo_setPointLight(&pbrInfo, sampleLight);
            color += calculateMaterialLightColor(pbrInfo, sampleLight.color, clearcoatNormal,
              clearcoatFactor, clearcoatRoughness, sheenColor, sheenRoughness, anisotropyTangent, anisotropyStrength);
            color += calculateDiffuseTransmissionLight(pbrInfo, sampleLight.color,
              diffuseTransmissionColor, diffuseTransmission, multiscatterColor, thickness);
          }
        }

#endif
      }
    #endif

    let indirectBaseColor = color;
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

#ifdef HAS_MATERIAL_SCATTER
    color += (baseColor.rgb * (1.0 - metallic) * (1.0 - originalTransmission) +
      multiscatterColor * scatterReflection) * baseLayerEnergy * lightmapIrradiance / M_PI;
#else
    color += baseColor.rgb * (1.0 - metallic) * (1.0 - transmission) *
      (1.0 - diffuseTransmission) * baseLayerEnergy * lightmapIrradiance / M_PI;
#endif

    color = indirectBaseColor + (color - indirectBaseColor) * pbr_ambientVisibility;

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

// Depth-only passes use the same base-color alpha, vertex color and UV transform.
fn pbr_discardMaskedFragment(vertexColor: vec4f) {
#ifdef ALPHA_CUTOFF
  var alpha = pbrMaterial.baseColorFactor.a * vertexColor.a;
#ifdef HAS_BASECOLORMAP
  alpha *= textureSample(pbr_baseColorSampler, pbr_baseColorSamplerSampler, getMaterialUV(pbrMaterial.baseColorUVSet, pbrMaterial.baseColorUVTransform)).a;
#endif
  if (alpha < pbrMaterial.alphaCutoff) {discard;}
#endif
}

fn pbr_filterColorWithSpotShadows(vertexColor: vec4f, spotVisibility: vec4f) -> vec4f {
  return pbr_filterColorWithShadows(vertexColor, 1.0, vec4f(1.0), spotVisibility);
}

fn pbr_filterColor(vertexColor: vec4<f32>) -> vec4<f32> {
  return pbr_filterColorWithSpotShadows(vertexColor, vec4f(1.0));
}
`,h=`\
layout(std140) uniform pbrProjectionUniforms {
  mat4 modelViewProjectionMatrix;
  mat4 modelMatrix;
  mat4 normalMatrix;
  vec3 camera;
} pbrProjection;
`,g=`\
struct pbrProjectionUniforms {
  modelViewProjectionMatrix: mat4x4<f32>,
  modelMatrix: mat4x4<f32>,
  normalMatrix: mat4x4<f32>,
  camera: vec3<f32>
};

@group(0) @binding(auto) var<uniform> pbrProjection: pbrProjectionUniforms;
`,b=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],v=`\
layout(std140) uniform pbrSceneUniforms {
  float exposure;
  highp int toneMapMode;
  float environmentIntensity;
  float environmentRotation;
  float environmentMipCount;
  highp int outputEncoding;
  vec2 framebufferSize;
  mat4 viewMatrix;
  mat4 projectionMatrix;
} pbrScene;

#ifdef USE_TRANSMISSION_FRAMEBUFFER
uniform sampler2D pbr_transmissionFramebufferSampler;
#endif
`,S=`\
struct pbrSceneUniforms {
  exposure: f32,
  toneMapMode: i32,
  environmentIntensity: f32,
  environmentRotation: f32,
  environmentMipCount: f32,
  outputEncoding: i32,
  framebufferSize: vec2<f32>,
  viewMatrix: mat4x4<f32>,
  projectionMatrix: mat4x4<f32>
};

@group(1) @binding(auto) var<uniform> pbrScene: pbrSceneUniforms;

#ifdef USE_TRANSMISSION_FRAMEBUFFER
@group(1) @binding(auto) var pbr_transmissionFramebufferSampler: texture_2d<f32>;
@group(1) @binding(auto) var pbr_transmissionFramebufferSamplerSampler: sampler;
#endif
`,_={props:{},uniforms:{},defaultUniforms:{unlit:!1,baseColorMapEnabled:!1,baseColorFactor:[1,1,1,1],normalMapEnabled:!1,normalScale:1,emissiveMapEnabled:!1,lightmapMapEnabled:!1,emissiveFactor:[0,0,0],metallicRoughnessValues:[1,1],metallicRoughnessMapEnabled:!1,occlusionMapEnabled:!1,occlusionStrength:1,alphaCutoffEnabled:!1,alphaCutoff:.5,IBLenabled:!1,scaleIBLAmbient:[1,1],scaleDiffBaseMR:[0,0,0,0],scaleFGDSpec:[0,0,0,0],specularColorFactor:[1,1,1],specularIntensityFactor:1,specularColorMapEnabled:!1,specularIntensityMapEnabled:!1,ior:1.5,transmissionFactor:0,transmissionMapEnabled:!1,thicknessFactor:0,attenuationDistance:1e9,attenuationColor:[1,1,1],clearcoatFactor:0,clearcoatRoughnessFactor:0,clearcoatMapEnabled:!1,clearcoatRoughnessMapEnabled:!1,sheenColorFactor:[0,0,0],sheenRoughnessFactor:0,sheenColorMapEnabled:!1,sheenRoughnessMapEnabled:!1,iridescenceFactor:0,iridescenceIor:1.3,iridescenceThicknessRange:[100,400],iridescenceMapEnabled:!1,anisotropyStrength:0,anisotropyRotation:0,anisotropyDirection:[1,0],anisotropyMapEnabled:!1,emissiveStrength:1,lightmapIntensity:1,scatterStrengthFactor:0,dispersion:0,baseColorUVSet:0,baseColorUVTransform:[1,0,0,0,1,0,0,0,1],metallicRoughnessUVSet:0,metallicRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],normalUVSet:0,normalUVTransform:[1,0,0,0,1,0,0,0,1],occlusionUVSet:0,occlusionUVTransform:[1,0,0,0,1,0,0,0,1],emissiveUVSet:0,lightmapUVSet:0,emissiveUVTransform:[1,0,0,0,1,0,0,0,1],lightmapUVTransform:[1,0,0,0,1,0,0,0,1],specularColorUVSet:0,specularColorUVTransform:[1,0,0,0,1,0,0,0,1],specularIntensityUVSet:0,specularIntensityUVTransform:[1,0,0,0,1,0,0,0,1],transmissionUVSet:0,transmissionUVTransform:[1,0,0,0,1,0,0,0,1],thicknessUVSet:0,thicknessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatUVSet:0,clearcoatUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatRoughnessUVSet:0,clearcoatRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],clearcoatNormalUVSet:0,clearcoatNormalUVTransform:[1,0,0,0,1,0,0,0,1],sheenColorUVSet:0,sheenColorUVTransform:[1,0,0,0,1,0,0,0,1],sheenRoughnessUVSet:0,sheenRoughnessUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceUVSet:0,iridescenceUVTransform:[1,0,0,0,1,0,0,0,1],iridescenceThicknessUVSet:0,iridescenceThicknessUVTransform:[1,0,0,0,1,0,0,0,1],anisotropyUVSet:0,anisotropyUVTransform:[1,0,0,0,1,0,0,0,1],bumpFactor:1,bumpMapEnabled:!1,diffuseTransmissionFactor:0,diffuseTransmissionMapEnabled:!1,diffuseTransmissionColorFactor:[1,1,1],diffuseTransmissionColorMapEnabled:!1,multiscatterColorFactor:[0,0,0],multiscatterColorMapEnabled:!1,scatterAnisotropy:0,bumpUVSet:0,bumpUVTransform:[1,0,0,0,1,0,0,0,1],diffuseTransmissionUVSet:0,diffuseTransmissionUVTransform:[1,0,0,0,1,0,0,0,1],diffuseTransmissionColorUVSet:0,diffuseTransmissionColorUVTransform:[1,0,0,0,1,0,0,0,1],multiscatterColorUVSet:0,multiscatterColorUVTransform:[1,0,0,0,1,0,0,0,1]},name:"pbrMaterial",firstBindingSlot:0,bindingLayout:[{name:"pbrMaterial",group:3},{name:"pbr_baseColorSampler",group:3},{name:"pbr_normalSampler",group:3},{name:"pbr_emissiveSampler",group:3},{name:"pbr_lightmapSampler",group:3},{name:"pbr_metallicRoughnessSampler",group:3},{name:"pbr_occlusionSampler",group:3},{name:"pbr_specularColorSampler",group:3},{name:"pbr_specularIntensitySampler",group:3},{name:"pbr_transmissionSampler",group:3},{name:"pbr_thicknessSampler",group:3},{name:"pbr_clearcoatSampler",group:3},{name:"pbr_clearcoatRoughnessSampler",group:3},{name:"pbr_clearcoatNormalSampler",group:3},{name:"pbr_sheenColorSampler",group:3},{name:"pbr_sheenRoughnessSampler",group:3},{name:"pbr_iridescenceSampler",group:3},{name:"pbr_iridescenceThicknessSampler",group:3},{name:"pbr_anisotropySampler",group:3},{name:"pbr_bumpSampler",group:3},{name:"pbr_diffuseTransmissionSampler",group:3},{name:"pbr_diffuseTransmissionColorSampler",group:3},{name:"pbr_multiscatterColorSampler",group:3}],dependencies:[n.x,p,{name:"ibl",firstBindingSlot:32,bindingLayout:[{name:"pbr_diffuseEnvSampler",group:2},{name:"pbr_specularEnvSampler",group:2},{name:"pbr_brdfLUT",group:2}],source:i,vs:a,fs:a},{name:"pbrProjection",bindingLayout:[{name:"pbrProjection",group:0}],source:g,vs:h,fs:h,getUniforms:e=>e,uniformTypes:{modelViewProjectionMatrix:"mat4x4<f32>",modelMatrix:"mat4x4<f32>",normalMatrix:"mat4x4<f32>",camera:"vec3<f32>"}},{name:"pbrScene",bindingLayout:[{name:"pbrScene",group:1},{name:"pbr_transmissionFramebufferSampler",group:1}],source:S,vs:v,fs:v,getUniforms:e=>e,uniformTypes:{exposure:"f32",toneMapMode:"i32",environmentIntensity:"f32",environmentRotation:"f32",environmentMipCount:"f32",outputEncoding:"i32",framebufferSize:"vec2<f32>",viewMatrix:"mat4x4<f32>",projectionMatrix:"mat4x4<f32>"},defaultUniforms:{exposure:1,toneMapMode:2,environmentIntensity:1,environmentRotation:.5*Math.PI,environmentMipCount:1,outputEncoding:1,framebufferSize:[1,1],viewMatrix:b,projectionMatrix:b}}],source:d,vs:u,fs:m,defines:{LIGHTING_FRAGMENT:!0,HAS_NORMALMAP:!1,HAS_EMISSIVEMAP:!1,HAS_LIGHTMAP:!1,HAS_OCCLUSIONMAP:!1,HAS_BASECOLORMAP:!1,HAS_METALROUGHNESSMAP:!1,HAS_SPECULARCOLORMAP:!1,HAS_SPECULARINTENSITYMAP:!1,HAS_TRANSMISSIONMAP:!1,HAS_THICKNESSMAP:!1,HAS_CLEARCOATMAP:!1,HAS_CLEARCOATROUGHNESSMAP:!1,HAS_CLEARCOATNORMALMAP:!1,HAS_SHEENCOLORMAP:!1,HAS_SHEENROUGHNESSMAP:!1,HAS_IRIDESCENCEMAP:!1,HAS_IRIDESCENCETHICKNESSMAP:!1,HAS_ANISOTROPYMAP:!1,HAS_BUMPMAP:!1,HAS_DIFFUSETRANSMISSIONMAP:!1,HAS_DIFFUSETRANSMISSIONCOLORMAP:!1,HAS_MULTISCATTERCOLORMAP:!1,USE_MATERIAL_EXTENSIONS:!1,ALPHA_CUTOFF:!1,USE_IBL:!1,PBR_DEBUG:!1},getUniforms:e=>e,uniformTypes:{unlit:"i32",baseColorMapEnabled:"i32",baseColorFactor:"vec4<f32>",normalMapEnabled:"i32",normalScale:"f32",emissiveMapEnabled:"i32",emissiveFactor:"vec3<f32>",metallicRoughnessValues:"vec2<f32>",metallicRoughnessMapEnabled:"i32",occlusionMapEnabled:"i32",occlusionStrength:"f32",alphaCutoffEnabled:"i32",alphaCutoff:"f32",specularColorFactor:"vec3<f32>",specularIntensityFactor:"f32",specularColorMapEnabled:"i32",specularIntensityMapEnabled:"i32",ior:"f32",transmissionFactor:"f32",transmissionMapEnabled:"i32",thicknessFactor:"f32",attenuationDistance:"f32",attenuationColor:"vec3<f32>",clearcoatFactor:"f32",clearcoatRoughnessFactor:"f32",clearcoatMapEnabled:"i32",clearcoatRoughnessMapEnabled:"i32",sheenColorFactor:"vec3<f32>",sheenRoughnessFactor:"f32",sheenColorMapEnabled:"i32",sheenRoughnessMapEnabled:"i32",iridescenceFactor:"f32",iridescenceIor:"f32",iridescenceThicknessRange:"vec2<f32>",iridescenceMapEnabled:"i32",anisotropyStrength:"f32",anisotropyRotation:"f32",anisotropyDirection:"vec2<f32>",anisotropyMapEnabled:"i32",emissiveStrength:"f32",dispersion:"f32",IBLenabled:"i32",scaleIBLAmbient:"vec2<f32>",scaleDiffBaseMR:"vec4<f32>",scaleFGDSpec:"vec4<f32>",baseColorUVSet:"i32",baseColorUVTransform:"mat3x3<f32>",metallicRoughnessUVSet:"i32",metallicRoughnessUVTransform:"mat3x3<f32>",normalUVSet:"i32",normalUVTransform:"mat3x3<f32>",occlusionUVSet:"i32",occlusionUVTransform:"mat3x3<f32>",emissiveUVSet:"i32",emissiveUVTransform:"mat3x3<f32>",specularColorUVSet:"i32",specularColorUVTransform:"mat3x3<f32>",specularIntensityUVSet:"i32",specularIntensityUVTransform:"mat3x3<f32>",transmissionUVSet:"i32",transmissionUVTransform:"mat3x3<f32>",thicknessUVSet:"i32",thicknessUVTransform:"mat3x3<f32>",clearcoatUVSet:"i32",clearcoatUVTransform:"mat3x3<f32>",clearcoatRoughnessUVSet:"i32",clearcoatRoughnessUVTransform:"mat3x3<f32>",clearcoatNormalUVSet:"i32",clearcoatNormalUVTransform:"mat3x3<f32>",sheenColorUVSet:"i32",sheenColorUVTransform:"mat3x3<f32>",sheenRoughnessUVSet:"i32",sheenRoughnessUVTransform:"mat3x3<f32>",iridescenceUVSet:"i32",iridescenceUVTransform:"mat3x3<f32>",iridescenceThicknessUVSet:"i32",iridescenceThicknessUVTransform:"mat3x3<f32>",anisotropyUVSet:"i32",anisotropyUVTransform:"mat3x3<f32>",bumpFactor:"f32",bumpMapEnabled:"i32",diffuseTransmissionFactor:"f32",diffuseTransmissionMapEnabled:"i32",diffuseTransmissionColorFactor:"vec3<f32>",diffuseTransmissionColorMapEnabled:"i32",multiscatterColorFactor:"vec3<f32>",multiscatterColorMapEnabled:"i32",scatterAnisotropy:"f32",bumpUVSet:"i32",bumpUVTransform:"mat3x3<f32>",diffuseTransmissionUVSet:"i32",diffuseTransmissionUVTransform:"mat3x3<f32>",diffuseTransmissionColorUVSet:"i32",diffuseTransmissionColorUVTransform:"mat3x3<f32>",multiscatterColorUVSet:"i32",multiscatterColorUVTransform:"mat3x3<f32>",lightmapMapEnabled:"i32",lightmapIntensity:"f32",lightmapUVSet:"i32",lightmapUVTransform:"mat3x3<f32>",scatterStrengthFactor:"f32"}}},79918(e,t,r){r.d(t,{T:()=>i,n:()=>a});let i={name:"glTF",id:"gltf",module:"scene",encoding:"binary",format:"gltf",extensions:["gltf","glb"],mimeTypes:["model/gltf+json","model/gltf-binary"],text:!0,binary:!0,tests:["glTF"]},a={name:"GLB",id:"glb",module:"scene",encoding:"binary",format:"glb",extensions:["glb"],mimeTypes:["model/gltf-binary"],binary:!0,tests:["glTF"]}},82510(e,t,r){r.d(t,{B:()=>n});var i=r(97959);async function a(){let{GLTFLoaderWithParser:e}=await Promise.all([r.e("445"),r.e("3907"),r.e("6357"),r.e("7895"),r.e("1356"),r.e("1002")]).then(r.bind(r,10737));return e}let n={dataType:null,batchType:null,...r(79918).T,version:i.x,preload:a,options:{gltf:{normalize:!0,loadBuffers:!0,loadFiles:!1,loadExternalAssets:!1,loadImages:!0,loadAudio:!0,decompressMeshes:!0}}}},97959(e,t,r){r.d(t,{x:()=>i});let i="5.0.0-beta.10"}}]);
//# sourceMappingURL=2614.dcf4db0d.js.map