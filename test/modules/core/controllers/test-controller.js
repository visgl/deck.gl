function makeEvents(events, opts = {}) {
  return events.map((type, i) => makeEvent(type, opts, i));
}

function makeEvent(type, opts, seed) {
  return {
    type,
    offsetCenter: {x: 100 + seed, y: 100 - seed},
    delta: -seed - 1,
    scale: 1 + (seed + 1) * 0.1,
    rotation: (seed + 1) * 5,
    srcEvent: opts,
    preventDefault: () => {}
  };
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
  touchRotate: false,
  keyboard: true
};

const TEST_CASES = [
  {
    title: 'pan',
    props: {},
    events: makeEvents(['panstart', 'panmove', 'panend']),
    viewStateChanges: 3,
    interactionStateChanges: 3
  },
  {
    title: 'pan#function key',
    props: {},
    events: makeEvents(['panstart', 'panmove', 'panend'], {metaKey: true}),
    viewStateChanges: 3,
    interactionStateChanges: 3
  },
  {
    title: 'pan#out of bounds',
    props: {x: 200},
    events: makeEvents(['panstart', 'panmove', 'panend']),
    viewStateChanges: 1,
    interactionStateChanges: 1
  },
  {
    title: 'pan#disabled',
    props: {dragPan: false, dragRotate: false},
    events: makeEvents(['panstart', 'panmove', 'panend']),
    viewStateChanges: 2,
    interactionStateChanges: 2
  },
  {
    title: 'pan#function key#disabled',
    props: {dragPan: false, dragRotate: false},
    events: makeEvents(['panstart', 'panmove', 'panend'], {metaKey: true}),
    viewStateChanges: 2,
    interactionStateChanges: 2
  },

  {
    title: 'pinch',
    props: {},
    events: makeEvents(['pinchstart', 'pinchmove', 'pinchend']),
    viewStateChanges: 3,
    interactionStateChanges: 3
  },
  {
    title: 'pinch#out of bounds',
    props: {x: 200},
    events: makeEvents(['pinchstart', 'pinchmove', 'pinchend']),
    viewStateChanges: 1,
    interactionStateChanges: 1
  },
  {
    title: 'pinch#disabled',
    props: {touchZoom: false, touchRotate: false},
    events: makeEvents(['pinchstart', 'pinchmove', 'pinchend']),
    viewStateChanges: 2,
    interactionStateChanges: 2
  },

  {
    title: 'wheel',
    props: {},
    events: makeEvents(['wheel']),
    viewStateChanges: 1,
    interactionStateChanges: 1
  },
  {
    title: 'wheel#out of bounds',
    props: {x: 200},
    events: makeEvents(['wheel']),
    viewStateChanges: 0,
    interactionStateChanges: 0
  },
  {
    title: 'wheel#disabled',
    props: {scrollZoom: false},
    events: makeEvents(['wheel']),
    viewStateChanges: 0,
    interactionStateChanges: 0
  },

  {
    title: 'doubletap',
    props: {},
    events: makeEvents(['doubletap']),
    viewStateChanges: 1,
    interactionStateChanges: 1
  },
  {
    title: 'doubletap#out of bounds',
    props: {x: 200},
    events: makeEvents(['doubletap']),
    viewStateChanges: 0,
    interactionStateChanges: 0
  },
  {
    title: 'doubletap#disabled',
    props: {doubleClickZoom: false},
    events: makeEvents(['doubletap']),
    viewStateChanges: 0,
    interactionStateChanges: 0
  },

  {
    title: 'keyboard',
    props: {},
    events: makeEvents(['keydown'], {keyCode: 189})
      .concat(makeEvents(['keydown'], {keyCode: 189, shiftKey: true}))
      .concat(makeEvents(['keydown'], {keyCode: 187}))
      .concat(makeEvents(['keydown'], {keyCode: 187, shiftKey: true}))
      .concat(makeEvents(['keydown'], {keyCode: 37}))
      .concat(makeEvents(['keydown'], {keyCode: 37, shiftKey: true}))
      .concat(makeEvents(['keydown'], {keyCode: 38}))
      .concat(makeEvents(['keydown'], {keyCode: 38, shiftKey: true}))
      .concat(makeEvents(['keydown'], {keyCode: 39}))
      .concat(makeEvents(['keydown'], {keyCode: 39, shiftKey: true}))
      .concat(makeEvents(['keydown'], {keyCode: 40}))
      .concat(makeEvents(['keydown'], {keyCode: 40, shiftKey: true})),
    viewStateChanges: 12,
    interactionStateChanges: 12
  },
  {
    title: 'keyboard#disabled',
    props: {keyboard: false},
    events: makeEvents(['keydown'], {keyCode: 189}),
    viewStateChanges: 0,
    interactionStateChanges: 0
  }
];

export default function testController(t, ViewClass, defaultProps, blackList = []) {
  let onViewStateChangeCalled = 0;
  let onStateChangeCalled = 0;

  const controllerProps = new ViewClass({controller: true}).controller;
  Object.assign(defaultProps, BASE_PROPS, controllerProps);
  const ControllerClass = controllerProps.type;
  const controller = new ControllerClass(defaultProps);

  for (const testCase of TEST_CASES) {
    if (blackList.includes(testCase.title)) {
      continue; // eslint-disable-line
    }
    // reset
    onViewStateChangeCalled = 0;
    onStateChangeCalled = 0;

    /* eslint-disable no-loop-func */
    controller.setProps(
      Object.assign(
        {
          onViewStateChange: ({viewState}) => {
            onViewStateChangeCalled++;
            controller.setProps(Object.assign({}, defaultProps, testCase.props, viewState));
          },
          onStateChange: () => onStateChangeCalled++
        },
        defaultProps,
        testCase.props
      )
    );
    for (const event of testCase.events) {
      controller.handleEvent(event);
    }
    t.is(onViewStateChangeCalled, testCase.viewStateChanges, `${testCase.title} onViewStateChange`);
    t.is(onStateChangeCalled, testCase.interactionStateChanges, `${testCase.title} onStateChange`);
  }
}
