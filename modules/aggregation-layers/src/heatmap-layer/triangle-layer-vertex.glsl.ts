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

// Inspired by screen-grid-layer vertex shader in deck.gl

export default `\
#version 300 es
#define SHADER_NAME heatp-map-layer-vertex-shader

uniform sampler2D maxTexture;

in vec3 positions;
in vec2 texCoords;

out vec2 vTexCoords;
out float vIntensityMin;
out float vIntensityMax;

void main(void) {
  gl_Position = project_position_to_clipspace(positions, vec3(0.0), vec3(0.0));
  vTexCoords = texCoords;
  vec4 maxTexture = texture(maxTexture, vec2(0.5));
  float maxValue = triangle.aggregationMode < 0.5 ? maxTexture.r : maxTexture.g;
  float minValue = maxValue * triangle.threshold;
  if (triangle.colorDomain[1] > 0.) {
    // if user specified custom domain use it.
    maxValue = triangle.colorDomain[1];
    minValue = triangle.colorDomain[0];
  }
  vIntensityMax = triangle.intensity / maxValue;
  vIntensityMin = triangle.intensity / minValue;
}
`;
