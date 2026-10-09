// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useCallback, useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {GridLayer} from '@deck.gl/aggregation-layers';
import {ScatterplotLayer} from '@deck.gl/layers';
import {DeckGL} from '@deck.gl/react';
import {CSVLoader} from '@loaders.gl/csv';
import {load} from '@loaders.gl/core';

import type {Color, Layer, MapViewState, PickingInfo} from '@deck.gl/core';
import type {GridLayerPickingInfo} from '@deck.gl/aggregation-layers';

// Street trees managed by the City of Paris, https://opendata.paris.fr
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/scatterplot/les-arbres.csv'; // eslint-disable-line

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: 2.345,
  latitude: 48.857,
  zoom: 11.5,
  minZoom: 9,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

/**
 * Grid cell sizes in meters, coarse to fine. Each size is half of the previous one, so every cell
 * splits into exactly four cells of the next band.
 * The finest band is bounded by GridLayer's GPU aggregation, which allocates one bin for every
 * cell within the data bounds: 16 m cells over Paris are ~1.4M bins.
 */
export const CELL_SIZES = [2048, 1024, 512, 256, 128, 64, 32, 16];

export const colorRange: Color[] = [
  [0, 104, 55],
  [49, 163, 84],
  [120, 198, 121],
  [173, 221, 142],
  [217, 240, 163],
  [255, 255, 204]
];

const TREE_COLOR: Color = [173, 221, 142];

/** Circumference of the earth in meters */
const EARTH_CIRCUMFERENCE = 40075016.686;

type Trees = {
  length: number;
  /**
   * Packed [longitude, latitude, 0] triplets.
   * Float64Array matches the 64-bit layout of `getPosition`, which GridLayer's GPU aggregation expects.
   */
  positions: Float64Array;
  species: string[];
  circumferences: Float32Array;
  /** Latitude at the center of the data bounds, used by GridLayer to convert cellSize to common space */
  latitude: number;
};

type ZoomStop = [zoom: number, value: number];

/**
 * Same semantics as the MapLibre expression `["interpolate", ["linear"], ["zoom"], z0, v0, z1, v1, ...]`:
 * linear between stops, clamped to the first and last value outside of them.
 */
export function interpolateZoom(zoom: number, stops: ZoomStop[]): number {
  if (zoom <= stops[0][0]) {
    return stops[0][1];
  }
  for (let i = 1; i < stops.length; i++) {
    const [z1, v1] = stops[i];
    if (zoom < z1) {
      const [z0, v0] = stops[i - 1];
      return v0 + ((v1 - v0) * (zoom - z0)) / (z1 - z0);
    }
  }
  return stops[stops.length - 1][1];
}

/** Zoom level at which a cell of `cellSize` meters is `cellPixels` wide on screen (512 px tiles) */
function getZoomForCellSize(cellSize: number, cellPixels: number, latitude: number): number {
  const metersPerPixelAtZoom0 = (EARTH_CIRCUMFERENCE * Math.cos((latitude * Math.PI) / 180)) / 512;
  return Math.log2((cellPixels * metersPerPixelAtZoom0) / cellSize);
}

/**
 * Opacity stops for each band: the grid bands followed by the raw points.
 * Band `i` hands over to band `i + 1` half a zoom level after the zoom where its cells are
 * `cellPixels` wide, crossfading over `fadeWidth` zoom levels.
 */
function getBandOpacityStops(
  cellPixels: number,
  fadeWidth: number,
  latitude: number
): ZoomStop[][] {
  const handoverZooms = CELL_SIZES.map(
    cellSize => getZoomForCellSize(cellSize, cellPixels, latitude) + 0.5
  );
  const halfFade = fadeWidth / 2;
  const bandCount = CELL_SIZES.length + 1;

  return Array.from({length: bandCount}, (_, band) => {
    const stops: ZoomStop[] = [];
    if (band > 0) {
      const fadeIn = handoverZooms[band - 1];
      stops.push([fadeIn - halfFade, 0], [fadeIn + halfFade, 1]);
    }
    if (band < bandCount - 1) {
      const fadeOut = handoverZooms[band];
      stops.push([fadeOut - halfFade, 1], [fadeOut + halfFade, 0]);
    }
    return stops;
  });
}

async function loadTrees(): Promise<Trees> {
  const rows = (await load(DATA_URL, CSVLoader)).data as {
    LIBELLEFRANCAIS: string;
    'CIRCONFERENCE(CM)': number;
    LATITUDE: number;
    LONGITUDE: number;
  }[];
  const trees = rows.filter(d => Number.isFinite(d.LONGITUDE) && Number.isFinite(d.LATITUDE));

  const positions = new Float64Array(trees.length * 3);
  const circumferences = new Float32Array(trees.length);
  let minLatitude = Infinity;
  let maxLatitude = -Infinity;
  trees.forEach((d, i) => {
    positions[i * 3] = d.LONGITUDE;
    positions[i * 3 + 1] = d.LATITUDE;
    circumferences[i] = d['CIRCONFERENCE(CM)'];
    minLatitude = Math.min(minLatitude, d.LATITUDE);
    maxLatitude = Math.max(maxLatitude, d.LATITUDE);
  });

  return {
    length: trees.length,
    positions,
    species: trees.map(d => d.LIBELLEFRANCAIS),
    circumferences,
    latitude: (minLatitude + maxLatitude) / 2
  };
}

export default function App({
  mapStyle = MAP_STYLE,
  cellPixels = 24,
  fadeWidth = 0.5,
  onDataLoad,
  onBandChange
}: {
  mapStyle?: string;
  /** Approximate on-screen width of grid cells, in pixels */
  cellPixels?: number;
  /** Width of each crossfade, in zoom levels (0-1) */
  fadeWidth?: number;
  onDataLoad?: (count: number) => void;
  onBandChange?: (band: string) => void;
}) {
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);
  const [trees, setTrees] = useState<Trees | null>(null);
  const onViewStateChange = useCallback(({viewState}) => setZoom(viewState.zoom), []);

  useEffect(() => {
    loadTrees()
      .then(result => {
        setTrees(result);
        onDataLoad?.(result.length);
      })
      .catch(console.error); // eslint-disable-line no-console
  }, []);

  // Keep `data` referentially stable, so that zooming never triggers re-aggregation.
  // Every layer reads the same typed array; each uploads its own GPU copy.
  const data = useMemo(
    () =>
      trees && {
        length: trees.length,
        attributes: {
          getPosition: {value: trees.positions, size: 3}
        }
      },
    [trees]
  );

  const opacityStops = useMemo(
    () =>
      getBandOpacityStops(cellPixels, fadeWidth, trees?.latitude ?? INITIAL_VIEW_STATE.latitude),
    [cellPixels, fadeWidth, trees]
  );
  const opacities = opacityStops.map(stops => interpolateZoom(zoom, stops));

  const activeBand = opacities.indexOf(Math.max(...opacities));
  const activeBandLabel =
    activeBand < CELL_SIZES.length ? `${CELL_SIZES[activeBand]} m cells` : 'Individual trees';
  useEffect(() => {
    onBandChange?.(activeBandLabel);
  }, [activeBandLabel]);

  const layers: Layer[] = [];
  if (data) {
    CELL_SIZES.forEach((cellSize, band) => {
      const opacity = opacities[band];
      layers.push(
        new GridLayer({
          id: `grid-${cellSize}m`,
          data,
          cellSize,
          gpuAggregation: true,
          extruded: false,
          coverage: 0.9,
          colorRange,
          colorScaleType: 'quantile',
          opacity,
          // Hidden layers keep their aggregation results
          visible: opacity > 0,
          // Layers are pickable at any opacity, so only pick the dominant band
          pickable: opacity >= 0.5,
          // Flat bands are drawn in order, finer on top
          parameters: {depthCompare: 'always'}
        })
      );
    });

    const opacity = opacities[CELL_SIZES.length];
    layers.push(
      new ScatterplotLayer({
        id: 'trees',
        data,
        radiusUnits: 'pixels',
        getRadius: 1,
        radiusScale: interpolateZoom(zoom, [
          [16, 2],
          [20, 6]
        ]),
        getFillColor: TREE_COLOR,
        opacity,
        visible: opacity > 0,
        pickable: opacity >= 0.5,
        parameters: {depthCompare: 'always'}
      })
    );
  }

  const getTooltip = useCallback(
    (info: PickingInfo) => {
      if (!trees || info.index < 0) {
        return null;
      }
      if (info.layer?.id === 'trees') {
        const circumference = trees.circumferences[info.index];
        return `${trees.species[info.index] || 'Unknown species'}\n${
          circumference ? `Circumference: ${circumference} cm` : ''
        }`;
      }
      const {object, layer} = info as GridLayerPickingInfo<unknown>;
      return (
        object && `${object.count} trees in this ${(layer as GridLayer).props.cellSize} m cell`
      );
    },
    [trees]
  );

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      onViewStateChange={onViewStateChange}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
