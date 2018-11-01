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

// Inspired by screen-grid-layer vertex shader in deck.gl

export default `\
#version 300 es
#define SHADER_NAME gpu-grid-cell-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in vec4 instanceCounts;

// Custom uniforms
uniform float extruded;
uniform float cellSize;
uniform float coverage;
uniform float opacity;
uniform float elevationScale;

uniform vec2 gridSize;
uniform vec2 gridOrigin;
uniform vec2 gridOriginLow;
uniform vec2 gridOffset;
uniform vec2 gridOffsetLow;
uniform vec4 minColor;
uniform vec4 maxColor;
layout(std140) uniform;
uniform AggregationData
{
  vec4 maxCount;
} aggregationData;

#define ELEVATION_SCALE 100.

// Result
out vec4 vColor;

void main(void) {

  bool noRender = instanceCounts.r <= 0.0;

  float step = instanceCounts.r / aggregationData.maxCount.r;
  vec4 color = mix(minColor, maxColor, step) / 255.;

  // TODO: discard when noRender is true
  float finalCellSize = noRender ? 0.0 : project_scale(cellSize);


  float elevation = 0.0;

  if (extruded > 0.5) {
    elevation = instanceCounts.r  * (positions.z + 1.0) *
      ELEVATION_SCALE * elevationScale;
  }

  float yIndex = floor(float(gl_InstanceID) / gridSize[0]);
  float xIndex = float(gl_InstanceID) - (yIndex * gridSize[0]);

  // Keeping 32-bit calculations for debugging, to be removed.
  // float instancePositionX = gridOffset[0] * xIndex + gridOrigin[0];
  // float instancePositionY = gridOffset[1] * yIndex + gridOrigin[1];
  // vec3 extrudedPosition = vec3(instancePositionX, instancePositionY, elevation);
  // vec2 extrudedPosition64xyLow = vec2(0., 0.);

  vec2 instancePositionXFP64 = mul_fp64(vec2(gridOffset[0], gridOffsetLow[0]), vec2(xIndex, 0.));
  instancePositionXFP64 = sum_fp64(instancePositionXFP64, vec2(gridOrigin[0], gridOriginLow[0]));
  vec2 instancePositionYFP64 = mul_fp64(vec2(gridOffset[1], gridOffsetLow[1]), vec2(yIndex, 0.));
  instancePositionYFP64 = sum_fp64(instancePositionYFP64, vec2(gridOrigin[1], gridOriginLow[1]));
  vec3 extrudedPosition = vec3(instancePositionXFP64[0], instancePositionYFP64[0], elevation);
  vec2 extrudedPosition64xyLow = vec2(instancePositionXFP64[1], instancePositionYFP64[1]);

  vec3 offset = vec3(
    (positions.x * coverage + 1.0) / 2.0 * finalCellSize,
    (positions.y * coverage - 1.0) / 2.0 * finalCellSize,
    1.0);

  // extrude positions
  vec4 position_worldspace;
  gl_Position = project_position_to_clipspace(extrudedPosition, extrudedPosition64xyLow, offset, position_worldspace);

  float lightWeight = 1.0;

  if (extruded > 0.5) {
    lightWeight = lighting_getLightWeight(
      position_worldspace.xyz, // the w component is always 1.0
      normals
    );
  }

  vec3 lightWeightedColor = lightWeight * color.rgb;
  vColor = vec4(lightWeightedColor, color.a * opacity);
}
`;
