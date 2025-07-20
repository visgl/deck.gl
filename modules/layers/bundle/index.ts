// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

export * from '../../core/bundle/peer-dependency';

// Import from package name instead of relative path
// This will be resolved to src or dist by esbuild depending on bundle settings
// dist has TS transformers applied
/* eslint-disable import/no-extraneous-dependencies */
export * from '@deck.gl/layers';
