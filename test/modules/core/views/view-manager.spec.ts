import test from 'tape-promise/tape';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {OrbitController, OrbitView, MapController, MapView, Viewport} from 'deck.gl';

const INITIAL_VIEW_STATE = {latitude: 0, longitude: 0, zoom: 1};

test('ViewManager#imports', t => {
  t.ok(ViewManager, 'ViewManager import ok');
  t.end();
});

test('ViewManager#constructor', t => {
  const viewManager = new ViewManager({});
  t.ok(viewManager, 'Viewport created');
  t.end();
});

test('ViewManager#getViewports', t => {
  const viewManager = new ViewManager({});
  viewManager.setProps({
    views: [new MapView({height: '50%'}), new MapView({height: '50%', y: '50%'})],
    viewState: INITIAL_VIEW_STATE,
    width: 100,
    height: 100
  });

  let viewports = viewManager.getViewports();
  t.equals(viewports.length, 2, 'Correct number of viewports returned');
  t.ok(viewports[0] instanceof Viewport, 'Viewport 0 of corrrect type');
  t.ok(viewports[1] instanceof Viewport, 'Viewport 1 of corrrect type');

  t.equals(viewports[0].height, 50, 'viewport dimensions correct');
  t.equals(viewports[0].y, 0, 'viewport dimensions correct');
  t.equals(viewports[1].height, 50, 'viewport dimensions correct');
  t.equals(viewports[1].y, 50, 'viewport dimensions correct');

  viewports = viewManager.getViewports({x: 40, y: 40});
  t.is(viewports.length, 1, 'Correct number of viewports returned');
  t.is(viewports[0].y, 0, 'Correct viewport returned');

  viewports = viewManager.getViewports({x: 40, y: 40, width: 20, height: 20});
  t.is(viewports.length, 2, 'Correct number of viewports returned');

  viewports = viewManager.getViewports({x: -1, y: -1});
  t.is(viewports.length, 0, 'Correct number of viewports returned');

  t.end();
});

test('ViewManager#needsRedraw', t => {
  const viewManager = new ViewManager({});

  viewManager.getViewports();

  let redrawReason = viewManager.needsRedraw();
  t.equals(typeof redrawReason, 'string', 'Viewport needs redrawing');

  redrawReason = viewManager.needsRedraw({clearRedrawFlags: true});
  t.equals(typeof redrawReason, 'string', 'Viewport still needs redrawing');

  redrawReason = viewManager.needsRedraw();
  t.equals(redrawReason, false, 'Viewport redraw flag cleared');

  viewManager.setProps({
    views: [new MapView()],
    viewState: INITIAL_VIEW_STATE,
    width: 200,
    height: 200
  });

  viewManager.getViewports();

  redrawReason = viewManager.needsRedraw({clearRedrawFlags: true});
  t.equals(typeof redrawReason, 'string', 'Viewport needs redrawing again');

  t.end();
});

test('ViewManager#updateController', t => {
  const viewManager = new ViewManager({});

  const mapView = new MapView({id: 'test', height: '100%', controller: MapController});
  viewManager.setProps({
    views: [mapView],
    viewState: INITIAL_VIEW_STATE,
    width: 100,
    height: 100
  });

  const mapController = viewManager.controllers['test'];
  t.equals(mapController.constructor, MapController, 'Correct controller type');

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
  t.equals(orbitController.constructor, OrbitController, 'Correct controller type');

  t.end();
});
