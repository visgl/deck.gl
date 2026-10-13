import{L as le,M as ce,p as ue,e as pe,k as T,b as de,h as fe,j as me,c as D,B as G,r as ge}from"./deck-example-device-TQPRJnZ6.js";import{w as ve,r as xe,W as Q}from"./water-surface-layer-S-hj9Srh.js";import{g as ae,S as he}from"./scene-buffer-effect-Bq4_aRU0.js";import{p as ye}from"./project32-Byi-VnKS.js";import{p as Te}from"./point-glow-DAMvtmjx.js";import{S as Ce}from"./shader-pass-effect-D_gXcVHA.js";import{b as Se,S as Pe,g as z}from"./riverfront-sky-lighting-Bovga_iV.js";import{R as J}from"./river-district-layer-DuhH2l43.js";import{m as we,C as x,a as be}from"./river-district-data-C9FvyLLC.js";import{R as Le}from"./riverfront-view-CB3JCqMN.js";import{t as _e}from"./tone-mapping-dFslqTmk.js";import{c as De}from"./bloom-composite-shader-pass-Cz7KROGO.js";import{WebGPUDevice as Ve}from"./webgpu-device-DmQhkyqo.js";import{d as ee}from"./depth-aware-blur-C8MXPRPo.js";const k={enabled:0,time:0,radius:8,speed:.6,pulse:.85},te={name:"firefly",uniformTypes:{enabled:"f32",time:"f32",radius:"f32",speed:"f32",pulse:"f32"},defaultUniforms:k,getUniforms(s={},e=k){return{...k,...e,...s}},source:`struct FireflyUniforms {enabled: f32, time: f32, radius: f32, speed: f32, pulse: f32};
  @group(3) @binding(auto) var<uniform> firefly: FireflyUniforms;
  fn firefly_getPosition(position: vec3f, seed: f32, time: f32) -> vec3f {
    if (firefly.enabled <= 0.0) { return position; }
    let phase = seed * 2.399963;
    let travel = time * firefly.speed;
    let offset = vec3f(sin(travel * 0.71 + phase) + sin(travel * 1.31 + phase * 1.7) * 0.35,
      cos(travel * 0.83 + phase * 1.2) + sin(travel * 0.47 + phase * 2.3) * 0.4,
      sin(travel * 0.59 + phase * 1.9) * 0.3);
    return position + offset * firefly.radius * firefly.enabled;
  }
  fn firefly_getBrightness(seed: f32, time: f32) -> f32 {
    if (firefly.enabled <= 0.0) { return 1.0; }
    let phase = seed * 2.399963;
    let pulse = pow(0.5 + 0.5 * sin(time * firefly.speed * (1.6 + fract(seed * 0.37)) + phase), 3.0);
    return mix(1.0, mix(0.08, 1.0, pulse), firefly.pulse * firefly.enabled);
  }`,vs:`layout(std140) uniform fireflyUniforms {
    float enabled;
    float time;
    float radius;
    float speed;
    float pulse;
  } firefly;
  vec3 firefly_getPosition(vec3 position, float seed, float time) {
    if (firefly.enabled <= 0.0) { return position; }
    float phase = seed * 2.399963;
    float travel = time * firefly.speed;
    vec3 offset = vec3(sin(travel * 0.71 + phase) + sin(travel * 1.31 + phase * 1.7) * 0.35,
      cos(travel * 0.83 + phase * 1.2) + sin(travel * 0.47 + phase * 2.3) * 0.4,
      sin(travel * 0.59 + phase * 1.9) * 0.3);
    return position + offset * firefly.radius * firefly.enabled;
  }
  float firefly_getBrightness(float seed, float time) {
    if (firefly.enabled <= 0.0) { return 1.0; }
    float phase = seed * 2.399963;
    float pulse = pow(0.5 + 0.5 * sin(time * firefly.speed * (1.6 + fract(seed * 0.37)) + phase), 3.0);
    return mix(1.0, mix(0.08, 1.0, pulse), firefly.pulse * firefly.enabled);
  }`},Re={name:"motionBuffer",source:`struct MotionBufferUniforms {
    enabled: i32,
    currentClipToPreviousClip: mat4x4f,
    previousTime: f32,
    viewportScale: vec2f,
  };
  @group(3) @binding(auto) var<uniform> motionBuffer: MotionBufferUniforms;
  fn motionBuffer_getVelocity(currentClip: vec4f, previousPositionClip: vec4f) -> vec2f {
    let previousClip = motionBuffer.currentClipToPreviousClip * previousPositionClip;
    if (currentClip.w <= 0.00001 || previousClip.w <= 0.00001) { return vec2f(0.0); }
    return (currentClip.xy / currentClip.w - previousClip.xy / previousClip.w) * vec2f(0.5, -0.5) * motionBuffer.viewportScale;
  }`,vs:`layout(std140) uniform motionBufferUniforms {
    highp int enabled;
    mat4 currentClipToPreviousClip;
    float previousTime;
    vec2 viewportScale;
  } motionBuffer;
  vec2 motionBuffer_getVelocity(vec4 currentClip, vec4 previousPositionClip) {
    vec4 previousClip = motionBuffer.currentClipToPreviousClip * previousPositionClip;
    if (currentClip.w <= 0.00001 || previousClip.w <= 0.00001) return vec2(0.0);
    return (currentClip.xy / currentClip.w - previousClip.xy / previousClip.w) * vec2(0.5, -0.5) * motionBuffer.viewportScale;
  }`,fs:`layout(std140) uniform motionBufferUniforms {
    highp int enabled;
    mat4 currentClipToPreviousClip;
    float previousTime;
    vec2 viewportScale;
  } motionBuffer;`,uniformTypes:{enabled:"i32",currentClipToPreviousClip:"mat4x4<f32>",previousTime:"f32",viewportScale:"vec2<f32>"},defaultUniforms:{enabled:0,currentClipToPreviousClip:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],previousTime:0,viewportScale:[1,1]}},Me={name:"glowPoint",bindingLayout:[{name:"glowPoint",group:3}],source:`struct GlowPointUniforms {
  radiusPixels: f32,
  pickingRadiusPixels: f32,
  opacity: f32
}; @group(3) @binding(auto) var<uniform> glowPoint: GlowPointUniforms;`,vs:`layout(std140) uniform glowPointUniforms {
  float radiusPixels;
  float pickingRadiusPixels;
  float opacity;
} glowPoint;`,fs:`layout(std140) uniform glowPointUniforms {
  float radiusPixels;
  float pickingRadiusPixels;
  float opacity;
} glowPoint;`,uniformTypes:{radiusPixels:"f32",pickingRadiusPixels:"f32",opacity:"f32"},defaultUniforms:{radiusPixels:18,pickingRadiusPixels:5,opacity:1}},re={depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"one",blendColorDstFactor:"one",blendAlphaSrcFactor:"zero",blendAlphaDstFactor:"one"},U=class U extends le{getAttributeManager(){return null}getNumInstances(){return this.props.pointCount}initializeState({device:e}){const n=e.createBuffer({data:new Float32Array([-1,-1,1,-1,-1,1,-1,1,1,-1,1,1])});try{const r=new ce(e,{...this.getShaders({source:Ie,vs:Ee,fs:Ae,modules:[ye,ue,Te,te,Re,Me]}),id:`${this.id}-glow`,topology:"triangle-list",isInstanced:!0,vertexCount:6,instanceCount:this.props.pointCount,bufferLayout:[{name:"corner",format:"float32x2"},{name:"points",stepMode:"instance",byteStride:32,attributes:[{attribute:"position",format:"float32x3",byteOffset:0},{attribute:"tint",format:"float32x3",byteOffset:12},{attribute:"opacity",format:"float32",byteOffset:24},{attribute:"featureIndex",format:"float32",byteOffset:28}]}],attributes:{corner:n,points:this.props.points},parameters:re});this.setState({model:r,corners:n})}catch(r){throw n.destroy(),r}}updateState({props:e,oldProps:n}){e.points!==n.points&&this.state.model.setAttributes({points:e.points}),this.state.model.setInstanceCount(e.pointCount)}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:e}){this.state.model.shaderInputs.setProps({pointGlow:this.props.style||{},firefly:{...te.defaultUniforms,...this.props.animation,time:typeof this.props.time=="function"?this.props.time():this.props.time??0},glowPoint:{radiusPixels:Math.max(0,this.props.radiusPixels),pickingRadiusPixels:Math.max(0,this.props.pickingRadiusPixels),opacity:this.props.opacity}}),this.state.model.draw(e)}finalizeState(e){this.state.model?.destroy(),this.state.corners?.destroy(),super.finalizeState(e)}};U.layerName="GlowPointLayer",U.defaultProps={radiusPixels:{type:"number",value:18,min:0},pickingRadiusPixels:{type:"number",value:5,min:0},style:{},animation:{},time:0,parameters:re};let C=U;const Ie=`
struct GlowVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) coordinates: vec2<f32>,
  @location(1) tint: vec3<f32>,
  @location(2) opacity: f32,
  @location(3) @interpolate(flat) pickingColor: vec3<f32>,
  @location(4) velocity: vec2f,
};
@vertex fn vertexMain(@location(0) corner: vec2<f32>,
  @location(1) position: vec3<f32>, @location(2) tint: vec3<f32>,
  @location(3) opacity: f32, @location(4) featureIndex: f32
) -> GlowVertex {
  let animatedPosition = firefly_getPosition(position, featureIndex, firefly.time);
  let center = project_position_to_clipspace(animatedPosition, vec3<f32>(0.0), vec3<f32>(0.0));
  let previousPosition = firefly_getPosition(position, featureIndex, motionBuffer.previousTime);
  let previousClip = project_position_to_clipspace(previousPosition, vec3f(0.0), vec3f(0.0));
  let offset = corner * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize;
  var output: GlowVertex;
  output.position = vec4<f32>(center.xy + offset * center.w, center.z, center.w);
  output.coordinates = corner;
  output.velocity = motionBuffer_getVelocity(center, previousClip);
  output.tint = tint;
  output.opacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
  output.pickingColor = vec3<f32>(0.0);
  if (featureIndex >= 0.0) { output.pickingColor = picking_getPickingColorFromIndex(u32(featureIndex)); }
  return output;
}
@fragment fn fragmentMain(input: GlowVertex) -> @location(0) vec4<f32> {
  let radiance = pointGlow_getColor(input.coordinates, input.tint) * input.opacity;
  if (input.opacity <= 0.0 || glowPoint.radiusPixels <= 0.0) { discard; }
  if (motionBuffer.enabled != 0) {
    if (length(input.coordinates) > 0.35) { discard; }
    return vec4f(input.velocity, 0.0, 1.0);
  }
  if (picking.isActive > 0.5) {
    if (glowPoint.pickingRadiusPixels <= 0.0) { discard; }
    let pickingRadius = min(1.0, glowPoint.pickingRadiusPixels / max(glowPoint.radiusPixels, 0.0001));
    if (length(input.coordinates) > pickingRadius || picking_isColorZero(input.pickingColor)) { discard; }
    return vec4<f32>(input.pickingColor, 1.0);
  }
  var color = radiance;
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb * max(max(color.r, color.g), color.b), picking.highlightColor.a);
  }
  return vec4<f32>(color, 0.0);
}
`,Ee=`#version 300 es
in vec2 corner;
in vec3 position;
in vec3 tint;
in float opacity;
in float featureIndex;
out vec2 coordinates;
out vec3 vertexTint;
out float vertexOpacity;
out vec2 vertexVelocity;
void main() {
  coordinates = corner;
  vertexTint = tint;
  vertexOpacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
  vec3 animatedPosition = firefly_getPosition(position, featureIndex, firefly.time);
  geometry.worldPosition = animatedPosition;
  geometry.pickingColor = picking_getPickingColorFromIndex(featureIndex);
  gl_Position = project_position_to_clipspace(animatedPosition, vec3(0.0), vec3(0.0));
  vec4 previousClip = project_position_to_clipspace(firefly_getPosition(position, featureIndex, motionBuffer.previousTime), vec3(0.0), vec3(0.0));
  vertexVelocity = motionBuffer_getVelocity(gl_Position, previousClip);
  gl_Position.xy += coordinates * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize * gl_Position.w;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vec4 color = vec4(1.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`,Ae=`#version 300 es
precision highp float;
precision highp int;
in vec2 coordinates;
in vec3 vertexTint;
in float vertexOpacity;
in vec2 vertexVelocity;
out vec4 fragColor;
void main() {
  vec3 radiance = pointGlow_getColor(coordinates, vertexTint) * vertexOpacity;
  if (vertexOpacity <= 0.0 || glowPoint.radiusPixels <= 0.0) discard;
  if (motionBuffer.enabled != 0) {
    if (length(coordinates) > 0.35) discard;
    fragColor = vec4(vertexVelocity, 0.0, 1.0);
    return;
  }
  if (picking.isActive > 0.5) {
    if (glowPoint.pickingRadiusPixels <= 0.0) discard;
    float pickingRadius = min(1.0, glowPoint.pickingRadiusPixels / max(glowPoint.radiusPixels, 0.0001));
    if (length(coordinates) > pickingRadius) discard;
  }
  // Apply Deck's highlight tint before restoring radiance. A zero-alpha color would
  // otherwise turn the entire sprite quad into the opaque highlight color.
  float energy = max(max(radiance.r, radiance.g), radiance.b);
  fragColor = vec4(radiance / max(energy, 0.0001), 1.0);
  DECKGL_FILTER_COLOR(fragColor, geometry);
  if (picking.isActive < 0.5) fragColor = vec4(fragColor.rgb * energy, 0.0);
}
`;class je extends Ce{constructor(e){super({...e,colorFormat:e.colorFormat??"rgba16float",getRenderOptions:n=>{pe(n.viewports.length===1);const r=n.viewports[0],o=e.capture.getFrame(r.id);if(!o)return null;const u=ae(r,e.coordinateOrigin),a=e.getSceneOptions?.({frame:o,viewport:r,camera:u});return{...a,sourceTexture:o.buffer.colorTexture,bindings:{depthTexture:o.buffer.depthTexture,normalTexture:o.buffer.normalRoughnessTexture,...e.capture.props.motionVectors?{velocityTexture:o.buffer.velocityTexture}:{},...a?.bindings},resetHistory:!o.historyValid||a?.resetHistory}}})}}const H=class H extends C{};H.layerName="FireflyLayer",H.defaultProps={...C.defaultProps,radiusPixels:{type:"number",value:7,min:0},animation:{enabled:1,radius:8,speed:.6,pulse:.85}};let F=H;const S=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],ze={name:"clusteredVolumetricTrace",source:`const CLUSTERED_VOLUMETRIC_PI: f32 = 3.141592653589793;
const CLUSTERED_VOLUMETRIC_MAX_STEPS: u32 = 20u;
const CLUSTERED_VOLUMETRIC_MAX_LIGHTS: u32 = 10u;
const CLUSTERED_VOLUMETRIC_MAX_GOD_RAY_STEPS: u32 = 32u;

struct ClusteredVolumetricTraceUniforms {
  projectionMatrix: mat4x4f,
  inverseProjectionMatrix: mat4x4f,
  inverseViewMatrix: mat4x4f,
  directionalLightDirectionView: vec3f,
  directionalLightColor: vec3f,
  fogColor: vec3f,
  godRayPosition: vec2f,
  density: f32,
  heightFalloff: f32,
  fogHeight: f32,
  anisotropy: f32,
  directionalIntensity: f32,
  pointLightIntensity: f32,
  godRayIntensity: f32,
  godRaySourceRadius: f32,
  godRayDensity: f32,
  godRayDecay: f32,
  godRaySampleCount: f32,
  godRaysOnly: f32,
  maxDistance: f32,
  sampleCount: f32,
  shadowStrength: f32,
  clusterCountX: u32,
  clusterCountY: u32,
  clusterCountZ: u32,
  maxLightsPerCluster: u32,
  pointLightCount: u32,
  clusterNearPlane: f32,
  clusterFarPlane: f32,
};

struct ClusteredVolumetricPointLight {
  positionRange: vec4f,
  colorIntensity: vec4f,
};

@group(0) @binding(auto) var<uniform> clusteredVolumetricTrace:
  ClusteredVolumetricTraceUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var<storage, read> pointLights:
  array<ClusteredVolumetricPointLight>;
@group(0) @binding(auto) var<storage, read> clusterLightCounts: array<u32>;
@group(0) @binding(auto) var<storage, read> clusterLightIndices: array<u32>;

fn clusteredVolumetricTrace_reconstructViewPosition(texCoord: vec2f, depth: f32) -> vec3f {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = clusteredVolumetricTrace.inverseProjectionMatrix * clip;
  return viewPosition.xyz / max(abs(viewPosition.w), 0.00001);
}

fn clusteredVolumetricTrace_projectViewPosition(viewPosition: vec3f) -> vec2f {
  let clip = clusteredVolumetricTrace.projectionMatrix * vec4f(viewPosition, 1.0);
  let normalizedDeviceCoordinate = clip.xy / max(clip.w, 0.00001);
  return normalizedDeviceCoordinate * vec2f(0.5, -0.5) + vec2f(0.5);
}

fn clusteredVolumetricTrace_phase(cosine: f32, anisotropy: f32) -> f32 {
  let squaredAnisotropy = anisotropy * anisotropy;
  let denominator = max(1.0 + squaredAnisotropy - 2.0 * anisotropy * cosine, 0.02);
  return (1.0 - squaredAnisotropy) /
    (4.0 * CLUSTERED_VOLUMETRIC_PI * pow(denominator, 1.5));
}

fn clusteredVolumetricTrace_clusterIndex(texCoord: vec2f, viewDepth: f32) -> u32 {
  let tileX = min(
    u32(clamp(texCoord.x, 0.0, 0.999999) * f32(clusteredVolumetricTrace.clusterCountX)),
    clusteredVolumetricTrace.clusterCountX - 1u
  );
  let tileY = min(
    u32(clamp(texCoord.y, 0.0, 0.999999) * f32(clusteredVolumetricTrace.clusterCountY)),
    clusteredVolumetricTrace.clusterCountY - 1u
  );
  let normalizedDepth = clamp(
    log(max(viewDepth, clusteredVolumetricTrace.clusterNearPlane) /
      clusteredVolumetricTrace.clusterNearPlane) /
      log(clusteredVolumetricTrace.clusterFarPlane /
        clusteredVolumetricTrace.clusterNearPlane),
    0.0,
    0.999999
  );
  let tileZ = min(
    u32(normalizedDepth * f32(clusteredVolumetricTrace.clusterCountZ)),
    clusteredVolumetricTrace.clusterCountZ - 1u
  );
  return tileX + clusteredVolumetricTrace.clusterCountX *
    (tileY + clusteredVolumetricTrace.clusterCountY * tileZ);
}

fn clusteredVolumetricTrace_directionalVisibility(viewPosition: vec3f) -> f32 {
  let lightDirection = normalize(clusteredVolumetricTrace.directionalLightDirectionView);
  for (var shadowStep: u32 = 1u; shadowStep <= 3u; shadowStep++) {
    let shadowPosition = viewPosition + lightDirection * (0.32 + f32(shadowStep) * 0.95);
    if (shadowPosition.z >= -0.04) {
      return 1.0;
    }
    let shadowCoord = clusteredVolumetricTrace_projectViewPosition(shadowPosition);
    if (any(shadowCoord <= vec2f(0.0)) || any(shadowCoord >= vec2f(1.0))) {
      return 1.0;
    }
    let occluderDepth = textureSampleLevel(depthTexture, depthTextureSampler, shadowCoord, 0);
    if (occluderDepth >= 0.99999) {
      continue;
    }
    let occluderPosition = clusteredVolumetricTrace_reconstructViewPosition(
      shadowCoord,
      occluderDepth
    );
    let depthBehindOccluder = -shadowPosition.z - (-occluderPosition.z);
    if (depthBehindOccluder > 0.06 && depthBehindOccluder < 1.9) {
      return 1.0 - clusteredVolumetricTrace.shadowStrength;
    }
  }
  return 1.0;
}

fn clusteredVolumetricTrace_godRayVisibility(texCoord: vec2f) -> f32 {
  if (clusteredVolumetricTrace.godRayIntensity <= 0.0001) {
    return 0.0;
  }

  let sampleCount = clamp(
    u32(clusteredVolumetricTrace.godRaySampleCount),
    3u,
    CLUSTERED_VOLUMETRIC_MAX_GOD_RAY_STEPS
  );
  let sampleOffset = (texCoord - clusteredVolumetricTrace.godRayPosition) *
    clusteredVolumetricTrace.godRayDensity / f32(sampleCount);
  var sampleCoord = texCoord;
  var illumination = 0.0;
  var totalWeight = 0.0;
  var illuminationDecay = 1.0;

  for (var sampleIndex: u32 = 0u;
      sampleIndex < CLUSTERED_VOLUMETRIC_MAX_GOD_RAY_STEPS;
      sampleIndex++) {
    if (sampleIndex >= sampleCount) {
      break;
    }
    sampleCoord -= sampleOffset;
    if (any(sampleCoord < vec2f(0.0)) || any(sampleCoord > vec2f(1.0))) {
      break;
    }
    let dimensions = textureDimensions(depthTexture);
    let pixel = clamp(vec2i(sampleCoord * vec2f(dimensions)), vec2i(0), vec2i(dimensions) - vec2i(1));
    let occluderDepth = textureLoad(depthTexture, pixel, 0);
    // Perspective depth approaches one on distant opaque geometry. Only cleared
    // depth is open sky; a fixed near-one threshold leaks shafts through buildings.
    let visibility = select(0.0, 1.0, occluderDepth >= 1.0);
    // Integrate a finite emitter rather than treating every open-sky pixel as a sun.
    let sourceOffset = (sampleCoord - clusteredVolumetricTrace.godRayPosition) /
      max(clusteredVolumetricTrace.godRaySourceRadius, 0.001);
    let sourceRadiance = exp(-dot(sourceOffset, sourceOffset));
    illumination += visibility * sourceRadiance * illuminationDecay;
    totalWeight += illuminationDecay;
    illuminationDecay *= clusteredVolumetricTrace.godRayDecay;
  }

  let distanceFromSun = distance(texCoord, clusteredVolumetricTrace.godRayPosition);
  return illumination / max(totalWeight, 0.0001) * exp(-distanceFromSun * 1.6);
}

fn clusteredVolumetricTrace_pointRadiance(
  texCoord: vec2f,
  viewPosition: vec3f,
  viewDirection: vec3f
) -> vec3f {
  let clusterIndex = clusteredVolumetricTrace_clusterIndex(texCoord, -viewPosition.z);
  let clusterCount = clusterLightCounts[clusterIndex];
  let firstCandidateIndex = clusterIndex * clusteredVolumetricTrace.maxLightsPerCluster;
  let clampedFirstCandidateIndex = min(firstCandidateIndex, arrayLength(&clusterLightIndices));
  let storedCandidateCapacity = min(
    clusteredVolumetricTrace.maxLightsPerCluster,
    arrayLength(&clusterLightIndices) - clampedFirstCandidateIndex
  );
  let candidateCount = min(clusterCount, storedCandidateCapacity);
  let activePointLightCount = min(
    clusteredVolumetricTrace.pointLightCount,
    arrayLength(&pointLights)
  );
  var selectedLightIndices: array<u32, CLUSTERED_VOLUMETRIC_MAX_LIGHTS>;
  var selectedLightScores: array<f32, CLUSTERED_VOLUMETRIC_MAX_LIGHTS>;
  for (var slotIndex: u32 = 0u; slotIndex < CLUSTERED_VOLUMETRIC_MAX_LIGHTS; slotIndex++) {
    selectedLightIndices[slotIndex] = 0xffffffffu;
    selectedLightScores[slotIndex] = 1.0e20;
  }
  var selectedLightCount = 0u;
  var worstSlotIndex = 0u;
  var worstScore = -1.0;

  // Score every candidate retained by the cluster builder, including its complete overflow-safe
  // storage capacity, while keeping integration work independent of the global light count.
  for (var candidateIndex: u32 = 0u; candidateIndex < candidateCount; candidateIndex++) {
    let lightIndex = clusterLightIndices[firstCandidateIndex + candidateIndex];
    if (lightIndex >= activePointLightCount) {
      continue;
    }
    let light = pointLights[lightIndex];
    let toLight = light.positionRange.xyz - viewPosition;
    let distanceSquared = dot(toLight, toLight);
    let rangeSquared = light.positionRange.w * light.positionRange.w;
    if (distanceSquared >= rangeSquared || distanceSquared <= 0.0004) {
      continue;
    }
    let lightScore = distanceSquared /
      max(rangeSquared * max(light.colorIntensity.a, 0.05), 0.0001);
    if (selectedLightCount < CLUSTERED_VOLUMETRIC_MAX_LIGHTS) {
      selectedLightIndices[selectedLightCount] = lightIndex;
      selectedLightScores[selectedLightCount] = lightScore;
      if (lightScore > worstScore) {
        worstSlotIndex = selectedLightCount;
        worstScore = lightScore;
      }
      selectedLightCount += 1u;
      continue;
    }
    if (lightScore < worstScore) {
      selectedLightIndices[worstSlotIndex] = lightIndex;
      selectedLightScores[worstSlotIndex] = lightScore;
      worstSlotIndex = 0u;
      worstScore = selectedLightScores[0];
      for (var slotIndex = 1u; slotIndex < CLUSTERED_VOLUMETRIC_MAX_LIGHTS; slotIndex++) {
        if (selectedLightScores[slotIndex] > worstScore) {
          worstSlotIndex = slotIndex;
          worstScore = selectedLightScores[slotIndex];
        }
      }
    }
  }

  var radiance = vec3f(0.0);
  for (var slotIndex: u32 = 0u; slotIndex < CLUSTERED_VOLUMETRIC_MAX_LIGHTS; slotIndex++) {
    let lightIndex = selectedLightIndices[slotIndex];
    if (lightIndex >= arrayLength(&pointLights)) {
      continue;
    }
    let light = pointLights[lightIndex];
    let toLight = light.positionRange.xyz - viewPosition;
    let distanceToLight = length(toLight);
    if (distanceToLight >= light.positionRange.w || distanceToLight <= 0.02) {
      continue;
    }
    let lightDirection = toLight / distanceToLight;
    let rangeFade = pow(1.0 - distanceToLight / light.positionRange.w, 2.0);
    let attenuation = rangeFade / (1.0 + distanceToLight * distanceToLight * 0.1);
    let phase = clusteredVolumetricTrace_phase(
      dot(viewDirection, lightDirection),
      clusteredVolumetricTrace.anisotropy * 0.65
    );
    radiance += light.colorIntensity.rgb * light.colorIntensity.a *
      attenuation * phase * clusteredVolumetricTrace.pointLightIntensity;
  }
  return radiance;
}

fn clusteredVolumetricTrace_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  if (clusteredVolumetricTrace.density <= 0.0001) {
    return vec4f(0.0, 0.0, 0.0, 1.0);
  }
  let sceneDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  let rayOrigin = clusteredVolumetricTrace_reconstructViewPosition(texCoord, 0.0);
  let farPosition = clusteredVolumetricTrace_reconstructViewPosition(texCoord, 0.9999);
  let viewDirection = normalize(farPosition - rayOrigin);
  let scenePosition = clusteredVolumetricTrace_reconstructViewPosition(texCoord, sceneDepth);
  let rayDistance = select(
    min(
      max(dot(scenePosition - rayOrigin, viewDirection), 0.0),
      clusteredVolumetricTrace.maxDistance
    ),
    clusteredVolumetricTrace.maxDistance,
    sceneDepth >= 0.99999
  );
  let stepCount = clamp(u32(clusteredVolumetricTrace.sampleCount), 3u,
    CLUSTERED_VOLUMETRIC_MAX_STEPS);
  let stepDistance = rayDistance / f32(stepCount);
  let pixelCoordinate = floor(texCoord * texSize);
  let rayJitter = fract(sin(dot(pixelCoordinate, vec2f(12.9898, 78.233))) * 43758.5453);
  let directionalPhase = clusteredVolumetricTrace_phase(
    dot(viewDirection, normalize(clusteredVolumetricTrace.directionalLightDirectionView)),
    clusteredVolumetricTrace.anisotropy
  );
  let godRayVisibility = clusteredVolumetricTrace_godRayVisibility(texCoord);

  var opticalDepth = 0.0;
  var scattering = vec3f(0.0);
  for (var stepIndex: u32 = 0u; stepIndex < CLUSTERED_VOLUMETRIC_MAX_STEPS; stepIndex++) {
    if (stepIndex >= stepCount) {
      break;
    }
    let travel = (f32(stepIndex) + 0.28 + rayJitter * 0.52) * stepDistance;
    let viewPosition = rayOrigin + viewDirection * travel;
    let worldPosition =
      (clusteredVolumetricTrace.inverseViewMatrix * vec4f(viewPosition, 1.0)).xyz;
    let localDensity = clusteredVolumetricTrace.density * exp(
      -max(worldPosition.y - clusteredVolumetricTrace.fogHeight, 0.0) *
        clusteredVolumetricTrace.heightFalloff
    );
    let extinction = localDensity * stepDistance;
    opticalDepth += extinction;
    let directionalVisibility = clusteredVolumetricTrace_directionalVisibility(viewPosition);
    let directionalRadiance = clusteredVolumetricTrace.directionalLightColor *
      clusteredVolumetricTrace.directionalIntensity * directionalPhase * directionalVisibility;
    let godRayRadiance = clusteredVolumetricTrace.directionalLightColor *
      clusteredVolumetricTrace.directionalIntensity * directionalPhase * godRayVisibility *
      clusteredVolumetricTrace.godRayIntensity * 2.4;
    let localRadiance = clusteredVolumetricTrace_pointRadiance(
      texCoord,
      viewPosition,
      viewDirection
    );
    let incomingRadiance = select(
      clusteredVolumetricTrace.fogColor * 0.11 + directionalRadiance + localRadiance +
        godRayRadiance,
      godRayRadiance,
      clusteredVolumetricTrace.godRaysOnly > 0.5
    );
    scattering += incomingRadiance * extinction * exp(-opticalDepth);
  }

  return vec4f(scattering, clamp(exp(-opticalDepth), 0.0, 1.0));
}`,bindingLayout:[{name:"depthTexture",group:0},{name:"pointLights",group:0},{name:"clusterLightCounts",group:0},{name:"clusterLightIndices",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{projectionMatrix:"mat4x4<f32>",inverseProjectionMatrix:"mat4x4<f32>",inverseViewMatrix:"mat4x4<f32>",directionalLightDirectionView:"vec3<f32>",directionalLightColor:"vec3<f32>",fogColor:"vec3<f32>",godRayPosition:"vec2<f32>",density:"f32",heightFalloff:"f32",fogHeight:"f32",anisotropy:"f32",directionalIntensity:"f32",pointLightIntensity:"f32",godRayIntensity:"f32",godRaySourceRadius:"f32",godRayDensity:"f32",godRayDecay:"f32",godRaySampleCount:"f32",godRaysOnly:"f32",maxDistance:"f32",sampleCount:"f32",shadowStrength:"f32",clusterCountX:"u32",clusterCountY:"u32",clusterCountZ:"u32",maxLightsPerCluster:"u32",pointLightCount:"u32",clusterNearPlane:"f32",clusterFarPlane:"f32"},propTypes:{projectionMatrix:{value:S,private:!0},inverseProjectionMatrix:{value:S,private:!0},inverseViewMatrix:{value:S,private:!0},directionalLightDirectionView:{value:[.35,.82,.38],private:!0},directionalLightColor:{value:[1,.85,.66],private:!0},fogColor:{value:[.18,.3,.48]},godRayPosition:{value:[.72,.16]},density:{value:.055,min:0,softMax:.22},heightFalloff:{value:.23,min:0,softMax:2},fogHeight:{value:.2,min:-5,softMax:5},anisotropy:{value:.45,min:-.8,max:.85},directionalIntensity:{value:2.2,min:0,softMax:8},pointLightIntensity:{value:1.8,min:0,softMax:6},godRayIntensity:{value:0,min:0,softMax:6},godRaySourceRadius:{value:.08,min:.001,softMax:.3},godRayDensity:{value:.94,min:.1,max:1.2},godRayDecay:{value:.96,min:.7,max:1},godRaySampleCount:{value:18,min:3,max:32},godRaysOnly:{value:0,min:0,max:1,private:!0},maxDistance:{value:28,min:1,softMax:80},sampleCount:{value:10,min:3,max:20},shadowStrength:{value:.74,min:0,max:1},clusterCountX:{value:1,private:!0},clusterCountY:{value:1,private:!0},clusterCountZ:{value:1,private:!0},maxLightsPerCluster:{value:1,private:!0},pointLightCount:{value:0,private:!0},clusterNearPlane:{value:.1,private:!0},clusterFarPlane:{value:100,private:!0}},passes:[{sampler:!0}]},Oe={name:"clusteredVolumetricTemporal",source:`struct ClusteredVolumetricTemporalUniforms {
  inverseProjectionMatrix: mat4x4f,
  inverseViewProjectionMatrix: mat4x4f,
  previousViewProjectionMatrix: mat4x4f,
  historyWeight: f32,
  depthThreshold: f32,
};

@group(0) @binding(auto) var<uniform> clusteredVolumetricTemporal:
  ClusteredVolumetricTemporalUniforms;
@group(0) @binding(auto) var historyTexture: texture_2d<f32>;
@group(0) @binding(auto) var historyTextureSampler: sampler;
@group(0) @binding(auto) var velocityTexture: texture_2d<f32>;
@group(0) @binding(auto) var velocityTextureSampler: sampler;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var previousDepthTexture: texture_2d<f32>;

fn clusteredVolumetricTemporal_viewDepth(texCoord: vec2f, depth: f32) -> f32 {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = clusteredVolumetricTemporal.inverseProjectionMatrix * clip;
  return abs(viewPosition.z / max(abs(viewPosition.w), 0.00001));
}

fn clusteredVolumetricTemporal_cameraPreviousCoord(texCoord: vec2f, depth: f32) -> vec3f {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let worldPosition = clusteredVolumetricTemporal.inverseViewProjectionMatrix * clip;
  let world = worldPosition.xyz / max(abs(worldPosition.w), 0.00001);
  let previousClip = clusteredVolumetricTemporal.previousViewProjectionMatrix * vec4f(world, 1.0);
  let previousNdc = previousClip.xy / max(abs(previousClip.w), 0.00001);
  let previousCoord = previousNdc * vec2f(0.5, -0.5) + vec2f(0.5);
  return vec3f(previousCoord, select(0.0, 1.0, previousClip.w > 0.00001));
}

fn clusteredVolumetricTemporal_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let current = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let currentDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  let velocity = textureSampleLevel(velocityTexture, velocityTextureSampler, texCoord, 0).xy;
  let cameraReprojection = clusteredVolumetricTemporal_cameraPreviousCoord(texCoord, currentDepth);
  let velocityIsFinite = all(velocity == velocity) && all(abs(velocity) <= vec2f(1.0));
  let useObjectVelocity = currentDepth < 0.99999 && velocityIsFinite;
  let previousCoord = select(cameraReprojection.xy, texCoord - velocity, useObjectVelocity);
  let validCoordinate = all(previousCoord >= vec2f(0.0)) &&
    all(previousCoord <= vec2f(1.0)) &&
    (useObjectVelocity || cameraReprojection.z > 0.5);
  let clampedPreviousCoord = clamp(previousCoord, vec2f(0.0), vec2f(1.0));
  let previousDepthDimensions = textureDimensions(previousDepthTexture);
  let previousDepthCoordinate = min(
    vec2u(clampedPreviousCoord * vec2f(previousDepthDimensions)),
    previousDepthDimensions - vec2u(1u)
  );
  let currentViewDepth = clusteredVolumetricTemporal_viewDepth(texCoord, currentDepth);
  let previousViewDepth = textureLoad(
    previousDepthTexture,
    vec2i(previousDepthCoordinate),
    0
  ).r;
  let relativeDepthDifference = abs(previousViewDepth - currentViewDepth) /
    max(currentViewDepth, 0.0001);
  let validDepth = previousViewDepth > 0.0 &&
    relativeDepthDifference < clusteredVolumetricTemporal.depthThreshold;

  let texel = 1.0 / vec2f(textureDimensions(sourceTexture));
  var minimumScattering = current;
  var maximumScattering = current;
  for (var sampleY: i32 = -1; sampleY <= 1; sampleY++) {
    for (var sampleX: i32 = -1; sampleX <= 1; sampleX++) {
      let sampleCoord = clamp(
        texCoord + vec2f(f32(sampleX), f32(sampleY)) * texel,
        vec2f(0.0),
        vec2f(1.0)
      );
      let sampleScattering = textureSampleLevel(
        sourceTexture,
        sourceTextureSampler,
        sampleCoord,
        0
      );
      minimumScattering = min(minimumScattering, sampleScattering);
      maximumScattering = max(maximumScattering, sampleScattering);
    }
  }

  let history = clamp(
    textureSampleLevel(historyTexture, historyTextureSampler, clampedPreviousCoord, 0),
    minimumScattering,
    maximumScattering
  );
  let weight = select(
    0.0,
    clusteredVolumetricTemporal.historyWeight,
    validCoordinate && validDepth
  );
  return mix(current, history, weight);
}`,bindingLayout:[{name:"historyTexture",group:0},{name:"velocityTexture",group:0},{name:"depthTexture",group:0},{name:"previousDepthTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{inverseProjectionMatrix:"mat4x4<f32>",inverseViewProjectionMatrix:"mat4x4<f32>",previousViewProjectionMatrix:"mat4x4<f32>",historyWeight:"f32",depthThreshold:"f32"},propTypes:{inverseProjectionMatrix:{value:S,private:!0},inverseViewProjectionMatrix:{value:S,private:!0},previousViewProjectionMatrix:{value:S,private:!0},historyWeight:{value:.88,min:0,max:.97},depthThreshold:{value:.035,min:1e-4,softMax:.2}},passes:[{sampler:!0}]},Fe={name:"clusteredVolumetricDepthHistoryCopy",source:`struct ClusteredVolumetricDepthHistoryCopyUniforms {
  inverseProjectionMatrix: mat4x4f,
};

@group(0) @binding(auto) var<uniform> clusteredVolumetricDepthHistoryCopy:
  ClusteredVolumetricDepthHistoryCopyUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;

fn clusteredVolumetricDepthHistoryCopy_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let depth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = clusteredVolumetricDepthHistoryCopy.inverseProjectionMatrix * clip;
  let linearDepth = abs(viewPosition.z / max(abs(viewPosition.w), 0.00001));
  return vec4f(linearDepth, 0.0, 0.0, 1.0);
}`,bindingLayout:[{name:"depthTexture",group:0}],props:{},uniforms:{},uniformTypes:{inverseProjectionMatrix:"mat4x4<f32>"},propTypes:{inverseProjectionMatrix:{value:S,private:!0}},passes:[{sampler:!0}]},Ue={name:"clusteredVolumetricComposite",source:`struct ClusteredVolumetricCompositeUniforms {
  strength: f32,
  debugMode: f32,
};

@group(0) @binding(auto) var<uniform> clusteredVolumetricComposite:
  ClusteredVolumetricCompositeUniforms;
@group(0) @binding(auto) var scatteringTexture: texture_2d<f32>;
@group(0) @binding(auto) var scatteringTextureSampler: sampler;

fn clusteredVolumetricComposite_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let source = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let scattering = textureSampleLevel(scatteringTexture, scatteringTextureSampler, texCoord, 0);
  if (clusteredVolumetricComposite.debugMode > 1.5) {
    return vec4f(vec3f(clamp(scattering.a, 0.0, 1.0)), 1.0);
  }
  if (clusteredVolumetricComposite.debugMode > 0.5) {
    return vec4f(scattering.rgb * 2.4, 1.0);
  }
  let strength = clamp(clusteredVolumetricComposite.strength, 0.0, 2.0);
  let transmittance = mix(1.0, clamp(scattering.a, 0.0, 1.0), min(strength, 1.0));
  return vec4f(source.rgb * transmittance + scattering.rgb * strength, source.a);
}`,bindingLayout:[{name:"scatteringTexture",group:0}],props:{},uniforms:{},uniformTypes:{strength:"f32",debugMode:"f32"},propTypes:{strength:{value:.9,min:0,softMax:2},debugMode:{value:0,min:0,max:2,private:!0}},passes:[{sampler:!0}]};function He(s={}){const e=s.resolutionScale??1;return{name:"clusteredVolumetricLightingCompositeShaderPass",renderTargets:{clusteredVolumeRaw:{scale:[e,e],format:"rgba16float"},clusteredVolumeHistory:{scale:[e,e],format:"rgba16float",lifetime:"history",initialize:{clearColor:[0,0,0,1]}},clusteredVolumeDepthHistory:{scale:[e,e],format:"rg16float",lifetime:"history",initialize:{clearColor:[0,0,0,1]}},clusteredVolumeScratch:{scale:[e,e],format:"rgba16float"},clusteredVolumeScattering:{scale:[e,e],format:"rgba16float"}},steps:[{shaderPass:ze,inputs:{sourceTexture:"previous"},output:"clusteredVolumeRaw"},{shaderPass:Oe,inputs:{sourceTexture:"clusteredVolumeRaw",historyTexture:"clusteredVolumeHistory",previousDepthTexture:"clusteredVolumeDepthHistory"},output:"clusteredVolumeHistory"},{shaderPass:Fe,inputs:{sourceTexture:"previous"},output:"clusteredVolumeDepthHistory"},{shaderPass:ee,inputs:{sourceTexture:"clusteredVolumeHistory"},output:"clusteredVolumeScratch",uniforms:{direction:[1,0],radius:3,spatialSigma:2.2,depthSigma:.018}},{shaderPass:ee,inputs:{sourceTexture:"clusteredVolumeScratch"},output:"clusteredVolumeScattering",uniforms:{direction:[0,1],radius:3,spatialSigma:2.2,depthSigma:.018}},{shaderPass:Ue,inputs:{sourceTexture:"previous",scatteringTexture:"clusteredVolumeScattering"},output:"previous"}]}}const Be={name:"hdrLuminanceExtract",source:`fn hdrLuminanceExtract_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sourceTexel = 1.0 / vec2f(textureDimensions(sourceTexture));
  var weightedLogLuminance = 0.0;
  var totalWeight = 0.0;

  for (var sampleY: i32 = 0; sampleY < 4; sampleY++) {
    for (var sampleX: i32 = 0; sampleX < 4; sampleX++) {
      let sampleOffset = vec2f(f32(sampleX) - 1.5, f32(sampleY) - 1.5);
      let sampleCoord = clamp(texCoord + sampleOffset * sourceTexel, vec2f(0.0), vec2f(1.0));
      let sourceColor = textureSampleLevel(sourceTexture, sourceTextureSampler, sampleCoord, 0).rgb;
      let luminance = max(dot(max(sourceColor, vec3f(0.0)), vec3f(0.2126, 0.7152, 0.0722)), 0.0001);
      let distanceFromCenter = distance(sampleCoord, vec2f(0.5));
      let centerWeight = mix(1.0, 0.35, smoothstep(0.18, 0.72, distanceFromCenter));
      weightedLogLuminance += log(luminance) * centerWeight;
      totalWeight += centerWeight;
    }
  }

  return vec4f(weightedLogLuminance, totalWeight, 0.0, 1.0);
}`,passes:[{sampler:!0}]},O={name:"hdrLuminanceReduce",source:`fn hdrLuminanceReduce_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let sourceTexel = 1.0 / vec2f(textureDimensions(sourceTexture));
  var meterState = vec2f(0.0);

  for (var sampleY: i32 = 0; sampleY < 4; sampleY++) {
    for (var sampleX: i32 = 0; sampleX < 4; sampleX++) {
      let sampleOffset = vec2f(f32(sampleX) - 1.5, f32(sampleY) - 1.5);
      let sampleCoord = clamp(texCoord + sampleOffset * sourceTexel, vec2f(0.0), vec2f(1.0));
      meterState += textureSampleLevel(sourceTexture, sourceTextureSampler, sampleCoord, 0).rg;
    }
  }

  return vec4f(meterState / 16.0, 0.0, 1.0);
}`,passes:[{sampler:!0}]},We={name:"hdrAutoExposureAdapt",source:`struct HDRAutoExposureAdaptUniforms {
  keyValue: f32,
  minimumExposure: f32,
  maximumExposure: f32,
  brightenSpeed: f32,
  darkenSpeed: f32,
  deltaTime: f32,
  enabled: f32,
};

@group(0) @binding(auto) var<uniform> hdrAutoExposureAdapt: HDRAutoExposureAdaptUniforms;
@group(0) @binding(auto) var historyTexture: texture_2d<f32>;
@group(0) @binding(auto) var historyTextureSampler: sampler;

fn hdrAutoExposureAdapt_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  if (hdrAutoExposureAdapt.enabled < 0.5) {
    return vec4f(1.0, 0.0, 0.0, 1.0);
  }

  let sourceDimensions = textureDimensions(sourceTexture);
  var meterState = vec2f(0.0);
  for (var sampleY: u32 = 0u; sampleY < sourceDimensions.y; sampleY++) {
    for (var sampleX: u32 = 0u; sampleX < sourceDimensions.x; sampleX++) {
      meterState += textureLoad(sourceTexture, vec2i(i32(sampleX), i32(sampleY)), 0).rg;
    }
  }

  let logLuminance = meterState.x / max(meterState.y, 0.0001);
  let averageLuminance = max(exp(logLuminance), 0.0001);
  let minimumExposure = max(
    min(hdrAutoExposureAdapt.minimumExposure, hdrAutoExposureAdapt.maximumExposure),
    0.0001
  );
  let maximumExposure = max(
    max(hdrAutoExposureAdapt.minimumExposure, hdrAutoExposureAdapt.maximumExposure),
    minimumExposure
  );
  let targetExposure = clamp(
    hdrAutoExposureAdapt.keyValue / averageLuminance,
    minimumExposure,
    maximumExposure
  );
  let previousExposure = clamp(
    textureSampleLevel(historyTexture, historyTextureSampler, vec2f(0.5), 0).r,
    minimumExposure,
    maximumExposure
  );
  let adaptationSpeed = select(
    hdrAutoExposureAdapt.darkenSpeed,
    hdrAutoExposureAdapt.brightenSpeed,
    targetExposure > previousExposure
  );
  let adaptationWeight = 1.0 - exp(-adaptationSpeed * max(hdrAutoExposureAdapt.deltaTime, 0.0));
  let exposure = clamp(
    mix(previousExposure, targetExposure, adaptationWeight),
    minimumExposure,
    maximumExposure
  );
  return vec4f(exposure, averageLuminance, targetExposure, 1.0);
}`,bindingLayout:[{name:"historyTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{keyValue:"f32",minimumExposure:"f32",maximumExposure:"f32",brightenSpeed:"f32",darkenSpeed:"f32",deltaTime:"f32",enabled:"f32"},propTypes:{keyValue:{value:.48,min:.05,softMax:2},minimumExposure:{value:.45,min:.01,softMax:2},maximumExposure:{value:2.4,min:.1,softMax:8},brightenSpeed:{value:1.6,min:.05,softMax:8},darkenSpeed:{value:2.8,min:.05,softMax:8},deltaTime:{value:.016,min:0,max:.25,private:!0},enabled:{value:1,min:0,max:1}},passes:[{sampler:!0}]},Ge={name:"hdrAutoExposureApply",source:`struct HDRAutoExposureApplyUniforms {
  debugMode: f32,
  enabled: f32,
};

@group(0) @binding(auto) var<uniform> hdrAutoExposureApply: HDRAutoExposureApplyUniforms;
@group(0) @binding(auto) var exposureTexture: texture_2d<f32>;
@group(0) @binding(auto) var exposureTextureSampler: sampler;

fn hdrAutoExposureApply_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let source = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let exposureState = textureSampleLevel(exposureTexture, exposureTextureSampler, vec2f(0.5), 0);
  if (hdrAutoExposureApply.debugMode > 0.5) {
    let sceneLuminance = max(dot(source.rgb, vec3f(0.2126, 0.7152, 0.0722)), 0.0001);
    let normalizedLuminance = clamp((log2(sceneLuminance) + 5.0) / 10.0, 0.0, 1.0);
    let shadows = vec3f(0.06, 0.10, 0.40);
    let midtones = vec3f(0.15, 0.82, 0.58);
    let highlights = vec3f(1.0, 0.63, 0.08);
    let heatMap = mix(
      mix(shadows, midtones, smoothstep(0.0, 0.5, normalizedLuminance)),
      highlights,
      smoothstep(0.5, 1.0, normalizedLuminance)
    );
    return vec4f(heatMap, source.a);
  }

  if (hdrAutoExposureApply.enabled < 0.5) {
    return source;
  }

  return vec4f(source.rgb * exposureState.r, source.a);
}`,bindingLayout:[{name:"exposureTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{debugMode:"f32",enabled:"f32"},propTypes:{debugMode:{value:0,min:0,max:1,private:!0},enabled:{value:1,min:0,max:1}},passes:[{sampler:!0}]};function ke(s={}){const e=Math.max(s.meteringScale??.25,.25),n=Math.max(s.initialExposure??1,1e-4),r=e/4,o=r/4,u=o/4,a=u/4;return{name:"hdrAutoExposureCompositeShaderPass",renderTargets:{hdrLuminanceQuarter:{scale:[e,e],format:"rgba16float"},hdrLuminanceSixteenth:{scale:[r,r],format:"rgba16float"},hdrLuminanceSixtyFourth:{scale:[o,o],format:"rgba16float"},hdrLuminanceTwoFiftySixth:{scale:[u,u],format:"rgba16float"},hdrLuminanceThousandth:{scale:[a,a],format:"rgba16float"},hdrExposureHistory:{scale:[a,a],format:"rgba16float",lifetime:"history",initialize:{clearColor:[n,1,1,1]}}},steps:[{shaderPass:Be,inputs:{sourceTexture:"previous"},output:"hdrLuminanceQuarter"},{shaderPass:O,inputs:{sourceTexture:"hdrLuminanceQuarter"},output:"hdrLuminanceSixteenth"},{shaderPass:O,inputs:{sourceTexture:"hdrLuminanceSixteenth"},output:"hdrLuminanceSixtyFourth"},{shaderPass:O,inputs:{sourceTexture:"hdrLuminanceSixtyFourth"},output:"hdrLuminanceTwoFiftySixth"},{shaderPass:O,inputs:{sourceTexture:"hdrLuminanceTwoFiftySixth"},output:"hdrLuminanceThousandth"},{shaderPass:We,inputs:{sourceTexture:"hdrLuminanceThousandth",historyTexture:"hdrExposureHistory"},output:"hdrExposureHistory"},{shaderPass:Ge,inputs:{sourceTexture:"previous",exposureTexture:"hdrExposureHistory"},output:"previous"}]}}const X=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],Xe={name:"ssgiTrace",source:`const SSGI_TWO_PI: f32 = 6.283185307179586;
const SSGI_GOLDEN_ANGLE: f32 = 2.399963229728653;
const SSGI_MAX_RAYS: i32 = 12;
const SSGI_MAX_STEPS: i32 = 12;

struct SSGITraceUniforms {
  projectionMatrix: mat4x4f,
  inverseProjectionMatrix: mat4x4f,
  radius: f32,
  thickness: f32,
  intensity: f32,
  rayCount: f32,
  stepCount: f32,
  frameIndex: f32,
};

@group(0) @binding(auto) var<uniform> ssgiTrace: SSGITraceUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTextureSampler: sampler;

fn ssgiTrace_reconstructViewPosition(texCoord: vec2f, depth: f32) -> vec3f {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = ssgiTrace.inverseProjectionMatrix * clip;
  return viewPosition.xyz / max(viewPosition.w, 0.00001);
}

fn ssgiTrace_projectViewPosition(viewPosition: vec3f) -> vec2f {
  let clip = ssgiTrace.projectionMatrix * vec4f(viewPosition, 1.0);
  let normalizedDeviceCoordinate = clip.xy / max(clip.w, 0.00001);
  return normalizedDeviceCoordinate * vec2f(0.5, -0.5) + vec2f(0.5);
}

fn ssgiTrace_hash(value: vec2f) -> f32 {
  return fract(sin(dot(value, vec2f(12.9898, 78.233))) * 43758.5453);
}

fn ssgiTrace_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let centerDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  if (centerDepth >= 0.99999 || ssgiTrace.intensity <= 0.0001) {
    return vec4f(0.0);
  }

  let centerPosition = ssgiTrace_reconstructViewPosition(texCoord, centerDepth);
  let centerNormalSample = textureSampleLevel(normalTexture, normalTextureSampler, texCoord, 0);
  let centerNormal = normalize(centerNormalSample.rgb * 2.0 - 1.0);
  let roughness = clamp(centerNormalSample.a, 0.0, 1.0);
  let referenceAxis = select(
    vec3f(0.0, 1.0, 0.0),
    vec3f(1.0, 0.0, 0.0),
    abs(centerNormal.y) > 0.9
  );
  let tangent = normalize(cross(referenceAxis, centerNormal));
  let bitangent = normalize(cross(centerNormal, tangent));
  let pixelCoordinate = floor(texCoord * vec2f(textureDimensions(depthTexture)));
  let rotation = ssgiTrace_hash(pixelCoordinate) * SSGI_TWO_PI;
  let activeRayCount = clamp(i32(ssgiTrace.rayCount), 1, SSGI_MAX_RAYS);
  let activeStepCount = clamp(i32(ssgiTrace.stepCount), 2, SSGI_MAX_STEPS);

  var indirectRadiance = vec3f(0.0);
  var accumulatedWeight = 0.0;
  var hitCount = 0.0;
  for (var rayIndex: i32 = 0; rayIndex < SSGI_MAX_RAYS; rayIndex++) {
    if (rayIndex >= activeRayCount) {
      break;
    }

    let distribution = (f32(rayIndex) + 0.5) / f32(activeRayCount);
    let cosine = sqrt(1.0 - distribution * 0.82);
    let sine = sqrt(max(1.0 - cosine * cosine, 0.0));
    let angle = rotation + f32(rayIndex) * SSGI_GOLDEN_ANGLE;
    let rayDirection = normalize(
      centerNormal * cosine +
        (tangent * cos(angle) + bitangent * sin(angle)) * sine
    );
    let rayOrigin = centerPosition + centerNormal * max(ssgiTrace.thickness * 0.2, 0.025);
    var previousDepthDelta = -ssgiTrace.thickness;

    for (var stepIndex: i32 = 1; stepIndex <= SSGI_MAX_STEPS; stepIndex++) {
      if (stepIndex > activeStepCount) {
        break;
      }

      let stepFraction = f32(stepIndex) / f32(activeStepCount);
      let travel = max(ssgiTrace.radius * pow(stepFraction, 1.35), 0.04);
      let rayPosition = rayOrigin + rayDirection * travel;
      if (rayPosition.z >= -0.04) {
        break;
      }

      let sampleCoord = ssgiTrace_projectViewPosition(rayPosition);
      if (any(sampleCoord <= vec2f(0.0)) || any(sampleCoord >= vec2f(1.0))) {
        break;
      }

      let sampleDepth = textureSampleLevel(depthTexture, depthTextureSampler, sampleCoord, 0);
      if (sampleDepth >= 0.99999) {
        previousDepthDelta = -ssgiTrace.thickness;
        continue;
      }

      let samplePosition = ssgiTrace_reconstructViewPosition(sampleCoord, sampleDepth);
      let depthDelta = (-rayPosition.z) - (-samplePosition.z);
      let stepDistance = ssgiTrace.radius / f32(activeStepCount);
      let hitThickness = max(ssgiTrace.thickness, stepDistance * 1.25);
      let screenDistance = length((sampleCoord - texCoord) * texSize);
      if (previousDepthDelta <= 0.0 && depthDelta >= 0.0 &&
          depthDelta <= hitThickness && screenDistance > 1.5) {
        let sampleNormal = normalize(
          textureSampleLevel(normalTexture, normalTextureSampler, sampleCoord, 0).rgb * 2.0 - 1.0
        );
        let emitterFacing = max(dot(sampleNormal, -rayDirection), 0.0);
        let receiverFacing = max(dot(centerNormal, rayDirection), 0.0);
        let distanceFalloff = 1.0 - smoothstep(
          ssgiTrace.radius * 0.28,
          ssgiTrace.radius,
          travel
        );
        let edgeDistance = min(
          min(sampleCoord.x, sampleCoord.y),
          min(1.0 - sampleCoord.x, 1.0 - sampleCoord.y)
        );
        let edgeWeight = smoothstep(0.0, 0.075, edgeDistance);
        let sampleWeight = receiverFacing * (0.2 + emitterFacing * 0.8) *
          distanceFalloff * edgeWeight;
        let sourceRadiance = textureSampleLevel(
          sourceTexture,
          sourceTextureSampler,
          sampleCoord,
          0
        ).rgb;
        indirectRadiance += sourceRadiance * sampleWeight;
        accumulatedWeight += sampleWeight;
        hitCount += select(0.0, 1.0, sampleWeight > 0.0001);
        break;
      }
      previousDepthDelta = depthDelta;
    }
  }

  let diffuseResponse = mix(0.18, 1.0, roughness);
  let radiance = indirectRadiance /
    max(f32(activeRayCount), 1.0) * ssgiTrace.intensity * diffuseResponse;
  let confidence = clamp(hitCount / max(f32(activeRayCount), 1.0), 0.0, 1.0);
  return vec4f(radiance, confidence);
}`,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{projectionMatrix:"mat4x4<f32>",inverseProjectionMatrix:"mat4x4<f32>",radius:"f32",thickness:"f32",intensity:"f32",rayCount:"f32",stepCount:"f32",frameIndex:"f32"},propTypes:{projectionMatrix:{value:X,private:!0},inverseProjectionMatrix:{value:X,private:!0},radius:{value:4.5,min:.2,softMax:12},thickness:{value:.32,min:.02,softMax:2},intensity:{value:2.2,min:0,softMax:6},rayCount:{value:7,min:1,max:12},stepCount:{value:8,min:2,max:12},frameIndex:{value:0,private:!0}},passes:[{sampler:!0}]},Ne={name:"ssgiTemporal",source:`struct SSGITemporalUniforms {
  inverseProjectionMatrix: mat4x4f,
  historyWeight: f32,
  depthThreshold: f32,
};

@group(0) @binding(auto) var<uniform> ssgiTemporal: SSGITemporalUniforms;
@group(0) @binding(auto) var historyTexture: texture_2d<f32>;
@group(0) @binding(auto) var historyTextureSampler: sampler;
@group(0) @binding(auto) var velocityTexture: texture_2d<f32>;
@group(0) @binding(auto) var velocityTextureSampler: sampler;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var previousDepthTexture: texture_2d<f32>;
@group(0) @binding(auto) var previousDepthTextureSampler: sampler;

fn ssgiTemporal_reconstructViewDepth(texCoord: vec2f, depth: f32) -> f32 {
  let clip = vec4f(texCoord.x * 2.0 - 1.0, 1.0 - texCoord.y * 2.0, depth, 1.0);
  let viewPosition = ssgiTemporal.inverseProjectionMatrix * clip;
  return abs(viewPosition.z / max(abs(viewPosition.w), 0.00001));
}

fn ssgiTemporal_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let current = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let currentDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  if (currentDepth >= 0.99999) {
    return vec4f(0.0);
  }

  let velocity = textureSampleLevel(velocityTexture, velocityTextureSampler, texCoord, 0).xy;
  let previousCoord = texCoord - velocity;
  let validCoordinate = all(previousCoord >= vec2f(0.0)) &&
    all(previousCoord <= vec2f(1.0));
  let clampedPreviousCoord = clamp(previousCoord, vec2f(0.0), vec2f(1.0));
  let previousDepth = textureSampleLevel(
    previousDepthTexture,
    previousDepthTextureSampler,
    clampedPreviousCoord,
    0
  ).r;
  let currentViewDepth = ssgiTemporal_reconstructViewDepth(texCoord, currentDepth);
  let previousViewDepth = ssgiTemporal_reconstructViewDepth(clampedPreviousCoord, previousDepth);
  let relativeDepthDifference = abs(previousViewDepth - currentViewDepth) /
    max(currentViewDepth, 0.0001);
  let validDepth = relativeDepthDifference < ssgiTemporal.depthThreshold;

  let texel = 1.0 / vec2f(textureDimensions(sourceTexture));
  var minimumRadiance = current;
  var maximumRadiance = current;
  for (var sampleY: i32 = -1; sampleY <= 1; sampleY++) {
    for (var sampleX: i32 = -1; sampleX <= 1; sampleX++) {
      let sampleCoord = clamp(
        texCoord + vec2f(f32(sampleX), f32(sampleY)) * texel,
        vec2f(0.0),
        vec2f(1.0)
      );
      let neighborhoodRadiance = textureSampleLevel(
        sourceTexture,
        sourceTextureSampler,
        sampleCoord,
        0
      );
      minimumRadiance = min(minimumRadiance, neighborhoodRadiance);
      maximumRadiance = max(maximumRadiance, neighborhoodRadiance);
    }
  }

  let historyRadiance = clamp(
    textureSampleLevel(historyTexture, historyTextureSampler, clampedPreviousCoord, 0),
    minimumRadiance,
    maximumRadiance
  );
  let historyWeight = select(
    0.0,
    ssgiTemporal.historyWeight,
    validCoordinate && validDepth
  );
  return mix(current, historyRadiance, historyWeight);
}`,bindingLayout:[{name:"historyTexture",group:0},{name:"velocityTexture",group:0},{name:"depthTexture",group:0},{name:"previousDepthTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{inverseProjectionMatrix:"mat4x4<f32>",historyWeight:"f32",depthThreshold:"f32"},propTypes:{inverseProjectionMatrix:{value:X,private:!0},historyWeight:{value:.89,min:0,max:.97},depthThreshold:{value:.022,min:1e-4,softMax:.1}},passes:[{sampler:!0}]},Ye={name:"ssgiDepthHistoryCopy",source:`@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;

fn ssgiDepthHistoryCopy_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let depth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  return vec4f(depth, 0.0, 0.0, 1.0);
}`,bindingLayout:[{name:"depthTexture",group:0}],passes:[{sampler:!0}]},ie={name:"ssgiSpatial",source:`struct SSGISpatialUniforms {
  direction: vec2f,
  radius: f32,
  depthSigma: f32,
};

@group(0) @binding(auto) var<uniform> ssgiSpatial: SSGISpatialUniforms;
@group(0) @binding(auto) var depthTexture: texture_depth_2d;
@group(0) @binding(auto) var depthTextureSampler: sampler;
@group(0) @binding(auto) var normalTexture: texture_2d<f32>;
@group(0) @binding(auto) var normalTextureSampler: sampler;

fn ssgiSpatial_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let centerRadiance = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let centerDepth = textureSampleLevel(depthTexture, depthTextureSampler, texCoord, 0);
  if (centerDepth >= 0.99999) {
    return vec4f(0.0);
  }

  let centerNormal = normalize(
    textureSampleLevel(normalTexture, normalTextureSampler, texCoord, 0).rgb * 2.0 - 1.0
  );
  let texel = ssgiSpatial.direction / vec2f(textureDimensions(sourceTexture));
  var radiance = centerRadiance;
  var accumulatedWeight = 1.0;
  for (var sampleIndex: i32 = 1; sampleIndex <= 5; sampleIndex++) {
    if (f32(sampleIndex) > ssgiSpatial.radius) {
      break;
    }
    for (var side: i32 = -1; side <= 1; side += 2) {
      let sampleCoord = clamp(
        texCoord + texel * f32(sampleIndex * side),
        vec2f(0.0),
        vec2f(1.0)
      );
      let sampleDepth = textureSampleLevel(depthTexture, depthTextureSampler, sampleCoord, 0);
      let sampleNormal = normalize(
        textureSampleLevel(normalTexture, normalTextureSampler, sampleCoord, 0).rgb * 2.0 - 1.0
      );
      let depthDelta = abs(sampleDepth - centerDepth);
      let depthWeight = exp(
        -(depthDelta * depthDelta) /
          max(2.0 * ssgiSpatial.depthSigma * ssgiSpatial.depthSigma, 0.000001)
      );
      let normalWeight = pow(max(dot(centerNormal, sampleNormal), 0.0), 12.0);
      let distanceWeight = exp(
        -f32(sampleIndex * sampleIndex) /
          max(2.0 * ssgiSpatial.radius * ssgiSpatial.radius, 0.1)
      );
      let weight = depthWeight * normalWeight * distanceWeight;
      radiance += textureSampleLevel(sourceTexture, sourceTextureSampler, sampleCoord, 0) * weight;
      accumulatedWeight += weight;
    }
  }

  return radiance / max(accumulatedWeight, 0.0001);
}`,bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0}],props:{},uniforms:{},bindings:{},uniformTypes:{direction:"vec2<f32>",radius:"f32",depthSigma:"f32"},propTypes:{direction:{value:[1,0]},radius:{value:3,min:0,max:5},depthSigma:{value:.012,min:1e-4,softMax:.1}},passes:[{sampler:!0}]},qe={name:"ssgiComposite",source:`struct SSGICompositeUniforms {
  strength: f32,
  debugMode: f32,
};

@group(0) @binding(auto) var<uniform> ssgiComposite: SSGICompositeUniforms;
@group(0) @binding(auto) var indirectLightingTexture: texture_2d<f32>;
@group(0) @binding(auto) var indirectLightingTextureSampler: sampler;

fn ssgiComposite_sampleColor(
  sourceTexture: texture_2d<f32>,
  sourceTextureSampler: sampler,
  texSize: vec2f,
  texCoord: vec2f
) -> vec4f {
  let color = textureSampleLevel(sourceTexture, sourceTextureSampler, texCoord, 0);
  let indirect = textureSampleLevel(
    indirectLightingTexture,
    indirectLightingTextureSampler,
    texCoord,
    0
  );
  if (ssgiComposite.debugMode > 1.5) {
    let confidence = clamp(indirect.a, 0.0, 1.0);
    return vec4f(
      mix(vec3f(0.025, 0.05, 0.18), vec3f(1.0, 0.72, 0.18), confidence),
      1.0
    );
  }
  if (ssgiComposite.debugMode > 0.5) {
    return vec4f(indirect.rgb * 2.2, 1.0);
  }
  return vec4f(color.rgb + indirect.rgb * ssgiComposite.strength, color.a);
}`,bindingLayout:[{name:"indirectLightingTexture",group:0}],props:{},uniforms:{},uniformTypes:{strength:"f32",debugMode:"f32"},propTypes:{strength:{value:1,min:0,softMax:3},debugMode:{value:0,min:0,max:2,private:!0}},passes:[{sampler:!0}]};function $e(s={}){const e=s.resolutionScale??1;return{name:"ssgiCompositeShaderPass",renderTargets:{ssgiRaw:{scale:[e,e],format:"rgba16float"},ssgiHistory:{scale:[e,e],format:"rgba16float",lifetime:"history",initialize:{clearColor:[0,0,0,0]}},ssgiHistoryDepth:{scale:[e,e],format:"rgba16float",lifetime:"history",initialize:{clearColor:[1,0,0,1]}},ssgiScratch:{scale:[e,e],format:"rgba16float"},ssgiIndirect:{scale:[e,e],format:"rgba16float"}},steps:[{shaderPass:Xe,inputs:{sourceTexture:"previous"},output:"ssgiRaw"},{shaderPass:Ne,inputs:{sourceTexture:"ssgiRaw",historyTexture:"ssgiHistory",previousDepthTexture:"ssgiHistoryDepth"},output:"ssgiHistory"},{shaderPass:Ye,inputs:{sourceTexture:"previous"},output:"ssgiHistoryDepth"},{shaderPass:ie,inputs:{sourceTexture:"ssgiHistory"},output:"ssgiScratch",uniforms:{direction:[1,0]}},{shaderPass:ie,inputs:{sourceTexture:"ssgiScratch"},output:"ssgiIndirect",uniforms:{direction:[0,1]}},{shaderPass:qe,inputs:{sourceTexture:"previous",indirectLightingTexture:"ssgiIndirect"},output:"previous"}]}}class oe extends F{static layerName="RiverFireflyReflectionLayer";constructor(e){super(e)}getShaders(e){return super.getShaders({...e,source:Ke,vs:Qe,fs:Je,modules:[...e.modules,Ze,ve,xe]})}draw(e){const n=ae(this.context.viewport,this.props.coordinateOrigin),r=new T(n.projectionMatrix).multiplyRight(n.viewMatrix),o=this.context.device.getCanvasContext();this.state.model.shaderInputs.setProps({waterMaterial:{mapping:"uv",coordinateScale:[.08,.08],normalStrength:this.props.surfaceRipples,waveASpeed:1.1,waveBSpeed:-.7,time:typeof this.props.time=="function"?this.props.time():this.props.time},riverWaterMaterial:{enabled:1,flowDirection:[0,1]},riverMirror:{viewProjection:r,inverseViewProjection:new T(r).invert(),surfaceHeight:this.props.surfaceHeight,surfaceBounds:this.props.surfaceBounds,textureSize:o.getDrawingBufferSize()}}),super.draw(e)}}const Ze={name:"riverMirror",source:`struct RiverMirrorUniforms {
    viewProjection: mat4x4f,
    inverseViewProjection: mat4x4f,
    surfaceBounds: vec4f,
    textureSize: vec2f,
    surfaceHeight: f32,
  };
  @group(3) @binding(auto) var<uniform> riverMirror: RiverMirrorUniforms;
  fn riverMirror_getPosition(position: vec3f) -> vec3f {
    return vec3f(position.xy, 2.0 * riverMirror.surfaceHeight - position.z);
  }`,vs:`layout(std140) uniform riverMirrorUniforms {
    mat4 viewProjection;
    mat4 inverseViewProjection;
    vec4 surfaceBounds;
    vec2 textureSize;
    float surfaceHeight;
  } riverMirror;`,fs:`layout(std140) uniform riverMirrorUniforms {
    mat4 viewProjection;
    mat4 inverseViewProjection;
    vec4 surfaceBounds;
    vec2 textureSize;
    float surfaceHeight;
  } riverMirror;`,uniformTypes:{viewProjection:"mat4x4<f32>",inverseViewProjection:"mat4x4<f32>",surfaceBounds:"vec4<f32>",textureSize:"vec2<f32>",surfaceHeight:"f32"},defaultUniforms:{viewProjection:new T,inverseViewProjection:new T,surfaceBounds:[-85,-625,85,625],textureSize:[1,1],surfaceHeight:0}},Ke=`
struct MirrorVertex {
  @builtin(position) position: vec4f,
  @location(0) coordinates: vec2f,
  @location(1) tint: vec3f,
  @location(2) opacity: f32,
  @location(3) velocity: vec2f,
};
@vertex fn vertexMain(@location(0) corner: vec2f,
  @location(1) position: vec3f, @location(2) tint: vec3f,
  @location(3) opacity: f32, @location(4) featureIndex: f32
) -> MirrorVertex {
  let current = riverMirror_getPosition(firefly_getPosition(position, featureIndex, firefly.time));
  let previous = riverMirror_getPosition(firefly_getPosition(position, featureIndex, motionBuffer.previousTime));
  let center = project_position_to_clipspace(current, vec3f(0.0), vec3f(0.0));
  let previousClip = project_position_to_clipspace(previous, vec3f(0.0), vec3f(0.0));
  let offset = corner * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize;
  var output: MirrorVertex;
  output.position = vec4f(center.xy + offset * center.w, center.z, center.w);
  output.coordinates = corner;
  output.tint = tint;
  output.opacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
  output.velocity = motionBuffer_getVelocity(center, previousClip);
  return output;
}
struct MirrorFragment {
  @location(0) color: vec4f,
  @builtin(frag_depth) depth: f32,
};
@fragment fn fragmentMain(input: MirrorVertex) -> MirrorFragment {
  // Intersect this pixel's camera ray with the real water plane. This clips the mirror to the river,
  // while writing the water depth lets foreground bridges and buildings occlude reflected sprites.
  let coordinate = input.position.xy / riverMirror.textureSize;
  let clipCoordinate = coordinate * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0);
  let nearPoint = riverMirror.inverseViewProjection * vec4f(clipCoordinate, 0.0, 1.0);
  let farPoint = riverMirror.inverseViewProjection * vec4f(clipCoordinate, 1.0, 1.0);
  let start = nearPoint.xyz / nearPoint.w;
  let direction = farPoint.xyz / farPoint.w - start;
  if (abs(direction.z) < 0.00001) { discard; }
  let distance = (riverMirror.surfaceHeight - start.z) / direction.z;
  if (distance < 0.0 || distance > 1.0) { discard; }
  let surface = start + direction * distance;
  if (any(surface.xy < riverMirror.surfaceBounds.xy) || any(surface.xy > riverMirror.surfaceBounds.zw)) { discard; }
  let surfaceClip = riverMirror.viewProjection * vec4f(surface, 1.0);
  var output: MirrorFragment;
  output.depth = clamp(surfaceClip.z / surfaceClip.w - 0.000001, 0.0, 1.0);
  if (motionBuffer.enabled != 0) {
    if (length(input.coordinates) > 0.35) { discard; }
    output.color = vec4f(input.velocity, 0.0, 1.0);
  } else {
    let commonPosition = project_position_to_clipspace_and_commonspace(surface, vec3f(0.0), vec3f(0.0)).commonPosition;
    let normal = riverWater_getNormal(commonPosition.xyz, surface, project_normal(vec3f(0.0, 0.0, 1.0)), surface.xy);
    let rippleOffset = normal.xy * 3.0;
    output.color = vec4f(pointGlow_getColor(input.coordinates + rippleOffset, input.tint) * input.opacity, 1.0);
  }
  return output;
}
`,Qe=`#version 300 es
in vec2 corner; in vec3 position; in vec3 tint; in float opacity; in float featureIndex;
out vec2 coordinates; out vec3 reflectionTint; out float reflectionOpacity;
void main() {
  vec3 reflected = firefly_getPosition(position, featureIndex, firefly.time);
  reflected.z = 2.0 * riverMirror.surfaceHeight - reflected.z;
  vec4 commonPosition;
  vec4 center = project_position_to_clipspace(reflected, vec3(0.0), vec3(0.0), commonPosition);
  vec2 offset = corner * glowPoint.radiusPixels * 2.0 * project.devicePixelRatio / project.viewportSize;
  gl_Position = vec4(center.xy + offset * center.w, center.z, center.w);
  coordinates = corner;
  reflectionTint = tint;
  reflectionOpacity = opacity * glowPoint.opacity * firefly_getBrightness(featureIndex, firefly.time);
}`,Je=`#version 300 es
precision highp float;
in vec2 coordinates; in vec3 reflectionTint; in float reflectionOpacity; out vec4 fragColor;
void main() {
  if (picking.isActive > 0.5) discard;
  vec2 coordinate = vec2(gl_FragCoord.x, riverMirror.textureSize.y - gl_FragCoord.y) / riverMirror.textureSize;
  vec2 clipCoordinate = coordinate * vec2(2.0, -2.0) + vec2(-1.0, 1.0);
  vec4 nearPoint = riverMirror.inverseViewProjection * vec4(clipCoordinate, 0.0, 1.0);
  vec4 farPoint = riverMirror.inverseViewProjection * vec4(clipCoordinate, 1.0, 1.0);
  vec3 start = nearPoint.xyz / nearPoint.w;
  vec3 direction = farPoint.xyz / farPoint.w - start;
  if (abs(direction.z) < 0.00001) discard;
  float distance = (riverMirror.surfaceHeight - start.z) / direction.z;
  if (distance < 0.0 || distance > 1.0) discard;
  vec3 surface = start + direction * distance;
  if (any(lessThan(surface.xy, riverMirror.surfaceBounds.xy)) || any(greaterThan(surface.xy, riverMirror.surfaceBounds.zw))) discard;
  vec4 surfaceClip = riverMirror.viewProjection * vec4(surface, 1.0);
  gl_FragDepth = clamp(surfaceClip.z / surfaceClip.w - 0.000001, 0.0, 1.0);
  vec3 normal = riverWater_getNormal(surface, surface, vec3(0.0, 0.0, 1.0), surface.xy);
  fragColor = vec4(pointGlow_getColor(coordinates + normal.xy * 3.0, reflectionTint) * reflectionOpacity, 1.0);
}`,E=[{id:"photinus-pyralis",label:"P. pyralis · yellow-green",color:[.85,1,.025]},{id:"genji-hotaru",label:"Hotaru · Genji",color:[.63,1,.015]},{id:"photuris-versicolor",label:"P. versicolor · green",color:[.4,1,.015]},{id:"photinus-scintillans",label:"P. scintillans · amber",color:[1,.8,.015]}];function et(s,e,n={}){const r={animate:!0,enabled:!0,bloom:e==="fireflies"||e==="hdr-night-lighting",bloomStrength:e==="fireflies"?1.1:.65,autoExposure:!0,exposure:e==="fireflies"?1.6:1,intensity:1,radius:e==="fireflies"?2.5:110,lamps:!0,speed:.6,radiance:e==="fireflies"?2:e==="hdr-night-lighting"?4:8,density:8e-4,reflections:!0,species:"photinus-pyralis",ripples:0,debugMode:0},o={frames:0,time:0,deltaTime:0,backend:"",highDynamicRange:!1,error:"",finalized:!1};let u,a;const d=new Promise((t,i)=>{u=t,a=i});let P=0,A=24,m,V=new Float32Array,j,w;const R={},b=we(),N=b.filter(t=>t.kind==="water"),g=N[0],Y=[g.center[0]-g.size[0]/2,g.center[1]-g.size[1]/2,g.center[0]+g.size[0]/2,g.center[1]+g.size[1]/2];if(e==="light-shafts"&&(b.find(t=>t.kind==="ground").size=[6e3,6e3,2]),e==="global-illumination"){let t=0;for(const i of b)i.kind==="building"&&(i.color=t%3===0?[.96,.12,.04]:t%3===1?[.04,.28,.96]:[.82,.87,.79],t++),i.kind==="ground"&&(i.color=[.58,.6,.58])}const y=[[-105,-200,18,1,.45,.08],[105,-120,18,.15,.5,1],[-105,140,18,1,.65,.18],[105,260,18,.1,.75,.55]];if(e==="fireflies"){y.length=0;for(let t=0;t<28;t++){const i=[-87,t*40-540,8];y.push([...i,1,.45,.08]),b.push({name:`West bank lamppost ${t+1}`,kind:"building",center:[i[0],i[1],0],size:[.7,.7,i[2]],color:[.25,.27,.28]})}}const q=e==="fireflies"?b.filter(t=>t.kind!=="water"):b,B=[-270,560,110],$={...Le,longitude:x[0],latitude:x[1],zoom:16,pitch:e==="light-shafts"?84:58,bearing:e==="light-shafts"?-48:-18},W=e==="light-shafts"?z($,s.clientWidth,s.clientHeight):$;let h=W;const L=new he({id:`${e}-capture`,motionVectors:!0,clearColor:[.004,.009,.022,1],getTime:()=>o.time,getLayerOptions:t=>t instanceof J||t instanceof Q?{mode:"opaque",surfaceBuffer:!0}:t instanceof C?{mode:"transparent",motionBuffer:!0}:null}),M=new je({id:`${e}-passes`,capture:L,coordinateOrigin:x,shaderPasses:[...e==="global-illumination"?[$e({resolutionScale:.5})]:[],...e==="light-shafts"?[He({resolutionScale:.5})]:[],...e==="fireflies"||e==="hdr-night-lighting"?[De({quality:"medium",radius:8,threshold:e==="fireflies"?.55:1,intensity:r.bloomStrength,downsample:"render",temporalStability:.65,temporalReprojection:!0})]:[],...e==="hdr-night-lighting"?[ke({initialExposure:1})]:[],_e,tt],getSceneOptions:ne}),Z=de(n),se=(n.device?.type??n.deviceType??"webgpu")==="webgpu"&&(e==="fireflies"||e==="hdr-night-lighting")&&window.matchMedia("(dynamic-range: high)").matches,v=new fe({parent:s,...Z,deviceProps:{...Z.deviceProps,createCanvasContext:se?{colorFormat:"rgba16float",colorSpace:"display-p3",toneMapping:"extended",alphaMode:"opaque"}:{alphaMode:"opaque"}},views:new me({id:"riverfront",controller:!0,...e==="light-shafts"?{fovy:Pe}:{}}),viewState:h,layers:[],effects:[],_animate:!0,onDeviceInitialized:t=>{o.backend=t.type,t.type==="webgpu"&&v.setProps({effects:[L,M]});const i=t instanceof Ve?t.canvasContext?.handle.getConfiguration():null;if(o.highDynamicRange=i?.format==="rgba16float"&&i.toneMapping?.mode==="extended",e==="fireflies"){w=t.createBuffer({id:"riverfront-lamppost-lights",data:new Float32Array(y.flatMap((f,_)=>[...f,1,_]))});const l=be(N),c=new Float32Array(l.length/10*3);for(let f=0;f<l.length/10;f++)c.set(l.subarray(f*10,f*10+3),f*3);j=t.createBuffer({id:"firefly-water-positions",data:c})}const p=[];if(e==="fireflies"){const l=E.find(c=>c.id===r.species)??E[0];for(let c=0;c<320;c++){const f=65+c*37%25,_=c*127%1e3-500;p.push(f,_,8+c*17%28,...l.color,1,c)}}else e==="hdr-night-lighting"?y.forEach((l,c)=>p.push(...l,1,c)):e==="light-shafts"&&p.push(...B,1,.78,.36,1,0);V=new Float32Array(p.length?p:[0,0,0,0,0,0,0,0]),m=t.createBuffer({id:`${e}-lights`,data:V}),e==="light-shafts"&&(R.pointLights=t.createBuffer({id:"shafts-empty-point-lights",byteLength:32,usage:G.STORAGE}),R.clusterLightCounts=t.createBuffer({id:"shafts-empty-cluster-counts",data:new Uint32Array([0]),usage:G.STORAGE}),R.clusterLightIndices=t.createBuffer({id:"shafts-empty-cluster-indices",data:new Uint32Array([0]),usage:G.STORAGE})),K()},onLoad:()=>u(),onBeforeRender:()=>{const t=performance.now();o.deltaTime=P?Math.min((t-P)/1e3,.1):0,r.animate&&(o.time+=o.deltaTime),P=t},onAfterRender:()=>{o.frames++,A=Math.max(0,A-1),v.setProps({_animate:r.animate||A>0})},onViewStateChange:({viewState:t})=>{h=e==="light-shafts"?z(t,s.clientWidth,s.clientHeight):t,v.setProps({viewState:h}),I()},onResize:({width:t,height:i})=>{e==="light-shafts"&&(h=z(h,t,i),v.setProps({viewState:h}),I())},onError:t=>{o.error||=t.message,a(t)},getTooltip:t=>t.object?.name??null});function K(){v.setProps({layers:[new J({id:"riverfront-city",features:q,data:q,pickable:!0,coordinateSystem:D.METER_OFFSETS,coordinateOrigin:x,roughness:.9,material:{ambient:1,diffuse:1},lighting:()=>({enabled:!0,useByteColors:!1,lights:e==="hdr-night-lighting"||e==="fireflies"?[...Se(22).lights.lights.filter(t=>t.type==="ambient"||(t.intensity??1)>0),...y.filter((t,i)=>e!=="fireflies"||i%9===0).map(t=>({type:"point",position:[t[0],t[1],t[2]],color:[t[3],t[4],t[5]],intensity:(e!=="fireflies"||r.lamps?r.radiance:0)*(e==="fireflies"?2:4),attenuation:[1,0,.001]}))]:[{type:"ambient",color:[.38,.48,.65],intensity:.22},{type:"directional",color:[1,.86,.68],intensity:1.8,direction:[.6,-.3,-.8]}]})}),j&&e==="fireflies"?new Q({id:"firefly-river-water",positions:j,vertexCount:6,coordinateOrigin:x,style:"river",flowDirection:[0,1],time:()=>o.time,material:{baseColor:[.02,.08,.12],fresnelColor:[.07,.16,.2],skyZenithColor:[.02,.04,.08],skyUpDirection:[0,0,1],normalStrength:r.ripples,waveASpeed:1.1,waveBSpeed:-.7,specularIntensity:.025,opacity:1}}):null,w&&r.lamps&&e==="fireflies"&&r.reflections?new oe({id:"riverfront-lamppost-reflections",points:w,pointCount:y.length,coordinateSystem:D.METER_OFFSETS,coordinateOrigin:x,animation:{enabled:0},radiusPixels:8,opacity:.5,surfaceHeight:g.center[2],surfaceBounds:Y,surfaceRipples:r.ripples,style:{coreRadius:0,coreIntensity:r.radiance,haloIntensity:r.radiance,falloff:7}}):null,w&&e==="fireflies"?new C({id:"riverfront-lamppost-lights",points:w,pointCount:y.length,coordinateSystem:D.METER_OFFSETS,coordinateOrigin:x,visible:r.lamps,radiusPixels:8,style:{coreRadius:0,coreIntensity:r.radiance,haloIntensity:r.radiance,falloff:7}}):null,m&&e==="fireflies"&&r.enabled&&r.reflections?new oe({id:"riverfront-firefly-reflections",points:m,pointCount:320,coordinateSystem:D.METER_OFFSETS,coordinateOrigin:x,time:()=>o.time,animation:{enabled:1,speed:r.speed},radiusPixels:r.radius,opacity:.55,surfaceHeight:g.center[2],surfaceBounds:Y,surfaceRipples:r.ripples,style:{coreRadius:.05,coreIntensity:.8,haloIntensity:4*r.intensity,falloff:8}}):null,m&&e==="fireflies"?new F({id:"riverfront-fireflies",points:m,pointCount:320,coordinateSystem:D.METER_OFFSETS,coordinateOrigin:x,time:()=>o.time,animation:{enabled:r.enabled?1:0,speed:r.speed},visible:r.enabled,radiusPixels:r.radius,style:{coreRadius:.05,coreIntensity:.8,haloIntensity:4*r.intensity,falloff:8}}):null,m&&(e==="hdr-night-lighting"||e==="light-shafts")?new C({id:"riverfront-light-emitters",points:m,pointCount:e==="hdr-night-lighting"?4:1,coordinateSystem:D.METER_OFFSETS,coordinateOrigin:x,radiusPixels:e==="hdr-night-lighting"?12:35,style:{coreRadius:e==="hdr-night-lighting"?0:.35,coreIntensity:r.radiance,haloIntensity:r.radiance,falloff:7}}):null]})}function ne({frame:t,camera:i}){const p=new T(i.projectionMatrix).multiplyRight(i.viewMatrix).transform([...B,1]),l=p[3]>0?[p[0]/p[3]*.5+.5,.5-p[1]/p[3]*.5]:[-1,-1],c=l.every(_=>_>=0&&_<=1),f=t.previousViewProjectionMatrix?new T([1,0,0,0,0,1,0,0,0,0,.5,0,0,0,.5,1]).multiplyRight(t.previousViewProjectionMatrix):i.viewProjectionMatrix;return{bindings:R,uniforms:{bloomComposite:{intensity:r.bloom?r.bloomStrength:0},hdrAutoExposureAdapt:{enabled:r.autoExposure?1:0,deltaTime:o.deltaTime,minimumExposure:.35,maximumExposure:4},hdrAutoExposureApply:{enabled:r.autoExposure?1:0},toneMapping:{exposure:r.exposure,maximumLuminance:o.highDynamicRange?3:1},ssgiTrace:{projectionMatrix:i.projectionMatrix,inverseProjectionMatrix:i.inverseProjectionMatrix,radius:r.radius,thickness:3,intensity:r.enabled?1.8*r.intensity:0,rayCount:12,stepCount:12,frameIndex:t.frameIndex},ssgiTemporal:{inverseProjectionMatrix:i.inverseProjectionMatrix,historyWeight:.9,depthThreshold:.02},ssgiComposite:{strength:1,debugMode:0},clusteredVolumetricTrace:{projectionMatrix:i.projectionMatrix,inverseProjectionMatrix:i.inverseProjectionMatrix,inverseViewMatrix:i.inverseViewMatrix,density:r.enabled?r.density:0,heightFalloff:0,directionalLightDirectionView:new T(i.viewMatrix).transform([...B,1]).slice(0,3),directionalLightColor:[1,.8,.45],directionalIntensity:r.radiance/4,pointLightIntensity:0,godRayIntensity:c?r.intensity*8:0,godRaySourceRadius:.045,anisotropy:.2,godRayPosition:l,godRaysOnly:1,maxDistance:850,sampleCount:10,godRaySampleCount:24,clusterNearPlane:i.nearPlane,clusterFarPlane:i.farPlane},clusteredVolumetricTemporal:{inverseProjectionMatrix:i.inverseProjectionMatrix,inverseViewProjectionMatrix:i.inverseViewProjectionMatrix,previousViewProjectionMatrix:f,historyWeight:.8},clusteredVolumetricDepthHistoryCopy:{inverseProjectionMatrix:i.inverseProjectionMatrix},clusteredVolumetricComposite:{strength:1},bufferInspection:{mode:r.debugMode,inverseProjectionMatrix:i.inverseProjectionMatrix}}}}function I(){A=24,v.setProps({_animate:!0}),v.redraw("Riverfront lighting controls")}return{deck:v,capture:L,effect:M,settings:r,diagnostics:o,ready:d,kind:e,setSetting(t,i){if(Object.assign(r,{[t]:i}),t==="species"&&e==="fireflies"&&m){const p=E.find(l=>l.id===r.species)??E[0];for(let l=0;l<V.length;l+=8)V.set(p.color,l+3);m.write(V)}t!=="debugMode"&&t!=="animate"&&(L.resetHistory(),M.resetHistory()),(t==="lamps"||t==="radius"||t==="radiance"||t==="intensity"||t==="speed"||t==="enabled"||t==="reflections"||t==="ripples")&&K(),I()},center(){L.resetHistory(),M.resetHistory(),h=e==="light-shafts"?z(W,s.clientWidth,s.clientHeight):{...W},v.setProps({viewState:h}),I()},setTime(t){o.time=t,L.resetHistory(),M.resetHistory(),I()},finalize(){if(!o.finalized){o.finalized=!0,v.finalize(),m?.destroy(),j?.destroy(),w?.destroy();for(const t of Object.values(R))t.destroy()}}}}const tt={name:"bufferInspection",source:`struct BufferInspectionUniforms {mode: i32, inverseProjectionMatrix: mat4x4f};
  @group(0) @binding(auto) var<uniform> bufferInspection: BufferInspectionUniforms;
  @group(0) @binding(auto) var depthTexture: texture_depth_2d;
  @group(0) @binding(auto) var normalTexture: texture_2d<f32>;
  @group(0) @binding(auto) var velocityTexture: texture_2d<f32>;
  fn bufferInspection_sampleColor(sourceTexture: texture_2d<f32>, sourceTextureSampler: sampler, textureSize: vec2f, coordinate: vec2f) -> vec4f {
    if (bufferInspection.mode == 0) { return textureSampleLevel(sourceTexture, sourceTextureSampler, coordinate, 0); }
    let pixel = clamp(vec2i(coordinate * vec2f(textureDimensions(depthTexture))), vec2i(0), vec2i(textureDimensions(depthTexture)) - vec2i(1));
    let depth = textureLoad(depthTexture, pixel, 0);
    if (bufferInspection.mode == 1) { return vec4f(textureLoad(normalTexture, pixel, 0).rgb, 1.0); }
    if (bufferInspection.mode == 2) {
      let clip = vec4f(coordinate * vec2f(2.0, -2.0) + vec2f(-1.0, 1.0), depth, 1.0);
      let view = bufferInspection.inverseProjectionMatrix * clip;
      return vec4f(vec3f(select(exp(-abs(view.z / view.w) / 700.0), 0.0, depth >= 0.99999)), 1.0);
    }
    let velocity = textureLoad(velocityTexture, pixel, 0).xy;
    return vec4f(0.5 + velocity * 12.0, length(velocity) * 30.0, 1.0);
  }`,uniformTypes:{mode:"i32",inverseProjectionMatrix:"mat4x4<f32>"},propTypes:{mode:{value:0},inverseProjectionMatrix:{value:[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],private:!0}},bindingLayout:[{name:"depthTexture",group:0},{name:"normalTexture",group:0},{name:"velocityTexture",group:0}],passes:[{sampler:!0}]};async function vt(s){const e=document.querySelector("#backend"),n=s==="fireflies"?await ge(new URLSearchParams(location.search).get("backend")):"webgpu";e.value=n,e.addEventListener("change",()=>{location.search=`?backend=${e.value}`});const r=et(document.querySelector("#scene"),s,{deviceType:n});window.riverfrontLighting=r;const o=document.querySelector("#status");document.querySelector("#center").addEventListener("click",()=>r.center());for(const a of["animate","enabled","lamps","bloom","autoExposure","reflections"])document.querySelector(`#${a}`)?.addEventListener("change",d=>{const P=d.currentTarget;P instanceof HTMLInputElement&&r.setSetting(a,P.checked)});for(const a of["intensity","exposure","radius","speed","radiance","density","bloomStrength","ripples"]){const d=document.querySelector(`#${a}`);d&&(d.value=String(r.settings[a]),d.addEventListener("input",()=>r.setSetting(a,Number(d.value))))}const u=document.querySelector("#species");if(u){for(const a of E)u.add(new Option(a.label,a.id));u.value=r.settings.species,u.addEventListener("change",()=>r.setSetting("species",u.value))}document.querySelector("#buffer-view").addEventListener("change",a=>{a.currentTarget instanceof HTMLSelectElement&&r.setSetting("debugMode",Number(a.currentTarget.value))}),r.ready.then(()=>{if(r.diagnostics.backend==="webgl")for(const a of["#bloom","#bloomStrength","#exposure","#buffer-view"]){const d=document.querySelector(a);d&&(d.disabled=!0)}o.value=r.diagnostics.backend==="webgl"?"WebGL2 · additive lights and water mirrors":`${r.diagnostics.highDynamicRange?"HDR display output":"SDR display output"} · shared depth, normals and motion`,document.body.dataset.ready="true"}).catch(a=>{o.value=a instanceof Error?a.message:String(a),document.body.dataset.ready="error"}),window.addEventListener("pagehide",()=>r.finalize())}export{vt as s};
