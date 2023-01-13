// deck.gl, MIT license
import { TileBoundingBox } from './types';

const TILE_SIZE = 512;

/**
 * Calculates the long/lat of a tile from its (x,y,z) tile index
 * @link https://wiki.openstreetmap.org/wiki/Slippy_map_tilenames#Lon..2Flat._to_tile_numbers_2
 */
export function tileIndexToLngLat(x: number, y: number, z: number, tileSize = TILE_SIZE): [number, number] {
  const scale = getScale(z, tileSize);
  const lng = (x / scale) * 360 - 180;
  const n = Math.PI - (2 * Math.PI * y) / scale;
  const lat = (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)));
  return [lng, lat];
}

/**
 * Calculates the x,y position of a tile from its (x,y,z) tile index
 */
export function tileIndexToXY(x: number, y: number, z: number, tileSize: number = TILE_SIZE): [number, number] {
  const scale = getScale(z, tileSize);
  return [(x / scale) * TILE_SIZE, (y / scale) * TILE_SIZE];
}

/**
 * Calculates the 2D bounding bos of a tile a tile from its (x,y,z) tile index
 * @param isGeospatial 
 * @param x 
 * @param y 
 * @param z 
 * @param tileSize 
 * @returns 
 */
export function tileIndexToBoundingBox(
  x: number,
  y: number,
  z: number,
  isGeospatial: boolean,
  tileSize: number = TILE_SIZE
): TileBoundingBox {
  if (isGeospatial) {
    const [west, north] = tileIndexToLngLat(x, y, z);
    const [east, south] = tileIndexToLngLat(x + 1, y + 1, z);
    return {west, north, east, south};
  }
  const [left, top] = tileIndexToXY(x, y, z, tileSize);
  const [right, bottom] = tileIndexToXY(x + 1, y + 1, z, tileSize);
  return {left, top, right, bottom};
}

/** Helper to calculate scale */
export function getScale(z: number, tileSize: number): number {
  return (Math.pow(2, z) * TILE_SIZE) / tileSize;
}

