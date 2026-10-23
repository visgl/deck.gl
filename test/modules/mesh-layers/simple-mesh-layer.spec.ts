// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';

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
  const deck = new Deck({
    width: 400,
    height: 300,
    useDevicePixels: false,
    views: new GlobeView(),
    viewState: {longitude: anchor[0], latitude: anchor[1], zoom: 3}
  });
  for (const translation of [
    [400000, 0, 0],
    [0, 400000, 0]
  ] as [number, number, number][]) {
    await new Promise<void>(resolve => {
      deck.setProps({
        layers: [
          new SimpleMeshLayer({
            id: `globe-mesh-${translation.join('-')}`,
            data: [datum],
            mesh: new CubeGeometry(),
            getPosition: d => d.position,
            getScale: [80000, 80000, 80000],
            getTranslation: translation,
            pickable: true
          })
        ],
        onAfterRender: () => {
          // @ts-expect-error private member
          if (!deck.layerManager.needsUpdate()) resolve();
        }
      });
    });
    const viewport = deck.getViewports()[0];
    const [x, y] = viewport.project(move(translation));
    const [oppositeX, oppositeY] = viewport.project(move(translation.map(value => -value)));
    const label = `translation ${JSON.stringify(translation)}`;
    expect(deck.pickObject({x, y})?.object, label).toBe(datum);
    expect(deck.pickObject({x: oppositeX, y: oppositeY}), label).toBeNull();
  }
  deck.finalize();
});
