export default `\
#version 300 es
in vec4 outTexture;
out vec4 fragColor;
void main() {
  fragColor = outTexture;
  fragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`;
