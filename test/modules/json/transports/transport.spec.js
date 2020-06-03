import test from 'tape-catch';

test('delayed onInitialized()', t => {
  const transportModule = require('@deck.gl/json/transports/transport');
  const Transport = transportModule.default; // eslint-disable-line no-console,no-undef
  const transport = new Transport();

  transport.setCallbacks({
    onInitialize: () => {
      t.ok(true, 'onInitialize called');
      t.end();
    }
  });
  transport._initialize();
});
