// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#define SHADER_NAME particle-layer-vertex-shader

#define HEIGHT_FACTOR 25.
#define ELEVATION_SCALE 100.

uniform sampler2D dataFrom;
uniform sampler2D dataTo;
uniform sampler2D elevationTexture;
uniform float delta;
uniform float pixelRatio;

uniform vec4 bbox;
uniform vec2 size;
uniform vec2 bounds0;
uniform vec2 bounds1;
uniform vec2 bounds2;
uniform vec4 elevationBounds;
uniform vec2 elevationRange;
uniform float zScale;

attribute vec3 positions;
attribute vec4 posFrom;
// attribute vec3 vertices;

varying vec4 vColor;
varying float vAltitude;

float getAltitude(vec2 lngLat) {
  vec2 texCoords = (lngLat - elevationBounds.xy) / (elevationBounds.zw - elevationBounds.xy);
  vec4 elevation = texture2D(elevationTexture, texCoords);

  return mix(elevationRange.x, elevationRange.y, elevation.r);
}

void main(void) {
  // position in texture coords
  float x = (posFrom.x - bbox.x) / (bbox.y - bbox.x);
  float y = (posFrom.y - bbox.z) / (bbox.w - bbox.z);
  vec2 coord = vec2(x, 1. - y);
  vec4 texel = mix(texture2D(dataFrom, coord), texture2D(dataTo, coord), delta);

  vAltitude = getAltitude(posFrom.xy);
  //float wind = (texel.y - bounds1.x) / (bounds1.y - bounds1.x);
  float wind = 0.05 + (texel.y - bounds1.x) / (bounds1.y - bounds1.x) * 0.9;

  vec2 pos = project_position(posFrom.xy);
  float elevation = project_scale((texel.w) * ELEVATION_SCALE);

  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.0) + positions;
  vec4 position_worldspace = vec4(extrudedPosition, 1.0);
  gl_Position = project_to_clipspace(position_worldspace);
  gl_PointSize = 3.5 * pixelRatio / 2.0;

  // OLD
  // float alpha = mix(0., 0.8, pow(wind, .5));

  // NEW
  float alpha = mix(0., .8, pow(wind, .8));

  if (texel.x == 0. && texel.y == 0. && texel.z == 0.) {
    alpha = 0.;
  }
  // temperature in 0-1
  float temp = (texel.z - bounds2.x) / (bounds2.y - bounds2.x);
  // vColor = vec4(vec3(0.8), pow(alpha, power));
  vColor = vec4(vec3(0.8), alpha);
}
`;
