// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import test from 'tape';
import TEST_CASES from './test-cases';
import {WIDTH, HEIGHT, OS} from './constants';
import {SnapshotTestRunner} from '@deck.gl/test-utils';

import './jupyter-widget';

test('Render Test', t => {
  const testCases = TEST_CASES; // .filter(testCase => testCase.name === 'geojson-icon');

  // tape's default timeout is 500ms
  t.timeoutAfter(testCases.length * 10000 + 10000);

  new SnapshotTestRunner({width: WIDTH, height: HEIGHT})
    .add(testCases)
    .run({
      onTestStart: testCase => t.comment(testCase.name),
      onTestPass: (testCase, result) => t.pass(`match: ${result.matchPercentage}`),
      onTestFail: (testCase, result) => t.fail(result.error || `match: ${result.matchPercentage}`),

      timeout: 10000,

      imageDiffOptions: {
        platform: OS,
        threshold: 0.99,
        includeEmpty: false
        // uncomment to save screenshot to disk
        // , saveOnFail: true
        // uncomment `saveAs` to overwrite current golden images
        // if left commented will be saved as `[name]-fail.png.` enabling comparison
        // , saveAs: '[name].png'
      }
    })
    .then(() => t.end());
});
