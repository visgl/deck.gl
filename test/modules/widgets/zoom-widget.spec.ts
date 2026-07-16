// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {afterEach, test, expect, vi} from 'vitest';
import {OrthographicView, type MapViewState, type OrthographicViewState} from '@deck.gl/core';
import {ZoomWidget} from '@deck.gl/widgets';
import {WidgetTester} from './common';

let testInstance: WidgetTester<any> | undefined;

afterEach(() => {
  testInstance?.destroy();
  testInstance = undefined;
});

test('ZoomWidget', async () => {
  let viewState: MapViewState = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 8
  };
  const onZoom = vi.fn();
  testInstance = new WidgetTester({
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new ZoomWidget({onZoom})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-in');
  expect(viewState.zoom).toBe(9);
  expect(onZoom).toHaveBeenCalledWith({
    delta: 1,
    viewId: 'default-view',
    zoom: 9
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-out');
  expect(viewState.zoom).toBe(8);
});

test('ZoomWidget#zoomStep', async () => {
  let viewState: MapViewState = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 8
  };
  const onZoom = vi.fn();
  testInstance = new WidgetTester({
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new ZoomWidget({zoomStep: 0.5, onZoom})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-in');
  expect(viewState.zoom).toBe(8.5);
  expect(onZoom).toHaveBeenLastCalledWith({
    delta: 0.5,
    viewId: 'default-view',
    zoom: 8.5
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-out');
  expect(viewState.zoom).toBe(8);
  expect(onZoom).toHaveBeenLastCalledWith({
    delta: -0.5,
    viewId: 'default-view',
    zoom: 8
  });
});

test('ZoomWidget#constraints', async () => {
  let viewState: MapViewState = {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 8,
    maxZoom: 8.25,
    minZoom: 7.8
  };
  testInstance = new WidgetTester({
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new ZoomWidget({zoomStep: 0.5})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-in');
  expect(viewState.zoom).toBe(8.25);

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-out');
  expect(viewState.zoom).toBe(7.8);
});

test('ZoomWidget#zoomAxis', async () => {
  let viewState: OrthographicViewState = {
    target: [0, 0],
    zoom: [0, 2],
    maxZoomX: 0.5,
    minZoomY: 2
  };
  testInstance = new WidgetTester({
    views: new OrthographicView(),
    initialViewState: viewState,
    onViewStateChange: (evt: any) => {
      viewState = evt.viewState;
    },
    widgets: [new ZoomWidget({zoomStep: 0.5})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-in');
  expect(viewState.zoomX).toBe(0.5);
  expect(viewState.zoomY).toBe(2.5);

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-out');
  expect(viewState.zoomX).toBe(0);
  expect(viewState.zoomY).toBe(2);

  testInstance.setProps({
    widgets: [new ZoomWidget({zoomAxis: 'X'})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-in');
  expect(viewState.zoomX).toBe(0.5);
  expect(viewState.zoomY).toBe(2);

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-out');
  expect(viewState.zoomX).toBe(-0.5);
  expect(viewState.zoomY).toBe(2);

  testInstance.setProps({
    widgets: [new ZoomWidget({zoomAxis: 'Y'})]
  });

  await testInstance.idle();
  testInstance.click('.deck-widget-zoom-in');
  expect(viewState.zoomX).toBe(-0.5);
  expect(viewState.zoomY).toBe(3);
});
