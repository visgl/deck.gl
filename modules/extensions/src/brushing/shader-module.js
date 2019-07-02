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
import {createModuleInjection} from '@luma.gl/core';

const vs = `
  const float R_EARTH = 6371000.; // earth radius in km

  uniform bool brushing_enabled;
  uniform int brushing_target;
  uniform vec2 brushing_mousePos;
  uniform float brushing_radius;

  #ifdef NON_INSTANCED_MODEL
  attribute vec2 brushingTargets;
  #else
  attribute vec2 instanceBrushingTargets;
  #endif

  varying float brushing_isVisible;

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
    brushing_isVisible = float(visible);
  }
`;

const fs = `
  uniform bool brushing_enabled;
  varying float brushing_isVisible;
`;

// filter_setValue(instanceFilterValue);
const moduleName = 'brushing';

const TARGET = {
  source: 0,
  target: 1,
  custom: 2
};

createModuleInjection(moduleName, {
  hook: 'vs:DECKGL_FILTER_GL_POSITION',
  injection: `
vec2 brushingTarget;
if (brushing_target == 0) {
  brushingTarget = geometry.worldPosition.xy;
} else if (brushing_target == 1) {
  brushingTarget = geometry.worldPositionAlt.xy;
} else {
  #ifdef NON_INSTANCED_MODEL
  brushingTarget = brushingTargets;
  #else
  brushingTarget = instanceBrushingTargets;
  #endif
}
brushing_setVisible(brushing_isPointInRange(brushingTarget));
  `
});

createModuleInjection(moduleName, {
  hook: 'fs:DECKGL_FILTER_COLOR',
  injection: `
if (brushing_enabled && brushing_isVisible < 0.5) {
  discard;
}
  `
});

export default {
  name: moduleName,
  dependencies: ['project'],
  vs,
  fs,
  getUniforms: opts => {
    if (opts && opts.viewport) {
      return {
        brushing_enabled: opts.brushingEnabled,
        brushing_radius: opts.brushingRadius,
        brushing_target: TARGET[opts.brushingTarget] || 0,
        brushing_mousePos: opts.mousePosition ? opts.viewport.unproject(opts.mousePosition) : [0, 0]
      };
    }
    return {};
  }
};
