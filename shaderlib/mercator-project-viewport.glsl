#pragma glslify: mercatorProject = require(./mercator-project)

// non-linear projection: lnglats => space/camera coordinates
vec2 mercatorProjectViewport(
  vec2 lnglat,
  float zoom,
  vec2 centerLngLat,
  vec4 viewport // viewport: [x, y, width, height]
) {
  // This is constant - could be projected in JS before calling shader
  vec2 mapCenter = mercatorProject(centerLngLat, zoom);
  // Project the vertex.
  vec2 theVertex = mercatorProject(lnglat, zoom);

  float canvasSize = max(viewport.z, viewport.w);
  float worldSize = viewport.w;

  // TODO further simplify: let worldSize = canvasSize
  vec2 offsetXY = theVertex - mapCenter - viewport.xy + viewport.zw * 0.5;
  vec2 scaledXY = offsetXY * (worldSize * 2.0 / canvasSize) - worldSize;

  // flip y
  return scaledXY * vec2(1.0, -1.0);
}

#pragma glslify: export(mercatorProjectViewport)
