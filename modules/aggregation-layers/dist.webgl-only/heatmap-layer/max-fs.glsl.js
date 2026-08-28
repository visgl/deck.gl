// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
export default `\
#version 300 es
in vec4 outTexture;
out vec4 fragColor;
void main() {
fragColor = outTexture;
fragColor.g = outTexture.r / max(1.0, outTexture.a);
}
`;
//# sourceMappingURL=max-fs.glsl.js.map