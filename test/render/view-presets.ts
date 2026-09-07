// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {
  MapView,
  OrthographicView,
  WebMercatorViewport,
  _GlobeView as GlobeView,
  _GlobeViewport as GlobeViewport
} from '@deck.gl/core';
import {WIDTH, HEIGHT} from './constants';
import type {TestCase} from './deck-test-utils';

/**
 * View matrix helper for render tests.
 *
 * Expands one test case into one `TestCase` per view preset so that the same layers (and
 * extensions) are rendered under MapView, GlobeView and OrthographicView. The 'map' preset keeps
 * the bare name and golden image so that existing goldens are reused; the other presets append
 * `-<preset>` to both (matching the existing `polygon-globe`, `path-globe`, `orthographic-64`
 * naming).
 *
 * Adding a non-flat projection: add a preset here, plus the flatten branch in the core `project`
 * shader module and `isFlatViewport()` in @deck.gl/extensions.
 */

export type ViewPresetName = 'map' | 'globe' | 'orthographic';

export type ViewPreset = {
  name: ViewPresetName;
  views: any;
  viewState: any;
  /** map/globe share lng/lat data; orthographic needs cartesian data (use toPosition/toBounds) */
  isGeospatial: boolean;
  coordinateSystem: 'lnglat' | 'cartesian';
  /** Map a lng/lat from the shared San Francisco test data into this preset's world space */
  toPosition: (lngLat: number[]) => number[];
  /** Same for `[minX, minY, maxX, maxY]` bounds (e.g. `clipBounds`) */
  toBounds: (bounds: [number, number, number, number]) => [number, number, number, number];
};

/** The San Francisco view used by collision-filter, mask-effect, polygon-lnglat and path-miter goldens */
export const SF_VIEW_STATE = {
  latitude: 37.751537058389985,
  longitude: -122.42694203247012,
  zoom: 11.5,
  pitch: 0,
  bearing: 0
};

const identity = <T>(value: T): T => value;

/** Pixel projection of the map preset; expresses the same picture in cartesian coordinates */
const sfPixelViewport = new WebMercatorViewport({...SF_VIEW_STATE, width: WIDTH, height: HEIGHT});

export const VIEW_PRESETS: Record<ViewPresetName, ViewPreset> = {
  map: {
    name: 'map',
    views: new MapView(),
    viewState: SF_VIEW_STATE,
    isGeospatial: true,
    coordinateSystem: 'lnglat',
    toPosition: identity,
    toBounds: identity
  },
  // Same lng/lat/zoom as the map preset. GlobeViewport scales by 2^(zoom - log2(PI * cos(lat))),
  // calibrated so that globe and Mercator framing converge at city zooms (see globe-viewport.ts),
  // so the picture matches the map golden up to the curvature of the sphere.
  globe: {
    name: 'globe',
    views: new GlobeView(),
    viewState: SF_VIEW_STATE,
    isGeospatial: true,
    coordinateSystem: 'lnglat',
    toPosition: identity,
    toBounds: identity
  },
  // Pixel space of the map preset. OrthographicView defaults to flipY: true (+y = screen down),
  // like viewport.project(), so target = canvas centre at zoom 0 reproduces the map framing.
  orthographic: {
    name: 'orthographic',
    views: new OrthographicView(),
    viewState: {target: [WIDTH / 2, HEIGHT / 2, 0], zoom: 0},
    isGeospatial: false,
    coordinateSystem: 'cartesian',
    toPosition: lngLat => sfPixelViewport.project(lngLat).slice(0, 2),
    toBounds: ([x0, y0, x1, y1]) => {
      const a = sfPixelViewport.project([x0, y0]);
      const b = sfPixelViewport.project([x1, y1]);
      return [
        Math.min(a[0], b[0]),
        Math.min(a[1], b[1]),
        Math.max(a[0], b[0]),
        Math.max(a[1], b[1])
      ];
    }
  }
};

export type ViewMatrixCase = Omit<TestCase, 'views' | 'viewState' | 'layers' | 'goldenImage'> & {
  /** Static layers (geospatial presets) or a factory receiving the preset (required for 'orthographic') */
  layers: any[] | ((preset: ViewPreset) => any[]);
  /** Geospatial viewState override for 'map' and 'globe', e.g. to keep a golden that uses a non-SF view */
  viewState?: any;
  /** Golden for 'map'; default `./test/render/golden-images/<name>.png`. Other presets append `-<preset>`. */
  goldenImage?: string;
  /** Per-preset overrides of any TestCase field; `skip` is merged with the base rather than replaced */
  overrides?: Partial<Record<ViewPresetName, Partial<TestCase>>>;
};

/** Expands one case into one `TestCase` per preset (default: map + globe). */
export function expandViewMatrix(
  base: ViewMatrixCase,
  presets: ViewPresetName[] = ['map', 'globe']
): TestCase[] {
  const {layers, viewState, goldenImage, overrides, ...rest} = base;
  const baseGolden = goldenImage ?? `./test/render/golden-images/${base.name}.png`;
  return presets.map(presetName => {
    const preset = VIEW_PRESETS[presetName];
    const suffix = presetName === 'map' ? '' : `-${presetName}`;
    const override: Partial<TestCase> = overrides?.[presetName] ?? {};
    const resolvedViewState =
      override.viewState ?? (preset.isGeospatial && viewState ? viewState : preset.viewState);
    assertUsesGlobeViewport(preset, resolvedViewState);
    return {
      ...rest,
      ...override,
      name: `${base.name}${suffix}`,
      views: preset.views,
      viewState: resolvedViewState,
      layers: typeof layers === 'function' ? layers(preset) : layers,
      skip: mergeSkip(rest.skip, override.skip),
      goldenImage: override.goldenImage ?? baseGolden.replace(/\.png$/, `${suffix}.png`)
    };
  });
}

/**
 * GlobeView instantiates a WebMercatorViewport above zoom 12 (GlobeView.getViewportType).
 * Refuse a 'globe' case that would silently test Mercator.
 */
function assertUsesGlobeViewport(preset: ViewPreset, viewState: any): void {
  if (preset.name === 'globe' && preset.views.getViewportType(viewState) !== GlobeViewport) {
    throw new Error(
      `view preset 'globe' resolves to a WebMercatorViewport at zoom ${viewState.zoom}; use zoom <= 12 or a plain map case`
    );
  }
}

function mergeSkip(a?: boolean | string[], b?: boolean | string[]): boolean | string[] | undefined {
  if (a === true || b === true) {
    return true;
  }
  const list = [...(Array.isArray(a) ? a : []), ...(Array.isArray(b) ? b : [])];
  return list.length ? list : undefined;
}
