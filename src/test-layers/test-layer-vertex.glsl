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

/* vertex shader for the scatterplot-layer */
#define SHADER_NAME test-layer-vs

#pragma glslify: random = require(../../shaderlib/random)

#pragma glslify: mercatorProject = require(../../shaderlib/mercator-project)
uniform float mercatorScale;

attribute vec3 positions;
attribute vec3 instancePositions;
attribute vec3 instanceColors;
attribute vec3 instancePickingColors;

uniform float radius;
uniform float opacity;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying vec4 vColor;
uniform float renderPickingBuffer;

void main(void) {
  gl_Position = vec4(positions, 1.0);
  // vec2 pos = mercatorProject(instancePositions.xy);
  // vec3 p = vec3(pos, instancePositions.z) + positions * radius;
  // // gl_Position = projectionMatrix * vec4(p, 1.0);
  // // float rand = random(pos);
  // // gl_Position = vec4(rand, rand, 0, 1.);

  // vec4 color = vec4(instanceColors / 255.0, 1.);
  // vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  // vColor = mix(color, pickingColor, renderPickingBuffer);

  // vec2 pos = mercatorProject(instancePositions.xy, mercatorScale);
  // vec3 p = vec3(pos, instancePositions.z) + positions * radius;
  // gl_Position = projectionMatrix * vec4(p, 1.0);

  // vec4 color = vec4(instanceColors / 255.0, 1.);
  // vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  // vColor = mix(color, pickingColor, renderPickingBuffer);
}
