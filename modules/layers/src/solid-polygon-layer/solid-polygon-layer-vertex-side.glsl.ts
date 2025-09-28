// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import main from './solid-polygon-layer-vertex-main.glsl';

export default `\
#version 300 es
#define SHADER_NAME solid-polygon-layer-vertex-shader-side
#define IS_SIDE_VERTEX

in vec2 positions;

in vec3 vertexPositions;
in vec3 nextVertexPositions;
in vec3 vertexPositions64Low;
in vec3 nextVertexPositions64Low;
in float elevations;
in float instanceVertexValid;

${main}

void main(void) {
  if(instanceVertexValid < 0.5){
    gl_Position = vec4(0.);
    return;
  }

  PolygonProps props;

  vec3 pos;
  vec3 pos64Low;
  vec3 nextPos;
  vec3 nextPos64Low;

  #if RING_WINDING_ORDER_CW == 1
    pos = vertexPositions;
    pos64Low = vertexPositions64Low;
    nextPos = nextVertexPositions;
    nextPos64Low = nextVertexPositions64Low;
  #else
    pos = nextVertexPositions;
    pos64Low = nextVertexPositions64Low;
    nextPos = vertexPositions;
    nextPos64Low = vertexPositions64Low;
  #endif

  props.positions = mix(pos, nextPos, positions.x);
  props.positions64Low = mix(pos64Low, nextPos64Low, positions.x);

  props.normal = vec3(
    pos.y - nextPos.y + (pos64Low.y - nextPos64Low.y),
    nextPos.x - pos.x + (nextPos64Low.x - pos64Low.x),
    0.0);

  props.elevations = elevations * positions.y;

  calculatePosition(props);
}
`;
