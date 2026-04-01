// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, beforeAll, afterAll, afterEach} from 'vitest';
import {
  createContainer,
  removeContainer,
  finalizeDeck,
  runRenderTest,
  DeckTestContext,
  TestCase
} from '../deck-test-utils';
import testCases from './a5-layer';

const ctx: DeckTestContext = {
  deck: null,
  container: null
};

beforeAll(() => {
  ctx.container = createContainer();
});

afterEach(() => {
  finalizeDeck(ctx);
});

afterAll(() => {
  finalizeDeck(ctx);
  removeContainer(ctx.container);
  ctx.container = null;
});

const activeTests = (testCases as TestCase[]).filter(tc => !tc.skip);
const skippedTests = (testCases as TestCase[]).filter(tc => tc.skip);

skippedTests.forEach(tc => {
  test.skip(tc.name, () => {});
});

test.each(activeTests)('$name', async testCase => {
  await runRenderTest(testCase, ctx);
});
