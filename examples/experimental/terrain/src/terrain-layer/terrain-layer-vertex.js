const glsl = x => x;
export default glsl`
#define SHADER_NAME ground-level-layer-vertex-shader

uniform sampler2D elevationBitmapTexture;
uniform float cutoffHeightM;
uniform float peakHeightM;
uniform vec4 bounds;

// attribute vec2 texCoords;
attribute vec3 positions;
// attribute vec3 boundPositions;
attribute vec2 positions64xyLow;
// attribute vec3 instancePickingColors;
varying vec2 vTexCoord;

// compute height
float compute_height_m(vec4 color) {
  float r = color.r * 256.;
  float g = color.g * 256.;
  float b = color.b * 256.;
  float height_m = -10000. + ((r * 256. * 256. + g * 256. + b) * 0.1); 
  return height_m;
}

float map(float value, float min1, float max1, float min2, float max2) {
  return min2 + (value - min1) * (max2 - min2) / (max1 - min1);
}

vec3 getWorldPosition(vec2 lngLat, vec2 texCoords) {
  // vec2 texCoords = (lngLat - boundPositions.xy) / (boundPositions.zw - boundPositions.xy);
  vec4 elevation = texture2D(elevationBitmapTexture, texCoords);
  float altitude = compute_height_m(elevation) * 5.;
  // float altitude = compute_height_m(elevation);
  return vec3(lngLat, altitude);
}

void main(void) {
  vec2 texCoords = (positions.xy - bounds.xy) / (bounds.zw - bounds.xy);
  // vec2 texCoords = positions.xy - boundPositions.xy;
  // vec2 texCoords = boundPositions.xy;
  geometry.worldPosition = positions;
  geometry.uv = texCoords;
  // geometry.pickingColor = instancePickingColors;

  vec3 curr = getWorldPosition(positions.xy, texCoords);
  curr = project_position(curr);
  vec3 prev = getWorldPosition(positions.xy + vec2(1., 0.0), texCoords);
  prev = project_position(prev);
  vec3 next = getWorldPosition(positions.xy - vec2(0.0, 1.), texCoords);
  next = project_position(next);
  curr.z = (curr.z + prev.z + next.z) / 3.;

  vec4 position_worldspace = vec4(curr, 1.0);
  gl_Position = project_position_to_clipspace(position_worldspace);
  
  // vNormal = cross(prev - curr, next - curr);
  // set_normal
  // gl_Position = project_position_to_clipspace(positions, positions64xyLow, vec3(0.0), geometry.position);
  vTexCoord = texCoords;
  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);
}
`[0];
