// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `#version 300 es

#define SHADER_NAME column-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in vec3 instancePositions;
in float instanceElevations;
in vec3 instancePositions64Low;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in float instanceStrokeWidths;

in vec3 instancePickingColors;

// Result
out vec4 vColor;
#ifdef FLAT_SHADING
out vec3 cameraPosition;
out vec4 position_commonspace;
#endif

void main(void) {
  geometry.worldPosition = instancePositions;

  vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
  // rotate primitive position and normal
  mat2 rotationMatrix = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));

  // calculate elevation, if 3d not enabled set to 0
  // cylindar gemoetry height are between -1.0 to 1.0, transform it to between 0, 1
  float elevation = 0.0;
  // calculate stroke offset
  float strokeOffsetRatio = 1.0;

  if (column.extruded) {
    elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked) {
    float widthPixels = clamp(
      project_size_to_pixel(instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels, column.widthMaxPixels) / 2.0;
    float halfOffset = project_pixel_size(widthPixels) / project_size(column.edgeDistance * column.coverage * column.radius);
    if (column.isStroke) {
      strokeOffsetRatio -= sign(positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  // if alpha == 0.0 or z < 0.0, do not render element
  float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
  float dotRadius = column.radius * column.coverage * shouldRender;

  geometry.pickingColor = instancePickingColors;

  // project center of column
  vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
  vec3 centroidPosition64Low = instancePositions64Low;
  vec2 offset = (rotationMatrix * positions.xy * strokeOffsetRatio + column.offset) * dotRadius;
  if (column.radiusUnits == UNIT_METERS) {
    offset = project_size(offset);
  }
  vec3 pos = vec3(offset, 0.);
  DECKGL_FILTER_SIZE(pos, geometry);

  gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);
  geometry.normal = project_normal(vec3(rotationMatrix * normals.xy, normals.z));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  // Light calculations
  if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
    cameraPosition = project.cameraPosition;
    position_commonspace = geometry.position;
    vColor = vec4(color.rgb, color.a * layer.opacity);
#else
    vec3 lightColor = lighting_getLightColor(color.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
    vColor = vec4(lightColor, color.a * layer.opacity);
#endif
  } else {
    vColor = vec4(color.rgb, color.a * layer.opacity);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
