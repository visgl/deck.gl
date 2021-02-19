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
    float distToEdge = min(
      min(pixelPosition.x, dimensions.x - pixelPosition.x),
      min(pixelPosition.y, dimensions.y - pixelPosition.y)
    );
    float isBorder = smoothedge(distToEdge, vLineWidth);
    gl_FragColor = mix(vFillColor, vLineColor, isBorder);
  } else {
    gl_FragColor = vFillColor;
  }

  DECKGL_FILTER_COLOR(gl_FragColor, geometry);
}
`;
