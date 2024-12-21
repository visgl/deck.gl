import type {NumericArray} from '../types/types';
import type {AccessorFunction} from '../types/layer-props';
export declare function createIterable(
  data: any,
  startRow?: number,
  endRow?: number
): {
  iterable: Iterable<any>;
  objectInfo: {
    index: number;
    data: any;
    target: any[];
  };
};
export declare function isAsyncIterable(data: any): boolean;
export declare function getAccessorFromBuffer(
  typedArray: any,
  options: {
    size: number;
    stride?: number;
    offset?: number;
    startIndices?: NumericArray;
    nested?: boolean;
  }
): AccessorFunction<any, NumericArray>;
// # sourceMappingURL=iterable-utils.d.ts.map
