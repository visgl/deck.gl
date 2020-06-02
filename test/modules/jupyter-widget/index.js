import test from 'tape-catch';

import './binary-transport.spec';
import './create-deck.spec';
import './index.spec';
import './widget-tooltip.spec';

let testOp = test;

// Skip tests if in browser mode
try {
  const moduleAlias = require('module-alias');
  moduleAlias.addAlias('react-map-gl/dist/esm/mapbox/mapbox', (fromPath, request, alias) => {
    return `${__dirname}/../../../node_modules/react-map-gl/dist/es5/mapbox/mapbox`;
  });
} catch (err) {
  testOp = test.skip;
  // eslint-disable-next-line no-console,no-undef
  console.debug('Skipping tests in browser');
}

export {testOp};
