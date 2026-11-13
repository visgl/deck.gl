// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Device} from '@luma.gl/core';
import {WebGPUAggregator} from '../common/aggregator/webgpu-aggregator/webgpu-aggregator';
import {binOptionsUniforms} from './bin-options-uniforms';

/** Hexagonal bin assignment for the shared two-channel reducer. @internal */
export class WebGPUHexagonAggregator extends WebGPUAggregator {
  constructor(device: Device) {
    super(device, {
      channelNames: ['colorWeights', 'elevationWeights'],
      binOptions: binOptionsUniforms,
      binning: `fn getBin(position: vec3f, low: vec3f) -> BinAssignment {
        let positionCommon = project_position_vec3_f64(position, low);
        var p = positionCommon.xy / (binOptions.radiusCommon * vec2f(1.7320508075688772, 1.5));
        var j = floor(p.y + 0.5);
        let parity = f32(i32(j) & 1);
        p.x -= parity * 0.5;
        var i = floor(p.x + 0.5);
        let d1 = p - vec2f(i, j);
        if (abs(d1.y) * 3.0 > 1.0) {
          let v2 = vec2f(select(-0.5, 0.5, d1.x >= 0.0), select(-1.0, 1.0, d1.y >= 0.0));
          let d2 = d1 - v2;
          if (dot(d1, d1) > dot(d2, d2)) {
            i += v2.x + parity - 0.5;
            j += v2.y;
          }
        }
        return BinAssignment(vec2i(i32(i), i32(j)), true);
      }`
    });
  }
}
