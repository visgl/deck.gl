import test from 'tape-catch';
import {Layer} from 'deck.gl';
import {TEST_EXPORTS} from 'deck.gl/lib/layer';

const {mergeDefaultProps} = TEST_EXPORTS;

const dataVariants = [
  {data: ['a', 'b', 'c'], size: 3}
  //  {data: , size: 3},
  //  {data: , size: 3}
];

const LAYER_PROPS = {
  id: 'testLayer',
  data: []
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

const LAYER_CONSTRUCT_FAIL_TEST_CASES = [
  {
    title: 'Null id',
    props: {id: null}
  },
  {
    title: 'Empty string id',
    props: {id: ''}
  }
];

class SubLayer extends Layer {}
SubLayer.layerName = 'SubLayer';
SubLayer.defaultProps = {
  getColor: x => x.color
};

class SubLayer2 extends Layer {}
SubLayer2.layerName = 'SubLayer2';

class SubLayer3 extends Layer {}
SubLayer3.layerName = 'SubLayer2';

test('Layer#mergeDefaultProps', t => {
  class A {}
  A.defaultProps = {a: 1};

  class B extends A {}
  B.defaultProps = {b: 2};

  const mergedProps = mergeDefaultProps(new B());

  t.equal(mergedProps.a, 1, 'base class props merged');
  t.equal(mergedProps.b, 2, 'sub class props merged');
  t.end();
});

test('Layer#constructor', t => {
  for (const tc of LAYER_CONSTRUCT_TEST_CASES) {
    const layer = new Layer(tc.props);
    t.ok(layer, `Layer created ${tc.title}`);
    const expectedId = tc.props.id || tc.id;
    t.equal(layer.id, expectedId, 'Layer id set correctly');
    t.ok(layer.props, 'Layer props not null');
  }
  t.end();
});

test('Layer#constructor with bad props', t => {
  for (const tc of LAYER_CONSTRUCT_FAIL_TEST_CASES) {
    t.throws(
      () => new Layer(tc.props),
      `Expected invalid prop to throw an error ${tc.title}`
    );
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

// test('Layer#constructor with bad or missing props', t => {
//   t.throws(
//     () => new Layer({...LAYER_PROPS, zoom: undefined}),
//     /Property zoom undefined in layer testLayer/,
//     'Expected invalid prop to throw an error'
//   );
//   t.end();
// });

test('Layer#getNumInstances', t => {
  for (const dataVariant of dataVariants) {
    const layer = new Layer(Object.assign({}, LAYER_PROPS, {data: dataVariant.data}));
    t.equal(layer.getNumInstances(), dataVariant.size);
  }
  t.end();
});

test('Layer#diffProps', t => {
  const layer = new SubLayer(LAYER_PROPS);
  const context = {viewportChanged: false};
  let diff;

  diff = layer.diffProps(LAYER_PROPS,
    Object.assign({}, LAYER_PROPS), context);
  t.false(diff.somethingChanged, 'same props');

  diff = layer.diffProps(LAYER_PROPS,
    Object.assign({}, LAYER_PROPS, {data: dataVariants[0]}), context);
  t.true(diff.dataChanged, 'data changed');

  diff = layer.diffProps(LAYER_PROPS,
    Object.assign({}, LAYER_PROPS, {size: 0}), context);
  t.true(diff.propsChanged, 'props changed');

  let invalidatedName = null;
  layer.state = {
    attributeManager: {
      invalidate: name => {
        invalidatedName = name;
      }
    }
  };

  diff = layer.diffProps(layer.props,
    Object.assign({}, LAYER_PROPS, {updateTriggers: {color: {version: 0}}}), context);
  t.is(invalidatedName, 'color', 'updateTriggers fired');

  t.end();
});
