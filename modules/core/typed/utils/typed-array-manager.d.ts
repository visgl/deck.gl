import {TypedArray, TypedArrayConstructor} from '../types/types';
export declare type TypedArrayManagerOptions = {
  overAlloc?: number;
  poolSize?: number;
};
export declare class TypedArrayManager {
  private _pool;
  opts: {
    overAlloc: number;
    poolSize: number;
  };
  constructor(options?: TypedArrayManagerOptions);
  setOptions(options: TypedArrayManagerOptions): void;
  allocate<T extends TypedArray>(
    typedArray: T | null | undefined,
    count: number,
    {
      size,
      type,
      padding,
      copy,
      initialize,
      maxCount
    }: {
      size?: number;
      type?: TypedArrayConstructor;
      padding?: number;
      copy?: boolean;
      initialize?: boolean;
      maxCount?: number;
    }
  ): T;
  release(typedArray: TypedArray | null | undefined): void;
  private _allocate;
  private _release;
}
declare const _default: TypedArrayManager;
export default _default;
// # sourceMappingURL=typed-array-manager.d.ts.map
