export default `\
#version 300 es
#define SHADER_NAME elevation-layer-fragment-shader

uniform vec2 elevationRange;

in float lightWeight;
in vec3 vNormal;
in float vAltitude;

out vec4 fragColor;

void main() {
  if (vAltitude < -90.0) {
    discard;
  }

  float opacity = smoothstep(elevationRange.x, elevationRange.y / 2.0, vAltitude) * 1.;

  fragColor = vec4(vec3(15./70., 26./70., 36./70.) * lightWeight, opacity);
}
`;
