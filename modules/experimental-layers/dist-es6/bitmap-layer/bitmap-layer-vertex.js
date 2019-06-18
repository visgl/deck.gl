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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9iaXRtYXAtbGF5ZXIvYml0bWFwLWxheWVyLXZlcnRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxlQUFnQjs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Q0FBaEIiLCJzb3VyY2VzQ29udGVudCI6WyJleHBvcnQgZGVmYXVsdCBgXG4jZGVmaW5lIFNIQURFUl9OQU1FIGJpdG1hcC1sYXllci12ZXJ0ZXgtc2hhZGVyXG5cbmF0dHJpYnV0ZSB2ZWMzIHBvc2l0aW9ucztcbmF0dHJpYnV0ZSB2ZWMyIHRleENvb3JkcztcblxuYXR0cmlidXRlIGZsb2F0IGluc3RhbmNlQml0bWFwSW5kZXg7XG5cbmF0dHJpYnV0ZSB2ZWMzIGluc3RhbmNlQ2VudGVyO1xuYXR0cmlidXRlIHZlYzMgaW5zdGFuY2VSb3RhdGlvbjtcblxudmFyeWluZyB2ZWMyIHZUZXhDb29yZDtcblxudmFyeWluZyBmbG9hdCB2Qml0bWFwSW5kZXg7XG5cbm1hdDMgZ2V0Um90YXRpb25NYXRyaXgodmVjMyByb3RhdGlvbikge1xuICBmbG9hdCBzciA9IHNpbihyb3RhdGlvbi54KTtcbiAgZmxvYXQgc3AgPSBzaW4ocm90YXRpb24ueSk7XG4gIGZsb2F0IHN3ID0gc2luKHJvdGF0aW9uLnopO1xuXG4gIGZsb2F0IGNyID0gY29zKHJvdGF0aW9uLngpO1xuICBmbG9hdCBjcCA9IGNvcyhyb3RhdGlvbi55KTtcbiAgZmxvYXQgY3cgPSBjb3Mocm90YXRpb24ueik7XG5cbiAgcmV0dXJuIG1hdDMoXG4gICAgY3cgKiBjcCwgICAgICAgICAgICAgICAgICAvLyAwLDBcbiAgICBzdyAqIGNwLCAgICAgICAgICAgICAgICAgIC8vIDEsMFxuICAgIC1zcCwgICAgICAgICAgICAgICAgICAgICAgLy8gMiwwXG4gICAgLXN3ICogY3IgKyBjdyAqIHNwICogc3IsICAvLyAwLDFcbiAgICBjdyAqIGNyICsgc3cgKiBzcCAqIHNyLCAgIC8vIDEsMVxuICAgIGNwICogc3IsICAgICAgICAgICAgICAgICAgLy8gMiwxXG4gICAgc3cgKiBzciArIGN3ICogc3AgKiBjciwgICAvLyAwLDJcbiAgICAtY3cgKiBzciArIHN3ICogc3AgKiBjciwgIC8vIDEsMlxuICAgIGNwICogY3IgICAgICAgICAgICAgICAgICAgLy8gMiwyXG4gICk7XG59XG5cbnZvaWQgbWFpbih2b2lkKSB7XG4gIG1hdDMgcm90YXRpb25NYXRyaXggPSBnZXRSb3RhdGlvbk1hdHJpeChpbnN0YW5jZVJvdGF0aW9uKTtcbiAgXG4gIC8vIENhbGN1bGF0ZSB2ZXJ0ZXggcG9zaXRpb25cbiAgdmVjMyBwb3MgPSBwb3NpdGlvbnMgKiByb3RhdGlvbk1hdHJpeCArIGluc3RhbmNlQ2VudGVyO1xuICB2ZWMzIHZlcnRleCA9IHByb2plY3RfcG9zaXRpb24ocG9zKTtcbiAgXG4gIC8vIEFwcGx5IHByb2plY3Rpb24gbWF0cml4XG4gIGdsX1Bvc2l0aW9uID0gcHJvamVjdF90b19jbGlwc3BhY2UodmVjNCh2ZXJ0ZXgsIDEuMCkpO1xuXG4gIHZUZXhDb29yZCA9IHRleENvb3JkcztcbiAgdkJpdG1hcEluZGV4ID0gaW5zdGFuY2VCaXRtYXBJbmRleDtcbn1cbmA7XG4iXX0=