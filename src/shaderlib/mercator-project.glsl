// viewport: [x, y, width, height]
const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;

// non-linear projection: lnglats => zoom level depdendent projected coords
vec2 mercatorProject(vec2 lnglat, float zoom) {
  // Note: Could be precomputed, at the expense of less simple API
  float scale = pow(2.0, zoom) * TILE_SIZE / (PI * 2.0);

  float longitude = lnglat.x;
  float latitude = lnglat.y;

  float lamda = radians(longitude);
  float phi = radians(latitude);

  float x = scale * (lamda + PI);
  float y = scale * (PI - log(tan(PI * 0.25 + phi * 0.5)));

  return vec2(x, y);
}

#pragma glslify: export(mercatorProject)
