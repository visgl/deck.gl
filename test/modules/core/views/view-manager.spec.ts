// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, describe} from 'vitest';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {OrbitController, OrbitView, MapController, MapView, Viewport} from 'deck.gl';

const INITIAL_VIEW_STATE = {latitude: 0, longitude: 0, zoom: 1};

test('ViewManager#imports', () => {
  expect(ViewManager, 'ViewManager import ok').toBeTruthy();
});

test('ViewManager#constructor', () => {
  const viewManager = new ViewManager({});
  expect(viewManager, 'Viewport created').toBeTruthy();
});

test('ViewManager#getViewports', () => {
  const viewManager = new ViewManager({});
  viewManager.setProps({
    views: [new MapView({height: '50%'}), new MapView({height: '50%', y: '50%'})],
    viewState: INITIAL_VIEW_STATE,
    width: 100,
    height: 100
  });

  let viewports = viewManager.getViewports();
  expect(viewports.length, 'Correct number of viewports returned').toBe(2);
  expect(viewports[0] instanceof Viewport, 'Viewport 0 of corrrect type').toBeTruthy();
  expect(viewports[1] instanceof Viewport, 'Viewport 1 of corrrect type').toBeTruthy();

  expect(viewports[0].height, 'viewport dimensions correct').toBe(50);
  expect(viewports[0].y, 'viewport dimensions correct').toBe(0);
  expect(viewports[1].height, 'viewport dimensions correct').toBe(50);
  expect(viewports[1].y, 'viewport dimensions correct').toBe(50);

  viewports = viewManager.getViewports({x: 40, y: 40});
  expect(viewports.length, 'Correct number of viewports returned').toBe(1);
  expect(viewports[0].y, 'Correct viewport returned').toBe(0);

  viewports = viewManager.getViewports({x: 40, y: 40, width: 20, height: 20});
  expect(viewports.length, 'Correct number of viewports returned').toBe(2);

  viewports = viewManager.getViewports({x: -1, y: -1});
  expect(viewports.length, 'Correct number of viewports returned').toBe(0);
});

test('ViewManager#needsRedraw', () => {
  const viewManager = new ViewManager({});

  viewManager.getViewports();

  let redrawReason = viewManager.needsRedraw();
  expect(typeof redrawReason, 'Viewport needs redrawing').toBe('string');

  redrawReason = viewManager.needsRedraw({clearRedrawFlags: true});
  expect(typeof redrawReason, 'Viewport still needs redrawing').toBe('string');

  redrawReason = viewManager.needsRedraw();
  expect(redrawReason, 'Viewport redraw flag cleared').toBe(false);

  viewManager.setProps({
    views: [new MapView()],
    viewState: INITIAL_VIEW_STATE,
    width: 200,
    height: 200
  });

  viewManager.getViewports();

  redrawReason = viewManager.needsRedraw({clearRedrawFlags: true});
  expect(typeof redrawReason, 'Viewport needs redrawing again').toBe('string');
});

test('ViewManager#updateController', () => {
  const viewManager = new ViewManager({});

  const mapView = new MapView({id: 'test', height: '100%', controller: MapController});
  viewManager.setProps({
    views: [mapView],
    viewState: INITIAL_VIEW_STATE,
    width: 100,
    height: 100
  });

  const mapController = viewManager.controllers['test'];
  expect(mapController.constructor, 'Correct controller type').toBe(MapController);

  // Replace the MapView with a new OrbitView, given the same id.
  const orbitView = new OrbitView({id: 'test', height: '100%', controller: OrbitController});
  viewManager.setProps({
    views: [orbitView],
    viewState: INITIAL_VIEW_STATE,
    width: 100,
    height: 100
  });

  // Verify that the new view has the correct controller.
  const orbitController = viewManager.controllers['test'];
  expect(orbitController.constructor, 'Correct controller type').toBe(OrbitController);
});
