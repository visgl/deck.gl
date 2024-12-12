// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default /* glsl */ `#version 300 es

#define SHADER_NAME grid-cell-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
in vec3 instancePickingColors;

uniform sampler2D colorRange;

// Result
out vec4 vColor;

float interp(float value, vec2 domain, vec2 range) {
  float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
  return mix(range.x, range.y, r);
}

vec4 interp(float value, vec2 domain, sampler2D range) {
  float r = (value - domain.x) / (domain.y - domain.x);
  return texture(range, vec2(r, 0.5));
}

void main(void) {
  geometry.pickingColor = instancePickingColors;

  if (isnan(instanceColorValues) ||
    instanceColorValues < grid.colorDomain.z ||
    instanceColorValues > grid.colorDomain.w ||
    instanceElevationValues < grid.elevationDomain.z ||
    instanceElevationValues > grid.elevationDomain.w
  ) {
    gl_Position = vec4(0.);
    return;
  }
  
  vec2 commonPosition = (instancePositions + (positions.xy + 1.0) / 2.0 * column.coverage) * grid.sizeCommon + grid.originCommon - project.commonOrigin.xy;
  geometry.position = vec4(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(normals);

  // calculate z, if 3d not enabled set to 0
  float elevation = 0.0;
  if (column.extruded) {
    elevation = interp(instanceElevationValues, grid.elevationDomain.xy, grid.elevationRange);
    elevation = project_size(elevation);
    // cylindar gemoetry height are between -1.0 to 1.0, transform it to between 0, 1
    geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
  }

  gl_Position = project_common_position_to_clipspace(geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vColor = interp(instanceColorValues, grid.colorDomain.xy, colorRange);
  vColor.a *= layer.opacity;
  if (column.extruded) {
    vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
