// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
import {NullDevice} from '@luma.gl/core/test-utils';
import {prepareMeshColumnTransforms} from '../../../modules/mesh-layers/src/utils/mesh-columns';
import {GroupNode} from '@luma.gl/engine';
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
