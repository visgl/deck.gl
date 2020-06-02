import test from 'tape-catch';

import './binary-transport.spec';
import './create-deck.spec';
import './index.spec';
import './widget-tooltip.spec';

let testOp = test;

// Skip tests if in browser mode
try {
  require('@deck.gl/jupyter-widget/binary-transport');
} catch (err) {
  testOp = test.skip;
  // eslint-disable-next-line no-console,no-undef
  console.debug('Skipping tests in browser');
}

export {testOp};
