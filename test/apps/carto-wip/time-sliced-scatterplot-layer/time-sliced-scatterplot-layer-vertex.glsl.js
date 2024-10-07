// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME time-sliced-scatterplot-layer-vertex-shader

attribute vec3 positions;

attribute vec3 instancePositions;
attribute float instanceRadius;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;
attribute float time;

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

  // Find the center of the point and add the current vertex
  vec3 center = project_position(instancePositions);
  vec3 vertex = positions * outerRadiusPixels;
  gl_Position = project_to_clipspace(vec4(center + vertex, 1.0));

  // Apply opacity to instance color, or return instance picking color
  vec4 color = vec4(instanceColors.rgb, instanceColors.a * opacity) / 255.;

  color.a = 1.0 - abs(currentTime - time) * fadeFactor;

  picking_setPickingColor(instancePickingColors);
  vColor = color;
}
`;
