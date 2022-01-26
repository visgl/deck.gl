import test from 'tape-promise/tape';

import {Layer, LayerManager, OPERATION, Viewport} from '@deck.gl/core';
import MaskPass from '@deck.gl/core/passes/mask-pass';
import {gl} from '@deck.gl/test-utils';

class TestLayer extends Layer {
  initializeState() {}
}

test('MaskPass#shouldDrawLayer', t => {
  const layers = [
    new TestLayer({
      id: 'test-default' // operation: OPERATION.DRAW is default for Layer
    }),
    new TestLayer({
      id: 'test-explicit-draw',
      operation: OPERATION.DRAW
    }),
    new TestLayer({
      id: 'test-mask-but-hidden',
      operation: OPERATION.MASK,
      visible: false
    }),
    new TestLayer({
      id: 'test-mask',
      operation: OPERATION.MASK
    })
  ];

  const layerManager = new LayerManager(gl, {});
  const maskPass = new MaskPass(gl);
  layerManager.setLayers(layers);

  let renderStats = maskPass.render({
    viewports: [new Viewport({id: 'A'})],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    onError: t.notOk
  })[0];
  t.is(renderStats.totalCount, 4, 'Total # of layers');
  t.is(renderStats.visibleCount, 1, '# of rendered layers'); // test-mask

  t.end();
});
