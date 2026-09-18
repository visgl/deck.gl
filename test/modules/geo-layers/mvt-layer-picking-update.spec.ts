// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {Deck, MapView} from '@deck.gl/core';
import {MVTLayer} from '@deck.gl/geo-layers';
import {geojsonToBinary} from '@loaders.gl/gis';
import type {Feature, Polygon} from 'geojson';

test('MVTLayer#picking after polygon tile data shrinks', async () => {
  const errors: Error[] = [];
  const deck = new Deck({
    width: 400,
    height: 400,
    views: new MapView(),
    initialViewState: {longitude: 0, latitude: 0, zoom: 0},
    controller: false,
    onError: error => errors.push(error)
  });

  try {
    await vi.waitFor(() => expect(deck.isInitialized).toBe(true));

    // Keep the layer/tile identity so shrinking data reuses the larger GPU buffers.
    for (const count of [2, 1, 2, 1]) {
      const features: Feature<Polygon>[] = Array.from({length: count}, (_, index) => ({
        type: 'Feature',
        properties: {name: `polygon-${index}`},
        geometry: {
          type: 'Polygon',
          coordinates: [
            [
              [0.45, 0.45],
              [0.55, 0.45],
              [0.55, 0.55],
              [0.45, 0.55],
              [0.45, 0.45]
            ]
          ]
        }
      }));
      const data = geojsonToBinary(features);
      let loaded = false;
      deck.setProps({
        layers: [
          new MVTLayer({
            id: 'polygon-tile',
            data: `https://example.com/{z}/{x}/{y}.mvt?count=${count}`,
            minZoom: 0,
            maxZoom: 0,
            binary: true,
            fetch: async () => data,
            pickable: true,
            stroked: false,
            onViewportLoad: () => {
              loaded = true;
            }
          })
        ]
      });
      await vi.waitFor(() => expect(loaded).toBe(true));
      deck.redraw(true);

      const info = deck.pickObject({x: 200, y: 200});
      expect(info?.index).toBe(count - 1);
      expect(info?.object.properties.name).toBe(`polygon-${count - 1}`);
    }
    expect(errors).toEqual([]);
  } finally {
    deck.finalize();
  }
});
