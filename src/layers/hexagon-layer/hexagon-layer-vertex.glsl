// Copyright (c) 2015 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

/* fragment shader for the hexagon-layer */
#define SHADER_NAME hexagon-layer-vs

attribute vec3 vertices;
attribute vec3 positions;
attribute vec3 colors;
attribute vec3 pickingColors;

uniform mat4 projectionMatrix;
uniform mat4 worldMatrix;

uniform float radius;
uniform float opacity;
uniform float angle;

// viewport: [x, y, width, height]
uniform vec4 viewport;
// mercatorSettings: [longitude, latitude, zoom, worldSize]
uniform vec4 mercatorSettings;
uniform vec2 mercatorLngLat;
uniform float mercatorZoom;
uniform float mercatorTileSize;

uniform float renderPickingBuffer;
uniform vec3 selected;
varying vec4 vColor;

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

// non-linear projection: lnglats => space/camera coordinates
vec2 webMercatorProject(vec2 lnglat, float zoom) {
  // This is constant - could be projected in JS before calling shader
  vec2 mapCenter = mercatorProject(mercatorLngLat, zoom);
  // Project the vertex.
  vec2 theVertex = mercatorProject(lnglat, zoom);

  float canvasSize = max(viewport.z, viewport.w);
  float worldSize = mercatorTileSize;

  // TODO further simplify: let worldSize = canvasSize
  vec2 offsetXY = theVertex - mapCenter - viewport.xy + viewport.zw * 0.5;
  vec2 scaledXY = offsetXY * (worldSize * 2.0 / canvasSize) - worldSize;

  // flip y
  return scaledXY * vec2(1.0, -1.0);
}

void main(void) {
  mat2 rotationMatrix = mat2(cos(angle), -sin(angle), sin(angle), cos(angle));
  vec3 rotatedVertices = vec3(rotationMatrix * vertices.xy * radius, vertices.z);
  vec4 verticesPositions = worldMatrix * vec4(rotatedVertices, 1.0);

  vec3 p = vec3(webMercatorProject(positions.xy, mercatorZoom), positions.z) + verticesPositions.xyz;
  gl_Position = projectionMatrix * vec4(p, 1.0);

  float alpha = pickingColors == selected ? 0.5 : opacity;
  vColor = vec4(mix(colors / 255., pickingColors / 255., renderPickingBuffer), alpha);
}
