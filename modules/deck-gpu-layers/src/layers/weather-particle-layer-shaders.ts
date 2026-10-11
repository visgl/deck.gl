// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
const UNIFORMS = `layout(std140) uniform weatherRenderUniforms {
  vec4 appearance;
  vec4 surfaceBounds;
  vec4 color;
  vec3 cameraPosition;
} weatherRender;`;
export const weatherRender = {
  name: 'weatherRender',
  source: `struct weatherRenderUniforms {
    appearance: vec4<f32>,
    surfaceBounds: vec4<f32>,
    color: vec4<f32>,
    cameraPosition: vec3<f32>,
  };
  @group(3) @binding(auto) var<uniform> weatherRender: weatherRenderUniforms;
  @group(3) @binding(7) var surfaceElevation: texture_2d<f32>;`,
  vs: UNIFORMS + '\nuniform highp sampler2D surfaceElevation;',
  fs: UNIFORMS,
  uniformTypes: {
    appearance: 'vec4<f32>',
    surfaceBounds: 'vec4<f32>',
    color: 'vec4<f32>',
    cameraPosition: 'vec3<f32>'
  },
  bindingLayout: [
    {name: 'weatherRender', group: 3},
    {name: 'surfaceElevation', group: 3, visibility: 1}
  ],
  defaultUniforms: {
    cameraPosition: [0, 0, 0],
    appearance: [1.2, 12, 0, 0],
    surfaceBounds: [-1, -1, 2, 2],
    color: [0.75, 0.85, 0.95, 0.7]
  }
} as const satisfies ShaderModule;

export const SOURCE = /* wgsl */ `
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
`;
export const VERTEX_SHADER = /* glsl */ `#version 300 es
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
`;
export const FRAGMENT_SHADER = /* glsl */ `#version 300 es
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
`;
