import{b as P,h as R,j as L,c as _}from"./deck-example-device-TQPRJnZ6.js";import{i as F}from"./example-support-KHcxfZf7.js";import{S as q}from"./scene-buffer-effect-Bq4_aRU0.js";import{m as B,C as x}from"./river-district-data-C9FvyLLC.js";import{R as D}from"./riverfront-view-CB3JCqMN.js";import{R as m}from"./river-district-layer-DuhH2l43.js";import{S as C}from"./shader-pass-effect-D_gXcVHA.js";import{t as I}from"./tone-mapping-dFslqTmk.js";import{c as M}from"./bloom-composite-shader-pass-Cz7KROGO.js";import{c as j}from"./outlines-Db2nktbL.js";import"./dynamic-texture-NQQfRyls.js";import"./project32-Byi-VnKS.js";import"./meter-offset-position-CMR-ehQ5.js";import"./lambert-material-DjV_YOPi.js";import"./screen-space-shader-helpers-Cds7e6ZO.js";const U={name:"selectionOutline",source:`
struct selectionOutlineUniforms {
  color: vec4<f32>,
  thickness: f32,
};
@group(0) @binding(auto) var<uniform> selectionOutline: selectionOutlineUniforms;
@group(0) @binding(auto) var selectionTexture: texture_2d<f32>;
@group(0) @binding(auto) var selectionTextureSampler: sampler;
fn selectionOutline_sampleColor(sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  sourceSize: vec2<f32>, texCoord: vec2<f32>) -> vec4<f32> {
  let center = textureSample(selectionTexture, selectionTextureSampler, texCoord).r;
  let texel = clamp(selectionOutline.thickness, 0.0, 8.0) / (2.0 * vec2<f32>(textureDimensions(selectionTexture)));
  var maximum = center;
  for (var horizontal = -2; horizontal <= 2; horizontal++) {
    for (var vertical = -2; vertical <= 2; vertical++) {
      let offset = vec2<f32>(f32(horizontal), f32(vertical)) * texel;
      maximum = max(maximum, textureSample(selectionTexture, selectionTextureSampler, clamp(texCoord + offset, vec2<f32>(0.0), vec2<f32>(1.0))).r);
    }
  }
  let coverage = clamp(maximum - center, 0.0, 1.0) * selectionOutline.color.a;
  let source = textureSample(sourceTexture, sourceTextureSampler, texCoord);
  return vec4<f32>(mix(source.rgb, selectionOutline.color.rgb, coverage), coverage + source.a * (1.0 - coverage));
}
`,fs:`
layout(std140) uniform selectionOutlineUniforms {
  vec4 color;
  float thickness;
} selectionOutline;
uniform sampler2D selectionTexture;
vec4 selectionOutline_sampleColor(sampler2D sourceTexture, vec2 sourceSize, vec2 texCoord) {
  float center = texture(selectionTexture, texCoord).r;
  vec2 texel = clamp(selectionOutline.thickness, 0.0, 8.0) / (2.0 * vec2(textureSize(selectionTexture, 0)));
  float maximum = center;
  for (int horizontal = -2; horizontal <= 2; horizontal++) {
    for (int vertical = -2; vertical <= 2; vertical++) {
      vec2 offset = vec2(float(horizontal), float(vertical)) * texel;
      maximum = max(maximum, texture(selectionTexture, clamp(texCoord + offset, vec2(0.0), vec2(1.0))).r);
    }
  }
  float coverage = clamp(maximum - center, 0.0, 1.0) * selectionOutline.color.a;
  vec4 source = texture(sourceTexture, texCoord);
  return vec4(mix(source.rgb, selectionOutline.color.rgb, coverage), coverage + source.a * (1.0 - coverage));
}
`,bindingLayout:[{name:"selectionTexture",group:0}],props:{},uniforms:{},uniformTypes:{color:"vec4<f32>",thickness:"f32"},defaultUniforms:{color:[.12,1,.7,.9],thickness:2},passes:[{sampler:!0}]},A=await F();A.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(t=>t.remove());class G{constructor(r){this.capture=r}capture;id="buffer-preview";props={};useInPicking=!1;mode="scene";bloom=!0;edges=!1;selection=!0;strength=.5;renderer;debugRenderer;setup(r){this.renderer=new C({id:this.id,colorFormat:"rgba16float",flipY:!0,shaderPasses:[M({quality:"medium",radius:6,threshold:1.1,intensity:.5,downsample:"render"}),j({normalSource:"normal-texture"}),U,I]}),this.debugRenderer=new C({id:this.id,colorFormat:"rgba16float",flipY:!0,shaderPasses:[N]}),this.renderer.setup(r),this.debugRenderer.setup(r)}preRender(r){}postRender(r){const s=this.capture.getFrame("main");if(!s||!this.renderer||!this.debugRenderer)return r.inputBuffer;const i=this.mode==="previous"&&s.previousBuffer||s.buffer,c=i.colorTexture;return(this.mode==="scene"||this.mode==="previous"?this.renderer:this.debugRenderer).render(r,{sourceTexture:c,bindings:{depthTexture:i.depthTexture,normalTexture:i.normalRoughnessTexture,selectionTexture:i.getExtraColorTexture("selection")},uniforms:{bloomComposite:{intensity:this.bloom?this.strength:0},screenSpaceOutline:{color:[.02,.04,.08,this.edges?.8:0],thickness:1.4,depthThreshold:.003,normalThreshold:.18},selectionOutline:{thickness:this.selection?2:0},toneMapping:{exposure:1.25},bufferPreview:{mode:this.mode==="normals"?1:this.mode==="depth"?2:3}}})}cleanup(){this.renderer?.cleanup(),this.debugRenderer?.cleanup(),this.renderer=void 0,this.debugRenderer=void 0}}const N={name:"bufferPreview",source:`
struct bufferPreviewUniforms { mode: i32, };
@group(0) @binding(auto) var<uniform> bufferPreview: bufferPreviewUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var selectionTexture: texture_2d<f32>;
fn bufferPreview_sampleColor(sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler,
  sourceSize: vec2<f32>, texCoord: vec2<f32>) -> vec4<f32> {
  let dimensions = vec2<i32>(textureDimensions(depthTexture));
  let coordinate = clamp(vec2<i32>(texCoord * vec2<f32>(dimensions)), vec2<i32>(0), dimensions - vec2<i32>(1));
  let depth = textureLoad(depthTexture, coordinate, 0);
  if (bufferPreview.mode == 1) {
    if (depth >= 1.0) { return vec4<f32>(0.02, 0.04, 0.06, 1.0); }
    return vec4<f32>(textureLoad(normalTexture, coordinate, 0).rgb, 1.0);
  }
  if (bufferPreview.mode == 2) { return vec4<f32>(vec3<f32>(1.0 - pow(depth, 30.0)), 1.0); }
  return vec4<f32>(vec3<f32>(textureLoad(selectionTexture, coordinate, 0).r), 1.0);
}
`,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0},{name:"selectionTexture",group:0}],uniformTypes:{mode:"i32"},defaultUniforms:{mode:1},passes:[{sampler:!0}]};function V(t,r={}){const s=B(),i=s.filter(e=>e.kind!=="building"),c=s.filter(e=>e.kind==="building"),p=c.map((e,u)=>({name:`${e.name} beacon`,kind:"building",center:[e.center[0],e.center[1],e.size[2]+1],size:[6,6,5],color:u%2?[6,1.8,.3]:[.3,3,6]})),g=[{name:"Glass pavilion",kind:"building",center:[315,125,0],size:[90,90,125],color:[.12,.8,1]}];let d="East 4.1",b=!0;const f=new q({history:!0,selection:!0,getLayerOptions:e=>({mode:e.id==="glass"?"transparent":"opaque",surfaceBuffer:e.id!=="glass",selected:e.id==="selected"})}),a=new G(f);let T,S;const z=new Promise((e,u)=>{T=e,S=u}),l={frames:0,error:"",selected:d,finalized:!1},w=P(r),n=new R({parent:t,...w,deviceProps:{...w.deviceProps,createCanvasContext:{alphaMode:"opaque"}},views:new L({id:"main",controller:!0}),initialViewState:{...D,longitude:x[0],latitude:x[1],zoom:15.6,pitch:52,bearing:-28},effects:[f,a],layers:[],onLoad:()=>{v(),T()},onAfterRender:()=>{l.frames++},onError:e=>{l.error||=e.message,S(e)},onClick:e=>{e.object?.kind==="building"&&!e.object.name.includes("beacon")&&e.object.name!=="Glass pavilion"&&(d=e.object.name,l.selected=d,v(),t.dispatchEvent(new Event("buffer-selection")))},getTooltip:e=>e.object?.name||null});function v(){const e={coordinateSystem:_.METER_OFFSETS,coordinateOrigin:x,roughness:.7},u=c.filter(h=>h.name===d),y=c.filter(h=>h.name!==d);n.setProps({layers:[new m({id:"context",features:i,data:i,pickable:!0,...e}),new m({id:"buildings",features:y,data:y,pickable:!0,...e}),new m({id:"selected",features:u,data:u,pickable:!0,...e}),new m({id:"lights",features:p,data:p,...e}),new m({id:"glass",features:g,data:g,opacity:.35,visible:b,pickable:!0,parameters:{blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha",depthWriteEnabled:!1},...e})]})}return{deck:n,capture:f,preview:a,ready:z,diagnostics:l,buildings:c,setMode(e){a.mode=e,n.redraw("scene-buffer controls")},setBloom(e){a.bloom=e,n.redraw("scene-buffer controls")},setEdges(e){a.edges=e,n.redraw("scene-buffer controls")},setSelection(e){a.selection=e,n.redraw("scene-buffer controls")},setStrength(e){a.strength=e,n.redraw("scene-buffer controls")},setGlass(e){b=e,v()},resetHistory(){f.resetHistory(),n.redraw("scene-buffer controls")},finalize(){l.finalized||(l.finalized=!0,n.finalize())}}}const k=document.querySelector("#scene"),o=V(k);window.bufferScene=o;const E=document.querySelector("#mode");E.addEventListener("change",()=>{const t=E.value;(t==="scene"||t==="normals"||t==="depth"||t==="selection"||t==="previous")&&o.setMode(t)});for(const[t,r]of[["bloom",o.setBloom],["edges",o.setEdges],["selection",o.setSelection],["glass",o.setGlass]]){const s=document.querySelector(`#${t}`);s.addEventListener("change",()=>r(s.checked))}const O=document.querySelector("#strength");O.addEventListener("input",()=>o.setStrength(Number(O.value)));document.querySelector("#reset-history").addEventListener("click",()=>o.resetHistory());k.addEventListener("buffer-selection",()=>{document.querySelector("#selected").textContent=o.diagnostics.selected});o.ready.then(()=>{document.body.dataset.ready="true"}).catch(t=>{document.querySelector("#status").textContent=t.message});window.addEventListener("pagehide",()=>o.finalize());
