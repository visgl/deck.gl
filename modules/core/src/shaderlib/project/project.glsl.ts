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

import {COORDINATE_SYSTEM, PROJECTION_MODE, UNIT} from '../../lib/constants';

// We are generating these from the js code in constants.js
const COORDINATE_SYSTEM_GLSL_CONSTANTS = Object.keys(COORDINATE_SYSTEM)
  .map(key => `const int COORDINATE_SYSTEM_${key} = ${COORDINATE_SYSTEM[key]};`)
  .join('');
const PROJECTION_MODE_GLSL_CONSTANTS = Object.keys(PROJECTION_MODE)
  .map(key => `const int PROJECTION_MODE_${key} = ${PROJECTION_MODE[key]};`)
  .join('');
const UNIT_GLSL_CONSTANTS = Object.keys(UNIT)
  .map(key => `const int UNIT_${key.toUpperCase()} = ${UNIT[key]};`)
  .join('');

export default `\
${COORDINATE_SYSTEM_GLSL_CONSTANTS}
${PROJECTION_MODE_GLSL_CONSTANTS}
${UNIT_GLSL_CONSTANTS}

uniform int project_uCoordinateSystem;
uniform int project_uProjectionMode;
uniform float project_uScale;
uniform bool project_uWrapLongitude;
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
uniform vec3 project_uCommonOrigin;
uniform bool project_uPseudoMeters;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);
const vec3 ZERO_64_LOW = vec3(0.0);
const float EARTH_RADIUS = 6370972.0; // meters
const float GLOBE_RADIUS = 256.0;

// returns an adjustment factor for uCommonUnitsPerMeter
float project_size_at_latitude(float lat) {
  float y = clamp(lat, -89.9, 89.9);
  return 1.0 / cos(radians(y));
}

float project_size() {
  if (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR &&
    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT &&
    project_uPseudoMeters == false) {

    // uCommonUnitsPerMeter in low-zoom Web Mercator is non-linear
    // Adjust by 1 / cos(latitude)
    // If geometry.position (vertex in common space) is populated, use it
    // Otherwise use geometry.worldPosition (anchor in world space)
    
    if (geometry.position.w == 0.0) {
      return project_size_at_latitude(geometry.worldPosition.y);
    }

    // latitude from common y: 2.0 * (atan(exp(y / TILE_SIZE * 2.0 * PI - PI)) - PI / 4.0)
    // Taylor series of 1 / cos(latitude)
    // Max error < 0.003
  
    float y = geometry.position.y / TILE_SIZE * 2.0 - 1.0;
    float y2 = y * y;
    float y4 = y2 * y2;
    float y6 = y4 * y2;
    return 1.0 + 4.9348 * y2 + 4.0587 * y4 + 1.5642 * y6;
  }
  return 1.0;
}

float project_size_at_latitude(float meters, float lat) {
  return meters * project_uCommonUnitsPerMeter.z * project_size_at_latitude(lat);
}

//
// Scaling offsets - scales meters to "world distance"
// Note the scalar version of project_size is for scaling the z component only
//
float project_size(float meters) {
  return meters * project_uCommonUnitsPerMeter.z * project_size();
}

vec2 project_size(vec2 meters) {
  return meters * project_uCommonUnitsPerMeter.xy * project_size();
}

vec3 project_size(vec3 meters) {
  return meters * project_uCommonUnitsPerMeter * project_size();
}

vec4 project_size(vec4 meters) {
  return vec4(meters.xyz * project_uCommonUnitsPerMeter, meters.w);
}

// Get rotation matrix that aligns the z axis with the given up vector
// Find 3 unit vectors ux, uy, uz that are perpendicular to each other and uz == up
mat3 project_get_orientation_matrix(vec3 up) {
  vec3 uz = normalize(up);
  // Tangent on XY plane
  vec3 ux = abs(uz.z) == 1.0 ? vec3(1.0, 0.0, 0.0) : normalize(vec3(uz.y, -uz.x, 0));
  vec3 uy = cross(uz, ux);
  return mat3(ux, uy, uz);
}

bool project_needs_rotation(vec3 commonPosition, out mat3 transform) {
  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {
    transform = project_get_orientation_matrix(commonPosition);
    return true;
  }
  return false;
}

//
// Projecting normal - transform deltas from current coordinate system to
// normals in the worldspace
//
vec3 project_normal(vec3 vector) {
  // Apply model matrix
  vec4 normal_modelspace = project_uModelMatrix * vec4(vector, 0.0);
  vec3 n = normalize(normal_modelspace.xyz * project_uCommonUnitsPerMeter);
  mat3 rotation;
  if (project_needs_rotation(geometry.position.xyz, rotation)) {
    n = rotation * n;
  }
  return n;
}

vec4 project_offset_(vec4 offset) {
  float dy = offset.y;
  vec3 commonUnitsPerWorldUnit = project_uCommonUnitsPerWorldUnit + project_uCommonUnitsPerWorldUnit2 * dy;
  return vec4(offset.xyz * commonUnitsPerWorldUnit, offset.w);
}

//
// Projecting positions - non-linear projection: lnglats => unit tile [0-1, 0-1]
//
vec2 project_mercator_(vec2 lnglat) {
  float x = lnglat.x;
  if (project_uWrapLongitude) {
    x = mod(x + 180., 360.0) - 180.;
  }
  float y = clamp(lnglat.y, -89.9, 89.9);
  return vec2(
    radians(x) + PI,
    PI + log(tan_fp32(PI * 0.25 + radians(y) * 0.5))
  ) * WORLD_SCALE;
}

vec3 project_globe_(vec3 lnglatz) {
  float lambda = radians(lnglatz.x);
  float phi = radians(lnglatz.y);
  float cosPhi = cos(phi);
  float D = (lnglatz.z / EARTH_RADIUS + 1.0) * GLOBE_RADIUS;

  return vec3(
    sin(lambda) * cosPhi,
    -cos(lambda) * cosPhi,
    sin(phi)
  ) * D;
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
        project_mercator_(position_world.xy),
        project_size_at_latitude(position_world.z, position_world.y),
        position_world.w
      );
    }
    if (project_uCoordinateSystem == COORDINATE_SYSTEM_CARTESIAN) {
      position_world.xyz += project_uCoordinateOrigin;
    }
  }
  if (project_uProjectionMode == PROJECTION_MODE_GLOBE) {
    if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      return vec4(
        project_globe_(position_world.xyz),
        position_world.w
      );
    }
  }
  if (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET) {
    if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT) {
      if (abs(position_world.y - project_uCoordinateOrigin.y) > 0.25) {
        // Too far from the projection center for offset mode to be accurate
        // Only use high parts
        return vec4(
          project_mercator_(position_world.xy) - project_uCommonOrigin.xy,
          project_size(position_world.z),
          position_world.w
        );
      }
    }
  }
  if (project_uProjectionMode == PROJECTION_MODE_IDENTITY ||
    (project_uProjectionMode == PROJECTION_MODE_WEB_MERCATOR_AUTO_OFFSET &&
    (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
     project_uCoordinateSystem == COORDINATE_SYSTEM_CARTESIAN))) {
    // Subtract high part of 64 bit value. Convert remainder to float32, preserving precision.
    position_world.xyz -= project_uCoordinateOrigin;
  }

  // Translation is already added to the high parts
  return project_offset_(position_world + project_uModelMatrix * vec4(position64Low, 0.0));
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
float project_size_to_pixel(float size, int unit) {
  if (unit == UNIT_METERS) return project_size_to_pixel(size);
  if (unit == UNIT_COMMON) return size * project_uScale;
  // UNIT_PIXELS
  return size;
}
float project_pixel_size(float pixels) {
  return pixels / project_uScale;
}
vec2 project_pixel_size(vec2 pixels) {
  return pixels / project_uScale;
}
`;
