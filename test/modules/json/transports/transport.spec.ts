// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import Transport from '@deck.gl/json/transports/transport';

test('delayed onInitialized()', () => {
  Transport.setCallbacks({
    onInitialize: () => {
      expect(true, 'onInitialize called').toBeTruthy();
    }
  });

  const transport = new Transport();
  transport._initialize();
});
