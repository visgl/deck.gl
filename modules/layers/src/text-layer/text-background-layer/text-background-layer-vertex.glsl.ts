// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import collision from '../text-layer-collision.glsl';

export default /* glsl */ `\
#version 300 es
#define SHADER_NAME text-background-layer-vertex-shader

in vec2 positions;

in vec3 instancePositions;
in vec3 instancePositions64Low;
in vec4 instanceRects;
in vec4 instanceClipRect;
in float instanceSizes;
in float instanceAngles;
in vec2 instancePixelOffsets;
in float instanceLineWidths;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in float rowIndexes;

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

${collision}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = picking_getPickingColorFromIndex(rowIndexes);
  uv = positions;
  vLineWidth = instanceLineWidths;

  // convert size in meters to pixels, then scaled and clamp

  // project meters to pixels and clamp to limits
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * textBackground.sizeScale, textBackground.sizeUnits),
    textBackground.sizeMinPixels, textBackground.sizeMaxPixels
  );
  float instanceScale = sizePixels / text.fontSize;

  dimensions = instanceRects.zw * instanceScale + textBackground.padding.xy + textBackground.padding.zw;

  vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * instanceScale + mix(-textBackground.padding.xy, textBackground.padding.zw, positions);
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
  pixelOffset += instancePixelOffsets;
  pixelOffset.y *= -1.0;

  // apply clipping
  vec2 xy = project_size_to_pixel(instanceClipRect.xy);
  vec2 wh = project_size_to_pixel(instanceClipRect.zw);
  if (text.flipY) {
    xy.y = -xy.y - wh.y;
  }
  if (instanceClipRect.z >= 0.0) {
    dimensions.x = wh.x;
    pixelOffset.x = xy.x + uv.x * wh.x + mix(-textBackground.padding.x, textBackground.padding.z, uv.x);
  }
  if (instanceClipRect.w >= 0.0) {
    dimensions.y = wh.y;
    // Assign the same corners in the flipped order of the default offset above so the strip
    // stays front-facing
    float v = 1.0 - uv.y;
    pixelOffset.y = xy.y + v * wh.y + mix(-textBackground.padding.y, textBackground.padding.w, v);
  }

  // Hide the label where the character shader cuts off its content box
  bool cutOff = false;
  if (text.cutoffPixels != vec2(0.0)) {
    vec4 anchorPos = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0));
    vec2 viewportPixels = project.viewportSize / project.devicePixelRatio;
    vec2 anchorPixels = vec2(anchorPos.x / anchorPos.w + 1.0, 1.0 - anchorPos.y / anchorPos.w) / 2.0 * viewportPixels;
    if (instanceClipRect.z >= 0.0 && text.cutoffPixels.x > 0.0) {
      float l = max(anchorPixels.x + xy.x, 0.0);
      float r = min(anchorPixels.x + xy.x + wh.x, viewportPixels.x);
      cutOff = r - l < text.cutoffPixels.x;
    }
    if (instanceClipRect.w >= 0.0 && text.cutoffPixels.y > 0.0) {
      float t = max(anchorPixels.y - xy.y - wh.y, 0.0);
      float b = min(anchorPixels.y - xy.y, viewportPixels.y);
      cutOff = cutOff || b - t < text.cutoffPixels.y;
    }
  }

#ifdef MODULE_COLLISION
  vec4 collisionRect = instanceRects * collision_getSize(instanceSizes) / text.fontSize;
  collisionRect.xy -= textBackground.padding.xy;
  collisionRect.zw += textBackground.padding.xy + textBackground.padding.zw;
  vec4 collisionClipRect = vec4(xy, wh);
  if (instanceClipRect.z >= 0.0) {
    collisionClipRect.x -= textBackground.padding.x;
    collisionClipRect.z += textBackground.padding.x + textBackground.padding.z;
  }
  if (instanceClipRect.w >= 0.0) {
    collisionClipRect.y -= textBackground.padding.y;
    collisionClipRect.w += textBackground.padding.y + textBackground.padding.w;
  }
  text_setCollisionBounds(instancePositions, instancePositions64Low,
    collisionRect, instancePixelOffsets, instanceAngles, collisionClipRect, textBackground.billboard, text.flipY);
#endif

  if (textBackground.billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    gl_Position = project_globe_billboard_clipspace(gl_Position, geometry.position.xyz);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
    // Hide backgrounds whose anchor is behind the globe; culling handles non-billboard ones
    if (project_globe_is_occluded(geometry.position.xyz)) {
      gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
    }
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    if (text.flipY) {
      offset_common.y *= -1.;
    }
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
  if (cutOff) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  }
#ifdef MODULE_COLLISION
  // Labels the visibility pass skips are hidden, so they reserve no space
  if (collision.sort && !textBackground.billboard && text_collisionCulled) {
    gl_Position = vec4(0.0, 0.0, 2.0, 1.0);
  }
  if (collision.visibilityPass) {
    // Billboard vertices share the anchor's depth, so this vertex's culling by the projection and
    // other vertex extensions applies to the whole label. Other labels decide from their corners.
    bool culled = textBackground.billboard
      ? gl_Position.w <= 0.0 || abs(gl_Position.z) > gl_Position.w
      : text_collisionCulled;
    // A culled copy of the label does not write its cell
    gl_Position = culled ? vec4(0.0, 0.0, 2.0, 1.0) : collision_getVisibilityPosition(positions);
  }
#endif
}
`;
