import {beforeEach, expect, test, vi} from 'vitest';

// `client-only` throws when a React Server Component imports it, so every subpath that renders
// deck.gl classes has to import it, like the root does.
let imports = 0;

beforeEach(() => {
  vi.resetModules();
  imports = 0;
  vi.doMock('client-only', () => {
    imports++;
    return {};
  });
});

test.each([
  ['core', () => import('../core')],
  ['layers', () => import('../layers')],
  ['geo-layers', () => import('../geo-layers')],
  ['aggregation-layers', () => import('../aggregation-layers')],
  ['mesh-layers', () => import('../mesh-layers')],
  ['widgets', () => import('../widgets')]
])('the /%s subpath imports client-only', async (_name, load) => {
  await load();
  expect(imports).toBe(1);
});
