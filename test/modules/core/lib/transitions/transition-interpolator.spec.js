import test from 'tape-catch';
import TransitionInterpolator from '@deck.gl/core/transitions/transition-interpolator';

const TEST_CASES = [
  {
    title: 'no valid prop changes',
    props: {width: 100, height: 100},
    nextProps: {width: 200, height: 200},
    expect: true
  },
  {
    title: 'prop changes',
    propNames: ['width', 'height'],
    props: {width: 100, height: 100},
    nextProps: {width: 200, height: 200},
    expect: false
  },
  {
    title: 'no valid prop changes',
    propNames: ['width', 'height'],
    props: {width: 100, height: 100, rotation: 0},
    nextProps: {width: 100, height: 100, rotation: 30},
    expect: true
  },
  {
    title: 'array prop changes',
    propNames: ['position'],
    props: {position: [0, 0, 0]},
    nextProps: {position: [0, 0, 0]},
    expect: true
  }
];

test('TransitionInterpolator#arePropsEqual', t => {
  TEST_CASES.forEach(testCase => {
    const interpolator = new TransitionInterpolator();
    interpolator.propNames = testCase.propNames;
    t.is(
      interpolator.arePropsEqual(testCase.props, testCase.nextProps),
      testCase.expect,
      testCase.title
    );
  });

  t.end();
});
