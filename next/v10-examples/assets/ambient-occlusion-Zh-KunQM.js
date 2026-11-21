import{h as R,l as z,m as D}from"./deck-example-device-CWfGr9tr.js";import{i as k}from"./example-support-KHcxfZf7.js";import{W as T}from"./water-surface-layer-CHm31ofo.js";import{S as L}from"./scene-buffer-effect-D9vttx7r.js";import{R as I}from"./riverfront-view-CB3JCqMN.js";import{m as N,a as _,C as p}from"./river-district-data-C9FvyLLC.js";import{R as y}from"./river-district-layer-DmM8zNii.js";import{R as A}from"./river-reflection-effect-Daay0xIC.js";import{t as B}from"./tone-mapping-dFslqTmk.js";import{c as U}from"./outlines-Db2nktbL.js";import{d as w}from"./depth-aware-blur-C8MXPRPo.js";import{d as F}from"./screen-space-shader-helpers-Cds7e6ZO.js";import"./project32-FxhLPfKz.js";import"./lambert-material-CLhvrC9r.js";import"./computation-CgsV9qDL.js";import"./dynamic-texture-vGsOuku3.js";import"./meter-offset-position-QI9WgHSp.js";const V=`${F}
struct ssaoEvaluateUniforms {
  nearPlane: f32,
  farPlane: f32,
  radius: f32,
  bias: f32,
  intensity: f32,
  useNormalTexture: f32,
};
@group(0) @binding(auto) var<uniform> ssaoEvaluate: ssaoEvaluateUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTextureSampler: sampler;

fn ssaoEvaluate_sampleColor(
  sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler, texSize: vec2f, texCoord: vec2f
) -> vec4f {
  let sceneCoord = advancedSceneUV(texCoord);
  let depth = textureSample(depthTexture, depthTextureSampler, sceneCoord);
  let dimensions = vec2f(textureDimensions(depthTexture));
  let linearDepth = advancedLinearDepth(depth, ssaoEvaluate.nearPlane, ssaoEvaluate.farPlane);
  let reconstructedNormal = advancedDepthNormal(depthTexture, depthTextureSampler, sceneCoord);
  let textureNormal = normalize(textureSample(normalTexture, normalTextureSampler, sceneCoord).xyz * 2.0 - 1.0);
  let normal = normalize(mix(reconstructedNormal, textureNormal, ssaoEvaluate.useNormalTexture));
  let angle = fract(sin(dot(texCoord * dimensions, vec2f(12.9898, 78.233))) * 43758.5453) * 6.2831853;
  var occlusion = 0.0;
  for (var index: i32 = 0; index < 12; index++) {
    let sampleAngle = angle + f32(index) * 2.399963;
    let sampleRadius = (0.25 + 0.75 * f32(index + 1) / 12.0) * ssaoEvaluate.radius;
    let direction = vec2f(cos(sampleAngle), sin(sampleAngle));
    let sampleUv = clamp(texCoord + direction * sampleRadius / dimensions, vec2f(0.0), vec2f(1.0));
    let sampleDepth = textureSampleLevel(depthTexture, depthTextureSampler, advancedSceneUV(sampleUv), 0);
    let sampleLinearDepth = advancedLinearDepth(sampleDepth, ssaoEvaluate.nearPlane, ssaoEvaluate.farPlane);
    let rangeWeight = smoothstep(ssaoEvaluate.radius * 2.0, 0.0, abs(sampleLinearDepth - linearDepth));
    let horizonWeight = max(dot(normal, normalize(vec3f(direction, 0.35))), 0.15);
    occlusion += select(0.0, rangeWeight * horizonWeight, sampleLinearDepth + ssaoEvaluate.bias < linearDepth);
  }
  let ambient = select(clamp(1.0 - occlusion / 12.0 * ssaoEvaluate.intensity, 0.0, 1.0), 1.0, depth >= 0.99999);
  return vec4f(vec3f(ambient), 1.0);
}
`,W={name:"ssaoEvaluate",source:V,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{nearPlane:"f32",farPlane:"f32",radius:"f32",bias:"f32",intensity:"f32",useNormalTexture:"f32"},propTypes:{nearPlane:{value:.1},farPlane:{value:200},radius:{value:7,min:1,softMax:32},bias:{value:.03,min:0,softMax:.2},intensity:{value:1.35,min:0,softMax:4},useNormalTexture:{value:0,min:0,max:1,private:!0}},passes:[{sampler:!0}]};function q(t={}){const r=t.resolutionScale??1,a=t.normalSource==="normal-texture"?1:0,s={sourceTexture:"previous"};return a||(s.normalTexture="previous"),{name:"ssaoCompositeShaderPass",renderTargets:{ssaoRaw:{scale:[r,r],format:"rgba8unorm"},ssaoScratch:{scale:[r,r],format:"rgba8unorm"},ssaoBlurred:{scale:[r,r],format:"rgba8unorm"}},steps:[{shaderPass:W,inputs:s,output:"ssaoRaw",uniforms:{useNormalTexture:a}},{shaderPass:w,inputs:{sourceTexture:"ssaoRaw"},output:"ssaoScratch",uniforms:{direction:[1,0]}},{shaderPass:w,inputs:{sourceTexture:"ssaoScratch"},output:"ssaoBlurred",uniforms:{direction:[0,1]}},{shaderPass:j,inputs:{sourceTexture:"previous",ambientOcclusionTexture:"ssaoBlurred"},output:"previous"}]}}const j={name:"ssaoComposite",source:`struct ssaoCompositeUniforms {
  debugMode: f32,
};
@group(0) @binding(auto) var<uniform> ssaoComposite: ssaoCompositeUniforms;
@group(0) @binding(auto) var ambientOcclusionTexture: texture_2d<f32>;
@group(0) @binding(auto) var ambientOcclusionTextureSampler: sampler;
fn ssaoComposite_sampleColor(
  sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler, texSize: vec2f, texCoord: vec2f
) -> vec4f {
  let color = textureSample(sourceTexture, sourceTextureSampler, texCoord);
  let ambient = textureSample(ambientOcclusionTexture, ambientOcclusionTextureSampler, texCoord).r;
  if (ssaoComposite.debugMode > 0.5) { return vec4f(vec3f(ambient), 1.0); }
  let rawOcclusion = clamp(1.0 - ambient, 0.0, 1.0);
  let contactOcclusion = smoothstep(0.03, 0.5, rawOcclusion);
  return vec4f(color.rgb * (1.0 - contactOcclusion * 0.48), color.a);
}`,bindingLayout:[{name:"ambientOcclusionTexture",group:0}],uniformTypes:{debugMode:"f32"},propTypes:{debugMode:{value:0,min:0,max:1,private:!0}},passes:[{sampler:!0}]},$=await k();$.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(t=>t.remove());const G={name:"riverfrontToneMapping",steps:[{shaderPass:B,inputs:{sourceTexture:"previous"},output:"previous"}]};function H(t,r={}){const a=N(),s=a.filter(e=>e.kind!=="water"),n=a.filter(e=>e.kind==="water"),i=n[0],E=i&&Math.abs(i.size[0])>Math.abs(i.size[1])?[1,0]:[0,1],f=_(n),v=new Float32Array(f.length/10*3);for(let e=0,u=0;e<f.length;e+=10,u+=3)v.set(f.subarray(e,e+3),u);const x={ambientOcclusion:!0,outlines:!1,reflections:!0},o={frames:0,backend:"",error:"",time:0,finalized:!1},h=Promise.withResolvers(),g=new L({id:"ambient-occlusion-buffers",colorFormat:"rgba16float",getLayerOptions:e=>e instanceof y||e instanceof T?{mode:"opaque",surfaceBuffer:!0}:null});let l=null,c=null,b=0;const P={},S=new A(g,"ambient-occlusion-stack",1.3,{beforeReflection:[q({normalSource:"normal-texture",resolutionScale:1})],afterReflection:[U({normalSource:"normal-texture"}),G],getUniforms:e=>Y(e,x,P)});c=S;const M=R(r),m=new z({parent:t,...M,views:new D({id:"riverfront",controller:!0}),initialViewState:{...I,longitude:p[0],latitude:p[1],zoom:15.9,pitch:58,bearing:-18},effects:[g,S],layers:[],_animate:!0,onDeviceInitialized:e=>{o.backend=e.type,l=e.createBuffer({id:"ambient-occlusion-water",data:v}),O()},onLoad:()=>h.resolve(),onBeforeRender:()=>{const e=performance.now();b&&(o.time+=Math.min(e-b,100)/1e3),b=e},onAfterRender:()=>{o.frames++},onError:e=>{o.error||=e.message,h.reject(e)},getTooltip:e=>e.object?.name??null});function O(){m.setProps({layers:[new y({id:"riverfront-city",features:s,data:s,pickable:!0,coordinateSystem:"meter-offsets",coordinateOrigin:p,roughness:.84}),l?new T({id:"riverfront-water",data:n,positions:l,vertexCount:v.length/3,coordinateOrigin:p,style:"river",flowDirection:E,time:()=>o.time,material:{baseColor:[11/255,66/255,82/255],fresnelColor:[.48,.67,.79],normalStrength:.34,coordinateScale:[.22,.22],waveASpeed:1.1,waveBSpeed:-.7,specularIntensity:.72}}):null]})}return{deck:m,capture:g,effect:c,settings:x,diagnostics:o,ready:h.promise,setEffect(e,u){x[e]=u,e==="reflections"?c?.setReflectionIntensity(u?1.3:0):c?.requestConvergence(),m.redraw(`riverfront ${e}`)},finalize(){o.finalized||(o.finalized=!0,m.finalize(),l?.destroy(),l=null)}}}function Y(t,r,a){const s=t.distanceScales.unitsPerMeter[2]*Math.hypot(t.viewMatrix[8],t.viewMatrix[9],t.viewMatrix[10]),n=t.projectionMatrix[10],i=t.projectionMatrix[14]/s;return a.ssaoEvaluate={nearPlane:i/(n-1),farPlane:i/(n+1),radius:12,bias:.3,intensity:r.ambientOcclusion?1.5:0},a.ssaoComposite={debugMode:0},a.screenSpaceOutline={color:[.025,.045,.06,r.outlines?.5:0],thickness:1.2,depthThreshold:.003,normalThreshold:.18},a.toneMapping={exposure:1.1},a}const J=document.querySelector("#scene"),C=document.querySelector("#status"),d=H(J);window.riverfrontAmbientOcclusionScene=d;for(const t of["ambientOcclusion","reflections","outlines"]){const r=document.querySelector(`#${t}`);r.addEventListener("change",()=>d.setEffect(t,r.checked))}d.ready.then(()=>{C.value="Toggle ambient occlusion to compare building faces.",document.body.dataset.ready="true"}).catch(t=>{C.value=t instanceof Error?t.message:String(t),document.body.dataset.ready="error"});window.addEventListener("pagehide",()=>d.finalize());
