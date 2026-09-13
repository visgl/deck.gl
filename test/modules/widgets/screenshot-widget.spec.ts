// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {ScatterplotLayer} from '@deck.gl/layers';
import {ScreenshotWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ScreenshotWidget', async () => {
  const widget = new ScreenshotWidget({filename: 'test.png'});

  let dataUrl: string | undefined;
  let fileName: string | undefined;
  const spy = vi.spyOn(widget, 'downloadDataURL');
  spy.mockImplementation((_dataUrl: string, _fileName: string) => {
    dataUrl = _dataUrl;
    fileName = _fileName;
  });
  testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    },
    layers: [
      new ScatterplotLayer({
        data: [0],
        getPosition: d => [0, 0],
        getRadius: 20,
        radiusUnits: 'pixels',
        getFillColor: [255, 0, 0]
      })
    ],
    widgets: [widget]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-camera');
  expect(spy).toHaveBeenCalledOnce();
  expect(dataUrl).toContain('data:');
  expect(fileName).toBe('test.png');
});

test('ScreenshotWidget#custom callback', async () => {
  const onCapture = vi.fn();
  testInstance = new WidgetTester({
    widgets: [new ScreenshotWidget({onCapture})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-camera');
  expect(onCapture).toHaveBeenCalledOnce();
});
