import {Vector3} from '@math.gl/core';
import {Ellipsoid} from '@math.gl/geospatial';
import type {OrientedBoundingBox} from '@math.gl/culling';
import type {Tile3D} from '@loaders.gl/tiles';

const scratchPoint = new Vector3();

// Tile3D instance is not extensible. This is just a POC. Move into loaders.gl
export function wrapTile(tile: Tile3D): Tile3D {
  const unsealedTile = Object.create(tile);
  Object.defineProperty(unsealedTile, 'bbox', {
    get: () => getBbox(tile.boundingVolume)
  });
  return unsealedTile;
}

function getBbox(boundingVolume: OrientedBoundingBox): {west: number; north: number; east: number; south: number} {
  let minLng = Infinity;
  let maxLng = -Infinity;
  let minLat = Infinity;
  let maxLat = -Infinity;

  const xAxis = new Vector3(boundingVolume.halfAxes.getColumn(0));
  const yAxis = new Vector3(boundingVolume.halfAxes.getColumn(1));
  const zAxis = new Vector3(boundingVolume.halfAxes.getColumn(2));

  // Test all 8 corners of the box
  for (let x = 0; x < 2; x++) {
    for (let y = 0; y < 2; y++) {
      for (let z = 0; z < 2; z++) {
        const position = new Vector3(boundingVolume.center);
        position.add(x ? xAxis : xAxis.negate());
        position.add(y ? yAxis : yAxis.negate());
        position.add(z ? zAxis : zAxis.negate());

        const cartographicPosition = Ellipsoid.WGS84.cartesianToCartographic(position, scratchPoint);
        minLng = Math.min(minLng, cartographicPosition[0]);
        minLat = Math.min(minLat, cartographicPosition[1]);
        maxLng = Math.max(maxLng, cartographicPosition[0]);
        maxLat = Math.max(maxLat, cartographicPosition[1]);
      }
    }
  }
  return {west: minLng, south: minLat, east: maxLng, north: maxLat};
}
