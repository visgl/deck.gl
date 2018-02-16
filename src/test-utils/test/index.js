import test from 'tape-catch';

import {SceneRenderer, RenderTest, RenderTestDriver, toLowPrecision, gl} from '@deck.gl/test-utils';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {
    t.ok(toLowPrecision, 'toLowPrecision symbol imported');
    t.ok(gl, 'gl symbol imported');
    t.ok(SceneRenderer, 'SceneRenderer symbol imported');
    t.ok(RenderTest, 'RenderTest symbol imported');

    t.ok(RenderTestDriver, 'RenderTest symbol imported');

    t.end();
  });

  t0.end();
});
