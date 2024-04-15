/* global fetch */
import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl//maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension, CollisionFilterExtensionProps} from '@deck.gl/extensions';
import {calculateLabels, Label} from './calculate-labels';

import type {Position, MapViewState} from '@deck.gl/core';
import type {FeatureCollection, Geometry} from 'geojson';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/collision-filter/ne_10_roads.json';

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
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  sizeScale = 10,
  collisionEnabled = true,
  pointSpacing = 5
}: {
  mapStyle?: string;
  sizeScale?: number;
  collisionEnabled?: boolean;
  pointSpacing?: number;
}) {
  const [roads, setRoads] = useState<FeatureCollection<Geometry, RoadProperties>>();

  useEffect(() => {
    fetch(DATA_URL)
      .then(resp => resp.json())
      .then(setRoads);
  }, []);

  const roadLabels = useMemo(
    () => calculateLabels(roads, d => d.name !== null, pointSpacing),
    [roads, pointSpacing]
  );

  const layers = [
    new GeoJsonLayer({
      id: 'roads-outline',
      data: roads,
      getLineWidth: f => f.properties.scalerank + 2,
      lineWidthScale: 40,
      lineWidthMinPixels: 3,
      getLineColor: [0, 173, 230]
    }),
    new GeoJsonLayer({
      id: 'roads',
      data: roads,
      getLineWidth: f => f.properties.scalerank,
      lineWidthScale: 40,
      lineWidthMinPixels: 1,
      parameters: {depthCompare: 'always'},
      getLineColor: [255, 255, 255]
    }),
    new TextLayer<Label<RoadProperties>, CollisionFilterExtensionProps>({
      id: 'labels',
      data: roadLabels,
      getColor: [0, 0, 0],
      getBackgroundColor: [255, 255, 255],
      getBorderColor: [0, 173, 230],
      getBorderWidth: 1,
      getPosition: d => d.position as Position,
      getText: d => d.parent.name,
      getSize: d => Math.max(d.parent.scalerank * 2, 10),
      getAngle: d => d.angle,
      billboard: false,
      background: true,
      backgroundPadding: [4, 1],
      characterSet: 'auto',
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
