export default `\
#version 300 es
#define SHADER_NAME text-background-layer-fragment-shader

precision highp float;

uniform bool stroked;

in vec4 vFillColor;
in vec4 vLineColor;
in float vLineWidth;
in vec2 uv;
in vec2 dimensions;

out vec4 fragColor;

void main(void) {
  geometry.uv = uv;

  vec2 pixelPosition = uv * dimensions;
  if (stroked) {
    float distToEdge = min(
      min(pixelPosition.x, dimensions.x - pixelPosition.x),
      min(pixelPosition.y, dimensions.y - pixelPosition.y)
    );
    float isBorder = smoothedge(distToEdge, vLineWidth);
    fragColor = mix(vFillColor, vLineColor, isBorder);
  } else {
    fragColor = vFillColor;
  }

  DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
