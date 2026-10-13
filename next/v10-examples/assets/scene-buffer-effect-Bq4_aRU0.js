import{M as N,n as W,a2 as H,T as d,a3 as q,S as X,B as A,C as K,k as v,e as Q,a4 as J}from"./deck-example-device-TQPRJnZ6.js";import{D as F}from"./dynamic-texture-NQQfRyls.js";const Z=`struct VertexInputs {
  @location(0) clipSpacePositions: vec2<f32>,
  @location(1) texCoords: vec2<f32>,
  @location(2) coordinates: vec2<f32>
}

struct FragmentInputs {
  @builtin(position) Position : vec4<f32>,
  @location(0) position : vec2<f32>,
  @location(1) coordinate : vec2<f32>,
  @location(2) uv : vec2<f32>
};

@vertex
fn vertexMain(inputs: VertexInputs) -> FragmentInputs {
  var outputs: FragmentInputs;
  outputs.Position = vec4(inputs.clipSpacePositions, 0., 1.);
  outputs.position = inputs.clipSpacePositions;
  outputs.coordinate = inputs.coordinates;
  outputs.uv = inputs.texCoords;
  return outputs;
}
`,ee=`#version 300 es
in vec2 clipSpacePositions;
in vec2 texCoords;
in vec2 coordinates;

out vec2 position;
out vec2 coordinate;
out vec2 uv;

void main(void) {
  gl_Position = vec4(clipSpacePositions, 0., 1.);
  position = clipSpacePositions;
  coordinate = coordinates;
  uv = texCoords;
}
`,te=[-1,-1,1,-1,-1,1,1,1],re=[-1,-1,3,-1,-1,3];class Y extends N{constructor(e,t){const{geometryType:s="quad",...o}=t,n=s==="triangle"?re:te,i=n.map(a=>(a+1)/2),u=n.length/2;o.source&&(o.source=`${Z}
${o.source}`),super(e,{id:o.id||H("clip-space"),...o,vs:ee,vertexCount:u,geometry:new W({topology:s==="triangle"?"triangle-list":"triangle-strip",vertexCount:u,attributes:{clipSpacePositions:{size:2,value:new Float32Array(n)},texCoords:{size:2,value:new Float32Array(i)},coordinates:{size:2,value:new Float32Array(i)}}})})}}const se={name:"background",uniformTypes:{scale:"vec2<f32>",flipY:"i32"}},oe=`@group(0) @binding(auto) var backgroundTexture: texture_2d<f32>;
@group(0) @binding(auto) var backgroundTextureSampler: sampler;
struct backgroundUniforms {
  scale: vec2<f32>,
  flipY: i32,
};
@group(0) @binding(auto) var<uniform> background: backgroundUniforms;

fn billboardTexture_getTextureUV(uv: vec2<f32>) -> vec2<f32> {
  let scale: vec2<f32> = background.scale;
  var position: vec2<f32> = (uv - vec2<f32>(0.5, 0.5)) / scale + vec2<f32>(0.5, 0.5);
  if (background.flipY != 0) {
    position.y = 1.0 - position.y;
  }
  return position;
}

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4<f32> {
  let position: vec2<f32> = billboardTexture_getTextureUV(inputs.uv);
  return textureSample(backgroundTexture, backgroundTextureSampler, position);
}
`,ne=`#version 300 es
precision highp float;

uniform sampler2D backgroundTexture;

layout(std140) uniform backgroundUniforms {
  vec2 scale;
  int flipY;
} background;

in vec2 coordinate;
out vec4 fragColor;

vec2 billboardTexture_getTextureUV(vec2 coord) {
  vec2 position = (coord - 0.5) / background.scale + 0.5;
  if (background.flipY != 0) {
    position.y = 1.0 - position.y;
  }
  return position;
}

void main(void) {
  vec2 position = billboardTexture_getTextureUV(coordinate);
  fragColor = texture(backgroundTexture, position);
}
`;class ie extends Y{backgroundTexture=null;flipY=!1;constructor(e,t){if(super(e,{...t,id:t.id||"background-texture-model",source:oe,fs:ne,modules:[...t.modules||[],se],parameters:{depthWriteEnabled:!1,...t.parameters||{},...t.blend?{blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"one-minus-dst-alpha",blendColorDstFactor:"one",blendAlphaSrcFactor:"one-minus-dst-alpha",blendAlphaDstFactor:"one"}:{}}}),!t.backgroundTexture)throw new Error("BackgroundTextureModel requires a backgroundTexture prop");this.setProps(t)}setProps(e){const{backgroundTexture:t}=e;if(e.flipY!==void 0&&(this.flipY=e.flipY,this.backgroundTexture&&this.updateScale(this.backgroundTexture)),t)if(this.setBindings({backgroundTexture:t}),t.isReady){const s=t instanceof F?t.texture:t;this.backgroundTexture=s,this.updateScale(s)}else t.ready.then(s=>{this.backgroundTexture=s,this.updateScale(s)})}predraw(e){super.predraw(e)}updateScale(e){if(!e){this.shaderInputs.setProps({background:{scale:[1,1],flipY:0}});return}const[t,s]=this.device.getCanvasContext().getDrawingBufferSize(),o=e.width,n=e.height,i=t/s,u=o/n;let a=1,c=1;i>u?c=i/u:a=u/i,this.shaderInputs.setProps({background:{scale:[a,c],flipY:this.flipY?1:0}})}}class ae{id;current;next;constructor(e){this.id=e.id||"swap",this.current=e.current,this.next=e.next}destroy(){this.current?.destroy(),this.next?.destroy()}swap(){const e=this.current;this.current=this.next,this.next=e}}class ue extends ae{constructor(e,t){t={...t};const{width:s=1,height:o=1}=t;let n=t.colorAttachments?.map(a=>typeof a!="string"?a:e.createTexture({id:`${t.id}-texture-0`,format:a,usage:d.SAMPLE|d.RENDER|d.COPY_SRC|d.COPY_DST,width:s,height:o}));const i=e.createFramebuffer({...t,colorAttachments:n});n=t.colorAttachments?.map(a=>typeof a!="string"?a:e.createTexture({id:`${t.id}-texture-1`,format:a,usage:d.SAMPLE|d.RENDER|d.COPY_SRC|d.COPY_DST,width:s,height:o}));const u=e.createFramebuffer({...t,colorAttachments:n});super({current:i,next:u});for(const[a,c]of(t.colorAttachments||[]).entries())typeof c=="string"&&(i.attachResource(i.colorAttachments[a].texture),u.attachResource(u.colorAttachments[a].texture))}resize(e){if(e.width===this.current.width&&e.height===this.current.height)return!1;const{current:t,next:s}=this;return this.current=t.clone(e),O(this.current),t.destroy(),this.next=s.clone(e),O(this.next),s.destroy(),!0}}function O(r){for(const e of r.colorAttachments)r.attachResource(e.texture);r.depthStencilAttachment&&r.attachResource(r.depthStencilAttachment.texture)}function ce(r){const{shaderPass:e,action:t,shadingLanguage:s}=r;switch(t){case"filter":const o=`${e.name}_filterColor_ext`;return s==="wgsl"?fe(o):de(o);case"sample":const n=`${e.name}_sampleColor`;return s==="wgsl"?le(n):he(n);default:throw new Error(`${e.name} no fragment shader generated for shader pass`)}}function fe(r){return`@group(0) @binding(auto) var sourceTexture: texture_2d<f32>;
@group(0) @binding(auto) var sourceTextureSampler: sampler;

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4f {
  let texCoord = shaderPassRenderer_getTextureUV(inputs.coordinate);
  let texSize = vec2f(textureDimensions(sourceTexture));

  var fragColor = textureSample(sourceTexture, sourceTextureSampler, texCoord);
  fragColor = ${r}(fragColor, texSize, texCoord);
  return fragColor;
}
`}function le(r){return`@group(0) @binding(auto) var sourceTexture: texture_2d<f32>;
@group(0) @binding(auto) var sourceTextureSampler: sampler;

@fragment
fn fragmentMain(inputs: FragmentInputs) -> @location(0) vec4f {
  let texCoord = shaderPassRenderer_getTextureUV(inputs.coordinate);
  let texSize = vec2f(textureDimensions(sourceTexture));
  return ${r}(sourceTexture, sourceTextureSampler, texSize, texCoord);
}
`}function de(r){return`#version 300 es

uniform sampler2D sourceTexture;

in vec2 position;
in vec2 coordinate;
in vec2 uv;

out vec4 fragColor;

void main() {
  vec2 texCoord = shaderPassRenderer_getTextureUV(coordinate);
  ivec2 iTexSize = textureSize(sourceTexture, 0);
  vec2 texSize = vec2(float(iTexSize.x), float(iTexSize.y));

  fragColor = texture(sourceTexture, texCoord);
  fragColor = ${r}(fragColor, texSize, texCoord);
}
`}function he(r){return`#version 300 es

uniform sampler2D sourceTexture;

in vec2 position;
in vec2 coordinate;
in vec2 uv;

out vec4 fragColor;

void main() {
  vec2 texCoord = shaderPassRenderer_getTextureUV(coordinate);
  ivec2 iTexSize = textureSize(sourceTexture, 0);
  vec2 texSize = vec2(float(iTexSize.x), float(iTexSize.y));

  fragColor = ${r}(sourceTexture, texSize, texCoord);
}
`}const me={name:"textureTransform",source:`
struct textureTransformUniforms {
  scale: vec2<f32>,
  flipY: i32,
};
@group(0) @binding(auto) var<uniform> textureTransform: textureTransformUniforms;

fn shaderPassRenderer_getTextureUV(uv: vec2f) -> vec2f {
  var position = (uv - vec2f(0.5, 0.5)) / textureTransform.scale + vec2f(0.5, 0.5);
  if (textureTransform.flipY != 0) {
    position.y = 1.0 - position.y;
  }
  return position;
}

fn shaderPassRenderer_getRenderTargetUV(textureUV: vec2f) -> vec2f {
  let unscaledCoord = (textureUV - vec2f(0.5, 0.5)) * textureTransform.scale + vec2f(0.5, 0.5);
  return select(vec2f(unscaledCoord.x, 1.0 - unscaledCoord.y), unscaledCoord, textureTransform.flipY != 0);
}
`,fs:`
layout(std140) uniform textureTransformUniforms {
  vec2 scale;
  int flipY;
} textureTransform;

vec2 shaderPassRenderer_getTextureUV(vec2 coord) {
  vec2 position = (coord - 0.5) / textureTransform.scale + 0.5;
  if (textureTransform.flipY != 0) {
    position.y = 1.0 - position.y;
  }
  return position;
}

vec2 shaderPassRenderer_getRenderTargetUV(vec2 textureUV) {
  vec2 unscaledCoord = (textureUV - 0.5) * textureTransform.scale + 0.5;
  return textureTransform.flipY != 0 ? unscaledCoord : vec2(unscaledCoord.x, 1.0 - unscaledCoord.y);
}
`,uniformTypes:{scale:"vec2<f32>",flipY:"i32"}},pe=new Set(["original","previous"]);class Ke{device;shaderInputs;passRenderers;swapFramebuffers;textureModel;constructor(e,t){this.device=e;const s=Te(t.shaderPasses);s.map(u=>q(u));const o=s.reduce((u,a)=>({...u,[a.name]:a}),{});this.shaderInputs=t.shaderInputs||new X(o);const n=e.getCanvasContext().getDrawingBufferSize();this.swapFramebuffers=new ue(e,{colorAttachments:[t.colorFormat||e.preferredColorFormat],width:n[0],height:n[1]}),this.textureModel=new ie(e,{backgroundTexture:this.swapFramebuffers.current.colorAttachments[0].texture,flipY:t.flipY??e.type==="webgpu"});const i=t.flipY??e.type==="webgpu";this.passRenderers=t.shaderPasses.map(u=>new ge(e,u,this.shaderInputs,i))}destroy(){for(const e of this.passRenderers)e.destroy();this.swapFramebuffers.destroy(),this.textureModel.destroy()}resize(e){e||=this.device.getCanvasContext().getDrawingBufferSize(),this.swapFramebuffers.resize({width:e[0],height:e[1]});for(const t of this.passRenderers)t.resize(e)}resetHistory(){for(const e of this.passRenderers)e.resetHistory()}renderToScreen(e){return this.encodeToScreen(this.device.commandEncoder,e)}encodeToScreen(e,t){const s=this.encodeToTexture(e,t);if(!s)return!1;const o=this.device.getDefaultCanvasContext().getCurrentFramebuffer({depthStencilFormat:!1});this.textureModel.setProps({backgroundTexture:s}),this.textureModel.predraw(e);const n=e.beginRenderPass({id:"shader-pass-renderer-to-screen",framebuffer:o,clearDepth:!1});return this.textureModel.draw(n),n.end(),!0}renderToTexture(e){return this.encodeToTexture(this.device.commandEncoder,e)}encodeToTexture(e,t){if(e.device!==this.device)throw new Error("ShaderPassRenderer command encoder must belong to the renderer device");const{sourceTexture:s}=t;if(s instanceof F&&!s.isReady)return null;const o=s instanceof F?s.texture:s;if(this.passRenderers.length===0)return o;t.resetHistory&&this.resetHistory(),this.textureModel.setProps({backgroundTexture:o}),this.textureModel.predraw(e);const n=Ee(this.swapFramebuffers,o),i=e.beginRenderPass({id:"shader-pass-renderer-seed-source",framebuffer:n,clearColor:[0,0,0,1],clearDepth:!1});this.textureModel.draw(i),i.end();let u=n,a=B(n),c=!1;try{for(const f of this.passRenderers){f.initializeHistoryTargets(o,this.textureModel,e),f.runComputeOptimization({commandEncoder:e,originalTexture:o,previousTexture:a,runtimeUniforms:t.uniforms||{}});for(const h of f.subPassExecutions){const m=h.output||"previous",l=m==="previous"?Be(this.swapFramebuffers,u):f.getOutputFramebuffer(m),x=B(l),T=f.resolveBindings({execution:h,originalTexture:o,previousTexture:a,outputTexture:x,externalBindings:t.bindings||{}}),C=Ce(this.shaderInputs,h,t.uniforms||{});h.subPassRenderer.prepare({commandEncoder:e,bindings:T,textureScale:Ae(T.sourceTexture||a,x),uniforms:C});const y=e.beginRenderPass({id:"shader-pass-renderer-run-pass",framebuffer:l,clearColor:[0,0,0,1],clearDepth:1});h.subPassRenderer.draw(y),y.end(),m==="previous"?(a=x,u=l):f.markTargetWritten(m)}}c=!0}finally{for(const f of this.passRenderers)f.finishFrame(c)}return a}}class ge{device;shaderInputs;passDefinition;renderTargets;subPassExecutions;computeRenderer;constructor(e,t,s,o){if(this.device=e,this.shaderInputs=s,this.passDefinition=t,V(t)){ye(t.name,t.renderTargets||{}),this.renderTargets=Se(e,t.renderTargets||{}),be(e,t)&&(this.computeRenderer=new xe(e,t.compute,this.renderTargets,s));const n=this.computeRenderer?t.steps.filter(i=>!t.compute.replacedPasses.includes(i.shaderPass.name)):t.steps;this.subPassExecutions=n.flatMap(i=>this.createStepExecutions(t,i,o));return}I(t,t.name),this.renderTargets={},this.subPassExecutions=this.createPassExecutions(t,{ownerName:t.name,flipY:o})}destroy(){this.computeRenderer?.destroy();for(const e of this.subPassExecutions)e.subPassRenderer.destroy();Fe(this.renderTargets)}resize(e){Me(this.device,this.renderTargets,e)}runComputeOptimization(e){if(!this.computeRenderer)return;const t=this.resolveInputTexture(this.computeRenderer.optimization.input,e.originalTexture,e.previousTexture);this.computeRenderer.encode(e.commandEncoder,t,e.runtimeUniforms);for(const s of Object.values(this.computeRenderer.optimization.outputs))this.markTargetWritten(s)}resetHistory(){for(const e of Object.values(this.renderTargets))e.historyInitialized=!1,e.writtenThisFrame=!1}initializeHistoryTargets(e,t,s){for(const o of Object.values(this.renderTargets)){if(o.spec.lifetime!=="history"||o.historyInitialized)continue;const n=_(o),i=o.spec.initialize||{clearColor:[0,0,0,0]};if(i==="original"){t.setProps({backgroundTexture:e}),t.predraw(s);const u=s.beginRenderPass({id:`${o.name}-initialize-history`,framebuffer:n,clearColor:[0,0,0,0],clearDepth:!1});t.draw(u),u.end()}else s.beginRenderPass({id:`${o.name}-clear-history`,framebuffer:n,clearColor:i.clearColor,clearDepth:!1}).end();o.historyInitialized=!0}}getOutputFramebuffer(e){return this.getRenderTarget(e).framebuffer}markTargetWritten(e){this.getRenderTarget(e).writtenThisFrame=!0}finishFrame(e){for(const t of Object.values(this.renderTargets)){if(e&&t.spec.lifetime==="history"&&t.writtenThisFrame){const s=k(t),o=_(t);t.historyTexture=t.texture,t.historyFramebuffer=t.framebuffer,t.texture=s,t.framebuffer=o,t.historyInitialized=!0}t.writtenThisFrame=!1}}getRenderTarget(e){const t=this.renderTargets[e];if(!t)throw new Error(`${this.getOwnerName()}: unknown render target "${e}"`);return t}resolveBindings(e){const{execution:t,originalTexture:s,previousTexture:o,outputTexture:n,externalBindings:i}=e,u=t.inputs||{sourceTexture:"previous"},a=this.shaderInputs.getModuleBindingValues(t.shaderPass.name),c=Object.fromEntries(Object.entries(i).filter(([m])=>t.shaderPass.bindingLayout?.some(l=>l.name===m))),f={...a,...c},h=t.output||"previous";for(const[m,l]of Object.entries(u)){if(!l)continue;const x=this.resolveInputTexture(l,s,o),T=l in this.renderTargets?this.renderTargets[l]:null;if(h!=="previous"&&l===h&&T?.spec.lifetime!=="history")throw new Error(`${t.ownerName}: subpass cannot read and write render target "${h}" in the same draw`);if(x===n)throw new Error(`${t.ownerName}: subpass cannot sample from the render target it is writing to`);f[m]=x}return"sourceTexture"in f||(f.sourceTexture=o),f}createStepExecutions(e,t,s){return I(t.shaderPass,`${e.name}/${t.shaderPass.name}`),this.createPassExecutions(t.shaderPass,{ownerName:`${e.name}/${t.shaderPass.name}`,firstInputs:t.inputs,lastOutput:t.output,uniformOverrides:t.uniforms,flipY:s})}createPassExecutions(e,t){const s=e.passes||[];return s.map((o,n)=>{const i=n===0,u=n===s.length-1,a=i&&t.firstInputs!==void 0?t.firstInputs:o.inputs,c=u&&t.lastOutput!==void 0?t.lastOutput:o.output;return we(t.ownerName,a,c,this.renderTargets),{ownerName:t.ownerName,shaderPass:e,subPassRenderer:new ve(this.device,e,o,t.flipY),inputs:a,output:c,uniforms:M(t.uniformOverrides,o.uniforms)}})}resolveInputTexture(e,t,s){switch(e){case"original":return t;case"previous":return s;default:{const o=this.getRenderTarget(e);return o.spec.lifetime==="history"&&!o.writtenThisFrame?k(o):o.texture}}}getOwnerName(){return this.passDefinition.name}}class xe{optimization;renderTargets;shaderInputs;computation;parameterBuffer;constructor(e,t,s,o){this.optimization=t,this.renderTargets=s,this.shaderInputs=o,this.parameterBuffer=e.createBuffer({id:`${t.name}-parameters`,byteLength:Math.max(Math.ceil(t.uniformNames.length/4)*16,16),usage:A.UNIFORM|A.COPY_DST});const n=Object.entries(t.outputs).map(([i,u],a)=>({name:i,type:"storage",group:0,location:a+2,access:"write-only",format:s[u].texture.format}));try{this.computation=new K(e,{id:t.name,source:t.source,shaderLayout:{bindings:[{name:t.uniformBinding,type:"uniform",group:0,location:0},{name:"sourceTexture",type:"texture",group:0,location:1,sampleType:"unfilterable-float"},...n]}})}catch(i){throw this.parameterBuffer.destroy(),i}}encode(e,t,s){const o={...this.shaderInputs.getUniformValues()[this.optimization.uniformModule]||{},...this.optimization.uniforms,...s[this.optimization.uniformModule]||{}},n=new Float32Array(Math.max(Math.ceil(this.optimization.uniformNames.length/4)*4,4));for(const[f,h]of this.optimization.uniformNames.entries()){const m=o[h];n[f]=typeof m=="number"?m:0}this.parameterBuffer.write(n);const i=Object.entries(this.optimization.outputs),u={[this.optimization.uniformBinding]:this.parameterBuffer,sourceTexture:t.view};for(const[f,h]of i)u[f]=this.renderTargets[h].texture.view;this.computation.setBindings(u),this.computation.predraw(e);const a=this.renderTargets[i[0][1]].texture,c=e.beginComputePass({id:this.optimization.name});this.computation.dispatch(c,Math.ceil(a.width/this.optimization.workgroupSize[0]),Math.ceil(a.height/this.optimization.workgroupSize[1]),1),c.end()}destroy(){this.computation.destroy(),this.parameterBuffer.destroy()}}class ve{model;shaderPass;subPass;flipY;constructor(e,t,s,o){this.shaderPass=t,this.subPass=s,this.flipY=o;const n=s.action||s.filter&&"filter"||s.sampler&&"sample"||"filter",i=ce({shaderPass:t,action:n,shadingLanguage:e.info.shadingLanguage});this.model=new Y(e,{id:`${t.name}-subpass`,source:i,fs:i,modules:[me,t],parameters:{depthWriteEnabled:!1}})}destroy(){this.model.destroy()}prepare(e){const{commandEncoder:t,bindings:s,textureScale:o,uniforms:n}=e;this.model.shaderInputs.setProps({textureTransform:{scale:o,flipY:this.flipY?1:0}}),this.model.shaderInputs.setProps({[this.shaderPass.name]:this.shaderPass.uniforms||{}}),this.model.shaderInputs.setProps({[this.shaderPass.name]:n||{}}),this.model.setBindings(s||{}),this.model.predraw(t)}draw(e){this.model.draw(e)}}function Te(r){return r.flatMap(e=>V(e)?e.steps.map(t=>t.shaderPass):[e])}function V(r){return"steps"in r}function be(r,e){const t=e.compute;if(!t||r.type!=="webgpu")return!1;const s=Object.values(t.outputs);return s.length===0||s.length>r.limits.maxStorageTexturesPerShaderStage||t.workgroupSize[0]>r.limits.maxComputeWorkgroupSizeX||t.workgroupSize[1]>r.limits.maxComputeWorkgroupSizeY||t.workgroupSize[0]*t.workgroupSize[1]>r.limits.maxComputeInvocationsPerWorkgroup?!1:s.every(o=>{const n=e.renderTargets?.[o];if(!n?.storage)return!1;const i=n.format||r.preferredColorFormat;return r.getTextureFormatCapabilities(i).store})}function I(r,e){const t=r.renderTargets;if(t&&Object.keys(t).length>0)throw new Error(`${e}: ShaderPass.renderTargets is not supported; use CompositeShaderPass.renderTargets instead`)}function ye(r,e){for(const t of Object.keys(e))if(pe.has(t))throw new Error(`${r}: render target name "${t}" is reserved`)}function we(r,e,t,s){const o=e||{sourceTexture:"previous"};for(const n of Object.values(o))if(n&&n!=="original"&&n!=="previous"&&!(n in s))throw new Error(`${r}: unknown input source "${n}"`);if(t&&t!=="previous"&&!(t in s))throw new Error(`${r}: unknown output target "${t}"`)}function M(r,e){if(!(!r&&!e))return{...r||{},...e||{}}}function Ce(r,e,t){return M(M(r.getUniformValues()[e.shaderPass.name],e.uniforms),t[e.shaderPass.name])}function Se(r,e){const t=r.getCanvasContext().getDrawingBufferSize(),s={};for(const[o,n]of Object.entries(e)){if(n.aliasFor){const i=s[n.aliasFor];if(!i)throw new Error(`${o}: target alias references an unknown earlier target`);const u=E(t,n.scale),a=n.format||r.preferredColorFormat;if(n.lifetime==="history"||i.spec.lifetime==="history"||!Pe(n,i.spec)||i.texture.width!==u[0]||i.texture.height!==u[1]||i.texture.format!==a||n.storage&&!i.spec.storage||!Re(n,i.spec))throw new Error(`${o}: target alias must match a transient target's size, format, and sampler`);s[o]=i;continue}s[o]=D(r,o,n,t)}return s}function Pe(r,e){const t=r.scale||[1,1],s=e.scale||[1,1];return t[0]===s[0]&&t[1]===s[1]}function Re(r,e){const t=r.sampler||{},s=e.sampler||{},o=Object.entries(t);return o.length===Object.keys(s).length&&o.every(([n,i])=>s[n]===i)}function Fe(r){for(const e of new Set(Object.values(r)))e.framebuffer.destroy(),e.texture.destroy(),e.historyFramebuffer?.destroy(),e.historyTexture?.destroy()}function Me(r,e,t){for(const s of new Set(Object.values(e))){const o=E(t,s.spec.scale);if(s.texture.width===o[0]&&s.texture.height===o[1])continue;s.framebuffer.destroy(),s.texture.destroy(),s.historyFramebuffer?.destroy(),s.historyTexture?.destroy();const n=D(r,s.name,s.spec,t);s.texture=n.texture,s.framebuffer=n.framebuffer,s.historyTexture=n.historyTexture,s.historyFramebuffer=n.historyFramebuffer,s.historyInitialized=!1,s.writtenThisFrame=!1}}function D(r,e,t,s){const o=E(s,t.scale),{texture:n,framebuffer:i}=z(r,e,t,o);let u,a;if(t.lifetime==="history"){const c=z(r,`${e}-history`,t,o);u=c.texture,a=c.framebuffer}return{name:e,spec:t,texture:n,framebuffer:i,historyTexture:u,historyFramebuffer:a,historyInitialized:!1,writtenThisFrame:!1}}function z(r,e,t,s){const o=r.createTexture({id:`${e}-texture`,width:s[0],height:s[1],format:t.format||r.preferredColorFormat,usage:d.SAMPLE|d.RENDER|d.COPY_SRC|d.COPY_DST|(t.storage&&r.type==="webgpu"&&r.getTextureFormatCapabilities(t.format||r.preferredColorFormat).store?d.STORAGE:0),...t.sampler?{sampler:t.sampler}:{}}),n=r.createFramebuffer({id:`${e}-framebuffer`,width:s[0],height:s[1],colorAttachments:[o]});return{texture:o,framebuffer:n}}function k(r){if(!r.historyTexture)throw new Error(`${r.name}: transient render target has no history texture`);return r.historyTexture}function _(r){if(!r.historyFramebuffer)throw new Error(`${r.name}: transient render target has no history framebuffer`);return r.historyFramebuffer}function E(r,e=[1,1]){return[Math.max(1,Math.round(r[0]*e[0])),Math.max(1,Math.round(r[1]*e[1]))]}function B(r){const e=r.colorAttachments[0]?.texture;if(!e)throw new Error("ShaderPassRenderer: framebuffer is missing a color attachment texture");return e}function Be(r,e){return e===r.current?r.next:r.current}function Ee(r,e){return B(r.current)===e?r.next:r.current}function Ae(r,e){const t=r.width/r.height,s=e.width/e.height;return s>t?[1,s/t]:[t/s,1]}const Oe={minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},Ie={minFilter:"nearest",magFilter:"nearest",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge"},ze=new Set(["color","normalRoughness","velocity","depth"]),ke=new Set(["rgba8unorm","rgba8unorm-srgb","rgba8snorm","bgra8unorm","bgra8unorm-srgb","rgb10a2uint","rgb10a2unorm","rg11b10ufloat"]);let $=0;class _e{device;id;props;renderTargets;constructor(e,t){if(e.type!=="webgpu")throw new Error("GBuffer requires a WebGPU device.");this.device=e,this.id=t.id||Ve("g-buffer"),this.props=$e(this.id,t),Ue(e,this.props),this.renderTargets=U(e,this.props)}get framebuffer(){return this.renderTargets.framebuffer}get colorTexture(){return this.renderTargets.colorTexture}get normalRoughnessTexture(){return this.renderTargets.normalRoughnessTexture}get velocityTexture(){const e=this.renderTargets.velocityTexture;if(!e)throw new Error("GBuffer velocity attachment is disabled.");return e}get depthTexture(){return this.renderTargets.depthTexture}get width(){return this.renderTargets.framebuffer.width}get height(){return this.renderTargets.framebuffer.height}getShaderPassBindings(){return{depthTexture:this.depthTexture,normalTexture:this.normalRoughnessTexture,velocityTexture:this.velocityTexture}}getExtraColorTexture(e){const t=this.renderTargets.extraColorTextures.get(e);if(!t)throw new Error('GBuffer has no extra color attachment named "'+e+'".');return t}resize(e){if(j(e.width,e.height),e.width===this.width&&e.height===this.height)return!1;const t=this.renderTargets;return this.renderTargets=U(this.device,{...this.props,width:e.width,height:e.height}),L(t),!0}destroy(){L(this.renderTargets)}}function $e(r,e){return{id:r,width:e.width,height:e.height,colorFormat:e.colorFormat||"rgba8unorm",normalRoughnessFormat:e.normalRoughnessFormat||"rgba8unorm",velocity:e.velocity??!0,velocityFormat:e.velocityFormat||"rg16float",depthStencilFormat:e.depthStencilFormat||"depth24plus",extraColorAttachments:e.extraColorAttachments||[]}}function Ue(r,e){j(e.width,e.height);const t=[e.colorFormat,e.normalRoughnessFormat,...e.velocity?[e.velocityFormat]:[],...e.extraColorAttachments.map(i=>i.format)],s=t.length;if(s>r.limits.maxColorAttachments)throw new Error("GBuffer requires "+s+" color attachments, but the device supports "+r.limits.maxColorAttachments+".");S(r,e.colorFormat,"color"),S(r,e.normalRoughnessFormat,"normalRoughness"),e.velocity&&S(r,e.velocityFormat,"velocity"),Ye(r,e.depthStencilFormat,"depth");const o=new Set;for(const i of e.extraColorAttachments){if(!i.name)throw new Error("GBuffer extra color attachment name is required.");if(ze.has(i.name))throw new Error('GBuffer extra color attachment name "'+i.name+'" is reserved.');if(o.has(i.name))throw new Error('GBuffer extra color attachment name "'+i.name+'" is duplicated.');o.add(i.name),S(r,i.format,i.name)}const n=Le(r,t);if(n>r.limits.maxColorAttachmentBytesPerSample)throw new Error("GBuffer color attachments require "+n+" bytes per sample, but the device supports "+r.limits.maxColorAttachmentBytesPerSample+".")}function Le(r,e){let t=0;for(const s of e){const o=Ne(s);t=Math.ceil(t/o)*o;const n=r.getTextureFormatInfo(s).bytesPerPixel;t+=ke.has(s)?8:n}return t}function Ne(r){return r.startsWith("r8")||r.startsWith("rg8")||r.startsWith("rgba8")||r.startsWith("bgra8")?1:r.startsWith("r16")||r.startsWith("rg16")||r.startsWith("rgba16")?2:4}function j(r,e){if(!Number.isSafeInteger(r)||!Number.isSafeInteger(e)||r<=0||e<=0)throw new Error("GBuffer size must use positive safe integer dimensions.")}function S(r,e,t){if(!r.getTextureFormatCapabilities(e).render)throw new Error('GBuffer attachment "'+t+'" requires renderable format '+e+".")}function Ye(r,e,t){if(!r.getTextureFormatCapabilities(e).create)throw new Error('GBuffer attachment "'+t+'" requires supported format '+e+".")}function U(r,e){const t=P(r,e,"color",e.colorFormat),s=P(r,e,"normal-roughness",e.normalRoughnessFormat),o=e.velocity?P(r,e,"velocity",e.velocityFormat):void 0,n=new Map(e.extraColorAttachments.map(a=>[a.name,P(r,e,a.name,a.format,a.sampler)])),i=r.createTexture({id:e.id+"-depth",format:e.depthStencilFormat,width:e.width,height:e.height,usage:d.SAMPLE|d.RENDER|d.COPY_DST,sampler:Ie});return{framebuffer:r.createFramebuffer({id:e.id+"-framebuffer",width:e.width,height:e.height,colorAttachments:[t,s,...o?[o]:[],...n.values()],depthStencilAttachment:i}),colorTexture:t,normalRoughnessTexture:s,velocityTexture:o,depthTexture:i,extraColorTextures:n}}function P(r,e,t,s,o=Oe){return r.createTexture({id:e.id+"-"+t,format:s,width:e.width,height:e.height,usage:d.SAMPLE|d.RENDER|d.COPY_DST,sampler:o})}function L(r){r.framebuffer.destroy(),r.colorTexture.destroy(),r.normalRoughnessTexture.destroy(),r.velocityTexture?.destroy(),r.depthTexture.destroy();for(const e of r.extraColorTextures.values())e.destroy()}function Ve(r){return $+=1,r+"-"+$}function De(r,e=[0,0,0]){const t=r.distanceScales.unitsPerMeter,s=t[2]*Math.hypot(r.viewMatrix[8],r.viewMatrix[9],r.viewMatrix[10]),o=new v([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]),n=new v(o).multiplyRight(r.projectionMatrix).scale(s),i=r.projectPosition([...e]),u=new v().scale(1/s).multiplyRight(r.viewMatrix).translate(i).scale(t),a=new v(o).multiplyRight(r.viewProjectionMatrix);return{projectionMatrix:n,inverseProjectionMatrix:new v(n).invert(),viewMatrix:u,inverseViewMatrix:new v(u).invert(),viewProjectionMatrix:a,inverseViewProjectionMatrix:new v(a).invert(),nearPlane:r.projectionMatrix[14]/s/(r.projectionMatrix[10]-1),farPlane:r.projectionMatrix[14]/s/(r.projectionMatrix[10]+1)}}const je={name:"cameraMotion",source:`struct CameraMotionUniforms {
    currentClipToPreviousClip: mat4x4f,
    viewportBounds: vec4f,
    textureSize: vec2f,
  };
  @group(3) @binding(auto) var<uniform> cameraMotion: CameraMotionUniforms;`,uniformTypes:{currentClipToPreviousClip:"mat4x4<f32>",viewportBounds:"vec4<f32>",textureSize:"vec2<f32>"},defaultUniforms:{currentClipToPreviousClip:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],viewportBounds:[0,0,1,1],textureSize:[1,1]}};class Ge{constructor(e){this.device=e,this.model=new N(e,{id:"scene-camera-velocity",source:We,modules:[je],vertexCount:3,parameters:{depthWriteEnabled:!1,depthCompare:"always",blend:!1}})}render(e,t,s,o){this.model.setBindings({depthTexture:t}),this.model.shaderInputs.setProps({cameraMotion:{currentClipToPreviousClip:s,viewportBounds:o,textureSize:[e.width,e.height]}});const n=this.device.beginRenderPass({framebuffer:e,clearColor:[0,0,0,0],clearDepth:!1,depthReadOnly:!0});this.model.draw(n),n.end(),n.destroy()}destroy(){this.model.destroy()}}const We=`
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4f {
  let positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  return vec4f(positions[index], 0.0, 1.0);
}
@fragment fn fragmentMain(@builtin(position) position: vec4f) -> @location(0) vec4f {
  let bounds = cameraMotion.viewportBounds;
  if (any(position.xy < bounds.xy) || any(position.xy >= bounds.xy + bounds.zw)) { return vec4f(0.0); }
  let depth = textureLoad(depthTexture, vec2i(position.xy), 0);
  if (depth >= 0.99999) { return vec4f(0.0); }
  let currentCoordinate = (position.xy - bounds.xy) / bounds.zw;
  let clip = vec4f(currentCoordinate * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), depth, 1.0);
  let previousClip = cameraMotion.currentClipToPreviousClip * clip;
  if (previousClip.w <= 0.00001) { return vec4f(0.0); }
  let previousCoordinate = previousClip.xy / previousClip.w * vec2f(0.5, -0.5) + vec2f(0.5);
  return vec4f((currentCoordinate - previousCoordinate) * bounds.zw / cameraMotion.textureSize, 0.0, 1.0);
}`;class Qe{constructor(e){this.useInPicking=!1,this.views=new Map,this.frameIndex=0,this.props=e,this.id=e.id||"scene-buffers"}setup({device:e}){Q(e.type==="webgpu"),this.device=e,this.props.motionVectors&&(this.velocityModel=new Ge(e)),this.capturePass=new He(e,{id:`${this.id}-capture`},this.props.getLayerOptions)}getFrame(e){return this.views.get(e)?.frame}resetHistory(e){for(const[t,s]of this.views)(e===void 0||e===t)&&(s.historyInvalidated=!0)}getShaderModuleProps(e){const t=this.props.getLayerOptions(e);return{...t?.surfaceBuffer?{surfaceBuffer:{enabled:0}}:{},...t?.motionBuffer?{motionBuffer:{enabled:0}}:{}}}preRender(e){if(e.isPicking||!this.device||!this.capturePass)return;const t=e.canvasContext||this.device.getCanvasContext(),[s,o]=t.getDrawingBufferSize();if(s<=0||o<=0)return;const n=new Set(e.viewports.filter(c=>c.width>0&&c.height>0).map(c=>c.id));for(const[c,f]of this.views)n.has(c)||(R(f),this.views.delete(c));const i=this.props.getTime?.()??0,u=e.effects?.filter(c=>c!==this),a={...e,canvasContext:t,effects:u,isPicking:!1,views:void 0,clearColor:void 0};for(const c of e.viewports){if(c.width<=0||c.height<=0)continue;let f=this.views.get(c.id);if(!f||f.slots[0].buffer.width!==s||f.slots[0].buffer.height!==o){const p=this.createCapture(c.id,s,o);f&&R(f),f=p,this.views.set(c.id,f)}const h=t.cssToDeviceRatio(),m=[c.x*h,c.y*h,c.width*h,c.height*h],l=!f.historyInvalidated&&f.frame?.viewportBounds.every((p,b)=>p===m[b])?f.frame:void 0,x=De(c),T=l?new v([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]).multiplyRight(l.viewProjectionMatrix):x.viewProjectionMatrix,C=new v(T).multiplyRight(x.inverseViewProjectionMatrix);this.capturePass.motionProps={enabled:0,currentClipToPreviousClip:C,previousTime:l?.time??i,viewportScale:[m[2]/s,m[3]/o]};const y=this.props.history&&f.completedIndex===0?1:0,g=f.slots[y],w={...a,viewports:[c]};this.capturePass.viewParameters=e.views?.[c.id]?.props.parameters||{};const G=e.layers.flatMap(p=>p.getModels().map(b=>({model:b,parameters:{...b.parameters}})));try{this.capturePass.captureMode="opaque",this.capturePass.render({...w,pass:`${this.id}-opaque`,target:g.colorFramebuffer,clearCanvas:!0,clearColor:this.props.clearColor??[0,0,0,0]}),this.capturePass.captureMode="normal",this.capturePass.render({...w,pass:`${this.id}-normal`,target:g.normalFramebuffer,clearCanvas:!1,clearColor:[.5,.5,1,1]}),g.selectionFramebuffer&&(this.capturePass.captureMode="selection",this.capturePass.render({...w,pass:`${this.id}-selection`,target:g.selectionFramebuffer,clearCanvas:!1,clearColor:[0,0,0,0]})),g.velocityFramebuffer&&(this.velocityModel.render(g.velocityFramebuffer,g.buffer.depthTexture,C,m),this.capturePass.captureMode="velocity",this.capturePass.render({...w,pass:`${this.id}-velocity`,target:g.velocityFramebuffer,clearCanvas:!1,clearColor:void 0})),this.capturePass.captureMode="transparent",this.capturePass.render({...w,pass:`${this.id}-transparent`,target:g.colorFramebuffer,clearCanvas:!1})}finally{for(const{model:p,parameters:b}of G)p.setParameters(b);for(const p of e.layers)this.props.getLayerOptions(p)?.surfaceBuffer&&p.setShaderModuleProps({surfaceBuffer:{enabled:0}}),this.props.getLayerOptions(p)?.motionBuffer&&p.setShaderModuleProps({motionBuffer:{enabled:0}})}f.frame={buffer:g.buffer,previousBuffer:this.props.history?l?.buffer:void 0,viewProjectionMatrix:[...c.viewProjectionMatrix],previousViewProjectionMatrix:l?.viewProjectionMatrix,viewportBounds:m,frameIndex:this.frameIndex,historyValid:!!l,time:i,previousTime:l?.time??i},f.completedIndex=y,f.historyInvalidated=!1}this.frameIndex++}cleanup(){for(const e of this.views.values())R(e);this.views.clear(),this.velocityModel?.destroy(),this.velocityModel=void 0,this.capturePass?.cleanup(),this.capturePass=void 0,this.device=void 0}createCapture(e,t,s){const o=[];try{for(let n=0;n<(this.props.history?2:1);n++){const i=new _e(this.device,{id:`${this.id}-${e}-${n}`,width:t,height:s,colorFormat:this.props.colorFormat||"rgba16float",velocity:this.props.motionVectors??!1,extraColorAttachments:this.props.selection?[{name:"selection",format:"r8unorm"}]:[]}),u=[];try{for(const a of[i.colorTexture,i.normalRoughnessTexture,...this.props.selection?[i.getExtraColorTexture("selection")]:[],...this.props.motionVectors?[i.velocityTexture]:[]])u.push(this.device.createFramebuffer({width:t,height:s,colorAttachments:[a],depthStencilAttachment:i.depthTexture}));o.push({buffer:i,colorFramebuffer:u[0],normalFramebuffer:u[1],selectionFramebuffer:this.props.selection?u[2]:void 0,velocityFramebuffer:this.props.motionVectors?u[this.props.selection?3:2]:void 0})}catch(a){for(const c of u)c.destroy();throw i.destroy(),a}}return{slots:o,historyInvalidated:!0}}catch(n){throw R({slots:o}),n}}}class He extends J{constructor(e,t,s){super(e,t),this.getLayerOptions=s,this.captureMode="opaque",this.viewParameters={},this.motionProps={}}shouldDrawLayer(e){const t=this.getLayerOptions(e);return t?this.captureMode==="velocity"?!!t.motionBuffer:this.captureMode==="normal"||this.captureMode==="selection"?t.mode==="opaque"&&!!t.surfaceBuffer&&(this.captureMode!=="selection"||!!t.selected):t.mode===this.captureMode:!1}getShaderModuleProps(e){const t=this.getLayerOptions(e);return{...t?.motionBuffer?{motionBuffer:{...this.motionProps,enabled:this.captureMode==="velocity"?1:0}}:{},...t?.surfaceBuffer?{surfaceBuffer:{enabled:this.captureMode==="normal"?1:this.captureMode==="selection"?2:0,viewMatrix:e.context.viewport.viewMatrix}}:{}}}getLayerParameters(e,t,s){const o={...this.viewParameters,...e.props.parameters};return this.captureMode==="transparent"?{...o,depthCompare:"less-equal",depthWriteEnabled:!1}:{...o,depthCompare:"less-equal",depthWriteEnabled:this.captureMode==="opaque",blend:!1,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"one",blendColorDstFactor:"zero",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"zero"}}}function R(r){for(const e of r.slots)e.colorFramebuffer.destroy(),e.normalFramebuffer.destroy(),e.selectionFramebuffer?.destroy(),e.velocityFramebuffer?.destroy(),e.buffer.destroy()}export{ie as B,Qe as S,Ke as a,De as g};
