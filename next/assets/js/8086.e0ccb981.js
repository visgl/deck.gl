"use strict";(self.webpackChunkproject_website=self.webpackChunkproject_website||[]).push([["8086"],{17909(e,t,r){r.d(t,{N:()=>u});var i=r(44055),n=r(44412),s=r(13559),a=r(18823);let o=new WeakMap;class u{static defaultProps={...n.r.defaultProps};static getDefaultPipelineFactory(e){let t=e.getModuleData("@luma.gl/core");return t.defaultPipelineFactory||=new u(e),t.defaultPipelineFactory}static beginAsyncCompilation(e){if(o.has(e))throw Error("An asynchronous pipeline compilation scope is already active");let t=[];return o.set(e,t),t}static getAsyncCompilation(e){return o.get(e)}static endAsyncCompilation(e,t){if(o.get(e)!==t)throw Error("The asynchronous pipeline compilation scope is not active");o.delete(e)}device;_hashCounter=0;_hashes={};_renderPipelineCache={};_computePipelineCache={};_pendingRenderPipelineCache={};_pendingComputePipelineCache={};_sharedRenderPipelineCache={};get[Symbol.toStringTag](){return"PipelineFactory"}toString(){return`PipelineFactory(${this.device.id})`}constructor(e){this.device=e}createRenderPipeline(e){if(!this.device.props._cachePipelines)return this.device.createRenderPipeline(e);let t={...n.r.defaultProps,...e},r=this._renderPipelineCache,i=this._hashRenderPipeline(t),o=r[i]?.resource;if(o)r[i].useCount++,this.device.props.debugFactories&&s.R.log(3,`${this}: ${r[i].resource} reused, count=${r[i].useCount}, (id=${e.id})`)();else{let e="webgl"===this.device.type&&this.device.props._sharePipelines?this.createSharedRenderPipeline(t):void 0;(o=this.device.createRenderPipeline({...t,id:t.id?`${t.id}-cached`:(0,a.L)("unnamed-cached"),_sharedRenderPipeline:e})).hash=i,r[i]={resource:o,useCount:1},this.device.props.debugFactories&&s.R.log(3,`${this}: ${o} created, count=${r[i].useCount}`)()}return o}async createRenderPipelineAsync(e){if(!this.device.props._cachePipelines)return await this.device.createRenderPipelineAsync(e);let t={...n.r.defaultProps,...e},r=this._hashRenderPipeline(t);return await this._createPipelineAsync(this._renderPipelineCache,this._pendingRenderPipelineCache,r,()=>{let e="webgl"===this.device.type&&this.device.props._sharePipelines?this.createSharedRenderPipeline(t):void 0;return this.device.createRenderPipelineAsync({...t,id:t.id?`${t.id}-cached`:(0,a.L)("unnamed-cached"),_sharedRenderPipeline:e})})}createComputePipeline(e){if(!this.device.props._cachePipelines)return this.device.createComputePipeline(e);let t={...i.C.defaultProps,...e},r=this._computePipelineCache,n=this._hashComputePipeline(t),a=r[n]?.resource;return a?(r[n].useCount++,this.device.props.debugFactories&&s.R.log(3,`${this}: ${r[n].resource} reused, count=${r[n].useCount}, (id=${e.id})`)()):((a=this.device.createComputePipeline({...t,id:t.id?`${t.id}-cached`:void 0})).hash=n,r[n]={resource:a,useCount:1},this.device.props.debugFactories&&s.R.log(3,`${this}: ${a} created, count=${r[n].useCount}`)()),a}async createComputePipelineAsync(e){if(!this.device.props._cachePipelines)return await this.device.createComputePipelineAsync(e);let t={...i.C.defaultProps,...e},r=this._hashComputePipeline(t);return await this._createPipelineAsync(this._computePipelineCache,this._pendingComputePipelineCache,r,()=>this.device.createComputePipelineAsync({...t,id:t.id?`${t.id}-cached`:void 0}))}release(e){if(!this.device.props._cachePipelines)return void e.destroy();let t=this._getCache(e),r=e.hash;t[r].useCount--,0===t[r].useCount?(this._destroyPipeline(e),this.device.props.debugFactories&&s.R.log(3,`${this}: ${e} released and destroyed`)()):t[r].useCount<0?(s.R.error(`${this}: ${e} released, useCount < 0, resetting`)(),t[r].useCount=0):this.device.props.debugFactories&&s.R.log(3,`${this}: ${e} released, count=${t[r].useCount}`)()}createSharedRenderPipeline(e){let t=this._hashSharedRenderPipeline(e),r=this._sharedRenderPipelineCache[t];return r||(r={resource:this.device._createSharedRenderPipelineWebGL(e),useCount:0},this._sharedRenderPipelineCache[t]=r),r.useCount++,r.resource}releaseSharedRenderPipeline(e){if(!e.sharedRenderPipeline)return;let t=this._hashSharedRenderPipeline(e.sharedRenderPipeline.props),r=this._sharedRenderPipelineCache[t];r&&(r.useCount--,0===r.useCount&&(r.resource.destroy(),delete this._sharedRenderPipelineCache[t]))}async _createPipelineAsync(e,t,r,i){let s=e[r];if(s)return s.useCount++,s.resource;let a=t[r];if(a)return a.useCount++,await a.promise;let o={promise:void 0,useCount:1};return o.promise=i().then(i=>{delete t[r];let s=e[r];return s?(s.useCount+=o.useCount,i.destroy(),i instanceof n.r&&this.releaseSharedRenderPipeline(i),s.resource):(i.hash=r,e[r]={resource:i,useCount:o.useCount},i)}).catch(e=>{throw delete t[r],e}),t[r]=o,await o.promise}_destroyPipeline(e){let t=this._getCache(e);return!!this.device.props._destroyPipelines&&(delete t[e.hash],e.destroy(),e instanceof n.r&&this.releaseSharedRenderPipeline(e),!0)}_getCache(e){let t;if(e instanceof i.C&&(t=this._computePipelineCache),e instanceof n.r&&(t=this._renderPipelineCache),!t)throw Error(`${this}`);if(!t[e.hash])throw Error(`${this}: ${e} matched incorrect entry`);return t}_hashComputePipeline(e){let{type:t}=this.device,r=this._getHash(e.shader.source),i=this._getHash(JSON.stringify(e.shaderLayout));return`${t}/C/${r}SL${i}`}_hashRenderPipeline(e){let t=e.vs?this._getHash(e.vs.source):0,r=e.fs?this._getHash(e.fs.source):0,i=this._getWebGLVaryingHash(e),n=this._getHash(JSON.stringify(e.shaderLayout)),s=this._getHash(JSON.stringify(e._uniformBlockLayouts)),a=this._getHash(JSON.stringify(e.bufferLayout)),{type:o}=this.device;if("webgl"===o){let u=this._getHash(JSON.stringify(e.parameters));return`${o}/R/${t}/${r}V${i}T${e.topology}P${u}SL${n}UBL${s}BL${a}`}{let s=this._getHash(JSON.stringify({vertexEntryPoint:e.vertexEntryPoint,fragmentEntryPoint:e.fragmentEntryPoint})),u=this._getHash(JSON.stringify(e.parameters)),l=this._getWebGPUAttachmentHash(e);return`${o}/R/${t}/${r}V${i}T${e.topology}EP${s}P${u}SL${n}BL${a}A${l}`}}_hashSharedRenderPipeline(e){let t=e.vs?this._getHash(e.vs.source):0,r=e.fs?this._getHash(e.fs.source):0,i=this._getWebGLVaryingHash(e);return`webgl/S/${t}/${r}V${i}`}_getHash(e){return void 0===this._hashes[e]&&(this._hashes[e]=this._hashCounter++),this._hashes[e]}_getWebGLVaryingHash(e){let{varyings:t=[],bufferMode:r=null}=e;return this._getHash(JSON.stringify({varyings:t,bufferMode:r}))}_getWebGPUAttachmentHash(e){let t=e.colorAttachmentFormats??[this.device.preferredColorFormat],r=e.depthStencilAttachmentFormat??(e.parameters?.depthWriteEnabled?this.device.preferredDepthFormat:null);return this._getHash(JSON.stringify({colorAttachmentFormats:t,depthStencilAttachmentFormat:r}))}}},16598(e,t,r){r.d(t,{g:()=>s});var i=r(97718),n=r(13559);class s{static defaultProps={...i.M.defaultProps};static getDefaultShaderFactory(e){let t=e.getModuleData("@luma.gl/core");return t.defaultShaderFactory||=new s(e),t.defaultShaderFactory}device;_cache={};get[Symbol.toStringTag](){return"ShaderFactory"}toString(){return`${this[Symbol.toStringTag]}(${this.device.id})`}constructor(e){this.device=e}createShader(e){if(!this.device.props._cacheShaders)return this.device.createShader(e);let t=this._hashShader(e),r=this._cache[t];if(r)r.useCount++,this.device.props.debugFactories&&n.R.log(3,`${this}: Reusing shader ${r.resource.id} count=${r.useCount}`)();else{let i=this.device.createShader({...e,id:e.id?`${e.id}-cached`:void 0});this._cache[t]=r={resource:i,useCount:1},this.device.props.debugFactories&&n.R.log(3,`${this}: Created new shader ${i.id}`)()}return r.resource}release(e){if(!this.device.props._cacheShaders)return void e.destroy();let t=this._hashShader(e),r=this._cache[t];if(r)if(r.useCount--,0===r.useCount)this.device.props._destroyShaders&&(delete this._cache[t],r.resource.destroy(),this.device.props.debugFactories&&n.R.log(3,`${this}: Releasing shader ${e.id}, destroyed`)());else if(r.useCount<0)throw Error(`ShaderFactory: Shader ${e.id} released too many times`);else this.device.props.debugFactories&&n.R.log(3,`${this}: Releasing shader ${e.id} count=${r.useCount}`)()}_hashShader(e){return`${e.stage}:${e.source}`}}},13125(e,t,r){r.d(t,{K:()=>f});var i=r(60691),n=r(13559),s=r(73348);function a(e){return Array.isArray(e)?0===e.length||"number"==typeof e[0]:ArrayBuffer.isView(e)&&!(e instanceof DataView)}class o{name;uniforms={};modifiedUniforms={};modified=!0;bindingLayout={};needsRedraw="initialized";constructor(e){if(this.name=e?.name||"unnamed",e?.name&&e?.shaderLayout){let t=e?.shaderLayout.bindings?.find(t=>"uniform"===t.type&&t.name===e?.name);if(!t)throw Error(e?.name);for(let e of t.uniforms||[])this.bindingLayout[e.name]=e}}setUniforms(e){for(let[t,r]of Object.entries(e))this._setUniform(t,r)&&!this.needsRedraw&&this.setNeedsRedraw(`${this.name}.${t}=${r}`)}setNeedsRedraw(e){this.needsRedraw=this.needsRedraw||e}getAllUniforms(){return this.modifiedUniforms={},this.needsRedraw=!1,this.uniforms||{}}_setUniform(e,t){return!function(e,t,r=16){if(e===t)return!0;if(!a(e)||!a(t)||e.length!==t.length)return!1;let i=Math.min(r,128);if(e.length>i)return!1;for(let r=0;r<e.length;++r)if(t[r]!==e[r])return!1;return!0}(this.uniforms[e],t)&&(this.uniforms[e]=a(t)?t.slice():t,this.modifiedUniforms[e]=!0,this.modified=!0,!0)}}var u=r(77154);class l{layout;constructor(e){this.layout=e}has(e){return!!this.layout.fields[e]}get(e){let t=this.layout.fields[e];return t?{offset:t.offset,size:t.size}:void 0}getFlatUniformValues(e){let t={};for(let[r,i]of Object.entries(e)){let e=this.layout.uniformTypes[r];e?this._flattenCompositeValue(t,r,e,i):this.layout.fields[r]&&(t[r]=i)}return t}getData(e){let t=(0,u.X)(this.layout.byteLength);new Uint8Array(t,0,this.layout.byteLength).fill(0);let r={i32:new Int32Array(t),u32:new Uint32Array(t),f32:new Float32Array(t),f16:new Uint16Array(t)};for(let[t,i]of Object.entries(this.getFlatUniformValues(e)))this._writeLeafValue(r,t,i);return new Uint8Array(t,0,this.layout.byteLength)}_flattenCompositeValue(e,t,r,i){if(void 0!==i){var o;if("string"==typeof r||this.layout.fields[t]){e[t]=i;return}if(Array.isArray(r)){let s=r[0],o=r[1];if(Array.isArray(s))throw Error(`Nested arrays are not supported for ${t}`);if("string"==typeof s&&a(i))return void this._flattenPackedArray(e,t,s,o,i);if(!Array.isArray(i))return void n.R.warn(`Unsupported uniform array value for ${t}:`,i)();for(let r=0;r<Math.min(i.length,o);r++){let n=i[r];void 0!==n&&this._flattenCompositeValue(e,`${t}[${r}]`,s,n)}return}if((0,s.WC)(r)&&(o=i)&&"object"==typeof o&&!Array.isArray(o)&&!ArrayBuffer.isView(o)){for(let[n,s]of Object.entries(i)){if(void 0===s)continue;let i=`${t}.${n}`;this._flattenCompositeValue(e,i,r[n],s)}return}n.R.warn(`Unsupported uniform value for ${t}:`,i)()}}_flattenPackedArray(e,t,r,i,n){let a=(0,s.jV)(r,this.layout.layout).components;for(let r=0;r<i;r++){var o,u,l;let i=r*a;if(i>=n.length)break;1===a?e[`${t}[${r}]`]=Number(n[i]):e[`${t}[${r}]`]=(o=n,u=i,l=i+a,Array.prototype.slice.call(o,u,l))}}_writeLeafValue(e,t,r){let i=this.layout.fields[t];if(!i)return void n.R.warn(`Uniform ${t} not found in layout`)();let{type:s,components:a,columns:o,rows:u,offset:l,columnStride:f}=i,c=e[s];if(1===a){c[l]=Number(r);return}if(1===o){for(let e=0;e<a;e++)c[l+e]=Number(r[e]??0);return}let h=0;for(let e=0;e<o;e++){let t=l+e*f;for(let e=0;e<u;e++)c[t+e]=Number(r[h++]??0)}}}class f{device;uniformBlocks=new Map;shaderBlockLayouts=new Map;shaderBlockWriters=new Map;uniformBuffers=new Map;constructor(e,t){for(let[r,i]of(this.device=e,Object.entries(t))){let t=(0,s.Pr)(i.uniformTypes??{},{layout:i.layout??("webgpu"===e.type?"wgsl-uniform":"std140")}),n=new l(t);this.shaderBlockLayouts.set(r,t),this.shaderBlockWriters.set(r,n);let a=new o({name:r});a.setUniforms(n.getFlatUniformValues(i.defaultUniforms||{})),this.uniformBlocks.set(r,a)}}destroy(){for(let e of this.uniformBuffers.values())e.destroy()}setUniforms(e,t){for(let[t,r]of Object.entries(e)){let e=this.shaderBlockWriters.get(t),i=e?.getFlatUniformValues(r||{});this.uniformBlocks.get(t)?.setUniforms(i||{})}this.updateUniformBuffers(t)}getUniformBufferByteLength(e){return Math.max(this.shaderBlockLayouts.get(e)?.byteLength||0,1024)}getUniformBufferData(e){let t=this.uniformBlocks.get(e)?.getAllUniforms()||{},r=this.shaderBlockWriters.get(e);return r?.getData(t)||new Uint8Array(0)}createUniformBuffer(e,t){t&&this.setUniforms(t);let r=this.getUniformBufferByteLength(e),n=this.device.createBuffer({usage:i.h.UNIFORM|i.h.COPY_DST,byteLength:r}),s=this.getUniformBufferData(e);return n.write(s),n}getManagedUniformBuffer(e){if(!this.uniformBuffers.get(e)){let t=this.getUniformBufferByteLength(e),r=this.device.createBuffer({usage:i.h.UNIFORM|i.h.COPY_DST,byteLength:t});this.uniformBuffers.set(e,r)}return this.uniformBuffers.get(e)}updateUniformBuffers(e){let t=!1;for(let r of this.uniformBlocks.keys()){let i=this.updateUniformBuffer(r,e);t||=i}return t&&n.R.log(3,`UniformStore.updateUniformBuffers(): ${t}`)(),t}updateUniformBuffer(e,t){let r=this.uniformBlocks.get(e),i=this.uniformBuffers.get(e),s=!1;if(i&&r?.needsRedraw){s||=r.needsRedraw;let a=this.getUniformBufferData(e);if((i=this.uniformBuffers.get(e))&&(t?this.device.writeBufferViaCommandEncoder(t,i,a):i.write(a)),n.R.level>=4){let t=this.uniformBlocks.get(e)?.getAllUniforms();n.R.log(4,`Writing to uniform buffer ${String(e)}`,a,t)()}}return s}}},93613(e,t,r){r.d(t,{F:()=>o});var i=r(60966),n=r(39584);let s=0,a={requestAnimationFrame:e=>{let t;return(t="u">typeof window?window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame:null)?t.call(window,e):setTimeout(()=>e("u">typeof performance?performance.now():Date.now()),1e3/60)},cancelAnimationFrame:e=>{let t;(t="u">typeof window?window.cancelAnimationFrame||window.webkitCancelAnimationFrame||window.mozCancelAnimationFrame:null)?t.call(window,e):clearTimeout(e)}};class o{static defaultAnimationLoopProps={device:null,mobileQuality:void 0,onAddHTML:()=>"",onInitialize:async()=>null,onRender:()=>{},onFinalize:()=>{},onError:e=>{console.error(e)},stats:void 0,autoResizeViewport:!1,animationFrameProvider:a};device=null;canvas=null;props;animationProps=null;timeline=null;stats;sharedStats;cpuTime;gpuTime;frameRate;display;_needsRedraw="initialized";_initialized=!1;_running=!1;_animationFrameId=null;_nextFramePromise=null;_resolveNextFrame=null;_cpuStartTime=0;_error=null;_lastFrameTime=0;constructor(e){if(this.props={...o.defaultAnimationLoopProps,...e},!(e=this.props).device)throw Error("No device provided");this.stats=e.stats||new n.A({id:`animation-loop-${s++}`}),this.sharedStats=i.a.stats.get("Animation Loop"),this.frameRate=this.stats.get("Frame Rate"),this.frameRate.setSampleSize(1),this.cpuTime=this.stats.get("CPU Time"),this.gpuTime=this.stats.get("GPU Time"),this.setProps({autoResizeViewport:e.autoResizeViewport,animationFrameProvider:e.animationFrameProvider}),this.start=this.start.bind(this),this.stop=this.stop.bind(this),this._onMousemove=this._onMousemove.bind(this),this._onMouseleave=this._onMouseleave.bind(this)}destroy(){this.stop(),this._setDisplay(null),this.device?._disableDebugGPUTime()}delete(){this.destroy()}reportError(e){this._error=e,this.props.onError(e),this.props.onError===o.defaultAnimationLoopProps.onError&&"u">typeof window&&"u">typeof ErrorEvent&&window.dispatchEvent(new ErrorEvent("error",{error:e,message:e.message}))}setNeedsRedraw(e){return this._needsRedraw=this._needsRedraw||e,this}needsRedraw(){let e=this._needsRedraw;return this._needsRedraw=!1,e}setProps(e){if("autoResizeViewport"in e&&(this.props.autoResizeViewport=e.autoResizeViewport||!1),"animationFrameProvider"in e){let t=e.animationFrameProvider||a;if(t!==this.props.animationFrameProvider){let e=null!==this._animationFrameId;e&&this._cancelAnimationFrame(),this.props.animationFrameProvider=t,e&&this._requestAnimationFrame()}}return this}async start(){if(this._running)return this;this._running=!0;try{let e;if(!this._initialized){if(this._initialized=!0,await this._initDevice(),this._initialize(),!this._running)return null;await this.props.onInitialize(this._getAnimationProps())}if(!this._running)return null;return!1!==e&&(this._cancelAnimationFrame(),this._requestAnimationFrame()),this}catch(t){let e=t instanceof Error?t:Error("Unknown error");throw this.props.onError(e),e}}stop(){if(this._running){let e=this.animationProps;this._cancelAnimationFrame(),this._nextFramePromise=null,this._resolveNextFrame=null,this._running=!1,this._lastFrameTime=0,e&&this.props.onFinalize(e)}return this}redraw(e,t=null){return this.device?.isLost||this._error||(this._beginFrameTimers(e),this._setupFrame(),this.animationProps&&(this.animationProps.animationFrame=t),this._updateAnimationProps(),this._renderFrame(this._getAnimationProps()),this._clearNeedsRedraw(),this._resolveNextFrame&&(this._resolveNextFrame(this),this._nextFramePromise=null,this._resolveNextFrame=null),this._endFrameTimers()),this}attachTimeline(e){return this.timeline=e,this.timeline}detachTimeline(){this.timeline=null}waitForRender(){return this.setNeedsRedraw("waitForRender"),this._nextFramePromise||(this._nextFramePromise=new Promise(e=>{this._resolveNextFrame=e})),this._nextFramePromise}async toDataURL(){if(this.setNeedsRedraw("toDataURL"),await this.waitForRender(),this.canvas instanceof HTMLCanvasElement)return this.canvas.toDataURL();throw Error("OffscreenCanvas")}_initialize(){this._startEventHandling(),this._initializeAnimationProps(),this._updateAnimationProps(),this._resizeViewport(),this.device?._enableDebugGPUTime()}_setDisplay(e){this.display&&(this.display.destroy(),this.display.animationLoop=null),e&&(e.animationLoop=this),this.display=e}_requestAnimationFrame(){this._running&&(this._animationFrameId=this.props.animationFrameProvider.requestAnimationFrame(this._animationFrame.bind(this)))}_cancelAnimationFrame(){null!==this._animationFrameId&&(this.props.animationFrameProvider.cancelAnimationFrame(this._animationFrameId),this._animationFrameId=null)}_animationFrame(e,t){if(this._running)try{this.redraw(e,t??null),this._requestAnimationFrame()}catch(t){let e=t instanceof Error?t:Error(String(t));this.reportError(e),this.stop()}}_renderFrame(e){if(this.display)return void this.display._renderFrame(e);let t=this.props.onRender(this._getAnimationProps());this.device&&!1!==t&&this.device.submit()}_clearNeedsRedraw(){this._needsRedraw=!1}_setupFrame(){this._resizeViewport()}_initializeAnimationProps(){let e=this.device?.getDefaultCanvasContext();if(!this.device||!e)throw Error("loop");let t=e?.canvas,r=e.props.useDevicePixels;this.animationProps={animationLoop:this,device:this.device,canvasContext:e,canvas:t,useDevicePixels:r,timeline:this.timeline,needsRedraw:!1,width:1,height:1,aspect:1,time:0,startTime:Date.now(),engineTime:0,tick:0,tock:0,animationFrame:null,_mousePosition:null,mobileQuality:this.props.mobileQuality}}_getAnimationProps(){if(!this.animationProps)throw Error("animationProps");return this.animationProps}_updateAnimationProps(){if(!this.animationProps)return;let{width:e,height:t,aspect:r}=this._getSizeAndAspect();(e!==this.animationProps.width||t!==this.animationProps.height)&&this.setNeedsRedraw("drawing buffer resized"),r!==this.animationProps.aspect&&this.setNeedsRedraw("drawing buffer aspect changed"),this.animationProps.width=e,this.animationProps.height=t,this.animationProps.aspect=r,this.animationProps.needsRedraw=this._needsRedraw,this.animationProps.engineTime=Date.now()-this.animationProps.startTime,this.timeline&&this.timeline.update(this.animationProps.engineTime),this.animationProps.tick=Math.floor(this.animationProps.time/1e3*60),this.animationProps.tock++,this.animationProps.time=this.timeline?this.timeline.getTime():this.animationProps.engineTime}async _initDevice(){if(this.device=await this.props.device,!this.device)throw Error("No device provided");this.canvas=this.device.getDefaultCanvasContext().canvas||null}_createInfoDiv(){if(this.canvas&&this.props.onAddHTML){let e=document.createElement("div");document.body.appendChild(e),e.style.position="relative";let t=document.createElement("div");t.style.position="absolute",t.style.left="10px",t.style.bottom="10px",t.style.width="300px",t.style.background="white",this.canvas instanceof HTMLCanvasElement&&e.appendChild(this.canvas),e.appendChild(t);let r=this.props.onAddHTML(t);r&&(t.innerHTML=r)}}_getSizeAndAspect(){if(!this.device)return{width:1,height:1,aspect:1};let[e,t]=this.device.getDefaultCanvasContext().getDrawingBufferSize();return{width:e,height:t,aspect:e>0&&t>0?e/t:1}}_resizeViewport(){this.props.autoResizeViewport&&this.device.gl&&this.device.gl.viewport(0,0,this.device.gl.drawingBufferWidth,this.device.gl.drawingBufferHeight)}_beginFrameTimers(e){let t=e??("u">typeof performance?performance.now():Date.now());if(this._lastFrameTime){let e=t-this._lastFrameTime;e>0&&this.frameRate.addTime(e)}this._lastFrameTime=t,this.device?._isDebugGPUTimeEnabled()&&this._consumeEncodedGpuTime(),this.cpuTime.timeStart()}_endFrameTimers(){this.device?._isDebugGPUTimeEnabled()&&this._consumeEncodedGpuTime(),this.cpuTime.timeEnd(),this._updateSharedStats()}_consumeEncodedGpuTime(){if(!this.device)return;let e=this.device.commandEncoder._gpuTimeMs;void 0!==e&&(this.gpuTime.addTime(e),this.device.commandEncoder._gpuTimeMs=void 0)}_updateSharedStats(){if(this.stats!==this.sharedStats){for(let e of Object.keys(this.sharedStats.stats))this.stats.stats[e]||delete this.sharedStats.stats[e];this.stats.forEach(e=>{let t=this.sharedStats.get(e.name,e.type);t.sampleSize=e.sampleSize,t.time=e.time,t.count=e.count,t.samples=e.samples,t.lastTiming=e.lastTiming,t.lastSampleTime=e.lastSampleTime,t.lastSampleCount=e.lastSampleCount,t._count=e._count,t._time=e._time,t._samples=e._samples,t._startTime=e._startTime,t._timerPending=e._timerPending})}}_startEventHandling(){this.canvas&&(this.canvas.addEventListener("mousemove",this._onMousemove.bind(this)),this.canvas.addEventListener("mouseleave",this._onMouseleave.bind(this)))}_onMousemove(e){e instanceof MouseEvent&&(this._getAnimationProps()._mousePosition=[e.offsetX,e.offsetY])}_onMouseleave(e){this._getAnimationProps()._mousePosition=null}}},3066(e,t,r){r.d(t,{K:()=>s});let i=1,n=1;class s{time=0;channels=new Map;animations=new Map;playing=!1;lastEngineTime=-1;addChannel(e){let{delay:t=0,duration:r=1/0,rate:n=1,repeat:s=1}=e,a=i++,o={time:0,delay:t,duration:r,rate:n,repeat:s};return this._setChannelTime(o,this.time),this.channels.set(a,o),a}removeChannel(e){for(let[t,r]of(this.channels.delete(e),this.animations))r.channel===e&&this.detachAnimation(t)}isFinished(e){let t=this.channels.get(e);return void 0!==t&&this.time>=t.delay+t.duration*t.repeat}getTime(e){if(void 0===e)return this.time;let t=this.channels.get(e);return void 0===t?-1:t.time}setTime(e){for(let t of(this.time=Math.max(0,e),this.channels.values()))this._setChannelTime(t,this.time);for(let e of this.animations.values()){let{animation:t,channel:r}=e;t.setTime(this.getTime(r))}}play(){this.playing=!0}pause(){this.playing=!1,this.lastEngineTime=-1}reset(){this.setTime(0)}attachAnimation(e,t){let r=n++;return this.animations.set(r,{animation:e,channel:t}),e.setTime(this.getTime(t)),r}detachAnimation(e){this.animations.delete(e)}update(e){this.playing&&(-1===this.lastEngineTime&&(this.lastEngineTime=e),this.setTime(this.time+(e-this.lastEngineTime)),this.lastEngineTime=e)}_setChannelTime(e,t){let r=t-e.delay;r>=e.duration*e.repeat?e.time=e.duration*e.rate:(e.time=Math.max(0,r)%e.duration,e.time*=e.rate)}}},9079(e,t,r){r.d(t,{p:()=>a});var i=r(60691),n=r(1100),s=r(12434);class a{device;model;transformFeedback;static defaultProps={...s.K.defaultProps,feedbackBufferMode:"separate",outputs:void 0,feedbackBuffers:void 0};static isSupported(e){return e?.info?.type==="webgl"}constructor(e,t=a.defaultProps){if(!a.isSupported(e))throw Error("BufferTransform not yet implemented on WebGPU");this.device=e,this.model=new s.K(this.device,{id:t.id||"buffer-transform-model",fs:t.fs||(0,n.Wk)(),topology:t.topology||"point-list",varyings:t.outputs||t.varyings,...t,bufferMode:t.bufferMode||("interleaved"===t.feedbackBufferMode?35980:35981)}),this.transformFeedback=this.device.createTransformFeedback({layout:this.model.pipeline.shaderLayout,buffers:t.feedbackBuffers}),this.model.setTransformFeedback(this.transformFeedback)}destroy(){this.model&&this.model.destroy()}delete(){this.destroy()}run(e){e?.inputBuffers&&this.model.setAttributes(e.inputBuffers),e?.outputBuffers&&this.transformFeedback.setBuffers(e.outputBuffers);let t=this.device.beginRenderPass({discard:!0,...e});this.model.draw(t),t.end()}getBuffer(e){return this.transformFeedback.getBuffer(e)}readAsync(e){let t=this.getBuffer(e);if(!t)throw Error("BufferTransform#getBuffer");if(t instanceof i.h)return t.readAsync();let{buffer:r,byteOffset:n=0,byteLength:s=r.byteLength}=t;return r.readAsync(n,s)}}},31709(e,t,r){r.d(t,{C:()=>_});var i=r(17909),n=r(44055),s=r(16598),a=r(86103),o=r(13125),u=r(13559),l=r(60633),f=r(60691),c=r(8780),h=r(79083),d=r(10612),p=r(20131),m=r(92790),g=r(51208);class _{static async createAsync(e,t){let r,n=!i.N.getAsyncCompilation(e),s=n?i.N.beginAsyncCompilation(e):i.N.getAsyncCompilation(e);try{r=new _(e,t)}finally{n&&i.N.endAsyncCompilation(e,s)}try{return n?await Promise.all(s):await r._pipelineInitialization,r}catch(e){throw r.destroy(),e}}static defaultProps={...n.C.defaultProps,id:"unnamed",handle:void 0,userData:{},source:"",sourceLanguage:void 0,modules:[],defines:{},plugins:[],bindings:void 0,shaderInputs:void 0,pipelineFactory:void 0,shaderFactory:void 0,shaderAssembler:c._P.getDefaultShaderAssembler("wgsl"),debugShaders:void 0};device;id;pipelineFactory;shaderFactory;userData={};bindings={};pipeline;source;shader;shaderInputs;_uniformStore;_pipelineNeedsUpdate="newly created";_getModuleUniforms;props;_destroyed=!1;_pipelineInitialization;constructor(e,t){var r;if("webgpu"!==e.type)throw Error("Computation is only supported in WebGPU");this.props={..._.defaultProps,...t},t=this.props,this.id=t.id||(0,g.L)("model"),this.device=e,Object.assign(this.userData,t.userData);let n={type:(r=e).type,shaderLanguage:r.info.shadingLanguage,shaderLanguageVersion:r.info.shadingLanguageVersion,gpu:r.info.gpu,limits:r.limits,features:r.features},o=(0,h.r)(this.props.plugins,n.shaderLanguage);if(Object.keys(o.vertexInputs).length>0||Object.keys(o.varyings).length>0)throw Error("Computation does not support ShaderPlugin vertex inputs or varyings");let u=Object.fromEntries((0,h.K)(this.props.modules,o.modules).map(e=>[e.name,e]));this.shaderInputs=t.shaderInputs||new p.l(u),t.shaderInputs&&o.modules.length>0&&this.shaderInputs.addModules(o.modules),this.setShaderInputs(this.shaderInputs);let l=(0,m.jY)(this.props.modules,this.shaderInputs?.getModules()),f={...o.defines,...this.props.defines};this.props.shaderLayout=(0,m.Y$)(this.props.shaderLayout,l)||null,this.pipelineFactory=t.pipelineFactory||i.N.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||s.g.getDefaultShaderFactory(this.device);let d=this.props.shaderAssembler;(0,a.v)(d instanceof c.Ry);let{source:b,getUniforms:y,entryPoints:v={},shaderLayout:w}=d.assembleWGSLShader({platformInfo:n,...this.props,modules:l,defines:f,shaderStage:"compute",computeEntryPoint:this.props.entryPoint,scanVertexAttributes:!1,pluginInjections:o.injections});this.source=b,this.props.entryPoint=v.compute||this.props.entryPoint,this._getModuleUniforms=y;let E=w??e.getShaderLayout?.(this.source,{scanVertexAttributes:!1});this.props.shaderLayout=(0,m.Y$)(this.props.shaderLayout||E||null,l)||null;let x=i.N.getAsyncCompilation(this.device);x?(this._pipelineInitialization=this._updatePipelineAsync(),x.push(this._pipelineInitialization)):this.pipeline=this._updatePipeline(),t.bindings&&this.setBindings(t.bindings)}destroy(){this._destroyed||(this.pipeline&&this.pipelineFactory.release(this.pipeline),this.shader&&this.shaderFactory.release(this.shader),this._uniformStore.destroy(),this._destroyed=!0)}predraw(e){this.updateShaderInputs(e)}dispatch(e,t,r,i){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatch(t,r,i)}finally{this._logDrawCallEnd()}}dispatchIndirect(e,t,r=0){try{this._logDrawCallStart(),this._setPipeline(e),e.dispatchIndirect(t,r)}finally{this._logDrawCallEnd()}}_setPipeline(e){this.pipeline=this._updatePipeline(),this.pipeline.setBindings(this.bindings),e.setPipeline(this.pipeline),e.setBindings({})}setVertexCount(e){}setInstanceCount(e){}setShaderInputs(e){for(let[t,r]of(this.shaderInputs=e,this._uniformStore=new o.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if((0,m.fX)(r)){let e=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=e}}setShaderModuleProps(e){let t=this._getModuleUniforms(e),r=Object.keys(t).filter(e=>{let r=t[e];return!(0,d.H9)(r)&&"number"!=typeof r&&"boolean"!=typeof r}),i={};for(let e of r)i[e]=t[e],delete t[e]}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e)}setBindings(e){Object.assign(this.bindings,e)}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate=this._pipelineNeedsUpdate||e}_updatePipeline(){let e=this._preparePipelineUpdate();return e&&(this.pipeline=this.pipelineFactory.createComputePipeline(e.props),this._finishPipelineUpdate(e.previousShader)),this.pipeline}async _updatePipelineAsync(){let e=this._preparePipelineUpdate();if(e){try{this.pipeline=await this.pipelineFactory.createComputePipelineAsync(e.props)}catch(t){throw this.shaderFactory.release(this.shader),this.shader=e.previousShader,this._pipelineNeedsUpdate="asynchronous pipeline creation failed",t}this._finishPipelineUpdate(e.previousShader)}return this.pipeline}_preparePipelineUpdate(){if(!this._pipelineNeedsUpdate)return null;let e=this.pipeline?this.shader:null;return this.pipeline&&u.R.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),this._pipelineNeedsUpdate=!1,this.shader=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"compute",source:this.source,debugShaders:this.props.debugShaders}),{props:{...this.props,shader:this.shader},previousShader:e}}_finishPipelineUpdate(e){e&&this.shaderFactory.release(e)}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){let e=u.R.level>3?0:1e4;u.R.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,u.R.group(2,`>>> DRAWING MODEL ${this.id}`,{collapsed:u.R.level<=2})())}_logDrawCallEnd(){if(this._logOpen){let e=this.shaderInputs.getDebugTable();u.R.table(2,e)(),u.R.groupEnd(2)(),this._logOpen=!1}}_drawCount=0;_getBufferOrConstantValues(e,t){let r=l.r.getTypedArrayConstructor(t);return(e instanceof f.h?new r(e.debugData):e).toString()}}},82645(e,t,r){r.d(t,{Hd:()=>o,Xk:()=>u,j8:()=>l,kL:()=>a});var i=r(60691),n=r(51208);let s=i.h.DEBUG_DATA_MAX_LENGTH;class a{device;id;ready;usage;props;isReady=!0;destroyed=!1;generation=0;updateTimestamp;debugData=new ArrayBuffer(0);_debugDataEnabled;_maxDebugDataByteLength;_ownsBuffer;_buffer;get buffer(){return this._buffer}get byteLength(){return this._buffer.byteLength}get[Symbol.toStringTag](){return"DynamicBuffer"}toString(){return`DynamicBuffer:"${this.id}":${this.byteLength}B`}toJSON(){return this.toString()}constructor(e,t){let{debugData:r=!1,buffer:a,ownsBuffer:o=!0,...u}=t;if(a&&a.device!==e)throw Error("DynamicBuffer adopted buffers must belong to the supplied device");if(a&&(void 0!==u.byteLength||void 0!==u.data))throw Error("DynamicBuffer cannot combine an adopted buffer with byteLength or data");let l=t.id||a?.id||(0,n.L)("dynamic-buffer"),f={...u,id:l,usage:u.usage??a?.usage,indexType:u.indexType??a?.indexType};(f.usage||0)&i.h.INDEX&&!f.indexType&&(u.data instanceof Uint32Array?f.indexType="uint32":u.data instanceof Uint16Array?f.indexType="uint16":u.data instanceof Uint8Array&&(f.indexType="uint8")),delete f.data,delete f.byteOffset,this.device=e,this.id=l,this.props=f,this.usage=f.usage||0,this._debugDataEnabled=!!r,this._maxDebugDataByteLength="object"==typeof r&&void 0!==r.maxByteLength?r.maxByteLength:s,this._ownsBuffer=o,this._buffer=a??this.device.createBuffer({...u,id:l}),this.ready=Promise.resolve(this._buffer),this.updateTimestamp=this._buffer.updateTimestamp,this._resetDebugData(this._buffer.byteLength),u.data&&this._writeDebugData(u.data,u.byteOffset||0)}write(e,t=0){this._buffer.write(e,t),this._touch(),this._writeDebugData(e,t)}async mapAndWriteAsync(e,t=0,r=this.byteLength-t){let i=null;await this._buffer.mapAndWriteAsync(async(t,n)=>{await e(t,n),i=new Uint8Array(t.slice(0,r))},t,r),this._touch(),i&&this._writeDebugData(i,t)}async readAsync(e=0,t=this.byteLength-e){let r=await this._buffer.readAsync(e,t);return this._writeDebugData(r,e)&&this._touch(),r}async mapAndReadAsync(e,t=0,r=this.byteLength-t){let i=null,n=await this._buffer.mapAndReadAsync(async(t,r)=>(i=new Uint8Array(t.slice(0)),await e(t,r)),t,r);return i&&this._writeDebugData(i,t)&&this._touch(),n}resize(e){let{byteLength:t,preserveData:r=!1}=e;if(t===this.byteLength)return!1;let i=Math.min(e.copyByteLength??Math.min(this.byteLength,t),this.byteLength,t),n=this._buffer,s=this.debugData.slice(0),{data:a,byteOffset:o,...u}=this.props,l=this.device.createBuffer({...u,byteLength:t});return r&&i>0&&this._copyBufferContents(n,l,i),this._buffer=l,this._resetDebugData(t),r&&s.byteLength>0&&this._writeDebugData(s,0),this._ownsBuffer&&n.destroy(),this._ownsBuffer=!0,this.generation++,this._touch(),!0}ensureSize(e,t){return!(e<=this.byteLength)&&this.resize({byteLength:e,preserveData:t?.preserveData})}getBinding(e){return e?.offset===void 0&&e?.size===void 0?this._buffer:{buffer:this._buffer,offset:e?.offset,size:e?.size}}destroy(){this.destroyed||(this._ownsBuffer&&this._buffer.destroy(),this.destroyed=!0,this.debugData=new ArrayBuffer(0))}_copyBufferContents(e,t,r){let i="webgpu"===this.device.type?4*Math.ceil(r/4):r,n=this.device.createCommandEncoder();n.copyBufferToBuffer({sourceBuffer:e,destinationBuffer:t,size:i}),this.device.submit(n.finish())}_touch(){this.updateTimestamp=this.device.incrementTimestamp()}_resetDebugData(e){if(!this._debugDataEnabled){this.debugData=new ArrayBuffer(0);return}this.debugData=new ArrayBuffer(Math.min(e,this._maxDebugDataByteLength))}_writeDebugData(e,t){if(!this._debugDataEnabled||0===this.debugData.byteLength||t>=this.debugData.byteLength)return!1;let r=ArrayBuffer.isView(e)?new Uint8Array(e.buffer,e.byteOffset,e.byteLength):new Uint8Array(e),i=new Uint8Array(this.debugData),n=Math.min(r.byteLength,i.byteLength-t);return i.set(r.subarray(0,n),t),n>0}}function o(e){return null!==e&&"object"==typeof e&&"buffer"in e}function u(e){return e instanceof a?e:o(e)&&e.buffer instanceof a?e.buffer:null}function l(e){var t;return{buffer:(t=e.buffer)instanceof a?t.buffer:t,offset:e.offset,size:e.size}}},34037(e,t,r){r.d(t,{YT:()=>n,l0:()=>s});var i=r(77569);function n(e){return null!==e&&"object"==typeof e&&"resolveTextureBinding"in e&&"function"==typeof e.resolveTextureBinding}function s(e,t,r){let n=(0,i.Jc)(e,t,{ignoreWarnings:!0});return n?.type==="texture"||n?.type==="external-texture"?n:0===e.bindings.length&&r?.fallbackGroup!==void 0?{type:"texture",name:t,group:r.fallbackGroup,location:0}:null}},69457(e,t,r){r.d(t,{C:()=>s});var i=r(6646),n=r(62837);function s(e,t={}){let r=t.bufferName||"geometry";if(function(e,t){if(e.bufferLayout?.length!==1)return!1;let r=e.bufferLayout[0];return r.name===t&&!!r.attributes?.length&&!!e.attributes[t]}(e,r))return e;let o=t.minAttributeAlignment||4,u=function(e,t){let r=new Map;for(let i of t||Object.keys(e.attributes)){let t=e.attributes[i];t&&r.set((0,n.l2)(i),[i,t])}return Array.from(r.values())}(e,t.attributes),l=[],f=0,c=1/0;for(let[e,t]of u){if(!t)continue;if(t.constant)throw Error(`Attribute ${e} is constant`);let{value:r,size:s,normalized:u}=t;if(!ArrayBuffer.isView(r))throw Error(`Attribute ${e} is missing typed array data`);if(void 0===s)throw Error(`Attribute ${e} is missing a size`);let h=i.E.getVertexFormatFromAttribute(r,s,u),d=i.E.getVertexFormatInfo(h);f=a(f,o),l.push({sourceName:e,attributeName:(0,n.l2)(e),value:r,size:s,format:h,byteOffset:f,byteLength:d.byteLength}),f+=d.byteLength;let p=r.length/s;if(!Number.isInteger(p))throw Error(`Attribute ${e} length is not divisible by size`);c=Math.min(c,p)}if(0===l.length||!Number.isFinite(c))throw Error(`Geometry ${e.id} has no interleavable attributes`);let h=a(f,o),d=new ArrayBuffer(c*h);for(let e of l)!function(e,t,r,i){let n=i.value.constructor,s=n.BYTES_PER_ELEMENT;if(i.byteOffset%s!=0||r%s!=0)throw Error(`Attribute ${i.sourceName} is not aligned to its component type`);let a=new n(e),o=i.value,u=i.byteOffset/s,l=r/s;for(let e=0;e<t;e++){let t=e*i.size,r=e*l+u;for(let e=0;e<i.size;e++)a[r+e]=o[t+e]}}(d,c,h,e);return new n.V2({id:e.id,topology:e.topology||"triangle-list",vertexCount:e.vertexCount,indices:e.indices,attributes:{[r]:{value:new Uint8Array(d),size:h,byteStride:h}},bufferLayout:[{name:r,stepMode:"vertex",byteStride:h,attributes:l.map(e=>({attribute:e.attributeName,format:e.format,byteOffset:e.byteOffset}))}]})}function a(e,t){return Math.ceil(e/t)*t}},62837(e,t,r){r.d(t,{GN:()=>o,V2:()=>s,l2:()=>a});var i=r(94392),n=r(6646);class s extends i.V2{bufferLayout;constructor(e){let t={},r=new Map;for(let[i,n]of Object.entries(e.attributes)){let e=a(i),s=r.get(e);s&&delete t[s],r.set(e,i),t[i]=n}let i=e.indices,n=i instanceof Uint8Array?new Uint16Array(i):i&&!ArrayBuffer.isView(i)&&i.value instanceof Uint8Array?{...i,value:new Uint16Array(i.value)}:i;for(let[r,i]of(super({...e,attributes:t,indices:n}),Object.entries(t)))!ArrayBuffer.isView(i)&&Object.isExtensible(i)&&"indices"!==r&&(Object.assign(i,this.attributes[r]),this.attributes[r]=i);this.bufferLayout=e.bufferLayout||o(this.attributes)}}function a(e){switch(e){case"POSITION":return"positions";case"NORMAL":return"normals";case"TEXCOORD_0":return"texCoords";case"TEXCOORD_1":return"texCoords1";case"COLOR_0":return"colors";default:return e}}function o(e){let t=[];for(let[r,i]of Object.entries(e)){if(!i)continue;let{value:e,size:s,normalized:o}=i;if(void 0===s)throw Error(`Attribute ${r} is missing a size`);t.push({name:a(r),format:n.E.getVertexFormatFromAttribute(e,s,o)})}return t}},12434(e,t,r){r.d(t,{K:()=>C});var i=r(17909),n=r(44412),s=r(86103),a=r(16598),o=r(13559),u=r(13125),l=r(77569),f=r(31130),c=r(60691),h=r(38550),d=r(42188),p=r(92697),m=r(60633),g=r(8780),_=r(79083),b=r(62837),y=r(69457),v=r(51208);class w{id;userData={};topology;bufferLayout=[];vertexCount;indices;attributes;constructor(e){if(this.id=e.id||(0,v.L)("geometry"),this.topology=e.topology,this.indices=e.indices||null,this.attributes=e.attributes,this.vertexCount=e.vertexCount,this.bufferLayout=e.bufferLayout||[],this.indices&&!(this.indices.usage&c.h.INDEX))throw Error("Index buffer must have INDEX usage")}destroy(){for(let e of(this.indices?.destroy(),Object.values(this.attributes)))e.destroy()}getVertexCount(){return this.vertexCount}getAttributes(){return this.attributes}getIndexes(){return this.indices||null}_calculateVertexCount(e){return e.byteLength/12}}let E="__debugFramebufferState";function x(e,t){if(!e)return t;let r=Number.parseInt(e,10);return Number.isFinite(r)?r:t}function S(e,t,r){if(e===t)return!0;if(!r||!e||!t)return!1;if(Array.isArray(e)){if(!Array.isArray(t)||e.length!==t.length)return!1;for(let i=0;i<e.length;i++)if(!S(e[i],t[i],r-1))return!1;return!0}if(Array.isArray(t))return!1;if("object"==typeof e&&"object"==typeof t){let i=Object.keys(e),n=Object.keys(t);if(i.length!==n.length)return!1;for(let n of i)if(!t.hasOwnProperty(n)||!S(e[n],t[n],r-1))return!1;return!0}return!1}var A=r(92992);class L{bufferLayouts;constructor(e){this.bufferLayouts=e}getBufferLayout(e){return this.bufferLayouts.find(t=>t.name===e)||null}getAttributeNamesForBuffer(e){return(0,A.TC)(e)}mergeBufferLayouts(e,t){let r=[...e];for(let e of t){let t=r.findIndex(t=>t.name===e.name);t<0?r.push(e):r[t]=e}return r}}var P=r(92790),B=r(20131),T=r(82645),M=r(34037);let $="render pipeline initialization failed",O=["stencil8","depth16unorm","depth24plus","depth24plus-stencil8","depth32float","depth32float-stencil8"];class C{static async createAsync(e,t){let r,n=!i.N.getAsyncCompilation(e),s=n?i.N.beginAsyncCompilation(e):i.N.getAsyncCompilation(e);try{r=new C(e,t)}finally{n&&i.N.endAsyncCompilation(e,s)}try{return n?await Promise.all(s):await r._pipelineInitialization,r}catch(e){throw r.destroy(),e}}static defaultProps={...n.r.defaultProps,source:void 0,sourceLanguage:void 0,vs:null,fs:null,id:"unnamed",handle:void 0,userData:{},defines:{},modules:[],plugins:[],geometry:null,indexBuffer:null,indexCount:void 0,firstVertex:0,firstIndex:0,attributes:{},constantAttributes:{},bindings:{},uniforms:{},varyings:[],isInstanced:void 0,instanceCount:0,vertexCount:0,shaderInputs:void 0,material:void 0,pipelineFactory:void 0,shaderFactory:void 0,transformFeedback:void 0,shaderAssembler:g._P.getDefaultShaderAssembler("glsl"),debugShaders:void 0,disableWarnings:void 0};device;id;source;vs;fs;pipelineFactory;shaderFactory;userData={};parameters;topology;bufferLayout;isInstanced=void 0;instanceCount=0;vertexCount;indexCount;firstVertex;firstIndex;indexBuffer=null;bufferAttributes={};constantAttributes={};bindings={};vertexArray;transformFeedback=null;pipeline;shaderInputs;material=null;_uniformStore;_attributeInfos={};_gpuGeometry=null;props;_dynamicIndexBufferSource=null;_dynamicAttributeBufferSources={};_colorAttachmentFormats;_depthStencilAttachmentFormat;_pipelineNeedsUpdate="newly created";_needsRedraw="initializing";_drawBlockedReason=!1;_destroyed=!1;_vertexCountSet=!1;_lastDrawTimestamp=-1;_bindingTable=[];_pipelineInitialization;get[Symbol.toStringTag](){return"Model"}toString(){return`Model(${this.id})`}constructor(e,t){var r,n,o;let u=C.defaultProps.shaderAssembler,l=Object.hasOwn(t,"vertexCount");this.props={...C.defaultProps,...t,shaderAssembler:t.shaderAssembler??(I(u,e.info.shadingLanguage)?u:g._P.getDefaultShaderAssembler(e.info.shadingLanguage))},this._vertexCountSet=l,t=this.props,this.id=t.id||(0,v.L)("model"),this.device=e,Object.assign(this.userData,t.userData),this.material=t.material||null;let f={type:(r=e).type,shaderLanguage:r.info.shadingLanguage,shaderLanguageVersion:r.info.shadingLanguageVersion,gpu:r.info.gpu,limits:r.limits,features:r.features},c=(0,_.r)(this.props.plugins,f.shaderLanguage),h=Object.fromEntries((0,_.K)(this.props.modules,c.modules).map(e=>[e.name,e])),d=t.shaderInputs||new B.l(h,{disableWarnings:this.props.disableWarnings});t.shaderInputs&&c.modules.length>0&&d.addModules(c.modules),this.setShaderInputs(d);let p=(0,P.jY)(this.props.modules,d.getModules()),m={...c.defines,...this.props.defines};if("webgl"===this.device.type&&(this.props._uniformBlockLayouts=(0,P._R)(p)),this.props.shaderLayout=(0,P.Y$)(this.props.shaderLayout,p)||null,"webgpu"===this.device.type&&this.props.source){let t=this.props.shaderAssembler;(0,s.v)(I(t,"wgsl"));let{source:r,getUniforms:i,bindingTable:a,entryPoints:u={},shaderLayout:l}=t.assembleWGSLShader({platformInfo:f,...this.props,modules:p,defines:m,pluginInjections:c.injections,pluginVertexInputs:c.vertexInputs,pluginVaryings:c.varyings});this.source=r,this.props.vertexEntryPoint=u.vertex||this.props.vertexEntryPoint,this.props.fragmentEntryPoint=u.fragment||this.props.fragmentEntryPoint,this._getModuleUniforms=i,this._bindingTable=a;let h=(n=l??e.getShaderLayout?.(this.source),o=c.vertexInputs,n&&0!==Object.keys(o).length?{...n,attributes:n.attributes.map(e=>{let t=e.name.startsWith("_luma_")?e.name.slice(6):null;return t&&o[t]?{...e,name:t}:e})}:n),d=(0,P.He)(this.props.shaderLayout,h,Object.keys(c.vertexInputs));this.props.shaderLayout=(0,P.Y$)(d||null,p)||null}else{let e=this.props.shaderAssembler;(0,s.v)(I(e,"glsl"));let{vs:t,fs:r,getUniforms:i}=e.assembleGLSLShaderPair({platformInfo:f,...this.props,modules:p,defines:m,pluginInjections:c.injections,pluginVertexInputs:c.vertexInputs,pluginVaryings:c.varyings});this.vs=t,this.fs=r,this._getModuleUniforms=i,this._bindingTable=[]}this.vertexCount=this.props.vertexCount,this.indexCount=this.props.indexCount,this.firstVertex=this.props.firstVertex,this.firstIndex=this.props.firstIndex,this.instanceCount=this.props.instanceCount,this.topology=this.props.topology,this.bufferLayout=this.props.bufferLayout,this.parameters=this.props.parameters,this._colorAttachmentFormats=this.props.colorAttachmentFormats,this._depthStencilAttachmentFormat=this.props.depthStencilAttachmentFormat,t.geometry&&this.setGeometry(t.geometry),this.pipelineFactory=t.pipelineFactory||i.N.getDefaultPipelineFactory(this.device),this.shaderFactory=t.shaderFactory||a.g.getDefaultShaderFactory(this.device);let b=i.N.getAsyncCompilation(this.device);b?(this._pipelineInitialization=this._initializePipelineAsync(t),b.push(this._pipelineInitialization)):(this.pipeline=this._updatePipeline(),this._initializePipelineResources(t))}async _initializePipelineAsync(e){await this._updatePipelineAsync(),this._initializePipelineResources(e)}_initializePipelineResources(e){this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry),"isInstanced"in e&&(this.isInstanced=e.isInstanced),e.instanceCount&&this.setInstanceCount(e.instanceCount),e.vertexCount&&this.setVertexCount(e.vertexCount),e.indexBuffer&&this.setIndexBuffer(e.indexBuffer),e.attributes&&this.setAttributes(e.attributes),e.constantAttributes&&this.setConstantAttributes(e.constantAttributes),e.bindings&&this.setBindings(e.bindings),e.transformFeedback&&(this.transformFeedback=e.transformFeedback)}destroy(){this._destroyed||(this.pipeline&&(this.pipelineFactory.release(this.pipeline),this.shaderFactory.release(this.pipeline.vs),this.pipeline.fs&&this.pipeline.fs!==this.pipeline.vs&&this.shaderFactory.release(this.pipeline.fs)),this._uniformStore.destroy(),this._gpuGeometry?.destroy(),this._destroyed=!0)}needsRedraw(){this._getBindingsUpdateTimestamp()>this._lastDrawTimestamp&&this.setNeedsRedraw("contents of bound textures or buffers updated");let e=this._needsRedraw;return this._needsRedraw=!1,e}setNeedsRedraw(e){this._needsRedraw||=e}getBindingDebugTable(){return this._bindingTable}predraw(e){this._syncDynamicBuffers(),this.updateShaderInputs(e),this.material?.updateShaderInputs(e),this.pipeline=this._updatePipeline()}draw(e){let t;if(this._drawBlockedReason&&!this._pipelineNeedsUpdate)return o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${this._drawBlockedReason}`)(),!1;let r=this._areBindingsLoading();if(r)return o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${r} not loaded`)(),!1;this._syncAttachmentFormats(e);try{e.pushDebugGroup(`${this}.predraw(${e})`),"webgpu"===this.device.type?(this.updateShaderInputs(),this.material?.updateShaderInputs(),this._syncDynamicBuffers(),this.pipeline=this._updatePipeline()):this.predraw(this.device.commandEncoder)}finally{e.popDebugGroup()}let i=this.pipeline.isErrored;try{if(e.pushDebugGroup(`${this}.draw(${e})`),this._logDrawCallStart(),this.pipeline=this._updatePipeline(),i=this.pipeline.isErrored)o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${$}`)(),t=!1;else{let r=this.vertexArray.getDrawValidationError();if(r)o.R.info(2,`>>> DRAWING ABORTED ${this.id}: ${r}`)(),this._drawBlockedReason=r,t=!1;else{let r=this._getCurrentShaderLayout(),i=this._getBindings(r),n=this._getBindGroups(r,i),{indexBuffer:s}=this.vertexArray,a=s?this.indexCount??(this._vertexCountSet?this.vertexCount:s.byteLength/("uint32"===s.indexType?4:2)):void 0;e.setPipeline(this.pipeline),e.setBindings(n,{_bindGroupCacheKeys:this._getBindGroupCacheKeys()}),e.setVertexArray(this.vertexArray),t=!0===this.isInstanced&&0===this.instanceCount||e.draw({isInstanced:this.isInstanced,vertexCount:this.vertexCount,instanceCount:this.isInstanced?this.instanceCount:void 0,indexCount:a,firstVertex:this.firstVertex,firstIndex:this.firstIndex,transformFeedback:this.transformFeedback||void 0,uniforms:this.props.uniforms,parameters:this.parameters,topology:this.topology})}}}finally{e.popDebugGroup(),this._logDrawCallEnd()}return this._logFramebuffer(e),t?(this._lastDrawTimestamp=this.device.timestamp,this._needsRedraw=!1):i?(this._needsRedraw=$,this._drawBlockedReason=$):this._drawBlockedReason?this._needsRedraw=this._drawBlockedReason:this._needsRedraw="waiting for resource initialization",t}setGeometry(e){this._gpuGeometry?.destroy();let t=e&&function(e,t){if(t instanceof w)return t;let r=(0,y.C)(t),i=function(e,t){if(!t.indices)return;let r=t.indices.value;return e.createBuffer({usage:c.h.INDEX,data:r})}(e,r),{attributes:n,bufferLayout:s}=function(e,t){let r={};for(let[i,n]of Object.entries(t.attributes)){let s=t.bufferLayout?.find(e=>e.name===i)?.name||(0,b.l2)(i);n&&(r[s]=e.createBuffer({data:n.value,id:`${i}-buffer`}))}return{attributes:r,bufferLayout:t.bufferLayout||(0,b.GN)(t.attributes),vertexCount:t.vertexCount}}(e,r);return new w({topology:r.topology||"triangle-list",bufferLayout:s,vertexCount:r.vertexCount,indices:i,attributes:n})}(this.device,e);if(t){this.setTopology(t.topology||"triangle-list");let e=new L(this.bufferLayout);this.bufferLayout=e.mergeBufferLayouts(t.bufferLayout,this.bufferLayout),this.vertexArray&&this._setGeometryAttributes(t)}this._gpuGeometry=t}setTopology(e){e!==this.topology&&(this.topology=e,this._setPipelineNeedsUpdate("topology"))}setBufferLayout(e){let t=new L(this.bufferLayout),r=this._gpuGeometry?t.mergeBufferLayouts(e,this._gpuGeometry.bufferLayout):e;!S(r,this.bufferLayout,-1)&&(this.bufferLayout=r,this._setPipelineNeedsUpdate("bufferLayout"),this.pipeline=this._updatePipeline(),this.vertexArray=this.device.createVertexArray({shaderLayout:this.pipeline.shaderLayout,bufferLayout:this.pipeline.bufferLayout}),this._gpuGeometry&&this._setGeometryAttributes(this._gpuGeometry))}setParameters(e){S(e,this.parameters,2)||(this.parameters=e,this._setPipelineNeedsUpdate("parameters"))}setInstanceCount(e){this.instanceCount=e,void 0===this.isInstanced&&e>0&&(this.isInstanced=!0),this.setNeedsRedraw("instanceCount")}setVertexCount(e){this.vertexCount=e,this._vertexCountSet=!0,this.setNeedsRedraw("vertexCount")}setIndexCount(e){this.indexCount=e,this.setNeedsRedraw("indexCount")}setDrawOffsets({firstVertex:e,firstIndex:t}){this.firstVertex=e,this.firstIndex=t,this.setNeedsRedraw("drawOffsets")}setShaderInputs(e){for(let[t,r]of(this.shaderInputs=e,this._uniformStore=new u.K(this.device,this.shaderInputs.modules),Object.entries(this.shaderInputs.modules)))if((0,P.fX)(r)&&!this.material?.ownsModule(t)){let e=this._uniformStore.getManagedUniformBuffer(t);this.bindings[`${t}Uniforms`]=e}this.setNeedsRedraw("shaderInputs")}setMaterial(e){this.material=e,this.setNeedsRedraw("material")}updateShaderInputs(e){this._uniformStore.setUniforms(this.shaderInputs.getUniformValues(),e),this.setBindings(this._getNonMaterialBindings(this.shaderInputs.getBindingValues())),this.setNeedsRedraw("shaderInputs")}setBindings(e){Object.assign(this.bindings,e),this.setNeedsRedraw("bindings")}setTransformFeedback(e){this.transformFeedback=e,this.setNeedsRedraw("transformFeedback")}setIndexBuffer(e){let t=e instanceof T.kL?e.buffer:e;this.indexBuffer=t,this._dynamicIndexBufferSource=e instanceof T.kL?{source:e,generation:e.generation}:null,this.vertexArray.setIndexBuffer(t),this.setNeedsRedraw("indexBuffer")}setAttributes(e,t){var r,i;let n,s;this._drawBlockedReason=!1;let a=t?.disableWarnings??this.props.disableWarnings;e.indices&&o.R.warn(`Model:${this.id} setAttributes() - indexBuffer should be set using setIndexBuffer()`)(),this.bufferLayout=(r=this.pipeline.shaderLayout,i=this.bufferLayout,n=(0,A.Lv)(r),(s=i.slice()).sort((e,t)=>(0,A.Ef)((0,A.TC)(e).map(e=>n[e]))-(0,A.Ef)((0,A.TC)(t).map(e=>n[e]))),s);let u=new L(this.bufferLayout);for(let[r,i]of Object.entries(e)){let e=i instanceof T.kL?i.buffer:i,n=u.getBufferLayout(r);if(!n){a||o.R.warn(`Model(${this.id}): Missing layout for buffer "${r}".`)();continue}let s=u.getAttributeNamesForBuffer(n),l=!1;for(let n of s){let s=this._attributeInfos[n];if(s){let n="webgpu"===this.device.type?this.vertexArray.getBufferSlot(s.bufferName):s.location;if(null===n){a||o.R.warn(`Model(${this.id}): Missing vertex array slot for buffer "${s.bufferName}".`)();continue}let u=t?.byteOffsets?.[r]??0;this.vertexArray.setBuffer(n,e,u),i instanceof T.kL?this._dynamicAttributeBufferSources[n]={source:i,generation:i.generation,byteOffset:u}:delete this._dynamicAttributeBufferSources[n],l=!0}}l||a||o.R.warn(`Model(${this.id}): Ignoring buffer "${e.id}" for unknown attribute "${r}"`)()}this.setNeedsRedraw("attributes")}setConstantAttributes(e,t){for(let[r,i]of Object.entries(e)){let e=this._attributeInfos[r];e?this.vertexArray.setConstantWebGL(e.location,i):(t?.disableWarnings??this.props.disableWarnings)||o.R.warn(`Model "${this.id}: Ignoring constant supplied for unknown attribute "${r}"`)()}this.setNeedsRedraw("constants")}_areBindingsLoading(){for(let e of Object.values(this.bindings))if((0,M.YT)(e)&&!e.isReady)return e.id;for(let e of Object.values(this.material?.bindings||{}))if((0,M.YT)(e)&&!e.isReady)return e.id;return!1}_getBindings(e=this._getCurrentShaderLayout()){let t={};for(let[r,i]of Object.entries(this.bindings)){let n=function(e,t,r){if((0,M.YT)(t)){let i=(0,M.l0)(r,e,{fallbackGroup:0});return i?t.resolveTextureBinding(i):null}return t instanceof T.kL?t.buffer:(0,T.Hd)(t)?(0,T.j8)(t):t}(r,i,e);n&&(t[r]=n)}return t}_getBindGroups(e=this._getCurrentShaderLayout(),t=this._getBindings(e)){let r=e.bindings.length?(0,l.gO)(e,t):{0:t};if(!this.material)return r;for(let[t,i]of Object.entries(this.material.getBindingsByGroup(e))){let e=Number(t);r[e]={...r[e]||{},...i}}return r}_getBindGroupCacheKeys(){let e=this.material?.getBindGroupCacheKey(3);return e?{3:e}:{}}_getBindingsUpdateTimestamp(){let e=0;for(let t of(this._dynamicIndexBufferSource&&(e=Math.max(e,this._dynamicIndexBufferSource.source.updateTimestamp)),Object.values(this._dynamicAttributeBufferSources)))e=Math.max(e,t.source.updateTimestamp);for(let t of Object.values(this.bindings))t instanceof f.X?e=Math.max(e,t.texture.updateTimestamp):t instanceof c.h||t instanceof h.g||t instanceof d.r||t instanceof T.kL?e=Math.max(e,t.updateTimestamp):(0,M.YT)(t)?e=t.isReady?Math.max(e,t.updateTimestamp):1/0:(0,T.Hd)(t)&&(e=Math.max(e,(t.buffer instanceof T.kL,t.buffer.updateTimestamp)));return Math.max(e,this.material?.getBindingsUpdateTimestamp()||0)}_setGeometryAttributes(e){let t={...e.attributes};for(let[e]of Object.entries(t))this.pipeline.shaderLayout.attributes.find(t=>t.name===e)||"positions"===e||delete t[e];this.vertexCount=e.vertexCount,this._vertexCountSet=!0,this.setIndexBuffer(e.indices||null),this.setAttributes(e.attributes,{disableWarnings:!0}),this.setAttributes(t,{disableWarnings:this.props.disableWarnings}),this.setNeedsRedraw("geometry attributes")}_setPipelineNeedsUpdate(e){this._pipelineNeedsUpdate||=e,this._drawBlockedReason=!1,this.setNeedsRedraw(e)}_updatePipeline(){let e=this._preparePipelineUpdate();return e&&(this.pipeline=this.pipelineFactory.createRenderPipeline(e.props),this._finishPipelineUpdate(e)),this.pipeline}async _updatePipelineAsync(){let e=this._preparePipelineUpdate();if(e){try{this.pipeline=await this.pipelineFactory.createRenderPipelineAsync(e.props)}catch(t){throw this._releasePipelineShaders(e.vertexShader,e.fragmentShader),this._pipelineNeedsUpdate="asynchronous pipeline creation failed",t}this._finishPipelineUpdate(e)}return this.pipeline}_preparePipelineUpdate(){if(!this._pipelineNeedsUpdate)return null;let e=this.pipeline?.vs??null,t=this.pipeline?.fs??null;this.pipeline&&o.R.log(1,`Model ${this.id}: Recreating pipeline because "${this._pipelineNeedsUpdate}".`)(),this._pipelineNeedsUpdate=!1;let r=this.shaderFactory.createShader({id:`${this.id}-vertex`,stage:"vertex",source:this.source||this.vs,debugShaders:this.props.debugShaders}),i=null;return this.source?i=r:this.fs&&(i=this.shaderFactory.createShader({id:`${this.id}-fragment`,stage:"fragment",source:this.fs,debugShaders:this.props.debugShaders})),{props:{...this.props,bindings:void 0,bufferLayout:this.bufferLayout,colorAttachmentFormats:this._colorAttachmentFormats,depthStencilAttachmentFormat:this._depthStencilAttachmentFormat,topology:this.topology,parameters:this.parameters,bindGroups:void 0,vs:r,fs:i},vertexShader:r,fragmentShader:i,previousVertexShader:e,previousFragmentShader:t}}_finishPipelineUpdate(e){this._attributeInfos=(0,p.P)(this.pipeline.shaderLayout,this.bufferLayout),this._releasePipelineShaders(e.previousVertexShader,e.previousFragmentShader)}_releasePipelineShaders(e,t){e&&this.shaderFactory.release(e),t&&t!==e&&this.shaderFactory.release(t)}_lastLogTime=0;_logOpen=!1;_logDrawCallStart(){let e=o.R.level>3?0:1e4;o.R.level<2||Date.now()-this._lastLogTime<e||(this._lastLogTime=Date.now(),this._logOpen=!0,o.R.group(2,`>>> DRAWING MODEL ${this.id}`,{collapsed:o.R.level<=2})())}_logDrawCallEnd(){if(this._logOpen){let e=function(e,t){let r={},i="Values";if(0===e.attributes.length&&!e.varyings?.length)return{"No attributes or varyings":{[i]:"N/A"}};for(let t of e.attributes)if(t){let e=`${t.location} ${t.name}: ${t.type}`;r[`in ${e}`]={[i]:t.stepMode||"vertex"}}for(let t of e.varyings||[]){let e=`${t.location} ${t.name}`;r[`out ${e}`]={[i]:JSON.stringify(t)}}return r}(this.pipeline.shaderLayout,this.id);o.R.table(2,e)();let t=this.shaderInputs.getDebugTable();o.R.table(2,t)();let r=this._getAttributeDebugTable();o.R.table(2,this._attributeInfos)(),o.R.table(2,r)(),o.R.groupEnd(2)(),this._logOpen=!1}}_drawCount=0;_logFramebuffer(e){let t=this.device.props.debugFramebuffers;if(this._drawCount++,!t)return;let r=e.props.framebuffer;!function(e,t,r){var i;if("webgl"!==e.device.type)return;let n=(i=e.device,i.userData[E]||={flushing:!1,queuedFramebuffers:[]},i.userData[E]);if(!n.flushing){let i;if(!(i=e.props.framebuffer)||null===i.handle)return function(e,t,r){if(0===r.queuedFramebuffers.length)return;let{gl:i}=e.device,n=i.getParameter(36010),s=i.getParameter(36006),[a,o]=e.device.getDefaultCanvasContext().getDrawingBufferSize(),u=x(t.top,8),l=x(t.left,8);r.flushing=!0;try{for(let e of r.queuedFramebuffers){let[r,n,s,f,c]=function(e){let{framebuffer:t,targetWidth:r,targetHeight:i,topPx:n,leftPx:s,minimap:a}=e,o=a?Math.max(Math.floor(r/4),1):r,u=a?Math.max(Math.floor(i/4),1):i,l=Math.min(o/t.width,u/t.height),f=Math.max(Math.floor(t.width*l),1),c=Math.max(Math.floor(t.height*l),1),h=Math.max(i-n-c,0);return[s,h,s+f,h+c,c]}({framebuffer:e,targetWidth:a,targetHeight:o,topPx:u,leftPx:l,minimap:t.minimap});i.bindFramebuffer(36008,e.handle),i.bindFramebuffer(36009,null),i.blitFramebuffer(0,0,e.width,e.height,r,n,s,f,16384,9728),u+=c+8}}finally{i.bindFramebuffer(36008,n),i.bindFramebuffer(36009,s),r.flushing=!1}}(e,r,n);t&&"colorAttachments"in t&&null!==t.handle&&!n.queuedFramebuffers.includes(t)&&n.queuedFramebuffers.push(t)}}(e,r,{id:r?.id||`${this.id}-framebuffer`,minimap:!0})}_getAttributeDebugTable(){let e={};for(let[t,r]of Object.entries(this._attributeInfos)){let i=this.vertexArray.attributes[r.location];e[r.location]={name:t,type:r.shaderType,values:i?this._getBufferOrConstantValues(i,r.bufferDataType):"null"}}if(this.vertexArray.indexBuffer){let{indexBuffer:t}=this.vertexArray,r="uint32"===t.indexType?new Uint32Array(t.debugData):new Uint16Array(t.debugData);e.indices={name:"indices",type:t.indexType,values:r.toString()}}return e}_getBufferOrConstantValues(e,t){let r=m.r.getTypedArrayConstructor(t);return(e instanceof c.h?new r(e.debugData):e).toString()}_getNonMaterialBindings(e){if(!this.material)return e;let t={};for(let[r,i]of Object.entries(e))this.material.ownsBinding(r)||(t[r]=i);return t}_getCurrentShaderLayout(){return this.pipeline?.shaderLayout||this.props.shaderLayout||{bindings:[]}}_syncDynamicBuffers(){if(this._dynamicIndexBufferSource&&this._dynamicIndexBufferSource.generation!==this._dynamicIndexBufferSource.source.generation){let e=this._dynamicIndexBufferSource.source.buffer;this.indexBuffer=e,this.vertexArray.setIndexBuffer(e),this._dynamicIndexBufferSource.generation=this._dynamicIndexBufferSource.source.generation,this.setNeedsRedraw("dynamic index buffer")}for(let[e,t]of Object.entries(this._dynamicAttributeBufferSources))t.generation!==t.source.generation&&(this.vertexArray.setBuffer(Number(e),t.source.buffer,t.byteOffset),t.generation=t.source.generation,this.setNeedsRedraw("dynamic attribute buffer"))}_syncAttachmentFormats(e){var t;if("webgpu"!==this.device.type)return;let r=e.framebuffer||e.props.framebuffer,i=e.props,n=i.colorAttachmentFormats??r?.colorAttachments?.map(e=>{var t;return(t=e?.texture?.format)&&!k(t)?t:null}),s=!1===i.depthStencilAttachmentFormat?void 0:i.depthStencilAttachmentFormat??((t=r?.depthStencilAttachment?.texture?.format)&&k(t)?t:void 0);S(this._colorAttachmentFormats,n,1)&&this._depthStencilAttachmentFormat===s||(this._colorAttachmentFormats=n,this._depthStencilAttachmentFormat=s,this._setPipelineNeedsUpdate("attachment formats"))}}function I(e,t){return(void 0===e.shaderLanguage||e.shaderLanguage===t)&&("glsl"===t?"assembleGLSLShaderPair"in e&&"function"==typeof e.assembleGLSLShaderPair:"assembleWGSLShader"in e&&"function"==typeof e.assembleWGSLShader)}function k(e){return O.includes(e)}},20131(e,t,r){r.d(t,{l:()=>a});var i=r(13559),n=r(65261),s=r(10612);class a{options={disableWarnings:!1};modules;moduleUniforms;moduleBindings;directBindings={};constructor(e,t){for(let r of(Object.assign(this.options,t),(0,n.$Q)(Object.values(e).filter(c))))e[r.name]=r;for(let[t,r]of(i.R.log(1,"Creating ShaderInputs with modules",Object.keys(e))(),this.modules=e,this.moduleUniforms={},this.moduleBindings={},Object.entries(e)))r&&(this._addModule(r),r.name&&t!==r.name&&!this.options.disableWarnings&&i.R.warn(`Module name: ${t} vs ${r.name}`)())}destroy(){}setProps(e){for(let t of(e.bindings&&Object.assign(this.directBindings,e.bindings),Object.keys(e))){if("bindings"===t)continue;let r=e[t]||{},n=this.modules[t];if(n){let e=this.moduleUniforms[t],i=this.moduleBindings[t],{uniforms:a,bindings:u}=function(e,t={}){let r={bindings:{},uniforms:{}};return Object.keys(e).forEach(i=>{let n=e[i];Object.prototype.hasOwnProperty.call(t,i)||(0,s.H9)(n)||"number"==typeof n||"boolean"==typeof n?r.uniforms[i]=n:r.bindings[i]=n}),r}(n.getUniforms?.(r,e)||r,n.uniformTypes);this.moduleUniforms[t]=o(e,a,n.uniformTypes),this.moduleBindings[t]={...i,...u}}else this.options.disableWarnings||i.R.warn(`Module ${t} not found`)()}}getModules(){return Object.values(this.modules)}addModules(e){for(let t of(0,n.$Q)(e)){let e=t.name;this.modules[e]||(this.modules[e]=t,this._addModule(t))}}getUniformValues(){return this.moduleUniforms}getBindingValues(){let e={};for(let t of Object.values(this.moduleBindings))Object.assign(e,t);return Object.assign(e,this.directBindings),e}getModuleBindingValues(e){let t=this.moduleBindings[e];return t?{...t}:{}}getDebugTable(){let e={};for(let[t,r]of Object.entries(this.moduleUniforms))for(let[i,n]of Object.entries(r))e[`${t}.${i}`]={type:this.modules[t].uniformTypes?.[i],value:String(n)};return e}_addModule(e){let t=e.name;this.moduleUniforms[t]=o({},e.defaultUniforms||{},e.uniformTypes),this.moduleBindings[t]={}}}function o(e={},t={},r={}){let i={...e};for(let[n,s]of Object.entries(t))void 0!==s&&(i[n]=function e(t,r,i){if(!i||"string"==typeof i)return u(r);if(Array.isArray(i)){if(l(r)||!Array.isArray(r))return u(r);let n=Array.isArray(t)&&!l(t)?[...t]:[],s=n.slice();for(let t=0;t<r.length;t++){let a=r[t];void 0!==a&&(s[t]=e(n[t],a,i[0]))}return s}if(!f(r))return u(r);let n=f(t)?t:{},s={...n};for(let[t,a]of Object.entries(r))void 0!==a&&(s[t]=e(n[t],a,i[t]));return s}(e[n],s,r[n]));return i}function u(e){return ArrayBuffer.isView(e)?Array.prototype.slice.call(e):Array.isArray(e)?l(e)?e.slice():e.map(e=>void 0===e?void 0:u(e)):f(e)?Object.fromEntries(Object.entries(e).map(([e,t])=>[e,void 0===t?void 0:u(t)])):e}function l(e){return ArrayBuffer.isView(e)||Array.isArray(e)&&(0===e.length||"number"==typeof e[0])}function f(e){return!!e&&"object"==typeof e&&!Array.isArray(e)&&!ArrayBuffer.isView(e)}function c(e){return!!e?.dependencies}},92790(e,t,r){r.d(t,{He:()=>s,Y$:()=>n,_R:()=>o,fX:()=>a,jY:()=>u});var i=r(19237);function n(e,t){if(!e||!t.some(e=>e.bindingLayout?.length))return e;let r={...e,bindings:e.bindings.map(e=>({...e}))};for(let i of("attributes"in(e||{})&&(r.attributes=e?.attributes||[]),t))for(let e of i.bindingLayout||[])for(let t of function(e){let t=new Set([e,`${e}Uniforms`]);return e.endsWith("Uniforms")||t.add(`${e}Sampler`),[...t]}(e.name)){let i=r.bindings.find(e=>e.name===t);i?.group===0&&(i.group=e.group),i&&void 0!==e.visibility&&(i.visibility=e.visibility)}return r}function s(e,t,r=[]){return e?t?{...e,attributes:e.attributes.length?function(e,t){let r=e.map(e=>({...e})),i=new Map(e.map(e=>[e.name,e])),n=new Map(e.map(e=>[e.location,e]));for(let e of t){let t=i.get(e.name);if(t){if(t.type!==e.type||t.location!==e.location)throw Error(`Shader attribute "${e.name}" conflicts with its inferred type or location`);continue}let s=n.get(e.location);if(s)throw Error(`Shader attributes "${s.name}" and "${e.name}" both use location ${e.location}`);r.push({...e})}return r}(e.attributes,t.attributes.filter(e=>r.includes(e.name))):t.attributes,bindings:function(e,t){let r=e.map(e=>({...e})),i=new Set(e.map(e=>e.name)),n=new Set(e.map(e=>`${e.group}:${e.location}`));for(let e of t){let t=`${e.group}:${e.location}`;i.has(e.name)||n.has(t)||r.push({...e})}return r}(e.bindings,t.bindings)}:e:t}function a(e){return!!(e.uniformTypes&&!function(e){for(let t in e)return!1;return!0}(e.uniformTypes))}function o(e){let t=[];for(let r of e){let e=(0,i.Uj)(r),n=new Set([r.vs,r.fs].flatMap(e=>e?(0,i.V$)(e).filter(e=>e.isStd140).map(e=>e.blockName):[])),s=n.has(e)?e:1===n.size?n.values().next().value:void 0;a(r)&&s&&t.push({name:s,uniformTypes:r.uniformTypes})}return t}function u(e,t){let r=[],i=new Set;for(let n of[...e||[],...t||[]])i.has(n.name)||(i.add(n.name),r.push(n));return r}},51208(e,t,r){r.d(t,{L:()=>n});let i={};function n(e="id"){i[e]=i[e]||1;let t=i[e]++;return`${e}-${t}`}},14878(e,t,r){r.d(t,{I:()=>n});var i=r(6646);class n{buffer;format;length;byteOffset;byteStride;constructor(e){let t=i.E.getVertexFormatInfo(e.format).byteLength,r=e.byteOffset??0,n=e.byteStride??t;if(s(e.length,"GPUDataView length"),s(r,"GPUDataView byteOffset"),s(n,"GPUDataView byteStride"),n<t)throw Error(`GPUDataView byteStride ${n} is smaller than ${e.format} byte length ${t}`);let a=0===e.length?0:(e.length-1)*n+t,o=r+a;if(!Number.isSafeInteger(a)||!Number.isSafeInteger(o))throw Error("GPUDataView byte range must use safe integers");if(o>e.buffer.byteLength)throw Error("GPUDataView exceeds its backing buffer byte length");this.buffer=e.buffer,this.format=e.format,this.length=e.length,this.byteOffset=r,this.byteStride=n}get elementByteLength(){return i.E.getVertexFormatInfo(this.format).byteLength}get byteLength(){return 0===this.length?0:(this.length-1)*this.byteStride+this.elementByteLength}}function s(e,t){if(!Number.isSafeInteger(e)||e<0)throw Error(`${t} must be a non-negative safe integer`)}},83672(e,t,r){r.d(t,{L:()=>c});var i=r(14878),n=r(6646),s=r(73348);function a(e){return!!(e&&"object"==typeof e&&"struct"===e.type)}function o(e,t){return 1===t?e:`vec${t}<${e}>`}function u(e,t){return Math.ceil(e/t)*t}var l=r(22585);class f{buffer;ownsDataBuffer;constructor(e,t){this.buffer=e,this.ownsDataBuffer=t}get ownsBuffer(){return this.ownsDataBuffer}transferBufferOwnership(e){if(e.buffer!==this.buffer)throw Error("GPUData ownership can only be transferred to the same buffer");e.ownsDataBuffer=this.ownsDataBuffer,this.ownsDataBuffer=!1}destroy(){this.ownsDataBuffer&&(this.buffer.destroy(),this.ownsDataBuffer=!1)}}let c=class extends f{dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;readbackMetadata;valueOffsets;nullBitmap;valueByteLength;constructor(e){let t,{buffer:r,format:i,length:f,valueLength:c,stride:h,byteOffset:d=0,byteStride:p,rowByteLength:m,ownsBuffer:g=!1,readbackMetadata:_,valueOffsets:b,nullBitmap:y,valueByteLength:v,dataType:w}=e;super(r,g);let E=a(t=i?"string"==typeof i?i:function(e,t){let r=Object.entries(e);if(0===r.length)throw Error("GPUData struct format must declare at least one field");return"packed"===t?function(e){let t=[],r=0,i=0;for(let[s,a]of e){let e=n.E.getVertexFormatInfo(a);if(e.webglOnly)throw Error(`Packed GPUData struct field "${s}" uses WebGL-only format ${a}`);r=u(r,Math.min(4,e.byteLength)),t.push([s,Object.freeze({format:a,byteOffset:r,byteLength:e.byteLength})]),r+=e.byteLength,i+=e.components}return Object.freeze({type:"struct",layout:"packed",fields:Object.freeze(Object.fromEntries(t)),components:i,byteStride:u(r,4),rowByteLength:r})}(r):function(e){let t=Object.fromEntries(e.map(([e,t])=>[e,function(e){let t=n.E.getVertexFormatInfo(e);switch(t.type){case"float32":return o("f32",t.components);case"sint32":return o("i32",t.components);case"uint32":return o("u32",t.components);default:return o("u32",Math.ceil(t.byteLength/4))}}(t)])),r=(0,s.Pr)(t,{layout:"wgsl-storage"}),i=[],a=0,u=0;for(let[t,s]of e){let e=n.E.getVertexFormatInfo(s),o=4*r.fields[t].offset;i.push([t,Object.freeze({format:s,byteOffset:o,byteLength:e.byteLength})]),a=Math.max(a,o+e.byteLength),u+=e.components}return Object.freeze({type:"struct",layout:"wgsl-storage",fields:Object.freeze(Object.fromEntries(i)),components:u,byteStride:r.byteLength,rowByteLength:a})}(r)}(i,e.layout??"wgsl-storage"):void 0)?t:void 0,x="string"==typeof t?(0,l.Ft)(t):void 0;if(this.dataType=w,this.format=t,this.length=f,this.valueLength=c??f*(x?.listSize??1),this.stride=h??(x?x.components*(x.listSize??1):void 0)??E?.components??p??m??1,this.byteOffset=d,this.rowByteLength=m??E?.rowByteLength??x?.byteLength??p??this.stride,this.byteStride=p??E?.byteStride??this.rowByteLength,x?.fixedSizeList){let e=f*x.listSize;if(!Number.isSafeInteger(f)||f<0||!Number.isSafeInteger(e)||!Number.isSafeInteger(this.byteOffset)||this.byteOffset<0||!Number.isSafeInteger(this.byteStride)||!Number.isSafeInteger(this.rowByteLength)||!Number.isSafeInteger(this.stride))throw Error("GPUData fixed-size-list row layout must use safe non-negative integers");if(this.valueLength!==e)throw Error("GPUData fixed-size-list valueLength must equal its flattened row elements");if(this.stride<x.components*x.listSize)throw Error("GPUData fixed-size-list stride cannot truncate its row components");if(this.rowByteLength<x.byteLength)throw Error("GPUData fixed-size-list rowByteLength cannot truncate its row payload");if(this.byteStride<this.rowByteLength)throw Error("GPUData fixed-size-list byteStride cannot overlap its row payload");let t=0===f?0:(f-1)*this.byteStride+this.rowByteLength,i=this.byteOffset+t;if(!Number.isSafeInteger(t)||!Number.isSafeInteger(i))throw Error("GPUData fixed-size-list byte range must use safe integers");if(i>r.byteLength)throw Error("GPUData fixed-size-list exceeds its backing buffer byte length")}if(E){if(this.rowByteLength<E.rowByteLength)throw Error(`GPUData rowByteLength ${this.rowByteLength} is smaller than struct format row byte length ${E.rowByteLength}`);if(this.byteStride<Math.max(E.byteStride,this.rowByteLength))throw Error(`GPUData byteStride ${this.byteStride} is smaller than its struct row layout`)}this.readbackMetadata=_,this.valueOffsets=b,this.nullBitmap=y,this.valueByteLength=v}getChild(e){if(!a(this.format))return null;let t=this.format.fields[e];return t?new i.I({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}getChildAt(e){if(!a(this.format))return null;let t=Object.values(this.format.fields)[e];return t?new i.I({buffer:this.buffer,format:t.format,length:this.length,byteOffset:this.byteOffset+t.byteOffset,byteStride:this.byteStride}):null}}},22585(e,t,r){r.d(t,{Ft:()=>l,Tm:()=>o,u4:()=>u});var i=r(6646);let n=/^vertex-list<([^<>]+)>$/,s=/^value-list<([^<>]+)>$/,a=/^fixed-size-list<([^<>,]+),([1-9][0-9]*)>$/;function o(e){return n.test(e)}function u(e){return s.test(e)}function l(e){let t=function(e){let t=n.exec(e),r=s.exec(e),a=f(e),o=a?.elementFormat??t?.[1]??r?.[1]??e;try{i.E.getVertexFormatInfo(o)}catch{throw Error(`Unsupported GPUVector format ${e}`)}return o}(e),r=o(e),a=u(e),l=f(e),c=i.E.getVertexFormatInfo(t),h=c.byteLength*(l?.listSize??1);if(!Number.isSafeInteger(h))throw Error(`Unsupported GPUVector format ${e}`);let d=c.type,p=c.normalized,m=function(e,t){if(t)return"f32";switch(e){case"float32":return"f32";case"float16":return"f16";case"uint8":case"uint16":case"uint32":return"u32";case"sint8":case"sint16":case"sint32":return"i32";default:throw Error(`Unsupported GPUVector component type ${e}`)}}(d,p);return{format:e,elementFormat:t,vertexList:r,valueList:a,fixedSizeList:!!l,...l?{listSize:l.listSize}:{},type:d,signedDataType:function(e,t){if("unorm10-10-10-2"===e)return"uint32";switch(t){case"unorm8":return"uint8";case"snorm8":return"sint8";case"unorm16":return"uint16";case"snorm16":return"sint16";default:return t}}(t,d),primitiveType:m,components:c.components,elementByteLength:c.byteLength,byteLength:h,integer:c.integer,signed:c.signed,normalized:p,...c.webglOnly?{webglOnly:!0}:{}}}function f(e){let t=a.exec(e);if(!t)return;let r=Number(t[2]);if(!Number.isSafeInteger(r))return;let n=t[1];try{let e=i.E.getVertexFormatInfo(n);if(!Number.isSafeInteger(r*e.components)||!Number.isSafeInteger(r*e.byteLength))return}catch{return}return{elementFormat:n,listSize:r}}},20449(e,t,r){r.d(t,{M:()=>s});var i=r(83672),n=r(22585);class s{name;dataType;format;length;valueLength;stride;byteOffset;byteStride;rowByteLength;bufferLayout;data=[];device;bufferProps;isAppendable=!1;ownsDataChunks=!0;ownedVectors=[];appendableByteLength=0;get chunks(){var e;let t;return e=this.data,t=0,Object.freeze(e.map(e=>{let r=Object.freeze({offset:t,length:e.length,data:e});return t+=e.length,r}))}constructor(e){switch(e.type){case"buffer":{let{name:t,buffer:r,format:n,length:s,valueLength:o,byteOffset:u=0,ownsBuffer:l=!1}=e,{stride:f,byteStride:c,rowByteLength:h,listSize:d}=a(e),p=o??s*(d??1);this.name=t,this.dataType=e.dataType,this.format=n,this.length=s,this.valueLength=p,this.stride=f,this.byteOffset=u,this.byteStride=c,this.rowByteLength=h,this.data.push(new i.L({buffer:r,format:n,length:s,valueLength:p,stride:f,byteOffset:u,byteStride:c,rowByteLength:h,ownsBuffer:l,dataType:e.dataType}));return}case"interleaved":{let{name:t,buffer:r,format:s,length:a,valueLength:o,byteOffset:u=0,byteStride:l,attributes:f,ownsBuffer:c=!1}=e,h=s?(0,n.Ft)(s):void 0,d=o??a*(h?.listSize??1),p=h?.fixedSizeList?h.components*h.listSize:l,m=h?.fixedSizeList?h.byteLength:l;this.name=t,this.dataType=e.dataType,this.format=s,this.length=a,this.valueLength=d,this.stride=p,this.byteOffset=u,this.byteStride=l,this.rowByteLength=m,this.bufferLayout={name:t,byteStride:l,attributes:f},this.data.push(new i.L({buffer:r,format:s,length:a,valueLength:d,stride:p,byteOffset:u,byteStride:l,rowByteLength:m,ownsBuffer:c,dataType:e.dataType}));return}case"data":{var t;let r=e.format??(t=e.data,t[0]?.format),i=r?(0,n.Ft)(r):void 0,{name:s,data:a,stride:o=a[0]?.stride??(i?i.components*(i.listSize??1):1),valueLength:u=a.reduce((e,t)=>e+t.valueLength,0),byteStride:l=a[0]?.byteStride??i?.byteLength,rowByteLength:f=a[0]?.rowByteLength??i?.byteLength,bufferLayout:c,ownsData:h=!1}=e;if(void 0===l||void 0===f)throw Error("GPUVector requires format or explicit byte layout metadata");r&&function(e,t){if(e.find(e=>e.format!==t))throw Error("GPUVector data chunks must share the declared format")}(a,r),this.name=s,this.dataType=e.dataType,this.format=r,this.length=a.reduce((e,t)=>e+t.length,0),this.valueLength=u,this.stride=o,this.byteOffset=1===a.length?a[0].byteOffset:0,this.byteStride=l,this.rowByteLength=f,this.bufferLayout=c,this.ownsDataChunks=h,this.data.push(...a);return}case"appendable":{let{name:t,device:r,format:i,valueLength:n=0,bufferProps:s}=e,{stride:o,byteStride:u,rowByteLength:l}=a(e);this.name=t,this.dataType=e.dataType,this.format=i,this.length=0,this.valueLength=n,this.stride=o,this.byteOffset=0,this.byteStride=u,this.rowByteLength=l,this.device=r,this.bufferProps=s,this.isAppendable=!0;return}}}get ownsBuffer(){return this.ownsDataChunks&&this.data.some(e=>e.ownsBuffer)||this.ownedVectors.some(e=>e.ownsBuffer)}get capacityRows(){return this.isAppendable?this.length:void 0}get appendedByteLength(){return this.appendableByteLength}addData(e){if(this.format&&e.format!==this.format)throw Error("GPUVector.addData() requires matching formats");if(e.byteStride!==this.byteStride)throw Error("GPUVector.addData() requires matching byteStride");if(e.rowByteLength!==this.rowByteLength)throw Error("GPUVector.addData() requires matching rowByteLength");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this}appendDataChunk(e,t=this.appendableByteLength+e.buffer.byteLength){if(!this.isAppendable)throw Error("GPUVector.appendDataChunk() requires appendable vector storage");if(this.format&&e.format!==this.format)throw Error("GPUVector.appendDataChunk() requires matching formats");if(e.byteStride!==this.byteStride||e.rowByteLength!==this.rowByteLength)throw Error("GPUVector.appendDataChunk() requires matching byte layout metadata");return this.data.push(e),this.length+=e.length,this.valueLength+=e.valueLength,this.appendableByteLength=t,this}resetLastBatch(){if(!this.isAppendable)throw Error("GPUVector.resetLastBatch() requires appendable vector storage");for(let e of this.data.splice(0))e.destroy();return this.length=0,this.valueLength=0,this.appendableByteLength=0,this}retainOwnedVectors(e){return this.ownedVectors.push(...e),this}transferBufferOwnership(e){let t=this.data[0],r=e.data[0];if(!t||!r||t.buffer!==r.buffer)throw Error("GPUVector ownership can only be transferred to the same buffer");t.transferBufferOwnership(r)}destroy(){if(this.ownsDataChunks)for(let e of this.data)e.destroy();for(let e of this.ownedVectors.splice(0))e.destroy()}}function a(e){let t=e.format?(0,n.Ft)(e.format):void 0,r=e.rowByteLength??(t?.fixedSizeList?t.byteLength:e.byteStride)??t?.byteLength;if(void 0===r)throw Error("GPUVector requires format or explicit rowByteLength");return{stride:e.stride??(t?t.components*(t.listSize??1):1),byteStride:e.byteStride??r,rowByteLength:r,...t?.listSize?{listSize:t.listSize}:{}}}},48894(e,t,r){r.d(t,{G:()=>S});var i={};r.r(i),r.d(i,{arithmetic:()=>u,castData:()=>l.K,convertColors:()=>f.K,dot:()=>m,equalAll:()=>g,extent:()=>c,fround:()=>h,gather:()=>d,interleave:()=>p,length:()=>_,segmentedMap:()=>b,select:()=>v,sequence:()=>E,swizzle:()=>x});var n=r(13559),s=r(95309);function a({elementWise:e,func:t,inputs:r,output:i,outputBuffer:n}){let s=Array.isArray(r)?r:Object.values(r);for(let e of s)if(!e.value)throw Error(`${e} does not have CPU value`);let u=i.length,l=i.size,f=new i.ValueType(u*l);for(let r=0;r<u;r++){let i=s.map(e=>o(e,r));if(e)for(let e=0;e<l;e++)f[r*l+e]=t.apply(null,i.map(t=>t[e]));else t.call(null,f.subarray(r*l,r*l+l),...i)}let c=i.ValueType.BYTES_PER_ELEMENT,h=i.offset/c,d=i.stride/c,p=f;if(0!==h||d!==l){p=new i.ValueType(h+i.byteLength/c);for(let e=0;e<u;e++){let t=e*l,r=h+e*d,i=f.subarray(t,t+l);p.set(i,r),n.write(i,r*c)}}else n.write(f);return{success:!0,value:p}}function o(e,t){let r=e.value,i=e.size,n=e.offset/e.ValueType.BYTES_PER_ELEMENT,s=e.stride/e.ValueType.BYTES_PER_ELEMENT,a=n+(e.isConstant?0:t)*s,o=r.slice(a,a+i);if(!e.normalized)return o;let u=new Float32Array(i);for(let t=0;t<i;t++)u[t]=function(e,t){switch(t){case"uint8":return e/255;case"uint16":return e/65535;case"uint32":return e/0xffffffff;case"sint8":return Math.max(e/127,-1);case"sint16":return Math.max(e/32767,-1);case"sint32":return Math.max(e/0x7fffffff,-1);case"float32":return e;default:throw Error(`Unsupported normalized source type ${t}`)}}(o[t],e.type);return u}let u=({inputs:e,output:t,target:r})=>{for(let t of Object.values(e.namedInputs))if(!t.value)throw Error(`${t} does not have CPU value`);let i=new t.ValueType(t.length*t.size);for(let r=0;r<t.length;r++){let n=Object.fromEntries(Object.entries(e.namedInputs).map(([e,t])=>[e,o(t,r)]));for(let a=0;a<t.size;a++)i[r*t.size+a]=function e(t,r,i){switch(t.kind){case"input":{let e=r[t.name];if(i<e.length)return e[i];return 1===e.length?e[0]:0}case"literal":if(Array.isArray(t.value))return t.value[i]??0;return t.value;case"call":{!function(e,t){let r=s.E[e].arity;if(t!==r)throw Error(`Arithmetic op '${e}' expects ${r} args, got ${t}`)}(t.op,t.args.length);let n=t.args.map(t=>e(t,r,i));switch(t.op){case"add":return n[0]+n[1];case"subtract":return n[0]-n[1];case"multiply":return n[0]*n[1];case"divide":return n[0]/n[1];case"pow":return Math.pow(n[0],n[1]);case"sqrt":return Math.sqrt(n[0]);case"abs":return Math.abs(n[0]);case"sin":return Math.sin(n[0]);case"cos":return Math.cos(n[0]);case"tan":return Math.tan(n[0]);case"exp":return Math.exp(n[0]);case"log":return Math.log(n[0]);default:{let e=t.op;throw Error(`Unsupported arithmetic op ${e}`)}}}default:throw Error(`Unsupported expression node ${t.kind}`)}}(e.expression,n,a)}return r.write(i),{success:!0,value:i}};var l=r(80223),f=r(25475);let c=({inputs:e,output:t,target:r})=>{let{sourceValues:i}=e;if(!i.value)throw Error(`${i} does not have CPU value`);let n=new t.ValueType(t.length*t.size);if(0===i.length)return{success:!1,error:Error(`${i} is empty`)};for(let e=0;e<i.size;e++){let r=o(i,0)[e],s=e*t.size,a=s+1;n[s]=r,n[a]=r;for(let t=1;t<i.length;t++){let r=o(i,t)[e];r<n[s]&&(n[s]=r),r>n[a]&&(n[a]=r)}}return r.write(n),{success:!0,value:n}},h=({inputs:e,output:t,target:r})=>a({func:(e,t)=>{let r=e.length/2,i=new Float64Array(t.buffer);for(let t=0;t<r;t++){let n=i[t];e[t]=Math.fround(n),e[t+r]=n-e[t]}return e},inputs:e,output:t,outputBuffer:r}),d=async({inputs:e,output:t,target:r})=>{let{ids:i,sourceValues:n}=e,s=i.value,a=n.value;if(!s)throw Error(`${i} does not have CPU value`);if(!a)throw Error(`${n} does not have CPU value`);let u=new t.ValueType(t.length*t.size),l=Array(t.size).fill(0);for(let e=0;e<t.length;e++){var f,c;let r=Number(o(i,e)[0]),s=(f=r,c=n.length,Number.isInteger(f)&&f>=0&&f<c)?o(n,r):l;u.set(s,e*t.size)}return r.write(u),{success:!0,value:u}},p=({inputs:e,output:t,target:r})=>a({func:(e,...t)=>{let r=0;for(let i of t)e.set(i,r),r+=i.length},inputs:e,output:t,outputBuffer:r}),m=({inputs:e,output:t,target:r})=>{let{x:i,y:n}=e,s=new t.ValueType(t.length);for(let e=0;e<t.length;e++){let t=o(i,e),r=o(n,e),a=0;for(let e=0;e<i.size;e++)a+=t[e]*r[e];s[e]=a}return r.write(s),{success:!0,value:s}},g=({inputs:e,output:t,target:r})=>{let{x:i,y:n}=e,s=new t.ValueType(t.length);for(let e=0;e<t.length;e++){let t=o(i,e),r=o(n,e),a=1;for(let e=0;e<i.size;e++)if(t[e]!==r[e]){a=0;break}s[e]=a}return r.write(s),{success:!0,value:s}},_=({inputs:e,output:t,target:r})=>{let{x:i}=e,n=new t.ValueType(t.length);for(let e=0;e<t.length;e++){let t=o(i,e),r=0;for(let e=0;e<i.size;e++)r+=t[e]*t[e];n[e]=Math.sqrt(r)}return r.write(n),{success:!0,value:n}},b=async({inputs:e,output:t,target:r})=>{let{segments:i,vertexCount:n}=e,s=i.value;if(!s)throw Error(`${i} does not have CPU value`);var a=s,o=i,u=n;if(o.length<1)throw Error("segmentedMap segments must contain at least one segment start");let l=0;for(let e=0;e<o.length;e++){let t=a[y(o,e)];if(0===e&&0!==t)throw Error(`segmentedMap segments must start at 0, got ${t}`);if(e>0&&t<l)throw Error(`segmentedMap segments must be non-decreasing, got ${t} after ${l}`);l=t}if(l>u)throw Error(`segmentedMap last segment start must be <= vertexCount, got ${l} > ${u}`);let f=new t.ValueType(t.length*t.size),c=0;for(let e=0;e<n;e++){for(;c+1<i.length&&s[y(i,c+1)]<=e;)c++;let r=s[y(i,c)],n=e*t.size;f[n]=c,f[n+1]=e-r}return r.write(f),{success:!0,value:f}};function y(e,t){return e.offset/e.ValueType.BYTES_PER_ELEMENT+t*(e.stride/e.ValueType.BYTES_PER_ELEMENT)}let v=async({inputs:e,output:t,target:r})=>{let{condition:i,whenTrue:n,whenFalse:s}=e,a=new t.ValueType(t.length*t.size);for(let e=0;e<t.length;e++){let r=o(i,e),u=o(n,e),l=o(s,e);for(let o=0;o<t.size;o++){let f=w(r,i.size,o);a[e*t.size+o]=0!==f?w(u,n.size,o):w(l,s.size,o)}}return r.write(a),{success:!0,value:a}};function w(e,t,r){return r<t?e[r]:1===t?e[0]:0}let E=({inputs:e,output:t,target:r})=>{let i=new t.ValueType(t.length);for(let r=0;r<t.length;r++)i[r]=e.start+r*e.step;return r.write(i),{success:!0,value:i}},x=({inputs:e,output:t,target:r})=>{let{columns:i}=e;return a({func:(e,t)=>{for(let r=0;r<i.length;r++)e[r]=t[i[r]]},inputs:{x:e.x},output:t,outputBuffer:r})},S=new class{_modules={cpu:i};add(e,t){let r=this._modules[e];if("function"==typeof t.then){let i=Promise.all([Promise.resolve(r||{}),t]).then(([e,t])=>({...e,...t}));return this._modules[e]=i,i.then(t=>{this._modules[e]=t}).catch(t=>{n.R.error(`Failed to register ${e} backend: ${t}`)()}),i}if(r&&"function"==typeof r.then){let i=Promise.resolve(r).then(e=>({...e,...t})).then(t=>(this._modules[e]=t,t)).catch(t=>{throw n.R.error(`Failed to register ${e} backend: ${t}`)(),t});return this._modules[e]=i,i}let i={...r||{},...t};return this._modules[e]=i,Promise.resolve(i)}async get(e,t){let i=this._modules[e];if(!i)if("webgl"===e)i=this.add("webgl",r.e("2671").then(r.bind(r,55554)));else if("webgpu"===e)i=this.add("webgpu",r.e("8066").then(r.bind(r,78745)));else throw Error(`${e} backend not registered`);let n=(await i)[t];if("function"!=typeof n&&("webgl"===e?n=(await r.e("2671").then(r.bind(r,55554)))[t]:"webgpu"===e&&(n=(await r.e("8066").then(r.bind(r,78745)))[t])),"function"!=typeof n)throw Error(`${e} backend does not implement ${t}`);return n}getSync(e,t){let r=this._modules[e];if(!r)throw Error(`${e} backend not registered`);if("function"==typeof r.then)throw Error(`${e} backend is not loaded yet`);let i=r[t];if("function"!=typeof i)throw Error(`${e} backend does not implement ${t}`);return i}clear(){this._modules={}}}},64238(e,t,r){r.d(t,{GL:()=>f,uy:()=>c});var i=r(36794),n=r(82645),s=r(14878),a=r(20449),o=r(83672),u=r(22585),l=r(66008);class f{static get bufferPoolSize(){return l.R.poolSize}static set bufferPoolSize(e){if(!Number.isSafeInteger(e)||e<0)throw Error("GPUDataEvaluator.bufferPoolSize must be a non-negative safe integer");l.R.poolSize=e,l.R.purge()}type;size;get offset(){return this._offset}get stride(){return this._stride}normalized;isConstant;length;get byteLength(){return this._byteLength}ValueType;source=null;format;_id;_destroyed=!1;_value;_offset;_stride;_byteLength;_gpuVector;_bufferOwnership="owned";_targetBuffer;static fromArray(e,{type:t,size:r=1,offset:n=0,stride:s=0,normalized:a=!1}){let o,u=t;return Array.isArray(e)?(u=u||"float32",o=new((0,i.Y0)(u))(e)):e instanceof Float64Array?(u="uint32",r*=2,n*=2,s*=2,o=new Uint32Array(e.buffer,e.byteOffset,e.byteLength/4)):(u=u||(0,i.UE)(e),o=e),new f({id:`<${u} * ${r}>`,type:u,size:r,offset:n,stride:s,normalized:a,value:o})}static fromConstant(e,t="float32"){let r,n=(0,i.Y0)(t);return Array.isArray(e)?r=`[${e.join(",")}]`:(r=String(e),e=[e]),new f({id:r,isConstant:!0,type:t,size:e.length,value:new n(e)})}static fromGPUData(e,t={}){return function(e){if(!e.format)throw Error("GPUDataEvaluator.fromGPUData() requires GPUData format metadata");if((0,u.Tm)(e.format)||(0,u.u4)(e.format))throw Error("GPUDataEvaluator.fromGPUData() does not support variable-length input");let t=(0,u.Ft)(e.format).byteLength;if(e.rowByteLength!==t)throw Error(`GPUDataEvaluator.fromGPUData() requires rowByteLength ${t} for GPUData`)}(e),new f({...h(new s.I({buffer:e.buffer,format:e.format,length:e.length,byteOffset:e.byteOffset,byteStride:e.byteStride})),id:t.id,gpuData:e})}static fromGPUDataView(e,t={}){return new f({...h(e),id:t.id,buffer:e.buffer})}constructor(e){let{id:t,value:r,buffer:n,gpuData:s,format:o,source:u=null,isConstant:l=!1}=e;if(!u&&!r&&!n&&!s)throw Error("GPUDataEvaluator must have a value source");let{type:c,size:h,offset:d,stride:p,normalized:m,length:g}=e;if(u instanceof f?(c=c??u.type,h=h??u.size,d=d??u.offset,p=p??u.stride,m=m??u.normalized,g=g??u.length):(h=h??1,d=d??0,m=m??!1,g=l?1:g),!c)throw Error("GPUDataEvaluator: type not defined");if(this._id=t,this.type=c,this.size=h,this.ValueType=(0,i.Y0)(this.type),this._offset=d,this._stride=p||this.ValueType.BYTES_PER_ELEMENT*h,this.normalized=m,this.source=u,this.format=o,void 0===g)if(l)g=1;else{if(!r)throw Error("GPUDataEvaluator: length not defined");g=Math.ceil(r.byteLength/this.stride)}this.isConstant=l,this.length=g;let _=this.ValueType.BYTES_PER_ELEMENT*this.size;this._byteLength=0===g?0:(g-1)*this.stride+_,this._value=r,this._bufferOwnership=u instanceof f||n||s?"borrowed":"owned",s?this._gpuVector=new a.M({type:"data",name:this._id??"data",format:s.format,data:[s],stride:s.stride,byteStride:s.byteStride,rowByteLength:s.rowByteLength}):n&&(this._gpuVector=this.createGPUVectorView({buffer:n,name:this._id,format:this.format}))}get value(){return this._value||(this.source instanceof f?this.source.value:void 0)}get evaluated(){return!!this._gpuVector}get id(){return this._id}get gpuVector(){if(!this._gpuVector)throw Error(`${this} not evaluated`);return this._gpuVector}get buffer(){return d(this.gpuVector)}setTargetBuffer({buffer:e,byteOffset:t=0,byteStride:r=this.stride}){if(this._destroyed)throw Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)throw Error(`GPUDataEvaluator ${this} already evaluated`);if(!this.source||this.source instanceof f)throw Error("GPUDataEvaluator target buffers require a deferred operation source");this._targetBuffer={buffer:e,byteOffset:t,byteStride:r}}async evaluate(e,t={}){let r;if(this._destroyed)throw Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;if(this.source instanceof f){let r=await this.source.evaluate(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:d(r)}),this._gpuVector}if(r=this._getEvaluationBuffer(e),this._value)r.write(this._value);else{let t=await this.source.execute(e,r);if(!t.success)throw t.error||Error(`${this.source} evaluation failed`);t.value&&(this._value=t.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:r}),this._gpuVector}evaluateSync(e,t={}){let r;if(this._destroyed)throw Error(`GPUDataEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;if(this.source instanceof f){let r=this.source.evaluateSync(e);return this._gpuVector=this.createGPUVectorView({...t,buffer:d(r)}),this._gpuVector}if(r=this._getEvaluationBuffer(e),this._value)r.write(this._value);else{let t=this.source.executeSync(e,r);if(!t.success)throw t.error||Error(`${this.source} evaluation failed`);t.value&&(this._value=t.value)}return this._gpuVector=this.createGPUVectorView({...t,buffer:r}),this._gpuVector}createGPUVectorView(e){let t=e.name??this._id??"vector",r=e.format??this.format??function(e,t,r=!1){return t>=1&&t<=4?p(e,t,r):void 0}(this.type,this.size,this.normalized);if(e.interleaved){var i;let r,n="object"==typeof e.interleaved&&e.interleaved.attributes?e.interleaved.attributes:(i=this,function e(t,r,i){let n=t.source;if(n&&!(n instanceof f)&&"interleave"===n.name){for(let t of Object.values(n.inputs))t instanceof f&&e(t,r,i);return}r.push({attribute:t.id??t.toString(),format:p(t.type,t.size,t.normalized),byteOffset:i.byteOffset}),i.byteOffset+=t.ValueType.BYTES_PER_ELEMENT*t.size}(i,r=[],{byteOffset:0}),r);return new a.M({type:"interleaved",name:t,buffer:e.buffer,format:e.format??this.format,length:this.length,byteOffset:this.offset,byteStride:this.stride,attributes:n,ownsBuffer:!1})}return new a.M({type:"buffer",name:t,buffer:e.buffer,format:r,length:this.length,stride:this.size,byteOffset:this.offset,byteStride:this.stride,rowByteLength:this.ValueType.BYTES_PER_ELEMENT*this.size,ownsBuffer:!1})}_getEvaluationBuffer(e){let t=this._targetBuffer;if(!t)return l.R.createOrReuse(e,this.byteLength);if(t.buffer.device!==e)throw Error("GPUDataEvaluator target buffer belongs to a different device");let r=this.ValueType.BYTES_PER_ELEMENT*this.size,i=0===this.length?0:(this.length-1)*t.byteStride+r;if(t.byteOffset+i>t.buffer.byteLength)throw Error("GPUDataEvaluator target buffer is too small for the output layout");return this._offset=t.byteOffset,this._stride=t.byteStride,this._byteLength=i,this._bufferOwnership="borrowed",this._targetBuffer=void 0,t.buffer}async readValue(e=0,t){let{ValueType:r}=this,{size:i,offset:n,stride:s,length:a}=this,o=r.BYTES_PER_ELEMENT*i;if(t=t??a,t=Math.max(e=Math.max(0,Math.min(a,e)),Math.min(a,t)),this._value)return function(e,t,r,i){let{ValueType:n,size:s,offset:a,stride:o}=e,u=o/n.BYTES_PER_ELEMENT,l=a/n.BYTES_PER_ELEMENT,f=i-r;if(u===s){let e=l+r*u;return t.subarray(e,e+f*s)}let c=new n(f*s);for(let e=0;e<f;e++){let i=l+(r+e)*u;c.set(t.subarray(i,i+s),e*s)}return c}(this,this._value,e,t);let u=t-e;if(0===u)return new r(0);let l=n+e*s,f=await this.buffer.readAsync(l,s===o?u*o:(u-1)*s+o),c=new r(f.buffer,f.byteOffset,f.byteLength/r.BYTES_PER_ELEMENT);if(s===o)return c;let h=new Uint8Array(o*u);for(let e=0;e<u;e++){let t=e*s;h.set(f.subarray(t,t+o),e*o)}return new r(h.buffer)}async ensureCPUValue(){let e=this.value;if(e)return e;let t=await this.buffer.readAsync(0,this.offset+this.byteLength);if(t.byteLength%this.ValueType.BYTES_PER_ELEMENT!=0)throw Error(`${this} backing buffer byte length is not aligned to its scalar type`);let r=t.slice();return this._value=new this.ValueType(r.buffer,r.byteOffset,r.byteLength/this.ValueType.BYTES_PER_ELEMENT),this._value}ensureCPUValueSync(){let e=this.value;if(e)return e;throw Error(`${this} CPU value is not available for synchronous evaluation`)}toString(){return this._id??this.source?.toString()??this.constructor.name}destroy(){this._gpuVector&&("owned"===this._bufferOwnership&&l.R.recycle(d(this._gpuVector)),this._gpuVector=void 0),this._targetBuffer=void 0,this._destroyed=!0}}function c(e){if(e instanceof f)return e;if("number"==typeof e||Array.isArray(e))return f.fromConstant(e);if(e instanceof o.L)return f.fromGPUData(e);if(e instanceof s.I)return f.fromGPUDataView(e);throw Error("getGPUDataEvaluator() requires GPUDataEvaluator, GPUData, GPUDataView, number, or number[]")}function h(e){let t=(0,u.Ft)(e.format),r=(0,i.Y0)(t.signedDataType),n=r.BYTES_PER_ELEMENT*t.components;if(t.byteLength!==n)throw Error(`GPUDataEvaluator does not support packed vertex format ${e.format}: ${t.byteLength} physical bytes cannot expose ${t.components} ${t.signedDataType} components`);if(e.byteOffset%r.BYTES_PER_ELEMENT!=0||e.byteStride%r.BYTES_PER_ELEMENT!=0)throw Error(`GPUDataEvaluator requires ${e.format} offset and stride aligned to ${r.BYTES_PER_ELEMENT} bytes`);return{type:t.signedDataType,size:t.components,offset:e.byteOffset,stride:e.byteStride,normalized:t.normalized,length:e.length,format:e.format}}function d(e){let t=function(e){let[t,...r]=e.data;if(!t||r.length>0)throw Error(`GPUDataEvaluator requires exactly one GPUData chunk for "${e.name}"`);return t}(e).buffer;return t instanceof n.kL?t.buffer:t}function p(e,t,r=!1){if(t<1||t>4)throw Error(`Cannot synthesize a GPUVector vertex format with ${t} components`);let i=e;if(r)switch(e){case"uint8":i="unorm8";break;case"sint8":i="snorm8";break;case"uint16":i="unorm16";break;case"sint16":i="snorm16";break;case"float32":i="float32";break;default:throw Error(`Unsupported normalized vertex format for ${e}`)}return("uint8"===i||"sint8"===i||"uint16"===i||"sint16"===i||"unorm8"===i||"snorm8"===i||"unorm16"===i||"snorm16"===i)&&3===t?`${i}x3-webgl`:`${i}${1===t?"":`x${t}`}`}},95309(e,t,r){r.d(t,{E:()=>i});let i={add:{arity:2,symbol:"arithmetic_add"},subtract:{arity:2,symbol:"arithmetic_subtract"},multiply:{arity:2,symbol:"arithmetic_multiply"},divide:{arity:2,symbol:"arithmetic_divide"},pow:{arity:2,symbol:"pow"},sqrt:{arity:1,symbol:"sqrt"},abs:{arity:1,symbol:"abs"},sin:{arity:1,symbol:"sin"},cos:{arity:1,symbol:"cos"},tan:{arity:1,symbol:"arithmetic_tan"},exp:{arity:1,symbol:"exp"},log:{arity:1,symbol:"log"}}},80223(e,t,r){r.d(t,{K:()=>s});var i=r(31106),n=r(22585);let s=({inputs:e,output:t,target:r})=>a(e,t,r);async function a(e,t,r){let s=await e.source.ensureCPUValue(),a=(0,n.Ft)(e.inputFormat),u=(0,n.Ft)(e.outputFormat),l=new t.ValueType(t.length*t.size),f=e.source.offset/e.source.ValueType.BYTES_PER_ELEMENT,c=e.source.stride/e.source.ValueType.BYTES_PER_ELEMENT;for(let r=0;r<t.length;r++)for(let n=0;n<t.size;n++){let h=function(e,t,r){if("float16"===t)return(0,i.U)(e);if(!r)return e;let{minimum:n,maximum:s}=o(t);return Math.max(e/s,n<0?-1:0)}(s[f+r*c+n],e.source.type,a.normalized);l[r*t.size+n]=function(e,t,r){if("float16"===t.type)return(0,i.X)(e);if(!r&&"float32"===t.type)return e;let{minimum:n,maximum:s}=o(t.type),a=r?e*s:e;return Math.round(Math.min(s,Math.max(n,a)))}(h,t,u.normalized)}return r.write(l),{success:!0,value:l}}function o(e){switch(e){case"sint8":return{minimum:-127,maximum:127};case"sint16":return{minimum:-32767,maximum:32767};case"sint32":return{minimum:-0x80000000,maximum:0x7fffffff};case"uint8":return{minimum:0,maximum:255};case"uint16":return{minimum:0,maximum:65535};case"uint32":return{minimum:0,maximum:0xffffffff};default:throw Error(`castData CPU output does not support ${e}`)}}},25475(e,t,r){r.d(t,{K:()=>n});var i=r(31106);let n=async({inputs:e,output:t,target:r})=>{let{source:i,inputFormat:n}=e,a=await i.ensureCPUValue(),o=new t.ValueType(t.length*t.size),u=n.endsWith("x3")?3:4;for(let e=0;e<t.length;e++){let t=i.offset/i.ValueType.BYTES_PER_ELEMENT+e*(i.stride/i.ValueType.BYTES_PER_ELEMENT),r=4*e;o[r]=s(a,t,n),o[r+1]=s(a,t+1,n),o[r+2]=s(a,t+2,n),o[r+3]=4===u?s(a,t+3,n):255}return r.write(o),{success:!0,value:o}};function s(e,t,r){var n,s;let a;return r.startsWith("uint8")?e[t]:Math.round(255*Math.min(Math.max(r.startsWith("float16")?(n=e,s=t,(a=globalThis.Float16Array)&&n.constructor===a?n[s]:(0,i.U)(n[s])):e[t],0),1))}},96430(e,t,r){r.d(t,{C:()=>o});var i=r(64238),n=r(48894);class s{inputs;dependencies;constructor(e){this.inputs=e,this.dependencies=Array.from(e instanceof Array?e:Object.values(e)).filter(e=>e instanceof i.GL)}async execute(e,t){return await this._resolveDependencies(e),await this._executeWithHandler(await n.G.get(this._getHandlerRegistry(e),this.name),t)}executeSync(e,t){var r;this._resolveDependenciesSync(e);let i=this._executeWithHandler(n.G.getSync(this._getHandlerRegistry(e),this.name),t);if(r=i,"function"==typeof r?.then)throw Error(`${this.name} returned a Promise in executeSync()`);return i}shouldExecuteOnCPU(){return this.output.length<=1&&Array.from(this.dependencies).every(e=>!!e.value)}_getHandlerRegistry(e){return this.shouldExecuteOnCPU()?"cpu":e.type}async _resolveDependencies(e){for(let t of this.dependencies)await t.evaluate(e);if("cpu"===this._getHandlerRegistry(e)||"null"===e.type)for(let e of this.dependencies)await e.ensureCPUValue()}_resolveDependenciesSync(e){for(let t of this.dependencies)t.evaluateSync(e);if("cpu"===this._getHandlerRegistry(e)||"null"===e.type)for(let e of this.dependencies)e.ensureCPUValueSync()}_executeWithHandler(e,t){return e({device:t.device,inputs:this.inputs,output:this.output,target:t})}}class a extends s{name="interleave";output;constructor(e){super(e);let{isConstant:t,type:r,length:n}=function(...e){let t=function(e){let t=0,r=0;for(let i of e){if("f"===i[0])return"float32";let e=i.endsWith("8")?8:i.endsWith("6")?16:32;"u"===i[0]?t=Math.max(t,e):r=Math.max(r,e)}return t&&!r?`uint${t}`:r&&t<32?`sint${Math.max(r,2*t)}`:"float32"}(e.map(e=>e.type));return"f"!==t[0]&&e.some(e=>e.normalized)&&(t="float32"),{isConstant:e.every(e=>e.isConstant),type:t,size:e.reduce((e,t)=>Math.max(e,t.size),0),length:e.reduce((e,t)=>Math.max(e,t.length),0)}}(...e);this.output=new i.GL({isConstant:t,type:r,size:e.reduce((e,t)=>e+t.size,0),length:n,source:this})}toString(){return`_${this.inputs.join("_")}_`}}function o(...e){if(0===e.length)throw Error("interleave() requires at least one input");return 1===e.length?(0,i.uy)(e[0]):new a(e.map(i.uy)).output}},75605(e,t,r){function i(e,t){var r;let i=Number.isFinite(r=t)&&r>0?Math.floor(r):65535,n=Math.max(1,Math.ceil(e)),s=Math.min(n,i),a=Math.min(Math.ceil(n/s),i),o=Math.ceil(n/s/a);if(o>i)throw Error(`WebGPU dispatch requires ${n} workgroups, exceeding the 3D dispatch limit of ${i} per dimension`);return{x:s,y:a,z:o}}function n(e,t="workgroupId"){return`((${t}.z * ${e.y}u + ${t}.y) * ${e.x}u + ${t}.x)`}function s(e,t,r="workgroupId",i="localId"){return`(${n(e,r)} * ${t}u + ${i}.x)`}r.d(t,{B:()=>n,BB:()=>i,vL:()=>s})},39463(e,t,r){function i(e,t){switch(e){case"u32":return`${t}u`;case"f32":return Number.isInteger(t)?`${t}.0`:`${t}`;default:return`${t}`}}function n(e,t){switch(e){case"uint32":return i("u32",Math.trunc(t));case"sint32":return`${Math.trunc(t)}`;case"float32":return i("f32",t);default:throw Error(`WebGPU operations only support 32-bit output types, got ${e}`)}}function s(e){switch(e){case"uint32":return"0u";case"sint32":return"0";case"float32":return"0.0";default:throw Error(`WebGPU operations only support 32-bit output types, got ${e}`)}}function a(e){switch(e){case"uint32":return"u32";case"sint32":return"i32";case"float32":return"f32";default:throw Error(`WebGPU operations only support 32-bit storage types, got ${e}`)}}r.d(t,{C1:()=>n,Lm:()=>i,_1:()=>s,iP:()=>a})},84598(e,t,r){r.d(t,{P:()=>u});var i=r(31709),n=r(8780),s=r(75605),a=r(39463);let o=new n.Ry;function u({module:e,elementWise:t=!1,expression:r,inputs:n,output:l,operationType:f=l.type,outputBuffer:c}){var h,d,p,m;let g,_,b,y;if(!e.source)throw Error(`WebGPU computation ${e.name} requires WGSL source`);let v=Array.isArray(h=n)?h.map((e,t)=>[`x${t}`,e]):Object.entries(h),w=v.map(([e,t])=>({name:e,input:t})),E=w.filter(({input:e})=>!e.isConstant).map((e,t)=>({...e,index:t})),x=(0,a.iP)(f),S=(0,a.iP)(l.type),A={TYPE:x,RESULT_LEN:l.size.toString()},L=(0,s.BB)(Math.ceil(l.length/64),c.device.limits.maxComputeWorkgroupsPerDimension);for(let[e,t]of v)A[`${e.toUpperCase()}_LEN`]=t.size.toString();let P=`
${function(e,t){for(let r in t)e=e.replaceAll(`{${r}}`,t[r]);return e}(e.source,A)}
${E.map(({name:e,input:t,index:r})=>(function(e,t,r){if(t.isConstant)return"";let i=(0,a.iP)(t.type);return`@group(0) @binding(${r}) var<storage, read> ${e}: array<${i}>;`})(e,t,r)).join("\n")}
${w.map(({name:e,input:t})=>{var r,i,n;let s,o,u,l;return r=e,i=t,n=f,s=(0,a.iP)(n),o=i.type===n?"":s,u=i.stride/i.ValueType.BYTES_PER_ELEMENT,l=i.offset/i.ValueType.BYTES_PER_ELEMENT,i.isConstant?`fn read_${r}(_rowIndex: u32) -> array<${s}, ${i.size}> {
  return array<${s}, ${i.size}>(${function(e,t){let r=e.value;if(!r)throw Error(`Constant input ${e} is missing CPU values`);return Array.from({length:e.size},(e,i)=>(0,a.Lm)(t,r[i]??0)).join(", ")}(i,o)});
}`:`fn read_${r}(rowIndex: u32) -> array<${s}, ${i.size}> {
  var value: array<${s}, ${i.size}>;
  let rowOffset = ${l}u + rowIndex * ${u}u;
${Array.from({length:i.size},(e,t)=>o?`  value[${t}] = ${o}(${r}[rowOffset + ${t}u]);`:`  value[${t}] = ${r}[rowOffset + ${t}u];`).join("\n")}
  return value;
}`}).join("\n")}
${(d=l,p=E.length,g=(0,a.iP)(d.type),`@group(0) @binding(${p}) var<storage, read_write> result: array<${g}>;`)}
${(_=(m=l).stride/m.ValueType.BYTES_PER_ELEMENT,b=m.offset/m.ValueType.BYTES_PER_ELEMENT,y=(0,a.iP)(m.type),`fn write_result(rowIndex: u32, value: array<${y}, ${m.size}>) {
  let rowOffset = ${b}u + rowIndex * ${_}u;
${Array.from({length:m.size},(e,t)=>`  result[rowOffset + ${t}u] = value[${t}];`).join("\n")}
}`)}

@compute @workgroup_size(64) fn main(
  @builtin(workgroup_id) workgroupId: vec3<u32>,
  @builtin(local_invocation_id) localId: vec3<u32>
) {
  let rowIndex = ${(0,s.vL)(L,64)};
  if (rowIndex >= ${l.length}u) {
    return;
  }

${w.map(({name:e})=>`  let ${e} = read_${e}(rowIndex);`).join("\n")}
  var result: array<${S}, ${l.size}>;
${function(e,t,r,i,n){let s="";if(n)for(let e=0;e<r.size;e++)s+=`  result[${e}] = ${n(e)};
`;else if(i){let i=(0,a._1)(r.type),n=(0,a.iP)(r.type);for(let o=0;o<r.size;o++){let r=t.map(([e,t])=>o<t.size?(0,a.iP)(t.type)===n?`${e}[${o}]`:`${n}(${e}[${o}])`:i);s+=`  result[${o}] = ${e}(${r.join(", ")});
`}}else s+=`result = ${e}(${t.map(([e])=>e).join(", ")});`;return s.trimEnd()}(e.name,v,l,t,r)}
  write_result(rowIndex, result);
}
`,B=new i.C(c.device,{source:P,modules:e.dependencies,shaderAssembler:o,shaderLayout:{bindings:[...E.map(({name:e},t)=>({name:e,type:"storage",group:0,location:t})),{name:"result",type:"storage",group:0,location:E.length}]}}),T=Object.fromEntries(E.map(({name:e,input:t})=>[e,t.buffer]));T.result=c,B.setBindings(T);let M=c.device.beginComputePass({});c.device.statsManager.getStats("GPGPU Operation Counts").get("Computation Runs").incrementCount(),B.dispatch(M,L.x,L.y,L.z),M.end(),c.device.submit(),B.destroy()}},41568(e,t,r){r.d(t,{C:()=>n});var i=r(84598);let n=({inputs:e,output:t,target:r})=>{let n=e.map((e,t)=>[`x${t}`,e]);var s=r.device.limits,a=n;let o=a.filter(([,e])=>!e.isConstant).length+1;if(o>s.maxStorageBuffersPerShaderStage)throw Error(`interleave() requires ${o} storage buffers, exceeding device limit ${s.maxStorageBuffersPerShaderStage}`);if(o>s.maxBindingsPerBindGroup)throw Error(`interleave() requires ${o} bindings, exceeding bind group limit ${s.maxBindingsPerBindGroup}`);let u=n.map(([e,t])=>`${e}: array<{TYPE}, ${t.size}>`).join(", "),l=0,f=n.map(([e,t])=>{let r=Array.from({length:t.size},(t,r)=>`  out[${l+r}] = ${e}[${r}];`).join("\n");return l+=t.size,r}).join("\n"),c=`\
fn interleave(${u}) -> array<{TYPE}, {RESULT_LEN}> {
  var out: array<{TYPE}, {RESULT_LEN}>;
${f}
  return out;
}
`;return(0,i.P)({module:{name:"interleave",source:c},inputs:e,output:t,outputBuffer:r}),{success:!0}}},66008(e,t,r){r.d(t,{R:()=>n});var i=r(60691);let n=new class{poolSize=20;bufferPools;constructor(){this.bufferPools=new Map}createOrReuse(e,t){if(t>e.limits.maxBufferSize)throw Error(`Buffer pool cannot allocate ${t} bytes: device.limits.maxBufferSize is ${e.limits.maxBufferSize}`);let r=this.bufferPools.get(e),n=r?r.findIndex(e=>e.byteLength>=t):-1;if(n<0)return e.createBuffer({usage:i.h.VERTEX|i.h.STORAGE|i.h.COPY_DST|i.h.COPY_SRC,byteLength:t});let[s]=r.splice(n,1);return s}recycle(e){let t=e.device;this.bufferPools.has(t)||this.bufferPools.set(t,[]);let r=this.bufferPools.get(t),i=r.findIndex(t=>t.byteLength>e.byteLength);i<0?r.push(e):r.splice(i,0,e),this.purge()}purge(){for(let[e,t]of this.bufferPools){let r=e.isLost?0:this.poolSize;for(;t.length>r;)t.shift().destroy();0===t.length&&this.bufferPools.delete(e)}}}},97065(e,t,r){r.d(t,{o:()=>u});var i=r(82645),n=r(64238),s=r(20449);class a{gpuDataEvaluators;format;length;id;_gpuVector;_ownsGPUDataEvaluators;_destroyed=!1;static fromGPUVector(e){if(e.bufferLayout)throw Error(`GPUVectorEvaluator.fromGPUVector() does not accept interleaved vector "${e.name}"`);if(0===e.data.length)throw Error(`GPUVectorEvaluator.fromGPUVector() requires GPUData for "${e.name}"`);return new a({id:e.name,gpuDataEvaluators:e.data.map(t=>n.GL.fromGPUData(t,{id:e.name})),gpuVector:e,format:e.format})}static fromGPUDataEvaluators(e,t={}){return new a({id:t.id,gpuDataEvaluators:e,format:t.format})}constructor({id:e,gpuDataEvaluators:t,gpuVector:r,format:i}){if(0===t.length)throw Error("GPUVectorEvaluator requires at least one GPUData evaluator");(function(e){let t=e[0];for(let r of e.slice(1))if(r.type!==t.type||r.size!==t.size||r.normalized!==t.normalized||r.format!==t.format)throw Error("GPUVectorEvaluator requires matching GPUData evaluator layouts")})(t),this.id=e,this.gpuDataEvaluators=t,this.format=i??t[0].format,this.length=t.reduce((e,t)=>e+t.length,0),this._gpuVector=r,this._ownsGPUDataEvaluators=!r}get evaluated(){return!!this._gpuVector}get gpuVector(){if(!this._gpuVector)throw Error(`${this} not evaluated`);return this._gpuVector}mapGPUData(e){return a.fromGPUDataEvaluators(this.gpuDataEvaluators.map((t,r)=>e(t,r)),{id:this.id})}async evaluate(e,t={}){if(this._destroyed)throw Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let r=await Promise.all(this.gpuDataEvaluators.map(r=>r.evaluate(e,t))),i=r[0],n=r.map(o),a=t.format??this.format??i.format;return this._gpuVector=new s.M({type:"data",name:t.name??this.id??"vector",format:a,data:n,stride:i.stride,byteStride:i.byteStride,rowByteLength:i.rowByteLength,bufferLayout:i.bufferLayout}),this._gpuVector}evaluateSync(e,t={}){if(this._destroyed)throw Error(`GPUVectorEvaluator ${this} already destroyed`);if(this._gpuVector)return this._gpuVector;let r=this.gpuDataEvaluators.map(r=>r.evaluateSync(e,t)),i=r[0],n=r.map(o),a=t.format??this.format??i.format;return this._gpuVector=new s.M({type:"data",name:t.name??this.id??"vector",format:a,data:n,stride:i.stride,byteStride:i.byteStride,rowByteLength:i.rowByteLength,bufferLayout:i.bufferLayout}),this._gpuVector}destroy(){if(this._ownsGPUDataEvaluators)for(let e of this.gpuDataEvaluators)e.destroy();this._gpuVector=void 0,this._destroyed=!0}toString(){return this.id??this.constructor.name}}function o(e){let[t,...r]=e.data;if(!t||r.length>0)throw Error(`GPUVectorEvaluator requires one GPUData chunk for "${e.name}"`);return t}function u(e,t){let r,i=(function e(t,r,i){var s;if((s=t)instanceof n.GL||s instanceof a)return void r.add(t);if(!(!t||"object"!=typeof t||i.has(t))){let n;if(i.add(t),Array.isArray(t)){for(let n of t)e(n,r,i);return}if((n=Object.getPrototypeOf(t))===Object.prototype||null===n)for(let n of Object.values(t))e(n,r,i)}}(t,r=new Set,new Set),Array.from(r));for(let t of i)t.evaluateSync(e);return function(e){let t=new Set(e.flatMap(l)),r=new Set;for(let t of e)!function e(t,r){if(t instanceof a){for(let i of t.gpuDataEvaluators)e(i,r);return}let i=t.source;if(i){if(i instanceof n.GL){r.has(i)||(r.add(i),e(i,r));return}for(let t of i.dependencies)r.has(t)||(r.add(t),e(t,r))}}(t,r);for(let e of r)e.evaluated&&!t.has(e.buffer)&&e.destroy()}(i),t}function l(e){return e instanceof n.GL?[e.buffer]:e.gpuVector.data.map(e=>e.buffer instanceof i.kL?e.buffer.buffer:e.buffer)}},23471(e,t,r){function i(e,t=!0){return e??t}function n(e=[0,0,0],t=!0){return t?e.map(e=>e/255):[...e]}function s(e,t=!0){let r=n(e.slice(0,3),t),i=Number.isFinite(e[3]),a=i?e[3]:1;return[r[0],r[1],r[2],t&&i?a/255:a]}r.d(t,{eS:()=>i,jI:()=>s,sC:()=>n})},1100(e,t,r){r.d(t,{Wk:()=>s});let i=`\
out vec4 transform_output;
void main() {
  transform_output = vec4(0);
}`,n=`#version 300 es
${i}`;function s(e){let{input:t,inputChannels:r,output:i}=e||{};if(!t)return n;if(!r)throw Error("inputChannels");let s=function(e){switch(e){case 1:return"float";case 2:return"vec2";case 3:return"vec3";case 4:return"vec4";default:throw Error(`invalid channels: ${e}`)}}(r),a=function(e,t){switch(t){case 1:return`vec4(${e}, 0.0, 0.0, 1.0)`;case 2:return`vec4(${e}, 0.0, 1.0)`;case 3:return`vec4(${e}, 1.0)`;case 4:return e;default:throw Error(`invalid channels: ${t}`)}}(t,r);return`\
#version 300 es
in ${s} ${t};
out vec4 ${i};
void main() {
  ${i} = ${a};
}`}},8780(e,t,r){r.d(t,{U0:()=>et,_P:()=>ee,Ry:()=>er});var i=r(72560),n=r(65261),s=r(31770);let a=[[/^(#version[ \t]+(100|300[ \t]+es))?[ \t]*\n/,"#version 300 es\n"],[/\btexture(2D|2DProj|Cube)Lod(EXT)?\(/g,"textureLod("],[/\btexture(2D|2DProj|Cube)(EXT)?\(/g,"texture("]],o=[...a,[f("attribute"),"in $1"],[f("varying"),"out $1"]],u=[...a,[f("varying"),"in $1"]];function l(e,t){for(let[r,i]of t)e=e.replace(r,i);return e}function f(e){return RegExp(`\\b${e}[ \\t]+(\\w+[ \\t]+\\w+(\\[\\w+\\])?;)`,"g")}var c=r(19237);function h(e,t,r="glsl"){let i="";for(let n in e){let s=e[n],a="wgsl"===r?"fn":"void";if(i+=`${a} ${s.signature} {
`,s.header&&(i+=`  ${s.header}`),t[n]){let e=t[n];for(let t of(e.sort((e,t)=>e.order-t.order),e))i+=`  ${t.injection}
`}s.footer&&(i+=`  ${s.footer}`),i+="}\n"}return i}function d(e){let t={vertex:{},fragment:{}};for(let r of e){let e,i;"string"!=typeof r?i=(e=r).hook:(e={},i=r);let n=(i=i.trim()).indexOf(":"),s=i.slice(0,n),a=i.slice(n+1),o=i.replace(/\(.+/,""),u=Object.assign(e,{signature:a});switch(s){case"vs":t.vertex[o]=u;break;case"fs":t.fragment[o]=u;break;default:throw Error(s)}}return t}var p=r(67926);let m="([a-zA-Z_][a-zA-Z0-9_]*)",g=/^\s*\#\s*if\s+(.+?)\s*(?:\/\/.*)?$/,_=RegExp(`^\\s*\\#\\s*ifdef\\s*${m}\\s*$`),b=RegExp(`^\\s*\\#\\s*ifndef\\s*${m}\\s*(?:\\/\\/.*)?$`),y=/^\s*\#\s*else\s*(?:\/\/.*)?$/,v=/^\s*\#\s*endif\s*$/,w=RegExp(`^\\s*\\#\\s*ifdef\\s*${m}\\s*(?:\\/\\/.*)?$`),E=/^\s*\#\s*endif\s*(?:\/\/.*)?$/;function x(e,t){let r=e.split("\n"),i=[],n=[],s=!0;for(let e of r){let r=e.match(g),a=e.match(w)||e.match(_),o=e.match(b),u=e.match(y),l=e.match(E)||e.match(v);if(r){let e=function(e,t){let r=e.trim();if(/^[+-]?\d+(?:\.\d+)?$/.test(r))return 0!==Number(r);if("true"===r)return!0;if("false"===r)return!1;let i=r.match(RegExp(`^!\\s*${m}$`));if(i)return!t[i[1]];let n=r.match(RegExp(`^${m}$`));if(n)return!!t[n[1]];let s=r.match(RegExp(`^defined\\s*\\(\\s*${m}\\s*\\)$`));if(s)return void 0!==t[s[1]];let a=r.match(RegExp(`^!\\s*defined\\s*\\(\\s*${m}\\s*\\)$`));if(a)return void 0===t[a[1]];throw Error(`Unsupported #if expression "${e}"`)}(r[1],t?.defines||{}),i=s&&e;n.push({parentActive:s,branchTaken:e,active:i}),s=i}else if(a||o){let e=(a||o)?.[1],r=!!t?.defines?.[e],i=a?r:!r,u=s&&i;n.push({parentActive:s,branchTaken:i,active:u}),s=u}else if(u){let e=n[n.length-1];if(!e)throw Error("Encountered #else without matching #if, #ifdef or #ifndef");e.active=e.parentActive&&!e.branchTaken,e.branchTaken=!0,s=e.active}else l?(n.pop(),s=!n.length||n[n.length-1].active):s&&i.push(e)}if(n.length>0)throw Error("Unterminated conditional block in shader source");return i.join("\n")}var S=r(44791);function A(e){let{primitiveType:t,components:r}=S.Co.getAttributeShaderTypeInfo(e),i="i32"===t?"int":"u32"===t?"uint":"float";return 1===r?i:`${"int"===i?"i":"uint"===i?"u":""}vec${r}`}function L(e){let t=[],r=/@location\s*\(\s*(\d+)\s*\)/g,i=r.exec(e);for(;i;)t.push(Number(i[1])),i=r.exec(e);return t}function P(e){let t=[],r=/(?:^|,)\s*(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:/gm,i=r.exec(e);for(;i;)t.push(i[1]),i=r.exec(e);return t}function B(e,t,r,i){let n=0,s=0,a=!1;for(let o=t;o<e.length;o++){let t=e[o],u=e[o+1];if(a){"\n"===t&&(a=!1);continue}if(s>0){"/"===t&&"*"===u?(s++,o++):"*"===t&&"/"===u&&(s--,o++);continue}if("/"===t&&"/"===u){a=!0,o++;continue}if("/"===t&&"*"===u){s=1,o++;continue}if(t===r&&n++,t===i&&0==--n)return o}return -1}function T(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}function M(e,t,r){let i=RegExp(`\\bfn\\s+${N(t)}\\s*\\(`,"g").exec(e);if(!i)throw Error(`ShaderPlugin varyings require WGSL ${r} entry point "${t}"`);let n=e.indexOf("(",i.index),s=R(e,n,"(",")"),a=e.indexOf("{",s),o=R(e,a,"{","}");if(s<0||a<0||o<0)throw Error(`Unable to parse WGSL ${r} entry point "${t}"`);return{openParenthesis:n,closeParenthesis:s,openBrace:a,closeBrace:o,parameters:e.slice(n+1,s)}}function $(e,t){let r=O(e,t);if(!r)throw Error(`Unable to find WGSL stage I/O struct "${t}"`);return r}function O(e,t){let r=RegExp(`\\bstruct\\s+${N(t)}\\s*\\{`,"g").exec(e);if(!r)return null;let i=e.indexOf("{",r.index),n=R(e,i,"{","}");return n<0?null:{openBrace:i,closeBrace:n,body:e.slice(i+1,n)}}function C(e,t,r){let i=t;if("/"===e[i]&&"/"===e[i+1]){let t=e.indexOf("\n",i+2);return t<0||t>r?r:t+1}if("/"===e[i]&&"*"===e[i+1]){let t=1;for(i+=2;i<r&&t>0;)"/"===e[i]&&"*"===e[i+1]?(t++,i+=2):"*"===e[i]&&"/"===e[i+1]?(t--,i+=2):i++}return i}function I(e){let t=[],r=/@location\s*\(\s*(\d+)\s*\)/g,i=r.exec(e);for(;i;)t.push(Number(i[1])),i=r.exec(e);return t}function k(e){let t=[],r=/(?:^|,)\s*(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:/gm,i=r.exec(e);for(;i;)t.push(i[1]),i=r.exec(e);return t}function R(e,t,r,i){let n=0,s=0,a=!1;for(let o=t;o<e.length;o++){let t=e[o],u=e[o+1];if(a){"\n"===t&&(a=!1);continue}if(s>0){"/"===t&&"*"===u?(s++,o++):"*"===t&&"/"===u&&(s--,o++);continue}if("/"===t&&"/"===u){a=!0,o++;continue}if("/"===t&&"*"===u){s=1,o++;continue}if(t===r&&n++,t===i&&0==--n)return o}return -1}function N(e){return e.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}var F=r(68062);let U=`

${s.O_}
`,z=`\
precision highp float;
`;function D(e,t){let{source:r,stage:n,language:a="glsl",modules:f,defines:m={},hookFunctions:g=[],inject:_={},pluginInjections:b={},pluginVertexInputs:y={},pluginVaryings:v={},prologue:w=!0,log:E}=t;(0,p.v)("string"==typeof r,"shader source must be a string");let x="glsl"===a?({name:function(e,t="unnamed"){let r=/#define[^\S\r\n]*SHADER_NAME[^\S\r\n]*([A-Za-z0-9_-]+)\s*/.exec(e);return r?r[1]:t}(r,void 0),language:"glsl",version:function(e){let t=100,r=e.match(/[^\s]+/g);if(r&&r.length>=2&&"#version"===r[0]){let e=parseInt(r[1],10);Number.isFinite(e)&&(t=e)}if(100!==t&&300!==t)throw Error(`Invalid GLSL version ${t}`);return t}(r)}).version:-1,L=e.shaderLanguageVersion,P=100===x?"#version 100":"#version 300 es",B=r.split("\n").slice(1).join("\n"),M={};f.forEach(e=>{Object.assign(M,e.defines)}),Object.assign(M,m);let $="";switch(a){case"wgsl":break;case"glsl":$=w?`\
${P}

// ----- PROLOGUE -------------------------
#define SHADER_TYPE_${n.toUpperCase()}

${function(e){switch(e?.gpu.toLowerCase()){case"apple":return`\
#define APPLE_GPU
// Apple optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;case"nvidia":return`\
#define NVIDIA_GPU
// Nvidia optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
`;case"intel":return`\
#define INTEL_GPU
// Intel optimizes away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Intel's built-in 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// Intel GPU doesn't have full 32 bits precision in same cases, causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`;case"amd":return`\
#define AMD_GPU
`;default:return`\
#define DEFAULT_GPU
// Prevent driver from optimizing away the calculation necessary for emulated fp64
#define LUMA_FP64_CODE_ELIMINATION_WORKAROUND 1
// Headless Chrome's software shader 'tan' function doesn't have acceptable precision
#define LUMA_FP32_TAN_PRECISION_WORKAROUND 1
// If the GPU doesn't have full 32 bits precision, will causes overflow
#define LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND 1
`}}(e)}
${"fragment"===n?z:""}

// ----- APPLICATION DEFINES -------------------------

${function(e={}){let t="";for(let r in e){let i=e[r];(i||Number.isFinite(i))&&(t+=`#define ${r.toUpperCase()} ${e[r]}
`)}return t}(M)}

`:`${P}
`}let O=d(g),C={},I={},k={};for(let e in j(b,C,I,k),_){let t="string"==typeof _[e]?{injection:_[e],order:0}:_[e],r=/^(v|f)s:(#)?([\w-]+)$/.exec(e);if(r){let i=r[2],n=r[3];i?"decl"===n?I[e]=[t]:k[e]=[t]:C[e]=[t]}else k[e]=[t]}if("vertex"===n){let e=function(e,t){let r=[];for(let[i,n]of Object.entries(t))(function(e,t){let r=T(t);if(RegExp(`\\b(?:in|attribute)\\s+(?:(?:lowp|mediump|highp)\\s+)?[A-Za-z_][A-Za-z0-9_]*\\s+${r}\\s*(?:\\[|;)`).test(e))throw Error(`ShaderPlugin vertex input "${t}" conflicts with an existing GLSL input`)})(e,i),r.push(`in ${A(n)} ${i};`);return r.join("\n")}(B,y);e&&(I["vs:#decl"]=I["vs:#decl"]||[],I["vs:#decl"].push({injection:e,order:Number.MIN_SAFE_INTEGER}))}let R=function(e,t,r){let i=[],n=[];for(let[o,u]of Object.entries(r)){var s=e,a=o;if(RegExp(`\\b(?:flat\\s+|smooth\\s+)?(?:in|out|varying)\\s+(?:(?:lowp|mediump|highp)\\s+)?[A-Za-z_][A-Za-z0-9_]*\\s+${N(a)}\\s*(?:\\[|;)`).test(s))throw Error(`ShaderPlugin varying "${a}" conflicts with existing GLSL stage I/O`);let r="flat"===u.interpolation?"flat ":"",l="vertex"===t?"out":"in";i.push(`${r}${l} ${A(u.type)} ${o};`),"vertex"===t&&n.push(`${o} = ${function(e){let{primitiveType:t,components:r}=S.Co.getAttributeShaderTypeInfo(e),i="u32"===t?"0u":"i32"===t?"0":"0.0";return 1===r?i:`${A(e)}(${i})`}(u.type)};`)}return{declarations:i.join("\n"),initialization:n.join("\n")}}(B,n,v);if(R.declarations){let e="vertex"===n?"vs:#decl":"fs:#decl";I[e]=I[e]||[],I[e].push({injection:R.declarations,order:Number.MIN_SAFE_INTEGER})}for(let e of(R.initialization&&(k["vs:#main-start"]=k["vs:#main-start"]||[],k["vs:#main-start"].push({injection:R.initialization,order:Number.MIN_SAFE_INTEGER})),f)){E&&(0,i.ZG)(e,B,E),$+=W(e,n,E);let t=e.instance?.normalizedInjections[n]||{};for(let e in t){let r=/^(v|f)s:#([\w-]+)$/.exec(e);if(r){let i="decl"===r[2]?I:k;i[e]=i[e]||[],i[e].push(t[e])}else C[e]=C[e]||[],C[e].push(t[e])}}return $+="// ----- MAIN SHADER SOURCE -------------------------",$+=U,$=(0,s.bv)($,n,I)+h(O[n],C)+B,$=(0,s.bv)($,n,k),"glsl"===a&&x!==L&&($=function(e,t){if(300!==Number(e.match(/^#version[ \t]+(\d+)/m)?.[1]||100))throw Error("luma.gl v9 only supports GLSL 3.00 shader sources");switch(t){case"vertex":return l(e,o);case"fragment":return l(e,u);default:throw Error(t)}}($,n)),"glsl"===a&&(0,c.N1)($,n,E),$.trim()}function V(e){return function(t){let r={};for(let i of e){let e=i.getUniforms?.(t,r);Object.assign(r,e)}return r}}function j(e,t,r,i){for(let n in e){let s=/^(v|f)s:(#)?([\w-]+)$/.exec(n);if(s){let a=s[2],o=s[3],u=a?"decl"===o?r:i:t;u[n]=u[n]||[],u[n].push(...e[n])}else i[n]=i[n]||[],i[n].push(...e[n])}}function W(e,t,r){let i;switch(t){case"vertex":i=e.vs||"";break;case"fragment":i=e.fs||"";break;case"wgsl":i=e.source||"";break;default:(0,p.v)(!1)}if(!e.name)throw Error("Shader module must have a name");(0,c.mY)(e,t,{log:r});let n=e.name.toUpperCase().replace(/[^0-9a-z]/gi,"_"),s=`\
// ----- MODULE ${e.name} ---------------

`;return"wgsl"!==t&&(s+=`#define MODULE_${n}
`),s+=`${i}
`}function G(e,t,r,i){let n=e.get(t);if(!n)return!1;let s=n.get(r);if(!s)return!1;if(s!==i)throw Error(`Registered module binding "${i}" collided with "${s}": group ${t}, binding ${r}.`);return n.delete(r),!0}function q(e,t,r){if(0===e&&t>=100)throw Error(`Application binding "${r}" in group 0 uses reserved binding ${t}. Application-owned explicit group-0 bindings must stay below 100.`)}function H(e,t,r,i){if(0===t&&r<100)throw Error(`Module "${e}" binding "${i}" in group 0 uses reserved application binding ${r}. Module-owned explicit group-0 bindings must be 100 or higher.`)}function Y(e,t,r,i){let n=e.get(t)||new Set;if(n.has(r))throw Error(`Duplicate WGSL binding assignment for ${i}: group ${t}, binding ${r}.`);n.add(r),e.set(t,n)}function X(e,t,r){return`${e}:${t}:${r}`}let Z=[RegExp(`@binding\\(\\s*(\\d+)\\s*\\)\\s*@group\\(\\s*(\\d+)\\s*\\)\\s*${F.Qw}\\s*:\\s*([^;]+);`,"g"),RegExp(`@group\\(\\s*(\\d+)\\s*\\)\\s*@binding\\(\\s*(\\d+)\\s*\\)\\s*${F.Qw}\\s*:\\s*([^;]+);`,"g")];function K(e,t,r){return`${t}:${r}:${e}`}function Q(e){return e.includes("cube_array")?"cube-array":e.includes("2d_array")?"2d-array":e.includes("cube")?"cube":e.includes("3d")?"3d":e.includes("2d")?"2d":e.includes("1d")?"1d":void 0}var J=r(3180);class ee{static defaultShaderAssemblers={};_shaderTranspilers=new Map;_hookFunctions=[];_defaultModules=[];static getDefaultShaderAssembler(e){return((0,p.v)("glsl"===e||"wgsl"===e),"wgsl"===e)?(ee.defaultShaderAssemblers.wgsl=ee.defaultShaderAssemblers.wgsl||new er,ee.defaultShaderAssemblers.wgsl):(ee.defaultShaderAssemblers.glsl=ee.defaultShaderAssemblers.glsl||new et,ee.defaultShaderAssemblers.glsl)}addShaderTranspiler(e){this._shaderTranspilers.set(e.sourceLanguage,e)}removeShaderTranspiler(e){this._shaderTranspilers.delete(e)}_transpileShader(e,t,r,i){let s=e.sourceLanguage||this.shaderLanguage;if(s===this.shaderLanguage)return(0,p.v)(!(0,n.$Q)(t).some(e=>e.sourceLanguage&&e.sourceLanguage!==this.shaderLanguage)),{code:r||"",modules:t};let a=this._shaderTranspilers.get(s);(0,p.v)(a);let o=(0,n.$Q)(t);(0,p.v)(!o.some(e=>e.sourceLanguage&&e.sourceLanguage!==s&&e.sourceLanguage!==this.shaderLanguage));let u=o.filter(e=>e.sourceLanguage===s).map(e=>e.source||"").join("\n"),l={vertex:e.vertexEntryPoint,fragment:e.fragmentEntryPoint,compute:e.computeEntryPoint},f=null==r?{code:""}:a.transpile({source:[u,r].filter(Boolean).join("\n"),target:this.shaderLanguage,stage:i,entryPoints:l,platformInfo:e.platformInfo}),c=o.map(e=>({...e,dependencies:void 0,...e.sourceLanguage===s?{source:void 0,vs:void 0,fs:void 0}:{}}));return{...f,modules:c}}addDefaultModule(e){this._defaultModules.find(t=>t.name===("string"==typeof e?e:e.name))||this._defaultModules.push(e)}removeDefaultModule(e){let t="string"==typeof e?e:e.name;this._defaultModules=this._defaultModules.filter(e=>e.name!==t)}addShaderHook(e,t){this._hookFunctions.push(t?{...t,hook:e}:e)}_getModuleList(e=[]){let t=Array(this._defaultModules.length+e.length),r={},n=0;for(let e=0,i=this._defaultModules.length;e<i;++e){let i=this._defaultModules[e],s=i.name;t[n++]=i,r[s]=!0}for(let i=0,s=e.length;i<s;++i){let s=e[i],a=s.name;r[a]||(t[n++]=s,r[a]=!0)}return t.length=n,(0,i.$g)(t),t}}class et extends ee{shaderLanguage="glsl";assembleGLSLShaderPair(e){let t=this._getModuleList(e.modules),r=this._hookFunctions,i=this._transpileShader(e,t,e.vs,"vertex"),s=this._transpileShader(e,t,e.fs,"fragment");return{...function(e){let{vs:t,fs:r}=e,i=(0,n.$Q)(e.modules||[]);return{vs:D(e.platformInfo,{...e,source:t,stage:"vertex",modules:i}),fs:D(e.platformInfo,{...e,source:r,stage:"fragment",modules:i}),getUniforms:V(i)}}({...e,vs:i.code,fs:null==e.fs?void 0:s.code,modules:i.modules,hookFunctions:r}),modules:t}}}class er extends ee{shaderLanguage="wgsl";_wgslBindingRegistry=new Map;assembleWGSLShader(e){let t=this._getModuleList(e.modules),r=this._hookFunctions,a=this._transpileShader(e,t,e.source,e.shaderStage??(e.computeEntryPoint?"compute":void 0)),o={vertex:a.entryPoints?.vertex??e.vertexEntryPoint,fragment:a.entryPoints?.fragment??e.fragmentEntryPoint,compute:a.entryPoints?.compute??e.computeEntryPoint},u=er.getShaderPreprocessorDefines(e,t),l="wgsl"===e.platformInfo.shaderLanguage&&a.code?x(a.code,{defines:u}):a.code,{source:f,getUniforms:c,bindingAssignments:m}=function(e){let t=(0,n.$Q)(e.modules||[]),{source:r,bindingAssignments:a}=function(e,t){var r,n,a,o,u,l,f,c,m,g,_;let b,{source:y,stage:v,modules:w,defines:E={},hookFunctions:A=[],inject:z={},pluginInjections:D={},pluginVertexInputs:V={},pluginVaryings:Z={},vertexEntryPoint:K="vertexMain",fragmentEntryPoint:Q="fragmentMain",log:J}=t;(0,p.v)("string"==typeof y,"shader source must be a string");let ee=function(e,t,r){let i=Object.entries(r);if(0===i.length)return{source:e,declarations:"",initialization:""};let n=function(e,t){let r=RegExp(`\\bfn\\s+${T(t)}\\s*\\(`,"g").exec(e);if(!r)throw Error(`ShaderPlugin vertex inputs require WGSL vertex entry point "${t}"`);let i=e.indexOf("(",r.index),n=B(e,i,"(",")");if(n<0)throw Error(`Unable to parse WGSL vertex entry point "${t}" parameters`);return{openParenthesis:i,closeParenthesis:n}}(e,t),s=e.slice(n.openParenthesis+1,n.closeParenthesis),a=function(e,t){let r=L(t),i=new Set(P(t));for(let n of function(e){let t=[],r=/:\s*([A-Za-z_][\w]*)\b/g,i=r.exec(e);for(;i;)t.push(i[1]),i=r.exec(e);return t}(t)){let t=function(e,t){let r=RegExp(`\\bstruct\\s+${T(t)}\\s*\\{`,"g").exec(e);if(!r)return null;let i=e.indexOf("{",r.index),n=B(e,i,"{","}");return n<0?null:e.slice(i+1,n)}(e,n);if(null!==t)for(let e of(r.push(...L(t)),P(t)))i.add(e)}return{locations:r,names:i}}(e,s),o=new Set(a.locations),u=[],l=[],f=[];for(let[t,r]of i){if(a.names.has(t)||function(e,t){let r=T(t),i=RegExp(`\\b(?:var(?:<[^>]+>)?|let|const)\\s+${r}\\b`,"g"),n=i.exec(e);for(;n;){if(0===function(e,t){let r=0,i=0,n=!1;for(let s=0;s<t;s++){let t=e[s],a=e[s+1];if(n){"\n"===t&&(n=!1);continue}if(i>0){"/"===t&&"*"===a?(i++,s++):"*"===t&&"/"===a&&(i--,s++);continue}"/"===t&&"/"===a?(n=!0,s++):"/"===t&&"*"===a?(i=1,s++):"{"===t?r++:"}"===t&&r--}return r}(e,n.index))return!0;n=i.exec(e)}return!1}(e,t))throw Error(`ShaderPlugin vertex input "${t}" conflicts with an existing WGSL shader input or variable`);let i=function(e){let t=0;for(;e.has(t);)t++;return t}(o);o.add(i);let n=`_luma_${t}`;u.push(`@location(${i}) ${n}: ${r}`),l.push(`var<private> ${t}: ${r};`),f.push(`${t} = ${n};`)}let c=s.trim()?",\n  ":"\n  ",h=s.trim()?"":"\n",d=`${s}${c}${u.join(",\n  ")}${h}`;return{source:e.slice(0,n.openParenthesis+1)+d+e.slice(n.closeParenthesis),declarations:l.join("\n"),initialization:f.join("\n")}}(x(y,{defines:E}),K,V),et=function(e,t,r,i){let n=Object.entries(i);if(0===n.length)return{source:e,declarations:"",vertexInitialization:"",fragmentInitialization:""};let s=e,a=M(s,t,"vertex"),o=function(e,t){let r=e.slice(t.closeParenthesis+1,t.openBrace),i=/->\s*([A-Za-z_][\w]*)\s*$/.exec(r.trim());if(!i||null===O(e,i[1]))throw Error("ShaderPlugin varyings require the WGSL vertex entry point to return a named struct");return i[1]}(s,a),u=M(s,r,"fragment"),l=function(e,t){let r=[];for(let i of function(e){let t=[],r=0,i=0,n=0;for(let s=0;s<e.length;s++){let a=e[s];"("===a&&i++,")"===a&&i--,"<"===a&&n++,">"===a&&n--,","===a&&0===i&&0===n&&(t.push(e.slice(r,s)),r=s+1)}return t.push(e.slice(r)),t}(t.parameters)){let t=/(?:@[A-Za-z_][\w]*(?:\([^)]*\))?\s*)*([A-Za-z_][\w]*)\s*:\s*([A-Za-z_][\w]*)\s*$/.exec(i.trim());t&&O(e,t[2])&&r.push({name:t[1],type:t[2]})}if(1!==r.length)throw Error(`ShaderPlugin varyings require exactly one named WGSL fragment input struct; found ${r.length}`);return r[0]}(s,u),f=$(s,o),c=$(s,l.type),h=new Set([...k(a.parameters),...k(f.body),...k(u.parameters),...k(c.body)]),d=new Set([...I(f.body),...I(c.body)]),p=[],m=[],g=[],_=[];for(let[e,t]of n){if(h.has(e)||function(e,t){let r=RegExp(`\\b(?:var(?:<[^>]+>)?|let|const)\\s+${N(t)}\\b`,"g"),i=r.exec(e);for(;i;){if(0===function(e,t){let r=0;for(let i=0;i<t;i++){let n=C(e,i,t);if(n!==i){i=n-1;continue}"{"===e[i]&&r++,"}"===e[i]&&r--}return r}(e,i.index))return!0;i=r.exec(e)}return!1}(s,e))throw Error(`ShaderPlugin varying "${e}" conflicts with existing WGSL stage I/O or a module variable`);let r=function(e){let t=0;for(;e.has(t);)t++;return t}(d);d.add(r);let i="flat"===t.interpolation?" @interpolate(flat)":"";p.push(`  @location(${r})${i} ${e}: ${t.type},`),m.push(`var<private> ${e}: ${t.type};`),g.push(`${e} = ${function(e){let{primitiveType:t,components:r}=S.Co.getAttributeShaderTypeInfo(e),i=`${t}(0)`;return 1===r?i:`${e}(${i})`}(t.type)};`),_.push(`${e} = ${l.name}.${e};`)}for(let e of(function(e,t,r,i){let n=RegExp(`\\b${N(t)}\\s*\\(`,"g"),s=n.exec(e);for(;s;){if(s.index<r||s.index>i)throw Error(`ShaderPlugin varying output struct "${t}" is constructed outside the selected vertex entry point`);s=n.exec(e)}}(s,o,a.openBrace,a.closeBrace),a=M(s=function(e,t,r,i){let n=RegExp(`\\b${N(t)}\\s*\\(`,"g"),s=[],a=n.exec(e);for(;a;){if(a.index>r.openBrace&&a.index<r.closeBrace){let i=e.indexOf("(",a.index),n=R(e,i,"(",")");if(n<0||n>r.closeBrace)throw Error(`Unable to parse WGSL output constructor "${t}"`);s.push({openParenthesis:i,closeParenthesis:n})}a=n.exec(e)}for(let t of s.sort((e,t)=>t.closeParenthesis-e.closeParenthesis)){let r=e.slice(t.openParenthesis+1,t.closeParenthesis).trim()?", ":"";e=e.slice(0,t.closeParenthesis)+r+i.join(", ")+e.slice(t.closeParenthesis)}return e}(s,o,a,n.map(([e])=>e)),t,"vertex"),s=function(e,t,r){let i=function(e,t,r){let i=[],n=t;for(;n<r;)if(n=C(e,n,r),"return"!==e.slice(n,n+6)||/[A-Za-z0-9_]/.test(e[n+6]||""))n++;else{let t=n+6,s=function(e,t,r){let i=0,n=0;for(let s=t;s<r;s++){let t=C(e,s,r);if(t!==s){s=t-1;continue}let a=e[s];if("("===a&&i++,")"===a&&i--,"["===a&&n++,"]"===a&&n--,";"===a&&0===i&&0===n)return s}return -1}(e,t,r);if(s<0)throw Error("Unable to parse WGSL return statement in selected vertex entry point");i.push({start:n,expressionStart:t,semicolon:s}),n=s+1}return i}(e,t.openBrace+1,t.closeBrace);for(let t=i.length-1;t>=0;t--){let n=i[t],s=e.slice(n.expressionStart,n.semicolon).trim();if(!s)throw Error("ShaderPlugin varying vertex entry point cannot use an empty return");let a=`_luma_vertexOutput${t}`,o=r.map(e=>`${a}.${e} = ${e};`).join("\n"),u=`{
var ${a} = ${s};
${o}
return ${a};
}`;e=e.slice(0,n.start)+u+e.slice(n.semicolon+1)}return e}(s,a,n.map(([e])=>e)),(o===l.type?[o]:[o,l.type]).map(e=>$(s,e).closeBrace).sort((e,t)=>t-e)))s=s.slice(0,e)+`${p.join("\n")}
`+s.slice(e);if(u=M(s,r,"fragment"),!RegExp(`\\b${N(l.name)}\\s*:`).test(u.parameters))throw Error(`Unable to preserve WGSL fragment input "${l.name}"`);return{source:s,declarations:m.join("\n"),vertexInitialization:g.join("\n"),fragmentInitialization:_.join("\n")}}(ee.source,K,Q,Z),er=et.source,ei="",en=d(A),es={},ea={},eo={};for(let e in j(D,es,ea,eo),z){let t="string"==typeof z[e]?{injection:z[e],order:0}:z[e],r=/^(v|f)s:(#)?([\w-]+)$/.exec(e);if(r){let i=r[2],n=r[3];i?"decl"===n?ea[e]=[t]:eo[e]=[t]:es[e]=[t]}else eo[e]=[t]}r=ee.declarations,n=ee.initialization,a=ea,o=eo,r&&(a["vs:#decl"]=a["vs:#decl"]||[],a["vs:#decl"].push({injection:r,order:Number.MIN_SAFE_INTEGER})),n&&(o["vs:#main-start"]=o["vs:#main-start"]||[],o["vs:#main-start"].push({injection:n,order:Number.MIN_SAFE_INTEGER})),u=et,l=ea,f=eo,u.declarations&&(l["vs:#decl"]=l["vs:#decl"]||[],l["vs:#decl"].push({injection:u.declarations,order:Number.MIN_SAFE_INTEGER})),u.vertexInitialization&&(f["vs:#main-start"]=f["vs:#main-start"]||[],f["vs:#main-start"].push({injection:u.vertexInitialization,order:Number.MIN_SAFE_INTEGER})),u.fragmentInitialization&&(f["fs:#main-start"]=f["fs:#main-start"]||[],f["fs:#main-start"].push({injection:u.fragmentInitialization,order:Number.MIN_SAFE_INTEGER}));let eu=w.map(e=>({module:e,source:x(W(e,"wgsl",J),{defines:E})})),el=function(e){let t=(0,F.M8)(e,F.z9),r=new Map;for(let e of t){if("auto"===e.bindingToken)continue;let t=Number(e.bindingToken),i=Number(e.groupToken);q(i,t,e.name),Y(r,i,t,`application binding "${e.name}"`)}let i={sawSupportedBindingDeclaration:t.length>0},n=(0,F.u5)(e,F.z9,e=>(function(e,t,r){let{match:i,bindingToken:n,groupToken:s,name:a}=e,o=Number(s);if("auto"===n){let e=function(e,t){let r=t.get(e)||new Set,i=0;for(;r.has(i);)i++;return i}(o,t);return q(o,e,a),Y(t,o,e,`application binding "${a}"`),i.replace(/@binding\(\s*auto\s*\)/,`@binding(${e})`)}return r.sawSupportedBindingDeclaration=!0,i})(e,r,i));if((0,F.CH)(e)&&!i.sawSupportedBindingDeclaration)throw Error('Unsupported @binding(auto) declaration form in application WGSL. Use adjacent "@group(N)" and "@binding(auto)" decorators followed by a bindable "var" declaration.');return{source:n}}(er),ef=function(e){let t=new Map;for(let r of(0,F.M8)(e,F.q2)){let e=Number(r.bindingToken),i=Number(r.groupToken);q(i,e,r.name),Y(t,i,e,`application binding "${r.name}"`)}return t}(el.source),ec=function(e,t,r){let i=new Map,n=[];function s(e,t,n,s){Y(r,e,t,s);let a=i.get(e)||new Map;a.set(t,n),i.set(e,a)}for(let{module:t,source:r}of e)for(let e of(0,F.M8)(r,F.eB)){let r=Number(e.groupToken);if("auto"===e.bindingToken){n.push({module:t,name:e.name,group:r});continue}let i=Number(e.bindingToken);H(t.name,r,i,e.name),s(r,i,X(r,t.name,e.name),`module "${t.name}" binding "${e.name}"`)}for(let{module:e,name:r,group:i}of n){let n=X(i,e.name,r),a=t?.get(n);void 0!==a&&s(i,a,n,`registered module binding "${n}"`)}return i}(eu,t._bindingRegistry,ef),eh=[];for(let{module:e,source:r}of eu.map(({module:e,source:r})=>{let i=function(e,t,r){let i=[],n={sawSupportedBindingDeclaration:(0,F.M8)(e,F.eB).length>0,nextHintedBindingLocation:"number"==typeof t.firstBindingSlot?t.firstBindingSlot:null},s=(0,F.u5)(e,F.eB,e=>(function(e,t){let{module:r,context:i,bindingAssignments:n,relocationState:s}=t,{match:a,bindingToken:o,groupToken:u,name:l}=e,f=Number(u);if("auto"===o){let e=X(f,r.name,l),t=i.bindingRegistry?.get(e),o=void 0!==t?t:function(e,t,r,i,n){let s=t.get(e)||new Set,a=new Set,o=`${e}:`,u=`${o}${r}:`;for(let[e,t]of n||[])e.startsWith(u)&&a.add(t);let l=i??(0===e?100:s.size>0?Math.max(...s)+1:0);for(;s.has(l)||a.has(l);)l++;for(let[e,t]of n||[])t===l&&e.startsWith(o)&&n?.delete(e);return l}(f,i.usedBindingsByGroup,r.name,s.nextHintedBindingLocation??void 0,i.bindingRegistry);return(H(r.name,f,o,l),void 0!==t&&G(i.reservedBindingKeysByGroup,f,o,e))?n.push({moduleName:r.name,name:l,group:f,location:o}):(Y(i.usedBindingsByGroup,f,o,`module "${r.name}" binding "${l}"`),i.bindingRegistry?.set(e,o),n.push({moduleName:r.name,name:l,group:f,location:o}),null!==s.nextHintedBindingLocation&&void 0===t&&(s.nextHintedBindingLocation=o+1)),a.replace(/@binding\(\s*auto\s*\)/,`@binding(${o})`)}let c=Number(o);H(r.name,f,c,l);let h=X(f,r.name,l);return G(i.reservedBindingKeysByGroup,f,c,h)||Y(i.usedBindingsByGroup,f,c,`module "${r.name}" binding "${l}"`),n.push({moduleName:r.name,name:l,group:f,location:c}),a})(e,{module:t,context:r,bindingAssignments:i,relocationState:n}));if((0,F.CH)(e)&&!n.sawSupportedBindingDeclaration)throw Error(`Unsupported @binding(auto) declaration form in module "${t.name}". Use adjacent "@group(N)" and "@binding(auto)" decorators followed by a bindable "var" declaration.`);return{source:s,bindingAssignments:i}}(r,e,{usedBindingsByGroup:ef,bindingRegistry:t._bindingRegistry,reservedBindingKeysByGroup:ec});return eh.push(...i.bindingAssignments),{module:e,source:i.source}})){J&&(0,i.ZG)(e,er,J),ei+=r;let t=(c=e,{...c.instance?.normalizedInjections.vertex||{},...c.instance?.normalizedInjections.fragment||{}});for(let e in t){let r=/^(v|f)s:#([\w-]+)$/.exec(e);if(r){let i="decl"===r[2]?ea:eo;i[e]=i[e]||[],i[e].push(t[e])}else es[e]=es[e]||[],es[e].push(t[e])}}return ei+=U,ei=(0,s.bv)(ei,v,(b=[...(m=ea)["vs:#decl"]||[],...m["fs:#decl"]||[]]).length?{"vs:#decl":b}:{},!1,"wgsl",{vertex:K,fragment:Q})+(g=en,_=es,h(g.vertex,_,"wgsl")+h(g.fragment,_,"wgsl"))+function(e){if(0===e.length)return"";let t="// ----- MODULE WGSL BINDING ASSIGNMENTS ---------------\n";for(let r of e)t+=`// ${r.moduleName}.${r.name} -> @group(${r.group}) @binding(${r.location})
`;return t+"\n"}(eh)+el.source,function(e){var t,r;let i,n=(0,F.lh)(e,F.eB);if(!n)return;let s=function(e,t){let r,i,n=/^\/\/ ----- MODULE ([^\n]+) ---------------$/gm;for(i=n.exec(e);i&&i.index<=t;)r=i[1],i=n.exec(e);return r}(e,n.index);if(s)throw Error(`Unresolved @binding(auto) for module "${s}" binding "${n.name}" remained in assembled WGSL source.`);if(t=e,r=n.index,!((i=t.indexOf(U))>=0)||r>i)throw Error(`Unresolved @binding(auto) for application binding "${n.name}" remained in assembled WGSL source.`);throw Error(`Unresolved @binding(auto) remained in assembled WGSL source near "${n.match.replace(/\s+/g," ").trim()}".`)}(ei=(0,s.bv)(ei,v,eo,!1,"wgsl",{vertex:K,fragment:Q})),{source:ei,bindingAssignments:eh}}(e.platformInfo,{...e,source:e.source,stage:"vertex",modules:t});return{source:r,getUniforms:V(t),bindingAssignments:a}}({...e,source:l,vertexEntryPoint:o.vertex,fragmentEntryPoint:o.fragment,defines:u,_bindingRegistry:this._wgslBindingRegistry,modules:a.modules,hookFunctions:r}),g="wgsl"===e.platformInfo.shaderLanguage?x(f,{defines:u}):f;return{source:g,entryPoints:o,getUniforms:c,modules:t,bindingAssignments:m,bindingTable:function(e,t=[]){let r=(0,F.mh)(e),i=new Map;for(let e of t)i.set(K(e.name,e.group,e.location),e.moduleName);let n=[];for(let e of Z){let t;for(e.lastIndex=0,t=e.exec(r);t;){let s=e===Z[0],a=Number(t[s?1:2]),o=Number(t[s?2:1]),u=t[3]?.trim(),l=t[4],f=t[5].trim(),c=i.get(K(l,o,a));n.push(function(e){var t;let r={name:e.name,group:e.group,binding:e.binding,owner:e.owner,kind:"unknown",moduleName:e.moduleName,resourceType:e.resourceType};if(e.accessDeclaration){let t=e.accessDeclaration.split(",").map(e=>e.trim());if("uniform"===t[0])return{...r,kind:"uniform",access:"uniform"};if("storage"===t[0]){let e=t[1]||"read_write";return{...r,kind:"read"===e?"read-only-storage":"storage",access:e}}}return"sampler"===e.resourceType||"sampler_comparison"===e.resourceType?{...r,kind:"sampler",samplerKind:"sampler_comparison"===e.resourceType?"comparison":"filtering"}:e.resourceType.startsWith("texture_storage_")?{...r,kind:"storage-texture",access:function(e){let t=/,\s*([A-Za-z_][A-Za-z0-9_]*)\s*>$/.exec(e);return t?.[1]}(e.resourceType),viewDimension:Q(e.resourceType)}:e.resourceType.startsWith("texture_")?{...r,kind:"texture",viewDimension:Q(e.resourceType),sampleType:(t=e.resourceType).startsWith("texture_depth_")?"depth":t.includes("<i32>")?"sint":t.includes("<u32>")?"uint":t.includes("<f32>")?"float":void 0,multisampled:e.resourceType.startsWith("texture_multisampled_")}:r}({name:l,group:o,binding:a,owner:c?"module":"application",moduleName:c,accessDeclaration:u,resourceType:f})),t=e.exec(r)}}return n.sort((e,t)=>e.group!==t.group?e.group-t.group:e.binding!==t.binding?e.binding-t.binding:e.name.localeCompare(t.name))}(g,m),shaderLayout:(0,J.A)(g,{vertexEntryPoint:o.vertex,scanVertexAttributes:e.scanVertexAttributes})}}static getShaderPreprocessorDefines(e,t){return{...er.getPlatformPreprocessorDefines(e.platformInfo),...t.reduce((e,t)=>(Object.assign(e,t.defines),e),{}),...e.defines}}static getPlatformPreprocessorDefines(e){let t=e.limits||{};return{LUMA_SUPPORTS_VERTEX_STORAGE_BUFFERS:"webgpu"===e.type&&(t.maxStorageBuffersInVertexStage||0)>0,LUMA_FP32_TAN_PRECISION_WORKAROUND:"webgpu"===e.type&&"nvidia"!==e.gpu.toLowerCase()&&"amd"!==e.gpu.toLowerCase(),LUMA_FP64_INTEGER_ARITHMETIC:"webgpu"===e.type&&"apple"===e.gpu.toLowerCase()}}}},31770(e,t,r){r.d(t,{O_:()=>o,bv:()=>l,Uu:()=>u});let i={vertex:`\
#ifdef MODULE_LOGDEPTH
  logdepth_adjustPosition(gl_Position);
#endif
`,fragment:`\
#ifdef MODULE_MATERIAL
  fragColor = material_filterColor(fragColor);
#endif

#ifdef MODULE_LIGHTING
  fragColor = lighting_filterColor(fragColor);
#endif

#ifdef MODULE_FOG
  fragColor = fog_filterColor(fragColor);
#endif

#ifdef MODULE_PICKING
  fragColor = picking_filterHighlightColor(fragColor);
  fragColor = picking_filterPickingColor(fragColor);
#endif

#ifdef MODULE_LOGDEPTH
  logdepth_setFragDepth();
#endif
`},n=/void\s+main\s*\([^)]*\)\s*\{\n?/,s=/}\n?[^{}]*$/,a=[],o="__LUMA_INJECT_DECLARATIONS__";function u(e){let t={vertex:{},fragment:{}};for(let r in e){let i=e[r];"string"==typeof i&&(i={order:0,injection:i}),t[function(e){let t=e.slice(0,2);switch(t){case"vs":return"vertex";case"fs":return"fragment";default:throw Error(t)}}(r)][r]=i}return t}function l(e,t,r,u=!1,c="glsl",h={}){let d="vertex"===t;for(let t in r){let i=r[t];i.sort((e,t)=>e.order-t.order),a.length=i.length;for(let e=0,t=i.length;e<t;++e)a[e]=i[e].injection;let u=`${a.join("\n")}
`;switch(t){case"vs:#decl":("wgsl"===c||d)&&(e=e.replace(o,u));break;case"vs:#main-start":("wgsl"===c||d)&&(e="wgsl"===c?f(e,"vertex",u,"start",h.vertex):e.replace(n,e=>e+u));break;case"vs:#main-end":("wgsl"===c||d)&&(e="wgsl"===c?f(e,"vertex",u,"end",h.vertex):e.replace(s,e=>u+e));break;case"fs:#decl":"wgsl"!==c&&d||(e=e.replace(o,u));break;case"fs:#main-start":"wgsl"!==c&&d||(e="wgsl"===c?f(e,"fragment",u,"start",h.fragment):e.replace(n,e=>e+u));break;case"fs:#main-end":"wgsl"!==c&&d||(e="wgsl"===c?f(e,"fragment",u,"end",h.fragment):e.replace(s,e=>u+e));break;default:e=e.replace(t,e=>e+u)}}return e=e.replace(o,""),u&&(e=e.replace(/\}\s*$/,e=>e+i[t])),e}function f(e,t,r,i,n){let s=function(e,t,r){let i="vertex"===t?"@vertex":"@fragment",n=e.indexOf(i);if(n<0)return null;let s=r?e.search(RegExp(`\\bfn\\s+${r.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*\\(`)):e.indexOf("fn",n);if(s<0)return null;let a=e.indexOf("{",s);if(a<0)return null;let o=0;for(let t=a;t<e.length;t++){let r=e[t];if("{"===r)o++;else if("}"===r&&0==--o)return{openBraceIndex:a,closeBraceIndex:t}}return null}(e,t,n);if(!s)return e;if("start"===i){let t=s.openBraceIndex+1;return`${e.slice(0,t)}
${r}${e.slice(t)}`}return`${e.slice(0,s.closeBraceIndex)}${r}${e.slice(s.closeBraceIndex)}`}},65261(e,t,r){r.d(t,{$Q:()=>s});var i=r(72560),n=r(67926);function s(e){let t=new Set,r=new Set,s=[],a=new Map;for(let i of e)!function e(i,n){if(r.has(i)){let e=[...n,i.name].join(" -> ");throw Error(`Shader module dependency cycle detected: ${e}`)}if(t.has(i))return;let o=a.get(i.name);if(o&&o!==i)throw Error(`Shader module name collision: Multiple different module objects share the name "${i.name}". Each module object must have a unique name.`);a.set(i.name,i),r.add(i);let u=[...n,i.name];if(i.dependencies)for(let t of i.dependencies)e(t,u);r.delete(i),t.add(i),s.push(i)}(i,[]);let o=new Set;for(let e of s)void 0!==e.implements&&((0,n.v)(!o.has(e.implements)),o.add(e.implements));return(0,i.$g)(s),s}},19237(e,t,r){r.d(t,{N1:()=>l,Uj:()=>a,V$:()=>u,mY:()=>o});var i=r(67926);let n=/^(?:uniform\s+)?(?:(?:lowp|mediump|highp)\s+)?[A-Za-z0-9_]+(?:<[^>]+>)?\s+([A-Za-z0-9_]+)(?:\s*\[[^\]]+\])?\s*;/,s=/((?:layout\s*\([^)]*\)\s*)*)uniform\s+([A-Za-z_][A-Za-z0-9_]*)\s*\{([\s\S]*?)\}\s*([A-Za-z_][A-Za-z0-9_]*)?\s*;/g;function a(e){return`${e.name}Uniforms`}function o(e,t,r={}){let s=function(e,t){let r,i=Object.keys(e.uniformTypes||{});if(!i.length)return null;let s=(r="wgsl"===t?e.source:"vertex"===t?e.vs:e.fs)?function(e,t,r){var i,s;let a,o="wgsl"===t?function(e,t){let r=RegExp(`\\bstruct\\s+${t}\\b`,"m").exec(e);if(!r)return null;let i=e.indexOf("{",r.index);if(i<0)return null;let n=0;for(let t=i;t<e.length;t++){let r=e[t];if("{"===r){n++;continue}if("}"===r&&0==--n)return e.slice(i+1,t)}return null}(e,r):(i=e,s=r,a=u(i).find(e=>e.blockName===s),a?.body||null);if(!o)return null;let l=[];for(let e of o.split("\n")){let r=e.replace(/\/\/.*$/,"").trim();if(!r||r.startsWith("#"))continue;let i="wgsl"===t?r.match(/^([A-Za-z0-9_]+)\s*:/):r.match(n);i&&l.push(i[1])}return l}(r,"wgsl"===t?"wgsl":"glsl",a(e)):null;return s?{moduleName:e.name,uniformBlockName:a(e),stage:t,expectedUniformNames:i,actualUniformNames:s,matches:function(e,t){if(e.length!==t.length)return!1;for(let r=0;r<e.length;r++)if(e[r]!==t[r])return!1;return!0}(i,s)}:null}(e,t);if(!s||s.matches)return s;let l=function(e){let{expectedUniformNames:t,actualUniformNames:r}=e,i=t.filter(e=>!r.includes(e)),n=r.filter(e=>!t.includes(e)),s=[`Expected ${t.length} fields, found ${r.length}.`],a=function(e,t){let r=Math.min(e.length,t.length);for(let i=0;i<r;i++)if(e[i]!==t[i])return`First mismatch at field ${i+1}: expected ${e[i]}, found ${t[i]}.`;return e.length>t.length?`Shader block ends after field ${t.length}; expected next field ${e[t.length]}.`:t.length>e.length?`Shader block has extra field ${t.length}: ${t[e.length]}.`:null}(t,r);return a&&s.push(a),i.length&&s.push(`Missing from shader block (${i.length}): ${f(i)}.`),n.length&&s.push(`Unexpected in shader block (${n.length}): ${f(n)}.`),t.length<=12&&r.length<=12&&(i.length||n.length)&&(s.push(`Expected: ${t.join(", ")}.`),s.push(`Actual: ${r.join(", ")}.`)),`${e.moduleName}: ${e.stage} shader uniform block ${e.uniformBlockName} does not match module.uniformTypes. ${s.join(" ")}`}(s);return r.log?.error?.(l,s)(),!1!==r.throwOnError&&(0,i.v)(!1,l),s}function u(e){let t=[];for(let r of e.replace(/\/\*[\s\S]*?\*\//g,"").replace(/\/\/.*$/gm,"").matchAll(s)){let e=r[1]?.trim()||null;t.push({blockName:r[2],body:r[3],instanceName:r[4]||null,layoutQualifier:e,hasLayoutQualifier:!!e,isStd140:!!(e&&/\blayout\s*\([^)]*\bstd140\b[^)]*\)/.exec(e))})}return t}function l(e,t,r,i){let n=u(e).filter(e=>!e.isStd140),s=new Set;for(let e of n){if(s.has(e.blockName))continue;s.add(e.blockName);let n=i?.label?`${i.label} `:"",a=e.hasLayoutQualifier?`declares ${e.layoutQualifier.replace(/\s+/g," ").trim()} instead of layout(std140)`:"does not declare layout(std140)",o=`${n}${t} shader uniform block ${e.blockName} ${a}. luma.gl host-side shader block packing assumes explicit layout(std140) for GLSL uniform blocks. Add \`layout(std140)\` to the block declaration.`;r?.warn?.(o,e)()}return n}function f(e,t=8){if(e.length<=t)return e.join(", ");let r=e.length-t;return`${e.slice(0,t).join(", ")}, ... (${r} more)`}},72560(e,t,r){r.d(t,{UK:()=>o,$g:()=>a,ZG:()=>u});let i={number:{type:"number",validate:(e,t)=>Number.isFinite(e)&&"object"==typeof t&&(void 0===t.max||e<=t.max)&&(void 0===t.min||e>=t.min)},array:{type:"array",validate:(e,t)=>Array.isArray(e)||ArrayBuffer.isView(e)}};function n(e){return Array.isArray(e)||ArrayBuffer.isView(e)?"array":typeof e}var s=r(31770);function a(e){e.map(e=>o(e))}function o(e){var t;if(e.instance)return;a(e.dependencies||[]);let{propTypes:r={},deprecations:o=[],inject:u={}}=e,l={normalizedInjections:(0,s.Uu)(u),parsedDeprecations:((t=o).forEach(e=>{"function"===e.type?e.regex=RegExp(`\\b${e.old}\\(`):e.regex=RegExp(`${e.type} ${e.old};`)}),t)};r&&(l.propValidators=function(e){let t={};for(let[r,s]of Object.entries(e))t[r]=function(e){let t=n(e);if("object"!==t)return{value:e,...i[t],type:t};if("object"==typeof e)return e?void 0!==e.type?{...e,...i[e.type],type:e.type}:void 0===e.value?{type:"object",value:e}:(t=n(e.value),{...e,...i[t],type:t}):{type:"object",value:null};throw Error("props")}(s);return t}(r)),e.instance=l;let f={};r&&(f=Object.entries(r).reduce((e,[t,r])=>{let i=r?.value;return i&&(e[t]=i),e},{})),e.defaultUniforms={...e.defaultUniforms,...f}}function u(e,t,r){e.deprecations?.forEach(e=>{e.regex?.test(t)&&(e.deprecated?r.deprecated(e.old,e.new)():r.removed(e.old,e.new)())})}},79083(e,t,r){r.d(t,{K:()=>a,r:()=>s});var i=r(44791);let n=/^(vs|fs):(?:#(?:decl|main-start|main-end)|[A-Za-z_][\w-]*)$/;function s(e=[],t){let r=[],i={},n={},a={},u={};for(let s of e)o({modules:r,defines:i,injections:n,vertexInputs:a,varyings:u},s),o({modules:r,defines:i,injections:n,vertexInputs:a,varyings:u},s[t]);for(let e of Object.keys(u))if(a[e])throw Error(`ShaderPlugin name "${e}" cannot be both a vertex input and a varying`);return{modules:r,defines:i,injections:n,vertexInputs:a,varyings:u}}function a(e=[],t=[]){let r=[...e],i=new Set(r.map(e=>e.name));for(let e of t)i.has(e.name)||(r.push(e),i.add(e.name));return r}function o(e,t){if(t){for(let[r,i]of(t.modules?.length&&e.modules.push(...t.modules),t.defines&&Object.assign(e.defines,t.defines),Object.entries(t.vertexInputs||{}))){u(r,"vertex input");let t=e.vertexInputs[r];if(t&&t!==i)throw Error(`ShaderPlugin vertex input "${r}" has conflicting types "${t}" and "${i}"`);e.vertexInputs[r]=i}for(let[r,n]of Object.entries(t.varyings||{})){u(r,"varying");let t=function(e,t){let{primitiveType:r}=i.Co.getAttributeShaderTypeInfo(t.type),n="i32"===r||"u32"===r,s=t.interpolation||(n?"flat":"smooth");if(n&&"smooth"===s)throw Error(`ShaderPlugin integer varying "${e}" must use flat interpolation`);return{type:t.type,interpolation:s}}(r,n),s=e.varyings[r];if(s&&(s.type!==t.type||s.interpolation!==t.interpolation))throw Error(`ShaderPlugin varying "${r}" has conflicting declarations "${s.type}/${s.interpolation}" and "${t.type}/${t.interpolation}"`);e.varyings[r]=t}for(let r of t.injections||[])(function(e){if(!n.test(e))throw Error(`ShaderPlugin injection target "${e}" must be a named shader anchor or hook`)})(r.target),e.injections[r.target]||(e.injections[r.target]=[]),e.injections[r.target].push({injection:r.injection,order:r.order??0})}}function u(e,t){if(!/^[A-Za-z_][A-Za-z0-9_]*$/.test(e)||e.startsWith("_luma_"))throw Error(`ShaderPlugin ${t} "${e}" must be a valid non-reserved identifier`)}},67926(e,t,r){r.d(t,{v:()=>i});function i(e,t){if(!e){let e=Error(t||"shadertools: assertion failed.");throw Error.captureStackTrace?.(e,i),e}}},57102(e,t,r){r.d(t,{q:()=>n});var i=r(23471);let n={props:{},uniforms:{},name:"picking",uniformTypes:{isActive:"f32",isAttribute:"f32",isHighlightActive:"f32",useByteColors:"f32",highlightedObjectColor:"vec3<f32>",highlightColor:"vec4<f32>"},defaultUniforms:{isActive:!1,isAttribute:!1,isHighlightActive:!1,useByteColors:!0,highlightedObjectColor:[0,0,0],highlightColor:[0,1,1,1]},vs:`\
layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

out vec4 picking_vRGBcolor_Avalid;

// Normalize unsigned byte color to 0-1 range
vec3 picking_normalizeColor(vec3 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

// Normalize unsigned byte color to 0-1 range
vec4 picking_normalizeColor(vec4 color) {
  return picking.useByteColors > 0.5 ? color / 255.0 : color;
}

bool picking_isColorZero(vec3 color) {
  return dot(color, vec3(1.0)) < 0.00001;
}

bool picking_isColorValid(vec3 color) {
  return dot(color, vec3(1.0)) > 0.00001;
}

// Check if this vertex is highlighted 
bool isVertexHighlighted(vec3 vertexColor) {
  vec3 highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
  return
    bool(picking.isHighlightActive) && picking_isColorZero(abs(vertexColor - highlightedObjectColor));
}

// Set the current picking color
void picking_setPickingColor(vec3 pickingColor) {
  pickingColor = picking_normalizeColor(pickingColor);

  if (bool(picking.isActive)) {
    // Use alpha as the validity flag. If pickingColor is [0, 0, 0] fragment is non-pickable
    picking_vRGBcolor_Avalid.a = float(picking_isColorValid(pickingColor));

    if (!bool(picking.isAttribute)) {
      // Stores the picking color so that the fragment shader can render it during picking
      picking_vRGBcolor_Avalid.rgb = pickingColor;
    }
  } else {
    // Do the comparison with selected item color in vertex shader as it should mean fewer compares
    picking_vRGBcolor_Avalid.a = float(isVertexHighlighted(pickingColor));
  }
}

void picking_setPickingAttribute(float value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.r = value;
  }
}

void picking_setPickingAttribute(vec2 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rg = value;
  }
}

void picking_setPickingAttribute(vec3 value) {
  if (bool(picking.isAttribute)) {
    picking_vRGBcolor_Avalid.rgb = value;
  }
}
`,fs:`\
layout(std140) uniform pickingUniforms {
  float isActive;
  float isAttribute;
  float isHighlightActive;
  float useByteColors;
  vec3 highlightedObjectColor;
  vec4 highlightColor;
} picking;

in vec4 picking_vRGBcolor_Avalid;

/*
 * Returns highlight color if this item is selected.
 */
vec4 picking_filterHighlightColor(vec4 color) {
  // If we are still picking, we don't highlight
  if (picking.isActive > 0.5) {
    return color;
  }

  bool selected = bool(picking_vRGBcolor_Avalid.a);

  if (selected) {
    // Blend in highlight color based on its alpha value
    float highLightAlpha = picking.highlightColor.a;
    float blendedAlpha = highLightAlpha + color.a * (1.0 - highLightAlpha);
    float highLightRatio = highLightAlpha / blendedAlpha;

    vec3 blendedRGB = mix(color.rgb, picking.highlightColor.rgb, highLightRatio);
    return vec4(blendedRGB, blendedAlpha);
  } else {
    return color;
  }
}

/*
 * Returns picking color if picking enabled else unmodified argument.
 */
vec4 picking_filterPickingColor(vec4 color) {
  if (bool(picking.isActive)) {
    if (picking_vRGBcolor_Avalid.a == 0.0) {
      discard;
    }
    return picking_vRGBcolor_Avalid;
  }
  return color;
}

/*
 * Returns picking color if picking is enabled if not
 * highlight color if this item is selected, otherwise unmodified argument.
 */
vec4 picking_filterColor(vec4 color) {
  vec4 highlightColor = picking_filterHighlightColor(color);
  return picking_filterPickingColor(highlightColor);
}
`,getUniforms:function(e={},t){let r={},n=(0,i.eS)(e.useByteColors,!0);return void 0===e.highlightedObjectColor||(null===e.highlightedObjectColor?r.isHighlightActive=!1:(r.isHighlightActive=!0,r.highlightedObjectColor=e.highlightedObjectColor.slice(0,3))),e.highlightColor&&(r.highlightColor=(0,i.jI)(e.highlightColor,n)),void 0!==e.isActive&&(r.isActive=!!e.isActive,r.isAttribute=!!e.isAttribute),void 0!==e.useByteColors&&(r.useByteColors=!!e.useByteColors),r}}},31106(e,t,r){r.d(t,{U:()=>l,X:()=>u});var i=r(70319);let n=null,s=new ArrayBuffer(4),a=new Float32Array(s),o=new Uint32Array(s);function u(e){n||=f(),e=(0,i.qE)(e,-65504,65504),a[0]=e;let t=o[0],r=t>>23&511;return n.baseTable[r]+((8388607&t)>>n.shiftTable[r])}function l(e){n||=f();let t=e>>10;return o[0]=n.mantissaTable[n.offsetTable[t]+(1023&e)]+n.exponentTable[t],a[0]}function f(){let e=new Uint32Array(512),t=new Uint32Array(512);for(let r=0;r<256;++r){let i=r-127;i<-27?(e[r]=0,e[256|r]=32768,t[r]=24,t[256|r]=24):i<-14?(e[r]=1024>>-i-14,e[256|r]=1024>>-i-14|32768,t[r]=-i-1,t[256|r]=-i-1):i<=15?(e[r]=i+15<<10,e[256|r]=i+15<<10|32768,t[r]=13,t[256|r]=13):i<128?(e[r]=31744,e[256|r]=64512,t[r]=24,t[256|r]=24):(e[r]=31744,e[256|r]=64512,t[r]=13,t[256|r]=13)}let r=new Uint32Array(2048),i=new Uint32Array(64),n=new Uint32Array(64);for(let e=1;e<1024;++e){let t=e<<13,i=0;for(;(8388608&t)==0;)t<<=1,i-=8388608;t&=-8388609,i+=0x38800000,r[e]=t|i}for(let e=1024;e<2048;++e)r[e]=0x38000000+(e-1024<<13);for(let e=1;e<31;++e)i[e]=e<<23;i[31]=0x47800000,i[32]=0x80000000;for(let e=33;e<63;++e)i[e]=0x80000000+(e-32<<23);i[63]=0xc7800000;for(let e=1;e<64;++e)32!==e&&(n[e]=1024);return{baseTable:e,shiftTable:t,mantissaTable:r,exponentTable:i,offsetTable:n}}},22270(e,t,r){r.d(t,{i:()=>i});let i={name:"fp32",source:`\
#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND
const FP32_TWO_PI: f32 = 6.2831854820251465;
const FP32_PI_2: f32 = 1.5707963705062866;
const FP32_PI_16: f32 = 0.1963495463132858;

const FP32_SIN_TABLE_0: f32 = 0.19509032368659973;
const FP32_SIN_TABLE_1: f32 = 0.3826834261417389;
const FP32_SIN_TABLE_2: f32 = 0.5555702447891235;
const FP32_SIN_TABLE_3: f32 = 0.7071067690849304;

const FP32_COS_TABLE_0: f32 = 0.9807852506637573;
const FP32_COS_TABLE_1: f32 = 0.9238795042037964;
const FP32_COS_TABLE_2: f32 = 0.8314695954322815;
const FP32_COS_TABLE_3: f32 = 0.7071067690849304;

const FP32_INVERSE_FACTORIAL_3: f32 = 1.666666716337204e-01;
const FP32_INVERSE_FACTORIAL_5: f32 = 8.333333767950535e-03;
const FP32_INVERSE_FACTORIAL_7: f32 = 1.9841270113829523e-04;
const FP32_INVERSE_FACTORIAL_9: f32 = 2.75573188446287533e-06;
const FP32_OVERFLOW: f32 = 3.402823466e+38;

fn sin_taylor_fp32(a: f32) -> f32 {
  if (a == 0.0) {
    return 0.0;
  }

  let x = -a * a;
  var sum = a;
  var term = a;

  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_3;
  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_5;
  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_7;
  term = term * x;
  sum = sum + term * FP32_INVERSE_FACTORIAL_9;

  return sum;
}

fn tan_taylor_fp32(a: f32) -> f32 {
  if (a == 0.0) {
    return 0.0;
  }

  let z = floor(a / FP32_TWO_PI);
  let reduced = a - FP32_TWO_PI * z;

  var quadrantValue = floor(reduced / FP32_PI_2 + 0.5);
  let quadrant = i32(quadrantValue);
  if (quadrant < -2 || quadrant > 2) {
    return FP32_OVERFLOW;
  }

  var angle = reduced - FP32_PI_2 * quadrantValue;
  quadrantValue = floor(angle / FP32_PI_16 + 0.5);
  let tableIndex = i32(quadrantValue);
  let absoluteTableIndex = abs(tableIndex);
  if (absoluteTableIndex > 4) {
    return FP32_OVERFLOW;
  }

  angle = angle - FP32_PI_16 * quadrantValue;
  let sinAngle = sin_taylor_fp32(angle);
  let cosAngle = sqrt(1.0 - sinAngle * sinAngle);

  var tableCos = 0.0;
  var tableSin = 0.0;
  if (absoluteTableIndex == 1) {
    tableCos = FP32_COS_TABLE_0;
    tableSin = FP32_SIN_TABLE_0;
  } else if (absoluteTableIndex == 2) {
    tableCos = FP32_COS_TABLE_1;
    tableSin = FP32_SIN_TABLE_1;
  } else if (absoluteTableIndex == 3) {
    tableCos = FP32_COS_TABLE_2;
    tableSin = FP32_SIN_TABLE_2;
  } else if (absoluteTableIndex == 4) {
    tableCos = FP32_COS_TABLE_3;
    tableSin = FP32_SIN_TABLE_3;
  }

  var sinReduced = sinAngle;
  var cosReduced = cosAngle;
  if (tableIndex > 0) {
    sinReduced = tableCos * sinAngle + tableSin * cosAngle;
    cosReduced = tableCos * cosAngle - tableSin * sinAngle;
  } else if (tableIndex < 0) {
    sinReduced = tableCos * sinAngle - tableSin * cosAngle;
    cosReduced = tableCos * cosAngle + tableSin * sinAngle;
  }

  var sinValue = 0.0;
  var cosValue = 0.0;
  if (quadrant == 0) {
    sinValue = sinReduced;
    cosValue = cosReduced;
  } else if (quadrant == 1) {
    sinValue = cosReduced;
    cosValue = -sinReduced;
  } else if (quadrant == -1) {
    sinValue = -cosReduced;
    cosValue = sinReduced;
  } else {
    sinValue = -sinReduced;
    cosValue = -cosReduced;
  }

  return sinValue / cosValue;
}

fn tan_fp32(a: f32) -> f32 {
  return tan_taylor_fp32(a);
}
#else
fn tan_fp32(a: f32) -> f32 {
  return tan(a);
}
#endif
`,vs:`\
#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND

// All these functions are for substituting tan() function from Intel GPU only
const float TWO_PI = 6.2831854820251465;
const float PI_2 = 1.5707963705062866;
const float PI_16 = 0.1963495463132858;

const float SIN_TABLE_0 = 0.19509032368659973;
const float SIN_TABLE_1 = 0.3826834261417389;
const float SIN_TABLE_2 = 0.5555702447891235;
const float SIN_TABLE_3 = 0.7071067690849304;

const float COS_TABLE_0 = 0.9807852506637573;
const float COS_TABLE_1 = 0.9238795042037964;
const float COS_TABLE_2 = 0.8314695954322815;
const float COS_TABLE_3 = 0.7071067690849304;

const float INVERSE_FACTORIAL_3 = 1.666666716337204e-01; // 1/3!
const float INVERSE_FACTORIAL_5 = 8.333333767950535e-03; // 1/5!
const float INVERSE_FACTORIAL_7 = 1.9841270113829523e-04; // 1/7!
const float INVERSE_FACTORIAL_9 = 2.75573188446287533e-06; // 1/9!

float sin_taylor_fp32(float a) {
  float r, s, t, x;

  if (a == 0.0) {
    return 0.0;
  }

  x = -a * a;
  s = a;
  r = a;

  r = r * x;
  t = r * INVERSE_FACTORIAL_3;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_5;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_7;
  s = s + t;

  r = r * x;
  t = r * INVERSE_FACTORIAL_9;
  s = s + t;

  return s;
}

void sincos_taylor_fp32(float a, out float sin_t, out float cos_t) {
  if (a == 0.0) {
    sin_t = 0.0;
    cos_t = 1.0;
  }
  sin_t = sin_taylor_fp32(a);
  cos_t = sqrt(1.0 - sin_t * sin_t);
}

float tan_taylor_fp32(float a) {
    float sin_a;
    float cos_a;

    if (a == 0.0) {
        return 0.0;
    }

    // 2pi range reduction
    float z = floor(a / TWO_PI);
    float r = a - TWO_PI * z;

    float t;
    float q = floor(r / PI_2 + 0.5);
    int j = int(q);

    if (j < -2 || j > 2) {
        return 1.0 / 0.0;
    }

    t = r - PI_2 * q;

    q = floor(t / PI_16 + 0.5);
    int k = int(q);
    int abs_k = int(abs(float(k)));

    if (abs_k > 4) {
        return 1.0 / 0.0;
    } else {
        t = t - PI_16 * q;
    }

    float u = 0.0;
    float v = 0.0;

    float sin_t, cos_t;
    float s, c;
    sincos_taylor_fp32(t, sin_t, cos_t);

    if (k == 0) {
        s = sin_t;
        c = cos_t;
    } else {
        if (abs(float(abs_k) - 1.0) < 0.5) {
            u = COS_TABLE_0;
            v = SIN_TABLE_0;
        } else if (abs(float(abs_k) - 2.0) < 0.5) {
            u = COS_TABLE_1;
            v = SIN_TABLE_1;
        } else if (abs(float(abs_k) - 3.0) < 0.5) {
            u = COS_TABLE_2;
            v = SIN_TABLE_2;
        } else if (abs(float(abs_k) - 4.0) < 0.5) {
            u = COS_TABLE_3;
            v = SIN_TABLE_3;
        }
        if (k > 0) {
            s = u * sin_t + v * cos_t;
            c = u * cos_t - v * sin_t;
        } else {
            s = u * sin_t - v * cos_t;
            c = u * cos_t + v * sin_t;
        }
    }

    if (j == 0) {
        sin_a = s;
        cos_a = c;
    } else if (j == 1) {
        sin_a = c;
        cos_a = -s;
    } else if (j == -1) {
        sin_a = -c;
        cos_a = s;
    } else {
        sin_a = -s;
        cos_a = -c;
    }
    return sin_a / cos_a;
}
#endif

float tan_fp32(float a) {
#ifdef LUMA_FP32_TAN_PRECISION_WORKAROUND
  return tan_taylor_fp32(a);
#else
  return tan(a);
#endif
}
`}},72490(e,t,r){function i(e,t=[],r=0){let n=Math.fround(e),s=e-n;return t[r]=n,t[r+1]=s,t}r.d(t,{d:()=>u});let n=`\

layout(std140) uniform fp64arithmeticUniforms {
  uniform float ONE;
  uniform float SPLIT;
} fp64;

/*
About LUMA_FP64_CODE_ELIMINATION_WORKAROUND

The purpose of this workaround is to prevent shader compilers from
optimizing away necessary arithmetic operations by swapping their sequences
or transform the equation to some 'equivalent' form.

These helpers implement Dekker/Veltkamp-style error tracking. If the compiler
folds constants or reassociates the arithmetic, the high/low split can stop
tracking the rounding error correctly. That failure mode tends to look fine in
simple coordinate setup, but then breaks down inside iterative arithmetic such
as fp64 Mandelbrot loops.

The method is to multiply an artifical variable, ONE, which will be known to
the compiler to be 1 only at runtime. The whole expression is then represented
as a polynomial with respective to ONE. In the coefficients of all terms, only one a
and one b should appear

err = (a + b) * ONE^6 - a * ONE^5 - (a + b) * ONE^4 + a * ONE^3 - b - (a + b) * ONE^2 + a * ONE
*/

float prevent_fp64_optimization(float value) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  return value + fp64.ONE * 0.0;
#else
  return value;
#endif
}

// Divide float number to high and low floats to extend fraction bits
vec2 split(float a) {
  // Keep SPLIT as a runtime uniform so the compiler cannot fold the Dekker
  // split into a constant expression and reassociate the recovery steps.
  float split = prevent_fp64_optimization(fp64.SPLIT);
  float t = prevent_fp64_optimization(a * split);
  float temp = t - a;
  float a_hi = t - temp;
  float a_lo = a - a_hi;
  return vec2(a_hi, a_lo);
}

// Divide float number again when high float uses too many fraction bits
vec2 split2(vec2 a) {
  vec2 b = split(a.x);
  b.y += a.y;
  return b;
}

// Special sum operation when a > b
vec2 quickTwoSum(float a, float b) {
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float sum = (a + b) * fp64.ONE;
  float err = b - (sum - a) * fp64.ONE;
#else
  float sum = a + b;
  float err = b - (sum - a);
#endif
  return vec2(sum, err);
}

// General sum operation
vec2 twoSum(float a, float b) {
  float s = (a + b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE + (b - v);
#else
  float v = s - a;
  float err = (a - (s - v)) + (b - v);
#endif
  return vec2(s, err);
}

vec2 twoSub(float a, float b) {
  float s = (a - b);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float v = (s * fp64.ONE - a) * fp64.ONE;
  float err = (a - (s - v) * fp64.ONE) * fp64.ONE * fp64.ONE * fp64.ONE - (b + v);
#else
  float v = s - a;
  float err = (a - (s - v)) - (b + v);
#endif
  return vec2(s, err);
}

vec2 twoSqr(float a) {
  float prod = a * a;
  vec2 a_fp64 = split(a);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err = ((a_fp64.x * a_fp64.x - prod) * fp64.ONE + 2.0 * a_fp64.x *
    a_fp64.y * fp64.ONE * fp64.ONE) + a_fp64.y * a_fp64.y * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err = ((a_fp64.x * a_fp64.x - prod) + 2.0 * a_fp64.x * a_fp64.y) + a_fp64.y * a_fp64.y;
#endif
  return vec2(prod, err);
}

vec2 twoProd(float a, float b) {
  float prod = a * b;
  vec2 a_fp64 = split(a);
  vec2 b_fp64 = split(b);
  // twoProd is especially sensitive because mul_fp64 and div_fp64 both depend
  // on the split terms and cross terms staying in the original evaluation
  // order. If the compiler folds or reassociates them, the low part tends to
  // collapse to zero or NaN on some drivers.
  float highProduct = prevent_fp64_optimization(a_fp64.x * b_fp64.x);
  float crossProduct1 = prevent_fp64_optimization(a_fp64.x * b_fp64.y);
  float crossProduct2 = prevent_fp64_optimization(a_fp64.y * b_fp64.x);
  float lowProduct = prevent_fp64_optimization(a_fp64.y * b_fp64.y);
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  float err1 = (highProduct - prod) * fp64.ONE;
  float err2 = crossProduct1 * fp64.ONE * fp64.ONE;
  float err3 = crossProduct2 * fp64.ONE * fp64.ONE * fp64.ONE;
  float err4 = lowProduct * fp64.ONE * fp64.ONE * fp64.ONE * fp64.ONE;
#else
  float err1 = highProduct - prod;
  float err2 = crossProduct1;
  float err3 = crossProduct2;
  float err4 = lowProduct;
#endif
  float err = ((err1 + err2) + err3) + err4;
  return vec2(prod, err);
}

vec2 sum_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSum(a.x, b.x);
  t = twoSum(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 sub_fp64(vec2 a, vec2 b) {
  vec2 s, t;
  s = twoSub(a.x, b.x);
  t = twoSub(a.y, b.y);
  s.y += t.x;
  s = quickTwoSum(s.x, s.y);
  s.y += t.y;
  s = quickTwoSum(s.x, s.y);
  return s;
}

vec2 mul_fp64(vec2 a, vec2 b) {
  vec2 prod = twoProd(a.x, b.x);
  // y component is for the error
  prod.y += a.x * b.y;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  prod.y += a.y * b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

vec2 div_fp64(vec2 a, vec2 b) {
  float xn = 1.0 / b.x;
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  vec2 yn = mul_fp64(a, vec2(xn, 0));
#else
  vec2 yn = a * xn;
#endif
  float diff = (sub_fp64(a, mul_fp64(b, yn))).x;
  vec2 prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

vec2 sqrt_fp64(vec2 a) {
  if (a.x == 0.0 && a.y == 0.0) return vec2(0.0, 0.0);
  if (a.x < 0.0) return vec2(0.0 / 0.0, 0.0 / 0.0);

  float x = 1.0 / sqrt(a.x);
  float yn = a.x * x;
#if defined(LUMA_FP64_CODE_ELIMINATION_WORKAROUND)
  vec2 yn_sqr = twoSqr(yn) * fp64.ONE;
#else
  vec2 yn_sqr = twoSqr(yn);
#endif
  float diff = sub_fp64(a, yn_sqr).x;
  vec2 prod = twoProd(x * 0.5, diff);
#if defined(LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND)
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2(yn, 0.0), prod);
#endif
}
`,s=`\
struct Fp64F32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent.
fn fp64_decode_f32_bits(bits: u32) -> Fp64F32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64F32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64F32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64F32Bits(sign, i32(exponentBits) - 150, 0x800000u | fraction, false, false, false);
}

fn fp64_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return exactSign << 31u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;

  // A normal two-sum/two-product residual never needs a shift this large.
  // This guard gives deterministic underflow behavior outside that contract.
  if (exactShift >= 64 || highShift >= 64) {
    return exactSign << 31u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let lowBits = fp64_make_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  return vec2u(highBits, lowBits);
}

fn fp64_two_sum_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u((a.sign & b.sign) << 31u, 0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = select(
    b.baseExponent - a.baseExponent,
    a.baseExponent - b.baseExponent,
    a.baseExponent >= b.baseExponent
  );

  // Beyond half an ulp, rounding cannot change the larger operand. Returning
  // the smaller operand intact also avoids an unbounded integer alignment.
  // At a power-of-two boundary the spacing below the larger operand is half
  // the spacing above it, so an opposite-sign gap-25 operand can still change
  // the rounded high limb. Gap 26 is the first universally safe early-out.
  if (exponentDifference > 25) {
    if (fp64_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u, 0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_accumulator_bits(resultSign, resultMagnitude, commonBaseExponent);
}

fn fp64_two_sum_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_multiply_significands(a: u32, b: u32) -> vec2u {
  let aLow = a & 0xffffu;
  let aHigh = a >> 16u;
  let bLow = b & 0xffffu;
  let bHigh = b >> 16u;
  let lowProduct = aLow * bLow;
  let crossProduct = aLow * bHigh + aHigh * bLow;
  let highProduct = aHigh * bHigh;

  var result = vec2u(0u, lowProduct);
  result = fp64_u64_add(
    result,
    fp64_u64_shift_left(vec2u(0u, crossProduct), 16u)
  );
  result = fp64_u64_add(result, vec2u(highProduct, 0u));
  return result;
}

fn fp64_two_prod_integer_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_f32_bits(aBits);
  let b = fp64_decode_f32_bits(bBits);
  let resultSign = a.sign ^ b.sign;

  if (a.isNan || b.isNan || ((a.isZero || b.isZero) && (a.isInf || b.isInf))) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    return vec2u((resultSign << 31u) | 0x7f800000u, resultSign << 31u);
  }
  if (a.isZero || b.isZero) {
    return vec2u(resultSign << 31u, resultSign << 31u);
  }

  let magnitude = fp64_multiply_significands(a.significand, b.significand);
  return fp64_split_accumulator_bits(
    resultSign,
    magnitude,
    a.baseExponent + b.baseExponent
  );
}

fn fp64_two_prod_integer(a: f32, b: f32) -> vec2f {
  let resultBits = fp64_two_prod_integer_bits(bitcast<u32>(a), bitcast<u32>(b));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn fp64_round_add_integer(a: f32, b: f32) -> f32 {
  return fp64_two_sum_integer(a, b).x;
}

fn fp64_round_mul_integer(a: f32, b: f32) -> f32 {
  return fp64_two_prod_integer(a, b).x;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_finite_exponent(value: Fp64F32Bits) -> i32 {
  let mostSignificantBit = 31u - countLeadingZeros(value.significand);
  return value.baseExponent + i32(mostSignificantBit);
}

fn fp64_scale_f32_integer(value: f32, exponent: i32) -> f32 {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(value));
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return value;
  }
  let resultBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent + exponent
  );
  return bitcast<f32>(resultBits);
}

// Divide normalized significands so the hardware operation cannot overflow,
// underflow, or flush a subnormal result. Reapply the exponent with integer
// packing, which also produces subnormal correction limbs without relying on
// floating-point arithmetic to preserve them.
fn fp64_divide_f32_integer(aValue: f32, bValue: f32) -> f32 {
  let a = fp64_decode_f32_bits(bitcast<u32>(aValue));
  let b = fp64_decode_f32_bits(bitcast<u32>(bValue));
  if (a.isZero || b.isZero || a.isInf || b.isInf || a.isNan || b.isNan) {
    return aValue / bValue;
  }

  let aMostSignificantBit = 31u - countLeadingZeros(a.significand);
  let bMostSignificantBit = 31u - countLeadingZeros(b.significand);
  let normalizedABits = fp64_make_f32_bits_from_u64(
    a.sign,
    vec2u(0u, a.significand),
    -i32(aMostSignificantBit)
  );
  let normalizedBBits = fp64_make_f32_bits_from_u64(
    b.sign,
    vec2u(0u, b.significand),
    -i32(bMostSignificantBit)
  );
  let normalizedQuotient = bitcast<f32>(normalizedABits) / bitcast<f32>(normalizedBBits);
  let quotient = fp64_decode_f32_bits(bitcast<u32>(normalizedQuotient));
  let exponentShift =
    a.baseExponent + i32(aMostSignificantBit) -
    b.baseExponent - i32(bMostSignificantBit);
  let quotientBits = fp64_make_f32_bits_from_u64(
    quotient.sign,
    vec2u(0u, quotient.significand),
    quotient.baseExponent + exponentShift
  );
  return bitcast<f32>(quotientBits);
}
#endif

`,a=`\
${s}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn split(a: f32) -> vec2f {
  let aBits = bitcast<u32>(a);
  let decoded = fp64_decode_f32_bits(aBits);
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return vec2f(a, 0.0);
  }

  var roundedHigh = decoded.significand >> 12u;
  let remainder = decoded.significand & 0xfffu;
  if (remainder > 0x800u || (remainder == 0x800u && (roundedHigh & 1u) == 1u)) {
    roundedHigh = roundedHigh + 1u;
  }
  var highMagnitude = vec2u(0u, roundedHigh << 12u);
  var highBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    highMagnitude,
    decoded.baseExponent
  );
  // Rounding the high limb of a maximum-exponent value can overflow even
  // though the original value is finite. Truncate only in that boundary case
  // so split remains an exact finite decomposition.
  if (fp64_decode_f32_bits(highBits).isInf) {
    roundedHigh = decoded.significand >> 12u;
    highMagnitude = vec2u(0u, roundedHigh << 12u);
    highBits = fp64_make_f32_bits_from_u64(
      decoded.sign,
      highMagnitude,
      decoded.baseExponent
    );
  }
  let lowBits = fp64_make_residual_f32_bits(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent,
    highBits
  );
  return vec2f(bitcast<f32>(highBits), bitcast<f32>(lowBits));
}

fn split2(a: vec2f) -> vec2f {
  var result = split(a.x);
  result.y = fp64_round_add_integer(result.y, a.y);
  return result;
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn quickTwoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}
#endif

fn twoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let bBits = bitcast<u32>(b) ^ 0x80000000u;
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn twoSqr(a: f32) -> vec2f {
  return fp64_two_prod_integer(a, a);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  return fp64_two_prod_integer(a, b);
}
#endif

struct Fp64IntegerAccumulator {
  sign: u32,
  magnitude: vec2u,
};

fn fp64_accumulate_f32_integer(
  accumulator: Fp64IntegerAccumulator,
  value: Fp64F32Bits,
  commonBaseExponent: i32
) -> Fp64IntegerAccumulator {
  if (value.isZero) {
    return accumulator;
  }

  let magnitude = fp64_u64_shift_left(
    vec2u(0u, value.significand),
    u32(value.baseExponent - commonBaseExponent)
  );
  if (fp64_u64_is_zero(accumulator.magnitude)) {
    return Fp64IntegerAccumulator(value.sign, magnitude);
  }
  if (accumulator.sign == value.sign) {
    return Fp64IntegerAccumulator(
      accumulator.sign,
      fp64_u64_add(accumulator.magnitude, magnitude)
    );
  }

  let comparison = fp64_u64_compare(accumulator.magnitude, magnitude);
  if (comparison == 0) {
    return Fp64IntegerAccumulator(0u, vec2u(0u));
  }
  if (comparison > 0) {
    return Fp64IntegerAccumulator(
      accumulator.sign,
      fp64_u64_sub(accumulator.magnitude, magnitude)
    );
  }
  return Fp64IntegerAccumulator(
    value.sign,
    fp64_u64_sub(magnitude, accumulator.magnitude)
  );
}

fn fp64_sum_integer_unfused(a: vec2f, b: vec2f) -> vec2f {
  var sum = fp64_two_sum_integer(a.x, b.x);
  let lowSum = fp64_two_sum_integer(a.y, b.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.x);
  sum = fp64_two_sum_integer(sum.x, sum.y);
  sum.y = fp64_round_add_integer(sum.y, lowSum.y);
  return fp64_two_sum_integer(sum.x, sum.y);
}

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  let aHigh = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let aLow = fp64_decode_f32_bits(bitcast<u32>(a.y));
  let bHigh = fp64_decode_f32_bits(bitcast<u32>(b.x));
  let bLow = fp64_decode_f32_bits(bitcast<u32>(b.y));
  if (
    aHigh.isInf || aHigh.isNan || aLow.isInf || aLow.isNan ||
    bHigh.isInf || bHigh.isNan || bLow.isInf || bLow.isNan
  ) {
    return fp64_sum_integer_unfused(a, b);
  }

  var minimumBaseExponent = 2147483647;
  var maximumBaseExponent = -2147483647;
  if (!aHigh.isZero) {
    minimumBaseExponent = min(minimumBaseExponent, aHigh.baseExponent);
    maximumBaseExponent = max(maximumBaseExponent, aHigh.baseExponent);
  }
  if (!aLow.isZero) {
    minimumBaseExponent = min(minimumBaseExponent, aLow.baseExponent);
    maximumBaseExponent = max(maximumBaseExponent, aLow.baseExponent);
  }
  if (!bHigh.isZero) {
    minimumBaseExponent = min(minimumBaseExponent, bHigh.baseExponent);
    maximumBaseExponent = max(maximumBaseExponent, bHigh.baseExponent);
  }
  if (!bLow.isZero) {
    minimumBaseExponent = min(minimumBaseExponent, bLow.baseExponent);
    maximumBaseExponent = max(maximumBaseExponent, bLow.baseExponent);
  }
  if (maximumBaseExponent < minimumBaseExponent) {
    return vec2f(0.0, 0.0);
  }

  // Four 24-bit significands spanning at most 38 bits fit in the 64-bit
  // accumulator, including the two extra carry bits needed by their sum.
  if (maximumBaseExponent - minimumBaseExponent > 38) {
    return fp64_sum_integer_unfused(a, b);
  }

  var accumulator = Fp64IntegerAccumulator(0u, vec2u(0u));
  accumulator = fp64_accumulate_f32_integer(accumulator, aHigh, minimumBaseExponent);
  accumulator = fp64_accumulate_f32_integer(accumulator, aLow, minimumBaseExponent);
  accumulator = fp64_accumulate_f32_integer(accumulator, bHigh, minimumBaseExponent);
  accumulator = fp64_accumulate_f32_integer(accumulator, bLow, minimumBaseExponent);
  let resultBits = fp64_split_accumulator_bits(
    accumulator.sign,
    accumulator.magnitude,
    minimumBaseExponent
  );
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  let negatedB = vec2f(
    bitcast<f32>(bitcast<u32>(b.x) ^ 0x80000000u),
    bitcast<f32>(bitcast<u32>(b.y) ^ 0x80000000u)
  );
  return sum_fp64(a, negatedB);
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var product = fp64_two_prod_integer(a.x, b.x);
  let crossProduct1 = fp64_round_mul_integer(a.x, b.y);
  product = sum_fp64(product, vec2f(crossProduct1, 0.0));
  let crossProduct2 = fp64_round_mul_integer(a.y, b.x);
  return sum_fp64(product, vec2f(crossProduct2, 0.0));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_scale_fp64_integer(value: vec2f, exponent: i32) -> vec2f {
  let high = fp64_scale_f32_integer(value.x, exponent);
  let low = fp64_scale_f32_integer(value.y, exponent);
  return sum_fp64(vec2f(high, 0.0), vec2f(low, 0.0));
}

fn fp64_div_fp64_normalized(a: vec2f, b: vec2f) -> vec2f {
  let quotientHigh = fp64_divide_f32_integer(a.x, b.x);
  var quotient = vec2f(quotientHigh, 0.0);

  let remainder = sub_fp64(a, mul_fp64(b, quotient));
  let quotientLow = fp64_divide_f32_integer(remainder.x, b.x);
  quotient = sum_fp64(quotient, vec2f(quotientLow, 0.0));

  let secondRemainder = sub_fp64(a, mul_fp64(b, quotient));
  let correction = fp64_divide_f32_integer(secondRemainder.x, b.x);
  return sum_fp64(quotient, vec2f(correction, 0.0));
}

fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let decodedA = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedB = fp64_decode_f32_bits(bitcast<u32>(b.x));
  if (
    decodedA.isZero || decodedB.isZero ||
    decodedA.isInf || decodedB.isInf ||
    decodedA.isNan || decodedB.isNan
  ) {
    return fp64_div_fp64_normalized(a, b);
  }

  let exponentA = fp64_f32_finite_exponent(decodedA);
  let exponentB = fp64_f32_finite_exponent(decodedB);
  // Correct the quotient near unity so b * q and the remainder stay clear of
  // both f32 underflow and overflow. The exponent difference is applied once.
  let normalizedA = fp64_scale_fp64_integer(a, -exponentA);
  let normalizedB = fp64_scale_fp64_integer(b, -exponentB);
  let normalizedQuotient = fp64_div_fp64_normalized(normalizedA, normalizedB);
  return fp64_scale_fp64_integer(normalizedQuotient, exponentA - exponentB);
}

fn fp64_sqrt_fp64_normalized(a: vec2f) -> vec2f {
  let estimate = sqrt(a.x);
  let difference = sub_fp64(a, fp64_two_prod_integer(estimate, estimate)).x;
  let denominator = fp64_round_add_integer(estimate, estimate);
  let correction = fp64_divide_f32_integer(difference, denominator);
  return sum_fp64(vec2f(estimate, 0.0), vec2f(correction, 0.0));
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  let decoded = fp64_decode_f32_bits(bitcast<u32>(a.x));
  let decodedLow = fp64_decode_f32_bits(bitcast<u32>(a.y));
  if (decoded.isZero && decodedLow.isZero) {
    return vec2f(0.0, 0.0);
  }
  if (decoded.sign == 1u) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  if (decoded.isInf || decoded.isNan) {
    return fp64_sqrt_fp64_normalized(a);
  }
  let exponent = fp64_f32_finite_exponent(decoded);
  // An even scale lets the final square-root rescale use an integer exponent.
  let evenExponent = exponent - (exponent & 1);
  let normalizedA = fp64_scale_fp64_integer(a, -evenExponent);
  let normalizedRoot = fp64_sqrt_fp64_normalized(normalizedA);
  return fp64_scale_fp64_integer(normalizedRoot, evenExponent / 2);
}
#endif
`,o=`\
${s}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn split(a: f32) -> vec2f {
  let aBits = bitcast<u32>(a);
  let decoded = fp64_decode_f32_bits(aBits);
  if (decoded.isZero || decoded.isInf || decoded.isNan) {
    return vec2f(a, 0.0);
  }

  var roundedHigh = decoded.significand >> 12u;
  let remainder = decoded.significand & 0xfffu;
  if (remainder > 0x800u || (remainder == 0x800u && (roundedHigh & 1u) == 1u)) {
    roundedHigh = roundedHigh + 1u;
  }
  var highMagnitude = vec2u(0u, roundedHigh << 12u);
  var highBits = fp64_make_f32_bits_from_u64(
    decoded.sign,
    highMagnitude,
    decoded.baseExponent
  );
  if (fp64_decode_f32_bits(highBits).isInf) {
    roundedHigh = decoded.significand >> 12u;
    highMagnitude = vec2u(0u, roundedHigh << 12u);
    highBits = fp64_make_f32_bits_from_u64(
      decoded.sign,
      highMagnitude,
      decoded.baseExponent
    );
  }
  let lowBits = fp64_make_residual_f32_bits(
    decoded.sign,
    vec2u(0u, decoded.significand),
    decoded.baseExponent,
    highBits
  );
  return vec2f(bitcast<f32>(highBits), bitcast<f32>(lowBits));
}

fn split2(a: vec2f) -> vec2f {
  var result = split(a.x);
  result.y = result.y + a.y;
  return result;
}

fn quickTwoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}
#endif

fn twoSum(a: f32, b: f32) -> vec2f {
  return fp64_two_sum_integer(a, b);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let bBits = bitcast<u32>(b) ^ 0x80000000u;
  let resultBits = fp64_two_sum_integer_bits(bitcast<u32>(a), bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn twoSqr(a: f32) -> vec2f {
  return fp64_two_prod_integer(a, a);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  return fp64_two_prod_integer(a, b);
}
#endif

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  let highSum = fp64_two_sum_integer(a.x, b.x);
  let lowSum = prevent_fp64_optimization((a.y + b.y) + highSum.y);
  return fp64_two_sum_integer(highSum.x, lowSum);
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  let highDifference = twoSub(a.x, b.x);
  let lowDifference = prevent_fp64_optimization((a.y - b.y) + highDifference.y);
  return fp64_two_sum_integer(highDifference.x, lowDifference);
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  let highProduct = fp64_two_prod_integer(a.x, b.x);
  let crossTerms = prevent_fp64_optimization(a.x * b.y + a.y * b.x);
  let lowTerms = prevent_fp64_optimization((crossTerms + a.y * b.y) + highProduct.y);
  return fp64_two_sum_integer(highProduct.x, lowTerms);
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let estimate = prevent_fp64_optimization(1.0 / b.x);
  let quotient = mul_fp64(a, vec2f(estimate, fp64_runtime_zero()));
  let remainder = prevent_fp64_optimization(sub_fp64(a, mul_fp64(b, quotient)).x);
  return sum_fp64(quotient, twoProd(estimate, remainder));
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  if (a.x == 0.0 && a.y == 0.0) {
    return vec2f(0.0, 0.0);
  }
  if (a.x < 0.0) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  let reciprocalRoot = prevent_fp64_optimization(1.0 / sqrt(a.x));
  let estimate = prevent_fp64_optimization(a.x * reciprocalRoot);
  let difference = prevent_fp64_optimization(sub_fp64(a, twoSqr(estimate)).x);
  let correction = twoProd(prevent_fp64_optimization(reciprocalRoot * 0.5), difference);
  return sum_fp64(vec2f(estimate, 0.0), correction);
}
#endif
`,u={name:"fp64arithmetic",source:`\
struct Fp64ArithmeticUniforms {
  ONE: f32,
  SPLIT: f32,
};

@group(0) @binding(auto) var<uniform> fp64arithmetic : Fp64ArithmeticUniforms;

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64Bits {
  sign: u32,
  exponent: i32,
  significand: vec2u,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_nan(seed: f32) -> f32 {
  let nanBits = 0x7fc00000u | select(0u, 1u, seed < 0.0);
  return bitcast<f32>(nanBits);
}
#endif

fn fp64_u64_is_zero(value: vec2u) -> bool {
  return value.x == 0u && value.y == 0u;
}

fn fp64_u64_compare(a: vec2u, b: vec2u) -> i32 {
  if (a.x != b.x) {
    return select(-1, 1, a.x > b.x);
  }
  if (a.y != b.y) {
    return select(-1, 1, a.y > b.y);
  }
  return 0;
}

fn fp64_u64_add(a: vec2u, b: vec2u) -> vec2u {
  let low = a.y + b.y;
  let carry = select(0u, 1u, low < a.y);
  return vec2u(a.x + b.x + carry, low);
}

fn fp64_u64_sub(a: vec2u, b: vec2u) -> vec2u {
  let borrow = select(0u, 1u, a.y < b.y);
  return vec2u(a.x - b.x - borrow, a.y - b.y);
}

fn fp64_u64_shift_left(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u((value.x << shift) | (value.y >> (32u - shift)), value.y << shift);
  }
  if (shift == 32u) {
    return vec2u(value.y, 0u);
  }
  if (shift < 64u) {
    return vec2u(value.y << (shift - 32u), 0u);
  }
  return vec2u(0u);
}

fn fp64_u64_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }
  if (shift < 32u) {
    return vec2u(value.x >> shift, (value.y >> shift) | (value.x << (32u - shift)));
  }
  if (shift == 32u) {
    return vec2u(0u, value.x);
  }
  if (shift < 64u) {
    return vec2u(0u, value.x >> (shift - 32u));
  }
  return vec2u(0u);
}

fn fp64_u64_get_bit(value: vec2u, bitIndex: u32) -> bool {
  if (bitIndex >= 64u) {
    return false;
  }
  if (bitIndex >= 32u) {
    return ((value.x >> (bitIndex - 32u)) & 1u) != 0u;
  }
  return ((value.y >> bitIndex) & 1u) != 0u;
}

fn fp64_u64_has_bits_below(value: vec2u, bitCount: u32) -> bool {
  if (bitCount == 0u) {
    return false;
  }
  if (bitCount >= 64u) {
    return !fp64_u64_is_zero(value);
  }
  if (bitCount > 32u) {
    let highBitCount = bitCount - 32u;
    let highMask = (1u << highBitCount) - 1u;
    return value.y != 0u || (value.x & highMask) != 0u;
  }
  if (bitCount == 32u) {
    return value.y != 0u;
  }
  let lowMask = (1u << bitCount) - 1u;
  return (value.y & lowMask) != 0u;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_u64_shift_right_sticky(value: vec2u, shift: u32) -> vec2u {
  var shifted = fp64_u64_shift_right(value, shift);
  if (fp64_u64_has_bits_below(value, shift)) {
    shifted.y = shifted.y | 1u;
  }
  return shifted;
}
#endif

fn fp64_u64_count_leading_zeros(value: vec2u) -> u32 {
  if (value.x != 0u) {
    return countLeadingZeros(value.x);
  }
  return 32u + countLeadingZeros(value.y);
}

fn fp64_round_shift_right_to_u32(value: vec2u, shift: u32) -> u32 {
  if (shift == 0u) {
    return value.y;
  }

  let truncated = fp64_u64_shift_right(value, shift);
  var rounded = truncated.y;
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded & 1u) == 1u)) {
    rounded = rounded + 1u;
  }
  return rounded;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_round_shift_right(value: vec2u, shift: u32) -> vec2u {
  if (shift == 0u) {
    return value;
  }

  var rounded = fp64_u64_shift_right(value, shift);
  let guard = fp64_u64_get_bit(value, shift - 1u);
  let hasTrailingBits = fp64_u64_has_bits_below(value, shift - 1u);
  if (guard && (hasTrailingBits || (rounded.y & 1u) == 1u)) {
    rounded = fp64_u64_add(rounded, vec2u(0u, 1u));
  }
  return rounded;
}
#endif

fn fp64_make_f32_bits_from_u64(sign: u32, significand: vec2u, baseExponent: i32) -> u32 {
  if (fp64_u64_is_zero(significand)) {
    return sign << 31u;
  }

  let leadingZeros = fp64_u64_count_leading_zeros(significand);
  let mostSignificantBit = 63u - leadingZeros;
  var exponent = baseExponent + i32(mostSignificantBit);

  if (exponent > 127) {
    return (sign << 31u) | 0x7f800000u;
  }

  if (exponent >= -126) {
    let shift = i32(mostSignificantBit) - 23;
    var significand24: u32;
    if (shift > 0) {
      significand24 = fp64_round_shift_right_to_u32(significand, u32(shift));
    } else {
      significand24 = fp64_u64_shift_left(significand, u32(-shift)).y;
    }

    if (significand24 >= 0x1000000u) {
      significand24 = significand24 >> 1u;
      exponent = exponent + 1;
      if (exponent > 127) {
        return (sign << 31u) | 0x7f800000u;
      }
    }

    return (sign << 31u) | (u32(exponent + 127) << 23u) | (significand24 & 0x7fffffu);
  }

  let scaleExponent = baseExponent + 149;
  var mantissa: u32;
  if (scaleExponent >= 0) {
    mantissa = fp64_u64_shift_left(significand, u32(scaleExponent)).y;
  } else {
    mantissa = fp64_round_shift_right_to_u32(significand, u32(-scaleExponent));
  }

  if (mantissa >= 0x800000u) {
    return (sign << 31u) | 0x00800000u;
  }
  return (sign << 31u) | mantissa;
}

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_decode_bits(bits: vec2u) -> Fp64Bits {
  let sign = bits.x >> 31u;
  let exponentBits = (bits.x >> 20u) & 0x7ffu;
  let fractionHigh = bits.x & 0xfffffu;
  let fractionLow = bits.y;
  let fraction = vec2u(fractionHigh, fractionLow);

  if (exponentBits == 0x7ffu) {
    let isInf = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, 0, vec2u(0u), false, isInf, !isInf);
  }

  if (exponentBits == 0u) {
    let isZero = fp64_u64_is_zero(fraction);
    return Fp64Bits(sign, -1022, fraction, isZero, false, false);
  }

  return Fp64Bits(sign, i32(exponentBits) - 1023, vec2u((1u << 20u) | fractionHigh, fractionLow), false, false, false);
}

fn fp64_finite_magnitude_compare(a: Fp64Bits, b: Fp64Bits) -> i32 {
  if (a.exponent != b.exponent) {
    return select(-1, 1, a.exponent > b.exponent);
  }
  return fp64_u64_compare(a.significand, b.significand);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
struct Fp64RawF32Bits {
  sign: u32,
  baseExponent: i32,
  significand: u32,
  isZero: bool,
  isInf: bool,
  isNan: bool,
};

// Decode an f32 as (-1)^sign * significand * 2^baseExponent. This shared
// integer representation lets normalization remain independent of the
// selected double-single arithmetic implementation.
fn fp64_decode_raw_f32_bits(bits: u32) -> Fp64RawF32Bits {
  let sign = bits >> 31u;
  let exponentBits = (bits >> 23u) & 0xffu;
  let fraction = bits & 0x7fffffu;

  if (exponentBits == 0xffu) {
    return Fp64RawF32Bits(sign, 0, 0u, false, fraction == 0u, fraction != 0u);
  }
  if (exponentBits == 0u) {
    return Fp64RawF32Bits(sign, -149, fraction, fraction == 0u, false, false);
  }
  return Fp64RawF32Bits(
    sign,
    i32(exponentBits) - 150,
    0x800000u | fraction,
    false,
    false,
    false
  );
}

fn fp64_raw_f32_magnitude_compare(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  return select(-1, 1, aMagnitude > bMagnitude);
}

fn fp64_make_raw_residual_f32_bits(
  exactSign: u32,
  exactMagnitude: vec2u,
  exactBaseExponent: i32,
  highBits: u32
) -> u32 {
  if (fp64_u64_is_zero(exactMagnitude)) {
    return 0u;
  }

  let high = fp64_decode_raw_f32_bits(highBits);
  if (high.isInf || high.isNan) {
    return 0u;
  }
  if (high.isZero) {
    return fp64_make_f32_bits_from_u64(exactSign, exactMagnitude, exactBaseExponent);
  }

  let commonBaseExponent = min(exactBaseExponent, high.baseExponent);
  let exactShift = exactBaseExponent - commonBaseExponent;
  let highShift = high.baseExponent - commonBaseExponent;
  if (exactShift >= 64 || highShift >= 64) {
    return 0u;
  }

  let exactAligned = fp64_u64_shift_left(exactMagnitude, u32(exactShift));
  let highAligned = fp64_u64_shift_left(vec2u(0u, high.significand), u32(highShift));
  let comparison = fp64_u64_compare(exactAligned, highAligned);
  if (comparison == 0) {
    return 0u;
  }

  var residualSign = exactSign;
  var residualMagnitude: vec2u;
  if (comparison > 0) {
    residualMagnitude = fp64_u64_sub(exactAligned, highAligned);
  } else {
    residualSign = exactSign ^ 1u;
    residualMagnitude = fp64_u64_sub(highAligned, exactAligned);
  }
  return fp64_make_f32_bits_from_u64(
    residualSign,
    residualMagnitude,
    commonBaseExponent
  );
}

fn fp64_split_raw_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }
  let highBits = fp64_make_f32_bits_from_u64(sign, magnitude, baseExponent);
  let rawLowBits = fp64_make_raw_residual_f32_bits(sign, magnitude, baseExponent, highBits);
  let lowBits = select(rawLowBits, 0u, (rawLowBits & 0x7fffffffu) == 0u);
  if ((highBits & 0x7fffffffu) == 0u && (lowBits & 0x7fffffffu) == 0u) {
    return vec2u(0u);
  }
  return vec2u(highBits, lowBits);
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
// Round an arithmetic accumulator to binary64 before splitting it. The
// aligned add/subtract paths retain three guard bits plus a sticky bit, which
// is sufficient for round-to-nearest-even at the binary64 boundary.
fn fp64_split_binary64_accumulator_bits(
  sign: u32,
  magnitude: vec2u,
  baseExponent: i32
) -> vec2u {
  if (fp64_u64_is_zero(magnitude)) {
    return vec2u(0u);
  }

  let mostSignificantBit = 63u - fp64_u64_count_leading_zeros(magnitude);
  let exponent = baseExponent + i32(mostSignificantBit);
  if (exponent > 1023) {
    return vec2u((sign << 31u) | 0x7f800000u, 0u);
  }

  var roundedMagnitude = magnitude;
  var roundedBaseExponent = baseExponent;
  if (exponent >= -1022) {
    if (mostSignificantBit > 52u) {
      let shift = mostSignificantBit - 52u;
      roundedMagnitude = fp64_round_shift_right(magnitude, shift);
      roundedBaseExponent = baseExponent + i32(shift);
    }
  } else {
    let shift = -1074 - baseExponent;
    if (shift > 0) {
      roundedMagnitude = fp64_round_shift_right(magnitude, u32(shift));
      roundedBaseExponent = -1074;
    }
  }

  if (fp64_u64_is_zero(roundedMagnitude)) {
    return vec2u(0u);
  }
  return fp64_split_raw_accumulator_bits(sign, roundedMagnitude, roundedBaseExponent);
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_add_raw_f32_bits(aBits: u32, bBits: u32) -> vec2u {
  let a = fp64_decode_raw_f32_bits(aBits);
  let b = fp64_decode_raw_f32_bits(bBits);

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf || b.isInf) {
    if (a.isInf && b.isInf && a.sign != b.sign) {
      return vec2u(0x7fc00000u, 0u);
    }
    return select(vec2u(bBits, 0u), vec2u(aBits, 0u), a.isInf);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }
  if (a.isZero) {
    return vec2u(bBits, 0u);
  }
  if (b.isZero) {
    return vec2u(aBits, 0u);
  }

  let exponentDifference = abs(a.baseExponent - b.baseExponent);
  if (exponentDifference > 25) {
    if (fp64_raw_f32_magnitude_compare(aBits, bBits) >= 0) {
      return vec2u(aBits, bBits);
    }
    return vec2u(bBits, aBits);
  }

  let commonBaseExponent = min(a.baseExponent, b.baseExponent);
  let aMagnitude = fp64_u64_shift_left(
    vec2u(0u, a.significand),
    u32(a.baseExponent - commonBaseExponent)
  );
  let bMagnitude = fp64_u64_shift_left(
    vec2u(0u, b.significand),
    u32(b.baseExponent - commonBaseExponent)
  );

  var resultSign = a.sign;
  var resultMagnitude: vec2u;
  if (a.sign == b.sign) {
    resultMagnitude = fp64_u64_add(aMagnitude, bMagnitude);
  } else {
    let comparison = fp64_u64_compare(aMagnitude, bMagnitude);
    if (comparison == 0) {
      return vec2u(0u);
    }
    if (comparison > 0) {
      resultMagnitude = fp64_u64_sub(aMagnitude, bMagnitude);
    } else {
      resultSign = b.sign;
      resultMagnitude = fp64_u64_sub(bMagnitude, aMagnitude);
    }
  }

  return fp64_split_raw_accumulator_bits(
    resultSign,
    resultMagnitude,
    commonBaseExponent
  );
}
#endif

#ifndef LUMA_FP64_F32_INPUT_ONLY
fn fp64_add_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_sub_aligned_magnitudes_to_fp64_bits(
  sign: u32,
  larger: Fp64Bits,
  smaller: Fp64Bits
) -> vec2u {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_split_binary64_accumulator_bits(
    sign,
    resultSignificand,
    larger.exponent - 55
  );
}

fn fp64_add_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_add(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

fn fp64_sub_aligned_magnitudes_to_f32_bits(sign: u32, larger: Fp64Bits, smaller: Fp64Bits) -> u32 {
  let largeSignificand = fp64_u64_shift_left(larger.significand, 3u);
  let smallSignificand = fp64_u64_shift_right_sticky(
    fp64_u64_shift_left(smaller.significand, 3u),
    u32(larger.exponent - smaller.exponent)
  );
  let resultSignificand = fp64_u64_sub(largeSignificand, smallSignificand);
  return fp64_make_f32_bits_from_u64(sign, resultSignificand, larger.exponent - 55);
}

// Subtract two raw binary64 values and round the exact result once to f32.
// The input words are canonical high/low words: .x contains sign/exponent/high
// fraction bits, and .y contains the low 32 fraction bits.
fn sub_fp64u32_to_f32_bits(aBits: vec2u, bBits: vec2u) -> u32 {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return 0x7fc00000u;
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return (a.sign << 31u) | 0x7f800000u;
    }
    return 0x7fc00000u;
  }
  if (a.isInf) {
    return (a.sign << 31u) | 0x7f800000u;
  }
  if (b.isInf) {
    return (bSubtractionSign << 31u) | 0x7f800000u;
  }
  if (a.isZero && b.isZero) {
    return select(0u, 0x80000000u, a.sign == 1u && b.sign == 0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_f32_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return 0u;
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_f32_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_f32_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_f32(aBits: vec2u, bBits: vec2u) -> f32 {
  return bitcast<f32>(sub_fp64u32_to_f32_bits(aBits, bBits));
}

// Subtract two raw binary64 values, round once to binary64, then split the
// result into normalized f32 limbs. Finite results must fit within the f32
// exponent range; larger magnitudes map to infinity and smaller magnitudes
// map to zero. The input words use canonical high/low word order.
fn sub_fp64u32_to_fp64_bits(aBits: vec2u, bBits: vec2u) -> vec2u {
  let a = fp64_decode_bits(aBits);
  let b = fp64_decode_bits(bBits);
  let bSubtractionSign = b.sign ^ 1u;

  if (a.isNan || b.isNan) {
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf && b.isInf) {
    if (a.sign == bSubtractionSign) {
      return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
    }
    return vec2u(0x7fc00000u, 0u);
  }
  if (a.isInf) {
    return vec2u((a.sign << 31u) | 0x7f800000u, 0u);
  }
  if (b.isInf) {
    return vec2u((bSubtractionSign << 31u) | 0x7f800000u, 0u);
  }
  if (a.isZero && b.isZero) {
    return vec2u(0u);
  }

  let magnitudeComparison = fp64_finite_magnitude_compare(a, b);
  if (a.sign == bSubtractionSign) {
    if (magnitudeComparison >= 0) {
      return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
    }
    return fp64_add_aligned_magnitudes_to_fp64_bits(a.sign, b, a);
  }

  if (magnitudeComparison == 0) {
    return vec2u(0u);
  }
  if (magnitudeComparison > 0) {
    return fp64_sub_aligned_magnitudes_to_fp64_bits(a.sign, a, b);
  }
  return fp64_sub_aligned_magnitudes_to_fp64_bits(bSubtractionSign, b, a);
}

fn sub_fp64u32_to_fp64(aBits: vec2u, bBits: vec2u) -> vec2f {
  let resultBits = sub_fp64u32_to_fp64_bits(aBits, bBits);
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_runtime_zero() -> f32 {
  return fp64arithmetic.ONE * 0.0;
}

fn prevent_fp64_optimization(value: f32) -> f32 {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  return value + fp64_runtime_zero();
#else
  return value;
#endif
}
#endif

#ifdef LUMA_FP64_INTEGER_ARITHMETIC
${a}
#else
#ifdef LUMA_FP64_HYBRID_ARITHMETIC
${o}
#else
fn split(a: f32) -> vec2f {
  let splitValue = prevent_fp64_optimization(fp64arithmetic.SPLIT + fp64_runtime_zero());
  let t = prevent_fp64_optimization(a * splitValue);
  let temp = prevent_fp64_optimization(t - a);
  let aHi = prevent_fp64_optimization(t - temp);
  let aLo = prevent_fp64_optimization(a - aHi);
  return vec2f(aHi, aLo);
}

fn split2(a: vec2f) -> vec2f {
  var b = split(a.x);
  b.y = b.y + a.y;
  return b;
}

fn quickTwoSum(a: f32, b: f32) -> vec2f {
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let sum = prevent_fp64_optimization((a + b) * fp64arithmetic.ONE);
  let err = prevent_fp64_optimization(b - (sum - a) * fp64arithmetic.ONE);
#else
  let sum = prevent_fp64_optimization(a + b);
  let err = prevent_fp64_optimization(b - (sum - a));
#endif
  return vec2f(sum, err);
}

fn twoSum(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a + b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) +
    prevent_fp64_optimization(b - v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) + prevent_fp64_optimization(b - v);
#endif
  return vec2f(s, err);
}

fn twoSub(a: f32, b: f32) -> vec2f {
  let s = prevent_fp64_optimization(a - b);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let v = prevent_fp64_optimization((s * fp64arithmetic.ONE - a) * fp64arithmetic.ONE);
  let err =
    prevent_fp64_optimization((a - (s - v) * fp64arithmetic.ONE) *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE *
      fp64arithmetic.ONE) -
    prevent_fp64_optimization(b + v);
#else
  let v = prevent_fp64_optimization(s - a);
  let err = prevent_fp64_optimization(a - (s - v)) - prevent_fp64_optimization(b + v);
#endif
  return vec2f(s, err);
}

fn twoSqr(a: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * a);
  let aFp64 = split(a);
  let highProduct = prevent_fp64_optimization(aFp64.x * aFp64.x);
  let crossProduct = prevent_fp64_optimization(2.0 * aFp64.x * aFp64.y);
  let lowProduct = prevent_fp64_optimization(aFp64.y * aFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err =
    (prevent_fp64_optimization(highProduct - prod) * fp64arithmetic.ONE +
      crossProduct * fp64arithmetic.ONE * fp64arithmetic.ONE) +
    lowProduct * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
#else
  let err = ((prevent_fp64_optimization(highProduct - prod) + crossProduct) + lowProduct);
#endif
  return vec2f(prod, err);
}

fn twoProd(a: f32, b: f32) -> vec2f {
  let prod = prevent_fp64_optimization(a * b);
  let aFp64 = split(a);
  let bFp64 = split(b);
  let highProduct = prevent_fp64_optimization(aFp64.x * bFp64.x);
  let crossProduct1 = prevent_fp64_optimization(aFp64.x * bFp64.y);
  let crossProduct2 = prevent_fp64_optimization(aFp64.y * bFp64.x);
  let lowProduct = prevent_fp64_optimization(aFp64.y * bFp64.y);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let err1 = (highProduct - prod) * fp64arithmetic.ONE;
  let err2 = crossProduct1 * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err3 = crossProduct2 * fp64arithmetic.ONE * fp64arithmetic.ONE * fp64arithmetic.ONE;
  let err4 =
    lowProduct *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE *
    fp64arithmetic.ONE;
#else
  let err1 = highProduct - prod;
  let err2 = crossProduct1;
  let err3 = crossProduct2;
  let err4 = lowProduct;
#endif
  let err12InputA = prevent_fp64_optimization(err1);
  let err12InputB = prevent_fp64_optimization(err2);
  let err12 = prevent_fp64_optimization(err12InputA + err12InputB);
  let err123InputA = prevent_fp64_optimization(err12);
  let err123InputB = prevent_fp64_optimization(err3);
  let err123 = prevent_fp64_optimization(err123InputA + err123InputB);
  let err1234InputA = prevent_fp64_optimization(err123);
  let err1234InputB = prevent_fp64_optimization(err4);
  let err = prevent_fp64_optimization(err1234InputA + err1234InputB);
  return vec2f(prod, err);
}

fn sum_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSum(a.x, b.x);
  let t = twoSum(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn sub_fp64(a: vec2f, b: vec2f) -> vec2f {
  var s = twoSub(a.x, b.x);
  let t = twoSub(a.y, b.y);
  s.y = prevent_fp64_optimization(s.y + t.x);
  s = quickTwoSum(s.x, s.y);
  s.y = prevent_fp64_optimization(s.y + t.y);
  s = quickTwoSum(s.x, s.y);
  return s;
}

fn mul_fp64(a: vec2f, b: vec2f) -> vec2f {
  var prod = twoProd(a.x, b.x);
  let crossProduct1 = prevent_fp64_optimization(a.x * b.y);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct1);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  let crossProduct2 = prevent_fp64_optimization(a.y * b.x);
  prod.y = prevent_fp64_optimization(prod.y + crossProduct2);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  prod = split2(prod);
#endif
  prod = quickTwoSum(prod.x, prod.y);
  return prod;
}

#ifndef LUMA_FP64_PREDICATE_ONLY
fn div_fp64(a: vec2f, b: vec2f) -> vec2f {
  let xn = prevent_fp64_optimization(1.0 / b.x);
  let yn = mul_fp64(a, vec2f(xn, fp64_runtime_zero()));
  let diff = prevent_fp64_optimization(sub_fp64(a, mul_fp64(b, yn)).x);
  let prod = twoProd(xn, diff);
  return sum_fp64(yn, prod);
}

fn sqrt_fp64(a: vec2f) -> vec2f {
  if (a.x == 0.0 && a.y == 0.0) {
    return vec2f(0.0, 0.0);
  }
  if (a.x < 0.0) {
    let nanValue = fp64_nan(a.x);
    return vec2f(nanValue, nanValue);
  }

  let x = prevent_fp64_optimization(1.0 / sqrt(a.x));
  let yn = prevent_fp64_optimization(a.x * x);
#ifdef LUMA_FP64_CODE_ELIMINATION_WORKAROUND
  let ynSqr = twoSqr(yn) * fp64arithmetic.ONE;
#else
  let ynSqr = twoSqr(yn);
#endif
  let diff = prevent_fp64_optimization(sub_fp64(a, ynSqr).x);
  let prod = twoProd(prevent_fp64_optimization(x * 0.5), diff);
#ifdef LUMA_FP64_HIGH_BITS_OVERFLOW_WORKAROUND
  return sum_fp64(split(yn), prod);
#else
  return sum_fp64(vec2f(yn, 0.0), prod);
#endif
}
#endif
#endif
#endif

#ifndef LUMA_FP64_PREDICATE_ONLY
fn fp64_f32_bits_is_nan(bits: u32) -> bool {
  return (bits & 0x7fffffffu) > 0x7f800000u;
}

fn fp64_f32_bits_is_inf(bits: u32) -> bool {
  return (bits & 0x7fffffffu) == 0x7f800000u;
}

fn fp64_compare_f32_bits(aBits: u32, bBits: u32) -> i32 {
  let aMagnitude = aBits & 0x7fffffffu;
  let bMagnitude = bBits & 0x7fffffffu;
  if (aMagnitude == 0u && bMagnitude == 0u) {
    return 0;
  }
  let aSign = aBits >> 31u;
  let bSign = bBits >> 31u;
  if (aSign != bSign) {
    return select(1, -1, aSign == 1u);
  }
  if (aMagnitude == bMagnitude) {
    return 0;
  }
  let magnitudeComparison = select(-1, 1, aMagnitude > bMagnitude);
  return select(magnitudeComparison, -magnitudeComparison, aSign == 1u);
}

// Normalize an arbitrary pair of finite f32 limbs with integer accumulation.
// This is independent of LUMA_FP64_INTEGER_ARITHMETIC and canonicalizes every
// representation of zero to vec2f(+0.0, +0.0).
fn normalize_fp64(value: vec2f) -> vec2f {
  let resultBits = fp64_add_raw_f32_bits(bitcast<u32>(value.x), bitcast<u32>(value.y));
  return vec2f(bitcast<f32>(resultBits.x), bitcast<f32>(resultBits.y));
}

fn is_nan_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  return fp64_f32_bits_is_nan(bitcast<u32>(normalized.x)) ||
    fp64_f32_bits_is_nan(bitcast<u32>(normalized.y));
}

fn is_finite_fp64(value: vec2f) -> bool {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  return !fp64_f32_bits_is_nan(highBits) && !fp64_f32_bits_is_nan(lowBits) &&
    !fp64_f32_bits_is_inf(highBits) && !fp64_f32_bits_is_inf(lowBits);
}

// Returns -1, 0, or 1. NaN is unordered and returns 0; call is_nan_fp64 or
// is_finite_fp64 first when 0 must mean a finite zero.
fn sign_fp64(value: vec2f) -> i32 {
  let normalized = normalize_fp64(value);
  let highBits = bitcast<u32>(normalized.x);
  let lowBits = bitcast<u32>(normalized.y);
  if (fp64_f32_bits_is_nan(highBits) || fp64_f32_bits_is_nan(lowBits)) {
    return 0;
  }
  if ((highBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (highBits >> 31u) == 1u);
  }
  if ((lowBits & 0x7fffffffu) != 0u) {
    return select(1, -1, (lowBits >> 31u) == 1u);
  }
  return 0;
}

// Compares double-single values and returns -1, 0, or 1. NaN is unordered
// and returns 0; callers that require equality semantics must first check
// is_nan_fp64 or is_finite_fp64.
fn compare_fp64(a: vec2f, b: vec2f) -> i32 {
  let normalizedA = normalize_fp64(a);
  let normalizedB = normalize_fp64(b);
  let aHighBits = bitcast<u32>(normalizedA.x);
  let aLowBits = bitcast<u32>(normalizedA.y);
  let bHighBits = bitcast<u32>(normalizedB.x);
  let bLowBits = bitcast<u32>(normalizedB.y);
  if (fp64_f32_bits_is_nan(aHighBits) || fp64_f32_bits_is_nan(aLowBits) ||
      fp64_f32_bits_is_nan(bHighBits) || fp64_f32_bits_is_nan(bLowBits)) {
    return 0;
  }
  let highComparison = fp64_compare_f32_bits(aHighBits, bHighBits);
  if (highComparison != 0) {
    return highComparison;
  }
  return fp64_compare_f32_bits(aLowBits, bLowBits);
}
#endif
`,fs:n,vs:n,defaultUniforms:{ONE:1,SPLIT:4097},uniformTypes:{ONE:"f32",SPLIT:"f32"},fp64ify:i,fp64LowPart:function(e){return e-Math.fround(e)},fp64ifyMatrix4:function(e){let t=new Float32Array(32);for(let r=0;r<4;++r)for(let n=0;n<4;++n){let s=4*r+n;i(e[4*n+r],t,2*s)}return t}}},94392(e,t,r){r.d(t,{c9:()=>d,bd:()=>g,Gu:()=>_,jW:()=>b,V2:()=>n,Kx:()=>p,mU:()=>o});let i=0;class n{constructor(e){this.userData={},this.id=e.id||`geometry-${++i}`,this.topology=e.topology,this.attributes={};let t=e.indices?s(e.indices):void 0;for(let[r,i]of Object.entries(e.attributes||{})){let e=s(i);if(("POSITION"===r||"positions"===r)&&(e.size||(e.size=3)),"indices"===r){if(t)throw Error("Geometry has multiple index attributes");t=e}else this.attributes[r]=e}if(t){if(!(t.value instanceof Uint16Array||t.value instanceof Uint32Array))throw Error("Geometry indices must be a Uint16Array or Uint32Array");t.size=1,this.indices=t,function(e,t){let r=-1;for(let t of e.value)r=Math.max(r,Number(t));for(let[e,i]of Object.entries(t))if(!i.constant&&i.size){let t=i.value.length/i.size;if(r>=t)throw Error(`Geometry index ${r} exceeds ${e} vertex count ${t}`)}}(t,this.attributes)}if(this.vertexCount=e.vertexCount??function(e,t){if(t)return t.value.length;let r=1/0;for(let t of Object.values(e))!t.constant&&t.size&&(r=Math.min(r,t.value.length/t.size));if(!Number.isFinite(r))throw Error("Geometry has no countable attributes");return r}(this.attributes,this.indices),!Number.isInteger(this.vertexCount)||this.vertexCount<0)throw Error("Geometry vertexCount must be a non-negative integer")}getVertexCount(){return this.vertexCount}getAttributes(){return this.indices?{indices:this.indices,...this.attributes}:this.attributes}}function s(e){let t=a(e)?{value:e}:{...e};if(!a(t.value))throw Error("Geometry attributes must contain a typed-array value");if(void 0!==t.size&&(!Number.isInteger(t.size)||t.size<1))throw Error("Geometry attribute size must be a positive integer");if(t.size&&t.value.length%t.size!=0)throw Error("Geometry attribute length must be divisible by its size");return t}function a(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function o(e){if(!e.indices)return e;let t=e.indices.value,r={};for(let[i,n]of Object.entries(e.attributes)){if(!n)continue;if(n.constant||!n.size){r[i]=n;continue}let e=new n.value.constructor(t.length*n.size);for(let r=0;r<t.length;r++)for(let i=0;i<n.size;i++)e[r*n.size+i]=n.value[Number(t[r])*n.size+i];r[i]={...n,value:e}}return{attributes:r}}function u(e,t){if(!Number.isFinite(e)||e<=0)throw Error(`${t} must be greater than zero`)}function l(e,t){if(!Number.isFinite(e)||e<0)throw Error(`${t} must be non-negative`)}function f(e,t,r=1){if(!Number.isInteger(e)||e<r)throw Error(`${t} must be an integer >= ${r}`)}function c(e,t){return e>65535?new Uint32Array(t):new Uint16Array(t)}class h extends n{constructor(e={}){let t=e.size||[1,1,1];u(t[0],"size[0]"),u(t[1],"size[1]"),u(t[2],"size[2]");let r=[t[0]/2,t[1]/2,t[2]/2],i=[],n=[],s=[],a=[];for(let e of[{n:[1,0,0],u:[0,0,-1],v:[0,1,0],h1:r[2],h2:r[1]},{n:[-1,0,0],u:[0,0,1],v:[0,1,0],h1:r[2],h2:r[1]},{n:[0,1,0],u:[1,0,0],v:[0,0,-1],h1:r[0],h2:r[2]},{n:[0,-1,0],u:[1,0,0],v:[0,0,1],h1:r[0],h2:r[2]},{n:[0,0,1],u:[1,0,0],v:[0,1,0],h1:r[0],h2:r[1]},{n:[0,0,-1],u:[-1,0,0],v:[0,1,0],h1:r[0],h2:r[1]}]){let t=i.length/3;for(let[t,a,o,u]of[[-1,-1,0,0],[1,-1,1,0],[1,1,1,1],[-1,1,0,1]])i.push(e.n[0]*r[0]+e.u[0]*e.h1*t+e.v[0]*e.h2*a,e.n[1]*r[1]+e.u[1]*e.h1*t+e.v[1]*e.h2*a,e.n[2]*r[2]+e.u[2]*e.h1*t+e.v[2]*e.h2*a),n.push(...e.n),s.push(o,u);a.push(t,t+1,t+2,t,t+2,t+3)}super({id:e.id,topology:"triangle-list",indices:c(24,a),attributes:{POSITION:{size:3,value:new Float32Array(i)},NORMAL:{size:3,value:new Float32Array(n)},TEXCOORD_0:{size:2,value:new Float32Array(s)},...e.attributes}})}}class d extends h{constructor(e={}){let t=e.size??1;super({...e,size:[t,t,t]})}}class p extends n{constructor(e={}){let t,{topRadius:r=0,bottomRadius:i=0,topCap:n=!1,bottomCap:s=!1,height:a=1,nradial:o=10,nvertical:h=1,verticalAxis:d="y"}=e;if(l(r,"topRadius"),l(i,"bottomRadius"),0===r&&0===i)throw Error("At least one radius must be greater than zero");u(a,"height"),f(o,"nradial",3),f(h,"nvertical");let p=[],g=[],_=[],b=[],y=o+1,v=(i-r)/a,w=1/Math.hypot(1,v),E=(e,t,r,i,n)=>{let s=p.length/3/y;for(let s=0;s<=o;s++){let a=s/o,u=a*Math.PI*2,l=Math.sin(u),f=Math.cos(u),c=m([l*e,t,f*e],d),h=m([l*r,i,f*r],d);p.push(...c),g.push(...h),_.push(a,n)}return s},x=(e,t)=>{for(let r=0;r<o;r++){let i=e*y+r,n=i+1,s=t*y+r,a=s+1;b.push(i,n,a,i,a,s)}};s&&(x(E(0,-a/2,0,-1,0),E(i,-a/2,0,-1,1)),t=E(i,-a/2,w,v*w,0));for(let e=0;e<=h;e++){let n=e/h,o=E(i+(r-i)*n,(n-.5)*a,w,v*w,n);void 0===t||s&&0===e||x(t,o),t=o}n&&void 0!==t&&x(E(r,a/2,0,1,1),E(0,a/2,0,1,0));let S=p.length/3;super({id:e.id,topology:"triangle-list",indices:c(S,b),attributes:{POSITION:{size:3,value:new Float32Array(p)},NORMAL:{size:3,value:new Float32Array(g)},TEXCOORD_0:{size:2,value:new Float32Array(_)},...e.attributes}})}}function m(e,t){switch(t){case"x":return[e[1],e[2],e[0]];case"z":return[e[2],e[0],e[1]];default:return[e[0],e[1],e[2]]}}class g extends n{constructor(e){let{sizeX:t,sizeZ:r,nx:i=1,nz:n=1}=e;u(t,"sizeX"),u(r,"sizeZ"),f(i,"nx"),f(n,"nz");let s=[],a=[],o=[],l=[];for(let e=0;e<=n;e++){let u=e/n;for(let e=0;e<=i;e++){let n=e/i;s.push((n-.5)*t,0,(.5-u)*r),a.push(0,1,0),o.push(n,u)}}let h=i+1;for(let e=0;e<n;e++)for(let t=0;t<i;t++){let r=e*h+t,i=r+1,n=r+h,s=n+1;l.push(r,i,s,r,s,n)}let d=s.length/3;super({id:e.id,topology:"triangle-list",indices:c(d,l),attributes:{POSITION:{size:3,value:new Float32Array(s)},NORMAL:{size:3,value:new Float32Array(a)},TEXCOORD_0:{size:2,value:new Float32Array(o)},...e.attributes}})}}class _ extends n{constructor(e={}){let{radius:t=.5,nlat:r=10,nlong:i=10}=e;u(t,"radius"),f(r,"nlat",2),f(i,"nlong",3);let n=[];for(let e=0;e<=r;e++){let i=-Math.PI/2+e/r*Math.PI,s=Math.cos(i),a=Math.sin(i);n.push({radius:t*s,y:t*a,normalRadius:s,normalY:a})}let s=function(e,t){let r=[],i=[],n=[],s=[],a=t+1;for(let s=0;s<e.length;s++){let a=e[s];for(let o=0;o<=t;o++){let u=o/t,l=u*Math.PI*2,f=Math.sin(l),c=Math.cos(l);r.push(f*a.radius,a.y,c*a.radius),i.push(f*a.normalRadius,a.normalY,c*a.normalRadius),n.push(u,s/(e.length-1))}}for(let r=0;r<e.length-1;r++)for(let e=0;e<t;e++){let t=r*a+e,i=t+1,n=t+a,o=n+1;s.push(t,i,o,t,o,n)}return{...{positions:r,normals:i,texCoords:n,indices:s},indexArray:c(r.length/3,s)}}(n,i);super({id:e.id,topology:"triangle-list",indices:s.indexArray,attributes:{POSITION:{size:3,value:new Float32Array(s.positions)},NORMAL:{size:3,value:new Float32Array(s.normals)},TEXCOORD_0:{size:2,value:new Float32Array(s.texCoords)},...e.attributes}})}}class b extends n{constructor(e={}){let{radius:t=.5,iterations:r=0}=e;if(u(t,"radius"),f(r,"iterations",0),r>8)throw Error("iterations must be <= 8");let i=(1+Math.sqrt(5))/2,n=[[-1,i,0],[1,i,0],[-1,-i,0],[1,-i,0],[0,-1,i],[0,1,i],[0,-1,-i],[0,1,-i],[i,0,-1],[i,0,1],[-i,0,-1],[-i,0,1]].map(y),s=[[0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],[1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],[3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],[4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]].map(e=>e.map(e=>n[e]));for(let e=0;e<r;e++){let e=[];for(let[t,r,i]of s){let n=y([t[0]+r[0],t[1]+r[1],t[2]+r[2]]),s=y([r[0]+i[0],r[1]+i[1],r[2]+i[2]]),a=y([i[0]+t[0],i[1]+t[1],i[2]+t[2]]);e.push([t,n,a],[r,s,n],[i,a,s],[n,s,a])}s=e}let a=[],o=[],l=[];for(let e of s)for(let r of e)a.push(r[0]*t,r[1]*t,r[2]*t),o.push(...r),l.push(.5+Math.atan2(r[0],r[2])/(2*Math.PI),.5-Math.asin(r[1])/Math.PI);super({id:e.id,topology:"triangle-list",attributes:{POSITION:{size:3,value:new Float32Array(a)},NORMAL:{size:3,value:new Float32Array(o)},TEXCOORD_0:{size:2,value:new Float32Array(l)},...e.attributes}})}}function y(e){let t=Math.hypot(...e);return e.map(e=>e/t)}},9173(e,t,r){r.d(t,{v:()=>i});function i(e,t){if(!e)throw Error(t||"@math.gl/web-mercator: assertion failed.")}},20556(e,t,r){r.d(t,{F:()=>a});var i=r(9173),n=r(17733),s=r(86083);function a(e){let{width:t,height:r,bounds:a,minExtent:o=0,maxZoom:u=24,offset:l=[0,0]}=e,[[f,c],[h,d]]=a,p=function(e=0){return"number"==typeof e?{top:e,bottom:e,left:e,right:e}:((0,i.v)(Number.isFinite(e.top)&&Number.isFinite(e.bottom)&&Number.isFinite(e.left)&&Number.isFinite(e.right)),e)}(e.padding),m=(0,s.Gw)([f,(0,n.qE)(d,-s.aH,s.aH)]),g=(0,s.Gw)([h,(0,n.qE)(c,-s.aH,s.aH)]),_=[Math.max(Math.abs(g[0]-m[0]),o),Math.max(Math.abs(g[1]-m[1]),o)],b=[t-p.left-p.right-2*Math.abs(l[0]),r-p.top-p.bottom-2*Math.abs(l[1])];(0,i.v)(b[0]>0&&b[1]>0);let y=b[0]/_[0],v=b[1]/_[1],w=(p.right-p.left)/2/y,E=(p.top-p.bottom)/2/v,x=[(g[0]+m[0])/2+w,(g[1]+m[1])/2+E],S=(0,s.iV)(x),A=Math.min(u,(0,n.p6)(Math.abs(Math.min(y,v))));return(0,i.v)(Number.isFinite(A)),{longitude:S[0],latitude:S[1],zoom:A}}},62905(e,t,r){r.d(t,{g:()=>o});var i=r(58486),n=r(86083),s=r(17733);let a=Math.PI/180;function o(e,t=0){let r,i,{width:n,height:s,unproject:l}=e,f={targetZ:t},c=l([0,s],f),h=l([n,s],f);return(e.fovy?.5*e.fovy*a:Math.atan(.5/e.altitude))>(90-e.pitch)*a-.01?(r=u(e,0,t),i=u(e,n,t)):(r=l([0,0],f),i=l([n,0],f)),[c,h,i,r]}function u(e,t,r){let{pixelUnprojectionMatrix:a}=e,o=(0,s._U)(a,[t,0,1,1]),u=(0,s._U)(a,[t,e.height,1,1]),l=(r*e.distanceScales.unitsPerMeter[2]-o[2])/(u[2]-o[2]),f=i.Cc([],o,u,l),c=(0,n.iV)(f);return c.push(r),c}},17733(e,t,r){r.d(t,{$M:()=>n,Cc:()=>a,_U:()=>s,p6:()=>u,qE:()=>o});var i=r(10400);function n(){return[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]}function s(e,t){let r=i.Z0([],t,e);return i.hs(r,r,1/r[3]),r}function a(e,t,r){return r*t+(1-r)*e}function o(e,t,r){return e<t?t:e>r?r:e}let u=Math.log2||function(e){return Math.log(e)*Math.LOG2E}},86083(e,t,r){r.d(t,{Gw:()=>m,J9:()=>p,Os:()=>x,VJ:()=>A,XM:()=>d,aH:()=>h,dT:()=>v,fO:()=>_,iV:()=>g,mY:()=>b,nI:()=>y,om:()=>E,rY:()=>w,wZ:()=>S,xJ:()=>L});var i=r(17733),n=r(46840),s=r(58486),a=r(50549),o=r(9173);let u=Math.PI,l=u/4,f=u/180,c=180/u,h=85.051129;function d(e){return Math.pow(2,e)}function p(e){return(0,i.p6)(e)}function m(e){let[t,r]=e;(0,o.v)(Number.isFinite(t)),(0,o.v)(Number.isFinite(r)&&r>=-90&&r<=90,"invalid latitude");let i=512*(u+Math.log(Math.tan(l+r*f*.5)))/(2*u);return[512*(t*f+u)/(2*u),i]}function g(e){let[t,r]=e,i=2*(Math.atan(Math.exp(r/512*(2*u)-u))-l);return[(t/512*(2*u)-u)*c,i*c]}function _(e){let{latitude:t}=e;return(0,o.v)(Number.isFinite(t)),p(4003e4*Math.cos(t*f))-9}function b(e){return 512/4003e4/Math.cos(e*f)}function y(e){let{latitude:t,longitude:r,highPrecision:i=!1}=e;(0,o.v)(Number.isFinite(t)&&Number.isFinite(r));let n=Math.cos(t*f),s=512/360/n,a=512/4003e4/n,u={unitsPerMeter:[a,a,a],metersPerUnit:[1/a,1/a,1/a],unitsPerDegree:[512/360,s,a],degreesPerUnit:[1/(512/360),1/s,1/a]};if(i){let e=f*Math.tan(t*f)/n,r=512/4003e4*e,i=r/s*a;u.unitsPerDegree2=[0,512/360*e/2,r],u.unitsPerMeter2=[i,0,i]}return u}function v(e,t){let[r,i,n]=e,[s,a,o]=t,{unitsPerMeter:u,unitsPerMeter2:l}=y({longitude:r,latitude:i,highPrecision:!0}),f=m(e);f[0]+=s*(u[0]+l[0]*a),f[1]+=a*(u[1]+l[1]*a);let c=g(f);return Number.isFinite(n)||Number.isFinite(o)?[c[0],c[1],(n||0)+(o||0)]:c}function w(e){let{height:t,pitch:r,bearing:s,altitude:o,scale:u,center:l}=e,c=(0,i.$M)();n.Tl(c,c,[0,0,-o]),n.eL(c,c,-r*f),n.Qr(c,c,s*f);let h=u/t;return n.hs(c,c,[h,h,h]),l&&n.Tl(c,c,a.ze([],l)),c}function E(e){let{width:t,height:r,altitude:n,pitch:s=0,offset:a,center:o,scale:u,nearZMultiplier:l=1,farZMultiplier:c=1}=e,{fovy:h=x(1.5)}=e;void 0!==n&&(h=x(n));let d=h*f,p=s*f,m=S(h),g=m;o&&(g+=o[2]*u/Math.cos(p)/r);let _=d*(.5+(a?a[1]:0)/r),b=Math.sin(_)*g/Math.sin((0,i.qE)(Math.PI/2-p-_,.01,Math.PI-.01));return{fov:d,aspect:t/r,focalDistance:m,near:l,far:Math.min((Math.sin(p)*b+g)*c,10*g)}}function x(e){return 2*Math.atan(.5/e)*c}function S(e){return .5/Math.tan(.5*e*f)}function A(e,t){let[r,n,s=0]=e;return(0,o.v)(Number.isFinite(r)&&Number.isFinite(n)&&Number.isFinite(s)),(0,i._U)(t,[r,n,s,1])}function L(e,t,r=0){let[n,a,u]=e;if((0,o.v)(Number.isFinite(n)&&Number.isFinite(a),"invalid pixel coordinate"),Number.isFinite(u))return(0,i._U)(t,[n,a,u,1]);let l=(0,i._U)(t,[n,a,0,1]),f=(0,i._U)(t,[n,a,1,1]),c=l[2],h=f[2];return s.Cc([],l,f,c===h?0:((r||0)-c)/(h-c))}},39171(e,t,r){var i,n,s,a,o,u;r.d(t,{Cx:()=>R,uq:()=>U,Cp:()=>k,EU:()=>ei,h1:()=>D}),(a=i||(i={}))[a.Start=1]="Start",a[a.Move=2]="Move",a[a.End=4]="End",a[a.Cancel=8]="Cancel",(o=n||(n={}))[o.None=0]="None",o[o.Left=1]="Left",o[o.Right=2]="Right",o[o.Up=4]="Up",o[o.Down=8]="Down",o[o.Horizontal=3]="Horizontal",o[o.Vertical=12]="Vertical",o[o.All=15]="All",(u=s||(s={}))[u.Possible=1]="Possible",u[u.Began=2]="Began",u[u.Changed=4]="Changed",u[u.Ended=8]="Ended",u[u.Recognized=8]="Recognized",u[u.Cancelled=16]="Cancelled",u[u.Failed=32]="Failed";let l="manipulation";class f{constructor(e,t){this.actions="",this.manager=e,this.set(t)}set(e){"compute"===e&&(e=this.compute()),this.manager.element&&(this.manager.element.style.touchAction=e,this.actions=e)}update(){this.set(this.manager.options.touchAction)}compute(){let e=[];for(let t of this.manager.recognizers)t.options.enable&&(e=e.concat(t.getTouchAction()));var t=e.join(" ");if(t.includes("none"))return"none";let r=t.includes("pan-x"),i=t.includes("pan-y");return r&&i?"none":r||i?r?"pan-x":"pan-y":t.includes(l)?l:"auto"}}function c(e){return e.trim().split(/\s+/g)}function h(e,t,r){if(e)for(let i of c(t))e.addEventListener(i,r,!1)}function d(e,t,r){if(e)for(let i of c(t))e.removeEventListener(i,r,!1)}function p(e){return(e.ownerDocument||e).defaultView}function m(e){let t=e.length;if(1===t)return{x:Math.round(e[0].clientX),y:Math.round(e[0].clientY)};let r=0,i=0,n=0;for(;n<t;)r+=e[n].clientX,i+=e[n].clientY,n++;return{x:Math.round(r/t),y:Math.round(i/t)}}function g(e){let t=[],r=0;for(;r<e.pointers.length;)t[r]={clientX:Math.round(e.pointers[r].clientX),clientY:Math.round(e.pointers[r].clientY)},r++;return{timeStamp:Date.now(),pointers:t,center:m(t),deltaX:e.deltaX,deltaY:e.deltaY}}function _(e,t){let r=t.x-e.x,i=t.y-e.y;return Math.sqrt(r*r+i*i)}function b(e,t){let r=t.clientX-e.clientX,i=t.clientY-e.clientY;return Math.sqrt(r*r+i*i)}function y(e,t){let r=t.clientX-e.clientX;return 180*Math.atan2(t.clientY-e.clientY,r)/Math.PI}function v(e,t){return e===t?n.None:Math.abs(e)>=Math.abs(t)?e<0?n.Left:n.Right:t<0?n.Up:n.Down}function w(e,t,r){return{x:t/e||0,y:r/e||0}}function E(e,t){return"pointerId"in e?e.pointerId:t}function x(e,t){e.movementOrigin=new Map(t.map((e,t)=>[E(e,t),{clientX:e.clientX,clientY:e.clientY}])),e.firstMovementTime=void 0}class S{constructor(e){this.evEl="",this.evWin="",this.evTarget="",this.domHandler=e=>{this.manager.options.enable&&this.handler(e)},this.manager=e,this.element=e.element,this.target=e.options.inputTarget||e.element}callback(e,t){var r;let n,s,a,o,u;r=this.manager,n=t.pointers.length,s=t.changedPointers.length,a=e&i.Start&&n-s==0,o=e&(i.End|i.Cancel)&&n-s==0,t.isFirst=!!a,t.isFinal=!!o,a&&(r.session={}),t.eventType=e,u=function(e,t){var r,n;let s,a,o,u,l,{session:f}=e,{pointers:c}=t,{length:h}=c;f.firstInput||(f.firstInput=g(t)),h>1&&!f.firstMultiple?f.firstMultiple=g(t):1===h&&(f.firstMultiple=!1);let{firstInput:d,firstMultiple:p}=f,S=p?p.center:d.center,A=t.center=m(c);t.timeStamp=Date.now(),t.deltaTime=t.timeStamp-d.timeStamp;let L=t.pointers.map(E);if(f.movementOrigin?.size===L.length&&L.every(e=>f.movementOrigin.has(e))||x(f,t.pointers),t.distancePerPointer=t.pointers.map((e,t)=>b(f.movementOrigin.get(L[t]),e)),t.eventType&i.Move&&t.distancePerPointer.some(e=>e>0)&&(f.firstMovementTime??(f.firstMovementTime=t.timeStamp)),t.movementDeltaTime=void 0===f.firstMovementTime?0:t.timeStamp-f.firstMovementTime,t.eventType&(i.End|i.Cancel)){let e=t.changedPointers.map(e=>E(e,t.pointers.indexOf(e)));x(f,t.pointers.filter((t,r)=>!e.includes(L[r])))}s=A.x-S.x,t.angle=180*Math.atan2(A.y-S.y,s)/Math.PI,t.distance=_(S,A);let{deltaX:P,deltaY:B}=(a=t.center,o=f.offsetDelta,u=f.prevDelta,l=f.prevInput,(t.eventType===i.Start||l?.eventType===i.End)&&(u=f.prevDelta={x:l?.deltaX||0,y:l?.deltaY||0},o=f.offsetDelta={x:a.x,y:a.y}),{deltaX:u.x+(a.x-o.x),deltaY:u.y+(a.y-o.y)});t.deltaX=P,t.deltaY=B,t.offsetDirection=v(t.deltaX,t.deltaY);let T=w(t.deltaTime,t.deltaX,t.deltaY);t.overallVelocityX=T.x,t.overallVelocityY=T.y,t.overallVelocity=Math.abs(T.x)>Math.abs(T.y)?T.x:T.y,t.scale=p?(r=p.pointers,b(c[0],c[1])/b(r[0],r[1])):1,t.rotation=p?(n=p.pointers,y(c[1],c[0])-y(n[1],n[0])):0,t.maxPointers=f.prevInput?t.pointers.length>f.prevInput.maxPointers?t.pointers.length:f.prevInput.maxPointers:t.pointers.length;let M=e.element;return function(e,t){let r=e;for(;r;){if(r===t)return!0;r=r.parentNode}return!1}(t.srcEvent.target,M)&&(M=t.srcEvent.target),t.target=M,!function(e,t){let r,n,s,a,o=e.lastInterval||t,u=t.timeStamp-o.timeStamp;if(t.eventType!==i.Cancel&&(u>25||void 0===o.velocity)){let i=t.deltaX-o.deltaX,l=t.deltaY-o.deltaY,f=w(u,i,l);n=f.x,s=f.y,r=Math.abs(f.x)>Math.abs(f.y)?f.x:f.y,a=v(i,l),e.lastInterval=t}else r=o.velocity,n=o.velocityX,s=o.velocityY,a=o.direction;t.velocity=r,t.velocityX=n,t.velocityY=s,t.direction=a}(f,t),t}(r,t),r.emit("hammer.input",u),r.recognize(u),r.session.prevInput=u}init(){h(this.element,this.evEl,this.domHandler),h(this.target,this.evTarget,this.domHandler),h(p(this.element),this.evWin,this.domHandler)}destroy(){d(this.element,this.evEl,this.domHandler),d(this.target,this.evTarget,this.domHandler),d(p(this.element),this.evWin,this.domHandler)}}let A={pointerdown:i.Start,pointermove:i.Move,pointerup:i.End,pointercancel:i.Cancel,pointerout:i.Cancel};class L extends S{constructor(e){super(e),this.evEl="pointerdown",this.evWin="pointermove pointerup pointercancel",this.store=this.manager.session.pointerEvents=[],this.init()}handler(e){let{store:t}=this,r=!1,n=A[e.type],s=e.pointerType,a="touch"===s,o=t.findIndex(t=>t.pointerId===e.pointerId);n&i.Start&&(e.buttons||a)?o<0&&(t.push(e),o=t.length-1):n&(i.End|i.Cancel)&&(r=!0),!(o<0)&&(t[o]=e,this.callback(n,{pointers:t,changedPointers:[e],eventType:n,pointerType:s,srcEvent:e}),r&&t.splice(o,1))}}let P=["","webkit","Moz","MS","ms","o"],B={touchAction:"compute",enable:!0,inputTarget:null,cssProps:{userSelect:"none",userDrag:"none",touchCallout:"none",tapHighlightColor:"rgba(0,0,0,0)"}};class T{constructor(e,t){this.options={...B,...t,cssProps:{...B.cssProps,...t.cssProps},inputTarget:t.inputTarget||e},this.handlers={},this.session={},this.recognizers=[],this.oldCssProps={},this.element=e,this.input=new L(this),this.touchAction=new f(this,this.options.touchAction),this.toggleCssProps(!0)}set(e){return Object.assign(this.options,e),e.touchAction&&this.touchAction.update(),e.inputTarget&&(this.input.destroy(),this.input.target=e.inputTarget,this.input.init()),this}stop(e){this.session.stopped=e?2:1}recognize(e){let t,{session:r}=this;if(r.stopped)return;this.session.prevented&&e.srcEvent.preventDefault();let{recognizers:i}=this,{curRecognizer:n}=r;(!n||n&&n.state&s.Recognized)&&(n=r.curRecognizer=null);let a=0;for(;a<i.length;)t=i[a],2!==r.stopped&&(!n||t===n||t.canRecognizeWith(n))?t.recognize(e):t.reset(),!n&&t.state&(s.Began|s.Changed|s.Ended)&&(n=r.curRecognizer=t),a++}get(e){let{recognizers:t}=this;for(let r=0;r<t.length;r++)if(t[r].options.event===e)return t[r];return null}add(e){if(Array.isArray(e)){for(let t of e)this.add(t);return this}let t=this.get(e.options.event);return t&&this.remove(t),this.recognizers.push(e),e.manager=this,this.touchAction.update(),e}remove(e){if(Array.isArray(e)){for(let t of e)this.remove(t);return this}let t="string"==typeof e?this.get(e):e;if(t){let{recognizers:e}=this,r=e.indexOf(t);-1!==r&&(e.splice(r,1),this.touchAction.update())}return this}on(e,t){if(!e||!t)return;let{handlers:r}=this;for(let i of c(e))r[i]=r[i]||[],r[i].push(t)}off(e,t){if(!e)return;let{handlers:r}=this;for(let i of c(e))t?r[i]&&r[i].splice(r[i].indexOf(t),1):delete r[i]}emit(e,t){let r=this.handlers[e]&&this.handlers[e].slice();if(!r||!r.length)return;t.type=e,t.preventDefault=function(){t.srcEvent.preventDefault()};let i=0;for(;i<r.length;)r[i](t),i++}destroy(){this.toggleCssProps(!1),this.handlers={},this.session={},this.input.destroy(),this.element=null}toggleCssProps(e){let{element:t}=this;if(t){for(let[r,i]of Object.entries(this.options.cssProps)){let n=function(e,t){let r=t[0].toUpperCase()+t.slice(1);for(let i of P){let n=i?i+r:t;if(n in e)return n}}(t.style,r);e?(this.oldCssProps[n]=t.style[n],t.style[n]=i):t.style[n]=this.oldCssProps[n]||""}e||(this.oldCssProps={})}}}let M=1;function $(e){return e&s.Cancelled?"cancel":e&s.Ended?"end":e&s.Changed?"move":e&s.Began?"start":""}class O{constructor(e){this.options=e,this.id=M++,this.state=s.Possible,this.simultaneous={},this.requireFail=[]}set(e){return Object.assign(this.options,e),this.manager.touchAction.update(),this}recognizeWith(e){let t;if(Array.isArray(e)){for(let t of e)this.recognizeWith(t);return this}if("string"==typeof e){if(!(t=this.manager.get(e)))throw Error(`Cannot find recognizer ${e}`)}else t=e;let{simultaneous:r}=this;return r[t.id]||(r[t.id]=t,t.recognizeWith(this)),this}dropRecognizeWith(e){let t;if(Array.isArray(e)){for(let t of e)this.dropRecognizeWith(t);return this}return(t="string"==typeof e?this.manager.get(e):e)&&delete this.simultaneous[t.id],this}requireFailure(e){let t;if(Array.isArray(e)){for(let t of e)this.requireFailure(t);return this}if("string"==typeof e){if(!(t=this.manager.get(e)))throw Error(`Cannot find recognizer ${e}`)}else t=e;let{requireFail:r}=this;return -1===r.indexOf(t)&&(r.push(t),t.requireFailure(this)),this}dropRequireFailure(e){let t;if(Array.isArray(e)){for(let t of e)this.dropRequireFailure(t);return this}if(t="string"==typeof e?this.manager.get(e):e){let e=this.requireFail.indexOf(t);e>-1&&this.requireFail.splice(e,1)}return this}hasRequireFailures(){return!!this.requireFail.find(e=>e.options.enable)}canRecognizeWith(e){return!!this.simultaneous[e.id]}emit(e){if(!e)return;let{state:t}=this;t<s.Ended&&this.manager.emit(this.options.event+$(t),e),this.manager.emit(this.options.event,e),e.additionalEvent&&this.manager.emit(e.additionalEvent,e),t>=s.Ended&&this.manager.emit(this.options.event+$(t),e)}tryEmit(e){this.canEmit()?this.emit(e):this.state=s.Failed}canEmit(){let e=0;for(;e<this.requireFail.length;){if(!(this.requireFail[e].state&(s.Failed|s.Possible)))return!1;e++}return!0}recognize(e){let t={...e};if(!this.options.enable){this.reset(),this.state=s.Failed;return}this.state&(s.Recognized|s.Cancelled|s.Failed)&&(this.state=s.Possible),this.state=this.process(t),this.state&(s.Began|s.Changed|s.Ended|s.Cancelled)&&this.tryEmit(t)}getEventNames(){return[this.options.event]}reset(){}}class C extends O{attrTest(e){let t=this.options.pointers;return 0===t||e.pointers.length===t}coherentTest(e){let t=this.options.coherent;return!t?.length||t.some(t=>{var r,i;return r=e,(void 0===(i=t).distance||r.distance>=i.distance)&&(void 0===i.distancePerPointer||r.distancePerPointer.length>0&&r.distancePerPointer.every(e=>e>=i.distancePerPointer))&&(void 0===i.movementDeltaTime||r.movementDeltaTime>=i.movementDeltaTime)&&(void 0===i.rotation||Math.abs(((r.rotation+180)%360+360)%360-180)>=i.rotation)&&(void 0===i.scale||Math.abs(r.scale-1)>=i.scale)})}process(e){let{state:t}=this,{eventType:r}=e,n=t&(s.Began|s.Changed),a=this.attrTest(e);return n&&(r&i.Cancel||!a)?t|s.Cancelled:n||a?r&i.End?t|s.Ended:t&s.Began?t|s.Changed:s.Began:s.Failed}}let I=["","start","move","end","cancel"];class k extends O{constructor(e={}){super({enable:!0,event:"doubleclickdrag",pointers:1,interval:500,time:350,threshold:28,dragThreshold:1,pixelsPerScale:120,...e}),this._tapStart=null,this._lastTap=null,this._drag=null,this._emittedStart=!1}getTouchAction(){return[l]}getEventNames(){return I.map(e=>this.options.event+e)}process(e){let{options:t}=this;return e.pointers.length!==t.pointers?(this.reset(),s.Failed):e.eventType&i.Start?this._handleStart(e):e.eventType&i.Move?this._handleMove(e):e.eventType&i.Cancel?this._handleEnd(e,!0):e.eventType&i.End?this._handleEnd(e,!1):s.Failed}reset(){this._tapStart=null,this._lastTap=null,this._drag=null,this._emittedStart=!1}emit(e){if(e){if(this.state===s.Began){if(!this._drag?.active||this._emittedStart)return;this._emittedStart=!0,this.manager.emit(`${this.options.event}start`,e),this.manager.emit(this.options.event,e);return}if(this.state===s.Changed){if(!this._emittedStart)return;this.manager.emit(`${this.options.event}move`,e),this.manager.emit(this.options.event,e);return}if(this.state===s.Ended){if(!this._emittedStart)return;this.manager.emit(this.options.event,e),this.manager.emit(`${this.options.event}end`,e),this._emittedStart=!1;return}if(this.state===s.Cancelled){if(!this._emittedStart)return;this.manager.emit(this.options.event,e),this.manager.emit(`${this.options.event}cancel`,e),this._emittedStart=!1}}}_handleStart(e){let t=this._getPointerId(e);return this._lastTap&&this._isTapMatch(e,this._lastTap)?(this._tapStart=null,this._lastTap=null,this._drag={startCenter:e.center,pointerId:t,active:!1},this._emittedStart=!1,s.Began):(this._tapStart={center:e.center,timeStamp:e.timeStamp,pointerId:t},this._lastTap=null,this._drag=null,this._emittedStart=!1,s.Failed)}_handleMove(e){if(!this._drag||!this._isSamePointer(e,this._drag.pointerId))return s.Failed;let t=this._drag.startCenter.y-e.center.y;return!this._drag.active&&Math.abs(t)<this.options.dragThreshold?s.Began:(this._drag.active=!0,e.scale=Math.pow(2,t/this.options.pixelsPerScale),this._emittedStart?s.Changed:s.Began)}_handleEnd(e,t){if(this._drag&&this._isSamePointer(e,this._drag.pointerId)){let{active:r,startCenter:i}=this._drag;if(this._drag=null,this._tapStart=null,this._lastTap=null,!r)return this._emittedStart=!1,s.Failed;let n=i.y-e.center.y;return e.scale=Math.pow(2,n/this.options.pixelsPerScale),t?s.Cancelled:s.Ended}return this._tapStart&&this._isSamePointer(e,this._tapStart.pointerId)?(this._isValidTap(e)?this._lastTap={center:e.center,timeStamp:e.timeStamp,pointerId:this._tapStart.pointerId}:this._lastTap=null,this._tapStart=null):t&&this.reset(),s.Failed}_isTapMatch(e,t){return e.timeStamp-t.timeStamp<=this.options.interval&&_(e.center,t.center)<=this.options.threshold}_isValidTap(e){return e.deltaTime<=this.options.time&&e.distance<=this.options.threshold}_getPointerId(e){return"pointerId"in e.srcEvent?e.srcEvent.pointerId:null}_isSamePointer(e,t){return null===t||this._getPointerId(e)===t}}class R extends O{constructor(e={}){super({enable:!0,event:"tap",pointers:1,taps:1,interval:300,time:250,threshold:9,posThreshold:10,...e}),this.pTime=null,this.pCenter=null,this._timer=null,this._input=null,this.count=0}getTouchAction(){return[l]}process(e){let{options:t}=this,r=e.pointers.length===t.pointers,n=e.distance<t.threshold,a=e.deltaTime<t.time;if(this.reset(),e.eventType&i.Start&&0===this.count)return this.failTimeout();if(n&&a&&r){if(e.eventType!==i.End)return this.failTimeout();let r=!this.pTime||e.timeStamp-this.pTime<t.interval,n=!this.pCenter||_(this.pCenter,e.center)<t.posThreshold;if(this.pTime=e.timeStamp,this.pCenter=e.center,n&&r?this.count+=1:this.count=1,this._input=e,0==this.count%t.taps)return this.hasRequireFailures()?(this._timer=setTimeout(()=>{this.state=s.Recognized,this.tryEmit(this._input)},t.interval),s.Began):s.Recognized}return s.Failed}failTimeout(){return this._timer=setTimeout(()=>{this.state=s.Failed},this.options.interval),s.Failed}reset(){clearTimeout(this._timer)}emit(e){this.state===s.Recognized&&(e.tapCount=this.count,this.manager.emit(this.options.event,e))}}class N extends C{constructor(){super(...arguments),this.wheelSession=null,this.wheelSessionUnsubscribe=null,this.handleWheelSessionEvent=e=>{"trackpad"===e.device&&this.handleTrackpadEvent(e)}}set(e){let{wheelSession:t,...r}=e;return t&&t!==this.wheelSession&&(this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=null,this.wheelSession=t),super.set(r),this.updateWheelSessionSubscription(),this}getTrackpadInput(e,t={}){let{srcEvent:r}=e,i=t.deltaX??e.deltaX,n=t.deltaY??e.deltaY,s=v(i,n),a=Math.sqrt(e.deltaX*e.deltaX+e.deltaY*e.deltaY);return{pointers:[r,r],changedPointers:[r,r],pointerType:"trackpad",srcEvent:r,eventType:e.eventType,timeStamp:e.timeStamp,deltaTime:e.deltaTime,center:e.center,deltaX:i,deltaY:n,angle:180*Math.atan2(n,i)/Math.PI,distance:Math.sqrt(i*i+n*n),distancePerPointer:[a,a],movementDeltaTime:e.deltaTime,scale:1,rotation:0,direction:s,offsetDirection:s,velocity:e.velocity,velocityX:e.velocityX,velocityY:e.velocityY,overallVelocity:e.overallVelocity,overallVelocityX:e.overallVelocityX,overallVelocityY:e.overallVelocityY,maxPointers:2,target:r.target||this.manager.element,additionalEvent:"",...t}}updateWheelSessionSubscription(){let e=!!(this.wheelSession&&this.options.enable&&this.options.trackpad&&2===this.options.pointers);e&&!this.wheelSessionUnsubscribe?this.wheelSessionUnsubscribe=this.wheelSession.on(this.handleWheelSessionEvent):!e&&this.wheelSessionUnsubscribe&&(this.wheelSessionUnsubscribe(),this.wheelSessionUnsubscribe=null)}}let F=["","start","move","end","cancel","up","down","left","right"];class U extends N{constructor(e={}){super({enable:!0,pointers:1,event:"pan",threshold:10,direction:n.All,trackpad:!1,coherent:[],...e}),this.trackpadGesture=!1,this.pX=null,this.pY=null}getTouchAction(){let{options:{direction:e}}=this,t=[];return e&n.Horizontal&&t.push("pan-y"),e&n.Vertical&&t.push("pan-x"),t}getEventNames(){return F.map(e=>this.options.event+e)}directionTest(e){let{options:t}=this,r=!0,{distance:i}=e,{direction:s}=e,a=e.deltaX,o=e.deltaY;return s&t.direction||(t.direction&n.Horizontal?(s=0===a?n.None:a<0?n.Left:n.Right,r=a!==this.pX,i=Math.abs(e.deltaX)):(s=0===o?n.None:o<0?n.Up:n.Down,r=o!==this.pY,i=Math.abs(e.deltaY))),e.direction=s,r&&i>t.threshold&&!!(s&t.direction)}attrTest(e){let t=!!(this.state&s.Began),r=!(this.options.coherent?.length&&e.eventType&(i.End|i.Cancel));return super.attrTest(e)&&(t||r&&this.coherentTest(e)&&this.directionTest(e))}emit(e){this.pX=e.deltaX,this.pY=e.deltaY;let t=n[e.direction].toLowerCase();t&&(e.additionalEvent=this.options.event+t),super.emit(e)}handleTrackpadEvent(e){e.isFirst&&(this.trackpadGesture=!e.srcEvent.ctrlKey,!this.trackpadGesture&&this.state&(s.Recognized|s.Cancelled|s.Failed)&&(this.state=s.Possible)),this.trackpadGesture&&(this.recognize(this.getTrackpadInput(e,{deltaX:-e.deltaX,deltaY:-e.deltaY,velocity:-e.velocity,velocityX:-e.velocityX,velocityY:-e.velocityY,overallVelocity:-e.overallVelocity,overallVelocityX:-e.overallVelocityX,overallVelocityY:-e.overallVelocityY})),e.isFinal&&(this.trackpadGesture=!1))}}let z=["","start","move","end","cancel","in","out"];class D extends N{constructor(e={}){super({enable:!0,event:"pinch",threshold:0,pointers:2,trackpad:!1,coherent:[],...e}),this.trackpadGesture=!1}getTouchAction(){return["none"]}getEventNames(){return z.map(e=>this.options.event+e)}attrTest(e){let t=!!this.options.coherent?.length,r=!!(this.state&s.Began),n=!(t&&e.eventType&(i.End|i.Cancel));return super.attrTest(e)&&(r||n&&(t?this.coherentTest(e):Math.abs(e.scale-1)>this.options.threshold))}emit(e){if(1!==e.scale){let t=e.scale<1?"in":"out";e.additionalEvent=this.options.event+t}super.emit(e)}handleTrackpadEvent(e){e.isFirst&&(this.trackpadGesture=e.srcEvent.ctrlKey,!this.trackpadGesture&&this.state&(s.Recognized|s.Cancelled|s.Failed)&&(this.state=s.Possible)),this.trackpadGesture&&(this.recognize(this.getTrackpadInput(e,{deltaX:0,deltaY:0,velocity:0,velocityX:0,velocityY:0,overallVelocity:0,overallVelocityX:0,overallVelocityY:0,scale:Math.exp(-e.deltaY/100)})),e.isFinal&&(this.trackpadGesture=!1))}}class V{constructor(e,t,r){this.element=e,this.callback=t,this.options=r}listen(e,t){t?this.element.addEventListener(e,this.handleEvent,{passive:!1}):this.element.removeEventListener(e,this.handleEvent)}}let j=-1!==("u">typeof navigator&&navigator.userAgent?navigator.userAgent.toLowerCase():"").indexOf("firefox");class W extends V{constructor(e,t,r){r.enable=r.enable??!1,super(e,t,r),this.handleEvent=e=>{if(!this.options.enable)return;let t=e.deltaY;globalThis.WheelEvent&&(j&&e.deltaMode===globalThis.WheelEvent.DOM_DELTA_PIXEL&&(t/=globalThis.devicePixelRatio),e.deltaMode===globalThis.WheelEvent.DOM_DELTA_LINE&&(t*=40)),e.shiftKey&&t&&(t*=.25),this.callback({type:"wheel",center:{x:e.clientX,y:e.clientY},delta:-t,device:this.options.wheelSession?.device??"unknown",srcEvent:e,pointerType:"mouse",target:e.target})},r.enable&&(this.wheelSessionUnsubscribe=this.options.wheelSession?.on(()=>{}),this.listen("wheel",!0))}destroy(){this.listen("wheel",!1),this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=void 0}enableEventType(e,t){"wheel"===e&&this.options.enable!==t&&(this.options.enable=t,t&&!this.wheelSessionUnsubscribe&&(this.wheelSessionUnsubscribe=this.options.wheelSession?.on(()=>{})),this.listen("wheel",t),t||(this.wheelSessionUnsubscribe?.(),this.wheelSessionUnsubscribe=void 0))}}let G={classificationDelay:32,endDelay:80};class q{constructor(e,t={}){this.subscriptions=new Map,this.session=null,this.classificationTimer=null,this.endTimer=null,this.pressedControlKeys=new Set,this.listeningForControlKeys=!1,this.handleEvent=e=>{var t,r;let i,n;if(!this.hasSubscribers)return"unknown";let s=(t=e,r=this.pressedControlKeys.size>0,i=t.deltaX,n=t.deltaY,1===t.deltaMode&&(i*=40,n*=40),{event:t,timeStamp:t.timeStamp,deltaX:i,deltaY:n,isControlKeyDown:r}),a=this.session;if(a&&s.timeStamp-a.lastTimeStamp>=this.options.endDelay){if(this.end(),!this.hasSubscribers)return"unknown";a=null}a?(this.scheduleEnd(),this.addSample(a,s)):(a=this.startPendingSession(s),this.scheduleEnd());let{device:o}=a;return"unknown"===o&&"unknown"!==(o=H(a.samples,!1))&&this.begin(a,o),o},this.finishClassification=()=>{if(this.classificationTimer=null,!this.session||"unknown"!==this.session.device)return;let e=this.session,t=H(e.samples,!0);this.begin(e,"unknown"===t?"mouse":t)},this.end=()=>{if(!this.session)return;if("unknown"===this.session.device){let e=this.session,t=H(e.samples,!0);this.begin(e,"unknown"===t?"mouse":t)}if(!this.session)return;let e=this.session;this.emit(i.End,e.lastEvent),this.reset()},this.handleKeyDown=e=>{"Control"===e.key&&this.pressedControlKeys.add(e.code||e.key)},this.handleKeyUp=e=>{"Control"===e.key&&(e.code?this.pressedControlKeys.delete(e.code):this.pressedControlKeys.clear())},this.handleWindowBlur=()=>{this.pressedControlKeys.clear()},this.element=e,this.options={...G,...t},this.element?.addEventListener("wheel",this.handleEvent,{passive:!0})}get hasSubscribers(){return this.subscriptions.size>0}get device(){return this.session?.device??"unknown"}on(e){let t={listener:e};return this.subscriptions.set(e,t),this.updateControlKeyEventListeners(),()=>{this.subscriptions.get(e)===t&&this.off(e)}}off(e){this.subscriptions.delete(e),this.updateControlKeyEventListeners(),this.hasSubscribers||this.reset()}cancel(){let e=this.session;e&&"unknown"!==e.device&&this.emit(i.Cancel,e.lastEvent),this.reset()}destroy(){this.cancel(),this.subscriptions.clear(),this.updateControlKeyEventListeners(),this.element?.removeEventListener("wheel",this.handleEvent)}startPendingSession(e){let t={samples:[e],device:"unknown",firstTimeStamp:e.timeStamp,lastTimeStamp:e.timeStamp,totalDeltaX:e.deltaX,totalDeltaY:e.deltaY,velocityX:0,velocityY:0,lastEvent:e.event};return this.session=t,this.classificationTimer=globalThis.setTimeout(this.finishClassification,this.options.classificationDelay),t}addSample(e,t){if(e.samples.push(t),e.lastTimeStamp=t.timeStamp,e.lastEvent=t.event,e.totalDeltaX+=t.deltaX,e.totalDeltaY+=t.deltaY,"unknown"!==e.device){let r=e.samples[e.samples.length-2],n=t.timeStamp-r.timeStamp;e.velocityX=n>0?t.deltaX/n:0,e.velocityY=n>0?t.deltaY/n:0,this.emit(i.Move,t.event,{velocityX:e.velocityX,velocityY:e.velocityY})}}begin(e,t){e.device=t,this.clearClassificationTimer(),this.emit(i.Start,e.samples[0].event);let r=e.lastTimeStamp-e.firstTimeStamp;e.velocityX=r>0?e.totalDeltaX/r:0,e.velocityY=r>0?e.totalDeltaY/r:0,this.emit(i.Move,e.lastEvent,{velocityX:e.velocityX,velocityY:e.velocityY})}scheduleEnd(){this.clearEndTimer(),this.endTimer=globalThis.setTimeout(this.end,this.options.endDelay)}emit(e,t,r){let n=this.session;if(!n||"unknown"===n.device)return;let s=e===i.Start,a=e===i.End||e===i.Cancel,o=s?n.firstTimeStamp:n.lastTimeStamp,u=s?0:Math.max(0,o-n.firstTimeStamp),l=s?0:n.totalDeltaX,f=s?0:n.totalDeltaY,c=u>0?l/u:0,h=u>0?f/u:0,d=s?0:r?.velocityX??n.velocityX,p=s?0:r?.velocityY??n.velocityY,m={eventType:e,device:n.device,srcEvent:t,timeStamp:o,center:{x:t.clientX,y:t.clientY},deltaX:l,deltaY:f,deltaTime:u,velocity:Math.abs(d)>Math.abs(p)?d:p,velocityX:d,velocityY:p,overallVelocity:Math.abs(c)>Math.abs(h)?c:h,overallVelocityX:c,overallVelocityY:h,isFirst:s,isFinal:a};for(let{listener:e}of[...this.subscriptions.values()])e(m)}reset(){this.clearClassificationTimer(),this.clearEndTimer(),this.session=null}clearClassificationTimer(){null!==this.classificationTimer&&(globalThis.clearTimeout(this.classificationTimer),this.classificationTimer=null)}clearEndTimer(){null!==this.endTimer&&(globalThis.clearTimeout(this.endTimer),this.endTimer=null)}updateControlKeyEventListeners(){let e=this.hasSubscribers,t="u">typeof window?window:globalThis.document?.defaultView;t&&e!==this.listeningForControlKeys&&(this.listeningForControlKeys=e,e?(t.addEventListener("keydown",this.handleKeyDown,!0),t.addEventListener("keyup",this.handleKeyUp,!0),t.addEventListener("blur",this.handleWindowBlur)):(t.removeEventListener("keydown",this.handleKeyDown,!0),t.removeEventListener("keyup",this.handleKeyUp,!0),t.removeEventListener("blur",this.handleWindowBlur),this.pressedControlKeys.clear()))}}function H(e,t){return e.some(({event:e,isControlKeyDown:t})=>e.ctrlKey&&!t)?"trackpad":e.some(({event:e})=>0!==e.deltaMode)||e.some(Y)||e.every(({event:e})=>{let t=e.wheelDelta;return void 0!==t&&Math.abs(t)%40==0})?"mouse":e.some(({deltaX:e})=>0!==e)||e.length>1&&function(e){for(let t=0;t<e.length;t++){let r=e[t];if(Math.abs(r.deltaX)>40||Math.abs(r.deltaY)>40||t>0&&r.timeStamp-e[t-1].timeStamp>40)return!1}return!0}(e)?"trackpad":t?"mouse":"unknown"}function Y({event:e,deltaX:t,deltaY:r}){if(0!==t||0===r)return!1;if(Number.isInteger(Math.abs(r/4.000244140625)))return!0;let i=e.wheelDelta;return"number"==typeof i&&0!==i&&i%120==0}let X=["mousedown","mousemove","mouseup","mouseover","mouseout","mouseenter","mouseleave"];class Z extends V{constructor(e,t,r){super(e,t,{enable:!0,...r}),this.handleEvent=e=>{this.handleOverEvent(e),this.handleOutEvent(e),this.handleEnterEvent(e),this.handleLeaveEvent(e),this.handleMoveEvent(e)},this.pressed=!1;let{enable:i=!1}=this.options;this.enableMoveEvent=i,this.enableLeaveEvent=i,this.enableEnterEvent=i,this.enableOutEvent=i,this.enableOverEvent=i,i&&X.forEach(e=>this.listen(e,!0))}destroy(){X.forEach(e=>this.listen(e,!1))}enableEventType(e,t){switch(e){case"pointermove":this.enableMoveEvent!==t&&(this.enableMoveEvent=t,this.listen("mousedown",t),this.listen("mousemove",t),this.listen("mouseup",t));break;case"pointerover":this.enableOverEvent!==t&&(this.enableOverEvent=t,this.listen("mouseover",t));break;case"pointerout":this.enableOutEvent!==t&&(this.enableOutEvent=t,this.listen("mouseout",t));break;case"pointerenter":this.enableEnterEvent!==t&&(this.enableEnterEvent=t,this.listen("mouseenter",t));break;case"pointerleave":this.enableLeaveEvent!==t&&(this.enableLeaveEvent=t,this.listen("mouseleave",t))}}handleOverEvent(e){this.enableOverEvent&&"mouseover"===e.type&&this._emit("pointerover",e)}handleOutEvent(e){this.enableOutEvent&&"mouseout"===e.type&&this._emit("pointerout",e)}handleEnterEvent(e){this.enableEnterEvent&&"mouseenter"===e.type&&this._emit("pointerenter",e)}handleLeaveEvent(e){this.enableLeaveEvent&&"mouseleave"===e.type&&this._emit("pointerleave",e)}handleMoveEvent(e){if(this.enableMoveEvent)switch(e.type){case"mousedown":e.button>=0&&(this.pressed=!0);break;case"mousemove":0===e.buttons&&(this.pressed=!1),this.pressed||this._emit("pointermove",e);break;case"mouseup":this.pressed=!1}}_emit(e,t){this.callback({type:e,center:{x:t.clientX,y:t.clientY},srcEvent:t,pointerType:"mouse",target:t.target})}}let K=["keydown","keyup"];class Q extends V{constructor(e,t,r){super(e,t,{enable:!0,tabIndex:0,...r}),this.handleEvent=e=>{let t=e.target||e.srcElement;("INPUT"!==t.tagName||"text"!==t.type)&&"TEXTAREA"!==t.tagName&&(this.enableDownEvent&&"keydown"===e.type&&this.callback({type:"keydown",srcEvent:e,key:e.key,target:e.target}),this.enableUpEvent&&"keyup"===e.type&&this.callback({type:"keyup",srcEvent:e,key:e.key,target:e.target}))};let{enable:i=!1}=this.options;this.enableDownEvent=i,this.enableUpEvent=i,e.tabIndex=this.options.tabIndex,e.style.outline="none",i&&K.forEach(e=>this.listen(e,!0))}destroy(){K.forEach(e=>this.listen(e,!1))}enableEventType(e,t){"keydown"===e&&this.enableDownEvent!==t&&(this.enableDownEvent=t,this.listen(e,t)),"keyup"===e&&this.enableUpEvent!==t&&(this.enableUpEvent=t,this.listen(e,t))}}class J extends V{constructor(e,t,r){r.enable=r.enable??!1,super(e,t,r),this.handleEvent=e=>{this.options.enable&&this.callback({type:"contextmenu",center:{x:e.clientX,y:e.clientY},srcEvent:e,pointerType:"mouse",target:e.target})},r.enable&&this.listen("contextmenu",!0)}destroy(){this.listen("contextmenu",!1)}enableEventType(e,t){"contextmenu"===e&&this.options.enable!==t&&(this.options.enable=t,this.listen("contextmenu",t))}}let ee={pointerdown:1,pointermove:2,pointerup:4,mousedown:1,mousemove:2,mouseup:4},et={srcElement:"root",priority:0};class er{constructor(e,t){this.handleEvent=e=>{if(this.isEmpty())return;let t=this._normalizeEvent(e),r=e.srcEvent.target;for(;r&&r!==t.rootElement;){if(this._emit(t,r),t.handled)return;r=r.parentNode}this._emit(t,"root")},this.eventManager=e,this.recognizerName=t,this.handlers=[],this.handlersByElement=new Map,this._active=!1}isEmpty(){return!this._active}add(e,t,r,i=!1,n=!1){let{handlers:s,handlersByElement:a}=this,o={...et,...r},u=a.get(o.srcElement);u||(u=[],a.set(o.srcElement,u));let l={type:e,handler:t,srcElement:o.srcElement,priority:o.priority};i&&(l.once=!0),n&&(l.passive=!0),s.push(l),this._active=this._active||!l.passive;let f=u.length-1;for(;f>=0&&!(u[f].priority>=l.priority);)f--;u.splice(f+1,0,l)}remove(e,t){let{handlers:r,handlersByElement:i}=this;for(let n=r.length-1;n>=0;n--){let s=r[n];if(s.type===e&&s.handler===t){r.splice(n,1);let e=i.get(s.srcElement);e.splice(e.indexOf(s),1),0===e.length&&i.delete(s.srcElement)}}this._active=r.some(e=>!e.passive)}_emit(e,t){let r=this.handlersByElement.get(t);if(r){let t=!1,i=()=>{e.handled=!0},n=()=>{e.handled=!0,t=!0},s=[];for(let a=0;a<r.length;a++){let{type:o,handler:u,once:l}=r[a];if(u({...e,type:o,stopPropagation:i,stopImmediatePropagation:n}),l&&s.push(r[a]),t)break}for(let e=0;e<s.length;e++){let{type:t,handler:r}=s[e];this.remove(t,r)}}}_normalizeEvent(e){let t=this.eventManager.getElement();return{...e,...function(e){let t=ee[e.srcEvent.type];if(!t)return null;let{buttons:r,button:i}=e.srcEvent,n=!1,s=!1,a=!1;return 2===t?(n=!!(1&r),s=!!(4&r),a=!!(2&r)):(n=0===i,s=1===i,a=2===i),{leftButton:n,middleButton:s,rightButton:a}}(e),...function(e,t){let r=e.center;if(!r)return null;let i=t.getBoundingClientRect(),n=i.width/t.offsetWidth||1,s=i.height/t.offsetHeight||1,a={x:(r.x-i.left-t.clientLeft)/n,y:(r.y-i.top-t.clientTop)/s};return{center:r,offsetCenter:a}}(e,t),preventDefault:()=>{e.srcEvent.preventDefault()},stopImmediatePropagation:null,stopPropagation:null,handled:!1,rootElement:t}}}class ei{constructor(e=null,t={}){if(this._onBasicInput=e=>{this.manager.emit(e.srcEvent.type,e)},this._onOtherEvent=e=>{this.manager.emit(e.type,e)},this.options={recognizers:[],events:{},touchAction:"compute",tabIndex:0,cssProps:{},...t},this.events=new Map,this.element=e,this.wheelSession=new q(e),!e)return;for(let t of(this.manager=new T(e,this.options),this.options.recognizers)){let{recognizer:e,recognizeWith:r,requireFailure:i}=function(e){let t;if("recognizer"in e)return e;let r=Array.isArray(e)?[...e]:[e];return{recognizer:t="function"==typeof r[0]?new(r.shift())(r.shift()||{}):r.shift(),recognizeWith:"string"==typeof r[0]?[r[0]]:r[0],requireFailure:"string"==typeof r[1]?[r[1]]:r[1]}}(t);this.manager.add(e),r&&e.recognizeWith(r),i&&e.requireFailure(i)}this.manager.on("hammer.input",this._onBasicInput),this.wheelInput=new W(e,this._onOtherEvent,{enable:!1,wheelSession:this.wheelSession}),this.moveInput=new Z(e,this._onOtherEvent,{enable:!1}),this.keyInput=new Q(e,this._onOtherEvent,{enable:!1,tabIndex:t.tabIndex}),this.contextmenuInput=new J(e,this._onOtherEvent,{enable:!1}),this.on(this.options.events)}getElement(){return this.element}destroy(){this.element?(this.wheelInput.destroy(),this.wheelSession.destroy(),this.moveInput.destroy(),this.keyInput.destroy(),this.contextmenuInput.destroy(),this.manager.destroy()):this.wheelSession.destroy()}on(e,t,r){this._addEventHandler(e,t,r,!1)}once(e,t,r){this._addEventHandler(e,t,r,!0)}watch(e,t,r){this._addEventHandler(e,t,r,!1,!0)}off(e,t){this._removeEventHandler(e,t)}emit(e){this.manager?.emit(e.type,e)}_toggleRecognizer(e,t){let{manager:r}=this;if(!r)return;let i=r.get(e);i&&(i.set({enable:t,wheelSession:this.wheelSession}),r.touchAction.update()),this.wheelInput?.enableEventType(e,t),this.moveInput?.enableEventType(e,t),this.keyInput?.enableEventType(e,t),this.contextmenuInput?.enableEventType(e,t)}_addEventHandler(e,t,r,i,n){if("string"!=typeof e){for(let[s,a]of(r=t,Object.entries(e)))this._addEventHandler(s,a,r,i,n);return}let{manager:s,events:a}=this;if(!s)return;let o=a.get(e);!o&&(o=new er(this,this._getRecognizerName(e)||e),a.set(e,o),s&&s.on(e,o.handleEvent)),o.add(e,t,r,i,n),o.isEmpty()||this._toggleRecognizer(o.recognizerName,!0)}_removeEventHandler(e,t){if("string"!=typeof e){for(let[t,r]of Object.entries(e))this._removeEventHandler(t,r);return}let{events:r}=this,i=r.get(e);if(i&&(i.remove(e,t),i.isEmpty())){let{recognizerName:e}=i,t=!1;for(let i of r.values())if(i.recognizerName===e&&!i.isEmpty()){t=!0;break}t||this._toggleRecognizer(e,!1)}}_getRecognizerName(e){return this.manager.recognizers.find(t=>t.getEventNames().includes(e))?.options.event}}},82939(e,t,r){r.d(t,{k:()=>f});var i=r(40660),n=r(72410),s=r(27053),a=r(56572),o=r(51494),u=r(73377),l=r(72200);let f=Object.freeze({fetchFile:i.t2,parse:n.q,parseFile:s.C,parseSync:a.n,parseInBatches:o.L,load:u.H,loadInBatches:l.m})},72200(e,t,r){r.d(t,{m:()=>f});var i=r(48090),n=r(66771),s=r(61550),a=r(44440),o=r(51494),u=r(81417),l=r(91641);function f(e,t,r,i){let s;return(Array.isArray(t)||(0,n.l)(t)?s=t:(r=t,s=void 0),Array.isArray(e))?e.map(e=>c(e,s,r||{})):c(e,s,r||{})}async function c(e,t,r){if("string"==typeof e){let n=await (0,u.M)(e,t,{...r,core:{...r.core,nothrow:!0}}),f=n&&!n.getAuthentications&&r.core?.credentials?.length?await (0,l._T)(n,r,e):n;r=await (0,i.M8)(f,e,r);let c=(0,s.z)(r),h=await c((0,a.b3)(e,r));return Array.isArray(t),await (0,o.L)(h,t,r)}return Array.isArray(t),await (0,o.L)(e,t,r)}},91641(e,t,r){r.d(t,{_T:()=>a,pi:()=>o});var i=r(36217);let n=new Map,s=new Map;async function a(e,t,r){if((0,i.p)(e)){let n=e.preload?await e.preload(r||"",t):e;if(!(0,i.p)(n))throw Error(`${e.id} source loader preload() did not return a runtime source loader`);return n}if(u(e))return e;let a=f(e,t),o=s.get(e)?.get(a);if(o)return o;let c=n.get(e);c||(c=new Map,n.set(e,c));let h=c.get(a);return h||(h=l(e,t,r).then(t=>{let r=s.get(e);return r||(r=new Map,s.set(e,r)),r.set(a,t),t}).catch(t=>{throw c.delete(a),0===c.size&&n.delete(e),t}),c.set(a,h)),await h}function o(e){if(e.subloaders&&!h.has(e)){let t=d.get(e);if(t)return t;if(!u(e))return null}if(u(e))return e;let t=f(e);return s.get(e)?.get(t)||null}function u(e){return!!(e.parse||e.parseSync||e.parseInBatches||e.parseText||e.parseTextSync||e.parseFile||e.parseFileInBatches)}async function l(e,t,r){if(e.preload){let i=await e.preload(r||"",t);if(u(i))return i;throw Error(`${e.id} loader preload() did not return a parser-bearing loader`)}let i=function(e,t){if("test"===(t?._workerType||t?.core?._workerType)){let t=`modules/${e.module}/src/${e.id}-loader.ts`;return"u">typeof window?`/${t}`:"u">typeof process&&process.cwd?new URL(t,`file://${process.cwd()}/`).toString():t}throw Error(`${e.id} loader does not provide a parser implementation. Import a parser-bearing loader directly, or use preload() before parse/load.`)}(e,t);return await c(i,e.id)}function f(e,t){let r=t?.[e.id],i=e.options?.[e.id];return String(r?.backend||i?.backend||"")}async function c(e,t){for(let r of Object.values(await import(e)))if(r&&"object"==typeof r&&r.id===t&&u(r))return r;throw Error(`Could not find parser implementation for ${t} in ${e}`)}let h=new WeakSet,d=new WeakMap;new WeakMap},73377(e,t,r){r.d(t,{H:()=>_});var i=r(36217),n=r(48090),s=r(92767),a=r(66771),o=r(61550),u=r(44440),l=r(40660),f=r(72410),c=r(27053),h=r(56572),d=r(51494),p=r(72200),m=r(81417),g=r(91641);async function _(e,t,r,y){let v,w;if(Array.isArray(t)||(0,a.l)(t)?(v=t,w=r):(v=[],w=t,y=void 0),w||=(0,u.pp)(),!Array.isArray(v)&&(0,i.p)(v)){let t=await b(v,e,w);w=await (0,n.M8)(v.getAuthentications?v:t,"string"==typeof e?e:"",w||{});let r={fetchFile:l.t2,parse:f.q,parseFile:c.C,parseSync:h.n,parseInBatches:d.L,load:_,loadInBatches:p.m};return t.createDataSource(e,w||{},r)}if(Array.isArray(v)&&1===v.length&&(0,i.p)(v[0])){let t=await b(v[0],e,w);w=await (0,n.M8)(v[0].getAuthentications?v[0]:t,"string"==typeof e?e:"",w||{});let r={fetchFile:l.t2,parse:f.q,parseFile:c.C,parseSync:h.n,parseInBatches:d.L,load:_,loadInBatches:p.m};return t.createDataSource(e,w||{},r)}if("string"==typeof e||(0,s.qf)(e)){let t=await (0,m.M)(e,v,{...w,core:{...w?.core,nothrow:!0}});if(t&&(0,i.p)(t)){let r=await b(t,e,w);return w=await (0,n.M8)(t.getAuthentications?t:r,"string"==typeof e?e:"",w||{}),r.createDataSource(e,w||{},{fetchFile:l.t2,parse:f.q,parseFile:c.C,parseSync:h.n,parseInBatches:d.L,load:_,loadInBatches:p.m})}if(t&&"string"==typeof e){let r=await (0,g._T)(t,w,e);w=await (0,n.M8)(t.getAuthentications?t:r,e,w||{});let i=r.parseUrl;if(i){let t=(0,u.b3)(e,w);return await i(t,w,y)}}}w&&(w=(0,n.Bv)(w));let E=(0,o.z)(w),x=e;if("string"==typeof e&&(x=await E((0,u.b3)(e,w))),(0,s.qf)(e)&&(x=await E(e)),"string"==typeof e){let t=(0,u.Rf)(w||{});t.core?.baseUrl||(w={...w,core:{...w?.core,baseUrl:e}})}return Array.isArray(v),await (0,f.q)(x,v,w,y)}async function b(e,t,r){if(!e.preload)return e;let n=await e.preload("string"==typeof t?t:"",r);if(!(0,i.p)(n))throw Error(`${e.id} source loader preload() did not return a runtime source loader`);return n}},27053(e,t,r){r.d(t,{C:()=>d});var i=r(36217),n=r(48090),s=r(90557),a=r(8591),o=r(66771),u=r(44440),l=r(86655),f=r(91641),c=r(72410),h=r(81417);async function d(e,t,r,s){!t||Array.isArray(t)||(0,o.l)(t)||(s=void 0,r=t,t=void 0),r=r||{};let a=e.url||"",d=t,m=(0,l.i)(d,s),g=await (0,h.M)(a,m,r);if(!g)return null;if((0,i.p)(g))throw Error(`${g.id} is a SourceLoader. Use load() to create a runtime source object instead of parseFile().`);let _=(0,u.a5)(r,g,m,a),b=!g.getAuthentications&&_.core?.credentials?.length?await (0,f._T)(g,_,a||s?.url):g,y=await (0,n.M8)(b,a,_);return s=(0,l.l)({url:a,_parse:c.q,loaders:m},y,s||null),await p(g,e,y,s)}async function p(e,t,r,i){(0,a.z)(e),r=(0,s.l)(e.options,r);let n=await (0,f._T)(e,r,i.url);if(n.parseFile)return await n.parseFile(t,r,i);if(n.parse){let s=t.bigsize>0n?Number(t.bigsize):t.size;if(!s)throw Error(`${e.id} loader - cannot fall back to parse without a file size`);let a=await t.read(0n,s);return await (0,c.q)(a,n,r,i)}throw Error(`${e.id} loader - no file parser found`)}},51494(e,t,r){r.d(t,{L:()=>m});var i=r(48090),n=r(18122),s=r(14550),a=r(53240),o=r(66771),u=r(44440),l=r(86655),f=r(46241),c=r(42766),h=r(91641),d=r(81417),p=r(72410);async function m(e,t,r,n){let s=Array.isArray(t)?t:void 0;Array.isArray(t)||(0,o.l)(t)||(n=void 0,r=t,t=void 0),e=await e,r=r||{};let a=(0,c.Al)(e),f=await (0,d.M)(e,t,r);if(!f)return[];let _=(0,u.a5)(r,f,s,a),b=!f.getAuthentications&&_.core?.credentials?.length?await (0,h._T)(f,_,a||n?.url):f,y=await (0,i.M8)(b,a||"",_);n=(0,l.l)({url:a,_parseInBatches:m,_parse:p.q,loaders:s},y,n||null);let v=await (0,h._T)(f,y,n.url);return await g(f,v,e,y,n)}async function g(e,t,r,i,n){let s=await _(t,r,i,n);if(!i?.core?.metadata)return s;let a={shape:"metadata",batchType:"metadata",metadata:{_loader:e,_context:n},data:[],bytesUsed:0};return async function*(e){yield a,yield*e}(s)}async function _(e,t,r,i){let a=await (0,f.re)(t,r),o=await y(a,r?.core?.transforms||[]);return e.parseInBatches?"csv"===e.id&&n.Bd&&(0,s.sA)(e,r)?(0,s.FR)(e,o,r,i,p.q):e.parseInBatches(o,r,i):b(o,e,r,i)}async function*b(e,t,r,i){let n=await (0,a.cy)(e),s=function(e,t){let r=!function(e){switch("object"==typeof e&&e?.shape){case"array-row-table":case"object-row-table":return Array.isArray(e.data);case"geojson-table":return Array.isArray(e.features);case"columnar-table":return!!(e.data&&"object"==typeof e.data);case"arrow-table":return e?.data?.numRows!==void 0;default:return!1}}(e)?{shape:"unknown",batchType:"data",data:e,length:Array.isArray(e)?e.length:1}:{...e,length:function(e){switch(e.shape){case"array-row-table":case"object-row-table":return e.data.length;case"geojson-table":return e.features.length;case"arrow-table":return e.data.numRows;case"columnar-table":for(let t of Object.values(e.data))return t.length||0;return 0;default:throw Error("table")}}(e),batchType:"data"};return r.mimeType=t.mimeTypes[0],r}(await (0,p.q)(n,t,{...r,core:{...r?.core,mimeType:t.mimeTypes[0]}},i),t);yield s}async function y(e,t=[]){let r=e;for await(let e of t)r=e(r);return r}},56572(e,t,r){r.d(t,{n:()=>c});var i=r(36217),n=r(81417),s=r(66771),a=r(44440),o=r(46241),u=r(86655),l=r(42766),f=r(91641);function c(e,t,r,c){Array.isArray(t)||(0,s.l)(t)||(c=void 0,r=t,t=void 0),r=r||{};let h=t,d=(0,u.i)(h,c),p=(0,n.p)(e,d,r);if(!p)return null;if((0,i.p)(p))throw Error(`${p.id} is a SourceLoader. Use load() to create a runtime source object instead of parseSync().`);let m=(0,a.a5)(r,p,d),g=(0,l.Al)(e),_=()=>{throw Error("parseSync called parse (which is async")};return c=(0,u.l)({url:g,_parseSync:_,_parse:_,loaders:t},m,c||null),function(e,t,r,i){if(t=(0,o.lG)(t,e,r),e.parseTextSync&&"string"==typeof t)return e.parseTextSync(t,r);if(e.parseSync&&t instanceof ArrayBuffer)return e.parseSync(t,r,i);if(e.preload)throw Error(`${e.name} loader: 'parseSync' requires a parser-bearing loader. Import the loader implementation directly, or call preload(loader) before parseSync(). ${i.url||""}`);throw Error(`${e.name} loader: 'parseSync' not supported by this loader, use 'parse' instead. ${i.url||""}`)}((0,f.pi)(p)||p,e,m,c)}},72410(e,t,r){r.d(t,{q:()=>g});var i=r(48090),n=r(36217),s=r(90557),a=r(92767),o=r(14550),u=r(8591),l=r(66771),f=r(44440),c=r(46241),h=r(86655),d=r(42766),p=r(91641),m=r(81417);async function g(e,t,r,s){!t||Array.isArray(t)||(0,l.l)(t)||(s=void 0,r=t,t=void 0),e=await e,r=r||{};let a=(0,d.Al)(e),o=t,u=(0,h.i)(o,s),c=await (0,m.M)(e,u,r);if(!c)return null;if((0,n.p)(c))throw Error(`${c.id} is a SourceLoader. Use load() to create a runtime source object instead of parse().`);let b=(0,f.a5)(r,c,u,a),y=!c.getAuthentications&&b.core?.credentials?.length?await (0,p._T)(c,b,a||s?.url):c,v=await (0,i.M8)(y,a||"",b);return s=(0,h.l)({url:a,_parse:g,loaders:u},v,s||null),await _(c,e,v,s)}async function _(e,t,r,i){if((0,u.z)(e),r=(0,s.l)(e.options,r),(0,a.Sv)(t)){let{ok:e,redirected:r,status:n,statusText:s,type:a,url:o}=t;i.response={headers:Object.fromEntries(t.headers.entries()),ok:e,redirected:r,status:n,statusText:s,type:a,url:o}}let n=await (0,p._T)(e,r,i.url);return(0,o.L6)(n,t,r,i,e)?(t=await (0,c.Ct)(t,r),await (0,o.gm)(n,t,r,i,g)):(0,a.qf)(t)&&n.parseBlob?await n.parseBlob(t,r,i):(t=await (0,c.O1)(t,e,r),await b(n,t,r,i))}async function b(e,t,r,i){if(e.parseText&&"string"==typeof t)return await e.parseText(t,r,i);if(e.parseTextSync&&"string"==typeof t)return e.parseTextSync(t,r,i);if(e.parse)return await e.parse(t,r,i);if(e.parseSync)throw Error(`${e.name} loader: 'parse' not available on parser-bearing sync loader. Add an async 'parse' function to this loader, or call preload(loader) before parseSync(). ${i.url||""}`);throw Error(`${e.id} loader - no parser found and worker is disabled`)}},24449(e,t,r){r.d(t,{Ph:()=>o,mk:()=>a});var i=r(66771),n=r(44440);let s=()=>{let e=(0,n.K2)();return e.loaderRegistry=e.loaderRegistry||[],e.loaderRegistry};function a(e){let t=s();for(let r of e=Array.isArray(e)?e:[e]){let e=(0,i.D)(r);t.find(t=>e===t)||t.unshift(e)}}function o(){return s()}},81417(e,t,r){r.d(t,{M:()=>g,p:()=>b});var i=r(92767),n=r(68433),s=r(31255),a=r(36217),o=r(87950),u=r(69385),l=r(66771),f=r(44440),c=r(42766),h=r(24103),d=r(24449),p=r(50293);let m=/\.([^.]+)$/;async function g(e,t=[],r,n){if(!y(e))return null;let s=(0,f.Rf)(r||{});if(s.core||={},e instanceof Response&&_(e)){let r=b(await e.clone().text(),t,{...s,core:{...s.core,nothrow:!0}},n);if(r)return r}let a=b(e,t,{...s,core:{...s.core,nothrow:!0}},n);if(a)return a;if((0,i.qf)(e)&&(a=b(e=await e.slice(0,10).arrayBuffer(),t,s,n)),!a&&e instanceof Response&&_(e)&&(a=b(await e.clone().text(),t,s,n)),!a&&!s.core.nothrow)throw Error(v(e));return a}function _(e){let t=(0,c.z4)(e);return!!(t&&(t.startsWith("text/")||"application/json"===t||t.endsWith("+json")))}function b(e,t=[],r,s){var o,u,h,g,_,S;let A,L,P,B,T,M,$,O;if(!y(e))return null;let C=(0,f.Rf)(r||{});if(C.core||={},t&&!Array.isArray(t))return(0,l.D)(t);let I=[];t&&(I=I.concat(t)),C.core.ignoreRegisteredLoaders||I.push(...(0,d.Ph)()),function(e){for(let t of e)(0,l.D)(t)}(I);let k=(o=e,u=I,h=C,g=s,A=(0,c.Al)(o),L=(0,c.z4)(o),P=(0,p.S3)(A)||g?.url,B=null,T="",(M=h?.core&&"type"in h.core?h.core.type:void 0)&&"auto"!==M&&(T=(B=function(e,t){for(let r of e)if((0,a.p)(r)&&r.type===t)return r;return null}(u,M))?`match forced by supplied source type ${M}`:""),h?.core?.mimeType&&(B=w(u,h?.core?.mimeType),T=`match forced by supplied MIME type ${h?.core?.mimeType}`),B=B||function(e,t){if(!t)return null;for(let r of e)if((0,a.p)(r)&&r.testURL(t))return r;return null}(u,P),T=T||(B?`matched source url ${P}`:""),B=B||(_=u,(O=($=(S=P)&&m.exec(S))&&$[1])?function(e,t){for(let r of(t=t.toLowerCase(),e))for(let e of r.extensions)if(e.toLowerCase()===t)return r;return null}(_,O):null),T=T||(B?`matched url ${P}`:""),B=B||w(u,L),T=T||(B?`matched MIME type ${L}`:""),B=B||function(e,t){if(!t)return null;for(let r of e)if("string"==typeof t){if(function(e,t){return t.testText?t.testText(e):(Array.isArray(t.tests)?t.tests:[t.tests]).some(t=>e.startsWith(t))}(t,r))return r}else if(ArrayBuffer.isView(t)){if(E(t.buffer,t.byteOffset,r))return r}else if(t instanceof ArrayBuffer&&E(t,0,r))return r;return null}(u,o),T=T||(B?`matched initial data ${x(o)}`:""),!B&&(0,i.qf)(o)&&(B=function(e,t){for(let r of e)if((0,a.p)(r)&&r.testData?.(t))return r;return null}(u,o),T=T||(B?"matched source testData":"")),h?.core?.fallbackMimeType&&(B=B||w(u,h?.core?.fallbackMimeType),T=T||(B?`matched fallback MIME type ${L}`:"")),T&&n.R.log(1,`selectLoader selected ${B?.name}: ${T}.`),B);if(!k&&!C.core.nothrow)throw Error(v(e));return k}function y(e){return!(e instanceof Response)||204!==e.status}function v(e){let t=(0,c.Al)(e),r=(0,c.z4)(e),i="No valid loader found (";i+=(t?`${s.iW(t)}, `:"no url provided, ")+`MIME type: ${r?`"${r}"`:"not provided"}, `;let n=e?x(e):"";return i+((n?` first bytes: "${n}"`:"first bytes: not available")+")")}function w(e,t){for(let r of e)if(r.mimeTypes?.some(e=>(0,h.JQ)(t,e))||(0,h.JQ)(t,`application/x.${r.id}`))return r;return null}function E(e,t,r){return(Array.isArray(r.tests)?r.tests:[r.tests]).some(r=>(function(e,t,r){if((0,i.B1)(r))return(0,o.YV)(r,e,r.byteLength);switch(typeof r){case"function":return r((0,u.W$)(e));case"string":let n=S(e,t,r.length);return r===n;default:return!1}})(e,t,r))}function x(e,t=5){return"string"==typeof e?e.slice(0,t):ArrayBuffer.isView(e)?S(e.buffer,e.byteOffset,t):e instanceof ArrayBuffer?S(e,0,t):""}function S(e,t,r){if(e.byteLength<t+r)return"";let i=new DataView(e),n="";for(let e=0;e<r;e++)n+=String.fromCharCode(i.getUint8(t+e));return n}},40660(e,t,r){r.d(t,{t2:()=>s});var i=r(76849),n=r(92172);async function s(e,t){if("string"==typeof e){var r;let n=(0,i.o1)(e);return!((r=n).startsWith("http:")||r.startsWith("https:"))&&!n.startsWith("data:")&&globalThis.loaders?.fetchNode?globalThis.loaders?.fetchNode(n,t):await fetch(n,t)}return await (0,n.wv)(e)}},46241(e,t,r){r.d(t,{Ct:()=>g,O1:()=>m,lG:()=>p,re:()=>_});var i=r(69385),n=r(92767),s=r(53240);async function*a(e,t){let r=t?.chunkSize||1048576,i=0;for(;i<e.size;){let t=i+r,n=await e.slice(i,t).arrayBuffer();i=t,yield n}}var o=r(18122);function u(e,t){return o.Bd?l(e,t):f(e,t)}async function*l(e,t){let r,n=e.getReader(),s=!1,a=!1,o=!1;try{for(;;){let e,o=r||n.read();r=void 0;try{e=await o}catch(e){throw a=!0,e}let{done:u,value:l}=e;if(u){s=!0;return}t?._streamReadAhead&&(r=n.read()).catch(()=>{}),yield(0,i.XA)(l)}}catch(e){throw o=!0,e}finally{let e,t=!1;if(!s&&!a)try{await n.cancel()}catch(r){t=!0,e=r}try{n.releaseLock()}catch(r){t||(t=!0,e=r)}if(!o&&t)throw e}}async function*f(e,t){for await(let t of e)yield(0,i.XA)(t)}function c(e,t){if("string"==typeof e)return function*(e,t){let r=t?.chunkSize||262144,n=0,s=new TextEncoder;for(;n<e.length;){let t=Math.min(e.length-n,r),a=e.slice(n,n+t);n+=t,yield(0,i.W$)(s.encode(a))}}(e,t);if(e instanceof ArrayBuffer)return function*(e,t={}){let{chunkSize:r=262144}=t,i=0;for(;i<e.byteLength;){let t=Math.min(e.byteLength-i,r),n=new ArrayBuffer(t),s=new Uint8Array(e,i,t);new Uint8Array(n).set(s),i+=t,yield n}}(e,t);if((0,n.qf)(e))return a(e,t);if((0,n.H1)(e))return u(e,t);if((0,n.Sv)(e)){let r=e.body;if(!r)throw Error("Readable stream not available on Response");return u(r,t)}throw Error("makeIterator")}var h=r(92172);let d="Cannot convert supplied data type";function p(e,t,r){if(t.text&&"string"==typeof e)return e;if((0,i.Pe)(e)&&(e=e.buffer),(0,n.B1)(e)){let r=(0,i.Q_)(e);return t.text&&!t.binary?new TextDecoder("utf8").decode(r):(0,i.XA)(r)}throw Error(d)}async function m(e,t,r){if("string"==typeof e||(0,n.B1)(e))return p(e,t,r);if((0,n.qf)(e)&&(e=await (0,h.wv)(e)),(0,n.Sv)(e))return await (0,h.Mz)(e),t.binary?await e.arrayBuffer():await e.text();if((0,n.H1)(e)&&(e=c(e,r)),(0,n.xZ)(e)||(0,n.Td)(e))return(0,s.cy)(e);throw Error(d)}async function g(e,t){if("string"==typeof e)return new TextEncoder().encode(e).buffer;if((0,n.B1)(e))return(0,i.XA)((0,i.Q_)(e));if((0,n.qf)(e)&&(e=await (0,h.wv)(e)),(0,n.Sv)(e))return await (0,h.Mz)(e),await e.arrayBuffer();if((0,n.H1)(e)&&(e=c(e,t)),(0,n.xZ)(e)||(0,n.Td)(e))return(0,s.cy)(e);throw Error(d)}async function _(e,t){if((0,n.yL)(e)&&(e=await e),(0,n.Vv)(e))return e;if((0,n.Sv)(e)){await (0,h.Mz)(e);let r=await e.body;if(!r)throw Error(d);return c(r,t)}return(0,n.qf)(e)||(0,n.H1)(e)?c(e,t):(0,n.Td)(e)||(0,n.xZ)(e)?e:function(e){if(ArrayBuffer.isView(e)||(0,n.B1)(e))return function*(){yield(0,i.XA)(e)}();if((0,n.Vv)(e))return e;if((0,n.xZ)(e))return e[Symbol.iterator]();throw Error(d)}(e)}},61550(e,t,r){r.d(t,{z:()=>o});var i=r(92767),n=r(2946),s=r(40660),a=r(44440);function o(e,t){let r,o=(0,a.pp)(),u=e||o,l=u.fetch??u.core?.fetch;return r="function"==typeof l?l:(0,i.Gv)(l)?t?.fetch||s.t2:t?.fetch?t.fetch:s.t2,(0,n.Wm)({fetch:r,credentials:u.core?.credentials||[],authentications:u.core?.authentications,fetchOptions:(0,i.Gv)(l)?l:void 0})}},86655(e,t,r){r.d(t,{i:()=>u,l:()=>o});var i=r(61550),n=r(50293),s=r(31255),a=r(82939);function o(e,t,r){if(r)return{...r,coreApi:r.coreApi||e.coreApi||a.k,_parse:r._parse||e._parse,fetch:(0,i.z)(t,r)};let o={...e,fetch:(0,i.z)(t,e),coreApi:e.coreApi||a.k};if(o.url){let e=(0,n.S3)(o.url);o.baseUrl=e,o.queryString=(0,n.by)(o.url),o.filename=s.iW(e),o.baseUrl=s.pD(e)}return Array.isArray(o.loaders)||(o.loaders=null),o}function u(e,t){let r;if(e&&!Array.isArray(e))return e;if(e&&(r=Array.isArray(e)?e:[e]),t&&t.loaders){let e=Array.isArray(t.loaders)?t.loaders:[t.loaders];r=r?[...r,...e]:e}return r&&r.length?r:void 0}},66771(e,t,r){r.d(t,{D:()=>s,l:()=>n});var i=r(60574);function n(e){return!!e&&(Array.isArray(e)&&(e=e[0]),Array.isArray(e?.extensions))}function s(e){let t;return(0,i.v)(e,"null loader"),(0,i.v)(n(e),"invalid loader"),Array.isArray(e)&&(t=e[1],e={...e=e[0],options:{...e.options,...t}}),(e?.parseTextSync||e?.parseText)&&(e.text=!0),e.text||(e.binary=!0),e}},44440(e,t,r){r.d(t,{a5:()=>g,Rf:()=>_,K2:()=>p,b3:()=>d,pp:()=>m});var i=r(92767),n=r(31255);let s=new(r(70486)).h({id:"loaders.gl"});class a{log(){return()=>{}}info(){return()=>{}}once(){return()=>{}}warn(){return()=>{}}error(){return()=>{}}}class o{console;onceMessages=new Set;constructor(){this.console=console}log(...e){return this.console.log.bind(this.console,...e)}info(...e){return this.console.info.bind(this.console,...e)}once(...e){let t=String(e[0]);return this.onceMessages.has(t)?()=>{}:(this.onceMessages.add(t),this.console.info.bind(this.console,...e))}warn(...e){return this.console.warn.bind(this.console,...e)}error(...e){return this.console.error.bind(this.console,...e)}}var u=r(18122);let l={searchParams:void 0,core:{baseUrl:void 0,fetch:null,mimeType:void 0,fallbackMimeType:void 0,ignoreRegisteredLoaders:void 0,nothrow:!1,shape:void 0,log:new o,useLocalLibraries:!1,subloaders:void 0,CDN:"https://unpkg.com/@loaders.gl",worker:!0,workerThreshold:.1,maxConcurrency:3,maxMobileConcurrency:1,reuseWorkers:u.Bd,_nodeWorkers:!1,_workerType:"",limit:0,_limitMB:0,batchSize:"auto",batchDebounceMs:0,metadata:!1,transforms:[]}},f={baseUri:"core.baseUrl",fetch:"core.fetch",mimeType:"core.mimeType",fallbackMimeType:"core.fallbackMimeType",ignoreRegisteredLoaders:"core.ignoreRegisteredLoaders",nothrow:"core.nothrow",log:"core.log",useLocalLibraries:"core.useLocalLibraries",CDN:"core.CDN",worker:"core.worker",maxConcurrency:"core.maxConcurrency",maxMobileConcurrency:"core.maxMobileConcurrency",reuseWorkers:"core.reuseWorkers",_nodeWorkers:"core.nodeWorkers",_workerType:"core._workerType",_worker:"core._workerType",limit:"core.limit",_limitMB:"core._limitMB",shape:"core.shape",batchSize:"core.batchSize",batchDebounceMs:"core.batchDebounceMs",metadata:"core.metadata",transforms:"core.transforms",throws:"nothrow",dataType:"(no longer used)",uri:"core.baseUrl",method:"core.fetch.method",headers:"core.fetch.headers",body:"core.fetch.body",mode:"core.fetch.mode",credentials:"core.fetch.credentials",cache:"core.fetch.cache",redirect:"core.fetch.redirect",referrer:"core.fetch.referrer",referrerPolicy:"core.fetch.referrerPolicy",integrity:"core.fetch.integrity",keepalive:"core.fetch.keepalive",signal:"core.fetch.signal"};var c=r(50293);let h=["baseUrl","fetch","mimeType","fallbackMimeType","ignoreRegisteredLoaders","nothrow","log","useLocalLibraries","CDN","worker","workerThreshold","maxConcurrency","maxMobileConcurrency","reuseWorkers","workerTransferBufferCopy","_nodeWorkers","_workerType","limit","_limitMB","shape","batchSize","batchDebounceMs","metadata","transforms"];function d(e,t){let r=t?.searchParams;if(!r||0===Object.keys(r).length||/^(?:data|blob):/i.test(e))return e;let i=e.indexOf("#"),n=i>=0?e.slice(i):"",s=i>=0?e.slice(0,i):e,a=s.indexOf("?"),o=a>=0?s.slice(0,a):s,u=a>=0?s.slice(a+1):"",l=new URLSearchParams(u),f=new URLSearchParams;for(let[e,t]of Object.entries(r))l.has(e)||f.set(e,String(t));let c=f.toString();return`${o}${a>=0?`?${u}`:""}${c?`${a>=0?"&":"?"}${c}`:""}${n}`}function p(){globalThis.loaders=globalThis.loaders||{};let{loaders:e}=globalThis;return e._state||(e._state={}),e._state}function m(){let e=p();return e.globalOptions=e.globalOptions||{...l,core:{...l.core}},_(e.globalOptions)}function g(e,t,r,s){var o,u,d,p,g;let E,x,S;(function(e,t){for(let r of(y(e,null,l,f,t),t)){let i=e&&e[r.id]||{},n=r.options&&r.options[r.id]||{},s=r.deprecatedOptions&&r.deprecatedOptions[r.id]||{};y(i,r.id,n,s,t)}})(e,r=Array.isArray(r=r||[])?r:[r]),b(e);let A=_((o=t,u=e,d=s,x={...E=o.options||{}},E.core&&(x.core={...E.core}),w(x),x.core?.log===null&&(x.core={...x.core,log:new a}),v(x,_(m())),v(x,S=_(u)),function(e,t,r){let n=e.core?.shape;if(void 0===n)return;let s=r.options?.[r.id];if(!(0,i.aC)(s)||!("shape"in s))return;let a=m()[r.id];if((0,i.aC)(a)&&"shape"in a)return;let o=t[r.id];if((0,i.aC)(o)&&"shape"in o)return;let u=e[r.id];e[r.id]={...(0,i.aC)(u)?u:{},shape:n}}(x,S,o),p=x,(g=d)&&p.core?.baseUrl===void 0&&(p.core||={},p.core.baseUrl=n.pD((0,c.S3)(g))),function(e){let t=e.core;if(t)for(let r of h)void 0!==t[r]&&(e[r]=t[r])}(x),x));return b(A),A}function _(e){var t;let r,i=(r={...t=e},t.core&&(r.core={...t.core}),r);for(let e of(w(i),h))i.core&&void 0!==i.core[e]&&delete i[e];return i.core&&void 0!==i.core._workerType&&delete i._worker,i}function b(e){let t=e.core?.workerThreshold;if(void 0!==t&&(!Number.isFinite(t)||t<0||t>1))throw Error("core.workerThreshold must be a finite number between 0 and 1")}function y(e,t,r,n,a){let o=t||"Top level",u=t?`${t}.`:"";for(let l in e){let f=!t&&(0,i.Gv)(e[l]),c="baseUri"===l&&!t,h="workerUrl"===l&&t;if(!(l in r)&&!c&&!h){if(l in n)s.level>0&&s.warn(`${o} loader option '${u}${l}' no longer supported, use '${n[l]}'`)();else if(!f&&s.level>0){let e=function(e,t){let r=e.toLowerCase(),i="";for(let n of t)for(let t in n.options){if(e===t)return`Did you mean '${n.id}.${t}'?`;let s=t.toLowerCase();(r.startsWith(s)||s.startsWith(r))&&(i=i||`Did you mean '${n.id}.${t}'?`)}return i}(l,a);s.warn(`${o} loader option '${u}${l}' not recognized. ${e}`)()}}}}function v(e,t){for(let r in t)if(r in t){let n=t[r];(0,i.aC)(n)&&(0,i.aC)(e[r])?e[r]={...e[r],...t[r]}:e[r]=t[r]}}function w(e){for(let t of(void 0!==e.baseUri&&(e.core||={},void 0===e.core.baseUrl&&(e.core.baseUrl=e.baseUri)),h))if(void 0!==e[t]){e.core||={};let r=e.core;void 0===r[t]&&(r[t]=e[t])}let t=e._worker;void 0!==t&&(e.core||={},void 0===e.core._workerType&&(e.core._workerType=t))}},24103(e,t,r){r.d(t,{JQ:()=>s,OA:()=>a,d_:()=>o});let i=/^data:([-\w.]+\/[-\w.+]+)(;|,)/,n=/^([-\w.]+\/[-\w.+]+)/;function s(e,t){return e.toLowerCase()===t.toLowerCase()}function a(e){let t=n.exec(e);return t?t[1]:e}function o(e){let t=i.exec(e);return t?t[1]:""}},42766(e,t,r){r.d(t,{Al:()=>a,_E:()=>u,z4:()=>o});var i=r(92767),n=r(24103),s=r(50293);function a(e){return(0,i.Sv)(e)?e.url:(0,i.qf)(e)?("name"in e?e.name:"")||"":"string"==typeof e?e:""}function o(e){if((0,i.Sv)(e)){let t=e.headers.get("content-type")||"",r=(0,s.S3)(e.url);return(0,n.OA)(t)||(0,n.d_)(r)}return(0,i.qf)(e)?e.type||"":"string"==typeof e?(0,n.d_)(e):""}function u(e){return(0,i.Sv)(e)?e.headers["content-length"]||-1:(0,i.qf)(e)?e.size:"string"==typeof e?e.length:e instanceof ArrayBuffer||ArrayBuffer.isView(e)?e.byteLength:-1}},92172(e,t,r){r.d(t,{Mz:()=>l,wv:()=>u});var i=r(92767),n=r(15047);class s extends Error{constructor(e,t){super(e),this.reason=t.reason,this.url=t.url,this.response=t.response}reason;url;response}var a=r(42766),o=r(50293);async function u(e){if((0,i.Sv)(e))return e;let t={},r=(0,a._E)(e);r>=0&&(t["content-length"]=String(r));let n=(0,a.Al)(e),s=(0,a.z4)(e);s&&(t["content-type"]=s);let o=await c(e);o&&(t["x-first-bytes"]=o),"string"==typeof e&&(e=new TextEncoder().encode(e));let u=new Response(e,{headers:t});return Object.defineProperty(u,"url",{value:n}),u}async function l(e){if(!e.ok)throw await f(e)}async function f(e){let t=(0,o.E1)(e.url),r=`Failed to fetch resource (${e.status}) ${e.statusText}: ${t}`;r=r.length>100?`${r.slice(0,100)}...`:r;let i={reason:e.statusText,url:e.url,response:e};try{let t=e.headers.get("Content-Type");i.reason=!e.bodyUsed&&t?.includes("application/json")?await e.json():await e.text()}catch(e){}return new s(r,i)}async function c(e){if("string"==typeof e)return`data:,${e.slice(0,5)}`;if(e instanceof Blob){let t=e.slice(0,5);return await new Promise(e=>{let r=new FileReader;r.onload=t=>e(t?.target?.result),r.readAsDataURL(t)})}if(e instanceof ArrayBuffer){let t=e.slice(0,5),r=(0,n.I)(t);return`data:base64,${r}`}return null}},50293(e,t,r){r.d(t,{E1:()=>a,S3:()=>s,by:()=>n});let i=/\?.*/;function n(e){let t=e.match(i);return t&&t[0]}function s(e){return e.replace(i,"")}function a(e){if(e.length<50)return e;let t=e.slice(e.length-15),r=e.substr(0,32);return`${r}...${t}`}},86550(e,t,r){r.d(t,{Wp:()=>s,f5:()=>n});var i=r(3801);let n={id:"image",module:"images",name:"Images",encoding:"image",format:"image",mimeTypes:["image/png","image/jpeg","image/gif","image/webp","image/avif","image/bmp","image/vnd.microsoft.icon","image/svg+xml"],extensions:["png","jpg","jpeg","gif","webp","bmp","ico","svg","avif"],tests:[e=>!!(0,i.m)(new DataView(e))]},s={...n,id:"imagebitmap",name:"ImageBitmap",format:"image-bitmap"}},66410(e,t,r){r.d(t,{$:()=>s});var i=r(59867);async function n(){let{ImageLoaderWithParser:e}=await r.e("570").then(r.bind(r,89873));return e}let s={dataType:null,batchType:null,...r(86550).f5,version:i.x,options:{image:{type:"auto",decode:!0}},preload:n}},3801(e,t,r){function i(e){var t,r;let i,s,a,o,u=n(e);return((i=n(u)).byteLength>=33&&0x89504e47===i.getUint32(0,!1)&&0xd0a1a0a===i.getUint32(4,!1)&&13===i.getUint32(8,!1)&&0x49484452===i.getUint32(12,!1)?{mimeType:"image/png",width:i.getUint32(16,!1),height:i.getUint32(20,!1)}:null)||function(e){let t=n(e);if(!(t.byteLength>=3&&65496===t.getUint16(0,!1)&&255===t.getUint8(2)))return null;let{tableMarkers:r,sofMarkers:i}=function(){let e=new Set([65499,65476,65484,65501,65534]);for(let t=65504;t<65520;++t)e.add(t);return{tableMarkers:e,sofMarkers:new Set([65472,65473,65474,65475,65477,65478,65479,65481,65482,65483,65485,65486,65487,65502])}}(),s=2;for(;s+9<t.byteLength;){let e=t.getUint16(s,!1);if(i.has(e))return{mimeType:"image/jpeg",height:t.getUint16(s+5,!1),width:t.getUint16(s+7,!1)};if(!r.has(e))break;s+=2,s+=t.getUint16(s,!1)}return null}(u)||((s=n(u)).byteLength>=10&&0x47494638===s.getUint32(0,!1)?{mimeType:"image/gif",width:s.getUint16(6,!0),height:s.getUint16(8,!0)}:null)||((a=n(u)).byteLength>=14&&16973===a.getUint16(0,!1)&&a.getUint32(2,!0)===a.byteLength?{mimeType:"image/bmp",width:a.getUint32(18,!0),height:a.getUint32(22,!0)}:null)||((o=!function(e,t,r=0){let i=[...t].map(e=>e.charCodeAt(0));for(let t=0;t<i.length;++t)if(i[t]!==e[t+r])return!1;return!0}(r=new Uint8Array((t=u)instanceof DataView?t.buffer:t),"ftyp",4)||(96&r[8])==0?null:function(e){switch(String.fromCharCode(...e.slice(8,12)).replace("\0"," ").trim()){case"avif":case"avis":return{extension:"avif",mimeType:"image/avif"};default:return null}}(r))?{mimeType:o.mimeType,width:0,height:0}:null)}function n(e){if(e instanceof DataView)return e;if(ArrayBuffer.isView(e))return new DataView(e.buffer);if(e instanceof ArrayBuffer)return new DataView(e);throw Error("toDataView")}r.d(t,{m:()=>i})},59867(e,t,r){r.d(t,{x:()=>i});let i="5.0.0-alpha.11"},87950(e,t,r){function i(e,t,r){if(r=r||e.byteLength,e.byteLength<r||t.byteLength<r)return!1;let i=new Uint8Array(e),n=new Uint8Array(t);for(let e=0;e<i.length;++e)if(i[e]!==n[e])return!1;return!0}function n(...e){var t=e;let r=t.map(e=>e instanceof ArrayBuffer?new Uint8Array(e):e),i=new Uint8Array(r.reduce((e,t)=>e+t.byteLength,0)),s=0;for(let e of r)i.set(e,s),s+=e.byteLength;return i.buffer}function s(...e){let t=e&&e.length>1&&e[0].constructor||null;if(!t)throw Error('"concatenateTypedArrays" - incorrect quantity of arguments or arguments have incompatible data types');let r=new t(e.reduce((e,t)=>e+t.length,0)),i=0;for(let t of e)r.set(t,i),i+=t.length;return r}function a(e,t,r){let i=void 0!==r?new Uint8Array(e).subarray(t,t+r):new Uint8Array(e).subarray(t);return new Uint8Array(i).buffer}r.d(t,{AQ:()=>n,En:()=>s,YV:()=>i,_m:()=>a})},15047(e,t,r){r.d(t,{I:()=>i});function i(e){let t=new Uint8Array(e),r=[];for(let e=0;e<t.length;e+=12288)r.push(btoa(String.fromCharCode(...t.subarray(e,e+12288))));return r.join("")}},69385(e,t,r){r.d(t,{aK:()=>o,XA:()=>s,Q_:()=>u,Pe:()=>n,W$:()=>a});var i=r(92767);function n(e){return e&&"object"==typeof e&&e.isBuffer}function s(e){if(n(e)||e instanceof ArrayBuffer)return e;if((0,i.L8)(e))return o(e);if(ArrayBuffer.isView(e)){let t=e.buffer;return 0===e.byteOffset&&e.byteLength===e.buffer.byteLength?t:t.slice(e.byteOffset,e.byteOffset+e.byteLength)}if("string"==typeof e)return new TextEncoder().encode(e).buffer;if(e&&"object"==typeof e&&e._toArrayBuffer)return e._toArrayBuffer();throw Error("toArrayBuffer")}function a(e){if(e instanceof ArrayBuffer)return e;if((0,i.L8)(e))return o(e);let{buffer:t,byteOffset:r,byteLength:n}=e;return t instanceof ArrayBuffer&&0===r&&n===t.byteLength?t:o(t,r,n)}function o(e,t=0,r=e.byteLength-t){let i=new Uint8Array(e,t,r),n=new Uint8Array(i.length);return n.set(i),n.buffer}function u(e){return ArrayBuffer.isView(e)?e:new Uint8Array(e)}},60574(e,t,r){r.d(t,{v:()=>i});function i(e,t){if(!e)throw Error(t||"loader assertion failed.")}},18122(e,t,r){r.d(t,{Bd:()=>n});let i={self:"u">typeof self&&self,window:"u">typeof window&&window,global:"u">typeof global&&global,document:"u">typeof document&&document};i.self||i.window||i.global,i.window||i.self||i.global,i.global||i.self||i.window,i.document;let n=!!("object"!=typeof process||"[object process]"!==String(process)||process.browser),s="u">typeof process&&process.version&&/v([0-9]*)/.exec(process.version);s&&parseFloat(s[1])},53240(e,t,r){r.d(t,{Pb:()=>s,cy:()=>n});var i=r(87950);async function n(e){let t=[];for await(let r of e)t.push(a(r));return(0,i.AQ)(...t)}async function*s(e){for await(let t of e)yield a(t)}function a(e){if(e instanceof ArrayBuffer)return e;if(ArrayBuffer.isView(e)){let{buffer:t,byteOffset:r,byteLength:i}=e;return o(t,r,i)}return o(e)}function o(e,t=0,r=e.byteLength-t){let i=new Uint8Array(e,t,r),n=new Uint8Array(i.length);return n.set(i),n.buffer}},92767(e,t,r){r.d(t,{B1:()=>a,Gv:()=>i,H1:()=>d,L8:()=>s,Sv:()=>c,Td:()=>l,Vv:()=>f,aC:()=>n,qf:()=>h,xZ:()=>u,yL:()=>o});let i=e=>null!==e&&"object"==typeof e,n=e=>i(e)&&e.constructor===({}).constructor,s=e=>"u">typeof SharedArrayBuffer&&e instanceof SharedArrayBuffer,a=e=>i(e)&&"number"==typeof e.byteLength&&"function"==typeof e.slice,o=e=>i(e)&&"then"in e&&"function"==typeof e.then,u=e=>!!e&&"function"==typeof e[Symbol.iterator],l=e=>!!e&&"function"==typeof e[Symbol.asyncIterator],f=e=>!!e&&"function"==typeof e.next,c=e=>"u">typeof Response&&e instanceof Response||i(e)&&"function"==typeof e.arrayBuffer&&"function"==typeof e.text&&"function"==typeof e.json,h=e=>"u">typeof Blob&&e instanceof Blob,d=e=>{let t,r;return t=e,"u">typeof ReadableStream&&t instanceof ReadableStream||i(t)&&"function"==typeof t.tee&&"function"==typeof t.cancel&&"function"==typeof t.getReader||i(r=e)&&"function"==typeof r.read&&"function"==typeof r.pipe&&"boolean"==typeof r.readable}},68433(e,t,r){let i;r.d(t,{R:()=>o});var n=r(70486);let s="5.0.0-alpha.11",a=s[0]>="0"&&s[0]<="9"?`v${s}`:"",o=(i=new n.h({id:"loaders.gl"}),globalThis.loaders||={},globalThis.loaders.log=i,globalThis.loaders.version=a,globalThis.probe||={},globalThis.probe.loaders=i,i)},90557(e,t,r){r.d(t,{l:()=>n});var i=r(92767);function n(e,t){return function e(t,r,n=0){if(n>3)return r;let s={...t};for(let[t,a]of Object.entries(r))(0,i.aC)(a)?s[t]=e(s[t]||{},r[t],n+1):s[t]=r[t];return s}(e||{},t)}},76849(e,t,r){r.d(t,{o1:()=>n});let i={};function n(e){for(let t in i)if(e.startsWith(t)){let r=i[t];e=e.replace(t,r)}return e.startsWith("http://")||e.startsWith("https://")||(e=`${e}`),e}},31255(e,t,r){function i(e){let t=e?e.lastIndexOf("/"):-1;return t>=0?e.substr(t+1):e}function n(e){let t=e?e.lastIndexOf("/"):-1;return t>=0?e.substr(0,t):""}function s(...e){let t,r=[];for(let t=0;t<e.length;t++)r[t]=e[t];let i="",n=!1;for(let e=r.length-1;e>=-1&&!n;e--){let s;e>=0?s=r[e]:(void 0===t&&(t=function(){if("u">typeof process&&void 0!==process.cwd)return process.cwd();let e=globalThis.location?.pathname;return e?.slice(0,e.lastIndexOf("/")+1)||""}()),s=t),0!==s.length&&(i=`${s}/${i}`,n=s.charCodeAt(0)===a)}return(i=function(e,t){let r,i="",n=-1,s=0,o=!1;for(let u=0;u<=e.length;++u){if(u<e.length)r=e.charCodeAt(u);else if(r===a)break;else r=a;if(r===a){if(n===u-1||1===s);else if(n!==u-1&&2===s){if(i.length<2||!o||46!==i.charCodeAt(i.length-1)||46!==i.charCodeAt(i.length-2)){if(i.length>2){let e=i.length-1,t=e;for(;t>=0&&i.charCodeAt(t)!==a;--t);if(t!==e){i=-1===t?"":i.slice(0,t),n=u,s=0,o=!1;continue}}else if(2===i.length||1===i.length){i="",n=u,s=0,o=!1;continue}}t&&(i.length>0?i+="/..":i="..",o=!0)}else{let t=e.slice(n+1,u);i.length>0?i+=`/${t}`:i=t,o=!1}n=u,s=0}else 46===r&&-1!==s?++s:s=-1}return i}(i,!n),n)?`/${i}`:i.length>0?i:"."}r.d(t,{hd:()=>s,pD:()=>n,iW:()=>i});let a=47},48090(e,t,r){function i(e,t=[]){return e.every(a)?e:e.map((e,r)=>{let i;if(a(e))return e;let n=t.find(t=>t.type===e?.type);if(!n)throw Error(`No authentication class registered for credential at index ${r}.`);try{i=new n(e)}catch{throw Error(`Invalid authentication configuration at index ${r}.`)}if(!a(i))throw Error(`Authentication class returned an invalid credential at index ${r}.`);return i})}function n(e){if(!e.core?.credentials?.length)return e;let t=i(e.core.credentials,e.core.authentications);return t===e.core.credentials?e:{...e,core:{...e.core,credentials:t}}}async function s(e,t,r){if(!r.core?.credentials?.length||r.core.credentials.every(a))return r;let i=await e?.getAuthentications?.(t,r);return i?.length?n({...r,core:{...r.core,authentications:[...r.core?.authentications||[],...i]}}):n(r)}function a(e){return!!e&&"object"==typeof e&&"string"==typeof e.id&&!!Array.isArray(e.origins)&&("request"===e.type?"function"==typeof e.authenticate:("header"===e.type||"query-parameter"===e.type)&&"string"==typeof e.name&&("string"==typeof e.token||"function"==typeof e.token)&&Array.isArray(e.refreshStatusCodes))}r.d(t,{Bv:()=>n,M8:()=>s,z8:()=>i})},2946(e,t,r){r.d(t,{El:()=>o,Kt:()=>l,Wm:()=>u});var i=r(48090);let n=[401,403],s=Symbol("loaders.gl.authenticated-fetch"),a=new WeakMap;function o(e){return{id:e.id,origins:function(e){if(!e.length)throw Error("Request credentials require at least one exact origin.");return e.map(e=>{let t=new URL(e);if(!["http:","https:"].includes(t.protocol)||"/"!==t.pathname||t.search||t.hash)throw Error(`Credential origin must contain only scheme, host, and port: ${e}`);return t.origin})}(e.origins),type:"header",name:e.headerName||"Authorization",prefix:e.prefix??"Bearer ",token:e.token,refreshStatusCodes:e.refreshStatusCodes||n}}function u(e){let t=e.fetch||((e,t)=>fetch(e,t)),r=t[s],n=new Map(r?.credentialResolutions),a=(0,i.z8)(e.credentials.map(e=>n.get(e)||e),e.authentications);if(e.credentials.forEach((e,t)=>{n.set(e,a[t])}),!e.fetchOptions&&(!a.length||r?.credentials.length===a.length&&a.every((e,t)=>e===r.credentials[t])))return t;let o=r?.fetch||t,u=r?[...new Set([...a,...r.credentials])]:a,l=f(r?.fetchOptions||{},e.fetchOptions),h=u.filter(e=>"request"!==e.type),g=u.filter(e=>"request"===e.type);for(let e of g)d(e.origins);let y=async(e,t={})=>{if(t=f(l,t),t.signal?.aborted)throw b();if(!u.length)return o(e,t);let r=function(e){try{let t=new URL(e);return["http:","https:"].includes(t.protocol)?t:null}catch{return null}}(e),i=r?await p(r,t,h):{url:e,options:t,credentials:[]},n=await c(i,g,"request"),s=await o(n.url,n.options),a=[];for(let r of i.credentials){let{credential:i}=r;"function"==typeof i.token&&(_(t)||i.canReplayRequest?.(e,t))&&(_(n.options)||i.canReplayRequest?.(n.url,n.options))&&(i.refreshStatusCodes.includes(s.status)||await i.shouldRefresh?.(s))&&a.push(r)}let d=_(t)&&_(n.options)&&n.credentials.some(e=>e.refreshStatusCodes?.includes(s.status));if(!a.length&&!d)return s;if(t.signal?.aborted)throw b();let y=new Map;if(await Promise.all(a.map(async({credential:t})=>{let r=await m(t,e,s);r&&y.set(t,r)})),!y.size&&!d)return s;if(await s.body?.cancel().catch(()=>{}),t.signal?.aborted)throw b();let v=r?await p(r,t,h,y,i.credentials):{url:e,options:t},w=await c(v,g,"retry",s);return o(w.url,w.options)};return Object.defineProperty(y,s,{value:{fetch:o,credentials:u,credentialResolutions:n,fetchOptions:l}}),y}function l(e={}){let t=e.fetch??e.core?.fetch;return u({fetch:"function"==typeof t?t:(e,t)=>fetch(e,t),fetchOptions:"object"==typeof t&&t?t:void 0,credentials:e.core?.credentials||[],authentications:e.core?.authentications})}function f(e,t){let r={...e,...t};if(e.headers||t?.headers){let i=new Headers(e.headers);new Headers(t?.headers).forEach((e,t)=>i.set(t,e)),r.headers=i}return r}async function c(e,t,r,i){let n=[],s=e.options.signal;for(let a of t){let t=h(e.url);if(!t||!d(a.origins).includes(t))continue;if(s?.aborted)throw b();let o=await a.authenticate({url:e.url,options:{...e.options,headers:new Headers(e.options.headers)},reason:r,response:i?{status:i.status,headers:new Headers(i.headers)}:void 0});if(!o||"string"!=typeof o.url||!o.options||"object"!=typeof o.options)throw Error("Authentication callback returned an invalid request.");e={url:o.url,options:{...o.options,...s?{signal:s}:{}}},n.push(a)}if(s?.aborted)throw b();return{...e,credentials:n}}function h(e){try{let t=new URL(e);if(!t.host||t.username||t.password)return null;return"null"!==t.origin?t.origin:`${t.protocol}//${t.host}`}catch{return null}}function d(e){if(!e.length)throw Error("Request authentication requires at least one exact origin.");return e.map(e=>{let t,r=h(e);try{t=new URL(e)}catch{throw Error("Invalid request authentication origin.")}if(!r||t.pathname&&"/"!==t.pathname||t.search||t.hash)throw Error("Invalid request authentication origin.");return r})}async function p(e,t,r,i=new Map,n=[]){let s=new URL(e),a=new Headers(t.headers),o=[],u=new Map(n.map(({credential:e,token:t})=>[e,t]));for(let t of r){if(!t.origins.includes(s.origin))continue;let r=i.get(t),n=u.get(t),l="query-parameter"===t.type&&void 0!==n,f="header"===t.type&&void 0!==n;if("query-parameter"===t.type&&s.searchParams.has(t.name)&&!l||"header"===t.type&&a.has(t.name)&&!f)continue;let c=r??n??await g(t.token,{url:e.toString(),reason:"request"});c&&("query-parameter"===t.type?s.searchParams.set(t.name,c):a.set(t.name,`${t.prefix||""}${c}`),o.push({credential:t,token:c}))}return{url:s.toString(),options:{...t,headers:a},credentials:o}}async function m(e,t,r){let i=a.get(e);if(i)return i;let n=Promise.resolve((0,e.token)({url:t,reason:"refresh",response:{status:r.status,headers:r.headers}})).finally(()=>a.delete(e));return a.set(e,n),n}async function g(e,t){return"function"==typeof e?e(t):e}function _(e){return!!["GET","HEAD","OPTIONS","PUT","DELETE"].includes((e.method||"GET").toUpperCase())&&!(e.body&&"u">typeof ReadableStream&&e.body instanceof ReadableStream)}function b(){return new DOMException("The operation was aborted.","AbortError")}},14550(e,t,r){r.d(t,{sA:()=>O,FR:()=>k,gm:()=>I,L6:()=>C});var i=r(98401);class n{_values;_settlers;_closed;constructor(){this._values=[],this._settlers=[],this._closed=!1}[Symbol.asyncIterator](){return this}push(e){return this.enqueue(e)}enqueue(e){if(this._closed)throw Error("Closed");if(this._settlers.length>0){if(this._values.length>0)throw Error("Illegal internal state");let t=this._settlers.shift();e instanceof Error?t.reject(e):t.resolve({value:e})}else this._values.push(e)}close(){for(;this._settlers.length>0;)this._settlers.shift().resolve({done:!0});this._closed=!0}next(){if(this._values.length>0){let e=this._values.shift();return e instanceof Error?Promise.reject(e):Promise.resolve({done:!1,value:e})}if(this._closed){if(this._settlers.length>0)throw Error("Illegal internal state");return Promise.resolve({done:!0,value:void 0})}return new Promise((e,t)=>{this._settlers.push({resolve:e,reject:t})})}}class s{constructor(...e){let t=globalThis.process,r=t?.getBuiltinModule?.("node:worker_threads").Worker;if(r)return new r(...e)}terminate(){}}var a=r(76683);let o=new Map;function u(e){let t=new Blob([e],{type:"application/javascript"});return URL.createObjectURL(t)}function l(e){return!!e&&!!(e instanceof ArrayBuffer||"u">typeof MessagePort&&e instanceof MessagePort||"u">typeof ImageBitmap&&e instanceof ImageBitmap||"u">typeof OffscreenCanvas&&e instanceof OffscreenCanvas)}function f(e){if(null===e)return{};let t=Object.assign({},e);return Object.keys(t).forEach(r=>{"object"!=typeof e[r]||ArrayBuffer.isView(e[r])||e[r]instanceof Array?"function"==typeof t[r]||t[r]instanceof RegExp?t[r]={}:t[r]=e[r]:t[r]=f(e[r])}),t}let c=()=>{};class h{name;source;url;getUrl;loadWorker;terminated=!1;worker;onMessage;onError;_loadableURL="";static isSupported(){return"u">typeof Worker&&i.Bd||!i.Bd}constructor(e){let{name:t,source:r,url:n,getUrl:s,loadWorker:o}=e;(0,a.v)(r||n||s||o),this.name=t,this.source=r,this.url=n,this.getUrl=s,this.loadWorker=o,this.onMessage=c,this.onError=e=>console.log(e),this.worker=i.Bd?this._createBrowserWorker():this._createNodeWorker()}destroy(){this.onMessage=c,this.onError=c,this.worker.terminate(),this.terminated=!0}unref(){i.Bd||"function"!=typeof this.worker.unref||this.worker.unref()}ref(){i.Bd||"function"!=typeof this.worker.ref||this.worker.ref()}get isRunning(){return!!this.onMessage}postMessage(e,t){t=t||function e(t,r=!0,i){let n=i||new Set;if(t){if(l(t))n.add(t);else if(l(t.buffer))n.add(t.buffer);else if(ArrayBuffer.isView(t));else if(r&&"object"==typeof t)for(let i in t)e(t[i],r,n)}return void 0===i?Array.from(n):[]}(e),this.worker.postMessage(e,t)}_getErrorFromErrorEvent(e){let t="Failed to load ";return t+=`worker ${this.name} from ${this.url||"built-in worker factory"}. `,e.message&&(t+=`${e.message} in `),e.lineno&&(t+=`:${e.lineno}:${e.colno}`),Error(t)}_createBrowserWorker(){var e,t,r;let i;if(this.loadWorker)try{let e=this.loadWorker();if(e)return this._initializeBrowserWorker(e)}catch(e){if(!this.source&&!this.url&&!this.getUrl)throw e}let n=this.url||this.getUrl?.();this._loadableURL=(e={source:this.source,url:n},(0,a.v)(e.source&&!e.url||!e.source&&e.url),(i=o.get(e.source||e.url))||(e.url&&(i=(t=e.url).startsWith("http")?u((r=t,`\
try {
  importScripts('${r}');
} catch (error) {
  console.error(error);
  throw error;
}`)):t,o.set(e.url,i)),e.source&&(i=u(e.source),o.set(e.source,i))),(0,a.v)(i),i);let s=new Worker(this._loadableURL,{name:this.name});return this._initializeBrowserWorker(s)}_initializeBrowserWorker(e){return e.onmessage=e=>{e.data?this.onMessage(e.data):this.onError(Error("No data received"))},e.onerror=e=>{this.onError(this._getErrorFromErrorEvent(e)),this.terminated=!0},e.onmessageerror=e=>console.error(e),e}_createNodeWorker(){let e;if(this.url){let t=this.url.includes(":/")||this.url.startsWith("/")?this.url:`./${this.url}`;e=new s(t.startsWith("file:")?new URL(t):t,{eval:!1,type:this.url.endsWith(".ts")||this.url.endsWith(".mjs")?"module":"commonjs"})}else if(this.source)e=new s(this.source,{eval:!0});else throw Error("no worker");return e.on("message",e=>{this.onMessage(e)}),e.on("error",e=>{this.onError(e)}),e.on("exit",e=>{}),e}}class d{name;workerThread;isRunning=!0;result;_resolve=()=>{};_reject=()=>{};constructor(e,t){this.name=e,this.workerThread=t,this.result=new Promise((e,t)=>{this._resolve=e,this._reject=t})}postMessage(e,t){this.workerThread.postMessage({source:"loaders.gl",type:e,payload:t})}done(e){this.isRunning&&(this.isRunning=!1,this._resolve(e))}error(e){this.isRunning&&(this.isRunning=!1,this._reject(e))}abort(e){let t;if(!this.isRunning)return;let r=e??((t=Error(`Worker job "${this.name}" was aborted`)).name="AbortError",t);this.workerThread.destroy(),this.error(r)}}class p{name="unnamed";source;url;getUrl;loadWorker;maxConcurrency=1;maxMobileConcurrency=1;onDebug=()=>{};reuseWorkers=!0;props={};jobQueue=[];idleQueue=[];activeJobs=new Set;count=0;isDestroyed=!1;static isSupported(){return h.isSupported()}constructor(e){this.source=e.source,this.url=e.url,this.getUrl=e.getUrl,this.loadWorker=e.loadWorker,this.setProps(e)}destroy(e=Error("Worker pool was destroyed")){this.activeJobs.forEach(t=>t.abort(e)),this.jobQueue.splice(0).forEach(t=>t.onReject(e)),this.idleQueue.forEach(e=>e.destroy()),this.isDestroyed=!0}setProps(e){this.props={...this.props,...e},void 0!==e.name&&(this.name=e.name),void 0!==e.maxConcurrency&&(this.maxConcurrency=e.maxConcurrency),void 0!==e.maxMobileConcurrency&&(this.maxMobileConcurrency=e.maxMobileConcurrency),void 0!==e.reuseWorkers&&(this.reuseWorkers=e.reuseWorkers),void 0!==e.onDebug&&(this.onDebug=e.onDebug)}async startJob(e,t=(e,t,r)=>e.done(r),r=(e,t)=>e.error(t)){if(this.isDestroyed)return Promise.reject(Error("Worker pool was destroyed"));let i=new Promise((i,n)=>(this.jobQueue.push({name:e,onMessage:t,onError:r,onStart:i,onReject:n}),this));return this._startQueuedJob(),await i}async _startQueuedJob(){if(!this.jobQueue.length)return;let e=this._getAvailableWorker();if(!e)return;let t=this.jobQueue.shift();if(t){this.onDebug({message:"Starting job",name:t.name,workerThread:e,backlog:this.jobQueue.length});let r=new d(t.name,e);this.activeJobs.add(r),e.ref(),e.onMessage=e=>t.onMessage(r,e.type,e.payload),e.onError=e=>t.onError(r,e),t.onStart(r);try{await r.result}catch{}finally{this.activeJobs.delete(r),this.returnWorkerToQueue(e)}}}returnWorkerToQueue(e){e.terminated||this.isDestroyed||!this.reuseWorkers||this.count>this._getMaxConcurrency()?(e.terminated||e.destroy(),this.count--):(e.unref(),this.idleQueue.push(e)),this.isDestroyed||this._startQueuedJob()}_getAvailableWorker(){return this.idleQueue.length>0?this.idleQueue.shift()||null:this.count<this._getMaxConcurrency()?(this.count++,new h({name:`${this.name.toLowerCase()} (#${this.count} of ${this.maxConcurrency})`,source:this.source,url:this.url,getUrl:this.getUrl,loadWorker:this.loadWorker})):null}_getMaxConcurrency(){return i.Fr?this.maxMobileConcurrency:this.maxConcurrency}}let m={maxConcurrency:3,maxMobileConcurrency:1,reuseWorkers:!0,onDebug:()=>{}},g=new WeakMap,_=1;class b{props;workerPools=new Map;static _workerFarm;static isSupported(){return h.isSupported()}static getWorkerFarm(e={}){return b._workerFarm=b._workerFarm||new b({}),b._workerFarm.setProps(e),b._workerFarm}constructor(e){this.props={...m},this.setProps(e),this.workerPools=new Map}destroy(e){for(let t of this.workerPools.values())t.destroy(e);this.workerPools=new Map}setProps(e){for(let t of(this.props={...this.props,...e},this.workerPools.values()))t.setProps(this._getWorkerPoolProps())}getWorkerPool(e){let{name:t,source:r,url:i,getUrl:n,loadWorker:s}=e,a=function(e){var t;let r,{name:i,source:n,url:s,urlKey:a,loadWorker:o}=e;return[i,n?`source:${n}`:"",s||a?`url:${s||a}`:"",o?`loadWorker:${t=o,(r=g.get(t))||(r=_++,g.set(t,r)),r}`:""].filter(Boolean).join("|")}(e),o=this.workerPools.get(a);return o||((o=new p({name:t,source:r,url:i,getUrl:n,loadWorker:s})).setProps(this._getWorkerPoolProps()),this.workerPools.set(a,o)),o}_getWorkerPoolProps(){return{maxConcurrency:this.props.maxConcurrency,maxMobileConcurrency:this.props.maxMobileConcurrency,reuseWorkers:this.props.reuseWorkers,onDebug:this.props.onDebug}}}var y=r(17965);let v=new Set;function w(e){let t=e.version!==y.x?` (worker-utils@${y.x})`:"";return`${e.name}@${e.version}${t}`}function E(e,t={}){let r=t[e.id]||{},n=i.Bd?e.workerFile||`${e.id}-worker.js`:e.workerNode||`${e.id}-worker-node.js`,s=r.workerUrl;s||"compression"!==e.id||(s=t.workerUrl);let a=t._workerType||t?.core?._workerType;return s||"test"!==a||(s=i.Bd?`modules/${e.module}/dist/${n}`:`modules/${e.module}/src/workers/${e.id}-worker-node.ts`),s||null}function x(e,t={}){let r=E(e,t),i="string"==typeof e.worker?e.worker:null,n=r||i||S(e,!0);return(0,a.v)(n),n}function S(e,t=!1){let r=i.Bd?e.workerFile||`${e.id}-worker.js`:e.workerNode||`${e.id}-worker-node.js`,n=e.version;"latest"===n&&(n="latest");let s=n?`@${n}`:"",a=`https://unpkg.com/@loaders.gl/${e.module}${s}/dist/${r}`;return t&&function(e,t){if("latest"!==e.version)return;let r=`${e.module}:${e.id}`;v.has(r)||(v.add(r),console.warn(`loaders.gl: ${e.name} loader worker version is "latest" because __VERSION__ was not injected. Fetching ${t} from CDN.`))}(e,a),a}async function A(e,t,r={},i={},n={}){P(r.signal);let s=w(e),a=b.getWorkerFarm(r).getWorkerPool(M(e,r,s)),o=r.jobName||e.name,u=await a.startJob(o,$.bind(null,i)),l=()=>u.abort(B(r.signal));r.signal?.addEventListener("abort",l,{once:!0}),r.signal?.aborted&&l();try{let{signal:e,...i}=r,s=f(i),a=f(n);return u.isRunning&&u.postMessage("process",{input:t,options:s,context:a}),(await u.result).result}finally{r.signal?.removeEventListener("abort",l)}}async function*L(e,t,r,i,s){var a;P(r.signal);let o=w(e),u=b.getWorkerFarm(r).getWorkerPool(M(e,r,o)),l=new n,c=Symbol.asyncIterator in(a=t)?a[Symbol.asyncIterator]():async function*(){yield*a}(),h=!1,d=!1,p=Promise.resolve(),m=Error("Worker batch job failed"),g=e=>{h||(h=!0,l.enqueue(m),l.close())},_=await u.startJob(r.jobName||e.name,(e,t,r)=>{switch(t){case"input-request":p=p.then(async()=>{let t=await c.next();e.isRunning&&(t.done?(d=!0,e.postMessage("input-done",{})):e.postMessage("input-batch",{input:t.value}))}).catch(t=>e.abort(t));break;case"output-batch":l.push(r.result);break;case"done":e.done(r),h||(h=!0,l.close());break;case"error":{let t=Error(r.error||"Worker batch processing failed");e.error(t),g(t);break}case"process":$(i,e,t,r);break;default:{let r=Error(`Unexpected worker batch message: ${t}`);e.error(r),g(r)}}}),y=()=>_.abort(B(r.signal));r.signal?.addEventListener("abort",y,{once:!0}),r.signal?.aborted&&y(),_.result.catch(g);try{let{signal:e,...t}=r;_.isRunning&&_.postMessage("process-in-batches",{options:f(t),context:f(s)});try{for await(let e of l)yield e,_.isRunning&&_.postMessage("output-ack",{})}catch(e){throw e===m&&await _.result,e}await _.result}finally{r.signal?.removeEventListener("abort",y),_.isRunning&&_.abort(T("Worker batch iterator was closed")),d||function(e){try{Promise.resolve(e.return?.()).catch(()=>void 0)}catch{}}(c)}}function P(e){if(e?.aborted)throw B(e)}function B(e){return e?.reason??T("Worker job was aborted")}function T(e){let t=Error(e);return t.name="AbortError",t}function M(e,t,r){if(t.source)return{name:r,source:t.source};let n=E(e,t);return n?{name:r,url:n}:i.Bd&&e.loadWorker?{name:r,loadWorker:e.loadWorker,getUrl:()=>x(e,t),urlKey:S(e)}:{name:r,url:x(e,t)}}async function $(e,t,r,i){switch(r){case"done":t.done(i);break;case"error":t.error(Error(i.error));break;case"process":let{id:n,input:s,options:a}=i;try{if(!e.process)return void t.postMessage("error",{id:n,error:"Worker not set up to process on main thread"});let r=await e.process(s,a,void 0,i.context||{});t.postMessage("done",{id:n,result:r})}catch(r){let e=r instanceof Error?r.message:"unknown error";t.postMessage("error",{id:n,error:e})}break;default:console.warn(`process-on-worker: unknown message ${r}`)}}function O(e,t){var r;if(t?.core?.credentials?.some(e=>"request"===e.type||"token"in e&&"function"==typeof e.token))return!1;let n=U(t),s=n._nodeWorkers;return(!!i.Bd||!!s)&&("las"!==e.id||(t?.las?.shape??"arrow-table")!=="arrow-table")&&("csv"!==e.id||(r=t,(r?.csv?.shape??r?.core?.shape)==="arrow-table"))&&!!function(e,t){if(!b.isSupported())return!1;let r=t?.[e.id];return!!((e.worker||e.loadWorker||r?.workerUrl)&&t?.worker)}(e,n)}function C(e,t,r,i,n=e){if(!O(e,r))return!1;if(r?.core?.worker!=="auto"||!n.getWorkerEstimate)return!0;try{let e=n.getWorkerEstimate(t,r,i);if(void 0===e||!Number.isFinite(e)||e<0||e>1)return!0;return e>=(r.core?.workerThreshold??.1)}catch{return!0}}async function I(e,t,r,i,n,s){let a=s||R(r),o=await A(e,t,{...U(r,e),signal:a},{process:async(t,s,a,o)=>{if(!n)throw Error("Worker not set up to parse on main thread");let{_loaderIds:u,_loaderIsArray:l,...f}=o||{},c=i||o?{...i,...f}:void 0;return await N(n,t,s,c,F(e,u,l,i,r))}},z(i));return"function"==typeof e.deserializeWorkerResult?e.deserializeWorkerResult(o,r,i):o}async function*k(e,t,r,i,n,s){let a=s||R(r);for await(let s of function(e,t,r={},i={},n={}){return L(e,t,r,i,n)}(e,t,{...U(r),signal:a},{process:async(t,s,a,o)=>{if(!n)throw Error("Worker not set up to parse on main thread");let{_loaderIds:u,_loaderIsArray:l,...f}=o||{},c=i||o?{...i,...f}:void 0;return await N(n,t,s,c,F(e,u,l,i,r))}},z(i)))yield e.deserializeWorkerBatch?e.deserializeWorkerBatch(s,r,i):s}function R(e){let t=e?.parquet?.signal;if("u">typeof AbortSignal&&t instanceof AbortSignal)return t}function N(e,t,r,i,n){return!n&&e.length<=2?e(t,r):e(t,n,r,i)}function F(e,t,r,i,n){if(!t)return;let s=new Map,a=new Set;for(let t of[e,...i?.loaders||[]])!function e(t){if(!a.has(t))for(let[r,i]of(a.add(t),s.set(t.id,t),Object.entries(t.subloaders||{}))){let t=n?.core?.subloaders?.[r]||i;e(t),s.set(i.id,t)}}(t);let o=t.map(e=>{let t=s.get(e);if(!t)throw Error(`Worker requested unknown loader "${e}". Declare it in loader.subloaders or pass it in context.loaders.`);return t});return r?o:o[0]}function U(e={},t){let r=JSON.parse(JSON.stringify({...e,...e.core?{core:{...e.core,authentications:void 0}}:{}})),i={...r.core,...r};return"auto"===i.worker&&(i.worker=!0),t&&(i._workerLoaderId=t.id),i}function z(e){if(!e)return{};let{fetch:t,loaders:r,coreApi:i,_parse:n,_parseSync:s,_parseInBatches:a,...o}=e;return JSON.parse(JSON.stringify(o))}},36217(e,t,r){r.d(t,{p:()=>i});function i(e){return!!(e&&"object"==typeof e&&"createDataSource"in e)}},76683(e,t,r){r.d(t,{v:()=>i});function i(e,t){if(!e)throw Error(t||"loaders.gl assertion failed.")}},98401(e,t,r){r.d(t,{Bd:()=>n,Fr:()=>a,xD:()=>s});let i={self:"u">typeof self&&self,window:"u">typeof window&&window,global:"u">typeof global&&global,document:"u">typeof document&&document};i.self||i.window||i.global,i.window||i.self||i.global,i.global||i.self||i.window,i.document;let n="object"!=typeof process||"[object process]"!==String(process)||process.browser,s="function"==typeof importScripts,a="u">typeof window&&void 0!==window.orientation,o="u">typeof process&&process.version&&/v([0-9]*)/.exec(process.version);o&&parseFloat(o[1])},17965(e,t,r){r.d(t,{x:()=>i});let i=(globalThis._loadersgl_?.version||(globalThis._loadersgl_=globalThis._loadersgl_||{},globalThis._loadersgl_.version="5.0.0-alpha.11"),globalThis._loadersgl_.version)},8591(e,t,r){r.d(t,{z:()=>s});var i=r(76683),n=r(17965);function s(e,t=n.x){(0,i.v)(e,"no worker provided");let r=e.version;return!!t&&!!r}},92919(e,t,r){r.d(t,{a:()=>n});var i=r(70319);class n extends Array{clone(){return new this.constructor().copy(this)}fromArray(e,t=0){for(let r=0;r<this.ELEMENTS;++r)this[r]=e[r+t];return this.check()}toArray(e=[],t=0){for(let r=0;r<this.ELEMENTS;++r)e[t+r]=this[r];return e}toObject(e){return e}from(e){return Array.isArray(e)?this.copy(e):this.fromObject(e)}to(e){return e===this?this:(0,i.cy)(e)?this.toArray(e):this.toObject(e)}toTarget(e){return e?this.to(e):this}toString(){return this.formatString(i.$W)}formatString(e){let t="";for(let r=0;r<this.ELEMENTS;++r)t+=(r>0?", ":"")+(0,i.Fl)(this[r],e);return`${e.printTypes?this.constructor.name:""}[${t}]`}equals(e){if(!e||this.length!==e.length)return!1;for(let t=0;t<this.ELEMENTS;++t)if(!(0,i.aI)(this[t],e[t]))return!1;return!0}exactEquals(e){if(!e||this.length!==e.length)return!1;for(let t=0;t<this.ELEMENTS;++t)if(this[t]!==e[t])return!1;return!0}negate(){for(let e=0;e<this.ELEMENTS;++e)this[e]=-this[e];return this.check()}lerp(e,t,r){if(void 0===r)return this.lerp(this,e,t);for(let i=0;i<this.ELEMENTS;++i){let n=e[i],s="number"==typeof t?t:t[i];this[i]=n+r*(s-n)}return this.check()}min(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=Math.min(e[t],this[t]);return this.check()}max(e){for(let t=0;t<this.ELEMENTS;++t)this[t]=Math.max(e[t],this[t]);return this.check()}clamp(e,t){for(let r=0;r<this.ELEMENTS;++r)this[r]=Math.min(Math.max(this[r],e[r]),t[r]);return this.check()}add(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]+=t[e];return this.check()}subtract(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]-=t[e];return this.check()}scale(e){if("number"==typeof e)for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;else for(let t=0;t<this.ELEMENTS&&t<e.length;++t)this[t]*=e[t];return this.check()}multiplyByScalar(e){for(let t=0;t<this.ELEMENTS;++t)this[t]*=e;return this.check()}check(){if(i.$W.debug&&!this.validate())throw Error(`math.gl: ${this.constructor.name} some fields set to invalid numbers'`);return this}validate(){let e=this.length===this.ELEMENTS;for(let t=0;t<this.ELEMENTS;++t)e=e&&Number.isFinite(this[t]);return e}}},84352(e,t,r){r.d(t,{u:()=>a});var i=r(92919),n=r(63045),s=r(70319);class a extends i.a{toString(){let e="[";if(s.$W.printRowMajor){e+="row-major:";for(let t=0;t<this.RANK;++t)for(let r=0;r<this.RANK;++r)e+=` ${this[r*this.RANK+t]}`}else{e+="column-major:";for(let t=0;t<this.ELEMENTS;++t)e+=` ${this[t]}`}return e+"]"}getElementIndex(e,t){return t*this.RANK+e}getElement(e,t){return this[t*this.RANK+e]}setElement(e,t,r){return this[t*this.RANK+e]=(0,n.ws)(r),this}getColumn(e,t=Array(this.RANK).fill(-0)){let r=e*this.RANK;for(let e=0;e<this.RANK;++e)t[e]=this[r+e];return t}setColumn(e,t){let r=e*this.RANK;for(let e=0;e<this.RANK;++e)this[r+e]=t[e];return this}}},54806(e,t,r){r.d(t,{M:()=>a});var i=r(92919),n=r(63045),s=r(16916);class a extends i.a{get x(){return this[0]}set x(e){this[0]=(0,n.ws)(e)}get y(){return this[1]}set y(e){this[1]=(0,n.ws)(e)}len(){return Math.sqrt(this.lengthSquared())}magnitude(){return this.len()}lengthSquared(){let e=0;for(let t=0;t<this.ELEMENTS;++t)e+=this[t]*this[t];return e}magnitudeSquared(){return this.lengthSquared()}distance(e){return Math.sqrt(this.distanceSquared(e))}distanceSquared(e){let t=0;for(let r=0;r<this.ELEMENTS;++r){let i=this[r]-e[r];t+=i*i}return(0,n.ws)(t)}dot(e){let t=0;for(let r=0;r<this.ELEMENTS;++r)t+=this[r]*e[r];return(0,n.ws)(t)}normalize(){let e=this.magnitude();if(0!==e)for(let t=0;t<this.ELEMENTS;++t)this[t]/=e;return this.check()}multiply(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]*=t[e];return this.check()}divide(...e){for(let t of e)for(let e=0;e<this.ELEMENTS;++e)this[e]/=t[e];return this.check()}lengthSq(){return this.lengthSquared()}distanceTo(e){return this.distance(e)}distanceToSquared(e){return this.distanceSquared(e)}getComponent(e){return(0,s.v)(e>=0&&e<this.ELEMENTS,"index is out of range"),(0,n.ws)(this[e])}setComponent(e,t){return(0,s.v)(e>=0&&e<this.ELEMENTS,"index is out of range"),this[e]=t,this.check()}addVectors(e,t){return this.copy(e).add(t)}subVectors(e,t){return this.copy(e).subtract(t)}multiplyVectors(e,t){return this.copy(e).multiply(t)}addScaledVector(e,t){for(let r=0;r<this.ELEMENTS;++r)this[r]+=e[r]*t;return this.check()}}},56204(e,t,r){let i,n;r.d(t,{k:()=>g});var s,a,o=r(84352),u=r(63045),l=r(80715),f=r(46840),c=r(58486),h=r(50549),d=r(10400);(s=a||(a={}))[s.COL0ROW0=0]="COL0ROW0",s[s.COL0ROW1=1]="COL0ROW1",s[s.COL0ROW2=2]="COL0ROW2",s[s.COL0ROW3=3]="COL0ROW3",s[s.COL1ROW0=4]="COL1ROW0",s[s.COL1ROW1=5]="COL1ROW1",s[s.COL1ROW2=6]="COL1ROW2",s[s.COL1ROW3=7]="COL1ROW3",s[s.COL2ROW0=8]="COL2ROW0",s[s.COL2ROW1=9]="COL2ROW1",s[s.COL2ROW2=10]="COL2ROW2",s[s.COL2ROW3=11]="COL2ROW3",s[s.COL3ROW0=12]="COL3ROW0",s[s.COL3ROW1=13]="COL3ROW1",s[s.COL3ROW2=14]="COL3ROW2",s[s.COL3ROW3=15]="COL3ROW3";let p=45*Math.PI/180,m=Object.freeze([1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1]);class g extends o.u{static get IDENTITY(){return n||Object.freeze(n=new g),n}static get ZERO(){return i||Object.freeze(i=new g([0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0])),i}get ELEMENTS(){return 16}get RANK(){return 4}get INDICES(){return a}constructor(e){super(-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0),1==arguments.length&&Array.isArray(e)?this.copy(e):this.identity()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this[3]=e[3],this[4]=e[4],this[5]=e[5],this[6]=e[6],this[7]=e[7],this[8]=e[8],this[9]=e[9],this[10]=e[10],this[11]=e[11],this[12]=e[12],this[13]=e[13],this[14]=e[14],this[15]=e[15],this.check()}set(e,t,r,i,n,s,a,o,u,l,f,c,h,d,p,m){return this[0]=e,this[1]=t,this[2]=r,this[3]=i,this[4]=n,this[5]=s,this[6]=a,this[7]=o,this[8]=u,this[9]=l,this[10]=f,this[11]=c,this[12]=h,this[13]=d,this[14]=p,this[15]=m,this.check()}setRowMajor(e,t,r,i,n,s,a,o,u,l,f,c,h,d,p,m){return this[0]=e,this[1]=n,this[2]=u,this[3]=h,this[4]=t,this[5]=s,this[6]=l,this[7]=d,this[8]=r,this[9]=a,this[10]=f,this[11]=p,this[12]=i,this[13]=o,this[14]=c,this[15]=m,this.check()}toRowMajor(e){return e[0]=this[0],e[1]=this[4],e[2]=this[8],e[3]=this[12],e[4]=this[1],e[5]=this[5],e[6]=this[9],e[7]=this[13],e[8]=this[2],e[9]=this[6],e[10]=this[10],e[11]=this[14],e[12]=this[3],e[13]=this[7],e[14]=this[11],e[15]=this[15],e}identity(){return this.copy(m)}fromObject(e){return this.check()}fromQuaternion(e){return(0,f.I0)(this,e),this.check()}fromMatrix3(e){return this.set(e[0],e[1],e[2],0,e[3],e[4],e[5],0,e[6],e[7],e[8],0,0,0,0,1)}frustum(e){var t,r,i,n,s,a;let{left:o,right:u,bottom:l,top:c,near:h=.1,far:d=500}=e;return d===1/0?(t=this,r=o,i=u,n=l,s=c,a=h,t[0]=2*a/(i-r),t[1]=0,t[2]=0,t[3]=0,t[4]=0,t[5]=2*a/(s-n),t[6]=0,t[7]=0,t[8]=(i+r)/(i-r),t[9]=(s+n)/(s-n),t[10]=-1,t[11]=-1,t[12]=0,t[13]=0,t[14]=-2*a,t[15]=0):(0,f.$h)(this,o,u,l,c,h,d),this.check()}lookAt(e){let{eye:t,center:r=[0,0,0],up:i=[0,1,0]}=e;return(0,f.t5)(this,t,r,i),this.check()}ortho(e){let{left:t,right:r,bottom:i,top:n,near:s=.1,far:a=500}=e;return(0,f.v3)(this,t,r,i,n,s,a),this.check()}orthographic(e){let{fovy:t=p,aspect:r=1,focalDistance:i=1,near:n=.1,far:s=500}=e;_(t);let a=i*Math.tan(t/2),o=a*r;return this.ortho({left:-o,right:o,bottom:-a,top:a,near:n,far:s})}perspective(e){let{fovy:t=45*Math.PI/180,aspect:r=1,near:i=.1,far:n=500}=e;return _(t),(0,f.fN)(this,t,r,i,n),this.check()}determinant(){return(0,f.a4)(this)}getScale(e=[-0,-0,-0]){return e[0]=Math.sqrt(this[0]*this[0]+this[1]*this[1]+this[2]*this[2]),e[1]=Math.sqrt(this[4]*this[4]+this[5]*this[5]+this[6]*this[6]),e[2]=Math.sqrt(this[8]*this[8]+this[9]*this[9]+this[10]*this[10]),e}getTranslation(e=[-0,-0,-0]){return e[0]=this[12],e[1]=this[13],e[2]=this[14],e}getRotation(e,t){e=e||[-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0,-0],t=t||[-0,-0,-0];let r=this.getScale(t),i=1/r[0],n=1/r[1],s=1/r[2];return e[0]=this[0]*i,e[1]=this[1]*n,e[2]=this[2]*s,e[3]=0,e[4]=this[4]*i,e[5]=this[5]*n,e[6]=this[6]*s,e[7]=0,e[8]=this[8]*i,e[9]=this[9]*n,e[10]=this[10]*s,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}getRotationMatrix3(e,t){e=e||[-0,-0,-0,-0,-0,-0,-0,-0,-0],t=t||[-0,-0,-0];let r=this.getScale(t),i=1/r[0],n=1/r[1],s=1/r[2];return e[0]=this[0]*i,e[1]=this[1]*n,e[2]=this[2]*s,e[3]=this[4]*i,e[4]=this[5]*n,e[5]=this[6]*s,e[6]=this[8]*i,e[7]=this[9]*n,e[8]=this[10]*s,e}transpose(){return(0,f.mg)(this,this),this.check()}invert(){return(0,f.B8)(this,this),this.check()}multiplyLeft(e){return(0,f.lw)(this,e,this),this.check()}multiplyRight(e){return(0,f.lw)(this,this,e),this.check()}rotateX(e){return(0,f.eL)(this,this,e),this.check()}rotateY(e){return(0,f.Z8)(this,this,e),this.check()}rotateZ(e){return(0,f.Qr)(this,this,e),this.check()}rotateXYZ(e){return this.rotateX(e[0]).rotateY(e[1]).rotateZ(e[2])}rotateAxis(e,t){return(0,f.e$)(this,this,e,t),this.check()}scale(e){return(0,f.hs)(this,this,Array.isArray(e)?e:[e,e,e]),this.check()}translate(e){return(0,f.Tl)(this,this,e),this.check()}transform(e,t){return 4===e.length?(t=(0,d.Z0)(t||[-0,-0,-0,-0],e,this),(0,u.qk)(t,4),t):this.transformAsPoint(e,t)}transformAsPoint(e,t){let r,{length:i}=e;switch(i){case 2:r=(0,c.Z0)(t||[-0,-0],e,this);break;case 3:r=(0,h.Z0)(t||[-0,-0,-0],e,this);break;default:throw Error("Illegal vector")}return(0,u.qk)(r,e.length),r}transformAsVector(e,t){let r;switch(e.length){case 2:r=(0,l.B$)(t||[-0,-0],e,this);break;case 3:r=(0,l.cL)(t||[-0,-0,-0],e,this);break;default:throw Error("Illegal vector")}return(0,u.qk)(r,e.length),r}makeRotationX(e){return this.identity().rotateX(e)}makeTranslation(e,t,r){return this.identity().translate([e,t,r])}}function _(e){if(e>2*Math.PI)throw Error("expected radians")}},23179(e,t,r){let i;r.d(t,{P:()=>f});var n=r(54806),s=r(70319),a=r(63045),o=r(50549),u=r(80715);let l=[0,0,0];class f extends n.M{static get ZERO(){return i||Object.freeze(i=new f(0,0,0)),i}constructor(e=0,t=0,r=0){super(-0,-0,-0),1==arguments.length&&(0,s.cy)(e)?this.copy(e):(s.$W.debug&&((0,a.ws)(e),(0,a.ws)(t),(0,a.ws)(r)),this[0]=e,this[1]=t,this[2]=r)}set(e,t,r){return this[0]=e,this[1]=t,this[2]=r,this.check()}copy(e){return this[0]=e[0],this[1]=e[1],this[2]=e[2],this.check()}fromObject(e){return s.$W.debug&&((0,a.ws)(e.x),(0,a.ws)(e.y),(0,a.ws)(e.z)),this[0]=e.x,this[1]=e.y,this[2]=e.z,this.check()}toObject(e){return e.x=this[0],e.y=this[1],e.z=this[2],e}get ELEMENTS(){return 3}get z(){return this[2]}set z(e){this[2]=(0,a.ws)(e)}angle(e){return(0,o.g7)(this,e)}cross(e){return(0,o.$A)(this,this,e),this.check()}rotateX({radians:e,origin:t=l}){return(0,o.eL)(this,this,t,e),this.check()}rotateY({radians:e,origin:t=l}){return(0,o.Z8)(this,this,t,e),this.check()}rotateZ({radians:e,origin:t=l}){return(0,o.x6)(this,this,t,e),this.check()}transform(e){return this.transformAsPoint(e)}transformAsPoint(e){return(0,o.Z0)(this,this,e),this.check()}transformAsVector(e){return(0,u.cL)(this,this,e),this.check()}transformByMatrix3(e){return(0,o.ei)(this,this,e),this.check()}transformByMatrix2(e){return(0,u.J4)(this,this,e),this.check()}transformByQuaternion(e){return(0,o.gL)(this,this,e),this.check()}}},37411(e,t,r){r.d(t,{p8:()=>i,tb:()=>n});let i=1e-6,n="u">typeof Float32Array?Float32Array:Array},46840(e,t,r){r.d(t,{$h:()=>g,B8:()=>s,I0:()=>m,IL:()=>p,Qr:()=>d,Tl:()=>u,Z8:()=>h,a4:()=>a,e$:()=>f,eL:()=>c,fN:()=>_,hs:()=>l,lw:()=>o,mg:()=>n,t5:()=>y,v3:()=>b});var i=r(37411);function n(e,t){if(e===t){let r=t[1],i=t[2],n=t[3],s=t[6],a=t[7],o=t[11];e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=r,e[6]=t[9],e[7]=t[13],e[8]=i,e[9]=s,e[11]=t[14],e[12]=n,e[13]=a,e[14]=o}else e[0]=t[0],e[1]=t[4],e[2]=t[8],e[3]=t[12],e[4]=t[1],e[5]=t[5],e[6]=t[9],e[7]=t[13],e[8]=t[2],e[9]=t[6],e[10]=t[10],e[11]=t[14],e[12]=t[3],e[13]=t[7],e[14]=t[11],e[15]=t[15];return e}function s(e,t){let r=t[0],i=t[1],n=t[2],s=t[3],a=t[4],o=t[5],u=t[6],l=t[7],f=t[8],c=t[9],h=t[10],d=t[11],p=t[12],m=t[13],g=t[14],_=t[15],b=r*o-i*a,y=r*u-n*a,v=r*l-s*a,w=i*u-n*o,E=i*l-s*o,x=n*l-s*u,S=f*m-c*p,A=f*g-h*p,L=f*_-d*p,P=c*g-h*m,B=c*_-d*m,T=h*_-d*g,M=b*T-y*B+v*P+w*L-E*A+x*S;return M?(M=1/M,e[0]=(o*T-u*B+l*P)*M,e[1]=(n*B-i*T-s*P)*M,e[2]=(m*x-g*E+_*w)*M,e[3]=(h*E-c*x-d*w)*M,e[4]=(u*L-a*T-l*A)*M,e[5]=(r*T-n*L+s*A)*M,e[6]=(g*v-p*x-_*y)*M,e[7]=(f*x-h*v+d*y)*M,e[8]=(a*B-o*L+l*S)*M,e[9]=(i*L-r*B-s*S)*M,e[10]=(p*E-m*v+_*b)*M,e[11]=(c*v-f*E-d*b)*M,e[12]=(o*A-a*P-u*S)*M,e[13]=(r*P-i*A+n*S)*M,e[14]=(m*y-p*w-g*b)*M,e[15]=(f*w-c*y+h*b)*M,e):null}function a(e){let t=e[0],r=e[1],i=e[2],n=e[3],s=e[4],a=e[5],o=e[6],u=e[7],l=e[8],f=e[9],c=e[10],h=e[11],d=e[12],p=e[13],m=e[14],g=e[15],_=t*a-r*s,b=t*o-i*s,y=r*o-i*a,v=l*p-f*d,w=l*m-c*d,E=f*m-c*p;return u*(t*E-r*w+i*v)-n*(s*E-a*w+o*v)+g*(l*y-f*b+c*_)-h*(d*y-p*b+m*_)}function o(e,t,r){let i=t[0],n=t[1],s=t[2],a=t[3],o=t[4],u=t[5],l=t[6],f=t[7],c=t[8],h=t[9],d=t[10],p=t[11],m=t[12],g=t[13],_=t[14],b=t[15],y=r[0],v=r[1],w=r[2],E=r[3];return e[0]=y*i+v*o+w*c+E*m,e[1]=y*n+v*u+w*h+E*g,e[2]=y*s+v*l+w*d+E*_,e[3]=y*a+v*f+w*p+E*b,y=r[4],v=r[5],w=r[6],E=r[7],e[4]=y*i+v*o+w*c+E*m,e[5]=y*n+v*u+w*h+E*g,e[6]=y*s+v*l+w*d+E*_,e[7]=y*a+v*f+w*p+E*b,y=r[8],v=r[9],w=r[10],E=r[11],e[8]=y*i+v*o+w*c+E*m,e[9]=y*n+v*u+w*h+E*g,e[10]=y*s+v*l+w*d+E*_,e[11]=y*a+v*f+w*p+E*b,y=r[12],v=r[13],w=r[14],E=r[15],e[12]=y*i+v*o+w*c+E*m,e[13]=y*n+v*u+w*h+E*g,e[14]=y*s+v*l+w*d+E*_,e[15]=y*a+v*f+w*p+E*b,e}function u(e,t,r){let i,n,s,a,o,u,l,f,c,h,d,p,m=r[0],g=r[1],_=r[2];return t===e?(e[12]=t[0]*m+t[4]*g+t[8]*_+t[12],e[13]=t[1]*m+t[5]*g+t[9]*_+t[13],e[14]=t[2]*m+t[6]*g+t[10]*_+t[14],e[15]=t[3]*m+t[7]*g+t[11]*_+t[15]):(i=t[0],n=t[1],s=t[2],a=t[3],o=t[4],u=t[5],l=t[6],f=t[7],c=t[8],h=t[9],d=t[10],p=t[11],e[0]=i,e[1]=n,e[2]=s,e[3]=a,e[4]=o,e[5]=u,e[6]=l,e[7]=f,e[8]=c,e[9]=h,e[10]=d,e[11]=p,e[12]=i*m+o*g+c*_+t[12],e[13]=n*m+u*g+h*_+t[13],e[14]=s*m+l*g+d*_+t[14],e[15]=a*m+f*g+p*_+t[15]),e}function l(e,t,r){let i=r[0],n=r[1],s=r[2];return e[0]=t[0]*i,e[1]=t[1]*i,e[2]=t[2]*i,e[3]=t[3]*i,e[4]=t[4]*n,e[5]=t[5]*n,e[6]=t[6]*n,e[7]=t[7]*n,e[8]=t[8]*s,e[9]=t[9]*s,e[10]=t[10]*s,e[11]=t[11]*s,e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15],e}function f(e,t,r,n){let s,a,o,u,l,f,c,h,d,p,m,g,_,b,y,v,w,E,x,S,A,L,P,B,T=n[0],M=n[1],$=n[2],O=Math.sqrt(T*T+M*M+$*$);return O<i.p8?null:(T*=O=1/O,M*=O,$*=O,a=Math.sin(r),o=1-(s=Math.cos(r)),u=t[0],l=t[1],f=t[2],c=t[3],h=t[4],d=t[5],p=t[6],m=t[7],g=t[8],_=t[9],b=t[10],y=t[11],v=T*T*o+s,w=M*T*o+$*a,E=$*T*o-M*a,x=T*M*o-$*a,S=M*M*o+s,A=$*M*o+T*a,L=T*$*o+M*a,P=M*$*o-T*a,B=$*$*o+s,e[0]=u*v+h*w+g*E,e[1]=l*v+d*w+_*E,e[2]=f*v+p*w+b*E,e[3]=c*v+m*w+y*E,e[4]=u*x+h*S+g*A,e[5]=l*x+d*S+_*A,e[6]=f*x+p*S+b*A,e[7]=c*x+m*S+y*A,e[8]=u*L+h*P+g*B,e[9]=l*L+d*P+_*B,e[10]=f*L+p*P+b*B,e[11]=c*L+m*P+y*B,t!==e&&(e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e)}function c(e,t,r){let i=Math.sin(r),n=Math.cos(r),s=t[4],a=t[5],o=t[6],u=t[7],l=t[8],f=t[9],c=t[10],h=t[11];return t!==e&&(e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[4]=s*n+l*i,e[5]=a*n+f*i,e[6]=o*n+c*i,e[7]=u*n+h*i,e[8]=l*n-s*i,e[9]=f*n-a*i,e[10]=c*n-o*i,e[11]=h*n-u*i,e}function h(e,t,r){let i=Math.sin(r),n=Math.cos(r),s=t[0],a=t[1],o=t[2],u=t[3],l=t[8],f=t[9],c=t[10],h=t[11];return t!==e&&(e[4]=t[4],e[5]=t[5],e[6]=t[6],e[7]=t[7],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*n-l*i,e[1]=a*n-f*i,e[2]=o*n-c*i,e[3]=u*n-h*i,e[8]=s*i+l*n,e[9]=a*i+f*n,e[10]=o*i+c*n,e[11]=u*i+h*n,e}function d(e,t,r){let i=Math.sin(r),n=Math.cos(r),s=t[0],a=t[1],o=t[2],u=t[3],l=t[4],f=t[5],c=t[6],h=t[7];return t!==e&&(e[8]=t[8],e[9]=t[9],e[10]=t[10],e[11]=t[11],e[12]=t[12],e[13]=t[13],e[14]=t[14],e[15]=t[15]),e[0]=s*n+l*i,e[1]=a*n+f*i,e[2]=o*n+c*i,e[3]=u*n+h*i,e[4]=l*n-s*i,e[5]=f*n-a*i,e[6]=c*n-o*i,e[7]=h*n-u*i,e}function p(e,t){let r=t[0],i=t[1],n=t[2],s=t[4],a=t[5],o=t[6],u=t[8],l=t[9],f=t[10];return e[0]=Math.sqrt(r*r+i*i+n*n),e[1]=Math.sqrt(s*s+a*a+o*o),e[2]=Math.sqrt(u*u+l*l+f*f),e}function m(e,t){let r=t[0],i=t[1],n=t[2],s=t[3],a=r+r,o=i+i,u=n+n,l=r*a,f=i*a,c=i*o,h=n*a,d=n*o,p=n*u,m=s*a,g=s*o,_=s*u;return e[0]=1-c-p,e[1]=f+_,e[2]=h-g,e[3]=0,e[4]=f-_,e[5]=1-l-p,e[6]=d+m,e[7]=0,e[8]=h+g,e[9]=d-m,e[10]=1-l-c,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e}function g(e,t,r,i,n,s,a){let o=1/(r-t),u=1/(n-i),l=1/(s-a);return e[0]=2*s*o,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=2*s*u,e[6]=0,e[7]=0,e[8]=(r+t)*o,e[9]=(n+i)*u,e[10]=(a+s)*l,e[11]=-1,e[12]=0,e[13]=0,e[14]=a*s*2*l,e[15]=0,e}let _=function(e,t,r,i,n){let s=1/Math.tan(t/2);if(e[0]=s/r,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=s,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[11]=-1,e[12]=0,e[13]=0,e[15]=0,null!=n&&n!==1/0){let t=1/(i-n);e[10]=(n+i)*t,e[14]=2*n*i*t}else e[10]=-1,e[14]=-2*i;return e},b=function(e,t,r,i,n,s,a){let o=1/(t-r),u=1/(i-n),l=1/(s-a);return e[0]=-2*o,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=-2*u,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=2*l,e[11]=0,e[12]=(t+r)*o,e[13]=(n+i)*u,e[14]=(a+s)*l,e[15]=1,e};function y(e,t,r,n){let s,a,o,u,l,f,c,h,d,p,m=t[0],g=t[1],_=t[2],b=n[0],y=n[1],v=n[2],w=r[0],E=r[1],x=r[2];if(Math.abs(m-w)<i.p8&&Math.abs(g-E)<i.p8&&Math.abs(_-x)<i.p8)return e[0]=1,e[1]=0,e[2]=0,e[3]=0,e[4]=0,e[5]=1,e[6]=0,e[7]=0,e[8]=0,e[9]=0,e[10]=1,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,e;return s=1/Math.sqrt((h=m-w)*h+(d=g-E)*d+(p=_-x)*p),h*=s,d*=s,p*=s,(s=Math.sqrt((a=y*p-v*d)*a+(o=v*h-b*p)*o+(u=b*d-y*h)*u))?(a*=s=1/s,o*=s,u*=s):(a=0,o=0,u=0),(s=Math.sqrt((l=d*u-p*o)*l+(f=p*a-h*u)*f+(c=h*o-d*a)*c))?(l*=s=1/s,f*=s,c*=s):(l=0,f=0,c=0),e[0]=a,e[1]=l,e[2]=h,e[3]=0,e[4]=o,e[5]=f,e[6]=d,e[7]=0,e[8]=u,e[9]=c,e[10]=p,e[11]=0,e[12]=-(a*m+o*g+u*_),e[13]=-(l*m+f*g+c*_),e[14]=-(h*m+d*g+p*_),e[15]=1,e}},58486(e,t,r){function i(e,t,r){return e[0]=t[0]+r[0],e[1]=t[1]+r[1],e}function n(e,t,r){return e[0]=t[0]*r,e[1]=t[1]*r,e}function s(e){let t=e[0],r=e[1];return Math.sqrt(t*t+r*r)}function a(e,t){return e[0]=-t[0],e[1]=-t[1],e}function o(e,t,r,i){let n=t[0],s=t[1];return e[0]=n+i*(r[0]-n),e[1]=s+i*(r[1]-s),e}function u(e,t,r){let i=t[0],n=t[1];return e[0]=r[0]*i+r[2]*n,e[1]=r[1]*i+r[3]*n,e}function l(e,t,r){let i=t[0],n=t[1];return e[0]=r[0]*i+r[2]*n+r[4],e[1]=r[1]*i+r[3]*n+r[5],e}function f(e,t,r){let i=t[0],n=t[1];return e[0]=r[0]*i+r[3]*n+r[6],e[1]=r[1]*i+r[4]*n+r[7],e}function c(e,t,r){let i=t[0],n=t[1];return e[0]=r[0]*i+r[4]*n+r[12],e[1]=r[1]*i+r[5]*n+r[13],e}r.d(t,{Bw:()=>s,Cc:()=>o,WQ:()=>i,Z0:()=>c,ZF:()=>u,ei:()=>f,hs:()=>n,jb:()=>h,l0:()=>l,ze:()=>a});let h=function(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e}},50549(e,t,r){r.d(t,{$A:()=>h,Bw:()=>s,Cc:()=>d,Il:()=>x,Ln:()=>u,Om:()=>c,S8:()=>f,Z0:()=>p,Z8:()=>b,eL:()=>_,ei:()=>m,fA:()=>a,g7:()=>v,gL:()=>g,jb:()=>w,lw:()=>o,uE:()=>S,vt:()=>n,x6:()=>y,xg:()=>E,ze:()=>l});var i=r(37411);function n(){let e=new i.tb(3);return i.tb!==Float32Array&&(e[0]=0,e[1]=0,e[2]=0),e}function s(e){let t=e[0],r=e[1],i=e[2];return Math.sqrt(t*t+r*r+i*i)}function a(e,t,r){let n=new i.tb(3);return n[0]=e,n[1]=t,n[2]=r,n}function o(e,t,r){return e[0]=t[0]*r[0],e[1]=t[1]*r[1],e[2]=t[2]*r[2],e}function u(e,t,r,i){return e[0]=t[0]+r[0]*i,e[1]=t[1]+r[1]*i,e[2]=t[2]+r[2]*i,e}function l(e,t){return e[0]=-t[0],e[1]=-t[1],e[2]=-t[2],e}function f(e,t){let r=t[0],i=t[1],n=t[2],s=r*r+i*i+n*n;return s>0&&(s=1/Math.sqrt(s)),e[0]=t[0]*s,e[1]=t[1]*s,e[2]=t[2]*s,e}function c(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function h(e,t,r){let i=t[0],n=t[1],s=t[2],a=r[0],o=r[1],u=r[2];return e[0]=n*u-s*o,e[1]=s*a-i*u,e[2]=i*o-n*a,e}function d(e,t,r,i){let n=t[0],s=t[1],a=t[2];return e[0]=n+i*(r[0]-n),e[1]=s+i*(r[1]-s),e[2]=a+i*(r[2]-a),e}function p(e,t,r){let i=t[0],n=t[1],s=t[2],a=r[3]*i+r[7]*n+r[11]*s+r[15];return a=a||1,e[0]=(r[0]*i+r[4]*n+r[8]*s+r[12])/a,e[1]=(r[1]*i+r[5]*n+r[9]*s+r[13])/a,e[2]=(r[2]*i+r[6]*n+r[10]*s+r[14])/a,e}function m(e,t,r){let i=t[0],n=t[1],s=t[2];return e[0]=i*r[0]+n*r[3]+s*r[6],e[1]=i*r[1]+n*r[4]+s*r[7],e[2]=i*r[2]+n*r[5]+s*r[8],e}function g(e,t,r){let i=r[0],n=r[1],s=r[2],a=r[3],o=t[0],u=t[1],l=t[2],f=n*l-s*u,c=s*o-i*l,h=i*u-n*o,d=n*h-s*c,p=s*f-i*h,m=i*c-n*f,g=2*a;return f*=g,c*=g,h*=g,d*=2,p*=2,m*=2,e[0]=o+f+d,e[1]=u+c+p,e[2]=l+h+m,e}function _(e,t,r,i){let n=[],s=[];return n[0]=t[0]-r[0],n[1]=t[1]-r[1],n[2]=t[2]-r[2],s[0]=n[0],s[1]=n[1]*Math.cos(i)-n[2]*Math.sin(i),s[2]=n[1]*Math.sin(i)+n[2]*Math.cos(i),e[0]=s[0]+r[0],e[1]=s[1]+r[1],e[2]=s[2]+r[2],e}function b(e,t,r,i){let n=[],s=[];return n[0]=t[0]-r[0],n[1]=t[1]-r[1],n[2]=t[2]-r[2],s[0]=n[2]*Math.sin(i)+n[0]*Math.cos(i),s[1]=n[1],s[2]=n[2]*Math.cos(i)-n[0]*Math.sin(i),e[0]=s[0]+r[0],e[1]=s[1]+r[1],e[2]=s[2]+r[2],e}function y(e,t,r,i){let n=[],s=[];return n[0]=t[0]-r[0],n[1]=t[1]-r[1],n[2]=t[2]-r[2],s[0]=n[0]*Math.cos(i)-n[1]*Math.sin(i),s[1]=n[0]*Math.sin(i)+n[1]*Math.cos(i),s[2]=n[2],e[0]=s[0]+r[0],e[1]=s[1]+r[1],e[2]=s[2]+r[2],e}function v(e,t){let r=e[0],i=e[1],n=e[2],s=t[0],a=t[1],o=t[2],u=Math.sqrt((r*r+i*i+n*n)*(s*s+a*a+o*o));return Math.acos(Math.min(Math.max(u&&c(e,t)/u,-1),1))}let w=function(e,t,r){return e[0]=t[0]-r[0],e[1]=t[1]-r[1],e[2]=t[2]-r[2],e},E=function(e,t){let r=t[0]-e[0],i=t[1]-e[1],n=t[2]-e[2];return Math.sqrt(r*r+i*i+n*n)},x=s,S=function(e){let t=e[0],r=e[1],i=e[2];return t*t+r*r+i*i}},10400(e,t,r){r.d(t,{Bw:()=>f,C:()=>a,Cc:()=>p,Om:()=>d,S8:()=>h,WQ:()=>u,Z0:()=>m,fA:()=>s,hZ:()=>o,hs:()=>l,m3:()=>c,o8:()=>n,t2:()=>g});var i=r(37411);function n(e){let t=new i.tb(4);return t[0]=e[0],t[1]=e[1],t[2]=e[2],t[3]=e[3],t}function s(e,t,r,n){let s=new i.tb(4);return s[0]=e,s[1]=t,s[2]=r,s[3]=n,s}function a(e,t){return e[0]=t[0],e[1]=t[1],e[2]=t[2],e[3]=t[3],e}function o(e,t,r,i,n){return e[0]=t,e[1]=r,e[2]=i,e[3]=n,e}function u(e,t,r){return e[0]=t[0]+r[0],e[1]=t[1]+r[1],e[2]=t[2]+r[2],e[3]=t[3]+r[3],e}function l(e,t,r){return e[0]=t[0]*r,e[1]=t[1]*r,e[2]=t[2]*r,e[3]=t[3]*r,e}function f(e){let t=e[0],r=e[1],i=e[2],n=e[3];return Math.sqrt(t*t+r*r+i*i+n*n)}function c(e){let t=e[0],r=e[1],i=e[2],n=e[3];return t*t+r*r+i*i+n*n}function h(e,t){let r=t[0],i=t[1],n=t[2],s=t[3],a=r*r+i*i+n*n+s*s;return a>0&&(a=1/Math.sqrt(a)),e[0]=r*a,e[1]=i*a,e[2]=n*a,e[3]=s*a,e}function d(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]+e[3]*t[3]}function p(e,t,r,i){let n=t[0],s=t[1],a=t[2],o=t[3];return e[0]=n+i*(r[0]-n),e[1]=s+i*(r[1]-s),e[2]=a+i*(r[2]-a),e[3]=o+i*(r[3]-o),e}function m(e,t,r){let i=t[0],n=t[1],s=t[2],a=t[3];return e[0]=r[0]*i+r[4]*n+r[8]*s+r[12]*a,e[1]=r[1]*i+r[5]*n+r[9]*s+r[13]*a,e[2]=r[2]*i+r[6]*n+r[10]*s+r[14]*a,e[3]=r[3]*i+r[7]*n+r[11]*s+r[15]*a,e}function g(e,t){return e[0]===t[0]&&e[1]===t[1]&&e[2]===t[2]&&e[3]===t[3]}},16916(e,t,r){r.d(t,{v:()=>i});function i(e,t){if(!e)throw Error(`math.gl assertion ${t}`)}},70319(e,t,r){r.d(t,{$W:()=>a,Cc:()=>function e(t,r,i){return u(t)?t.map((t,n)=>e(t,r[n],i)):i*r+(1-i)*t},F2:()=>c,Fl:()=>o,aI:()=>function e(t,r,i){let n=a.EPSILON;i&&(a.EPSILON=i);try{if(t===r)return!0;if(u(t)&&u(r)){if(t.length!==r.length)return!1;for(let i=0;i<t.length;++i)if(!e(t[i],r[i]))return!1;return!0}if(t&&t.equals)return t.equals(r);if(r&&r.equals)return r.equals(t);if("number"==typeof t&&"number"==typeof r)return Math.abs(t-r)<=a.EPSILON*Math.max(1,Math.abs(t),Math.abs(r));return!1}finally{a.EPSILON=n}},cy:()=>u,eh:()=>l,n0:()=>d,qE:()=>m,uj:()=>h,xW:()=>f});var i=r(43196);let n=1/Math.PI*180,s=1/180*Math.PI;globalThis.mathgl=globalThis.mathgl||{config:{EPSILON:1e-12,debug:!1,precision:4,printTypes:!1,printDegrees:!1,printRowMajor:!0,_cartographicRadians:!1}};let a=globalThis.mathgl.config;function o(e,{precision:t=a.precision}={}){return e=Math.round(e/a.EPSILON)*a.EPSILON,`${parseFloat(e.toPrecision(t))}`}function u(e){return Array.isArray(e)||ArrayBuffer.isView(e)&&!(e instanceof DataView)}function l(e){return c(e)}function f(e){return h(e)}function c(e,t){return g(e,e=>e*s,t)}function h(e,t){return g(e,e=>e*n,t)}function d(e,t){switch(t){case"negative-pi-to-pi":var r;return(r=e)>=-i.PI&&r<=i.PI?r:p(r+i.PI)-i.PI;case"zero-to-two-pi":return p(e);default:return e}}function p(e){var t;if(e>=0&&e<=i.JM)return e;let r=Math.sign(e)===Math.sign(t=i.JM)&&Math.abs(e)<Math.abs(t)?e:(e%t+t)%t;return 1e-14>Math.abs(r)&&Math.abs(e)>1e-14?i.JM:r}function m(e,t,r){return g(e,e=>Math.max(t,Math.min(r,e)))}function g(e,t,r){if(u(e)){r=r||(e.clone?e.clone():Array(e.length));for(let i=0;i<r.length&&i<e.length;++i){let n="number"==typeof e?e:e[i];r[i]=t(n,i,r)}return r}return t(e)}},80715(e,t,r){function i(e,t,r){let i=t[0],n=t[1],s=r[3]*i+r[7]*n||1;return e[0]=(r[0]*i+r[4]*n)/s,e[1]=(r[1]*i+r[5]*n)/s,e}function n(e,t,r){let i=t[0],n=t[1],s=t[2],a=r[3]*i+r[7]*n+r[11]*s||1;return e[0]=(r[0]*i+r[4]*n+r[8]*s)/a,e[1]=(r[1]*i+r[5]*n+r[9]*s)/a,e[2]=(r[2]*i+r[6]*n+r[10]*s)/a,e}function s(e,t,r){let i=t[0],n=t[1];return e[0]=r[0]*i+r[2]*n,e[1]=r[1]*i+r[3]*n,e[2]=t[2],e}function a(e,t,r){let i=t[0],n=t[1],s=t[2];return e[0]=r[0]*i+r[3]*n+r[6]*s,e[1]=r[1]*i+r[4]*n+r[7]*s,e[2]=r[2]*i+r[5]*n+r[8]*s,e[3]=t[3],e}r.d(t,{B$:()=>i,J4:()=>s,cL:()=>n,vE:()=>a})},43196(e,t,r){r.d(t,{JM:()=>s,PI:()=>n,Sy:()=>i});let i=Math.PI/2,n=Math.PI,s=2*Math.PI},63045(e,t,r){r.d(t,{qk:()=>s,ws:()=>n});var i=r(70319);function n(e){if(!Number.isFinite(e))throw Error(`Invalid number ${JSON.stringify(e)}`);return e}function s(e,t,r=""){if(i.$W.debug&&!function(e,t){if(e.length!==t)return!1;for(let t=0;t<e.length;++t)if(!Number.isFinite(e[t]))return!1;return!0}(e,t))throw Error(`math.gl: ${r} some fields set to invalid numbers'`);return e}},10612(e,t,r){function i(e){return ArrayBuffer.isView(e)&&!(e instanceof DataView)}function n(e){return i(e)||!!Array.isArray(e)&&(0===e.length||"number"==typeof e[0])}r.d(t,{H9:()=>n,iu:()=>i})}}]);
//# sourceMappingURL=8086.e0ccb981.js.map