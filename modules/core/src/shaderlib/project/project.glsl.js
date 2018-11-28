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

import {PROJECT_COORDINATE_SYSTEM} from './constants';

// We are generating these from the js code in constants.js
const COORDINATE_SYSTEM_GLSL_CONSTANTS = Object.keys(PROJECT_COORDINATE_SYSTEM)
  .map(key => `const float COORDINATE_SYSTEM_${key} = ${PROJECT_COORDINATE_SYSTEM[key]}.;`)
  .join('');

export default `\
${COORDINATE_SYSTEM_GLSL_CONSTANTS}

uniform float project_uCoordinateSystem;
uniform float project_uScale;
uniform bool project_uWrapLongitude;
uniform float project_uAntimeridian;
uniform vec3 project_uPixelsPerMeter;
uniform vec3 project_uPixelsPerDegree;
uniform vec3 project_uPixelsPerUnit;
uniform vec3 project_uPixelsPerUnit2;
uniform vec4 project_uCenter;
uniform mat4 project_uModelMatrix;
uniform mat4 project_uViewProjectionMatrix;
uniform vec2 project_uViewportSize;
uniform float project_uDevicePixelRatio;
uniform float project_uFocalDistance;
uniform vec3 project_uCameraPosition;
uniform vec2 project_coordinate_origin;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
const vec2 ZERO_64_XY_LOW = vec2(0.0, 0.0);

//
// Scaling offsets - scales meters to "pixels"
// Note the scalar version of project_scale is for scaling the z component only
//
float project_scale(float meters) {
  return meters * project_uPixelsPerMeter.z;
}

vec2 project_scale(vec2 meters) {
  return meters * project_uPixelsPerMeter.xy;
}

vec3 project_scale(vec3 meters) {
  return meters * project_uPixelsPerMeter;
}

vec4 project_scale(vec4 meters) {
  return vec4(meters.xyz * project_uPixelsPerMeter, meters.w);
}

//
// Projecting normal - transform deltas from current coordinate system to
// normals in the worldspace
//
vec3 project_normal(vec3 vector) {
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNG_LAT ||
    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    return normalize(vector * project_uPixelsPerDegree);
  }
  // Apply model matrix
  vec4 normal_modelspace = project_uModelMatrix * vec4(vector, 0.0);
  return normalize(normal_modelspace.xyz * project_uPixelsPerMeter);
}

vec4 project_offset_(vec4 offset) {
  float dy = offset.y;
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_AUTO_OFFSET) {
    dy = clamp(dy, -1., 1.);
  }
  vec3 pixelsPerUnit = project_uPixelsPerUnit + project_uPixelsPerUnit2 * dy;
  return vec4(offset.xyz * pixelsPerUnit, offset.w);
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
    PI - log(tan_fp32(PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

//
// Projects lnglats (or meter offsets, depending on mode) to pixels
//
vec4 project_position(vec4 position, vec2 position64xyLow) {
  // TODO - why not simply subtract center and fall through?
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNG_LAT) {
    return project_uModelMatrix * vec4(
      project_mercator_(position.xy) * WORLD_SCALE * project_uScale,
      project_scale(position.z),
      position.w
    );
  }

  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_AUTO_OFFSET) {
    // Subtract high part of 64 bit value. Convert remainder to float32, preserving precision.
    float X = position.x - project_coordinate_origin.x;
    float Y = position.y - project_coordinate_origin.y;
    return project_offset_(vec4(X + position64xyLow.x, Y + position64xyLow.y, position.z, position.w));
  }

  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    return project_offset_(position);
  }

  // METER_OFFSETS or IDENTITY
  // Apply model matrix
  vec4 position_modelspace = project_uModelMatrix * position;
  return project_offset_(position_modelspace);
}

vec4 project_position(vec4 position) {
  return project_position(position, ZERO_64_XY_LOW);
}

vec3 project_position(vec3 position, vec2 position64xyLow) {
  vec4 projected_position = project_position(vec4(position, 1.0), position64xyLow);
  return projected_position.xyz;
}

vec3 project_position(vec3 position) {
  vec4 projected_position = project_position(vec4(position, 1.0), ZERO_64_XY_LOW);
  return projected_position.xyz;
}

vec2 project_position(vec2 position) {
  vec4 projected_position = project_position(vec4(position, 0.0, 1.0), ZERO_64_XY_LOW);
  return projected_position.xy;
}

//
// Projects from "world" coordinates to clip space.
// Uses project_uViewProjectionMatrix
//
vec4 project_to_clipspace(vec4 position) {
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_METER_OFFSETS ||
    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    // Needs to be divided with project_uPixelsPerMeter
    position.w *= project_uPixelsPerMeter.z;
  }
  return project_uViewProjectionMatrix * position + project_uCenter;
}

// Returns a clip space offset that corresponds to a given number of **non-device** pixels
vec4 project_pixel_to_clipspace(vec2 pixels) {
  vec2 offset = pixels / project_uViewportSize * project_uDevicePixelRatio * 2.0;
  return vec4(offset * project_uFocalDistance, 0.0, 0.0);
}
`;
