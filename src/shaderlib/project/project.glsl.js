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
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

// ref: lib/constants.js
const float PROJECT_IDENTITY = 0.;
const float PROJECT_MERCATOR = 1.;
const float PROJECT_MERCATOR_OFFSETS = 2.;

uniform float projectionMode;
uniform float projectionScale;
uniform vec4 projectionCenter;
uniform vec3 projectionPixelsPerUnit;

uniform mat4 modelMatrix;
uniform mat4 projectionMatrix;

//
// Scaling offsets
//

// the scalar version of project_scale is for scaling the z component only
float project_scale(float meters) {
  return meters * projectionPixelsPerUnit.z;
}

vec2 project_scale(vec2 meters) {
  return meters * projectionPixelsPerUnit.xy;
}

vec3 project_scale(vec3 meters) {
  return vec3(
    project_scale(meters.xy),
    project_scale(meters.z)
  );
}

vec4 project_scale(vec4 meters) {
  return vec4(
    project_scale(meters.xyz),
    meters.w
  );
}

//
// Projecting positions
//

// non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 project_mercator_(vec2 lnglat) {
  return vec2(
    radians(lnglat.x) + PI,
    PI - log(tan_fp32(PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

vec4 project_position(vec4 position) {

  if (projectionMode == PROJECT_MERCATOR) {
    return vec4(
      project_mercator_(position.xy) * WORLD_SCALE * projectionScale,
      project_scale(position.z),
      position.w
    );
  }

  // Apply model matrix
  vec4 position_modelspace = modelMatrix * position;
  return project_scale(position_modelspace);
}

vec3 project_position(vec3 position) {
  vec4 projected_position = project_position(vec4(position, 1.0));
  return projected_position.xyz;
}

vec2 project_position(vec2 position) {
  vec4 projected_position = project_position(vec4(position, 0.0, 1.0));
  return projected_position.xy;
}

vec4 project_to_clipspace(vec4 position) {
  if (projectionMode == PROJECT_MERCATOR_OFFSETS) {
    position.w *= projectionPixelsPerUnit.z;
  }
  return projectionMatrix * position + projectionCenter;
}

// Backwards compatibility

float scale(float position) {
  return project_scale(position);
}

vec2 scale(vec2 position) {
  return project_scale(position);
}

vec3 scale(vec3 position) {
  return project_scale(position);
}

vec4 scale(vec4 position) {
  return project_scale(position);
}

vec2 preproject(vec2 position) {
  return project_position(position);
}

vec3 preproject(vec3 position) {
  return project_position(position);
}

vec4 preproject(vec4 position) {
  return project_position(position);
}

vec4 project(vec4 position) {
  return project_to_clipspace(position);
}
`;
