export default `
#define SHADER_NAME bitmap-layer-vertex-shader

attribute vec3 positions;
attribute vec2 texCoords;

attribute float instanceBitmapIndex;

attribute vec3 instanceCenter;
attribute vec3 instanceRotation;

varying vec2 vTexCoord;

varying float vBitmapIndex;

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
  mat3 rotationMatrix = getRotationMatrix(instanceRotation);
  
  // Calculate vertex position
  vec3 pos = positions * rotationMatrix + instanceCenter;
  vec3 vertex = project_position(pos);
  
  // Apply projection matrix
  gl_Position = project_to_clipspace(vec4(vertex, 1.0));

  vTexCoord = texCoords;
  vBitmapIndex = instanceBitmapIndex;
}
`;
