// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useState} from 'react';
import 'maplibre-gl/dist/maplibre-gl.css';
import {Map, useControl} from 'react-map-gl/maplibre';
import {MapboxOverlay as DeckOverlay} from '@deck.gl/mapbox';
import {
  GeohashLayer,
  H3HexagonLayer,
  H3HexagonLayerProps,
  QuadkeyLayer,
  S2Layer,
  A5Layer
} from '@deck.gl/geo-layers';
import {DataFilterExtension} from '@deck.gl/extensions';
import type {GlobeViewState} from '@deck.gl/core';
import {LANDCOVER_LEGEND} from './landcover-palette';

import {createRoot} from 'react-dom/client';
import {CSVLoader} from '@loaders.gl/csv';

const INITIAL_VIEW_STATE: GlobeViewState = {longitude: 0, latitude: 0, zoom: 2};
type GridCell = {id: string; value: number};
type GridSystem = 'a5' | 'geohash' | 'h3' | 's2' | 'quadkey';

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/';

export default function App({
  gridSystem,
  landcoverLegend
}: {
  gridSystem: GridSystem;
  landcoverLegend?: any[];
}) {
  const [loaded, setLoaded] = useState<GridSystem[]>([gridSystem]);
  if (!loaded.includes(gridSystem)) {
    setLoaded([...loaded, gridSystem]);
  }

  // Use legend state to determine which landcover types are visible
  const activeLegend = landcoverLegend || LANDCOVER_LEGEND;
  const filterCategories = activeLegend
    .map((item, index) => (item.selected !== false ? index : null))
    .filter(index => index !== null);

  const commonLayerProps = {
    opacity: 0.8,
    filled: true,
    getFillColor: (d: GridCell) => LANDCOVER_LEGEND[d.value].color || [0, 0, 0],
    getFilterCategory: (d: GridCell) => d.value,
    filterCategories,
    extensions: [new DataFilterExtension({categorySize: 1})],
    extruded: true,
    getElevation: 50000,
    beforeId: 'watername_ocean',
    loaders: [CSVLoader],
    loadOptions: {csv: {header: true, dynamicTyping: false}}
  } as Omit<H3HexagonLayerProps<GridCell>, 'data' | 'id'> & {beforeId: string};

  const layers = [
    loaded.includes('a5') &&
      new A5Layer<GridCell>({
        id: 'a5-layer',
        data: `${DATA_URL}landcover-a5.csv`,
        visible: gridSystem === 'a5',
        getPentagon: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('geohash') &&
      new GeohashLayer<GridCell>({
        id: 'geohash-layer',
        data: `${DATA_URL}landcover-geohash.csv`,
        visible: gridSystem === 'geohash',
        getGeohash: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('h3') &&
      new H3HexagonLayer<GridCell>({
        id: 'h3-layer',
        data: `${DATA_URL}landcover-h3.csv`,
        visible: gridSystem === 'h3',
        getHexagon: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('quadkey') &&
      new QuadkeyLayer<GridCell>({
        id: 'quadkey-layer',
        data: `${DATA_URL}landcover-quadkey.csv`,
        visible: gridSystem === 'quadkey',
        getQuadkey: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('s2') &&
      new S2Layer<GridCell>({
        id: 's2-layer',
        data: `${DATA_URL}landcover-s2.csv`,
        visible: gridSystem === 's2',
        getS2Token: (d: GridCell) => d.id,
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
        id="map"
        initialViewState={INITIAL_VIEW_STATE}
        mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
        dragRotate={false}
        maxPitch={0}
      >
        <DeckGLOverlay layers={layers} interleaved />
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
