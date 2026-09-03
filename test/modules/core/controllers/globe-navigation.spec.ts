// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  _GlobeController as GlobeController,
  _GlobeView as GlobeView,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import ViewManager from '@deck.gl/core/lib/view-manager';
import {Timeline} from '@luma.gl/engine';
import {createTestController} from './test-controller';

const INITIAL_VIEW_STATE = {
  width: 800,
  height: 600,
  longitude: 0,
  latitude: 75,
  zoom: 0,
  bearing: 0
};

const makePanEvent = (type: string, x = 400, y = 300) => ({
  type,
  pointerType: 'mouse',
  offsetCenter: {x, y},
  velocity: 0,
  velocityX: 0,
  velocityY: 0,
  srcEvent: {},
  stopPropagation() {}
});

const makeWheelEvent = () => ({
  type: 'wheel',
  pointerType: 'mouse',
  offsetCenter: {x: 550, y: 150},
  delta: -60,
  srcEvent: {preventDefault() {}},
  stopPropagation() {}
});

const makeViewport = props => new GlobeViewport(props);
const GlobeState = new GlobeController({} as any).ControllerState;

test.each([0, 45, 360, 405])(
  'GlobeController defaults to map navigation at bearing %s',
  bearing => {
    const makeController = controller =>
      createTestController({
        view: new GlobeView({controller}),
        initialViewState: {...INITIAL_VIEW_STATE, bearing}
      });
    const defaultController = makeController(true);
    const mapController = makeController({navigation: 'map'});
    const ballController = makeController({navigation: 'ball'});

    for (const controller of [defaultController, mapController, ballController]) {
      controller.handleEvent(makePanEvent('panstart'));
      controller.handleEvent(makePanEvent('panmove', 500, 350));
      controller.handleEvent(makePanEvent('panend', 500, 350));
    }

    const normalizedBearing = ((bearing + 180) % 360) - 180;
    expect(defaultController.props.bearing, 'default navigation preserves bearing').toBeCloseTo(
      normalizedBearing
    );
    for (const property of ['longitude', 'latitude', 'bearing', 'zoom']) {
      expect(defaultController.props[property], `default ${property} matches map mode`).toBeCloseTo(
        mapController.props[property]
      );
    }
    expect(ballController.props.bearing, 'ball mode is not inferred from bearing').not.toBeCloseTo(
      normalizedBearing
    );
  }
);

test.each([-1, 1])('GlobeController map drag stops before pole %s', direction => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'map'}}),
    initialViewState: {...INITIAL_VIEW_STATE, latitude: direction * 80}
  });
  controller.handleEvent(makePanEvent('panstart'));
  let previousLatitude = Math.abs(controller.props.latitude);
  for (let index = 1; index <= 20; index++) {
    controller.handleEvent(makePanEvent('panmove', 400, 300 + direction * index * 10));
    expect(
      Math.abs(controller.props.latitude),
      'drag approaches the pole without reversing'
    ).toBeGreaterThanOrEqual(previousLatitude);
    expect(
      Math.abs(controller.props.latitude),
      'map navigation does not reach the singularity'
    ).toBeLessThan(90);
    expect(controller.props.longitude, 'map navigation does not cross hemispheres').toBeCloseTo(0);
    expect(controller.props.bearing, 'map navigation stays north-up').toBeCloseTo(0);
    previousLatitude = Math.abs(controller.props.latitude);
  }
  expect(previousLatitude, 'drag moved toward the pole').toBeGreaterThan(80);
});

test.each([-1, 1])(
  'GlobeController ball drag crosses pole %s with equivalent north-up bearing',
  direction => {
    const controller = createTestController({
      view: new GlobeView({controller: {navigation: 'ball'}}),
      initialViewState: {...INITIAL_VIEW_STATE, latitude: direction * 80, bearing: 360}
    });
    controller.handleEvent(makePanEvent('panstart'));
    for (let index = 1; index <= 15; index++) {
      controller.handleEvent(makePanEvent('panmove', 400, 300 + direction * index * 10));
      expect(Number.isFinite(controller.props.zoom), 'pole crossing keeps a finite zoom').toBe(
        true
      );
    }
    expect(Math.abs(controller.props.longitude), 'ball crosses hemispheres').toBeCloseTo(180);
    expect(Math.abs(controller.props.bearing), 'ball keeps rotating its camera frame').toBeCloseTo(
      180
    );
  }
);

test.each(['map', 'ball'] as const)(
  'GlobeState preserves %s navigation through reconstruction',
  navigation => {
    const initialState = new GlobeState({
      ...INITIAL_VIEW_STATE,
      navigation,
      bearing: 45,
      makeViewport
    });
    const startedState = initialState.panStart({pos: [400, 300]});
    const reconstructedState = new GlobeState({
      ...startedState.getViewportProps(),
      ...startedState.getState(),
      makeViewport
    });
    const movedState = reconstructedState.pan({pos: [480, 340]}).panEnd();
    const movedProps = movedState.getViewportProps();
    if (navigation === 'map') {
      expect(movedProps.bearing, 'reconstructed map drag preserves configured bearing').toBeCloseTo(
        45
      );
    } else {
      expect(movedProps.bearing, 'reconstructed ball drag keeps the rigid frame').not.toBeCloseTo(
        45
      );
    }
    const nextState = new GlobeState({
      ...movedProps,
      ...movedState.getState(),
      makeViewport
    }).moveLeft();
    if (navigation === 'map') {
      expect(nextState.getViewportProps().bearing, 'keyboard state remains map mode').toBeCloseTo(
        45
      );
    } else {
      expect(
        nextState.getViewportProps().bearing,
        'keyboard state remains ball mode'
      ).not.toBeCloseTo(movedProps.bearing);
    }
  }
);

test.each([-80, 80])(
  'GlobeController map pointer zoom preserves bearing at latitude %s',
  latitude => {
    const makeController = (zoomAround: 'center' | 'pointer') =>
      createTestController({
        view: new GlobeView({controller: {navigation: 'map', zoomAround}}),
        initialViewState: {...INITIAL_VIEW_STATE, latitude, zoom: 5, bearing: 397}
      });
    const centerController = makeController('center');
    const pointerController = makeController('pointer');
    const wheelEvent = makeWheelEvent();
    wheelEvent.offsetCenter.y = latitude > 0 ? 100 : 500;
    for (let index = 0; index < 16; index++) {
      centerController.handleEvent(wheelEvent);
      pointerController.handleEvent(wheelEvent);
      expect(
        pointerController.props.bearing,
        'pointer steering preserves configured bearing'
      ).toBeCloseTo(37);
      expect(
        Math.abs(pointerController.props.latitude),
        'pointer zoom cannot cross a pole'
      ).toBeLessThan(90);
      expect(
        centerController.props.bearing,
        'center zoom preserves configured bearing'
      ).toBeCloseTo(37);
      expect(centerController.props.latitude, 'center zoom preserves latitude').toBeCloseTo(
        latitude
      );
      expect(centerController.props.longitude, 'center zoom preserves longitude').toBeCloseTo(0);
    }
    expect(
      pointerController.props.longitude,
      'map pointer zoom still steers toward its anchor'
    ).not.toBeCloseTo(0);
  }
);

test('GlobeController map smooth zoom preserves bearing in every transition frame', () => {
  const controller = createTestController({
    view: new GlobeView({
      controller: {navigation: 'map', zoomAround: 'pointer', scrollZoom: {smooth: true}}
    }),
    initialViewState: {...INITIAL_VIEW_STATE, zoom: 5, bearing: 35}
  });
  controller.handleEvent(makeWheelEvent());
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'smooth wheel starts a transition').toBe(true);
  const startTime = transition._timeline.getTime();
  for (let elapsed = 16; elapsed <= 304; elapsed += 16) {
    transition._timeline.setTime(startTime + elapsed);
    controller.updateTransition();
    expect(controller.props.bearing, 'smooth map zoom preserves bearing throughout').toBeCloseTo(
      35
    );
    expect(
      Math.abs(controller.props.latitude),
      'smooth map zoom remains inside poles'
    ).toBeLessThan(90);
  }
});

test.each([-80, 80])('GlobeController map pinch preserves bearing near latitude %s', latitude => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'map', zoomAround: 'pointer'}}),
    initialViewState: {...INITIAL_VIEW_STATE, latitude, zoom: 5, bearing: 35}
  });
  const makePinchEvent = (type: string, scale: number) => ({
    ...makePanEvent(type, 550, latitude > 0 ? 100 : 500),
    pointerType: 'touch',
    scale,
    rotation: 0,
    deltaTime: type === 'pinchstart' ? 0 : 16
  });
  controller.handleEvent(makePinchEvent('pinchstart', 1));
  for (let index = 1; index <= 16; index++) {
    controller.handleEvent(makePinchEvent('pinchmove', Math.pow(0.85, index)));
    expect(controller.props.bearing, 'continuous pinch preserves map bearing').toBeCloseTo(35);
    expect(
      Math.abs(controller.props.latitude),
      'continuous map pinch remains inside poles'
    ).toBeLessThan(90);
    expect(Number.isFinite(controller.props.zoom), 'continuous map pinch keeps finite zoom').toBe(
      true
    );
  }
  controller.handleEvent(makePinchEvent('pinchend', Math.pow(0.85, 16)));
});

test.each([
  {latitude: 75, bearing: 90, pos: [480, 360] as [number, number]},
  {latitude: 80, bearing: 1, pos: [640, 120] as [number, number]}
])(
  'GlobeState map pinch keeps its anchor continuous at bearing $bearing',
  ({latitude, bearing, pos}) => {
    let state = new GlobeState({
      ...INITIAL_VIEW_STATE,
      width: 1280,
      height: 720,
      navigation: 'map',
      latitude,
      bearing,
      zoom: 2,
      makeViewport
    }).zoomStart({pos});
    let previousProps = state.getViewportProps();
    for (let index = 1; index <= 10; index++) {
      state = state.zoom({pos, scale: Math.pow(0.85, index)});
      const props = state.getViewportProps();
      const longitudeDelta = ((props.longitude - previousProps.longitude + 540) % 360) - 180;
      expect(
        Math.abs(longitudeDelta),
        'a small pinch step does not jump across hemispheres'
      ).toBeLessThan(60);
      expect(
        Math.abs(props.latitude - previousProps.latitude),
        'latitude changes continuously'
      ).toBeLessThan(15);
      expect(props.bearing, 'anchor steering preserves the chosen bearing').toBeCloseTo(bearing);
      previousProps = props;
    }
  }
);

test.each(['map', 'ball'] as const)(
  'GlobeController %s pointer zoom supports the high-zoom viewport',
  navigation => {
    const view = new GlobeView({controller: {navigation, zoomAround: 'pointer'}});
    const controller = createTestController({
      view,
      initialViewState: {...INITIAL_VIEW_STATE, latitude: 45, zoom: 14, bearing: 35}
    });
    expect(
      view.makeViewport({width: 800, height: 600, viewState: controller.props}),
      'high zoom uses the flat viewport'
    ).not.toBeInstanceOf(GlobeViewport);
    expect(
      () => controller.handleEvent(makeWheelEvent()),
      'high-zoom pointer zoom is supported'
    ).not.toThrow();
    expect(controller.props.zoom, 'wheel changes zoom').not.toBeCloseTo(14);
    expect(controller.props.longitude, 'pointer zoom still anchors away from center').not.toBe(0);
    expect(controller.props.bearing, 'flat pointer zoom preserves bearing').toBeCloseTo(35);
  }
);

test.each([true, {inertia: true}] as const)(
  'GlobeView restores map navigation when ball is removed from controller %j',
  nextController => {
    const viewManager = new ViewManager({
      views: [new GlobeView({id: 'globe', controller: {navigation: 'ball'}})],
      viewState: {...INITIAL_VIEW_STATE, bearing: 45},
      width: 800,
      height: 600,
      timeline: new Timeline(),
      eventManager: null,
      onViewStateChange: ({viewState}) => viewManager.setProps({viewState})
    });
    const controller = viewManager.controllers.globe!;
    const drag = () => {
      controller.handleEvent(makePanEvent('panstart') as any);
      controller.handleEvent(makePanEvent('panmove', 480, 340) as any);
      controller.handleEvent(makePanEvent('panend', 480, 340) as any);
    };
    drag();
    const bearing = controller.props.bearing;
    expect(bearing, 'the original ball gesture changes bearing').not.toBeCloseTo(45);
    viewManager.setProps({
      views: [new GlobeView({id: 'globe', controller: nextController})]
    });
    expect(viewManager.controllers.globe, 'the view manager keeps the existing controller').toBe(
      controller
    );
    drag();
    expect(
      controller.props.bearing,
      'omitting navigation restores map policy despite saved ball state'
    ).toBeCloseTo(bearing);
    viewManager.finalize();
  }
);

test('GlobeController map navigation permits explicit drag rotation', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'map', dragMode: 'rotate', dragRotate: true}}),
    initialViewState: {...INITIAL_VIEW_STATE, bearing: 35}
  });
  controller.handleEvent(makePanEvent('panstart'));
  controller.handleEvent(makePanEvent('panmove', 480, 300));
  controller.handleEvent(makePanEvent('panend', 480, 300));
  expect(controller.props.bearing, 'explicit rotate gesture changes map bearing').not.toBeCloseTo(
    35
  );
});

test.each([-75, 75])('GlobeController map inertia preserves bearing at latitude %s', latitude => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'map', inertia: 600}}),
    initialViewState: {...INITIAL_VIEW_STATE, latitude, bearing: 35}
  });
  const direction = Math.sign(latitude);
  controller.handleEvent(makePanEvent('panstart'));
  for (let index = 1; index <= 5; index++) {
    controller.handleEvent(makePanEvent('panmove', 400 + index * 10, 300 + direction * index * 10));
  }
  controller._panHistory.forEach((sample, index) => {
    sample.timestamp = index * 16;
  });
  controller.handleEvent({
    ...makePanEvent('panend', 450, 300 + direction * 50),
    velocity: Math.SQRT2,
    velocityX: 1,
    velocityY: direction
  });
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'release starts inertial movement').toBe(true);
  const startTime = transition._timeline.getTime();
  for (let elapsed = 16; elapsed <= 608; elapsed += 16) {
    transition._timeline.setTime(startTime + elapsed);
    controller.updateTransition();
    expect(controller.props.bearing, 'each map inertia frame preserves bearing').toBeCloseTo(35);
    expect(Math.abs(controller.props.latitude), 'map inertia stays inside poles').toBeLessThan(90);
    expect(Number.isFinite(controller.props.longitude), 'inertia longitude remains finite').toBe(
      true
    );
  }
});

test.each([-75, 75])('GlobeController ball inertia crosses a pole from latitude %s', latitude => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'ball', inertia: 600}}),
    initialViewState: {...INITIAL_VIEW_STATE, latitude}
  });
  const direction = Math.sign(latitude);
  controller.handleEvent(makePanEvent('panstart'));
  for (let index = 1; index <= 5; index++) {
    controller.handleEvent(makePanEvent('panmove', 400, 300 + direction * index * 10));
  }
  expect(controller.props.bearing, 'drag has not crossed the pole at release').toBeCloseTo(0);
  controller._panHistory.forEach((sample, index) => {
    sample.timestamp = index * 16;
  });
  controller.handleEvent(makePanEvent('panend', 400, 300 + direction * 50));
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'release starts ball inertia').toBe(true);
  const startTime = transition._timeline.getTime();
  for (let elapsed = 16; elapsed <= 608; elapsed += 16) {
    transition._timeline.setTime(startTime + elapsed);
    controller.updateTransition();
    for (const property of ['longitude', 'latitude', 'bearing', 'zoom']) {
      expect(Number.isFinite(controller.props[property]), `inertia ${property} stays finite`).toBe(
        true
      );
    }
  }
  expect(Math.abs(controller.props.longitude), 'ball inertia crosses hemispheres').toBeCloseTo(180);
  expect(Math.abs(controller.props.bearing), 'ball inertia rotates its up vector').toBeCloseTo(180);
});

test('GlobeController map keyboard movement preserves bearing and explicit rotation changes it', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'map'}}),
    initialViewState: {...INITIAL_VIEW_STATE, bearing: 45}
  });
  const pressKey = (code: string, shiftKey = false) => {
    controller.handleEvent({type: 'keydown', srcEvent: {code, shiftKey}});
    const timeline = controller.transitionManager.transition._timeline;
    timeline.setTime(timeline.getTime() + 300);
    controller.updateTransition();
  };
  for (const code of ['ArrowUp', 'ArrowLeft', 'ArrowDown', 'ArrowRight', 'Minus', 'Equal']) {
    pressKey(code);
    expect(controller.props.bearing, `${code} preserves bearing in map mode`).toBeCloseTo(45);
  }
  pressKey('ArrowRight', true);
  expect(controller.props.bearing, 'explicit keyboard rotation changes map bearing').toBeCloseTo(
    60
  );
  pressKey('ArrowUp');
  expect(
    controller.props.bearing,
    'navigation preserves the deliberately rotated bearing'
  ).toBeCloseTo(60);
});

test('GlobeController applies navigation changes without recreating the view', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {navigation: 'map'}}),
    initialViewState: {...INITIAL_VIEW_STATE, bearing: 45}
  });
  const drag = () => {
    controller.handleEvent(makePanEvent('panstart'));
    controller.handleEvent(makePanEvent('panmove', 480, 340));
    controller.handleEvent(makePanEvent('panend', 480, 340));
  };
  drag();
  expect(controller.props.bearing, 'initial map drag preserves bearing').toBeCloseTo(45);
  controller.setProps({...controller.props, navigation: 'ball'});
  drag();
  expect(controller.props.bearing, 'updated ball mode rotates the frame').not.toBeCloseTo(45);
  const ballBearing = controller.props.bearing;
  controller.setProps({...controller.props, navigation: 'map'});
  drag();
  expect(controller.props.bearing, 'updated map mode preserves the current bearing').toBeCloseTo(
    ballBearing
  );
});

test('GlobeController switching navigation stops the previous transition', () => {
  const controller = createTestController({
    view: new GlobeView({
      controller: {navigation: 'ball', zoomAround: 'pointer', scrollZoom: {smooth: true}}
    }),
    initialViewState: {...INITIAL_VIEW_STATE, zoom: 5, bearing: 35}
  });
  controller.handleEvent(makeWheelEvent());
  const transition = controller.transitionManager.transition;
  expect(transition.inProgress, 'ball zoom starts a transition').toBe(true);
  controller.setProps({...controller.props, navigation: 'map'});
  expect(transition.inProgress, 'navigation change cancels the old transition').toBe(false);
  const bearing = controller.props.bearing;
  controller.handleEvent(makePanEvent('panstart'));
  controller.handleEvent(makePanEvent('panmove', 480, 340));
  expect(controller.props.bearing, 'the next gesture uses map navigation').toBeCloseTo(bearing);
});

test.each([
  {navigation: 'map', gesture: 'pinch'},
  {navigation: 'ball', gesture: 'pinch'},
  {navigation: 'map', gesture: 'dblclickdrag'},
  {navigation: 'ball', gesture: 'dblclickdrag'}
] as const)(
  'GlobeController changing from $navigation navigation cancels an active $gesture',
  ({navigation, gesture}) => {
    const controller = createTestController({
      view: new GlobeView({
        controller: {navigation, zoomAround: 'center', doubleClickDragZoom: true}
      }),
      initialViewState: {...INITIAL_VIEW_STATE, latitude: 45, zoom: 5, bearing: 35}
    });
    const makeZoomEvent = (phase: 'start' | 'move' | 'end', scale: number) => ({
      ...makePanEvent(`${gesture}${phase}`),
      pointerType: 'touch',
      scale,
      rotation: 0,
      deltaTime: phase === 'start' ? 0 : 16
    });
    controller.handleEvent(makeZoomEvent('start', 1));
    controller.handleEvent(makeZoomEvent('move', 1.2));
    controller.setProps({
      ...controller.props,
      navigation: navigation === 'map' ? 'ball' : 'map'
    });
    const zoom = controller.props.zoom;
    controller.handleEvent(makeZoomEvent('move', 1.2));
    expect(controller.props.zoom, 'stale cumulative zoom scale is not reapplied').toBeCloseTo(zoom);
    controller.handleEvent(makeZoomEvent('end', 1.2));
    controller.handleEvent(makeZoomEvent('start', 1));
    controller.handleEvent(makeZoomEvent('move', 1.2));
    expect(
      controller.props.zoom,
      'a new gesture works in the selected navigation mode'
    ).toBeGreaterThan(zoom);
  }
);
