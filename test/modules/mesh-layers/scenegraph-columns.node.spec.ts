// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {ScenegraphLayer} from '@deck.gl/mesh-layers';
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
