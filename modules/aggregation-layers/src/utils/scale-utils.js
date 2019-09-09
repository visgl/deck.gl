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

// Linear scale maps continuous domain to continuous range
export function linearScale(domain, range, value) {
  return ((value - domain[0]) / (domain[1] - domain[0])) * (range[1] - range[0]) + range[0];
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

export function getScale(domain, range, scaleFunction) {
  function scale(value) {
    return scaleFunction(domain, range, value);
  }

  scale.domain = () => domain;
  scale.range = () => range;

  return scale;
}

// return a quantize scale function
export function getQuantizeScale(domain, range) {
  return getScale(domain, range, quantizeScale);
}

// return a linear scale function
export function getLinearScale(domain, range) {
  return getScale(domain, range, linearScale);
}

// quantile

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
function quantileScale(thresholds, range, value) {
  return range[bisectRight(thresholds, value)];
}

export function getQuantileScale(domain, range) {
  const sortedDomain = domain.sort(ascending);
  let i = 0;
  const n = Math.max(1, range.length);
  const thresholds = new Array(n - 1);
  while (++i < n) {
    thresholds[i - 1] = threshold(sortedDomain, i / n);
  }
  return value => quantileScale(thresholds, range, value);
}

// ordinal
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
  return value => ordinalScale(uniqueDomain, domainMap, range, value);
}
