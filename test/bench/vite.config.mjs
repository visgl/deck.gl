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
      '@deck.gl/core': resolve(repositoryRoot, 'modules/core/src'),
      '@deck.gl/layers': resolve(repositoryRoot, 'modules/layers/src')
    }
  }
});
