import{L as E,M as S,p as k,h as L,j as T,b as I,c as m,r as M}from"./deck-example-device-TQPRJnZ6.js";import{i as R}from"./example-support-KHcxfZf7.js";import{a as O,m as v,C as d}from"./river-district-data-C9FvyLLC.js";import{R as P}from"./riverfront-view-CB3JCqMN.js";import{p as z}from"./project32-Byi-VnKS.js";const A=`
layout(std140) uniform patternFillUniforms {
  int patternType;
  float spacing;
  float width;
  float angle;
  vec2 offset;
} patternFill;

// Integral of a unit-period pulse. Filtering the integral preserves mean coverage at distance.
float patternFill_integral(float coordinate, float width) {
  return floor(coordinate) * width + min(fract(coordinate), width);
}
float patternFill_stripe(float coordinate, float footprint, float width) {
  float extent = max(footprint, 0.0001);
  float center = fract(coordinate + width * 0.5);
  return clamp((patternFill_integral(center + extent * 0.5, width) -
    patternFill_integral(center - extent * 0.5, width)) / extent, 0.0, 1.0);
}

float patternFill_getCoverage(vec2 coordinates) {
  float cosine = cos(patternFill.angle);
  float sine = sin(patternFill.angle);
  vec2 local = coordinates - patternFill.offset;
  vec2 rotated = vec2(dot(local, vec2(cosine, sine)), dot(local, vec2(-sine, cosine)));
  vec2 phase = rotated / max(patternFill.spacing, 0.0001);
  // Evaluate derivatives before pattern selection so WGSL and GLSL use the same footprint.
  vec2 footprint = fwidth(phase);
  float width = clamp(patternFill.width, 0.0, 1.0);
  float first = patternFill_stripe(phase.x, footprint.x, width);
  float second = patternFill_stripe(phase.y, footprint.y, width);
  vec2 cell = fract(phase + 0.5) - 0.5;
  float radius = width * 0.5;
  float dots = clamp(0.5 + (radius - length(cell)) / max(length(footprint), 0.0001), 0.0, 1.0);
  float dotMean = 3.141592653589793 * radius * radius;
  dots = mix(dots, dotMean, smoothstep(0.35, 1.0, max(footprint.x, footprint.y)));
  if (width <= 0.0) return 0.0;
  if (patternFill.patternType == 2) return dots;
  if (patternFill.patternType == 1) return first + second - first * second;
  return first;
}
`,D=`
struct patternFillUniforms {
  patternType: i32,
  spacing: f32,
  width: f32,
  angle: f32,
  offset: vec2<f32>,
};
@group(3) @binding(auto) var<uniform> patternFill: patternFillUniforms;

fn patternFill_integral(coordinate: f32, width: f32) -> f32 {
  return floor(coordinate) * width + min(fract(coordinate), width);
}
fn patternFill_stripe(coordinate: f32, footprint: f32, width: f32) -> f32 {
  let extent = max(footprint, 0.0001);
  let center = fract(coordinate + width * 0.5);
  return clamp((patternFill_integral(center + extent * 0.5, width) -
    patternFill_integral(center - extent * 0.5, width)) / extent, 0.0, 1.0);
}

fn patternFill_getCoverage(coordinates: vec2<f32>) -> f32 {
  let cosine = cos(patternFill.angle);
  let sine = sin(patternFill.angle);
  let local = coordinates - patternFill.offset;
  let rotated = vec2<f32>(dot(local, vec2<f32>(cosine, sine)), dot(local, vec2<f32>(-sine, cosine)));
  let phase = rotated / max(patternFill.spacing, 0.0001);
  let footprint = fwidth(phase);
  let width = clamp(patternFill.width, 0.0, 1.0);
  let first = patternFill_stripe(phase.x, footprint.x, width);
  let second = patternFill_stripe(phase.y, footprint.y, width);
  let cell = fract(phase + 0.5) - 0.5;
  let radius = width * 0.5;
  var dots = clamp(0.5 + (radius - length(cell)) / max(length(footprint), 0.0001), 0.0, 1.0);
  let dotMean = 3.141592653589793 * radius * radius;
  dots = mix(dots, dotMean, smoothstep(0.35, 1.0, max(footprint.x, footprint.y)));
  if (width <= 0.0) { return 0.0; }
  if (patternFill.patternType == 2) { return dots; }
  if (patternFill.patternType == 1) { return first + second - first * second; }
  return first;
}
`,f={patternType:0,spacing:8,width:.12,angle:Math.PI/4,offset:[0,0]},G={name:"patternFill",firstBindingSlot:0,bindingLayout:[{name:"patternFill",group:3}],source:D,fs:A,uniformTypes:{patternType:"i32",spacing:"f32",width:"f32",angle:"f32",offset:"vec2<f32>"},defaultUniforms:f,getUniforms(t={},o=f){const i={...f,...o};return t.pattern!==void 0&&(i.patternType={hatch:0,crosshatch:1,dots:2}[t.pattern]),t.spacing!==void 0&&(i.spacing=Math.max(t.spacing,1e-4)),t.width!==void 0&&(i.width=Math.min(1,Math.max(0,t.width))),t.angle!==void 0&&(i.angle=t.angle),t.offset!==void 0&&(i.offset=t.offset),i}},N=await R();N.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(t=>t.remove());class y extends E{static layerName="BuildingMeshLayer";getAttributeManager(){return null}initializeState(){}updateState({props:o,oldProps:i}){if(this.state.model&&o.features===i.features)return;this.destroyMesh();const a=O(o.features),n=this.context.device.createBuffer({data:a});try{const s=new S(this.context.device,{...this.getShaders({source:j,vs:q,fs:U,modules:[z,k,G]}),id:`${this.id}-mesh`,topology:"triangle-list",vertexCount:a.length/10,bufferLayout:[{name:"vertices",byteStride:40,attributes:[{attribute:"position",format:"float32x3",byteOffset:0},{attribute:"normal",format:"float32x3",byteOffset:12},{attribute:"color",format:"float32x3",byteOffset:24},{attribute:"featureIndex",format:"float32",byteOffset:36}]}],attributes:{vertices:n},parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}});this.setState({model:s,vertices:n})}catch(s){throw n.destroy(),s}}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:o}){this.state.model?.shaderInputs.setProps({patternFill:this.props.pattern}),this.state.model?.draw(o)}getPickingInfo({info:o}){return o.object=this.props.features[o.index],o}finalizeState(o){this.destroyMesh(),super.finalizeState(o)}destroyMesh(){this.state.model?.destroy(),this.state.vertices?.destroy(),this.setState({model:void 0,vertices:void 0})}}const j=`
struct CityVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) coordinates: vec2<f32>,
};
@vertex fn vertexMain(
  @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>, @location(3) featureIndex: f32
) -> CityVertex {
  var output: CityVertex;
  output.position = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  output.color = color * (0.45 + 0.55 * max(dot(normal, normalize(vec3<f32>(-0.5, -0.3, 0.8))), 0.0));
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  output.coordinates = position.xy;
  if (abs(normal.x) > 0.5) { output.coordinates = position.yz; }
  else if (abs(normal.y) > 0.5) { output.coordinates = position.xz; }
  return output;
}
@fragment fn fragmentMain(input: CityVertex) -> @location(0) vec4<f32> {
  let coverage = patternFill_getCoverage(input.coordinates);
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  var color = mix(input.color, input.color * 0.18, coverage);
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return vec4<f32>(color, layer.opacity);
}
`,q=`#version 300 es
in vec3 position;
in vec3 normal;
in vec3 color;
in float featureIndex;
out vec4 vertexColor;
out vec2 patternCoordinates;
void main() {
  patternCoordinates = position.xy;
  if (abs(normal.x) > 0.5) patternCoordinates = position.yz;
  else if (abs(normal.y) > 0.5) patternCoordinates = position.xz;
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  float light = 0.45 + 0.55 * max(dot(normal, normalize(vec3(-0.5, -0.3, 0.8))), 0.0);
  vertexColor = vec4(color * light, layer.opacity);
  DECKGL_FILTER_COLOR(vertexColor, geometry);
}
`,U=`#version 300 es
precision highp float;
in vec4 vertexColor;
in vec2 patternCoordinates;
out vec4 fragColor;
void main() {
  float coverage = patternFill_getCoverage(patternCoordinates);
  fragColor = vec4(mix(vertexColor.rgb, vertexColor.rgb * 0.18, coverage), vertexColor.a);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;function V(t,o={}){const i=v().filter(e=>e.kind==="building"),a=v().filter(e=>e.kind!=="building");let n={pattern:"hatch",spacing:8,width:.2,angle:Math.PI/4},s=!0,g,h;const b=new Promise((e,_)=>{g=e,h=_}),r={frames:0,backend:"",error:"",selected:"",finalized:!1},p=new L({parent:t,...I(o),views:new T({controller:!0}),initialViewState:{...P,longitude:d[0],latitude:d[1],zoom:15.6,pitch:52,bearing:-28},layers:[],onDeviceInitialized:e=>{r.backend=e.type},onLoad:()=>{c(),g()},onAfterRender:()=>{r.frames++},onError:e=>{r.error=e.message,h(e)},onClick:e=>{r.selected=e.object?.name||"",t.dispatchEvent(new Event("pattern-selection"))},getTooltip:e=>e.object?.name||null});function c(){p.setProps({layers:[new y({id:"surroundings",features:a,data:a,pattern:{width:0},coordinateSystem:m.METER_OFFSETS,coordinateOrigin:d}),new y({id:"buildings",features:i,data:i,pattern:{...n,width:s?n.width:0},pickable:!0,coordinateSystem:m.METER_OFFSETS,coordinateOrigin:d})]})}return{deck:p,features:i,diagnostics:r,ready:b,setPattern(e){n={...n,...e},c()},setEnabled(e){s=e,c()},rebuildLayers:c,finalize(){r.finalized||(r.finalized=!0,p.finalize())}}}const F=document.querySelector("#scene"),u=document.querySelector("#backend"),C=await M(new URLSearchParams(location.search).get("backend"));u.value=C;const l=V(F,{deviceType:C});window.patternScene=l;u.addEventListener("change",()=>{location.search=`?backend=${u.value}`});const x=document.querySelector("#enabled");x.addEventListener("change",()=>l.setEnabled(x.checked));const w=document.querySelector("#pattern");w.addEventListener("change",()=>{const t=w.value;(t==="hatch"||t==="crosshatch"||t==="dots")&&l.setPattern({pattern:t})});for(const t of["spacing","width","angle"]){const o=document.querySelector(`#${t}`);o.addEventListener("input",()=>{const i=Number(o.value)*(t==="angle"?Math.PI/180:1),a={[t]:i};l.setPattern(a)})}F.addEventListener("pattern-selection",()=>{document.querySelector("#selection").textContent=l.diagnostics.selected||"Click a building to inspect"});l.ready.then(()=>{document.body.dataset.ready="true"}).catch(t=>{document.querySelector("#status").textContent=t.message});window.addEventListener("pagehide",()=>l.finalize());
