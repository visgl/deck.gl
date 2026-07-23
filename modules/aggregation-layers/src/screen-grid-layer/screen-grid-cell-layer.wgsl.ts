// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `
struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec2<f32>,
  @location(1) instancePositions: vec2<f32>,
  @location(2) instanceWeights: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

fn sampleColorRange(value: f32, domain: vec2<f32>) -> vec4<f32> {
  let ratio = (value - domain.x) / (domain.y - domain.x);
  return textureSampleLevel(colorRange, colorRangeSampler, vec2<f32>(ratio, 0.5), 0.0);
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  output.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);

  if (attributes.instanceWeights != attributes.instanceWeights) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  var position =
    attributes.instancePositions * screenGrid.gridSizeClipspace +
    attributes.positions * screenGrid.cellSizeClipspace;
  position.x -= 1.0;
  position.y = 1.0 - position.y;

  output.position = vec4<f32>(position, 0.0, 1.0);
  let colorValue = sampleColorRange(attributes.instanceWeights, screenGrid.colorDomain);
  output.color = vec4<f32>(colorValue.rgb, colorValue.a * layer.opacity);
  return output;
}

@fragment
fn fragmentMain(varyings: Varyings) -> @location(0) vec4<f32> {
  if (picking.isActive > 0.5) {
    if (!picking_isColorValid(varyings.pickingColor)) {
      discard;
    }
    return vec4<f32>(varyings.pickingColor, 1.0);
  }
  return deckgl_premultiplied_alpha(varyings.color);
}
`;
