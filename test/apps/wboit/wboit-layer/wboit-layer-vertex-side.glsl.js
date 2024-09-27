// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import main from './wboit-layer-vertex-main.glsl';

export default `\
#version 300 es

#define SHADER_NAME wboit-layer-vertex-shader-side
#define IS_SIDE_VERTEX


in vec3 instancePositions;
in vec2 instancePositions64xyLow;
in vec3 nextPositions;
in vec2 nextPositions64xyLow;
in float instanceElevations;
in vec4 instanceFillColors;
in vec4 instanceLineColors;
in vec3 instancePickingColors;

${main}

void main(void) {
  PolygonProps props;

  props.positions = instancePositions;
  props.positions64xyLow = instancePositions64xyLow;
  props.elevations = instanceElevations;
  props.fillColors = instanceFillColors;
  props.lineColors = instanceLineColors;
  props.pickingColors = instancePickingColors;
  props.nextPositions = nextPositions;
  props.nextPositions64xyLow = nextPositions64xyLow;

  calculatePosition(props);
}
`;
