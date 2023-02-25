import test from 'tape-promise/tape';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import CollisionFilterPass from '@deck.gl/extensions/collision-filter/collision-filter-pass';
import gl from '@deck.gl/test-utils/utils/setup-gl';

class TestLayer extends Layer {
  initializeState() {}
}

test('CollisionFilterPass#getModuleParameters', t => {
  const collisionFilterPass = new CollisionFilterPass(gl);
  const moduleParameters = collisionFilterPass.getModuleParameters();

  t.equal(
    moduleParameters.drawToCollisionMap,
    true,
    `CollisionFilterPass has drawToCollisionMap module parameter`
  );
  t.equal(
    moduleParameters.pickingActive,
    1,
    `CollisionFilterPass has pickingActive module parameter`
  );
  t.equal(
    moduleParameters.pickingAttribute,
    false,
    `CollisionFilterPass has pickingAttribute module parameter`
  );
  t.deepEqual(
    moduleParameters.lightSources,
    {},
    `CollisionFilterPass has empty lightSources module parameter`
  );
  t.end();
});
