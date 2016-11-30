// Copyright (c) 2015 Uber Technologies, Inc.
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

#define SHADER_NAME line-layer-vertex-shader

attribute vec3 positions;
attribute vec3 instanceSourcePositions;
attribute vec3 instanceTargetPositions;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

void main(void) {
  // Position
  vec3 source = project_position(instanceSourcePositions);
  vec3 target = project_position(instanceTargetPositions);

  // linear interpolation of source & target to pick right coord
  float segmentIndex = positions.x;
  vec3 p = mix(source, target, segmentIndex);

  gl_Position = project_to_clipspace(vec4(p, 1.));

  // Color
  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);
  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
