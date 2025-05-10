// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape-promise/tape';

import {OrthographicViewport} from '@deck.gl/core';

const fitBounds = OrthographicViewport.fitBounds;

test('OrthographicViewport#fitBounds - square bounds in square viewport (zoomMode=per-axis)', t => {
  const result = fitBounds({
    bounds: [
      [0, 0],
      [100, 100]
    ],
    width: 200,
    height: 200
  });

  t.deepEqual(result.target, [50, 50], 'target is center of bounds');
  t.deepEqual(result.zoom, [Math.log2(2), Math.log2(2)], 'zoom scales correctly');
  t.end();
});

test('OrthographicViewport#fitBounds - wider viewport than bounds (zoomMode=single)', t => {
  const result = fitBounds({
    bounds: [
      [0, 0],
      [100, 100]
    ],
    width: 400,
    height: 200,
    zoomMode: 'single'
  });

  t.deepEqual(result.target, [50, 50], 'target is center');
  const scale = Math.min(400 / 100, 200 / 100); // = 2
  t.equal(result.zoom, Math.log2(scale), 'zoom uses smaller dimension to fit');
  t.end();
});

test('OrthographicViewport#fitBounds - tall bounds, wide viewport', t => {
  const result = fitBounds({
    bounds: [
      [0, 0],
      [50, 200]
    ],
    width: 300,
    height: 150
  });

  const scaleX = 300 / 50;
  const scaleY = 150 / 200;
  const zoomX = Math.log2(scaleX);
  const zoomY = Math.log2(scaleY);

  t.deepEqual(result.zoom, [zoomX, zoomY], 'per-axis zoom reflects size mismatch');
  t.end();
});

test('OrthographicViewport#fitBounds - degenerate box (zero width)', t => {
  const result = fitBounds({
    bounds: [
      [10, 10],
      [10, 100]
    ],
    width: 200,
    height: 200
  });

  t.ok(!Number.isFinite(result.zoom[0]), 'zoomX is infinite for zero width');
  t.end();
});

test('OrthographicViewport#fitBounds - degenerate box (zero area)', t => {
  const result = fitBounds({
    bounds: [
      [42, 42],
      [42, 42]
    ],
    width: 500,
    height: 500
  });

  t.deepEqual(result.target, [42, 42], 'target remains valid');
  t.ok(
    !Number.isFinite(result.zoom[0]) && !Number.isFinite(result.zoom[1]),
    'zoom is infinite for zero area'
  );
  t.end();
});
