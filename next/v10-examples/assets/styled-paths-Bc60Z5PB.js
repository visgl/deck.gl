import{e as N,n as lt,L as ot,M as at,p as nt,h as pt,j as ht,b as gt,c as dt,r as ft}from"./deck-example-device-TQPRJnZ6.js";import{i as ut}from"./example-support-KHcxfZf7.js";import{a as mt,m as yt,C as j}from"./river-district-data-C9FvyLLC.js";import{R as vt}from"./riverfront-view-CB3JCqMN.js";import{p as rt}from"./project32-Byi-VnKS.js";import{s as kt}from"./sketch-stroke-xlqZMOgT.js";import{p as St}from"./point-glow-DAMvtmjx.js";const q={dashLength:12,gapLength:8,offset:0},Ct={name:"pathDash",bindingLayout:[{name:"pathDash",group:3}],firstBindingSlot:0,uniformTypes:{dashLength:"f32",gapLength:"f32",offset:"f32"},defaultUniforms:q,getUniforms(o={},a=q){const c={...q,...a};return o.dashLength!==void 0&&(c.dashLength=Math.max(0,o.dashLength)),o.gapLength!==void 0&&(c.gapLength=Math.max(0,o.gapLength)),o.offset!==void 0&&(c.offset=o.offset),c},fs:`
layout(std140) uniform pathDashUniforms {
  float dashLength;
  float gapLength;
  float offset;
} pathDash;
float pathDash_integral(float coordinate, float fraction) {
  return floor(coordinate) * fraction + min(fract(coordinate), fraction);
}
float pathDash_getCoverage(float distanceAlongPath) {
  float period = max(pathDash.dashLength + pathDash.gapLength, 0.0001);
  float coordinate = (distanceAlongPath + pathDash.offset) / period;
  float extent = max(fwidth(coordinate), 0.0001);
  float center = fract(coordinate);
  float fraction = pathDash.dashLength / period;
  float coverage = (pathDash_integral(center + extent * 0.5, fraction) - pathDash_integral(center - extent * 0.5, fraction)) / extent;
  if (pathDash.gapLength <= 0.0) return 1.0;
  if (pathDash.dashLength <= 0.0) return 0.0;
  return clamp(coverage, 0.0, 1.0);
}
`,source:`
struct pathDashUniforms {
  dashLength: f32,
  gapLength: f32,
  offset: f32,
};
@group(3) @binding(auto) var<uniform> pathDash: pathDashUniforms;
fn pathDash_integral(coordinate: f32, fraction: f32) -> f32 {
  return floor(coordinate) * fraction + min(fract(coordinate), fraction);
}
fn pathDash_getCoverage(distanceAlongPath: f32) -> f32 {
  let period = max(pathDash.dashLength + pathDash.gapLength, 0.0001);
  let coordinate = (distanceAlongPath + pathDash.offset) / period;
  let extent = max(fwidth(coordinate), 0.0001);
  let center = fract(coordinate);
  let fraction = pathDash.dashLength / period;
  let coverage = (pathDash_integral(center + extent * 0.5, fraction) - pathDash_integral(center - extent * 0.5, fraction)) / extent;
  if (pathDash.gapLength <= 0.0) { return 1.0; }
  if (pathDash.dashLength <= 0.0) { return 0.0; }
  return clamp(coverage, 0.0, 1.0);
}
`};function bt(o,a={}){const{width:c=1,cap:u="butt",join:m="miter",miterLimit:C=4,roundSegments:S=16}=a;N(Number.isFinite(c)&&c>=0&&Number.isFinite(C)&&C>=1),N(Number.isInteger(S)&&S>=2&&S<=256);const n=[];for(const e of o){N(Number.isFinite(e[0])&&Number.isFinite(e[1])&&Number.isFinite(e[2]??0));const t=n.at(-1);(!t||t[0]!==e[0]||t[1]!==e[1])&&n.push([e[0],e[1],e[2]??0])}a.closed&&n.length>1&&n[0][0]===n.at(-1)[0]&&n[0][1]===n.at(-1)[1]&&n.pop();const E=!!(a.closed&&n.length>2),h=[],_=[],i=c/2;if(n.length>1&&c>0){const e=[],t=[0];for(let r=0;r<n.length-(E?0:1);r++){const l=n[r],b=n[(r+1)%n.length],y=b[0]-l[0],p=b[1]-l[1],g=Math.hypot(y,p);e.push({direction:[y/g,p/g],length:g}),t.push(t.at(-1)+g)}const s=n.map((r,l)=>{const b=e[(l-1+e.length)%e.length],y=e[l%e.length],p=t[l];if(!E&&(l===0||l===n.length-1)){const I=l===0?y.direction:b.direction,D=u==="square"?l===0?-i:i:0,F=d(r,I,i,D,p+D),P=d(r,I,-i,D,p+D);return u==="round"&&x(r,I,p,l===0),{incomingLeft:F,outgoingLeft:F,incomingRight:P,outgoingRight:P}}const g=b.direction,f=y.direction,R=g[0]*f[1]-g[1]*f[0],T=g[0]*f[0]+g[1]*f[1],w={incomingLeft:d(r,g,i,0,p),incomingRight:d(r,g,-i,0,p),outgoingLeft:d(r,f,i,0,p),outgoingRight:d(r,f,-i,0,p)};if(1+T<1e-8)return m==="round"&&(x(r,g,p,!1),x(r,f,p,!0)),w;const M=[-(g[1]+f[1])*i/(1+T),(g[0]+f[0])*i/(1+T)],B=Math.hypot(...M);if(Math.abs(R)<1e-8||m==="miter"&&B<=C*i){const I=L(r,M,p,i),D=L(r,[-M[0],-M[1]],p,-i);return{incomingLeft:I,outgoingLeft:I,incomingRight:D,outgoingRight:D}}const O=Math.sign(R),H=Math.min(1,Math.min(b.length,y.length)/(2*B)),A=L(r,[M[0]*O*H,M[1]*O*H],p,i*O);O>0?(w.incomingLeft=A,w.outgoingLeft=A):(w.incomingRight=A,w.outgoingRight=A);const G=O>0?w.incomingRight:w.incomingLeft,W=O>0?w.outgoingRight:w.outgoingLeft;if(m==="round"){const I=Math.atan2(R,T),D=Math.atan2(G.position[1]-r[1],G.position[0]-r[0]),F=Math.max(1,Math.ceil(Math.abs(I)/Math.PI*S));let P=G;for(let z=1;z<=F;z++){const X=D+I*z/F,Y=z===F?W:L(r,[Math.cos(X)*i,Math.sin(X)*i],p,-i*O);k(A,P,Y),P=Y}}else k(A,G,W);return w});e.forEach((r,l)=>{const b=s[l],y=s[(l+1)%s.length],p=E&&l===e.length-1,g=p?{...y.incomingLeft,distance:t.at(-1)}:y.incomingLeft,f=p?{...y.incomingRight,distance:t.at(-1)}:y.incomingRight;k(b.outgoingLeft,b.outgoingRight,g),k(b.outgoingRight,f,g)})}return new lt({id:a.id,topology:"triangle-list",attributes:{POSITION:{size:3,value:new Float32Array(h)},TEXCOORD_0:{size:2,value:new Float32Array(_)}}});function k(e,t,s){const r=(t.position[0]-e.position[0])*(s.position[1]-e.position[1])-(t.position[1]-e.position[1])*(s.position[0]-e.position[0]);if(r!==0)for(const l of r>0?[e,t,s]:[e,s,t])h.push(...l.position),_.push(l.distance,l.across)}function L(e,t,s,r){return{position:[e[0]+t[0],e[1]+t[1],e[2]],distance:s,across:r}}function d(e,t,s,r,l){return L(e,[-t[1]*s+t[0]*r,t[0]*s+t[1]*r],l,s)}function x(e,t,s,r){const l={position:e,distance:s,across:0},b=Math.atan2(t[1],t[0])+(r?-Math.PI/2:Math.PI/2);let y;for(let p=0;p<=S;p++){const g=b-Math.PI*p/S,f=[Math.cos(g)*i,Math.sin(g)*i],R=L(e,f,s+f[0]*t[0]+f[1]*t[1],-f[0]*t[1]+f[1]*t[0]);y&&k(l,y,R),y=R}}}const Lt=await ut();Lt.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(o=>o.remove());class xt extends ot{static layerName="BuildingMeshLayer";getAttributeManager(){return null}initializeState(){}updateState({props:a,oldProps:c}){if(this.state.model&&a.features===c.features)return;this.destroyMesh();const u=mt(a.features),m=this.context.device.createBuffer({data:u});try{const C=new at(this.context.device,{...this.getShaders({source:wt,vs:Et,fs:_t,modules:[rt,nt]}),id:`${this.id}-mesh`,topology:"triangle-list",vertexCount:u.length/10,bufferLayout:[{name:"vertices",byteStride:40,attributes:[{attribute:"position",format:"float32x3",byteOffset:0},{attribute:"normal",format:"float32x3",byteOffset:12},{attribute:"color",format:"float32x3",byteOffset:24},{attribute:"featureIndex",format:"float32",byteOffset:36}]}],attributes:{vertices:m},parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}});this.setState({model:C,vertices:m})}catch(C){throw m.destroy(),C}}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:a}){this.state.model?.draw(a)}getPickingInfo({info:a}){return a.object=this.props.features[a.index],a}finalizeState(a){this.destroyMesh(),super.finalizeState(a)}destroyMesh(){this.state.model?.destroy(),this.state.vertices?.destroy(),this.setState({model:void 0,vertices:void 0})}}const wt=`
struct CityVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
};
@vertex fn vertexMain(
  @location(0) position: vec3<f32>, @location(1) normal: vec3<f32>,
  @location(2) color: vec3<f32>, @location(3) featureIndex: f32
) -> CityVertex {
  var output: CityVertex;
  output.position = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  output.color = color * (0.45 + 0.55 * max(dot(normal, normalize(vec3<f32>(-0.5, -0.3, 0.8))), 0.0));
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  return output;
}
@fragment fn fragmentMain(input: CityVertex) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  var color = input.color;
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return vec4<f32>(color, layer.opacity);
}
`,Et=`#version 300 es
in vec3 position;
in vec3 normal;
in vec3 color;
in float featureIndex;
out vec4 vertexColor;
void main() {
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  float light = 0.45 + 0.55 * max(dot(normal, normalize(vec3(-0.5, -0.3, 0.8))), 0.0);
  vertexColor = vec4(color * light, layer.opacity);
  DECKGL_FILTER_COLOR(vertexColor, geometry);
}
`,_t=`#version 300 es
precision highp float;
in vec4 vertexColor;
out vec4 fragColor;
void main() {
  fragColor = vertexColor;
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`,It={name:"strokeStyle",bindingLayout:[{name:"strokeStyle",group:3}],source:`struct StrokeStyleUniforms {
  width: f32,
  appearance: f32,
  cap: f32,
  intensity: f32,
};
@group(3) @binding(auto) var<uniform> strokeStyle: StrokeStyleUniforms;`,fs:`layout(std140) uniform strokeStyleUniforms {
  float width;
  float appearance;
  float cap;
  float intensity;
} strokeStyle;`,uniformTypes:{width:"f32",appearance:"f32",cap:"f32",intensity:"f32"},defaultUniforms:{width:1,appearance:0,cap:0,intensity:1}},it={depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaOperation:"add",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},Dt={...it,blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaSrcFactor:"zero",blendAlphaDstFactor:"one"};function st(o){return o==="glow"?Dt:it}class Ot extends ot{static layerName="StrokeMeshLayer";getAttributeManager(){return null}initializeState(){}updateState({props:a,oldProps:c}){if(this.state.model&&a.routes===c.routes&&a.geometryOptions===c.geometryOptions&&a.appearance===c.appearance)return;this.destroyMesh();const u=[],m=a.geometryOptions.width??1,C=a.appearance==="glow"?4:a.appearance==="sketch"?2:1;a.routes.forEach((n,E)=>{const h=n.path.filter((e,t)=>t===0||e[0]!==n.path[t-1][0]||e[1]!==n.path[t-1][1]);n.closed&&h.length>1&&h[0][0]===h.at(-1)[0]&&h[0][1]===h.at(-1)[1]&&h.pop();const _=!!(n.closed&&h.length>2);let i=0;for(let e=1;e<h.length+Number(_);e++){const t=h[e%h.length],s=h[e-1];i+=Math.hypot(t[0]-s[0],t[1]-s[1])}let k=2166136261;for(const e of n.name)k=Math.imul(k^e.charCodeAt(0),16777619);k=n.seed??(k>>>0)%1024;const L=bt(h,{...a.geometryOptions,width:m*C,closed:_}),d=L.attributes.POSITION.value,x=L.attributes.TEXCOORD_0.value;for(let e=0;e<d.length/3;e++)u.push(d[e*3],d[e*3+1],d[e*3+2],x[e*2],x[e*2+1],...n.color,E,i,k,Number(_))});const S=this.context.device.createBuffer({data:u.length?new Float32Array(u):new Float32Array(12)});try{const n=new at(this.context.device,{...this.getShaders({source:Rt,vs:Mt,fs:At,modules:[rt,nt,Ct,kt,St,It]}),id:`${this.id}-mesh`,topology:"triangle-list",vertexCount:u.length/12,bufferLayout:[{name:"vertices",byteStride:48,attributes:[{attribute:"position",format:"float32x3",byteOffset:0},{attribute:"coordinates",format:"float32x2",byteOffset:12},{attribute:"color",format:"float32x3",byteOffset:20},{attribute:"pathInformation",format:"float32x4",byteOffset:32}]}],attributes:{vertices:S},parameters:st(a.appearance)});this.setState({model:n,vertices:S})}catch(n){throw S.destroy(),n}}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:a}){const c=this.props.geometryOptions.width??1,u=this.props.geometryOptions.cap??"butt";this.state.model?.shaderInputs.setProps({pathDash:this.props.dash,sketchStroke:{width:c,jitter:c*.12,variation:.35,grain:this.props.grain,extension:c,minimumAntialias:0,sketch:1},pointGlow:{coreRadius:.14,coreIntensity:.7,haloIntensity:.6,falloff:5},strokeStyle:{width:c,appearance:this.props.appearance==="glow"?2:this.props.appearance==="sketch"?1:0,cap:u==="round"?2:u==="square"?1:0,intensity:this.props.glowIntensity}}),this.state.model?.draw(a)}getPickingInfo({info:a}){return a.object=this.props.routes[a.index],a}finalizeState(a){this.destroyMesh(),super.finalizeState(a)}destroyMesh(){this.state.model?.destroy(),this.state.vertices?.destroy(),this.setState({model:void 0,vertices:void 0})}}const Rt=`
struct StrokeVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec3<f32>,
  @location(1) @interpolate(flat) pickingColor: vec3<f32>,
  @location(2) coordinates: vec2<f32>,
  @location(3) @interpolate(flat) pathInformation: vec3<f32>,
};
@vertex fn vertexMain(@location(0) position: vec3<f32>, @location(1) coordinates: vec2<f32>,
  @location(2) color: vec3<f32>, @location(3) pathInformation: vec4<f32>) -> StrokeVertex {
  var output: StrokeVertex;
  output.position = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  output.color = color;
  output.pickingColor = picking_getPickingColorFromIndex(u32(pathInformation.x));
  output.coordinates = coordinates;
  output.pathInformation = pathInformation.yzw;
  return output;
}
@fragment fn fragmentMain(input: StrokeVertex) -> @location(0) vec4<f32> {
  let pathLength = max(input.pathInformation.x, 0.0001);
  let endDistance = select(max(max(-input.coordinates.x, input.coordinates.x - pathLength), 0.0), 0.0, input.pathInformation.z > 0.5);
  var across = input.coordinates.y;
  if (strokeStyle.cap > 1.5) {
    across = select(-1.0, 1.0, across >= 0.0) * length(vec2<f32>(endDistance, across));
  } else if (strokeStyle.cap > 0.5) {
    across = select(-1.0, 1.0, across >= 0.0) * max(endDistance, abs(across));
  }
  var coverage = pathDash_getCoverage(input.coordinates.x);
  let pencil = sketchStroke_getCoverage(vec2<f32>(clamp(input.coordinates.x / pathLength, 0.0, 1.0), across), pathLength, input.pathInformation.y);
  if (strokeStyle.appearance > 0.5 && strokeStyle.appearance < 1.5) { coverage *= pencil; }
  let radiance = pointGlow_getColor(vec2<f32>(0.0, across / max(strokeStyle.width * 2.0, 0.0001)), input.color) * coverage * layer.opacity * strokeStyle.intensity;
  if (coverage <= 0.01 || layer.opacity <= 0.0 || (strokeStyle.appearance > 1.5 && strokeStyle.intensity <= 0.0)) { discard; }
  if (picking.isActive > 0.5) {
    if (strokeStyle.appearance > 1.5 && abs(across) > strokeStyle.width * 0.5) { discard; }
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  var color = select(input.color, radiance, strokeStyle.appearance > 1.5);
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    let energy = select(1.0, max(max(color.r, color.g), color.b), strokeStyle.appearance > 1.5);
    color = mix(color, picking.highlightColor.rgb * energy, picking.highlightColor.a);
  }
  return vec4<f32>(color, select(coverage * layer.opacity, 0.0, strokeStyle.appearance > 1.5));
}
`,Mt=`#version 300 es
in vec3 position;
in vec2 coordinates;
in vec3 color;
in vec4 pathInformation;
out vec4 vertexColor;
out vec2 strokeCoordinates;
flat out vec3 strokePathInformation;
void main() {
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(pathInformation.x);
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vertexColor = vec4(color, layer.opacity);
  strokeCoordinates = coordinates;
  strokePathInformation = pathInformation.yzw;
  DECKGL_FILTER_COLOR(vertexColor, geometry);
}
`,At=`#version 300 es
precision highp float;
in vec4 vertexColor;
in vec2 strokeCoordinates;
flat in vec3 strokePathInformation;
out vec4 fragColor;
void main() {
  float pathLength = max(strokePathInformation.x, 0.0001);
  float endDistance = strokePathInformation.z > 0.5 ? 0.0 : max(max(-strokeCoordinates.x, strokeCoordinates.x - pathLength), 0.0);
  float across = strokeCoordinates.y;
  if (strokeStyle.cap > 1.5) across = (across >= 0.0 ? 1.0 : -1.0) * length(vec2(endDistance, across));
  else if (strokeStyle.cap > 0.5) across = (across >= 0.0 ? 1.0 : -1.0) * max(endDistance, abs(across));
  float coverage = pathDash_getCoverage(strokeCoordinates.x);
  float pencil = sketchStroke_getCoverage(vec2(clamp(strokeCoordinates.x / pathLength, 0.0, 1.0), across), pathLength, strokePathInformation.y);
  if (strokeStyle.appearance > 0.5 && strokeStyle.appearance < 1.5) coverage *= pencil;
  vec3 radiance = pointGlow_getColor(vec2(0.0, across / max(strokeStyle.width * 2.0, 0.0001)), vertexColor.rgb) * coverage * vertexColor.a * strokeStyle.intensity;
  if (coverage <= 0.01 || vertexColor.a <= 0.0 || (strokeStyle.appearance > 1.5 && strokeStyle.intensity <= 0.0)) discard;
  if (picking.isActive > 0.5 && strokeStyle.appearance > 1.5 && abs(across) > strokeStyle.width * 0.5) discard;
  if (strokeStyle.appearance > 1.5) {
    float energy = max(max(radiance.r, radiance.g), radiance.b);
    fragColor = vec4(radiance / max(energy, 0.0001), 1.0);
    DECKGL_FILTER_COLOR(fragColor, geometry);
    if (picking.isActive < 0.5) fragColor = vec4(fragColor.rgb * energy, 0.0);
  } else {
    fragColor = vec4(vertexColor.rgb, vertexColor.a * coverage);
    DECKGL_FILTER_COLOR(fragColor, geometry);
  }
}
`,Z=[{name:"West promenade",color:[1,.64,.25],path:[[-185,-555,2],[-175,-390,2],[-184,-270,2],[-175,-120,2],[-180,105,2],[-170,290,2],[-190,430,2],[-175,555,2]]},{name:"East promenade",color:[.3,.85,1],path:[[185,-555,2],[175,-390,2],[184,-270,2],[175,-120,2],[180,105,2],[170,290,2],[190,430,2],[175,555,2]]},{name:"South crossing",color:[1,.46,.4],path:[[-330,-265,2],[-170,-265,2],[-120,-265,14],[120,-265,14],[170,-265,2],[330,-265,2]]},{name:"North crossing",color:[.77,.64,1],path:[[-330,275,2],[-170,275,2],[-120,275,14],[120,275,14],[170,275,2],[330,275,2]]},{name:"Garden loop",color:[.6,1,.59],closed:!0,path:[[-154,-502,2],[-90,-502,2],[-90,-438,2],[-154,-438,2]]},{name:"Garden approach",color:[.6,1,.59],path:[[-275,-550,2],[-220,-550,2],[-220,-520,2],[-175,-520,2],[-154,-485,2]]}];function Ft(o,a={}){const c=yt(),u=c.map(t=>({...t,color:[t.color[0]*.12,t.color[1]*.17,t.color[2]*.24]}));let m="plain",C=.6,S=.8,n=Z,E={width:9,cap:"round",join:"round",miterLimit:3},h={dashLength:25,gapLength:14,offset:10},_=!0,i,k;const L=new Promise((t,s)=>{i=t,k=s}),d={frames:0,backend:"",error:"",selected:"",finalized:!1},x=new pt({parent:o,...gt(a),views:new ht({controller:!0}),initialViewState:{...vt,longitude:j[0],latitude:j[1],zoom:15.6,pitch:52,bearing:-28},layers:[],onDeviceInitialized:t=>{d.backend=t.type},onLoad:()=>{e(),i()},onAfterRender:()=>{d.frames++},onError:t=>{d.error||=t.message,o.dispatchEvent(new Event("stroke-error")),k(t)},onClick:t=>{d.selected=t.object?.name||"",o.dispatchEvent(new Event("stroke-selection"))},getTooltip:t=>t.object?.name||null});function e(){const t={coordinateSystem:dt.METER_OFFSETS,coordinateOrigin:j};o.style.backgroundColor=m==="glow"?"#08101b":"#e6e2d9";const s=m==="glow"?u:c;x.setProps({layers:[new xt({id:"district",features:s,data:s,pickable:!0,...t}),new Ot({id:"routes",routes:n,data:n,appearance:m,parameters:st(m),grain:C,glowIntensity:S,geometryOptions:E,dash:{...h,gapLength:_?h.gapLength:0},pickable:!0,...t})]})}return{deck:x,ready:L,diagnostics:d,routes:Z,setGeometryOptions(t){E={...E,...t},e()},setDash(t){h={...h,...t},e()},setAppearance(t){m=t,e()},setGrain(t){C=t,e()},setGlowIntensity(t){S=t,e()},setRoutes(t){n=t,e()},setEnabled(t){_=t,e()},rebuildLayers:e,finalize(){d.finalized||(d.finalized=!0,x.finalize())}}}const $=document.querySelector("#scene"),V=document.querySelector("#backend"),ct=await ft(new URLSearchParams(location.search).get("backend"));V.value=ct;const v=Ft($,{deviceType:ct});window.strokeScene=v;V.addEventListener("change",()=>{location.search=`?backend=${V.value}`});const J=document.querySelector("#appearance"),U=document.querySelector("#grain"),K=document.querySelector("#glowIntensity");J.addEventListener("change",()=>{const o=J.value;v.setAppearance(o==="sketch"||o==="glow"?o:"plain"),U.disabled=o!=="sketch",K.disabled=o!=="glow"});U.addEventListener("input",()=>v.setGrain(Number(U.value)));K.addEventListener("input",()=>v.setGlowIntensity(Number(K.value)));const Q=document.querySelector("#enabled");Q.addEventListener("change",()=>v.setEnabled(Q.checked));const tt=document.querySelector("#cap");tt.addEventListener("change",()=>{const o=tt.value;(o==="butt"||o==="square"||o==="round")&&v.setGeometryOptions({cap:o})});const et=document.querySelector("#join");et.addEventListener("change",()=>{const o=et.value;(o==="miter"||o==="bevel"||o==="round")&&v.setGeometryOptions({join:o})});for(const o of["width","miterLimit"]){const a=document.querySelector(`#${o}`);a.addEventListener("input",()=>v.setGeometryOptions({[o]:Number(a.value)}))}for(const o of["dashLength","gapLength","offset"]){const a=document.querySelector(`#${o}`);a.addEventListener("input",()=>v.setDash({[o]:Number(a.value)}))}$.addEventListener("stroke-error",()=>{document.querySelector("#status").textContent=v.diagnostics.error,document.body.dataset.ready="error"});$.addEventListener("stroke-selection",()=>{document.querySelector("#selection").textContent=v.diagnostics.selected||"Click a route to inspect"});v.ready.then(()=>{if(v.diagnostics.error)throw new Error(v.diagnostics.error);document.body.dataset.ready="true"}).catch(o=>{document.querySelector("#status").textContent=o.message,document.body.dataset.ready="error"});window.addEventListener("pagehide",()=>v.finalize());
