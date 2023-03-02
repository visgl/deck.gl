import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import data from './data/road_accidents.json';
import dataLabels from './data/city_labels.json';
import {CollisionFilterExtension} from '@deck.gl/extensions';

const COLOR_SEVERITY = [
  [240, 59, 32], // Severity 1 - Red
  [254, 224, 139], // Severity 2 - Orange
  [26, 152, 80] // Severity 3 - Yellow
];

const INITIAL_VIEW_STATE = {
  longitude: -3.989668,
  latitude: 54.726504,
  zoom: 5,
  maxZoom: 16,
  pitch: 0,
  bearing: 0
};

export const COLORS_STEPS = [
  {threshold: 'High', color: COLOR_SEVERITY[0], strokeWidth: 2},
  {threshold: 'Medium', color: COLOR_SEVERITY[1], strokeWidth: 2},
  {threshold: 'Low', color: COLOR_SEVERITY[2], strokeWidth: 2}
];

export default function App({
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  radiusScale = 1,
  priorityDesc = false,
  sizeScale = 5,
  priorityLabelDesc = 'Max'
}) {
  const labels = dataLabels.features;
  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data,
      opacity: 0.8,
      stroked: false,
      filled: true,
      pointRadiusUnits: 'pixels',
      pointType: 'circle',
      getPointRadius: 5,
      getFillColor: d =>
        d.properties.accident_severity === 1
          ? COLOR_SEVERITY[0]
          : d.properties.accident_severity === 2
          ? COLOR_SEVERITY[1]
          : COLOR_SEVERITY[2],
      pickable: true,
      // CollisionFilterExtension props
      collisionTestProps: {radiusScale},
      getCollisionPriority: d =>
        priorityDesc === 'Low' ? d.properties.accident_severity : -d.properties.accident_severity,
      collisionGroup: 'visualization',
      updateTriggers: {
        getCollisionPriority: [priorityDesc]
      },
      extensions: [new CollisionFilterExtension()]
    }),
    new TextLayer({
      id: 'text-layer',
      data: labels,
      pickable: true,
      getPosition: d => d.geometry.coordinates,
      getText: d => d.properties.NAME,
      getColor: [255, 255, 255, 255],
      getSize: d => d.properties.RANK_MAX * 3,
      getAngle: 0,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      outlineWidth: 2,
      fontSettings: {
        sdf: true
      },
      // CollisionFilterExtension props
      getCollisionPriority: d =>
        priorityLabelDesc === 'Max' ? d.properties.RANK_MAX : -d.properties.RANK_MAX,
      collisionTestProps: {sizeScale},
      collisionGroup: 'legend',
      updateTriggers: {
        getCollisionPriority: [priorityLabelDesc]
      },
      extensions: [new CollisionFilterExtension()]
    })
  ];

  return (
    <DeckGL layers={layers} initialViewState={INITIAL_VIEW_STATE} controller={true}>
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
