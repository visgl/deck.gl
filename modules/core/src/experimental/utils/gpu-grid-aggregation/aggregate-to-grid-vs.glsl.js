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

attribute vec2 positions;
attribute vec2 positions64xyLow;
attribute float weights;
uniform vec2 windowSize;
uniform vec2 cellSize;
uniform vec2 gridSize;
uniform mat4 uProjectionMatrix;
uniform bool projectPoints;

varying float vWeights;

vec2 project_to_pixel(vec2 pos) {
  vec4 position = vec4(pos, 0., 1.);
  vec4 result =  uProjectionMatrix * position;
  return result.xy/result.w;
}

void main(void) {

  vWeights = weights;

  vec2 windowPos = positions;
  vec2 windowPos64xyLow = positions64xyLow;
  if (projectPoints) {
    windowPos = project_position(windowPos);
  }

  windowPos = project_to_pixel(windowPos);

  // Transform (0,0):windowSize -> (0, 0): gridSize
  vec2 pos = floor(windowPos / cellSize);

  // Transform (0,0):gridSize -> (-1, -1):(1,1)
  pos = (pos * (2., 2.) / (gridSize)) - (1., 1.);

  // Move to pixel center, pixel-size in screen sapce (2/gridSize) * 0.5 => 1/gridSize
  vec2 offset = 1.0 / gridSize;
  pos = pos + offset;

  gl_Position = vec4(pos, 0.0, 1.0);
}
`;
