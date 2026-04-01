// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';

import CollisionFilterPass from '@deck.gl/extensions/collision-filter/collision-filter-pass';
import {device} from '@deck.gl/test-utils/vitest';

test('CollisionFilterPass#getShaderModuleProps', () => {
  const collisionFilterPass = new CollisionFilterPass(device);
  const shaderModuleProps = collisionFilterPass.getShaderModuleProps();

  expect(
    shaderModuleProps.collision.drawToCollisionMap,
    `CollisionFilterPass has drawToCollisionMap module parameter`
  ).toBe(true);
  expect(
    shaderModuleProps.picking.isActive,
    `CollisionFilterPass has picking.isActive module parameter`
  ).toBe(1);
  expect(
    shaderModuleProps.picking.isAttribute,
    `CollisionFilterPass has picking.isAttribute module parameter`
  ).toBe(false);
  expect(shaderModuleProps.lighting, `CollisionFilterPass disables lighting module`).toEqual({
    enabled: false
  });
});
