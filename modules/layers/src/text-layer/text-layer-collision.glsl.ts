// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// Shared by the background and character shaders so both test the same label footprint.
export default /* glsl */ `
#ifdef MODULE_COLLISION
// Whether the collision passes hide this label. Set from the label's corners, so every vertex of a
// label decides the same way.
bool text_collisionCulled = false;

void text_setCollisionBounds(
  vec3 worldPosition, vec3 position64Low, vec4 rect, vec2 pixelOffset,
  float angle, vec4 clipRect, bool billboard, bool flipY
) {
  if (collision.enabled) collision_useBounds = true;
  if (!collision.visibilityPass && !collision.sort) return;
  bool behindCamera = false;
  bool outsideDepth = true;
  for (int i = 0; i < 4; i++) {
    vec2 corner = vec2(i == 1 || i == 2 ? 1.0 : 0.0, i >= 2 ? 1.0 : 0.0);
    vec2 offset = rotate_by_angle(rect.xy + corner * rect.zw, angle) + pixelOffset;
    offset.y *= -1.0;
    if (clipRect.z >= 0.0) offset.x = clipRect.x + corner.x * clipRect.z;
    // Pair the corners like the background layer and the collision map, which flip the clipped
    // y like the default offset above; a rotated label otherwise leans the other way
    if (clipRect.w >= 0.0) offset.y = clipRect.y + (1.0 - corner.y) * clipRect.w;
    // Scale the offsets like the drawn geometry, e.g. DataFilterExtension's soft range
    vec4 position;
    if (billboard) {
      vec3 offsetPixels = vec3(offset, 0.0);
      DECKGL_FILTER_SIZE(offsetPixels, geometry);
      position = project_position_to_clipspace(worldPosition, position64Low, vec3(0.0));
      position.xy += project_pixel_size_to_clipspace(offsetPixels.xy);
    } else {
      vec3 offsetCommon = vec3(project_pixel_size(offset), 0.0);
      if (flipY) offsetCommon.y *= -1.0;
      DECKGL_FILTER_SIZE(offsetCommon, geometry);
      position = project_position_to_clipspace(worldPosition, position64Low, offsetCommon);
    }
    collision_corners[i] = (position.xy / position.w + 1.0) / 2.0;
    behindCamera = behindCamera || position.w <= 0.0;
    outsideDepth = outsideDepth && abs(position.z) > position.w;
  }
  // Corners behind the camera do not project to valid bounds, and the collision map's priority
  // depth would clip them at w = 0 instead of the near plane. A label that only crosses the near
  // or far plane is still tested; its bounds are clipped to the viewport by the bounds test.
  text_collisionCulled = behindCamera || outsideDepth;
}
#endif
`;
