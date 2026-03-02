// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';

// Playwright provider with viewport configured for render tests
const renderPlaywright = playwright({
  contextOptions: {
    viewport: {width: 1024, height: 768}
  }
});
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';
import {browserCommands} from './test/setup/browser-commands';

const packageRoot = dirname(fileURLToPath(import.meta.url));

// Tests that were commented out or never imported in the original test suite
// These need to be fixed before being included
const excludedTests = [
  'test/modules/carto/index.spec.ts',
  'test/modules/layers/path-tesselator.spec.ts',
  'test/modules/layers/polygon-tesselation.spec.ts',
  'test/modules/widgets/geocoders.spec.ts',
  // Mask tests were commented out on master (luma.gl v9 uniforms API change)
  'test/modules/extensions/mask/mask.spec.ts',
  'test/modules/extensions/mask/mask-pass.spec.ts',
  // Commented out on master - Transform not exported from @luma.gl/engine
  'test/modules/layers/path-layer/path-layer-vertex.spec.ts',
  // Commented out on master - collision-filter extension test
  'test/modules/extensions/collision-filter/collision-filter.spec.ts',
  // Pre-existing code bug: data-column.ts overwrites user stride/offset - fix on master first
  'test/modules/core/lib/attribute/attribute.spec.ts',
  // Needs investigation: timeout, spy count mismatch, async timing issues
  'test/modules/geo-layers/tile-3d-layer/tile-3d-layer.spec.ts',
  'test/modules/core/lib/layer-extension.spec.ts',
  'test/modules/core/lib/pick-layers.spec.ts',
  'test/modules/geo-layers/terrain-layer.spec.ts',
  'test/modules/geo-layers/mvt-layer.spec.ts',
  // TODO: H3TileLayer autoHighlight test times out (>30s) - needs investigation
  'test/modules/carto/layers/h3-tile-layer.spec.ts',
  // Flaky in CI with isolate: false - GPU/WebGL state leakage between tests
  // These tests pass individually but fail when run in the full suite
  'test/modules/aggregation-layers/hexbin.spec.ts',
  'test/modules/core/lib/deck-picker.spec.ts',
  'test/modules/carto/layers/schema/carto-raster-tile-loader.spec.ts',
  'test/modules/carto/layers/schema/carto-raster-tile.spec.ts',
  'test/modules/core/controllers/controllers.spec.ts',
  // Interaction tests are timing-sensitive and fail in CI headless mode
  // They work in the render project with proper viewport configuration
  'test/interaction/map-controller.spec.ts',
  // TerrainEffect tests timeout (>30s) with isolate: false
  'test/modules/extensions/terrain/terrain-effect.spec.ts',
  // GLViewport test fails due to viewport state leakage
  'test/modules/core/passes/layers-pass.spec.ts'
];

// Match aliases from .ocularrc.js
// Note: Order matters for Vite - more specific paths must come before less specific ones
const aliases = {
  // Explicit vitest entry point (must come before @deck.gl/test-utils)
  '@deck.gl/test-utils/vitest': resolve(packageRoot, 'modules/test-utils/src/vitest.ts'),
  '@deck.gl/aggregation-layers': resolve(packageRoot, 'modules/aggregation-layers/src'),
  '@deck.gl/arcgis': resolve(packageRoot, 'modules/arcgis/src'),
  '@deck.gl/carto': resolve(packageRoot, 'modules/carto/src'),
  '@deck.gl/core': resolve(packageRoot, 'modules/core/src'),
  '@deck.gl/extensions': resolve(packageRoot, 'modules/extensions/src'),
  '@deck.gl/geo-layers': resolve(packageRoot, 'modules/geo-layers/src'),
  '@deck.gl/google-maps': resolve(packageRoot, 'modules/google-maps/src'),
  '@deck.gl/json': resolve(packageRoot, 'modules/json/src'),
  '@deck.gl/jupyter-widget': resolve(packageRoot, 'modules/jupyter-widget/src'),
  '@deck.gl/layers': resolve(packageRoot, 'modules/layers/src'),
  '@deck.gl/mapbox': resolve(packageRoot, 'modules/mapbox/src'),
  '@deck.gl/mesh-layers': resolve(packageRoot, 'modules/mesh-layers/src'),
  '@deck.gl/react': resolve(packageRoot, 'modules/react/src'),
  '@deck.gl/test-utils': resolve(packageRoot, 'modules/test-utils/src'),
  '@deck.gl/widgets': resolve(packageRoot, 'modules/widgets/src'),
  'deck.gl': resolve(packageRoot, 'modules/main/src'),
  'deck.gl-test': resolve(packageRoot, 'test')
};

// Browser aliases - redirect @deck.gl/test-utils to vitest entry for backwards compatibility
// until all tests are migrated to import from @deck.gl/test-utils/vitest explicitly
const browserAliases = {
  ...aliases,
  '@deck.gl/test-utils': resolve(packageRoot, 'modules/test-utils/src/vitest.ts')
};

// Shared coverage configuration
const coverageConfig = {
  provider: 'v8' as const,
  reporter: ['text', 'lcov'],
  include: ['modules/*/src/**/*.ts'],
  exclude: ['modules/test-utils/**', '**/node_modules/**']
};

// Pre-bundle dependencies to avoid Vite reloading during tests
// This prevents flaky tests caused by runtime dependency discovery
const optimizeDepsConfig = {
  include: [
    // Preact JSX runtime discovered at runtime
    'preact/jsx-dev-runtime',
    'preact/jsx-runtime',
    // Vitest browser dependencies
    'vitest/browser',
    // luma.gl WebGL dependencies
    '@luma.gl/core',
    '@luma.gl/engine',
    '@luma.gl/webgl',
    '@luma.gl/shadertools',
    '@luma.gl/effects',
    // loaders.gl dependencies
    '@loaders.gl/polyfills',
    '@loaders.gl/core',
    '@loaders.gl/images'
  ]
};

// Server configuration for serving test data files with correct MIME types
// Without this, binary files like .mvt may be served incorrectly
const serverConfig = {
  fs: {
    // Allow serving files from test/data directory
    allow: [packageRoot]
  }
};

// Include binary file extensions as static assets
// This ensures Vite serves them with correct MIME types
const assetsIncludeConfig = [
  '**/*.mvt', // Mapbox Vector Tiles
  '**/*.pbf', // Protocol Buffers
  '**/*.glb', // glTF Binary
  '**/*.gltf', // glTF
  '**/*.bin', // Binary data
  '**/*.terrain' // Terrain files
];

export default defineConfig({
  test: {
    projects: [
      // Node project - simple smoke tests (*.node.spec.ts only)
      // Used by test-fast for quick validation
      {
        extends: true,
        resolve: {alias: aliases},
        test: {
          name: 'node',
          environment: 'node',
          include: ['test/modules/**/*.node.spec.ts'],
          globals: false,
          testTimeout: 30000,
          setupFiles: ['./test/setup/vitest-node-setup.ts'],
          // Unique sequence order for running multiple projects together
          sequence: {groupOrder: [1]}
        }
      },

      // Headless project - unit tests in headless browser
      // Used by test-headless and test-ci
      {
        extends: true,
        resolve: {alias: browserAliases},
        optimizeDeps: optimizeDepsConfig,
        assetsInclude: assetsIncludeConfig,
        server: serverConfig,
        test: {
          name: 'headless',
          include: ['test/modules/**/*.spec.ts', 'test/interaction/**/*.spec.ts'],
          exclude: [...excludedTests, 'test/modules/**/*.node.spec.ts'],
          globals: false,
          testTimeout: 30000,
          // Disable isolation and file parallelism to avoid:
          // 1. Re-initializing WebGL/luma.gl for each test file (1090s -> 2s import time)
          // 2. WebGL context contention when running many tests in parallel
          isolate: false,
          fileParallelism: false,
          setupFiles: ['./test/setup/vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            provider: playwright(),
            instances: [{browser: 'chromium'}],
            headless: true,
            screenshotFailures: false,
            commands: browserCommands
          },
          coverage: coverageConfig,
          // Unique sequence order for running multiple projects together
          sequence: {groupOrder: [2]}
        }
      },

      // Browser project - full test suite in headed browser for local development
      // Used by test-browser
      {
        extends: true,
        resolve: {alias: browserAliases},
        optimizeDeps: optimizeDepsConfig,
        assetsInclude: assetsIncludeConfig,
        server: serverConfig,
        test: {
          name: 'browser',
          include: [
            'test/modules/**/*.spec.ts',
            'test/render/**/*.spec.ts',
            'test/interaction/**/*.spec.ts'
          ],
          exclude: [...excludedTests, 'test/modules/**/*.node.spec.ts'],
          globals: false,
          testTimeout: 30000,
          isolate: false,
          fileParallelism: false,
          setupFiles: ['./test/setup/vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            provider: renderPlaywright,
            instances: [{browser: 'chromium'}],
            headless: false,
            screenshotFailures: false,
            commands: browserCommands
          },
          // Unique sequence order for running multiple projects together
          sequence: {groupOrder: [3]}
        }
      },

      // Render project - visual regression and interaction tests (separate from headless for easier debugging)
      // Used by test-render
      {
        extends: true,
        resolve: {alias: browserAliases},
        optimizeDeps: optimizeDepsConfig,
        assetsInclude: assetsIncludeConfig,
        server: serverConfig,
        test: {
          name: 'render',
          include: ['test/render/**/*.spec.ts', 'test/interaction/**/*.spec.ts'],
          globals: false,
          testTimeout: 300000, // Render tests need longer timeout
          isolate: false,
          fileParallelism: false,
          setupFiles: ['./test/setup/vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            provider: renderPlaywright,
            instances: [{
              browser: 'chromium',
              viewport: {width: 1024, height: 768}
            }],
            headless: true,
            screenshotFailures: false,
            commands: browserCommands
          },
          // Unique sequence order for running multiple projects together
          sequence: {groupOrder: [4]}
        }
      }
    ]
  }
});
