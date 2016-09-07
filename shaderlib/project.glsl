const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

uniform float disableMercatorProjector;
uniform float mercatorScale;

// non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 mercatorProject(vec2 lnglat) {
  return vec2(
  	radians(lnglat.x) + PI,
  	PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5))
  );
}

vec2 project(vec2 position) {
  if (disableMercatorProjector == 1.0) {
    return (position + vec2(TILE_SIZE / 2.0)) * mercatorScale;
  } else {
    return mercatorProject(position) * WORLD_SCALE * mercatorScale;
  }
}

#pragma glslify: export(project)
