// Copyright (c) 2015 - 2019 Uber Technologies, Inc.
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

function sumReducer(accu, cur) {
  return accu + cur;
}

function maxReducer(accu, cur) {
  return cur > accu ? cur : accu;
}

function minReducer(accu, cur) {
  return cur < accu ? cur : accu;
}

export function getMean(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(sumReducer, 0) / filtered.length : null;
}

export function getSum(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(sumReducer, 0) : null;
}

export function getMax(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(maxReducer, -Infinity) : null;
}

export function getMin(pts, accessor) {
  const filtered = pts.map(accessor).filter(Number.isFinite);

  return filtered.length ? filtered.reduce(minReducer, Infinity) : null;
}
