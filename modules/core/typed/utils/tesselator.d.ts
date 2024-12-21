import {Buffer} from '@luma.gl/webgl-legacy';
import type {BinaryAttribute} from '../lib/attribute/attribute';
import type {TypedArray} from '../types/types';
import type {AccessorFunction} from '../types/layer-props';
import type {TypedArrayManager} from './typed-array-manager';
declare type ExternalBuffer = TypedArray | Buffer | BinaryAttribute;
declare type TesselatorOptions<GeometryT, ExtraOptionsT> = ExtraOptionsT & {
  attributes?: Record<string, any>;
  getGeometry?: AccessorFunction<any, GeometryT>;
  data?: any;
  buffers?: Record<string, ExternalBuffer>;
  geometryBuffer?: ExternalBuffer;
  positionFormat?: 'XY' | 'XYZ';
  dataChanged?:
    | {
        startRow: number;
        endRow?: number;
      }[]
    | string
    | false;
  normalize?: boolean;
};
export declare type GeometryUpdateContext = {
  vertexStart: number;
  indexStart: number;
  geometrySize: number;
  geometryIndex: number;
};
export default abstract class Tesselator<GeometryT, NormalizedGeometryT, ExtraOptionsT> {
  opts: TesselatorOptions<GeometryT, ExtraOptionsT>;
  typedArrayManager: TypedArrayManager;
  indexStarts: number[];
  vertexStarts: number[];
  vertexCount: number;
  instanceCount: number;
  attributes: Record<string, TypedArray | null>;
  protected _attributeDefs: any;
  protected data: any;
  protected getGeometry?: AccessorFunction<any, GeometryT> | null;
  protected geometryBuffer?: ExternalBuffer;
  protected buffers: Record<string, ExternalBuffer>;
  protected positionSize: number;
  protected normalize: boolean;
  constructor(opts: TesselatorOptions<GeometryT, ExtraOptionsT>);
  updateGeometry(opts: TesselatorOptions<GeometryT, ExtraOptionsT>): void;
  updatePartialGeometry({startRow, endRow}: {startRow: number; endRow: number}): void;
  /** Convert geometry to a uniform shape */
  protected abstract normalizeGeometry(geometry: GeometryT): NormalizedGeometryT;
  /** Update the positions buffer of a single geometry */
  protected abstract updateGeometryAttributes(
    geometry: NormalizedGeometryT | null,
    context: GeometryUpdateContext
  ): any;
  /** Get the number of vertices in a geometry */
  protected abstract getGeometrySize(geometry: NormalizedGeometryT): number;
  protected getGeometryFromBuffer(
    geometryBuffer: ExternalBuffer
  ): AccessorFunction<any, GeometryT> | null;
  private _allocate;
  /**
   * Visit all objects
   * `data` is expected to be an iterable consistent with the base Layer expectation
   */
  private _forEachGeometry;
  private _rebuildGeometry;
}
export {};
// # sourceMappingURL=tesselator.d.ts.map
