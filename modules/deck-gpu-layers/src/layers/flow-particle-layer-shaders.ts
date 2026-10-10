// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';

export const flowStreak = {
  name: 'flowStreak',
  source: `struct FlowStreakUniforms { bounds: vec4<f32>, boundsLow: vec4<f32>, appearance: vec4<f32>, color: vec4<f32> };
  @group(3) @binding(0) var<uniform> flowStreak: FlowStreakUniforms;
  @group(3) @binding(1) var flowState: texture_2d<f32>;
  @group(3) @binding(2) var flowPreviousState: texture_2d<f32>;`,
  vs: `layout(std140) uniform flowStreakUniforms { vec4 bounds;
  vec4 boundsLow;
  vec4 appearance;
  vec4 color; } flowStreak;
  uniform highp sampler2D flowState; uniform highp sampler2D flowPreviousState;`,
  fs: `layout(std140) uniform flowStreakUniforms { vec4 bounds;
  vec4 boundsLow;
  vec4 appearance;
  vec4 color; } flowStreak;`,
  bindingLayout: [
    {name: 'flowStreak', group: 3},
    {name: 'flowState', group: 3, visibility: 1},
    {name: 'flowPreviousState', group: 3, visibility: 1}
  ],
  uniformTypes: {
    bounds: 'vec4<f32>',
    boundsLow: 'vec4<f32>',
    appearance: 'vec4<f32>',
    color: 'vec4<f32>'
  },
  defaultUniforms: {
    bounds: [0, 0, 1, 1],
    boundsLow: [0, 0, 0, 0],
    appearance: [1.5, 1, 1, 1],
    color: [0.4, 0.9, 1, 0.9]
  }
} as const satisfies ShaderModule;

export const SOURCE = /* wgsl */ `struct FlowVertex {
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
`;
export const VERTEX_SHADER = /* glsl */ `#version 300 es
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
`;
export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
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
`;
