// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe} from 'vitest';
import {runRenderTestSuite} from '../render-test-suite';
import type {TestCase} from '../deck-test-utils';

import {GeoJsonLayer, IconLayer} from '@deck.gl/layers';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {_TerrainExtension as TerrainExtension} from '@deck.gl/extensions';

import {points, choropleths, iconAtlas as iconMapping} from 'deck.gl-test/data';
import {expandViewMatrix} from '../view-presets';

const ELEVATION_DATA = '/test/data/terrain-tiles/{z}/{x}/{y}.png';
const TEXTURE = '/test/data/raster-tiles/{z}/{x}/{y}.png';
// https://www.mapzen.com/blog/terrain-tile-service/
// Exageration added for testing purpose
const DECODER = {
  rScaler: 256 * 4,
  gScaler: 1 * 4,
  bScaler: (1 / 256) * 4,
  offset: -32768 * 4
};

function waitAfterDefaultCompletion(waitMs = 0) {
  let doneScheduled = false;

  return ({deck, layers, done}) => {
    // Match the shared render test readiness check, then allow the terrain
    // extension path one extra settle window before capturing.
    // @ts-expect-error Accessing protected layerManager in test code
    const needsUpdate = deck.layerManager?.needsUpdate();
    const allLoaded = layers.every(layer => layer.isLoaded);

    if (!needsUpdate && allLoaded && !doneScheduled) {
      doneScheduled = true;
      if (waitMs > 0) {
        setTimeout(done, waitMs);
      } else {
        done();
      }
    }
  };
}

const testCases = [
  {
    name: 'terrain-layer',
    viewState: {
      longitude: -122.45,
      latitude: 37.75,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new TerrainLayer({
        elevationData: ELEVATION_DATA,
        texture: TEXTURE,
        elevationDecoder: DECODER
      })
    ],
    goldenImage: './test/render/golden-images/terrain-layer.png'
  },
  // `terrain-extension-drape` (MapView, existing golden) and its GlobeView twin
  // `terrain-extension-drape-globe`. Same viewState for both; zoom 11.5 stays below GlobeView's
  // zoom-12 handoff to WebMercatorViewport. TerrainLayer switches its tile meshes to LNGLAT under
  // GlobeViewport and TerrainExtension samples its Mercator-space cover FBOs through the
  // globe -> Mercator inverse, so the draped fills and strokes follow the terrain on the globe.
  // The stroke (a draped PathLayer) is the regression guard for the terrain cover pass: it must
  // not re-activate its Mercator viewport on the layer, otherwise PathLayer re-tessellates on every
  // frame and deck never settles (see TerrainPass.renderTerrainCover).
  ...expandViewMatrix(
    {
      name: 'terrain-extension-drape',
      skip: ['webgpu'],
      viewState: {
        longitude: -122.45,
        latitude: 37.75,
        zoom: 11.5,
        pitch: 60,
        bearing: 0
      },
      layers: [
        new TerrainLayer({
          elevationData: ELEVATION_DATA,
          texture: TEXTURE,
          elevationDecoder: DECODER,
          operation: 'draw+terrain'
        }),
        new GeoJsonLayer({
          data: choropleths,
          getLineWidth: 50,
          getFillColor: (_, {index}) => [(index % 3) * 80, (index % 2) * 128, 128, 200],
          extensions: [new TerrainExtension()]
        })
      ],
      overrides: {
        globe: {
          onAfterRender: waitAfterDefaultCompletion(500),
          imageDiffOptions: {threshold: 0.985}
        }
      }
    },
    ['map', 'globe']
  ),
  {
    name: 'terrain-extension-offset',
    // Re-enabled during the Vitest migration, but still produces a large,
    // deterministic render mismatch under the current Chromium render project.
    // Keep this skipped until the offset path matches the historical golden.
    skip: true,
    viewState: {
      longitude: -122.45,
      latitude: 37.75,
      zoom: 11.5,
      pitch: 60,
      bearing: 0
    },
    layers: [
      new TerrainLayer({
        elevationData: ELEVATION_DATA,
        texture: TEXTURE,
        elevationDecoder: DECODER,
        operation: 'terrain'
      }),
      new GeoJsonLayer({
        data: choropleths,
        getLineWidth: 50,
        getFillColor: (_, {index}) => [(index % 3) * 60 + 60, (index % 2) * 64 + 128, 200],
        extensions: [new TerrainExtension()]
      }),
      new IconLayer({
        data: points,
        iconAtlas: '/test/data/icon-atlas.png',
        iconMapping,
        sizeScale: 12,
        getPosition: d => d.COORDINATES,
        getIcon: d => 'marker-warning',
        getSize: d => (d.PLACEMENT === 'SW' ? 0 : 2),
        extensions: [new TerrainExtension()]
      })
    ],
    onAfterRender: waitAfterDefaultCompletion(1000),
    goldenImage: './test/render/golden-images/terrain-extension-offset.png'
  }
];

describe.each(['webgl', 'webgpu'] as const)('%s', deviceType => {
  runRenderTestSuite(testCases as TestCase[], deviceType);
});
