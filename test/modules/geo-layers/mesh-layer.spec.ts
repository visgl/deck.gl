// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {Geometry} from '@luma.gl/engine';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

import MeshLayer from '../../../modules/geo-layers/src/mesh-layer/mesh-layer';

const TEST_MATERIAL = {
  pbrMetallicRoughness: {
    baseColorFactor: [1, 1, 1, 1],
    metallicFactor: 0,
    roughnessFactor: 1
  }
};

test('Tile3DLayer mesh sublayer initializes with a WebGPU device', async ({skip}) => {
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

  for (const featureIds of [null, new Uint32Array([0, 1, 1])]) {
    const errors: Error[] = [];
    const layerManager = new LayerManager(webgpuDevice, {viewport});
    layerManager.setProps({onError: error => errors.push(error)});
    const layer = new MeshLayer({
      id: featureIds ? 'webgpu-tile3d-feature-mesh' : 'webgpu-tile3d-mesh',
      data: [0],
      mesh: new Geometry({
        topology: 'triangle-list',
        attributes: {
          positions: {
            size: 3,
            value: new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0])
          },
          normals: {
            size: 3,
            value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
          },
          colors: {
            size: 4,
            value: new Uint8Array([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255]),
            normalized: true
          },
          texCoords: {
            size: 2,
            value: new Float32Array([0, 0, 1, 0, 0.5, 1])
          },
          ...(featureIds
            ? {
                uvRegions: {
                  size: 4,
                  value: new Float32Array([0, 0, 1, 1, 0, 0, 1, 1, 0, 0, 1, 1])
                }
              }
            : {})
        }
      }),
      pbrMaterial: TEST_MATERIAL,
      featureIds,
      getPosition: [0, 0, 0],
      getColor: [255, 255, 255, 255]
    });

    webgpuDevice.handle.pushErrorScope('validation');
    layerManager.setLayers([layer]);

    expect(errors).toEqual([]);
    expect(layer.state.model).toBeDefined();
    expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

    layerManager.finalize();
  }
});
