// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {type MapViewState} from '@deck.gl/core';
import {CompassWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('CompassWidget', async () => {
  let viewState: MapViewState = {
    longitude: 0,
    latitude: 0,
    zoom: 1,
    bearing: -120,
    pitch: 45
  };
  const onReset = vi.fn();
  testInstance = new WidgetTester({
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new CompassWidget({id: 'compass', onReset})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-button > button');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'default-view',
    bearing: 0,
    pitch: 45
  });
  expect(viewState.bearing).toBe(0);

  await testInstance.idle();
  testInstance.click('.deck-widget-button > button');
  expect(onReset).toHaveBeenCalledWith({
    viewId: 'default-view',
    bearing: 0,
    pitch: 0
  });
  expect(viewState.pitch).toBe(0);
});
