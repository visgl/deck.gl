/* global fetch */
import React, {useEffect, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl//maplibre';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import calculateLabels from './calculateLabels';

const DATA_URL =
  'https://raw.githubusercontent.com/visgl/deck.gl-data/master/examples/collision-filter/ne_10_roads_mexico.json';
const LINE_COLOR = [0, 173, 230];

const initialViewState = {longitude: -100, latitude: 24, zoom: 5, minZoom: 5, maxZoom: 12};

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
      <Map reuseMaps mapStyle={mapStyle} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
