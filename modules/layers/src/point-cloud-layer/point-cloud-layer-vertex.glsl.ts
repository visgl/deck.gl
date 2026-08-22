// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
#define SHADER_NAME point-cloud-layer-vertex-shader

in vec3 positions;
in vec3 instanceNormals;
in vec4 instanceColors;
in vec3 instancePositions;
in vec3 instancePositions64Low;

out vec4 vColor;
out vec2 unitPosition;

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.normal = project_normal(instanceNormals);

  // Position on the enclosing triangle. Its edges are tangent to the unit circle.
  unitPosition = positions.xy;
  geometry.uv = unitPosition;
  geometry.pickingColor = picking_getPickingColorFromInstanceID();

  // Find the center of the point and add the current vertex
  vec3 offset = vec3(positions.xy * project_size_to_pixel(pointCloud.radiusPixels, pointCloud.sizeUnits), 0.0);
  DECKGL_FILTER_SIZE(offset, geometry);
#ifdef ANTIALIASING
  float triangleRadiusPixels = length(offset.xy);
  if (triangleRadiusPixels > 0.0) {
    // The triangle's inradius is half its vertex radius. Scaling its vertex radius by one device
    // pixel therefore adds half a device pixel around all three tangent points.
    float coverageScale = 1.0 + 1.0 / project.devicePixelRatio / triangleRadiusPixels;
    offset.xy *= coverageScale;
    unitPosition *= coverageScale;
    geometry.uv = unitPosition;
  }
#endif

  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.), geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);

  // Apply lighting
  vec3 lightColor = lighting_getLightColor(instanceColors.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);

  // Apply opacity to instance color, or return instance picking color
  vColor = vec4(lightColor, instanceColors.a * layer.opacity);
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
