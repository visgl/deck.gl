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
#define SHADER_NAME scatterplot-brushing-ayer-vertex-shader
const float R_EARTH = 6371000.; // earth radius in km

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec3 instanceTargetPositions;
attribute float instanceRadius;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform float radiusScale;
uniform float radiusMinPixels;
uniform float radiusMaxPixels;
uniform float outline;
uniform float strokeWidth;

// uniform for brushing
uniform vec2 mousePos;
uniform float brushRadius;
uniform bool enableBrushing;
uniform float brushTarget;

varying vec4 vColor;
varying vec2 unitPosition;
varying float innerUnitRadius;

// approximate distance between lng lat in meters
float distanceBetweenLatLng(vec2 source, vec2 target) {

  vec2 delta = (source - target) * PI / 180.;

  float a =
    sin(delta.y / 2.) * sin(delta.y / 2.) +
    cos(source.y * PI / 180.) * cos(target.y * PI / 180.) *
    sin(delta.x / 2.) * sin(delta.x / 2.);

  float c = 2. * atan(sqrt(a), sqrt(1. - a));

  return R_EARTH * c;
}

// range is km
float isPointInRange(vec2 ptLatLng, vec2 mouseLatLng, float range, bool enabled) {

  return float(!enabled || distanceBetweenLatLng(ptLatLng, mouseLatLng) <= range);
}

void main(void) {

  // if enableBrushing is truthy calculate whether instancePosition is in range
  float isPtInBrush = isPointInRange(instancePositions.xy, mousePos, brushRadius, enableBrushing);

  // for use with arc layer, if brushTarget is truthy
  // calculate whether instanceTargetPositions is in range
  float isTargetInBrush = isPointInRange(instanceTargetPositions.xy, mousePos, brushRadius, true);

  // if brushTarget is falsy, when pt is in brush return true
  // if brushTarget is truthy and target is in brush return true
  // if brushTarget is truthy and pt is in brush return false
  float isInBrush = float(float(isPtInBrush > 0. && brushTarget <= 0.) > 0. ||
  float(brushTarget > 0. && isTargetInBrush > 0.) > 0.);

  float finalRadius = mix(0., instanceRadius, isInBrush);

  // Multiply out radius and clamp to limits
  float outerRadiusPixels = clamp(
    project_scale(radiusScale * finalRadius),
    radiusMinPixels, radiusMaxPixels
  );
  // outline is centered at the radius
  // outer radius needs to offset by half stroke width
  outerRadiusPixels += outline * mix(0., strokeWidth, isInBrush) / 2.;

  // position on the containing square in [-1, 1] space
  unitPosition = positions.xy;
  // 0 - solid circle, 1 - stroke with lineWidth=0
  innerUnitRadius = outline * (1. - strokeWidth / outerRadiusPixels);

  // Find the center of the point and add the current vertex
  vec3 center = project_position(instancePositions);
  vec3 vertex = positions * outerRadiusPixels;
  gl_Position = project_to_clipspace(vec4(center + vertex, 1.));

  // Apply opacity to instance color
  vColor = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;

  // Set picking color
  picking_setPickingColor(instancePickingColors);

}
`;
