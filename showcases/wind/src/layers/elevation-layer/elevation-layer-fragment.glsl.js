export default `\
#define SHADER_NAME elevation-layer-fragment-shader

uniform vec2 elevationRange;

varying float lightWeight;
varying vec3 vNormal;
varying float vAltitude;

void main() {
  if (vAltitude < -90.0) {
    discard;
  }

  float opacity = smoothstep(elevationRange.x, elevationRange.y / 2.0, vAltitude) * 1.;

  gl_FragColor = vec4(vec3(15./70., 26./70., 36./70.) * lightWeight, opacity);
}
`;
