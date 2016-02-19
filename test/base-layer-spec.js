import test from 'tape';
import {BaseLayer} from '../src';

const dataVariants = [
  {data: ['a', 'b', 'c'], size: 3},
  {data: new Map('a', 'b', 'c'), size: 3},
  {data: {a: 'a', b: 'b', c: 'c'}, size: 3}
];

test('BaseLayer.getNumInstances', t => {
  for (const dataVariant of dataVariants) {
    const layer = new BaseLayer({
      data: dataVariants.data
    });
    t.equal(layer.getNumInstances(), dataVariant.size);
  }
  t.end();
});
