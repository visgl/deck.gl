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

vec2 toRadian(vec2 v) {
  return v / 180.0 * PI;
}

vec2 toDegree(vec2 v) {
  return v * 180.0 / PI;
}

float getAngularDist (vec2 source, vec2 target) {
  vec2 delta = source - target;
  float a = 
    sin(delta.y * 0.5) * sin(delta.y * 0.5) + 
    cos(source.y * PI / 180.) * cos(target.y * PI / 180.) * 
    sin(delta.x / 2.0) * sin(delta.x / 2.);
	return 2.0 * atan(sqrt(a), sqrt(1.0 - a));
}

vec2 interpolate (vec2 source, vec2 target, float t) {
	float angularDist = getAngularDist(source, target);
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
  
  vec2 source = toRadian(instancePositions.xy);
  vec2 target = toRadian(instancePositions.zw);
  
  vec3 currPos = project_position(vec3(toDegree(interpolate(source, target, segmentRatio)), 0.0));
  vec3 nextPos = project_position(vec3(toDegree(interpolate(source, target, nextSegmentRatio)), 0.0));
  vec4 curr = project_to_clipspace(vec4(currPos, 1.0));
  vec4 next = project_to_clipspace(vec4(nextPos, 1.0));
  
  // extrude
  vec2 offset = getExtrusionOffset((next.xy - curr.xy) * indexDir, positions.y);
  gl_Position = curr + vec4(offset, 0.0, 0.0);
  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio) / 255.;
  vColor = vec4(color.rgb, color.a * opacity);
  
  // Set color to be rendered to picking fbo (also used to check for selection highlight).
  picking_setPickingColor(instancePickingColors);
}
`;
