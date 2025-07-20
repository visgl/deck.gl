// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import main from './solid-polygon-layer-vertex-main.glsl';

export default `\
#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader

in vec3 vertexPositions;
in vec3 vertexPositions64Low;
in float elevations;

${main}

void main(void) {
  PolygonProps props;

  props.positions = vertexPositions;
  props.positions64Low = vertexPositions64Low;
  props.elevations = elevations;
  props.normal = vec3(0.0, 0.0, 1.0);

  calculatePosition(props);
}
`;
