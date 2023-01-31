export default `\
#define SHADER_NAME text-background-layer-vertex-shader

attribute vec2 positions;

attribute vec3 instancePositions;
attribute vec3 instancePositions64Low;
attribute vec4 instanceRects;
attribute float instanceSizes;
attribute float instanceAngles;
attribute vec2 instancePixelOffsets;
attribute float instanceLineWidths;
attribute vec4 instanceFillColors;
attribute vec4 instanceLineColors;
attribute vec3 instancePickingColors;

uniform bool billboard;
uniform float opacity;
uniform float sizeScale;
uniform float sizeMinPixels;
uniform float sizeMaxPixels;
uniform vec4 padding;
uniform int sizeUnits;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying float vLineWidth;
varying vec2 uv;
varying vec2 dimensions;

vec2 rotate_by_angle(vec2 vertex, float angle) {
  float angle_radian = radians(angle);
  float cos_angle = cos(angle_radian);
  float sin_angle = sin(angle_radian);
  mat2 rotationMatrix = mat2(cos_angle, -sin_angle, sin_angle, cos_angle);
  return rotationMatrix * vertex;
}

void main(void) {
  geometry.worldPosition = instancePositions;
  geometry.uv = positions;
  geometry.pickingColor = instancePickingColors;
  uv = positions;
  vLineWidth = instanceLineWidths;

  // convert size in meters to pixels, then scaled and clamp

  // project meters to pixels and clamp to limits
  float sizePixels = clamp(
    project_size_to_pixel(instanceSizes * sizeScale, sizeUnits),
    sizeMinPixels, sizeMaxPixels
  );

  dimensions = instanceRects.zw * sizePixels + padding.xy + padding.zw;

  vec2 pixelOffset = (positions * instanceRects.zw + instanceRects.xy) * sizePixels + mix(-padding.xy, padding.zw, positions);
  pixelOffset = rotate_by_angle(pixelOffset, instanceAngles);
  pixelOffset += instancePixelOffsets;
  pixelOffset.y *= -1.0;

  if (billboard)  {
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, vec3(0.0), geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
    vec3 offset = vec3(pixelOffset, 0.0);
    DECKGL_FILTER_SIZE(offset, geometry);
    gl_Position.xy += project_pixel_size_to_clipspace(offset.xy);
  } else {
    vec3 offset_common = vec3(project_pixel_size(pixelOffset), 0.0);
    DECKGL_FILTER_SIZE(offset_common, geometry);
    gl_Position = project_position_to_clipspace(instancePositions, instancePositions64Low, offset_common, geometry.position);
    DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
  }

  // Apply opacity to instance color, or return instance picking color
  vFillColor = vec4(instanceFillColors.rgb, instanceFillColors.a * opacity);
  DECKGL_FILTER_COLOR(vFillColor, geometry);
  vLineColor = vec4(instanceLineColors.rgb, instanceLineColors.a * opacity);
  DECKGL_FILTER_COLOR(vLineColor, geometry);
}
`;
