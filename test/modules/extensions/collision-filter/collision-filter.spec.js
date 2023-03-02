import test from 'tape-promise/tape';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {testLayer} from '@deck.gl/test-utils';

test('CollisionFilterExtension', t => {
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
        const uniforms = layer.getModels()[0].getUniforms();
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(uniforms.collision_enabled, 'collision_enabled in uniforms');
        t.equal(uniforms.collision_sort, false, 'collision_sort in disabled when reading');
        t.equal(uniforms.collision_texture, 'COLLISION_TEXTURE', 'collision_texture correctly set');
        t.ok(attributes.collisionPriorities, 'collisionPriorities attribute added');
      }
    },
    {
      updateProps: {
        collisionFBO: null
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.equal(uniforms.collision_enabled, false, 'collision_enabled is disabled');
        t.equal(uniforms.collision_sort, false, 'collision_sort in disabled when reading');
        t.equal(
          uniforms.collision_texture,
          'DUMMY_TEXTURE',
          'collision_texture set to dummy texture'
        );
      }
    },
    {
      updateProps: {
        collisionFBO: 'COLLISION_TEXTURE',
        drawToCollisionMap: true
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.ok(uniforms.collision_enabled, 'collision_enabled in uniforms');
        t.equal(uniforms.collision_sort, true, 'collision_sort enabled when drawing');
        t.equal(
          uniforms.collision_texture,
          'DUMMY_TEXTURE',
          'collision_texture set to dummy texture when drawing'
        );
      }
    },
    {
      updateProps: {
        getCollisionPriority: d => d.priority
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = layer.getModels()[0].getUniforms();
        t.ok(uniforms.collision_enabled, 'collision_enabled in uniforms');
        t.ok(uniforms.collision_sort, 'collision_sort enabled when getCollisionPriority set');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
