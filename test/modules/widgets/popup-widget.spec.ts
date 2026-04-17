// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {PopupWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

test('PopupWidget', async () => {
  const onOpenChange = vi.fn();
  const testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    widgets: [
      new PopupWidget({
        position: [0, 0],
        content: 'Popup contents',
        onOpenChange
      })
    ]
  });

  await testInstance.idle();
  let popupContent = testInstance.findElements('.deck-widget-popup-content')[0] as HTMLDivElement;
  expect(popupContent).toBeTruthy();
  expect(popupContent.textContent).toContain('Popup contents');

  testInstance.click('.deck-widget-popup-close-button');
  await testInstance.idle();

  expect(onOpenChange).toHaveBeenCalledWith(false);
  expect(testInstance.findElements('.deck-widget-popup-content')).toHaveLength(0);

  testInstance.destroy();
});

test('PopupWidget#marker opens popup', async () => {
  const onOpenChange = vi.fn();
  const testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    widgets: [
      new PopupWidget({
        position: [0, 0],
        content: 'Opened from marker',
        marker: {text: 'Open popup'},
        defaultIsOpen: false,
        onOpenChange
      })
    ]
  });

  await testInstance.idle();
  expect(testInstance.findElements('.deck-widget-popup-content')).toHaveLength(0);

  testInstance.click('.deck-widget-popup-marker > div');
  await testInstance.idle();

  expect(onOpenChange).toHaveBeenCalledWith(true);
  const popupContent = testInstance.findElements('.deck-widget-popup-content')[0] as HTMLDivElement;
  expect(popupContent.textContent).toContain('Opened from marker');

  testInstance.destroy();
});
