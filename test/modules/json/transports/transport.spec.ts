// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {Transport} from '@deck.gl/json';

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
