import test from 'tape-promise/tape';
import {device} from '@deck.gl/test-utils';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import MaskPass from '@deck.gl/extensions/mask/mask-pass';

class TestLayer extends Layer {
  initializeState() {}
}

test('MaskPass#shouldDrawLayer', t => {
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
    onError: t.notOk
  })[0];
  t.is(renderStats.totalCount, 4, 'Total # of layers');
  t.is(renderStats.visibleCount, 1, '# of rendered layers'); // test-mask

  t.end();
});
