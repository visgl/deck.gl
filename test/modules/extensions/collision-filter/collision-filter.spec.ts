import test from 'tape-promise/tape';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import {ScatterplotLayer} from '@deck.gl/layers';
import {getLayerUniforms, testLayer} from '@deck.gl/test-utils';

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
        const uniforms = getLayerUniforms(layer);
        const attributes = layer.getAttributeManager().getAttributes();
        t.ok(uniforms.enabled, 'enabled in uniforms');
        t.equal(uniforms.sort, false, 'sort in disabled when reading');
        t.equal(uniforms.collision_texture, 'COLLISION_TEXTURE', 'collision_texture correctly set');
        t.ok(attributes.collisionPriorities, 'collisionPriorities attribute added');
      }
    },
    {
      updateProps: {
        collisionFBO: null
      },
      onAfterUpdate: ({layer}) => {
        const uniforms = getLayerUniforms(layer);
        t.equal(uniforms.enabled, false, 'enabled is disabled');
        t.equal(uniforms.sort, false, 'sort in disabled when reading');
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
        const uniforms = getLayerUniforms(layer);
        t.ok(uniforms.enabled, 'enabled in uniforms');
        t.equal(uniforms.sort, true, 'sort enabled when drawing');
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
        const uniforms = getLayerUniforms(layer);
        t.ok(uniforms.enabled, 'enabled in uniforms');
        t.ok(uniforms.sort, 'sort enabled when getCollisionPriority set');
      }
    }
  ];

  testLayer({Layer: ScatterplotLayer, testCases, onError: t.notOk});

  t.end();
});
