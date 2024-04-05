/* global fetch */
import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl//maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension, CollisionFilterExtensionProps} from '@deck.gl/extensions';
import {calculateLabels, Label} from './calculate-labels';

import type {MapViewState} from '@deck.gl/core';
import type {FeatureCollection, Geometry} from 'geojson';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/collision-filter/ne_10_roads_mexico.json';

const INITIAL_VIEW_STATE: MapViewState = {
  longitude: -100,
  latitude: 24,
  zoom: 5,
  minZoom: 5,
  maxZoom: 12
};

type RoadProperties = {
  name: string;
  scalerank: number;
};

export default function App({
  url = DATA_URL,
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  sizeScale = 10,
  collisionEnabled = true,
  pointSpacing = 5
}: {
  url?: string;
  mapStyle?: string;
  sizeScale?: number;
  collisionEnabled?: boolean;
  pointSpacing?: number
}) {
  const [roads, setRoads] = useState<FeatureCollection<Geometry, RoadProperties>>();

  const dataLabels = useMemo(() => calculateLabels(roads, d => d.name, d => d.scalerank, pointSpacing), [roads, pointSpacing]);

  const layers = [
    new GeoJsonLayer({
      id: 'roads-outline',
      data: url,
      lineWidthMinPixels: 4,
      parameters: {depthTest: false},
      getLineColor: [255, 255, 255]
    }),
    new GeoJsonLayer({
      id: 'roads',
      data: url,
      onDataLoad: data => setRoads(data as FeatureCollection<Geometry, RoadProperties>),
      lineWidthMinPixels: 2,
      parameters: {depthTest: false},
      getLineColor: [0, 173, 230]
    }),
    new TextLayer<Label, CollisionFilterExtensionProps>({
      id: 'text-layer',
      data: dataLabels,
      getColor: [0, 0, 0],
      getBackgroundColor: [0, 173, 230],
      getBorderColor: [255, 255, 255],
      getBorderWidth: 1,
      getSize: 18,
      billboard: false,
      getAngle: d => d.angle,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'center',
      background: true,
      backgroundPadding: [4, 1],
      outlineWidth: 0,
      outlineColor: [255, 255, 0],
      fontSettings: {
        sdf: true
      },
      characterSet: '0123456789ABCD',
      fontFamily: 'monospace',

      // CollisionFilterExtension props
      collisionEnabled,
      getCollisionPriority: d => d.priority,
      collisionTestProps: {sizeScale},
      extensions: [new CollisionFilterExtension()]
    })
  ];

  return (
    <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container: HTMLDivElement) {
  createRoot(container).render(<App />);
}
