// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {IconWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('IconWidget', async () => {
  const onClick = vi.fn();
  testInstance = new WidgetTester({
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
});
