const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

const float PROJECT_LINEAR = 0.;
const float PROJECT_MERCATOR = 1.;
const float PROJECT_MERCATOR_OFFSETS = 2.;

// USE PACKED UNIFORM TO MINIMIZE DEBUGGING
// uniform vec4 projectionParameters[2];
// float projectionMode = projectionParameters[0].x;
// vec2 projectionCenter = projectionParameters[0].zw;
// float projectionScale = projectionParameters[1].x;
// vec3 projectionPixelsPerUnit = projectionParameters[1].yzw;

uniform float projectionMode;
uniform float projectionScale;
uniform vec2 projectionCenter;
uniform vec3 projectionPixelsPerUnit;
uniform mat4 projectionMatrix;
uniform mat4 projectionMatrixUncentered;

//
// Scaling offsets
//

float scale(float meters) {
  return meters * projectionPixelsPerUnit.x;
}

vec2 scale(vec2 meters) {
  return vec2(
    meters.x * projectionPixelsPerUnit.x,
    meters.y * projectionPixelsPerUnit.x
  );
}

vec3 scale(vec3 meters) {
  return vec3(
    meters.x * projectionPixelsPerUnit.x,
    meters.y * projectionPixelsPerUnit.x,
    meters.z * projectionPixelsPerUnit.x
  );
}

vec4 scale(vec4 meters) {
  return vec4(
    meters.x * projectionPixelsPerUnit.x,
    meters.y * projectionPixelsPerUnit.x,
    meters.z * projectionPixelsPerUnit.x,
    meters.w
  );
}

//
// Projecting positions
//

// non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 mercatorProject(vec2 lnglat) {
  return vec2(
    radians(lnglat.x) + PI,
    PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

vec2 preproject(vec2 position) {
  if (projectionMode == PROJECT_LINEAR) {
    return (position + vec2(TILE_SIZE / 2.0)) * projectionScale;
  }
  if (projectionMode == PROJECT_MERCATOR_OFFSETS) {
    return scale(position) + projectionCenter;
  }
  // projectionMode == PROJECT_MERCATOR
  return mercatorProject(position) * WORLD_SCALE * projectionScale;
}

vec3 preproject(vec3 position) {
  return vec3(preproject(position.xy), scale(position.z) + .1);
}

vec4 preproject(vec4 position) {
  return vec4(preproject(position.xyz), position.w);
}

//

vec4 project(vec4 position) {
  if (projectionMode == PROJECT_LINEAR) {
    return projectionMatrix * position;
  }
  if (projectionMode == PROJECT_MERCATOR_OFFSETS) {
    return projectionMatrixUncentered * position;
  }
  // projectionMode == PROJECT_MERCATOR
  return projectionMatrix * position;
}
