// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect} from 'vitest';
import {_ScaleWidget as ScaleWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ScaleWidget.scaleText at different zoom levels', async () => {
  const widget = new ScaleWidget();
  testInstance = new WidgetTester({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 10
    },
    widgets: [widget]
  });

  await testInstance.idle();

  let label = testInstance.findElements('.deck-widget-scale text')[0] as SVGTextElement;
  expect(widget.scaleText).toBe('20.0 km');
  expect(label.textContent).toBe('20.0 km');

  testInstance.setProps({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 15
    }
  });
  await testInstance.idle();

  label = testInstance.findElements('.deck-widget-scale text')[0] as SVGTextElement;
  expect(widget.scaleText).toBe('500 m');
  expect(label.textContent).toBe('500 m');

  testInstance.setProps({
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 18
    }
  });
  await testInstance.idle();

  label = testInstance.findElements('.deck-widget-scale text')[0] as SVGTextElement;
  expect(widget.scaleText).toBe('100 m');
  expect(label.textContent).toBe('100 m');
});
