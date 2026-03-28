// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import type {PickingInfo, OrthographicViewState, Color} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';
import {scaleOrdinal, hierarchy, treemap, treemapSquarify, format} from 'd3';
import type {HierarchyNode, HierarchyRectangularNode} from 'd3';

// Sample data
const DATA_URL =
  'https://raw.githubusercontent.com/d3/d3-hierarchy/refs/heads/main/test/data/flare.json';

const ColorScale = scaleOrdinal<string, Color>().range([
  [78, 121, 167],
  [242, 142, 44],
  [225, 87, 89],
  [118, 183, 178],
  [89, 161, 79],
  [237, 201, 73],
  [175, 122, 161],
  [255, 157, 167],
  [156, 117, 95],
  [186, 176, 171]
]);

type Datum = {
  name: string;
  value: number;
};

const formatValue = format(',d');

const WIDTH = 1000;
const HEIGHT = 1000;
const INITIAL_VIEW_STATE: OrthographicViewState = {
  target: [WIDTH / 2, HEIGHT / 2, 0],
  zoom: -1
};

export default function App({data}: {data?: HierarchyNode<Datum>}) {
  const layoutRoot = useMemo(() => {
    if (!data) return null;
    data.sort((a, b) => b.value! - a.value!);
    return treemap<Datum>().tile(treemapSquarify).size([WIDTH, HEIGHT]).padding(1)(data);
  }, [data]);

  const leaves = useMemo(() => layoutRoot?.leaves(), [layoutRoot]);

  const layers = [
    new TextLayer<HierarchyRectangularNode<Datum>>({
      id: 'labels-name',
      data: leaves,
      getPosition: d => [d.x0, d.y1],
      getText: d => d.data.name,
      getPixelOffset: [4, 0],
      getSize: 12,
      getColor: [255, 255, 255],
      getTextAnchor: 'start',
      getAlignmentBaseline: 'center',
      background: true,
      getBackgroundColor: d => {
        while (d.depth > 1) d = d.parent!;
        return ColorScale(d.data.name);
      },
      getContentBox: d => [0, d.y0 - d.y1, d.x1 - d.x0, d.y1 - d.y0],
      contentAlignHorizontal: 'start',
      contentAlignVertical: 'center',
      contentCutoffPixels: [60, 30]
    }),
    new TextLayer<HierarchyRectangularNode<Datum>>({
      id: 'labels-value',
      data: leaves,
      getPosition: d => [d.x0, d.y0],
      getText: d => formatValue(d.data.value),
      getPixelOffset: [4, 12],
      getSize: 10,
      getColor: [255, 255, 255, 200],
      getTextAnchor: 'start',
      getAlignmentBaseline: 'center',
      getContentBox: d => [0, 0, d.x1 - d.x0, d.y1 - d.y0],
      contentAlignHorizontal: 'start',
      contentAlignVertical: 'center',
      contentCutoffPixels: [60, 60]
    })
  ];

  return (
    <DeckGL
      layers={layers}
      views={new OrthographicView()}
      initialViewState={INITIAL_VIEW_STATE}
      controller
      getTooltip={getTooltip}
    />
  );
}

function getTooltip({object}: PickingInfo<HierarchyRectangularNode<Datum>>) {
  return object
    ? `\
  name: ${object
    .ancestors()
    .map(d => d.data.name)
    .reverse()
    .join('.')}
  value: ${formatValue(object.data.value)}
  `
    : null;
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const resp = await fetch(DATA_URL);
  const json = await resp.json();
  const data = hierarchy(json).sum(d => d.value);
  root.render(<App data={data} />);
}
