// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {getDistanceScales, lngLatToWorld, worldToLngLat, MAX_LATITUDE} from '@math.gl/web-mercator';
import type {DistanceScales} from './viewport';
import type {CRSConversion, CRSDescriptor, CRSRenderingScale} from '@math.gl/projection/core';

const TILE_SIZE = 512;
const METERS_PER_WORLD_UNIT = getDistanceScales({longitude: 0, latitude: 0}).metersPerUnit[0];
const EARTH_RADIUS = (METERS_PER_WORLD_UNIT * TILE_SIZE) / (2 * Math.PI);

/** Adapt math.gl Mercator scales to the viewport scale contract. */
export function getMercatorScales(
  longitude: number,
  latitude: number,
  highPrecision = false
): DistanceScales {
  const scales = getDistanceScales({longitude, latitude, highPrecision});
  return {
    unitsPerMeter: scales.unitsPerMeter as [number, number, number],
    metersPerUnit: scales.metersPerUnit as [number, number, number],
    unitsPerWorldUnit: scales.unitsPerDegree as [number, number, number],
    unitsPerMeter2: (scales.unitsPerMeter2 || [0, 0, 0]) as [number, number, number],
    unitsPerWorldUnit2: (scales.unitsPerDegree2 || [0, 0, 0]) as [number, number, number]
  };
}

function convert(transform: (coordinate: number[]) => number[]): CRSConversion {
  return ((coordinate, output?) => {
    const converted = transform(Array.from(coordinate));
    if (!output) return converted;
    for (let index = 0; index < converted.length; index++) output[index] = converted[index];
    return output;
  }) as CRSConversion;
}

const distanceScale = (coordinate: ArrayLike<number>): CRSRenderingScale => {
  const [longitude, latitude] = worldToLngLat([coordinate[0], TILE_SIZE - coordinate[1]]);
  const {metersPerUnit} = getDistanceScales({longitude, latitude});
  return [metersPerUnit[0], metersPerUnit[1], 1];
};

/** Deck's 512-unit Mercator tile CRS, with eastward X, southward Y and metre altitude.
 * This describes tile coordinates, not EPSG:3857 metre coordinates or common space.
 * The viewport retains its existing northward common-space Y and altitude scaling.
 */
export const OSM_TILE_CRS: CRSDescriptor = {
  signature: 'OSMTile512',
  coordinateFrame: 'projected',
  projection: 'merc',
  parameters: {proj: 'merc'},
  ellipsoid: {semiMajorAxis: EARTH_RADIUS, semiMinorAxis: EARTH_RADIUS},
  axis: 'esu',
  xUnit: {name: 'tile units', metersPerUnit: METERS_PER_WORLD_UNIT},
  yUnit: {name: 'tile units', metersPerUnit: METERS_PER_WORLD_UNIT},
  zUnit: {name: 'meters', metersPerUnit: 1},
  lossy: false,
  // One zoom-zero tile is an appropriate rendering target, not a validity limit.
  renderingBounds: [
    [0, 0, 0],
    [TILE_SIZE, TILE_SIZE, 0]
  ],
  renderingScale: distanceScale,
  getRenderingScale: distanceScale,
  converter: {
    WGS84: {
      from: convert(coordinate => {
        const [x, y] = lngLatToWorld(coordinate);
        coordinate[0] = x;
        coordinate[1] = TILE_SIZE - y;
        return coordinate;
      }),
      to: convert(coordinate => {
        const [longitude, latitude] = worldToLngLat([coordinate[0], TILE_SIZE - coordinate[1]]);
        coordinate[0] = longitude;
        coordinate[1] = latitude;
        return coordinate;
      }),
      normalize: convert(coordinate => {
        const longitude = coordinate[0];
        coordinate[0] =
          Math.abs(longitude) <= 180 ? longitude : ((((longitude + 180) % 360) + 360) % 360) - 180;
        coordinate[1] = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, coordinate[1]));
        return coordinate;
      })
    }
  }
};
