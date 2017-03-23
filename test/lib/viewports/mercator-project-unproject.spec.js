import {PerspectiveMercatorViewport} from 'viewport-mercator-project';
import test from 'tape-catch';
import {toLowPrecision} from '../utils/test-utils';

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
    expected: [-1.329741801625046, 6.796120915775314]
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
    expected: [-122.55024809579456, 37.832294933238586]
  }
];

test('Viewport constructor', t => {
  const viewport = new PerspectiveMercatorViewport(viewportProps);

  t.ok(viewport, 'Viewport construction successful');

  const viewportState = {};
  Object.keys(viewportProps).forEach(key => {
    viewportState[key] = viewport[key];
  });

  t.deepEquals(viewportState, viewportProps, 'Viewport props assigned');
  t.end();
});

test('Viewport projection', t => {
  const viewport = new PerspectiveMercatorViewport(viewportProps);
  TEST_CASES.forEach(({title, func, input, expected}) => {
    const output = viewport[func](input);
    t.deepEquals(
      output.map(x => toLowPrecision(x)),
      expected.map(x => toLowPrecision(x)),
      `viewport.${func}(${title})`
    );
  });
  t.end();
});
