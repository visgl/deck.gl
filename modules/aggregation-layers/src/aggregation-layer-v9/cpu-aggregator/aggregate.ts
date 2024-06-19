import type {Bin} from './cpu-aggregator';
import type {AggregationOperation} from '../aggregator';

type AggregationFunc = (pointIndices: number[], getValue: (index: number) => number) => number;

const count: AggregationFunc = pointIndices => {
  return pointIndices.length;
};

const sum: AggregationFunc = (pointIndices, getValue) => {
  let result = 0;
  for (const i of pointIndices) {
    result += getValue(i);
  }
  return result;
};

const mean: AggregationFunc = (pointIndices, getValue) => {
  if (pointIndices.length === 0) {
    return NaN;
  }
  return sum(pointIndices, getValue) / pointIndices.length;
};

const min: AggregationFunc = (pointIndices, getValue) => {
  let result = Infinity;
  for (const i of pointIndices) {
    const value = getValue(i);
    if (value < result) {
      result = value;
    }
  }
  return result;
};

const max: AggregationFunc = (pointIndices, getValue) => {
  let result = -Infinity;
  for (const i of pointIndices) {
    const value = getValue(i);
    if (value > result) {
      result = value;
    }
  }
  return result;
};

const AGGREGATION_FUNC: Record<AggregationOperation, AggregationFunc> = {
  COUNT: count,
  SUM: sum,
  MEAN: mean,
  MIN: min,
  MAX: max
} as const;

/**
 * Performs the aggregation step. See interface Aggregator comments.
 * @returns Floa32Array of aggregated values, one for each bin, and the [min,max] of the values
 */
export function aggregate({
  bins,
  getValue,
  operation,
  target
}: {
  /** Data points sorted by bins */
  bins: Bin[];
  /** Given the index of a data point, returns its value */
  getValue: (index: number) => number;
  /** Method used to reduce a list of values to one number */
  operation: AggregationOperation;
  /** Optional typed array to pack values into */
  target?: Float32Array;
}): {
  value: Float32Array;
  domain: [min: number, max: number];
} {
  if (!target || target.length < bins.length) {
    target = new Float32Array(bins.length);
  }
  let min = Infinity;
  let max = -Infinity;

  const aggregationFunc = AGGREGATION_FUNC[operation];

  for (let j = 0; j < bins.length; j++) {
    const {points} = bins[j];
    target[j] = aggregationFunc(points, getValue);
    if (target[j] < min) min = target[j];
    if (target[j] > max) max = target[j];
  }

  return {value: target, domain: [min, max]};
}
