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
import {GroupNode, ModelNode} from '@luma.gl/engine';
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

/** A model that reports each draw result in turn, as luma does while resources load */
function makeModelNode(drawResults: boolean[]) {
  const model = {
    setInstanceCount: vi.fn(),
    shaderInputs: {setProps: vi.fn()},
    draw: vi.fn(() => drawResults.shift() ?? true),
    destroy: vi.fn()
  };
  return new ModelNode({model} as never);
}

test('first draw waits until every model has drawn', () => {
  const onFirstDraw = vi.fn();
  const layer = new ScenegraphLayer({numInstances: 1, onFirstDraw});
  layer.state = {
    scenegraph: new GroupNode([makeModelNode([true, true]), makeModelNode([false, true])])
  } as never;
  layer.context = {viewport: {cameraPosition: [0, 0, 0]}} as unknown as LayerContext;
  const setNeedsRedraw = vi.spyOn(layer, 'setNeedsRedraw').mockImplementation(() => {});

  layer.draw({context: {}});
  expect(onFirstDraw, 'a model skipped its draw').not.toHaveBeenCalled();
  expect(setNeedsRedraw, 'checks again next frame').toHaveBeenCalled();

  layer.draw({context: {}});
  layer.draw({context: {}});
  expect(onFirstDraw, 'signals once when every model drew').toHaveBeenCalledOnce();
});

test('first draw waits until columns have drawn', () => {
  const onFirstDraw = vi.fn();
  const layer = new ScenegraphLayer({numInstances: 1, onFirstDraw});
  const draw = vi.fn().mockReturnValueOnce(false).mockReturnValue(true);
  layer.state = {
    scenegraph: new GroupNode([makeModelNode([])]),
    columns: {loading: false, length: 1, draw}
  } as never;
  layer.context = {viewport: {cameraPosition: [0, 0, 0]}} as unknown as LayerContext;
  vi.spyOn(layer, 'setNeedsRedraw').mockImplementation(() => {});

  layer.draw({context: {}});
  expect(onFirstDraw).not.toHaveBeenCalled();
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
