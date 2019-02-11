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
#define SHADER_NAME arc-layer-vertex-shader

attribute vec3 positions;
attribute vec4 instanceSourceColors;
attribute vec4 instanceTargetColors;
attribute vec4 instancePositions;
attribute vec4 instancePositions64Low;
attribute vec3 instancePickingColors;
attribute float instanceWidths;

uniform float numSegments;
uniform float opacity;
uniform float widthScale;

varying vec4 vColor;

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);
  vec2 offset_screenspace = dir_screenspace * offset_direction * instanceWidths * widthScale / 2.0;
  vec2 offset_clipspace = project_pixel_to_clipspace(offset_screenspace).xy;
  return offset_clipspace;
}

float getSegmentRatio(float index) {
  return smoothstep(0.0, 1.0, index / (numSegments - 1.0));
}

// get angular distance in radian
float getAngularDist (vec2 source, vec2 target) {
  vec2 delta = source - target;
  float a =
    sin(delta.y / 2.0) * sin(delta.y / 2.0) +
    cos(source.y) * cos(target.y) *
    sin(delta.x / 2.0) * sin(delta.x / 2.0);
	return 2.0 * atan(sqrt(a), sqrt(1.0 - a));
}

vec2 interpolate (vec2 source, vec2 target, float angularDist, float t) {
// if the angularDist is PI, linear interpolation is applied. otherwise, use spherical interpolation
  if(abs(angularDist - PI) < 0.001) {
    return (1.0 - t) * source + t * target;
  }

	float a = sin((1.0 - t) * angularDist) / sin(angularDist);
	float b = sin(t * angularDist) / sin(angularDist);
	float x = a * cos(source.y) * cos(source.x) + b * cos(target.y) * cos(target.x);
	float y = a * cos(source.y) * sin(source.x) + b * cos(target.y) * sin(target.x);
	float z = a * sin(source.y) + b * sin(target.y);
	return vec2(atan(y, x), atan(z, sqrt(x * x + y * y)));
}

void main(void) {
  float segmentIndex = positions.x;
  float segmentRatio = getSegmentRatio(segmentIndex);
  
  // if it's the first point, use next - current as direction
  // otherwise use current - prev
  float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
  float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);
  
  vec2 source = radians(instancePositions.xy);
  vec2 target = radians(instancePositions.zw);
  
  float angularDist = getAngularDist(source, target);

  vec3 currPos = vec3(degrees(interpolate(source, target, angularDist, segmentRatio)), 0.0);
  vec3 nextPos = vec3(degrees(interpolate(source, target, angularDist, nextSegmentRatio)), 0.0);

  vec4 curr = project_position_to_clipspace(currPos, instancePositions64Low.xy, vec3(0.0));
  vec4 next = project_position_to_clipspace(nextPos, instancePositions64Low.zw, vec3(0.0));

  // extrude
  vec2 offset = getExtrusionOffset((next.xy - curr.xy) * indexDir, positions.y);
  gl_Position = curr + vec4(offset, 0.0, 0.0);
  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio) / 255.0;
  vColor = vec4(color.rgb, color.a * opacity);
  
  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);
}
`;
