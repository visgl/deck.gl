// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(rootDirectory, '../..');

export default defineConfig({
  root: rootDirectory,
  build: {
    rollupOptions: {
      input: resolve(rootDirectory, 'antialiasing.html')
    }
  },
  resolve: {
    alias: {
      // Keep this in sync with the source aliases in vitest.config.ts.
      '@deck.gl/test-utils/vitest': resolve(repositoryRoot, 'modules/test-utils/src/vitest.ts'),
      '@deck.gl/aggregation-layers': resolve(repositoryRoot, 'modules/aggregation-layers/src'),
      '@deck.gl/arcgis': resolve(repositoryRoot, 'modules/arcgis/src'),
      '@deck.gl/carto': resolve(repositoryRoot, 'modules/carto/src'),
      '@deck.gl/core': resolve(repositoryRoot, 'modules/core/src'),
      '@deck.gl/extensions': resolve(repositoryRoot, 'modules/extensions/src'),
      '@deck.gl/geo-layers': resolve(repositoryRoot, 'modules/geo-layers/src'),
      '@deck.gl/google-maps': resolve(repositoryRoot, 'modules/google-maps/src'),
      '@deck.gl/json': resolve(repositoryRoot, 'modules/json/src'),
      '@deck.gl/jupyter-widget': resolve(repositoryRoot, 'modules/jupyter-widget/src'),
      '@deck.gl/layers': resolve(repositoryRoot, 'modules/layers/src'),
      '@deck.gl/mapbox': resolve(repositoryRoot, 'modules/mapbox/src'),
      '@deck.gl/maplibre': resolve(repositoryRoot, 'modules/maplibre/src'),
      '@deck.gl/mesh-layers': resolve(repositoryRoot, 'modules/mesh-layers/src'),
      '@deck.gl/react': resolve(repositoryRoot, 'modules/react/src'),
      // Match the browser projects in vitest.config.ts and avoid the legacy probe.gl entry point.
      '@deck.gl/test-utils': resolve(repositoryRoot, 'modules/test-utils/src/vitest.ts'),
      '@deck.gl/widgets': resolve(repositoryRoot, 'modules/widgets/src'),
      'deck.gl': resolve(repositoryRoot, 'modules/main/src'),
      'deck.gl-test': resolve(repositoryRoot, 'test')
    }
  }
});
