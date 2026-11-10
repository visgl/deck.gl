// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {
  WebGPUAggregator,
  type WebGPUAggregatorOptions
} from '../common/aggregator/webgpu-aggregator/webgpu-aggregator';
import {binOptionsUniforms} from './bin-options-uniforms';

/** Screen-space bin assignment for the shared compute reducer. @internal */
export class WebGPUScreenGridAggregator extends WebGPUAggregator {
  constructor(
    device: Device,
    extensions: Pick<WebGPUAggregatorOptions, 'shaders' | 'bindAttributes' | 'requestRedraw'> = {}
  ) {
    super(device, {
      ...extensions,
      graph: true,
      channelNames: ['counts'],
      binOptions: binOptionsUniforms,
      binning: `fn getBin(position: vec3f, low: vec3f) -> BinAssignment {
        let clip = project_position_to_clipspace(position, low, vec3f(0.0));
        let viewport = project.viewportSize / project.devicePixelRatio;
        let pixel = vec2f(clip.x / clip.w + 1.0, 1.0 - clip.y / clip.w) * 0.5 * viewport;
        let valid = clip.w > 0.0 && all(pixel >= vec2f(0.0)) && all(pixel < viewport);
        return BinAssignment(vec2i(floor(pixel / binOptions.cellSizePixels)), valid);
      }`
    });
  }
}
