import{L as ce,M as le,k as I,h as ue,l as de,m as X,r as pe}from"./deck-example-device-Cl0F1Zrg.js";import{G as fe,S as me}from"./sky-layer-4LfQ_qSF.js";import{g as te}from"./meter-offset-position-COJlAzNh.js";import{p as ve}from"./project32-CM9lscoK.js";import{h as J,i as he,R as ge}from"./river-district-layer-DPtfbqlx.js";import{m as we,C as x}from"./river-district-data-C9FvyLLC.js";import{g as M,S as Q,D as ye,a as q,b as Se}from"./riverfront-sky-lighting-B1JAZNfC.js";import{c as xe,g as be,a as Pe}from"./sky-observer-ChgclhC2.js";import"./composite-layer-DFzqJpRP.js";import"./atmosphere-layer-CCMd44kl.js";import"./point-glow-DAMvtmjx.js";import"./lambert-material-CMCKBOe0.js";const Ce={name:"precipitation",bindingLayout:[{name:"precipitation",group:3}],uniformTypes:{time:"f32",fallSpeed:"f32",turbulence:"f32",seed:"f32",volumeCenter:"vec3<f32>",volumeSize:"vec3<f32>",wind:"vec2<f32>"},defaultUniforms:{time:0,fallSpeed:20,turbulence:0,seed:29,volumeCenter:[0,0,150],volumeSize:[1200,1600,300],wind:[2,0]},getUniforms(i={}){return i},vs:`
layout(std140) uniform precipitationUniforms {
  float time;
  float fallSpeed;
  float turbulence;
  float seed;
  vec3 volumeCenter;
  vec3 volumeSize;
  vec2 wind;
} precipitation;
float precipitation_random(uint identifier) {
  uint value = identifier + uint(precipitation.seed) * 747796405u;
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  value = value ^ (value >> 16u);
  return float(value & 16777215u) / 16777216.0;
}
vec3 precipitation_getPosition(uint identifier) {
  vec3 randomPosition = vec3(precipitation_random(identifier * 3u), precipitation_random(identifier * 3u + 1u), precipitation_random(identifier * 3u + 2u));
  vec3 volumeSize = max(precipitation.volumeSize, vec3(0.001));
  vec3 minimum = precipitation.volumeCenter - volumeSize * 0.5;
  vec3 drift = vec3(precipitation.wind, -precipitation.fallSpeed) * precipitation.time;
  vec3 position = mod(randomPosition * volumeSize + drift - minimum, volumeSize) + minimum;
  position.xy += precipitation.turbulence * vec2(sin(precipitation.time * 0.9 + randomPosition.z * 31.0), cos(precipitation.time * 0.7 + randomPosition.x * 23.0));
  return position;
}
float precipitation_getFade(vec3 position) {
  vec3 edge = 0.5 - abs((position - precipitation.volumeCenter) / max(precipitation.volumeSize, vec3(0.001)));
  return smoothstep(0.0, 0.08, min(edge.x, min(edge.y, edge.z)));
}
`,source:`
struct precipitationUniforms {
  time: f32,
  fallSpeed: f32,
  turbulence: f32,
  seed: f32,
  volumeCenter: vec3<f32>,
  volumeSize: vec3<f32>,
  wind: vec2<f32>,
};
@group(3) @binding(auto) var<uniform> precipitation: precipitationUniforms;
fn precipitation_random(identifier: u32) -> f32 {
  var value = identifier + u32(precipitation.seed) * 747796405u;
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  value = value ^ (value >> 16u);
  return f32(value & 16777215u) / 16777216.0;
}
fn precipitation_getPosition(identifier: u32) -> vec3<f32> {
  let randomPosition = vec3<f32>(precipitation_random(identifier * 3u), precipitation_random(identifier * 3u + 1u), precipitation_random(identifier * 3u + 2u));
  let volumeSize = max(precipitation.volumeSize, vec3<f32>(0.001));
  let minimum = precipitation.volumeCenter - volumeSize * 0.5;
  let drift = vec3<f32>(precipitation.wind, -precipitation.fallSpeed) * precipitation.time;
  let unwrapped = randomPosition * volumeSize + drift - minimum;
  var position = unwrapped - floor(unwrapped / volumeSize) * volumeSize + minimum;
  position.x += precipitation.turbulence * sin(precipitation.time * 0.9 + randomPosition.z * 31.0);
  position.y += precipitation.turbulence * cos(precipitation.time * 0.7 + randomPosition.x * 23.0);
  return position;
}
fn precipitation_getFade(position: vec3<f32>) -> f32 {
  let edge = 0.5 - abs((position - precipitation.volumeCenter) / max(precipitation.volumeSize, vec3<f32>(0.001)));
  return smoothstep(0.0, 0.08, min(edge.x, min(edge.y, edge.z)));
}
`},Z=`layout(std140) uniform weatherRenderUniforms {
  vec4 appearance;
  vec4 surfaceBounds;
  vec4 color;
  vec3 cameraPosition;
} weatherRender;`,ze={name:"weatherRender",source:`struct weatherRenderUniforms {
    appearance: vec4<f32>,
    surfaceBounds: vec4<f32>,
    color: vec4<f32>,
    cameraPosition: vec3<f32>,
  };
  @group(3) @binding(auto) var<uniform> weatherRender: weatherRenderUniforms;
  @group(3) @binding(7) var surfaceElevation: texture_2d<f32>;`,vs:Z+`
uniform highp sampler2D surfaceElevation;`,fs:Z,uniformTypes:{appearance:"vec4<f32>",surfaceBounds:"vec4<f32>",color:"vec4<f32>",cameraPosition:"vec3<f32>"},bindingLayout:[{name:"weatherRender",group:3},{name:"surfaceElevation",group:3,visibility:1}],defaultUniforms:{cameraPosition:[0,0,0],appearance:[1.2,12,0,0],surfaceBounds:[-1,-1,2,2],color:[.75,.85,.95,.7]}},Re=`
struct WeatherVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) coordinates: vec2<f32>,
  @location(1) worldPosition: vec3<f32>,
  @location(2) opacity: f32,
};
@vertex fn vertexMain(@location(0) corner: vec2<f32>, @builtin(instance_index) identifier: u32) -> WeatherVertex {
  let position = precipitation_getPosition(identifier);
  let snow = weatherRender.appearance.z > 0.5;
  let cameraPosition = weatherRender.cameraPosition;
  let variation = 0.65 + precipitation_random(identifier + 1337u) * 0.7;
  let width = weatherRender.appearance.x * project.devicePixelRatio * variation * clamp(350.0 / max(distance(cameraPosition, position), 1.0), 0.5, 3.0);
  let currentClip = project_position_to_clipspace(position, vec3<f32>(0.0), vec3<f32>(0.0));
  let velocity = vec3<f32>(precipitation.wind, -max(precipitation.fallSpeed, 0.01));
  let tailPosition = position - normalize(velocity) * weatherRender.appearance.y * variation;
  let tailClip = project_position_to_clipspace(tailPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  let motion = (currentClip.xy / max(currentClip.w, 0.00001) - tailClip.xy / max(tailClip.w, 0.00001)) * project.viewportSize;
  let direction = motion / max(length(motion), 0.00001);
  var centerClip = mix(tailClip, currentClip, corner.x);
  var offset = vec2<f32>(-direction.y, direction.x) * corner.y * width * 0.5;
  var worldPosition = mix(tailPosition, position, corner.x);
  if (snow) {
    centerClip = currentClip;
    offset = vec2<f32>((corner.x - 0.5) * 2.0, corner.y) * width * 0.5;
    worldPosition = position;
  }
  var surfaceHeight = 0.0;
  let surfaceCoordinate = (position.xy - weatherRender.surfaceBounds.xy) / weatherRender.surfaceBounds.zw;
  if (weatherRender.appearance.w > 0.5 && all(surfaceCoordinate >= vec2<f32>(0.0)) && all(surfaceCoordinate <= vec2<f32>(1.0))) {
    let dimensions = textureDimensions(surfaceElevation);
    let coordinate = clamp(vec2<i32>(surfaceCoordinate * vec2<f32>(dimensions)), vec2<i32>(0), vec2<i32>(dimensions) - 1);
    surfaceHeight = textureLoad(surfaceElevation, coordinate, 0).r;
  }
  var output: WeatherVertex;
  output.position = vec4<f32>(centerClip.xy + offset * 2.0 / project.viewportSize * centerClip.w, centerClip.zw);
  output.coordinates = vec2<f32>((corner.x - 0.5) * 2.0, corner.y);
  output.worldPosition = worldPosition;
  output.opacity = precipitation_getFade(position) * smoothstep(surfaceHeight, surfaceHeight + 3.0, position.z);
  if (currentClip.w <= 0.0 || tailClip.w <= 0.0) {output.opacity = 0.0;}
  return output;
}
@fragment fn fragmentMain(input: WeatherVertex) -> @location(0) vec4<f32> {
  var coverage = (1.0 - smoothstep(0.4, 1.0, abs(input.coordinates.y))) * (1.0 - input.coordinates.x * input.coordinates.x);
  if (weatherRender.appearance.z > 0.5) {coverage = 1.0 - smoothstep(0.3, 1.0, length(input.coordinates));}
  let opacity = weatherRender.color.a * input.opacity * coverage * layer.opacity;
  if (opacity < 0.002) {discard;}
  return heightFog_getColor(vec4<f32>(weatherRender.color.rgb, opacity), input.worldPosition, weatherRender.cameraPosition);
}
`,Ee=`#version 300 es
in vec2 corner;
out vec2 coordinates;
out vec3 worldPosition;
out vec3 cameraPosition;
out float opacity;
void main() {
  vec3 position = precipitation_getPosition(uint(gl_InstanceID));
  bool snow = weatherRender.appearance.z > 0.5;
  cameraPosition = weatherRender.cameraPosition;
  float variation = 0.65 + precipitation_random(uint(gl_InstanceID) + 1337u) * 0.7;
  float width = weatherRender.appearance.x * project.devicePixelRatio * variation * clamp(350.0 / max(distance(cameraPosition, position), 1.0), 0.5, 3.0);
  vec4 currentClip = project_position_to_clipspace(position, vec3(0.0), vec3(0.0));
  vec3 velocity = vec3(precipitation.wind, -max(precipitation.fallSpeed, 0.01));
  vec3 tailPosition = position - normalize(velocity) * weatherRender.appearance.y * variation;
  vec4 tailClip = project_position_to_clipspace(tailPosition, vec3(0.0), vec3(0.0));
  vec2 motion = (currentClip.xy / max(currentClip.w, 0.00001) - tailClip.xy / max(tailClip.w, 0.00001)) * project.viewportSize;
  vec2 direction = motion / max(length(motion), 0.00001);
  vec4 centerClip = mix(tailClip, currentClip, corner.x);
  vec2 offset = vec2(-direction.y, direction.x) * corner.y * width * 0.5;
  worldPosition = mix(tailPosition, position, corner.x);
  if (snow) {
    centerClip = currentClip;
    offset = vec2((corner.x - 0.5) * 2.0, corner.y) * width * 0.5;
    worldPosition = position;
  }
  float surfaceHeight = 0.0;
  vec2 surfaceCoordinate = (position.xy - weatherRender.surfaceBounds.xy) / weatherRender.surfaceBounds.zw;
  if (weatherRender.appearance.w > 0.5 && all(greaterThanEqual(surfaceCoordinate, vec2(0.0))) && all(lessThanEqual(surfaceCoordinate, vec2(1.0)))) {
    ivec2 dimensions = textureSize(surfaceElevation, 0);
    ivec2 coordinate = clamp(ivec2(surfaceCoordinate * vec2(dimensions)), ivec2(0), dimensions - 1);
    surfaceHeight = texelFetch(surfaceElevation, coordinate, 0).r;
  }
  gl_Position = vec4(centerClip.xy + offset * 2.0 / project.viewportSize * centerClip.w, centerClip.zw);
  coordinates = vec2((corner.x - 0.5) * 2.0, corner.y);
  opacity = precipitation_getFade(position) * smoothstep(surfaceHeight, surfaceHeight + 3.0, position.z);
  if (currentClip.w <= 0.0 || tailClip.w <= 0.0) opacity = 0.0;
}
`,_e=`#version 300 es
precision highp float;
in vec2 coordinates;
in vec3 worldPosition;
in vec3 cameraPosition;
in float opacity;
out vec4 fragmentColor;
void main() {
  float coverage = (1.0 - smoothstep(0.4, 1.0, abs(coordinates.y))) * (1.0 - coordinates.x * coordinates.x);
  if (weatherRender.appearance.z > 0.5) coverage = 1.0 - smoothstep(0.3, 1.0, length(coordinates));
  float alpha = weatherRender.color.a * opacity * coverage * layer.opacity;
  if (alpha < 0.002) discard;
  fragmentColor = heightFog_getColor(vec4(weatherRender.color.rgb, alpha), worldPosition, cameraPosition);
}
`,B={depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaOperation:"add",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},D=class D extends ce{getAttributeManager(){return null}getNumInstances(){return this.props.particleCount}initializeState({device:o}){const t=o.createBuffer({data:new Float32Array([0,-1,1,-1,0,1,0,1,1,-1,1,1])});let s;try{s=o.createTexture({width:1,height:1,format:"r32float",data:new Float32Array([0])});const n=new le(o,{...this.getShaders({source:Re,vs:Ee,fs:_e,modules:[ve,Ce,J,ze]}),id:this.id,topology:"triangle-list",vertexCount:6,isInstanced:!0,instanceCount:this.props.particleCount,bufferLayout:[{name:"corner",format:"float32x2"}],attributes:{corner:t},shaderLayout:{attributes:[],bindings:[{name:"surfaceElevation",type:"texture",group:3,location:7,sampleType:"unfilterable-float"}]},bindings:{surfaceElevation:this.props.surfaceTexture||s},parameters:B});this.setState({model:n,corners:t,emptySurface:s})}catch(n){throw t.destroy(),s?.destroy(),n}}updateState({props:o}){I(o.coordinateSystem==="meter-offsets"),I(Number.isInteger(o.particleCount)&&o.particleCount>=0&&o.particleCount<=262144),o.surfaceTexture&&I(o.surfaceTexture.device===this.context.device&&o.surfaceTexture.format==="r32float"),this.state.model.setParameters({...B,...o.parameters}),this.state.model.setInstanceCount(o.particleCount),this.state.model.setBindings({surfaceElevation:o.surfaceTexture||this.state.emptySurface})}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:o}){const t=this.props,s=t.surfaceBounds;this.state.model.shaderInputs.setProps({precipitation:{...typeof t.precipitation=="function"?t.precipitation(this.context.viewport):t.precipitation,time:typeof t.time=="function"?t.time():t.time},heightFog:{...J.defaultUniforms,...typeof t.fog=="function"?t.fog():t.fog},weatherRender:{cameraPosition:te(this.context.viewport,t.coordinateOrigin,this.context.viewport.cameraPosition),appearance:[t.widthPixels,t.streakLength,t.weather==="snow"?1:0,t.surfaceTexture?1:0],surfaceBounds:[s[0],s[1],s[2]-s[0],s[3]-s[1]],color:t.color}}),this.state.model.draw(o)}finalizeState(o){this.state.model?.destroy(),this.state.corners?.destroy(),this.state.emptySurface?.destroy(),super.finalizeState(o)}};D.layerName="WeatherParticleLayer",D.defaultProps={weather:"rain",time:0,particleCount:12e3,precipitation:{},fog:{},widthPixels:1.2,streakLength:12,color:[.75,.85,.95,.7],surfaceTexture:null,surfaceBounds:[-1,-1,1,1],coordinateSystem:"meter-offsets",getPolygonOffset:()=>[0,0],parameters:B};let H=D;const ie=[-700,-900,700,900];function ke(i,o={}){const t=we();let s=null,n="rain",h=!0,g=.6,P=6,C=45,d=700,z=1,R=3,_=!0,m=9,f=!0;const y=xe({longitude:x[0],latitude:x[1]}),c={enabled:!0,accumulate:!0,wetness:.35,snow:0,puddles:.8};let E=0,F=0,b=0,V,j;const ne=new Promise((e,a)=>{V=e,j=a}),O=()=>{b=0};document.addEventListener("visibilitychange",O);const w={frames:0,time:0,hour:m,sunAltitude:0,error:"",backend:"",finalized:!1},N=ue(o),A=M({longitude:x[0],latitude:x[1],zoom:15.6,pitch:74,bearing:-25},i.clientWidth,i.clientHeight);let v=A;const l=new de({parent:i,...N,deviceProps:{...N.deviceProps,createCanvasContext:{alphaMode:"premultiplied"},webgl:{alpha:!0}},views:new X({controller:!0,fovy:Q}),viewState:v,onViewStateChange:({viewState:e})=>{v=M(e,i.clientWidth,i.clientHeight),l.setProps({viewState:v})},onResize:({width:e,height:a})=>{v=M(v,e,a),l.setProps({viewState:v})},layers:[],_animate:k(),onDeviceInitialized:e=>{s=Me(e,t),w.backend=e.type},onLoad:()=>{u(),V()},onBeforeRender:()=>{const e=performance.now();if(!document.hidden&&k()&&b){const a=(e-b)/1e3;E+=a,c.enabled&&c.accumulate&&Object.assign(c,he(c,{rainfall:n==="rain"?g*.12:0,snowfall:n==="snow"?g*.06:0,evaporation:n==="rain"?.004:.025,snowmelt:n==="snow"?.001:n==="rain"?.05:.012},a)),h&&z>0&&(F+=a*R)}b=!document.hidden&&k()?e:0,w.time=E,f&&_&&s&&u(!1)},onAfterRender:()=>{w.frames++,i.dispatchEvent(new Event("weather-frame"))},onError:e=>{w.error||=e.message,j(e)}});function $(){return Math.round(g*2e4)}function k(){return _&&(f||$()>0&&(n==="rain"||n==="snow")||h&&z>0&&R>0||c.enabled&&c.accumulate)}function re(e){const a=e.projectPosition(e.unproject([e.width/2,e.height/2])),p=te(e,x,a),S=C*Math.PI/180;return{seed:29,fallSpeed:n==="snow"?4:35,turbulence:n==="snow"?2:0,wind:[Math.sin(S)*P,Math.cos(S)*P],volumeSize:[1500,1800,450],volumeCenter:[p[0],p[1],225]}}function G(){const e=C*Math.PI/180,a=K(),p=Math.max(.15,a.intensity+a.diffuse.intensity);return{color:[.53*p,.61*p,.67*p],density:h?3.912/d:0,baseHeight:30,heightFalloff:.012,variation:z,wispScale:140,velocity:[Math.sin(e),Math.cos(e),0],evolutionSpeed:.06,time:F}}function ae(){return{wetness:c.enabled?c.wetness:0,snow:c.enabled?c.snow:0,puddles:c.puddles}}function Y(){return Se(m,f?n==="clear"?.25:.65:0)}function K(){return Y().sunlight}function se(){return Y().lights}function u(e=!0){if(!s)return;const a=q(m);w.hour=m,w.sunAltitude=a.altitude,l.setProps({_animate:k(),layers:[new me({id:"weather-sky",observer:y,timestamp:a.timestamp,time:E,coordinateOrigin:x,sun:{radiusPixels:14,radiance:8,color:[255,220,18,255]},moon:{radiusPixels:18},stars:a.altitude<0?{brightness:2}:!1,clouds:f&&{cover:n==="clear"?.25:.65,velocity:[14,4]},atmosphere:{opacity:.78,sunIntensity:10*K().intensity,haze:n==="clear"?1:2,groundColor:t.find(p=>p.kind==="ground").color}}),new ge({id:"district",features:t,lighting:se,fog:G,surfaceWeather:ae,coordinateSystem:"meter-offsets",coordinateOrigin:x}),new H({id:"weather",visible:n==="rain"||n==="snow",coordinateOrigin:x,weather:n==="snow"?"snow":"rain",time:()=>E,particleCount:$(),precipitation:re,fog:G,widthPixels:n==="snow"?4:1.4,streakLength:n==="snow"?0:16,color:n==="snow"?[.96,.98,1,.9]:[.75,.85,.95,.65],surfaceTexture:s,surfaceBounds:ie})]}),e&&l.redraw("weather settings changed")}return{deck:l,ready:ne,diagnostics:w,surfaceSettings:c,setHour(e){m=e,u()},setClouds(e){f=e,u()},centerView(){v=M(A,i.clientWidth,i.clientHeight),l.setProps({viewState:v})},lookAtBody(e){const a=S=>{if(e==="sun")return q(S).direction;const L=be(q(S).timestamp,y.latitude,y.longitude);return Pe(L.altitude,L.azimuth)};a(m)[2]<=0&&(m=Array.from({length:48},(S,L)=>L/2).find(S=>a(S)[2]>.08)??ye);const p=a(m);v=M({...A,pitch:90+Math.asin(p[2])*180/Math.PI,bearing:Math.atan2(p[0],p[1])*180/Math.PI},i.clientWidth,i.clientHeight),l.setProps({viewState:v}),u()},setSurfaceEnabled(e){c.enabled=e,u()},setAccumulation(e){c.accumulate=e,u()},setWetness(e){c.wetness=e,l.redraw("surface wetness")},setSnowCover(e){c.snow=e,l.redraw("snow cover")},setPuddles(e){c.puddles=e,l.redraw("puddles")},get surfaceTexture(){return s},setProjection(e){l.setProps({views:e==="globe"?new fe({controller:!0}):new X({controller:!0,fovy:Q})})},setPreset(e){n=e,f=e!=="clear",u()},setIntensity(e){g=e,u()},setWindSpeed(e){P=e,l.redraw("wind changed")},setWindDirection(e){C=e,l.redraw("wind changed")},setVisibility(e){d=e,u()},setFogEnabled(e){h=e,u()},setFogVariation(e){z=e,u()},setFogSpeed(e){R=e,u()},setTime(e){E=e,F=e*R,b=0,u(),l.redraw("weather time changed")},setPlaying(e){_=e,b=0,l.setProps({_animate:k()})},reset(){c.wetness=0,c.snow=0,E=0,F=0,b=0,u(),l.redraw("reset weather")},finalize(){w.finalized||(w.finalized=!0,document.removeEventListener("visibilitychange",O),l.finalize(),s?.destroy())}}}function Me(i,o){const n=new Float32Array(98304),[h,g,P,C]=ie;for(const d of o){const z=Math.max(0,Math.floor((d.center[0]-d.size[0]/2-h)/(P-h)*256)),R=Math.min(256,Math.ceil((d.center[0]+d.size[0]/2-h)/(P-h)*256)),_=Math.max(0,Math.floor((d.center[1]-d.size[1]/2-g)/(C-g)*384)),m=Math.min(384,Math.ceil((d.center[1]+d.size[1]/2-g)/(C-g)*384));for(let f=_;f<m;f++)for(let y=z;y<R;y++)n[f*256+y]=Math.max(n[f*256+y],d.center[2]+d.size[2])}return i.createTexture({id:"weather-surface-heights",width:256,height:384,format:"r32float",data:n})}const U=document.querySelector("#backend"),oe=await pe(new URLSearchParams(location.search).get("backend"));U.value=oe;const r=ke(document.querySelector("#scene"),{deviceType:oe});window.weatherScene=r;U.addEventListener("change",()=>{location.search=`?backend=${U.value}`});const T=document.querySelector("#preset");T.addEventListener("change",()=>{const i=T.value==="snow"?"snow":T.value==="rain"?"rain":T.value==="clouds"?"clouds":"clear";r.setPreset(i),document.querySelector("#clouds").checked=i!=="clear"});const W=document.querySelector("#fog-enabled");W.addEventListener("change",()=>{r.setFogEnabled(W.checked);for(const i of["visibility","fog-variation","fog-speed"])document.querySelector(`#${i}`).disabled=!W.checked});for(const[i,o]of[["clouds",r.setClouds],["surface-enabled",r.setSurfaceEnabled],["accumulate",r.setAccumulation]]){const t=document.querySelector(`#${i}`);t.addEventListener("change",()=>o(t.checked))}document.querySelector("#scene").addEventListener("weather-frame",()=>{for(const[i,o]of[["wetness",r.surfaceSettings.wetness],["snow-cover",r.surfaceSettings.snow]]){const t=document.querySelector(`#${i}`);document.activeElement!==t&&(t.value=String(o))}});const ee=document.querySelector("#playing");ee.addEventListener("change",()=>r.setPlaying(ee.checked));for(const[i,o]of[["hour",r.setHour],["intensity",r.setIntensity],["wind-speed",r.setWindSpeed],["wind-direction",r.setWindDirection],["visibility",r.setVisibility],["fog-variation",r.setFogVariation],["fog-speed",r.setFogSpeed],["wetness",r.setWetness],["snow-cover",r.setSnowCover],["puddles",r.setPuddles]]){const t=document.querySelector(`#${i}`);t.addEventListener("input",()=>o(Number(t.value)))}document.querySelector("#center").addEventListener("click",()=>r.centerView());for(const i of["sun","moon"])document.querySelector(`#look-${i}`).addEventListener("click",()=>{r.lookAtBody(i),document.querySelector("#hour").value=String(r.diagnostics.hour)});document.querySelector("#reset").addEventListener("click",()=>r.reset());r.ready.then(()=>{document.body.dataset.ready="true"}).catch(i=>{document.querySelector("#status").textContent=i.message});window.addEventListener("pagehide",()=>r.finalize());
