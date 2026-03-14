// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vitest/config';
import {resolve} from 'path';

const rootDir = import.meta.dirname;

export default defineConfig({
  resolve: {
    alias: {
      '@deck.gl/test-utils/vitest': resolve(rootDir, 'modules/test-utils/src/vitest.ts'),
      '@deck.gl/test-utils': resolve(rootDir, 'modules/test-utils/src/index.ts'),
      '@deck.gl/core': resolve(rootDir, 'modules/core/src/index.ts'),
      '@deck.gl/layers': resolve(rootDir, 'modules/layers/src/index.ts')
    }
  },
  test: {
    include: ['test/smoke/vitest-entry.spec.ts']
  }
});
