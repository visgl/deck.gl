// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {execFileSync, spawnSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {basename, dirname, join} from 'node:path';

// Retain ocular's dependency ordering and automatic package discovery. The private
// prototypes require unpublished luma.gl peers; build them with yarn build-private.
const require = createRequire(import.meta.url);
const buildOrderScript = join(
  dirname(require.resolve('@vis.gl/dev-tools')),
  'helpers/build-order.js'
);
const privateModules = new Set(['deck-gpu-layers', 'deck-arrow-layers']);
const modules = execFileSync(process.execPath, [buildOrderScript], {encoding: 'utf8'})
  .trim()
  .split(/\s+/)
  .map(modulePath => basename(modulePath))
  .filter(moduleName => !privateModules.has(moduleName));
const result = spawnSync('yarn', ['ocular-build', modules.join(',')], {stdio: 'inherit'});
if (result.error) {
  throw result.error;
}
process.exit(result.status ?? 1);
