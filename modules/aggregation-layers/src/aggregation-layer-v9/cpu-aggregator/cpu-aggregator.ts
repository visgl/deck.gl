import type {Aggregator, AggregationProps} from '../aggregator';
import {_deepEqual as deepEqual, BinaryAttribute} from '@deck.gl/core';
import {sortBins, packBinIds} from './sort';
import {aggregateChannel} from './aggregate';
import {VertexAccessor, evaluateVertexAccessor} from './vertex-accessor';

/** Settings used to construct a new CPUAggregator */
export type CPUAggregatorSettings = {
  /** Size of bin IDs */
  dimensions: number;
  /** Accessor to map each data point to a bin ID.
   * If dimensions=1, bin ID should be a number;
   * If dimensions>1, bin ID should be an array with [dimensions] elements;
   * The data point will be skipped if bin ID is null.
   */
  getBin: VertexAccessor<number | number[] | null, any>;
  /** Accessor to map each data point to a weight value, defined per channel */
  getWeight: VertexAccessor<number>[];
};

/** Options used to run CPU aggregation, can be changed at any time */
export type CPUAggregationProps = AggregationProps & {};

export type Bin = {
  id: number | number[];
  index: number;
  /** list of data point indices */
  points: number[];
};

/** An Aggregator implementation that calculates aggregation on the CPU */
export class CPUAggregator implements Aggregator {
  dimensions: number;
  numChannels: number;

  props: CPUAggregationProps = {
    binOptions: {},
    pointCount: 0,
    operations: [],
    attributes: {}
  };

  protected getBinId: CPUAggregatorSettings['getBin'];
  protected getWeight: CPUAggregatorSettings['getWeight'];
  /** Dirty flag
   * If true, redo sorting
   * If array, redo aggregation on the specified channel
   */
  protected needsUpdate: boolean[] | boolean;

  protected bins: Bin[] = [];
  protected binIds: Float32Array | null = null;
  protected results: {value: Float32Array; domain: [min: number, max: number]}[] = [];

  constructor({dimensions, getBin, getWeight}: CPUAggregatorSettings) {
    this.dimensions = dimensions;
    this.numChannels = getWeight.length;
    this.getBinId = getBin;
    this.getWeight = getWeight;
    this.needsUpdate = true;
  }

  get numBins() {
    return this.bins.length;
  }

  /** Update aggregation props */
  setProps(props: Partial<CPUAggregationProps>) {
    const oldProps = this.props;

    if (props.binOptions) {
      if (!deepEqual(props.binOptions, oldProps.binOptions, 2)) {
        this.setNeedsUpdate();
      }
    }
    if (props.operations) {
      for (let channel = 0; channel < this.numChannels; channel++) {
        if (props.operations[channel] !== oldProps.operations[channel]) {
          this.setNeedsUpdate(channel);
        }
      }
    }
    if (props.pointCount !== undefined && props.pointCount !== oldProps.pointCount) {
      this.setNeedsUpdate();
    }
    if (props.attributes) {
      props.attributes = {...oldProps.attributes, ...props.attributes};
    }
    Object.assign(this.props, props);
  }

  /** Flags a channel to need update
   * This is called internally by setProps() if certain props change
   * Users of this class still need to manually set the dirty flag sometimes, because even if no props changed
   * the underlying buffers could have been updated and require rerunning the aggregation
   * @param {number} channel - mark the given channel as dirty. If not provided, all channels will be updated.
   */
  setNeedsUpdate(channel?: number) {
    if (channel === undefined) {
      this.needsUpdate = true;
    } else if (this.needsUpdate !== true) {
      this.needsUpdate = this.needsUpdate || [];
      this.needsUpdate[channel] = true;
    }
  }

  /** Run aggregation */
  update() {
    if (this.needsUpdate === true) {
      this.bins = sortBins({
        pointCount: this.props.pointCount,
        getBinId: evaluateVertexAccessor(
          this.getBinId,
          this.props.attributes,
          this.props.binOptions
        )
      });
      this.binIds = packBinIds({
        bins: this.bins,
        dimensions: this.dimensions,
        target: this.binIds
      });
    }
    for (let channel = 0; channel < this.numChannels; channel++) {
      if (this.needsUpdate === true || this.needsUpdate[channel]) {
        this.results[channel] = aggregateChannel({
          bins: this.bins,
          getWeight: evaluateVertexAccessor(
            this.getWeight[channel],
            this.props.attributes,
            undefined
          ),
          operation: this.props.operations[channel],
          target: this.results[channel]?.value
        });
      }
    }
  }

  /** Returns an accessor to the bins. */
  getBins(): BinaryAttribute | null {
    if (!this.binIds) {
      return null;
    }
    return {value: this.binIds, type: 'float32', size: this.dimensions};
  }

  /** Returns an accessor to the output for a given channel. */
  getResult(channel: number): BinaryAttribute | null {
    const result = this.results[channel];
    if (!result) {
      return null;
    }
    return {value: result.value, type: 'float32', size: 1};
  }

  /** Returns the [min, max] of aggregated values for a given channel. */
  getResultDomain(channel: number): [min: number, max: number] {
    return this.results[channel]?.domain ?? [Infinity, -Infinity];
  }

  /** Returns the information for a given bin. */
  getBin(index: number): {
    /** The original id */
    id: number | number[];
    /** Aggregated values by channel */
    value: number[];
    /** Count of data points in this bin */
    count: number;
    /** List of data point indices that fall into this bin. */
    points?: number[];
  } | null {
    const bin = this.bins[index];
    if (!bin) {
      return null;
    }
    const value = new Array(this.numChannels);
    for (let i = 0; i < value.length; i++) {
      const result = this.results[i];
      value[i] = result?.value[index];
    }
    return {
      id: bin.id,
      value,
      count: bin.points.length,
      points: bin.points
    };
  }
}
