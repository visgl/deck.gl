// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {createTestViewport} from '../core/viewports/test-crs';
import LayerState from '@deck.gl/core/lib/layer-state';
import {WGS84_CRS} from '@deck.gl/core/utils/crs';
import {test, expect, vi} from 'vitest';
import {LayerManager, Viewport, AttributeManager} from '@deck.gl/core';
import {
  ScreenGridLayer,
  GridLayer,
  HexagonLayer,
  ContourLayer,
  HeatmapLayer,
  CPUAggregator
} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {GPUVector} from '@luma.gl/graph/gpu-data';
import {Matrix4} from '@math.gl/core';

function createViewport(signature: string, projected: boolean, scale = 2, resolution = 1) {
  return projected
    ? createTestViewport({
        width: 400,
        height: 300,
        signature: signature,

        converter: {
          forward: ([x, y, z = 0]) => [x * scale, y * scale, z * scale],
          inverse: ([x, y, z = 0]) => [x / scale, y / scale, z / scale]
        },
        resolution
      })
    : new Viewport({width: 400, height: 300});
}

const layerCases = [
  [ScreenGridLayer, ['positions']],
  [GridLayer, ['positions']],
  [HexagonLayer, ['positions']],
  [ContourLayer, ['positions']],
  [HeatmapLayer, ['positions']]
] as const;

for (const [LayerType, attributeNames] of layerCases) {
  for (const projected of [false, true]) {
    for (const binary of [false, true]) {
      test(`${LayerType.layerName} position transforms: projected=${projected}, binary=${binary}`, () => {
        const viewport = createViewport('initial', projected);
        const manager = new LayerManager(device, {viewport});
        manager.setProps({
          onError: error => {
            throw error;
          }
        });
        const point = [2, 3, 4];
        const values = new Float64Array(point);
        const attributes = {getPosition: {value: values, size: 3}};
        let layer = new (LayerType as typeof GridLayer)({
          data: binary ? {length: 1, attributes} : [point],
          getPosition: d => d,
          gpuAggregation: false,
          weightsTextureSize: 32
        } as any);
        const check = (expected: number[]) => {
          for (const name of attributeNames) {
            const attribute = layer.getAttributeManager()!.attributes[name];
            expect(attribute.settings.transformSource).toBe('projection');
            expect(Array.from(attribute.value!.slice(0, 3))).toEqual(expected);
          }
        };
        try {
          manager.setLayers([layer]);
          check(projected ? [4, 6, 8] : point);
          layer = layer.clone({modelMatrix: new Matrix4().translate([10, 20, 30])});
          manager.setLayers([layer]);
          check(projected ? [24, 46, 68] : point);
          const changed = createViewport('changed', projected, 3);
          manager.activateViewport(changed);
          layer.activateViewport(changed);
          manager.updateLayers();
          check(projected ? [36, 69, 102] : point);
          expect(point).toEqual([2, 3, 4]);
          expect(Array.from(values)).toEqual(point);
        } finally {
          manager.finalize();
        }
      });
    }
  }
}

test('HeatmapLayer packed position layout composes projection with XY normalization', () => {
  // Exercise the WebGPU attribute declaration without requiring a GPU render target.
  for (const projected of [false, true]) {
    const layer = new HeatmapLayer({});
    const attributes = new AttributeManager(device);
    layer.context = {
      viewport: createViewport('packed', projected),
      device: {type: 'webgpu'}
    } as any;
    layer.state = {} as any;
    layer.internalState = new LayerState({layer, attributeManager: attributes});
    layer._setSourceCrs(projected ? WGS84_CRS : null);
    vi.spyOn(layer, 'getAttributeManager').mockReturnValue(attributes);
    vi.spyOn(layer, 'setState').mockImplementation(() => {});
    try {
      layer._setupAttributes();
      const position = attributes.attributes.instancePositions;
      expect(position.settings.transformSource).toBe('projection');
      const value = new Float32Array([2, 3]);
      position.setBinaryValue({value, size: 2});
      position.allocate(1);
      position.updateBuffer({
        numInstances: 1,
        data: {length: 1},
        props: layer.props,
        context: layer
      });
      expect(Array.from(position.value!.slice(0, 3))).toEqual(projected ? [4, 6, 0] : [2, 3, 0]);
      expect(Array.from(value)).toEqual([2, 3]);
    } finally {
      attributes.finalize();
      vi.restoreAllMocks();
    }
  }
});

test('Explicit aggregation bounds use packed coordinates in custom views', () => {
  const viewport = createViewport('gpu-bounds', true, 1000);
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  const bounds: [number[], number[]] = [
    [1, 2, 0],
    [3, 4, 0]
  ];
  const layer = new GridLayer({
    data: bounds,
    getPosition: p => p,
    dataBounds: bounds,
    gpuAggregation: false,
    modelMatrix: new Matrix4().translate([10, 20, 0]),
    coordinateOrigin: [2, 3, 0]
  });
  try {
    manager.setLayers([layer]);
    expect(layer.state.preproject).toBeTruthy();
    expect(layer.getBounds()).toEqual([
      [13000, 25000, 0],
      [15000, 27000, 0]
    ]);
    const buffer = device.createBuffer({data: new Float32Array(bounds.flat())});
    const positions = new GPUVector({
      type: 'buffer',
      name: 'positions',
      buffer,
      format: 'float32x3',
      length: 2,
      ownsBuffer: false
    });
    const weights = new GPUVector({
      type: 'buffer',
      name: 'weights',
      buffer,
      format: 'float32',
      length: 2,
      ownsBuffer: false
    });
    const aggregator = new CPUAggregator({
      dimensions: 2,
      getBin: {sources: [], getValue: () => [0, 0]},
      getValue: [
        {sources: [], getValue: () => 1},
        {sources: [], getValue: () => 1}
      ]
    });
    aggregator.update = () => {};
    const expectedOrigin = layer.state.cellOriginCommon;
    const expectedRange = layer.state.binIdRange;
    let gpuLayer = layer.clone({
      id: 'gpu-bounds',
      data: [],
      positions,
      weights: [weights, weights],
      aggregator
    });
    try {
      manager.setLayers([gpuLayer]);
      expect(gpuLayer.getBounds()).toEqual([
        [13000, 25000, 0],
        [15000, 27000, 0]
      ]);
      expect(gpuLayer.state.cellOriginCommon).toEqual(expectedOrigin);
      expect(gpuLayer.state.binIdRange).toEqual(expectedRange);
      const setProps = vi.spyOn(aggregator, 'setProps');
      const projectionProps = {
        viewport,
        coordinateSystem: gpuLayer.props.coordinateSystem,
        coordinateOrigin: gpuLayer.props.coordinateOrigin,
        modelMatrix: gpuLayer.props.modelMatrix
      };
      gpuLayer.draw({shaderModuleProps: {project: projectionProps}});
      const received = setProps.mock.calls.at(-1)![0].shaderModuleProps!.project;
      expect(received.coordinateSystem).toEqual(projectionProps.coordinateSystem);
      expect(received.coordinateOrigin).toEqual(projectionProps.coordinateOrigin);
      expect(received.modelMatrix).toEqual(projectionProps.modelMatrix);
      setProps.mockRestore();

      for (const props of [
        {modelMatrix: new Matrix4().translate([30, 40, 0])},
        {coordinateOrigin: [12, 13, 0] as [number, number, number]}
      ]) {
        gpuLayer = gpuLayer.clone(props);
        const expected = layer.clone({
          ...props,
          id: 'expected-bounds',
          modelMatrix: gpuLayer.props.modelMatrix,
          coordinateOrigin: gpuLayer.props.coordinateOrigin
        });
        manager.setLayers([gpuLayer, expected]);
        expect(gpuLayer.getBounds()).toEqual(expected.getBounds());
        expect(gpuLayer.state.cellOriginCommon).toEqual(expected.state.cellOriginCommon);
        expect(gpuLayer.state.binIdRange).toEqual(expected.state.binIdRange);
      }
      const changedViewport = createViewport('changed-gpu-bounds', true, 2000);
      manager.activateViewport(changedViewport);
      gpuLayer.activateViewport(changedViewport);
      manager.updateLayers();
      const expected = layer.clone({
        id: 'expected-projection',
        modelMatrix: gpuLayer.props.modelMatrix,
        coordinateOrigin: gpuLayer.props.coordinateOrigin
      });
      manager.setLayers([gpuLayer, expected]);
      expect(gpuLayer.getBounds()).toEqual(expected.getBounds());
      expect(gpuLayer.state.cellOriginCommon).toEqual(expected.state.cellOriginCommon);
      expect(gpuLayer.state.binIdRange).toEqual(expected.state.binIdRange);
    } finally {
      positions.destroy();
      weights.destroy();
      buffer.destroy();
    }
    expect(bounds).toEqual([
      [1, 2, 0],
      [3, 4, 0]
    ]);
  } finally {
    manager.finalize();
  }
});
