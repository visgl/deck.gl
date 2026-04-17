// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {IconWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

test('IconWidget', async () => {
  const onClick = vi.fn();
  const testInstance = new WidgetTester({
    widgets: [
      new IconWidget({
        icon: './icon.png',
        onClick
      })
    ]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-button > button');
  expect(onClick).toHaveBeenCalledOnce();

  testInstance.destroy();
});
