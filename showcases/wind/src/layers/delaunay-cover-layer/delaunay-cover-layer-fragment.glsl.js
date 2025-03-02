// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME delaunay-cover-fragment-shader

varying vec4 vPosition;
varying vec4 vNormal;
varying vec4 vColor;

void main(void) {
  float lightWeight = getLightWeight(vPosition.xyz, vNormal.xzy);
  gl_FragColor = vec4(vColor.xyz * lightWeight, vColor.a);
}
`;
