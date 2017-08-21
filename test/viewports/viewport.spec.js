import test from 'tape-catch';
import {Viewport} from 'deck.gl';
import mat4 from 'gl-mat4';

const TEST_DATA = {
  viewport: {
    view: mat4.create(),
    perspective: mat4.create()
  }
};

/* eslint-disable */
const TEST_VIEWPORTS = [
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5
    }
  },
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 20.751537058389985,
      longitude: 22.42694203247012,
      zoom: 15.5
    }
  },
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 50.751537058389985,
      longitude: 42.42694203247012,
      zoom: 15.5
    }
  }
];

test('Viewport#imports', t => {
  t.ok(Viewport, 'Viewport import ok');
  t.end();
});

test('Viewport#constructor', t => {
  t.ok(new Viewport() instanceof Viewport,
    'Created new Viewport with default args');
  t.ok(new Viewport(TEST_DATA.viewport) instanceof Viewport,
    'Created new Viewport with test args');
  t.end();
});

test('Viewport#constructor - 0 width/height', t => {
  const viewport = new Viewport(Object.assign({}, TEST_DATA.viewport, {
    width: 0,
    height: 0
  }));
  t.ok(viewport instanceof Viewport,
    'Viewport constructed successfully with 0 width and height');
  t.end();
});

test('Viewport#equals', t => {
  const viewport1 = new Viewport(TEST_DATA.viewport);
  const viewport2 = new Viewport(TEST_DATA.viewport);
  const viewport3 = new Viewport(Object.assign({}, TEST_DATA.viewport, {height: 33}));

  t.ok(viewport1.equals(viewport1),
    'Viewport equality correct');
  t.ok(viewport1.equals(viewport2),
    'Viewport equality correct');
  t.notOk(viewport1.equals(viewport3),
    'Viewport equality correct');
  t.end();
});

test('Viewport.getScales', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new Viewport(vc.mapState);
    const distanceScales = viewport.getDistanceScales();
    t.ok(Array.isArray(distanceScales.metersPerPixel), 'metersPerPixel defined');
    t.ok(Array.isArray(distanceScales.pixelsPerMeter), 'pixelsPerMeter defined');
    t.ok(Array.isArray(distanceScales.degreesPerPixel), 'degreesPerPixel defined');
    t.ok(Array.isArray(distanceScales.pixelsPerDegree), 'pixelsPerDegree defined');
  }
  t.end();
});

