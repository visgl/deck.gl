// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Inspired by screen-grid-layer vertex shader in deck.gl
export default `\
#version 300 es
#define SHADER_NAME heatp-map-layer-vertex-shader
uniform sampler2D maxTexture;
in vec3 positions;
in vec2 texCoords;
out vec2 vTexCoords;
out float vIntensityMin;
out float vIntensityMax;
void main(void) {
gl_Position = project_position_to_clipspace(positions, vec3(0.0), vec3(0.0));
vTexCoords = texCoords;
vec4 maxTexture = texture(maxTexture, vec2(0.5));
float maxValue = triangle.aggregationMode < 0.5 ? maxTexture.r : maxTexture.g;
float minValue = maxValue * triangle.threshold;
if (triangle.colorDomain[1] > 0.) {
maxValue = triangle.colorDomain[1];
minValue = triangle.colorDomain[0];
}
vIntensityMax = triangle.intensity / maxValue;
vIntensityMin = triangle.intensity / minValue;
}
`;
//# sourceMappingURL=triangle-layer-vertex.glsl.js.map