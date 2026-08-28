// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const uniformBlockWGSL = null;
const uniformBlock = `\
layout(std140) uniform layerUniforms {
  uniform float opacity;
} layer;
`;
export const layerUniforms = {
    name: 'layer',
    source: uniformBlockWGSL,
    vs: uniformBlock,
    fs: uniformBlock,
    getUniforms: (props) => {
        return {
            // apply gamma to opacity to make it visually "linear"
            // TODO - v10: use raw opacity?
            opacity: Math.pow(props.opacity, 1 / 2.2)
        };
    },
    uniformTypes: {
        opacity: 'f32'
    }
};
//# sourceMappingURL=layer-uniforms.js.map