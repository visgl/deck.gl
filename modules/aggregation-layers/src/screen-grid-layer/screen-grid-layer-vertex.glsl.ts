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
#define SHADER_NAME screen-grid-layer-vertex-shader
#define RANGE_COUNT 6

in vec2 positions;
in vec2 instancePositions;
in float instanceWeights;
in vec3 instancePickingColors;

uniform float opacity;
uniform ivec2 binCount;
uniform vec2 gridSizeClipspace;
uniform vec2 cellSizeClipspace;
uniform vec2 colorDomain;
uniform sampler2D colorRange;

out vec4 vColor;
flat out int vIsValid;

void main(void) {
  vec2 pos = instancePositions * gridSizeClipspace + positions * cellSizeClipspace;
  pos.x = pos.x - 1.0;
  pos.y = 1.0 - pos.y;

  gl_Position = vec4(pos, 0., 1.);

  vIsValid = isnan(instanceWeights) ? 0 : 1;
  float r = min(max((instanceWeights - colorDomain.x) / (colorDomain.y - colorDomain.x), 0.), 1.);
  vec4 rangeColor = texture(colorRange, vec2(r, 0.5));

  vColor = vec4(rangeColor.rgb, rangeColor.a * opacity);

  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);
}
`;
