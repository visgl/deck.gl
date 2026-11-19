import type {Layer, View} from '@deck.gl/core';
import {log} from '@deck.gl/core';
import {expect, vi} from 'vitest';

import type {HostContext, Instance} from '../types';

/**
 * Creates a mock Instance wrapper
 */
export function createMockInstance(node: Layer | View, children: Instance[] = []): Instance {
  return {children, node};
}

/**
 * Creates a mock HostContext
 */
export function createMockHostContext(overrides?: Partial<HostContext>): HostContext {
  const mockStore = {
    destroy: vi.fn<() => void>(),
    getState: vi.fn<() => {deckgl: undefined}>(() => ({deckgl: undefined})),
    setState: vi.fn<() => void>(),
    subscribe: vi.fn<() => void>()
  };

  return {
    insideView: false,
    store: mockStore as unknown,
    ...overrides
  } as HostContext;
}

/**
 * Asserts instance structure is valid
 */
export function assertValidInstance(instance: Instance | undefined): void {
  expect(instance).toBeDefined();
  expect(instance).toHaveProperty('node');
  expect(instance).toHaveProperty('children');
  expect(Array.isArray(instance?.children)).toBeTruthy();
}

/**
 * Sets up console spies for warning/error detection
 */
export function setupLogSpy() {
  // probe.gl log methods return the function that prints, so the mocks return a no-op.
  const errorSpy = vi.spyOn(log, 'error').mockReturnValue(() => {});
  const warnSpy = vi.spyOn(log, 'warn').mockReturnValue(() => {});

  return {errorSpy, warnSpy};
}
