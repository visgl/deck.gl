// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import React, {useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {DeckGL} from '@deck.gl/react';
import {OrthographicView} from '@deck.gl/core';
import type {PickingInfo, Color} from '@deck.gl/core';
import {TextLayer} from '@deck.gl/layers';
import {scaleOrdinal} from 'd3-scale';
import {
  hierarchy,
  treemap,
  treemapSquarify,
  type HierarchyNode,
  type HierarchyRectangularNode
} from 'd3-hierarchy';
import {format} from 'd3-format';

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

export type Datum = {
  id: string;
  name: string;
};

const formatValue = format(',d');

const INITIAL_VIEW_STATE = {
  target: [0, 0],
  zoom: -2,
  maxZoom: 1
} as const;
const FONT_FAMILY = 'Arial, Helvetica, sans-serif';
const HEADER_SIZE = 20;
const GAP_SIZE = 1;

export default function App({
  data,
  width = 800,
  height = 800
}: {
  data?: HierarchyNode<Datum>;
  width?: number;
  height?: number;
}) {
  const boundingBox = useMemo(
    () => [
      [-100, -100],
      [width + 100, height + 100]
    ],
    [width, height]
  );

  const layoutRoot = useMemo(() => {
    if (!data) return null;
    data.sort((a, b) => b.value! - a.value!);
    return treemap<Datum>()
      .tile(treemapSquarify)
      .size([width, height])
      .paddingTop(HEADER_SIZE)
      .paddingInner(GAP_SIZE)(data);
  }, [data, width, height]);

  const parents = useMemo(
    () => layoutRoot?.descendants().filter(n => n.children && n.depth > 0),
    [layoutRoot]
  );
  const leaves = useMemo(() => layoutRoot?.leaves(), [layoutRoot]);

  const layers = [
    new TextLayer<HierarchyRectangularNode<Datum>>({
      id: 'group-headers',
      data: parents,
      pickable: true,
      fontFamily: FONT_FAMILY,
      fontWeight: 700,
      getPosition: d => [d.x0, d.y0],
      getText: d => d.data.name,
      getPixelOffset: [0, 0],
      getSize: d => 14 - d.depth,
      sizeMinPixels: 12,
      sizeUnits: 'common',
      getColor: d => {
        while (d.depth > 1) d = d.parent!;
        return ColorScale(d.data.id);
      },
      getTextAnchor: 'start',
      getAlignmentBaseline: 'top',
      getContentBox: d => {
        const firstLeaf = d.leaves()[0];
        const h = firstLeaf.y0 - d.y0;
        /*
         * There is some space on top/bottom from the character's strokes to the font's bounding box
         * so we can afford to make the height a little bigger
         * increase this value to shows the header more aggressively in low zoom
         */
        const vPadding = 10;
        return [0, -vPadding, d.x1 - d.x0, h + vPadding * 2];
      },
      contentAlignHorizontal: 'start',
      contentCutoffPixels: [40, 0]
    }),
    new TextLayer<HierarchyRectangularNode<Datum>>({
      id: 'labels-name',
      data: leaves,
      pickable: true,
      fontFamily: FONT_FAMILY,
      getPosition: d => [d.x0, d.y0],
      getText: d => d.data.name,
      getPixelOffset: [4, 4],
      getSize: 12,
      getColor: [255, 255, 255],
      getTextAnchor: 'start',
      getAlignmentBaseline: 'top',
      background: true,
      getBackgroundColor: d => {
        if (d.children) return [0, 0, 0, 0];
        while (d.depth > 1) d = d.parent!;
        return ColorScale(d.data.id);
      },
      getContentBox: d => [0, 0, d.x1 - d.x0, d.y1 - d.y0],
      contentAlignHorizontal: 'start',
      contentAlignVertical: 'start',
      contentCutoffPixels: [40, 20]
    }),
    new TextLayer<HierarchyRectangularNode<Datum>>({
      id: 'labels-value',
      data: leaves,
      fontFamily: FONT_FAMILY,
      getPosition: d => [d.x0, d.y0],
      getText: d => formatValue(d.value),
      getPixelOffset: [4, 16],
      getSize: 10,
      getColor: [255, 255, 255],
      getTextAnchor: 'start',
      getAlignmentBaseline: 'top',
      opacity: 0.7,

      getContentBox: d => [0, 0, d.x1 - d.x0, d.y1 - d.y0],
      contentAlignHorizontal: 'start',
      contentAlignVertical: 'start',
      contentCutoffPixels: [40, 36]
    })
  ];

  return (
    <DeckGL
      layers={layers}
      views={new OrthographicView()}
      initialViewState={INITIAL_VIEW_STATE}
      controller={{
        maxBounds: boundingBox
      }}
      getTooltip={getTooltip}
    />
  );
}

function getTooltip({object}: PickingInfo<HierarchyRectangularNode<Datum>>) {
  return (
    object &&
    `\
  ${object.data.id}
  ${formatValue(object.value)}`
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const resp = await fetch(DATA_URL);
  const json = await resp.json();
  const data = hierarchy(json)
    .each(d => {
      d.data.id = d
        .ancestors()
        .reverse()
        .map(d0 => d0.data.name)
        .join('.');
    })
    .sum(d => d.value);
  root.render(<App data={data} width={1500} height={1000} />);
}
