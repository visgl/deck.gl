// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

// This spec uses a shared Deck instance across tests to keep the animation loop running.
// This is required for timeline/transition tests where timeline.setTime() needs to
// trigger re-renders between onAfterRender callbacks.

import {test, beforeAll, afterAll} from 'vitest';
import {
  createContainer,
  createDeck,
  removeContainer,
  finalizeDeck,
  updateDeckForTest,
  DeckTestContext,
  TestCase
} from '../deck-test-utils';
import testCases from './transitions';

const ctx: DeckTestContext = {
  deck: null,
  container: null
};

beforeAll(() => {
  ctx.container = createContainer();
  ctx.deck = createDeck(ctx.container);
});

// Note: No afterEach finalizeDeck - we keep the deck running between tests

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
  await updateDeckForTest(testCase, ctx);
});
