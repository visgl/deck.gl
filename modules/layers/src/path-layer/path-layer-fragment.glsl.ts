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

out vec4 fragColor;

void main(void) {
  geometry.uv = vPathPosition;

#ifdef ANTIALIASING
  bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
  bool isRound = vJointType > 0.5;

  // Distance to the silhouette in device pixels, from the derivative of the coordinate that
  // bounds it. Computed before the discards below: derivatives are undefined once an invocation
  // in the quad has been discarded. See dev-docs/RFCs/v9.4/analytic-antialiasing-rfc.md
  float bodyCoord = abs(vPathPosition.x);
  float cornerCoord = length(vCornerOffset);
  // Both evaluated so each derivative stays on one field across the corner/body boundary
  float bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
  float cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
  // Rounded corners still intersect the stroke-width envelope. Extensions may remap
  // vPathPosition.x independently of vCornerOffset, as PathStyleExtension does for offsets.
  float edgePixels = isRound && isCorner ? min(cornerPixels, bodyPixels) : bodyPixels;

  // Fragments outside the coverage ramp must not write depth or picking colors.
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
    discard;
  }

  if (isCorner) {
    // trim miter
    if (!isRound && vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }
  fragColor = vColor;

  // Feather one device pixel across the width only - segments abut lengthwise, which would seam.
  // edgePixels is a signed device-pixel distance, and SMOOTH_EDGE_RADIUS is 0.5, so smoothedge
  // ramps across exactly one pixel centered on the edge.
  fragColor.a *= smoothedge(0.0, edgePixels);
#else
  if (vPathPosition.y < 0.0 || vPathPosition.y > vPathLength) {
    // if joint is rounded, test distance from the corner
    if (vJointType > 0.5 && length(vCornerOffset) > 1.0) {
      discard;
    }
    // trim miter
    if (vJointType < 0.5 && vMiterLength > path.miterLimit + 1.0) {
      discard;
    }
  }
  fragColor = vColor;
#endif

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
