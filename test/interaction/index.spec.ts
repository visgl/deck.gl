// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {test, expect} from 'vitest';
import {InteractionTestRunner} from '@deck.gl/test-utils';
import type {InteractionTestCase} from '@deck.gl/test-utils';

import MapControllerTests from './map-controller.spec';
import PickingTests from './picking.spec';

interface InteractionTestSuite {
  title: string;
  props: any;
  getTestCases: () => InteractionTestCase[];
  only?: boolean;
}

function runTest({title, props, getTestCases, only = false}: InteractionTestSuite) {
  const testFn = only ? test.only : test;
  const testCases = getTestCases();
  const timeout = testCases.length * 2000 + 5000;

  testFn(
    `Interaction Test#${title}`,
    async () => {
      const results: {name: string; error?: string}[] = [];

      await new InteractionTestRunner(props, {}).add(testCases).run({
        onTestStart: testCase => {
          console.log(`# ${testCase.name}`);
        },
        onTestFail: (testCase, result) => {
          results.push({
            name: testCase.name,
            error: 'error' in result ? result.error : 'Unknown error'
          });
        }
      });

      // Check for failures
      const failures = results.filter(r => r.error);
      if (failures.length > 0) {
        const failureMessages = failures.map(f => `${f.name}: ${f.error}`).join('\n');
        expect.fail(`${failures.length} interaction test(s) failed:\n${failureMessages}`);
      }
    },
    {timeout}
  );
}

runTest(MapControllerTests);
runTest(PickingTests);
