// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {SelectorWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('SelectorWidget', async () => {
  const onChange = vi.fn();
  testInstance = new WidgetTester({
    widgets: [
      new SelectorWidget({
        initialValue: 'grid',
        onChange,
        options: [
          {value: 'grid', icon: './grid.png', label: 'Grid'},
          {value: 'list', icon: './list.png', label: 'List'},
          {value: 'detail', icon: './detail.png', label: 'Detail'}
        ]
      })
    ]
  });

  await testInstance.idle();
  let button = testInstance.findElements('.deck-widget-icon-button')[0] as HTMLButtonElement;
  expect(button.title).toBe('Grid');

  testInstance.click('.deck-widget-icon-button');
  await testInstance.idle();

  const menuItems = testInstance.findElements('.deck-widget-dropdown-item');
  expect(menuItems).toHaveLength(3);
  expect(menuItems[1].textContent).toContain('List');

  testInstance.click('.deck-widget-dropdown-item:nth-child(2)');
  await testInstance.idle();

  expect(onChange).toHaveBeenCalledWith('list');
  button = testInstance.findElements('.deck-widget-icon-button')[0] as HTMLButtonElement;
  expect(button.title).toBe('List');
  expect(testInstance.findElements('.deck-widget-dropdown-item')).toHaveLength(0);
});
