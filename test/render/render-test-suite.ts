// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, beforeAll, beforeEach, afterAll, afterEach} from 'vitest';
import {
  createTestDevice,
  createContainer,
  createDeck,
  removeContainer,
  finalizeDeck,
  runRenderTest,
  updateDeckForTest,
  DeckTestContext,
  DeviceLossState,
  TestCase,
  TestDeviceType
} from './deck-test-utils';
import {OS} from './constants';

type BaseRenderTestSuiteOptions = {
  beforeAll?: () => void | Promise<void>;
};

type RenderTestSuiteOptions = BaseRenderTestSuiteOptions &
  (
    | {
        deviceMode?: 'shared';
        webgl?: never;
      }
    | {
        deviceMode: 'isolated';
        /** WebGL context attributes for the suite's isolated device. */
        webgl?: {antialias?: boolean};
      }
  );

type SharedDeviceContext = {
  container: HTMLDivElement;
  device: Promise<NonNullable<DeckTestContext['device']>>;
  deviceLoss?: DeviceLossState;
};

type RenderTestGlobal = typeof globalThis & {
  __deckRenderTestDeviceContexts?: Partial<Record<TestDeviceType, SharedDeviceContext>>;
  __deckRenderTestDeviceContainers?: Set<HTMLDivElement>;
};

const renderTestGlobal = globalThis as RenderTestGlobal;
const sharedDeviceContexts =
  renderTestGlobal.__deckRenderTestDeviceContexts ||
  (renderTestGlobal.__deckRenderTestDeviceContexts = {});
const deviceContextContainers =
  renderTestGlobal.__deckRenderTestDeviceContainers ||
  (renderTestGlobal.__deckRenderTestDeviceContainers = new Set());

let isolatedDeviceContextCount = 0;

export function isRenderTestDeviceEnabled(deviceType: TestDeviceType): boolean {
  const enabledDeviceType = import.meta.env.RENDER_TEST_DEVICE as TestDeviceType | null;
  return !enabledDeviceType || enabledDeviceType === deviceType;
}

function createDeviceLossState(
  device: NonNullable<DeckTestContext['device']>,
  label: string
): DeviceLossState {
  const deviceLoss: DeviceLossState = {
    error: null,
    promise: device.lost.then(({reason, message}) => {
      const error = new Error(`${label} device lost (${reason})${message ? `: ${message}` : ''}`);
      deviceLoss.error = error;
      return error;
    })
  };
  return deviceLoss;
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
      deviceContextContainers.delete(sharedContext.container);
      removeContainer(sharedContext.container);
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
  deviceContextContainers.add(sharedContext.container);

  const device = await sharedContext.device;
  if (!sharedContext.deviceLoss) {
    sharedContext.deviceLoss = createDeviceLossState(device, `Shared ${deviceType}`);
  }

  return {
    container: sharedContext.container,
    device,
    deviceLoss: sharedContext.deviceLoss
  };
}

async function createIsolatedDeviceContext(
  deviceType: TestDeviceType,
  /** Additional WebGL context attributes. MSAA is disabled by default. */
  webgl?: {antialias?: boolean}
): Promise<{
  container: HTMLDivElement;
  device: NonNullable<DeckTestContext['device']>;
  deviceLoss: DeviceLossState;
}> {
  const contextId = isolatedDeviceContextCount++;
  const container = createContainer(`deck-container-${deviceType}-isolated-${contextId}`);
  deviceContextContainers.add(container);
  try {
    const device = await createTestDevice(deviceType, container, webgl);
    return {container, device, deviceLoss: createDeviceLossState(device, `Isolated ${deviceType}`)};
  } catch (error) {
    deviceContextContainers.delete(container);
    removeContainer(container);
    throw error;
  }
}

function activateDeviceContext(container: HTMLDivElement): void {
  for (const deviceContainer of deviceContextContainers) {
    deviceContainer.style.display = deviceContainer === container ? 'block' : 'none';
  }
  container.style.display = 'block';
}

async function finalizeDeckAfterGPUWork(ctx: DeckTestContext): Promise<void> {
  const device = ctx.device;
  try {
    if (device?.type === 'webgpu' && !device.isLost) {
      await (device.handle as GPUDevice).queue.onSubmittedWorkDone();
    }
  } finally {
    finalizeDeck(ctx);
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

function getRenderTestEnvironment(
  deviceType: TestDeviceType,
  options: RenderTestSuiteOptions = {}
): Record<string, string> {
  const webglAntialiasing = options.webgl?.antialias ?? false;
  return {
    os: OS.toLowerCase(),
    deviceType,
    multisampling: deviceType === 'webgl' && webglAntialiasing ? 'msaa' : 'no-msaa'
  };
}

export function runRenderTestSuite(
  testCases: TestCase[],
  deviceType: TestDeviceType,
  options: RenderTestSuiteOptions = {}
): void {
  if (!isRenderTestDeviceEnabled(deviceType)) {
    test.skip(`${deviceType}`, () => {});
    return;
  }

  const deviceTestCases = cloneTestCases(testCases);
  const ctx: DeckTestContext = {
    deck: null,
    container: null
  };
  const isIsolated = options.deviceMode === 'isolated';

  beforeAll(async () => {
    const deviceContext = isIsolated
      ? await createIsolatedDeviceContext(deviceType, options.webgl)
      : await getSharedDeviceContext(deviceType);
    ctx.container = deviceContext.container;
    ctx.device = deviceContext.device;
    ctx.deviceLoss = deviceContext.deviceLoss;
    activateDeviceContext(deviceContext.container);
    await options.beforeAll?.();
  });

  beforeEach(() => {
    activateDeviceContext(ctx.container!);
  });

  afterEach(async () => {
    await finalizeDeckAfterGPUWork(ctx);
  });

  afterAll(async () => {
    const device = ctx.device;
    const container = ctx.container;
    try {
      await finalizeDeckAfterGPUWork(ctx);
    } finally {
      if (isIsolated) {
        device?.destroy();
        deviceContextContainers.delete(container!);
        removeContainer(container);
      }
      ctx.device = undefined;
      ctx.deviceLoss = undefined;
      ctx.container = null;
    }
  });

  registerTests(deviceTestCases, getRenderTestEnvironment(deviceType, options), testCase =>
    runRenderTest(testCase, ctx)
  );
}

export function runPersistentRenderTestSuite(
  testCases: TestCase[],
  deviceType: TestDeviceType
): void {
  if (!isRenderTestDeviceEnabled(deviceType)) {
    test.skip(`${deviceType}`, () => {});
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
    activateDeviceContext(sharedContext.container);
    ctx.deck = createDeck(ctx.container, ctx.device);
  });

  beforeEach(() => {
    activateDeviceContext(ctx.container!);
  });

  afterAll(async () => {
    await finalizeDeckAfterGPUWork(ctx);
    ctx.device = undefined;
    ctx.deviceLoss = undefined;
    ctx.container = null;
  });

  registerTests(deviceTestCases, getRenderTestEnvironment(deviceType), testCase =>
    updateDeckForTest(testCase, ctx)
  );
}
