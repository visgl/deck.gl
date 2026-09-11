// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import collision from '../text-layer-collision.glsl';

export default /* glsl */ `\
#version 300 es
#define SHADER_NAME multi-icon-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in float instanceSizes;
in float instanceAngles;
in vec4 instanceColors;
in float rowIndexes;
in vec4 instanceIconFrames;
in float instanceColorModes;
in vec2 instanceOffsets;
in vec2 instancePixelOffset;
in vec4 instanceClipRect;
#ifdef MODULE_COLLISION
in vec4 instanceCollisionRects;
in float collisionStartIndices;
#endif

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

float getPixelOffsetFromAlignment(float anchor, float extent, float clipStart, float clipEnd, int mode) {
  if (clipEnd < clipStart) return 0.0;
  if (mode == ALIGN_MODE_START) {
    return max(- (anchor + clipStart), 0.0);
  }
  if (mode == ALIGN_MODE_CENTER) {
    float _min = max(0., anchor + clipStart);
    float _max = min(extent, anchor + clipEnd);
    return _min < _max ? (_min + _max) / 2.0 - anchor : 0.0;
  }
  if (mode == ALIGN_MODE_END) {
    return min(extent - (anchor + clipEnd), 0.);
  }
  return 0.0;
}

${collision}

void main(void) {
#ifdef MODULE_COLLISION
  // Binary input renders through the character layer. Evaluate only its first glyph.
  if (collision.visibilityPass && gl_InstanceID != int(collisionStartIndices)) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    return;
  }
#endif
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
  uv = positions;

  vec2 iconSize = instanceIconFrames.zw;
  // convert size in meters to pixels, then scaled and clamp
 
  // project meters to pixels and clamp to limits 
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * icon.sizeScale, icon.sizeUnits),
    icon.sizeMinPixels, icon.sizeMaxPixels
  );

  float instanceScale = sizePixels / text.fontSize;

  // scale and rotate vertex in "pixel" value and convert back to fraction in clipspace
  vec2 pixelOffset = positions / 2.0 * iconSize + instanceOffsets;
#ifdef MODULE_COLLISION
  // Binary input can supply per-character GPU attributes without per-label
  // background attributes. In that case this layer writes the label rectangle.
  if (collision.sort) {
    pixelOffset = instanceCollisionRects.xy + (positions / 2.0 + 0.5) * instanceCollisionRects.zw;
  }
#endif
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * instanceScale;
  pixelOffset += instancePixelOffset;
  pixelOffset.y *= -1.0;

  vec4 anchorPos = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
  vec2 anchorPosScreen = anchorPos.xy / anchorPos.w;
  anchorPosScreen = vec2(anchorPosScreen.x + 1.0, 1.0 - anchorPosScreen.y) / 2.0 * project.viewportSize / project.devicePixelRatio;
  vec2 xy = project_size_to_pixel(instanceClipRect.xy);
  vec2 wh = project_size_to_pixel(instanceClipRect.zw);
  if (text.flipY) {
    xy.y = -xy.y - wh.y;
  }
  vec2 scrollPixels = vec2(0.0);
  if (text.align.x > 0 || text.align.y > 0) {
    vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
    scrollPixels = vec2(
      getPixelOffsetFromAlignment(anchorPosScreen.x, viewportPixels.x, xy.x, xy.x + wh.x, text.align.x),
      -getPixelOffsetFromAlignment(anchorPosScreen.y, viewportPixels.y, -xy.y - wh.y, -xy.y, text.align.y)
    );
  }

#ifdef MODULE_COLLISION
  text_setCollisionBounds(instancePositions, instancePositions64Low,
    instanceCollisionRects * collision_getSize(instanceSizes) / text.fontSize,
    instancePixelOffset, instanceAngles, vec4(xy, wh), icon.billboard, text.flipY);
#endif

  if (icon.billboard) {
    gl_Position = anchorPos;
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    if (text.flipY) offset_common.y *= -1.0;
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }
  pixelOffset += scrollPixels;
  gl_Position.xy += project_pixel_size_to_clipspace(scrollPixels);

  if (instanceClipRect.z >= 0.) {
    if (pixelOffset.x < xy.x || pixelOffset.x > xy.x + wh.x) {
      gl_Position = vec4(0.0);
    }
    else if (text.cutoffPixels.x > 0.) {
      float vpWidth = project.viewportSize.x / project.devicePixelRatio;
      float l = max(anchorPosScreen.x + xy.x, 0.0);
      float r = min(anchorPosScreen.x + xy.x + wh.x, vpWidth);
      if (r - l < text.cutoffPixels.x) {
        gl_Position = vec4(0.0);
      }
    }
  }
  if (instanceClipRect.w >= 0.) {
    if (pixelOffset.y < xy.y || pixelOffset.y > xy.y + wh.y) {
      gl_Position = vec4(0.0);
    }
    else if (text.cutoffPixels.y > 0.) {
      float vpHeight = project.viewportSize.y / project.devicePixelRatio;
      float t = max(anchorPosScreen.y - xy.y - wh.y, 0.0);
      float b = min(anchorPosScreen.y - xy.y, vpHeight);
      if (b - t < text.cutoffPixels.y) {
        gl_Position = vec4(0.0);
      }
    }
  }

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / icon.iconsTextureDim;

  vColor = instanceColors;
  DECKGL_FILTER_COLOR(vColor, geometry);

  vColorMode = instanceColorModes;
#ifdef MODULE_COLLISION
  if (collision.visibilityPass) {
    // Preserve culling by the projection and other vertex extensions.
    if (gl_Position.w <= 0.0 || abs(gl_Position.z) > gl_Position.w) return;
    gl_Position = collision_getVisibilityPosition(positions / 2.0 + 0.5);
  }
#endif
}
`;
