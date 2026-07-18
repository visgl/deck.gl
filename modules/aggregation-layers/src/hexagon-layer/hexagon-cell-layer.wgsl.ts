// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
const HEXBIN_DISTANCE: vec2<f32> = vec2<f32>(1.7320508, 1.5);

struct Attributes {
  @builtin(instance_index) instanceIndex: u32,
  @location(0) positions: vec3<f32>,
  @location(1) normals: vec3<f32>,
  @location(2) instancePositions: vec2<f32>,
  @location(3) instanceColorValues: f32,
  @location(4) instanceElevationValues: f32,
};

struct Varyings {
  @builtin(position) position: vec4<f32>,
  @location(0) color: vec4<f32>,
  @location(1) pickingColor: vec3<f32>,
};

fn hexbinCentroid(binId: vec2<f32>, radius: f32) -> vec2<f32> {
  var adjustedBinId = binId;
  adjustedBinId.x += fract(adjustedBinId.y * 0.5);
  return adjustedBinId * HEXBIN_DISTANCE * radius;
}

fn interpolate(value: f32, domain: vec2<f32>, range: vec2<f32>) -> f32 {
  let ratio = clamp((value - domain.x) / (domain.y - domain.x), 0.0, 1.0);
  return mix(range.x, range.y, ratio);
}

fn sampleColorRange(value: f32, domain: vec2<f32>) -> vec4<f32> {
  let ratio = (value - domain.x) / (domain.y - domain.x);
  return textureSampleLevel(colorRange, colorRangeSampler, vec2<f32>(ratio, 0.5), 0.0);
}

@vertex
fn vertexMain(attributes: Attributes) -> Varyings {
  var output: Varyings;
  geometry.pickingColor = picking_getPickingColorFromIndex(attributes.instanceIndex);
  output.pickingColor = geometry.pickingColor;

  if (
    attributes.instanceColorValues != attributes.instanceColorValues ||
    attributes.instanceColorValues < hexagon.colorDomain.z ||
    attributes.instanceColorValues > hexagon.colorDomain.w ||
    attributes.instanceElevationValues < hexagon.elevationDomain.z ||
    attributes.instanceElevationValues > hexagon.elevationDomain.w
  ) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  var commonPosition =
    hexbinCentroid(attributes.instancePositions, column.radius) +
    (hexagon.originCommon - project.commonOrigin.xy);
  commonPosition += attributes.positions.xy * column.radius * column.coverage;
  geometry.position = vec4<f32>(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(attributes.normals);

  if (column.extruded > 0.5) {
    var elevation = interpolate(
      attributes.instanceElevationValues,
      hexagon.elevationDomain.xy,
      hexagon.elevationRange
    );
    elevation = project_size_float(elevation);
    geometry.position.z = (attributes.positions.z + 1.0) / 2.0 * elevation;
  }

  output.position = project_common_position_to_clipspace(geometry.position);
  var colorValue = sampleColorRange(attributes.instanceColorValues, hexagon.colorDomain.xy);
  if (column.extruded > 0.5) {
    colorValue = vec4<f32>(
      lighting_getLightColor2(
        colorValue.rgb,
        project.cameraPosition,
        geometry.position.xyz,
        geometry.normal
      ),
      colorValue.a
    );
  }
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
