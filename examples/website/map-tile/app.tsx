// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch, setTimeout */
import React, {useState, useCallback} from 'react';
import {createRoot} from 'react-dom/client';

import {DeckGL} from '@deck.gl/react';
import {_GlobeView as GlobeView} from '@deck.gl/core';
import {TerrainLayer} from '@deck.gl/geo-layers';
import {GeoJsonLayer} from '@deck.gl/layers';
import ZoomRangeWidget from './zoom-range-widget';

import type {GlobeViewState, PickingInfo, Position} from '@deck.gl/core';
import type {TerrainLayerProps, TileLayerRenderPlaceholderProps} from '@deck.gl/geo-layers';

const INITIAL_VIEW_STATE: GlobeViewState = {
  latitude: 34,
  longitude: -105,
  zoom: 2.2,
  maxZoom: 7
};

const ELEVATION_DATA = 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';
const SURFACE_IMAGE =
  'https://services.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}';

// https://github.com/tilezen/joerd/blob/master/docs/formats.md
const ELEVATION_DECODER: TerrainLayerProps['elevationDecoder'] = {
  rScaler: 256,
  gScaler: 1,
  bScaler: 1 / 256,
  offset: -32768
};

const PLACEHOLDER_FILL_COLOR: [number, number, number, number] = [236, 240, 239, 255];
const PLACEHOLDER_LINE_COLOR: [number, number, number, number] = [88, 103, 106, 255];
const PLACEHOLDER_GRID_ZOOM = 3;
const PLACEHOLDER_ELEVATION = -12000;

type TileBounds = [west: number, south: number, east: number, north: number];

type PlaceholderFeature = {
  type: 'Feature';
  properties: Record<string, never>;
  geometry: {
    type: 'Polygon';
    coordinates: Position[][];
  };
};

function getTooltip(info: PickingInfo) {
  if (info.picked && info.coordinate && info.coordinate.length === 3) {
    return `Elevation: ${info.coordinate[2].toFixed(0)} m`;
  }
  return null;
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function getTileLongitude(x: number, z: number): number {
  return (x / Math.pow(2, z)) * 360 - 180;
}

function getTileLatitude(y: number, z: number): number {
  const y2 = Math.PI - (2 * Math.PI * y) / Math.pow(2, z);
  return (Math.atan(Math.sinh(y2)) * 180) / Math.PI;
}

function getTileBounds({x, y, z}: {x: number; y: number; z: number}): TileBounds {
  const lastRow = Math.pow(2, z) - 1;
  return [
    getTileLongitude(x, z),
    y === lastRow ? -90 : getTileLatitude(y + 1, z),
    getTileLongitude(x + 1, z),
    y === 0 ? 90 : getTileLatitude(y, z)
  ];
}

function getTileBoundsFromArray(
  [west, south, east, north]: TileBounds,
  index: {y: number; z: number}
): TileBounds {
  const lastRow = Math.pow(2, index.z) - 1;
  return [west, index.y === lastRow ? -90 : south, east, index.y === 0 ? 90 : north];
}

function getPlaceholderFeature([west, south, east, north]: TileBounds): PlaceholderFeature {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [west, north],
          [east, north],
          [east, south],
          [west, south],
          [west, north]
        ].map(([longitude, latitude]) => [longitude, latitude, PLACEHOLDER_ELEVATION])
      ]
    }
  };
}

function getPlaceholderGridFeatures(): PlaceholderFeature[] {
  const tileCount = Math.pow(2, PLACEHOLDER_GRID_ZOOM);
  const features: PlaceholderFeature[] = [];

  for (let y = 0; y < tileCount; y++) {
    for (let x = 0; x < tileCount; x++) {
      features.push(getPlaceholderFeature(getTileBounds({x, y, z: PLACEHOLDER_GRID_ZOOM})));
    }
  }
  return features;
}

const PLACEHOLDER_GRID_FEATURES = getPlaceholderGridFeatures();

function getPlaceholderLayer(id: string, data: PlaceholderFeature | PlaceholderFeature[]) {
  return new GeoJsonLayer<PlaceholderFeature['properties']>({
    id,
    data,
    filled: true,
    stroked: true,
    getFillColor: PLACEHOLDER_FILL_COLOR,
    getLineColor: PLACEHOLDER_LINE_COLOR,
    lineWidthUnits: 'pixels',
    getLineWidth: 1,
    pickable: false
  });
}

const renderTerrainPlaceholder: NonNullable<TerrainLayerProps['renderPlaceholder']> = (
  props: TileLayerRenderPlaceholderProps
) => {
  return getPlaceholderLayer(
    `${props.id}-placeholder`,
    getPlaceholderFeature(getTileBoundsFromArray(props.bounds as TileBounds, props.tile.index))
  );
};

export default function App({
  showPlaceholders = true,
  loadDelay = 0,
  onTilesLoad,
  onZoomChange,
  minZoom = 0,
  maxZoom = 6,
  visibleMinZoom,
  visibleMaxZoom,
  showBorder = false
}: {
  showPlaceholders?: boolean;
  loadDelay?: number;
  onTilesLoad?: TerrainLayerProps['onViewportLoad'];
  onZoomChange?: (zoom: number) => void;
  minZoom?: number;
  maxZoom?: number;
  visibleMinZoom?: number;
  visibleMaxZoom?: number;
  showBorder?: boolean;
  useExtent?: boolean;
}) {
  const [zoom, setZoom] = useState(INITIAL_VIEW_STATE.zoom);
  const onViewStateChange = useCallback(
    ({viewState}) => {
      setZoom(viewState.zoom);
      onZoomChange?.(viewState.zoom);
    },
    [onZoomChange]
  );
  const loadOptions =
    loadDelay > 0
      ? {
          fetch: async (
            url: Parameters<typeof fetch>[0],
            options?: Parameters<typeof fetch>[1]
          ) => {
            await sleep(loadDelay);
            return fetch(url, options);
          }
        }
      : undefined;

  const terrainLayer = new TerrainLayer({
    id: 'terrain',
    minZoom,
    maxZoom,
    visibleMinZoom,
    visibleMaxZoom,
    tileSize: 512,
    maxRequests: 12,
    refinementStrategy: 'no-overlap',
    elevationData: ELEVATION_DATA,
    texture: SURFACE_IMAGE,
    elevationDecoder: ELEVATION_DECODER,
    meshMaxError: 12,
    wireframe: showBorder,
    color: [255, 255, 255],
    pickable: '3d',
    loadOptions,
    onViewportLoad: onTilesLoad,
    renderPlaceholder: showPlaceholders ? renderTerrainPlaceholder : undefined
  });

  const layers = [
    showPlaceholders && getPlaceholderLayer('placeholder-grid', PLACEHOLDER_GRID_FEATURES),
    terrainLayer
  ];

  return (
    <DeckGL
      layers={layers}
      views={new GlobeView()}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      parameters={{cull: true}}
      getTooltip={getTooltip}
      onViewStateChange={onViewStateChange}
    >
      <ZoomRangeWidget
        zoom={zoom}
        minZoom={minZoom}
        maxZoom={maxZoom}
        visibleMinZoom={visibleMinZoom}
        visibleMaxZoom={visibleMaxZoom}
      />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App loadDelay={750} />);
}
