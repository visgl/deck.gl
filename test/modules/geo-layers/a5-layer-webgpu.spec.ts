// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {A5Layer} from '@deck.gl/geo-layers';
import {PathLayer, PolygonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';

const A5_CELLS = [7160826761612099584n, 7160839955751632896n, 7160980693239988224n];

const TEST_CASES = [
  {name: 'bigint cell identifiers', data: A5_CELLS},
  {
    name: 'hexadecimal cell identifiers',
    data: A5_CELLS.map(cell => cell.toString(16))
  }
];

const GEOMETRY_MODES = [
  {name: 'extruded wireframe cells', extruded: true},
  {name: 'flat stroked cells', extruded: false}
];

for (const {name, data} of TEST_CASES) {
  for (const geometry of GEOMETRY_MODES) {
    test(`A5Layer#WebGPU ${name} and ${geometry.name}`, async ({skip}) => {
      const webgpuDevice = await getWebGPUTestDevice();
      if (!webgpuDevice) {
        skip();
        return;
      }

      const viewport = new MapView().makeViewport({
        width: 100,
        height: 100,
        viewState: {longitude: -122.4, latitude: 37.8, zoom: 2}
      });
      const errors: Error[] = [];
      const layerManager = new LayerManager(webgpuDevice, {viewport});
      layerManager.setProps({onError: error => errors.push(error)});

      const layer = new A5Layer<bigint | string>({
        id: 'webgpu-a5-cells',
        data,
        getPentagon: cell => cell,
        extruded: geometry.extruded,
        wireframe: geometry.extruded,
        stroked: !geometry.extruded,
        getElevation: 100
      });

      webgpuDevice.handle.pushErrorScope('validation');
      layerManager.setLayers([layer]);

      const polygonLayer = layerManager.layers.find(
        currentLayer => currentLayer instanceof PolygonLayer
      );
      const solidPolygonLayer = layerManager.layers.find(
        currentLayer => currentLayer instanceof SolidPolygonLayer
      ) as SolidPolygonLayer | undefined;
      const pathLayer = layerManager.layers.find(
        currentLayer => currentLayer instanceof PathLayer
      ) as PathLayer | undefined;

      expect(errors, 'A5 polygon sublayers initialize').toEqual([]);
      expect(polygonLayer, 'creates the inherited polygon sublayer').toBeDefined();
      expect(solidPolygonLayer?.state.topModel, 'creates the pentagon top pipeline').toBeDefined();
      if (geometry.extruded) {
        expect(
          solidPolygonLayer?.state.sideModel,
          'creates the extruded side pipeline'
        ).toBeDefined();
        expect(
          solidPolygonLayer?.state.wireframeModel,
          'creates the pentagon wireframe pipeline'
        ).toBeDefined();
      } else {
        expect(pathLayer?.state.model, 'creates the stroked outline pipeline').toBeDefined();
      }

      await webgpuDevice.handle.queue.onSubmittedWorkDone();
      expect(
        await webgpuDevice.handle.popErrorScope(),
        'A5 tops, sides, wireframes, and outlines have valid WebGPU pipelines'
      ).toBeNull();

      layerManager.finalize();
    });
  }
}
