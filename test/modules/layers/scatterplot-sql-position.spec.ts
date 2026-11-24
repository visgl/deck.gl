// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Deck, OrthographicView} from '@deck.gl/core';
import {ScatterplotLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {tableFromArrays} from 'apache-arrow';
import {expect, test, vi} from 'vitest';

for (const backend of ['webgl', 'webgpu'] as const) {
  for (const Coordinates of [Float32Array, Float64Array]) {
    test(`Scatterplot draws SQL ARRAY positions from ${Coordinates.name} on ${backend}`, async ({
      skip
    }) => {
      const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
      if (!testDevice) {
        return skip();
      }
      const layer = new ScatterplotLayer({
        id: 'sql-positions',
        data: tableFromArrays({
          x: new Coordinates([-20, 20]),
          y: new Coordinates([0, 0])
        }),
        getPosition: {sql: 'ARRAY[x, y]'},
        radiusUnits: 'pixels',
        getRadius: 6,
        pickable: true
      });
      const errors: Error[] = [];
      const deck = new Deck({
        device: testDevice,
        width: 128,
        height: 128,
        useDevicePixels: false,
        views: new OrthographicView(),
        initialViewState: {target: [0, 0, 0], zoom: 0},
        layers: [layer],
        onError: error => errors.push(error)
      });
      try {
        await vi.waitFor(
          () => {
            expect(errors).toEqual([]);
            expect(layer.isLoaded).toBe(true);
            const positions = layer.internalState?.accessorQueries?.table?.getChild('getPosition');
            expect(positions?.getChildAt(0)?.toArray()).toBeInstanceOf(Coordinates);
            expect(layer.getBounds()).toEqual([
              [-20, 0, 0],
              [20, 0, 0]
            ]);
            deck.redraw('draw SQL positions');
          },
          {timeout: 5000}
        );
        expect((await deck.pickObjectAsync({x: 44, y: 64}))?.index).toBe(0);
        expect((await deck.pickObjectAsync({x: 84, y: 64}))?.index).toBe(1);
      } finally {
        deck.finalize();
      }
    });
  }
}
