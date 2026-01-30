// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import TEST_CASES from './test-cases';
import {WIDTH, HEIGHT, OS} from './constants';
import {SnapshotTestRunner} from '@deck.gl/test-utils';

// TODO: Migrate jupyter-widget.js to vitest (currently disabled due to luma.gl v9 canvas sizing issues)
// import './jupyter-widget';

// Calculate timeout based on number of test cases
const TIMEOUT_PER_CASE = 10000;
const TOTAL_TIMEOUT = TEST_CASES.length * TIMEOUT_PER_CASE + 10000;

test(
  'Render Test',
  async () => {
    const testCases = TEST_CASES; // .filter(testCase => testCase.name === 'geojson-icon');
    const results: {name: string; passed: boolean; message: string}[] = [];

    await new SnapshotTestRunner({width: WIDTH, height: HEIGHT}).add(testCases).run({
      onTestStart: testCase => {
        console.log(`# ${testCase.name}`);
      },
      onTestPass: (testCase, result) => {
        console.log(`ok ${testCase.name} - match: ${result.matchPercentage}`);
        results.push({
          name: testCase.name,
          passed: true,
          message: `match: ${result.matchPercentage}`
        });
      },
      onTestFail: (testCase, result) => {
        const message =
          'error' in result && result.error
            ? result.error
            : 'matchPercentage' in result
              ? `match: ${result.matchPercentage}`
              : 'Unknown error';
        console.log(`not ok ${testCase.name} - ${message}`);
        results.push({
          name: testCase.name,
          passed: false,
          message: String(message)
        });
      },

      timeout: TIMEOUT_PER_CASE,

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
    });

    // After all tests complete, check for failures
    const failures = results.filter(r => !r.passed);
    if (failures.length > 0) {
      const failureMessages = failures.map(f => `${f.name}: ${f.message}`).join('\n');
      expect.fail(`${failures.length} render test(s) failed:\n${failureMessages}`);
    }

    // All tests passed
    expect(results.length).toBeGreaterThan(0);
  },
  {timeout: TOTAL_TIMEOUT}
);
