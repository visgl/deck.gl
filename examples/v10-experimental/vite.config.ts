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
      '@deck.gl/proposals/effects/query': resolve(root, 'modules/proposals/src/effects/query'),
      '@deck.gl/proposals/layers': resolve(root, 'modules/proposals/src/layers'),
      '@deck.gl/proposals/effects': resolve(root, 'modules/proposals/src/effects'),
      '@deck.gl/core': resolve(root, 'modules/core/src'),
      '@deck.gl/layers': resolve(root, 'modules/layers/src'),
      '@deck.gl/extensions': resolve(root, 'modules/extensions/src')
    },
    dedupe: [
      '@luma.gl/core',
      '@luma.gl/engine',
      '@luma.gl/gpgpu',
      '@luma.gl/shaders',
      'apache-arrow',
      'preact'
    ]
  },
  optimizeDeps: {exclude: ['@deck.gl/core'], noDiscovery: true}
});
