// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readdirSync, readFileSync} from 'node:fs';
import {relative, resolve} from 'node:path';
import {build, type Metafile} from 'esbuild';
import {expect, test} from 'vitest';
import {getCJSBuildOptions, getCJSEntries} from '../../../../modules/react/build-cjs.mjs';

/** Directory of `@deck.gl/react`. */
const PACKAGE_ROOT = resolve(import.meta.dirname, '../../../../modules/react');
/** The package's source directory. */
const SRC = resolve(PACKAGE_ROOT, 'src');

/**
 * Source modules that more than one CommonJS entry may inline. They hold no state and their
 * identity doesn't matter, so a copy per entry is harmless. Any other module must belong to
 * exactly one entry; entries that need it import that entry's file.
 */
const STATELESS_SHARED_MODULES = [
  'dom/attach-control.ts',
  'shared/constants.ts',
  'shared/generated-effect-id.ts',
  'shared/utils.ts',
  'wrappers/factories.tsx'
];

/** A CommonJS entry: the file to bundle and the bundle it publishes. */
type Entry = {input: string; output: string};

/** The package's CommonJS entries, bundled from source instead of `dist`. */
function getSourceEntries(): Entry[] {
  return getCJSEntries((importFile: string) => {
    const base = importFile.replace(`${PACKAGE_ROOT}/dist/`, `${SRC}/`).replace(/\.js$/, '');
    const source = [`${base}.ts`, `${base}.tsx`].find(existsSync);
    if (!source) throw new Error(`No source for ${importFile}`);
    return source;
  });
}

/** Bundles an entry with the options `build-cjs.mjs` uses for the published bundle. */
async function bundleCJS(entry: Entry, entries: Entry[]): Promise<Metafile> {
  const options = getCJSBuildOptions(entry, entries);
  const result = await build({
    ...options,
    tsconfigRaw: {compilerOptions: {paths: {}, jsx: 'react-jsx'}},
    sourcemap: false,
    write: false,
    metafile: true,
    logLevel: 'silent'
  });
  return result.metafile;
}

/** Lists the TypeScript files under a directory, recursively. */
function listSourceFiles(dir: string): string[] {
  return readdirSync(dir, {withFileTypes: true}).flatMap(item =>
    item.isDirectory()
      ? listSourceFiles(resolve(dir, item.name))
      : /\.tsx?$/.test(item.name)
        ? [resolve(dir, item.name)]
        : []
  );
}

test('source imports its own entries by relative path, so it resolves without `exports`', () => {
  const selfImports = listSourceFiles(SRC).filter(file =>
    /^\s*(import|export)\b[^;]*from '@deck\.gl\/react[/']/m.test(readFileSync(file, 'utf8'))
  );
  expect(selfImports.map(file => relative(SRC, file))).toEqual([]);
});

test('CommonJS entries share stateful modules instead of inlining copies', async () => {
  const entries = getSourceEntries();
  const nameOf = (entry: Entry) => relative(PACKAGE_ROOT, entry.output);
  expect(entries.map(nameOf)).toContain('dist/reconciler/index.cjs');

  const owners = new Map<string, string[]>();
  const requires = new Map<string, string[]>();
  for (const entry of entries) {
    const name = nameOf(entry);
    const metafile = await bundleCJS(entry, entries);
    for (const input of Object.keys(metafile.inputs)) {
      const module = relative(SRC, resolve(input));
      owners.set(module, [...(owners.get(module) ?? []), name]);
    }
    const entryRequires = Object.values(metafile.outputs)
      .flatMap(output => output.imports)
      .filter(entryImport => entryImport.external && entryImport.path.startsWith('.'))
      .map(entryImport => entryImport.path);
    requires.set(name, [...new Set(entryRequires)]);
  }

  const duplicated = [...owners]
    .filter(([module, names]) => names.length > 1 && !STATELESS_SHARED_MODULES.includes(module))
    .map(([module, names]) => `${module}: ${names.join(', ')}`);
  expect(duplicated, 'modules inlined by more than one entry').toEqual([]);

  // The renderer, its roots registry and error boundary class live only in `/reconciler`.
  expect(owners.get('reconciler/renderer.ts')).toEqual(['dist/reconciler/index.cjs']);
  expect(owners.get('reconciler/error-boundary.tsx')).toEqual(['dist/reconciler/index.cjs']);
  expect(requires.get('dist/index.cjs')).toEqual(['./reconciler/index.cjs']);
  // The map roots reuse the main entry's root component.
  for (const name of ['dom/mapbox', 'dom/maplibre', 'dom/google-maps']) {
    expect(requires.get(`dist/${name}.cjs`), name).toEqual(['../index.cjs']);
  }
});
