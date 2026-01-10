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
  float elevation = 0.0;
  // calculate stroke offset
  float strokeOffsetRatio = 1.0;
  bool isBevelVertex = column.bevelEnabled && positions.z > column.bevelTopZ;

  // Bevel attributes:
  // instanceBevelHeights: 0=flat, -1=use radius, positive=custom height
  // instanceBevelSegs: 0/1=flat, 2=cone, 3+=dome, -1=use geometry segs
  // instanceBevelBulge: 0=standard, negative=concave, positive=convex
  float bevelHeight = instanceBevelHeights;
  float bevelSegs = instanceBevelSegs;
  float bevelBulge = instanceBevelBulge;

  if (column.extruded) {
    float fullElevation = instanceElevations * column.elevationScale;

    // Decode shape from segs
    bool isFlat = bevelHeight < 0.001 && bevelHeight > -0.5;  // height = 0
    if (!isFlat) {
      isFlat = bevelSegs > -0.5 && bevelSegs < 1.5;  // segs = 0 or 1
    }
    bool isCone = bevelSegs > 1.5 && bevelSegs < 2.5;  // segs = 2
    // segs >= 3 or segs = -1 means dome

    // Smooth normals for dome (segs >= 3 or -1), planar for cone
    bool smoothNormals = !isCone;

    // Calculate bevel size
    float bevelSize;
    if (isFlat) {
      bevelSize = 0.0;
    } else if (bevelHeight < -0.5) {
      // -1 means use radius
      bevelSize = min(column.bevelSize, fullElevation);
    } else {
      // Custom height
      bevelSize = min(bevelHeight, fullElevation);
    }

    if (isBevelVertex) {
      // Bevel vertex - dome geometry has z = sin(phi), ranging 0 to 1
      float phi = asin(clamp(positions.z, 0.0, 1.0));

      if (isFlat) {
        // Flat: collapse all bevel vertices to top
        elevation = fullElevation;
      } else if (isCone) {
        // Cone: linearize elevation
        float linearT = phi / 1.5708;
        elevation = fullElevation - bevelSize + linearT * bevelSize;
      } else {
        // Dome with bulge: primarily affects radius (OUT), minimal effect on elevation (UP)
        // bulge > 0: bulges outward, bulge < 0: pinches inward
        // Elevation follows standard dome curve (minimal bulge effect)
        elevation = fullElevation - bevelSize + positions.z * bevelSize;
      }
    } else {
      // Cylinder vertex
      float cylinderT = (positions.z + 1.0) / 2.0;
      if (isFlat) {
        elevation = cylinderT * 2.0 * fullElevation;
      } else {
        elevation = cylinderT * 2.0 * (fullElevation - bevelSize);
      }
    }
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

  // Decode shape and normal flags (recompute for XY/normal adjustment)
  bool isFlat2 = (bevelHeight < 0.001 && bevelHeight > -0.5) || (bevelSegs > -0.5 && bevelSegs < 1.5);
  bool isCone2 = bevelSegs > 1.5 && bevelSegs < 2.5;
  bool smoothNormals2 = !isCone2 && !isFlat2;

  vec2 adjustedXY = positions.xy;
  if (isBevelVertex) {
    float r = length(positions.xy);
    vec2 xyDir = r > 0.001 ? positions.xy / r : vec2(1.0, 0.0);
    float phi = asin(clamp(positions.z, 0.0, 1.0));

    if (isFlat2) {
      // Flat: all vertices at full radius
      adjustedXY = xyDir;
    } else if (isCone2) {
      // Cone: linear radius from 1 at base to 0 at apex
      float linearT = phi / 1.5708;
      adjustedXY = xyDir * (1.0 - linearT);
    } else {
      // Dome with bulge: bulge OUT (radius), not UP
      float t = phi / 1.5708; // 0 to 1
      // Bulge peaks in lower-middle of bevel, fades toward apex
      float bulgeEffect = bevelBulge * sin(t * 3.14159) * (1.0 - t * t);
      float modifiedR = r + bulgeEffect; // direct radius modification
      adjustedXY = xyDir * max(modifiedR, 0.0);
    }
  }

  vec2 offset = (rotationMatrix * adjustedXY * strokeOffsetRatio + column.offset) * dotRadius;
  if (column.radiusUnits == UNIT_METERS) {
    offset = project_size(offset);
  }
  vec3 pos = vec3(offset, 0.);
  DECKGL_FILTER_SIZE(pos, geometry);

  gl_Position = project_position_to_clipspace(centroidPosition, centroidPosition64Low, pos, geometry.position);

  // Calculate normals based on bevel type and smooth flag
  vec3 adjustedNormal = normals;
  if (isBevelVertex) {
    if (isFlat2) {
      // Flat: normal points straight up
      adjustedNormal = vec3(0.0, 0.0, 1.0);
    } else if (!smoothNormals2) {
      // Planar normals: constant slope based on shape
      vec2 xyDir = length(positions.xy) > 0.001 ? normalize(positions.xy) : vec2(1.0, 0.0);
      adjustedNormal = vec3(xyDir * 0.7071, 0.7071);
    }
    // Smooth normals: use geometry's curved normals (default)
  }
  geometry.normal = project_normal(vec3(rotationMatrix * adjustedNormal.xy, adjustedNormal.z));
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
