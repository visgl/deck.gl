// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {generateLayerTests, testLayerAsync} from '@deck.gl/test-utils/vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {TerrainLayer, TileLayer} from '@deck.gl/geo-layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {TerrainLoader} from '@loaders.gl/terrain';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

const TEST_TERRAIN_MESH = {
  attributes: {
    positions: {
      size: 3,
      value: new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 1])
    },
    normals: {
      size: 3,
      value: new Float32Array([0, 0, 1, 0, 0, 1, 0, 0, 1])
    },
    texCoords: {
      size: 2,
      value: new Float32Array([0, 0, 1, 0, 0.5, 1])
    }
  }
};

class TestTerrainLayer extends TerrainLayer {
  static layerName = 'TestTerrainLayer';

  loadTerrain() {
    return TEST_TERRAIN_MESH as any;
  }
}

test('TerrainLayer#initializes its mesh sublayer with a WebGPU device', async ({skip}) => {
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
  const texture = webgpuDevice.createTexture({
    data: new Uint8Array([255, 128, 64, 255]),
    width: 1,
    height: 1
  });
  const errors: Error[] = [];
  const layerManager = new LayerManager(webgpuDevice, {viewport});
  layerManager.setProps({onError: error => errors.push(error)});
  const layer = new TestTerrainLayer({
    id: 'webgpu-terrain',
    elevationData: 'terrain.png',
    bounds: [-1, -1, 1, 1],
    texture: texture as any
  });

  webgpuDevice.handle.pushErrorScope('validation');
  layerManager.setLayers([layer]);

  const meshLayer = layer.getSubLayers()[0] as SimpleMeshLayer;
  expect(errors).toEqual([]);
  expect(meshLayer).toBeInstanceOf(SimpleMeshLayer);
  expect(meshLayer.state.model).toBeDefined();
  expect(await webgpuDevice.handle.popErrorScope()).toBeNull();

  layerManager.finalize();
  texture.delete();
});

test('TerrainLayer', async () => {
  const testCases = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png',
      texture: 'https://wms.chartbundle.com/tms/1.0.0/sec/{z}/{x}/{y}.png?origin=nw',
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof TileLayer, 'rendered TileLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({Layer: TerrainLayer, testCases, onError: err => expect(err).toBeFalsy()});

  const testCasesNonTiled = generateLayerTests({
    Layer: TerrainLayer,
    sampleProps: {
      elevationData: 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/1/0/0.png',
      bounds: [-180, 85, 0, 0],
      loaders: [TerrainLoader]
    },
    assert: (cond, msg) => expect(cond, msg).toBeTruthy(),
    onBeforeUpdate: ({testCase}) => console.log(testCase.title),
    onAfterUpdate: ({layer, subLayers}) => {
      if (layer.props.elevationData) {
        expect(subLayers[0] instanceof SimpleMeshLayer, 'rendered SimpleMeshLayer').toBeTruthy();
      }
    }
  });
  await testLayerAsync({
    Layer: TerrainLayer,
    testCases: testCasesNonTiled,
    onError: err => expect(err).toBeFalsy()
  });
});
