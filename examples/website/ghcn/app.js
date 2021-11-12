import React from 'react';
import {useMemo} from 'react';

import {render} from 'react-dom';
import {OrthographicView} from '@deck.gl/core';
import {TextLayer, PathLayer} from '@deck.gl/layers';
import {SimpleMeshLayer} from '@deck.gl/mesh-layers';
import DeckGL from '@deck.gl/react';
import {Matrix4} from 'math.gl';

import {scaleLinear} from 'd3-scale';
import {sortData} from './sort-data';

// Data source
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/ghcn/ghcn-annual.json';

const CHART_WIDTH = 300;
const CHART_HEIGHT = 500;
const SPACING = 60;
const ROW_SIZE = 25;

const borderMesh = {
  positions: new Float32Array([0, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0])
};
const xScale = scaleLinear()
  .domain([1880, 2020]) // year
  .range([0, CHART_WIDTH]);
const xTicks = [1900, 2000];
const yScale = scaleLinear()
  .domain([-60, 35]) // temperature
  .range([CHART_HEIGHT, 0]);
const yTicks = [-60, -30, 0, 30];
export const colorScale = scaleLinear()
  .domain([-60, -10, 30]) // temperature
  .range([[80, 160, 225], [0, 80, 80], [255, 80, 80]]);

function getOffset(chartIndex) {
  const y = Math.floor(chartIndex / ROW_SIZE);
  const x = chartIndex % ROW_SIZE;
  return [x * (CHART_WIDTH + SPACING), y * (CHART_HEIGHT + SPACING), 0];
}

function getTooltip({object}) {
  return (
    object &&
    `\
  ${object.name}
  ${object.country}
  Latitude: ${Math.abs(object.latitude)}°${object.latitude >= 0 ? 'N' : 'S'},
  Altitude: ${object.altitude === null ? 'N/A' : object.altitude},
  Lowest: ${object.min[1]}°C in ${object.min[0]}
  Highest: ${object.max[1]}°C in ${object.max[0]}
  `
  );
}

export default function App({data, groupBy = 'Country'}) {
  const dataSlices = useMemo(() => sortData(data, groupBy), [data, groupBy]);

  const initialViewState = useMemo(
    () => {
      const centerX = (Math.min(dataSlices.length, ROW_SIZE) / 2) * (CHART_WIDTH + SPACING);
      const centerY = (Math.ceil(dataSlices.length / ROW_SIZE) / 2) * (CHART_HEIGHT + SPACING);
      return {
        target: [centerX, centerY, 0],
        zoom: -2,
        minZoom: -2
      };
    },
    [dataSlices.length]
  );

  const yLabels = useMemo(
    () =>
      dataSlices.flatMap((_, i) => {
        return yTicks.map(y => ({index: i, y}));
      }),
    [dataSlices.length]
  );
  const xLabels = useMemo(
    () =>
      dataSlices.flatMap((_, i) => {
        return xTicks.map(x => ({index: i, x}));
      }),
    [dataSlices.length]
  );

  const layers = [
    dataSlices.map(
      (slice, i) =>
        new PathLayer({
          id: slice.name,
          data: slice.stations,
          modelMatrix: new Matrix4().translate(getOffset(i)),
          getPath: d => d.meanTemp.map(p => [xScale(p[0]), yScale(p[1])]),
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
    new SimpleMeshLayer({
      id: 'border',
      data: dataSlices,
      mesh: borderMesh,
      getPosition: (d, {index}) => getOffset(index),
      getScale: [CHART_WIDTH, CHART_HEIGHT, 1],
      getColor: [255, 255, 255],
      wireframe: true
    }),
    new TextLayer({
      id: 'y-labels',
      data: yLabels,
      getPosition: d => {
        const offset = getOffset(d.index);
        return [-4 + offset[0], yScale(d.y) + offset[1]];
      },
      getText: d => String(d.y),
      getColor: [160, 160, 160],
      getSize: 14,
      sizeUnits: 'meters',
      sizeMaxPixels: 28,
      getTextAnchor: 'end'
    }),
    new TextLayer({
      id: 'x-labels',
      data: xLabels,
      getPosition: d => {
        const offset = getOffset(d.index);
        return [xScale(d.x) + offset[0], CHART_HEIGHT + offset[1] + 4];
      },
      getText: d => String(d.x),
      getColor: [160, 160, 160],
      getSize: 14,
      sizeUnits: 'meters',
      sizeMaxPixels: 28,
      getAlignmentBaseline: 'top'
    }),
    new TextLayer({
      id: 'title',
      data: dataSlices,
      getPosition: (d, {index}) => getOffset(index),
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

export function renderToDOM(container) {
  render(<App />, container);

  /* global fetch */
  fetch(DATA_URL)
    .then(resp => resp.json())
    .then(data => {
      render(<App data={data} />, container);
    });
}
