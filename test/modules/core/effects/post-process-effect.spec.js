import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';
import {Framebuffer} from '@luma.gl/core';
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

test('PostProcessEffect#prepare', t => {
  const effect = new PostProcessEffect(testModule);
  effect.prepare(gl);
  t.ok(effect.passes, 'post-processing pass created');
  t.equal(effect.passes.length, 1, 'post-processing pass length is right');
  effect.cleanup();

  t.end();
});

test('PostProcessEffect#render', t => {
  const effect = new PostProcessEffect(testModule);
  effect.prepare(gl);
  const inputBuffer = new Framebuffer(gl);
  const outputBuffer = new Framebuffer(gl);

  const params1 = effect.render({inputBuffer, outputBuffer});
  t.ok(params1, 'post-processing effect rendered without throwing');
  t.deepEqual(
    params1,
    {inputBuffer: outputBuffer, outputBuffer: inputBuffer},
    'post-processing effect buffer swapped'
  );

  const params2 = effect.render({
    inputBuffer,
    outputBuffer,
    target: Framebuffer.getDefaultFramebuffer(gl)
  });
  t.ok(params2, 'post-processing effect rendered without throwing');
  t.deepEqual(
    params2,
    {inputBuffer: outputBuffer, outputBuffer: inputBuffer},
    'post-processing effect buffer swapped'
  );

  effect.cleanup();
  inputBuffer.delete();
  outputBuffer.delete();
  t.end();
});
