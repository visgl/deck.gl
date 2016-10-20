import test from 'tape-catch';
import 'luma.gl/headless';
import {Layer} from '../..';

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
    const layer = new Layer({
      ...LAYER_PROPS,
      data: dataVariant.data
    });
    t.equal(layer.getNumInstances(), dataVariant.size);
  }
  t.end();
});
