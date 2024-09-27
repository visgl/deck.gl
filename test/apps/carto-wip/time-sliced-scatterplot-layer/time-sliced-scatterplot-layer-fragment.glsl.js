// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME time-sliced-scatterplot-layer-fragment-shader

precision highp float;

varying vec4 vColor;
varying vec2 unitPosition;
varying float innerUnitRadius;

void main(void) {

  float distToCenter = length(unitPosition);

  if (distToCenter <= 1.0 && distToCenter >= innerUnitRadius) {
    gl_FragColor = picking_filterPickingColor(gl_FragColor);
    gl_FragColor = vColor;
  } else {
    discard;
  }
}
`;
