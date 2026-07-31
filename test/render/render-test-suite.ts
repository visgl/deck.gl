// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, beforeAll, afterAll, afterEach} from 'vitest';
import {
  createTestDevice,
  createContainer,
  createDeck,
  removeContainer,
  finalizeDeck,
  runRenderTest,
  updateDeckForTest,
  DeckTestContext,
  TestCase,
  TestDeviceType
} from './deck-test-utils';

type RenderTestSuiteOptions = {
  beforeAll?: () => void | Promise<void>;
};

function cloneTestCases(testCases: TestCase[]): TestCase[] {
  return testCases.map(testCase => ({
    ...testCase,
    layers: testCase.layers.map(layer => layer.clone())
  }));
}

function registerTests(
  testCases: TestCase[],
  runTest: (testCase: TestCase) => Promise<void>
): void {
  const activeTests = testCases.filter(testCase => !testCase.skip);
  const skippedTests = testCases.filter(testCase => testCase.skip);

  skippedTests.forEach(testCase => {
    test.skip(testCase.name, () => {});
  });

  test.each(activeTests)('$name', runTest);
}

export function runRenderTestSuite(
  testCases: TestCase[],
  deviceType: TestDeviceType,
  options: RenderTestSuiteOptions = {}
): void {
  const deviceTestCases = cloneTestCases(testCases);
  const ctx: DeckTestContext = {
    deck: null,
    container: null
  };

  beforeAll(async () => {
    ctx.container = createContainer();
    ctx.device = await createTestDevice(deviceType, ctx.container);
    await options.beforeAll?.();
  });

  afterEach(() => {
    finalizeDeck(ctx);
  });

  afterAll(() => {
    finalizeDeck(ctx);
    ctx.device?.destroy();
    ctx.device = undefined;
    removeContainer(ctx.container);
    ctx.container = null;
  });

  registerTests(deviceTestCases, testCase => runRenderTest(testCase, ctx));
}

export function runPersistentRenderTestSuite(
  testCases: TestCase[],
  deviceType: TestDeviceType
): void {
  const deviceTestCases = cloneTestCases(testCases);
  const ctx: DeckTestContext = {
    deck: null,
    container: null
  };

  beforeAll(async () => {
    ctx.container = createContainer();
    ctx.device = await createTestDevice(deviceType, ctx.container);
    ctx.deck = createDeck(ctx.container, ctx.device);
  });

  afterAll(() => {
    finalizeDeck(ctx);
    ctx.device?.destroy();
    ctx.device = undefined;
    removeContainer(ctx.container);
    ctx.container = null;
  });

  registerTests(deviceTestCases, testCase => updateDeckForTest(testCase, ctx));
}
