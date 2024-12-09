// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME raster-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in float instanceElevations;
in vec4 instanceFillColors;
in vec4 instanceLineColors;

in vec3 instancePickingColors;

// Result
out vec4 vColor;
#ifdef FLAT_SHADING
out vec4 position_commonspace;
#endif

void main(void) {
  // Rather than positioning using attribute, layout pixel grid using gl_InstanceID
  vec2 tileOrigin = column.offset.xy;
  float scale = column.widthScale; // Re-use widthScale prop to pass cell scale

  int yIndex = - (gl_InstanceID / BLOCK_WIDTH);
  int xIndex = gl_InstanceID + (yIndex * BLOCK_WIDTH);

  // Avoid precision issues by applying 0.5 offset here, rather than when laying out vertices
  vec2 cellCenter = scale * vec2(float(xIndex) + 0.5, float(yIndex) - 0.5);

  vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;

  // if alpha == 0.0 or z < 0.0, do not render element
  float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
  float cellWidth = column.coverage * scale;

  // Get position directly from quadbin, rather than projecting
  // Important to set geometry.position before using project_ methods below
  // as geometry.worldPosition is not set (we don't know our lat/long)
  geometry.position = vec4(tileOrigin + cellCenter, 0.0, 1.0);
  if (project.projectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
    geometry.position.xyz -= project.commonOrigin;
  }

  // calculate elevation, if 3d not enabled set to 0
  // cylindar geometry height are between -1.0 to 1.0, transform it to between 0, 1
  float elevation = 0.0;
  // calculate stroke offset
  float strokeOffsetRatio = 1.0;

  if (column.extruded) {
    elevation = instanceElevations * (positions.z + 1.0) / 2.0 * column.elevationScale;
  } else if (column.stroked) {
    float halfOffset = project_pixel_size(column.widthScale) / cellWidth;
    if (column.isStroke) {
      strokeOffsetRatio -= sign(positions.z) * halfOffset;
    } else {
      strokeOffsetRatio -= halfOffset;
    }
  }

  geometry.pickingColor = instancePickingColors;

  // Cell coordinates centered on origin
  vec2 base = positions.xy * scale * strokeOffsetRatio * column.coverage * shouldRender;
  vec3 cell = vec3(base, project_size(elevation));
  DECKGL_FILTER_SIZE(cell, geometry);

  geometry.position.xyz += cell;
  gl_Position = project_common_position_to_clipspace(geometry.position);

  geometry.normal = project_normal(normals);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  // Light calculations
  if (column.extruded && !column.isStroke) {
#ifdef FLAT_SHADING
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
