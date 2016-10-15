const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

uniform float mercatorEnable;
uniform float mercatorScale;

#ifdef INTEL_WORKAROUND
#pragma glslify: tan_fp64 = require(./fp64/tan-fp64)
#endif

// non-linear projection: lnglats => unit tile [0-1, 0-1]
vec2 mercatorProject(vec2 lnglat) {
  return vec2(
        radians(lnglat.x) + PI,
#ifdef INTEL_WORKAROUND
    PI - log(tan_fp64(vec2(PI * 0.25 + radians(lnglat.y) * 0.5, 0.0)).x)
#else
        PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5))
#endif
  );
}

vec2 project(vec2 position) {
  if (mercatorEnable == 1.0) {
    return (position + vec2(TILE_SIZE / 2.0)) * mercatorScale;
  } else {
    return mercatorProject(position) * WORLD_SCALE * mercatorScale;
  }
}

#pragma glslify: export(project)

