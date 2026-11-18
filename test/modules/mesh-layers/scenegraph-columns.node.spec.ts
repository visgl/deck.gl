// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ScenegraphLayer, SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {NullDevice} from '@luma.gl/core/test-utils';
import {
  MESH_COLUMN_DEFINITIONS,
  prepareMeshColumnTransforms
} from '../../../modules/mesh-layers/src/utils/mesh-columns';
import {GroupNode} from '@luma.gl/engine';
import {type LayerContext, _LayerColumns as LayerColumns} from '@deck.gl/core';
import {Field, FixedSizeList, Float32, vectorFromArray} from 'apache-arrow';

test('first draw waits for columns even with an explicit instance count', () => {
  const onFirstDraw = vi.fn();
  const layer = new ScenegraphLayer({numInstances: 2, onFirstDraw});
  layer.state = {scenegraph: new GroupNode([]), columns: {loading: true, length: 0}} as never;
  layer.draw({context: {}});
  expect(onFirstDraw).not.toHaveBeenCalled();
});

test('an empty prepared column completes the first-draw lifecycle', () => {
  const onFirstDraw = vi.fn();
  const layer = new ScenegraphLayer({onFirstDraw});
  layer.state = {scenegraph: new GroupNode([]), columns: {loading: false, length: 0}} as never;
  layer.context = {viewport: {cameraPosition: [0, 0, 0]}} as unknown as LayerContext;
  layer.draw({context: {}});
  expect(onFirstDraw).toHaveBeenCalledOnce();
});

for (const functional of [false, true]) {
  test('complete matrices ignore other transform accessors (function=' + functional + ')', () => {
    const device = new NullDevice({});
    const matrix = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];
    const ignored = vi.fn(() => {
      throw new Error('ignored accessor evaluated');
    });
    const resources: {destroy(): void}[] = [];
    try {
      const bindings = prepareMeshColumnTransforms(
        device,
        {
          data: [],
          getTransformMatrix: functional ? () => matrix : matrix,
          getScale: ignored,
          getOrientation: ignored,
          getTranslation: ignored
        },
        {at: () => undefined},
        2,
        resource => resources.push(resource)
      );
      expect(Object.keys(bindings)).toHaveLength(4);
      expect(ignored).not.toHaveBeenCalled();
    } finally {
      resources.forEach(resource => resource.destroy());
      device.destroy();
    }
  });
}

test('Mesh Arrow fallbacks preserve byte defaults and toggle authored colors', async () => {
  const device = new NullDevice({});
  try {
    const positions = vectorFromArray(
      [[0, 0, 0]],
      new FixedSizeList(3, new Field('x', new Float32()))
    );
    for (const Layer of [SimpleMeshLayer, ScenegraphLayer]) {
      const defaults = new Layer().props;
      const defaultColor = defaults.getColor as readonly number[];
      const columns = new LayerColumns(
        device,
        {
          positions: MESH_COLUMN_DEFINITIONS.positions,
          colors: {...MESH_COLUMN_DEFINITIONS.colors, defaultColor}
        },
        'Mesh'
      );
      try {
        const props = new Layer({getPosition: positions}).props;
        const readColor = () => Array.from((columns as any).prepared.columns.instanceColors.value);
        const failed = (error: Error) => {
          throw error;
        };
        await columns.update(props, () => {}, failed, undefined, undefined, true, true);
        expect(readColor()).toEqual(Array.from(defaultColor));
        const authored = new Layer({getPosition: positions, getColor: [1, 0.5, 0, 0]}).props;
        let oldProps = props;
        for (const normalizedColors of [true, false, true]) {
          await columns.updateIfNeeded(
            {props: authored, oldProps, changeFlags: {}},
            {normalizedColors, dataLoading: false, changed: () => {}, failed}
          );
          expect(readColor()).toEqual(normalizedColors ? [255, 128, 0, 0] : [1, 0, 0, 0]);
          oldProps = authored as typeof props;
        }
      } finally {
        columns.destroy();
      }
    }
  } finally {
    device.destroy();
  }
});

test('Arrow orientation and scale preserve callback transforms across chunks and nulls', async () => {
  const {Vector, vectorFromArray, FixedSizeList, Field, Float32} = await import('apache-arrow');
  const type = new FixedSizeList(3, new Field('component', new Float32(), true));
  const orientations = new Vector([
    vectorFromArray([[10, 20, 30]], type).data[0],
    vectorFromArray([null, [0, 90, 0]], type).data[0]
  ]);
  const scales = vectorFromArray([[2, 3, 4], null, [0, 0, 0]], type);
  const device = new NullDevice({});
  const resources: {destroy(): void}[] = [];
  const props = {data: [{}, {}, {}], getTransformMatrix: [], getTranslation: [0, 0, 0]};
  const rows = {at: (index: number) => props.data[index]};
  const own = (resource: {destroy(): void}) => resources.push(resource);
  try {
    const actual = prepareMeshColumnTransforms(
      device,
      {
        ...props,
        getOrientation: orientations,
        getScale: scales
      },
      rows,
      3,
      own
    );
    const expected = prepareMeshColumnTransforms(
      device,
      {
        ...props,
        getOrientation: (_row: unknown, {index}: {index: number}) =>
          Array.from(orientations.get(index) ?? [0, 0, 0]),
        getScale: (_row: unknown, {index}: {index: number}) =>
          Array.from(scales.get(index) ?? [1, 1, 1])
      },
      rows,
      3,
      own
    );
    expect(actual.instanceModelMatrixCol0.value).toEqual(expected.instanceModelMatrixCol0.value);
    expect(Array.from(actual.instanceModelMatrixCol0.value).every(Number.isFinite)).toBe(true);
    expect(() =>
      prepareMeshColumnTransforms(
        device,
        {
          ...props,
          getOrientation: orientations.slice(0, 1),
          getScale: scales
        },
        rows,
        3,
        own
      )
    ).toThrow('length must match');
  } finally {
    resources.forEach(resource => resource.destroy());
    device.destroy();
  }
});

test('SQL transform columns preserve matrix precedence and null matrix fallbacks', async () => {
  const {tableFromJSON, vectorFromArray, FixedSizeList, Field, Float32} = await import(
    'apache-arrow'
  );
  const {evaluateAccessorQueries} = await import(
    '../../../modules/core/src/arrow/accessor-queries'
  );
  const data = tableFromJSON(Array.from({length: 16}, (_, i) => ({angle: i * 5, size: 2, x: i})));
  const expressions = {
    getOrientation: 'FLOAT32x3(0, angle, 90)',
    getScale: 'FLOAT32x3(size, size, size)',
    getTranslation: 'FLOAT32x3(x, 0, 0)',
    getTransformMatrix: 'ARRAY[1,0,0,0,0,1,0,0,0,0,1,0,x,2,3,1]'
  };
  const layer = new ScenegraphLayer({
    data,
    getOrientation: {sql: expressions.getOrientation},
    getScale: {sql: expressions.getScale},
    getTranslation: {sql: expressions.getTranslation},
    getTransformMatrix: {sql: expressions.getTransformMatrix}
  });
  // SQL inputs are registered rather than leaking objects into the transform math.
  expect(layer.props.getOrientation).toEqual([0, 0, 0]);
  expect(layer.props.getScale).toEqual([1, 1, 1]);
  expect(layer.props.getTranslation).toEqual([0, 0, 0]);
  expect(layer.props.getTransformMatrix).toEqual([]);
  const table = evaluateAccessorQueries(data, expressions, undefined);
  const columns = Object.fromEntries(
    Object.keys(expressions).map(name => [name, table.getChild(name)])
  );
  const device = new NullDevice({});
  const resources: {destroy(): void}[] = [];
  const own = (resource: {destroy(): void}) => resources.push(resource);
  const rows = {at: (index: number) => data.get(index)};
  try {
    const actual = prepareMeshColumnTransforms(device, {data, ...columns}, rows, 16, own);
    const expected = prepareMeshColumnTransforms(
      device,
      {
        data,
        getTransformMatrix: (_: unknown, {index}: {index: number}) => [
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          0,
          0,
          0,
          1,
          0,
          index,
          2,
          3,
          1
        ],
        getOrientation: () => {
          throw new Error('matrix takes precedence');
        },
        getScale: () => {
          throw new Error('matrix takes precedence');
        },
        getTranslation: () => {
          throw new Error('matrix takes precedence');
        }
      },
      rows,
      16,
      own
    );
    expect(actual.instanceModelMatrixCol0.constant).toBe(false);
    expect(actual.instanceModelMatrixCol0.value).toEqual(expected.instanceModelMatrixCol0.value);
    const matrices = vectorFromArray(
      Array(16).fill(null),
      new FixedSizeList(16, new Field('v', new Float32()))
    );
    const composed = prepareMeshColumnTransforms(
      device,
      {data, ...columns, getTransformMatrix: matrices},
      rows,
      16,
      own
    );
    const callbacks = prepareMeshColumnTransforms(
      device,
      {
        data,
        getTransformMatrix: [],
        getOrientation: (_: unknown, {index}: {index: number}) => [0, index * 5, 90],
        getScale: [2, 2, 2],
        getTranslation: (_: unknown, {index}: {index: number}) => [index, 0, 0]
      },
      rows,
      16,
      own
    );
    expect(composed.instanceModelMatrixCol0.value).toEqual(callbacks.instanceModelMatrixCol0.value);
  } finally {
    resources.forEach(resource => resource.destroy());
    device.destroy();
  }
});
