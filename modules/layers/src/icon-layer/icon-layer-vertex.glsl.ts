// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME icon-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in vec3 instancePickingColors;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
in vec2 instanceCollisionOffsets;

out float vColorMode;
out vec4 vColor;
out vec2 vTextureCoords;
out vec2 uv;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = angle * PI / 180.0;
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

vec2 icon_getCollisionTexCoords(vec2 anchorTexCoords, vec2 pixelOffset) {
  return anchorTexCoords +
    vec2(pixelOffset.x, -pixelOffset.y) * project.devicePixelRatio / project.viewportSize;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = instancePickingColors;
  geometryCollisionUseTexCoordsOverride = false;
  uv = positions;

  vec2 iconSize = instanceIconFrames.zw;
  // convert size in meters to pixels, then scaled and clamp
 
  // project meters to pixels and clamp to limits 
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  // Choose correct constraint based on the 'sizeBasis' value (0.0 = width, 1.0 = height)
  float iconConstraint = icon.sizeBasis == 0.0 ? iconSize.x : iconSize.y;
  float instanceScale = iconConstraint == 0.0 ? 0.0 : sizePixels / iconConstraint;
  vec2 collisionPixelOffset = rotate_by_angle(instanceCollisionOffsets * sizePixels, instanceAngles);

  // scale and rotate vertex in "pixel" value and convert back to fraction in clipspace
  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
  pixelOffset += instancePixelOffset;
  pixelOffset.y *= -1.0;

  if (icon.billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    vec2 anchorTexCoords = vec2(gl_Position.x / gl_Position.w + 1.0, gl_Position.y / gl_Position.w + 1.0) / 2.0;
    // For billboard text in v9.2, MultiIconLayer shares this shader with IconLayer.
    // Sampling collisions at the offset anchor keeps text visibility aligned with
    // getPixelOffset without changing the actual collision footprint drawn by glyphs.
    geometryCollisionTexCoordsOverride = icon_getCollisionTexCoords(
      anchorTexCoords,
      instancePixelOffset + collisionPixelOffset
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

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / icon.iconsTextureDim;

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);

  vColorMode = instanceColorModes;
}
`;
