export declare function replaceInRange({
  data,
  getIndex,
  dataRange,
  replace
}: {
  data: any[];
  getIndex: (d: any) => number;
  dataRange: {
    startRow?: number;
    endRow?: number;
  };
  replace: any[];
}): {
  startRow: Number;
  endRow: number;
};
// # sourceMappingURL=utils.d.ts.map
