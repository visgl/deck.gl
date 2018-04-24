import test from 'tape-catch';
import {View} from 'deck.gl';

test('View#imports', t => {
  t.ok(View, 'View import ok');
  t.end();
});
