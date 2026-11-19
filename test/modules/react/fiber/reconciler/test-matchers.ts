import {expect} from 'vitest';

import type {TestDeckRenderer} from './test-renderer';

interface CustomMatchers<R = unknown> {
  toHaveLayer(id: string): R;
  toHaveLayerOrder(ids: string[]): R;
  toHaveNoDuplicateIds(): R;
}

declare module 'vitest' {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface Assertion<T = unknown> extends CustomMatchers<T> {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type, @typescript-eslint/no-empty-interface
  interface AsymmetricMatchersContaining extends CustomMatchers {}
}

expect.extend({
  toHaveLayer(deck: TestDeckRenderer, id: string) {
    const layer = deck.findLayerById(id);
    return {
      message: () =>
        layer
          ? `Expected not to find layer "${id}"`
          : `Expected to find layer "${id}" but got: ${deck.getLayerIds().join(', ') || '(none)'}`,
      pass: Boolean(layer)
    };
  },

  toHaveLayerOrder(deck: TestDeckRenderer, expectedIds: string[]) {
    const actualIds = deck.getLayerIds();
    const pass = JSON.stringify(actualIds) === JSON.stringify(expectedIds);
    return {
      message: () =>
        pass
          ? ''
          : `Expected layer order [${expectedIds.join(', ')}] but got [${actualIds.join(', ')}]`,
      pass
    };
  },

  toHaveNoDuplicateIds(deck: TestDeckRenderer) {
    const ids = deck.getLayerIds();
    const duplicates = ids.filter((id, i) => ids.indexOf(id) !== i);
    return {
      message: () =>
        duplicates.length === 0
          ? ''
          : `Expected no duplicate layer IDs but found: ${duplicates.join(', ')}`,
      pass: duplicates.length === 0
    };
  }
});
