import test from 'tape-catch';
import {gl} from '@deck.gl/test-utils';
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
