// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig, defineWorkspace} from 'vitest/config';
import {dirname, resolve} from 'path';
import {fileURLToPath} from 'url';

const packageRoot = dirname(fileURLToPath(import.meta.url));

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

export default defineConfig({
  resolve: {alias: aliases},
  test: {
    // Default test configuration (used when no project specified)
    include: ['test/modules/**/*.spec.ts', 'test/modules/*-spec.ts'],
    exclude: ['test/modules/**/*.browser.spec.ts'],
    globals: false,
    testTimeout: 30000,
    setupFiles: ['./test/setup/vitest-node-setup.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
      include: ['modules/*/src/**/*.ts'],
      exclude: ['modules/test-utils/**', '**/node_modules/**']
    }
  }
});
