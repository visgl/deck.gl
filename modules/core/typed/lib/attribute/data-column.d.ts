import type {Device} from '@luma.gl/api';
import type {Buffer as LumaBuffer} from '@luma.gl/webgl-legacy';
import {IShaderAttribute} from './shader-attribute';
import type {TypedArray, NumericArray, TypedArrayConstructor} from '../../types/types';
export declare type BufferAccessor = {
  /** A WebGL data type, see [vertexAttribPointer](https://developer.mozilla.org/en-US/docs/Web/API/WebGLRenderingContext/vertexAttribPointer#parameters). */
  type?: number;
  /** The number of elements per vertex attribute. */
  size?: number;
  /** 1 if instanced. */
  divisor?: number;
  /** Offset of the first vertex attribute into the buffer, in bytes. */
  offset?: number;
  /** The offset between the beginning of consecutive vertex attributes, in bytes. */
  stride?: number;
  /** Whether data values should be normalized. Note that all color attributes in deck.gl layers are normalized by default. */
  normalized?: boolean;
  integer?: boolean;
};
export declare type ShaderAttributeOptions = Partial<BufferAccessor> & {
  offset: number;
  stride: number;
  vertexOffset?: number;
  elementOffset?: number;
};
export declare type DataColumnOptions<Options> = Options &
  BufferAccessor & {
    id?: string;
    vertexOffset?: number;
    fp64?: boolean;
    logicalType?: number;
    isIndexed?: boolean;
    defaultValue?: number | number[];
  };
declare type DataColumnSettings<Options> = DataColumnOptions<Options> & {
  type: number;
  size: number;
  logicalType?: number;
  bytesPerElement: number;
  defaultValue: number[];
  defaultType: TypedArrayConstructor;
};
declare type DataColumnInternalState<Options, State> = State & {
  externalBuffer: LumaBuffer | null;
  bufferAccessor: DataColumnSettings<Options>;
  allocatedValue: TypedArray | null;
  numInstances: number;
  bounds: [number[], number[]] | null;
  constant: boolean;
};
export default class DataColumn<Options, State> implements IShaderAttribute {
  device: Device;
  id: string;
  size: number;
  settings: DataColumnSettings<Options>;
  value: NumericArray | null;
  doublePrecision: boolean;
  protected _buffer: LumaBuffer | null;
  protected state: DataColumnInternalState<Options, State>;
  constructor(device: Device, opts: DataColumnOptions<Options>, state: State);
  get isConstant(): boolean;
  get buffer(): LumaBuffer;
  get byteOffset(): number;
  get numInstances(): number;
  set numInstances(n: number);
  delete(): void;
  getShaderAttributes(
    id: string,
    options: Partial<ShaderAttributeOptions> | null
  ): Record<string, IShaderAttribute>;
  getBuffer(): LumaBuffer | null;
  getValue(): [LumaBuffer, BufferAccessor] | NumericArray | null;
  getAccessor(): DataColumnSettings<Options>;
  getBounds(): [number[], number[]] | null;
  setData(
    data:
      | TypedArray
      | LumaBuffer
      | ({
          constant?: boolean;
          value?: NumericArray;
          buffer?: LumaBuffer;
        } & Partial<BufferAccessor>)
  ): boolean;
  updateSubBuffer(opts?: {startOffset?: number; endOffset?: number}): void;
  allocate(numInstances: number, copy?: boolean): boolean;
  protected _checkExternalBuffer(opts: {value?: NumericArray; normalized?: boolean}): void;
  normalizeConstant(value: NumericArray): NumericArray;
  protected _normalizeValue(value: any, out: NumericArray, start: number): NumericArray;
  protected _areValuesEqual(value1: any, value2: any): boolean;
}
export {};
// # sourceMappingURL=data-column.d.ts.map
