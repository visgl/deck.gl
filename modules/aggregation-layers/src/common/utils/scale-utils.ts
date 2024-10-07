// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import type {BinaryAttribute} from '@deck.gl/core';
import type {ScaleType} from '../types';

type ScaleProps = {
  scaleType: ScaleType;
  /** Trim the lower end of the domain by this percentile. Set to `0` to disable. */
  lowerPercentile: number;
  /** Trim the upper end of the domain by this percentile. Set to `100` to disable. */
  upperPercentile: number;
};

/** Applies a scale to BinaryAttribute */
export class AttributeWithScale {
  /** Input values accessor. Has either a `value` (CPU aggregation) or a `buffer` (GPU aggregation) */
  private readonly input: BinaryAttribute;
  private readonly inputLength: number;

  private props: ScaleProps = {
    scaleType: 'linear',
    lowerPercentile: 0,
    upperPercentile: 100
  };

  // cached calculations
  private _percentile?: {attribute: BinaryAttribute; domain: number[]};
  private _ordinal?: {attribute: BinaryAttribute; domain: number[]};

  /** Output values accessor */
  attribute: BinaryAttribute;
  /** [min, max] of attribute values, or null if unknown */
  domain: [number, number] | null = null;
  /** Valid domain if lower/upper percentile are defined */
  cutoff: [number, number] | null = null;

  constructor(input: BinaryAttribute, inputLength: number) {
    this.input = input;
    this.inputLength = inputLength;
    // No processing is needed with the default scale
    this.attribute = input;
  }

  private getScalePercentile() {
    if (!this._percentile) {
      const value = getAttributeValue(this.input, this.inputLength);
      this._percentile = applyScaleQuantile(value);
    }
    return this._percentile;
  }

  private getScaleOrdinal() {
    if (!this._ordinal) {
      const value = getAttributeValue(this.input, this.inputLength);
      this._ordinal = applyScaleOrdinal(value);
    }
    return this._ordinal;
  }

  /** Returns the [lowerCutoff, upperCutoff] of scaled values, or null if not applicable */
  private getCutoff({
    scaleType,
    lowerPercentile,
    upperPercentile
  }: ScaleProps): [number, number] | null {
    if (scaleType === 'quantile') {
      return [lowerPercentile, upperPercentile - 1];
    }

    if (lowerPercentile > 0 || upperPercentile < 100) {
      const {domain: thresholds} = this.getScalePercentile();
      let lowValue = thresholds[Math.floor(lowerPercentile) - 1] ?? -Infinity;
      let highValue = thresholds[Math.floor(upperPercentile) - 1] ?? Infinity;

      if (scaleType === 'ordinal') {
        const {domain: sortedUniqueValues} = this.getScaleOrdinal();
        lowValue = sortedUniqueValues.findIndex(x => x >= lowValue);
        highValue = sortedUniqueValues.findIndex(x => x > highValue) - 1;
        if (highValue === -2) {
          highValue = sortedUniqueValues.length - 1;
        }
      }
      return [lowValue, highValue];
    }

    return null;
  }

  update(props: ScaleProps) {
    const oldProps = this.props;

    if (props.scaleType !== oldProps.scaleType) {
      switch (props.scaleType) {
        case 'quantile': {
          const {attribute} = this.getScalePercentile();
          this.attribute = attribute;
          this.domain = [0, 99];
          break;
        }
        case 'ordinal': {
          const {attribute, domain} = this.getScaleOrdinal();
          this.attribute = attribute;
          this.domain = [0, domain.length - 1];
          break;
        }

        default:
          this.attribute = this.input;
          this.domain = null;
      }
    }
    if (
      props.scaleType !== oldProps.scaleType ||
      props.lowerPercentile !== oldProps.lowerPercentile ||
      props.upperPercentile !== oldProps.upperPercentile
    ) {
      this.cutoff = this.getCutoff(props);
    }
    this.props = props;
    return this;
  }
}

/**
 * Transform an array of values to ordinal indices
 */
export function applyScaleOrdinal(values: Float32Array): {
  attribute: BinaryAttribute;
  domain: number[];
} {
  const uniqueValues = new Set<number>();
  for (const x of values) {
    if (Number.isFinite(x)) {
      uniqueValues.add(x);
    }
  }
  const sortedUniqueValues = Array.from(uniqueValues).sort();
  const domainMap = new Map();
  for (let i = 0; i < sortedUniqueValues.length; i++) {
    domainMap.set(sortedUniqueValues[i], i);
  }

  return {
    attribute: {
      value: values.map(x => (Number.isFinite(x) ? domainMap.get(x) : NaN)),
      type: 'float32',
      size: 1
    },
    domain: sortedUniqueValues
  };
}

/**
 * Transform an array of values to percentiles
 */
export function applyScaleQuantile(
  values: Float32Array,
  rangeLength = 100
): {
  attribute: BinaryAttribute;
  domain: number[];
} {
  const sortedValues = Array.from(values).filter(Number.isFinite).sort(ascending);
  let i = 0;
  const n = Math.max(1, rangeLength);
  const thresholds: number[] = new Array(n - 1);
  while (++i < n) {
    thresholds[i - 1] = threshold(sortedValues, i / n);
  }
  return {
    attribute: {
      value: values.map(x => (Number.isFinite(x) ? bisectRight(thresholds, x) : NaN)),
      type: 'float32',
      size: 1
    },
    domain: thresholds
  };
}

function getAttributeValue(attribute: BinaryAttribute, length: number): Float32Array {
  const elementStride = (attribute.stride ?? 4) / 4;
  const elementOffset = (attribute.offset ?? 0) / 4;
  let value = attribute.value as Float32Array;
  if (!value) {
    const bytes = attribute.buffer?.readSyncWebGL(0, elementStride * 4 * length);
    if (bytes) {
      value = new Float32Array(bytes.buffer);
      attribute.value = value;
    }
  }

  if (elementStride === 1) {
    return value.subarray(0, length);
  }
  const result = new Float32Array(length);
  for (let i = 0; i < length; i++) {
    result[i] = value[i * elementStride + elementOffset];
  }
  return result;
}

function ascending(a: number, b: number): number {
  return a - b;
}

function threshold(domain: number[], fraction: number): number {
  const domainLength = domain.length;
  if (fraction <= 0 || domainLength < 2) {
    return domain[0];
  }
  if (fraction >= 1) {
    return domain[domainLength - 1];
  }

  const domainFraction = (domainLength - 1) * fraction;
  const lowIndex = Math.floor(domainFraction);
  const low = domain[lowIndex];
  const high = domain[lowIndex + 1];
  return low + (high - low) * (domainFraction - lowIndex);
}

function bisectRight(a: number[], x: number): number {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (a[mid] > x) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}
