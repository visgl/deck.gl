export {toLowPrecision} from './utils/precision';
export {default as gl} from './utils/setup-gl';

// Utilities for update tests (lifecycle tests)
export {testLayer, testInitializeLayer, testUpdateLayer, testDrawLayer} from './lifecycle-test';
export {generateLayerTests} from './generate-layer-tests';

// Basic utility for rendering multiple scenes (could go into "deck.gl/core")
export {default as TestRunner} from './test-runner';

// A utility that renders a list of scenes and compares against golden images
export {default as SnapshotTestRunner} from './snapshot-test-runner';
// A utility that emulates input events
export {default as InteractionTestRunner} from './interaction-test-runner';
