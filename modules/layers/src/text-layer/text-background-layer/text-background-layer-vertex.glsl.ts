// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in vec2 instanceCollisionOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;

out vec4 vFillColor;
out vec4 vLineColor;
out float vLineWidth;
out vec2 uv;
out vec2 dimensions;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = radians(angle);
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

vec2 text_getCollisionTexCoords(vec2 anchorTexCoords, vec2 pixelOffset) {
  return anchorTexCoords +
    vec2(pixelOffset.x, -pixelOffset.y) * project.devicePixelRatio / project.viewportSize;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = instancePickingColors;
  geometryCollisionUseTexCoordsOverride = false;
  uv = positions;
  vLineWidth = instanceLineWidths;

  // convert size in meters to pixels, then scaled and clamp

  // project meters to pixels and clamp to limits
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
    textBackground.sizeMinPixels, textBackground.sizeMaxPixels
  );

  vec2 collisionPixelOffset = rotate_by_angle(instanceCollisionOffsets * sizePixels, instanceAngles);

  dimensions = textBackground.markerMode
    ? vec2(1.0)
    : instanceRects.zw * sizePixels + textBackground.padding.xy + textBackground.padding.zw;

  vec2 pixelOffset;
  if (textBackground.markerMode) {
    pixelOffset = collisionPixelOffset + instancePixelOffsets + positions - vec2(0.5);
  } else {
    pixelOffset =
      (positions * instanceRects.zw + instanceRects.xy) * sizePixels +
      mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
    pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
    pixelOffset += instancePixelOffsets;
  }
  pixelOffset.y *= -1.0;

  if (textBackground.billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    vec2 anchorTexCoords = vec2(gl_Position.x / gl_Position.w + 1.0, gl_Position.y / gl_Position.w + 1.0) / 2.0;
    geometryCollisionTexCoordsOverride = text_getCollisionTexCoords(
      anchorTexCoords,
      instancePixelOffsets + collisionPixelOffset
    );
    geometryCollisionUseTexCoordsOverride = true;
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`;
