// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {device, testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';

import {Deck, LayerManager, MapView, _GlobeView as GlobeView} from '@deck.gl/core';
import {SimpleMeshLayer} from 'deck.gl';
import {CubeGeometry, TruncatedConeGeometry} from '@luma.gl/engine';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

import * as FIXTURES from 'deck.gl-test/data';

test('SimpleMeshLayer#initializes with a WebGPU device', async ({skip}) => {
  const webgpuDevice = await getWebGPUTestDevice();
  if (!webgpuDevice) {
    skip();
    return;
  }

  const viewport = new MapView({}).makeViewport({
    width: 100,
    height: 100,
    viewState: {longitude: 0, latitude: 0, zoom: 1}
  });
  const testTexture = webgpuDevice.createTexture({
    data: new Uint8Array([255, 128, 64, 255]),
    width: 1,
    height: 1
  });

  for (const texture of [undefined, testTexture]) {
    const errors: Error[] = [];
    const layerManager = new LayerManager(webgpuDevice, {viewport});
    layerManager.setProps({onError: error => errors.push(error)});

    const layer = new SimpleMeshLayer({
      id: texture ? 'webgpu-textured-simple-mesh' : 'webgpu-simple-mesh',
      data: [{position: [0, 0, 0]}],
      mesh: new TruncatedConeGeometry({
        topRadius: 1,
        bottomRadius: 1,
        topCap: true,
        bottomCap: true,
        height: 5,
        nradial: 20,
        nvertical: 1
      }),
      ...(texture ? {texture} : {}),
      getPosition: object => object.position,
      getColor: [255, 128, 64, 255]
    });

    webgpuDevice.handle.pushErrorScope('validation');
    layerManager.setLayers([layer]);

    expect(errors).toEqual([]);
    expect(layer.state.model).toBeDefined();
    expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

    layerManager.finalize();
  }

  testTexture.delete();
});

test('SimpleMeshLayer#tests', () => {
  const testCases = generateLayerTests({
    Layer: SimpleMeshLayer,
    sampleProps: {
      data: FIXTURES.points,
      getPosition: d => (d as any).COORDINATES,
      mesh: new TruncatedConeGeometry({
        topRadius: 1,
        bottomRadius: 1,
        topCap: true,
        bottomCap: true,
        height: 5,
        nradial: 20,
        nvertical: 1
      })
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.mesh) {
        expect(layer.getModels().length > 0, 'Layer should have models').toBeTruthy();
      }
    },
    runDefaultAsserts: false
  });

  testLayer({Layer: SimpleMeshLayer, testCases, onError: err => expect(err).toBeFalsy()});
});

test('SimpleMeshLayer#translates meshes east, north and up on GlobeView', async () => {
  const EARTH_RADIUS = 6370972;
  const anchor = [-122, 38];
  // Geographic position of a meter offset from the anchor
  const move = ([east, north]: number[]) => [
    anchor[0] + (east / (EARTH_RADIUS * Math.cos((anchor[1] * Math.PI) / 180)) / Math.PI) * 180,
    anchor[1] + (north / EARTH_RADIUS / Math.PI) * 180
  ];
  const datum = {position: anchor};
  // Draw on the shared test device: a Deck with its own device would leave pipelines in luma's
  // shared caches that break later tests. Its canvas is 1x1 unless an earlier test resized it,
  // so center the view on each location and pick wherever it projects. The camera is then only
  // ~1.5 viewport heights above the ground, so the mesh is a flat tile that stays below it.
  const deck = new Deck({
    device,
    width: 1,
    height: 1,
    useDevicePixels: false,
    views: new GlobeView(),
    viewState: {longitude: anchor[0], latitude: anchor[1], zoom: 3}
  });
  try {
    for (const translation of [
      [200000, 0, 0],
      [0, 200000, 0]
    ] as [number, number, number][]) {
      const layer = new SimpleMeshLayer({
        id: `globe-mesh-${translation.join('-')}`,
        data: [datum],
        mesh: new CubeGeometry(),
        getPosition: d => d.position,
        getScale: [40000, 40000, 1],
        getTranslation: translation,
        pickable: true
      });
      for (const [target, expected] of [
        [translation, datum],
        [translation.map(value => -value), null]
      ] as const) {
        const [longitude, latitude] = move(target);
        await new Promise<void>(resolve => {
          deck.setProps({
            layers: [layer],
            viewState: {longitude, latitude, zoom: 3},
            onAfterRender: () => {
              // @ts-expect-error private member
              if (!deck.layerManager.needsUpdate()) resolve();
            }
          });
        });
        const [x, y] = deck.getViewports()[0].project([longitude, latitude]);
        const label = `translation ${JSON.stringify(translation)} at ${JSON.stringify(target)}`;
        expect(deck.pickObject({x, y})?.object ?? null, label).toBe(expected);
      }
    }
  } finally {
    deck.finalize();
  }
});
