// Copyright (c) 2015 - 2018 Uber Technologies, Inc.
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
#define SHADER_NAME gpu-aggregation-to-grid-vs

attribute vec3 positions;
attribute vec3 positions64Low;
attribute vec3 weights;
uniform vec2 cellSize;
uniform vec2 gridSize;
uniform bool projectPoints;
uniform vec2 translation;
uniform vec3 scaling;

varying vec3 vWeights;

vec2 project_to_pixel(vec4 pos) {
  vec4 result;
  pos.xy = pos.xy/pos.w;
  result = pos + vec4(translation, 0., 0.);
  result.xy = scaling.z > 0. ? result.xy * scaling.xy : result.xy;
  return result.xy;
}

void main(void) {

  vWeights = weights;

  vec4 windowPos = vec4(positions, 1.);
  if (projectPoints) {
    windowPos = project_position_to_clipspace(positions, positions64Low, vec3(0));
  }

  vec2 pos = project_to_pixel(windowPos);

  vec2 pixelXY64[2];
  pixelXY64[0] = vec2(pos.x, 0.);
  pixelXY64[1] = vec2(pos.y, 0.);

  // Transform (0,0):windowSize -> (0, 0): gridSize
  vec2 gridXY64[2];
  gridXY64[0] = div_fp64(pixelXY64[0], vec2(cellSize.x, 0));
  gridXY64[1] = div_fp64(pixelXY64[1], vec2(cellSize.y, 0));
  float x = floor(gridXY64[0].x);
  float y = floor(gridXY64[1].x);
  pos = vec2(x, y);

  // Transform (0,0):gridSize -> (-1, -1):(1,1)
  pos = (pos * (2., 2.) / (gridSize)) - (1., 1.);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);

  // Enforce default value for ANGLE issue (https://bugs.chromium.org/p/angleproject/issues/detail?id=3941)
  gl_PointSize = 1.0;
}
`;
