// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {Timeline} from '@luma.gl/engine';
import TransitionManager, {TRANSITION_EVENTS} from '@deck.gl/core/controllers/transition-manager';
import {MapState} from '@deck.gl/core/controllers/map-controller';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {
  FlyToInterpolator,
  LinearInterpolator,
  MapView,
  WebMercatorViewport,
  _GlobeView as GlobeView
} from '@deck.gl/core';

const START = {width: 400, height: 300, longitude: -122.45, latitude: 37.78, zoom: 10};
const END = {longitude: -73.98, latitude: 40.75, zoom: 12, pitch: 0, bearing: 0};

function makeTransitionManager(timeline: Timeline) {
  return new TransitionManager({
    timeline,
    getControllerState: props =>
      new MapState({...props, makeViewport: p => new WebMercatorViewport(p)})
  });
}

test.each([
  ['LinearInterpolator', new LinearInterpolator(), 1000],
  ['FlyToInterpolator', new FlyToInterpolator(), 1000]
])('TransitionManager#getTransitionTarget with %s', (_, interpolator, duration) => {
  const timeline = new Timeline();
  const manager = makeTransitionManager(timeline);
  manager.processViewStateChange(START);
  expect(manager.getTransitionTarget(), 'no transition before a change').toBe(null);

  const nextProps = {
    ...START,
    ...END,
    transitionDuration: duration,
    transitionInterpolator: interpolator
  };
  expect(manager.processViewStateChange(nextProps), 'transition starts').toBe(true);

  const target = manager.getTransitionTarget()!;
  expect(target.viewState.longitude).toBeCloseTo(END.longitude, 6);
  expect(target.viewState.latitude).toBeCloseTo(END.latitude, 6);
  expect(target.viewState.zoom).toBeCloseTo(END.zoom, 6);
  expect(target.viewState.width, 'keeps the viewport size').toBe(START.width);
  expect(target.remainingTime, 'nothing elapsed').toBe(duration);

  // Controlled mode passes the interpolated view state back. The target stays the end.
  timeline.setTime(timeline.getTime() + 400);
  manager.updateTransition();
  manager.processViewStateChange({...nextProps, ...manager.getViewportInTransition()});
  const midTarget = manager.getTransitionTarget()!;
  expect(midTarget.viewState.longitude).toBeCloseTo(END.longitude, 6);
  expect(midTarget.viewState.zoom).toBeCloseTo(END.zoom, 6);
  expect(midTarget.remainingTime).toBe(duration - 400);

  timeline.setTime(timeline.getTime() + 600);
  manager.updateTransition();
  expect(manager.getTransitionTarget(), 'null after the end').toBe(null);
});

test('TransitionManager#getTransitionTarget on interruption', () => {
  const timeline = new Timeline();
  const manager = makeTransitionManager(timeline);
  manager.processViewStateChange(START);
  const interpolator = new LinearInterpolator();
  manager.processViewStateChange({
    ...START,
    ...END,
    transitionDuration: 1000,
    transitionInterpolator: interpolator
  });
  timeline.setTime(timeline.getTime() + 500);
  manager.updateTransition();

  // BREAK: a new transition replaces the destination and the duration.
  manager.processViewStateChange({
    ...START,
    longitude: 2.35,
    latitude: 48.85,
    zoom: 9,
    transitionDuration: 300,
    transitionInterpolator: interpolator
  });
  const target = manager.getTransitionTarget()!;
  expect(target.viewState.longitude).toBeCloseTo(2.35, 6);
  expect(target.viewState.zoom).toBeCloseTo(9, 6);
  expect(target.remainingTime).toBe(300);

  // A change without a transition (for example a drag) cancels the transition.
  manager.processViewStateChange({...START, longitude: 3});
  expect(manager.getTransitionTarget(), 'null after cancel').toBe(null);
});

test('TransitionManager#getTransitionTarget with SNAP_TO_END interruption', () => {
  const timeline = new Timeline();
  const manager = makeTransitionManager(timeline);
  manager.processViewStateChange(START);
  const transition = {
    transitionDuration: 1000,
    transitionInterpolator: new LinearInterpolator(),
    transitionInterruption: TRANSITION_EVENTS.SNAP_TO_END
  };
  manager.processViewStateChange({...START, ...END, ...transition});
  manager.processViewStateChange({...START, longitude: 0, latitude: 0, zoom: 5, ...transition});
  const target = manager.getTransitionTarget()!;
  expect(target.viewState.longitude).toBeCloseTo(0, 6);
  expect(target.viewState.zoom).toBeCloseTo(5, 6);
});

test('ViewManager#getTransitionTarget per view', () => {
  const timeline = new Timeline();
  const views = [
    new MapView({id: 'main', controller: true}),
    new GlobeView({id: 'globe', x: '50%', width: '50%', controller: true}),
    new MapView({id: 'static', controller: false})
  ];
  const viewState = {
    main: {longitude: -122.45, latitude: 37.78, zoom: 10},
    globe: {longitude: 0, latitude: 0, zoom: 1},
    static: {longitude: 0, latitude: 0, zoom: 1}
  };
  const viewManager = new ViewManager({timeline, views, viewState, width: 800, height: 600});
  viewManager.updateViewports();
  expect(viewManager.getTransitionTarget('main')).toBe(null);

  viewManager.setProps({
    viewState: {
      ...viewState,
      globe: {
        longitude: 30,
        latitude: 20,
        zoom: 2,
        transitionDuration: 500,
        transitionInterpolator: new FlyToInterpolator()
      }
    }
  });
  viewManager.updateViewports();

  expect(viewManager.getTransitionTarget('main'), 'other view does not move').toBe(null);
  expect(viewManager.getTransitionTarget('static'), 'no controller').toBe(null);
  expect(viewManager.getTransitionTarget('missing'), 'unknown view').toBe(null);

  const target = viewManager.getTransitionTarget('globe')!;
  expect(target.remainingTime).toBe(500);
  expect(target.viewport.id).toBe('globe');
  expect(target.viewport.constructor.name).toBe('GlobeViewport');
  expect(target.viewport.width, 'view width').toBe(400);
  expect(target.viewport.longitude).toBeCloseTo(30, 6);
  expect(target.viewport.latitude).toBeCloseTo(20, 6);
  expect(target.viewport.zoom).toBeCloseTo(2, 6);

  viewManager.finalize();
});
