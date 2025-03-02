// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME particle-layer-fragment-shader

precision highp float;

varying vec4 vColor;
varying float vAltitude;

void main(void) {
  // if (vColor.a < 0.07) {
  // 	discard;
  // }
  if (vAltitude < -90.0) {
    discard;
  }

  vec2 diff = gl_PointCoord - vec2(.5);
  if (false && length(diff) > 0.5) {
    discard;
  }
  gl_FragColor = vColor;
}
`;
