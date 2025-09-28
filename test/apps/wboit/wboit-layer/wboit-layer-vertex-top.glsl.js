// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import main from './wboit-layer-vertex-main.glsl';

export default `\
#version 300 es

#define SHADER_NAME wboit-layer-vertex-shader

in vec3 positions;
in vec2 positions64xyLow;
in float elevations;
in vec4 fillColors;
in vec4 lineColors;
in vec3 pickingColors;

${main}

void main(void) {
  PolygonProps props;

  props.positions = positions;
  props.positions64xyLow = positions64xyLow;
  props.elevations = elevations;
  props.fillColors = fillColors;
  props.lineColors = lineColors;
  props.pickingColors = pickingColors;

  calculatePosition(props);
}
`;
