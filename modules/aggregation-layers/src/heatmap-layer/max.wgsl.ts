// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
struct MaxWeightVaryings {
  @builtin(position) position: vec4<f32>,
  @location(0) weights: vec4<f32>,
};

const MAX_WEIGHT_REDUCTION_SIZE: u32 = 16u;

@vertex
fn vertexMain(@builtin(vertex_index) vertexIndex: u32) -> MaxWeightVaryings {
  var output: MaxWeightVaryings;
  let textureSize = u32(maxWeight.textureSize);
  let reducedTextureSize =
    (textureSize + MAX_WEIGHT_REDUCTION_SIZE - 1u) / MAX_WEIGHT_REDUCTION_SIZE;
  let blockCoordinates = vec2<u32>(
    vertexIndex % reducedTextureSize,
    vertexIndex / reducedTextureSize
  );
  var maximumWeights = vec4<f32>(0.0);

  for (var y = 0u; y < MAX_WEIGHT_REDUCTION_SIZE; y++) {
    for (var x = 0u; x < MAX_WEIGHT_REDUCTION_SIZE; x++) {
      let textureCoordinates = blockCoordinates * MAX_WEIGHT_REDUCTION_SIZE + vec2<u32>(x, y);

      if (textureCoordinates.x < textureSize && textureCoordinates.y < textureSize) {
        let weights = textureLoad(inTexture, vec2<i32>(textureCoordinates), 0);
        maximumWeights.r = max(maximumWeights.r, weights.r);
        maximumWeights.g = max(maximumWeights.g, weights.r / max(1.0, weights.a));
        maximumWeights.b = max(maximumWeights.b, weights.b);
        maximumWeights.a = max(maximumWeights.a, weights.a);
      }
    }
  }

  output.position = vec4<f32>(0.0, 0.0, 0.0, 1.0);
  output.weights = maximumWeights;
  return output;
}

@fragment
fn fragmentMain(varyings: MaxWeightVaryings) -> @location(0) vec4<f32> {
  return varyings.weights;
}
`;
