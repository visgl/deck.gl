import {Matrix4} from '@math.gl/core';

export type ZRange = [minZ: number, maxZ: number];

export type Bounds = [minX: number, minY: number, maxX: number, maxY: number];

export type GeoBoundingBox = {west: number; north: number; east: number; south: number};
export type NonGeoBoundingBox = {left: number; top: number; right: number; bottom: number};

export type TileBoundingBox = NonGeoBoundingBox | GeoBoundingBox;

const TILE_SIZE = 512;
const DEFAULT_EXTENT: Bounds = [-Infinity, -Infinity, Infinity, Infinity];

export function isGeoBoundingBox(v: any): v is GeoBoundingBox {
  return (
    Number.isFinite(v.west) &&
    Number.isFinite(v.north) &&
    Number.isFinite(v.east) &&
    Number.isFinite(v.south)
  );
}

export function transformBox(bbox: Bounds, modelMatrix: Matrix4): Bounds {
  const transformedCoords = [
    // top-left
    modelMatrix.transformAsPoint([bbox[0], bbox[1]]),
    // top-right
    modelMatrix.transformAsPoint([bbox[2], bbox[1]]),
    // bottom-left
    modelMatrix.transformAsPoint([bbox[0], bbox[3]]),
    // bottom-right
    modelMatrix.transformAsPoint([bbox[2], bbox[3]])
  ];
  const transformedBox: Bounds = [
    // Minimum x coord
    Math.min(...transformedCoords.map(i => i[0])),
    // Minimum y coord
    Math.min(...transformedCoords.map(i => i[1])),
    // Max x coord
    Math.max(...transformedCoords.map(i => i[0])),
    // Max y coord
    Math.max(...transformedCoords.map(i => i[1]))
  ];
  return transformedBox;
}
