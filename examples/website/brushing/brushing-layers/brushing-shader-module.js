// Copyright (c) 2015-2017 Uber Technologies, Inc.
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

const vs = `
  const float R_EARTH = 6371000.; // earth radius in km

  uniform bool brushing_enabled;
  uniform vec2 brushing_mousePos;
  uniform float brushing_radius;

  varying float brushing_hidden;

  // approximate distance between lng lat in meters
  float distanceBetweenLatLng(vec2 source, vec2 target) {
    vec2 delta = (source - target) * PI / 180.;

    float a =
      sin(delta.y / 2.) * sin(delta.y / 2.) +
      cos(source.y * PI / 180.) * cos(target.y * PI / 180.) *
      sin(delta.x / 2.) * sin(delta.x / 2.);

    float c = 2. * atan(sqrt(a), sqrt(1. - a));

    return R_EARTH * c;
  }

  bool brushing_isPointInRange(vec2 position) {
    if (!brushing_enabled) {
      return true;
    }
    return distanceBetweenLatLng(position, brushing_mousePos) <= brushing_radius;
  }

  void brushing_setVisible(bool visible) {
    brushing_hidden = float(!visible);
  }
`;

const fs = `
  uniform bool brushing_enabled;

  varying float brushing_hidden;
  
  vec4 brushing_filterBrushingColor(vec4 color) {
    if (brushing_enabled && brushing_hidden > 0.5) {
      discard;
    }
    return color;
  }
`;

const INITIAL_MODULE_OPTIONS = {};

export default {
  name: 'brushing',
  dependencies: ['project'],
  vs,
  fs,
  getUniforms: (opts = INITIAL_MODULE_OPTIONS) => {
    if (opts.viewport) {
      return {
        brushing_enabled: opts.enableBrushing,
        brushing_radius: opts.brushRadius,
        brushing_mousePos: opts.mousePosition ? opts.viewport.unproject(opts.mousePosition) : [0, 0]
      };
    }
    return {};
  }
};
