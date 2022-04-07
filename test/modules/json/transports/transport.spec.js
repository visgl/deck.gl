import test from 'tape-promise/tape';
import Transport from '@deck.gl/json/transports/transport';

test('delayed onInitialized()', t => {
  Transport.setCallbacks({
    onInitialize: () => {
      t.ok(true, 'onInitialize called');
      t.end();
    }
  });

  const transport = new Transport();
  transport._initialize();
});
