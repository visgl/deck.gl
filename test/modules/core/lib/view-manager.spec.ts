// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import {MapView} from '@deck.gl/core';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {equals} from '@math.gl/core';

test('ViewManager#constructor', () => {
  const viewManager = new ViewManager({
    views: [new MapView({id: 'map'})],
    viewState: {longitude: -122, latitude: 38, zoom: 12},
    width: 100,
    height: 100
  });
  expect(viewManager, 'ViewManager is constructed').toBeTruthy();

  viewManager.finalize();
});

test('ViewManager#getView, getViewState, getViewport', () => {
  const mainView = new MapView({id: 'main'});
  const minimapView = new MapView({id: 'minimap', width: '10%', height: '10%', x: '5%', y: '5%'});

  const viewManager = new ViewManager({
    views: [mainView, minimapView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12,
      pitch: 30,
      minimap: {longitude: -122, latitude: 38, zoom: 8}
    },
    width: 100,
    height: 100
  });

  expect(viewManager.getViews(), 'returns view map').toEqual({
    main: mainView,
    minimap: minimapView
  });

  expect(viewManager.getView('main'), 'returns correct view').toBe(mainView);
  expect(viewManager.getView('minimap'), 'returns correct view').toBe(minimapView);

  expect(viewManager.getViewState('main').zoom, 'returns correct view state').toBe(12);
  expect(viewManager.getViewState('minimap').zoom, 'returns correct view state').toBe(8);

  expect(
    viewManager.getViewports().map(v => v.id),
    'returns all viewports'
  ).toEqual(['main', 'minimap']);
  expect(
    viewManager.getViewports({x: 10, y: 10}).map(v => v.id),
    'returns correct viewports'
  ).toEqual(['main', 'minimap']);
  expect(
    viewManager.getViewports({x: 50, y: 50}).map(v => v.id),
    'returns correct viewports'
  ).toEqual(['main']);

  expect(viewManager.getViewport('main').id, 'returns correct viewport').toBe('main');
  expect(viewManager.getViewport('minimap').id, 'returns correct viewport').toBe('minimap');

  viewManager.finalize();
});

test('ViewManager#unproject', () => {
  const mainView = new MapView({id: 'main'});
  const minimapView = new MapView({id: 'minimap', width: '10%', height: '10%', x: '5%', y: '5%'});

  const viewManager = new ViewManager({
    views: [mainView, minimapView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12,
      pitch: 30,
      minimap: {longitude: -122, latitude: 38, zoom: 8}
    },
    width: 100,
    height: 100
  });

  expect(equals(viewManager.unproject([50, 50]), [-122, 38]), 'viewManager.unproject').toBeTruthy();
  expect(equals(viewManager.unproject([10, 10]), [-122, 38]), 'viewManager.unproject').toBeTruthy();

  viewManager.finalize();
});

/* eslint-disable max-statements */
test('ViewManager#controllers', () => {
  const mainView = new MapView({id: 'main', controller: true});
  const mainViewDisabled = new MapView({id: 'main', controller: false});
  const minimapView = new MapView({
    id: 'minimap',
    width: '10%',
    height: '10%',
    x: '5%',
    y: '5%',
    controller: true
  });
  const minimapViewDisabled = new MapView({
    id: 'minimap',
    width: '10%',
    height: '10%',
    x: '5%',
    y: '5%',
    controller: false
  });

  const viewManager = new ViewManager({
    views: [mainViewDisabled, minimapView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12,
      pitch: 30,
      minimap: {longitude: -122, latitude: 38, zoom: 8}
    },
    width: 100,
    height: 100
  });

  expect(viewManager.controllers.main, 'main controller is disabled').toBeFalsy();
  expect(viewManager.controllers.minimap, 'minimap controller is constructed').toBeTruthy();

  const viewport = viewManager.controllers.minimap.makeViewport(
    viewManager.controllers.minimap.props
  );
  expect(
    viewport.viewProjectionMatrix.every(Number.isFinite),
    'makeViewport returns valid viewport'
  ).toBeTruthy();

  // Enable main controller
  let oldControllers = viewManager.controllers;
  viewManager.setProps({views: [mainView, minimapView]});
  expect(viewManager.controllers.main, 'main controller is constructed').toBeTruthy();
  expect(viewManager.controllers.minimap, 'minimap controller is persistent').toBe(
    oldControllers.minimap
  );

  // Update viewport dimensions
  oldControllers = viewManager.controllers;
  viewManager.setProps({width: 200, height: 100});
  expect(viewManager.controllers.main, 'main controller is persistent').toBe(oldControllers.main);
  expect(viewManager.controllers.minimap, 'minimap controller is persistent').toBe(
    oldControllers.minimap
  );

  // Disable minimap controller
  viewManager.setProps({views: [mainView, minimapViewDisabled]});
  expect(viewManager.controllers.main, 'main controller is persistent').toBe(oldControllers.main);
  expect(viewManager.controllers.minimap, 'minimap controller is removed').toBeFalsy();

  // Enable minimap controller
  viewManager.setProps({views: [mainView, minimapView]});
  expect(viewManager.controllers.main, 'main controller is invalidated').not.toBe(
    oldControllers.main
  );
  expect(viewManager.controllers.minimap, 'minimap controller is recreated').toBeTruthy();

  viewManager.finalize();
  expect(
    viewManager.controllers.main || viewManager.controllers.minimap,
    'controllers are deleted'
  ).toBeFalsy();
});

test('ViewManager#update view props', () => {
  let viewStateChangedEvent;

  const viewManager = new ViewManager({
    views: [new MapView({id: 'main', controller: true, width: '50%'})],
    onViewStateChange: evt => (viewStateChangedEvent = evt),
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 1
    },
    width: 100,
    height: 100
  });

  // Scroll at the viewport center
  viewManager.controllers.main.handleEvent(
    mockControllerEvent('wheel', 25, 50, {
      delta: 10
    })
  );

  expect(
    equals(viewStateChangedEvent.viewState.longitude, -122),
    'Map center is calculated correctly'
  ).toBeTruthy();

  viewManager.setProps({
    views: [new MapView({id: 'main', controller: true, width: '100%'})]
  });

  // Scroll at the viewport center
  viewManager.controllers.main.handleEvent(
    mockControllerEvent('wheel', 50, 50, {
      delta: 10
    })
  );

  expect(
    equals(viewStateChangedEvent.viewState.longitude, -122),
    'Map center is calculated correctly'
  ).toBeTruthy();

  viewManager.finalize();
});

/* eslint-disable max-statements */
test('ViewManager#zero-size', () => {
  const mainView = new MapView({id: 'main', controller: true});

  const viewManager = new ViewManager({
    views: [mainView],
    viewState: {
      longitude: -122,
      latitude: 38,
      zoom: 12
    },
    width: 100,
    height: 100
  });

  expect(viewManager.controllers.main, 'main controller is created').toBeTruthy();
  expect(viewManager.getViewports().length, 'viewport is created').toBe(1);

  viewManager.setProps({width: 0, height: 0});

  expect(viewManager.controllers.main, 'no valid controllers').toBeFalsy();
  expect(viewManager.getViewports().length, 'no valid viewports').toBe(0);
});

function mockControllerEvent(type, x, y, details) {
  return {
    type,
    offsetCenter: {x, y},
    ...details,
    stopPropagation: () => {},
    srcEvent: {
      preventDefault: () => {}
    }
  };
}
