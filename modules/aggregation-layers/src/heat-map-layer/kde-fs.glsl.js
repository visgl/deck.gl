export default `\
#version 300 es
in vec4 outTexture;
out vec4 transform_output;
float gaussianKDE(float u){
  return pow(2.71828, -u*u/0.05555)/(1.77245385*0.166666);
}
float epanechnikovKDE(float u) {
  return 0.75 * (1.0 - u * u);
}
void main()
{
  if (outTexture.r + outTexture.g + outTexture.b == 0.) {
    discard;
  }
  float dist = length(gl_PointCoord - vec2(0.5, 0.5));
  if (dist > 0.5) {
    discard;
  }
  // transform_output.rgb = outTexture.rgb * (0.5 - dist);
  transform_output.rgb = outTexture.rgb * gaussianKDE(2. * dist);
  // transform_output.rgb = outTexture.rgb * epanechnikovKDE(2. * dist);
  transform_output.a = 1.0;
}
`;

/*

if (outTexture.r + outTexture.g + outTexture.b == 0.) {
transform_output.rgba = vec4(0.5);
} else {
float dist = length(gl_PointCoord - vec2(0.5, 0.5));
if (dist > 0.5) {
transform_output.rgba = vec4(10.0, 0.0, 0.0, 1.0);
} else {
transform_output.rgba = vec4(0.0, 10.0, 0.0, 1.0);
}
}


const KDE_FS_DEBUG = `\
#version 300 es
in vec4 outTexture;
out vec4 transform_output;
uniform float radiusPixels;
void main()
{
//transform_output.rgba = vec4(0.0, 1.0, 0.0, 1.0);
if (outTexture.r + outTexture.g + outTexture.b == 0.) {
discard; // transform_output.rgba = vec4(0.5);
} else {
float dist = length(gl_PointCoord - vec2(0.5, 0.5));
if (dist > 0.5) {
transform_output.rgba = vec4(1.0, 0.0, 0.0, 1.0);
} else {
transform_output.rgba = vec4(0.0, 1.0, 0.0, 1.0);
}
}
}
`;
*/
