// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {device} from '@deck.gl/test-utils';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import MaskPass from '@deck.gl/extensions/mask/mask-pass';

class TestLayer extends Layer {
  initializeState() {}
}

test('MaskPass#shouldDrawLayer', () => {
  const layers = [
    new TestLayer({
      id: 'test-default' // operation: 'draw' is default for Layer
    }),
    new TestLayer({
      id: 'test-explicit-draw',
      operation: 'draw'
    }),
    new TestLayer({
      id: 'test-mask-but-hidden',
      operation: 'mask',
      visible: false
    }),
    new TestLayer({
      id: 'test-mask',
      operation: 'mask'
    })
  ];

  const layerManager = new LayerManager(device, {});
  const maskPass = new MaskPass(device, {});
  layerManager.setLayers(layers);

  const renderStats = maskPass.render({
    viewports: [new Viewport({id: 'A'})],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    onError: err => expect(err).toBeFalsy()
  })[0];
  expect(renderStats.totalCount, 'Total # of layers').toBe(4);
  expect(renderStats.visibleCount, '# of rendered layers').toBe(1); // test-mask
});
