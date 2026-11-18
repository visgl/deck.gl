// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, expect, it} from 'vitest';
import * as dom from '@deck.gl/react/dom/index';
import * as googleMaps from '@deck.gl/react/dom/google-maps';
import * as mapbox from '@deck.gl/react/dom/mapbox';
import * as maplibre from '@deck.gl/react/dom/maplibre';
import packageJson from '../../../../../modules/react/package.json';

describe('native entrypoint export matrix', () => {
  it('exports standalone APIs from the package root entrypoint', () => {
    // package.json maps `.` to this module.
    expect(Object.keys(dom).sort()).toEqual([
      'DeckCanvas',
      'DeckGL',
      'createDeckGL',
      'createEffectComponent',
      'createLayerComponent',
      'createViewComponent',
      'createWidgetComponent'
    ]);
    expect(dom).not.toHaveProperty('Deckgl');
  });

  it('exports provider-bound roots without adding them to the default module', () => {
    expect(Object.keys(mapbox).sort()).toEqual(['DeckGL']);
    expect(Object.keys(maplibre).sort()).toEqual(['DeckGL']);
    expect(Object.keys(googleMaps).sort()).toEqual(['DeckGL']);
    expect(mapbox.DeckGL).not.toBe(dom.DeckGL);
    expect(maplibre.DeckGL).not.toBe(dom.DeckGL);
    expect(googleMaps.DeckGL).not.toBe(dom.DeckGL);
  });

  it('publishes only the public entry points and requires only deck.gl core, widgets and React', () => {
    expect(Object.keys(packageJson.exports)).toEqual([
      '.',
      './legacy',
      './mapbox',
      './maplibre',
      './google-maps',
      './core',
      './layers',
      './geo-layers',
      './aggregation-layers',
      './mesh-layers',
      './widgets',
      './reconciler',
      './package.json'
    ]);

    const optionalPeers = Object.keys(packageJson.peerDependenciesMeta);
    const requiredPeers = Object.keys(packageJson.peerDependencies).filter(
      name => !optionalPeers.includes(name)
    );
    // `@deck.gl/widgets` stays required for `@deck.gl/react/legacy`.
    expect(requiredPeers).toEqual(['@deck.gl/core', '@deck.gl/widgets', 'react', 'react-dom']);
  });
});
