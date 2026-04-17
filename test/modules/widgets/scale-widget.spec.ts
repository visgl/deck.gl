// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

test('ScaleWidget', async () => {
  const testInstance = new WidgetTester({
    widgets: [new ScaleWidget()]
  });

  await testInstance.idle();

  testInstance.destroy();
});
