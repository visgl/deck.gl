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
#define SHADER_NAME great-circle-layer-vertex-shader

attribute vec3 positions;
attribute vec4 instanceSourceColors;
attribute vec4 instanceTargetColors;
attribute vec3 instanceSourcePositions;
attribute vec3 instanceSourcePositions64Low;
attribute vec3 instanceTargetPositions;
attribute vec3 instanceTargetPositions64Low;
attribute vec3 instancePickingColors;
attribute float instanceWidths;

uniform float numSegments;
uniform float opacity;
uniform float widthScale;
uniform float widthMinPixels;
uniform float widthMaxPixels;

varying vec4 vColor;
varying vec2 uv;

// offset vector by strokeWidth pixels
// offset_direction is -1 (left) or 1 (right)
vec2 getExtrusionOffset(vec2 line_clipspace, float offset_direction, float width) {
  // normalized direction of the line
  vec2 dir_screenspace = normalize(line_clipspace * project_uViewportSize);
  // rotate by 90 degrees
  dir_screenspace = vec2(-dir_screenspace.y, dir_screenspace.x);

  return dir_screenspace * offset_direction * width / 2.0;
}

float getSegmentRatio(float index) {
  return smoothstep(0.0, 1.0, index / (numSegments - 1.0));
}

// get angular distance in radian
float getAngularDist (vec2 source, vec2 target) {
  vec2 delta = source - target;
  vec2 sin_half_delta = sin(delta / 2.0);
  float a =
    sin_half_delta.y * sin_half_delta.y +
    cos(source.y) * cos(target.y) *
    sin_half_delta.x * sin_half_delta.x;
  return 2.0 * atan(sqrt(a), sqrt(1.0 - a));
}

vec2 interpolate (vec2 source, vec2 target, float angularDist, float t) {
  // if the angularDist is PI, linear interpolation is applied. otherwise, use spherical interpolation
  if(abs(angularDist - PI) < 0.001) {
    return (1.0 - t) * source + t * target;
  }

  float a = sin((1.0 - t) * angularDist) / sin(angularDist);
  float b = sin(t * angularDist) / sin(angularDist);
  vec2 sin_source = sin(source);
  vec2 cos_source = cos(source);
  vec2 sin_target = sin(target);
  vec2 cos_target = cos(target);

  float x = a * cos_source.y * cos_source.x + b * cos_target.y * cos_target.x;
  float y = a * cos_source.y * sin_source.x + b * cos_target.y * sin_target.x;
  float z = a * sin_source.y + b * sin_target.y;
  return vec2(atan(y, x), atan(z, sqrt(x * x + y * y)));
}

void main(void) {
  geometry.worldPosition = instanceSourcePositions;
  geometry.worldPositionAlt = instanceTargetPositions;

  float segmentIndex = positions.x;
  float segmentRatio = getSegmentRatio(segmentIndex);
  uv = vec2(segmentRatio, positions.y);
  geometry.uv = uv;
  geometry.pickingColor = instancePickingColors;
  
  // if it's the first point, use next - current as direction
  // otherwise use current - prev
  float indexDir = mix(-1.0, 1.0, step(segmentIndex, 0.0));
  float nextSegmentRatio = getSegmentRatio(segmentIndex + indexDir);
  
  vec2 source = radians(instanceSourcePositions.xy);
  vec2 target = radians(instanceTargetPositions.xy);
  
  float angularDist = getAngularDist(source, target);

  vec3 currPos = vec3(degrees(interpolate(source, target, angularDist, segmentRatio)), 0.0);
  vec3 nextPos = vec3(degrees(interpolate(source, target, angularDist, nextSegmentRatio)), 0.0);

  vec3 currPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, segmentRatio);
  vec3 nextPos64Low = mix(instanceSourcePositions64Low, instanceTargetPositions64Low, nextSegmentRatio);

  vec4 curr = project_position_to_clipspace(currPos, currPos64Low, vec3(0.0), geometry.position);
  vec4 next = project_position_to_clipspace(nextPos, nextPos64Low, vec3(0.0));

  // Multiply out width and clamp to limits
  // mercator pixels are interpreted as screen pixels
  float widthPixels = clamp(
    project_size_to_pixel(instanceWidths * widthScale),
    widthMinPixels, widthMaxPixels
  );

  // extrude
  vec3 offset = vec3(
    getExtrusionOffset((next.xy - curr.xy) * indexDir, positions.y, widthPixels),
    0.0);
  DECKGL_FILTER_SIZE(offset, geometry);
  gl_Position = curr + vec4(project_pixel_size_to_clipspace(offset.xy), 0.0, 0.0);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vec4 color = mix(instanceSourceColors, instanceTargetColors, segmentRatio);
  vColor = vec4(color.rgb, color.a * opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
