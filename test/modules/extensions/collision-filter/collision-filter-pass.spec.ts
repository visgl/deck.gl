import test from 'tape-promise/tape';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import CollisionFilterPass from '@deck.gl/extensions/collision-filter/collision-filter-pass';
import {device} from '@deck.gl/test-utils';

class TestLayer extends Layer {
  initializeState() {}
}

test('CollisionFilterPass#getModuleParameters', t => {
  const collisionFilterPass = new CollisionFilterPass(device);
  const moduleParameters = collisionFilterPass.getModuleParameters();

  t.equal(
    moduleParameters.drawToCollisionMap,
    true,
    `CollisionFilterPass has drawToCollisionMap module parameter`
  );
  t.equal(
    moduleParameters.picking.isActive,
    1,
    `CollisionFilterPass has picking.isActive module parameter`
  );
  t.equal(
    moduleParameters.picking.isAttribute,
    false,
    `CollisionFilterPass has picking.isAttribute module parameter`
  );
  t.deepEqual(
    moduleParameters.lightSources,
    {},
    `CollisionFilterPass has empty lightSources module parameter`
  );
  t.end();
});
