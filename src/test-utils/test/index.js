import test from 'tape-catch';

import {
  toLowPrecision,
  spy,
  makeSpy,
  gl,

  // Basic utility for rendering multiple scenes (could go into "deck.gl/core")
  SceneRenderer,

  // A utility that renders a list of scenes and compares against golden images
  RenderTest,

  // Node.js test drivers
  NodeTestDriver,
  RenderTestDriver
} from '@deck.gl/test-utils';

test('Top-level imports', t0 => {
  t0.test('import "deck.gl"', t => {
    t.ok(toLowPrecision, 'toLowPrecision symbol imported');
    t.ok(spy, 'spy symbol imported');
    t.ok(makeSpy, 'makeSpy symbol imported');
    t.ok(gl, 'gl symbol imported');
    t.ok(SceneRenderer, 'SceneRenderer symbol imported');
    t.ok(RenderTest, 'RenderTest symbol imported');

    t.ok(NodeTestDriver, 'SceneRenderer symbol imported');
    t.ok(RenderTestDriver, 'RenderTest symbol imported');

    t.end();
  });

  t0.end();
});
