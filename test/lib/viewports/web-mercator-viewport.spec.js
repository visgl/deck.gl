import test from 'tape-catch';
import {vec2, vec3} from 'gl-matrix';
import {PerspectiveMercatorViewport} from 'viewport-mercator-project';

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
      zoom: 15.5,
      bearing: -44.48928121059271,
      pitch: 43.670797287818566
    }
  }
];

test('PerspectiveMercatorViewport#imports', t => {
  t.ok(PerspectiveMercatorViewport, 'PerspectiveMercatorViewport import ok');
  t.end();
});

test('PerspectiveMercatorViewport#constructor', t => {
  t.ok(new PerspectiveMercatorViewport() instanceof PerspectiveMercatorViewport,
    'Created new PerspectiveMercatorViewport with default args');
  t.end();
});

test('PerspectiveMercatorViewport#constructor - 0 width/height', t => {
  const viewport = new PerspectiveMercatorViewport(Object.assign(TEST_VIEWPORTS[0].mapState, {
    width: 0,
    height: 0
  }));
  t.ok(viewport instanceof PerspectiveMercatorViewport,
    'PerspectiveMercatorViewport constructed successfully with 0 width and height');
  t.end();
});

test('PerspectiveMercatorViewport.projectFlat', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new PerspectiveMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const {mapState} = tc;
      const lnglatIn = [tc.mapState.longitude, tc.mapState.latitude];
      const xy = viewport.projectFlat(lnglatIn);
      const lnglat = viewport.unprojectFlat(xy);
      t.comment(`Comparing [${lnglatIn}] to [${lnglat}]`);
      t.ok(vec2.equals(lnglatIn, lnglat));
    }
  }
  t.end();
});

test('PerspectiveMercatorViewport.project#3D', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new PerspectiveMercatorViewport(vc.mapState);
    for (const offset of [0, 0.5, 1.0, 5.0]) {
      const {mapState} = vc;
      const lnglatIn = [vc.mapState.longitude + offset, vc.mapState.latitude + offset];
      const xyz = viewport.project(lnglatIn);
      const lnglat = viewport.unproject(xyz);
      t.ok(vec2.equals(lnglatIn, lnglat), `Project/unproject ${lnglatIn} to ${lnglat}`);

      const lnglatIn3 = [vc.mapState.longitude + offset, vc.mapState.latitude + offset, 0];
      const xyz3 = viewport.project(lnglatIn3);
      const lnglat3 = viewport.unproject(xyz3);
      t.ok(vec3.equals(lnglatIn3, lnglat3),
        `Project/unproject ${lnglatIn3}=>${xyz3}=>${lnglat3}`);
    }
  }
  t.end();
});

test('PerspectiveMercatorViewport.project#2D', t => {
  // Cross check positions
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new PerspectiveMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const {mapState} = tc;
      const lnglatIn = [tc.mapState.longitude, tc.mapState.latitude];
      const xy = viewport.project(lnglatIn);
      const lnglat = viewport.unproject(xy);
      t.comment(`Comparing [${lnglatIn}] to [${lnglat}]`);
      t.ok(vec2.equals(lnglatIn, lnglat));
    }
  }
  t.end();
});

test('PerspectiveMercatorViewport.getScales', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new PerspectiveMercatorViewport(vc.mapState);
    const distanceScales = viewport.getDistanceScales();
    t.ok(Array.isArray(distanceScales.metersPerPixel), 'metersPerPixel defined');
    t.ok(Array.isArray(distanceScales.pixelsPerMeter), 'pixelsPerMeter defined');
    t.ok(Array.isArray(distanceScales.degreesPerPixel), 'degreesPerPixel defined');
    t.ok(Array.isArray(distanceScales.pixelsPerDegree), 'pixelsPerDegree defined');
  }
  t.end();
});

test('PerspectiveMercatorViewport.meterDeltas', t => {
  for (const vc of TEST_VIEWPORTS) {
    const viewport = new PerspectiveMercatorViewport(vc.mapState);
    for (const tc of TEST_VIEWPORTS) {
      const {mapState} = tc;
      const coordinate = [tc.mapState.longitude, tc.mapState.latitude, 0];
      const deltaLngLat = viewport.metersToLngLatDelta(coordinate);
      const deltaMeters = viewport.lngLatDeltaToMeters(deltaLngLat);
      t.comment(`Comparing [${deltaMeters}] to [${coordinate}]`);
      t.ok(vec2.equals(deltaMeters, coordinate));
    }
  }
  t.end();
});
