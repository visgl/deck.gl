export {toLowPrecision} from './utils/precision';
export {default as gl} from './utils/setup-gl';
export * from './luma.gl/gpgpu';

// Utilities for update tests (lifecycle tests)
export {testLayer} from './lifecycle-test';

// Deprecated utilities for update tests (lifecycle tests)
export {
  testInitializeLayer,
  testUpdateLayer,
  testDrawLayer,
  testLayerUpdates,
  testSubLayerUpdateTriggers,
  testCreateLayer,
  testCreateEmptyLayer,
  testNullLayer
} from './lifecycle-test-deprecated';

// Basic utility for rendering multiple scenes (could go into "deck.gl/core")
export {default as SceneRenderer} from './scene-renderer';

// A utility that renders a list of scenes and compares against golden images
export {default as RenderTest} from './render-test';

// Node.js test drivers
export {default as RenderTestDriver} from './drivers/render-test-driver';
