// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export default `\
#version 300 es
#define SHADER_NAME arc-layer-fragment-shader
precision highp float;
in vec4 vColor;
in vec2 uv;
in float isValid;
out vec4 fragColor;
void main(void) {
#ifdef ANTIALIASING
float edgeCoord = abs(uv.y);
float edgePixels = (1.0 - edgeCoord) / max(fwidth(edgeCoord), 1e-6);
#endif
if (isValid == 0.0) {
discard;
}
#ifdef ANTIALIASING
if (edgePixels <= -SMOOTH_EDGE_RADIUS) {
discard;
}
#endif
fragColor = vColor;
geometry.uv = uv;
#ifdef ANTIALIASING
fragColor.a *= smoothedge(0.0, edgePixels);
#endif
DECKGL_FILTER_COLOR(fragColor, geometry);
}
`;
//# sourceMappingURL=arc-layer-fragment.glsl.js.map