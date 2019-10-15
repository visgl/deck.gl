// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

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
