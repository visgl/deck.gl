import test from 'tape-catch';
import {Effect} from '../..';

test('Effect#constructor', t => {
  const effect = new Effect();
  t.ok(effect, 'Effect created');
  t.end();
});
