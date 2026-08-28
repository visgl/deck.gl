// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
const CONTENT_ALIGN = {
    none: 0,
    start: 1,
    center: 2,
    end: 3
};
const glslUniformBlock = `\
layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  highp float fontSize;
  bool flipY;
} text;

#define ALIGN_MODE_START ${CONTENT_ALIGN.start}
#define ALIGN_MODE_CENTER ${CONTENT_ALIGN.center}
#define ALIGN_MODE_END ${CONTENT_ALIGN.end}
`;
export const textUniforms = {
    name: 'text',
    vs: glslUniformBlock,
    getUniforms: ({ contentCutoffPixels = [0, 0], contentAlignHorizontal = 'none', contentAlignVertical = 'none', fontSize, viewport }) => ({
        cutoffPixels: contentCutoffPixels,
        align: [CONTENT_ALIGN[contentAlignHorizontal], CONTENT_ALIGN[contentAlignVertical]],
        fontSize,
        flipY: viewport?.flipY ?? false
    }),
    uniformTypes: {
        cutoffPixels: 'vec2<f32>',
        align: 'vec2<i32>',
        fontSize: 'f32',
        flipY: 'f32'
    }
};
//# sourceMappingURL=text-uniforms.js.map