// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
//
// Permission is hereby granted, free of charge, to any person obtaining a copy
// of this software and associated documentation files (the "Software"), to deal
// in the Software without restriction, including without limitation the rights
// to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
// copies of the Software, and to permit persons to whom the Software is
// furnished to do so, subject to the following conditions:
//
// The above copyright notice and this permission notice shall be included in
// all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
// IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
// FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
// AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
// LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
// OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
// THE SOFTWARE.

import {log} from '@deck.gl/core';

// a scale function wrapper just like d3-scales
export function getScale(domain, range, scaleFunction) {
  const scale = scaleFunction;
  scale.domain = () => domain;
  scale.range = () => range;

  return scale;
}

// Quantize scale is similar to linear scales,
// except it uses a discrete rather than continuous range
// return a quantize scale function
export function getQuantizeScale(domain, range) {
  const scaleFunction = value => quantizeScale(domain, range, value);

  return getScale(domain, range, scaleFunction);
}

// return a linear scale function
export function getLinearScale(domain, range) {
  const scaleFunction = value => linearScale(domain, range, value);

  return getScale(domain, range, scaleFunction);
}

export function getQuantileScale(domain, range) {
  // calculate threshold
  const sortedDomain = domain.sort(ascending);
  let i = 0;
  const n = Math.max(1, range.length);
  const thresholds = new Array(n - 1);
  while (++i < n) {
    thresholds[i - 1] = threshold(sortedDomain, i / n);
  }

  const scaleFunction = value => thresholdsScale(thresholds, range, value);
  scaleFunction.thresholds = () => thresholds;

  return getScale(domain, range, scaleFunction);
}

function ascending(a, b) {
  return a - b;
}

function threshold(domain, fraction) {
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

function bisectRight(a, x) {
  let lo = 0;
  let hi = a.length;
  while (lo < hi) {
    const mid = (lo + hi) >>> 1;
    if (ascending(a[mid], x) > 0) {
      hi = mid;
    } else {
      lo = mid + 1;
    }
  }
  return lo;
}

// return a quantize scale function
function thresholdsScale(thresholds, range, value) {
  return range[bisectRight(thresholds, value)];
}

// ordinal Scale
function ordinalScale(domain, domainMap, range, value) {
  const key = `${value}`;
  let d = domainMap.get(key);
  if (d === undefined) {
    // update the domain
    d = domain.push(value);
    domainMap.set(key, d);
  }
  return range[(d - 1) % range.length];
}

export function getOrdinalScale(domain, range) {
  const domainMap = new Map();
  const uniqueDomain = [];
  for (const d of domain) {
    const key = `${d}`;
    if (!domainMap.has(key)) {
      domainMap.set(key, uniqueDomain.push(d));
    }
  }

  const scaleFunction = value => ordinalScale(uniqueDomain, domainMap, range, value);

  return getScale(domain, range, scaleFunction);
}

// Quantize scale is similar to linear scales,
// except it uses a discrete rather than continuous range
export function quantizeScale(domain, range, value) {
  const domainRange = domain[1] - domain[0];
  if (domainRange <= 0) {
    log.warn('quantizeScale: invalid domain, returning range[0]')();
    return range[0];
  }
  const step = domainRange / range.length;
  const idx = Math.floor((value - domain[0]) / step);
  const clampIdx = Math.max(Math.min(idx, range.length - 1), 0);

  return range[clampIdx];
}

// Linear scale maps continuous domain to continuous range
export function linearScale(domain, range, value) {
  return ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
}

// get scale domains
function notNullOrUndefined(d) {
  return d !== undefined && d !== null;
}

export function unique(values) {
  const results = [];
  values.forEach(v => {
    if (!results.includes(v) && notNullOrUndefined(v)) {
      results.push(v);
    }
  });

  return results;
}

function getTruthyValues(data, valueAccessor) {
  const values = typeof valueAccessor === 'function' ? data.map(valueAccessor) : data;
  return values.filter(notNullOrUndefined);
}

export function getLinearDomain(data, valueAccessor) {
  const sorted = getTruthyValues(data, valueAccessor).sort();
  return sorted.length ? [sorted[0], sorted[sorted.length - 1]] : [0, 0];
}

export function getQuantileDomain(data, valueAccessor) {
  return getTruthyValues(data, valueAccessor);
}

export function getOrdinalDomain(data, valueAccessor) {
  return unique(getTruthyValues(data, valueAccessor));
}

export function getScaleDomain(scaleType, data, valueAccessor) {
  switch (scaleType) {
    case 'quantize':
    case 'linear':
      return getLinearDomain(data, valueAccessor);

    case 'quantile':
      return getQuantileDomain(data, valueAccessor);

    case 'ordinal':
      return getOrdinalDomain(data, valueAccessor);

    default:
      return getLinearDomain(data, valueAccessor);
  }
}

export function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export function getScaleFunctionByScaleType(scaleType) {
  switch (scaleType) {
    case 'quantize':
      return getQuantizeScale;
    case 'linear':
      return getLinearScale;
    case 'quantile':
      return getQuantileScale;
    case 'ordinal':
      return getOrdinalScale;

    default:
      return getQuantizeScale;
  }
}
