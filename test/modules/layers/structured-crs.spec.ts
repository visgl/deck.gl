// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect, vi} from 'vitest';
import {LayerManager, WebMercatorViewport, _GlobeViewport as GlobeViewport} from '@deck.gl/core';
import {projectBoundsToFlatCommon} from '@deck.gl/extensions/utils/projection-utils';
import {PathLayer, SolidPolygonLayer, ScatterplotLayer} from '@deck.gl/layers';
import {HeatmapLayer} from '@deck.gl/aggregation-layers';
import {PathStyleExtension, Fp64Extension} from '@deck.gl/extensions';
import {device} from '@deck.gl/test-utils/vitest';
import {resolveCRS} from '@deck.gl/core/utils/crs';
import {normalizeCoordinateSystem} from '@deck.gl/geo-layers/tile-3d-layer/tile-3d-layer';
import {Matrix4} from '@math.gl/core';

const geographicCRS = {
  type: 'GeographicCRS',
  name: 'WGS 84',
  datum: {
    type: 'GeodeticReferenceFrame',
    name: 'World Geodetic System 1984',
    ellipsoid: {name: 'WGS 84', semi_major_axis: 6378137, inverse_flattening: 298.257223563}
  },
  coordinate_system: {
    subtype: 'ellipsoidal',
    axis: [
      {name: 'Longitude', abbreviation: 'lon', direction: 'east', unit: 'degree'},
      {name: 'Latitude', abbreviation: 'lat', direction: 'north', unit: 'degree'}
    ]
  }
} as const;

function createManager(
  viewport: import('@deck.gl/core').Viewport = new WebMercatorViewport({
    longitude: -122.45,
    latitude: 37.78,
    zoom: 14
  })
) {
  const manager = new LayerManager(device, {viewport});
  manager.setProps({
    onError: error => {
      throw error;
    }
  });
  return manager;
}

for (const LayerType of [PathLayer, SolidPolygonLayer]) {
  test(`${LayerType.layerName} retains geometry for equivalent structured CRS`, async () => {
    await resolveCRS(geographicCRS);
    const manager = createManager();
    const geometry = [
      [-122.45, 37.78],
      [-122.44, 37.78],
      [-122.44, 37.79]
    ];
    let layer = new LayerType({
      data: [geometry],
      coordinateSystem: geographicCRS,
      getPath: d => d,
      getPolygon: d => d,
      extensions: LayerType === PathLayer ? [new PathStyleExtension({highPrecisionDash: true})] : []
    });
    try {
      manager.setLayers([layer]);
      const tesselator = layer.state.pathTesselator || layer.state.polygonTesselator;
      const updateGeometry = vi.spyOn(tesselator, 'updateGeometry');
      const metrics = layer.getAttributeManager()!.getAttributes().instanceDashOffsets;
      const updateMetrics = metrics && vi.spyOn(metrics.settings, 'update');
      layer = layer.clone({coordinateSystem: structuredClone(geographicCRS)});
      manager.setLayers([layer]);
      expect(updateGeometry).not.toHaveBeenCalled();
      if (updateMetrics) expect(updateMetrics).not.toHaveBeenCalled();

      const changed = {...geographicCRS, name: 'Changed CRS definition'};
      await resolveCRS(changed);
      layer = layer.clone({coordinateSystem: changed});
      manager.setLayers([layer]);
      expect(updateGeometry).toHaveBeenCalledOnce();
      if (updateMetrics) expect(updateMetrics).toHaveBeenCalled();
    } finally {
      manager.finalize();
      vi.restoreAllMocks();
    }
  });
}

test.each([8, 14])('Path dash metrics match WGS84 aliases and PROJJSON at zoom %s', async zoom => {
  await resolveCRS(geographicCRS);
  const viewport = new WebMercatorViewport({longitude: -122.45, latitude: 37.78, zoom});
  const manager = createManager(viewport);
  try {
    const layers = ['lnglat', 'EPSG:4326', geographicCRS].map(
      (coordinateSystem, index) =>
        new PathLayer({
          id: `dash-crs-${index}`,
          coordinateSystem,
          data: [
            [
              [0, 0, 0],
              [0.01, 0.05, 1000],
              [0.02, 1, 0]
            ]
          ],
          getPath: d => d,
          modelMatrix: new Matrix4().translate([-122.45, 37.78, 0]),
          coordinateOrigin: [0.001, 0.002, 0],
          extensions: [new PathStyleExtension({highPrecisionDash: true})]
        })
    );
    manager.setLayers(layers);
    const readMetrics = layer =>
      Array.from(layer.getAttributeManager().getAttributes().instanceDashOffsets.value).slice(
        0,
        layer.state.pathTesselator.instanceCount * 2
      );
    const reference = readMetrics(layers[0]);
    for (const layer of layers.slice(1)) {
      const metrics = readMetrics(layer);
      expect(metrics.length).toBe(reference.length);
      metrics.forEach((value, index) => expect(value).toBeCloseTo(reference[index], 5));
    }
    const panned = new WebMercatorViewport({longitude: -122.45, latitude: 38, zoom});
    for (const layer of layers) layer.activateViewport(panned);
    manager.updateLayers();
    const pannedReference = readMetrics(layers[0]);
    for (const layer of layers.slice(1)) {
      readMetrics(layer).forEach((value, index) =>
        expect(value).toBeCloseTo(pannedReference[index], 5)
      );
    }
  } finally {
    manager.finalize();
  }
});

test('Heatmap bounds match WGS84 aliases and PROJJSON', async () => {
  await resolveCRS(geographicCRS);
  const manager = createManager(new WebMercatorViewport({width: 800, height: 600, zoom: 0}));
  try {
    const layers = ['lnglat', 'EPSG:4326', geographicCRS].map(
      (coordinateSystem, index) =>
        new HeatmapLayer({
          id: `heatmap-crs-${index}`,
          coordinateSystem,
          data: [[10, 20]],
          getPosition: d => d,
          weightsTextureSize: 128
        })
    );
    manager.setLayers(layers);
    for (const layer of layers.slice(1)) {
      expect(layer.state.worldBounds).toEqual(layers[0].state.worldBounds);
      expect(layer.state.normalizedCommonBounds).toEqual(layers[0].state.normalizedCommonBounds);
    }
  } finally {
    manager.finalize();
  }
});

test('Fp64 accepts WGS84 aliases and structured definitions', async () => {
  await resolveCRS(geographicCRS);
  const manager = createManager();
  try {
    const layers = ['EPSG:4326', geographicCRS].map(
      (coordinateSystem, index) =>
        new ScatterplotLayer({
          id: `fp64-crs-${index}`,
          coordinateSystem,
          data: [[-122.45, 37.78]],
          getPosition: d => d,
          extensions: [new Fp64Extension()]
        })
    );
    manager.setLayers(layers);
    for (const layer of layers) expect(layer.getModels()).toHaveLength(1);
  } finally {
    manager.finalize();
  }
});

test('Tile3D preserves structured CRS definitions for sublayers', () => {
  expect(normalizeCoordinateSystem(geographicCRS)).toBe(geographicCRS);
});

test.each([
  new WebMercatorViewport({longitude: 180, latitude: 0, zoom: 4}),
  new GlobeViewport({longitude: 180, latitude: 0, zoom: 4})
])('Antimeridian bounds use geographic CRS metadata', async viewport => {
  await resolveCRS(geographicCRS);
  const manager = createManager(viewport);
  try {
    for (const coordinateSystem of ['lnglat', 'EPSG:4326', geographicCRS]) {
      const layer = new ScatterplotLayer({coordinateSystem, data: []});
      manager.setLayers([layer]);
      const bounds = projectBoundsToFlatCommon(layer, [170, -20, -170, 20]);
      expect(bounds[2] - bounds[0]).toBeCloseTo((512 * 20) / 360, 10);
    }
  } finally {
    manager.finalize();
  }
});
