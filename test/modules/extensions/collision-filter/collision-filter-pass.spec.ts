// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import CollisionFilterPass from '@deck.gl/extensions/collision-filter/collision-filter-pass';
import {device} from '@deck.gl/test-utils';

test('CollisionFilterPass#getShaderModuleProps', t => {
  const collisionFilterPass = new CollisionFilterPass(device);
  const shaderModuleProps = collisionFilterPass.getShaderModuleProps();

  t.equal(
    shaderModuleProps.collision.drawToCollisionMap,
    true,
    `CollisionFilterPass has drawToCollisionMap module parameter`
  );
  t.equal(
    shaderModuleProps.picking.isActive,
    1,
    `CollisionFilterPass has picking.isActive module parameter`
  );
  t.equal(
    shaderModuleProps.picking.isAttribute,
    false,
    `CollisionFilterPass has picking.isAttribute module parameter`
  );
  t.deepEqual(
    shaderModuleProps.lighting,
    {enabled: false},
    `CollisionFilterPass disables lighting module`
  );
  t.end();
});
