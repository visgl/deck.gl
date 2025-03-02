// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es

#define SHADER_NAME wboit-layer-fragment-shader

precision highp float;

in vec4 vColor;
in float isValid;

layout(location=0) out vec4 accumColor;
layout(location=1) out float accumAlpha;

float weight1(float z, float a) {
  return a;
}

float weight2(float z, float a) {
  return clamp(pow(min(1.0, a * 10.0) + 0.01, 3.0) * 1e8 * pow(1.0 - z * 0.9, 3.0), 1e-2, 3e3);
}

float weight3(float z, float a) {
  return a * (1.0 - z * 0.9) * 10.0;
}

void main(void) {
  if (isValid < 0.5) {
    discard;
  }

  vec4 color = vColor;
  DECKGL_FILTER_COLOR(color, geometry);
  color.rgb *= color.a;

  float w = weight3(gl_FragCoord.z, color.a);
  accumColor = vec4(color.rgb * w, color.a);
  accumAlpha = color.a * w;
}
`;
