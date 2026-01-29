// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {device} from '@deck.gl/test-utils';
import PostProcessEffect from '@deck.gl/core/effects/post-process-effect';

const fs = `\
vec4 testEffect_sampleColor(sampler2D texture, vec2 texSize, vec2 texCoord) {
  return vec4(1.0, 0.0, 0.0, 0.0);
}
`;

const uniforms = {};

const testModule = {
  name: 'testEffect',
  uniforms,
  fs,
  passes: [{sampler: true}]
};

test('PostProcessEffect#constructor', () => {
  const effect = new PostProcessEffect(testModule);

  expect(effect, 'post-processing effect created').toBeTruthy();
});

test('PostProcessEffect#postRender', () => {
  const effect = new PostProcessEffect(testModule);
  effect.setup({device});
  effect.preRender();
  const inputBuffer = device.createFramebuffer({colorAttachments: ['rgba8unorm']});
  const outputBuffer = device.createFramebuffer({colorAttachments: ['rgba8unorm']});

  const buffer1 = effect.postRender({inputBuffer, swapBuffer: outputBuffer});
  expect(effect.passes, 'post-processing pass created').toBeTruthy();

  expect(buffer1, 'post-processing effect rendered without throwing').toBeTruthy();
  expect(buffer1, 'post-processing effect buffer swapped').toBe(outputBuffer);

  const testFbo = device.createFramebuffer({
    colorAttachments: [device.createTexture({width: 1, height: 1})]
  });
  const buffer2 = effect.postRender({
    inputBuffer,
    swapBuffer: outputBuffer,
    target: testFbo
  });
  expect(buffer2, 'post-processing effect rendered without throwing').toBeTruthy();
  expect(buffer2, 'post-processing effect rendered to target').toBe(testFbo);

  effect.cleanup();
  inputBuffer.destroy();
  outputBuffer.destroy();
  testFbo.colorAttachments[0].destroy();
  testFbo.destroy();
});
