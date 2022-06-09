export default `\
varying vec4 outTexture;
void main() {
  gl_FragColor = outTexture;
  gl_FragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`;
