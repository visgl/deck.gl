"use strict";var WebMercatorViewport;module.link('deck.gl',{WebMercatorViewport(v){WebMercatorViewport=v}},0);var test;module.link('tape-catch',{default(v){test=v}},1);var toLowPrecision;module.link('@deck.gl/test-utils',{toLowPrecision(v){toLowPrecision=v}},2);



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
  },
  {
    title: 'projectFlat (center)',
    func: 'projectFlat',
    input: [-122.43, 37.75],
    expected: [237142.08819, 573305.65851]
  },
  {
    title: 'unProjectFlat (center)',
    func: 'unprojectFlat',
    input: [237142.08819, 573305.65851],
    expected: [-122.43, 37.749999999]
  },
  {
    title: 'projectFlat (corner)',
    func: 'projectFlat',
    input: [-122.55, 37.83],
    expected: [236647.78473, 572888.66298]
  },
  {
    title: 'unprojectFlat (corner)',
    func: 'unprojectFlat',
    input: [236647, 572888],
    expected: [-122.5501905, 37.830127124]
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
      output.map(x => toLowPrecision(x)),
      expected.map(x => toLowPrecision(x)),
      `viewport.${func}(${title})`
    );
  });
  t.end();
});
