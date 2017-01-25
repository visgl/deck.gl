import test from 'tape-catch';
import {Layer} from 'deck.gl';
import {TEST_EXPORTS} from 'deck.gl/lib/layer';

const {mergeDefaultProps} = TEST_EXPORTS;

const dataVariants = [
  {data: ['a', 'b', 'c'], size: 3}
  //  {data: new Map('a', 'b', 'c'), size: 3},
  //  {data: {a: 'a', b: 'b', c: 'c'}, size: 3}
];

const LAYER_PROPS = {
  id: 'testLayer',
  data: []
};
const LAYER_PROPS_ZEROES = {
  id: 'testLayer',
  data: []
};

class SubLayer extends Layer {}
SubLayer.layerName = 'SubLayer';
SubLayer.defaultProps = {
  getColor: x => x.color
};

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
  const layer = new Layer(LAYER_PROPS);
  t.ok(layer, 'Layer created');
  t.end();
});

test('Layer#constructor with zeroes', t => {
  const layer = new Layer(LAYER_PROPS_ZEROES);
  t.ok(layer, 'Layer created');
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
