// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {
  MapView,
  OrbitView,
  OrthographicView,
  FirstPersonView,
  _GlobeView as GlobeView
} from '@deck.gl/core';
import {Timeline} from '@luma.gl/engine';

import testController, {createTestController} from './test-controller';

const makeDoubleClickDragEvent = (type: string, y: number, scale: number = 1) => ({
  type,
  offsetCenter: {x: 50, y},
  scale,
  srcEvent: {
    preventDefault() {}
  },
  stopPropagation() {}
});

test('MapController', async () => {
  await testController(MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45
  });
});

test('MapController#inertia', async () => {
  await testController(MapView, {
    longitude: -122.45,
    latitude: 37.78,
    zoom: 10,
    pitch: 30,
    bearing: -45,
    inertia: true
  });
});

test('MapController supports double-click drag zoom when double click and touch zoom are disabled', () => {
  const controller = createTestController({
    view: new MapView({
      controller: {doubleClickZoom: false, doubleClickDragZoom: true, touchZoom: false}
    }),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45,
      inertia: 300
    }
  });

  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragstart', 50, 1.1) as any);
  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragmove', 20, 1.3) as any);
  const zoomAfterMove = controller.props.zoom;

  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragend', 20, 1.3) as any);

  expect(zoomAfterMove, 'dragging up after double click zooms in').toBeGreaterThan(10);
  expect(controller.props.zoom, 'release should not change zoom').toBeCloseTo(zoomAfterMove);
});

test('MapController disables double-click drag zoom', () => {
  const controller = createTestController({
    view: new MapView({controller: {doubleClickDragZoom: false}}),
    initialViewState: {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 10,
      pitch: 30,
      bearing: -45,
      inertia: 300
    }
  });

  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragstart', 50, 1.1) as any);
  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragmove', 20, 1.3) as any);
  controller.handleEvent(makeDoubleClickDragEvent('dblclickdragend', 20, 1.3) as any);

  expect(controller.props.zoom, 'double-click drag zoom stays disabled').toBe(10);
});

test('GlobeController', async () => {
  await testController(
    GlobeView,
    {
      longitude: -122.45,
      latitude: 37.78,
      zoom: 0
    },
    // GlobeView cannot be rotated
    ['pan#function key', 'pinch', 'multipan']
  );
});

test('GlobeController supports pointer anchored zoom option', () => {
  const makeController = (controller: true | {zoomAround: 'center' | 'pointer'}) =>
    createTestController({
      view: new GlobeView({controller}),
      initialViewState: {
        longitude: 0,
        latitude: 0,
        zoom: 1
      }
    });

  const makeWheelEvent = () => ({
    type: 'wheel',
    offsetCenter: {x: 75, y: 50},
    delta: -10,
    srcEvent: {preventDefault() {}},
    stopPropagation() {}
  });

  const centerZoomController = makeController(true);
  const pointerZoomController = makeController({zoomAround: 'pointer'});

  centerZoomController.handleEvent(makeWheelEvent() as any);
  pointerZoomController.handleEvent(makeWheelEvent() as any);

  expect(centerZoomController.props.longitude, 'center zoom preserves longitude').toBeCloseTo(0);
  expect(pointerZoomController.props.longitude, 'pointer zoom adjusts longitude').not.toBeCloseTo(
    0
  );
});

test('GlobeController applies updated zoomAround option', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {zoomAround: 'center'}}),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    }
  });

  const wheelEvent = {
    type: 'wheel',
    offsetCenter: {x: 75, y: 50},
    delta: -10,
    srcEvent: {preventDefault() {}},
    stopPropagation() {}
  };

  controller.handleEvent(wheelEvent as any);
  expect(controller.props.longitude, 'center zoom preserves longitude').toBeCloseTo(0);

  controller.setProps({...controller.props, zoomAround: 'pointer'});
  controller.handleEvent(wheelEvent as any);
  expect(controller.props.longitude, 'updated pointer zoom adjusts longitude').not.toBeCloseTo(0);
});

test('GlobeController keeps pointer anchored zoom after constrained pan', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {zoomAround: 'pointer'}}),
    initialViewState: {
      width: 800,
      height: 600,
      longitude: 30,
      latitude: 20,
      zoom: 1
    }
  });

  const makeGestureEvent = (type: string, x: number, y: number) => ({
    type,
    offsetCenter: {x, y},
    delta: -10,
    deltaX: 0,
    deltaY: 0,
    srcEvent: {preventDefault() {}},
    stopPropagation() {}
  });

  controller.handleEvent(makeGestureEvent('panstart', 400, 300) as any);
  controller.handleEvent(makeGestureEvent('panmove', 400, 0) as any);
  controller.handleEvent(makeGestureEvent('panend', 400, 0) as any);

  const longitudeAfterPan = controller.props.longitude;
  const latitudeAfterPan = controller.props.latitude;
  expect(latitudeAfterPan, 'pan reached the constrained latitude').toBeLessThan(-80);

  controller.handleEvent(makeGestureEvent('wheel', 500, 300) as any);

  expect(
    controller.props.longitude,
    'pointer zoom after constrained pan still adjusts longitude'
  ).not.toBeCloseTo(longitudeAfterPan);
  expect(
    controller.props.latitude,
    'pointer zoom after constrained pan still adjusts latitude'
  ).not.toBeCloseTo(latitudeAfterPan);
});

test('GlobeController keeps pointer anchored zoom above GlobeViewport zoom range', () => {
  const controller = createTestController({
    view: new GlobeView({controller: {zoomAround: 'pointer'}}),
    initialViewState: {
      width: 800,
      height: 600,
      longitude: 0,
      latitude: 0,
      zoom: 13
    }
  });

  const wheelEvent = {
    type: 'wheel',
    offsetCenter: {x: 500, y: 300},
    delta: 10,
    srcEvent: {preventDefault() {}},
    stopPropagation() {}
  };

  expect(
    () => controller.handleEvent(wheelEvent as any),
    'pointer zoom falls back to WebMercator anchoring at high zoom'
  ).not.toThrow();
  expect(
    Math.abs(controller.props.longitude),
    'high zoom pointer zoom adjusts longitude'
  ).toBeGreaterThan(1e-5);
});

test('GlobeController omits transition anchor when zoomAround is center', () => {
  const centerZoomController = createTestController({
    view: new GlobeView({controller: {zoomAround: 'center'}}),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    }
  });

  const pointerZoomController = createTestController({
    view: new GlobeView({controller: {zoomAround: 'pointer'}}),
    initialViewState: {
      longitude: 0,
      latitude: 0,
      zoom: 1
    }
  });

  const centerTransitionAround = (centerZoomController as any)._getTransitionProps({
    around: [75, 50]
  }).transitionInterpolator.opts.around;
  const pointerTransitionAround = (pointerZoomController as any)._getTransitionProps({
    around: [75, 50]
  }).transitionInterpolator.opts.around;

  expect(centerTransitionAround, 'center mode does not transition around pointer').toBeUndefined();
  expect(pointerTransitionAround, 'pointer mode keeps transition anchor').toEqual([75, 50]);
});

test('OrbitController', async () => {
  await testController(OrbitView, {
    orbitAxis: 'Y',
    rotationX: 30,
    rotationOrbit: -45,
    target: [1, 1, 0],
    zoom: 1
  });
});

test('OrthographicController', async () => {
  await testController(
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: 1
    },
    // OrthographicView cannot be rotated
    [
      'pan#function key',
      'pan#function key#disabled',
      'multipan',
      'multipan#disabled',
      'keyboard#function key'
    ]
  );
});

test('OrthographicController#2d zoom', async () => {
  await testController(
    OrthographicView,
    {
      target: [1, 1, 0],
      zoom: [1, 2]
    },
    // OrthographicView cannot be rotated
    [
      'pan#function key',
      'pan#function key#disabled',
      'multipan',
      'multipan#disabled',
      'keyboard#function key'
    ]
  );
});

test('OrthographicController keyboard navigation with padding', async () => {
  const controller = createTestController({
    view: new OrthographicView({
      controller: {
        keyboard: {moveSpeed: 10}
      },
      padding: {left: 50, top: 20}
    }),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0
    },
    onViewStateChange: ({viewState}) => {
      viewState.transitionDuration = 0;
      return viewState;
    }
  });
  controller.setProps({...controller.props, target: [0, 0, 0], zoom: 0});

  const keyboardEvent = {
    type: 'keydown',
    srcEvent: {preventDefault() {}, code: 'ArrowLeft'},
    stopPropagation: () => {}
  };

  controller.handleEvent(keyboardEvent);
  expect(controller.props.target, 'Moved 10px left').toEqual([10, 0]);

  keyboardEvent.srcEvent.code = 'ArrowUp';
  controller.handleEvent(keyboardEvent);
  expect(controller.props.target, 'Moved 10px up').toEqual([10, 10]);
});

test('OrthographicController scroll zoom responds without transition lag', () => {
  const controller = createTestController({
    view: new OrthographicView({controller: true, padding: {left: 50, top: 20}}),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0,
      scrollZoom: true
    }
  });

  const wheelEvent = {
    type: 'wheel',
    offsetCenter: {x: 50, y: 50},
    delta: -1,
    srcEvent: {preventDefault() {}},
    stopPropagation: () => {}
  };

  controller.handleEvent(wheelEvent as any);

  const speed = 0.01;
  const {delta} = wheelEvent;
  let scale = 2 / (1 + Math.exp(-Math.abs(delta * speed)));
  if (delta < 0 && scale !== 0) {
    scale = 1 / scale;
  }
  const expectedZoom = Math.log2(scale);

  expect(
    Math.abs((controller.props.zoom as number) - expectedZoom) < 1e-6,
    'zoom level updates immediately when scroll zoom is not smooth'
  ).toBeTruthy();
});

test('OrthographicController scroll zoom resets isZooming state', () => {
  const interactionStates: any[] = [];
  const controller = createTestController({
    view: new OrthographicView({controller: true, padding: {left: 50, top: 20}}),
    initialViewState: {
      target: [0, 0, 0],
      zoom: 0,
      scrollZoom: true
    },
    onStateChange: state => {
      interactionStates.push({...state});
    }
  });

  const wheelEvent = {
    type: 'wheel',
    offsetCenter: {x: 50, y: 50},
    delta: -1,
    srcEvent: {preventDefault() {}},
    stopPropagation: () => {}
  };

  controller.handleEvent(wheelEvent as any);

  // Verify we get exactly 2 state changes for non-smooth scroll zoom
  expect(interactionStates.length, 'scroll zoom triggers exactly 2 state changes').toBe(2);

  // Verify first state has isZooming: true
  expect(interactionStates[0].isZooming, 'isZooming is set to true at start').toBe(true);
  expect(interactionStates[0].isPanning, 'isPanning is set to true at start').toBe(true);

  // Verify last state has isZooming: false
  expect(interactionStates[1].isZooming, 'isZooming is reset to false at end').toBe(false);
  expect(interactionStates[1].isPanning, 'isPanning is reset to false at end').toBe(false);
});

test('FirstPersonController', async () => {
  await testController(
    FirstPersonView,
    {
      longitude: -122.45,
      latitude: 37.78,
      pitch: 15,
      bearing: 0,
      position: [0, 0, 2]
    },
    // FirstPersonController does not pan
    ['pan#function key', 'pan#function key#disabled']
  );
});
