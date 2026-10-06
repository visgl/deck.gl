// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {resolve} from 'node:path';
import viteConfig from './vite.config.mjs';

export default async function (environment) {
  const config = await viteConfig(environment);
  return {
    ...config,
    root: resolve(import.meta.dirname, '../../..'),
    test: {
      environment: 'node',
      include: ['examples/experimental/gaussian-splats/test/*.node.spec.ts'],
      maxWorkers: 1
    }
  };
}
