// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

/* eslint-disable no-console, no-invalid-this */

import {Buffer} from '@luma.gl/core';
import {device} from '@deck.gl/test-utils';
import {toDoublePrecisionArrayGPU} from '@deck.gl/core/utils/buffer-utils';
import {toDoublePrecisionArrayCPU} from '@deck.gl/core/utils/math-utils';

const ATTRIBUTE_SIZE = 3;
const ROW_COUNTS = [1e3, 1e5, 1e6];

const TEST_CASES = ROW_COUNTS.map(rowCount => {
  const source = Float64Array.from(
    {length: rowCount * ATTRIBUTE_SIZE},
    (value, index) => index + Math.PI
  );
  const bufferProps = {
    byteLength: source.length * Float64Array.BYTES_PER_ELEMENT,
    usage: Buffer.VERTEX | Buffer.STORAGE | Buffer.COPY_DST | Buffer.COPY_SRC
  };
  return {
    rowCount,
    source,
    cpuBuffer: device.createBuffer(bufferProps),
    gpuBuffer: device.createBuffer(bufferProps)
  };
});

export default function doublePrecisionBench(suite) {
  if (device.type === 'null') {
    return suite;
  }

  suite = suite.group('FLOAT64 TO GPU BUFFER');
  for (const testCase of TEST_CASES) {
    suite = suite
      .add(`CPU ${formatCount(testCase.rowCount)} vec3 rows`, () => {
        const result = toDoublePrecisionArrayCPU(testCase.source, {size: ATTRIBUTE_SIZE});
        testCase.cpuBuffer.write(result);
      })
      .add(`GPU ${formatCount(testCase.rowCount)} vec3 rows`, () => {
        toDoublePrecisionArrayGPU(testCase.gpuBuffer, testCase.source, {size: ATTRIBUTE_SIZE});
      });
  }
  return suite;
}

function formatCount(count) {
  if (count >= 1e6) {
    return `${count / 1e6}M`;
  }
  return `${count / 1e3}K`;
}
