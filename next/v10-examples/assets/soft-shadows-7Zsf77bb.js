import{k as v,l as Re,T as re,M as xe,S as Te,L as ze,p as je,h as Ae,j as Fe,b as Ee,c as Be,r as Oe}from"./deck-example-device-TQPRJnZ6.js";import{i as Ne}from"./example-support-KHcxfZf7.js";import{c as ne,a as se,A as Ue,S as Ve,M as qe,C as We}from"./atmosphere-layer-DUCJDyks.js";import{g as He,b as $e,a as Ge}from"./cloud-spectral-Bxz9AmFy.js";import{a as ye,C as b,m as Xe}from"./river-district-data-C9FvyLLC.js";import{b as q,g as j,a as D,D as N,S as Ye,F as U,L as ce,f as Ke}from"./riverfront-sky-lighting-Bovga_iV.js";import{p as Qe}from"./project32-Byi-VnKS.js";import{g as Ze}from"./meter-offset-position-CMR-ehQ5.js";import{l as Je}from"./lambert-material-DjV_YOPi.js";import"./point-glow-DAMvtmjx.js";const et=Object.freeze({low:Object.freeze({cascadeCount:3,directionalMapSize:1024,spotMapSize:512,pointMapSize:256,blockerSampleCount:8,filterSampleCount:12,contactScale:.5,contactStepCount:12}),balanced:Object.freeze({cascadeCount:4,directionalMapSize:1536,spotMapSize:1024,pointMapSize:512,blockerSampleCount:16,filterSampleCount:24,contactScale:.75,contactStepCount:24}),cinematic:Object.freeze({cascadeCount:4,directionalMapSize:2048,spotMapSize:2048,pointMapSize:1024,blockerSampleCount:24,filterSampleCount:48,contactScale:1,contactStepCount:40})}),tt=1,be=4,Ce=4,E=4,_=6,it=.1,oe=[1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1],ot=[1,0,0,0,0,1,0,0,0,1,0,0,0,0,0,1],Pe=[{face:"+X",direction:[1,0,0],up:[0,-1,0]},{face:"-X",direction:[-1,0,0],up:[0,-1,0]},{face:"+Y",direction:[0,1,0],up:[0,0,1]},{face:"-Y",direction:[0,-1,0],up:[0,0,-1]},{face:"+Z",direction:[0,0,1],up:[0,-1,0]},{face:"-Z",direction:[0,0,-1],up:[0,-1,0]}];let de=0;class at{device;props;inputProps;resources;destroyed=!1;constructor(t,i={}){if(t.type!=="webgpu"&&t.type!=="webgl")throw new Error("ShadowMapRenderer requires a WebGPU or WebGL2 device.");this.device=t,this.inputProps={...i},this.props=le(t,this.inputProps),this.resources=he(t,this.props)}setProps(t){this.assertNotDestroyed();const i={...this.inputProps,...t},o=le(this.device,i),r=!dt(this.props,o);if(this.inputProps=i,this.props=o,!r)return;const s=this.resources;this.resources=he(this.device,o),pe(s)}render(t){this.assertNotDestroyed(),lt(t.camera);const i=t.directionalLights||[],o=t.spotLights||[],r=t.pointLights||[];Z("directional",i.length,this.props.directionalLightCapacity),Z("spot",o.length,this.props.spotLightCapacity),Z("point",r.length,this.props.pointLightCapacity);const s=[];let p=fe([],t.camera.far);if(i[0]){const c=ue(i[0],t.camera);p=fe(rt(t.camera.near,c.shadowDistance,this.props.cascadeCount,c.cascadeSplitLambda),c.shadowDistance),s.push(...nt(t.camera,c,p,this.props.cascadeCount,this.props.directionalMapSize)),s.forEach((u,d)=>{this.renderView({framebuffer:this.resources.directionalFramebuffers[d],view:u,type:"directional",lightIndex:0,cascadeIndex:d,mapSize:this.props.directionalMapSize,light:c,drawShadowCasters:t.drawShadowCasters})})}const w=o.map(c=>st(X(c)));w.forEach((c,u)=>{this.renderView({framebuffer:this.resources.spotFramebuffers[u],view:c,type:"spot",lightIndex:u,mapSize:this.props.spotMapSize,light:X(o[u]),drawShadowCasters:t.drawShadowCasters})});const x=r.flatMap(c=>ct(Y(c)));return r.forEach((c,u)=>{const d=Y(c);for(let S=0;S<_;S++){const C=u*_+S;this.renderView({framebuffer:this.resources.pointFramebuffers[C],view:x[C],type:"point",lightIndex:u,pointFace:Pe[S].face,mapSize:this.props.pointMapSize,light:d,drawShadowCasters:t.drawShadowCasters})}}),{quality:this.props.quality,cascadeCount:this.props.cascadeCount,cascadeSplits:p,blockerSampleCount:this.props.blockerSampleCount,filterSampleCount:this.props.filterSampleCount,directionalLights:i.map(c=>ue(c,t.camera)),spotLights:o.map(X),pointLights:r.map(Y),directionalViewProjectionMatrices:J(s.map(c=>c.viewProjectionMatrix),E),spotViewProjectionMatrices:J(w.map(c=>c.viewProjectionMatrix),be),pointViewProjectionMatrices:J(x.map(c=>c.viewProjectionMatrix),Ce*_),directionalShadowTexture:this.resources.directionalTexture,spotShadowTexture:this.resources.spotTexture,pointShadowTexture:this.resources.pointTexture,comparisonSampler:this.resources.comparisonSampler,nonFilteringSampler:this.resources.nonFilteringSampler}}destroy(){this.destroyed||(this.destroyed=!0,pe(this.resources))}renderView(t){const i=Object.freeze({depthWriteEnabled:!0,depthCompare:"less-equal",depthBias:t.light.depthBias,depthBiasSlopeScale:t.light.depthBiasSlopeScale,cullMode:"back"}),o=this.device.beginRenderPass({id:R(`${t.type}-shadow-pass`),framebuffer:t.framebuffer,clearDepth:1});try{t.drawShadowCasters({renderPass:o,type:t.type,lightIndex:t.lightIndex,cascadeIndex:t.cascadeIndex,pointFace:t.pointFace,camera:t.view.camera,viewProjectionMatrix:t.view.viewProjectionMatrix,mapSize:t.mapSize,rasterParameters:i})}finally{o.end()}}assertNotDestroyed(){if(this.destroyed)throw new Error("ShadowMapRenderer has been destroyed.")}}function rt(e,t,i,o=.5){if(!(e>0&&t>e))throw new Error("Cascade split range requires 0 < near < far.");if(!Number.isInteger(i)||i<1||i>E)throw new Error(`Cascade count must be an integer from 1 to ${E}.`);const r=B(o,0,1),s=[];for(let p=1;p<=i;p++){const w=p/i,x=e*Math.pow(t/e,w),c=e+(t-e)*w;s.push(c*(1-r)+x*r)}return s}function nt(e,t,i,o,r){const s=new v(e.projectionMatrix).multiplyRight(e.viewMatrix).invert(),p=me(s,e.clipDepth==="zero-to-one"?0:-1),w=me(s,1),x=I(t.direction),c=[];let u=e.near;for(let d=0;d<o;d++){const S=i[d],C=(u-e.near)/(e.far-e.near),T=(S-e.near)/(e.far-e.near),k=[];for(let M=0;M<4;M++)k.push(ve(p[M],w[M],C)),k.push(ve(p[M],w[M],T));const m=ht(k);let f=0;for(const M of k)f=Math.max(f,pt(m,M));f=Math.ceil(f*16)/16;const g=f*2/r,z=A(x,-1),n=Math.abs(z[1])>.99?[0,0,1]:[0,1,0],a=I(ge(z,n)),l=I(ge(a,z)),y=we(m,a),L=we(m,l),P=F(m,F(A(a,Math.round(y/g)*g-y),A(l,Math.round(L/g)*g-L))),H=F(P,A(x,f+t.casterDistance)),O=new v().lookAt({eye:H,center:P,up:l}),ae=new v(oe).multiplyRight(new v().ortho({left:-f,right:f,bottom:-f,top:f,near:.01,far:f*2+t.casterDistance}));c.push({camera:{viewMatrix:O,projectionMatrix:ae,near:.01,far:f*2+t.casterDistance,clipDepth:"zero-to-one"},viewProjectionMatrix:new v(ae).multiplyRight(O)}),u=S}return c}function st(e){const t=I(e.direction),i=Math.abs(t[1])>.99?[0,0,1]:[0,1,0],o=new v().lookAt({eye:e.position,center:F(e.position,t),up:i}),r=new v(oe).multiplyRight(new v().perspective({fovy:e.outerConeAngle*2,aspect:1,near:e.nearPlane,far:e.range}));return{camera:{viewMatrix:o,projectionMatrix:r,near:e.nearPlane,far:e.range,clipDepth:"zero-to-one"},viewProjectionMatrix:new v(r).multiplyRight(o)}}function ct(e){const t=new v(oe).multiplyRight(new v().perspective({fovy:Re(90),aspect:1,near:e.nearPlane,far:e.range}));return Pe.map(i=>{const o=new v().lookAt({eye:e.position,center:F(e.position,i.direction),up:i.up});return{camera:{viewMatrix:o,projectionMatrix:t,near:e.nearPlane,far:e.range,clipDepth:"zero-to-one"},viewProjectionMatrix:new v(t).multiplyRight(o)}})}function le(e,t){const i=t.quality||"balanced",o=et[i];if(!o)throw new Error(`Unknown shadow quality: ${String(i)}.`);const r={quality:i,directionalLightCapacity:t.directionalLightCapacity??1,spotLightCapacity:t.spotLightCapacity??1,pointLightCapacity:t.pointLightCapacity??1,directionalMapSize:t.directionalMapSize??o.directionalMapSize,spotMapSize:t.spotMapSize??o.spotMapSize,pointMapSize:t.pointMapSize??o.pointMapSize,cascadeCount:o.cascadeCount,blockerSampleCount:o.blockerSampleCount,filterSampleCount:o.filterSampleCount};K("directionalLightCapacity",r.directionalLightCapacity,tt),K("spotLightCapacity",r.spotLightCapacity,be),K("pointLightCapacity",r.pointLightCapacity,Ce),Q(e,"directionalMapSize",r.directionalMapSize),Q(e,"spotMapSize",r.spotMapSize),Q(e,"pointMapSize",r.pointMapSize);const s=Math.max(_,r.pointLightCapacity*_);if(s>e.limits.maxTextureArrayLayers)throw new Error(`pointLightCapacity requires ${s} array layers, exceeding the device limit ${e.limits.maxTextureArrayLayers}.`);return r}function he(e,t){const i=Math.max(1,t.directionalLightCapacity*t.cascadeCount),o=Math.max(1,t.spotLightCapacity),r=Math.max(_,t.pointLightCapacity*_),s=e.createSampler({id:R("shadow-comparison-sampler"),type:"comparison-sampler",compare:"less-equal",minFilter:"linear",magFilter:"linear",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge"}),p=e.createSampler({id:R("shadow-depth-sampler"),minFilter:"nearest",magFilter:"nearest",addressModeU:"clamp-to-edge",addressModeV:"clamp-to-edge",addressModeW:"clamp-to-edge"}),w=$(e,"directional-shadow-map","2d-array",t.directionalMapSize,i,p),x=$(e,"spot-shadow-map","2d-array",t.spotMapSize,o,p),c=$(e,"point-shadow-map",e.type==="webgpu"?"cube-array":"2d-array",t.pointMapSize,r,p),u=[],d=G(e,w,t.directionalMapSize,i,u),S=G(e,x,t.spotMapSize,o,u),C=G(e,c,t.pointMapSize,r,u);return{directionalTexture:w,spotTexture:x,pointTexture:c,comparisonSampler:s,nonFilteringSampler:p,directionalFramebuffers:d,spotFramebuffers:S,pointFramebuffers:C,attachmentViews:u}}function $(e,t,i,o,r,s){return e.createTexture({id:R(t),dimension:i,format:"depth32float",width:o,height:o,depth:r,sampler:s,usage:re.SAMPLE|re.RENDER})}function G(e,t,i,o,r){return Array.from({length:o},(s,p)=>{const w=t.createView({id:R("shadow-layer-view"),format:t.format,dimension:"2d",baseMipLevel:0,mipLevelCount:1,baseArrayLayer:p,arrayLayerCount:1});return r.push(w),e.createFramebuffer({id:R("shadow-layer-framebuffer"),width:i,height:i,colorAttachments:[],depthStencilAttachment:w})})}function pe(e){for(const t of[...e.directionalFramebuffers,...e.spotFramebuffers,...e.pointFramebuffers])t.destroy();for(const t of e.attachmentViews)t.destroy();e.directionalTexture.destroy(),e.spotTexture.destroy(),e.pointTexture.destroy(),e.comparisonSampler.destroy(),e.nonFilteringSampler.destroy()}function dt(e,t){return e.cascadeCount===t.cascadeCount&&e.directionalLightCapacity===t.directionalLightCapacity&&e.spotLightCapacity===t.spotLightCapacity&&e.pointLightCapacity===t.pointLightCapacity&&e.directionalMapSize===t.directionalMapSize&&e.spotMapSize===t.spotMapSize&&e.pointMapSize===t.pointMapSize}function ue(e,t){const i=B(e.shadowDistance??t.far,t.near,t.far);return{direction:I(e.direction),shadowDistance:i,casterDistance:e.casterDistance??i,sourceAngularRadius:e.sourceAngularRadius??.00465,cascadeSplitLambda:e.cascadeSplitLambda??.5,cascadeBlendFraction:e.cascadeBlendFraction??.1,farFadeFraction:e.farFadeFraction??.1,normalBias:e.normalBias??.04,depthBias:e.depthBias??2,depthBiasSlopeScale:e.depthBiasSlopeScale??2,strength:B(e.strength??1,0,1)}}function X(e){if(Me("Spot shadow",e.range),!(e.outerConeAngle>0&&e.outerConeAngle<Math.PI/2))throw new Error("Spot shadow outerConeAngle must be between 0 and PI / 2 radians.");return{position:[...e.position],direction:I(e.direction),range:e.range,outerConeAngle:e.outerConeAngle,nearPlane:Le(e.nearPlane,e.range),sourceRadius:e.sourceRadius??.2,normalBias:e.normalBias??.025,depthBias:e.depthBias??2,depthBiasSlopeScale:e.depthBiasSlopeScale??2,strength:B(e.strength??1,0,1)}}function Y(e){return Me("Point shadow",e.range),{position:[...e.position],range:e.range,nearPlane:Le(e.nearPlane,e.range),sourceRadius:e.sourceRadius??.2,normalBias:e.normalBias??.025,depthBias:e.depthBias??2,depthBiasSlopeScale:e.depthBiasSlopeScale??2,strength:B(e.strength??1,0,1)}}function Le(e,t){const i=e??Math.max(it,t/1e3);if(!(i>0&&i<t))throw new Error("Shadow nearPlane must be greater than zero and less than range.");return i}function lt(e){if(!(e.near>0&&e.far>e.near))throw new Error("ShadowCamera requires 0 < near < far.")}function K(e,t,i){if(!Number.isInteger(t)||t<0||t>i)throw new Error(`${e} must be an integer from 0 to ${i}.`)}function Q(e,t,i){if(!Number.isInteger(i)||i<1||i>e.limits.maxTextureDimension2D)throw new Error(`${t} must be a positive integer no greater than ${e.limits.maxTextureDimension2D}.`)}function Z(e,t,i){if(t>i)throw new Error(`${e} shadow light count ${t} exceeds configured capacity ${i}.`)}function Me(e,t){if(!(t>0&&Number.isFinite(t)))throw new Error(`${e} range must be a finite positive number.`)}function fe(e,t){const i=e.slice(0,E);for(;i.length<E;)i.push(i[i.length-1]??t);return i}function J(e,t){const i=e.slice(0,t);for(;i.length<t;)i.push(ot);return i}function me(e,t){return[V(e,[-1,-1,t]),V(e,[1,-1,t]),V(e,[1,1,t]),V(e,[-1,1,t])]}function V(e,t){const i=t[0],o=t[1],r=t[2],s=e[3]*i+e[7]*o+e[11]*r+e[15];return[(e[0]*i+e[4]*o+e[8]*r+e[12])/s,(e[1]*i+e[5]*o+e[9]*r+e[13])/s,(e[2]*i+e[6]*o+e[10]*r+e[14])/s]}function I(e){const t=Math.hypot(e[0],e[1],e[2]);if(!(t>0))throw new Error("Shadow light direction must be non-zero.");return[e[0]/t,e[1]/t,e[2]/t]}function F(e,t){return[e[0]+t[0],e[1]+t[1],e[2]+t[2]]}function A(e,t){return[e[0]*t,e[1]*t,e[2]*t]}function we(e,t){return e[0]*t[0]+e[1]*t[1]+e[2]*t[2]}function ge(e,t){return[e[1]*t[2]-e[2]*t[1],e[2]*t[0]-e[0]*t[2],e[0]*t[1]-e[1]*t[0]]}function ve(e,t,i){return[e[0]+(t[0]-e[0])*i,e[1]+(t[1]-e[1])*i,e[2]+(t[2]-e[2])*i]}function ht(e){const t=[0,0,0];for(const i of e)t[0]+=i[0],t[1]+=i[1],t[2]+=i[2];return A(t,1/e.length)}function pt(e,t){return Math.hypot(e[0]-t[0],e[1]-t[1],e[2]-t[2])}function B(e,t,i){return Math.max(t,Math.min(i,e))}function R(e){return de+=1,`${e}-${de}`}const ut=`
precision highp sampler2DArray;
struct DirectionalShadowLightUniform {
  vec3 direction;
  float strength;
  float normalBias;
  float sourceAngularRadius;
  float cascadeBlendFraction;
  float farFadeFraction;
  float shadowDistance;
};
struct SpotShadowLightUniform {
  vec3 position;
  float range;
  vec3 direction;
  float outerConeCos;
  float sourceRadius;
  float normalBias;
  float strength;
  float nearPlane;
};
struct PointShadowLightUniform {
  vec3 position;
  float range;
  float sourceRadius;
  float normalBias;
  float strength;
  float nearPlane;
};
layout(std140) uniform shadowUniforms {
  int directionalLightCount;
  int spotLightCount;
  int pointLightCount;
  int cascadeCount;
  int blockerSampleCount;
  int filterSampleCount;
  vec4 cascadeSplits;
  mat4 directionalViewProjectionMatrices[4];
  mat4 spotViewProjectionMatrices[4];
  mat4 pointViewProjectionMatrices[24];
  DirectionalShadowLightUniform directionalLights[1];
  SpotShadowLightUniform spotLights[4];
  PointShadowLightUniform pointLights[4];
} shadow;
uniform sampler2DArray directionalShadowTexture;
uniform sampler2DArray spotShadowTexture;
uniform sampler2DArray pointShadowTexture;
const float SHADOW_PI = 3.141592653589793;
float shadow_hash(vec3 position) {
  return fract(sin(dot(position, vec3(12.9898, 78.233, 37.719))) * 43758.5453);
}
vec2 shadow_diskSample(int index, int count, float rotation) {
  float fraction = (float(index) + 0.5) / max(float(count), 1.0);
  float angle = float(index) * 2.39996323 + rotation;
  return sqrt(fraction) * vec2(cos(angle), sin(angle));
}
vec3 shadow_project(mat4 matrix, vec3 worldPosition) {
  vec4 clip = matrix * vec4(worldPosition, 1.0);
  vec3 projected = clip.xyz / max(abs(clip.w), 0.00001);
  // Shared matrices retain [0,1] depth; WebGL texture rows start at the bottom.
  return vec3(projected.xy * 0.5 + 0.5, projected.z);
}
bool shadow_validProjection(vec3 projected) {
  return all(greaterThanEqual(projected, vec3(0.0))) && all(lessThanEqual(projected, vec3(1.0)));
}
// Bilinear interpolation of four depth comparisons matches a hardware 2x2 PCF lookup.
float shadow_compare(sampler2DArray shadowMap, vec2 coordinate, int layer, float reference) {
  ivec2 dimensions = textureSize(shadowMap, 0).xy;
  vec2 position = coordinate * vec2(dimensions) - 0.5;
  ivec2 base = ivec2(floor(position));
  vec2 fraction = fract(position);
  ivec2 maximum = dimensions - 1;
  float lowerLeft = step(reference, texelFetch(shadowMap, ivec3(clamp(base, ivec2(0), maximum), layer), 0).r);
  float lowerRight = step(reference, texelFetch(shadowMap, ivec3(clamp(base + ivec2(1,0), ivec2(0), maximum), layer), 0).r);
  float upperLeft = step(reference, texelFetch(shadowMap, ivec3(clamp(base + ivec2(0,1), ivec2(0), maximum), layer), 0).r);
  float upperRight = step(reference, texelFetch(shadowMap, ivec3(clamp(base + ivec2(1,1), ivec2(0), maximum), layer), 0).r);
  return mix(mix(lowerLeft, lowerRight, fraction.x), mix(upperLeft, upperRight, fraction.x), fraction.y);
}
float shadow_arrayPCSS(sampler2DArray shadowMap, int layer, vec3 projected, float searchRadius, float rotation, float penumbraScale) {
  if (!shadow_validProjection(projected)) return 1.0;
  float texel = 1.0 / float(textureSize(shadowMap, 0).x);
  searchRadius = max(texel, searchRadius);
  float blockerDepth = 0.0;
  float blockerCount = 0.0;
  for (int index = 0; index < 24; index++) {
    if (index >= shadow.blockerSampleCount) break;
    vec2 coordinate = clamp(projected.xy + shadow_diskSample(index, shadow.blockerSampleCount, rotation) * searchRadius, vec2(0.0), vec2(1.0));
    float depth = textureLod(shadowMap, vec3(coordinate, float(layer)), 0.0).r;
    if (depth < projected.z) { blockerDepth += depth; blockerCount += 1.0; }
  }
  if (blockerCount == 0.0) return 1.0;
  float averageBlocker = blockerDepth / blockerCount;
  float penumbra = clamp((projected.z - averageBlocker) / max(abs(averageBlocker), 0.001), 0.0, 1.0);
  float radius = max(texel, searchRadius * (1.0 + penumbra * penumbraScale));
  float visibility = 0.0;
  for (int index = 0; index < 48; index++) {
    if (index >= shadow.filterSampleCount) break;
    vec2 coordinate = clamp(projected.xy + shadow_diskSample(index, shadow.filterSampleCount, rotation) * radius, vec2(0.0), vec2(1.0));
    visibility += shadow_compare(shadowMap, coordinate, layer, projected.z);
  }
  return visibility / max(float(shadow.filterSampleCount), 1.0);
}
int shadow_directionalCascadeIndex(float viewDepth) {
  int cascadeIndex = 0;
  for (int index = 0; index < 4; index++) {
    if (index >= shadow.cascadeCount) break;
    cascadeIndex = index;
    if (viewDepth <= shadow.cascadeSplits[index]) break;
  }
  return cascadeIndex;
}
int shadow_getDirectionalCascadeIndex(float viewDepth) {
  return shadow.directionalLightCount == 0 ? -1 : shadow_directionalCascadeIndex(viewDepth);
}
float shadow_directionalPCSS(int cascadeIndex, vec3 worldPosition, float viewDepth) {
  DirectionalShadowLightUniform light = shadow.directionalLights[0];
  return shadow_arrayPCSS(directionalShadowTexture, cascadeIndex,
    shadow_project(shadow.directionalViewProjectionMatrices[cascadeIndex], worldPosition),
    light.sourceAngularRadius * viewDepth / max(light.shadowDistance, 0.001),
    shadow_hash(worldPosition) * 2.0 * SHADOW_PI, 18.0);
}
float shadow_getDirectionalFactor(vec3 worldPosition, vec3 worldNormal, float viewDepth) {
  if (shadow.directionalLightCount == 0 || viewDepth <= 0.0) return 1.0;
  DirectionalShadowLightUniform light = shadow.directionalLights[0];
  if (viewDepth >= light.shadowDistance) return 1.0;
  vec3 position = worldPosition + normalize(worldNormal) * light.normalBias;
  int cascadeIndex = shadow_directionalCascadeIndex(viewDepth);
  float visibility = shadow_directionalPCSS(cascadeIndex, position, viewDepth);
  if (cascadeIndex + 1 < shadow.cascadeCount) {
    float cascadeStart = cascadeIndex > 0 ? shadow.cascadeSplits[cascadeIndex - 1] : 0.0;
    float cascadeEnd = shadow.cascadeSplits[cascadeIndex];
    float blendWidth = max((cascadeEnd - cascadeStart) * light.cascadeBlendFraction, 0.0001);
    float blend = smoothstep(cascadeEnd - blendWidth, cascadeEnd, viewDepth);
    if (blend > 0.0) visibility = mix(visibility, shadow_directionalPCSS(cascadeIndex + 1, position, viewDepth), blend);
  }
  float fadeWidth = max(light.shadowDistance * light.farFadeFraction, 0.0001);
  visibility = mix(visibility, 1.0, smoothstep(light.shadowDistance - fadeWidth, light.shadowDistance, viewDepth));
  return mix(1.0, visibility, light.strength);
}
float shadow_getSpotFactor(int lightIndex, vec3 worldPosition, vec3 worldNormal) {
  if (lightIndex < 0 || lightIndex >= shadow.spotLightCount) return 1.0;
  SpotShadowLightUniform light = shadow.spotLights[lightIndex];
  vec3 fromLight = worldPosition - light.position;
  float distanceToLight = length(fromLight);
  if (distanceToLight >= light.range || dot(normalize(fromLight), normalize(light.direction)) < light.outerConeCos) return 1.0;
  vec3 position = worldPosition + normalize(worldNormal) * light.normalBias;
  float visibility = shadow_arrayPCSS(spotShadowTexture, lightIndex,
    shadow_project(shadow.spotViewProjectionMatrices[lightIndex], position),
    light.sourceRadius / max(distanceToLight, 0.001) * 0.5,
    shadow_hash(worldPosition) * 2.0 * SHADOW_PI, 16.0);
  return mix(1.0, visibility, light.strength);
}
float shadow_pointReferenceDepth(float majorDistance, float nearPlane, float farPlane) {
  return farPlane / (farPlane - nearPlane) - (farPlane * nearPlane) / ((farPlane - nearPlane) * majorDistance);
}
vec3 shadow_pointCoordinate(int lightIndex, vec3 direction) {
  vec3 magnitude = abs(direction);
  int face = magnitude.x >= magnitude.y && magnitude.x >= magnitude.z ? (direction.x >= 0.0 ? 0 : 1)
    : magnitude.y >= magnitude.z ? (direction.y >= 0.0 ? 2 : 3) : (direction.z >= 0.0 ? 4 : 5);
  PointShadowLightUniform light = shadow.pointLights[lightIndex];
  vec3 projected = shadow_project(shadow.pointViewProjectionMatrices[lightIndex * 6 + face], light.position + direction * light.range * 0.5);
  return vec3(projected.xy, float(lightIndex * 6 + face));
}
float shadow_getPointFactor(int lightIndex, vec3 worldPosition, vec3 worldNormal) {
  if (lightIndex < 0 || lightIndex >= shadow.pointLightCount) return 1.0;
  PointShadowLightUniform light = shadow.pointLights[lightIndex];
  vec3 fromLight = worldPosition + normalize(worldNormal) * light.normalBias - light.position;
  float distanceToLight = length(fromLight);
  if (distanceToLight >= light.range || distanceToLight <= light.nearPlane) return 1.0;
  vec3 direction = normalize(fromLight);
  float referenceDepth = shadow_pointReferenceDepth(max(max(abs(fromLight.x), abs(fromLight.y)), abs(fromLight.z)), light.nearPlane, light.range);
  vec3 reference = abs(direction.y) > 0.99 ? vec3(0,0,1) : vec3(0,1,0);
  vec3 tangent = normalize(cross(direction, reference));
  vec3 bitangent = normalize(cross(direction, tangent));
  float searchRadius = light.sourceRadius / max(distanceToLight, 0.001);
  float rotation = shadow_hash(worldPosition) * 2.0 * SHADOW_PI;
  float blockerDepth = 0.0;
  float blockerCount = 0.0;
  for (int index = 0; index < 24; index++) {
    if (index >= shadow.blockerSampleCount) break;
    vec2 disk = shadow_diskSample(index, shadow.blockerSampleCount, rotation) * searchRadius;
    vec3 coordinate = shadow_pointCoordinate(lightIndex, normalize(direction + tangent * disk.x + bitangent * disk.y));
    float depth = textureLod(pointShadowTexture, coordinate, 0.0).r;
    if (depth < referenceDepth) { blockerDepth += depth; blockerCount += 1.0; }
  }
  if (blockerCount == 0.0) return 1.0;
  float averageBlocker = blockerDepth / blockerCount;
  float penumbra = clamp((referenceDepth - averageBlocker) / max(abs(averageBlocker), 0.001), 0.0, 1.0);
  float radius = searchRadius * (1.0 + penumbra * 12.0);
  float visibility = 0.0;
  for (int index = 0; index < 48; index++) {
    if (index >= shadow.filterSampleCount) break;
    vec2 disk = shadow_diskSample(index, shadow.filterSampleCount, rotation) * radius;
    vec3 coordinate = shadow_pointCoordinate(lightIndex, normalize(direction + tangent * disk.x + bitangent * disk.y));
    visibility += shadow_compare(pointShadowTexture, coordinate.xy, int(coordinate.z), referenceDepth);
  }
  return mix(1.0, visibility / max(float(shadow.filterSampleCount), 1.0), light.strength);
}
`,ft=4,ee=4,De=4,mt=24,wt={direction:"vec3<f32>",strength:"f32",normalBias:"f32",sourceAngularRadius:"f32",cascadeBlendFraction:"f32",farFadeFraction:"f32",shadowDistance:"f32"},gt={position:"vec3<f32>",range:"f32",direction:"vec3<f32>",outerConeCos:"f32",sourceRadius:"f32",normalBias:"f32",strength:"f32",nearPlane:"f32"},vt={position:"vec3<f32>",range:"f32",sourceRadius:"f32",normalBias:"f32",strength:"f32",nearPlane:"f32"},St=`const SHADOW_PI: f32 = 3.141592653589793;

struct DirectionalShadowLightUniform {
  direction: vec3f,
  strength: f32,
  normalBias: f32,
  sourceAngularRadius: f32,
  cascadeBlendFraction: f32,
  farFadeFraction: f32,
  shadowDistance: f32,
};

struct SpotShadowLightUniform {
  position: vec3f,
  range: f32,
  direction: vec3f,
  outerConeCos: f32,
  sourceRadius: f32,
  normalBias: f32,
  strength: f32,
  nearPlane: f32,
};

struct PointShadowLightUniform {
  position: vec3f,
  range: f32,
  sourceRadius: f32,
  normalBias: f32,
  strength: f32,
  nearPlane: f32,
};

struct ShadowUniforms {
  directionalLightCount: i32,
  spotLightCount: i32,
  pointLightCount: i32,
  cascadeCount: i32,
  blockerSampleCount: i32,
  filterSampleCount: i32,
  cascadeSplits: vec4f,
  directionalViewProjectionMatrices: array<mat4x4f, 4>,
  spotViewProjectionMatrices: array<mat4x4f, 4>,
  pointViewProjectionMatrices: array<mat4x4f, 24>,
  directionalLights: array<DirectionalShadowLightUniform, 1>,
  spotLights: array<SpotShadowLightUniform, 4>,
  pointLights: array<PointShadowLightUniform, 4>,
};

@group(2) @binding(auto) var<uniform> shadow: ShadowUniforms;
@group(2) @binding(auto) var directionalShadowTexture: texture_depth_2d_array;
@group(2) @binding(auto) var spotShadowTexture: texture_depth_2d_array;
@group(2) @binding(auto) var pointShadowTexture: texture_depth_cube_array;
@group(2) @binding(auto) var directionalShadowTextureSampler: sampler;
@group(2) @binding(auto) var shadowComparisonSampler: sampler_comparison;

fn shadow_hash(position: vec3f) -> f32 {
  return fract(sin(dot(position, vec3f(12.9898, 78.233, 37.719))) * 43758.5453);
}

fn shadow_diskSample(index: i32, count: i32, rotation: f32) -> vec2f {
  let fraction = (f32(index) + 0.5) / max(f32(count), 1.0);
  let angle = f32(index) * 2.39996323 + rotation;
  return sqrt(fraction) * vec2f(cos(angle), sin(angle));
}

fn shadow_project(matrix: mat4x4f, worldPosition: vec3f) -> vec3f {
  let clip = matrix * vec4f(worldPosition, 1.0);
  let ndc = clip.xyz / max(abs(clip.w), 0.00001);
  return vec3f(ndc.x * 0.5 + 0.5, 0.5 - ndc.y * 0.5, ndc.z);
}

fn shadow_validProjection(projected: vec3f) -> bool {
  return all(projected.xy >= vec2f(0.0)) && all(projected.xy <= vec2f(1.0)) &&
    projected.z >= 0.0 && projected.z <= 1.0;
}

fn shadow_directionalCascadeIndex(viewDepth: f32) -> i32 {
  var cascadeIndex = 0;
  for (var index: i32 = 0; index < 4; index++) {
    if (index >= shadow.cascadeCount) { break; }
    cascadeIndex = index;
    if (viewDepth <= shadow.cascadeSplits[index]) { break; }
  }
  return cascadeIndex;
}

fn shadow_getDirectionalCascadeIndex(viewDepth: f32) -> i32 {
  if (shadow.directionalLightCount == 0) { return -1; }
  return shadow_directionalCascadeIndex(viewDepth);
}

fn shadow_directionalPCSS(cascadeIndex: i32, worldPosition: vec3f, viewDepth: f32) -> f32 {
  let projected = shadow_project(shadow.directionalViewProjectionMatrices[cascadeIndex], worldPosition);
  if (!shadow_validProjection(projected)) { return 1.0; }
  let dimensions = vec2f(textureDimensions(directionalShadowTexture));
  let texel = 1.0 / dimensions;
  let light = shadow.directionalLights[0];
  let rotation = shadow_hash(worldPosition) * 2.0 * SHADOW_PI;
  let searchRadius = max(texel.x, light.sourceAngularRadius * viewDepth / max(light.shadowDistance, 0.001));
  var blockerDepth = 0.0;
  var blockerCount = 0.0;
  for (var index: i32 = 0; index < 24; index++) {
    if (index >= shadow.blockerSampleCount) { break; }
    let offset = shadow_diskSample(index, shadow.blockerSampleCount, rotation) * searchRadius;
    let sampleDepth = textureSampleLevel(
      directionalShadowTexture,
      directionalShadowTextureSampler,
      clamp(projected.xy + offset, vec2f(0.0), vec2f(1.0)),
      cascadeIndex,
      0
    );
    if (sampleDepth < projected.z) {
      blockerDepth += sampleDepth;
      blockerCount += 1.0;
    }
  }
  if (blockerCount == 0.0) { return 1.0; }
  let averageBlocker = blockerDepth / blockerCount;
  let penumbra = clamp((projected.z - averageBlocker) / max(abs(averageBlocker), 0.001), 0.0, 1.0);
  let filterRadius = max(texel.x, searchRadius * (1.0 + penumbra * 18.0));
  var visibility = 0.0;
  for (var index: i32 = 0; index < 48; index++) {
    if (index >= shadow.filterSampleCount) { break; }
    let offset = shadow_diskSample(index, shadow.filterSampleCount, rotation) * filterRadius;
    visibility += textureSampleCompareLevel(
      directionalShadowTexture,
      shadowComparisonSampler,
      clamp(projected.xy + offset, vec2f(0.0), vec2f(1.0)),
      cascadeIndex,
      projected.z
    );
  }
  return visibility / max(f32(shadow.filterSampleCount), 1.0);
}

fn shadow_getDirectionalFactor(worldPosition: vec3f, worldNormal: vec3f, viewDepth: f32) -> f32 {
  if (shadow.directionalLightCount == 0 || viewDepth <= 0.0) { return 1.0; }
  let light = shadow.directionalLights[0];
  if (viewDepth >= light.shadowDistance) { return 1.0; }
  let biasedPosition = worldPosition + normalize(worldNormal) * light.normalBias;
  let cascadeIndex = shadow_directionalCascadeIndex(viewDepth);
  var visibility = shadow_directionalPCSS(cascadeIndex, biasedPosition, viewDepth);
  if (cascadeIndex + 1 < shadow.cascadeCount) {
    var cascadeStart = 0.0;
    if (cascadeIndex > 0) { cascadeStart = shadow.cascadeSplits[cascadeIndex - 1]; }
    let cascadeEnd = shadow.cascadeSplits[cascadeIndex];
    let blendWidth = max((cascadeEnd - cascadeStart) * light.cascadeBlendFraction, 0.0001);
    let blend = smoothstep(cascadeEnd - blendWidth, cascadeEnd, viewDepth);
    if (blend > 0.0) {
      visibility = mix(
        visibility,
        shadow_directionalPCSS(cascadeIndex + 1, biasedPosition, viewDepth),
        blend
      );
    }
  }
  let fadeWidth = max(light.shadowDistance * light.farFadeFraction, 0.0001);
  let farFade = smoothstep(light.shadowDistance - fadeWidth, light.shadowDistance, viewDepth);
  visibility = mix(visibility, 1.0, farFade);
  return mix(1.0, visibility, light.strength);
}

fn shadow_spotPCSS(lightIndex: i32, worldPosition: vec3f) -> f32 {
  let projected = shadow_project(shadow.spotViewProjectionMatrices[lightIndex], worldPosition);
  if (!shadow_validProjection(projected)) { return 1.0; }
  let light = shadow.spotLights[lightIndex];
  let dimensions = vec2f(textureDimensions(spotShadowTexture));
  let texel = 1.0 / dimensions;
  let distanceToLight = length(worldPosition - light.position);
  let searchRadius = max(texel.x, light.sourceRadius / max(distanceToLight, 0.001) * 0.5);
  let rotation = shadow_hash(worldPosition) * 2.0 * SHADOW_PI;
  var blockerDepth = 0.0;
  var blockerCount = 0.0;
  for (var index: i32 = 0; index < 24; index++) {
    if (index >= shadow.blockerSampleCount) { break; }
    let offset = shadow_diskSample(index, shadow.blockerSampleCount, rotation) * searchRadius;
    let sampleDepth = textureSampleLevel(
      spotShadowTexture,
      directionalShadowTextureSampler,
      clamp(projected.xy + offset, vec2f(0.0), vec2f(1.0)),
      lightIndex,
      0
    );
    if (sampleDepth < projected.z) { blockerDepth += sampleDepth; blockerCount += 1.0; }
  }
  if (blockerCount == 0.0) { return 1.0; }
  let averageBlocker = blockerDepth / blockerCount;
  let penumbra = clamp((projected.z - averageBlocker) / max(abs(averageBlocker), 0.001), 0.0, 1.0);
  let filterRadius = max(texel.x, searchRadius * (1.0 + penumbra * 16.0));
  var visibility = 0.0;
  for (var index: i32 = 0; index < 48; index++) {
    if (index >= shadow.filterSampleCount) { break; }
    let offset = shadow_diskSample(index, shadow.filterSampleCount, rotation) * filterRadius;
    visibility += textureSampleCompareLevel(
      spotShadowTexture,
      shadowComparisonSampler,
      clamp(projected.xy + offset, vec2f(0.0), vec2f(1.0)),
      lightIndex,
      projected.z
    );
  }
  return visibility / max(f32(shadow.filterSampleCount), 1.0);
}

fn shadow_getSpotFactor(lightIndex: i32, worldPosition: vec3f, worldNormal: vec3f) -> f32 {
  if (lightIndex < 0 || lightIndex >= shadow.spotLightCount) { return 1.0; }
  let light = shadow.spotLights[lightIndex];
  let fromLight = worldPosition - light.position;
  let distanceToLight = length(fromLight);
  let coneCos = dot(normalize(fromLight), normalize(light.direction));
  if (distanceToLight >= light.range || coneCos < light.outerConeCos) { return 1.0; }
  let biasedPosition = worldPosition + normalize(worldNormal) * light.normalBias;
  return mix(1.0, shadow_spotPCSS(lightIndex, biasedPosition), light.strength);
}

fn shadow_pointReferenceDepth(majorDistance: f32, nearPlane: f32, farPlane: f32) -> f32 {
  // Match the cube-face projection and stored WebGPU depth in [0, 1].
  return farPlane / (farPlane - nearPlane) -
    (farPlane * nearPlane) / ((farPlane - nearPlane) * majorDistance);
}

fn shadow_pointBasis(direction: vec3f) -> mat2x3f {
  let reference = select(vec3f(0.0, 1.0, 0.0), vec3f(0.0, 0.0, 1.0), abs(direction.y) > 0.99);
  let tangent = normalize(cross(direction, reference));
  return mat2x3f(tangent, normalize(cross(direction, tangent)));
}

fn shadow_getPointFactor(lightIndex: i32, worldPosition: vec3f, worldNormal: vec3f) -> f32 {
  if (lightIndex < 0 || lightIndex >= shadow.pointLightCount) { return 1.0; }
  let light = shadow.pointLights[lightIndex];
  let biasedPosition = worldPosition + normalize(worldNormal) * light.normalBias;
  let fromLight = biasedPosition - light.position;
  let distanceToLight = length(fromLight);
  if (distanceToLight >= light.range || distanceToLight <= light.nearPlane) { return 1.0; }
  let direction = normalize(fromLight);
  let majorDistance = max(max(abs(fromLight.x), abs(fromLight.y)), abs(fromLight.z));
  let referenceDepth = shadow_pointReferenceDepth(majorDistance, light.nearPlane, light.range);
  let searchRadius = light.sourceRadius / max(distanceToLight, 0.001);
  let rotation = shadow_hash(worldPosition) * 2.0 * SHADOW_PI;
  let basis = shadow_pointBasis(direction);
  var blockerDepth = 0.0;
  var blockerCount = 0.0;
  for (var index: i32 = 0; index < 24; index++) {
    if (index >= shadow.blockerSampleCount) { break; }
    let disk = shadow_diskSample(index, shadow.blockerSampleCount, rotation) * searchRadius;
    let sampleDirection = normalize(direction + basis[0] * disk.x + basis[1] * disk.y);
    let sampleDepth = textureSampleLevel(
      pointShadowTexture,
      directionalShadowTextureSampler,
      sampleDirection,
      lightIndex,
      0
    );
    if (sampleDepth < referenceDepth) { blockerDepth += sampleDepth; blockerCount += 1.0; }
  }
  if (blockerCount == 0.0) { return 1.0; }
  let averageBlocker = blockerDepth / blockerCount;
  let penumbra = clamp((referenceDepth - averageBlocker) / max(abs(averageBlocker), 0.001), 0.0, 1.0);
  let filterRadius = searchRadius * (1.0 + penumbra * 12.0);
  var visibility = 0.0;
  for (var index: i32 = 0; index < 48; index++) {
    if (index >= shadow.filterSampleCount) { break; }
    let disk = shadow_diskSample(index, shadow.filterSampleCount, rotation) * filterRadius;
    let sampleDirection = normalize(direction + basis[0] * disk.x + basis[1] * disk.y);
    visibility += textureSampleCompareLevel(
      pointShadowTexture,
      shadowComparisonSampler,
      sampleDirection,
      lightIndex,
      referenceDepth
    );
  }
  visibility /= max(f32(shadow.filterSampleCount), 1.0);
  return mix(1.0, visibility, light.strength);
}
`,xt={name:"shadow",source:St,fs:ut,props:{},uniforms:{},bindings:{},uniformTypes:{directionalLightCount:"i32",spotLightCount:"i32",pointLightCount:"i32",cascadeCount:"i32",blockerSampleCount:"i32",filterSampleCount:"i32",cascadeSplits:"vec4<f32>",directionalViewProjectionMatrices:["mat4x4<f32>",ft],spotViewProjectionMatrices:["mat4x4<f32>",ee],pointViewProjectionMatrices:["mat4x4<f32>",mt],directionalLights:[wt,1],spotLights:[gt,ee],pointLights:[vt,De]},bindingLayout:[{name:"shadow",group:2},{name:"directionalShadowTexture",group:2},{name:"spotShadowTexture",group:2},{name:"pointShadowTexture",group:2},{name:"shadowComparisonSampler",group:2}],getUniforms(e){return!e.directionalLights||!e.spotLights||!e.pointLights||!e.cascadeSplits||!e.directionalViewProjectionMatrices||!e.spotViewProjectionMatrices||!e.pointViewProjectionMatrices||!e.directionalShadowTexture||!e.spotShadowTexture||!e.pointShadowTexture||!e.nonFilteringSampler||!e.comparisonSampler?{}:{directionalLightCount:e.directionalLights.length,spotLightCount:e.spotLights.length,pointLightCount:e.pointLights.length,cascadeCount:e.cascadeCount,blockerSampleCount:e.blockerSampleCount,filterSampleCount:e.filterSampleCount,cascadeSplits:e.cascadeSplits,directionalViewProjectionMatrices:e.directionalViewProjectionMatrices,spotViewProjectionMatrices:e.spotViewProjectionMatrices,pointViewProjectionMatrices:e.pointViewProjectionMatrices,directionalLights:yt(e.directionalLights),spotLights:bt(e.spotLights),pointLights:Ct(e.pointLights),directionalShadowTexture:e.directionalShadowTexture,spotShadowTexture:e.spotShadowTexture,pointShadowTexture:e.pointShadowTexture,...e.directionalShadowTexture.device.type==="webgpu"?{shadowComparisonSampler:e.comparisonSampler}:{}}}};function yt(e){const t=e[0];return[t?{direction:t.direction,strength:t.strength??1,normalBias:t.normalBias??.04,sourceAngularRadius:t.sourceAngularRadius??.00465,cascadeBlendFraction:t.cascadeBlendFraction??.1,farFadeFraction:t.farFadeFraction??.1,shadowDistance:t.shadowDistance??1}:{direction:[0,1,0],strength:0,normalBias:0,sourceAngularRadius:0,cascadeBlendFraction:0,farFadeFraction:0,shadowDistance:1}]}function bt(e){return ke(e.map(t=>({position:t.position,range:t.range,direction:t.direction,outerConeCos:Math.cos(t.outerConeAngle),sourceRadius:t.sourceRadius??.2,normalBias:t.normalBias??.025,strength:t.strength??1,nearPlane:t.nearPlane??.1})),ee,{position:[0,0,0],range:1,direction:[0,-1,0],outerConeCos:1,sourceRadius:0,normalBias:0,strength:0,nearPlane:.1})}function Ct(e){return ke(e.map(t=>({position:t.position,range:t.range,sourceRadius:t.sourceRadius??.2,normalBias:t.normalBias??.025,strength:t.strength??1,nearPlane:t.nearPlane??.1})),De,{position:[0,0,0],range:1,sourceRadius:0,normalBias:0,strength:0,nearPlane:.1})}function ke(e,t,i){const o=e.slice(0,t);for(;o.length<t;)o.push(i);return o}const Pt=await Ne();Pt.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(e=>e.remove());const Lt={name:"riverfrontCaster",uniformTypes:{viewProjectionMatrix:"mat4x4<f32>"},vs:"layout(std140) uniform riverfrontCasterUniforms { mat4 viewProjectionMatrix; } riverfrontCaster;",source:`struct RiverfrontCasterUniforms { viewProjectionMatrix: mat4x4f };
@group(0) @binding(auto) var<uniform> riverfrontCaster: RiverfrontCasterUniforms;`};class Mt{constructor(t,i){this.features=t,this.settings=i}features;settings;id="riverfront-soft-shadows";props={};useInPicking=!1;renderer=null;shadowProps=null;viewMatrix=new v;frameCount=0;vertices=null;casters=[];setup({device:t}){this.renderer=new at(t,{quality:this.settings.quality,spotLightCapacity:0,pointLightCapacity:0});const i=ye(this.features.filter(o=>o.kind==="building"||o.kind==="bridge"));this.vertices=t.createBuffer({id:"riverfront-shadow-casters",data:i}),this.casters=Array.from({length:4},(o,r)=>new xe(t,{id:`riverfront-caster-${r}`,vs:`#version 300 es
in vec3 position;
void main() {
  vec4 clip = riverfrontCaster.viewProjectionMatrix * vec4(position, 1.0);
  gl_Position = vec4(clip.xy, clip.z * 2.0 - clip.w, clip.w);
}`,fs:`#version 300 es
precision highp float; void main() {}`,source:`@vertex fn vertexMain(@location(0) position: vec3f) -> @builtin(position) vec4f {
  return riverfrontCaster.viewProjectionMatrix * vec4f(position, 1.0);
}
@fragment fn fragmentMain() {}`,shaderInputs:new Te({riverfrontCaster:Lt}),topology:"triangle-list",vertexCount:i.length/10,bufferLayout:[{name:"vertices",byteStride:40,attributes:[{attribute:"position",format:"float32x3",byteOffset:0}]}],attributes:{vertices:this.vertices},colorAttachmentFormats:[],depthStencilAttachmentFormat:"depth32float",parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}}))}preRender(t){if(t.isPicking||!this.renderer||!t.viewports[0])return;const i=Dt(t.viewports[0]);this.viewMatrix=i.viewMatrix,this.renderer.setProps({quality:this.settings.quality});const o=q(this.settings.hour),r=o.sun.direction[2]>0;this.shadowProps=this.renderer.render({camera:i,directionalLights:[{direction:r?o.sun.direction:o.moonDirection,shadowDistance:Math.min(i.far,2600),casterDistance:450,sourceAngularRadius:Math.max(this.settings.softness,r?0:.025),cascadeSplitLambda:.65,cascadeBlendFraction:.15,normalBias:.12,depthBias:2,depthBiasSlopeScale:2,strength:this.settings.enabled?r?1:Math.min(.22,o.moonIntensity):0}],drawShadowCasters:s=>this.drawCasters(s)}),this.frameCount++}cleanup(){for(const t of this.casters)t.destroy();this.casters=[],this.vertices?.destroy(),this.vertices=null,this.renderer?.destroy(),this.renderer=null,this.shadowProps=null}drawCasters(t){const i=this.casters[t.cascadeIndex??0];i.shaderInputs.setProps({riverfrontCaster:{viewProjectionMatrix:t.viewProjectionMatrix}}),i.setParameters(t.rasterParameters),i.draw(t.renderPass)}}function Dt(e){const t=e.projectPosition(b),i=e.getDistanceScales(b).unitsPerMeter,o=i[2]*Math.hypot(e.viewMatrix[8],e.viewMatrix[9],e.viewMatrix[10]),r=new v().scale([1/o,1/o,1/o]).multiplyRight(e.viewMatrix).translate(t).scale(i),s=new v([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]).multiplyRight(e.projectionMatrix).scale(o),p=e.projectionMatrix[10],w=e.projectionMatrix[14]/o;return{viewMatrix:r,projectionMatrix:s,clipDepth:"zero-to-one",near:w/(p-1),far:w/(p+1)}}const kt={name:"riverfrontReceiver",uniformTypes:{viewMatrix:"mat4x4<f32>",cameraPosition:"vec3<f32>"},vs:`layout(std140) uniform riverfrontReceiverUniforms { mat4 viewMatrix;
vec3 cameraPosition; } riverfrontReceiver;`,fs:`layout(std140) uniform riverfrontReceiverUniforms {
    mat4 viewMatrix;
    vec3 cameraPosition;
  } riverfrontReceiver;`,source:`struct RiverfrontReceiverUniforms { viewMatrix: mat4x4f,
cameraPosition: vec3f };
@group(3) @binding(auto) var<uniform> riverfrontReceiver: RiverfrontReceiverUniforms;`};class _t extends ze{static layerName="ShadowDistrictLayer";getAttributeManager(){return null}initializeState(){}updateState({props:t,oldProps:i}){if(this.state.model&&t.features===i.features)return;this.destroyMesh();const o=ye(t.features),r=this.context.device.createBuffer({data:o});this.setState({vertices:r});try{const s=new xe(this.context.device,{...this.getShaders({source:It,vs:Rt,fs:Tt,modules:[Qe,je,Je,xt,ne,se,kt]}),id:`${this.id}-mesh`,topology:"triangle-list",vertexCount:o.length/10,bufferLayout:[{name:"vertices",byteStride:40,attributes:[{attribute:"position",format:"float32x3",byteOffset:0},{attribute:"normal",format:"float32x3",byteOffset:12},{attribute:"color",format:"float32x3",byteOffset:24},{attribute:"featureIndex",format:"float32",byteOffset:36}]}],attributes:{vertices:r},parameters:{depthCompare:"less-equal",depthWriteEnabled:!0,cullMode:"none"}});this.setState({model:s})}catch(s){throw this.destroyMesh(),s}}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:t}){const i=this.props.shadowEffect;if(!i.shadowProps)return;const o=q(i.settings.hour,this.props.clouds().cover);this.state.model?.shaderInputs.setProps({shadow:i.shadowProps,clouds:{...ne.defaultUniforms,...this.props.clouds()},atmosphere:{...se.defaultUniforms,...this.props.atmosphere()},riverfrontReceiver:{viewMatrix:i.viewMatrix,cameraPosition:Ze(this.context.viewport,this.props.coordinateOrigin,this.context.viewport.cameraPosition)},lambertMaterial:{ambient:.3,diffuse:.85},lighting:o.lights}),this.state.model?.draw(t)}getPickingInfo({info:t}){return t.object=this.props.features[t.index],t}finalizeState(t){this.destroyMesh(),super.finalizeState(t)}destroyMesh(){this.state.model?.destroy(),this.state.vertices?.destroy(),this.setState({model:void 0,vertices:void 0})}}const It=`
struct CityVertex {
  @builtin(position) position: vec4f,
  @location(0) color: vec3f,
  @location(1) @interpolate(flat) pickingColor: vec3f,
  @location(2) worldPosition: vec3f,
  @location(3) normal: vec3f,
  @location(4) viewDepth: f32,
};
@vertex fn vertexMain(
  @location(0) position: vec3f, @location(1) normal: vec3f,
  @location(2) color: vec3f, @location(3) featureIndex: f32
) -> CityVertex {
  var output: CityVertex;
  output.position = project_position_to_clipspace(position, vec3f(0.0), vec3f(0.0));
  output.worldPosition = position;
  output.normal = normal;
  output.viewDepth = -(riverfrontReceiver.viewMatrix * vec4f(position, 1.0)).z;
  output.color = color;
  output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex));
  return output;
}
@fragment fn fragmentMain(input: CityVertex) -> @location(0) vec4f {
  if (picking.isActive > 0.5) {
    if (picking_isColorZero(input.pickingColor)) { discard; }
    return vec4f(input.pickingColor, 1.0);
  }
  let normal = normalize(input.normal);
  let ambient = lambertMaterial.ambient * input.color * lighting.ambientColor;
  let lit = lighting_getLightColor2(input.color, vec3f(0.0), input.worldPosition, normal);
  let visibility = shadow_getDirectionalFactor(input.worldPosition, normal, input.viewDepth) * clouds_getTransmittance(input.worldPosition);
  var color = ambient + (lit - ambient) * visibility;
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return atmosphere_getColor(vec4f(color, layer.opacity), input.worldPosition, riverfrontReceiver.cameraPosition);
}
`,Rt=`#version 300 es
in vec3 position;
in vec3 normal;
in vec3 color;
in float featureIndex;
out vec3 surfaceColor;
out vec3 worldPosition;
out vec3 surfaceNormal;
out float viewDepth;
void main() {
  geometry.worldPosition = position;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  vec4 commonPosition;
  gl_Position = project_position_to_clipspace(position, vec3(0.0), vec3(0.0), commonPosition);
  geometry.position = commonPosition;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vec4 filterColor = vec4(color, 1.0);
  DECKGL_FILTER_COLOR(filterColor, geometry);
  surfaceColor = color;
  worldPosition = position;
  surfaceNormal = normal;
  viewDepth = -(riverfrontReceiver.viewMatrix * vec4(position, 1.0)).z;
}`,Tt=`#version 300 es
precision highp float;
in vec3 surfaceColor;
in vec3 worldPosition;
in vec3 surfaceNormal;
in float viewDepth;
out vec4 fragColor;
void main() {
  vec3 normal = normalize(surfaceNormal);
  vec3 ambient = material.ambient * surfaceColor * lighting.ambientColor;
  vec3 lit = lighting_getLightColor(surfaceColor, vec3(0.0), worldPosition, normal);
  float visibility = shadow_getDirectionalFactor(worldPosition, normal, viewDepth) * clouds_getTransmittance(worldPosition);
  fragColor = atmosphere_getColor(vec4(ambient + (lit - ambient) * visibility, layer.opacity), worldPosition, riverfrontReceiver.cameraPosition);
  DECKGL_FILTER_COLOR(fragColor, geometry);
}`;function zt(e,t={}){const i=Xe();for(const a of i)a.kind==="ground"&&(a.color=[.72,.73,.69]),a.kind==="building"&&(a.color=[.85,.82,.75]),a.kind==="water"&&(a.color=[.14,.4,.47]);const o={hour:N,animated:!0,hoursPerSecond:.8,enabled:!0,softness:.018,quality:"balanced"},r={frames:0,backend:"",error:"",finalized:!1};let s,p;const w=new Promise((a,l)=>{s=a,p=l}),x=new Mt(i,o),c={sun:!0,moon:!0},u={enabled:!0,haze:1},d={enabled:!0,shadows:!0,animated:!0,cover:.4,windSpeed:18,windDirection:75,time:0};function S(){return o.animated||d.enabled&&d.animated}function C(a){const l=new Date(D(a).timestamp),y=He(l,b[1],b[0]),L=$e(l),P=y.altitude,H=Ge(P,y.azimuth),O=Math.PI/2+L.angle-y.parallacticAngle-(L.phase>.5?Math.PI:0);return{direction:H,phase:L.phase,limbAngle:O,altitude:P}}function T(){const a=q(o.hour),l=a.sun,y=l.direction[2]>0;return{cover:d.enabled?d.cover:0,time:d.time,velocity:[Math.sin(d.windDirection*Math.PI/180)*d.windSpeed,Math.cos(d.windDirection*Math.PI/180)*d.windSpeed],sunDirection:y?[...l.direction]:[...a.moonDirection],sunColor:y?a.sunlight.color:[a.moonColor[0]*a.moonIntensity,a.moonColor[1]*a.moonIntensity,a.moonColor[2]*a.moonIntensity]}}function k(){return{enabled:u.enabled?1:0,sunDirection:[...D(o.hour).direction],haze:u.haze,sunIntensity:10*q(o.hour).sunlight.intensity,groundColor:i.find(a=>a.kind==="ground").color}}function m(){const a=D(o.hour),l=C(o.hour);return[new Ue({id:"riverfront-atmosphere",coordinateOrigin:b,...k(),visible:u.enabled}),new Ve({id:"riverfront-sun",direction:a.direction,coordinateOrigin:b,color:[a.color[0],a.color[1],a.color[2],255],radiusPixels:14,visible:c.sun}),new qe({id:"riverfront-moon",direction:l.direction,coordinateOrigin:b,phase:l.phase,limbAngle:l.limbAngle,radiusPixels:18,visible:c.moon}),new We({id:"riverfront-clouds",coordinateOrigin:b,visible:d.enabled,...T()}),new _t({id:"riverfront-shadow-district",data:i,features:i,shadowEffect:x,clouds:()=>({...T(),cover:d.shadows?T().cover:0}),atmosphere:k,pickable:!0,coordinateSystem:Be.METER_OFFSETS,coordinateOrigin:b})]}let f=0,g=j({longitude:b[0],latitude:b[1],zoom:15,pitch:80,bearing:Math.atan2(D(N).direction[0],D(N).direction[1])*180/Math.PI-12},e.clientWidth,e.clientHeight);const z={...g},n=new Ae({parent:e,...Ee(t),views:new Fe({id:"riverfront-shadows",fovy:Ye,controller:!0}),viewState:g,onViewStateChange:({viewState:a})=>{g=j(a,e.clientWidth,e.clientHeight),n.setProps({viewState:g})},onResize:({width:a,height:l})=>{g=j(g,a,l),n.setProps({viewState:g})},effects:[x],layers:m(),_animate:!0,onDeviceInitialized:a=>{r.backend=a.type},onLoad:()=>s(),onBeforeRender:()=>{const a=performance.now();o.animated&&f&&(o.hour=U+(o.hour-U+(a-f)/1e3*o.hoursPerSecond)%(ce-U)),f&&d.enabled&&d.animated&&(d.time+=Math.min(a-f,1e3)/1e3),f=a,S()&&n.setProps({layers:m()})},onAfterRender:()=>{r.frames++,e.dispatchEvent(new Event("sun-frame"))},onError:a=>{r.error||=a.message,p(a)},getTooltip:a=>a.object?.name??null});return{deck:n,settings:o,sky:c,get viewState(){return g},cloudSettings:d,atmosphereSettings:u,shadowEffect:x,diagnostics:r,ready:w,get moon(){return C(o.hour)},setClouds(a){d.enabled=a,f=0,n.setProps({_animate:S(),layers:m()}),n.redraw("cloud toggle")},setCloudAnimated(a){d.animated=a,f=0,n.setProps({_animate:S()}),n.redraw("cloud animation")},setCloudShadows(a){d.shadows=a,n.setProps({layers:m()}),n.redraw("cloud shadows")},setAtmosphere(a){u.enabled=a,n.setProps({layers:m()}),n.redraw("atmosphere")},setHaze(a){u.haze=a,n.setProps({layers:m()}),n.redraw("atmospheric haze")},setCloudTime(a){d.time=a,f=0,n.setProps({layers:m()}),n.redraw("cloud time")},setCloudCover(a){d.cover=a,n.setProps({layers:m()}),n.redraw("cloud cover")},setWindSpeed(a){d.windSpeed=a,n.setProps({layers:m()}),n.redraw("cloud wind")},setWindDirection(a){d.windDirection=a,n.setProps({layers:m()}),n.redraw("cloud wind direction")},setSkyBody(a,l){c[a]=l,n.setProps({layers:m()})},centerView(){g=j(z,e.clientWidth,e.clientHeight),n.setProps({viewState:g}),n.redraw("center riverfront")},lookAtSkyBody(a){let l=o.hour;a==="sun"&&D(l).direction[2]<=0&&(l=N),a==="moon"&&C(l).direction[2]<=0&&(l=Array.from({length:48},(L,P)=>P/2).find(L=>{const P=C(L).altitude*180/Math.PI;return P>4&&P<15})??o.hour),o.hour=l,o.animated=!1,f=0;const y=a==="sun"?D(l).direction:C(l).direction;g=j({longitude:b[0],latitude:b[1],zoom:15,pitch:90+Math.asin(y[2])*180/Math.PI,bearing:Math.atan2(y[0],y[1])*180/Math.PI},e.clientWidth,e.clientHeight),n.setProps({_animate:S(),layers:m(),viewState:g}),n.redraw("sky body view")},get sun(){return D(o.hour)},setHour(a){o.hour=Math.max(U,Math.min(ce,a)),n.setProps({layers:m()}),n.redraw("sun time")},setAnimated(a){o.animated=a,f=0,n.setProps({_animate:S()}),n.redraw("sun animation")},setShadows(a){o.enabled=a,n.setProps({layers:m()}),n.redraw("shadow toggle")},setSoftness(a){o.softness=a,n.setProps({layers:m()}),n.redraw("shadow softness")},setSpeed(a){o.hoursPerSecond=a},setQuality(a){o.quality=a,n.setProps({layers:m()}),n.redraw("shadow quality")},finalize(){r.finalized||(r.finalized=!0,n.finalize())}}}const te=document.querySelector("#scene"),_e=document.querySelector("#status"),W=document.querySelector("#hour"),jt=document.querySelector("#time"),ie=document.querySelector("#backend"),Ie=await Oe(new URLSearchParams(location.search).get("backend"));ie.value=Ie;ie.addEventListener("change",()=>{location.search=`?backend=${ie.value}`});const h=zt(te,{deviceType:Ie});window.riverfrontSoftShadowScene=h;te.addEventListener("sun-frame",()=>{const e=h.settings.hour,t=Math.max(0,Math.min(1,h.sun.direction[2]*3)),i=[4,10,22].map((r,s)=>r+t*([36,72,99][s]-r)),o=[25,44,68].map((r,s)=>r+t*([116,150,165][s]-r));te.style.background=`linear-gradient(rgb(${i.join(",")}), rgb(${o.join(",")}))`,jt.value=Ke(e),document.activeElement!==W&&(W.value=String(e)),_e.value=`Sun altitude ${(h.sun.altitude*180/Math.PI).toFixed(0)}° · New York, June 21`});W.addEventListener("input",()=>{h.setAnimated(!1),document.querySelector("#animated").checked=!1,h.setHour(Number(W.value))});for(const[e,t]of[["animated",h.setAnimated],["shadows",h.setShadows],["clouds",h.setClouds],["cloud-shadows",h.setCloudShadows],["cloud-animated",h.setCloudAnimated],["atmosphere",h.setAtmosphere]]){const i=document.querySelector(`#${e}`);i.addEventListener("change",()=>t(i.checked))}for(const[e,t]of[["softness",h.setSoftness],["speed",h.setSpeed],["cloud-cover",h.setCloudCover],["wind-speed",h.setWindSpeed],["wind-direction",h.setWindDirection],["haze",h.setHaze]]){const i=document.querySelector(`#${e}`);i.addEventListener("input",()=>t(Number(i.value)))}document.querySelector("#center").addEventListener("click",()=>h.centerView());for(const e of["sun","moon"]){const t=document.querySelector(`#show-${e}`);t.addEventListener("change",()=>h.setSkyBody(e,t.checked)),document.querySelector(`#look-${e}`).addEventListener("click",()=>{h.lookAtSkyBody(e),document.querySelector("#animated").checked=!1})}const Se=document.querySelector("#quality");Se.addEventListener("change",()=>{const e=Se.value;(e==="low"||e==="balanced"||e==="cinematic")&&h.setQuality(e)});h.ready.then(()=>{document.body.dataset.ready="true"}).catch(e=>{_e.value=e instanceof Error?e.message:String(e),document.body.dataset.ready="error"});window.addEventListener("pagehide",()=>h.finalize());
