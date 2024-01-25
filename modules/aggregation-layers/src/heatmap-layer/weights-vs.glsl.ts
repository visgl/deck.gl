export default `\
#version 300 es
in vec3 positions;
in vec3 positions64Low;
in float weights;
out vec4 weightsTexture;
uniform float radiusPixels;
uniform float textureWidth;
uniform vec4 commonBounds;
uniform vec4 worldBounds;
uniform float weightsScale;

void main()
{
  weightsTexture = vec4(weights * weightsScale, 0., 0., 1.);
  weightsTexture = vec4(1., 1., 1., 1.); // TODO(donmccurdy)

  float radiusTexels  = project_pixel_size(radiusPixels) * textureWidth / (commonBounds.z - commonBounds.x);
  gl_PointSize = radiusTexels * 2.;

  vec3 commonPosition = project_position(positions, positions64Low);

  // // map xy from commonBounds to [-1, 1]
  // gl_Position.xy = (commonPosition.xy - commonBounds.xy) / (commonBounds.zw - commonBounds.xy) ;
  // gl_Position.xy = (gl_Position.xy * 2.) - (1.);

  // TODO(donmccurdy): Relevant?
  gl_PointSize = 1.0;

  // TODO(felix) Forget projection for now
  // vec4 worldBounds = vec4(-76.5625, 38.56471959021851, -70.9375, 42.82704934756844);
  gl_Position.xy = (positions.xy - worldBounds.xy) / (worldBounds.zw - worldBounds.xy) ;
  gl_Position.xy = (gl_Position.xy * 2.) - (1.);
  gl_Position.zw = vec2(0.0, 1.0);
}
`;
