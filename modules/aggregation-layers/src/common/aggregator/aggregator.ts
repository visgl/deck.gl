// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {Attribute, BinaryAttribute} from '@deck.gl/core';

/** Method used to reduce a list of values to one number */
export type AggregationOperation = 'SUM' | 'MEAN' | 'MIN' | 'MAX' | 'COUNT';

/** Baseline inputs to an Aggregator */
export type AggregationProps = {
  /** Number of data points */
  pointCount: number;
  /** The input data */
  attributes: {[id: string]: Attribute};
  /** How to aggregate the values inside a bin, defined for each channel */
  operations: AggregationOperation[];
  /** Additional options to control bin sorting, e.g. bin size */
  binOptions: Record<string, number | number[]>;
  /** Callback after a channel is updated */
  onUpdate?: (event: {channel: number}) => void;
};

/** Descriptor of an aggregated bin */
export type AggregatedBin = {
  /** The unique identifier of the bin */
  id: number[];
  /** Aggregated values by channel */
  value: number[];
  /** Count of data points in this bin */
  count: number;
  /** Indices of data points in this bin. Only available if using CPU aggregation. */
  pointIndices?: number[];
};

/**
 * The Aggregator interface describes a class that performs aggregation.
 *
 * _Aggregation_ is a 2-step process:
 * 1. Sort: Group a collection of _data points_ by some property into _bins_.
 * 2. Aggregate: for each _bin_, calculate a numeric output (_result_) from some metrics (_values_) from all its members.
 *    Multiple results can be obtained independently (_channels_).
 *
 * An implementation of the _Aggregator_ interface takes the following inputs:
 * - The number of data points
 * - The group that each data point belongs to, by mapping each data point to a _binId_ (integer or array of integers)
 * - The values to aggregate, by mapping each data point in each channel to one _value_ (number)
 * - The method (_operation_) to reduce a list of values to one number, such as SUM
 *
 * And yields the following outputs:
 * - A list of _binId_ that data points get sorted into
 * - The aggregated values (_result_) as a list of numbers, comprised of one number per bin per channel
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

  /** Called after props are set and before results are accessed */
  update(): void;

  /** Called before layer is drawn to screen. */
  preDraw(): void;

  /** Dispose all allocated resources */
  destroy(): void;

  /** Get the number of bins */
  get binCount(): number;

  /** Returns an accessor to the bins. */
  getBins(): BinaryAttribute | null;

  /** Returns an accessor to the output for a given channel. */
  getResult(channel: number): BinaryAttribute | null;

  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel: number): [min: number, max: number];

  /** Returns the information for a given bin. */
  getBin(index: number): AggregatedBin | null;
}
