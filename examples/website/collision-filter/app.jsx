import React, {useCallback, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import {WebMercatorViewport} from '@deck.gl/core';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import roads from './data/ne_10_roads_mexico.json';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import * as turf from '@turf/turf';

const initialViewState = {longitude: -100, latitude: 24, zoom: 5, minZoom: 5, maxZoom: 12};
const LINE_COLOR = [215, 130, 170];

function calculateLabels(data, pointSpacing) {
  const routes = data.features.filter(d => d.geometry.type !== 'Point');

  // Add points along the lines
  const filteredLabels = routes.map(d => {
    const lineLength = Math.floor(turf.lineDistance(d.geometry));

    const result = {
      type: 'FeatureCollection',
      features: []
    };

    function addPoint(lineString, dAlong, priority) {
      let offset = 1;
      if (dAlong > 0.5 * lineLength) offset *= -1;
      const feature = turf.along(lineString, dAlong);
      const nextFeature = turf.along(lineString, dAlong + offset);
      const {coordinates} = feature.geometry;
      const next = turf.point(nextFeature.geometry.coordinates).geometry.coordinates;
      if (coordinates[0] === next[0] && coordinates[1] === next[1]) return;

      const {prefix, number, name} = d.properties;
      const label = prefix ? `${d.properties.prefix}-${d.properties.number}` : name;

      feature.properties = {
        priority,
        label,
        number,
        next
      };
      result.features.push(feature);
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

  return filteredLabels.reduce((acc, key) => acc.concat(key.features), []);
}

export default function App({
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  sizeScale = 10,
  collisionEnabled = true,
  pointSpacing = 5
}) {
  const [viewport, setViewport] = useState(new WebMercatorViewport(initialViewState));
  const onViewStateChange = useCallback(({viewState}) => {
    setViewport(new WebMercatorViewport(viewState));
  }, []);

  const dataLabels = useMemo(() => calculateLabels(roads, pointSpacing), [roads, pointSpacing]);

  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data: roads,
      lineWidthMinPixels: 2,
      parameters: {depthTest: false},
      getLineColor: LINE_COLOR
    }),
    new TextLayer({
      id: 'text-layer',
      data: dataLabels,
      getPosition: d => d.geometry.coordinates,
      getText: d => d.properties.label,
      getColor: [255, 255, 255],
      getBackgroundColor: LINE_COLOR,
      getBorderColor: [255, 255, 255],
      getBorderWidth: 1,
      getSize: 15,
      getAngle: d => {
        const p1 = viewport.project(d.geometry.coordinates);
        const p2 = viewport.project(d.properties.next);
        const deltaLng = p1[0] - p2[0];
        const deltaLat = p1[1] - p2[1];
        let angle = (180 * Math.atan2(deltaLng, deltaLat)) / Math.PI - 90;
        if (Math.abs(angle) > 90) angle += 180;
        return angle;
      },
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
      getCollisionPriority: d => d.properties.priority,
      collisionTestProps: {sizeScale},
      extensions: [new CollisionFilterExtension()],

      updateTriggers: {
        getAngle: [viewport]
      }
    })
  ];

  return (
    <DeckGL
      layers={layers}
      initialViewState={initialViewState}
      onViewStateChange={onViewStateChange}
      controller={true}
      pickingRadius={5}
    >
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
