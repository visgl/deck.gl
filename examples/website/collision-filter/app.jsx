import React from 'react';
import {createRoot} from 'react-dom/client';
import {Map} from 'react-map-gl';
import maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import {GeoJsonLayer, TextLayer} from '@deck.gl/layers';
import points from './data/ne_10_roads_filtered_usa_10km_pts_california.json';
import roads from './data/ne_10_roads_filtered_usa_california.json';
import {CollisionFilterExtension} from '@deck.gl/extensions';
import * as turf from '@turf/turf';

const ALL_ROUTES = 'All routes';

export default function App({
  mapStyle = 'https://basemaps.cartocdn.com/gl/dark-matter-nolabels-gl-style/style.json',
  sizeScale = 4,
  collisionEnabled = true,
  routeName = 'US-101',
}) {
  const roadName = routeName.split('-');
  const filteredRoads =
    routeName === ALL_ROUTES
      ? roads
      : roads.features.filter(f => f.properties.number === roadName[1]);
  const filteredLabels =
    routeName === ALL_ROUTES
      ? points.features
      : points.features.filter(f => f.properties.number === roadName[1]);

  const initialViewState = {
    longitude: -119.417931,
    latitude: 36.778259,
    zoom: 5,
    maxZoom: 20,
    pitch: 0,
    bearing: 0
  };

  if (routeName !== ALL_ROUTES) {
    const geom = Object.keys(filteredRoads).reduce(
      (acc, key) => acc.concat(filteredRoads[key].geometry.coordinates),
      []
    );
    // Join all geometries into a single MultiLineString
    const multiLine = turf.multiLineString(geom);
    // Calculate the centroid of the MultiLineString
    const centroid = turf.center(multiLine);
 
    initialViewState.longitude = centroid.geometry.coordinates[0];
    initialViewState.latitude = centroid.geometry.coordinates[1];
  }

  // TODO: fix the angle calculation
  const getAngle = d => {
    let correctAngle = 0;

    if (d.properties.angle < 90) {
      correctAngle = 90 - (d.properties.angle * 2);
    
    } else if (d.properties.angle < 320) {
      const nInteger = Math.floor(d.properties.angle);
      const unit = nInteger % 10;
      const tens = (Math.floor(nInteger / 10) % 10) + 10;
      correctAngle = tens + (unit * 2);
    }
    // TODO: complete the rest of the angles
    return ((d.properties.angle + correctAngle) + 360) % 360
  }

  const layers = [
    new GeoJsonLayer({
      id: 'geojson',
      data: filteredRoads,
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
      data: filteredLabels,
      pickable: true,
      getPosition: d => d.geometry.coordinates,
      getText: d => `${d.properties.angle}`,//`${d.properties.prefix}-${d.properties.number}`,
      getColor: [255, 255, 255, 255],
      getSize: 15,
      getAngle,
      getTextAnchor: 'middle',
      getAlignmentBaseline: 'bottom',
      outlineWidth: 1,
      fontSettings: {
        sdf: true
      },
      // CollisionFilterExtension props
      collisionEnabled,
      getCollisionPriority: d => d.properties.label_rank_cpt,
      collisionTestProps: {sizeScale},
      extensions: [new CollisionFilterExtension()]
    })
  ];

  return (
    <DeckGL layers={layers} initialViewState={initialViewState} controller={true} pickingRadius={5}>
      <Map reuseMaps mapLib={maplibregl} mapStyle={mapStyle} preventStyleDiffing={true} />
    </DeckGL>
  );
}

export function renderToDOM(container) {
  createRoot(container).render(<App />);
}
