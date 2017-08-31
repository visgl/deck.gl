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
// EXTERNAL CONSTANTS: these must match JavaScript constants in "src/lib/constants.js"
const float COORDINATE_SYSTEM_IDENTITY = 0.;
const float COORDINATE_SYSTEM_LNG_LAT = 1.;
const float COORDINATE_SYSTEM_METER_OFFSETS = 2.;

uniform float project_uMode;
uniform float project_uScale;
uniform vec3 project_uPixelsPerUnit;
uniform vec4 project_uCenter;
uniform mat4 project_uModelMatrix;
uniform mat4 project_uViewProjectionMatrix;
uniform vec2 project_uViewportSize;
uniform float project_uDevicePixelRatio;
uniform float project_uFocalDistance;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

//
// Scaling offsets
// Scales meters to "pixels"
//

// Note the scalar version of project_scale is for scaling the z component only
float project_scale(float meters) {
  return meters * project_uPixelsPerUnit.z;
}

vec2 project_scale(vec2 meters) {
  return meters * project_uPixelsPerUnit.xy;
}

vec3 project_scale(vec3 meters) {
  return vec3(project_scale(meters.xy), project_scale(meters.z));
}

vec4 project_scale(vec4 meters) {
  return vec4(project_scale(meters.xyz), meters.w);
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

//
// projects lnglats (or meter offsets, depending on mode) to pixels
//
vec4 project_position(vec4 position) {
  // TODO - why not simply subtract center and fall through?
  if (project_uMode == COORDINATE_SYSTEM_LNG_LAT) {
    return vec4(
      project_mercator_(position.xy) * WORLD_SCALE * project_uScale,
      project_scale(position.z),
      position.w
    );
  }

  // Apply model matrix
  vec4 position_modelspace = project_uModelMatrix * position;
  return project_scale(position_modelspace);
}

vec3 project_position(vec3 position) {
  vec4 projected_position = project_position(vec4(position, 1.0));
  return projected_position.xyz;
}

//
//
vec2 project_position(vec2 position) {
  vec4 projected_position = project_position(vec4(position, 0.0, 1.0));
  return projected_position.xy;
}

//
// Projects from "pixel" coordinates to clip space
// Uses project_uViewProjectionMatrix
//
vec4 project_to_clipspace(vec4 position) {
  if (project_uMode == COORDINATE_SYSTEM_METER_OFFSETS) {
    // Needs to be divided with project_uPixelsPerUnit
    position.w *= project_uPixelsPerUnit.z;
  }
  return project_uViewProjectionMatrix * position + project_uCenter;
}

// Returns a clip space offset that corresponds to a given number of **non-device** pixels
vec4 project_pixel_to_clipspace(vec2 pixels) {
  vec2 offset = pixels / project_uViewportSize * project_uDevicePixelRatio;
  return vec4(offset * project_uFocalDistance, 0.0, 0.0);
}

// // Returns a clip space offset that corresponds to a given number of **device** pixels
// vec2 project_devicePixelOffset_toClipspace(vec2 pixels) {
//   return pixels / project_uViewportSize;
// }

// // Adds a pixel offset that does vary with distance
// // Note that for consistent results, pixels are logical pixels, not device pixels
// //
// vec4 project_add_absolutePixelOffset_toClipspace(vec4 position, vec2 pixels) {
//   vec2 clipspaceOffset = pixels / project_uViewportSize * project_uDevicePixelRatio;
//   clipspaceOffset = clipspaceOffset * position.w;
//   return position + vec4(clipspaceOffset, 0.0, 0.0);
// }

// // Adds a pixel offset that does vary with distance
// // Note that for consistent results, pixels are logical pixels, not device pixels
// //
// vec4 project_add_perspective_pixel_offset_to_clipspace(vec4 position, vec2 pixels) {
//   vec2 clipspaceOffset = pixels / project_uViewportSize * project_uDevicePixelRatio;
//   return position + vec4(clipspaceOffset, 0.0, 0.0);
// }

// Convenience

// vec4 project_position(vec4 position) {
//   return project_position_to_pixels(position);
// }

// vec4 project_to_clipspace(vec4 position) {
//   return project_pixels_to_clipspace(position);
// }
`;
