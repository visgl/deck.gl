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
/* eslint-disable camelcase */
import type {ShaderModule} from '@luma.gl/shadertools';
import {project} from '@deck.gl/core';
import type {Viewport} from '@deck.gl/core';

import type {BrushingExtensionProps} from './brushing-extension';
import {glsl} from '../utils/syntax-tags';

export type BrushingModuleProps = {
  // From layer context
  viewport: Viewport;
  mousePosition?: {x: number; y: number};
} & BrushingExtensionProps;

type BrushingModuleUniforms = {
  enabled?: boolean;
  target?: number;
  mousePos?: [number, number];
  radius?: number;
};

const uniformBlock = glsl`\
uniform brushingUniforms {
  bool enabled;
  highp int target;
  vec2 mousePos;
  float radius;
} brushing;
`;

const vertex = glsl`
  in vec2 brushingTargets;

  out float brushing_isVisible;

  bool brushing_isPointInRange(vec2 position) {
    if (!brushing.enabled) {
      return true;
    }
    vec2 source_commonspace = project_position(position);
    vec2 target_commonspace = project_position(brushing.mousePos);
    float distance = length((target_commonspace - source_commonspace) / project.commonUnitsPerMeter.xy);

    return distance <= brushing.radius;
  }

  bool brushing_arePointsInRange(vec2 sourcePos, vec2 targetPos) {
    return brushing_isPointInRange(sourcePos) || brushing_isPointInRange(targetPos);
  }

  void brushing_setVisible(bool visible) {
    brushing_isVisible = float(visible);
  }
`;

const vs = `
${uniformBlock}
${vertex}
`;

const fragment = glsl`
  in float brushing_isVisible;
`;

const fs = `
${uniformBlock}
${fragment}
`;

const TARGET = {
  source: 0,
  target: 1,
  custom: 2,
  source_target: 3
};

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': glsl`
    vec2 brushingTarget;
    vec2 brushingSource;
    if (brushing.target == 3) {
      brushingTarget = geometry.worldPositionAlt.xy;
      brushingSource = geometry.worldPosition.xy;
    } else if (brushing.target == 0) {
      brushingTarget = geometry.worldPosition.xy;
    } else if (brushing.target == 1) {
      brushingTarget = geometry.worldPositionAlt.xy;
    } else {
      brushingTarget = brushingTargets;
    }
    bool visible;
    if (brushing.target == 3) {
      visible = brushing_arePointsInRange(brushingSource, brushingTarget);
    } else {
      visible = brushing_isPointInRange(brushingTarget);
    }
    brushing_setVisible(visible);
  `,

  'fs:DECKGL_FILTER_COLOR': `
    if (brushing.enabled && brushing_isVisible < 0.5) {
      discard;
    }
  `
};

export default {
  name: 'brushing',
  dependencies: [project],
  vs,
  fs,
  inject,
  getUniforms: (opts?: BrushingModuleProps | {}): BrushingModuleUniforms => {
    if (!opts || !('viewport' in opts)) {
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
      enabled: Boolean(brushingEnabled && mousePosition && viewport.containsPixel(mousePosition)),
      radius: brushingRadius,
      target: TARGET[brushingTarget] || 0,
      mousePos: mousePosition
        ? (viewport.unproject([mousePosition.x - viewport.x, mousePosition.y - viewport.y]) as [
            number,
            number
          ])
        : [0, 0]
    };
  },
  uniformTypes: {
    enabled: 'i32',
    target: 'i32',
    mousePos: 'vec2<f32>',
    radius: 'f32'
  }
} as ShaderModule<BrushingModuleProps, BrushingModuleUniforms>;
