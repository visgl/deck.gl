// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vitest/config';
import {resolve} from 'path';
import {playwright} from '@vitest/browser-playwright';
import {browserCommands} from './test/setup/browser-commands';

const rootDir = import.meta.dirname;

// Playwright provider with viewport configured for render tests
const renderPlaywright = playwright({
  contextOptions: {
    viewport: {width: 1024, height: 768}
  }
});

// Common alias configuration for all test projects
const aliases = {
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
const browserAliases = {
  ...aliases,
  '@deck.gl/test-utils': resolve(rootDir, 'modules/test-utils/src/vitest.ts')
};

// Tests that are excluded until migration is complete
// These reference test files that don't exist yet or need fixes
const excludedTests: string[] = [
  // Add excluded tests here as needed during migration
];

// Pre-bundle dependencies to avoid Vite reloading during tests
const optimizeDepsConfig = {
  include: [
    'preact/jsx-dev-runtime',
    'preact/jsx-runtime',
    '@luma.gl/core',
    '@luma.gl/engine',
    '@luma.gl/webgl',
    '@luma.gl/shadertools',
    '@luma.gl/effects',
    '@loaders.gl/polyfills',
    '@loaders.gl/core',
    '@loaders.gl/images'
  ]
};

// Server configuration for serving test data files
const serverConfig = {
  fs: {
    allow: [rootDir]
  }
};

// Include binary file extensions as static assets
const assetsIncludeConfig = [
  '**/*.mvt',
  '**/*.pbf',
  '**/*.glb',
  '**/*.gltf',
  '**/*.bin',
  '**/*.terrain'
];

// Shared coverage configuration
const coverageConfig = {
  provider: 'v8' as const,
  reporter: ['text', 'lcov'],
  include: ['modules/*/src/**/*.ts'],
  exclude: ['modules/test-utils/**', '**/node_modules/**']
};

export default defineConfig({
  test: {
    globals: false,
    projects: [
      // Node project - smoke tests (*.node.spec.ts only)
      {
        extends: true,
        resolve: {alias: aliases},
        test: {
          name: 'node',
          environment: 'node',
          include: ['test/modules/**/*.node.spec.ts', 'test/smoke/**/*.spec.ts'],
          globals: false,
          testTimeout: 30000,
          setupFiles: ['./test/setup/vitest-node-setup.ts'],
          sequence: {groupOrder: [1]}
        }
      },

      // Scripts project - codemod and build tool tests
      {
        extends: true,
        test: {
          name: 'scripts',
          environment: 'node',
          include: ['scripts/**/*.spec.ts'],
          globals: false,
          testTimeout: 30000,
          sequence: {groupOrder: [0]}
        }
      },

      // Headless project - unit tests in headless browser
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
          sequence: {groupOrder: [2]}
        }
      },

      // Browser project - full test suite in headed browser for local development
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
          sequence: {groupOrder: [3]}
        }
      },

      // Render project - visual regression and interaction tests
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
          testTimeout: 300000,
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
          sequence: {groupOrder: [4]}
        }
      }
    ]
  }
});
