import test from 'tape-promise/tape';

import {Layer, LayerManager, Viewport} from '@deck.gl/core';
import {CollideExtension} from '@deck.gl/extensions';
import CollidePass from '@deck.gl/extensions/collide/collide-pass';
import gl from '@deck.gl/test-utils/utils/setup-gl';

class TestLayer extends Layer {
  initializeState() {}
}

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
