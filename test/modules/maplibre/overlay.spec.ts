// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {BitmapLayer, ScatterplotLayer, SolidPolygonLayer} from '@deck.gl/layers';
import {MapLibreOverlay} from '@deck.gl/maplibre';
import {device} from '@deck.gl/test-utils';
import {addMetersToLngLat} from '@math.gl/web-mercator';
import {
  Map as MapLibreV4Map,
  addProtocol as addProtocolV4,
  removeProtocol as removeProtocolV4
} from 'maplibre-gl-v4';
import {
  Map as MapLibreV5Map,
  addProtocol as addProtocolV5,
  removeProtocol as removeProtocolV5
} from 'maplibre-gl-v5';
import {
  Map as MapLibreV6Map,
  addProtocol as addProtocolV6,
  removeProtocol as removeProtocolV6
} from 'maplibre-gl-v6';
import {test, expect, vi} from 'vitest';

import {getMapLibreElevation} from '../../../modules/maplibre/src/compatibility';
import {getMapLibreViewState} from '../../../modules/maplibre/src/deck-utils';

import type {GeoJSONSource, Map as MapLibreMap} from 'maplibre-gl-v6';

const webglTest = device.type === 'webgl' ? test : test.skip;

function waitForRender(condition: () => boolean, update?: () => void): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    let animationFrame = 0;
    let finished = false;
    const timeout = setTimeout(() => {
      finished = true;
      cancelAnimationFrame(animationFrame);
      reject(new Error('MapLibre render timed out'));
    }, 5000);
    const check = () => {
      if (finished) {
        return;
      }
      if (condition()) {
        finished = true;
        clearTimeout(timeout);
        resolve();
      } else {
        animationFrame = requestAnimationFrame(check);
      }
    };
    update?.();
    check();
  });
}

/** Resolves on the next MapLibre event of the type */
function waitForMapEvent(map: MapLibreMap, type: 'load' | 'idle'): Promise<void> {
  return new Promise<void>(resolve => map.once(type, () => resolve()));
}

function readCenterPixel(gl: WebGL2RenderingContext): number[] {
  const pixel = new Uint8Array(4);
  gl.readPixels(
    Math.floor(gl.drawingBufferWidth / 2),
    Math.floor(gl.drawingBufferHeight / 2),
    1,
    1,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    pixel
  );
  return Array.from(pixel);
}

/** Returns the URL of a raster-dem tile of constant height, in the Mapbox Terrain-RGB encoding */
async function createDemTileURL(elevation: number): Promise<string> {
  const value = Math.round((elevation + 10000) * 10);
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const context = canvas.getContext('2d')!;
  context.fillStyle = `rgb(${value >> 16}, ${(value >> 8) & 255}, ${value & 255})`;
  context.fillRect(0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  return URL.createObjectURL(blob!);
}

/** Returns a square polygon around a location, with sides of `size` meters */
function getSquarePolygon(center: number[], size: number): [number, number][] {
  const half = size / 2;
  return [
    [-half, -half],
    [half, -half],
    [half, half],
    [-half, half],
    [-half, -half]
  ].map(offset => addMetersToLngLat(center, offset) as [number, number]);
}

/**
 * Renders a MapLibre frame and returns, for the red, green and blue channel, the centroid of the
 * pixels in that color only, weighted by intensity, in CSS pixels
 */
function readColorCentroids(map: MapLibreMap): Promise<({x: number; y: number} | null)[]> {
  return new Promise(resolve => {
    // Read before the frame is presented, the drawing buffer is not preserved
    map.once('render', () => {
      const canvas = map.getCanvas();
      const gl = canvas.getContext('webgl2')!;
      const {drawingBufferWidth: width, drawingBufferHeight: height} = gl;
      const pixels = new Uint8Array(width * height * 4);
      gl.readPixels(0, 0, width, height, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
      const scale = width / canvas.clientWidth;

      resolve(
        [0, 1, 2].map(channel => {
          let sumX = 0;
          let sumY = 0;
          let sumWeight = 0;
          for (let i = 0; i < pixels.length; i += 4) {
            const value = pixels[i + channel];
            const otherChannels = pixels[i] + pixels[i + 1] + pixels[i + 2] - value;
            if (value > 16 && otherChannels < 16) {
              const pixelIndex = i / 4;
              sumX += ((pixelIndex % width) + 0.5) * value;
              sumY += (height - Math.floor(pixelIndex / width) - 0.5) * value;
              sumWeight += value;
            }
          }
          return sumWeight ? {x: sumX / sumWeight / scale, y: sumY / sumWeight / scale} : null;
        })
      );
    });
    map.triggerRepaint();
  });
}

// Aliases in modules/maplibre/package.json pin the earliest supported release of each major.
// Add an alias, import, and entry here when supporting a new major.
const MAPLIBRE_VERSIONS = [
  {
    version: '4.5.1',
    MapClass: MapLibreV4Map,
    addProtocol: addProtocolV4,
    removeProtocol: removeProtocolV4
  },
  {
    version: '5.0.0',
    MapClass: MapLibreV5Map,
    addProtocol: addProtocolV5,
    removeProtocol: removeProtocolV5
  },
  {
    version: '6.0.0',
    MapClass: MapLibreV6Map,
    addProtocol: addProtocolV6,
    removeProtocol: removeProtocolV6
  }
];

test('MapLibreOverlay overlaid uses only public MapLibre APIs', () => {
  const container = document.createElement('div');
  Object.defineProperties(container, {
    clientWidth: {value: 800},
    clientHeight: {value: 600}
  });
  const map = {
    get transform(): never {
      throw new Error('MapLibre private API accessed: transform');
    },
    get painter(): never {
      throw new Error('MapLibre private API accessed: painter');
    },
    get style(): never {
      throw new Error('MapLibre private API accessed: style');
    },
    getCenter: () => ({lng: -122.45, lat: 37.78}),
    getZoom: () => 14,
    getBearing: () => 0,
    getPitch: () => 0,
    getPadding: () => ({left: 0, right: 0, top: 0, bottom: 0}),
    getRenderWorldCopies: () => true,
    getCenterElevation: () => 125,
    getProjection: () => {
      throw new Error('Style is not loaded');
    },
    getContainer: () => container,
    on() {},
    off() {}
  } as unknown as Parameters<MapLibreOverlay['onAdd']>[0];
  const overlay = new MapLibreOverlay({device, layers: []});

  overlay.onAdd(map);

  expect(overlay._deck).toBeTruthy();
  expect(overlay._deck!.props.viewState.position).toEqual([0, 0, 125]);
  expect(overlay._deck!.props.views.id).toBe('maplibre');

  overlay.onRemove(map);
  expect(overlay._deck).toBeFalsy();
});

test('MapLibreOverlay targets the terrain elevation like the MapLibre camera', () => {
  const TEST_CASES = [
    {projection: 'mercator', zoom: 10, position: [0, 0, 125]},
    // MapLibre's globe camera targets sea level, it transitions to Web Mercator from zoom 11 to 12
    {projection: 'globe', zoom: 10, position: [0, 0, 0]},
    {projection: 'globe', zoom: 11.5, position: [0, 0, 62.5]},
    {projection: 'globe', zoom: 12, position: [0, 0, 125]},
    {projection: 'globe', zoom: 13, position: [0, 0, 125]}
  ];

  for (const {projection, zoom, position} of TEST_CASES) {
    const map = {
      getCenter: () => ({lng: 13.47, lat: 48.57}),
      getZoom: () => zoom,
      getBearing: () => 0,
      getPitch: () => 60,
      getPadding: () => ({left: 0, right: 0, top: 0, bottom: 0}),
      getRenderWorldCopies: () => true,
      getCenterElevation: () => 125,
      getProjection: () => ({type: projection})
    } as unknown as Parameters<typeof getMapLibreViewState>[0];

    expect(getMapLibreViewState(map).position, `${projection} at zoom ${zoom}`).toEqual(position);
  }
});

for (const {version, MapClass} of MAPLIBRE_VERSIONS) {
  webglTest(`MapLibreOverlay renders with MapLibre ${version}`, async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {width: '400px', height: '300px'});
    document.body.append(container);

    const map = new MapClass({
      container,
      style: {
        version: 8,
        sources: {},
        layers: [{id: 'labels', type: 'background'}]
      },
      center: [-122.45, 37.78],
      zoom: 14,
      attributionControl: false
    }) as unknown as MapLibreMap;
    try {
      await new Promise<void>(resolve => map.once('load', () => resolve()));

      for (const interleaved of [false, true]) {
        map.jumpTo({center: [-122.45, 37.78], zoom: 14});
        let centerPixel: number[] = [];
        const image = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
        const bounds: [number, number, number, number] = [-122.46, 37.77, -122.44, 37.79];
        const overlay = new MapLibreOverlay({
          interleaved,
          device: interleaved ? undefined : device,
          onAfterRender: ({gl}) => {
            if (!gl || interleaved) {
              return;
            }
            const renderedPixel = readCenterPixel(gl);
            if (renderedPixel[0] === 255) {
              centerPixel = renderedPixel;
            }
          },
          layers: [
            new BitmapLayer({id: 'under-labels', image, bounds, beforeId: 'labels'}),
            new BitmapLayer({id: 'above-labels', image, bounds})
          ]
        });

        map.addControl(overlay);
        map.triggerRepaint();
        await waitForRender(() => {
          if (interleaved) {
            const renderedPixel = readCenterPixel(map.getCanvas().getContext('webgl2')!);
            if (renderedPixel[0] === 255) {
              centerPixel = renderedPixel;
            }
          }
          return Boolean(overlay._deck?.isInitialized && centerPixel[0] === 255);
        });

        expect(overlay._deck).toBeTruthy();
        expect(overlay.getCanvas() === map.getCanvas()).toBe(interleaved);
        if (interleaved) {
          expect(map.getLayersOrder()).toEqual([
            'deck-maplibre-layer-group-before:labels',
            'labels',
            'deck-maplibre-layer-group-last'
          ]);
        }

        expect(centerPixel).toEqual([255, 0, 0, 255]);

        map.jumpTo({center: [-122.4, 37.8], zoom: 12});
        map.triggerRepaint();
        await waitForRender(() => overlay._deck!.props.viewState.zoom === map.getZoom());

        const viewState = overlay._deck!.props.viewState;
        expect(viewState.longitude).toBeCloseTo(map.getCenter().lng);
        expect(viewState.latitude).toBeCloseTo(map.getCenter().lat);
        expect(viewState.zoom).toBe(map.getZoom());

        map.removeControl(overlay);
        expect(overlay._deck).toBeFalsy();
        if (!interleaved) {
          // MapLibre leaves removing the control element to the control
          expect(container.querySelector('.maplibregl-ctrl-top-left')?.childElementCount).toBe(0);
        }
      }
    } finally {
      map.remove();
      container.remove();
    }
  });
}

for (const {version, MapClass} of MAPLIBRE_VERSIONS) {
  webglTest(`MapLibreOverlay interleaved uses css-dpr with MapLibre ${version}`, async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {width: '400px', height: '300px'});
    document.body.append(container);

    const map = new MapClass({
      container,
      style: {version: 8, sources: {}, layers: []},
      center: [-122.45, 37.78],
      zoom: 14,
      attributionControl: false
    }) as unknown as MapLibreMap;

    try {
      await new Promise<void>(resolve => map.once('load', () => resolve()));

      const overlay = new MapLibreOverlay({
        interleaved: true,
        deviceProps: {id: 'maplibre-device', createCanvasContext: {id: 'maplibre-canvas'}},
        layers: []
      });
      map.addControl(overlay);
      await waitForRender(() => Boolean(overlay._deck?.isInitialized));

      const deck = overlay._deck!;
      expect(deck.props.deviceProps).toMatchObject({
        id: 'maplibre-device',
        createCanvasContext: {id: 'maplibre-canvas', pixelSizeSource: 'css-dpr'}
      });
      // Page zoom changes the CSS size of the shared canvas, not always its device pixel size
      expect(deck.device!.getDefaultCanvasContext().props).toMatchObject({
        id: 'maplibre-canvas',
        pixelSizeSource: 'css-dpr'
      });

      map.removeControl(overlay);
    } finally {
      map.remove();
      container.remove();
    }
  });
}

const TERRAIN_CASES = MAPLIBRE_VERSIONS.flatMap(({version, MapClass}) =>
  ['interleaved', 'overlaid'].map(mode => ({version, MapClass, mode}))
);

for (const {version, MapClass, mode} of TERRAIN_CASES) {
  webglTest(`MapLibreOverlay picks over terrain with MapLibre ${version} (${mode})`, async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {width: '400px', height: '300px'});
    document.body.append(container);
    const demTileURL = await createDemTileURL(1000);

    const summit: [number, number, number] = [8.5, 47.3, 1000];
    const map = new MapClass({
      container,
      style: {
        version: 8,
        sources: {dem: {type: 'raster-dem', tiles: [demTileURL], tileSize: 256, maxzoom: 12}},
        layers: []
      },
      center: [summit[0], summit[1]],
      zoom: 13,
      pitch: 60,
      attributionControl: false
    }) as unknown as MapLibreMap;

    try {
      await new Promise<void>(resolve => map.once('load', () => resolve()));

      const interleaved = mode === 'interleaved';
      const overlay = new MapLibreOverlay({
        interleaved,
        device: interleaved ? undefined : device,
        layers: [
          new ScatterplotLayer<[number, number, number]>({
            id: 'summit',
            data: [summit],
            getPosition: d => d,
            getRadius: 8,
            radiusUnits: 'pixels',
            pickable: true
          })
        ]
      });
      map.addControl(overlay);
      await waitForRender(() => Boolean(overlay._deck?.isInitialized));

      // MapLibre raises the center elevation as the terrain loads, without a move event
      map.setTerrain({source: 'dem'});
      await new Promise<void>(resolve => map.once('idle', () => resolve()));

      const elevation = getMapLibreElevation(map);
      expect(elevation).toBeCloseTo(1000);
      expect(overlay._deck!.props.viewState.position).toEqual([0, 0, elevation]);
      // In overlaid mode the shared test device's canvas is not sized by the map container
      const [x, y] = interleaved ? [200, 150] : overlay._deck!.getViewports()[0].project(summit);
      expect(overlay.pickObject({x, y})?.layer?.id).toBe('summit');
    } finally {
      map.remove();
      container.remove();
      URL.revokeObjectURL(demTileURL);
    }
  });
}

for (const {version, MapClass, addProtocol, removeProtocol} of MAPLIBRE_VERSIONS) {
  webglTest(
    `MapLibreOverlay inserts interleaved layer groups once MapLibre ${version} sources load`,
    async () => {
      const container = document.createElement('div');
      Object.assign(container.style, {width: '400px', height: '300px'});
      document.body.append(container);

      // Hold GeoJSON data requests open, so the style is parsed but
      // `map.isStyleLoaded()` stays false until the test releases them.
      let releaseData: () => void = () => {};
      let dataReleased = Promise.resolve();
      const holdData = () => {
        dataReleased = new Promise<void>(resolve => {
          releaseData = resolve;
        });
      };
      addProtocol('delayed', async () => {
        await dataReleased;
        return {data: {type: 'FeatureCollection', features: []}};
      });

      holdData();
      const map = new MapClass({
        container,
        style: {
          version: 8,
          sources: {points: {type: 'geojson', data: 'delayed://points'}},
          layers: [
            {id: 'points', type: 'circle', source: 'points'},
            {id: 'labels', type: 'background'}
          ]
        },
        center: [-122.45, 37.78],
        zoom: 14,
        attributionControl: false
      }) as unknown as MapLibreMap;

      const image = new ImageData(new Uint8ClampedArray([255, 0, 0, 255]), 1, 1);
      const bounds: [number, number, number, number] = [-122.46, 37.77, -122.44, 37.79];
      const overlay = new MapLibreOverlay({
        interleaved: true,
        layers: [new BitmapLayer({id: 'under-labels', image, bounds, beforeId: 'labels'})]
      });
      const waitForIdle = () => new Promise<void>(resolve => map.once('idle', () => resolve()));

      try {
        map.addControl(overlay);
        await new Promise<void>(resolve => map.once('styledata', () => resolve()));
        expect(map.isStyleLoaded()).toBe(false);

        let idle = waitForIdle();
        releaseData();
        await idle;

        expect(map.getLayersOrder()).toEqual([
          'points',
          'deck-maplibre-layer-group-before:labels',
          'labels'
        ]);

        // Layer changes made while a source reloads are applied once it finishes.
        const getLayersOrder = vi.spyOn(map, 'getLayersOrder');
        holdData();
        void map.getSource<GeoJSONSource>('points')!.setData('delayed://points-2');
        expect(map.isStyleLoaded()).toBe(false);
        overlay.setProps({
          layers: [new BitmapLayer({id: 'under-points', image, bounds, beforeId: 'points'})]
        });
        expect(getLayersOrder).not.toHaveBeenCalled();

        idle = waitForIdle();
        releaseData();
        await idle;

        expect(map.getLayersOrder()).toEqual([
          'deck-maplibre-layer-group-before:points',
          'points',
          'labels'
        ]);

        // Once resolved, later source updates do not reconcile layer groups again.
        getLayersOrder.mockClear();
        idle = waitForIdle();
        void map
          .getSource<GeoJSONSource>('points')!
          .setData({type: 'FeatureCollection', features: []});
        await idle;
        expect(getLayersOrder).not.toHaveBeenCalled();
      } finally {
        map.removeControl(overlay);
        map.remove();
        container.remove();
        removeProtocol('delayed');
      }
    }
  );
}

// MapLibre has a globe from 5.0. Its globe blends into Web Mercator from zoom 11 to 12, where
// map.project() does not follow the rendered camera, so this compares below and above the blend
for (const {version, MapClass} of MAPLIBRE_VERSIONS.slice(1)) {
  webglTest(`MapLibreOverlay matches the globe with terrain of MapLibre ${version}`, async () => {
    const container = document.createElement('div');
    Object.assign(container.style, {width: '400px', height: '300px'});
    document.body.append(container);
    const demTileURL = await createDemTileURL(1000);

    const center: [number, number] = [8.5, 47.3];
    const map = new MapClass({
      container,
      style: {
        version: 8,
        projection: {type: 'globe'},
        sources: {dem: {type: 'raster-dem', tiles: [demTileURL], tileSize: 256, maxzoom: 12}},
        layers: []
      },
      center,
      zoom: 10,
      pitch: 60,
      attributionControl: false
    }) as unknown as MapLibreMap;

    try {
      await waitForMapEvent(map, 'load');

      // Interleaved: an overlaid Deck keeps its own WebGL context after removal, and the tests share a
      // page with a limit on live contexts
      const overlay = new MapLibreOverlay({interleaved: true, layers: []});
      map.addControl(overlay);
      await waitForRender(() => Boolean(overlay._deck?.isInitialized));
      map.setTerrain({source: 'dem'});
      await waitForMapEvent(map, 'idle');

      for (const zoom of [10, 11, 12]) {
        map.jumpTo({zoom});
        // map.project() follows the new zoom only after MapLibre has rendered it
        await waitForMapEvent(map, 'idle');
        const viewport = overlay._deck!.getViewports()[0];
        for (const [dx, dy] of [
          [0, 0],
          [0.01, 0.005],
          [-0.01, -0.005]
        ]) {
          const lngLat: [number, number] = [center[0] + dx, center[1] + dy];
          const expected = map.project(lngLat);
          const [x, y] = viewport.project([lngLat[0], lngLat[1], 1000]);
          expect(
            Math.hypot(x - expected.x, y - expected.y),
            `[${lngLat}] at zoom ${zoom}`
          ).toBeLessThan(1);
        }
      }
    } finally {
      map.remove();
      container.remove();
      URL.revokeObjectURL(demTileURL);
    }
  });
}

// Maximum distance in pixels between the squares drawn by MapLibre and by deck.gl. In SwiftShader
// and on a GPU, they are within 0.6 px
const BLEND_ALIGNMENT_TOLERANCE = 1;

// Within the blend, this compares rendered pixels: squares that MapLibre drapes over the terrain and
// that deck.gl draws at the terrain's height, located by the centroids of their colors. SwiftShader,
// which runs these tests, computes sin and cos accurately only for small angles and moves globe
// shader output by several pixels elsewhere, so the squares are near longitude and latitude 0, off
// the tile corner there
for (const {version, MapClass} of MAPLIBRE_VERSIONS.slice(1)) {
  webglTest(
    `MapLibreOverlay draws on the globe with terrain of MapLibre ${version} in the blend`,
    async () => {
      const container = document.createElement('div');
      Object.assign(container.style, {width: '400px', height: '300px'});
      document.body.append(container);
      const demTileURL = await createDemTileURL(1000);

      const center: [number, number] = [0.02, 0.01];
      const markers = [
        {offset: [0, 0], color: [255, 0, 0]},
        {offset: [0.01, 0.005], color: [0, 255, 0]},
        {offset: [-0.01, -0.005], color: [0, 0, 255]}
      ].map(({offset, color}) => ({
        polygon: getSquarePolygon([center[0] + offset[0], center[1] + offset[1]], 400),
        color
      }));
      const map = new MapClass({
        container,
        style: {
          version: 8,
          projection: {type: 'globe'},
          sources: {
            dem: {type: 'raster-dem', tiles: [demTileURL], tileSize: 256, maxzoom: 12},
            markers: {
              type: 'geojson',
              data: {
                type: 'FeatureCollection',
                features: markers.map(({polygon, color}) => ({
                  type: 'Feature',
                  properties: {color: `rgb(${color})`},
                  geometry: {type: 'Polygon', coordinates: [polygon]}
                }))
              }
            }
          },
          layers: [
            {
              id: 'markers',
              type: 'fill',
              source: 'markers',
              paint: {'fill-color': ['get', 'color'], 'fill-antialias': false}
            }
          ]
        },
        center,
        zoom: 11,
        pitch: 60,
        attributionControl: false
      }) as unknown as MapLibreMap;

      const getMarkerLayer = (visible: boolean) =>
        new SolidPolygonLayer<(typeof markers)[number]>({
          id: 'markers',
          data: markers,
          getPolygon: d =>
            d.polygon.map(([longitude, latitude]): [number, number, number] => [
              longitude,
              latitude,
              1000
            ]),
          getFillColor: d => d.color as [number, number, number],
          // Drawn over the terrain at the same height
          parameters: {depthCompare: 'always', depthWriteEnabled: false},
          visible
        });

      try {
        await waitForMapEvent(map, 'load');
        const overlay = new MapLibreOverlay({interleaved: true, layers: [getMarkerLayer(false)]});
        map.addControl(overlay);
        await waitForRender(() => Boolean(overlay._deck?.isInitialized));
        map.setTerrain({source: 'dem'});
        await waitForMapEvent(map, 'idle');

        for (const zoom of [11.25, 11.5, 11.75]) {
          map.setLayoutProperty('markers', 'visibility', 'visible');
          overlay.setProps({layers: [getMarkerLayer(false)]});
          map.jumpTo({zoom});
          await waitForMapEvent(map, 'idle');
          const expected = await readColorCentroids(map);

          map.setLayoutProperty('markers', 'visibility', 'none');
          overlay.setProps({layers: [getMarkerLayer(true)]});
          await waitForMapEvent(map, 'idle');
          const actual = await readColorCentroids(map);

          for (let i = 0; i < markers.length; i++) {
            const a = actual[i];
            const b = expected[i];
            const alignmentError = a && b ? Math.hypot(a.x - b.x, a.y - b.y) : NaN;
            expect(alignmentError, `marker ${i} at zoom ${zoom}`).toBeLessThan(
              BLEND_ALIGNMENT_TOLERANCE
            );
          }
        }
      } finally {
        map.remove();
        container.remove();
        URL.revokeObjectURL(demTileURL);
      }
    }
  );
}
