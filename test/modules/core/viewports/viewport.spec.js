import test from 'tape-catch';
import {vecNormalized} from '../../../utils/utils';
import {Viewport} from 'deck.gl';
import {Matrix4, Vector3} from 'math.gl';

/* eslint-disable */
const TEST_VIEWPORTS = [
  {
    id: 'orthographic',
    width: 800,
    height: 600,
    viewMatrix: new Matrix4().lookAt({eye: [0, 0, 1]}),
    near: 1,
    far: 10,
    position: [10, -20, 0],
    zoom: 1
  },
  {
    id: 'orbit',
    width: 800,
    height: 600,
    viewMatrix: new Matrix4()
      .lookAt({
        eye: [0, 0, 1.0722534602547793],
        up: [0, 1, 0]
      })
      .rotateX(-Math.PI / 6)
      .rotateY((Math.PI * 2) / 3)
      .scale(0.4266666666666667),
    fovy: 50,
    near: 0.1,
    far: 10,
    position: [10, -20, 30],
    zoom: 8
  },
  {
    id: 'first-person',
    width: 800,
    height: 600,
    longitude: -122,
    latitude: 38,
    viewMatrix: new Matrix4()
      .lookAt({
        eye: [0, 0, 0],
        center: [0.6, -0.8, 0],
        up: [0, 0, 1]
      })
      .scale(Math.pow(2, 15.910865502636394)),
    position: [0, 0, 2],
    zoom: 15.910865502636394
  }
];

test('Viewport#imports', t => {
  t.ok(Viewport, 'Viewport import ok');
  t.end();
});

test('Viewport#constructor', t => {
  t.ok(new Viewport() instanceof Viewport, 'Created new Viewport with default args');
  t.ok(new Viewport(TEST_VIEWPORTS[0]) instanceof Viewport, 'Created new Viewport with test args');

  t.ok(
    new Viewport(
      Object.assign({}, TEST_VIEWPORTS[0], {
        width: 0,
        height: 0
      })
    ) instanceof Viewport,
    'Viewport constructed successfully with 0 width and height'
  );
  t.end();
});

test('Viewport#equals', t => {
  const viewport1a = new Viewport(TEST_VIEWPORTS[0]);
  const viewport1b = new Viewport(TEST_VIEWPORTS[0]);
  const viewport2a = new Viewport(TEST_VIEWPORTS[1]);
  const viewport2b = new Viewport(TEST_VIEWPORTS[1]);

  t.ok(viewport1a.equals(viewport1a), 'Viewport equality correct');
  t.ok(viewport1a.equals(viewport1b), 'Viewport equality correct');
  t.ok(viewport2a.equals(viewport2b), 'Viewport equality correct');
  t.notOk(viewport1a.equals(viewport2a), 'Viewport equality correct');
  t.end();
});

test('Viewport.getScales', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new Viewport(vc.mapState);
    const distanceScales = viewport.getDistanceScales();
    t.ok(distanceScales.metersPerUnit && distanceScales.unitsPerMeter, 'distanceScales defined');
  }
  t.end();
});

test('Viewport.containsPixel', t => {
  const viewport = new Viewport({x: 0, y: 0, width: 10, height: 10});

  t.ok(viewport.containsPixel({x: 5, y: 5}), 'pixel is inside');
  t.ok(viewport.containsPixel({x: 0, y: 0}), 'pixel is inside');
  t.notOk(viewport.containsPixel({x: 10, y: 10}), 'pixel is outside');
  t.ok(viewport.containsPixel({x: -1, y: -1, width: 2, height: 2}), 'rectangle overlaps');
  t.notOk(viewport.containsPixel({x: -3, y: -3, width: 2, height: 2}), 'rectangle is outside');
  t.ok(viewport.containsPixel({x: 9, y: 0, width: 2, height: 2}), 'rectangle overlaps');
  t.ok(viewport.containsPixel({x: 0, y: 9, width: 2, height: 2}), 'rectangle overlaps');
  t.notOk(viewport.containsPixel({x: 11, y: 11, width: 2, height: 2}), 'rectangle is outside');

  t.end();
});

test('Viewport.getFrustumPlanes', t => {
  const CULLING_TEST_CASES = [
    {
      pixels: [400, 300, 0],
      result: null
    },
    {
      pixels: [799, 1, 0],
      result: null
    },
    {
      pixels: [1, 599, 0],
      result: null
    },
    {
      pixels: [799, 599, 0],
      result: null
    },
    {
      pixels: [1, 1, 0],
      result: null
    },
    {
      pixels: [-1, 300, 0],
      result: 'left'
    },
    {
      pixels: [801, 300, 0],
      result: 'right'
    },
    {
      pixels: [400, -1, 0],
      result: 'top'
    },
    {
      pixels: [400, 601, 0],
      result: 'bottom'
    },
    {
      pixels: [400, 300, -1.01],
      result: 'near'
    },
    {
      pixels: [400, 301, 1.01],
      result: 'far'
    }
  ];

  // TODO - fix first person viewport
  for (const vc of TEST_VIEWPORTS.slice(0, 2)) {
    t.comment(vc.id);
    const viewport = new Viewport(vc);
    const planes = viewport.getFrustumPlanes();

    for (const side in planes) {
      const plane = planes[side];
      t.ok(Number.isFinite(plane.distance), 'distance is defined');
      t.ok(vecNormalized(plane.normal), 'normal is defined');
    }

    t.is(viewport.getFrustumPlanes(), planes, 'frustum planes are cached');

    for (const tc of CULLING_TEST_CASES) {
      const lngLat = viewport.unproject(tc.pixels);
      const commonPosition = viewport.projectPosition(lngLat);
      const culledDirs = getCulling(commonPosition, planes);
      if (tc.result) {
        t.ok(culledDirs && culledDirs.includes(tc.result), `point culled (${tc.result})`);
      } else {
        t.is(culledDirs, null, 'point not culled');
      }
    }
  }

  t.end();
});

function getCulling(p, planes) {
  const outDirs = [];
  p = new Vector3(p);
  for (const dir in planes) {
    const plane = planes[dir];
    if (p.dot(plane.normal) > plane.distance) {
      outDirs.push(dir);
    }
  }
  return outDirs.length ? outDirs : null;
}
