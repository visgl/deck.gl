// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {
  LayerManager,
  Viewport,
  _CustomProjectionViewport as CustomProjectionViewport
} from '@deck.gl/core';
import {
  GridLayer,
  HexagonLayer,
  ContourLayer,
  HeatmapLayer,
  WebGLAggregator
} from '@deck.gl/aggregation-layers';
import {device} from '@deck.gl/test-utils/vitest';
import {Matrix4} from '@math.gl/core';
import {getUniformsFromViewport} from '@deck.gl/core/shaderlib/project/viewport-uniforms';

const data = [
  [1, 2, 0],
  [3, 4, 0],
  [5, 6, 0],
  [7, 8, 0]
];
const modelMatrix = new Matrix4().translate([10, 20, 0]);
const project = ([x, y, z = 0]: number[]): [number, number, number] => [x * x, y * 3, z];
const commonData = data.map(p => project(modelMatrix.transformAsPoint(p)));

function createViewport(signature = 'initial', scale = 1) {
  const viewport = new CustomProjectionViewport({
    width: 400,
    height: 300,
    projectionId: signature,
    projection: {
      forward: p => project(p).map(v => v * scale),
      inverse: ([x, y, z = 0]) => [Math.sqrt(x / scale), y / (3 * scale), z / scale]
    },
    outputBounds: [0, 0, 512, 512]
  });
  // Count data preprojection, not constructor inverse validation.
  vi.spyOn(viewport, 'preproject');
  return viewport;
}

function createReferenceViewport(viewport: CustomProjectionViewport) {
  return new Viewport({
    width: viewport.width,
    height: viewport.height,
    position: viewport.target,
    viewMatrix: viewport.viewMatrixUncentered,
    projectionMatrix: viewport.projectionMatrix
  });
}

function createManager(viewport: Viewport) {
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  return manager;
}

for (const LayerType of [GridLayer, HexagonLayer, ContourLayer]) {
  test(`${LayerType.layerName} GPU aggregation matches preprojected Cartesian input`, ({skip}) => {
    if (!WebGLAggregator.isSupported(device)) {
      skip();
      return;
    }
    const viewport = createViewport();
    const cartesianViewport = createReferenceViewport(viewport);
    const manager = createManager(viewport);
    const referenceManager = createManager(cartesianViewport);
    const props = {getPosition: p => p, cellSize: 20, radius: 20, gpuAggregation: true};
    const layer = new LayerType({
      ...props,
      data,
      modelMatrix,
      coordinateSystem: 'lnglat-offsets',
      coordinateOrigin: [100, 200, 0]
    } as any);
    const reference = new LayerType({
      ...props,
      data: commonData,
      coordinateSystem: 'cartesian'
    } as any);
    const bins = (l: typeof layer) =>
      Array.from({length: l.state.aggregator.binCount}, (_, i) => l.state.aggregator.getBin(i));
    try {
      manager.setLayers([layer]);
      referenceManager.setLayers([reference]);
      expect(layer.state.aggregator).toBeInstanceOf(WebGLAggregator);
      for (const [current, currentViewport] of [
        [layer, viewport],
        [reference, cartesianViewport]
      ] as const) {
        current.draw({
          shaderModuleProps: {
            project: {
              viewport: currentViewport,
              modelMatrix: current.props.modelMatrix,
              coordinateSystem: current.props.coordinateSystem,
              coordinateOrigin: current.props.coordinateOrigin
            }
          }
        } as any);
      }
      expect(bins(layer)).toEqual(bins(reference));
      expect(bins(layer).reduce((sum, bin) => sum + bin!.count, 0)).toBe(data.length);
    } finally {
      manager.finalize();
      referenceManager.finalize();
    }
  });

  test(`${LayerType.layerName} aggregates preprojected positions like a non-geo view`, () => {
    const viewport = createViewport();
    const manager = createManager(viewport);
    const referenceManager = createManager(createReferenceViewport(viewport));
    const props = {
      getPosition: p => p,
      cellSize: 20,
      radius: 20,
      gpuAggregation: false,
      contours: [{threshold: 0.5}, {threshold: [0.5, 10]}]
    };
    let layer = new LayerType({
      ...props,
      data,
      modelMatrix,
      coordinateSystem: 'lnglat',
      coordinateOrigin: [100, 200, 0]
    } as any);
    const reference = new LayerType({
      ...props,
      data: commonData,
      coordinateSystem: 'cartesian'
    } as any);
    const bins = (l: typeof layer) =>
      Array.from({length: l.state.aggregator.binCount}, (_, i) => l.state.aggregator.getBin(i));
    try {
      manager.setLayers([layer]);
      referenceManager.setLayers([reference]);
      expect(bins(layer)).toEqual(bins(reference));
      // Only original data is projected. Contour output must never call preproject.
      expect(viewport.preproject).toHaveBeenCalledTimes(data.length);
      if (layer instanceof HexagonLayer && reference instanceof HexagonLayer) {
        const picking = {info: {index: 0}};
        expect(layer.getPickingInfo(picking as any).object?.position).toEqual(
          reference.getPickingInfo({info: {index: 0}} as any).object?.position
        );
      }
      if (layer instanceof ContourLayer && reference instanceof ContourLayer) {
        expect(layer.state.contourData).toEqual(reference.state.contourData);
        expect(layer.getSubLayers()).toHaveLength(2);
        for (const child of layer.getSubLayers()) {
          const transform = child.usePositionTransforms().transform!;
          expect(transform.call(child, [2, 3, 0])).toEqual(
            new Matrix4(child.props.modelMatrix!).transformAsPoint([2, 3, 0])
          );
        }
        expect(viewport.preproject).toHaveBeenCalledTimes(data.length);
      }

      // GPU binning uses a separate viewport, but must still ignore the consumed
      // layer matrix/origin and explicit geographic coordinate system.
      const setProps = vi.spyOn(layer.state.aggregator, 'setProps');
      const projectProps = {
        viewport,
        modelMatrix,
        coordinateSystem: 'lnglat',
        coordinateOrigin: [100, 200, 0],
        autoWrapLongitude: true
      };
      layer.draw({shaderModuleProps: {project: projectProps}} as any);
      const received = (setProps.mock.calls.at(-1)![0] as any).shaderModuleProps.project;
      expect(received).toMatchObject({
        coordinateSystem: 'cartesian',
        coordinateOrigin: [0, 0, 0],
        modelMatrix: null,
        autoWrapLongitude: false
      });
      const uniforms = getUniformsFromViewport(received);
      expect(Array.from(uniforms.modelMatrix)).toEqual(Array.from(new Matrix4()));
      expect(projectProps.modelMatrix).toBe(modelMatrix);

      const changed = createViewport('changed', 2);
      manager.activateViewport(changed);
      layer.activateViewport(changed);
      manager.updateLayers();
      layer = manager.getLayers().find(l => l.id === layer.id) as typeof layer;
      const updatedReference = reference.clone({data: commonData.map(p => p.map(v => v * 2))});
      referenceManager.setLayers([updatedReference]);
      expect(bins(layer)).toEqual(bins(updatedReference));
    } finally {
      manager.finalize();
      referenceManager.finalize();
      vi.restoreAllMocks();
    }
  });
}

for (const [LayerType, accessor] of [
  [GridLayer, 'gridAggregator'],
  [HexagonLayer, 'hexagonAggregator']
] as const) {
  test(`${LayerType.layerName} custom binning receives common coordinates`, () => {
    const manager = createManager(createViewport());
    const received: number[][] = [];
    const aggregate = (position: number[]) => {
      // The aggregator reuses its accessor target between rows.
      received.push(position.slice());
      return [0, 0];
    };
    const layer = new LayerType({
      data,
      modelMatrix,
      getPosition: p => p,
      gpuAggregation: false,
      [accessor]: aggregate
    } as any);
    try {
      manager.setLayers([layer]);
      expect(received).toEqual(commonData);
    } finally {
      manager.finalize();
    }
  });
}

test('HeatmapLayer uses the same bounds and texture coordinates as a non-geo view', () => {
  const viewport = createViewport();
  const manager = createManager(viewport);
  const referenceManager = createManager(createReferenceViewport(viewport));
  const props = {weightsTextureSize: 32, getPosition: p => p};
  const layer = new HeatmapLayer({...props, data, modelMatrix, coordinateSystem: 'lnglat'});
  const reference = new HeatmapLayer({...props, data: commonData, coordinateSystem: 'cartesian'});
  try {
    manager.setLayers([layer]);
    referenceManager.setLayers([reference]);
    expect(layer.state.worldBounds).toEqual(reference.state.worldBounds);
    expect(layer.state.normalizedCommonBounds).toEqual(reference.state.normalizedCommonBounds);
    expect(layer.state.viewportCorners).toEqual(reference.state.viewportCorners);
    expect(
      layer._worldToCommonBounds(layer.state.worldBounds, {useLayerCoordinateSystem: true})
    ).toEqual(
      reference._worldToCommonBounds(reference.state.worldBounds, {useLayerCoordinateSystem: true})
    );
    expect(viewport.preproject).toHaveBeenCalledTimes(data.length);

    const update = vi.spyOn(layer, '_updateWeightmap');
    const changed = createViewport('changed');
    manager.activateViewport(changed);
    layer.activateViewport(changed);
    manager.updateLayers();
    // Same camera/bounds still requires rebuilding when the projection changes.
    expect(update).toHaveBeenCalled();
    expect(layer.state.normalizedCommonBounds).toEqual(reference.state.normalizedCommonBounds);
  } finally {
    manager.finalize();
    referenceManager.finalize();
    vi.restoreAllMocks();
  }
});
