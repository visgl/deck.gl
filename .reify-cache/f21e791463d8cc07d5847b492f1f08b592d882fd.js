"use strict";var test;module.link('tape-catch',{default(v){test=v}},0);var PathTesselator;module.link('@deck.gl/layers/path-layer/path-tesselator',{default(v){PathTesselator=v}},1);// Copyright (c) 2015 - 2017 Uber Technologies, Inc.
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





const SAMPLE_DATA = [
  {path: [], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1]], width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1], [2, 2], [3, 3]], width: 2, dashArray: [0, 0], color: [255, 0, 0]},
  {path: new Float64Array([1, 1, 2, 2, 3, 3]), width: 1, dashArray: [0, 0], color: [0, 0, 0]},
  {path: [[1, 1], [2, 2], [3, 3], [1, 1]], width: 3, dashArray: [2, 1], color: [0, 0, 255]}
];
const INSTANCE_COUNT = 7;

const TEST_DATA = [
  {
    title: 'Plain array',
    data: SAMPLE_DATA,
    getGeometry: d => d.path,
    positionFormat: 'XY'
  },
  {
    title: 'Iterable',
    data: new Set(SAMPLE_DATA),
    getGeometry: d => d.path,
    positionFormat: 'XY'
  }
];

const TEST_CASES = [
  {
    title: 'Tesselation',
    params: {}
  },
  {
    title: 'Tesselation(fp64)',
    params: {fp64: true}
  }
];

test('PathTesselator#imports', t => {
  t.ok(typeof PathTesselator === 'function', 'PathTesselator imported');
  t.end();
});

test('PathTesselator#constructor', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Path data: ${testData.title}`);
    const tesselator = new PathTesselator(testData);
    t.ok(tesselator instanceof PathTesselator, 'PathTesselator created');
    t.is(tesselator.instanceCount, INSTANCE_COUNT, 'Coorectly counted instances');
  });

  t.end();
});

test('PathTesselator#constructor', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Path data: ${testData.title}`);

    TEST_CASES.forEach(testCase => {
      t.comment(`  ${testCase.title}`);
      const tesselator = new PathTesselator(Object.assign({}, testData, testCase.params));

      t.ok(
        ArrayBuffer.isView(tesselator.get('startPositions')),
        'PathTesselator.get startPositions'
      );
      t.deepEquals(
        tesselator.get('startPositions').slice(0, 6),
        [1, 1, 0, 2, 2, 0],
        'startPositions are filled'
      );

      t.ok(ArrayBuffer.isView(tesselator.get('endPositions')), 'PathTesselator.get endPositions');
      t.deepEquals(
        tesselator.get('endPositions').slice(0, 6),
        [2, 2, 0, 3, 3, 0],
        'endPositions are filled'
      );
      t.deepEquals(
        tesselator.get('endPositions').slice(-3),
        [1, 1, 0],
        'endPositions is handling loop correctly'
      );

      t.ok(ArrayBuffer.isView(tesselator.get('leftDeltas')), 'PathTesselator.get leftDeltas');
      t.ok(tesselator.get('leftDeltas').every(Number.isFinite), 'Valid leftDeltas attribute');
      t.deepEquals(
        tesselator.get('leftDeltas').slice(0, 6),
        [0, 0, 0, 1, 1, 0],
        'leftDeltas are filled'
      );

      t.ok(ArrayBuffer.isView(tesselator.get('rightDeltas')), 'PathTesselator.get rightDeltas');
      t.deepEquals(
        tesselator.get('rightDeltas').slice(0, 6),
        [1, 1, 0, 0, 0, 0],
        'rightDeltas are filled'
      );
      t.ok(tesselator.get('rightDeltas').every(Number.isFinite), 'Valid rightDeltas attribute');
      t.deepEquals(
        tesselator.get('rightDeltas').slice(-3),
        [1, 1, 0],
        'rightDeltas is handling loop correctly'
      );

      if (testCase.params.fp64) {
        t.ok(
          ArrayBuffer.isView(tesselator.get('startEndPositions64XyLow')),
          'PathTesselator.get startEndPositions64XyLow'
        );
      }
    });
  });

  t.end();
});

test('PolygonTesselator#methods', t => {
  TEST_DATA.forEach(testData => {
    t.comment(`Path data: ${testData.title}`);
    const tesselator = new PathTesselator(testData);

    const strokeWidths = tesselator.get(
      'strokeWidths',
      new Float32Array(INSTANCE_COUNT),
      d => d.width
    );
    t.ok(ArrayBuffer.isView(strokeWidths), 'PathTesselator.get strokeWidths');
    t.deepEquals(strokeWidths, [2, 2, 1, 1, 3, 3, 3], 'strokeWidths are filled');

    const dashArrays = tesselator.get(
      'dashArrays',
      new Float32Array(INSTANCE_COUNT * 2),
      d => d.dashArray
    );
    t.ok(ArrayBuffer.isView(dashArrays), 'PathTesselator.get dashArrays');
    t.deepEquals(dashArrays, [0, 0, 0, 0, 0, 0, 0, 0, 2, 1, 2, 1, 2, 1], 'dashArrays are filled');

    const colors = tesselator.get(
      'colors',
      new Uint8ClampedArray(INSTANCE_COUNT * 4),
      d => d.color
    );
    t.ok(ArrayBuffer.isView(colors), 'PathTesselator.get colors');
    t.deepEquals(colors.slice(0, 4), [255, 0, 0, 255], 'colors are filled');

    const pickingColors = tesselator.get(
      'pickingColors',
      new Uint8ClampedArray(INSTANCE_COUNT * 3),
      index => [0, 0, index]
    );
    t.ok(ArrayBuffer.isView(pickingColors), 'PathTesselator.get pickingColors');
    t.deepEquals(pickingColors.slice(0, 6), [0, 0, 2, 0, 0, 2], 'pickingColors are filled');
  });

  t.end();
});
