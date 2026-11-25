// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME point-cloud-layer-fragment-shader

precision highp float;

in vec4 vColor;
in vec2 unitPosition;

out vec4 fragColor;

void main(void) {
  geometry.uv = unitPosition.xy;

  float distToCenter = length(unitPosition);

#ifdef ANTIALIASING
  float edgePixels = (1.0 - distToCenter) / max(fwidth(distToCenter), 1e-6);
  if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
#else
  if (distToCenter > 1.0) {
#endif
    discard;
  }

  fragColor = vColor;
#ifdef ANTIALIASING
  fragColor.a *= smoothedge(0.0, edgePixels);
#endif
  DECKGL_FILTER_COLOR(fragColor, geometry);
#ifdef WEIGHTED_SPLATTING
  gl_FragDepth = gl_FragCoord.z;
  if (pointCloud.splatPass != 0 && fragColor.a <= 0.0) {
    discard;
  }
  if (pointCloud.splatPass == 2) {
    // Keep contributions close to the nearest point surface.
    gl_FragDepth = max(0.0, gl_FragCoord.z - 0.000002);
    float coverage = max(1.0 - distToCenter * distToCenter, 0.0);
    float weight = max(coverage * coverage, 0.05) * fragColor.a;
    fragColor = vec4(fragColor.rgb * weight, weight);
  }
#endif
}
`;
