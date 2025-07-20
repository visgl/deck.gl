// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* global fetch */
import React, {useMemo} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl/maplibre';
import {DeckGL} from '@deck.gl/react';
import {ScatterplotLayer, ArcLayer} from '@deck.gl/layers';
import {BrushingExtension} from '@deck.gl/extensions';
import {scaleSqrt} from 'd3-scale';

import type {Color, PickingInfo, MapViewState} from '@deck.gl/core';
import type {BrushingExtensionProps} from '@deck.gl/extensions';
import type {Feature, Polygon, MultiPolygon} from 'geojson';

// Source data GeoJSON
const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/arc/counties.json'; // eslint-disable-line

export const inFlowColor: Color = [35, 181, 184];
export const outFlowColor: Color = [166, 3, 3];

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -100,
  latitude: 40.7,
  zoom: 3,
  maxZoom: 15,
  pitch: 0,
  bearing: 0
};

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/positron-nolabels-gl-style/style.json';

type CountyProperties = {
  /** county name */
  name: string;
  /** to another county index -> net flow */
  flows: {[id: number]: number};
  /** geographical centroid */
  centroid: [lon: number, lat: number];
};

type County = Feature<Polygon | MultiPolygon, CountyProperties>;

type MigrationFlow = {
  source: County;
  target: County;
  /** Number of migrants */
  value: number;
};

type MigrationDestination = {
  county: County;
  /** Population net gain */
  netGain: number;
};

const brushingExtension = new BrushingExtension();

/* eslint-disable  max-nested-callbacks */
function getLayerData(data?: County[]): {
  arcs: MigrationFlow[];
  points: MigrationDestination[];
} | null {
  if (!data || !data.length) {
    return null;
  }
  const arcs: MigrationFlow[] = [];
  const points: MigrationDestination[] = data
    .map((county, fromId) => {
      const {flows} = county.properties;
      let netGain = 0;

      Object.keys(flows).forEach(key => {
        const toId = Number(key);
        const value = flows[toId];
        netGain -= value;

        // if number too small, ignore it
        if (value >= 50) {
          arcs.push({
            source: county,
            target: data[toId],
            value
          });
        }
      });

      return {county, netGain};
    })
    // sort points by radius large -> small
    .sort((a, b) => Math.abs(b.netGain) - Math.abs(a.netGain));

  return {arcs, points};
}

function getTooltip({object}: PickingInfo<MigrationDestination>) {
  return (
    object &&
    `\
    ${object.county.properties.name}
    Net gain: ${object.netGain}`
  );
}

/* eslint-disable react/no-deprecated */
export default function App({
  data,
  enableBrushing = true,
  brushRadius = 100000,
  strokeWidth = 1,
  opacity = 0.7,
  mapStyle = MAP_STYLE
}: {
  data?: County[];
  enableBrushing?: boolean;
  brushRadius?: number;
  strokeWidth?: number;
  opacity?: number;
  mapStyle?: string;
}) {
  const layerData = useMemo(() => getLayerData(data), [data]);
  const radiusScale = useMemo(() => {
    return (
      layerData &&
      scaleSqrt()
        .domain([0, Math.abs(layerData.points[0].netGain)])
        .range([1, 20])
    );
  }, [layerData]);

  const layers = layerData && [
    new ScatterplotLayer<MigrationFlow, BrushingExtensionProps<MigrationFlow>>({
      id: 'sources-with-gain',
      data: layerData.arcs,
      brushingRadius: brushRadius,
      brushingEnabled: enableBrushing,
      brushingTarget: 'custom',
      getPosition: d => d.target.properties.centroid,
      getRadius: d => radiusScale(d.value),
      getBrushingTarget: d => d.source.properties.centroid,
      getFillColor: inFlowColor,
      // only show source points when brushing
      visible: enableBrushing,
      radiusScale: 3000,
      extensions: [brushingExtension]
    }),
    new ScatterplotLayer<MigrationFlow, BrushingExtensionProps<MigrationFlow>>({
      id: 'sources-with-loss',
      data: layerData.arcs,
      brushingRadius: brushRadius,
      brushingEnabled: enableBrushing,
      brushingTarget: 'custom',
      getPosition: d => d.source.properties.centroid,
      getRadius: d => radiusScale(d.value),
      getBrushingTarget: d => d.target.properties.centroid,
      getFillColor: outFlowColor,
      // only show source points when brushing
      visible: enableBrushing,
      radiusScale: 3000,
      extensions: [brushingExtension]
    }),
    new ScatterplotLayer<MigrationDestination, BrushingExtensionProps>({
      id: 'destinations',
      data: layerData.points,
      brushingRadius: brushRadius,
      lineWidthMinPixels: 2,
      stroked: true,
      pickable: true,
      brushingEnabled: enableBrushing,
      radiusScale: 3000,
      getPosition: d => d.county.properties.centroid,
      getLineColor: d => (d.netGain > 0 ? inFlowColor : outFlowColor),
      getFillColor: [0, 0, 0, 0],
      getRadius: d => radiusScale(d.netGain) + 4,
      extensions: [brushingExtension]
    }),
    new ArcLayer<MigrationFlow, BrushingExtensionProps>({
      id: 'arc',
      data: layerData.arcs,
      getWidth: strokeWidth,
      opacity,
      brushingRadius: brushRadius,
      brushingEnabled: enableBrushing,
      brushingTarget: 'source_target',
      getSourcePosition: d => d.source.properties.centroid,
      getTargetPosition: d => d.target.properties.centroid,
      getSourceColor: outFlowColor,
      getTargetColor: inFlowColor,
      extensions: [brushingExtension]
    })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={INITIAL_VIEW_STATE}
      controller={true}
      getTooltip={getTooltip}
    >
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export async function renderToDOM(container: HTMLDivElement) {
  const root = createRoot(container);
  root.render(<App />);

  const resp = await fetch(DATA_URL);
  const {features} = await resp.json();
  root.render(<App data={features} />);
}
