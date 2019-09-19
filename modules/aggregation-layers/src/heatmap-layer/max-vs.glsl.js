export default `\
attribute vec4 inTexture;
varying vec4 outTexture;

void main()
{
outTexture = inTexture;
gl_Position = vec4(0, 0, 0, 1.);
}
`;
