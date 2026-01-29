// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineWorkspace} from 'vitest/config';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';

const packageRoot = dirname(fileURLToPath(import.meta.url));

// Tests that were commented out or never imported in the original test suite
// These need to be fixed before being included
const excludedTests = [
  'test/modules/**/*.browser.spec.ts',
  'test/modules/layers/path-tesselator.spec.ts',
  'test/modules/layers/polygon-tesselation.spec.ts',
  'test/modules/widgets/geocoders.spec.ts'
];

// Match aliases from .ocularrc.js
const aliases = {
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

export default defineWorkspace([
  // Node project - fast feedback, pure unit tests
  {
    resolve: {alias: aliases},
    test: {
      name: 'node',
      environment: 'node',
      include: ['test/modules/**/*.spec.ts', 'test/modules/*-spec.ts'],
      exclude: excludedTests,
      globals: false,
      testTimeout: 30000,
      setupFiles: ['./test/setup/vitest-node-setup.ts']
    }
  },
  // Browser project - comprehensive, ALL tests in real browser
  {
    resolve: {alias: aliases},
    test: {
      name: 'browser',
      include: ['test/modules/**/*.spec.ts', 'test/modules/*-spec.ts'],
      exclude: excludedTests,
      globals: false,
      testTimeout: 30000,
      setupFiles: ['./test/setup/vitest-browser-setup.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: false,
        screenshotFailures: false
      }
    }
  },
  // Headless project - CI, ALL tests in headless browser
  {
    resolve: {alias: aliases},
    test: {
      name: 'headless',
      include: ['test/modules/**/*.spec.ts', 'test/modules/*-spec.ts'],
      exclude: excludedTests,
      globals: false,
      testTimeout: 30000,
      setupFiles: ['./test/setup/vitest-browser-setup.ts'],
      browser: {
        enabled: true,
        name: 'chromium',
        provider: 'playwright',
        headless: true,
        screenshotFailures: false
      },
      coverage: {
        provider: 'v8',
        reporter: ['text', 'lcov'],
        include: ['modules/*/src/**/*.ts'],
        exclude: ['modules/test-utils/**', '**/node_modules/**']
      }
    }
  }
]);
