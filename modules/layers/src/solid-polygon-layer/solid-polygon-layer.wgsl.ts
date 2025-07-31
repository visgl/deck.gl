// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export const shaderWGSL = /* wgsl */ `\
struct LayerUniforms {
  opacity: f32,
};
var<private> layer: LayerUniforms = LayerUniforms(1.0);
// @group(0) @binding(1) var<uniform> layer: LayerUniforms;

// Placeholder filter functions
fn deckgl_filter_gl_position(p: vec4<f32>, geometry: Geometry) -> vec4<f32> {
  return p;
}
fn deckgl_filter_color(color: vec4<f32>, geometry: Geometry) -> vec4<f32> {
  return color;
}

struct Attributes {
  @location(0) positions: vec3<f32>,
  @location(1) positions64Low: vec3<f32>,
  @location(2) elevations: f32,
  @location(3) fillColors: vec4<f32>,
  @location(4) lineColors: vec4<f32>,
  @location(5) pickingColors: vec3<f32>,
};

struct Varyings {
  @builtin(position) gl_Position: vec4<f32>,
  @location(0) vColor: vec4<f32>,
};

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  geometry.worldPosition = attributes.positions;
  geometry.pickingColor = attributes.pickingColors;
  let projectResult = project_position_to_clipspace_and_commonspace(attributes.positions, attributes.positions64Low, vec3<f32>(0.0));
  var position = projectResult.clipPosition;
  geometry.position = projectResult.commonPosition;
  position = deckgl_filter_gl_position(position, geometry);

  var vColor = vec4<f32>(attributes.fillColors.rgb, attributes.fillColors.a * layer.opacity);
  vColor = deckgl_filter_color(vColor, geometry);

  var output: Varyings;
  output.gl_Position = position;
  output.vColor = vColor;
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  var fragColor = varyings.vColor;
  return fragColor;
}
`;
