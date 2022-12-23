import test from 'tape-promise/tape';
import {device} from '@deck.gl/test-utils';
import {Framebuffer} from '@luma.gl/webgl-legacy';
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
  effect.preRender(device);
  const inputBuffer = new Framebuffer(device);
  const outputBuffer = new Framebuffer(device);

  const buffer1 = effect.postRender(device, {inputBuffer, swapBuffer: outputBuffer});
  t.ok(effect.passes, 'post-processing pass created');

  t.ok(buffer1, 'post-processing effect rendered without throwing');
  t.is(buffer1, outputBuffer, 'post-processing effect buffer swapped');

  const buffer2 = effect.postRender(device, {
    inputBuffer,
    swapBuffer: outputBuffer,
    target: Framebuffer.getDefaultFramebuffer(device)
  });
  t.ok(buffer2, 'post-processing effect rendered without throwing');
  t.is(
    buffer2,
    Framebuffer.getDefaultFramebuffer(device),
    'post-processing effect rendered to target'
  );

  effect.cleanup();
  inputBuffer.delete();
  outputBuffer.delete();
  t.end();
});
