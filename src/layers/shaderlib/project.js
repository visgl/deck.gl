export default `
uniform float mercatorEnable;
uniform float mercatorScale;
uniform vec2 mercatorCenter;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

// non-linear projection: lnglats => zoom 0 tile [0-512, 0-512] * scale
vec2 project(vec2 lnglat) {
  float scale = WORLD_SCALE * mercatorScale;
  return vec2(
  	scale * (radians(lnglat.x) + PI),
  	scale * (PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5)))
  );
}

vec2 projectAndCenter(vec2 lnglat) {
  return project(lnglat) - mercatorCenter;
}
`;
