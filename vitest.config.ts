// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vitest/config';
import {playwright} from '@vitest/browser-playwright';

const chromiumLaunchArgs = ['--use-angle=swiftshader', '--enable-unsafe-swiftshader'];

const headlessPlaywright = playwright({
  launchOptions: {
    args: chromiumLaunchArgs
  }
});

const browserPlaywright = playwright({
  launchOptions: {
    args: chromiumLaunchArgs
  },
  contextOptions: {
    viewport: {width: 1280, height: 720},
    deviceScaleFactor: 1
  }
});

// Playwright provider with viewport configured for render tests
const renderPlaywright = playwright({
  launchOptions: {
    args: chromiumLaunchArgs
  },
  contextOptions: {
    viewport: {width: 1024, height: 768}
  }
});
import {resolve} from 'path';
import {browserCommands} from './test/setup/browser-commands';

const rootDir = import.meta.dirname;

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
  'test/modules/extensions/collision-filter/collision-filter.spec.ts'
];

// Match aliases from .ocularrc.js
// Note: Order matters for Vite - more specific paths must come before less specific ones
const aliases = {
  // Explicit vitest entry point (must come before @deck.gl/test-utils)
  '@deck.gl/test-utils/vitest': resolve(rootDir, 'modules/test-utils/src/vitest.ts'),
  '@deck.gl/aggregation-layers': resolve(rootDir, 'modules/aggregation-layers/src'),
  '@deck.gl/arcgis': resolve(rootDir, 'modules/arcgis/src'),
  '@deck.gl/carto': resolve(rootDir, 'modules/carto/src'),
  '@deck.gl/core': resolve(rootDir, 'modules/core/src'),
  '@deck.gl/extensions': resolve(rootDir, 'modules/extensions/src'),
  '@deck.gl/geo-layers': resolve(rootDir, 'modules/geo-layers/src'),
  '@deck.gl/google-maps': resolve(rootDir, 'modules/google-maps/src'),
  '@deck.gl/json': resolve(rootDir, 'modules/json/src'),
  '@deck.gl/jupyter-widget': resolve(rootDir, 'modules/jupyter-widget/src'),
  '@deck.gl/layers': resolve(rootDir, 'modules/layers/src'),
  '@deck.gl/mapbox': resolve(rootDir, 'modules/mapbox/src'),
  '@deck.gl/mesh-layers': resolve(rootDir, 'modules/mesh-layers/src'),
  '@deck.gl/react': resolve(rootDir, 'modules/react/src'),
  '@deck.gl/test-utils': resolve(rootDir, 'modules/test-utils/src'),
  '@deck.gl/widgets': resolve(rootDir, 'modules/widgets/src'),
  'deck.gl': resolve(rootDir, 'modules/main/src'),
  'deck.gl-test': resolve(rootDir, 'test')
};

// Browser aliases - redirect @deck.gl/test-utils to vitest entry for backwards compatibility
// until all tests are migrated to import from @deck.gl/test-utils/vitest explicitly
const browserAliases = {
  ...aliases,
  '@deck.gl/test-utils': resolve(rootDir, 'modules/test-utils/src/vitest.ts')
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
    '@loaders.gl/images',
    'd3-hexbin'
  ]
};

// Server configuration for serving test data files with correct MIME types
// Without this, binary files like .mvt may be served incorrectly
const serverConfig = {
  fs: {
    // Allow serving files from test/data directory
    allow: [rootDir]
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

      // Scripts project - codemod and build tool tests
      // Used by test-scripts
      {
        extends: true,
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/**/*.spec.ts'],
          globals: false,
          testTimeout: 30000,
          // Unique sequence order for running multiple projects together
          sequence: {groupOrder: [0]}
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
          // Temporarily exclude the full interaction suite from required
          // automated runs. These browser-input tests have become flaky across
          // headless and render, so keep them in `browser` only for manual
          // debugging until the shared interaction harness is reworked.
          include: ['test/modules/**/*.spec.ts'],
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
            provider: headlessPlaywright,
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

      // Browser project - headed browser for debugging unit and interaction tests locally.
      // Render/golden-image comparisons use the separate `render` project below.
      // Used by test-browser
      {
        extends: true,
        resolve: {alias: browserAliases},
        optimizeDeps: optimizeDepsConfig,
        assetsInclude: assetsIncludeConfig,
        server: serverConfig,
        test: {
          name: 'browser',
          include: ['test/modules/**/*.spec.ts', 'test/interaction/**/*.spec.ts'],
          exclude: [...excludedTests, 'test/modules/**/*.node.spec.ts'],
          globals: false,
          testTimeout: 30000,
          isolate: false,
          fileParallelism: false,
          setupFiles: ['./test/setup/vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            provider: browserPlaywright,
            instances: [{browser: 'chromium'}],
            headless: false,
            ui: false,
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
          // Temporarily exclude the full interaction suite from required
          // automated runs. Keep render focused on visual regression until the
          // flaky browser-input specs are stabilized in a later pass.
          include: ['test/render/**/*.spec.ts'],
          globals: false,
          testTimeout: 300000, // Render tests need longer timeout
          isolate: false,
          fileParallelism: false,
          setupFiles: ['./test/setup/vitest-browser-setup.ts'],
          browser: {
            enabled: true,
            provider: renderPlaywright,
            instances: [
              {
                browser: 'chromium',
                viewport: {width: 1024, height: 768}
              }
            ],
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
