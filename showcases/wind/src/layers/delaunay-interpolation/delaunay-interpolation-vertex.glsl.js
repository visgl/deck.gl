// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME delaunay-vertex-shader

uniform vec4 bbox;
uniform vec2 size;

attribute vec3 positions;
attribute vec3 data;

varying vec4 vColor;

void main(void) {
  float posX = mix(-1., 1., (positions.x - bbox.x) / (bbox.y - bbox.x));
  float posY = mix(-1., 1., (positions.y - bbox.z) / (bbox.w - bbox.z));
  vColor = vec4(data.xyz, positions.z);
  gl_Position = vec4(posX, posY, 0, 1);
}
`;
