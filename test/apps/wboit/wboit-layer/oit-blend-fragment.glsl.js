export default `\
#version 300 es
precision highp float;

uniform sampler2D uAccumulate;
uniform sampler2D uAccumulateAlpha;

out vec4 fragColor;

void main() {
  ivec2 fragCoord = ivec2(gl_FragCoord.xy);
  vec4 accum = texelFetch(uAccumulate, fragCoord, 0);
  float a = 1.0 - accum.a;
  accum.a = texelFetch(uAccumulateAlpha, fragCoord, 0).r;

  fragColor = vec4(a * accum.rgb / clamp(accum.a, 0.001, 100.0), a);
}
`;
