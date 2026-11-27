// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {ArcLayer, ColumnLayer, ScatterplotLayer} from '@deck.gl/layers';
import {tripLoopLength} from './taxi-data';

/** Local degree-to-meter scales used to group nearby points around New York City. */
const metersPerLongitude = 84_300;
const metersPerLatitude = 111_190;
const pickupCellSize = 300;
const connectionCellSize = 660;
const originColor = [205, 154, 255, 245];
const destinationColor = [138, 255, 230, 245];

/** Limits the featured overlays to the area around the homepage camera. */
function inFeaturedArea([longitude, latitude]) {
  return longitude >= -74.035 && longitude <= -73.94 && latitude >= 40.688 && latitude <= 40.783;
}

/** Groups close endpoints while retaining approximate sample positions. */
function getCell([longitude, latitude], size) {
  return [
    Math.floor((longitude * metersPerLongitude) / size),
    Math.floor((latitude * metersPerLatitude) / size)
  ];
}

/** Aggregates completed paths by origin and destination and selects a readable sample. */
function getConnections(routes) {
  const cells = new Map();
  for (const {path, endTime, timestamps} of routes) {
    // The trip decoder truncates some routes when it slices them to the animation window.
    if (endTime > tripLoopLength || timestamps.at(-1) < endTime - 1e-6) continue;
    const sourcePosition = path[0].slice(0, 2);
    const targetPosition = path.at(-1).slice(0, 2);
    if (!inFeaturedArea(sourcePosition) && !inFeaturedArea(targetPosition)) continue;

    const [sourceLongitude, sourceLatitude] = sourcePosition;
    const [targetLongitude, targetLatitude] = targetPosition;
    const distance = Math.hypot(
      (targetLongitude - sourceLongitude) * metersPerLongitude,
      (targetLatitude - sourceLatitude) * metersPerLatitude
    );
    if (distance < 700 || distance > 7500) continue;

    const key = `${getCell(sourcePosition, connectionCellSize)}:${getCell(targetPosition, connectionCellSize)}`;
    const existing = cells.get(key);
    if (existing) {
      existing.count++;
    } else {
      cells.set(key, {sourcePosition, targetPosition, count: 1, distance});
    }
  }
  return [...cells.values()]
    .sort((a, b) => b.count - a.count || Math.abs(a.distance - 3650) - Math.abs(b.distance - 3650))
    .slice(0, 52);
}

/** Counts the sampled trip starts in each pickup cell. */
function getPickups(routes) {
  const cells = new Map();
  for (const {path} of routes) {
    const position = path[0];
    if (!inFeaturedArea(position)) continue;
    const [column, row] = getCell(position, pickupCellSize);
    const key = `${column}:${row}`;
    const existing = cells.get(key);
    if (existing) {
      existing.count++;
    } else {
      cells.set(key, {
        position: [
          ((column + 0.5) * pickupCellSize) / metersPerLongitude,
          ((row + 0.5) * pickupCellSize) / metersPerLatitude
        ],
        count: 1
      });
    }
  }
  return [...cells.values()].sort((a, b) => b.count - a.count).slice(0, 104);
}

/** Creates the static analytical overlays using the same trips as the animated hero. */
export function createTaxiOverlays(routes) {
  const connections = getConnections(routes);
  const pickups = getPickups(routes);
  const maxPickups = pickups[0]?.count || 1;
  const arcs = new ArcLayer({
    id: 'taxi-map-connections',
    data: connections,
    getSourcePosition: connection => connection.sourcePosition,
    getTargetPosition: connection => connection.targetPosition,
    getSourceColor: originColor,
    getTargetColor: destinationColor,
    getWidth: ({count}) => 1.15 + Math.sqrt(count) * 0.8,
    getHeight: 0.44,
    antialiasing: true,
    parameters: {depthWriteEnabled: false}
  });
  const columns = new ColumnLayer({
    id: 'taxi-map-pickups',
    data: pickups,
    diskResolution: 6,
    radius: 98,
    getElevation: ({count}) => 105 + 88 * count,
    getFillColor: ({count}) => {
      const intensity = count / maxPickups;
      return [20 + 173 * intensity, 77 + 168 * intensity, 212 + 43 * intensity];
    },
    flatShading: true,
    material: {ambient: 0.52, diffuse: 0.62, shininess: 18, specularColor: [110, 160, 204]}
  });
  return {
    connections: [
      arcs.clone({id: 'taxi-map-connections-halo', widthScale: 3.8, opacity: 0.13}),
      arcs,
      new ScatterplotLayer({
        id: 'taxi-map-connection-endpoints',
        data: connections.flatMap(({sourcePosition, targetPosition}) => [
          {position: sourcePosition, color: originColor},
          {position: targetPosition, color: destinationColor}
        ]),
        getFillColor: ({color}) => color,
        getRadius: 2.3,
        radiusUnits: 'pixels',
        billboard: true,
        parameters: {depthWriteEnabled: false}
      })
    ],
    pickups: [columns]
  };
}
