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

/* vertex shader for the arc-layer */
#define SHADER_NAME arc-layer-vs

#pragma glslify: mercatorProject = require(../../../shaderlib/mercator-project)
uniform float mercatorScale;

const float N = 49.0;

attribute vec3 positions;
attribute vec3 instanceColors;
attribute vec4 instancePositions;
attribute vec3 instancePickingColors;

uniform mat4 worldMatrix;
uniform mat4 projectionMatrix;
uniform float opacity;
uniform float renderPickingBuffer;

varying vec4 vColor;

float paraboloid(vec2 source, vec2 target, float index) {
  float ratio = index / N;

  vec2 x = mix(source, target, ratio);
  vec2 center = mix(source, target, 0.5);

  float dSourceCenter = distance(source, center);
  float dXCenter = distance(x, center);
  return (dSourceCenter + dXCenter) * (dSourceCenter - dXCenter);
}

void main(void) {
  vec2 source = mercatorProject(instancePositions.xy, mercatorScale);
  vec2 target = mercatorProject(instancePositions.zw, mercatorScale);

  // TODO - are we only using x coordinate?
  float segmentIndex = positions.x;
  vec3 p = vec3(
    // xy: linear interpolation of source & target
    mix(source, target, segmentIndex / N),
    // z: paraboloid interpolate of source & target
    sqrt(paraboloid(source, target, segmentIndex))
  );

  gl_Position = projectionMatrix * vec4(p, 1.0);

  vec4 color = vec4(instanceColors / 255.0, opacity);
  vec4 pickingColor = vec4(instancePickingColors / 255.0, opacity);
  vColor = mix(color, pickingColor, renderPickingBuffer);
}
