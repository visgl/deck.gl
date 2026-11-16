// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {NullDevice} from '@luma.gl/core/test-utils';
import {prepareMeshColumnTransforms} from '../../../modules/mesh-layers/src/utils/mesh-columns';
import {GroupNode, ModelNode} from '@luma.gl/engine';
import type {LayerContext} from '@deck.gl/core';

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
