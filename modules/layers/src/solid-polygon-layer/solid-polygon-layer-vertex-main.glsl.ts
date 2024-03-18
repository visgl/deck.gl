// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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

uniform bool extruded;
uniform bool isWireframe;
uniform float elevationScale;
uniform float opacity;

out vec4 vColor;

struct PolygonProps {
  vec4 fillColors;
  vec4 lineColors;
  vec3 positions;
  vec3 positions64Low;
  vec3 pickingColors;
  vec3 normal;
  float elevations;
};

vec3 project_offset_normal(vec3 vector) {
  if (project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT ||
    project_uCoordinateSystem == COORDINATE_SYSTEM_LNGLAT_OFFSETS) {
    // normals generated by the polygon tesselator are in lnglat offsets instead of meters
    return normalize(vector * project_uCommonUnitsPerWorldUnit);
  }
  return project_normal(vector);
}

void calculatePosition(PolygonProps props) {
  vec3 pos = props.positions;
  vec3 pos64Low = props.positions64Low;
  vec3 normal = props.normal;
  vec4 colors = isWireframe ? props.lineColors : props.fillColors;

  geometry.worldPosition = props.positions;
  geometry.pickingColor = props.pickingColors;

  if (extruded) {
    pos.z += props.elevations * elevationScale;
  }
  gl_Position = project_position_to_clipspace(pos, pos64Low, vec3(0.), geometry.position);

  DECKGL_FILTER_GL_POSITION(gl_Position, geometry);

  if (extruded) {
  #ifdef IS_SIDE_VERTEX
    normal = project_offset_normal(normal);
  #else
    normal = project_normal(normal);
  #endif
    geometry.normal = normal;
    vec3 lightColor = lighting_getLightColor(colors.rgb, project_uCameraPosition, geometry.position.xyz, geometry.normal);
    vColor = vec4(lightColor, colors.a * opacity);
  } else {
    vColor = vec4(colors.rgb, colors.a * opacity);
  }
  DECKGL_FILTER_COLOR(vColor, geometry);
}
`;
