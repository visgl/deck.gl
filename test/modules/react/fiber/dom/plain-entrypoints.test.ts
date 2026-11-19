// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, describe, expect, it, vi} from 'vitest';

// The optional peers: each subpath that needs one loads it, and the root loads none of them.
const OPTIONAL_PEERS = [
  '@deck.gl/aggregation-layers',
  '@deck.gl/geo-layers',
  '@deck.gl/google-maps',
  '@deck.gl/layers',
  '@deck.gl/mapbox',
  '@deck.gl/maplibre',
  '@deck.gl/mesh-layers',
  '@deck.gl/widgets'
];

afterEach(() => {
  for (const name of OPTIONAL_PEERS) {
    vi.doUnmock(name);
  }
  vi.resetModules();
});

function blockImports(names: string[]) {
  for (const name of names) {
    vi.doMock(name, () => {
      throw new Error(`This entrypoint must not load ${name}.`);
    });
  }
}

describe('plain entrypoint isolation', () => {
  it('loads the native root and the factories without any optional peer', async () => {
    blockImports(OPTIONAL_PEERS);

    const dom = await import('@deck.gl/react/dom');

    expect(dom.DeckGL).toBeDefined();
    expect(dom.createLayerComponent).toBeDefined();
  });

  it('loads /layers without the other layer packages', async () => {
    blockImports(OPTIONAL_PEERS.filter(name => name !== '@deck.gl/layers'));

    const layers = await import('@deck.gl/react/wrappers/layers');

    expect(layers.ScatterplotLayer).toBeDefined();
  });

  it('loads /google-maps without the other optional peers', async () => {
    blockImports(OPTIONAL_PEERS.filter(name => name !== '@deck.gl/google-maps'));

    const googleMaps = await import('@deck.gl/react/dom/google-maps');

    expect(googleMaps.DeckGL).toBeDefined();
  });

  it('loads /core without any optional peer', async () => {
    blockImports(OPTIONAL_PEERS);

    const core = await import('@deck.gl/react/wrappers/core');

    expect(core.MapView).toBeDefined();
  });
});
