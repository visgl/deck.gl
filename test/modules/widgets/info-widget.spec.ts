// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {InfoWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('InfoWidget', async () => {
  const getTooltip = vi.fn().mockReturnValue({
    text: 'Picked feature info',
    className: 'custom-tooltip'
  });
  const widget = new InfoWidget({
    mode: 'click',
    getTooltip
  });
  testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    widgets: [widget]
  });

  await testInstance.idle();
  widget.onClick({
    coordinate: [0, 0],
    object: {id: 1}
  } as any);
  widget.updateHTML();
  await testInstance.idle();

  expect(getTooltip).toHaveBeenCalledWith(
    expect.objectContaining({
      coordinate: [0, 0],
      object: {id: 1}
    }),
    widget
  );

  const popupContent = testInstance.findElements('.deck-widget-popup-content')[0] as HTMLDivElement;
  expect(popupContent).toBeTruthy();
  expect(popupContent.textContent).toContain('Picked feature info');
  expect(popupContent.className).toContain('custom-tooltip');
});
