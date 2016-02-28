import test from 'tape-catch';
import {Layer} from '../src';

const dataVariants = [
  {data: ['a', 'b', 'c'], size: 3}
  //  {data: new Map('a', 'b', 'c'), size: 3},
  //  {data: {a: 'a', b: 'b', c: 'c'}, size: 3}
];

test('Layer#constructor', t => {
  const layer = new Layer({id: 'testLayer', width: 1, height: 1, data: []});
  t.ok(layer, 'Layer created');
  t.end();
});

test('Layer#getNumInstances', t => {
  for (const dataVariant of dataVariants) {
    const layer = new Layer({
      id: 'testLayer', width: 1, height: 1,
      data: dataVariant.data
    });
    t.equal(layer.getNumInstances(), dataVariant.size);
  }
  t.end();
});
