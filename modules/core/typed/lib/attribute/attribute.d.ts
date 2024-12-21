import DataColumn, {DataColumnOptions, ShaderAttributeOptions, BufferAccessor} from './data-column';
import {IShaderAttribute} from './shader-attribute';
import {TransitionSettings} from './attribute-transition-utils';
import type {Device} from '@luma.gl/api';
import type {Buffer} from '@luma.gl/webgl-legacy';
import type {NumericArray, TypedArray} from '../../types/types';
export declare type Accessor<DataType, ReturnType> = (
  object: DataType,
  context: {
    data: any;
    index: number;
    target: number[];
  }
) => ReturnType;
export declare type Updater = (
  attribute: Attribute,
  {
    data,
    startRow,
    endRow,
    props,
    numInstances
  }: {
    data: any;
    startRow: number;
    endRow: number;
    props: any;
    numInstances: number;
  }
) => void;
export declare type AttributeOptions = DataColumnOptions<{
  transition?: boolean | Partial<TransitionSettings>;
  noAlloc?: boolean;
  update?: Updater;
  accessor?: Accessor<any, any> | string | string[];
  transform?: (value: any) => any;
  shaderAttributes?: Record<string, Partial<ShaderAttributeOptions>>;
}>;
export declare type BinaryAttribute = Partial<BufferAccessor> & {
  value?: TypedArray;
  buffer?: Buffer;
};
declare type AttributeInternalState = {
  startIndices: NumericArray | null;
  /** Legacy: external binary supplied via attribute name */
  lastExternalBuffer: TypedArray | Buffer | BinaryAttribute | null;
  /** External binary supplied via accessor name */
  binaryValue: TypedArray | Buffer | BinaryAttribute | null;
  binaryAccessor: Accessor<any, any> | null;
  needsUpdate: string | boolean;
  needsRedraw: string | boolean;
  updateRanges: number[][];
};
export default class Attribute extends DataColumn<AttributeOptions, AttributeInternalState> {
  /** Legacy approach to set attribute value - read `isConstant` instead for attribute state */
  constant: boolean;
  constructor(device: Device, opts: AttributeOptions);
  get startIndices(): NumericArray | null;
  set startIndices(layout: NumericArray | null);
  needsUpdate(): string | boolean;
  needsRedraw({clearChangedFlags}?: {clearChangedFlags?: boolean}): string | boolean;
  getUpdateTriggers(): string[];
  supportsTransition(): boolean;
  getTransitionSetting(opts: Record<string, any>): TransitionSettings | null;
  setNeedsUpdate(
    reason?: string,
    dataRange?: {
      startRow?: number;
      endRow?: number;
    }
  ): void;
  clearNeedsUpdate(): void;
  setNeedsRedraw(reason?: string): void;
  allocate(numInstances: number): boolean;
  updateBuffer({
    numInstances,
    data,
    props,
    context
  }: {
    numInstances: number;
    data: any;
    props: any;
    context: any;
  }): boolean;
  setConstantValue(value?: NumericArray): boolean;
  setExternalBuffer(buffer?: TypedArray | Buffer | BinaryAttribute): boolean;
  setBinaryValue(
    buffer?: TypedArray | Buffer | BinaryAttribute,
    startIndices?: NumericArray | null
  ): boolean;
  getVertexOffset(row: number): number;
  getShaderAttributes(): Record<string, IShaderAttribute>;
  private _autoUpdater;
  private _validateAttributeUpdaters;
  private _checkAttributeArray;
}
export {};
// # sourceMappingURL=attribute.d.ts.map
