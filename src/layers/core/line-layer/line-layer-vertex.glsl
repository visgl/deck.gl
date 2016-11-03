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

// #pragma glslify: preproject = require(../../../../shaderlib/preproject)
// #pragma glslify: scale = require(../../../../shaderlib/scale)
// #pragma glslify: project = require(../../../../shaderlib/project)

attribute vec3 positions;
attribute vec4 instanceColors;
attribute vec4 instancePositions;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

void main(void) {
  vec2 source = preproject(instancePositions.xy);
  vec2 target = preproject(instancePositions.zw);

  float segmentIndex = positions.x;
  // xy: linear interpolation of source & target
  vec2 p = mix(source, target, segmentIndex);

  gl_Position = project(vec4(p, 0., 1.));

  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;
  vec4 pickingColor = vec4(instancePickingColors / 255., 1.);

  vColor = mix(
    color,
    pickingColor,
    renderPickingBuffer
  );
}
