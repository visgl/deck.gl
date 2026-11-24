// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readFile, readdir, rm, writeFile} from 'node:fs/promises';
import {join} from 'node:path';

/**
 * Selects which variant the next TypeScript build emits.
 *
 * Usage: `node scripts/set-webgpu-build.mjs <true|false>`.
 * The root build calls this before each TypeScript pass: first `false` for the
 * `visgl:webgl-only` conditional output, then `true` for the default output.
 */

// Validate the requested transform state before modifying the checked-in
// configuration.
const webGPUEnabled = process.argv[2];
if (webGPUEnabled !== 'true' && webGPUEnabled !== 'false') {
  throw new Error('Usage: node scripts/set-webgpu-build.mjs <true|false>');
}

// Update only the transform option, preserving comments and formatting in the
// rest of tsconfig.json.
const configPath = join(import.meta.dirname, '..', 'tsconfig.json');
const config = await readFile(configPath, 'utf8');
const updatedConfig = config.replace(
  /("webGPUEnabled": )(true|false)/,
  `$1${webGPUEnabled}`
);

if (updatedConfig === config && !config.includes(`"webGPUEnabled": ${webGPUEnabled}`)) {
  throw new Error('Could not find webGPUEnabled in tsconfig.json');
}

await writeFile(configPath, updatedConfig);

// Select the runtime adapter alongside the shader transform so even CommonJS
// consumers of the WebGL-only package avoid loading the WebGPU implementation.
const adapterPath = join(import.meta.dirname, '../modules/core/src/lib/bundled-webgpu-adapter.ts');
const adapterSource = await readFile(adapterPath, 'utf8');
const adapterExport = webGPUEnabled === 'true'
  ? "export {webgpuAdapter as bundledWebGPUAdapter} from '@luma.gl/core/webgpu';"
  : 'export const bundledWebGPUAdapter = null;';
await writeFile(adapterPath, adapterSource.replace(/^export .*;$/m, adapterExport));

// TypeScript's incremental cache does not account for custom-transform options.
// Delete every package's build info so changing `webGPUEnabled` always causes
// JavaScript to be emitted again with the newly selected transform behavior.
const modulesRoot = join(import.meta.dirname, '..', 'modules');
const modules = await readdir(modulesRoot, {withFileTypes: true});
await Promise.all(
  modules
    .filter(entry => entry.isDirectory())
    .map(entry =>
      rm(join(modulesRoot, entry.name, 'tsconfig.tsbuildinfo'), {
        force: true
      })
    )
);
