import type {Attribute, BinaryAttribute} from '@deck.gl/core';

export type AggregationOperation = 'SUM' | 'MEAN' | 'MIN' | 'MAX';

export type AggregationProps = {
  /** Number of data points */
  pointCount: number;
  /** The input data */
  attributes: {[id: string]: Attribute};
  /** How to aggregate getWeights, defined for each channel */
  operations: AggregationOperation[];
  /** Additional options to control bin sorting, e.g. bin size */
  binOptions: Record<string, number | number[]>;
};

/**
 * _Aggregation_ is a 2-step process:
 * 1. Sort: Group a collection of _data points_ by some property into _bins_.
 * 2. Aggregate: for each _bin_, calculate one or more metrics (_channels_) from all its members.
 *
 * An implementation of the _Aggregator_ interface takes the following inputs:
 * - The number of data points
 * - The group that each data point belongs to, by mapping each data point to a _binId_ (integer or array of integers)
 * - The value(s) to aggregate, by mapping each data point in each channel to one _weight_
 * - The method (_aggregationOperation_) to reduce a list of _weights_ to one number, such as SUM
 *
 * And yields the following outputs:
 * - The aggregated values (_result_) as a list of numbers for each channel, comprised of one number per bin
 * - The [min, max] among all aggregated values (_domain_) for each channel
 *
 */
export interface Aggregator {
  /** Update aggregation props */
  setProps(props: Partial<AggregationProps>): void;

  /** Flags a channel to need update
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel?: number): void;

  /** Run aggregation */
  update(params?: unknown): void;

  /** Get the number of bins */
  get numBins(): number;

  /** Returns an accessor to the bins. */
  getBins(): BinaryAttribute | null;

  /** Returns an accessor to the output for a given channel. */
  getResult(channel: number): BinaryAttribute | null;

  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel: number): [min: number, max: number];

  /** Returns the information for a given bin. */
  getBin(index: number): {
    /** The original id */
    id: number | number[];
    /** Aggregated values by channel */
    value: number[];
    /** Count of data points in this bin */
    count: number;
  } | null;
}
