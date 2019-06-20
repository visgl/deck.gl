export default `\
#version 300 es
in vec4 inTexture;
out vec4 outTexture;
uniform float radiusPixels;
void main()
{
  outTexture = inTexture;
  // gl_PointSize = radiusPixels * 2.;
  gl_PointSize = (outTexture.r + outTexture.g + outTexture.b == 0.) ? 1. : radiusPixels * 2.;
}
`;
