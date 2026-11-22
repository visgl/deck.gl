// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {expect, test} from 'vitest';
import {vec3} from '@math.gl/core/matrix';
import GlobeView from '../../../../modules/core/src/views/globe-view';
import GlobeViewport from '../../../../modules/core/src/viewports/globe-viewport';
import WebMercatorViewport from '../../../../modules/core/src/viewports/web-mercator-viewport';
import {GLOBE_CRS} from '../../../../modules/core/src/viewports/globe-util';
import {getUniformsFromViewport} from '../../../../modules/core/src/shaderlib/project/viewport-uniforms';
import {projectToFlatCommon} from '../../../../modules/extensions/src/utils/projection-utils';

const EARTH_RADIUS = 6370972;
const MOON_RADIUS = 1737400;
const GLOBE_RADIUS = 256;
const DEGREES_TO_RADIANS = Math.PI / 180;
const VIEW_STATE = {
  width: 800,
  height: 600,
  longitude: 23.47,
  latitude: 0.67,
  zoom: 3,
  pitch: 30,
  bearing: 15
};

type Vec3 = [number, number, number];

/** The globe projection of the base branch, with the Earth's radius as a constant. */
function projectEarth([lng, lat, z = 0]: number[]): Vec3 {
  const lambda = lng * DEGREES_TO_RADIANS;
  const phi = lat * DEGREES_TO_RADIANS;
  const cosPhi = Math.cos(phi);
  const D = (z / EARTH_RADIUS + 1) * GLOBE_RADIUS;
  return [Math.sin(lambda) * cosPhi * D, -Math.cos(lambda) * cosPhi * D, Math.sin(phi) * D];
}

const POSITIONS: Vec3[] = [
  [23.47, 0.67, 0],
  [-120.5, 45.2, 1234.5],
  [179.9, -89.5, -350],
  [0, 0, 250000]
];

test('GlobeViewport: the default radius keeps the Earth results', () => {
  const viewport = new GlobeViewport(VIEW_STATE);
  const explicit = new GlobeViewport({...VIEW_STATE, _radius: EARTH_RADIUS});
  expect(viewport.radius).toBe(EARTH_RADIUS);
  expect(viewport.crs).toBe(GLOBE_CRS);
  expect(explicit.crs).toBe(GLOBE_CRS);
  expect(viewport.distanceScales.unitsPerMeter).toEqual([
    GLOBE_RADIUS / EARTH_RADIUS,
    GLOBE_RADIUS / EARTH_RADIUS,
    GLOBE_RADIUS / EARTH_RADIUS
  ]);
  expect(explicit.equals(viewport)).toBe(true);
  for (const p of POSITIONS) {
    // Bit for bit
    expect(viewport.projectPosition(p)).toEqual(projectEarth(p));
    const common = projectEarth(p);
    expect(viewport.unprojectPosition(common)[2]).toBe(
      (vec3.len(common) / GLOBE_RADIUS - 1) * EARTH_RADIUS
    );
  }
  const uniforms = getUniformsFromViewport({viewport});
  expect(uniforms.globeRadiusMeters).toBe(EARTH_RADIUS);
  const origin: Vec3 = [23.5, 0.6, 120];
  const meters = getUniformsFromViewport({
    viewport,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: origin
  });
  expect(meters.commonOrigin).toEqual(projectEarth(origin));
});

test('GlobeViewport: radius', () => {
  const earth = new GlobeViewport(VIEW_STATE);
  const moon = new GlobeViewport({...VIEW_STATE, _radius: MOON_RADIUS});
  expect(moon.radius).toBe(MOON_RADIUS);
  expect(moon.equals(earth)).toBe(false);
  expect(() => new GlobeViewport({...VIEW_STATE, _radius: 0})).toThrow();
  expect(() => new GlobeViewport({...VIEW_STATE, _radius: NaN})).toThrow();

  // Distance scales
  const unitsPerMeter = GLOBE_RADIUS / MOON_RADIUS;
  expect(moon.distanceScales.unitsPerMeter).toEqual([unitsPerMeter, unitsPerMeter, unitsPerMeter]);
  expect(moon.distanceScales.unitsPerWorldUnit).toEqual([
    earth.distanceScales.unitsPerWorldUnit[0],
    earth.distanceScales.unitsPerWorldUnit[1],
    unitsPerMeter
  ]);
  expect(moon.metersPerPixel / earth.metersPerPixel).toBeCloseTo(MOON_RADIUS / EARTH_RADIUS, 12);

  // Positions on the surface do not depend on the radius; altitudes scale with it
  expect(moon.projectPosition([10, 20, 0])).toEqual(earth.projectPosition([10, 20, 0]));
  expect(vec3.len(moon.projectPosition([10, 20, 100000]))).toBeCloseTo(
    GLOBE_RADIUS * (1 + 100000 / MOON_RADIUS),
    10
  );
  expect(vec3.len(earth.projectPosition([10, 20, 100000]))).toBeCloseTo(
    GLOBE_RADIUS * (1 + 100000 / EARTH_RADIUS),
    10
  );

  // Round trips through common space and through pixels
  for (const p of POSITIONS) {
    const q = moon.unprojectPosition(moon.projectPosition(p));
    expect(q[0]).toBeCloseTo(p[0], 9);
    expect(q[1]).toBeCloseTo(p[1], 9);
    expect(q[2]).toBeCloseTo(p[2], 6);
  }
  for (const [x, y] of [
    [400, 300],
    [300, 220],
    [520, 400]
  ]) {
    for (const targetZ of [0, 5000, 150000]) {
      const lngLatZ = moon.unproject([x, y], {targetZ});
      expect(lngLatZ[2]).toBe(targetZ);
      const pixel = moon.project(lngLatZ);
      expect(pixel[0]).toBeCloseTo(x, 6);
      expect(pixel[1]).toBeCloseTo(y, 6);
      if (targetZ) {
        // The ray meets a different sphere on the Earth
        const onEarth = earth.unproject([x, y], {targetZ});
        expect(Math.hypot(onEarth[0] - lngLatZ[0], onEarth[1] - lngLatZ[1])).toBeGreaterThan(1e-4);
      }
    }
    // A pixel with depth: unproject3D
    const target: Vec3 = moon.unproject([x, y], {targetZ: 20000}) as Vec3;
    const [px, py, pz] = moon.project(target);
    const picked = moon.unproject([px, py, pz]);
    expect(picked[2]).toBeCloseTo(20000, 3);
  }

  // Bounds at an altitude: the corners unproject on the sphere of the Moon's radius
  const bounds = moon.getBounds({z: 100000});
  const corner = moon.unproject([0, moon.height / 2], {targetZ: 100000});
  expect(bounds[0]).toBeCloseTo(corner[0], 12);
  expect(bounds).not.toEqual(earth.getBounds({z: 100000}));
  expect(moon.getBounds()).toEqual(earth.getBounds());

  // The CRS is geocentric on the sphere of the radius
  expect(moon.crs!.signature).toBe(`+proj=geocent +R=${MOON_RADIUS} +datum=none`);
  const geocentric = moon.crs!.converter.WGS84.from([90, 0, 1000]);
  expect(geocentric[1]).toBeCloseTo(MOON_RADIUS + 1000, 6);
  expect(new GlobeViewport({...VIEW_STATE, _radius: MOON_RADIUS}).crs).toBe(moon.crs);
});

test('GlobeView: radius keeps the globe viewport at high zoom', () => {
  const viewState = {...VIEW_STATE, zoom: 14};
  expect(new GlobeView().getViewportType(viewState)).toBe(WebMercatorViewport);
  expect(new GlobeView({_radius: EARTH_RADIUS}).getViewportType(viewState)).toBe(
    WebMercatorViewport
  );
  expect(new GlobeView({_radius: MOON_RADIUS}).getViewportType(viewState)).toBe(GlobeViewport);
  const viewport = new GlobeView({_radius: MOON_RADIUS}).makeViewport({
    width: 800,
    height: 600,
    viewState
  }) as GlobeViewport;
  expect(viewport.radius).toBe(MOON_RADIUS);
});

test('project uniforms: radius', () => {
  const moon = new GlobeViewport({...VIEW_STATE, _radius: MOON_RADIUS});
  const uniforms = getUniformsFromViewport({viewport: moon});
  expect(uniforms.globeRadiusMeters).toBe(MOON_RADIUS);
  expect(uniforms.commonUnitsPerMeter).toEqual(moon.distanceScales.unitsPerMeter);
  expect(
    getUniformsFromViewport({viewport: new WebMercatorViewport(VIEW_STATE)}).globeRadiusMeters
  ).toBe(EARTH_RADIUS);

  // meter-offsets: the layer origin at altitude, on the sphere of the radius
  const origin: Vec3 = [23.5, 0.6, 3000];
  const meters = getUniformsFromViewport({
    viewport: moon,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: origin
  });
  expect(meters.commonOrigin).toEqual(moon.projectPosition(origin));
  expect(vec3.len(meters.commonOrigin)).toBeCloseTo(GLOBE_RADIUS * (1 + 3000 / MOON_RADIUS), 10);

  // Camera-relative: the origin is at altitude 0; the layer offset carries the radius
  const relative = new GlobeViewport({...VIEW_STATE, _radius: MOON_RADIUS, _cameraRelative: true});
  const relativeMeters = getUniformsFromViewport({
    viewport: relative,
    coordinateSystem: 'meter-offsets',
    coordinateOrigin: origin
  });
  expect(relativeMeters.globeRadiusMeters).toBe(MOON_RADIUS);
  const layerOrigin = relative.projectPosition(origin);
  relativeMeters.globeLayerOffset.forEach((v, i) =>
    expect(v).toBeCloseTo(layerOrigin[i] - relativeMeters.commonOrigin[i], 12)
  );
});

test('GlobeView radius: the flat meter-offset helper', () => {
  const earth = new GlobeViewport({...VIEW_STATE, zoom: 4, pitch: 0});
  const moon = new GlobeViewport({...VIEW_STATE, zoom: 4, pitch: 0, _radius: MOON_RADIUS});
  // An offset of 10 km east covers more longitude on a smaller sphere
  const layer = (viewport: GlobeViewport) =>
    ({
      props: {coordinateSystem: 'meter-offsets', coordinateOrigin: [0, 0, 0], modelMatrix: null},
      internalState: {viewport},
      context: {viewport}
    }) as any;
  const earthX = projectToFlatCommon(layer(earth), [10000, 0, 0])[0] - 256;
  const moonX = projectToFlatCommon(layer(moon), [10000, 0, 0])[0] - 256;
  expect(moonX / earthX).toBeCloseTo(EARTH_RADIUS / MOON_RADIUS, 3);
});
