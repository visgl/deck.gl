import test from 'tape-promise/tape';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import {CollideExtension} from '@deck.gl/extensions';
import CollidePass from '@deck.gl/extensions/collide/collide-pass';
import gl from '@deck.gl/test-utils/utils/setup-gl';

class TestLayer extends Layer {
  initializeState() {}
}

test('CollidePass#shouldDrawLayer', t => {
  const layers = [
    new TestLayer({
      id: 'test-default'
    }),
    new TestLayer({
      id: 'test-collide-but-hidden',
      extensions: [new CollideExtension()],
      visible: false
    }),
    new TestLayer({
      id: 'test-collide',
      extensions: [new CollideExtension()]
    }),
    new TestLayer({
      id: 'test-collide-disabled',
      extensions: [new CollideExtension()],
      collideEnabled: false
    })
  ];

  const layerManager = new LayerManager(gl, {});
  const collidePass = new CollidePass(gl, {});
  layerManager.setLayers(layers);

  const renderStats = collidePass.render({
    viewports: [new Viewport({id: 'A'})],
    layers: layerManager.getLayers(),
    onViewportActive: layerManager.activateViewport,
    onError: t.notOk
  })[0];
  t.is(renderStats.totalCount, 4, 'Total # of layers');
  t.is(renderStats.visibleCount, 1, '# of rendered layers');

  t.end();
});

test('CollidePass#getModuleParameters', t => {
  const collidePass = new CollidePass(gl);
  const moduleParameters = collidePass.getModuleParameters();

  t.equal(
    moduleParameters.drawToCollideMap,
    true,
    `CollidePass has drawToCollideMap module parameter`
  );
  t.equal(moduleParameters.pickingActive, 1, `CollidePass has pickingActive module parameter`);
  t.equal(
    moduleParameters.pickingAttribute,
    false,
    `CollidePass has pickingAttribute module parameter`
  );
  t.deepEqual(
    moduleParameters.lightSources,
    {},
    `CollidePass has empty lightSources module parameter`
  );
  t.end();
});
