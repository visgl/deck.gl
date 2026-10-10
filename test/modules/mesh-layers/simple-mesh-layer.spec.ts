// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {testLayer, generateLayerTests} from '@deck.gl/test-utils/vitest';

import {LayerManager, MapView} from '@deck.gl/core';
import {SimpleMeshLayer} from 'deck.gl';
import {TruncatedConeGeometry} from '@luma.gl/engine';
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

test('SimpleMeshLayer#mesh with typed array attributes', () => {
  // A right triangle in the xy plane
  const positions = new Float32Array([0, 0, 0, 2, 0, 0, 0, 1, 0]);
  const normals = new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1]);
  const texCoords = new Float32Array([0, 0, 1, 0, 0, 1]);

  const testCases = [
    {
      title: 'Attributes object',
      props: {
        data: FIXTURES.points,
        getPosition: d => (d as any).COORDINATES,
        mesh: {positions, normals, texCoords},
        // Report the bounds of the mesh instead of the instance positions
        _instanced: false
      },
      onAfterUpdate: ({layer}) => {
        expect(layer.state.model, 'Layer has a model').toBeTruthy();
        expect(layer.state.model.vertexCount, 'Model draws every vertex').toBe(3);
        expect(layer.state.hasNormals, 'Layer uses mesh normals').toBe(true);
        expect(layer.getBounds(), 'Layer calculates mesh bounds').toEqual([
          [0, 0, 0],
          [2, 1, 0]
        ]);
      }
    },
    {
      title: 'Mesh with attributes',
      updateProps: {
        mesh: {attributes: {POSITION: positions}}
      },
      onAfterUpdate: ({layer}) => {
        expect(layer.state.model, 'Layer has a model').toBeTruthy();
        expect(layer.state.model.vertexCount, 'Model draws every vertex').toBe(3);
        expect(layer.state.hasNormals, 'Layer has no mesh normals').toBe(false);
        expect(layer.getBounds(), 'Layer calculates mesh bounds').toEqual([
          [0, 0, 0],
          [2, 1, 0]
        ]);
      }
    }
  ];

  testLayer({Layer: SimpleMeshLayer, testCases, onError: err => expect(err).toBeFalsy()});
});
