// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readFileSync} from 'node:fs';
import {dirname, relative, resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {build} from 'esbuild';

// ocular's build-cjs bundles every `require` entry on its own, so code that two entries import
// (such as the `/legacy` implementation the root re-exports) would be inlined into both bundles,
// each with its own React context. This rebuilds the CommonJS entries so that an import of another
// entry's file becomes a `require` of that entry's bundle, and each module is loaded once.

const PACKAGE_ROOT = dirname(fileURLToPath(import.meta.url));
const RESOLVE_EXTENSIONS = ['', '.js', '.ts', '.tsx', '/index.js', '/index.ts', '/index.tsx'];

/**
 * Lists the package's CommonJS entries: each `exports` entry with a `.cjs` `require` file.
 * @param {(importFile: string) => string} [getInput] Maps an entry's ESM file to the file to bundle.
 * @returns {{input: string, output: string}[]}
 */
export function getCJSEntries(getInput = importFile => importFile) {
  const {exports} = JSON.parse(readFileSync(resolve(PACKAGE_ROOT, 'package.json'), 'utf8'));
  return Object.values(exports)
    .filter(entry => typeof entry === 'object' && entry.require?.endsWith('.cjs'))
    .map(entry => ({
      input: getInput(resolve(PACKAGE_ROOT, entry.import)),
      output: resolve(PACKAGE_ROOT, entry.require)
    }));
}

function resolveFile(path) {
  for (const extension of RESOLVE_EXTENSIONS) {
    if (existsSync(path + extension) && !existsSync(`${path + extension}/`)) {
      return path + extension;
    }
  }
  return null;
}

/**
 * An esbuild plugin that keeps imports of other entries' files external, as relative `require`s
 * of their CommonJS bundles.
 * @param {{input: string, output: string}} entry The entry being bundled.
 * @param {{input: string, output: string}[]} entries All CommonJS entries.
 */
export function shareEntriesPlugin(entry, entries) {
  const outputs = new Map(entries.map(({input, output}) => [input, output]));
  return {
    name: 'share-cjs-entries',
    setup(pluginBuild) {
      pluginBuild.onResolve({filter: /^\.\.?\//}, args => {
        const file = resolveFile(resolve(args.resolveDir, args.path));
        const output = file && file !== entry.input ? outputs.get(file) : undefined;
        if (!output) {
          return undefined;
        }
        const path = relative(dirname(entry.output), output);
        return {path: path.startsWith('.') ? path : `./${path}`, external: true};
      });
    }
  };
}

/**
 * esbuild options for one CommonJS entry, matching ocular's build-cjs plus the shared entries.
 * @param {{input: string, output: string}} entry
 * @param {{input: string, output: string}[]} entries
 */
export function getCJSBuildOptions(entry, entries) {
  return {
    entryPoints: [entry.input],
    outfile: entry.output,
    bundle: true,
    format: 'cjs',
    target: 'node16',
    packages: 'external',
    tsconfigRaw: {compilerOptions: {paths: {}}},
    sourcemap: true,
    sourcesContent: false,
    plugins: [shareEntriesPlugin(entry, entries)]
  };
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  const entries = getCJSEntries();
  for (const entry of entries) {
    await build({...getCJSBuildOptions(entry, entries), logLevel: 'info'});
  }
}
