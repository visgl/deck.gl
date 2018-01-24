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
import {Layer, AttributeManager} from 'deck.gl';
import {testInitializeLayer} from '@deck.gl/test-utils';
import {makeSpy} from '@deck.gl/test-utils';

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
  },
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
  getTime: x => x.time
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
    const layer = Array.isArray(tc.props) ?
      new Layer(...tc.props) :
      new Layer(tc.props);
    t.ok(layer, `Layer created ${tc.title}`);
    const props = Array.isArray(tc.props) ? tc.props[0] : tc.props;
    const expectedId = props.id || tc.id;
    t.equal(layer.id, expectedId, 'Layer id set correctly');
    t.ok(layer.props, 'Layer props not null');
  }
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
  t.comment(JSON.stringify(layer.props));
  t.equal(layer.props.onHover, Layer.defaultProps.onHover, 'Layer defaultProps found');
  t.equal(layer.props.getColor, SubLayer.defaultProps.getColor, 'SubLayer defaultProps found');
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

test('Layer#diffProps', t => {
  const layer = new SubLayer(LAYER_PROPS);
  testInitializeLayer({layer});

  layer.diffProps(Object.assign({}, LAYER_PROPS), LAYER_PROPS);
  t.false(layer.getChangeFlags().somethingChanged, 'same props');

  layer.diffProps(Object.assign({}, LAYER_PROPS, {data: dataVariants[0]}), LAYER_PROPS);
  t.true(layer.getChangeFlags().dataChanged, 'data changed');

  layer.diffProps(Object.assign({}, LAYER_PROPS, {size: 0}), LAYER_PROPS);
  t.true(layer.getChangeFlags().propsChanged, 'props changed');

  // Dummy attribute manager to avoid diffUpdateTriggers failure
  layer.diffProps(Object.assign({}, LAYER_PROPS, {updateTriggers: {time: 100}}), LAYER_PROPS);
  t.true(layer.getChangeFlags().propsOrDataChanged, 'props changed');

  const spy = makeSpy(AttributeManager.prototype, 'invalidate');
  layer.diffProps(
    Object.assign({}, LAYER_PROPS, {updateTriggers: {time: {version: 0}}}),
    layer.props
  );
  t.ok(spy.called, 'updateTriggers fired');
  spy.restore();

  t.end();
});
