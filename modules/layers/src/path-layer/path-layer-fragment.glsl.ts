// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME path-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 vCornerOffset;
in float vMiterLength;
/*
 * vPathPosition represents the relative coordinates of the current fragment on the path segment.
 * vPathPosition.x - position along the width of the path, between [-1, 1]. 0 is the center line.
 * vPathPosition.y - position along the length of the path, between [0, L / width].
 */
in vec2 vPathPosition;
in float vPathLength;
in float vJointType;
in float vHalfWidthDevicePixels;

out vec4 fragColor;

void main(void) {
  geometry.uv = vPathPosition;

  bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
  bool isRound = vJointType > 0.5;

  if (isCorner) {
    // if joint is rounded, test distance from the corner
    if (isRound && length(vCornerOffset) > 1.0) {
      discard;
    }
    // trim miter
    if (!isRound && vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }
  fragColor = vColor;

  if (path.antialiasing) {
    // Signed distance to the outer silhouette, in units of half-width. Rounded joints and caps
    // are bounded by the corner offset; everywhere else the boundary is the edge of the stroke.
    // Only the across-width silhouette is feathered - consecutive segment instances abut along
    // the length of the path, so feathering there would leave a seam at every vertex.
    float edgeDistance = isRound && isCorner
      ? 1.0 - length(vCornerOffset)
      : 1.0 - abs(vPathPosition.x);
    // Spread the transition over exactly one device pixel, centered on the edge
    fragColor.a *= clamp(edgeDistance * vHalfWidthDevicePixels + 0.5, 0.0, 1.0);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
