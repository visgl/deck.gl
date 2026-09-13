// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
struct TriangleAttributes {
  @location(0) positions: vec3<f32>,
  @location(1) texCoords: vec2<f32>,
};

struct TriangleVaryings {
  @builtin(position) position: vec4<f32>,
  @location(0) textureCoordinates: vec2<f32>,
  @location(1) intensityMinimum: f32,
  @location(2) intensityMaximum: f32,
};

@vertex
fn vertexMain(attributes: TriangleAttributes) -> TriangleVaryings {
  var output: TriangleVaryings;
  output.position = project_position_to_clipspace(
    attributes.positions,
    vec3<f32>(0.0),
    vec3<f32>(0.0)
  );
  // WebGPU render-target textures use a top-left origin.
  output.textureCoordinates = vec2<f32>(attributes.texCoords.x, 1.0 - attributes.texCoords.y);

  let maxWeights = textureLoad(maxTexture, vec2<i32>(0), 0);
  var maximumValue = select(maxWeights.r, maxWeights.g, triangle.aggregationMode > 0.5);
  var minimumValue = maximumValue * triangle.threshold;

  if (triangle.colorDomain.y > 0.0) {
    maximumValue = triangle.colorDomain.y;
    minimumValue = triangle.colorDomain.x;
  }

  output.intensityMaximum = triangle.intensity / maximumValue;
  output.intensityMinimum = triangle.intensity / minimumValue;
  return output;
}

@fragment
fn fragmentMain(varyings: TriangleVaryings) -> @location(0) vec4<f32> {
  let weights = textureSample(weightsTexture, weightsTextureSampler, varyings.textureCoordinates);
  var weight = weights.r;

  if (triangle.aggregationMode > 0.5) {
    weight /= max(1.0, weights.a);
  }

  let colorCoordinates = vec2<f32>(
    clamp(weight * varyings.intensityMaximum, 0.0, 1.0),
    0.5
  );
  var color = textureSample(colorTexture, colorTextureSampler, colorCoordinates);

  if (weight <= 0.0) {
    discard;
  }

  color.a *= min(weight * varyings.intensityMinimum, 1.0) * layer.opacity;
  return deckgl_premultiplied_alpha(color);
}
`;
