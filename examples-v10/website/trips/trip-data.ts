// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {Field, FixedSizeList, Float64, List, tableFromArrays, vectorFromArray} from 'apache-arrow';
import type {Table, Vector} from 'apache-arrow';

type Point = [longitude: number, latitude: number];
type TripPoint = [longitude: number, latitude: number, height: number];
type Trip = {vendor: number; path: TripPoint[]; timestamps: number[]};

export const LOOP_LENGTH = 1800;
const LOOP_TRAIL_LENGTH = 180;

/** Rebuilds the relative traversal time at every point in a shared segment. */
function unpackSegments(table: Table) {
  const radians = Math.PI / 180;
  return Array.from(table, ({longitude_e5, latitude_e5, duration}) => {
    const x = longitude_e5 as Vector;
    const y = latitude_e5 as Vector;
    const path: Point[] = Array.from({length: x.length}, (_, i) => [
      x.get(i) / 1e5,
      y.get(i) / 1e5
    ]);
    const distances = [0];
    for (let i = 1; i < path.length; i++) {
      const [lng, lat] = path[i];
      const [prevLng, prevLat] = path[i - 1];
      const dLat = (lat - prevLat) * radians;
      const dLng = (lng - prevLng) * radians;
      const a =
        Math.pow(Math.sin(dLat / 2), 2) +
        Math.pow(Math.sin(dLng / 2), 2) * Math.cos(lat * radians) * Math.cos(prevLat * radians);
      distances.push(distances[i - 1] + Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)));
    }
    const distance = distances[distances.length - 1];
    return {path, times: distances.map(d => (d / distance) * duration)};
  });
}

/** Reconstructs trip rows and carries trails over the animation loop boundary. */
export function expandTrips(table: Table): Table {
  // Segment rows precede route rows. Segment IDs are zero-based row indices.
  const routeStart = table.getChild('duration')?.indexOf(null) ?? -1;
  if (routeStart <= 0) {
    throw new Error('Expected segment rows followed by route rows');
  }
  const segments = unpackSegments(table.slice(0, routeStart));
  const trips: Trip[] = [];

  for (const {vendor, start, end, segment_ids} of table.slice(routeStart)) {
    const route = Array.from(segment_ids as Vector, id => segments[id]);
    const offsets = [0];
    for (const {times} of route) {
      offsets.push(offsets[offsets.length - 1] + times[times.length - 1]);
    }
    const scale = (end - start) / offsets[offsets.length - 1];
    const height = Math.random() * 20;
    const path: TripPoint[] = [];
    const timestamps: number[] = [];

    route.forEach(({path: points, times}, index) => {
      for (let i = index === 0 ? 0 : 1; i < points.length; i++) {
        path.push([points[i][0], points[i][1], height]);
        timestamps.push((times[i] + offsets[index]) * scale + start);
      }
    });

    for (let offset = 0; ; offset -= LOOP_LENGTH) {
      const times = offset ? timestamps.map(t => t + offset) : timestamps;
      const first = times.findIndex(t => t > -LOOP_TRAIL_LENGTH);
      const last = times.findIndex(t => t > LOOP_LENGTH);
      const from = first < 0 ? -1 : Math.max(0, first - 1);
      const to = last < 0 ? times.length : last + 1;
      trips.push({vendor, path: path.slice(from, to), timestamps: times.slice(from, to)});
      if (end + offset <= LOOP_LENGTH - LOOP_TRAIL_LENGTH) {
        break;
      }
    }
  }

  const pointType = new FixedSizeList(3, new Field('coordinate', new Float64()));
  return tableFromArrays({
    vendor: Uint8Array.from(trips, trip => trip.vendor),
    path: vectorFromArray(
      trips.map(trip => trip.path),
      new List(new Field('point', pointType))
    ),
    timestamps: vectorFromArray(
      trips.map(trip => trip.timestamps),
      new List(new Field('timestamp', new Float64()))
    )
  });
}
