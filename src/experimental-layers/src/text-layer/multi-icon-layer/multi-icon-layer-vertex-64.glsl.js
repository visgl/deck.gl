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
#define SHADER_NAME multi-icon-layer-vertex-shader-64

attribute vec2 positions;

attribute vec3 instancePositions;
attribute vec2 instancePositions64xyLow;
attribute float instanceSizes;
attribute float instanceAngles;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute vec4 instanceIconFrames;
attribute float instanceColorModes;
attribute vec2 instanceOffsets;

// the following three attributes are for the multi-icon layer
attribute float instanceIndexOfIcon;
attribute float instanceNumOfIcon;
attribute vec2 instancePixelOffset;

uniform vec2 viewportSize;
uniform float sizeScale;
uniform vec2 iconsTextureDim;

varying float vColorMode;
varying vec4 vColor;
varying vec2 vTextureCoords;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = angle * PI / 180.0;
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

vec2 getShift(float instanceIndexOfIcon, float instanceNumOfIcon) {
  // calculate the middle index of the string
  float midIndex = (instanceNumOfIcon - 1.0) / 2.0;
  // calculate horizontal shift of each letter
  return vec2(instanceIndexOfIcon - midIndex, 0.0);
}

void main(void) {
  vec2 iconSize = instanceIconFrames.zw;
  // scale icon height to match instanceSize
  float instanceScale = iconSize.y == 0.0 ? 0.0 : instanceSizes / iconSize.y;

  // scale and rotate vertex in "pixel" value and convert back to fraction in clipspace
  vec2 shift = getShift(instanceIndexOfIcon, instanceNumOfIcon);
  vec2 pixelOffset = (positions / 2.0 + shift) * iconSize + instanceOffsets;

  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles) * sizeScale * instanceScale;
  pixelOffset += instancePixelOffset;
  pixelOffset.y *= -1.0;

  vec4 instancePositions64xy = vec4(
  instancePositions.x, instancePositions64xyLow.x,
  instancePositions.y, instancePositions64xyLow.y);

  vec2 projected_coord_xy[2];
  project_position_fp64(instancePositions64xy, projected_coord_xy);

  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = projected_coord_xy[0];
  vertex_pos_modelspace[1] = projected_coord_xy[1];
  vertex_pos_modelspace[2] = vec2(project_scale(instancePositions.z), 0.0);
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);
  gl_Position += project_pixel_to_clipspace(pixelOffset);

  vTextureCoords = mix(
    instanceIconFrames.xy,
    instanceIconFrames.xy + iconSize,
    (positions.xy + 1.0) / 2.0
  ) / iconsTextureDim;

  vTextureCoords.y = 1.0 - vTextureCoords.y;

  vColor = instanceColors / 255.;
  picking_setPickingColor(instancePickingColors);

  vColorMode = instanceColorModes;
}
`;
