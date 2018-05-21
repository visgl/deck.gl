/* eslint-disable max-statements */
import AttributeTransitionManager from '@deck.gl/core/lib/attribute-transition-manager';
import Attribute from '@deck.gl/core/lib/attribute';
import test from 'tape-catch';
import {isWebGL2} from 'luma.gl';
import {gl} from '@deck.gl/test-utils';

const TEST_ATTRIBUTES = {
  indices: new Attribute(gl, {
    id: 'indices',
    isIndexed: true,
    size: 1,
    update: () => {},
    value: new Float32Array([0, 1, 2, 1, 3, 2])
  }),
  instancePositions: new Attribute(gl, {
    id: 'instancePositions',
    size: 3,
    accessor: ['getPosition', 'getElevation'],
    update: () => {},
    transition: true,
    value: new Float32Array(4)
  }),
  instanceSizes: new Attribute(gl, {
    id: 'instanceSizes',
    size: 1,
    accessor: 'getSize',
    defaultValue: 1,
    transition: true,
    value: new Float32Array(12)
  })
};

test('AttributeTransitionManager#constructor', t => {
  const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition'});
  t.ok(manager, 'AttributeTransitionManager is constructed');
  t.is(
    Boolean(manager.isSupported),
    isWebGL2(gl),
    'AttributeTransitionManager checks WebGL support'
  );

  manager.finalize();
  t.pass('AttributeTransitionManager is finalized');

  t.end();
});

if (isWebGL2(gl)) {
  test('AttributeTransitionManager#update', t => {
    const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition'});
    const attributes = Object.assign({}, TEST_ATTRIBUTES);

    t.notOk(manager.transform, 'transform is not constructed');

    attributes.indices.setNeedsRedraw('initial');
    attributes.instanceSizes.setNeedsRedraw('initial');
    attributes.instancePositions.setNeedsRedraw('initial');

    manager.update(attributes, {});
    t.notOk(manager.hasAttribute('indices'), 'no transition for indices');
    t.notOk(manager.hasAttribute('instanceSizes'), 'no transition for instanceSizes');
    t.notOk(manager.hasAttribute('instancePositions'), 'no transition for instanceSizes');
    t.notOk(manager.transform, 'transform is not constructed');

    manager.update(attributes, {getSize: 1000, getElevation: 1000});
    t.notOk(manager.hasAttribute('indices'), 'no transition for indices');
    t.ok(manager.hasAttribute('instanceSizes'), 'added transition for instanceSizes');
    t.ok(manager.hasAttribute('instancePositions'), 'added transition for instancePositions');
    t.ok(manager.transform, 'a new transform is constructed');

    let lastTransform = manager.transform;
    delete attributes.instancePositions;

    manager.update(attributes, {getSize: 1000, getElevation: 1000});
    t.ok(manager.hasAttribute('instanceSizes'), 'added transition for instanceSizes');
    t.notOk(manager.hasAttribute('instancePositions'), 'removed transition for instancePositions');
    t.ok(
      manager.transform && manager.transform !== lastTransform,
      'a new transform is constructed'
    );
    t.notOk(lastTransform.model.program._handle, 'last transform is deleted');

    lastTransform = manager.transform;
    manager.finalize();
    t.notOk(lastTransform.model.program._handle, 'transform is deleted');

    t.end();
  });

  test('AttributeTransitionManager#transition', t => {
    const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition'});
    const attributes = Object.assign({}, TEST_ATTRIBUTES);

    let startCounter = 0;
    let interruptCounter = 0;
    let endCounter = 0;
    const transitions = {
      getSize: {
        duration: 1000,
        onStart: () => {
          startCounter++;
        },
        onInterrupt: () => {
          interruptCounter++;
        },
        onEnd: () => {
          endCounter++;
        }
      }
    };

    attributes.instanceSizes.update({value: new Float32Array(4).fill(1)});
    attributes.instanceSizes.setNeedsRedraw('initial');

    manager.update(attributes, transitions);
    manager.setCurrentTime(0);
    t.is(startCounter, 1, 'transition starts');

    attributes.instanceSizes.needsRedraw({clearChangedFlags: true});
    manager.update(attributes, transitions);
    manager.setCurrentTime(500);
    t.is(startCounter, 1, 'no new transition is triggered');

    attributes.instanceSizes.update({value: new Float32Array(4).fill(3)});
    attributes.instanceSizes.setNeedsRedraw('update');

    manager.update(attributes, transitions);
    manager.setCurrentTime(1000);
    t.is(interruptCounter, 1, 'transition is interrupted');
    t.is(startCounter, 2, 'new transition is triggered');

    manager.setCurrentTime(1500);
    t.deepEquals(
      manager.getAttributes().instanceSizes.getData(),
      [2, 2, 2, 2],
      'attribute in transition'
    );

    attributes.instanceSizes.update({value: new Float32Array(4).fill(4)});
    attributes.instanceSizes.setNeedsRedraw('update');

    manager.update(attributes, transitions);
    manager.setCurrentTime(1500);
    t.is(interruptCounter, 2, 'transition is interrupted');
    t.is(startCounter, 3, 'new transition is triggered');

    manager.setCurrentTime(2000);
    t.deepEquals(
      manager.getAttributes().instanceSizes.getData(),
      [3, 3, 3, 3],
      'attribute in transition'
    );

    manager.setCurrentTime(2500);
    t.is(endCounter, 1, 'transition ends');

    manager.finalize();

    t.end();
  });
} else {
  // AttributeTransitionManager should not fail in WebGL1
  test('AttributeTransitionManager#update, setCurrentTime', t => {
    const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition'});
    const attributes = Object.assign({}, TEST_ATTRIBUTES);

    attributes.instanceSizes.setNeedsRedraw('initial');

    manager.update(attributes, {getSize: 1000, getElevation: 1000});
    t.pass('update does not throw error');

    manager.setCurrentTime(0);
    t.pass('setCurrentTime does not throw error');

    t.is(Object.keys(manager.getAttributes()).length, 0, 'no attributes added to transition');
    manager.finalize();

    t.end();
  });
}
