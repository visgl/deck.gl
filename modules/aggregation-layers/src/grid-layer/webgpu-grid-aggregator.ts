// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {WebGPUAggregator} from '../common/aggregator/webgpu-aggregator/webgpu-aggregator';
import {binOptionsUniforms} from './bin-options-uniforms';

/** Common-space grid bin assignment with independent color and elevation channels. @internal */
export class WebGPUGridAggregator extends WebGPUAggregator {
  constructor(device: Device) {
    super(device, {
      channelNames: ['colorWeights', 'elevationWeights'],
      binOptions: binOptionsUniforms,
      binning: `fn getBin(position: vec3f, low: vec3f) -> BinAssignment {
        // The aggregation viewport supplies coordinates relative to the cell origin.
        let positionCommon = project_position_vec3_f64(position, low);
        return BinAssignment(vec2i(floor(positionCommon.xy / binOptions.cellSizeCommon)), true);
      }`
    });
  }
}
