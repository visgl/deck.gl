// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Shared by the background and character shaders so both test the same label footprint.
export default /* glsl */ `
#ifdef MODULE_COLLISION
void text_setCollisionBounds(
  vec3 worldPosition, vec3 position64Low, vec4 rect, vec2 pixelOffset,
  float angle, vec4 clipRect, bool billboard, bool flipY
) {
  if (!collision.enabled) return;
  collision_useBounds = true;
  if (!collision.visibilityPass) return;
  for (int i = 0; i < 4; i++) {
    vec2 corner = vec2(i == 1 || i == 2 ? 1.0 : 0.0, i >= 2 ? 1.0 : 0.0);
    vec2 offset = rotate_by_angle(rect.xy + corner * rect.zw, angle) + pixelOffset;
    offset.y *= -1.0;
    if (clipRect.z >= 0.0) offset.x = clipRect.x + corner.x * clipRect.z;
    if (clipRect.w >= 0.0) offset.y = clipRect.y + corner.y * clipRect.w;
    vec4 position;
    if (billboard) {
      position = project_position_to_clipspace(worldPosition, position64Low, vec3(0.0));
      position.xy += project_pixel_size_to_clipspace(offset);
    } else {
      vec3 offsetCommon = vec3(project_pixel_size(offset), 0.0);
      if (flipY) offsetCommon.y *= -1.0;
      position = project_position_to_clipspace(worldPosition, position64Low, offsetCommon);
    }
    collision_corners[i] = (position.xy / position.w + 1.0) / 2.0;
  }
  // The projected corners' mean is inside the convex footprint, including under perspective.
  vec2 center = (collision_corners[0] + collision_corners[1] + collision_corners[2] + collision_corners[3]) / 4.0;
  collision_position = vec4(center * 2.0 - 1.0, 0.0, 1.0);
}
#endif
`;
