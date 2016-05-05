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
#define SHADER_NAME scatterplot-layer-vs

uniform float mercatorZoom;
uniform vec2 mercatorCenter;
uniform vec4 viewport; // viewport: [x, y, width, height]
#pragma glslify: mercatorProject = require(../../shaderlib/mercator-project)
#pragma glslify: mercatorProjectViewport = require(../../shaderlib/mercator-project-viewport)

attribute vec3 vertices;
attribute vec3 positions;
attribute vec3 colors;

uniform float radius;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

varying vec3 vColor;
attribute vec3 pickingColors;
uniform float renderPickingBuffer;

void main(void) {
  vColor = mix(colors / 255.0, pickingColors / 255.0, renderPickingBuffer);

  // vec2 pos = mercatorProjectViewport(positions.xy, mercatorZoom, mercatorCenter, viewport);
  vec2 pos = mercatorProject(positions.xy, mercatorZoom);
  vec3 p = vec3(pos, positions.z) + vertices * radius;
  gl_Position = projectionMatrix * worldMatrix * vec4(p, 1.0);
}
