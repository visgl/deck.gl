import {Tesselator} from '@deck.gl/core';
import type {TypedArray} from '@math.gl/core';
import type {PathGeometry, NormalizedPathGeometry} from './path';
export default class PathTesselator extends Tesselator<
  PathGeometry,
  NormalizedPathGeometry,
  {
    fp64?: boolean;
    resolution?: number;
    wrapLongitude?: boolean;
    loop?: boolean;
  }
> {
  constructor(opts: any);
  /** Get packed attribute by name */
  get(attributeName: string): TypedArray | null;
  protected getGeometryFromBuffer(
    buffer: any
  ): import('@deck.gl/core').AccessorFunction<any, PathGeometry>;
  protected normalizeGeometry(path: PathGeometry): number[][] | PathGeometry;
  protected getGeometrySize(path: NormalizedPathGeometry): number;
  protected updateGeometryAttributes(
    path: NormalizedPathGeometry | null,
    context: {
      vertexStart: number;
      geometrySize: number;
    }
  ): void;
  private _updateSegmentTypes;
  private _updatePositions;
  /** Returns the number of points in the path */
  private getPathLength;
  /** Returns a point on the path at the specified index */
  private getPointOnPath;
  private isClosed;
}
// # sourceMappingURL=path-tesselator.d.ts.map
