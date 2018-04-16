export default `
#define SHADER_NAME bitmap-layer-vertex-shader

attribute vec3 positions;
attribute vec2 texCoords;

attribute vec4 instancePositions;
attribute vec2 instanceAngle;
attribute float instanceBitmapType;
attribute vec3 instancePickingColors;

uniform float opacity;
uniform vec2 imageSize;
uniform float layerIndex;

varying vec2 vTexCoord;
varying float vBitmapType;

void main(void) {
  vec2 offset = instancePositions.wz;
  vec2 cornerPosition = instancePositions.xy + positions.xy * imageSize;

  // Rotate and scale primitive vertex
  // float angle = instanceAngle.x;
  // mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));

  // Calculate vertex position
  vec2 vertex = project_position(cornerPosition);

  // Apply projection matrix
  gl_Position = project_to_clipspace(
    vec4(vertex, layerIndex * -0.01, 1.0)
  );

  vTexCoord = texCoords;
  vBitmapType = instanceBitmapType;

  picking_setPickingColor(instancePickingColors);
}
`;
