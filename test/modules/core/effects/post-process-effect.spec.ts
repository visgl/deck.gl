// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
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

test('PostProcessEffect#constructor', t => {
  const effect = new PostProcessEffect(testModule);

  t.ok(effect, 'post-processing effect created');
  t.end();
});

test('PostProcessEffect#postRender', t => {
  const effect = new PostProcessEffect(testModule);
  effect.setup({device});
  effect.preRender();
  const inputBuffer = device.createFramebuffer({colorAttachments: ['rgba8unorm']});
  const outputBuffer = device.createFramebuffer({colorAttachments: ['rgba8unorm']});

  const buffer1 = effect.postRender({inputBuffer, swapBuffer: outputBuffer});
  t.ok(effect.passes, 'post-processing pass created');

  t.ok(buffer1, 'post-processing effect rendered without throwing');
  t.is(buffer1, outputBuffer, 'post-processing effect buffer swapped');

  const testFbo = device.createFramebuffer({
    colorAttachments: [device.createTexture({width: 1, height: 1})]
  });
  const buffer2 = effect.postRender({
    inputBuffer,
    swapBuffer: outputBuffer,
    target: testFbo
  });
  t.ok(buffer2, 'post-processing effect rendered without throwing');
  t.is(buffer2, testFbo, 'post-processing effect rendered to target');

  effect.cleanup();
  inputBuffer.destroy();
  outputBuffer.destroy();
  testFbo.colorAttachments[0].destroy();
  testFbo.destroy();
  t.end();
});
