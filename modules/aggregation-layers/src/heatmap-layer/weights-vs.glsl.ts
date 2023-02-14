export default `\
attribute vec3 positions;
attribute vec3 positions64Low;
attribute float weights;
varying vec4 weightsTexture;
uniform float radiusPixels;
uniform float textureWidth;
uniform vec4 commonBounds;
uniform float weightsScale;
void main()
{
  weightsTexture = vec4(weights * weightsScale, 0., 0., 1.);

  float radiusTexels  = project_pixel_size(radiusPixels) * textureWidth / (commonBounds.z - commonBounds.x);
  gl_PointSize = radiusTexels * 2.;

  geometry.position = project_position(vec4(positions, 1.0), positions64Low);
  geometry.worldPosition = positions;

  // map xy from commonBounds to [-1, 1]
  gl_Position.xy = (geometry.position.xy - commonBounds.xy) / (commonBounds.zw - commonBounds.xy) ;
  gl_Position.xy = (gl_Position.xy * 2.) - (1.);
}
`;
