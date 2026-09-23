// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import Tesselator from '@deck.gl/core/utils/tesselator';
import type {GeometryUpdateContext} from '@deck.gl/core/utils/tesselator';

// Record the base class output without depending on a layer's triangulation algorithm.
class RecordingTesselator extends Tesselator<any, any, {}> {
  declare rows: Map<number, {geometry: any; context: GeometryUpdateContext}>;

  normalizeGeometry(geometry) {
    return geometry;
  }

  getGeometrySize(geometry) {
    const positions = geometry.positions || geometry;
    return typeof positions[0] === 'number'
      ? positions.length / this.positionSize
      : positions.length;
  }

  updateGeometryAttributes(geometry, context: GeometryUpdateContext) {
    this.rows ||= new Map();
    this.rows.set(context.geometryIndex, {geometry, context: {...context}});
  }
}

for (const normalize of [false, true]) {
  for (const transformed of [false, true]) {
    test(`Tesselator array geometry normalize=${normalize}, transform=${transformed}`, () => {
      const data = [
        [1, 2, 3, 4],
        [5, 6]
      ];
      const accessor = vi.fn(geometry => geometry);
      const transform = vi.fn(([x, y, z]) => [x * 2, y * 3, z + 7]);
      const tesselator = new RecordingTesselator({
        data,
        getGeometry: accessor,
        positionFormat: 'XY',
        normalize,
        transform: transformed ? transform : null
      });
      expect(tesselator.rows.get(0)!.geometry).toEqual(transformed ? [2, 6, 7, 6, 12, 7] : data[0]);
      expect(tesselator.rows.get(1)!.geometry).toEqual(transformed ? [10, 18, 7] : data[1]);
      expect(tesselator.vertexStarts).toEqual([0, 2, 3]);
      expect(tesselator.instanceCount).toBe(3);
      expect(accessor).toHaveBeenCalledTimes(2);
      expect(transform).toHaveBeenCalledTimes(transformed ? 3 : 0);
      expect(data).toEqual([
        [1, 2, 3, 4],
        [5, 6]
      ]);

      accessor.mockClear();
      transform.mockClear();
      data[1] = [8, 9];
      tesselator.updateGeometry({dataChanged: [{startRow: 1, endRow: 2}]});
      expect(accessor).toHaveBeenCalledTimes(1);
      expect(transform).toHaveBeenCalledTimes(transformed ? 1 : 0);
      expect(tesselator.rows.get(0)!.geometry).toEqual(transformed ? [2, 6, 7, 6, 12, 7] : data[0]);
      expect(tesselator.rows.get(1)!.geometry).toEqual(transformed ? [16, 27, 7] : [8, 9]);
      expect(tesselator.rows.get(1)!.context).toMatchObject({vertexStart: 2, geometrySize: 1});
    });
  }
}

test('Tesselator transforms nested and typed positions and preserves topology and input', () => {
  const geometry = {positions: new Float32Array([1, 2, 3, 4]), holeIndices: [2], edgeTypes: [1, 0]};
  const data = [
    geometry,
    [
      [5, 6],
      [7, 8]
    ],
    [],
    null
  ];
  const transform = vi.fn(([x, y]) => [x + 10, y + 20]);
  const tesselator = new RecordingTesselator({
    data,
    getGeometry: value => value,
    positionFormat: 'XY',
    transform
  });
  expect(tesselator.rows.get(0)!.geometry).toEqual({
    positions: [11, 22, 0, 13, 24, 0],
    holeIndices: [3],
    edgeTypes: [1, 0]
  });
  expect(tesselator.rows.get(1)!.geometry).toEqual([
    [15, 26, 0],
    [17, 28, 0]
  ]);
  expect(tesselator.rows.get(2)!.geometry).toEqual([]);
  expect(tesselator.rows.get(3)!.geometry).toBeNull();
  expect(transform).toHaveBeenCalledTimes(4);
  expect(Array.from(geometry.positions)).toEqual([1, 2, 3, 4]);
  expect(geometry.holeIndices).toEqual([2]);
  expect(data[1]).toEqual([
    [5, 6],
    [7, 8]
  ]);
});

test('Tesselator prepares input before transforming and can disable a transform', () => {
  class SubdividingTesselator extends RecordingTesselator {
    prepareGeometry(geometry) {
      return [geometry[0], geometry[1], 5, 0, geometry[2], geometry[3]];
    }
  }
  const transform = vi.fn(([x, y, z]) => [x * x, y, z]);
  const tesselator = new SubdividingTesselator({
    data: [[0, 0, 10, 0]],
    getGeometry: value => value,
    positionFormat: 'XY',
    transform
  });
  expect(tesselator.rows.get(0)!.geometry).toEqual([0, 0, 0, 25, 0, 0, 100, 0, 0]);
  expect(transform).toHaveBeenCalledTimes(3);
  tesselator.updateGeometry({transform: null});
  expect(tesselator.rows.get(0)!.geometry).toEqual([0, 0, 10, 0]);
  expect(tesselator.instanceCount).toBe(2);
});

for (const normalize of [false, true]) {
  for (const transformed of [false, true]) {
    test(`Tesselator binary XY geometry normalize=${normalize}, transform=${transformed}`, () => {
      const value = new Float32Array([1, 2, 3, 4, 5, 6]);
      const transform = vi.fn(([x, y, z]) => [x * 2, y * 3, z + 7]);
      const tesselator = new RecordingTesselator({
        data: {length: 2, startIndices: [0, 2, 3]},
        geometryBuffer: {value, size: 2},
        buffers: {},
        normalize,
        transform: transformed ? transform : null
      });
      expect(Array.from(tesselator.rows.get(0)!.geometry)).toEqual(
        transformed ? [2, 6, 7, 6, 12, 7] : [1, 2, 3, 4]
      );
      expect(Array.from(tesselator.rows.get(1)!.geometry)).toEqual(
        transformed ? [10, 18, 7] : [5, 6]
      );
      expect(tesselator.vertexStarts).toEqual([0, 2, 3]);
      expect(tesselator.instanceCount).toBe(3);
      expect(transform).toHaveBeenCalledTimes(transformed ? 3 : 0);
      expect(Array.from(value)).toEqual([1, 2, 3, 4, 5, 6]);
      // Transformed positions must be generated, not bound to the original XY buffer.
      expect(Boolean(tesselator.opts.buffers?.vertexPositions)).toBe(!normalize && !transformed);
    });
  }
}

test('Tesselator handles XYZ and missing geometry accessors', () => {
  const transform = vi.fn(position => position);
  const tesselator = new RecordingTesselator({
    data: [[1, 2, 3]],
    getGeometry: value => value,
    transform
  });
  expect(tesselator.rows.get(0)!.geometry).toEqual([1, 2, 3]);
  expect(transform).toHaveBeenCalledWith([1, 2, 3]);
  tesselator.updateGeometry({getGeometry: undefined});
  expect(tesselator.rows.get(0)!.geometry).toBeNull();
  expect(tesselator.instanceCount).toBe(0);
});

test('Tesselator infers the final binary geometry size without an end sentinel', () => {
  const tesselator = new RecordingTesselator({
    data: {length: 2, startIndices: [0, 2]},
    geometryBuffer: {value: new Float32Array([1, 2, 3, 4, 5, 6]), size: 2},
    normalize: false
  });
  expect(tesselator.instanceCount).toBe(3);
  expect(Array.from(tesselator.rows.get(1)!.geometry)).toEqual([5, 6]);
  expect(tesselator.rows.get(1)!.context).toMatchObject({vertexStart: 2, geometrySize: 1});
});
