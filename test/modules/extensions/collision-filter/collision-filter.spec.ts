// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

test('CollisionFilterExtension', () => {
  const props = {
    id: 'collision-filter-extension-test',
    data: [],
    extensions: [new CollisionFilterExtension()],
    collisionEnabled: true,
    collisionGroup: 'COLLISION_GROUP',

    // simulate CollisionFilterEffect parameters
    collisionFBO: 'COLLISION_TEXTURE',
    drawToCollisionMap: false,
    dummyCollisionMap: 'DUMMY_TEXTURE'
  };

  const testCases = [
    {
      props,
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        const attributes = layer.getAttributeManager().getAttributes();
        expect(uniforms.enabled, 'enabled in uniforms').toBeTruthy();
        expect(uniforms.sort, 'sort in disabled when reading').toBe(false);
        expect(uniforms.collision_texture, 'collision_texture correctly set').toBe(
          'COLLISION_TEXTURE'
        );
        expect(attributes.collisionPriorities, 'collisionPriorities attribute added').toBeTruthy();
      }
    },
    {
      updateProps: {
        collisionFBO: null
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.enabled, 'enabled is disabled').toBe(false);
        expect(uniforms.sort, 'sort in disabled when reading').toBe(false);
        expect(uniforms.collision_texture, 'collision_texture set to dummy texture').toBe(
          'DUMMY_TEXTURE'
        );
      }
    },
    {
      updateProps: {
        collisionFBO: 'COLLISION_TEXTURE',
        drawToCollisionMap: true
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.enabled, 'enabled in uniforms').toBeTruthy();
        expect(uniforms.sort, 'sort enabled when drawing').toBe(true);
        expect(
          uniforms.collision_texture,
          'collision_texture set to dummy texture when drawing'
        ).toBe('DUMMY_TEXTURE');
      }
    },
    {
      updateProps: {
        getCollisionPriority: d => d.priority
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        expect(uniforms.enabled, 'enabled in uniforms').toBeTruthy();
        expect(uniforms.sort, 'sort enabled when getCollisionPriority set').toBeTruthy();
      }
    }
  ];

  testLayer({
    createSpy: (obj, method) => vi.spyOn(obj, method),
    Layer: ScatterplotLayer,
    testCases,
    onError: err => expect(err).toBeFalsy()
  });
});
