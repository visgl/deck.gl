// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable camelcase */
import type {ShaderModule, ShaderPlugin} from '@luma.gl/shaders';
import {project} from '@deck.gl/core';
import type {Viewport} from '@deck.gl/core';

import type {BrushingExtensionProps} from './brushing-extension';

export type BrushingModuleProps = {
  // From layer context
  viewport: Viewport;
  mousePosition?: {x: number; y: number};
} & BrushingExtensionProps;

type BrushingModuleUniforms = {
  enabled?: boolean;
  targetMode?: number;
  mousePos?: [number, number];
  radius?: number;
};

const uniformBlock = /* glsl */ `\
layout(std140) uniform brushingUniforms {
  bool enabled;
  highp int targetMode;
  vec2 mousePos;
  float radius;
} brushing;
`;

const vertex = /* glsl */ `

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

`;

const vs = `
${uniformBlock}
${vertex}
`;

const fs = uniformBlock;

const TARGET = {
  source: 0,
  target: 1,
  custom: 2,
  source_target: 3
};

const inject = {
  'vs:DECKGL_FILTER_GL_POSITION': /* glsl */ `
    vec2 brushingTarget;
    vec2 brushingSource;
    if (brushing.targetMode == 3) {
      brushingTarget = geometry.worldPositionAlt.xy;
      brushingSource = geometry.worldPosition.xy;
    } else if (brushing.targetMode == 0) {
      brushingTarget = geometry.worldPosition.xy;
    } else if (brushing.targetMode == 1) {
      brushingTarget = geometry.worldPositionAlt.xy;
    } else {
      brushingTarget = brushingTargets;
    }
    bool visible;
    if (brushing.targetMode == 3) {
      visible = brushing_arePointsInRange(brushingSource, brushingTarget);
    } else {
      visible = brushing_isPointInRange(brushingTarget);
    }
    brushing_isVisible = float(visible);
  `,

  'fs:DECKGL_FILTER_COLOR': `
    if (brushing.enabled && brushing_isVisible < 0.5) {
      discard;
    }
  `
};

const brushingModule = {
  name: 'brushing',
  dependencies: [project],
  vs,
  fs,
  source: /* wgsl */ `
struct BrushingUniforms {
  enabled: i32,
  targetMode: i32,
  mousePos: vec2<f32>,
  radius: f32,
};
@group(2) @binding(auto) var<uniform> brushing: BrushingUniforms;

fn brushing_isPointInRange(position: vec2<f32>) -> bool {
  if (brushing.enabled == 0) { return true; }
  let sourceCommon = project_position_vec2_f32(position);
  let targetCommon = project_position_vec2_f32(brushing.mousePos);
  let distance = length((targetCommon - sourceCommon) / project.commonUnitsPerMeter.xy);
  return distance <= brushing.radius;
}
`,
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
      targetMode: TARGET[brushingTarget] || 0,
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
    targetMode: 'i32',
    mousePos: 'vec2<f32>',
    radius: 'f32'
  }
} as ShaderModule<BrushingModuleProps, BrushingModuleUniforms, {}>;

/** Portable brushing interface; luma.gl owns vertex-input and varying declarations. */
export const brushingPlugin: ShaderPlugin = {
  name: 'brushing',
  module: brushingModule,
  vertexInputs: {brushingTargets: 'vec2<f32>'},
  interStageVariables: {brushing_isVisible: {type: 'f32'}},
  injections: [
    {target: 'vs:DECKGL_FILTER_GL_POSITION', glsl: inject['vs:DECKGL_FILTER_GL_POSITION']},
    {target: 'fs:DECKGL_FILTER_COLOR', glsl: inject['fs:DECKGL_FILTER_COLOR']},
    {
      target: 'vs:DECKGL_FILTER_POSITION',
      wgsl: `
var brushTarget = geometry.worldPosition.xy;
if (brushing.targetMode == 1) { brushTarget = geometry.worldPositionAlt.xy; }
if (brushing.targetMode == 2) { brushTarget = brushingTargets; }
var visible = brushing_isPointInRange(brushTarget);
if (brushing.targetMode == 3) {
  visible = visible || brushing_isPointInRange(geometry.worldPositionAlt.xy);
}
brushing_isVisible = select(0.0, 1.0, visible);
`
    },
    {
      target: 'fs:DECKGL_FILTER_FRAGMENT_COLOR',
      wgsl: `if (brushing.enabled != 0 && brushing_isVisible < 0.5) { discard; }`
    }
  ]
};

export default brushingModule;
