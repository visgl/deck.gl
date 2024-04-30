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
