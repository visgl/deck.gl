import * as Polygon from './polygon';
import {Tesselator} from '@deck.gl/core';
import type {
  PolygonGeometry,
  NormalizedPolygonGeometry,
  FlatComplexPolygonGeometry
} from './polygon';
import type {TypedArray} from '@math.gl/core';
declare type GeometryUpdateContext = {
  vertexStart: number;
  indexStart: number;
  geometrySize: number;
  geometryIndex: number;
};
declare type CutPolygon = FlatComplexPolygonGeometry & {
  edgeTypes: number[];
};
export default class PolygonTesselator extends Tesselator<
  PolygonGeometry,
  NormalizedPolygonGeometry | CutPolygon[],
  {
    fp64?: boolean;
    IndexType?: Uint32ArrayConstructor | Uint16ArrayConstructor;
    resolution?: number;
    wrapLongitude?: boolean;
    preproject?: (xy: number[]) => number[];
    full3d?: boolean;
  }
> {
  constructor(opts: any);
  /** Get attribute by name */
  get(attributeName: string): TypedArray | null;
  /** Override base Tesselator method */
  updateGeometry(opts: any): void;
  /** Implement base Tesselator interface */
  protected normalizeGeometry(polygon: PolygonGeometry): NormalizedPolygonGeometry | CutPolygon[];
  /** Implement base Tesselator interface */
  protected getGeometrySize(polygon: NormalizedPolygonGeometry | CutPolygon[]): number;
  /** Override base Tesselator method */
  protected getGeometryFromBuffer(
    buffer: any
  ): import('@deck.gl/core').AccessorFunction<any, Polygon.PolygonGeometry>;
  /** Implement base Tesselator interface */
  protected updateGeometryAttributes(
    polygon: NormalizedPolygonGeometry | CutPolygon[] | null,
    context: GeometryUpdateContext
  ): void;
  private _updateIndices;
  private _updatePositions;
  private _updateVertexValid;
}
export {};
// # sourceMappingURL=polygon-tesselator.d.ts.map
