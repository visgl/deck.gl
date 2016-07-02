const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;
const float WORLD_SCALE = TILE_SIZE / (PI * 2.0);

// non-linear projection: lnglats => zoom 0 tile [0-512, 0-512] * scale
vec2 mercatorProject(vec2 lnglat, float zoomScale) {
  float scale = WORLD_SCALE * zoomScale;
  return vec2(
  	scale * (radians(lnglat.x) + PI),
  	scale * (PI - log(tan(PI * 0.25 + radians(lnglat.y) * 0.5)))
  );
}

#pragma glslify: export(mercatorProject)
