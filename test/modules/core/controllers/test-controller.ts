import {Timeline} from '@luma.gl/engine';

function makeEvents(events, opts = {}) {
  return events.map((type, i) => makeEvent(type, opts, i));
}

function makeEvent(type, opts, seed) {
  const event = {
    type,
    handled: opts.handled,
    offsetCenter: {x: 100 + seed, y: 100 - seed},
    delta: -seed - 1,
    deltaX: seed / 2,
    deltaY: seed / 2,
    velocityX: seed / 2,
    velocityY: seed / 2,
    velocity: seed / 2,
    deltaTime: seed,
    scale: 1 + (seed + 1) * 0.1,
    rotation: (seed + 1) * 5,
    srcEvent: {
      ...opts,
      preventDefault: () => {}
    },
    stopPropagation: () => {
      event.handled = true;
    }
  };
  return event;
}

const BASE_PROPS = {
  x: 0,
  y: 0,
  width: 100,
  height: 100,
  scrollZoom: true,
  dragPan: true,
  dragRotate: true,
  doubleClickZoom: true,
  touchZoom: true,
  touchRotate: true,
  keyboard: true
};

const TEST_CASES = [
  {
    title: 'pan',
    props: {},
    events: () => makeEvents(['panstart', 'panmove', 'panend']),
    viewStateChanges: 3,
    interactionStates: 2 // isDragging, isPanning/isRotating
  },
  {
    title: 'pan#function key',
    props: {},
    events: () => makeEvents(['panstart', 'panmove', 'panend'], {metaKey: true}),
    viewStateChanges: 3,
    interactionStates: 2 // isDragging, isPanning/isRotating
  },
  {
    title: 'pan#out of bounds',
    props: {x: 200},
    events: () => makeEvents(['panstart', 'panmove', 'panend']),
    viewStateChanges: 0,
    interactionStates: 0
  },
  {
    title: 'pan#handled event',
    props: {},
    events: () => makeEvents(['panstart', 'panmove', 'panend'], {handled: true}),
    viewStateChanges: 0,
    interactionStates: 0
  },
  {
    title: 'pan#disabled',
    props: {dragPan: false, dragRotate: false},
    events: () => makeEvents(['panstart', 'panmove', 'panend']),
    viewStateChanges: 2,
    interactionStates: 1 // isDragging
  },
  {
    title: 'pan#function key#disabled',
    props: {dragPan: false, dragRotate: false},
    events: () => makeEvents(['panstart', 'panmove', 'panend'], {metaKey: true}),
    viewStateChanges: 2,
    interactionStates: 1 // isDragging
  },

  {
    title: 'pinch',
    props: {},
    events: () => makeEvents(['pinchstart', 'pinchmove', 'pinchend']),
    viewStateChanges: 3,
    interactionStates: 4 // isDragging, isPanning, isRotating, isZooming
  },
  {
    title: 'pinch#out of bounds',
    props: {x: 200},
    events: () => makeEvents(['pinchstart', 'pinchmove', 'pinchend']),
    viewStateChanges: 0,
    interactionStates: 0
  },
  {
    title: 'pinch#disabled',
    props: {touchZoom: false, touchRotate: false},
    events: () => makeEvents(['pinchstart', 'pinchmove', 'pinchend']),
    viewStateChanges: 2,
    interactionStates: 1 // isDragging
  },

  {
    title: 'tripan',
    props: {},
    events: () => makeEvents(['tripanstart', 'tripanmove', 'tripanend']),
    viewStateChanges: 3,
    interactionStates: 2 // isDragging, isRotating
  },
  {
    title: 'tripan#out of bounds',
    props: {x: 200},
    events: () => makeEvents(['tripanstart', 'tripanmove', 'tripanend']),
    viewStateChanges: 0,
    interactionStates: 0
  },
  {
    title: 'tripan#disabled',
    props: {touchRotate: false},
    events: () => makeEvents(['tripanstart', 'tripanmove', 'tripanend']),
    viewStateChanges: 2,
    interactionStates: 1 // isDragging
  },

  {
    title: 'wheel',
    props: {},
    events: () => makeEvents(['wheel']),
    viewStateChanges: 1,
    interactionStates: 2
  },
  {
    title: 'wheel#out of bounds',
    props: {x: 200},
    events: () => makeEvents(['wheel']),
    viewStateChanges: 0,
    interactionStates: 0
  },
  {
    title: 'wheel#disabled',
    props: {scrollZoom: false},
    events: () => makeEvents(['wheel']),
    viewStateChanges: 0,
    interactionStates: 0
  },

  {
    title: 'doubletap',
    props: {},
    events: () => makeEvents(['doubletap']),
    viewStateChanges: 1,
    interactionStates: 2
  },
  {
    title: 'doubletap#out of bounds',
    props: {x: 200},
    events: () => makeEvents(['doubletap']),
    viewStateChanges: 0,
    interactionStates: 0
  },
  {
    title: 'doubletap#disabled',
    props: {doubleClickZoom: false},
    events: () => makeEvents(['doubletap']),
    viewStateChanges: 0,
    interactionStates: 0
  },

  {
    title: 'keyboard',
    props: {},
    events: () =>
      makeEvents(['keydown'], {code: 'Minus'})
        .concat(makeEvents(['keydown'], {code: 'Minus', shiftKey: true}))
        .concat(makeEvents(['keydown'], {code: 'Equal'}))
        .concat(makeEvents(['keydown'], {code: 'Equal', shiftKey: true}))
        .concat(makeEvents(['keydown'], {code: 'ArrowLeft'}))
        .concat(makeEvents(['keydown'], {code: 'ArrowLeft', shiftKey: true}))
        .concat(makeEvents(['keydown'], {code: 'ArrowUp'}))
        .concat(makeEvents(['keydown'], {code: 'ArrowUp', shiftKey: true}))
        .concat(makeEvents(['keydown'], {code: 'ArrowRight'}))
        .concat(makeEvents(['keydown'], {code: 'ArrowRight', shiftKey: true}))
        .concat(makeEvents(['keydown'], {code: 'ArrowDown'}))
        .concat(makeEvents(['keydown'], {code: 'ArrowDown', shiftKey: true})),
    viewStateChanges: 12,
    interactionStates: 3
  },
  {
    title: 'keyboard#disabled',
    props: {keyboard: false},
    events: () => makeEvents(['keydown'], {code: 'Minus'}),
    viewStateChanges: 0,
    interactionStates: 0
  }
];

export default async function testController(t, ViewClass, defaultProps, blackList = []) {
  const timeline = new Timeline();
  const view = new ViewClass({controller: true});

  let onViewStateChangeCalled = 0;
  const affectedStates = new Set();
  let controllerProps = null;
  Object.assign(defaultProps, BASE_PROPS, view.controller);
  const ControllerClass = defaultProps.type;
  const controller = new ControllerClass({
    timeline,
    onViewStateChange: ({viewState, interactionState}) => {
      if (!interactionState.inTransition) {
        onViewStateChangeCalled++;
      }
      // eslint-disable-next-line
      controller.setProps({...controllerProps, ...viewState});
    },
    onStateChange: state => {
      for (const key in state) {
        if (state[key] && key.startsWith('is')) {
          affectedStates.add(key);
        }
      }
    },
    makeViewport: viewState =>
      view.makeViewport({width: BASE_PROPS.width, height: BASE_PROPS.height, viewState})
  });
  controller.setProps(defaultProps);

  for (const testCase of TEST_CASES) {
    if (blackList.includes(testCase.title)) {
      continue; // eslint-disable-line
    }
    onViewStateChangeCalled = 0;
    affectedStates.clear();
    controllerProps = {...defaultProps, ...testCase.props};
    controller.setProps(controllerProps);
    await triggerEvents(controller, testCase, timeline);

    t.is(onViewStateChangeCalled, testCase.viewStateChanges, `${testCase.title} onViewStateChange`);
    t.is(
      affectedStates.size,
      testCase.interactionStates,
      `${testCase.title} interaction state updated`
    );
  }
}

async function triggerEvents(controller, testCase, timeline) {
  /* eslint-disable no-loop-func */
  for (const event of testCase.events()) {
    controller.handleEvent(event);
    await waitUntil(
      controller,
      timeline,
      () => !controller._eventStartBlocked && !controller._interactionState.inTransition
    );
  }
}

function waitUntil(controller, timeline, verify) {
  return new Promise(resolve => {
    const check = () => {
      if (verify()) {
        resolve();
      } else {
        timeline.setTime(timeline.getTime() + 100);
        controller.updateTransition();
        /* global setTimeout */
        setTimeout(check, 10);
      }
    };
    check();
  });
}
