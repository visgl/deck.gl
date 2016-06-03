import test from 'tape-catch';
import Layer from '../src/layer';

const dataVariants = [
  {data: ['a', 'b', 'c'], size: 3}
  //  {data: new Map('a', 'b', 'c'), size: 3},
  //  {data: {a: 'a', b: 'b', c: 'c'}, size: 3}
];

const LAYER_PROPS = {
  id: 'testLayer',
  width: 1,
  height: 1,
  latitude: 1,
  longitude: 1,
  zoom: 1,
  data: []
};

test('Layer#constructor', t => {
  const layer = new Layer(LAYER_PROPS);
  t.ok(layer, 'Layer created');
  t.end();
});

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
