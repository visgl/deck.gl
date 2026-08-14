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
  float edgePixels = 0.0;
  if (pointCloud.antialiasing) {
    edgePixels = (1.0 - distToCenter) / max(fwidth(distToCenter), 1e-6);
  }

  if ((!pointCloud.antialiasing && distToCenter > 1.0) || edgePixels < -0.5) {
    discard;
  }

  fragColor = vColor;
  if (pointCloud.antialiasing) {
    fragColor.a *= smoothedge(0.0, edgePixels);
  }
  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
