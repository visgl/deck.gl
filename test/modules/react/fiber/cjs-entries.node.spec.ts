// deck.gl
// SPDX-License-Identifier: MIT
// Copyright (c) vis.gl contributors

import {existsSync, readFileSync} from 'node:fs';
import {relative, resolve} from 'node:path';
import {build, type Metafile} from 'esbuild';
import {expect, test} from 'vitest';

const PACKAGE_ROOT = resolve(import.meta.dirname, '../../../../modules/react');
const SRC = resolve(PACKAGE_ROOT, 'src');

/**
 * Source modules that more than one CommonJS entry may inline. They hold no state and their
 * identity doesn't matter, so a copy per entry is harmless. Any other module must belong to
 * exactly one entry; entries that need it import that entry by package name.
 */
const STATELESS_SHARED_MODULES = [
  'dom/attach-control.ts',
  'shared/constants.ts',
  'shared/utils.ts',
  'wrappers/factories.tsx'
];

type Entry = {name: string; source: string};

/** Each `exports` entry with a `require` bundle, mapped from its `dist` file to its source. */
function getCJSEntries(): Entry[] {
  const {exports} = JSON.parse(readFileSync(resolve(PACKAGE_ROOT, 'package.json'), 'utf8'));
  const entries: Entry[] = [];
  for (const [name, entry] of Object.entries<Record<string, string> | string>(exports)) {
    if (typeof entry !== 'object' || !entry.require?.endsWith('.cjs')) continue;
    const base = resolve(
      PACKAGE_ROOT,
      entry.import.replace('./dist/', 'src/').replace(/\.js$/, '')
    );
    const source = [`${base}.ts`, `${base}.tsx`].find(file => existsSync(file));
    if (!source) throw new Error(`No source for ${name}`);
    entries.push({name, source});
  }
  return entries;
}

/** Bundles an entry the way ocular's `build-cjs` bundles a `require` entry. */
async function bundleCJS(source: string): Promise<Metafile> {
  const result = await build({
    entryPoints: [source],
    bundle: true,
    format: 'cjs',
    target: 'node16',
    packages: 'external',
    tsconfigRaw: {compilerOptions: {paths: {}, jsx: 'react-jsx'}},
    write: false,
    metafile: true,
    logLevel: 'silent'
  });
  return result.metafile;
}

test('CommonJS entries share stateful modules instead of inlining copies', async () => {
  const entries = getCJSEntries();
  expect(entries.map(entry => entry.name)).toContain('./reconciler');

  const owners = new Map<string, string[]>();
  const requires = new Map<string, string[]>();
  for (const {name, source} of entries) {
    const metafile = await bundleCJS(source);
    for (const input of Object.keys(metafile.inputs)) {
      const module = relative(SRC, resolve(input));
      owners.set(module, [...(owners.get(module) ?? []), name]);
    }
    const packageImports = Object.values(metafile.outputs)
      .flatMap(output => output.imports)
      .filter(entryImport => entryImport.external && entryImport.path.startsWith('@deck.gl/react'))
      .map(entryImport => entryImport.path);
    requires.set(name, [...new Set(packageImports)]);
  }

  const duplicated = [...owners]
    .filter(([module, names]) => names.length > 1 && !STATELESS_SHARED_MODULES.includes(module))
    .map(([module, names]) => `${module}: ${names.join(', ')}`);
  expect(duplicated, 'modules inlined by more than one entry').toEqual([]);

  // The renderer, its roots registry and error boundary class live only in `/reconciler`.
  expect(owners.get('reconciler/renderer.ts')).toEqual(['./reconciler']);
  expect(owners.get('reconciler/error-boundary.tsx')).toEqual(['./reconciler']);
  expect(requires.get('.')).toContain('@deck.gl/react/reconciler');
  // The map roots reuse the main entry's root component.
  for (const name of ['./mapbox', './maplibre', './google-maps']) {
    expect(requires.get(name), name).toEqual(['@deck.gl/react']);
  }
});
