declare const defaultProps: {
  getValue: (points: any) => any;
  getPoints: (bin: any) => any;
  getIndex: (bin: any) => any;
  filterData: any;
};
export declare type AggregatedBin = {
  i: number;
  value: any;
  counts: number;
};
export default class BinSorter {
  maxCount: number;
  maxValue: number;
  minValue: number;
  totalCount: number;
  aggregatedBins: AggregatedBin[];
  sortedBins: AggregatedBin[];
  binMap: Record<number, AggregatedBin>;
  constructor(bins?: any[], props?: Partial<typeof defaultProps>);
  /**
   * Get an array of object with aggregated values and index of bins
   * Array object will be sorted by value optionally.
   * @param {Array} bins
   * @param {Function} getValue
   * @return {Array} array of values and index lookup
   */
  getAggregatedBins(bins: any, props: any): AggregatedBin[];
  _percentileToIndex(percentileRange: any): [number, number];
  /**
   * Get a mapping from cell/hexagon index to sorted bin
   * This is used to retrieve bin value for color calculation
   * @return {Object} bin index to aggregatedBins
   */
  getBinMap(): Record<number, AggregatedBin>;
  /**
   * Get ths max count of all bins
   */
  _updateMinMaxValues(): void;
  /**
   * Get range of values of all bins
   * @param {Number[]} range
   * @param {Number} range[0] - lower bound
   * @param {Number} range[1] - upper bound
   * @return {Array} array of new value range
   */
  getValueRange(percentileRange: [number, number]): [number, number];
  getValueDomainByScale(
    scale: string,
    [lower, upper]?: [number?, number?]
  ): any[] | [number, number];
  _getScaleDomain(scaleType: string, [lowerIdx, upperIdx]: [number, number]): [number, number];
}
export {};
// # sourceMappingURL=bin-sorter.d.ts.map
