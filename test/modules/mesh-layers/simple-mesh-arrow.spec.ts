// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test, vi} from 'vitest';
import {Deck, OrthographicView} from '@deck.gl/core';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Geometry, makeGPUVectorGeometry} from '@luma.gl/engine';
import {Buffer} from '@luma.gl/core';
import {getWebGPUTestDevice} from '@luma.gl/core/test-utils';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

for (const backend of ['webgl', 'webgpu'] as const) {
  test(`SimpleMeshLayer picks indexed Arrow instances on ${backend}`, async ({skip}) => {
    const testDevice = backend === 'webgpu' ? await getWebGPUTestDevice('core') : device;
    if (!testDevice) return skip();

    const type = new FixedSizeList(2, new Field('value', new Float32(), false));
    const positions = vectorFromArray([[-24, 0]], type).concat(vectorFromArray([[24, 0]], type));
    const attributes = {
      positions: {size: 3, value: new Float32Array([-6, -6, 0, 6, -6, 0, 0, 6, 0])},
      normals: {size: 3, value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])},
      colors: {size: 3, value: new Float32Array(9).fill(1)},
      texCoords: {size: 2, value: new Float32Array(6)}
    };
    const indices = {size: 1, value: new Uint16Array([0, 1, 2])};
    const mesh = makeGPUVectorGeometry(
      testDevice,
      new Geometry({topology: 'triangle-list', attributes, indices})
    );
    const destroyMesh = vi.spyOn(mesh, 'destroy');
    const transform = [1, 0, 0, 0, 1, 0, 0, 0, 1, 10, 0, 0];
    const buffer = testDevice.createBuffer({
      data: new Float32Array([0, ...transform, 0, ...transform]),
      usage: Buffer.VERTEX
    });
    const layer = new SimpleMeshLayer({
      positions,
      data: {length: 2, attributes: {instanceModelMatrix: {buffer, offset: 4, stride: 52}}},
      mesh,
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
      const getTranslation = vi.fn(() => [10, 0, 0] as [number, number, number]);
      const rowLayer = layer.clone({data: [{}, {}], getTranslation});
      deck.setProps({layers: [rowLayer]});
      await expect.poll(() => rowLayer.isLoaded).toBe(true);
      expect((await deck.pickObjectAsync({x: 98, y: 64}))?.index).toBe(1);
      expect(getTranslation).toHaveBeenCalledTimes(2);
      const accessorLayer = layer.clone({
        positions: null,
        data: [{position: [-24, 0, 0]}, {position: [24, 0, 0]}]
      });
      deck.setProps({layers: [accessorLayer]});
      expect((await deck.pickObjectAsync({x: 98, y: 64}))?.index).toBe(1);
      expect(destroyMesh).not.toHaveBeenCalled();
    } finally {
      try {
        deck.finalize();
        expect(destroyMesh).not.toHaveBeenCalled();
      } finally {
        mesh.destroy();
        buffer.destroy();
        parent.remove();
      }
    }
  });
}
