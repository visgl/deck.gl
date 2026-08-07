// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, beforeAll, beforeEach, afterAll, afterEach} from 'vitest';
import {
  createTestDevice,
  createContainer,
  createDeck,
  finalizeDeck,
  runRenderTest,
  updateDeckForTest,
  DeckTestContext,
  DeviceLossState,
  TestCase,
  TestDeviceType
} from './deck-test-utils';
import {OS} from './constants';

type RenderTestSuiteOptions = {
  beforeAll?: () => void | Promise<void>;
};

type SharedDeviceContext = {
  container: HTMLDivElement;
  device: Promise<NonNullable<DeckTestContext['device']>>;
  deviceLoss?: DeviceLossState;
};

type RenderTestGlobal = typeof globalThis & {
  __deckRenderTestDeviceContexts?: Partial<Record<TestDeviceType, SharedDeviceContext>>;
};

const renderTestGlobal = globalThis as RenderTestGlobal;
const sharedDeviceContexts =
  renderTestGlobal.__deckRenderTestDeviceContexts ||
  (renderTestGlobal.__deckRenderTestDeviceContexts = {});

export function isRenderTestDeviceEnabled(deviceType: TestDeviceType): boolean {
  const enabledDeviceType = import.meta.env.RENDER_TEST_DEVICE as TestDeviceType | null;
  return !enabledDeviceType || enabledDeviceType === deviceType;
}

async function getSharedDeviceContext(deviceType: TestDeviceType): Promise<{
  container: HTMLDivElement;
  device: NonNullable<DeckTestContext['device']>;
  deviceLoss: DeviceLossState;
}> {
  let sharedContext = sharedDeviceContexts[deviceType];
  if (sharedContext) {
    const device = await sharedContext.device;
    if (device.isLost || sharedContext.deviceLoss?.error) {
      sharedContext.container.remove();
      delete sharedDeviceContexts[deviceType];
      sharedContext = undefined;
    }
  }

  if (!sharedContext) {
    const container = createContainer(`deck-container-${deviceType}`);
    sharedContext = {
      container,
      device: createTestDevice(deviceType, container)
    };
    sharedDeviceContexts[deviceType] = sharedContext;
  }

  const device = await sharedContext.device;
  if (!sharedContext.deviceLoss) {
    const deviceLoss: DeviceLossState = {
      error: null,
      promise: device.lost.then(({reason, message}) => {
        const error = new Error(
          `Shared ${deviceType} device lost (${reason})${message ? `: ${message}` : ''}`
        );
        deviceLoss.error = error;
        return error;
      })
    };
    sharedContext.deviceLoss = deviceLoss;
  }

  return {
    container: sharedContext.container,
    device,
    deviceLoss: sharedContext.deviceLoss
  };
}

function activateSharedDeviceContext(deviceType: TestDeviceType): void {
  for (const [type, context] of Object.entries(sharedDeviceContexts)) {
    context!.container.style.display = type === deviceType ? 'block' : 'none';
  }
}

function cloneTestCases(testCases: TestCase[]): TestCase[] {
  return testCases.map(testCase => ({
    ...testCase,
    layers: testCase.layers.map(layer => layer.clone())
  }));
}

function registerTests(
  testCases: TestCase[],
  environment: Record<string, string>,
  runTest: (testCase: TestCase) => Promise<void>
): void {
  const environmentValues = Object.values(environment);
  const shouldSkip = ({skip}: TestCase): boolean =>
    skip === true || (Array.isArray(skip) && skip.some(value => environmentValues.includes(value)));
  const activeTests = testCases.filter(testCase => !shouldSkip(testCase));
  const skippedTests = testCases.filter(shouldSkip);

  skippedTests.forEach(testCase => {
    test.skip(testCase.name, () => {});
  });

  test.each(activeTests)(`$name:${environment['deviceType']}`, runTest);
}

export function runRenderTestSuite(
  testCases: TestCase[],
  deviceType: TestDeviceType,
  options: RenderTestSuiteOptions = {}
): void {
  if (!isRenderTestDeviceEnabled(deviceType)) {
    return;
  }

  const deviceTestCases = cloneTestCases(testCases);
  const ctx: DeckTestContext = {
    deck: null,
    container: null
  };

  beforeAll(async () => {
    const sharedContext = await getSharedDeviceContext(deviceType);
    ctx.container = sharedContext.container;
    ctx.device = sharedContext.device;
    ctx.deviceLoss = sharedContext.deviceLoss;
    activateSharedDeviceContext(deviceType);
    await options.beforeAll?.();
  });

  beforeEach(() => {
    activateSharedDeviceContext(deviceType);
  });

  afterEach(() => {
    finalizeDeck(ctx);
  });

  afterAll(() => {
    finalizeDeck(ctx);
    ctx.device = undefined;
    ctx.deviceLoss = undefined;
    ctx.container = null;
  });

  registerTests(deviceTestCases, {os: OS.toLowerCase(), deviceType}, testCase =>
    runRenderTest(testCase, ctx)
  );
}

export function runPersistentRenderTestSuite(
  testCases: TestCase[],
  deviceType: TestDeviceType
): void {
  if (!isRenderTestDeviceEnabled(deviceType)) {
    test.skip.each(testCases)(`$name:${deviceType}`, () => {});
    return;
  }

  const deviceTestCases = cloneTestCases(testCases);
  const ctx: DeckTestContext = {
    deck: null,
    container: null
  };

  beforeAll(async () => {
    const sharedContext = await getSharedDeviceContext(deviceType);
    ctx.container = sharedContext.container;
    ctx.device = sharedContext.device;
    ctx.deviceLoss = sharedContext.deviceLoss;
    activateSharedDeviceContext(deviceType);
    ctx.deck = createDeck(ctx.container, ctx.device);
  });

  beforeEach(() => {
    activateSharedDeviceContext(deviceType);
  });

  afterAll(() => {
    finalizeDeck(ctx);
    ctx.device = undefined;
    ctx.deviceLoss = undefined;
    ctx.container = null;
  });

  registerTests(deviceTestCases, {os: OS.toLowerCase(), deviceType}, testCase =>
    updateDeckForTest(testCase, ctx)
  );
}
