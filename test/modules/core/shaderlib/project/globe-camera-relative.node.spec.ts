// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {vec4} from '@math.gl/core/matrix';
import GlobeView from '../../../../../modules/core/src/views/globe-view';
import GlobeViewport from '../../../../../modules/core/src/viewports/globe-viewport';
import WebMercatorViewport from '../../../../../modules/core/src/viewports/web-mercator-viewport';
import {
  getUniformsFromViewport,
  getGlobeOriginTrig
} from '../../../../../modules/core/src/shaderlib/project/viewport-uniforms';
import {projectPosition} from '../../../../../modules/core/src/shaderlib/project/project-functions';
import {WGS84_CRS} from '../../../../../modules/core/src/utils/crs';

const EARTH_RADIUS = 6370972;
const GLOBE_RADIUS = 256;
const f = Math.fround;
const WIDTH = 800;
const HEIGHT = 600;
const VIEW_STATE = {longitude: -122.4194155, latitude: 37.7749295, zoom: 20, pitch: 0, bearing: 0};

function makeViewport(opts: Record<string, unknown> = {}): GlobeViewport {
  return new GlobeViewport({width: WIDTH, height: HEIGHT, ...VIEW_STATE, ...opts});
}

type Vec3 = [number, number, number];

/** Port of project_sin_cos_small_ in project.glsl.ts. */
function sinCosSmall(x: number, r: (x: number) => number): [number, number] {
  if (Math.abs(x) > 0.1) return [r(Math.sin(x)), r(Math.cos(x))];
  const x2 = r(x * x);
  return [
    r(x * r(1 - r(r(x2 / 6) * r(1 - r(r(x2 / 20) * r(1 - r(x2 / 42))))))),
    r(1 - r(r(x2 / 2) * r(1 - r(r(x2 / 12) * r(1 - r(x2 / 30))))))
  ];
}

/**
 * Port of the longitude difference in project_globe_relative_, wrapped to [-180, 180]. The
 * globeLongitudeWrap uniform is float64 origin - 360 and origin + 360, rounded once on upload.
 */
function lngDelta(lng: number, origin: number, r: (x: number) => number): number {
  const dLng = r(lng - origin);
  if (dLng > 180) return r(lng - r(origin + 360));
  if (dLng < -180) return r(lng - r(origin - 360));
  return dLng;
}

/** Float64 port of project_globe_relative_ in project.glsl.ts, with an optional float32 rounding. */
function globeRelative(
  hi: Vec3,
  lo: Vec3,
  origin: Vec3,
  trig: number[],
  r: (x: number) => number,
  delta: (lng: number, origin: number, r: (x: number) => number) => number = lngDelta
) {
  const dLng = delta(hi[0], origin[0], r);
  const dLat = r(hi[1] - origin[1]);
  const hL = r(r(dLng * r(Math.PI / 180)) * 0.5);
  const hP = r(r(dLat * r(Math.PI / 180)) * 0.5);
  const [sl0, cl0, sp0, cp0] = trig.map(r);
  const [sHL, cHL] = sinCosSmall(hL, r);
  const [sHP, cHP] = sinCosSmall(hP, r);
  const dSinL = r(r(2 * sHL) * r(r(cl0 * cHL) - r(sl0 * sHL)));
  const dCosL = r(r(-2 * sHL) * r(r(sl0 * cHL) + r(cl0 * sHL)));
  const dSinP = r(r(2 * sHP) * r(r(cp0 * cHP) - r(sp0 * sHP)));
  const dCosP = r(r(-2 * sHP) * r(r(sp0 * cHP) + r(cp0 * sHP)));
  const lowL = r(lo[0] * r(Math.PI / 180));
  const lowP = r(lo[1] * r(Math.PI / 180));
  const dUnit = [
    r(
      r(r(r(sl0 + dSinL) * dCosP) + r(cp0 * dSinL)) +
        r(r(r(cl0 * cp0) * lowL) + r(r(-sl0 * sp0) * lowP))
    ),
    r(
      -r(r(r(cl0 + dCosL) * dCosP) + r(cp0 * dCosL)) +
        r(r(r(sl0 * cp0) * lowL) + r(r(cl0 * sp0) * lowP))
    ),
    r(dSinP + r(cp0 * lowP))
  ];
  const unit0 = [r(sl0 * cp0), r(-cl0 * cp0), sp0];
  const altitude = r(hi[2] + lo[2]);
  const D = r(r(r(altitude / EARTH_RADIUS) + 1) * GLOBE_RADIUS);
  const dD = r(r(altitude / EARTH_RADIUS) * GLOBE_RADIUS);
  return dUnit.map((d, i) => r(r(d * D) + r(unit0[i] * dD))) as Vec3;
}

/** Float32 port of project_globe_ in project.glsl.ts. */
function globeAbsolute32(hi: Vec3): Vec3 {
  const lambda = f(hi[0] * f(Math.PI / 180));
  const phi = f(hi[1] * f(Math.PI / 180));
  const cosPhi = f(Math.cos(phi));
  const D = f(f(f(hi[2] / EARTH_RADIUS) + 1) * GLOBE_RADIUS);
  return [
    f(f(f(Math.sin(lambda)) * cosPhi) * D),
    f(f(-f(Math.cos(lambda)) * cosPhi) * D),
    f(f(Math.sin(phi)) * D)
  ];
}

/** Float32 matrix * vector, column major, as the GPU does it. */
function transform32(m: ArrayLike<number>, v: number[]): number[] {
  const out = [0, 0, 0, 0];
  for (let row = 0; row < 4; row++) {
    let sum = 0;
    for (let col = 0; col < 4; col++) {
      sum = f(sum + f(f(m[col * 4 + row]) * f(v[col])));
    }
    out[row] = sum;
  }
  return out;
}

function clipToPixels(clip: number[]): [number, number] {
  return [((clip[0] / clip[3] + 1) / 2) * WIDTH, ((1 - clip[1] / clip[3]) / 2) * HEIGHT];
}

function split(p: Vec3): {hi: Vec3; lo: Vec3} {
  const hi = p.map(f) as Vec3;
  return {hi, lo: p.map((v, i) => f(v - hi[i])) as Vec3};
}

/** Points around the camera target, up to a few hundred pixels away at zoom 20. */
function samplePoints(viewport: GlobeViewport): Vec3[] {
  const points: Vec3[] = [];
  for (let i = -4; i <= 4; i++) {
    for (let j = -3; j <= 3; j++) {
      points.push(viewport.unproject([WIDTH / 2 + i * 97.3, HEIGHT / 2 + j * 83.1]) as Vec3);
    }
  }
  return points.map(([x, y], i) => [x, y, (i % 3) * 1.5]);
}

test('GlobeView keeps the Web Mercator switch above zoom 12 unless the flag is set', () => {
  expect(new GlobeView().getViewportType({...VIEW_STATE, zoom: 15})).toBe(WebMercatorViewport);
  expect(new GlobeView().getViewportType({...VIEW_STATE, zoom: 11})).toBe(GlobeViewport);
  const view = new GlobeView({_cameraRelative: true});
  expect(view.getViewportType({...VIEW_STATE, zoom: 15})).toBe(GlobeViewport);
  const viewport = view.makeViewport({width: WIDTH, height: HEIGHT, viewState: VIEW_STATE});
  expect(viewport).toBeInstanceOf(GlobeViewport);
  expect((viewport as GlobeViewport).cameraRelative).toBe(true);
});

test('flag off: globe uniforms stay absolute', () => {
  const viewport = makeViewport();
  expect(viewport.cameraRelative).toBe(false);
  const uniforms = getUniformsFromViewport({viewport, coordinateSystem: 'lnglat'});
  expect(uniforms.globeRelative).toBe(0);
  expect(uniforms.center).toEqual([0, 0, 0, 0]);
  expect(uniforms.commonOrigin).toEqual([0, 0, 0]);
  expect(uniforms.coordinateOrigin).toEqual([0, 0, 0]);
  expect(uniforms.globeOriginTrig).toEqual([0, 0, 0, 0]);
  expect(Array.from(uniforms.viewProjectionMatrix)).toEqual(
    Array.from(viewport.viewProjectionMatrix)
  );
  expect(uniforms.cameraPosition).toEqual(viewport.cameraPosition);

  const layerOrigin: Vec3 = [-122.42, 37.775, 0];
  const meters = getUniformsFromViewport({
    viewport,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: layerOrigin
  });
  expect(meters.globeRelative).toBe(0);
  expect(meters.globeLayerOffset).toEqual([0, 0, 0]);
  const expected = viewport.projectPosition(layerOrigin);
  meters.commonOrigin.forEach((v, i) => expect(v).toBeCloseTo(expected[i], 9));

  // The default far plane covers the globe diameter
  const scale = viewport.scale;
  const farZ = 1.5 + (GLOBE_RADIUS * 2 * scale) / HEIGHT;
  expect(viewport.projectionMatrix[14]).toBeCloseTo(makeViewport({farZ}).projectionMatrix[14], 12);
});

test('flag on: float64 origin at the camera target and float64 center', () => {
  const viewport = makeViewport({_cameraRelative: true});
  const uniforms = getUniformsFromViewport({viewport, coordinateSystem: 'lnglat'});
  const origin: Vec3 = [f(VIEW_STATE.longitude), f(VIEW_STATE.latitude), 0];
  expect(uniforms.globeRelative).toBe(1);
  expect(uniforms.coordinateOrigin).toEqual(origin);
  expect(uniforms.globeOriginTrig).toEqual(getGlobeOriginTrig(origin));
  expect(uniforms.globeOriginTrig[0]).toBe(Math.sin((origin[0] * Math.PI) / 180));
  expect(uniforms.globeLongitudeWrap).toEqual([origin[0] - 360, origin[0] + 360]);

  const originCommon = viewport.projectPosition(origin);
  uniforms.commonOrigin.forEach((v, i) => expect(v).toBe(originCommon[i]));
  const center = vec4.transformMat4([], [...originCommon, 1], viewport.viewProjectionMatrix);
  uniforms.center.forEach((v, i) => expect(v).toBeCloseTo(center[i], 9));
  uniforms.cameraPosition.forEach((v, i) =>
    expect(v).toBeCloseTo(viewport.cameraPosition[i] - originCommon[i], 9)
  );
  // The translation leaves the matrix: VP * (delta, 0) + center
  expect(uniforms.viewProjectionMatrix[12]).toBe(0);
  expect(uniforms.viewProjectionMatrix[15]).toBe(0);

  // meter-offsets: commonOrigin stays the view origin, the layer gets a float64 delta
  const layerOrigin: Vec3 = [-122.4189, 37.7752, 12];
  const meters = getUniformsFromViewport({
    viewport,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: layerOrigin
  });
  expect(meters.globeRelative).toBe(1);
  meters.commonOrigin.forEach((v, i) => expect(v).toBe(originCommon[i]));
  const layerCommon = viewport.projectPosition(layerOrigin);
  meters.globeLayerOffset.forEach((v, i) =>
    expect(v).toBeCloseTo(layerCommon[i] - originCommon[i], 12)
  );
  meters.center.forEach((v, i) => expect(v).toBeCloseTo(center[i], 9));
});

test('flag on: the CPU projectPosition is relative to the same origin', () => {
  const viewport = makeViewport({_cameraRelative: true});
  const p: Vec3 = [-122.4193, 37.7751, 3];
  const params = {
    viewport,
    sourceCrs: WGS84_CRS,
    modelMatrix: null,
    coordinateOrigin: [0, 0, 0] as Vec3,
    coordinateSystem: 'lnglat' as const
  };
  const relative = projectPosition(p, params);
  const absolute = viewport.projectPosition(p);
  const origin = viewport.projectPosition([f(VIEW_STATE.longitude), f(VIEW_STATE.latitude), 0]);
  relative.forEach((v, i) => expect(v).toBeCloseTo(absolute[i] - origin[i], 12));
});

test('the difference identities equal the float64 projection relative to the origin', () => {
  const origin: Vec3 = [f(VIEW_STATE.longitude), f(VIEW_STATE.latitude), 0];
  const trig = getGlobeOriginTrig(origin);
  const viewport = makeViewport();
  const exact = (x: number) => x;
  const cases: Vec3[] = [
    [-122.4194, 37.7749, 0],
    [-122.3, 37.9, 2500],
    [-100, 10, -40],
    [60, -45, 0],
    // across the antimeridian from the origin
    [178, 37.7, 0],
    [-179.5, 37.7, 0]
  ];
  for (const p of cases) {
    const expected = viewport.projectPosition(p);
    const base = viewport.projectPosition(origin);
    const actual = globeRelative(p, [0, 0, 0], origin, trig, exact);
    actual.forEach((v, i) => expect(v).toBeCloseTo(expected[i] - base[i], 9));
  }
  // Across the seam from an origin near 180
  const eastOrigin: Vec3 = [f(179.9), f(10), 0];
  const eastTrig = getGlobeOriginTrig(eastOrigin);
  const across: Vec3 = [-179.9, 10.01, 0];
  const expected = viewport.projectPosition(across);
  const base = viewport.projectPosition(eastOrigin);
  globeRelative(across, [0, 0, 0], eastOrigin, eastTrig, exact).forEach((v, i) =>
    expect(v).toBeCloseTo(expected[i] - base[i], 9)
  );
});

test('float32 shader model at zoom 20: camera-relative within 0.01 px, absolute off by pixels', () => {
  const relativeViewport = makeViewport({_cameraRelative: true});
  const absoluteViewport = makeViewport();
  const relative = getUniformsFromViewport({
    viewport: relativeViewport,
    coordinateSystem: 'lnglat'
  });
  const absolute = getUniformsFromViewport({
    viewport: absoluteViewport,
    coordinateSystem: 'lnglat'
  });
  let maxRelative = 0;
  let maxAbsolute = 0;
  for (const p of samplePoints(absoluteViewport)) {
    const [ex, ey] = relativeViewport.project(p);
    const {hi, lo} = split(p);

    const delta = globeRelative(hi, lo, relative.coordinateOrigin, relative.globeOriginTrig, f);
    const clipVector = transform32(relative.viewProjectionMatrix, [...delta, 1]);
    const clipR = clipVector.map((v, i) => f(v + f(relative.center[i])));
    const [rx, ry] = clipToPixels(clipR);
    maxRelative = Math.max(maxRelative, Math.hypot(rx - ex, ry - ey));

    const clipA = transform32(absolute.viewProjectionMatrix, [...globeAbsolute32(hi), 1]);
    const [ax, ay] = clipToPixels(clipA);
    const [bx, by] = absoluteViewport.project(p);
    maxAbsolute = Math.max(maxAbsolute, Math.hypot(ax - bx, ay - by));
  }
  expect(maxRelative).toBeLessThan(0.01);
  expect(maxAbsolute).toBeGreaterThan(1);
});

/** Distance in meters between the float32 model and the float64 projection, relative to origin. */
function float32ModelError(p: Vec3, origin: Vec3): number {
  const viewport = makeViewport();
  const {hi, lo} = split(p);
  const actual = globeRelative(hi, lo, origin, getGlobeOriginTrig(origin), f);
  const expected = viewport.projectPosition(p);
  const base = viewport.projectPosition(origin);
  const error = Math.hypot(...actual.map((v, i) => v - (expected[i] - base[i])));
  return (error * EARTH_RADIUS) / GLOBE_RADIUS;
}

// Float32 longitude step in [128, 256)
const STEP = 2 ** -16;

test('float32 shader model: the longitude difference across the antimeridian is exact', () => {
  // The origin is 2 steps west of 180, the point 1 step east of -180: 3 steps apart
  const origin = 179.999969482421875;
  const point = -179.9999847412109375;
  expect(f(origin)).toBe(origin);
  expect(f(point)).toBe(point);
  expect(lngDelta(point, origin, f)).toBe(3 * STEP);
  expect(lngDelta(-point, -origin, f)).toBe(-3 * STEP);
  expect(float32ModelError([point, 0, 0], [origin, 0, 0])).toBeLessThan(0.001);
  expect(float32ModelError([-point, 0, 0], [-origin, 0, 0])).toBeLessThan(0.001);

  // Both directions, up to 64 steps from the seam on each side, and some larger offsets. With
  // the origin within 52 degrees of the seam, origin -/+ 360 is a float32 value and the one
  // subtraction is exact near the seam.
  const offsets = [...Array.from({length: 65}, (_, i) => i * STEP), 0.001, 0.0123, 0.5, 7.25, 51];
  for (const a of offsets) {
    for (const b of offsets) {
      const east = f(180 - a);
      const west = f(-180 + b);
      // Float64 differences of float32 values are exact
      const expected = west - east + 360;
      expect(lngDelta(west, east, f)).toBe(expected);
      expect(lngDelta(east, west, f)).toBe(0 - expected);
    }
  }
  // Farther from the seam, origin -/+ 360 rounds: within 2 float32 steps of a difference > 52
  for (const a of [52.5, 60, 85, 120, 170]) {
    for (const b of [0, STEP, 0.5, 10, 100]) {
      const east = f(180 - a);
      const west = f(-180 + b);
      const expected = west - east + 360;
      // A difference of 180 may land on either side
      if (expected >= 180) continue;
      const step = 2 ** (Math.floor(Math.log2(expected)) - 23);
      expect(Math.abs(lngDelta(west, east, f) - expected)).toBeLessThanOrEqual(2 * step);
      expect(Math.abs(lngDelta(east, west, f) + expected)).toBeLessThanOrEqual(2 * step);
    }
  }
  for (const a of [0, 3, 40].map(i => i * STEP)) {
    for (const b of [1, 17].map(i => i * STEP)) {
      for (const lat of [0, 37.5, -61.25]) {
        const east: Vec3 = [f(180 - a), f(lat), 0];
        const west: Vec3 = [-180 + b + 1e-9, lat + 1e-5, 2];
        expect(float32ModelError(west, east)).toBeLessThan(0.001);
        expect(float32ModelError([-west[0], west[1], 2], [-east[0], east[1], 0])).toBeLessThan(
          0.001
        );
      }
    }
  }
});

test('float32 shader model: points that do not cross the antimeridian subtract directly', () => {
  const plain = (lng: number, origin: number, r: (x: number) => number) => r(lng - origin);
  const origins: Vec3[] = [
    [f(VIEW_STATE.longitude), f(VIEW_STATE.latitude), 0],
    [f(179.99), f(10), 0],
    [f(-179.99), f(-10), 0],
    [0, 0, 0]
  ];
  let count = 0;
  for (const origin of origins) {
    const trig = getGlobeOriginTrig(origin);
    for (let lng = -180; lng <= 180; lng += 7.3) {
      for (const d of [0, 1e-4, -3e-3, 0.7]) {
        const p: Vec3 = [lng + d, 20 + d, 1.5];
        const {hi, lo} = split(p);
        if (Math.abs(f(hi[0] - origin[0])) > 180) continue;
        count++;
        expect(globeRelative(hi, lo, origin, trig, f)).toEqual(
          globeRelative(hi, lo, origin, trig, f, plain)
        );
      }
    }
  }
  expect(count).toBeGreaterThan(400);
});
