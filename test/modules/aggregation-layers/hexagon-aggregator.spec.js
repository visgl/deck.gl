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

import test from 'tape-catch';

import * as FIXTURES from 'deck.gl-test/data';

import {pointToHexbin} from '@deck.gl/aggregation-layers/hexagon-layer/hexagon-aggregator';
import {makeSpy} from '@probe.gl/test-utils';
import {log} from '@deck.gl/core';

const getPosition = d => d.COORDINATES;
const iterableData = new Set(FIXTURES.points);
const radius = 500;
const viewport = FIXTURES.sampleViewport;
const positionValue = Array.from(iterableData).reduce((acc, pt) => {
  const pos = getPosition(pt);
  acc = acc.concat([pos[0], pos[1], pos[2] || 0]);
  return acc;
}, []);
function getAccessor() {
  return {size: 3};
}
const attributes = {positions: {value: positionValue, getAccessor}};

test('pointToHexbin', t => {
  const props = {
    data: iterableData,
    radius,
    getPosition
  };
  const aggregationParams = {
    attributes,
    viewport
  };
  t.ok(typeof pointToHexbin(props, aggregationParams) === 'object', 'should work with iterables');
  t.end();
});

test('pointToHexbin#invalidData', t => {
  makeSpy(log, 'warn');
  const onePoint = Object.assign({}, FIXTURES.points[0]);
  onePoint.COORDINATES = ['', ''];
  const props = {
    data: [onePoint],
    radius,
    getPosition
  };
  const aggregationParams = {
    attributes: {positions: {value: (onePoint.COORDINATES = ['', '']), getAccessor}},
    viewport
  };
  t.ok(
    typeof pointToHexbin(props, aggregationParams) === 'object',
    'should still produce an object in the presence of non-finite values'
  );

  t.ok(log.warn.called, 'should produce a warning message in the presence of non-finite values');

  log.warn.restore();
  t.end();
});
