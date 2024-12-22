import type {Position} from '@deck.gl/core';
import type {NumericArray} from '@math.gl/core';
/** Simple Polygon: an array of points */
export declare type NestedSimplePolygonGeometry = Position[];
/** Complex Polygon: an array of array of points (array of rings)
 * with the first ring representing the outer hull and other rings representing holes
 */
export declare type NestedComplexPolygonGeometry = Position[][];
/** An array of numbers (flattened "simple polygon") */
export declare type FlatSimplePolygonGeometry = NumericArray;
/** Flattened "complex polygon" */
export declare type FlatComplexPolygonGeometry = {
  positions: NumericArray;
  holeIndices: NumericArray;
};
export declare type PolygonGeometry =
  | NestedSimplePolygonGeometry
  | NestedComplexPolygonGeometry
  | FlatSimplePolygonGeometry
  | FlatComplexPolygonGeometry;
export declare type NormalizedPolygonGeometry =
  | FlatSimplePolygonGeometry
  | FlatComplexPolygonGeometry;
/** Get the positions from a normalized polygon */
export declare function getPositions(polygon: NormalizedPolygonGeometry): NumericArray;
/** Get the hole indices from a normalized polygon */
export declare function getHoleIndices(polygon: NormalizedPolygonGeometry): NumericArray | null;
/**
 * Normalize any polygon representation into the "complex flat" format
 */
export declare function normalize(
  polygon: PolygonGeometry,
  positionSize: number
): NormalizedPolygonGeometry;
/**
 * Get vertex indices for drawing polygon mesh (triangulation)
 */
export declare function getSurfaceIndices(
  polygon: NormalizedPolygonGeometry,
  positionSize: number,
  preproject?: (xy: number[]) => number[],
  full3d?: boolean
): number[];
// # sourceMappingURL=polygon.d.ts.map
