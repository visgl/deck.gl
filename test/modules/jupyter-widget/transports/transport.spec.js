import test from 'tape-catch';

import {Transport} from '@deck.gl/jupyter-widget';

// TODO re-activate test
test('Transport - delayed onInitialize()', t => {
  const transport = new Transport();

  transport._initialize();

  transport.setCallbacks({
    onIntialize: () => t.end()
  });

  t.end();
});
