// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {MapView, _GlobeView as GlobeView, WebMercatorViewport} from '@deck.gl/core';
import GlobeViewport from '@deck.gl/core/viewports/globe-viewport';

const VIEW_STATE = {
  width: 960,
  height: 540,
  longitude: 8.5,
  latitude: 47.3,
  zoom: 6,
  pitch: 55,
  bearing: 25
};

for (const ViewportClass of [WebMercatorViewport, GlobeViewport]) {
  test(`${ViewportClass.displayName} preserves matrices for omitted or zero roll`, () => {
    const legacy = new ViewportClass(VIEW_STATE);
    const level = new ViewportClass({...VIEW_STATE, roll: 0});
    expect(level.roll).toBe(0);
    expect(level.viewMatrix).toEqual(legacy.viewMatrix);
    expect(level.projectionMatrix).toEqual(legacy.projectionMatrix);
    expect(level.pixelProjectionMatrix).toEqual(legacy.pixelProjectionMatrix);
    expect(level.equals(legacy)).toBe(true);
    expect(new ViewportClass({...VIEW_STATE, roll: 30}).equals(legacy)).toBe(false);
  });

  test.each([-45, 30, 90])(
    `${ViewportClass.displayName} rotates screen coordinates at %s degrees after bearing and pitch`,
    roll => {
      const level = new ViewportClass(VIEW_STATE);
      const banked = new ViewportClass({...VIEW_STATE, roll});
      const angle = (roll * Math.PI) / 180;
      for (const position of [
        [8.7, 47.4, 0],
        [8.3, 47.2, 500]
      ]) {
        const original = level.project(position);
        const projected = banked.project(position);
        const x = original[0] - VIEW_STATE.width / 2;
        const y = original[1] - VIEW_STATE.height / 2;
        expect(projected[0]).toBeCloseTo(
          VIEW_STATE.width / 2 + Math.cos(angle) * x + Math.sin(angle) * y,
          6
        );
        expect(projected[1]).toBeCloseTo(
          VIEW_STATE.height / 2 - Math.sin(angle) * x + Math.cos(angle) * y,
          6
        );
        const restored = banked.unproject(projected);
        expect(restored[0]).toBeCloseTo(position[0], 6);
        expect(restored[1]).toBeCloseTo(position[1], 6);
        expect(restored[2]).toBeCloseTo(position[2], 2);
      }
      const groundPoint = [8.7, 47.4];
      const restored = banked.unproject(banked.project(groundPoint).slice(0, 2));
      expect(restored[0]).toBeCloseTo(groundPoint[0], 6);
      expect(restored[1]).toBeCloseTo(groundPoint[1], 6);
    }
  );
}

test('MapView and both GlobeView projection paths forward roll', () => {
  for (const view of [new MapView(), new GlobeView()]) {
    for (const zoom of [4, 13]) {
      const viewport = view.makeViewport({
        width: 800,
        height: 600,
        viewState: {...VIEW_STATE, zoom, roll: -32}
      }) as WebMercatorViewport | GlobeViewport;
      expect(viewport.roll).toBe(-32);
    }
  }
});

test('repeated Mercator worlds retain roll', () => {
  const viewport = new WebMercatorViewport({
    width: 1600,
    height: 600,
    longitude: 170,
    zoom: 0,
    roll: 30,
    repeat: true
  });
  expect(viewport.subViewports!.length).toBeGreaterThan(1);
  for (const repeated of viewport.subViewports!) {
    expect(repeated.roll).toBe(30);
  }
});

test.each([30, -45, 90, 180])(
  'rolled Mercator bounds contain the visible ground at %s degrees',
  roll => {
    const viewport = new WebMercatorViewport({...VIEW_STATE, pitch: 75, roll});
    const bounds = viewport.getBounds();
    expect(bounds.every(Number.isFinite)).toBe(true);
    for (let x = 0; x <= viewport.width; x += viewport.width / 8) {
      for (let y = 0; y <= viewport.height; y += viewport.height / 8) {
        const ground = viewport.unproject([x, y], {targetZ: 0});
        const projected = viewport.project(ground);
        // Exclude rays pointing into the sky or beyond the far plane.
        if (projected[2] < -1 || projected[2] > 1) continue;
        expect(ground[0]).toBeGreaterThanOrEqual(bounds[0] - 1e-6);
        expect(ground[0]).toBeLessThanOrEqual(bounds[2] + 1e-6);
        expect(ground[1]).toBeGreaterThanOrEqual(bounds[1] - 1e-6);
        expect(ground[1]).toBeLessThanOrEqual(bounds[3] + 1e-6);
      }
    }
  }
);

test.each([30, -45, 90, 180])(
  'rolled Mercator far plane includes the ground corners at %s degrees',
  roll => {
    const viewport = new WebMercatorViewport({...VIEW_STATE, pitch: 45, roll});
    for (const x of [0, viewport.width]) {
      for (const y of [0, viewport.height]) {
        const ground = viewport.unproject([x, y], {targetZ: 0});
        const projected = viewport.project(ground);
        expect(projected[2]).toBeGreaterThan(-1);
        expect(projected[2]).toBeLessThanOrEqual(1);
      }
    }
  }
);
