/* eslint-disable max-statements */
import AttributeTransitionManager from '@deck.gl/core/lib/attribute/attribute-transition-manager';
import Attribute from '@deck.gl/core/lib/attribute/attribute';
import test from 'tape-catch';
import {isWebGL2, Timeline} from '@luma.gl/core';
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
    value: new Float32Array(12)
  }),
  instanceSizes: new Attribute(gl, {
    id: 'instanceSizes',
    size: 1,
    accessor: 'getSize',
    defaultValue: 1,
    transition: true,
    value: new Float32Array(4)
  })
};

test('AttributeTransitionManager#constructor', t => {
  let manager = new AttributeTransitionManager(gl, {id: 'attribute-transition'});
  t.ok(manager, 'AttributeTransitionManager is constructed');
  t.is(
    Boolean(manager.isSupported),
    isWebGL2(gl),
    'AttributeTransitionManager checks WebGL support'
  );

  manager.finalize();
  t.pass('AttributeTransitionManager is finalized');

  manager = new AttributeTransitionManager(null, {id: 'attribute-transition'});
  t.ok(manager, 'AttributeTransitionManager is constructed without GL context');
  t.notOk(manager.isSupported, 'AttributeTransitionManager checks WebGL support');

  manager.finalize();
  t.pass('AttributeTransitionManager is finalized');

  t.end();
});

if (isWebGL2(gl)) {
  test('AttributeTransitionManager#update', t => {
    const timeline = new Timeline();
    const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition', timeline});
    const attributes = Object.assign({}, TEST_ATTRIBUTES);

    attributes.indices.setNeedsRedraw('initial');
    attributes.instanceSizes.setNeedsRedraw('initial');
    attributes.instancePositions.setNeedsRedraw('initial');

    manager.update({attributes, transitions: {}, numInstances: 4});
    t.notOk(manager.hasAttribute('indices'), 'no transition for indices');
    t.notOk(manager.hasAttribute('instanceSizes'), 'no transition for instanceSizes');
    t.notOk(manager.hasAttribute('instancePositions'), 'no transition for instancePositions');

    manager.update({attributes, transitions: {getSize: 1000, getElevation: 1000}, numInstances: 0});
    t.notOk(manager.hasAttribute('indices'), 'no transition for indices');
    t.ok(manager.hasAttribute('instanceSizes'), 'added transition for instanceSizes');
    t.ok(manager.hasAttribute('instancePositions'), 'added transition for instancePositions');

    const sizeTransition = manager.transitions.instanceSizes;
    t.is(sizeTransition.buffers[0].getElementCount(), 1, 'buffer has correct size');

    const positionTransform = manager.transitions.instancePositions.transform;
    t.ok(positionTransform, 'transform is constructed for instancePositions');
    delete attributes.instancePositions;

    manager.update({attributes, transitions: {getSize: 1000, getElevation: 1000}, numInstances: 4});
    t.ok(manager.hasAttribute('instanceSizes'), 'added transition for instanceSizes');
    t.notOk(manager.hasAttribute('instancePositions'), 'removed transition for instancePositions');
    t.notOk(positionTransform._handle, 'instancePositions transform is deleted');
    t.is(sizeTransition.buffers[0].getElementCount(), 4, 'buffer has correct size');

    attributes.instanceSizes.update({value: new Float32Array(5).fill(1)});
    manager.update({attributes, transitions: {getSize: 1000}, numInstances: 5});
    manager.run();
    let transitioningBuffer = manager.getAttributes().instanceSizes.getBuffer();
    t.deepEquals(
      transitioningBuffer.getData(),
      [0, 0, 0, 0, 1],
      'buffer is extended with new data'
    );
    t.is(transitioningBuffer.getElementCount(), 5, 'buffer has correct size');

    attributes.instanceSizes.update({constant: true, value: [2]});
    manager.update({attributes, transitions: {getSize: 1000}, numInstances: 6});
    manager.run();
    transitioningBuffer = manager.getAttributes().instanceSizes.getBuffer();
    t.deepEquals(
      transitioningBuffer.getData(),
      [0, 0, 0, 0, 1, 2],
      'buffer is extended with new data'
    );
    t.is(transitioningBuffer.getElementCount(), 6, 'buffer has correct size');

    manager.finalize();
    t.notOk(transitioningBuffer._handle, 'transform buffer is deleted');
    t.notOk(manager.transitions.instanceSizes, 'transition is deleted');

    t.end();
  });

  test('AttributeTransitionManager#transition', t => {
    const timeline = new Timeline();
    const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition', timeline});
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

    timeline.setTime(0);
    manager.update({attributes, transitions, numInstances: 4});
    manager.run();
    t.is(startCounter, 1, 'transition starts');

    timeline.setTime(500);
    attributes.instanceSizes.needsRedraw({clearChangedFlags: true});
    manager.update({attributes, transitions, numInstances: 4});
    manager.run();
    t.is(startCounter, 1, 'no new transition is triggered');

    timeline.setTime(1000);
    attributes.instanceSizes.update({value: new Float32Array(4).fill(3)});
    attributes.instanceSizes.setNeedsRedraw('update');
    manager.update({attributes, transitions, numInstances: 4});
    manager.run();
    t.is(interruptCounter, 1, 'transition is interrupted');
    t.is(startCounter, 2, 'new transition is triggered');

    timeline.setTime(1500);
    manager.run();
    t.deepEquals(
      manager
        .getAttributes()
        .instanceSizes.getBuffer()
        .getData(),
      [2, 2, 2, 2],
      'attribute in transition'
    );

    attributes.instanceSizes.update({value: new Float32Array(4).fill(4)});
    attributes.instanceSizes.setNeedsRedraw('update');

    manager.update({attributes, transitions, numInstances: 4});
    manager.run();
    t.is(interruptCounter, 2, 'transition is interrupted');
    t.is(startCounter, 3, 'new transition is triggered');

    timeline.setTime(2000);
    manager.run();
    t.deepEquals(
      manager
        .getAttributes()
        .instanceSizes.getBuffer()
        .getData(),
      [3, 3, 3, 3],
      'attribute in transition'
    );

    timeline.setTime(2500);
    manager.run();
    t.is(endCounter, 1, 'transition ends');

    manager.finalize();
    t.end();
  });
} else {
  // AttributeTransitionManager should not fail in WebGL1
  test('AttributeTransitionManager#update, setCurrentTime', t => {
    const timeline = new Timeline();
    const manager = new AttributeTransitionManager(gl, {id: 'attribute-transition', timeline});
    const attributes = Object.assign({}, TEST_ATTRIBUTES);

    attributes.instanceSizes.setNeedsRedraw('initial');

    manager.update({attributes, transitions: {getSize: 1000, getElevation: 1000}, numInstances: 4});
    t.pass('update does not throw error');

    timeline.setTime(0);
    manager.run();
    t.pass('run does not throw error');

    t.is(Object.keys(manager.getAttributes()).length, 0, 'no attributes added to transition');
    manager.finalize();

    t.end();
  });
}
