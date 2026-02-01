// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {defineConfig} from 'vitest/config';

// Root config for shared settings like reporters
// Project-specific settings are in vitest.workspace.ts
export default defineConfig({
  test: {
    reporters: ['basic']
  }
});
