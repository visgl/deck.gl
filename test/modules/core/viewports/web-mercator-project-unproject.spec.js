import {WebMercatorViewport} from 'deck.gl';
import test from 'tape-catch';
import {toLowPrecision} from '@deck.gl/test-utils';

const viewportProps = {
  latitude: 37.75,
  longitude: -122.43,
  zoom: 11.5,
  pitch: 30,
  bearing: 0,
  width: 800,
  height: 600
};

const TEST_CASES = [
  {
    title: 'project (center)',
    func: 'project',
    input: [-122.43, 37.75],
    expected: [400, 300]
  },
  {
    title: 'project (corner)',
    func: 'project',
    input: [-122.55, 37.83],
    expected: [-1.3297418016723466, 6.796120915775524]
  },
  {
    title: 'unproject (center)',
    func: 'unproject',
    input: [400, 300],
    expected: [-122.43, 37.75]
  },
  {
    title: 'unproject (corner)',
    func: 'unproject',
    input: [0, 0],
    expected: [-122.55024809579457, 37.832294933238764]
  },
  {
    title: 'projectFlat (center)',
    func: 'projectFlat',
    input: [-122.43, 37.75],
    expected: [81.87733333333331, 314.0564849501292]
  },
  {
    title: 'unProjectFlat (center)',
    func: 'unprojectFlat',
    input: [81.87733333333331, 314.0564849501292],
    expected: [-122.43, 37.75]
  },
  {
    title: 'projectFlat (corner)',
    func: 'projectFlat',
    input: [-122.55, 37.83],
    expected: [81.70666666666665, 314.20045973576964]
  },
  {
    title: 'unprojectFlat (corner)',
    func: 'unprojectFlat',
    input: [81.70666666666665, 314.20045973576964],
    expected: [-122.55, 37.83]
  }
];

test('Viewport constructor', t => {
  const viewport = new WebMercatorViewport(viewportProps);

  t.ok(viewport, 'Viewport construction successful');

  const viewState = {};
  Object.keys(viewportProps).forEach(key => {
    viewState[key] = viewport[key];
  });

  t.deepEquals(viewState, viewportProps, 'Viewport props assigned');
  t.end();
});

test('Viewport projection', t => {
  const viewport = new WebMercatorViewport(viewportProps);

  TEST_CASES.forEach(({title, func, input, expected}) => {
    const output = viewport[func](input);
    t.deepEquals(
      output.map(x => toLowPrecision(x, 7)),
      expected.map(x => toLowPrecision(x, 7)),
      `viewport.${func}(${title})`
    );
  });
  t.end();
});
