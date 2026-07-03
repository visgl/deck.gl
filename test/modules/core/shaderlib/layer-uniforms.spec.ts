// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {layerUniforms} from '@deck.gl/core/shaderlib/misc/layer-uniforms';

test('layerUniforms exposes animation clocks without another binding', () => {
  expect(layerUniforms.uniformTypes).toEqual({
    opacity: 'f32',
    timelineTime: 'f32',
    engineTime: 'f32',
    frameIndex: 'u32'
  });
  expect(
    layerUniforms.source.match(/var<uniform>/g),
    'all four values share the existing layer uniform binding'
  ).toHaveLength(1);
  expect(
    layerUniforms.getUniforms({
      opacity: 1,
      timelineTime: 12.5,
      engineTime: 4.25,
      frameIndex: 7
    })
  ).toEqual({
    opacity: 1,
    timelineTime: 12.5,
    engineTime: 4.25,
    frameIndex: 7
  });
});
