export default `
#define SHADER_NAME mesh-layer-vs

// Scale the model
uniform float sizeScale;

// Primitive attributes
attribute vec3 positions;
attribute vec3 normals;
attribute vec2 texCoords;

// Instance attributes
attribute vec3 instancePositions;
attribute vec2 instancePositions64xy;
attribute vec3 instanceRotations;
attribute vec4 instanceColors;
attribute vec3 instancePickingColors;

// Outputs to fragment shader
varying vec2 vTexCoord;
varying vec4 vColor;
varying float vLightWeight;

// yaw(z) pitch(y) roll(x)
mat3 getRotationMatrix(vec3 rotation) {
  float sr = sin(rotation.x);
  float sp = sin(rotation.y);
  float sw = sin(rotation.z);

  float cr = cos(rotation.x);
  float cp = cos(rotation.y);
  float cw = cos(rotation.z);

  return mat3(
    cw * cp,                  // 0,0
    sw * cp,                  // 1,0
    -sp,                      // 2,0
    -sw * cr + cw * sp * sr,  // 0,1
    cw * cr + sw * sp * sr,   // 1,1
    cp * sr,                  // 2,1
    sw * sr + cw * sp * cr,   // 0,2
    -cw * sr + sw * sp * cr,  // 1,2
    cp * cr                   // 2,2
  );
}

void main(void) {
  mat3 rotationMatrix = getRotationMatrix(instanceRotations);

  vec3 pos = positions;
  pos = project_scale(pos * sizeScale);
  pos = rotationMatrix * pos;

  if (project_uCoordinateSystem != COORDINATE_SYSTEM_LNG_LAT) {
    // Mercator projection reverses Y but this gets compensated
    // only for COORDINATE_SYSTEM_LNG_LAT inside the projection logic
    // TODO - handle this inside the projection module logic
    pos.y = -pos.y;
  }

  vec4 worldPosition;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);

  // TODO - transform normals

  picking_setPickingColor(instancePickingColors);

  vTexCoord = texCoords;
  vColor = instanceColors;
  vLightWeight = lighting_getLightWeight(worldPosition.xyz, project_normal(normals));
}
`;
