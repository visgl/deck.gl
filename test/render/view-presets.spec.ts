// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {describe, test, expect} from 'vitest';
import {_GlobeViewport as GlobeViewport, MapView, OrthographicView} from '@deck.gl/core';
import {WIDTH, HEIGHT} from './constants';
import {expandViewMatrix, SF_VIEW_STATE, VIEW_PRESETS} from './view-presets';

// expandViewMatrix never touches layer instances; a placeholder is enough
const layer = {id: 'test-layer'} as any;

describe('view-presets', () => {
  test('presets', () => {
    expect(VIEW_PRESETS.map.views).toBeInstanceOf(MapView);
    expect(VIEW_PRESETS.orthographic.views).toBeInstanceOf(OrthographicView);
    expect(VIEW_PRESETS.globe.views.getViewportType(SF_VIEW_STATE)).toBe(GlobeViewport);
    expect(VIEW_PRESETS.map.toPosition([1, 2])).toEqual([1, 2]);

    // The orthographic preset is the pixel space of the map preset
    const center = VIEW_PRESETS.orthographic.toPosition([
      SF_VIEW_STATE.longitude,
      SF_VIEW_STATE.latitude
    ]);
    expect(center[0]).toBeCloseTo(WIDTH / 2, 6);
    expect(center[1]).toBeCloseTo(HEIGHT / 2, 6);
    // North is up in lng/lat but down in pixels, so toBounds must re-order min/max
    const bounds = VIEW_PRESETS.orthographic.toBounds([-122.47, 37.73, -122.39, 37.78]);
    expect(bounds[0]).toBeLessThan(bounds[2]);
    expect(bounds[1]).toBeLessThan(bounds[3]);
  });

  test('expandViewMatrix#names, views and goldens', () => {
    const cases = expandViewMatrix({name: 'my-case', layers: [layer]}, [
      'map',
      'globe',
      'orthographic'
    ]);
    expect(cases.map(c => c.name)).toEqual(['my-case', 'my-case-globe', 'my-case-orthographic']);
    expect(cases.map(c => c.goldenImage)).toEqual([
      './test/render/golden-images/my-case.png',
      './test/render/golden-images/my-case-globe.png',
      './test/render/golden-images/my-case-orthographic.png'
    ]);
    expect(cases[0].views).toBe(VIEW_PRESETS.map.views);
    expect(cases[1].views).toBe(VIEW_PRESETS.globe.views);
    expect(cases[0].viewState).toBe(SF_VIEW_STATE);
    expect(cases[2].viewState).toEqual({target: [WIDTH / 2, HEIGHT / 2, 0], zoom: 0});
    expect(cases[0].layers).toEqual([layer]);

    // Default presets
    expect(expandViewMatrix({name: 'x', layers: []}).map(c => c.name)).toEqual(['x', 'x-globe']);

    // Explicit base golden
    const custom = expandViewMatrix({
      name: 'x',
      layers: [],
      goldenImage: './test/render/golden-images/other.png'
    });
    expect(custom.map(c => c.goldenImage)).toEqual([
      './test/render/golden-images/other.png',
      './test/render/golden-images/other-globe.png'
    ]);
  });

  test('expandViewMatrix#viewState resolution', () => {
    const viewState = {longitude: 0, latitude: 0, zoom: 8};
    const cases = expandViewMatrix(
      {
        name: 'x',
        layers: [],
        viewState,
        overrides: {globe: {viewState: {longitude: 1, latitude: 1, zoom: 3}}}
      },
      ['map', 'globe', 'orthographic']
    );
    // geospatial override applies to the map preset
    expect(cases[0].viewState).toBe(viewState);
    // per-preset override wins
    expect(cases[1].viewState).toEqual({longitude: 1, latitude: 1, zoom: 3});
    // not applied to the cartesian preset
    expect(cases[2].viewState).toEqual(VIEW_PRESETS.orthographic.viewState);
  });

  test('expandViewMatrix#layers factory receives the preset', () => {
    const seen: string[] = [];
    const cases = expandViewMatrix(
      {
        name: 'x',
        layers: preset => {
          seen.push(preset.coordinateSystem);
          return [layer];
        }
      },
      ['map', 'globe', 'orthographic']
    );
    expect(seen).toEqual(['lnglat', 'lnglat', 'cartesian']);
    expect(cases[2].layers).toEqual([layer]);
  });

  test('expandViewMatrix#skip merging and overrides', () => {
    const cases = expandViewMatrix({
      name: 'x',
      layers: [],
      skip: ['webgpu'],
      imageDiffOptions: {threshold: 0.99},
      overrides: {globe: {skip: ['webgl'], imageDiffOptions: {threshold: 0.985}}}
    });
    expect(cases[0].skip).toEqual(['webgpu']);
    expect(cases[1].skip).toEqual(['webgpu', 'webgl']);
    expect(cases[0].imageDiffOptions).toEqual({threshold: 0.99});
    expect(cases[1].imageDiffOptions).toEqual({threshold: 0.985});
    expect(
      expandViewMatrix({name: 'x', layers: [], overrides: {globe: {skip: true}}})[1].skip
    ).toBe(true);
    expect(expandViewMatrix({name: 'x', layers: []})[0].skip).toBeUndefined();
  });

  test('expandViewMatrix#globe guard', () => {
    const highZoom = {longitude: 0, latitude: 0, zoom: 13};
    expect(() => expandViewMatrix({name: 'x', layers: [], viewState: highZoom})).toThrow(/globe/);
    expect(() =>
      expandViewMatrix({name: 'x', layers: [], viewState: {...highZoom, zoom: 12}})
    ).not.toThrow();
    // The guard does not apply to map-only expansions
    expect(() =>
      expandViewMatrix({name: 'x', layers: [], viewState: highZoom}, ['map'])
    ).not.toThrow();
  });
});
