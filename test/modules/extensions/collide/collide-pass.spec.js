import test from 'tape-promise/tape';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import {CollideExtension} from '@deck.gl/extensions';
import CollidePass from '@deck.gl/extensions/collide/collide-pass';
import gl from '@deck.gl/test-utils/utils/setup-gl';

test('CollidePass#constructor and delete', t => {
  const collidePass = new CollidePass(gl, {dummyCollideMap: 'DUMMY_TEXTURE'});

  t.ok(collidePass, `CollidePass is constructed`);
  t.ok(collidePass.collideMap, `CollidePass creates collide map`);
  t.ok(collidePass.depthBuffer, `CollidePass creates depth buffer`);
  t.ok(collidePass.fbo, `CollidePass creates fbo`);
  t.equal(collidePass.dummyCollideMap, 'DUMMY_TEXTURE', `CollidePass stores dummy texture`);

  collidePass.delete();

  t.notOk(collidePass.collideMap, `CollidePass deletes collide map`);
  t.notOk(collidePass.depthBuffer, `CollidePass deletes depth buffer`);
  t.notOk(collidePass.fbo, `CollidePass deletes fbo`);
  t.end();
});

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
  t.is(renderStats.totalCount, 3, 'Total # of layers');
  t.is(renderStats.visibleCount, 1, '# of rendered layers');

  t.end();
});

test('CollidePass#getModuleParameters', t => {
  const collidePass = new CollidePass(gl, {dummyCollideMap: 'DUMMY_TEXTURE'});
  const moduleParameters = collidePass.getModuleParameters();

  t.equal(
    moduleParameters.drawToCollideMap,
    true,
    `CollidePass has drawToCollideMap module parameter`
  );
  t.equal(
    moduleParameters.dummyCollideMap,
    'DUMMY_TEXTURE',
    `CollidePass has dummyCollideMap module parameter`
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
  collidePass.delete();
  t.end();
});
