// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {H3ClusterLayer, H3HexagonLayer} from '@deck.gl/geo-layers';
import {ColumnLayer, PolygonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import h3Data from 'deck.gl-test/data/h3-sf.json';

const TEST_CASES = [
  {
    name: 'H3HexagonLayer high-precision polygons',
    createLayer: () =>
      new H3HexagonLayer({
        id: 'webgpu-h3-high-precision',
        data: h3Data.slice(0, 3),
        getHexagon: cell => cell.hexagons[0],
        highPrecision: true,
        extruded: true,
        wireframe: true,
        getElevation: 100
      }),
    renderer: PolygonLayer
  },
  {
    name: 'H3HexagonLayer instanced columns',
    createLayer: () =>
      new H3HexagonLayer({
        id: 'webgpu-h3-instanced',
        data: h3Data.slice(0, 3),
        getHexagon: cell => cell.hexagons[0],
        highPrecision: false,
        extruded: true,
        getElevation: 100
      }),
    renderer: ColumnLayer
  },
  {
    name: 'H3ClusterLayer polygons',
    createLayer: () =>
      new H3ClusterLayer({
        id: 'webgpu-h3-clusters',
        data: h3Data.slice(0, 3),
        getHexagons: cell => cell.hexagons,
        extruded: true,
        wireframe: true,
        getElevation: 100
      }),
    renderer: PolygonLayer
  }
];

for (const {name, createLayer, renderer} of TEST_CASES) {
  test(`${name}#WebGPU`, async ({skip}) => {
    const webgpuDevice = await getWebGPUTestDevice();
    if (!webgpuDevice) {
      skip();
      return;
    }

    const viewport = new MapView().makeViewport({
      width: 100,
      height: 100,
      viewState: {longitude: -122.4, latitude: 37.8, zoom: 8}
    });
    const errors: Error[] = [];
    const layerManager = new LayerManager(webgpuDevice, {viewport});
    layerManager.setProps({onError: error => errors.push(error)});

    webgpuDevice.handle.pushErrorScope('validation');
    layerManager.setLayers([createLayer()]);

    const rendererLayer = layerManager.layers.find(layer => layer instanceof renderer);
    expect(errors, 'H3 sublayers initialize').toEqual([]);
    expect(rendererLayer, 'creates the expected polygon or column renderer').toBeDefined();

    if (rendererLayer instanceof ColumnLayer) {
      expect(rendererLayer.state.fillModel, 'creates the instanced column pipeline').toBeDefined();
    } else {
      const solidPolygonLayer = layerManager.layers.find(
        layer => layer instanceof SolidPolygonLayer
      ) as SolidPolygonLayer | undefined;

      expect(solidPolygonLayer?.state.topModel, 'creates the polygon top pipeline').toBeDefined();
      expect(
        solidPolygonLayer?.state.sideModel,
        'creates the extruded side pipeline'
      ).toBeDefined();
      expect(
        solidPolygonLayer?.state.wireframeModel,
        'creates the polygon wireframe pipeline'
      ).toBeDefined();
    }

    await webgpuDevice.handle.queue.onSubmittedWorkDone();
    expect(
      await webgpuDevice.handle.popErrorScope(),
      'H3 polygon and column pipelines pass WebGPU validation'
    ).toBeNull();

    layerManager.finalize();
  });
}
