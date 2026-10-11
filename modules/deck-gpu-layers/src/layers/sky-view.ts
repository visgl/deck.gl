// luma.gl
// SPDX-License-Identifier: MIT
// SPDX-FileCopyrightText: Copyright (c) vis.gl contributors

import type {Viewport} from '@deck.gl/core';
import {Matrix4, type NumberArray3} from '@math.gl/core';
import type {ShaderModule} from '@luma.gl/shadertools';
import {getMeterOffsetPosition} from '../projection/meter-offset-position';

export const skyView = {
  name: 'skyView',
  uniformTypes: {
    camera: 'vec3<f32>',
    lowerLeft: 'vec3<f32>',
    lowerRight: 'vec3<f32>',
    upperLeft: 'vec3<f32>',
    opacity: 'f32'
  },
  source: `struct skyViewUniforms {
    camera: vec3f,
    lowerLeft: vec3f,
    lowerRight: vec3f,
    upperLeft: vec3f,
    opacity: f32,
  }; @group(3) @binding(auto) var<uniform> skyView: skyViewUniforms;`,
  vs: `layout(std140) uniform skyViewUniforms {
    vec3 camera;
    vec3 lowerLeft;
    vec3 lowerRight;
    vec3 upperLeft;
    float opacity;
  } skyView;`,
  fs: `layout(std140) uniform skyViewUniforms {
    vec3 camera;
    vec3 lowerLeft;
    vec3 lowerRight;
    vec3 upperLeft;
    float opacity;
  } skyView;`
} as const satisfies ShaderModule;

/** Unnormalised perspective rays interpolate linearly across the screen. */
export function getSkyViewUniforms(viewport: Viewport, coordinateOrigin: Readonly<NumberArray3>) {
  const inverseProjection = new Matrix4(viewport.projectionMatrix).invert();
  const inverseView = new Matrix4(viewport.viewMatrix).invert();
  const units = viewport.getDistanceScales([...coordinateOrigin]).unitsPerMeter;
  function getRay(horizontal: number, vertical: number): NumberArray3 {
    const position = inverseProjection.transform([horizontal, vertical, 1, 1]);
    const direction = inverseView.transform([position[0], position[1], position[2], 0]);
    return [direction[0] / units[0], direction[1] / units[1], direction[2] / units[2]];
  }
  return {
    camera: getMeterOffsetPosition(viewport, coordinateOrigin, viewport.cameraPosition),
    lowerLeft: getRay(-1, -1),
    lowerRight: getRay(1, -1),
    upperLeft: getRay(-1, 1)
  };
}

export const SKY_VERTEX_SOURCE = /* wgsl */ `
struct SkyViewVertex { @builtin(position) position: vec4f, @location(0) direction: vec3f };
@vertex fn vertexMain(@builtin(vertex_index) index: u32) -> SkyViewVertex {
  let positions = array<vec2f, 3>(vec2f(-1.0, -1.0), vec2f(3.0, -1.0), vec2f(-1.0, 3.0));
  let corner = positions[index];
  let fraction = corner * 0.5 + 0.5;
  var output: SkyViewVertex;
  output.position = vec4f(corner, 1.0, 1.0);
  output.direction = skyView.lowerLeft + fraction.x * (skyView.lowerRight - skyView.lowerLeft)
    + fraction.y * (skyView.upperLeft - skyView.lowerLeft);
  return output;
}
`;
export const SKY_VERTEX_SHADER = /* glsl */ `#version 300 es
out vec3 direction;
void main() {
  vec2 positions[3] = vec2[3](vec2(-1.0, -1.0), vec2(3.0, -1.0), vec2(-1.0, 3.0));
  vec2 corner = positions[gl_VertexID];
  vec2 fraction = corner * 0.5 + 0.5;
  gl_Position = vec4(corner, 1.0, 1.0);
  direction = skyView.lowerLeft + fraction.x * (skyView.lowerRight - skyView.lowerLeft)
    + fraction.y * (skyView.upperLeft - skyView.lowerLeft);
}`;
