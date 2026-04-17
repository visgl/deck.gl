// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {ToggleWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ToggleWidget', async () => {
  const onChange = vi.fn();
  testInstance = new WidgetTester({
    widgets: [
      new ToggleWidget({
        icon: './icon-off.png',
        label: 'Toggle off',
        color: 'rgb(255, 0, 0)',
        onIcon: './icon-on.png',
        onLabel: 'Toggle on',
        onColor: 'rgb(0, 255, 0)',
        onChange
      })
    ]
  });

  await testInstance.idle();
  const root = testInstance.findElements('.deck-widget-toggle')[0] as HTMLDivElement;
  const button = testInstance.findElements('.deck-widget-icon-button')[0] as HTMLButtonElement;
  const icon = testInstance.findElements('.deck-widget-icon')[0] as HTMLDivElement;

  expect(root.dataset.checked).toBe('false');
  expect(button.title).toBe('Toggle off');
  expect(icon.style.backgroundColor).toBe('rgb(255, 0, 0)');

  testInstance.click('.deck-widget-icon-button');

  expect(onChange).toHaveBeenCalledWith(true);
  expect(root.dataset.checked).toBe('true');
  expect(button.title).toBe('Toggle on');
  expect(icon.style.backgroundColor).toBe('rgb(0, 255, 0)');
});
