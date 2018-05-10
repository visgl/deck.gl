import test from 'tape-catch';
import {ViewManager} from 'deck.gl';

test('ViewManager#imports', t => {
  t.ok(ViewManager, 'ViewManager import ok');
  t.end();
});
