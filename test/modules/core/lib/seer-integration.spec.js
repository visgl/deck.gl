import test from 'tape-catch';

import {window, isBrowser} from '@deck.gl/core/utils/globals';
import {setPropOverrides, applyPropOverrides} from '@deck.gl/core/lib/seer-integration';

test('Seer overrides', t => {
  const props = {
    id: 'arc-layer',
    opacity: {data: {value: 0.4}},
    one: 1
  };

  if (isBrowser) {
    window.__SEER_INITIALIZED__ = false;

    setPropOverrides('arc-layer', ['opacity', 'data', 'value'], 0.5);
    applyPropOverrides(props);
    t.equal(props.opacity.data.value, 0.4, 'The value should not have been overriden');

    window.__SEER_INITIALIZED__ = true;

    setPropOverrides('arc-layer', ['opacity', 'data', 'value'], 0.5);
    applyPropOverrides(props);
    t.equal(props.opacity.data.value, 0.5, 'The value should now have been changed');
  }

  t.end();
});
