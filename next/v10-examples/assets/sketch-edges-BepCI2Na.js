import{L as q,M as D,p as F,l as j,m as A,h as G,r as B}from"./deck-example-device-CdE0szkY.js";import{m as $,a as L,S as H}from"./river-district-edges-BFb_Xh7-.js";import{a as K,m as U,C as f}from"./river-district-data-C9FvyLLC.js";import{R as W}from"./riverfront-view-CB3JCqMN.js";import{p as X}from"./project32-CG43RM8l.js";import"./sketch-stroke-xlqZMOgT.js";class M extends q{static layerName="BuildingMeshLayer";getAttributeManager(){return null}initializeState(){}updateState({props:t,oldProps:n}){if(this.state.model&&t.features===n.features)return;this.destroyMesh();const g=K(t.features),s=this.context.device.createBuffer({data:g});try{const d=new D(this.context.device,{...this.getShaders({source:Y,vs:Z,fs:J,modules:[X,F]}),id:`${this.id}-mesh`,topology:"triangle-list",vertexCount:g.length/10,bufferLayout:[{name:"vertices",byteStride:40,attributes:[{attribute:"position",format:"float32x3",byteOffset:0},{attribute:"normal",format:"float32x3",byteOffset:12},{attribute:"color",format:"float32x3",byteOffset:24},{attribute:"featureIndex",format:"float32",byteOffset:36}]}],attributes:{vertices:s},parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}});this.setState({model:d,vertices:s})}catch(d){throw s.destroy(),d}}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:t}){this.state.model?.draw(t)}getPickingInfo({info:t}){return t.object=this.props.features[t.index],t}finalizeState(t){this.destroyMesh(),super.finalizeState(t)}destroyMesh(){this.state.model?.destroy(),this.state.vertices?.destroy(),this.setState({model:void 0,vertices:void 0})}}const Y=`
struct CityVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) worldPosition: vec3<f32>,
};
@vertex fn vertexMain(
  @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>, @location(3) featureIndex: f32
) -> CityVertex {
  var output: CityVertex;
  output.position = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  output.color = color * (0.45 + 0.55 * max(dot(normal, normalize(vec3<f32>(-0.5, -0.3, 0.8))), 0.0));
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  output.worldPosition = position;
  return output;
}
fn buildingMottleNoise(coordinate: vec2<f32>) -> f32 {
  let cell = floor(coordinate);
  var fraction = fract(coordinate);
  fraction = fraction * fraction * (vec2<f32>(3.0) - 2.0 * fraction);
  let first = fract(sin(dot(cell, vec2<f32>(127.1, 311.7))) * 43758.5453);
  let second = fract(sin(dot(cell + vec2<f32>(1.0, 0.0), vec2<f32>(127.1, 311.7))) * 43758.5453);
  let third = fract(sin(dot(cell + vec2<f32>(0.0, 1.0), vec2<f32>(127.1, 311.7))) * 43758.5453);
  let fourth = fract(sin(dot(cell + vec2<f32>(1.0, 1.0), vec2<f32>(127.1, 311.7))) * 43758.5453);
  return mix(mix(first, second, fraction.x), mix(third, fourth, fraction.x), fraction.y);
}
@fragment fn fragmentMain(input: CityVertex) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  let mottle = buildingMottleNoise(input.worldPosition.xy * 0.12) * 0.55 +
    buildingMottleNoise(input.worldPosition.xz * 0.12) * 0.25 +
    buildingMottleNoise(input.worldPosition.yz * 0.12) * 0.2;
  var color = input.color * (0.84 + mottle * 0.22);
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return vec4<f32>(color, layer.opacity);
}
`,Z=`#version 300 es
in vec3 position;
in vec3 normal;
in vec3 color;
in float featureIndex;
out vec4 vertexColor;
out vec3 worldPosition;
void main() {
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  worldPosition = position;
  float light = 0.45 + 0.55 * max(dot(normal, normalize(vec3(-0.5, -0.3, 0.8))), 0.0);
  vertexColor = vec4(color * light, layer.opacity);
  DECKGL_FILTER_COLOR(vertexColor, geometry);
}
`,J=`#version 300 es
precision highp float;
in vec4 vertexColor;
in vec3 worldPosition;
out vec4 fragColor;
float buildingMottleNoise(vec2 coordinate) {
  vec2 cell = floor(coordinate);
  vec2 fraction = fract(coordinate);
  fraction = fraction * fraction * (3.0 - 2.0 * fraction);
  float first = fract(sin(dot(cell, vec2(127.1, 311.7))) * 43758.5453);
  float second = fract(sin(dot(cell + vec2(1.0, 0.0), vec2(127.1, 311.7))) * 43758.5453);
  float third = fract(sin(dot(cell + vec2(0.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  float fourth = fract(sin(dot(cell + vec2(1.0, 1.0), vec2(127.1, 311.7))) * 43758.5453);
  return mix(mix(first, second, fraction.x), mix(third, fourth, fraction.x), fraction.y);
}
void main() {
  float mottle = buildingMottleNoise(worldPosition.xy * 0.12) * 0.55 +
    buildingMottleNoise(worldPosition.xz * 0.12) * 0.25 +
    buildingMottleNoise(worldPosition.yz * 0.12) * 0.2;
  fragColor = vec4(vertexColor.rgb * (0.84 + mottle * 0.22), vertexColor.a);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;function Q(a,t={}){const n=$().map(e=>{const i=(e.color[0]+e.color[1]+e.color[2])/3;return{...e,color:[i*.96,i*.94,i*.9]}}),g=U().filter(e=>e.kind!=="building");let s="light",d=w(s),m={angleThreshold:30},u=L(n,m),C,k;const N=new Promise((e,i)=>{C=e,k=i}),c={frames:0,backend:"",error:"",selected:"",finalized:!1,edgeCount:u.length/8};let r=null,p={width:3.1,jitter:.65,grain:.9,variation:.45,extension:5},v=!0,S=!1,E=!0;const h=new j({parent:a,...G(t),views:new A({controller:!0}),initialViewState:{...W,longitude:f[0],latitude:f[1],zoom:15.6,pitch:52,bearing:-28},layers:[],onDeviceInitialized:e=>{c.backend=e.type,r=e.createBuffer({id:"building-edges",data:u})},onLoad:()=>{l(),C()},onAfterRender:()=>{c.frames++},onError:e=>{c.error=e.message,k(e)},onClick:e=>{c.selected=e.object?.name||""},getTooltip:e=>e.object?.name||null});function l(){h.setProps({layers:[new M({id:"surroundings",features:d,data:d,visible:E,coordinateSystem:"meter-offsets",coordinateOrigin:f}),new M({id:"buildings",features:n,data:n,pickable:!0,opacity:.34,visible:S,coordinateSystem:"meter-offsets",coordinateOrigin:f}),v&&r&&new H({id:"sketch-edges",segments:r,segmentCount:u.length/8,data:n,color:[48,44,40,255],style:p,visible:v,coordinateOrigin:f,pickable:!0})]})}return{deck:h,features:n,diagnostics:c,ready:N,get segments(){return r},setStyle(e){p={...p,...e},l()},setEdgeOptions(e){if(m={...m,...e},!r)return;u=L(n,m),c.edgeCount=u.length/8;const i=r;r=i.device.createBuffer({id:"building-edges",data:u}),l(),i.destroy()},setContextVisible(e){E=e,l()},setGroundTone(e){s!==e&&(s=e,d=w(s),l())},setEdgesVisible(e){v=e,l()},setFillsVisible(e){S=e,l()},rebuildLayers(){l()},finalize(){c.finalized||(c.finalized=!0,h.finalize(),r?.destroy(),r=null)}};function w(e){const i=e==="light"?[.78,.77,.73]:[.17,.23,.27];return g.map(y=>y.kind==="ground"?{...y,color:i}:y)}}const ee=document.querySelector("#scene"),b=document.querySelector("#backend"),T=await B(new URLSearchParams(location.search).get("backend"));b.value=T;const o=Q(ee,{deviceType:T});window.sketchScene=o;b.addEventListener("change",()=>{location.search=`?backend=${b.value}`});const _=document.querySelector("#style");_.addEventListener("change",()=>{o.setStyle({sketch:_.value==="sketch"?1:0})});for(const a of["width","jitter","grain","extension"]){const t=document.querySelector(`#${a}`);t.addEventListener("input",()=>o.setStyle({[a]:Number(t.value)}))}const P=document.querySelector("#edges");P.addEventListener("change",()=>o.setEdgesVisible(P.checked));const I=document.querySelector("#fills");I.addEventListener("change",()=>o.setFillsVisible(I.checked));const O=document.querySelector("#context");O.addEventListener("change",()=>o.setContextVisible(O.checked));const R=document.querySelector("#ground");R.addEventListener("change",()=>o.setGroundTone(R.value));const z=document.querySelector("#edge-mode");z.addEventListener("change",()=>{o.setEdgeOptions({includeCoplanarEdges:z.value==="triangles"}),x()});const V=document.querySelector("#angle");V.addEventListener("input",()=>{o.setEdgeOptions({angleThreshold:Number(V.value)}),x()});function x(){document.querySelector("#edge-count").textContent=`${o.features.length} buildings · ${o.diagnostics.edgeCount} edges`}o.ready.then(()=>{document.body.dataset.ready="true",x()}).catch(a=>{document.querySelector("#status").textContent=a.message});window.addEventListener("pagehide",()=>o.finalize());
