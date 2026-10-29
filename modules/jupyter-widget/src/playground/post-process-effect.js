// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {PostProcessEffect} from '@deck.gl/core';
import {
  brightnessContrast,
  bulgePinch,
  colorHalftone,
  denoise,
  dotScreen,
  edgeWork,
  fxaa,
  hexagonalPixelate,
  hueSaturation,
  ink,
  magnify,
  noise,
  sepia,
  swirl,
  tiltShift,
  triangleBlur,
  vibrance,
  vignette,
  zoomBlur
} from '@luma.gl/effects';

const POST_PROCESS_EFFECTS = {
  brightnessContrast,
  bulgePinch,
  colorHalftone,
  denoise,
  dotScreen,
  edgeWork,
  fxaa,
  hexagonalPixelate,
  hueSaturation,
  ink,
  magnify,
  noise,
  sepia,
  swirl,
  tiltShift,
  triangleBlur,
  vibrance,
  vignette,
  zoomBlur
};

/** Adapts JSONConverter's single props argument to PostProcessEffect's module, props signature. */
export class JSONPostProcessEffect extends PostProcessEffect {
  constructor({module, ...props} = {}) {
    const shaderModule = POST_PROCESS_EFFECTS[module];
    if (!shaderModule) {
      throw new Error(`Unsupported post-processing module: ${module}`);
    }
    super(shaderModule, props);
  }
}
