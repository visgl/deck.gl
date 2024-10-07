// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME time-sliced-scatterplot-layer-vertex-shader-64

attribute vec3 positions;

attribute vec3 instancePositions;
attribute vec2 instancePositions64xyLow;
attribute float instanceRadius;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute float time;

// Only one-dimensional arrays may be declared in GLSL ES 1.0. specs p.24
uniform float currentTime;
uniform float opacity;
uniform float radiusScale;
uniform float radiusMinPixels;
uniform float radiusMaxPixels;
uniform float outline;
uniform float strokeWidth;
uniform float fadeFactor;

varying vec4 vColor;
varying vec2 unitPosition;
varying float innerUnitRadius;

void main(void) {
  // Multiply out radius and clamp to limits
  float outerRadiusPixels = clamp(
    project_size_to_pixels(radiusScale * instanceRadius),
    radiusMinPixels, radiusMaxPixels
  );

  // outline is centered at the radius
  // outer radius needs to offset by half stroke width
  outerRadiusPixels += outline * strokeWidth / 2.0;

  // position on the containing square in [-1, 1] space
  unitPosition = positions.xy;
  // 0 - solid circle, 1 - stroke with lineWidth=0
  innerUnitRadius = outline * (1.0 - strokeWidth / outerRadiusPixels);

  vec4 instancePositions64xy = vec4(
    instancePositions.x, instancePositions64xyLow.x,
    instancePositions.y, instancePositions64xyLow.y);

  vec2 projected_coord_xy[2];
  project_position_fp64(instancePositions64xy, projected_coord_xy);

  vec2 vertex_pos_localspace[4];
  vec4_fp64(vec4(positions * outerRadiusPixels, 0.0), vertex_pos_localspace);

  vec2 vertex_pos_modelspace[4];
  vertex_pos_modelspace[0] = sum_fp64(vertex_pos_localspace[0], projected_coord_xy[0]);
  vertex_pos_modelspace[1] = sum_fp64(vertex_pos_localspace[1], projected_coord_xy[1]);
  vertex_pos_modelspace[2] = sum_fp64(vertex_pos_localspace[2],
    vec2(project_size(instancePositions.z), 0.0));
  vertex_pos_modelspace[3] = vec2(1.0, 0.0);

  gl_Position = project_to_clipspace_fp64(vertex_pos_modelspace);

  picking_setPickingColor(instancePickingColors);
  float alpha = 1.0 - abs(currentTime - time) * fadeFactor;
  vColor = vec4(instanceColors.rgb / 255., alpha);
}
`;
