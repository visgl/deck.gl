// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`SimpleMeshLayer picks indexed Arrow instances on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();

    const type = new FixedSizeList(2, new Field('value', new Float32(), false));
    const positions = vectorFromArray([[-24, 0]], type).concat(vectorFromArray([[24, 0]], type));
    const layer = new SimpleMeshLayer({
      positions,
      mesh: {
        attributes: {
          positions: {size: 3, value: new Float32Array([-6, -6, 0, 6, -6, 0, 0, 6, 0])}
        },
        indices: {size: 1, value: new Uint16Array([0, 1, 2])}
      },
      getTranslation: [10, 0, 0],
      pickable: true
    });
    const parent = document.createElement('div');
    document.body.appendChild(parent);
    const errors: Error[] = [];
    const deck = new Deck({
      device: testDevice,
      parent,
      width: 128,
      height: 128,
      useDevicePixels: false,
      views: new OrthographicView(),
      initialViewState: {target: [0, 0, 0], zoom: 0},
      layers: [layer],
      onError: error => errors.push(error)
    });
    try {
      await new Promise<void>(resolve => {
        deck.setProps({
          onAfterRender: () => {
            if (layer.isLoaded || errors.length) resolve();
          }
        });
      });
      expect(errors).toEqual([]);
      expect(layer.getNumInstances()).toBe(2);
      expect(layer.getBounds()).toEqual([
        [-24, 0, 0],
        [24, 0, 0]
      ]);
      expect((await deck.pickObjectAsync({x: 50, y: 64}))?.index).toBe(0);
      expect((await deck.pickObjectAsync({x: 98, y: 64}))?.index).toBe(1);
    } finally {
      deck.finalize();
      parent.remove();
    }
  });
}
