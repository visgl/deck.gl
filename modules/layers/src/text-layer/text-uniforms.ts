// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {ShaderModule} from '@luma.gl/shadertools';
import type {Viewport, OrthographicViewport} from '@deck.gl/core';

export type ContentAlignModes = keyof typeof CONTENT_ALIGN;

const CONTENT_ALIGN = {
  none: 0,
  start: 1,
  center: 2,
  end: 3
} as const;

const glslUniformBlock = `\
layout(std140) uniform textUniforms {
  highp vec2 cutoffPixels;
  highp ivec2 align;
  bool flipY;
} text;

#define ALIGN_MODE_START ${CONTENT_ALIGN.start}
#define ALIGN_MODE_CENTER ${CONTENT_ALIGN.center}
#define ALIGN_MODE_END ${CONTENT_ALIGN.end}
`;

export type TextModuleProps = {
  contentCutoffPixels?: [number, number];
  contentAlignHorizontal?: ContentAlignModes;
  contentAlignVertical?: ContentAlignModes;
  viewport: Viewport;
};

type TextUniforms = {
  cutoffPixels: [number, number];
  align: [number, number];
  // If true, content's x,y is the top-left corner instead of bottom-left
  flipY: boolean;
};

export const textUniforms = {
  name: 'text',
  vs: glslUniformBlock,
  getUniforms: ({
    contentCutoffPixels = [0, 0],
    contentAlignHorizontal = 'none',
    contentAlignVertical = 'none',
    viewport
  }: Partial<TextModuleProps>) => ({
    cutoffPixels: contentCutoffPixels,
    align: [CONTENT_ALIGN[contentAlignHorizontal], CONTENT_ALIGN[contentAlignVertical]],
    flipY: (viewport as OrthographicViewport)?.flipY ?? false
  }),
  uniformTypes: {
    cutoffPixels: 'vec2<f32>',
    align: 'vec2<i32>',
    flipY: 'f32'
  }
} as const satisfies ShaderModule<TextModuleProps, TextUniforms>;
