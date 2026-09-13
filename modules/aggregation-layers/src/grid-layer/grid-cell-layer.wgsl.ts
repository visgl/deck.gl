// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* wgsl */ `\
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
    attributes.instanceColorValues < grid.colorDomain.z ||
    attributes.instanceColorValues > grid.colorDomain.w ||
    attributes.instanceElevationValues < grid.elevationDomain.z ||
    attributes.instanceElevationValues > grid.elevationDomain.w
  ) {
    output.position = vec4<f32>(0.0);
    output.color = vec4<f32>(0.0);
    return output;
  }

  let commonPosition =
    (attributes.instancePositions +
      (attributes.positions.xy + vec2<f32>(1.0)) * 0.5 * column.coverage) *
      grid.sizeCommon +
    grid.originCommon -
    project.commonOrigin.xy;
  geometry.position = vec4<f32>(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(attributes.normals);

  if (column.extruded > 0.5) {
    var elevation = interpolate(
      attributes.instanceElevationValues,
      grid.elevationDomain.xy,
      grid.elevationRange
    );
    elevation = project_size_float(elevation);
    geometry.position.z = (attributes.positions.z + 1.0) * 0.5 * elevation;
  }

  output.position = project_common_position_to_clipspace(geometry.position);
  var colorValue = sampleColorRange(attributes.instanceColorValues, grid.colorDomain.xy);
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

  var color = varyings.color;
  if (picking.isHighlightActive > 0.5) {
    let highlightedObjectColor = picking_normalizeColor(picking.highlightedObjectColor);
    if (picking_isColorZero(abs(varyings.pickingColor - highlightedObjectColor))) {
      let highlightAlpha = picking.highlightColor.a;
      let blendedAlpha = highlightAlpha + color.a * (1.0 - highlightAlpha);
      if (blendedAlpha > 0.0) {
        let highlightRatio = highlightAlpha / blendedAlpha;
        color = vec4<f32>(
          mix(color.rgb, picking.highlightColor.rgb, highlightRatio),
          blendedAlpha
        );
      } else {
        color = vec4<f32>(color.rgb, 0.0);
      }
    }
  }

  return deckgl_premultiplied_alpha(color);
}
`;
