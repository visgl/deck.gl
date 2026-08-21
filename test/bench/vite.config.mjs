// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {dirname, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {getOcularConfig} from '@vis.gl/dev-tools';
import {defineConfig} from 'vite';

const rootDirectory = dirname(fileURLToPath(import.meta.url));
const repositoryRoot = resolve(rootDirectory, '../..');

export default defineConfig(async () => {
  const {aliases} = await getOcularConfig({root: repositoryRoot, aliasMode: 'src'});

  return {
    root: rootDirectory,
    build: {
      rollupOptions: {
        input: resolve(rootDirectory, 'antialiasing.html')
      }
    },
    resolve: {
      alias: {
        ...aliases,
        // Match Vitest's browser projects and avoid the legacy probe.gl entry point.
        '@deck.gl/test-utils': resolve(repositoryRoot, 'modules/test-utils/src/vitest.ts')
      }
    }
  };
});
