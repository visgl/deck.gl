import{L as X,M as W,p as K,e as a,B as V,T as y,b as J,h as Q,j as Z,c as ee,r as te}from"./deck-example-device-TQPRJnZ6.js";import{i as ie}from"./example-support-KHcxfZf7.js";import{p as oe}from"./project32-Byi-VnKS.js";import{m as re,C as L}from"./river-district-data-C9FvyLLC.js";import{R as ne}from"./riverfront-view-CB3JCqMN.js";import{R as se}from"./river-district-layer-DuhH2l43.js";import"./meter-offset-position-CMR-ehQ5.js";import"./lambert-material-DjV_YOPi.js";const ae={name:"flowStreak",source:`struct FlowStreakUniforms { bounds: vec4<f32>, boundsLow: vec4<f32>, appearance: vec4<f32>, color: vec4<f32> };
  @group(3) @binding(0) var<uniform> flowStreak: FlowStreakUniforms;
  @group(3) @binding(1) var flowState: texture_2d<f32>;
  @group(3) @binding(2) var flowPreviousState: texture_2d<f32>;`,vs:`layout(std140) uniform flowStreakUniforms { vec4 bounds;
  vec4 boundsLow;
  vec4 appearance;
  vec4 color; } flowStreak;
  uniform highp sampler2D flowState; uniform highp sampler2D flowPreviousState;`,fs:`layout(std140) uniform flowStreakUniforms { vec4 bounds;
  vec4 boundsLow;
  vec4 appearance;
  vec4 color; } flowStreak;`,bindingLayout:[{name:"flowStreak",group:3},{name:"flowState",group:3,visibility:1},{name:"flowPreviousState",group:3,visibility:1}],uniformTypes:{bounds:"vec4<f32>",boundsLow:"vec4<f32>",appearance:"vec4<f32>",color:"vec4<f32>"},defaultUniforms:{bounds:[0,0,1,1],boundsLow:[0,0,0,0],appearance:[1.5,1,1,1],color:[.4,.9,1,.9]}},le=`struct FlowVertex {
  @builtin(position) position: vec4<f32>,
  @location(0) @interpolate(flat) pickingColor: vec3<f32>,
  @location(1) coordinates: vec2<f32>,
  @location(2) visible: f32,
};
fn projectParticle(position: vec2<f32>) -> vec4<f32> {
  let delta = position * flowStreak.bounds.zw;
  let high = flowStreak.bounds.xy + delta;
  let virtualDelta = high - flowStreak.bounds.xy;
  let low = (flowStreak.bounds.xy - (high - virtualDelta)) + (delta - virtualDelta)
    + flowStreak.boundsLow.xy + position * flowStreak.boundsLow.zw;
  return project_position_to_clipspace(vec3<f32>(high, flowStreak.appearance.z), vec3<f32>(low, 0.0), vec3<f32>(0.0));
}
@vertex fn vertexMain(@location(0) corner: vec2<f32>, @builtin(instance_index) identifier: u32) -> FlowVertex {
  let dimensions = textureDimensions(flowState);
  let coordinates = vec2<i32>(i32(identifier % dimensions.x), i32(identifier / dimensions.x));
  let particle = textureLoad(flowState, coordinates, 0);
  let previous = textureLoad(flowPreviousState, coordinates, 0);
  let currentClip = projectParticle(particle.xy);
  let previousClip = projectParticle(previous.xy);
  let currentScreen = currentClip.xy / max(currentClip.w, 0.00001);
  let sameParticle = particle.w == previous.w && previous.z >= 0.0 && previousClip.w > 0.0;
  // Project the tail on the particle plane so the river cannot hide it at oblique angles.
  let tailClip = projectParticle(select(particle.xy, mix(particle.xy, previous.xy, flowStreak.appearance.y), sameParticle));
  let tailScreen = tailClip.xy / max(tailClip.w, 0.00001);
  let motion = (currentScreen - tailScreen) * project.viewportSize * 0.5;
  let distance = length(motion);
  let direction = select(vec2<f32>(0.0, 1.0), motion / max(distance, 0.00001), distance > 0.00001);
  let width = max(flowStreak.appearance.x, 0.0) * project.devicePixelRatio;
  let centerClip = mix(tailClip, currentClip, corner.x);
  let offset = direction * (width * 0.5 - (1.0 - corner.x) * max(0.0, width - distance)) + vec2<f32>(-direction.y, direction.x) * corner.y * width * 0.5;
  var output: FlowVertex;
  output.position = vec4<f32>(centerClip.xy + offset * 2.0 / project.viewportSize * centerClip.w, centerClip.zw);
  output.coordinates = corner;
  output.visible = select(0.0, 1.0, particle.z >= 0.0 && currentClip.w > 0.0 && width > 0.0);
  output.pickingColor = picking_getPickingColorFromIndex(identifier);
  return output;
}
@fragment fn fragmentMain(input: FlowVertex) -> @location(0) vec4<f32> {
  if (input.visible < 0.5) { discard; }
  if (picking.isActive > 0.5) { return vec4<f32>(input.pickingColor, 1.0); }
  let coverage = 1.0 - smoothstep(0.6, 1.0, abs(input.coordinates.y));
  var color = flowStreak.color.rgb;
  if (picking.isHighlightActive > 0.5 && distance(input.pickingColor, picking_normalizeColor(picking.highlightedObjectColor)) < 0.00001) {
    color = mix(color, picking.highlightColor.rgb, picking.highlightColor.a);
  }
  return vec4<f32>(color, flowStreak.color.a * flowStreak.appearance.w * coverage * mix(0.25, 1.0, input.coordinates.x));
}
`,ce=`#version 300 es
in vec2 corner;
out vec2 coordinates;
out float visible;
vec4 projectParticle(vec2 position) {
  vec2 delta = position * flowStreak.bounds.zw;
  vec2 high = flowStreak.bounds.xy + delta;
  vec2 virtualDelta = high - flowStreak.bounds.xy;
  vec2 low = (flowStreak.bounds.xy - (high - virtualDelta)) + (delta - virtualDelta)
    + flowStreak.boundsLow.xy + position * flowStreak.boundsLow.zw;
  return project_position_to_clipspace(vec3(high, flowStreak.appearance.z), vec3(low, 0.0), vec3(0.0));
}
void main() {
  ivec2 dimensions = textureSize(flowState, 0);
  ivec2 texel = ivec2(gl_InstanceID % dimensions.x, gl_InstanceID / dimensions.x);
  vec4 particle = texelFetch(flowState, texel, 0);
  vec4 previous = texelFetch(flowPreviousState, texel, 0);
  vec4 currentClip = projectParticle(particle.xy);
  vec4 previousClip = projectParticle(previous.xy);
  vec2 currentScreen = currentClip.xy / max(currentClip.w, 0.00001);
  bool sameParticle = particle.w == previous.w && previous.z >= 0.0 && previousClip.w > 0.0;
  // Project the tail on the particle plane so the river cannot hide it at oblique angles.
  vec4 tailClip = projectParticle(sameParticle ? mix(particle.xy, previous.xy, flowStreak.appearance.y) : particle.xy);
  vec2 tailScreen = tailClip.xy / max(tailClip.w, 0.00001);
  vec2 motion = (currentScreen - tailScreen) * project.viewportSize * 0.5;
  float distance = length(motion);
  vec2 direction = distance > 0.00001 ? motion / distance : vec2(0.0, 1.0);
  float width = max(flowStreak.appearance.x, 0.0) * project.devicePixelRatio;
  vec4 centerClip = mix(tailClip, currentClip, corner.x);
  vec2 offset = direction * (width * 0.5 - (1.0 - corner.x) * max(0.0, width - distance)) + vec2(-direction.y, direction.x) * corner.y * width * 0.5;
  gl_Position = vec4(centerClip.xy + offset * 2.0 / project.viewportSize * centerClip.w, centerClip.zw);
  coordinates = corner;
  visible = particle.z >= 0.0 && currentClip.w > 0.0 && width > 0.0 ? 1.0 : 0.0;
  geometry.pickingColor = picking_getPickingColorFromIndex(float(gl_InstanceID));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  vec4 color = vec4(1.0);
  DECKGL_FILTER_COLOR(color, geometry);
}
`,ue=`#version 300 es
precision highp float;
in vec2 coordinates;
in float visible;
out vec4 fragmentColor;
void main() {
  if (visible < 0.5) discard;
  float coverage = 1.0 - smoothstep(0.6, 1.0, abs(coordinates.y));
  fragmentColor = vec4(flowStreak.color.rgb, flowStreak.color.a * flowStreak.appearance.w * coverage * mix(0.25, 1.0, coordinates.x));
  DECKGL_FILTER_COLOR(fragmentColor, geometry);
}
`,A={depthCompare:"less-equal",depthWriteEnabled:!1,cullMode:"none",blend:!0,blendColorOperation:"add",blendAlphaOperation:"add",blendColorSrcFactor:"src-alpha",blendColorDstFactor:"one-minus-src-alpha",blendAlphaSrcFactor:"one",blendAlphaDstFactor:"one-minus-src-alpha"},k=class k extends X{getAttributeManager(){return null}getNumInstances(){return this.props.particleCount}initializeState({device:e}){const t=this.getParticles(),r=e.createBuffer({data:new Float32Array([0,-1,1,-1,0,1,0,1,1,-1,1,1])});try{const o=new W(e,{...this.getShaders({source:le,vs:ce,fs:ue,modules:[oe,K,ae]}),shaderLayout:{attributes:[],bindings:[{name:"flowState",type:"texture",group:3,location:1,sampleType:"unfilterable-float"},{name:"flowPreviousState",type:"texture",group:3,location:2,sampleType:"unfilterable-float"}]},id:this.id,topology:"triangle-list",vertexCount:6,isInstanced:!0,instanceCount:this.props.particleCount,bufferLayout:[{name:"corner",format:"float32x2"}],attributes:{corner:r},bindings:{flowState:t.texture,flowPreviousState:t.previousTexture},parameters:A});this.setState({model:o,corners:r})}catch(o){throw r.destroy(),o}}updateState({props:e}){const t=this.getParticles();a(Number.isInteger(e.particleCount)&&e.particleCount>=0&&e.particleCount<=t.texture.width*t.texture.height),this.state.model.setInstanceCount(e.particleCount),this.state.model.setBindings({flowState:t.texture,flowPreviousState:t.previousTexture})}getModels(){return this.state.model?[this.state.model]:[]}draw({renderPass:e}){const t=this.getParticles();this.state.model.setBindings({flowState:t.texture,flowPreviousState:t.previousTexture});const r=[this.props.bounds[0],this.props.bounds[1],this.props.bounds[2]-this.props.bounds[0],this.props.bounds[3]-this.props.bounds[1]];this.state.model.shaderInputs.setProps({flowStreak:{bounds:r.map(Math.fround),boundsLow:r.map(o=>o-Math.fround(o)),appearance:[this.props.widthPixels,Math.min(600,this.props.trailSeconds/Math.max(t.stateDeltaTime,1/600)),this.props.altitude,this.props.opacity],color:this.props.color}}),this.state.model.draw(e)}getParticles(){return typeof this.props.particles=="function"?this.props.particles():this.props.particles}getPickingInfo({info:e}){return e.object=e.index>=0?{id:e.index}:null,e}finalizeState(e){this.state.model?.destroy(),this.state.corners?.destroy(),super.finalizeState(e)}};k.layerName="FlowParticleLayer",k.defaultProps={getPolygonOffset:()=>[0,0],widthPixels:{type:"number",value:1.5,min:0},trailSeconds:{type:"number",value:1,min:0},altitude:{type:"number",value:1},color:[.4,.9,1,.9],parameters:A};let z=k;function N(n,e){return a(e.texture.device===n&&!e.texture.destroyed&&e.texture.format==="rgba32float"),a(e.texture.width>=2&&e.texture.height>=2),$(e),{...e,bounds:[...e.bounds]}}function $(n){const[e,t,r,o]=n.bounds;a(n.bounds.every(Number.isFinite)&&r>e&&o>t),a(n.coordinates==="cartesian"||n.coordinates==="lnglat"),a(n.coordinates!=="lnglat"||t>=-85&&o<=85&&r-e<=360)}const de=`struct FlowUniforms {
  bounds: vec4<f32>,
  parameters: vec4<f32>,
  epoch: vec4<f32>,
};
@group(0) @binding(0) var<uniform> flowUniforms: FlowUniforms;
@group(0) @binding(1) var particleTexture: texture_2d<f32>;
@group(0) @binding(2) var velocityTexture: texture_2d<f32>;

fn hashNumber(input: u32) -> f32 {
  var value = input;
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  return f32((value ^ (value >> 16u)) >> 8u) / 16777216.0;
}
fn outsideBounds(position: vec2<f32>) -> bool {
  return any(position < vec2<f32>(0.0)) || any(position > vec2<f32>(1.0));
}
fn sampleVelocity(position: vec2<f32>) -> vec3<f32> {
  if (outsideBounds(position)) { return vec3<f32>(0.0); }
  let dimensions = vec2<i32>(textureDimensions(velocityTexture));
  let gridPosition = position * vec2<f32>(dimensions - vec2<i32>(1));
  let lower = vec2<i32>(floor(gridPosition));
  let upper = min(lower + vec2<i32>(1), dimensions - vec2<i32>(1));
  let fraction = fract(gridPosition);
  let lowerLeft = textureLoad(velocityTexture, lower, 0);
  let lowerRight = textureLoad(velocityTexture, vec2<i32>(upper.x, lower.y), 0);
  let upperLeft = textureLoad(velocityTexture, vec2<i32>(lower.x, upper.y), 0);
  let upperRight = textureLoad(velocityTexture, upper, 0);
  // Conservative mask: do not interpolate across a missing-data cell.
  if (min(min(lowerLeft.z, lowerRight.z), min(upperLeft.z, upperRight.z)) < 0.5) {
    return vec3<f32>(0.0);
  }
  let velocity = mix(mix(lowerLeft.xy, lowerRight.xy, fraction.x),
    mix(upperLeft.xy, upperRight.xy, fraction.x), fraction.y);
  var unitsPerSecond = velocity;
  if (flowUniforms.epoch.w > 0.5) {
    let latitude = flowUniforms.bounds.y + flowUniforms.bounds.w * position.y;
    unitsPerSecond = velocity / (111195.08 * vec2<f32>(cos(radians(latitude)), 1.0));
  }
  return vec3<f32>(unitsPerSecond / flowUniforms.bounds.zw, 1.0);
}
fn spawnParticle(identifier: u32, iteration: u32, generation: f32) -> vec4<f32> {
  let seed = identifier * 747796405u + u32(flowUniforms.epoch.z) +
    u32(flowUniforms.epoch.y) * 2891336453u + iteration * 277803737u;
  let position = vec2<f32>(hashNumber(seed), hashNumber(seed + 1013904223u));
  let valid = sampleVelocity(position).z > 0.5;
  return vec4<f32>(position, select(-1.0, select(0.0, hashNumber(seed + 12345u) * flowUniforms.parameters.z, generation == 0.0), valid), (generation + 1.0) % 65536.0);
}
@vertex
fn vertexMain(@builtin(vertex_index) index: u32) -> @builtin(position) vec4<f32> {
  let position = vec2<f32>(f32((index << 1u) & 2u), f32(index & 2u));
  return vec4<f32>(position * 2.0 - 1.0, 0.0, 1.0);
}
@fragment
fn fragmentMain(@builtin(position) fragmentPosition: vec4<f32>) -> @location(0) vec4<f32> {
  let coordinates = vec2<i32>(fragmentPosition.xy);
  let identifier = u32(coordinates.y) * u32(flowUniforms.epoch.x) + u32(coordinates.x);
  if (identifier >= u32(flowUniforms.parameters.x)) { return vec4<f32>(0.0, 0.0, -1.0, 0.0); }
  var particle = textureLoad(particleTexture, coordinates, 0);
  for (var iteration = 0u; iteration < 8u; iteration++) {
    if (iteration >= u32(flowUniforms.parameters.w)) { break; }
    let firstVelocity = sampleVelocity(particle.xy);
    let midpoint = particle.xy + firstVelocity.xy * flowUniforms.parameters.y * 0.5;
    let midpointVelocity = sampleVelocity(midpoint);
    let destination = particle.xy + midpointVelocity.xy * flowUniforms.parameters.y;
    if (particle.z < 0.0 || particle.z + flowUniforms.parameters.y >= flowUniforms.parameters.z ||
        firstVelocity.z < 0.5 || midpointVelocity.z < 0.5 || sampleVelocity(destination).z < 0.5) {
      particle = spawnParticle(identifier, iteration, particle.w);
    } else {
      particle = vec4<f32>(destination, particle.z + flowUniforms.parameters.y, particle.w);
    }
  }
  return particle;
}
`,pe=`#version 300 es
precision highp float;
precision highp int;
uniform flowUniforms {
  vec4 bounds;
  vec4 parameters;
  vec4 epoch;
} flow;
uniform highp sampler2D particleTexture;
uniform highp sampler2D velocityTexture;
out vec4 fragmentColor;

float hashNumber(uint inputValue) {
  uint value = inputValue;
  value = (value ^ (value >> 16u)) * 2246822519u;
  value = (value ^ (value >> 13u)) * 3266489917u;
  return float((value ^ (value >> 16u)) >> 8u) / 16777216.0;
}
bool outsideBounds(vec2 position) {
  return any(lessThan(position, vec2(0.0))) || any(greaterThan(position, vec2(1.0)));
}
vec3 sampleVelocity(vec2 position) {
  if (outsideBounds(position)) { return vec3(0.0); }
  ivec2 dimensions = textureSize(velocityTexture, 0);
  vec2 gridPosition = position * vec2(dimensions - ivec2(1));
  ivec2 lower = ivec2(floor(gridPosition));
  ivec2 upper = min(lower + ivec2(1), dimensions - ivec2(1));
  vec2 fraction = fract(gridPosition);
  vec4 lowerLeft = texelFetch(velocityTexture, lower, 0);
  vec4 lowerRight = texelFetch(velocityTexture, ivec2(upper.x, lower.y), 0);
  vec4 upperLeft = texelFetch(velocityTexture, ivec2(lower.x, upper.y), 0);
  vec4 upperRight = texelFetch(velocityTexture, upper, 0);
  if (min(min(lowerLeft.z, lowerRight.z), min(upperLeft.z, upperRight.z)) < 0.5) {
    return vec3(0.0);
  }
  vec2 velocity = mix(mix(lowerLeft.xy, lowerRight.xy, fraction.x),
    mix(upperLeft.xy, upperRight.xy, fraction.x), fraction.y);
  vec2 unitsPerSecond = velocity;
  if (flow.epoch.w > 0.5) {
    float latitude = flow.bounds.y + flow.bounds.w * position.y;
    unitsPerSecond = velocity / (111195.08 * vec2(cos(radians(latitude)), 1.0));
  }
  return vec3(unitsPerSecond / flow.bounds.zw, 1.0);
}
vec4 spawnParticle(uint identifier, uint iteration, float generation) {
  uint seed = identifier * 747796405u + uint(flow.epoch.z) +
    uint(flow.epoch.y) * 2891336453u + iteration * 277803737u;
  vec2 position = vec2(hashNumber(seed), hashNumber(seed + 1013904223u));
  bool valid = sampleVelocity(position).z > 0.5;
  return vec4(position, valid ? (generation == 0.0 ? hashNumber(seed + 12345u) * flow.parameters.z : 0.0) : -1.0, mod(generation + 1.0, 65536.0));
}
void main() {
  ivec2 coordinates = ivec2(gl_FragCoord.xy);
  uint identifier = uint(coordinates.y) * uint(flow.epoch.x) + uint(coordinates.x);
  if (identifier >= uint(flow.parameters.x)) { fragmentColor = vec4(0.0, 0.0, -1.0, 0.0); return; }
  vec4 particle = texelFetch(particleTexture, coordinates, 0);
  for (uint iteration = 0u; iteration < 8u; iteration++) {
    if (iteration >= uint(flow.parameters.w)) { break; }
    vec3 firstVelocity = sampleVelocity(particle.xy);
    vec2 midpoint = particle.xy + firstVelocity.xy * flow.parameters.y * 0.5;
    vec3 midpointVelocity = sampleVelocity(midpoint);
    vec2 destination = particle.xy + midpointVelocity.xy * flow.parameters.y;
    if (particle.z < 0.0 || particle.z + flow.parameters.y >= flow.parameters.z ||
        firstVelocity.z < 0.5 || midpointVelocity.z < 0.5 || sampleVelocity(destination).z < 0.5) {
      particle = spawnParticle(identifier, iteration, particle.w);
    } else {
      particle = vec4(destination, particle.z + flow.parameters.y, particle.w);
    }
  }
  fragmentColor = particle;
}
`,fe=`#version 300 es
void main() {
  vec2 position = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2));
  gl_Position = vec4(position * 2.0 - 1.0, 0.0, 1.0);
}
`,he=1048576,U=1/30;function me(n){return(n.type==="webgl"||n.type==="webgpu")&&n.isTextureFormatRenderable("rgba32float")}class ve{device;particleCount;width;height;byteLength;lifetime;seed;field;textures=[];framebuffers=[];uniforms;model;current=0;previous=0;stateDeltaTime=0;frame=0;destroyed=!1;constructor(e,t){this.device=e,this.particleCount=t.particleCount??16384,this.lifetime=t.lifetime??60,this.seed=t.seed??1,a(me(e)),a(Number.isInteger(this.particleCount)&&this.particleCount>0&&this.particleCount<=he),a(Number.isFinite(this.lifetime)&&this.lifetime>0),a(Number.isInteger(this.seed)&&this.seed>=0&&this.seed<=16777215),this.field=N(e,t.field),this.width=Math.min(1024,Math.ceil(Math.sqrt(this.particleCount))),this.height=Math.ceil(this.particleCount/this.width),this.byteLength=this.width*this.height*16*2;const r=t.id??"flow-particles";this.uniforms=e.createBuffer({id:`${r}-uniforms`,byteLength:48,usage:V.UNIFORM|V.COPY_DST});try{for(let o=0;o<2;o++){const s=e.createTexture({id:`${r}-state-${o}`,width:this.width,height:this.height,format:"rgba32float",usage:y.SAMPLE|y.RENDER|y.COPY_SRC|y.COPY_DST,sampler:{minFilter:"nearest",magFilter:"nearest"}});this.textures.push(s),this.framebuffers.push(e.createFramebuffer({id:`${r}-target-${o}`,width:this.width,height:this.height,colorAttachments:[s]}))}this.model=new W(e,{id:r,source:de,vs:fe,fs:pe,topology:"triangle-list",vertexCount:3,shaderLayout:{attributes:[],bindings:[{name:"flowUniforms",type:"uniform",group:0,location:0},{name:"particleTexture",type:"texture",group:0,location:1,sampleType:"unfilterable-float"},{name:"velocityTexture",type:"texture",group:0,location:2,sampleType:"unfilterable-float"}]},parameters:{blend:!1},bindings:{flowUniforms:this.uniforms,particleTexture:this.textures[0],velocityTexture:this.field.texture}}),this.reset()}catch(o){this.uniforms.destroy();for(const s of this.framebuffers)s.destroy();for(const s of this.textures)s.destroy();throw o}}setField(e){a(!this.destroyed);const t=N(this.device,e),r=t.coordinates!==this.field.coordinates||t.bounds.some((o,s)=>o!==this.field.bounds[s]);this.field=t,r&&this.reset()}reset(){a(!this.destroyed);const e=new Float32Array(this.width*this.height*4);for(let t=0;t<this.width*this.height;t++)e[t*4+2]=-1;for(const t of this.textures)t.writeData(e);this.current=0,this.previous=0,this.stateDeltaTime=0,this.frame=0}step(e){a(!this.destroyed),a(Number.isFinite(e)&&e>=0);const t=Math.min(e,U*8),r=Math.ceil(t/U),o=this.textures[this.current];if(r>0){this.uniforms.write(new Float32Array([this.field.bounds[0],this.field.bounds[1],this.field.bounds[2]-this.field.bounds[0],this.field.bounds[3]-this.field.bounds[1],this.particleCount,t/r,this.lifetime,r,this.width,this.frame,this.seed,this.field.coordinates==="lnglat"?1:0])),this.model.setBindings({particleTexture:o,velocityTexture:this.field.texture});const s=this.device.createCommandEncoder();this.model.predraw(s);const f=1-this.current,u=s.beginRenderPass({framebuffer:this.framebuffers[f],clearColor:!1,clearDepth:!1});this.model.draw(u),u.end(),this.device.submit(s.finish()),this.previous=this.current,this.current=f,this.stateDeltaTime=t,this.frame=(this.frame+1)%65536}return{texture:this.textures[this.current],previousTexture:this.textures[this.previous],stateDeltaTime:this.stateDeltaTime,advancedTime:t,droppedTime:e-t,substeps:r}}destroy(){if(!this.destroyed){this.destroyed=!0,this.model.destroy(),this.uniforms.destroy();for(const e of this.framebuffers)e.destroy();for(const e of this.textures)e.destroy()}}}const we=4194304;class xe{texture;field;tileSize;tileCount;byteLength;emptyTile;constructor(e,t){$(t),a(t.tileSize.every(s=>Number.isSafeInteger(s)&&s>=2)),a(t.tileCount.every(s=>Number.isSafeInteger(s)&&s>=1));const r=t.tileSize[0]*t.tileCount[0],o=t.tileSize[1]*t.tileCount[1];a(r*o<=we),a(r<=e.limits.maxTextureDimension2D&&o<=e.limits.maxTextureDimension2D),this.tileSize=[...t.tileSize],this.tileCount=[...t.tileCount],this.byteLength=r*o*16,this.emptyTile=new Float32Array(this.tileSize[0]*this.tileSize[1]*4),this.texture=e.createTexture({id:t.id??"flow-field-atlas",width:r,height:o,format:"rgba32float",usage:y.SAMPLE|y.COPY_DST|y.COPY_SRC,data:new Float32Array(r*o*4),sampler:{minFilter:"nearest",magFilter:"nearest"}}),this.field={texture:this.texture,bounds:[...t.bounds],coordinates:t.coordinates}}writeTile(e,t,r){a(!this.texture.destroyed),a(Number.isInteger(e)&&e>=0&&e<this.tileCount[0]),a(Number.isInteger(t)&&t>=0&&t<this.tileCount[1]),a(r.length===this.emptyTile.length),this.texture.writeData(r,{x:e*this.tileSize[0],y:t*this.tileSize[1],width:this.tileSize[0],height:this.tileSize[1]})}clearTile(e,t){this.writeTile(e,t,this.emptyTile)}destroy(){this.texture.destroyed||this.texture.destroy()}}const ge=await ie();ge.supported||document.querySelectorAll('script[type="module"]:not([data-luma-example-support-bootstrap])').forEach(n=>n.remove());const w=[-84,-620,84,620];function ye(n,e={}){const t=re();for(const i of t)i.kind==="water"?i.color=[.035,.15,.2]:i.color=[i.color[0]*.65,i.color[1]*.65,i.color[2]*.65];let r=null,o=null,s=!0,f=0,u=-1,l=null,c=null,x=2048,h="river",m=!0,v=2,_=6,E=1.5,b=0,D,R;const H=new Promise((i,S)=>{D=i,R=S}),d={frames:0,backend:"",error:"",selected:-1,finalized:!1,advancedTime:0,droppedTime:0,submissionMilliseconds:0,fieldTime:0,fieldUpdates:0},M=J(e),C=new Q({parent:n,...M,deviceProps:{...M.deviceProps,createCanvasContext:{alphaMode:"opaque"},webgl:{alpha:!1}},views:new Z({controller:!0}),initialViewState:{...ne,longitude:L[0],latitude:L[1],zoom:15.6,pitch:50,bearing:-25},layers:[],_animate:!0,onDeviceInitialized:i=>{r=i,d.backend=r.type,I()},onLoad:()=>{g(),D()},onBeforeRender:()=>{const i=performance.now(),S=b?(i-b)/1e3:1/60;b=i,l&&m&&(h==="changing"&&Math.floor(f*2)!==u&&T(),c=l.step(S*v),f+=c.advancedTime,d.fieldTime=f,d.submissionMilliseconds=performance.now()-i,d.advancedTime+=c.advancedTime,d.droppedTime+=c.droppedTime)},onAfterRender:()=>{d.frames++},onError:i=>{d.error||=i.message,R(i)},onClick:i=>{d.selected=i.layer?.id==="particles"?i.index:-1,n.dispatchEvent(new Event("flow-selection"))},getTooltip:i=>i.layer?.id==="particles"?`Particle ${i.index}`:i.object?.name||null});function I(){if(!r)return;o||(o=new xe(r,{bounds:w,coordinates:"cartesian",tileSize:[64,64],tileCount:[1,4]}),T());const i=new ve(r,{particleCount:x,field:o.field,seed:29,lifetime:90}),S=l;l=i,c=l.step(1/60),S?.destroy(),b=0}function T(){if(o){u=Math.floor(f*2);for(let i=0;i<4;i++)i===3&&!s?o.clearTile(0,i):O(o,i,h,u/2);d.fieldUpdates++}}function g(){if(!c)return;const i={coordinateSystem:ee.METER_OFFSETS,coordinateOrigin:L};C.setProps({layers:[new se({id:"buildings",features:t,data:t,pickable:!0,...i}),new z({id:"particles",particles:()=>(a(c),c),particleCount:x,bounds:w,widthPixels:E,trailSeconds:_,altitude:1,color:[.45,.93,.88,.9],pickable:!0,...i})]})}return{deck:C,diagnostics:d,ready:H,get simulation(){return l},get fieldAtlas(){return o},get particles(){return c},setPlaying(i){m=i,b=0,C.setProps({_animate:m})},setSpeed(i){v=i},setTrail(i){_=i,g()},setWidth(i){E=i,g()},setCount(i){x=i,I(),g()},setPattern(i){!r||!l||(h=i,T(),c=l.step(1/60),g())},setNorthernSection(i){s=i,!(!o||!l)&&(i?O(o,3,h,u/2):o.clearTile(0,3),d.fieldUpdates++,c=l.step(1/60),g())},reset(){f=0,d.fieldTime=0,b=0,T(),l?.reset(),c=l?.step(1/60)??null,g()},finalize(){d.finalized||(d.finalized=!0,C.finalize(),l?.destroy(),o?.destroy())}}}function O(n,e,t,r){const[o,s]=n.tileSize,f=s*n.tileCount[1],u=new Float32Array(o*s*4);for(let l=0;l<s;l++)for(let c=0;c<o;c++){const x=w[0]+c/(o-1)*(w[2]-w[0]),h=w[1]+(e*s+l)/(f-1)*(w[3]-w[1]),m=Math.max(.05,1-(x/84)**2),v=(l*o+c)*4;u[v]=t==="eddies"?5*Math.sin(h/55)*m:Math.sin(h/100)*m,u[v+1]=t==="eddies"?3+6*Math.sin(x/35)*Math.cos(h/55):3+5*m,t==="changing"&&(u[v]+=3*Math.sin(r*.35+h/180)*m,u[v+1]*=.35+.65*Math.cos(r*.4)),u[v+2]=t==="missing"&&Math.hypot(x*1.5,h-100)<75?0:1}n.writeTile(0,e,u)}const G=document.querySelector("#scene"),F=document.querySelector("#backend"),Y=await te(new URLSearchParams(location.search).get("backend"));F.value=Y;const p=ye(G,{deviceType:Y});window.flowScene=p;F.addEventListener("change",()=>{location.search=`?backend=${F.value}`});const j=document.querySelector("#playing");j.addEventListener("change",()=>p.setPlaying(j.checked));const P=document.querySelector("#field");P.addEventListener("change",()=>p.setPattern(P.value==="changing"?"changing":P.value==="eddies"?"eddies":P.value==="missing"?"missing":"river"));const q=document.querySelector("#northern-section");q.addEventListener("change",()=>p.setNorthernSection(q.checked));const B=document.querySelector("#count");B.addEventListener("change",()=>p.setCount(Number(B.value)));for(const[n,e]of[["speed",p.setSpeed],["trail",p.setTrail],["width",p.setWidth]]){const t=document.querySelector(`#${n}`);t.addEventListener("input",()=>e(Number(t.value)))}document.querySelector("#reset").addEventListener("click",()=>p.reset());G.addEventListener("flow-selection",()=>{document.querySelector("#selection").textContent=p.diagnostics.selected>=0?`Particle ${p.diagnostics.selected}`:"Click a particle to inspect"});p.ready.then(()=>{document.body.dataset.ready="true"}).catch(n=>{document.querySelector("#status").textContent=n.message});window.addEventListener("pagehide",()=>p.finalize());
