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

attribute vec3 vertices;
attribute vec3 instancePositions;
attribute vec4 instanceCounts;
attribute vec3 instancePickingColors;

layout(std140) uniform;
uniform float opacity;
uniform vec3 cellScale;
uniform vec4 minColor;
uniform vec4 maxColor;
uniform AggregationData
{
  vec4 maxCount;
} aggregationData;

varying vec4 vColor;

void main(void) {
  float step = instanceCounts.g / aggregationData.maxCount.w;
  vec4 color = mix(minColor, maxColor, step) / 255.;
  vColor = vec4(color.rgb, color.a * opacity);

  // // Set color to be rendered to picking fbo (also used to check for selection highlight).
  // picking_setPickingColor(instancePickingColors);

  gl_Position = vec4(instancePositions + vertices * cellScale, 1.);
}
`;
