export {toLowPrecision} from './utils/precision';
export {default as gl} from './utils/setup-gl';

// Utilities for update tests (lifecycle tests)
export {testLayer} from './lifecycle-test';

// Deprecated utilities for update tests (lifecycle tests)
export {testInitializeLayer, testUpdateLayer, testDrawLayer} from './lifecycle-test-deprecated';

// Basic utility for rendering multiple scenes (could go into "deck.gl/core")
export {default as SceneRenderer} from './scene-renderer';

// A utility that renders a list of scenes and compares against golden images
export {default as RenderTest} from './render-test';
