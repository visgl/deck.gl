// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {IconLayer} from '@deck.gl/layers';
import {device} from '@deck.gl/test-utils/vitest';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`IconLayer picks distinct atlas frames across Arrow chunks on ${backend}`, async ({
    skip
  }) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();

    // The first frame is opaque on the left, the second on the right.
    const atlas = testDevice.createTexture({
      width: 4,
      height: 1,
      format: 'rgba8unorm',
      data: new Uint8Array([255, 255, 255, 255, 0, 0, 0, 0, 0, 0, 0, 0, 255, 255, 255, 255]),
      sampler: {minFilter: 'nearest', magFilter: 'nearest'}
    });
    const type = new FixedSizeList(2, new Field('value', new Float32(), false));
    const positions = vectorFromArray([[-24, 0]], type).concat(vectorFromArray([[24, 0]], type));
    const layer = new IconLayer({
      data: [{icon: 'a'}, {icon: 'b'}],
      iconAtlas: atlas,
      iconMapping: {a: {x: 0, y: 0, width: 2, height: 1}, b: {x: 2, y: 0, width: 2, height: 1}},
      positions,
      getSize: 8,
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
      expect((await deck.pickObjectAsync({x: 36, y: 64}))?.index).toBe(0);
      expect(await deck.pickObjectAsync({x: 44, y: 64})).toBeNull();
      expect(await deck.pickObjectAsync({x: 84, y: 64})).toBeNull();
      expect((await deck.pickObjectAsync({x: 92, y: 64}))?.index).toBe(1);
    } finally {
      deck.finalize();
      parent.remove();
      atlas.destroy();
    }
  });
}
