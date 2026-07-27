// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useEffect, useMemo, useState} from 'react';
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
import type {Device} from '@luma.gl/core';
import {log, type GlobeViewState} from '@deck.gl/core';
import {filterGridCells, normalizeGridCells, type GridCell} from './grid-data';
import {LANDCOVER_LEGEND} from './landcover-palette';

import {createRoot} from 'react-dom/client';
import {CSVLoader} from '@loaders.gl/csv';

const INITIAL_VIEW_STATE: GlobeViewState = {longitude: 0, latitude: 0, zoom: 2};
type GridSystem = 'a5' | 'geohash' | 'h3' | 's2' | 'quadkey';

const DATA_URL = 'https://raw.githubusercontent.com/visgl/deck.gl-data/master/website/';
const EMPTY_GRID_CELLS: GridCell[] = [];

export default function App({
  device,
  gridSystem,
  landcoverLegend
}: {
  device?: Device;
  gridSystem: GridSystem;
  landcoverLegend?: any[];
}) {
  const isWebGPU = device?.type === 'webgpu';
  const [loaded, setLoaded] = useState<GridSystem[]>([gridSystem]);
  const [resolvedGridData, setResolvedGridData] = useState<Partial<Record<GridSystem, GridCell[]>>>(
    {}
  );
  if (!loaded.includes(gridSystem)) {
    setLoaded([...loaded, gridSystem]);
  }

  // Use legend state to determine which landcover types are visible
  const activeLegend = landcoverLegend || LANDCOVER_LEGEND;
  const filterCategories = useMemo(
    () =>
      activeLegend
        .map((item, index) => (item.selected !== false ? index : null))
        .filter((index): index is number => index !== null),
    [activeLegend]
  );

  useEffect(() => {
    if (!isWebGPU) {
      return undefined;
    }

    const pendingSystems = loaded.filter(system => !resolvedGridData[system]);
    if (pendingSystems.length === 0) {
      return undefined;
    }

    const abortController = new AbortController();

    Promise.all(
      pendingSystems.map(async system => {
        const response = await fetch(`${DATA_URL}landcover-${system}.csv`, {
          signal: abortController.signal
        });
        if (!response.ok) {
          throw new Error(`Failed to load ${system} grid data: ${response.status}`);
        }

        const table = await CSVLoader.parseText(await response.text(), {
          csv: {shape: 'object-row-table', dynamicTyping: false}
        });
        if (table.shape !== 'object-row-table') {
          throw new Error(`Expected ${system} grid data to contain object rows`);
        }

        return [system, normalizeGridCells(table)] as const;
      })
    )
      .then(results => {
        if (!abortController.signal.aborted) {
          setResolvedGridData(previous => ({...previous, ...Object.fromEntries(results)}));
        }
      })
      .catch(error => {
        if (!abortController.signal.aborted) {
          log.error('Failed to load global grid data', error)();
        }
      });

    return () => abortController.abort();
  }, [isWebGPU, loaded, resolvedGridData]);

  const filteredGridData = useMemo(
    () =>
      Object.fromEntries(
        loaded.flatMap(system => {
          const cells = resolvedGridData[system];
          return cells ? [[system, filterGridCells(cells, filterCategories)]] : [];
        })
      ) as Partial<Record<GridSystem, GridCell[]>>,
    [filterCategories, loaded, resolvedGridData]
  );

  const getGridData = (system: GridSystem): string | GridCell[] =>
    isWebGPU ? filteredGridData[system] || EMPTY_GRID_CELLS : `${DATA_URL}landcover-${system}.csv`;

  const commonLayerProps = {
    opacity: 0.8,
    filled: true,
    getFillColor: (d: GridCell) => LANDCOVER_LEGEND[d.value].color || [0, 0, 0],
    ...(isWebGPU
      ? {}
      : {
          getFilterCategory: (cell: GridCell) => cell.value,
          filterCategories,
          extensions: [new DataFilterExtension({categorySize: 1})]
        }),
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
        data: getGridData('a5'),
        visible: gridSystem === 'a5',
        getPentagon: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('geohash') &&
      new GeohashLayer<GridCell>({
        id: 'geohash-layer',
        data: getGridData('geohash'),
        visible: gridSystem === 'geohash',
        getGeohash: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('h3') &&
      new H3HexagonLayer<GridCell>({
        id: 'h3-layer',
        data: getGridData('h3'),
        visible: gridSystem === 'h3',
        getHexagon: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('quadkey') &&
      new QuadkeyLayer<GridCell>({
        id: 'quadkey-layer',
        data: getGridData('quadkey'),
        visible: gridSystem === 'quadkey',
        getQuadkey: (d: GridCell) => d.id,
        ...commonLayerProps
      }),
    loaded.includes('s2') &&
      new S2Layer<GridCell>({
        id: 's2-layer',
        data: getGridData('s2'),
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
