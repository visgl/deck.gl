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
in float instanceBevelHeights;
in float instanceBevelSegs;
in float instanceBevelBulge;

in vec3 instancePickingColors;

out vec4 vColor;
#ifdef FLAT_SHADING
out vec3 cameraPosition;
out vec4 position_commonspace;
#endif

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.pickingColor = instancePickingColors;

  vec4 color = column.isStroke ? instanceLineColors : instanceFillColors;
  mat2 rotationMatrix = mat2(cos(column.angle), sin(column.angle), -sin(column.angle), cos(column.angle));

  float elevation = 0.0;
  float strokeOffsetRatio = 1.0;
  vec2 adjustedXY = positions.xy;
  vec3 adjustedNormal = normals;

  // Bevel shape flags (computed once, used for elevation, XY, and normals)
  bool isFlat = (instanceBevelHeights < 0.001 && instanceBevelHeights > -0.5) ||
                (instanceBevelSegs > -0.5 && instanceBevelSegs < 1.5);
  bool isCone = instanceBevelSegs > 1.5 && instanceBevelSegs < 2.5;
  bool isBevelVertex = column.bevelEnabled && positions.z > column.bevelTopZ;

  if (column.extruded) {
    float fullElevation = instanceElevations * column.elevationScale;

    // Calculate bevel size: 0=flat, -1=use radius, positive=custom height
    float bevelSize = isFlat ? 0.0 :
      (instanceBevelHeights < -0.5 ? min(column.bevelSize, fullElevation) : min(instanceBevelHeights, fullElevation));

    if (isBevelVertex) {
      float phi = asin(clamp(positions.z, 0.0, 1.0));
      float t = phi / 1.5708;

      if (isFlat) {
        elevation = fullElevation;
        adjustedXY = length(positions.xy) > 0.001 ? normalize(positions.xy) : vec2(1.0, 0.0);
        adjustedNormal = vec3(0.0, 0.0, 1.0);
      } else if (isCone) {
        elevation = fullElevation - bevelSize + t * bevelSize;
        adjustedXY = (length(positions.xy) > 0.001 ? normalize(positions.xy) : vec2(1.0, 0.0)) * (1.0 - t);
        adjustedNormal = vec3(normalize(positions.xy) * 0.7071, 0.7071);
      } else {
        // Dome with bulge
        elevation = fullElevation - bevelSize + positions.z * bevelSize;
        float r = length(positions.xy);
        vec2 xyDir = r > 0.001 ? positions.xy / r : vec2(1.0, 0.0);
        float bulgeEffect = instanceBevelBulge * sin(t * 3.14159) * (1.0 - t * t);
        adjustedXY = xyDir * max(r + bulgeEffect, 0.0);
        // Smooth normals: use geometry's curved normals (default)
      }
    } else {
      // Cylinder vertex
      float cylinderT = (positions.z + 1.0) / 2.0;
      elevation = cylinderT * 2.0 * (isFlat ? fullElevation : fullElevation - bevelSize);
    }
  } else if (column.stroked) {
    float widthPixels = clamp(
      project_size_to_pixel(instanceStrokeWidths * column.widthScale, column.widthUnits),
      column.widthMinPixels, column.widthMaxPixels) / 2.0;
    float halfOffset = project_pixel_size(widthPixels) / project_size(column.edgeDistance * column.coverage * column.radius);
    strokeOffsetRatio -= column.isStroke ? sign(positions.z) * halfOffset : halfOffset;
  }

  float shouldRender = float(color.a > 0.0 && instanceElevations >= 0.0);
  float dotRadius = column.radius * column.coverage * shouldRender;

  vec3 centroidPosition = vec3(instancePositions.xy, instancePositions.z + elevation);
  vec2 offset = (rotationMatrix * adjustedXY * strokeOffsetRatio + column.offset) * dotRadius;
  if (column.radiusUnits == UNIT_METERS) {
    offset = project_size(offset);
  }
  vec3 pos = vec3(offset, 0.);
  DECKGL_FILTER_SIZE(pos, geometry);

  gl_Position = project_position_to_clipspace(centroidPosition, instancePositions64Low, pos, geometry.position);
  geometry.normal = project_normal(vec3(rotationMatrix * adjustedNormal.xy, adjustedNormal.z));
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

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
