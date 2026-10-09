// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

// loaders.gl alpha.11 only exports this synchronous decoder to ESM consumers.
// Bundle it into CARTO's CommonJS output until loaders.gl provides a require export.
await build({
  entryPoints: ['src/index.ts'],
  outfile: 'dist/index.cjs',
  bundle: true,
  format: 'cjs',
  target: 'node16',
  packages: 'external',
  tsconfigRaw: {compilerOptions: {paths: {}}},
  sourcemap: true,
  sourcesContent: false,
  alias: {
    '@loaders.gl/compression/gzip-decompressor': fileURLToPath(
      import.meta.resolve('@loaders.gl/compression/gzip-decompressor')
    )
  }
});
