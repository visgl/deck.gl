// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export default `\
#version 300 es
in vec4 positions;

void main() {
    gl_Position = positions;
}
`;
