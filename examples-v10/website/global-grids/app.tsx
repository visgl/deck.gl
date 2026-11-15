// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Map, useControl} from 'react-map-gl/maplibre';
import {MapLibreOverlay as DeckOverlay} from '@deck.gl/maplibre';
import {
  GeohashLayer,
  H3HexagonLayer,
  H3HexagonLayerProps,
  QuadkeyLayer,
  S2Layer,
  A5Layer
} from '@deck.gl/geo-layers';
import type {Device} from '@luma.gl/core';
import type {GlobeViewState} from '@deck.gl/core';
import {LANDCOVER_LEGEND} from './landcover-palette';

import {createRoot} from 'react-dom/client';
import {CSVLoader} from '@loaders.gl/tables/csv';

const INITIAL_VIEW_STATE: GlobeViewState = {longitude: 0, latitude: 0, zoom: 2};
type GridSystem = 'a5' | 'geohash' | 'h3' | 's2' | 'quadkey';

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/';
/** Cell and land-cover class read from a grid CSV row. */
type GridCell = {
  /** Grid cell identifier, including any leading zeros. */
  id: string;
  /** Index into the land-cover palette, read as text. */
  value: string;
};

const GRID_DATA_FILES: Record<GridSystem, string> = {
  a5: 'landcover-a5v1.csv',
  geohash: 'landcover-geohash.csv',
  h3: 'landcover-h3.csv',
  quadkey: 'landcover-quadkey.csv',
  s2: 'landcover-s2.csv'
};

export default function App({
  device,
  gridSystem,
  landcoverLegend
}: {
  device?: Device;
  gridSystem: GridSystem;
  landcoverLegend?: typeof LANDCOVER_LEGEND;
}) {
  const isWebGPU = device?.type === 'webgpu';
  const [loaded, setLoaded] = useState<GridSystem[]>([gridSystem]);
  if (!loaded.includes(gridSystem)) {
    setLoaded([...loaded, gridSystem]);
  }

  const legend = landcoverLegend ?? LANDCOVER_LEGEND;
  const visibleValues = legend.flatMap((item, index) =>
    item.selected !== false ? [`'${index}'`] : []
  );
  const query =
    visibleValues.length === legend.length
      ? undefined
      : `SELECT id, value WHERE value IN (${visibleValues.join(', ') || "''"})`;

  const commonLayerProps = {
    opacity: 0.8,
    filled: true,
    getFillColor: (d: GridCell) => LANDCOVER_LEGEND[Number(d.value)]?.color ?? [0, 0, 0],
    extruded: true,
    getElevation: 50000,
    beforeId: 'waterway_line_label',
    loaders: [CSVLoader],
    loadOptions: {csv: {shape: 'arrow-table', header: true, dynamicTyping: false}},
    query
  } as Omit<H3HexagonLayerProps<GridCell>, 'data' | 'id'> & {beforeId: string};

  const layers = [
    loaded.includes('a5') &&
      new A5Layer<GridCell>({
        id: 'a5-layer',
        // Sample row (id,value): fbba00000000000,15
        data: `${DATA_URL}${GRID_DATA_FILES.a5}`,
        visible: gridSystem === 'a5',
        getPentagon: {sql: 'id'},
        ...commonLayerProps
      }),
    loaded.includes('geohash') &&
      new GeohashLayer<GridCell>({
        id: 'geohash-layer',
        // Sample row (id,value): 0000,15
        data: `${DATA_URL}${GRID_DATA_FILES.geohash}`,
        visible: gridSystem === 'geohash',
        getGeohash: {sql: 'id'},
        ...commonLayerProps
      }),
    loaded.includes('h3') &&
      new H3HexagonLayer<GridCell>({
        id: 'h3-layer',
        // Sample row (id,value): 8400011ffffffff,15
        data: `${DATA_URL}${GRID_DATA_FILES.h3}`,
        visible: gridSystem === 'h3',
        getHexagon: {sql: 'id'},
        ...commonLayerProps
      }),
    loaded.includes('quadkey') &&
      new QuadkeyLayer<GridCell>({
        id: 'quadkey-layer',
        // Sample row (id,value): 011021211,15
        data: `${DATA_URL}${GRID_DATA_FILES.quadkey}`,
        visible: gridSystem === 'quadkey',
        getQuadkey: {sql: 'id'},
        ...commonLayerProps
      }),
    loaded.includes('s2') &&
      new S2Layer<GridCell>({
        id: 's2-layer',
        // Sample row (id,value): 00964,9
        data: `${DATA_URL}${GRID_DATA_FILES.s2}`,
        visible: gridSystem === 's2',
        getS2Token: {sql: 'id'},
        ...commonLayerProps
      })
  ];

  return (
    <div
      style={{
        position: 'absolute',
        height: '100%',
        width: '100%',
        top: 0,
        left: 0,
        background: 'linear-gradient(0, #000, #223)'
      }}
    >
      <Map
        reuseMaps
        projection="globe"
        // On WebGPU the deck canvas is overlaid in a MapLibre control slot, which is stacked above
        // the website's info panel unless the map is a stacking context of its own
        style={{isolation: 'isolate'}}
        id="map"
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://tiles.openfreemap.org/styles/positron"
        dragRotate={false}
        maxPitch={0}
      >
        <DeckGLOverlay key={device?.type} device={device} layers={layers} interleaved={!isWebGPU} />
      </Map>
    </div>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App gridSystem="h3" />);
}

function DeckGLOverlay(props) {
  const overlay = useControl(() => new DeckOverlay(props));
  overlay.setProps(props);
  return null;
}
