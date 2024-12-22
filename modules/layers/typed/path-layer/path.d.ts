import type {NumericArray} from '@math.gl/core';
import type {Position} from '@deck.gl/core';
export declare type NestedPathGeometry = Position[];
export declare type FlatPathGeometry = NumericArray;
export declare type PathGeometry = NestedPathGeometry | FlatPathGeometry;
export declare type NormalizedPathGeometry = FlatPathGeometry[] | FlatPathGeometry;
/**
 * Flattens a nested path object
 * Cut the feature if needed (globe projection, wrap longitude, etc.)
 * Returns a flat array of path positions, or a list of flat arrays representing multiple paths
 */
export declare function normalizePath(
  path: PathGeometry,
  size: number,
  gridResolution?: number,
  wrapLongitude?: boolean
): number[][] | NumericArray;
// # sourceMappingURL=path.d.ts.map
