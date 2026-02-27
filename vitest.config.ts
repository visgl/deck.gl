// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vitest/config';

// Root config for shared settings
// Project-specific settings are in vitest.workspace.ts
export default defineConfig({
  test: {
    // Use default reporter for clean output with --silent flag
  }
});
