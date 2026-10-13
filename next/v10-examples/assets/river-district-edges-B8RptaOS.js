import{p as O}from"./project32-Byi-VnKS.js";import{e as w,n as A,L as N,c as R,M as $,p as U}from"./deck-example-device-TQPRJnZ6.js";import{s as q}from"./sketch-stroke-xlqZMOgT.js";import{m as V,a as B}from"./river-district-data-C9FvyLLC.js";function G(s,o={}){const{angleThreshold:e=30,weldTolerance:r=0,positionAttribute:P="POSITION"}=o,g=L(s,P);w(Number.isFinite(r)&&r>=0),w(Number.isFinite(e)&&e>=0&&e<=180);const m=s.indices?.value,_=g.value.length/3,E=new Map,S=new Map,a=new Set,C=new Map,z=Math.cos(e*Math.PI/180),T=r*r;function b(t){return[g.value[t*3],g.value[t*3+1],g.value[t*3+2]]}function D(t){const i=E.get(t);if(i!==void 0)return i;w(Number.isInteger(t)&&t>=0&&t<_);const n=b(t);w(n.every(Number.isFinite));const c=r>0?n.map(f=>Math.floor(f/r)):n,l=r>0?1:0;for(let f=-l;f<=l;f++)for(let u=-l;u<=l;u++)for(let p=-l;p<=l;p++){const h=S.get(`${c[0]+f},${c[1]+u},${c[2]+p}`);for(const x of h||[]){const v=b(x);if((n[0]-v[0])**2+(n[1]-v[1])**2+(n[2]-v[2])**2<=T)return E.set(t,x),x}}const k=c.join(","),d=S.get(k)||[];return d.push(t),S.set(k,d),E.set(t,t),t}function I(t,i,n){const c=Math.min(t,i),l=Math.max(t,i),k=`${c},${l}`,d=C.get(k);if(d){d.faceCount++;const f=n[0]*d.normal[0]+n[1]*d.normal[1]+n[2]*d.normal[2];d.crease||=f<1-1e-7&&f<=z+1e-7}else C.set(k,{start:c,end:l,normal:n,faceCount:1,crease:!1})}for(let t=0;t<s.vertexCount;t+=3){const i=D(m?.[t]??t),n=D(m?.[t+1]??t+1),c=D(m?.[t+2]??t+2);if(i===n||n===c||c===i)continue;const l=[i,n,c].sort((v,y)=>v-y).join(",");if(a.has(l))continue;a.add(l);const k=b(i),d=b(n),f=b(c),u=d.map((v,y)=>v-k[y]),p=f.map((v,y)=>v-k[y]),h=[u[1]*p[2]-u[2]*p[1],u[2]*p[0]-u[0]*p[2],u[0]*p[1]-u[1]*p[0]],x=Math.hypot(...h);x!==0&&(h[0]/=x,h[1]/=x,h[2]/=x,I(i,n,h),I(n,c,h),I(c,i,h))}const j=[...C.values()].filter(t=>o.includeCoplanarEdges||t.faceCount!==2||t.crease).sort((t,i)=>t.start-i.start||t.end-i.end);return new A({id:`${s.id}-edges`,topology:"line-list",attributes:{[P]:g},indices:new Uint32Array(j.flatMap(t=>[t.start,t.end]))})}function L(s,o){const e=s.attributes[o];return w(s.topology==="triangle-list"&&e?.size===3),w(e.value.length%3===0&&s.vertexCount%3===0),w(!e.byteStride||e.byteStride===e.value.BYTES_PER_ELEMENT*3),w(s.vertexCount>=0&&s.vertexCount<=(s.indices?.value.length??e.value.length/3)),e}const H={name:"sketchEdge",bindingLayout:[{name:"sketchEdge",group:3}],source:"struct SketchEdgeUniforms { color: vec4<f32> }; @group(3) @binding(auto) var<uniform> sketchEdge: SketchEdgeUniforms;",fs:"layout(std140) uniform sketchEdgeUniforms { vec4 color; } sketchEdge;",uniformTypes:{color:"vec4<f32>"},defaultUniforms:{color:[.1,.1,.1,1]}},M=class M extends N{getAttributeManager(){return null}getNumInstances(){return this.props.segmentCount}initializeState({device:o}){const e=o.createBuffer({data:new Float32Array([0,-1,1,-1,0,1,0,1,1,-1,1,1])});try{const r=new $(o,{...this.getShaders({source:Y,vs:K,fs:W,modules:[O,U,q,H]}),id:`${this.id}-strokes`,topology:"triangle-list",vertexCount:6,instanceCount:this.props.segmentCount,bufferLayout:[{name:"corner",format:"float32x2"},{name:"segments",stepMode:"instance",byteStride:32,attributes:[{attribute:"startPosition",format:"float32x3",byteOffset:0},{attribute:"endPosition",format:"float32x3",byteOffset:12},{attribute:"featureIndex",format:"float32",byteOffset:24},{attribute:"seed",format:"float32",byteOffset:28}]}],attributes:{corner:e,segments:this.props.segments},parameters:{depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"}});this.setState({model:r,corners:e})}catch(r){throw e.destroy(),r}}updateState({props:o,oldProps:e}){o.segments!==e.segments&&this.state.model.setAttributes({segments:o.segments}),this.state.model.setInstanceCount(o.segmentCount)}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:o}){const e=this.props.color;this.state.model.shaderInputs.setProps({sketchStroke:this.props.style||{},sketchEdge:{color:[e[0]/255,e[1]/255,e[2]/255,(e[3]??255)/255*this.props.opacity]}}),this.state.model.draw(o)}finalizeState(o){this.state.model?.destroy(),this.state.corners?.destroy(),super.finalizeState(o)}};M.layerName="SketchEdgeLayer",M.defaultProps={coordinateSystem:R.METER_OFFSETS,getPolygonOffset:()=>[0,0],color:[35,31,29,255],style:{}};let F=M;const Y=`
struct StrokeVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) weightedCoordinates: vec3<f32>,
  @location(1) @interpolate(flat) metrics: vec2<f32>,
  @location(2) @interpolate(flat) pickingColor: vec3<f32>,
};
@vertex fn vertexMain(
  @location(0) corner: vec2<f32>, @location(1) startPosition: vec3<f32>,
  @location(2) endPosition: vec3<f32>, @location(3) featureIndex: f32, @location(4) seed: f32
) -> StrokeVertex {
  var start = project_position_to_clipspace(startPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  var end = project_position_to_clipspace(endPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  var output: StrokeVertex;
  output.position = vec4<f32>(0.0, 0.0, 2.0, 1.0);
  output.weightedCoordinates = vec3<f32>(0.0, 0.0, 1.0);
  output.metrics = vec2<f32>(0.0, seed);
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  if (start.z < 0.0 && end.z < 0.0) { return output; }
  if (start.z < 0.0) { start = mix(start, end, -start.z / (end.z - start.z)); }
  if (end.z < 0.0) { end = mix(end, start, -end.z / (start.z - end.z)); }
  let viewport = project.viewportSize / project.devicePixelRatio;
  let delta = (end.xy / end.w - start.xy / start.w) * viewport * 0.5;
  let lengthPixels = length(delta);
  if (lengthPixels < 0.01 || min(start.w, end.w) <= 0.0) { return output; }
  let direction = delta / lengthPixels;
  let halfSpan = sketchStroke.width * 0.65 + sketchStroke.jitter * sketchStroke.sketch + 1.0;
  let extension = sketchStroke.extension + 1.0;
  let offset = direction * mix(-extension, extension, corner.x) + vec2<f32>(-direction.y, direction.x) * corner.y * halfSpan;
  var position = mix(start, end, corner.x);
  position = vec4<f32>(position.xy + offset * 2.0 / viewport * position.w, position.z - 0.00001 * position.w, position.w);
  output.position = position;
  let along = corner.x + mix(-extension, extension, corner.x) / lengthPixels;
  output.weightedCoordinates = vec3<f32>(vec2<f32>(along, corner.y * halfSpan) * position.w, position.w);
  output.metrics = vec2<f32>(lengthPixels, seed);
  return output;
}
@fragment fn fragmentMain(input: StrokeVertex) -> @location(0) vec4<f32> {
  let coordinates = input.weightedCoordinates.xy / input.weightedCoordinates.z;
  let coverage = sketchStroke_getCoverage(coordinates, input.metrics.x, input.metrics.y);
  if (coverage < 0.01 || input.metrics.x < 0.01) { discard; }
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  return vec4<f32>(sketchEdge.color.rgb, sketchEdge.color.a * coverage);
}
`,K=`#version 300 es
in vec2 corner;
in vec3 startPosition;
in vec3 endPosition;
in float featureIndex;
in float seed;
out vec3 weightedCoordinates;
flat out vec2 metrics;
flat out vec3 pickingColor;
void main() {
  vec4 start = project_position_to_clipspace(startPosition, vec3(0.0), vec3(0.0));
  vec4 end = project_position_to_clipspace(endPosition, vec3(0.0), vec3(0.0));
  gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  weightedCoordinates = vec3(0.0, 0.0, 1.0);
  metrics = vec2(0.0, seed);
  pickingColor = picking_getPickingColorFromIndex(featureIndex);
  float startDistance = start.z + start.w;
  float endDistance = end.z + end.w;
  if (startDistance < 0.0 && endDistance < 0.0) return;
  if (startDistance < 0.0) start = mix(start, end, -startDistance / (endDistance - startDistance));
  if (endDistance < 0.0) end = mix(end, start, -endDistance / ((start.z + start.w) - endDistance));
  vec2 viewport = project.viewportSize / project.devicePixelRatio;
  vec2 delta = (end.xy / end.w - start.xy / start.w) * viewport * 0.5;
  float lengthPixels = length(delta);
  if (lengthPixels < 0.01 || min(start.w, end.w) <= 0.0) return;
  vec2 direction = delta / lengthPixels;
  float halfSpan = sketchStroke.width * 0.65 + sketchStroke.jitter * sketchStroke.sketch + 1.0;
  float extension = sketchStroke.extension + 1.0;
  vec2 offset = direction * mix(-extension, extension, corner.x) + vec2(-direction.y, direction.x) * corner.y * halfSpan;
  vec4 position = mix(start, end, corner.x);
  position.xy += offset * 2.0 / viewport * position.w;
  position.z -= 0.00002 * position.w;
  gl_Position = position;
  float along = corner.x + mix(-extension, extension, corner.x) / lengthPixels;
  weightedCoordinates = vec3(vec2(along, corner.y * halfSpan) * position.w, position.w);
  metrics = vec2(lengthPixels, seed);
}
`,W=`#version 300 es
precision highp float;
in vec3 weightedCoordinates;
flat in vec2 metrics;
flat in vec3 pickingColor;
out vec4 fragColor;
void main() {
  float coverage = sketchStroke_getCoverage(weightedCoordinates.xy / weightedCoordinates.z, metrics.x, metrics.y);
  if (coverage < 0.01 || metrics.x < 0.01) discard;
  if (picking.isActive > 0.5) {
    if (all(equal(pickingColor, vec3(0.0)))) discard;
    fragColor = vec4(pickingColor / 255.0, 1.0);
  } else {
    fragColor = vec4(sketchEdge.color.rgb, sketchEdge.color.a * coverage);
  }
}
`;function tt(){return V().map((s,o)=>({...s,id:o})).filter(s=>s.kind==="building")}function et(s,o={}){const e=[];return s.forEach((r,P)=>{const g=B([r]),m=new Float32Array(g.length/10*3);for(let a=0;a<g.length;a+=10)m.set(g.subarray(a,a+3),a/10*3);const _=new A({topology:"triangle-list",attributes:{POSITION:m}}),S=G(_,o).indices.value;for(let a=0;a<S.length;a+=2){const C=S[a]*3,z=S[a+1]*3;e.push(...m.subarray(C,C+3),...m.subarray(z,z+3),P,r.id*37+a/2+1)}}),new Float32Array(e)}export{F as S,et as a,tt as m};
