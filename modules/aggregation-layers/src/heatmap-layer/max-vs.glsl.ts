export default `\
#version 300 es
uniform sampler2D inTexture;
out vec4 outTexture;

void main()
{
  // Sample every pixel in texture
  int yIndex = gl_VertexID / 2048;
  int xIndex = gl_VertexID - (yIndex * 2048);
  vec2 uv = (0.5 + vec2(float(xIndex), float(yIndex))) / 2048.0;
  outTexture = texture(inTexture, uv);

  gl_Position = vec4(0.0, 0.0, 0.0, 1.0);
  // Enforce default value for ANGLE issue (https://bugs.chromium.org/p/angleproject/issues/detail?id=3941)
  gl_PointSize = 1.0;
}
`;
