import test from 'tape-catch';
import {vec2} from 'gl-matrix';
import Viewport from '../../viewport';

/* eslint-disable */
const VIEWPORT_TEST_DATA = [
  {
    mapState: {
      width: 793,
      height: 775,
      latitude: 37.751537058389985,
      longitude: -122.42694203247012,
      zoom: 11.5,
      bearing: -44.48928121059271,
      pitch: 43.670797287818566
      // altitude: undefined
    }
  }
];

test('Viewport#constructor', t => {
  t.ok(new Viewport() instanceof Viewport,
    'Created new Viewport with default args');
  t.end();
});

test('Viewport#constructor - 0 width/height', t => {
  const viewport = new Viewport({
    ...VIEWPORT_TEST_DATA.mapState,
    width: 0,
    height: 0
  });
  t.ok(viewport instanceof Viewport,
    'Viewport constructed successfully with 0 width and height');
  t.end();
});

test('Viewport.projectFlat', t => {
  for (const tc of VIEWPORT_TEST_DATA) {
    const {mapState} = tc;
    const viewport = new Viewport(mapState);
    const lnglatIn = [tc.mapState.longitude + 5, tc.mapState.latitude + 5];
    const xy = viewport.projectFlat(lnglatIn);
    const lnglat = viewport.unprojectFlat(xy);
    t.comment(`Comparing [${lnglatIn}] to [${lnglat}]`);
    t.ok(vec2.equals(lnglatIn, lnglat));
  }
  t.end();
});


// test('Viewport.project#3D', t => {
//   for (const tc of VIEWPORT_TEST_DATA) {
//     const {mapState} = tc;
//     const viewport = new Viewport(mapState);
//     const lnglatIn = [tc.mapState.longitude + 5, tc.mapState.latitude + 5];
//     const xy = viewport.project(lnglatIn);
//     const lnglat = viewport.unproject(xy);
//     t.comment(`Comparing [${lnglatIn}] to [${lnglat}]`);
//     t.ok(vec2.equals(lnglatIn, lnglat));
//   }
//   t.end();
// });
