// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readdir, rename, rm} from 'node:fs/promises';
import {join} from 'node:path';

/**
 * Saves the first, WebGL-only build of each conditional-export package.
 *
 * The root build initially emits the packages below to `dist` with WebGPU
 * support removed. This script moves those packages to `dist.webgl-only`. A
 * subsequent build then emits the full WebGPU-capable default output to `dist`.
 */

const PACKAGE_ROOT = join(import.meta.dirname, '..');
const MODULES = ['core', 'layers', 'mesh-layers', 'aggregation-layers', 'geo-layers'];

// Both conditions expose the same public types. Remove declarations from the
// WebGL-only copy so packages publish only the canonical declarations in `dist`.
async function removeDeclarations(directory) {
  for (const entry of await readdir(directory, {withFileTypes: true})) {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) {
      await removeDeclarations(path);
    } else if (entry.name.endsWith('.d.ts') || entry.name.endsWith('.d.ts.map')) {
      await rm(path);
    }
  }
}

// Replace any previous WebGL-only output, move the newly built JavaScript into
// place, trim duplicate types, and invalidate the moved incremental-build state.
for (const moduleName of MODULES) {
  const moduleRoot = join(PACKAGE_ROOT, 'modules', moduleName);
  const webglOutput = join(moduleRoot, 'dist.webgl-only');

  await rm(webglOutput, {recursive: true, force: true});
  await rename(join(moduleRoot, 'dist'), webglOutput);
  await removeDeclarations(webglOutput);
  await rm(join(moduleRoot, 'tsconfig.tsbuildinfo'), {force: true});
}
