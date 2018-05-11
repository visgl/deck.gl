import test from 'tape-catch';
import TransitionInterpolator from '@deck.gl/core/transitions/transition-interpolator';

const TEST_CASES = [
  {
    title: 'any prop changes',
    props: {width: 100, height: 100},
    nextProps: {width: 200, height: 200},
    equals: false,
    initializeProps: {start: {width: 100, height: 100}, end: {width: 200, height: 200}}
  },
  {
    title: 'selected prop changes',
    opts: ['longitude', 'latitude'],
    props: {width: 100, height: 100, longitude: -122, latitude: 38},
    nextProps: {width: 100, height: 100, longitude: -122, latitude: 37},
    equals: false,
    initializeProps: {start: {longitude: -122, latitude: 38}, end: {longitude: -122, latitude: 37}}
  },
  {
    title: 'no valid prop changes',
    opts: ['width', 'height'],
    props: {width: 100, height: 100, rotation: 0},
    nextProps: {width: 100, height: 100, rotation: 30},
    equals: true
  },
  {
    title: 'array prop deep equals',
    opts: ['position', 'angle'],
    props: {position: [0, 0, 0], angle: 0},
    nextProps: {position: [0, 0, 0], angle: 0},
    equals: true
  },
  {
    title: 'array prop changes',
    opts: ['position', 'angle'],
    props: {position: [0, 0, 0], angle: 0},
    nextProps: {position: [0, 0, 1], angle: 0},
    equals: false,
    initializeProps: {start: {position: [0, 0, 0], angle: 0}, end: {position: [0, 0, 1], angle: 0}}
  },
  {
    title: 'required prop missing',
    opts: {compare: ['position', 'angle'], required: ['position', 'angle']},
    props: {position: [0, 0, 0]},
    nextProps: {position: [0, 0, 0]},
    equals: false,
    initializeProps: false
  },
  {
    title: 'extract selected props',
    opts: {
      compare: ['longitude', 'latitude'],
      extract: ['width', 'height', 'zoom', 'longitude', 'latitude']
    },
    props: {width: 100, height: 100, longitude: -122, latitude: 38},
    nextProps: {width: 200, height: 200, longitude: -122, latitude: 37},
    equals: false,
    initializeProps: {
      start: {width: 100, height: 100, zoom: undefined, longitude: -122, latitude: 38},
      end: {width: 200, height: 200, zoom: undefined, longitude: -122, latitude: 37}
    }
  }
];

test('TransitionInterpolator#arePropsEqual', t => {
  TEST_CASES.forEach(testCase => {
    const interpolator = new TransitionInterpolator(testCase.opts);
    t.is(
      interpolator.arePropsEqual(testCase.props, testCase.nextProps),
      testCase.equals,
      testCase.title
    );
  });

  t.end();
});

test('TransitionInterpolator#initializeProps', t => {
  TEST_CASES.forEach(testCase => {
    if (!testCase.equals) {
      const interpolator = new TransitionInterpolator(testCase.opts);

      if (testCase.initializeProps) {
        t.deepEquals(
          interpolator.initializeProps(testCase.props, testCase.nextProps),
          testCase.initializeProps,
          testCase.title
        );
      } else {
        t.throws(
          () => interpolator.initializeProps(testCase.props, testCase.nextProps),
          testCase.title
        );
      }
    }
  });

  t.end();
});
