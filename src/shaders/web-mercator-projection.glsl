// viewport: [x, y, width, height]
uniform vec4 viewport;
// mapViewport: [longitude, latitude, zoom, worldSize]
// TODO might be better called mapState
uniform vec4 mapViewport;

const float TILE_SIZE = 512.0;
const float PI = 3.1415926536;

vec2 mercatorProject(vec2 lnglat, float zoom) {
  float longitude = lnglat.x;
  float latitude = lnglat.y;

  float lamda = radians(lnglat.x);
  float phi = radians(lnglat.y);
  float scale = pow(2.0, zoom) * TILE_SIZE / (PI * 2.0);

  float x = scale * (lamda + PI);
  float y = scale * (PI - log(tan(PI * 0.25 + phi * 0.5)));

  return vec2(x, y);
}

vec2 webMercatorProject(vec2 lnglat) {
  // non-linear projection: lnglats => screen coordinates
  vec2 mapCenter = mercatorProject(mapViewport.xy, mapViewport.z);
  vec2 theVertex = mercatorProject(lnglat, mapViewport.z);
  // linear transformation:
  float canvasSize = max(viewport.z, viewport.w);
  float worldSize = mapViewport.w;
  // TODO further simplify: let worldSize = canvasSize
  vec2 offsetXY = theVertex - mapCenter - viewport.xy + viewport.zw * 0.5;
  vec2 scaledXY = offsetXY * (worldSize * 2.0 / canvasSize) - worldSize;
  // flip y
  return scaledXY * vec2(1.0, -1.0);
}

#pragma glslify: export(webMercatorProject)
