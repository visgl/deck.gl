// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {defineConfig} from 'vite';

const root = fileURLToPath(new URL('../../', import.meta.url));

export default defineConfig({
  base: './',
  resolve: {
    alias: {
      '@deck.gl-community/gpu-layers/query': resolve(root, 'modules/deck-gpu-layers/src/query'),
      '@deck.gl-community/gpu-layers': resolve(root, 'modules/deck-gpu-layers/src'),
      '@deck.gl-community/arrow-layers': resolve(root, 'modules/deck-arrow-layers/src'),
      '@deck.gl/core': resolve(root, 'modules/core/src'),
      '@deck.gl/layers': resolve(root, 'modules/layers/src'),
      '@deck.gl/extensions': resolve(root, 'modules/extensions/src')
    },
    dedupe: [
      '@luma.gl/core',
      '@luma.gl/engine',
      '@luma.gl/gpgpu',
      '@luma.gl/shadertools',
      'apache-arrow',
      'preact'
    ]
  },
  optimizeDeps: {exclude: ['@deck.gl/core'], noDiscovery: true}
});
