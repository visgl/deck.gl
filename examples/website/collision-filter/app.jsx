/* global fetch */
import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import * as turf from '@turf/turf';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/collision-filter/ne_10_roads_mexico.json';
const LINE_COLOR = [0, 173, 230];

const initialViewState = {longitude: -100, latitude: 24, zoom: 5, minZoom: 5, maxZoom: 12};

function calculateLabels(data, pointSpacing) {
  const routes = data.features.filter(d => d.geometry.type !== 'Point');

  // Add points along the lines
  const filteredLabels = routes.map(d => {
    const lineLength = Math.floor(turf.lineDistance(d.geometry));

    const result = [];

    function addPoint(lineString, dAlong, priority) {
      let offset = 1;
      if (dAlong > 0.5 * lineLength) offset *= -1;
      const feature = turf.along(lineString, dAlong);
      const nextFeature = turf.along(lineString, dAlong + offset);
      const {coordinates} = feature.geometry;
      const next = nextFeature.geometry.coordinates;
      if (coordinates[0] === next[0] && coordinates[1] === next[1]) return;

      let angle = 90 - turf.rhumbBearing(coordinates, next);
      if (Math.abs(angle) > 90) angle += 180;

      const {name: text} = d.properties;
      result.push({position: coordinates, text, priority, angle});
    }

    d.geometry.coordinates.forEach(c => {
      const lineString = turf.lineString(c);

      // Add labels to minimize overlaps, pick odd values from each level
      //        1       <- depth 1
      //    1   2   3   <- depth 2
      //  1 2 3 4 5 6 7 <- depth 3
      let delta = 0.5 * lineLength; // Spacing between points at level
      let depth = 1;
      while (delta > pointSpacing) {
        for (let i = 1; i < 2 ** depth; i += 2) {
          addPoint(lineString, i * delta, 100 - depth); // Top levels have highest priority
        }
        depth++;
        delta /= 2;
      }
    });

    return result;
  });

  return filteredLabels.reduce((acc, key) => acc.concat(key), []);
}

export default function App({
  url = DATA_URL,
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  sizeScale = 10,
  collisionEnabled = true,
  pointSpacing = 5
}) {
  const [roads, setRoads] = useState({type: 'FeatureCollection', features: []});
  useEffect(() => {
    fetch(url)
      .then(r => r.json())
      .then(data => setRoads(data));
  }, [url]);

  const dataLabels = useMemo(() => calculateLabels(roads, pointSpacing), [roads, pointSpacing]);

  const layers = [
    new GeoJsonLayer({
      id: 'roads-outline',
      data: roads,
      lineWidthMinPixels: 4,
      parameters: {depthTest: false},
      getLineColor: [255, 255, 255]
    }),
    new GeoJsonLayer({
      id: 'roads',
      data: roads,
      lineWidthMinPixels: 2.5,
      parameters: {depthTest: false},
      getLineColor: LINE_COLOR
    }),
    new TextLayer({
      id: 'text-layer',
      data: dataLabels,
      getColor: [0, 0, 0],
      getBackgroundColor: LINE_COLOR,
      getBorderColor: [10, 16, 29],
      getBorderWidth: 2,
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
    <DeckGL layers={layers} initialViewState={initialViewState} controller={true}>
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
