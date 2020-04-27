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

import {COORDINATE_SYSTEM, PROJECTION_MODE} from '../../lib/constants';

// We are generating these from the js code in constants.js
const COORDINATE_SYSTEM_GLSL_CONSTANTS = Object.keys(COORDINATE_SYSTEM)
  .map(key => `const int COORDINATE_SYSTEM_${key} = ${COORDINATE_SYSTEM[key]};`)
  .join('');
const PROJECTION_MODE_GLSL_CONSTANTS = Object.keys(PROJECTION_MODE)
  .map(key => `const int PROJECTION_MODE_${key} = ${PROJECTION_MODE[key]};`)
  .join('');

export default `\
${COORDINATE_SYSTEM_GLSL_CONSTANTS}
${PROJECTION_MODE_GLSL_CONSTANTS}

uniform int project_uCoordinateSystem;
uniform int project_uProjectionMode;
uniform float project_uScale;
uniform bool project_uWrapLongitude;
uniform float project_uAntimeridian;
uniform vec3 project_uCommonUnitsPerMeter;
uniform vec3 project_uCommonUnitsPerWorldUnit;
uniform vec3 project_uCommonUnitsPerWorldUnit2;
uniform vec4 project_uCenter;
uniform mat4 project_uModelMatrix;
uniform mat4 project_uViewProjectionMatrix;
uniform vec2 project_uViewportSize;
uniform float project_uDevicePixelRatio;
uniform float project_uFocalDistance;
uniform vec3 project_uCameraPosition;
uniform vec3 project_uCoordinateOrigin;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
const vec3 ZERO_64_LOW = vec3(0.0);

//
// Scaling offsets - scales meters to "world distance"
// Note the scalar version of project_size is for scaling the z component only
//
float project_size(float meters) {
  return meters * project_uCommonUnitsPerMeter.z;
}

vec2 project_size(vec2 meters) {
  return meters * project_uCommonUnitsPerMeter.xy;
}

vec3 project_size(vec3 meters) {
  return meters * project_uCommonUnitsPerMeter;
}

vec4 project_size(vec4 meters) {
  return vec4(meters.xyz * project_uCommonUnitsPerMeter, meters.w);
}

//
// Projecting normal - transform deltas from current coordinate system to
// normals in the worldspace
//
vec3 project_normal(vec3 vector) {
  // Apply model matrix
  vec4 normal_modelspace = project_uModelMatrix * vec4(vector, 0.0);
  return normalize(normal_modelspace.xyz * project_uCommonUnitsPerMeter);
}

vec4 project_offset_(vec4 offset) {
  float dy = offset.y;
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
    dy = clamp(dy, -1., 1.);
  }
  vec3 commonUnitsPerWorldUnit = project_uCommonUnitsPerWorldUnit + project_uCommonUnitsPerWorldUnit2 * dy;
  return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}

//
// Projecting positions - non-linear projection: lnglats => unit tile [0-1, 0-1]
//
vec2 project_mercator_(vec2 lnglat) {
  float x = lnglat.x;
  if (project_uWrapLongitude) {
    x = mod(x - project_uAntimeridian, 360.0) + project_uAntimeridian;
  }
  return vec2(
    radians(x) + PI,
    PI + log(tan_fp32(PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

//
// Projects positions (defined by project_uCoordinateSystem) to common space (defined by project_uProjectionMode)
//
vec4 project_position(vec4 position, vec3 position64Low) {
  vec4 position_world = project_uModelMatrix * position;

  // Work around for a Mac+NVIDIA bug https://github.com/visgl/deck.gl/issues/4145
  if (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR) {
    if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4(
        project_mercator_(position_world.xy) * WORLD_SCALE,
        project_size(position_world.z),
        position_world.w
      );
    }
  }
  if (project_uProjectionMode == PROJECTION_MODE_IDENTITY ||
    (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
    (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
     project_uCoordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
    // Subtract high part of 64 bit value. Convert remainder to float32, preserving precision.
    position_world.xyz -= project_uCoordinateOrigin;
    // Translation is already added to the high parts
    position_world += project_uModelMatrix * vec4(position64Low, 0.0);
  }

  return project_offset_(position_world);
}

vec4 project_position(vec4 position) {
  return project_position(position, ZERO_64_LOW);
}

vec3 project_position(vec3 position, vec3 position64Low) {
  vec4 projected_position = project_position(vec4(position, 1.0), position64Low);
  return projected_position.xyz;
}

vec3 project_position(vec3 position) {
  vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_LOW);
  return projected_position.xyz;
}

vec2 project_position(vec2 position) {
  vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_LOW);
  return projected_position.xy;
}

vec4 project_common_position_to_clipspace(vec4 position, mat4 viewProjectionMatrix, vec4 center) {
  return viewProjectionMatrix * position + center;
}

//
// Projects from common space coordinates to clip space.
// Uses project_uViewProjectionMatrix
//
vec4 project_common_position_to_clipspace(vec4 position) {
  return project_common_position_to_clipspace(position, project_uViewProjectionMatrix, project_uCenter);
}

// Returns a clip space offset that corresponds to a given number of screen pixels
vec2 project_pixel_size_to_clipspace(vec2 pixels) {
  vec2 offset = pixels / project_uViewportSize * project_uDevicePixelRatio * 2.0;
  return offset * project_uFocalDistance;
}

float project_size_to_pixel(float meters) {
  return project_size(meters) * project_uScale;
}
float project_pixel_size(float pixels) {
  return pixels / project_uScale;
}
vec2 project_pixel_size(vec2 pixels) {
  return pixels / project_uScale;
}
`;
