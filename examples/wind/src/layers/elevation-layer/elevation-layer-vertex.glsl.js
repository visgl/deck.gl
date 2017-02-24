export default `\
#define SHADER_NAME elevation-layer-vertex-shader

uniform sampler2D elevationTexture;
uniform vec4 elevationBounds;
uniform vec2 elevationRange;
uniform float zScale;

attribute vec3 positions;

varying float lightWeight;
varying vec3 vNormal;
varying float vAltitude;

vec3 getWorldPosition(vec2 lngLat) {
  vec2 texCoords = (lngLat - elevationBounds.xy) / (elevationBounds.zw - elevationBounds.xy);
  vec4 elevation = texture2D(elevationTexture, texCoords);

  float altitude = mix(elevationRange.x, elevationRange.y, elevation.r);

  return vec3(lngLat, altitude * zScale);
}

void main() {

  vec3 curr = getWorldPosition(positions.xy);
  vAltitude = curr.z / zScale;
  curr = project_position(curr);

  vec3 prev = getWorldPosition(positions.xy + vec2(1., 0.0));
  prev = project_position(prev);
  vec3 next = getWorldPosition(positions.xy - vec2(0.0, 1.));
  next = project_position(next);

  curr.z = (curr.z + prev.z + next.z) / 3.;

  vec4 position_worldspace = vec4(curr, 1.0);
  gl_Position = project_to_clipspace(position_worldspace);

  vNormal = cross(prev - curr, next - curr);

  lightWeight = getLightWeight(curr, normalize(vNormal));
}
`;
