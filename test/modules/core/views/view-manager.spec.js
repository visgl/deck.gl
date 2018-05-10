import test from 'tape-catch';
import ViewManager from 'deck.gl/core/views/view-manager';
import {MapView, Viewport} from 'deck.gl';

const INITIAL_VIEW_STATE = {latitude: 0, longitude: 0, zoom: 1};

test('ViewManager#imports', t => {
  t.ok(ViewManager, 'ViewManager import ok');
  t.end();
});

test('ViewManager#constructor', t => {
  const viewManager = new ViewManager();
  t.ok(viewManager, 'Viewport created');
  t.end();
});

test('ViewManager#getViewports', t => {
  const viewManager = new ViewManager();
  viewManager.setProps({
    views: [new MapView({height: '50%'}), new MapView({height: '50%', y: '50%'})],
    viewState: INITIAL_VIEW_STATE,
    width: 100,
    height: 100
  });

  const viewports = viewManager.getViewports();
  t.equals(viewports.length, 2, 'Correct number of viewports returned');
  t.ok(viewports[0] instanceof Viewport, 'Viewport 0 of corrrect type');
  t.ok(viewports[1] instanceof Viewport, 'Viewport 1 of corrrect type');

  t.equals(viewports[0].height, 50, 'viewport dimensions correct');
  t.equals(viewports[0].y, 0, 'viewport dimensions correct');
  t.equals(viewports[1].height, 50, 'viewport dimensions correct');
  t.equals(viewports[1].y, 50, 'viewport dimensions correct');

  t.end();
});

test('ViewManager#needsRedraw', t => {
  const viewManager = new ViewManager();

  viewManager.getViewports();

  let redrawReason = viewManager.needsRedraw({clearRedrawFlags: false});
  t.equals(typeof redrawReason, 'string', 'Viewport needs redrawing');

  redrawReason = viewManager.needsRedraw();
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
