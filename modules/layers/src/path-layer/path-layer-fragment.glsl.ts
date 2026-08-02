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

  bool isCorner = vPathPosition.y < 0.0 || vPathPosition.y > vPathLength;
  bool isRound = vJointType > 0.5;

  // Coordinates of the outer silhouette, in units of half-width: rounded joints and caps are
  // bounded by the corner offset, everywhere else by the edge of the stroke. Dividing by the
  // screen-space derivative converts the distance to the boundary into device pixels, which stays
  // correct under perspective foreshortening and under extensions that rescale the stroke or remap
  // vPathPosition (PathStyleExtension's offset does both).
  //
  // Derivatives are computed per 2x2 quad and are undefined once any invocation in the quad has
  // been discarded, so they are taken before the discards below - the same ordering the WGSL
  // shader uses. path.antialiasing is a uniform, so branching on it keeps control flow uniform
  // across the quad and costs nothing when the feature is off.
  //
  // Both coordinates are evaluated so each derivative stays on a single smooth field: a quad
  // straddling the corner/body boundary would otherwise difference two different fields. In
  // practice the two agree exactly at that boundary - where vPathPosition.y is 0 the offset is
  // perpendicular to the segment, so |vPathPosition.x| equals length(vCornerOffset) - which makes
  // the branched form very nearly equivalent. Keeping them separate costs one extra derivative
  // and avoids depending on that.
  float edgePixels = 0.0;
  if (path.antialiasing) {
    float bodyCoord = abs(vPathPosition.x);
    float cornerCoord = length(vCornerOffset);
    float bodyPixels = (1.0 - bodyCoord) / max(fwidth(bodyCoord), 1e-6);
    float cornerPixels = (1.0 - cornerCoord) / max(fwidth(cornerCoord), 1e-6);
    // Only the across-width silhouette is feathered - consecutive segment instances abut along
    // the length of the path, so feathering there would leave a seam at every vertex.
    edgePixels = isRound && isCorner ? cornerPixels : bodyPixels;
  }

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
    // Spread the transition over exactly one device pixel, centered on the edge
    fragColor.a *= clamp(edgePixels + 0.5, 0.0, 1.0);
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
