import test from 'tape-catch';
import {experimental} from 'deck.gl';
const {View} = experimental;

test('View#imports', t => {
  t.ok(View, 'View import ok');
  t.end();
});
