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

export default `\
#define SHADER_NAME wind-layer-vertex-shader

#define PI 3.1415926535
#define PI2 1.5707963267949
#define PI4 0.78539816339745
#define HEIGHT_FACTOR 25.
#define ELEVATION_SCALE 80.

uniform sampler2D dataFrom;
uniform sampler2D dataTo;
uniform sampler2D elevationTexture;
uniform float delta;

uniform vec4 bbox;
uniform vec2 size;
uniform vec2 bounds0;
uniform vec2 bounds1;
uniform vec2 bounds2;
uniform vec4 elevationBounds;
uniform vec2 elevationRange;

attribute vec3 positions;
attribute vec3 vertices;
attribute vec3 normals;

varying vec4 vPosition;
varying vec4 vNormal;
varying vec4 vColor;
varying float vAltitude;

float getAltitude(vec2 lngLat) {
  vec2 texCoords = (lngLat - elevationBounds.xy) / (elevationBounds.zw - elevationBounds.xy);
  vec4 elevation = texture2D(elevationTexture, texCoords);

  return mix(elevationRange.x, elevationRange.y, elevation.r);
}

void main(void) {
  // position in texture coords
  float x = (positions.x - bbox.x) / (bbox.y - bbox.x);
  float y = (positions.y - bbox.z) / (bbox.w - bbox.z);
  vec2 coord = vec2(x, 1. - y);
  vec4 texel1 = texture2D(dataFrom, coord);
  vec4 texel2 = texture2D(dataTo, coord);
  vec4 texel = mix(texel1, texel2, delta);

  // angle
  float angleFrom = texel1.x * PI4;
  float angleTo = texel2.x * PI4;
  if (angleFrom < 0.) {
    angleFrom += PI * 2.;
  }
  if (angleTo < 0.) {
    angleTo += PI * 2.;
  }
  if (angleFrom < angleTo) {
    if (abs(angleTo - angleFrom) > abs(angleTo - (angleFrom + PI * 2.))) {
      angleFrom += PI * 2.;
    }
  } else {
    if (abs(angleFrom - angleTo) > abs(angleFrom - (angleTo + PI * 2.))) {
      angleTo += PI * 2.;
    }
  }
  float angle = mix(angleFrom, angleTo, delta);
  mat2 rotation = mat2(cos(angle), sin(angle), -sin(angle), cos(angle));

  // wind speed in 0-1
  float wind = 0.05 + (texel.y - bounds1.x) / (bounds1.y - bounds1.x) * 0.95;
  // float wind = (texel.y - bounds1.x) / (bounds1.y - bounds1.x);
  float factor = wind * 4.;
  vec2 vertex = rotation * vertices.xy;
  vec2 normal = rotation * normals.xy;
  vec2 pos = project_position(positions.xy + vertex.xy * factor);

  // OLD
  // vec3 extrudedPosition = vec3(pos.xy, 1.0);

  // NEW
  float elevation = project_scale((vertices.z + texel.w) * ELEVATION_SCALE);
  vec3 extrudedPosition = vec3(pos.xy, elevation + 1.0);

  vec4 position_worldspace = vec4(extrudedPosition, 1.0);
  gl_Position = project_to_clipspace(position_worldspace);

  // temperature in 0-1
  float temp = (texel.z - bounds2.x) / (bounds2.y - bounds2.x);

  // OLD
  // temp = floor((log(temp + 1.) * 3.) * 3.) / 3.;
  // vColor = vec4(vec3(temp, temp, 0.8), 1);

  // NEW
  temp = floor(temp * 3.) / 3.;
  vColor = vec4((1. - vec3(3. * temp, 0.25, 0.4)), 1);

  vPosition = position_worldspace;
  vNormal = vec4(normal, normals.z, 1);
  vAltitude = getAltitude(positions.xy);
  // out of bounds
  if (texel.x == 0. && texel.y == 0. && texel.z == 0.) {
    vColor.a = 0.;
  }
}
`;
