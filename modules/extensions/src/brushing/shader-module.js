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

  bool brushing_isPointInRange(vec2 position) {
    if (!brushing_enabled) {
      return true;
    }
    vec2 source_commonspace = project_position(position);
    vec2 target_commonspace = project_position(brushing_mousePos);
    float distance = length((target_commonspace - source_commonspace) / project_uCommonUnitsPerMeter.xy);

    return distance <= brushing_radius;
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
    if (!opts || !opts.viewport) {
      return {};
    }
    const {
      brushingEnabled = true,
      brushingRadius = 10000,
      brushingTarget = 'source',
      mousePosition,
      viewport
    } = opts;
    return {
      brushing_enabled: Boolean(
        brushingEnabled && mousePosition && viewport.containsPixel(mousePosition)
      ),
      brushing_radius: brushingRadius,
      brushing_target: TARGET[brushingTarget] || 0,
      brushing_mousePos: mousePosition
        ? viewport.unproject([mousePosition.x - viewport.x, mousePosition.y - viewport.y])
        : [0, 0]
    };
  }
};
