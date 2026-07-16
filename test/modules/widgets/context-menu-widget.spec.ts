// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {ContextMenuWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ContextMenuWidget', async () => {
  const onMenuItemSelected = vi.fn();
  const widget = new ContextMenuWidget({
    menuItems: [
      {value: 'inspect', label: 'Inspect'},
      {value: 'delete', label: 'Delete'}
    ],
    onMenuItemSelected
  });
  testInstance = new WidgetTester({
    widgets: [widget]
  });

  await testInstance.idle();
  vi.spyOn((widget as any).deck, 'pickObject').mockReturnValue({
    x: 25,
    y: 35,
    picked: true,
    object: {id: 7},
    layer: null,
    color: null,
    index: 0,
    pixelRatio: 1
  });

  const preventDefault = vi.fn();
  const target = document.createElement('div');
  vi.spyOn(target, 'getBoundingClientRect').mockReturnValue({
    x: 0,
    y: 0,
    width: 100,
    height: 100,
    left: 0,
    top: 0,
    right: 100,
    bottom: 100,
    toJSON: () => {}
  });

  widget.handleContextMenu({
    clientX: 25,
    clientY: 35,
    target,
    preventDefault
  } as any);
  await testInstance.idle();

  const menuItems = testInstance.findElements('.deck-widget-dropdown-item');
  expect(preventDefault).toHaveBeenCalledOnce();
  expect(menuItems).toHaveLength(2);
  expect(menuItems[0].textContent).toContain('Inspect');

  testInstance.click('.deck-widget-dropdown-item:nth-child(2)');
  await testInstance.idle();

  expect(onMenuItemSelected).toHaveBeenCalledWith(
    'delete',
    expect.objectContaining({
      x: 25,
      y: 35,
      object: {id: 7}
    })
  );
  expect(testInstance.findElements('.deck-widget-dropdown-item')).toHaveLength(0);
});
