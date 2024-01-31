export default `\
#version 300 es
// TODO(donmccurdy)
uniform sampler2D inTexture;
out vec4 outTexture;

void main()
{
  int yIndex = - (gl_InstanceID / 2048);
  int xIndex = gl_InstanceID + (yIndex * 2048);
  vec2 uv = vec2(float(xIndex), float(yIndex)) / 2048.0;

  outTexture = vec4(0.3 / (2048.0 * 2048.0), 0.0, 0.0, 1.0); // Test blend behavior;
  // outTexture = texture(inTexture, uv);
  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  // Enforce default value for ANGLE issue (https://bugs.chromium.org/p/angleproject/issues/detail?id=3941)
  gl_PointSize = 1.0;
}
`;
