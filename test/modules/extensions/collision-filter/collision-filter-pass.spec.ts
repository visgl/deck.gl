import test from 'tape-promise/tape';

import CollisionFilterPass from '@deck.gl/extensions/collision-filter/collision-filter-pass';
import {device} from '@deck.gl/test-utils';

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
    {enabled: false},
    `CollisionFilterPass disables lighting module`
  );
  t.end();
});
