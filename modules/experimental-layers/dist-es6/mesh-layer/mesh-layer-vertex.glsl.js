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
  vec3 instancePos = project_position(instancePositions);

  mat3 rotationMatrix = getRotationMatrix(instanceRotations);

  vec3 pos = positions;
  pos = project_scale(pos * sizeScale);
  pos = rotationMatrix * pos;
  vec4 worldPosition;
  gl_Position = project_position_to_clipspace(instancePositions, instancePositions64xy, pos, worldPosition);

  // TODO - transform normals

  picking_setPickingColor(instancePickingColors);

  vTexCoord = texCoords;
  vColor = instanceColors;
  vLightWeight = lighting_getLightWeight(worldPosition.xyz, project_normal(normals));
}
`;
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9tZXNoLWxheWVyL21lc2gtbGF5ZXItdmVydGV4Lmdsc2wuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsZUFBZ0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0NBQWhCIiwic291cmNlc0NvbnRlbnQiOlsiZXhwb3J0IGRlZmF1bHQgYFxuI2RlZmluZSBTSEFERVJfTkFNRSBtZXNoLWxheWVyLXZzXG5cbi8vIFNjYWxlIHRoZSBtb2RlbFxudW5pZm9ybSBmbG9hdCBzaXplU2NhbGU7XG5cbi8vIFByaW1pdGl2ZSBhdHRyaWJ1dGVzXG5hdHRyaWJ1dGUgdmVjMyBwb3NpdGlvbnM7XG5hdHRyaWJ1dGUgdmVjMyBub3JtYWxzO1xuYXR0cmlidXRlIHZlYzIgdGV4Q29vcmRzO1xuXG4vLyBJbnN0YW5jZSBhdHRyaWJ1dGVzXG5hdHRyaWJ1dGUgdmVjMyBpbnN0YW5jZVBvc2l0aW9ucztcbmF0dHJpYnV0ZSB2ZWMyIGluc3RhbmNlUG9zaXRpb25zNjR4eTtcbmF0dHJpYnV0ZSB2ZWMzIGluc3RhbmNlUm90YXRpb25zO1xuYXR0cmlidXRlIHZlYzQgaW5zdGFuY2VDb2xvcnM7XG5hdHRyaWJ1dGUgdmVjMyBpbnN0YW5jZVBpY2tpbmdDb2xvcnM7XG5cbi8vIE91dHB1dHMgdG8gZnJhZ21lbnQgc2hhZGVyXG52YXJ5aW5nIHZlYzIgdlRleENvb3JkO1xudmFyeWluZyB2ZWM0IHZDb2xvcjtcbnZhcnlpbmcgZmxvYXQgdkxpZ2h0V2VpZ2h0O1xuXG4vLyB5YXcoeikgcGl0Y2goeSkgcm9sbCh4KVxubWF0MyBnZXRSb3RhdGlvbk1hdHJpeCh2ZWMzIHJvdGF0aW9uKSB7XG4gIGZsb2F0IHNyID0gc2luKHJvdGF0aW9uLngpO1xuICBmbG9hdCBzcCA9IHNpbihyb3RhdGlvbi55KTtcbiAgZmxvYXQgc3cgPSBzaW4ocm90YXRpb24ueik7XG5cbiAgZmxvYXQgY3IgPSBjb3Mocm90YXRpb24ueCk7XG4gIGZsb2F0IGNwID0gY29zKHJvdGF0aW9uLnkpO1xuICBmbG9hdCBjdyA9IGNvcyhyb3RhdGlvbi56KTtcblxuICByZXR1cm4gbWF0MyhcbiAgICBjdyAqIGNwLCAgICAgICAgICAgICAgICAgIC8vIDAsMFxuICAgIHN3ICogY3AsICAgICAgICAgICAgICAgICAgLy8gMSwwXG4gICAgLXNwLCAgICAgICAgICAgICAgICAgICAgICAvLyAyLDBcbiAgICAtc3cgKiBjciArIGN3ICogc3AgKiBzciwgIC8vIDAsMVxuICAgIGN3ICogY3IgKyBzdyAqIHNwICogc3IsICAgLy8gMSwxXG4gICAgY3AgKiBzciwgICAgICAgICAgICAgICAgICAvLyAyLDFcbiAgICBzdyAqIHNyICsgY3cgKiBzcCAqIGNyLCAgIC8vIDAsMlxuICAgIC1jdyAqIHNyICsgc3cgKiBzcCAqIGNyLCAgLy8gMSwyXG4gICAgY3AgKiBjciAgICAgICAgICAgICAgICAgICAvLyAyLDJcbiAgKTtcbn1cblxudm9pZCBtYWluKHZvaWQpIHtcbiAgdmVjMyBpbnN0YW5jZVBvcyA9IHByb2plY3RfcG9zaXRpb24oaW5zdGFuY2VQb3NpdGlvbnMpO1xuXG4gIG1hdDMgcm90YXRpb25NYXRyaXggPSBnZXRSb3RhdGlvbk1hdHJpeChpbnN0YW5jZVJvdGF0aW9ucyk7XG5cbiAgdmVjMyBwb3MgPSBwb3NpdGlvbnM7XG4gIHBvcyA9IHByb2plY3Rfc2NhbGUocG9zICogc2l6ZVNjYWxlKTtcbiAgcG9zID0gcm90YXRpb25NYXRyaXggKiBwb3M7XG4gIHZlYzQgd29ybGRQb3NpdGlvbjtcbiAgZ2xfUG9zaXRpb24gPSBwcm9qZWN0X3Bvc2l0aW9uX3RvX2NsaXBzcGFjZShpbnN0YW5jZVBvc2l0aW9ucywgaW5zdGFuY2VQb3NpdGlvbnM2NHh5LCBwb3MsIHdvcmxkUG9zaXRpb24pO1xuXG4gIC8vIFRPRE8gLSB0cmFuc2Zvcm0gbm9ybWFsc1xuXG4gIHBpY2tpbmdfc2V0UGlja2luZ0NvbG9yKGluc3RhbmNlUGlja2luZ0NvbG9ycyk7XG5cbiAgdlRleENvb3JkID0gdGV4Q29vcmRzO1xuICB2Q29sb3IgPSBpbnN0YW5jZUNvbG9ycztcbiAgdkxpZ2h0V2VpZ2h0ID0gbGlnaHRpbmdfZ2V0TGlnaHRXZWlnaHQod29ybGRQb3NpdGlvbi54eXosIHByb2plY3Rfbm9ybWFsKG5vcm1hbHMpKTtcbn1cbmA7XG4iXX0=