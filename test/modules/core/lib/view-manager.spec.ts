// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';
import {MapView} from '@deck.gl/core';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {equals} from '@math.gl/core';

test('ViewManager#constructor', t => {
  const viewManager = new ViewManager({
    views: [new MapView({id: 'map'})],
    viewState: {longitude: -122, latitude: 38, zoom: 12},
    width: 100,
    height: 100
  });
  t.ok(viewManager, 'ViewManager is constructed');

  viewManager.finalize();

  t.end();
});

test('ViewManager#getView, getViewState, getViewport', t => {
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

  t.deepEqual(viewManager.getViews(), {main: mainView, minimap: minimapView}, 'returns view map');

  t.is(viewManager.getView('main'), mainView, 'returns correct view');
  t.is(viewManager.getView('minimap'), minimapView, 'returns correct view');

  t.is(viewManager.getViewState('main').zoom, 12, 'returns correct view state');
  t.is(viewManager.getViewState('minimap').zoom, 8, 'returns correct view state');

  t.deepEqual(
    viewManager.getViewports().map(v => v.id),
    ['main', 'minimap'],
    'returns all viewports'
  );
  t.deepEqual(
    viewManager.getViewports({x: 10, y: 10}).map(v => v.id),
    ['main', 'minimap'],
    'returns correct viewports'
  );
  t.deepEqual(
    viewManager.getViewports({x: 50, y: 50}).map(v => v.id),
    ['main'],
    'returns correct viewports'
  );

  t.is(viewManager.getViewport('main').id, 'main', 'returns correct viewport');
  t.is(viewManager.getViewport('minimap').id, 'minimap', 'returns correct viewport');

  viewManager.finalize();

  t.end();
});

test('ViewManager#unproject', t => {
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

  t.ok(equals(viewManager.unproject([50, 50]), [-122, 38]), 'viewManager.unproject');
  t.ok(equals(viewManager.unproject([10, 10]), [-122, 38]), 'viewManager.unproject');

  viewManager.finalize();

  t.end();
});

/* eslint-disable max-statements */
test('ViewManager#controllers', t => {
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

  t.notOk(viewManager.controllers.main, 'main controller is disabled');
  t.ok(viewManager.controllers.minimap, 'minimap controller is constructed');

  const viewport = viewManager.controllers.minimap.makeViewport(
    viewManager.controllers.minimap.props
  );
  t.ok(viewport.viewProjectionMatrix.every(Number.isFinite), 'makeViewport returns valid viewport');

  // Enable main controller
  let oldControllers = viewManager.controllers;
  viewManager.setProps({views: [mainView, minimapView]});
  t.ok(viewManager.controllers.main, 'main controller is constructed');
  t.is(viewManager.controllers.minimap, oldControllers.minimap, 'minimap controller is persistent');

  // Update viewport dimensions
  oldControllers = viewManager.controllers;
  viewManager.setProps({width: 200, height: 100});
  t.is(viewManager.controllers.main, oldControllers.main, 'main controller is persistent');
  t.is(viewManager.controllers.minimap, oldControllers.minimap, 'minimap controller is persistent');

  // Disable minimap controller
  viewManager.setProps({views: [mainView, minimapViewDisabled]});
  t.is(viewManager.controllers.main, oldControllers.main, 'main controller is persistent');
  t.notOk(viewManager.controllers.minimap, 'minimap controller is removed');

  // Enable minimap controller
  viewManager.setProps({views: [mainView, minimapView]});
  t.not(viewManager.controllers.main, oldControllers.main, 'main controller is invalidated');
  t.ok(viewManager.controllers.minimap, 'minimap controller is recreated');

  viewManager.finalize();
  t.notOk(
    viewManager.controllers.main || viewManager.controllers.minimap,
    'controllers are deleted'
  );

  t.end();
});

test('ViewManager#update view props', t => {
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

  t.ok(
    equals(viewStateChangedEvent.viewState.longitude, -122),
    'Map center is calculated correctly'
  );

  viewManager.setProps({
    views: [new MapView({id: 'main', controller: true, width: '100%'})]
  });

  // Scroll at the viewport center
  viewManager.controllers.main.handleEvent(
    mockControllerEvent('wheel', 50, 50, {
      delta: 10
    })
  );

  t.ok(
    equals(viewStateChangedEvent.viewState.longitude, -122),
    'Map center is calculated correctly'
  );

  viewManager.finalize();
  t.end();
});

/* eslint-disable max-statements */
test('ViewManager#zero-size', t => {
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

  t.ok(viewManager.controllers.main, 'main controller is created');
  t.is(viewManager.getViewports().length, 1, 'viewport is created');

  viewManager.setProps({width: 0, height: 0});

  t.notOk(viewManager.controllers.main, 'no valid controllers');
  t.is(viewManager.getViewports().length, 0, 'no valid viewports');

  t.end();
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
