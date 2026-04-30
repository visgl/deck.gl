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

test('InfoWidget#hover mode', async () => {
  const getTooltip = vi.fn().mockReturnValue({
    text: 'Hovered feature info',
    className: 'hover-tooltip'
  });
  const widget = new InfoWidget({
    mode: 'hover',
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
  widget.onHover({
    coordinate: [0, 0],
    object: {id: 2}
  } as any);
  widget.updateHTML();
  await testInstance.idle();

  expect(getTooltip).toHaveBeenCalledWith(
    expect.objectContaining({
      coordinate: [0, 0],
      object: {id: 2}
    }),
    widget
  );

  const popupContent = testInstance.findElements('.deck-widget-popup-content')[0] as HTMLDivElement;
  expect(popupContent).toBeTruthy();
  expect(popupContent.textContent).toContain('Hovered feature info');
  expect(popupContent.className).toContain('hover-tooltip');
});

test('InfoWidget#getTooltip', () => {
  const info = {coordinate: [1, 2], object: {id: 1}} as any;

  const widgetWithoutTooltip = new InfoWidget({mode: 'click'});
  expect((widgetWithoutTooltip as any)._getTooltip(info)).toBe(null);

  const getTooltip = vi.fn();
  const widget = new InfoWidget({
    mode: 'click',
    getTooltip
  });

  getTooltip.mockReturnValueOnce(null);
  expect((widget as any)._getTooltip(info)).toBe(null);

  getTooltip.mockReturnValueOnce(undefined);
  expect((widget as any)._getTooltip(info)).toBe(null);

  getTooltip.mockReturnValueOnce('plain text');
  expect((widget as any)._getTooltip(info)).toEqual({
    position: [1, 2],
    text: 'plain text',
    html: '',
    element: null,
    className: '',
    style: {}
  });

  const element = document.createElement('div');
  getTooltip.mockReturnValueOnce({
    text: 'custom text',
    html: '<b>html</b>',
    element,
    className: 'custom-tooltip',
    style: {color: 'red'},
    position: [3, 4]
  });
  expect((widget as any)._getTooltip(info)).toEqual({
    position: [3, 4],
    text: 'custom text',
    html: '<b>html</b>',
    element,
    className: 'custom-tooltip',
    style: {color: 'red'}
  });

  getTooltip.mockReturnValueOnce({text: 'missing position'});
  expect((widget as any)._getTooltip({object: {id: 2}})).toBe(null);
});
