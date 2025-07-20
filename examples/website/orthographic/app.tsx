// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React from 'react';
import {useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {OrthographicView} from '@deck.gl/core';
import {TextLayer, PathLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import {DeckGL} from '@deck.gl/react';
import {Matrix4} from '@math.gl/core';
import {scaleLinear} from 'd3-scale';
import {minIndex, maxIndex} from 'd3-array';
import {sortData} from './sort-data';

import type {MeshAttributes} from '@loaders.gl/schema';
import type {Color, Position, OrthographicViewState, PickingInfo} from '@deck.gl/core';

// Data source
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/ghcn/ghcn-annual.json';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 500;
const SPACING = 60;
const ROW_SIZE = 25;

const borderMesh: MeshAttributes = {
  positions: {
    value: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0]),
    size: 3
  }
};

export type Station = {
  id: string;
  country: string;
  name: string;
  longitude: number;
  latitude: number;
  altitude: number;
  meanTemp: [year: number, temperature: number][];
};

export type StationGroup = {
  name: string;
  stations: Station[];
};

const xScale = scaleLinear()
  .domain([1880, 2020]) // year
  .range([0, CHART_WIDTH]);
const xTicks = [1900, 2000];
const yScale = scaleLinear()
  .domain([-60, 35]) // temperature
  .range([CHART_HEIGHT, 0]);
const yTicks = [-60, -30, 0, 30];
export const colorScale = scaleLinear<Color>()
  .domain([-60, -10, 30]) // temperature
  .range([
    [80, 160, 225],
    [0, 80, 80],
    [255, 80, 80]
  ]);

function getPlotOffset(plotIndex: number): [number, number, number] {
  const y = Math.floor(plotIndex / ROW_SIZE);
  const x = plotIndex % ROW_SIZE;
  return [x * (CHART_WIDTH + SPACING), y * (CHART_HEIGHT + SPACING), 0];
}

function getTooltip({object}: PickingInfo<Station>) {
  if (!object) return null;

  const {meanTemp, name, country, latitude, altitude} = object;
  const minYear = meanTemp[minIndex(meanTemp, d => d[1])];
  const maxYear = meanTemp[maxIndex(meanTemp, d => d[1])];

  return `\
  ${name}
  ${country}
  Latitude: ${Math.abs(latitude)}°${latitude >= 0 ? 'N' : 'S'}
  Altitude: ${altitude === null ? 'N/A' : altitude}
  Lowest: ${minYear[1]}°C in ${minYear[0]}
  Highest: ${maxYear[1]}°C in ${maxYear[0]}
  `;
}

export default function App({
  data,
  groupBy = 'Country'
}: {
  data?: Station[];
  groupBy?: 'Country' | 'Latitude';
}) {
  const plots: StationGroup[] = useMemo(() => sortData(data, groupBy), [data, groupBy]);

  const initialViewState: OrthographicViewState = useMemo(() => {
    const centerX = (Math.min(plots.length, ROW_SIZE) / 2) * (CHART_WIDTH + SPACING);
    const centerY = (Math.ceil(plots.length / ROW_SIZE) / 2) * (CHART_HEIGHT + SPACING);
    return {
      target: [centerX, centerY, 0],
      zoom: -2,
      minZoom: -2
    };
  }, [plots.length]);

  const yLabels = useMemo(
    () =>
      plots.flatMap((_, i) => {
        return yTicks.map(y => ({plotIndex: i, y}));
      }),
    [plots.length]
  );
  const xLabels = useMemo(
    () =>
      plots.flatMap((_, i) => {
        return xTicks.map(x => ({plotIndex: i, x}));
      }),
    [plots.length]
  );

  const layers = [
    plots.map(
      (slice: StationGroup, i: number) =>
        new PathLayer<Station>({
          id: slice.name,
          data: slice.stations,
          modelMatrix: new Matrix4().translate(getPlotOffset(i)),
          getPath: d => d.meanTemp.map(p => [xScale(p[0]), yScale(p[1])] as Position),
          getColor: d => d.meanTemp.map(p => colorScale(p[1])),
          getWidth: 1,
          widthMinPixels: 1,
          widthMaxPixels: 2,
          opacity: 0.6,
          pickable: true,
          autoHighlight: true,
          highlightColor: [255, 200, 0, 255]
        })
    ),
    new SimpleMeshLayer<StationGroup>({
      id: 'border',
      data: plots,
      mesh: borderMesh,
      getPosition: (d, {index}) => getPlotOffset(index),
      getScale: [CHART_WIDTH, CHART_HEIGHT, 1],
      getColor: [255, 255, 255],
      wireframe: true
    }),
    new TextLayer<{plotIndex: number; y: number}>({
      id: 'y-labels',
      data: yLabels,
      getPosition: d => {
        const offset = getPlotOffset(d.plotIndex);
        return [-4 + offset[0], yScale(d.y) + offset[1]];
      },
      getText: d => String(d.y),
      getColor: [160, 160, 160],
      getSize: 14,
      sizeUnits: 'meters',
      sizeMaxPixels: 28,
      getTextAnchor: 'end'
    }),
    new TextLayer<{plotIndex: number; x: number}>({
      id: 'x-labels',
      data: xLabels,
      getPosition: d => {
        const offset = getPlotOffset(d.plotIndex);
        return [xScale(d.x) + offset[0], CHART_HEIGHT + offset[1] + 4];
      },
      getText: d => String(d.x),
      getColor: [160, 160, 160],
      getSize: 14,
      sizeUnits: 'meters',
      sizeMaxPixels: 28,
      getAlignmentBaseline: 'top'
    }),
    new TextLayer<StationGroup>({
      id: 'title',
      data: plots,
      getPosition: (d, {index}) => getPlotOffset(index),
      getText: d => d.name,
      getSize: 16,
      sizeUnits: 'meters',
      sizeMaxPixels: 32,
      wordBreak: 'break-word',
      maxWidth: CHART_WIDTH * 4,
      getTextAnchor: 'start',
      getAlignmentBaseline: 'bottom',
      getColor: [255, 255, 255]
    })
  ];

  return (
    <DeckGL
      views={new OrthographicView()}
      initialViewState={initialViewState}
      controller={true}
      layers={layers}
      getTooltip={getTooltip}
    />
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  /* global fetch */
  const resp = await fetch(DATA_URL);
  const data = await resp.json();
  root.render(<App data={data} />);
}
