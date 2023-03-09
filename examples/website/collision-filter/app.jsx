import React, {useCallback, useMemo, useState} from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import roads from './data/ne_10_roads_filtered_usa_california.json';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import * as turf from '@turf/turf';

const initialViewState = {
  longitude: -119.417931,
  latitude: 36.778259,
  zoom: 5,
  maxZoom: 20,
  pitch: 0,
  bearing: 0
};

function calculateLabels(data, pointSpacing) {
  const routes = data.features.filter(d => d.geometry.type !== 'Point');

  // Add points along the lines
  const filteredLabels = routes.map(d => {
    const lineLength = Math.floor(turf.lineDistance(d.geometry, 'miles'));

    const result = {
      type: 'FeatureCollection',
      features: []
    };

    function addPoint(lineString, dAlong, priority) {
      const feature = turf.along(lineString, dAlong, {units: 'miles'});
      // Need to add a small offset to the next point to get the correct angle
      const nextFeature = turf.along(lineString, dAlong + 0.2, {units: 'miles'});
      let angle = 0;

      const prev = turf.point(feature.geometry.coordinates);
      const next = turf.point(nextFeature.geometry.coordinates);

      // TODO: imrove the angle calculation, taken from: // TODO: https://codepen.io/Pessimistress/pen/OJgmXba?editors=0010
      const bearing = turf.bearing(prev, next);
      angle = 90 - bearing;
      if (Math.abs(angle) > 90) {
        angle += 180;
      }

      const {prefix, number} = d.properties;
      feature.properties = {priority, prefix, number, angle, prev, next};
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
  sizeScale = 4,
  collisionEnabled = true,
  pointSpacing = 1
}) {
  const onViewStateChange = useCallback(({viewState}) => {}, []);

  const dataLabels = useMemo(() => calculateLabels(roads, pointSpacing), [roads, pointSpacing]);

  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data: roads,
      stroked: false,
      filled: false,
      lineWidthMinPixels: 3,
      parameters: {
        depthTest: false
      },
      getFillColor: [255, 160, 180],
      getLineColor: [255, 160, 180],
      getLineWidth: 10
    }),
    new TextLayer({
      id: 'text-layer',
      data: dataLabels,
      pickable: true,
      getPosition: d => d.geometry.coordinates,
      getText: d => `${d.properties.prefix}-${d.properties.number}`,
      getColor: [255, 255, 255, 255],
      getSize: 15,
      getAngle: d => d.properties.angle,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      outlineWidth: 1,
      fontSettings: {
        sdf: true
      },
      // CollisionFilterExtension props
      collisionEnabled,
      getCollisionPriority: d => d.properties.priority,
      collisionTestProps: {sizeScale},
      extensions: [new CollisionFilterExtension()]
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
