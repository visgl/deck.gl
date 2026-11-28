// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {readdirSync, existsSync} from 'node:fs';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'vite';
import {execFileSync} from 'node:child_process';

const examplesRoot = fileURLToPath(new URL('../examples-v10/proposals/', import.meta.url));
const requestedExamples = process.argv.slice(2);
const proposals = readdirSync(examplesRoot, {withFileTypes: true})
  .filter(entry => entry.isDirectory() && existsSync(resolve(examplesRoot, entry.name, 'index.html')))
  .map(entry => entry.name);
const examples = new Map(proposals.map(name => [name, resolve(examplesRoot, name)]));
for (const name of ['graph-explorer', 'culled-trace']) {
  examples.set(`gpu-${name}`, resolve(examplesRoot, '../gpu-graph', name));
}
for (const name of requestedExamples) {
  if (!examples.has(name)) throw new Error(`Unknown private example: ${name}`);
}
const selected = requestedExamples.length ? requestedExamples : [...examples.keys()];
const configs = new Set(selected.map(name =>
  resolve(proposals.includes(name) ? examplesRoot : examples.get(name), 'tsconfig.json')
));
for (const config of configs) {
  execFileSync('yarn', ['tsc', '-p', config], {stdio: 'inherit'});
}
for (const name of selected) {
  console.log(`Building private example: ${name}`);
  await build({root: examples.get(name), logLevel: 'warn'});
}
