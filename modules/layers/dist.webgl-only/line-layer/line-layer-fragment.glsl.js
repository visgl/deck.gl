// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export default `\
#version 300 es
#define SHADER_NAME line-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
out vec4 fragColor;
void main(void) {
geometry.uv = uv;
fragColor = vColor;
#ifdef ANTIALIASING
float edgeCoord = abs(uv.y);
float edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
discard;
}
fragColor.a *= smoothedge(0.0, edgePixels);
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
//# sourceMappingURL=line-layer-fragment.glsl.js.map