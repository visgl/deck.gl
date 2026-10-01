// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {LayerManager, MapView} from '@deck.gl/core';
import {GeohashLayer, QuadkeyLayer, S2Layer} from '@deck.gl/geo-layers';
import {PathLayer, PolygonLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {getWebGPUTestDevice} from '@luma.gl/test-utils';
import {s2cells} from 'deck.gl-test/data';
import {
  filterGridCells,
  normalizeGridCells
} from '../../../examples/website/global-grids/grid-data';

test('Global grid data#normalizes loaders.gl CSV tables', () => {
  const rows = [
    {id: 'first', value: '1'},
    {id: 'second', value: '2'}
  ];
  const expectedCells = [
    {id: 'first', value: 1},
    {id: 'second', value: 2}
  ];

  expect(normalizeGridCells(rows)).toEqual(expectedCells);
  expect(normalizeGridCells({data: rows})).toEqual(expectedCells);
});

test('Global grid data#reapplies legend filtering to loaded rows', () => {
  const cells = [
    {id: 'first', value: 0},
    {id: 'second', value: 1},
    {id: 'third', value: 2}
  ];

  expect(filterGridCells(cells, [0, 2])).toEqual([cells[0], cells[2]]);
  expect(filterGridCells(cells, [1])).toEqual([cells[1]]);
  expect(filterGridCells(cells, [])).toEqual([]);
});

const TEST_CASES = [
  {
    name: 'S2Layer',
    createLayer: (extruded: boolean) =>
      new S2Layer({
        id: 'webgpu-s2-cells',
        data: s2cells.slice(0, 3),
        getS2Token: cell => cell.token,
        extruded,
        wireframe: extruded,
        stroked: !extruded,
        getElevation: 100
      })
  },
  {
    name: 'QuadkeyLayer',
    createLayer: (extruded: boolean) =>
      new QuadkeyLayer({
        id: 'webgpu-quadkey-cells',
        data: [{quadkey: '0'}, {quadkey: '0123'}, {quadkey: '333'}],
        getQuadkey: cell => cell.quadkey,
        extruded,
        wireframe: extruded,
        stroked: !extruded,
        getElevation: 100
      })
  },
  {
    name: 'GeohashLayer',
    createLayer: (extruded: boolean) =>
      new GeohashLayer({
        id: 'webgpu-geohash-cells',
        data: [{geohash: '9'}, {geohash: '9q8yy'}, {geohash: '9q8yybj'}],
        getGeohash: cell => cell.geohash,
        extruded,
        wireframe: extruded,
        stroked: !extruded,
        getElevation: 100
      })
  }
];

const GEOMETRY_MODES = [
  {name: 'extruded wireframe cells', extruded: true},
  {name: 'flat stroked cells', extruded: false}
];

for (const {name, createLayer} of TEST_CASES) {
  for (const geometry of GEOMETRY_MODES) {
    test(`${name}#WebGPU ${geometry.name}`, async ({skip}) => {
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

      webgpuDevice.handle.pushErrorScope('validation');
      layerManager.setLayers([createLayer(geometry.extruded)]);

      const polygonLayer = layerManager.layers.find(layer => layer instanceof PolygonLayer);
      const solidPolygonLayer = layerManager.layers.find(
        layer => layer instanceof SolidPolygonLayer
      ) as SolidPolygonLayer | undefined;
      const pathLayer = layerManager.layers.find(layer => layer instanceof PathLayer) as
        | PathLayer
        | undefined;

      expect(errors, 'geographic cell sublayers initialize').toEqual([]);
      expect(polygonLayer, 'creates the inherited polygon sublayer').toBeDefined();
      expect(solidPolygonLayer?.state.topModel, 'creates the polygon top pipeline').toBeDefined();
      if (geometry.extruded) {
        expect(
          solidPolygonLayer?.state.sideModel,
          'creates the extruded side pipeline'
        ).toBeDefined();
        expect(
          solidPolygonLayer?.state.wireframeModel,
          'creates the polygon wireframe pipeline'
        ).toBeDefined();
      } else {
        expect(pathLayer?.state.model, 'creates the stroked outline pipeline').toBeDefined();
      }

      await webgpuDevice.handle.queue.onSubmittedWorkDone();
      expect(
        await webgpuDevice.handle.popErrorScope(),
        'cell tops, sides, wireframes, and outlines have valid WebGPU pipelines'
      ).toBeNull();

      layerManager.finalize();
    });
  }
}
