import test from 'tape';
import {InteractionTestRunner} from '@deck.gl/test-utils';

import MapControllerTests from './map-controller';
import PickingTests from './picking';
import MVTLayerPickingTests from './mvt-layer-picking';

runTest(MapControllerTests);
runTest(PickingTests);
runTest(MVTLayerPickingTests);

function runTest({title, props, getTestCases, only = false}) {
  (only ? test.only : test)(`Interaction Test#${title}`, t => {
    const testCases = getTestCases(t);
    // tape's default timeout is 500ms
    t.timeoutAfter(testCases.length * 1000);

    new InteractionTestRunner(props)
      .add(testCases)
      .run({
        onTestStart: testCase => t.comment(testCase.name)
      })
      .then(() => t.end());
  });
}
