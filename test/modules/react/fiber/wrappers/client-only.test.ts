// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors
// Copyright (c) Deckgl Fiber Renderer contributors

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
  ['core', () => import('@deck.gl/react/wrappers/core')],
  ['layers', () => import('@deck.gl/react/wrappers/layers')],
  ['geo-layers', () => import('@deck.gl/react/wrappers/geo-layers')],
  ['aggregation-layers', () => import('@deck.gl/react/wrappers/aggregation-layers')],
  ['mesh-layers', () => import('@deck.gl/react/wrappers/mesh-layers')],
  ['widgets', () => import('@deck.gl/react/wrappers/widgets')]
])('the /%s subpath imports client-only', async (_name, load) => {
  await load();
  expect(imports).toBe(1);
});
