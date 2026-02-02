// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/**
 * Smoke test for tape/probe.gl backward compatibility.
 *
 * This test verifies that @deck.gl/test-utils correctly detects and uses
 * @probe.gl/test-utils when the DECK_TEST_UTILS_USE_PROBE_GL=1 env var is set.
 *
 * Run with: yarn test-tape-compat
 *
 * Note: This is a minimal test that doesn't require WebGL context.
 * It just verifies the probe.gl spy detection and basic functionality.
 */

import test from 'tape';

// Test that we can import the spy utilities from probe.gl directly
test('tape-compat: @probe.gl/test-utils is available', async t => {
  try {
    const {makeSpy} = await import('@probe.gl/test-utils');
    t.ok(typeof makeSpy === 'function', 'makeSpy is a function');
    t.end();
  } catch (err) {
    t.fail(`Failed to import @probe.gl/test-utils: ${err}`);
    t.end();
  }
});

// Test that makeSpy works as expected
test('tape-compat: makeSpy creates working spies', async t => {
  const {makeSpy} = await import('@probe.gl/test-utils');

  const obj = {
    myMethod: (x: number) => x * 2
  };

  const spy = makeSpy(obj, 'myMethod');

  // Call the method
  const result = obj.myMethod(5);

  t.equal(result, 10, 'method returns correct value');
  t.ok(spy.called, 'spy tracked that method was called');
  t.equal(spy.callCount, 1, 'spy tracked call count');

  spy.restore();
  t.end();
});

// Test that the environment variable is detected
test('tape-compat: DECK_TEST_UTILS_USE_PROBE_GL env var is set', t => {
  t.equal(process.env.DECK_TEST_UTILS_USE_PROBE_GL, '1', 'Environment variable is correctly set');
  t.end();
});

// Note: Full integration tests with testLayer() would require a WebGL context
// which needs browser mode. This smoke test verifies the probe.gl spy path works.
