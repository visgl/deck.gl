import test from 'tape-catch';

import {window} from 'deck.gl/lib/utils/globals';
import {setOverride, getOverrides} from 'deck.gl/debug/seer-integration';

test('Seer overrides', t => {

  const props = {
    id: 'arc-layer',
    opacity: {data: {value: 0.4}},
    one: 1
  };

  setOverride('arc-layer', ['opacity', 'data', 'value'], 0.5);
  getOverrides(props);
  t.equal(props.opacity.data.value, 0.4, 'The value should not have been overriden');

  window.__SEER_INITIALIZED__ = true;

  setOverride('arc-layer', ['opacity', 'data', 'value'], 0.5);
  getOverrides(props);
  t.equal(props.opacity.data.value, 0.5, 'The value should now have been changed');

  t.end();

});
