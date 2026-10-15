// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readdirSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import {execFileSync} from 'node:child_process';

const examplesRoot = fileURLToPath(new URL('../examples/deck/', import.meta.url));
const requestedExamples = process.argv.slice(2);
const examples = readdirSync(examplesRoot, {withFileTypes: true})
  .filter(entry => entry.isDirectory() && existsSync(resolve(examplesRoot, entry.name, 'index.html')))
  .map(entry => entry.name);
for (const name of requestedExamples) {
  if (!examples.includes(name)) throw new Error(`Unknown private example: ${name}`);
}
execFileSync('yarn', ['tsc', '-p', resolve(examplesRoot, 'tsconfig.json')], {stdio: 'inherit'});
for (const name of requestedExamples.length ? requestedExamples : examples) {
  console.log(`Building private example: ${name}`);
  await build({root: resolve(examplesRoot, name), logLevel: 'warn'});
}
