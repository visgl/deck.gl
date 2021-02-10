export default `\
#define SHADER_NAME text-background-layer-fragment-shader

precision highp float;

uniform bool stroked;

varying vec4 vFillColor;
varying vec4 vLineColor;
varying float vLineWidth;
varying vec2 uv;
varying vec2 dimensions;

void main(void) {
  geometry.uv = uv;

  vec2 pixelPosition = uv * dimensions;
  if (stroked) {
    if (pixelPosition.x < vLineWidth || pixelPosition.x > dimensions.x - vLineWidth ||
        pixelPosition.y < vLineWidth || pixelPosition.y > dimensions.y - vLineWidth) {
          gl_FragColor = vLineColor;
        } else {
          gl_FragColor = vFillColor;
        }
  } else {
    gl_FragColor = vFillColor;
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
