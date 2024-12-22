export declare const AGGREGATION_OPERATION: {
  SUM: number;
  MEAN: number;
  MIN: number;
  MAX: number;
};
export declare function getMean(pts: any, accessor: any): any;
export declare function getSum(pts: any, accessor: any): any;
export declare function getMax(pts: any, accessor: any): any;
export declare function getMin(pts: any, accessor: any): any;
export declare function getValueFunc(
  aggregation: any,
  accessor: any,
  context: any
): (pts: any) => any;
declare type AccessorContext = {
  data?: any;
  index?: number;
  indices?: number[];
};
export declare function wrapGetValueFunc(
  getValue: any,
  context?: AccessorContext
): (pts: any) => any;
export {};
// # sourceMappingURL=aggregation-operation-utils.d.ts.map
