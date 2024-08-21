export default `#version 300 es

#define SHADER_NAME hexagon-cell-layer-vertex-shader

in vec3 positions;
in vec3 normals;

in vec2 instancePositions;
in float instanceElevationValues;
in float instanceColorValues;
in vec3 instancePickingColors;

// Custom uniforms
uniform float opacity;
uniform bool extruded;
uniform float coverage;
uniform float radius;
uniform vec2 colorDomain;
uniform sampler2D colorRange;
uniform vec2 elevationDomain;
uniform vec2 elevationRange;

// Result
out vec4 vColor;

const float DIST_X = 1.7320508075688772;
const float DIST_Y = 1.5;

vec2 hexbinCentroid(vec2 binId) {
  return vec2(
    (binId.x + mod(binId.y, 2.0) * 0.5) * DIST_X,
    binId.y * DIST_Y
  ) * radius;
}

float interp(float value, vec2 domain, vec2 range) {
  float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
  return mix(range.x, range.y, r);
}

vec4 interp(float value, vec2 domain, sampler2D range) {
  float r = min(max((value - domain.x) / (domain.y - domain.x), 0.), 1.);
  return texture(range, vec2(r, 0.5));
}

void main(void) {
  geometry.pickingColor = instancePickingColors;

  if (isnan(instanceColorValues)) {
    gl_Position = vec4(0.);
    return;
  }
  
  vec2 commonPosition = hexbinCentroid(instancePositions) - project.commonOrigin.xy;
  commonPosition += positions.xy * radius * coverage;
  geometry.position = vec4(commonPosition, 0.0, 1.0);
  geometry.normal = project_normal(normals);

  // calculate z, if 3d not enabled set to 0
  float elevation = 0.0;
  if (extruded) {
    elevation = interp(instanceElevationValues, elevationDomain, elevationRange);
    elevation = project_size(elevation);
    // cylindar gemoetry height are between -1.0 to 1.0, transform it to between 0, 1
    geometry.position.z = (positions.z + 1.0) / 2.0 * elevation;
  }

  gl_Position = project_common_position_to_clipspace(geometry.position);
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  vColor = interp(instanceColorValues, colorDomain, colorRange);
  vColor.a *= opacity;
  if (extruded) {
    vColor.rgb = lighting_getLightColor(vColor.rgb, project.cameraPosition, geometry.position.xyz, geometry.normal);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
