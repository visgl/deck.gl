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
#define SHADER_NAME arc-brushing-layer-vertex-shader

//const float PI = 3.1415926536;
const float R_EARTH = 6371.0; // earth radius in km
const float N = 49.0;

attribute vec3 positions;
attribute vec4 instanceSourceColors;
attribute vec4 instanceTargetColors;
attribute vec4 instancePositions;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float renderPickingBuffer;

// uniform for brushing
uniform vec2 mousePos;
uniform float brushRadius;
uniform float enableBrushing;
uniform float brushSource;
uniform float brushTarget;

varying vec4 vColor;

// approximate distance bwtween lat lng in km
float distanceBetweenLatLng(vec2 source, vec2 target) {

  vec2 delta = (source - target) * PI / 180.0;

  float a =
    sin(delta.y / 2.0) * sin(delta.y / 2.0) +
    cos(source.y * PI / 180.0) * cos(target.y * PI / 180.0) *
    sin(delta.x / 2.0) * sin(delta.x / 2.0);

  float c = 2.0 * atan(sqrt(a), sqrt(1.0 - a));

  return R_EARTH * c;
}
// range is km
float isPointInRange(vec2 ptLatLng, vec2 mouseLatLng, float range, float enabled) {

  return float(enabled <= 0.0 || distanceBetweenLatLng(ptLatLng, mouseLatLng) <= range);
}

float paraboloid(vec2 source, vec2 target, float ratio) {

  vec2 x = mix(source, target, ratio);
  vec2 center = mix(source, target, 0.5);

  float dSourceCenter = distance(source, center);
  float dXCenter = distance(x, center);
  return (dSourceCenter + dXCenter) * (dSourceCenter - dXCenter);
}

void main(void) {
  vec2 source = preproject(instancePositions.xy);
  vec2 target = preproject(instancePositions.zw);
  float segmentRatio = smoothstep(0.0, 1.0, positions.x / N);

  // if not enabled return true
  float isSourceInBrush = isPointInRange(instancePositions.xy, mousePos, brushRadius, brushSource);
  float isTargetInBrush = isPointInRange(instancePositions.zw, mousePos, brushRadius, brushTarget);

  float isInBrush = float(enableBrushing <= 0. || (brushSource * isSourceInBrush > 0. || brushTarget * isTargetInBrush > 0.));

  // mix segIndex with brush, if not in brush, return 0
  float segIndex = mix(0.0, segmentRatio, isInBrush);

  float vertex_height = paraboloid(source, target, segIndex);
  if (vertex_height < 0.0) vertex_height = 0.0;
  vec3 p = vec3(
    // xy: linear interpolation of source & target
    mix(source, target, segIndex),
    // z: paraboloid interpolate of source & target
    sqrt(vertex_height)
  );

  gl_Position = project(vec4(p, 1.0));

  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio) / 255.;

  vColor = mix(
    vec4(color.rgb, color.a * opacity),
    vec4(instancePickingColors / 255., 1.),
    renderPickingBuffer
  );
}
