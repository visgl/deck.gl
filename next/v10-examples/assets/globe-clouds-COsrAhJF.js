import{m as G,n as $,L as U,M as V,p as q,b as O,h as j,r as B}from"./deck-example-device-TQPRJnZ6.js";import{i as F}from"./example-support-KHcxfZf7.js";import{g as N,G as _,S as W}from"./sky-layer-DiaTi2r4.js";import{c as H,d as I,a as P,g as C,b as X,e as Y}from"./cloud-spectral-Bxz9AmFy.js";import{s as z}from"./atmosphere-layer-DUCJDyks.js";import{G as Z}from"./meter-offset-position-CMR-ehQ5.js";import{D as J}from"./dynamic-texture-NQQfRyls.js";import"./point-glow-DAMvtmjx.js";function K(t,o){if(!Number.isFinite(t)||t<=0)throw new Error(`${o} must be greater than zero`)}function k(t,o,e=1){if(!Number.isInteger(t)||t<e)throw new Error(`${o} must be an integer >= ${e}`)}function Q(t,o){return t>65535?new Uint32Array(o):new Uint16Array(o)}function ee(t,o){const e=[],r=[],a=[],i=[],u=o+1;for(let s=0;s<t.length;s++){const c=t[s];for(let l=0;l<=o;l++){const m=l/o,p=m*Math.PI*2,f=Math.sin(p),w=Math.cos(p);e.push(f*c.radius,c.y,w*c.radius),r.push(f*c.normalRadius,c.normalY,w*c.normalRadius),a.push(m,s/(t.length-1))}}for(let s=0;s<t.length-1;s++)for(let c=0;c<o;c++){const l=s*u+c,m=l+1,p=l+u,f=p+1;i.push(l,m,f,l,f,p)}return{positions:e,normals:r,texCoords:a,indices:i,indexArray:Q(e.length/3,i)}}let te=class extends G{constructor(o={}){const{radius:e=.5,nlat:r=10,nlong:a=10}=o;K(e,"radius"),k(r,"nlat",2),k(a,"nlong",3);const i=[];for(let s=0;s<=r;s++){const c=-Math.PI/2+s/r*Math.PI,l=Math.cos(c),m=Math.sin(c);i.push({radius:e*l,y:e*m,normalRadius:l,normalY:m})}const u=ee(i,a);super({id:o.id,topology:"triangle-list",indices:u.indexArray,attributes:{POSITION:{size:3,value:new Float32Array(u.positions)},NORMAL:{size:3,value:new Float32Array(u.normals)},TEXCOORD_0:{size:2,value:new Float32Array(u.texCoords)},...o.attributes}})}};class oe extends ${constructor(o={}){const e=new te({...o,attributes:void 0,radius:o.radius??1});for(const a of["POSITION","NORMAL"]){const i=e.attributes[a].value;for(let u=0;u<i.length;u+=3){const s=i[u];i[u]=i[u+2],i[u+2]=s}}const r=e.indices?.value;if(r)for(let a=0;a<r.length;a+=3){const i=r[a+1];r[a+1]=r[a+2],r[a+2]=i}super({...e,attributes:{...e.attributes,...o.attributes}})}}let ne="";function re(t){return ae(t)?t:ne+t}async function ie(t,o){const e=new Image,r=re(t);e.crossOrigin="anonymous",e.src=r;try{await e.decode()}catch(a){throw A("decode",r,a)}try{return o?await createImageBitmap(e,o):await createImageBitmap(e)}catch(a){throw A("create",r,a)}}function A(t,o,e){const r=e instanceof Error?e.message:String(e),a=t==="decode"?`Could not decode source image "${o}": ${r}`:`Could not create ImageBitmap from decoded image "${o}": ${r}`;return new Error(a,{cause:e})}function ae(t){return t.startsWith("/")||/^[a-z][a-z\d+\-.]*:/i.test(t)}const se=await F();se.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(t=>t.remove());const ce={name:"earthScene",uniformTypes:{viewProjectionMatrix:"mat4x4<f32>",sunDirection:"vec3<f32>",moonDirection:"vec3<f32>",moonColor:"vec3<f32>",moonIntensity:"f32",camera:"vec3<f32>"},source:`struct earthSceneUniforms {
    viewProjectionMatrix: mat4x4f,
    sunDirection: vec3f,
    moonDirection: vec3f,
    moonColor: vec3f,
    moonIntensity: f32,
    camera: vec3f,
  };
    @group(3) @binding(auto) var<uniform> earthScene: earthSceneUniforms;
    @group(3) @binding(auto) var earthTexture: texture_2d<f32>;
    @group(3) @binding(auto) var earthSampler: sampler;`,vs:`layout(std140) uniform earthSceneUniforms {
    mat4 viewProjectionMatrix;
    vec3 sunDirection;
    vec3 moonDirection;
    vec3 moonColor;
    float moonIntensity;
    vec3 camera;
  } earthScene;`,fs:`layout(std140) uniform earthSceneUniforms {
    mat4 viewProjectionMatrix;
    vec3 sunDirection;
    vec3 moonDirection;
    vec3 moonColor;
    float moonIntensity;
    vec3 camera;
  } earthScene;
    uniform sampler2D earthTexture;`};class le extends U{static layerName="EarthLayer";static defaultProps={parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}};getAttributeManager(){return null}initializeState({device:o}){this.setState({model:new V(o,{...this.getShaders({source:ue,vs:de,fs:me,modules:[q,ce]}),id:`${this.id}-surface`,geometry:new oe({nlat:96,nlong:192}),bufferLayout:[{name:"positions",format:"float32x3"}],parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}})})}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:o}){const e=this.context.viewport;if(!(e instanceof Z))return;const r=N(e);this.state.model.shaderInputs.setProps({earthScene:{viewProjectionMatrix:r.viewProjectionMatrix,sunDirection:this.props.sunDirection,moonDirection:this.props.moonDirection,moonColor:this.props.moonColor,moonIntensity:this.props.moonIntensity,camera:r.camera}}),this.state.model.setBindings({earthTexture:this.props.texture,...this.context.device.type==="webgpu"?{earthSampler:this.props.texture.sampler}:{}}),this.state.model.draw(o)}finalizeState(o){this.state.model?.destroy(),super.finalizeState(o)}}const ue=`
struct EarthVertex {
  @builtin(position) position: vec4f,
  @location(0) normal: vec3f,
};
@vertex fn vertexMain(@location(0) positions: vec3f) -> EarthVertex {
  let position = vec3f(-positions.z, positions.x, positions.y);
  var output: EarthVertex;
  output.normal = position;
  output.position = earthScene.viewProjectionMatrix * vec4f(position, 1.0);
  output.position.z = (output.position.z + output.position.w) * 0.5;
  return output;
}
@fragment fn fragmentMain(input: EarthVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) { discard; }
  let normal = normalize(input.normal);
  // The sphere transform reverses winding; reject its far side consistently on both backends.
  if (dot(normal, earthScene.camera - input.normal) <= 0.0) { discard; }
  let coordinates = vec2f(atan2(normal.x, -normal.y) / 6.28318530718 + 0.5, 0.5 - asin(normal.z) / 3.14159265359);
  let surface = textureSample(earthTexture, earthSampler, coordinates).rgb;
  let sunlight = max(dot(normal, normalize(earthScene.sunDirection)), 0.0);
  let moonlight = max(dot(normal, normalize(earthScene.moonDirection)), 0.0) * earthScene.moonIntensity;
  let night = 1.0 - smoothstep(0.0, 0.15, sunlight);
  return vec4f(surface * (vec3f(0.035 + sunlight * 0.965) + earthScene.moonColor * moonlight * night), 1.0);
}`,de=`#version 300 es
in vec3 positions; out vec3 normal;
void main() {
  normal = vec3(-positions.z, positions.x, positions.y);
  gl_Position = earthScene.viewProjectionMatrix * vec4(normal, 1.0);
}`,me=`#version 300 es
precision highp float;
in vec3 normal; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  vec3 direction = normalize(normal);
  if (dot(direction, earthScene.camera - normal) <= 0.0) discard;
  vec2 coordinates = vec2(atan(direction.x, -direction.y) / 6.28318530718 + 0.5, 0.5 - asin(direction.z) / 3.14159265359);
  float sunlight = max(dot(direction, normalize(earthScene.sunDirection)), 0.0);
  float moonlight = max(dot(direction, normalize(earthScene.moonDirection)), 0.0) * earthScene.moonIntensity;
  float night = 1.0 - smoothstep(0.0, 0.15, sunlight);
  fragColor = vec4(texture(earthTexture, coordinates).rgb * (vec3(0.035 + sunlight * 0.965) + earthScene.moonColor * moonlight * night), 1.0);
}`,he="/next/v10-examples/assets/earth-CGD8B875.jpg";function pe(t,o={}){const e={clouds:!0,animate:!0,cover:.45,scale:900,drift:1,sunlight:13,sun:!0,moon:!0,stars:!0},r={frames:0,time:0,backend:"",error:"",finalized:!1},a=Promise.withResolvers(),i=H({longitude:20,latitude:20}),u=Date.UTC(2026,9,4),s=()=>u+e.sunlight*36e5,c={longitude:20,latitude:20,zoom:1.4,minZoom:-1.5,maxZoom:8,maxPitch:120,pitch:0,bearing:0};let l,m=0,p=!1;const f=O(o),w=(o.device?.type??o.deviceType??"webgpu")==="webgpu"&&window.matchMedia("(dynamic-range: high)").matches;let g=c;const v=new j({parent:t,...f,deviceProps:{...f.deviceProps,createCanvasContext:w?{colorFormat:"rgba16float",colorSpace:"display-p3",toneMapping:"extended",alphaMode:"opaque"}:{alphaMode:"opaque"}},views:new _({id:"globe",controller:!0}),viewState:g,onViewStateChange:({viewState:n})=>{g=n,v.setProps({viewState:g})},layers:[],_animate:!0,onDeviceInitialized:n=>{r.backend=n.type,l=new J(n,{id:"globe-earth-texture",data:ie(he),sampler:{minFilter:"linear",magFilter:"linear",addressModeU:"repeat",addressModeV:"clamp-to-edge"}}),l.ready.then(()=>{r.finalized||(p=!0,h())}).catch(E)},onBeforeRender:()=>{const n=performance.now(),y=m?Math.min((n-m)/1e3,.1):0;m=n,e.animate&&(r.time+=y),p&&e.animate&&h()},onAfterRender:()=>{r.frames++,p&&a.resolve()},onError:E});function E(n){r.error=n.message,a.reject(n)}function h(){if(!l?.isReady||r.finalized)return;const n=s(),y=I(n,i.latitude,i.longitude),S=z(P(y.altitude,y.azimuth),i),x=C(n,i.latitude,i.longitude),M=X(n),R=z(P(x.altitude,x.azimuth),i),b=Y(Math.PI/2,{phaseAngle:Math.acos(2*M.fraction-1),distance:x.distance});v.setProps({layers:[new le({id:"earth",texture:l.texture,sunDirection:S,moonDirection:R,moonColor:[b.color[0]*.7,b.color[1]*.82,b.color[2]],moonIntensity:b.intensity*.18}),new W({id:"sky",timestamp:n,observer:i,time:r.time,atmosphere:!1,sun:e.sun&&{radiusPixels:14,radiance:8,color:[255,220,18,255]},moon:e.moon&&{radiusPixels:18},stars:e.stars&&{brightness:2},clouds:e.clouds&&{cover:e.cover,scale:e.scale*1e3,velocity:[22e3*e.drift,5e3*e.drift]}})]})}return{deck:v,settings:e,diagnostics:r,ready:a.promise,setClouds(n){e.clouds=n,h()},setAnimate(n){e.animate=n,m=0,v.setProps({_animate:n})},setCover(n){e.cover=n,h()},setScale(n){e.scale=n,h()},setDrift(n){e.drift=n,h()},setSunlight(n){e.sunlight=n,h()},setSun(n){e.sun=n,h()},setMoon(n){e.moon=n,h()},setStars(n){e.stars=n,h()},lookAtBody(n){const y=n==="sun"?I(s(),i.latitude,i.longitude):C(s(),i.latitude,i.longitude),S=z(P(y.altitude,y.azimuth),i),x=Math.atan2(S[0],-S[1])*180/Math.PI,M=Math.asin(S[2])*180/Math.PI;g={...c,longitude:x+198,latitude:-M,zoom:-1.2},v.setProps({viewState:g})},centerView(){g={...c},v.setProps({viewState:g})},finalize(){r.finalized||(r.finalized=!0,v.finalize(),l?.destroy())}}}const D=document.querySelector("#backend"),L=document.querySelector("#status"),T=await B(new URLSearchParams(location.search).get("backend"));D.value=T;D.addEventListener("change",()=>{location.search=`?backend=${D.value}`});const d=pe(document.querySelector("#scene"),{deviceType:T});window.globeCloudScene=d;for(const[t,o]of[["clouds",d.setClouds],["sun",d.setSun],["moon",d.setMoon],["stars",d.setStars],["animate",d.setAnimate]]){const e=document.querySelector(`#${t}`);e.addEventListener("change",()=>o(e.checked))}for(const[t,o]of[["cover",d.setCover],["scale",d.setScale],["drift",d.setDrift],["sunlight",d.setSunlight]]){const e=document.querySelector(`#${t}`);e.addEventListener("input",()=>o(Number(e.value)))}document.querySelector("#center").addEventListener("click",()=>d.centerView());for(const t of["sun","moon"])document.querySelector(`#look-${t}`).addEventListener("click",()=>d.lookAtBody(t));d.ready.then(()=>{document.body.dataset.ready="true",L.value=`Astronomy sky and cloud cover · ${d.diagnostics.backend==="webgpu"?"WebGPU":"WebGL2"}`}).catch(t=>{document.body.dataset.ready="error",L.value=t instanceof Error?t.message:String(t)});window.addEventListener("pagehide",()=>d.finalize());
