import test from 'tape-catch';
import VENDOR_PREFIX from '@deck.gl/core/utils/css-vendor-prefix';
import {isBrowser} from '@deck.gl/core/utils/globals';

test('utils#CSS vendor prefix', t => {
  if (isBrowser) {
    t.is(VENDOR_PREFIX, '-webkit-', 'returns Chrome CSS prefix');
  } else {
    t.is(VENDOR_PREFIX, '', 'does not break in non-browser');
  }
  t.end();
});
