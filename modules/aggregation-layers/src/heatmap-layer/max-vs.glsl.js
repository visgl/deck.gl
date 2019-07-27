export default `\
#version 300 es
in vec4 inTexture;
out vec4 outTexture;

void main()
{
outTexture = inTexture;
gl_Position = vec4(0, 0, 0, 1.);
}
`;
