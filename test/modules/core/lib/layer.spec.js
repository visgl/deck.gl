// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import test from 'tape-catch';
import {Layer, AttributeManager, COORDINATE_SYSTEM, MapView, OrbitView} from 'deck.gl';
import {testInitializeLayer, testLayer} from '@deck.gl/test-utils';
import {makeSpy} from '@probe.gl/test-utils';
import {equals, Matrix4} from 'math.gl';
import {Timeline} from '@luma.gl/core';

import {sleep, testAsyncData} from './async-iterator-test-utils';

const dataVariants = [{data: ['a', 'b', 'c'], size: 3}];

const LAYER_PROPS = {
  id: 'testLayer',
  data: [],
  updateTriggers: {}
};

const LAYER_CONSTRUCT_TEST_CASES = [
  {
    title: 'Default id',
    props: {data: null},
    id: 'Layer'
  },
  {
    title: 'Null data',
    props: {id: 'testLayer', data: null}
  },
  {
    title: 'Empty data',
    props: {id: 'testLayer', data: []}
  },
  {
    title: 'With data object',
    props: {id: 'testLayer', data: {a: 'a', b: 'b', c: 'c'}}
  },
  {
    title: 'With data map',
    props: {id: 'testLayer', data: new Map([['a', 'a'], ['b', 'b'], ['c', 'c']])}
  }
];

const LAYER_CONSTRUCT_MULTIPROP_TEST_CASES = [
  {
    title: 'With multiple prop objects',
    props: [{data: {a: 'a', b: 'b', c: 'c'}}, {id: 'testLayer'}]
  }
];

class SubLayer extends Layer {
  initializeState() {
    this.state.attributeManager.addInstanced({
      time: {size: 1, accessor: 'getTime', defaultValue: 0, update: this.calculateTime}
    });
  }
}

SubLayer.layerName = 'SubLayer';
SubLayer.defaultProps = {
  getTime: {type: 'accessor', value: x => x.time},
  getColor: {type: 'accessor', value: [0, 0, 0, 255]},
  sizeScale: {type: 'function', value: x => 1, optional: true}
};

class SubLayer2 extends Layer {
  initializeState() {}
}

SubLayer2.layerName = 'SubLayer2';

class SubLayer3 extends Layer {
  initializeState() {}
}

SubLayer3.layerName = 'SubLayer2';

test('Layer#constructor', t => {
  for (const tc of LAYER_CONSTRUCT_TEST_CASES) {
    const layer = Array.isArray(tc.props) ? new Layer(...tc.props) : new Layer(tc.props);
    t.ok(layer, `Layer created ${tc.title}`);
    const props = Array.isArray(tc.props) ? tc.props[0] : tc.props;
    const expectedId = props.id || tc.id;
    t.equal(layer.id, expectedId, 'Layer id set correctly');
    t.ok(layer.props, 'Layer props not null');
  }
  t.end();
});

test('Layer#clone', t => {
  const layer = new SubLayer({id: 'test-layer', data: [0, 1]});
  const newLayer = layer.clone({pickable: true});

  t.is(newLayer.constructor.name, 'SubLayer', 'cloned layer has correct type');
  t.is(newLayer.props.id, 'test-layer', 'cloned layer has correct id');
  t.deepEquals(newLayer.props.data, [0, 1], 'cloned layer has correct data');

  t.end();
});

test('Layer#constructor(multi prop objects)', t => {
  for (const tc of LAYER_CONSTRUCT_MULTIPROP_TEST_CASES) {
    const layer = new Layer(...tc.props);
    t.ok(layer, `Layer created ${tc.title}`);
    const props = Object.assign({}, ...tc.props);
    const expectedId = props.id || tc.id;
    t.equal(layer.id, expectedId, 'Layer id set correctly');
    t.ok(layer.props, 'Layer props not null');
  }
  t.end();
});

test('SubLayer#constructor', t => {
  const layer = new SubLayer(LAYER_PROPS);
  t.ok(layer, 'SubLayer created');
  const defaultProps = SubLayer._mergedDefaultProps;
  t.equal(layer.props.onHover, defaultProps.onHover, 'Layer defaultProps found');
  t.equal(layer.props.getColor, defaultProps.getColor, 'SubLayer defaultProps found');
  t.end();
});

test('SubLayer2#constructor (no defaultProps)', t => {
  const layer = new SubLayer2(LAYER_PROPS);
  t.ok(layer, 'SubLayer2 created');
  t.end();
});

test('SubLayer3#constructor (no layerName, no defaultProps)', t => {
  const layer = new SubLayer3(LAYER_PROPS);
  t.ok(layer, 'SubLayer3 created');
  t.end();
});

test('Layer#getNumInstances', t => {
  for (const dataVariant of dataVariants) {
    const layer = new Layer(Object.assign({}, LAYER_PROPS, {data: dataVariant.data}));
    t.equal(layer.getNumInstances(), dataVariant.size);
  }
  t.end();
});

test('Layer#validateProps', t => {
  let layer = new SubLayer(LAYER_PROPS);
  layer.validateProps();
  t.pass('Layer props are valid');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {sizeScale: 1}));
  t.throws(() => layer.validateProps(), /sizeScale/, 'throws on invalid function prop');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {opacity: 'transparent'}));
  t.throws(() => layer.validateProps(), /opacity/, 'throws on invalid numberic prop');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {opacity: 2}));
  t.throws(() => layer.validateProps(), /opacity/, 'throws on numberic prop out of range');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {getColor: [255, 0, 0]}));
  layer.validateProps();
  t.pass('Layer props are valid');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {getColor: d => d.color}));
  layer.validateProps();
  t.pass('Layer props are valid');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {getColor: 3}));
  t.throws(() => layer.validateProps(), /getColor/, 'throws on invalid accessor prop');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {sizeScale: null}));
  layer.validateProps();
  t.pass('Layer props are valid');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {sizeScale: [1, 10]}));
  t.throws(() => layer.validateProps(), /sizeScale/, 'throws on invalid function prop');

  t.end();
});

// eslint-disable-next-line max-statements
test('Layer#diffProps', t => {
  let layer = new SubLayer(LAYER_PROPS);
  t.doesNotThrow(() => testInitializeLayer({layer, onError: t.notOk}), 'Layer initialized OK');

  layer.diffProps(new SubLayer(Object.assign({}, LAYER_PROPS)).props, layer.props);
  t.false(layer.getChangeFlags().somethingChanged, 'same props');

  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {data: dataVariants[0]})).props,
    layer.props
  );
  t.true(layer.getChangeFlags().dataChanged, 'data changed');

  layer.diffProps(new SubLayer(Object.assign({}, LAYER_PROPS, {size: 0})).props, layer.props);
  t.true(layer.getChangeFlags().propsChanged, 'props changed');

  // Dummy attribute manager to avoid diffUpdateTriggers failure
  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 100}})).props,
    layer.props
  );
  t.true(layer.getChangeFlags().propsOrDataChanged, 'props changed');

  const spy = makeSpy(AttributeManager.prototype, 'invalidate');
  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: {version: 0}}})).props,
    layer.props
  );
  t.ok(spy.called, 'updateTriggers fired');
  spy.restore();

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 0}}));
  testInitializeLayer({layer, onError: t.notOk});
  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 0}})).props,
    layer.props
  );
  t.false(layer.getChangeFlags().updateTriggersChanged, 'updateTriggers not fired');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 0}}));
  testInitializeLayer({layer, onError: t.notOk});
  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 1}})).props,
    layer.props
  );
  t.true(layer.getChangeFlags().updateTriggersChanged, 'updateTriggersChanged fired');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 0}}));
  testInitializeLayer({layer, onError: t.notOk});
  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: null}})).props,
    layer.props
  );
  t.true(layer.getChangeFlags().updateTriggersChanged, 'updateTriggersChanged fired');

  layer = new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 0}}));
  testInitializeLayer({layer, onError: t.notOk});
  layer.diffProps(
    new SubLayer(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: undefined}})).props,
    layer.props
  );
  t.true(layer.getChangeFlags().updateTriggersChanged, 'updateTriggersChanged fired');

  t.end();
});

test('Layer#use64bitPositions', t => {
  let layer = new SubLayer({});
  t.true(layer.use64bitPositions(), 'returns true for default settings');

  layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.LNGLAT});
  t.true(layer.use64bitPositions(), 'returns true for COORDINATE_SYSTEM.LNGLAT');

  layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.CARTESIAN});
  t.true(layer.use64bitPositions(), 'returns true for COORDINATE_SYSTEM.CARTESIAN');

  layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS});
  t.false(layer.use64bitPositions(), 'returns false for COORDINATE_SYSTEM.METER_OFFSETS');

  t.end();
});

test('Layer#project', t => {
  let layer = new SubLayer({coordinateSystem: COORDINATE_SYSTEM.LNGLAT});
  testInitializeLayer({layer, onError: t.notOk});
  layer.context.viewport = new MapView().makeViewport({
    width: 400,
    height: 300,
    viewState: {longitude: 0, latitude: 0, zoom: 10}
  });
  t.ok(equals(layer.project([0, 0, 100]), [200, 150, 0.9981698636949582]), 'returns correct value');

  layer = new SubLayer({
    coordinateSystem: COORDINATE_SYSTEM.METER_OFFSETS,
    coordinateOrigin: [0.01, 0.01]
  });
  testInitializeLayer({layer, onError: t.notOk});
  layer.context.viewport = new MapView().makeViewport({
    width: 400,
    height: 300,
    viewState: {longitude: 0, latitude: 0, zoom: 10}
  });

  t.ok(
    equals(layer.project([100, 100, 100]), [
      215.91962780165122,
      134.08037212774843,
      0.9981698636949582
    ]),
    'returns correct value'
  );

  layer = new SubLayer({
    coordinateSystem: COORDINATE_SYSTEM.CARTESIAN,
    modelMatrix: new Matrix4().rotateZ(Math.PI / 2)
  });
  testInitializeLayer({layer, onError: t.notOk});
  layer.context.viewport = new OrbitView().makeViewport({
    width: 400,
    height: 300,
    viewState: {zoom: 0, rotationOrbit: 30}
  });

  t.ok(
    equals(layer.project([100, 100, 100]), [
      77.35308047269142,
      60.21622351419864,
      0.8327158213685135
    ]),
    'returns correct value'
  );

  t.end();
});

test('Layer#Async Iterable Data', async t => {
  async function getData() {
    await sleep(50);
    return [0, 1, 2, 3, 4, 5, 6, 7];
  }

  async function* getDataIterator() {
    await sleep(50);
    yield [0, 1, 2];
    await sleep(50);
    yield [3, 4];
    await sleep(50);
    yield [5, 6, 7];
  }

  let data = await testAsyncData(t, getData());
  t.deepEquals(data, [0, 1, 2, 3, 4, 5, 6, 7], 'data is fully loaded');

  data = await testAsyncData(t, getDataIterator());
  t.deepEquals(data, [0, 1, 2, 3, 4, 5, 6, 7], 'data is fully loaded');

  t.end();
});

test('Layer#uniformTransitions', t => {
  const drawCalls = [];
  const timeline = new Timeline();

  class TestLayer extends Layer {
    initializeState() {}

    draw() {
      drawCalls.push({
        opacity: this.props.opacity
      });
    }
  }

  const testCases = [
    {
      props: {
        id: 'testLayer',
        data: [],
        opacity: 0
      },
      onBeforeUpdate: () => timeline.setTime(0),
      onAfterUpdate: () => t.deepEquals(drawCalls.pop(), {opacity: 0}, 'layer drawn with opacity')
    },
    {
      updateProps: {
        opacity: 1
      },
      onBeforeUpdate: () => timeline.setTime(100),
      onAfterUpdate: () => t.deepEquals(drawCalls.pop(), {opacity: 1}, 'layer drawn with opacity')
    },
    {
      updateProps: {
        opacity: 0,
        transitions: {
          opacity: 200
        }
      },
      onBeforeUpdate: () => timeline.setTime(200),
      onAfterUpdate: () =>
        t.deepEquals(drawCalls.pop(), {opacity: 1}, 'layer drawn with opacity in transition')
    },
    {
      updateProps: {
        opacity: 0
      },
      onBeforeUpdate: () => timeline.setTime(300),
      onAfterUpdate: () =>
        t.deepEquals(drawCalls.pop(), {opacity: 0.5}, 'layer drawn with opacity in transition')
    },
    {
      updateProps: {
        opacity: 0
      },
      onBeforeUpdate: () => timeline.setTime(400),
      onAfterUpdate: () =>
        t.deepEquals(drawCalls.pop(), {opacity: 0}, 'layer drawn with opacity in transition')
    }
  ];

  testLayer({Layer: TestLayer, timeline, testCases, onError: t.notOk});

  t.end();
});

test('Layer#calculateInstancePickingColors', t => {
  const testCases = [
    {
      props: {
        data: new Array(2).fill(0)
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        t.deepEquals(
          instancePickingColors.value.subarray(0, 6),
          [1, 0, 0, 2, 0, 0],
          'instancePickingColors is populated'
        );
      }
    },
    {
      updateProps: {
        data: new Array(3).fill(0)
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        t.deepEquals(
          instancePickingColors.value.subarray(0, 9),
          [1, 0, 0, 2, 0, 0, 3, 0, 0],
          'instancePickingColors is populated'
        );
      }
    },
    {
      updateProps: {
        data: new Array(3).fill(0)
      },
      onBeforeUpdate: ({layer}) => {
        layer.clearPickingColor(new Uint8Array([2, 0, 0]));
        layer.restorePickingColors();
      },
      onAfterUpdate: ({layer}) => {
        const {instancePickingColors} = layer.getAttributeManager().getAttributes();
        t.deepEquals(
          instancePickingColors.value.subarray(0, 9),
          [1, 0, 0, 2, 0, 0, 3, 0, 0],
          'instancePickingColors is populated'
        );
      }
    }
  ];

  testLayer({Layer: SubLayer2, testCases, onError: t.notOk});

  t.end();
});
