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

/* fragment shader for the hexagon-layer */
#define SHADER_NAME hexagon-layer-vertex-shader

#pragma glslify: project = require(../../../shaderlib/project)

attribute vec3 positions;
attribute vec2 instancePositions;
attribute float instanceElevations;
attribute vec3 instanceColors;
attribute vec3 instancePickingColors;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;

uniform float radius;
uniform float opacity;
uniform float angle;
uniform float elevation;

uniform float renderPickingBuffer;
uniform vec3 selected;
varying vec4 vColor;

void main(void) {
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec3 vertex = vec3(vec2(rotationMatrix * positions.xz * radius), 0.0);
  vec3 center = vec3(
    project(instancePositions),
    instanceElevations * (positions.y + 0.5) * elevation
  );

  gl_Position = projectionMatrix * vec4(center, 1.0) +
                projectionMatrix * vec4(vertex, 0.0);

  vec4 color = vec4(instanceColors / 255.0, opacity);
  vec4 pickingColor = vec4(instancePickingColors / 255.0, 1.);
  vColor = mix(color, pickingColor, renderPickingBuffer);
}
